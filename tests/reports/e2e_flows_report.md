# Reporte E2E de flujos de negocio - Citari (Agente 3, Flujos de negocio E2E)

Branch: `test/e2e-backend-validation`. API real en `localhost:8000` (compose
`citari`, contenedores `api`/`db`), base `citari` en SQL Server via
`docker exec db sqlcmd`. Complementa a `tests/reports/api_report.md`
(Agente 2, tester funcional endpoint x escenario): este reporte cubre
flujos de negocio de punta a punta, la condición de carrera de doble
reserva, y el estándar de logging contra operaciones reales.

## Comando de re-ejecución

```bash
apps/api/.venv/bin/pytest tests/e2e/test_flows_*.py -q      # solo este agente
apps/api/.venv/bin/pytest tests/e2e -q                       # suite completa (incluye Agente 2)
```

(equivalente a `make test-e2e` desde la raíz para la suite completa). Los 3
archivos de este agente tienen prefijo `test_flows_` y están marcados
`@pytest.mark.e2e` (el marker ya está registrado por `tests/e2e/conftest.py`,
compartido con el Agente 2).

## Resultado (DoD)

- `pytest tests/e2e/test_flows_*.py -q`: **corrida 1: `7 passed in 11.94s`**,
  **corrida 2 (inmediatamente después, sin tocar nada): `7 passed in
  11.87s`**. Verde dos veces seguidas.
- `pytest tests/e2e -q` (suite completa, Agente 2 + Agente 3): **`118 passed
  in 30.77s`** y **`118 passed in 30.57s`** (dos corridas consecutivas). 111
  tests del Agente 2 + 7 de este agente (1 ciclo completo + 5 iteraciones de
  carrera parametrizadas + 1 de logging) = 118.
- Conteos de seed verificados en **50/50** para las 11 tablas relevantes
  (`dominios`, `reservaciones`, `bloques_de_disponibilidad`, `clientes`,
  `categorias_servicios`, `servicios`, `localidades`, `horarios`,
  `duenos_de_dominios`, `codigos_de_rastreos`, `registros`) antes de correr
  este agente y de nuevo después de la suite completa. El fixture
  module-scoped `_seed_counts_intactos_alrededor_del_modulo` en
  `test_flows_ciclo_completo.py` automatiza esa verificación (dominios/
  reservaciones/bloques/clientes) en cada corrida del archivo.
- No se modificó `apps/**`, `tests/e2e/conftest.py` ni ningún
  `tests/e2e/test_api_*.py` del Agente 2. Alcance de escritura exacto:
  `tests/e2e/test_flows_*.py` (3 archivos nuevos) + este reporte.

## Archivos creados

- `tests/e2e/test_flows_ciclo_completo.py` (1 test) - flujo de negocio
  completo con un tenant nuevo: registro → activación → catálogo → reserva
  pública → tracking/reagendar/cancelar → verificación owner + superadmin.
- `tests/e2e/test_flows_carrera.py` (5 tests parametrizados) - condición de
  carrera crítica: doble POST simultáneo sobre el mismo bloque.
- `tests/e2e/test_flows_logging.py` (1 test) - estándar de logging contra
  `docker logs api` de un mini-flujo real.

## 1. Narrativa del flujo de negocio completo (`test_flows_ciclo_completo.py`)

Tenant nuevo `e2e-flow-ciclocompleto` (no del seed), un solo test que
recorre el flujo completo con status codes reales por paso:

