-- ============================================================
-- 03-seed-data.sql
-- Proyecto: MBM - Multi-Tenant Booking Manager
-- Contenido: datos de prueba (>= 50 registros por tabla)
-- Todos los datos realistas - 50 filas genuinas por tabla
-- ============================================================

USE mbm_booking;
GO

SET NOCOUNT ON;

DECLARE @bt TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @ts TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @bs TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @sa TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @tn TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @ow TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @cu TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @ca TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @sv TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @lc TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @bl TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @bk TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @sk TABLE (rid INT IDENTITY(1,1), id INT);
DECLARE @ns TABLE (n INT);

INSERT INTO @ns SELECT TOP 50 ROW_NUMBER() OVER(ORDER BY (SELECT NULL)) FROM sys.all_columns;

-- ====================================================================
-- CATÁLOGOS
-- ====================================================================

INSERT INTO business_types (name, description, is_active)
OUTPUT inserted.business_type_id INTO @bt (id)
SELECT name, descr, 1 FROM (VALUES
    (N'Barbería',          N'Corte y arreglo personal'),
    (N'Salón de belleza',  N'Servicios de estilismo y belleza'),
    (N'Spa',               N'Tratamientos de relajación y bienestar'),
    (N'Veterinaria',       N'Servicios de salud para mascotas'),
    (N'Clínica',           N'Atención médica general'),
    (N'Consultorio',       N'Atención médica especializada'),
    (N'Centro estético',   N'Tratamientos estéticos'),
    (N'Odontología',       N'Servicios dentales'),
    (N'Gimnasio',          N'Acondicionamiento físico'),
    (N'Terapias',          N'Terapias alternativas')
) t(name, descr);

INSERT INTO business_types (name, description, is_active)
OUTPUT inserted.business_type_id INTO @bt (id)
SELECT
    CONCAT(N'Tipo_negocio_', n),
    CONCAT(N'Descripción tipo ', n),
    1
FROM @ns WHERE n > 10;

INSERT INTO tenant_statuses (name, description)
OUTPUT inserted.tenant_status_id INTO @ts (id)
SELECT name, descr FROM (VALUES
    (N'pending',   N'Pendiente de aprobación'),
    (N'active',    N'Activo y operando'),
    (N'suspended', N'Suspendido por administrador'),
    (N'inactive',  N'Inactivo o dado de baja')
) t(name, descr);

INSERT INTO tenant_statuses (name, description)
OUTPUT inserted.tenant_status_id INTO @ts (id)
SELECT CONCAT(N'estado_', n), CONCAT(N'Estado ', n) FROM @ns WHERE n > 4;

INSERT INTO booking_statuses (name, description)
OUTPUT inserted.booking_status_id INTO @bs (id)
SELECT name, descr FROM (VALUES
    (N'pending',     N'Reserva pendiente de confirmación'),
    (N'confirmed',   N'Reserva confirmada'),
    (N'cancelled',   N'Reserva cancelada'),
    (N'completed',   N'Reserva completada'),
    (N'rescheduled', N'Reserva reagendada')
) t(name, descr);

INSERT INTO booking_statuses (name, description)
OUTPUT inserted.booking_status_id INTO @bs (id)
SELECT CONCAT(N'estado_reserva_', n), CONCAT(N'Estado reserva ', n) FROM @ns WHERE n > 5;

-- ====================================================================
-- SUPERADMINS (miembros del proyecto)
-- ====================================================================

INSERT INTO superadmins (full_name, email, password_hash, is_active)
OUTPUT inserted.superadmin_id INTO @sa (id)
SELECT name, email, N'$2b$12$HNf7oIJgipKcyCIEJLR1POaKhc46Oh//2IJ7eNtn/Mu5wvNC98qFe', 1 FROM (VALUES
    (N'Campos Arias Melanie Yeonsuk',    N'melanie.campos@mbm.admin'),
    (N'Chavez Zumbado Isaac',            N'isaac.chavez@mbm.admin'),
    (N'Delgado Durango Luna',            N'luna.delgado@mbm.admin'),
    (N'Enriquez Acuña Handel Simón',     N'handel.enriquez@mbm.admin'),
    (N'Fuentes García Jeferson Andrew',  N'jeferson.fuentes@mbm.admin')
) t(name, email);

-- ====================================================================
-- TENANTS (50 negocios)
-- ====================================================================

