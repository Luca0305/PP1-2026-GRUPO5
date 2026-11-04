# Revisión del frontend · 15/10/2026

Esta revisión corresponde a `PP1-2026-GRUPO5`, rama `pruebas`, con ejecución mediante Live Server. No incluye una entrega de backend ni certifica la aceptación del profesor. El informe distingue el funcionamiento comprobado de las adaptaciones respecto del material.

## Material revisado

Fuente local: `C:/Users/Admin/Documents/I E S/I E S - 2°Año/Práctica Profesional I`. Hay 22 PDF y una presentación de JavaScript. La numeración mezcla apuntes y actividades: **no son 18 consignas consecutivas**. No se encontraron archivos numerados 07, 11 ni 13–16. Tampoco aparece la guía JS 04 ni el modelo oficial completo; el responsable confirmó que no los tiene localizados. No se inventan requisitos para esos números.

| Archivo                                          | Aplicación / resultado de la revisión                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 Ciclo de vida del software                    | Análisis, diseño, implementación y pruebas se documentan en E1–E3, evolución e informe actual. Despliegue y mantenimiento productivo quedan para etapas posteriores.                                                                                                                      |
| 02 como funciona la web                          | HTML/CSS/JS se sirven por HTTP local. `fetch` lee JSON; no abrir con `file://`. Se distingue navegador de servidor y base de datos.                                                                                                                                                       |
| 02 RF y RNF                                      | RF trazados a pantallas y reglas. RNF de servidor, concurrencia, disponibilidad y autenticación productiva no se consideran satisfechos por una simulación frontend.                                                                                                                      |
| 03 HTML Fundamentos                              | Estructura semántica, formularios, enlaces, listas, tablas e imágenes; atributos `lang`, `alt`, `for`, `required` y tipos de campo. Inventario completo en `etiquetas-html.md`.                                                                                                           |
| 03 HU                                            | Recorrido por objetivo de cada rol: empleado solicita almuerzo, administrador organiza servicio. Usuarios conserva HU-09 de E1.                                                                                                                                                           |
| 04 CSS-FUNDAMENTOS                               | CSS externo compartido, variables de paleta, caja con `border-box`, estados de foco, Flexbox/Grid y adaptación a distintos anchos.                                                                                                                                                        |
| 04 CU Fundamentos                                | Navegación y acciones distinguen actores, precondiciones y resultados; los CU de referencia son los numerados por el grupo en E1.                                                                                                                                                         |
| 04 Material para tp                              | Funciones, objetos, arrays, render desde datos, eventos, validación en DOM y persistencia separada de los controladores. Se usan `const`/`let`; no eventos inline ni `alert` para errores.                                                                                                |
| 05 UML                                           | Se conserva el análisis histórico; no se agregan pantallas por cada elemento de un diagrama. Las integraciones futuras siguen declaradas.                                                                                                                                                 |
| 06 Actividad práctica datos y render con js      | El catálogo tiene nueve platos; las tarjetas se construyen desde datos. Crear un plato en el JSON se refleja al actualizar el catálogo. Los menús relacionan platos y fechas.                                                                                                             |
| 06 CU Especificacion                             | Flujos normal y alternativo: guardar/confirmar/modificar/cancelar, corte horario, permisos, feriado y stock.                                                                                                                                                                              |
| 08 css-cheatsheet                                | Selectores, colores, tipografía, separación con padding/margin y hoja externa aplicados. Sus pasos de commit quedan a cargo del responsable.                                                                                                                                              |
| 09 Actividad práctica eventos y validación       | `submit` con `preventDefault`, lectura de controles, errores visibles, guardado separado y actualización sin recargar.                                                                                                                                                                    |
| 09 BOOTSTRAP 5 Fundamentos                       | Rejilla Bootstrap 5 local en registro, perfil e índice. Se preservan los componentes y estilos propios. No requiere CDN ni instalación para ejecutar.                                                                                                                                     |
| 10 Bootstrap Workshop                            | Se aplica la organización fila/columnas y diseño adaptable. El ejercicio de Cineclub es didáctico: sus pantallas no pertenecen a SistemaPedidos.                                                                                                                                          |
| 12 Actividad práctica fetch                      | Lectura externa con `async/await`, `response.ok`, JSON válido, captura de errores y reintento. Se verificaron carga, vacío, ruta rota y JSON mal formado.                                                                                                                                 |
| 17 Consigna 3er entrega                          | Login validado, listado dinámico, guardado con resumen en la misma pantalla, estados y pantallas administrativas. Se restituye `index.html` como índice académico; el login continúa como entrada. Ver adaptaciones de datos más abajo.                                                   |
| 18 Completar el sistema                          | Las nueve pantallas del TP Pedidos tienen comportamiento. Se agregó apellido separado, selección múltiple de platos, listado de menús guardados con estados y opciones, borrador previo a publicación y rechazo de feriado duplicado. Ver diferencias de modelo y persistencia más abajo. |
| Layouts en css                                   | Alineaciones mediante Flexbox/Grid y separación de contenido y presentación.                                                                                                                                                                                                              |
| Onboarding Técnico PP1                           | Se conserva estructura frontend/assets/data/docs y documentación de entregas. Java/Spring/MySQL pertenecen al backend futuro, no a esta implementación.                                                                                                                                   |
| Pantallas pendientes TP Pedidos                  | Administración de menús, feriados, registro y perfil existen y están conectados. Registro no ofrece elección pública de rol.                                                                                                                                                              |
| TP INTEGRADOR SISTEMA DE GESTION DE PEDIDOS.docx | Asistencia, menú semanal, pedido diario, modificación/cancelación antes del corte, consolidado, usuarios y recordatorios locales. Envíos externos pendientes de backend.                                                                                                                  |
| JavaScript-Fundamentos.pptx                      | Separación HTML/CSS/JS; variables, tipos, funciones y eventos. El código usa módulos nativos de JavaScript, sin React/Vue ni compilación.                                                                                                                                                 |

