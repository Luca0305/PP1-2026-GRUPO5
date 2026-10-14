import { readDate, writeDate } from "./dates.js";
import { refreshDatePreference } from "./dates.js";
import { user } from "./core.js";
import { saveProfile } from "./accounts.js";
import { $, bindForm, message, confirmAction } from "./ui.js";
export function init() {
  const u = user();
  $("#date-format").value = u.dateFormat || "DD/MM/AAAA";
  $("#name").value = u.name;
  $("#email").value = u.email;
  $("#password").required = false;
  $("#confirm").required = false;
  writeDate($("#leave-start"), u.leaveStart || "");
  writeDate($("#leave-end"), u.leaveEnd || "");
  $("#leave-fields").hidden = u.role === "admin";
  bindForm("#profile-form", async (data) => {
    if (
      !(await confirmAction(
        "Guardar perfil",
        "Se actualizarán tus datos. Si cambiás el email o la contraseña, usá los nuevos datos en el próximo ingreso.",
        "Guardar",
      ))
    )
      return;
    await saveProfile({
      name: data.get("name"),
      email: data.get("email"),
      current: data.get("current-password"),
      password: data.get("password"),
      confirm: data.get("confirm"),
      leaveStart: data.get("leave-start"),
      leaveEnd: data.get("leave-end"),
      dateFormat: data.get("date-format"),
    });
    ["#current-password", "#password", "#confirm"].forEach(
      (id) => ($(id).value = ""),
    );
    refreshDatePreference();
    $(".account-name").textContent = user().name;
    message("Perfil actualizado. Tus pedidos y tu asistencia se conservan.");
  });
}
