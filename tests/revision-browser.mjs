// Prueba de revisión y capturas opcionales para la guía. Usa un contexto descartable.
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: "es-AR",
});
const page = await context.newPage();
await page.clock.install({ time: new Date("2026-10-15T12:00:00Z") });
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const folder = process.env.CAPTURE_GUIDE
  ? "frontend/guia/img"
  : "test-results/revision";
await mkdir(folder, { recursive: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const go = async (path) => {
  await page.goto(`${base}/${path}`);
  await page.waitForSelector("body.ready");
};
const click = (name) => page.getByRole("button", { name, exact: true }).click();
const shot = async (name) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  const focus = {
    "04-menu": "#menu-options",
    "05-borrador": "#saved-order",
    "14-limpieza": "#review-status",
  }[name];
  if (focus)
    await page
      .locator(focus)
      .evaluate((element) => element.scrollIntoView({ block: "center" }));
  await page.screenshot({ path: `${folder}/${name}.png`, fullPage: false });
};
const message = (value) =>
  page.waitForFunction(
    (value) => document.querySelector("#message")?.textContent.includes(value),
    value,
  );
async function register(name, email) {
  await go("registro.html");
  await page.locator("#nombre").fill(name);
  await page.locator("#apellido").fill("Pérez");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Valida#2026");
  await shot("02-registro");
  await click("Crear cuenta");
  await page.waitForURL("**/login.html");
}
async function login(email, admin = false) {
  await go("login.html");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Valida#2026");
  await click("Iniciar sesión");
  await page.waitForURL(admin ? "**/menuadmin.html" : "**/asistencia.html");
  await page.waitForSelector("body.ready");
}
try {
  await go("login.html");
  await shot("01-login");
  await register("Ana", "ana.demo@example.com");
  await login("ana.demo@example.com");
  await page.locator("#next-week").click();
  await page.locator('[name=days][value="2026-10-19"]').check();
  await shot("03-asistencia");
  await click("Guardar y elegir menú →");
  await page.waitForURL("**/menu-pedido.html*");
  await page.locator("[name=option]").first().check();
  await page.locator("#comment").fill("Sin sal agregada, por favor.");
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll(".meal-art img")].length === 3 &&
      [...document.querySelectorAll(".meal-art img")].every(
        (img) => img.complete && img.naturalWidth > 0,
      ),
  );
  await shot("04-menu");
  await click("Guardar borrador");
  await page.locator("#saved-summary").waitFor({ state: "visible" });
  await shot("05-borrador");
  await page.locator("#review-saved").click();
  await page.waitForURL("**/mis-pedidos.html*");
  await click("Confirmar pedido");
  await page.waitForFunction(() =>
    document.querySelector("#orders").textContent.includes("Confirmado"),
  );
  await shot("06-confirmado");
  await go("mi-perfil.html");
  await shot("07-perfil");
  await click("Cerrar sesión");
  await page.waitForURL("**/login.html");
  await go("recuperar.html");
  await page.locator("#email").fill("ana.demo@example.com");
  await click("Solicitar enlace");
  await page.locator("#demo-mail").waitFor({ state: "visible" });
  await shot("08-recuperar");
  await page.locator("#mail-link").click();
  await page.waitForSelector("body.ready");
  await page.locator("#password").fill("Nueva#2027");
  await page.locator("#confirm").fill("Nueva#2027");
  await shot("09-restablecer");
  await click("Guardar nueva contraseña");
  await page.locator("#reset-success").waitFor({ state: "visible" });
  // Registrar al administrador sin reemplazar la captura del registro del empleado.
  await go("registro.html");
  await page.locator("#nombre").fill("Administración");
  await page.locator("#apellido").fill("Pérez");
  await page.locator("#email").fill("proadmin@gmail.com");
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Valida#2026");
  await click("Crear cuenta");
  await page.waitForURL("**/login.html");
  await login("proadmin@gmail.com", true);
  await page.waitForFunction(() =>
    document
      .querySelector("#catalog-state")
      .textContent.includes("disponibles"),
  );
  await shot("10-admin");
  // Los tres estados del fetch se prueban sin modificar los archivos JSON.
  let release;
  await page.route("**/data/platos.json", async (route) => {
    await new Promise((resolve) => {
      release = resolve;
    });
    await route.fulfill({ json: [] });
  });
  await click("Actualizar catálogo");
  await page.waitForFunction(() =>
    document.querySelector("#catalog-state").textContent.includes("Cargando"),
  );
  while (!release) await new Promise((resolve) => setTimeout(resolve, 10));
  release();
  await page.waitForFunction(() =>
    document
      .querySelector("#catalog-state")
      .textContent.includes("Todavía no hay"),
  );
  assert.equal(await page.locator("#catalog-add").isDisabled(), true);
  await page.unroute("**/data/platos.json");
  await page.route("**/data/platos.json", (route) =>
    route.fulfill({ status: 404, body: "No existe" }),
  );
  await click("Actualizar catálogo");
  await page.waitForFunction(() =>
    document
      .querySelector("#catalog-state")
      .textContent.includes("No se pudo cargar"),
  );
  await page.unroute("**/data/platos.json");
  await page.route("**/data/platos.json", (route) =>
    route.fulfill({ body: "{invalido", contentType: "application/json" }),
  );
  await click("Actualizar catálogo");
  await page.waitForFunction(() =>
    document
      .querySelector("#catalog-state")
      .textContent.includes("JSON válido"),
  );
  await page.unroute("**/data/platos.json");
  await click("Actualizar catálogo");
  await page.waitForFunction(() =>
    document
      .querySelector("#catalog-state")
      .textContent.includes("disponibles"),
  );
  await page.locator("#week").fill("26/10/2026");
  await page.locator("#week").dispatchEvent("change");
  await click("Publicar menú");
  await message("borrador antes");
  await page.locator("#catalog-day").selectOption("2026-10-26");
  await page.locator("[name=catalog-plate]").nth(0).check();
  await page.locator("[name=catalog-plate]").nth(1).check();
  await click("Agregar selección al día");
  assert.equal(
    await page.locator(".admin-day").first().locator(".option-editor").count(),
    2,
  );
  await click("Agregar selección al día");
  assert.equal(
    await page.locator(".admin-day").first().locator(".option-editor").count(),
    2,
  );
  await click("Guardar borrador");
  await message("Borrador guardado");
  await go("calendario-feriados.html");
  await page.locator("#date").fill("23/10/2026");
  await page.locator("#reason").fill("Jornada de mantenimiento");
  await click("Guardar día sin servicio");
  await page
    .locator("dialog")
    .getByRole("button", { name: "Guardar", exact: true })
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector("#holidays")
      .textContent.includes("Jornada de mantenimiento"),
  );
  await shot("11-feriados");
  await page.locator("#reason").fill("Duplicado");
  await click("Guardar día sin servicio");
  await message("Ya existe");
  await go("usuarios.html");
  await shot("12-usuarios");
  await go("consolidado.html");
  await page.locator("#report-date").fill("19/10/2026");
  await page.locator("#report-date").dispatchEvent("change");
  await click("Generar consolidado");
  await page.waitForFunction(() =>
    document.querySelector("#total").textContent.includes("1"),
  );
  await shot("13-consolidado");
  await go("index.html");
  await page.evaluate(() => localStorage.setItem("otra-app", "conservar"));
  await click("Restablecer datos de prueba");
  await click("Cancelar");
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("sistemaPedidos:v1")).users.length,
    ),
    2,
  );
  await click("Restablecer datos de prueba");
  await click("Sí, eliminar pruebas");
  await page.waitForFunction(() =>
    document
      .querySelector("#review-status")
      .textContent.includes("Pruebas eliminadas"),
  );
  const clean = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("sistemaPedidos:v1")),
  );
  assert.equal(clean.users.length, 0);
  assert.equal(clean.orders.length, 0);
  for (const key of ["attendance", "holidays", "reports"])
    assert.equal(Object.keys(clean[key]).length, 0);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("otra-app")),
    "conservar",
  );
  assert.equal(await page.evaluate(() => sessionStorage.length), 0);
  await shot("14-limpieza");
  await go("mi-perfil.html");
  assert.ok(page.url().endsWith("login.html"));
  assert.deepEqual(errors, []);
  console.log(
    "OK: recorrido con capturas, catálogo cargando/vacío/error/recuperado, selección múltiple, borrador previo, feriado duplicado y limpieza completa sin borrar otras aplicaciones.",
  );
} finally {
  await browser.close();
}
