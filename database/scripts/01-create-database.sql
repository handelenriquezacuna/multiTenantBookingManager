-- ============================================================
-- 01-create-database.sql
-- Crea la base de datos principal del proyecto MBM
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'mbm_booking')
BEGIN
    ALTER DATABASE mbm_booking SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE mbm_booking;
END

CREATE DATABASE mbm_booking
COLLATE Latin1_General_CI_AI;
GO

USE mbm_booking;
GO
