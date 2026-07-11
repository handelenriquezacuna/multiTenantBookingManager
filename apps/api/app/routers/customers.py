from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.booking import BookingResponse
from app.schemas.customer import CustomerCreateRequest, CustomerResponse

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=list[CustomerResponse])
def list_customers() -> list[CustomerResponse]:
    not_implemented()


@router.post("", response_model=CustomerResponse)
def create_customer(payload: CustomerCreateRequest) -> CustomerResponse:
    not_implemented()


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int) -> CustomerResponse:
    not_implemented()


@router.get("/{customer_id}/bookings", response_model=list[BookingResponse])
def get_customer_bookings(customer_id: int) -> list[BookingResponse]:
    not_implemented()
