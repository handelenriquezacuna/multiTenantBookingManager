# Citari backend - Reporte de aptitud para frontend (GO / NO-GO)

Fecha: 2026-07-19. Branch: test/e2e-backend-validation. Stack validado:
docker compose (proyecto citari, BD citari, API localhost:8000).
Reportes de detalle: db_schema_report.md, api_report.md, e2e_flows_report.md.
Re-ejecucion completa: `make up && make test-e2e` (118 tests, ~30 s).

## Resumen ejecutivo

| Capa | Checks | PASS | FAIL | Bloqueantes |
| --- | --- | --- | --- | --- |
| Esquema DB (drift, FKs, indices, sanidad seed) | 178 | 178 | 0 | 0 |
| API funcional (60 operaciones x escenarios) | 111 tests | 111 | 0 | 0 |
| Flujos de negocio + concurrencia + logging | 7 tests (5 iter. carrera) | 7 | 0 | 0 |
| TOTAL | 296 verificaciones automatizadas | 296 | 0 | 0 |

Los defectos listados abajo fueron detectados por inspeccion dirigida de los
propios tests (comportamientos reales documentados), no como fallos de las
verificaciones: la suite corre verde y la base vuelve al seed exacto (50
filas/tabla) tras cada corrida.

## Decision: GO CONDICIONAL

Contra el criterio de GO:

| Criterio | Resultado |
| --- | --- |
| Cero fallos de aislamiento multi-tenant | CUMPLIDO - 0 fugas en 6 tipos de recurso (ID directo, listados, filtros) |
| Cero fallos de autenticacion/autorizacion | CUMPLIDO - 401/403 correctos, login generico, guards de rol |
| Happy paths con schema correcto | CUMPLIDO - 60 operaciones, camelCase conforme al handover |
| Soft delete funcionando en todos los recursos | PARCIAL - funciona en todos EXCEPTO el listado privado de availability-blocks (defecto D1) |
| Concurrencia de reservas | CUMPLIDO - 5/5 carreras con exactamente 1x201 + 1x409 |

La condicion: el frontend puede arrancar HOY con todo el flujo publico,
auth, tracking, CRUD y reportes. El unico criterio parcial (D1) esta
contenido en una sola pantalla (gestion de bloques del owner) y su fix es
de una linea; debe corregirse antes de construir esa pantalla.

## Defectos priorizados

| ID | Severidad | Defecto | Ubicacion |
| --- | --- | --- | --- |
| D1 | MAYOR | GET /availability-blocks (owner) no filtra activo=1: bloques soft-deleted aparecen en el listado privado (el publico filtra bien) | apps/api/app/repositories/availability_repository.py (list_owner) |
| D2 | MAYOR | scripts/setup-db.sh y .ps1 rotos vs compose unificado: buscan contenedor "citari-db" y servicio "sqlserver" que no existen (el contenedor real es "db"). El camino no-Docker de instalacion no funciona | scripts/setup-db.sh:7,38; scripts/setup-db.ps1:8,51 |
| D3 | MENOR | El detail del 422 es un string repr de Python, no JSON valido (inconsistente con el envelope RFC 7807 del resto) | handler de validacion en apps/api/app/main.py |
| D4 | MENOR | Errores de negocio via THROW SQL (400/409) filtran el preambulo del driver ODBC dentro de detail | apps/api/app/errors.py |
| D5 | MENOR | GET /public/{slug} devuelve email/phone/logoUrl/status siempre null: el SELECT no trae esas columnas | apps/api/app/repositories/tenant_repository.py (get_active_by_slug) |
| D6 | MENOR | Rebrand incompleto: title OpenAPI "MultiTenantBookingManager API" (Swagger), description de pyproject, README de la API | apps/api/app/main.py:44; apps/api/pyproject.toml:8 |
| D7 | MENOR | docker logs api mezcla JSON de la app con access-log no-JSON de uvicorn (sin fuga de secretos en ninguno) | configuracion uvicorn del contenedor |
| D8 | MENOR (diseno) | dominios.slug UNIQUE plano: un dominio desactivado bloquea re-crear su slug | database/scripts/02-create-tables.sql (dominios) |
| D9 | MENOR | Artefactos stale: docstring de apps/api/tests/integration/conftest.py menciona hosts viejos; apps/api/mbm_api.egg-info/ residual | rutas indicadas |

Verificado ademas (sin defecto): el token JWT, passwords y hashes bcrypt no
aparecen en ningun log; los triggers generan tracking y auditoria
correctamente; las reservas canceladas liberan su bloque (FK NULL) y el
bloque es re-reservable.

## Contrato estable para frontend

- Base URL: http://localhost:8000/api/v1 (OpenAPI en /docs y /openapi.json).
- Auth: POST /auth/login {email, password, role} -> {accessToken, user};
  header Authorization: Bearer <token>; exp 60 min; sin refresh (documentado).
- JSON camelCase; paginacion {items, total, page, pageSize};
  errores RFC 7807 {type, title, status, detail, traceId} (con la salvedad
  D3 para 422).
- Grupos estables: public/*, track/*, auth/*, tenant/current, business-types,
  service-categories, services, locations, business-hours, customers,
  bookings, admin/tenants, reports/*, audit-logs.
- Marcado INESTABLE hasta fix de D1: GET /availability-blocks (listado owner).
- No implementado (501 esperado): POST /admin/tenants (la creacion es via
  /auth/register-owner).

## Como re-ejecutar

```bash
make up        # levanta db + db-init + api y espera /ready
make test-e2e  # 118 tests caja negra (suite completa)
```

Los checks de esquema se re-ejecutan con el comando documentado al pie de
db_schema_report.md.
