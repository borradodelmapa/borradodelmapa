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
        itinerario: val(f.itinerarioIA), updatedAt: val(f.updatedAt) || val(f.createdAt), createdAt: val(f.createdAt) || val(f.updatedAt),
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
  // Portada de la guía (foto de su primera parada, copiada a guias-img/<slug>-portada.jpg en main): es la «cabecera» que se
  // quiere ver al compartir por WhatsApp (Paco, 22 oct 2026). Si no hay, la miniatura del mapa.
  if (g.portada) return g.portada;
  if (g.cover && !/googleusercontent\.com|googleapis\.com/.test(g.cover)) return g.cover;
  // Ya no se usa el photo_ref de la primera parada: sus referencias caducan (404 en las guías de Nepal)
  // y pedirlas al Worker puede gastar Google Places. Sin portada propia → imagen de la marca; en cuanto
  // la guía recibe la miniatura del mapa como portada (app.js _syncPublicCover), se usa esa.
  return `${DOMAIN}/og-image.jpg`;
}

// Resumen para ENSEÑAR (21 oct 2026): el de la guía o, si no trae (guías anteriores a que el Worker lo rellenara siempre),
// los títulos de sus días, como hace ya routeFromMarkedText. No cuenta para isGood(): mostrar a Google sigue exigiendo
// un resumen de verdad.
function resumenDe(g, r) {
  const propio = (g.summary || r.summary || '').trim();
  if (propio) return propio;
  const stops = (r.stops || []).filter(s => s && s.day_title);
  const dias = [...new Set(stops.map(s => Number(s.day) || 1))].sort((a, b) => a - b);
  const titulos = [];
  for (const d of dias) { const t = String(stops.find(s => (Number(s.day) || 1) === d).day_title).trim(); if (t && !titulos.includes(t)) titulos.push(t); }
  if (!titulos.length) return '';
  const n = Math.max(...(r.stops || []).map(s => Number(s.day) || 1), dias.length);
  let txt = `${n} día${n > 1 ? 's' : ''}${g.destino ? ' por ' + g.destino : ''}, día a día:`, usados = 0;
  for (const t of titulos) { if ((txt + ' ' + t).length > 290) break; txt += (txt.endsWith(':') ? ' ' : ' · ') + t; usados++; }
  return usados ? txt + (usados < titulos.length ? '…' : '.') : '';
}

function describe(g, r) {
  // Descripción escrita para la web (Worker, guia_extra.descripcion, 22 oct 2026): sin tono de chat, ~150 caracteres.
  const ex = r.guia_extra || {};
  if (ex.descripcion && ex.descripcion.length >= 60) return ex.descripcion.length > 160 ? ex.descripcion.slice(0, 157).replace(/\s+\S*$/, '') + '…' : ex.descripcion;
  const stops = r.stops || [];
  const days = stops.length ? Math.max(...stops.map(s => s.day || 1)) : (r.duration_days || 0);
  const base = resumenDe(g, r);
  const meta = [days ? `${days} día${days > 1 ? 's' : ''}` : '', stops.length ? `${stops.length} paradas` : ''].filter(Boolean).join(' · ');
  let d = base || `Ruta por ${g.destino || r.region || r.country || 'el mundo'} creada con Salma.`;
  if (meta) d = `${meta}. ${d}`;
  return d.length > 200 ? d.slice(0, 197).replace(/\s+\S*$/, '') + '…' : d;
}

