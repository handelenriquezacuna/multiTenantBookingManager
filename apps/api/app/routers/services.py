from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.service import ServiceCreateRequest, ServiceResponse, ServiceUpdateRequest

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
def list_services() -> list[ServiceResponse]:
    not_implemented()


@router.post("", response_model=ServiceResponse)
def create_service(payload: ServiceCreateRequest) -> ServiceResponse:
    not_implemented()


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int) -> ServiceResponse:
    not_implemented()


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(service_id: int, payload: ServiceUpdateRequest) -> ServiceResponse:
    not_implemented()


@router.delete("/{service_id}")
def delete_service(service_id: int) -> dict[str, str]:
    not_implemented()
