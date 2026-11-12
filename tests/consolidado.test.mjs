// Lógica pura del frontend de la 4ta entrega (sin navegador ni backend).
import test from "node:test";
import assert from "node:assert/strict";
import { armarFilas, csvCell } from "../frontend/assets/js/consolidado.js";
import { consulta } from "../frontend/assets/js/api.js";

test("armarFilas suma solo los comentarios de pedidos CONFIRMADOS del mismo día y plato", () => {
  const consolidado = [{ fecha: "2026-10-28", idPlato: 1, plato: "Milanesa con puré", porciones: 2 }];
  const detalle = [
    { fecha: "2026-10-28", idPlato: 1, empleado: "Martín Sosa", plato: "Milanesa con puré", estado: "CONFIRMADO", comentario: "Sin sal" },
    { fecha: "2026-10-28", idPlato: 1, empleado: "Carolina Benítez", plato: "Milanesa con puré", estado: "CONFIRMADO", comentario: null },
    { fecha: "2026-10-28", idPlato: 1, empleado: "Diego Romero", plato: "Milanesa con puré", estado: "BORRADOR", comentario: "No cuenta" },
    { fecha: "2026-10-27", idPlato: 1, empleado: "Lucía Fernández", plato: "Milanesa con puré", estado: "CONFIRMADO", comentario: "Otro día" },
  ];
  const [fila] = armarFilas(consolidado, detalle);
  assert.equal(fila.porciones, 2);
  assert.deepEqual(fila.comentarios, ["Martín Sosa: Sin sal"]);
});

test("csvCell escapa comillas y neutraliza fórmulas", () => {
  assert.equal(csvCell('Dijo "hola"'), '"Dijo ""hola"""');
  assert.equal(csvCell("=SUMA(A1)"), "\"'=SUMA(A1)\"");
});

test("consulta arma la query string sin valores vacíos", () => {
  assert.equal(consulta({ idUsuario: 3, desde: "2026-11-16", hasta: "" }), "?idUsuario=3&desde=2026-11-16");
  assert.equal(consulta({}), "");
});
