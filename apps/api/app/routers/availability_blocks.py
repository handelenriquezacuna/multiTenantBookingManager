from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.availability import AvailabilityBlockCreateRequest, AvailabilityBlockResponse

router = APIRouter(prefix="/availability-blocks", tags=["availability-blocks"])


@router.get("", response_model=list[AvailabilityBlockResponse])
def list_availability_blocks(location_id: int, block_date: date) -> list[AvailabilityBlockResponse]:
    not_implemented()


@router.post("", response_model=AvailabilityBlockResponse)
def create_availability_block(
    payload: AvailabilityBlockCreateRequest,
) -> AvailabilityBlockResponse:
    not_implemented()


@router.get("/{availability_block_id}", response_model=AvailabilityBlockResponse)
def get_availability_block(availability_block_id: int) -> AvailabilityBlockResponse:
    not_implemented()


@router.delete("/{availability_block_id}")
def delete_availability_block(availability_block_id: int) -> dict[str, str]:
    not_implemented()
