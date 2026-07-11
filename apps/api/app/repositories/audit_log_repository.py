from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class AuditLogRepository:
    """registros (audit trail). Rows are written by the SPs themselves;
    this repository is read-only from the API side."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def list_by_tenant(self, tenant_id: int, *, page: int, page_size: int) -> list[dict[str, Any]]:
        sql = (
            "SELECT * FROM registros WHERE dominio_id = ? ORDER BY creado_en DESC "
            "OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        )
        return query_view(self._conn, sql, [tenant_id, (page - 1) * page_size, page_size])
