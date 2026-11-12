import test from "node:test";
import assert from "node:assert/strict";
import { nameError, emailError } from "../frontend/assets/js/validation.js";
import { checkIdentity, login } from "../frontend/assets/js/core.js";
test("nombres: tildes, nombres compuestos y separadores legítimos", () => {
  for (const name of [
    "María José Pérez",
    "José Muñoz",
    "Ana-María",
    "O’Connor",
    "D'Angelo",
    "João",
    "François",
    "Jose\u0301 Pérez",
  ])
    assert.equal(nameError(name), "", name);
});
test("nombres: rechaza símbolos, números, separadores repetidos e invisibles", () => {
  for (const name of [
    "Juan123",
    "Ana 😊",
    "<Ana>",
    "Juan_Pérez",
    "Ana@Pérez",
    "Ana/Pérez",
    "Ana..Pérez",
    "-Ana",
    "Ana'",
    "Ana--María",
    "Ana  María",
    "Ana\nMaría",
    "Ana\u200bMaría",
    "A",
    "A".repeat(81),
  ]) {
    assert.ok(nameError(name), name);
    assert.throws(
      () => checkIdentity(name, "persona@example.com"),
      (e) => e.field === "name",
    );
  }
});
test("correos: errores frecuentes sin bloquear dominios propios", () => {
  for (const domain of [
    "gmial.com",
    "gamil.com",
    "gmai.com",
    "gmaill.com",
    "hotmial.com",
    "outlok.com",
    "yaho.com",
    "icould.com",
  ])
    assert.match(emailError(`persona@${domain}`), /Corregilo/);
  for (const email of [
    "persona@gmail.com",
    "PERSONA@GMAIL.COM",
    "nombre.apellido+trabajo@empresa.com",
    "persona@sub.empresa.com",
    "persona@outlook.com",
  ])
    assert.equal(emailError(email), "", email);
});
// 4ta entrega: el login lo resuelve el backend (POST /api/auth/login). En el frontend solo
// se controla que no falten datos, sin exigir la política del registro (las cuentas del
// script usan "cambiar123").
test("login: email y contraseña vacíos se avisan en su campo, sin llamar al backend", async () => {
  globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  globalThis.fetch = () => {
    throw new Error("no debería llamar al backend");
  };
  await assert.rejects(login("  ", "algo"), (e) => e.field === "email");
  await assert.rejects(login("persona@example.com", ""), (e) => e.field === "password");
});
