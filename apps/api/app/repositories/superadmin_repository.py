from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class SuperadminRepository:
    """superadmins."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        sql = "SELECT * FROM superadmins WHERE email = ?"
        rows = query_view(self._conn, sql, [email])
        return rows[0] if rows else None
