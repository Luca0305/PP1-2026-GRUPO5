// Datos externos. El frontend corre en Live Server (5500/5502) y Spring Boot en el
// 8080: son dos servidores distintos, por eso la URL es completa.
export const API = "http://localhost:8080/api";

// Catálogo de platos desde MySQL, pasando por el backend (GET /api/platos).
// Lo usa Administrar menús para elegir los platos de cada opción.
export async function cargarPlatosDesdeAPI() {
  let respuesta;
  try {
    respuesta = await fetch(`${API}/platos`, { cache: "no-store" });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Revisá que el backend esté iniciado y reintentá.",
    );
  }
  // Un 404 o 500 no entra al catch del fetch: se revisa respuesta.ok.
  if (!respuesta.ok)
    throw new Error(`El servidor respondió con un error (HTTP ${respuesta.status}).`);
  let platos;
  try {
    platos = await respuesta.json();
  } catch {
    throw new Error("El servidor no devolvió JSON válido.");
  }
  if (!Array.isArray(platos))
    throw new Error("El catálogo de platos debe ser una lista.");
  // La descripción puede venir null desde la base (columna opcional).
  return platos.map((plato) => ({ ...plato, descripcion: plato.descripcion ?? "" }));
}
