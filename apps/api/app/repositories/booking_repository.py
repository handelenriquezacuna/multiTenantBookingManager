from __future__ import annotations

from datetime import date, time
from typing import Any

import pyodbc

from app.db import exec_sp, exec_sp_output, query_view

# Shared SELECT for the WP6 public/track detail flows. Aliases
# vw_detalle_reservaciones' real column names (reserva_id, cliente_nombre,
# servicio_nombre, fecha_inicio, fecha_final, ...) into the intermediate row
# shape app.mappers.booking_mapper.map_booking_detail expects (reservacion_id,
# nombre_cliente, nombre_servicio, fecha_reservacion, hora_inicio, ...) -
# that intermediate contract is what tests/unit/test_mappers.py locks in, not
# the view's own column names. Also translates the Spanish `estado`
# (estados_reservaciones.nombre) to the English slug the frontend expects
# (see app.mappers.booking_mapper._STATUS_ES_TO_EN for the same table kept in
# sync on the Python side) and re-joins codigos_de_rastreos by reserva_id to
# expose `expira_en`/`activo` (the view itself only exposes `codigo_rastreo`,
# not the code's own expiry/active flag).
_DETAIL_SELECT = """
SELECT
    v.reserva_id                                    AS reservacion_id,
    v.dominio_id                                     AS dominio_id,
    v.dominio_slug                                   AS dominio_slug,
    v.localidad_id                                   AS localidad_id,
    v.localidad_nombre                               AS nombre_localidad,
    v.cliente_nombre                                 AS nombre_cliente,
    v.servicio_nombre                                AS nombre_servicio,
    CAST(v.fecha_inicio AS DATE)                     AS fecha_reservacion,
    CAST(v.fecha_inicio AS TIME)                     AS hora_inicio,
    CAST(v.fecha_final AS TIME)                      AS hora_fin,
    CASE v.estado
        WHEN N'pendiente'  THEN N'pending'
        WHEN N'confirmada' THEN N'confirmed'
        WHEN N'cancelada'  THEN N'cancelled'
        WHEN N'completada' THEN N'completed'
        WHEN N'reagendada' THEN N'rescheduled'
        ELSE v.estado
    END                                               AS estado,
    v.nota_cliente                                   AS nota_cliente,
    v.codigo_rastreo                                 AS codigo_rastreo,
    cr.expira_en                                     AS expira_en,
    cr.activo                                        AS codigo_activo
FROM vw_detalle_reservaciones v
JOIN codigos_de_rastreos cr ON cr.reserva_id = v.reserva_id
"""


