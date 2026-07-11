from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from app.routers import not_implemented

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/dashboard")
def dashboard() -> dict:
    not_implemented()


@router.get("/daily-agenda")
def daily_agenda(agenda_date: date) -> list[dict]:
    not_implemented()


@router.get("/bookings-detail")
def bookings_detail() -> list[dict]:
    not_implemented()


@router.get("/services-demand")
def services_demand() -> list[dict]:
    not_implemented()


@router.get("/availability-status")
def availability_status(status_date: date) -> list[dict]:
    not_implemented()
