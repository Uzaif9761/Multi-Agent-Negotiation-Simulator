from fastapi import APIRouter, Depends, HTTPException

from app.schemas.negotiation import (
    NegotiationRequest,
    NegotiationResponse,
    PracticeTurnRequest,
    PracticeTurnResponse,
    SavePracticeRequest
)

from app.orchestrator.orchestrator import run_negotiation
from app.auth.dependencies import get_current_user
from app.services.negotiation_service import (
    get_all_negotiations,
    get_negotiation_by_id,
    save_negotiation
)
import asyncio
from app.negotiation_engine.models import NegotiationContext

from app.negotiation_engine.engine import NegotiationEngine, get_strategy_prompt
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from backend.src.agents.factory import AgentFactory

router = APIRouter(
    prefix="/negotiations",
    tags=["Negotiations"]
)

# ---------------------------------------
# Start Negotiation
# ---------------------------------------

@router.post(
    "/start",
    response_model=NegotiationResponse
)
async def start_new_negotiation(
    negotiation: NegotiationRequest
):
    try:
        result = await run_negotiation(
            negotiation.model_dump()
        )
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get(
                    "message",
                    "Negotiation failed"
                )
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# ---------------------------------------
# Practice Turn
# ---------------------------------------

@router.post("/practice-turn", response_model=PracticeTurnResponse)
async def practice_turn(req: PracticeTurnRequest):
    try:
        # Create AI parameters
        seller_params = {
            "Goal Price (Best Case)": req.target_offer,
            "Absolute Minimum Limit (Walk-Away)": req.ai_limit,
            "Strategy": get_strategy_prompt(req.ai_strategy, req.target_offer, req.ai_limit, False)
        }
        
        # Instantiate the AI (Agent 2)
        ai_agent = AgentFactory.create_agent(req.seller_agent_id, "Seller", max_rounds=req.max_rounds, extra_params=seller_params)
        
        # Load memory
        ai_agent.load_history(req.history_data)
        
        # Take turn
        ai_action = await asyncio.to_thread(ai_agent.take_turn, req.human_message)
        
        return PracticeTurnResponse(
            ai_message=ai_action.message if hasattr(ai_action, 'message') else "",
            action_type=ai_action.action_type.value if hasattr(ai_action.action_type, 'value') else "OFFER",
            value=ai_action.value
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/save-practice")
async def save_practice(req: SavePracticeRequest):
    try:
        data = req.model_dump()
        final_result = {
            "status": req.status,
            "final_offer": req.final_offer,
            "message": req.message
        }
        engine_result = {
            "history": req.history
        }
        # Inject standard keys expected by save_negotiation
        data["buyer_strategy"] = req.strategies.get("buyer", "Balanced")
        data["seller_strategy"] = req.strategies.get("seller", "Balanced")
        
        saved_result = await save_negotiation(data, final_result, engine_result)
        return saved_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------
# Get All Negotiations
# ---------------------------------------

@router.get("/")
async def get_negotiations():

    try:

        negotiations = await get_all_negotiations()

        return {
            "success": True,
            "data": negotiations
        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



# ---------------------------------------
# Get Single Negotiation
# ---------------------------------------

@router.get("/{negotiation_id}")
async def get_single_negotiation(
    negotiation_id: str
):

    try:

        negotiation = await get_negotiation_by_id(
            negotiation_id
        )


        if not negotiation:

            raise HTTPException(
                status_code=404,
                detail="Negotiation not found"
            )


        return {
            "success": True,
            "data": negotiation
        }


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )