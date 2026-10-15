# SistemaPedidos · Grupo 5

Frontend de gestión de almuerzos para empleados y administradores, realizado con **HTML, CSS y JavaScript**, sin frameworks ni dependencias de ejecución. Práctica Profesionalizante I · 2026.

Este README reúne el estado actual, las decisiones, los recorridos, la trazabilidad y la forma de probar el proyecto. Las entregas anteriores se conservan como registro histórico.

## Ejecutar el proyecto

**Forma principal: VS Code + Live Server.** Abrir la carpeta del repositorio en VS Code, buscar `frontend/login.html` y elegir **Open with Live Server**. Para usar la aplicación no se necesita Node.js, instalar paquetes ni compilar: sigue siendo HTML, CSS, JavaScript y datos JSON.

Opcionalmente, si ya se dispone de Node.js 20 o superior, ejecutar `npm start` o `node scripts/serve.mjs` desde la raíz y abrir **http://127.0.0.1:4173/login.html**. Ese script es solamente un servidor local de desarrollo escrito en JavaScript.

- La entrada es `frontend/login.html`. Se eliminó el índice de pantallas `index.html`.
- El servidor local redirige `/` y la URL antigua `/index.html` al login.
- Con Live Server, abrir `frontend/login.html` explícitamente.
- No abrir los HTML con doble clic (`file://`): se utilizan módulos JavaScript, `fetch` y Web Crypto, que requieren localhost o HTTPS.
- Usar siempre el mismo origen y puerto para conservar los datos del navegador.

## Primer uso y roles

**No hay contraseñas ni cuentas de prueba predefinidas.** Cualquier persona puede registrarse con un email que cumpla la política `.com`. La empresa asigna el rol administrativo mediante `frontend/data/empresa.json`.

1. El empleado abre el login, elige **Registrate**, crea su cuenta y vuelve al login.
2. Hay un único inicio de sesión: email y contraseña. El rol guardado decide a qué pantallas entra cada persona.
3. **`proadmin@gmail.com` es el email autorizado para el administrador inicial**, por indicación del responsable. Su titular se registra y elige su propia contraseña. El JSON contiene una autorización, no una cuenta ya creada.
4. Desde **Usuarios**, el administrador autoriza nuevos emails y roles. Las personas completan su registro con su propia contraseña. También puede cambiar el rol de cuentas ya registradas.
5. El empleado se identifica con verde azulado y persona; el administrador con violeta y escudo. **Mi perfil y preferencias** está junto al nombre, separado de los pasos del pedido.

No existe selector de rol ni enlace público para configurar administradores. Agregar `?modo=admin` a la URL no otorga permisos. Se protege la propia cuenta y debe quedar al menos un administrador activo que haya completado su registro.

Las cuentas existentes se conservan con su rol; editar el JSON no modifica retroactivamente sus permisos. Para una cuenta ya registrada, un administrador debe cambiar su rol desde Usuarios. La asignación y los permisos son una simulación local; en producción deberán resolverse en el servidor.

## Recuperar una contraseña olvidada

Desde el login, elegir **Olvidé mi contraseña** → ingresar el email → **Solicitar enlace**. El bloque **Correo simulado · demostración** muestra un enlace **Cambiar contraseña** para una cuenta registrada y activa en este navegador y origen. No se envía correo real ni se comprueba la titularidad del email.

El enlace dura 15 minutos, es de un solo uso y queda invalidado al pedir otro. La pantalla Nueva contraseña mantiene las validaciones, ticks y controles de mostrar/ocultar. Después de guardar, permite volver al login: la contraseña anterior deja de funcionar si se eligió una diferente. Se conservan ID, rol, pedidos, asistencia y preferencias; las sesiones anteriores de esa cuenta quedan invalidadas.

Un enlace ausente, alterado, vencido, usado o reemplazado ofrece **Solicitar un nuevo enlace**. También se revalida al guardar, por si vence mientras el formulario está abierto. Todas las pantallas incluyen **Volver al inicio de sesión**. Las cuentas sin registro completo o desactivadas no reciben enlace. Una falla de almacenamiento no muestra éxito ni cambia la contraseña guardada.

La bandeja simulada se conserva durante la sesión de la pestaña para poder recargar o volver. Los identificadores aleatorios de recuperación se guardan como hash en los datos locales, con vencimiento y referencia a la cuenta. Esto sigue siendo una demostración frontend: la recuperación real requiere backend, verificación y servicio de correo.

**Para presentar:** crear una cuenta → cerrar sesión → olvidar contraseña → solicitar enlace → abrir el correo simulado → guardar una contraseña distinta → ingresar. Mostrar también un email `.co`, contraseñas diferentes y un enlace ya utilizado. No borrar los datos del navegador entre los pasos.

## Recorrido del empleado

