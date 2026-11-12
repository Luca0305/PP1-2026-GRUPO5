// Mi perfil: el usuario actualiza sus datos y, si quiere, su contraseña.
//   PUT /api/usuarios/{id}/perfil  → valida y guarda en la tabla usuario (MySQL)
// Para cambiar la contraseña hay que escribir la actual; vacíos = se conserva.
import { user, guardarSesion } from "./core.js";
import { FieldError, nameError, emailError, passwordError } from "./validation.js";
import { $, bindForm, message, confirmAction } from "./ui.js";
import { api } from "./api.js";

export function init() {
  const u = user();
  $("#name").value = u.nombre;
  $("#last-name").value = u.apellido;
  $("#email").value = u.correo;
  $("#password").required = false;
  $("#confirm").required = false;
  bindForm("#profile-form", async (data) => {
    const nombre = String(data.get("name") || "").trim();
    const apellido = String(data.get("last-name") || "").trim();
    const correo = String(data.get("email") || "").trim().toLowerCase();
    const actual = data.get("current-password") || "";
    const nueva = data.get("password") || "";
    const confirmacion = data.get("confirm") || "";
    if (nameError(nombre)) throw new FieldError("name", "Nombre: " + nameError(nombre));
    if (nameError(apellido)) throw new FieldError("last-name", "Apellido: " + nameError(apellido));
    if (!correo) throw new FieldError("email", "Ingresá tu email.");
    // El email nuevo tiene que cumplir la política del registro; el actual (del script) se respeta.
    if (correo !== u.correo && emailError(correo)) throw new FieldError("email", emailError(correo));
    const cambiaClave = Boolean(actual || nueva || confirmacion);
    if (cambiaClave) {
      if (!actual) throw new FieldError("current-password", "Escribí tu contraseña actual para cambiarla.");
      if (passwordError(nueva)) throw new FieldError("password", passwordError(nueva));
      if (nueva !== confirmacion) throw new FieldError("confirm", "Las nuevas contraseñas no coinciden.");
    }
    if (
      !(await confirmAction(
        "Guardar perfil",
        "Se actualizarán tus datos. Si cambiás el email o la contraseña, usá los nuevos datos en el próximo ingreso.",
        "Guardar",
      ))
    )
      return;
    let actualizado;
    try {
      actualizado = await api.actualizarPerfil(u.id, {
        nombre,
        apellido,
        correo,
        telefono: u.telefono,
        contrasenaActual: cambiaClave ? actual : "",
        contrasenaNueva: cambiaClave ? nueva : "",
      });
    } catch (error) {
      if (/actual/i.test(error.message)) throw new FieldError("current-password", error.message);
      if (/correo/i.test(error.message)) throw new FieldError("email", error.message);
      if (/nueva/i.test(error.message)) throw new FieldError("password", error.message);
      throw error;
    }
    guardarSesion(actualizado);
    ["#current-password", "#password", "#confirm"].forEach((id) => ($(id).value = ""));
    const nombreCabecera = document.querySelector(".account-name");
    if (nombreCabecera) nombreCabecera.textContent = `${actualizado.nombre} ${actualizado.apellido}`;
    message("Perfil actualizado. Tus pedidos y tu asistencia se conservan.");
  });
}
