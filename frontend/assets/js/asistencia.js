import { formatDate } from "./core.js";
import { readDate, writeDate } from "./dates.js";
import {
  DAYS,
  readDB,
  user,
  monday,
  addDays,
  closed,
  weekLabel,
  attendanceFor,
  setAttendance,
  validDate,
  escapeHTML as esc,
} from "./core.js";
import { $, bindForm, stepper, redirect, run } from "./ui.js";
export function init() {
  stepper(0);
  const query = new URLSearchParams(location.search).get("semana");
  let week = validDate(query || "") ? monday(query) : monday();
  function render() {
    const db = readDB(),
      u = user(db),
      saved = attendanceFor(db, u.id, week);
    writeDate($("#week"), week);
    $("#week-label").textContent = `Semana del ${weekLabel(week)}`;
    $("#attendance-days").innerHTML = DAYS.map((day, i) => {
      const date = addDays(week, i),
        holiday = db.holidays[date],
        leave = u.leaveStart && date >= u.leaveStart && date <= u.leaveEnd;
      return `<label class="attendance-day"><input type="checkbox" name="days" value="${date}" ${saved.includes(date) ? "checked" : ""} ${closed(date) || holiday || leave ? "disabled" : ""}><span>${day}</span><small>${holiday ? esc(holiday) : leave ? "Licencia" : closed(date) ? "Plazo cerrado" : `${formatDate(date)}`}</small></label>`;
    }).join("");
  }
  $("#week").addEventListener("change", () =>
    run(() => {
      if (!validDate(readDate($("#week"))))
        throw new Error("Elegí una fecha válida.");
      week = monday(readDate($("#week")));
      render();
    }),
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
