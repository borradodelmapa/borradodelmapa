#!/usr/bin/env node
// FOTOS DE UN SITIO, A OJO (16 nov 2026; MEJORAS del 5 nov: en Filipinas se hicieron a mano «candidatas por actividad,
// hoja de contactos y portada a mano»). Protocolo «Sitio» de docs/sistemas/web.md, pasos 1-2. 0 €: solo Wikimedia Commons, sin clave.
// Complementa scripts/fotos-destinos.cjs (que elige la portada solo); este es para revisar y elegir a ojo (F9: mejor sin foto
// que con una de otro sitio con el mismo nombre).
//
//   node scripts/fotos-sitio.cjs candidatas <sitio> [--n 8]
//        Busca en Commons candidatas para la portada y para cada actividad de «Qué hacer» y hace una HOJA DE CONTACTOS por hueco
//        (imágenes numeradas). Las hojas y candidatas.json van a una carpeta temporal (fuera del repo); la ruta sale al final.
//   node scripts/fotos-sitio.cjs poner <sitio> <hero|q0|q1…> <nº de la hoja | File:Nombre.jpg> "texto alternativo" ["pie de foto"]
//        Baja esa foto con licencia libre, la guarda en destinos/img/<sitio>/ y la apunta en fotos.json con autor y licencia
//        (ok_manual: revisada a ojo). q0 = la primera actividad de «Qué hacer».
//   node scripts/fotos-sitio.cjs quitar <sitio> <hero|qN>
//        Quita una foto equivocada (la tarjeta se queda sin foto).
//   node scripts/fotos-sitio.cjs auto <sitio> [<sitio>…]
//        Pone sola la primera candidata en cada actividad sin foto. REVISAR después a ojo y quitar las malas.
// Después: node scripts/build-destinos.js --country <cc> --only <sitio>, y mirarlo en local.
// <sitio> = slug de la página: banaue-filipinas, kathmandu-nepal…
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const UA = 'BorradoDelMapaBot/1.0 (https://borradodelmapa.com)';
const LICENCIAS_OK = /^(cc[- ]by(-sa)?[- ]|cc0|public domain|pd|attribution|gfdl)/i;
const MALAS = /\b(map|mapa|logo|flag|bandera|plan|diagram|stamp|coat|escudo|poster|icon|screenshot|banknote|coin)\b/i;
const FFMPEG = [ROOT, path.resolve(ROOT, '..', '..', '..')].map((b) => path.join(b, 'salma marketing', 'india', 'herramientas', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe')).find((f) => fs.existsSync(f)) || 'ffmpeg';
const FUENTE = ['C:/Windows/Fonts/arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf'].find((f) => fs.existsSync(f));
const TMP = path.join(os.tmpdir(), 'borrado-fotos');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const strip = (h) => String(h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
const STOP = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'a', 'al', 'con', 'por', 'para', 'un', 'una', 'sus', 'su', 'desde', 'hasta', 'entre', 'sobre', 'muy', 'mas', 'que', 'o']);

async function api(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?format=json&' + new URLSearchParams(params).toString();
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return r.json();
    await sleep(1500 * (i + 1));
  }
  throw new Error('No responde Wikimedia Commons');
}

// Tamaño, miniatura, licencia y autor de varios archivos de Commons (solo JPG/PNG con licencia libre, sin NC)
async function info(titles, width) {
  const out = [];
  for (let i = 0; i < titles.length; i += 25) {
    const j = await api({ action: 'query', titles: titles.slice(i, i + 25).map((t) => 'File:' + t.replace(/^File:/, '')).join('|'), prop: 'imageinfo', iiprop: 'url|size|extmetadata|mime', iiurlwidth: String(width) });
    for (const p of Object.values((j.query && j.query.pages) || {})) {
      const ii = p.imageinfo && p.imageinfo[0];
      if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime || '')) continue;
      const m = ii.extmetadata || {};
      const lic = strip(m.LicenseShortName && m.LicenseShortName.value);
      if (!LICENCIAS_OK.test(lic)) continue;
      out.push({ title: p.title.replace(/^File:/, ''), w: ii.width, h: ii.height, thumb: ii.thumburl, tw: ii.thumbwidth, th: ii.thumbheight,
        url: ii.descriptionurl, autor: strip(m.Artist && m.Artist.value).slice(0, 80) || 'Wikimedia Commons', licencia: lic, desc: strip(m.ImageDescription && m.ImageDescription.value).slice(0, 140) });
    }
  }
  return out;
}

