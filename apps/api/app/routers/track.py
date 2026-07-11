"""Tracking-code self-service (endpoints.track.*): customers manage their own
booking without an account, using the tracking code as the credential."""

from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.booking import BookingRescheduleRequest, BookingResponse

router = APIRouter(prefix="/track", tags=["track"])


@router.get("/{code}", response_model=BookingResponse)
def get_by_tracking_code(code: str) -> BookingResponse:
    not_implemented()


@router.post("/{code}/cancel", response_model=BookingResponse)
def cancel_by_tracking_code(code: str) -> BookingResponse:
    not_implemented()


@router.post("/{code}/reschedule", response_model=BookingResponse)
def reschedule_by_tracking_code(code: str, payload: BookingRescheduleRequest) -> BookingResponse:
    not_implemented()
