# 4ta Entrega — Backend integrado · Grupo 5 · TP Pedidos de Almuerzo

El flujo principal funciona **desde la pantalla, contra el backend Spring Boot y la base MySQL `pp1_pedidos`**: lo que se guarda se ve en la pantalla, sale de MySQL y sigue ahí después de recargar.

## Módulos alcanzados

| Módulo | Qué hace | Pantalla | Estado | Tag |
|---|---|---|---|---|
| **M1 · Acceso** | Registro, login y recuperar contraseña contra la tabla `usuario` | `login.html`, `registro.html`, `recuperar.html`, `restablecer.html` | ✅ | `m1-ok` |
| **M2 · Mis días** | Elegir y guardar los días que asiste | `asistencia.html` | ✅ | `m2-ok` |
| **M3 · Mis menús** | Ver los menús **publicados** de esos días, con porciones disponibles | `menu-pedido.html` | ✅ | `m3-ok` |
| **M4 · Mi pedido** | Una opción por día, en `BORRADOR`; además confirmar, cancelar y quitar un día | `menu-pedido.html`, `mis-pedidos.html` | ✅ | `m4-ok` |
| **M5 · Consolidado** | Porciones por plato y día (solo `CONFIRMADO`), solo lectura, solo administrador | `consolidado.html` | ✅ | `m5-ok` |
| **Destacado** | Regla de negocio con test JUnit: la hora de corte (`ReglaHorarioTest`) | — | ✅ | — |
| **Mejora** | Hora de corte **configurable** (`pedidos.hora-corte` en `application.properties`) | todas | ✅ | — |
| **Mejora** | **Pedido fuera de horario**: el administrador carga el pedido de un empleado que no llegó a pedir (queda confirmado, con un cartel de confirmación antes de guardar) | `pedido-fuera-de-horario.html` | ✅ | — |
| **Mejora** | **Precarga de asistencia**: si la semana no tiene nada guardado, vienen tildados los días de la semana anterior (la primera vez, lunes a viernes). No se guarda hasta apretar *Guardar* | `asistencia.html` | ✅ | — |
| **Extra** | **Mi perfil**: editar datos y cambiar la contraseña (pide la actual) | `mi-perfil.html` | ✅ | — |
| **Extra** | **Usuarios** (admin): listar, autorizar email + rol (registro pendiente), editar, activar/desactivar | `usuarios.html` | ✅ | — |
| **Extra** | **Feriados** (admin): crear, editar motivo y habilitar días sin servicio | `calendario-feriados.html` | ✅ | — |
| **Extra** | **Menús** (admin): armar la semana con el catálogo o platos nuevos, borrador / publicar, duplicar semana anterior | `menuadmin.html` | ✅ | — |
| M6 · Seguridad completa | Spring Security / JWT | — | No se hizo (opcional) | — |

Tag final: `v4-entrega`.

---

## Cómo ejecutar

### 1. Base de datos (un solo archivo)

**File → Open SQL Script…** → `backend/db/pp1_pedidos-completo.sql` → ejecutar **todo** (rayo sin cursor). Crea `pp1_pedidos` desde cero y deja todo listo.

- Es el script oficial de la cátedra (`tp-pedidos.sql`) seguido de `datos-demo.sql`: 38 platos más para todo tipo de persona y menús **publicados** del 11/11 al 30/11/2026 con 12 opciones por día (los menús del script son de la semana del 26/10, que ya pasó).
- Y al final `datos-noviembre.sql`: 6 empleados más y **asistencia y pedidos de 9 empleados del 11/11 al 30/11** (casi todos CONFIRMADOS, dos en BORRADOR), así el consolidado tiene qué contar apenas se abre. Martín queda sin datos de noviembre a propósito: es el usuario de la demo.
- Única diferencia con el oficial: intercalación `utf8mb4_unicode_ci` en vez de `utf8mb4_0900_ai_ci`, para que corra igual en MySQL 8 y en XAMPP (MariaDB). Las entidades no dependen de la intercalación: `ddl-auto=validate` pasa igual.
- Los dos archivos separados siguen en `backend/db/` sin cambios (el oficial, tal cual lo dio la cátedra).
- Verificación: `SELECT COUNT(*) FROM plato;` → **44** · `menu_dia` → **18** · `menu_plato` → **170** · `usuario` → **11** · `asistencia` → **133** · `pedido` → **39** · `pedido_dia` → **115**.
- Con XAMPP y phpMyAdmin: **Importar** → `backend/db/pp1_pedidos-completo.sql` → *Continuar*.
- Con XAMPP, desde la terminal: `C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 -e "source backend/db/pp1_pedidos-completo.sql"`. Spring muestra un aviso `HHH000511` por la versión de MariaDB: es inofensivo.

