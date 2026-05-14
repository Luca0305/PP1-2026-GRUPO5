# Entrega 1 — Análisis del Sistema

**Grupo**: [Grupo5]  
**Proyecto**: [Sistema de pedidos]  
**Fecha de entrega**: 30/04/2026

---

## 1. Identificación de Actores

## 1. Identificación de Actores

| Actor | Rol / Función en el sistema | Tipo |
|-------|-----------------------------|------|
| Empleado | Configura su asistencia, consulta el menú y gestiona sus pedidos de almuerzo. | Usuario final |
| Administrador | Gestiona el catálogo de menús, usuarios y genera el reporte para el proveedor. | Administrador |
| Servicio de Notificaciones | Sistema externo que envía alertas y el consolidado final al proveedor. | Sistema externo |

## 2. Requisitos Funcionales

| ID | Descripción | Actor | HU relacionada |
|-------|-------------|-------|----------------|
| RF-01 | Permitir al Empleado configurar sus días de asistencia semanal. | Empleado | HU-01 |
| RF-02 | Mostrar al Empleado el menú de los días que configuró como asistencia. | Empleado | HU-02 |
| RF-03 | Permitir al Empleado registrar su pedido antes de las 10:00 AM. | Empleado | HU-03 |
| RF-04 | Permitir al Empleado modificar su pedido antes del horario de corte. | Empleado | HU-04 |
| RF-05 | Permitir al Empleado cancelar su pedido antes del horario de corte. | Empleado | HU-05 |
| RF-06 | Permitir agregar comentarios o aclaraciones (alergias/preferencias) al pedido. | Empleado | HU-06 |
| RF-07 | Validar las reglas de negocio (horario, stock, asistencia) antes de confirmar un pedido. | Sistema | HU-03, HU-04 |
| RF-08 | Permitir al Administrador gestionar (CRUD) las opciones de menú en estado borrador. | Administrador | HU-07 |
| RF-09 | Permitir al Administrador publicar el menú semanal para hacerlo visible a los empleados. | Administrador | HU-11 |
| RF-10 | Generar el consolidado de pedidos del día automáticamente a las 10:05 AM. | Sistema | HU-08 |
| RF-11 | Enviar el consolidado al Servicio de Notificaciones para su distribución al proveedor. | Administrador | HU-08 |
| RF-12 | Enviar un recordatorio a las 9:45 AM a los empleados que aún no realizaron su pedido. | Servicio de Notificaciones | HU-10 |
| RF-13 | Permitir al Administrador gestionar usuarios (alta, baja y modificación). | Administrador | HU-09 |

> Cada requisito debe describir una acción concreta: "El sistema debe permitir que [actor] [acción]..."

## 3. Requisitos No Funcionales

| ID | Categoría | Descripción |
|--------|----------------|-------------|
| RNF-01 | Usabilidad | El flujo de registro de pedido debe completarse en un máximo de 3 pasos (clics). |
| RNF-02 | Rendimiento | Soporte de 80 usuarios concurrentes con tiempos de respuesta menores a 3 segundos. |
| RNF-03 | Seguridad | Comunicación cifrada mediante protocolo HTTPS con certificados TLS 1.2 o superior. |
| RNF-04 | Seguridad | Almacenamiento de contraseñas mediante hashing seguro con algoritmo BCrypt. |
| RNF-05 | Disponibilidad | Disponibilidad del 99.9% durante la ventana crítica de pedidos (07:00 a 11:00 AM). |
| RNF-06 | Portabilidad | Acceso desde Chrome, Firefox, Edge y Safari en versiones de los últimos 2 años. |
## 4. Historias de Usuario

| ID | Como... | Quiero... | Para... |
|-------|---------------|----------------------------|------------------------------------|
| HU-01 | Empleado | configurar mis días de asistencia semanal | ver solo el menú de los días que voy a la oficina. |
| HU-02 | Empleado | consultar las opciones de menú | elegir mi almuerzo con anticipación. |
| HU-03 | Empleado | registrar mi pedido de almuerzo | asegurar mi vianda diaria. |
| HU-04 | Empleado | modificar mi pedido antes del corte | corregir mi elección si cambié de opinión. |
| HU-05 | Empleado | cancelar mi pedido antes del corte | evitar el desperdicio si no voy a almorzar. |
| HU-06 | Empleado | agregar comentarios sobre preferencias | que la cocina considere mis restricciones alimentarias. |
| HU-07 | Administrador | gestionar (CRUD) las opciones del menú | preparar la oferta semanal sin que sea visible aún. |
| HU-11 | Administrador | publicar el menú semanal | que los empleados lo visualicen y comiencen a pedir. |
| HU-08 | Administrador | generar el consolidado de pedidos | informar al proveedor la cantidad exacta de viandas. |
| HU-09 | Administrador | gestionar los usuarios del sistema | mantener actualizada la nómina de empleados habilitados. |
| HU-10 | Empleado | recibir un recordatorio antes del corte | no olvidarme de pedir mi almuerzo. |

