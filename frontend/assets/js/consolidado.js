import { readDate, writeDate } from "./dates.js";
import {
  readDB,
  saveDB,
  requireUser,
  clock,
  validDate,
  dateLabel,
  escapeHTML as esc,
} from "./core.js";
import { $, run, message } from "./ui.js";
export function reportRows(db, date) {
  const grouped = new Map();
  db.orders
    .filter((o) => o.date === date && o.status === "Confirmado")
    .forEach((o) => {
      const key = o.optionId,
        row = grouped.get(key) || { plate: o.plate, count: 0, comments: [] };
      row.count++;
      if (o.comment)
        row.comments.push(
          `${db.users.find((u) => u.id === o.userId)?.name || "Usuario"}: ${o.comment}`,
        );
      grouped.set(key, row);
    });
  return [...grouped.values()];
}
export const csvCell = (value) =>
  '"' +
  String(value)
    .replace(/^[=+@\-\t\r]/, "'$&")
    .replaceAll('"', '""') +
  '"';
export function init() {
  writeDate($("#report-date"), clock().today);
  let rows = [],
    renderedDate = "";
  function render(generate = false) {
    const date = readDate($("#report-date"));
    if (!validDate(date)) throw new Error("Elegí una fecha válida.");
    const db = readDB();
    requireUser("admin", db);
    rows = reportRows(db, date);
    renderedDate = date;
    if (generate && rows.length) {
      db.reports[date] = { generatedAt: new Date().toISOString(), rows };
      saveDB(db);
    }
    $("#total").textContent = rows.reduce((sum, r) => sum + r.count, 0);
    $("#report-body").innerHTML = rows.length
      ? rows
          .map(
            (r) =>
              `<tr><td data-label="Plato">${esc(r.plate)}</td><td data-label="Cantidad">${r.count}</td><td data-label="Comentarios">${r.comments.length ? `<ul>${r.comments.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` : "Sin aclaraciones"}</td></tr>`,
          )
          .join("")
      : '<tr><td colspan="3">No hay pedidos confirmados para esta fecha. Los borradores y cancelados no se incluyen.</td></tr>';
    const c = clock(),
      final =
        date < c.today ||
        (date === c.today && (c.hour > 10 || (c.hour === 10 && c.minute >= 5)));
    $("#report-status").textContent =
      `${dateLabel(date)} · ${final ? "Corte finalizado" : "Vista previa: puede cambiar hasta las 10:00"}${generate && rows.length ? " · Consolidado generado y guardado." : ""}`;
    $("#download-csv").disabled = !rows.length;
    $("#print-report").disabled = !rows.length;
  }
  $("#report-date").addEventListener("change", () => run(() => render()));
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
  $("#download-csv").addEventListener("click", () =>
    run(() => {
      render(true);
      if (!rows.length)
        throw new Error("No hay pedidos confirmados para exportar.");
      const lines = [
        ["Fecha", "Plato", "Cantidad", "Comentarios"],
        ...rows.map((r) => [
          renderedDate,
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
      a.download = `consolidado-${renderedDate}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }),
  );
  $("#print-report").addEventListener("click", () =>
    run(() => {
      render(true);
      if (rows.length) window.print();
    }),
  );
  // Equivalente local de la tarea de las 10:05. Solo se ejecuta con esta pantalla abierta.
  function automatic() {
    const c = clock();
    const report = readDB().reports[c.today];
    const finalTime = Date.parse(`${c.today}T10:05:00-03:00`);
    if (
      (c.hour > 10 || (c.hour === 10 && c.minute >= 5)) &&
      readDate($("#report-date")) === c.today &&
      (!report || Date.parse(report.generatedAt) < finalTime)
    )
      render(true);
  }
  render();
  automatic();
  setInterval(() => run(automatic), 30000);
}
