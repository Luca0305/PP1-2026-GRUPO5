// Administrar / Publicar menús (solo Administrador).
// Cada semana se edita, se guarda como Borrador o se publica. Lo publicado
// reemplaza al menú de platos.json y lo ven los empleados al pedir.

const listaSemanas = document.getElementById('menu-lista');
const formMenu = document.getElementById('form-menu');
const contenedorDias = document.getElementById('menu-dias');
const tituloForm = document.getElementById('form-titulo');

let base = [];        // platos.json
let feriados = [];
let semanaEditando = null;

// ── Datos de cada semana ──

function menuDeBase(lunes) {
  const dias = {};
  base.filter((p) => lunesDe(p.fecha) === lunes).forEach((p) => {
    (dias[p.dia] = dias[p.dia] || []).push({ nombre: p.nombre, descripcion: p.descripcion, vegetariano: false, sinTacc: false });
  });
  return { estado: 'Publicado', dias };
}

function hayPlatos(menu) {
  return Object.values(menu.dias).some((lista) => lista.length > 0);
}

// Lo guardado por el admin gana; si no, el menú base; si no, una semana vacía
function menuDe(lunes) {
  const admin = obtenerMenusAdmin()[lunes];
  if (admin) return admin;
  const deBase = menuDeBase(lunes);
  return hayPlatos(deBase) ? deBase : { estado: 'Borrador', dias: {} };
}

function listaDeSemanas() {
  const conocidas = new Set([...base.map((p) => lunesDe(p.fecha)), ...Object.keys(obtenerMenusAdmin())]);
  const ordenadas = [...conocidas].sort();
  const siguiente = ordenadas.length ? sumarDias(ordenadas[ordenadas.length - 1], 7) : lunesDe(aISO(new Date()));
  conocidas.add(siguiente); // siempre se puede armar la semana que sigue
  return [...conocidas].sort().reverse();
}

// ── Lista de semanas ──

function dibujarLista() {
  listaSemanas.innerHTML = '';
  listaDeSemanas().forEach((lunes) => {
    const estado = menuDe(lunes).estado;
    const fila = document.createElement('div');
    fila.className = 'menu-lista-item';
    fila.innerHTML = `
      <div>
        <span class="semana">${rangoSemana(lunes)}</span>
        <strong class="badge ${estado === 'Publicado' ? 'estado-confirmado' : 'estado-borrador'}">${estado}</strong>
      </div>
      <div class="acciones"><button type="button" class="btn-modificar" data-lunes="${lunes}">${lunes === semanaEditando ? 'Editando' : 'Editar'}</button></div>`;
    listaSemanas.appendChild(fila);
  });
}

listaSemanas.addEventListener('click', (e) => {
  const boton = e.target.closest('button[data-lunes]');
  if (!boton) return;
  abrirSemana(boton.dataset.lunes);
  formMenu.scrollIntoView({ behavior: 'smooth' });
});

// ── Formulario ──

function crearOpcion(o = {}) {
  const div = document.createElement('div');
  div.className = 'opcion';
  div.innerHTML = `
    <input type="text" class="op-nombre" placeholder="Nombre del plato" maxlength="60">
    <input type="text" class="op-desc" placeholder="Descripción" maxlength="100">
    <div class="etiquetas">
      <label><input type="checkbox" class="op-veg"> Vegetariano</label>
      <label><input type="checkbox" class="op-tacc"> Sin TACC</label>
      <button type="button" class="btn-quitar">Quitar</button>
    </div>`;
  div.querySelector('.op-nombre').value = o.nombre || '';
  div.querySelector('.op-desc').value = o.descripcion || '';
  div.querySelector('.op-veg').checked = Boolean(o.vegetariano);
  div.querySelector('.op-tacc').checked = Boolean(o.sinTacc);
  return div;
}

function llenarDias(dias) {
  contenedorDias.innerHTML = '';
  ORDEN_DIAS.forEach((dia, i) => {
    const fecha = sumarDias(semanaEditando, i);
    const articulo = document.createElement('article');
    articulo.dataset.dia = dia;
    articulo.innerHTML = `<h4>${dia} <time datetime="${fecha}">${formatearFecha(fecha)}</time></h4>`;

    const feriado = feriados.find((f) => f.fecha === fecha && f.feriado);
    if (feriado) {
      articulo.innerHTML += `<p class="estado-vacio">Feriado${feriado.motivo ? `: ${escapar(feriado.motivo)}` : ''}. Sin servicio.</p>`;
    } else {
      (dias[dia] || []).forEach((o) => articulo.appendChild(crearOpcion(o)));
      articulo.insertAdjacentHTML('beforeend', '<button type="button" class="btn-agregar-opcion">+ Agregar opción</button>');
    }
    contenedorDias.appendChild(articulo);
  });
}

