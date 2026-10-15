import test from "node:test";
import assert from "node:assert/strict";
import { nameError, emailError } from "../frontend/assets/js/validation.js";
import { checkIdentity, login, saveDB } from "../frontend/assets/js/core.js";
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
test("login: inexistentes, pendientes e inactivos tienen un único aviso general", async () => {
  let saved;
  globalThis.localStorage = {
    getItem: () => saved,
    setItem: (_, v) => {
      saved = v;
    },
  };
  for (const users of [
    [],
    [{ email: "persona@example.com", pending: true, active: true }],
    [{ email: "persona@example.com", active: false }],
  ]) {
    saveDB({
      version: 1,
      users,
      menus: [],
      orders: [],
      attendance: {},
      holidays: {},
      reports: {},
    });
    await assert.rejects(
      login("persona@example.com", "Valida#2026"),
      (e) =>
        !e.field &&
        e.message.startsWith("Tu cuenta no está registrada o activada."),
    );
  }
});