async function buscar(q, n) {
  const j = await api({ action: 'query', list: 'search', srsearch: q + ' filetype:bitmap', srnamespace: '6', srlimit: String(n * 3) });
  return ((j.query && j.query.search) || []).map((s) => s.title.replace(/^File:/, '')).filter((t) => !MALAS.test(t));
}
async function cercanas(lat, lng) {
  const j = await api({ action: 'query', list: 'geosearch', gscoord: lat + '|' + lng, gsradius: '3000', gslimit: '40', gsnamespace: '6' });
  return ((j.query && j.query.geosearch) || []).map((g) => g.title.replace(/^File:/, '')).filter((t) => !MALAS.test(t));
}

// «Pasear por Durbar Square de Kathmandú (entrada ~2 EUR)» → «Durbar Square Kathmandu»
function consulta(actividad) {
  const t = norm(String(actividad).split(/:\s/)[0].replace(/\([^)]*\)/g, ' ')).split(/[^a-z0-9]+/).filter(Boolean);
  if (t.length > 1 && /(ar|er|ir)$/.test(t[0])) t.shift();               // el verbo del principio («pasear», «subir»…)
  return t.filter((w) => !STOP.has(w) && !/^\d+$/.test(w)).join(' ');
}

function datosSitio(slug) {
  const countries = JSON.parse(fs.readFileSync(path.join(ROOT, 'worker', 'kv', 'countries.json'), 'utf8'));
  const slugify = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  for (const c of countries) {
    const ps = slugify(c.name);
    if (!slug.endsWith('-' + ps)) continue;
    const id = slug.slice(0, -ps.length - 1);
    const f = path.join(ROOT, 'worker', 'kv', 'output-nivel2', c.code + '.json');
    const kv = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).destinos || [] : [];
    const nuevos = require('./datos-pais.cjs').sitiosNuevos()[c.code] || [];
    const d = kv.concat(nuevos).find((x) => x.id === id);
    if (!d) continue;
    const extra = require('./datos-pais.cjs').extraSitios()[slug] || {};
    const coords = JSON.parse(fs.readFileSync(path.join(ROOT, 'worker', 'kv', 'destinos-coords.json'), 'utf8'))[`${c.code}:${id}`];
    return { cc: c.code, pais: c.name, id, nombre: d.nombre, queHacer: extra.que_hacer || d.que_hacer || [], coords };
  }
  throw new Error(`No encuentro el sitio «${slug}» (slug de destinos/<sitio>.html, p. ej. banaue-filipinas)`);
}

const bajar = async (u, f) => { const r = await fetch(u, { headers: { 'User-Agent': UA } }); if (!r.ok) throw new Error('No se pudo bajar ' + u); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); };
// Escribe fotos.json respetando sus finales de línea (hay ficheros en CRLF y en LF)
const escribirJson = (f, j) => { const crlf = fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('\r\n'); const t = JSON.stringify(j, null, 1) + '\n'; fs.writeFileSync(f, crlf ? t.replace(/\n/g, '\r\n') : t); };
const ff = (args) => execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

async function hoja(dir, hueco, cands) {
  const d = path.join(dir, hueco); fs.mkdirSync(d, { recursive: true });
  const esc = (s) => s.replace(/\\/g, '/').replace(/:/g, '\\:');
  let k = 0;
  for (const c of cands) {
    k++;
    const raw = path.join(d, `raw${k}`), out = path.join(d, String(k).padStart(2, '0') + '.jpg');
    try { await bajar(c.thumb, raw); } catch (_) { continue; }
    const txt = FUENTE ? `,drawtext=fontfile='${esc(FUENTE)}':text='${k}':x=10:y=10:fontsize=34:fontcolor=white:box=1:boxcolor=0xF4630B:boxborderw=8` : '';
    ff(['-i', raw, '-vf', `scale=400:300:force_original_aspect_ratio=decrease,pad=400:300:(ow-iw)/2:(oh-ih)/2:0x111111${txt}`, '-frames:v', '1', out]);
    fs.unlinkSync(raw);
  }
  const cols = Math.min(4, k), filas = Math.ceil(k / 4);
  const sheet = path.join(dir, `hoja-${hueco}.jpg`);
  if (k) ff(['-framerate', '1', '-i', path.join(d, '%02d.jpg'), '-vf', `tile=${cols}x${filas}:padding=6:margin=6:color=0x111111`, '-frames:v', '1', sheet]);
  return k ? sheet : null;
}

