from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.booking import BookingCreateRequest, BookingRescheduleRequest, BookingResponse

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=list[BookingResponse])
def list_bookings() -> list[BookingResponse]:
    not_implemented()


@router.post("", response_model=BookingResponse)
def create_booking(payload: BookingCreateRequest) -> BookingResponse:
    not_implemented()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int) -> BookingResponse:
    not_implemented()


@router.post("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking(booking_id: int) -> BookingResponse:
    not_implemented()


@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(booking_id: int) -> BookingResponse:
    not_implemented()


@router.post("/{booking_id}/complete", response_model=BookingResponse)
def complete_booking(booking_id: int) -> BookingResponse:
    not_implemented()


@router.post("/{booking_id}/reschedule", response_model=BookingResponse)
def reschedule_booking(booking_id: int, payload: BookingRescheduleRequest) -> BookingResponse:
    not_implemented()
