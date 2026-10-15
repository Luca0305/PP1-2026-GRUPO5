import { register, login, home } from "./core.js";
import { emailError, nameError } from "./validation.js";
import {
  $,
  bindForm,
  redirect,
  passwordChecklist,
  fieldError,
  clearFieldError,
} from "./ui.js";
export function init() {
  const registration = document.body.dataset.page === "registro";
  passwordChecklist($("#password"), $("#password-rules"));
  $("#email").addEventListener("blur", () => {
    const error = emailError($("#email").value);
    if (error && $("#email").value) fieldError($("#email"), error);
    else clearFieldError($("#email"));
  });
  if (registration) {
    $("#nombre").addEventListener("blur", () => {
      const error = nameError($("#nombre").value);
      if (error && $("#nombre").value) fieldError($("#nombre"), error);
      else clearFieldError($("#nombre"));
    });
    $("#confirm").addEventListener("input", () => {
      if ($("#confirm").value && $("#confirm").value !== $("#password").value)
        fieldError($("#confirm"), "Las contraseñas todavía no coinciden.");
      else clearFieldError($("#confirm"));
    });
    bindForm("#registro-form", async (data) => {
      await register({
        name: data.get("nombre"),
        email: data.get("email"),
        password: data.get("password"),
        confirm: data.get("confirm"),
      });
      redirect(
        "login.html",
        "Cuenta creada. Iniciá sesión con tu email y contraseña.",
      );
    });
  } else
    bindForm("#login-form", async (data) => {
      const account = await login(data.get("email"), data.get("password"));
      redirect(home(account));
    });
}
