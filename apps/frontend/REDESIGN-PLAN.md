# Plan de rediseño del frontend de Citari

Rediseño completo de la interfaz con un stack moderno (Tailwind, shadcn/ui, Framer Motion,
GSAP), planificado sobre la API real y sus endpoints. Objetivo actual: enfoque en diseño, con
todo cableado de forma funcional. Rama de trabajo: `feature/frontend-redesign`.

## 1. Punto de partida

El frontend actual es Next.js (App Router) con CSS propio (`app/globals.css`, ~1840 lineas), sin
librerias de UI ni de animacion. La logica de sesion (`useAuth`, guardas) y el cliente de API
(`lib/api.ts`, `lib/endpoints.ts`) ya existen y se conservan; lo que cambia es toda la capa
visual y de interaccion. Hay 23 rutas divididas en cuatro superficies: marketing, reserva
publica, autenticacion y aplicacion (panel del owner y admin).

## 2. Direccion de diseño (propuesta)

Las referencias aportan limpieza, aire, tarjetas suaves y un acento editorial en serif itálica.
Se toma esa base pero se le da carácter propio a Citari en lugar de clonar el look genérico de
"gradiente morado sobre blanco". Propuesta:

- **Concepto:** editorial, cálido y confiable. Citari organiza agendas de negocios de servicios
  (barberías, clínicas, salones, spas, veterinarias); el tono es sereno y profesional, no un SaaS
  frío más.
- **Tipografía:** un display serif con personalidad para titulares (acentos en itálica, como en
  las referencias) y una sans humanista y legible para el cuerpo. Se evitan Inter/Roboto/Arial.
- **Color:** lienzo neutro cálido (marfil/hueso) con tinta profunda para el texto y un color de
  acento definido. Se proponen tres opciones de acento para elegir (ver seccion de decisiones).
  La aplicacion (dashboard) se mantiene clara y enfocada en datos, con una paleta de series para
  las graficas.
- **Profundidad y textura:** sombras suaves y en capas, bordes sutiles, grano/ruido muy leve para
  dar atmosfera; nada de degradados chillones.
- **Movimiento:** intencional, no decorativo. GSAP para la orquestacion de scroll y la entrada del
  hero en marketing; Framer Motion para transiciones de componentes y micro-interacciones en la
  app (hover, aparicion de tarjetas, cambios de estado).

Dos superficies con lenguajes coherentes pero distintos de densidad:
1. **Marketing y publico** (landing, reserva, tracking): mas expresivo y editorial, con animacion.
2. **Aplicacion** (dashboard, back-office, admin): refinado, funcional, denso en datos, con
   componentes shadcn y movimiento sutil.

## 3. Stack tecnico y montaje

- **Tailwind CSS** como base de estilos (reemplaza gradualmente `globals.css`).
- **shadcn/ui** para componentes accesibles (Radix por debajo): button, card, input, label,
  select, dialog, sheet, dropdown-menu, tabs, table, badge, avatar, tooltip, popover, calendar,
  skeleton, sonner (toasts), form.
- **Framer Motion** (`motion`) para transiciones y micro-interacciones en React.
- **GSAP** (+ ScrollTrigger) para la orquestacion de scroll y la entrada del hero en marketing.
- **Fuentes** via `next/font` (self-hosted, sin llamadas externas).

Orden de montaje (Fase 0): inicializar Tailwind + PostCSS, `shadcn init`, instalar
`framer-motion` y `gsap`, definir tokens de diseño (colores, tipografia, radios, sombras) en la
config de Tailwind y variables CSS, y un layout raiz con las fuentes. Todo self-contained para que
el build de Docker (`web`) siga funcionando.

## 4. Inventario de páginas y su relacion con la API

