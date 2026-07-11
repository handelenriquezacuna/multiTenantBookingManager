-- ============================================================
-- smoke-db.sql
-- Proyecto: MBM - Multi-Tenant Booking Manager
-- Prueba de humo (re-ejecutable) para los 13 stored procedures de
-- database/scripts/04-procedures.sql.
--
-- Casos:
--   1. sp_crear_reservacion sobre un bloque libre -> reserva creada y
--      bloque ocupado (activo = 0).
--   2. Segunda sp_crear_reservacion sobre EL MISMO bloque -> rechazada
--      con THROW en el rango 50040-50059 (bloque ocupado).
--   3. sp_cancelar_reservacion sobre la reserva del caso 1 -> estado
--      'cancelada'. (La liberacion del bloque queda a cargo del
--      trigger WP4; no se verifica aqui.)
--   4. sp_confirmar_reservacion sobre una reserva nueva (bloque distinto).
--   5. sp_completar_reservacion sobre esa misma reserva.
--   6. sp_crear_cliente reutiliza el cliente por correo duplicado.
--
-- Nota sobre datos: el seed de 03-seed-data.sql deja los 50 bloques de
-- disponibilidad con activo = 1, pero cada uno ya tiene una reservacion
-- de seed apuntandole (bloque_disponibilidad_id es UNIQUE en
-- reservaciones), por lo que ningun bloque del seed esta realmente
-- libre para una reservacion nueva. Este script crea sus propios
-- bloques de prueba via sp_crear_bloque_disponibilidad (en fechas muy
-- posteriores a cualquier dato existente, para no solaparse) y los
-- elimina al final junto con las reservaciones y el cliente de prueba,
-- dejando la base de datos igual que al inicio.
-- ============================================================

USE mbm_booking;
GO

SET NOCOUNT ON;

PRINT ' [smoke-db] inicio de prueba de humo';

-- ------------------------------------------------------------
-- 0. Preparacion: limpiar restos de una corrida anterior fallida y
--    localizar un dominio activo con servicio, localidad y cliente.
-- ------------------------------------------------------------
DECLARE @correo_prueba NVARCHAR(254) = N'smoke.cliente@example.com';

DELETE FROM reservaciones
WHERE nota_cliente = N'smoke-db test reservacion';

DELETE FROM bloques_de_disponibilidad
WHERE fecha_de_bloque IN (N'2031-01-15', N'2031-01-16');

DELETE FROM clientes
WHERE correo = @correo_prueba;

DECLARE @dominio_id      INT;
DECLARE @servicio_id     INT;
DECLARE @localidad_id    INT;
DECLARE @cliente_id      INT;

SELECT TOP 1 @dominio_id = d.dominio_id
FROM dominios d
WHERE d.dominio_estado_id = (SELECT dominio_estado_id FROM estados_dominios WHERE nombre = N'activo')
  AND EXISTS (SELECT 1 FROM servicios s WHERE s.dominio_id = d.dominio_id AND s.activo = 1)
  AND EXISTS (SELECT 1 FROM localidades l WHERE l.dominio_id = d.dominio_id AND l.activo = 1)
  AND EXISTS (SELECT 1 FROM clientes c WHERE c.dominio_id = d.dominio_id)
ORDER BY d.dominio_id;

IF @dominio_id IS NULL
BEGIN
    PRINT ' [smoke-db] preparacion ... FAIL (no se encontro un dominio activo con datos de seed suficientes)';
    RETURN;
END

SELECT TOP 1 @servicio_id = servicio_id FROM servicios WHERE dominio_id = @dominio_id AND activo = 1 ORDER BY servicio_id;
SELECT TOP 1 @localidad_id = localidad_id FROM localidades WHERE dominio_id = @dominio_id AND activo = 1 ORDER BY localidad_id;
SELECT TOP 1 @cliente_id = cliente_id FROM clientes WHERE dominio_id = @dominio_id ORDER BY cliente_id;

PRINT ' [smoke-db] preparacion ... OK (dominio_id=' + CAST(@dominio_id AS NVARCHAR(20))
    + ', servicio_id=' + CAST(@servicio_id AS NVARCHAR(20))
    + ', localidad_id=' + CAST(@localidad_id AS NVARCHAR(20))
    + ', cliente_id=' + CAST(@cliente_id AS NVARCHAR(20)) + ')';

-- Fechas de prueba muy posteriores a cualquier dato de seed, para
-- evitar el rechazo por solapamiento (THROW 50041).
DECLARE @bloque_a_id INT;
DECLARE @bloque_b_id INT;

