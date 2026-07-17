"""Row from `bloques_de_disponibilidad` / vw_estado_disponibilidad ->
AvailabilityBlock contract.

Matches apps/frontend/types/availability.ts:
    { availabilityBlockId, blockDate, startTime, endTime, isReserved? }
"""

from __future__ import annotations

from typing import Any


def map_availability_block(row: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {
        "availability_block_id": row["bloque_disponibilidad_id"],
        "block_date": row["fecha_bloque"],
        "start_time": row["hora_inicio"],
        "end_time": row["hora_fin"],
    }
    if "esta_reservado" in row:
        result["is_reserved"] = bool(row["esta_reservado"])
    return result
