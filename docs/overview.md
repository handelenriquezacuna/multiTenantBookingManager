# MBM: Multi tenant Booking Manager

Documento base para el proyecto SC-404

## Indice

- [Descripción general del proyecto](#descripción-general-del-proyecto)
- [Objetivo general](#objetivo-general)
- [Objetivos especificos](#objetivos-especificos)
- [Alcance del Proyecto](#alcance-del-proyecto)
- [Actores del sistema](#actores-del-sistema)
- [Flujo general del sistema](#flujo-general-del-sistema)
- [Requisitos del curso y aplicación directa en MBM](#requisitos-del-curso-y-aplicación-directa-en-mbm)
- [Conceptos importantes para el equipo](#conceptos-importantes-para-el-equipo)
- [Requerimientos funcionales](#requerimientos-funcionales)
- [Requerimientos no funcionales](#requerimientos-no-funcionales)

Se plantea una version clara, defendible y realista del proyecto MBM (Multi tenant Booking Manager), alineada con los requisitos del curso SC-404 Fundamentos de Diseño de Base de Datos Relacionales.

La idea principal es desarrollar una plataforma de reservas para negocios de servicios, donde cada negocio pueda configurar su informacion, servicios, horarios y reservas. El sistema sera multi tenant, lo que significa que varios negocios podran usar la misma plataforma, pero cada uno manejara unicamente sus propios datos.

## Descripción general del proyecto

MBM es una plataforma web de reservas para negocios de servicios como barberias, salones de belleza, spas, veterinarias, clinicas pequenas, consultorios, centros esteticos o negocios similares.

Cada negocio tendra su propio espacio dentro del sistema. Ese espacio se llamara tenant.

Un business owner sera el dueno o administrador del negocio. Esta persona podra entrar al panel privado para configurar su negocio, crear servicios, definir horarios disponibles y revisar reservas.

Los clientes finales podran entrar a una página pública del negocio, seleccionar un servicio, escoger una fecha y hora disponible, ingresar sus datos y confirmar una reserva sin necesidad de iniciar sesión. Al finalizar, recibiran un codigo de tracking para consultar, cancelar o reagendar su reserva.

El proyecto se desarrollara con la siguiente arquitectura:

- SQL Server
- -> FastAPI + Uvicorn + Python
- -> Next.js + TypeScript
- -> Docker

La prioridad principal sera la base de datos relacional, ya que el curso evalua diseño, normalización, relaciones, scripts, procedimientos almacenados, funciones, vistas y triggers.

## Objetivo general

Disenar e implementar una base de datos relacional para una plataforma multi tenant de reservas, aplicando análisis de requisitos, modelo entidad-relación, modelo relacional, normalización hasta tercera forma normal, creación de tablas, inserción de datos, procedimientos almacenados, funciones, vistas, triggers y scripts completos.

## Objetivos especificos

1. Analizar el funcionamiento de una plataforma de reservas para negocios de servicios.
2. Identificar las entidades necesarias para representar tenants, owners, clientes, servicios, horarios y reservas.
3. Definir los requerimientos funcionales y no funcionales del sistema.
4. Disenar el Diagrama Entidad-Relación, tambien conocido como DER.
5. Transformar el DER en un modelo relacional.
6. Definir llaves primarias, llaves foraneas y relaciones entre tablas.
7. Normalizar la base de datos hasta tercera forma normal.
8. Crear la base de datos en SQL Server mediante scripts DDL.
9. Insertar al menos 50 registros por tabla mediante datos de prueba.
10. Crear al menos 10 procedimientos almacenados.
11. Crear al menos 5 funciones SQL.
12. Crear al menos 5 vistas SQL que integren multiples tablas.
13. Crear al menos 5 triggers.
14. Crear un archivo SQL completo que permita reconstruir toda la base de datos.
15. Integrar la base de datos con un backend en FastAPI.
16. Crear una interfaz web con Next.js para demostrar el flujo principal.
17. Dockerizar el proyecto para levantar base de datos, backend y frontend.

## Alcance del Proyecto

El proyecto debe ser funcional, pero sin agregar complejidad innecesaria. El objetivo no es construir un SaaS completo de produccion desde el primer momento, sino una version solida que cumpla con el curso y que pueda crecer despues.

El MVP incluye:

- Registro o creación de negocios/tenants.
- Activacion o suspension de tenants por parte de un superadmin.
- Login del business owner.
- Panel privado para el business owner.
- Configuración básica del negocio.
- Creación de categorías de servicios.
- Creación de servicios.
- Configuración de horarios del negocio.
- Creación de bloques de disponibilidad.
- Página pública de reservas para cada tenant.
- Creación de reservas sin login.
- Generacion de codigo de tracking.
- Consulta pública de reserva por codigo.
- Cancelacion de reserva por codigo.
- Reagendamiento de reserva por codigo.
- Gestion básica de reservas desde el panel privado.
- Reportes básicos.
- Auditoría básica de acciones importantes.

El MVP no incluye

- Pasarelas de pago.
- Facturacion.
- Planes de precios visibles.
- Pricing section en landing page.
- Membresias pagadas.
- Notificaciones por correo.
- Notificaciones por WhatsApp.
- Roles avanzados dentro del tenant.
- Permisos complejos.
- Multiples empleados con agendas separadas.
- Aplicación movil.
- Kubernetes.
- Microservicios.
- Produccion cloud.

El campo price puede existir en los servicios, pero sera solamente informativo. El business owner podra decidir si muestra o no el precio del servicio.

## Actores del sistema

Para simplificar el sistema, se plantea manejar tres actores principales.

| Actor | Descripción | Acceso |
| --- | --- | --- |
| Superadmin | Representa a los duenos de MBM. Puede activar o suspender tenants. | Panel interno simple. |
| Business owner | Dueno del negocio. Administra su tenant, servicios, horarios y reservas. | Panel privado. |
| Cliente | Persona que reserva un servicio. No necesita cuenta. | Página pública y tracking. |

## Flujo general del sistema

#### Flujo del superadmin

1. El superadmin entra al panel interno.
2. Visualiza los tenants registrados o creados.
3. Revisa el estado de cada tenant.
4. Activa un tenant para permitirle operar.
5. Suspende un tenant si es necesario.
6. Consulta informacion básica de los negocios registrados.

Este flujo sera simple. No es el centro del proyecto, pero permite justificar que el sistema puede tener control interno si en el futuro se convierte en un producto real.

#### Flujo del business owner

1. El business owner inicia sesión.
2. Entra al dashboard de su negocio.
3. Configura la informacion básica del tenant.
4. Crea categorías de servicios.
5. Crea servicios con duración, descripción y precio informativo opcional.
6. Define horarios generales del negocio.
7. Define bloques de disponibilidad para reservas.
8. Consulta las reservas recibidas.
9. Confirma, cancela, completa o reagenda reservas.
10. Consulta reportes básicos.

#### Flujo del cliente final

1. El cliente entra a la página pública del negocio.
2. Revisa la informacion del negocio.
3. Selecciona un servicio.
4. Selecciona una fecha.
5. Selecciona una hora disponible.
6. Ingresa nombre, correo y teléfono.
7. Confirma la reserva.
8. El sistema genera un codigo de tracking.
9. El cliente puede consultar su reserva usando ese codigo.
10. El cliente puede cancelar o reagendar la reserva sin iniciar sesión.

## Requisitos del curso y aplicación directa en MBM

| Requisito del curso | Aplicación directa en MBM |
| --- | --- |
| 1. Análisis de requisitos | Se analiza una plataforma de reservas para negocios de servicios. |
| 2. Definir requerimientos de base de datos | Se definen entidades como tenants, owners, clientes, servicios, horarios y reservas. |
| 3. Crear DER y modelo relacional | Se disenan entidades, atributos, relaciones y cardinalidades. |
| 4. Especificar PK, FK y relaciones | Cada tabla tendra llave primaria y las relaciones usaran llaves foraneas. |
| 5. Normalización mínimo a 3FN | Se separan catálogos, estados, tipos de negocio y entidades dependientes. |
| 6. Crear base mediante DDL, mínimo 10 tablas | Se propone una base de 15 tablas principales en SQL Server. |
| 7. Insertar al menos 50 registros por tabla | Se creara script de seed data o datos de prueba. |
| 8. Programar al menos 10 procedimientos almacenados | Se crearan procedures para tenants, servicios, horarios y reservas. |
| 9. Programar al menos 5 funciones | Se crearan funciones para tracking, disponibilidad y conteos. |
| 10. Crear al menos 5 vistas | Se crearan vistas para dashboard, reservas y reportes. |
| 11. Programar al menos 5 triggers | Aunque la entrega final menciona 3, se haran 5 para cumplir el requisito general. |
| 12. Generar archivo con todos los scripts | Se entregara un full-script.sql con toda la estructura y lógica. |

## Conceptos importantes para el equipo

| Término | Nombre completo | Explicación sencilla |
| --- | --- | --- |
| PK | Primary Key / Llave primaria | Campo que identifica de forma única un registro. Ejemplo: tenant_id. |
| FK | Foreign Key / Llave foranea | Campo que conecta una tabla con otra. Ejemplo: business_type_id en tenants. |
| DER | Diagrama Entidad-Relación | Diagrama visual que muestra tablas, atributos y relaciones. |
| DDL | Data Definition Language | Comandos SQL para crear estructuras: bases, tablas, llaves y relaciones. |
| DML | Data Manipulation Language | Comandos SQL para insertar, actualizar o eliminar datos. |
| Seed data | Datos iniciales de prueba | Datos ficticios para probar la base. |
| 3FN | Tercera Forma Normal | Nivel de normalización que ayuda a evitar datos repetidos y dependencias incorrectas. |
| Procedure | Procedimiento almacenado | Bloque SQL guardado que ejecuta una accion. |
| Function | Función SQL | Bloque SQL que devuelve un valor. |
| View | Vista SQL | Consulta guardada que combina datos de varias tablas. |
| Trigger | Disparador SQL | Accion automatica que ocurre al insertar, actualizar o eliminar datos. |
| Tenant | Negocio dentro del sistema | Cada barberia, spa, salon o veterinaria registrada. |
| Multi tenant | Multi-negocio | Una misma plataforma que sirve a varios negocios separados. |
| API | Interfaz de programacion | Capa que permite que frontend y backend se comuniquen. |
| Endpoint | Ruta de la API | Dirección especifica para ejecutar una accion. Ejemplo: GET /services. |
| CRUD | Create, Read, Update, Delete | Crear, leer, actualizar y eliminar datos. |
| Docker | Plataforma de contenedores | Permite ejecutar el proyecto en ambientes controlados. |
| Docker Compose | Orquestador de contenedores | Archivo para levantar SQL Server, API y frontend juntos. |
| Monorepo | Repositorio único | Un solo repositorio para frontend, backend, base de datos e infraestructura. |

## Requerimientos funcionales

- Registro o creación de negocios/tenants.
- Activacion o suspension de tenants por parte de un superadmin.
- Login del business owner.
- Panel privado para el business owner.
- Configuración básica del negocio.
- Creación de categorías de servicios.
- Creación de servicios.
- Configuración de horarios del negocio.
- Creación de bloques de disponibilidad.
- Página pública de reservas para cada tenant.
- Creación de reservas sin login.
- Generacion de codigo de tracking.
- Consulta pública de reserva por codigo.
- Cancelacion de reserva por codigo.
- Reagendamiento de reserva por codigo.
- Gestion básica de reservas desde el panel privado.
- Reportes básicos.
- Auditoría básica de acciones importantes.

## Requerimientos no funcionales

- Arquitectura: SQL Server -> FastAPI + Uvicorn + Python -> Next.js + TypeScript -> Docker.
- Base de datos normalizada al menos a 3FN.
- Scripts SQL completos (DDL, seed data, procedures, functions, views, triggers).
- Multi tenant con aislamiento de datos por negocio.
- Endpoints públicos y privados definidos.
- Docker Compose funcional para SQL Server, API y frontend.
