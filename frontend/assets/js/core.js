import { api } from "./api.js";
import {
  FieldError,
  emailError,
  passwordError,
  nameError,
} from "./validation.js";
// Reglas compartidas por las pantallas (fechas, hora de corte, sesión y M1).
// Desde la 4ta entrega los datos viven en MySQL: todo se lee y guarda con api.js.
export const SESSION_KEY = "sistemaPedidos:sesion";
export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
// Categorías del catálogo de platos, en el orden en que se muestran.
export const CATEGORIES = {
  "clásico": "Clásicos",
  carnes: "Carnes",
  pastas: "Pastas",
  minutas: "Minutas",
  vegetariano: "Vegetarianos",
  vegano: "Veganos",
  liviano: "Livianos",
  ensaladas: "Ensaladas",
  "sin TACC": "Sin TACC",
  otros: "Otros",
};
export const categoryLabel = (key) => CATEGORIES[key] || CATEGORIES.otros;
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
// Hora de corte: la define el backend (pedidos.hora-corte, GET /api/configuracion).
// app.js la carga al abrir cada pantalla; si el servidor no responde, queda 10:00.
let horaCorte = { hora: 10, minuto: 0 };
export function configurarHoraCorte(texto) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(texto || "").trim());
  if (m) horaCorte = { hora: Number(m[1]), minuto: Number(m[2]) };
}
export const horaCorteTexto = () =>
  `${String(horaCorte.hora).padStart(2, "0")}:${String(horaCorte.minuto).padStart(2, "0")}`;
export function closed(iso, now = new Date()) {
  const c = clock(now);
  const pasoElCorte =
    c.hour > horaCorte.hora || (c.hour === horaCorte.hora && c.minute >= horaCorte.minuto);
  return iso < c.today || (iso === c.today && pasoElCorte);
}
export const DATE_FORMAT = "DD/MM/AAAA";
export function formatDate(iso) {
  if (!validDate(iso)) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
export function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return "";
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  return validDate(iso) ? iso : "";
}
export const dateLabel = (iso) =>
  `${new Intl.DateTimeFormat("es-AR", { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`))} ${formatDate(iso)}`;
export function checkIdentity(name, email, password) {
  if (nameError(name)) throw new FieldError("name", nameError(name));
  if (emailError(email)) throw new FieldError("email", emailError(email));
  if (password !== undefined && passwordError(password))
    throw new FieldError("password", passwordError(password));
}
// ── Sesión (M1) ──
// Desde la 4ta entrega la sesión es el usuario que devuelve POST /api/auth/login
// (tabla usuario de MySQL), guardado en sessionStorage. Se adapta a los nombres que
// ya usaban las pantallas (name, role) para no reescribir el menú ni la cabecera.
export function guardarSesion(usuario) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}
export function cerrarSesion() {
  sessionStorage.removeItem(SESSION_KEY);
}
export function user(_db) {
  let u;
  try {
    u = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
  if (!u || typeof u.id !== "number" || !u.activo) return null;
  return {
    ...u,
    name: `${u.nombre} ${u.apellido}`,
    firstName: u.nombre,
    lastName: u.apellido,
    email: u.correo,
    role: u.rol === "ADMINISTRADOR" ? "admin" : "empleado",
    active: u.activo,
  };
}
export function home(u) {
  return u.role === "admin" ? "consolidado.html" : "asistencia.html";
}

// M1 · Registro contra el backend. Las validaciones de formato se hacen primero acá
// (mensajes al lado del campo) y el backend las repite con Bean Validation.
export async function register({ name, lastName, email, password, confirm }) {
  checkIdentity(name, email, password);
  if (nameError(lastName))
    throw new FieldError("apellido", "Apellido: " + nameError(lastName));
  if (password !== confirm)
    throw new FieldError(
      "confirm",
      "Las contraseñas no coinciden. Repetí exactamente la misma contraseña.",
    );
  try {
    return await api.registrar({
      nombre: name.trim(),
      apellido: lastName.trim(),
      correo: email.trim().toLowerCase(),
      contrasena: password,
    });
  } catch (e) {
    if (/correo/i.test(e.message)) throw new FieldError("email", e.message);
    throw e;
  }
}
// M1 · Login contra el backend. Acá no se exige la política de contraseñas del
// registro: las cuentas del script (por ejemplo laura.gimenez@empresa.com.ar /
// cambiar123) son anteriores a esa política y tienen que poder entrar.
export async function login(email, password) {
  if (!email || !email.trim())
    throw new FieldError("email", "Ingresá tu email.");
  if (!password) throw new FieldError("password", "Ingresá tu contraseña.");
  const usuario = await api.ingresar(email.trim(), password);
  guardarSesion(usuario);
  return user();
}
