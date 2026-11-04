import { readDate, writeDate } from "./dates.js";
import {
  readDB,
  clock,
  closed,
  dateLabel,
  setHoliday,
  escapeHTML as esc,
} from "./core.js";
import { $, bindForm, run, message, confirmAction } from "./ui.js";
export function init() {
  let editingDate = "";
  writeDate($("#date"), clock().today);
  function render() {
    const dates = Object.entries(readDB().holidays).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    $("#holidays").innerHTML = dates.length
      ? dates
          .map(
            ([date, reason]) =>
              `<article class="order-card"><div class="order-top"><h2>${esc(dateLabel(date))}</h2><span class="badge borrador">Sin servicio</span></div><p>${esc(reason)}</p><div class="actions"><button class="secondary" data-edit="${date}" ${closed(date) ? "disabled" : ""}>Editar motivo</button><button class="danger" data-remove="${date}" ${closed(date) ? "disabled" : ""}>Habilitar servicio</button></div>${closed(date) ? '<p class="help">Fecha cerrada: solo lectura.</p>' : ""}</article>`,
          )
          .join("")
      : '<div class="empty">No hay feriados ni cierres registrados. Agregá las fechas que correspondan al comedor.</div>';
  }
  bindForm("#holiday-form", async (data) => {
    const reason = data.get("reason").trim();
    if (readDB().holidays[data.get("date")] && editingDate !== data.get("date"))
      throw new Error(
        "Ya existe un cierre en esa fecha. Usá Editar motivo para modificarlo.",
      );
    if (!reason || reason.length > 120)
      throw new Error("Ingresá un motivo de hasta 120 caracteres.");
    if (
      !(await confirmAction(
        "Guardar día sin servicio",
        "Los empleados no podrán registrar pedidos para esta fecha.",
        "Guardar",
      ))
    )
      return;
    setHoliday(data.get("date"), reason);
    editingDate = "";
    $("#reason").value = "";
    render();
    message("Calendario actualizado.");
  });
  $("#holidays").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    run(async () => {
      if (b.dataset.edit) {
        editingDate = b.dataset.edit;
        writeDate($("#date"), b.dataset.edit);
        $("#reason").value = readDB().holidays[b.dataset.edit];
        $("#reason").focus();
      }
      if (
        b.dataset.remove &&
        (await confirmAction(
          "Habilitar servicio",
          "La fecha volverá a estar disponible si tiene menú publicado.",
          "Habilitar",
        ))
      ) {
        setHoliday(b.dataset.remove, null);
        render();
        message("Fecha habilitada.");
      }
    }, b);
  });
  render();
}
