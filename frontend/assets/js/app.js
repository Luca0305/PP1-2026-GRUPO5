import { enhanceDates } from "./dates.js";
import { user, home, configurarHoraCorte, horaCorteTexto } from "./core.js";
import { pedir } from "./api.js";
import { shell, message } from "./ui.js";
// La hora de corte la manda el backend; si no responde (por ejemplo en login con
// Spring apagado), se usa 10:00 y la pantalla sigue funcionando.
async function cargarConfiguracion() {
  try {
    const configuracion = await pedir("/configuracion");
    configurarHoraCorte(configuracion?.horaCorte);
  } catch {
    // sin servidor: queda la hora por defecto
  }
  document
    .querySelectorAll("[data-hora-corte]")
    .forEach((el) => (el.textContent = horaCorteTexto()));
}
// El prototipo de la 3ra entrega guardaba todo en localStorage. Ahora los datos
// están en MySQL: se borran esas claves viejas para que no quede nada colgado.
function limpiarPrototipo() {
  try {
    for (const clave of Object.keys(localStorage))
      if (clave.startsWith("sistemaPedidos:")) localStorage.removeItem(clave);
  } catch {
    // navegador sin acceso a localStorage: no hay nada que limpiar
  }
}
async function start() {
  try {
    limpiarPrototipo();
    await cargarConfiguracion();
    const u = user(),
      role = document.body.dataset.required;
    if (role && !u) {
      location.replace("login.html");
      return;
    }
    if (role && role !== "any" && u.role !== role) {
      location.replace(home(u));
      return;
    }
    shell(
      ["recuperar", "restablecer"].includes(document.body.dataset.page)
        ? null
        : u,
    );
    const modules = {
      login: "auth",
      registro: "auth",
      recuperar: "recuperacion",
      restablecer: "recuperacion",
      asistencia: "asistencia",
      "menu-pedido": "menu-pedido",
      "mis-pedidos": "mis-pedidos",
      menuadmin: "menuadmin",
      "calendario-feriados": "calendario-feriados",
      consolidado: "consolidado",
      "pedido-fuera-de-horario": "pedido-fuera-de-horario",
      usuarios: "usuarios",
      "mi-perfil": "perfil",
    };
    const module = await import(`./${modules[document.body.dataset.page]}.js`);
    await module.init();
    enhanceDates();
    document.body.classList.add("ready");
  } catch (e) {
    document.body.classList.add("failed");
    document.body.classList.add("ready");
    message(e.message, "error");
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Reintentar carga";
    retry.addEventListener("click", () => location.reload());
    document
      .querySelector("#message")
      .append(document.createElement("br"), retry);
  }
}
start();
