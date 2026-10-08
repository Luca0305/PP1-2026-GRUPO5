// Capacidad 2 — Listado que se dibuja desde datos (fetch a data/platos.json)
// Capacidad 3 — Acción del usuario (registrar pedido, se agrega a una lista en pantalla)
// Capacidad 4 — Estados de interfaz (cargando / vacío / error)
// CU cubiertos: CU-02 (Consultar menú semanal) y CU-03 (Registrar pedido del día)

const contenedorMenu = document.getElementById('menu-semana-contenido');
const estadoMenu = document.getElementById('menu-estado');
const form = document.getElementById('form-pedido');
const listaPedidos = document.getElementById('pedidos-lista');
const errorPedido = document.getElementById('pedido-error');

const ID_USUARIO = 1;       // hasta tener sesión real, el empleado logueado es el 1
const MAX_COMENTARIO = 200;

let platosCargados = [];
const pedidosGuardados = []; // en memoria — el 05/11 esto se reemplaza por el backend

// ── Estados de interfaz (Capacidad 4) ──

function mostrarEstado(mensaje, esError = false) {
  estadoMenu.textContent = mensaje;
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

// ── Capacidad 2 — traer y dibujar el menú ──

async function cargarMenu() {
  mostrarEstado('Cargando el menú…');

  try {
    const respuesta = await fetch('data/platos.json');

    if (!respuesta.ok) {
      throw new Error('Respuesta no exitosa del servidor');
    }

    const platos = await respuesta.json();

    if (platos.length === 0) {
      mostrarEstado('Todavía no hay menú publicado para esta semana.');
      return;
    }

    platosCargados = platos;
    dibujarMenu(platos);
    ocultarEstado();
  } catch (error) {
    mostrarEstado('No se pudo cargar el menú. Intentá de nuevo más tarde.', true);
  }
}

// Los días salen de los datos: se agrupan los platos por fecha,
// sin una lista de días escrita a mano.
function agruparPorDia(platos) {
  const grupos = [];

  platos.forEach((plato) => {
    let grupo = grupos.find((g) => g.fecha === plato.fecha);
    if (!grupo) {
      grupo = { fecha: plato.fecha, dia: plato.dia, platos: [] };
      grupos.push(grupo);
    }
    grupo.platos.push(plato);
  });

  return grupos;
}

function crearOpcionPlato(plato, nombreGrupo) {
  const label = document.createElement('label');

  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = nombreGrupo;
  radio.value = plato.id;

  const descripcion = document.createElement('em');
  descripcion.textContent = plato.descripcion;

  label.append(radio, ` ${plato.nombre} `, descripcion);
  return label;
}

function crearTarjetaDia(grupo) {
  const article = document.createElement('article');

  const titulo = document.createElement('h4');
  const hora = document.createElement('time');
  hora.dateTime = grupo.fecha;
  hora.textContent = formatearFecha(grupo.fecha);
  titulo.append(`${grupo.dia} `, hora);
  article.appendChild(titulo);

  grupo.platos.forEach((plato) => article.appendChild(crearOpcionPlato(plato, grupo.fecha)));
  return article;
}

function dibujarMenu(platos) {
  contenedorMenu.innerHTML = '';
  agruparPorDia(platos).forEach((grupo) => contenedorMenu.appendChild(crearTarjetaDia(grupo)));
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio.slice(2)}`;
}

function fechaDeHoy() {
  return new Date().toISOString().slice(0, 10);
}

function buscarPlato(idPlato) {
  return platosCargados.find((plato) => plato.id === idPlato);
}

// ── Capacidad 3 — registrar el pedido ──

// El guardado va en su propia función: hoy escribe en un array en
// memoria, el día de la conexión al backend esto pasa a ser un
// fetch con POST y el resto del archivo no cambia.
async function guardarPedido(pedido) {
  const id = pedidosGuardados.length + 1;
  pedidosGuardados.push({ ...pedido, id });
}

// Arma un ítem de la lista con el plato elegido, el día y el estado.
function crearItemPedido(pedido) {
  const plato = buscarPlato(pedido.idPlato);

  const li = document.createElement('li');

  const estado = document.createElement('strong');
  estado.className = 'badge estado-borrador';
  estado.textContent = 'Borrador';

  const detalle = document.createElement('span');
  detalle.textContent = ` ${plato.dia} ${formatearFecha(pedido.fechaPedido)} → ${plato.nombre}`;

  li.append(estado, detalle);

  if (pedido.comentarios) {
    const comentario = document.createElement('small');
    comentario.textContent = ` — Comentario: ${pedido.comentarios}`;
    li.appendChild(comentario);
  }

  return li;
}

function renderPedidos() {
  listaPedidos.innerHTML = '';
  pedidosGuardados.forEach((pedido) => listaPedidos.appendChild(crearItemPedido(pedido)));
}

function mostrarErrorPedido(mensaje) {
  errorPedido.textContent = mensaje;
  errorPedido.hidden = false;
}

function limpiarErrorPedido() {
  errorPedido.textContent = '';
  errorPedido.hidden = true;
}

// Devuelve los platos elegidos: como máximo uno por día, sin obligar a elegir todos.
function leerPlatosElegidos(datos) {
  return agruparPorDia(platosCargados)
    .map((grupo) => Number(datos.get(grupo.fecha)))
    .filter((idPlato) => idPlato)
    .map(buscarPlato);
}

function yaTienePedidoEseDia(plato) {
  return pedidosGuardados.some(
    (pedido) => pedido.idUsuario === ID_USUARIO && pedido.fechaPedido === plato.fecha
  );
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limpiarErrorPedido();

  if (platosCargados.length === 0) {
    mostrarErrorPedido('El menú todavía no está disponible.');
    return;
  }

  const datosForm = new FormData(form);
  const elegidos = leerPlatosElegidos(datosForm);
  const comentarios = (datosForm.get('comentarios') || '').trim();

  if (elegidos.length === 0) {
    mostrarErrorPedido('Elegí una opción en al menos un día antes de guardar el pedido.');
    return;
  }

  if (comentarios.length > MAX_COMENTARIO) {
    mostrarErrorPedido(`El comentario no puede superar los ${MAX_COMENTARIO} caracteres.`);
    return;
  }

  const repetido = elegidos.find(yaTienePedidoEseDia);
  if (repetido) {
    mostrarErrorPedido(`Ya tenés un pedido para el ${repetido.dia} ${formatearFecha(repetido.fecha)}.`);
    return;
  }

  for (const plato of elegidos) {
    await guardarPedido({
      idUsuario: ID_USUARIO,
      idPlato: plato.id,
      fechaPedido: plato.fecha,
      estado: 'BORRADOR',
      comentarios,
    });
  }

  renderPedidos();
  form.reset();
});

cargarMenu();
