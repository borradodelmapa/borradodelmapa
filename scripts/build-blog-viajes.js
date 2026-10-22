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
const VIDEO_SRC = path.join(ROOT, 'salma marketing', 'ligeras-portada');
const OUT = path.join(ROOT, 'blog', 'viajes');
const OUT_VIDEO = path.join(OUT, 'video');
const SITE = 'https://borradodelmapa.com';
const FECHA = '2026-10-18';
const FECHA_TXT = '18 octubre 2026';
const CSS_V = 187;      // styles.css (= APP_CSS_V de build-destinos.js)
const BV_CSS_V = 3;     // blog-viajes.css

const caps = require('./blog-viajes-data.js');
const guias = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog-guias.json'), 'utf8'));
// Rutas completas (guías públicas <slug>.html de la app): enlazadas desde el índice del blog para que Google las encuentre.
const rutas = JSON.parse(fs.readFileSync(path.join(__dirname, 'blog-rutas.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const slugSerie = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const capCorto = (c) => (/^Cap/.test(c.cap) ? 'Cap. ' + c.cap.match(/\d+/)[0] : c.cap);

// Pie y menú de abajo: copia de una página de blog existente
const ref = fs.readFileSync(path.join(ROOT, 'blog', 'perder-el-avion.html'), 'utf8');
const PIE_Y_MENU = ref.slice(ref.indexOf('<footer class="pg-footer">'), ref.indexOf('</body>'));
if (!PIE_Y_MENU.includes('app-bottom-bar')) throw new Error('No encuentro el menú de abajo en blog/perder-el-avion.html');

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

fs.mkdirSync(OUT_VIDEO, { recursive: true });
caps.forEach((c, i) => {
  const src = path.join(VIDEO_SRC, c.video);
  const dst = path.join(OUT_VIDEO, c.slug + '.mp4');
  if (!fs.existsSync(src)) throw new Error('Falta el vídeo ' + src);
  if (!fs.existsSync(dst) || fs.statSync(dst).size !== fs.statSync(src).size) fs.copyFileSync(src, dst);
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

function pagina(c) {
  const ant = caps[c.n - 1], sig = caps[c.n + 1];
  const url = `${SITE}/blog/viajes/${c.slug}`;
  const img = `/blog/viajes/img/${c.slug}.jpg`;
  const serieCaps = caps.filter((x) => x.serie === c.serie);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: c.titulo, description: c.resumen, image: SITE + img, author: { '@type': 'Person', name: 'Salma' },
      publisher: { '@type': 'Organization', name: 'Borrado del Mapa', url: SITE }, datePublished: FECHA, dateModified: FECHA, mainEntityOfPage: url },
    { '@context': 'https://schema.org', '@type': 'VideoObject', name: c.titulo, description: c.resumen, uploadDate: FECHA, thumbnailUrl: SITE + img,
      contentUrl: `${SITE}/blog/viajes/video/${c.slug}.mp4`, duration: c.dur.iso },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog de viajes', item: SITE + '/blog/' },
      { '@type': 'ListItem', position: 2, name: c.serie, item: SITE + '/blog/#' + slugSerie(c.serie) },
      { '@type': 'ListItem', position: 3, name: c.titulo, item: url } ] },
  ].map((o) => `<script type="application/ld+json">\n${JSON.stringify(o, null, 1)}\n</script>`).join('\n');

  const pasos = serieCaps.length > 1 ? `    <nav class="bd-steps" aria-label="Capítulos de ${esc(c.serie)}">\n${serieCaps.map((x) =>
    `      <a href="/blog/viajes/${x.slug}"${x === c ? ' class="on" aria-current="page"' : ''} title="${esc(x.titulo)}">${x.cap === 'Especial' ? 'ES' : x.cap.match(/\d+/)[0]}</a>`).join('\n')}\n    </nav>\n` : '';
  const stats = c.cifras ? `    <div class="bd-stats">\n${c.cifras.map(([n, t]) => `      <div class="bd-stat"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join('\n')}\n    </div>\n` : '';
  const secciones = c.secciones.map((s, i) => `    <section class="bd-sec">
      <span class="bd-sec-n">${String(i + 1).padStart(2, '0')}</span>
      <h2>${esc(s.h)}</h2>
${s.p.map((p) => `      <p>${md(p)}</p>`).join('\n')}
    </section>`).join('\n\n');
  const ficha = c.ficha ? `    <aside class="bd-ficha">\n      <h3>Ficha útil</h3>\n      <ul>\n${c.ficha.map((f) => `        <li>${md(f)}</li>`).join('\n')}\n      </ul>\n    </aside>\n` : '';
  const cierre = c.cierre ? `    <p class="bd-cierre">${md(c.cierre)}</p>\n` : '';
  const fuentes = `    <details class="bd-src">
      <summary>Datos y fuentes</summary>
      <p>${md(c.nota)}</p>
      <ul>
${c.fuentes.map((f) => `        <li><a href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.t)}</a></li>`).join('\n')}
      </ul>
    </details>`;
  const [dSlug, dNombre] = c.destino;
  const nx = (x, lado) => x ? `      <a class="bd-nx${lado === 'der' ? ' der' : ''}" href="/blog/viajes/${x.slug}">
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

${HEAD_COMUN}
</head>
<body class="pg">

${CABECERA}

<main class="bd-main">
  <p class="bd-crumbs"><a href="/blog/">Blog de viajes</a> · <a href="/blog/#${slugSerie(c.serie)}">${esc(c.serie)}</a></p>
  <div class="bd-layout">
    <header class="bd-head">
      <span class="bd-kicker">${esc(c.serie)} · ${esc(c.cap)}</span>
      <h1 class="bd-title">${esc(c.titulo)}</h1>
      <p class="bd-lead">${esc(c.resumen)}</p>
    </header>

    <div class="bd-media">
      <video class="bd-video" controls playsinline preload="metadata" poster="${img}" src="/blog/viajes/video/${c.slug}.mp4"></video>
      <div class="bd-video-meta"><span>Vídeo · ${c.dur.txt}</span><span>Narra Salma</span></div>
      <p class="bd-ia">Viaje, fotos y vivencias 100 % reales. Guion, voz y montaje hechos con ayuda de IA.</p>
    </div>

    <article class="bd-body">
${pasos}${stats}
${secciones}

${ficha}${cierre}
${fuentes}

      <div class="bd-salma">
        <img src="/salma_ai_avatar.png" alt="Salma">
        <div>
          <p><strong>¿Vas a ${esc(c.serie === 'Vietnam' ? 'Vietnam' : 'Tailandia')}?</strong> Dile a Salma cuántos días tienes y qué te gustaría ver: te prepara la ruta con mapa, paradas y consejos, gratis. Más sobre <a href="/destinos/${dSlug}.html">${esc(dNombre)}</a>.</p>
          <p><a class="pg-btn" href="/?go=chat">Crear mi ruta</a></p>
        </div>
      </div>
    </article>

    <div class="bd-next">
${nav}
    </div>
  </div>
</main>
${PIE_Y_MENU}</body>
</html>
`;
}

caps.forEach((c) => fs.writeFileSync(path.join(OUT, c.slug + '.html'), pagina(c)));

// ─── Portada del blog ───
const series = [...new Set(caps.map((c) => c.serie))];
const rail = (c) => `      <a class="bv-card" href="/blog/viajes/${c.slug}">
        <div class="bv-poster"><img src="/blog/viajes/img/${c.slug}.jpg" alt="${esc(c.titulo)}" loading="lazy"><span class="bv-chip">${esc(capCorto(c))}</span><span class="bv-play" aria-hidden="true"></span></div>
        <div class="bv-card-t">${esc(c.titulo)}</div>
        <div class="bv-card-m">Vídeo ${c.dur.txt}</div>
      </a>`;
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

${bloqueSeries}

  <section class="bv-guias" id="rutas">
    <h2>Rutas completas</h2>
    <p class="bv-guias-sub">Itinerarios día a día creados con Salma, con mapa y paradas.</p>
    <div class="bv-grid">
${bloqueRutas}
    </div>
  </section>

  <section class="bv-guias" id="guias">
    <h2>Guías prácticas</h2>
    <p class="bv-guias-sub">Problemas reales de viajeros reales. Resueltos por Salma.</p>
    <div class="bv-grid">
${bloqueGuias}
    </div>
  </section>

  <div class="bv-cta">
    <p>¿Tu viaje todavía no tiene ruta? Cuéntale a Salma adónde vas.</p>
    <a href="/?go=chat" class="pg-btn">Pregúntale a Salma</a>
  </div>
</main>
${PIE_Y_MENU}</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'blog', 'index.html'), indice);

// ─── Sitemap: bloque entre comentarios, idempotente ───
const smFile = path.join(ROOT, 'sitemap-blog.xml');
let sm = fs.readFileSync(smFile, 'utf8');
sm = sm.replace(/\s*<!-- VIAJES:START -->[\s\S]*?<!-- VIAJES:END -->/, '');
const urls = caps.map((c) => `  <url><loc>${SITE}/blog/viajes/${c.slug}</loc><lastmod>${FECHA}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
sm = sm.replace('</urlset>', `  <!-- VIAJES:START -->\n${urls}\n  <!-- VIAJES:END -->\n</urlset>`);
fs.writeFileSync(smFile, sm);

console.log(`✔ ${caps.length} diarios · ${series.length} series · ${guias.length} guías · portada del blog`);
