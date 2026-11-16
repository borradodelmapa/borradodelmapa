#!/usr/bin/env node
// COMPROBADOR DE UN PAÍS (16 nov 2026, Paco: «crear un país y chequear que todo el proceso funciona»).
// La lista «Terminado» de docs/paises/PROTOCOLO.md, mirada sola y en verde/rojo. 0 €: solo lee ficheros del repo, sin red.
//
//   node scripts/comprobar-pais.cjs np          (código del país, como en worker/kv/output-nivel2/np.json)
//   node scripts/comprobar-pais.cjs nepal       (o su nombre/slug)
//
// ✅ hecho · ⚠ falta pero no impide publicar (se decide en la revisión) · ❌ falta algo del paquete. Sale con código 1 si hay ❌.
// No cambia nada. Lo que no puede mirar desde el repo (Metricool, Search Console, Explorar en vivo) lo lista al final para hacerlo a mano.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const leer = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch (_) { return null; } };
const json = (p) => { const t = leer(p); return t ? JSON.parse(t) : null; };
const existe = (p) => fs.existsSync(path.join(ROOT, p));
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const arg = (process.argv[2] || '').toLowerCase();
if (!arg) { console.error('Uso: node scripts/comprobar-pais.cjs <código o nombre del país>   (p. ej. np o nepal)'); process.exit(2); }
const countries = json('worker/kv/countries.json') || [];
const pais = countries.find((c) => c.code === arg) || countries.find((c) => slugify(c.name) === slugify(arg));
if (!pais) { console.error(`❌ No encuentro el país «${arg}» en worker/kv/countries.json`); process.exit(2); }
const cc = pais.code, nombre = pais.name, ps = slugify(nombre);

const filas = [];
const ok = (t) => filas.push(['✅', t]), av = (t) => filas.push(['⚠', t]), mal = (t) => filas.push(['❌', t]);
const lista = (xs, n = 6) => xs.slice(0, n).join(', ') + (xs.length > n ? ` y ${xs.length - n} más` : '');
const seccion = (t) => filas.push(['', `\n── ${t}`]);

// ── 1 · Base ──
seccion('Base');
existe(`docs/paises/${ps}.md`) ? ok(`Plan del país: docs/paises/${ps}.md`) : mal(`Falta el plan del país docs/paises/${ps}.md (desde PLANTILLA-pais.md)`);
existe(`docs/paises/${ps}-expediente.md`) ? ok(`Expediente: docs/paises/${ps}-expediente.md`) : mal(`Falta el expediente docs/paises/${ps}-expediente.md (desde PLANTILLA-expediente.md)`);
const exp = leer(`docs/paises/${ps}-expediente.md`) || '';
if (exp) { const dudas = (exp.match(/⚠/g) || []).length; dudas ? av(`El expediente tiene ${dudas} datos marcados ⚠ (no van a la voz; revisar en la ⏸2)`) : ok('Expediente sin datos ⚠ pendientes'); }

// ── 2 · Páginas del país y de sus sitios ──
seccion('Páginas');
const kv = json(`worker/kv/output-nivel2/${cc}.json`);
const nuevos = (json(`scripts/paises/${ps}/sitios-nuevos.json`) || {}).sitios || [];
const sitios = (kv ? kv.destinos || [] : []).concat(nuevos).filter((d) => d.id && d.nombre);
if (!kv) mal(`Sin datos del país en worker/kv/output-nivel2/${cc}.json`);
const pPais = `destinos/${ps}.html`, htmlPais = leer(pPais) || '';
htmlPais ? ok(`Página del país: ${pPais}`) : mal(`Falta la página del país ${pPais} (node scripts/build-destinos.js --country ${cc})`);
existe(`scripts/paises/${ps}/intro.json`) ? (htmlPais.includes('class="dc"') || htmlPais.includes('dc-hilo') ? ok('«Conoce ' + nombre + '» en la página del país') : mal(`intro.json existe pero «Conoce ${nombre}» no sale en ${pPais}: regenerar`)) : mal(`Falta «Conoce ${nombre}»: scripts/paises/${ps}/intro.json (resumen del expediente)`);
const slugSitio = (d) => `${d.id}-${ps}`;
const sinPag = sitios.filter((d) => !existe(`destinos/${slugSitio(d)}.html`)).map(slugSitio);
sitios.length ? (sinPag.length ? mal(`${sinPag.length} de ${sitios.length} sitios sin página: ${lista(sinPag)}`) : ok(`${sitios.length} páginas de sitios`)) : mal('El país no tiene sitios');
const sinFotos = sitios.filter((d) => !existe(`destinos/img/${slugSitio(d)}/fotos.json`)).map(slugSitio);
sinFotos.length ? av(`${sinFotos.length} sitios sin fotos revisadas (destinos/img/<sitio>/): ${lista(sinFotos)}`) : sitios.length && ok('Todos los sitios con fotos');
const extra = json(`scripts/paises/${ps}/sitios-extra.json`) || {};
const sinSobre = sitios.filter((d) => !extra[slugSitio(d)]).map(slugSitio);
sinSobre.length ? av(`${sinSobre.length} sitios sin bloque «Sobre…» (scripts/paises/${ps}/sitios-extra.json): ${lista(sinSobre)}`) : sitios.length && ok('Todos los sitios con «Sobre…»');

