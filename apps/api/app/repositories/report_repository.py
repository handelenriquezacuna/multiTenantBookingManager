from __future__ import annotations

from datetime import date
from typing import Any

import pyodbc

from app.db import query_view


class ReportRepository:
    """Read-only access to the WP3 reporting views."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def dashboard(self, tenant_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM vw_dashboard_dominio WHERE dominio_id = ?"
        rows = query_view(self._conn, sql, [tenant_id])
        return rows[0] if rows else None

    def daily_agenda(self, tenant_id: int, agenda_date: date) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_agenda_diaria WHERE dominio_id = ? AND fecha_reservacion = ?"
        return query_view(self._conn, sql, [tenant_id, agenda_date])

    def bookings_detail(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_detalle_reservaciones WHERE dominio_id = ?"
        return query_view(self._conn, sql, [tenant_id])

    def services_demand(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_demanda_servicios WHERE dominio_id = ?"
        return query_view(self._conn, sql, [tenant_id])

    def availability_status(self, tenant_id: int, status_date: date) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_estado_disponibilidad WHERE dominio_id = ? AND fecha_bloque = ?"
        return query_view(self._conn, sql, [tenant_id, status_date])
