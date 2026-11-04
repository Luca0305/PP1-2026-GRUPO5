// Datos externos: una función por fuente. El render recibe objetos, no hace fetch.
// Backend Spring Boot. Es la URL completa porque el frontend corre en Live
// Server (5500/5502) y Spring en el 8080: son dos servidores distintos.
export const API = "http://localhost:8080/api";

export async function cargarJSON(ruta) {
  const respuesta = await fetch(ruta, { cache: "no-store" });
  if (!respuesta.ok)
    throw new Error(
      `No se pudo cargar ${ruta}. Revisá la conexión y reintentá.`,
    );
  try {
    return await respuesta.json();
  } catch {
    throw new Error(`El archivo ${ruta} no contiene JSON válido.`);
  }
}

export async function cargarPlatos() {
  const platos = await cargarJSON("data/platos.json");
  if (!Array.isArray(platos))
    throw new Error("El catálogo de platos debe ser una lista.");
  const ids = new Set();
  for (const plato of platos) {
    if (
      !plato ||
      !["string", "number"].includes(typeof plato.id) ||
      !String(plato.id) ||
      typeof plato.nombre !== "string" ||
      !plato.nombre.trim() ||
      plato.nombre.length > 60 ||
      typeof plato.descripcion !== "string" ||
      plato.descripcion.length > 140 ||
      ids.has(String(plato.id))
    ) {
      throw new Error(
        "Revisá el catálogo: cada plato necesita un id único, nombre y descripción válidos.",
      );
    }
    ids.add(String(plato.id));
  }
  return platos;
}

// Catálogo de platos desde MySQL, pasando por el backend (GET /api/platos).
// Lo usa Administrar menús. Los menús iniciales siguen saliendo de los JSON
// hasta que existan /api/menus y /api/menu-platos (ver docs/4ta-entrega).
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

// Los nombres MenuDia y MenuPlato y sus relaciones están en la ficha de JS 05.
export async function cargarMenusIniciales() {
  const platos = await cargarPlatos();
  const menus = await cargarJSON("data/menus.json");
  const opciones = await cargarJSON("data/menu-platos.json");
  const feriados = await cargarJSON("data/dias-no-laborables.json");
  for (const lista of [menus, opciones, feriados]) {
    if (!Array.isArray(lista))
      throw new Error(
        "Los menús, opciones y días no laborables deben ser listas.",
      );
    const ids = new Set();
    for (const item of lista) {
      if (
        !item ||
        !["string", "number"].includes(typeof item.id) ||
        !String(item.id) ||
        ids.has(String(item.id))
      )
        throw new Error(
          "Cada entidad del catálogo inicial debe tener un id único.",
        );
      ids.add(String(item.id));
    }
  }
  return { platos, menus, opciones, feriados };
}
