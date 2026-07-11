from __future__ import annotations

from typing import Any

from app.repositories.tenant_repository import TenantRepository


class TenantService:
    """Pass-through orchestration for admin tenant CRUD, the owner's own
    tenant profile, and the public tenant lookup by slug."""

    def __init__(self, repo: TenantRepository) -> None:
        self._repo = repo

    def create_tenant(self, **fields: Any) -> dict:
        return self._repo.create_tenant(**fields)

    def get_tenant(self, tenant_id: int) -> dict | None:
        return self._repo.get_by_id(tenant_id)

    def get_tenant_by_slug(self, slug: str) -> dict | None:
        return self._repo.get_by_slug(slug)

    def list_tenants(self, *, page: int, page_size: int) -> list[dict]:
        return self._repo.list_tenants(page=page, page_size=page_size)

    def activate_tenant(self, tenant_id: int) -> dict:
        return self._repo.activate(tenant_id)

    def suspend_tenant(self, tenant_id: int) -> dict:
        return self._repo.suspend(tenant_id)