### 2. Backend (Spring Boot, puerto 8080)

- La contraseña de MySQL **no está en el repo**: se lee de la variable de entorno `DB_PASSWORD` (`spring.datasource.password=${DB_PASSWORD:}`).
  - IntelliJ: *Run → Edit Configurations… → PedidosApplication → Environment variables* → `DB_PASSWORD=tu_clave`.
  - VS Code: en `.vscode/launch.json`, `"env": { "DB_PASSWORD": "tu_clave" }` (ese archivo está en `.gitignore`).
  - Terminal (PowerShell): `$env:DB_PASSWORD="tu_clave"; ./mvnw spring-boot:run` desde `backend/`.
- Correr `PedidosApplication`. La consola termina en `Started PedidosApplication`: `ddl-auto=validate` comparó **las 8 entidades** con las tablas del script y coinciden.
- Test de la regla de negocio: `./mvnw test -Dtest=ReglaHorarioTest` (no necesita MySQL).

### Cambiar la hora de corte

En `backend/src/main/resources/application.properties`:

```properties
pedidos.hora-corte=10:00
```

Se cambia ahí (formato `HH:MM`) y se reinicia Spring. El frontend la lee de `GET /api/configuracion`, así que las pantallas muestran y aplican la misma hora que el servidor.

### 3. Frontend

Abrir `frontend/login.html` con **Live Server** (puerto 5502, configurado en `.vscode/settings.json`) o `npm start` (puerto 4173). `CorsConfig` autoriza esos orígenes.

### Cuentas para la demo

| Usuario | Correo | Contraseña | Rol |
|---|---|---|---|
| Laura Giménez | `laura.gimenez@empresa.com.ar` | `cambiar123` | ADMINISTRADOR → entra al Consolidado |
| Martín Sosa | `martin.sosa@empresa.com.ar` | `cambiar123` | EMPLEADO |
| Lucía Fernández | `lucia.fernandez@empresa.com.ar` | `cambiar123` | EMPLEADO |
| Diego Romero | `diego.romero@empresa.com.ar` | `cambiar123` | EMPLEADO (tiene un pedido en BORRADOR) |
| Carolina Benítez | `carolina.benitez@empresa.com.ar` | `cambiar123` | EMPLEADO |

Además hay 6 empleados con pedidos de noviembre (`datos-noviembre.sql`), todos con `cambiar123`: `sofia.medina`, `javier.ruiz`, `valentina.acosta`, `nicolas.herrera`, `florencia.castro` y `tomas.rios` (`@empresa.com.ar`).

También se puede crear una cuenta nueva en **Registrate** (queda como EMPLEADO).

### Recorrido de la demo (15 min)

**Ojo con las fechas:** las pantallas navegan solo el mes actual y hay menús hasta el 30/11. El jueves 19/11, después de las 10:00, la semana actual queda vacía (corte de las 10:00 + feriado del 20/11) → usar **Semana siguiente (23 al 27/11)**.

1. **M1**: **registrar un usuario nuevo en vivo** e ingresar con él (y mostrar el error con clave incorrecta).
2. **M2**: Asistencia → *Semana siguiente* → marcar lunes a miércoles → *Guardar*. Recargar: siguen marcados. El viernes 20/11 aparece como *Día de la Soberanía Nacional* (sale de `dia_no_laborable`).
3. **Validación que rechaza**: intentar un día no laborable o ya pasado el corte → el servidor responde 409 con el motivo.
4. **M3**: Elegir menú → se ven solo los días marcados, con las opciones del menú publicado y sus porciones.
5. **M4**: elegir un plato con comentario → *Guardar borrador*. En Mis pedidos aparece en **Borrador**; recargar y sigue ahí. **Confirmar pedido** → **Confirmado** (el consolidado solo cuenta los confirmados).
6. **M5**: cerrar sesión, entrar con Laura → Consolidado → semana del 23/11 → ya trae los pedidos precargados **más** el que se acaba de confirmar. Los borradores (Diego y Tomás esa semana) no cuentan.
7. **Mejora · fuera de horario** (si sobra tiempo): con Laura → *Pedido fuera de horario* → elegir empleado, día y plato → *Cargar pedido confirmado*.

