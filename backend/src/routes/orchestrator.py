from __future__ import annotations

from datetime import datetime
from enum import Enum
import asyncio
import json
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel, Field

from database.init_db import DatabaseService
from backend.src.agents.agent_factory import AgentFactory
from backend.src.utils.auth_middleware import get_current_user


router = APIRouter(prefix="/orchestrator", tags=["orchestrator"])


class NegotiationMode(str, Enum):
    simulation = "simulation"
    practice = "practice"


class NegotiationStatus(str, Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    failed = "failed"


class EndReason(str, Enum):
    deal_reached = "deal_reached"
    walk_away = "walk_away"
    timeout = "timeout"
    deadlock = "deadlock"
    cancelled = "cancelled"


class ParticipantInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    agent_type: str = Field(min_length=1, max_length=50)
    is_human: bool = False


class StartNegotiationRequest(BaseModel):
    scenario_id: int = Field(ge=0)
    mode: NegotiationMode = NegotiationMode.simulation
    participants: List[ParticipantInput] = Field(min_length=2)
    max_rounds: int = Field(default=12, ge=1, le=500)
    deadlock_threshold: int = Field(default=3, ge=1, le=20)
    turn_timeout_seconds: int = Field(default=30, ge=5, le=300)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class OfferPayload(BaseModel):
    amount: Optional[float] = None
    terms: Dict[str, Any] = Field(default_factory=dict)


class UserTurnRequest(BaseModel):
    action: str = Field(min_length=1, max_length=30)
    message: Optional[str] = Field(default=None, max_length=1000)
    offer: Optional[OfferPayload] = None


class NegotiationTurn(BaseModel):
    round_number: int
    turn_number: int
    speaker: str
    action: str
    message: str
    offer: Optional[Dict[str, Any]] = None
    timestamp: str


class SessionSnapshot(BaseModel):
    session_id: str
    negotiation_id: Optional[int]
    scenario_id: int
    mode: NegotiationMode
    status: NegotiationStatus
    end_reason: Optional[EndReason]
    created_at: str
    updated_at: str
    participants: List[Dict[str, Any]]
    current_turn_index: int
    current_round: int
    max_rounds: int
    deadlock_threshold: int
    deadlock_counter: int
    last_offer: Optional[Dict[str, Any]]
    agreed_offer: Optional[Dict[str, Any]]
    history: List[NegotiationTurn]
    requires_user_input: bool


NEGOTIATION_SESSIONS: Dict[str, Dict[str, Any]] = {}
SESSIONS_LOCK = asyncio.Lock()


@router.post("/start", response_model=SessionSnapshot)
async def start_negotiation(
    payload: StartNegotiationRequest,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SessionSnapshot:
    _validate_mode_participants(payload.mode, payload.participants)

    db = DatabaseService.from_environment()
    scenario = db.get_scenario(payload.scenario_id)
    if scenario is None:
        raise HTTPException(status_code=404, detail="Scenario not found")

    created = db.create_negotiation(
        payload.scenario_id,
        {
            "mode": payload.mode.value,
            "participants": [p.model_dump() for p in payload.participants],
            "created_by": current_user.get("id"),
        },
        status=NegotiationStatus.active.value,
    )

    session_id = str(uuid4())
    participants = [_participant_to_state(p) for p in payload.participants]
    current_timestamp = _utc_now()

    session = {
        "session_id": session_id,
        "negotiation_id": created.get("id"),
        "scenario_id": payload.scenario_id,
        "mode": payload.mode,
        "status": NegotiationStatus.active,
        "end_reason": None,
        "created_at": current_timestamp,
        "updated_at": current_timestamp,
        "participants": participants,
        "agents": _build_agent_map(participants, scenario),
        "current_turn_index": 0,
        "turn_number": 1,
        "current_round": 1,
        "max_rounds": payload.max_rounds,
        "deadlock_threshold": payload.deadlock_threshold,
        "deadlock_counter": 0,
        "turn_timeout_seconds": payload.turn_timeout_seconds,
        "last_offer": None,
        "agreed_offer": None,
        "history": [],
        "metadata": payload.metadata,
        "started_by": current_user.get("id"),
    }

    await _register_session(session)
    _log_event(db, session, "system", "start", {"mode": payload.mode.value})

    if payload.mode == NegotiationMode.simulation:
        background_tasks.add_task(_run_simulation_loop, session_id)

    return _snapshot(session)


@router.post("/{session_id}/step", response_model=SessionSnapshot)
async def step_negotiation(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SessionSnapshot:
    del current_user

    session = await _get_session(session_id)
    if session["status"] != NegotiationStatus.active:
        return _snapshot(session)

    await _execute_single_turn(session)
    return _snapshot(session)


@router.post("/{session_id}/user-turn", response_model=SessionSnapshot)
async def submit_user_turn(
    session_id: str,
    payload: UserTurnRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SessionSnapshot:
    session = await _get_session(session_id)
    if session["mode"] != NegotiationMode.practice:
        raise HTTPException(status_code=400, detail="User turns are only supported in practice mode")
    if session["status"] != NegotiationStatus.active:
        return _snapshot(session)

    current = session["participants"][session["current_turn_index"]]
    if not current["is_human"]:
        raise HTTPException(status_code=400, detail="It is not a user turn")

    action = payload.action.strip().lower()
    if action not in {"offer", "counter", "accept", "reject", "walk_away"}:
        raise HTTPException(status_code=422, detail="Invalid action")

    offer_data = payload.offer.model_dump() if payload.offer else None
    if offer_data and offer_data.get("amount") is None and not offer_data.get("terms"):
        offer_data = None

    turn = _build_turn(
        session,
        speaker=current["name"],
        action=action,
        message=payload.message or f"{current['name']} submitted an action.",
        offer=offer_data,
    )
    session["history"].append(turn)
    _log_event(
        DatabaseService.from_environment(),
        session,
        current.get("agent_type", "human"),
        action,
        {"speaker": current["name"], "offer": offer_data, "user_id": current_user.get("id")},
    )

    _apply_turn_effects(session, turn)
    _advance_turn(session)

    if session["status"] == NegotiationStatus.active:
        await _run_until_human_turn_or_end(session)

    _touch(session)
    return _snapshot(session)


@router.get("/{session_id}", response_model=SessionSnapshot)
async def get_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SessionSnapshot:
    del current_user
    session = await _get_session(session_id)
    return _snapshot(session)


@router.post("/{session_id}/stop", response_model=SessionSnapshot)
async def stop_session(
    session_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> SessionSnapshot:
    del current_user

    session = await _get_session(session_id)
    if session["status"] == NegotiationStatus.active:
        _end_session(session, EndReason.cancelled, summary_message="Negotiation cancelled by user")
        _persist_completion(DatabaseService.from_environment(), session)
        _touch(session)

    return _snapshot(session)


async def _run_simulation_loop(session_id: str) -> None:
    try:
        while True:
            session = await _get_session(session_id)
            if session["status"] != NegotiationStatus.active:
                return
            await _execute_single_turn(session)
            await asyncio.sleep(0)
    except HTTPException:
        return


async def _execute_single_turn(session: Dict[str, Any]) -> None:
    if session["status"] != NegotiationStatus.active:
        return

    participant = session["participants"][session["current_turn_index"]]
    if participant["is_human"]:
        _touch(session)
        return

    turn = await _generate_ai_turn(session, participant)
    session["history"].append(turn)
    _log_event(
        DatabaseService.from_environment(),
        session,
        participant.get("agent_type", "ai"),
        turn["action"],
        {"speaker": participant["name"], "offer": turn.get("offer"), "message": turn["message"]},
    )
    _apply_turn_effects(session, turn)
    _advance_turn(session)
    _touch(session)


async def _run_until_human_turn_or_end(session: Dict[str, Any]) -> None:
    safety_counter = 0
    while session["status"] == NegotiationStatus.active:
        participant = session["participants"][session["current_turn_index"]]
        if participant["is_human"]:
            return
        await _execute_single_turn(session)
        safety_counter += 1
        if safety_counter > session["max_rounds"] * len(session["participants"]):
            _end_session(session, EndReason.timeout, summary_message="Exceeded maximum turn budget")
            _persist_completion(DatabaseService.from_environment(), session)
            return


async def _generate_ai_turn(session: Dict[str, Any], participant: Dict[str, Any]) -> Dict[str, Any]:
    agent = session["agents"].get(participant["name"])
    context = {
        "mode": session["mode"].value,
        "scenario_id": session["scenario_id"],
        "round_number": session["current_round"],
        "turn_number": session["turn_number"],
        "history": list(session["history"]),
        "last_offer": session["last_offer"],
        "deadlock_counter": session["deadlock_counter"],
    }

    response: Dict[str, Any]
    if agent is None:
        response = {
            "action": "counter" if session["last_offer"] else "offer",
            "message": f"{participant['name']} provides a default response.",
            "offer": session["last_offer"] or {"amount": 90000.0, "terms": {"delivery_days": 30}},
        }
    else:
        response = _call_agent(agent, context)

    action = str(response.get("action", "counter")).strip().lower()
    message = str(response.get("message") or f"{participant['name']} responded.")
    offer = response.get("offer")

    if action in {"offer", "counter"} and offer is None:
        offer = session["last_offer"] or {"amount": 90000.0, "terms": {"delivery_days": 30}}

    return _build_turn(
        session,
        speaker=participant["name"],
        action=action,
        message=message,
        offer=offer,
    )


def _call_agent(agent: Any, context: Dict[str, Any]) -> Dict[str, Any]:
    for method_name in ("respond", "generate_response", "act", "next_action"):
        method = getattr(agent, method_name, None)
        if method is None:
            continue
        result = method(context)
        if asyncio.iscoroutine(result):
            raise RuntimeError("Async agent methods are not supported in this orchestrator build")
        if isinstance(result, dict):
            return result

    return {"action": "counter", "message": "No valid agent output", "offer": context.get("last_offer")}


def _participant_to_state(participant: ParticipantInput) -> Dict[str, Any]:
    return {
        "name": participant.name,
        "agent_type": participant.agent_type,
        "is_human": participant.is_human,
    }


def _build_agent_map(participants: List[Dict[str, Any]], scenario: Dict[str, Any]) -> Dict[str, Any]:
    agents: Dict[str, Any] = {}
    for participant in participants:
        if participant["is_human"]:
            continue
        try:
            agents[participant["name"]] = AgentFactory.create_agent(
                participant["agent_type"],
                name=participant["name"],
                scenario=scenario,
            )
        except TypeError:
            # Keep compatibility with unknown factory signatures while team code converges.
            agents[participant["name"]] = AgentFactory.create_agent(participant["agent_type"])
    return agents


def _build_turn(
    session: Dict[str, Any],
    *,
    speaker: str,
    action: str,
    message: str,
    offer: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    return {
        "round_number": session["current_round"],
        "turn_number": session["turn_number"],
        "speaker": speaker,
        "action": action,
        "message": message,
        "offer": offer,
        "timestamp": _utc_now(),
    }


def _apply_turn_effects(session: Dict[str, Any], turn: Dict[str, Any]) -> None:
    action = turn["action"]

    if action in {"offer", "counter"}:
        if _is_offer_repeated(session.get("last_offer"), turn.get("offer")):
            session["deadlock_counter"] += 1
        else:
            session["deadlock_counter"] = 0
        session["last_offer"] = turn.get("offer")

    elif action == "accept":
        if session.get("last_offer") is None and turn.get("offer") is None:
            # Accept without any prior offer means no progress.
            session["deadlock_counter"] += 1
        else:
            session["agreed_offer"] = turn.get("offer") or session.get("last_offer")
            _end_session(session, EndReason.deal_reached, summary_message="Deal accepted")

    elif action in {"reject", "walk_away"}:
        if action == "walk_away":
            _end_session(session, EndReason.walk_away, summary_message="A participant walked away")
        else:
            session["deadlock_counter"] += 1

    else:
        session["deadlock_counter"] += 1

    if session["status"] == NegotiationStatus.active and session["deadlock_counter"] >= session["deadlock_threshold"]:
        _end_session(session, EndReason.deadlock, summary_message="Deadlock detected")

    if session["status"] == NegotiationStatus.active and session["current_round"] > session["max_rounds"]:
        _end_session(session, EndReason.timeout, summary_message="Maximum rounds reached")

    if session["status"] != NegotiationStatus.active:
        _persist_completion(DatabaseService.from_environment(), session)


def _advance_turn(session: Dict[str, Any]) -> None:
    if session["status"] != NegotiationStatus.active:
        return

    participant_count = len(session["participants"])
    previous_index = session["current_turn_index"]
    session["current_turn_index"] = (session["current_turn_index"] + 1) % participant_count
    session["turn_number"] += 1

    if session["current_turn_index"] <= previous_index:
        session["current_round"] += 1

    if session["current_round"] > session["max_rounds"] and session["status"] == NegotiationStatus.active:
        _end_session(session, EndReason.timeout, summary_message="Maximum rounds reached")
        _persist_completion(DatabaseService.from_environment(), session)


def _end_session(session: Dict[str, Any], end_reason: EndReason, *, summary_message: str) -> None:
    session["status"] = NegotiationStatus.completed
    session["end_reason"] = end_reason
    session["summary"] = summary_message


def _persist_completion(db: DatabaseService, session: Dict[str, Any]) -> None:
    negotiation_id = session.get("negotiation_id")
    if negotiation_id is None:
        return

    db.update_negotiation_status(
        negotiation_id,
        NegotiationStatus.completed.value,
        {
            "end_reason": session["end_reason"].value if session.get("end_reason") else None,
            "agreed_offer": session.get("agreed_offer"),
            "last_offer": session.get("last_offer"),
            "history_length": len(session.get("history", [])),
            "summary": session.get("summary"),
        },
    )


def _log_event(
    db: DatabaseService,
    session: Dict[str, Any],
    agent_type: str,
    action: str,
    data: Optional[Dict[str, Any]] = None,
) -> None:
    negotiation_id = session.get("negotiation_id")
    if negotiation_id is None:
        return
    payload = data or {}
    payload["raw_json"] = json.dumps(payload, sort_keys=True, default=str)
    db.add_negotiation_log(
        negotiation_id=negotiation_id,
        round_number=session.get("current_round", 1),
        agent_type=agent_type,
        action=action,
        data=payload,
    )


async def _register_session(session: Dict[str, Any]) -> None:
    async with SESSIONS_LOCK:
        NEGOTIATION_SESSIONS[session["session_id"]] = session


async def _get_session(session_id: str) -> Dict[str, Any]:
    async with SESSIONS_LOCK:
        session = NEGOTIATION_SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Negotiation session not found")
    return session


def _snapshot(session: Dict[str, Any]) -> SessionSnapshot:
    participant = session["participants"][session["current_turn_index"]]
    requires_user = bool(session["status"] == NegotiationStatus.active and participant["is_human"])
    turns = [NegotiationTurn(**turn) for turn in session["history"]]

    return SessionSnapshot(
        session_id=session["session_id"],
        negotiation_id=session.get("negotiation_id"),
        scenario_id=session["scenario_id"],
        mode=session["mode"],
        status=session["status"],
        end_reason=session["end_reason"],
        created_at=session["created_at"],
        updated_at=session["updated_at"],
        participants=list(session["participants"]),
        current_turn_index=session["current_turn_index"],
        current_round=session["current_round"],
        max_rounds=session["max_rounds"],
        deadlock_threshold=session["deadlock_threshold"],
        deadlock_counter=session["deadlock_counter"],
        last_offer=session.get("last_offer"),
        agreed_offer=session.get("agreed_offer"),
        history=turns,
        requires_user_input=requires_user,
    )


def _touch(session: Dict[str, Any]) -> None:
    session["updated_at"] = _utc_now()


def _utc_now() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def _is_offer_repeated(last_offer: Optional[Dict[str, Any]], new_offer: Optional[Dict[str, Any]]) -> bool:
    if last_offer is None or new_offer is None:
        return False
    return json.dumps(last_offer, sort_keys=True, default=str) == json.dumps(new_offer, sort_keys=True, default=str)


def _validate_mode_participants(mode: NegotiationMode, participants: List[ParticipantInput]) -> None:
    if mode == NegotiationMode.practice:
        human_count = sum(1 for p in participants if p.is_human)
        if human_count != 1:
            raise HTTPException(status_code=422, detail="Practice mode requires exactly one human participant")