function abrirSemana(lunes) {
  semanaEditando = lunes;
  const menu = menuDe(lunes);
  tituloForm.textContent = `Cargar opciones — ${rangoSemana(lunes)} (${menu.estado})`;
  llenarDias(menu.dias);
  dibujarLista();
}

function leerFormulario() {
  const dias = {};
  contenedorDias.querySelectorAll('article').forEach((articulo) => {
    const opciones = [...articulo.querySelectorAll('.opcion')].map((o) => ({
      nombre: o.querySelector('.op-nombre').value.trim(),
      descripcion: o.querySelector('.op-desc').value.trim(),
      vegetariano: o.querySelector('.op-veg').checked,
      sinTacc: o.querySelector('.op-tacc').checked,
    }));
    if (opciones.length) dias[articulo.dataset.dia] = opciones;
  });
  return dias;
}

contenedorDias.addEventListener('click', (e) => {
  const agregar = e.target.closest('.btn-agregar-opcion');
  if (agregar) agregar.before(crearOpcion());
  const quitar = e.target.closest('.btn-quitar');
  if (quitar) quitar.closest('.opcion').remove();
});

function guardarMenu(estado) {
  const menus = obtenerMenusAdmin();
  menus[semanaEditando] = { estado, dias: leerFormulario() };
  if (!guardarMenusAdmin(menus)) return false;
  abrirSemana(semanaEditando);
  return true;
}

// ── Acciones ──

document.getElementById('btn-guardar-borrador').addEventListener('click', async () => {
  if (menuDe(semanaEditando).estado === 'Publicado') {
    const ok = await confirmar({
      titulo: 'Pasar a borrador',
      mensaje: 'Esta semana ya está publicada. Si la guardás como borrador, los empleados dejan de verla hasta que la publiques de nuevo. ¿Continuar?',
      textoConfirmar: 'Sí, pasar a borrador',
    });
    if (!ok) return;
  }
  if (guardarMenu('Borrador')) notificarOk('Borrador guardado.');
});

formMenu.addEventListener('submit', async (e) => {
  e.preventDefault();
  const dias = leerFormulario();

  if (Object.keys(dias).length === 0) {
    notificarError('Cargá al menos una opción antes de publicar el menú.');
    return;
  }
  for (const dia of Object.keys(dias)) {
    if (dias[dia].some((o) => !o.nombre)) {
      notificarError(`Hay una opción del ${dia.toLowerCase()} sin nombre de plato.`);
      return;
    }
  }

  const ok = await confirmar({
    titulo: 'Publicar menú',
    mensaje: `Los empleados van a ver el menú de la ${rangoSemana(semanaEditando).toLowerCase()} y podrán hacer pedidos. ¿Publicar?`,
    textoConfirmar: 'Sí, publicar',
  });
  if (!ok) return;
  if (guardarMenu('Publicado')) notificarOk('Menú publicado. Ya lo ven los empleados.');
});

document.getElementById('btn-duplicar').addEventListener('click', async () => {
  const anterior = menuDe(sumarDias(semanaEditando, -7));
  if (!hayPlatos(anterior)) {
    notificarError('La semana anterior no tiene opciones para copiar.');
    return;
  }
  const ok = await confirmar({
    titulo: 'Duplicar semana anterior',
    mensaje: 'Se van a reemplazar las opciones que están en pantalla por las de la semana anterior. Después tenés que guardar o publicar. ¿Continuar?',
    textoConfirmar: 'Sí, duplicar',
  });
  if (!ok) return;
  llenarDias(anterior.dias);
  notificarOk('Opciones copiadas. Revisalas y guardá o publicá.');
});

async function iniciar() {
  try {
    base = await cargarPlatosBase();
  } catch (error) {
    notificarError('No se pudo cargar el menú base. Podés armar semanas nuevas igual.');
  }
  feriados = await traerFeriados();
  abrirSemana(listaDeSemanas()[0]);
}

iniciar();
