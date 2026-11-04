import { formatDate } from "./core.js";
import { allowedWeek, inCurrentMonth, showWeek, bindWeeks } from "./semanas.js";
import {
  DAYS,
  readDB,
  user,
  monday,
  addDays,
  closedFor,
  attendanceFor,
  setAttendance,
  validDate,
  escapeHTML as esc,
} from "./core.js";
import { $, bindForm, stepper, redirect } from "./ui.js";
export function init() {
  stepper(0);
  const query = new URLSearchParams(location.search).get("semana");
  let week = allowedWeek(validDate(query || "") ? monday(query) : monday());
  function render() {
    const db = readDB(),
      u = user(db),
      saved = attendanceFor(db, u.id, week);
    week = allowedWeek(week);
    showWeek(week);
    $("#attendance-days").innerHTML = DAYS.map((day, i) => {
      const date = addDays(week, i),
        holiday = db.holidays[date];
      if (!inCurrentMonth(date)) return "";
      return `<label class="attendance-day"><input type="checkbox" name="days" value="${date}" ${saved.includes(date) ? "checked" : ""} ${closedFor(db, u.id, date) || holiday ? "disabled" : ""}><span>${day}</span><small>${holiday ? esc(holiday) : closedFor(db, u.id, date) ? "Plazo cerrado" : `${formatDate(date)}`}</small></label>`;
    }).join("");
  }
  bindWeeks(
    () => week,
    (next) => {
      week = next;
      render();
    },
  );
  bindForm("#asistencia-form", () => {
    const selected = [...document.querySelectorAll("[name=days]:checked")].map(
      (x) => x.value,
    );
    setAttendance(week, selected);
    redirect(
      `menu-pedido.html?semana=${week}`,
      "Asistencia guardada. Elegí el menú para cada día.",
    );
  });
  render();
}
