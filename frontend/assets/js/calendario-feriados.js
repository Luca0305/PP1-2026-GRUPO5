// Pantalla administrativa: calendario de feriados.
// Los cambios se guardan en el navegador (hasta tener backend) y usan utils.js.

const contenedorDias = document.getElementById('days-grid-contenido');
const estadoCalendario = document.getElementById('calendario-estado');
const btnNacionales = document.getElementById('btn-nacionales');

// Feriados nacionales de fecha fija (mes-día)
const FERIADOS_NACIONALES = {
  '01-01': 'Año Nuevo', '03-24': 'Día de la Memoria', '04-02': 'Día del Veterano de Malvinas',
  '05-01': 'Día del Trabajador', '05-25': 'Revolución de Mayo', '06-20': 'Paso a la Inmortalidad del Gral. Belgrano',
  '07-09': 'Día de la Independencia', '08-17': 'Paso a la Inmortalidad del Gral. San Martín',
  '10-12': 'Día del Respeto a la Diversidad Cultural', '11-20': 'Día de la Soberanía Nacional',
  '12-08': 'Inmaculada Concepción', '12-25': 'Navidad',
};
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

let dias = [];

function mostrarEstado(mensaje, esError = false) {
  estadoCalendario.textContent = mensaje;
  estadoCalendario.hidden = false;
  estadoCalendario.classList.toggle('estado-error', esError);
  contenedorDias.hidden = true;
}

function ocultarEstado() {
  estadoCalendario.hidden = true;
  estadoCalendario.textContent = '';
  estadoCalendario.classList.remove('estado-error');
  contenedorDias.hidden = false;
}

async function cargarFeriados() {
  mostrarEstado('Cargando el calendario…');

  try {
    dias = await traerFeriados();

    if (dias.length === 0) {
      mostrarEstado('Todavía no hay días cargados para este mes.');
      return;
    }

    dibujarDias();
    ocultarEstado();
  } catch (error) {
    mostrarEstado('No se pudo cargar el calendario. Intentá de nuevo más tarde.', true);
    notificarError('No se pudo cargar el calendario. Intentá de nuevo más tarde.');
  }
}

function dibujarDias() {
  const mesIni = Number(dias[0].fecha.slice(5, 7)) - 1;
  const mesFin = Number(dias[dias.length - 1].fecha.slice(5, 7)) - 1;
  document.querySelector('.mes-actual').textContent = `${MESES[mesIni]}${mesFin !== mesIni ? ' / ' + MESES[mesFin] : ''} ${dias[0].fecha.slice(0, 4)}`;
  contenedorDias.innerHTML = '';
  dias.forEach((dia) => contenedorDias.appendChild(crearTarjetaDia(dia)));
}

function crearTarjetaDia(dia) {
  const card = document.createElement('div');
  card.className = dia.feriado ? 'day-card holiday' : 'day-card';

  const header = document.createElement('div');
  header.className = 'day-header';

  const nombre = document.createElement('h3');
  nombre.className = 'day-name';
  nombre.textContent = dia.dia;

  const badge = document.createElement('span');
  badge.className = dia.feriado ? 'badge badge-feriado' : 'badge badge-habil';
  badge.textContent = dia.feriado ? 'Feriado' : 'Día hábil';

  header.append(nombre, badge);

  const fecha = document.createElement('div');
  fecha.className = 'day-date';
  fecha.textContent = formatearFecha(dia.fecha);

  const motivo = document.createElement('input');
  motivo.type = 'text';
  motivo.className = 'input-motivo';
  motivo.placeholder = 'Motivo del feriado...';
  motivo.value = dia.motivo || '';
  motivo.disabled = !dia.feriado;
  motivo.addEventListener('change', async () => {
    dia.motivo = motivo.value.trim();
    await guardarCambioFeriado(dia);
  });

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn-action';
  boton.textContent = dia.feriado ? 'Desmarcar feriado' : '+ Marcar como feriado';
  boton.addEventListener('click', () => alternarFeriado(dia.id));

  card.append(header, fecha, motivo, boton);
  return card;
}

async function alternarFeriado(id) {
  const dia = dias.find((d) => d.id === id);
  if (!dia) return;

  if (dia.feriado) {
    const ok = await confirmar({
      titulo: 'Desmarcar feriado',
      mensaje: `¿Volver a habilitar el ${dia.dia.toLowerCase()} ${formatearFecha(dia.fecha)}? Ese día se va a poder publicar menú y recibir pedidos.`,
      textoConfirmar: 'Sí, desmarcar',
    });
    if (!ok) return;
    dia.feriado = false;
    dia.motivo = '';
  } else {
    dia.feriado = true;
  }

  await guardarCambioFeriado(dia);
  dibujarDias();
  notificarOk(dia.feriado
    ? `${dia.dia} ${formatearFecha(dia.fecha)} marcado como feriado. Escribí el motivo.`
    : `${dia.dia} ${formatearFecha(dia.fecha)} vuelve a ser día hábil.`);
}

// Hoy se guarda en el navegador; con backend esto pasa a ser un fetch con PUT.
async function guardarCambioFeriado() {
  guardarLocal('feriados', dias);
}

btnNacionales.addEventListener('click', async () => {
  let nuevos = 0;
  dias.forEach((dia) => {
    const motivo = FERIADOS_NACIONALES[dia.fecha.slice(5)];
    if (motivo && !dia.feriado) {
      dia.feriado = true;
      dia.motivo = motivo;
      nuevos += 1;
    }
  });

  if (nuevos === 0) {
    notificarOk('Los feriados nacionales de este mes ya estaban cargados.');
    return;
  }
  await guardarCambioFeriado();
  dibujarDias();
  notificarOk(`Se cargaron ${nuevos} feriado(s) nacional(es).`);
});

cargarFeriados();
