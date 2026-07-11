from __future__ import annotations

from typing import Any

import pyodbc

from app.db import exec_sp, query_view


class TenantRepository:
    """dominios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create_tenant(
        self,
        *,
        name: str,
        slug: str,
        business_type_id: int,
        email: str,
        phone: str | None,
        description: str | None,
        public_message: str | None,
    ) -> dict[str, Any]:
        rows = exec_sp(
            self._conn,
            "sp_crear_dominio",
            {
                "nombre": name,
                "slug": slug,
                "tipo_negocio_id": business_type_id,
                "email": email,
                "telefono": phone,
                "descripcion": description,
                "mensaje_publico": public_message,
            },
        )
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM dominios WHERE dominio_id = ?"
        rows = query_view(self._conn, sql, [tenant_id])
        return rows[0] if rows else None

    def get_by_slug(self, slug: str) -> dict[str, Any] | None:
        sql = "SELECT * FROM dominios WHERE slug = ?"
        rows = query_view(self._conn, sql, [slug])
        return rows[0] if rows else None

    def list_tenants(self, *, page: int, page_size: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM dominios ORDER BY dominio_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        return query_view(self._conn, sql, [(page - 1) * page_size, page_size])

    def activate(self, tenant_id: int) -> dict[str, Any]:
        rows = exec_sp(self._conn, "sp_activar_dominio", {"dominio_id": tenant_id})
        return rows[0] if rows else {}

    def suspend(self, tenant_id: int) -> dict[str, Any]:
        rows = exec_sp(self._conn, "sp_suspender_dominio", {"dominio_id": tenant_id})
        return rows[0] if rows else {}