Los seis PDF sin texto extraíble se revisaron visualmente: ciclo de vida, RF/RNF, HU, Bootstrap Workshop, Layouts y Onboarding. Los ejemplos de Reservas/Alojamientos de las guías no se incorporaron porque son otro TP.

## Inventario y trazabilidad actual

| Pantalla                 | Controlador                   | CU de E1 / justificación                   | Ida y vuelta                                                            |
| ------------------------ | ----------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| login.html               | auth.js                       | Autenticación; precondición común          | Registro, recuperación; ingreso según rol                               |
| registro.html            | auth.js                       | Alta, sin CU específico en E1              | Éxito y enlace vuelven al login                                         |
| asistencia.html          | asistencia.js                 | CU-01                                      | Menú y navegación del empleado                                          |
| menu-pedido.html         | menu-pedido.js                | CU-02, CU-03, CU-06, CU-12                 | Editar asistencia, resumen local, Mis pedidos                           |
| mis-pedidos.html         | mis-pedidos.js                | CU-04, CU-05, CU-12, CU-13                 | Modificar abre el pedido correcto; cancelar permite volver sin cambios  |
| consolidado.html         | consolidado.js                | CU-09                                      | Navegación administrativa, CSV e impresión                              |
| menuadmin.html           | menuadmin.js                  | CU-07, CU-08                               | Semanas guardadas, edición, borrador y publicación                      |
| calendario-feriados.html | calendario-feriados.js        | Extensión CU-14 documentada en evolución   | Alta, edición, habilitación de servicio y navegación administrativa     |
| mi-perfil.html           | perfil.js / accounts.js       | Soporte de cuenta; sin CU específico en E1 | Menú del rol y cierre de sesión                                         |
| usuarios.html            | usuarios.js / accounts.js     | HU-09 / CU-10                              | Autorizaciones, edición, activar/desactivar y navegación administrativa |
| recuperar.html           | recuperacion.js / recovery.js | Extensión solicitada por el responsable    | Login, correo simulado, restablecimiento                                |
| restablecer.html         | recuperacion.js / recovery.js | Extensión solicitada por el responsable    | Login o solicitar enlace nuevo si es inválido                           |

`app.js` inicia y protege las pantallas; `ui.js` comparte navegación, errores, confirmaciones y controles de contraseña. CU-11 se representa mediante aviso local; no hay envío externo. El número CU-09 corresponde al consolidado y CU-10 a usuarios, según E1, aunque tablas históricas puedan diferir.

**No sobra ninguna de las doce pantallas funcionales:** nueve vienen del conjunto de consignas, Usuarios está en el TP/E1 y las dos de recuperación fueron solicitadas expresamente. Índice, recorrido y créditos son documentación navegable, no nuevas operaciones del negocio. Se mantienen eliminadas las licencias/vacaciones y la preferencia de formato de fecha.

## Correcciones realizadas

