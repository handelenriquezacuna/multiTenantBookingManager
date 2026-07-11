"""Mapper tests: Spanish SQL row (dict) -> English camelCase-able dict.

Covers: happy path field translation, apellido_2 NULL handling, and accented
characters surviving untouched in the *data* (never in identifiers).
"""

from __future__ import annotations

from app.mappers.availability_mapper import map_availability_block
from app.mappers.booking_mapper import map_booking_detail
from app.mappers.customer_mapper import map_customer
from app.mappers.service_mapper import map_service, map_service_category
from app.mappers.tenant_mapper import map_tenant


def test_map_service_translates_spanish_columns() -> None:
    row = {
        "servicio_id": 7,
        "nombre": "Corte de cabello",
        "descripcion": "Corte clasico con maquina y tijera",
        "duracion_minutos": 30,
        "precio": 15.50,
        "mostrar_precio": 1,
    }

    result = map_service(row)

    assert result == {
        "service_id": 7,
        "name": "Corte de cabello",
        "description": "Corte clasico con maquina y tijera",
        "duration_minutes": 30,
        "price": 15.50,
        "show_price": True,
    }


def test_map_service_optional_fields_missing() -> None:
    row = {
        "servicio_id": 1,
        "nombre": "Manicura",
        "descripcion": None,
        "duracion_minutos": 45,
        "precio": None,
        "mostrar_precio": 0,
    }

    result = map_service(row)

    assert result["price"] is None
    assert result["show_price"] is False


def test_map_service_category() -> None:
    row = {
        "categoria_servicio_id": 3,
        "nombre": "Peluqueria",
        "descripcion": "Servicios de cabello",
        "esta_activo": 1,
    }

    result = map_service_category(row)

    assert result == {
        "category_id": 3,
        "name": "Peluqueria",
        "description": "Servicios de cabello",
        "is_active": True,
    }


def test_map_customer_combines_both_last_names() -> None:
    row = {
        "cliente_id": 42,
        "nombre": "Maria",
        "apellido_1": "Gonzalez",
        "apellido_2": "Perez",
        "email": "maria@example.com",
        "telefono": "555-0100",
    }

    result = map_customer(row)

    assert result["first_name"] == "Maria"
    assert result["last_name"] == "Gonzalez Perez"
    assert result["customer_id"] == 42


def test_map_customer_handles_null_second_surname() -> None:
    row = {
        "cliente_id": 43,
        "nombre": "Juan",
        "apellido_1": "Ramirez",
        "apellido_2": None,
        "email": "juan@example.com",
        "telefono": "555-0101",
    }

    result = map_customer(row)

    assert result["last_name"] == "Ramirez"


def test_map_customer_handles_missing_second_surname_key() -> None:
    """apellido_2 may be entirely absent from the row (not every SP/view
    necessarily returns it as an explicit NULL column)."""
    row = {
        "cliente_id": 44,
        "nombre": "Ana",
        "apellido_1": "Torres",
        "email": "ana@example.com",
        "telefono": "555-0102",
    }

    result = map_customer(row)

    assert result["last_name"] == "Torres"


def test_map_customer_preserves_accented_data() -> None:
    """Accents belong in *data*, never in SQL identifiers - this asserts the
    mapper does not mangle/strip them."""
    row = {
        "cliente_id": 45,
        "nombre": "Jose",
        "apellido_1": "Nunez",
        "apellido_2": "Munoz",
        "email": "jose@example.com",
        "telefono": "555-0103",
        # Simulate genuinely accented data values coming back from SQL Server:
    }
    row["nombre"] = "José"
    row["apellido_1"] = "Núñez"
    row["apellido_2"] = "Muñoz"

    result = map_customer(row)

    assert result["first_name"] == "José"
    assert result["last_name"] == "Núñez Muñoz"


def test_map_tenant() -> None:
    row = {
        "dominio_id": 1,
        "slug": "salon-bella",
        "nombre": "Salón Bella",
        "descripcion": "Salón de belleza y spa",
        "mensaje_publico": "¡Bienvenido!",
    }

    result = map_tenant(row)

    assert result == {
        "tenant_id": 1,
        "slug": "salon-bella",
        "name": "Salón Bella",
        "description": "Salón de belleza y spa",
        "public_message": "¡Bienvenido!",
    }


def test_map_availability_block_with_reserved_flag() -> None:
    row = {
        "bloque_disponibilidad_id": 9,
        "fecha_bloque": "2026-07-15",
        "hora_inicio": "09:00:00",
        "hora_fin": "09:30:00",
        "esta_reservado": 1,
    }

    result = map_availability_block(row)

    assert result["availability_block_id"] == 9
    assert result["is_reserved"] is True


def test_map_availability_block_without_reserved_column() -> None:
    row = {
        "bloque_disponibilidad_id": 10,
        "fecha_bloque": "2026-07-15",
        "hora_inicio": "10:00:00",
        "hora_fin": "10:30:00",
    }

    result = map_availability_block(row)

    assert "is_reserved" not in result


def test_map_booking_detail() -> None:
    row = {
        "reservacion_id": 100,
        "nombre_cliente": "María José Nuñez",
        "nombre_servicio": "Tinte y peinado",
        "fecha_reservacion": "2026-07-20",
        "hora_inicio": "14:00:00",
        "estado": "confirmed",
        "codigo_rastreo": "ABC123",
    }

    result = map_booking_detail(row)

    assert result == {
        "booking_id": 100,
        "customer_name": "María José Nuñez",
        "service_name": "Tinte y peinado",
        "booking_date": "2026-07-20",
        "start_time": "14:00:00",
        "status": "confirmed",
        "tracking_code": "ABC123",
    }
