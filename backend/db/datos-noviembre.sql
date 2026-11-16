-- =====================================================================
-- Datos de NOVIEMBRE para la demo (Grupo 5) — se corre DESPUÉS de datos-demo.sql
-- =====================================================================
-- Devolución E4: "la asistencia es de octubre y hay muy pocos pedidos".
-- Este archivo AGREGA (no cambia nada de lo anterior):
--   · 6 empleados más (ids 6 a 11), con contraseña 'cambiar123' igual que
--     los del script (texto plano a propósito: el login los compara tal cual;
--     las cuentas nuevas que se registran se guardan como huella PBKDF2),
--   · asistencia de 9 empleados (Lucía, Diego, Carolina y los 6 nuevos) para
--     todos los días hábiles con menú del 11/11 al 30/11 (el 20/11 es feriado),
--   · un pedido por empleado y por semana, casi todos CONFIRMADOS, para que
--     el consolidado tenga qué contar apenas se abre.
--     Dos quedan en BORRADOR (Diego y Tomás, semana del 23/11): NO cuentan.
--
-- Martín (id 2) queda SIN datos de noviembre a propósito: es el usuario del
-- recorrido de la demo (marca sus días y pide en vivo).
-- Cada plato es una opción del menú de ese día (se busca por nombre y fecha),
-- y fecha_entrega es la fecha de ese menú, igual que en el script.
--
-- CÓMO CORRERLO: tp-pedidos.sql → datos-demo.sql → este archivo (o directamente
-- pp1_pedidos-completo.sql, que ya trae los tres).
-- =====================================================================

INSERT INTO usuario (id_usuario, nombre, apellido, correo, contrasena, telefono, rol, activo) VALUES
  (6, 'Sofía', 'Medina', 'sofia.medina@empresa.com.ar', 'cambiar123', '11 4789-1234', 'EMPLEADO', TRUE),
  (7, 'Javier', 'Ruiz', 'javier.ruiz@empresa.com.ar', 'cambiar123', '11 5890-2345', 'EMPLEADO', TRUE),
  (8, 'Valentina', 'Acosta', 'valentina.acosta@empresa.com.ar', 'cambiar123', NULL, 'EMPLEADO', TRUE),
  (9, 'Nicolás', 'Herrera', 'nicolas.herrera@empresa.com.ar', 'cambiar123', '11 6901-3456', 'EMPLEADO', TRUE),
  (10, 'Florencia', 'Castro', 'florencia.castro@empresa.com.ar', 'cambiar123', '11 3012-4567', 'EMPLEADO', TRUE),
  (11, 'Tomás', 'Ríos', 'tomas.rios@empresa.com.ar', 'cambiar123', NULL, 'EMPLEADO', TRUE);

