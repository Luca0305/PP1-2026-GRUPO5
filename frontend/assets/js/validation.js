// Política de validación compartida por registro, login, perfil y usuarios.
export class FieldError extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
  }
}
export const PASSWORD_RULES = [
  { id: "length", text: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
  {
    id: "lower",
    text: "Una letra minúscula (a–z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "upper",
    text: "Una letra mayúscula (A–Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  { id: "number", text: "Un número", test: (p) => /[0-9]/.test(p) },
  {
    id: "symbol",
    text: "Un símbolo (ej: ! @ # $ % & *)",
    test: (p) => /[!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~]/.test(p),
  },
  {
    id: "spaces",
    text: "Sin espacios",
    test: (p) => p.length > 0 && !/\s/.test(p),
  },
  {
    id: "maximum",
    text: "Máximo 64 caracteres",
    test: (p) => p.length > 0 && p.length <= 64,
  },
];
export function emailError(value) {
  if (!value)
    return "Ingresá tu email. Si todavía no tenés una cuenta, elegí Registrate.";
  if (/\s/.test(value))
    return "El email no puede tener espacios. Quitalos e intentá de nuevo.";
  if (value.length > 254)
    return "El email no puede superar los 254 caracteres.";
  if (!value.includes("@"))
    return "Al email le falta el símbolo @. Usá el formato usuario@mail.com.";
  if (value.split("@").length !== 2)
    return "El email debe tener un único símbolo @.";
  const [local, domain] = value.split("@");
  if (!local) return "Falta el nombre de usuario antes de @.";
  if (!domain) return "Falta el dominio después de @, por ejemplo mail.com.";
  if (local.length > 64)
    return "La parte anterior a @ admite hasta 64 caracteres.";
  if (local.startsWith(".") || local.endsWith(".") || value.includes(".."))
    return "El email no admite puntos consecutivos ni puntos al inicio o al final del nombre de usuario.";
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local))
    return "La parte anterior a @ contiene caracteres no permitidos. Usá letras sin tildes, números y signos válidos.";
  if (!domain.toLowerCase().endsWith(".com"))
    return "El email debe terminar en .com. Por ejemplo usuario@mail.com";
  const labels = domain.split(".");
  if (
    labels.length < 2 ||
    !labels.every(
      (label) =>
        label.length <= 63 &&
        /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label),
    )
  )
    return "Revisá el dominio: debe tener un nombre antes de .com, sin guiones en sus extremos ni signos como _.";
  return "";
}
export function passwordError(value) {
  if (!value) return "Ingresá tu contraseña.";
  const missing = PASSWORD_RULES.filter((rule) => !rule.test(value)).map(
    (rule) => rule.text.toLowerCase(),
  );
  return missing.length
    ? `La contraseña debe cumplir: ${missing.join("; ")}.`
    : "";
}