// Fotos que nunca valen para un sitio aunque lo nombren (17 nov 2026: estadios, aeropuertos, barcos, cuadros, conciertos, mapas)
const VERIF = require('./verificar-fotos.cjs');
const NO_VALE = /\b(stadium|stadion|estadio|arena|airport|aeropuerto|aerodrome|ferry|ship|cruise|concert|painting|caravaggio|map|satellite|sentinel|landsat|logo|bombing|explosion|accident|protest|riot|war)\b/i;

async function candidatas(slug, n, hojas = true, soloPortada = false) {
  const s = datosSitio(slug);
  const dir = path.join(TMP, slug); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const lugar = norm(s.nombre).split(/[ ,(]/)[0];
  // Portada: el título tiene que nombrar el sitio (17 nov 2026: salían un ferry en Florencia y un Caravaggio en Odesa)
  const huecos = { hero: { busca: `${s.nombre} ${s.pais}`, otras: [s.nombre], ancho: 1280, claves: [lugar] } };
  // Palabras que no identifican un sitio (no valen para dar por buena una foto)
  const GEN = new Set(['paseo', 'mercado', 'templo', 'temple', 'playa', 'playas', 'fuerte', 'palacio', 'museo', 'local', 'locales', 'ciudad', 'atardecer', 'amanecer', 'gratis', 'bazar', 'bazaar', 'vistas', 'recorrido', 'ceremonia', 'centro', 'parque', 'jardin', 'garden', 'sunset', 'sunrise', 'monasterio', 'ferrocarril', 'plantacion', 'tour', 'visita', 'barrio', 'calle', 'lago', 'colina', 'puerta', 'nocturno', 'mercados', 'templos', 'artesania', 'compras']);
  if (!soloPortada) s.queHacer.forEach((a, i) => {
    const q = consulta(a), pal = q.split(' ');
    // De más concreta a más general, SIEMPRE con el sitio (sin él, Commons trae fotos de otros países: Darjeeling, 16 nov 2026)
    const con = (x) => (x.includes(lugar) ? x : `${x} ${lugar}`);
    const lista = [con(q), con(pal.slice(0, 2).join(' ')), con(pal[0]), q].filter((x, k, arr) => x && arr.indexOf(x) === k);
    const claves = [lugar].concat(pal.filter((w) => w.length >= 5 && !GEN.has(w)));
    huecos['q' + i] = { busca: lista[0], otras: lista.slice(1), ancho: 720, actividad: a, claves };
  });
  const json = { sitio: slug, nombre: s.nombre, huecos: {} };
  const sv = VERIF.sitio(slug);
  if (!sv || sv.lat == null) console.log('  ⚠ El sitio no tiene coordenadas en el KV: solo valdrán fotos por categoría de Commons.');
  console.log(`\n📷 Candidatas para ${s.nombre} (${s.pais}) → ${dir}`);
  for (const [h, x] of Object.entries(huecos)) {
    let titles = await buscar(x.busca, n);
    for (const o of x.otras || []) { if (titles.length >= n * 2) break; titles = titles.concat(await buscar(o, n)); }
    if (h === 'hero' && s.coords) titles = titles.concat(await cercanas(s.coords.lat, s.coords.lng));
    titles = [...new Set(titles)];
    let cands = (await info(titles, 400)).filter((c) => (h === 'hero' ? c.w >= 1280 && c.w / c.h >= 1.2 : c.w >= 720));
    // Solo fotos cuyo título o descripción nombra el sitio o algo concreto de la actividad (F9: mejor sin foto)
    if (x.claves) cands = cands.filter((c) => { const t = norm(c.title + ' ' + c.desc); return x.claves.some((k) => t.includes(k)); });
    cands = cands.filter((c) => !NO_VALE.test(c.title + ' ' + c.desc));
    // REGLA (18 nov 2026, Paco: una bici de Cracovia salió como «Trekking» del Colca): solo vale una foto que Wikimedia SITÚA
    // en el sitio (coordenadas a menos de 15 km o categoría del sitio). Las palabras del título no prueban nada.
    const datosW = await VERIF.datosArchivos(cands.map((c) => c.title));
    cands = cands.filter((c) => (c.prueba = VERIF.probar(sv, datosW[c.title] || { coords: [], cats: [] })));
    cands = titles.map((t) => cands.find((c) => c.title === t)).filter(Boolean).slice(0, n);
    const sheet = hojas ? await hoja(dir, h, cands) : '(sin hoja)';
    json.huecos[h] = { busca: x.busca, actividad: x.actividad, candidatas: cands.map((c, i) => ({ n: i + 1, title: c.title, autor: c.autor, licencia: c.licencia, url: c.url, desc: c.desc })) };
    console.log(`  ${h.padEnd(4)} ${x.actividad ? `«${String(x.actividad).slice(0, 60)}»` : 'portada'} · búsqueda «${x.busca}» → ${cands.length ? `${cands.length} candidatas: ${sheet}` : 'ninguna (mejor sin foto)'}`);
    await sleep(300);
  }
  fs.writeFileSync(path.join(dir, 'candidatas.json'), JSON.stringify(json, null, 1));
  if (hojas) console.log(`\nMira cada hoja y elige por su número; ninguna buena = sin foto (F9). Luego:\n  node scripts/fotos-sitio.cjs poner ${slug} q0 3 "texto alternativo" "Pie de foto."\n`);
}

async function poner(slug, hueco, cual, alt, pie, sinRevisar = false) {
  if (!/^(hero|q\d+)$/.test(hueco || '')) throw new Error('El hueco es hero, q0, q1…');
  if (!cual || !alt) throw new Error('Falta el número (o File:…) y el texto alternativo');
  const s = datosSitio(slug);
  let title = cual;
  if (/^\d+$/.test(cual)) {
    const cj = path.join(TMP, slug, 'candidatas.json');
    if (!fs.existsSync(cj)) throw new Error(`Primero: node scripts/fotos-sitio.cjs candidatas ${slug}`);
    const c = ((JSON.parse(fs.readFileSync(cj, 'utf8')).huecos[hueco] || {}).candidatas || []).find((x) => x.n === +cual);
    if (!c) throw new Error(`No hay candidata ${cual} para ${hueco}`);
    title = c.title;
  }
  const ancho = hueco === 'hero' ? 1280 : 720;
  const [c] = await info([title.replace(/^File:/, '')], ancho);
  if (!c) throw new Error(`«${title}» no existe en Commons o su licencia no es libre (sin NC)`);
  const datosW = await VERIF.datosArchivos([c.title]);
  const prueba = VERIF.probar(VERIF.sitio(slug) || {}, datosW[c.title] || { coords: [], cats: [] });
  if (!prueba) throw new Error(`«${c.title}» no tiene prueba de ser de ${s.nombre}: ni coordenadas a menos de ${VERIF.MAX_KM} km ni categoría del sitio en Commons. Mejor sin foto.`);
  const dir = path.join(ROOT, 'destinos', 'img', slug); fs.mkdirSync(dir, { recursive: true });
  const file = hueco === 'hero' ? 'hero.jpg' : hueco + '.jpg';
  const raw = path.join(TMP, `poner-${Date.now()}`); fs.mkdirSync(TMP, { recursive: true });
  await bajar(c.thumb, raw);
  ff(['-i', raw, '-vf', `scale='min(${ancho},iw)':-2`, '-q:v', '3', '-frames:v', '1', path.join(dir, file)]);
  fs.unlinkSync(raw);
  const w = Math.min(ancho, c.w), h = Math.round(c.h * w / c.w / 2) * 2;
  const fj = path.join(dir, 'fotos.json');
  const j = fs.existsSync(fj) ? JSON.parse(fs.readFileSync(fj, 'utf8')) : { generado: new Date().toISOString().slice(0, 10), stops: {} };
  const dato = { file, w, h, alt, ...(hueco === 'hero' ? {} : { pie: pie || alt.replace(/\.?$/, '.') }), autor: c.autor, licencia: c.licencia, url: c.url, prueba,
    // «poner» a mano = la persona la ha visto; «auto» = pendiente de ver (comprobar-nada-atras no deja subirla así)
    ...(sinRevisar ? { pendiente_revision: true } : { ok_manual: true, vista: new Date().toISOString().slice(0, 10) }) };
  if (hueco === 'hero') j.hero = dato; else (j.que_hacer = j.que_hacer || {})[hueco.slice(1)] = dato;
  escribirJson(fj, j);
  console.log(`✅ ${slug} ${hueco} = ${c.title} (${c.autor} · ${c.licencia})${hueco === 'hero' ? '' : ` — «${String(s.queHacer[+hueco.slice(1)] || '').slice(0, 60)}»`}\n   Ahora: node scripts/build-destinos.js --country ${s.cc} --only ${slug}`);
}

// AUTO (17 nov 2026, Paco: «los 28 países de un tirón»): en cada actividad de «Qué hacer» SIN foto pone la primera candidata
// que nombra el sitio o la actividad. Después hay que REVISAR el resultado a ojo (hoja por país) y quitar las que no valgan.
async function auto(slug) {
  const fj = path.join(ROOT, 'destinos', 'img', slug, 'fotos.json');
  const ya = fs.existsSync(fj) ? (JSON.parse(fs.readFileSync(fj, 'utf8')).que_hacer || {}) : {};
  await candidatas(slug, 3, false);
  const j = JSON.parse(fs.readFileSync(path.join(TMP, slug, 'candidatas.json'), 'utf8'));
  for (const [h, x] of Object.entries(j.huecos)) {
    if (h === 'hero' || ya[h.slice(1)] || !x.candidatas.length) continue;
    const t = String(x.actividad).split(/:\s|\s\(/)[0].trim();
    try { await poner(slug, h, '1', t, t.replace(/\.?$/, '.'), true); } catch (e) { console.error(`  ❌ ${slug} ${h}: ${e.message}`); }
    await sleep(300);
  }
}

// PORTADA (17 nov 2026): pone sola la portada de un sitio que no la tiene, con el filtro estricto. REVISAR después a ojo.
async function portada(slug) {
  const s = datosSitio(slug);
  const fj = path.join(ROOT, 'destinos', 'img', slug, 'fotos.json');
  if (fs.existsSync(fj) && JSON.parse(fs.readFileSync(fj, 'utf8')).hero) return;
  await candidatas(slug, 3, false, true);
  const j = JSON.parse(fs.readFileSync(path.join(TMP, slug, 'candidatas.json'), 'utf8'));
  if (j.huecos.hero.candidatas.length) await poner(slug, 'hero', '1', s.nombre, undefined, true);
}

function quitar(slug, hueco) {
  const fj = path.join(ROOT, 'destinos', 'img', slug, 'fotos.json');
  if (!fs.existsSync(fj)) throw new Error('Ese sitio no tiene fotos.json');
  const j = JSON.parse(fs.readFileSync(fj, 'utf8'));
  const dato = hueco === 'hero' ? j.hero : (j.que_hacer || {})[String(hueco).slice(1)];
  if (!dato) throw new Error(`No hay foto en ${hueco}`);
  if (hueco === 'hero') delete j.hero; else delete j.que_hacer[hueco.slice(1)]; if (j.que_hacer && !Object.keys(j.que_hacer).length) delete j.que_hacer;
  const f = path.join(ROOT, 'destinos', 'img', slug, dato.file);
  if (fs.existsSync(f)) fs.unlinkSync(f);
  escribirJson(fj, j);
  console.log(`✅ Quitada ${hueco} de ${slug} (${dato.file}). Regenera el país para verlo.`);
}

(async () => {
  const [cmd, slug, ...r] = process.argv.slice(2);
  try {
    if (cmd === 'candidatas' && slug) { const i = r.indexOf('--n'); await candidatas(slug, i >= 0 ? +r[i + 1] || 8 : 8); }
    else if (cmd === 'poner' && slug) await poner(slug, r[0], r[1], r[2], r[3]);
    else if (cmd === 'quitar' && slug) quitar(slug, r[0]);
    else if (cmd === 'portada' && slug) { for (const x of [slug, ...r]) { try { await portada(x); } catch (e) { console.error('❌ ' + x + ': ' + e.message); } } }
    else if (cmd === 'auto' && slug) { for (const x of [slug, ...r]) { try { await auto(x); } catch (e) { console.error('❌ ' + x + ': ' + e.message); } } }
    else { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 20).map((l) => l.replace(/^\/\/ ?/, '')).join('\n')); process.exitCode = cmd ? 1 : 0; }
  } catch (e) { console.error('❌ ' + e.message); process.exitCode = 1; }
})();
