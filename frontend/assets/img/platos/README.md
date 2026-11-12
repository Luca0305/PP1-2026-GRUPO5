# Imágenes de los platos

`ilustraciones/` tiene una ilustración SVG original por cada plato del menú (44), dibujada para
este proyecto con `ilustraciones/generar.py`. No usa imágenes de terceros.

El nombre del archivo sale del nombre del plato (sin tildes, en minúsculas y con guiones):
"Milanesa con puré" → `milanesa-con-pure.svg`. Para un plato nuevo se agrega su ilustración con
ese nombre o se carga la ruta en la columna `imagen` de la tabla `plato`.
