# Mapa de frontend

Mapa visual de rutas del frontend Citari para guiar implementación, pruebas y conexión con backend.

```mermaid
flowchart TD
  A[/"\/"/] --> B[/"\/book\/[slug]\/"/]
  B --> C[/"\/book\/[slug]\/service\/"/]
  C --> D[/"\/book\/[slug]\/datetime\/"/]
  D --> E[/"\/book\/[slug]\/customer\/"/]
  E --> F[/"\/book\/[slug]\/confirmation\/"/]

  F --> Y[/"\/track\/"/]
  Y --> G[/"\/track\/[code]\/"/]
  G --> H[/"\/track\/[code]\/reschedule\/"/]
  G --> I[/"\/track\/[code]\/cancel\/"/]

  A --> J[/"\/login\/"/]
  A --> K[/"\/register\/"/]

  J --> L[/"\/dashboard\/"/]
  L --> M[/"\/services\/"/]
  L --> N[/"\/service-categories\/"/]
  L --> O[/"\/locations\/"/]
  L --> P[/"\/business-hours\/"/]
  L --> R[/"\/bookings\/"/]
  L --> S[/"\/customers\/"/]
  L --> T[/"\/reports\/"/]
  L --> U[/"\/settings\/business\/"/]

  A --> V[/"\/admin\/login\/"/]
  V --> W[/"\/admin\/tenants\/"/]
  W --> X[/"\/admin\/tenants\/[id]\/"/]
```

## Relación frontend -> endpoint backend (objetivo)

- Público:
  - `/book/[slug]` usa `GET /public/{tenantSlug}`
  - `/book/[slug]/service` usa `GET /public/{tenantSlug}/services`
  - `/book/[slug]/datetime` usa `GET /public/{tenantSlug}/availability`
  - `/book/[slug]/customer` confirma con `POST /public/{tenantSlug}/bookings`
  - `/track/[code]` usa `GET /track/{trackingCode}`
  - `/track/[code]/cancel` usa `POST /track/{trackingCode}/cancel`
  - `/track/[code]/reschedule` usa `POST /track/{trackingCode}/reschedule`

- Owner:
  - `/dashboard` usa `GET /reports/dashboard`
  - `/services` usa `GET/POST/PATCH/DELETE /services`
  - `/business-hours` configura los horarios generales por sede.
  - `/locations` configura las sedes del negocio.
  - No hay pestaña privada `/availability`; la disponibilidad visible al cliente se calcula desde sedes, horarios y reservas. `availability_blocks` queda como estructura de base de datos o recurso backend, no como pantalla manual del owner.
  - `/bookings` usa `GET /bookings` + acciones por id

- Admin:
  - `/admin/tenants` usa `GET /admin/tenants`
  - `/admin/tenants/[id]` usa `GET /admin/tenants/{id}`

Estado actual: el flujo público de reserva (consulta de tenant, servicios y disponibilidad), el seguimiento por código y el login están cableados a la API real (con `NEXT_PUBLIC_API_MODE=api`). El resto del back-office de owner/admin y las acciones de escritura del flujo público siguen usando datos mock (`lib/mock-data.ts`) por ahora. El modo mock sigue disponible como respaldo mediante `NEXT_PUBLIC_API_MODE=mock` (valor por defecto).
