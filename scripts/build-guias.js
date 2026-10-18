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
// 11 oct 2026 (Paco: "a posicionar las guías"): tras la limpieza, SOLO las guías que pasan isGood()
// salen con index y entran en sitemap-guias.xml; las demás siguen noindex. Se recalcula cada noche.
const GUIAS_ROBOTS_INDEX = 'index,follow,max-snippet:-1,max-image-preview:large';
function isGood(g) {
  const st = (routeOf(g).stops || []);
  const words = st.reduce((n, s) => n + String(s.narrative || s.description || '').split(/\s+/).filter(Boolean).length, 0);
  const geo = st.filter(s => s.lat && s.lng).length;
  return st.length >= 5 && words >= 200 && geo >= st.length * 0.8 && String(g.summary || routeOf(g).summary || '').length >= 60;
}

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
  // Las portadas de Google (lh3.googleusercontent.com) devuelven 403 a WhatsApp/redes: no valen
  // para og:image. Solo se usa la portada si es nuestra (miniatura del mapa en R2 u otra propia).
  if (g.cover && !/googleusercontent\.com|googleapis\.com/.test(g.cover)) return g.cover;
  // Ya no se usa el photo_ref de la primera parada: sus referencias caducan (404 en las guías de Nepal)
  // y pedirlas al Worker puede gastar Google Places. Sin portada propia → imagen de la marca; en cuanto
  // la guía recibe la miniatura del mapa como portada (app.js _syncPublicCover), se usa esa.
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

// Texto de la guía escrito DENTRO de la página (17-18 oct 2026, caso SEO: Search Console las dejaba en «Rastreada:
// actualmente sin indexar» porque el HTML solo traía ~11 palabras y la guía se pintaba con JS). Respeta CLAUDE.md §10
// («mirar sí»): el día 1 completo (nombre + descripción de cada parada) y, del resto de días, solo los nombres de las
// paradas. Son datos que ya son públicos en public_guides. La persona con JS pasa a la app igual que antes.
function staticBody(g, r) {
  const stops = (r.stops || []).filter(s => s && s.name);
  if (!stops.length) return '';
  const dayOf = s => Number(s.day) || 1;
  const days = [...new Set(stops.map(dayOf))].sort((a, b) => a - b);
  const first = days[0];
  const title = g.nombre || r.title || 'Guía de viaje';
  const summary = (g.summary || r.summary || '').trim();
  const text = s => String(s.narrative || s.description || '').trim();
  let h = `<section class="guia-seo" id="guia-seo">\n<h1>${esc(title)}</h1>\n`;
  if (summary) h += `<p class="guia-seo-sum">${esc(summary)}</p>\n`;
  h += `<p class="guia-seo-meta">${days.length} día${days.length > 1 ? 's' : ''} · ${stops.length} paradas${g.destino ? ' · ' + esc(g.destino) : ''}</p>\n`;
  for (const d of days) {
    const ds = stops.filter(s => dayOf(s) === d);
    h += `<h2>Día ${d}</h2>\n`;
    if (d === first) {
      h += '<ol>\n' + ds.map(s => `<li><h3>${esc(s.name)}</h3>${text(s) ? `<p>${esc(text(s))}</p>` : ''}</li>`).join('\n') + '\n</ol>\n';
    } else {
      h += '<p class="guia-seo-names">' + ds.map(s => esc(s.name)).join(' · ') + '</p>\n';
    }
  }
  h += `<p class="guia-seo-cta"><a href="/?ruta=${encodeURIComponent(g.slug)}">Abrir la ruta completa en Borrado del Mapa</a></p>\n</section>`;
  return h;
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
    `<meta name="robots" content="${isGood(g) ? GUIAS_ROBOTS_INDEX : GUIAS_ROBOTS}">\n` +
    `<!-- Generado por scripts/build-guias.js — no editar a mano -->`);
  const body = staticBody(g, r);
  if (body) {
    rep('<div class="public-loading" id="public-loading">Cargando guía...</div>\n  </div>',
      '<div class="public-loading" id="public-loading">Cargando guía...</div>\n  </div>\n  ' + body.replace(/\n/g, '\n  '));
    rep('</head>', '<style>#public-loading{display:none}.guia-seo{max-width:760px;margin:0 auto;padding:8px 16px 120px;color:#ECEBE8;font-family:Inter,sans-serif;line-height:1.6}.guia-seo h1{font:800 40px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0 0 10px}.guia-seo h2{font:700 24px/1.1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#F4630B;margin:28px 0 10px}.guia-seo h3{font:700 18px/1.2 Inter,sans-serif;margin:0 0 4px}.guia-seo ol{padding-left:20px}.guia-seo li{margin-bottom:14px}.guia-seo p{margin:0 0 8px;color:#C4C7C9}.guia-seo-meta{font-size:13px;color:#7E8285!important}.guia-seo a{color:#F4630B}</style>\n</head>');
  }
  return h;
}

async function main() {
  const tpl = fs.readFileSync(TEMPLATE, 'utf8');
  const guides = (await fetchGuides()).filter(g => /^[a-z0-9-]+$/.test(g.slug) && !RESERVED.has(g.slug));
  // La imagen del enlace (og:image) se sirve desde NUESTRO dominio (12 oct 2026): desde workers.dev
  // WhatsApp dejaba el recuadro vacío. Se copia a guias-img/<slug>.png una sola vez (si ya existe, no se
  // vuelve a bajar). Solo miniaturas de mapa propias (R2); nada de Google.
  if (!DRY) fs.mkdirSync(path.join(ROOT, 'guias-img'), { recursive: true });
  for (const g of guides) {
    if (!g.cover || !g.cover.includes('/photo/mapthumb/')) continue;
    const rel = 'guias-img/' + g.slug + '.png';
    const file = path.join(ROOT, rel);
    try {
      if (!fs.existsSync(file) && !DRY) {
        const res = await fetch(g.cover);
        const buf = Buffer.from(await res.arrayBuffer());
        if (res.ok && buf.length > 2000) fs.writeFileSync(file, buf);
      }
      if (fs.existsSync(file) || DRY) g.cover = DOMAIN + '/' + rel;
    } catch (e) { console.warn('imagen no copiada', g.slug, e.message); }
  }
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
  // Sitemap de las guías buenas (enlazado desde sitemap.xml)
  const good = guides.filter(isGood);
  const sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    good.map(g => '  <url><loc>' + DOMAIN + '/' + g.slug + '</loc>' + (g.updatedAt ? '<lastmod>' + String(g.updatedAt).slice(0, 10) + '</lastmod>' : '') + '<changefreq>monthly</changefreq><priority>0.7</priority></url>').join('\n') + '\n</urlset>\n';
  if (!DRY) fs.writeFileSync(path.join(ROOT, 'sitemap-guias.xml'), sm);
  console.log('guías buenas (index + sitemap): ' + good.length + ' de ' + guides.length);
  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify([...now].sort(), null, 1) + '\n');
  console.log(`${DRY ? '[dry-run] ' : ''}guías: ${guides.length} · escritas: ${written} · sin cambios: ${same} · borradas: ${removed}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
