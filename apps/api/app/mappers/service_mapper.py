"""Row from `servicios` / vw_servicios_publicos -> Service contract.

Matches apps/frontend/types/service.ts:
    { serviceId, name, description, durationMinutes, price?, showPrice }
"""

from __future__ import annotations

from typing import Any


def map_service(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "service_id": row["servicio_id"],
        "name": row["nombre"],
        "description": row.get("descripcion"),
        "duration_minutes": row["duracion_minutos"],
        "price": row.get("precio"),
        "show_price": bool(row["mostrar_precio"]),
    }


def map_service_category(row: dict[str, Any]) -> dict[str, Any]:
    """Row from `categorias_servicios` -> ServiceCategory-shaped dict.

    WP7b correction: the WP5 stub assumed the PK/active-flag columns were
    named `categoria_servicio_id`/`esta_activo`. Per the real DDL
    (database/scripts/02-create-tables.sql) and docs/rename-map.csv the
    columns are `categoria_id`/`activo` - the old names do not exist on
    `categorias_servicios` and would fail at the ODBC layer.
    """
    return {
        "category_id": row["categoria_id"],
        "name": row["nombre"],
        "description": row.get("descripcion"),
        "is_active": bool(row["activo"]),
    }