---

## Tabla de endpoints

Base: `http://localhost:8080/api`. Errores: siempre `{ "mensaje": "…" }` con **400** (dato mal formado / Bean Validation), **401** (credenciales o rol), **404** (no existe) o **409** (rompe una regla de negocio).

| Módulo | Método | Endpoint | Cuerpo / parámetros | Respuesta |
|---|---|---|---|---|
| M1 | POST | `/auth/registro` | `{nombre, apellido, correo, contrasena, telefono?}` | 201 usuario (sin contraseña) |
| M1 | POST | `/auth/login` | `{correo, contrasena}` | 200 usuario · 401 |
| M1 | POST | `/auth/recuperar` | `{correo}` | `{mensaje, modoDemo, correoSimulado}`: el mensaje es igual exista o no el correo; `correoSimulado` solo viene en modo demo (enlace de 15 min, un solo uso) |
| M1 | GET | `/auth/recuperar/{token}` | — | 200 vigente · 404 usado · 409 vencido |
| M1 | POST | `/auth/restablecer` | `{token, contrasena}` | 200 · la nueva se guarda como huella PBKDF2 |
| M2 | GET | `/dias-no-laborables` | `?desde&hasta` (opcionales) | lista `{id, fecha, motivo}` |
| M2 | GET | `/asistencias` | `?idUsuario&desde&hasta` | lista `{id, idUsuario, fecha, asiste}` |
| M2 | PUT | `/asistencias/semana` | `{idUsuario, semana (lunes), fechas[]}` | lista de la semana |
| M3 | GET | `/menus` | `?fecha` o `?desde&hasta` | menús publicados con `opciones[]` |
| M4 | GET | `/pedidos` | `?idUsuario` | pedidos con `dias[]` adentro |
| M4 | POST | `/pedidos` | `{idUsuario, idMenuDia, idPlato, comentario?}` | 201 pedido en BORRADOR |
| M4 | PUT | `/pedidos/{id}/confirmar` | `?idUsuario` | pedido CONFIRMADO |
| M4 | PUT | `/pedidos/{id}/cancelar` | `?idUsuario` | pedido CANCELADO |
| M4 | DELETE | `/pedidos/{id}/dias/{idDia}` | `?idUsuario` | 204 |
| M5 | GET | `/consolidado` | `?idUsuario (admin)&fecha` o `&desde&hasta` | `{fecha, idPlato, plato, porciones}` |
| M5 | GET | `/consolidado/detalle` | ídem | `{fecha, idPlato, empleado, plato, estado, comentario}` |
| Mejora | POST | `/pedidos/fuera-de-horario` | `{idAdministrador, idEmpleado, idMenuDia, idPlato, comentario?}` | 201 pedido CONFIRMADO |
| Mejora | GET | `/usuarios/empleados` | `?idUsuario (admin)` | empleados activos (sin contraseña) |
| Mejora | GET | `/configuracion` | — | `{horaCorte}` |
| Perfil | PUT | `/usuarios/{id}/perfil` | `{nombre, apellido, correo, telefono?, contrasenaActual?, contrasenaNueva?}` | usuario |
| Usuarios | GET | `/usuarios` | `?idUsuario (admin)` | todos (sin contraseñas, con `pendiente`) |
| Usuarios | POST | `/usuarios` | `{idAdministrador, nombre, apellido, correo, rol}` | 201 cuenta pendiente |
| Usuarios | PUT | `/usuarios/{id}` | ídem | usuario editado |
| Usuarios | PUT | `/usuarios/{id}/activo` | `{idAdministrador, activo}` | usuario |
| Feriados | POST | `/dias-no-laborables` | `{idUsuario (admin), fecha, motivo}` | 201 (crea o cambia motivo) |
| Feriados | DELETE | `/dias-no-laborables/{id}` | `?idUsuario (admin)` | 204 (habilita el servicio) |
| Menús | GET | `/menus/admin` | `?idUsuario (admin)&desde&hasta` | menús publicados y borradores, con `reservadas` |
| Menús | PUT | `/menus/semana` | `{idUsuario, lunes, publicado, dias[{fecha, opciones[{idPlato? \| nombre, descripcion, categoria; stockDisponible}]}]}` | la semana guardada |
| BK 02 | GET | `/platos`, `/platos/{id}` | — | platos · 404 |

