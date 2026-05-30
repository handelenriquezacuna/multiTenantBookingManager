-- ============================================
-- CHECK ALL TABLES - row counts & full data
-- ============================================

-- ROW COUNTS
SELECT 'row_counts' AS section, 'business_types' AS tbl, COUNT(*) AS rows FROM business_types
UNION ALL SELECT 'row_counts', 'tenant_statuses', COUNT(*) FROM tenant_statuses
UNION ALL SELECT 'row_counts', 'booking_statuses', COUNT(*) FROM booking_statuses
UNION ALL SELECT 'row_counts', 'superadmins', COUNT(*) FROM superadmins
UNION ALL SELECT 'row_counts', 'tenants', COUNT(*) FROM tenants
UNION ALL SELECT 'row_counts', 'tenant_owners', COUNT(*) FROM tenant_owners
UNION ALL SELECT 'row_counts', 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'row_counts', 'service_categories', COUNT(*) FROM service_categories
UNION ALL SELECT 'row_counts', 'services', COUNT(*) FROM services
UNION ALL SELECT 'row_counts', 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'row_counts', 'business_hours', COUNT(*) FROM business_hours
UNION ALL SELECT 'row_counts', 'availability_blocks', COUNT(*) FROM availability_blocks
UNION ALL SELECT 'row_counts', 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'row_counts', 'tracking_codes', COUNT(*) FROM tracking_codes
UNION ALL SELECT 'row_counts', 'audit_logs', COUNT(*) FROM audit_logs;

-- FULL DATA
SELECT '=== business_types ==' AS tbl, * FROM business_types;
SELECT '=== tenant_statuses ==' AS tbl, * FROM tenant_statuses;
SELECT '=== booking_statuses ==' AS tbl, * FROM booking_statuses;
SELECT '=== superadmins ==' AS tbl, * FROM superadmins;
SELECT '=== tenants ==' AS tbl, * FROM tenants ORDER BY tenant_id;
SELECT '=== tenant_owners ==' AS tbl, * FROM tenant_owners ORDER BY owner_id;
SELECT '=== customers ==' AS tbl, * FROM customers ORDER BY customer_id;
SELECT '=== service_categories ==' AS tbl, * FROM service_categories ORDER BY category_id;
SELECT '=== services ==' AS tbl, * FROM services ORDER BY service_id;
SELECT '=== locations ==' AS tbl, * FROM locations ORDER BY location_id;
SELECT '=== business_hours ==' AS tbl, * FROM business_hours ORDER BY business_hour_id;
SELECT '=== availability_blocks ==' AS tbl, * FROM availability_blocks ORDER BY availability_block_id;
SELECT '=== bookings ==' AS tbl, * FROM bookings ORDER BY booking_id;
SELECT '=== tracking_codes ==' AS tbl, * FROM tracking_codes ORDER BY tracking_id;
SELECT '=== audit_logs ==' AS tbl, * FROM audit_logs ORDER BY audit_id;
