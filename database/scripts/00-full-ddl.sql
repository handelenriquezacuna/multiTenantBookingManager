-- ============================================================
-- 00-full-ddl.sql
-- Proyecto: MBM - Multi-Tenant Booking Manager
-- Motor: SQL Server 2022
-- Contenido: creacion de la base de datos y de las 15 tablas.
-- ============================================================

-- 1. Crear la base de datos --------------------------------------------------
USE master;
GO

CREATE DATABASE mbm_booking;
GO

USE mbm_booking;
GO


-- 2. Catalogos ---------------------------------------------------------------

CREATE TABLE business_types (
    business_type_id INT IDENTITY(1,1) PRIMARY KEY,
    name             NVARCHAR(100) NOT NULL UNIQUE,
    description      NVARCHAR(500) NULL,
    is_active        BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE tenant_statuses (
    tenant_status_id INT IDENTITY(1,1) PRIMARY KEY,
    name             NVARCHAR(50) NOT NULL UNIQUE,
    description      NVARCHAR(200) NULL
);
GO

CREATE TABLE booking_statuses (
    booking_status_id INT IDENTITY(1,1) PRIMARY KEY,
    name              NVARCHAR(50) NOT NULL UNIQUE,
    description       NVARCHAR(200) NULL
);
GO


-- 3. Superadmins (administradores globales) ----------------------------------

CREATE TABLE superadmins (
    superadmin_id INT IDENTITY(1,1) PRIMARY KEY,
    full_name     NVARCHAR(200) NOT NULL,
    email         NVARCHAR(254) NOT NULL UNIQUE,
    password_hash NVARCHAR(512) NOT NULL,
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


-- 4. Tenants y owners --------------------------------------------------------

CREATE TABLE tenants (
    tenant_id        INT IDENTITY(1,1) PRIMARY KEY,
    business_type_id INT NOT NULL REFERENCES business_types(business_type_id),
    tenant_status_id INT NOT NULL REFERENCES tenant_statuses(tenant_status_id),
    name             NVARCHAR(200) NOT NULL,
    slug             NVARCHAR(100) NOT NULL UNIQUE,
    email            NVARCHAR(254) NOT NULL,
    phone            NVARCHAR(30) NULL,
    description      NVARCHAR(MAX) NULL,
    logo_url         NVARCHAR(500) NULL,
    public_message   NVARCHAR(500) NULL,
    is_active        BIT NOT NULL DEFAULT 1,
    created_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE tenant_owners (
    owner_id      INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id     INT NOT NULL REFERENCES tenants(tenant_id),
    full_name     NVARCHAR(200) NOT NULL,
    email         NVARCHAR(254) NOT NULL,
    password_hash NVARCHAR(512) NOT NULL,
    phone         NVARCHAR(30) NULL,
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


-- 5. Clientes ----------------------------------------------------------------

CREATE TABLE customers (
    customer_id INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id   INT NOT NULL REFERENCES tenants(tenant_id),
    first_name  NVARCHAR(100) NOT NULL,
    last_name   NVARCHAR(100) NOT NULL,
    email       NVARCHAR(254) NOT NULL,
    phone       NVARCHAR(30) NOT NULL,
    notes       NVARCHAR(500) NULL,
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


-- 6. Servicios ---------------------------------------------------------------

CREATE TABLE service_categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id   INT NOT NULL REFERENCES tenants(tenant_id),
    name        NVARCHAR(150) NOT NULL,
    description NVARCHAR(500) NULL,
    is_active   BIT NOT NULL DEFAULT 1,
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE services (
    service_id       INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id        INT NOT NULL REFERENCES tenants(tenant_id),
    category_id      INT NOT NULL REFERENCES service_categories(category_id),
    name             NVARCHAR(200) NOT NULL,
    description      NVARCHAR(MAX) NULL,
    duration_minutes INT NOT NULL,
    price            DECIMAL(10,2) NULL,
    show_price       BIT NOT NULL DEFAULT 0,
    is_active        BIT NOT NULL DEFAULT 1,
    created_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


-- 7. Ubicaciones y horarios --------------------------------------------------

CREATE TABLE locations (
    location_id INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id   INT NOT NULL REFERENCES tenants(tenant_id),
    name        NVARCHAR(200) NOT NULL,
    address     NVARCHAR(500) NOT NULL,
    phone       NVARCHAR(30) NULL,
    is_main     BIT NOT NULL DEFAULT 0,
    is_active   BIT NOT NULL DEFAULT 1,
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE business_hours (
    business_hour_id INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id        INT NOT NULL REFERENCES tenants(tenant_id),
    location_id      INT NOT NULL REFERENCES locations(location_id),
    day_of_week      TINYINT NOT NULL,
    open_time        TIME NULL,
    close_time       TIME NULL,
    is_closed        BIT NOT NULL DEFAULT 0,
    updated_at       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE availability_blocks (
    availability_block_id INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id             INT NOT NULL REFERENCES tenants(tenant_id),
    location_id           INT NOT NULL REFERENCES locations(location_id),
    block_date            DATE NOT NULL,
    start_time            TIME NOT NULL,
    end_time              TIME NOT NULL,
    is_active             BIT NOT NULL DEFAULT 1,
    created_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


-- 8. Reservas ----------------------------------------------------------------

CREATE TABLE bookings (
    booking_id            INT IDENTITY(1,1) PRIMARY KEY,
    tenant_id             INT NOT NULL REFERENCES tenants(tenant_id),
    customer_id           INT NOT NULL REFERENCES customers(customer_id),
    service_id            INT NOT NULL REFERENCES services(service_id),
    location_id           INT NOT NULL REFERENCES locations(location_id),
    availability_block_id INT NULL REFERENCES availability_blocks(availability_block_id),
    booking_status_id     INT NOT NULL REFERENCES booking_statuses(booking_status_id),
    booking_date          DATE NOT NULL,
    start_time            TIME NOT NULL,
    end_time              TIME NOT NULL,
    customer_notes        NVARCHAR(500) NULL,
    internal_notes        NVARCHAR(500) NULL,
    created_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE tracking_codes (
    tracking_id   INT IDENTITY(1,1) PRIMARY KEY,
    booking_id    INT NOT NULL UNIQUE REFERENCES bookings(booking_id),
    tracking_code NVARCHAR(50) NOT NULL UNIQUE,
    expires_at    DATETIME2 NOT NULL,
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO


-- 9. Auditoria ---------------------------------------------------------------

CREATE TABLE audit_logs (
    audit_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    tenant_id     INT NULL REFERENCES tenants(tenant_id),
    owner_id      INT NULL REFERENCES tenant_owners(owner_id),
    superadmin_id INT NULL REFERENCES superadmins(superadmin_id),
    action        NVARCHAR(100) NOT NULL,
    entity_name   NVARCHAR(100) NOT NULL,
    entity_id     INT NOT NULL,
    old_value     NVARCHAR(MAX) NULL,
    new_value     NVARCHAR(MAX) NULL,
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO
