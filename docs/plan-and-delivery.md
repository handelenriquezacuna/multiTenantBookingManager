# Trabajo del equipo

## Indice

- [Trabajo del equipo](#trabajo-del-equipo)
  - [Indice](#indice)
  - [Entregables del curso](#entregables-del-curso)
  - [Cronograma recomendado](#cronograma-recomendado)
  - [Demo minima para la defensa](#demo-minima-para-la-defensa)
  - [Checklist de cumplimiento](#checklist-de-cumplimiento)
  - [Recap final del proyecto](#recap-final-del-proyecto)

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

- [ ] Base de datos creada en SQL Server.
- [ ] Mínimo 10 tablas.
- [ ] 14 tablas propuestas creadas.
- [ ] Llaves primarias definidas.
- [ ] Llaves foraneas definidas.
- [ ] Relaciones documentadas.
- [ ] Diagrama Entidad-Relación creado.
- [ ] Modelo relacional creado.
- [ ] Normalización hasta 3FN explicada.
- [ ] 50 registros por tabla.
- [ ] 10 procedimientos almacenados.
- [ ] 5 funciones SQL.
- [ ] 5 vistas SQL.
- [ ] 5 triggers.
- [ ] Archivo full-script.sql creado.

Backend

- [ ] FastAPI configurado.
- [ ] Uvicorn funcionando.
- [ ] Conexión a SQL Server.
- [ ] Endpoints privados.
- [ ] Endpoints públicos.
- [ ] Validaciones básicas.
- [ ] Manejo de errores.
- [ ] Filtro por tenant.
- [ ] Documentación automatica disponible en /docs.

Frontend

- [ ] Landing simple.
- [ ] Login.
- [ ] Registro o solicitud de tenant.
- [ ] Dashboard.
- [ ] Configuración del negocio.
- [ ] Categorías de servicios.
- [ ] Servicios.
- [ ] Horarios.
- [ ] Disponibilidad.
- [ ] Reservas.
- [ ] Página pública de reservas.
- [ ] Tracking público.
- [ ] Reportes básicos.

Docker

- [ ] SQL Server en contenedor.
- [ ] API en contenedor.
- [ ] Frontend en contenedor.
- [ ] Docker Compose funcional.
- [ ] Variables de entorno documentadas.
- [ ] README con pasos de instalacion.
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
