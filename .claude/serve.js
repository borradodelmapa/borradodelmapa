const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.pbf':'application/x-protobuf' };
const MAPAS = path.join(root, '.mapas');

// Solo en local: sirve el mapa y el relieve desde .mapas/ (lo mismo que /mapas y /terreno del Worker, sin gastar datos).
// El vídeo lo usa con ?mapas=local.
function serveRange(req, res, fp, type) {
  fs.stat(fp, (err, st) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    const cors = { 'Access-Control-Allow-Origin': '*', 'Accept-Ranges': 'bytes', 'Content-Type': type };
    if (!m) { res.writeHead(200, { ...cors, 'Content-Length': st.size }); fs.createReadStream(fp).pipe(res); return; }
    const a = +m[1], b = m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
    res.writeHead(206, { ...cors, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Content-Length': b - a + 1 });
    fs.createReadStream(fp, { start: a, end: b }).pipe(res);
  });
}
const terrIdx = {};
function serveTerrain(res, pack, key) {
  try {
    if (!terrIdx[pack]) terrIdx[pack] = JSON.parse(fs.readFileSync(path.join(MAPAS, pack + '.json'), 'utf8'));
    const e = terrIdx[pack].tiles[key];
    if (!e) { res.writeHead(404, { 'Access-Control-Allow-Origin': '*' }); res.end(); return; }
    const [part, off, len] = e.length === 3 ? e : [null, e[0], e[1]];
    const fd = fs.openSync(path.join(MAPAS, part == null ? pack + '.bin' : `${pack}-${part}.bin`), 'r');
    const buf = Buffer.alloc(len); fs.readSync(fd, buf, 0, len, off); fs.closeSync(fd);
    res.writeHead(200, { 'Content-Type': 'image/png', 'Access-Control-Allow-Origin': '*' }); res.end(buf);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let m;
  if ((m = /^\/mapas\/([a-z0-9-]+\.pmtiles)$/.exec(p))) return serveRange(req, res, path.join(MAPAS, m[1]), 'application/octet-stream');
  if ((m = /^\/terreno\/([a-z0-9-]+)\/(\d+)\/(\d+)\/(\d+)\.png$/.exec(p))) return serveTerrain(res, m[1], `${m[2]}/${m[3]}/${m[4]}`);
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(root, p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(process.env.PORT || 8080, () => console.log('Serving on port ' + (process.env.PORT || 8080)));
