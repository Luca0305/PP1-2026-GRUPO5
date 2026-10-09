// Consolidado semanal para el proveedor, calculado con los pedidos CONFIRMADOS
// de todos los empleados: cantidad por plato y nombre de quien pidió cada restricción.

const cuerpo = document.getElementById('consolidado-cuerpo');
const total = document.getElementById('consolidado-total');
const labelSem = document.getElementById('semana-label');
const btnPrev = document.getElementById('semana-anterior');
const btnNext = document.getElementById('semana-siguiente');
const btnEnviar = document.getElementById('btn-enviar');
const estadoEnvio = document.getElementById('envio-estado');
const btnPdf = document.getElementById('btn-pdf');

let confirmados = [];
let semanasConsolidado = [];
let indice = 0;

function cargarDatos() {
  confirmados = obtenerPedidos().filter((p) => p.estado !== 'Cancelado' && p.dias.some((d) => d.confirmado));
  semanasConsolidado = [...new Set(confirmados.map((p) => p.semana))].sort();
  indice = Math.min(indice, Math.max(semanasConsolidado.length - 1, 0));
}

// { Lunes: { 'Milanesa': { cantidad, restricciones: [{nombre, detalle}] } } }
function agruparSemana(lunes) {
  const porDia = {};
  confirmados.filter((p) => p.semana === lunes).forEach((pedido) => {
    pedido.dias.filter((d) => d.confirmado).forEach((d) => {
      porDia[d.dia] = porDia[d.dia] || {};
      const fila = porDia[d.dia][d.plato] = porDia[d.dia][d.plato] || { cantidad: 0, restricciones: [] };
      fila.cantidad += 1;
      if (d.comentario) fila.restricciones.push({ nombre: pedido.usuario, detalle: d.comentario });
    });
  });
  return porDia;
}

function dibujar() {
  cuerpo.innerHTML = '';
  const hayDatos = semanasConsolidado.length > 0;
  btnEnviar.disabled = !hayDatos;
  estadoEnvio.textContent = '';
  btnPdf.disabled = !hayDatos;

  if (!hayDatos) {
    labelSem.textContent = 'Sin pedidos confirmados';
    btnPrev.disabled = true;
    btnNext.disabled = true;
    total.textContent = 0;
    cuerpo.innerHTML = '<tr><td colspan="3">Todavía no hay pedidos confirmados por los empleados.</td></tr>';
    return;
  }

  const lunes = semanasConsolidado[indice];
  labelSem.textContent = rangoSemana(lunes);
  btnPrev.disabled = indice === 0;
  btnNext.disabled = indice === semanasConsolidado.length - 1;

  const enviado = leerLocal('consolidadosEnviados', {})[lunes];
  btnEnviar.disabled = Boolean(enviado);
  btnEnviar.textContent = enviado ? 'Enviado ✓' : 'Enviar al Proveedor';
  estadoEnvio.textContent = enviado ? `Enviado el ${new Date(enviado).toLocaleString('es-AR')}` : 'Todavía no enviado';

  const porDia = agruparSemana(lunes);
  let suma = 0;

  ORDEN_DIAS.filter((dia) => porDia[dia]).forEach((dia) => {
    cuerpo.insertAdjacentHTML('beforeend', `<tr class="fila-dia"><td colspan="3">${dia}</td></tr>`);

    Object.entries(porDia[dia]).forEach(([plato, datos]) => {
      suma += datos.cantidad;
      const restricciones = datos.restricciones.length
        ? `<ul class="restriccion">${datos.restricciones.map((r) => `<li>${escapar(r.nombre)}: ${escapar(r.detalle)}</li>`).join('')}</ul>`
        : '—';
      cuerpo.insertAdjacentHTML('beforeend', `<tr><td>${escapar(plato)}</td><td>${datos.cantidad}</td><td>${restricciones}</td></tr>`);
    });
  });

  total.textContent = suma;
}

btnPrev.addEventListener('click', () => { indice -= 1; dibujar(); });
btnNext.addEventListener('click', () => { indice += 1; dibujar(); });
btnPdf.addEventListener('click', () => window.print());

btnEnviar.addEventListener('click', async () => {
  const ok = await confirmar({
    titulo: 'Enviar al proveedor',
    mensaje: `¿Enviar el consolidado de la ${labelSem.textContent.toLowerCase()} al proveedor? Después no se puede volver a enviar.`,
    textoConfirmar: 'Sí, enviar',
  });
  if (!ok) return;
  const envios = leerLocal('consolidadosEnviados', {});
  envios[semanasConsolidado[indice]] = new Date().toISOString();
  guardarLocal('consolidadosEnviados', envios);
  dibujar();
  notificarOk('Consolidado enviado al proveedor.');
});

cargarDatos();
dibujar();
