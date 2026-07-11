"""Read-only catalog (endpoints.businessTypes)."""

from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented

router = APIRouter(prefix="/business-types", tags=["business-types"])


@router.get("")
def list_business_types() -> list[dict]:
    not_implemented()
