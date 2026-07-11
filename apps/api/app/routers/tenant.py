"""The owner's own tenant profile (endpoints.tenant.current)."""

from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.tenant import TenantResponse, TenantUpdateRequest

router = APIRouter(prefix="/tenant", tags=["tenant"])


@router.get("/current", response_model=TenantResponse)
def get_current_tenant() -> TenantResponse:
    not_implemented()


@router.put("/current", response_model=TenantResponse)
def update_current_tenant(payload: TenantUpdateRequest) -> TenantResponse:
    not_implemented()
