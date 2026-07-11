from __future__ import annotations

from app.repositories.service_category_repository import ServiceCategoryRepository


class ServiceCategoryService:
    def __init__(self, repo: ServiceCategoryRepository) -> None:
        self._repo = repo

    def create(self, *, tenant_id: int, name: str, description: str | None) -> dict:
        return self._repo.create(tenant_id=tenant_id, name=name, description=description)

    def get(self, tenant_id: int, category_id: int) -> dict | None:
        return self._repo.get_by_id(tenant_id, category_id)

    def list_categories(self, tenant_id: int) -> list[dict]:
        return self._repo.list_by_tenant(tenant_id)
