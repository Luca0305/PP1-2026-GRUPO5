// Mi perfil: actualiza nombre / email y, de forma opcional, la contraseña.
// Para cambiar la contraseña pide la actual y aplica las mismas reglas del registro.

const formPerfil = document.getElementById('perfil-form');
const inputNombre = document.getElementById('nombre');
const inputEmail = document.getElementById('email');
const sesionPerfil = usuarioActual() || {};

inputNombre.value = sesionPerfil.nombre || '';
inputEmail.value = sesionPerfil.email || '';

formPerfil.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();
  const actual = document.getElementById('pass-actual').value;
  const nueva = document.getElementById('pass-nueva').value;
  const confirmacion = document.getElementById('pass-confirmar').value;

  if (!nombre || !email) {
    notificarError('El nombre y el email no pueden estar vacíos.');
    return;
  }
  if (!emailValido(email)) {
    notificarError('Ingresá un email con formato válido (ej: usuario@empresa.com).');
    return;
  }

  const usuarios = obtenerUsuarios();
  const yo = usuarios.find((u) => u.email === sesionPerfil.email);
  if (!yo) {
    notificarError('No se encontró tu cuenta. Volvé a iniciar sesión.');
    return;
  }
  if (email.toLowerCase() !== yo.email.toLowerCase() && usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    notificarError('Ya existe otra cuenta con ese email.');
    return;
  }

  const quiereCambiarPassword = actual || nueva || confirmacion;
  if (quiereCambiarPassword) {
    if (actual !== yo.password) {
      notificarError('La contraseña actual no es correcta.');
      return;
    }
    const faltantes = reglasFaltantes(nueva);
    if (faltantes.length > 0) {
      notificarError('La nueva contraseña debe tener: ' + faltantes.map((r) => r.texto.toLowerCase()).join(', ') + '.');
      return;
    }
    if (nueva !== confirmacion) {
      notificarError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
  }

  const ok = await confirmar({
    titulo: 'Guardar cambios',
    mensaje: '¿Querés guardar los cambios de tu perfil?',
    textoConfirmar: 'Sí, guardar',
  });
  if (!ok) return;

  // Si cambió el email, los datos guardados con el email viejo se pasan al nuevo
  if (email !== yo.email) {
    guardarPedidos(obtenerPedidos().map((p) => (p.email === yo.email ? { ...p, email } : p)));
    const asistencia = leerLocal(`asistencia:${yo.email}`, null);
    if (asistencia) guardarLocal(`asistencia:${email}`, asistencia);
  }

  yo.nombre = nombre;
  yo.email = email;
  if (quiereCambiarPassword) yo.password = nueva;
  guardarUsuarios(usuarios);
  iniciarSesion(yo);

  formPerfil.querySelectorAll('input[type="password"]').forEach((i) => { i.value = ''; });
  document.querySelectorAll('[data-usuario]').forEach((el) => { el.textContent = yo.nombre; });
  notificarOk('Perfil actualizado.');
});
