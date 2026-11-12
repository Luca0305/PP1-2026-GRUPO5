// Usuarios (administrador), contra la tabla usuario:
//   GET  /api/usuarios?idUsuario          → todas las cuentas (sin contraseñas)
//   POST /api/usuarios                    → autorizar email + rol (queda "registro pendiente")
//   PUT  /api/usuarios/{id}               → editar nombre, apellido, correo y rol
//   PUT  /api/usuarios/{id}/activo        → activar / desactivar
// Reglas (en el backend): no podés cambiar tu rol ni desactivarte, y siempre queda
// al menos un administrador activo.
import { user, escapeHTML as esc } from "./core.js";
import { FieldError, nameError } from "./validation.js";
import { $, bindForm, run, message, confirmAction } from "./ui.js";
import { api } from "./api.js";

const ROL = { EMPLEADO: "Empleado", ADMINISTRADOR: "Administrador" };

export async function init() {
  const yo = user();
  let usuarios = [];
  let editId = null;

  async function cargar() {
    usuarios = await api.usuarios(yo.id);
    render();
  }

  function render() {
    const term = $("#search-users").value.toLowerCase();
    const lista = usuarios.filter((u) =>
      `${u.nombre} ${u.apellido} ${u.correo}`.toLowerCase().includes(term),
    );
    $("#users-body").innerHTML = lista.length
      ? lista
          .map((u) => {
            const estado = !u.activo ? "Desactivado" : u.pendiente ? "Registro pendiente" : "Activo";
            const clase = !u.activo ? "cancelado" : u.pendiente ? "borrador" : "confirmado";
            const soyYo = u.id === yo.id;
            return `<tr><td data-label="Persona"><strong>${esc(u.nombre)} ${esc(u.apellido)}${soyYo ? " (vos)" : ""}</strong><p class="help">${esc(u.correo)}</p></td><td data-label="Rol">${ROL[u.rol] || esc(u.rol)}</td><td data-label="Estado"><span class="badge ${clase}">${estado}</span></td><td data-label="Acciones"><div class="actions"><button class="secondary" data-edit="${u.id}">Editar</button><button class="${u.activo ? "danger" : "secondary"}" data-toggle="${u.id}" ${soyYo ? "disabled" : ""}>${u.activo ? "Desactivar" : "Activar"}</button></div></td></tr>`;
          })
          .join("")
      : '<tr><td colspan="4">No hay usuarios que coincidan con la búsqueda.</td></tr>';
  }

  function reset() {
    editId = null;
    $("#user-form").reset();
    $("#role").disabled = false;
    $("#user-form-title").textContent = "Autorizar nuevo usuario";
    $("#save-user").textContent = "Guardar autorización";
    $("#cancel-user").hidden = true;
    $("#user-password-note").textContent =
      "Autorizá el email y el rol. La persona completará el registro desde Registrate con su propia contraseña.";
  }

  $("#search-users").addEventListener("input", render);
  $("#cancel-user").addEventListener("click", reset);
  $("#users-body").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    run(async () => {
      const u = usuarios.find((x) => String(x.id) === (b.dataset.edit || b.dataset.toggle));
      if (!u) throw new Error("Usuario no disponible. Recargá la página.");
      if (b.dataset.edit) {
        editId = u.id;
        $("#name").value = u.nombre;
        $("#last-name").value = u.apellido;
        $("#email").value = u.correo;
        $("#role").value = u.rol;
        // Tu propio rol no se cambia (regla del backend): el selector queda bloqueado.
        $("#role").disabled = u.id === yo.id;
        $("#user-form-title").textContent = `Editar a ${u.nombre} ${u.apellido}`;
        $("#save-user").textContent = "Guardar cambios";
        $("#cancel-user").hidden = false;
        $("#user-password-note").textContent =
          "Se conserva la contraseña de la persona. Podés actualizar sus datos y su rol.";
        $("#name").focus();
        $("#user-form").scrollIntoView({ block: "center" });
        return;
      }
      const activar = !u.activo;
      if (
        !(await confirmAction(
          activar ? "Activar usuario" : "Desactivar usuario",
          activar
            ? `${u.nombre} ${u.apellido} podrá volver a iniciar sesión.`
            : `${u.nombre} ${u.apellido} perderá el acceso. Sus pedidos se conservan; no se cancelan automáticamente.`,
          activar ? "Activar" : "Desactivar",
        ))
      )
        return;
      await api.cambiarActivo(u.id, yo.id, activar);
      await cargar();
      message(activar ? "Usuario activado." : "Usuario desactivado.");
    }, b);
  });

  bindForm("#user-form", async (data) => {
    const nombre = String(data.get("name") || "").trim();
    const apellido = String(data.get("last-name") || "").trim();
    const correo = String(data.get("email") || "").trim().toLowerCase();
    if (nameError(nombre)) throw new FieldError("name", "Nombre: " + nameError(nombre));
    if (nameError(apellido)) throw new FieldError("last-name", "Apellido: " + nameError(apellido));
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      throw new FieldError("email", "Ingresá un email válido.");
    const datos = { idAdministrador: yo.id, nombre, apellido, correo, rol: $("#role").value };
    if (editId) {
      if (!(await confirmAction("Guardar usuario", "Se actualizarán los datos y permisos de esta cuenta.", "Guardar")))
        return;
      await api.editarUsuario(editId, datos);
    } else {
      await api.autorizarUsuario(datos);
    }
    const eraEdicion = Boolean(editId);
    reset();
    await cargar();
    message(
      eraEdicion
        ? "Datos guardados."
        : "Usuario autorizado. Completa su alta desde Registrate con ese email.",
    );
  });

  reset();
  await cargar();
}