- Índice de revisión con enlaces a todas las pantallas y guía interactiva. El servidor opcional redirige `/` al login; con Live Server se abre `frontend/login.html`.
- Bootstrap 5.3.8 Grid local, licencia incluida y CSS propio cargado después. Se usa la rejilla sin cambiar la identidad visual.
- Nombre y apellido separados y validados en registro/perfil. Las cuentas antiguas pueden ingresar; al editar el perfil deben separar sus datos. No se adivinan apellidos compuestos.
- Menús guardados con estado, fechas y opciones; selección de varios platos del catálogo sin duplicarlos al agregarlos nuevamente. Un menú nuevo debe guardarse en borrador antes de publicarse. En uno publicado el botón indica Guardar cambios publicados.
- Feriados repetidos se rechazan; para cambiar un motivo se usa Editar. Se conserva la protección de pedidos activos.
- Todas las fechas visibles usan **DD/MM/AAAA**. Se eliminó el selector de preferencia y se ignoran preferencias antiguas. Internamente se conserva ISO `AAAA-MM-DD` para comparar fechas; eso no es una opción del usuario.
- Nueve fotos representativas locales, mediante `<img>` en plantillas HTML. Sin sustitución gráfica al fallar una imagen. Fuentes y licencias en `frontend/guia/creditos.html`.
- Limpieza explícita con confirmación, limitada a las claves `sistemaPedidos:`; elimina la actividad y restaura los datos iniciales de menú.

## Adaptaciones que deben explicarse en la defensa

**No se presenta como una copia literal del ejercicio 18.** Estas decisiones conservan pedidos anteriores del responsable:

1. **Persistencia y navegación real entre pantallas.** Las guías 17/18 no piden localStorage y proponen arrays temporales/JSON independientes para Mis pedidos y perfil. Aquí se conserva el recorrido integrado solicitado: Mis pedidos y perfil muestran la cuenta realmente registrada en el prototipo. No se sembraron cuentas, pedidos ni un `usuario.json` ficticio.
2. **Administrador inicial.** El material presupone un administrador existente. El responsable pidió no tener cuentas sembradas: `empresa.json` autoriza `proadmin@gmail.com`, que completa el mismo registro y elige contraseña. El rol no se elige en el formulario.
3. **Modelo.** Los JSON iniciales separan Plato, MenuDia y MenuPlato con los nombres de la ficha. El modelo interno de la simulación agrupa días por semana y usa `users`, `orders`, `email`, etc. No es el contrato final de una API. El mapeo y sus diferencias están en `modelo-de-datos.md`. El modelo oficial completo no estuvo disponible.
4. **Administración semanal.** El TP original/E1 pide menú semanal. La interfaz edita cinco días juntos, con descripción de cada plato; no es el formulario de alta individual de MenuDia con descripción propia que ejemplifica la ficha 18. La publicación es semanal y no admite mezclar borradores/publicados dentro de una semana en los JSON iniciales. Esto requerirá adaptación si el backend publica cada día independientemente.
5. **Estados de carga.** La inicialización compartida carga los JSON y presenta carga/error. Luego pedidos y perfil leen el almacenamiento local. Para repetir una demostración del fetch inicial hay que restablecer los datos. El catálogo administrativo sí vuelve a consultar `platos.json` al actualizar. No se finge una petición de red al leer localStorage.
6. **Seguridad y automatización.** Login, roles, hash y recuperación son demostrativos. No equivalen a autorización del servidor. El recordatorio 9:45 y el consolidado 10:05 requieren la pantalla abierta; email y envío al proveedor no están implementados.
7. **Bootstrap.** Se integra su rejilla local, conservando estilos propios por decisión del responsable. No se sustituyen todos los componentes por componentes Bootstrap ni se agrega JavaScript de Bootstrap sin uso.
8. **Fechas de entrega.** El archivo 18 fija frontend completo para 22/10 y revisión de avance 15/10; el responsable pidió tenerlo preparado el 15/10. Este trabajo sigue ese objetivo. Las instrucciones docentes de subir a main no se ejecutan: el responsable hará la entrega manualmente.

## Pruebas reproducibles

Abrir Live Server, mantener un mismo origen y cerrar otras pestañas de la aplicación antes de limpiar. Para la demostración de pedidos del 15/10, usar el **19/10/2026** si ya pasó el corte del día actual.

