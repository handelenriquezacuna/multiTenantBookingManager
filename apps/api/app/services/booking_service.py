from __future__ import annotations

from datetime import datetime
from typing import Any

from app.errors import InternalError, NotFoundError
from app.repositories.booking_repository import BookingRepository


def _split_last_name(last_name: str) -> tuple[str, str | None]:
    """Splits the frontend's single `lastName` field into the two Spanish
    surname columns sp_crear_reservacion/sp_crear_cliente expect
    (`apellido_1` required, `apellido_2` optional) - the inverse of
    app.mappers.customer_mapper's `_combine_last_name`."""
    parts = last_name.split(None, 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return last_name, None


class BookingService:
    """Covers /bookings (WP7, owner-authenticated), the public booking
    creation flow, and /track (both WP6)."""

    def __init__(self, repo: BookingRepository) -> None:
        self._repo = repo

    # -- WP7 admin flow - untouched pass-throughs (not used by public.py/track.py)
    def confirm(self, tenant_id: int, booking_id: int) -> dict:
        return self._repo.confirm(tenant_id, booking_id)

    def complete(self, tenant_id: int, booking_id: int) -> dict:
        return self._repo.complete(tenant_id, booking_id)

    def get(self, tenant_id: int, booking_id: int) -> dict | None:
        return self._repo.get_by_id(tenant_id, booking_id)

    def list_bookings(self, tenant_id: int) -> list[dict]:
        return self._repo.list_by_tenant(tenant_id)

    # -- WP6 public storefront ----------------------------------------------------
    def create_public_booking(
        self,
        *,
        tenant_id: int,
        service_id: int,
        location_id: int,
        availability_block_id: int,
        first_name: str,
        last_name: str,
        email: str,
        phone: str,
        customer_notes: str | None,
    ) -> dict[str, Any]:
        last_name_1, last_name_2 = _split_last_name(last_name)
        booking_id = self._repo.create_public_booking(
            tenant_id=tenant_id,
            service_id=service_id,
            location_id=location_id,
            availability_block_id=availability_block_id,
            first_name=first_name,
            last_name_1=last_name_1,
            last_name_2=last_name_2,
            email=email,
            phone=phone,
            customer_notes=customer_notes,
        )
        detail = self._repo.get_detail_by_id(booking_id)
        if detail is None:
            raise InternalError(
                f"No se pudo leer la reserva recien creada (reserva_id={booking_id})."
            )
        return detail

    # -- WP6 tracking-code self-service --------------------------------------------
    def get_by_tracking_code(self, tracking_code: str) -> dict[str, Any]:
        return self._require_active_tracking_row(tracking_code)

    def cancel_by_tracking_code(self, tracking_code: str) -> dict[str, Any]:
        row = self._require_active_tracking_row(tracking_code)
        self._repo.cancel(row["dominio_id"], row["reservacion_id"])
        return self._refetch_by_tracking_code(tracking_code)

    def reschedule_by_tracking_code(
        self, tracking_code: str, *, new_availability_block_id: int
    ) -> dict[str, Any]:
        row = self._require_active_tracking_row(tracking_code)
        self._repo.reschedule(
            row["dominio_id"],
            row["reservacion_id"],
            availability_block_id=new_availability_block_id,
        )
        return self._refetch_by_tracking_code(tracking_code)

    def _refetch_by_tracking_code(self, tracking_code: str) -> dict[str, Any]:
        refreshed = self._repo.get_by_tracking_code(tracking_code)
        if refreshed is None:
            raise InternalError(
                f"No se pudo releer la reserva tras la operacion ({tracking_code})."
            )
        return refreshed

    def _require_active_tracking_row(self, tracking_code: str) -> dict[str, Any]:
        """Looks up a booking by its tracking code and enforces the
        "expired or deactivated code" rule: codigos_de_rastreos.expira_en
        (creado_en + 30 days, stamped by trg_reservaciones_generar_rastreo)
        and .activo are never checked by the SP layer itself. Per the WP6
        brief, an expired/inactive code is treated exactly like a
        non-existent one (404) - this avoids revealing that a code ever
        existed once it stops being valid.
        """
        row = self._repo.get_by_tracking_code(tracking_code)
        if row is None:
            raise NotFoundError(f"Codigo de rastreo '{tracking_code}' no encontrado.")

        is_active = bool(row.get("codigo_activo"))
        expires_at = row.get("expira_en")
        is_expired = isinstance(expires_at, datetime) and expires_at < datetime.utcnow()
        if not is_active or is_expired:
            raise NotFoundError(f"Codigo de rastreo '{tracking_code}' no encontrado.")
        return row
