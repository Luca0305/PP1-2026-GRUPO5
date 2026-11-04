// Dos personas con sesión propia (una pestaña cada una) sobre el mismo navegador:
// el stock se descuenta en tiempo real y el administrador puede habilitar excepciones de horario.
// Ejecutar con el servidor local iniciado (npm start).
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: "es-AR",
  timezoneId: "America/Argentina/Buenos_Aires",
});
await context.clock.install({ time: new Date("2026-10-14T12:00:00Z") });
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const errors = [];
const tab = async () => {
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  return page;
};
const go = async (page, path) => {
  await page.goto(base + "/" + path);
  await page.waitForSelector("body.ready");
};
const press = (page, name) => page.getByRole("button", { name, exact: true });
async function register(page, name, email, admin = false) {
  await go(page, "registro.html" + (admin ? "?modo=admin" : ""));
  await page.locator("#nombre").fill(name);
  await page.locator("#apellido").fill("Prueba");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Valida#2026");
  await press(page, "Crear cuenta").click();
  await page.waitForURL("**/login.html*");
}
async function login(page, email, admin = false) {
  await go(page, "login.html");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Valida#2026");
  await press(page, "Iniciar sesión").click();
  await page.waitForURL(admin ? "**/menuadmin.html*" : "**/asistencia.html*");
  await page.waitForSelector("body.ready");
}
const stock = (page) => page.locator(".stock").first().innerText();
try {
  const a = await tab(), b = await tab(), admin = await tab();
  await register(a, "Persona Uno", "uno@example.com");
  await register(b, "Persona Dos", "dos@example.com");
  await register(admin, "Admin Propio", "proadmin@gmail.com", true);
  await login(admin, "proadmin@gmail.com", true);
  for (const [page, email] of [[a, "uno@example.com"], [b, "dos@example.com"]]) {
    await login(page, email);
    await page.locator('[name=days][value="2026-10-15"]').check();
    await press(page, "Guardar y elegir menú →").click();
    await page.waitForURL("**/menu-pedido.html*");
    await page.waitForSelector("body.ready");
    await go(page, "menu-pedido.html?semana=2026-10-12&fecha=2026-10-15");
  }
  // Las opciones se agrupan en categorías desplegables.
  assert.ok((await a.locator("details.menu-group").count()) >= 3);
  assert.equal(await a.locator("details.menu-group[open]").count(), 1);
  await a.locator("details.menu-group").nth(1).locator("summary").click();
  assert.equal(await a.locator("details.menu-group[open]").count(), 2);
  assert.match(await stock(b), /^80 porciones/);
  // La primera persona confirma sin salir de la pantalla del menú.
  await a.locator("[name=option]").first().check();
  await a.locator("#comment").fill("Sin sal");
  await press(a, "Confirmar pedido").click();
  await a.locator("#saved-title").getByText("Pedido confirmado").waitFor();
  // La segunda ve el descuento sin recargar.
  await b.waitForFunction(() =>
    document.querySelector(".stock")?.textContent.startsWith("79 porciones"),
  );
  // Pasadas las 10:00 el empleado no puede pedir, salvo excepción del administrador.
  await context.clock.setSystemTime(new Date("2026-10-15T13:30:00Z"));
  await go(b, "menu-pedido.html?semana=2026-10-12&fecha=2026-10-15");
  await b.getByText("El plazo de este día terminó").waitFor();
  await go(admin, "usuarios.html");
  await admin.getByText("Excepciones de horario").first().click();
  await admin.locator("#exception-user").selectOption({ label: "Persona Dos Prueba" });
  await admin.locator("#exception-date").selectOption("2026-10-15");
  await press(admin, "Habilitar excepción").click();
  await admin.locator("#exception-body").getByText("Persona Dos Prueba").waitFor();
  await go(b, "menu-pedido.html?semana=2026-10-12&fecha=2026-10-15");
  await b.locator("[name=option]").first().check();
  await press(b, "Confirmar pedido").click();
  await b.locator("#saved-title").getByText("Pedido confirmado").waitFor();
  // La primera persona, sin excepción, sigue bloqueada.
  await go(a, "mis-pedidos.html");
  assert.equal(await a.getByRole("button", { name: "Cancelar pedido" }).count(), 0);
  // Mitad de semana: los días que ya pasaron no se completan ni bloquean la publicación.
  await context.clock.setSystemTime(new Date("2026-12-02T15:00:00Z"));
  await go(admin, "menuadmin.html");
  await admin.locator("#month").selectOption("2026-12");
  await admin.locator("#week").selectOption("2026-11-30");
  for (const day of ["2026-12-03", "2026-12-04"]) {
    await admin.locator("#catalog-day").selectOption(day);
    await admin.locator("[name=catalog-plate]").first().check();
    await press(admin, "Agregar selección al día").click();
  }
  assert.equal(await admin.locator("#catalog-day option").count(), 3);
  await press(admin, "Guardar borrador").click();
  await admin.getByText("Borrador guardado").waitFor();
  await press(admin, "Publicar menú").click();
  await admin.locator("dialog").getByRole("button", { name: "Publicar", exact: true }).click();
  await admin.getByText("Menú publicado").waitFor();
  assert.deepEqual(errors, []);
  console.log("OK: categorías desplegables, stock en tiempo real entre dos personas, confirmación en una pantalla y excepción de horario. Sin errores JS.");
} finally {
  await browser.close();
}
