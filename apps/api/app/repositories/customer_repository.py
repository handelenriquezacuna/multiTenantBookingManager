from __future__ import annotations

from typing import Any

import pyodbc

from app.db import exec_sp_output, query_view


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
        """WP7b correction: sp_crear_cliente's email parameter is `@correo`
        (the WP5 stub sent the non-existent `email`), and the SP reports the
        (possibly reused - see docs/sql-signatures.md #8) id via
        `@cliente_id OUTPUT` only, no final SELECT - so this must go through
        exec_sp_output and then re-read the full row."""
        customer_id = exec_sp_output(
            self._conn,
            "sp_crear_cliente",
            {
                "dominio_id": tenant_id,
                "nombre": first_name,
                "apellido_1": last_name_1,
                "apellido_2": last_name_2,
                "correo": email,
                "telefono": phone,
                "notas": notes,
            },
            output_param="cliente_id",
        )
        return self.get_by_id(tenant_id, customer_id) or {}

    def get_by_id(self, tenant_id: int, customer_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM clientes WHERE dominio_id = ? AND cliente_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, customer_id])
        return rows[0] if rows else None

    def list_by_tenant(
        self, tenant_id: int, *, page: int, page_size: int, q: str | None = None
    ) -> tuple[list[dict[str, Any]], int]:
        """GET /customers: paginated, with an optional `?q` search over
        nombre/correo (WP7b brief)."""
        conditions = ["dominio_id = ?"]
        params: list[Any] = [tenant_id]
        if q:
            conditions.append("(nombre LIKE ? OR correo LIKE ?)")
            like = f"%{q}%"
            params.extend([like, like])
        where = " AND ".join(conditions)

        total_rows = query_view(
            self._conn, f"SELECT COUNT(*) AS total FROM clientes WHERE {where}", params
        )
        total = int(total_rows[0]["total"]) if total_rows else 0

        sql = (
            f"SELECT * FROM clientes WHERE {where} ORDER BY nombre, cliente_id "
            "OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        )
        rows = query_view(self._conn, sql, [*params, (page - 1) * page_size, page_size])
        return rows, total

    def update(
        self,
        tenant_id: int,
        customer_id: int,
        *,
        first_name: str | None = None,
        last_name_1: str | None = None,
        last_name_2: str | None = None,
        email: str | None = None,
        phone: str | None = None,
        notes: str | None = None,
    ) -> dict[str, Any] | None:
        """PATCH /customers/{id}. No SP exists for this - direct
        parameterized UPDATE, same COALESCE-by-omission pattern as
        app.repositories.tenant_repository.update_tenant. `last_name_1`
        being given is the signal to also (over)write `apellido_2`, even to
        NULL, since both surname columns always change together (see
        app.services.customer_service.CustomerService.update)."""
        columns: dict[str, Any] = {}
        if first_name is not None:
            columns["nombre"] = first_name
        if last_name_1 is not None:
            columns["apellido_1"] = last_name_1
            columns["apellido_2"] = last_name_2
        if email is not None:
            columns["correo"] = email
        if phone is not None:
            columns["telefono"] = phone
        if notes is not None:
            columns["notas"] = notes

        if columns:
            set_clause = ", ".join(f"{column} = ?" for column in columns)
            sql = (
                f"UPDATE clientes SET {set_clause}, actualizado_en = SYSUTCDATETIME() "
                "WHERE dominio_id = ? AND cliente_id = ?"
            )
            cursor = self._conn.cursor()
            try:
                cursor.execute(sql, [*columns.values(), tenant_id, customer_id])
                self._conn.commit()
            except Exception:
                self._conn.rollback()
                raise
            finally:
                cursor.close()

        return self.get_by_id(tenant_id, customer_id)

    def booking_history(self, tenant_id: int, customer_id: int) -> list[dict[str, Any]]:
        """GET /customers/{id}/bookings, per vw_historial_reservaciones_cliente
        (WP7b brief). That view alone lacks a tracking code, so this joins
        codigos_de_rastreos by reserva_id (every booking always has exactly
        one - inserted by trg_reservaciones_generar_rastreo) and aliases
        everything into the same intermediate row shape
        app.mappers.booking_mapper.map_booking_detail expects, so the
        response reuses that one mapper/BookingResponse contract."""
        sql = (
            "SELECT "
            "h.reserva_id      AS reservacion_id, "
            "h.cliente_nombre  AS nombre_cliente, "
            "h.servicio_nombre AS nombre_servicio, "
            "CAST(h.fecha_inicio AS DATE) AS fecha_reservacion, "
            "CAST(h.fecha_inicio AS TIME) AS hora_inicio, "
            "h.estado          AS estado, "
            "cr.codigo_rastreo AS codigo_rastreo "
            "FROM vw_historial_reservaciones_cliente h "
            "JOIN codigos_de_rastreos cr ON cr.reserva_id = h.reserva_id "
            "WHERE h.dominio_id = ? AND h.cliente_id = ? "
            "ORDER BY h.fecha_inicio DESC"
        )
        return query_view(
            self._conn,
            sql,
            [tenant_id, customer_id],
            label="vw_historial_reservaciones_cliente",
        )
