// Capacidad 1 — Login validado
// CU cubierto: CU relacionado al inicio de sesión (Login / Registro)

const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');

function mostrarError(mensaje) {
  errorBox.textContent = mensaje;
  errorBox.hidden = false;
}

function limpiarError() {
  errorBox.textContent = '';
  errorBox.hidden = true;
}

function emailValido(valor) {
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patron.test(valor);
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // no se envía el formulario ni se recarga la página

  limpiarError();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    mostrarError('Completá el email y la contraseña.');
    return;
  }

  if (!emailValido(email)) {
    mostrarError('Ingresá un email con formato válido (ej: usuario@empresa.com).');
    return;
  }

  // Datos válidos: por ahora no hay backend, así que se simula el
  // inicio de sesión y se redirige a la pantalla principal.
  window.location.href = 'index.html';
});