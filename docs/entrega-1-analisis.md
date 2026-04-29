# Entrega 1 — Análisis del Sistema

**Grupo**: [Grupo5]  
**Proyecto**: [Sistema de pedidos]  
**Fecha de entrega**: 30/04/2026

---

## 1. Identificación de Actores

| Actor | Rol / Función en el sistema | Tipo (usuario final, sistema externo, etc.) |
|-------|-----------------------------|---------------------------------------------|
| Empleado | Configura su asistencia semanal, consulta el menú disponible para los días que asiste y registra, modifica o cancela su pedido de almuerzo. | Usuario final |
| Administrador | Publica y administra los menús semanales, gestiona los usuarios del sistema y genera el consolidado de pedidos. | Administrador |
| Servicio de Notificaciones | Envía recordatorios y avisos a los empleados cuando no realizaron su pedido o cuando hay cambios en el menú. | Sistema externo |
## 2. Requisitos Funcionales

| ID    | Descripción | Actor | HU relacionada |
|-------|-------------|-------|----------------|
| *RF-01* | El sistema debe dejar que el Proveedor suba el menú antes de que termine el día anterior. | Proveedor | HU-03 |
| *RF-02* | El sistema debe permitir al Empleado elegir su plato antes de las 10:00 AM (horario de corte). | Empleado | HU-01 |
| *RF-03* | El sistema debe bloquear el pedido si el usuario tiene cargada una licencia o vacaciones. | Sistema | HU-01 |
| *RF-04* | El sistema tiene que mandar la lista total a la cocina de forma automática a las 10:05 AM. | Sistema | HU-03 |
| *RF-05* | El sistema debe permitir al Coordinador filtrar y ver los gastos mensuales por sector o empleado. | Coordinador | HU-02 |

> Cada requisito debe describir una acción concreta: "El sistema debe permitir que [actor] [acción]..."

## 3. Requisitos No Funcionales

| ID     | Categoría (rendimiento, seguridad, usabilidad, etc.) | Descripción |
|--------|------------------------------------------------------|-------------|
| RNF-01 | Usabilidad | El flujo completo de registro de pedido debe poder completarse en menos de 60 segundos por un usuario sin capacitación previa. |
| RNF-02 | Rendimiento | El sistema debe soportar al menos 80 usuarios concurrentes sin degradación, manteniendo tiempos de carga inferiores a 3 segundos por pantalla. |
| RNF-03 | Seguridad | Toda comunicación entre el cliente y el servidor debe realizarse mediante HTTPS con certificados TLS 1.2 o superior. |
| RNF-04 | Seguridad | Las contraseñas deben almacenarse con hash seguro (bcrypt o equivalente) y tener mínimo 8 caracteres con al menos una mayúscula y un número. |
| RNF-05 | Disponibilidad | El sistema debe estar disponible al menos el 99% del tiempo en días hábiles, con mantenimiento planificado fuera del horario laboral (07:00–18:00). |
| RNF-06 | Portabilidad | El sistema debe ser accesible desde navegadores modernos (Chrome, Firefox, Edge, Safari) en sus versiones de los últimos 2 años, sin instalar software adicional. |
## 4. Historias de Usuario

| ID    | Como...       | Quiero...                  | Para...                            |
|-------|---------------|----------------------------|------------------------------------|
| HU-01 | Empleado, | configurar mis días de asistencia semanal en el sistema, | que el sistema solo me muestre el menú de los días que voy a ir a la oficina y no me pida pedir almuerzo cuando tengo licencia o vacaciones. |
| HU-02 | Empleado, | consultar el menú semanal con las opciones disponibles para cada día que asisto, | poder planificar mis almuerzos con anticipación y elegir la opción que prefiero. |
| HU-03 | Empleado, | registrar mi pedido de almuerzo para el día, | asegurarme de que mi vianda esté preparada y no quedarme sin almuerzo. |
| HU-04 | Empleado, | modificar mi pedido antes del horario de corte, | poder cambiar mi elección si me arrepiento o si cambian mis planes. |
| HU-05 | Empleado, | cancelar mi pedido antes del horario de corte, | no generar una vianda que no voy a consumir si decido no almorzar ese día. |
| HU-06 | Empleado, | agregar un comentario a mi pedido indicando preferencias o restricciones alimentarias, | que la cocina tenga en cuenta mis necesidades sin tener que contactar a nadie por separado. |
| HU-07 | Administrador, | publicar y administrar el menú semanal con las opciones de almuerzo para cada día, | que los empleados puedan consultarlo y realizar sus pedidos con antelación. |
| HU-08 | Administrador, | generar y acceder al consolidado de pedidos del día, | enviárselo al proveedor y tener el control de cuántas viandas se necesitan por opción. |
| HU-09 | Administrador, | gestionar los usuarios del sistema (altas, bajas y modificaciones), | mantener actualizado el listado de empleados habilitados para usar el sistema. |
| HU-10 | Empleado, | recibir un recordatorio antes del horario de corte si todavía no hice mi pedido, | no olvidarme de registrarlo y evitar quedarme sin almuerzo. |
## 5. Diagrama de Casos de Uso

