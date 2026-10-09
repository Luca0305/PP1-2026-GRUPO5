// Utilidades compartidas por todas las pantallas.
// Se carga ANTES que el JS propio de cada pantalla.

// ── Notificaciones (mismo estilo de error en todo el sistema) ──
function notificar(mensaje, tipo = 'error') {
  let contenedor = document.getElementById('toast-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toast-container';
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement('p');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => toast.remove(), 4500);
}

function notificarError(mensaje) { notificar(mensaje, 'error'); }
function notificarOk(mensaje) { notificar(mensaje, 'ok'); }

// ── Diálogo de confirmación: devuelve una promesa true / false ──
function confirmar({ titulo, mensaje, textoConfirmar = 'Confirmar', textoCancelar = 'Volver' }) {
  return new Promise((resolver) => {
    const dialogo = document.createElement('dialog');
    dialogo.className = 'dialogo-confirmar';
    dialogo.innerHTML = `
      <h3></h3>
      <p></p>
      <div class="dialogo-acciones">
        <button type="button" class="btn-secondary" data-valor="false"></button>
        <button type="button" class="btn-primary" data-valor="true"></button>
      </div>
    `;
    dialogo.querySelector('h3').textContent = titulo;
    dialogo.querySelector('p').textContent = mensaje;
    dialogo.querySelector('[data-valor="false"]').textContent = textoCancelar;
    dialogo.querySelector('[data-valor="true"]').textContent = textoConfirmar;

    dialogo.addEventListener('click', (e) => {
      const valor = e.target.dataset && e.target.dataset.valor;
      if (valor === undefined) return;
      dialogo.close();
      dialogo.remove();
      resolver(valor === 'true');
    });
    dialogo.addEventListener('cancel', () => { // tecla Esc
      dialogo.remove();
      resolver(false);
    });

    document.body.appendChild(dialogo);
    dialogo.showModal();
  });
}

// ── Validación de email y contraseña ──
function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

const REGLAS_PASSWORD = [
  { id: 'largo',   texto: 'Mínimo 8 caracteres',        cumple: (p) => p.length >= 8 },
  { id: 'mayus',   texto: 'Una letra mayúscula',        cumple: (p) => /[A-Z]/.test(p) },
  { id: 'minus',   texto: 'Una letra minúscula',        cumple: (p) => /[a-z]/.test(p) },
  { id: 'numero',  texto: 'Un número',                  cumple: (p) => /[0-9]/.test(p) },
  { id: 'simbolo', texto: 'Un símbolo (ej: ! @ # $ %)', cumple: (p) => /[^A-Za-z0-9\s]/.test(p) },
];

// Devuelve la lista de reglas que NO se cumplen (vacía = contraseña válida)
function reglasFaltantes(password) {
  return REGLAS_PASSWORD.filter((regla) => !regla.cumple(password));
}

// Fortaleza según cuántas reglas se cumplen: Débil / Media / Fuerte
function fortalezaPassword(password) {
  if (!password) return null;
  const cumplidas = REGLAS_PASSWORD.length - reglasFaltantes(password).length;
  if (cumplidas <= 2) return { nivel: 'debil', texto: 'Débil' };
  if (cumplidas <= 4) return { nivel: 'media', texto: 'Media' };
  return { nivel: 'fuerte', texto: 'Fuerte' };
}

