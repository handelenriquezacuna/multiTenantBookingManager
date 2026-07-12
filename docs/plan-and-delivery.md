# Trabajo del equipo

## Indice

- [Trabajo del equipo](#trabajo-del-equipo)
  - [Indice](#indice)
  - [Matriz de cumplimiento de requisitos (R1-R6)](#matriz-de-cumplimiento-de-requisitos-r1-r6)
  - [Entregables del curso](#entregables-del-curso)
  - [Cronograma recomendado](#cronograma-recomendado)
  - [Demo minima para la defensa](#demo-minima-para-la-defensa)
  - [Checklist de cumplimiento](#checklist-de-cumplimiento)
  - [Recap final del proyecto](#recap-final-del-proyecto)

## Matriz de cumplimiento de requisitos (R1-R6)

Los seis requisitos oficiales del curso (Avance II, semana 12) y su
evidencia verificable en este repositorio:

| Requisito | Evidencia | Comando de verificacion | Estado |
| --- | --- | --- | --- |
| R1 — normalizacion hasta 3FN documentada | [docs/database-and-sql.md](database-and-sql.md), seccion "Normalización de la base de datos" (1FN/2FN/3FN explicadas tabla por tabla) | lectura del documento | [x] DONE |
| R2 — DDL completo | `database/scripts/02-create-tables.sql` (15 tablas, PK/FK) + `database/scripts/08-full-script.sql` (script unico, una sola pasada) | `bash scripts/setup-db.sh` (ejecuta 01-07 en orden) o `sqlcmd -i database/scripts/08-full-script.sql` | [x] DONE |
| R3 — minimo 10 tablas | 15 tablas en español ASCII (ver `docs/rename-map.csv` para la equivalencia con los nombres en ingles del diseño original) | `scripts/check-all.sql` (matriz de abajo) o `SELECT COUNT(*) FROM sys.tables` | [x] DONE (15/10) |
| R4 — minimo 50 registros por tabla, datos coherentes | Seed data en `database/scripts/03-seed-data.sql`, generado por `scripts/gen-seed.py`; coherencia de FKs verificada por `scripts/smoke-db.sql` (12 casos) | `scripts/check-all.sql` (matriz de abajo) | [x] DONE (15/15 tablas >= 50) |
| R5 — minimo 10 stored procedures | 13 SPs en `database/scripts/04-procedures.sql`, documentados en [docs/sql-signatures.md](sql-signatures.md) seccion 1 | `SELECT COUNT(*) FROM sys.procedures;` | [x] DONE (13/10) |
| R6 — minimo 5 vistas multi-tabla | 7 vistas en `database/scripts/06-views.sql` (cada una referencia 2+ tablas base), documentadas en [docs/sql-signatures.md](sql-signatures.md) seccion 2 | `SELECT COUNT(*) FROM sys.views;` | [x] DONE (7/5) |

Adicional a los seis requisitos minimos: 6 funciones escalares
(`database/scripts/05-functions.sql`) y 7 triggers
(`database/scripts/07-triggers.sql`), tambien documentados en
`docs/sql-signatures.md`.

### Salida real de `scripts/check-all.sql`

Ejecutado contra el contenedor `mbm_sqlserver` (schema + seed aplicados via
`scripts/setup-db.sh`):

```bash
source .env
docker cp scripts/check-all.sql mbm_sqlserver:/tmp/ca.sql
docker exec mbm_sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P "$SQLSERVER_PASSWORD" -C -I -d mbm_booking -i /tmp/ca.sql
```

Muestra de conteos por tabla (las 15 tablas, minimo 50 filas cada una;
salida de un rebuild limpio desde cero con `docker compose down -v &&
bash scripts/setup-db.sh`):

```
 conteo de filas por tabla (minimo 50):
 tipos_negocios ............... 50 OK
 estados_dominios ............. 50 OK
 estados_reservaciones ........ 50 OK
 superadmins .................. 50 OK
 dominios ..................... 50 OK
 duenos_de_dominios ........... 50 OK
 clientes ..................... 50 OK
 categorias_servicios ......... 50 OK
 servicios .................... 50 OK
 localidades .................. 50 OK
 horarios ..................... 50 OK
 bloques_de_disponibilidad .... 50 OK
 reservaciones ................ 50 OK
 codigos_de_rastreos .......... 50 OK
 registros .................... 50 OK
```

Matriz R3-R6 (salida literal):

```
 matriz de requisitos:
 R3 tablas: 15 (minimo 10) ............ OK
 R4 registros: 15/15 tablas >= 50 ..... OK
 R5 procedimientos: 13 (minimo 10) .... OK
 R6 vistas multi-tabla: 7 (minimo 5) . OK
```

Nota de coherencia del seed: las 10 reservaciones canceladas del seed tienen
su bloque liberado (`bloque_disponibilidad_id = NULL`), replicando el efecto
del trigger `trg_liberar_bloque_al_cancelar`; sus fechas historicas se
conservan en las columnas denormalizadas. Asi los bloques de esas reservas
son reservables de nuevo, igual que en operacion real.

El trabajo se organiza por tareas y no por personas, para que todo el equipo participe en cada fase y todos conozcan el proyecto completo.

Tareas principales:

- Diseño del modelo y normalización.
- Scripts DDL y datos de prueba.
- Procedures, functions, views y triggers.
- Backend FastAPI y endpoints.
- Frontend Next.js y flujo principal.
- Docker Compose, setup y documentación.
- Pruebas, demo y defensa.

La meta es que cada integrante pueda explicar base de datos, relaciones, normalización y el flujo principal.

## Entregables del curso

Semana 7: Avance I

Valor: 10%

El primer avance debe cubrir los puntos 1 al 4 del proyecto.

Debe incluir:

- Descripción del proyecto.
- Objetivo general.
- Objetivos especificos.
- Análisis del problema.
- Requerimientos funcionales.
- Requerimientos no funcionales.
- Lista de entidades.
- Atributos principales.
- Llaves primarias.
- Llaves foraneas.
- Análisis de relaciones.
- Diagrama Entidad-Relación.
- Modelo relacional.

En esta etapa no es obligatorio tener toda la base programada. Lo importante es demostrar que el diseño esta bien planteado.

Nombre del archivo PDF:

- GX_SC404_KN_IAvance

Ejemplo:

- G7_SC404_KN_IAvance

Semana 12: Avance II

Valor: 10%

Debe incluir:

- Normalización de la base de datos al menos a 3FN.
- Base de datos creada en SQL Server.
- Mínimo 10 tablas.
- Llaves primarias.
- Llaves foraneas.
- Inserción de al menos 50 registros por tabla.
- Al menos 10 procedimientos almacenados.
- Al menos 5 funciones SQL.

Nombre del archivo PDF:

- GX_SC404_KN_IIAvance

Ejemplo:

- G7_SC404_KN_IIAvance

Semana 13: Entrega del proyecto

Aunque la defensa sea en semana 14, el documento indica que el proyecto debe entregarse en semana 13.

Debe estar listo:

- Documento final.
- Scripts completos.
- Base de datos terminada.
- Procedimientos almacenados.
- Funciones.
- Vistas.
- Triggers.
- Backend conectado.
- Frontend demostrable.
- Docker funcionando.

Semana 14: Defensa

Valor: 25%

Durante la defensa deben demostrar:

- El sistema funciona correctamente.
- La exposición no presenta errores.
- El equipo usa bien el tiempo.
- Todos conocen el proyecto.
- Todos pueden explicar la base de datos.
- Todos pueden explicar relaciones.
- Todos pueden explicar normalización.
- Todos pueden explicar procedures, functions, views y triggers.
- El flujo principal funciona.

## Cronograma recomendado

| Semana | Trabajo principal | Resultado esperado |
| --- | --- | --- |
| 1 | Definir idea y alcance | Tema cerrado: MBM Booking Manager. |
| 2 | Definir entidades | Lista inicial de tablas y módulos. |
| 3 | Disenar DER | Diagrama inicial. |
| 4 | Crear modelo relacional | Tablas, atributos, PK y FK. |
| 5 | Revisar normalización | Ajustes para llegar a 3FN. |
| 6 | Preparar documento Avance I | PDF. |
| 7 | Entregar Avance I | Diseño logico entregado. |
| 8 | Crear scripts DDL | Base empieza en SQL Server. |
| 9 | Crear tablas y relaciones | Estructura SQL lista. |
| 10 | Insertar seed data | 50 registros por tabla. |
| 11 | Crear procedures y functions | Lógica SQL inicial lista. |
| 12 | Entregar Avance II | Base + SQL avanzado inicial entregado. |
| 13 | Crear views, triggers e integración | Proyecto final entregado. |
| 14 | Defensa | Demo y exposición. |

## Demo minima para la defensa

El sistema debe poder demostrar este flujo:

1. Superadmin activa un tenant.
2. Business owner inicia sesión.
3. Business owner configura el negocio.
4. Business owner crea una categoría.
5. Business owner crea un servicio.
6. Business owner define horario del negocio.
7. Business owner crea bloques de disponibilidad.
8. Cliente entra a /book/[slug].
9. Cliente selecciona servicio.
10. Cliente selecciona fecha y hora.
11. Cliente ingresa sus datos.
12. Cliente crea reserva.
13. Sistema genera tracking code.
14. Cliente consulta reserva con tracking code.
15. Cliente reagenda o cancela.
16. Business owner ve la reserva en el panel.
17. Business owner consulta reporte o dashboard.
18. Equipo muestra vistas, procedures, functions y triggers en SQL Server.

## Checklist de cumplimiento

Base de datos

- [x] Base de datos creada en SQL Server.
- [x] Mínimo 10 tablas.
- [x] 15 tablas propuestas creadas.
- [x] Llaves primarias definidas.
- [x] Llaves foraneas definidas.
- [x] Relaciones documentadas.
- [x] Diagrama Entidad-Relación creado.
- [x] Modelo relacional creado.
- [x] Normalización hasta 3FN explicada.
- [x] 50 registros por tabla.
- [x] 10 procedimientos almacenados (13).
- [x] 5 funciones SQL (6).
- [x] 5 vistas SQL (7).
- [x] 5 triggers (7).
- [x] Archivo full-script.sql creado.

Backend

- [x] FastAPI configurado.
- [x] Uvicorn funcionando.
- [x] Conexión a SQL Server.
- [x] Endpoints privados.
- [x] Endpoints públicos.
- [x] Validaciones básicas.
- [x] Manejo de errores (RFC 7807 en toda la API).
- [x] Filtro por tenant (via `tenantId` del JWT, nunca desde la request).
- [x] Documentación automatica disponible en /docs.

Frontend

- [x] Landing simple.
- [x] Login.
- [x] Registro o solicitud de tenant.
- [ ] Dashboard (conectado a la API real; el resto de pantallas privadas siguen en mock, ver docs/api-handover.md).
- [ ] Configuración del negocio (mock, pendiente de cablear).
- [ ] Categorías de servicios (mock, pendiente de cablear).
- [ ] Servicios (mock, pendiente de cablear).
- [ ] Horarios por sede (mock, pendiente de cablear).
- [ ] Reservas (mock, pendiente de cablear).
- [x] Página pública de reservas (flujo publico SSR conectado a la API; falta cablear el submit del booking, ver docs/api-handover.md).
- [x] Tracking público (consulta conectada; reagendar pendiente de cablear).
- [ ] Reportes básicos (mock, pendiente de cablear).

Docker

- [x] SQL Server en contenedor.
- [x] API en contenedor.
- [x] Frontend en contenedor.
- [x] Docker Compose funcional.
- [x] Variables de entorno documentadas.
- [x] README con pasos de instalacion.
- [ ] Proyecto probado en mas de una computadora.

Defensa

- [ ] Presentacion preparada para 15 minutos.
- [ ] Todos los integrantes conocen la base de datos.
- [ ] Todos pueden explicar una tabla.
- [ ] Todos pueden explicar una relación.
- [ ] Todos pueden explicar que es PK y FK.
- [ ] Todos pueden explicar la normalización.
- [ ] Todos pueden explicar al menos un procedure.
- [ ] Todos pueden explicar al menos una function.
- [ ] Todos pueden explicar al menos una view.
- [ ] Todos pueden explicar al menos un trigger.
- [ ] Demo preparada.
- [ ] Plan de respaldo preparado.

## Recap final del proyecto

MBM es una plataforma multi tenant de reservas para negocios de servicios. Cada negocio cuenta con un business owner que administra su informacion, servicios, horarios y reservas. Los clientes pueden reservar desde una página pública sin iniciar sesión y reciben un codigo de tracking para consultar, cancelar o reagendar su reserva.

El sistema sera desarrollado con SQL Server, FastAPI, Uvicorn, Python, Next.js, TypeScript y Docker. La base de datos sera el componente principal del proyecto, cumpliendo con los requisitos del curso: análisis, modelo entidad-relación, modelo relacional, normalización, creación de tablas, registros de prueba, procedimientos almacenados, funciones, vistas, triggers y scripts completos.

El planteamiento estilo mvp se mantiene simple para poder cumplir a tiempo, pero deja una base suficientemente solida para que el proyecto pueda evolucionar en el futuro como un producto real.

las únicas ramas fijas deberian ser:

- main
- develop

Y las ramas feature/* nacen solo cuando alguien va a trabajar algo especifico.

La idea es que main sea el punto seguro del proyecto. No se trabaja directamente ahi.

Flujo correcto

Primero se crea main con la estructura inicial. Luego desde main se crea:

- develop

Despues, cada funcionalidad nace desde develop.

Ejemplo:

- feature/frontend-layout
- feature/db-schema
- feature/api-services
- feature/docker-setup

Cuando alguien termina una feature:

- feature/* -> Pull Request -> develop

Y cuando develop este estable para una entrega:

- develop -> Pull Request -> main

Regla simple para el equipo

- main = entregas estables
- develop = integración del equipo
- feature/* = trabajo individual o por módulo

Nunca se trabaja directo en main. Lo ideal tambien es evitar trabajar directo en develop, salvo ajustes pequenos de documentación o configuración.
