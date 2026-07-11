"""Row from `clientes` -> Customer contract.

Matches apps/frontend/types/customer.ts:
    { customerId, firstName, lastName, email, phone }

Spanish naming convention (two surnames): nombre + apellido_1 (+ apellido_2
opcional). Contract rule (fixed by the WP5 brief):
    firstName = nombre
    lastName  = apellido_1                      if apellido_2 is NULL/empty
              = f"{apellido_1} {apellido_2}"     otherwise
"""

from __future__ import annotations

from typing import Any


def _combine_last_name(apellido_1: str, apellido_2: str | None) -> str:
    if apellido_2:
        return f"{apellido_1} {apellido_2}"
    return apellido_1


def map_customer(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "customer_id": row["cliente_id"],
        "first_name": row["nombre"],
        "last_name": _combine_last_name(row["apellido_1"], row.get("apellido_2")),
        "email": row["email"],
        "phone": row["telefono"],
    }
