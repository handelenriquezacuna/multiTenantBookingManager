"""Row from `tipos_negocios` -> GET /business-types contract
(app.schemas.business_type.BusinessTypeResponse)."""

from __future__ import annotations

from typing import Any


def map_business_type(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "business_type_id": row["tipo_negocio_id"],
        "name": row["nombre"],
        "description": row.get("descripcion"),
    }
