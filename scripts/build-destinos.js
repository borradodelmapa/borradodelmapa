/**
 * Generador de páginas SEO de destinos
 *
 * Lee los JSONs de KV nivel 2 y genera HTMLs estáticos para cada destino.
 *
 * Uso:
 *   node scripts/build-destinos.js                → genera todas las páginas
 *   node scripts/build-destinos.js --country vn   → solo un país
 *   node scripts/build-destinos.js --dry-run      → muestra stats sin generar
 *   node scripts/build-destinos.js --index-only   → solo destinos/index.html
 *                                                    (no toca las páginas de país/destino)
 *   node scripts/build-destinos.js --sitemap-only → solo sitemap-destinos.xml
 *                                                    (no toca ninguna página)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Sin precios sin fuente en las páginas (Paco, 20 oct 2026): la misma regla que limpió las ya publicadas
import { sinPreciosObj } from './sin-precios.mjs';
// Barra del país (un país = una casa, 5 nov 2026): la misma pieza que usa el blog
import { createRequire } from 'module';
const { REDES_PIE_DESTINOS } = createRequire(import.meta.url)('./redes.cjs');
const { barraPais, historiasDe } = createRequire(import.meta.url)('./barra-pais.cjs');
const { duracionDe, portadaDe } = createRequire(import.meta.url)('./video-info.cjs');
const { BOTON_COMPARTIR, COMPARTIR_JS } = createRequire(import.meta.url)('./redes.cjs');
// Maqueta nueva de destino (Paco, 7 nov 2026), EN PRUEBA: solo estas páginas. Lo útil a la vista, fotos en «Qué hacer», preguntas visibles, iconos de línea sin emojis.
const REDISENO = new Set([
  ...['ha-long', 'hanoi', 'ninh-binh', 'phong-nha', 'hue', 'sapa', 'hoi-an', 'ho-chi-minh', 'dalat', 'phu-quoc'].map((x) => x + '-vietnam'),
  // Tanda 2 (Paco, 13 nov 2026: «el rediseño a más países, por tandas de un país»): Filipinas entera
  ...['banaue', 'batad', 'batanes', 'bohol', 'buscalan', 'cebu', 'coron-palawan', 'manila', 'palawan-el-nido', 'puerto-princesa', 'sagada', 'siargao', 'vigan'].map((x) => x + '-filipinas'),
]);
const ic = (cuerpo) => `<svg class="dg-ic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cuerpo}</svg>`;
const IC = {
  dias: ic('<rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  epoca: ic('<circle cx="12" cy="12" r="4.5"/><line x1="12" y1="1.5" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22.5"/><line x1="1.5" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22.5" y2="12"/><line x1="4.6" y1="4.6" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.3" y2="17.7"/><line x1="17.7" y1="6.3" x2="19.4" y2="4.6"/>'),
  seguridad: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  llegar: ic('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  dormir: ic('<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>'),
  comer: ic('<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>'),
  consejo: ic('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.7 4.7 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5"/>'),
  lluvia: ic('<path d="M23 12a11 11 0 0 0-22 0z"/><path d="M18 19a3 3 0 0 1-6 0v-7"/>'),
  preguntas: ic('<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17.01"/>'),
};
// Botón «Compartir info» (redes.cjs) en todas las páginas de destino y de país (Paco, 13 nov 2026; antes solo en las rediseñadas,
// y el resto tenía un «Compartir esta guía» que no hacía nada)
const COMPARTIR_CSS = `<style>.dg-fin{margin:30px 0 0;text-align:center}
.bd-compartir{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;background:var(--accent);color:var(--text-on-accent);border:1px solid var(--accent);border-radius:0;font-family:var(--font-cond);font-weight:800;font-size:15px;letter-spacing:.05em;text-transform:uppercase;cursor:pointer}.bd-compartir:hover{background:var(--dorado2);border-color:var(--dorado2)}
</style>`;
const RD_CSS = `<style>
.destino-rd .dg-ic{display:block;color:var(--accent);flex:0 0 auto}
.destino-rd .destino-hero--foto{min-height:min(50vh,400px)}.destino-rd .destino-hero-inner{padding-top:60px;padding-bottom:26px}.destino-rd .destino-hero--foto .destino-title{font-size:clamp(38px,8vw,72px)}
.destino-rd .destino-content--wide .destino-facts{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:26px}
.destino-rd .destino-content--wide .destino-fact{display:grid;grid-template-columns:auto 1fr;column-gap:14px;align-items:center;text-align:left;padding:12px 14px}
.destino-rd .destino-fact-icon{grid-row:1/3;margin:0;font-size:0}.destino-rd .destino-fact-label{margin:0;font-family:var(--font-cond);font-weight:800;font-size:12px;letter-spacing:.1em;color:var(--text-muted)}.destino-rd .destino-fact-value{margin:0;font-size:16px;font-weight:700;color:var(--text-primary)}.destino-rd .destino-fact-value span{color:inherit;background:none;border:0;padding:0;font:inherit}
@media(min-width:700px){.destino-rd .destino-content--wide .destino-facts{grid-template-columns:repeat(3,1fr)}}
.destino-rd .bd-acc{margin:0 0 24px}
.dg-sec-h{font-family:var(--font-cond);font-weight:800;font-size:clamp(26px,5vw,34px);line-height:1;text-transform:uppercase;margin:0 0 14px;color:var(--text-primary)}
.dg-mapa{margin:30px 0}.dg-mapa .destino-map{height:260px}
.dg-grid{display:grid;gap:12px;margin:0 0 34px}@media(min-width:700px){.dg-grid{grid-template-columns:1fr 1fr}}
.dg-c{border:1px solid var(--border);background:var(--bg-row);padding:16px}.dg-c h3{display:flex;align-items:center;gap:10px;font-family:var(--font-cond);font-weight:800;font-size:21px;line-height:1.1;text-transform:uppercase;margin:0 0 10px;color:var(--text-primary)}
.dg-c p{font-size:16px;line-height:1.6;color:var(--text-secondary);margin:0 0 8px}.dg-c p:last-child{margin-bottom:0}.dg-c strong{color:var(--text-primary)}.dg-c--d{border-left:4px solid var(--accent);background:rgba(244,99,11,.08)}.dg-c--a{grid-column:1/-1}
.dg-niveles{display:grid;gap:8px;margin:0}@media(min-width:700px){.dg-niveles{grid-template-columns:repeat(3,1fr)}}.dg-niveles div{border-top:2px solid var(--accent);padding-top:8px}.dg-niveles dt{font-family:var(--font-cond);font-weight:800;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin:0 0 3px}.dg-niveles dd{margin:0;font-size:16px;line-height:1.5;color:var(--text-secondary)}
.dg-faq{margin:0 0 34px;padding:22px 18px;border:1px solid var(--accent);background:var(--bg-row)}.dg-faq .dg-sec-h{display:flex;align-items:center;gap:12px}.dg-faq .dg-ic{width:28px;height:28px}
.dg-q{padding:14px 0;border-top:1px solid var(--border)}.dg-q h3{font-size:18px;line-height:1.3;font-weight:700;margin:0 0 6px;color:var(--text-primary)}.dg-q p{font-size:16px;line-height:1.6;margin:0;color:var(--text-secondary)}
</style>`;
const esDoc = (x) => x.formato === '16:9'; // documental horizontal: tarjeta a lo ancho, con la portada entera

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KV_DIR = path.join(ROOT, 'worker', 'kv', 'output-nivel2');
const ROUTES_DIR = path.join(ROOT, 'worker', 'kv', 'routes-nivel3');
const COUNTRIES_FILE = path.join(ROOT, 'worker', 'kv', 'countries.json');
const COORDS_FILE = path.join(ROOT, 'worker', 'kv', 'destinos-coords.json');
const OUT_DIR = path.join(ROOT, 'destinos');
const SITEMAP_FILE = path.join(ROOT, 'sitemap-destinos.xml');
const DOMAIN = 'https://borradodelmapa.com';

// Coords por destino (lat/lng, ver scripts/geocode-destinos.js) — gratis,
// generadas una vez con Nominatim. Si el archivo no existe aún, sin mapa.
const COORDS = fs.existsSync(COORDS_FILE) ? JSON.parse(fs.readFileSync(COORDS_FILE, 'utf-8')) : {};

// ── Helpers ──────────────────────────────────────────────────

// Guías públicas buenas por país (las escribe scripts/build-guias.js): cada página de destino enlaza a las de su país.
const GUIAS_POR_PAIS = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'guias-por-pais.json'), 'utf8')); } catch (_) { return {}; } })();
// Pie de las páginas de destino (Paco, 4 nov 2026: «imágenes, más diseño, que sea atractiva y práctica; actúa como UX»):
// las guías del país y «Más destinos» pasan de botones de texto a tarjetas con imagen — mapa con paradas para las guías
// (guias-img/<slug>.png), foto de portada para los destinos (destinos/img/<slug>/fotos.json; sin foto, tarjeta naranja con el
// nombre). En el móvil, carril que se desliza con el dedo (se ve que hay más); en escritorio, rejilla. Los enlaces siguen
// siendo <a> normales dentro de <nav> (enlazado interno para Google). El estilo va en la página (RAIL_CSS) hasta que se pase a destinos.css.
const RAIL_CSS = `<style>
.dr{margin:30px 0 8px}
.dr-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 12px}
.dr-h h2{font-family:var(--font-cond);font-weight:800;font-size:24px;line-height:1;text-transform:uppercase;margin:0;color:var(--text-primary)}
.dr-h a{font-family:var(--font-cond);font-weight:800;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);text-decoration:none;white-space:nowrap}
.dr-rail{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 12px;margin:0 -2px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;list-style:none}
.dr-rail::-webkit-scrollbar{display:none}
.dr-rail li{flex:0 0 72%;max-width:300px;scroll-snap-align:start}
.dr-rail--d li{flex-basis:44%;max-width:220px}
@media(min-width:760px){.dr-rail{display:grid;grid-template-columns:repeat(3,1fr);overflow:visible}.dr-rail--d{grid-template-columns:repeat(4,1fr)}.dr-rail li,.dr-rail--d li{max-width:none}}
.dr-c{display:block;height:100%;text-decoration:none;border:1px solid var(--border);background:var(--bg-row);color:var(--text-primary)}
.dr-c:hover{border-color:var(--accent)}
.dr-c img,.dr-ph{width:100%;aspect-ratio:2/1;object-fit:cover;display:block;border-bottom:1px solid var(--border)}
.dr-rail--d .dr-c img,.dr-rail--d .dr-ph{aspect-ratio:4/3}
.dr-ph{display:flex;align-items:flex-end;padding:10px;box-sizing:border-box;background:linear-gradient(135deg,#F4630B,#7a2e00);font-family:var(--font-cond);font-weight:800;font-size:20px;line-height:1;text-transform:uppercase;color:#fff}
.dr-t{padding:10px 12px 12px}
.dr-chip{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;margin-bottom:6px}
.dr-t strong{display:block;font-family:var(--font-cond);font-weight:800;font-size:18px;line-height:1.1;text-transform:uppercase}
.dr-cta{display:inline-block;margin-top:4px;background:var(--accent);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:15px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;padding:10px 16px}
</style>`;
function guiasDelPais(countrySlug, countryName, destName) {
  const l = (GUIAS_POR_PAIS[countrySlug] || []).slice();
  if (!l.length) return '';
  const e = escapeHTML;
  // La guía que pasa por este destino, primero (p. ej. en Sagada, «Luzón norte… Sagada…»)
  const k = String(destName || '').split(/[,(]/)[0].trim().toLowerCase();
  if (k) l.sort((a, b) => (b.nombre.toLowerCase().includes(k) ? 1 : 0) - (a.nombre.toLowerCase().includes(k) ? 1 : 0));
  const items = l.slice(0, 12).map(g => {
    // Sin mapa (guias-img/<slug>.png), la foto de portada de la guía (guias-img/<slug>-portada.jpg, la pone build-guias.js); sin ninguna, tarjeta naranja (13 nov 2026)
    const img = fs.existsSync(path.join(ROOT, 'guias-img', g.slug + '.png'))
      ? `<img src="/guias-img/${e(g.slug)}.png" alt="Mapa de la guía ${e(g.nombre)}" loading="lazy" decoding="async">`
      : fs.existsSync(path.join(ROOT, 'guias-img', g.slug + '-portada.jpg'))
      ? `<img src="/guias-img/${e(g.slug)}-portada.jpg" alt="${e(g.nombre)}" loading="lazy" decoding="async">` : `<span class="dr-ph">${e(countryName)}</span>`;
    const pasa = k && g.nombre.toLowerCase().includes(k);
    return `<li><a class="dr-c" href="/${e(g.slug)}">${img}<div class="dr-t"><span class="dr-chip">${pasa ? 'Pasa por aquí' : 'Guía con mapa'}</span><strong>${e(g.nombre)}</strong></div></a></li>`;
  }).join('');
  return `${RAIL_CSS}
    <nav class="dr" aria-label="Guías de viaje en ${e(countryName)}">
      <div class="dr-h"><h2>Guías de ${e(countryName)}</h2></div>
      <ul class="dr-rail">${items}</ul>
      <a class="dr-cta" href="/?go=chat">Hazte la tuya personalizada →</a>
    </nav>`;
}
function masDestinos(siblings, countrySlug, countryName, conCss) {
  if (!siblings || !siblings.length) return '';
  const e = escapeHTML;
  const items = siblings.map(x => {
    const h = (loadFotos(x.slug) || {}).hero;
    const img = h ? `<img src="/destinos/img/${x.slug}/${h.file}" alt="${e(h.alt || x.name)}" loading="lazy" decoding="async">` : `<span class="dr-ph">${e(x.name)}</span>`;
    return `<li><a class="dr-c" href="/destinos/${x.slug}.html">${img}<div class="dr-t">${x.menos ? '<span class="dr-chip">Menos turístico</span>' : ''}<strong>${e(x.name)}</strong></div></a></li>`;
  }).join('');
  return `${conCss ? RAIL_CSS : ''}
    <nav class="dr" aria-label="Más destinos en ${e(countryName)}">
      <div class="dr-h"><h2>Más destinos en ${e(countryName)}</h2><a href="/destinos/${countrySlug}.html">Ver todos →</a></div>
      <ul class="dr-rail dr-rail--d">${items}</ul>
    </nav>`;
}

// «Conoce <país>» (L2, 4 nov 2026): resumen del expediente aprobado del país (scripts/paises/<país>/intro.json). Sin datos, nada.
// Datos de cada país en scripts/paises/<país>/ (intro.json, sitios-extra.json, sitios-nuevos.json): ver scripts/datos-pais.cjs.
const DATOS_PAIS = createRequire(import.meta.url)('./datos-pais.cjs');
const DESTINOS_NUEVOS = DATOS_PAIS.sitiosNuevos();
const DESTINOS_EXTRA = DATOS_PAIS.extraSitios();
const PAISES_INTRO = DATOS_PAIS.introPaises();
// Maqueta (Paco, 4 nov: «necesita maquetación, imágenes y diseño atractivo»): portada a lo ancho, bloques numerados con foto y pie
// (foto solo si es de lo que se cuenta; si no, el bloque va sin foto), galería de 6 y tarjetas a los diarios del blog. Fotos ya
// revisadas de los episodios (F9) con autor (P2), enlazadas desde blog/viajes/img/. El estilo va aquí dentro (CONOCE_CSS) y solo
// sale en las páginas de país con expediente: así no hay que subir el ?v= de destinos.css ni regenerar las 1.793 páginas.
const CONOCE_CSS = `<style>
.dc{margin:40px 0 8px;border-top:1px solid var(--border)}
.dc-hero{position:relative;margin:0 0 6px;overflow:hidden;background:#000}
.dc-hero img{width:100%;aspect-ratio:16/9;max-height:520px;object-fit:cover;display:block;opacity:.82}
.dc-hero-txt{position:absolute;left:0;right:0;bottom:0;padding:28px 18px 18px;background:linear-gradient(transparent,rgba(0,0,0,.85))}
.dc-kicker{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:13px;letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;margin-bottom:8px}
.dc-hero h2{font-family:var(--font-cond);font-weight:800;font-size:clamp(34px,7vw,64px);line-height:.95;text-transform:uppercase;margin:0;color:#fff}
.dc-cap{font-size:12px;line-height:1.4;color:var(--text-muted);margin:6px 0 0}
.dc-hilo{font-size:clamp(18px,2.4vw,22px);line-height:1.55;color:var(--text-primary);border-left:4px solid var(--accent);padding:4px 0 4px 16px;margin:26px 0 30px;max-width:780px}
.dc-b{display:grid;gap:18px;margin:0 0 34px;align-items:start}
.dc-b figure{margin:0}
.dc-b img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block;border:1px solid var(--border)}
.dc-n{font-family:var(--font-cond);font-weight:800;font-size:15px;letter-spacing:.14em;color:var(--accent);display:block;margin-bottom:2px}
.dc-b h3{font-family:var(--font-cond);font-weight:800;font-size:28px;line-height:1;text-transform:uppercase;margin:0 0 10px;color:var(--text-primary)}
.dc-b p{font-size:17px;line-height:1.7;color:var(--text-secondary);margin:0}
.dc-b--sin{max-width:780px}
@media(min-width:760px){.dc-b--foto{grid-template-columns:1fr 1fr;gap:28px}.dc-b--der figure{order:2}}
.dc-gal h3,.dc-dia h3{font-family:var(--font-cond);font-weight:800;font-size:22px;letter-spacing:.06em;text-transform:uppercase;margin:6px 0 12px;color:var(--text-primary)}
.dc-gal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 30px}
@media(min-width:760px){.dc-gal-grid{grid-template-columns:repeat(3,1fr)}}
.dc-gal-grid figure{margin:0}
.dc-gal-grid img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;border:1px solid var(--border)}
.dc-dia-grid{display:grid;gap:12px;margin:0 0 26px}
@media(min-width:620px){.dc-dia-grid{grid-template-columns:1fr 1fr}}
.dc-card{display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center;text-decoration:none;border:1px solid var(--border);background:var(--bg-row);color:var(--text-primary)}
.dc-card:hover{border-color:var(--accent)}
.dc-card img{width:110px;height:110px;object-fit:cover;display:block}
.dc-card span{display:block;font-family:var(--font-cond);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}
.dc-card strong{font-size:16px;line-height:1.3;padding-right:10px;display:block}
.dc-fuentes{font-size:13px;color:var(--text-muted);line-height:1.6}
.dc-fuentes a{color:var(--text-secondary)}
</style>`;
function conocePais(countrySlug, countryName) {
  const x = PAISES_INTRO[countrySlug];
  if (!x || !x.apartados) return '';
  const e = escapeHTML;
  const cap = f => `<figcaption class="dc-cap">${e(f.pie)}${f.autor ? ` Foto: ${e(f.autor)}` : ''}</figcaption>`;
  const img = (f, alt) => `<img src="${e(f.src)}" alt="${e(alt || f.pie)}" loading="lazy" decoding="async">`;
  let nFoto = 0;
  const bloques = x.apartados.map((a, i) => {
    const n = String(i + 1).padStart(2, '0');
    const txt = `<div><span class="dc-n">${n}</span><h3>${e(a.t)}</h3><p>${e(a.p)}</p></div>`;
    return a.foto
      ? `<article class="dc-b dc-b--foto${nFoto++ % 2 ? ' dc-b--der' : ''}"><figure>${img(a.foto)}${cap(a.foto)}</figure>${txt}</article>`
      : `<article class="dc-b dc-b--sin">${txt}</article>`;
  }).join('\n      ');
  const gal = (x.galeria || []).length ? `<div class="dc-gal"><h3>En imágenes</h3><div class="dc-gal-grid">${x.galeria.map(f => `<figure>${img(f)}${cap(f)}</figure>`).join('')}</div></div>` : '';
  const dia = (x.enlaces || []).length ? `<div class="dc-dia"><h3>Diarios de viaje</h3><div class="dc-dia-grid">${x.enlaces.map(l => `<a class="dc-card" href="${e(l.u)}">${l.img ? `<img src="${e(l.img)}" alt="" loading="lazy">` : ''}<div><span>Diario de viaje</span><strong>${e(l.t)}</strong></div></a>`).join('')}</div></div>` : '';
  const fue = (x.fuentes || []).map(f => `<a href="${e(f.u)}" rel="noopener" target="_blank">${e(f.t)}</a>`).join(' · ');
  return `${CONOCE_CSS}
    <section class="dc" id="conoce">
      <figure class="dc-hero">${x.portada ? img(x.portada, `${countryName}: ${x.portada.pie}`) : ''}<div class="dc-hero-txt"><span class="dc-kicker">Antes de viajar</span><h2>Conoce ${e(countryName)}</h2></div></figure>
      ${x.portada ? cap(x.portada) : ''}
      <p class="dc-hilo">${e(x.hilo)}</p>
      ${bloques}
      ${gal}
      ${fue ? `<p class="dc-fuentes">Fuentes: ${fue}. Fotos: Wikimedia Commons, con su autor en cada pie.</p>` : ''}
    </section>`;
}

// Guías del país DESTACADAS en la página del país (Paco, 4 nov 2026: «tiene que destacar más, mínimo como los vídeos; imagen del
// mapa y sus puntos de cada guía; arriba: este país cuenta con N guías, hazte la tuya personalizada»). Imagen = guias-img/<slug>.png
// (el mapa con las paradas numeradas que ya genera build-guias.js para WhatsApp; 0 €). Sin imagen, la tarjeta sale sin ella.
// Las páginas de destino siguen con la lista sencilla (guiasDelPais).
const NUM_ES = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
function guiasDestacadas(countrySlug, countryName) {
  const l = GUIAS_POR_PAIS[countrySlug] || [];
  if (!l.length) return '';
  const e = escapeHTML;
  const n = l.length, nTxt = NUM_ES[n] || String(n);
  const cards = l.slice(0, 12).map(g => {
    const img = fs.existsSync(path.join(ROOT, 'guias-img', g.slug + '.png')) ? `<img src="/guias-img/${e(g.slug)}.png" alt="Mapa de la guía ${e(g.nombre)} con sus paradas" loading="lazy" decoding="async">` : '';
    return `<a class="dg-card" href="/${e(g.slug)}">${img}<div class="dg-txt"><span class="dg-chip">Guía con mapa</span><strong>${e(g.nombre)}</strong><em>Ver la guía completa →</em></div></a>`;
  }).join('');
  return `<style>
.dg{margin:34px 0 10px;padding:22px 18px 18px;border:1px solid var(--accent);background:rgba(244,99,11,.06)}
.dg-head h2{font-family:var(--font-cond);font-weight:800;font-size:clamp(28px,5vw,40px);line-height:1;text-transform:uppercase;margin:0 0 6px;color:var(--text-primary)}
.dg-head h2 b{color:var(--accent)}
.dg-head p{font-size:16px;line-height:1.5;color:var(--text-secondary);margin:0 0 16px}
.dg-grid{display:grid;gap:14px}
@media(min-width:700px){.dg-grid{grid-template-columns:repeat(${Math.min(n, 3)},1fr)}}
.dg-card{display:block;text-decoration:none;border:1px solid var(--border);background:var(--bg-row);color:var(--text-primary)}
.dg-card:hover{border-color:var(--accent)}
.dg-card img{width:100%;aspect-ratio:2/1;object-fit:cover;display:block;border-bottom:1px solid var(--border)}
.dg-txt{padding:12px 14px 14px}
.dg-chip{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:2px 8px;margin-bottom:8px}
.dg-txt strong{display:block;font-family:var(--font-cond);font-weight:800;font-size:22px;line-height:1.1;text-transform:uppercase;margin-bottom:8px}
.dg-txt em{font-style:normal;font-size:14px;color:var(--accent)}
.dg-cta{display:inline-block;margin-top:16px;background:var(--accent);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:17px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;padding:12px 18px}
</style>
    <section class="dg" id="guias">
      <div class="dg-head"><h2>${e(countryName)} tiene <b>${nTxt} ${n === 1 ? 'guía' : 'guías'}</b></h2>
      <p>Completas, con mapa, paradas y consejos. ¿Quieres una a tu medida? Dile a Salma cuántos días tienes y qué te gusta.</p></div>
      <div class="dg-grid">${cards}</div>
      <a class="dg-cta" href="/?go=chat">Hazte la tuya personalizada →</a>
    </section>`;
}

// «Historias de <país>» (5 nov 2026): todas las entradas del blog del país, sacadas solas de scripts/blog-viajes-data.js
// (sin borradores). Es la pestaña «Historias» de la barra del país.
function historiasPais(countryName) {
  const l = historiasDe(countryName).sort((a, b) => esDoc(b) - esDoc(a)); // los documentales, primero
  if (!l.length) return '';
  const e = escapeHTML;
  return `<style>
.dh{margin:34px 0 10px}.dh h2{font-family:var(--font-cond);font-weight:800;font-size:clamp(26px,5vw,36px);line-height:1;text-transform:uppercase;margin:0 0 6px;color:var(--text-primary)}
.dh>p{font-size:16px;color:var(--text-secondary);margin:0 0 14px}
.dh-grid{display:grid;gap:12px;grid-template-columns:1fr 1fr}@media(min-width:620px){.dh-grid{grid-template-columns:repeat(3,1fr)}}@media(min-width:960px){.dh-grid{grid-template-columns:repeat(5,1fr)}}
.dh-c{display:block;text-decoration:none;border:1px solid var(--border);background:var(--bg-row);color:var(--text-primary)}.dh-c:hover{border-color:var(--accent)}
.dh-c img{width:100%;aspect-ratio:9/16;object-fit:cover;display:block}.dh-c div{padding:8px 10px 10px}
.dh-c span{display:block;font-family:var(--font-cond);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:4px}
.dh-c strong{display:block;font-size:14px;line-height:1.3}
.dh-img{display:block;position:relative;font-style:normal}.dh-dur{position:absolute;right:6px;bottom:6px;background:rgba(13,15,16,.85);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:14px;letter-spacing:.04em;padding:2px 7px}
.dh-doc{grid-column:1/-1;border-color:var(--accent);background:rgba(244,99,11,.07)}.dh-doc img{aspect-ratio:16/9}.dh-doc strong{font-family:var(--font-cond);font-weight:800;font-size:26px;line-height:1.05}.dh-doc div{padding:12px 14px 14px}
@media(min-width:620px){.dh-doc{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);align-items:center}.dh-doc div{padding:16px 22px}.dh-doc strong{font-size:32px}}
</style>
    <section class="dh" id="historias"><h2>Historias de ${e(countryName)}</h2><p>Lo que cuentan nuestros vídeos, con más información y sus fuentes.</p>
      <div class="dh-grid">${l.map(x => `<a class="dh-c${esDoc(x) ? ' dh-doc' : ''}" href="/blog/viajes/${e(x.slug)}"><i class="dh-img"><img src="${e(portadaDe(x.slug))}" alt="" loading="lazy" decoding="async">${duracionDe(x.slug) ? `<b class="dh-dur">${duracionDe(x.slug)}</b>` : ''}</i><div><span>${esDoc(x) ? 'Documental' : e(x.serie || 'Historia')}</span><strong>${e(x.titulo)}</strong></div></a>`).join('')}</div>
    </section>`;
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHTML(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeJSON(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

const TYPE_BADGES = {
  ciudad: { emoji: '🏛️', label: 'Ciudad' },
  playa: { emoji: '🏖️', label: 'Playa' },
  naturaleza: { emoji: '🌿', label: 'Naturaleza' },
  montaña: { emoji: '⛰️', label: 'Montaña' },
  'montaña': { emoji: '⛰️', label: 'Montaña' },
  rural: { emoji: '🌾', label: 'Rural' },
  isla: { emoji: '🏝️', label: 'Isla' },
  desierto: { emoji: '🏜️', label: 'Desierto' },
  historico: { emoji: '🏛️', label: 'Histórico' },
  'histórico': { emoji: '🏛️', label: 'Histórico' },
};

// Subir a mano cada vez que se toque destinos.css — mismo criterio de "?v="
// que ya usa el resto de la app (ver CLAUDE.md, checklist de despliegue),
// para que un visitante real no se quede con el CSS viejo en caché tras un
// cambio.
const DESTINOS_CSS_V = 7;
// Igual para styles.css (el de la app, que trae el menú de abajo): antes iba SIN ?v=
// y un visitante que volviera podía ver el menú nuevo con estilos viejos. Mismo
// número que styles.css?v= en index.html — subirlo a la vez.
const APP_CSS_V = 196;
// NOINDEX a propósito (Paco, 26 sept 2026): 1.793 páginas con la misma plantilla y texto
// generado se arriesgan a que Google las trate como contenido en serie. Siguen visibles
// para quien entra, pero Google no las indexa (follow: sí sigue los enlaces). También
// se sacó sitemap-destinos.xml de sitemap.xml. Para lanzarlas: volver a
// 'index,follow,max-snippet:-1', regenerar y devolver sitemap-destinos.xml a sitemap.xml.
const DESTINOS_ROBOTS = 'noindex,follow';
// Lanzamiento GRADUAL (Paco, 10 oct 2026: "quiero que se indexen"): solo las páginas de
// scripts/destinos-indexables.json (slugs, sin .html) salen con index; el resto sigue noindex y
// fuera del sitemap. Para abrir otra tanda: añadir slugs al JSON, regenerar y subir.
const INDEXABLES = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'destinos-indexables.json'), 'utf-8')).slugs);
const robotsFor = slug => INDEXABLES.has(slug) ? 'index,follow,max-snippet:-1,max-image-preview:large' : DESTINOS_ROBOTS;

// Logo — mismo wordmark y clases que el index de la app (app.js:_renderChatEmpty,
// ".ce-top .ce-brand"), como enlace estático a "/" (ahí no hay JS de estado que
// lo controle, solo navegación).
// Eslogan — mismo texto y clases que el hero del index (app.js:590), debajo
// del logo a petición de Paco.
const LOGO_HTML = `<div class="ce-top"><a class="ce-brand" href="/"><i class="ce-mark" aria-hidden="true"></i>BORRADO<span>DEL</span>MAPA</a></div>
    <div class="ce-hero"><p class="ce-slogan">Sin mapa,<br><span>con rumbo.</span></p><a class="ce-blog" href="/blog/">Blog de viajes →</a></div>`;

// Menú inferior — ÚNICA fuente para las 1.793 páginas. Mismas clases CSS que
// la app real (app-bottom-bar/bottom-tab/bottom-tab-fab, ver styles.css), como
// enlaces estáticos (sin JS de estado — no hay sesión/salma cargados aquí).
// ⚠️ Copiado TAMBIÉN en 404.html (addBottomBar, página pública de guías) — si se
// toca aquí, tocarlo allí igual (26 sept 2026).
// Cualquier retoque futuro del menú se hace SOLO aquí y se reaplica con
// `node scripts/build-destinos.js` — nunca a mano en un HTML generado.
// "Mapa" (27 sept 2026, antes "Ayuda") lleva a la app (/?go=mapa): el mapa en
// vivo con la ruta seleccionada; sin cuenta, registro y luego el mapa.
const BOTTOM_NAV = `
  <nav class="app-bottom-bar">
    <a class="bottom-tab" href="/?go=mapa">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
      <span>Mapa</span>
    </a>
    <a class="bottom-tab" href="/?go=explorar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>
      <span>Explorar</span>
    </a>
    <div class="bottom-tab-fab-spacer" aria-hidden="true"></div>
    <a class="bottom-tab" href="/?go=rutas">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/><rect x="1" y="3" width="4" height="4" rx="1"/><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="1" y="17" width="4" height="4" rx="1"/></svg>
      <span>Mis Viajes</span>
    </a>
    <a class="bottom-tab" href="/?go=profile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Perfil</span>
    </a>
  </nav>
  <a class="bottom-tab-fab" id="tab-newroute" href="/?go=chat" aria-label="Salma" title="Salma">
    <svg class="fab-ic" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><img class="fab-avatar" src="/salma_ai_avatar.webp" alt="" width="40" height="40"><span class="bottom-tab-fab-label">Salma</span>
  </a>`;

// Firebase SDK block (reusable in all templates)
const FIREBASE_HEAD = `
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
  <script>
  const firebaseConfig={apiKey:"AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA",authDomain:"borradodelmapa-85257.firebaseapp.com",projectId:"borradodelmapa-85257",storageBucket:"borradodelmapa-85257.firebasestorage.app",messagingSenderId:"833042338746",appId:"1:833042338746:web:32b58e582488c6064d8383"};
  if(!firebase.apps.length){firebase.initializeApp(firebaseConfig);}
  </script>`;

// Variante para páginas con fotos: scripts diferidos (no bloquean el pintado; mejor LCP). El inicio vive en /destinos/firebase-init.js
const FIREBASE_HEAD_DEFER = `
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js" defer></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js" defer></script>
  <script src="/destinos/firebase-init.js" defer></script>`;

const FIREBASE_HEAD_WITH_FIRESTORE = `
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
  <script>
  const firebaseConfig={apiKey:"AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA",authDomain:"borradodelmapa-85257.firebaseapp.com",projectId:"borradodelmapa-85257",storageBucket:"borradodelmapa-85257.firebasestorage.app",messagingSenderId:"833042338746",appId:"1:833042338746:web:32b58e582488c6064d8383"};
  if(!firebase.apps.length){firebase.initializeApp(firebaseConfig);}
  </script>`;

function typeBadge(tipo) {
  const t = TYPE_BADGES[tipo?.toLowerCase()] || { emoji: '📍', label: tipo || 'Destino' };
  return `${t.emoji} ${t.label}`;
}

// Extrae precio mínimo de strings tipo "Hostel: 5-8€/noche"
function extractMinPrice(str) {
  const m = (str || '').match(/(\d+)[^\d]*€/);
  return m ? parseInt(m[1], 10) : null;
}

function estimateBudget(dest) {
  const sleepMin = extractMinPrice(dest.donde_dormir?.mochilero) || 10;
  const sleepMid = extractMinPrice(dest.donde_dormir?.medio) || 30;
  // Rough estimate: sleep + food (~60% of sleep) + transport (~20% of sleep)
  const low = Math.round(sleepMin * 1.8);
  const mid = Math.round(sleepMid * 1.8);
  return `${low}-${mid}€`;
}

// ── Route Loading ────────────────────────────────────────────

function loadRoute(destId, countrySlug) {
  const routeFile = path.join(ROUTES_DIR, `${destId}-${countrySlug}.json`);
  try {
    if (fs.existsSync(routeFile)) {
      return JSON.parse(fs.readFileSync(routeFile, 'utf-8'));
    }
  } catch (_) {}
  return null;
}

// Genera HTML estático de la guía COMPLETA (indexable por Google). Paco, 12 oct 2026: en las páginas de
// destino la guía se muestra entera, tal como la hizo la app; el registro se pide para el mapa, las fotos,
// guardar y crear más guías (el botón lleva a la app).
// Fotos de la página (destinos/img/<slug>/fotos.json, las baja scripts/fotos-destinos.cjs desde Wikimedia
// Commons con licencia libre). Sin fotos.json la página sale como antes.
function loadFotos(slug) {
  try {
    const f = path.join(OUT_DIR, 'img', slug, 'fotos.json');
    if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf-8'));
  } catch (_) {}
  return null;
}
function fotoCredito(f) {
  // Fotos nuestras: «Borrado del Mapa» enlaza a Instagram, sin licencia (Paco, 7 nov 2026)
  return `Foto: <a href="${escapeHTML(f.url)}" target="_blank" rel="noopener${f.licencia ? ' nofollow' : ''}">${escapeHTML(f.autor)}</a>${f.licencia ? ` · ${escapeHTML(f.licencia)}` : ''}`;
}

function buildStaticItinerary(route, appSlug, fotos) {
  if (!route || !route.stops || route.stops.length === 0) return '';
  // Guía pública que ya existe para este destino (ej. 'barcelona-en-3-dias-ky61'); si no, la convención <id>-<país>-ruta
  const linkSlug = route && route._public_slug ? route._public_slug : appSlug + '-ruta';

  // Agrupar stops por día
  const byDay = {};
  for (const stop of route.stops) {
    const day = stop.day || 1;
    if (!byDay[day]) byDay[day] = { stops: [], day_title: stop.day_title || '' };
    if (stop.day_title) byDay[day].day_title = stop.day_title;
    byDay[day].stops.push(stop);
  }
  const days = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
  const title = route.title || route.name || 'La guía';

  let html = '<section class="destino-itinerary-static destino-guia" id="guia">\n';
  html += `  <h2 class="destino-h2 destino-guia-title">${escapeHTML(title)}</h2>\n`;
  html += `  <p class="destino-guia-sub">${days.length} ${days.length === 1 ? 'día' : 'días'} · ${route.stops.length} paradas</p>\n`;
  if (days.length > 1) {
    html += '  <nav class="destino-day-chips" aria-label="Días de la guía">' +
      days.map(d => `<a href="#dia-${d}">Día ${d}</a>`).join('') + '</nav>\n';
  }

  let n = 0;
  for (const dayNum of days) {
    const { stops, day_title } = byDay[dayNum];
    html += `  <div class="destino-day" id="dia-${dayNum}">\n`;
    html += `    <h3 class="destino-day-band"><span>DÍA ${dayNum}</span>${day_title ? ' · ' + escapeHTML(day_title) : ''}</h3>\n`;
    for (const stop of stops) {
      n++;
      const name = stop.name || '';
      const foto = fotos && ((fotos.porIndice && fotos.porIndice[n - 1]) || (fotos.stops && fotos.stops[name]));
      html += `    <article class="destino-stop${foto ? ' destino-stop--foto' : ''}">\n`;
      html += `      <span class="destino-stop-num">${n}</span>\n`;
      if (foto) html += `      <figure class="destino-stop-foto"><img src="/destinos/img/${appSlug}/${foto.file}" alt="${escapeHTML(foto.alt)}" width="${foto.w}" height="${foto.h}" loading="lazy" decoding="async"><figcaption>${fotoCredito(foto)}</figcaption></figure>\n`;
      html += '      <div class="destino-stop-body">\n';
      html += `      <h4 class="destino-stop-name">${escapeHTML(name)}</h4>\n`;
      if (stop.headline && stop.headline.trim() && stop.headline.trim() !== name.trim()) html += `      <p class="destino-stop-headline">${escapeHTML(stop.headline)}</p>\n`;
      if (stop.narrative) html += `      <p class="destino-stop-desc">${escapeHTML(stop.narrative)}</p>\n`;
      const meta = [];
      if (stop.duration) meta.push('⏱ ' + escapeHTML(stop.duration));
      if (stop.km_from_previous) meta.push('📍 ' + stop.km_from_previous + ' km');
      if (meta.length) html += `      <span class="destino-stop-meta">${meta.join(' · ')}</span>\n`;
      html += '      </div>\n';
      html += '    </article>\n';
    }
    html += '  </div>\n';
  }

  const ctaImg = fs.existsSync(path.join(ROOT, 'guias-img', linkSlug + '.png')) ? `<img class="destino-cta-img" src="/guias-img/${linkSlug}.png" alt="Mapa de la guía ${escapeHTML(title)}" loading="lazy" width="640" height="300">` : '';
  html += `  <a class="destino-route-cta destino-route-cta-img" href="/?ruta=${linkSlug}">${ctaImg}<span class="destino-cta-body"><strong>Ábrela con el mapa interactivo y guárdala</strong><span>${days.length} ${days.length === 1 ? 'día' : 'días'} · ${route.stops.length} paradas · gratis con cuenta</span><em>ABRIR LA GUÍA →</em></span></a>\n`;
  html += '</section>';
  return html;
}

// ── FAQ Generation ───────────────────────────────────────────

function generateFAQs(dest, countryName) {
  const faqs = [];

  // 1. (Coste: quitado el 20 oct 2026 — el presupuesto no tenía fuente; ver estimateBudget)

  // 2. What to see
  const activities = (dest.que_hacer || []).slice(0, 3).join(', ');
  faqs.push({
    q: `¿Qué ver en ${dest.nombre} en ${dest.dias_recomendados || 3} días?`,
    a: `En ${dest.dias_recomendados || 3} días puedes: ${activities}. ` +
       `${dest.donde_comer ? 'Para comer: ' + dest.donde_comer : ''}`
  });

  // 3. Accommodation
  faqs.push({
    q: `¿Dónde alojarse en ${dest.nombre} barato?`,
    a: `Opciones económicas: ${dest.donde_dormir?.mochilero || 'hostels y guesthouses'}. ` +
       `Rango medio: ${dest.donde_dormir?.medio || 'hoteles boutique'}. ` +
       `Premium: ${dest.donde_dormir?.comfort || 'hoteles de lujo'}.`
  });

  // 4. Safety
  if (dest.alerta_seguridad) {
    faqs.push({
      q: `¿Es seguro viajar a ${dest.nombre}?`,
      a: `⚠️ ${dest.alerta_seguridad}. ${dest.consejo_local || ''}`
    });
  } else {
    faqs.push({
      q: `¿Es seguro viajar a ${dest.nombre}?`,
      a: `${dest.nombre} es un destino seguro para viajeros independientes. ` +
         `Consejo local: ${dest.consejo_local || 'aplica sentido común como en cualquier viaje.'}`
    });
  }

  // 5. Best time
  faqs.push({
    q: `¿Cuál es la mejor época para viajar a ${dest.nombre}?`,
    a: `La mejor época para visitar ${dest.nombre} es ${dest.mejor_epoca || 'todo el año'}. ` +
       `Se recomiendan ${dest.dias_recomendados || '3-5'} días para disfrutarlo bien.`
  });

  return faqs;
}

// ── Schema.org ───────────────────────────────────────────────

function buildSchemaOrg(dest, countryName, slug, faqs, x = {}) {
  const { fotos, route, coords, countrySlug, canonical, pageTitle } = x;
  const heroUrl = fotos && fotos.hero ? `${DOMAIN}/destinos/img/${slug}/${fotos.hero.file}` : null;
  const tourist = {
    "@type": "TouristDestination",
    "@id": `${canonical}#destino`,
    "name": dest.nombre,
    "description": dest.descripcion,
    "url": canonical,
    "touristType": [dest.tipo || "destino"],
    "containedInPlace": {
      "@type": "Country",
      "name": countryName
    }
  };
  if (heroUrl) tourist.image = heroUrl;
  if (coords) tourist.geo = { "@type": "GeoCoordinates", "latitude": coords.lat, "longitude": coords.lng };

  const crumbs = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Destinos", "item": `${DOMAIN}/destinos/` },
      { "@type": "ListItem", "position": 2, "name": countryName, "item": `${DOMAIN}/destinos/${countrySlug}.html` },
      { "@type": "ListItem", "position": 3, "name": dest.nombre, "item": canonical },
    ]
  };

  const graph = [tourist, crumbs];

  // La guía de la página, como viaje con paradas (Google entiende itinerarios)
  if (route && route.stops && route.stops.length) {
    graph.push({
      "@type": "TouristTrip",
      "name": pageTitle,
      "description": route.summary || dest.descripcion,
      "url": canonical,
      "touristType": [dest.tipo || "destino"],
      "itinerary": {
        "@type": "ItemList",
        "numberOfItems": route.stops.length,
        "itemListElement": route.stops.map((s, i) => {
          const foto = fotos && ((fotos.porIndice && fotos.porIndice[i]) || (fotos.stops && fotos.stops[s.name]));
          const place = { "@type": "TouristAttraction", "name": s.name };
          if (s.narrative) place.description = String(s.narrative).slice(0, 300);
          if (typeof s.lat === 'number' && typeof s.lng === 'number') place.geo = { "@type": "GeoCoordinates", "latitude": s.lat, "longitude": s.lng };
          if (foto) place.image = `${DOMAIN}/destinos/img/${slug}/${foto.file}`;
          return { "@type": "ListItem", "position": i + 1, "item": place };
        })
      }
    });
  }

  graph.push({
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  });

  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

// ── Maqueta nueva: mapa y ficha a la vista ──────────────────
function mapaHTML(coords, hrefGuiaApp) {
  return `<!-- MAPA — centrado en el destino, OpenStreetMap (gratis, sin API key) -->
    <a class="destino-map-link" ${hrefGuiaApp ? `href="${hrefGuiaApp}" title="Abrir la guía con su mapa"` : `href="https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}" target="_blank" rel="noopener" title="Abrir en Google Maps"`}>
      <div id="destino-map" class="destino-map"></div>
    </a>
    <script>
    window.addEventListener('load', function() {
      if (typeof L === 'undefined') return;
      // Mapa fijo, solo para situarte — sin interacción, para que la rueda del
      // ratón o un dedo sobre el mapa no atrape el scroll de la página.
      var m = L.map('destino-map', {
        zoomControl: false, attributionControl: false, scrollWheelZoom: false,
        dragging: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false
      }).setView([${coords.lat}, ${coords.lng}], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m);
      L.marker([${coords.lat}, ${coords.lng}]).addTo(m);
    });
    </script>`;
}
function rdFicha(dest, faqs, coords, hrefGuiaApp) {
  const e = escapeHTML, n = dest.nombre, d = dest.donde_dormir || {};
  return `${coords ? `<section class="dg-mapa"><h2 class="dg-sec-h">Dónde está</h2>${mapaHTML(coords, hrefGuiaApp)}</section>` : ''}
    <h2 class="dg-sec-h">Para organizarlo</h2>
    <div class="dg-grid">
      <section class="dg-c"><h3>${IC.llegar}Cómo llegar</h3><p>${e(dest.como_llegar)}</p><a class="destino-cta-subtle" href="/?go=chat">Salma te busca vuelos <span class="destino-cta-note">· te ahorra horas comparando</span></a></section>
      <section class="dg-c"><h3>${IC.comer}Dónde comer</h3><p>${e(dest.donde_comer)}</p></section>
      <section class="dg-c dg-c--a"><h3>${IC.dormir}Dónde dormir</h3><dl class="dg-niveles"><div><dt>Mochilero</dt><dd>${e(d.mochilero || '')}</dd></div><div><dt>Rango medio</dt><dd>${e(d.medio || '')}</dd></div><div><dt>Comfort</dt><dd>${e(d.comfort || '')}</dd></div></dl><a class="destino-cta-subtle" href="/?go=chat">Pídele a Salma los mejores hoteles <span class="destino-cta-note">· filtra por tu presupuesto</span></a></section>
      <section class="dg-c dg-c--d"><h3>${IC.consejo}Consejo local</h3><p>${e(dest.consejo_local)}</p></section>
      <section class="dg-c"><h3>${IC.lluvia}Plan B si llueve</h3><p>${e(dest.plan_b_lluvia)}</p></section>
    </div>
    <section class="dg-faq" id="preguntas"><h2 class="dg-sec-h">${IC.preguntas}Preguntas sobre ${e(n)}</h2>${faqs.map((f) => `<div class="dg-q"><h3>${e(f.q)}</h3><p>${e(f.a)}</p></div>`).join('')}</section>`;
}

// ── HTML Template ────────────────────────────────────────────

function buildHTML(dest, countryName, countryCode, slug, route, nav, siblings, countrySlug) {
  const accOpen = route ? ' open' : ''; // con guía completa, el resto de la ficha va abierto (se lee de seguido)
  const rd = REDISENO.has(slug);
  const extraR = rd ? DESTINOS_EXTRA[slug] : null;
  // Cómo llegar y dónde comer revisados con fuente (sitios-extra.json, 13 nov 2026) mandan sobre los del KV, que eran antiguos
  if (extraR) for (const k of ['como_llegar', 'donde_comer']) if (extraR[k]) dest = { ...dest, [k]: extraR[k] };
  // Ficha VERIFICADA (13 nov 2026, Nepal): sitios-extra.json → "ficha" sustituye campo a campo los textos del KV
  // (descripción, cómo llegar, dónde dormir, dónde comer, consejo local, plan B) y "faqs" las preguntas. El KV no se toca.
  const extraF = DESTINOS_EXTRA[slug] && DESTINOS_EXTRA[slug].ficha ? DESTINOS_EXTRA[slug] : null;
  if (extraF) dest = { ...dest, ...extraF.ficha, donde_dormir: { ...(dest.donde_dormir || {}), ...(extraF.ficha.donde_dormir || {}) } };
  const faqs = (extraR && extraR.faqs) || (extraF && extraF.faqs) || generateFAQs(dest, countryName);
  let coords = COORDS[`${countryCode}:${dest.id}`] || (typeof dest.lat === 'number' && typeof dest.lng === 'number' ? { lat: dest.lat, lng: dest.lng } : null);
  // Sin coordenadas propias: el centro de las paradas de la guía (así toda página con guía lleva mapa)
  if (!coords && route && route.stops) {
    const pts = route.stops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number');
    if (pts.length) coords = { lat: +(pts.reduce((a, s) => a + s.lat, 0) / pts.length).toFixed(5), lng: +(pts.reduce((a, s) => a + s.lng, 0) / pts.length).toFixed(5) };
  }
  const fotos = loadFotos(slug);
  const heroFoto = fotos && fotos.hero ? fotos.hero : null;
  const nDias = route ? (route.duration_days || new Set(route.stops.map(s => s.day || 1)).size) : 0;
  const conGuia = !!(route && route.stops && route.stops.length);
  // Título único por país (antes había nombres repetidos: Mar Muerto, Trípoli…) y corto
  // para que Google no lo corte (~60). La marca va en og:site_name, no en el título.
  // Con guía completa el título es lo que la gente busca: «Qué ver en X en N días».
  let pageTitle = conGuia
    ? `Qué ver en ${dest.nombre} en ${nDias} ${nDias === 1 ? 'día' : 'días'}: guía con mapa`
    : `Viajar a ${dest.nombre} (${countryName}): guía`;
  // Si el nombre es largo, el título se acorta para que Google no lo corte (máx. ~62)
  if (pageTitle.length > 62) pageTitle = conGuia ? `Qué ver en ${dest.nombre} en ${nDias} ${nDias === 1 ? 'día' : 'días'}` : `Viajar a ${dest.nombre}: guía`;
  const metaFull = conGuia
    ? `Qué ver en ${dest.nombre} (${countryName}) en ${nDias} ${nDias === 1 ? 'día' : 'días'}: ${route.stops.length} paradas con fotos y mapa${dest.mejor_epoca ? ' y mejor época: ' + dest.mejor_epoca : ''}.`
    : `Guía para viajar a ${dest.nombre} (${countryName}). ${dest.mejor_epoca ? 'Mejor época: ' + dest.mejor_epoca + '.' : ''} Dónde dormir y qué ver.`;
  const metaDesc = metaFull.length > 158 ? metaFull.slice(0, 155).replace(/\s+\S*$/, '') + '…' : metaFull;
  const canonical = `${DOMAIN}/destinos/${slug}.html`;
  const schemaOrg = buildSchemaOrg(dest, countryName, slug, faqs, { fotos, route, coords, countrySlug, canonical, pageTitle });
  const heroUrl = heroFoto ? `${DOMAIN}/destinos/img/${slug}/${heroFoto.file}` : null;
  const linkSlugGuia = route && route._public_slug ? route._public_slug : slug + '-ruta';
  // Sin guía propia (Paco, 5 nov 2026: «el mapa abre Google Maps; que abra una guía nuestra»): la guía del país que pasa por
  // este destino (la del nombre que lo contiene) o, si no pasa ninguna, la primera del país. Antes el botón apuntaba a
  // «<slug>-ruta», que en estas páginas no existe.
  const guiaPais = (() => {
    if (route) return null;
    const l = GUIAS_POR_PAIS[countrySlug] || [];
    const k = String(dest.nombre || '').split(/[,(]/)[0].trim().toLowerCase();
    return l.find(g => k && g.nombre.toLowerCase().includes(k)) || l[0] || null;
  })();
  const guiaPasa = !!(guiaPais && dest.nombre && guiaPais.nombre.toLowerCase().includes(String(dest.nombre).split(/[,(]/)[0].trim().toLowerCase()));
  const hrefGuiaApp = route ? `/?ruta=${linkSlugGuia}` : (guiaPais ? `/?ruta=${guiaPais.slug}` : null);
  const h1Text = conGuia ? `Qué ver en ${dest.nombre} en ${nDias} ${nDias === 1 ? 'día' : 'días'}` : `Viajar a ${dest.nombre}`;
  const security = dest.alerta_seguridad
    ? `<span class="destino-security-warn">⚠️ Precaución</span>`
    : `<span class="destino-security-ok">✅ Seguro</span>`;

  // «Qué hacer» a la vista, con foto (Paco, 4 nov 2026: «más info y más imágenes del destino, bien diseñado»): tarjetas
  // numeradas; la foto sale de fotos.json → que_hacer[N] (Wikimedia, revisada a ojo, con autor). Sin foto, la tarjeta va sin ella.
  // Y «Sobre <destino>» (scripts/paises/<país>/sitios-extra.json, texto propio con fuentes). Solo en páginas sin guía (con guía manda la guía).
  const qhFotos = (fotos && fotos.que_hacer) || {};
  // «<Sitio> en nuestras historias» (5 nov 2026, Paco: que la ficha y el blog no parezcan dos webs): justo bajo la portada,
  // la guía que pasa por aquí y las historias del blog de este sitio (las que lo nombran en su destino o su título).
  const nomK = String(dest.nombre || '').split(/[,(]/)[0].trim().toLowerCase();
  const histSitio = nomK.length > 2 ? historiasDe(countryName).filter(x => (x.destino && x.destino[0] === slug) || [...(x.destino || []), x.titulo || ''].join(' ').toLowerCase().includes(nomK)) : [];
  const enHistorias = (histSitio.length || (guiaPais && guiaPasa)) ? `<style>
.dx{max-width:1100px;margin:22px auto 6px;padding:0 16px}.dx h2{font-family:var(--font-cond);font-weight:800;font-size:26px;line-height:1;text-transform:uppercase;margin:0 0 12px;color:var(--text-primary)}
.dx-grid{display:grid;gap:12px;grid-template-columns:1fr 1fr}@media(min-width:760px){.dx-grid{grid-template-columns:repeat(4,1fr)}}
.dx-c{display:block;text-decoration:none;border:1px solid var(--border);background:var(--bg-row);color:var(--text-primary)}.dx-c:hover{border-color:var(--accent)}
.dx-c img{width:100%;aspect-ratio:9/16;object-fit:cover;display:block}.dx-grid{align-items:start}.dx-c.g{grid-column:span 2}.dx-c.g img{aspect-ratio:2/1}
.dx-c div{padding:8px 10px 10px}.dx-c span{display:block;font-family:var(--font-cond);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:3px}
.dx-c strong{display:block;font-size:14px;line-height:1.3}.dx-c.g,.dx-c.d{border-color:var(--accent);background:rgba(244,99,11,.07)}.dx-c.d{grid-column:span 2}.dx-c.d img{aspect-ratio:16/9}.dx-i{display:block;position:relative;font-style:normal}.dx-dur{position:absolute;right:6px;bottom:6px;background:rgba(13,15,16,.85);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:14px;letter-spacing:.04em;padding:2px 7px}
</style>
  <section class="dx"><h2>${escapeHTML(dest.nombre)} en nuestras historias</h2><div class="dx-grid">
    ${guiaPais && guiaPasa ? `<a class="dx-c g" href="${hrefGuiaApp}"><img src="/guias-img/${escapeHTML(guiaPais.slug)}.png" alt="Mapa de la guía ${escapeHTML(guiaPais.nombre)}" loading="lazy"><div><span>Guía · pasa por aquí</span><strong>${escapeHTML(guiaPais.nombre)}</strong></div></a>` : ''}
    ${histSitio.map(x => `<a class="dx-c${esDoc(x) ? ' d' : ''}" href="/blog/viajes/${escapeHTML(x.slug)}"><i class="dx-i"><img src="${escapeHTML(portadaDe(x.slug))}" alt="" loading="lazy">${duracionDe(x.slug) ? `<b class="dx-dur">${duracionDe(x.slug)}</b>` : ''}</i><div><span>${esDoc(x) ? 'Documental' : 'Historia en vídeo'}</span><strong>${escapeHTML(x.titulo)}</strong></div></a>`).join('')}
  </div></section>` : '';
  const extra = DESTINOS_EXTRA[slug];
  // «Tip de Salma» (Paco, 13 nov 2026: uno por página, concreto y comprobado): sitios-extra.json → "tip": ["párrafo", …]
  const tipHTML = extra && extra.tip ? `<style>
.dq-tip{margin:26px 0 8px;padding:20px 18px 16px;background:rgba(244,99,11,.10);border-left:5px solid var(--accent)}
.dq-tip-h{display:flex;align-items:center;gap:12px;margin:0 0 10px;font-family:var(--font-cond);font-weight:800;font-size:24px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
.dq-tip-h img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)}
.dq-tip p{font-size:17px;line-height:1.65;color:var(--text-primary);margin:0 0 10px}.dq-tip p:last-child{margin:0}
</style>
    <section class="dq-tip"><h2 class="dq-tip-h"><img src="/salma_ai_avatar.png" alt="Salma" width="56" height="56" loading="lazy">Tip de Salma</h2>${extra.tip.map(t => `<p>${escapeHTML(t)}</p>`).join('')}${extra.tip_fuente ? `<p class="dq-fuentes">Fuente: <a href="${escapeHTML(extra.tip_fuente.u)}" target="_blank" rel="noopener">${escapeHTML(extra.tip_fuente.t)}</a></p>` : ''}</section>` : '';
  // REGLA DE PACO (13 nov 2026): TIP VERIFICADO. Todo "tip" lleva "tip_fuente" {t, u}; sin fuente, el generador se para.
  if (extra && extra.tip && !extra.tip_fuente) throw new Error(`${slug}: el Tip de Salma no tiene fuente (tip_fuente). Regla: tip verificado o no sale.`);
  const sobreHTML = extra ? `<section class="dq-sobre">
      <h2>Sobre ${escapeHTML(dest.nombre)}</h2>
      ${extra.p.map(t => `<p>${escapeHTML(t)}</p>`).join('')}
      ${extra.diario ? `<a class="dq-diario" href="${escapeHTML(extra.diario.u)}">${extra.diario.img ? `<img src="${escapeHTML(extra.diario.img)}" alt="" loading="lazy">` : ''}<span><em>Diario de viaje</em><strong>${escapeHTML(extra.diario.t)}</strong></span></a>` : ''}
      <p class="dq-fuentes">Fuentes: ${(extra.fuentes || []).map(f => `<a href="${escapeHTML(f.u)}" target="_blank" rel="noopener">${escapeHTML(f.t)}</a>`).join(' · ')}</p>
    </section>` : '';
  const qhCards = ((extraR && extraR.que_hacer) || dest.que_hacer || []).map((a, n) => {
    const f = qhFotos[n];
    const [tit, ...resto] = String(a).split(/:\s/);
    const desc0 = resto.join(': '); const desc = desc0 ? desc0.charAt(0).toUpperCase() + desc0.slice(1) : '';
    return `<li class="dq-c${f ? '' : ' dq-c--sin'}">${f ? `<figure><img src="/destinos/img/${slug}/${f.file}" alt="${escapeHTML(f.alt)}" loading="lazy" decoding="async" width="${f.w}" height="${f.h}"><figcaption>${escapeHTML(f.pie)} ${fotoCredito(f)}</figcaption></figure>` : ''}<div><span class="dq-n">${String(n + 1).padStart(2, '0')}</span><h3>${escapeHTML(tit)}</h3>${desc ? `<p>${escapeHTML(desc)}</p>` : ''}</div></li>`;
  }).join('');
  const DQ_CSS = `<style>
.dq-sobre{margin:26px 0 8px}.dq-sobre h2,.dq-qh h2{font-family:var(--font-cond);font-weight:800;font-size:26px;line-height:1;text-transform:uppercase;margin:0 0 12px;color:var(--text-primary)}
.dq-sobre p{font-size:17px;line-height:1.7;color:var(--text-secondary);margin:0 0 12px}.dq-fuentes{font-size:13px!important;color:var(--text-muted)!important}.dq-fuentes a{color:var(--text-secondary)}
.dq-qh{margin:26px 0 18px}.dq-list{list-style:none;margin:0;padding:0;display:grid;gap:14px}
@media(min-width:700px){.dq-list{grid-template-columns:1fr 1fr}}
.dq-c{border:1px solid var(--border);background:var(--bg-row)}.dq-c figure{margin:0}
.dq-c img{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;object-position:50% 30%;display:block}
.dq-c figcaption{font-size:12px;line-height:1.4;color:var(--text-muted);padding:6px 12px 0}.dq-c figcaption a{color:var(--text-muted)}
.dq-c>div{padding:10px 14px 14px}.dq-n{font-family:var(--font-cond);font-weight:800;font-size:14px;letter-spacing:.14em;color:var(--accent)}
.dq-c h3{font-family:var(--font-cond);font-weight:800;font-size:21px;line-height:1.1;text-transform:uppercase;margin:2px 0 6px;color:var(--text-primary)}
.dq-c p{font-size:15px;line-height:1.55;color:var(--text-secondary);margin:0}
.dq-c--sin>div{border-top:3px solid var(--accent)}
.dq-diario{display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center;text-decoration:none;border:1px solid var(--border);background:var(--bg-row);color:var(--text-primary);margin:4px 0 12px}.dq-diario:hover{border-color:var(--accent)}.dq-diario img{width:96px;height:96px;object-fit:cover;display:block}.dq-diario em{display:block;font-style:normal;font-family:var(--font-cond);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:3px}.dq-diario strong{font-size:16px;line-height:1.3;padding-right:10px;display:block}
.dq-aviso{border:1px solid var(--accent);background:rgba(244,99,11,.08);padding:10px 12px;font-size:15px;line-height:1.5;color:var(--text-primary);margin:0 0 14px}.dq-aviso a{color:var(--accent)}
</style>`;
  const queHacerHTML = qhCards ? `
    <section class="dq-qh"><h2>Qué hacer en ${escapeHTML(dest.nombre)}</h2>${extra && extra.aviso ? `<p class="dq-aviso">⚠️ ${escapeHTML(extra.aviso.t)} <a href="${escapeHTML(extra.aviso.u)}" target="_blank" rel="noopener">${escapeHTML(extra.aviso.f)}</a></p>` : ''}<ul class="dq-list">${qhCards}</ul>
      <a class="destino-cta-subtle" href="/?go=chat">Salma te monta un plan a medida <span class="destino-cta-note">· en segundos</span></a></section>` : '';

  const activitiesHTML = (dest.que_hacer || [])
    .map(a => `          <li>${escapeHTML(a)}</li>`)
    .join('\n');

  const faqsHTML = faqs
    .map(f => `
        <div class="destino-faq-item">
          <h3>${escapeHTML(f.q)}</h3>
          <p>${escapeHTML(f.a)}</p>
        </div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(metaDesc)}">
  <meta name="theme-color" content="#050505">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <meta name="robots" content="${robotsFor(slug)}">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Borradodelmapa">
  <meta property="og:title" content="${escapeHTML(pageTitle)}">
  <meta property="og:description" content="${escapeHTML(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${heroUrl || DOMAIN + '/og-image.jpg'}">
  ${heroFoto ? `<meta property="og:image:width" content="${heroFoto.w}">
  <meta property="og:image:height" content="${heroFoto.h}">
  <meta property="og:image:alt" content="${escapeHTML(heroFoto.alt)}">` : ''}
  <meta property="og:locale" content="es_ES">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(pageTitle)}">
  <meta name="twitter:description" content="${escapeHTML(metaDesc)}">
  ${heroUrl ? `<meta name="twitter:image" content="${heroUrl}">
  <link rel="preload" as="image" href="/destinos/img/${slug}/${heroFoto.file}" fetchpriority="high">` : ''}

  ${schemaOrg}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  ${(route || coords) ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>` : ''}
  ${heroFoto ? FIREBASE_HEAD_DEFER : FIREBASE_HEAD}
  <link rel="stylesheet" href="/styles.css?v=${APP_CSS_V}">
  <link rel="stylesheet" href="/destinos.css?v=${DESTINOS_CSS_V}">
  <script src="/country-utils.js"></script>
</head>
<body class="destino-page${rd ? ' destino-rd' : ''}">

  <!-- NAV: barra del país (si el país la tiene) o la miga de siempre -->
  ${barraPais(countryName, 'sitios', [['Blog de viajes', '/blog/'], ['Destinos', '/destinos/'], [countryName, `/destinos/${slugify(countryName)}.html`], [dest.nombre]]) || `<nav class="destino-nav-bar">
    <a href="/destinos/" class="destino-nav-link">Destinos</a>
    <span class="destino-nav-sep">›</span>
    <a href="/destinos/${slugify(countryName)}.html" class="destino-nav-link">${escapeHTML(countryName)}</a>
  </nav>`}

  <!-- RELOJ — hora real del destino, gratis (Intl, sin llamar a ninguna API).
       Mismo lenguaje visual que el reloj del index de la app (.chat-empty/.ce-sky-date). -->
  <div class="chat-empty destino-clock-wrap">
    ${LOGO_HTML}
    <div class="ce-sky-date" id="destino-clock">${escapeHTML(countryName)}</div>
  </div>
  <script>
  (function() {
    var el = document.getElementById('destino-clock');
    if (!el || typeof countryTimeString !== 'function') return;
    function tick() { el.textContent = countryTimeString('${countryCode.toUpperCase()}'); }
    tick();
    setInterval(tick, 30000);
  })();
  </script>

  <!-- HERO -->
  ${heroFoto ? `<section class="destino-hero destino-hero--foto">
    <img class="destino-hero-img" src="/destinos/img/${slug}/${heroFoto.file}" alt="${escapeHTML(heroFoto.alt)}" width="${heroFoto.w}" height="${heroFoto.h}" fetchpriority="high" decoding="async">
    <div class="destino-hero-shade"></div>
    <div class="destino-hero-inner">
      <span class="destino-badge">${rd ? typeBadge(dest.tipo).replace(/^\S+\s/, '') : typeBadge(dest.tipo)}</span>
      <h1 class="destino-title">${escapeHTML(h1Text)}</h1>
      <p class="destino-subtitle">${escapeHTML(dest.region || '')} · ${escapeHTML(countryName)}</p>
      ${conGuia ? `<a class="destino-hero-cta" href="#guia">Ver la guía de ${nDias} ${nDias === 1 ? 'día' : 'días'} ↓</a>` : ''}
    </div>
    <p class="destino-hero-credit">${fotoCredito(heroFoto)}</p>
  </section>` : `<section class="destino-hero">
    <div class="destino-hero-nav">
      ${nav?.prev ? `<a href="/destinos/${nav.prev.slug}.html" class="destino-arrow destino-arrow-prev" title="${escapeHTML(nav.prev.name)}">‹</a>` : '<span class="destino-arrow destino-arrow-disabled">‹</span>'}
      <div class="destino-hero-center">
        <span class="destino-badge">${typeBadge(dest.tipo)}</span>
        <h1 class="destino-title">${escapeHTML(h1Text)}</h1>
        <p class="destino-subtitle">${escapeHTML(dest.region || '')} · ${escapeHTML(countryName)}</p>
      </div>
      ${nav?.next ? `<a href="/destinos/${nav.next.slug}.html" class="destino-arrow destino-arrow-next" title="${escapeHTML(nav.next.name)}">›</a>` : '<span class="destino-arrow destino-arrow-disabled">›</span>'}
    </div>
  </section>`}

  ${enHistorias}

  <!-- CONTENT -->
  <main class="destino-content${heroFoto ? ' destino-content--wide' : ''}">
  ${heroFoto ? '<div class="destino-layout"><aside class="destino-side">' : ''}

    ${!rd && coords ? mapaHTML(coords, hrefGuiaApp) : ''}
  ${heroFoto ? `${hrefGuiaApp ? `<a class="destino-side-cta" href="${hrefGuiaApp}"><strong>${guiaPais ? escapeHTML(guiaPais.nombre) : 'Esta guía en tu móvil'}</strong><span>${guiaPais ? (guiaPasa ? 'La guía que pasa por aquí, con' : `Nuestra guía de ${escapeHTML(countryName)}, con`) : 'Con'} mapa interactivo, para guardarla y llevarla en el viaje. Gratis con cuenta.</span><em>ABRIR LA GUÍA →</em></a>` : `<a class="destino-side-cta" href="/?go=chat"><strong>Tu guía de ${escapeHTML(dest.nombre)}</strong><span>Dile a Salma cuántos días tienes y te la hace con mapa.</span><em>HAZTE LA TUYA →</em></a>`}
  </aside><div class="destino-main">` : ''}

    <!-- Descripción -->
    <p class="destino-desc">${escapeHTML((extraR && extraR.descripcion) || dest.descripcion)}</p>${rd ? `
    <div class="bd-acc">${BOTON_COMPARTIR}</div>` : ''}
    ${route && !heroFoto ? `<a class="destino-jump" href="#guia">Ver la guía de ${route.duration_days || ''} días ↓</a>` : ''}

    <!-- Datos rápidos -->
    <div class="destino-facts">
      <div class="destino-fact">
        <span class="destino-fact-icon">${rd ? IC.dias : '📅'}</span>
        <span class="destino-fact-label">DÍAS RECOMENDADOS</span>
        <span class="destino-fact-value">${dest.dias_recomendados || '3-5'}</span>
      </div>
      <div class="destino-fact">
        <span class="destino-fact-icon">${rd ? IC.epoca : '🗓️'}</span>
        <span class="destino-fact-label">MEJOR ÉPOCA</span>
        <span class="destino-fact-value">${escapeHTML(dest.mejor_epoca || 'Todo el año')}</span>
      </div>
      <div class="destino-fact">
        <span class="destino-fact-icon">${rd ? IC.seguridad : '🔒'}</span>
        <span class="destino-fact-label">SEGURIDAD</span>
        <span class="destino-fact-value">${rd ? escapeHTML((extraR && extraR.seguridad) || (dest.alerta_seguridad ? 'Precaución' : 'Seguro')) : security}</span>
      </div>
    </div>

    ${route ? buildStaticItinerary(route, slug, fotos) + (extra && extra.sobre ? DQ_CSS + sobreHTML + tipHTML : '') : ((sobreHTML || queHacerHTML) ? DQ_CSS + sobreHTML + tipHTML + queHacerHTML : '')}

    ${rd ? rdFicha(dest, faqs, coords, hrefGuiaApp) : `<!-- Más info en acordeón -->
    <div class="destino-accordion">

      <details class="destino-acc-item" open>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">✈️ Cómo llegar</h2></summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.como_llegar)}</p>
          <a class="destino-cta-subtle" href="/?go=chat">Salma te busca vuelos <span class="destino-cta-note">· te ahorra horas comparando</span></a>
        </div>
      </details>

      <details class="destino-acc-item"${accOpen}>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">🛏️ Dónde dormir</h2></summary>
        <div class="destino-acc-body">
          <div class="destino-dormir-grid">
            <div class="destino-dormir-card">
              <span class="destino-dormir-label">MOCHILERO</span>
              <p>${escapeHTML(dest.donde_dormir?.mochilero || '')}</p>
            </div>
            <div class="destino-dormir-card">
              <span class="destino-dormir-label">RANGO MEDIO</span>
              <p>${escapeHTML(dest.donde_dormir?.medio || '')}</p>
            </div>
            <div class="destino-dormir-card">
              <span class="destino-dormir-label">COMFORT</span>
              <p>${escapeHTML(dest.donde_dormir?.comfort || '')}</p>
            </div>
          </div>
          <a class="destino-cta-subtle" href="/?go=chat">Pídele a Salma los mejores hoteles <span class="destino-cta-note">· filtra por tu presupuesto</span></a>
        </div>
      </details>

${(route || queHacerHTML) ? '' : `      <details class="destino-acc-item"${accOpen}>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">🎯 Qué hacer</h2></summary>
        <div class="destino-acc-body">
          <ul class="destino-list">
${activitiesHTML}
          </ul>
          <a class="destino-cta-subtle" href="/?go=chat">Salma te monta un plan a medida <span class="destino-cta-note">· en segundos</span></a>
        </div>
      </details>`}

      <details class="destino-acc-item"${accOpen}>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">🍽️ Dónde comer</h2></summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.donde_comer)}</p>
        </div>
      </details>

      <details class="destino-acc-item destino-highlight"${accOpen}>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">💡 Consejo local</h2></summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.consejo_local)}</p>
        </div>
      </details>

      <details class="destino-acc-item"${accOpen}>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">🌧️ Plan B si llueve</h2></summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.plan_b_lluvia)}</p>
        </div>
      </details>

      <details class="destino-acc-item"${accOpen}>
        <summary class="destino-acc-header"><h2 class="destino-acc-h2">❓ Preguntas frecuentes</h2></summary>
        <div class="destino-acc-body">
          ${faqsHTML}
        </div>
      </details>

    </div>`}

    <!-- GUÍAS DEL PAÍS — enlazado interno a las guías públicas -->
    ${guiasDelPais(countrySlug, countryName, dest.nombre)}

    <!-- MÁS DESTINOS EN EL PAÍS — enlazado interno -->
    ${masDestinos(siblings, countrySlug, countryName, !(GUIAS_POR_PAIS[countrySlug] || []).length)}

    <!-- SHARE -->
    <div class="dg-fin">${BOTON_COMPARTIR}</div>

    <!-- SALMA — solo saludo como gancho, sin chat interactivo anónimo: para
         seguir hablando con ella hace falta entrar (gratis), como en el resto
         de la app. Nada de esto llama al Worker. -->
    <a class="destino-salma-section" href="/?go=chat">
      <div class="destino-salma-header">
        <img class="salma-chat-avatar" src="/salma_ai_avatar.png" alt="Salma" width="28" height="28">
        <span class="destino-salma-title">Pregúntale a Salma sobre ${escapeHTML(dest.nombre)}</span>
      </div>
      <div class="salma-chat-body">
        <div class="salma-chat-bubble">¡Ey! Estás viendo ${escapeHTML(dest.nombre)}. ¿En qué te ayudo?</div>
      </div>
      <div class="destino-salma-cta">Seguir hablando con Salma <span>→</span></div>
    </a>
  ${heroFoto ? '</div></div>' : ''}
  </main>

  <!-- FOOTER -->
  <footer class="destino-footer">
    <div class="destino-footer-links">
      <a href="/legal.html">Términos y condiciones</a>
      <a href="/legal.html#privacidad">Privacidad</a>
      <a href="/legal.html#cookies">Cookies</a>
    </div>
    ${REDES_PIE_DESTINOS}
    <p class="destino-footer-copy">© ${new Date().getFullYear()} Borradodelmapa</p>
  </footer>

  <script>
  window.DESTINO = ${JSON.stringify({ nombre: dest.nombre, pais: countryName, id: dest.id, code: countryCode })};
  window.SALMA_API = "https://salma-api.borradodelmapa-api.workers.dev";
  </script>
  <script src="/destinos/destinos.js"${heroFoto ? " defer" : ""}></script>

  ${rd ? RD_CSS : ''}${COMPARTIR_CSS}${COMPARTIR_JS}
  ${BOTTOM_NAV}
<script src="/instalar-app.js?v=2" defer></script>
<script src="/ga4.js?v=1" defer></script>
</body>
</html>`;
}

// ── Continentes ──────────────────────────────────────────────

const CONTINENTS = {
  'Europa': ['al','ad','at','by','be','ba','bg','hr','cy','cz','dk','ee','fi','fr','de','gr','hu','is','ie','it','kz','lv','li','lt','lu','mk','mt','md','mc','me','nl','no','pl','pt','ro','ru','sm','rs','sk','si','es','se','ch','ua','gb','va'],
  'Asia': ['af','am','az','bd','bt','bn','kh','cn','cy','ge','in','id','ir','iq','il','jp','jo','kz','kw','kg','la','lb','my','mv','mn','mm','np','kp','kr','om','pk','ps','ph','qa','sa','sg','lk','sy','tj','th','tl','tm','tr','ae','uz','vn','ye'],
  'África': ['dz','ao','bj','bw','bf','bi','cv','cm','cf','td','km','cg','cd','ci','dj','eg','gq','er','sz','et','ga','gm','gh','gn','gw','ke','ls','lr','ly','mg','mw','ml','mr','mu','ma','mz','na','ne','ng','rw','st','sn','sc','sl','so','za','ss','sd','tz','tg','tn','ug','zm','zw'],
  'América del Norte': ['ca','cr','cu','dm','do','sv','gt','ht','hn','jm','mx','ni','pa','tt','us'],
  'América del Sur': ['ar','bo','br','cl','co','ec','gy','py','pe','sr','uy','ve'],
  'Oceanía': ['au','fj','ki','fm','nr','nz','pw','pg','ws','to','tv','vu'],
  'Caribe': ['ag','bs','bb','bz','gd','kn','lc','vc'],
};

function getContinent(code) {
  for (const [cont, codes] of Object.entries(CONTINENTS)) {
    if (codes.includes(code)) return cont;
  }
  return 'Otros';
}

// ── Country Page Template ────────────────────────────────────

function buildCountryHTML(countryName, countryCode, destinos) {
  const countrySlug = slugify(countryName);
  const pageTitle = `Viajar a ${countryName}: ${destinos.length} destinos imprescindibles · Borradodelmapa`;
  // (sin «presupuesto» — no tenía fuente — ni «IA»: en textos públicos nunca se dice «IA», 20 oct 2026)
  const metaDesc = `Guía para viajar a ${countryName}. Los ${destinos.length} mejores destinos con alojamiento y consejos. Planifica tu ruta con Salma.`;
  const canonical = `${DOMAIN}/destinos/${countrySlug}.html`;

  // (5 nov 2026, Paco: «maqueta bien»: la foto pasa de miniatura a foto grande arriba de la tarjeta.)
  // Miniatura de cada destino (Paco, 4 nov 2026: «10 destinos ha de llevar también una imagen… miniatura, para no competir
  // tanto» con «Conoce <país>»): la portada de destinos/img/<slug>/fotos.json, pequeña a la derecha. Sin foto, la tarjeta como antes.
  let hayMini = false;
  const cardDe = (dest) => {
    const destSlug = `${dest.id}-${countrySlug}`;
    const badge = typeBadge(dest.tipo);
    const fh = (loadFotos(destSlug) || {}).hero;
    if (fh) hayMini = true;
    const mini = fh ? `<img class="dcc-mini" src="/destinos/img/${destSlug}/${fh.file}" alt="${escapeHTML(fh.alt || dest.nombre)}" loading="lazy" decoding="async">` : '';
    return `
      <a href="/destinos/${destSlug}.html" class="destino-country-card${fh ? ' dcc-con-mini' : ''}${dest.menos_turistico ? ' dcc-menos' : ''}">
        ${mini}<div class="destino-country-card-badge">${dest.menos_turistico ? '<span class="dcc-chip">Menos turístico</span> ' : ''}${badge}</div>
        <h3 class="destino-country-card-title">${escapeHTML(dest.nombre)}</h3>
        <p class="destino-country-card-desc">${escapeHTML((dest.descripcion || '').substring(0, 120))}...</p>
        <div class="destino-country-card-meta">
          <span>${dest.dias_recomendados || 3} ${(dest.dias_recomendados || 3) === 1 ? 'día' : 'días'}</span>
        </div>
      </a>`;
  };
  // «Lo menos turístico» primero y destacado (Paco, 5 nov 2026), después los clásicos
  const menos = destinos.filter(x => x.menos_turistico), resto = destinos.filter(x => !x.menos_turistico);
  const cardsHTML = menos.length
    ? `</div><h2 class="dcc-h">Lo menos turístico</h2><p class="dcc-sub">Donde siguen vivas las culturas de ${escapeHTML(countryName)}: menos gente y más que entender.</p><div class="destino-country-grid">${menos.map(cardDe).join('')}</div><h2 class="dcc-h">Los clásicos</h2><div class="destino-country-grid">${resto.map(cardDe).join('')}`
    : destinos.map(cardDe).join('');

  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Destinos en ${countryName}`,
    "description": metaDesc,
    "numberOfItems": destinos.length,
    "itemListElement": destinos.map((dest, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": dest.nombre,
      "url": `${DOMAIN}/destinos/${dest.id}-${countrySlug}.html`
    }))
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(metaDesc)}">
  <meta name="theme-color" content="#050505">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <meta name="robots" content="${robotsFor(countrySlug)}">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Borradodelmapa">
  <meta property="og:title" content="${escapeHTML(pageTitle)}">
  <meta property="og:description" content="${escapeHTML(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/og-image.jpg">
  <meta property="og:locale" content="es_ES">

  <script type="application/ld+json">${schemaOrg}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v=${APP_CSS_V}">
  <link rel="stylesheet" href="/destinos.css?v=${DESTINOS_CSS_V}">
  <script src="/country-utils.js"></script>
  ${FIREBASE_HEAD_WITH_FIRESTORE}
</head>
<body class="destino-page">

  <!-- NAV: barra del país (si la tiene) -->
  ${barraPais(countryName, '', [['Blog de viajes', '/blog/'], ['Destinos', '/destinos/'], [countryName]]) || `<nav class="destino-nav-bar">
    <a href="/destinos/" class="destino-nav-link">Destinos</a>
  </nav>`}

  <div class="chat-empty destino-clock-wrap">
    ${LOGO_HTML}
    <div class="ce-sky-date" id="destino-clock">${escapeHTML(countryName)}</div>
  </div>
  <script>
  (function() {
    var el = document.getElementById('destino-clock');
    if (!el || typeof countryTimeString !== 'function') return;
    function tick() { el.textContent = countryTimeString('${countryCode.toUpperCase()}'); }
    tick();
    setInterval(tick, 30000);
  })();
  </script>

  ${(() => {
    // Portada del país con foto (recorrido aprobado por Paco, 5 nov 2026: «País: foto, quién es, qué tiene»).
    // Foto: la elegida para el país en blog/viajes/img/paises/<slug>.jpg; si no hay, la de su primer sitio con foto.
    const cs = slugify(countryName);
    const fp = fs.existsSync(path.join(ROOT, 'blog', 'viajes', 'img', 'paises', cs + '.jpg')) ? `/blog/viajes/img/paises/${cs}.jpg`
      : (() => { for (const d of destinos) { const h = (loadFotos(`${d.id}-${cs}`) || {}).hero; if (h) return `/destinos/img/${d.id}-${cs}/${h.file}`; } return null; })();
    const nG = (GUIAS_POR_PAIS[cs] || []).length, nH = historiasDe(countryName).length;
    const tiene = [`<a href="#sitios">${destinos.length} sitios</a>`, nG ? `<a href="#guias">${nG} ${nG === 1 ? 'guía' : 'guías'}</a>` : '', nH ? `<a href="#historias">${nH} ${nH === 1 ? 'historia' : 'historias'}</a>` : ''].filter(Boolean).join(' · ');
    return fp ? `<section class="destino-hero destino-hero--foto">
    <img class="destino-hero-img" src="${fp}" alt="${escapeHTML(countryName)}" fetchpriority="high" decoding="async">
    <div class="destino-hero-shade"></div>
    <div class="destino-hero-inner">
      <h1 class="destino-title">Viajar a ${escapeHTML(countryName)}</h1>
      <p class="destino-subtitle dp-tiene">${tiene}</p>
    </div>
  </section>
  <style>.dp-tiene a{color:inherit;text-decoration:none;border-bottom:1px solid currentColor}</style>` : `<section class="destino-hero">
    <h1 class="destino-title">Viajar a ${escapeHTML(countryName)}</h1>
    <p class="destino-subtitle dp-tiene">${tiene}</p>
  </section>
  <style>.dp-tiene a{color:inherit;text-decoration:none;border-bottom:1px solid currentColor}</style>`;
  })()}

  <main class="destino-content destino-content-wide">
    ${hayMini ? `<style>.dcc-con-mini{padding:0!important;overflow:hidden}.dcc-mini{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;margin:0 0 12px}.dcc-con-mini>.destino-country-card-badge,.dcc-con-mini>.destino-country-card-title,.dcc-con-mini>.destino-country-card-desc{padding:0 18px}.dcc-con-mini>.destino-country-card-meta{padding:0 18px 16px}.dcc-menos{border-color:var(--accent)!important;background:rgba(244,99,11,.07)!important}.dcc-chip{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-cond);font-weight:800;font-size:11px;letter-spacing:.1em;text-transform:uppercase;padding:2px 7px;margin-right:6px}.dcc-h{font-family:var(--font-cond);font-weight:800;font-size:clamp(26px,5vw,36px);line-height:1;text-transform:uppercase;margin:26px 0 6px;color:var(--text-primary)}.dcc-sub{font-size:16px;color:var(--text-secondary);margin:0 0 14px}</style>` : ''}
    <div id="sitios" class="destino-country-grid">
      ${cardsHTML}
    </div>

    ${guiasDestacadas(countrySlug, countryName)}

    ${conocePais(countrySlug, countryName)}

    ${historiasPais(countryName)}

    <!-- RUTAS DE LA COMUNIDAD -->
    <section class="destino-community" id="destino-community" style="display:none">
      <h2 class="destino-index-continent-title">Rutas de viajeros</h2>
      <div class="destino-community-grid" id="destino-community-grid"></div>
    </section>

    <div class="dg-fin">${BOTON_COMPARTIR}</div>

    <!-- SALMA — solo saludo como gancho (ver mismo criterio en buildHTML) -->
    <a class="destino-salma-section" href="/?go=chat">
      <div class="destino-salma-header">
        <img class="salma-chat-avatar" src="/salma_ai_avatar.png" alt="Salma" width="28" height="28">
        <span class="destino-salma-title">Planifica tu viaje a ${escapeHTML(countryName)}</span>
      </div>
      <div class="salma-chat-body">
        <div class="salma-chat-bubble">¡Ey! ¿Quieres viajar a ${escapeHTML(countryName)}? Pregúntame lo que quieras.</div>
      </div>
      <div class="destino-salma-cta">Seguir hablando con Salma <span>→</span></div>
    </a>
  </main>

  <footer class="destino-footer">
    <div class="destino-footer-links">
      <a href="/legal.html">Términos y condiciones</a>
      <a href="/legal.html#privacidad">Privacidad</a>
      <a href="/legal.html#cookies">Cookies</a>
    </div>
    ${REDES_PIE_DESTINOS}
    <p class="destino-footer-copy">© ${new Date().getFullYear()} Borradodelmapa</p>
  </footer>

  ${COMPARTIR_CSS}${COMPARTIR_JS}
  ${BOTTOM_NAV}
  <script>
  window.DESTINO = ${JSON.stringify({ nombre: countryName, pais: countryName, id: countryCode, code: countryCode })};
  window.SALMA_API = "https://salma-api.borradodelmapa-api.workers.dev";
  </script>
  <script src="/destinos/destinos.js"></script>
<script src="/instalar-app.js?v=2" defer></script>
<script src="/ga4.js?v=1" defer></script>
</body>
</html>`;
}

// ── Index Page Template ──────────────────────────────────────

function buildIndexHTML(countriesByContinent) {
  const pageTitle = 'Destinos de viaje — Guías por país · Borradodelmapa';
  const metaDesc = 'Explora más de 190 países con guías de viaje prácticas. Alojamiento, qué hacer y consejos locales. Planifica tu ruta con Salma.';

  let continentsHTML = '';
  for (const [continent, countries] of Object.entries(countriesByContinent)) {
    if (countries.length === 0) continue;
    const cardsHTML = countries.map(c => `
        <a href="/destinos/${slugify(c.name)}.html" class="destino-index-card">
          <span class="destino-index-card-name">${escapeHTML(c.name)}</span>
          <span class="destino-index-card-count">${c.numDestinos} destinos</span>
        </a>`).join('');

    continentsHTML += `
      <section class="destino-index-continent">
        <h2 class="destino-index-continent-title">${escapeHTML(continent)}</h2>
        <div class="destino-index-grid">
          ${cardsHTML}
        </div>
      </section>`;
  }

  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Destinos de viaje",
    "description": metaDesc,
    "url": `${DOMAIN}/destinos/`
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(metaDesc)}">
  <meta name="theme-color" content="#050505">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <meta name="robots" content="${robotsFor('index')}">
  <link rel="canonical" href="${DOMAIN}/destinos/">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Borradodelmapa">
  <meta property="og:title" content="${escapeHTML(pageTitle)}">
  <meta property="og:description" content="${escapeHTML(metaDesc)}">
  <meta property="og:url" content="${DOMAIN}/destinos/">
  <meta property="og:image" content="${DOMAIN}/og-image.jpg">
  <meta property="og:locale" content="es_ES">

  <script type="application/ld+json">${schemaOrg}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  ${FIREBASE_HEAD}
  <link rel="stylesheet" href="/styles.css?v=${APP_CSS_V}">
  <link rel="stylesheet" href="/destinos.css?v=${DESTINOS_CSS_V}">
</head>
<body class="destino-page">

  <!-- Sin reloj aquí (no hay un destino concreto al que darle hora) — solo logo+eslogan. -->
  <div class="chat-empty destino-clock-wrap">
    ${LOGO_HTML}
  </div>

  <section class="destino-hero">
    <h1 class="destino-title">Destinos</h1>
    <p class="destino-subtitle">MÁS DE 190 PAÍSES · GUÍAS PRÁCTICAS</p>
  </section>

  <main class="destino-content destino-content-wide">

    <!-- Salma input -->
    <div class="destino-salma-input-wrap">
      <div class="salma-chat-input-bar salma-input-hero">
        <input type="text" class="salma-chat-input" id="destino-search" placeholder="" autocomplete="off" data-placeholders="Marruecos 5 días desde Tánger|Vietnam 2 semanas mochilero|Roma fin de semana romántico|Nepal trekking Everest|Tailandia playas e islas 10 días">
        <button class="salma-mic" id="salma-mic" type="button" aria-label="Hablar">🎙️</button>
        <button class="salma-chat-send" id="destino-planear" type="button">›</button>
      </div>
    </div>

    <!-- Últimas guías visitadas -->
    <section class="destino-recent" id="destino-recent" style="display:none">
      <h2 class="destino-index-continent-title">Últimas guías visitadas</h2>
      <div class="destino-index-grid" id="destino-recent-grid"></div>
    </section>

    <!-- Países por continente -->
    <div id="destino-countries">
    ${continentsHTML}
    </div>

    <!-- SALMA — solo saludo (ver mismo criterio en buildHTML/buildCountryHTML) -->
    <a class="destino-salma-section" href="/?go=chat">
      <div class="destino-salma-header">
        <img class="salma-chat-avatar" src="/salma_ai_avatar.png" alt="Salma" width="28" height="28">
        <span class="destino-salma-title">¿No encuentras tu destino? Pregúntale a Salma</span>
      </div>
      <div class="salma-chat-body">
        <div class="salma-chat-bubble">Dime adónde quieres ir y te armo la ruta en un minuto.</div>
      </div>
      <div class="destino-salma-cta">Seguir hablando con Salma <span>→</span></div>
    </a>
  </main>

  <footer class="destino-footer">
    <div class="destino-footer-links">
      <a href="/legal.html">Términos y condiciones</a>
      <a href="/legal.html#privacidad">Privacidad</a>
      <a href="/legal.html#cookies">Cookies</a>
    </div>
    ${REDES_PIE_DESTINOS}
    <p class="destino-footer-copy">© ${new Date().getFullYear()} Borradodelmapa</p>
  </footer>

  ${BOTTOM_NAV}
  <script>
  window.DESTINO = { nombre: 'Destinos', pais: '', id: 'index', code: '' };
  window.SALMA_API = "https://salma-api.borradodelmapa-api.workers.dev";
  </script>
  <script src="/destinos/destinos.js"></script>
<script src="/instalar-app.js?v=2" defer></script>
<script src="/ga4.js?v=1" defer></script>
</body>
</html>`;
}

// ── Sitemap ──────────────────────────────────────────────────

function buildSitemap(allUrls) {
  const urls = allUrls.map(u => `  <url>
    <loc>${u.url}</loc>
    <changefreq>${u.freq || 'monthly'}</changefreq>
    <priority>${u.priority || 0.8}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// Hasta 6 destinos hermanos del mismo país (los siguientes de la lista, dando la vuelta),
// para que cada página enlace a otras y ninguna quede casi huérfana.
function siblingsOf(list, i, countrySlug) {
  // Los «menos turísticos» del país salen SIEMPRE primero (Paco, 5 nov 2026); luego los vecinos, hasta 8 en total.
  const yo = list[i];
  const out = list.filter(d => d.menos_turistico && d !== yo).map(d => ({ slug: `${d.id}-${countrySlug}`, name: d.nombre, menos: true }));
  const max = out.length ? 8 : 6;
  for (let k = 1; k < list.length && out.length < max; k++) {
    const d = list[(i + k) % list.length];
    if (d.menos_turistico) continue;
    out.push({ slug: `${d.id}-${countrySlug}`, name: d.nombre });
  }
  return out;
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  // Freno (Paco, 13 nov 2026, tras la subida mala 070c63053): una opción que no existe no lanza la pasada completa
  const OPCIONES = new Set(['--dry-run', '--country', '--index-only', '--sitemap-only', '--only']);
  const raras = args.filter((a, i) => a.startsWith('-') && !OPCIONES.has(a) && !(i > 0 && ['--country', '--only'].includes(args[i - 1])));
  if (raras.length) { console.error('❌ Opción desconocida: ' + raras.join(' ') + '. Uso: node scripts/build-destinos.js [--country xx | --only a,b | --index-only | --sitemap-only | --dry-run]'); process.exitCode = 1; return; }
  const dryRun = args.includes('--dry-run');
  const countryFlag = args.indexOf('--country');
  const onlyCountry = countryFlag >= 0 ? args[countryFlag + 1] : null;
  // Recalcula datos de todos los países (para el índice/sitemap) pero NO reescribe
  // ninguna página de destino/país — para tocar solo destinos/index.html sin rehacer
  // las 1.793 páginas. Útil para cambios de cabecera/menú que también afectan al
  // índice pero cuyo rollout completo se hace aparte (ver CLAUDE.md protocolo §9).
  const indexOnly = args.includes('--index-only');
  // Igual que --index-only pero al revés: recorre todos los KV para tener la lista
  // completa y correcta de URLs, y reescribe SOLO sitemap-destinos.xml — ni las páginas
  // de destino/país ni destinos/index.html. Para cuando el sitemap se queda desfasado
  // (menos países/destinos reales de los que hay) sin querer tocar ningún HTML.
  const sitemapOnly = args.includes('--sitemap-only');
  // --only a,b : escribe SOLO las páginas de destino con esos slugs (para abrir una tanda sin tocar el resto)
  const onlyIdx = args.indexOf('--only');
  const onlySet = onlyIdx >= 0 ? new Set(String(args[onlyIdx + 1] || '').split(',').filter(Boolean)) : null;

  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.name;

  let files = fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json'));
  if (onlyCountry) files = files.filter(f => f.startsWith(onlyCountry));

  console.log(`\n📍 Build Destinos — Páginas SEO (3 niveles)`);
  console.log(`   Países disponibles: ${files.length}`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const allSitemapUrls = [];
  const countriesByContinent = {};
  let totalDest = 0;
  let totalCountry = 0;
  let errors = 0;

  for (const file of files) {
    const code = file.replace('.json', '');
    const countryName = countryMap[code] || code;
    const countrySlug = slugify(countryName);

    try {
      const data = JSON.parse(fs.readFileSync(path.join(KV_DIR, file), 'utf-8'));
      // + destinos añadidos a mano (scripts/paises/<país>/sitios-nuevos.json, en git): Banaue, Batad, Buscalan… (5 nov 2026)
      const destinos = (data.destinos || []).concat(DESTINOS_NUEVOS[code] || []);
      if (destinos.length === 0) continue;

      // ── Nivel 3: páginas de destino ──
      const validDests = destinos.filter(d => d.id && d.nombre);
      for (let i = 0; i < validDests.length; i++) {
        const dest = validDests[i];
        const slug = `${dest.id}-${countrySlug}`;
        const nav = {
          prev: i > 0 ? { slug: `${validDests[i-1].id}-${countrySlug}`, name: validDests[i-1].nombre } : null,
          next: i < validDests.length - 1 ? { slug: `${validDests[i+1].id}-${countrySlug}`, name: validDests[i+1].nombre } : null,
        };
        if (!dryRun && !indexOnly && !sitemapOnly && (!onlySet || onlySet.has(slug))) {
          const route = loadRoute(dest.id, countrySlug);
          fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), buildHTML(sinPreciosObj(dest), countryName, code, slug, sinPreciosObj(route), nav, siblingsOf(validDests, i, countrySlug), countrySlug));
        }
        allSitemapUrls.push({ url: `${DOMAIN}/destinos/${slug}.html`, priority: 0.8, freq: 'monthly' });
        totalDest++;
      }

      // ── Nivel 2: página de país ──
      if (!dryRun && !indexOnly && !sitemapOnly && !onlySet) {
        fs.writeFileSync(path.join(OUT_DIR, `${countrySlug}.html`), buildCountryHTML(countryName, code, sinPreciosObj(destinos)));
      }
      allSitemapUrls.push({ url: `${DOMAIN}/destinos/${countrySlug}.html`, priority: 0.9, freq: 'weekly' });
      totalCountry++;

      // Track for index page
      const continent = getContinent(code);
      if (!countriesByContinent[continent]) countriesByContinent[continent] = [];
      countriesByContinent[continent].push({ name: countryName, code, numDestinos: destinos.length });

    } catch (e) {
      console.error(`   ❌ ${code}: ${e.message}`);
      errors++;
    }
  }

  // Freno (Paco, 13 nov 2026): con errores no se reescriben ni el índice ni el sitemap (el 070c63053 salió con 80 errores
  // y dejó destinos/index.html y sitemap-destinos.xml a medias). Las páginas que sí salieron bien quedan escritas: mirar el diff.
  if (errors) {
    console.error(`\n❌ ${errors} errores: NO se reescriben destinos/index.html ni sitemap-destinos.xml. Arréglalos y vuelve a generar; no subas nada así.`);
    process.exitCode = 1;
    return;
  }

  // ── Nivel 1: página índice ──
  if (!dryRun && !onlyCountry && !sitemapOnly && !onlySet) {
    // Sort countries within each continent
    for (const cont of Object.keys(countriesByContinent)) {
      countriesByContinent[cont].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildIndexHTML(countriesByContinent));
    allSitemapUrls.push({ url: `${DOMAIN}/destinos/`, priority: 1.0, freq: 'weekly' });
    console.log(`   📄 Índice: destinos/index.html`);
  } else if (sitemapOnly) {
    // El propio índice (/destinos/) también va en el sitemap aunque no se reescriba su HTML
    allSitemapUrls.push({ url: `${DOMAIN}/destinos/`, priority: 1.0, freq: 'weekly' });
  }

  // Sitemap — solo se reescribe en una pasada completa (ni --country ni --index-only),
  // o cuando se pide explícitamente con --sitemap-only, para que una prueba parcial no
  // lo toque sin querer.
  if (!dryRun && !onlyCountry && !indexOnly && !onlySet && allSitemapUrls.length > 0) {
    fs.writeFileSync(SITEMAP_FILE, buildSitemap(allSitemapUrls.filter(u => INDEXABLES.has(u.url.replace(`${DOMAIN}/destinos/`, '').replace(/.html$/, '') || 'index'))));
    console.log(`   🗺️ Sitemap: ${allSitemapUrls.length} URLs`);
  } else if (onlyCountry || indexOnly || onlySet) {
    console.log(`   🗺️ Sitemap: sin tocar (solo se regenera en una pasada completa)`);
  }

  console.log(`\n── Resumen ──`);
  console.log(`   📄 Índice: 1`);
  console.log(`   🌍 Países: ${totalCountry}`);
  console.log(`   📍 Destinos: ${totalDest}`);
  console.log(`   ⚠️ Errores: ${errors}`);
  if (dryRun) console.log(`   (dry-run)`);
  if (indexOnly) console.log(`   (index-only — países/destinos solo contados, no reescritos)`);
  if (sitemapOnly) console.log(`   (sitemap-only — solo se reescribió sitemap-destinos.xml)`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
