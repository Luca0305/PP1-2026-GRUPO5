// Recuperar contraseña (complemento de M1), contra el backend:
//   recuperar.html   → POST /api/auth/recuperar           (genera el enlace)
//   restablecer.html → GET  /api/auth/recuperar/{token}   (¿sigue vigente?)
//                      POST /api/auth/restablecer         (guarda la nueva en MySQL)
// No hay servicio de email: el servidor devuelve el enlace como "correo simulado".
import { FieldError, passwordError } from "./validation.js";
import { $, bindForm, message, passwordChecklist } from "./ui.js";
import { api } from "./api.js";

const MAILBOX = "sistemaPedidos:correoSimulado";

export async function init() {
  if (document.body.dataset.page === "recuperar") {
    function showMail(mail) {
      $("#demo-mail").hidden = !mail;
      if (!mail) return;
      $("#mail-recipient").textContent = mail.destinatario;
      $("#mail-link").href = `restablecer.html#${encodeURIComponent(mail.token)}`;
      $("#mail-expiry").textContent = `Este enlace vence a las ${new Date(mail.vence).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} (dura 15 minutos) y sirve una sola vez. Pedir otro invalida el anterior.`;
    }
    try {
      showMail(JSON.parse(sessionStorage.getItem(MAILBOX)));
    } catch {
      sessionStorage.removeItem(MAILBOX);
    }
    bindForm("#recovery-form", async (data) => {
      const correo = String(data.get("email") || "").trim();
      if (!correo) throw new FieldError("email", "Ingresá tu email.");
      const respuesta = await api.recuperar(correo);
      const mail = respuesta.correoSimulado;
      sessionStorage.removeItem(MAILBOX);
      if (mail) sessionStorage.setItem(MAILBOX, JSON.stringify(mail));
      showMail(mail);
      message(respuesta.mensaje);
      $("#demo-empty").hidden = Boolean(mail);
      if (mail) {
        $("#demo-mail").focus();
        $("#demo-mail").scrollIntoView({ block: "center" });
      }
    });
    return;
  }

  const token = decodeURIComponent(location.hash.slice(1));
  passwordChecklist($("#password"), $("#password-rules"));
  const unavailable = (error) => {
    $("#reset-form").hidden = true;
    $("#reset-invalid").hidden = false;
    message(error.message, "error");
  };
  try {
    if (!token) throw new Error("Falta el enlace de recuperación. Pedí uno nuevo.");
    await api.validarEnlace(token);
    $("#reset-form").hidden = false;
  } catch (error) {
    unavailable(error);
  }
  bindForm("#reset-form", async (data) => {
    const password = data.get("password");
    if (passwordError(password)) throw new FieldError("password", passwordError(password));
    if (password !== data.get("confirm"))
      throw new FieldError("confirm", "Las contraseñas no coinciden. Repetí exactamente la misma contraseña.");
    try {
      await api.restablecer(token, password);
    } catch (error) {
      if (/enlace/i.test(error.message)) unavailable(error);
      throw error;
    }
    sessionStorage.removeItem(MAILBOX);
    history.replaceState(null, "", location.pathname);
    $("#reset-form").reset();
    $("#reset-form").hidden = true;
    $("#reset-success").hidden = false;
    message("Contraseña actualizada. Iniciá sesión con tu nueva contraseña. Tus pedidos y datos se conservaron.");
  });
}
