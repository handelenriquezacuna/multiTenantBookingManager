-- ============================================================
-- schema_checks.sql
-- Validacion E2E de esquema vivo (BD citari) vs las fuentes de verdad:
--   docs/rename-map.csv               (tablas/columnas esperadas)
--   database/scripts/02-create-tables.sql (tipos, defaults, indices, FKs)
--   docs/sql-signatures.md            (SPs, funciones, vistas, triggers)
--
-- Solo lectura: unicamente SELECT/PRINT y objetos temporales (#temp,
-- variables) que viven dentro de esta sesion. No modifica tablas ni datos
-- de la aplicacion. Re-ejecutable sin efectos secundarios.
--
-- Formato de salida por linea: ' [schema-checks] NN.MMM nombre ... PASS/FAIL (evidencia)'
--   NN  = numero del check (01-08, ver docs del Agente 1 / db_schema_report.md)
--   MMM = sub-item dentro del check
--
-- Como ejecutar (contenedor db, compose proyecto citari):
--   docker cp tests/e2e/db/schema_checks.sql db:/tmp/schema_checks.sql
--   docker exec db /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
--     -P "$(/usr/bin/grep '^SQLSERVER_PASSWORD' .env | cut -d= -f2)" \
--     -C -I -d citari -W -i /tmp/schema_checks.sql
-- ============================================================

SET NOCOUNT ON;

-- ------------------------------------------------------------
-- Tabla de resultados acumulada (se imprime al final, ordenada)
-- ------------------------------------------------------------
IF OBJECT_ID('tempdb..#resultados') IS NOT NULL DROP TABLE #resultados;
CREATE TABLE #resultados (
    mayor      TINYINT      NOT NULL,
    menor      INT          NOT NULL,
    nombre     NVARCHAR(200) NOT NULL,
    estado     VARCHAR(4)   NOT NULL, -- PASS | FAIL | INFO
    evidencia  NVARCHAR(600) NULL
);

-- ============================================================
-- CHECK 1 - DRIFT: 15 tablas de rename-map.csv + columnas (nombre/tipo/nullable)
-- ============================================================

IF OBJECT_ID('tempdb..#tablas_esperadas') IS NOT NULL DROP TABLE #tablas_esperadas;
CREATE TABLE #tablas_esperadas (nombre sysname COLLATE DATABASE_DEFAULT PRIMARY KEY);
INSERT INTO #tablas_esperadas (nombre) VALUES
('tipos_negocios'),('estados_dominios'),('estados_reservaciones'),('superadmins'),
('dominios'),('duenos_de_dominios'),('clientes'),('categorias_servicios'),
('servicios'),('localidades'),('horarios'),('bloques_de_disponibilidad'),
('reservaciones'),('codigos_de_rastreos'),('registros');

-- 1a. existencia de las 15 tablas esperadas
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 1, ROW_NUMBER() OVER (ORDER BY e.nombre), 'tabla_existe:' + e.nombre,
       CASE WHEN t.object_id IS NULL THEN 'FAIL' ELSE 'PASS' END,
       CASE WHEN t.object_id IS NULL THEN 'no encontrada en sys.tables'
            ELSE 'object_id=' + CAST(t.object_id AS VARCHAR(20)) END
FROM #tablas_esperadas e
LEFT JOIN sys.tables t ON t.name = e.nombre;

-- 1b. tablas vivas no esperadas (drift positivo)
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 1, 16, 'sin_tablas_inesperadas',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'extras=' + CAST(COUNT(*) AS VARCHAR(10)) +
       ISNULL(' -> ' + STRING_AGG(t.name, ','), '')
FROM sys.tables t
LEFT JOIN #tablas_esperadas e ON e.nombre = t.name
WHERE e.nombre IS NULL;

