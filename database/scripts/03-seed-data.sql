-- ============================================================
-- 03-seed-data.sql
-- Proyecto: MBM - Multi-Tenant Booking Manager
-- Contenido: datos de prueba (>= 50 registros por tabla)
-- ============================================================

USE mbm_booking;
GO

SET NOCOUNT ON;

WITH n AS (
    SELECT TOP (50) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects
)
SELECT n INTO #numbers FROM n;

DECLARE @business_types TABLE (row_num INT IDENTITY(1,1), business_type_id INT);
DECLARE @tenant_statuses TABLE (row_num INT IDENTITY(1,1), tenant_status_id INT);
DECLARE @booking_statuses TABLE (row_num INT IDENTITY(1,1), booking_status_id INT);
DECLARE @superadmins TABLE (row_num INT IDENTITY(1,1), superadmin_id INT);
DECLARE @tenants TABLE (row_num INT IDENTITY(1,1), tenant_id INT);
DECLARE @owners TABLE (row_num INT IDENTITY(1,1), owner_id INT);
DECLARE @customers TABLE (row_num INT IDENTITY(1,1), customer_id INT);
DECLARE @categories TABLE (row_num INT IDENTITY(1,1), category_id INT);
DECLARE @services TABLE (row_num INT IDENTITY(1,1), service_id INT);
DECLARE @locations TABLE (row_num INT IDENTITY(1,1), location_id INT);
DECLARE @blocks TABLE (row_num INT IDENTITY(1,1), availability_block_id INT);
DECLARE @bookings TABLE (row_num INT IDENTITY(1,1), booking_id INT);

-- Catalogos ---------------------------------------------------------------

INSERT INTO business_types (name, description, is_active)
OUTPUT inserted.business_type_id INTO @business_types (business_type_id)
VALUES
    (N'Barbería', N'Servicios de corte y arreglo personal', 1),
    (N'Salón', N'Servicios de belleza y estilismo', 1),
    (N'Spa', N'Tratamientos de relajación y bienestar', 1),
    (N'Veterinaria', N'Servicios de salud para mascotas', 1),
    (N'Clínica', N'Atención médica general', 1),
    (N'Consultorio', N'Atención especializada', 1),
    (N'Centro estético', N'Tratamientos estéticos', 1);

INSERT INTO business_types (name, description, is_active)
OUTPUT inserted.business_type_id INTO @business_types (business_type_id)
SELECT
    CONCAT(N'Tipo_negocio_', n.n),
    CONCAT(N'Descripción tipo ', n.n),
    1
FROM #numbers n
WHERE n.n > 7
  AND NOT EXISTS (
      SELECT 1
      FROM business_types bt
      WHERE bt.name = CONCAT(N'Tipo_negocio_', n.n)
  );

INSERT INTO tenant_statuses (name, description)
OUTPUT inserted.tenant_status_id INTO @tenant_statuses (tenant_status_id)
VALUES
    (N'pending', N'Pendiente de aprobación'),
    (N'active', N'Activo'),
    (N'suspended', N'Suspendido'),
    (N'inactive', N'Inactivo');

INSERT INTO tenant_statuses (name, description)
OUTPUT inserted.tenant_status_id INTO @tenant_statuses (tenant_status_id)
SELECT
    CONCAT(N'estado_', n.n),
    CONCAT(N'Estado ', n.n)
FROM #numbers n
WHERE n.n > 4
  AND NOT EXISTS (
      SELECT 1
      FROM tenant_statuses ts
      WHERE ts.name = CONCAT(N'estado_', n.n)
  );

INSERT INTO booking_statuses (name, description)
OUTPUT inserted.booking_status_id INTO @booking_statuses (booking_status_id)
VALUES
    (N'pending', N'Reserva pendiente'),
    (N'confirmed', N'Reserva confirmada'),
    (N'cancelled', N'Reserva cancelada'),
    (N'completed', N'Reserva completada'),
    (N'rescheduled', N'Reserva reagendada');

INSERT INTO booking_statuses (name, description)
OUTPUT inserted.booking_status_id INTO @booking_statuses (booking_status_id)
SELECT
    CONCAT(N'estado_reserva_', n.n),
    CONCAT(N'Estado reserva ', n.n)
FROM #numbers n
WHERE n.n > 5
  AND NOT EXISTS (
      SELECT 1
      FROM booking_statuses bs
      WHERE bs.name = CONCAT(N'estado_reserva_', n.n)
  );

-- Superadmins -------------------------------------------------------------

INSERT INTO superadmins (full_name, email, password_hash, is_active)
OUTPUT inserted.superadmin_id INTO @superadmins (superadmin_id)
SELECT
    CONCAT(N'Superadmin ', n.n),
    CONCAT(N'superadmin', n.n, N'@mbm.local'),
    CONCAT(N'hash_', n.n),
    1
FROM #numbers n;

-- Tenants -----------------------------------------------------------------

INSERT INTO tenants (
    business_type_id,
    tenant_status_id,
    name,
    slug,
    email,
    phone,
    description,
    logo_url,
    public_message,
    is_active
)
OUTPUT inserted.tenant_id INTO @tenants (tenant_id)
SELECT
    bt.business_type_id,
    ts.tenant_status_id,
    CONCAT(N'Negocio ', n.n),
    CONCAT(N'negocio-', n.n),
    CONCAT(N'negocio', n.n, N'@mbm.local'),
    CONCAT(N'8888-', RIGHT(CONCAT(N'000', n.n), 4)),
    CONCAT(N'Descripción negocio ', n.n),
    NULL,
    CONCAT(N'Mensaje público ', n.n),
    1