-- Asistencia: una fila por empleado y por día (asiste TRUE o FALSE).
INSERT INTO asistencia (id_asistencia, id_usuario, fecha, asiste) VALUES
  (17, 3, '2026-11-11', TRUE),
  (18, 3, '2026-11-12', FALSE),
  (19, 3, '2026-11-13', TRUE),
  (20, 4, '2026-11-11', TRUE),
  (21, 4, '2026-11-12', TRUE),
  (22, 4, '2026-11-13', TRUE),
  (23, 5, '2026-11-11', TRUE),
  (24, 5, '2026-11-12', TRUE),
  (25, 5, '2026-11-13', TRUE),
  (26, 6, '2026-11-11', TRUE),
  (27, 6, '2026-11-12', TRUE),
  (28, 6, '2026-11-13', FALSE),
  (29, 7, '2026-11-11', TRUE),
  (30, 7, '2026-11-12', TRUE),
  (31, 7, '2026-11-13', TRUE),
  (32, 8, '2026-11-11', FALSE),
  (33, 8, '2026-11-12', TRUE),
  (34, 8, '2026-11-13', TRUE),
  (35, 9, '2026-11-11', TRUE),
  (36, 9, '2026-11-12', TRUE),
  (37, 9, '2026-11-13', TRUE),
  (38, 10, '2026-11-11', TRUE),
  (39, 10, '2026-11-12', TRUE),
  (40, 10, '2026-11-13', TRUE),
  (41, 11, '2026-11-11', TRUE),
  (42, 11, '2026-11-12', TRUE),
  (43, 11, '2026-11-13', TRUE),
  (44, 3, '2026-11-16', TRUE),
  (45, 3, '2026-11-17', TRUE),
  (46, 3, '2026-11-18', TRUE),
  (47, 3, '2026-11-19', TRUE),
  (48, 4, '2026-11-16', TRUE),
  (49, 4, '2026-11-17', FALSE),
  (50, 4, '2026-11-18', TRUE),
  (51, 4, '2026-11-19', TRUE),
  (52, 5, '2026-11-16', FALSE),
  (53, 5, '2026-11-17', TRUE),
  (54, 5, '2026-11-18', TRUE),
  (55, 5, '2026-11-19', TRUE),
  (56, 6, '2026-11-16', TRUE),
  (57, 6, '2026-11-17', TRUE),
  (58, 6, '2026-11-18', TRUE),
  (59, 6, '2026-11-19', TRUE),
  (60, 7, '2026-11-16', TRUE),
  (61, 7, '2026-11-17', TRUE),
  (62, 7, '2026-11-18', FALSE),
  (63, 7, '2026-11-19', TRUE),
  (64, 8, '2026-11-16', TRUE),
  (65, 8, '2026-11-17', TRUE),
  (66, 8, '2026-11-18', TRUE),
  (67, 8, '2026-11-19', FALSE),
  (68, 9, '2026-11-16', TRUE),
  (69, 9, '2026-11-17', TRUE),
  (70, 9, '2026-11-18', TRUE),
  (71, 9, '2026-11-19', TRUE),
  (72, 10, '2026-11-16', TRUE),
  (73, 10, '2026-11-17', TRUE),
  (74, 10, '2026-11-18', TRUE),
  (75, 10, '2026-11-19', TRUE),
  (76, 11, '2026-11-16', TRUE),
  (77, 11, '2026-11-17', FALSE),
  (78, 11, '2026-11-18', TRUE),
  (79, 11, '2026-11-19', TRUE),
  (80, 3, '2026-11-23', TRUE),
  (81, 3, '2026-11-24', FALSE),
  (82, 3, '2026-11-25', TRUE),
  (83, 3, '2026-11-26', TRUE),
  (84, 3, '2026-11-27', TRUE),
  (85, 4, '2026-11-23', TRUE),
  (86, 4, '2026-11-24', TRUE),
  (87, 4, '2026-11-25', TRUE),
  (88, 4, '2026-11-26', TRUE),
  (89, 4, '2026-11-27', TRUE),
  (90, 5, '2026-11-23', TRUE),
  (91, 5, '2026-11-24', TRUE),
  (92, 5, '2026-11-25', FALSE),
  (93, 5, '2026-11-26', TRUE),
  (94, 5, '2026-11-27', TRUE),
  (95, 6, '2026-11-23', TRUE),
  (96, 6, '2026-11-24', TRUE),
  (97, 6, '2026-11-25', TRUE),
  (98, 6, '2026-11-26', TRUE),
  (99, 6, '2026-11-27', FALSE),
  (100, 7, '2026-11-23', TRUE),
  (101, 7, '2026-11-24', TRUE),
  (102, 7, '2026-11-25', TRUE),
  (103, 7, '2026-11-26', TRUE),
  (104, 7, '2026-11-27', TRUE),
  (105, 8, '2026-11-23', TRUE),
  (106, 8, '2026-11-24', TRUE),
  (107, 8, '2026-11-25', TRUE),
  (108, 8, '2026-11-26', FALSE),
  (109, 8, '2026-11-27', TRUE),
  (110, 9, '2026-11-23', TRUE),
  (111, 9, '2026-11-24', TRUE),
  (112, 9, '2026-11-25', TRUE),
  (113, 9, '2026-11-26', TRUE),
  (114, 9, '2026-11-27', TRUE),
  (115, 10, '2026-11-23', FALSE),
  (116, 10, '2026-11-24', TRUE),
  (117, 10, '2026-11-25', TRUE),
  (118, 10, '2026-11-26', TRUE),
  (119, 10, '2026-11-27', TRUE),
  (120, 11, '2026-11-23', TRUE),
  (121, 11, '2026-11-24', TRUE),
  (122, 11, '2026-11-25', TRUE),
  (123, 11, '2026-11-26', TRUE),
  (124, 11, '2026-11-27', TRUE),
  (125, 3, '2026-11-30', TRUE),
  (126, 4, '2026-11-30', TRUE),
  (127, 5, '2026-11-30', TRUE),
  (128, 6, '2026-11-30', TRUE),
  (129, 7, '2026-11-30', TRUE),
  (130, 8, '2026-11-30', TRUE),
  (131, 9, '2026-11-30', TRUE),
  (132, 10, '2026-11-30', TRUE),
  (133, 11, '2026-11-30', FALSE);

