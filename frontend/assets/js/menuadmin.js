import { cargarPlatos } from "./datos.js";
import { formatDate } from "./core.js";
import { readDate, writeDate } from "./dates.js";
import {
  DAYS,
  uid,
  readDB,
  monday,
  addDays,
  closed,
  weekLabel,
  validDate,
  saveMenu,
  escapeHTML as esc,
} from "./core.js";
import { $, run, bindForm, message, confirmAction } from "./ui.js";
export function init() {
  let week = monday(),
    loaded,
    dirty = false;
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
    return `<div class="option-editor" data-id="${o.id}" data-plate-id="${esc(o.idPlato || "")}"><div class="field"><label for="name-${o.id}">Nombre del plato</label><input id="name-${o.id}" data-field="name" value="${esc(o.name)}" maxlength="60" ${locked ? "disabled" : ""}></div><div class="field"><label for="description-${o.id}">Descripción</label><input id="description-${o.id}" data-field="description" value="${esc(o.description)}" maxlength="140" ${locked ? "disabled" : ""}></div><div class="field"><label for="stock-${o.id}">Porciones</label><input id="stock-${o.id}" data-field="stock" value="${o.stock}" type="number" min="0" max="9999" step="1" ${locked ? "disabled" : ""}></div><div class="option-flags"><label class="inline-check"><input type="checkbox" data-field="vegetarian" ${o.vegetarian ? "checked" : ""} ${locked ? "disabled" : ""}>Vegetariano</label><label class="inline-check"><input type="checkbox" data-field="glutenFree" ${o.glutenFree ? "checked" : ""} ${locked ? "disabled" : ""}>Sin TACC</label><button type="button" class="danger" data-remove ${locked ? "disabled" : ""}>Quitar opción</button></div></div>`;
  }
  function render(menu) {
    const db = readDB();
    writeDate($("#week"), week);
    $("#week-label").textContent = `Semana del ${weekLabel(week)}`;
    $("#menu-status").textContent = loaded.status;
    $("#menu-status").className = `badge ${loaded.status.toLowerCase()}`;
    $("#catalog-day").innerHTML = '<option value="">Elegí un día</option>' + menu.days.filter(dia => !closed(dia.date)).map(dia => `<option value="${dia.date}">${formatDate(dia.date)}</option>`).join('');
    $("#admin-days").innerHTML = menu.days
      .map((day, i) => {
        const locked = closed(day.date),
          holiday = db.holidays[day.date];
        return `<section class="admin-day" data-date="${day.date}"><header><h2>${DAYS[i]} <small>${formatDate(day.date)}</small></h2><label class="inline-check"><input type="checkbox" data-no-service ${day.noService ? "checked" : ""} ${locked ? "disabled" : ""}>Sin servicio</label></header>${holiday ? `<p class="note">Sin servicio por calendario: ${esc(holiday)}</p>` : ""}${locked ? '<p class="help">Día cerrado: solo lectura.</p>' : ""}<div class="day-options">${day.options.map((o) => optionHTML(o, locked)).join("")}</div><button type="button" class="secondary" data-add ${locked ? "disabled" : ""}>+ Agregar opción</button></section>`;
      })
      .join("");
  }
  let catalogo = [];
  function crearTarjetaPlato(plato) {
    return `<article><h3>${esc(plato.nombre)}</h3><p>${esc(plato.descripcion)}</p></article>`;
  }
  function renderCatalogo(lista) {
    let tarjetas = "";
    let opciones = '<option value="">Elegí un plato</option>';
    for (const plato of lista) {
      tarjetas += crearTarjetaPlato(plato);
      opciones += `<option value="${esc(plato.id)}">${esc(plato.nombre)}</option>`;
    }
    $("#catalog-list").innerHTML = tarjetas;
    $("#catalog-plate").innerHTML = opciones;
    $("#catalog-plate").disabled = !lista.length;
    $("#catalog-add").disabled = !lista.length;
  }
  async function cargarCatalogo() {
    const estado = $("#catalog-state");
    estado.textContent = "Cargando catálogo…";
    estado.className = "help";
    estado.setAttribute("role", "status");
    $("#catalog-retry").disabled = true;
    renderCatalogo([]);
    try {
      catalogo = await cargarPlatos();
      renderCatalogo(catalogo);
      estado.textContent = catalogo.length ? `${catalogo.length} platos disponibles.` : "Todavía no hay platos en el catálogo. Podés cargar una opción manualmente abajo.";
    } catch (error) {
      catalogo = [];
      estado.className = "message error";
      estado.setAttribute("role", "alert");
      estado.textContent = error.message;
    } finally {
      $("#catalog-retry").disabled = false;
    }
  }
  $("#catalog-retry").addEventListener("click", cargarCatalogo);
  $("#catalog-add").addEventListener("click", event => run(() => {
    const fecha = $("#catalog-day").value;
    const plato = catalogo.find(plato => String(plato.id) === $("#catalog-plate").value);
    if (!fecha || closed(fecha)) throw new Error("Elegí un día cuyo plazo esté abierto.");
    if (!plato) throw new Error("Elegí un plato del catálogo.");
    const dia = document.querySelector(`.admin-day[data-date="${fecha}"]`);
    if (readDB().holidays[fecha] || dia.querySelector("[data-no-service]").checked)
      throw new Error("Este día no tiene servicio. Habilitalo antes de agregar opciones.");
    dia.querySelector(".day-options").insertAdjacentHTML("beforeend", optionHTML({id:uid(), idPlato:plato.id, name:plato.nombre, description:plato.descripcion, stock:80, vegetarian:plato.categoria === "vegetariano", glutenFree:false}, false));
    dirty = true;
    message("Plato agregado al formulario. Guardá el menú para aplicar el cambio.");
    dia.scrollIntoView({block:"center"});
  }, event.currentTarget));
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
              ...(row.dataset.plateId ? {idPlato: row.dataset.plateId} : {}),
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
  $("#week").addEventListener("change", () =>
    run(async () => {
      const next = readDate($("#week"));
      if (!validDate(next)) {
        writeDate($("#week"), week);
        throw new Error("Elegí una fecha válida.");
      }
      if (
        dirty &&
        !(await confirmAction(
          "Cambiar de semana",
          "Los cambios que todavía no guardaste se perderán. ¿Continuar?",
          "Cambiar semana",
        ))
      ) {
        writeDate($("#week"), week);
        return;
      }
      week = monday(next);
      open();
    }),
  );
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
      }
      if (
        remove &&
        (await confirmAction(
          "Quitar opción",
          "Se quitará del formulario. El cambio se aplica cuando guardes o publiques.",
          "Quitar",
        ))
      ) {
        remove.closest(".option-editor").remove();
        dirty = true;
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
    if (
      !(await confirmAction(
        "Publicar menú",
        `Los empleados verán las opciones de la semana del ${weekLabel(week)}. ¿Publicar?`,
        "Publicar",
      ))
    )
      return;
    saveMenu(read("Publicado"));
    open();
    message("Menú publicado. Ya está disponible para los empleados.");
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
