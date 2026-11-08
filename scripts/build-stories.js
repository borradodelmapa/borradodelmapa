// Genera las Web Stories (formato amp-story): stories/<slug>/index.html y sitemap-stories.xml.
// Uso:  node scripts/build-stories.js            → 0 €: solo lee el repo y recorta la portada con ffmpeg
// Spec: claude.ai/artifact/15qcDFV5oHMUt5CzkCGgzW (8 nov 2026). Sale de la MISMA entrada del blog de viajes
// (scripts/paises/<país>/historias.js): una entrada con `story: { portada, slides: [{ foto, h, t, credito?, salida? }] }`
// tiene su story. Las fotos son las ya publicadas en blog/viajes/img/<slug>/ (no se copian); solo la portada vertical 3:4
// se recorta en stories/<slug>/portada.jpg. Los textos se editan en historias.js, nunca en los HTML generados.
// Las stories NO llevan menú de abajo ni aviso de instalar: AMP no admite JS propio (excepción del §9 aprobada por Paco, 8 nov 2026).
// El camino de vuelta es la última slide, que lleva al artículo del blog (y el artículo enlaza a la story).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://borradodelmapa.com';
const OUT = path.join(ROOT, 'stories');
const FECHA = '2026-10-18';    // la de los diarios antiguos sin fecha (= build-blog-viajes.js)
const LOGO = '/icon-192.png';   // 1:1 y ≥96 px (Google lo pide así)
const caps = require('./datos-pais.cjs').historias().filter((c) => c.story && !c.borrador);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nom = (id) => id.replace('/', '-');
const fotoUrl = (c, id) => `/blog/viajes/img/${c.slug}/${nom(id)}.jpg`;
const fotoFile = (c, id) => path.join(ROOT, 'blog', 'viajes', 'img', c.slug, nom(id) + '.jpg');

// Tamaño de un JPG leyendo su cabecera (sin dependencias): para comprobar que la portada es 3:4
function tamJpg(f) {
  const b = fs.readFileSync(f);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error('No sé leer el tamaño de ' + f);
}

// Crédito de una foto de archivo: el mismo que ya lleva en el artículo publicado (pie «Foto: autor · licencia»),
// así no hay una segunda lista de autores. Si la foto no tiene pie allí (p. ej. la portada), va en la slide: credito: [autor, licencia].
function creditoDe(c, s) {
  if (s.credito) return { autor: s.credito[0], lic: s.credito[1] };
  if (c.fotosDe && !s.foto.startsWith('a/')) return null;   // fotos de Paco (sus listas): sin pie. El resto (Wikimedia) siempre con autor, como en build-blog-viajes.js
  const html = fs.readFileSync(path.join(ROOT, 'blog', 'viajes', c.slug + '.html'), 'utf8');
  const i = html.indexOf(fotoUrl(c, s.foto) + '"');
  const m = i >= 0 && html.slice(i, i + 1500).match(/<span>Foto: <a [^>]*>([^<]*)<\/a> · ([^<]*)<\/span>/);
  if (!m) throw new Error(`${c.slug}: la foto ${s.foto} no es de Paco y no encuentro su autor en el pie del artículo; ponlo en la slide (credito: [autor, licencia])`);
  return { autor: m[1].replace(/&amp;/g, '&'), lic: m[2] };
}

// Portada vertical 3:4 (Google: mínimo 640×853): recorte centrado de la foto elegida, una sola vez
const FFS = [path.join(ROOT, 'salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe'), 'ffmpeg'];
function portada(c) {
  const dest = path.join(OUT, c.slug, 'portada.jpg');
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const vf = "crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale='min(960,iw)':-2";
    const ff = FFS.find((f) => f === 'ffmpeg' || fs.existsSync(f));
    const r = spawnSync(ff, ['-v', 'error', '-y', '-i', fotoFile(c, c.story.portada), '-vf', vf, '-q:v', '3', dest]);
    if (r.status || r.error) throw new Error('No puedo recortar la portada de ' + c.slug + ': ' + (r.stderr || r.error));
  }
  const t = tamJpg(dest);
  if (t.w < 640 || t.h < 853 || Math.abs(t.w / t.h - 0.75) > 0.01) throw new Error(`${c.slug}: la portada sale de ${t.w}×${t.h}; tiene que ser 3:4 y al menos 640×853 (elige otra foto)`);
  return `/stories/${c.slug}/portada.jpg`;
}