| Paso | Acción | Status real |
| --- | --- | --- |
| a.1 | `POST /auth/register-owner` (slug `e2e-flow-ciclocompleto`, dominio nuevo) | **201** |
| a.2 | `POST /auth/login` del owner recién registrado (dominio `pendiente`) | **403** (`detail` menciona "pendiente") |
| b.1 | `POST /admin/tenants/{id}/activate` (superadmin) | **200**, `status: "activo"` |
| b.2 | `POST /auth/login` del mismo owner, ya activo | **200** |
| c.1 | `POST /service-categories` | **201** |
| c.2 | `POST /services` (30 min) | **201**, `durationMinutes: 30` |
| c.3 | `POST /locations` | **201** |
| c.4 | `PUT /business-hours` (lunes-viernes, 5 filas) | **200** |
| c.5 | `POST /availability-blocks` × 2 (bloque A 2033-06-15 10:00-10:30, bloque B 2033-06-16 11:00-11:30) | **201** cada uno |
| d.1 | `GET /public/{slug}` | **200** |
| d.2 | `GET /public/{slug}/services` (servicio nuevo presente) | **200** |
| d.3 | `GET /public/{slug}/availability?date=2033-06-15` (bloque A presente) | **200** |
| d.4 | `POST /public/{slug}/bookings` (cliente nuevo) | **201**, `status: "pending"`, `trackingCode` con formato `CITARI-XXXXXX` vigente (alfabeto de `dbo.fn_generar_codigo_rastreo`, verificado con regex) |
| e.1 | `GET /track/{code}` | **200** |
| e.2 | `POST /track/{code}/reschedule` → bloque B | **200**, `status: "rescheduled"`, `startTime: "11:00:00"` |
| e.3 | `GET /public/{slug}/availability?date=2033-06-15` (bloque A reaparece libre) | **200** |
| e.4 | `GET /public/{slug}/availability?date=2033-06-16` (bloque B ocupado) | **200**, bloque B ausente |
| e.5 | `POST /track/{code}/cancel` | **200**, `status: "cancelled"` |
| e.6 | `GET /public/{slug}/availability?date=2033-06-16` (bloque B reaparece libre) | **200** |
| f.1 | `GET /bookings` (owner) - reserva presente, `status: "cancelled"` | **200** |
| f.2 | `GET /reports/dashboard` (owner) - `totalBookings:1, cancelledBookings:1, totalCustomers:1, totalActiveServices:1, totalActiveLocations:1` | **200** |
| f.3 | `GET /audit-logs?tenantId=<nuevo>` (superadmin) - 3 filas: 1 `reserva_creada` + 2 `reserva_actualizada` (insert, reschedule, cancel - triggers 2 y 3 de `07-triggers.sql`) | **200** |
| g | Limpieza total (11 `DELETE` en orden FK-seguro, registrados apenas se conoce `tenant_id`) | seed 50/50 verificado antes y después |

Todos los pasos se ejecutaron con el status esperado. El flujo confirma
extremo a extremo: el guard de dominio `pendiente` (403 en login antes de
activar), la coherencia servicio↔bloque (30 min, disponibilidad pública), el
ciclo tracking completo (reservar→reagendar→cancelar liberando bloques en
cada transición vía el trigger `trg_liberar_bloque_al_cancelar`), y que la
auditoría automática por trigger llega completa hasta `GET /audit-logs`
filtrado por el tenant nuevo.

## 2. Tabla de las 5 iteraciones de carrera (`test_flows_carrera.py`)

Cada iteración: un bloque nuevo en dominio 1 del seed (`barberia-el-colocho`,
localidad 1), fecha 2033-08-0N única, 2 threads sincronizados con
`threading.Barrier(2)` disparando `POST /public/{slug}/bookings` sobre el
mismo bloque con clientes distintos. Resultado real de las 5 corridas
(idéntico en las dos ejecuciones completas del archivo):

| Iteración | Fecha del bloque | Thread A | Thread B | Resultado |
| --- | --- | --- | --- | --- |
| 1 | 2033-08-01 | 409 | 201 | PASS (exactamente 1×201 + 1×409) |
| 2 | 2033-08-02 | 409 | 201 | PASS |
| 3 | 2033-08-03 | 409 | 201 | PASS |
| 4 | 2033-08-04 | 409 | 201 | PASS |
| 5 | 2033-08-05 | 409 | 201 | PASS |

