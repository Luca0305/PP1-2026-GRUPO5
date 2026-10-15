import { user } from "./core.js";
import { saveProfile } from "./accounts.js";
import { $, bindForm, message, confirmAction } from "./ui.js";
export function init() {
  const u = user();
  $("#name").value = u.firstName || u.name;
  $("#last-name").value = u.lastName || "";
  $("#email").value = u.email;
  $("#password").required = false;
  $("#confirm").required = false;
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
      lastName: data.get("last-name"),
      email: data.get("email"),
      current: data.get("current-password"),
      password: data.get("password"),
      confirm: data.get("confirm"),
    });
    ["#current-password", "#password", "#confirm"].forEach(
      (id) => ($(id).value = ""),
    );
    $(".account-name").textContent = user().name;
    message("Perfil actualizado. Tus pedidos y tu asistencia se conservan.");
  });
}
