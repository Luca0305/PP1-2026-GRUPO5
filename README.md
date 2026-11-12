# SistemaPedidos · Grupo 5

Sistema de pedidos de almuerzos de Práctica Profesionalizante I. El frontend (HTML, CSS y JavaScript con módulos) se conecta al **backend Spring Boot** (`backend/`), que guarda todo en la base **MySQL `pp1_pedidos`** (script de la cátedra).

👉 **Detalle completo de la 4ta entrega (módulos, endpoints, traducción del modelo, cuentas y recorrido de la demo): [`docs/4ta-entrega/README.md`](docs/4ta-entrega/README.md).**

## Cómo levantarlo

1. **Base de datos**: correr entero **`backend/db/pp1_pedidos-completo.sql`** (un solo archivo: script oficial + 44 platos + menús publicados de noviembre). Sirve para MySQL Workbench y para XAMPP.
2. **Contraseña de MySQL**: si tiene, cargarla en la variable de entorno `DB_PASSWORD` (nunca en el repo). XAMPP viene sin contraseña.
3. **Backend** (Java 21): desde `backend/`, `./mvnw spring-boot:run`. Tiene que terminar en `Started PedidosApplication`.
4. **Frontend**: abrir `frontend/login.html` con **Live Server** (o `npm start`, puerto 4173). No abrir los HTML con doble clic: los módulos necesitan un servidor local.
5. Entrar con `martin.sosa@empresa.com.ar` / `cambiar123` (empleado) o `laura.gimenez@empresa.com.ar` / `cambiar123` (administradora).

**XAMPP (MariaDB)** desde la terminal, en la raíz del repo:

```powershell
C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 -e "source backend/db/pp1_pedidos-completo.sql"
```

Los archivos separados (`tp-pedidos.sql`, el oficial sin cambios, y `datos-demo.sql`) siguen en `backend/db/` por si se quiere mostrar el script de la cátedra tal cual.

Si el puerto 8080 está ocupado, cerrar el programa que lo usa o poner `server.port=8081` en `application.properties` y cambiar `API` en `frontend/assets/js/datos.js`.

## Qué hace

**Empleado:** login → **Mis días** (asistencia de la semana; la primera vez viene precargada de lunes a viernes, después copia la semana anterior) → **Elegir menú** (solo los días marcados, con porciones disponibles) → guardar borrador → **Mis pedidos** → confirmar, modificar o cancelar antes de la hora de corte.

**Administrador:** **Consolidado** (cuántos platos de cada uno por día, solo pedidos confirmados, CSV e impresión), **Menús** de la semana, **Pedido fuera de horario** (carga confirmado el pedido de un empleado que se olvidó), **Feriados** y **Usuarios**.

**Cuenta:** registro, Mi perfil y "Olvidé mi contraseña" (enlace de 15 minutos y un solo uso; el correo se muestra en pantalla porque no hay servidor de mail).

La hora de corte es **10:00 de Argentina** y se cambia en `application.properties` (`pedidos.hora-corte`). Las fechas se muestran en **DD/MM/AAAA**.

## Organización

| Carpeta / archivo | Responsabilidad |
| --- | --- |
| `backend/src/main/java/.../entidad` | Una clase por tabla del script, mismos nombres de columnas |
| `backend/.../repositorio` | Consultas (Spring Data JPA y JPQL para los cruces) |
| `backend/.../servicio` | Reglas de negocio (hora de corte, stock, estados del pedido) |
| `backend/.../controlador` | Endpoints REST `/api/...`, Bean Validation y errores en JSON |
| `backend/.../config` | CORS y reloj en hora argentina |
| `backend/db/` | Script oficial y datos de la demo |
| `frontend/*.html` + `assets/js/<pantalla>.js` | Una pantalla, un módulo |
| `frontend/assets/js/api.js` | Única puerta al backend (`fetch`) |
| `frontend/assets/js/core.js`, `ui.js`, `validation.js`, `semanas.js`, `dates.js` | Sesión, fechas, menú, validaciones y piezas compartidas |
| `frontend/assets/img/platos/ilustraciones/` | Ilustración original de cada plato ([cómo se arman](frontend/assets/img/platos/README.md)) |
| `docs/` | Documentación de cada entrega y colección de Postman |
| `tests/` | Pruebas del frontend (`npm test`) |

## Entregas

- [E1: análisis, historias y casos de uso](docs/1er-entrega/analisis.md).
- [E2: interfaces](docs/2da-entrega/README.md).
- [E3: prototipo de frontend](docs/3er-entrega/README.md).
- [E4: backend integrado](docs/4ta-entrega/README.md).

**Asistencia utilizada:** IA para explicar conceptos, implementar ajustes y revisar el funcionamiento (detalle en la declaración de la 4ta entrega).
