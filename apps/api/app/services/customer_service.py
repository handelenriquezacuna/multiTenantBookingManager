from __future__ import annotations

from typing import Any

from app.repositories.customer_repository import CustomerRepository


class CustomerService:
    def __init__(self, repo: CustomerRepository) -> None:
        self._repo = repo

    def create(self, **fields: Any) -> dict:
        return self._repo.create(**fields)

    def get(self, tenant_id: int, customer_id: int) -> dict | None:
        return self._repo.get_by_id(tenant_id, customer_id)

    def list_customers(self, tenant_id: int) -> list[dict]:
        return self._repo.list_by_tenant(tenant_id)

    def booking_history(self, tenant_id: int, customer_id: int) -> list[dict]:
        return self._repo.booking_history(tenant_id, customer_id)
