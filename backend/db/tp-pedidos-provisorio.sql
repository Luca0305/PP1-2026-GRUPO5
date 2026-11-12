-- =====================================================================
--  TP Pedidos de Almuerzo · Base pp1_pedidos · SCRIPT PROVISORIO (G5)
-- =====================================================================
--  ⚠ Este NO es el script oficial de la cátedra (tp-pedidos.sql).
--  Se reconstruyó a partir de las guías BK 01 / BK 02 y de
--  "El modelo de datos explicado — Pedidos" para poder avanzar.
--  Cuando el grupo tenga el oficial: correr el oficial y borrar este.
--
--  Respeta lo que las guías dicen del oficial:
--   * CREATE TABLE plato idéntico al de la guía BK 02.
--   * Tablas, columnas y relaciones de la tabla de traducción.
--   * Los datos que devuelven los 4 cruces del modelo explicado.
--   * Conteos de verificación: plato = 6, pedido_dia = 12.
--
--  Por qué los id son BIGINT y rol/estado son VARCHAR (y no INT / ENUM
--  como en el diagrama): en Java/JPA un BIGINT se mapea a Long, que es el
--  tipo de id de JpaRepository<Entidad, Long>; y un VARCHAR con CHECK se
--  mapea a String (o a un enum Java con @Enumerated(STRING)) sin que la
--  validación de Hibernate (ddl-auto=validate) choque con el tipo ENUM
--  de MySQL.
--
--  Tipos SQL → Java: BIGINT → Long · VARCHAR → String · INT → Integer ·
--  BOOLEAN → Boolean · DATE → LocalDate · DATETIME → LocalDateTime
--
--  Se corre ENTERO (empieza con DROP DATABASE: siempre deja la base igual).
-- =====================================================================

DROP DATABASE IF EXISTS pp1_pedidos;
CREATE DATABASE pp1_pedidos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pp1_pedidos;

-- ---------------------------------------------------------------------
--  Tablas (en orden: primero las que no apuntan a nadie)
-- ---------------------------------------------------------------------

CREATE TABLE usuario (
  id_usuario   BIGINT       NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(80)  NOT NULL,
  apellido     VARCHAR(80)  NOT NULL,
  correo       VARCHAR(120) NOT NULL,
  contrasena   VARCHAR(255) NOT NULL,
  telefono     VARCHAR(30),
  rol          VARCHAR(20)  NOT NULL,
  activo       BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uk_usuario_correo (correo),
  CONSTRAINT ck_usuario_rol CHECK (rol IN ('EMPLEADO', 'ADMINISTRADOR'))
);

CREATE TABLE plato (
  id_plato     BIGINT       NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(120) NOT NULL,
  descripcion  VARCHAR(300),
  imagen       VARCHAR(255),
  categoria    VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id_plato)
);

CREATE TABLE dia_no_laborable (
  id_dia_no_laborable BIGINT       NOT NULL AUTO_INCREMENT,
  fecha               DATE         NOT NULL,
  motivo              VARCHAR(150) NOT NULL,
  PRIMARY KEY (id_dia_no_laborable),
  UNIQUE KEY uk_dia_no_laborable_fecha (fecha)
);

