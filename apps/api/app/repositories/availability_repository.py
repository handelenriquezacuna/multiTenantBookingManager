from __future__ import annotations

from datetime import date, datetime, time
from typing import Any

import pyodbc

from app.db import exec_sp_output, query_view


class AvailabilityRepository:
    """bloques_de_disponibilidad / vw_estado_disponibilidad."""

    def __init__(self, conn: pyodbc.Connection) -> None:
        self._conn = conn

    def create_block(
        self,
        *,
        tenant_id: int,
        location_id: int,
        block_date: date,
        start_time: time,
        end_time: time,
    ) -> int:
        """Correction (WP6): sp_crear_bloque_disponibilidad's parameters are
        `@fecha_de_bloque` / `@fecha_inicio` / `@fecha_final` (the latter two
        full DATETIME2, combining block_date with start/end_time), and it
        reports the new id via `@bloque_id OUTPUT` - see
        docs/sql-signatures.md #1. The WP5 stub used non-existent parameter
        names (`fecha_bloque`/`hora_inicio`/`hora_fin`) and never retrieved
        the OUTPUT value at all (exec_sp cannot - see app.db.exec_sp_output).
        Returns the new `bloque_id` (previously returned an always-empty
        dict). Used by /public and /track only indirectly, as the fixture
        that creates availability blocks for the integration tests.
        """
        start_dt = datetime.combine(block_date, start_time)
        end_dt = datetime.combine(block_date, end_time)
        return exec_sp_output(
            self._conn,
            "sp_crear_bloque_disponibilidad",
            {
                "dominio_id": tenant_id,
                "localidad_id": location_id,
                "fecha_de_bloque": block_date,
                "fecha_inicio": start_dt,
                "fecha_final": end_dt,
            },
            output_param="bloque_id",
        )

    def list_status(
        self, tenant_id: int, location_id: int, block_date: date
    ) -> list[dict[str, Any]]:
        """Owner/admin availability view (WP7 scope - not used by
        /public or /track). Left as a `SELECT *` pass-through; only the
        WHERE clause's `fecha_de_bloque` column name (previously
        `fecha_bloque`, which does not exist on the view) is fixed here so
        this at least runs, since it lives in the same file as list_public.
        """
        sql = (
            "SELECT * FROM vw_estado_disponibilidad "
            "WHERE dominio_id = ? AND localidad_id = ? AND fecha_de_bloque = ?"
        )
        return query_view(
            self._conn,
            sql,
            [tenant_id, location_id, block_date],
            label="vw_estado_disponibilidad",
        )

    def list_public(
        self,
        slug: str,
        *,
        block_date: date | None = None,
        location_id: int | None = None,
    ) -> list[dict[str, Any]]:
        """GET /public/{slug}/availability (WP6). Correction: the WP5 stub
        filtered on `slug`/`fecha_bloque` - vw_estado_disponibilidad has
        neither column (the real names are `dominio_slug`/`fecha_de_bloque`,
        docs/sql-signatures.md #2) - and never restricted to free blocks.
        Rewritten to require `bloque_activo = 1 AND reservado = 0` (the WP6
        brief's criterion for "available"), apply the optional date/location
        filters, and alias the view's real columns into the intermediate row
        shape app.mappers.availability_mapper.map_availability_block expects
        (bloque_disponibilidad_id/fecha_bloque/hora_inicio/hora_fin/
        esta_reservado - locked by tests/unit/test_mappers.py). Since this
        query already filters reservado = 0, `esta_reservado` always comes
        back 0/false here, which is exactly the "isReserved siempre false
        aqui" rule from the WP6 brief.
        """
        conditions = ["dominio_slug = ?", "bloque_activo = 1", "reservado = 0"]
        params: list[Any] = [slug]
        if block_date is not None:
            conditions.append("fecha_de_bloque = ?")
            params.append(block_date)
        if location_id is not None:
            conditions.append("localidad_id = ?")
            params.append(location_id)

        sql = (
            "SELECT "
            "bloque_id AS bloque_disponibilidad_id, "
            "CAST(fecha_de_bloque AS DATE) AS fecha_bloque, "
            "CAST(fecha_inicio AS TIME) AS hora_inicio, "
            "CAST(fecha_final AS TIME) AS hora_fin, "
            "reservado AS esta_reservado "
            "FROM vw_estado_disponibilidad "
            "WHERE " + " AND ".join(conditions) + " "
            "ORDER BY fecha_de_bloque, fecha_inicio"
        )
        return query_view(self._conn, sql, params, label="vw_estado_disponibilidad")
