# 4ta Entrega — Backend

> **Borrador para revisar en grupo.** La columna de pantallas se armó leyendo el código del frontend (qué `.js` usa cada dato). Cada integrante tiene que poder explicarla en la defensa: revisen fila por fila y corrijan lo que no coincida con lo que ustedes saben de su frontend.

**Base**: `pp1_pedidos`. Mientras no tengamos el script oficial (`tp-pedidos.sql`), se usa [`backend/db/tp-pedidos-provisorio.sql`](../../backend/db/tp-pedidos-provisorio.sql), reconstruido a partir de las guías BK 01 y BK 02.

## Cómo carga datos nuestro frontend (contexto)

Nuestro frontend no hace un `fetch` por pantalla. [`datos.js`](../../frontend/assets/js/datos.js) lee los JSON de `data/` **una sola vez** (desde `initDB` en `core.js`) y los convierte en una estructura semanal guardada en `localStorage` (`sistemaPedidos:v1`). Las pantallas leen y escriben esa estructura. La excepción es el **catálogo de Administrar menús**, que hace su propio `fetch` cada vez que se abre la pantalla. **Desde la BK 02, ese catálogo lee de `GET /api/platos`.**

## Traducción del modelo

| Tabla | Entidad | Atributos | Relaciones | Endpoint | Pantalla de NUESTRO frontend |
|---|---|---|---|---|---|
| `usuario` | `Usuario` | `id`, `nombre`, `apellido`, `correo`, `contrasena`, `telefono`, `rol`, `activo` | — (la referencian `asistencia`, `menu_dia`, `pedido`, `notificacion`) | `/api/usuarios` | Login · Registro · Mi perfil · Usuarios (`auth.js`, `perfil.js`, `usuarios.js`, `accounts.js`). Hoy no sale de un JSON: se crea al registrarse (`localStorage`). `empresa.json` solo autoriza el email del administrador |
| `asistencia` | `Asistencia` | `id`, `idUsuario`, `fecha`, `asiste` | muchas → un `Usuario` | `/api/asistencias` | Asistencia (`asistencia.js`). También la consultan Elegir menú y Mis pedidos para mostrar solo los días presenciales |
| `dia_no_laborable` | `DiaNoLaborable` | `id`, `fecha`, `motivo` | — | `/api/dias-no-laborables` | Días sin servicio (`calendario-feriados.js`), carga inicial desde `data/dias-no-laborables.json`. Lo respetan Elegir menú y Administrar menús |
| `menu_dia` | `MenuDia` | `id`, `fecha`, `descripcion`, `publicado`, `idUsuarioCreador` | muchos → un `Usuario` · uno → muchos `MenuPlato` | `/api/menus` | Administrar menús (`menuadmin.js`) y Elegir menú (`menu-pedido.js`), carga inicial desde `data/menus.json` |
| `plato` | `Plato` | `id`, `nombre`, `descripcion`, `imagen`, `categoria` | — (la referencian `menu_plato`, `pedido_dia`) | `/api/platos` | **Administrar menús · catálogo** (`menuadmin.js` → `cargarPlatosDesdeAPI()`, ya conectado al backend). Carga inicial de opciones desde `data/platos.json` |
| `menu_plato` | `MenuPlato` | `id`, `idMenuDia`, `idPlato`, `stockDisponible` | muchos → un `MenuDia` · muchos → un `Plato` | `/api/menu-platos` | Elegir menú (opciones y porciones disponibles, `menu-pedido.js`) y Administrar menús (stock por opción), carga inicial desde `data/menu-platos.json` |
| `pedido` | `Pedido` | `id`, `idUsuario`, `fechaPedido`, `estado` | muchos → un `Usuario` · uno → muchos `PedidoDia` | `/api/pedidos` | Elegir menú (guardar borrador, `saveOrder` en `core.js`) y Mis pedidos (confirmar, modificar, cancelar, `mis-pedidos.js`) |
| `pedido_dia` | `PedidoDia` | `id`, `idPedido`, `idMenuDia`, `idPlato`, `fechaEntrega`, `comentario` | muchos → un `Pedido`, un `MenuDia`, un `Plato` | `/api/pedidos/{id}/dias` | Elegir menú (plato y comentario de cada día) y Mis pedidos (`mis-pedidos.js`) |
| `notificacion` | `Notificacion` | `id`, `idUsuario`, `fechaEnvio`, `asunto`, `mensaje` | muchas → un `Usuario` | — (fuera de alcance) | sin pantalla |
| *(consulta)* | — | `plato`, `porciones` | cruce 2 | `/api/consolidado?fecha=…` | Consolidado (`consolidado.js`): agrupa pedidos confirmados, CSV e impresión |

