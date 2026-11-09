// Genera el blog de viajes: portada (blog/index.html) y los diarios (blog/viajes/*.html).
// Uso:  node scripts/build-blog-viajes.js
// Entradas: scripts/blog-viajes-data.js (diarios), scripts/blog-guias.json (guías prácticas de blog/*.html),
//           vídeos en salma marketing/ligeras-portada/, portadas JPG en blog/viajes/img/<slug>.jpg.
// Salidas:  blog/index.html, blog/viajes/*.html, blog/viajes/video/<slug>.mp4, sitemap-blog.xml (bloque VIAJES).
// Los textos se editan en blog-viajes-data.js, nunca en los HTML generados. El diseño vive en blog-viajes.css.
// Cabecera, pie y menú de abajo se copian de blog/perder-el-avion.html (§9 del CLAUDE.md): un cambio allí se arrastra aquí.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// En una copia (worktree) sin «salma marketing» completo, las fotos, créditos y vídeos se leen de la carpeta principal
const MKT = fs.existsSync(path.join(ROOT, 'salma marketing', 'pueblos')) ? ROOT : path.resolve(ROOT, '..', '..', '..');
const VIDEO_SRC = path.join(MKT, 'salma marketing', 'ligeras-portada');
const OUT = path.join(ROOT, 'blog', 'viajes');
const OUT_VIDEO = path.join(OUT, 'video');
const SITE = 'https://borradodelmapa.com';
const FECHA = '2026-10-18'; // fecha de los diarios antiguos; las entradas nuevas llevan la suya (c.fecha) para Google
const FECHA_TXT = '18 octubre 2026';
const CSS_V = 196;      // styles.css (= APP_CSS_V de build-destinos.js)
const BV_CSS_V = 7;     // blog-viajes.css

// Entradas con `borrador: true` (contenido producido que aún no se publica, L2) solo salen con BORRADORES=1, para enseñarlas en local (4 nov 2026).
const capsTodas = require('./blog-viajes-data.js');
// «Un país = una casa» (Paco, 5 nov 2026): la barra del país y la miga de pan salen de la pieza común del chat 1, no se escribe otra
const { barraPais, paisDeHistoria, datosPais, slugify } = require('./barra-pais.cjs');
const caps = Object.assign(capsTodas.filter((c) => !c.borrador || process.env.BORRADORES === '1'), { SERIES: capsTodas.SERIES });
const guias = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog-guias.json'), 'utf8'));
// Rutas completas (guías públicas <slug>.html de la app): enlazadas desde el índice del blog para que Google las encuentre.
const rutas = require('./datos-pais.cjs').rutasBlog(); // scripts/paises/<país>/rutas.json

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const slugSerie = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const capCorto = (c) => (/^Cap/.test(c.cap) ? 'Cap. ' + c.cap.match(/\d+/)[0] : c.cap);

// Suscribirse y compartir (Paco, 7 nov 2026): debajo de cada vídeo el botón de YouTube y compartir; al final del artículo, compartir. En el móvil abre el menú del teléfono; en el ordenador copia el enlace.
const { SUSCRIBIRSE, ICONO_YOUTUBE, BOTON_COMPARTIR, COMPARTIR_JS } = require('./redes.cjs');
const BOTON_SUSCRIBIRSE = `<a class="bd-suscribirse" href="${SUSCRIBIRSE}" target="_blank" rel="noopener">${ICONO_YOUTUBE}<span>Suscríbete al canal</span></a>`;

// Pie y menú de abajo: copia de una página de blog existente
const ref = fs.readFileSync(path.join(ROOT, 'blog', 'perder-el-avion.html'), 'utf8');
const PIE_Y_MENU = ref.slice(ref.indexOf('<footer class="pg-footer">'), ref.indexOf('</body>'));
if (!PIE_Y_MENU.includes('app-bottom-bar')) throw new Error('No encuentro el menú de abajo en blog/perder-el-avion.html');

// Web Story (8 nov 2026): si la entrada tiene `story`, debajo del vídeo sale el enlace a /stories/<slug>/ (la genera scripts/build-stories.js)
const { duracionMp4 } = require('./video-info.cjs');

fs.mkdirSync(OUT_VIDEO, { recursive: true });
caps.forEach((c, i) => {
  if (!c.video) { // entrada sin vídeo (artículo de país, guía, fiestas…; 4 nov 2026): solo portada
    if (!fs.existsSync(path.join(OUT, 'img', c.slug + '.jpg'))) throw new Error('Falta la portada blog/viajes/img/' + c.slug + '.jpg');
    c.dur = null; c.n = i; return;
  }
  const src = path.join(VIDEO_SRC, c.video);
  const dst = path.join(OUT_VIDEO, c.slug + '.mp4');
  // En una copia sin «salma marketing» (worktree), vale el vídeo ya publicado en blog/viajes/video/
  if (!fs.existsSync(src)) { if (!fs.existsSync(dst)) throw new Error('Falta el vídeo ' + src); }
  else if (!fs.existsSync(dst) || fs.statSync(dst).size !== fs.statSync(src).size) fs.copyFileSync(src, dst);
  if (!fs.existsSync(path.join(OUT, 'img', c.slug + '.jpg'))) throw new Error('Falta la portada blog/viajes/img/' + c.slug + '.jpg');
  c.dur = duracionMp4(dst);
  c.n = i;
});

const HEAD_COMUN = `<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=${CSS_V}">
<link rel="stylesheet" href="/paginas.css?v=3">
<link rel="stylesheet" href="/blog-viajes.css?v=${BV_CSS_V}">`;
const CABECERA = `<header class="pg-header">
  <a class="ce-brand" href="/"><i class="ce-mark" aria-hidden="true"></i>BORRADO<span>DEL</span>MAPA</a>
  <a class="pg-header-sec" href="/blog/">Blog de viajes</a>
</header>`;

