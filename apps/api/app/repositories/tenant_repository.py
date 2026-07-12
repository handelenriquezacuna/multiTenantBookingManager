from __future__ import annotations

import logging
import time
from typing import Any

import pyodbc

from app.db import exec_sp, exec_sp_output, query_view

logger = logging.getLogger(__name__)


class TenantRepository:
    """dominios."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create_tenant(
        self,
        *,
        business_type_id: int,
        name: str,
        slug: str,
        email: str,
        phone: str | None,
        description: str | None,
        logo_url: str | None,
        public_message: str | None,
    ) -> int:
        """WP7a correction: sp_crear_dominio reports the new id via
        `@dominio_id OUTPUT` only (no final SELECT - docs/sql-signatures.md
        #1), so this must go through exec_sp_output (plain exec_sp cannot
        read an OUTPUT param back - it always returned `{}` here before).
        The WP5 stub's parameter names were also wrong (`email` instead of
        `correo`, and `logo_url` was missing entirely). Returns the new
        dominio_id; callers needing the full row should follow up with
        get_by_id (the SP always creates it in the 'pendiente' state).
        """
        return exec_sp_output(
            self._conn,
            "sp_crear_dominio",
            {
                "tipo_negocio_id": business_type_id,
                "nombre": name,
                "slug": slug,
                "correo": email,
                "telefono": phone,
                "descripcion": description,
                "logo_url": logo_url,
                "mensaje_publico": public_message,
            },
            output_param="dominio_id",
        )

    def get_by_id(self, tenant_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM dominios WHERE dominio_id = ?"
        rows = query_view(self._conn, sql, [tenant_id], label="dominios")
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

    def get_status(self, tenant_id: int) -> dict[str, Any] | None:
        """WP7a: POST /auth/login's owner-tenant-active check. Joins
        estados_dominios purely to surface a human-readable status name for
        a clear 403 detail; `esta_activo` reuses `dbo.fn_dominio_activo`
        (docs/sql-signatures.md #3) as the single source of truth for the
        actual pass/fail so the rule never drifts from the SQL definition.
        Returns None only if the tenant_id itself doesn't exist (shouldn't
        normally happen - it always comes from a JWT's tenantId claim)."""
        sql = (
            "SELECT d.dominio_id, ed.nombre AS estado_nombre, "
            "dbo.fn_dominio_activo(d.dominio_id) AS esta_activo "
            "FROM dominios d "
            "JOIN estados_dominios ed ON ed.dominio_estado_id = d.dominio_estado_id "
            "WHERE d.dominio_id = ?"
        )
        rows = query_view(self._conn, sql, [tenant_id], label="dominios+estados_dominios")
        return rows[0] if rows else None

    def list_tenants(self, *, page: int, page_size: int) -> list[dict[str, Any]]:
        sql = "SELECT * FROM dominios ORDER BY dominio_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        return query_view(self._conn, sql, [(page - 1) * page_size, page_size], label="dominios")

    def activate(self, tenant_id: int) -> dict[str, Any]:
        rows = exec_sp(self._conn, "sp_activar_dominio", {"dominio_id": tenant_id})
        return rows[0] if rows else {}

    def suspend(self, tenant_id: int) -> dict[str, Any]:
        rows = exec_sp(self._conn, "sp_suspender_dominio", {"dominio_id": tenant_id})
        return rows[0] if rows else {}

    def update_tenant(
        self,
        tenant_id: int,
        *,
        name: str | None = None,
        email: str | None = None,
        phone: str | None = None,
        description: str | None = None,
        logo_url: str | None = None,
        public_message: str | None = None,
    ) -> dict[str, Any] | None:
        """PATCH /tenant/current (WP7a). docs/sql-signatures.md lists only
        sp_crear_dominio / sp_activar_dominio / sp_suspender_dominio for
        `dominios` - there is no SP for a partial field update - so this
        issues a direct parameterized UPDATE, touching only the columns
        actually supplied (None means "leave unchanged", the same
        COALESCE-style contract sp_actualizar_servicio uses). Column names
        never come from user input, only fixed literals from this map, so
        this stays injection-safe despite being built dynamically.
        trg_dominios_actualizado_en keeps `actualizado_en` current on its
        own (docs/sql-signatures.md #4).
        """
        columns: dict[str, Any] = {}
        if name is not None:
            columns["nombre"] = name
        if email is not None:
            columns["correo"] = email
        if phone is not None:
            columns["telefono"] = phone
        if description is not None:
            columns["descripcion"] = description
        if logo_url is not None:
            columns["logo_url"] = logo_url
        if public_message is not None:
            columns["mensaje_publico"] = public_message

        if columns:
            set_clause = ", ".join(f"{column} = ?" for column in columns)
            sql = f"UPDATE dominios SET {set_clause} WHERE dominio_id = ?"
            cursor = self._conn.cursor()
            started = time.perf_counter()
            try:
                cursor.execute(sql, [*columns.values(), tenant_id])
                self._conn.commit()
                _log_write("UPDATE dominios", started, status="ok")
            except Exception:
                self._conn.rollback()
                _log_write("UPDATE dominios", started, status="error")
                raise
            finally:
                cursor.close()

        return self.get_by_id(tenant_id)


def _log_write(label: str, started: float, *, status: str) -> None:
    """Mirrors app.db._log_call's "sql call" log line for the one write this
    repository issues outside of exec_sp/exec_sp_output (there is no SP for
    it - see update_tenant)."""
    duration_ms = int((time.perf_counter() - started) * 1000)
    logger.info(
        "sql call",
        extra={"sp": label, "duration_ms": duration_ms, "status": status},
    )
