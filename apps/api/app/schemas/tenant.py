"""Matches apps/frontend/types/tenant.ts."""

from __future__ import annotations

from app.schemas.common import CamelModel


class TenantResponse(CamelModel):
    tenant_id: int
    slug: str
    name: str
    description: str | None = None
    public_message: str | None = None


class TenantCreateRequest(CamelModel):
    name: str
    slug: str
    business_type_id: int
    email: str
    phone: str | None = None
    description: str | None = None
    public_message: str | None = None


class TenantUpdateRequest(CamelModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    description: str | None = None
    public_message: str | None = None
