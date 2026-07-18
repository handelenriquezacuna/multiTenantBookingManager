# Frontend Citari (Next.js)

Frontend del proyecto Citari siguiendo la arquitectura definida en `AGENTS.md` y `docs/api-and-frontend.md`.

## Objetivo actual

- Construir todas las pantallas frontend del MVP.
- Usar data ficticia (mock) por ahora.
- Mantener contrato listo para conectar los endpoints reales cuando backend y base de datos existan.

## Variables de entorno

Crear `.env.local` dentro de `apps/frontend`:

```bash
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

- `mock`: no consume backend real.
- `api`: habilita consumo HTTP real al backend.

## Estructura clave

- `app/`: rutas App Router.
- `components/`: UI reusable (layout/forms/tables/cards).
- `lib/endpoints.ts`: mapa oficial de endpoints según docs.
- `lib/api.ts`: cliente HTTP base.
- `lib/mock-data.ts`: datos ficticios.
- `hooks/`: capa de consumo por modulo.
- `types/`: contratos TS alineados al backend.

## Rutas implementadas

- Publico: `/`, `/book/[slug]/*`, `/track/[code]/*`
- Owner: `/login`, `/register`, `/dashboard`, `/services`, `/service-categories`, `/locations`, `/business-hours`, `/availability`, `/bookings`, `/customers`, `/reports`, `/settings/business`
- Admin: `/admin/login`, `/admin/tenants`, `/admin/tenants/[id]`

## Scripts

```bash
pnpm install
pnpm dev
pnpm build
```

## Gestor de paquetes

- Estandar del proyecto frontend: `pnpm`.
- Evitar `npm`/`yarn` para no mezclar lockfiles.

## Nota Docker

Este frontend esta preparado para contenedorizacion posterior. Cuando se cree el Dockerfile, solo necesitara inyectar las variables `NEXT_PUBLIC_API_*` correctas segun el entorno.
