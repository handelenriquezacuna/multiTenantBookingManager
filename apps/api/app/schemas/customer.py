"""Matches apps/frontend/types/customer.ts."""

from __future__ import annotations

from app.schemas.common import CamelModel


class CustomerResponse(CamelModel):
    customer_id: int
    first_name: str
    last_name: str
    email: str
    phone: str


class CustomerCreateRequest(CamelModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    notes: str | None = None
