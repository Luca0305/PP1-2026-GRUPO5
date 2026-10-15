import { cargarMenusIniciales } from "./datos.js";
import { FieldError, emailError, passwordError, nameError } from "./validation.js";
// Reglas y persistencia compartidas. La UI está en ui.js y cada pantalla tiene su módulo.
export const DB_KEY = "sistemaPedidos:v1";
export const SESSION_KEY = "sistemaPedidos:sesion";
export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
export const PASSWORD_HELP =
  "Entre 8 y 64 caracteres, con mayúscula, minúscula, número y símbolo (! @ # $ % & *). Sin espacios.";
export const uid = () => crypto.randomUUID();
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// El corte se interpreta siempre en Argentina, incluso con otra zona en el equipo.
export function clock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return {
    today: `${p.year}-${p.month}-${p.day}`,
    hour: Number(p.hour),
    minute: Number(p.minute),
  };
}
export function addDays(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function monday(iso = clock().today) {
  return addDays(iso, -((new Date(`${iso}T12:00:00Z`).getUTCDay() + 6) % 7));
}
export function validDate(iso) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(iso) &&
    !Number.isNaN(Date.parse(iso)) &&
    new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10) === iso
  );
}
export function closed(iso, now = new Date()) {
  const c = clock(now);
  return iso < c.today || (iso === c.today && c.hour >= 10);
}
export const DATE_FORMATS = ["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"];
export function datePreference() {
  return user()?.dateFormat || "DD/MM/AAAA";
}
export function formatDate(iso, preference = datePreference()) {
  if (!validDate(iso)) return "";
  const [year, month, day] = iso.split("-");
  if (preference === "MM/DD/AAAA") return `${month}/${day}/${year}`;
  if (preference === "AAAA-MM-DD") return iso;
  return `${day}/${month}/${year}`;
}
export function parseDate(value, preference = datePreference()) {
  if (preference === "AAAA-MM-DD") return validDate(value) ? value : "";
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return "";
  const [, first, second, year] = match;
  const iso =
    preference === "MM/DD/AAAA"
      ? `${year}-${first}-${second}`
      : `${year}-${second}-${first}`;
  return validDate(iso) ? iso : "";
}
export const dateLabel = (iso) =>
  `${new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`))} ${formatDate(iso)}`;
export const weekLabel = (iso) =>
  `${formatDate(iso)} al ${formatDate(addDays(iso, 4))}`;
export const emailValid = (value) =>
  typeof value === "string" && !emailError(value);
export const passwordValid = (value) =>
  typeof value === "string" && !passwordError(value);
export function checkIdentity(name, email, password) {
  if (nameError(name)) throw new FieldError("name", nameError(name));
  if (emailError(email)) throw new FieldError("email", emailError(email));
  if (password !== undefined && passwordError(password))
    throw new FieldError("password", passwordError(password));
}
let assignedAdmins = [];
// Simula la asignación empresarial. No incluye contraseñas ni cuentas de ejemplo.
export async function loadCompany() {
  const response = await fetch("data/empresa.json", { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      "No se pudo cargar la asignación de la empresa. Reintentá la carga.",
    );
  const config = await response.json();
  if (
    !Array.isArray(config.administradoresAutorizados) ||
    config.administradoresAutorizados.some((email) => !emailValid(email))
  )
    throw new Error(
      "Revisá los emails autorizados en data/empresa.json: deben ser válidos y terminar en .com.",
    );
  assignedAdmins = config.administradoresAutorizados.map((email) =>
    email.toLowerCase(),
  );
}
export function readDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) throw new Error("No se encontraron los datos. Recargá la página.");
  const db = JSON.parse(raw);
  if (
    db.version !== 1 ||
    !Array.isArray(db.users) ||
    !Array.isArray(db.orders) ||
    !Array.isArray(db.menus) ||
    !db.attendance ||
    !db.holidays
  )
    throw new Error(
      "Los datos locales no son válidos. Conservá una copia antes de restablecerlos.",
    );
  return db;
}
export function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new Error(
      "No se pudo guardar. Revisá el espacio y los permisos de almacenamiento del navegador.",
    );
  }
}
export async function initDB() {
  await loadCompany();
  if (localStorage.getItem(DB_KEY)) return readDB();
  const datos = await cargarMenusIniciales();
  const menus = [];
  const holidays = {};
  const fechas = new Set();
  for (const menuDia of datos.menus) {
    if (!validDate(menuDia.fecha) || !DAYS.some((_, i) => addDays(monday(menuDia.fecha), i) === menuDia.fecha) || fechas.has(menuDia.fecha) || typeof menuDia.publicado !== "boolean")
      throw new Error("Revisá los menús iniciales: una fecha hábil única por menú y publicado verdadero o falso.");
    fechas.add(menuDia.fecha);
    const week = monday(menuDia.fecha);
    let semana = menus.find(menu => menu.week === week);
    if (!semana) {
      semana = {week, status: menuDia.publicado ? "Publicado" : "Borrador", days: DAYS.map((_, i) => ({date:addDays(week,i), noService:true, options:[]}))};
      menus.push(semana);
    }
    if (semana.status !== (menuDia.publicado ? "Publicado" : "Borrador"))
      throw new Error("La vista semanal requiere el mismo estado de publicación para los días de una semana.");
    const dia = semana.days.find(dia => dia.date === menuDia.fecha);
    dia.noService = false;
    for (const opcion of datos.opciones.filter(opcion => opcion.idMenuDia === menuDia.id)) {
      const plato = datos.platos.find(plato => plato.id === opcion.idPlato);
      // Una lista de platos vacía es un estado de interfaz, no un error de red.
      if (!plato && datos.platos.length) throw new Error("Una opción referencia un plato inexistente.");
      if (!Number.isInteger(opcion.stockDisponible) || opcion.stockDisponible < 0 || opcion.stockDisponible > 9999)
        throw new Error("El stock inicial debe ser un entero entre 0 y 9999.");
      if (plato) dia.options.push({id:String(opcion.id), idPlato:plato.id, name:plato.nombre, description:plato.descripcion, stock:opcion.stockDisponible, vegetarian:plato.categoria === "vegetariano", glutenFree:false});
    }
  }
  if (datos.opciones.some(opcion => !datos.menus.some(menu => menu.id === opcion.idMenuDia)))
    throw new Error("Una opción referencia un menú inexistente.");
  for (const feriado of datos.feriados) {
    if (!validDate(feriado.fecha) || typeof feriado.motivo !== "string" || !feriado.motivo.trim() || holidays[feriado.fecha])
      throw new Error("Revisá las fechas y motivos de los días no laborables.");
    holidays[feriado.fecha] = feriado.motivo;
  }
  // Se inicializa una sola vez: las fechas nunca se desplazan al volver a entrar.
  const db = {
    version: 1,
    users: [],
    menus,
    orders: [],
    attendance: {},
    holidays,
    reports: {},
  };
  if (localStorage.getItem(DB_KEY)) return readDB();
  saveDB(db);
  return db;
}
export function user(db = readDB()) {
  const id = sessionStorage.getItem(SESSION_KEY);
  return (
    db.users.find(
      (u) =>
        u.id === id &&
        u.active &&
        !u.pending &&
        (u.sessionVersion || 0) ===
          Number(sessionStorage.getItem("sistemaPedidos:versionSesion") || 0),
    ) || null
  );
}
export function requireUser(role, db = readDB()) {
  const u = user(db);
  if (!u || (role && u.role !== role))
    throw new Error(
      "Tu sesión no tiene acceso a esta acción. Volvé a iniciar sesión.",
    );
  return u;
}
export function home(u) {
  return u.role === "admin" ? "menuadmin.html" : "asistencia.html";
}

// Sin contraseñas en texto plano. La autorización real deberá hacerse en el servidor.
async function derive(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: Uint8Array.from(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
export async function credential(password) {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, hash: await derive(password, salt) };
}
export async function verify(password, record) {
  return record && (await derive(password, record.salt)) === record.hash;
}
export async function register({ name, email, password, confirm }) {
  checkIdentity(name, email, password);
  if (password !== confirm)
    throw new FieldError(
      "confirm",
      "Las contraseñas no coinciden. Repetí exactamente la misma contraseña.",
    );
  const auth = await credential(password);
  const db = readDB();
  const existing = db.users.find((u) => u.email === email.toLowerCase());
  if (existing && !existing.pending)
    throw new FieldError(
      "email",
      "Este email ya está registrado. Volvé a Iniciar sesión con esa cuenta.",
    );
  if (existing && !existing.active)
    throw new FieldError(
      "email",
      "La autorización de esta cuenta está desactivada. Consultá al administrador.",
    );
  if (existing)
    Object.assign(existing, { name: name.trim(), auth, pending: false });
  else
    db.users.push({
      id: uid(),
      name: name.trim(),
      email: email.toLowerCase(),
      auth,
      role: assignedAdmins.includes(email.toLowerCase()) ? "admin" : "empleado",
      active: true,
      dateFormat: "DD/MM/AAAA",
    });
  saveDB(db);
}
export async function login(email, password) {
  if (emailError(email)) throw new FieldError("email", emailError(email));
  if (passwordError(password))
    throw new FieldError("password", passwordError(password));
  const u = readDB().users.find((u) => u.email === email.toLowerCase());
  if (!u || u.pending || !u.active)
    throw new Error(
      "Tu cuenta no está registrada o activada. Si todavía no completaste el registro, elegí Registrate. Si ya tenés una cuenta, consultá al administrador para recuperar el acceso.",
    );
  if (!(await verify(password, u.auth)))
    throw new FieldError(
      "password",
      "La contraseña no coincide con la registrada para este email. Revisala; podés usar el ojo para verla.",
    );
  const current = readDB().users.find((x) => x.id === u.id);
  if (!current?.active || current.auth.hash !== u.auth.hash)
    throw new FieldError(
      "email",
      "La cuenta cambió durante el ingreso. Volvé a intentarlo.",
    );
  sessionStorage.setItem(SESSION_KEY, current.id);
  sessionStorage.setItem(
    "sistemaPedidos:versionSesion",
    String(current.sessionVersion || 0),
  );
  return current;
}
export const attendanceFor = (db, id, week) => db.attendance[id]?.[week] || [];
export function setAttendance(week, dates) {
  const db = readDB(),
    u = requireUser("empleado", db);
  if (!validDate(week) || monday(week) !== week)
    throw new Error("Elegí una semana válida.");
  if (!dates.length) throw new Error("Elegí al menos un día de asistencia.");
  if (
    dates.some(
      (d) => !DAYS.some((_, i) => addDays(week, i) === d) || db.holidays[d],
    )
  )
    throw new Error("La asistencia incluye un día no habilitado.");
  const previous = attendanceFor(db, u.id, week);
  if (
    [...new Set([...previous, ...dates])].some(
      (d) => closed(d) && previous.includes(d) !== dates.includes(d),
    )
  )
    throw new Error(
      "No se puede cambiar la asistencia después de las 10:00 del día correspondiente.",
    );
  if (
    db.orders.some(
      (o) =>
        o.userId === u.id &&
        o.status !== "Cancelado" &&
        monday(o.date) === week &&
        !dates.includes(o.date),
    )
  )
    throw new Error(
      "Primero cancelá los pedidos de los días que querés quitar.",
    );
  db.attendance[u.id] ||= {};
  db.attendance[u.id][week] = dates;
  saveDB(db);
}
export function available(db, optionId, excluding) {
  const option = db.menus
    .flatMap((m) => m.days.flatMap((d) => d.options))
    .find((o) => o.id === optionId);
  if (!option) return 0;
  return (
    option.stock -
    db.orders.filter(
      (o) =>
        o.optionId === optionId &&
        o.status === "Confirmado" &&
        o.id !== excluding,
    ).length
  );
}
export function validateOrder(db, u, { date, optionId, comment }, excluding) {
  if (!validDate(date) || closed(date))
    throw new Error(
      "El plazo para este pedido terminó: el corte es a las 10:00 de cada día.",
    );
  if (db.holidays[date])
    throw new Error("Ese día es feriado o no tiene servicio.");
  if (!attendanceFor(db, u.id, monday(date)).includes(date))
    throw new Error("Primero registrá tu asistencia para ese día.");
  const menu = db.menus.find(
    (m) => m.week === monday(date) && m.status === "Publicado",
  );
  const day = menu?.days.find((d) => d.date === date);
  const option = day?.options.find((o) => o.id === optionId);
  if (!option || day.noService)
    throw new Error(
      "La opción ya no está publicada. Volvé al menú y elegí otra.",
    );
  if (typeof comment !== "string" || comment.length > 200)
    throw new Error("El comentario admite hasta 200 caracteres.");
  if (available(db, optionId, excluding) <= 0)
    throw new Error("Esta opción no tiene stock. Elegí otra.");
  return option;
}
export function saveOrder(data, editId) {
  const db = readDB(),
    u = requireUser("empleado", db);
  const existing = editId
    ? db.orders.find(
        (o) => o.id === editId && o.userId === u.id && o.status !== "Cancelado",
      )
    : null;
  if (editId && !existing)
    throw new Error("No se encontró el pedido a modificar.");
  if (existing && existing.date !== data.date)
    throw new Error(
      "Para cambiar de fecha cancelá el pedido y creá uno nuevo.",
    );
  if (
    db.orders.some(
      (o) =>
        o.userId === u.id &&
        o.date === data.date &&
        o.status !== "Cancelado" &&
        o.id !== editId,
    )
  )
    throw new Error(
      "Ya tenés un pedido para ese día. Modificalo desde Mis pedidos.",
    );
  const option = validateOrder(db, u, data, editId);
  const unchanged =
    existing &&
    existing.optionId === data.optionId &&
    existing.comment === data.comment;
  const order = {
    ...existing,
    id: existing?.id || uid(),
    userId: u.id,
    date: data.date,
    optionId: data.optionId,
    plate: option.name,
    comment: data.comment,
    status: unchanged ? existing.status : "Borrador",
    updatedAt: new Date().toISOString(),
  };
  db.orders = db.orders.filter((o) => o.id !== order.id);
  db.orders.push(order);
  saveDB(db);
  return order;
}
export function changeOrder(id, action) {
  const db = readDB(),
    u = requireUser("empleado", db);
  const o = db.orders.find(
    (o) => o.id === id && o.userId === u.id && o.status !== "Cancelado",
  );
  if (!o) throw new Error("El pedido ya no está disponible.");
  if (closed(o.date))
    throw new Error("El pedido está cerrado: el plazo terminó a las 10:00.");
  if (action === "confirm") {
    validateOrder(db, u, o, o.id);
    o.status = "Confirmado";
  } else if (action === "cancel") o.status = "Cancelado";
  else throw new Error("Acción no válida.");
  o.updatedAt = new Date().toISOString();
  saveDB(db);
}
export function saveMenu(menu) {
  const db = readDB();
  requireUser("admin", db);
  if (
    !validDate(menu.week) ||
    monday(menu.week) !== menu.week ||
    menu.days.length !== 5 ||
    menu.days.some((d, i) => d.date !== addDays(menu.week, i))
  )
    throw new Error("La semana del menú no es válida.");
  const before = db.menus.find((m) => m.week === menu.week);
  for (const day of menu.days) {
    const old = before?.days.find((d) => d.date === day.date);
    if (closed(day.date) && JSON.stringify(old) !== JSON.stringify(day))
      throw new Error(
        "No se pueden modificar días cuyo horario de corte ya pasó.",
      );
    if (
      menu.status === "Publicado" &&
      !day.noService &&
      !db.holidays[day.date] &&
      !day.options.length
    )
      throw new Error(
        `Agregá una opción o marcá Sin servicio para ${dateLabel(day.date)}.`,
      );
    for (const op of day.options) {
      if (
        !op.name.trim() ||
        op.name.length > 60 ||
        op.description.length > 140 ||
        !Number.isInteger(op.stock) ||
        op.stock < 0 ||
        op.stock > 9999
      )
        throw new Error(
          "Revisá los platos: nombre hasta 60 caracteres, descripción hasta 140 y stock entero de 0 a 9999.",
        );
      const confirmed = db.orders.filter(
        (o) => o.optionId === op.id && o.status === "Confirmado",
      ).length;
      if (op.stock < confirmed)
        throw new Error(
          "El stock no puede ser menor que los pedidos confirmados.",
        );
    }
    const linked = db.orders.filter(
      (o) => o.date === day.date && o.status !== "Cancelado",
    );
    if (linked.length && (menu.status !== "Publicado" || day.noService))
      throw new Error(
        "Hay pedidos activos: no podés retirar su menú ni dejar ese día sin servicio.",
      );
    for (const o of linked) {
      const op = day.options.find((p) => p.id === o.optionId),
        prior = old?.options.find((p) => p.id === o.optionId);
      if (
        !op ||
        op.name !== prior?.name ||
        op.description !== prior?.description ||
        op.vegetarian !== prior?.vegetarian ||
        op.glutenFree !== prior?.glutenFree
      )
        throw new Error(
          "Un plato con pedidos activos no se puede eliminar ni cambiar. Podés agregar otra opción.",
        );
    }
  }
  db.menus = db.menus.filter((m) => m.week !== menu.week);
  db.menus.push(menu);
  saveDB(db);
}
export function setHoliday(date, reason) {
  const db = readDB();
  requireUser("admin", db);
  if (!validDate(date) || closed(date))
    throw new Error("Elegí una fecha cuyo plazo todavía esté abierto.");
  if (
    reason &&
    db.orders.some((o) => o.date === date && o.status !== "Cancelado")
  )
    throw new Error(
      "Hay pedidos activos para ese día. Deben cancelarse antes de suspender el servicio.",
    );
  if (reason) db.holidays[date] = reason;
  else delete db.holidays[date];
  saveDB(db);
}

// Días de asistencia sin reserva confirmada, incluyendo los que aún no tienen borrador.
export function pendingDays(db, userId, now = new Date()) {
  return [...new Set(Object.values(db.attendance[userId] || {}).flat())]
    .sort()
    .flatMap((date) => {
      if (closed(date, now) || db.holidays[date]) return [];
      const order = db.orders.find(
        (o) =>
          o.userId === userId && o.date === date && o.status !== "Cancelado",
      );
      if (order?.status === "Confirmado") return [];
      const menu = db.menus.find(
        (m) => m.week === monday(date) && m.status === "Publicado",
      );
      const day = menu?.days.find((d) => d.date === date);
      if (day?.noService) return [];
      return [
        {
          date,
          orderId: order?.id,
          status: order
            ? "Por confirmar"
            : day?.options.length
              ? "Falta elegir menú"
              : "Menú todavía no publicado",
        },
      ];
    });
}
