-- ============================================================
-- 02-create-tables.sql
-- Proyecto: MBM - Multi-Tenant Booking Manager
-- Contenido: crea las 15 tablas y relaciones (identificadores en espanol, ASCII)
-- Ver docs/rename-map.csv para la equivalencia con los nombres en ingles.
-- ============================================================

USE mbm_booking;
GO

-- Catalogos ---------------------------------------------------------------

CREATE TABLE tipos_negocios (
    tipo_negocio_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(100) NOT NULL UNIQUE,
    descripcion     NVARCHAR(500) NULL,
    activo          BIT NOT NULL DEFAULT 1
);
PRINT '[02-create-tables] tabla tipos_negocios ... OK';
GO

CREATE TABLE estados_dominios (
    dominio_estado_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre            NVARCHAR(50) NOT NULL UNIQUE,
    descripcion       NVARCHAR(200) NULL
);
PRINT '[02-create-tables] tabla estados_dominios ... OK';
GO

CREATE TABLE estados_reservaciones (
    estado_reservacion_id INT IDENTITY(1,1) PRIMARY KEY,
    nombre                NVARCHAR(50) NOT NULL UNIQUE,
    descripcion           NVARCHAR(200) NULL
);
PRINT '[02-create-tables] tabla estados_reservaciones ... OK';
GO

-- Superadmins -------------------------------------------------------------