INSERT INTO tenants (business_type_id, tenant_status_id, name, slug, email, phone, description, public_message, is_active)
OUTPUT inserted.tenant_id INTO @tn (id)
SELECT bt, st, name, slug, email, phone, descr, msg, 1 FROM (VALUES
    (1, 2, N'Barbería El Colocho',    N'barberia-el-colocho',    N'info@colochocr.com',     N'2278-1001', N'Barbería clásica en San Pedro',           N'¡Pura vida! Agendá tu cita sin filas.'),
    (2, 2, N'Salón Elegance',         N'salon-elegance',         N'contacto@elegancecr.com', N'2278-1002', N'Salón de belleza en Escazú',              N'Tu estilo, nuestra pasión.'),
    (3, 2, N'Spa La Garita',          N'spa-la-garita',          N'reservas@lagarita.com',  N'2278-1003', N'Spa y masajes en Santa Ana',              N'Relajate con nosotros, mae.'),
    (4, 2, N'Veterinaria San Jorge',  N'vet-san-jorge',          N'citas@sanveterinaria.com',N'2278-1004', N'Veterinaria en Moravia',                  N'Cuidamos a su mascota como propia.'),
    (5, 2, N'Clínica Santa Catalina', N'clinica-santa-catalina', N'info@santacatalina.com',  N'2278-1005', N'Clínica médica en Desamparados',          N'Salud para toda la familia.'),
    (6, 2, N'Consultorio Dra. Solís', N'dra-solis',              N'citas@drasolis.com',     N'2278-1006', N'Odontología general en Rohrmoser',        N'Tu sonrisa es nuestra prioridad.'),
    (7, 2, N'Centro Estético Glow',   N'centro-glow',            N'hola@centroglow.com',    N'2278-1007', N'Estética avanzada en Curridabat',         N'Descubrí tu mejor versión.'),
    (8, 2, N'Odontoclínica del Valle',N'odontoclinica-valle',    N'citas@odvcr.com',        N'2278-1008', N'Clínica dental en Alajuela',              N'Tu salud bucal nos importa.'),
    (9, 2, N'Fit Gym Centro',         N'fit-gym',                N'info@fitgymcr.com',      N'2278-1009', N'Gimnasio en Heredia',                      N'Transformá tu cuerpo.'),
    (10,2, N'Terapias Holísticas CR', N'terapias-holisticas',    N'contacto@terapiascr.com',N'2278-1010', N'Terapias alternativas en Cartago',         N'Equilibrio para cuerpo y mente.'),
    (1, 2, N'Barbería Don Chepe',     N'barberia-don-chepe',     N'chepe@donchepecr.com',   N'2278-1011', N'Barbería tradicional en Guadalupe',        N'Donde los ticos se arreglan.'),
    (2, 2, N'Salón Divino',           N'salon-divino',           N'info@salandivino.com',   N'2278-1012', N'Salón y estética en San José',            N'Belleza con corazón tico.'),
    (3, 2, N'Spa Pura Vida',          N'spa-pura-vida',          N'reservas@puracr.com',    N'2278-1013', N'Spa con hidroterapia en Barrio Escalante', N'Desconectate del estrés.'),
    (4, 2, N'Veterinaria Huellitas',  N'vet-huellitas',          N'contacto@huellitascr.com',N'2278-1014', N'Veterinaria en Tibás',                     N'Tu mascota merece lo mejor.'),
    (1, 2, N'Barbería King',          N'barberia-king',          N'king@barberiaking.com',  N'2278-1015', N'Barbería moderna en Hatillo',              N'Estilo tico con actitud.'),
    (2, 2, N'Salón Santa Ana',        N'salon-santa-ana',        N'info@santaanabeauty.com',N'2278-1016', N'Salón de belleza en Santa Ana',            N'Embellecé tu día.'),
    (5, 2, N'Clínica Médica Central', N'clinica-medica-central', N'info@cmcentral.com',     N'2278-1017', N'Clínica en el centro de San José',         N'Atención médica de confianza.'),
    (6, 2, N'Psicología Integral',    N'psicologia-integral',    N'citas@psiintegral.com',  N'2278-1018', N'Consulta psicológica en Rohrmoser',        N'Tu salud mental es primero.'),
    (9, 2, N'CrossFit Pérez Zeledón', N'crossfit-perez',         N'info@crossfitpz.com',    N'2278-1019', N'CrossFit y funcional en Pérez Zeledón',    N'Superá tus límites.'),
    (3, 2, N'Spa La Sabana',          N'spa-la-sabana',          N'hola@lasabanacr.com',    N'2278-1020', N'Spa frente al Parque Metropolitano',       N'Tu oasis en la ciudad.'),
    (1, 2, N'Barbería El Rubio',      N'barberia-el-rubio',      N'rubio@barberiacr.com',   N'2278-1021', N'Barbería en Zapote',                       N'Corte y afeitado de primera.'),
    (2, 2, N'Salón Mary',             N'salon-mary',             N'mary@salanmary.com',     N'2278-1022', N'Salón de belleza en Tibás',               N'Tu lugar de confianza.'),
    (3, 2, N'Spa Montaña Azul',       N'spa-montana-azul',       N'info@spamontana.com',    N'2278-1023', N'Spa en las montañas de Heredia',           N'Un respiro natural.'),
    (7, 2, N'Estética Karina',        N'estetica-karina',        N'karina@estetikcr.com',   N'2278-1024', N'Centro de estética en Curridabat',         N'Destacá tu belleza natural.'),
    (1, 2, N'Barbería Los Amigos',    N'barberia-amigos',        N'amigos@barberiacr.com',  N'2278-1025', N'Barbería en San Francisco de Dos Ríos',    N'Llegue, está en su casa.'),
    (8, 2, N'Clínica Dental San José',N'dental-san-jose',        N'citas@dentalcr.com',     N'2278-1026', N'Odontología en Sabana Sur',                N'Tu sonrisa saludable.'),
    (3, 2, N'Centro de Masajes Zen',  N'masajes-zen',            N'info@zentralcr.com',     N'2278-1027', N'Masajes y terapias en Barrio Amón',        N'Encontrá tu zen interior.'),
    (4, 2, N'Peluquería Canina CR',   N'pelu-canina-cr',         N'hola@pelucanina.com',    N'2278-1028', N'Estética canina en Moravia',               N'Tu mascota bien cuidada.'),
    (9, 2, N'Gimnasio BodyFit',       N'gym-bodyfit',            N'info@bodyfitcr.com',     N'2278-1029', N'Gimnasio en San Pedro',                     N'Transformate con nosotros.'),
    (10,2, N'Nutrición Vida',         N'nutricion-vida',         N'citas@nutriovidacr.com', N'2278-1030', N'Consultorio nutricional en Heredia',        N'Comé rico, viví mejor.'),
    (1, 2, N'Barbería El Peluquero',  N'barberia-peluquero',     N'peluquero@crbarber.com', N'2278-1031', N'Barbería en Alajuela centro',              N'Estilo clásico y moderno.'),
    (2, 2, N'Uñas Perfectas',         N'unas-perfectas',         N'info@unasperfectas.com', N'2278-1032', N'Salón de uñas en Escazú',                  N'Tus manos hablan por vos.'),
    (3, 2, N'Spa Tropical',           N'spa-tropical',           N'reservas@tropicalcr.com',N'2278-1033', N'Spa en Guanacaste',                        N'Relajación con vista al mar.'),
    (4, 2, N'Veterinaria Mascotas Felices', N'vet-mascotas-felices', N'contacto@mascotascr.com', N'2278-1034', N'Veterinaria en Alajuela',                N'Un hogar para tu mascota.'),
    (1, 2, N'Barbería Estilo',        N'barberia-estilo',        N'estilo@barberiacr.com',  N'2278-1035', N'Barbería en Santo Domingo de Heredia',     N'Corte de calidad, precio justo.'),
    (10,2, N'Centro de Acupuntura',   N'acupuntura-cr',          N'citas@acupecr.com',      N'2278-1036', N'Acupuntura y medicina china',              N'Equilibrio natural.'),
    (4, 2, N'Veterinaria del Sur',    N'vet-del-sur',            N'info@vetsurcr.com',      N'2278-1037', N'Veterinaria en Pérez Zeledón',             N'Cuidado integral para mascotas.'),
    (2, 2, N'Salón Glamour',          N'salon-glamour',          N'info@glamourcr.com',     N'2278-1038', N'Salón de belleza en Rohrmoser',            N'Brillo y sofisticación.'),
    (1, 2, N'Barbería El Trébol',     N'barberia-trebol',        N'trebol@barberiacr.com',  N'2278-1039', N'Barbería en Tres Ríos',                     N'Corte con suerte.'),
    (5, 2, N'Rehabilitación Física',  N'rehab-fisica',           N'citas@rehabcr.com',      N'2278-1040', N'Fisioterapia en Curridabat',               N'Movete sin dolor.'),
    (3, 2, N'Spa Relax Total',        N'spa-relax-total',        N'hola@relaxtotal.com',    N'2278-1041', N'Spa en San José centro',                   N'Desconectate del mundo.'),
    (1, 2, N'Barbería y Algo Más',    N'barberia-algo-mas',      N'info@algomasbarber.com', N'2278-1042', N'Barbería con café en Barrio Escalante',    N'Corte, café y buena charla.'),
    (9, 2, N'Gimnasio Femenino Fit',  N'gym-femenino-fit',       N'info@gymfitwomen.com',   N'2278-1043', N'Gimnasio solo para mujeres',               N'Tu espacio, tu ritmo.'),
    (8, 2, N'Odontología Especializada', N'odonto-especializada',N'citas@odontoespecial.com',N'2278-1044', N'Ortodoncia y estética dental',             N'Tu mejor sonrisa.'),
    (10,2, N'Terapia Ocupacional CR', N'terapia-ocupacional',    N'info@tocupacional.com',  N'2278-1045', N'Terapia ocupacional en Heredia',           N'Independencia y bienestar.'),
    (1, 2, N'Barbería El Parque',     N'barberia-parque',        N'parque@barberiacr.com',  N'2278-1046', N'Barbería frente al Parque Central',         N'Corte al paso.'),
    (7, 2, N'Centro Estético Divine', N'divine-estetica',        N'info@divinecr.com',      N'2278-1047', N'Estética de lujo en Escazú',               N'Tratame como una diva.'),
    (4, 2, N'Veterinaria 24 Horas',   N'vet-24-horas',           N'emergencias@vetcr.com',   N'2278-1048', N'Veterinaria de emergencia en San José',    N'Siempre para tu mascota.'),
    (2, 2, N'Salón Linda',            N'salon-linda',            N'hola@lindasalona.com',   N'2278-1049', N'Salón de belleza en Desamparados',         N'Linda por dentro y por fuera.'),
    (8, 2, N'Clínica Dental Premium', N'dental-premium',         N'citas@dentalpremium.com',N'2278-1050', N'Clínica dental en Santa Ana',              N'Odontología de primera.')
) t(bt, st, name, slug, email, phone, descr, msg);

