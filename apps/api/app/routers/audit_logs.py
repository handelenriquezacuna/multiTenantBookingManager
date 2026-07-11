from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("")
def list_audit_logs(page: int = 1, page_size: int = 20) -> list[dict]:
    not_implemented()
