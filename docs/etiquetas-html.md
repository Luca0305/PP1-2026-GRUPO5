# Etiquetas utilizadas en el frontend

Inventario del código final al 15/10/2026: **51 tipos de elementos HTML y 5 elementos SVG**. Se inspeccionaron los HTML, plantillas de texto de JavaScript y llamadas createElement. Incluye aplicación, índice, guía y créditos; excluye documentación Markdown, pruebas y archivos de terceros. Los números de línea son referencias de esta revisión.

Una etiqueta es la marca (`<p>`); el elemento es la unidad completa (`<p>Texto</p>`). La apertura y el cierre no cuentan como tipos distintos. CSS puede cambiar la presentación en bloque o en línea; eso no cambia la semántica de la etiqueta.

## Elementos HTML

| Etiqueta | Función y uso concreto | Ejemplo en el proyecto |
| --- | --- | --- |
| `<a>` | Enlace de navegación con href, ancla o descarga CSV creada por JavaScript; no sustituye acciones de formulario. | [frontend/asistencia.html](../frontend/asistencia.html), línea 16 |
| `<article>` | Unidad independiente: tarjeta de plato, semana guardada o pedido. | [frontend/assets/js/calendario-feriados.js](../frontend/assets/js/calendario-feriados.js), línea 22 |
| `<b>` | Llama la atención visual sin añadir importancia semántica; números del indicador de pasos. | [frontend/assets/js/ui.js](../frontend/assets/js/ui.js), línea 261 |
| `<body>` | Contenido visible y atributos data-page/data-required que identifican pantalla y rol. | [frontend/asistencia.html](../frontend/asistencia.html), línea 15 |
| `<br>` | Salto de línea puntual. No se usa para fabricar márgenes; elemento vacío. | [frontend/assets/js/app.js](../frontend/assets/js/app.js), línea 50 |
| `<button>` | Ejecuta una acción: type="submit" envía; type="button" evita enviar accidentalmente. | [frontend/asistencia.html](../frontend/asistencia.html), línea 56 |
| `<caption>` | Título accesible de una tabla. | [frontend/consolidado.html](../frontend/consolidado.html), línea 53 |
| `<code>` | Presenta un fragmento técnico, como el origen donde se guarda la información. | [frontend/index.html](../frontend/index.html), línea 92 |
| `<details>` | Sección desplegable nativa para información adicional. | [frontend/guia/recorrido.html](../frontend/guia/recorrido.html), línea 52 |
| `<dialog>` | Confirmación modal nativa para acciones, con botones para continuar o volver. | [frontend/index.html](../frontend/index.html), línea 101 |
| `<div>` | Agrupación genérica para layout o render; no aporta semántica propia. | [frontend/asistencia.html](../frontend/asistencia.html), línea 22 |
| `<fieldset>` | Agrupa controles relacionados, aquí la selección múltiple de platos del catálogo. | [frontend/asistencia.html](../frontend/asistencia.html), línea 48 |
| `<figcaption>` | Leyenda de la captura dentro de figure. | [frontend/guia/recorrido.html](../frontend/guia/recorrido.html), línea 49 |
| `<figure>` | Agrupa la captura de la guía con su leyenda. | [frontend/guia/recorrido.html](../frontend/guia/recorrido.html), línea 45 |
| `<footer>` | Pie de página con identidad y enlaces auxiliares. | [frontend/asistencia.html](../frontend/asistencia.html), línea 60 |
| `<form>` | Conjunto de controles que se envía con submit; JavaScript usa preventDefault y valida sin recargar. | [frontend/asistencia.html](../frontend/asistencia.html), línea 47 |
| `<h1>` | Título principal de una página. | [frontend/asistencia.html](../frontend/asistencia.html), línea 34 |
| `<h2>` | Título de sección dentro de la página. | [frontend/calendario-feriados.html](../frontend/calendario-feriados.html), línea 57 |
| `<h3>` | Título de subsección o tarjeta; conserva la jerarquía de contenido. | [frontend/guia/recorrido.html](../frontend/guia/recorrido.html), línea 30 |
| `<head>` | Metadatos y referencias que no forman el contenido principal visible. | [frontend/asistencia.html](../frontend/asistencia.html), línea 3 |
| `<header>` | Encabezado de la aplicación o de una sección; contiene identidad y navegación. | [frontend/asistencia.html](../frontend/asistencia.html), línea 17 |
| `<html>` | Raíz del documento; lang="es" declara el idioma. | [frontend/asistencia.html](../frontend/asistencia.html), línea 2 |
| `<img>` | Imagen del logo, plato o captura; src es la ruta y alt describe su contenido. Elemento vacío. | [frontend/menu-pedido.html](../frontend/menu-pedido.html), línea 110 |
| `<input>` | Control de datos según type; required, maxlength y otros atributos limitan entradas. Elemento vacío. | [frontend/asistencia.html](../frontend/asistencia.html), línea 42 |
| `<label>` | Nombre accesible del control; for coincide con id o contiene el input directamente. | [frontend/asistencia.html](../frontend/asistencia.html), línea 41 |
| `<legend>` | Título accesible de un fieldset. | [frontend/asistencia.html](../frontend/asistencia.html), línea 49 |
| `<li>` | Un elemento de ul u ol. | [frontend/index.html](../frontend/index.html), línea 30 |
| `<link>` | Enlaza CSS e icono del sitio mediante href. Elemento vacío. | [frontend/asistencia.html](../frontend/asistencia.html), línea 8 |
| `<main>` | Contenido principal de cada documento; destino del enlace Saltar al contenido. | [frontend/asistencia.html](../frontend/asistencia.html), línea 20 |
| `<meta>` | Codificación UTF-8, viewport y color del navegador. Elemento vacío. | [frontend/asistencia.html](../frontend/asistencia.html), línea 4 |
| `<nav>` | Agrupa enlaces de navegación; se genera en el encabezado compartido desde ui.js. | [frontend/assets/js/ui.js](../frontend/assets/js/ui.js), línea 200 |
| `<noscript>` | Explica que debe habilitarse JavaScript cuando está desactivado. | [frontend/asistencia.html](../frontend/asistencia.html), línea 64 |
| `<ol>` | Lista ordenada de pasos o referencias de las fotografías. | [frontend/index.html](../frontend/index.html), línea 44 |
| `<option>` | Una opción dentro de select; value es el dato enviado y el texto es lo visible. | [frontend/mis-pedidos.html](../frontend/mis-pedidos.html), línea 45 |
| `<p>` | Párrafo: explicación, ayuda o mensaje de estado. | [frontend/asistencia.html](../frontend/asistencia.html), línea 21 |
| `<script>` | Carga JavaScript externo con src y type="module" al final del body. | [frontend/asistencia.html](../frontend/asistencia.html), línea 67 |
| `<section>` | Agrupación temática, por ejemplo catálogo, resumen o datos de revisión. | [frontend/asistencia.html](../frontend/asistencia.html), línea 39 |
| `<select>` | Lista desplegable para elegir una opción, como día, rol o paso de la guía. | [frontend/menuadmin.html](../frontend/menuadmin.html), línea 62 |
| `<small>` | Información secundaria, fechas pequeñas y ayudas complementarias. | [frontend/assets/js/asistencia.js](../frontend/assets/js/asistencia.js), línea 30 |
| `<span>` | Agrupación en línea para badge, texto de icono o estado. | [frontend/asistencia.html](../frontend/asistencia.html), línea 33 |
| `<strong>` | Destaca información con importancia semántica, como una fecha o resultado. | [frontend/consolidado.html](../frontend/consolidado.html), línea 40 |
| `<summary>` | Cabecera interactiva que abre o cierra details, sin un controlador personalizado. | [frontend/guia/recorrido.html](../frontend/guia/recorrido.html), línea 53 |
| `<table>` | Datos tabulares: usuarios y consolidado. No se utiliza para maquetar la página. | [frontend/consolidado.html](../frontend/consolidado.html), línea 52 |
| `<tbody>` | Contiene las filas de datos; JavaScript lo actualiza sin borrar thead. | [frontend/consolidado.html](../frontend/consolidado.html), línea 63 |
| `<td>` | Celda de datos de una fila. | [frontend/assets/js/consolidado.js](../frontend/assets/js/consolidado.js), línea 54 |
| `<template>` | Contenido HTML inerte de las nueve fotos; JavaScript inserta la imagen correspondiente al renderizar el plato. | [frontend/menu-pedido.html](../frontend/menu-pedido.html), línea 109 |
| `<th>` | Celda de encabezado, con scope cuando corresponde para relacionarla con los datos. | [frontend/consolidado.html](../frontend/consolidado.html), línea 58 |
| `<thead>` | Agrupa encabezados de columnas. | [frontend/consolidado.html](../frontend/consolidado.html), línea 56 |
| `<title>` | Nombre de la pestaña del navegador, distinto del título visible h1. | [frontend/asistencia.html](../frontend/asistencia.html), línea 7 |
| `<tr>` | Una fila de tabla. | [frontend/consolidado.html](../frontend/consolidado.html), línea 57 |
| `<ul>` | Lista no ordenada de requisitos, opciones o mensajes. | [frontend/index.html](../frontend/index.html), línea 29 |

