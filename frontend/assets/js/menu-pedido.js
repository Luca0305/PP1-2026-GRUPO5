import { formatDate } from "./core.js";
import { readDate, writeDate } from "./dates.js";
import {
  DAYS,
  readDB,
  user,
  monday,
  addDays,
  closed,
  weekLabel,
  attendanceFor,
  available,
  saveOrder,
  validDate,
  escapeHTML as esc,
} from "./core.js";
import { $, stepper, bindForm, redirect, run } from "./ui.js";
export function init() {
  stepper(1);
  const params = new URLSearchParams(location.search),
    editId = params.get("editar");
  const edit = readDB().orders.find(
    (o) =>
      o.id === editId && o.userId === user().id && o.status !== "Cancelado",
  );
  let week = edit
    ? monday(edit.date)
    : validDate(params.get("semana") || "")
      ? monday(params.get("semana"))
      : monday();
  const requestedDate = params.get("fecha");
  let selected =
    edit?.date || (validDate(requestedDate || "") ? requestedDate : null);
  const drafts = {};
  if (edit)
    drafts[edit.date] = { optionId: edit.optionId, comment: edit.comment };
  function remember() {
    if (selected)
      drafts[selected] = {
        optionId: $("[name=option]:checked")?.value,
        comment: $("#comment").value,
      };
  }
  function render() {
    const db = readDB(),
      u = user(db),
      dates = attendanceFor(db, u.id, week);
    writeDate($("#week"), week);
    $("#week").disabled = !!editId;
    $("#week-label").textContent = `Semana del ${weekLabel(week)}`;
    if (!dates.includes(selected))
      selected = dates.find((d) => !closed(d)) || dates[0];
    $("#menu-days").innerHTML = dates
      .map(
        (date) =>
          `<button type="button" data-date="${date}" aria-pressed="${date === selected}" ${edit && edit.date !== date ? "disabled" : ""}>${DAYS[(new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7]}<small>${formatDate(date)}</small></button>`,
      )
      .join("");
    $("#order-details").hidden = true;
    const empty = (text) => {
      $("#menu-options").innerHTML = `<div class="empty">${text}</div>`;
    };
    if (!dates.length) {
      empty(
        `No registraste asistencia para esta semana. <a href="asistencia.html?semana=${week}">Configurar asistencia</a>`,
      );
      return;
    }
    if (closed(selected)) {
      empty(
        "El plazo de este día terminó. Elegí otro día o una semana próxima.",
      );
      return;
    }
    if (db.holidays[selected]) {
      empty(`Sin servicio: ${esc(db.holidays[selected])}.`);
      return;
    }
    if (u.leaveStart && selected >= u.leaveStart && selected <= u.leaveEnd) {
      empty(
        "Estás de licencia en esta fecha. Podés actualizarla desde Mi perfil.",
      );
      return;
    }
    const existing = db.orders.find(
      (o) =>
        o.userId === u.id &&
        o.date === selected &&
        o.status !== "Cancelado" &&
        o.id !== editId,
    );
    if (existing) {
      empty(
        `Ya tenés un pedido ${existing.status.toLowerCase()} para este día. <a href="menu-pedido.html?editar=${existing.id}">Modificar pedido</a> · <a href="mis-pedidos.html">Revisar mis pedidos</a>`,
      );
      return;
    }
    if (editId && !edit) {
      empty(
        'No se encontró un pedido válido para modificar. <a href="mis-pedidos.html">Volver a mis pedidos</a>',
      );
      return;
    }
    const menu = db.menus.find(
        (m) => m.week === week && m.status === "Publicado",
      ),
      day = menu?.days.find((d) => d.date === selected);
    if (!day) {
      empty(
        "Todavía no hay menú publicado para esta semana. Volvé más tarde o consultá al administrador.",
      );
      return;
    }
    if (day.noService || !day.options.length) {
      empty("Este día está marcado sin servicio de comedor.");
      return;
    }
    $("#menu-options").innerHTML = day.options
      .map((o, i) => {
        const stock = available(db, o.id, editId);
        return `<label class="meal-card"><div class="meal-art"><span aria-hidden="true">${o.vegetarian ? "♧" : ["◒", "◈", "❋"][i % 3]}</span><input type="radio" name="option" value="${o.id}" ${drafts[selected]?.optionId === o.id ? "checked" : ""} ${stock <= 0 ? "disabled" : ""} aria-label="${esc(o.name)}"></div><div class="meal-content"><h3>${esc(o.name)}</h3><p>${esc(o.description)}</p><div class="meal-tags">${o.vegetarian ? "<span>Vegetariano</span>" : ""}${o.glutenFree ? "<span>Sin TACC</span>" : ""}</div><span class="stock">${stock > 0 ? `${stock} porciones disponibles` : "Agotado"}</span></div></label>`;
      })
      .join("");
    $("#comment").value = drafts[selected]?.comment || "";
    $("#order-details").hidden = false;
    $("#save-order").textContent = edit
      ? "Guardar cambios y revisar →"
      : "Guardar y revisar pedido →";
  }
  $("#menu-days").addEventListener("click", (e) => {
    const button = e.target.closest("[data-date]");
    if (button) {
      remember();
      selected = button.dataset.date;
      render();
    }
  });
  $("#week").addEventListener("change", () =>
    run(() => {
      if (!validDate(readDate($("#week"))))
        throw new Error("Elegí una fecha válida.");
      remember();
      week = monday(readDate($("#week")));
      selected = null;
      render();
    }),
  );
  bindForm("#pedido-form", (data) => {
    if (!data.get("option"))
      throw new Error("Elegí un plato antes de guardar.");
    saveOrder(
      {
        date: selected,
        optionId: data.get("option"),
        comment: data.get("comment").trim(),
      },
      editId,
    );
    redirect(
      `mis-pedidos.html?semana=${week}`,
      "Pedido guardado. Revisá el resumen y confirmalo para reservar tu vianda.",
    );
  });
  render();
}