// ── Serie «Pueblos borrados del mapa» (P12 de docs/video-checklist.md, 31 oct 2026): un vídeo = una entrada que enseña la guía y nombra a los autores de las fotos ──
// c.guia = { json, url, titulo, dias: [n…], intro }: enseña los días de la guía pública donde sale el sitio (nombres de las paradas, sin fotos de Google: 0 €) y un botón a la guía completa.
function guia(c) {
  if (!c.guia) return '';
  const g = JSON.parse(fs.readFileSync(path.join(fs.existsSync(path.join(ROOT, c.guia.json)) ? ROOT : MKT, c.guia.json), 'utf8'));
  const dias = (c.guia.dias || []).map((d) => { // sin días (la guía no pasa por el sitio): solo la intro y el botón a la guía
    const st = g.stops.filter((s) => s.day === d); if (!st.length) return '';
    return `        <li><strong>Día ${d} · ${esc(st[0].day_title)}</strong>: ${st.map((s) => esc(s.name)).join(' · ')}</li>`;
  }).filter(Boolean).join('\n');
  return `    <aside class="bd-ficha bd-guia">
      <h3>${esc(c.guia.titulo)}</h3>
      <p>${md(c.guia.intro)}</p>
${dias ? `      <ul>\n${dias}\n      </ul>\n` : ''}      <p><a class="pg-btn" href="${esc(c.guia.url)}">Ver la guía completa</a></p>
    </aside>
`;
}
// Autores y licencias de las fotos del episodio (<creditosDe>/fotos/ATRIBUCIONES.txt)
function atribuciones(c) {
  const atr = {};
  fs.readFileSync(path.join(MKT, c.creditosDe, 'fotos', 'ATRIBUCIONES.txt'), 'utf8').split('\n').filter(Boolean).forEach((l) => { const p = l.split(' · '); atr[p[0]] = { autor: p[2], lic: p[3], u: p[4] }; });
  return atr;
}
// Entrada de varios episodios (largo de temporada, 6 nov 2026): c.fotosEpisodios = carpeta de la serie; cada foto es 'episodio/W39' y lleva el autor de SU episodio.
const atrDe = (c, id) => { const [ep, n] = id.split('/'); return atribuciones({ creditosDe: c.fotosEpisodios + '/' + ep })[n]; };
// Fotos de Paco y de archivo en la misma entrada (largo de Vietnam, 7 nov 2026): c.fotosArchivo = carpeta con ATRIBUCIONES.txt (id · archivo · licencia · autor · url);
// esas fotos se escriben 'a/<id>' y llevan autor; las demás salen de c.fotosDe, sin autor. c.autores corrige los nombres que Wikimedia da mal.
function archivoDe(c) {
  const atr = {};
  fs.readFileSync(path.join(MKT, c.fotosArchivo, 'ATRIBUCIONES.txt'), 'utf8').split(/\r?\n/).filter(Boolean).forEach((l) => {
    const p = l.split(' · '), id = p[0], autor = (c.autores && c.autores[id]) || (/^Unknown author/i.test(p[3] || '') ? '' : (p[3] || '').trim());
    atr[id] = { autor, lic: p[2] === 'Public domain' ? 'Dominio público' : p[2], u: p[p.length - 1] };
  });
  return atr;
}
// Fotos de la entrada (c.fotos y s.foto, 1 nov 2026): se copian de <creditosDe>/fotos/ a blog/viajes/img/<slug>/ a 1200 px como mucho (solo la primera vez)
const FF = path.join(MKT, 'salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
// Diarios con fotos propias (Tailandia, Vietnam): c.fotosDe = { prefijo: lista } con las listas id|ruta de salma marketing (rutas relativas a D:/salma-movil
// o a c.fotosBase); el id de la foto es prefijo + id de la lista (p. ej. 'k22' = línea 22 de la lista de 'k'). Sin pie de autor: son de Paco.
function origen(c, id) {
  if (c.otraSerie && id.includes('/')) { const [ep, n] = id.split('/'), d = path.join(MKT, c.otraSerie, ep, 'fotos'), g = path.join(d, n + '-g.jpg'); return fs.existsSync(g) ? g : path.join(d, n + '.jpg'); } // foto de otra serie (c.otraSerie), con su autor
  if (c.fotosArchivo && id.startsWith('a/')) { const b = path.join(MKT, c.fotosArchivo, id.slice(2)); return fs.existsSync(b + '.jpg') ? b + '.jpg' : b + '.png'; }
  if (c.fotosEpisodios) { const [ep, n] = id.split('/'), d = path.join(MKT, c.fotosEpisodios, ep, 'fotos'), g = path.join(d, n + '-g.jpg'); return fs.existsSync(g) ? g : path.join(d, n + '.jpg'); }
  if (!c.fotosDe) return path.join(MKT, c.creditosDe, 'fotos', id + '.jpg');
  const pre = Object.keys(c.fotosDe).sort((a, b) => b.length - a.length).find((p) => id.startsWith(p));
  const L = Object.fromEntries(fs.readFileSync(path.join(fs.existsSync(path.join(ROOT, c.fotosDe[pre])) ? ROOT : MKT, c.fotosDe[pre]), 'utf8').split('\n').filter(Boolean).map((l) => l.trim().split('|')));
  const rel = L[id.slice(pre.length)];
  if (!rel) throw new Error('La foto ' + id + ' no está en ' + c.fotosDe[pre]);
  return /^[A-Z]:/.test(rel) ? rel : (c.fotosBase || 'D:/salma-movil/') + rel;
}
// Visor de fotos: la galería y las fotos de cada apartado se abren encima de la página y se cierran con ✕, tocando fuera, Escape o el botón atrás del móvil
// (antes la foto se abría en otra pestaña y en la app instalada no había forma de volver). Sin JS, el enlace de la galería sigue abriendo la foto.
const VISOR = `<div class="bd-visor" hidden><button class="bd-visor-x" aria-label="Cerrar">✕</button><img alt=""><p></p></div>
<script>(function(){var v=document.querySelector(".bd-visor");if(!v)return;var im=v.querySelector("img"),pi=v.querySelector("p");
function cerrar(atras){if(v.hidden)return;v.hidden=true;im.removeAttribute("src");document.body.style.overflow="";if(atras!==false&&history.state&&history.state.visor)history.back();}
document.addEventListener("click",function(e){var t=e.target.closest(".bd-gal-grid figure > a, .bd-fig img");if(!t)return;e.preventDefault();
var img=t.tagName==="IMG"?t:t.querySelector("img");im.src=t.getAttribute("href")||img.src;im.alt=img.alt;pi.textContent=img.alt.split("*").join("");
v.hidden=false;document.body.style.overflow="hidden";history.pushState({visor:1},"");});
v.addEventListener("click",function(e){if(e.target!==im)cerrar();});
document.addEventListener("keydown",function(e){if(e.key==="Escape")cerrar();});window.addEventListener("popstate",function(){cerrar(false);});})();</script>
`;
function foto(c, id) {
  const nom = id.replace('/', '-'), dest = path.join(OUT, 'img', c.slug, nom + '.jpg');
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const r = require('child_process').spawnSync(FF, ['-v', 'error', '-y', '-i', origen(c, id), '-vf', "scale='min(1200,iw)':-2", '-q:v', '4', dest]);
    if (r.status) throw new Error('No puedo preparar la foto ' + id + ' de ' + c.slug + ': ' + r.stderr);
  }
  if (c.fotosDe && !id.startsWith('a/')) return { src: `/blog/viajes/img/${c.slug}/${nom}.jpg`, credito: '' };
  const a = (c.otraSerie && id.includes('/') ? atrDe({ fotosEpisodios: c.otraSerie }, id) : c.fotosArchivo ? archivoDe(c)[id.slice(2)] : c.fotosEpisodios ? atrDe(c, id) : atribuciones(c)[id]) || {};
  return { src: `/blog/viajes/img/${c.slug}/${nom}.jpg`, credito: `Foto: <a href="${esc(a.u || '#')}" target="_blank" rel="noopener">${esc(a.autor || 'autor desconocido')}</a> · ${esc(a.lic || '')}` };
}
const figura = (c, [id, pie]) => { const f = foto(c, id); return `      <figure class="bd-fig">
        <img src="${f.src}" alt="${esc(pie)}" loading="lazy">
        <figcaption>${md(pie)}${f.credito ? ` <span>${f.credito}</span>` : ''}</figcaption>
      </figure>
`; };
function galeria(c) {
  if (!c.fotos || !c.fotos.galeria) return '';
  return `    <section class="bd-galeria">
      <h2>En imágenes</h2>
      <div class="bd-gal-grid">
${c.fotos.galeria.map(([id, pie]) => { const f = foto(c, id); return `        <figure><a href="${f.src}" target="_blank"><img src="${f.src}" alt="${esc(pie)}" loading="lazy"></a><figcaption>${md(pie)}${f.credito ? ` <span>${f.credito}</span>` : ''}</figcaption></figure>`; }).join('\n')}
      </div>
    </section>
`;
}
// c.creditosDe = carpeta del episodio: autores de las fotos que salen en el vídeo (el tiempos.json más reciente de salida/) y en la entrada
function creditos(c) {
  if (c.fotosArchivo) { // todas las fotos de archivo que salen en el vídeo (tiempos.json) o en la entrada, más lo que no es una foto suelta (c.creditosExtra = [[autor, licencia, url]])
    const atr = archivoDe(c), enVideo = JSON.parse(fs.readFileSync(path.join(MKT, c.tiempos), 'utf8')).flatMap((b) => b.shots || []).map((x) => (x.match(/\/archivo\/([^/]+)\.(?:jpe?g|png)$/) || [])[1]);
    const enBlog = [c.fotos.portada, ...c.secciones.filter((s) => s.foto).map((s) => s.foto[0]), ...c.fotos.galeria.map((g) => g[0])].filter((id) => id.startsWith('a/')).map((id) => id.slice(2));
    const filas = [...new Set([...enVideo, ...enBlog].filter((id) => atr[id]))].map((id) => [atr[id].autor || 'Autor desconocido', atr[id].lic, atr[id].u]).concat(c.creditosExtra || []);
    return `

    <details class="bd-src">
      <summary>Fotos y vídeos: autores y licencias</summary>
      <p>${esc(c.creditosIntro)}</p>
      <ul>
${filas.map(([a, l, u]) => `        <li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(a)}</a> · ${esc(l)}</li>`).join('\n')}
      </ul>
    </details>`;
  }
  if (!c.creditosDe) return '';
  const dir = path.join(MKT, c.creditosDe), sal = path.join(dir, 'salida');
  const t = !fs.existsSync(sal) ? null : fs.readdirSync(sal).filter((f) => f.endsWith('-tiempos.json')).map((f) => path.join(sal, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  if (!t && c.video) throw new Error('No encuentro tiempos.json en ' + sal); // sin vídeo: solo las fotos de la entrada
  const enBlog = c.fotos ? [c.fotos.portada, ...c.secciones.filter((s) => s.foto).map((s) => s.foto[0]), ...(c.fotos.galeria || []).map((g) => g[0])] : [];
  const enVideo = t && c.video ? JSON.parse(fs.readFileSync(t, 'utf8')).flatMap((b) => b.shots || []) : [];
  const usadas = c.fotosEpisodios
    ? [...new Set([...enVideo.map((x) => (x.match(/\/([^/]+)\/fotos\/([WH]\d+)(?:-g)?\.jpg$/) || []).slice(1).join('/')), ...enBlog].filter(Boolean))]
    : [...new Set([...enVideo.map((x) => (c.otraSerie && (String(x).match(/\/([^/]+)\/fotos\/([WH]\d+)(?:-g)?\.jpg$/) || []).slice(1).join('/')) || x), ...enBlog, ...(c.creditosIds || [])].filter((x) => /^([a-z-]+\/)?[WH]\d+$/.test(x)))];
  const atr = c.fotosEpisodios ? null : atribuciones(c), de = (id) => (c.otraSerie && id.includes('/') ? atrDe({ fotosEpisodios: c.otraSerie }, id) : atr ? atr[id] : atrDe(c, id));
  const li = [...new Set(usadas.filter(de).map((id) => `        <li><a href="${esc(de(id).u)}" target="_blank" rel="noopener">${esc(de(id).autor || 'Autor desconocido')}</a> · ${esc(de(id).lic)}</li>`))];
  return `
    <details class="bd-src">
      <summary>Fotos: autores y licencias</summary>
      <p>${esc(c.creditosIntro || 'Fotos de Wikimedia Commons con licencia libre. Gracias a sus autores:')}</p>
      <ul>
${[...li, ...(c.creditosExtra || []).map(([a, l, u]) => `        <li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(a)}</a> · ${esc(l)}</li>`)].join('\n')}
      </ul>
    </details>`;
}