FROM #numbers n
JOIN @business_types bt ON bt.row_num = ((n.n - 1) % 50) + 1
JOIN @tenant_statuses ts ON ts.row_num = ((n.n - 1) % 50) + 1;

-- Owners ------------------------------------------------------------------

INSERT INTO tenant_owners (tenant_id, full_name, email, password_hash, phone, is_active)
OUTPUT inserted.owner_id INTO @owners (owner_id)
SELECT
    t.tenant_id,
    CONCAT(N'Dueño ', n.n),
    CONCAT(N'dueno', n.n, N'@mbm.local'),
    CONCAT(N'hash_dueno_', n.n),
    CONCAT(N'8899-', RIGHT(CONCAT(N'000', n.n), 4)),
    1
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n;

-- Customers ---------------------------------------------------------------

INSERT INTO customers (tenant_id, first_name, last_name, email, phone, notes)
OUTPUT inserted.customer_id INTO @customers (customer_id)
SELECT
    t.tenant_id,
    CONCAT(N'Cliente', n.n),
    CONCAT(N'Apellido', n.n),
    CONCAT(N'cliente', n.n, N'@mbm.local'),
    CONCAT(N'8777-', RIGHT(CONCAT(N'000', n.n), 4)),
    CONCAT(N'Nota ', n.n)
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n;

-- Service categories -------------------------------------------------------

INSERT INTO service_categories (tenant_id, name, description, is_active)
OUTPUT inserted.category_id INTO @categories (category_id)
SELECT
    t.tenant_id,
    CONCAT(N'Categoría ', n.n),
    CONCAT(N'Descripción categoría ', n.n),
    1
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n;

-- Services ----------------------------------------------------------------

INSERT INTO services (
    tenant_id,
    category_id,
    name,
    description,
    duration_minutes,
    price,
    show_price,
    is_active
)
OUTPUT inserted.service_id INTO @services (service_id)
SELECT
    t.tenant_id,
    c.category_id,
    CONCAT(N'Servicio ', n.n),
    CONCAT(N'Descripción servicio ', n.n),
    15 + (n.n % 60),
    CAST(10 + n.n AS DECIMAL(10,2)),
    1,
    1
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n
JOIN @categories c ON c.row_num = n.n;

-- Locations ---------------------------------------------------------------

INSERT INTO locations (tenant_id, name, address, phone, is_main, is_active)
OUTPUT inserted.location_id INTO @locations (location_id)
SELECT
    t.tenant_id,
    CONCAT(N'Sede ', n.n),
    CONCAT(N'Dirección ', n.n, N' Calle Principal'),
    CONCAT(N'8666-', RIGHT(CONCAT(N'000', n.n), 4)),
    1,
    1
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n;

-- Business hours -----------------------------------------------------------

INSERT INTO business_hours (tenant_id, location_id, day_of_week, open_time, close_time, is_closed)
SELECT
    t.tenant_id,
    l.location_id,
    (n.n - 1) % 7,
    '09:00',
    '18:00',
    0
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n
JOIN @locations l ON l.row_num = n.n;

-- Availability blocks ------------------------------------------------------

INSERT INTO availability_blocks (tenant_id, location_id, block_date, start_time, end_time, is_active)
OUTPUT inserted.availability_block_id INTO @blocks (availability_block_id)
SELECT
    t.tenant_id,
    l.location_id,
    DATEADD(DAY, n.n, CAST(GETUTCDATE() AS DATE)),
    '09:00',
    '09:30',
    1
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n
JOIN @locations l ON l.row_num = n.n;

-- Bookings -----------------------------------------------------------------

INSERT INTO bookings (
    tenant_id,
    customer_id,
    service_id,
    location_id,
    availability_block_id,
    booking_status_id,
    booking_date,
    start_time,
    end_time,
    customer_notes,
    internal_notes
)
OUTPUT inserted.booking_id INTO @bookings (booking_id)
SELECT
    t.tenant_id,
    c.customer_id,
    s.service_id,
    l.location_id,
    b.availability_block_id,
    bs.booking_status_id,
    DATEADD(DAY, n.n, CAST(GETUTCDATE() AS DATE)),
    '09:00',
    '09:30',
    CONCAT(N'Nota cliente ', n.n),
    NULL
FROM #numbers n
JOIN @tenants t ON t.row_num = n.n
JOIN @customers c ON c.row_num = n.n
JOIN @services s ON s.row_num = n.n
JOIN @locations l ON l.row_num = n.n
JOIN @blocks b ON b.row_num = n.n
JOIN @booking_statuses bs ON bs.row_num = n.n;

-- Tracking codes -----------------------------------------------------------

INSERT INTO tracking_codes (booking_id, tracking_code, expires_at, is_active)
SELECT
    bk.booking_id,
    CONCAT(N'MBM-', RIGHT(CONCAT(N'0000', bk.booking_id), 4)),
    DATEADD(DAY, 30, SYSUTCDATETIME()),
    1
FROM @bookings bk;

-- Audit logs ---------------------------------------------------------------

INSERT INTO audit_logs (tenant_id, owner_id, superadmin_id, action, entity_name, entity_id, old_value, new_value)
SELECT
    t.tenant_id,
    NULL,
    sa.superadmin_id,
    N'carga_seed',
    N'tenants',
    t.tenant_id,
    NULL,
    N'inserted'
FROM @tenants t
CROSS JOIN (SELECT TOP 1 superadmin_id FROM @superadmins ORDER BY superadmin_id) sa;

DROP TABLE #numbers;
GO
