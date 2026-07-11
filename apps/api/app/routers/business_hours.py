from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.hours import BusinessHourResponse, BusinessHourUpsertRequest

router = APIRouter(prefix="/business-hours", tags=["business-hours"])


@router.get("", response_model=list[BusinessHourResponse])
def list_business_hours(location_id: int) -> list[BusinessHourResponse]:
    not_implemented()


@router.put("", response_model=BusinessHourResponse)
def upsert_business_hours(payload: BusinessHourUpsertRequest) -> BusinessHourResponse:
    not_implemented()
