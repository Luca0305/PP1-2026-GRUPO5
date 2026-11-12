// M2 · Mis días. Lee y guarda la asistencia en MySQL a través del backend:
//   GET /api/dias-no-laborables?desde&hasta  → qué días no tienen servicio
//   GET /api/asistencias?idUsuario&desde&hasta → qué días ya marcó el empleado
//   PUT /api/asistencias/semana               → guarda la semana (las reglas las aplica el servicio)
import { allowedWeek, inCurrentMonth, showWeek, bindWeeks } from "./semanas.js";
import {
  DAYS,
  user,
  monday,
  addDays,
  closed,
  formatDate,
  validDate,
  escapeHTML as esc,
} from "./core.js";
import { $, bindForm, stepper, redirect, run } from "./ui.js";
import { api } from "./api.js";

export async function init() {
  stepper(0);
  const u = user();
  const query = new URLSearchParams(location.search).get("semana");
  let week = allowedWeek(validDate(query || "") ? monday(query) : monday());

  async function render() {
    week = allowedWeek(week);
    showWeek(week);
    const viernes = addDays(week, 4);
    // Las dos consultas son independientes: se piden juntas.
    const [feriados, asistencias] = await Promise.all([
      api.diasNoLaborables(week, viernes),
      api.asistencias(u.id, week, viernes),
    ]);
    const motivo = Object.fromEntries(feriados.map((f) => [f.fecha, f.motivo || "Sin servicio"]));
    let vengo = new Set(asistencias.filter((a) => a.asiste).map((a) => a.fecha));
    // Comodidad: si esta semana todavía no tiene nada guardado, se precargan los mismos
    // días que la semana anterior (la primera vez, de lunes a viernes). Solo se tildan en
    // pantalla: no se guarda nada hasta que el empleado aprieta Guardar.
    let precargada = "";
    if (!asistencias.length) {
      const anterior = await api.asistencias(u.id, addDays(week, -7), addDays(week, -3));
      const diasAnteriores = new Set(
        anterior.filter((a) => a.asiste).map((a) => (new Date(`${a.fecha}T12:00:00Z`).getUTCDay() + 6) % 7),
      );
      const usarAnterior = diasAnteriores.size > 0;
      vengo = new Set(
        [0, 1, 2, 3, 4]
          .filter((i) => !usarAnterior || diasAnteriores.has(i))
          .map((i) => addDays(week, i))
          .filter((date) => !closed(date) && !motivo[date] && inCurrentMonth(date)),
      );
      if (vengo.size)
        precargada = usarAnterior
          ? "Te precargamos los mismos días que la semana anterior. Revisalos y apretá Guardar."
          : "Te precargamos de lunes a viernes. Destildá los días que no venís y apretá Guardar.";
    }
    const aviso = $("#precarga");
    aviso.hidden = !precargada;
    aviso.textContent = precargada;
    $("#attendance-days").innerHTML = DAYS.map((day, i) => {
      const date = addDays(week, i);
      if (!inCurrentMonth(date)) return "";
      const feriado = motivo[date];
      const cerrado = closed(date);
      return `<label class="attendance-day"><input type="checkbox" name="days" value="${date}" ${vengo.has(date) ? "checked" : ""} ${cerrado || feriado ? "disabled" : ""}><span>${day}</span><small>${feriado ? esc(feriado) : cerrado ? "Plazo cerrado" : formatDate(date)}</small></label>`;
    }).join("");
  }

  bindWeeks(
    () => week,
    (next) => {
      week = next;
      run(render);
    },
  );
  bindForm("#asistencia-form", async () => {
    // Los días cerrados que ya estaban marcados se mandan igual: no cambian.
    const selected = [...document.querySelectorAll("[name=days]:checked")].map(
      (x) => x.value,
    );
    if (!selected.length) throw new Error("Elegí al menos un día de asistencia.");
    await api.guardarSemana(u.id, week, selected);
    redirect(
      `menu-pedido.html?semana=${week}`,
      "Asistencia guardada. Elegí el menú para cada día.",
    );
  });
  await render();
}