// Texto de la guía escrito DENTRO de la página (17-18 oct 2026, caso SEO: Search Console las dejaba en «Rastreada:
// actualmente sin indexar» porque el HTML solo traía ~11 palabras y la guía se pintaba con JS).
// 22 oct 2026 (Paco): las guías públicas se enseñan COMPLETAS (misma excepción que las páginas de destino, CLAUDE.md §10) y
// con todo lo que pide Google: intro, resumen rápido, un h2 por día, cada parada (h3) con su texto y su foto,
// «Antes de ir», consejos, preguntas frecuentes, enlaces a los destinos y a otras guías del país, y el botón a la app.
const YEAR = new Date().getFullYear();
const slugify = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const DESTINOS = (() => { try { return new Set(fs.readdirSync(path.join(ROOT, 'destinos')).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5))); } catch (_) { return new Set(); } })();
function paisDe(g, r) { return String(r.country || g.destino || '').trim(); }
// Página de destino de una ciudad (destinos/<ciudad>-<país>.html) o del país (destinos/<país>.html), si existe.
function destinoUrl(ciudad, pais) {
  const p = slugify(pais), c = slugify(ciudad);
  if (c && p && DESTINOS.has(`${c}-${p}`)) return `/destinos/${c}-${p}.html`;
  if (c && DESTINOS.has(c)) return `/destinos/${c}.html`;
  return '';
}
// Página de destino de la ciudad que nombra el título de un día («Paro, el Nido del Tigre» → destinos/paro-butan.html)
function destinoDeTitulo(t, pais) {
  for (const trozo of String(t || '').split(/[,:—–(]| - | a | y | de | al /)) {
    const c = trozo.trim();
    if (!c || c.split(/\s+/).length > 3) continue;
    const url = destinoUrl(c, pais);
    if (url && !url.endsWith('/' + slugify(pais) + '.html')) return { url, nombre: c };
  }
  return null;
}
function fotoParada(s) {
  if (!s.place_id) return '';
  const q = ['pid=' + encodeURIComponent(s.place_id)];
  if (s.photo_ref) q.push('ref=' + encodeURIComponent(s.photo_ref));
  if (s.name) q.push('name=' + encodeURIComponent(s.name));
  if (typeof s.lat === 'number' && typeof s.lng === 'number') q.push('lat=' + s.lat, 'lng=' + s.lng);
  return `${API}/photo?${q.join('&')}`;
}
const ANTES = [['mejor_epoca', 'Mejor época'], ['evitar', 'Cuándo evitar'], ['presupuesto', 'Presupuesto diario'], ['visado', 'Visado'],
  ['vacunas', 'Vacunas'], ['seguro', 'Seguro de viaje'], ['moverse', 'Cómo moverse entre ciudades'], ['llevar', 'Qué llevar'],
  ['moneda', 'Moneda'], ['enchufes', 'Enchufes'], ['agua', 'Agua'], ['seguridad', 'Seguridad'], ['emergencias', 'Emergencias'], ['propinas', 'Propinas']];
function staticBody(g, r, relacionadas = []) {
  const stops = (r.stops || []).filter(s => s && s.name);
  if (!stops.length) return '';
  const ex = r.guia_extra || {};
  const pais = paisDe(g, r);
  const dayOf = s => Number(s.day) || 1;
  const days = [...new Set(stops.map(dayOf))].sort((a, b) => a - b);
  const title = g.nombre || r.title || 'Guía de viaje';
  const intro = ex.intro || resumenDe(g, r);
  const text = s => String(s.narrative || s.description || '').trim();

  const antes = ex.antes_de_ir || {};
  let h = `<section class="guia-seo" id="guia-seo">\n<h1>${esc(title)}</h1>\n`;
  // Portada propia: la foto de la primera parada que la tenga (si no, el mapa de la guía), con el título encima
  const portada = (g.portada ? g.portada.replace(DOMAIN, '') : '') || stops.map(fotoParada).find(Boolean) || (fs.existsSync(path.join(ROOT, 'guias-img', g.slug + '.png')) ? `/guias-img/${g.slug}.png` : '');
  if (portada) h += `<img class="guia-seo-portada" src="${esc(portada)}" alt="${esc(title)}" fetchpriority="high" decoding="async">\n`;
  if (intro) h += `<p class="guia-seo-sum">${esc(intro)}</p>\n`;
  // Resumen rápido
  const rapido = [`<strong>${days.length} día${days.length > 1 ? 's' : ''}</strong>`, `<strong>${stops.length} paradas</strong>`];
  if (pais) rapido.push(esc(pais));
  if (antes.presupuesto) rapido.push('Presupuesto: ' + esc(antes.presupuesto));
  h += `<p class="guia-seo-meta">${rapido.join(' · ')}</p>\n`;
  // Antes de ir
  const filas = ANTES.filter(([k]) => antes[k]);
  if (filas.length) h += `<h2>Antes de ir</h2>\n<dl class="guia-seo-antes">\n` + filas.map(([k, t]) => `<dt>${t}</dt><dd>${esc(antes[k])}</dd>`).join('\n') + '\n</dl>\n';
  // Preguntas frecuentes
  const faq = (Array.isArray(ex.faq) ? ex.faq : []).filter(f => f && f.p && f.r);
  if (faq.length) h += `<h2>Preguntas frecuentes</h2>\n` + faq.map(f => `<h3>${esc(f.p)}</h3>\n<p>${esc(f.r)}</p>`).join('\n') + '\n';
  // Itinerario: un h3 por parada con su texto y su foto
  const tituloDia = d => { const s = stops.find(x => dayOf(x) === d && x.day_title); return s ? String(s.day_title).trim() : ''; };
  const pintaDia = d => {
    let o = `<p class="guia-seo-dia"><strong>Día ${d}${tituloDia(d) ? ' — ' + esc(tituloDia(d)) : ''}</strong></p>\n`;
    const viaje = (Array.isArray(r.dias_trayecto) ? r.dias_trayecto : []).find(v => Number(v.day) === d);
    if (viaje && viaje.texto) o += `<p>${esc(viaje.texto)}</p>\n`;
    for (const s of stops.filter(x => dayOf(x) === d)) {
      o += `<h3>${esc(s.name)}</h3>\n`;
      const f = fotoParada(s);
      if (f) o += `<img src="${esc(f)}" alt="${esc(s.name + (pais ? ', ' + pais : ''))}" loading="lazy" decoding="async">\n`;
      if (text(s)) o += `<p>${esc(text(s))}</p>\n`;
    }
    return o;
  };
  // Un h2 por día, en orden, con su título (lleva los sitios: «Paro, el Nido del Tigre») y enlace a la página del destino si existe.
  // Antes se agrupaba por bloques de ciudad calculados al crear la guía: no seguían las ediciones (días fuera de orden) y en
  // países con direcciones pobres salían nombres raros («CRGCV»). 22 oct 2026.
  for (const d of days) {
    const t = tituloDia(d);
    const u = destinoDeTitulo(t, pais);
    h += `<h2>Día ${d}${t ? ' — ' + esc(t) : ''}</h2>\n` + (u ? `<p class="guia-seo-dest"><a href="${u.url}">Guía de ${esc(u.nombre)}: qué ver y cuándo ir</a></p>\n` : '') + pintaDia(d).replace(/^<p class="guia-seo-dia">.*\n/, '');
  }
  // Consejos
  const tips = (Array.isArray(r.tips) ? r.tips : []).filter(t => typeof t === 'string' && t.trim());
  if (tips.length) h += `<h2>Consejos de Salma</h2>\n<ul>\n` + tips.map(t => `<li>${esc(t)}</li>`).join('\n') + '\n</ul>\n';
  // Más guías del país y su página de destino
  const paisUrl = destinoUrl(pais, '') || (DESTINOS.has(slugify(pais)) ? `/destinos/${slugify(pais)}.html` : '');
  if (relacionadas.length || paisUrl) {
    h += `<h2>Más guías${pais ? ' en ' + esc(pais) : ''}</h2>\n<ul>\n`;
    if (paisUrl) h += `<li><a href="${paisUrl}">${esc(pais)}: qué ver, cuándo ir y cómo moverse</a></li>\n`;
    h += relacionadas.map(o => `<li><a href="/${esc(o.slug)}">${esc(o.nombre || o.slug)}</a></li>`).join('\n') + '\n</ul>\n';
  }
  h += `<p class="guia-seo-cta"><a href="/?ruta=${encodeURIComponent(g.slug)}">Abrir la ruta completa en Borrado del Mapa</a> — con mapa, navegación y Salma para preguntarle lo que quieras.</p>\n</section>`;
  return h;
}

// Datos estructurados (JSON-LD): TouristTrip con cada parada como TouristAttraction (con coordenadas), migas de pan,
// preguntas frecuentes y el artículo (autor y editor).
function jsonLd(g, r, url, img, title, desc) {
  const stops = (r.stops || []).filter(s => s && s.name);
  const ex = r.guia_extra || {};
  const pais = paisDe(g, r);
  const org = { '@type': 'Organization', name: 'Borrado del Mapa', url: DOMAIN, logo: { '@type': 'ImageObject', url: `${DOMAIN}/og-image.jpg` } };
  const pub = String(ex.creada || g.createdAt || g.updatedAt || '').slice(0, 10) || undefined;
  const mod = String(g.updatedAt || ex.creada || '').slice(0, 10) || pub;
  const out = [{
    '@context': 'https://schema.org', '@type': 'TouristTrip', name: title, description: desc, url, image: img,
    ...(pais ? { touristType: 'Viajeros por libre', contentLocation: { '@type': 'Country', name: pais } } : {}),
    itinerary: { '@type': 'ItemList', numberOfItems: stops.length, itemListElement: stops.map((s, i) => ({
      '@type': 'ListItem', position: i + 1, item: { '@type': 'TouristAttraction', name: s.name,
        ...(s.narrative ? { description: String(s.narrative).slice(0, 300) } : {}),
        ...(typeof s.lat === 'number' && typeof s.lng === 'number' && (s.lat || s.lng) ? { geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng } } : {}),
        ...(s.verified_address ? { address: s.verified_address } : {}) } })) },
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Borrado del Mapa', item: DOMAIN + '/' },
      ...(pais && DESTINOS.has(slugify(pais)) ? [{ '@type': 'ListItem', position: 2, name: pais, item: `${DOMAIN}/destinos/${slugify(pais)}.html` }] : []),
      { '@type': 'ListItem', position: pais && DESTINOS.has(slugify(pais)) ? 3 : 2, name: title, item: url },
    ],
  }, {
    '@context': 'https://schema.org', '@type': 'Article', headline: title.slice(0, 110), description: desc, image: img, url,
    ...(pub ? { datePublished: pub } : {}), ...(mod ? { dateModified: mod } : {}),
    author: { '@type': 'Organization', name: 'Salma · Borrado del Mapa', url: DOMAIN }, publisher: org, mainEntityOfPage: url,
  }];
  const faq = (Array.isArray(ex.faq) ? ex.faq : []).filter(f => f && f.p && f.r);
  if (faq.length) out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })) });
  return out.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');
}

