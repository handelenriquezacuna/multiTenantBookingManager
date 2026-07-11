"""Superadmin-only tenant management (endpoints.admin.* in the frontend)."""

from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.common import PageResponse
from app.schemas.tenant import TenantCreateRequest, TenantResponse

router = APIRouter(prefix="/admin/tenants", tags=["admin"])


@router.get("", response_model=PageResponse[TenantResponse])
def list_tenants(page: int = 1, page_size: int = 20) -> PageResponse[TenantResponse]:
    not_implemented()


@router.post("", response_model=TenantResponse)
def create_tenant(payload: TenantCreateRequest) -> TenantResponse:
    not_implemented()


@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: int) -> TenantResponse:
    not_implemented()


@router.post("/{tenant_id}/activate", response_model=TenantResponse)
def activate_tenant(tenant_id: int) -> TenantResponse:
    not_implemented()


@router.post("/{tenant_id}/suspend", response_model=TenantResponse)
def suspend_tenant(tenant_id: int) -> TenantResponse:
    not_implemented()