// ── 3 · Fichas con fuentes (las hace 📱 App; aquí solo se miran) ──
seccion('Fichas con fuentes (📱 App)');
const fichas = {};
for (const d of ['worker/kv/fichas/auto', 'worker/kv/fichas']) {
  const dir = path.join(ROOT, d);
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (/^[a-z]{2}_.+\.json$/.test(f)) { const j = json(`${d}/${f}`); if (j && j.ref && j.revisada) fichas[j.ref] = j; }
}
const sinFicha = sitios.filter((d) => !fichas[`${cc}:${d.id}`]).map((d) => d.id);
const conFicha = sitios.length - sinFicha.length;
if (!conFicha) mal(`Ningún sitio con ficha revisada (node scripts/fichas/generar.mjs ${cc}, lo hace 📱 App)`);
else if (sinFicha.length) av(`${conFicha} de ${sitios.length} sitios con ficha; sin ficha: ${lista(sinFicha)}`);
else ok(`Los ${sitios.length} sitios con ficha revisada`);
const fichaSinPintar = sitios.filter((d) => fichas[`${cc}:${d.id}`] && !(leer(`destinos/${slugSitio(d)}.html`) || '').includes('df-rev')).map(slugSitio);
if (fichaSinPintar.length) mal(`Hay ficha pero la página no la enseña (regenerar --country ${cc}): ${lista(fichaSinPintar)}`);

// ── 4 · Guías de la app ──
seccion('Guías');
const guias = (json('guias-por-pais.json') || {})[ps] || [];
if (!guias.length) mal(`Ninguna guía pública del país en guias-por-pais.json (las escribe scripts/build-guias.js)`);
else {
  const sinPagG = guias.filter((g) => !existe(`${g.slug}.html`)).map((g) => g.slug);
  sinPagG.length ? mal(`${sinPagG.length} guías sin su página pública: ${lista(sinPagG)}`) : ok(`${guias.length} ${guias.length === 1 ? 'guía' : 'guías'}: ${lista(guias.map((g) => g.nombre), 4)}`);
  const noEnPais = guias.filter((g) => !htmlPais.includes(g.slug)).map((g) => g.slug);
  if (htmlPais && noEnPais.length) mal(`Guías que no salen en la página del país: ${lista(noEnPais)}`);
}

