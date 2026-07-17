# Modelo Relacional — MBM Booking

> Esquema logico de la base de datos `mbm_booking`. 15 tablas normalizadas.
> PK = PRIMARY KEY, FK = FOREIGN KEY, UQ = UNIQUE, NN = NOT NULL

## Transliteracion

El modelo MR del drawio (`infra/MultiTenantBookingManager.drawio`, tab MR) usa
enie en algunos identificadores; el schema fisico en SQL Server usa ASCII puro.
Las equivalencias son:

| Modelo MR (con enie) | Fisico (ASCII) |
|---|---|
| dueños_de_dominios | duenos_de_dominios |
| dueño_id | dueno_id |
| contraseña_encriptada | contrasena_encriptada |

El resto de identificadores no lleva enie ni acentos. La fuente unica de
equivalencias (ingles -> MR -> fisico) es `docs/rename-map.csv`.

## Catalogos

### tipos_negocios
| Columna | Tipo | Restricciones |
|---|---|---|
| tipo_negocio_id | INT | **PK** IDENTITY(1,1) |
| nombre | NVARCHAR(100) | NN, UQ |
| descripcion | NVARCHAR(500) | NULL |
| activo | BIT | NN DEFAULT 1 |

### estados_dominios
| Columna | Tipo | Restricciones |
|---|---|---|
| dominio_estado_id | INT | **PK** IDENTITY(1,1) |
| nombre | NVARCHAR(50) | NN, UQ |
| descripcion | NVARCHAR(200) | NULL |

### estados_reservaciones
| Columna | Tipo | Restricciones |
|---|---|---|
| estado_reservacion_id | INT | **PK** IDENTITY(1,1) |
| nombre | NVARCHAR(50) | NN, UQ |
| descripcion | NVARCHAR(200) | NULL |

---

## Superadmins

### superadmins
| Columna | Tipo | Restricciones |
|---|---|---|
| superadmin_id | INT | **PK** IDENTITY(1,1) |
| nombre | NVARCHAR(100) | NN |
| apellido_1 | NVARCHAR(100) | NN |
| apellido_2 | NVARCHAR(100) | NULL |
| correo | NVARCHAR(254) | NN, UQ |
| contrasena_encriptada | NVARCHAR(512) | NN |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Dominios y Duenos

### dominios
| Columna | Tipo | Restricciones |
|---|---|---|
| dominio_id | INT | **PK** IDENTITY(1,1) |
| tipo_negocio_id | INT | **FK** → tipos_negocios(tipo_negocio_id), NN |
| dominio_estado_id | INT | **FK** → estados_dominios(dominio_estado_id), NN |
| nombre | NVARCHAR(200) | NN |
| slug | NVARCHAR(100) | NN, UQ |
| correo | NVARCHAR(254) | NN |
| telefono | NVARCHAR(30) | NULL |
| descripcion | NVARCHAR(MAX) | NULL |
| logo_url | NVARCHAR(500) | NULL |
| mensaje_publico | NVARCHAR(500) | NULL |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### duenos_de_dominios
| Columna | Tipo | Restricciones |
|---|---|---|
| dueno_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| nombre | NVARCHAR(100) | NN |
| apellido_1 | NVARCHAR(100) | NN |
| apellido_2 | NVARCHAR(100) | NULL |
| correo | NVARCHAR(254) | NN |
| contrasena_encriptada | NVARCHAR(512) | NN |
| telefono | NVARCHAR(30) | NULL |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Clientes

### clientes
| Columna | Tipo | Restricciones |
|---|---|---|
| cliente_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| nombre | NVARCHAR(100) | NN |
| apellido_1 | NVARCHAR(100) | NN |
| apellido_2 | NVARCHAR(100) | NULL |
| correo | NVARCHAR(254) | NN |
| telefono | NVARCHAR(30) | NN |
| notas | NVARCHAR(500) | NULL |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Servicios

### categorias_servicios
| Columna | Tipo | Restricciones |
|---|---|---|
| categoria_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| nombre | NVARCHAR(150) | NN |
| descripcion | NVARCHAR(500) | NULL |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### servicios
| Columna | Tipo | Restricciones |
|---|---|---|
| servicio_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| categoria_id | INT | **FK** → categorias_servicios(categoria_id), NN |
| nombre | NVARCHAR(200) | NN |
| descripcion | NVARCHAR(MAX) | NULL |
| duracion_minutos | INT | NN |
| precio | DECIMAL(10,2) | NULL |
| mostrar_precio | BIT | NN DEFAULT 0 |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Localidades y Horarios