// Capítulos (Y6, 6 nov 2026): s.min = minuto de la sección en el vídeo. Salen en un índice, en cada apartado y en los datos para Google (Y9).
const aSeg = (m) => m.split(':').reduce((a, n) => a * 60 + Number(n), 0);
const SALTO_VIDEO = `<script>(function(){var v=document.querySelector("video.bd-video");if(!v)return;
function ir(s){v.currentTime=s;var p=v.play();if(p&&p.catch)p.catch(function(){});v.scrollIntoView({behavior:"instant",block:"center"});}
document.addEventListener("click",function(e){var a=e.target.closest("a[data-t]");if(!a)return;e.preventDefault();ir(Number(a.dataset.t));});
var t=Number(new URLSearchParams(location.search).get("t"));if(t){if(v.readyState>=1)v.currentTime=t;else v.addEventListener("loadedmetadata",function(){v.currentTime=t;},{once:true});}})();</script>
`;
// Documental con enlace de YouTube (Paco, 7 nov 2026): se ve la carátula con un play y el reproductor solo se carga al pulsar (página rápida, sin nada de YouTube hasta entonces).
// Modo sin cookies de YouTube. Poner c.youtube SOLO cuando el vídeo sea público: si es privado, da error. Los capítulos abren el reproductor en su minuto.
const SALTO_YOUTUBE = `<script>(function(){var f=document.querySelector(".bd-yt");if(!f)return;var id=f.dataset.yt,i=null;
var ini=Number(new URLSearchParams(location.search).get("t"))||0;
function pon(s){if(!i){i=document.createElement("iframe");i.className="bd-video bd-yt-if";i.title=f.getAttribute("aria-label");i.allow="autoplay; encrypted-media; fullscreen; picture-in-picture";i.allowFullscreen=true;i.referrerPolicy="strict-origin-when-cross-origin";f.parentNode.replaceChild(i,f);}
i.src="https://www.youtube-nocookie.com/embed/"+id+"?autoplay=1&rel=0&playsinline=1"+(s?"&start="+s:"");i.scrollIntoView({behavior:"instant",block:"center"});}
f.addEventListener("click",function(e){e.preventDefault();pon(ini);});
document.addEventListener("click",function(e){var a=e.target.closest("a[data-t]");if(!a)return;e.preventDefault();pon(Number(a.dataset.t));});})();</script>
`;
// Vídeo horizontal (c.formato = '16:9'): a lo ancho encima del texto, no en la columna estrecha de los verticales. Va en la propia página para no cambiar el ?v= de las demás.
const CSS_16_9 = `<style>
.bd-layout.h .bd-media{max-width:none}.bd-layout.h .bd-video{aspect-ratio:16/9}
.pg .bd-cap a,.pg .bd-enlaces a,.pg .bd-ia a,.pg .bd-ficha a[data-t]{color:var(--accent);text-decoration:none;font-weight:600}.pg .bd-cap a:hover,.pg .bd-enlaces a:hover,.pg .bd-ficha a[data-t]:hover{text-decoration:underline}.pg .bd-ficha a[data-t] strong{color:var(--text-primary)}
.bd-enlaces{font-size:15px}.bd-enlaces a+a::before{content:" · ";color:var(--text-muted)}
@media (min-width:960px){.bd-layout.h,.bd-layout.h.con-hero{grid-template-columns:minmax(0,1fr);grid-template-areas:"media" "body" "next";grid-template-rows:auto}
.bd-layout.h .bd-media{position:static;margin:0 auto 34px;width:100%;max-width:1000px}.bd-layout.h .bd-body,.bd-layout.h .bd-next{max-width:760px;width:100%;margin-left:auto;margin-right:auto}}
</style>`;