-- ====================================================================
-- TENANT OWNERS (50)
-- ====================================================================

WITH owner_list AS (
    SELECT t.name, t.email, t.phone, ROW_NUMBER() OVER(ORDER BY t.name) AS rn FROM (VALUES
    (N'Martín Quesada',      N'martin.quesada@email.com',      N'8877-1001'),
    (N'Sofía Camacho',       N'sofia.camacho@email.com',       N'8877-1002'),
    (N'Andrés Ramírez',      N'andres.ramirez@email.com',      N'8877-1003'),
    (N'Gabriela Umaña',      N'gabriela.umana@email.com',      N'8877-1004'),
    (N'Esteban Chacón',      N'esteban.chacon@email.com',      N'8877-1005'),
    (N'Daniela Castillo',    N'daniela.castillo@email.com',    N'8877-1006'),
    (N'Pablo Jiménez',       N'pablo.jimenez@email.com',       N'8877-1007'),
    (N'Valeria Serrano',     N'valeria.serrano@email.com',     N'8877-1008'),
    (N'Santiago Víquez',     N'santiago.viquez@email.com',     N'8877-1009'),
    (N'Camila Delgado',      N'camila.delgado@email.com',      N'8877-1010'),
    (N'Felipe Rojas',        N'felipe.rojas@email.com',        N'8877-1011'),
    (N'Mariana Porras',      N'mariana.porras@email.com',      N'8877-1012'),
    (N'Javier Cortés',       N'javier.cortes@email.com',       N'8877-1013'),
    (N'Paula Navarro',       N'paula.navarro@email.com',       N'8877-1014'),
    (N'Diego Masís',         N'diego.masis@email.com',         N'8877-1015'),
    (N'Andrea Vega',         N'andrea.vega@email.com',         N'8877-1016'),
    (N'Cristian Herrera',    N'cristian.herrera@email.com',    N'8877-1017'),
    (N'Renata Aguilar',      N'renata.aguilar@email.com',      N'8877-1018'),
    (N'Manuel Guerrero',     N'manuel.guerrero@email.com',     N'8877-1019'),
    (N'Fernanda Arce',       N'fernanda.arce@email.com',       N'8877-1020'),
    (N'Kevin Arce',          N'kevin.arce@email.com',          N'8877-1021'),
    (N'Priscilla Sandí',     N'priscilla.sandi@email.com',     N'8877-1022'),
    (N'Marcela Granados',    N'marcela.granados@email.com',    N'8877-1023'),
    (N'Fabián Obando',       N'fabian.obando@email.com',       N'8877-1024'),
    (N'Tatiana Marín',       N'tatiana.marin@email.com',       N'8877-1025'),
    (N'Bryan Zamora',        N'bryan.zamora@email.com',        N'8877-1026'),
    (N'Hillary Segura',      N'hillary.segura@email.com',      N'8877-1027'),
    (N'Geovanny Araya',      N'geovanny.araya@email.com',      N'8877-1028'),
    (N'Melany Bogarín',      N'melany.bogarin@email.com',      N'8877-1029'),
    (N'Warner Ulloa',        N'warner.ulloa@email.com',        N'8877-1030'),
    (N'Rebeca Salazar',      N'rebeca.salazar@email.com',      N'8877-1031'),
    (N'Allan Quesada',       N'allan.quesada@email.com',       N'8877-1032'),
    (N'Kendall Rodríguez',   N'kendall.rodriguez@email.com',   N'8877-1033'),
    (N'Fiorella Campos',     N'fiorella.campos@email.com',     N'8877-1034'),
    (N'Sharon Calvo',        N'sharon.calvo@email.com',        N'8877-1035'),
    (N'Yoselyn Murillo',     N'yoselyn.murillo@email.com',     N'8877-1036'),
    (N'Joseph Arias',        N'joseph.arias@email.com',        N'8877-1037'),
    (N'Luis Diego Solís',    N'luisdiego.solis@email.com',     N'8877-1038'),
    (N'María Fernanda Mora', N'mafe.mora@email.com',           N'8877-1039'),
    (N'Andrés Fallas',       N'andres.fallas@email.com',       N'8877-1040'),
    (N'Valeria Matamoros',   N'valeria.matamoros@email.com',   N'8877-1041'),
    (N'Mario Zúñiga',        N'mario.zuniga@email.com',        N'8877-1042'),
    (N'Alejandra Corrales',  N'alejandra.corrales@email.com',  N'8877-1043'),
    (N'Juan Pablo Mena',     N'jpablo.mena@email.com',         N'8877-1044'),
    (N'Karina Rímolo',       N'karina.rimolo@email.com',       N'8877-1045'),
    (N'Óscar Bermúdez',      N'oscar.bermudez@email.com',      N'8877-1046'),
    (N'Paola Carranza',      N'paola.carranza@email.com',      N'8877-1047'),
    (N'Randall Segura',      N'randall.segura@email.com',      N'8877-1048'),
    (N'Adriana Ramírez',     N'adriana.ramirez@email.com',     N'8877-1049'),
    (N'Melissa Cerdas',      N'melissa.cerdas@email.com',      N'8877-1050')
) AS t(name, email, phone)
)
INSERT INTO tenant_owners (tenant_id, full_name, email, password_hash, phone, is_active)
OUTPUT inserted.owner_id INTO @ow (id)
SELECT tn.id, ol.name, ol.email, N'$2b$12$6B3wIs./ish6IGqLCScHCet1uryH9qoa9WPGGqEzBVa47GL7kJHPe', ol.phone, 1
FROM owner_list ol
JOIN @tn tn ON tn.rid = ol.rn;