// ── 5 · Historias del blog y vídeos ──
seccion('Historias y vídeos');
const { historias } = require('./datos-pais.cjs');
const hs = historias().filter((h) => h.pais === nombre || (h.destino && String(h.destino[0]).endsWith('-' + ps)) || (h.destino && h.destino[0] === ps));
const pub = hs.filter((h) => !h.borrador), borr = hs.filter((h) => h.borrador);
if (!pub.length) mal('Ninguna historia publicada en el blog');
else {
  const sinPag = pub.filter((h) => !existe(`blog/viajes/${h.slug}.html`)).map((h) => h.slug);
  sinPag.length ? mal(`Historias sin página (node scripts/build-blog-viajes.js): ${lista(sinPag)}`) : ok(`${pub.length} ${pub.length === 1 ? 'historia publicada' : 'historias publicadas'}`);
  const noEnlazadas = pub.filter((h) => htmlPais && !htmlPais.includes(`/blog/viajes/${h.slug}`)).map((h) => h.slug);
  noEnlazadas.length ? av(`Historias que no enlaza la página del país: ${lista(noEnlazadas)}`) : ok('Todas enlazadas desde la página del país');
}
if (borr.length) av(`En borrador (no se publican): ${lista(borr.map((h) => h.slug))}`);
const apertura = hs.find((h) => h.serie === 'Conoce cada país');
if (!apertura) mal('Falta la historia de introducción del país (serie «Conoce cada país»)');
else if (!apertura.video) mal(`La introducción ${apertura.slug} no tiene vídeo todavía`);
else ok(`Introducción con vídeo: ${apertura.slug}${apertura.borrador ? ' (en borrador)' : ''}`);
const sinVideo = pub.filter((h) => h.video && !existe(`blog/viajes/video/${h.slug}.mp4`)).map((h) => h.slug + ".mp4");
if (sinVideo.length) mal(`Vídeos que faltan en blog/viajes/video/: ${lista(sinVideo)}`);
const conVideo = pub.filter((h) => h.video);
if (conVideo.length) {
  const sinYT = conVideo.filter((h) => !h.youtube).map((h) => h.slug);
  sinYT.length ? av(`${sinYT.length} vídeos sin reproductor de YouTube (se pone el día del estreno): ${lista(sinYT)}`) : ok('Todos los vídeos con su YouTube');
  const sinStory = conVideo.filter((h) => h.story && !existe(`stories/${h.slug}/index.html`)).map((h) => h.slug);
  if (sinStory.length) mal(`Web Stories sin generar (node scripts/build-stories.js): ${lista(sinStory)}`);
}

// ── 6 · Google ──
seccion('Google');
const idx = new Set((json('scripts/destinos-indexables.json') || {}).slugs || []);
const sm = leer('sitemap-destinos.xml') || '';
const quiere = [ps].concat(sitios.map(slugSitio));
const noIdx = quiere.filter((s) => !idx.has(s));
noIdx.length === quiere.length ? av(`El país aún no está en la tanda de Google (scripts/destinos-indexables.json; la reparte 📈 Estrategia)`)
  : noIdx.length ? av(`${noIdx.length} páginas fuera de la tanda: ${lista(noIdx)}`) : ok(`País y ${sitios.length} sitios en la tanda de Google`);
const noSm = quiere.filter((s) => idx.has(s) && !sm.includes(`/destinos/${s}.html`));
if (noSm.length) mal(`En la tanda pero no en sitemap-destinos.xml (regenerar destinos): ${lista(noSm)}`);
const noindex = quiere.filter((s) => idx.has(s) && /<meta name="robots" content="noindex/.test(leer(`destinos/${s}.html`) || '')).filter(Boolean);
if (noindex.length) mal(`En la tanda pero la página sigue con noindex (regenerar): ${lista(noindex)}`);

// ── 7 · MEJORAS ──
seccion('Lo aprendido');
(leer('docs/paises/MEJORAS.md') || '').includes(`| ${nombre}`) ? ok('Tiene líneas en docs/paises/MEJORAS.md') : av(`Sin ninguna línea en docs/paises/MEJORAS.md (apuntar lo que costó o falló)`);

// ── Informe ──
console.log(`\n🌍 Comprobar país: ${nombre} (${cc})`);
for (const [s, t] of filas) console.log(s ? `  ${s} ${t}` : t);
const n = (s) => filas.filter((f) => f[0] === s).length;
console.log(`\n  A mano (no se ve desde el repo): Explorar en vivo (/explorar), Search Console pedido, Metricool programado, publicaciones-registro.md, 2-3 planes probados con la cuenta de pruebas.`);
console.log(`\n${n('❌') ? '❌' : '✅'} ${n('✅')} bien · ${n('⚠')} avisos · ${n('❌')} faltan\n`);
process.exitCode = n('❌') ? 1 : 0;
