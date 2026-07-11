from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class BusinessTypeRepository:
    """tipos_negocios (read-only catalog)."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def list_business_types(self) -> list[dict[str, Any]]:
        sql = (
            "SELECT tipo_negocio_id, nombre, descripcion, esta_activo "
            "FROM tipos_negocios WHERE esta_activo = 1 ORDER BY nombre"
        )
        return query_view(self._conn, sql)
