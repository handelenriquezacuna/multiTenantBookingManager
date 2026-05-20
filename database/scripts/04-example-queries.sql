-- ============================================================
-- 04-example-queries.sql
-- Queries de referencia para explorar y validar el schema
-- Ejecutar después de 03-seed-data.sql
-- ============================================================

USE mbm_booking;
GO

-- ── 1. Listar todos los tenants con su tipo y estado ────────
SELECT
    t.id,
    t.slug,
    t.name            AS tenant_name,
    bt.name           AS business_type,
    ts.name           AS status,
    t.created_at
FROM tenants t
JOIN business_types  bt ON bt.id = t.business_type_id
JOIN tenant_statuses ts ON ts.id = t.status_id;
GO

-- ── 2. Servicios activos de un tenant ───────────────────────
SELECT
    s.id,
    sc.name           AS category,
    s.name            AS service,
    s.duration_min,
    s.price
FROM services s
JOIN service_categories sc ON sc.id = s.category_id
JOIN tenants t             ON t.id  = s.tenant_id
WHERE t.slug = 'demo-barberia'
  AND s.is_active = 1
ORDER BY sc.name, s.name;
GO

-- ── 3. Bloques de disponibilidad futuros ────────────────────
SELECT
    ab.id,
    l.name  AS location,
    ab.start_at,
    ab.end_at,
    ab.capacity,
    ab.capacity - COUNT(b.id) AS remaining_slots
FROM availability_blocks ab
JOIN locations l ON l.id = ab.location_id
LEFT JOIN bookings b
    ON b.availability_block_id = ab.id
   AND b.status_id IN (SELECT id FROM booking_statuses WHERE name IN ('pending','confirmed'))
WHERE ab.start_at >= GETUTCDATE()
GROUP BY ab.id, l.name, ab.start_at, ab.end_at, ab.capacity
HAVING ab.capacity - COUNT(b.id) > 0
ORDER BY ab.start_at;
GO

-- ── 4. Reservas de un tenant con detalle completo ───────────
SELECT
    bk.id            AS booking_id,
    c.full_name      AS customer,
    c.email,
    s.name           AS service,
    ab.start_at,
    ab.end_at,
    bs.name          AS booking_status,
    tc.code          AS tracking_code,
    bk.created_at
FROM bookings bk
JOIN tenants            t  ON t.id  = bk.tenant_id
JOIN customers          c  ON c.id  = bk.customer_id
JOIN services           s  ON s.id  = bk.service_id
JOIN availability_blocks ab ON ab.id = bk.availability_block_id
JOIN booking_statuses   bs ON bs.id = bk.status_id
LEFT JOIN tracking_codes tc ON tc.booking_id = bk.id
WHERE t.slug = 'demo-barberia'
ORDER BY ab.start_at DESC;
GO

-- ── 5. Conteo de reservas por servicio (reporte básico) ─────
SELECT
    s.name          AS service,
    COUNT(bk.id)    AS total_bookings,
    SUM(s.price)    AS total_revenue
FROM bookings bk
JOIN services s ON s.id = bk.service_id
JOIN tenants  t ON t.id = bk.tenant_id
WHERE t.slug = 'demo-barberia'
  AND bk.status_id = (SELECT id FROM booking_statuses WHERE name = 'confirmed')
GROUP BY s.id, s.name
ORDER BY total_bookings DESC;
GO

-- ── 6. Buscar reserva por tracking code (portal público) ────
DECLARE @code NVARCHAR(50) = 'TRK-00001';   -- reemplaza con un código real

SELECT
    tc.code,
    c.full_name  AS customer,
    s.name       AS service,
    ab.start_at,
    ab.end_at,
    bs.name      AS status
FROM tracking_codes tc
JOIN bookings         bk ON bk.id = tc.booking_id
JOIN customers         c ON c.id  = bk.customer_id
JOIN services          s ON s.id  = bk.service_id
JOIN availability_blocks ab ON ab.id = bk.availability_block_id
JOIN booking_statuses  bs ON bs.id = bk.status_id
WHERE tc.code = @code;
GO
