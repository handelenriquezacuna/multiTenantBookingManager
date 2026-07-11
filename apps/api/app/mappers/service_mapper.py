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
    """Row from `categorias_servicios` -> ServiceCategory-shaped dict."""
    return {
        "category_id": row["categoria_servicio_id"],
        "name": row["nombre"],
        "description": row.get("descripcion"),
        "is_active": bool(row["esta_activo"]),
    }
