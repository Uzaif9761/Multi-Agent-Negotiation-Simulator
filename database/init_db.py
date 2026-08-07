"""Database bootstrap helpers for Member 3."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from backend.src.services.db_service import DatabaseService


def get_database_service() -> DatabaseService:
    return DatabaseService.from_environment()


def initialize_database(schema_path: str | Path | None = None) -> DatabaseService:
    service = get_database_service()
    service.initialize_schema(schema_path=schema_path)
    return service


def connection_summary() -> dict[str, Any]:
    database_url = os.getenv("DATABASE_URL")
    return {
        "database_url": database_url,
        "mode": "sqlite" if not database_url or database_url.startswith("sqlite") else "postgresql",
    }
