# Estructura del monorepo

## Indice

- [Estructura del monorepo](#estructura-del-monorepo)
- [Explicación de carpetas](#explicación-de-carpetas)
- [Organización interna del backend](#organización-interna-del-backend)
- [Organización interna del frontend](#organización-interna-del-frontend)
- [Docker e infraestructura](#docker-e-infraestructura)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)

El proyecto debe estar en un solo repositorio para facilitar la organización.

```text
mbm-booking-manager/
│
├── apps/
│   ├── frontend/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── public/
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── database.py
│       │   ├── routers/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── utils/
│       │   └── config/
│       ├── pyproject.toml
│       ├── uv.lock
│       └── README.md
│
├── database/
│   ├── diagrams/
│   ├── scripts/
│   └── docs/
│
├── infra/
│   ├── docker/
│   └── sqlserver/
│
├── docs/
│   ├── requirements.md
│   ├── database-design.md
│   ├── api-contract.md
│   ├── frontend-map.md
│   ├── docker-setup.md
│   └── team-workflow.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

## Explicación de carpetas

apps/frontend

Contiene la aplicación web desarrollada con Next.js y TypeScript.

Gestor de paquetes recomendado para frontend: pnpm.

Debe incluir:

- Pantallas públicas.
- Pantallas administrativas.
- Componentes reutilizables.
- Tipos de TypeScript.
- Funciones para consumir la API.
- Estilos.

Comandos base del frontend:

- pnpm install
- pnpm dev
- pnpm build

apps/api

Contiene el backend desarrollado con FastAPI.

Debe incluir:

- Archivo principal de FastAPI.
- Configuración de conexión a SQL Server.
- Routers por módulo.
- Schemas de validación.
- Servicios para lógica de API.
- Utilidades generales.

database

Contiene todo lo relacionado con la base de datos.

Debe incluir:

- Diagramas.
- Scripts SQL.
- Documentación del modelo.
- Archivo completo de entrega.

infra

Contiene configuración de infraestructura.

Debe incluir:

- Dockerfiles.
- Configuraciones de SQL Server.
- Archivos de apoyo para contenedores.

docs

Contiene la documentación del proyecto.

Incluye:

- overview.md: vision general, objetivos, alcance, actores y requerimientos.
- database-and-sql.md: diseño de base de datos, normalización y SQL requerido.
- api-and-frontend.md: backend, endpoints y frontend.
- structure-infra-workflow.md: estructura del monorepo, carpetas, docker y git.
- plan-and-delivery.md: entregables, cronograma, demo y checklist.

## Organización interna del backend

```text
apps/api/app/
│
├── main.py
├── database.py
│
├── routers/
│   ├── auth.py
│   ├── admin.py
│   ├── tenants.py
│   ├── business_types.py
│   ├── service_categories.py
│   ├── services.py
│   ├── locations.py
│   ├── business_hours.py
│   ├── availability_blocks.py
│   ├── customers.py
│   ├── bookings.py
│   ├── public.py
│   ├── tracking.py
│   ├── reports.py
│   └── audit_logs.py
│
├── schemas/
│   ├── auth_schema.py
│   ├── tenant_schema.py
│   ├── service_schema.py
│   ├── availability_schema.py
│   ├── customer_schema.py
│   └── booking_schema.py
│
├── services/
│   ├── auth_service.py
│   ├── tenant_service.py
│   ├── booking_service.py
│   └── report_service.py
│
├── utils/
│   ├── security.py
│   ├── responses.py
│   └── errors.py
│
└── config/
    └── settings.py
```

## Organización interna del frontend

```text
apps/frontend/
│
├── app/
│   ├── page.tsx
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── services/
│   ├── service-categories/
│   ├── locations/
│   ├── business-hours/
│   ├── bookings/
│   ├── customers/
│   ├── reports/
│   ├── settings/
│   ├── book/
│   └── track/
│
├── components/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── cards/
│   └── ui/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
│
├── hooks/
│   ├── useServices.ts
│   ├── useBookings.ts
│   └── useAvailability.ts
│
├── types/
│   ├── tenant.ts
│   ├── service.ts
│   ├── booking.ts
│   └── customer.ts
│
└── public/
```

## Docker e infraestructura

El proyecto debe poder levantarse con Docker Compose.

Servicios esperados

| Servicio | Tecnologia | Puerto sugerido |
| --- | --- | --- |
| sqlserver | SQL Server | 1433 |
| api | FastAPI + Uvicorn | 8000 |
| frontend | Next.js | 3000 |

Flujo de Docker

1. Clonar el repositorio.
2. Crear archivo .env a partir de .env.example.
3. Ejecutar docker compose up --build.
4. Esperar que SQL Server inicie.
5. Ejecutar scripts SQL o tener un mecanismo documentado para cargarlos.
6. Abrir frontend en localhost:3000.
7. Abrir API docs en localhost:8000/docs.

Documentación minima de Docker

El archivo docs/docker-setup.md debe explicar:

- Requisitos previos.
- Como instalar Docker.
- Como copiar variables de entorno.
- Como levantar contenedores.
- Como detener contenedores.
- Como revisar logs.
- Como conectarse a SQL Server.
- Como ejecutar scripts.

## Flujo de trabajo con Git

Ramas principales

- main
- develop
- feature/*

Version estable del proyecto.

Rama de integración del equipo.

Ramas para funcionalidades especificas.

Ejemplos de ramas

- feature/db-schema
- feature/db-seed-data
- feature/db-procedures
- feature/api-auth
- feature/api-bookings
- feature/api-public-booking
- feature/frontend-dashboard
- feature/frontend-services
- feature/frontend-public-booking
- feature/docker-setup
- feature/docs-project

Flujo recomendado

1. Clonar el repositorio.
2. Cambiar a la rama develop.
3. Actualizar develop.
4. Crear una rama feature desde develop.
5. Trabajar en la funcionalidad asignada.
6. Hacer commits claros.
7. Subir la rama al repositorio remoto.
8. Crear Pull Request hacia develop.
9. Otro companero revisa los cambios.
10. Si todo esta correcto, se hace merge.
11. El equipo prueba la integración.

Convencion de commits

- feat: nueva funcionalidad
- fix: correccion de error
- db: cambios de base de datos
- api: cambios de backend
- ui: cambios de frontend
- docs: documentación
- refactor: mejora interna sin cambiar funcionalidad
- chore: configuración o mantenimiento

Ejemplos:

- db: create tenants and bookings tables
- api: add public booking endpoint
- ui: build booking confirmation page
- docs: add database normalization notes
- fix: correct booking status filter
