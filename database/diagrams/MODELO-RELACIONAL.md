# Modelo Relacional — MBM Booking

> Esquema logico de la base de datos `mbm_booking`. 15 tablas normalizadas.
> PK = PRIMARY KEY, FK = FOREIGN KEY, UQ = UNIQUE, NN = NOT NULL

## Catalogos

### business_types
| Columna | Tipo | Restricciones |
|---|---|---|
| business_type_id | INT | **PK** IDENTITY(1,1) |
| name | NVARCHAR(100) | NN, UQ |
| description | NVARCHAR(500) | NULL |
| is_active | BIT | NN DEFAULT 1 |

### tenant_statuses
| Columna | Tipo | Restricciones |
|---|---|---|
| tenant_status_id | INT | **PK** IDENTITY(1,1) |
| name | NVARCHAR(50) | NN, UQ |
| description | NVARCHAR(200) | NULL |

### booking_statuses
| Columna | Tipo | Restricciones |
|---|---|---|
| booking_status_id | INT | **PK** IDENTITY(1,1) |
| name | NVARCHAR(50) | NN, UQ |
| description | NVARCHAR(200) | NULL |

---

## Superadmins

### superadmins
| Columna | Tipo | Restricciones |
|---|---|---|
| superadmin_id | INT | **PK** IDENTITY(1,1) |
| full_name | NVARCHAR(200) | NN |
| email | NVARCHAR(254) | NN, UQ |
| password_hash | NVARCHAR(512) | NN |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Tenants y Owners

### tenants
| Columna | Tipo | Restricciones |
|---|---|---|
| tenant_id | INT | **PK** IDENTITY(1,1) |
| business_type_id | INT | **FK** → business_types(business_type_id), NN |
| tenant_status_id | INT | **FK** → tenant_statuses(tenant_status_id), NN |
| name | NVARCHAR(200) | NN |
| slug | NVARCHAR(100) | NN, UQ |
| email | NVARCHAR(254) | NN |
| phone | NVARCHAR(30) | NULL |
| description | NVARCHAR(MAX) | NULL |
| logo_url | NVARCHAR(500) | NULL |
| public_message | NVARCHAR(500) | NULL |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### tenant_owners
| Columna | Tipo | Restricciones |
|---|---|---|
| owner_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| full_name | NVARCHAR(200) | NN |
| email | NVARCHAR(254) | NN |
| password_hash | NVARCHAR(512) | NN |
| phone | NVARCHAR(30) | NULL |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Clientes

### customers
| Columna | Tipo | Restricciones |
|---|---|---|
| customer_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| first_name | NVARCHAR(100) | NN |
| last_name | NVARCHAR(100) | NN |
| email | NVARCHAR(254) | NN |
| phone | NVARCHAR(30) | NN |
| notes | NVARCHAR(500) | NULL |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Servicios

### service_categories
| Columna | Tipo | Restricciones |
|---|---|---|
| category_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| name | NVARCHAR(150) | NN |
| description | NVARCHAR(500) | NULL |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### services
| Columna | Tipo | Restricciones |
|---|---|---|
| service_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| category_id | INT | **FK** → service_categories(category_id), NN |
| name | NVARCHAR(200) | NN |
| description | NVARCHAR(MAX) | NULL |
| duration_minutes | INT | NN |
| price | DECIMAL(10,2) | NULL |
| show_price | BIT | NN DEFAULT 0 |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Ubicaciones y Horarios

### locations
| Columna | Tipo | Restricciones |
|---|---|---|
| location_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| name | NVARCHAR(200) | NN |
| address | NVARCHAR(500) | NN |
| phone | NVARCHAR(30) | NULL |
| is_main | BIT | NN DEFAULT 0 |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### business_hours
| Columna | Tipo | Restricciones |
|---|---|---|
| business_hour_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| location_id | INT | **FK** → locations(location_id), NN |
| day_of_week | TINYINT | NN (0=Domingo .. 6=Sabado) |
| open_time | TIME | NULL |
| close_time | TIME | NULL |
| is_closed | BIT | NN DEFAULT 0 |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### availability_blocks
| Columna | Tipo | Restricciones |
|---|---|---|
| availability_block_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| location_id | INT | **FK** → locations(location_id), NN |
| block_date | DATE | NN |
| start_time | TIME | NN |
| end_time | TIME | NN |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Reservas

