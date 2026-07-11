from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.location import LocationCreateRequest, LocationResponse, LocationUpdateRequest

router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("", response_model=list[LocationResponse])
def list_locations() -> list[LocationResponse]:
    not_implemented()


@router.post("", response_model=LocationResponse)
def create_location(payload: LocationCreateRequest) -> LocationResponse:
    not_implemented()


@router.get("/{location_id}", response_model=LocationResponse)
def get_location(location_id: int) -> LocationResponse:
    not_implemented()


@router.put("/{location_id}", response_model=LocationResponse)
def update_location(location_id: int, payload: LocationUpdateRequest) -> LocationResponse:
    not_implemented()


@router.delete("/{location_id}")
def delete_location(location_id: int) -> dict[str, str]:
    not_implemented()
