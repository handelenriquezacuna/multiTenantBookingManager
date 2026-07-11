from __future__ import annotations

from datetime import date
from typing import Any

from app.repositories.availability_repository import AvailabilityRepository


class AvailabilityService:
    def __init__(self, repo: AvailabilityRepository) -> None:
        self._repo = repo

    def create_block(self, **fields: Any) -> dict:
        return self._repo.create_block(**fields)

    def list_status(self, tenant_id: int, location_id: int, block_date: date) -> list[dict]:
        return self._repo.list_status(tenant_id, location_id, block_date)

    def list_public(self, slug: str, block_date: date) -> list[dict]:
        return self._repo.list_public(slug, block_date)