1. **Asistencia:** elegir la semana y marcar uno o varios días. Cualquier fecha del selector se convierte al lunes de esa semana. La asistencia se guarda por persona y semana.
2. **Elegir menú:** aparecen solamente los días con asistencia. Seleccionar una fecha, un plato y un comentario opcional de hasta 200 caracteres.
3. **Guardar y revisar:** se guarda un pedido en estado **Borrador** y se abre **Mis pedidos**. Revisar y confirmar para reservar una porción.
4. **Mis pedidos:** confirmar, modificar o cancelar. Un aviso enumera todos los días de asistencia aún abiertos sin pedido confirmado, incluso si ya se confirmó otro día. Distingue borradores, días sin plato elegido y menús todavía no publicados, con enlaces para continuar. Al modificar un pedido confirmado, vuelve a borrador si cambió el plato o comentario. Guardar sin cambios conserva la confirmación.
5. **Mi perfil:** actualizar nombre/email, elegir el formato de fecha, cambiar contraseña verificando la actual. El formato predeterminado es **DD/MM/AAAA**; también se puede elegir MM/DD/AAAA o AAAA-MM-DD. Se guarda por cuenta y se aplica a los campos y fechas visibles; internamente se conserva ISO para ordenar y validar. Los pedidos y asistencias usan un identificador estable: cambiar el email no los pierde.
6. **Cerrar sesión:** elimina la sesión de esa pestaña y vuelve al login. La cuenta y sus pedidos permanecen guardados.

Hay un pedido activo por empleado y fecha. Los cancelados conservan su historial y permiten volver a pedir antes del corte. El borrador no reserva stock ni se incluye en el consolidado.

## Recorrido del administrador

- **Menús:** seleccionar una semana, agregar, editar o quitar opciones, definir porciones y etiquetas, guardar borrador y publicar. Cada día debe tener opciones o estar marcado explícitamente sin servicio. Se puede duplicar la semana anterior con nuevos identificadores. Los días cerrados son de solo lectura.
- **Integridad de pedidos:** no se permite retirar una publicación, eliminar o cambiar un plato que ya tiene pedidos activos. Se pueden agregar alternativas. El stock nunca puede ser menor que las reservas confirmadas.
- **Feriados:** registrar una fecha y motivo, editar el motivo o volver a habilitar el servicio. No se desplazan fechas de feriados ni se presentan datos de ejemplo como calendario oficial. No se puede suspender un día con pedidos activos ni modificar días cerrados.
- **Usuarios:** buscar, autorizar emails y roles, editar, activar/desactivar cuentas. Las autorizaciones sin registro figuran como **Registro pendiente**; el administrador no elige la contraseña de otra persona. La baja es lógica y conserva los pedidos; la interfaz lo informa antes de confirmar.
- **Consolidado diario:** agrupa solo pedidos confirmados por opción de menú e incluye los comentarios con el nombre del empleado. Permite generar, descargar CSV e imprimir/guardar PDF desde el navegador. El CSV neutraliza fórmulas introducidas en texto por usuarios.

## Reglas y validaciones

| Dato o acción       | Regla aplicada                                                                                                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nombre              | Entre 2 y 80 caracteres, con al menos una letra                                                                                                                                               |
| Email               | Máximo 254 caracteres; parte local de hasta 64; dominio con etiquetas válidas y terminación obligatoria `.com`; sin espacios, puntos consecutivos ni puntos en los extremos de la parte local |
| Duplicados de email | No distingue mayúsculas/minúsculas; los emails se guardan en minúsculas                                                                                                                       |
| Contraseña          | Entre 8 y 64 caracteres; mayúscula A–Z, minúscula a–z, número y símbolo ASCII de puntuación; sin espacios ni saltos de línea                                                                  |
| Confirmación        | Coincidencia exacta; no se recortan ni modifican contraseñas                                                                                                                                  |
| Login               | Cuenta registrada, contraseña correcta, cuenta activa; redirección automática según rol                                                                                                       |
| Ojo de contraseña   | Mostrar/ocultar con teclado o mouse, texto accesible y estado anunciado                                                                                                                       |
| Horario             | Antes de las 10:00 de la fecha del pedido, zona `America/Argentina/Buenos_Aires`; las 10:00 exactas ya están cerradas                                                                         |
| Pedido              | Revalida asistencia, publicación, feriado, stock y comentario al guardar y al confirmar                                                                                             |
| Stock               | Se descuenta al confirmar y se libera al cancelar o volver a borrador                                                                                                                         |
| Asistencia          | No se quita un día con pedidos activos; no se cambia un día cerrado                                                                                                                           |
| Almacenamiento      | Si falla una escritura, se muestra el error y no se informa éxito                                                                                                                             |

Los errores indican el campo y la causa con borde rojo. Los requisitos de contraseña se marcan con ticks verdes en tiempo real. `.co`, `.com.ar` y otras terminaciones se rechazan por decisión explícita del proyecto, aunque algunas sean válidas fuera de este sistema.

