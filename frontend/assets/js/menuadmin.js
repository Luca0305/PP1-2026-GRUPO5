// Administrar menús (administrador), contra menu_dia + menu_plato + plato:
//   GET /api/menus/admin?idUsuario&desde&hasta  → menús de la semana/mes, publicados o no
//   PUT /api/menus/semana                       → guarda la semana (borrador o publicada)
//   GET /api/platos                             → catálogo para elegir platos
// Reglas (en el backend): solo días con plazo abierto; un día sin servicio no lleva menú;
// un plato con pedidos no se quita ni baja de lo reservado; con pedidos no se despublica.
import { cargarPlatosDesdeAPI } from "./datos.js";
import {
  DAYS,
  CATEGORIES,
  categoryLabel,
  clock,
  user,
  uid,
  monday,
  addDays,
  closed,
  formatDate,
  escapeHTML as esc,
} from "./core.js";
import { fillMonthWeekSelects, monthForWeek, weeksOfMonth, weekTitle } from "./semanas.js";
import { $, run, bindForm, message, confirmAction } from "./ui.js";
import { api } from "./api.js";

const PORCIONES_POR_DEFECTO = 20;

export async function init() {
  const yo = user();
  let week = monday(),
    month = monthForWeek(week, clock().today.slice(0, 7)),
    loaded = [], // los 5 días de la semana tal como vinieron del backend
    feriados = {},
    dirty = false;
  const openDays = new Set();
  const plain = (text) =>
    String(text)
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();

  // ── Una opción del día. Si viene del catálogo (idPlato), sus datos no se editan acá. ──
  function optionHTML(o, locked) {
    const catalogo = Boolean(o.idPlato);
    const fijo = locked || catalogo;
    const reservadas = o.reservadas || 0;
    return `<div class="option-editor" data-id="${o.key}" data-plate-id="${esc(o.idPlato || "")}" data-reservadas="${reservadas}"><div class="field"><label for="name-${o.key}">Nombre del plato</label><input id="name-${o.key}" data-field="name" value="${esc(o.nombre || "")}" maxlength="120" ${fijo ? "disabled" : ""}></div><div class="field"><label for="description-${o.key}">Descripción</label><input id="description-${o.key}" data-field="description" value="${esc(o.descripcion || "")}" maxlength="300" ${fijo ? "disabled" : ""}></div><div class="field"><label for="category-${o.key}">Categoría</label><select id="category-${o.key}" data-field="category" ${fijo ? "disabled" : ""}>${Object.entries(CATEGORIES).map(([key, label]) => `<option value="${esc(key)}" ${(o.categoria || "otros") === key ? "selected" : ""}>${label}</option>`).join("")}</select></div><div class="field"><label for="stock-${o.key}">Porciones</label><input id="stock-${o.key}" data-field="stock" value="${o.stockDisponible}" type="number" min="${reservadas}" max="9999" step="1" ${locked ? "disabled" : ""}></div><div class="option-flags"><span class="help">${catalogo ? "Del catálogo" : "Plato nuevo: se agrega al catálogo al guardar"}${reservadas ? ` · ${reservadas} ${reservadas === 1 ? "porción reservada" : "porciones reservadas"}` : ""}</span><button type="button" class="danger" data-remove ${locked || reservadas ? "disabled" : ""} title="${reservadas ? "Tiene pedidos: no se puede quitar" : ""}">Quitar opción</button></div></div>`;
  }
  const optionCount = (n) => (n === 0 ? "Sin menú" : n === 1 ? "1 opción" : `${n} opciones`);

  function estadoSemana(dias) {
    const conMenu = dias.filter((d) => d.menu && d.menu.opciones.length);
    if (!conMenu.length) return "Sin cargar";
    return conMenu.every((d) => d.menu.publicado) ? "Publicado" : "Borrador";
  }

  async function renderGuardados() {
    const semanas = weeksOfMonth(month);
    const menus = await api.menusAdmin(yo.id, semanas[0], addDays(semanas.at(-1), 4));
    const porSemana = new Map(semanas.map((s) => [s, []]));
    for (const m of menus) {
      const lunes = monday(m.fecha);
      if (porSemana.has(lunes)) porSemana.get(lunes).push(m);
    }
    const conMenus = [...porSemana].filter(([, lista]) => lista.some((m) => m.opciones.length));
    $("#saved-count").textContent = conMenus.length;
    $("#saved-menus").innerHTML = conMenus.length
      ? conMenus
          .map(([lunes, lista]) => {
            const dias = [0, 1, 2, 3, 4].map((i) => ({ fecha: addDays(lunes, i), menu: lista.find((m) => m.fecha === addDays(lunes, i)) }));
            const estado = estadoSemana(dias);
            return `<article><h3>${weekTitle(lunes, month)}</h3><span class="badge ${estado === "Publicado" ? "publicado" : "borrador"}">${estado}</span><p>${dias.filter((d) => d.menu?.opciones.length).length} días con menú</p><details><summary>Días y opciones</summary><ul>${dias.map((d, i) => `<li><strong>${DAYS[i]}</strong>: ${d.menu?.opciones.length ? d.menu.opciones.map((o) => esc(o.nombre)).join(", ") : feriados[d.fecha] ? "Sin servicio" : "Sin menú"}</li>`).join("")}</ul></details><button type="button" class="secondary" data-open-week="${lunes}">Ver semana</button></article>`;
          })
          .join("")
      : '<p class="empty">No hay menús cargados este mes. Armá una semana y guardala como borrador.</p>';
  }

  function render(dias) {
    fillMonthWeekSelects($("#month"), $("#week"), month, week);
    const estado = estadoSemana(dias);
    $("#publish-menu").textContent = estado === "Publicado" ? "Guardar cambios publicados" : "Publicar menú";
    $("#menu-status").textContent = estado;
    $("#menu-status").className = `badge ${estado === "Publicado" ? "publicado" : "borrador"}`;
    const chosenDay = $("#catalog-day").value;
    $("#catalog-day").innerHTML =
      '<option value="">Elegí un día</option>' +
      dias
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => !closed(d.fecha) && !feriados[d.fecha])
        .map(({ d, i }) => `<option value="${d.fecha}" ${d.fecha === chosenDay ? "selected" : ""}>${DAYS[i]} ${formatDate(d.fecha)}</option>`)
        .join("");
    syncCatalog();
    $("#admin-days").innerHTML = dias
      .map((d, i) => {
        const feriado = feriados[d.fecha];
        const locked = closed(d.fecha) || Boolean(feriado);
        const opciones = (d.opciones || []).map((o) => optionHTML(o, locked)).join("");
        const sinServicio = d.sinServicio || Boolean(feriado);
        return `<details class="admin-day" data-date="${d.fecha}" ${openDays.has(d.fecha) ? "open" : ""}><summary><span class="admin-day-title">${DAYS[i]} <small>${formatDate(d.fecha)}</small></span><span class="admin-day-count">${sinServicio ? "Sin servicio" : optionCount((d.opciones || []).length)}</span></summary><div class="admin-day-body"><label class="inline-check"><input type="checkbox" data-no-service ${sinServicio ? "checked" : ""} ${locked ? "disabled" : ""}>Sin servicio (sin menú este día)</label>${feriado ? `<p class="note">Sin servicio por calendario: ${esc(feriado)}. Para cargar menú, habilitá el día en Feriados.</p>` : ""}${closed(d.fecha) ? '<p class="help">Día cerrado: solo lectura.</p>' : ""}<div class="day-options">${opciones}</div><button type="button" class="secondary" data-add ${locked ? "disabled" : ""}>+ Agregar opción a mano</button></div></details>`;
      })
      .join("");
  }

  function refreshDay(section) {
    const options = section.querySelectorAll(".option-editor").length;
    section.querySelector(".admin-day-count").textContent = section.querySelector("[data-no-service]").checked
      ? "Sin servicio"
      : optionCount(options);
  }

  // Lo que vino del backend → forma del editor.
  function aEditor(menus) {
    return [0, 1, 2, 3, 4].map((i) => {
      const fecha = addDays(week, i);
      const menu = menus.find((m) => m.fecha === fecha);
      return {
        fecha,
        menu,
        sinServicio: false,
        opciones: (menu?.opciones || []).map((o) => ({ ...o, key: uid() })),
      };
    });
  }

  async function open() {
    const [menus, listaFeriados] = await Promise.all([
      api.menusAdmin(yo.id, week, addDays(week, 4)),
      api.diasNoLaborables(),
    ]);
    feriados = Object.fromEntries(listaFeriados.map((f) => [f.fecha, f.motivo || "Sin servicio"]));
    loaded = aEditor(menus);
    dirty = false;
    render(loaded);
    await renderGuardados();
  }

  // Lee el formulario: solo los días abiertos y sin feriado (los demás no se tocan).
  function read(publicado) {
    const dias = [...document.querySelectorAll(".admin-day")]
      .filter((section) => !closed(section.dataset.date) && !feriados[section.dataset.date])
      .map((section) => {
        const sinServicio = section.querySelector("[data-no-service]").checked;
        const opciones = sinServicio
          ? []
          : [...section.querySelectorAll(".option-editor")].map((row) => {
              const stockTexto = row.querySelector("[data-field=stock]").value;
              const stock = stockTexto === "" ? NaN : Number(stockTexto);
              const nombre = row.querySelector("[data-field=name]").value.trim();
              if (!Number.isInteger(stock) || stock < 0 || stock > 9999)
                throw new Error(`Revisá las porciones de «${nombre || "una opción"}»: un número entero de 0 a 9999.`);
              if (stock < Number(row.dataset.reservadas))
                throw new Error(`«${nombre}» ya tiene ${row.dataset.reservadas} porciones reservadas: no puede tener menos.`);
              if (!row.dataset.plateId && !nombre) throw new Error("Hay una opción sin nombre de plato.");
              return row.dataset.plateId
                ? { idPlato: Number(row.dataset.plateId), stockDisponible: stock }
                : {
                    nombre,
                    descripcion: row.querySelector("[data-field=description]").value.trim(),
                    categoria: row.querySelector("[data-field=category]").value,
                    stockDisponible: stock,
                  };
            });
        return { fecha: section.dataset.date, opciones };
      });
    return { idUsuario: yo.id, lunes: week, publicado, dias };
  }

  async function guardar(publicado) {
    const datos = read(publicado);
    await api.guardarSemanaMenu(datos);
    await open();
  }

  // ── Eventos del editor ──
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
    if (e.target.matches("[data-no-service]")) refreshDay(e.target.closest(".admin-day"));
  });
  $("#saved-menus").addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-week]");
    if (button) goToWeek(button.dataset.openWeek);
  });

  // ── Catálogo ──
  let catalogo = [];
  const picked = new Set();
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
    $("#catalog-count").textContent = catalogo.length ? `Mostrando ${lista.length} de ${catalogo.length} platos.` : "";
    syncCatalog();
  }
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
      catalogo = (await cargarPlatosDesdeAPI()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      estado.textContent = catalogo.length
        ? `${catalogo.length} platos disponibles.`
        : "Todavía no hay platos en el catálogo. Podés cargar una opción a mano abajo.";
      $("#catalog-category").innerHTML =
        '<option value="">Todas las categorías</option>' +
        Object.entries(CATEGORIES)
          .filter(([key]) => catalogo.some((plato) => (plato.categoria || "otros") === key))
          .map(([key, label]) => `<option value="${esc(key)}">${label}</option>`)
          .join("");
    } catch (error) {
      catalogo = [];
      estado.className = "message error";
      estado.setAttribute("role", "alert");
      estado.textContent = error.message;
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
      const elegidos = [...picked].map((id) => catalogo.find((plato) => String(plato.id) === id)).filter(Boolean);
      if (!elegidos.length) throw new Error("Elegí al menos un plato del catálogo.");
      const dia = document.querySelector(`.admin-day[data-date="${fecha}"]`);
      if (feriados[fecha] || dia.querySelector("[data-no-service]").checked)
        throw new Error("Este día está marcado sin servicio. Destildá «Sin servicio» antes de agregar opciones.");
      let agregados = 0;
      for (const plato of elegidos) {
        if ([...dia.querySelectorAll("[data-plate-id]")].some((row) => row.dataset.plateId === String(plato.id))) continue;
        dia.querySelector(".day-options").insertAdjacentHTML(
          "beforeend",
          optionHTML(
            {
              key: uid(),
              idPlato: plato.id,
              nombre: plato.nombre,
              descripcion: plato.descripcion,
              categoria: plato.categoria || "otros",
              stockDisponible: PORCIONES_POR_DEFECTO,
              reservadas: 0,
            },
            false,
          ),
        );
        agregados++;
      }
      picked.clear();
      renderCatalogo();
      dia.open = true;
      openDays.add(fecha);
      refreshDay(dia);
      dirty = true;
      message(
        agregados
          ? `Se agregaron ${agregados} platos (sin repetir los que ya estaban). Guardá el menú para aplicar el cambio.`
          : "Esos platos ya estaban en el día.",
      );
      dia.scrollIntoView({ block: "center" });
    }, event.currentTarget),
  );

  // ── Semana / mes ──
  async function goToWeek(nextWeek, nextMonth) {
    await run(async () => {
      if (
        dirty &&
        !(await confirmAction("Cambiar de semana", "Los cambios que todavía no guardaste se perderán. ¿Continuar?", "Cambiar semana"))
      ) {
        fillMonthWeekSelects($("#month"), $("#week"), month, week);
        return;
      }
      month = monthForWeek(nextWeek, nextMonth || month);
      week = nextWeek;
      openDays.clear();
      await open();
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
        const section = add.closest(".admin-day");
        if (section.querySelector("[data-no-service]").checked)
          throw new Error("Este día está marcado sin servicio. Destildá «Sin servicio» para agregar opciones.");
        add.previousElementSibling.insertAdjacentHTML(
          "beforeend",
          optionHTML({ key: uid(), nombre: "", descripcion: "", categoria: "otros", stockDisponible: PORCIONES_POR_DEFECTO, reservadas: 0 }, false),
        );
        dirty = true;
        refreshDay(section);
        add.previousElementSibling.lastElementChild.querySelector("[data-field=name]").focus();
      }
      if (
        remove &&
        (await confirmAction("Quitar opción", "Se quitará del formulario. El cambio se aplica cuando guardes o publiques.", "Quitar"))
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
      const anterior = await api.menusAdmin(yo.id, addDays(week, -7), addDays(week, -3));
      if (!anterior.some((m) => m.opciones.length)) throw new Error("No hay un menú cargado para la semana anterior.");
      if (
        !(await confirmAction(
          "Duplicar semana anterior",
          "Se reemplazarán las opciones de los días abiertos con las de la semana anterior. Revisalas antes de guardar.",
          "Duplicar",
        ))
      )
        return;
      const dias = loaded.map((d, i) => {
        if (closed(d.fecha) || feriados[d.fecha]) return d;
        const previo = anterior.find((m) => m.fecha === addDays(week, i - 7));
        const actuales = d.opciones;
        // Las opciones con pedidos se conservan; se suman las de la semana anterior.
        const conPedidos = actuales.filter((o) => o.reservadas > 0);
        const nuevas = (previo?.opciones || [])
          .filter((o) => !conPedidos.some((c) => c.idPlato === o.idPlato))
          .map((o) => ({ ...o, key: uid(), reservadas: 0 }));
        return { ...d, sinServicio: false, opciones: [...conPedidos, ...nuevas] };
      });
      render(dias);
      dirty = true;
      message("Semana anterior copiada en el formulario. Guardá o publicá para aplicarla.");
    }, e.currentTarget),
  );
  $("#save-draft").addEventListener("click", (e) =>
    run(async () => {
      const publicado = estadoSemana(loaded) === "Publicado";
      if (
        publicado &&
        !(await confirmAction(
          "Volver a borrador",
          "El menú dejará de estar visible para los empleados. Solo es posible en los días sin pedidos activos.",
          "Guardar borrador",
        ))
      )
        return;
      await guardar(false);
      message("Borrador guardado. Los empleados no lo ven hasta que lo publiques.");
    }, e.currentTarget),
  );
  bindForm("#menu-form", async () => {
    const actualizando = estadoSemana(loaded) === "Publicado";
    if (
      !(await confirmAction(
        actualizando ? "Guardar cambios publicados" : "Publicar menú",
        `Los empleados verán las opciones de: ${weekTitle(week, month)}. ¿Continuar?`,
        actualizando ? "Guardar" : "Publicar",
      ))
    )
      return;
    await guardar(true);
    message(actualizando ? "Cambios guardados en el menú publicado." : "Menú publicado. Ya está disponible para los empleados.");
  });
  window.addEventListener("beforeunload", (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  await open();
  cargarCatalogo();
}
