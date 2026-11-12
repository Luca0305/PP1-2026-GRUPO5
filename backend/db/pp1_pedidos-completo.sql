-- =====================================================================
-- pp1_pedidos COMPLETO (Grupo 5) — UN SOLO ARCHIVO para crear la base entera
-- =====================================================================
-- Es tp-pedidos.sql (script oficial de la cátedra) + datos-demo.sql, uno atrás
-- del otro. Se corre ENTERO una sola vez y deja todo listo:
--   58 platos · 18 menús publicados de noviembre · 196 opciones.
-- Funciona igual en MySQL Workbench (MySQL 8) y en XAMPP (MariaDB): la única
-- diferencia con el script oficial es la intercalación utf8mb4_unicode_ci,
-- que entienden los dos (la de MySQL 8, utf8mb4_0900_ai_ci, no existe en MariaDB).
-- Borra y vuelve a crear pp1_pedidos: se pierden los pedidos de prueba.
-- Los archivos separados siguen en esta carpeta sin cambios.
-- =====================================================================

-- =====================================================================
-- PP1 2026 · Bloque 4 · TP Pedidos de Almuerzo
-- Script de la base de datos: crea la base pp1_pedidos, sus 9 tablas
-- y una carga de datos de prueba que cuenta UNA sola historia.
--
-- Fuente: tp-integradores/tp-pedidos/solucion-base/modelo-de-datos.md
-- Los nombres de tablas y columnas son EXACTAMENTE los del modelo.
--
-- CÓMO CORRERLO (MySQL Workbench)
--   1. Abrí tu conexión local (la del checklist del entorno).
--   2. File → Open SQL Script… → elegí este archivo.
--   3. Ejecutá TODO el script: ícono del rayo (Execute) o Ctrl+Shift+Enter.
--      (No el rayo con el cursor, que ejecuta solo la sentencia actual.)
--   4. Refrescá el panel SCHEMAS: aparece pp1_pedidos.
--
-- OJO: el script BORRA la base pp1_pedidos y la vuelve a crear.
--   Se puede correr las veces que quieras: siempre deja la base igual,
--   con los mismos datos. Si algo salió mal, correlo de nuevo entero.
--
-- POR QUÉ BIGINT Y VARCHAR (y no INT y ENUM, como dice el diagrama)
--   El backend va a usar spring.jpa.hibernate.ddl-auto=validate:
--   el script crea las tablas y Spring solo CONTROLA que las entidades
--   coincidan. Para que ese control pase sin sorpresas:
--   · Toda PK y toda FK es BIGINT, porque en Java el id es Long.
--   · rol y estado son VARCHAR(20) + CHECK, porque en Java son String.
--     Un ENUM de MySQL contra un String (o un enum de Java) es la causa
--     más común de "Schema-validation: wrong column type". Con VARCHAR,
--     el CHECK sigue impidiendo valores que no existen.
--   · DECIMAL → BigDecimal · DATE → LocalDate · DATETIME → LocalDateTime
--     · BOOLEAN → Boolean · INT → Integer.
--   El resto (nombres, largos, NOT NULL, UNIQUE) es el modelo tal cual.
--
-- Contraseñas: van en texto plano ('cambiar123') A PROPÓSITO. En esta
-- etapa no hay login real ni hashing; no uses estas cuentas en nada real.
-- =====================================================================

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS pp1_pedidos;
CREATE DATABASE pp1_pedidos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pp1_pedidos;

-- ---------------------------------------------------------------------
-- TABLAS (en orden: primero las que no dependen de nadie)
-- ---------------------------------------------------------------------

-- Usuario: Empleados y Administrador. El restaurante NO es usuario.
CREATE TABLE usuario (
  id_usuario  BIGINT       NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(60)  NOT NULL,
  apellido    VARCHAR(60)  NOT NULL,
  correo      VARCHAR(120) NOT NULL,
  contrasena  VARCHAR(255) NOT NULL,
  telefono    VARCHAR(30),
  rol         VARCHAR(20)  NOT NULL,
  activo      BOOLEAN      NOT NULL,
  PRIMARY KEY (id_usuario),
  CONSTRAINT uk_usuario_correo UNIQUE (correo),
  CONSTRAINT ck_usuario_rol CHECK (rol IN ('EMPLEADO', 'ADMINISTRADOR'))
) ENGINE = InnoDB;

-- Plato: el catálogo de platos. No depende de ninguna tabla.
CREATE TABLE plato (
  id_plato     BIGINT       NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(120) NOT NULL,
  descripcion  VARCHAR(300),
  imagen       VARCHAR(255),
  categoria    VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id_plato)
) ENGINE = InnoDB;

