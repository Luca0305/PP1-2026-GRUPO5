// Recorrido real de UI. Ejecutar con el servidor local iniciado.
// PLAYWRIGHT_MODULE permite usar una instalación existente sin agregar dependencias al frontend.
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
  viewport: { width: 1440, height: 1050 },
  locale: "es-AR",
  timezoneId: "America/Argentina/Buenos_Aires",
});
const page = await context.newPage();
await page.clock.install({ time: new Date("2026-10-13T12:00:00Z") });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
await mkdir("test-results", { recursive: true });
const go = async (path) => {
  await page.goto(base + "/" + path);
  await page.waitForSelector("body.ready");
};
const button = (name) => page.getByRole("button", { name, exact: true });
const text = async (selector, part) => {
  await page.waitForFunction(
    ({ selector, part }) =>
      document.querySelector(selector)?.textContent.includes(part),
    { selector, part },
  );
  assert.ok(
    (await page.locator(selector).innerText()).includes(part),
    `${selector} debe contener ${part}`,
  );
};
async function waitPage(name) {
  await page.waitForURL("**/" + name + "*");
  await page.waitForSelector("body.ready");
}
async function register(name, email, admin = false) {
  await go("registro.html" + (admin ? "?modo=admin" : ""));
  await page.locator("#nombre").fill(name);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Valida#2026");
  await button("Crear cuenta").click();
  await waitPage("login.html");
}
async function login(email, role = "empleado") {
  await go("login.html");

  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Valida#2026");
  await button("Iniciar sesión").click();
  await waitPage(role === "admin" ? "menuadmin.html" : "asistencia.html");
}
async function dialog(label) {
  await page.locator("dialog").waitFor();
  await page
    .locator("dialog")
    .getByRole("button", { name: label, exact: true })
    .click();
  await page.locator("dialog").waitFor({ state: "detached" });
}
async function widthCheck(label) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Sin desborde en ${label}`,
  );
}
try {
  await go("");
  assert.ok(page.url().endsWith("login.html"));
  await page.setViewportSize({ width: 1366, height: 768 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
    "Login sin desplazamiento vertical a 1366×768",
  );
  assert.equal(await page.locator("[data-access-role]").count(), 0);
  await page.screenshot({
    path: "test-results/login-desktop.png",
    fullPage: true,
  });
  await go("menuadmin.html");
  assert.ok(page.url().endsWith("login.html"));
  await go("registro.html");
  await page.locator("#nombre").fill("Persona Prueba");
  await page.locator("#email").fill("a..b@empresa.com");
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Valida#2026");
  await button("Crear cuenta").click();
  await text("#message", "puntos consecutivos");
  assert.equal(
    await page.locator("#email").getAttribute("aria-invalid"),
    "true",
  );
  await page.locator("#email").fill("persona@example.co");
  await button("Crear cuenta").click();
  await text("#email-error", ".com");
  await page.locator("#email").fill("persona@example.com");
  await page.locator("#password").fill("Invalida 1!");
  await page.locator("#confirm").fill("Invalida 1!");
  await button("Crear cuenta").click();
  await text("#message", "sin espacios");
  assert.equal(
    await page.locator("#password").getAttribute("aria-invalid"),
    "true",
  );
  assert.ok((await page.locator("#password-rules .complete").count()) < 7);
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Distinta#2026");
  await button("Crear cuenta").click();
  await text("#message", "no coinciden");
  assert.equal(await page.locator("#password-rules .complete").count(), 7);
  assert.equal(
    await page.locator("#confirm").getAttribute("aria-invalid"),
    "true",
  );
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .click();
  assert.equal(await page.locator("#password").getAttribute("type"), "text");
  await page
    .getByRole("button", { name: "Ocultar contraseña", exact: true })
    .click();
  await register("Persona Prueba", "persona@example.com", true);
  await login("persona@example.com");
  await go("usuarios.html");
  await waitPage("asistencia.html");
  assert.equal(await page.locator("#week").inputValue(), "12/10/2026");
  await page.locator("#week").fill("31/02/2026");
  await page.locator("#week").dispatchEvent("change");
  await text("#week-error", "fecha real");
  await page.locator("#week").fill("12/10/2026");
  await page.locator("#week").dispatchEvent("change");
  await page.locator('[name=days][value="2026-10-16"]').check();
  await page.locator('[name=days][value="2026-10-14"]').check();
  await page.locator('[name=days][value="2026-10-15"]').check();
  await button("Guardar y elegir menú →").click();
  await waitPage("menu-pedido.html");
  await page.locator("[name=option]").first().check();
  await page.locator("#comment").fill("Sin sal <b>sin HTML</b>");
  await page.screenshot({
    path: "test-results/menu-desktop.png",
    fullPage: true,
  });
  await button("Guardar borrador").click();
  await text("#saved-summary", "Borrador");
  assert.ok(page.url().includes("menu-pedido.html"));
  await page.locator("#review-saved").click();
  await waitPage("mis-pedidos.html");
  await text("#orders", "Borrador");
  await text("#pending-orders", "3 días");
  await text("#pending-orders", "Por confirmar");
  assert.equal(await page.locator("#orders b").count(), 0);
  await button("Confirmar pedido").click();
  await text("#orders", "Confirmado");
  await text("#pending-orders", "2 días");
  assert.equal(await page.locator("#pending-orders li").count(), 2);
  await page.locator("#pending-orders a").first().click();
  await waitPage("menu-pedido.html");
  assert.equal(
    await page.locator('[data-date="2026-10-15"]').getAttribute("aria-pressed"),
    "true",
  );
  await go("mis-pedidos.html");
  await page.reload();
  await page.waitForSelector("body.ready");
  await text("#orders", "Confirmado");
  await page.getByRole("link", { name: "Modificar", exact: true }).click();
  await waitPage("menu-pedido.html");
  await page.locator("[name=option]").nth(1).check();
  await button("Guardar cambios").click();
  await text("#saved-summary", "Borrador");
  await page.locator("#review-saved").click();
  await waitPage("mis-pedidos.html");
  await text("#orders", "Borrador");
  await button("Confirmar pedido").click();
  await text("#orders", "Confirmado");
  await button("Cancelar pedido").click();
  await dialog("Volver");
  await text("#orders", "Confirmado");
  await button("Cancelar pedido").click();
  await dialog("Sí, cancelar");
  await text("#orders", "Cancelado");
  await go("menu-pedido.html");
  await page.locator('[data-date="2026-10-15"]').click();
  await page.locator("[name=option]").first().check();
  await button("Guardar borrador").click();
  await text("#saved-summary", "Borrador");
  assert.ok(page.url().includes("menu-pedido.html"));
  await page.locator("#review-saved").click();
  await waitPage("mis-pedidos.html");
  await button("Confirmar pedido").click();
  await go("mi-perfil.html");
  await page.locator("#name").fill("Persona Actualizada");
  await page.locator("#email").fill("actualizada@example.com");
  await page.locator("#date-format").selectOption("MM/DD/AAAA");
  await button("Guardar cambios").click();
  await dialog("Guardar");
  await text("#message", "Perfil actualizado");
  await go("asistencia.html");
  assert.equal(await page.locator("#week").inputValue(), "10/12/2026");
  await page.reload();
  await page.waitForSelector("body.ready");
  assert.equal(await page.locator("#week").inputValue(), "10/12/2026");
  await page.getByRole("link", { name: /Persona Actualizada/ }).click();
  await waitPage("mi-perfil.html");
  await page.locator("#date-format").selectOption("DD/MM/AAAA");
  await button("Guardar cambios").click();
  await dialog("Guardar");
  await text("#message", "Perfil actualizado");
  await go("mis-pedidos.html");
  await text("#orders", "Confirmado");
  for (const path of [
    "asistencia.html",
    "menu-pedido.html",
    "mis-pedidos.html",
    "mi-perfil.html",
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await go(path);
    await widthCheck(path);
    await page.evaluate(() => (document.documentElement.style.zoom = "2"));
    await widthCheck(path + " con zoom 200%");
    await page.evaluate(() => (document.documentElement.style.zoom = ""));
    await page.screenshot({
      path: "test-results/" + path.replace(".html", "") + "-mobile.png",
      fullPage: true,
    });
  }
  await button("Cerrar sesión").click();
  await waitPage("login.html");
  await register("Administración Propia", "proadmin@gmail.com", true);
  await login("proadmin@gmail.com", "admin");
  await text(".role-badge", "Administrador");
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.locator("#week").fill("26/10/2026");
  await page.locator("#week").dispatchEvent("change");
  await button("Duplicar semana anterior").click();
  await dialog("Duplicar");
  await button("Guardar borrador").click();
  await text("#message", "Borrador guardado");
  await button("Publicar menú").click();
  await dialog("Publicar");
  await text("#message", "Menú publicado");
  await page.screenshot({
    path: "test-results/admin-desktop.png",
    fullPage: true,
  });
  await go("calendario-feriados.html");
  await page.locator("#date").fill("15/10/2026");
  await page.locator("#reason").fill("Cierre");
  await button("Guardar día sin servicio").click();
  await dialog("Guardar");
  await text("#message", "pedidos activos");
  await page.locator("#date").fill("16/10/2026");
  await button("Guardar día sin servicio").click();
  await dialog("Guardar");
  await text("#holidays", "Cierre");
  await button("Editar motivo").click();
  await page.locator("#reason").fill("Feriado local");
  await button("Guardar día sin servicio").click();
  await dialog("Guardar");
  await text("#holidays", "Feriado local");
  await button("Habilitar servicio").click();
  await dialog("Habilitar");
  await text("#holidays", "No hay feriados");
  await go("consolidado.html");
  await page.locator("#report-date").fill("15/10/2026");
  await page.locator("#report-date").dispatchEvent("change");
  await button("Generar consolidado").click();
  await text("#total", "1");
  // Un reporte preliminar no debe impedir que se genere el final de las 10:05.
  await page.clock.setSystemTime(new Date("2026-10-15T13:05:00Z"));
  await page.reload();
  await page.waitForSelector("body.ready");
  assert.ok(
    await page.evaluate(
      () =>
        Date.parse(
          JSON.parse(localStorage.getItem("sistemaPedidos:v1")).reports[
            "2026-10-15"
          ].generatedAt,
        ) >= Date.parse("2026-10-15T13:05:00Z"),
    ),
  );
  await page.clock.setSystemTime(new Date("2026-10-13T12:00:00Z"));
  const downloadPromise = page.waitForEvent("download");
  await button("Descargar CSV").click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "consolidado-2026-10-15.csv");
  await download.saveAs("test-results/consolidado.csv");
  await page.evaluate(() => {
    window.print = () => {
      window.__printed = true;
    };
  });
  await button("Imprimir / Guardar PDF").click();
  assert.equal(await page.evaluate(() => window.__printed), true);
  await go("usuarios.html");
  await page.locator("#name").fill("Nueva Empleada");
  await page.locator("#email").fill("nueva@example.com");
  await button("Guardar autorización").click();
  await text("#users-body", "Nueva Empleada");
  const row = page.locator("tr").filter({ hasText: "Nueva Empleada" });
  await row.getByRole("button", { name: "Editar", exact: true }).click();
  await page.locator("#name").fill("Empleada Editada");
  await button("Guardar cambios").click();
  await dialog("Guardar");
  await text("#users-body", "Empleada Editada");
  await page
    .locator("tr")
    .filter({ hasText: "Empleada Editada" })
    .getByRole("button", { name: "Desactivar", exact: true })
    .click();
  await dialog("Desactivar");
  await text("#users-body", "Desactivado");
  for (const path of [
    "menuadmin.html",
    "usuarios.html",
    "consolidado.html",
    "calendario-feriados.html",
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await go(path);
    await widthCheck(path);
    await page.evaluate(() => (document.documentElement.style.zoom = "2"));
    await widthCheck(path + " con zoom 200%");
    await page.evaluate(() => (document.documentElement.style.zoom = ""));
    await page.screenshot({
      path: "test-results/" + path.replace(".html", "") + "-mobile.png",
      fullPage: true,
    });
  }
  await button("Cerrar sesión").click();
  await waitPage("login.html");
  assert.equal(await page.locator("#setup-link").count(), 0);
  await page.locator("#email").fill("nueva@example.com");
  await page.locator("#password").fill("Valida#2026");
  await button("Iniciar sesión").click();
  await text("#message", "registro");
  // El corte se comprueba de nuevo si las 10:00 llegan con un diálogo abierto.
  await login("actualizada@example.com");
  await go("mis-pedidos.html");
  await button("Cancelar pedido").click();
  await page.clock.setSystemTime(new Date("2026-10-15T13:00:00Z"));
  await dialog("Sí, cancelar");
  await text("#message", "plazo terminó");
  await text("#orders", "Confirmado");
  await button("Cerrar sesión").click();
  await waitPage("login.html");
  await page.setViewportSize({ width: 390, height: 844 });
  await go("login.html");
  await widthCheck("login");
  await page.screenshot({
    path: "test-results/login-mobile.png",
    fullPage: true,
  });
  await go("registro.html");
  await widthCheck("registro");
  await page.screenshot({
    path: "test-results/registro-mobile.png",
    fullPage: true,
  });
  await login("proadmin@gmail.com", "admin");
  await go("usuarios.html");
  await page.locator("#name").fill("Administración Autorizada");
  await page.locator("#email").fill("segunda@example.com");
  await page.locator("#role").selectOption("admin");
  await button("Guardar autorización").click();
  await text("#users-body", "Registro pendiente");
  await button("Cerrar sesión").click();
  await waitPage("login.html");
  await register("Administración Autorizada", "segunda@example.com");
  await login("segunda@example.com", "admin");
  await text(".role-badge", "Administrador");
  // Una carga fallida ofrece reintento y no deja enviar formularios sin JS.
  const failureContext = await browser.newContext();
  const failurePage = await failureContext.newPage();
  await failurePage.route("**/data/platos.json", (route) =>
    route.fulfill({ status: 503, body: "No disponible" }),
  );
  await failurePage.goto(base + "/login.html");
  await failurePage.getByRole("button", { name: "Reintentar carga" }).waitFor();
  assert.equal(await failurePage.locator("#login-form").isVisible(), false);
  await failurePage.unroute("**/data/platos.json");
  await failurePage.getByRole("button", { name: "Reintentar carga" }).click();
  await failurePage.waitForSelector("body.ready:not(.failed)");
  assert.equal(await failurePage.locator("#login-form").isVisible(), true);
  await failureContext.close();
  assert.deepEqual(errors, []);
  console.log(
    "OK: registro, login, roles, asistencia, pedidos, perfil, administración, exportación y 10 pantallas móviles. Sin errores JS.",
  );
} catch (e) {
  await page.screenshot({ path: "test-results/failure.png", fullPage: true });
  console.error("URL:", page.url());
  console.error(
    "Mensaje:",
    await page
      .locator("#message")
      .textContent()
      .catch(() => ""),
  );
  throw e;
} finally {
  await browser.close();
}
