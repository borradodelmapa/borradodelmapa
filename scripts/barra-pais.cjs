// (5 nov 2026: dentro del visor de la app —iframe— el logo de la barra se esconde: la app ya pone el suyo.)
// (5 nov 2026, Paco: «el logo, todo el texto molesta»: la barra lleva el logo pequeño y sustituye a la cabecera grande —
//  logo, «Sin mapa, con rumbo», «Blog de viajes» y reloj— en las páginas que la llevan.)
// BARRA DEL PAÍS — «un país = una casa» (Paco, 5 nov 2026, tras ver el boceto: «sí, adelante»).
// Entres por donde entres (página del país, un sitio, una guía o una historia del blog), arriba sale la barra fija del país
// con sus pestañas — Conoce · Sitios · Guías · Historias — y la miga de pan de dónde estás. UNA sola pieza para toda la web:
// la usan scripts/build-destinos.js (país y sitios) y scripts/build-blog-viajes.js (historias). No escribir otra.
// Las pestañas solo salen si el país tiene eso (Conoce = scripts/paises/<país>/intro.json; Guías = guias-por-pais.json;
// Historias = scripts/blog-viajes-data.js sin borradores). Sin página del país (destinos/<slug>.html), no hay barra.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const slugify = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const leer = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (_) { return d; } };

// País de cada historia del blog (las series que no llevan país lo toman de aquí)
const PAIS_DE_SERIE = { 'Tailandia en moto': 'Tailandia', 'las Andamán': 'India' };
const paisDeHistoria = x => PAIS_DE_SERIE[x.pais || x.serie] || x.pais || x.serie || '';

function historiasDe(paisNombre) {
  let data = [];
  try { const f = path.join(ROOT, 'scripts', 'blog-viajes-data.js'); delete require.cache[f]; data = require(f); } catch (_) {}
  return data.filter(x => !x.borrador && slugify(paisDeHistoria(x)) === slugify(paisNombre));
}
function datosPais(paisNombre) {
  const slug = slugify(paisNombre);
  if (!fs.existsSync(path.join(ROOT, 'destinos', slug + '.html'))) return null;
  const sitios = fs.readdirSync(path.join(ROOT, 'destinos')).filter(f => f.endsWith(`-${slug}.html`)).length;
  const guias = (leer('guias-por-pais.json', {})[slug] || []).length;
  const conoce = fs.existsSync(path.join(ROOT, 'scripts', 'paises', slug, 'intro.json'));
  return { slug, nombre: paisNombre, sitios, guias, conoce, historias: historiasDe(paisNombre).length };
}

const CSS = `<style>
.pb{position:sticky;top:0;z-index:50;background:#0d0f10;border-bottom:1px solid rgba(255,255,255,.12)}
.pb-in{max-width:1100px;margin:0 auto;padding:0 16px;display:flex;align-items:center;gap:18px;overflow-x:auto;scrollbar-width:none}
.pb-in::-webkit-scrollbar{display:none}
.pb-pais{font-family:'Barlow Condensed','Archivo',sans-serif;font-weight:800;font-size:22px;letter-spacing:.04em;text-transform:uppercase;color:#fff;text-decoration:none;white-space:nowrap;padding:12px 0}
.pb-pais b{color:#F4630B}
.pb-tabs{display:flex;gap:4px}
.pb-tabs a{font-family:'Barlow Condensed','Archivo',sans-serif;font-weight:800;font-size:16px;letter-spacing:.06em;text-transform:uppercase;color:rgba(244,239,230,.75);text-decoration:none;padding:14px 10px 11px;border-bottom:3px solid transparent;white-space:nowrap}
.pb-tabs a span{font-size:12px;color:#F4630B;margin-left:3px}
.pb-tabs a.on{color:#fff;border-bottom-color:#F4630B}
.pb-crumb{max-width:1100px;margin:0 auto;padding:8px 16px 0;font-size:13px;color:rgba(244,239,230,.6)}
.pb-crumb a{color:rgba(244,239,230,.85);text-decoration:none}
.pb-crumb b{color:#fff;font-weight:600}
#conoce,#sitios,#guias,#historias{scroll-margin-top:64px}
.destino-clock-wrap{display:none!important}
.pb-logo{display:flex;align-items:center;flex:0 0 auto;font-size:22px;padding-right:10px;border-right:1px solid rgba(255,255,255,.15);text-decoration:none}
.pb-logo .ce-mark{display:inline-block;width:1.2em;height:1.2em;margin:0;background:#F4630B;-webkit-mask:url(/logo-pin.svg) center/contain no-repeat;mask:url(/logo-pin.svg) center/contain no-repeat}
</style>`;

// on: 'conoce' | 'sitios' | 'guias' | 'historias' | '' · crumb: [[texto, url], …, [texto]] (el último, donde estás)
function barraPais(paisNombre, on, crumb) {
  const p = datosPais(paisNombre);
  if (!p) return '';
  const base = `/destinos/${p.slug}.html`;
  const tab = (id, txt, n) => `<a href="${base}#${id}"${on === id ? ' class="on"' : ''}>${txt}${n ? `<span>${n}</span>` : ''}</a>`;
  const tabs = [p.conoce ? tab('conoce', 'Conoce') : '', p.sitios ? tab('sitios', 'Sitios', p.sitios) : '',
    p.guias ? tab('guias', 'Guías', p.guias) : '', p.historias ? tab('historias', 'Historias', p.historias) : ''].join('');
  const miga = (crumb || []).map((c, i, a) => i === a.length - 1 || !c[1] ? `<b>${esc(c[0])}</b>` : `<a href="${esc(c[1])}">${esc(c[0])}</a>`).join(' › ');
  return `${CSS}
<script>try{if(window.top!==window.self)document.documentElement.classList.add('pb-en-app')}catch(e){}</script><style>.pb-en-app .pb-logo{display:none}</style>
<nav class="pb" aria-label="${esc(p.nombre)}"><div class="pb-in"><a class="pb-logo" href="/" aria-label="Borrado del Mapa: inicio"><i class="ce-mark" aria-hidden="true"></i></a><a class="pb-pais" href="${base}"><b>›</b> ${esc(p.nombre)}</a><div class="pb-tabs">${tabs}</div></div></nav>
${miga ? `<p class="pb-crumb">${miga}</p>` : ''}`;
}

module.exports = { barraPais, historiasDe, paisDeHistoria, datosPais, slugify };
