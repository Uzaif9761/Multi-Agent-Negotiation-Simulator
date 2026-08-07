"""Seed the database with baseline development data."""

from __future__ import annotations

from database.init_db import initialize_database


def main() -> None:
    service = initialize_database()
    result = service.seed_default_data()
    print(result)


if __name__ == "__main__":
    main()