**5/5 iteraciones cumplen el resultado exacto esperado** (un único 201 +
un único 409, envelope RFC 7807 verificado en el 409). No se encontró
ninguna iteración con 2×201 (doble reserva del mismo bloque) ni 2×409
(bloque libre que nadie reservó) - **cero hallazgos bloqueantes** en esta
área. Por cada 201 se verificó además la invariante de negocio (mismo
resguardo que el trigger `trg_prevenir_doble_reservacion`): exactamente 1
fila en `reservaciones` con `bloque_disponibilidad_id` = el bloque de la
iteración y estado ≠ `cancelada`.

Observación (no es un defecto): en las 5 iteraciones el thread **B** ganó
la carrera consistentemente (thread A siempre recibió 409). Es coherente
con que `ThreadPoolExecutor` despacha las tareas en orden de `submit()` y el
runtime/GIL de Python puede favorecer sistemáticamente al segundo hilo
lanzado en el `wait()` del `Barrier` en este entorno; el punto de la prueba
(exclusión mutua bajo `UPDLOCK`+`HOLDLOCK`, no equidad de scheduling) queda
igual de validado sin importar cuál thread gane.

## 3. Estándar de logging (`test_flows_logging.py`)

Mini-flujo real con marca temporal `--since` antes de arrancar: login
(owner1) → `POST /availability-blocks` → `POST /public/{slug}/bookings` →
`POST /track/{code}/cancel`. Captura via `docker logs api --since <marca
RFC3339 con microsegundos>` (`subprocess`), corrida contra el contenedor
real (`LOG_FORMAT` no está seteado explícitamente en `.env`/`docker-compose.yml`
para este entorno, así que la API corre con el default documentado en
`docs/api-handover.md`: `LOG_FORMAT=json`).

**Campos vistos** (una corrida representativa del mini-flujo):

- 14 líneas JSON de la app (`app/logging_config.py::JsonFormatter`), de las
  cuales 4 son `"message": "request completed"` (una por cada request HTTP
  del mini-flujo: login, crear bloque, reserva pública, cancelar) y 10 son
  `"message": "sql call"` (una por cada SP/vista invocada).
- Las 4 líneas `request completed` traen los 5 campos requeridos:
  `request_id`, `method`, `path`, `status`, `sp` (más `duration_ms`).
  Ejemplo real capturado:
  `{"timestamp": "...", "level": "INFO", "request_id": "...", "message": "request completed", "method": "POST", "path": "/api/v1/auth/login", "sp": "-", "duration_ms": 42, "status": 200}`
- Las 10 líneas `sql call` traen `sp` y `duration_ms` (más `status`: `"ok"`
  en todas, ninguna `"error"` en esta corrida). Ejemplo real:
  `{"timestamp": "...", "level": "INFO", "request_id": "...", "message": "sql call", "sp": "sp_crear_reservacion", "duration_ms": 3, "status": "ok"}`
- Toda línea JSON, sin excepción, trae los 4 campos base del formatter:
  `timestamp`, `level`, `request_id`, `message`.

