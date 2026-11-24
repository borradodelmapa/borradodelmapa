// ¿Se ha quedado alguna página atrás? (27 oct 2026, Paco: «que no vuelva a pasar de dejarse cosas atrás»)
//
//   node scripts/comprobar-nada-atras.cjs      → 0 € · lee los archivos del repo · sale con error si algo no cuadra
//
// La web tiene piezas que viven en muchas páginas a la vez (CLAUDE.md §9): styles.css, destinos.css, paginas.css,
// el aviso «Instala la app» (instalar-app.js), Google Analytics (ga4.js), el menú de abajo y el favicon. Cada sesión arreglaba lo que veía y el
// resto se quedaba atrás (páginas en styles.css 186, 187 y 190 a la vez; aviso de instalar en 0 de 1.793 destinos).
// Este script lo mira TODO de una vez: cada página pública y las constantes de los generadores.
// Lo pasa también GitHub en cada subida (.github/workflows/nada-atras.yml): si falla, llega un correo.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const leer = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

// No son páginas de la web: carpetas de trabajo y motores que la app abre dentro de un iframe o que redirigen.
const CARPETAS_FUERA = /^(backups|salma marketing|guias-generadas|docs|scripts|worker|mockups|\.claude|\.github|node_modules)\//;
const NO_SON_PAGINAS = new Set([
  'video.html', 'viaje-fotos.html',   // motores del vídeo/álbum, van dentro de la app (fotos-viaje.js)
  'muestra-video.html',               // muestra interna del vídeo
  'tu-mundo.html', 'qr.html',         // solo redirigen
  'voice-test.html',                  // prueba de voz
]);

const todas = execSync('git ls-files -z -- "*.html"', { cwd: ROOT, maxBuffer: 64 << 20 }).toString('utf8')
  .split('\0').filter(Boolean)
  .filter((f) => !CARPETAS_FUERA.test(f) && !NO_SON_PAGINAS.has(f) && fs.existsSync(path.join(ROOT, f)));
// Web Stories (stories/<slug>/index.html, 8 nov 2026): son AMP y AMP no admite JS propio, así que no llevan menú de abajo ni
// aviso de instalar (excepción del §9 aprobada por Paco), ni ga4.js (miden con amp-analytics + aviso de cookies, ver docs/web-stories.md). Se revisan aparte, al final, con lo que sí tienen que llevar.
const STORY = /^stories\//;
const paginas = todas.filter((f) => !STORY.test(f));
const stories = todas.filter((f) => STORY.test(f));

const redes = require('./redes.cjs');
const fallos = [];
const versiones = {};   // pieza → { versión → [páginas] }
const PIEZAS = ['styles.css', 'destinos.css', 'paginas.css', 'instalar-app.js', 'ga4.js', 'ayuda.css'];

for (const f of paginas) {
  const h = leer(f);
  for (const p of PIEZAS) {
    const re = new RegExp(p.replace('.', '\\.') + '(\\?v=(\\d+))?["\']', 'g');
    let m;
    while ((m = re.exec(h))) {
      const v = m[2] || 'SIN ?v=';
      ((versiones[p] = versiones[p] || {})[v] = versiones[p][v] || []).push(f);
    }
  }
  if (!h.includes('instalar-app.js')) fallos.push(`${f}: no lleva el aviso «Instala la app» (instalar-app.js)`);
  // Google Analytics: UN solo script con los IDs (ga4.js, Paco 8 nov 2026); ninguna página con su propia copia
  if (!h.includes('/ga4.js')) fallos.push(`${f}: no lleva Google Analytics (ga4.js)`);
  if (/googletagmanager\.com\/gtag|gtag\('config'/.test(h)) fallos.push(`${f}: lleva su propia copia de Google Analytics (debe ir solo por ga4.js)`);
  if (f !== 'index.html' && !h.includes('app-bottom-bar')) fallos.push(`${f}: no lleva el menú de abajo (app-bottom-bar)`);
  if (!h.includes('favicon')) fallos.push(`${f}: no lleva el favicon`);
  // Redes en todos los pies y, debajo de cada vídeo del blog, suscribirse y compartir (Paco, 7 nov 2026)
  if (/class="(pg-footer|destino-footer)[ "]/.test(h)) for (const u of [redes.YOUTUBE, redes.TIKTOK, redes.INSTAGRAM]) if (!h.includes(u)) fallos.push(`${f}: al pie le falta el enlace a ${u}`);
  if (f.startsWith('blog/viajes/') && (h.includes('<video class="bd-video"') || h.includes('class="bd-yt"')) && !h.includes(redes.SUSCRIBIRSE)) fallos.push(`${f}: el vídeo no lleva el botón de suscribirse`);
  if (f.startsWith('blog/viajes/') && !h.includes('bd-compartir')) fallos.push(`${f}: no lleva el botón de compartir`);
}

