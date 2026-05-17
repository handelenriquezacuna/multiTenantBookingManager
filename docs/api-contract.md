# Contrato de API

## Autenticación

- POST /auth/login
- POST /auth/register-owner
- GET /auth/me
- POST /auth/logout

## Superadmin

- GET /admin/tenants
- GET /admin/tenants/{id}
- POST /admin/tenants/{id}/activate
- POST /admin/tenants/{id}/suspend

## Tenant privado

- GET /tenant/current
- PATCH /tenant/current

## Tipos de negocio

- GET /business-types

## Categorías de servicios

- GET /service-categories
- POST /service-categories
- PATCH /service-categories/{id}
- DELETE /service-categories/{id}

## Servicios

- GET /services
- POST /services
- GET /services/{id}
- PATCH /services/{id}
- DELETE /services/{id}

## Ubicaciones

- GET /locations
- POST /locations
- PATCH /locations/{id}
- DELETE /locations/{id}

## Horarios del negocio

- GET /business-hours
- PUT /business-hours

## Bloques de disponibilidad

- GET /availability-blocks
- POST /availability-blocks
- PATCH /availability-blocks/{id}
- DELETE /availability-blocks/{id}

## Clientes

- GET /customers
- POST /customers
- GET /customers/{id}
- PATCH /customers/{id}
- GET /customers/{id}/bookings

## Reservas privadas

- GET /bookings
- GET /bookings/{id}
- POST /bookings/{id}/confirm
- POST /bookings/{id}/cancel
- POST /bookings/{id}/complete
- POST /bookings/{id}/reschedule

## Reportes

- GET /reports/dashboard
- GET /reports/daily-agenda
- GET /reports/bookings-detail
- GET /reports/services-demand
- GET /reports/availability-status

## Auditoría

- GET /audit-logs

## Endpoints públicos

- GET /public/{tenantSlug}
- GET /public/{tenantSlug}/services
- GET /public/{tenantSlug}/availability
- POST /public/{tenantSlug}/bookings
- GET /track/{trackingCode}
- POST /track/{trackingCode}/cancel
- POST /track/{trackingCode}/reschedule
