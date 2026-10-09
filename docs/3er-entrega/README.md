# Entrega 3 — Frontend Codificado

**Grupo**: Grupo-5
**Proyecto**: SistemaPedidos
**TP**: Pedidos
**Fecha de entrega**: 24/09/2026

---

## 1. Tabla de capacidades

| Capacidad | Pantalla | Archivo JS | CU de E1 | Qué hace |
|---|---|---|---|---|
| 1 — Login validado | `login.html` | `assets/js/login.js` | CU-14 (Iniciar sesión) | Valida que email y contraseña no estén vacíos, que el email tenga formato válido y que la contraseña cumpla las reglas (8+ caracteres, mayúscula, minúscula, número y símbolo). Después verifica que la cuenta exista y que la contraseña coincida. Los errores salen con `notificarError()` de `utils.js` (sin `alert`). Si todo es correcto guarda la sesión y redirige a `index.html`. |
| 2 — Listado desde datos | `menu-pedido.html` | `assets/js/menu-pedido.js` | CU-02 (Consultar menú semanal) | Trae `data/platos.json` con `fetch` y arma por JavaScript las tarjetas de cada día. Solo muestra los días en que el empleado declaró asistencia. Se navega semana a semana con "Semana anterior / siguiente" sin perder lo elegido. |
| 3 — Acción del usuario | `menu-pedido.html` | `assets/js/menu-pedido.js` | CU-03 (Registrar pedido del día), CU-06 (comentarios) | Cada día tiene su propio comentario (máx. 200 caracteres, como indica el CU-06). Al guardar, arma un pedido por cada semana en la que se eligió algo, lo guarda con `guardarPedido()` (función aparte) en estado Borrador y lleva a Mis pedidos. |
| 4 — Estados de interfaz | `menu-pedido.html`, `mis-pedidos.html`, `consolidado.html`, `calendario-feriados.html` | `menu-pedido.js`, `mis-pedidos.js`, `consolidado.js`, `calendario-feriados.js` | — | Cargando, vacío y error según corresponda: sin asistencia configurada, sin menú publicado, sin pedidos, sin pedidos confirmados, o fallo del `fetch`. |
| 5 — Pantalla administrativa | `calendario-feriados.html` | `assets/js/calendario-feriados.js` | CU-16 (Gestionar calendario de feriados) | Trae `data/feriados.json`, dibuja una tarjeta por día con su estado (hábil/feriado) y permite marcar/desmarcar con `guardarCambioFeriado()` como función aparte. Desmarcar pide confirmación. Los cambios se guardan en el navegador y los días feriados dejan de ofrecer menú y pedidos a los empleados. |
| 6 — Registro de usuario | `registro.html` | `assets/js/registro.js` | CU-15 (Registrar cuenta) | Muestra los requisitos de la contraseña en vivo, un indicador de seguridad (Débil / Media / Fuerte) y avisa si la confirmación no coincide. Guarda la cuenta con rol Empleado y no permite repetir emails. |
| 7 — Asistencia semanal | `asistencia.html` | `assets/js/asistencia.js` | CU-01 (Configurar asistencia semanal) | Cada día es un checkbox; alcanza con elegir uno. Si no se marca ninguno, muestra el error. La elección se guarda por usuario y define qué días aparecen en el menú. |
| 8 — Mis pedidos | `mis-pedidos.html` | `assets/js/mis-pedidos.js` | CU-04, CU-05, CU-13 | Lista los pedidos reales del usuario. Confirmar, Modificar y Cancelar piden confirmación antes de ejecutarse. Modificar lleva al menú con la elección cargada. Respeta el horario de corte día por día: los días que ya cerraron quedan bloqueados, y Cancelar solo afecta a los días que siguen abiertos. |
| 9 — Consolidado semanal | `consolidado.html` | `assets/js/consolidado.js` | CU-09 (Generar consolidado) | Se calcula con los pedidos confirmados de todos los empleados, por semana y agrupado por día y plato, con el total semanal y el nombre de quien pidió cada restricción. "Enviar al Proveedor" pide confirmación y registra la fecha y hora del envío (CU-09, paso 6); una semana enviada no se vuelve a enviar. |
| 10 — Administrar menús | `menuadmin.html` | `assets/js/menuadmin.js` | CU-07, CU-08 | Lista las semanas con su estado (Borrador / Publicado) y siempre permite armar la siguiente. Se pueden agregar y quitar opciones, duplicar la semana anterior, guardar borrador y publicar (valida que haya platos y que todos tengan nombre, y pide confirmación). Lo publicado reemplaza al menú de `platos.json` y lo ven los empleados. Los días feriados quedan sin servicio. |
| 11 — Mi perfil | `mi-perfil.html` | `assets/js/perfil.js` | CU-17 (Actualizar perfil) | Actualiza nombre y email. Para cambiar la contraseña pide la actual y aplica las mismas reglas del registro. |
| 12 — Gestión de usuarios | `usuarios.html` | `assets/js/usuarios.js` | CU-10 (Gestionar usuarios) | El administrador da de alta cuentas, edita nombre, rol o contraseña, y activa o desactiva usuarios. Una cuenta desactivada no puede iniciar sesión (ni seguir usando una sesión abierta) pero conserva sus pedidos. Valida la contraseña con las mismas reglas, no deja repetir emails y siempre tiene que quedar un administrador activo. |

