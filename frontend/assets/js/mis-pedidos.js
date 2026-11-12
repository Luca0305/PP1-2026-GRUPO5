// M4 · Mis pedidos (cruce 3). Todo sale de MySQL:
//   GET    /api/pedidos?idUsuario                 → mis pedidos con sus días adentro
//   PUT    /api/pedidos/{id}/confirmar            → BORRADOR → CONFIRMADO
//   PUT    /api/pedidos/{id}/cancelar             → CANCELADO
//   DELETE /api/pedidos/{id}/dias/{idDia}         → quita un día del borrador
import {
  user,
  closed,
  horaCorteTexto,
  dateLabel,
  formatDate,
  monday,
  addDays,
  escapeHTML as esc,
} from "./core.js";
import { monthWeeks } from "./semanas.js";
import { $, stepper, run, message, confirmAction } from "./ui.js";
import { api, estadoTexto } from "./api.js";

const AVISO_MS = 4000;

export async function init() {
  stepper(2);
  const u = user();
  let pedidos = [];
  let pendientes = [];

  async function cargar() {
    const semanas = monthWeeks();
    const [lista, asistencias] = await Promise.all([
      api.pedidos(u.id),
      api.asistencias(u.id, semanas[0], addDays(semanas.at(-1), 4)),
    ]);
    // Los más nuevos primero (por el primer día que cubren), como los ordena el backend.
    const primerDia = (p) => p.dias[0]?.fechaEntrega || "";
    pedidos = [...lista].sort((a, b) => primerDia(b).localeCompare(primerDia(a)) || b.id - a.id);
    // Días que el empleado viene (M2) y que todavía no tienen un pedido confirmado.
    const activas = {};
    for (const p of pedidos)
      if (p.estado !== "CANCELADO")
        for (const d of p.dias) activas[d.fechaEntrega] = p;
    pendientes = asistencias
      .filter((a) => a.asiste && !closed(a.fecha) && activas[a.fecha]?.estado !== "CONFIRMADO")
      .map((a) => ({ fecha: a.fecha, pedido: activas[a.fecha] }));
  }

  function render() {
    const filtro = $("#order-filter").value;
    const panel = $("#pending-orders");
    panel.hidden = !pendientes.length;
    panel.innerHTML = pendientes.length
      ? `<h2>Te ${pendientes.length === 1 ? "queda 1 día" : "quedan " + pendientes.length + " días"} por completar</h2><p>Tu asistencia incluye estas fechas sin un pedido confirmado.</p><ul>${pendientes
          .map(
            (item) =>
              `<li><div><strong>${esc(dateLabel(item.fecha))}</strong><span>${item.pedido ? "Por confirmar" : "Falta elegir menú"}</span></div><a href="${item.pedido ? "#pedido-" + item.pedido.id : "menu-pedido.html?fecha=" + item.fecha}">${item.pedido ? "Revisar y confirmar" : "Elegir menú"}</a></li>`,
          )
          .join("")}</ul>`
      : "";
    const visibles = pedidos.filter((p) => p.dias.length && (!filtro || p.estado === filtro));
    $("#orders").innerHTML = visibles.length
      ? visibles.map(tarjeta).join("")
      : '<div class="empty"><h2>Todavía no hay pedidos</h2><p>No hay resultados para este filtro. <a href="menu-pedido.html">Elegí tu próximo almuerzo</a>.</p></div>';
  }

  function tarjeta(p) {
    const estado = estadoTexto(p.estado);
    const abierto = p.dias.length && p.dias.every((d) => !closed(d.fechaEntrega));
    const semana = p.dias.length ? `Semana del ${formatDate(monday(p.dias[0].fechaEntrega))}` : "";
    const dias = p.dias
      .map((d) => {
        const editable = p.estado !== "CANCELADO" && !closed(d.fechaEntrega);
        const confirmado = p.estado === "CONFIRMADO";
        return `<li class="order-line"><div><strong>${esc(dateLabel(d.fechaEntrega))}</strong> · ${esc(d.plato)}<br><small>${d.comentario ? "Comentario: " + esc(d.comentario) : "Sin comentarios adicionales."}</small></div>${
          editable
            ? `<div class="actions"><a class="button secondary" href="menu-pedido.html?fecha=${d.fechaEntrega}">Modificar</a><button class="danger" data-action="quitar" data-confirmado="${confirmado}" data-id="${p.id}" data-dia="${d.id}">${confirmado ? "Cancelar día" : "Quitar día"}</button></div>`
            : ""
        }</li>`;
      })
      .join("");
    let pie;
    if (p.estado === "CANCELADO")
      pie = '<p class="help">Este pedido fue cancelado y no se incluye en el consolidado.</p>';
    else if (!abierto)
      pie = `<p class="help">Plazo cerrado para al menos un día (corte ${horaCorteTexto()}).${p.estado === "BORRADOR" ? " Quitá los días cerrados para poder confirmar; lo que no se confirma no se envía al proveedor." : ""}</p>`;
    else
      pie = `<div class="actions">${p.estado === "BORRADOR" ? `<button data-action="confirmar" data-id="${p.id}">Confirmar pedido</button>` : ""}<button class="danger" data-action="cancelar" data-id="${p.id}">Cancelar pedido</button></div>`;
    return `<article class="order-card" id="pedido-${p.id}"><div class="order-top"><h2>Pedido N.º ${p.id}</h2><span class="badge ${estado.toLowerCase()}">${estado}</span></div><p class="help">${semana}${semana ? " · " : ""}armado el ${formatDate(p.fechaPedido)}</p><ul class="order-lines">${dias}</ul>${pie}</article>`;
  }

  async function actualizar() {
    await cargar();
    render();
  }

  $("#pending-orders").addEventListener("click", (event) => {
    if (event.target.closest('a[href^="#pedido-"]')) {
      $("#order-filter").value = "";
      render();
    }
  });
  $("#order-filter").addEventListener("change", render);
  $("#orders").addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    run(async () => {
      const accion = b.dataset.action;
      const id = Number(b.dataset.id);
      if (accion === "cancelar") {
        if (!(await confirmAction("Cancelar pedido", "Se cancela el pedido completo y sus viandas dejan de estar reservadas.", "Sí, cancelar")))
          return;
        await api.cancelar(id, u.id);
      } else if (accion === "quitar") {
        const confirmado = b.dataset.confirmado === "true";
        if (
          !(await confirmAction(
            confirmado ? "Cancelar día" : "Quitar día",
            confirmado
              ? "Se cancela solo ese día; los demás días del pedido siguen confirmados."
              : "Ese día sale de tu borrador.",
            confirmado ? "Sí, cancelar día" : "Quitar",
          ))
        )
          return;
        await api.quitarDia(id, Number(b.dataset.dia), u.id);
      } else {
        await api.confirmar(id, u.id);
      }
      await actualizar();
      message(
        { confirmar: "Pedido confirmado. Tus viandas quedaron reservadas.", cancelar: "Pedido cancelado.", quitar: b.dataset.confirmado === "true" ? "Día cancelado. El resto del pedido sigue confirmado." : "Día quitado del borrador." }[accion],
        "success",
        AVISO_MS,
      );
    }, b);
  });
  await actualizar();
}
