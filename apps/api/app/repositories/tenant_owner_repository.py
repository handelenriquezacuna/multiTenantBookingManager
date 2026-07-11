from __future__ import annotations

from typing import Any

import pyodbc

from app.db import exec_sp, query_view


class TenantOwnerRepository:
    """duenos_de_dominios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create_owner(
        self,
        *,
        tenant_id: int,
        full_name: str,
        email: str,
        password_hash: str,
        phone: str | None,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_crear_dueno",
            {
                "dominio_id": tenant_id,
                "nombre_completo": full_name,
                "email": email,
                "hash_contrasena": password_hash,
                "telefono": phone,
            },
        )
        return rows[0] if rows else {}

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        sql = "SELECT * FROM duenos_de_dominios WHERE email = ?"
        rows = query_view(self._conn, sql, [email])
        return rows[0] if rows else None