-- Pedidos: la cabecera es la semana del empleado.
INSERT INTO pedido (id_pedido, id_usuario, fecha_pedido, estado) VALUES
  (5, 3, '2026-11-10', 'CONFIRMADO'),
  (6, 4, '2026-11-10', 'CONFIRMADO'),
  (7, 5, '2026-11-10', 'CONFIRMADO'),
  (8, 6, '2026-11-10', 'CONFIRMADO'),
  (9, 7, '2026-11-10', 'CONFIRMADO'),
  (10, 8, '2026-11-10', 'CONFIRMADO'),
  (11, 9, '2026-11-10', 'CONFIRMADO'),
  (12, 10, '2026-11-10', 'CONFIRMADO'),
  (13, 11, '2026-11-10', 'CONFIRMADO'),
  (14, 3, '2026-11-13', 'CONFIRMADO'),
  (15, 4, '2026-11-13', 'CONFIRMADO'),
  (16, 5, '2026-11-13', 'CONFIRMADO'),
  (17, 6, '2026-11-13', 'CONFIRMADO'),
  (18, 7, '2026-11-13', 'CONFIRMADO'),
  (19, 8, '2026-11-13', 'CONFIRMADO'),
  (20, 9, '2026-11-13', 'CONFIRMADO'),
  (21, 10, '2026-11-13', 'CONFIRMADO'),
  (22, 11, '2026-11-13', 'CONFIRMADO'),
  (23, 3, '2026-11-19', 'CONFIRMADO'),
  (24, 4, '2026-11-19', 'BORRADOR'),
  (25, 5, '2026-11-19', 'CONFIRMADO'),
  (26, 6, '2026-11-19', 'CONFIRMADO'),
  (27, 7, '2026-11-19', 'CONFIRMADO'),
  (28, 8, '2026-11-19', 'CONFIRMADO'),
  (29, 9, '2026-11-19', 'CONFIRMADO'),
  (30, 10, '2026-11-19', 'CONFIRMADO'),
  (31, 11, '2026-11-19', 'BORRADOR'),
  (32, 3, '2026-11-27', 'CONFIRMADO'),
  (33, 4, '2026-11-27', 'CONFIRMADO'),
  (34, 5, '2026-11-27', 'CONFIRMADO'),
  (35, 6, '2026-11-27', 'CONFIRMADO'),
  (36, 7, '2026-11-27', 'CONFIRMADO'),
  (37, 8, '2026-11-27', 'CONFIRMADO'),
  (38, 9, '2026-11-27', 'CONFIRMADO'),
  (39, 10, '2026-11-27', 'CONFIRMADO');

