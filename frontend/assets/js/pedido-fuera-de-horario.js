// Mejora · Pedido fuera de horario (solo administrador).
//   GET  /api/usuarios/empleados?idUsuario       → a quién se le puede cargar
//   GET  /api/menus?desde&hasta                  → días con menú publicado y sus opciones
//   POST /api/pedidos/fuera-de-horario           → crea el pedido CONFIRMADO
// La regla (solo el administrador, saltea solo la hora de corte) la aplica el backend.
import {
  user,
  clock,
  addDays,
  dateLabel,
  categoryLabel,
  escapeHTML as esc,
} from "./core.js";
import { $, bindForm, message, confirmAction } from "./ui.js";
import { api } from "./api.js";

const DIAS_HACIA_ADELANTE = 21;

export async function init() {
  const u = user();
  const hoy = clock().today;
  const [empleados, menus] = await Promise.all([
    api.empleados(u.id),
    api.menus(hoy, addDays(hoy, DIAS_HACIA_ADELANTE)),
  ]);

  $("#empleado").innerHTML =
    '<option value="">Elegí un empleado…</option>' +
    empleados
      .map((e) => `<option value="${e.id}">${esc(e.apellido)}, ${esc(e.nombre)} · ${esc(e.correo)}</option>`)
      .join("");

  const conOpciones = menus.filter((m) => m.opciones.length);
  $("#dia").innerHTML = conOpciones.length
    ? conOpciones
        .map((m) => `<option value="${m.id}">${esc(dateLabel(m.fecha))}${m.fecha === hoy ? " (hoy)" : ""}</option>`)
        .join("")
    : '<option value="">No hay menús publicados desde hoy</option>';

  function opcionesDelDia() {
    const menu = conOpciones.find((m) => String(m.id) === $("#dia").value);
    if (!menu) {
      $("#plato").innerHTML = '<option value="">—</option>';
      return;
    }
    const porCategoria = new Map();
    for (const o of menu.opciones) {
      if (!porCategoria.has(o.categoria)) porCategoria.set(o.categoria, []);
      porCategoria.get(o.categoria).push(o);
    }
    $("#plato").innerHTML =
      '<option value="">Elegí un plato…</option>' +
      [...porCategoria]
        .map(
          ([categoria, lista]) =>
            `<optgroup label="${esc(categoryLabel(categoria))}">${lista
              .map(
                (o) =>
                  `<option value="${o.idPlato}" ${o.disponibles <= 0 ? "disabled" : ""}>${esc(o.nombre)} · ${o.disponibles > 0 ? o.disponibles + " disponibles" : "agotado"}</option>`,
              )
              .join("")}</optgroup>`,
        )
        .join("");
  }
  $("#dia").addEventListener("change", opcionesDelDia);
  opcionesDelDia();

  bindForm("#fuera-horario-form", async (data, form) => {
    if (!data.get("empleado")) throw new Error("Elegí un empleado.");
    if (!data.get("dia")) throw new Error("No hay un día con menú publicado para cargar.");
    if (!data.get("plato")) throw new Error("Elegí un plato.");
    // Se confirma al cargar (si quedara en borrador nadie lo confirmaría y el empleado se
    // quedaría sin comida), por eso se pregunta antes: así no se carga comida por error.
    const elegido = empleados.find((e) => String(e.id) === data.get("empleado"));
    const diaTexto = $("#dia").selectedOptions[0]?.textContent || "";
    const platoTexto = ($("#plato").selectedOptions[0]?.textContent || "").split(" · ")[0];
    const seguro = await confirmAction(
      "Cargar pedido confirmado",
      `${elegido.nombre} ${elegido.apellido} · ${diaTexto} · ${platoTexto}. El pedido queda confirmado y se suma al consolidado del proveedor.`,
      "Sí, cargar",
    );
    if (!seguro) return;
    const pedido = await api.cargarFueraDeHorario({
      idAdministrador: u.id,
      idEmpleado: Number(data.get("empleado")),
      idMenuDia: Number(data.get("dia")),
      idPlato: Number(data.get("plato")),
      comentario: data.get("comentario").trim(),
    });
    const empleado = empleados.find((e) => e.id === pedido.idUsuario);
    const linea = pedido.dias[0];
    $("#cargado").hidden = false;
    $("#cargado-resumen").innerHTML =
      `<h3>${esc(linea.plato)}</h3><p>${esc(empleado ? empleado.nombre + " " + empleado.apellido : "")} · ${esc(dateLabel(linea.fechaEntrega))} · <span class="badge confirmado">Confirmado</span> · Pedido N.º ${pedido.id}</p><p>${esc(linea.comentario || "Sin comentarios adicionales.")}</p>`;
    message("Pedido cargado y confirmado. Ya cuenta en el consolidado.");
    // Las porciones cambiaron: se vuelven a pedir los menús.
    const actualizados = await api.menus(hoy, addDays(hoy, DIAS_HACIA_ADELANTE));
    conOpciones.splice(0, conOpciones.length, ...actualizados.filter((m) => m.opciones.length));
    opcionesDelDia();
    form.querySelector("#plato").value = "";
    form.querySelector("#comentario").value = "";
    $("#cargado").focus();
  });
}
