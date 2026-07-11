"""Row from `dominios` -> Tenant contract.

Matches apps/frontend/types/tenant.ts:
    { tenantId, slug, name, description, publicMessage }
"""

from __future__ import annotations

from typing import Any


def map_tenant(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "tenant_id": row["dominio_id"],
        "slug": row["slug"],
        "name": row["nombre"],
        "description": row.get("descripcion"),
        "public_message": row.get("mensaje_publico"),
    }
