import { readDB, user, escapeHTML as esc } from "./core.js";
import { saveAccount, toggleAccount } from "./accounts.js";
import { $, bindForm, run, message, confirmAction } from "./ui.js";
export function init() {
  let editId = null;
  function render() {
    const db = readDB(),
      term = $("#search-users").value.toLowerCase();
    const users = db.users.filter((u) =>
      `${u.name} ${u.email}`.toLowerCase().includes(term),
    );
    $("#users-body").innerHTML = users.length
      ? users
          .map(
            (u) =>
              `<tr><td data-label="Persona"><strong>${esc(u.name)}${user(db).id === u.id ? " (vos)" : ""}</strong><p class="help">${esc(u.email)}</p></td><td data-label="Rol">${u.role === "admin" ? "Administrador" : "Empleado"}</td><td data-label="Estado"><span class="badge ${u.active ? "confirmado" : "cancelado"}">${!u.active ? "Desactivado" : u.pending ? "Registro pendiente" : "Activo"}</span></td><td data-label="Acciones"><button class="secondary" data-edit="${u.id}">Editar</button><button class="${u.active ? "danger" : "secondary"}" data-toggle="${u.id}" ${u.id === user(db).id ? "disabled" : ""}>${u.active ? "Desactivar" : "Activar"}</button></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="4">No hay usuarios que coincidan con la búsqueda.</td></tr>';
  }
  function reset() {
    editId = null;
    $("#user-form").reset();
    $("#user-form-title").textContent = "Autorizar nuevo usuario";
    $("#save-user").textContent = "Guardar autorización";
    $("#cancel-user").hidden = true;
    $("#user-password-note").textContent =
      "Autorizá el email y el rol. La persona completará el registro con su propia contraseña.";
  }
  $("#search-users").addEventListener("input", render);
  $("#cancel-user").addEventListener("click", reset);
  $("#users-body").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    run(async () => {
      const db = readDB(),
        u = db.users.find((u) => u.id === (b.dataset.edit || b.dataset.toggle));
      if (!u) throw new Error("Usuario no disponible.");
      if (b.dataset.edit) {
        editId = u.id;
        $("#name").value = u.name;
        $("#email").value = u.email;
        $("#role").value = u.role;
        $("#user-form-title").textContent = `Editar a ${u.name}`;
        $("#save-user").textContent = "Guardar cambios";
        $("#cancel-user").hidden = false;
        $("#user-password-note").textContent =
          "Se conservará la contraseña de la persona. Podés actualizar sus datos y su rol.";
        $("#name").focus();
        return;
      }
      const activeOrders = db.orders.filter(
        (o) => o.userId === u.id && o.status !== "Cancelado",
      ).length;
      if (
        await confirmAction(
          u.active ? "Desactivar usuario" : "Activar usuario",
          u.active
            ? `${u.name} perderá el acceso. Sus ${activeOrders} pedidos activos se conservan; no se cancelan automáticamente.`
            : `${u.name} podrá volver a iniciar sesión.`,
          u.active ? "Desactivar" : "Activar",
        )
      ) {
        toggleAccount(u.id);
        render();
        message("Estado del usuario actualizado.");
      }
    }, b);
  });
  bindForm("#user-form", async (data) => {
    if (
      editId &&
      !(await confirmAction(
        "Guardar usuario",
        "Se actualizarán los datos y permisos de esta cuenta.",
        "Guardar",
      ))
    )
      return;
    await saveAccount({
      id: editId,
      name: data.get("name"),
      email: data.get("email"),
      role: data.get("role"),
      password: "",
    });
    reset();
    render();
    message(
      "Datos guardados. Las cuentas pendientes completan su alta desde Registrate.",
    );
  });
  render();
}
