// Única puerta del frontend al backend Spring Boot (4ta entrega).
// Cada pantalla de M1–M5 pide sus datos con estas funciones: ya no lee los JSON de data/.
import { API } from "./datos.js";

// Pide una ruta del backend y devuelve el JSON. Si el backend responde con error,
// lanza un Error con el "mensaje" que armó ManejadorDeErrores (400, 401, 404, 409).
export async function pedir(ruta, { metodo = "GET", cuerpo } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      method: metodo,
      cache: "no-store",
      headers: cuerpo === undefined ? {} : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Revisá que el backend esté iniciado y reintentá.",
    );
  }
  // 204 No Content (por ejemplo, al quitar un día): no hay cuerpo que leer.
  if (respuesta.status === 204) return null;
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    // El cuerpo vino vacío o no es JSON: se informa con el código HTTP.
  }
  if (!respuesta.ok)
    throw new Error(
      datos?.mensaje || `El servidor respondió con un error (HTTP ${respuesta.status}).`,
    );
  return datos;
}

// Arma "?clave=valor&…" sin los valores vacíos.
export function consulta(parametros) {
  const texto = new URLSearchParams(
    Object.entries(parametros).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ).toString();
  return texto ? `?${texto}` : "";
}

// ── Atajos por recurso: los nombres de los endpoints son los de la tabla de traducción ──
export const api = {
  // M1 · Acceso
  registrar: (datos) => pedir("/auth/registro", { metodo: "POST", cuerpo: datos }),
  ingresar: (correo, contrasena) =>
    pedir("/auth/login", { metodo: "POST", cuerpo: { correo, contrasena } }),
  // M1 · Recuperar contraseña
  recuperar: (correo) => pedir("/auth/recuperar", { metodo: "POST", cuerpo: { correo } }),
  validarEnlace: (token) => pedir(`/auth/recuperar/${encodeURIComponent(token)}`),
  restablecer: (token, contrasena) =>
    pedir("/auth/restablecer", { metodo: "POST", cuerpo: { token, contrasena } }),
  // Mi perfil
  actualizarPerfil: (idUsuario, datos) =>
    pedir(`/usuarios/${idUsuario}/perfil`, { metodo: "PUT", cuerpo: datos }),
  // Usuarios (administrador)
  usuarios: (idUsuario) => pedir(`/usuarios${consulta({ idUsuario })}`),
  autorizarUsuario: (datos) => pedir("/usuarios", { metodo: "POST", cuerpo: datos }),
  editarUsuario: (id, datos) => pedir(`/usuarios/${id}`, { metodo: "PUT", cuerpo: datos }),
  cambiarActivo: (id, idAdministrador, activo) =>
    pedir(`/usuarios/${id}/activo`, { metodo: "PUT", cuerpo: { idAdministrador, activo } }),
  // Días sin servicio (administrador)
  guardarDiaNoLaborable: (idUsuario, fecha, motivo) =>
    pedir("/dias-no-laborables", { metodo: "POST", cuerpo: { idUsuario, fecha, motivo } }),
  habilitarDia: (id, idUsuario) =>
    pedir(`/dias-no-laborables/${id}${consulta({ idUsuario })}`, { metodo: "DELETE" }),
  // Administrar menús (administrador)
  menusAdmin: (idUsuario, desde, hasta) => pedir(`/menus/admin${consulta({ idUsuario, desde, hasta })}`),
  guardarSemanaMenu: (datos) => pedir("/menus/semana", { metodo: "PUT", cuerpo: datos }),
  // M2 · Mis días
  diasNoLaborables: (desde, hasta) => pedir(`/dias-no-laborables${consulta({ desde, hasta })}`),
  asistencias: (idUsuario, desde, hasta) =>
    pedir(`/asistencias${consulta({ idUsuario, desde, hasta })}`),
  guardarSemana: (idUsuario, semana, fechas) =>
    pedir("/asistencias/semana", { metodo: "PUT", cuerpo: { idUsuario, semana, fechas } }),
  // M3 · Mis menús
  menus: (desde, hasta) => pedir(`/menus${consulta({ desde, hasta })}`),
  // M4 · Mi pedido
  pedidos: (idUsuario) => pedir(`/pedidos${consulta({ idUsuario })}`),
  guardarDia: (idUsuario, idMenuDia, idPlato, comentario) =>
    pedir("/pedidos", { metodo: "POST", cuerpo: { idUsuario, idMenuDia, idPlato, comentario } }),
  confirmar: (idPedido, idUsuario) =>
    pedir(`/pedidos/${idPedido}/confirmar${consulta({ idUsuario })}`, { metodo: "PUT" }),
  cancelar: (idPedido, idUsuario) =>
    pedir(`/pedidos/${idPedido}/cancelar${consulta({ idUsuario })}`, { metodo: "PUT" }),
  quitarDia: (idPedido, idDia, idUsuario) =>
    pedir(`/pedidos/${idPedido}/dias/${idDia}${consulta({ idUsuario })}`, { metodo: "DELETE" }),
  // Mejora · pedido fuera de horario (solo administrador)
  empleados: (idUsuario) => pedir(`/usuarios/empleados${consulta({ idUsuario })}`),
  cargarFueraDeHorario: (datos) =>
    pedir("/pedidos/fuera-de-horario", { metodo: "POST", cuerpo: datos }),
  // M5 · Consolidado
  consolidado: (idUsuario, desde, hasta) =>
    pedir(`/consolidado${consulta({ idUsuario, desde, hasta })}`),
  detalleConsolidado: (idUsuario, desde, hasta) =>
    pedir(`/consolidado/detalle${consulta({ idUsuario, desde, hasta })}`),
};

// Estados del modelo (BORRADOR…) → texto y clase CSS que ya usaba el frontend.
export const ESTADOS = {
  BORRADOR: "Borrador",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
};
export const estadoTexto = (estado) => ESTADOS[estado] || estado;
