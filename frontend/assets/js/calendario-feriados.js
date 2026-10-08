// Capacidad 5 — Calendario de feriados (Administrador)
// CU cubierto: sin CU propio en E1 (gap detectado y aceptado por el grupo)

const contenedorDias = document.getElementById('days-grid-contenido');
const estadoCalendario = document.getElementById('calendario-estado');

const MAX_MOTIVO = 80;

let dias = []; // en memoria — el 05/11 esto se reemplaza por el backend

// ── Estados de interfaz ──

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

// ── Traer y dibujar los días ──

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

function crearEncabezadoDia(dia) {
  const header = document.createElement('div');
  header.className = 'day-header';

  const nombre = document.createElement('h3');
  nombre.className = 'day-name';
  nombre.textContent = dia.dia;

  const badge = document.createElement('span');
  badge.className = dia.feriado ? 'badge badge-feriado' : 'badge badge-habil';
  badge.textContent = dia.feriado ? 'Feriado' : 'Día hábil';

  header.append(nombre, badge);
  return header;
}

function crearFechaDia(dia) {
  const fecha = document.createElement('div');
  fecha.className = 'day-date';
  fecha.textContent = formatearFecha(dia.fecha);
  return fecha;
}

function crearCampoMotivo(dia) {
  const motivo = document.createElement('input');
  motivo.type = 'text';
  motivo.className = 'input-motivo';
  motivo.placeholder = 'Motivo del feriado...';
  motivo.maxLength = MAX_MOTIVO;
  motivo.value = dia.motivo;
  motivo.disabled = !dia.feriado;

  // El motivo se guarda al terminar de editarlo, no en cada tecla.
  motivo.addEventListener('change', async () => {
    await guardarFeriado(dia.id, { motivo: motivo.value.trim() });
  });

  return motivo;
}

function crearBotonFeriado(dia) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn-action';
  boton.textContent = dia.feriado ? 'Desmarcar feriado' : '+ Marcar como feriado';
  boton.addEventListener('click', () => alternarFeriado(dia.id));
  return boton;
}

function crearTarjetaDia(dia) {
  const card = document.createElement('div');
  card.className = dia.feriado ? 'day-card holiday' : 'day-card';
  card.append(
    crearEncabezadoDia(dia),
    crearFechaDia(dia),
    crearCampoMotivo(dia),
    crearBotonFeriado(dia)
  );
  return card;
}

// ── Acción del usuario: marcar / desmarcar feriado ──

async function alternarFeriado(id) {
  const dia = dias.find((d) => d.id === id);
  if (!dia) return;

  const cambios = { feriado: !dia.feriado };
  if (!cambios.feriado) cambios.motivo = ''; // al desmarcar se borra el motivo

  try {
    await guardarFeriado(id, cambios);
    dibujarDias();
  } catch (error) {
    mostrarEstado('No se pudo guardar el cambio. Intentá de nuevo.', true);
  }
}

// Único punto donde se modifican los datos: aplica los cambios al día.
// Hoy escribe en el array en memoria; el 05/11 pasa a ser un PATCH al backend.
async function guardarFeriado(id, cambios) {
  const dia = dias.find((d) => d.id === id);
  if (!dia) throw new Error(`No existe el día ${id}`);
  Object.assign(dia, cambios);
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}

cargarFeriados();
