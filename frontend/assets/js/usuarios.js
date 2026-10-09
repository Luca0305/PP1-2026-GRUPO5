// Gestión de usuarios (CU-10, solo Administrador): alta, modificación y baja lógica.
// Una cuenta desactivada no puede iniciar sesión pero conserva sus pedidos.

const cuerpoUsuarios = document.getElementById('usuarios-cuerpo');
const formUsuario = document.getElementById('form-usuario');
const tituloUsuario = document.getElementById('form-usuario-titulo');
const inputNombreU = document.getElementById('u-nombre');
const inputEmailU = document.getElementById('u-email');
const selectRolU = document.getElementById('u-rol');
const inputPasswordU = document.getElementById('u-password');
const labelPasswordU = document.getElementById('u-password-label');
const btnGuardarU = document.getElementById('btn-guardar-usuario');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

const yoAdmin = usuarioActual() || {};
let emailEditando = null;

const estaActivo = (u) => u.activo !== false;
const nombreRol = (rol) => (rol === 'admin' ? 'Administrador' : 'Empleado');

function adminsActivos() {
  return obtenerUsuarios().filter((u) => u.rol === 'admin' && estaActivo(u));
}

function dibujarUsuarios() {
  cuerpoUsuarios.innerHTML = '';
  obtenerUsuarios().forEach((u) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${escapar(u.nombre)}${u.email === yoAdmin.email ? ' <em>(vos)</em>' : ''}</td>
      <td>${escapar(u.email)}</td>
      <td>${nombreRol(u.rol)}</td>
      <td><strong class="badge ${estaActivo(u) ? 'estado-confirmado' : 'estado-cancelado'}">${estaActivo(u) ? 'Activo' : 'Desactivado'}</strong></td>
      <td>
        <button type="button" class="btn-tabla" data-accion="editar" data-email="${escapar(u.email)}">Editar</button>
        <button type="button" class="btn-tabla ${estaActivo(u) ? 'peligro' : ''}" data-accion="estado" data-email="${escapar(u.email)}">${estaActivo(u) ? 'Desactivar' : 'Activar'}</button>
      </td>`;
    cuerpoUsuarios.appendChild(fila);
  });
}

function limpiarFormulario() {
  emailEditando = null;
  formUsuario.reset();
  inputEmailU.disabled = false;
  tituloUsuario.textContent = 'Nuevo usuario';
  labelPasswordU.textContent = 'Contraseña inicial';
  btnGuardarU.textContent = 'Crear usuario';
  btnCancelarEdicion.hidden = true;
}

btnCancelarEdicion.addEventListener('click', limpiarFormulario);

cuerpoUsuarios.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('button');
  if (!boton) return;

  const usuarios = obtenerUsuarios();
  const u = usuarios.find((x) => x.email === boton.dataset.email);
  if (!u) return;

  if (boton.dataset.accion === 'editar') {
    emailEditando = u.email;
    inputNombreU.value = u.nombre;
    inputEmailU.value = u.email;
    inputEmailU.disabled = true; // el email identifica la cuenta y sus pedidos
    selectRolU.value = u.rol;
    inputPasswordU.value = '';
    tituloUsuario.textContent = `Editar usuario — ${u.nombre}`;
    labelPasswordU.textContent = 'Nueva contraseña (dejá vacío para no cambiarla)';
    btnGuardarU.textContent = 'Guardar cambios';
    btnCancelarEdicion.hidden = false;
    formUsuario.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Activar / desactivar
  if (estaActivo(u)) {
    if (u.email === yoAdmin.email) {
      notificarError('No podés desactivar tu propia cuenta.');
      return;
    }
    if (u.rol === 'admin' && adminsActivos().length === 1) {
      notificarError('Tiene que quedar al menos un administrador activo.');
      return;
    }
    const activos = obtenerPedidos().filter((p) => p.email === u.email && p.estado !== 'Cancelado').length;
    const ok = await confirmar({
      titulo: 'Desactivar usuario',
      mensaje: `¿Desactivar a ${u.nombre}? No va a poder iniciar sesión.${activos ? ` Tiene ${activos} pedido(s) activo(s) que se mantienen en el consolidado.` : ''}`,
      textoConfirmar: 'Sí, desactivar',
    });
    if (!ok) return;
    u.activo = false;
    notificarOk(`${u.nombre} fue desactivado.`);
  } else {
    const ok = await confirmar({ titulo: 'Activar usuario', mensaje: `¿Volver a activar a ${u.nombre}?`, textoConfirmar: 'Sí, activar' });
    if (!ok) return;
    u.activo = true;
    notificarOk(`${u.nombre} fue activado.`);
  }
  guardarUsuarios(usuarios);
  dibujarUsuarios();
});

formUsuario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = inputNombreU.value.trim();
  const email = inputEmailU.value.trim();
  const rol = selectRolU.value;
  const password = inputPasswordU.value;
  const usuarios = obtenerUsuarios();

  if (!nombre || !email) {
    notificarError('Completá el nombre y el email.');
    return;
  }
  if (!emailValido(email)) {
    notificarError('Ingresá un email con formato válido (ej: usuario@empresa.com).');
    return;
  }

  // ¿Se está cargando una contraseña? En el alta es obligatoria; al editar es opcional.
  if (!emailEditando || password) {
    const faltantes = reglasFaltantes(password);
    if (faltantes.length > 0) {
      notificarError('La contraseña debe tener: ' + faltantes.map((r) => r.texto.toLowerCase()).join(', ') + '.');
      return;
    }
  }

  if (!emailEditando) {
    if (usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      notificarError('Ya existe una cuenta con ese email.');
      return;
    }
    usuarios.push({ nombre, email, password, rol, activo: true });
    if (!guardarUsuarios(usuarios)) return;
    notificarOk(`Usuario ${nombre} creado.`);
  } else {
    const u = usuarios.find((x) => x.email === emailEditando);
    if (u.rol !== rol) {
      if (u.email === yoAdmin.email) {
        notificarError('No podés cambiar tu propio rol.');
        return;
      }
      if (u.rol === 'admin' && estaActivo(u) && adminsActivos().length === 1) {
        notificarError('Tiene que quedar al menos un administrador activo.');
        return;
      }
    }
    const ok = await confirmar({ titulo: 'Guardar cambios', mensaje: `¿Guardar los cambios de ${u.nombre}?`, textoConfirmar: 'Sí, guardar' });
    if (!ok) return;
    u.nombre = nombre;
    u.rol = rol;
    if (password) u.password = password;
    if (!guardarUsuarios(usuarios)) return;
    if (u.email === yoAdmin.email) iniciarSesion(u);
    notificarOk('Usuario actualizado.');
  }

  limpiarFormulario();
  dibujarUsuarios();
});

dibujarUsuarios();
