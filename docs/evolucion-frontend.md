# Integración del frontend para el 15 de octubre de 2026

## Diagnóstico de la copia de trabajo

Se trabajó exclusivamente sobre `PP1-2026-GRUPO5`, rama `pruebas`. La otra carpeta encontrada (`frontend-pedidos`) no se integró, por indicación del responsable del proyecto.

En el repositorio de partida, el login solo validaba formato y redirigía al índice; registro, asistencia, perfil, pedidos y varias acciones administrativas estaban maquetados pero no conectados. Había enlaces a nombres inexistentes (`perfil.html`, `menu-admin.html`), fechas de muestra antiguas y datos personales escritos directamente en el HTML. Solo tres pantallas tenían controladores JavaScript.

## Decisiones de la primera integración (13/10/2026)

1. Eliminar el índice de pantallas y usar login como entrada. Navegación compartida según cuenta autenticada y salida de sesión real.
2. Registro de empleados abierto; configuración explícita del primer administrador, sin credenciales predefinidas. El selector de login comprueba el rol; no lo modifica.
3. Separar controladores, componentes de interfaz y reglas compartidas en módulos JavaScript. HTML semántico, etiquetas, navegación por teclado y CSS responsive con la paleta provista.
4. Un pedido por fecha: evita cancelar o cerrar una semana completa cuando solo corresponde un día. Flujo Borrador → Confirmado → Cancelado; modificaciones requieren revisar nuevamente.
5. Asistencia por semana, no una configuración global ambigua. Se puede configurar la semana actual en días abiertos y preparar futuras semanas. Se bloquean cambios que dejarían pedidos sin asistencia.
6. Corte a las 10:00 en Argentina. Se vuelve a comprobar después de cerrar un diálogo, no solo al renderizar botones.
7. Opciones de menú con identificador estable y stock. Se mantienen las referencias de pedidos cuando se edita un menú y se impide eliminar una opción usada.
8. Publicación semanal exige opción o Sin servicio en cada día. Un menú en borrador deja efectivamente de estar disponible para el empleado.
9. Feriados por fecha exacta y motivo; sin trasladar datos de muestra a semanas actuales. No se cargan supuestos feriados nacionales sin una fuente oficial.
10. Consolidado diario, siguiendo CU-09 de E1, con CSV e impresión. Se distingue descarga de envío externo; no se comunica un envío ficticio.
11. Email único normalizado, contraseña estricta compartida por registro/perfil/usuarios, confirmación, hash con sal y controles de mostrar/ocultar. Se revalida el estado de la cuenta en cada operación.
12. Usuarios y pedidos vinculados por ID. Cambiar email conserva relaciones. Baja lógica de cuentas, protección del administrador y licencia en el perfil.
13. README central y documentación de límites. E2/E3 se conservan como historia y enlazan el estado actual.

## Extensión de trazabilidad · CU-14

**Gestionar días sin servicio.** Actor: Administrador. Precondiciones: sesión administrativa activa, fecha aún abierta. Acción: registrar fecha/motivo, modificar motivo o habilitar nuevamente el día. Si existen pedidos activos, se rechaza el cierre y se indica resolverlos previamente. Postcondición: el calendario queda guardado; menú, asistencia y validación de pedidos consultan la misma fecha. Se conservan los días pasados como historial de solo lectura.

## Verificación de la primera integración

Resultados de la revisión:

- **20/20 pruebas de reglas aprobadas** con el ejecutor de Node.js.
- **Recorrido completo en Chrome aprobado**, sin errores de JavaScript: registro, rechazo de datos inválidos, login, roles, asistencia, guardado, confirmación, modificación, cancelación, perfil, administración de menús, feriados, usuarios, CSV e invocación de impresión.
- **Diez pantallas verificadas a 390 px**, sin desbordes de página; navegación completa y tablas apiladas en móvil. Capturas adicionales de escritorio a 1440 px.
- Revalidación del **corte exacto durante un diálogo abierto**: la cancelación se rechaza a las 10:00 y se conserva el pedido confirmado.
- **Carga fallida y reintento**: se informa el error, se impide enviar formularios sin inicializar y el reintento recupera el login.
- **Consolidado final**: un reporte preliminar generado antes del corte se reemplaza por el reporte de las 10:05, cuando la pantalla está abierta.
- Enlaces locales y módulos verificados; la confirmación desde el menú requiere elegir plato, guardar y confirmar en el resumen, sin un diálogo de confirmación adicional.

Las pruebas reproducibles están en `tests/`. El recorrido de navegador utiliza cuentas nuevas dentro de un contexto descartable, sin sembrar usuarios en la aplicación que se entrega. La prueba de impresión verifica que se invoque el diálogo del navegador; no automatiza el diálogo nativo del sistema.

## Pendientes de integración externa

API, autenticación y autorización del servidor, BCrypt de E1, base de datos central, correo de verificación/recuperación, envío al proveedor, tareas de 9:45/10:05 con navegador cerrado y pruebas de carga/concurrencia. Las funciones locales no simulan que esos servicios existan.

## Cómo actualizar este registro

Por cada cambio futuro: anotar el problema, la decisión, las pantallas afectadas, las HU/CU y las pruebas ejecutadas. Si una regla cambia respecto de E1, documentar la diferencia antes de modificarla para mantener coherencia entre análisis y comportamiento.

## Revisión a partir del recorrido manual · 14/10/2026

Los archivos «Asistencia», «Datos de la Web» y «Login y Registro» orientaron esta revisión. Se mantiene HTML, CSS y JavaScript, con JSON y apertura mediante Live Server.

- Se reemplazó el selector de rol y el alta pública del primer administrador por un único login. `data/empresa.json` autoriza `proadmin@gmail.com`, email indicado por el responsable. Su titular elige la contraseña al registrarse. Usuarios permite autorizar más administradores, quienes completan su registro. Esto reemplaza la decisión 2 de la primera integración.
- Login y registro centrados; logo PNG provisto; navegación con iconos y perfil junto al nombre. Se conserva desplazamiento cuando el contenido o el zoom lo requieren.
- Errores detallados por campo y borde rojo. Política explícita de emails terminados en `.com`; requisitos de contraseña con ticks verdes en tiempo real y ojo para mostrar/ocultar.
- Fechas DD/MM/AAAA de forma predeterminada, configurables por cuenta en Mi perfil. Entrada manual validada y acceso al calendario nativo; las reglas siguen usando ISO internamente.
- Mis pedidos muestra todos los días abiertos de asistencia sin pedido confirmado, con enlaces para elegir o revisar. Confirmar un día no oculta los restantes.
- Las cuentas, pedidos y asistencias locales existentes se conservan. No se importaron otras copias del proyecto.

Verificación de esta revisión: 23 pruebas de lógica y recorrido completo en Chrome, incluidos rechazo de `.co`, campos con errores, ticks, autorización de otro administrador, preferencia de fecha persistente, tres días de asistencia con solo uno confirmado, enlaces de continuación, 10 pantallas móviles y reflujo con zoom del 200% en las pantallas internas. Login a 1366×768 sin scroll en su estado inicial. No se crearon commits ni se modificó main.
