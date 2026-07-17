"""Login, registration, and "who am I" business logic for /auth/* (WP7a).

Password hashing/verification and JWT issuing/decoding live in app.security;
this module only orchestrates repository calls and enforces the login rules
from the WP7a brief:

  * Resolve which table to check by email: an explicit `role` hint goes
    straight to that table; otherwise duenos_de_dominios is tried first and
    superadmins only if no owner row matches that email.
  * bcrypt-verify the password against the resolved row's
    `contrasena_encriptada`, and require `activo = 1` on that row.
  * An owner's tenant must additionally be active
    (dbo.fn_dominio_activo - docs/sql-signatures.md #3); unlike bad
    credentials (which always stay a generic 401, so a client can never tell
    whether an email is registered), this is reported as 403 with a clear
    detail, since by this point the credentials have already been proven
    correct.

Raises plain fastapi.HTTPException for every auth-specific failure
(401/403), mirroring the pattern app.deps already uses for the JWT guards -
these are authentication/authorization concerns, not app.errors.DomainError's
SQL-THROW-mapped domain errors.
"""

from __future__ import annotations

from typing import Any, Literal

from fastapi import HTTPException

from app.mappers.user_mapper import map_owner_user, map_superadmin_user
from app.repositories.superadmin_repository import SuperadminRepository
from app.repositories.tenant_owner_repository import TenantOwnerRepository
from app.repositories.tenant_repository import TenantRepository
from app.security import verify_password

_INVALID_CREDENTIALS_DETAIL = "Correo o contrasena invalidos."
_ACCOUNT_UNAVAILABLE_DETAIL = "La cuenta ya no esta disponible."


def _split_last_name(last_name: str) -> tuple[str, str | None]:
    """RegisterOwnerRequest.owner_last_name is a single free-text field;
    duenos_de_dominios needs it split into apellido_1 (required) + apellido_2
    (optional) - the inverse of app.mappers.user_mapper's combining rule."""
    parts = last_name.split(None, 1)
    if len(parts) == 2:
        return parts[0], parts[1]
    return last_name, None


class AuthService:
    def __init__(
        self,
        owner_repo: TenantOwnerRepository,
        superadmin_repo: SuperadminRepository,
        tenant_repo: TenantRepository,
    ) -> None:
        self._owner_repo = owner_repo
        self._superadmin_repo = superadmin_repo
        self._tenant_repo = tenant_repo

    def authenticate(
        self,
        *,
        email: str,
        password: str,
        role: Literal["owner", "superadmin"] | None,
    ) -> dict[str, Any]:
        """Returns the `user` dict (see app.mappers.user_mapper) for a valid
        login, or raises HTTPException(401)/HTTPException(403)."""
        resolved_role: Literal["owner", "superadmin"]
        row: dict[str, Any] | None

        if role == "superadmin":
            row = self._superadmin_repo.get_by_email(email)
            resolved_role = "superadmin"
        elif role == "owner":
            row = self._owner_repo.get_by_email(email)
            resolved_role = "owner"
        else:
            row = self._owner_repo.get_by_email(email)
            resolved_role = "owner"
            if row is None:
                row = self._superadmin_repo.get_by_email(email)
                resolved_role = "superadmin"

        if row is None or not self._credentials_ok(row, password):
            raise HTTPException(status_code=401, detail=_INVALID_CREDENTIALS_DETAIL)

        if resolved_role == "owner":
            self._ensure_tenant_active(row["dominio_id"])
            return map_owner_user(row)
        return map_superadmin_user(row)

    @staticmethod
    def _credentials_ok(row: dict[str, Any], password: str) -> bool:
        if not bool(row.get("activo")):
            return False
        return verify_password(password, row["contrasena_encriptada"])

    def _ensure_tenant_active(self, tenant_id: int) -> None:
        status = self._tenant_repo.get_status(tenant_id)
        if status is None or not bool(status["esta_activo"]):
            estado = status["estado_nombre"] if status else "desconocido"
            raise HTTPException(
                status_code=403,
                detail=(
                    f"El dominio de este negocio esta en estado '{estado}' y no "
                    "puede iniciar sesion hasta que un superadmin lo active."
                ),
            )

    def get_current_user(self, *, role: str, subject_id: int) -> dict[str, Any]:
        """GET /auth/me: re-reads the user from the DB (never trusts the JWT
        claims alone) so a deactivated/deleted account is rejected even with
        an otherwise-valid, unexpired token."""
        if role == "owner":
            row = self._owner_repo.get_by_id(subject_id)
            if row is None or not bool(row.get("activo")):
                raise HTTPException(status_code=401, detail=_ACCOUNT_UNAVAILABLE_DETAIL)
            return map_owner_user(row)

        row = self._superadmin_repo.get_by_id(subject_id)
        if row is None or not bool(row.get("activo")):
            raise HTTPException(status_code=401, detail=_ACCOUNT_UNAVAILABLE_DETAIL)
        return map_superadmin_user(row)

    def register_owner(
        self,
        *,
        business_name: str,
        business_type_id: int,
        slug: str,
        business_email: str,
        owner_first_name: str,
        owner_last_name: str,
        owner_email: str,
        password_hash: str,
        phone: str | None,
    ) -> dict[str, Any]:
        """Orchestrates sp_crear_dominio (always creates the tenant in the
        'pendiente' state) + sp_crear_dueno. `phone`, if given, is stored on
        the owner (duenos_de_dominios.telefono) - the request has a single
        generic `phone` field, not separate business/owner phones, and
        pairing it with the person logging in is the more useful default;
        the tenant's own `telefono` stays NULL until PATCH /tenant/current
        sets it. Neither SP does a final SELECT (both report their new id
        via an OUTPUT param only - docs/sql-signatures.md #1/#2), so this
        reassembles the owner dict from the input + generated ids rather
        than re-querying.
        """
        tenant_id = self._tenant_repo.create_tenant(
            business_type_id=business_type_id,
            name=business_name,
            slug=slug,
            email=business_email,
            phone=None,
            description=None,
            logo_url=None,
            public_message=None,
        )
        last_name_1, last_name_2 = _split_last_name(owner_last_name)
        owner_id = self._owner_repo.create_owner(
            tenant_id=tenant_id,
            first_name=owner_first_name,
            last_name_1=last_name_1,
            last_name_2=last_name_2,
            email=owner_email,
            password_hash=password_hash,
            phone=phone,
        )
        owner_row = {
            "dueno_id": owner_id,
            "nombre": owner_first_name,
            "apellido_1": last_name_1,
            "apellido_2": last_name_2,
            "correo": owner_email,
            "dominio_id": tenant_id,
        }
        return {"tenant_id": tenant_id, "owner": map_owner_user(owner_row)}