function pagina(c) {
  const paisH = paisDeHistoria(c), dp = datosPais(paisH);
  // Cada historia cuelga de su SITIO (c.destino = [slug de la página, nombre]) o, si es de todo el país, del país (Paco, 5 nov 2026:
  // «información partida sin criterio»): «Blog de viajes › Destinos › Filipinas › Buscalan › Whang-Od».
  const sitio = c.destino && dp && c.destino[0] !== dp.slug && fs.existsSync(path.join(ROOT, 'destinos', c.destino[0] + '.html')) ? c.destino : null;
  const barra = dp ? barraPais(paisH, sitio ? 'sitios' : 'historias', [['Blog de viajes', '/blog/'], ['Destinos', '/destinos/'], [paisH, `/destinos/${dp.slug}.html`], ...(sitio ? [[sitio[1], `/destinos/${sitio[0]}.html`]] : []), [c.titulo.split(':')[0]]]) : '';
  // anterior/siguiente: la serie «Pueblos borrados del mapa» no enlaza con diarios de otras series (las antiguas siguen como estaban)
  const P = 'Pueblos borrados del mapa', vale = (x) => x && (x.serie === c.serie || (c.serie !== P && x.serie !== P));
  const ant = vale(caps[c.n - 1]) ? caps[c.n - 1] : null, sig = vale(caps[c.n + 1]) ? caps[c.n + 1] : null;
  const yt = c.formato === '16:9' && c.youtube; // documental público: reproductor de YouTube al pulsar
  const url = `${SITE}/blog/viajes/${c.slug}`;
  const img = `/blog/viajes/img/${c.slug}.jpg`;
  const serieCaps = caps.filter((x) => x.serie === c.serie);
  const caps16 = c.secciones.filter((s) => s.min);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: c.titulo, description: c.resumen, image: SITE + img, author: { '@type': 'Person', name: 'Salma' },
      publisher: { '@type': 'Organization', name: 'Borrado del Mapa', url: SITE }, datePublished: c.fecha || FECHA, dateModified: c.fecha || FECHA, mainEntityOfPage: url },
    c.dur && { '@context': 'https://schema.org', '@type': 'VideoObject', name: c.titulo, description: c.resumen, uploadDate: c.fecha || FECHA, thumbnailUrl: SITE + img,
      contentUrl: `${SITE}/blog/viajes/video/${c.slug}.mp4`, duration: c.dur.iso, ...(c.youtube ? { embedUrl: 'https://www.youtube.com/embed/' + c.youtube } : {}),
      ...(caps16.length ? { hasPart: caps16.map((s, i) => ({ '@type': 'Clip', name: s.h, startOffset: aSeg(s.min), endOffset: caps16[i + 1] ? aSeg(caps16[i + 1].min) : c.dur.sec, url: `${url}?t=${aSeg(s.min)}` })) } : {}) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog de viajes', item: SITE + '/blog/' },
      { '@type': 'ListItem', position: 2, name: c.serie, item: SITE + '/blog/#' + slugSerie(c.serie) },
      { '@type': 'ListItem', position: 3, name: c.titulo, item: url } ] },
  ].filter(Boolean).map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 1)}\n</script>`).join('\n');

  const pasos = serieCaps.length > 1 ? `    <nav class="bd-steps" aria-label="Capítulos de ${esc(c.serie)}">\n${serieCaps.map((x) =>
    `      <a href="/blog/viajes/${x.slug}"${x === c ? ' class="on" aria-current="page"' : ''} title="${esc(x.titulo)}">${x.cap === 'Documental' ? 'DOC' : x.cap === 'Especial' ? 'ES' : (/^Temporada/.test(x.cap) ? 'T' : '') + x.cap.match(/\d+/)[0]}</a>`).join('\n')}\n    </nav>\n` : '';
  const stats = c.cifras ? `    <div class="bd-stats">\n${c.cifras.map(([n, t]) => `      <div class="bd-stat"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join('\n')}\n    </div>\n` : '';
  // s.foto = [id, pie]: foto tras el primer párrafo · c.cita = { tras: nº de sección, t, de }: frase destacada en grande
  const cita = (i) => c.cita && c.cita.tras === i + 1 ? `\n    <blockquote class="bd-cita"><p>${md(c.cita.t)}</p>${c.cita.de ? `<cite>${esc(c.cita.de)}</cite>` : ''}</blockquote>` : '';
  const secciones = c.secciones.map((s, i) => `    <section class="bd-sec">
      <span class="bd-sec-n">${String(i + 1).padStart(2, '0')}</span>
      <h2>${esc(s.h)}</h2>
${s.min ? `      <p class="bd-cap"><a href="?t=${aSeg(s.min)}" data-t="${aSeg(s.min)}">▶ Ver en el vídeo · ${s.min}</a></p>\n` : ''}${s.p.map((p, j) => `      <p>${md(p)}</p>\n${j === 0 && s.foto ? figura(c, s.foto) : ''}`).join('').replace(/\n$/, '')}${s.enlaces ? `\n      <p class="bd-enlaces">${s.enlaces.map(([t, u]) => `<a href="${esc(u)}">${esc(t)}</a>`).join('')}</p>` : ''}
    </section>${cita(i)}`).join('\n\n');
  const indiceCaps = caps16.length ? `    <aside class="bd-ficha">\n      <h3>Capítulos</h3>\n      <ul>\n${caps16.map((s) => `        <li><a href="?t=${aSeg(s.min)}" data-t="${aSeg(s.min)}"><strong>${s.min}</strong> ${esc(s.h)}</a></li>`).join('\n')}\n      </ul>\n    </aside>\n` : '';
  const hero = c.fotos ? foto(c, c.fotos.portada) : null;
  const cabeza = `      <span class="bd-kicker">${esc(c.serie)} · ${esc(c.cap)}</span>
      <h1 class="bd-title">${esc(c.titulo)}</h1>
      <p class="bd-lead">${esc(c.resumen)}</p>`;
  const ficha = c.ficha ? `    <aside class="bd-ficha">\n      <h3>Ficha útil</h3>\n      <ul>\n${c.ficha.map((f) => `        <li>${md(f)}</li>`).join('\n')}\n      </ul>\n    </aside>\n` : '';
  const cierre = c.cierre ? `    <p class="bd-cierre">${md(c.cierre)}</p>\n` : '';
  const fuentes = `    <details class="bd-src">
      <summary>Datos y fuentes</summary>
      <p>${md(c.nota)}</p>
      <ul>
${c.fuentes.map((f) => `        <li><a href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.t)}</a></li>`).join('\n')}
      </ul>
    </details>`;
  const [dSlug, dNombre] = c.destino || []; // sin página de destino (p. ej. la India no tiene): se quita el «Más sobre…»
  const nx = (x, lado) => x ? `      <a class="bd-nx${lado === 'der' ? ' der' : ''}${x.formato === '16:9' ? ' h' : ''}" href="/blog/viajes/${x.slug}">
        <img src="/blog/viajes/img/${x.slug}.jpg" alt="" loading="lazy">
        <span><small>${lado === 'der' ? 'Siguiente' : 'Anterior'}</small><b>${esc(x.titulo)}</b></span>
      </a>` : '';
  const nav = [nx(ant, 'izq'), nx(sig, 'der')].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.titulo)} · Diario de viaje · Borrado del Mapa</title>