## 5. Diagrama de Casos de Uso

> Insertar imagen del diagrama exportado desde Draw.io, Lucidchart, StarUML o similar.  
> Guardar la imagen en esta misma carpeta (`docs/`) y referenciarla abajo.

![Diagrama de Casos de Uso](./diagrama-casos-de-uso.png)

## 6. Especificación de Casos de Uso

### CU-01 — Configurar asistencia semanal

| Campo | Detalle |
|------|---------|
| Actor principal | Empleado |
| Descripción | El empleado indica los días de la semana en que asistirá a la oficina. Esta configuración determina para qué días el sistema le mostrará el menú y habilitará el registro de pedidos. |
| Precondiciones | El empleado está autenticado en el sistema. La semana a configurar aún no ha comenzado o el administrador habilitó la edición. |
| Postcondiciones (criterios de aceptación) | La asistencia semanal queda registrada. El sistema habilita el menú únicamente para los días seleccionados. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado ingresa al sistema con sus credenciales. | 1.1 Credenciales incorrectas → el sistema muestra un mensaje de error y no permite el acceso. |
| 2. Accede a la sección "Mi asistencia semanal". | |
| 3. El sistema muestra la semana actual con los días disponibles para seleccionar. | 3.1 La semana ya fue cerrada → el sistema informa que no es posible modificar la asistencia. |
| 4. El empleado selecciona los días en que asistirá. | 4.1 El empleado no selecciona ningún día → el sistema solicita seleccionar al menos uno. |
| 5. El empleado confirma su selección. | |
| 6. El sistema registra la asistencia y muestra una confirmación. | 6.1 Error al guardar → el sistema muestra un mensaje de error y solicita reintentar. |

### CU-02 — Consultar menú semanal

| Campo | Detalle |
|------|---------|
| Actor principal | Empleado |
| Descripción | El empleado visualiza las opciones de almuerzo disponibles para cada día de la semana en que tiene registrada asistencia. |
| Precondiciones | El empleado está autenticado. Tiene asistencia configurada para al menos un día (CU-01). El Administrador publicó el menú semanal (CU-07). |
| Postcondiciones (criterios de aceptación) | El empleado visualiza el menú con las opciones disponibles para los días que asiste. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado accede a la sección "Menú semanal". | 1.1 No tiene asistencia configurada → el sistema lo redirige a CU-01 con un aviso. |
| 2. El sistema obtiene la asistencia registrada del empleado. | |
| 3. El sistema muestra el menú únicamente para los días con asistencia confirmada. | 3.1 El menú no fue publicado para algún día → el sistema indica "Menú no disponible aún". |
| 4. El empleado navega entre los días y visualiza las opciones de cada uno. | |

### CU-03 — Registrar pedido del día
| Campo | Detalle |
|------|---------|
| Actor principal | Empleado |
| Incluye | *CU-12 (Validar pedido)* |
| Precondiciones | Autenticado, asistencia registrada y menú publicado. |
| Postcondiciones | Pedido guardado y confirmado visualmente. |

| Secuencia Normal | Excepciones |
|------------------|-------------|
| 1. El empleado selecciona una opción del menú. | 1.1 Ya pasó el horario de corte (10 AM) -> Fin de CU. |
| 2. Se invoca *CU-12 (Validar pedido)*. | 2.1 Validación falla -> Se informa el motivo. |
| 3. El sistema registra el pedido. | |

### CU-04 — Modificar pedido

