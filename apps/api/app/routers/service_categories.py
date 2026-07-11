from __future__ import annotations

from fastapi import APIRouter

from app.routers import not_implemented
from app.schemas.category import (
    ServiceCategoryCreateRequest,
    ServiceCategoryResponse,
    ServiceCategoryUpdateRequest,
)

router = APIRouter(prefix="/service-categories", tags=["service-categories"])


@router.get("", response_model=list[ServiceCategoryResponse])
def list_service_categories() -> list[ServiceCategoryResponse]:
    not_implemented()


@router.post("", response_model=ServiceCategoryResponse)
def create_service_category(payload: ServiceCategoryCreateRequest) -> ServiceCategoryResponse:
    not_implemented()


@router.get("/{category_id}", response_model=ServiceCategoryResponse)
def get_service_category(category_id: int) -> ServiceCategoryResponse:
    not_implemented()


@router.put("/{category_id}", response_model=ServiceCategoryResponse)
def update_service_category(
    category_id: int, payload: ServiceCategoryUpdateRequest
) -> ServiceCategoryResponse:
    not_implemented()


@router.delete("/{category_id}")
def delete_service_category(category_id: int) -> dict[str, str]:
    not_implemented()