<meta name="description" content="${esc(c.resumen)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(c.titulo)}">
<meta property="og:description" content="${esc(c.resumen)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE + img}">
<meta property="og:site_name" content="Borrado del Mapa">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">

${ld}

${HEAD_COMUN}${c.formato === '16:9' ? '\n' + CSS_16_9 : ''}
</head>
<body class="pg">

${barra || CABECERA}
<main class="bd-main">
${barra ? '' : `  <p class="bd-crumbs"><a href="/blog/">Historias</a> · ${esc(paisH || c.serie)}</p>
`}${hero ? `  <header class="bd-hero">
    <img src="${hero.src}" alt=""${c.fotos.posicion ? ` style="object-position:${c.fotos.posicion}"` : ''} fetchpriority="high">
    <div class="bd-hero-txt">
${cabeza}
    </div>
${hero.credito ? `    <span class="bd-hero-cred">${hero.credito}</span>\n` : ''}  </header>
` : ''}  <div class="bd-layout${hero ? ' con-hero' : ''}${c.formato === '16:9' ? ' h' : ''}">
${hero ? '' : `    <header class="bd-head">
${cabeza}
    </header>
`}
    <div class="bd-media">
${c.dur ? `      ${yt ? `<a class="bd-yt" href="https://youtu.be/${esc(c.youtube)}" data-yt="${esc(c.youtube)}" target="_blank" rel="noopener" aria-label="Reproducir: ${esc(c.titulo)}"><img src="${img}" alt="${esc(c.titulo)}"><span class="bd-yt-play" aria-hidden="true"></span></a>` : `<video class="bd-video" controls playsinline preload="metadata" poster="${img}" src="/blog/viajes/video/${c.slug}.mp4"></video>`}
      <div class="bd-video-meta"><span>Vídeo · ${c.dur.txt}</span><span>Narra Salma</span></div>
      <div class="bd-acciones">${BOTON_SUSCRIBIRSE}${BOTON_COMPARTIR}</div>${c.youtube ? `\n      <p class="bd-ia"><a href="https://youtu.be/${esc(c.youtube)}" target="_blank" rel="noopener">Verlo en YouTube</a></p>` : ''}${c.story ? `\n      <p class="bd-ia"><a href="/stories/${c.slug}/">Verlo en formato story</a>, a pantalla completa y deslizando.</p>` : ''}` : `      <img class="bd-video" src="${img}" alt="${esc(c.titulo)}">
      <div class="bd-video-meta"><span>Lectura</span><span>Escribe Salma</span></div>`}
      <p class="bd-ia">${esc(c.realidad || 'Viaje, fotos y vivencias 100 % reales. Guion, voz y montaje hechos con ayuda de IA.')}</p>
    </div>

    <article class="bd-body">