Colección de Postman: [`SistemaPedidos-G5.postman_collection.json`](SistemaPedidos-G5.postman_collection.json) (26 pedidos, con tests de código HTTP; importar en Postman → *Import*).

---

## Arquitectura del backend

```
backend/src/main/java/com/grupo5/pedidos/
├── entidad/      Usuario, Asistencia, DiaNoLaborable, MenuDia, Plato, MenuPlato, Pedido, PedidoDia
├── repositorio/  un JpaRepository por entidad (consultas derivadas + JPQL de los cruces 2 y 3)
├── servicio/     UsuarioService, AsistenciaService, MenuService, PedidoService, ConsolidadoService,
│                 ReglaHorario (corte 10:00), ContrasenaService, DTOs de respuesta y excepciones
├── controlador/  un @RestController por recurso, requests con Bean Validation, ManejadorDeErrores
└── config/       CorsConfig (orígenes de Live Server), RelojConfig (hora de Argentina)
```

- **Entidades = tablas del script**, columna por columna; `ddl-auto=validate` lo controla al arrancar.
- **Las FK son `Long`** (sin `@ManyToOne`): el JSON queda plano, con las mismas claves que el modelo. Los JOIN se escriben en JPQL (`WHERE pe.id = pd.idPedido`).
- **Controller → Service → Repository**: el controller solo recibe y valida la forma (`@Valid`); las reglas están en el servicio; el repositorio solo accede a la tabla.
- **Bean Validation** en todo lo que se guarda: `RegistroRequest`, `LoginRequest`, `AsistenciaSemanaRequest`, `PedidoDiaRequest`.

### Reglas de negocio (en la capa de servicio)

| Regla | Dónde |
|---|---|
| Cada día se puede cambiar hasta la **hora de corte** (10:00 por defecto, hora Argentina) de ese día | `ReglaHorario` (+ `ReglaHorarioTest`) |
| El **administrador** puede cargar un pedido **fuera de horario**: saltea solo la hora de corte (no días pasados), registra la asistencia y lo deja CONFIRMADO | `PedidoService.cargarFueraDeHorario` |
| No se marca asistencia ni se pide en un **día no laborable** | `AsistenciaService`, `PedidoService` |
| No se deja de venir un día que ya tiene un pedido activo | `AsistenciaService` |
| Solo se pide para días con **asistencia** y **menú publicado**, y el plato tiene que ser una opción de ese menú | `PedidoService` |
| **Stock**: porciones ofrecidas − reservadas (borradores y confirmados) > 0 | `PedidoService`, `MenuService` |
| **Una opción por día**: si ya hay borrador se reemplaza; si está confirmado hay que cancelar | `PedidoService` |
| El **consolidado** cuenta solo `CONFIRMADO` y solo lo ve el administrador | `ConsolidadoService` |
| Modificar un día **confirmado** lo devuelve a **borrador** (hay que confirmarlo de nuevo); se puede **cancelar un solo día** | `PedidoService` |
| Usuarios: no podés cambiar tu rol ni desactivarte; siempre queda un administrador activo; correo único | `UsuarioService` |
| Feriados: solo fechas abiertas de lunes a viernes; con pedidos activos no se suspende el servicio; si había menú, se despublica | `DiaNoLaborableService` |
| Menús: un plato con pedidos no se quita ni baja de lo reservado; con pedidos no se despublica; sin repetidos | `MenuAdminService` |

**Cómo usamos `pedido` y `pedido_dia`**: `pedido` es la cabecera de **la semana** del empleado y `pedido_dia` tiene una fila por día (igual que los datos del script, donde cada empleado tiene un pedido con varios días). Se arma en BORRADOR día por día; al confirmar, se confirma la semana completa. Si después necesita agregar otro día, se arma otro pedido.

