-- ============================================================
-- 03-seed-data.sql
-- Datos de catálogo y un tenant demo para desarrollo
-- ============================================================

USE mbm_booking;
GO

-- Catálogos -------------------------------------------------

INSERT INTO business_types (name, description) VALUES
    ('Barbería',    'Servicios de corte y arreglo personal'),
    ('Spa',         'Tratamientos de relajación y bienestar'),
    ('Consultorio', 'Atención médica o de salud'),
    ('Estudio',     'Clases o sesiones de arte/deporte');
GO

INSERT INTO tenant_statuses (name) VALUES
    ('active'), ('suspended'), ('pending');
GO

INSERT INTO booking_statuses (name) VALUES
    ('pending'), ('confirmed'), ('cancelled'), ('rescheduled');
GO

-- Tenant demo -----------------------------------------------

INSERT INTO tenants (slug, name, business_type_id, status_id)
VALUES ('demo-barberia', 'Barbería Demo', 1, 1);
GO

DECLARE @tid INT = SCOPE_IDENTITY();

INSERT INTO tenant_owners (tenant_id, full_name, email, password_hash)
VALUES (@tid, 'Admin Demo', 'admin@demo.com', 'hash_placeholder');

INSERT INTO service_categories (tenant_id, name)
VALUES (@tid, 'Cortes'), (@tid, 'Barba');

INSERT INTO services (tenant_id, category_id, name, duration_min, price)
VALUES
    (@tid, 1, 'Corte clásico',    30, 15.00),
    (@tid, 1, 'Corte + degradado',45, 20.00),
    (@tid, 2, 'Arreglo de barba', 20, 10.00);

INSERT INTO locations (tenant_id, name, address)
VALUES (@tid, 'Sede principal', 'Calle Falsa 123, Ciudad Demo');

INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time)
VALUES
    (@tid, 1, '09:00', '18:00'),
    (@tid, 2, '09:00', '18:00'),
    (@tid, 3, '09:00', '18:00'),
    (@tid, 4, '09:00', '18:00'),
    (@tid, 5, '09:00', '18:00');
GO
