-- ============================================================
-- 01-create-database.sql
-- Crea la base de datos principal del proyecto MBM
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'mbm_booking')
BEGIN
    CREATE DATABASE mbm_booking
    COLLATE Latin1_General_CI_AI;
END
GO

USE mbm_booking;
GO
