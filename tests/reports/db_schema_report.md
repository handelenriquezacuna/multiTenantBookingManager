# Reporte de validacion de esquema DB — Citari (Agente 1)

Fecha de ejecucion: 2026-07-19/20 (ver timestamps en evidencia).
Base de datos viva: `citari`, contenedor `db` (compose proyecto citari), seed de
50 filas/tabla. Script de checks: `tests/e2e/db/schema_checks.sql` (re-ejecutable,
solo SELECT/PRINT).

Fuentes de verdad usadas (sin re-derivar, solo comparacion vivo vs declarado):
- `docs/rename-map.csv` — 15 tablas/columnas esperadas.
- `database/scripts/02-create-tables.sql` — tipos, defaults, indice filtrado, FKs.
- `docs/sql-signatures.md` — 13 SPs, 6 funciones, 7 vistas, 7 triggers.

## Resultado global

Dos ejecuciones completas de `schema_checks.sql`, mismo resultado en ambas:

| Ejecucion | total_items | total_fail | resultado_global |
| --- | --- | --- | --- |
| 1 | 178 | 0 | PASS |
| 2 | 178 | 0 | PASS |

Unica diferencia textual entre ambas corridas: la evidencia de
`06.010 fila_count_min50:localidades` paso de `n=50` a `n=51` (otros agentes
E2E insertaron datos en el ambiente compartido entre corridas — ver
"Observaciones"). No afecto ningun PASS/FAIL porque el check usa umbral `>= 50`,
no igualdad exacta. Ningun otro item cambio de estado.

## Tabla de resultados por check

| # | Check | Items | Fails | Resultado | Evidencia breve |
| - | --- | --- | --- | --- | --- |
| 1 | DRIFT: 15 tablas + columnas (nombre/tipo/nullable) vs 02-create-tables.sql | 31 | 0 | PASS | 15/15 tablas existen, 0 tablas inesperadas, 15/15 tablas con columnas identicas (126 columnas comparadas, 0 diferencias) |
| 2 | Soft delete: `activo BIT DEFAULT 1`; `creado_en`/`actualizado_en` DEFAULT `sysutcdatetime()` | 30 | 0 | PASS | 9/9 tablas con `activo` default `((1))`; 11/11 con `creado_en` default `sysutcdatetime()`; 10/10 con `actualizado_en` default `sysutcdatetime()` |
| 3 | Indice filtrado `ux_reservaciones_bloque` | 1 | 0 | PASS | `is_unique=1 has_filter=1 filter=([bloque_disponibilidad_id] IS NOT NULL)` |
| 4 | FKs declaradas en 02 (existencia + huerfanos=0) | 45 | 0 | PASS | 22/22 FKs existen, `fk_count_22` vivo=22, 22/22 queries de huerfanos devuelven 0 filas |
| 5 | Multi-tenant `dominio_id` en tablas operacionales | 10 | 0 | PASS | 9/9 tablas con `dominio_id` y nullability correcta (8 NOT NULL + `registros` NULL); excepcion `codigos_de_rastreos` confirmada (hereda via `reserva_id`) |
| 6 | Sanidad de datos (seed) | 20 | 0 | PASS | 15/15 tablas `>= 50` filas; canceladas con bloque NULL=0; bloques liberados inconsistentes=0; codigos duplicados=0; prefijo detectado `CITARI-` (50/50, formato uniforme); duplicados en `bloque_disponibilidad_id`=0 |
| 7 | Programables: 13 SPs, 6 funciones, 7 vistas (>=2 tablas c/u), 7 triggers | 41 | 0 | PASS | 13/13 SPs, 6/6 funciones, 7/7 vistas (3 a 7 tablas referenciadas cada una, todas >=2), 7/7 triggers; 0 objetos extra en cada categoria |
| 8 | Hallazgo de diseno: `dominios.slug` UNIQUE plano | 1 | — | INFO | Confirmado vigente en vivo: constraint UNIQUE no filtrado sobre `slug` (ver seccion de hallazgos) |

**Resultado global: PASS (178/178 items, 0 fallas) en ambas ejecuciones.**

## Defectos y hallazgos

No se encontro drift real de esquema (tablas, columnas, tipos, nullability,
defaults, indices o FKs vivos coinciden exactamente con `02-create-tables.sql`).
No se encontraron huerfanos en ninguna FK ni inconsistencias en los datos del
seed.

### Hallazgo 1 — `dominios.slug` UNIQUE plano (SEVERIDAD: MENOR)

Confirmado en vivo (`sys.indexes`: `is_unique_constraint=1`, `has_filter=0`
sobre la columna `slug` de `dominios`). Es un `UNIQUE` constraint clasico, no
un indice filtrado como el de `ux_reservaciones_bloque`.

- **Impacto**: un dominio soft-deleted (`activo=0`) sigue ocupando su `slug`
  en el constraint. Si se intenta re-crear un dominio nuevo con ese mismo
  `slug` via `sp_crear_dominio`, la operacion falla por violacion de UNIQUE
  aunque el dominio original este dado de baja.
- **Alcance**: acotado — solo afecta el caso de reciclar el slug de un
  dominio inactivo; no afecta la operacion normal de dominios activos ni
  ningun otro flujo.
