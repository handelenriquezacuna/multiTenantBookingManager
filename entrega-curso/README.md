# Entrega del curso — SC-404 Fundamentos de Diseño de Bases de Datos Relacionales

Índice único, orientado a la **rúbrica del curso**, para acceder rápido a cada entregable de
la base de datos sin tener que recorrer el repo. **No duplica archivos**: enlaza a la fuente
real donde vive cada script/diagrama. Toda la base de datos usa identificadores en español
(ASCII); ver [rename-map.csv](../docs/rename-map.csv) para la equivalencia con inglés.

> **Nota sobre el alcance:** el curso evalúa la **base de datos**. La API (FastAPI) y el
> frontend (Next.js) son parte del producto que el equipo construye, pero **no** son
> requisitos de la rúbrica. Todo lo evaluable está enlazado abajo.

## Próxima entrega: II Avance (semana 12, 10%)

Requiere: normalización a 3FN, DDL, tablas (mín. 10), ≥50 registros por tabla, ≥10
procedimientos almacenados y ≥5 vistas multi-tabla. **Estado: cumplido con margen** (ver tabla).

Convención de nombre del PDF de entrega: `GX_SC404_KN_IIAvance` (X = subgrupo, KN = horario).
Nombre incorrecto = −2%.

## Matriz de requisitos → evidencia

| # | Requisito (rúbrica) | Mínimo | Entregado | Evidencia (fuente real) |
|---|---------------------|--------|-----------|--------------------------|
| 1 | Propósito de la base de datos | — | ✅ | [docs/overview.md](../docs/overview.md) |
| 2 | Requerimientos definidos | — | ✅ | [docs/overview.md](../docs/overview.md), [docs/domain-questions.md](../docs/domain-questions.md) |
| 3 | Diagrama Entidad-Relación (DER) | — | ✅ | [infra/MultiTenantBookingManager.drawio](../infra/MultiTenantBookingManager.drawio) |
| 4 | Diagrama Relacional | — | ✅ | [database/diagrams/MODELO-RELACIONAL.md](../database/diagrams/MODELO-RELACIONAL.md) |
| 5 | Normalización ≥ 3FN | 3FN | ✅ | [database/diagrams/MBM-Normalizacion.xlsx](../database/diagrams/MBM-Normalizacion.xlsx), [docs/database-and-sql.md](../docs/database-and-sql.md) |
| 6 | Crear base mediante DDL | — | ✅ | [database/scripts/01-create-database.sql](../database/scripts/01-create-database.sql) |
| 7 | Tablas (mín. 10) | ≥10 | **15** | [database/scripts/02-create-tables.sql](../database/scripts/02-create-tables.sql) |
| 8 | ≥50 registros por tabla | ≥50 | **50 × 15** | [database/scripts/03-seed-data.sql](../database/scripts/03-seed-data.sql) · generador: [scripts/gen-seed.py](../scripts/gen-seed.py) |
| 9 | Procedimientos almacenados | ≥10 | **13** | [database/scripts/04-procedures.sql](../database/scripts/04-procedures.sql) |
| 10 | Vistas multi-tabla | ≥5 | **7** | [database/scripts/06-views.sql](../database/scripts/06-views.sql) |
| 11 | Funciones | ≥5 | **6** | [database/scripts/05-functions.sql](../database/scripts/05-functions.sql) |
| 12 | Triggers | ≥5 | **7** | [database/scripts/07-triggers.sql](../database/scripts/07-triggers.sql) |
| 13 | Script único con todo | — | ✅ | [database/scripts/08-full-script.sql](../database/scripts/08-full-script.sql) |

## Referencias de apoyo

- **Firmas exactas** de procedures/funciones/vistas/triggers + códigos THROW: [docs/sql-signatures.md](../docs/sql-signatures.md)
- **Base de datos construida (as-built)**, ER en mermaid y ciclo de vida de una reserva: [docs/database-and-sql-implementado.md](../docs/database-and-sql-implementado.md)
- **Cronograma, demo de defensa y matriz R1–R6 verificable**: [docs/plan-and-delivery.md](../docs/plan-and-delivery.md)
- **Credenciales de desarrollo (seed)**: [database/docs/PASSWORDS.md](../database/docs/PASSWORDS.md)

## Cómo montar y verificar la base de datos

```bash
# 1. Levantar SQL Server y correr los scripts 01–07 en orden
bash scripts/setup-db.sh          # o scripts/setup-db.ps1 en Windows

# 2. Verificar conteos por tabla (≥50) y la matriz de requisitos R3–R6
sqlcmd -S localhost -U sa -P "<password>" -C -i scripts/check-all.sql

# 3. Prueba de humo de los 13 procedures y 7 triggers
sqlcmd -S localhost -U sa -P "<password>" -C -i scripts/smoke-db.sql
```

Alternativa de un solo archivo (equivalente a correr 01–07 sobre un servidor limpio):
[database/scripts/08-full-script.sql](../database/scripts/08-full-script.sql).

## Nota para la defensa

La única tabla-por-tabla que llega a 50 filas con relleno explícito son los **catálogos de
estado** (`estados_dominios`, `estados_reservaciones`) y `superadmins`: pocos valores reales
+ filas `*_demo_NN` para cumplir el mínimo literal. La rúbrica dice "≥50 *según el objetivo o
función de cada tabla*", así que un catálogo de ~5 estados es defendible con o sin relleno;
tenerlo claro por si el/la docente pregunta.