const CSS = `amp-story{font-family:'Inter',sans-serif;color:#fff}
amp-story-page{background:#0D0F10}
.velo{background:linear-gradient(to bottom,rgba(13,15,16,0) 40%,rgba(13,15,16,.55) 62%,rgba(13,15,16,.92) 100%)}
.txt{align-content:end;padding:0 24px 72px}
.marca{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:#F4630B;margin:0 0 6px}
h1,h2{font-family:'Barlow Condensed',sans-serif;font-weight:800;line-height:1.02;margin:0 0 10px;text-transform:uppercase}
h1{font-size:44px}h2{font-size:36px}
.t{font-size:19px;line-height:1.4;font-weight:500;margin:0;text-shadow:0 1px 8px rgba(0,0,0,.5)}
.cr{position:absolute;right:10px;bottom:8px;font-size:10px;line-height:1.2;color:rgba(236,235,232,.75);margin:0;text-align:right;max-width:70%}`;

function pagina(c) {
  const url = `${SITE}/stories/${c.slug}/`;
  const articulo = `/blog/viajes/${c.slug}`;
  const poster = portada(c);
  const slides = c.story.slides;
  if (slides.length < 4 || slides.length > 8) throw new Error(`${c.slug}: la story tiene ${slides.length} slides; tienen que ser de 4 a 8`);
  if (!slides[slides.length - 1].salida) throw new Error(`${c.slug}: la última slide tiene que llevar «salida» (el botón al artículo)`);
  const paginas = slides.map((s, i) => {
    if (!fs.existsSync(fotoFile(c, s.foto))) throw new Error(`${c.slug}: falta la foto ${fotoFile(c, s.foto)} (las stories usan las del artículo)`);
    const cr = creditoDe(c, s), H = i === 0 ? 'h1' : 'h2';
    return `    <amp-story-page id="p${i + 1}">
      <amp-story-grid-layer template="fill">
        <amp-img src="${fotoUrl(c, s.foto)}" layout="fill" alt="${esc(s.h)}"></amp-img>
      </amp-story-grid-layer>
      <amp-story-grid-layer template="fill" class="velo"></amp-story-grid-layer>
      <amp-story-grid-layer template="vertical" class="txt">
        ${i === 0 ? `<p class="marca">${esc(c.serie)}</p>\n        ` : ''}<${H}>${esc(s.h)}</${H}>
        <p class="t">${esc(s.t)}</p>${cr ? `
        <p class="cr">Foto: ${esc(cr.autor)} · ${esc(cr.lic)}</p>` : ''}
      </amp-story-grid-layer>${s.salida ? `
      <amp-story-page-outlink layout="nodisplay">
        <a href="${articulo}">${esc(s.salida)}</a>
      </amp-story-page-outlink>` : ''}
    </amp-story-page>`;
  }).join('\n');
  const fecha = c.fecha || FECHA;
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: c.titulo, description: c.resumen, image: [SITE + poster],
    datePublished: fecha, dateModified: fecha, author: { '@type': 'Organization', name: 'Borrado del Mapa', url: SITE },
    publisher: { '@type': 'Organization', name: 'Borrado del Mapa', logo: { '@type': 'ImageObject', url: SITE + LOGO } }, mainEntityOfPage: url };
  return `<!doctype html>
<html ⚡ lang="es">
<head>
<meta charset="utf-8">
<title>${esc(c.titulo)} · Borrado del Mapa</title>
<link rel="canonical" href="${url}">
<meta name="viewport" content="width=device-width">
<meta name="description" content="${esc(c.resumen)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(c.titulo)}">
<meta property="og:description" content="${esc(c.resumen)}">
<meta property="og:image" content="${SITE}${poster}">
<meta property="og:url" content="${url}">
<link rel="icon" href="/favicon.ico">
<script async src="https://cdn.ampproject.org/v0.js"></script>
<script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@500&display=swap" rel="stylesheet">
<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
<style amp-custom>
${CSS}
</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <amp-story standalone title="${esc(c.titulo)}" publisher="Borrado del Mapa" publisher-logo-src="${SITE}${LOGO}" poster-portrait-src="${SITE}${poster}">
${paginas}
  </amp-story>
</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const c of caps) {
  fs.mkdirSync(path.join(OUT, c.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, c.slug, 'index.html'), pagina(c));
  console.log('✓ stories/' + c.slug + '/  (' + c.story.slides.length + ' slides)');
}

// Sitemap propio (entra en sitemap.xml). Google descubre las stories por aquí y por el enlace desde cada artículo.
fs.writeFileSync(path.join(ROOT, 'sitemap-stories.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${caps.map((c) => `  <url><loc>${SITE}/stories/${c.slug}/</loc><lastmod>${c.fecha || FECHA}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`).join('\n')}
</urlset>
`);
console.log('✓ sitemap-stories.xml (' + caps.length + ')');
