import {
  readDB,
  saveDB,
  requireUser,
  clock,
  addDays,
  monday,
  DAYS,
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
// Acepta un día o una lista de días. Cada fila es un plato de un día.
export function reportRows(db, dates) {
  const days = new Set([].concat(dates));
  const grouped = new Map();
  db.orders
    .filter((o) => days.has(o.date) && o.status === "Confirmado")
    .forEach((o) => {
      const key = `${o.date}|${o.optionId}`,
        row = grouped.get(key) || {
          date: o.date,
          plate: o.plate,
          count: 0,
          comments: [],
        };
      row.count++;
      if (o.comment)
        row.comments.push(
          `${db.users.find((u) => u.id === o.userId)?.name || "Usuario"}: ${o.comment}`,
        );
      grouped.set(key, row);
    });
  return [...grouped.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.plate.localeCompare(b.plate),
  );
}
// Pedidos guardados (borradores y confirmados) de los días elegidos, con quién los pidió.
export function savedOrders(db, dates) {
  const days = new Set([].concat(dates));
  return db.orders
    .filter((o) => days.has(o.date) && o.status !== "Cancelado")
    .map((o) => ({
      date: o.date,
      person: db.users.find((u) => u.id === o.userId)?.name || "Usuario",
      plate: o.plate,
      status: o.status,
      comment: o.comment || "",
    }))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.person.localeCompare(b.person) ||
        a.plate.localeCompare(b.plate),
    );
}
export const csvCell = (value) =>
  '"' +
  String(value)
    .replace(/^[=+@\-\t\r]/, "'$&")
    .replaceAll('"', '""') +
  '"';
const isFinal = (date, c = clock()) =>
  date < c.today ||
  (date === c.today && (c.hour > 10 || (c.hour === 10 && c.minute >= 5)));
export function init() {
  let month = monthOf(clock().today),
    week = monday(),
    rows = [],
    dates = [];
  if (!weeksOfMonth(month).includes(week)) week = weeksOfMonth(month)[0];
  // Por defecto se ve el día de hoy si es hábil; si no, toda la semana.
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
  // Guarda lo consolidado de cada día elegido que tenga pedidos confirmados.
  function store(db, list) {
    for (const date of list) {
      const dayRows = reportRows(db, date);
      if (dayRows.length)
        db.reports[date] = { generatedAt: new Date().toISOString(), rows: dayRows };
    }
    saveDB(db);
  }
  function render(generate = false) {
    const db = readDB();
    requireUser("admin", db);
    dates = selectedDates();
    rows = reportRows(db, dates);
    if (generate && rows.length) store(db, dates);
    $("#total").textContent = rows.reduce((sum, r) => sum + r.count, 0);
    $("#report-body").innerHTML = rows.length
      ? rows
          .map(
            (r) =>
              `<tr><td data-label="Fecha">${esc(dateLabel(r.date))}</td><td data-label="Plato">${esc(r.plate)}</td><td data-label="Cantidad">${r.count}</td><td data-label="Comentarios">${r.comments.length ? `<ul>${r.comments.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : "Sin aclaraciones"}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4">No hay pedidos confirmados para esta selección. Los borradores y cancelados no se incluyen.</td></tr>';
    const saved = savedOrders(db, dates);
    $("#saved-total").textContent = saved.length;
    $("#saved-body").innerHTML = saved.length
      ? saved
          .map(
            (o) =>
              `<tr><td data-label="Empleado">${esc(o.person)}</td><td data-label="Fecha">${esc(dateLabel(o.date))}</td><td data-label="Plato">${esc(o.plate)}</td><td data-label="Estado"><span class="badge ${o.status.toLowerCase()}">${o.status}</span></td><td data-label="Comentario">${o.comment ? esc(o.comment) : "Sin aclaraciones"}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="5">No hay pedidos guardados para esta selección.</td></tr>';
    const label =
      dates.length === 1
        ? dateLabel(dates[0])
        : `Semana ${weeksOfMonth(month).indexOf(week) + 1}`;
    const final = dates.every((d) => isFinal(d));
    $("#report-status").textContent =
      `${label} · ${final ? "Corte finalizado" : "Vista previa: puede cambiar hasta las 10:00"}${generate && rows.length ? " · Consolidado generado y guardado." : ""}`;
    $("#download-csv").disabled = !rows.length;
  }
  function pickers(day = "") {
    fillMonthWeekSelects($("#month"), $("#week"), month, week);
    fillDay(day);
  }
  $("#month").addEventListener("change", () =>
    run(() => {
      month = $("#month").value;
      const weeks = weeksOfMonth(month);
      week = weeks.includes(monday()) ? monday() : weeks[0];
      pickers();
      render();
    }),
  );
  $("#week").addEventListener("change", () =>
    run(() => {
      week = $("#week").value;
      month = monthForWeek(week, month);
      pickers();
      render();
    }),
  );
  $("#report-day").addEventListener("change", () => run(() => render()));
  $("#generate-report").addEventListener("click", (e) =>
    run(() => {
      render(true);
      message(
        rows.length
          ? "Consolidado actualizado. Podés descargarlo para compartir."
          : "No hay pedidos confirmados para consolidar.",
      );
    }, e.currentTarget),
  );
  // Una sola descarga: planilla CSV, que Excel abre directamente.
  $("#download-csv").addEventListener("click", () =>
    run(() => {
      render(true);
      if (!rows.length)
        throw new Error("No hay pedidos confirmados para exportar.");
      const lines = [
        ["Fecha", "Plato", "Cantidad", "Comentarios"],
        ...rows.map((r) => [
          formatDate(r.date),
          r.plate,
          r.count,
          r.comments.join(" | "),
        ]),
      ];
      const blob = new Blob(
        [
          "\ufeff" +
            lines.map((row) => row.map(csvCell).join(";")).join("\r\n"),
        ],
        { type: "text/csv;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download =
        dates.length === 1
          ? `consolidado-${dates[0]}.csv`
          : `consolidado-semana-${week}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }),
  );
  // Equivalente local de la tarea de las 10:05. Solo se ejecuta con esta pantalla abierta.
  function automatic() {
    const c = clock();
    const db = readDB();
    const report = db.reports[c.today];
    const finalTime = Date.parse(`${c.today}T10:05:00-03:00`);
    if (
      (c.hour > 10 || (c.hour === 10 && c.minute >= 5)) &&
      (!report || Date.parse(report.generatedAt) < finalTime)
    ) {
      store(db, [c.today]);
      if (selectedDates().includes(c.today)) render();
    }
  }
  pickers(todayIndex);
  render();
  automatic();
  setInterval(() => run(automatic), 30000);
}
