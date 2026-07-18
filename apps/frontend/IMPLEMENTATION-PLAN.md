# Plan de implementación — Frontend real consumiendo la API

Objetivo: que el frontend Next.js consuma la **API real** (la que construyó Handel) en lugar de
`lib/mock-data.ts`, cerrando el ciclo end-to-end. Rama de trabajo: `feature/frontend-real-api`.

## Principios

- **Contrato en inglés / camelCase.** La API traduce del español (DB) al inglés (JSON). El
  frontend nunca ve nombres en español. No se rompe esa frontera.
- **`NEXT_PUBLIC_API_MODE=api`** activa el modo real; `mock` sigue disponible como respaldo
  (default actual). Toda pantalla nueva debe funcionar en modo `api` y degradar a `mock` solo
  donde ya exista ese patrón.
- **Sin dependencias nuevas pesadas.** Se mantiene el patrón actual (hooks + `useState`/
  `useEffect` + helpers de `lib/api.ts`). Se puede evaluar SWR solo si aparece necesidad real
  de cache/revalidación; por ahora no.
- **Cada pantalla “terminada”** = lee/escribe contra la API, maneja loading + error (vía
  `ApiError`), y no depende de `mock-data.ts`.

## Estado actual (auditado)

**Ya cableado a la API real** (modo `api`): lookup de tenant público, servicios y disponibilidad
del flujo público (lecturas), lookup de tracking, y el `POST /auth/login` (owner y superadmin).
`lib/api.ts` ya expone `apiGet/apiPost/apiPatch/apiPut/apiDelete`, `ApiError` (RFC 7807) y el
manejo de token en `localStorage` (`citari_token`). `lib/endpoints.ts` ya mapea **todos** los
endpoints. `PrivateShell` ya tiene logout real.

**Todavía en mock / estado local (lo que falta):**
- Escritura del flujo público: `CustomerStep` no hace `POST /public/{slug}/bookings`; la página
  de confirmación muestra un código de tracking hardcodeado; `track/[code]/cancel` y
  `.../reschedule` no llaman a la API.
- Back-office del owner (todo mock/estado local): `dashboard`, `services`, `service-categories`,
  `locations`, `business-hours`, `customers`, `bookings` (+ acciones de ciclo de vida),
  `reports`, `settings/business`.
- Área admin: `admin/tenants`, `admin/tenants/[id]` (activar/suspender), audit logs.
- El nombre de usuario en `PrivateShell` sigue hardcodeado ("Sofia Campos").

## Fundamentos a construir primero (bloquean todo lo demás)

1. **Sesión y guardas de ruta.**
   - Rehidratar sesión al cargar: `GET /auth/me` con el token de `localStorage` → poblar un
     contexto/hook `useAuth` con `{ user, role }`. Un `AuthUser` ya está tipado en `types/auth.ts`.
   - Guardas: `PrivateShell` (owner) y el shell de admin redirigen a `/login` (o `/admin/login`)
     si no hay token válido / rol incorrecto. Manejar `401` global en `lib/api.ts`
     (`clearAuthToken()` + redirect a login).
   - Mostrar el nombre real del usuario en `PrivateShell` desde `useAuth`, no hardcodeado.
2. **Manejo de errores unificado.** Un helper que convierta `ApiError` (problem+json) en un
   mensaje visible (toast o banner). Estándar para todas las pantallas.
3. **Patrón de datos estándar.** Un hook por recurso (`useServices`, `useBookings`, etc.) que:
   lee con `apiGet<Page<T>>(...).items` cuando el endpoint pagina, expone `loading/error/refetch`,
   y en modo `mock` cae al arreglo de `mock-data.ts`. Ya existen `useAvailability/useBookings/
   useServices` como base a extender.

## Plan por área (orden sugerido)

### Milestone 1 — Auth sólida + flujo público completo
- Fundamentos 1–3 arriba.
- `CustomerStep` → `POST /public/{slug}/bookings`; usar el `trackingCode` real de la respuesta
  en la página de confirmación (quitar el `"CITARI-8F3K2A"` hardcodeado).
- `track/[code]/cancel` → `POST /track/{code}/cancel`; `track/[code]/reschedule` →
  `POST /track/{code}/reschedule`.
- **DoD:** un cliente puede reservar de punta a punta y consultar/cancelar/reagendar por código,
  todo contra la API.

### Milestone 2 — Back-office del owner (CRUD)
Cablear contra los endpoints ya mapeados en `endpoints.ts`:
- `services` → `services.*` (list/create/update/delete, soft delete)
- `service-categories` → `serviceCategories.*`
- `locations` → `locations.*`
- `business-hours` → `businessHours` (GET + PUT semanal)
- `customers` → `customers.*` (+ historial `customers.bookings(id)`)
- `bookings` → `bookings.list` + acciones `confirm/cancel/complete/reschedule`
- `settings/business` → `GET/PATCH tenant.current` (botón "Guardar" hoy inerte)
- Reemplazar los `*Manager.tsx` que hoy mutan `useState` de `mock-data` por llamadas reales.
- **DoD:** el owner administra sus catálogos y reservas con persistencia real.

### Milestone 3 — Dashboard, reportes y admin
- `dashboard` → `reports.dashboard` (hoy arreglos hardcodeados).
- `reports` → `reports.*` (daily-agenda, bookings-detail, services-demand, availability-status).
- `admin/tenants` + `[id]` → `admin.tenants`, activar/suspender; audit logs → `auditLogs`.
- **DoD:** superadmin opera tenants y el owner ve métricas reales.

### Milestone 4 — Pulido
- Estados de carga/vacío/error consistentes, revalidación tras mutaciones, quitar
  `mock-data.ts` de los imports que ya no lo necesiten, revisar accesibilidad básica.

## Tipos
Asegurar que `types/*` reflejen el contrato camelCase de la API (ver `docs/api-handover.md`).
Ya existen `auth.ts`, `page.ts` (envelope de paginación), `booking.ts`, `service.ts`,
`customer.ts`, `availability.ts`, `tenant.ts`. Agregar los que falten (category, location,
business-hours, report, audit-log) a medida que se cablea cada área.

## Verificación
- Levantar el stack: `docker compose up` (db + api + frontend) con `NEXT_PUBLIC_API_MODE=api`.
- Recorrer cada flujo manualmente contra la API real (no mock).
- Referencia de endpoints, auth y ejemplos: `docs/api-handover.md`; recetas de conexión de
  pantallas: `docs/arquitectura-visual.md`.

## Nota de alcance
Esto es **producto**, no requisito del curso (la rúbrica evalúa la base de datos). Prioridad
según la entrega: primero la base de datos / II Avance; el frontend real avanza en paralelo por
estos milestones.
