from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class BusinessTypeRepository:
    """tipos_negocios (read-only catalog)."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def list_business_types(self) -> list[dict[str, Any]]:
        """WP7a correction: the column is `activo` (rename-map row 6), not
        `esta_activo` - the WP5 stub's WHERE clause referenced a column that
        does not exist on this table."""
        sql = (
            "SELECT tipo_negocio_id, nombre, descripcion, activo "
            "FROM tipos_negocios WHERE activo = 1 ORDER BY nombre"
        )
        return query_view(self._conn, sql, label="tipos_negocios")