### bookings
| Columna | Tipo | Restricciones |
|---|---|---|
| booking_id | INT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NN |
| customer_id | INT | **FK** → customers(customer_id), NN |
| service_id | INT | **FK** → services(service_id), NN |
| location_id | INT | **FK** → locations(location_id), NN |
| availability_block_id | INT | **FK** → availability_blocks(availability_block_id), NULL, UQ, ON DELETE SET NULL |
| booking_status_id | INT | **FK** → booking_statuses(booking_status_id), NN |
| booking_date | DATE | NN |
| start_time | TIME | NN |
| end_time | TIME | NN |
| customer_notes | NVARCHAR(500) | NULL |
| internal_notes | NVARCHAR(500) | NULL |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |
| updated_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

### tracking_codes
| Columna | Tipo | Restricciones |
|---|---|---|
| tracking_id | INT | **PK** IDENTITY(1,1) |
| booking_id | INT | **FK** → bookings(booking_id), NN, UQ |
| tracking_code | NVARCHAR(50) | NN, UQ |
| expires_at | DATETIME2 | NN |
| is_active | BIT | NN DEFAULT 1 |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Auditoria

### audit_logs
| Columna | Tipo | Restricciones |
|---|---|---|
| audit_id | BIGINT | **PK** IDENTITY(1,1) |
| tenant_id | INT | **FK** → tenants(tenant_id), NULL |
| owner_id | INT | **FK** → tenant_owners(owner_id), NULL |
| superadmin_id | INT | **FK** → superadmins(superadmin_id), NULL |
| action | NVARCHAR(100) | NN |
| entity_name | NVARCHAR(100) | NN |
| entity_id | INT | NN |
| old_value | NVARCHAR(MAX) | NULL |
| new_value | NVARCHAR(MAX) | NULL |
| created_at | DATETIME2 | NN DEFAULT SYSUTCDATETIME() |

---

## Resumen de Relaciones

| # | Tabla Padre | Cardinalidad | Tabla Hija | Via FK |
|---|---|---|---|---|
| 1 | business_types | 1:N | tenants | business_type_id |
| 2 | tenant_statuses | 1:N | tenants | tenant_status_id |
| 3 | tenants | 1:N | tenant_owners | tenant_id |
| 4 | tenants | 1:N | customers | tenant_id |
| 5 | tenants | 1:N | service_categories | tenant_id |
| 6 | tenants | 1:N | services | tenant_id |
| 7 | tenants | 1:N | locations | tenant_id |
| 8 | tenants | 1:N | business_hours | tenant_id |
| 9 | tenants | 1:N | availability_blocks | tenant_id |
| 10 | tenants | 1:N | bookings | tenant_id |
| 11 | tenants | 1:N | audit_logs | tenant_id |
| 12 | tenant_owners | 1:N | audit_logs | owner_id |
| 13 | superadmins | 1:N | audit_logs | superadmin_id |
| 14 | service_categories | 1:N | services | category_id |
| 15 | locations | 1:N | business_hours | location_id |
| 16 | locations | 1:N | availability_blocks | location_id |
| 17 | locations | 1:N | bookings | location_id |
| 18 | availability_blocks | 1:0..1 | bookings | availability_block_id (UQ, ON DELETE SET NULL) |
| 19 | customers | 1:N | bookings | customer_id |
| 20 | services | 1:N | bookings | service_id |
| 21 | booking_statuses | 1:N | bookings | booking_status_id |
| 22 | bookings | 1:1 | tracking_codes | booking_id (UQ) |
