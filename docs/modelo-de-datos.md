# Modelo actual y correspondencia con la ficha 18

Documento de implementación del grupo, **no copia del modelo oficial de Moodle**, que no estuvo disponible. Sirve para explicar el prototipo y preparar la integración futura.

| Entidad de la ficha | JSON inicial / campos                                                     | Representación local actual                                                                                         |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Plato               | `platos.json`: id, nombre, descripcion, categoria                         | Se consulta para el catálogo; nombre y descripción se incluyen en las opciones internas                             |
| MenuDia             | `menus.json`: id, fecha, descripcion, publicado, idUsuarioCreador         | `menus[]`: semana (`week`), estado (`status`), días (`days[]`)                                                      |
| MenuPlato           | `menu-platos.json`: id, idMenuDia, idPlato, stockDisponible               | `days[].options[]`: id, idPlato, name, description, stock, vegetarian, glutenFree                                   |
| DiaNoLaborable      | `dias-no-laborables.json`: lista de id, fecha, motivo; inicialmente vacía | `holidays`: objeto cuya clave es la fecha ISO y valor es el motivo                                                  |
| Usuario             | Se crea mediante registro; no hay cuenta fija en JSON                     | `users[]`: id, firstName, lastName, name completo, email, role, active, pending, auth, sessionVersion               |
| Pedido / PedidoDia  | Se crea desde la selección del empleado                                   | `orders[]`: identificador, userId, fecha, opción y estado; consultar `saveOrder` en core.js para el objeto completo |
| Asistencia          | Selección del empleado por semana                                         | `attendance[userId][week]`: fechas ISO                                                                              |
| Consolidado         | Consulta derivada, no catálogo                                            | `reports[fecha]`: resultado local generado; datos agrupados desde confirmados                                       |

Los JSON iniciales relacionan opciones mediante `idMenuDia` e `idPlato`; un Plato no incluye día de la semana. Son nueve platos, diez MenuDia y treinta MenuPlato. `empresa.json` es configuración adicional de autorización, no Usuario.

El adaptador de inicialización en `core.js` convierte esos JSON a semanas. La política actual exige un estado de publicación uniforme por semana. No se puede afirmar que bastará con cambiar una URL para conectar el backend: habrá que sustituir la persistencia local y mapear las entidades.

Correspondencias previstas: `firstName → nombre`, `lastName → apellido`, `email → correo`, `active → activo`, `role empleado/admin → EMPLEADO/ADMINISTRADOR` (confirmar enum oficial). Un día interno se corresponderá con MenuDia; cada opción con MenuPlato. `stock` es el cupo total; la disponibilidad se calcula descontando confirmados, por lo que no debe enviarse ciegamente como stock restante.

Las funciones de negocio (`register`, `saveProfile`, `saveOrder`, `saveMenu`, `setHoliday`, etc.) están separadas de la UI. En la integración se reemplazará su acceso al almacenamiento, con validación y autorización del servidor. No enviar al servidor la estructura `sistemaPedidos:v1` como si fuera el contrato de la API.

Las fechas se guardan en ISO para comparaciones y se presentan siempre en **DD/MM/AAAA**. Las claves de almacenamiento están documentadas en `limpieza-de-pruebas.md`.