---

## 2. Decisiones del grupo

- **Organización del JS**: un archivo `.js` por pantalla, todos en `assets/js/`, más `utils.js` con lo compartido (notificaciones, diálogo de confirmación, validación de contraseñas, fechas, sesión y almacenamiento). `utils.js` se carga siempre antes del JS de cada pantalla. Esta organización mapea 1 a 1 con la tabla de capacidades y facilita que cada integrante explique "su" archivo en la defensa oral.
- **Notificaciones y confirmaciones iguales en todo el sistema**: los errores salen siempre como un cuadro rojo arriba a la derecha (`notificarError`), los avisos de éxito en verde (`notificarOk`) y las acciones delicadas piden confirmación con `confirmar()`. Todos los textos están en español.
- **Datos guardados en el navegador (`localStorage`)**: hasta tener backend, la sesión, las cuentas, la asistencia, los pedidos y los feriados se guardan en el navegador. Así las pantallas quedan conectadas en un flujo lineal: asistencia → menú → mis pedidos → consolidado. Cada función de guardado está separada para que el día de la conexión al backend pase a ser un `fetch` sin cambiar el resto del archivo.
- **Sesión y roles**: las pantallas de empleado y de administrador declaran su rol en `<body data-rol="...">`. Si no hay sesión se redirige al login, y si el rol no corresponde se vuelve al inicio con un aviso. Hay dos cuentas de prueba: `empleado@empresa.com` / `Empleado#2026` y `admin@empresa.com` / `Admin#2026`.
- **Login y registro fuera de las tarjetas del index**: el acceso quedó en un ícono de cuenta arriba a la derecha del panel de inicio. Con sesión iniciada muestra el nombre y "Cerrar sesión".
- **Semana cerrada**: cuando el administrador envía el consolidado de una semana, los empleados ya no pueden guardar, confirmar, modificar ni cancelar pedidos de esa semana. Mis pedidos lo indica y el menú queda deshabilitado.
- **Horario de corte (10:00 hs)**: cada día se cierra a las 10:00 de ese mismo día. Después de esa hora no se puede elegir, modificar, confirmar ni cancelar ese día; los demás días de la semana siguen abiertos. Cada día del pedido guarda si está confirmado, y el estado del pedido (Borrador / Confirmado / Cancelado) se deduce de eso. Un día cerrado que nunca se confirmó se descarta, y el consolidado cuenta solo los días confirmados.
- **Fechas de ejemplo relativas a hoy**: los menús y feriados de ejemplo (`platos.json`, `feriados.json`) se ubican siempre en la semana actual y la siguiente (los fines de semana, en la que viene), así el horario de corte se puede probar en cualquier momento. El feriado de ejemplo cae en el lunes de la segunda semana.
- **Pensado para celular**: ninguna pantalla se desborda en 390 px de ancho; los menús pasan a una columna y la tabla de usuarios se apila en tarjetas.
- **Estados del pedido**: un pedido nace en Borrador, pasa a Confirmado y puede cancelarse. Si se modifica un pedido ya confirmado, vuelve a Borrador hasta que se confirme de nuevo. Hay un solo pedido activo por semana y por usuario.
- **Cada rol ve lo suyo**: en el panel de inicio, el empleado solo ve las tarjetas de empleado y el administrador las de administrador.
- **Semana a semana en lugar de mes a mes**: el menú y el consolidado se navegan por semana. Para poder probarlo, `platos.json` incluye una segunda semana de platos de ejemplo.
- **Pantalla elegida para la Capacidad 5**: `calendario-feriados.html`, por ser la más simple de las candidatas (una lista de datos y una acción: marcar/desmarcar).
- **Redirección del Login**: al validar correctamente, `login.js` redirige a `index.html`, que funciona como panel de navegación del sistema.
- **Trazabilidad con la Entrega 1**: Login, Registro, Feriados y Mi perfil no tenían caso de uso en el análisis original. Se agregaron CU-14 a CU-17, RF-14 a RF-18, HU-12 a HU-15, RNF-07 y RNF-08 en `docs/1er-entrega/analisis.md`, y un diagrama actualizado (`diagrama-v2.png`). La sección 7 de ese archivo lista dónde el sistema codificado se aparta de la especificación original.
- **`novalidate` en los formularios**: se agregó a los formularios para que la validación nativa del navegador no intercepte el envío antes de que corra la validación en JavaScript.

### Limitaciones conocidas (se resuelven con el backend)

- Los datos viven en el navegador: cada navegador tiene su propio sistema. Un empleado y el administrador solo comparten información si usan el mismo navegador (cambiando de cuenta).
- Las contraseñas se guardan en texto plano en el navegador, solo para la demo. Con backend deben almacenarse con BCrypt (RNF-04).

---

## 3. Declaración de uso de IA

