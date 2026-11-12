// Días sin servicio (administrador), contra la tabla dia_no_laborable:
//   GET    /api/dias-no-laborables              → las fechas registradas
//   POST   /api/dias-no-laborables              → crear o cambiar el motivo
//   DELETE /api/dias-no-laborables/{id}         → habilitar servicio
// Reglas (en el backend): solo fechas con plazo abierto; si hay pedidos activos ese día,
// hay que cancelarlos antes; si había menú, se despublica.
import { writeDate } from "./dates.js";
import { user, clock, closed, dateLabel, escapeHTML as esc } from "./core.js";
import { $, bindForm, run, message, confirmAction } from "./ui.js";
import { api } from "./api.js";

export async function init() {
  const u = user();
  let dias = [];
  let editingDate = "";
  writeDate($("#date"), clock().today);

  async function cargar() {
    dias = await api.diasNoLaborables();
    render();
  }

  function render() {
    $("#holidays").innerHTML = dias.length
      ? dias
          .map((d) => {
            const cerrado = closed(d.fecha);
            return `<article class="order-card"><div class="order-top"><h2>${esc(dateLabel(d.fecha))}</h2><span class="badge borrador">Sin servicio</span></div><p>${esc(d.motivo || "Sin motivo")}</p><div class="actions"><button class="secondary" data-edit="${d.id}" ${cerrado ? "disabled" : ""}>Editar motivo</button><button class="danger" data-remove="${d.id}" ${cerrado ? "disabled" : ""}>Habilitar servicio</button></div>${cerrado ? '<p class="help">Fecha cerrada: solo lectura.</p>' : ""}</article>`;
          })
          .join("")
      : '<div class="empty">No hay feriados ni cierres registrados. Agregá las fechas que correspondan al comedor.</div>';
  }

  bindForm("#holiday-form", async (data) => {
    const fecha = data.get("date");
    const motivo = String(data.get("reason") || "").trim();
    if (!fecha) throw new Error("Elegí una fecha.");
    if (!motivo || motivo.length > 120) throw new Error("Ingresá un motivo de hasta 120 caracteres.");
    if (dias.some((d) => d.fecha === fecha) && editingDate !== fecha)
      throw new Error("Ya existe un cierre en esa fecha. Usá Editar motivo para modificarlo.");
    if (
      !(await confirmAction(
        "Guardar día sin servicio",
        "Los empleados no podrán marcar asistencia ni pedir para esta fecha. Si había menú, se despublica.",
        "Guardar",
      ))
    )
      return;
    await api.guardarDiaNoLaborable(u.id, fecha, motivo);
    editingDate = "";
    $("#reason").value = "";
    await cargar();
    message("Calendario actualizado.");
  });

  $("#holidays").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    run(async () => {
      const dia = dias.find((d) => String(d.id) === (b.dataset.edit || b.dataset.remove));
      if (!dia) return;
      if (b.dataset.edit) {
        editingDate = dia.fecha;
        writeDate($("#date"), dia.fecha);
        $("#reason").value = dia.motivo || "";
        $("#reason").focus();
        return;
      }
      if (
        await confirmAction(
          "Habilitar servicio",
          "La fecha vuelve a estar disponible. Si tenía menú, quedó en borrador: publicalo desde Menús.",
          "Habilitar",
        )
      ) {
        await api.habilitarDia(dia.id, u.id);
        await cargar();
        message("Fecha habilitada.");
      }
    }, b);
  });

  await cargar();
}