EXEC sp_crear_bloque_disponibilidad
    @dominio_id      = @dominio_id,
    @localidad_id    = @localidad_id,
    @fecha_de_bloque = '2031-01-15',
    @fecha_inicio    = '2031-01-15T09:00:00',
    @fecha_final     = '2031-01-15T09:30:00',
    @bloque_id       = @bloque_a_id OUTPUT;

EXEC sp_crear_bloque_disponibilidad
    @dominio_id      = @dominio_id,
    @localidad_id    = @localidad_id,
    @fecha_de_bloque = '2031-01-16',
    @fecha_inicio    = '2031-01-16T10:00:00',
    @fecha_final     = '2031-01-16T10:30:00',
    @bloque_id       = @bloque_b_id OUTPUT;

-- ------------------------------------------------------------
-- Caso 1: crear reservacion sobre un bloque libre.
-- ------------------------------------------------------------
DECLARE @reserva_1_id INT;
DECLARE @caso1_ok BIT = 0;

BEGIN TRY
    EXEC sp_crear_reservacion
        @dominio_id               = @dominio_id,
        @servicio_id              = @servicio_id,
        @localidad_id             = @localidad_id,
        @bloque_disponibilidad_id = @bloque_a_id,
        @cliente_id               = @cliente_id,
        @nota_cliente             = N'smoke-db test reservacion',
        @reserva_id               = @reserva_1_id OUTPUT;

    IF @reserva_1_id IS NOT NULL
       AND EXISTS (SELECT 1 FROM reservaciones WHERE reserva_id = @reserva_1_id AND bloque_disponibilidad_id = @bloque_a_id)
       AND EXISTS (SELECT 1 FROM bloques_de_disponibilidad WHERE bloque_disponibilidad_id = @bloque_a_id AND activo = 0)
        SET @caso1_ok = 1;
END TRY
BEGIN CATCH
    SET @caso1_ok = 0;
END CATCH

IF @caso1_ok = 1
    PRINT ' [smoke-db] caso 1 (crear reservacion sobre bloque libre) ... OK';
ELSE
    PRINT ' [smoke-db] caso 1 (crear reservacion sobre bloque libre) ... FAIL';

-- ------------------------------------------------------------
-- Caso 2: segunda reservacion sobre el mismo bloque -> debe rechazarse.
-- ------------------------------------------------------------
DECLARE @caso2_ok BIT = 0;
DECLARE @caso2_error_number INT = NULL;
DECLARE @reserva_2_intento_id INT;

BEGIN TRY
    EXEC sp_crear_reservacion
        @dominio_id               = @dominio_id,
        @servicio_id              = @servicio_id,
        @localidad_id             = @localidad_id,
        @bloque_disponibilidad_id = @bloque_a_id,
        @cliente_id               = @cliente_id,
        @nota_cliente             = N'smoke-db test reservacion',
        @reserva_id               = @reserva_2_intento_id OUTPUT;
END TRY
BEGIN CATCH
    SET @caso2_error_number = ERROR_NUMBER();
    IF @caso2_error_number BETWEEN 50040 AND 50059
        SET @caso2_ok = 1;
END CATCH

IF @caso2_ok = 1
    PRINT ' [smoke-db] caso 2 (doble reserva sobre mismo bloque rechazada, ERROR_NUMBER=' + CAST(@caso2_error_number AS NVARCHAR(20)) + ') ... OK';
ELSE
    PRINT ' [smoke-db] caso 2 (doble reserva sobre mismo bloque rechazada) ... FAIL';

-- ------------------------------------------------------------
-- Caso 3: cancelar la reservacion del caso 1.
-- ------------------------------------------------------------
DECLARE @caso3_ok BIT = 0;

BEGIN TRY
    EXEC sp_cancelar_reservacion
        @reserva_id = @reserva_1_id,
        @dominio_id = @dominio_id;

    IF EXISTS (
        SELECT 1 FROM reservaciones r
        JOIN estados_reservaciones er ON er.estado_reservacion_id = r.estado_reservacion_id
        WHERE r.reserva_id = @reserva_1_id AND er.nombre = N'cancelada'
    )
        SET @caso3_ok = 1;
END TRY
BEGIN CATCH
    SET @caso3_ok = 0;
END CATCH

IF @caso3_ok = 1
    PRINT ' [smoke-db] caso 3 (cancelar reservacion) ... OK';
ELSE
    PRINT ' [smoke-db] caso 3 (cancelar reservacion) ... FAIL';

-- WP4: verificar bloque liberado por trigger (pendiente; no existe
-- trigger todavia, por lo que bloques_de_disponibilidad.activo seguira
-- en 0 para @bloque_a_id hasta que WP4 implemente la liberacion).
-- SELECT activo FROM bloques_de_disponibilidad WHERE bloque_disponibilidad_id = @bloque_a_id;

