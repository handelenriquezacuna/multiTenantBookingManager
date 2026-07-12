from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class SuperadminRepository:
    """superadmins."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        """WP7a correction: the column is `correo` (rename-map row 20), not
        `email` - the WP5 stub's filter never matched any real row."""
        sql = "SELECT * FROM superadmins WHERE correo = ?"
        rows = query_view(self._conn, sql, [email], label="superadmins")
        return rows[0] if rows else None

    def get_by_id(self, superadmin_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM superadmins WHERE superadmin_id = ?"
        rows = query_view(self._conn, sql, [superadmin_id], label="superadmins")
        return rows[0] if rows else None
