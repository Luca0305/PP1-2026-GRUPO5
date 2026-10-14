// Servidor local sin dependencias. La entrada de la aplicación es login.html.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../frontend/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/" || url.pathname === "/index.html") {
        res.writeHead(302, { Location: "/login.html" });
        res.end();
        return;
      }
      const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
      const relative = path.relative(root, file);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        res.writeHead(403);
        res.end("Acceso denegado");
        return;
      }
      if (!(await stat(file)).isFile()) throw new Error("No es un archivo");
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Página no encontrada. Ingresá por /login.html");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`SistemaPedidos: http://127.0.0.1:${port}/login.html`),
  );
