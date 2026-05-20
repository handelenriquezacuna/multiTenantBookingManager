# MBM: Multi tenant Booking Manager

Plataforma de reservas multi tenant para negocios de servicios. Este repositorio contiene la base de datos, API, frontend y documentacion del proyecto SC-404.

Resumen

MBM es una plataforma de reservas multi tenant para negocios de servicios. La base de datos es el eje principal y el proyecto incluye API, frontend y docker para el flujo completo de reservas, administracion y tracking.

## Indice

- [Integrantes](#integrantes)
- [Documentacion](#documentacion)
- [Estructura rapida](#estructura-rapida)

## Integrantes

- Handel Simón Enriquez Acuña
- Isaac Chaves Zumbado
- Jeferson Andrew Fuentes García
- Luna Delgado Durango
- Melannie Yeonsuk Campos Arias

## Documentacion

- [docs/overview.md](docs/overview.md) vision general, objetivos, alcance, actores y requerimientos
- [docs/database-and-sql.md](docs/database-and-sql.md) diseño de base de datos, normalizacion y SQL requerido
- [docs/api-and-frontend.md](docs/api-and-frontend.md) backend, endpoints y frontend
- [docs/frontend-map.md](docs/frontend-map.md) mapa visual de rutas frontend y relacion con endpoints
- [docs/structure-infra-workflow.md](docs/structure-infra-workflow.md) estructura del monorepo, carpetas, docker y git
- [docs/plan-and-delivery.md](docs/plan-and-delivery.md) entregables, cronograma, demo y checklist

## Estructura rapida

- [apps/frontend](apps/frontend) aplicacion Next.js
- [apps/api](apps/api) backend FastAPI
- [database](database) scripts y recursos de base de datos
- [infra](infra) infraestructura y contenedores
- [docs](docs) documentacion completa

## Modelo de datos — vision general

```mermaid
erDiagram
    business_types {
        int business_type_id PK
        varchar name
        varchar description
        bit is_active
    }
    tenant_statuses {
        int tenant_status_id PK
        varchar name
        varchar description
    }
    superadmins {
        int superadmin_id PK
        varchar full_name
        varchar email
        varchar password_hash
        bit is_active
        datetime created_at
        datetime updated_at
    }
    tenants {
        int tenant_id PK
        int business_type_id FK
        int tenant_status_id FK
        varchar name
        varchar slug
        varchar email
        varchar phone
        text description
        varchar logo_url
        varchar public_message
        bit is_active
        datetime created_at
        datetime updated_at
    }
    tenant_owners {
        int owner_id PK
        int tenant_id FK
        varchar full_name
        varchar email
        varchar password_hash
        varchar phone
        bit is_active
        datetime created_at
        datetime updated_at
    }
    customers {
        int customer_id PK
        int tenant_id FK
        varchar first_name
        varchar last_name
        varchar email
        varchar phone
        varchar notes
        datetime created_at
        datetime updated_at
    }
    service_categories {
        int category_id PK
        int tenant_id FK
        varchar name
        varchar description
        bit is_active
        datetime created_at
        datetime updated_at
    }
    services {
        int service_id PK
        int tenant_id FK
        int category_id FK
        varchar name
        text description
        int duration_minutes
        decimal price
        bit show_price
        bit is_active
        datetime created_at
        datetime updated_at
    }
    locations {
        int location_id PK
        int tenant_id FK
        varchar name
        varchar address
        varchar phone
        bit is_main
        bit is_active
        datetime created_at
        datetime updated_at
    }
    business_hours {
        int business_hour_id PK
        int tenant_id FK
        int location_id FK
        tinyint day_of_week
        time open_time
        time close_time
        bit is_closed
        datetime updated_at
    }
    availability_blocks {
        int availability_block_id PK
        int tenant_id FK
        int location_id FK
        date block_date
        time start_time
        time end_time
        bit is_active
        datetime created_at
        datetime updated_at
    }
    booking_statuses {
        int booking_status_id PK
        varchar name
        varchar description
    }
    bookings {
        int booking_id PK
        int tenant_id FK
        int customer_id FK
        int service_id FK
        int location_id FK
        int availability_block_id FK
        int booking_status_id FK
        date booking_date
        time start_time
        time end_time
        varchar customer_notes
        varchar internal_notes
        datetime created_at
        datetime updated_at
    }
    tracking_codes {
        int tracking_id PK
        int booking_id FK
        varchar tracking_code
        datetime expires_at
        bit is_active
        datetime created_at
    }
    audit_logs {
        int audit_id PK
        int tenant_id FK
        int owner_id FK
        int superadmin_id FK
        varchar action
        varchar entity_name
        int entity_id
        nvarchar old_value
        nvarchar new_value
        datetime created_at
    }

    business_types ||--o{ tenants : "clasifica"
    tenant_statuses ||--o{ tenants : "tiene estado"
    tenants ||--o{ tenant_owners : "tiene"
    tenants ||--o{ customers : "registra"
    tenants ||--o{ service_categories : "define"
    tenants ||--o{ services : "ofrece"
    tenants ||--o{ locations : "opera en"
    tenants ||--o{ business_hours : "define horario"
    tenants ||--o{ availability_blocks : "crea bloques"
    tenants ||--o{ bookings : "recibe reservas"
    tenants ||--o{ audit_logs : "genera logs"
    tenant_owners ||--o{ audit_logs : "ejecuta accion"
    superadmins ||--o{ audit_logs : "ejecuta accion"
    service_categories ||--o{ services : "agrupa"
    locations ||--o{ business_hours : "define horario"
    locations ||--o{ availability_blocks : "tiene bloques"
    locations ||--o{ bookings : "aloja"
    availability_blocks ||--o| bookings : "cubre"
    customers ||--o{ bookings : "realiza"
    services ||--o{ bookings : "es reservado como"
    booking_statuses ||--o{ bookings : "clasifica estado"
    bookings ||--|| tracking_codes : "identificada por"
```
