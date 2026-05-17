# Requerimientos

## Requerimientos funcionales

- Registro o creación de negocios/tenants.
- Activación o suspensión de tenants por parte de un superadmin.
- Login del business owner.
- Panel privado para el business owner.
- Configuración básica del negocio.
- Creación de categorías de servicios.
- Creación de servicios.
- Configuración de horarios del negocio.
- Creación de bloques de disponibilidad.
- Página pública de reservas para cada tenant.
- Creación de reservas sin login.
- Generación de código de tracking.
- Consulta pública de reserva por código.
- Cancelación de reserva por código.
- Reagendamiento de reserva por código.
- Gestión básica de reservas desde el panel privado.
- Reportes básicos.
- Auditoría básica de acciones importantes.

## Requerimientos no funcionales

- Arquitectura: SQL Server → FastAPI + Uvicorn + Python → Next.js + TypeScript → Docker.
- Base de datos normalizada al menos a 3FN.
- Scripts SQL completos (DDL, seed data, procedures, functions, views, triggers).
- Multi-tenant con aislamiento de datos por negocio.
- Endpoints públicos y privados definidos.
- Docker Compose funcional para SQL Server, API y frontend.
