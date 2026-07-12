"""GET /business-types (WP7a). No frontend type file exists yet for this
catalog - apps/frontend/lib/endpoints.ts only defines the path
(`businessTypes: "/business-types"`); the shape below is the one requested
by the WP7a brief: {businessTypeId, name, description}."""

from __future__ import annotations

from app.schemas.common import CamelModel


class BusinessTypeResponse(CamelModel):
    business_type_id: int
    name: str
    description: str | None = None
