from __future__ import annotations

from typing import Any

import pyodbc

from app.db import query_view


class AuditLogRepository:
    """registros (audit trail). Rows are written by the SPs' triggers
    (trg_reservaciones_auditar_insert/update); this repository is read-only
    from the API side.

    WP7b correction: GET /audit-logs is superadmin-scoped, not tenant-scoped
    (the WP5 stub assumed a single tenant_id filter) - both `tenantId` and
    `action` are optional filters per the WP7b brief."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def list_logs(
        self,
        *,
        tenant_id: int | None = None,
        action: str | None = None,
        page: int,
        page_size: int,
    ) -> tuple[list[dict[str, Any]], int]:
        conditions: list[str] = []
        params: list[Any] = []
        if tenant_id is not None:
            conditions.append("dominio_id = ?")
            params.append(tenant_id)
        if action is not None:
            conditions.append("accion = ?")
            params.append(action)
        where = f" WHERE {' AND '.join(conditions)}" if conditions else ""

        total_rows = query_view(
            self._conn, f"SELECT COUNT(*) AS total FROM registros{where}", params
        )
        total = int(total_rows[0]["total"]) if total_rows else 0

        # registro_id DESC as tiebreaker: seed rows share creado_en
        # timestamps, and OFFSET/FETCH pagination needs a total order.
        sql = (
            f"SELECT * FROM registros{where} ORDER BY creado_en DESC, registro_id DESC "
            "OFFSET ? ROWS FETCH NEXT ? ROWS ONLY"
        )
        rows = query_view(self._conn, sql, [*params, (page - 1) * page_size, page_size])
        return rows, total
