const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon' };
http.createServer((req, res) => {
  let p = req.url.split('?')[0];
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  const fp = path.join(root, p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(8080, () => console.log('Serving on http://localhost:8080'));