| Campo | Detalle |
|------|---------|
| Actor principal | Empleado |
| Descripción | El empleado cambia la opción de almuerzo de un pedido ya registrado, siempre que el horario de corte no haya vencido. |
| Precondiciones | El empleado está autenticado. Existe un pedido registrado para el día. El horario actual es anterior a las 10:00 AM del día del pedido. |
| Postcondiciones (criterios de aceptación) | El pedido queda actualizado con la nueva opción seleccionada. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado accede a su pedido del día y selecciona "Modificar pedido". | 1.1 El horario de corte ya pasó → el sistema informa que no es posible modificar el pedido. |
| 2. El sistema muestra el pedido actual y las opciones del menú disponibles. | |
| 3. El empleado selecciona una nueva opción de almuerzo. | 3.1 El empleado selecciona la misma opción → el sistema informa que no se realizaron cambios. |
| 4. El empleado confirma el cambio. | 4.1 El empleado cancela → el pedido original no se modifica. |
| 5. El sistema actualiza el pedido y muestra confirmación. | 5.1 Error al guardar → el sistema notifica el error y mantiene el pedido original. |

### CU-05 — Cancelar pedido

| Campo | Detalle |
|------|---------|
| Actor principal | Empleado |
| Descripción | El empleado cancela un pedido de almuerzo ya registrado, siempre que no haya vencido el horario de corte. |
| Precondiciones | El empleado está autenticado. Existe un pedido registrado para el día. El horario actual es anterior a las 10:00 AM del día del pedido. |
| Postcondiciones (criterios de aceptación) | El pedido queda cancelado. El empleado recibe confirmación de la cancelación. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado accede a su pedido del día y selecciona "Cancelar pedido". | 1.1 El horario de corte ya pasó → el sistema informa que no es posible cancelar el pedido. |
| 2. El sistema solicita confirmación de la cancelación. | 2.1 El empleado no confirma → el pedido se mantiene sin cambios. |
| 3. El empleado confirma la cancelación. | |
| 4. El sistema cancela el pedido y muestra confirmación. | 4.1 Error al procesar → el sistema notifica el error y el pedido permanece activo. |

### CU-06 — Agregar comentario al pedido

| Campo | Detalle |
|------|---------|
| Actor principal | Empleado |
| Descripción | El empleado agrega una aclaración o comentario a su pedido (restricciones alimentarias, preferencias de preparación, etc.). |
| Precondiciones | El empleado está autenticado. Existe un pedido registrado o está en proceso de registro. El horario de corte no ha vencido. |
| Postcondiciones (criterios de aceptación) | El comentario queda asociado al pedido y visible en el consolidado. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. Durante el registro o modificación del pedido, el empleado accede al campo "Comentarios". | 1.1 El horario de corte ya pasó → no es posible agregar ni modificar el comentario. |
| 2. El empleado escribe su comentario (máximo 200 caracteres). | 2.1 El comentario supera el límite → el sistema informa el límite y no permite guardar hasta corregirlo. |
| 3. El empleado guarda el pedido con el comentario incluido. | |
| 4. El sistema almacena el comentario asociado al pedido y muestra confirmación. | 4.1 Error al guardar → el sistema notifica el error. |

### CU-07 — Administrar menú semanal (CRUD)
| Campo | Detalle |
|------|---------|
| Actor principal | Administrador |
| Descripción | Permite cargar, editar o borrar opciones de menú en estado *Borrador*. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El administrador accede a "Gestión de menús" y selecciona "Nuevo menú semanal". | 1.1 Ya existe un menú publicado para esa semana → el sistema ofrece la opción de editarlo (ver CU-08). |
| 2. El sistema muestra el formulario con los días de la semana. | |
| 3. El administrador carga al menos una opción de almuerzo para cada día. | 3.1 Algún día queda sin opciones → el sistema alerta y solicita completarlo o marcarlo como "Sin servicio". |
| 4. El administrador revisa el menú completo y selecciona "Publicar". | 4.1 El administrador cancela → el menú se guarda como borrador sin publicar. |
| 5. El sistema publica el menú y lo hace visible para los empleados. | 5.1 Error al publicar → el sistema notifica y mantiene el estado anterior. |
| 6. El sistema notifica a los empleados que el menú está disponible. | 6.1 Fallo en el Servicio de Notificaciones → el menú queda publicado igual, se registra el error. |

### CU-08 — Publicar menú semanal
| Campo | Detalle |
|------|---------|
| Actor principal | Administrador |
| Descripción | Cambia el estado del menú de *Borrador* a *Publicado*, haciéndolo visible para los empleados. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El administrador accede a "Gestión de menús" y selecciona el menú a modificar. | 1.1 El día ya comenzó → el sistema informa que no es posible modificar ese día. |
| 2. El sistema muestra el menú actual del día seleccionado. | |
| 3. El administrador modifica, agrega o elimina opciones. | 3.1 Elimina una opción con pedidos activos → el sistema alerta cuántos pedidos están afectados y solicita confirmación. |
| 4. El administrador confirma los cambios. | 4.1 El administrador cancela → no se realizan cambios. |
| 5. El sistema guarda los cambios y actualiza el menú visible. | 5.1 Error al guardar → el sistema notifica y mantiene el estado previo. |
| 6. Si hay pedidos afectados, el sistema notifica a los empleados correspondientes. | 6.1 Fallo en notificaciones → se registra el error, los cambios se guardan igual. |

