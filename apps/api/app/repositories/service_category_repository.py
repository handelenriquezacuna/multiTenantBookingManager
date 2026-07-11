from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class ServiceCategoryRepository:
    """categorias_servicios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(self, *, tenant_id: int, name: str, description: str | None) -> dict[str, Any]:
        sql = (
            "INSERT INTO categorias_servicios (dominio_id, nombre, descripcion) "
            "OUTPUT INSERTED.* VALUES (?, ?, ?)"
        )
        rows = query_view(self._conn, sql, [tenant_id, name, description])
        self._conn.commit()
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, category_id: int) -> dict[str, Any] | None:
        sql = (
            "SELECT * FROM categorias_servicios WHERE dominio_id = ? AND categoria_servicio_id = ?"
        )
        rows = query_view(self._conn, sql, [tenant_id, category_id])
        return rows[0] if rows else None

    def list_by_tenant(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM categorias_servicios WHERE dominio_id = ? ORDER BY nombre"
        return query_view(self._conn, sql, [tenant_id])
