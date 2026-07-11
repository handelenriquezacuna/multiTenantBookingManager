from __future__ import annotations

from datetime import time
from typing import Any

import pyodbc

from app.db import query_view


class BusinessHoursRepository:
    """horarios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def upsert(
        self,
        *,
        tenant_id: int,
        location_id: int,
        day_of_week: int,
        open_time: time | None,
        close_time: time | None,
        is_closed: bool,
    ) -> dict[str, Any]:
        sql = (
            "MERGE horarios AS target "
            "USING (SELECT ? AS dominio_id, ? AS localidad_id, ? AS dia_semana) AS src "
            "ON target.dominio_id = src.dominio_id AND target.localidad_id = src.localidad_id "
            "AND target.dia_semana = src.dia_semana "
            "WHEN MATCHED THEN UPDATE SET hora_apertura = ?, hora_cierre = ?, esta_cerrado = ? "
            "WHEN NOT MATCHED THEN INSERT (dominio_id, localidad_id, dia_semana, hora_apertura, "
            "hora_cierre, esta_cerrado) VALUES (?, ?, ?, ?, ?, ?) "
            "OUTPUT INSERTED.*;"
        )
        params = [
            tenant_id,
            location_id,
            day_of_week,
            open_time,
            close_time,
            is_closed,
            tenant_id,
            location_id,
            day_of_week,
            open_time,
            close_time,
            is_closed,
        ]
        rows = query_view(self._conn, sql, params)
        self._conn.commit()
        return rows[0] if rows else {}

    def list_by_location(self, tenant_id: int, location_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM horarios WHERE dominio_id = ? AND localidad_id = ? ORDER BY dia_semana"
        return query_view(self._conn, sql, [tenant_id, location_id])