-- DiaNoLaborable: guarda SOLO los días sin servicio.
-- No tiene FK con menu_dia: "en un día no laborable no hay menú" es una
-- regla de negocio y va en la capa de servicio, no en la base.
CREATE TABLE dia_no_laborable (
  id_dia_no_laborable  BIGINT       NOT NULL AUTO_INCREMENT,
  fecha                DATE         NOT NULL,
  motivo               VARCHAR(120),
  PRIMARY KEY (id_dia_no_laborable),
  CONSTRAINT uk_dia_no_laborable_fecha UNIQUE (fecha)
) ENGINE = InnoDB;

-- Asistencia: qué día viene cada empleado. Es una entidad propia,
-- no un atributo del usuario (la "trampa ASISTENCIA").
CREATE TABLE asistencia (
  id_asistencia  BIGINT  NOT NULL AUTO_INCREMENT,
  id_usuario     BIGINT  NOT NULL,
  fecha          DATE    NOT NULL,
  asiste         BOOLEAN NOT NULL,
  PRIMARY KEY (id_asistencia),
  CONSTRAINT uk_asistencia_usuario_fecha UNIQUE (id_usuario, fecha),
  CONSTRAINT fk_asistencia_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario)
) ENGINE = InnoDB;

-- MenuDia: UN menú por fecha (fecha UNIQUE). Sus opciones están en menu_plato.
CREATE TABLE menu_dia (
  id_menu_dia         BIGINT       NOT NULL AUTO_INCREMENT,
  fecha               DATE         NOT NULL,
  descripcion         VARCHAR(200),
  publicado           BOOLEAN      NOT NULL,
  id_usuario_creador  BIGINT       NOT NULL,
  PRIMARY KEY (id_menu_dia),
  CONSTRAINT uk_menu_dia_fecha UNIQUE (fecha),
  CONSTRAINT fk_menu_dia_usuario FOREIGN KEY (id_usuario_creador)
    REFERENCES usuario (id_usuario)
) ENGINE = InnoDB;

-- MenuPlato: tabla puente CON atributo propio (stock_disponible) → entidad.
-- Es "este plato se ofrece este día, con este stock".
CREATE TABLE menu_plato (
  id_menu_plato     BIGINT NOT NULL AUTO_INCREMENT,
  id_menu_dia       BIGINT NOT NULL,
  id_plato          BIGINT NOT NULL,
  stock_disponible  INT    NOT NULL,
  PRIMARY KEY (id_menu_plato),
  CONSTRAINT fk_menu_plato_menu_dia FOREIGN KEY (id_menu_dia)
    REFERENCES menu_dia (id_menu_dia),
  CONSTRAINT fk_menu_plato_plato FOREIGN KEY (id_plato)
    REFERENCES plato (id_plato)
) ENGINE = InnoDB;

-- Pedido: la cabecera. Nace en BORRADOR y se confirma en un paso aparte.
CREATE TABLE pedido (
  id_pedido     BIGINT      NOT NULL AUTO_INCREMENT,
  id_usuario    BIGINT      NOT NULL,
  fecha_pedido  DATE        NOT NULL,
  estado        VARCHAR(20) NOT NULL,
  PRIMARY KEY (id_pedido),
  CONSTRAINT ck_pedido_estado CHECK (estado IN ('BORRADOR', 'CONFIRMADO', 'CANCELADO')),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario)
) ENGINE = InnoDB;

-- PedidoDia: la línea del pedido, una por día. Tabla puente CON atributos
-- (fecha_entrega, comentario) → entidad. UNIQUE: una sola opción por día
-- dentro del mismo pedido.
CREATE TABLE pedido_dia (
  id_pedido_dia  BIGINT       NOT NULL AUTO_INCREMENT,
  id_pedido      BIGINT       NOT NULL,
  id_menu_dia    BIGINT       NOT NULL,
  id_plato       BIGINT       NOT NULL,
  fecha_entrega  DATE         NOT NULL,
  comentario     VARCHAR(200),
  PRIMARY KEY (id_pedido_dia),
  CONSTRAINT uk_pedido_dia_pedido_menu_dia UNIQUE (id_pedido, id_menu_dia),
  CONSTRAINT fk_pedido_dia_pedido FOREIGN KEY (id_pedido)
    REFERENCES pedido (id_pedido),
  CONSTRAINT fk_pedido_dia_menu_dia FOREIGN KEY (id_menu_dia)
    REFERENCES menu_dia (id_menu_dia),
  CONSTRAINT fk_pedido_dia_plato FOREIGN KEY (id_plato)
    REFERENCES plato (id_plato)
) ENGINE = InnoDB;

