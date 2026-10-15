# Entrega 3 — Frontend Codificado

> Registro histórico de esta entrega. Para ejecutar y probar la versión integrada, ver el [README principal](../../README.md).
 
**Grupo**: Grupo-5
**Proyecto**: SistemaPedidos
**TP**: Pedidos
**Fecha de entrega**: 24/09/2026
 
---
 
## 1. Tabla de capacidades
 
| Capacidad | Pantalla | Archivo JS | CU de E1 | Qué hace |
|---|---|---|---|---|
| 1 — Login validado | `login.html` | `assets/js/login.js` | CU relacionado al inicio de sesión | Valida que email y contraseña no estén vacíos y que el email tenga formato válido. Muestra el error en un `<p id="login-error">` (sin `alert`). Si los datos son válidos, redirige a `index.html`. |
| 2 — Listado desde datos | `menu-pedido.html` | `assets/js/menu-pedido.js` | CU-02 (Consultar menú semanal) | Trae `data/platos.json` con `fetch` y arma las tarjetas de Lunes/Martes/Jueves por JavaScript — el HTML solo tiene el contenedor vacío (`#menu-semana-contenido`). |
| 3 — Acción del usuario | `menu-pedido.html` | `assets/js/menu-pedido.js` | CU-03 (Registrar pedido del día) | Al enviar el formulario, arma el objeto del pedido, lo guarda con `guardarPedido()` (función aparte) y lo agrega a una lista en pantalla (`#pedidos-lista`) sin recargar la página. |
| 4 — Estados de interfaz | `menu-pedido.html` | `assets/js/menu-pedido.js` | — | `#menu-estado` muestra "Cargando…", "Todavía no hay menú publicado" (vacío) o el mensaje de error, según cómo responda el `fetch`. |
| 5 — Pantalla administrativa | `calendario-feriados.html` | `assets/js/calendario-feriados.js` | Sin CU propio en E1 (ver Decisiones) | Trae `data/feriados.json`, dibuja una tarjeta por día con su estado (hábil/feriado), y permite marcar/desmarcar un día como feriado con `guardarCambioFeriado()` como función aparte. |
 
---
 
## 2. Decisiones del grupo
 
- **Organización del JS**: un archivo `.js` por pantalla (`login.js`, `menu-pedido.js`, `calendario-feriados.js`), todos en `assets/js/`. Elegimos esta organización porque mapea 1 a 1 con la tabla de capacidades de arriba, y porque hace más fácil que cada integrante explique "su" archivo en la defensa oral.
- **Pantalla elegida para la Capacidad 5**: `calendario-feriados.html`. La elegimos por ser la más simple de las tres candidatas (Consolidado, Administrar menús, Calendario de feriados): una sola lista de datos y una sola acción (marcar/desmarcar), sin la lógica de agregación de Consolidado ni los múltiples formularios por día de Administrar menús.
- **Redirección del Login**: al validar correctamente, `login.js` redirige a `index.html` porque es la pantalla que funciona como panel de navegación del sistema — no hay todavía un "home" propio de Empleado/Administrador distinto del índice de pantallas.
- **Gap de trazabilidad — Calendario de feriados sin CU**: esta pantalla no tiene un caso de uso definido en la Entrega 1 (no está entre los CU-01 a CU-13). Se detectó al momento de armar la pantalla y se decidió avanzar igual, dejando pendiente sumar el CU correspondiente a la documentación de E1 antes de la Exposición Final.
- **`novalidate` en el formulario de Login**: se agregó el atributo `novalidate` al `<form>` de `login.html` para que la validación nativa del navegador no intercepte el envío antes de que corra la validación en JavaScript.
---
 
## 3. Declaración de uso de IA

**Modo:** Asistido.

Se utilizó IA (Claude) como herramienta de consulta y apoyo durante el desarrollo del proyecto, principalmente para resolver dudas puntuales relacionadas con **JavaScript y el manejo de archivos JSON**, además de realizar algunas **correcciones menores y revisar posibles errores** en el código.

La implementación y adaptación de las funcionalidades al proyecto fueron realizadas por el grupo, utilizando la IA como apoyo para comprender algunos conceptos y solucionar dificultades que fueron surgiendo durante el desarrollo.

**Nivel de comprensión del grupo:**  
El grupo comprende de manera general el funcionamiento de las funcionalidades implementadas y puede explicar los conceptos principales utilizados. Sin embargo, reconocemos que algunas partes específicas del código todavía requieren una revisión para poder explicarlas con mayor detalle durante la defensa.

## Actualización de la versión integrada · 15/10/2026

Las secciones anteriores describen la entrega histórica de septiembre. Para el código actual rige esta tabla; no confundir `login.js` histórico con `auth.js`, ni `feriados.json` antiguo con `dias-no-laborables.json`.

| Pantalla / capacidad | Archivo actual (assets/js) | CU E1 | Comportamiento actual |
| --- | --- | --- | --- |
| Login / capacidad 1 | auth.js, validation.js | Precondición común | Valida y consulta cuenta local; redirige por rol |
| Menú / capacidades 2 y 4 | menu-pedido.js, core.js, datos.js, app.js | CU-02 | Inicializa JSON relacionados y renderiza días/platos; carga/error compartidos, estados de falta de menú/asistencia/servicio |
| Pedido / capacidad 3 | menu-pedido.js, core.js | CU-03, CU-06, CU-12 | `saveOrder` separado, borrador y resumen en la misma pantalla |
| Feriados / capacidad 5 | calendario-feriados.js, core.js | Extensión CU-14 | Lista ordenada, alta, edición, eliminación lógica del cierre y validación |
| Asistencia | asistencia.js | CU-01 | Guarda días por empleado y semana; enlaza al menú |
| Mis pedidos | mis-pedidos.js | CU-04, CU-05, CU-12, CU-13 | Confirma, modifica, cancela y muestra pendientes |
| Consolidado | consolidado.js | CU-09 | Agrupa confirmados, CSV e impresión |
| Administrar menús | menuadmin.js | CU-07, CU-08 | Catálogo con fetch/estados, selección múltiple, borrador, publicación y semanas guardadas |
| Registro | auth.js, core.js | Sin CU específico en E1 | Nombre, apellido, email, contraseña; rol asignado; vuelve al login |
| Mi perfil | perfil.js, accounts.js | Sin CU específico en E1 | Edita datos y contraseña; fechas fijas DD/MM/AAAA |
| Usuarios | usuarios.js, accounts.js | CU-10 | Autoriza roles y activa/desactiva cuentas |
| Recuperación | recuperacion.js, recovery.js | Extensión del responsable | Enlace simulado de un uso, vencimiento y cambio efectivo |

La persistencia local, registro del administrador autorizado y modelo semanal son adaptaciones al recorrido solicitado por el responsable; **no son una reproducción literal de la guía 18**. El README principal describe el alcance del prototipo.

### Declaración de IA de esta actualización

Se utilizó IA como apoyo para explicar conceptos, implementar ajustes y revisar el funcionamiento de la versión integrada.
