// Genera los diarios de viaje del blog (blog/viajes/*.html) desde scripts/blog-viajes-data.js.
// Uso:  node scripts/build-blog-viajes.js
// Hace: 1) copia los vídeos ligeros a blog/viajes/video/<slug>.mp4  2) escribe una página por capítulo
//       3) reescribe la sección «Diarios de viaje» de blog/index.html (entre marcadores)  4) añade las URLs a sitemap-blog.xml.
// Los textos se editan en blog-viajes-data.js, nunca en los HTML generados. Cabecera/pie: copia de blog/*.html (§9 del CLAUDE.md).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VIDEO_SRC = path.join(ROOT, 'salma marketing', 'ligeras-portada');
const OUT = path.join(ROOT, 'blog', 'viajes');
const OUT_VIDEO = path.join(OUT, 'video');
const SITE = 'https://borradodelmapa.com';
const FECHA = '2026-10-18';
const FECHA_TXT = '18 octubre 2026';
const CSS_V = 187; // = APP_CSS_V de build-destinos.js

const caps = require('./blog-viajes-data.js');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **negrita** y *cursiva* sobre texto ya escapado
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

// Duración (ISO 8601) leyendo la caja mvhd del mp4, sin ffmpeg.
function duracionMp4(file) {
  const b = fs.readFileSync(file);
  const i = b.indexOf('mvhd');
  if (i < 0) return null;
  const ver = b[i + 4];
  const scale = ver === 1 ? b.readUInt32BE(i + 24) : b.readUInt32BE(i + 16);
  const dur = ver === 1 ? Number(b.readBigUInt64BE(i + 28)) : b.readUInt32BE(i + 20);
  const sec = Math.round(dur / scale);
  return { sec, iso: `PT${Math.floor(sec / 60)}M${sec % 60}S`, txt: `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, '0')} s` };
}

fs.mkdirSync(OUT_VIDEO, { recursive: true });
caps.forEach((c, i) => {
  const src = path.join(VIDEO_SRC, c.video);
  const dst = path.join(OUT_VIDEO, c.slug + '.mp4');
  if (!fs.existsSync(src)) throw new Error('Falta el vídeo ' + src);
  if (!fs.existsSync(dst) || fs.statSync(dst).size !== fs.statSync(src).size) fs.copyFileSync(src, dst);
  c.dur = duracionMp4(dst);
  c.n = i;
});

