import { FieldError, nameError } from "./validation.js";
import {
  readDB,
  saveDB,
  requireUser,
  checkIdentity,
  credential,
  verify,
  uid,
} from "./core.js";
export async function saveAccount({ id, name, email, role, password }) {
  checkIdentity(name, email, password || undefined);
  if (!["empleado", "admin"].includes(role))
    throw new Error("Elegí un rol válido.");
  const auth = password ? await credential(password) : null;
  const db = readDB(),
    me = requireUser("admin", db),
    existing = db.users.find((u) => u.id === id);
  if (id && !existing) throw new Error("La cuenta ya no existe.");
  if (db.users.some((u) => u.id !== id && u.email === email.toLowerCase()))
    throw new FieldError("email", "Ya existe una cuenta con ese email.");
  if (existing && existing.role !== role) {
    if (existing.id === me.id)
      throw new Error("No podés cambiar tu propio rol.");
    if (
      existing.role === "admin" &&
      !existing.pending &&
      existing.active &&
      db.users.filter((u) => u.active && !u.pending && u.role === "admin")
        .length === 1
    )
      throw new Error("Debe quedar al menos un administrador activo.");
  }
  // Una edición del nombre completo no debe dejar componentes anteriores en el perfil.
  if (existing && existing.name !== name.trim()) {
    delete existing.firstName;
    delete existing.lastName;
  }
  if (existing)
    Object.assign(existing, {
      name: name.trim(),
      email: email.toLowerCase(),
      role,
      ...(auth ? { auth, pending: false } : {}),
    });
  else
    db.users.push({
      id: uid(),
      name: name.trim(),
      email: email.toLowerCase(),
      role,
      auth,
      active: true,
      pending: !auth,
    });
  saveDB(db);
}
export function toggleAccount(id) {
  const db = readDB(),
    me = requireUser("admin", db),
    target = db.users.find((u) => u.id === id);
  if (!target) throw new Error("No se encontró el usuario.");
  if (me.id === id) throw new Error("No podés desactivar tu propia cuenta.");
  if (
    target.active &&
    !target.pending &&
    target.role === "admin" &&
    db.users.filter((u) => u.active && !u.pending && u.role === "admin")
      .length === 1
  )
    throw new Error("Debe quedar al menos un administrador activo.");
  target.active = !target.active;
  saveDB(db);
}
export async function saveProfile({
  name,
  lastName,
  email,
  current,
  password,
  confirm,
}) {
  checkIdentity(name, email);
  if (nameError(lastName))
    throw new FieldError("last-name", "Apellido: " + nameError(lastName));
  const before = requireUser(),
    change = Boolean(current || password || confirm);
  let auth;
  if (change) {
    if (!(await verify(current, before.auth)))
      throw new FieldError(
        "current-password",
        "La contraseña actual es incorrecta. Revisala antes de cambiarla.",
      );
    checkIdentity(name, email, password);
    if (password !== confirm)
      throw new FieldError("confirm", "Las nuevas contraseñas no coinciden.");
    auth = await credential(password);
  }
  const db = readDB(),
    me = requireUser(null, db);
  if (me.id !== before.id || me.auth.hash !== before.auth.hash)
    throw new Error(
      "Tu cuenta cambió durante la edición. Recargá antes de continuar.",
    );
  if (db.users.some((u) => u.id !== me.id && u.email === email.toLowerCase()))
    throw new FieldError("email", "Ya existe una cuenta con ese email.");
  delete me.dateFormat; // Preferencia antigua: todas las fechas usan DD/MM/AAAA.
  Object.assign(me, {
    name: `${name.trim()} ${lastName.trim()}`,
    firstName: name.trim(),
    lastName: lastName.trim(),
    email: email.toLowerCase(),
    ...(auth ? { auth, pending: false } : {}),
  });
  saveDB(db);
}