---

## Traducción del modelo

| Tabla | Entidad | Atributos | Relaciones | Endpoint | Pantalla de NUESTRO frontend |
|---|---|---|---|---|---|
| `usuario` | `Usuario` | `id`, `nombre`, `apellido`, `correo`, `contrasena`, `telefono`, `rol`, `activo` | — (la referencian `asistencia`, `menu_dia`, `pedido`, `notificacion`) | `/api/auth/registro`, `/api/auth/login` | Login · Registro (`auth.js`). La sesión guarda el usuario devuelto (sin contraseña) en `sessionStorage` |
| `asistencia` | `Asistencia` | `id`, `idUsuario`, `fecha`, `asiste` | muchas → un `Usuario` | `/api/asistencias` | Asistencia (`asistencia.js`). Elegir menú y Mis pedidos la consultan para saber qué días mostrar |
| `dia_no_laborable` | `DiaNoLaborable` | `id`, `fecha`, `motivo` | — | `/api/dias-no-laborables` | Asistencia y Elegir menú (días deshabilitados con su motivo) |
| `menu_dia` | `MenuDia` | `id`, `fecha`, `descripcion`, `publicado`, `idUsuarioCreador` | muchos → un `Usuario` · uno → muchos `MenuPlato` | `/api/menus` | Elegir menú (`menu-pedido.js`) |
| `plato` | `Plato` | `id`, `nombre`, `descripcion`, `imagen`, `categoria` | — (la referencian `menu_plato`, `pedido_dia`) | `/api/platos` (y dentro de `/api/menus`) | Elegir menú (tarjetas), Administrar menús (catálogo) |
| `menu_plato` | `MenuPlato` | `id`, `idMenuDia`, `idPlato`, `stockDisponible` | muchos → un `MenuDia` · muchos → un `Plato` | dentro de `/api/menus` (`opciones[]`) | Elegir menú (opciones y porciones disponibles) |
| `pedido` | `Pedido` | `id`, `idUsuario`, `fechaPedido`, `estado` | muchos → un `Usuario` · uno → muchos `PedidoDia` | `/api/pedidos` | Elegir menú (guardar / confirmar) · Mis pedidos (`mis-pedidos.js`) |
| `pedido_dia` | `PedidoDia` | `id`, `idPedido`, `idMenuDia`, `idPlato`, `fechaEntrega`, `comentario` | muchos → un `Pedido`, un `MenuDia`, un `Plato` | dentro de `/api/pedidos` (`dias[]`), `/api/pedidos/{id}/dias/{idDia}` | Mis pedidos (cada día del pedido) |
| `notificacion` | `Notificacion` | `id`, `idUsuario`, `fechaEnvio`, `asunto`, `mensaje` | muchas → un `Usuario` | — (fuera de alcance) | sin pantalla |
| *(consulta)* | — | `plato`, `porciones` (+ `fecha`, `idPlato`) | cruce 2 | `/api/consolidado` | Consolidado (`consolidado.js`) |

`Notificacion` no se mapeó: está fuera del alcance mínimo y `validate` solo controla las tablas que tienen entidad.

## Cruces

- **Cruce 1 · Menú publicado de un día** → `MenuService` → `GET /api/menus` → Elegir menú. Un menú sin publicar (02/11) no sale.
- **Cruce 2 · Consolidado de una fecha** → `PedidoDiaRepository.consolidar` (`COUNT … GROUP BY`, solo `CONFIRMADO`) → Consolidado.
- **Cruce 3 · Mis pedidos** → `PedidoService.listar` → `GET /api/pedidos?idUsuario=` → Mis pedidos.
- **Cruce 4 · ¿Se puede pedir ese día?** → reglas de `PedidoService.guardarDia` (día no laborable, menú publicado, asistencia, corte de las 10:00). En el frontend, Elegir menú muestra el motivo antes de intentar.

## Divergencias que se corrigieron (frontend E3 → backend)

