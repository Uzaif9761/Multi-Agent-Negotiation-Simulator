"""Database helper owned by Member 3.

The service is intentionally dependency-light. It works with any DB-API 2.0
connection object and can bootstrap a local SQLite database when no external
database URL is configured.
"""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterable, Mapping

from backend.src.models.scenario import Scenario, ScenarioConfig
from backend.src.utils.validators import coerce_mapping, ensure_positive_int, ensure_string


class DatabaseService:
    def __init__(self, connection: Any | None = None, *, placeholder_style: str = "qmark") -> None:
        self.connection = connection
        self.placeholder_style = placeholder_style

    @classmethod
    def from_environment(cls) -> "DatabaseService":
        database_url = os.getenv("DATABASE_URL")
        if not database_url or database_url.startswith("sqlite"):
            return cls(_create_sqlite_connection(database_url), placeholder_style="qmark")
        return cls(_create_postgres_connection(database_url), placeholder_style="pyformat")

    @property
    def placeholder(self) -> str:
        return "?" if self.placeholder_style == "qmark" else "%s"

    def close(self) -> None:
        if self.connection is not None:
            self.connection.close()

    def initialize_schema(self, schema_path: str | Path | None = None) -> None:
        if isinstance(self.connection, sqlite3.Connection):
            schema_sql = _build_sqlite_schema()
        else:
            schema_path = Path(schema_path or Path(__file__).resolve().parents[3] / "database" / "schema.sql")
            schema_sql = schema_path.read_text(encoding="utf-8")
        self.execute_script(schema_sql)

    def execute_script(self, sql_script: str) -> None:
        with self._cursor() as cursor:
            if hasattr(cursor, "executescript"):
                cursor.executescript(sql_script)
                return
            for statement in [part.strip() for part in sql_script.split(";") if part.strip()]:
                cursor.execute(statement)

    def create_user(self, username: str, email: str, password_hash: str) -> dict[str, Any]:
        return self._fetch_one(
            f"INSERT INTO users (username, email, password_hash) VALUES ({self.placeholder}, {self.placeholder}, {self.placeholder}) RETURNING *",
            (
                ensure_string(username, field_name="username", max_length=50),
                ensure_string(email, field_name="email", max_length=100),
                ensure_string(password_hash, field_name="password_hash", max_length=255),
            ),
        )

    def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        return self._fetch_one_optional(
            f"SELECT * FROM users WHERE email = {self.placeholder}",
            (ensure_string(email, field_name="email", max_length=100),),
        )

    def create_scenario(self, scenario: Scenario | Mapping[str, Any]) -> dict[str, Any]:
        scenario = scenario if isinstance(scenario, Scenario) else Scenario.from_row(coerce_mapping(scenario))
        return self._fetch_one(
            f"INSERT INTO scenarios (name, description, config, created_by) VALUES ({self.placeholder}, {self.placeholder}, {self.placeholder}, {self.placeholder}) RETURNING *",
            (scenario.name, scenario.description, json.dumps(scenario.config.to_dict(), sort_keys=True), scenario.created_by),
        )

    def get_scenario(self, scenario_id: int) -> dict[str, Any] | None:
        row = self._fetch_one_optional(
            f"SELECT * FROM scenarios WHERE id = {self.placeholder}",
            (ensure_positive_int(scenario_id, field_name="scenario_id"),),
        )
        return self._normalize_scenario_row(row) if row else None

    def list_scenarios(self, *, created_by: int | None = None, limit: int = 100, offset: int = 0) -> list[dict[str, Any]]:
        params: list[Any] = []
        where_clause = ""
        if created_by is not None:
            where_clause = f"WHERE created_by = {self.placeholder}"
            params.append(ensure_positive_int(created_by, field_name="created_by"))
        params.extend([ensure_positive_int(limit, field_name="limit"), ensure_positive_int(offset, field_name="offset")])
        rows = self._fetch_all(
            f"SELECT * FROM scenarios {where_clause} ORDER BY created_at DESC LIMIT {self.placeholder} OFFSET {self.placeholder}",
            tuple(params),
        )
        return [self._normalize_scenario_row(row) for row in rows]

    def update_scenario(self, scenario_id: int, **changes: Any) -> dict[str, Any] | None:
        assignments: list[str] = []
        params: list[Any] = []
        if "name" in changes:
            assignments.append(f"name = {self.placeholder}")
            params.append(ensure_string(changes["name"], field_name="name", max_length=100))
        if "description" in changes:
            assignments.append(f"description = {self.placeholder}")
            params.append(changes["description"])
        if "config" in changes:
            config = changes["config"]
            if isinstance(config, Scenario):
                config = config.config
            if isinstance(config, ScenarioConfig):
                config = config.to_dict()
            assignments.append(f"config = {self.placeholder}")
            params.append(json.dumps(coerce_mapping(config), sort_keys=True))
        if not assignments:
            return self.get_scenario(scenario_id)
        assignments.append("updated_at = CURRENT_TIMESTAMP")
        params.append(ensure_positive_int(scenario_id, field_name="scenario_id"))
        row = self._fetch_one_optional(
            f"UPDATE scenarios SET {', '.join(assignments)} WHERE id = {self.placeholder} RETURNING *",
            tuple(params),
        )
        return self._normalize_scenario_row(row) if row else None

    def delete_scenario(self, scenario_id: int) -> bool:
        return self._execute(
            f"DELETE FROM scenarios WHERE id = {self.placeholder}",
            (ensure_positive_int(scenario_id, field_name="scenario_id"),),
        ) > 0

    def create_negotiation(self, scenario_id: int, agent_config: Mapping[str, Any], *, status: str = "pending") -> dict[str, Any]:
        return self._fetch_one(
            f"INSERT INTO negotiations (scenario_id, status, agent_config) VALUES ({self.placeholder}, {self.placeholder}, {self.placeholder}) RETURNING *",
            (
                ensure_positive_int(scenario_id, field_name="scenario_id"),
                ensure_string(status, field_name="status", max_length=20),
                json.dumps(coerce_mapping(agent_config), sort_keys=True),
            ),
        )

    def update_negotiation_status(self, negotiation_id: int, status: str, result: Mapping[str, Any] | None = None) -> dict[str, Any] | None:
        return self._fetch_one_optional(
            f"UPDATE negotiations SET status = {self.placeholder}, result = {self.placeholder}, completed_at = CURRENT_TIMESTAMP WHERE id = {self.placeholder} RETURNING *",
            (
                ensure_string(status, field_name="status", max_length=20),
                json.dumps(coerce_mapping(result), sort_keys=True) if result is not None else None,
                ensure_positive_int(negotiation_id, field_name="negotiation_id"),
            ),
        )

    def get_negotiation(self, negotiation_id: int) -> dict[str, Any] | None:
        return self._fetch_one_optional(
            f"SELECT * FROM negotiations WHERE id = {self.placeholder}",
            (ensure_positive_int(negotiation_id, field_name="negotiation_id"),),
        )

    def add_negotiation_log(
        self,
        negotiation_id: int,
        round_number: int,
        agent_type: str,
        action: str,
        data: Mapping[str, Any] | None = None,
    ) -> dict[str, Any]:
        return self._fetch_one(
            f"INSERT INTO negotiation_logs (negotiation_id, round_number, agent_type, action, data) VALUES ({self.placeholder}, {self.placeholder}, {self.placeholder}, {self.placeholder}, {self.placeholder}) RETURNING *",
            (
                ensure_positive_int(negotiation_id, field_name="negotiation_id"),
                ensure_positive_int(round_number, field_name="round_number"),
                ensure_string(agent_type, field_name="agent_type", max_length=50),
                ensure_string(action, field_name="action", max_length=50),
                json.dumps(coerce_mapping(data), sort_keys=True),
            ),
        )

    def get_analytics_overview(self) -> dict[str, Any]:
        return {
            "total_scenarios": self._fetch_count("SELECT COUNT(*) AS count FROM scenarios"),
            "total_negotiations": self._fetch_count("SELECT COUNT(*) AS count FROM negotiations"),
            "completed_negotiations": self._fetch_count("SELECT COUNT(*) AS count FROM negotiations WHERE status = 'completed'"),
            "total_logs": self._fetch_count("SELECT COUNT(*) AS count FROM negotiation_logs"),
        }

    def seed_default_data(self) -> dict[str, Any]:
        user = self.get_user_by_email("demo@example.com") or self.create_user("demo_user", "demo@example.com", "demo-password-hash")
        scenario = self.create_scenario(
            Scenario(
                name="Retail Supplier Negotiation",
                description="A baseline retail procurement scenario with a buyer and a supplier.",
                config=ScenarioConfig(
                    agent_types=["competitive", "collaborative"],
                    max_rounds=8,
                    starting_budget=100000,
                    enable_counter_offers=True,
                    negotiation_mode="turn_based",
                    metadata={"domain": "procurement"},
                ),
                created_by=user["id"],
            )
        )
        negotiation = self.create_negotiation(scenario["id"], {"agents": ["competitive", "collaborative"]})
        self.add_negotiation_log(negotiation["id"], 1, "competitive", "offer", {"price": 92000})
        return {"user": user, "scenario": scenario, "negotiation": negotiation}

    def _execute(self, sql: str, params: Iterable[Any] = ()) -> int:
        with self._cursor() as cursor:
            cursor.execute(sql, tuple(params))
            return getattr(cursor, "rowcount", 0)

    def _fetch_count(self, sql: str, params: Iterable[Any] = ()) -> int:
        row = self._fetch_one(sql, params)
        return int(row.get("count") or 0)

    def _fetch_one(self, sql: str, params: Iterable[Any] = ()) -> dict[str, Any]:
        row = self._fetch_one_optional(sql, params)
        if row is None:
            raise LookupError("No row was returned")
        return row

    def _fetch_one_optional(self, sql: str, params: Iterable[Any] = ()) -> dict[str, Any] | None:
        with self._cursor() as cursor:
            cursor.execute(sql, tuple(params))
            row = cursor.fetchone()
            return self._row_to_dict(cursor, row) if row is not None else None

    def _fetch_all(self, sql: str, params: Iterable[Any] = ()) -> list[dict[str, Any]]:
        with self._cursor() as cursor:
            cursor.execute(sql, tuple(params))
            return [self._row_to_dict(cursor, row) for row in cursor.fetchall()]

    @contextmanager
    def _cursor(self):
        if self.connection is None:
            self.connection = _create_sqlite_connection(None)
        cursor = self.connection.cursor()
        try:
            yield cursor
            self.connection.commit()
        except Exception:
            self.connection.rollback()
            raise
        finally:
            cursor.close()

    def _row_to_dict(self, cursor: Any, row: Any) -> dict[str, Any]:
        if row is None:
            return {}
        if isinstance(row, Mapping):
            result = dict(row)
        else:
            columns = [column[0] for column in cursor.description or []]
            result = {columns[index]: row[index] for index in range(len(columns))}
        for key in ("config", "agent_config", "result", "data"):
            if isinstance(result.get(key), str):
                result[key] = json.loads(result[key])
        return result

    def _normalize_scenario_row(self, row: dict[str, Any]) -> dict[str, Any]:
        normalized = dict(row)
        if normalized.get("config") is None:
            normalized["config"] = {}
        return normalized


