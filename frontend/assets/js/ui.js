import { PASSWORD_RULES } from "./validation.js";
import { readDate } from "./dates.js";
import {
  escapeHTML as esc,
  PASSWORD_HELP,
  SESSION_KEY,
  readDB,
  user,
  home,
  clock,
  attendanceFor,
  monday,
} from "./core.js";
export const $ = (selector) => document.querySelector(selector);
export const icons = {
  attendance:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6m-10 7 3 3 7-7"/></svg>',
  meal: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M3 2v7m3-7v7M3 6h3M4.5 9v13M21 2v20m0-20c-4 3-4 9 0 10"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l2 15H3L5 7Z"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/></svg>',
  report:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2h10l4 4v16H5Z"/><path d="M9 10h6m-6 4h6m-6 4h4"/></svg>',
  person:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>',
  shield:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10 5c7-1 12 7 12 7a22 22 0 0 1-4 5M6 6a24 24 0 0 0-4 6s4 7 10 7a13 13 0 0 0 4-1M10 10a3 3 0 0 0 4 4"/></svg>',
};
export function message(text, type = "success") {
  const box = $("#message");
  box.textContent = text;
  box.className = `message ${type}`;
  box.hidden = false;
  box.setAttribute("role", type === "error" ? "alert" : "status");
  box.focus({ preventScroll: true });
}
export function fieldError(input, text) {
  input.setAttribute("aria-invalid", "true");
  const id = `${input.id}-error`;
  let error = document.getElementById(id);
  if (!error) {
    error = document.createElement("p");
    error.id = id;
    error.className = "field-error";
    (input.closest(".field") || input.parentElement).append(error);
  }
  error.textContent = text;
  error.hidden = false;
  const ids = new Set(
    (input.getAttribute("aria-describedby") || "").split(" ").filter(Boolean),
  );
  ids.add(id);
  input.setAttribute("aria-describedby", [...ids].join(" "));
}
export function clearFieldError(input) {
  input.removeAttribute("aria-invalid");
  const error = document.getElementById(`${input.id}-error`);
  if (error) error.hidden = true;
}
export function clearFormErrors(form) {
  form.querySelectorAll("[aria-invalid]").forEach(clearFieldError);
}
export function passwordChecklist(input, container) {
  container.className = "password-rules";
  container.setAttribute("aria-label", "Requisitos de contraseña");
  const render = () => {
    container.innerHTML = PASSWORD_RULES.map(
      (rule) =>
        `<li class="${rule.test(input.value) ? "complete" : ""}"><span aria-hidden="true">${rule.test(input.value) ? "✓" : "○"}</span><span>${rule.text}</span><span class="sr-only">${rule.test(input.value) ? "Cumplido" : "Pendiente"}</span></li>`,
    ).join("");
  };
  input.addEventListener("input", render);
  input.form?.addEventListener("reset", () => queueMicrotask(render));
  render();
}
export function flash(text) {
  sessionStorage.setItem("sistemaPedidos:aviso", text);
}
export function redirect(url, text) {
  if (text) flash(text);
  location.href = url;
}
export async function run(action, button) {
  if (button?.disabled) return;
  if (button) button.disabled = true;
  try {
    await action();
  } catch (e) {
    message(e.message || "No se pudo completar la acción.", "error");
    if (e.field) {
      const input =
        document.getElementById(e.field) ||
        (e.field === "name" ? document.getElementById("nombre") : null);
      if (input) {
        fieldError(input, e.message);
        input.focus();
      }
    }
  } finally {
    if (button) button.disabled = false;
  }
}
export function bindForm(id, callback) {
  const form = $(id);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormErrors(form);
    run(() => {
      const data = new FormData(form);
      document.querySelectorAll("[data-date-format]").forEach((input) => {
        const iso = readDate(input);
        if (input.form === form && input.name) data.set(input.name, iso);
      });
      return callback(data, form);
    }, e.submitter);
  });
}
export function confirmAction(title, text, accept = "Confirmar") {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-labelledby", "dialog-title");
    dialog.setAttribute("aria-describedby", "dialog-text");
    dialog.innerHTML = `<h2 id="dialog-title">${esc(title)}</h2><p id="dialog-text">${esc(text)}</p><form method="dialog" class="actions"><button value="cancel" class="secondary" autofocus>Volver</button><button value="ok">${esc(accept)}</button></form>`;
    dialog.addEventListener(
      "close",
      () => {
        const ok = dialog.returnValue === "ok";
        dialog.remove();
        resolve(ok);
      },
      { once: true },
    );
    document.body.append(dialog);
    dialog.showModal();
  });
}
export function enhancePasswords(root = document) {
  root.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.parentElement.classList.contains("password-field")) return;
    const wrap = document.createElement("div");
    wrap.className = "password-field";
    input.before(wrap);
    wrap.append(input);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "eye";
    button.setAttribute("aria-controls", input.id);
    button.setAttribute("aria-pressed", "false");
    const label =
      document.querySelector(`label[for="${input.id}"]`)?.textContent ||
      "contraseña";
    button.setAttribute("aria-label", `Mostrar ${label.toLowerCase()}`);
    button.innerHTML = icons.eyeOff;
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.innerHTML = show ? icons.eye : icons.eyeOff;
      button.setAttribute("aria-pressed", String(show));
      button.setAttribute(
        "aria-label",
        `${show ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`,
      );
    });
    wrap.append(button);
  });
  root
    .querySelectorAll("[data-password-help]")
    .forEach((x) => (x.textContent = PASSWORD_HELP));
}
export function shell(u) {
  const page = document.body.dataset.page;
  const nav = u
    ? u.role === "admin"
      ? [
          ["menuadmin", "Menús"],
          ["consolidado", "Consolidado"],
          ["calendario-feriados", "Feriados"],
          ["usuarios", "Usuarios"],
        ]
      : [
          ["asistencia", "Asistencia"],
          ["menu-pedido", "Elegir menú"],
          ["mis-pedidos", "Mis pedidos"],
        ]
    : [];
  const navIcons = {
    asistencia: "attendance",
    "menu-pedido": "meal",
    "mis-pedidos": "bag",
    menuadmin: "meal",
    consolidado: "report",
    "calendario-feriados": "attendance",
    usuarios: "person",
  };
  document.body.dataset.role = u?.role || "public";
  $("#app-header").innerHTML =
    `<a class="brand" href="${u ? home(u) : "login.html"}" aria-label="SistemaPedidos, inicio"><img class="brand-logo" src="assets/img/logo.png" alt="SistemaPedidos" width="1536" height="1024"></a>${u ? `<nav aria-label="Navegación principal">${nav.map(([key, label]) => `<a href="${key}.html" ${key === page ? 'aria-current="page"' : ""}>${icons[navIcons[key]]}<span>${label}</span></a>`).join("")}</nav><div class="account"><span class="role-badge">${u.role === "admin" ? icons.shield : icons.person}${u.role === "admin" ? "Administrador" : "Empleado"}</span><a class="profile-link" href="mi-perfil.html" ${page === "mi-perfil" ? 'aria-current="page"' : ""}>${icons.person}<span><span class="account-name">${esc(u.name)}</span><small>Mi perfil y preferencias</small></span></a><button id="logout" class="text-button">Cerrar sesión</button></div>` : ""}`;
  $("#logout")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    redirect("login.html", "Cerraste tu sesión.");
  });
  const notice = sessionStorage.getItem("sistemaPedidos:aviso");
  if (notice) {
    sessionStorage.removeItem("sistemaPedidos:aviso");
    message(notice);
  }
  enhancePasswords();
  document
    .querySelectorAll("input,select,textarea")
    .forEach((input) =>
      input.addEventListener("input", () => clearFieldError(input)),
    );
  // Revalida la cuenta al volver de otra pestaña o de la caché del navegador.
  function revalidate() {
    if (!u) return;
    try {
      const fresh = user();
      if (!fresh || fresh.role !== u.role) location.replace("login.html");
    } catch (e) {
      message(e.message, "error");
    }
  }
  window.addEventListener("storage", revalidate);
  window.addEventListener("pageshow", revalidate);
  if (u?.role === "empleado") {
    const reminder = () => {
      const c = clock(),
        db = readDB();
      if (
        c.hour === 9 &&
        c.minute >= 45 &&
        attendanceFor(db, u.id, monday()).includes(c.today) &&
        !db.orders.some(
          (o) =>
            o.userId === u.id &&
            o.date === c.today &&
            o.status === "Confirmado",
        )
      ) {
        const box = $("#reminder");
        box.hidden = false;
        box.innerHTML =
          'Te falta confirmar el almuerzo de hoy. Tenés tiempo hasta las 10:00. <a href="mis-pedidos.html">Revisar mis pedidos</a>';
      } else $("#reminder").hidden = true;
    };
    reminder();
    setInterval(() => {
      try {
        reminder();
      } catch {}
    }, 30000);
  }
}
export function stepper(step) {
  $("#steps").innerHTML = ["Asistencia", "Elegí tu menú", "Revisá y confirmá"]
    .map(
      (label, i) =>
        `<span class="${i === step ? "current" : ""}"><b>${i + 1}</b>${label}</span>`,
    )
    .join("");
}
