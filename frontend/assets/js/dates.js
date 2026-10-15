import { DATE_FORMAT, formatDate, parseDate } from "./core.js";
import { FieldError } from "./validation.js";

export function readDate(input) {
  if (!input.dataset.dateFormat) return input.value;
  if (!input.value.trim()) return "";
  const iso = parseDate(input.value.trim());
  if (!iso)
    throw new FieldError(
      input.id,
      `Ingresá una fecha real con el formato ${input.dataset.dateFormat}. Ejemplo: ${formatDate("2026-10-15")}.`,
    );
  return iso;
}
export function writeDate(input, iso) {
  input.value = input.dataset.dateFormat ? formatDate(iso) : iso;
}
// El texto visible es independiente del idioma del navegador. El calendario nativo
// se conserva como ayuda; todos los controladores reciben fechas ISO.
export function enhanceDates() {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    if (input.classList.contains("native-calendar")) return;
    const iso = input.value;
    input.type = "text";
    input.dataset.dateFormat = DATE_FORMAT;
    input.placeholder = input.dataset.dateFormat;
    input.maxLength = 10;
    input.inputMode = "text";
    input.autocomplete = "off";
    writeDate(input, iso);
    const wrap = document.createElement("div");
    wrap.className = "date-field";
    input.before(wrap);
    wrap.append(input);
    const native = document.createElement("input");
    native.type = "date";
    native.className = "native-calendar";
    native.tabIndex = -1;
    native.setAttribute("aria-hidden", "true");
    const button = document.createElement("button");
    button.type = "button";
    button.hidden = typeof native.showPicker !== "function";
    button.className = "calendar-button";
    button.setAttribute(
      "aria-label",
      `Abrir calendario: ${document.querySelector(`label[for="${input.id}"]`)?.textContent || "fecha"}`,
    );
    button.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18M7 15h3m4 0h3"/></svg>';
    button.addEventListener("click", () => {
      try {
        native.value = readDate(input);
      } catch {
        native.value = "";
      }
      native.showPicker();
    });
    native.addEventListener("change", () => {
      writeDate(input, native.value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    wrap.append(button, native);
    const sync = () => {
      button.disabled = input.disabled;
      native.disabled = input.disabled;
    };
    sync();
    new MutationObserver(sync).observe(input, {
      attributes: true,
      attributeFilter: ["disabled"],
    });
  });
}
