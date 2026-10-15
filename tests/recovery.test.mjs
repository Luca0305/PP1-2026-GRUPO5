import test from "node:test";
import assert from "node:assert/strict";
import {
  readDB,
  saveDB,
  register,
  login,
  user,
  SESSION_KEY,
} from "../frontend/assets/js/core.js";
import {
  requestRecovery,
  validateRecovery,
  resetPassword,
  RESET_LIFETIME,
} from "../frontend/assets/js/recovery.js";
const memory = () => {
  const data = new Map();
  return {
    getItem: (k) => data.get(k) || null,
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
};
const email = "persona@example.com",
  password = "Valida#2026",
  next = "Nueva#2027";
test.beforeEach(async () => {
  globalThis.localStorage = memory();
  globalThis.sessionStorage = memory();
  saveDB({
    version: 1,
    users: [],
    orders: [],
    menus: [],
    attendance: {},
    holidays: {},
    reports: {},
  });
  await register({
    name: "Persona",
    lastName: "Prueba",
    email,
    password,
    confirm: password,
  });
});
test("recuperación cambia contraseña, conserva datos y revoca sesiones", async () => {
  const account = await login(email, password);
  const db = readDB();
  db.orders = [{ userId: account.id, status: "Confirmado" }];
  saveDB(db);
  const mail = await requestRecovery(email);
  assert.equal(user().id, account.id);
  assert.ok(!JSON.stringify(readDB()).includes(mail.token));
  await resetPassword(mail.token, next, next);
  assert.equal(user(), null);
  sessionStorage.setItem(SESSION_KEY, account.id);
  assert.equal(user(), null);
  assert.deepEqual(readDB().orders, db.orders);
  assert.equal(readDB().users[0].role, account.role);
  await assert.rejects(login(email, password), /no coincide/);
  assert.equal((await login(email, next)).id, account.id);
  await assert.rejects(
    resetPassword(mail.token, "Tercera#2028", "Tercera#2028"),
    /enlace/,
  );
});
test("vencimiento exacto y enlaces ausentes o manipulados", async () => {
  const mail = await requestRecovery(email, 1000);
  await validateRecovery(mail.token, 1000 + RESET_LIFETIME - 1);
  await assert.rejects(
    validateRecovery(mail.token, 1000 + RESET_LIFETIME),
    /venció/,
  );
  for (const token of ["", "abc", "a".repeat(64)])
    await assert.rejects(validateRecovery(token), /enlace/);
});
test("nueva solicitud invalida enlace anterior", async () => {
  const first = await requestRecovery(email);
  const second = await requestRecovery(email);
  await assert.rejects(validateRecovery(first.token), /enlace/);
  await validateRecovery(second.token);
});
test("email inválido, inexistente, pendiente y desactivado", async () => {
  await assert.rejects(
    requestRecovery("persona@example.co"),
    (e) => e.field === "email",
  );
  assert.equal(await requestRecovery("nadie@example.com"), null);
  const db = readDB();
  db.users[0].pending = true;
  saveDB(db);
  assert.equal(await requestRecovery(email), null);
  db.users[0].pending = false;
  db.users[0].active = false;
  saveDB(db);
  assert.equal(await requestRecovery(email), null);
});
test("validación de contraseña conserva el enlace para corregir", async () => {
  const mail = await requestRecovery(email);
  await assert.rejects(
    resetPassword(mail.token, "abc", "abc"),
    (e) => e.field === "password",
  );
  await assert.rejects(
    resetPassword(mail.token, next, password),
    (e) => e.field === "confirm",
  );
  await validateRecovery(mail.token);
  await resetPassword(mail.token, next, next);
});
test("cambios de cuenta y fallos de escritura no permiten informar éxito", async () => {
  const mail = await requestRecovery(email);
  const db = readDB();
  db.users[0].active = false;
  saveDB(db);
  await assert.rejects(resetPassword(mail.token, next, next), /enlace/);
  db.users[0].active = true;
  saveDB(db);
  const original = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error("Quota");
  };
  await assert.rejects(
    resetPassword(mail.token, next, next),
    /No se pudo guardar/,
  );
  localStorage.setItem = original;
  await login(email, password);
  await validateRecovery(mail.token);
});
