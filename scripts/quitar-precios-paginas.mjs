// Quita los precios sin fuente de las páginas de destino YA PUBLICADAS (20 oct 2026, Paco: «esto fuera»), con la misma regla
// que usa build-destinos.js para las nuevas (sin-precios.mjs). Solo toca TEXTO: el visible, las descripciones para Google y los
// datos JSON-LD. No regenera las páginas (eso publicaría cambios del generador que otras sesiones aún no han sacado).
// Uso: node scripts/quitar-precios-paginas.mjs [carpeta=destinos]
import fs from 'fs';
import path from 'path';
import { sinPrecios, sinPreciosObj } from './sin-precios.mjs';

const dir = process.argv[2] || 'destinos';
const DESCR = /^(<meta\s+(?:name|property)="(?:description|og:description|twitter:description)"\s+content=")([^"]*)(")/i;
let paginas = 0, cambiadas = 0;
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
  const p = path.join(dir, f);
  const antes = fs.readFileSync(p, 'utf8');
  paginas++;
  // Trozos: <script>…</script> (JSON-LD se limpia por dentro; el resto no se toca), etiquetas y texto
  const out = antes.split(/(<script\b[^>]*>[\s\S]*?<\/script>)/i).map(trozo => {
    if (/^<script\b/i.test(trozo)) {
      const m = trozo.match(/^(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)$/i);
      if (!m) return trozo;
      try { return m[1] + JSON.stringify(sinPreciosObj(JSON.parse(m[2]))) + m[3]; } catch (_) { return trozo; }
    }
    return trozo.split(/(<[^>]+>)/).map(t => {
      if (t.startsWith('<')) { const d = t.match(DESCR); return d ? d[1] + sinPrecios(d[2]) + d[3] + t.slice(d[0].length) : t; }
      // texto entre etiquetas: se respetan los espacios/saltos de alrededor
      if (!/\d/.test(t)) return t;
      const ini = t.match(/^\s*/)[0], fin = t.match(/\s*$/)[0];
      const limpio = sinPrecios(t.trim());
      return limpio === t.trim() ? t : ini + limpio + fin;
    }).join('');
  }).join('');
  if (out !== antes) { fs.writeFileSync(p, out); cambiadas++; }
}
console.log(`${paginas} páginas · ${cambiadas} con precios quitados`);