function pagina(c) {
  const ant = caps[c.n - 1], sig = caps[c.n + 1];
  const url = `${SITE}/blog/viajes/${c.slug}`;
  const desc = c.resumen;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: c.titulo, description: desc, author: { '@type': 'Person', name: 'Salma' },
      publisher: { '@type': 'Organization', name: 'Borrado del Mapa', url: SITE }, datePublished: FECHA, dateModified: FECHA, mainEntityOfPage: url },
    { '@context': 'https://schema.org', '@type': 'VideoObject', name: c.titulo, description: desc, uploadDate: FECHA,
      contentUrl: `${SITE}/blog/viajes/video/${c.slug}.mp4`, duration: c.dur.iso },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog de viajes', item: SITE + '/blog/' },
      { '@type': 'ListItem', position: 2, name: c.serie, item: SITE + '/blog/#' + slugSerie(c.serie) },
      { '@type': 'ListItem', position: 3, name: c.titulo, item: url } ] },
  ].map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 1)}\n</script>`).join('\n');

  const secciones = c.secciones.map((s) => `  <h2>${esc(s.h)}</h2>\n${s.p.map((p) => `  <p>${md(p)}</p>`).join('\n')}`).join('\n\n');
  const ficha = c.ficha ? `  <div class="info-box">\n    <p><strong>Ficha útil</strong></p>\n    <ul>\n${c.ficha.map((f) => `      <li>${md(f)}</li>`).join('\n')}\n    </ul>\n  </div>\n` : '';
  const fuentes = `  <h2>Datos y fuentes</h2>\n  <p>${md(c.nota)}</p>\n  <ul class="viaje-fuentes">\n${c.fuentes.map((f) => `    <li><a href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.t)}</a></li>`).join('\n')}\n  </ul>`;
  const cierre = c.cierre ? `  <p class="viaje-cierre">${md(c.cierre)}</p>\n` : '';
  const [dSlug, dNombre] = c.destino;
  const nav = `  <div class="viaje-nav">
    ${ant ? `<a href="/blog/viajes/${ant.slug}">← ${esc(ant.titulo)}</a>` : '<span></span>'}
    ${sig ? `<a href="/blog/viajes/${sig.slug}">${esc(sig.titulo)} →</a>` : '<span></span>'}
  </div>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.titulo)} · Diario de viaje · Borrado del Mapa</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(c.titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta property="og:site_name" content="Borrado del Mapa">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">

${ld}

<link rel="icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=${CSS_V}">
<link rel="stylesheet" href="/paginas.css?v=3">
<style>
  .viaje-kicker { font-family:'Barlow Condensed',sans-serif; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--dorado2,#F4630B); font-size:14px; margin-bottom:6px; }
  .viaje-video { width:100%; max-width:420px; display:block; margin:20px auto 8px; background:#000; aspect-ratio:9/16; }
  .viaje-video-nota { text-align:center; font-size:13px; opacity:.7; margin-bottom:28px; }
  .viaje-fuentes li { font-size:14px; margin-bottom:4px; }
  .viaje-cierre { font-style:italic; margin-top:24px; }
  .viaje-nav { display:flex; justify-content:space-between; gap:16px; margin:32px 0 8px; font-weight:600; }
  .viaje-nav a { color:var(--text-primary); text-decoration:none; max-width:48%; }
  .viaje-nav a:last-child { text-align:right; }
  .info-box ul { margin:8px 0 0 18px; }
</style>
</head>
<body class="pg">

<header class="pg-header">
  <a class="ce-brand" href="/"><i class="ce-mark" aria-hidden="true"></i>BORRADO<span>DEL</span>MAPA</a>
  <a class="pg-header-sec" href="/blog/">Blog de viajes</a>
</header>

<main class="pg-main">
<article class="blog-article">
  <div class="viaje-kicker">Diario de viaje · ${esc(c.serie)} · ${esc(c.cap)}</div>
  <h1 class="blog-title">${esc(c.titulo)}</h1>
  <p class="blog-subtitle">${esc(c.resumen)}</p>

  <video class="viaje-video" controls playsinline preload="metadata" src="/blog/viajes/video/${c.slug}.mp4"></video>
  <p class="viaje-video-nota">En vídeo · ${c.dur.txt} · narra Salma</p>

${secciones}

${ficha}${cierre}
${fuentes}

  <div class="bloque-con-salma">
    <div class="bloque-label">
      <img src="/salma_ai_avatar.png" alt="Salma" class="salma-avatar">
      ¿Vas a ${esc(c.serie === 'Vietnam' ? 'Vietnam' : 'Tailandia')}?
    </div>
    <p>Dile a Salma cuántos días tienes y qué te gustaría ver: te prepara la ruta con mapa, paradas y consejos, gratis. Más sobre <a href="/destinos/${dSlug}.html">${esc(dNombre)}</a>.</p>
    <p><a class="pg-btn" href="/?go=chat">Crear mi ruta</a></p>
  </div>

  <p class="viaje-video-nota">Viaje, fotos y vivencias 100 % reales. Guion, voz y montaje hechos con ayuda de IA.</p>

${nav}
</article>
</main>

<footer class="pg-footer">
  <a href="/">Inicio</a>
  <a href="/destinos/">Destinos</a>
  <a href="/blog/">Blog</a>
  <a href="/legal.html#aviso-legal">Aviso legal</a>
  <a href="/legal.html#privacidad">Privacidad</a>
  <a href="/legal.html#cookies">Cookies</a>
</footer>
</body>
</html>
`;
}

function slugSerie(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

caps.forEach((c) => fs.writeFileSync(path.join(OUT, c.slug + '.html'), pagina(c)));

// Índice: sección «Diarios de viaje» entre marcadores en blog/index.html
const series = [...new Set(caps.map((c) => c.serie))];
const bloqueIdx = series.map((s) => {
  const items = caps.filter((c) => c.serie === s).map((c) => `  <a href="/blog/viajes/${c.slug}" class="article-card">
    <h2>${esc(c.titulo)}</h2>
    <p>${esc(c.cap)} · ${esc(c.resumen)}</p>
    <span class="meta">${FECHA_TXT} · vídeo ${c.dur.txt}</span>
  </a>`).join('\n\n');
  return `  <h3 class="blog-serie" id="${slugSerie(s)}">${esc(s)}</h3>\n  <div class="articles">\n\n${items}\n\n  </div>`;
}).join('\n\n');
const idxFile = path.join(ROOT, 'blog', 'index.html');
let idx = fs.readFileSync(idxFile, 'utf8');
const A = '<!-- DIARIOS:START -->', B = '<!-- DIARIOS:END -->';
if (!idx.includes(A)) throw new Error('Faltan los marcadores DIARIOS en blog/index.html');
idx = idx.replace(new RegExp(A + '[\\s\\S]*?' + B), `${A}\n${bloqueIdx}\n  ${B}`);
fs.writeFileSync(idxFile, idx);

// Sitemap: bloque entre comentarios, idempotente
const smFile = path.join(ROOT, 'sitemap-blog.xml');
let sm = fs.readFileSync(smFile, 'utf8');
sm = sm.replace(/\s*<!-- VIAJES:START -->[\s\S]*?<!-- VIAJES:END -->/, '');
const urls = caps.map((c) => `  <url><loc>${SITE}/blog/viajes/${c.slug}</loc><lastmod>${FECHA}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
sm = sm.replace('</urlset>', `  <!-- VIAJES:START -->\n${urls}\n  <!-- VIAJES:END -->\n</urlset>`);
fs.writeFileSync(smFile, sm);

console.log(`✔ ${caps.length} capítulos · ${series.length} series · vídeos en blog/viajes/video/`);
caps.forEach((c) => console.log(`  ${c.slug}  ${c.dur.txt}`));
