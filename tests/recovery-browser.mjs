// Servidor iniciado + Playwright y Chrome en el entorno de pruebas.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
});
const page = await context.newPage();
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const go = async (path) => {
  await page.goto(base + "/" + path);
  await page.waitForSelector("body.ready");
};
const click = async (name) =>
  page.getByRole("button", { name, exact: true }).click();
const text = async (selector, value) =>
  page.waitForFunction(
    ({ selector, value }) =>
      document.querySelector(selector)?.textContent.includes(value),
    { selector, value },
  );
const submit = async (password, confirm = password) => {
  await page.locator("#password").fill(password);
  await page.locator("#confirm").fill(confirm);
  await click("Guardar nueva contraseña");
};
await mkdir("test-results", { recursive: true });
try {
  await go("registro.html");
  await page.locator("#nombre").fill("Recuperación Prueba");
  await page.locator("#email").fill("recuperacion@example.com");
  await page.locator("#password").fill("Valida#2026");
  await page.locator("#confirm").fill("Valida#2026");
  await click("Crear cuenta");
  await page.waitForURL("**/login.html");
  await page.getByRole("link", { name: "Olvidé mi contraseña" }).click();
  await page.waitForSelector("body.ready");
  await page.locator("#email").fill("recuperacion@example.co");
  await click("Solicitar enlace");
  await text("#email-error", ".com");
  await page.locator("#email").fill("nadie@example.com");
  await click("Solicitar enlace");
  await page.locator("#demo-empty").waitFor({ state: "visible" });
  assert.equal(await page.locator("#demo-mail").isVisible(), false);
  await page.locator("#email").fill("recuperacion@example.com");
  await click("Solicitar enlace");
  await page.locator("#demo-mail").waitFor({ state: "visible" });
  const first = await page.locator("#mail-link").getAttribute("href");
  await page.reload();
  await page.waitForSelector("body.ready");
  assert.equal(await page.locator("#mail-link").getAttribute("href"), first);
  await page.locator("#email").fill("recuperacion@example.com");
  await click("Solicitar enlace");
  await page.waitForFunction(
    (first) =>
      document.querySelector("#mail-link").getAttribute("href") !== first,
    first,
  );
  const second = await page.locator("#mail-link").getAttribute("href");
  await page.screenshot({
    path: "test-results/recuperacion-desktop.png",
    fullPage: true,
  });
  await go(first);
  await page.locator("#reset-invalid").waitFor({ state: "visible" });
  await page.getByRole("link", { name: "Solicitar un nuevo enlace" }).click();
  await page.waitForSelector("body.ready");
  await page.locator("#mail-link").click();
  await page.waitForSelector("body.ready");
  await submit("abc");
  await text("#password-error", "contraseña");
  assert.equal(
    await page.locator("#password").getAttribute("aria-invalid"),
    "true",
  );
  await submit("Nueva#2027", "Distinta#2027");
  await text("#confirm-error", "no coinciden");
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .click();
  assert.equal(await page.locator("#password").getAttribute("type"), "text");
  assert.equal(await page.locator("#password-rules .complete").count(), 7);
  await submit("Nueva#2027");
  await page.locator("#reset-success").waitFor({ state: "visible" });
  await page
    .getByRole("link", { name: "Ir a iniciar sesión", exact: true })
    .click();
  await page.waitForSelector("body.ready");
  await page.locator("#email").fill("recuperacion@example.com");
  await page.locator("#password").fill("Valida#2026");
  await click("Iniciar sesión");
  await text("#password-error", "no coincide");
  await page.locator("#password").fill("Nueva#2027");
  await click("Iniciar sesión");
  await page.waitForURL("**/asistencia.html");
  await page.waitForSelector("body.ready");
  await click("Cerrar sesión");
  await page.waitForURL("**/login.html");
  await go(second);
  await page.locator("#reset-invalid").waitFor({ state: "visible" });
  await go("restablecer.html");
  await page.locator("#reset-invalid").waitFor({ state: "visible" });
  await go("recuperar.html");
  await page.locator("#email").fill("recuperacion@example.com");
  await click("Solicitar enlace");
  await page.locator("#demo-mail").waitFor({ state: "visible" });
  await page.locator("#mail-link").click();
  await page.waitForSelector("body.ready");
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem("sistemaPedidos:v1"));
    db.passwordResets.forEach((r) => (r.expiresAt = Date.now() - 1));
    localStorage.setItem("sistemaPedidos:v1", JSON.stringify(db));
  });
  await submit("Otra#2028");
  await text("#message", "venció");
  assert.equal(await page.locator("#reset-form").isVisible(), false);
  for (const path of ["recuperar.html", "restablecer.html"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await go(path);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.screenshot({
      path: "test-results/" + path.replace(".html", "") + "-mobile.png",
      fullPage: true,
    });
    await page
      .getByRole("link", { name: "Volver al inicio de sesión", exact: true })
      .click();
    await page.waitForURL("**/login.html");
  }
  assert.deepEqual(errors, []);
  console.log(
    "OK: recuperación completa, reenvío, errores, enlace vencido durante edición, reutilización, login y vuelta; sin errores JS.",
  );
} catch (error) {
  await page.screenshot({
    path: "test-results/recovery-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
