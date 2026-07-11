"""Shared fixtures for the WP6 integration suite: real SQL Server (the live
`mbm_sqlserver` container / `mbm_booking` database, seed already loaded - see
docs/sql-signatures.md and scripts/smoke-db.sql for the conventions this
mirrors).

Every test creates its own throwaway data (year-2032 availability blocks, one
fixed test-customer email) and the `cleanup_tracker` fixture removes it again
after each test in FK order (codigos_de_rastreos -> registros ->
reservaciones -> bloques_de_disponibilidad, then the test customer by email),
so the suite is safely re-runnable and always leaves the seed counts
(reservaciones / bloques_de_disponibilidad / codigos_de_rastreos = 50 each)
untouched.

Connection target: SQLSERVER_HOST/PORT/USER/PASSWORD/DB env vars (same ones
app.config.Settings reads), defaulting to localhost:1433 - the docker-compose
published port. If pyodbc cannot load "ODBC Driver 18 for SQL Server" from
the host (no driver installed on macOS), run this suite inside a container on
the compose network instead (SQLSERVER_HOST=sqlserver) - see apps/api/README
and the WP6 report for the exact command used.
"""

from __future__ import annotations

from collections.abc import Generator
from datetime import date, time

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.db import ConnectionFactory
from app.main import app
from app.repositories.availability_repository import AvailabilityRepository

TEST_CUSTOMER_EMAIL = "wp6.integration.tests@example.com"


@pytest.fixture(scope="session")
def settings() -> Settings:
    return Settings()


@pytest.fixture(scope="session")
def db_factory(settings: Settings) -> ConnectionFactory:
    return ConnectionFactory(settings)


@pytest.fixture
def raw_conn(db_factory: ConnectionFactory) -> Generator:
    conn = db_factory.new_connection()
    try:
        yield conn
    finally:
        conn.close()


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="session")
def seed_tenant(db_factory: ConnectionFactory) -> dict:
    """Finds one active tenant from the seed (50 dominios, slugs like
    'barberia-el-colocho') with at least one active service and one active
    location - the same lookup pattern scripts/smoke-db.sql uses."""
    conn = db_factory.new_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT TOP 1 d.dominio_id, d.slug
            FROM dominios d
            WHERE dbo.fn_dominio_activo(d.dominio_id) = 1
              AND EXISTS (
                  SELECT 1 FROM servicios s
                  WHERE s.dominio_id = d.dominio_id AND s.activo = 1
              )
              AND EXISTS (
                  SELECT 1 FROM localidades l
                  WHERE l.dominio_id = d.dominio_id AND l.activo = 1
              )
            ORDER BY d.dominio_id
            """
        )
        row = cursor.fetchone()
        if row is None:
            pytest.skip("seed data has no active tenant with an active service+location")
        dominio_id, slug = row.dominio_id, row.slug

        cursor.execute(
            "SELECT TOP 1 servicio_id FROM servicios "
            "WHERE dominio_id = ? AND activo = 1 ORDER BY servicio_id",
            [dominio_id],
        )
        servicio_id = cursor.fetchone().servicio_id

        cursor.execute(
            "SELECT TOP 1 localidad_id FROM localidades "
            "WHERE dominio_id = ? AND activo = 1 ORDER BY localidad_id",
            [dominio_id],
        )
        localidad_id = cursor.fetchone().localidad_id

        cursor.close()
        return {
            "dominio_id": dominio_id,
            "slug": slug,
            "servicio_id": servicio_id,
            "localidad_id": localidad_id,
        }
    finally:
        conn.close()


@pytest.fixture
def cleanup_tracker(raw_conn) -> Generator[dict, None, None]:
    """Tests append the ids they create to `tracker["reserva_ids"]` /
    `tracker["block_ids"]`; everything is deleted here afterwards, in FK
    order, regardless of whether the test passed or failed."""
    tracker: dict[str, list[int]] = {"reserva_ids": [], "block_ids": []}
    yield tracker

    cursor = raw_conn.cursor()
    reserva_ids = tracker["reserva_ids"]
    block_ids = tracker["block_ids"]

    if reserva_ids:
        placeholders = ",".join("?" for _ in reserva_ids)
        cursor.execute(
            f"DELETE FROM codigos_de_rastreos WHERE reserva_id IN ({placeholders})",
            reserva_ids,
        )
        cursor.execute(
            "DELETE FROM registros WHERE nombre_entidad = 'reservaciones' "
            f"AND entidad_id IN ({placeholders})",
            reserva_ids,
        )
        cursor.execute(
            f"DELETE FROM reservaciones WHERE reserva_id IN ({placeholders})",
            reserva_ids,
        )

    if block_ids:
        placeholders = ",".join("?" for _ in block_ids)
        cursor.execute(
            "DELETE FROM bloques_de_disponibilidad "
            f"WHERE bloque_disponibilidad_id IN ({placeholders})",
            block_ids,
        )

    cursor.execute("DELETE FROM clientes WHERE correo = ?", [TEST_CUSTOMER_EMAIL])
    raw_conn.commit()
    cursor.close()


def make_block(
    db_factory: ConnectionFactory,
    seed_tenant: dict,
    *,
    block_date: date,
    start_time: time = time(9, 0),
    end_time: time = time(9, 30),
) -> int:
    """Creates one throwaway availability block via
    sp_crear_bloque_disponibilidad (through the already-fixed
    AvailabilityRepository.create_block) on its own short-lived connection.
    Callers must record the returned id in `cleanup_tracker["block_ids"]`.
    """
    conn = db_factory.new_connection()
    try:
        repo = AvailabilityRepository(conn)
        return repo.create_block(
            tenant_id=seed_tenant["dominio_id"],
            location_id=seed_tenant["localidad_id"],
            block_date=block_date,
            start_time=start_time,
            end_time=end_time,
        )
    finally:
        conn.close()


def booking_payload(*, service_id: int, location_id: int, availability_block_id: int) -> dict:
    return {
        "serviceId": service_id,
        "locationId": location_id,
        "availabilityBlockId": availability_block_id,
        "customer": {
            "firstName": "Ana",
            "lastName": "Rodriguez Solis",
            "email": TEST_CUSTOMER_EMAIL,
            "phone": "8888-0000",
        },
        "customerNotes": "wp6-integration-test",
    }
