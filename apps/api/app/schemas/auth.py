from __future__ import annotations

from app.schemas.common import CamelModel

# NOTE: email fields are plain `str` (not pydantic.EmailStr) on purpose: the
# fixed runtime dependency list for this WP does not include the optional
# `email-validator` package that EmailStr requires. Format validation, if
# needed, happens in the service layer.


class LoginRequest(CamelModel):
    email: str
    password: str


class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class RegisterOwnerRequest(CamelModel):
    tenant_name: str
    tenant_slug: str
    business_type_id: int
    owner_full_name: str
    owner_email: str
    owner_password: str
    owner_phone: str | None = None


class MeResponse(CamelModel):
    sub: str
    role: str
    tenant_id: int | None = None
