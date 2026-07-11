"""Public, unauthenticated storefront endpoints (endpoints.public.*)."""

from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.availability import AvailabilityBlockResponse
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.schemas.service import ServiceResponse
from app.schemas.tenant import TenantResponse

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/{slug}", response_model=TenantResponse)
def get_public_tenant(slug: str) -> TenantResponse:
    not_implemented()


@router.get("/{slug}/services", response_model=list[ServiceResponse])
def get_public_services(slug: str) -> list[ServiceResponse]:
    not_implemented()


@router.get("/{slug}/availability", response_model=list[AvailabilityBlockResponse])
def get_public_availability(slug: str, block_date: date) -> list[AvailabilityBlockResponse]:
    not_implemented()


@router.post("/{slug}/bookings", response_model=BookingResponse)
def create_public_booking(slug: str, payload: BookingCreateRequest) -> BookingResponse:
    not_implemented()
