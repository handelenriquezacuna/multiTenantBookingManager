from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class ServiceCategoryRepository:
    """categorias_servicios. No stored procedure exists for this table (see
    docs/sql-signatures.md) - every write here is a direct parameterized
    statement, per the WP7b brief."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(self, *, tenant_id: int, name: str, description: str | None) -> dict[str, Any]:
        sql = (
            "INSERT INTO categorias_servicios (dominio_id, nombre, descripcion) "
            "OUTPUT INSERTED.* VALUES (?, ?, ?)"
        )
        rows = query_view(self._conn, sql, [tenant_id, name, description])
        self._conn.commit()
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, category_id: int) -> dict[str, Any] | None:
        """WP7b correction: the real primary key is `categoria_id` (the WP5
        stub used the non-existent `categoria_servicio_id` - see
        docs/rename-map.csv). No `activo` filter here (unlike
        list_by_tenant): a soft-deleted category must still be readable by
        id so PATCH/GET can confirm the delete."""
        sql = "SELECT * FROM categorias_servicios WHERE dominio_id = ? AND categoria_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, category_id])
        return rows[0] if rows else None

    def list_by_tenant(
        self, tenant_id: int, *, page: int, page_size: int
    ) -> tuple[list[dict[str, Any]], int]:
        total_rows = query_view(
            self._conn,
            "SELECT COUNT(*) AS total FROM categorias_servicios WHERE dominio_id = ? AND activo = 1",
            [tenant_id],
        )
        total = int(total_rows[0]["total"]) if total_rows else 0
        sql = (
            "SELECT * FROM categorias_servicios WHERE dominio_id = ? AND activo = 1 "
            "ORDER BY nombre, categoria_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        )
        rows = query_view(self._conn, sql, [tenant_id, (page - 1) * page_size, page_size])
        return rows, total

    def update(
        self,
        tenant_id: int,
        category_id: int,
        *,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
    ) -> dict[str, Any] | None:
        """PATCH /service-categories/{id} and the soft DELETE (is_active=False)
        both go through this one dynamic UPDATE - same COALESCE-by-omission
        pattern as app.repositories.tenant_repository.update_tenant."""
        columns: dict[str, Any] = {}
        if name is not None:
            columns["nombre"] = name
        if description is not None:
            columns["descripcion"] = description
        if is_active is not None:
            columns["activo"] = is_active

        if columns:
            set_clause = ", ".join(f"{column} = ?" for column in columns)
            sql = (
                f"UPDATE categorias_servicios SET {set_clause}, actualizado_en = SYSUTCDATETIME() "
                "WHERE dominio_id = ? AND categoria_id = ?"
            )
            cursor = self._conn.cursor()
            try:
                cursor.execute(sql, [*columns.values(), tenant_id, category_id])
                self._conn.commit()
            except Exception:
                self._conn.rollback()
                raise
            finally:
                cursor.close()

        return self.get_by_id(tenant_id, category_id)