${pasos}${stats}${indiceCaps}
${secciones}

${galeria(c)}${guia(c)}${ficha}${cierre}
${fuentes}${creditos(c)}

      <div class="bd-acciones bd-acciones-fin">${BOTON_COMPARTIR}</div>

      <div class="bd-salma">
        <img src="/salma_ai_avatar.png" alt="Salma">
        <div>
          <p><strong>¿Vas a ${esc(c.salmaPais || c.pais || (c.serie === 'Vietnam' ? 'Vietnam' : 'Tailandia'))}?</strong> Dile a Salma cuántos días tienes y qué te gustaría ver: te prepara la ruta con mapa, paradas y consejos, gratis.${dSlug ? ` Más sobre <a href="/destinos/${dSlug}.html">${esc(dNombre)}</a>.` : ""}</p>
          <p><a class="pg-btn" href="/?go=chat">Crear mi ruta</a></p>
        </div>
      </div>
    </article>

    <div class="bd-next">
${nav}
    </div>
  </div>
</main>
${VISOR}${yt ? SALTO_YOUTUBE : caps16.length ? SALTO_VIDEO : ''}${COMPARTIR_JS}${PIE_Y_MENU}</body>
</html>
`;
}

caps.forEach((c) => fs.writeFileSync(path.join(OUT, c.slug + '.html'), pagina(c)));

// ─── Portada del blog ───
const series = [...new Set(caps.map((c) => c.serie))];
const rail = (c) => `      <a class="bv-card${c.formato === '16:9' ? ' doc' : ''}" href="/blog/viajes/${c.slug}">
        <div class="bv-poster"><img src="/blog/viajes/img/${c.slug}.jpg" alt="${esc(c.titulo)}" loading="lazy"><span class="bv-chip">${c.formato === '16:9' ? 'Documental' : esc(capCorto(c))}</span>${c.dur ? `<span class="bv-dur">${c.dur.txt}</span><span class="bv-play" aria-hidden="true"></span>` : ''}</div>
        <div class="bv-card-t">${esc(c.titulo)}</div>
        <div class="bv-card-m">${c.dur ? 'Vídeo' : 'Lectura'}</div>
      </a>`;
const paises = [];
caps.forEach((c) => { const p = paisDeHistoria(c); if (!p || c.variosPaises) return; let e = paises.find((x) => x.nombre === p); if (!e) paises.push(e = { nombre: p, lista: [] }); e.lista.push(c); });
// Foto de cada país en «Historias por país»: 1) si hay una elegida a mano en blog/viajes/img/paises/<país>.jpg, esa; 2) si no, la foto original
// de portada (sin banda) de la historia más reciente que la tenga (c.fotos.portada, ya revisada F9/M15); 3) si no, la portada de la historia.
function fotoPais(p) {
  const elegida = path.join(OUT, 'img', 'paises', slugify(p.nombre) + '.jpg');
  if (fs.existsSync(elegida)) return '/blog/viajes/img/paises/' + slugify(p.nombre) + '.jpg';
  const c = [...p.lista].reverse().find((x) => x.fotos && x.fotos.portada && fs.existsSync(path.join(OUT, 'img', x.slug, x.fotos.portada + '.jpg')));
  return c ? `/blog/viajes/img/${c.slug}/${c.fotos.portada}.jpg` : `/blog/viajes/img/${p.lista[p.lista.length - 1].slug}.jpg`;
}
const bloquePaises = paises.length ? `  <style>
  .bv-paises{margin:22px 0 8px}
  .bv-paises-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;padding:0 16px}
  .bv-pais{display:flex;flex-direction:column;text-decoration:none;color:#fff;background:#141617;border:1px solid rgba(255,255,255,.12)}
  .bv-pais-img{position:relative;aspect-ratio:1/1;overflow:hidden;background:#0d0f10}
  .bv-pais-img i{position:absolute;inset:-20px;background-size:cover;background-position:center;filter:blur(18px) brightness(.55)}
  .bv-pais-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
  .bv-pais-t{display:flex;flex-direction:column;gap:3px;padding:10px 12px 12px}
  .bv-pais-t b{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:24px;letter-spacing:.04em;text-transform:uppercase;line-height:1;overflow-wrap:anywhere}
  .bv-pais-t span{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#F4630B;white-space:nowrap}
  </style>
  <section class="bv-paises" id="paises">
    <div class="bv-serie-head"><h2>Historias por país</h2><span>${paises.length} países</span></div>
    <div class="bv-paises-grid">
${paises.map((p) => { const dp = datosPais(p.nombre), url = dp ? `/destinos/${dp.slug}.html` : `/blog/viajes/${p.lista[0].slug}`;
  const src = fotoPais(p); // automático: foto entera (sin recortar) sobre su propio fondo difuminado; nunca corta una cabeza (Paco, 5 nov 2026)
  const fotos = `<div class="bv-pais-img"><i style="background-image:url('${src}')"></i><img src="${src}" alt="${esc(p.nombre)}" loading="lazy"></div>`;
  return `      <a class="bv-pais" href="${url}">${fotos}<div class="bv-pais-t"><b>${esc(p.nombre)}</b><span>${p.lista.length} ${p.lista.length === 1 ? 'historia' : 'historias'}</span></div></a>`; }).join('\n')}
    </div>
    <p style="padding:0 16px;margin:14px 0 0"><a class="pg-btn" href="/destinos/">Todos los países →</a></p>
  </section>
` : '';
const bloqueSeries = series.map((s) => {
  const lista = caps.filter((c) => c.serie === s);
  return `  <section class="bv-serie" id="${slugSerie(s)}">
    <div class="bv-serie-head"><h2>${esc(s)}</h2><span>${lista.length} diarios</span></div>
    <p class="bv-serie-sub">${esc(caps.SERIES[s].sub)}</p>
    <div class="bv-rail">
${lista.map(rail).join('\n')}
    </div>
  </section>`;
}).join('\n\n');
// Paco, 5 nov 2026: «¿dónde están los shorts de Pueblos borrados del mapa? ponlo»: su carril en la portada, después de los países
const bloquePueblos = series.includes('Pueblos borrados del mapa') ? bloqueSeries.split('\n\n').find((b) => b.includes('id="' + slugSerie('Pueblos borrados del mapa') + '"')) || '' : '';
// Documentales de varios países (no salen en «Historias por país») + los de un país que Paco quiere también aquí (9 nov 2026: Vietnam); siguen en su serie
const DOCS_EXTRA = ['historia-de-vietnam-2000-anos-sin-rendirse'];
const docsLista = caps.filter((c) => c.serie === 'Documentales' || DOCS_EXTRA.includes(c.slug));
const bloqueDocs = docsLista.length ? `  <section class="bv-serie" id="${slugSerie('Documentales')}">
    <div class="bv-serie-head"><h2>Documentales</h2><span>${docsLista.length} ${docsLista.length === 1 ? 'documental' : 'documentales'}</span></div>
    <p class="bv-serie-sub">${esc(caps.SERIES.Documentales.sub)}</p>
    <div class="bv-rail">
${docsLista.map(rail).join('\n')}
    </div>
  </section>` : '';
const bloqueGuias = guias.map((g) => `      <a class="bv-gcard" href="${g.u}">
        <h3>${g.t}</h3>
        <p>${g.d}</p>
        <span class="meta">${g.f}</span>
      </a>`).join('\n');

const bloqueRutas = rutas.map((g) => `      <a class="bv-gcard" href="${g.u}">
        <h3>${g.t}</h3>
        <p>${g.d}</p>
        <span class="meta">${g.f}</span>
      </a>`).join('\n');

const indice = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog de viajes — Borrado del Mapa · Viaja con Salma</title>
<meta name="description" content="Diarios de viaje en vídeo, con historia y datos contrastados, y guías prácticas para cuando algo sale mal. Salma te lo cuenta.">
<meta property="og:type" content="website">
<meta property="og:title" content="Blog de viajes — Borrado del Mapa">
<meta property="og:description" content="Diarios de viaje en vídeo y guías para resolver los problemas que no salen en las guías.">
<meta property="og:url" content="${SITE}/blog/">
<meta property="og:image" content="${SITE}/og-image.jpg">
<link rel="canonical" href="${SITE}/blog/">

${HEAD_COMUN}
</head>
<body class="pg">

${CABECERA}

<main class="bv-main">
  <div class="bv-hero">
    <p class="bv-kicker">Diarios · Historia · Consejos reales</p>
    <h1>Blog de <span>viajes</span></h1>
    <p>Viajes de verdad contados en vídeo, con la historia detrás de cada sitio y los datos contrastados. Y guías para cuando algo sale mal.</p>
  </div>

${bloquePaises}
${bloquePueblos}
${bloqueDocs}
  <details class="bv-guias bv-guias--plegado" id="guias">
    <summary><h2>Consejos de viaje</h2><span>${guias.length} guías · ver</span></summary>
    <p class="bv-guias-sub">Problemas reales de viajeros reales. Resueltos por Salma.</p>
    <div class="bv-grid">
${bloqueGuias}
    </div>
  </details>
  <style>.bv-guias--plegado summary{list-style:none;cursor:pointer;display:flex;align-items:baseline;justify-content:space-between;gap:12px}.bv-guias--plegado summary::-webkit-details-marker{display:none}.bv-guias--plegado summary span{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#F4630B;white-space:nowrap}.bv-guias--plegado[open] summary span{opacity:.5}</style>

  <div class="bv-cta">
    <p>¿Tu viaje todavía no tiene ruta? Cuéntale a Salma adónde vas.</p>
    <a href="/?go=chat" class="pg-btn">Pregúntale a Salma</a>
  </div>
</main>
${PIE_Y_MENU}</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'blog', 'index.html'), indice);

// ─── Página de llegada desde los vídeos: borradodelmapa.com/pueblos (Paco, 9 nov 2026) ───
// En un short no hay enlace que se pueda pulsar: esta dirección se dice en la tarjeta final y se teclea. Se ve sin cuenta (CLAUDE.md §10).
const paginaPueblos = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pueblos borrados del mapa — Historias y cómo visitarlos con respeto</title>
<meta name="description" content="Pueblos, oficios y lugares que se están borrando del mapa: mira sus historias en vídeo, con datos y fuentes, y cómo visitarlos con respeto.">
<meta property="og:type" content="website">
<meta property="og:title" content="Pueblos borrados del mapa">
<meta property="og:description" content="Mira sus historias en vídeo, con datos y fuentes, y cómo visitarlos con respeto.">
<meta property="og:url" content="${SITE}/pueblos">
<meta property="og:image" content="${SITE}/og-image.jpg">
<link rel="canonical" href="${SITE}/pueblos">

${HEAD_COMUN}
</head>
<body class="pg">

${CABECERA}

<main class="bv-main">
  <div class="bv-hero">
    <p class="bv-kicker">Vídeos · Historia · Cómo ir</p>
    <h1>Pueblos <span>borrados del mapa</span></h1>
    <p>Las historias de nuestros vídeos, ampliadas, con sus fuentes y cómo visitar cada sitio con respeto. Míralas sin registrarte.</p>
  </div>

${bloquePueblos}
${bloqueDocs}
  <div class="bv-cta">
    <p>¿Quieres ir? Cuéntale a Salma adónde vas y te hace la ruta, gratis.</p>
    <a href="/?go=chat" class="pg-btn">Crea tu ruta gratis</a>
    <p style="margin-top:14px"><a href="/destinos/" style="color:#F4630B;font-weight:700">Ver guías por país →</a></p>
  </div>
</main>
${PIE_Y_MENU}</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'pueblos.html'), paginaPueblos);

// ─── Sitemap: bloque entre comentarios, idempotente ───
const smFile = path.join(ROOT, 'sitemap-blog.xml');
let sm = fs.readFileSync(smFile, 'utf8');
sm = sm.replace(/\s*<!-- VIAJES:START -->[\s\S]*?<!-- VIAJES:END -->/, '');
const urls = caps.map((c) => `  <url><loc>${SITE}/blog/viajes/${c.slug}</loc><lastmod>${c.fecha || FECHA}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
const urlPueblos = `  <url><loc>${SITE}/pueblos</loc><lastmod>2026-11-09</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
sm = sm.replace('</urlset>', `  <!-- VIAJES:START -->\n${urlPueblos}\n${urls}\n  <!-- VIAJES:END -->\n</urlset>`);
fs.writeFileSync(smFile, sm);

console.log(`✔ ${caps.length} diarios · ${series.length} series · ${guias.length} guías · portada del blog`);