### CU-09 — Generar consolidado de pedidos
| Campo | Detalle |
|------|---------|
| Actor principal | Sistema / Administrador |
| Descripción | A las 10:05 AM el sistema agrupa pedidos y los envía al Servicio de Notificaciones (Proveedor). |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El administrador accede a "Pedidos del día" y selecciona "Generar consolidado". | 1.1 No hay pedidos para el día → el sistema informa que no hay datos para consolidar. |
| 2. El sistema reúne todos los pedidos confirmados del día. | |
| 3. El sistema agrupa los pedidos por opción de menú y calcula totales. | |
| 4. El sistema muestra el consolidado con detalle por opción y total general. | |
| 5. El administrador puede descargar el consolidado o enviarlo mediante el Servicio de Notificaciones. | 5.1 Error al enviar → el sistema notifica el error y mantiene el consolidado disponible. |
| 6. El sistema registra la fecha y hora de generación del consolidado. | |

### CU-10 — Gestionar usuarios

| Campo | Detalle |
|------|---------|
| Actor principal | Administrador |
| Descripción | El administrador da de alta, modifica datos o desactiva empleados en el sistema. |
| Precondiciones | El administrador está autenticado con permisos de administración de usuarios. |
| Postcondiciones (criterios de aceptación) | Los cambios quedan registrados. En alta, el empleado recibe sus credenciales. En baja, el usuario pierde el acceso al sistema. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El administrador accede a "Gestión de usuarios". | |
| 2. El sistema muestra el listado de usuarios con opciones de alta, edición y baja. | |
| 3a. *Alta:* El administrador completa el formulario con los datos del nuevo empleado. | 3a.1 El email ya existe en el sistema → el sistema alerta y solicita corrección. |
| 3b. *Modificación:* El administrador selecciona un usuario y edita sus datos. | 3b.1 Datos inválidos → el sistema indica los campos con error y no guarda hasta corregirlos. |
| 3c. *Baja:* El administrador selecciona un usuario y lo desactiva. | 3c.1 El usuario tiene pedidos activos → el sistema alerta y solicita confirmación. |
| 4. El administrador confirma la acción. | 4.1 El administrador cancela → no se realizan cambios. |
| 5. El sistema aplica los cambios. En alta, envía credenciales al nuevo empleado. | 5.1 Error al guardar → el sistema notifica el error. |

### CU-11 — Enviar recordatorio a empleados
| Campo | Detalle |
|------|---------|
| Actor principal | Servicio de Notificaciones |
| Descripción | A las 9:45 AM se envía un aviso automático a quienes tienen asistencia pero no realizaron su pedido. |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema verifica automáticamente a las 9:45 AM qué empleados con asistencia no tienen pedido. | 1.1 Todos los empleados ya tienen pedido → el sistema no envía recordatorios y registra la verificación. |
| 2. El sistema genera la lista de empleados a notificar. | |
| 3. El sistema envía la lista al Servicio de Notificaciones. | 3.1 El servicio no responde → el sistema reintenta 2 veces con 1 minuto de espera. Si persiste, registra el error. |
| 4. El Servicio de Notificaciones envía el recordatorio a cada empleado. | 4.1 Un empleado no puede recibir la notificación → se registra el error y se continúa con el resto. |
| 5. El sistema registra el envío exitoso con fecha y hora. | |

### CU-12 — Validar pedido (Reutilizable)
| Campo | Detalle |
|------|---------|
| Actor principal | Sistema |
| Descripción | Valida que el pedido cumpla las reglas de negocio antes de impactar la base de datos. |

| Verificaciones Secuenciales |
|-----------------------------|
| 1. ¿El horario actual es anterior a las 10:00 AM? |
| 2. ¿El empleado tiene asistencia confirmada para el día seleccionado? |
| 3. ¿El empleado se encuentra en un periodo de licencia o vacaciones? |
| 4. ¿La opción elegida tiene disponibilidad de stock (si aplica)? |

> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
