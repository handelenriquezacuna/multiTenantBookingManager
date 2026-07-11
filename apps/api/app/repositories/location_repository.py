from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class LocationRepository:
    """localidades."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(
        self, *, tenant_id: int, name: str, address: str, phone: str | None, is_main: bool
    ) -> dict[str, Any]:
        sql = (
            "INSERT INTO localidades (dominio_id, nombre, direccion, telefono, es_principal) "
            "OUTPUT INSERTED.* VALUES (?, ?, ?, ?, ?)"
        )
        rows = query_view(self._conn, sql, [tenant_id, name, address, phone, is_main])
        self._conn.commit()
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, location_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM localidades WHERE dominio_id = ? AND localidad_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, location_id])
        return rows[0] if rows else None

    def list_by_tenant(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM localidades WHERE dominio_id = ? AND esta_activo = 1 ORDER BY nombre"
        return query_view(self._conn, sql, [tenant_id])
