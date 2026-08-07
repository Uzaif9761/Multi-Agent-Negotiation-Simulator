"""Scenario domain model and validation helpers.

The scenario model is the main data structure owned by Member 3. It describes
the negotiation setup stored in the database and consumed by the orchestrator
and UI.
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime
from typing import Any, Mapping

from backend.src.utils.validators import (
    coerce_mapping,
    ensure_positive_int,
    ensure_string,
    validate_agent_list,
    validate_boolean,
)


@dataclass(slots=True)
class ScenarioConfig:
    """Structured negotiation settings for a scenario."""

    agent_types: list[str] = field(default_factory=list)
    max_rounds: int = 10
    starting_budget: float | None = None
    enable_counter_offers: bool = True
    negotiation_mode: str = "turn_based"
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any] | None) -> "ScenarioConfig":
        data = coerce_mapping(payload)
        return cls(
            agent_types=validate_agent_list(data.get("agent_types", [])),
            max_rounds=ensure_positive_int(data.get("max_rounds", 10), field_name="max_rounds"),
            starting_budget=_coerce_optional_float(data.get("starting_budget")),
            enable_counter_offers=validate_boolean(data.get("enable_counter_offers", True), field_name="enable_counter_offers"),
            negotiation_mode=ensure_string(data.get("negotiation_mode", "turn_based"), field_name="negotiation_mode"),
            metadata=coerce_mapping(data.get("metadata", {})),
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "agent_types": list(self.agent_types),
            "max_rounds": self.max_rounds,
            "starting_budget": self.starting_budget,
            "enable_counter_offers": self.enable_counter_offers,
            "negotiation_mode": self.negotiation_mode,
            "metadata": dict(self.metadata),
        }


@dataclass(slots=True)
class Scenario:
    """Scenario entity persisted in the database."""

    name: str
    description: str | None = None
    config: ScenarioConfig | Mapping[str, Any] = field(default_factory=ScenarioConfig)
    created_by: int | None = None
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    def __post_init__(self) -> None:
        self.name = ensure_string(self.name, field_name="name", max_length=100)
        if self.description is not None:
            self.description = ensure_string(self.description, field_name="description", allow_empty=True)
        if not isinstance(self.config, ScenarioConfig):
            self.config = ScenarioConfig.from_mapping(self.config)
        if self.created_by is not None:
            self.created_by = ensure_positive_int(self.created_by, field_name="created_by")

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "config": self.config.to_dict(),
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def from_row(cls, row: Mapping[str, Any]) -> "Scenario":
        config = row.get("config") or {}
        return cls(
            id=row.get("id"),
            name=row.get("name", ""),
            description=row.get("description"),
            config=config,
            created_by=row.get("created_by"),
            created_at=_coerce_datetime(row.get("created_at")),
            updated_at=_coerce_datetime(row.get("updated_at")),
        )

    def with_updates(self, **changes: Any) -> "Scenario":
        return replace(self, **changes)


def _coerce_optional_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("starting_budget must be a number") from exc


def _coerce_datetime(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        cleaned = value.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(cleaned)
        except ValueError as exc:
            raise ValueError(f"Invalid datetime value: {value!r}") from exc
    raise ValueError(f"Unsupported datetime value: {type(value).__name__}")