CREATE TABLE asistencia (
  id_asistencia BIGINT  NOT NULL AUTO_INCREMENT,
  id_usuario    BIGINT  NOT NULL,
  fecha         DATE    NOT NULL,
  asiste        BOOLEAN NOT NULL,
  PRIMARY KEY (id_asistencia),
  UNIQUE KEY uk_asistencia_usuario_fecha (id_usuario, fecha),
  CONSTRAINT fk_asistencia_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE menu_dia (
  id_menu_dia        BIGINT       NOT NULL AUTO_INCREMENT,
  fecha              DATE         NOT NULL,
  descripcion        VARCHAR(200),
  publicado          BOOLEAN      NOT NULL DEFAULT FALSE,
  id_usuario_creador BIGINT       NOT NULL,
  PRIMARY KEY (id_menu_dia),
  UNIQUE KEY uk_menu_dia_fecha (fecha),
  CONSTRAINT fk_menu_dia_creador FOREIGN KEY (id_usuario_creador) REFERENCES usuario (id_usuario)
);

CREATE TABLE menu_plato (
  id_menu_plato    BIGINT NOT NULL AUTO_INCREMENT,
  id_menu_dia      BIGINT NOT NULL,
  id_plato         BIGINT NOT NULL,
  stock_disponible INT    NOT NULL,
  PRIMARY KEY (id_menu_plato),
  UNIQUE KEY uk_menu_plato (id_menu_dia, id_plato),
  CONSTRAINT fk_menu_plato_menu  FOREIGN KEY (id_menu_dia) REFERENCES menu_dia (id_menu_dia),
  CONSTRAINT fk_menu_plato_plato FOREIGN KEY (id_plato)    REFERENCES plato (id_plato),
  CONSTRAINT ck_menu_plato_stock CHECK (stock_disponible >= 0)
);

CREATE TABLE pedido (
  id_pedido    BIGINT      NOT NULL AUTO_INCREMENT,
  id_usuario   BIGINT      NOT NULL,
  fecha_pedido DATE        NOT NULL,
  estado       VARCHAR(20) NOT NULL,
  PRIMARY KEY (id_pedido),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
  CONSTRAINT ck_pedido_estado CHECK (estado IN ('BORRADOR', 'CONFIRMADO', 'CANCELADO'))
);

CREATE TABLE pedido_dia (
  id_pedido_dia BIGINT       NOT NULL AUTO_INCREMENT,
  id_pedido     BIGINT       NOT NULL,
  id_menu_dia   BIGINT       NOT NULL,
  id_plato      BIGINT       NOT NULL,
  fecha_entrega DATE         NOT NULL,
  comentario    VARCHAR(200),
  PRIMARY KEY (id_pedido_dia),
  UNIQUE KEY uk_pedido_dia (id_pedido, id_menu_dia),
  CONSTRAINT fk_pedido_dia_pedido FOREIGN KEY (id_pedido)   REFERENCES pedido (id_pedido),
  CONSTRAINT fk_pedido_dia_menu   FOREIGN KEY (id_menu_dia) REFERENCES menu_dia (id_menu_dia),
  CONSTRAINT fk_pedido_dia_plato  FOREIGN KEY (id_plato)    REFERENCES plato (id_plato)
);

CREATE TABLE notificacion (
  id_notificacion BIGINT       NOT NULL AUTO_INCREMENT,
  id_usuario      BIGINT       NOT NULL,
  fecha_envio     DATETIME     NOT NULL,
  asunto          VARCHAR(120) NOT NULL,
  mensaje         VARCHAR(500) NOT NULL,
  PRIMARY KEY (id_notificacion),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

-- ---------------------------------------------------------------------
--  Datos de ejemplo · semana del lunes 26/10/2026 al viernes 30/10/2026
-- ---------------------------------------------------------------------

-- Contraseñas de ejemplo: no son reales (el login con BD llega más adelante).
INSERT INTO usuario (id_usuario, nombre, apellido, correo, contrasena, telefono, rol, activo) VALUES
  (1, 'Ana',    'Gómez',    'proadmin@gmail.com',      'cambiar', '3415550001', 'ADMINISTRADOR', TRUE),
  (2, 'Juan',   'Pérez',    'juan.perez@gmail.com',    'cambiar', '3415550002', 'EMPLEADO',      TRUE),
  (3, 'Lucía',  'Fernández','lucia.fernandez@gmail.com','cambiar', '3415550003', 'EMPLEADO',      TRUE),
  (4, 'Diego',  'Sosa',     'diego.sosa@gmail.com',    'cambiar', NULL,         'EMPLEADO',      TRUE),
  (5, 'Martín', 'Ríos',     'martin.rios@gmail.com',   'cambiar', NULL,         'EMPLEADO',      TRUE);

INSERT INTO plato (id_plato, nombre, descripcion, imagen, categoria) VALUES
  (1, 'Milanesa con puré',        'Clásica, con guarnición',        'assets/img/milanesa.jpg', 'clásico'),
  (2, 'Pollo al horno con papas', 'Cuarto de pollo, papas rústicas', 'assets/img/pollo.jpg',    'clásico'),
  (3, 'Ñoquis con salsa fileto',  'Ñoquis de papa caseros',         'assets/img/noquis.jpg',   'pastas'),
  (4, 'Tarta de verdura',         'Acelga, cebolla y queso',        'assets/img/tarta.jpg',    'vegetariano'),
  (5, 'Ensalada César',           'Pollo, croutons y parmesano',    'assets/img/cesar.jpg',    'ensaladas'),
  (6, 'Wok de vegetales',         'Salteado con arroz yamaní',      'assets/img/wok.jpg',      'vegetariano');

-- Un día es hábil si NO está acá. Sin FK con menu_dia: la regla va en el servicio.
INSERT INTO dia_no_laborable (id_dia_no_laborable, fecha, motivo) VALUES
  (1, '2026-10-30', 'Cierre por inventario');

-- Asistencia por fecha: Lucía NO viene el martes 27 (fila con asiste = FALSE).
INSERT INTO asistencia (id_usuario, fecha, asiste) VALUES
  (2, '2026-10-26', TRUE),  (2, '2026-10-27', TRUE),  (2, '2026-10-28', TRUE),  (2, '2026-10-29', TRUE),
  (3, '2026-10-26', TRUE),  (3, '2026-10-27', FALSE), (3, '2026-10-28', TRUE),  (3, '2026-10-29', TRUE),
  (4, '2026-10-26', TRUE),  (4, '2026-10-27', TRUE),  (4, '2026-10-28', FALSE), (4, '2026-10-29', TRUE),
  (5, '2026-10-26', FALSE), (5, '2026-10-27', TRUE),  (5, '2026-10-28', TRUE),  (5, '2026-10-29', FALSE);

-- Un menú por fecha. El 02/11 está cargado pero NO publicado.
INSERT INTO menu_dia (id_menu_dia, fecha, descripcion, publicado, id_usuario_creador) VALUES
  (1, '2026-10-26', 'Lunes',     TRUE,  1),
  (2, '2026-10-27', 'Martes',    TRUE,  1),
  (3, '2026-10-28', 'Miércoles', TRUE,  1),
  (4, '2026-10-29', 'Jueves',    TRUE,  1),
  (5, '2026-11-02', 'Lunes',     FALSE, 1);

INSERT INTO menu_plato (id_menu_plato, id_menu_dia, id_plato, stock_disponible) VALUES
  ( 1, 1, 1, 25), ( 2, 1, 4, 15), ( 3, 1, 5, 10),   -- lunes 26
  ( 4, 2, 2, 20), ( 5, 2, 3, 15), ( 6, 2, 6, 10),   -- martes 27 (cruce 1)
  ( 7, 3, 1, 25), ( 8, 3, 6, 10), ( 9, 3, 3, 15),   -- miércoles 28
  (10, 4, 4, 15), (11, 4, 5, 10), (12, 4, 2, 20),   -- jueves 29
  (13, 5, 1, 25), (14, 5, 3, 15);                   -- lunes 02/11 (sin publicar)

INSERT INTO pedido (id_pedido, id_usuario, fecha_pedido, estado) VALUES
  (1, 2, '2026-10-23', 'CONFIRMADO'),   -- Juan
  (2, 3, '2026-10-23', 'CONFIRMADO'),   -- Lucía (cruce 3)
  (3, 4, '2026-10-24', 'BORRADOR'),     -- Diego: el borrador NO cuenta en el consolidado
  (4, 5, '2026-10-24', 'CONFIRMADO');   -- Martín

INSERT INTO pedido_dia (id_pedido, id_menu_dia, id_plato, fecha_entrega, comentario) VALUES
  (1, 1, 1, '2026-10-26', NULL),
  (1, 2, 2, '2026-10-27', NULL),
  (1, 3, 1, '2026-10-28', 'Con limón'),
  (1, 4, 5, '2026-10-29', NULL),
  (2, 1, 4, '2026-10-26', NULL),
  (2, 3, 6, '2026-10-28', 'Sin picante'),
  (2, 4, 4, '2026-10-29', NULL),
  (3, 1, 1, '2026-10-26', NULL),
  (3, 2, 3, '2026-10-27', 'Poca salsa'),
  (3, 4, 4, '2026-10-29', NULL),
  (4, 2, 2, '2026-10-27', NULL),
  (4, 3, 1, '2026-10-28', NULL);

INSERT INTO notificacion (id_usuario, fecha_envio, asunto, mensaje) VALUES
  (3, '2026-10-23 09:30:00', 'Pedido confirmado', 'Tu pedido de la semana del 26/10 quedó confirmado.'),
  (4, '2026-10-24 18:00:00', 'Pedido sin confirmar', 'Tenés un pedido en borrador para la semana del 26/10.');

-- ---------------------------------------------------------------------
--  Verificación (sacar el "-- " y ejecutar)
-- ---------------------------------------------------------------------
-- SELECT COUNT(*) FROM usuario;            -- 5
-- SELECT COUNT(*) FROM plato;              -- 6
-- SELECT COUNT(*) FROM dia_no_laborable;   -- 1
-- SELECT COUNT(*) FROM asistencia;         -- 16
-- SELECT COUNT(*) FROM menu_dia;           -- 5
-- SELECT COUNT(*) FROM menu_plato;         -- 14
-- SELECT COUNT(*) FROM pedido;             -- 4
-- SELECT COUNT(*) FROM pedido_dia;         -- 12
-- SELECT COUNT(*) FROM notificacion;       -- 2

-- ---------------------------------------------------------------------
--  Cruces (los 4 del modelo explicado)
-- ---------------------------------------------------------------------
-- Cruce 1 · El menú publicado de un día → Pollo (20), Ñoquis (15), Wok (10)
-- SELECT md.fecha, p.id_plato, p.nombre, p.categoria, mp.stock_disponible
-- FROM menu_dia md
-- JOIN menu_plato mp ON mp.id_menu_dia = md.id_menu_dia
-- JOIN plato p       ON p.id_plato     = mp.id_plato
-- WHERE md.fecha = '2026-10-27' AND md.publicado = TRUE
-- ORDER BY mp.id_menu_plato;

-- Cruce 2 · Consolidado de una fecha → 28/10: Milanesa 2, Wok 1
-- SELECT p.nombre AS plato, COUNT(*) AS porciones
-- FROM pedido_dia pd
-- JOIN pedido pe ON pe.id_pedido = pd.id_pedido
-- JOIN plato p   ON p.id_plato   = pd.id_plato
-- WHERE pd.fecha_entrega = '2026-10-28' AND pe.estado = 'CONFIRMADO'
-- GROUP BY p.id_plato, p.nombre
-- ORDER BY porciones DESC, p.nombre;

-- Cruce 3 · Mis pedidos (Lucía, id 3) → pedido 2, CONFIRMADO, 26 · 28 · 29
-- SELECT pe.id_pedido, pe.estado, md.fecha AS dia, p.nombre AS plato, pd.comentario
-- FROM pedido pe
-- JOIN pedido_dia pd ON pd.id_pedido   = pe.id_pedido
-- JOIN menu_dia md   ON md.id_menu_dia = pd.id_menu_dia
-- JOIN plato p       ON p.id_plato     = pd.id_plato
-- WHERE pe.id_usuario = 3
-- ORDER BY md.fecha;

-- Cruce 4 · ¿Se puede pedir ese día? → 30/10: NO (no laborable)
-- SELECT CASE
--          WHEN EXISTS (SELECT 1 FROM dia_no_laborable WHERE fecha = '2026-10-30')
--            THEN 'NO: día no laborable'
--          WHEN EXISTS (SELECT 1 FROM menu_dia WHERE fecha = '2026-10-30' AND publicado = TRUE)
--            THEN 'SÍ'
--          ELSE 'NO: todavía no hay menú publicado'
--        END AS se_puede_pedir;
