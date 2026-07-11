"""Row from `reservaciones` / vw_detalle_reservaciones -> Booking contract.

Matches apps/frontend/types/booking.ts:
    { bookingId, customerName, serviceName, bookingDate, startTime, status,
      trackingCode }

vw_detalle_reservaciones (WP3) is expected to already join clientes/servicios
and expose a precomputed display name and the tracking code, so this mapper
stays a flat, pure translation (no name-combining logic here - that lives in
customer_mapper for the raw `clientes` case).

`status` values (estados_reservaciones.nombre) are expected to already be the
stable English slugs the frontend contract expects
("pending"|"confirmed"|"cancelled"|"completed"|"rescheduled"); these are
enum-like data values, not identifiers, so no translation happens here.
"""

from __future__ import annotations

from typing import Any


def map_booking_detail(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "booking_id": row["reservacion_id"],
        "customer_name": row["nombre_cliente"],
        "service_name": row["nombre_servicio"],
        "booking_date": row["fecha_reservacion"],
        "start_time": row["hora_inicio"],
        "status": row["estado"],
        "tracking_code": row["codigo_rastreo"],
    }
