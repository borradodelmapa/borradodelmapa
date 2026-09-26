#!/usr/bin/env node
// Páginas fijas de las guías públicas (26 sept 2026).
//
// Por qué: una guía pública (borradodelmapa.com/<slug>) no existe como fichero —
// GitHub Pages sirve 404.html, que la pinta con JS. Para la persona funciona, pero el
// servidor responde "404" y quien no ejecuta JS (WhatsApp, Facebook, X, Google) solo
// ve "Guía de viaje · Borrado del Mapa" sin foto. Este script crea <slug>.html en la
// raíz — misma URL de siempre, ahora con código 200 — a partir de 404.html, cambiando
// SOLO la cabecera (título, descripción, foto, canónica, robots). El cuerpo es el mismo:
// la guía se sigue pintando con JS igual que hasta ahora.
//
// Uso:  node scripts/build-guias.js            (genera/actualiza/borra)
//       node scripts/build-guias.js --dry-run  (solo dice qué haría)
//
// Lee public_guides por la API REST de Firestore (lectura pública, sin credenciales;
// entra en la capa gratuita). No llama a ninguna API de pago.
// Borra la página de las guías que ya no están publicadas (lista en guias-publicas.json).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TEMPLATE = path.join(ROOT, '404.html');
const MANIFEST = path.join(ROOT, 'guias-publicas.json');
const DOMAIN = 'https://borradodelmapa.com';
const API = 'https://salma-api.borradodelmapa-api.workers.dev';
const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/borradodelmapa-85257/databases/(default)/documents/public_guides';
const FIREBASE_WEB_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA'; // la pública de index.html
// NOINDEX a propósito (Paco, 26 sept 2026), igual que /destinos/: calidad desigual entre
// guías de usuarios. La vista previa de WhatsApp/redes funciona igual con noindex.
// Para lanzar: 'index,follow,max-snippet:-1' (idealmente solo las buenas, ver isGood()).
const GUIAS_ROBOTS = 'noindex,follow';

const DRY = process.argv.includes('--dry-run');
// Nombres que nunca pueden ser una guía (ficheros/carpetas reales de la raíz)
const RESERVED = new Set(['index', '404', 'legal', 'admin', 'blog', 'destinos', 'scripts', 'worker', 'docs', 'api', 'backups', 'mockups', 'vendor']);

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function val(f) {
  if (!f) return undefined;
  if ('stringValue' in f) return f.stringValue;
  if ('integerValue' in f) return Number(f.integerValue);
  if ('doubleValue' in f) return f.doubleValue;
  if ('booleanValue' in f) return f.booleanValue;
  if ('timestampValue' in f) return f.timestampValue;
  return undefined;
}

async function fetchGuides() {
  const out = [];
  let pageToken = '';
  do {
    const url = `${FIRESTORE}?pageSize=300&key=${FIREBASE_WEB_KEY}` + (pageToken ? `&pageToken=${pageToken}` : '');
    const res = await fetch(url);
    const j = await res.json();
    if (j.error) throw new Error('Firestore: ' + j.error.message);
    for (const d of j.documents || []) {
      const f = d.fields || {};
      out.push({
        slug: d.name.split('/').pop(),
        nombre: val(f.nombre), summary: val(f.summary), destino: val(f.destino),
        cover: val(f.cover_image), owner: val(f.owner_name),
        itinerario: val(f.itinerarioIA), updatedAt: val(f.updatedAt) || val(f.createdAt),
      });
    }
    pageToken = j.nextPageToken || '';
  } while (pageToken);
  return out;
}

function routeOf(g) {
  try { return JSON.parse(g.itinerario || '{}'); } catch (_) { return {}; }
}

// Foto de la vista previa: la portada guardada; si no hay, la primera parada con foto
// (vía el proxy /photo del Worker, que la cachea en R2 — solo la 1ª vez puede costar
// una foto de Google Places); si tampoco, la imagen genérica de la web.
function imageOf(g, r) {
  if (g.cover) return g.cover;
  const st = (r.stops || []).find(s => s.photo_ref);
  if (st) return `${API}/photo?ref=${encodeURIComponent(st.photo_ref)}`;
  return `${DOMAIN}/og-image.jpg`;
}

function describe(g, r) {
  const stops = r.stops || [];
  const days = stops.length ? Math.max(...stops.map(s => s.day || 1)) : (r.duration_days || 0);
  const base = (g.summary || r.summary || '').trim();
  const meta = [days ? `${days} día${days > 1 ? 's' : ''}` : '', stops.length ? `${stops.length} paradas` : ''].filter(Boolean).join(' · ');
  let d = base || `Ruta por ${g.destino || r.region || r.country || 'el mundo'} creada con Salma.`;
  if (meta) d = `${meta}. ${d}`;
  return d.length > 200 ? d.slice(0, 197).replace(/\s+\S*$/, '') + '…' : d;
}

function buildPage(tpl, g) {
  const r = routeOf(g);
  const title = `${g.nombre || r.title || 'Guía de viaje'} · Borradodelmapa`;
  const desc = describe(g, r);
  const img = imageOf(g, r);
  const url = `${DOMAIN}/${g.slug}`;
  let h = tpl;
  const rep = (a, b) => { if (!h.includes(a)) throw new Error('plantilla 404.html cambiada: falta ' + a.slice(0, 60)); h = h.replace(a, b); };
  rep('<title id="page-title">Guía de viaje · Borrado del Mapa</title>', `<title id="page-title">${esc(title)}</title>`);
  rep('<meta name="description" id="page-desc" content="Guía de viaje creada con Salma, tu compañera de viaje.">',
    `<meta name="description" id="page-desc" content="${esc(desc)}">`);
  rep('<meta property="og:title" id="og-title" content="Guía de viaje · Borrado del Mapa">',
    `<meta property="og:title" id="og-title" content="${esc(title)}">`);
  rep('<meta property="og:description" id="og-desc" content="Guía de viaje creada con Salma, tu compañera de viaje.">',
    `<meta property="og:description" id="og-desc" content="${esc(desc)}">`);
  rep('<meta property="og:image" id="og-image" content="https://borradodelmapa.com/og-image.jpg">',
    `<meta property="og:image" id="og-image" content="${esc(img)}">\n` +
    `<meta property="og:url" content="${esc(url)}">\n` +
    `<meta name="twitter:card" content="summary_large_image">\n` +
    `<link rel="canonical" href="${esc(url)}">\n` +
    `<meta name="robots" content="${GUIAS_ROBOTS}">\n` +
    `<!-- Generado por scripts/build-guias.js — no editar a mano -->`);
  return h;
}

async function main() {
  const tpl = fs.readFileSync(TEMPLATE, 'utf8');
  const guides = (await fetchGuides()).filter(g => /^[a-z0-9-]+$/.test(g.slug) && !RESERVED.has(g.slug));
  const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
  const now = new Set(guides.map(g => g.slug));
  let written = 0, same = 0, removed = 0;
  for (const g of guides) {
    const file = path.join(ROOT, g.slug + '.html');
    const html = buildPage(tpl, g);
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === html) { same++; continue; }
    if (!DRY) fs.writeFileSync(file, html);
    written++;
  }
  for (const slug of prev) {
    if (now.has(slug)) continue;
    const file = path.join(ROOT, slug + '.html');
    if (fs.existsSync(file)) { if (!DRY) fs.unlinkSync(file); removed++; }
  }
  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify([...now].sort(), null, 1) + '\n');
  console.log(`${DRY ? '[dry-run] ' : ''}guías: ${guides.length} · escritas: ${written} · sin cambios: ${same} · borradas: ${removed}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
