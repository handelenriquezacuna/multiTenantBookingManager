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
        rows = query_view(self._conn, sql, [slug], label="dominios")
        return rows[0] if rows else None

    def get_active_by_slug(self, slug: str) -> dict[str, Any] | None:
        """GET /public/{slug} (WP6): only returns a row when the tenant
        exists AND is active - `dbo.fn_dominio_activo` checks both
        `dominios.activo = 1` and `estados_dominios.nombre = 'activo'` (see
        docs/sql-signatures.md #3). Missing/inactive -> None -> 404 upstream.
        Column list matches app.mappers.tenant_mapper.map_tenant 1:1 (no
        aliasing needed - dominios' real column names already are
        dominio_id/slug/nombre/descripcion/mensaje_publico)."""
        sql = (
            "SELECT dominio_id, slug, nombre, descripcion, mensaje_publico "
            "FROM dominios d "
            "WHERE d.slug = ? AND dbo.fn_dominio_activo(d.dominio_id) = 1"
        )
        rows = query_view(self._conn, sql, [slug], label="dominios(fn_dominio_activo)")
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
