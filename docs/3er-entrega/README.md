# Entrega 3 — Frontend Codificado
 
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

## 3. Declaración de uso de IA

**Modo:** Asistido.

Se utilizó IA (Claude) como herramienta de consulta y apoyo durante el desarrollo del proyecto, principalmente para resolver dudas puntuales relacionadas con **JavaScript y el manejo de archivos JSON**, además de realizar algunas **correcciones menores y revisar posibles errores** en el código.

La implementación y adaptación de las funcionalidades al proyecto fueron realizadas por el grupo, utilizando la IA como apoyo para comprender algunos conceptos y solucionar dificultades que fueron surgiendo durante el desarrollo.

**Nivel de comprensión del grupo:**  
El grupo comprende de manera general el funcionamiento de las funcionalidades implementadas y puede explicar los conceptos principales utilizados. Sin embargo, reconocemos que algunas partes específicas del código todavía requieren una revisión para poder explicarlas con mayor detalle durante la defensa.