"""Business-hours schemas (horarios). No dedicated frontend/types file yet."""

from __future__ import annotations

from datetime import time

from app.schemas.common import CamelModel


class BusinessHourResponse(CamelModel):
    business_hour_id: int
    location_id: int
    day_of_week: int
    open_time: time | None = None
    close_time: time | None = None
    is_closed: bool = False


class BusinessHourUpsertRequest(CamelModel):
    location_id: int
    day_of_week: int
    open_time: time | None = None
    close_time: time | None = None
    is_closed: bool = False
