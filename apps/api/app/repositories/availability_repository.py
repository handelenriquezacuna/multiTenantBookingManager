from __future__ import annotations

from datetime import date, time
from typing import Any

import pyodbc

from app.db import exec_sp, query_view


class AvailabilityRepository:
    """bloques_de_disponibilidad."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create_block(
        self,
        *,
        tenant_id: int,
        location_id: int,
        block_date: date,
        start_time: time,
        end_time: time,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_crear_bloque_disponibilidad",
            {
                "dominio_id": tenant_id,
                "localidad_id": location_id,
                "fecha_bloque": block_date,
                "hora_inicio": start_time,
                "hora_fin": end_time,
            },
        )
        return rows[0] if rows else {}

    def list_status(
        self, tenant_id: int, location_id: int, block_date: date
    ) -> list[dict[str, Any]]:
        sql = (
            "SELECT * FROM vw_estado_disponibilidad "
            "WHERE dominio_id = ? AND localidad_id = ? AND fecha_bloque = ?"
        )
        return query_view(self._conn, sql, [tenant_id, location_id, block_date])

    def list_public(self, slug: str, block_date: date) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_estado_disponibilidad WHERE slug = ? AND fecha_bloque = ?"
        return query_view(self._conn, sql, [slug, block_date])