### localidades
| Columna | Tipo | Restricciones |
|---|---|---|
| localidad_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| nombre | NVARCHAR(200) | NN |
| direccion | NVARCHAR(500) | NN |
| telefono | NVARCHAR(30) | NULL |
| principal | BIT | NN DEFAULT 0 |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### horarios
| Columna | Tipo | Restricciones |
|---|---|---|
| horario_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| localidad_id | INT | **FK** → localidades(localidad_id), NN |
| dia_semana | TINYINT | NN (0=Domingo .. 6=Sabado) |
| hora_apertura | TIME | NULL |
| hora_cerrado | TIME | NULL |
| cerrado | BIT | NN DEFAULT 0 |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### bloques_de_disponibilidad
| Columna | Tipo | Restricciones |
|---|---|---|
| bloque_disponibilidad_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| localidad_id | INT | **FK** → localidades(localidad_id), NN |
| fecha_de_bloque | DATE | NN |
| fecha_inicio | DATETIME2 | NN |
| fecha_final | DATETIME2 | NN |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Reservaciones

### reservaciones
| Columna | Tipo | Restricciones |
|---|---|---|
| reserva_id | INT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NN |
| cliente_id | INT | **FK** → clientes(cliente_id), NN |
| servicio_id | INT | **FK** → servicios(servicio_id), NN |
| localidad_id | INT | **FK** → localidades(localidad_id), NN |
| bloque_disponibilidad_id | INT | **FK** → bloques_de_disponibilidad(bloque_disponibilidad_id), NULL, UQ, ON DELETE SET NULL |
| estado_reservacion_id | INT | **FK** → estados_reservaciones(estado_reservacion_id), NN |
| fecha_inicio | DATETIME2 | NN |
| fecha_final | DATETIME2 | NN |
| nota_cliente | NVARCHAR(500) | NULL |
| nota_interna | NVARCHAR(500) | NULL |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| actualizado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### codigos_de_rastreos
| Columna | Tipo | Restricciones |
|---|---|---|
| codigo_de_rastreo_id | INT | **PK** IDENTITY(1,1) |
| reserva_id | INT | **FK** → reservaciones(reserva_id), NN, UQ |
| codigo_rastreo | NVARCHAR(50) | NN, UQ |
| expira_en | DATETIME2 | NN |
| activo | BIT | NN DEFAULT 1 |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Auditoria

### registros
| Columna | Tipo | Restricciones |
|---|---|---|
| registro_id | BIGINT | **PK** IDENTITY(1,1) |
| dominio_id | INT | **FK** → dominios(dominio_id), NULL |
| dueno_id | INT | **FK** → duenos_de_dominios(dueno_id), NULL |
| superadmin_id | INT | **FK** → superadmins(superadmin_id), NULL |
| accion | NVARCHAR(100) | NN |
| nombre_entidad | NVARCHAR(100) | NN |
| entidad_id | INT | NN |
| valor_anterior | NVARCHAR(MAX) | NULL |
| nuevo_valor | NVARCHAR(MAX) | NULL |
| creado_en | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Resumen de Relaciones

| # | Tabla Padre | Cardinalidad | Tabla Hija | Via FK |
|---|---|---|---|---|
| 1 | tipos_negocios | 1:N | dominios | tipo_negocio_id |
| 2 | estados_dominios | 1:N | dominios | dominio_estado_id |
| 3 | dominios | 1:N | duenos_de_dominios | dominio_id |
| 4 | dominios | 1:N | clientes | dominio_id |
| 5 | dominios | 1:N | categorias_servicios | dominio_id |
| 6 | dominios | 1:N | servicios | dominio_id |
| 7 | dominios | 1:N | localidades | dominio_id |
| 8 | dominios | 1:N | horarios | dominio_id |
| 9 | dominios | 1:N | bloques_de_disponibilidad | dominio_id |
| 10 | dominios | 1:N | reservaciones | dominio_id |
| 11 | dominios | 1:N | registros | dominio_id |
| 12 | duenos_de_dominios | 1:N | registros | dueno_id |
| 13 | superadmins | 1:N | registros | superadmin_id |
| 14 | categorias_servicios | 1:N | servicios | categoria_id |
| 15 | localidades | 1:N | horarios | localidad_id |
| 16 | localidades | 1:N | bloques_de_disponibilidad | localidad_id |
| 17 | localidades | 1:N | reservaciones | localidad_id |
| 18 | bloques_de_disponibilidad | 1:0..1 | reservaciones | bloque_disponibilidad_id (UQ, ON DELETE SET NULL) |
| 19 | clientes | 1:N | reservaciones | cliente_id |
| 20 | servicios | 1:N | reservaciones | servicio_id |
| 21 | estados_reservaciones | 1:N | reservaciones | estado_reservacion_id |
| 22 | reservaciones | 1:1 | codigos_de_rastreos | reserva_id (UQ) |
