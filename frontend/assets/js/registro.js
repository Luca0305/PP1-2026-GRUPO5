// Registro de usuario: valida nombre, email, contraseña (reglas + fortaleza)
// y que la confirmación coincida. Usa utils.js.

const formRegistro = document.getElementById('registro-form');
const inputPassword = document.getElementById('password');
const inputConfirmar = document.getElementById('password-confirm');
const listaReglas = document.getElementById('reglas-password');
const textoFortaleza = document.getElementById('fortaleza');
const textoCoincidencia = document.getElementById('coincidencia');

// Dibuja la lista de requisitos una sola vez
REGLAS_PASSWORD.forEach((regla) => {
  const li = document.createElement('li');
  li.id = `regla-${regla.id}`;
  li.textContent = regla.texto;
  listaReglas.appendChild(li);
});

function actualizarPassword() {
  const password = inputPassword.value;

  REGLAS_PASSWORD.forEach((regla) => {
    document.getElementById(`regla-${regla.id}`).classList.toggle('ok', regla.cumple(password));
  });

  const fortaleza = fortalezaPassword(password);
  textoFortaleza.hidden = !fortaleza;
  if (fortaleza) {
    textoFortaleza.textContent = `Seguridad: ${fortaleza.texto}`;
    textoFortaleza.className = `fortaleza fortaleza-${fortaleza.nivel}`;
  }

  actualizarCoincidencia();
}

function actualizarCoincidencia() {
  const confirmacion = inputConfirmar.value;
  textoCoincidencia.hidden = !confirmacion;
  if (!confirmacion) return;

  const coinciden = confirmacion === inputPassword.value;
  textoCoincidencia.textContent = coinciden ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden';
  textoCoincidencia.className = `coincidencia ${coinciden ? 'ok' : 'mal'}`;
}

inputPassword.addEventListener('input', actualizarPassword);
inputConfirmar.addEventListener('input', actualizarCoincidencia);

formRegistro.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = inputPassword.value;
  const confirmacion = inputConfirmar.value;

  if (!nombre || !email || !password || !confirmacion) {
    notificarError('Completá todos los campos.');
    return;
  }

  if (!emailValido(email)) {
    notificarError('Ingresá un email con formato válido (ej: usuario@empresa.com).');
    return;
  }

  const faltantes = reglasFaltantes(password);
  if (faltantes.length > 0) {
    notificarError('La contraseña debe tener: ' + faltantes.map((r) => r.texto.toLowerCase()).join(', ') + '.');
    return;
  }

  if (password !== confirmacion) {
    notificarError('Las contraseñas no coinciden.');
    return;
  }

  const usuarios = obtenerUsuarios();
  if (usuarios.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    notificarError('Ya existe una cuenta con ese email. Iniciá sesión.');
    return;
  }

  usuarios.push({ nombre, email, password, rol: 'empleado' });
  if (!guardarUsuarios(usuarios)) return;

  notificarOk('Cuenta creada. Redirigiendo al inicio de sesión…');
  setTimeout(() => { window.location.href = 'login.html'; }, 1500);
});
