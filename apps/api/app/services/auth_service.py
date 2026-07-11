from __future__ import annotations

from app.repositories.superadmin_repository import SuperadminRepository
from app.repositories.tenant_owner_repository import TenantOwnerRepository
from app.repositories.tenant_repository import TenantRepository


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

    def find_owner_by_email(self, email: str) -> dict | None:
        return self._owner_repo.get_by_email(email)

    def find_superadmin_by_email(self, email: str) -> dict | None:
        return self._superadmin_repo.get_by_email(email)

    def register_owner(self, **fields: object) -> dict:
        # WP6/7: create tenant + owner atomically via sp_crear_dominio / sp_crear_dueno.
        raise NotImplementedError
