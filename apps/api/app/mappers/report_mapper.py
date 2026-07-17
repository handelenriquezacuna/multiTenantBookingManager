"""Row from each WP3 reporting view -> its report schema contract (WP7b).
See docs/sql-signatures.md #2 for each view's exact column list."""

from __future__ import annotations

from typing import Any


def map_dashboard(row: dict[str, Any]) -> dict[str, Any]:
    """Row from vw_dashboard_dominio."""
    return {
        "tenant_id": row["dominio_id"],
        "name": row["nombre"],
        "total_bookings": row["total_reservaciones"],
        "pending_bookings": row["reservaciones_pendientes"],
        "confirmed_bookings": row["reservaciones_confirmadas"],
        "cancelled_bookings": row["reservaciones_canceladas"],
        "total_customers": row["total_clientes"],
        "total_active_services": row["total_servicios_activos"],
        "total_active_locations": row["total_localidades_activas"],
    }


def map_daily_agenda_item(row: dict[str, Any]) -> dict[str, Any]:
    """Row from vw_agenda_diaria. `fecha_inicio`/`fecha_final` come back from
    pyodbc as full `datetime.datetime` values (DATETIME2 columns) - `.time()`
    narrows them to the DailyAgendaItemResponse.start_time/end_time (`time`)
    contract."""
    return {
        "booking_date": row["fecha"],
        "start_time": row["fecha_inicio"].time(),
        "end_time": row["fecha_final"].time(),
        "service_name": row["servicio_nombre"],
        "customer_name": row["cliente_nombre"],
        "location_name": row["localidad_nombre"],
        "status": row["estado"],
    }


def map_service_demand(row: dict[str, Any]) -> dict[str, Any]:
    """Row from vw_demanda_servicios."""
    return {
        "service_id": row["servicio_id"],
        "service_name": row["servicio_nombre"],
        "total_bookings": row["total_reservaciones"],
        "last_booking_at": row.get("ultima_reserva"),
    }


def map_availability_status(row: dict[str, Any]) -> dict[str, Any]:
    """Row from vw_estado_disponibilidad. Same `.time()` narrowing as
    map_daily_agenda_item - see its docstring."""
    return {
        "availability_block_id": row["bloque_id"],
        "location_id": row["localidad_id"],
        "location_name": row["localidad_nombre"],
        "block_date": row["fecha_de_bloque"],
        "start_time": row["fecha_inicio"].time(),
        "end_time": row["fecha_final"].time(),
        "is_active": bool(row["bloque_activo"]),
        "is_reserved": bool(row["reservado"]),
        "booking_id": row.get("reserva_id"),
    }
