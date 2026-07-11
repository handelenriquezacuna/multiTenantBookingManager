from __future__ import annotations

from typing import Any

import pyodbc

from app.db import exec_sp, query_view


class ServiceRepository:
    """servicios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(
        self,
        *,
        tenant_id: int,
        category_id: int,
        name: str,
        description: str | None,
        duration_minutes: int,
        price: float | None,
        show_price: bool,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_crear_servicio",
            {
                "dominio_id": tenant_id,
                "categoria_servicio_id": category_id,
                "nombre": name,
                "descripcion": description,
                "duracion_minutos": duration_minutes,
                "precio": price,
                "mostrar_precio": show_price,
            },
        )
        return rows[0] if rows else {}

    def update(self, tenant_id: int, service_id: int, **fields: Any) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_actualizar_servicio",
            {"dominio_id": tenant_id, "servicio_id": service_id, **fields},
        )
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, service_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM servicios WHERE dominio_id = ? AND servicio_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, service_id])
        return rows[0] if rows else None

    def list_by_tenant(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM servicios WHERE dominio_id = ? AND esta_activo = 1 ORDER BY nombre"
        return query_view(self._conn, sql, [tenant_id])

    def list_public_by_slug(self, slug: str) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_servicios_publicos WHERE slug = ?"
        return query_view(self._conn, sql, [slug])
