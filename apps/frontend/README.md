# Frontend Citari (Next.js)

Frontend de Citari (App Router, React Server Components). Cableado a la API
real de `apps/api` (auth, back-office completo, disponibilidad, flujo público
de reserva/seguimiento). Ver [docs/frontend-map.md](../../docs/frontend-map.md)
para el mapa de rutas ↔ endpoints.

## Puesta en marcha (recomendado: Docker)

Desde la raíz del repo:

```bash
docker compose up --build
```

Levanta `db` + `api` + este frontend en modo desarrollo con **hot reload real**
(bind mount + `next dev --webpack`, con polling para que funcione sobre
bind mounts de Windows/Docker Desktop): guardás un archivo y el cambio se ve
solo, sin reconstruir nada. `NEXT_PUBLIC_API_MODE=api` ya viene seteado por
defecto en el compose, apuntando a la API real del stack.

Frontend en http://localhost:3000.

## Puesta en marcha (sin Docker, en el host)

```bash
cd apps/frontend
corepack enable        # activa el pnpm fijado en package.json (packageManager)
pnpm install
pnpm dev
```

Crear `apps/frontend/.env.local` (gitignored) para apuntar a una API real en
vez de datos mock:

```bash
NEXT_PUBLIC_API_MODE=api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

- `mock` (por defecto si no se define `.env.local`): no consume backend real,
  usa datos ficticios de `lib/mock-data.ts`. Útil para trabajar solo el diseño.
- `api`: consumo HTTP real contra `apps/api`.

## Producción

Ver [docs/deployment.md](../../docs/deployment.md): imagen Docker de
producción (`Dockerfile`, multi-stage, Next.js `standalone`) y el workflow de
GitHub Actions que la publica en GHCR. Las variables `NEXT_PUBLIC_*` se
incrustan en el bundle **al compilar** la imagen, no en tiempo de ejecución.

## Estructura clave

- `app/`: rutas App Router (público, dueño de negocio, superadmin).
- `components/ui/`: primitivas shadcn/ui (button, card, table, calendar, sidebar, ...).
- `components/admin/`, `components/booking/`, `components/marketing/`: managers y pantallas por dominio.
- `lib/endpoints.ts`: mapa de endpoints de la API.
- `lib/api.ts`: cliente HTTP (elige la URL del navegador o la interna de Docker según `typeof window`).
- `lib/resource.ts`: hook `useResource`/`useResourceOne` con fallback a mock y estados de carga/error.
- `lib/mock-data.ts`: datos ficticios para `NEXT_PUBLIC_API_MODE=mock`.
- `hooks/useAuth.ts`: rehidratación de sesión (owner/superadmin) vía `GET /auth/me`.
- `types/`: contratos TS alineados a los schemas de la API.

## Rutas implementadas

- **Público**: `/`, `/track`, `/book/[slug]/*`, `/track/[code]/*`
- **Dueño de negocio**: `/login`, `/register`, `/dashboard`, `/services`, `/service-categories`,
  `/locations`, `/availability` (horario semanal + generación de turnos, un solo flujo),
  `/bookings`, `/customers`, `/reports`, `/settings/business`
- **Superadmin**: `/admin/login`, `/admin/tenants`, `/admin/tenants/[id]`

## Scripts

```bash
pnpm dev      # servidor de desarrollo
pnpm build    # build de produccion (genera .next/standalone)
pnpm start    # sirve el build de produccion
pnpm lint     # eslint
```

## Gestor de paquetes

- `pnpm`, versión fijada en `packageManager` (package.json) para que `corepack`
  sea determinista tanto en local como en CI/Docker. Evitar `npm`/`yarn` para
  no mezclar lockfiles.
