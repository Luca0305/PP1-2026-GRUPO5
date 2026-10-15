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