| Antes (frontend E3) | Ahora |
|---|---|
| Todo en `localStorage` (`sistemaPedidos:v1`) | M1–M5 leen y escriben **solo** por la API; `assets/js/api.js` es la única puerta |
| `id` de texto (`"p1"`, `"menu-2026-10-12"`) | `id` numérico de MySQL |
| Usuarios con `firstName`, `email`, `role: admin/empleado` | `nombre`, `apellido`, `correo`, `rol: EMPLEADO/ADMINISTRADOR` (el frontend los adapta para la cabecera) |
| `status: Borrador/Confirmado/Cancelado` | `estado: BORRADOR/CONFIRMADO/CANCELADO` |
| Un pedido por fecha | `pedido` (cabecera de la semana) + `pedido_dia` (una fila por día) |
| Asistencia como lista de fechas por semana | Una fila por fecha con `asiste` verdadero o falso |
| Consolidado guardado en `reports` | No se guarda: se cuenta en cada consulta |
| Categorías `carnes`, `minutas`… | Se agregaron las del script: `clásico`, `liviano` |

## Divergencias con la consigna

Lo que hicimos distinto al contrato de la cátedra, con qué cambiamos y por qué.

| Tema | Consigna | Qué hicimos | Por qué |
|---|---|---|---|
| **Registro** | Alta de usuario como parte de M1 | `POST /api/auth/registro`, junto con `POST /api/auth/login` bajo `/auth` | Registro y login son *acceso* (M1), no la administración de usuarios. `/api/usuarios` queda solo para el administrador. Además el registro completa las cuentas "pendientes" que autorizó el administrador. |
| **Asistencia** | Guardar los días que asiste, una fila de `asistencia` por fecha | `PUT /api/asistencias/semana` con `{idUsuario, semana, fechas[]}`: se manda la semana entera | La pantalla guarda la semana completa con un solo botón. Es `PUT` porque reemplaza el estado de esa semana (mandarlo dos veces da lo mismo). El servicio lo hace en **una transacción**: o se guarda toda la semana o nada, y valida juntas las reglas (feriado, hora de corte, día con pedido activo). En la tabla sigue habiendo **una fila por fecha** con `asiste`. |
| **Menús sin `idUsuario`** | Ver los menús publicados de los días que asiste el usuario | `GET /api/menus?desde&hasta` no recibe `idUsuario` | El menú publicado de un día es **el mismo para todos**, así que no depende de quién lo pide. La pantalla cruza con `GET /api/asistencias` para mostrar solo los días marcados, y la regla de verdad está en el servidor: `PedidoService` **rechaza** un pedido para un día sin asistencia. |
| **PBKDF2 en lugar de BCrypt** | BCrypt (también lo pusimos en el RNF-04 de la 1ra entrega) | `PBKDF2WithHmacSHA256`, 120.000 iteraciones y sal aleatoria de 16 bytes (`ContrasenaService`) | BCrypt viene con Spring Security, que es el M6 (opcional, no lo hicimos). PBKDF2 viene **con Java**, sin dependencias, y es el mismo tipo de protección: una huella lenta y con sal, que no se puede revertir. Con el M6 se cambiaría por `BCryptPasswordEncoder`. Las cuentas del script tienen `cambiar123` en texto plano porque así las trae el script; las nuevas se guardan como huella. |

## Límite conocido: el `idUsuario` lo manda el cliente

Hoy **no hay sesión en el servidor**: después del login, el frontend guarda el usuario en `sessionStorage` y manda su `idUsuario` en cada petición (`assets/js/api.js`). El backend **confía** en ese número: por ejemplo, `ConsolidadoController` recibe `?idUsuario=` y `ConsolidadoService` solo controla que ese id sea de un administrador.

**El riesgo:** cualquiera que conozca la API puede cambiar el número. `GET /api/consolidado?idUsuario=1&fecha=2026-10-28` desde Postman o el navegador devuelve el consolidado **sin haber hecho login**, porque el usuario 1 es administrador. Lo mismo pasa con ver o cambiar los pedidos o la asistencia de otro empleado.

**Cómo lo cierra el M6 (Spring Security + JWT):**
1. `POST /api/auth/login` valida la contraseña y devuelve un **token firmado** por el servidor (con el id y el rol adentro).
2. El frontend lo manda en cada petición: `Authorization: Bearer <token>`.
3. Un filtro de Spring Security verifica la firma. Si alguien cambia el contenido, la firma ya no coincide y responde 401.
4. Los controllers dejan de recibir `idUsuario`: el usuario sale del token. Las rutas de administrador se protegen por rol (`hasRole('ADMINISTRADOR')`), y si un empleado las llama recibe 403.

