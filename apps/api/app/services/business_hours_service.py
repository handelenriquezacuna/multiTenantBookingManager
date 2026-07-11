from __future__ import annotations

from typing import Any

from app.repositories.business_hours_repository import BusinessHoursRepository


class BusinessHoursService:
    def __init__(self, repo: BusinessHoursRepository) -> None:
        self._repo = repo

    def upsert(self, **fields: Any) -> dict:
        return self._repo.upsert(**fields)

    def list_by_location(self, tenant_id: int, location_id: int) -> list[dict]:
        return self._repo.list_by_location(tenant_id, location_id)
