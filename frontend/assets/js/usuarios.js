import {
  readDB,
  user,
  clock,
  addDays,
  dateLabel,
  grantException,
  revokeException,
  escapeHTML as esc,
} from "./core.js";
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
  // ── Excepciones de horario ──
  // Hoy y los próximos días hábiles, sin feriados.
  function upcomingDays(db) {
    const days = [];
    for (let date = clock().today; days.length < 10; date = addDays(date, 1)) {
      const weekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
      if (weekday < 5 && !db.holidays[date]) days.push(date);
      if (date > addDays(clock().today, 30)) break;
    }
    return days;
  }
  function renderExceptions() {
    const db = readDB(),
      employees = db.users.filter(
        (u) => u.role === "empleado" && u.active && !u.pending,
      );
    const keepUser = $("#exception-user").value,
      keepDate = $("#exception-date").value;
    $("#exception-user").innerHTML = employees.length
      ? employees
          .map(
            (u) =>
              `<option value="${u.id}" ${u.id === keepUser ? "selected" : ""}>${esc(u.name)}</option>`,
          )
          .join("")
      : '<option value="">No hay empleados activos</option>';
    $("#exception-date").innerHTML = upcomingDays(db)
      .map(
        (date) =>
          `<option value="${date}" ${date === keepDate ? "selected" : ""}>${esc(dateLabel(date))}</option>`,
      )
      .join("");
    $("#grant-exception").disabled = !employees.length;
    const today = clock().today,
      active = Object.entries(db.exceptions || {})
        .flatMap(([userId, dates]) =>
          Object.keys(dates)
            .filter((date) => date >= today)
            .map((date) => ({
              userId,
              date,
              name: db.users.find((u) => u.id === userId)?.name || "Usuario",
            })),
        )
        .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
    $("#exception-count").textContent = active.length;
    $("#exception-body").innerHTML = active.length
      ? active
          .map(
            (x) =>
              `<tr><td data-label="Empleado">${esc(x.name)}</td><td data-label="Día">${esc(dateLabel(x.date))}</td><td data-label="Acciones"><button type="button" class="danger" data-revoke="${x.userId}" data-date="${x.date}">Quitar</button></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="3">No hay excepciones vigentes.</td></tr>';
  }
  bindForm("#exception-form", () => {
    grantException($("#exception-user").value, $("#exception-date").value);
    renderExceptions();
    message("Excepción habilitada. El empleado ya puede operar ese día.");
  });
  $("#exception-body").addEventListener("click", (e) => {
    const b = e.target.closest("[data-revoke]");
    if (!b) return;
    run(() => {
      revokeException(b.dataset.revoke, b.dataset.date);
      renderExceptions();
      message("Excepción quitada.");
    }, b);
  });
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
  renderExceptions();
}