> Los textos entre **[COMPLETAR]** los tiene que escribir el grupo: son cosas que solo ustedes saben. Esta declaración reemplaza a la anterior ("Modo: Asistido"), que ya no describe lo que pasó.

**Modo:** **[COMPLETAR]** — elegir con la consigna de la materia y el docente. Lo que corresponde decir con honestidad: la IA no se usó solo para consultas puntuales; escribió una parte grande del código actual (ver abajo).

**Herramienta:** Claude (Anthropic), en conversaciones de chat.

**Qué hizo la IA**

| Área | Detalle |
|---|---|
| Código JavaScript | Escribió o reescribió la mayor parte de `assets/js/`: `utils.js` (sesión, validaciones, avisos, fechas, horario de corte), `login.js`, `registro.js`, `asistencia.js`, `menu-pedido.js`, `mis-pedidos.js`, `consolidado.js`, `menuadmin.js`, `calendario-feriados.js`, `perfil.js` e `index.js`. |
| Estilos y HTML | Estilos de notificaciones, diálogos, navegación por semanas y vista para celular; ajustes en los HTML (roles, ids, scripts, enlaces rotos). |
| Documentación | Ampliación de `analisis.md` (CU-14 a CU-17, RF-14 a RF-18, HU-12 a HU-15, RNF-07 y RNF-08, sección 7), `diagrama-v2.png` y este README. |
| Pruebas | `tests/checklist-manual.md`. Además, Claude escribió una primera tanda de 17 pruebas automáticas que después se descartó porque ya existía una suite más completa (ver abajo). |

**Qué hizo el grupo**

**[COMPLETAR]** — por ejemplo: el análisis de la Entrega 1, los wireframes de la Entrega 2, el HTML/CSS base, las decisiones de producto, qué cambios se pidieron y qué se revisó. (La declaración original decía que el grupo implementó la primera versión de login, menú y feriados con la IA como apoyo; confirmen si sigue siendo cierto.)

**Código de origen sin confirmar**

Estos archivos aparecieron en la carpeta de trabajo sin que Claude los escribiera. Hay que decir quién los hizo:

| Archivo | Autor |
|---|---|
| `usuarios.html` y `assets/js/usuarios.js` (gestión de usuarios) | **[COMPLETAR]** |
| Ampliación de `data/platos.json` a 5 platos por día | **[COMPLETAR]** |
| `tests/base.py`, `tests/test_cuentas.py`, `tests/test_pedidos.py`, `tests/test_administrador.py`, `tests/test_celular.py`, `tests/requirements.txt` (65 pruebas automáticas) | **[COMPLETAR]** |

**Cómo se verificó**

- 65 pruebas automáticas con navegador real (`tests/`), todas pasando. Claude las ejecutó contra el sistema actual y comprobó que detectan fallas: rompió a propósito el horario de corte y 5 de las 6 pruebas de esa área fallaron; al restaurarlo volvieron a pasar.
- Revisión visual de las pantallas en escritorio y en celular.
- Las pruebas no reemplazan entender el código: verifican que funciona, no que ustedes lo sepan explicar.

**Límites conocidos**: los datos viven en el navegador, las contraseñas se guardan en texto plano (solo demo) y no hay backend (ver sección 2).

**Nivel de comprensión del grupo** — **[COMPLETAR por integrante]**. En la defensa individual cada persona tiene que poder explicar cualquier parte. Esta tabla sirve para repartirse el estudio; el nombre de cada integrante lo ponen ustedes:

| Archivo | Pregunta que conviene poder responder | Integrante |
|---|---|---|
| `utils.js` | ¿Cómo funcionan `notificar`, `confirmar` y `iniciarPagina`? ¿Por qué se carga antes que los demás? | |
| `login.js` / `registro.js` | ¿Qué reglas valida la contraseña y en qué orden se revisan los errores? | |
| `menu-pedido.js` | ¿Cómo se dibuja el menú desde el JSON y cómo se conserva lo elegido al cambiar de semana? | |
| `mis-pedidos.js` | ¿Qué pasa con cada día cuando se confirma, modifica o cancela pasadas las 10:00? | |
| `consolidado.js` | ¿Qué pedidos cuenta el consolidado y por qué una semana enviada queda cerrada? | |
| `menuadmin.js` | ¿Cómo llega a los empleados un menú publicado? | |
| `calendario-feriados.js` | ¿Qué efecto tiene marcar un feriado en las otras pantallas? | |
| `usuarios.js` | ¿Qué reglas protegen que siempre quede un administrador activo? | |

---

## 4. Pruebas

Hay 65 pruebas automáticas y una lista de chequeo manual en `tests/` (ver `tests/README.md`):

```
pip install -r tests/requirements.txt
playwright install chromium
python -m unittest discover -s tests
```

Cubren login, registro, roles, perfil, asistencia, menú, pedidos (confirmar, modificar, cancelar), horario de corte, administración de menús, feriados, consolidado, usuarios y la vista en celular. `tests/checklist-manual.md` cubre lo que una prueba automática no ve, como el aspecto.