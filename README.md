# SistemaPedidos · Grupo 5

Frontend de pedidos de almuerzos de Práctica Profesionalizante I. HTML, CSS, JavaScript y JSON, con Bootstrap Grid 5 local. No requiere compilación ni backend para esta demostración.

## Ejecutar

1. Abrir el repositorio en VS Code con la extensión Live Server.
2. Abrir `frontend/login.html` y seleccionar **Open with Live Server**.
3. Mantener el mismo navegador, dirección y puerto durante las pruebas.

`frontend/index.html` es el índice académico con enlaces a las pantallas y la limpieza de pruebas. El login es la entrada al sistema. No abrir los HTML con doble clic: los módulos y la carga de JSON necesitan un servidor local.

## Cuentas y datos

No hay cuentas ni contraseñas predefinidas. Registrarse y después iniciar sesión. El email `proadmin@gmail.com` está autorizado como administrador en `frontend/data/empresa.json`: debe completar el registro y elegir su contraseña. Los demás registros son empleados; el administrador puede gestionar autorizaciones y cuentas desde Usuarios.

Cuentas, pedidos, asistencias, menús, feriados y reportes se guardan en `localStorage`, clave `sistemaPedidos:v1`. La sesión está en `sessionStorage`. Cada navegador y origen tiene sus propios datos; nada se envía a una base de datos. Las contraseñas se guardan como huellas derivadas con sal mediante Web Crypto, pero la autenticación sigue siendo una simulación frontend.

Esta versión contiene un reinicio de pruebas único, identificado por `reinicioPruebas` en el JSON de empresa. Al abrir por primera vez la versión final se eliminan los datos anteriores del prototipo en ese origen. Las cuentas creadas después se conservan. No cambiar ese identificador durante una demostración.

Para limpiar manualmente: cerrar otras pestañas del sistema, abrir `frontend/index.html`, pulsar **Restablecer datos de prueba** y confirmar. Se borran cuentas, pedidos y cambios; se restauran los JSON originales. Volver a registrar las cuentas. El email administrativo queda autorizado, sin contraseña.

## Recorridos

**Empleado:** login → registro → login → Asistencia → Elegir menú → Guardar borrador → Mis pedidos → Confirmar. Puede modificar o cancelar antes del corte. La navegación semanal se limita al mes actual mediante Semana anterior y Semana siguiente. Solo se muestran días de asistencia; feriados y días cerrados no permiten pedidos.

**Administrador:** registro del email autorizado → login → Menús → guardar borrador → publicar. También administra días sin servicio y usuarios, y genera el consolidado de pedidos confirmados, descargable en CSV o imprimible.

**Cuenta:** Mi perfil permite actualizar datos y contraseña. Desde el login, Olvidé mi contraseña abre la recuperación: muestra un correo simulado con un enlace de 15 minutos y un solo uso. Cambia efectivamente la contraseña local; no envía email real.

Las fechas se muestran siempre en **DD/MM/AAAA**. No hay licencias ni preferencias de formato. El corte es a las **10:00 de Argentina** del día del pedido. Para demostrar después de ese horario, elegir un día futuro con menú publicado.

## Reglas principales

- Nombre y apellido separados: letras latinas, tildes y separadores entre letras; de 2 a 80 caracteres, sin números ni símbolos ajenos al nombre.
- Email sin espacios, con dominio válido y terminación `.com` según la política del proyecto; se detectan errores frecuentes como `gmial`. Validar formato no verifica la existencia de la casilla.
- Contraseña de 8 a 64 caracteres, mayúscula, minúscula, número y símbolo, sin espacios. Confirmación exacta y botón para mostrar/ocultar.
- Un pedido activo por empleado y fecha. El borrador no reserva; confirmar descuenta una porción; cancelar la libera.
- Se revalidan asistencia, fecha, feriado, menú publicado y disponibilidad al guardar y confirmar.
- No se eliminan platos con pedidos activos ni se reduce stock por debajo de lo reservado. Las porciones se conservan porque la guía 18 contempla `stockDisponible`.
- Las bajas de usuarios son lógicas. El empleado no accede a controles administrativos.

## Organización

| Archivo en frontend | Responsabilidad |
| --- | --- |
| `login.html`, `registro.html` + `assets/js/auth.js` | Acceso y registro |
| `asistencia.html` + `assets/js/asistencia.js` | Días presenciales |
| `menu-pedido.html` + `assets/js/menu-pedido.js` | Elegir plato y guardar borrador |
| `mis-pedidos.html` + `assets/js/mis-pedidos.js` | Confirmar, modificar y cancelar |
| `mi-perfil.html` + `assets/js/perfil.js` | Datos personales y contraseña |
| `recuperar.html`, `restablecer.html` + `assets/js/recuperacion.js` | Recuperación simulada |
| `menuadmin.html` + `assets/js/menuadmin.js` | Catálogo y publicación |
| `calendario-feriados.html` + `assets/js/calendario-feriados.js` | Días sin servicio |
| `usuarios.html` + `assets/js/usuarios.js` | Roles y cuentas |
| `consolidado.html` + `assets/js/consolidado.js` | Resumen, CSV e impresión |
| `assets/js/app.js`, `core.js`, `datos.js` | Inicio, reglas, almacenamiento y carga JSON |
| `assets/js/ui.js`, `validation.js`, `semanas.js`, `dates.js` | Interfaz compartida, validaciones y fechas |
| `assets/css/styles.css` | Paleta, tipografía, espacios y adaptación |
| `assets/vendor/bootstrap/` | Rejilla Bootstrap local y licencia MIT |
| `assets/img/` | Logo y fotografías locales |
| `data/` | Catálogo, menús iniciales, días sin servicio y asignación de empresa |

Los iconos son SVG definidos en `ui.js`. La tipografía común es Segoe UI, con Arial y sans-serif como alternativas del sistema; títulos y campos varían en tamaño y peso. Los colores de identidad son violeta, verde azulado, durazno, pistacho y blanco cálido. Las imágenes de platos se insertan mediante plantillas HTML; sus [autores y licencias](frontend/assets/img/platos/README.md) forman parte de los recursos.

## Entregas y alcance

- [E1: análisis, historias y casos de uso](docs/1er-entrega/analisis.md).
- [E2: interfaces](docs/2da-entrega/README.md).
- [E3: capacidades y correspondencia actual](docs/3er-entrega/README.md).

Se conserva la documentación histórica. El almacenamiento semanal local y la recuperación simulada adaptan el recorrido del prototipo; no reproducen literalmente un backend ni el modelo DTO de la guía 18. Sin servidor no hay correo real, permisos seguros, sincronización entre equipos ni tareas automáticas con la aplicación cerrada.

**Asistencia utilizada en la integración:** IA para explicar conceptos, implementar ajustes y revisar el funcionamiento.