-- Una línea por día que viene (los días con asiste = FALSE no tienen pedido).
INSERT INTO pedido_dia (id_pedido_dia, id_pedido, id_menu_dia, id_plato, fecha_entrega, comentario) VALUES
  -- Pedido 5 · Lucía · semana del 9/11 (mié 11 a vie 13)
  (13, 5, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-11', NULL),
  (14, 5, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-13', NULL),
  -- Pedido 6 · Diego · semana del 9/11 (mié 11 a vie 13)
  (15, 6, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al horno con papas'), '2026-11-11', 'Sin cebolla'),
  (16, 6, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Carne al horno con papas'), '2026-11-12', NULL),
  (17, 6, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Fideos al pesto'), '2026-11-13', NULL),
  -- Pedido 7 · Carolina · semana del 9/11 (mié 11 a vie 13)
  (18, 7, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-11', NULL),
  (19, 7, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Lasaña de carne'), '2026-11-12', NULL),
  (20, 7, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Risotto de hongos'), '2026-11-13', NULL),
  -- Pedido 8 · Sofía · semana del 9/11 (mié 11 a vie 13)
  (21, 8, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Ravioles de ricota con salsa mixta'), '2026-11-11', NULL),
  (22, 8, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Berenjenas a la napolitana'), '2026-11-12', NULL),
  -- Pedido 9 · Javier · semana del 9/11 (mié 11 a vie 13)
  (23, 9, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Wok de vegetales'), '2026-11-11', NULL),
  (24, 9, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-12', NULL),
  (25, 9, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-13', 'Porción chica'),
  -- Pedido 10 · Valentina · semana del 9/11 (mié 11 a vie 13)
  (26, 10, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Carne al horno con papas'), '2026-11-12', 'Sin picante'),
  (27, 10, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al verdeo con puré'), '2026-11-13', NULL),
  -- Pedido 11 · Nicolás · semana del 9/11 (mié 11 a vie 13)
  (28, 11, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-11', 'Aderezo aparte'),
  (29, 11, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-12', NULL),
  (30, 11, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Albóndigas con arroz'), '2026-11-13', NULL),
  -- Pedido 12 · Florencia · semana del 9/11 (mié 11 a vie 13)
  (31, 12, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-11', NULL),
  (32, 12, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Guiso de lentejas'), '2026-11-12', NULL),
  (33, 12, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-13', NULL),
  -- Pedido 13 · Tomás · semana del 9/11 (mié 11 a vie 13)
  (34, 13, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-11'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al horno con papas'), '2026-11-11', NULL),
  (35, 13, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-12'), (SELECT id_plato FROM plato WHERE nombre = 'Carne al horno con papas'), '2026-11-12', NULL),
  (36, 13, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-13'), (SELECT id_plato FROM plato WHERE nombre = 'Fideos al pesto'), '2026-11-13', NULL),
  -- Pedido 14 · Lucía · semana del 16/11 (vie 20 es feriado)
  (37, 14, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Locro criollo'), '2026-11-16', NULL),
  (38, 14, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-17', 'Sin cebolla'),
  (39, 14, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-18', NULL),
  (40, 14, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Albóndigas con arroz'), '2026-11-19', NULL),
  -- Pedido 15 · Diego · semana del 16/11 (vie 20 es feriado)
  (41, 15, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-16', 'Con pan'),
  (42, 15, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Guiso de lentejas'), '2026-11-18', NULL),
  (43, 15, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-19', NULL),
  -- Pedido 16 · Carolina · semana del 16/11 (vie 20 es feriado)
  (44, 16, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al horno con papas'), '2026-11-17', NULL),
  (45, 16, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Carne al horno con papas'), '2026-11-18', NULL),
  (46, 16, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Canelones de verdura'), '2026-11-19', NULL),
  -- Pedido 17 · Sofía · semana del 16/11 (vie 20 es feriado)
  (47, 17, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Estofado de carne con papas'), '2026-11-16', NULL),
  (48, 17, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-17', NULL),
  (49, 17, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Sorrentinos de jamón y queso'), '2026-11-18', NULL),
  (50, 17, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Empanadas de humita (3)'), '2026-11-19', 'Porción chica'),
  -- Pedido 18 · Javier · semana del 16/11 (vie 20 es feriado)
  (51, 18, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-16', NULL),
  (52, 18, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Tallarines con bolognesa'), '2026-11-17', NULL),
  (53, 18, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al verdeo con puré'), '2026-11-19', NULL),
  -- Pedido 19 · Valentina · semana del 16/11 (vie 20 es feriado)
  (54, 19, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Ñoquis con salsa fileto'), '2026-11-16', NULL),
  (55, 19, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Tortilla de papas'), '2026-11-17', 'Aderezo aparte'),
  (56, 19, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-18', NULL),
  -- Pedido 20 · Nicolás · semana del 16/11 (vie 20 es feriado)
  (57, 20, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Tarta de verdura'), '2026-11-16', 'Sin cebolla'),
  (58, 20, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-17', NULL),
  (59, 20, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Carne al horno con papas'), '2026-11-18', NULL),
  (60, 20, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al verdeo con puré'), '2026-11-19', NULL),
  -- Pedido 21 · Florencia · semana del 16/11 (vie 20 es feriado)
  (61, 21, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Locro criollo'), '2026-11-16', NULL),
  (62, 21, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-17'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-17', NULL),
  (63, 21, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-18', NULL),
  (64, 21, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Albóndigas con arroz'), '2026-11-19', NULL),
  -- Pedido 22 · Tomás · semana del 16/11 (vie 20 es feriado)
  (65, 22, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-16'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-16', NULL),
  (66, 22, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-18'), (SELECT id_plato FROM plato WHERE nombre = 'Guiso de lentejas'), '2026-11-18', NULL),
  (67, 22, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-19'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-19', 'Sin sal'),
  -- Pedido 23 · Lucía · semana del 23/11
  (68, 23, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Locro criollo'), '2026-11-23', NULL),
  (69, 23, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-25', NULL),
  (70, 23, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Albóndigas con arroz'), '2026-11-26', NULL),
  (71, 23, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-27', 'Con pan'),
  -- Pedido 24 · Diego · semana del 23/11 · BORRADOR
  (72, 24, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-23', NULL),
  (73, 24, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-24', NULL),
  (74, 24, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Guiso de lentejas'), '2026-11-25', NULL),
  (75, 24, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-26', 'Sin sal'),
  (76, 24, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Tallarines con bolognesa'), '2026-11-27', NULL),
  -- Pedido 25 · Carolina · semana del 23/11
  (77, 25, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Locro criollo'), '2026-11-23', NULL),
  (78, 25, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al horno con papas'), '2026-11-24', NULL),
  (79, 25, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Ñoquis con salsa fileto'), '2026-11-26', NULL),
  (80, 25, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Tortilla de papas'), '2026-11-27', NULL),
  -- Pedido 26 · Sofía · semana del 23/11
  (81, 26, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Estofado de carne con papas'), '2026-11-23', NULL),
  (82, 26, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-24', 'Sin picante'),
  (83, 26, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Fideos al pesto'), '2026-11-25', NULL),
  (84, 26, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Tarta de verdura'), '2026-11-26', NULL),
  -- Pedido 27 · Javier · semana del 23/11
  (85, 27, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-23', 'Aderezo aparte'),
  (86, 27, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Lasaña de carne'), '2026-11-24', NULL),
  (87, 27, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Risotto de hongos'), '2026-11-25', NULL),
  (88, 27, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al verdeo con puré'), '2026-11-26', NULL),
  (89, 27, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-27', NULL),
  -- Pedido 28 · Valentina · semana del 23/11
  (90, 28, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Ravioles de ricota con salsa mixta'), '2026-11-23', NULL),
  (91, 28, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Berenjenas a la napolitana'), '2026-11-24', NULL),
  (92, 28, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-25', NULL),
  (93, 28, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Locro criollo'), '2026-11-27', 'Sin cebolla'),
  -- Pedido 29 · Nicolás · semana del 23/11
  (94, 29, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Wok de vegetales'), '2026-11-23', NULL),
  (95, 29, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-24', NULL),
  (96, 29, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Carne al horno con papas'), '2026-11-25', NULL),
  (97, 29, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al verdeo con puré'), '2026-11-26', 'Con pan'),
  (98, 29, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Estofado de carne con papas'), '2026-11-27', NULL),
  -- Pedido 30 · Florencia · semana del 23/11
  (99, 30, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-24', NULL),
  (100, 30, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Pastel de papa'), '2026-11-25', 'Sin sal'),
  (101, 30, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Albóndigas con arroz'), '2026-11-26', NULL),
  (102, 30, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-27', NULL),
  -- Pedido 31 · Tomás · semana del 23/11 · BORRADOR
  (103, 31, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-23'), (SELECT id_plato FROM plato WHERE nombre = 'Matambre a la pizza'), '2026-11-23', NULL),
  (104, 31, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-24'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-24', 'Porción chica'),
  (105, 31, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-25'), (SELECT id_plato FROM plato WHERE nombre = 'Guiso de lentejas'), '2026-11-25', NULL),
  (106, 31, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-26'), (SELECT id_plato FROM plato WHERE nombre = 'Bondiola braseada con batatas'), '2026-11-26', NULL),
  (107, 31, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-27'), (SELECT id_plato FROM plato WHERE nombre = 'Tallarines con bolognesa'), '2026-11-27', NULL),
  -- Pedido 32 · Lucía · lunes 30/11
  (108, 32, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-30', NULL),
  -- Pedido 33 · Diego · lunes 30/11
  (109, 33, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-30', NULL),
  -- Pedido 34 · Carolina · lunes 30/11
  (110, 34, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-30', 'Sin picante'),
  -- Pedido 35 · Sofía · lunes 30/11
  (111, 35, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Pollo al horno con papas'), '2026-11-30', NULL),
  -- Pedido 36 · Javier · lunes 30/11
  (112, 36, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Bife de chorizo con ensalada'), '2026-11-30', NULL),
  -- Pedido 37 · Valentina · lunes 30/11
  (113, 37, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Sorrentinos de jamón y queso'), '2026-11-30', NULL),
  -- Pedido 38 · Nicolás · lunes 30/11
  (114, 38, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa de soja con ensalada'), '2026-11-30', NULL),
  -- Pedido 39 · Florencia · lunes 30/11
  (115, 39, (SELECT id_menu_dia FROM menu_dia WHERE fecha = '2026-11-30'), (SELECT id_plato FROM plato WHERE nombre = 'Milanesa con puré'), '2026-11-30', 'Porción chica');

-- Verificación (después de correr los tres archivos):
-- SELECT COUNT(*) FROM usuario;     -- 11  (5 del script + 6 nuevos)
-- SELECT COUNT(*) FROM asistencia;  -- 133  (16 del script + 117 de noviembre)
-- SELECT COUNT(*) FROM pedido;      -- 39  (4 del script + 35 de noviembre)
-- SELECT COUNT(*) FROM pedido_dia;  -- 115  (12 del script + 93 confirmadas + 10 en borrador)
