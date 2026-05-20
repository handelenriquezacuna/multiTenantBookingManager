-- ============================================================
-- 02-create-tables.sql
-- DDL completo para MBM — orden respeta dependencias FK
-- ============================================================

USE mbm_booking;
GO

-- Catálogos de referencia -----------------------------------

CREATE TABLE business_types (
    id          INT           IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255)
);
GO

CREATE TABLE tenant_statuses (
    id   INT           IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50)  NOT NULL UNIQUE   -- active | suspended | pending
);
GO

CREATE TABLE booking_statuses (
    id   INT           IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50)  NOT NULL UNIQUE   -- pending | confirmed | cancelled | rescheduled
);
GO

-- Tenants ---------------------------------------------------

CREATE TABLE tenants (
    id               INT            IDENTITY(1,1) PRIMARY KEY,
    slug             NVARCHAR(100)  NOT NULL UNIQUE,
    name             NVARCHAR(200)  NOT NULL,
    business_type_id INT            NOT NULL REFERENCES business_types(id),
    status_id        INT            NOT NULL REFERENCES tenant_statuses(id),
    created_at       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    updated_at       DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE tenant_owners (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    tenant_id  INT           NOT NULL REFERENCES tenants(id),
    full_name  NVARCHAR(200) NOT NULL,
    email      NVARCHAR(254) NOT NULL UNIQUE,
    password_hash NVARCHAR(512) NOT NULL,
    created_at DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

-- Customers -------------------------------------------------

CREATE TABLE customers (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    tenant_id  INT           NOT NULL REFERENCES tenants(id),
    full_name  NVARCHAR(200) NOT NULL,
    email      NVARCHAR(254) NOT NULL,
    phone      NVARCHAR(30),
    created_at DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT uq_customer_tenant_email UNIQUE (tenant_id, email)
);
GO

-- Servicios -------------------------------------------------

CREATE TABLE service_categories (
    id        INT           IDENTITY(1,1) PRIMARY KEY,
    tenant_id INT           NOT NULL REFERENCES tenants(id),
    name      NVARCHAR(100) NOT NULL
);
GO

CREATE TABLE services (
    id          INT             IDENTITY(1,1) PRIMARY KEY,
    tenant_id   INT             NOT NULL REFERENCES tenants(id),
    category_id INT             NOT NULL REFERENCES service_categories(id),
    name        NVARCHAR(200)   NOT NULL,
    duration_min INT            NOT NULL,  -- duración en minutos
    price       DECIMAL(10, 2)  NOT NULL DEFAULT 0,
    is_active   BIT             NOT NULL DEFAULT 1
);
GO

-- Ubicaciones y horarios ------------------------------------

CREATE TABLE locations (
    id        INT           IDENTITY(1,1) PRIMARY KEY,
    tenant_id INT           NOT NULL REFERENCES tenants(id),
    name      NVARCHAR(200) NOT NULL,
    address   NVARCHAR(500)
);
GO

CREATE TABLE business_hours (
    id          INT  IDENTITY(1,1) PRIMARY KEY,
    tenant_id   INT  NOT NULL REFERENCES tenants(id),
    day_of_week TINYINT NOT NULL,   -- 0=Sun … 6=Sat
    open_time   TIME NOT NULL,
    close_time  TIME NOT NULL
);
GO

CREATE TABLE availability_blocks (
    id          INT       IDENTITY(1,1) PRIMARY KEY,
    location_id INT       NOT NULL REFERENCES locations(id),
    start_at    DATETIME2 NOT NULL,
    end_at      DATETIME2 NOT NULL,
    capacity    SMALLINT  NOT NULL DEFAULT 1
);
GO

-- Reservas --------------------------------------------------

CREATE TABLE bookings (
    id                    INT           IDENTITY(1,1) PRIMARY KEY,
    tenant_id             INT           NOT NULL REFERENCES tenants(id),
    customer_id           INT           NOT NULL REFERENCES customers(id),
    service_id            INT           NOT NULL REFERENCES services(id),
    availability_block_id INT           NOT NULL REFERENCES availability_blocks(id),
    status_id             INT           NOT NULL REFERENCES booking_statuses(id),
    notes                 NVARCHAR(1000),
    created_at            DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
    updated_at            DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO

CREATE TABLE tracking_codes (
    id         INT           IDENTITY(1,1) PRIMARY KEY,
    booking_id INT           NOT NULL UNIQUE REFERENCES bookings(id),
    code       NVARCHAR(50)  NOT NULL UNIQUE,
    expires_at DATETIME2     NOT NULL
);
GO

-- Auditoría -------------------------------------------------

CREATE TABLE audit_logs (
    id         BIGINT        IDENTITY(1,1) PRIMARY KEY,
    tenant_id  INT           NOT NULL REFERENCES tenants(id),
    action     NVARCHAR(100) NOT NULL,
    entity     NVARCHAR(100) NOT NULL,
    entity_id  INT,
    performed_by INT,
    payload    NVARCHAR(MAX),
    created_at DATETIME2     NOT NULL DEFAULT GETUTCDATE()
);
GO
