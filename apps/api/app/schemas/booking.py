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


class BookingDetailResponse(BookingResponse):
    """Superset of BookingResponse used by the WP6 public/track endpoints
    ("Booking camelCase + campos de detalle utiles" per the WP6 brief).
    Extra fields are optional and only set when the repository row actually
    carries them (see app.mappers.booking_mapper.map_booking_detail) - never
    includes nota_interna (internal/business-only note)."""

    end_time: time | None = None
    location_name: str | None = None
    customer_notes: str | None = None


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


class BookingCustomerContact(CamelModel):
    """Nested `customer` object of PublicBookingCreateRequest - the public
    flow never has a pre-existing customer_id, only contact info."""

    first_name: str
    last_name: str
    email: str
    phone: str


class PublicBookingCreateRequest(CamelModel):
    """POST /public/{slug}/bookings body, per the WP6 brief."""

    service_id: int
    location_id: int
    availability_block_id: int
    customer: BookingCustomerContact
    customer_notes: str | None = None


class TrackRescheduleRequest(CamelModel):
    """POST /track/{code}/reschedule body: `{ newAvailabilityBlockId }`."""

    new_availability_block_id: int
