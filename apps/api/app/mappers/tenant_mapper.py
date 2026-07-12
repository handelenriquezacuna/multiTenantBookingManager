"""Row from `dominios` -> Tenant contract.

Matches apps/frontend/types/tenant.ts:
    { tenantId, slug, name, description, publicMessage }

WP7a addition: GET/PATCH /tenant/current select the full `dominios` row
(including correo/telefono/logo_url), unlike the WP6 public endpoint's
narrower SELECT - when those columns are present in the input row they are
surfaced too, as email/phone/logoUrl. This is intentionally conditional (only
added when the key is present) so the WP6 shape - and
tests/unit/test_mappers.py::test_map_tenant, which asserts exact dict
equality on a row without those keys - keeps passing unmodified.
"""

from __future__ import annotations

from typing import Any


def map_tenant(row: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {
        "tenant_id": row["dominio_id"],
        "slug": row["slug"],
        "name": row["nombre"],
        "description": row.get("descripcion"),
        "public_message": row.get("mensaje_publico"),
    }
    if "correo" in row:
        result["email"] = row["correo"]
    if "telefono" in row:
        result["phone"] = row["telefono"]
    if "logo_url" in row:
        result["logo_url"] = row["logo_url"]
    return result
