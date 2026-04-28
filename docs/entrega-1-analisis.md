# Entrega 1 — Análisis del Sistema

**Grupo**: [Grupo5]  
**Proyecto**: [Sistema de pedidos]  
**Fecha de entrega**: 30/04/2026

---

## 1. Identificación de Actores

| Actor | Rol / Función en el sistema | Tipo (usuario final, sistema externo, etc.) |
|-------|-----------------------------|---------------------------------------------|
|   Empleado    |      Consulta el menu y realiza su pedido de almuerzo                      |        Usuario final                                   |
| Coordinador   | Supervisa pedidos, controla informacion y controla el sistema              | Administrador                                          |
| Proveedor     | Publica el menu y recibe la lista consolidada de pedidos                   | Sistema externo                                        |
| Sistema       | Procesa pedidos, consolida informacion y envia resultados                  | Sistema interno                                        |
| Servicio de email | Envia recordatorios a empleados | Sistema externo  |

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
| *RNF-01* | *Usabilidad* | El pedido se tiene que poder hacer en menos de 1 minuto; tiene que ser algo rápido y sencillo. |
| *RNF-02* | *Rendimiento* | La plataforma tiene que bancarse a los 80 usuarios entrando todos juntos a las 9:55 AM. |
| *RNF-03* | *Seguridad* | Los reportes de costos y la gestión de usuarios son solo para el rol de Coordinador. |

## 4. Historias de Usuario

| ID    | Como...       | Quiero...                  | Para...                            |
|-------|---------------|----------------------------|------------------------------------|
| HU-01 | Empleado,| pedir mi almuerzo desde una web,| no depender de un Excel compartido y asegurarme de que mi vianda llegue bien.|
| HU-02 | Coordinador,|ver cuánto se gasta por mes en almuerzos,| controlar el presupuesto de la empresa de forma fácil.|
| HU-03 | Proveedor,| recibir el total de pedidos consolidado,| cocinar la cantidad justa y no desperdiciar comida ni plata.|
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
| 1. El empleado ingresa al sistema | |
| 2. El sistema muestra el menú disponible | |

### CU-02 — Realizar pedido de almuerzo
| Campo | Detalle |
|------|---------|
| *Actor principal* | Empleado |
| *Descripción* | El empleado selecciona y registra su pedido |
| *Precondiciones* | El menú está disponible |
| *Postcondiciones (criterios de aceptación)* | El pedido queda registrado |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El empleado consulta el menú | |
| 2. Selecciona una opción | |
| 3. Confirma el pedido | |
| 4. El sistema guarda el pedido | 3.1 Si no confirma → no se registra |

### CU-03 — Publicar menú
| Campo | Detalle |
|------|---------|
| *Actor principal* | Proveedor |
| *Descripción* | El proveedor carga el menú del día |
| *Precondiciones* | El proveedor tiene acceso al sistema |
| *Postcondiciones (criterios de aceptación)* | El menú queda disponible para los empleados |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El proveedor ingresa al sistema | |
| 2. Carga el menú | |
| 3. El sistema guarda el menú | |

### CU-04 — Consolidar información
| Campo | Detalle |
|------|---------|
| *Actor principal* | Sistema |
| *Descripción* | El sistema reúne todos los pedidos realizados |
| *Precondiciones* | Existen pedidos cargados |
| *Postcondiciones (criterios de aceptación)* | Se genera una lista consolidada |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema recopila pedidos | |
| 2. Agrupa la información | |
| 3. Genera lista consolidada | |

### CU-05 — Recibir lista de pedidos
| Campo | Detalle |
|------|---------|
| *Actor principal* | Proveedor |
| *Descripción* | El proveedor recibe la lista de pedidos |
| *Precondiciones* | La lista fue generada |
| *Postcondiciones (criterios de aceptación)* | El proveedor obtiene la lista correctamente |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema envía la lista | |
| 2. El proveedor la recibe | |

### CU-06 — Supervisar pedidos
| Campo | Detalle |
|------|---------|
| *Actor principal* | Coordinador |
| *Descripción* | El coordinador controla los pedidos realizados |
| *Precondiciones* | Existen pedidos en el sistema |
| *Postcondiciones (criterios de aceptación)* | Los pedidos son visualizados correctamente |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El coordinador ingresa al sistema | |
| 2. Visualiza los pedidos | |

### U-07 — Controlar sistema
| Campo | Detalle |
|------|---------|
| *Actor principal* | Coordinador |
| *Descripción* | El coordinador administra el sistema |
| *Precondiciones* | El coordinador tiene permisos |
| *Postcondiciones (criterios de aceptación)* | Cambios aplicados correctamente |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. Accede a configuración | |
| 2. Realiza cambios | |
| 3. El sistema guarda cambios | |

### CU-08 — Enviar recordatorios
| Campo | Detalle |
|------|---------|
| *Actor principal* | Sistema |
| *Descripción* | El sistema envía recordatorios a empleados |
| *Precondiciones* | Existen empleados sin pedido |
| *Postcondiciones (criterios de aceptación)* | Recordatorios enviados correctamente |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|--------------------------------|----------------------------|
| 1. El sistema detecta faltantes | |
| 2. Envía recordatorio | |
| 3. El servicio de email lo entrega | 2.1 Error en envío |

> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
