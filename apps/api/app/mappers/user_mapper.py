"""Row from `duenos_de_dominios` / `superadmins` -> the `user` object
embedded in every /auth/* response (app.schemas.auth.UserResponse).

Spanish naming convention (two surnames): nombre + apellido_1 (+ apellido_2
opcional) - same combining rule as app.mappers.customer_mapper:
    firstName = nombre
    lastName  = apellido_1                      if apellido_2 is NULL/empty
              = f"{apellido_1} {apellido_2}"     otherwise

Kept as two small, independent functions (rather than reusing
customer_mapper's helper) so this module has no coupling to the customer
domain - consistent with how booking_mapper/service_mapper each stay
self-contained in this codebase.
"""

from __future__ import annotations

from typing import Any


def _combine_last_name(apellido_1: str, apellido_2: str | None) -> str:
    if apellido_2:
        return f"{apellido_1} {apellido_2}"
    return apellido_1


def map_owner_user(row: dict[str, Any]) -> dict[str, Any]:
    """row: a duenos_de_dominios record (must include dueno_id/dominio_id)."""
    return {
        "id": row["dueno_id"],
        "first_name": row["nombre"],
        "last_name": _combine_last_name(row["apellido_1"], row.get("apellido_2")),
        "email": row["correo"],
        "role": "owner",
        "tenant_id": row["dominio_id"],
    }


def map_superadmin_user(row: dict[str, Any]) -> dict[str, Any]:
    """row: a superadmins record (must include superadmin_id)."""
    return {
        "id": row["superadmin_id"],
        "first_name": row["nombre"],
        "last_name": _combine_last_name(row["apellido_1"], row.get("apellido_2")),
        "email": row["correo"],
        "role": "superadmin",
        "tenant_id": None,
    }
