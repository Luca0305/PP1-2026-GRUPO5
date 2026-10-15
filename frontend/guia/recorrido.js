const steps = [
  [
    "01-login",
    "Iniciar el recorrido",
    "La aplicación abre en el login. Un empleado nuevo elige Registrate.",
    "Un email con formato correcto no basta: la cuenta tiene que estar registrada y activa.",
  ],
  [
    "02-registro",
    "Crear una cuenta",
    "Completar nombre, apellido, email, contraseña y confirmación. Crear cuenta devuelve al login.",
    "Los errores aparecen junto al campo. El rol se asigna automáticamente; no hay selector público de administrador.",
  ],
  [
    "03-asistencia",
    "Elegir días de asistencia",
    "Ingresar y pulsar Semana siguiente para ver la semana del 19/10/2026. Marcar el lunes y guardar.",
    "Se guarda por empleado. El botón Guardar y elegir menú conduce al paso siguiente. Elegir siempre una fecha futura si ya pasó el corte.",
  ],
  [
    "04-menu",
    "Elegir el almuerzo",
    "Seleccionar un plato entre las opciones publicadas y agregar un comentario opcional.",
    "La tarjeta muestra fotografía, descripción y porciones disponibles. Solo aparecen los días con asistencia y servicio.",
  ],
  [
    "05-borrador",
    "Guardar y revisar",
    "Guardar borrador muestra el resumen en la misma pantalla. Continuar a Mis pedidos.",
    "El borrador todavía no reserva stock ni forma parte del consolidado.",
  ],
  [
    "06-confirmado",
    "Confirmar el pedido",
    "En Mis pedidos, revisar y pulsar Confirmar pedido.",
    "Ahora se reserva una porción. Se puede modificar o cancelar antes de las 10:00 del día del pedido. El historial permanece al recargar.",
  ],
  [
    "07-perfil",
    "Consultar Mi perfil",
    "El nombre y el icono de configuración abren el perfil. Permite cambiar datos y contraseña.",
    "Las fechas siempre se muestran en DD/MM/AAAA. Para cambiar la contraseña desde aquí se pide la actual. No hay licencias.",
  ],
  [
    "08-recuperar",
    "Recuperar acceso desde afuera",
    "Cerrar sesión, elegir Olvidé mi contraseña e ingresar el email registrado.",
    "Aparece un correo simulado con enlace: no se envía un correo real. El enlace dura 15 minutos y sirve una vez.",
  ],
  [
    "09-restablecer",
    "Guardar una nueva contraseña",
    "Abrir Cambiar contraseña, escribir y confirmar una nueva contraseña. Volver al login.",
    "La contraseña anterior deja de funcionar. La cuenta conserva sus pedidos, ID y rol.",
  ],
  [
    "10-admin",
    "Preparar y publicar menús",
    "Registrar proadmin@gmail.com con una contraseña propia e ingresar. Se abre Administración.",
    "Seleccionar platos del catálogo, agregarlos a un día, guardar borrador y publicar. Los menús guardados muestran estado, fechas y opciones.",
  ],
  [
    "11-feriados",
    "Administrar días sin servicio",
    "Agregar una fecha y un motivo. Se puede editar el motivo o habilitar nuevamente el servicio.",
    "No se admiten duplicados ni cerrar un día con pedidos activos. Un feriado impide pedidos de empleados.",
  ],
  [
    "12-usuarios",
    "Administrar cuentas",
    "Usuarios permite autorizar emails, cambiar roles y activar o desactivar cuentas.",
    "Una autorización pendiente todavía debe completar el registro. No se puede desactivar la propia cuenta ni dejar el sistema sin administrador.",
  ],
  [
    "13-consolidado",
    "Revisar y exportar",
    "Elegir la fecha del pedido confirmado y generar el consolidado. Descargar CSV o imprimir/guardar PDF.",
    "Se agrupan pedidos confirmados; borradores y cancelados no cuentan. El archivo no se envía automáticamente al proveedor.",
  ],
  [
    "14-limpieza",
    "Empezar otra demostración",
    "Abrir el índice de revisión y Restablecer datos de prueba. Confirmar la eliminación.",
    "Cuentas, pedidos, asistencias, feriados, reportes y recuperación quedan limpios en ese navegador y dirección. Se conservan los JSON originales de menús y platos.",
  ],
];
let current = 0;
const select = document.querySelector("#step-select");
steps.forEach((step, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = `${index + 1}. ${step[1]}`;
  select.append(option);
});
function render() {
  const [file, title, description, check] = steps[current];
  document.querySelector("#step-count").textContent =
    `PASO ${current + 1} DE ${steps.length}`;
  document.querySelector("#step-title").textContent = title;
  document.querySelector("#step-description").textContent = description;
  document.querySelector("#step-check").textContent = check;
  const image = document.querySelector("#step-image");
  image.src = `img/${file}.png`;
  image.alt = `Paso ${current + 1}: ${title}`;
  document.querySelector("#full-image").href = image.src;
  document.querySelector("#step-caption").textContent =
    `${title} · Captura de una demostración local, 15/10/2026.`;
  document.querySelector("#previous").disabled = current === 0;
  document.querySelector("#next").disabled = current === steps.length - 1;
  select.value = current;
}
function move(delta) {
  current = Math.max(0, Math.min(steps.length - 1, current + delta));
  render();
}
document.querySelector("#previous").addEventListener("click", () => move(-1));
document.querySelector("#next").addEventListener("click", () => move(1));
select.addEventListener("change", () => {
  current = Number(select.value);
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.target.matches("select,input,textarea")) return;
  if (event.key === "ArrowRight") {
    event.preventDefault();
    move(1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    move(-1);
  }
});
render();