**Formato real observado (documentado, ver hallazgo #2 abajo)**: el stream
de `docker logs api` **no es JSON puro línea por línea**. Junto a las 14
líneas JSON de la app aparecen 4 líneas del **access log por defecto de
uvicorn** (formato `INFO:     <ip> - "<method> <path> HTTP/1.1" <status>
<reason>`, ajeno a `app/logging_config.py`), una por cada request HTTP del
mini-flujo. Ejemplo real: `INFO:     192.168.65.1:63418 - "POST
/api/v1/auth/login HTTP/1.1" 200 OK`. El test las detecta con un patrón
(`^(INFO|WARNING|ERROR|DEBUG|CRITICAL):\s`) y falla solo si aparece alguna
línea que **no** calce ni con JSON ni con ese patrón (formato realmente
desconocido) - en las corridas realizadas, el 100% de las líneas no-JSON
correspondió al access log de uvicorn, ninguna de formato desconocido.

**Salida del grep negativo**: sobre el log crudo completo (JSON + no-JSON)
del rango capturado, ninguna de las siguientes cadenas aparece en ningún
punto: el JWT (`accessToken`) usado en el login de esta misma corrida, la
password de seed `bowner123`, la password de seed `Admin123`, ni el prefijo
de hash bcrypt `$2b$`. **Grep negativo limpio en las 2 corridas
consecutivas del archivo.**

## Defectos y desviaciones encontradas

### 1. [MENOR] `GET /public/{slug}` siempre devuelve `email`/`phone`/`logoUrl`/`status` en `null`

- **Ubicación**: `apps/api/app/repositories/tenant_repository.py`,
  `TenantRepository.get_active_by_slug` (usado por `GET /public/{slug}` y,
  indirectamente, por `POST /public/{slug}/bookings` vía
  `_require_active_tenant`). El `SELECT` solo trae `dominio_id, slug,
  nombre, descripcion, mensaje_publico`; nunca `correo`, `telefono`,
  `logo_url` ni `estado_nombre` (join a `estados_dominios`).
  `app/mappers/tenant_mapper.py::map_tenant` solo agrega esas 4 claves al
  resultado **si están presentes en la fila de entrada** (patrón
  "conditional field" documentado en su propio docstring), así que
  simplemente no aparecen - Pydantic las serializa como `null` por ser
  campos opcionales de `TenantResponse`.
- **Repro**: `curl -s http://localhost:8000/api/v1/public/barberia-el-colocho`
  (dominio 1 del seed, con `correo`/`telefono` reales en la tabla
  `dominios`) devuelve `"email": null, "phone": null, "logoUrl": null,
  "status": null`. Confirmado también con el tenant nuevo creado en
  `test_flows_ciclo_completo.py` (paso d.1).
- **Impacto**: bajo. El storefront público (`/public/{slug}`) es, por
  definición del propio SP `dbo.fn_dominio_activo`, siempre un dominio
  `activo` cuando el endpoint responde 200 - así que `status: null` no
  esconde un dominio inactivo, solo omite un dato redundante. `email`/
  `phone`/`logoUrl` sí podrían ser información legítimamente útil para un
  storefront público (contacto del negocio) y hoy no llegan. Es una
  inconsistencia real frente a `GET /admin/tenants/{id}` y `GET
  /tenant/current`, que sí seleccionan esas columnas y sí las devuelven.
  El test de shape del Agente 2
  (`test_api_public_track.py::test_public_tenant_shape`) no lo detectó
  porque solo verifica las **claves** presentes (`set(body.keys()) ==
  {...}`), no sus valores.
- **Test que lo documenta**: `test_flows_ciclo_completo.py::test_ciclo_completo_flujo_de_negocio_extremo_a_extremo`,
  paso (d), asercion `assert public_tenant_resp.json()["status"] is None`
  con comentario inline explicando la causa exacta. Si se corrige el
  `SELECT`/mapper, esa línea empezará a fallar (a propósito) y hay que
  actualizar este reporte.

### 2. [MENOR] El stream de `docker logs api` mezcla el JSON de la app con el access log por defecto de uvicorn (no-JSON)

- **Ubicación**: `apps/api/Dockerfile` (`CMD ["uvicorn", "app.main:app",
  ...]`, sin `--no-access-log` ni `--log-config`); uvicorn trae su propio
  logger de acceso (`uvicorn.access`) independiente de
  `app/logging_config.py::setup_logging`, que solo configura el logger
  raíz de la aplicación.
- **Detalle**: por cada request HTTP, además de la línea JSON `"message":
  "request completed"` que emite la app, uvicorn escribe su propia línea
  de texto plano (`INFO:     <ip> - "<method> <path> HTTP/1.1" <status>
  <reason>`) al mismo stream de salida del contenedor. En una corrida del
  mini-flujo de 4 requests, 4 de las 18 líneas totales (~22%) fueron de
  este formato ajeno.
- **Impacto**: bajo, pero real para cualquier agregador de logs que asuma
  "un objeto JSON por línea" en `docker logs api` (`docs/api-handover.md`,
  sección "Estándar de logging", no aclara esta mezcla explícitamente).
  No hay fuga de datos sensibles en estas líneas (verificado por el grep
  negativo: la línea de uvicorn solo trae IP/método/path/status, nunca
  headers ni body), así que no es un problema de seguridad, solo de
  homogeneidad del formato de logging para observabilidad.
- **Test que lo documenta**: `test_flows_logging.py::test_logging_standard_json_fields_and_no_secrets_leak`
  (clasifica líneas JSON vs. no-JSON, reporta ambos conteos, y solo falla
  si aparece una línea que no calce ni con JSON ni con el patrón de access
  log de uvicorn).

No se encontraron defectos de severidad **mayor** ni **bloqueante** en el
alcance de este agente (flujo de negocio completo, condición de carrera,
estándar de logging). En particular, el punto más crítico del brief - la
condición de carrera de doble reserva sobre `POST
/public/{slug}/bookings` - se comportó de forma correcta y consistente en
las 5 iteraciones: el bloqueo pesimista `UPDLOCK`+`HOLDLOCK` de
`sp_crear_reservacion` (docs/sql-signatures.md #9) sí serializa
correctamente el acceso concurrente al mismo bloque bajo carga real de
threads.

## Notas de infraestructura (no son defectos de la API)

- Igual que documentó el Agente 2 en `tests/reports/api_report.md`:
  `tests/e2e/conftest.py::run_sql` invoca `sqlcmd` sin `-b`, así que un
  `DELETE` de limpieza que violara una FK no haría fallar el proceso
  `sqlcmd` de forma ruidosa. Este agente diseñó las 11 sentencias de
  limpieza del tenant temporal en `test_flows_ciclo_completo.py` (y las de
  `test_flows_carrera.py`/`test_flows_logging.py`) verificando a mano el
  orden FK real contra `database/scripts/02-create-tables.sql` (no contra
  prueba y error), y confirmó empíricamente que una corrida fallida (la
  primera corrida de `test_flows_ciclo_completo.py`, antes de corregir el
  hallazgo #1) igual dejó la base en 50/50 tras el teardown - la limpieza
  se registra completa apenas se conoce `tenant_id`, antes de que el resto
  del flujo pueda fallar.
- `docker logs api --since <marca>` acepta timestamps RFC3339 con
  microsegundos (`datetime.now(UTC).isoformat()`), confirmado
  empíricamente contra el contenedor real; se usa esa precisión en vez de
  segundos enteros para evitar capturar de más (ruido de otras
  corridas/tests) o de menos (perder la primera línea del mini-flujo por
  redondeo).

## Verificación de conteos de seed (detalle)

| Tabla | Antes de este agente | Después de las 2 corridas completas |
| --- | --- | --- |
| `dominios` | 50 | 50 |
| `reservaciones` | 50 | 50 |
| `bloques_de_disponibilidad` | 50 | 50 |
| `clientes` | 50 | 50 |
| `categorias_servicios` | 50 | 50 |
| `servicios` | 50 | 50 |
| `localidades` | 50 | 50 |
| `horarios` | 50 | 50 |
| `duenos_de_dominios` | 50 | 50 |
| `codigos_de_rastreos` | 50 | 50 |
| `registros` | 50 | 50 |

Cero residuos del tenant temporal (`e2e-flow-ciclocompleto`), de los
clientes/reservas de las 5 iteraciones de carrera, ni del mini-flujo de
logging, en ninguna de las corridas realizadas.