Para esta entrega quedó aceptado así: el M6 era opcional.

### Recuperar contraseña (modo demo)

*Olvidé mi contraseña* (en el login) pide un enlace al backend. El enlace dura 15 minutos, sirve una sola vez y pedir otro invalida el anterior. Los enlaces viven en memoria del servidor (el script no tiene una tabla para ellos): si se reinicia Spring, hay que pedir uno nuevo.

Como no hay servicio de email (las notificaciones están fuera del alcance), hay un **interruptor de modo demo** en `application.properties`:

```properties
pedidos.recuperacion.modo-demo=true
```

- **`true` (la demo de clase):** la respuesta trae además el **correo simulado** con el enlace, y la pantalla lo muestra avisando que es una simulación. Esto deja ver el token y si el correo existe: es a propósito, solo para poder mostrar el flujo sin un servidor de mail.
- **`false` (como sería en producción):** la respuesta es **siempre la misma**, exista o no el correo: `{"mensaje": "Si el email corresponde a una cuenta activa, se generó un enlace…", "modoDemo": false, "correoSimulado": null}`. No se filtra ni el token ni qué cuentas están registradas; el enlace se mandaría por mail.

En los dos casos el **mensaje es el mismo** exista o no el correo.

### Pantallas del prototipo que se reconectaron

*Administrar menús*, *Feriados*, *Usuarios* y *Mi perfil* venían del prototipo de la 3ra entrega (guardaban en `localStorage`). Ahora leen y guardan en MySQL a través del backend, con sus reglas en la capa de servicio:

- **Menús**: un plato escrito a mano se busca en el catálogo por nombre y, si no existe, se crea en `plato`. Las casillas *Vegetariano* / *Sin TACC* pasaron a ser **categorías** (el modelo no tiene esas columnas). Borrador / publicado es la columna `publicado` de cada `menu_dia`.
- **Usuarios**: "Autorizar nuevo usuario" crea la cuenta **sin contraseña** (registro pendiente); la persona la completa desde *Registrate*. Los administradores que antes estaban en `frontend/data/empresa.json` ahora se configuran en `pedidos.administradores-autorizados` (`application.properties`).
- **Excepciones de horario**: las reemplaza *Pedido fuera de horario* (el administrador carga el pedido; no hace falta tabla nueva).
- **Login**: no muestra la lista de requisitos de contraseña ni exige `.com` (las cuentas del script son `...@empresa.com.ar` / `cambiar123`); el registro sí los exige.

## Cómo guardamos cada módulo (Git)

Un módulo a la vez: **funciona en la pantalla → commit (Commit Explicado) → tag**. Cada PR lo revisa otro integrante, que lo baja, lo corre y prueba en Postman antes de aprobar.

```bash
git switch -c bk/4ta-entrega
git add backend/ frontend/ docs/ tests/ .gitignore
git commit          # con Commit Explicado (qué se pidió / qué se modificó / por qué funciona)
git tag m1-ok && git tag m2-ok && git tag m3-ok && git tag m4-ok && git tag m5-ok
git tag v4-entrega
git push -u origin bk/4ta-entrega --tags
```

Si un módulo rompe algo: `git switch --detach m3-ok` para volver al último que funcionaba.

## Declaración de uso de IA

Usamos IA (Claude, de Anthropic) como asistente durante esta entrega, dentro de la política del bloque ("habilitado con reglas"):

- **Para qué**: generar una primera versión de las entidades, repositorios, servicios y controllers a partir del `CREATE TABLE` del script; conectar las pantallas a la API; armar el test JUnit, la colección de Postman y este documento.
- **Qué controlamos nosotros**: que cada entidad coincida con el script (lo confirma `ddl-auto=validate`), que los cruces devuelvan lo que dice el modelo explicado, el recorrido completo de la demo en nuestras máquinas con MySQL, y la columna de pantallas contra nuestro propio frontend.
- **Lo que tenemos que poder explicar cada uno**: el camino pantalla → `fetch` → controller → servicio → repositorio → tabla de cualquier módulo, por qué las reglas están en el servicio y no en la base, y por qué el consolidado no se guarda.