-- Notificacion: FUERA DEL ALCANCE MÍNIMO (no tiene pantalla).
-- La tabla está para que la base sea el modelo completo. Si algún día la
-- mapean como entidad, mensaje es TEXT: en Java va con
-- @Column(columnDefinition = "TEXT") para que validate no proteste.
CREATE TABLE notificacion (
  id_notificacion  BIGINT       NOT NULL AUTO_INCREMENT,
  id_usuario       BIGINT       NOT NULL,
  fecha_envio      DATETIME     NOT NULL,
  asunto           VARCHAR(150),
  mensaje          TEXT,
  PRIMARY KEY (id_notificacion),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuario (id_usuario)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- DATOS DE PRUEBA — la historia
--   Laura (Administradora) publicó el menú de lunes a jueves de la semana
--   del 26/10/2026. El viernes 30/10 no hay servicio: cierre por
--   inventario. El menú del lunes 02/11 está cargado pero SIN publicar.
--   Cuatro empleados configuraron su asistencia y armaron su pedido de la
--   semana; Diego todavía no confirmó el suyo (BORRADOR).
--   Cada empleado pide solo los días que viene.
-- Los id se escriben a mano para que la historia se pueda seguir.
-- ---------------------------------------------------------------------

INSERT INTO usuario (id_usuario, nombre, apellido, correo, contrasena, telefono, rol, activo) VALUES
  (1, 'Laura',    'Giménez',   'laura.gimenez@empresa.com.ar',    'cambiar123', '11 4567-8901', 'ADMINISTRADOR', TRUE),
  (2, 'Martín',   'Sosa',      'martin.sosa@empresa.com.ar',      'cambiar123', '11 5123-4455', 'EMPLEADO',      TRUE),
  (3, 'Lucía',    'Fernández', 'lucia.fernandez@empresa.com.ar',  'cambiar123', NULL,           'EMPLEADO',      TRUE),
  (4, 'Diego',    'Romero',    'diego.romero@empresa.com.ar',     'cambiar123', '11 6234-7788', 'EMPLEADO',      TRUE),
  (5, 'Carolina', 'Benítez',   'carolina.benitez@empresa.com.ar', 'cambiar123', '11 3345-9012', 'EMPLEADO',      TRUE);

INSERT INTO plato (id_plato, nombre, descripcion, imagen, categoria) VALUES
  (1, 'Milanesa con puré',        'Clásica, con guarnición',           'assets/img/milanesa.jpg', 'clásico'),
  (2, 'Tarta de verdura',         'Masa casera, acelga y queso',       'assets/img/tarta.jpg',    'vegetariano'),
  (3, 'Ensalada César',           'Con pollo grillado y croutons',     'assets/img/ensalada.jpg', 'liviano'),
  (4, 'Pollo al horno con papas', 'Cuarto de pollo con papas doradas', 'assets/img/pollo.jpg',    'clásico'),
  (5, 'Ñoquis con salsa fileto',  'Ñoquis de papa caseros',            'assets/img/noquis.jpg',   'pastas'),
  (6, 'Wok de vegetales',         'Vegetales salteados con arroz',     'assets/img/wok.jpg',      'vegetariano');

INSERT INTO dia_no_laborable (id_dia_no_laborable, fecha, motivo) VALUES
  (1, '2026-10-30', 'Cierre por inventario'),
  (2, '2026-11-20', 'Día de la Soberanía Nacional'),
  (3, '2026-12-08', 'Inmaculada Concepción de María');

-- Asistencia de la semana del 26/10 (lunes a jueves; el viernes no hay servicio).
INSERT INTO asistencia (id_asistencia, id_usuario, fecha, asiste) VALUES
  ( 1, 2, '2026-10-26', TRUE),  ( 2, 2, '2026-10-27', TRUE),  ( 3, 2, '2026-10-28', TRUE),  ( 4, 2, '2026-10-29', TRUE),
  ( 5, 3, '2026-10-26', TRUE),  ( 6, 3, '2026-10-27', FALSE), ( 7, 3, '2026-10-28', TRUE),  ( 8, 3, '2026-10-29', TRUE),
  ( 9, 4, '2026-10-26', TRUE),  (10, 4, '2026-10-27', TRUE),  (11, 4, '2026-10-28', FALSE), (12, 4, '2026-10-29', FALSE),
  (13, 5, '2026-10-26', FALSE), (14, 5, '2026-10-27', TRUE),  (15, 5, '2026-10-28', TRUE),  (16, 5, '2026-10-29', TRUE);

-- Un menú por fecha. El 30/10 no hay (día no laborable). El 02/11, sin publicar.
INSERT INTO menu_dia (id_menu_dia, fecha, descripcion, publicado, id_usuario_creador) VALUES
  (1, '2026-10-26', 'Menú del lunes',            TRUE,  1),
  (2, '2026-10-27', 'Menú del martes',           TRUE,  1),
  (3, '2026-10-28', 'Menú del miércoles',        TRUE,  1),
  (4, '2026-10-29', 'Menú del jueves',           TRUE,  1),
  (5, '2026-11-02', 'Menú del lunes (borrador)', FALSE, 1);

-- Tres opciones por día publicado (dos en el borrador del 02/11).
INSERT INTO menu_plato (id_menu_plato, id_menu_dia, id_plato, stock_disponible) VALUES
  ( 1, 1, 1, 20), ( 2, 1, 2, 15), ( 3, 1, 3, 10),
  ( 4, 2, 4, 20), ( 5, 2, 5, 15), ( 6, 2, 6, 10),
  ( 7, 3, 1, 20), ( 8, 3, 6, 12), ( 9, 3, 3, 10),
  (10, 4, 5, 20), (11, 4, 2, 15), (12, 4, 4, 12),
  (13, 5, 1, 20), (14, 5, 2, 15);

INSERT INTO pedido (id_pedido, id_usuario, fecha_pedido, estado) VALUES
  (1, 2, '2026-10-22', 'CONFIRMADO'),
  (2, 3, '2026-10-22', 'CONFIRMADO'),
  (3, 4, '2026-10-23', 'BORRADOR'),
  (4, 5, '2026-10-23', 'CONFIRMADO');

-- Una línea por día. El plato es siempre una opción del menú de ese día,
-- y fecha_entrega es la fecha de ese menú.
INSERT INTO pedido_dia (id_pedido_dia, id_pedido, id_menu_dia, id_plato, fecha_entrega, comentario) VALUES
  -- Pedido 1 · Martín (viene los cuatro días)
  ( 1, 1, 1, 1, '2026-10-26', 'Sin sal en el puré'),
  ( 2, 1, 2, 4, '2026-10-27', NULL),
  ( 3, 1, 3, 1, '2026-10-28', NULL),
  ( 4, 1, 4, 5, '2026-10-29', NULL),
  -- Pedido 2 · Lucía (no viene el martes)
  ( 5, 2, 1, 2, '2026-10-26', NULL),
  ( 6, 2, 3, 6, '2026-10-28', 'Sin picante'),
  ( 7, 2, 4, 2, '2026-10-29', NULL),
  -- Pedido 3 · Diego, BORRADOR (viene lunes y martes)
  ( 8, 3, 1, 1, '2026-10-26', NULL),
  ( 9, 3, 2, 5, '2026-10-27', 'Queso rallado aparte'),
  -- Pedido 4 · Carolina (no viene el lunes)
  (10, 4, 2, 4, '2026-10-27', NULL),
  (11, 4, 3, 1, '2026-10-28', NULL),
  (12, 4, 4, 5, '2026-10-29', 'Porción chica');

-- Fuera del alcance mínimo: una sola fila, para que la tabla no esté vacía.
INSERT INTO notificacion (id_notificacion, id_usuario, fecha_envio, asunto, mensaje) VALUES
  (1, 2, '2026-10-22 10:15:00', 'Pedido confirmado', 'Tu pedido de la semana del 26/10 quedó confirmado.');

-- =====================================================================
-- Verificación — seleccioná este bloque y ejecutalo (rayo).
-- Lo esperado está al lado de cada línea.
-- =====================================================================
-- SELECT COUNT(*) FROM usuario;           -- 5
-- SELECT COUNT(*) FROM asistencia;        -- 16
-- SELECT COUNT(*) FROM dia_no_laborable;  -- 3
-- SELECT COUNT(*) FROM menu_dia;          -- 5
-- SELECT COUNT(*) FROM plato;             -- 6
-- SELECT COUNT(*) FROM menu_plato;        -- 14
-- SELECT COUNT(*) FROM pedido;            -- 4
-- SELECT COUNT(*) FROM pedido_dia;        -- 12
-- SELECT COUNT(*) FROM notificacion;      -- 1

-- =====================================================================
-- Cruces de ejemplo — los mismos de modelo-explicado-pedidos.md.
-- Sacales el "-- " de adelante (o copialos a una pestaña nueva) y correlos.
-- =====================================================================

-- Cruce 1 · El menú publicado de un día, con sus opciones → pantalla 03 Menú del día
-- Esperado: Pollo al horno con papas (20), Ñoquis con salsa fileto (15), Wok de vegetales (10).
-- Con '2026-11-02' no devuelve nada: ese menú no está publicado.
-- SELECT md.fecha, p.id_plato, p.nombre, p.categoria, mp.stock_disponible
-- FROM menu_dia md
-- JOIN menu_plato mp ON mp.id_menu_dia = md.id_menu_dia
-- JOIN plato p       ON p.id_plato     = mp.id_plato
-- WHERE md.fecha = '2026-10-27'
--   AND md.publicado = TRUE
-- ORDER BY mp.id_menu_plato;

-- Cruce 2 · El consolidado de una fecha → pantalla 05 Consolidado
-- Esperado: Milanesa con puré 2, Wok de vegetales 1.
-- SELECT p.nombre AS plato, COUNT(*) AS porciones
-- FROM pedido_dia pd
-- JOIN pedido pe ON pe.id_pedido = pd.id_pedido
-- JOIN plato p   ON p.id_plato   = pd.id_plato
-- WHERE pd.fecha_entrega = '2026-10-28'
--   AND pe.estado = 'CONFIRMADO'
-- GROUP BY p.id_plato, p.nombre
-- ORDER BY porciones DESC, p.nombre;

-- Cruce 3 · Mis pedidos (Lucía, id_usuario = 3) → pantalla 04 Mis pedidos
-- Esperado: pedido 2 CONFIRMADO · 26/10 Tarta de verdura · 28/10 Wok de vegetales "Sin picante" · 29/10 Tarta de verdura.
-- SELECT pe.id_pedido, pe.estado, md.fecha AS dia, p.nombre AS plato, pd.comentario
-- FROM pedido pe
-- JOIN pedido_dia pd ON pd.id_pedido   = pe.id_pedido
-- JOIN menu_dia md   ON md.id_menu_dia = pd.id_menu_dia
-- JOIN plato p       ON p.id_plato     = pd.id_plato
-- WHERE pe.id_usuario = 3
-- ORDER BY md.fecha;

-- Cruce 4 · ¿Se puede pedir ese día? → pantallas 03 Menú del día y 07 Feriados
-- Esperado con '2026-10-30': NO: día no laborable.
-- Probalo con '2026-10-29' (SÍ) y con '2026-11-02' (NO: todavía no hay menú publicado).
-- SELECT CASE
--          WHEN EXISTS (SELECT 1 FROM dia_no_laborable WHERE fecha = '2026-10-30')
--            THEN 'NO: día no laborable'
--          WHEN EXISTS (SELECT 1 FROM menu_dia WHERE fecha = '2026-10-30' AND publicado = TRUE)
--            THEN 'SÍ'
--          ELSE 'NO: todavía no hay menú publicado'
--        END AS se_puede_pedir;

-- =====================================================================
-- PARTE 2 · DATOS DE LA DEMO (datos-demo.sql)
-- =====================================================================

-- =====================================================================
-- Datos de DEMO para la 4ta entrega (Grupo 5) — se corre DESPUÉS de tp-pedidos.sql
-- =====================================================================
-- El script oficial (tp-pedidos.sql) cuenta la historia de la semana del 26/10:
-- esas fechas ya pasaron y el corte de las 10:00 no deja pedir para ellas.
-- Este archivo NO cambia el script de la cátedra: solo AGREGA
--   · 38 platos más (para todo tipo de persona: clásicos, carnes, pastas, minutas,
--     vegetarianos, veganos, livianos y sin TACC), y
--     con su ilustración en frontend/assets/img/platos/ilustraciones/, y
--   · menús PUBLICADOS del 11/11 al 30/11/2026 con 12 opciones por día
--     (el 20/11 no: es no laborable en el script).
-- Laura (id 1, ADMINISTRADORA) figura como creadora de los menús.
--
-- CÓMO CORRERLO: primero tp-pedidos.sql ENTERO; después este archivo ENTERO.
-- Si se vuelve a correr tp-pedidos.sql, hay que volver a correr este.
-- =====================================================================

SET NAMES utf8mb4;
USE pp1_pedidos;

-- Platos nuevos (los 6 del script se reutilizan)
INSERT INTO plato (nombre, descripcion, imagen, categoria) VALUES
  ('Pastel de papa', 'Carne picada con puré gratinado', 'assets/img/platos/ilustraciones/pastel-de-papa.svg', 'clásico'),
  ('Guiso de lentejas', 'Lentejas con chorizo colorado y verduras', 'assets/img/platos/ilustraciones/guiso-de-lentejas.svg', 'clásico'),
  ('Pollo al verdeo con puré', 'Pechuga en salsa de verdeo y crema', 'assets/img/platos/ilustraciones/pollo-al-verdeo-con-pure.svg', 'clásico'),
  ('Albóndigas con arroz', 'Albóndigas caseras en salsa de tomate', 'assets/img/platos/ilustraciones/albondigas-con-arroz.svg', 'clásico'),
  ('Locro criollo', 'Maíz, zapallo, porotos y carne', 'assets/img/platos/ilustraciones/locro-criollo.svg', 'clásico'),
  ('Estofado de carne con papas', 'Carne cocida lento con papas y zanahoria', 'assets/img/platos/ilustraciones/estofado-de-carne-con-papas.svg', 'clásico'),
  ('Bife de chorizo con ensalada', 'Bife a la plancha con ensalada mixta', 'assets/img/platos/ilustraciones/bife-de-chorizo-con-ensalada.svg', 'carnes'),
  ('Carne al horno con papas', 'Peceto al horno con papas doradas', 'assets/img/platos/ilustraciones/carne-al-horno-con-papas.svg', 'carnes'),
  ('Bondiola braseada con batatas', 'Bondiola de cerdo con batatas asadas', 'assets/img/platos/ilustraciones/bondiola-braseada-con-batatas.svg', 'carnes'),
  ('Matambre a la pizza', 'Matambre tierno con salsa, queso y orégano', 'assets/img/platos/ilustraciones/matambre-a-la-pizza.svg', 'carnes'),
  ('Ravioles de ricota con salsa mixta', 'Ravioles caseros con salsa rosa', 'assets/img/platos/ilustraciones/ravioles-de-ricota-con-salsa-mixta.svg', 'pastas'),
  ('Tallarines con bolognesa', 'Tallarines al huevo con salsa de carne', 'assets/img/platos/ilustraciones/tallarines-con-bolognesa.svg', 'pastas'),
  ('Lasaña de carne', 'Capas de pasta, carne, salsa y bechamel', 'assets/img/platos/ilustraciones/lasana-de-carne.svg', 'pastas'),
  ('Sorrentinos de jamón y queso', 'Con salsa de tomate o crema', 'assets/img/platos/ilustraciones/sorrentinos-de-jamon-y-queso.svg', 'pastas'),
  ('Fideos al pesto', 'Fideos con pesto de albahaca y nueces', 'assets/img/platos/ilustraciones/fideos-al-pesto.svg', 'pastas'),
  ('Canelones de verdura', 'Rellenos de acelga y ricota, con bechamel', 'assets/img/platos/ilustraciones/canelones-de-verdura.svg', 'pastas'),
  ('Milanesa napolitana con papas fritas', 'Con jamón, queso y salsa', 'assets/img/platos/ilustraciones/milanesa-napolitana-con-papas-fritas.svg', 'minutas'),
  ('Hamburguesa casera con papas', 'Pan, carne, lechuga, tomate y queso', 'assets/img/platos/ilustraciones/hamburguesa-casera-con-papas.svg', 'minutas'),
  ('Empanadas de carne (3)', 'Empanadas al horno, carne cortada a cuchillo', 'assets/img/platos/ilustraciones/empanadas-de-carne-3.svg', 'minutas'),
  ('Tarta de jamón y queso', 'Masa casera, jamón cocido y queso', 'assets/img/platos/ilustraciones/tarta-de-jamon-y-queso.svg', 'minutas'),
  ('Suprema napolitana con puré', 'Pechuga empanada con jamón y queso', 'assets/img/platos/ilustraciones/suprema-napolitana-con-pure.svg', 'minutas'),
  ('Merluza a la romana con ensalada', 'Filet rebozado con ensalada de estación', 'assets/img/platos/ilustraciones/merluza-a-la-romana-con-ensalada.svg', 'minutas'),
  ('Tortilla de papas', 'Clásica, con cebolla', 'assets/img/platos/ilustraciones/tortilla-de-papas.svg', 'vegetariano'),
  ('Berenjenas a la napolitana', 'Berenjenas con salsa y queso gratinado', 'assets/img/platos/ilustraciones/berenjenas-a-la-napolitana.svg', 'vegetariano'),
  ('Milanesa de soja con ensalada', 'Milanesa de soja al horno con ensalada', 'assets/img/platos/ilustraciones/milanesa-de-soja-con-ensalada.svg', 'vegetariano'),
  ('Risotto de hongos', 'Arroz cremoso con champiñones y queso', 'assets/img/platos/ilustraciones/risotto-de-hongos.svg', 'vegetariano'),
  ('Empanadas de humita (3)', 'Choclo cremoso y queso', 'assets/img/platos/ilustraciones/empanadas-de-humita-3.svg', 'vegetariano'),
  ('Curry de garbanzos con arroz', 'Garbanzos en salsa de curry y leche de coco', 'assets/img/platos/ilustraciones/curry-de-garbanzos-con-arroz.svg', 'vegano'),
  ('Hamburguesa de lentejas con ensalada', 'Medallón de lentejas, sin lácteos ni huevo', 'assets/img/platos/ilustraciones/hamburguesa-de-lentejas-con-ensalada.svg', 'vegano'),
  ('Bowl de quinoa y vegetales', 'Quinoa, palta, zanahoria, tomate y semillas', 'assets/img/platos/ilustraciones/bowl-de-quinoa-y-vegetales.svg', 'vegano'),
  ('Guiso de lentejas vegano', 'Lentejas con calabaza y verduras', 'assets/img/platos/ilustraciones/guiso-de-lentejas-vegano.svg', 'vegano'),
  ('Ensalada de pollo y palta', 'Pollo grillado, palta, lechuga y tomate', 'assets/img/platos/ilustraciones/ensalada-de-pollo-y-palta.svg', 'liviano'),
  ('Pescado al horno con verduras', 'Merluza al horno con vegetales asados', 'assets/img/platos/ilustraciones/pescado-al-horno-con-verduras.svg', 'liviano'),
  ('Wrap de pollo y vegetales', 'Tortilla de trigo con pollo y vegetales', 'assets/img/platos/ilustraciones/wrap-de-pollo-y-vegetales.svg', 'liviano'),
  ('Ensalada caprese', 'Tomate, mozzarella, albahaca y oliva', 'assets/img/platos/ilustraciones/ensalada-caprese.svg', 'liviano'),
  ('Pollo grillado con vegetales (sin TACC)', 'Elaborado sin gluten', 'assets/img/platos/ilustraciones/pollo-grillado-con-vegetales-sin-tacc.svg', 'sin TACC'),
  ('Arroz primavera (sin TACC)', 'Arroz con verduras salteadas, sin gluten', 'assets/img/platos/ilustraciones/arroz-primavera-sin-tacc.svg', 'sin TACC'),
  ('Bife con puré (sin TACC)', 'Elaborado sin gluten', 'assets/img/platos/ilustraciones/bife-con-pure-sin-tacc.svg', 'sin TACC');

-- Un menú publicado por día hábil
INSERT INTO menu_dia (fecha, descripcion, publicado, id_usuario_creador) VALUES
  ('2026-11-11', 'Menú del miércoles', TRUE, 1),
  ('2026-11-12', 'Menú del jueves', TRUE, 1),
  ('2026-11-13', 'Menú del viernes', TRUE, 1),
  ('2026-11-16', 'Menú del lunes', TRUE, 1),
  ('2026-11-17', 'Menú del martes', TRUE, 1),
  ('2026-11-18', 'Menú del miércoles', TRUE, 1),
  ('2026-11-19', 'Menú del jueves', TRUE, 1),
  ('2026-11-23', 'Menú del lunes', TRUE, 1),
  ('2026-11-24', 'Menú del martes', TRUE, 1),
  ('2026-11-25', 'Menú del miércoles', TRUE, 1),
  ('2026-11-26', 'Menú del jueves', TRUE, 1),
  ('2026-11-27', 'Menú del viernes', TRUE, 1),
  ('2026-11-30', 'Menú del lunes', TRUE, 1);

-- 12 opciones por día, rotando los platos de cada categoría
INSERT INTO menu_plato (id_menu_dia, id_plato, stock_disponible)
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Milanesa con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Pollo al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Bife de chorizo con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Ñoquis con salsa fileto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Ravioles de ricota con salsa mixta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Milanesa napolitana con papas fritas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Hamburguesa casera con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Tarta de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Wok de vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Curry de garbanzos con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Ensalada César'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Pollo grillado con vegetales (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Pastel de papa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Guiso de lentejas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Carne al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Tallarines con bolognesa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Lasaña de carne'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Empanadas de carne (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Tarta de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Tortilla de papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Berenjenas a la napolitana'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Hamburguesa de lentejas con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Ensalada de pollo y palta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Arroz primavera (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Pollo al verdeo con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Albóndigas con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Bondiola braseada con batatas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Sorrentinos de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Fideos al pesto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Suprema napolitana con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Merluza a la romana con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Milanesa de soja con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Risotto de hongos'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Bowl de quinoa y vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Pescado al horno con verduras'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Bife con puré (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Locro criollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Estofado de carne con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Matambre a la pizza'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Canelones de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Ñoquis con salsa fileto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Milanesa napolitana con papas fritas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Hamburguesa casera con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Empanadas de humita (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Tarta de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Guiso de lentejas vegano'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Wrap de pollo y vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Pollo grillado con vegetales (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Milanesa con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Pollo al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Bife de chorizo con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Ravioles de ricota con salsa mixta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Tallarines con bolognesa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Empanadas de carne (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Tarta de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Wok de vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Tortilla de papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Curry de garbanzos con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Ensalada caprese'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Arroz primavera (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Pastel de papa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Guiso de lentejas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Carne al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Lasaña de carne'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Sorrentinos de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Suprema napolitana con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Merluza a la romana con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Berenjenas a la napolitana'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Milanesa de soja con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Hamburguesa de lentejas con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Ensalada César'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Bife con puré (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Pollo al verdeo con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Albóndigas con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Bondiola braseada con batatas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Fideos al pesto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Canelones de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Milanesa napolitana con papas fritas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Hamburguesa casera con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Risotto de hongos'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Empanadas de humita (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Bowl de quinoa y vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Ensalada de pollo y palta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Pollo grillado con vegetales (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Locro criollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Estofado de carne con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Matambre a la pizza'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Ñoquis con salsa fileto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Ravioles de ricota con salsa mixta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Empanadas de carne (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Tarta de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Tarta de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Wok de vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Guiso de lentejas vegano'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Pescado al horno con verduras'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Arroz primavera (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Milanesa con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Pollo al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Bife de chorizo con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Tallarines con bolognesa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Lasaña de carne'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Suprema napolitana con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Merluza a la romana con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Tortilla de papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Berenjenas a la napolitana'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Curry de garbanzos con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Wrap de pollo y vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Bife con puré (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Pastel de papa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Guiso de lentejas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Carne al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Sorrentinos de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Fideos al pesto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Milanesa napolitana con papas fritas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Hamburguesa casera con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Milanesa de soja con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Risotto de hongos'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Hamburguesa de lentejas con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Ensalada caprese'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Pollo grillado con vegetales (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Pollo al verdeo con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Albóndigas con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Bondiola braseada con batatas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Canelones de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Ñoquis con salsa fileto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Empanadas de carne (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Tarta de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Empanadas de humita (3)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Tarta de verdura'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Bowl de quinoa y vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Ensalada César'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Arroz primavera (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Locro criollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Estofado de carne con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Matambre a la pizza'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Ravioles de ricota con salsa mixta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Tallarines con bolognesa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Suprema napolitana con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Merluza a la romana con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Wok de vegetales'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Tortilla de papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Guiso de lentejas vegano'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Ensalada de pollo y palta'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Bife con puré (sin TACC)'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Milanesa con puré'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Pollo al horno con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Bife de chorizo con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Lasaña de carne'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Sorrentinos de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Milanesa napolitana con papas fritas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Hamburguesa casera con papas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Berenjenas a la napolitana'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Milanesa de soja con ensalada'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 25 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Curry de garbanzos con arroz'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 20 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Pescado al horno con verduras'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 15 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Pollo grillado con vegetales (sin TACC)';

-- Verificación (después de correr tp-pedidos.sql + este archivo):
-- SELECT COUNT(*) FROM plato;       -- 58  (6 del script + 38 nuevos + 14 del prototipo)
-- SELECT COUNT(*) FROM menu_dia;    -- 18  (5 del script + 13 de demo)
-- SELECT COUNT(*) FROM menu_plato;  -- 196 (14 del script + 156 de demo + 26 del prototipo)

-- ---------------------------------------------------------------------
-- Platos del prototipo (main) que no estaban: se suman al catálogo y se rotan
-- 2 por día en los menús publicados. Las categorías son las del frontend.
-- ---------------------------------------------------------------------
INSERT INTO plato (nombre, descripcion, imagen, categoria) VALUES
  ('Pollo al limón', 'Grillado · arroz · zanahorias', NULL, 'carnes'),
  ('Pasta al pesto', 'Fideos · pesto · cherry', NULL, 'pastas'),
  ('Locro vegetal', 'Sin carne · zapallo · porotos', NULL, 'vegetariano'),
  ('Cazuela de pollo', 'Con arroz y caldo', NULL, 'carnes'),
  ('Revuelto gramajo', 'Papas · jamón · huevo', NULL, 'minutas'),
  ('Ensalada completa', 'Vegetal · proteína de soja', NULL, 'ensaladas'),
  ('Pechuga a la plancha', 'Con arroz primavera', NULL, 'carnes'),
  ('Albóndigas con salsa', 'Carne vacuna · puré de calabaza', NULL, 'carnes'),
  ('Ñoquis a la bolognesa', 'Salsa de carne · queso', NULL, 'pastas'),
  ('Fideos con tuco y pollo', 'Pollo desmenuzado · tuco casero', NULL, 'pastas'),
  ('Ensalada mediterránea', 'Tomate · aceitunas · queso feta', NULL, 'ensaladas'),
  ('Ensalada de lentejas', 'Lentejas · zanahoria · huevo duro', NULL, 'ensaladas'),
  ('Berenjenas rellenas', 'Gratinadas con queso', NULL, 'vegetariano'),
  ('Omelette de jamón y queso', 'Con ensalada de tomate', NULL, 'minutas');

INSERT INTO menu_plato (id_menu_dia, id_plato, stock_disponible)
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Pollo al limón'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-11' AND p.nombre = 'Pasta al pesto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Locro vegetal'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-12' AND p.nombre = 'Cazuela de pollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Revuelto gramajo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-13' AND p.nombre = 'Ensalada completa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Pechuga a la plancha'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-16' AND p.nombre = 'Albóndigas con salsa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Ñoquis a la bolognesa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-17' AND p.nombre = 'Fideos con tuco y pollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Ensalada mediterránea'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-18' AND p.nombre = 'Ensalada de lentejas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Berenjenas rellenas'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-19' AND p.nombre = 'Omelette de jamón y queso'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Pollo al limón'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-23' AND p.nombre = 'Pasta al pesto'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Locro vegetal'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-24' AND p.nombre = 'Cazuela de pollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Revuelto gramajo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-25' AND p.nombre = 'Ensalada completa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Pechuga a la plancha'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-26' AND p.nombre = 'Albóndigas con salsa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Ñoquis a la bolognesa'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-27' AND p.nombre = 'Fideos con tuco y pollo'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Ensalada mediterránea'
UNION ALL
  SELECT m.id_menu_dia, p.id_plato, 30 FROM menu_dia m, plato p WHERE m.fecha = '2026-11-30' AND p.nombre = 'Ensalada de lentejas';
