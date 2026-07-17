from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class LocationRepository:
    """localidades. No stored procedure exists for this table - every write
    here is a direct parameterized statement, per the WP7b brief."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create(
        self, *, tenant_id: int, name: str, address: str, phone: str | None, is_main: bool
    ) -> dict[str, Any]:
        """WP7b correction: the real column is `principal` (the WP5 stub
        wrote `es_principal`, which does not exist - see
        docs/rename-map.csv)."""
        sql = (
            "INSERT INTO localidades (dominio_id, nombre, direccion, telefono, principal) "
            "OUTPUT INSERTED.* VALUES (?, ?, ?, ?, ?)"
        )
        rows = query_view(self._conn, sql, [tenant_id, name, address, phone, is_main])
        self._conn.commit()
        return rows[0] if rows else {}

    def get_by_id(self, tenant_id: int, location_id: int) -> dict[str, Any] | None:
        sql = "SELECT * FROM localidades WHERE dominio_id = ? AND localidad_id = ?"
        rows = query_view(self._conn, sql, [tenant_id, location_id])
        return rows[0] if rows else None

    def list_by_tenant(
        self, tenant_id: int, *, page: int, page_size: int
    ) -> tuple[list[dict[str, Any]], int]:
        """WP7b correction: the real active-flag column is `activo` (the WP5
        stub filtered on the non-existent `esta_activo`)."""
        total_rows = query_view(
            self._conn,
            "SELECT COUNT(*) AS total FROM localidades WHERE dominio_id = ? AND activo = 1",
            [tenant_id],
        )
        total = int(total_rows[0]["total"]) if total_rows else 0
        sql = (
            "SELECT * FROM localidades WHERE dominio_id = ? AND activo = 1 "
            "ORDER BY nombre, localidad_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        )
        rows = query_view(self._conn, sql, [tenant_id, (page - 1) * page_size, page_size])
        return rows, total

    def update(
        self,
        tenant_id: int,
        location_id: int,
        *,
        name: str | None = None,
        address: str | None = None,
        phone: str | None = None,
        is_main: bool | None = None,
        is_active: bool | None = None,
    ) -> dict[str, Any] | None:
        """PATCH /locations/{id} and the soft DELETE (is_active=False) both
        go through this dynamic UPDATE - same COALESCE-by-omission pattern
        as app.repositories.tenant_repository.update_tenant."""
        columns: dict[str, Any] = {}
        if name is not None:
            columns["nombre"] = name
        if address is not None:
            columns["direccion"] = address
        if phone is not None:
            columns["telefono"] = phone
        if is_main is not None:
            columns["principal"] = is_main
        if is_active is not None:
            columns["activo"] = is_active

        if columns:
            set_clause = ", ".join(f"{column} = ?" for column in columns)
            sql = (
                f"UPDATE localidades SET {set_clause}, actualizado_en = SYSUTCDATETIME() "
                "WHERE dominio_id = ? AND localidad_id = ?"
            )
            cursor = self._conn.cursor()
            try:
                cursor.execute(sql, [*columns.values(), tenant_id, location_id])
                self._conn.commit()
            except Exception:
                self._conn.rollback()
                raise
            finally:
                cursor.close()

        return self.get_by_id(tenant_id, location_id)
