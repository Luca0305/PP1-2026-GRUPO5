// Mis pedidos. Cada día se cierra a las 10:00 (HORA_CORTE de utils.js):
// - Confirmar: confirma los días abiertos (los cerrados sin confirmar se descartan).
// - Modificar: lleva al menú; los días cerrados quedan bloqueados.
// - Cancelar: cancela solo los días abiertos; lo ya confirmado y cerrado se conserva.
// Cada acción pide confirmación y se guarda en el navegador.

const listaPedidosEmpleado = document.querySelector('.lista-pedidos');
const emailActual = (usuarioActual() || {}).email;

const estaCerrado = (p, d) => diaCerrado(fechaDeDia(p.semana, d.dia));
const semanaEnviada = (p) => Boolean(leerLocal('consolidadosEnviados', {})[p.semana]);
const hayAbiertos = (p) => !semanaEnviada(p) && p.dias.some((d) => !estaCerrado(p, d));

function crearPedido(p) {
  const estado = p.estado.toLowerCase(); // borrador | confirmado | cancelado
  const article = document.createElement('article');
  article.className = `pedido pedido-${estado}`;
  article.dataset.id = p.id;

  const dias = p.dias.map((d) => {
    const marcas = [d.confirmado ? '✓ confirmado' : 'sin confirmar', estaCerrado(p, d) ? 'cerrado' : ''].filter(Boolean).join(', ');
    return `<li>${escapar(d.dia)} → ${escapar(d.plato)}${d.comentario ? ` <em>(${escapar(d.comentario)})</em>` : ''} <small>[${marcas}]</small></li>`;
  }).join('');

  const hayPendientes = p.dias.some((d) => !d.confirmado && !estaCerrado(p, d));
  let acciones = '';
  let nota = '';
  if (p.estado === 'Cancelado') {
    nota = 'Cancelado por el empleado.';
  } else if (semanaEnviada(p)) {
    nota = 'Semana cerrada: el consolidado ya se envió al proveedor y el pedido no se puede cambiar.';
  } else if (!hayAbiertos(p)) {
    nota = `Pedido cerrado: ya pasó el horario de corte (${HORA_CORTE}:00 hs) de todos sus días.`;
  } else {
    acciones = `${hayPendientes ? '<button type="button" class="btn-confirmar">Confirmar</button>' : ''}<button type="button" class="btn-modificar">Modificar</button><button type="button" class="btn-cancelar">Cancelar</button>`;
  }

  article.innerHTML = `
    <div class="pedido-encabezado">
      <strong class="badge estado-${estado}">${p.estado}</strong>
      <h3>${rangoSemana(p.semana)}</h3>
    </div>
    <ul class="pedido-dias">${dias}</ul>
    ${nota ? `<p class="pedido-comentario">${nota}</p>` : ''}
    ${acciones ? `<div class="pedido-acciones">${acciones}</div>` : ''}`;
  return article;
}

function dibujarPedidos() {
  const propios = obtenerPedidos()
    .filter((p) => p.email === emailActual)
    .sort((a, b) => b.semana.localeCompare(a.semana) || b.id - a.id);

  listaPedidosEmpleado.innerHTML = '';
  if (propios.length === 0) {
    listaPedidosEmpleado.innerHTML = '<p class="estado-vacio">Todavía no tenés pedidos. <a href="menu-pedido.html">Hacer mi primer pedido</a></p>';
    return;
  }
  propios.forEach((p) => listaPedidosEmpleado.appendChild(crearPedido(p)));
}

function actualizar(id, cambio) {
  const pedidos = obtenerPedidos();
  cambio(pedidos.find((p) => p.id === id));
  guardarPedidos(pedidos);
  dibujarPedidos();
}

listaPedidosEmpleado.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;

  const id = Number(boton.closest('.pedido').dataset.id);
  const pedido = obtenerPedidos().find((p) => p.id === id);
  const semana = rangoSemana(pedido.semana).toLowerCase();

  if (!hayAbiertos(pedido)) { // por si pasó la hora con la pantalla abierta
    notificarError(`Ya pasó el horario de corte (${HORA_CORTE}:00 hs). El pedido no se puede cambiar.`);
    dibujarPedidos();
    return;
  }

  const hayCerrados = pedido.dias.some((d) => estaCerrado(pedido, d));

  if (boton.classList.contains('btn-confirmar')) {
    const ok = await confirmar({
      titulo: 'Confirmar pedido',
      mensaje: `¿Confirmás los días abiertos del pedido de la ${semana}?${hayCerrados ? ' Los días ya cerrados que no estaban confirmados se descartan.' : ''} Podés modificarlo o cancelarlo hasta las ${HORA_CORTE}:00 hs de cada día.`,
      textoConfirmar: 'Sí, confirmar',
    });
    if (!ok) return;
    actualizar(id, (p) => {
      p.dias = p.dias.filter((d) => !(estaCerrado(p, d) && !d.confirmado));
      p.dias.forEach((d) => { if (!estaCerrado(p, d)) d.confirmado = true; });
      recalcularEstado(p);
    });
    notificarOk('Pedido confirmado.');
  }

  if (boton.classList.contains('btn-modificar')) {
    const ok = await confirmar({
      titulo: 'Modificar pedido',
      mensaje: `¿Querés modificar el pedido de la ${semana}? Vas a ir al menú con tu elección cargada. Los días que cambies vuelven a estar sin confirmar.`,
      textoConfirmar: 'Sí, modificar',
    });
    if (!ok) return;
    sessionStorage.setItem('editarSemana', pedido.semana);
    window.location.href = 'menu-pedido.html';
  }

  if (boton.classList.contains('btn-cancelar')) {
    const ok = await confirmar({
      titulo: 'Cancelar pedido',
      mensaje: `¿Seguro que querés cancelar el pedido de la ${semana}?${hayCerrados ? ' Solo se cancelan los días que siguen abiertos; los ya cerrados y confirmados se mantienen.' : ''} Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, cancelar pedido',
      textoCancelar: 'No, volver',
    });
    if (!ok) return;
    actualizar(id, (p) => {
      const quedan = p.dias.filter((d) => estaCerrado(p, d) && d.confirmado);
      if (quedan.length === 0) {
        p.estado = 'Cancelado';
      } else {
        p.dias = quedan;
        recalcularEstado(p);
      }
    });
    notificarOk('Pedido cancelado.');
  }
});

dibujarPedidos();