class BookingRepository:
    """reservaciones + codigos_de_rastreos (via vw_detalle_reservaciones)."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    # -- WP7 (admin /bookings, owner-authenticated) ------------------------------
    # Not called by public.py/track.py (out of WP6 scope - neither router uses
    # these). Left as the WP5 stub left them: sp_crear_reservacion has no
    # `fecha_reservacion`/`hora_inicio`/`notas_cliente` parameters (it takes
    # its date/time from the availability block, and the client-notes param
    # is `nota_cliente`) and `availability_block_id` is not actually optional
    # on that SP, so `create()` still will not work against the real
    # database. Fixing the admin booking-creation flow is WP7's job.
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

    def complete(self, tenant_id: int, booking_id: int) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_completar_reservacion",
            {"dominio_id": tenant_id, "reservacion_id": booking_id},
        )
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, booking_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM vw_detalle_reservaciones WHERE dominio_id = ? AND reserva_id = ?"
        rows = query_view(
            self._conn, sql, [tenant_id, booking_id], label="vw_detalle_reservaciones"
        )
        return rows[0] if rows else None

    def list_by_tenant(self, tenant_id: int) -> list[dict[str, Any]]:
        sql = (
            "SELECT * FROM vw_detalle_reservaciones WHERE dominio_id = ? ORDER BY fecha_inicio DESC"
        )
        return query_view(self._conn, sql, [tenant_id], label="vw_detalle_reservaciones")

    # -- WP6 public storefront + tracking-code self-service ----------------------

    def create_public_booking(
        self,
        *,
        tenant_id: int,
        service_id: int,
        location_id: int,
        availability_block_id: int,
        first_name: str,
        last_name_1: str,
        last_name_2: str | None,
        email: str,
        phone: str,
        customer_notes: str | None,
    ) -> int:
        """POST /public/{slug}/bookings. Always takes the customer-contact
        branch of sp_crear_reservacion (no `cliente_id` - the public flow
        never has one, only contact info); the SP creates-or-reuses the
        client by (dominio_id, correo) internally via sp_crear_cliente.
        Returns the new `reserva_id` (an OUTPUT param - see
        app.db.exec_sp_output)."""
        return exec_sp_output(
            self._conn,
            "sp_crear_reservacion",
            {
                "dominio_id": tenant_id,
                "servicio_id": service_id,
                "localidad_id": location_id,
                "bloque_disponibilidad_id": availability_block_id,
                "cliente_nombre": first_name,
                "cliente_apellido_1": last_name_1,
                "cliente_apellido_2": last_name_2,
                "cliente_correo": email,
                "cliente_telefono": phone,
                "nota_cliente": customer_notes,
            },
            output_param="reserva_id",
        )

    def get_detail_by_id(self, reserva_id: int) -> dict[str, Any] | None:
        sql = _DETAIL_SELECT + " WHERE v.reserva_id = ?"
        rows = query_view(self._conn, sql, [reserva_id], label="vw_detalle_reservaciones")
        return rows[0] if rows else None

    def get_by_tracking_code(self, tracking_code: str) -> dict[str, Any] | None:
        """Correction (WP6): the WP5 stub did `SELECT * FROM
        vw_detalle_reservaciones WHERE codigo_rastreo = ?`, which returns the
        view's real column names (reserva_id, cliente_nombre, ...) - not the
        intermediate keys map_booking_detail expects (reservacion_id,
        nombre_cliente, ...; locked by
        tests/unit/test_mappers.py::test_map_booking_detail). See
        _DETAIL_SELECT's docstring for the full rationale."""
        sql = _DETAIL_SELECT + " WHERE v.codigo_rastreo = ?"
        rows = query_view(self._conn, sql, [tracking_code], label="vw_detalle_reservaciones")
        return rows[0] if rows else None

    def cancel(self, tenant_id: int, booking_id: int) -> None:
        """Correction (WP6): sp_cancelar_reservacion's parameters are
        `@reserva_id`/`@dominio_id` - the WP5 stub sent `reservacion_id`,
        which is not a real parameter name and would fail at the ODBC layer.
        No result set/OUTPUT param on this SP; callers re-fetch the updated
        detail row afterwards (trg_liberar_bloque_al_cancelar already freed
        the block and the estado flip is visible by the time this returns)."""
        exec_sp(
            self._conn,
            "sp_cancelar_reservacion",
            {"reserva_id": booking_id, "dominio_id": tenant_id},
        )

    def reschedule(self, tenant_id: int, booking_id: int, *, availability_block_id: int) -> None:
        """Correction (WP6): sp_reagendar_reservacion's parameters are
        `@reserva_id`/`@dominio_id`/`@nuevo_bloque_id` - it has no
        booking_date/start_time parameters at all (like sp_crear_reservacion,
        it takes the new block's own fecha_inicio/fecha_final). The WP5 stub
        invented `fecha_reservacion`/`hora_inicio` params and used the wrong
        name (`bloque_disponibilidad_id` instead of `nuevo_bloque_id`) for
        the new block. Fixed and simplified to match the real signature."""
        exec_sp(
            self._conn,
            "sp_reagendar_reservacion",
            {
                "reserva_id": booking_id,
                "dominio_id": tenant_id,
                "nuevo_bloque_id": availability_block_id,
            },
        )