## Cruces

- **Cruce 1 · Menú publicado de un día** → Elegir menú (`menu-pedido.js`). Espera por opción: nombre, descripción, categoría y porciones disponibles.
- **Cruce 2 · Consolidado de una fecha** → Consolidado (`consolidado.js`). Espera: plato y porciones; cuenta solo pedidos **confirmados**.
- **Cruce 3 · Mis pedidos** → Mis pedidos (`mis-pedidos.js`). Espera por día: fecha, plato, comentario y estado.
- **Cruce 4 · ¿Se puede pedir ese día?** → Elegir menú (no ofrece días sin servicio o sin menú publicado) y Días sin servicio (`calendario-feriados.js`). En nuestro frontend la regla está en `validateOrder` de `core.js`; en el backend va en el **servicio**.

## Divergencias a corregir

| Dónde | Nuestro frontend | Modelo | Qué hacer |
|---|---|---|---|
| `data/platos.json` | `id` texto (`"p1"`) | `id` numérico (`BIGINT` → `Long`) | Pasar a números cuando la carga inicial venga del backend |
| `data/platos.json` | sin `imagen`; las fotos van por plantilla | `imagen` | Agregar la clave o justificar (las fotos están en `assets/img/platos/`) |
| `data/platos.json` | `categoria` con claves internas (`carnes`, `pastas`, `minutas`…) | `categoria` texto libre (el script usa `clásico`, `pastas`…) | La clave coincide; acordar los valores. Hoy una categoría desconocida se muestra como "Otros" |
| `data/menus.json`, `data/menu-platos.json` | `id` texto (`"menu-2026-10-12"`, `"menu-2026-10-12-p1"`) | `id` numérico | Igual que platos |
| `data/dias-no-laborables.json` | sin `id` en los elementos (la lista está vacía) | `id`, `fecha`, `motivo` | Al cargar uno, incluir `id` |
| Usuarios (`core.js`, `localStorage`) | `firstName`, `lastName`, `email`, `role`, `active` | `nombre`, `apellido`, `correo`, `rol`, `activo` | Renombrar al conectar `/api/usuarios` |
| Usuarios | `role`: `empleado` / `admin` | `rol`: `EMPLEADO` / `ADMINISTRADOR` | Mapear o pasar a mayúsculas |
| Usuarios | sin `telefono` | `telefono` (opcional) | Agregar al perfil o dejarlo vacío |
| Pedidos (`core.js`) | un pedido por fecha: `userId`, `date`, `optionId`, `comment`, `status` | `pedido` (cabecera) + `pedido_dia` (una fila por día) | Reorganizar al conectar `/api/pedidos` |
| Pedidos | `status`: `Borrador` / `Confirmado` / `Cancelado` | `estado`: `BORRADOR` / `CONFIRMADO` / `CANCELADO` | Pasar a mayúsculas |
| Asistencia | `attendance[userId][semana]` = lista de fechas que asiste | una fila por fecha con `asiste` verdadero o falso | Reorganizar al conectar `/api/asistencias` |
| Menús | estado por **semana** (`Publicado` / `Borrador`) | `publicado` por **día** | El frontend exige el mismo estado en toda la semana; el modelo lo permite por día |

## Backend (BK 02)

| Pieza | Archivo |
|---|---|
| Configuración | [`application.properties`](../../backend/src/main/resources/application.properties): `pp1_pedidos`, `ddl-auto=validate`, contraseña en `DB_PASSWORD` |
| Entidad | [`entidad/Plato.java`](../../backend/src/main/java/com/grupo5/pedidos/entidad/Plato.java) |
| Repositorio | [`repositorio/PlatoRepository.java`](../../backend/src/main/java/com/grupo5/pedidos/repositorio/PlatoRepository.java) |
| Controller | [`controlador/PlatoController.java`](../../backend/src/main/java/com/grupo5/pedidos/controlador/PlatoController.java): `GET /api/platos` y `GET /api/platos/{id}` |
| CORS | [`config/CorsConfig.java`](../../backend/src/main/java/com/grupo5/pedidos/config/CorsConfig.java): Live Server 5500/5502 y `npm start` 4173 |

Mantuvimos el paquete `com.grupo5.pedidos` del esqueleto de Initializr que ya teníamos (el aviso para G5 de la guía BK 02 indica reutilizarlo); la guía usa `ar.edu.pp1.pedidos` como ejemplo.
