// Capacidad 1 — Login validado
// CU cubierto: sin CU propio en E1 (el login es transversal a todos los CU)

const form = document.getElementById('login-form');
const inputEmail = document.getElementById('email');
const inputPassword = document.getElementById('password');
const errorEmail = document.getElementById('email-error');
const errorPassword = document.getElementById('password-error');

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LARGO_MINIMO_PASSWORD = 8;

// Cada validador devuelve el mensaje de error, o '' si el valor es válido.
function validarEmail(valor) {
  if (valor === '') return 'Ingresá tu email.';
  if (!PATRON_EMAIL.test(valor)) return 'Ingresá un email con formato válido (ej: usuario@empresa.com).';
  return '';
}

function validarPassword(valor) {
  if (valor === '') return 'Ingresá tu contraseña.';
  if (valor.length < LARGO_MINIMO_PASSWORD) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_PASSWORD} caracteres.`;
  }
  return '';
}

function mostrarError(elemento, input, mensaje) {
  elemento.textContent = mensaje;
  elemento.hidden = mensaje === '';
  input.setAttribute('aria-invalid', mensaje === '' ? 'false' : 'true');
}

function validarFormulario() {
  const mensajeEmail = validarEmail(inputEmail.value.trim());
  const mensajePassword = validarPassword(inputPassword.value); // la contraseña no se recorta

  mostrarError(errorEmail, inputEmail, mensajeEmail);
  mostrarError(errorPassword, inputPassword, mensajePassword);

  return mensajeEmail === '' && mensajePassword === '';
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // no se envía el formulario ni se recarga la página

  if (!validarFormulario()) return;

  // Datos válidos: sin backend se simula el inicio de sesión.
  window.location.href = 'index.html';
});

// El error de un campo desaparece apenas el usuario lo corrige.
inputEmail.addEventListener('input', () => mostrarError(errorEmail, inputEmail, ''));
inputPassword.addEventListener('input', () => mostrarError(errorPassword, inputPassword, ''));
