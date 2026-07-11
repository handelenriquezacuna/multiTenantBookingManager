from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.auth import LoginRequest, MeResponse, RegisterOwnerRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    not_implemented()


@router.post("/register-owner", response_model=TokenResponse)
def register_owner(payload: RegisterOwnerRequest) -> TokenResponse:
    not_implemented()


@router.get("/me", response_model=MeResponse)
def me() -> MeResponse:
    not_implemented()


@router.post("/logout")
def logout() -> dict[str, str]:
    not_implemented()
