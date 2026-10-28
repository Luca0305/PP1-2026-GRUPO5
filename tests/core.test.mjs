import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import * as core from "../frontend/assets/js/core.js";
import {
  saveAccount,
  toggleAccount,
  saveProfile,
} from "../frontend/assets/js/accounts.js";
import { reportRows, csvCell } from "../frontend/assets/js/consolidado.js";
function memory() {
  const m = new Map();
  return {
    getItem: (k) => m.get(k) || null,
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
}
globalThis.localStorage = memory();
globalThis.sessionStorage = memory();
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const week = core.addDays(core.monday(), 14),
  date = week;
function reset() {
  localStorage.clear();
  sessionStorage.clear();
  core.saveDB({
    version: 1,
    users: [
      {
        id: "admin",
        name: "Admin",
        email: "admin@example.com",
        role: "admin",
        active: true,
      },
      {
        id: "emp",
        name: "Empleado",
        email: "emp@example.com",
        role: "empleado",
        active: true,
      },
    ],
    orders: [],
    attendance: { emp: { [week]: [date] } },
    holidays: {},
    reports: {},
    menus: [
      {
        week,
        status: "Publicado",
        days: core.DAYS.map((_, i) => ({
          date: core.addDays(week, i),
          noService: false,
          options: [
            {
              id: "p" + i,
              name: "Plato " + i,
              description: "Descripción",
              stock: 1,
              vegetarian: false,
              glutenFree: false,
            },
          ],
        })),
      },
    ],
  });
  sessionStorage.setItem(core.SESSION_KEY, "emp");
}
test.beforeEach(reset);
test("emails estrictos y direcciones legítimas", () => {
  for (const email of [
    "a+b@example.com",
    "nombre.apellido@sub.empresa.com",
    "usuario@empresa.com",
  ])
    assert.equal(core.emailValid(email), true, email);
  for (const email of [
    "a..b@empresa.com",
    ".a@empresa.com",
    "a.@empresa.com",
    "a@-empresa.com",
    "a@empresa-.com",
    "a@empresa..com",
    "a@empresa.c",
    "a@empresa.co",
    "a@empresa.com.ar",
    "a@empresa.travel",
    "a@empresa.123",
    "a b@empresa.com",
    " a@empresa.com",
    "a@empresa.com ",
    "a@b@c.com",
    "a@empresa",
    "a@empresa_com.ar",
  ])
    assert.equal(core.emailValid(email), false, email);
});
test("contraseña: límite, composición y espacios", () => {
  assert.equal(core.passwordValid("Valida#2026"), true);
  for (const p of [
    "Abc1!",
    "abcdefgh1!",
    "ABCDEFGH1!",
    "Abcdefgh!!",
    "Abcdefgh12",
    "Abcdef 1!",
    "Abcdef1!\n",
    "Abcdef1ñ",
    "A".repeat(65) + "a1!",
  ])
    assert.equal(core.passwordValid(p), false, p);
});
test("corte exacto a las 10:00 Argentina y fecha anterior", () => {
  assert.equal(
    core.closed("2026-10-15", new Date("2026-10-15T12:59:59Z")),
    false,
  );
  assert.equal(
    core.closed("2026-10-15", new Date("2026-10-15T13:00:00Z")),
    true,
  );
  assert.equal(
    core.closed("2026-10-14", new Date("2026-10-15T12:00:00Z")),
    true,
  );
  assert.equal(
    core.closed("2026-10-16", new Date("2026-10-15T14:00:00Z")),
    false,
  );
});
test("fechas reales y semana en cambio de año", () => {
  assert.equal(core.validDate("2026-02-30"), false);
  assert.equal(core.validDate("2028-02-29"), true);
  assert.equal(core.monday("2027-01-01"), "2026-12-28");
});
test("sin cuentas sembradas al inicializar y fechas estables", async () => {
  localStorage.clear();
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () =>
      url.includes("empresa.json")
        ? { administradoresAutorizados: ["proadmin@gmail.com"] }
        : url.includes("platos.json") && !url.includes("menu-platos.json")
          ? [{ id: "p1", nombre: "Plato", descripcion: "Vegetal" }]
          : url.includes("menus.json")
            ? [0, 7].map((offset) => ({
                id: "m" + offset,
                fecha: core.addDays(core.monday(), offset),
                publicado: true,
              }))
            : [],
  });
  try {
    const db = await core.initDB();
    assert.equal(db.users.length, 0);
    const second = await core.initDB();
    assert.deepEqual(db, second);
    assert.equal(db.menus.length, 2);
  } finally {
    globalThis.fetch = original;
  }
});
test("registro, hash, duplicados, login y rol incorrecto", async () => {
  const data = {
    name: "Nueva Persona",
    lastName: "Prueba",
    email: "nueva@example.com",
    password: "Valida#2026",
    confirm: "Valida#2026",
  };
  await core.register(data);
  const u = core.readDB().users.find((u) => u.email === data.email);
  assert.equal("password" in u, false);
  assert.ok(u.auth.hash);
  assert.equal(u.role, "empleado");
  await assert.rejects(
    core.register({ ...data, email: "NUEVA@example.com" }),
    /ya está registrado/,
  );
  await assert.rejects(
    core.login(data.email, "Distinta#2026", "empleado"),
    /no coincide/,
  );
  assert.equal((await core.login(data.email, data.password)).role, "empleado");
  assert.equal(
    (await core.login(data.email, data.password, "empleado")).id,
    u.id,
  );
});
test("asignación empresarial y ningún rol elegido desde registro", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ administradoresAutorizados: ["proadmin@gmail.com"] }),
  });
  try {
    await core.loadCompany();
  } finally {
    globalThis.fetch = original;
  }
  const data = {
    name: "Mi Admin",
    lastName: "Prueba",
    email: "proadmin@gmail.com",
    password: "Valida#2026",
    confirm: "Valida#2026",
  };
  await core.register(data);
  assert.equal((await core.login(data.email, data.password)).role, "admin");
  await core.register({ ...data, email: "otro@example.com", admin: true });
  assert.equal(
    (await core.login("otro@example.com", data.password)).role,
    "empleado",
  );
});
test("administrador autoriza email, persona elige su contraseña", async () => {
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  await saveAccount({
    name: "Otra Admin",
    lastName: "Prueba",
    email: "otra@example.com",
    role: "admin",
    password: "",
  });
  let u = core.readDB().users.find((u) => u.email === "otra@example.com");
  assert.equal(u.pending, true);
  assert.equal(u.auth, null);
  await assert.rejects(core.login(u.email, "Valida#2026"), /registro/);
  await core.register({
    name: "Otra Admin",
    lastName: "Prueba",
    email: u.email,
    password: "Valida#2026",
    confirm: "Valida#2026",
  });
  assert.equal((await core.login(u.email, "Valida#2026")).role, "admin");
});
test("fechas visibles y conversión estricta", () => {
  assert.equal(core.formatDate("2026-10-15"), "15/10/2026");
  assert.equal(core.parseDate("15/10/2026"), "2026-10-15");
  assert.equal(core.parseDate("31/02/2026"), "");
  assert.equal(core.parseDate("1/2/2026"), "");
  assert.equal(core.parseDate("10/15/2026"), "");
  // Una preferencia antigua no cambia la presentación fija del sistema.
  assert.equal(core.formatDate("2026-10-15", "AAAA-MM-DD"), "15/10/2026");
});
test("avisos incluyen todos los días pendientes aunque uno ya esté confirmado", () => {
  const db = core.readDB();
  db.attendance.emp[week] = [
    date,
    core.addDays(date, 1),
    core.addDays(date, 2),
  ];
  core.saveDB(db);
  const o = core.saveOrder({ date, optionId: "p0", comment: "" });
  core.changeOrder(o.id, "confirm");
  core.saveOrder({ date: core.addDays(date, 1), optionId: "p1", comment: "" });
  const pending = core.pendingDays(core.readDB(), "emp");
  assert.equal(pending.length, 2);
  assert.deepEqual(
    pending.map((p) => p.status),
    ["Por confirmar", "Falta elegir menú"],
  );
});
test("pedido borrador, confirmación, duplicado y stock", () => {
  const o = core.saveOrder({ date, optionId: "p0", comment: "Sin sal" });
  assert.equal(o.status, "Borrador");
  // Un pedido guardado, aun en borrador, ya reserva una porción.
  assert.equal(core.available(core.readDB(), "p0"), 0);
  assert.throws(
    () => core.saveOrder({ date, optionId: "p0", comment: "" }),
    /Ya tenés/,
  );
  core.changeOrder(o.id, "confirm");
  assert.equal(core.available(core.readDB(), "p0"), 0);
  const edited = core.saveOrder(
    { date, optionId: "p0", comment: "Sin sal" },
    o.id,
  );
  assert.equal(edited.status, "Confirmado");
  const changed = core.saveOrder(
    { date, optionId: "p0", comment: "Sin azúcar" },
    o.id,
  );
  assert.equal(changed.status, "Borrador");
  core.changeOrder(o.id, "confirm");
  core.changeOrder(o.id, "cancel");
  assert.equal(core.available(core.readDB(), "p0"), 1);
});
test("confirmar revalida feriado, asistencia, menú y stock", () => {
  const o = core.saveOrder({ date, optionId: "p0", comment: "" }),
    original = core.readDB();
  for (const [change, pattern] of [
    [(db) => (db.holidays[date] = "Cierre"), /feriado/],
    [(db) => (db.attendance.emp[week] = []), /asistencia/],
    [(db) => (db.menus[0].status = "Borrador"), /publicada/],
    [(db) => (db.menus[0].days[0].options[0].stock = 0), /stock/],
  ]) {
    const db = structuredClone(original);
    change(db);
    core.saveDB(db);
    assert.throws(() => core.changeOrder(o.id, "confirm"), pattern);
  }
});
test("pedido ajeno y acceso administrativo bloqueados", () => {
  const o = core.saveOrder({ date, optionId: "p0", comment: "" });
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  assert.throws(() => core.changeOrder(o.id, "cancel"), /acceso/);
  sessionStorage.setItem(core.SESSION_KEY, "emp");
  assert.throws(() => core.setHoliday(date, "Cierre"), /acceso/);
});
test("asistencia no se puede quitar con pedidos activos", () => {
  core.saveOrder({ date, optionId: "p0", comment: "" });
  assert.throws(
    () => core.setAttendance(week, [core.addDays(date, 1)]),
    /cancelá/,
  );
});
test("comentario largo se rechaza y licencias antiguas no bloquean pedidos", () => {
  assert.throws(
    () => core.saveOrder({ date, optionId: "p0", comment: "a".repeat(201) }),
    /200/,
  );
  const db = core.readDB();
  Object.assign(db.users[1], { leaveStart: date, leaveEnd: date });
  core.saveDB(db);
  assert.doesNotThrow(() =>
    core.saveOrder({ date, optionId: "p0", comment: "" }),
  );
  assert.equal(
    core.pendingDays(core.readDB(), "emp").some((day) => day.date === date),
    true,
  );
});
test("publicación requiere opciones o sin servicio en todos los días", () => {
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  const menu = core.readDB().menus[0];
  menu.days[2].options = [];
  assert.throws(() => core.saveMenu(menu), /Sin servicio/);
  menu.days[2].noService = true;
  core.saveMenu(menu);
});
test("menú en borrador realmente deja de estar visible", () => {
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  const menu = core.readDB().menus[0];
  menu.status = "Borrador";
  core.saveMenu(menu);
  sessionStorage.setItem(core.SESSION_KEY, "emp");
  assert.throws(
    () => core.saveOrder({ date, optionId: "p0", comment: "" }),
    /publicada/,
  );
});
test("no retirar, eliminar ni mutar platos con pedidos activos", () => {
  core.saveOrder({ date, optionId: "p0", comment: "" });
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  const menu = core.readDB().menus[0];
  assert.throws(
    () => core.saveMenu({ ...menu, status: "Borrador" }),
    /pedidos activos/,
  );
  menu.days[0].options[0].name = "Otro plato";
  assert.throws(() => core.saveMenu(menu), /no se puede eliminar ni cambiar/);
  assert.throws(() => core.setHoliday(date, "Cierre"), /pedidos activos/);
});
test("stock no puede bajar por debajo de las reservas", () => {
  const o = core.saveOrder({ date, optionId: "p0", comment: "" });
  core.changeOrder(o.id, "confirm");
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  const menu = core.readDB().menus[0];
  menu.days[0].options[0].stock = 0;
  assert.throws(() => core.saveMenu(menu), /menor/);
});
test("consolidado solo incluye confirmados y CSV neutraliza fórmulas", () => {
  const o = core.saveOrder({ date, optionId: "p0", comment: "Sin sal" });
  assert.equal(reportRows(core.readDB(), date).length, 0);
  core.changeOrder(o.id, "confirm");
  assert.equal(reportRows(core.readDB(), date)[0].count, 1);
  core.changeOrder(o.id, "cancel");
  assert.equal(reportRows(core.readDB(), date).length, 0);
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell('a"b'), '"a""b"');
});
test("usuarios: alta validada, baja lógica y protección propia", async () => {
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  await saveAccount({
    name: "Equipo Nuevo",
    lastName: "Prueba",
    email: "equipo@example.com",
    role: "empleado",
    password: "Valida#2026",
  });
  const u = core.readDB().users.find((u) => u.email === "equipo@example.com");
  toggleAccount(u.id);
  await assert.rejects(
    core.login(u.email, "Valida#2026", "empleado"),
    /no está registrada o activada/,
  );
  assert.throws(() => toggleAccount("admin"), /propia/);
});
test("perfil conserva referencias al cambiar email y valida contraseña actual", async () => {
  const db = core.readDB();
  db.users[1].auth = await core.credential("Valida#2026");
  core.saveDB(db);
  const o = core.saveOrder({ date, optionId: "p0", comment: "" });
  await saveProfile({
    name: "Nombre Nuevo",
    lastName: "Prueba",
    email: "nuevo@example.com",
    current: "",
    password: "",
    confirm: "",
  });
  assert.equal(core.user().email, "nuevo@example.com");
  assert.equal(core.readDB().orders[0].userId, o.userId);
  await assert.rejects(
    saveProfile({
      name: "Nombre Nuevo",
      lastName: "Prueba",
      email: "nuevo@example.com",
      current: "Mala#2026",
      password: "Otra#2026",
      confirm: "Otra#2026",
    }),
    /actual/,
  );
});
test("fallo de almacenamiento no informa éxito", () => {
  const original = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error("Quota");
  };
  try {
    assert.throws(
      () => core.saveOrder({ date, optionId: "p0", comment: "" }),
      /No se pudo guardar/,
    );
  } finally {
    localStorage.setItem = original;
  }
});
test("stock compartido: el pedido guardado de uno descuenta para el resto", () => {
  const db = core.readDB();
  db.users.push({
    id: "emp2",
    name: "Otra Persona",
    email: "emp2@example.com",
    role: "empleado",
    active: true,
  });
  db.attendance.emp2 = { [week]: [date] };
  core.saveDB(db);
  core.saveOrder({ date, optionId: "p0", comment: "" });
  sessionStorage.setItem(core.SESSION_KEY, "emp2");
  assert.equal(core.available(core.readDB(), "p0"), 0);
  assert.throws(
    () => core.saveOrder({ date, optionId: "p0", comment: "" }),
    /no tiene stock/,
  );
  // Al cancelarse el pedido de la primera persona, la porción se libera.
  sessionStorage.setItem(core.SESSION_KEY, "emp");
  const first = core.readDB().orders[0];
  core.changeOrder(first.id, "cancel");
  assert.equal(core.available(core.readDB(), "p0"), 1);
});
test("excepciones de horario: solo el administrador las habilita y levantan el corte", () => {
  const late = new Date("2026-10-15T12:00:00Z"),
    day = "2026-10-14";
  assert.equal(core.closedFor(core.readDB(), "emp", day, late), true);
  assert.throws(() => core.grantException("emp", date), /sesión/);
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  assert.throws(() => core.grantException("admin", date), /empleado activo/);
  assert.throws(() => core.grantException("emp", "2020-01-01"), /hábil|hoy/);
  core.grantException("emp", date);
  assert.equal(core.hasException(core.readDB(), "emp", date), true);
  const db = core.readDB();
  db.exceptions.emp[day] = "2026-10-14T12:00:00Z";
  assert.equal(core.closedFor(db, "emp", day, late), false);
  assert.equal(core.closedFor(db, "emp", core.addDays(day, 1), new Date("2026-10-16T12:00:00Z")), true);
  core.revokeException("emp", date);
  assert.equal(core.hasException(core.readDB(), "emp", date), false);
});
test("consolidado por semana agrupa por día y plato", () => {
  const second = core.addDays(date, 1);
  const db = core.readDB();
  db.attendance.emp[week] = [date, second];
  core.saveDB(db);
  const a = core.saveOrder({ date, optionId: "p0", comment: "" });
  const b = core.saveOrder({ date: second, optionId: "p1", comment: "Sin sal" });
  core.changeOrder(a.id, "confirm");
  core.changeOrder(b.id, "confirm");
  const days = [0, 1, 2, 3, 4].map((i) => core.addDays(week, i));
  const rows = reportRows(core.readDB(), days);
  assert.deepEqual(
    rows.map((r) => [r.date, r.plate, r.count]),
    [
      [date, "Plato 0", 1],
      [second, "Plato 1", 1],
    ],
  );
  assert.equal(reportRows(core.readDB(), second).length, 1);
});
test("publicar una semana que ya empezó no exige completar los días cerrados", () => {
  sessionStorage.setItem(core.SESSION_KEY, "admin");
  // Semana pasada: todos sus días están cerrados y sin opciones, y aun así se puede publicar.
  const past = core.addDays(core.monday(), -14);
  const menu = {
    week: past,
    status: "Publicado",
    days: core.DAYS.map((_, i) => ({
      date: core.addDays(past, i),
      noService: false,
      options: [],
    })),
  };
  core.saveMenu(menu);
  assert.equal(core.readDB().menus.some((m) => m.week === past), true);
  // Pero un día cerrado no se puede modificar agregándole opciones.
  menu.days[0].options.push({
    id: "x",
    name: "Plato",
    description: "",
    stock: 5,
    vegetarian: false,
    glutenFree: false,
  });
  assert.throws(() => core.saveMenu(menu), /horario de corte/);
});
