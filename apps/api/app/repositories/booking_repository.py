from __future__ import annotations

from datetime import date, time
from typing import Any

import pyodbc

from app.db import exec_sp, query_view


class BookingRepository:
    """reservaciones + codigos_de_rastreos."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(
        self,
        *,
        tenant_id: int,
        customer_id: int,
        service_id: int,
        location_id: int,
        availability_block_id: int | None,
        booking_date: date,
        start_time: time,
        customer_notes: str | None,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_crear_reservacion",
            {
                "dominio_id": tenant_id,
                "cliente_id": customer_id,
                "servicio_id": service_id,
                "localidad_id": location_id,
                "bloque_disponibilidad_id": availability_block_id,
                "fecha_reservacion": booking_date,
                "hora_inicio": start_time,
                "notas_cliente": customer_notes,
            },
        )
        return rows[0] if rows else {}

    def confirm(self, tenant_id: int, booking_id: int) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_confirmar_reservacion",
            {"dominio_id": tenant_id, "reservacion_id": booking_id},
        )
        return rows[0] if rows else {}

    def cancel(self, tenant_id: int, booking_id: int) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_cancelar_reservacion",
            {"dominio_id": tenant_id, "reservacion_id": booking_id},
        )
        return rows[0] if rows else {}

    def reschedule(
        self,
        tenant_id: int,
        booking_id: int,
        *,
        availability_block_id: int,
        booking_date: date,
        start_time: time,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_reagendar_reservacion",
            {
                "dominio_id": tenant_id,
                "reservacion_id": booking_id,
                "bloque_disponibilidad_id": availability_block_id,
                "fecha_reservacion": booking_date,
                "hora_inicio": start_time,
            },
        )
        return rows[0] if rows else {}

    def complete(self, tenant_id: int, booking_id: int) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_completar_reservacion",
            {"dominio_id": tenant_id, "reservacion_id": booking_id},
        )
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, booking_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM vw_detalle_reservaciones WHERE dominio_id = ? AND reservacion_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, booking_id])
        return rows[0] if rows else None

    def list_by_tenant(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM vw_detalle_reservaciones WHERE dominio_id = ? ORDER BY fecha_reservacion DESC"
        return query_view(self._conn, sql, [tenant_id])

    def get_by_tracking_code(self, tracking_code: str) -> dict[str, Any] | None:
        sql = "SELECT * FROM vw_detalle_reservaciones WHERE codigo_rastreo = ?"
        rows = query_view(self._conn, sql, [tracking_code])
        return rows[0] if rows else None
