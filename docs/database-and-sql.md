# Diseño simplificado de la base de datos

## Indice

- [Diseño simplificado de la base de datos](#diseño-simplificado-de-la-base-de-datos)
  - [Indice](#indice)
  - [Atributos por tabla](#atributos-por-tabla)
    - [Tabla business\_types](#tabla-business_types)
    - [Tabla tenant\_statuses](#tabla-tenant_statuses)
    - [Tabla superadmins](#tabla-superadmins)
    - [Tabla tenants](#tabla-tenants)
    - [Tabla tenant\_owners](#tabla-tenant_owners)
    - [Tabla customers](#tabla-customers)
    - [Tabla service\_categories](#tabla-service_categories)
    - [Tabla services](#tabla-services)
    - [Tabla locations](#tabla-locations)
    - [Tabla business\_hours](#tabla-business_hours)
    - [Tabla availability\_blocks](#tabla-availability_blocks)
    - [Tabla booking\_statuses](#tabla-booking_statuses)
    - [Tabla bookings](#tabla-bookings)
    - [Tabla tracking\_codes](#tabla-tracking_codes)
    - [Tabla audit\_logs](#tabla-audit_logs)
  - [Relaciones principales del modelo](#relaciones-principales-del-modelo)
  - [Normalización de la base de datos](#normalización-de-la-base-de-datos)
  - [Scripts SQL requeridos](#scripts-sql-requeridos)
  - [Datos de prueba](#datos-de-prueba)
  - [Procedimientos almacenados propuestos](#procedimientos-almacenados-propuestos)
  - [Funciones SQL propuestas](#funciones-sql-propuestas)
  - [Vistas SQL propuestas](#vistas-sql-propuestas)
  - [Triggers propuestos](#triggers-propuestos)

Para mantener el proyecto claro, se propone una base de datos con 15 tablas principales. Esto cumple de sobra con el mínimo de 10 tablas y mantiene el sistema entendible.

Tablas propuestas

| Tabla | Proposito |
| --- | --- |
| business_types | Tipos de negocio permitidos. |
| tenant_statuses | Estados posibles de un tenant. |
| superadmins | Administradores globales de la plataforma MBM. |
| tenants | Negocios registrados en MBM. |
| tenant_owners | Duenos o administradores de cada tenant. |
| customers | Clientes que realizan reservas. |
| service_categories | Categorías de servicios por negocio. |
| services | Servicios ofrecidos por cada tenant. |
| locations | Ubicación o sede del negocio. |
| business_hours | Horarios generales del negocio. |
| availability_blocks | Bloques disponibles para reservar. |
| booking_statuses | Estados posibles de una reserva. |
| bookings | Reservas realizadas. |
| tracking_codes | Codigos públicos para consultar reservas. |
| audit_logs | Registro de acciones importantes. |

## Atributos por tabla

### Tabla business_types

Contiene los tipos de negocio que pueden usar la plataforma.

Ejemplos:

- Barberia
- Salon de belleza
- Spa
- Veterinaria
- Clinica
- Consultorio
- Centro estetico

Atributos:

- business_type_id: PK. Identificador único del tipo de negocio.
- name: Nombre del tipo de negocio.
- description: Descripción opcional.
- is_active: Indica si el tipo de negocio esta activo.

Relación principal:

- business_types 1:N tenants

Un tipo de negocio puede estar asociado a muchos tenants.

### Tabla tenant_statuses

Contiene los estados posibles de un negocio dentro de la plataforma.

Ejemplos:

- pending
- active
- suspended
- inactive

Atributos:

- tenant_status_id: PK. Identificador único del estado.
- name: Nombre del estado.
- description: Descripción del estado.

Relación principal:

- tenant_statuses 1:N tenants

Un estado puede pertenecer a muchos tenants.

### Tabla superadmins

Contiene los administradores globales de la plataforma MBM. Son los únicos que pueden activar o suspender tenants.

Para el MVP puede existir un solo superadmin, pero la tabla permite agregar mas en el futuro.

Atributos:

- superadmin_id: PK. Identificador único del superadmin.
- email: Correo de acceso.
- password_hash: Contrasena cifrada.
- full_name: Nombre completo.
- is_active: Indica si el superadmin esta activo.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- superadmins 1:N audit_logs

Un superadmin puede generar muchos registros de auditoría al gestionar tenants.

### Tabla tenants

Representa cada negocio registrado en MBM.

Atributos:

- tenant_id: PK. Identificador único del negocio.
- business_type_id: FK hacia business_types.
- tenant_status_id: FK hacia tenant_statuses.
- name: Nombre comercial del negocio.
- slug: Identificador público usado en la URL.
- email: Correo del negocio.
- phone: Teléfono del negocio.
- description: Descripción pública del negocio.
- logo_url: URL del logo, opcional.
- public_message: Mensaje público para clientes.
- is_active: Indica si el tenant esta activo.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Ejemplos de slug:

- barberia-elite
- spa-luna
- veterinaria-central
- salon-bella

Ejemplo de URL pública:

- /book/barberia-elite

Relaciones principales:

- business_types 1:N tenants
- tenant_statuses 1:N tenants
- tenants 1:N tenant_owners
- tenants 1:N customers
- tenants 1:N services
- tenants 1:N bookings

### Tabla tenant_owners

Contiene los usuarios duenos o administradores de cada negocio.

Atributos:

- owner_id: PK. Identificador único del owner.
- tenant_id: FK hacia tenants.
- full_name: Nombre completo.
- email: Correo de acceso.
- password_hash: Contrasena cifrada.
- phone: Teléfono.
- is_active: Indica si el owner esta activo.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- tenants 1:N tenant_owners

Un tenant puede tener uno o mas owners, aunque para el MVP se puede usar solo uno.

### Tabla customers

Contiene los clientes que hacen reservas en un tenant.

Atributos:

- customer_id: PK. Identificador único del cliente.
- tenant_id: FK hacia tenants.
- first_name: Nombre.
- last_name: Apellido.
- email: Correo.
- phone: Teléfono.
- notes: Notas opcionales.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- tenants 1:N customers
- customers 1:N bookings

Un cliente pertenece a un tenant y puede tener varias reservas.

### Tabla service_categories

Contiene categorías para ordenar servicios.

Ejemplos:

- Cabello
- Unas
- Masajes
- Consulta
- Mascotas
- Estetica

Atributos:

- category_id: PK. Identificador único de la categoría.
- tenant_id: FK hacia tenants.
- name: Nombre de la categoría.
- description: Descripción opcional.
- is_active: Indica si la categoría esta activa.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- tenants 1:N service_categories
- service_categories 1:N services

### Tabla services

Contiene los servicios que ofrece cada tenant.

Ejemplos:

- Corte de cabello
- Masaje relajante
- Bano de mascota
- Consulta general
- Manicure
- Limpieza facial

Atributos:

- service_id: PK. Identificador único del servicio.
- tenant_id: FK hacia tenants.
- category_id: FK hacia service_categories.
- name: Nombre del servicio.
- description: Descripción del servicio.
- duration_minutes: Duración del servicio en minutos.
- price: Precio informativo opcional.
- show_price: Indica si el precio se muestra publicamente.
- is_active: Indica si el servicio esta disponible.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- tenants 1:N services
- service_categories 1:N services
- services 1:N bookings

### Tabla locations

Contiene la ubicación fisica o sede del negocio.

Para el MVP puede existir una sede principal por tenant, pero la tabla permite crecer a varias ubicaciones en el futuro.

Atributos:

- location_id: PK. Identificador único de la ubicación.
- tenant_id: FK hacia tenants.
- name: Nombre de la sede.
- address: Dirección fisica.
- phone: Teléfono.
- is_main: Indica si es la sede principal.
- is_active: Indica si la ubicación esta activa.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- tenants 1:N locations
- locations 1:N bookings

### Tabla business_hours

Contiene el horario general del negocio por sede. En el frontend esta configuracion corresponde a `/business-hours`.

Un negocio puede tener dias activos o cerrados distintos a otros negocios. Por ejemplo, una clinica puede cerrar sabados y domingos, mientras una barberia puede abrir sabados. Tambien puede tener pausas durante el dia, como almuerzo. Para cubrir esto sin agregar tablas extra, `business_hours` puede tener mas de un registro por dia para la misma sede.

Si el negocio tiene varias sedes, cada sede puede tener horarios distintos. Por eso `business_hours` incluye `location_id` y `/business-hours` debe permitir seleccionar una sede antes de editar su semana operativa.

Atributos:

- business_hour_id: PK. Identificador único del horario.
- tenant_id: FK hacia tenants.
- location_id: FK hacia locations.
- day_of_week: Dia de la semana (0 = domingo, 6 = sabado).
- open_time: Hora de apertura. NULL si is_closed es verdadero.
- close_time: Hora de cierre. NULL si is_closed es verdadero.
- is_closed: Indica si el negocio cierra ese dia.
- updated_at: Fecha de actualización.

Ejemplos:

- Lunes, 08:00, 17:00, No cerrado
- Lunes, 08:00, 12:00, No cerrado
- Lunes, 13:00, 17:00, No cerrado
- Domingo, NULL, NULL, Cerrado

Relación principal:

- tenants 1:N business_hours
- locations 1:N business_hours

Un tenant tendra varios registros por sede. Puede ser uno por dia si no hay pausas, o varios registros para el mismo dia y sede cuando existen bloques separados, como manana y tarde.

### Tabla availability_blocks

Contiene bloques concretos disponibles para reservar en una sede especifica. No debe existir una pantalla privada `/availability` para que el owner publique horarios manualmente.

Esta tabla simplifica el MVP porque evita manejar empleados y agendas individuales. El negocio define sedes en `/locations` y horarios por sede en `/business-hours`. Con esa informacion, el sistema puede calcular o generar internamente los bloques disponibles como 09:00-09:30, 09:30-10:00 y asi sucesivamente.

Para efectos academicos y scripts SQL, estos bloques pueden insertarse manualmente como registros independientes en `availability_blocks`. En el frontend del owner no se editan como una pantalla separada; son resultado de horarios, sedes y reservas.

Atributos:

- availability_block_id: PK. Identificador único del bloque.
- tenant_id: FK hacia tenants.
- location_id: FK hacia locations.
- block_date: Fecha disponible.
- start_time: Hora de inicio.
- end_time: Hora de fin.
- is_active: Indica si el bloque esta disponible.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Relación principal:

- tenants 1:N availability_blocks
- locations 1:N availability_blocks
- availability_blocks 1:0..1 bookings

Ejemplo:

- Tenant: Barberia Elite
- Fecha: 2026-06-10
- Hora inicio: 09:00
- Hora fin: 09:30
- Estado: disponible

Ejemplo de flujo entre frontend y datos:

- `/business-hours`: Sede central, lunes abierto 09:00-12:00 y 13:00-17:00.
- `/locations`: existe la sede Sede central.
- Página publica: el cliente elige Sede central y fecha 2026-06-10.
- Sistema: calcula los horarios disponibles desde `business_hours` y reservas existentes, o consulta bloques ya generados internamente en `availability_blocks`.

Ejemplo de bloques generados:

- Fecha: 2026-06-10
- Rango: 09:00 a 11:00
- Intervalo: 30 minutos
- Bloques resultantes:
  - 09:00 a 09:30
  - 09:30 a 10:00
  - 10:00 a 10:30
  - 10:30 a 11:00

### Tabla booking_statuses

Contiene los estados posibles de una reserva.

Ejemplos:

- pending
- confirmed
- cancelled
- completed
- rescheduled

Atributos:

- booking_status_id: PK. Identificador único del estado.
- name: Nombre del estado.
- description: Descripción.

Relación principal:

- booking_statuses 1:N bookings

### Tabla bookings

Contiene las reservas realizadas por clientes.

Atributos:

- booking_id: PK. Identificador único de la reserva.
- tenant_id: FK hacia tenants.
- customer_id: FK hacia customers.
- service_id: FK hacia services.
- location_id: FK hacia locations.
- availability_block_id: FK hacia availability_blocks.
- booking_status_id: FK hacia booking_statuses.
- booking_date: Fecha de la reserva.
- start_time: Hora de inicio.
- end_time: Hora de fin.
- customer_notes: Notas del cliente.
- internal_notes: Notas internas del negocio.
- created_at: Fecha de creación.
- updated_at: Fecha de actualización.

Nota de diseño — denormalización intencional:

booking_date, start_time y end_time se repiten en la reserva aunque ya existen en availability_block_id. Esta redundancia es intencional. Si el bloque es eliminado o modificado en el futuro, la reserva conserva el registro historico exacto de la fecha y hora acordadas. Esto protege la integridad histórica de los datos sin depender de que el bloque exista.

Relaciones principales:

- tenants 1:N bookings
- customers 1:N bookings
- services 1:N bookings
- locations 1:N bookings
- availability_blocks 1:0..1 bookings
- booking_statuses 1:N bookings

### Tabla tracking_codes

Contiene el codigo público que permite consultar una reserva sin login.

Atributos:

- tracking_id: PK. Identificador único.
- booking_id: FK hacia bookings.
- tracking_code: Codigo único.
- expires_at: Fecha de expiración. Requerido. Default de 30 dias desde la creación de la reserva. Un codigo sin expiración permite consulta indefinida, lo cual no es deseable por seguridad.
- is_active: Indica si el codigo sigue activo.
- created_at: Fecha de creación.

Relación principal:

- bookings 1:1 tracking_codes

Cada reserva tendra un codigo de tracking.

Ejemplo de codigo:

- MBM-8F3K2A

### Tabla audit_logs

Contiene acciones importantes realizadas en el sistema.

Atributos:

- audit_id: PK. Identificador único del registro de auditoría.
- tenant_id: FK hacia tenants. Nullable para acciones globales del superadmin.
- owner_id: FK opcional hacia tenant_owners. Registra cuando la accion la ejecuta el business owner.
- superadmin_id: FK opcional hacia superadmins. Registra cuando la accion la ejecuta un superadmin.
- action: Accion realizada.
- entity_name: Nombre de la entidad afectada.
- entity_id: ID del registro afectado.
- old_value: Valor anterior en formato texto. NVARCHAR(MAX) para admitir representaciones largas.
- new_value: Valor nuevo en formato texto. NVARCHAR(MAX).
- created_at: Fecha del evento.

Nota: owner_id y superadmin_id son mutuamente excluyentes en la práctica. Solo uno debe tener valor por registro.

Ejemplos de acciones:

- booking_created
- booking_cancelled
- booking_rescheduled
- service_created
- tenant_activated
- tenant_suspended

Relación principal:

- tenants 1:N audit_logs
- tenant_owners 1:N audit_logs
- superadmins 1:N audit_logs

## Relaciones principales del modelo

| Relación | Tipo | Explicación |
| --- | --- | --- |
| business_types -> tenants | 1:N | Un tipo de negocio puede tener muchos tenants. |
| tenant_statuses -> tenants | 1:N | Un estado puede estar asignado a muchos tenants. |
| tenants -> tenant_owners | 1:N | Un negocio puede tener uno o varios owners. |
| tenants -> customers | 1:N | Un negocio puede tener muchos clientes. |
| tenants -> service_categories | 1:N | Un negocio puede crear varias categorías. |
| service_categories -> services | 1:N | Una categoría puede tener varios servicios. |
| tenants -> services | 1:N | Un negocio puede ofrecer muchos servicios. |
| tenants -> locations | 1:N | Un negocio puede tener una o varias ubicaciones. |
| tenants -> business_hours | 1:N | Un negocio tiene varios horarios por dia. |
| locations -> availability_blocks | 1:N | Una ubicación puede tener muchos bloques disponibles. |
| availability_blocks -> bookings | 1:0..1 | Un bloque representa un horario reservable y solo puede quedar asociado a una reserva activa. |
| customers -> bookings | 1:N | Un cliente puede hacer varias reservas. |
| services -> bookings | 1:N | Un servicio puede estar en muchas reservas. |
| booking_statuses -> bookings | 1:N | Un estado puede estar en muchas reservas. |
| bookings -> tracking_codes | 1:1 | Cada reserva tiene un codigo de tracking. |
| tenants -> audit_logs | 1:N | Un tenant puede tener muchos registros de auditoría. |
| tenant_owners -> audit_logs | 1:N | Un owner puede generar muchos registros de auditoría. |
| superadmins -> audit_logs | 1:N | Un superadmin puede generar muchos registros al gestionar tenants. |

## Normalización de la base de datos

La base debe estar normalizada al menos hasta tercera forma normal, tambien conocida como 3FN.

Primera Forma Normal

La primera forma normal indica que cada campo debe contener un solo valor y no listas de datos.

Ejemplo aplicado:

- No se guardan varios servicios en una sola columna.
- Cada servicio esta en la tabla services.
- Cada reserva apunta a un solo servicio mediante service_id.

Segunda Forma Normal

La segunda forma normal indica que los atributos deben depender completamente de la llave primaria de su tabla.

Ejemplo aplicado:

- El nombre del servicio depende de service_id y se guarda en services.
- El nombre del cliente depende de customer_id y se guarda en customers.
- La reserva no repite el nombre del cliente ni el nombre del servicio.

Tercera Forma Normal

La tercera forma normal indica que los datos no deben depender de otros campos que no sean la llave principal.

Ejemplo aplicado:

- El tipo de negocio no se guarda como texto en tenants.
- Se guarda en business_types y tenants usa business_type_id.
- El estado de la reserva no se guarda como texto repetido en bookings.
- Se guarda en booking_statuses y bookings usa booking_status_id.

Con esto se reduce duplicacion, se mejora el mantenimiento y se evita inconsistencia de datos.

## Scripts SQL requeridos

La carpeta de scripts debe organizarse de forma clara.

```text
database/
└── scripts/
    ├── 01-create-database.sql
    ├── 02-create-tables.sql
    ├── 03-seed-data.sql
    ├── 04-procedures.sql
    ├── 05-functions.sql
    ├── 06-views.sql
    ├── 07-triggers.sql
    └── 08-full-script.sql
```

| Archivo | Contenido |
| --- | --- |
| 01-create-database.sql | Crea la base de datos. |
| 02-create-tables.sql | Crea tablas, llaves primarias, llaves foraneas y restricciones. |
| 03-seed-data.sql | Inserta datos iniciales de prueba. |
| 04-procedures.sql | Crea procedimientos almacenados. |
| 05-functions.sql | Crea funciones SQL. |
| 06-views.sql | Crea vistas SQL. |
| 07-triggers.sql | Crea triggers. |
| 08-full-script.sql | Contiene todo junto para reconstruir la base completa. |

## Datos de prueba

El proyecto pide al menos 50 registros por tabla.

Como el sistema tiene 15 tablas, se deben preparar scripts de inserción con datos de prueba para cada una.

Ejemplos de datos:

- business_types:
  - Barberia, Salon, Spa, Veterinaria, Clinica, Consultorio, Centro Estetico.
- tenant_statuses:
  - pending, active, suspended, inactive.
- superadmins:
  - Admin principal de MBM con email y password_hash. Para llegar a 50 registros se crean superadmins de prueba adicionales con datos ficticios.
- tenants:
  - Barberia Elite, Spa Luna, Veterinaria Central, Salon Bella, Clinica Vida.
- services:
  - Corte de cabello, Manicure, Masaje relajante, Bano de mascota, Consulta general.
- booking_statuses:
  - pending, confirmed, cancelled, completed, rescheduled.

Para las tablas pequenas de catálogo como tenant_statuses o booking_statuses, puede ser artificial llegar a 50 registros reales. Sin embargo, como el requisito indica 50 registros por tabla, se recomienda crear datos de prueba adicionales controlados o consultar al docente si los catálogos quedan exceptuados. Para ir a lo seguro, el script puede insertar 50 registros en todas las tablas, aunque algunos sean estados o tipos demo.

## Procedimientos almacenados propuestos

El curso pide mínimo 10 procedimientos almacenados.

Lista propuesta

| Procedimiento | Proposito |
| --- | --- |
| sp_create_tenant | Crear un tenant nuevo con estado inicial pending. |
| sp_activate_tenant | Activar un tenant desde superadmin. |
| sp_suspend_tenant | Suspender un tenant. |
| sp_create_owner | Crear business owner asociado a un tenant. |
| sp_create_service | Crear un servicio para un tenant. |
| sp_update_service | Actualizar un servicio. |
| sp_create_availability_block | Crear un bloque de disponibilidad. |
| sp_create_customer | Crear un cliente. |
| sp_create_booking | Crear una reserva pública o interna. |
| sp_cancel_booking | Cancelar una reserva. |
| sp_reschedule_booking | Reagendar una reserva. |
| sp_complete_booking | Marcar una reserva como completada. |

Aunque se piden 10, se proponen 12 para tener margen.

Descripción de procedures importantes

sp_create_booking

Debe encargarse de:

- Validar que el tenant este activo.
- Validar que el servicio pertenezca al tenant.
- Validar que el bloque de disponibilidad pertenezca al tenant.
- Validar que el bloque este disponible y no tenga una reserva activa.
- Crear o reutilizar el cliente.
- Insertar la reserva.
- Asignar estado pending o confirmed.
- Marcar o tratar el bloque como reservado para que no vuelva a mostrarse publicamente.
- Permitir que un trigger genere el tracking code o llamar una función para generarlo.

sp_cancel_booking

Debe encargarse de:

- Buscar la reserva.
- Cambiar el estado a cancelled.
- Liberar el bloque de disponibilidad asociado.
- Registrar auditoría.

sp_reschedule_booking

Debe encargarse de:

- Validar nuevo bloque de disponibilidad.
- Liberar el bloque anterior.
- Asociar la reserva al nuevo bloque disponible.
- Actualizar fecha y horas de la reserva.
- Cambiar estado a rescheduled o confirmed.
- Registrar auditoría.

## Funciones SQL propuestas

El curso pide mínimo 5 funciones.

| Función | Proposito |
| --- | --- |
| fn_generate_tracking_code | Generar un codigo único para una reserva. |
| fn_is_tenant_active | Validar si un tenant esta activo. |
| fn_is_availability_block_available | Validar si un bloque puede reservarse. |
| fn_total_bookings_by_tenant | Calcular total de reservas de un tenant. |
| fn_total_bookings_by_service | Calcular total de reservas por servicio. |
| fn_get_booking_duration | Obtener duración de una reserva segun el servicio. |

Se proponen 6 para tener margen.

## Vistas SQL propuestas

El curso pide mínimo 5 vistas que integren datos de multiples tablas.

| Vista | Proposito |
| --- | --- |
| vw_booking_details | Muestra reservas con tenant, cliente, servicio, ubicación, estado y tracking. |
| vw_daily_agenda | Muestra agenda diaria de reservas por tenant. |
| vw_public_services | Muestra servicios activos visibles para la página pública. |
| vw_tenant_dashboard | Muestra resumen de reservas, servicios y clientes por tenant. |
| vw_availability_status | Muestra horarios disponibles y reservados por sede y fecha. |
| vw_customer_booking_history | Muestra historial de reservas por cliente. |

Se proponen 6 para tener margen.

## Triggers propuestos

El requisito general menciona 5 triggers, aunque en la entrega final se mencionan 3. Para evitar riesgos, el proyecto debe llevar 5.

| Trigger | Proposito |
| --- | --- |
| trg_bookings_generate_tracking | Generar codigo de tracking al crear una reserva. |
| trg_bookings_audit_insert | Registrar auditoría cuando se crea una reserva. |
| trg_bookings_audit_update | Registrar auditoría cuando cambia una reserva. |
| trg_update_tenants_updated_at | Actualizar updated_at cuando cambia un tenant. |
| trg_update_services_updated_at | Actualizar updated_at cuando cambia un servicio. |
| trg_prevent_double_booking | Evitar que dos reservas activas usen el mismo availability_block. |
| trg_release_block_on_cancel | Permitir que un bloque vuelva a estar disponible cuando una reserva se cancela o reagenda. |

Se proponen 7 para tener margen. La entrega final pide mínimo 3, el requisito general pide 5.
