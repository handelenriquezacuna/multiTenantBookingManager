# MBM Agents Guide

This repo is the Multi tenant Booking Manager (MBM) for SC-404. The database is the primary deliverable, with API + frontend used to demonstrate the booking flow.

## Product Scope

- Multi tenant booking platform for service businesses (barbershops, salons, spas, clinics, etc.).
- Three actors: Superadmin, Business owner, Cliente (public).
- Public booking flow without login and tracking code for cancel/reschedule.
- MVP focus: complete DB design, scripts, and a minimal functional flow.

Non-goals for the MVP include payments, pricing plans, advanced roles, notifications, mobile app, microservices, or cloud production.

## Architecture

- SQL Server as the core of business logic (procedures, functions, views, triggers).
- FastAPI + Uvicorn for API layer, mainly calling stored procedures and views.
- Next.js + TypeScript frontend for public and private flows.
- Docker Compose to run SQL Server, API, and frontend.

## Repository Structure (expected)

- `apps/frontend`: Next.js app and UI.
- `apps/api`: FastAPI backend.
- `database`: scripts, diagrams, and DB docs.
- `infra`: Dockerfiles and SQL Server infra.
- `docs`: canonical requirements and project docs.

## Database Deliverables (minimum)

- 15 tables (business_types, tenant_statuses, superadmins, tenants, tenant_owners, customers,
  service_categories, services, locations, business_hours, availability_blocks, booking_statuses,
  bookings, tracking_codes, audit_logs).
- Normalized to 3FN.
- Scripts in `database/scripts`:
  - `01-create-database.sql`
  - `02-create-tables.sql`
  - `03-seed-data.sql` (>= 50 rows per table)
  - `04-procedures.sql` (>= 10 procedures)
  - `05-functions.sql` (>= 5 functions)
  - `06-views.sql` (>= 5 views)
  - `07-triggers.sql` (>= 5 triggers)
  - `08-full-script.sql` (full rebuild)

## API Expectations

Backend routes should align with `docs/api-and-frontend.md`.
- Auth: `/auth/*`
- Superadmin: `/admin/tenants` + activate/suspend
- Tenant private: `/tenant/current`
- Catalogs: `/business-types`, `/service-categories`, `/services`, `/locations`
- Scheduling: `/business-hours`, `/availability-blocks`
- Customers: `/customers`
- Bookings: `/bookings` + confirm/cancel/complete/reschedule
- Reports: `/reports/*`
- Audit: `/audit-logs`
- Public: `/public/{tenantSlug}/*`, `/track/{trackingCode}/*`

Important: availability blocks must not be manually edited by owners in the UI; they are derived from business hours, locations, and bookings.

## Frontend Routes (minimum)

Public:
- `/`, `/book/[slug]/*`, `/track/*`

Owner:
- `/login`, `/register`, `/dashboard`, `/services`, `/service-categories`, `/locations`,
  `/business-hours`, `/bookings`, `/customers`, `/reports`, `/settings/business`

Superadmin:
- `/admin/login`, `/admin/tenants`, `/admin/tenants/[id]`

## Git Workflow

- Stable branch: `main`
- Integration branch: `develop`
- Feature branches: `feature/*`
- No direct work in `main`; use PRs into `develop`, then `develop` into `main` when stable.

## Diagrams

- `infra/MultiTenantBookingManager.drawio` is the canonical diagram. The last version on `main` is the approved one.

## Style Rules

- Em dashes (—) and en dashes (–) are banned. Use commas, periods, or colons instead.
- Hyphens (-) only allowed in list markers, code, or URLs. Never in prose or commit messages.
- Commit messages: lowercase, no hyphens in prose. Use spaces or colons to separate ideas.

## Docs Source of Truth

If there is conflict, `docs/` is the source of truth for scope and structure.