// Cada pieza, UNA sola versión en toda la web
const unica = {};
for (const [p, porV] of Object.entries(versiones)) {
  const vs = Object.keys(porV);
  if (vs.length === 1) { unica[p] = vs[0]; continue; }
  const mayor = vs.filter((v) => /^\d+$/.test(v)).sort((a, b) => b - a)[0];
  unica[p] = mayor;
  for (const v of vs) {
    if (v === mayor) continue;
    const ej = porV[v].slice(0, 3).join(', ') + (porV[v].length > 3 ? ` y ${porV[v].length - 3} más` : '');
    fallos.push(`${p}?v=${v} en ${porV[v].length} páginas (lo vigente es ?v=${mayor}): ${ej}`);
  }
}

// La app (index.html) manda: styles.css de las demás páginas = el de index.html
const vIndex = (leer('index.html').match(/styles\.css\?v=(\d+)/) || [])[1];
if (vIndex && unica['styles.css'] !== vIndex) fallos.push(`styles.css: index.html va en ?v=${vIndex} y el resto de páginas en ?v=${unica['styles.css']}`);

// Los generadores tienen que escribir lo mismo que ya está en las páginas (si no, la próxima vez se vuelve atrás)
const constante = (archivo, nombre) => { const m = leer(archivo).match(new RegExp('const ' + nombre + '\\s*=\\s*(\\d+)')); return m && m[1]; };
const comparar = (archivo, nombre, pieza, debe) => {
  const v = constante(archivo, nombre);
  if (v == null) fallos.push(`${archivo}: no encuentro la constante ${nombre}`);
  else if (debe && v !== debe) fallos.push(`${archivo}: ${nombre} = ${v} pero ${pieza} va en ?v=${debe}`);
};
comparar('scripts/build-destinos.js', 'APP_CSS_V', 'styles.css', vIndex);
comparar('scripts/build-destinos.js', 'DESTINOS_CSS_V', 'destinos.css', unica['destinos.css']);
comparar('scripts/build-blog-viajes.js', 'CSS_V', 'styles.css', vIndex);
for (const archivo of ['scripts/build-destinos.js']) for (const [js, que] of [['instalar-app.js', 'el aviso «Instala la app»'], ['ga4.js', 'Google Analytics']]) {
  const vs = [...leer(archivo).matchAll(new RegExp(js.replace('.', '\\.') + '\\?v=(\\d+)', 'g'))].map((m) => m[1]);
  if (!vs.length) fallos.push(`${archivo}: no pone ${que} (${js}) en las páginas que genera`);
  for (const v of new Set(vs)) if (v !== unica[js]) fallos.push(`${archivo}: escribe ${js}?v=${v} pero las páginas van en ?v=${unica[js]}`);
}

// Cada story: AMP con los metadatos que pide Google, portada 3:4 existente, enlace de vuelta al artículo y en el sitemap.
// Y cada artículo con story enlaza a ella (si no, Google y los lectores no la encuentran).
const smStories = fs.existsSync(path.join(ROOT, 'sitemap-stories.xml')) ? leer('sitemap-stories.xml') : '';
if (stories.length && !leer('sitemap.xml').includes('sitemap-stories.xml')) fallos.push('sitemap.xml: no incluye sitemap-stories.xml');
for (const f of stories) {
  const h = leer(f), slug = f.split('/')[1];
  if (!/<html ⚡|<html amp/.test(h) || !h.includes('<amp-story ')) fallos.push(`${f}: no es una página amp-story`);
  for (const a of ['standalone', 'title=', 'publisher=', 'publisher-logo-src=', 'poster-portrait-src=']) if (!h.includes(a)) fallos.push(`${f}: a <amp-story> le falta ${a.replace('=', '')}`);
  if (!fs.existsSync(path.join(ROOT, 'stories', slug, 'portada.jpg'))) fallos.push(`${f}: falta stories/${slug}/portada.jpg`);
  if (!h.includes(`<a href="/blog/viajes/${slug}">`)) fallos.push(`${f}: la última slide no lleva al artículo /blog/viajes/${slug}`);
  if (!h.includes('favicon')) fallos.push(`${f}: no lleva el favicon`);
  // Analytics con los mismos IDs que ga4.js y solo tras aceptar cookies (amp-consent + data-block-on-consent)
  const gaIds = ((leer('ga4.js').match(/var IDS = \[([^\]]*)\]/) || [])[1] || '').match(/G-[A-Z0-9]+/g) || [];
  if (!h.includes('<amp-consent') || !h.includes('data-block-on-consent')) fallos.push(`${f}: falta el aviso de cookies de AMP (amp-consent) o la analítica no espera al permiso`);
  for (const id of gaIds) if (!h.includes(`"${id}"`)) fallos.push(`${f}: la analítica no lleva ${id} (el de ga4.js): node scripts/build-stories.js`);
  if (!smStories.includes(`/stories/${slug}/`)) fallos.push(`${f}: no está en sitemap-stories.xml`);
  const art = `blog/viajes/${slug}.html`;
  if (fs.existsSync(path.join(ROOT, art)) && !leer(art).includes(`/stories/${slug}/`)) fallos.push(`${art}: no enlaza a su story /stories/${slug}/`);
}