-- ------------------------------------------------------------
-- Caso 4 y 5: confirmar y completar una reserva nueva (bloque B).
-- ------------------------------------------------------------
DECLARE @reserva_2_id INT;
DECLARE @caso4_ok BIT = 0;
DECLARE @caso5_ok BIT = 0;

BEGIN TRY
    EXEC sp_crear_reservacion
        @dominio_id               = @dominio_id,
        @servicio_id              = @servicio_id,
        @localidad_id             = @localidad_id,
        @bloque_disponibilidad_id = @bloque_b_id,
        @cliente_id               = @cliente_id,
        @nota_cliente             = N'smoke-db test reservacion',
        @reserva_id               = @reserva_2_id OUTPUT;

    EXEC sp_confirmar_reservacion
        @reserva_id = @reserva_2_id,
        @dominio_id = @dominio_id;

    IF EXISTS (
        SELECT 1 FROM reservaciones r
        JOIN estados_reservaciones er ON er.estado_reservacion_id = r.estado_reservacion_id
        WHERE r.reserva_id = @reserva_2_id AND er.nombre = N'confirmada'
    )
        SET @caso4_ok = 1;
END TRY
BEGIN CATCH
    SET @caso4_ok = 0;
END CATCH

IF @caso4_ok = 1
    PRINT ' [smoke-db] caso 4 (confirmar reservacion) ... OK';
ELSE
    PRINT ' [smoke-db] caso 4 (confirmar reservacion) ... FAIL';

BEGIN TRY
    EXEC sp_completar_reservacion
        @reserva_id = @reserva_2_id,
        @dominio_id = @dominio_id;

    IF EXISTS (
        SELECT 1 FROM reservaciones r
        JOIN estados_reservaciones er ON er.estado_reservacion_id = r.estado_reservacion_id
        WHERE r.reserva_id = @reserva_2_id AND er.nombre = N'completada'
    )
        SET @caso5_ok = 1;
END TRY
BEGIN CATCH
    SET @caso5_ok = 0;
END CATCH

IF @caso5_ok = 1
    PRINT ' [smoke-db] caso 5 (completar reservacion) ... OK';
ELSE
    PRINT ' [smoke-db] caso 5 (completar reservacion) ... FAIL';

-- ------------------------------------------------------------
-- Caso 6: sp_crear_cliente reutiliza por correo duplicado.
-- ------------------------------------------------------------
DECLARE @cliente_prueba_id_1 INT;
DECLARE @cliente_prueba_id_2 INT;
DECLARE @caso6_ok BIT = 0;

BEGIN TRY
    EXEC sp_crear_cliente
        @dominio_id  = @dominio_id,
        @nombre      = N'Prueba',
        @apellido_1  = N'Humo',
        @correo      = @correo_prueba,
        @telefono    = N'00000000',
        @cliente_id  = @cliente_prueba_id_1 OUTPUT;

    EXEC sp_crear_cliente
        @dominio_id  = @dominio_id,
        @nombre      = N'Prueba',
        @apellido_1  = N'Humo',
        @correo      = @correo_prueba,
        @telefono    = N'00000000',
        @cliente_id  = @cliente_prueba_id_2 OUTPUT;

    IF @cliente_prueba_id_1 IS NOT NULL AND @cliente_prueba_id_1 = @cliente_prueba_id_2
        SET @caso6_ok = 1;
END TRY
BEGIN CATCH
    SET @caso6_ok = 0;
END CATCH

IF @caso6_ok = 1
    PRINT ' [smoke-db] caso 6 (sp_crear_cliente reutiliza por correo duplicado) ... OK';
ELSE
    PRINT ' [smoke-db] caso 6 (sp_crear_cliente reutiliza por correo duplicado) ... FAIL';

-- ------------------------------------------------------------
-- Limpieza: revertir todos los efectos de esta corrida para dejar la
-- base de datos reutilizable.
-- ------------------------------------------------------------
DELETE FROM reservaciones WHERE reserva_id IN (@reserva_1_id, @reserva_2_id);
DELETE FROM bloques_de_disponibilidad WHERE bloque_disponibilidad_id IN (@bloque_a_id, @bloque_b_id);
DELETE FROM clientes WHERE cliente_id = @cliente_prueba_id_1;

PRINT ' [smoke-db] limpieza ... OK (reservaciones, bloques y cliente de prueba eliminados)';
PRINT ' [smoke-db] fin de prueba de humo';
GO
