// Registro de días de asistencia.
// Cada día es un checkbox: alcanza con elegir uno solo. La elección se guarda
// por usuario y define qué días se muestran en el menú de pedidos.

const formAsistencia = document.getElementById('form-asistencia');
const claveAsistencia = `asistencia:${(usuarioActual() || {}).email}`;

// Si ya había elegido días, se vuelven a marcar
const diasGuardados = leerLocal(claveAsistencia, []);
formAsistencia.querySelectorAll('input[name="dias"]').forEach((check) => {
  check.checked = diasGuardados.includes(check.value);
});

formAsistencia.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const marcados = Array.from(formAsistencia.querySelectorAll('input[name="dias"]:checked'));

  if (marcados.length === 0) {
    notificarError('Elegí al menos un día de asistencia.');
    return;
  }

  if (!guardarLocal(claveAsistencia, marcados.map((c) => c.value))) return;

  notificarOk(`Asistencia guardada: ${marcados.map((c) => c.parentElement.textContent.trim()).join(', ')}. Yendo al menú…`);
  setTimeout(() => { window.location.href = 'menu-pedido.html'; }, 1400);
});
