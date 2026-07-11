from __future__ import annotations

from datetime import date, time
from typing import Any

from app.repositories.booking_repository import BookingRepository


class BookingService:
    """Covers /bookings, the public booking creation flow, and /track."""

    def __init__(self, repo: BookingRepository) -> None:
        self._repo = repo

    def create(self, **fields: Any) -> dict:
        return self._repo.create(**fields)

    def confirm(self, tenant_id: int, booking_id: int) -> dict:
        return self._repo.confirm(tenant_id, booking_id)

    def cancel(self, tenant_id: int, booking_id: int) -> dict:
        return self._repo.cancel(tenant_id, booking_id)

    def reschedule(
        self,
        tenant_id: int,
        booking_id: int,
        *,
        availability_block_id: int,
        booking_date: date,
        start_time: time,
    ) -> dict:
        return self._repo.reschedule(
            tenant_id,
            booking_id,
            availability_block_id=availability_block_id,
            booking_date=booking_date,
            start_time=start_time,
        )

    def complete(self, tenant_id: int, booking_id: int) -> dict:
        return self._repo.complete(tenant_id, booking_id)

    def get(self, tenant_id: int, booking_id: int) -> dict | None:
        return self._repo.get_by_id(tenant_id, booking_id)

    def list_bookings(self, tenant_id: int) -> list[dict]:
        return self._repo.list_by_tenant(tenant_id)

    def get_by_tracking_code(self, tracking_code: str) -> dict | None:
        return self._repo.get_by_tracking_code(tracking_code)
