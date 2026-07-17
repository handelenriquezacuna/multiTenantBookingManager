"""Row from `clientes` -> Customer contract.

Matches apps/frontend/types/customer.ts:
    { customerId, firstName, lastName, email, phone }

Spanish naming convention (two surnames): nombre + apellido_1 (+ apellido_2
opcional). Contract rule (fixed by the WP5 brief):
    firstName = nombre
    lastName  = apellido_1                      if apellido_2 is NULL/empty
              = f"{apellido_1} {apellido_2}"     otherwise

WP7b correction: the real `clientes` email column is `correo` (see
docs/rename-map.csv) - the WP5 stub read `row["email"]`, which does not
exist on a raw `clientes`/`vw_historial_reservaciones_cliente` row and would
KeyError against the real database.
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
        "email": row["correo"],
        "phone": row["telefono"],
        "notes": row.get("notas"),
    }
