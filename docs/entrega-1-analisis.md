# Entrega 1 — Análisis del Sistema

**Grupo**: [Grupo5]  
**Proyecto**: [Sistema de pedidos]  
**Fecha de entrega**: 30/04/2026

---

## 1. Identificación de Actores

| Actor | Rol / Función en el sistema | Tipo (usuario final, sistema externo, etc.) |
|-------|-----------------------------|---------------------------------------------|
|   Empleado    |      Consulta el menu y realiza su pedido de almuerzo                      |        Usuario final                                          |
| Coordinador   | Supervisa pedidos, controla informacion y controla el sistema              | Administrador                                  |
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

### CU-01 — [Nombre del caso de uso]

| Campo | Detalle |
|---|---|
| **Actor principal** | |
| **Descripción** | |
| **Precondiciones** | |
| **Postcondiciones (criterios de aceptación)** | |

| Secuencia Normal (Camino feliz) | Excepciones / Alternativas |
|---|---|
| 1.  |  |
| 2.  |  |
| 3.  |  |

---

> Repetir la ficha completa para cada caso de uso del diagrama.
> Las excepciones se numeran ligadas al paso del que se desvían (ej: 4.1 en la misma fila que el paso 4).