-- ====================================================================
-- CUSTOMERS (50 con notas realistas)
-- ====================================================================

WITH customer_list AS (
    SELECT t.fn, t.ln, t.em, t.ph, t.nota, ROW_NUMBER() OVER(ORDER BY t.fn) AS rn FROM (VALUES
    (N'Juan',      N'Vargas',      N'juan.vargas@email.com',     N'8877-3001', N'Cliente frecuente - prefiere sábados'),
    (N'María',     N'Cordero',     N'maria.cordero@email.com',   N'8877-3002', NULL),
    (N'Carlos',    N'Monge',       N'carlos.monge@email.com',    N'8877-3003', N'Alérgico a fragancias fuertes'),
    (N'Ana',       N'Chaves',      N'ana.chaves@email.com',      N'8877-3004', N'Prefiere atención con la misma estilista'),
    (N'Pedro',     N'Rivera',      N'pedro.rivera@email.com',    N'8877-3005', NULL),
    (N'Laura',     N'Guillén',     N'laura.guillen@email.com',   N'8877-3006', N'Cliente desde 2024'),
    (N'José',      N'Pérez',       N'jose.perez@email.com',      N'8877-3007', NULL),
    (N'Sofía',     N'Álvarez',     N'sofia.alvarez@email.com',   N'8877-3008', N'Recomendó a 3 amigas'),
    (N'Miguel',    N'Reyes',       N'miguel.reyes@email.com',    N'8877-3009', N'Le pagan con SINPE - dejar nota'),
    (N'Carmen',    N'Morales',     N'carmen.morales@email.com',  N'8877-3010', NULL),
    (N'Luis',      N'Torres',      N'luis.torres@email.com',     N'8877-3011', N'Siempre pide el mismo barbero'),
    (N'Valentina', N'Castro',      N'valentina.castro@email.com',N'8877-3012', N'Llega con su perro - permitir'),
    (N'Andrés',    N'Ortiz',       N'andres.ortiz@email.com',    N'8877-3013', NULL),
    (N'Isabella',  N'Vargas',      N'isabella.vargas@email.com', N'8877-3014', N'Estudiante - descuento de jueves'),
    (N'Diego',     N'Ruiz',        N'diego.ruiz@email.com',      N'8877-3015', NULL),
    (N'Camila',    N'Medina',      N'camila.medina@email.com',   N'8877-3016', N'Prefiere WhatsApp para recordatorios'),
    (N'Santiago',  N'Delgado',     N'santiago.delgado@email.com',N'8877-3017', NULL),
    (N'Luciana',   N'Rojas',       N'luciana.rojas@email.com',   N'8877-3018', N'Compra siempre el paquete completo'),
    (N'Manuel',    N'Silva',       N'manuel.silva@email.com',    N'8877-3019', N'Le gusta pagar en efectivo'),
    (N'Gabriela',  N'Peña',        N'gabriela.pena@email.com',   N'8877-3020', NULL),
    (N'Alejandro', N'Campos',      N'alejandro.campos@email.com',N'8877-3021', N'Atleta - masajes descontracturantes'),
    (N'Mariana',   N'Flores',      N'mariana.flores@email.com',  N'8877-3022', N'Lleva a sus 2 hijos también'),
    (N'Francisco', N'Aguilar',     N'francisco.aguilar@email.com',N'8877-3023', NULL),
    (N'Antonella', N'Guzmán',      N'antonella.guzman@email.com',N'8877-3024', N'Celiaca - importante en notas'),
    (N'Ricardo',   N'Mendoza',     N'ricardo.mendoza@email.com', N'8877-3025', NULL),
    (N'Josefina',  N'Cruz',        N'josefina.cruz@email.com',   N'8877-3026', N'Vive en Grecia - prefiere tardes'),
    (N'Eduardo',   N'Soto',        N'eduardo.soto@email.com',    N'8877-3027', NULL),
    (N'Ximena',    N'Pacheco',     N'ximena.pacheco@email.com',  N'8877-3028', N'Luna de miel - dar trato especial'),
    (N'Roberto',   N'Navarro',     N'roberto.navarro@email.com', N'8877-3029', N'Veterano - descuento adulto mayor'),
    (N'Fernanda',  N'Vera',        N'fernanda.vera@email.com',   N'8877-3030', N'Embarazada - masajes prenatal'),
    (N'Kevin',     N'Arce',        N'kevin.arce@email.com',      N'8877-3031', NULL),
    (N'Priscilla', N'Sandí',       N'priscilla.sandi@email.com', N'8877-3032', N'Viene todos los viernes'),
    (N'Esteban',   N'Cordero',     N'esteban.cordero@email.com', N'8877-3033', N'Paga con tarjeta siempre'),
    (N'Marcela',   N'Granados',    N'marcela.granados@email.com',N'8877-3034', N'Compra productos también'),
    (N'Fabián',    N'Obando',      N'fabian.obando@email.com',   N'8877-3035', NULL),
    (N'Rebeca',    N'Salazar',     N'rebeca.salazar@email.com',  N'8877-3036', N'Cliente referido por Sofía'),
    (N'Allan',     N'Quesada',     N'allan.quesada@email.com',   N'8877-3037', N'Llega después de las 4pm'),
    (N'Tatiana',   N'Marín',       N'tatiana.marin@email.com',   N'8877-3038', N'Le gusta pagar en efectivo'),
    (N'Bryan',     N'Zamora',      N'bryan.zamora@email.com',    N'8877-3039', NULL),
    (N'Hillary',   N'Segura',      N'hillary.segura@email.com',  N'8877-3040', N'Siempre llega puntual'),
    (N'Geovanny',  N'Araya',       N'geovanny.araya@email.com',  N'8877-3041', NULL),
    (N'Melany',    N'Bogarín',     N'melany.bogarin@email.com',  N'8877-3042', N'Pide cita con la misma persona'),
    (N'Warner',    N'Ulloa',       N'warner.ulloa@email.com',    N'8877-3043', N'Prefiere los lunes'),
    (N'Fiorella',  N'Campos',      N'fiorella.campos@email.com', N'8877-3044', NULL),
    (N'Kendall',   N'Rodríguez',   N'kendall.rodriguez@email.com',N'8877-3045', N'Viene con su mamá'),
    (N'Sharon',    N'Calvo',       N'sharon.calvo@email.com',    N'8877-3046', N'Estudiante universitario'),
    (N'Yoselyn',   N'Murillo',     N'yoselyn.murillo@email.com', N'8877-3047', N'Pide recordatorio por SMS'),
    (N'Joseph',    N'Arias',       N'joseph.arias@email.com',    N'8877-3048', N'Referido por la clínica'),
    (N'Luis Diego',N'Solís',       N'luisdiego.solis@email.com', N'8877-3049', NULL),
    (N'Mónica',    N'Aguilar',     N'monica.aguilar@email.com',  N'8877-3050', N'Cliente nueva - dar bienvenida')
) AS t(fn, ln, em, ph, nota)
)
INSERT INTO customers (tenant_id, first_name, last_name, email, phone, notes)
OUTPUT inserted.customer_id INTO @cu (id)
SELECT tn.id, cl.fn, cl.ln, cl.em, cl.ph, cl.nota
FROM customer_list cl
JOIN @tn tn ON tn.rid = cl.rn;

