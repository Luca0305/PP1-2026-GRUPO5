import { clearPrototype } from "./limpieza.js";
import { initDB, readDB } from "./core.js";
const status = document.querySelector("#review-status");
const dialog = document.querySelector("#reset-dialog");
function counts() {
  if (!localStorage.getItem("sistemaPedidos:v1"))
    return "Sin cuentas ni actividad guardada en esta dirección.";
  const db = readDB();
  return `${db.users.length} cuentas · ${db.orders.length} pedidos · ${Object.keys(db.attendance).length} configuraciones de asistencia · ${Object.keys(db.holidays).length} feriados · ${Object.keys(db.reports || {}).length} reportes.`;
}
try {
  status.textContent = counts();
} catch {
  status.textContent =
    "Los datos locales no se pueden leer. Podés restablecerlos.";
}
document
  .querySelector("#reset-open")
  .addEventListener("click", () => dialog.showModal());
document
  .querySelector("#reset-cancel")
  .addEventListener("click", () => dialog.close());
document
  .querySelector("#reset-confirm")
  .addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      clearPrototype();
      await initDB();
      dialog.close();
      status.textContent =
        "Pruebas eliminadas. " +
        counts() +
        " Se restauró el catálogo y los menús originales de los JSON.";
      status.focus();
    } catch (error) {
      dialog.close();
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
document.querySelector("#review-origin").textContent = location.origin;