## Gráficos SVG integrados

Estos elementos aparecen dentro de HTML generado para iconos, pero son SVG. No se deben contar como cinco etiquetas HTML adicionales.

| Elemento | Función | Ejemplo |
| --- | --- | --- |
| `<circle>` | Círculo de un icono vectorial. | [frontend/assets/js/ui.js](../frontend/assets/js/ui.js), línea 17 |
| `<path>` | Trayectoria vectorial que dibuja ojos, engranaje y otros iconos. | [frontend/assets/js/dates.js](../frontend/assets/js/dates.js), línea 49 |
| `<polygon>` | Polígono vectorial utilizado por un icono. | [frontend/assets/js/ui.js](../frontend/assets/js/ui.js), línea 17 |
| `<rect>` | Rectángulo de un icono, por ejemplo calendario. | [frontend/assets/js/dates.js](../frontend/assets/js/dates.js), línea 49 |
| `<svg>` | Contenedor de gráficos vectoriales en línea para iconos; pertenece al vocabulario SVG, no a HTML. | [frontend/assets/js/dates.js](../frontend/assets/js/dates.js), línea 49 |

## Tipos de input y atributos que conviene explicar

`input` es una sola etiqueta aunque cambie `type`. En este proyecto se usan texto, email, contraseña, checkbox, radio, número, fecha y búsqueda. El control de fecha visible es texto DD/MM/AAAA y tiene un calendario nativo auxiliar. Los campos de contraseña cambian entre password y text al pulsar el ojo.

