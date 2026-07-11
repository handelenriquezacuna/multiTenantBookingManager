"""Location schemas (localidades). No dedicated frontend/types file yet."""

from __future__ import annotations

from app.schemas.common import CamelModel


class LocationResponse(CamelModel):
    location_id: int
    name: str
    address: str
    phone: str | None = None
    is_main: bool = False
    is_active: bool = True


class LocationCreateRequest(CamelModel):
    name: str
    address: str
    phone: str | None = None
    is_main: bool = False


class LocationUpdateRequest(CamelModel):
    name: str | None = None
    address: str | None = None
    phone: str | None = None
    is_main: bool | None = None
    is_active: bool | None = None
