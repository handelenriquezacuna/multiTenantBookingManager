from __future__ import annotations

from typing import Any

import pyodbc

from app.db import exec_sp, query_view


class CustomerRepository:
    """clientes."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(
        self,
        *,
        tenant_id: int,
        first_name: str,
        last_name_1: str,
        last_name_2: str | None,
        email: str,
        phone: str,
        notes: str | None,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_crear_cliente",
            {
                "dominio_id": tenant_id,
                "nombre": first_name,
                "apellido_1": last_name_1,
                "apellido_2": last_name_2,
                "email": email,
                "telefono": phone,
                "notas": notes,
            },
        )
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, customer_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM clientes WHERE dominio_id = ? AND cliente_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, customer_id])
        return rows[0] if rows else None

    def list_by_tenant(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM clientes WHERE dominio_id = ? ORDER BY nombre"
        return query_view(self._conn, sql, [tenant_id])

    def booking_history(self, tenant_id: int, customer_id: int) -> list[dict[str, Any]]:
        sql = (
            "SELECT * FROM vw_historial_reservaciones_cliente "
            "WHERE dominio_id = ? AND cliente_id = ?"
        )
        return query_view(self._conn, sql, [tenant_id, customer_id])
