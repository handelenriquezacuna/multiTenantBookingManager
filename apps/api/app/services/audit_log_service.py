from __future__ import annotations

from app.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:
    def __init__(self, repo: AuditLogRepository) -> None:
        self._repo = repo

    def list_logs(self, tenant_id: int, *, page: int, page_size: int) -> list[dict]:
        return self._repo.list_by_tenant(tenant_id, page=page, page_size=page_size)
