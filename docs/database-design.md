# Diseño de base de datos

## Resumen

MBM es una plataforma multi-tenant de reservas para negocios de servicios. La base de datos debe estar normalizada al menos a 3FN y centrada en tenants, servicios, horarios, disponibilidad y reservas.

## Tablas principales

- business_types
- tenant_statuses
- tenants
- tenant_owners
- customers
- service_categories
- services
- locations
- business_hours
- availability_blocks
- booking_statuses
- bookings
- tracking_codes
- audit_logs

## Relaciones principales

- business_types → tenants (1:N)
- tenant_statuses → tenants (1:N)
- tenants → tenant_owners (1:N)
- tenants → customers (1:N)
- tenants → service_categories (1:N)
- service_categories → services (1:N)
- tenants → services (1:N)
- tenants → locations (1:N)
- tenants → business_hours (1:N)
- locations → availability_blocks (1:N)
- availability_blocks → bookings (1:N)
- customers → bookings (1:N)
- services → bookings (1:N)
- booking_statuses → bookings (1:N)
- bookings → tracking_codes (1:1)
- tenants → audit_logs (1:N)

## Normalización

- 1FN: cada campo tiene un solo valor.
- 2FN: atributos dependen completamente de su PK.
- 3FN: no hay dependencias transitivas fuera de la PK.

## Scripts SQL requeridos

- 01-create-database.sql
- 02-create-tables.sql
- 03-seed-data.sql
- 04-procedures.sql
- 05-functions.sql
- 06-views.sql
- 07-triggers.sql
- 08-full-script.sql
