# Backend con FastAPI

## Indice

- [Backend con FastAPI](#backend-con-fastapi)
- [Endpoints del backend](#endpoints-del-backend)
- [Endpoints públicos sin login](#endpoints-públicos-sin-login)
- [Frontend con Next.js](#frontend-con-nextjs)
- [Prioridades del frontend](#prioridades-del-frontend)

El backend sera la capa intermedia entre Next.js y SQL Server.

No debe reemplazar la lógica de base de datos. Para este curso, mucha de la lógica importante debe quedar en SQL Server mediante procedures, functions, views y triggers.

Responsabilidades del backend

- Recibir solicitudes del frontend.
- Validar datos básicos antes de enviarlos a SQL Server.
- Conectarse a SQL Server.
- Ejecutar procedimientos almacenados.
- Consultar vistas SQL para reportes.
- Manejar errores y devolver mensajes claros.
- Aplicar contexto multi tenant.
- Evitar que un business owner consulte datos de otro tenant.
- Exponer endpoints REST.
- Permitir que el frontend consuma datos en formato JSON.

## Endpoints del backend

### Autenticación

- POST /auth/login
- POST /auth/register-owner
- GET /auth/me
- POST /auth/logout

Permite iniciar sesión al business owner.

Permite registrar o solicitar creación de un owner y tenant.

Devuelve informacion del usuario autenticado.

Cierra sesión.

### Superadmin

- GET /admin/tenants
- GET /admin/tenants/{id}
- POST /admin/tenants/{id}/activate
- POST /admin/tenants/{id}/suspend

Lista tenants registrados.

Obtiene detalle de un tenant.

Activa un tenant.

Suspende un tenant.

### Tenant privado

- GET /tenant/current
- PATCH /tenant/current

Obtiene el tenant del business owner autenticado.

Actualiza informacion básica del tenant.

### Tipos de negocio

- GET /business-types

Lista tipos de negocio disponibles.

### Categorías de servicios

- GET /service-categories
- POST /service-categories
- PATCH /service-categories/{id}
- DELETE /service-categories/{id}

Lista categorías del tenant autenticado.

Crea una categoría.

Actualiza una categoría.

Inactiva una categoría.

### Servicios

- GET /services
- POST /services
- GET /services/{id}
- PATCH /services/{id}
- DELETE /services/{id}

Lista servicios del tenant autenticado.

Crea un servicio.

Obtiene detalle de un servicio.

Actualiza un servicio.

Inactiva un servicio.

### Ubicaciones

- GET /locations
- POST /locations
- PATCH /locations/{id}
- DELETE /locations/{id}

Lista ubicaciones del tenant.

Crea una ubicación.

Actualiza ubicación.

Inactiva ubicación.

### Horarios del negocio

- GET /business-hours
- PUT /business-hours

Obtiene los horarios generales del negocio.

Actualiza los horarios generales del negocio.

### Bloques de disponibilidad

- GET /availability-blocks
- POST /availability-blocks
- PATCH /availability-blocks/{id}
- DELETE /availability-blocks/{id}

Lista bloques de disponibilidad del tenant.

Crea un bloque de disponibilidad.

Actualiza un bloque.

Inactiva un bloque.

### Clientes

- GET /customers
- POST /customers
- GET /customers/{id}
- PATCH /customers/{id}
- GET /customers/{id}/bookings

Lista clientes del tenant.

Crea cliente manualmente.

Obtiene detalle de cliente.

Actualiza cliente.

Lista reservas de un cliente.

### Reservas privadas

- GET /bookings
- GET /bookings/{id}
- POST /bookings/{id}/confirm
- POST /bookings/{id}/cancel
- POST /bookings/{id}/complete
- POST /bookings/{id}/reschedule

Lista reservas del tenant.

Obtiene detalle de una reserva.

Confirma reserva.

Cancela reserva.

Marca reserva como completada.

Reagenda reserva desde el panel privado.

### Reportes

- GET /reports/dashboard
- GET /reports/daily-agenda
- GET /reports/bookings-detail
- GET /reports/services-demand
- GET /reports/availability-status

Resumen general del tenant.

Agenda diaria.

Detalle de reservas.

Servicios mas reservados.

Estado de disponibilidad.

### Auditoría

- GET /audit-logs

Lista registros de auditoría del tenant.

## Endpoints públicos sin login

Estos endpoints permiten que el cliente final reserve sin cuenta.

- GET /public/{tenantSlug}
- GET /public/{tenantSlug}/services
- GET /public/{tenantSlug}/availability
- POST /public/{tenantSlug}/bookings
- GET /track/{trackingCode}
- POST /track/{trackingCode}/cancel
- POST /track/{trackingCode}/reschedule

Obtiene informacion pública del negocio.

Lista servicios activos del negocio.

Lista fechas y horas disponibles.

Crea una reserva pública.

Consulta reserva por codigo de tracking.

Cancela reserva por codigo de tracking.

Reagenda reserva por codigo de tracking.

## Frontend con Next.js

El frontend debe demostrar el flujo principal sin convertirse en un sistema enorme.

Area pública

| Ruta | Descripción |
| --- | --- |
| / | Landing simple del producto. |
| /book/[slug] | Página pública del negocio. |
| /book/[slug]/service | Seleccion de servicio. |
| /book/[slug]/datetime | Seleccion de fecha y hora. |
| /book/[slug]/customer | Datos del cliente. |
| /book/[slug]/confirmation | Confirmacion y tracking code. |
| /track/[code] | Consulta de reserva. |
| /track/[code]/reschedule | Reagendar reserva. |
| /track/[code]/cancel | Cancelar reserva. |

La landing no necesita pricing section. Puede explicar el producto de forma simple.

Area privada del business owner

| Ruta | Descripción |
| --- | --- |
| /login | Login del business owner. |
| /register | Registro o solicitud de tenant. |
| /dashboard | Resumen del negocio. |
| /settings/business | Configuración del tenant. |
| /service-categories | Categorías de servicios. |
| /services | Servicios. |
| /locations | Ubicaciones. |
| /business-hours | Horarios generales. |
| /availability | Bloques de disponibilidad. |
| /bookings | Gestion de reservas. |
| /customers | Clientes. |
| /reports | Reportes. |

Area simple del superadmin

| Ruta | Descripción |
| --- | --- |
| /admin/login | Login interno del superadmin, opcional. |
| /admin/tenants | Lista de tenants. |
| /admin/tenants/[id] | Detalle del tenant. |

Para el MVP, esta area puede ser muy básica.

## Prioridades del frontend

Prioridad alta

- Login del owner.
- Dashboard.
- Servicios.
- Horarios.
- Disponibilidad.
- Reservas.
- Página pública de reserva.
- Tracking público.

Estas pantallas deben existir para demostrar el flujo principal.

Prioridad media

- Registro de tenant.
- Configuración del negocio.
- Categorías de servicios.
- Clientes.
- Reportes.
- Ubicaciones.

Estas pantallas mejoran la presentacion y completan el sistema.

Prioridad baja

- Panel superadmin avanzado.
- Auditoría visual.
- Diseños secundarios.
- Filtros avanzados.

Estas pueden quedar simples.