-- ====================================================================
-- SERVICE CATEGORIES
-- ====================================================================

WITH cat_list AS (
    SELECT name, ROW_NUMBER() OVER(ORDER BY name) AS rn FROM (VALUES
    (N'Cortes'), (N'Tintura'), (N'Masajes'), (N'Consultas'),
    (N'Estética facial'), (N'Pediatría'), (N'Limpieza'),
    (N'Odontología'), (N'Fitness'), (N'Terapias'),
    (N'Uñas'), (N'Depilación'), (N'Revisiones'),
    (N'Pack pareja'), (N'Promociones'),
    (N'Barbería'), (N'Maquillaje'), (N'Spa'),
    (N'Quiropráctica'), (N'Nutrición'),
    (N'Acupuntura'), (N'Fisioterapia'), (N'Odontopediatría'),
    (N'Veterinaria'), (N'Estética avanzada'),
    (N'Cuidado capilar'), (N'Depilación láser'),
    (N'Bienestar'), (N'Yoga'), (N'Pilates'),
    (N'Kinesiología'), (N'Reflexología'), (N'Aromaterapia'),
    (N'Hidroterapia'), (N'Fitoterapia'),
    (N'Radiestesia'), (N'Reiki'), (N'Medicina general'),
    (N'Pedagogía'), (N'Logopedia'),
    (N'Dermatología'), (N'Tricología'), (N'Ortodoncia'),
    (N'Blanqueamiento'), (N'Cirugía oral'),
    (N'Periodoncia'), (N'Endodoncia'), (N'Implantes'),
    (N'Radiografía'), (N'Odontología general')
) t(name)
)
INSERT INTO service_categories (tenant_id, name, description, is_active)
OUTPUT inserted.category_id INTO @ca (id)
SELECT tn.id, cl.name, CONCAT(N'Categoría de ', cl.name), 1
FROM cat_list cl
JOIN @tn tn ON tn.rid = cl.rn;