// ── Fechas ──
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio.slice(2)}`;
}

// ── Fechas y semanas (compartido) ──
const ORDEN_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

function claveDia(dia) {
  return dia.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function aISO(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

function sumarDias(fechaISO, dias) {
  const f = new Date(fechaISO + 'T00:00:00');
  f.setDate(f.getDate() + dias);
  return aISO(f);
}

// Lunes (YYYY-MM-DD) de la semana a la que pertenece una fecha
function lunesDe(fechaISO) {
  const f = new Date(fechaISO + 'T00:00:00');
  f.setDate(f.getDate() - ((f.getDay() + 6) % 7));
  return aISO(f);
}

function rangoSemana(lunesISO) {
  return `Semana del ${formatearFecha(lunesISO)} al ${formatearFecha(sumarDias(lunesISO, 4))}`;
}

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Almacenamiento en el navegador (simula el backend hasta tenerlo) ──
function leerLocal(clave, porDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : porDefecto;
  } catch (e) {
    return porDefecto;
  }
}

function guardarLocal(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (e) {
    notificarError('No se pudo guardar la información en este navegador.');
    return false;
  }
}

// Cuentas de prueba (solo para la demo, sin backend)
const USUARIOS_DEMO = [
  { nombre: 'Administrador', email: 'admin@empresa.com', password: 'Admin#2026', rol: 'admin' },
  { nombre: 'Empleado de Prueba', email: 'empleado@empresa.com', password: 'Empleado#2026', rol: 'empleado' },
];

function obtenerUsuarios() {
  const guardados = leerLocal('usuarios', null);
  if (guardados) return guardados;
  guardarLocal('usuarios', USUARIOS_DEMO);
  return USUARIOS_DEMO.slice();
}

function guardarUsuarios(lista) { return guardarLocal('usuarios', lista); }
function obtenerPedidos() { return leerLocal('pedidos', []).map(normalizarPedido); }
function guardarPedidos(lista) { return guardarLocal('pedidos', lista); }

// ── Sesión ──
function usuarioActual() { return leerLocal('sesion', null); }

function iniciarSesion(usuario) {
  return guardarLocal('sesion', { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
}

function cerrarSesion() {
  try { localStorage.removeItem('sesion'); } catch (e) { /* sin acción */ }
  window.location.href = 'login.html';
}

// Protege la pantalla según <body data-rol="empleado|admin"> y completa nombre / cerrar sesión
function iniciarPagina() {
  const rolRequerido = document.body.dataset.rol;
  let sesion = usuarioActual();

  if (sesion) {
    const cuenta = obtenerUsuarios().find((u) => u.email === sesion.email);
    if (!cuenta || cuenta.activo === false) {
      try { localStorage.removeItem('sesion'); } catch (e) { /* sin acción */ }
      sessionStorage.setItem('aviso', 'Tu cuenta fue desactivada. Consultá con el administrador.');
      if (rolRequerido) { window.location.href = 'login.html'; return; }
      sesion = null;
    } else if (cuenta.rol !== sesion.rol || cuenta.nombre !== sesion.nombre) {
      iniciarSesion(cuenta); // el administrador cambió el rol o el nombre
      sesion = usuarioActual();
    }
  }

  if (rolRequerido && !sesion) {
    sessionStorage.setItem('aviso', 'Iniciá sesión para continuar.');
    window.location.href = 'login.html';
    return;
  }
  if (rolRequerido && sesion.rol !== rolRequerido) {
    sessionStorage.setItem('aviso', 'Tu cuenta no tiene acceso a esa pantalla.');
    window.location.href = 'index.html';
    return;
  }

  document.querySelectorAll('[data-usuario]').forEach((el) => { el.textContent = sesion ? sesion.nombre : ''; });
  document.querySelectorAll('[data-logout]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); cerrarSesion(); });
  });

  const aviso = sessionStorage.getItem('aviso');
  if (aviso) {
    sessionStorage.removeItem('aviso');
    notificarError(aviso);
  }
}

iniciarPagina();

// ── Menús: platos.json (base publicada) + menús que publica el administrador ──
function obtenerMenusAdmin() { return leerLocal('menusAdmin', {}); }
function guardarMenusAdmin(menus) { return guardarLocal('menusAdmin', menus); }

function platosDeMenuAdmin(lunes, menu) {
  const lista = [];
  ORDEN_DIAS.forEach((dia, i) => {
    (menu.dias[dia] || []).forEach((o, n) => {
      const etiquetas = [o.vegetariano ? 'Vegetariano' : '', o.sinTacc ? 'Sin TACC' : ''].filter(Boolean).join(' · ');
      lista.push({
        id: `m-${lunes}-${claveDia(dia)}-${n}`,
        dia,
        fecha: sumarDias(lunes, i),
        nombre: o.nombre,
        descripcion: [o.descripcion, etiquetas].filter(Boolean).join(' · '),
      });
    });
  });
  return lista;
}

// Una semana publicada por el admin reemplaza a la de platos.json; los borradores no se ven
function combinarPlatos(base) {
  const admin = obtenerMenusAdmin();
  const publicadas = Object.keys(admin).filter((l) => admin[l].estado === 'Publicado');
  const resultado = base.filter((p) => !publicadas.includes(lunesDe(p.fecha)));
  publicadas.forEach((l) => resultado.push(...platosDeMenuAdmin(l, admin[l])));
  return resultado;
}

// ── Horario de corte: cada día se cierra a las 10:00 de ese mismo día ──
const HORA_CORTE = 10;

function diaCerrado(fechaISO, ahora = new Date()) {
  const hoy = aISO(ahora);
  return fechaISO < hoy || (fechaISO === hoy && ahora.getHours() >= HORA_CORTE);
}

function fechaDeDia(lunes, dia) { return sumarDias(lunes, ORDEN_DIAS.indexOf(dia)); }

// ── Pedidos: cada día queda "confirmado" o pendiente; el estado del pedido se deduce de eso ──
function normalizarPedido(p) {
  p.dias.forEach((d) => { if (d.confirmado === undefined) d.confirmado = p.estado === 'Confirmado'; });
  return p;
}

function recalcularEstado(p) {
  if (p.estado !== 'Cancelado') p.estado = p.dias.every((d) => d.confirmado) ? 'Confirmado' : 'Borrador';
  return p;
}

// ── Datos de ejemplo: las semanas de los JSON se ubican siempre alrededor de hoy ──
// (fin de semana -> la semana base es la que viene)
function lunesBase(hoy = new Date()) {
  const lunes = lunesDe(aISO(hoy));
  return ((hoy.getDay() + 6) % 7) >= 5 ? sumarDias(lunes, 7) : lunes;
}

function reubicar(lista, semanaInicial = 0) {
  const semanas = [...new Set(lista.map((x) => lunesDe(x.fecha)))].sort();
  const base = lunesBase();
  return lista.map((x) => {
    const origen = lunesDe(x.fecha);
    const diaSemana = Math.round((new Date(x.fecha + 'T00:00:00') - new Date(origen + 'T00:00:00')) / 86400000);
    return { ...x, fecha: sumarDias(base, 7 * (semanaInicial + semanas.indexOf(origen)) + diaSemana) };
  });
}

async function cargarPlatosBase() {
  const respuesta = await fetch('data/platos.json');
  if (!respuesta.ok) throw new Error('Respuesta no exitosa del servidor');
  return reubicar(await respuesta.json());
}

// Feriados: lo que guardó el administrador (si todavía es vigente) o data/feriados.json
async function traerFeriados() {
  const guardados = leerLocal('feriados', null);
  if (guardados && guardados.some((f) => f.fecha >= lunesBase())) return guardados;
  try {
    const respuesta = await fetch('data/feriados.json');
    return respuesta.ok ? reubicar(await respuesta.json(), 1) : [];
  } catch (e) {
    return [];
  }
}
