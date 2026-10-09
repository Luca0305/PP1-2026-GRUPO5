// Menú + Registrar pedido (CU-02 y CU-03).
// - Trae data/platos.json y dibuja solo los días en que el empleado asiste.
// - Navegación semana a semana sin perder lo elegido.
// - Un comentario por día. El pedido se guarda como Borrador (uno por semana).
// Usa utils.js para avisos, sesión y almacenamiento.

const contenedorMenu = document.getElementById('menu-semana-contenido');
const estadoMenu = document.getElementById('menu-estado');
const form = document.getElementById('form-pedido');
const listaPedidos = document.getElementById('pedidos-lista');
const btnAnterior = document.getElementById('semana-anterior');
const btnSiguiente = document.getElementById('semana-siguiente');
const labelSemana = document.getElementById('semana-label');

const sesion = usuarioActual() || {};
const diasAsistencia = leerLocal(`asistencia:${sesion.email}`, []);

let platos = [];
let feriados = [];
let semanas = [];
let semanaActual = 0;
const borradores = {}; // selección en curso por semana: { lunes: { Lunes: { platoId, comentario } } }

function semanaCerrada(lunes) {
  return Boolean(leerLocal('consolidadosEnviados', {})[lunes]);
}

// ── Estados de interfaz ──

function mostrarEstado(mensaje, esError = false, html = false) {
  if (html) estadoMenu.innerHTML = mensaje; else estadoMenu.textContent = mensaje;
  estadoMenu.hidden = false;
  estadoMenu.classList.toggle('estado-error', esError);
  contenedorMenu.hidden = true;
}

function ocultarEstado() {
  estadoMenu.hidden = true;
  estadoMenu.textContent = '';
  estadoMenu.classList.remove('estado-error');
  contenedorMenu.hidden = false;
}

// ── Pedidos guardados del usuario ──

function pedidosDelUsuario() {
  return obtenerPedidos().filter((p) => p.email === sesion.email);
}

function pedidoActivoDe(lunes) {
  return pedidosDelUsuario().find((p) => p.semana === lunes && p.estado !== 'Cancelado');
}

// ── Carga del menú ──

async function cargarMenu() {
  if (diasAsistencia.length === 0) {
    mostrarEstado('Todavía no configuraste tu asistencia. <a href="asistencia.html">Ir a Mi asistencia semanal</a>', false, true);
    btnAnterior.disabled = true;
    btnSiguiente.disabled = true;
    return;
  }

  mostrarEstado('Cargando el menú…');

  try {
    platos = combinarPlatos(await cargarPlatosBase());
    feriados = await traerFeriados();

    if (platos.length === 0) {
      mostrarEstado('Todavía no hay menú publicado.');
      return;
    }

    semanas = [...new Set(platos.map((p) => lunesDe(p.fecha)))].sort();

    // Lo que ya estaba guardado vuelve a aparecer para poder modificarlo
    semanas.forEach((lunes) => {
      const guardado = pedidoActivoDe(lunes);
      if (!guardado) return;
      borradores[lunes] = {};
      guardado.dias.forEach((d) => { borradores[lunes][d.dia] = { platoId: d.platoId, comentario: d.comentario }; });
    });

    const aEditar = sessionStorage.getItem('editarSemana');
    sessionStorage.removeItem('editarSemana');
    const indice = semanas.indexOf(aEditar);
    semanaActual = indice >= 0 ? indice : 0;

    mostrarSemana();
    renderPedidos();
  } catch (error) {
    mostrarEstado('No se pudo cargar el menú. Intentá de nuevo más tarde.', true);
    notificarError('No se pudo cargar el menú. Intentá de nuevo más tarde.');
  }
}

