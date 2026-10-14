// Recuperación demostrativa: no envía correos ni verifica la titularidad del email.
import { readDB, saveDB, credential, SESSION_KEY } from "./core.js";
import { FieldError, emailError, passwordError } from "./validation.js";
export const RESET_LIFETIME = 15 * 60 * 1000;
const invalid = () =>
  new Error(
    "El enlace no es válido, venció o ya fue utilizado. Solicitá uno nuevo.",
  );
async function digest(token) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
function findRequest(db, hash, now) {
  const request = (db.passwordResets || []).find((r) => r.hash === hash);
  const account = db.users.find((u) => u.id === request?.userId);
  if (
    !request ||
    request.expiresAt <= now ||
    !account?.active ||
    account.pending ||
    account.email !== request.email ||
    account.auth?.hash !== request.authHash
  )
    throw invalid();
  return { request, account };
}
export async function requestRecovery(email, now = Date.now()) {
  if (emailError(email)) throw new FieldError("email", emailError(email));
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const hash = await digest(token);
  const db = readDB();
  const account = db.users.find(
    (u) => u.email === email.toLowerCase() && u.active && !u.pending && u.auth,
  );
  if (!account) return null;
  db.passwordResets = (db.passwordResets || []).filter(
    (r) => r.userId !== account.id && r.expiresAt > now,
  );
  const expiresAt = now + RESET_LIFETIME;
  db.passwordResets.push({
    userId: account.id,
    email: account.email,
    authHash: account.auth.hash,
    hash,
    expiresAt,
  });
  saveDB(db);
  return { email: account.email, token, expiresAt };
}
export async function validateRecovery(token, now = Date.now()) {
  if (!/^[a-f0-9]{64}$/.test(token || "")) throw invalid();
  const { request } = findRequest(readDB(), await digest(token), now);
  return { expiresAt: request.expiresAt };
}
export async function resetPassword(token, password, confirm, now) {
  await validateRecovery(token, now ?? Date.now());
  if (passwordError(password))
    throw new FieldError("password", passwordError(password));
  if (password !== confirm)
    throw new FieldError(
      "confirm",
      "Las contraseñas no coinciden. Repetí exactamente la misma contraseña.",
    );
  const hash = await digest(token);
  const auth = await credential(password);
  // Releer después del cálculo: otro envío, un cambio de cuenta o el vencimiento invalidan el enlace.
  const db = readDB();
  const { account } = findRequest(db, hash, now ?? Date.now());
  account.auth = auth;
  account.sessionVersion = (account.sessionVersion || 0) + 1;
  db.passwordResets = db.passwordResets.filter((r) => r.userId !== account.id);
  saveDB(db);
  if (sessionStorage.getItem(SESSION_KEY) === account.id)
    sessionStorage.removeItem(SESSION_KEY);
}
