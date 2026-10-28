import { cargarPlatos } from "./datos.js";
import { formatDate, CATEGORIES, categoryLabel, clock } from "./core.js";
import {
  fillMonthWeekSelects,
  monthForWeek,
  weeksOfMonth,
  weekTitle,
} from "./semanas.js";
import {
  DAYS,
  uid,
  readDB,
  monday,
  addDays,
  closed,
  saveMenu,
  escapeHTML as esc,
} from "./core.js";
import { $, run, bindForm, message, confirmAction } from "./ui.js";
export function init() {
  let week = monday(),
    month = monthForWeek(week, clock().today.slice(0, 7)),
    loaded,
    dirty = false;
  const openDays = new Set(); // días desplegados en el editor
  const plain = (text) =>
    String(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const empty = (week) => ({
    week,
    status: "Borrador",
    days: DAYS.map((_, i) => ({
      date: addDays(week, i),
      noService: false,
      options: [],
    })),
  });
  function optionHTML(o, locked) {
    return `<div class="option-editor" data-id="${o.id}" data-plate-id="${esc(o.idPlato || "")}"><div class="field"><label for="name-${o.id}">Nombre del plato</label><input id="name-${o.id}" data-field="name" value="${esc(o.name)}" maxlength="60" ${locked ? "disabled" : ""}></div><div class="field"><label for="description-${o.id}">Descripción</label><input id="description-${o.id}" data-field="description" value="${esc(o.description)}" maxlength="140" ${locked ? "disabled" : ""}></div><div class="field"><label for="category-${o.id}">Categoría</label><select id="category-${o.id}" data-field="category" ${locked ? "disabled" : ""}>${Object.entries(CATEGORIES).map(([key, label]) => `<option value="${key}" ${(o.category || "otros") === key ? "selected" : ""}>${label}</option>`).join("")}</select></div><div class="field"><label for="stock-${o.id}">Porciones</label><input id="stock-${o.id}" data-field="stock" value="${o.stock}" type="number" min="0" max="9999" step="1" ${locked ? "disabled" : ""}></div><div class="option-flags"><label class="inline-check"><input type="checkbox" data-field="vegetarian" ${o.vegetarian ? "checked" : ""} ${locked ? "disabled" : ""}>Vegetariano</label><label class="inline-check"><input type="checkbox" data-field="glutenFree" ${o.glutenFree ? "checked" : ""} ${locked ? "disabled" : ""}>Sin TACC</label><button type="button" class="danger" data-remove ${locked ? "disabled" : ""}>Quitar opción</button></div></div>`;
  }
  const optionCount = (n) => (n === 1 ? "1 opción" : `${n} opciones`);
  function daySummary(day) {
    return day.noService ? "Sin servicio" : optionCount(day.options.length);
  }
  function render(menu) {
    const db = readDB();
    fillMonthWeekSelects($("#month"), $("#week"), month, week);
    $("#publish-menu").textContent =
      loaded.status === "Publicado"
        ? "Guardar cambios publicados"
        : "Publicar menú";
    $("#saved-menus").innerHTML = db.menus.length
      ? [...db.menus]
          .sort((a, b) => a.week.localeCompare(b.week))
          .map(
            (item) =>
              `<article><h3>${weekTitle(item.week, month)}</h3><span class="badge ${item.status.toLowerCase()}">${item.status}</span><p>${item.days.filter((day) => !day.noService).length} días con servicio</p><details><summary>Días y opciones</summary><ul>${item.days.map((day, i) => `<li><strong>${DAYS[i]}</strong>: ${day.noService ? "Sin servicio" : day.options.map((option) => esc(option.name)).join(", ") || "Sin opciones"}</li>`).join("")}</ul></details><button type="button" class="secondary" data-open-week="${item.week}">Ver semana</button></article>`,
          )
          .join("")
      : '<p class="empty">No hay menús guardados. Armá una semana y guardala como borrador.</p>';
    $("#saved-count").textContent = db.menus.length;
    $("#menu-status").textContent = loaded.status;
    $("#menu-status").className = `badge ${loaded.status.toLowerCase()}`;
    // El día es obligatorio: sin elegirlo, el catálogo queda deshabilitado.
    const chosenDay = $("#catalog-day").value;
    $("#catalog-day").innerHTML =
      '<option value="">Elegí un día</option>' +
      menu.days
        .map((dia, i) => ({ dia, i }))
        .filter(({ dia }) => !closed(dia.date))
        .map(
          ({ dia, i }) =>
            `<option value="${dia.date}" ${dia.date === chosenDay ? "selected" : ""}>${DAYS[i]}</option>`,
        )
        .join("");
    syncCatalog();
    $("#admin-days").innerHTML = menu.days
      .map((day, i) => {
        const locked = closed(day.date),
          holiday = db.holidays[day.date];
        return `<details class="admin-day" data-date="${day.date}" ${openDays.has(day.date) ? "open" : ""}><summary><span class="admin-day-title">${DAYS[i]} <small>${formatDate(day.date)}</small></span><span class="admin-day-count">${daySummary(day)}</span></summary><div class="admin-day-body"><label class="inline-check"><input type="checkbox" data-no-service ${day.noService ? "checked" : ""} ${locked ? "disabled" : ""}>Sin servicio</label>${holiday ? `<p class="note">Sin servicio por calendario: ${esc(holiday)}</p>` : ""}${locked ? '<p class="help">Día cerrado: solo lectura.</p>' : ""}<div class="day-options">${day.options.map((o) => optionHTML(o, locked)).join("")}</div><button type="button" class="secondary" data-add ${locked ? "disabled" : ""}>+ Agregar opción</button></div></details>`;
      })
      .join("");
  }
  function refreshDay(section) {
    const options = section.querySelectorAll(".option-editor").length;
    section.querySelector(".admin-day-count").textContent = section.querySelector(
      "[data-no-service]",
    ).checked
      ? "Sin servicio"
      : optionCount(options);
  }
  $("#admin-days").addEventListener(
    "toggle",
    (e) => {
      const section = e.target.closest?.(".admin-day");
      if (!section) return;
      if (section.open) openDays.add(section.dataset.date);
      else openDays.delete(section.dataset.date);
    },
    true,
  );
  $("#admin-days").addEventListener("change", (e) => {
    if (e.target.matches("[data-no-service]"))
      refreshDay(e.target.closest(".admin-day"));
  });
  $("#saved-menus").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-week]");
    if (!button) return;
    goToWeek(button.dataset.openWeek);
  });
  let catalogo = [];
  const picked = new Set(); // platos tildados, se conservan al filtrar
  function filteredCatalog() {
    const term = plain($("#catalog-search").value.trim()),
      category = $("#catalog-category").value;
    return catalogo.filter(
      (plato) =>
        (!category || (plato.categoria || "otros") === category) &&
        (!term || plain(`${plato.nombre} ${plato.descripcion}`).includes(term)),
    );
  }
  function crearFilaPlato(plato) {
    return `<tr><td data-label="Elegir"><input type="checkbox" name="catalog-plate" id="plate-${esc(plato.id)}" value="${esc(plato.id)}" aria-label="Elegir ${esc(plato.nombre)}" ${picked.has(String(plato.id)) ? "checked" : ""}></td><td data-label="Plato"><label for="plate-${esc(plato.id)}">${esc(plato.nombre)}</label></td><td data-label="Categoría">${esc(categoryLabel(plato.categoria))}</td><td data-label="Descripción">${esc(plato.descripcion)}</td></tr>`;
  }
  function renderCatalogo() {
    const lista = filteredCatalog();
    $("#catalog-list").innerHTML = lista.length
      ? lista.map(crearFilaPlato).join("")
      : `<tr><td colspan="4">${catalogo.length ? "Ningún plato coincide con la búsqueda o el filtro." : "No hay platos para mostrar."}</td></tr>`;
    $("#catalog-count").textContent = catalogo.length
      ? `Mostrando ${lista.length} de ${catalogo.length} platos.`
      : "";
    syncCatalog();
  }
  // Sin un día elegido no se puede buscar, tildar ni agregar nada.
  function syncCatalog() {
    const hasDay = Boolean($("#catalog-day").value);
    $("#catalog-tools").disabled = !hasDay;
    $("#catalog-add").disabled = !hasDay || !catalogo.length;
    $("#catalog-hint").hidden = hasDay;
  }
  async function cargarCatalogo() {
    const estado = $("#catalog-state");
    estado.textContent = "Cargando catálogo…";
    estado.className = "help";
    estado.setAttribute("role", "status");
    $("#catalog-retry").hidden = true;
    try {
      catalogo = await cargarPlatos();
      estado.textContent = catalogo.length
        ? `${catalogo.length} platos disponibles.`
        : "Todavía no hay platos en el catálogo. Podés cargar una opción manualmente abajo.";
      $("#catalog-category").innerHTML =
        '<option value="">Todas las categorías</option>' +
        Object.entries(CATEGORIES)
          .filter(([key]) =>
            catalogo.some((plato) => (plato.categoria || "otros") === key),
          )
          .map(([key, label]) => `<option value="${key}">${label}</option>`)
          .join("");
    } catch (error) {
      catalogo = [];
      estado.className = "message error";
      estado.setAttribute("role", "alert");
      estado.textContent = error.message;
      // El reintento solo aparece cuando la carga falló.
      $("#catalog-retry").hidden = false;
    }
    renderCatalogo();
  }
  $("#catalog-retry").addEventListener("click", cargarCatalogo);
  $("#catalog-search").addEventListener("input", renderCatalogo);
  $("#catalog-category").addEventListener("change", renderCatalogo);
  $("#catalog-day").addEventListener("change", syncCatalog);
  $("#catalog-list").addEventListener("change", (e) => {
    if (!e.target.matches('[name="catalog-plate"]')) return;
    if (e.target.checked) picked.add(e.target.value);
    else picked.delete(e.target.value);
  });
  $("#catalog-add").addEventListener("click", (event) =>
    run(() => {
      const fecha = $("#catalog-day").value;
      if (!fecha) throw new Error("Elegí un día antes de agregar platos.");
      if (closed(fecha)) throw new Error("Elegí un día cuyo plazo esté abierto.");
      const elegidos = [...picked]
        .map((id) => catalogo.find((plato) => String(plato.id) === id))
        .filter(Boolean);
      if (!elegidos.length)
        throw new Error("Elegí al menos un plato del catálogo.");
      const dia = document.querySelector(`.admin-day[data-date="${fecha}"]`);
      if (
        readDB().holidays[fecha] ||
        dia.querySelector("[data-no-service]").checked
      )
        throw new Error(
          "Este día no tiene servicio. Habilitalo antes de agregar opciones.",
        );
      for (const plato of elegidos) {
        if (
          [...dia.querySelectorAll("[data-plate-id]")].some(
            (row) => row.dataset.plateId === String(plato.id),
          )
        )
          continue;
        dia.querySelector(".day-options").insertAdjacentHTML(
          "beforeend",
          optionHTML(
            {
              id: uid(),
              idPlato: plato.id,
              name: plato.nombre,
              description: plato.descripcion,
              category: plato.categoria || "otros",
              stock: 80,
              vegetarian: plato.categoria === "vegetariano",
              glutenFree: false,
            },
            false,
          ),
        );
      }
      picked.clear();
      renderCatalogo();
      dia.open = true;
      openDays.add(fecha);
      refreshDay(dia);
      dirty = true;
      message(
        "Selección aplicada al día, sin repetir platos existentes. Guardá el menú para aplicar el cambio.",
      );
      dia.scrollIntoView({ block: "center" });
    }, event.currentTarget),
  );
  function open() {
    loaded = structuredClone(
      readDB().menus.find((m) => m.week === week) || empty(week),
    );
    dirty = false;
    render(loaded);
  }
  function read(status) {
    return {
      week,
      status,
      days: [...document.querySelectorAll(".admin-day")].map((section, i) => {
        if (closed(section.dataset.date)) return loaded.days[i];
        return {
          date: section.dataset.date,
          noService: section.querySelector("[data-no-service]").checked,
          options: [...section.querySelectorAll(".option-editor")].map(
            (row) => ({
              id: row.dataset.id,
              ...(row.dataset.plateId ? { idPlato: row.dataset.plateId } : {}),
              category: row.querySelector("[data-field=category]").value,
              name: row.querySelector("[data-field=name]").value.trim(),
              description: row
                .querySelector("[data-field=description]")
                .value.trim(),
              stock:
                row.querySelector("[data-field=stock]").value === ""
                  ? NaN
                  : Number(row.querySelector("[data-field=stock]").value),
              vegetarian: row.querySelector("[data-field=vegetarian]").checked,
              glutenFree: row.querySelector("[data-field=glutenFree]").checked,
            }),
          ),
        };
      }),
    };
  }
  // Cambia de mes/semana avisando si hay cambios sin guardar.
  async function goToWeek(nextWeek, nextMonth) {
    await run(async () => {
      if (
        dirty &&
        !(await confirmAction(
          "Cambiar de semana",
          "Los cambios que todavía no guardaste se perderán. ¿Continuar?",
          "Cambiar semana",
        ))
      ) {
        fillMonthWeekSelects($("#month"), $("#week"), month, week);
        return;
      }
      month = monthForWeek(nextWeek, nextMonth || month);
      week = nextWeek;
      openDays.clear();
      open();
    });
  }
  $("#month").addEventListener("change", () => {
    const next = $("#month").value,
      weeks = weeksOfMonth(next);
    goToWeek(weeks.includes(monday()) ? monday() : weeks[0], next);
  });
  $("#week").addEventListener("change", () => goToWeek($("#week").value));
  $("#menu-form").addEventListener("input", () => {
    dirty = true;
  });
  $("#admin-days").addEventListener("click", (e) =>
    run(async () => {
      const add = e.target.closest("[data-add]"),
        remove = e.target.closest("[data-remove]");
      if (add) {
        add.previousElementSibling.insertAdjacentHTML(
          "beforeend",
          optionHTML(
            {
              id: uid(),
              name: "",
              description: "",
              stock: 80,
              vegetarian: false,
              glutenFree: false,
            },
            false,
          ),
        );
        dirty = true;
        refreshDay(add.closest(".admin-day"));
      }
      if (
        remove &&
        (await confirmAction(
          "Quitar opción",
          "Se quitará del formulario. El cambio se aplica cuando guardes o publiques.",
          "Quitar",
        ))
      ) {
        const section = remove.closest(".admin-day");
        remove.closest(".option-editor").remove();
        dirty = true;
        refreshDay(section);
      }
    }),
  );
  $("#duplicate-menu").addEventListener("click", (e) =>
    run(async () => {
      const previous = readDB().menus.find((m) => m.week === addDays(week, -7));
      if (!previous)
        throw new Error("No hay un menú guardado para la semana anterior.");
      if (
        !(await confirmAction(
          "Duplicar semana anterior",
          "Se reemplazarán las opciones de los días abiertos. Revisalas antes de guardar.",
          "Duplicar",
        ))
      )
        return;
      const menu = read("Borrador");
      menu.days = menu.days.map((d, i) =>
        closed(d.date)
          ? d
          : {
              ...d,
              noService: previous.days[i].noService,
              options: previous.days[i].options.map((o) => ({
                ...o,
                id: uid(),
              })),
            },
      );
      render(menu);
      dirty = true;
    }, e.currentTarget),
  );
  $("#save-draft").addEventListener("click", (e) =>
    run(async () => {
      if (
        loaded.status === "Publicado" &&
        !(await confirmAction(
          "Retirar publicación",
          "El menú dejará de estar visible para empleados. Solo es posible si no tiene pedidos activos.",
          "Guardar borrador",
        ))
      )
        return;
      saveMenu(read("Borrador"));
      open();
      message(
        "Borrador guardado. Los empleados no lo ven hasta que lo publiques.",
      );
    }, e.currentTarget),
  );
  bindForm("#menu-form", async () => {
    if (!readDB().menus.some((menu) => menu.week === week))
      throw new Error("Guardá el menú como borrador antes de publicarlo.");
    const updating = loaded.status === "Publicado";
    if (
      !(await confirmAction(
        updating ? "Guardar cambios publicados" : "Publicar menú",
        `Los empleados verán las opciones de: ${weekTitle(week, month)}. ¿Continuar?`,
        updating ? "Guardar" : "Publicar",
      ))
    )
      return;
    saveMenu(read("Publicado"));
    open();
    message(
      updating
        ? "Cambios guardados en el menú publicado."
        : "Menú publicado. Ya está disponible para los empleados.",
    );
  });
  window.addEventListener("beforeunload", (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  open();
  cargarCatalogo();
}