CREATE TABLE superadmins (
    superadmin_id          INT IDENTITY(1,1) PRIMARY KEY,
    nombre                 NVARCHAR(100) NOT NULL,
    apellido_1             NVARCHAR(100) NOT NULL,
    apellido_2             NVARCHAR(100) NULL,
    correo                 NVARCHAR(254) NOT NULL UNIQUE,
    contrasena_encriptada  NVARCHAR(512) NOT NULL,
    activo                 BIT NOT NULL DEFAULT 1,
    creado_en              DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla superadmins ... OK';
GO

-- Dominios y duenos --------------------------------------------------------

CREATE TABLE dominios (
    dominio_id        INT IDENTITY(1,1) PRIMARY KEY,
    tipo_negocio_id   INT NOT NULL REFERENCES tipos_negocios(tipo_negocio_id),
    dominio_estado_id INT NOT NULL REFERENCES estados_dominios(dominio_estado_id),
    nombre            NVARCHAR(200) NOT NULL,
    slug              NVARCHAR(100) NOT NULL UNIQUE,
    correo            NVARCHAR(254) NOT NULL,
    telefono          NVARCHAR(30) NULL,
    descripcion       NVARCHAR(MAX) NULL,
    logo_url          NVARCHAR(500) NULL,
    mensaje_publico   NVARCHAR(500) NULL,
    activo            BIT NOT NULL DEFAULT 1,
    creado_en         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla dominios ... OK';
GO

CREATE TABLE duenos_de_dominios (
    dueno_id               INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id             INT NOT NULL REFERENCES dominios(dominio_id),
    nombre                 NVARCHAR(100) NOT NULL,
    apellido_1             NVARCHAR(100) NOT NULL,
    apellido_2             NVARCHAR(100) NULL,
    correo                 NVARCHAR(254) NOT NULL,
    contrasena_encriptada  NVARCHAR(512) NOT NULL,
    telefono               NVARCHAR(30) NULL,
    activo                 BIT NOT NULL DEFAULT 1,
    creado_en              DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en         DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla duenos_de_dominios ... OK';
GO

-- Clientes ---------------------------------------------------------------

CREATE TABLE clientes (
    cliente_id  INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id  INT NOT NULL REFERENCES dominios(dominio_id),
    nombre      NVARCHAR(100) NOT NULL,
    apellido_1  NVARCHAR(100) NOT NULL,
    apellido_2  NVARCHAR(100) NULL,
    correo      NVARCHAR(254) NOT NULL,
    telefono    NVARCHAR(30) NOT NULL,
    notas       NVARCHAR(500) NULL,
    creado_en   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla clientes ... OK';
GO

-- Servicios ---------------------------------------------------------------

CREATE TABLE categorias_servicios (
    categoria_id   INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id     INT NOT NULL REFERENCES dominios(dominio_id),
    nombre         NVARCHAR(150) NOT NULL,
    descripcion    NVARCHAR(500) NULL,
    activo         BIT NOT NULL DEFAULT 1,
    creado_en      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla categorias_servicios ... OK';
GO

CREATE TABLE servicios (
    servicio_id      INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id       INT NOT NULL REFERENCES dominios(dominio_id),
    categoria_id     INT NOT NULL REFERENCES categorias_servicios(categoria_id),
    nombre           NVARCHAR(200) NOT NULL,
    descripcion      NVARCHAR(MAX) NULL,
    duracion_minutos INT NOT NULL,
    precio           DECIMAL(10,2) NULL,
    mostrar_precio   BIT NOT NULL DEFAULT 0,
    activo           BIT NOT NULL DEFAULT 1,
    creado_en        DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla servicios ... OK';
GO

-- Localidades y horarios --------------------------------------------------

CREATE TABLE localidades (
    localidad_id INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id   INT NOT NULL REFERENCES dominios(dominio_id),
    nombre       NVARCHAR(200) NOT NULL,
    direccion    NVARCHAR(500) NOT NULL,
    telefono     NVARCHAR(30) NULL,
    principal    BIT NOT NULL DEFAULT 0,
    activo       BIT NOT NULL DEFAULT 1,
    creado_en    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla localidades ... OK';
GO

CREATE TABLE horarios (
    horario_id     INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id     INT NOT NULL REFERENCES dominios(dominio_id),
    localidad_id   INT NOT NULL REFERENCES localidades(localidad_id),
    dia_semana     TINYINT NOT NULL,
    hora_apertura  TIME NULL,
    hora_cerrado   TIME NULL,
    cerrado        BIT NOT NULL DEFAULT 0,
    actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla horarios ... OK';
GO

CREATE TABLE bloques_de_disponibilidad (
    bloque_disponibilidad_id INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id               INT NOT NULL REFERENCES dominios(dominio_id),
    localidad_id             INT NOT NULL REFERENCES localidades(localidad_id),
    fecha_de_bloque          DATE NOT NULL,
    fecha_inicio             DATETIME2 NOT NULL,
    fecha_final              DATETIME2 NOT NULL,
    activo                   BIT NOT NULL DEFAULT 1,
    creado_en                DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla bloques_de_disponibilidad ... OK';
GO

-- Reservaciones ------------------------------------------------------------

CREATE TABLE reservaciones (
    reserva_id               INT IDENTITY(1,1) PRIMARY KEY,
    dominio_id               INT NOT NULL REFERENCES dominios(dominio_id),
    cliente_id               INT NOT NULL REFERENCES clientes(cliente_id),
    servicio_id              INT NOT NULL REFERENCES servicios(servicio_id),
    localidad_id             INT NOT NULL REFERENCES localidades(localidad_id),
    bloque_disponibilidad_id INT NULL UNIQUE REFERENCES bloques_de_disponibilidad(bloque_disponibilidad_id) ON DELETE SET NULL,
    estado_reservacion_id    INT NOT NULL REFERENCES estados_reservaciones(estado_reservacion_id),
    fecha_inicio             DATETIME2 NOT NULL,
    fecha_final              DATETIME2 NOT NULL,
    nota_cliente             NVARCHAR(500) NULL,
    nota_interna             NVARCHAR(500) NULL,
    creado_en                DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    actualizado_en           DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla reservaciones ... OK';
GO

CREATE TABLE codigos_de_rastreos (
    codigo_de_rastreo_id INT IDENTITY(1,1) PRIMARY KEY,
    reserva_id           INT NOT NULL UNIQUE REFERENCES reservaciones(reserva_id),
    codigo_rastreo       NVARCHAR(50) NOT NULL UNIQUE,
    expira_en            DATETIME2 NOT NULL,
    activo               BIT NOT NULL DEFAULT 1,
    creado_en            DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla codigos_de_rastreos ... OK';
GO

-- Auditoria ---------------------------------------------------------------

CREATE TABLE registros (
    registro_id     BIGINT IDENTITY(1,1) PRIMARY KEY,
    dominio_id      INT NULL REFERENCES dominios(dominio_id),
    dueno_id        INT NULL REFERENCES duenos_de_dominios(dueno_id),
    superadmin_id   INT NULL REFERENCES superadmins(superadmin_id),
    accion          NVARCHAR(100) NOT NULL,
    nombre_entidad  NVARCHAR(100) NOT NULL,
    entidad_id      INT NOT NULL,
    valor_anterior  NVARCHAR(MAX) NULL,
    nuevo_valor     NVARCHAR(MAX) NULL,
    creado_en       DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
PRINT '[02-create-tables] tabla registros ... OK';
GO

PRINT '[02-create-tables] 15/15 tablas creadas';
GO
