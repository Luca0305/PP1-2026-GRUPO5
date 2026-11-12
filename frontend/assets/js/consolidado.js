// M5 · Consolidado (solo lectura, solo administrador). Es el cruce 2: se CUENTA, no se guarda.
//   GET /api/consolidado?idUsuario&desde&hasta          → porciones por plato y día (solo CONFIRMADO)
//   GET /api/consolidado/detalle?idUsuario&desde&hasta  → quién pidió qué (borradores y confirmados)
import {
  clock,
  addDays,
  monday,
  DAYS,
  user,
  closed,
  horaCorteTexto,
  formatDate,
  dateLabel,
  escapeHTML as esc,
} from "./core.js";
import {
  fillMonthWeekSelects,
  monthForWeek,
  weeksOfMonth,
  monthOf,
} from "./semanas.js";
import { $, run, message } from "./ui.js";
import { api, estadoTexto } from "./api.js";

// Celda CSV segura: comillas dobladas y sin fórmulas que Excel ejecute.
export const csvCell = (value) =>
  '"' +
  String(value)
    .replace(/^[=+@\-\t\r]/, "'$&")
    .replaceAll('"', '""') +
  '"';

// Une las filas del cruce 2 con los comentarios de los pedidos CONFIRMADOS.
export function armarFilas(consolidado, detalle) {
  return consolidado.map((fila) => ({
    ...fila,
    comentarios: detalle
      .filter(
        (d) =>
          d.estado === "CONFIRMADO" &&
          d.fecha === fila.fecha &&
          d.idPlato === fila.idPlato &&
          d.comentario,
      )
      .map((d) => `${d.empleado}: ${d.comentario}`),
  }));
}

// Un día está "final" cuando ya pasó su hora de corte (configurable en el backend).
const isFinal = (date) => closed(date);

export async function init() {
  const u = user();
  let month = monthOf(clock().today),
    week = monday(),
    rows = [],
    dates = [];
  if (!weeksOfMonth(month).includes(week)) week = weeksOfMonth(month)[0];
  const todayIndex = (() => {
    const i = [0, 1, 2, 3, 4].find((i) => addDays(week, i) === clock().today);
    return i === undefined ? "" : String(i);
  })();
  function fillDay(selected) {
    $("#report-day").innerHTML =
      '<option value="">Toda la semana</option>' +
      DAYS.map(
        (name, i) =>
          `<option value="${i}" ${String(i) === selected ? "selected" : ""}>${name}</option>`,
      ).join("");
  }
  function selectedDates() {
    const day = $("#report-day").value;
    return day === ""
      ? [0, 1, 2, 3, 4].map((i) => addDays(week, i))
      : [addDays(week, Number(day))];
  }
  async function render(avisar = false) {
    dates = selectedDates();
    const desde = dates[0],
      hasta = dates.at(-1);
    const [consolidado, detalle] = await Promise.all([
      api.consolidado(u.id, desde, hasta),
      api.detalleConsolidado(u.id, desde, hasta),
    ]);
    rows = armarFilas(consolidado, detalle);
    $("#total").textContent = rows.reduce((sum, r) => sum + r.porciones, 0);
    $("#report-body").innerHTML = rows.length
      ? rows
          .map(
            (r) =>
              `<tr><td data-label="Fecha">${esc(dateLabel(r.fecha))}</td><td data-label="Plato">${esc(r.plato)}</td><td data-label="Cantidad">${r.porciones}</td><td data-label="Comentarios">${r.comentarios.length ? `<ul>${r.comentarios.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : "Sin aclaraciones"}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4">No hay pedidos confirmados para esta selección. Los borradores y cancelados no se incluyen.</td></tr>';
    $("#saved-total").textContent = detalle.length;
    $("#saved-body").innerHTML = detalle.length
      ? detalle
          .map(
            (d) =>
              `<tr><td data-label="Empleado">${esc(d.empleado)}</td><td data-label="Fecha">${esc(dateLabel(d.fecha))}</td><td data-label="Plato">${esc(d.plato)}</td><td data-label="Estado"><span class="badge ${estadoTexto(d.estado).toLowerCase()}">${estadoTexto(d.estado)}</span></td><td data-label="Comentario">${d.comentario ? esc(d.comentario) : "Sin aclaraciones"}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="5">No hay pedidos guardados para esta selección.</td></tr>';
    const label =
      dates.length === 1
        ? dateLabel(dates[0])
        : `Semana ${weeksOfMonth(month).indexOf(week) + 1}`;
    const final = dates.every((d) => isFinal(d));
    $("#report-status").textContent =
      `${label} · ${final ? "Corte finalizado" : `Vista previa: puede cambiar hasta las ${horaCorteTexto()}`} · Datos leídos de MySQL.`;
    $("#download-csv").disabled = !rows.length;
    if (avisar)
      message(
        rows.length
          ? "Consolidado actualizado desde la base. Podés descargarlo para compartir."
          : "No hay pedidos confirmados para consolidar.",
      );
  }
  function pickers(day = "") {
    fillMonthWeekSelects($("#month"), $("#week"), month, week);
    fillDay(day);
  }
  $("#month").addEventListener("change", () =>
    run(async () => {
      month = $("#month").value;
      const weeks = weeksOfMonth(month);
      week = weeks.includes(monday()) ? monday() : weeks[0];
      pickers();
      await render();
    }),
  );
  $("#week").addEventListener("change", () =>
    run(async () => {
      week = $("#week").value;
      month = monthForWeek(week, month);
      pickers();
      await render();
    }),
  );
  $("#report-day").addEventListener("change", () => run(() => render()));
  $("#generate-report").addEventListener("click", (e) =>
    run(() => render(true), e.currentTarget),
  );
  $("#download-csv").addEventListener("click", () =>
    run(async () => {
      await render();
      if (!rows.length) throw new Error("No hay pedidos confirmados para exportar.");
      const lines = [
        ["Fecha", "Plato", "Cantidad", "Comentarios"],
        ...rows.map((r) => [formatDate(r.fecha), r.plato, r.porciones, r.comentarios.join(" | ")]),
      ];
      const blob = new Blob(
        ["﻿" + lines.map((row) => row.map(csvCell).join(";")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download =
        dates.length === 1 ? `consolidado-${dates[0]}.csv` : `consolidado-semana-${week}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }),
  );
  pickers(todayIndex);
  await render();
  // Como en el prototipo, se actualiza solo: cada minuto vuelve a contar desde MySQL
  // (así, al llegar el corte, la vista pasa a "Corte finalizado" sin recargar).
  setInterval(() => {
    if (!document.hidden) render().catch(() => {});
  }, 60000);
}
