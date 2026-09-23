const contenedorDias = document.getElementById('days-grid-contenido');
const estadoCalendario = document.getElementById('calendario-estado');

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
    const respuesta = await fetch('data/feriados.json');

    if (!respuesta.ok) {
      throw new Error('Respuesta no exitosa del servidor');
    }

    dias = await respuesta.json();

    if (dias.length === 0) {
      mostrarEstado('Todavía no hay días cargados para este mes.');
      return;
    }

    dibujarDias();
    ocultarEstado();
  } catch (error) {
    mostrarEstado('No se pudo cargar el calendario. Intentá de nuevo más tarde.', true);
  }
}

function dibujarDias() {
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
  motivo.addEventListener('input', () => {
    dia.motivo = motivo.value;
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

  dia.feriado = !dia.feriado;
  if (!dia.feriado) dia.motivo = '';

  await guardarCambioFeriado(dia);
  dibujarDias();
}

async function guardarCambioFeriado(dia) {
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}

cargarFeriados();