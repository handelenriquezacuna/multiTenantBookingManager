"""Synchronous pyodbc access layer.

Design: one pyodbc connection per request (see get_db dependency in deps.py),
relying on pyodbc's own connection pooling (pyodbc.pooling = True) plus
FastAPI's threadpool for sync endpoints/dependencies. No ORM, no async
DB drivers.

exec_sp / query_view both return list[dict[str, Any]] built from
cursor.description, so callers (repositories) never touch pyodbc row objects
directly.
"""

from __future__ import annotations

from collections.abc import Generator, Mapping, Sequence
from typing import Any

import pyodbc

from app.config import Settings

pyodbc.pooling = True


class ConnectionFactory:
    """Builds pyodbc connections from Settings. One instance is created at
    app startup and handed to the get_db dependency."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def new_connection(self) -> pyodbc.Connection:
        return pyodbc.connect(self._settings.connection_string, autocommit=False)

    def ping(self) -> bool:
        """Used by GET /ready. Returns True if SELECT 1 succeeds."""
        conn = self.new_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            return True
        finally:
            conn.close()


def get_connection(factory: ConnectionFactory) -> Generator[pyodbc.Connection, None, None]:
    """Context-managed connection lifecycle for a single request."""
    conn = factory.new_connection()
    try:
        yield conn
    finally:
        conn.close()


def _rows_to_dicts(cursor: pyodbc.Cursor) -> list[dict[str, Any]]:
    if cursor.description is None:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row, strict=True)) for row in cursor.fetchall()]


def exec_sp(
    conn: pyodbc.Connection,
    name: str,
    params: Mapping[str, Any] | None = None,
) -> list[dict[str, Any]]:
    """Executes a stored procedure by name with named parameters and returns
    its result set (if any) as a list of dicts. Commits on success.

    `name` must always be a fixed string literal from the SP catalog (see
    WP overview) - never build it from user input.
    """
    params = params or {}
    cursor = conn.cursor()
    try:
        placeholders = ", ".join(f"@{key}=?" for key in params)
        sql = f"EXEC {name} {placeholders}".strip()
        cursor.execute(sql, list(params.values()))
        rows = _rows_to_dicts(cursor)
        conn.commit()
        return rows
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


def query_view(
    conn: pyodbc.Connection,
    sql: str,
    params: Sequence[Any] | None = None,
) -> list[dict[str, Any]]:
    """Executes a read-only parameterized SELECT (typically against one of
    the vw_* views) and returns the result set as a list of dicts.
    """
    cursor = conn.cursor()
    try:
        cursor.execute(sql, list(params) if params else [])
        return _rows_to_dicts(cursor)
    finally:
        cursor.close()
