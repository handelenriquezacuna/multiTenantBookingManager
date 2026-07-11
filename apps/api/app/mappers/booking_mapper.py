"""Row from `reservaciones` / vw_detalle_reservaciones -> Booking contract.

Matches apps/frontend/types/booking.ts:
    { bookingId, customerName, serviceName, bookingDate, startTime, status,
      trackingCode }

vw_detalle_reservaciones (WP3) is expected to already join clientes/servicios
and expose a precomputed display name and the tracking code, so this mapper
stays a flat, pure translation (no name-combining logic here - that lives in
customer_mapper for the raw `clientes` case).

WP6 correction: the WP5 stub assumed `estado` (estados_reservaciones.nombre)
was already the stable English slug the frontend expects. It is not - per
docs/sql-signatures.md #6 the real values are Spanish
(pendiente/confirmada/cancelada/completada/reagendada). `_translate_status`
below fixes that, but does so as a total/idempotent mapping (unknown values,
including already-English ones, pass through unchanged) specifically so the
existing locked unit test (tests/unit/test_mappers.py::test_map_booking_detail,
which feeds "confirmed" straight through) keeps passing unmodified.

The repository is responsible for aliasing the real vw_detalle_reservaciones
column names (reserva_id, cliente_nombre, servicio_nombre, fecha_inicio,
fecha_final, ...) into the intermediate keys this mapper expects (see
app.repositories.booking_repository) - that intermediate contract is what the
unit tests lock in, not the raw view's column names.
"""

from __future__ import annotations

from typing import Any

_STATUS_ES_TO_EN: dict[str, str] = {
    "pendiente": "pending",
    "confirmada": "confirmed",
    "cancelada": "cancelled",
    "completada": "completed",
    "reagendada": "rescheduled",
}


def _translate_status(value: str) -> str:
    return _STATUS_ES_TO_EN.get(value, value)


def map_booking_detail(row: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {
        "booking_id": row["reservacion_id"],
        "customer_name": row["nombre_cliente"],
        "service_name": row["nombre_servicio"],
        "booking_date": row["fecha_reservacion"],
        "start_time": row["hora_inicio"],
        "status": _translate_status(row["estado"]),
        "tracking_code": row["codigo_rastreo"],
    }
    # Optional WP6 detail fields (BookingDetailResponse) - only present when
    # the caller's SELECT actually included them (see get_by_tracking_code /
    # get_detail_by_id), same conditional pattern as map_availability_block's
    # is_reserved handling.
    if "hora_fin" in row:
        result["end_time"] = row["hora_fin"]
    if "nombre_localidad" in row:
        result["location_name"] = row["nombre_localidad"]
    if "nota_cliente" in row:
        result["customer_notes"] = row["nota_cliente"]
    return result
