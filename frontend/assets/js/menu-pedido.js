// M3 · Mis menús + M4 · Mi pedido.
//   M3: GET /api/menus?desde&hasta  → menús PUBLICADOS de la semana, con opciones y porciones (cruce 1)
//       (solo se muestran los días que el empleado marcó en M2: GET /api/asistencias)
//   M4: POST /api/pedidos           → guarda la opción de UN día; el pedido queda en BORRADOR
//       PUT  /api/pedidos/{id}/confirmar (botón "Guardar y confirmar")
import { allowedWeek, inCurrentMonth, showWeek, bindWeeks } from "./semanas.js";
import {
  DAYS,
  CATEGORIES,
  categoryLabel,
  user,
  monday,
  addDays,
  closed,
  horaCorteTexto,
  formatDate,
  validDate,
  escapeHTML as esc,
} from "./core.js";
import { $, stepper, bindForm, message, run } from "./ui.js";
import { api, estadoTexto } from "./api.js";

// Ilustraciones de los platos: frontend/assets/img/platos/ilustraciones/<nombre-del-plato>.svg
// Los platos nuevos traen esa ruta en su columna imagen; los 6 del script traen otra
// (assets/img/milanesa.jpg, que no existe), así que para esos se arma desde el nombre.
const ILUSTRACIONES = "assets/img/platos/ilustraciones/";
// Platos del script que tienen foto real en el frontend (nombre en el script → plantilla).
const FOTOS_REALES = { "Milanesa con puré": "Milanesa con puré", "Tarta de verdura": "Tarta de verduras" };
const slug = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function init() {
  stepper(1);
  const u = user();
  const params = new URLSearchParams(location.search);
  const pedida = validDate(params.get("fecha") || "") ? params.get("fecha") : null;
  let week = allowedWeek(
    pedida ? monday(pedida) : validDate(params.get("semana") || "") ? monday(params.get("semana")) : monday(),
  );
  let selected = pedida;
  let openGroups = null;
  const drafts = {};
  // Lo que vino del backend para la semana que se está mirando.
  let datos = { dias: [], feriados: {}, menus: {}, lineas: {} };

  async function cargar() {
    const viernes = addDays(week, 4);
    const [asistencias, feriados, menus, pedidos] = await Promise.all([
      api.asistencias(u.id, week, viernes),
      api.diasNoLaborables(week, viernes),
      api.menus(week, viernes),
      api.pedidos(u.id),
    ]);
    const lineas = {};
    for (const pedido of pedidos)
      if (pedido.estado !== "CANCELADO")
        for (const dia of pedido.dias) lineas[dia.fechaEntrega] = { pedido, dia };
    datos = {
      dias: asistencias.filter((a) => a.asiste).map((a) => a.fecha).filter(inCurrentMonth),
      feriados: Object.fromEntries(feriados.map((f) => [f.fecha, f.motivo || "Sin servicio"])),
      menus: Object.fromEntries(menus.map((m) => [m.fecha, m])),
      lineas,
    };
  }

  function remember() {
    if (selected && $("[name=option]:checked"))
      drafts[selected] = {
        idPlato: Number($("[name=option]:checked").value),
        comentario: $("#comment").value,
      };
  }

  function photo(opcion) {
    // Primero, las fotos reales que ya tenía el frontend (plantillas de menu-pedido.html).
    const real = [...document.querySelectorAll("template[data-meal-name]")].find(
      (item) => item.dataset.mealName === (FOTOS_REALES[opcion.nombre] || opcion.nombre),
    );
    if (real) return real.innerHTML;
    const src = opcion.imagen?.startsWith(ILUSTRACIONES)
      ? opcion.imagen
      : `${ILUSTRACIONES}${slug(opcion.nombre)}.svg`;
    return `<img src="${esc(src)}" alt="Ilustración de ${esc(opcion.nombre)}" width="640" height="360" loading="lazy" onerror="this.remove()">`;
  }

  function groupByCategory(opciones) {
    const groups = new Map(Object.keys(CATEGORIES).map((key) => [key, []]));
    for (const opcion of opciones)
      groups.get(CATEGORIES[opcion.categoria] ? opcion.categoria : "otros").push(opcion);
    return [...groups].filter(([, list]) => list.length);
  }

  function groupHTML([key, opciones], elegido, propia, isOpen) {
    const cards = opciones
      .map((o) => {
        // Las porciones "disponibles" ya descuentan mi propio borrador: si es mi plato, lo sumo.
        const quedan = o.disponibles + (propia && propia.idPlato === o.idPlato ? 1 : 0);
        const foto = photo(o);
        return `<label class="meal-card"><div class="meal-art ${foto ? "" : "meal-art-empty"}">${foto}<input type="radio" name="option" value="${o.idPlato}" ${elegido === o.idPlato ? "checked" : ""} ${quedan <= 0 ? "disabled" : ""} aria-label="${esc(o.nombre)}"></div><div class="meal-content"><h3>${esc(o.nombre)}</h3><p>${esc(o.descripcion || "")}</p><div class="meal-tags">${["vegetariano", "vegano"].includes(o.categoria) ? "<span>Vegetariano</span>" : ""}${o.categoria === "vegano" ? "<span>Vegano</span>" : ""}${o.categoria === "sin TACC" ? "<span>Sin TACC</span>" : ""}</div><span class="stock ${quedan <= 0 ? "stock-out" : quedan <= 10 ? "stock-low" : ""}">${quedan > 0 ? `${quedan} porciones disponibles` : "Agotado"}</span></div></label>`;
      })
      .join("");
    return `<details class="menu-group" data-category="${key}" ${isOpen ? "open" : ""}><summary><span>${esc(categoryLabel(key))}</span><small>${opciones.length} ${opciones.length === 1 ? "opción" : "opciones"}</small></summary><div class="menu-group-body">${cards}</div></details>`;
  }

  function render() {
    showWeek(week);
    $("#edit-attendance")?.setAttribute("href", `asistencia.html?semana=${week}`);
    const dates = datos.dias;
    if (!dates.includes(selected)) selected = dates.find((d) => !closed(d)) || dates[0];
    $("#menu-days").innerHTML = dates
      .map(
        (date) =>
          `<button type="button" data-date="${date}" aria-pressed="${date === selected}">${DAYS[(new Date(date + "T12:00:00Z").getUTCDay() + 6) % 7]}<small>${formatDate(date)}</small></button>`,
      )
      .join("");
    $("#order-details").hidden = true;
    const empty = (html) => {
      $("#menu-options").innerHTML = `<div class="empty">${html}</div>`;
    };
    if (!dates.length)
      return empty(
        `No registraste asistencia para esta semana. <a href="asistencia.html?semana=${week}">Configurar asistencia</a>`,
      );
    if (closed(selected))
      return empty(`El plazo de este día terminó (corte ${horaCorteTexto()}). Si no llegaste a pedir, avisale al administrador: puede cargarte el pedido fuera de horario.`);
    if (datos.feriados[selected])
      return empty(`Sin servicio: ${esc(datos.feriados[selected])}.`);
    const propia = datos.lineas[selected];
    const menu = datos.menus[selected];
    if (!menu || !menu.opciones.length)
      return empty("Todavía no hay menú publicado para este día. Volvé más tarde o consultá al administrador.");

    const elegido = drafts[selected]?.idPlato ?? propia?.dia.idPlato;
    const groups = groupByCategory(menu.opciones);
    if (!openGroups) {
      const chosen = menu.opciones.find((o) => o.idPlato === elegido);
      openGroups = new Set([chosen ? (CATEGORIES[chosen.categoria] ? chosen.categoria : "otros") : groups[0][0]]);
    }
    $("#menu-options").innerHTML = groups
      .map((g) => groupHTML(g, elegido, propia?.dia, openGroups.has(g[0])))
      .join("");
    $("#comment").value = drafts[selected]?.comentario ?? propia?.dia.comentario ?? "";
    $("#order-details").hidden = false;
    const yaConfirmado = propia?.pedido.estado === "CONFIRMADO";
    $("#edit-note").hidden = !yaConfirmado;
    $("#edit-note").innerHTML = yaConfirmado
      ? `Ya confirmaste <strong>${esc(propia.dia.plato)}</strong> para este día. Si lo cambiás, este día vuelve a <strong>borrador</strong> y tenés que confirmarlo de nuevo antes de las ${horaCorteTexto()}. Los demás días siguen confirmados.`
      : "";
    $("#save-order").textContent = propia ? "Guardar cambios (borrador)" : "Guardar borrador";
    $("#confirm-order").textContent = "Guardar y confirmar";
  }

  async function recargar() {
    await cargar();
    render();
  }

  $("#menu-options").addEventListener(
    "toggle",
    (e) => {
      const group = e.target.closest?.("details.menu-group");
      if (!group || !openGroups) return;
      if (group.open) openGroups.add(group.dataset.category);
      else openGroups.delete(group.dataset.category);
    },
    true,
  );
  $("#menu-days").addEventListener("click", (e) => {
    const button = e.target.closest("[data-date]");
    if (!button) return;
    remember();
    selected = button.dataset.date;
    render();
  });
  bindWeeks(
    () => week,
    (next) => {
      remember();
      week = next;
      selected = null;
      run(recargar);
    },
  );
  bindForm("#pedido-form", async (data, form, submitter) => {
    if (!data.get("option")) throw new Error("Elegí un plato antes de guardar.");
    const menu = datos.menus[selected];
    const confirmar = submitter?.id === "confirm-order";
    const fecha = selected;
    let pedido = await api.guardarDia(
      u.id,
      menu.id,
      Number(data.get("option")),
      data.get("comment").trim(),
    );
    // "Guardar y confirmar": el pedido de la semana pasa de BORRADOR a CONFIRMADO.
    if (confirmar) pedido = await api.confirmar(pedido.id, u.id);
    delete drafts[fecha];
    await recargar();
    const linea = pedido.dias.find((d) => d.fechaEntrega === fecha);
    $("#saved-order").hidden = false;
    $("#saved-title").textContent = confirmar ? "Pedido confirmado" : "Borrador guardado";
    $("#saved-summary").innerHTML =
      `<h3>${esc(linea?.plato || "")}</h3><p>${formatDate(fecha)} · <span class="badge ${estadoTexto(pedido.estado).toLowerCase()}">${estadoTexto(pedido.estado)}</span> · Pedido N.º ${pedido.id} (${pedido.dias.length} ${pedido.dias.length === 1 ? "día" : "días"})</p><p>${esc(linea?.comentario || "Sin comentarios adicionales.")}</p>`;
    $("#review-saved").textContent = confirmar ? "Ver mis pedidos →" : "Revisar y confirmar pedido →";
    $("#review-saved").href = `mis-pedidos.html#pedido-${pedido.id}`;
    message(
      confirmar
        ? "Pedido confirmado. Tus viandas quedaron reservadas."
        : "Borrador guardado en el servidor. Podés confirmarlo desde Mis pedidos.",
    );
    $("#saved-order").focus();
    $("#saved-order").scrollIntoView({ block: "center" });
  });
  await recargar();
}
