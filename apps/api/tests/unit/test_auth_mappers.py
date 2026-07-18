"""Mapper tests for the WP7a additions: user_mapper (owner/superadmin ->
`user` contract), business_type_mapper, and tenant_mapper's optional
email/phone/logoUrl fields (GET/PATCH /tenant/current)."""

from __future__ import annotations

from app.mappers.business_type_mapper import map_business_type
from app.mappers.tenant_mapper import map_tenant
from app.mappers.user_mapper import map_owner_user, map_superadmin_user


def test_map_owner_user_combines_both_surnames() -> None:
    row = {
        "dueno_id": 7,
        "dominio_id": 3,
        "nombre": "Ana",
        "apellido_1": "Rodriguez",
        "apellido_2": "Solis",
        "correo": "ana@example.com",
    }

    result = map_owner_user(row)

    assert result == {
        "id": 7,
        "first_name": "Ana",
        "last_name": "Rodriguez Solis",
        "email": "ana@example.com",
        "role": "owner",
        "tenant_id": 3,
    }


def test_map_owner_user_handles_null_second_surname() -> None:
    row = {
        "dueno_id": 8,
        "dominio_id": 4,
        "nombre": "Juan",
        "apellido_1": "Ramirez",
        "apellido_2": None,
        "correo": "juan@example.com",
    }

    result = map_owner_user(row)

    assert result["last_name"] == "Ramirez"


def test_map_superadmin_user_has_no_tenant_id() -> None:
    row = {
        "superadmin_id": 1,
        "nombre": "Melanie",
        "apellido_1": "Campos",
        "apellido_2": "Arias",
        "correo": "melanie.campos@citari.admin",
    }

    result = map_superadmin_user(row)

    assert result == {
        "id": 1,
        "first_name": "Melanie",
        "last_name": "Campos Arias",
        "email": "melanie.campos@citari.admin",
        "role": "superadmin",
        "tenant_id": None,
    }


def test_map_business_type() -> None:
    row = {
        "tipo_negocio_id": 2,
        "nombre": "Salon de belleza",
        "descripcion": "Servicios de belleza",
    }

    result = map_business_type(row)

    assert result == {
        "business_type_id": 2,
        "name": "Salon de belleza",
        "description": "Servicios de belleza",
    }


def test_map_business_type_missing_description() -> None:
    row = {"tipo_negocio_id": 5, "nombre": "Spa"}

    result = map_business_type(row)

    assert result["description"] is None


def test_map_tenant_surfaces_optional_contact_fields_when_present() -> None:
    """GET/PATCH /tenant/current select the full `dominios` row (unlike the
    WP6 public endpoint's narrower SELECT) - when correo/telefono/logo_url
    are present they must be surfaced as email/phone/logoUrl."""
    row = {
        "dominio_id": 1,
        "slug": "salon-bella",
        "nombre": "Salon Bella",
        "descripcion": "Salon de belleza y spa",
        "mensaje_publico": "Bienvenido",
        "correo": "salon@example.com",
        "telefono": "8888-0000",
        "logo_url": "https://cdn.example.com/logo.png",
    }

    result = map_tenant(row)

    assert result["email"] == "salon@example.com"
    assert result["phone"] == "8888-0000"
    assert result["logo_url"] == "https://cdn.example.com/logo.png"


def test_map_tenant_omits_optional_contact_fields_when_absent() -> None:
    """Backward-compat guard: the WP6 public-endpoint row shape (no
    correo/telefono/logo_url keys) must not gain those keys."""
    row = {
        "dominio_id": 1,
        "slug": "salon-bella",
        "nombre": "Salon Bella",
        "descripcion": None,
        "mensaje_publico": None,
    }

    result = map_tenant(row)

    assert "email" not in result
    assert "phone" not in result
    assert "logo_url" not in result