// CABEZAS NUNCA CORTADAS (Paco, 22 nov 2026: «mira que las cabezas no salgan cortadas. Y que no vuelva a pasar»): una foto vertical no puede ir recortada
// al centro en un hueco más ancho. Blog: la de un apartado va entera (object-fit:contain); destinos: recortada por arriba (object-position). Lo ponen los generadores.
{
  const medidas = (file) => { try { const b = fs.readFileSync(file); let i = 2; while (i < b.length) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1], L = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; i += 2 + L; } } catch (e) {} return null; };
  for (const p of paginas.filter((x) => /^blog\/viajes\/[^/]+\.html$/.test(x))) {
    for (const m of leer(p).matchAll(/<figure class="bd-fig">\s*<img src="([^"]+)"([^>]*)>/g)) {
      const d = medidas(path.join(ROOT, m[1].replace(/^\//, '')));
      if (d && d.h >= d.w * 0.95 && !m[2].includes('object-fit:contain')) fallos.push(`${p}: foto vertical recortada (cabeza cortada): ${m[1]} → regenerar con build-blog-viajes.js`);
    }
  }
  for (const p of paginas.filter((x) => x.startsWith('destinos/'))) {
    for (const m of leer(p).matchAll(/<img[^>]*src="\/destinos\/img\/[^"]+"[^>]*>/g)) {
      const w = +(m[0].match(/width="(\d+)"/) || [])[1], h = +(m[0].match(/height="(\d+)"/) || [])[1];
      if (w && h && h >= w * 0.95 && !m[0].includes('object-position')) fallos.push(`${p}: foto vertical recortada (cabeza cortada) → regenerar con build-destinos.js`);
    }
  }
}
// CADA VÍDEO, CON SU ENTRADA (Paco, 22 nov 2026: «CADA VIDEO QUE SE SUBA HAN DE ESTAR TAMBIEN EN LA WEB LISTADOS»; encargo T36): toda carpeta de montaje con
// vídeo terminado (salma marketing/pueblos/<x>/ULTIMA o tailandia-largos/<x>/ULTIMA) tiene que tener su entrada publicada, que la nombre en creditosDe,
// fotosEpisodios o «montaje». Solo se mira donde está la carpeta «salma marketing» completa (en GitHub no está).
{
  const MKTC = fs.existsSync(path.join(ROOT, 'salma marketing', 'india', 'herramientas', 'node_modules')) ? ROOT : path.resolve(ROOT, '..', '..', '..');
  const entradas = JSON.stringify(require('./datos-pais.cjs').historias().filter((c) => !c.borrador));
  for (const base of ['pueblos', 'tailandia-largos']) {
    const d = path.join(MKTC, 'salma marketing', base);
    if (!fs.existsSync(d)) continue;
    for (const x of fs.readdirSync(d)) {
      const u = path.join(d, x, 'ULTIMA');
      if (!fs.existsSync(u) || !fs.readdirSync(u).some((f) => f.endsWith('.mp4'))) continue;
      // Un montaje marcado «borrador» en ULTIMA/VERSION.txt aún no es un vídeo que se sube: se mira cuando sea el definitivo
      const ver = path.join(u, 'VERSION.txt');
      if (fs.existsSync(ver) && /borrador/i.test(fs.readFileSync(ver, 'utf8'))) continue;
      if (!entradas.includes(`${base}/${x}"`) && !entradas.includes(`${base}/${x}/`)) fallos.push(`salma marketing/${base}/${x}: vídeo terminado sin entrada en el blog (P12) → hacer su entrada con build-blog-viajes.js`);
    }
  }
}
// Ningún «undefined» en una entrada o story (22 nov 2026: a una entrada le faltaba la nota y salía <p>undefined</p>)
for (const p of [...paginas.filter((x) => x.startsWith('blog/viajes/')), ...stories]) if (/>\s*undefined\s*</.test(leer(p))) fallos.push(`${p}: sale «undefined» en la página (falta un campo en historias.js)`);
// Paso obligatorio (Paco, 9 nov 2026; P15 de docs/video-checklist.md): toda entrada publicada del blog con vídeo tiene su story
for (const c of require('./datos-pais.cjs').historias()) {
  if (c.video && !c.borrador && fs.existsSync(path.join(ROOT, 'blog', 'viajes', c.slug + '.html')) && !stories.includes(`stories/${c.slug}/index.html`))
    fallos.push(`blog/viajes/${c.slug}.html: la entrada tiene vídeo y no tiene Web Story (campo story en historias.js → node scripts/build-stories.js)`);
}

// Índice y sitemap de destinos (Paco, 13 nov 2026, tras la subida mala 070c63053, que los dejó a medias):
// el índice enlaza a todas las páginas de país, y el sitemap lleva todas las páginas indexables que existen.
{
  const idx = fs.existsSync(path.join(ROOT, 'destinos/index.html')) ? leer('destinos/index.html') : '';
  const enlaces = new Set((idx.match(/href="\/destinos\/[a-z0-9-]+\.html"/g) || []).map((x) => x.slice(16, -1)));
  const paises = paginas.filter((f) => /^destinos\/[a-z0-9-]+\.html$/.test(f) && f !== 'destinos/index.html' && leer(f).includes('dp-tiene'));
  const sinEnlace = paises.filter((f) => !enlaces.has(f.slice(9)));
  if (!idx) fallos.push('destinos/index.html: no existe');
  else if (sinEnlace.length) fallos.push(`destinos/index.html: no enlaza a ${sinEnlace.length} de ${paises.length} páginas de país (p. ej. ${sinEnlace.slice(0, 3).join(', ')}): node scripts/build-destinos.js --index-only`);
  const sm = fs.existsSync(path.join(ROOT, 'sitemap-destinos.xml')) ? leer('sitemap-destinos.xml') : '';
  const indexables = JSON.parse(leer('scripts/destinos-indexables.json')).slugs;
  const faltan = indexables.filter((s) => (s === 'index' || paginas.includes(`destinos/${s}.html`)) && !sm.includes(s === 'index' ? '/destinos/</loc>' : `/destinos/${s}.html</loc>`));
  if (faltan.length) fallos.push(`sitemap-destinos.xml: faltan ${faltan.length} de las ${indexables.length} páginas indexables (p. ej. ${faltan.slice(0, 3).join(', ')}): node scripts/build-destinos.js --sitemap-only`);
}

// Fotos de destinos con PRUEBA (Paco, 18 nov 2026: una bici de Cracovia salió como «Trekking» del Colca). Toda foto de
// destinos/img/<sitio>/fotos.json lleva "prueba" (Wikimedia la sitúa a menos de 15 km o en la categoría del sitio; la pone
// scripts/verificar-fotos.cjs o fotos-sitio.cjs) y está vista por una persona (sin "pendiente_revision"). Las fotos de antes de
// la regla están en scripts/fotos-sin-prueba.json: esa lista solo puede ir a menos (verificarlas o quitarlas), nunca crecer.
{
  const base = new Set(JSON.parse(leer('scripts/fotos-sin-prueba.json')).fotos);
  if (base.size > 0) fallos.push(`scripts/fotos-sin-prueba.json: tiene ${base.size} fotos y debe estar vacía (18 nov 2026): una foto nueva necesita prueba, no entrar en esta lista`);
  const dir = path.join(ROOT, 'destinos', 'img');
  let sinPrueba = 0, pendientes = 0; const ej = [];
  for (const s of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const fj = path.join(dir, s, 'fotos.json'); if (!fs.existsSync(fj)) continue;
    const j = JSON.parse(fs.readFileSync(fj, 'utf8'));
    const huecos = [['hero', j.hero], ...Object.entries(j.que_hacer || {}).map(([k, v]) => ['q' + k, v]), ...Object.entries(j.stops || {}).map(([k, v]) => ['s' + k, v])];
    for (const [h, v] of huecos) {
      if (!v) continue;
      if (v.pendiente_revision) { pendientes++; if (ej.length < 3) ej.push(`${s} ${h} (sin revisar)`); }
      else if (!v.prueba && !base.has(`${s} ${h} ${v.url}`)) { sinPrueba++; if (ej.length < 3) ej.push(`${s} ${h}`); }
    }
  }
  if (sinPrueba || pendientes) fallos.push(`destinos/img: ${sinPrueba} fotos sin prueba de ser del sitio y ${pendientes} sin revisar a ojo (p. ej. ${ej.join(', ')}): node scripts/verificar-fotos.cjs <sitio> --aplicar y mirarlas`);
}

console.log(`Páginas revisadas: ${paginas.length}` + (stories.length ? ` (+ ${stories.length} web stories)` : ''));
for (const p of PIEZAS) if (unica[p]) console.log(`  ${p}?v=${unica[p]}`);
if (fallos.length) {
  console.log(`\n❌ ${fallos.length} cosas se han quedado atrás:`);
  for (const x of fallos.slice(0, 60)) console.log('  - ' + x);
  if (fallos.length > 60) console.log(`  … y ${fallos.length - 60} más`);
  process.exitCode = 1;
} else {
  console.log('\n✅ Nada se ha quedado atrás');
}