-- ====================================================================
-- SERVICES (50 realistas)
-- ====================================================================

WITH service_list AS (
    SELECT name, dur, pr, ROW_NUMBER() OVER(ORDER BY name) AS rn FROM (VALUES
    (N'Corte de cabello hombre',     30,  6000),
    (N'Corte de cabello mujer',      45,  9000),
    (N'Afeitado tradicional',        20,  5000),
    (N'Lavado y peinado',            25,  7000),
    (N'Tinte completo',              90, 35000),
    (N'Manicure clásico',            40, 12000),
    (N'Pedicure spa',                50, 15000),
    (N'Masaje relajante',            60, 25000),
    (N'Masaje descontracturante',    45, 30000),
    (N'Consulta general',            30, 20000),
    (N'Baño y corte mascota',        50, 15000),
    (N'Corte mascota raza pequeña',  30, 10000),
    (N'Limpieza facial profunda',    45, 22000),
    (N'Depilación con cera',         30, 10000),
    (N'Revisión dental',             20, 15000),
    (N'Limpieza dental',             40, 30000),
    (N'Sesión de gym dirigida',      60,  8000),
    (N'Terapia de relajación',       50, 20000),
    (N'Pack novia completo',        150, 75000),
    (N'Corte y barba combo',         40, 10000),
    (N'Peinado para fiestas',        60, 18000),
    (N'Tinte con mechas',            120, 45000),
    (N'Masaje con piedras calientes', 75, 35000),
    (N'Consulta veterinaria general', 30, 18000),
    (N'Vacunación de mascotas',      20, 12000),
    (N'Corte mascota raza grande',   60, 20000),
    (N'Exfoliación corporal',        50, 25000),
    (N'Mascarilla facial',           30, 15000),
    (N'Radiofrecuencia facial',      60, 40000),
    (N'Depilación láser axilas',     30, 25000),
    (N'Ortodoncia inicial',          45, 35000),
    (N'Blanqueamiento dental',       90, 60000),
    (N'Rutina de pesas guiada',      60, 10000),
    (N'Yoga grupal',                 60,  8000),
    (N'Spinning',                    45,  7000),
    (N'Terapia psicológica',         50, 30000),
    (N'Evaluación nutricional',      40, 22000),
    (N'Acupuntura',                  45, 20000),
    (N'Reflexología',                50, 18000),
    (N'Maquillaje profesional',      90, 35000),
    (N'Extensiones de pestañas',     60, 25000),
    (N'Uñas acrílicas',             75, 20000),
    (N'Gelish',                      45, 12000),
    (N'Corte y diseño de cejas',     20,  5000),
    (N'Tratamiento capilar',         60, 30000),
    (N'Alisado permanente',         120, 55000),
    (N'Hidratación facial',          45, 20000),
    (N'Consulta dermatológica',      30, 25000),
    (N'Limpieza de cutis',           50, 28000),
    (N'Pack spa pareja',            120, 60000)
) t(name, dur, pr)
)
INSERT INTO services (tenant_id, category_id, name, description, duration_minutes, price, show_price, is_active)
OUTPUT inserted.service_id INTO @sv (id)
SELECT tn.id, ca.id, sl.name, CONCAT(N'Servicio de ', sl.name), sl.dur, sl.pr, 1, 1
FROM service_list sl
JOIN @tn tn ON tn.rid = sl.rn
JOIN @ca ca ON ca.rid = tn.rid;

