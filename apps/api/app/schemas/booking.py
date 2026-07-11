"""Matches apps/frontend/types/booking.ts."""

from __future__ import annotations

from datetime import date, time
from typing import Literal

from app.schemas.common import CamelModel

BookingStatus = Literal["pending", "confirmed", "cancelled", "completed", "rescheduled"]


class BookingResponse(CamelModel):
    booking_id: int
    customer_name: str
    service_name: str
    booking_date: date
    start_time: time
    status: BookingStatus
    tracking_code: str


class BookingCreateRequest(CamelModel):
    customer_id: int
    service_id: int
    location_id: int
    availability_block_id: int | None = None
    booking_date: date
    start_time: time
    customer_notes: str | None = None


class BookingRescheduleRequest(CamelModel):
    availability_block_id: int
    booking_date: date
    start_time: time
