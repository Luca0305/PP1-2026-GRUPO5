import { enhanceDates } from "./dates.js";
import { initDB, user, home } from "./core.js";
import { shell, message } from "./ui.js";
async function start() {
  try {
    const db = await initDB(),
      u = user(db),
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