El formato de email es una política práctica del proyecto; no intenta aceptar todas las formas avanzadas permitidas por los estándares de correo. Validar formato no verifica que la casilla exista. Esa comprobación necesitará un correo de verificación del backend.

## Datos, arquitectura y alcance

```text
frontend/
  recuperar.html / restablecer.html  Recuperación con correo simulado
  login.html / registro.html          Acceso y alta
  asistencia.html                    Días presenciales
  menu-pedido.html / mis-pedidos.html  Ciclo de pedidos
  menuadmin.html                      Preparación y publicación
  calendario-feriados.html            Días sin servicio
  consolidado.html / usuarios.html    Administración
  mi-perfil.html                      Datos y contraseña
  assets/css/styles.css              Paleta, componentes y responsive
  assets/js/core.js                   Datos, autenticación y reglas de negocio
  assets/js/validation.js             Validación detallada y requisitos de contraseña
  assets/js/dates.js                  Entrada y presentación de fechas por preferencia
  assets/img/logo.png                Logo provisto por el responsable
  assets/js/recovery.js               Reglas de recuperación y vencimiento
  assets/js/recuperacion.js           Interfaz de solicitud y cambio
  assets/js/accounts.js               Operaciones sobre cuentas
  assets/js/ui.js                     Navegación, avisos, diálogos y ojos
  assets/js/app.js                    Inicio, protección y carga de pantalla
  assets/js/*.js                      Un controlador por pantalla
  data/empresa.json                   Emails autorizados para administración inicial
  data/platos.json                    Catálogo de la entrega original
docs/                                Entregas y documentación de evolución
scripts/serve.mjs                     Servidor local sin dependencias
tests/core.test.mjs                   Pruebas de reglas
tests/browser.mjs                     Recorrido de navegador
```

- Los datos se guardan en una única estructura versionada de `localStorage` (`sistemaPedidos:v1`) para evitar escrituras parciales entre pedidos, usuarios y asistencia. La sesión vive en `sessionStorage`, aislada por pestaña.
- No se almacenan contraseñas en texto plano: Web Crypto deriva una huella PBKDF2-SHA-256 con sal aleatoria por contraseña y 100.000 iteraciones. Esto **no convierte el frontend en un sistema de autenticación seguro para producción**: quien controla su navegador puede alterar almacenamiento y código.
- El catálogo original sirve para inicializar dos semanas de ejemplo una sola vez. Se reutilizan las opciones del lunes para los días sin opciones en el JSON original. Las fechas quedan fijas; no se reubican cada vez que se abre la aplicación. El administrador puede preparar las semanas siguientes.
- Las cuentas reales del prototipo se crean manualmente. No se importan datos de `frontend-pedidos` ni cuentas de otras copias.
- Los textos ingresados por usuarios se escapan al construir HTML. Los formularios mantienen etiquetas, foco visible, errores persistentes y diálogos accesibles.
- Los colores base son `#4F3B78`, `#2D8C8A`, `#F2A07B`, `#A7BF73` y `#FCF8F2`. Para texto y botones se usan variantes oscuras que mejoran el contraste.

### Qué necesita backend

El frontend funciona end to end **dentro de un mismo navegador y origen**. No hay sincronización entre dispositivos, garantías de concurrencia para 80 usuarios, autorización de servidor, recuperación por email ni entrega real de notificaciones.

- El recordatorio de las 9:45 se muestra dentro de la aplicación si el empleado está conectado y todavía no confirmó el pedido de hoy.
- El consolidado automático de las 10:05 se genera localmente si su pantalla está abierta. También puede generarse manualmente.
- CSV e impresión son funcionales. **No hay botón que simule un envío al proveedor como si hubiera ocurrido.** El archivo debe compartirse fuera del prototipo.
- En producción se necesitan API, base de datos, sesiones seguras, tareas programadas y servicio de correo. Los RNF de BCrypt en servidor, HTTPS, disponibilidad y concurrencia de E1 siguen siendo requisitos pendientes del backend.
- Limpiar los datos del sitio elimina las cuentas y pedidos locales. No usar este prototipo como registro productivo de información real.

## Trazabilidad actual

La numeración de referencia es la especificación de E1, que tiene diferencias respecto de algunas tablas históricas de E2/E3.