| Prueba                                                                      | Resultado esperado                                                               |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Registrar cuenta nueva y volver al login                                    | Alta válida, sin iniciar sesión automáticamente                                  |
| Apellido vacío, email duplicado, dominio mal escrito, contraseñas distintas | Error de campo; no se crea cuenta                                                |
| Login sin registro o cuenta desactivada                                     | Aviso único de cuenta no registrada o activada                                   |
| Asistencia → menú → guardar → confirmar                                     | Borrador visible sin recarga; confirmado en Mis pedidos                          |
| Modificar un confirmado                                                     | Cambios vuelven a borrador; requiere nueva confirmación                          |
| Cancelar y elegir Volver                                                    | Conserva el pedido; confirmar cancelación lo cancela                             |
| Entrar a Usuarios como empleado                                             | Redirección a su área, sin controles administrativos                             |
| Recuperar acceso                                                            | Enlace simulado de un uso; nueva contraseña funciona, anterior no                |
| Publicar menú nuevo sin guardar                                             | Solicita guardar borrador primero                                                |
| Agregar otra vez los mismos platos del catálogo                             | No duplica las opciones vinculadas a ese plato                                   |
| Feriado duplicado / con pedidos activos                                     | Se rechaza; editar el motivo es una acción separada                              |
| Consolidado, CSV e impresión                                                | Solo confirmados; archivo descargable; impresión del navegador                   |
| Limpieza: Cancelar y luego Confirmar                                        | Cancelar conserva; confirmar elimina datos del prototipo y conserva otras claves |
| Fechas y fotos                                                              | DD/MM/AAAA fijo; imágenes locales cargadas, sin dependencia de internet          |

Para demostrar **cargando/vacío/error** del catálogo: iniciar como administrador, abrir DevTools → Network, desactivar caché, seleccionar Slow 3G y pulsar Actualizar catálogo; luego restaurar la conexión. Para vacío, guardar una copia de `data/platos.json`, poner temporalmente `[]` y actualizar. Para error, renombrar temporalmente ese archivo y actualizar. Restaurar el nombre y contenido al terminar. El test automatizado hace estas mismas situaciones interceptando respuestas, sin modificar los JSON reales. También comprueba un JSON mal formado y la recuperación posterior.

Pruebas automatizadas: `npm test`; con servidor iniciado y Playwright disponible, `node tests/browser.mjs`, `node tests/recovery-browser.mjs` y `node tests/revision-browser.mjs`. Los contextos de navegador son temporales y no crean cuentas en el Chrome personal del responsable. `CAPTURE_GUIDE=1` permite regenerar las capturas de la guía con el último recorrido. Ver `limpieza-de-pruebas.md` para limpiar el navegador de la exposición.

## Uso de IA y alcance de la comprobación

En esta revisión se utilizó Codex para leer material, auditar, **implementar cambios**, producir documentación y realizar pruebas automatizadas. No se declara esa intervención como simples consultas menores ni se certifica la comprensión individual de los integrantes. La política asistida de 17/18 limita la generación de funcionalidades completas: el grupo debe explicar la intervención real y revisar el código antes de defenderlo. La revisión técnica no sustituye esa evaluación académica.

No se hicieron commits ni push. Las entregas históricas se conservan; sus tablas actuales se complementan con este informe y la actualización de E3.

## Resultado de ejecución

El 15/10/2026 pasaron **33 pruebas de lógica**, el recorrido completo de pedidos/administración, el recorrido de recuperación y la prueba de revisión/limpieza. Se comprobaron las rutas de recursos y ausencia de IDs duplicados en los **15 HTML** (12 pantallas funcionales y 3 documentales), sintaxis de módulos y JSON. La prueba principal incluye diez pantallas a 390 px y zoom 200%; recuperación añade sus dos pantallas. Las fotografías del menú se comprobaron cargadas. La guía contiene 14 pasos y capturas de la versión revisada.

El navegador integrado en el puerto 4173 se restableció y confirmó cero actividad. Para presentar en Chrome/Live Server hay que restablecer ese origen por separado, como explica el manual.


## Ajuste final para la exposición

Empleado: navegación por semanas del mes actual, sin selector anual; límites deshabilitados y días fuera del mes ocultos. Perfil y footer sin los textos retirados. Fotos sencillas y sin recorte; créditos en `frontend/assets/img/platos/README.md`. Se conservan porciones porque la guía 18 contempla stockDisponible (páginas 6–7). Hay 14 HTML locales: 12 pantallas, índice y recorrido auxiliar; el recorrido se excluye de la entrega selectiva. README principal simplificado; instrucciones de publicación en output/pasos-para-main.md.