// Título de la pestaña y de Google: menos de 60 caracteres, con la palabra clave y el año.
function tituloPagina(g, r) {
  const ex = r.guia_extra || {};
  let t = ex.titulo_seo || g.nombre || r.title || 'Guía de viaje';
  if (!new RegExp('\\b' + YEAR + '\\b').test(t) && (t + ` (${YEAR})`).length <= 60) t += ` (${YEAR})`;
  return t.length + ' · Borrado del Mapa'.length <= 60 ? t + ' · Borrado del Mapa' : t;
}

function buildPage(tpl, g, relacionadas = []) {
  const r = routeOf(g);
  const title = tituloPagina(g, r);
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
    (g.createdAt ? `<meta property="article:published_time" content="${esc(String(g.createdAt))}">\n` : '') +
    (g.updatedAt ? `<meta property="article:modified_time" content="${esc(String(g.updatedAt))}">\n` : '') +
    jsonLd(g, r, url, img, title.replace(/ · Borrado del Mapa$/, ''), desc) + '\n' +
    `<!-- Generado por scripts/build-guias.js — no editar a mano -->`);
  const body = staticBody(g, r, relacionadas);
  if (body) {
    rep('<div class="public-loading" id="public-loading">Cargando guía...</div>\n  </div>',
      '<div class="public-loading" id="public-loading">Cargando guía...</div>\n  </div>\n  ' + body.replace(/\n/g, '\n  '));
    rep('</head>', '<style>#public-loading{display:none}.guia-seo{max-width:760px;margin:0 auto;padding:8px 16px 120px;color:#ECEBE8;font-family:Inter,sans-serif;line-height:1.6}.guia-seo h1{font:800 40px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0 0 10px}.guia-seo h2{font:700 24px/1.1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:#F4630B;margin:28px 0 10px}.guia-seo h3{font:700 18px/1.2 Inter,sans-serif;margin:18px 0 6px}.guia-seo .guia-seo-portada{max-height:420px;margin:0 0 14px}.guia-seo img{display:block;width:100%;max-height:340px;object-fit:cover;border-radius:12px;margin:6px 0 10px;background:#1c1f22}.guia-seo-dia{margin-top:18px!important;color:#ECEBE8!important}.guia-seo dl{display:grid;grid-template-columns:minmax(110px,30%) 1fr;gap:6px 14px}.guia-seo dt{font-weight:700;color:#ECEBE8}.guia-seo dd{margin:0;color:#C4C7C9}.guia-seo ol{padding-left:20px}.guia-seo li{margin-bottom:14px}.guia-seo p{margin:0 0 8px;color:#C4C7C9}.guia-seo-meta{font-size:13px;color:#7E8285!important}.guia-seo a{color:#F4630B}</style>\n</head>');
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
  // Portada: la foto de la primera parada que la tenga, copiada UNA vez a guias-img/<slug>-portada.jpg (nuestro dominio, no caduca).
  // Sale de /photo del Worker, que la sirve de R2 si la app ya la enseñó (0 €); si no, 1 foto de Google la primera vez (~0,007 $).
  for (const g of guides) {
    const rel = 'guias-img/' + g.slug + '-portada.jpg';
    const file = path.join(ROOT, rel);
    try {
      if (!fs.existsSync(file) && !DRY) {
        const st = (routeOf(g).stops || []).find(x => x && x.place_id && x.photo_ref);
        if (st) {
          const res = await fetch(fotoParada(st), { signal: AbortSignal.timeout(20000) });
          const buf = Buffer.from(await res.arrayBuffer());
          if (res.ok && /^image\//.test(res.headers.get('content-type') || '') && buf.length > 5000) fs.writeFileSync(file, buf);
        }
      }
      if (fs.existsSync(file)) g.portada = DOMAIN + '/' + rel;
    } catch (e) { console.warn('portada no copiada', g.slug, e.message); }
  }
  const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : [];
  const now = new Set(guides.map(g => g.slug));
  let written = 0, same = 0, removed = 0;
  for (const g of guides) {
    const file = path.join(ROOT, g.slug + '.html');
    // Hasta 6 guías del mismo país (las buenas primero) para «Más guías en …»
    const pais = slugify(paisDe(g, routeOf(g)));
    const relacionadas = pais ? guides.filter(o => o.slug !== g.slug && slugify(paisDe(o, routeOf(o))) === pais).sort((a, b) => (isGood(b) ? 1 : 0) - (isGood(a) ? 1 : 0)).slice(0, 6) : [];
    const html = buildPage(tpl, g, relacionadas);
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
  // Índice por país para que las páginas de destino enlacen a sus guías (scripts/build-destinos.js lo lee)
  const porPais = {};
  for (const g of good) {
    const p = slugify(paisDe(g, routeOf(g)));
    if (!p) continue;
    const st = routeOf(g).stops || [];
    (porPais[p] = porPais[p] || []).push({ slug: g.slug, nombre: g.nombre || routeOf(g).title || g.slug, dias: new Set(st.map(s => Number(s.day) || 1)).size });
  }
  if (!DRY) fs.writeFileSync(path.join(ROOT, 'guias-por-pais.json'), JSON.stringify(porPais, null, 1) + '\n');
  const sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    good.map(g => '  <url><loc>' + DOMAIN + '/' + g.slug + '</loc>' + (g.updatedAt ? '<lastmod>' + String(g.updatedAt).slice(0, 10) + '</lastmod>' : '') + '<changefreq>monthly</changefreq><priority>0.7</priority></url>').join('\n') + '\n</urlset>\n';
  if (!DRY) fs.writeFileSync(path.join(ROOT, 'sitemap-guias.xml'), sm);
  console.log('guías buenas (index + sitemap): ' + good.length + ' de ' + guides.length);
  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify([...now].sort(), null, 1) + '\n');
  console.log(`${DRY ? '[dry-run] ' : ''}guías: ${guides.length} · escritas: ${written} · sin cambios: ${same} · borradas: ${removed}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
