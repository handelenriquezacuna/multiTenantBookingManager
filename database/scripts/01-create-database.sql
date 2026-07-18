-- ============================================================
-- 01-create-database.sql
-- Proyecto: Citari - Citari
-- Contenido: crea la base de datos citari desde cero.
-- Nota: el schema usa identificadores en espanol (ASCII puro);
--       ver docs/rename-map.csv para la equivalencia con los
--       nombres originales en ingles y el modelo MR con enie.
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'citari')
BEGIN
    ALTER DATABASE citari SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE citari;
END

CREATE DATABASE citari
COLLATE Latin1_General_CI_AI;
GO

USE citari;
GO

PRINT '[01-create-database] base de datos citari creada ... OK';
GO