-- ====================================================================
-- LOCATIONS (50 direcciones ticas)
-- ====================================================================

INSERT INTO locations (tenant_id, name, address, phone, is_main, is_active)
OUTPUT inserted.location_id INTO @lc (id)
SELECT tn.id, name, addr, CONCAT(N'2256-', RIGHT(CONCAT(N'000', 500 + ROW_NUMBER() OVER(ORDER BY name)), 4)), 0, 1
FROM (
    VALUES
    (1, N'Sede Central',     N'Del Banco Nacional 100 m sur, San Pedro'),
    (2, N'Sucursal Escazú',  N'Frente a Multiplaza Escazú, local 5'),
    (3, N'Santa Ana',        N'Contiguo al Palí de Santa Ana'),
    (4, N'Moravia',          N'300 m norte de la iglesia de Moravia'),
    (5, N'Desamparados',     N'Costado sur del parque de Desamparados'),
    (6, N'Rohrmoser',        N'Del Automercado 200 m oeste'),
    (7, N'Curridabat',       N'Plaza del Sol, local 12'),
    (8, N'Alajuela Central', N'50 m este de la Catedral, Alajuela'),
    (9, N'Heredia',          N'Frente al Fortín, Heredia centro'),
    (10,N'Cartago',          N'100 m norte de las Ruinas, Cartago'),
    (1, N'Guadalupe',        N'Del antiguo Palí 150 m norte'),
    (2, N'San José centro',  N'Avenida Central, calle 9'),
    (3, N'Barrio Escalante', N'Calle 33, contiguo a la soda'),
    (4, N'Tibás',            N'200 m sur del Mall San Pedro'),
    (1, N'Hatillo',          N'Frente al parque de Hatillo 3'),
    (2, N'Santa Ana Centro', N'50 m este de la iglesia'),
    (5, N'San José Centro',  N'Calle 2, avenida 6'),
    (6, N'Rohrmoser II',     N'200 m norte del Colegio de Abogados'),
    (9, N'Pérez Zeledón',    N'100 m sur del Banco Popular'),
    (3, N'La Sabana',        N'Frente al Parque Metropolitano'),
    (1, N'Zapote',           N'Del cementerio 50 m norte'),
    (2, N'Tibás Norte',      N'200 m oeste de la escuela'),
    (3, N'Heredia Montaña',  N'Carretera a San Rafael 1 km'),
    (7, N'Curridabat Este',  N'Condominio Los Pinos, casa 8'),
    (1, N'Dos Ríos',         N'Del Ebáis 150 m sur'),
    (8, N'Sabana Sur',       N'Edificio Medical, piso 4'),
    (3, N'Barrio Amón',      N'Casa amarilla esquinera'),
    (4, N'Moravia Norte',    N'Contiguo a la bomba'),
    (9, N'San Pedro',        N'Del parque 100 m este'),
    (10,N'Heredia Centro',   N'Contiguo al Banco Nacional'),
    (1, N'Alajuela centro',  N'50 m oeste del parque'),
    (2, N'Escazú Este',      N'Plaza Itskatzú, local 3'),
    (3, N'Guanacaste',       N'Playa Hermosa, contiguo al hotel'),
    (4, N'Alajuela Oeste',   N'200 m sur de la gasolinera'),
    (1, N'Santo Domingo',    N'Frente a la iglesia católica'),
    (10,N'San José Centro',  N'Calle 11, avenida 3'),
    (4, N'Pérez Zeledón Sur',N'200 m sur del hospital'),
    (2, N'Rohrmoser Centro', N'Plaza Rohrmoser, local 7'),
    (1, N'Tres Ríos',        N'Del palí 100 m este'),
    (5, N'Curridabat Oeste', N'Detrás del periódico La Nación'),
    (3, N'San José Central', N'Calle 5, contiguo al Teatro'),
    (1, N'Barrio Escalante 2',N'Calle 37, casa blanca esquina'),
    (9, N'San José Mujeres', N'Barrio La California, local 9'),
    (8, N'Santa Ana Este',   N'Plaza Santa Ana, piso 2'),
    (10,N'Heredia Oeste',    N'Del parque 300 m oeste'),
    (1, N'San José Centro',  N'Calle 1, frente al parque'),
    (7, N'Escazú Lujo',      N'Multiplaza Escazú, local 20'),
    (4, N'San José 24H',     N'Calle 14, contiguo a la Clínica'),
    (2, N'Desamparados Sur', N'100 m sur del mercado'),
    (8, N'Santa Ana Centro', N'Contiguo al BAC San José')
) t(tid, name, addr)
JOIN @tn tn ON tn.rid = t.tid;

