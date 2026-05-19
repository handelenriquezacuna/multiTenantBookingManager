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
- [docs/structure-infra-workflow.md](docs/structure-infra-workflow.md) estructura del monorepo, carpetas, docker y git
- [docs/plan-and-delivery.md](docs/plan-and-delivery.md) entregables, cronograma, demo y checklist

## Estructura rapida

- [apps/frontend](apps/frontend) aplicacion Next.js
- [apps/api](apps/api) backend FastAPI
- [database](database) scripts y recursos de base de datos
- [infra](infra) infraestructura y contenedores
- [docs](docs) documentacion completa
