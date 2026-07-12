"""Row from `registros` -> AuditLog contract. Column names per
docs/rename-map.csv."""

from __future__ import annotations

from typing import Any


def map_audit_log(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "audit_id": row["registro_id"],
        "tenant_id": row.get("dominio_id"),
        "owner_id": row.get("dueno_id"),
        "superadmin_id": row.get("superadmin_id"),
        "action": row["accion"],
        "entity_name": row["nombre_entidad"],
        "entity_id": row["entidad_id"],
        "old_value": row.get("valor_anterior"),
        "new_value": row.get("nuevo_valor"),
        "created_at": row["creado_en"],
    }
