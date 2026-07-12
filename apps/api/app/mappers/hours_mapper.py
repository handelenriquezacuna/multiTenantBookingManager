"""Row from `horarios` -> BusinessHour contract.

Column names per docs/rename-map.csv: horario_id/localidad_id/dia_semana/
hora_apertura/hora_cerrado/cerrado (note: `hora_cerrado`, not `hora_cierre`,
and `cerrado`, not `esta_cerrado` - the closing-time column and the
closed-flag column, respectively).
"""

from __future__ import annotations

from typing import Any


def map_business_hour(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "business_hour_id": row["horario_id"],
        "location_id": row["localidad_id"],
        "day_of_week": row["dia_semana"],
        "open_time": row.get("hora_apertura"),
        "close_time": row.get("hora_cerrado"),
        "is_closed": bool(row["cerrado"]),
    }
