-- ============================================================
-- 01-create-database.sql
-- Proyecto: MBM - Multi-Tenant Booking Manager
-- Contenido: crea la base de datos mbm_booking desde cero.
-- Nota: el schema usa identificadores en espanol (ASCII puro);
--       ver docs/rename-map.csv para la equivalencia con los
--       nombres originales en ingles y el modelo MR con enie.
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

PRINT '[01-create-database] base de datos mbm_booking creada ... OK';
GO