- **Mitigacion sugerida** (fuera de alcance de este check, solo referencia):
  reemplazar el `UNIQUE` plano por un indice unico filtrado
  `WHERE activo = 1`, siguiendo el mismo patron ya usado en
  `ux_reservaciones_bloque`.

### Nota de documentacion (no defecto)

La consigna original de este check menciona "10 tablas operacionales" para
el check 5 (multi-tenant) pero enumera 9 nombres (`duenos_de_dominios`,
`clientes`, `categorias_servicios`, `servicios`, `localidades`, `horarios`,
`bloques_de_disponibilidad`, `reservaciones`, `registros`), ademas de la
excepcion documentada `codigos_de_rastreos`. El check se implemento contra
las 9 tablas listadas explicitamente (que es lo que declara
`02-create-tables.sql`); no se detecto ninguna tabla operacional adicional
con `dominio_id` sin verificar. Se deja constancia por si el conteo "10" en
la consigna original queria decir algo distinto (p. ej. incluir `dominios`
mismo, cuya PK *es* `dominio_id` pero no es una FK de tenant).

### Observaciones (no defectos)

- El ambiente `citari`/`db` es compartido: entre la primera y segunda
  ejecucion del script, otro agente/proceso E2E inserto nuevas filas en
  `dominios` (se observaron registros `ZZ E2E Test Business` con slugs
  `zz-e2e-...`) y en `localidades` (el conteo subio de 50 a 51). Esto es
  consistente con el diseno del check 6, que usa `>= 50` en vez de `= 50`
  precisamente para tolerar un ambiente vivo compartido.
- El prefijo de `codigo_rastreo` vigente en los datos es `CITARI-` (100% de
  las 50 filas), consistente con `dbo.fn_generar_codigo_rastreo` documentado
  en `docs/sql-signatures.md`. No se encontro ningun codigo con prefijo
  `MBM-` en el seed actual.

## Como re-ejecutar los checks

```bash
docker cp tests/e2e/db/schema_checks.sql db:/tmp/schema_checks.sql
docker exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
  -P "$(/usr/bin/grep '^SQLSERVER_PASSWORD' .env | cut -d= -f2)" \
  -C -I -d citari -W -i /tmp/schema_checks.sql
```

(Ejecutar desde la raiz del repo, con el contenedor `db` del compose de
`citari` levantado y saludable.)

## Evidencia real resumida (ambas ejecuciones)

Rollup por check (identico en ambas corridas):

```
check_num items fails check_global
--------- ----- ----- ------------
1         31    0     PASS
2         30    0     PASS
3         1     0     PASS
4         45    0     PASS
5         10    0     PASS
6         20    0     PASS
7         41    0     PASS
```

Linea de resumen final, ejecucion 1:

```
 [schema-checks] RESUMEN total_items=178 total_fail=0 resultado_global=PASS
```

Linea de resumen final, ejecucion 2:

```
 [schema-checks] RESUMEN total_items=178 total_fail=0 resultado_global=PASS
```

Muestra representativa de items por check (salida real, ejecucion 1):

```
 [schema-checks] 01.001 tabla_existe:bloques_de_disponibilidad ... PASS (object_id=1893581784)
 [schema-checks] 01.016 sin_tablas_inesperadas ... PASS (extras=0)
 [schema-checks] 01.017 columnas_coinciden:bloques_de_disponibilidad ... PASS (sin diferencias)
 [schema-checks] 02.001 activo_bit_default1:bloques_de_disponibilidad ... PASS (tipo=bit nullable=0 default=((1)))
 [schema-checks] 02.031 creado_en_default_sysutcdatetime:bloques_de_disponibilidad ... PASS (tipo=datetime2 nullable=0 default=(sysutcdatetime()))
 [schema-checks] 02.061 actualizado_en_default_sysutcdatetime:bloques_de_disponibilidad ... PASS (tipo=datetime2 nullable=0 default=(sysutcdatetime()))
 [schema-checks] 03.001 indice_filtrado_ux_reservaciones_bloque ... PASS (is_unique=1 has_filter=1 filter=([bloque_disponibilidad_id] IS NOT NULL))
 [schema-checks] 04.050 fk_count_22 ... PASS (count_vivo=22 esperado=22)
 [schema-checks] 04.117 fk_huerfanos:reservaciones.bloque_disponibilidad_id ... PASS (huerfanos=0)
 [schema-checks] 05.007 dominio_id_presente:registros ... PASS (is_nullable=1 esperado=1)
 [schema-checks] 05.020 excepcion_codigos_de_rastreos_hereda_via_reserva ... PASS (codigos_de_rastreos no tiene columna dominio_id propia; el tenant se resuelve via reserva_id -> reservaciones.dominio_id (diseno documentado, no defecto))
 [schema-checks] 06.020 canceladas_bloque_null ... PASS (reservas_canceladas_con_bloque_no_null=0)
 [schema-checks] 06.023 codigo_rastreo_formato_prefijo ... PASS (prefijos_detectados=CITARI-:50)
 [schema-checks] 07.001 sp_count_13 ... PASS (count=13)
 [schema-checks] 07.024 vw_count_7 ... PASS (count=7)
 [schema-checks] 07.033 tr_count_7 ... PASS (count=7)
 [schema-checks] 08.001 hallazgo_dominios_slug_unique_no_filtrado ... INFO (SEVERIDAD=MENOR: dominios.slug tiene un UNIQUE constraint plano (no filtrado)...)
```
