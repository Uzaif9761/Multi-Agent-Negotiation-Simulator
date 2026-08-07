"""Validation helpers owned by Member 3."""

from __future__ import annotations

import re
from collections.abc import Mapping
from typing import Any

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def ensure_string(value: Any, *, field_name: str, max_length: int | None = None, allow_empty: bool = False) -> str:
    if not isinstance(value, str):
        raise TypeError(f"{field_name} must be a string")
    cleaned = value.strip()
    if not cleaned and not allow_empty:
        raise ValueError(f"{field_name} cannot be empty")
    if max_length is not None and len(cleaned) > max_length:
        raise ValueError(f"{field_name} must be at most {max_length} characters")
    return cleaned


def ensure_positive_int(value: Any, *, field_name: str) -> int:
    try:
        integer_value = int(value)
    except (TypeError, ValueError) as exc:
        raise TypeError(f"{field_name} must be an integer") from exc
    if integer_value < 0:
        raise ValueError(f"{field_name} must be zero or positive")
    return integer_value


def validate_boolean(value: Any, *, field_name: str) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "1", "yes", "y"}:
            return True
        if lowered in {"false", "0", "no", "n"}:
            return False
    raise TypeError(f"{field_name} must be a boolean")


def validate_email(value: Any) -> str:
    email = ensure_string(value, field_name="email", max_length=100)
    if not EMAIL_PATTERN.match(email):
        raise ValueError("email is not valid")
    return email


def validate_agent_list(values: Any) -> list[str]:
    if values is None:
        return []
    if not isinstance(values, list):
        raise TypeError("agent_types must be a list of strings")
    return [ensure_string(value, field_name="agent_type", max_length=50) for value in values]


def coerce_mapping(value: Any) -> dict[str, Any]:
    if value is None:
        return {}
    if isinstance(value, Mapping):
        return dict(value)
    raise TypeError("value must be a mapping")
