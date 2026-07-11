"""15 API router modules (all mounted under /api/v1 by app/main.py), plus a
separate health module (GET /health, GET /ready) that is the only one that
actually works end to end in WP5 - everything else answers 501 until its
service/repository body is wired in WP6/7.
"""

from __future__ import annotations

from typing import NoReturn

from fastapi import HTTPException


def not_implemented() -> NoReturn:
    """Uniform 501 stub body for every route not yet wired to a real
    service/repository implementation."""
    raise HTTPException(status_code=501, detail="Not implemented yet")
