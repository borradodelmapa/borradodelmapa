// Servidor de pruebas "Propuesta UX" (26 sept 2026) — para ENSEÑAR A PACO un cambio
// funcionando de verdad ANTES de subirlo a la web (ver memoria feedback-ensenar-antes-de-subir).
//
// Sirve la COPIA de trabajo aparte (git worktree en C:\Users\User\Desktop\salma-ux-preview,
// rama propia) en http://localhost:8090 — la web real y `main` no se tocan. Si esa copia no
// existe, sirve esta carpeta. Otra carpeta: variable de entorno PREVIEW_ROOT.
// Se arranca desde Claude Code con preview_start → "Propuesta UX (copia ux-preview)".
//
// Imita a GitHub Pages para que lo que se ve aquí sea lo que se verá publicado:
//   /<slug>  → <slug>.html si existe (guías públicas fijas de scripts/build-guias.js)
//   ruta sin extensión que no existe → 404.html con código 404
//   sin caché (no-cache) — aun así, subir los ?v= de index.html si el navegador guarda algo.
// Ojo: el mapa de Google NO carga en localhost (la clave solo admite borradodelmapa.com).
const http = require('http');
const fs = require('fs');
const path = require('path');

const copia = path.join(__dirname, '..', '..', 'salma-ux-preview');
const root = process.env.PREVIEW_ROOT || (fs.existsSync(copia) ? copia : path.join(__dirname, '..'));
const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon','.webp':'image/webp' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(root, p);
  if (!fp.startsWith(root)) { res.writeHead(403); res.end('No'); return; }
  fs.readFile(fp, (err, data) => {
    if (err) {
      if (!path.extname(p) && fs.existsSync(fp + '.html')) {
        return fs.readFile(fp + '.html', (e3, d3) => { res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' }); res.end(d3); });
      }
      if (!path.extname(p)) {
        return fs.readFile(path.join(root, '404.html'), (e2, d2) => { res.writeHead(404, { 'Content-Type': 'text/html' }); res.end(d2 || 'Not found'); });
      }
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(process.env.PORT || 8090, () => console.log('Propuesta UX: ' + root + ' en http://localhost:' + (process.env.PORT || 8090)));
