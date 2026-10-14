import {
  requestRecovery,
  validateRecovery,
  resetPassword,
} from "./recovery.js";
import { $, bindForm, message, passwordChecklist } from "./ui.js";
const MAILBOX = "sistemaPedidos:correoSimulado";
export async function init() {
  if (document.body.dataset.page === "recuperar") {
    function showMail(mail) {
      $("#demo-mail").hidden = !mail;
      if (!mail) return;
      $("#mail-recipient").textContent = mail.email;
      $("#mail-link").href =
        `restablecer.html#${encodeURIComponent(mail.token)}`;
      $("#mail-expiry").textContent =
        "Este enlace dura 15 minutos desde su solicitud. Pedir otro invalida el anterior.";
    }
    try {
      showMail(JSON.parse(sessionStorage.getItem(MAILBOX)));
    } catch {
      sessionStorage.removeItem(MAILBOX);
    }
    bindForm("#recovery-form", async (data) => {
      const mail = await requestRecovery(data.get("email"));
      sessionStorage.removeItem(MAILBOX);
      if (mail) sessionStorage.setItem(MAILBOX, JSON.stringify(mail));
      showMail(mail);
      message(
        "Solicitud procesada. Si el email corresponde a una cuenta registrada y activa, su enlace aparecerá en el correo simulado de esta pantalla.",
      );
      $("#demo-empty").hidden = Boolean(mail);
      if (mail) {
        $("#demo-mail").focus();
        $("#demo-mail").scrollIntoView({block:"center"});
      }
    });
    return;
  }
  const token = location.hash.slice(1);
  passwordChecklist($("#password"), $("#password-rules"));
  const unavailable = (error) => {
    $("#reset-form").hidden = true;
    $("#reset-invalid").hidden = false;
    message(error.message, "error");
  };
  try {
    await validateRecovery(token);
    $("#reset-form").hidden = false;
  } catch (error) {
    unavailable(error);
  }
  bindForm("#reset-form", async (data) => {
    try {
      await resetPassword(token, data.get("password"), data.get("confirm"));
    } catch (error) {
      if (!error.field) unavailable(error);
      throw error;
    }
    sessionStorage.removeItem(MAILBOX);
    history.replaceState(null, "", location.pathname);
    $("#reset-form").reset();
    $("#reset-form").hidden = true;
    $("#reset-success").hidden = false;
    message(
      "Contraseña actualizada. Iniciá sesión con tu nueva contraseña. Tus pedidos y datos se conservaron.",
    );
  });
}
