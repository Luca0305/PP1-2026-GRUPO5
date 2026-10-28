import { clock, monday, addDays, formatDate } from "./core.js";

// Semanas con al menos un día hábil del mes actual, según la hora de Argentina.
export function monthWeeks(today = clock().today) {
  const month = today.slice(0, 7);
  const weeks = [];
  for (
    let week = monday(`${month}-01`);
    week.slice(0, 7) <= month;
    week = addDays(week, 7)
  ) {
    if ([0, 1, 2, 3, 4].some((i) => addDays(week, i).startsWith(month)))
      weeks.push(week);
  }
  return weeks;
}
export const inCurrentMonth = (date) =>
  date?.slice(0, 7) === clock().today.slice(0, 7);
export function allowedWeek(week) {
  const weeks = monthWeeks();
  return weeks.includes(week)
    ? week
    : weeks.find((value) => value >= monday()) || weeks.at(-1);
}
export function showWeek(week, locked = false) {
  const weeks = monthWeeks();
  const dates = [0, 1, 2, 3, 4]
    .map((i) => addDays(week, i))
    .filter(inCurrentMonth);
  document.querySelector("#week-label").textContent = dates.length
    ? `Semana del ${formatDate(dates[0])} al ${formatDate(dates.at(-1))}`
    : "Esta fecha no pertenece al mes actual.";
  document.querySelector("#previous-week").disabled =
    locked || weeks.indexOf(week) <= 0;
  document.querySelector("#next-week").disabled =
    locked || weeks.indexOf(week) >= weeks.length - 1;
}
export function bindWeeks(getWeek, changeWeek) {
  for (const [id, offset] of [
    ["previous-week", -7],
    ["next-week", 7],
  ]) {
    document.querySelector(`#${id}`).addEventListener("click", () => {
      const next = addDays(getWeek(), offset);
      if (monthWeeks().includes(next)) changeWeek(next);
    });
  }
}

// ── Selección por mes y semana (administrador) ──
// Las semanas se muestran como "Semana 1", "Semana 2"… de cada mes, sin números de fecha.
export const monthOf = (iso) => iso.slice(0, 7);
export const weeksOfMonth = (month) => monthWeeks(`${month}-01`);
export function monthLabel(month) {
  const text = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
  return text.charAt(0).toUpperCase() + text.slice(1);
}
// Meses seleccionables: el anterior, el actual y los dos siguientes.
export function monthChoices(today = clock().today) {
  const [year, month] = today.slice(0, 7).split("-").map(Number);
  return [-1, 0, 1, 2].map((offset) => {
    const d = new Date(Date.UTC(year, month - 1 + offset, 1));
    return d.toISOString().slice(0, 7);
  });
}
// Meses que contienen algún día hábil de una semana (una semana puede cruzar dos meses).
export const monthsOfWeek = (week) => [
  ...new Set([0, 1, 2, 3, 4].map((i) => monthOf(addDays(week, i)))),
];
export function monthForWeek(week, preferred) {
  const months = monthsOfWeek(week);
  return months.includes(preferred) ? preferred : months[0];
}
export function weekNumber(week, month) {
  return weeksOfMonth(month).indexOf(week) + 1;
}
export function weekTitle(week, preferred = monthOf(week)) {
  const month = monthForWeek(week, preferred);
  return `Semana ${weekNumber(week, month)} de ${monthLabel(month)}`;
}
export function fillMonthWeekSelects(monthSelect, weekSelect, month, week) {
  monthSelect.innerHTML = monthChoices()
    .concat(monthChoices().includes(month) ? [] : [month])
    .sort()
    .map(
      (value) =>
        `<option value="${value}" ${value === month ? "selected" : ""}>${monthLabel(value)}</option>`,
    )
    .join("");
  weekSelect.innerHTML = weeksOfMonth(month)
    .map(
      (value, i) =>
        `<option value="${value}" ${value === week ? "selected" : ""}>Semana ${i + 1}</option>`,
    )
    .join("");
}