| Pantalla / módulo        | Historias                | Casos de uso de E1                                  |
| ------------------------ | ------------------------ | --------------------------------------------------- |
| Asistencia               | HU-01                    | CU-01                                               |
| Menú y borrador          | HU-02, HU-03, HU-06      | CU-02, CU-03, CU-06, CU-12                          |
| Mis pedidos              | HU-03, HU-04, HU-05      | CU-04, CU-05, CU-12, CU-13                          |
| Administración de menús  | HU-07, HU-11             | CU-07, CU-08                                        |
| Consolidado              | HU-08                    | CU-09, integración externa pendiente                |
| Usuarios                 | HU-09                    | CU-10                                               |
| Aviso en aplicación      | HU-10                    | CU-11, notificación externa pendiente               |
| Feriados                 | Extensión documentada    | CU-14, ver evolución                                |
| Login, registro y perfil | Soporte de autenticación | Precondiciones compartidas; sin CU específico en E1 |

## Probar

```sh
npm test
```

Las 29 pruebas de lógica cubren asignación empresarial, autorización de otros administradores, fechas y avisos de pendientes, además de email, contraseña, registro sin cuentas predefinidas, hashes, permisos, corte exacto, datos persistidos, estados, stock, asistencia, feriados, publicación, usuarios, perfil, consolidado y errores de almacenamiento.

Para el recorrido automatizado de navegador: con el servidor iniciado, instalar Playwright en el entorno de pruebas (`npm install --no-save --package-lock=false playwright`) y ejecutar `node tests/browser.mjs`. Requiere Chrome instalado; también admite `BROWSER_CHANNEL=edge`, `BASE_URL` y `PLAYWRIGHT_MODULE`. Las cuentas que crea esta prueba existen únicamente en un contexto temporal de navegador que se elimina al terminar. Capturas y CSV quedan en `test-results/`, ignorado por Git.

**Prueba manual sugerida:** registrar empleado → ingresar → elegir un día futuro con menú → guardar borrador → confirmar → modificar → confirmar nuevamente → cancelar. Luego registrar `proadmin@gmail.com` con una contraseña propia y revisar menús, feriados, usuarios y el consolidado. Probar una contraseña incorrecta, un email con dos puntos seguidos, un email terminado en `.co`, cambiar el formato de fechas, comprobar los avisos de días pendientes y abrir una URL administrativa como empleado. Para probar después de las 10:00, elegir un día futuro; no hay un bypass del horario en la aplicación.

## Revisión de la prueba manual · 14/10/2026

Se aplicaron las observaciones de los tres TXT: login y registro centrados, logo original, navegación con iconos, perfil junto al nombre, adaptación al zoom, formato de fechas por cuenta, avisos de pedidos pendientes, login único y asignación administrativa. Se verificó el login a 1366×768 sin desplazamiento vertical en su estado inicial; con mensajes, poca altura o zoom el contenido puede desplazarse para permanecer accesible.

El recorrido específico de recuperación se ejecuta con `node tests/recovery-browser.mjs`, usando el mismo servidor y configuración de Playwright que `tests/browser.mjs`. Sus cuentas y correos se crean en un navegador temporal; no quedan cargados para la presentación.

## Historial del trabajo

| Etapa                          | Documentación                                              | Estado                                                   |
| ------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| E1 · Análisis (30/04/2026)     | [Análisis, HU, RF, RNF y CU](docs/1er-entrega/analisis.md) | Documento de origen conservado                           |
| E2 · Interfaces (25/06/2026)   | [Diseño y wireframes](docs/2da-entrega/README.md)          | Registro histórico conservado                            |
| E3 · Codificación (24/09/2026) | [Capacidades iniciales](docs/3er-entrega/README.md)        | Registro histórico conservado                            |
| Integración para el 15/10/2026 | [Decisiones y evolución](docs/evolucion-frontend.md)       | Frontend conectado; verificar resultados de pruebas allí |

### Colaboración y mantenimiento

La integración fue realizada con asistencia de Codex: reorganización, implementación, revisión y pruebas. Cada integrante debe revisar las reglas de `core.js` y el controlador de su pantalla antes de la defensa. La documentación histórica de uso de IA se mantiene como registro de cada entrega, sin atribuir retrospectivamente este trabajo a sus autores.

Para continuar: trabajar en `pruebas`, ejecutar pruebas, registrar cambios en este README y en el documento de evolución, revisar manualmente el recorrido y recién después decidir en equipo qué integrar. Esta intervención no realiza commits ni envía cambios a `main`.

### Presentación en computadora

El acceso utiliza un panel centrado de 680 px en escritorio, con logo y campos ampliados. Se comprobó a 1366×768 y 1920×1080; las ventanas pequeñas y el zoom conservan adaptación y desplazamiento cuando es necesario.

### Última revisión de acceso

Nombres con caracteres y separadores controlados; detección de errores comunes en dominios de correo; aviso único para cuentas no registradas o activadas. Formularios de acceso con fondo claro tenue, panel blanco, logo integrado al fondo y requisitos de contraseña agrupados. Detalles y pruebas en [evolución del frontend](docs/evolucion-frontend.md). Las pruebas adicionales de estas validaciones se ejecutan con `node --test tests/validation.test.mjs`.
