import {
  readDB,
  user,
  closed,
  dateLabel,
  escapeHTML as esc,
  changeOrder,
  pendingDays,
  monday,
} from "./core.js";
import { $, stepper, run, message, confirmAction } from "./ui.js";
export function init() {
  stepper(2);
  function render() {
    const db = readDB(),
      filter = $("#order-filter").value;
    const pending = pendingDays(db, user(db).id);
    const panel = $("#pending-orders");
    panel.hidden = !pending.length;
    panel.innerHTML = pending.length
      ? `<h2>Te ${pending.length === 1 ? "queda 1 día" : "quedan " + pending.length + " días"} por completar</h2><p>Tu asistencia incluye estas fechas sin un pedido confirmado. Revisalas para no olvidarte del almuerzo.</p><ul>${pending.map((item) => `<li><div><strong>${esc(dateLabel(item.date))}</strong><span>${item.status}</span></div><a href="${item.orderId ? "#pedido-" + item.orderId : "menu-pedido.html?semana=" + monday(item.date) + "&fecha=" + item.date}">${item.orderId ? "Revisar y confirmar" : item.status === "Falta elegir menú" ? "Elegir menú" : "Consultar menú"}</a></li>`).join("")}</ul>`
      : "";
    const orders = db.orders
      .filter(
        (o) => o.userId === user(db).id && (!filter || o.status === filter),
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.updatedAt.localeCompare(a.updatedAt),
      );
    $("#orders").innerHTML = orders.length
      ? orders
          .map(
            (o) =>
              `<article class="order-card" id="pedido-${o.id}"><div class="order-top"><h2>${esc(dateLabel(o.date))}</h2><span class="badge ${o.status.toLowerCase()}">${o.status}</span></div><h3>${esc(o.plate)}</h3><p>${o.comment ? `Comentario: ${esc(o.comment)}` : "Sin comentarios adicionales."}</p>${o.status === "Cancelado" ? '<p class="help">Este pedido fue cancelado y no se incluye en el consolidado.</p>' : closed(o.date) ? `<p class="help">Plazo cerrado.${o.status === "Borrador" ? " No se confirmó a tiempo y no se enviará al proveedor." : ""}</p>` : `<div class="actions">${o.status === "Borrador" ? `<button data-action="confirm" data-id="${o.id}">Confirmar pedido</button>` : ""}<a class="button secondary" href="menu-pedido.html?editar=${o.id}">Modificar</a><button class="danger" data-action="cancel" data-id="${o.id}">Cancelar pedido</button></div>`}</article>`,
          )
          .join("")
      : '<div class="empty"><h2>Todavía no hay pedidos</h2><p>No hay resultados para este filtro. <a href="menu-pedido.html">Elegí tu próximo almuerzo</a>.</p></div>';
  }
  $("#pending-orders").addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#pedido-"]');
    if (link) {
      $("#order-filter").value = "";
      render();
    }
  });
  $("#order-filter").addEventListener("change", render);
  $("#orders").addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    run(async () => {
      const confirm = b.dataset.action === "confirm";
      // El resumen ya es la revisión de CU-13: confirmar no necesita otro paso.
      if (
        !confirm &&
        !(await confirmAction(
          "Cancelar pedido",
          "Tu vianda dejará de estar reservada. Podés volver a pedir antes del horario de corte.",
          "Sí, cancelar",
        ))
      )
        return;
      changeOrder(b.dataset.id, b.dataset.action);
      render();
      message(
        confirm
          ? "Pedido confirmado. Tu vianda quedó reservada."
          : "Pedido cancelado.",
      );
    }, b);
  });
  window.addEventListener("storage", render);
  render();
}