-- Columnas esperadas (tabla, columna, tipo base, nullable) segun 02-create-tables.sql
IF OBJECT_ID('tempdb..#cols_esperadas') IS NOT NULL DROP TABLE #cols_esperadas;
CREATE TABLE #cols_esperadas (tabla sysname COLLATE DATABASE_DEFAULT NOT NULL, columna sysname COLLATE DATABASE_DEFAULT NOT NULL, tipo sysname COLLATE DATABASE_DEFAULT NOT NULL, nullable BIT NOT NULL);
INSERT INTO #cols_esperadas (tabla, columna, tipo, nullable) VALUES
('tipos_negocios','tipo_negocio_id','int',0),
('tipos_negocios','nombre','nvarchar',0),
('tipos_negocios','descripcion','nvarchar',1),
('tipos_negocios','activo','bit',0),
('estados_dominios','dominio_estado_id','int',0),
('estados_dominios','nombre','nvarchar',0),
('estados_dominios','descripcion','nvarchar',1),
('estados_reservaciones','estado_reservacion_id','int',0),
('estados_reservaciones','nombre','nvarchar',0),
('estados_reservaciones','descripcion','nvarchar',1),
('superadmins','superadmin_id','int',0),
('superadmins','nombre','nvarchar',0),
('superadmins','apellido_1','nvarchar',0),
('superadmins','apellido_2','nvarchar',1),
('superadmins','correo','nvarchar',0),
('superadmins','contrasena_encriptada','nvarchar',0),
('superadmins','activo','bit',0),
('superadmins','creado_en','datetime2',0),
('superadmins','actualizado_en','datetime2',0),
('dominios','dominio_id','int',0),
('dominios','tipo_negocio_id','int',0),
('dominios','dominio_estado_id','int',0),
('dominios','nombre','nvarchar',0),
('dominios','slug','nvarchar',0),
('dominios','correo','nvarchar',0),
('dominios','telefono','nvarchar',1),
('dominios','descripcion','nvarchar',1),
('dominios','logo_url','nvarchar',1),
('dominios','mensaje_publico','nvarchar',1),
('dominios','activo','bit',0),
('dominios','creado_en','datetime2',0),
('dominios','actualizado_en','datetime2',0),
('duenos_de_dominios','dueno_id','int',0),
('duenos_de_dominios','dominio_id','int',0),
('duenos_de_dominios','nombre','nvarchar',0),
('duenos_de_dominios','apellido_1','nvarchar',0),
('duenos_de_dominios','apellido_2','nvarchar',1),
('duenos_de_dominios','correo','nvarchar',0),
('duenos_de_dominios','contrasena_encriptada','nvarchar',0),
('duenos_de_dominios','telefono','nvarchar',1),
('duenos_de_dominios','activo','bit',0),
('duenos_de_dominios','creado_en','datetime2',0),
('duenos_de_dominios','actualizado_en','datetime2',0),
('clientes','cliente_id','int',0),
('clientes','dominio_id','int',0),
('clientes','nombre','nvarchar',0),
('clientes','apellido_1','nvarchar',0),
('clientes','apellido_2','nvarchar',1),
('clientes','correo','nvarchar',0),
('clientes','telefono','nvarchar',0),
('clientes','notas','nvarchar',1),
('clientes','creado_en','datetime2',0),
('clientes','actualizado_en','datetime2',0),
('categorias_servicios','categoria_id','int',0),
('categorias_servicios','dominio_id','int',0),
('categorias_servicios','nombre','nvarchar',0),
('categorias_servicios','descripcion','nvarchar',1),
('categorias_servicios','activo','bit',0),
('categorias_servicios','creado_en','datetime2',0),
('categorias_servicios','actualizado_en','datetime2',0),
('servicios','servicio_id','int',0),
('servicios','dominio_id','int',0),
('servicios','categoria_id','int',0),
('servicios','nombre','nvarchar',0),
('servicios','descripcion','nvarchar',1),
('servicios','duracion_minutos','int',0),
('servicios','precio','decimal',1),
('servicios','mostrar_precio','bit',0),
('servicios','activo','bit',0),
('servicios','creado_en','datetime2',0),
('servicios','actualizado_en','datetime2',0),
('localidades','localidad_id','int',0),
('localidades','dominio_id','int',0),
('localidades','nombre','nvarchar',0),
('localidades','direccion','nvarchar',0),
('localidades','telefono','nvarchar',1),
('localidades','principal','bit',0),
('localidades','activo','bit',0),
('localidades','creado_en','datetime2',0),
('localidades','actualizado_en','datetime2',0),
('horarios','horario_id','int',0),
('horarios','dominio_id','int',0),
('horarios','localidad_id','int',0),
('horarios','dia_semana','tinyint',0),
('horarios','hora_apertura','time',1),
('horarios','hora_cerrado','time',1),
('horarios','cerrado','bit',0),
('horarios','actualizado_en','datetime2',0),
('bloques_de_disponibilidad','bloque_disponibilidad_id','int',0),
('bloques_de_disponibilidad','dominio_id','int',0),
('bloques_de_disponibilidad','localidad_id','int',0),
('bloques_de_disponibilidad','fecha_de_bloque','date',0),
('bloques_de_disponibilidad','fecha_inicio','datetime2',0),
('bloques_de_disponibilidad','fecha_final','datetime2',0),
('bloques_de_disponibilidad','activo','bit',0),
('bloques_de_disponibilidad','creado_en','datetime2',0),
('bloques_de_disponibilidad','actualizado_en','datetime2',0),
('reservaciones','reserva_id','int',0),
('reservaciones','dominio_id','int',0),
('reservaciones','cliente_id','int',0),
('reservaciones','servicio_id','int',0),
('reservaciones','localidad_id','int',0),
('reservaciones','bloque_disponibilidad_id','int',1),
('reservaciones','estado_reservacion_id','int',0),
('reservaciones','fecha_inicio','datetime2',0),
('reservaciones','fecha_final','datetime2',0),
('reservaciones','nota_cliente','nvarchar',1),
('reservaciones','nota_interna','nvarchar',1),
('reservaciones','creado_en','datetime2',0),
('reservaciones','actualizado_en','datetime2',0),
('codigos_de_rastreos','codigo_de_rastreo_id','int',0),
('codigos_de_rastreos','reserva_id','int',0),
('codigos_de_rastreos','codigo_rastreo','nvarchar',0),
('codigos_de_rastreos','expira_en','datetime2',0),
('codigos_de_rastreos','activo','bit',0),
('codigos_de_rastreos','creado_en','datetime2',0),
('registros','registro_id','bigint',0),
('registros','dominio_id','int',1),
('registros','dueno_id','int',1),
('registros','superadmin_id','int',1),
('registros','accion','nvarchar',0),
('registros','nombre_entidad','nvarchar',0),
('registros','entidad_id','int',0),
('registros','valor_anterior','nvarchar',1),
('registros','nuevo_valor','nvarchar',1),
('registros','creado_en','datetime2',0);