def _create_sqlite_connection(database_url: str | None) -> sqlite3.Connection:
    if database_url and database_url.startswith("sqlite:///"):
        database_path = Path(database_url.removeprefix("sqlite:///"))
    else:
        database_path = Path(__file__).resolve().parents[3] / "database" / "negotiation_simulator.sqlite3"
    database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    return connection


def _create_postgres_connection(database_url: str) -> Any:
    try:
        import psycopg  # type: ignore

        return psycopg.connect(database_url)
    except ImportError:
        try:
            import psycopg2  # type: ignore

            return psycopg2.connect(database_url)
        except ImportError as exc:
            raise RuntimeError("A PostgreSQL driver is required for non-SQLite DATABASE_URL values.") from exc


def _build_sqlite_schema() -> str:
    return """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    config TEXT NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS negotiations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_id INTEGER,
    status TEXT DEFAULT 'pending',
    agent_config TEXT,
    result TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS negotiation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    negotiation_id INTEGER,
    round_number INTEGER,
    agent_type TEXT,
    action TEXT,
    data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (negotiation_id) REFERENCES negotiations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scenarios_created_by ON scenarios(created_by);
CREATE INDEX IF NOT EXISTS idx_negotiations_scenario_id ON negotiations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_logs_negotiation_id ON negotiation_logs(negotiation_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
""".strip()