function mostrarSemana() {
  const lunes = semanas[semanaActual];
  labelSemana.textContent = rangoSemana(lunes);
  btnAnterior.disabled = semanaActual === 0;
  btnSiguiente.disabled = semanaActual === semanas.length - 1;

  dibujarMenu(platos.filter((p) => lunesDe(p.fecha) === lunes), borradores[lunes] || {});

  if (semanaCerrada(lunes)) {
    contenedorMenu.querySelectorAll('input').forEach((i) => { i.disabled = true; });
    contenedorMenu.insertAdjacentHTML('afterbegin', '<p class="estado-vacio">Semana cerrada: el consolidado ya se envió al proveedor y no se aceptan cambios.</p>');
  }
  ocultarEstado();
}

function dibujarMenu(platosSemana, seleccion) {
  contenedorMenu.innerHTML = '';
  const lunes = semanas[semanaActual];

  ORDEN_DIAS.forEach((dia, indice) => {
    if (!diasAsistencia.includes(claveDia(dia))) return; // solo días en que asiste
    const opciones = platosSemana.filter((p) => p.dia === dia);
    if (opciones.length === 0) return;

    const clave = claveDia(dia);
    const fecha = sumarDias(lunes, indice);
    const cerrado = diaCerrado(fecha);
    const guardado = seleccion[dia] || {};
    const article = document.createElement('article');
    article.innerHTML = `<h4>${dia} <time datetime="${fecha}">${formatearFecha(fecha)}</time></h4>`;

    const feriado = feriados.find((f) => f.fecha === fecha && f.feriado);
    if (feriado) {
      article.innerHTML += `<p class="estado-vacio">Feriado${feriado.motivo ? `: ${escapar(feriado.motivo)}` : ''}. No hay servicio ni pedidos este día.</p>`;
      contenedorMenu.appendChild(article);
      return;
    }

    if (cerrado) {
      article.innerHTML += `<p class="estado-vacio">Cerrado: pasó el horario de corte (${HORA_CORTE}:00 hs).</p>`;
    }

    opciones.forEach((plato) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="${clave}" value="${plato.id}" ${guardado.platoId === plato.id ? 'checked' : ''} ${cerrado ? 'disabled' : ''}>
        ${escapar(plato.nombre)}
        <em>${escapar(plato.descripcion)}</em>`;
      article.appendChild(label);
    });

    const comentario = document.createElement('input');
    comentario.type = 'text';
    comentario.name = `comentario-${clave}`;
    comentario.className = 'comentario-dia';
    comentario.maxLength = 200;
    comentario.disabled = cerrado;
    comentario.placeholder = 'Comentario (opcional): sin sal…';
    comentario.value = guardado.comentario || '';
    article.appendChild(comentario);
    contenedorMenu.appendChild(article);
  });

  if (!contenedorMenu.children.length) {
    contenedorMenu.innerHTML = '<p>Ninguno de tus días de asistencia tiene menú publicado esta semana.</p>';
  }
}

// Lee directo del DOM (así también cuenta lo elegido en días cerrados, que están deshabilitados)
function leerSeleccionDePantalla() {
  const seleccion = {};
  ORDEN_DIAS.forEach((dia) => {
    const clave = claveDia(dia);
    const radio = form.querySelector(`input[name="${clave}"]:checked`);
    const campo = form.querySelector(`input[name="comentario-${clave}"]`);
    const platoId = radio ? radio.value : '';
    const comentario = campo ? campo.value.trim() : '';
    if (platoId || comentario) seleccion[dia] = { platoId, comentario };
  });
  return seleccion;
}

function cambiarSemana(delta) {
  borradores[semanas[semanaActual]] = leerSeleccionDePantalla(); // no se pierde lo elegido
  semanaActual += delta;
  mostrarSemana();
}

btnAnterior.addEventListener('click', () => cambiarSemana(-1));
btnSiguiente.addEventListener('click', () => cambiarSemana(1));

// ── Guardar el pedido ──

async function guardarPedido(pedido) {
  const pedidos = obtenerPedidos().filter((p) => !(p.email === pedido.email && p.semana === pedido.semana && p.estado !== 'Cancelado'));
  pedidos.push(pedido);
  return guardarPedidos(pedidos);
}

function renderPedidos() {
  listaPedidos.innerHTML = '';
  const activos = pedidosDelUsuario().filter((p) => p.estado !== 'Cancelado').sort((a, b) => a.semana.localeCompare(b.semana));

  if (activos.length === 0) {
    listaPedidos.innerHTML = '<li>Todavía no guardaste ningún pedido.</li>';
    return;
  }
  activos.forEach((p) => {
    const li = document.createElement('li');
    const detalle = p.dias.map((d) => `${d.dia}: ${d.plato}${d.comentario ? ` (${d.comentario})` : ''}`).join(' | ');
    li.textContent = `${rangoSemana(p.semana)} — ${p.estado} — ${detalle}`;
    listaPedidos.appendChild(li);
  });
}

// Un día sigue confirmado solo si no cambió el plato ni el comentario
function marcarConfirmados(lunes, dias) {
  const previo = pedidoActivoDe(lunes);
  return dias.map((d) => {
    const antes = previo && previo.dias.find((x) => x.dia === d.dia);
    return { ...d, confirmado: Boolean(antes && antes.confirmado && antes.platoId === d.platoId && antes.comentario === d.comentario) };
  });
}

function armarDias(seleccion) {
  return ORDEN_DIAS.filter((dia) => seleccion[dia] && seleccion[dia].platoId && platos.some((p) => p.id === seleccion[dia].platoId)).map((dia) => ({
    dia,
    platoId: seleccion[dia].platoId,
    plato: platos.find((p) => p.id === seleccion[dia].platoId).nombre,
    comentario: seleccion[dia].comentario,
  }));
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (semanas.length === 0) {
    notificarError('No hay menú disponible para pedir.');
    return;
  }

  borradores[semanas[semanaActual]] = leerSeleccionDePantalla();

  // Se guardan todas las semanas en las que el empleado eligió algo
  const nuevos = [];
  for (const lunes of semanas) {
    if (semanaCerrada(lunes)) continue; // semanas ya enviadas al proveedor
    const seleccion = borradores[lunes] || {};
    const sinPlato = Object.keys(seleccion).find((dia) => !seleccion[dia].platoId);
    if (sinPlato) {
      notificarError(`${rangoSemana(lunes)}: escribiste un comentario para el ${sinPlato.toLowerCase()} pero no elegiste un plato.`);
      return;
    }
    // los días cerrados que no estaban confirmados no llegaron a tiempo y se descartan
    const dias = marcarConfirmados(lunes, armarDias(seleccion))
      .filter((d) => !(diaCerrado(fechaDeDia(lunes, d.dia)) && !d.confirmado));
    if (dias.length > 0) {
      nuevos.push(recalcularEstado({ id: Date.now() + nuevos.length, email: sesion.email, usuario: sesion.nombre, semana: lunes, dias, estado: 'Borrador' }));
    }
  }

  if (nuevos.length === 0) {
    notificarError(semanaCerrada(semanas[semanaActual])
      ? 'Esta semana está cerrada: el consolidado ya se envió al proveedor.'
      : 'Elegí al menos una opción antes de guardar el pedido.');
    return;
  }

  for (const pedido of nuevos) {
    if (!(await guardarPedido(pedido))) return;
  }

  renderPedidos();
  if (nuevos.every((n) => n.estado === 'Confirmado')) {
    notificarOk('Sin cambios: tu pedido sigue confirmado.');
    setTimeout(() => { window.location.href = 'mis-pedidos.html'; }, 1400);
    return;
  }
  notificarOk(nuevos.length > 1 ? `${nuevos.length} pedidos guardados como borrador. Confirmalos en Mis pedidos.` : 'Pedido guardado como borrador. Confirmalo en Mis pedidos.');
  setTimeout(() => { window.location.href = 'mis-pedidos.html'; }, 1600);
});

cargarMenu();