IF OBJECT_ID('tempdb..#col_diffs') IS NOT NULL DROP TABLE #col_diffs;
CREATE TABLE #col_diffs (tabla sysname COLLATE DATABASE_DEFAULT, columna sysname COLLATE DATABASE_DEFAULT, motivo NVARCHAR(200));

-- columnas esperadas sin match exacto (nombre+tipo+nullable) en vivo
INSERT INTO #col_diffs (tabla, columna, motivo)
SELECT ce.tabla, ce.columna, 'esperada sin match exacto (nombre/tipo/nullable) en vivo'
FROM #cols_esperadas ce
WHERE NOT EXISTS (
    SELECT 1 FROM sys.tables t
    JOIN sys.columns c ON c.object_id = t.object_id
    JOIN sys.types ty ON ty.user_type_id = c.user_type_id
    WHERE t.name = ce.tabla AND c.name = ce.columna AND ty.name = ce.tipo AND c.is_nullable = ce.nullable
);

-- columnas vivas no declaradas en 02-create-tables.sql (solo en tablas esperadas)
INSERT INTO #col_diffs (tabla, columna, motivo)
SELECT t.name, c.name, 'columna viva no declarada en 02-create-tables.sql'
FROM sys.tables t
JOIN sys.columns c ON c.object_id = t.object_id
WHERE t.name IN (SELECT nombre FROM #tablas_esperadas)
  AND NOT EXISTS (SELECT 1 FROM #cols_esperadas ce WHERE ce.tabla = t.name AND ce.columna = c.name);

-- 1c. resumen por tabla (PASS si 0 diferencias)
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 1, 16 + ROW_NUMBER() OVER (ORDER BY tab.nombre), 'columnas_coinciden:' + tab.nombre,
       CASE WHEN ISNULL(d.n, 0) = 0 THEN 'PASS' ELSE 'FAIL' END,
       CASE WHEN ISNULL(d.n, 0) = 0 THEN 'sin diferencias' ELSE CAST(d.n AS VARCHAR(10)) + ' diferencias, ver diff_detalle' END
FROM #tablas_esperadas tab
LEFT JOIN (SELECT tabla, COUNT(*) AS n FROM #col_diffs GROUP BY tabla) d ON d.tabla = tab.nombre;

-- 1d. detalle de diferencias (solo aparece si hay drift real)
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 1, 200 + ROW_NUMBER() OVER (ORDER BY tabla, columna), 'diff_detalle:' + tabla + '.' + columna, 'INFO', motivo
FROM #col_diffs;

-- ============================================================
-- CHECK 2 - Soft delete: activo BIT DEFAULT 1; creado_en/actualizado_en DEFAULT sysutcdatetime()
-- ============================================================

IF OBJECT_ID('tempdb..#activo_tablas') IS NOT NULL DROP TABLE #activo_tablas;
CREATE TABLE #activo_tablas (tabla sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #activo_tablas (tabla) VALUES
('tipos_negocios'),('superadmins'),('dominios'),('duenos_de_dominios'),
('categorias_servicios'),('servicios'),('localidades'),('bloques_de_disponibilidad'),
('codigos_de_rastreos');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 2, ROW_NUMBER() OVER (ORDER BY at.tabla), 'activo_bit_default1:' + at.tabla,
       CASE WHEN c.column_id IS NULL THEN 'FAIL'
            WHEN ty.name <> 'bit' THEN 'FAIL'
            WHEN c.is_nullable = 1 THEN 'FAIL'
            WHEN dc.definition IS NULL OR dc.definition <> '((1))' THEN 'FAIL'
            ELSE 'PASS' END,
       CASE WHEN c.column_id IS NULL THEN 'columna activo no existe'
            ELSE 'tipo=' + ISNULL(ty.name,'?') + ' nullable=' + CAST(c.is_nullable AS VARCHAR(1)) + ' default=' + ISNULL(dc.definition,'NULL') END
FROM #activo_tablas at
LEFT JOIN sys.tables t ON t.name = at.tabla
LEFT JOIN sys.columns c ON c.object_id = t.object_id AND c.name = 'activo'
LEFT JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = t.object_id AND dc.parent_column_id = c.column_id;

IF OBJECT_ID('tempdb..#creado_en_tablas') IS NOT NULL DROP TABLE #creado_en_tablas;
CREATE TABLE #creado_en_tablas (tabla sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #creado_en_tablas (tabla) VALUES
('superadmins'),('dominios'),('duenos_de_dominios'),('clientes'),('categorias_servicios'),
('servicios'),('localidades'),('bloques_de_disponibilidad'),('reservaciones'),
('codigos_de_rastreos'),('registros');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 2, 30 + ROW_NUMBER() OVER (ORDER BY ct.tabla), 'creado_en_default_sysutcdatetime:' + ct.tabla,
       CASE WHEN c.column_id IS NULL THEN 'FAIL'
            WHEN ty.name <> 'datetime2' THEN 'FAIL'
            WHEN c.is_nullable = 1 THEN 'FAIL'
            WHEN dc.definition IS NULL OR UPPER(dc.definition) NOT LIKE '%SYSUTCDATETIME%' THEN 'FAIL'
            ELSE 'PASS' END,
       CASE WHEN c.column_id IS NULL THEN 'columna creado_en no existe'
            ELSE 'tipo=' + ISNULL(ty.name,'?') + ' nullable=' + CAST(c.is_nullable AS VARCHAR(1)) + ' default=' + ISNULL(dc.definition,'NULL') END
FROM #creado_en_tablas ct
LEFT JOIN sys.tables t ON t.name = ct.tabla
LEFT JOIN sys.columns c ON c.object_id = t.object_id AND c.name = 'creado_en'
LEFT JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = t.object_id AND dc.parent_column_id = c.column_id;

IF OBJECT_ID('tempdb..#actualizado_en_tablas') IS NOT NULL DROP TABLE #actualizado_en_tablas;
CREATE TABLE #actualizado_en_tablas (tabla sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #actualizado_en_tablas (tabla) VALUES
('superadmins'),('dominios'),('duenos_de_dominios'),('clientes'),('categorias_servicios'),
('servicios'),('localidades'),('horarios'),('bloques_de_disponibilidad'),('reservaciones');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 2, 60 + ROW_NUMBER() OVER (ORDER BY at2.tabla), 'actualizado_en_default_sysutcdatetime:' + at2.tabla,
       CASE WHEN c.column_id IS NULL THEN 'FAIL'
            WHEN ty.name <> 'datetime2' THEN 'FAIL'
            WHEN c.is_nullable = 1 THEN 'FAIL'
            WHEN dc.definition IS NULL OR UPPER(dc.definition) NOT LIKE '%SYSUTCDATETIME%' THEN 'FAIL'
            ELSE 'PASS' END,
       CASE WHEN c.column_id IS NULL THEN 'columna actualizado_en no existe'
            ELSE 'tipo=' + ISNULL(ty.name,'?') + ' nullable=' + CAST(c.is_nullable AS VARCHAR(1)) + ' default=' + ISNULL(dc.definition,'NULL') END
FROM #actualizado_en_tablas at2
LEFT JOIN sys.tables t ON t.name = at2.tabla
LEFT JOIN sys.columns c ON c.object_id = t.object_id AND c.name = 'actualizado_en'
LEFT JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = t.object_id AND dc.parent_column_id = c.column_id;

-- ============================================================
-- CHECK 3 - Indice filtrado ux_reservaciones_bloque
-- ============================================================

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 3, 1, 'indice_filtrado_ux_reservaciones_bloque',
       CASE WHEN i.is_unique = 1 AND i.has_filter = 1 AND i.filter_definition LIKE '%IS NOT NULL%' THEN 'PASS' ELSE 'FAIL' END,
       'is_unique=' + ISNULL(CAST(i.is_unique AS VARCHAR(5)),'NULL') +
       ' has_filter=' + ISNULL(CAST(i.has_filter AS VARCHAR(5)),'NULL') +
       ' filter=' + ISNULL(i.filter_definition,'NULL')
FROM (SELECT 'reservaciones' AS tabla) base
LEFT JOIN sys.tables t ON t.name = base.tabla
LEFT JOIN sys.indexes i ON i.object_id = t.object_id AND i.name = 'ux_reservaciones_bloque';

-- ============================================================
-- CHECK 4 - Foreign keys declaradas en 02-create-tables.sql + huerfanos = 0
-- ============================================================

IF OBJECT_ID('tempdb..#fks_esperadas') IS NOT NULL DROP TABLE #fks_esperadas;
CREATE TABLE #fks_esperadas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tabla_hija sysname COLLATE DATABASE_DEFAULT, columna_hija sysname COLLATE DATABASE_DEFAULT,
    tabla_padre sysname COLLATE DATABASE_DEFAULT, columna_padre sysname COLLATE DATABASE_DEFAULT,
    nullable_hija BIT
);
INSERT INTO #fks_esperadas (tabla_hija, columna_hija, tabla_padre, columna_padre, nullable_hija) VALUES
('dominios','tipo_negocio_id','tipos_negocios','tipo_negocio_id',0),
('dominios','dominio_estado_id','estados_dominios','dominio_estado_id',0),
('duenos_de_dominios','dominio_id','dominios','dominio_id',0),
('clientes','dominio_id','dominios','dominio_id',0),
('categorias_servicios','dominio_id','dominios','dominio_id',0),
('servicios','dominio_id','dominios','dominio_id',0),
('servicios','categoria_id','categorias_servicios','categoria_id',0),
('localidades','dominio_id','dominios','dominio_id',0),
('horarios','dominio_id','dominios','dominio_id',0),
('horarios','localidad_id','localidades','localidad_id',0),
('bloques_de_disponibilidad','dominio_id','dominios','dominio_id',0),
('bloques_de_disponibilidad','localidad_id','localidades','localidad_id',0),
('reservaciones','dominio_id','dominios','dominio_id',0),
('reservaciones','cliente_id','clientes','cliente_id',0),
('reservaciones','servicio_id','servicios','servicio_id',0),
('reservaciones','localidad_id','localidades','localidad_id',0),
('reservaciones','bloque_disponibilidad_id','bloques_de_disponibilidad','bloque_disponibilidad_id',1),
('reservaciones','estado_reservacion_id','estados_reservaciones','estado_reservacion_id',0),
('codigos_de_rastreos','reserva_id','reservaciones','reserva_id',0),
('registros','dominio_id','dominios','dominio_id',1),
('registros','dueno_id','duenos_de_dominios','dueno_id',1),
('registros','superadmin_id','superadmins','superadmin_id',1);

-- 4a. existencia de cada FK declarada
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 4, fe.id, 'fk_existe:' + fe.tabla_hija + '.' + fe.columna_hija + '->' + fe.tabla_padre,
       CASE WHEN EXISTS (
           SELECT 1
           FROM sys.foreign_keys fk
           JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
           JOIN sys.tables th ON th.object_id = fk.parent_object_id
           JOIN sys.columns ch ON ch.object_id = th.object_id AND ch.column_id = fkc.parent_column_id
           JOIN sys.tables tp ON tp.object_id = fk.referenced_object_id
           JOIN sys.columns cp ON cp.object_id = tp.object_id AND cp.column_id = fkc.referenced_column_id
           WHERE th.name = fe.tabla_hija AND ch.name = fe.columna_hija
             AND tp.name = fe.tabla_padre AND cp.name = fe.columna_padre
       ) THEN 'PASS' ELSE 'FAIL' END,
       'sys.foreign_keys/sys.foreign_key_columns'
FROM #fks_esperadas fe;

-- 4b. conteo total de FKs vivas vs esperadas (22)
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 4, 50, 'fk_count_22',
       CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM #fks_esperadas) THEN 'PASS' ELSE 'FAIL' END,
       'count_vivo=' + CAST(COUNT(*) AS VARCHAR(10)) + ' esperado=' + CAST((SELECT COUNT(*) FROM #fks_esperadas) AS VARCHAR(10))
FROM sys.foreign_keys;

-- 4c. huerfanos por FK (debe ser 0 en cada una) - dynamic SQL por par de columnas
DECLARE @id INT, @th sysname, @ch sysname, @tp sysname, @cp sysname, @nullable BIT, @sql NVARCHAR(MAX), @cnt INT;
DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT id, tabla_hija, columna_hija, tabla_padre, columna_padre, nullable_hija FROM #fks_esperadas ORDER BY id;
OPEN fk_cursor;
FETCH NEXT FROM fk_cursor INTO @id, @th, @ch, @tp, @cp, @nullable;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID(QUOTENAME(@th)) IS NULL OR OBJECT_ID(QUOTENAME(@tp)) IS NULL
    BEGIN
        INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
        VALUES (4, 100 + @id, 'fk_huerfanos:' + @th + '.' + @ch, 'FAIL', 'no evaluado: tabla hija/padre ausente');
    END
    ELSE
    BEGIN
        IF @nullable = 1
            SET @sql = N'SELECT @cnt_out = COUNT(*) FROM ' + QUOTENAME(@th) + N' x LEFT JOIN ' + QUOTENAME(@tp) +
                       N' p ON x.' + QUOTENAME(@ch) + N' = p.' + QUOTENAME(@cp) +
                       N' WHERE x.' + QUOTENAME(@ch) + N' IS NOT NULL AND p.' + QUOTENAME(@cp) + N' IS NULL';
        ELSE
            SET @sql = N'SELECT @cnt_out = COUNT(*) FROM ' + QUOTENAME(@th) + N' x LEFT JOIN ' + QUOTENAME(@tp) +
                       N' p ON x.' + QUOTENAME(@ch) + N' = p.' + QUOTENAME(@cp) +
                       N' WHERE p.' + QUOTENAME(@cp) + N' IS NULL';

        EXEC sp_executesql @sql, N'@cnt_out INT OUTPUT', @cnt_out = @cnt OUTPUT;

        INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
        VALUES (4, 100 + @id, 'fk_huerfanos:' + @th + '.' + @ch,
                CASE WHEN @cnt = 0 THEN 'PASS' ELSE 'FAIL' END,
                'huerfanos=' + CAST(@cnt AS VARCHAR(10)));
    END
    FETCH NEXT FROM fk_cursor INTO @id, @th, @ch, @tp, @cp, @nullable;
END
CLOSE fk_cursor;
DEALLOCATE fk_cursor;

-- ============================================================
-- CHECK 5 - Multi-tenant: dominio_id en tablas operacionales
-- ============================================================

IF OBJECT_ID('tempdb..#mt_tablas') IS NOT NULL DROP TABLE #mt_tablas;
CREATE TABLE #mt_tablas (tabla sysname COLLATE DATABASE_DEFAULT, nullable_esperado BIT);
INSERT INTO #mt_tablas (tabla, nullable_esperado) VALUES
('duenos_de_dominios',0),('clientes',0),('categorias_servicios',0),('servicios',0),
('localidades',0),('horarios',0),('bloques_de_disponibilidad',0),('reservaciones',0),
('registros',1);

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 5, ROW_NUMBER() OVER (ORDER BY mt.tabla), 'dominio_id_presente:' + mt.tabla,
       CASE WHEN t.object_id IS NULL THEN 'FAIL'
            WHEN c.column_id IS NULL THEN 'FAIL'
            WHEN c.is_nullable <> mt.nullable_esperado THEN 'FAIL'
            ELSE 'PASS' END,
       CASE WHEN t.object_id IS NULL THEN 'tabla no existe'
            WHEN c.column_id IS NULL THEN 'columna dominio_id no existe'
            ELSE 'is_nullable=' + CAST(c.is_nullable AS VARCHAR(1)) + ' esperado=' + CAST(mt.nullable_esperado AS VARCHAR(1)) END
FROM #mt_tablas mt
LEFT JOIN sys.tables t ON t.name = mt.tabla
LEFT JOIN sys.columns c ON c.object_id = t.object_id AND c.name = 'dominio_id';

-- documenta la excepcion: codigos_de_rastreos hereda el tenant via reserva_id -> reservaciones.dominio_id
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 5, 20, 'excepcion_codigos_de_rastreos_hereda_via_reserva',
       CASE WHEN NOT EXISTS (SELECT 1 FROM sys.columns c JOIN sys.tables t ON t.object_id = c.object_id WHERE t.name = 'codigos_de_rastreos' AND c.name = 'dominio_id')
             AND EXISTS (SELECT 1 FROM sys.columns c JOIN sys.tables t ON t.object_id = c.object_id WHERE t.name = 'codigos_de_rastreos' AND c.name = 'reserva_id')
            THEN 'PASS' ELSE 'FAIL' END,
       'codigos_de_rastreos no tiene columna dominio_id propia; el tenant se resuelve via reserva_id -> reservaciones.dominio_id (diseno documentado, no defecto)';

-- ============================================================
-- CHECK 6 - Sanidad de datos (seed 50 filas/tabla)
-- ============================================================

IF OBJECT_ID('tempdb..#row_counts') IS NOT NULL DROP TABLE #row_counts;
CREATE TABLE #row_counts (tabla sysname COLLATE DATABASE_DEFAULT, n INT);
INSERT INTO #row_counts (tabla, n)
SELECT 'tipos_negocios', COUNT(*) FROM tipos_negocios
UNION ALL SELECT 'estados_dominios', COUNT(*) FROM estados_dominios
UNION ALL SELECT 'estados_reservaciones', COUNT(*) FROM estados_reservaciones
UNION ALL SELECT 'superadmins', COUNT(*) FROM superadmins
UNION ALL SELECT 'dominios', COUNT(*) FROM dominios
UNION ALL SELECT 'duenos_de_dominios', COUNT(*) FROM duenos_de_dominios
UNION ALL SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL SELECT 'categorias_servicios', COUNT(*) FROM categorias_servicios
UNION ALL SELECT 'servicios', COUNT(*) FROM servicios
UNION ALL SELECT 'localidades', COUNT(*) FROM localidades
UNION ALL SELECT 'horarios', COUNT(*) FROM horarios
UNION ALL SELECT 'bloques_de_disponibilidad', COUNT(*) FROM bloques_de_disponibilidad
UNION ALL SELECT 'reservaciones', COUNT(*) FROM reservaciones
UNION ALL SELECT 'codigos_de_rastreos', COUNT(*) FROM codigos_de_rastreos
UNION ALL SELECT 'registros', COUNT(*) FROM registros;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 6, ROW_NUMBER() OVER (ORDER BY tabla), 'fila_count_min50:' + tabla,
       CASE WHEN n >= 50 THEN 'PASS' ELSE 'FAIL' END, 'n=' + CAST(n AS VARCHAR(10))
FROM #row_counts;

-- 6.20 reservas canceladas deben tener bloque_disponibilidad_id NULL
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 6, 20, 'canceladas_bloque_null',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'reservas_canceladas_con_bloque_no_null=' + CAST(COUNT(*) AS VARCHAR(10))
FROM reservaciones r
JOIN estados_reservaciones er ON er.estado_reservacion_id = r.estado_reservacion_id
WHERE er.nombre = 'cancelada' AND r.bloque_disponibilidad_id IS NOT NULL;

-- 6.21 patron de bloques liberados: un bloque sin reserva activa (no cancelada) que le apunte debe estar activo=1
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 6, 21, 'bloques_liberados_consistentes',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'bloques_libres_marcados_inactivo=' + CAST(COUNT(*) AS VARCHAR(10))
FROM bloques_de_disponibilidad b
WHERE b.activo = 0
  AND NOT EXISTS (
      SELECT 1 FROM reservaciones r
      JOIN estados_reservaciones er ON er.estado_reservacion_id = r.estado_reservacion_id
      WHERE r.bloque_disponibilidad_id = b.bloque_disponibilidad_id AND er.nombre <> 'cancelada'
  );

-- 6.22 codigos de rastreo unicos
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 6, 22, 'codigos_rastreo_unicos',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'codigos_duplicados=' + CAST(COUNT(*) AS VARCHAR(10))
FROM (SELECT codigo_rastreo FROM codigos_de_rastreos GROUP BY codigo_rastreo HAVING COUNT(*) > 1) d;

-- 6.23 formato/prefijo vigente de codigo_rastreo: se detecta el prefijo real en los datos (CITARI- o MBM-)
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 6, 23, 'codigo_rastreo_formato_prefijo',
       CASE WHEN COUNT(*) > 0
                 AND COUNT(*) = SUM(CASE WHEN codigo_rastreo LIKE 'CITARI-%' OR codigo_rastreo LIKE 'MBM-%' THEN 1 ELSE 0 END)
            THEN 'PASS' ELSE 'FAIL' END,
       'prefijos_detectados=' + ISNULL((
            SELECT STRING_AGG(prefijo + ':' + CAST(n AS VARCHAR(10)), ', ')
            FROM (
                SELECT LEFT(codigo_rastreo, CHARINDEX('-', codigo_rastreo)) AS prefijo, COUNT(*) AS n
                FROM codigos_de_rastreos
                GROUP BY LEFT(codigo_rastreo, CHARINDEX('-', codigo_rastreo))
            ) p
       ), 'ninguno')
FROM codigos_de_rastreos;

-- 6.24 0 duplicados no-NULL en reservaciones.bloque_disponibilidad_id
INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 6, 24, 'bloque_disponibilidad_id_sin_duplicados',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'bloques_duplicados=' + CAST(COUNT(*) AS VARCHAR(10))
FROM (SELECT bloque_disponibilidad_id FROM reservaciones WHERE bloque_disponibilidad_id IS NOT NULL GROUP BY bloque_disponibilidad_id HAVING COUNT(*) > 1) d;

-- ============================================================
-- CHECK 7 - Programables: 13 SPs, 6 funciones, 7 vistas (>=2 tablas c/u), 7 triggers
-- ============================================================

IF OBJECT_ID('tempdb..#sp_esperados') IS NOT NULL DROP TABLE #sp_esperados;
CREATE TABLE #sp_esperados (nombre sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #sp_esperados (nombre) VALUES
('sp_crear_dominio'),('sp_crear_dueno'),('sp_activar_dominio'),('sp_suspender_dominio'),
('sp_crear_servicio'),('sp_actualizar_servicio'),('sp_crear_bloque_disponibilidad'),
('sp_crear_cliente'),('sp_crear_reservacion'),('sp_confirmar_reservacion'),
('sp_cancelar_reservacion'),('sp_reagendar_reservacion'),('sp_completar_reservacion');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 1, 'sp_count_13', CASE WHEN COUNT(*) = 13 THEN 'PASS' ELSE 'FAIL' END, 'count=' + CAST(COUNT(*) AS VARCHAR(5))
FROM sys.procedures;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 1 + ROW_NUMBER() OVER (ORDER BY e.nombre), 'sp_existe:' + e.nombre,
       CASE WHEN p.object_id IS NULL THEN 'FAIL' ELSE 'PASS' END,
       ISNULL('object_id=' + CAST(p.object_id AS VARCHAR(20)), 'no encontrado')
FROM #sp_esperados e LEFT JOIN sys.procedures p ON p.name = e.nombre;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 15, 'sp_sin_extras',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'extras=' + CAST(COUNT(*) AS VARCHAR(5)) + ISNULL(' -> ' + STRING_AGG(p.name, ','), '')
FROM sys.procedures p LEFT JOIN #sp_esperados e ON e.nombre = p.name WHERE e.nombre IS NULL;

IF OBJECT_ID('tempdb..#fn_esperadas') IS NOT NULL DROP TABLE #fn_esperadas;
CREATE TABLE #fn_esperadas (nombre sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #fn_esperadas (nombre) VALUES
('fn_generar_codigo_rastreo'),('fn_dominio_activo'),('fn_bloque_disponible'),
('fn_total_reservaciones_por_dominio'),('fn_total_reservaciones_por_servicio'),('fn_duracion_reservacion');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 16, 'fn_count_6', CASE WHEN COUNT(*) = 6 THEN 'PASS' ELSE 'FAIL' END, 'count=' + CAST(COUNT(*) AS VARCHAR(5))
FROM sys.objects WHERE type IN ('FN','TF','IF');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 16 + ROW_NUMBER() OVER (ORDER BY e.nombre), 'fn_existe:' + e.nombre,
       CASE WHEN o.object_id IS NULL THEN 'FAIL' ELSE 'PASS' END,
       ISNULL('object_id=' + CAST(o.object_id AS VARCHAR(20)), 'no encontrado')
FROM #fn_esperadas e LEFT JOIN sys.objects o ON o.name = e.nombre AND o.type IN ('FN','TF','IF');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 23, 'fn_sin_extras',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'extras=' + CAST(COUNT(*) AS VARCHAR(5)) + ISNULL(' -> ' + STRING_AGG(o.name, ','), '')
FROM sys.objects o LEFT JOIN #fn_esperadas e ON e.nombre = o.name WHERE o.type IN ('FN','TF','IF') AND e.nombre IS NULL;

IF OBJECT_ID('tempdb..#vw_esperadas') IS NOT NULL DROP TABLE #vw_esperadas;
CREATE TABLE #vw_esperadas (nombre sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #vw_esperadas (nombre) VALUES
('vw_detalle_reservaciones'),('vw_agenda_diaria'),('vw_servicios_publicos'),
('vw_dashboard_dominio'),('vw_estado_disponibilidad'),('vw_historial_reservaciones_cliente'),
('vw_demanda_servicios');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 24, 'vw_count_7', CASE WHEN COUNT(*) = 7 THEN 'PASS' ELSE 'FAIL' END, 'count=' + CAST(COUNT(*) AS VARCHAR(5))
FROM sys.views;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 24 + ROW_NUMBER() OVER (ORDER BY e.nombre), 'vw_existe_y_2mas_tablas:' + e.nombre,
       CASE WHEN v.object_id IS NULL THEN 'FAIL'
            WHEN ISNULL(dep.n_tablas, 0) >= 2 THEN 'PASS'
            ELSE 'FAIL' END,
       CASE WHEN v.object_id IS NULL THEN 'vista no encontrada'
            ELSE 'tablas_referenciadas=' + CAST(ISNULL(dep.n_tablas, 0) AS VARCHAR(5)) END
FROM #vw_esperadas e
LEFT JOIN sys.views v ON v.name = e.nombre
LEFT JOIN (
    SELECT d.referencing_id, COUNT(DISTINCT d.referenced_id) AS n_tablas
    FROM sys.sql_expression_dependencies d
    JOIN sys.tables t ON t.object_id = d.referenced_id
    GROUP BY d.referencing_id
) dep ON dep.referencing_id = v.object_id;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 32, 'vw_sin_extras',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'extras=' + CAST(COUNT(*) AS VARCHAR(5)) + ISNULL(' -> ' + STRING_AGG(v.name, ','), '')
FROM sys.views v LEFT JOIN #vw_esperadas e ON e.nombre = v.name WHERE e.nombre IS NULL;

IF OBJECT_ID('tempdb..#tr_esperados') IS NOT NULL DROP TABLE #tr_esperados;
CREATE TABLE #tr_esperados (nombre sysname COLLATE DATABASE_DEFAULT);
INSERT INTO #tr_esperados (nombre) VALUES
('trg_reservaciones_generar_rastreo'),('trg_reservaciones_auditar_insert'),
('trg_reservaciones_auditar_update'),('trg_dominios_actualizado_en'),
('trg_servicios_actualizado_en'),('trg_prevenir_doble_reservacion'),('trg_liberar_bloque_al_cancelar');

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 33, 'tr_count_7', CASE WHEN COUNT(*) = 7 THEN 'PASS' ELSE 'FAIL' END, 'count=' + CAST(COUNT(*) AS VARCHAR(5))
FROM sys.triggers;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 33 + ROW_NUMBER() OVER (ORDER BY e.nombre), 'tr_existe:' + e.nombre,
       CASE WHEN tr.object_id IS NULL THEN 'FAIL' ELSE 'PASS' END,
       ISNULL('object_id=' + CAST(tr.object_id AS VARCHAR(20)), 'no encontrado')
FROM #tr_esperados e LEFT JOIN sys.triggers tr ON tr.name = e.nombre;

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
SELECT 7, 41, 'tr_sin_extras',
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
       'extras=' + CAST(COUNT(*) AS VARCHAR(5)) + ISNULL(' -> ' + STRING_AGG(tr.name, ','), '')
FROM sys.triggers tr LEFT JOIN #tr_esperados e ON e.nombre = tr.name WHERE e.nombre IS NULL;

-- ============================================================
-- CHECK 8 - Hallazgo de diseno: dominios.slug UNIQUE plano (no filtrado)
-- ============================================================

DECLARE @slug_unique_plano BIT = (
    SELECT CASE WHEN EXISTS (
        SELECT 1
        FROM sys.indexes i
        JOIN sys.tables t ON t.object_id = i.object_id
        JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
        WHERE t.name = 'dominios' AND c.name = 'slug' AND i.is_unique_constraint = 1 AND i.has_filter = 0
    ) THEN 1 ELSE 0 END
);

INSERT INTO #resultados (mayor, menor, nombre, estado, evidencia)
VALUES (8, 1, 'hallazgo_dominios_slug_unique_no_filtrado',
    CASE WHEN @slug_unique_plano = 1 THEN 'INFO' ELSE 'PASS' END,
    CASE WHEN @slug_unique_plano = 1
        THEN 'SEVERIDAD=MENOR: dominios.slug tiene un UNIQUE constraint plano (no filtrado). Un dominio soft-deleted (activo=0) sigue ocupando su slug, lo que bloquea sp_crear_dominio al reciclar ese mismo slug para un nuevo dominio (violacion de UNIQUE). Impacto acotado: solo afecta el caso de re-crear un dominio con el slug de uno dado de baja; no afecta lectura/escritura normal de dominios activos. Mitigacion sugerida (fuera de scope de este check): indice unico filtrado WHERE activo = 1, similar al de ux_reservaciones_bloque.'
        ELSE 'no reproducido en este ambiente: la restriccion de slug ya no es un UNIQUE plano; revisar si el hallazgo documentado sigue vigente'
    END);

-- ============================================================
-- SALIDA FINAL
-- ============================================================

SELECT
    ' [schema-checks] ' + RIGHT('0' + CAST(mayor AS VARCHAR(2)), 2) + '.' + RIGHT('000' + CAST(menor AS VARCHAR(4)), 3)
    + ' ' + nombre + ' ... ' + estado
    + CASE WHEN evidencia IS NOT NULL THEN ' (' + evidencia + ')' ELSE '' END AS resultado
FROM #resultados
ORDER BY mayor, menor;

SELECT
    mayor AS check_num,
    COUNT(*) AS items,
    SUM(CASE WHEN estado = 'FAIL' THEN 1 ELSE 0 END) AS fails,
    CASE WHEN SUM(CASE WHEN estado = 'FAIL' THEN 1 ELSE 0 END) = 0 THEN 'PASS' ELSE 'FAIL' END AS check_global
FROM #resultados
WHERE estado IN ('PASS','FAIL')
GROUP BY mayor
ORDER BY mayor;

DECLARE @total_items INT, @total_fail INT;
SELECT @total_items = COUNT(*), @total_fail = SUM(CASE WHEN estado = 'FAIL' THEN 1 ELSE 0 END)
FROM #resultados WHERE estado IN ('PASS','FAIL');

PRINT ' [schema-checks] RESUMEN total_items=' + CAST(@total_items AS VARCHAR(10))
      + ' total_fail=' + CAST(@total_fail AS VARCHAR(10))
      + ' resultado_global=' + CASE WHEN @total_fail = 0 THEN 'PASS' ELSE 'FAIL' END;