| Ruta | Superficie | Datos / endpoint |
|------|-----------|------------------|
| `/` | Marketing | Landing. Opcional: `GET /business-types` para mostrar rubros reales |
| `/login` | Auth | `POST /auth/login` (role owner) |
| `/admin/login` | Auth | `POST /auth/login` (role superadmin) |
| `/register` | Auth | `POST /auth/register-owner` |
| `/book/[slug]` | Publico | `GET /public/{slug}` (tenant) |
| `/book/[slug]/service` | Publico | `GET /public/{slug}/services` |
| `/book/[slug]/datetime` | Publico | `GET /public/{slug}/availability` |
| `/book/[slug]/customer` | Publico | `POST /public/{slug}/bookings` |
| `/book/[slug]/confirmation` | Publico | usa el `trackingCode` de la respuesta anterior |
| `/track` | Publico | ingreso de codigo |
| `/track/[code]` | Publico | `GET /track/{code}` |
| `/track/[code]/cancel` | Publico | `POST /track/{code}/cancel` |
| `/track/[code]/reschedule` | Publico | `POST /track/{code}/reschedule` |
| `/dashboard` | App owner | `GET /reports/dashboard` |
| `/bookings` | App owner | `GET /bookings` + `confirm`/`cancel`/`complete`/`reschedule` |
| `/services` | App owner | `services` CRUD |
| `/service-categories` | App owner | `service-categories` CRUD |
| `/locations` | App owner | `locations` CRUD |
| `/business-hours` | App owner | `GET`/`PUT /business-hours` |
| `/customers` | App owner | `customers` CRUD + `/customers/{id}/bookings` |
| `/reports` | App owner | `reports.*` (daily-agenda, bookings-detail, services-demand, availability-status) |
| `/settings/business` | App owner | `GET`/`PATCH /tenant/current` |
| `/admin/tenants` | Admin | `GET /admin/tenants` |
| `/admin/tenants/[id]` | Admin | `GET /admin/tenants/{id}` + `activate`/`suspend`; `GET /audit-logs` |

Todos los endpoints ya estan mapeados en `lib/endpoints.ts` y el cliente en `lib/api.ts`.

## 5. Estrategia de animacion

- **GSAP + ScrollTrigger** (solo marketing y publico): entrada del hero por capas, reveals al
  hacer scroll, parallax sutil de la maqueta del dashboard, contadores animados en las metricas.
- **Framer Motion** (toda la app): transiciones de ruta suaves, aparicion escalonada de tarjetas y
  filas de tabla, estados de carga (skeletons), animacion de apertura de dialogos/sheets, feedback
  de acciones (confirmar, cancelar) con toasts.
- Regla: el movimiento refuerza la jerarquia y el feedback, nunca distrae. Respeta
  `prefers-reduced-motion`.

## 6. Roadmap por fases

- **Fase 0, fundacion:** Tailwind + shadcn + Framer Motion + GSAP, tokens de diseño, fuentes,
  layout raiz. Verificar que el build de Docker siga verde.
- **Fase 1, sistema de diseño + landing:** componentes base (button, card, input, etc.) con el
  nuevo lenguaje, y la landing `/` rediseñada como vitrina de la direccion (hero GSAP, secciones
  con reveals). Sirve de referencia visual para el resto.
- **Fase 2, flujo publico de reserva:** `/book/[slug]` completo (tenant, servicio, fecha/hora,
  cliente, confirmacion) cableado a la API, incluida la escritura (`POST bookings`) y el codigo de
  tracking real; y el flujo de `/track`.
- **Fase 3, auth + shell de la app:** login owner/superadmin y registro rediseñados; shell privado
  (sidebar + topbar) con la sesion real (ya existe `useAuth`).
- **Fase 4, back-office del owner:** dashboard, bookings, services, categories, locations,
  business-hours, customers, reports, settings, con componentes shadcn (tablas, dialogos, forms)
  y datos reales.
- **Fase 5, admin:** tenants (listado, detalle, activar/suspender), audit logs.
- **Fase 6, pulido:** estados vacios/carga/error consistentes, accesibilidad, responsive,
  `prefers-reduced-motion`, limpieza del `globals.css` viejo.

## 7. Nota de alcance

Enfoque actual: diseño. Cada pantalla se construye ya cableada a la API real (funcional), pero la
prioridad de este ciclo es el lenguaje visual y la interaccion. Se verifica con el stack Docker
(`docker compose up --build`, la app corre en `web` contra `api`) y con typecheck.
