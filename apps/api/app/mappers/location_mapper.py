"""Row from `localidades` -> Location contract.

No dedicated frontend/types file yet (see app.schemas.location). Column
names per docs/rename-map.csv: localidad_id/nombre/direccion/telefono/
principal/activo.
"""

from __future__ import annotations

from typing import Any


def map_location(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "location_id": row["localidad_id"],
        "name": row["nombre"],
        "address": row["direccion"],
        "phone": row.get("telefono"),
        "is_main": bool(row["principal"]),
        "is_active": bool(row["activo"]),
    }
