"""Shared FastAPI dependencies: DB connection-per-request and JWT auth guards.

CurrentOwner / CurrentSuperadmin are Annotated dependency aliases (the
"Annotated[..., Depends(...)]" pattern) that routers use as parameter type
hints, e.g.:

    @router.get("/bookings")
    def list_bookings(owner: CurrentOwner) -> ...:
        ...

They are functional today (they really decode and validate the JWT); the
business use of the resulting TokenPayload (tenant scoping, etc.) is wired
into routers in later WPs.
"""

from __future__ import annotations

from collections.abc import Generator
from typing import Annotated

import pyodbc
from fastapi import Depends, Header, HTTPException, Request

from app.config import Settings, get_settings
from app.db import ConnectionFactory, get_connection
from app.security import TokenError, TokenPayload, decode_access_token


def get_db(request: Request) -> Generator[pyodbc.Connection, None, None]:
    """Yields a pyodbc connection scoped to the current request, taken from
    the ConnectionFactory stored on app.state at startup (see main.py)."""
    factory: ConnectionFactory = request.app.state.db_factory
    yield from get_connection(factory)


DbConnection = Annotated[pyodbc.Connection, Depends(get_db)]


def _decode_bearer_token(authorization: str | None, settings: Settings) -> TokenPayload:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        return decode_access_token(
            token, secret=settings.jwt_secret, algorithm=settings.jwt_algorithm
        )
    except TokenError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


def get_current_owner(
    *,
    authorization: Annotated[str | None, Header()] = None,
    settings: Annotated[Settings, Depends(get_settings)],
) -> TokenPayload:
    payload = _decode_bearer_token(authorization, settings)
    if payload.role != "owner":
        raise HTTPException(status_code=403, detail="owner role required")
    return payload


def get_current_superadmin(
    *,
    authorization: Annotated[str | None, Header()] = None,
    settings: Annotated[Settings, Depends(get_settings)],
) -> TokenPayload:
    payload = _decode_bearer_token(authorization, settings)
    if payload.role != "superadmin":
        raise HTTPException(status_code=403, detail="superadmin role required")
    return payload


CurrentOwner = Annotated[TokenPayload, Depends(get_current_owner)]
CurrentSuperadmin = Annotated[TokenPayload, Depends(get_current_superadmin)]
