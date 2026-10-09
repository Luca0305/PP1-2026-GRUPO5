// Panel de inicio: el ícono de cuenta muestra Iniciar sesión / Registrarse
// o, si hay sesión, el nombre y Cerrar sesión.
const menuCuenta = document.getElementById('acceso-menu');
const sesionIndex = usuarioActual();

if (sesionIndex) {
  menuCuenta.innerHTML = `<span class="saludo">Hola, ${escapar(sesionIndex.nombre)}</span><a href="#" data-logout>Cerrar sesión</a>`;
  menuCuenta.querySelector('[data-logout]').addEventListener('click', (e) => { e.preventDefault(); cerrarSesion(); });
}

if (sesionIndex) {
  const ocultar = sesionIndex.rol === 'admin' ? '.card-emp' : '.card-adm';
  document.querySelectorAll(ocultar).forEach((tarjeta) => { tarjeta.hidden = true; });
}
