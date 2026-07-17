from __future__ import annotations

from typing import Any

import pyodbc

from app.db import exec_sp_output, query_view


class TenantOwnerRepository:
    """duenos_de_dominios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create_owner(
        self,
        *,
        tenant_id: int,
        first_name: str,
        last_name_1: str,
        last_name_2: str | None,
        email: str,
        password_hash: str,
        phone: str | None,
    ) -> int:
        """WP7a correction: sp_crear_dueno reports the new id via
        `@dueno_id OUTPUT` only (no final SELECT - docs/sql-signatures.md
        #2), so this must go through exec_sp_output (plain exec_sp has no
        way to read an OUTPUT param back). The WP6 stub also used
        non-existent parameter names (`nombre_completo`/`email`/
        `hash_contrasena`) instead of the real
        nombre/apellido_1/apellido_2/correo/contrasena_encriptada/telefono.
        Returns the new dueno_id.
        """
        return exec_sp_output(
            self._conn,
            "sp_crear_dueno",
            {
                "dominio_id": tenant_id,
                "nombre": first_name,
                "apellido_1": last_name_1,
                "apellido_2": last_name_2,
                "correo": email,
                "contrasena_encriptada": password_hash,
                "telefono": phone,
            },
            output_param="dueno_id",
        )

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        sql = "SELECT * FROM duenos_de_dominios WHERE correo = ?"
        rows = query_view(self._conn, sql, [email], label="duenos_de_dominios")
        return rows[0] if rows else None

    def get_by_id(self, owner_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM duenos_de_dominios WHERE dueno_id = ?"
        rows = query_view(self._conn, sql, [owner_id], label="duenos_de_dominios")
        return rows[0] if rows else None
