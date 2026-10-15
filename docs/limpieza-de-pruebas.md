# Dónde se guardan los datos y cómo empezar de cero

## Ubicación real

Las cuentas **no se escriben en un archivo del repositorio ni en una base de datos remota**. El navegador guarda la estructura JSON en `localStorage`, clave `sistemaPedidos:v1`. Contiene usuarios, pedidos, menús editados, asistencias, feriados, reportes y solicitudes de recuperación. Las contraseñas se representan mediante sal y hash PBKDF2, no texto plano. Esto no es seguridad de producción.

La sesión de la pestaña está en `sessionStorage`: `sistemaPedidos:sesion`, `sistemaPedidos:versionSesion`, avisos y correo simulado. Cerrar sesión no borra las cuentas ni los pedidos. Cerrar una pestaña normalmente elimina su sessionStorage, pero localStorage permanece.

Cada **navegador, perfil y origen** tiene sus propios datos. `http://127.0.0.1:5502`, `http://localhost:5502` y `http://127.0.0.1:4173` son tres orígenes diferentes. Limpiar uno no limpia los otros. Un compañero que descargue el repositorio no recibe tus cuentas. Tampoco se incorporan a Git.

## Método recomendado: botón de limpieza

1. Abrir el proyecto con Live Server en el mismo navegador y dirección donde se hicieron las pruebas.
2. Cerrar las otras pestañas de SistemaPedidos para descartar sus sesiones.
3. Desde el enlace del pie del login, abrir **Guía de revisión y limpieza de pruebas** (`frontend/index.html`).
4. En **Limpiar las pruebas**, revisar la dirección y el contador de datos.
5. Pulsar **Restablecer datos de prueba** → **Sí, eliminar pruebas**.
6. Debe aparecer **0 cuentas · 0 pedidos · 0 configuraciones de asistencia · 0 feriados · 0 reportes**. Entrar al login y registrar una cuenta nueva.

La limpieza elimina las claves propias de ambos almacenamientos. Luego vuelve a leer los JSON iniciales: quedan nueve platos y dos semanas de menús originales para poder demostrar el recorrido, sin cuentas ni actividad. Se descartan los cambios administrativos y los enlaces de recuperación. `empresa.json` conserva la autorización de `proadmin@gmail.com`; no es una cuenta ni una contraseña.

Si falla la carga de un JSON después de borrar, se informa el error: corregir/restaurar ese archivo y recargar el login. Los datos eliminados no reaparecen.

## Método manual con DevTools

En la pestaña de SistemaPedidos, F12 → Application/Aplicación → Local Storage/Almacenamiento local → seleccionar **el origen correcto** → borrar `sistemaPedidos:v1`. En Session Storage/Almacenamiento de sesión borrar las claves que empiezan por `sistemaPedidos:`. Recargar. No hace falta borrar cookies, historial ni datos de otros sitios.

También se puede ejecutar en la consola de esa misma pestaña:

```js
for (const storage of [localStorage, sessionStorage]) {
  const keys = [];
  for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));
  for (const key of keys) {
    if (key?.startsWith("sistemaPedidos:")) storage.removeItem(key);
  }
}
location.href = "login.html";
```

No ejecutar `localStorage.clear()` en otro sitio: borraría también información ajena al prototipo. Repetir la limpieza por cada origen/perfil donde se haya probado.

## Estado de la comprobación

La limpieza fue ejecutada y verificada en el navegador temporal de pruebas: todos los contadores de actividad quedaron en cero y una clave ajena se conservó. Eso **no demuestra que el almacenamiento del Chrome/Edge personal esté vacío**. Para la presentación, usar el botón en el navegador y puerto de Live Server que se van a mostrar al profesor.

Además se ejecutó el botón de limpieza en el navegador integrado de Codex para `http://127.0.0.1:4173`: la interfaz confirmó cero cuentas, pedidos, asistencias, feriados y reportes. El almacenamiento de Chrome/Edge con Live Server sigue siendo independiente y no estuvo accesible desde esa sesión.


## Reinicio final único

La versión del 15/10 incluye `reinicioPruebas` en `empresa.json`. Al iniciar la aplicación limpia una sola vez los datos anteriores de cada origen. Guarda la marca `sistemaPedidos:reinicio`; las cuentas nuevas sobreviven a las recargas. No cambiar la marca durante la exposición. Chrome/Live Server aplica este reinicio cuando se abre allí la versión actual. El botón del índice sigue disponible para repetir la limpieza manual.