> Insertar imagen del diagrama exportado desde Draw.io, Lucidchart, StarUML o similar.  
> Guardar la imagen en esta misma carpeta (`docs/`) y referenciarla abajo.

![Diagrama de Casos de Uso](./diagrama-casos-de-uso.png)

## 6. Especificación de Casos de Uso

### CU-01 — Consultar menú


| Campo | Detalle |
|------|---------|
| *Actor principal* | Empleado |
| *Descripción* | El empleado consulta el menú disponible |
| *Precondiciones* | El menú debe estar cargado por el proveedor |
| *Postcondiciones (criterios de aceptación)* | El menú se muestra correctamente |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado ingresa al sistema | 1.1 Error de acceso → no puede ingresar |
| 2. Solicita ver el menú | |
| 3. El sistema muestra el menú | 3.1 No hay menú cargado → se informa al usuario |

### CU-02 — Realizar pedido de almuerzo

| Campo | Detalle |
|------|---------|
| *Actor principal* | Empleado |
| *Descripción* | El empleado selecciona y registra su pedido |
| *Precondiciones* | El menú está disponible |
| *Postcondiciones (criterios de aceptación)* | El pedido queda registrado |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado ingresa al sistema | |
| 2. Consulta el menú | |
| 3. Selecciona una opción | 3.1 No hay opciones disponibles → no puede seleccionar |
| 4. Confirma el pedido | 4.1 No confirma → el pedido no se registra |
| 5. El sistema guarda el pedido | 5.1 Error al guardar → se notifica al usuario |
### CU-03 — Publicar menú
| Campo | Detalle |
|------|---------|
| *Actor principal* | Proveedor |
| *Descripción* | El proveedor carga el menú |
| *Precondiciones* | El proveedor tiene acceso |
| *Postcondiciones (criterios de aceptación)* | El menú queda disponible |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El proveedor ingresa al sistema | 1.1 Error de acceso → no puede ingresar |
| 2. Carga el menú | 2.1 Datos incompletos → no se guarda |
| 3. El sistema guarda el menú | 3.1 Error del sistema → no se publica |
### CU-04 — Consolidar información
| Campo | Detalle |
|------|---------|
| *Actor principal* | Sistema |
| *Descripción* | El sistema reúne los pedidos |
| *Precondiciones* | Hay pedidos cargados |
| *Postcondiciones (criterios de aceptación)* | Lista consolidada generada |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema obtiene los pedidos | 1.1 No hay pedidos → no se genera lista |
| 2. Agrupa la información | |
| 3. Genera lista consolidada | 3.1 Error de procesamiento |

### CU-05 — Recibir lista de pedidos
| Campo | Detalle |
|------|---------|
| *Actor principal* | Proveedor |
| *Descripción* | El proveedor recibe la lista |
| *Precondiciones* | Lista generada |
| *Postcondiciones (criterios de aceptación)* | Lista recibida correctamente |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema envía la lista | 1.1 Error de envío |
| 2. El proveedor recibe la lista | 2.1 No recibe → reintento |

### CU-06 — Supervisar pedidos
| Campo | Detalle |
|------|---------|
| *Actor principal* | Coordinador |
| *Descripción* | Controla pedidos realizados |
| *Precondiciones* | Existen pedidos |
| *Postcondiciones (criterios de aceptación)* | Pedidos visualizados |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El coordinador ingresa | 1.1 Error de acceso |
| 2. Consulta pedidos | 2.1 No hay pedidos disponibles |

### U-07 — Controlar sistema
| Campo | Detalle |
|------|---------|
| *Actor principal* | Coordinador |
| *Descripción* | El coordinador administra y configura el sistema |
| *Precondiciones* | El coordinador tiene permisos de administrador |
| *Postcondiciones (criterios de aceptación)* | Los cambios se guardan correctamente en el sistema |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El coordinador ingresa al sistema | 1.1 Error de acceso → no puede ingresar |
| 2. Accede a la configuración | |
| 3. Realiza cambios en el sistema | 3.1 Datos inválidos → no se aplican cambios |
| 4. El sistema guarda los cambios | 4.1 Error al guardar → se notifica |
### CU-08 — Enviar recordatorios
| Campo | Detalle |
|------|---------|
| *Actor principal* | Sistema |
| *Descripción* | Envía recordatorios a empleados |
| *Precondiciones* | Hay empleados sin pedido |
| *Postcondiciones (criterios de aceptación)* | Recordatorios enviados |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema detecta empleados sin pedido | |
| 2. Envía recordatorio | 2.1 Error en envío → se registra error |
| 3. El servicio de email entrega el mensaje | 3.1 Fallo del servicio → reintento |
> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