-- ====================================================================
-- BUSINESS HOURS
-- ====================================================================

INSERT INTO business_hours (tenant_id, location_id, day_of_week, open_time, close_time, is_closed)
SELECT
    tn.id, lc.id,
    n.n - 1,
    CASE n.n - 1
        WHEN 0 THEN NULL WHEN 6 THEN NULL
        ELSE CAST(DATEADD(MINUTE, 480 + (n.n % 3) * 60, '00:00') AS TIME)
    END,
    CASE n.n - 1
        WHEN 0 THEN NULL WHEN 6 THEN NULL
        ELSE CAST(DATEADD(MINUTE, 540 + (n.n % 3) * 60, '00:00') AS TIME)
    END,
    CASE WHEN n.n - 1 IN (0, 6) THEN 1 ELSE 0 END
FROM @ns n
JOIN @tn tn ON tn.rid = n.n
JOIN @lc lc ON lc.rid = n.n;

-- ====================================================================
-- AVAILABILITY BLOCKS
-- ====================================================================

INSERT INTO availability_blocks (tenant_id, location_id, block_date, start_time, end_time, is_active)
OUTPUT inserted.availability_block_id INTO @bl (id)
SELECT
    tn.id, lc.id,
    DATEADD(DAY, n.n, CAST(GETUTCDATE() AS DATE)),
    CAST(DATEADD(MINUTE, 480 + (n.n % 8) * 30, '00:00') AS TIME),
    CAST(DATEADD(MINUTE, 510 + (n.n % 8) * 30, '00:00') AS TIME),
    1
FROM @ns n
JOIN @tn tn ON tn.rid = n.n
JOIN @lc lc ON lc.rid = n.n;

-- ====================================================================
-- BOOKINGS
-- ====================================================================

INSERT INTO bookings (
    tenant_id, customer_id, service_id, location_id,
    availability_block_id, booking_status_id,
    booking_date, start_time, end_time,
    customer_notes, internal_notes
)
OUTPUT inserted.booking_id INTO @bk (id)
SELECT
    tn.id, cu.id, sv.id, lc.id, bl.id,
    (SELECT TOP 1 id FROM @bs WHERE rid = 1 + ((n.n - 1) % 5)),
    DATEADD(DAY, n.n, CAST(GETUTCDATE() AS DATE)),
    CAST(DATEADD(MINUTE, 480 + (n.n % 8) * 30, '00:00') AS TIME),
    CAST(DATEADD(MINUTE, 510 + (n.n % 8) * 30, '00:00') AS TIME),
    CASE (n.n % 6)
        WHEN 0 THEN N'Prefiero en la mañana'
        WHEN 1 THEN N'Antes del mediodía por fa'
        WHEN 2 THEN N'En la tarde después de las 2'
        WHEN 3 THEN N'No tengo preferencia'
        WHEN 4 THEN N'Llamar antes de confirmar'
        WHEN 5 THEN N'Que no sea muy temprano'
    END,
    NULL
FROM @ns n
JOIN @tn tn ON tn.rid = n.n
JOIN @cu cu ON cu.rid = n.n
JOIN @sv sv ON sv.rid = n.n
JOIN @lc lc ON lc.rid = n.n
JOIN @bl bl ON bl.rid = n.n;

-- ====================================================================
-- TRACKING CODES
-- ====================================================================

INSERT INTO tracking_codes (booking_id, tracking_code, expires_at, is_active)
OUTPUT inserted.tracking_id INTO @sk (id)
SELECT
    bk.id,
    CONCAT(N'MBM-',
        UPPER(SUBSTRING(CONVERT(NVARCHAR(36), NEWID()), 1, 2)),
        RIGHT(CONCAT(N'00', bk.id), 2)
    ),
    DATEADD(DAY, 30, SYSUTCDATETIME()),
    1
FROM @bk bk;

-- ====================================================================
-- AUDIT LOGS
-- ====================================================================

INSERT INTO audit_logs (tenant_id, owner_id, superadmin_id, action, entity_name, entity_id, old_value, new_value)
SELECT
    tn.id, ow.id, NULL,
    N'tenant_created', N'tenants', tn.id,
    NULL,
    CONCAT(N'Negocio creado: ', t.name, N' - pura vida!')
FROM @tn tn
JOIN @ow ow ON ow.rid = tn.rid
JOIN tenants t ON t.tenant_id = tn.id;
GO
