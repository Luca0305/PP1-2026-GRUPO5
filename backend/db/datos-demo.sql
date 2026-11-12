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
