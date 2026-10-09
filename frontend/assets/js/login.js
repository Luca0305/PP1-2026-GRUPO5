// Capacidad 1 — Login validado
// CU cubierto: CU relacionado al inicio de sesión (Login / Registro)
// Usa notificarError() y las validaciones de assets/js/utils.js

const form = document.getElementById('login-form');

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // no se envía el formulario ni se recarga la página

  const email = document.getElementById('email').value.trim();   //.trim para no comer espacios al principio o al final
  const password = document.getElementById('password').value;

  if (!email || !password) {
    notificarError('Completá el email y la contraseña.');
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

  const usuario = obtenerUsuarios().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!usuario || usuario.password !== password) {
    notificarError('Email o contraseña incorrectos.');
    return;
  }

  if (usuario.activo === false) {
    notificarError('Tu cuenta está desactivada. Consultá con el administrador.');
    return;
  }

  iniciarSesion(usuario);
  window.location.href = 'index.html';
});
