// Capacidad 2 — Listado que se dibuja desde datos (fetch a data/platos.json)
// Capacidad 3 — Acción del usuario (registrar pedido, se agrega a una lista en pantalla)
// Capacidad 4 — Estados de interfaz (cargando / vacío / error)
// CU cubiertos: CU-02 (Consultar menú semanal) y CU-03 (Registrar pedido del día)

const contenedorMenu = document.getElementById('menu-semana-contenido');
const estadoMenu = document.getElementById('menu-estado');
const form = document.getElementById('form-pedido');
const listaPedidos = document.getElementById('pedidos-lista');

const DIAS = ['Lunes', 'Martes', 'Jueves'];
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

    dibujarMenu(platos);
    ocultarEstado();
  } catch (error) {
    mostrarEstado('No se pudo cargar el menú. Intentá de nuevo más tarde.', true);
  }
}

function dibujarMenu(platos) {
  contenedorMenu.innerHTML = '';

  DIAS.forEach((dia) => {
    const opcionesDelDia = platos.filter((plato) => plato.dia === dia);
    if (opcionesDelDia.length === 0) return;

    const fecha = opcionesDelDia[0].fecha;

    const article = document.createElement('article');

    const titulo = document.createElement('h4');
    titulo.innerHTML = `${dia} <time datetime="${fecha}">${formatearFecha(fecha)}</time>`;
    article.appendChild(titulo);

    opcionesDelDia.forEach((plato) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="${dia.toLowerCase()}" value="${plato.id}" required>
        ${plato.nombre}
        <em>${plato.descripcion}</em>
      `;
      article.appendChild(label);
    });

    contenedorMenu.appendChild(article);
  });
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio.slice(2)}`;
}

// ── Capacidad 3 — registrar el pedido ──

// El guardado va en su propia función: hoy escribe en un array en
// memoria, el día de la conexión al backend esto pasa a ser un
// fetch con POST y el resto del archivo no cambia.
async function guardarPedido(pedido) {
  pedidosGuardados.push(pedido);
}

function renderPedidos() {
  listaPedidos.innerHTML = '';

  pedidosGuardados.forEach((pedido) => {
    const li = document.createElement('li');
    const comentario = pedido.comentarios ? ` — Comentario: ${pedido.comentarios}` : '';
    li.textContent = `${pedido.dias.join(', ')} — Estado: Borrador${comentario}`;
    listaPedidos.appendChild(li);
  });
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const datosForm = new FormData(form);
  const seleccion = {
    lunes: datosForm.get('lunes'),
    martes: datosForm.get('martes'),
    jueves: datosForm.get('jueves'),
  };

  const diasSeleccionados = Object.entries(seleccion)
    .filter(([, valor]) => valor)
    .map(([dia]) => dia.charAt(0).toUpperCase() + dia.slice(1));

  if (diasSeleccionados.length === 0) {
    mostrarEstado('Elegí al menos una opción antes de guardar el pedido.', true);
    return;
  }

  const pedido = {
    id: Date.now(),
    dias: diasSeleccionados,
    seleccion,
    comentarios: (datosForm.get('comentarios') || '').trim(),
    estado: 'Borrador',
  };

  await guardarPedido(pedido);
  renderPedidos();
  form.reset();
});

cargarMenu();