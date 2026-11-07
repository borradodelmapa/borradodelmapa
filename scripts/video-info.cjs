// Duración de un vídeo del blog, leída del propio mp4. Un solo sitio: la usan build-blog-viajes.js (páginas) y build-destinos.js (tarjetas).
const fs = require('fs');
const path = require('path');

function duracionMp4(file) {
  const b = fs.readFileSync(file);
  const i = b.indexOf('mvhd');
  if (i < 0) return null;
  const ver = b[i + 4];
  const scale = ver === 1 ? b.readUInt32BE(i + 24) : b.readUInt32BE(i + 16);
  const dur = ver === 1 ? Number(b.readBigUInt64BE(i + 28)) : b.readUInt32BE(i + 20);
  const sec = Math.round(dur / scale);
  return { sec, iso: `PT${Math.floor(sec / 60)}M${sec % 60}S`, txt: `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` };
}

const cache = {};
// '12:15', o '' si esa historia no tiene vídeo
function duracionDe(slug) {
  if (slug in cache) return cache[slug];
  const f = path.join(__dirname, '..', 'blog', 'viajes', 'video', slug + '.mp4');
  const d = fs.existsSync(f) ? duracionMp4(f) : null;
  return (cache[slug] = d ? d.txt : '');
}

module.exports = { duracionMp4, duracionDe };