- `id`: identifica un elemento único; permite seleccionarlo con JavaScript y enlazar su label.
- `class`: clases de CSS y componentes compartidos. `row`, `col-*` y `g-*` pertenecen a Bootstrap Grid.
- `name` y `value`: identifican y transportan los datos de controles, por ejemplo FormData.
- `required`, `maxlength`, `min`, `max`, `step`: restricciones; la lógica también valida antes de guardar.
- `href` y `src`: destino de un enlace y origen de un recurso respectivamente.
- `alt`: descripción textual de una imagen; no es un reemplazo gráfico automático.
- `data-*`: datos de la interfaz, como fecha, identificador, pantalla o rol requerido. No autorizan por sí solos.
- `aria-*`, `role`, `tabindex`: nombres, relaciones, anuncios y foco para accesibilidad; no son etiquetas.
- `hidden`, `disabled`, `checked`, `selected`: visibilidad y estado de controles.
- `novalidate`: permite que la aplicación muestre sus propios errores; no elimina la validación JavaScript.

## Lo que no es una etiqueta HTML

`<!doctype html>` es la declaración del tipo de documento; activa el modo estándar del navegador. `<!-- comentario -->` es un comentario. `::before`, `:hover`, `.panel` y `#message` son selectores/pseudo-elementos de CSS. `querySelector`, `addEventListener`, `fetch` y `localStorage` son APIs de JavaScript. JSON contiene datos, no etiquetas.

No se agregaron etiquetas que no se usan solo por aparecer en los apuntes. Tampoco se cuenta el texto escapado de un usuario como HTML: un comentario con `<b>` se muestra como texto, no se ejecuta como marcado.
