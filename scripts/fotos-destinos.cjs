#!/usr/bin/env node
// scripts/fotos-destinos.cjs — baja UNA vez las fotos de una página de destino desde Wikimedia Commons
// (gratis, con licencia libre y crédito del autor) y las guarda en destinos/img/<slug>/.
// 0 € de APIs de pago: solo Wikipedia/Wikimedia (sin clave). Las fotos se guardan en el repo, no se enlazan.
//
// Uso:  node scripts/fotos-destinos.cjs kathmandu-nepal [otro-slug ...]
//       node scripts/fotos-destinos.cjs --indexables        (todas las de scripts/destinos-indexables.json)
//       --rehacer                                           (vuelve a bajar aunque ya existan)
// Salida: destinos/img/<slug>/hero.jpg · s1.jpg, s2.jpg… · fotos.json (créditos, tamaños, alt). El generador
// (build-destinos.js) lee fotos.json; si una parada no tiene foto buena, se queda sin foto (nunca una equivocada).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KV_DIR = path.join(ROOT, 'worker', 'kv', 'output-nivel2');
const ROUTES_DIR = path.join(ROOT, 'worker', 'kv', 'routes-nivel3');
const COORDS = JSON.parse(fs.readFileSync(path.join(ROOT, 'worker', 'kv', 'destinos-coords.json'), 'utf8'));
const COUNTRIES = JSON.parse(fs.readFileSync(path.join(ROOT, 'worker', 'kv', 'countries.json'), 'utf8'));
const UA = 'BorradoDelMapaBot/1.0 (https://borradodelmapa.com)';
const HERO_W = 1280, STOP_W = 720;
const LICENCIAS_OK = /^(cc[- ]by(-sa)?[- ]|cc0|public domain|pd|attribution|gfdl)/i;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tokens = s => norm(s).split(/[^a-z0-9]+/).filter(t => t.length > 2 && !['the', 'del', 'las', 'los', 'de', 'la', 'el', 'and', 'por', 'con'].includes(t));
const strip = h => String(h || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, ' ').trim();

async function api(host, params) {
  const url = `https://${host}/w/api.php?format=json&` + new URLSearchParams(params).toString();
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.ok) return r.json();
    await sleep(1500 * (i + 1));
  }
  throw new Error('API ' + host);
}

// Datos de varios archivos de Commons (tamaño, miniatura al ancho pedido, licencia, autor)
async function info(files, width) {
  if (!files.length) return [];
  const j = await api('commons.wikimedia.org', {
    action: 'query', titles: files.map(f => 'File:' + f.replace(/^File:/, '')).join('|'), prop: 'imageinfo',
    iiprop: 'url|size|extmetadata|mime', iiurlwidth: String(width),
  });
  const out = [];
  for (const p of Object.values((j.query && j.query.pages) || {})) {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime || '')) continue;
    const m = ii.extmetadata || {};
    const lic = strip(m.LicenseShortName && m.LicenseShortName.value);
    if (!LICENCIAS_OK.test(lic)) continue;           // sin NC ni licencias raras
    out.push({
      title: p.title.replace(/^File:/, ''), w: ii.width, h: ii.height, thumb: ii.thumburl,
      thumbW: ii.thumbwidth, thumbH: ii.thumbheight, page: ii.descriptionurl,
      autor: strip(m.Artist && m.Artist.value).slice(0, 80) || 'Wikimedia Commons', licencia: lic,
      desc: strip(m.ImageDescription && m.ImageDescription.value).slice(0, 160),
    });
  }
  return out;
}

const MALAS = /\b(map|mapa|logo|flag|bandera|plan|diagram|stamp|coat|escudo|poster|icon|screenshot|banknote|moneda|coin|wikimedia|commons-logo)\b/i;
function puntuar(c, toks) {
  const ratio = c.w / c.h;
  if (MALAS.test(c.title) || ratio < 1.15 || ratio > 3.2 || c.w < 1400) return -1;
  const tn = norm(c.title + ' ' + c.desc);
  const hits = toks.filter(t => tn.includes(t)).length;
  return hits * 5 + Math.min(c.w / 2000, 2) + (ratio >= 1.4 && ratio <= 2 ? 1 : 0);
}

// Foto principal del artículo de Wikipedia (la que eligió la comunidad como representativa)
async function pageImage(lang, query, toks) {
  const j = await api(lang + '.wikipedia.org', { action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '4', prop: 'pageimages', piprop: 'name' });
  const pages = Object.values((j.query && j.query.pages) || {}).sort((a, b) => a.index - b.index);
  for (const p of pages) {
    if (!p.pageimage) continue;
    const tn = norm(p.title);
    if (toks.length && !toks.some(t => tn.includes(t))) continue;   // el artículo tiene que hablar de lo mismo
    return p.pageimage;
  }
  return null;
}

// Fotos de Commons hechas cerca de unas coordenadas
async function cercanas(lat, lng, radio) {
  const j = await api('commons.wikimedia.org', { action: 'query', list: 'geosearch', gscoord: lat + '|' + lng, gsradius: String(radio), gslimit: '40', gsnamespace: '6' });
  return ((j.query && j.query.geosearch) || []).map(g => g.title.replace(/^File:/, ''));
}

async function elegir({ queries, toks, lat, lng, radio, width, exigirNombre }) {
  const cand = [];
  for (const [lang, q] of queries) {
    try { const f = await pageImage(lang, q, toks); if (f) { const [c] = await info([f], width); if (c) cand.push({ c, bonus: 20 }); } } catch (_) {}
    await sleep(200);
  }
  if (lat != null) {
    try {
      const files = await cercanas(lat, lng, radio);
      for (let i = 0; i < files.length; i += 25) for (const c of await info(files.slice(i, i + 25), width)) cand.push({ c, bonus: 0 });
    } catch (_) {}
  }
  let best = null;
  for (const { c, bonus } of cand) {
    let s = puntuar(c, toks);
    if (s < 0) continue;
    if (bonus) s += bonus;                           // la foto del artículo tiene preferencia
    else if (exigirNombre && !toks.some(t => norm(c.title + ' ' + c.desc).includes(t))) continue;
    if (!best || s > best.s) best = { s, c };
  }
  return best && best.c;
}


// Guías públicas que no se llaman <destino>-ruta (p. ej. barcelona-en-3-dias-ky61): la app las busca en destinos/img/_guias.json
function registrarGuia(slug, route) {
  if (!route || !route._public_slug) return;
  const f = path.join(ROOT, 'destinos', 'img', '_guias.json');
  let m = {}; try { m = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (_) {}
  m[route._public_slug] = slug;
  fs.writeFileSync(f, JSON.stringify(m, null, 1));
}

async function bajar(c, destino) {
  const r = await fetch(c.thumb, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('descarga ' + r.status);
  fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
}

async function hacer(slug, rehacer) {
  const m = slug.match(/^(.*)-([a-z-]+)$/);
  const countrySlug = (() => { for (const c of COUNTRIES) { const s = norm(c.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); if (slug.endsWith('-' + s)) return s; } return m && m[2]; })();
  const country = COUNTRIES.find(c => norm(c.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === countrySlug);
  if (!country) throw new Error('país no encontrado para ' + slug);
  const destId = slug.slice(0, -(countrySlug.length + 1));
  const kv = JSON.parse(fs.readFileSync(path.join(KV_DIR, country.code + '.json'), 'utf8'));
  const dest = (kv.destinos || []).find(d => d.id === destId);
  if (!dest) throw new Error('destino no encontrado: ' + destId);
  const rf = path.join(ROUTES_DIR, `${destId}-${countrySlug}.json`);
  const route = fs.existsSync(rf) ? JSON.parse(fs.readFileSync(rf, 'utf8')) : null;
  const dir = path.join(ROOT, 'destinos', 'img', slug);
  const meta = path.join(dir, 'fotos.json');
  if (!rehacer && fs.existsSync(meta)) { console.log('  ya hecho:', slug); return; }
  fs.mkdirSync(dir, { recursive: true });

  const out = { generado: new Date().toISOString().slice(0, 10), hero: null, stops: {} };
  const co = COORDS[`${country.code}:${destId}`];
  const tdest = tokens(dest.nombre);
  const hero = await elegir({
    queries: [['es', `${dest.nombre} ${country.name}`], ['en', `${dest.nombre} ${country.name}`]],
    toks: tdest, lat: co && co.lat, lng: co && co.lng, radio: 5000, width: HERO_W, exigirNombre: false,
  });
  if (hero) {
    await bajar(hero, path.join(dir, 'hero.jpg'));
    out.hero = { file: 'hero.jpg', w: hero.thumbW, h: hero.thumbH, alt: `${dest.nombre}, ${country.name}`, autor: hero.autor, licencia: hero.licencia, url: hero.page };
    console.log('  hero OK  ', hero.title.slice(0, 70));
  } else console.log('  hero SIN FOTO');

  const stops = (route && route.stops) || [];
  let n = 0;
  for (const st of stops) {
    n++;
    const ts = tokens(st.name);
    if (!ts.length) continue;
    const f = await elegir({
      queries: [['es', `${st.name} ${dest.nombre}`], ['en', `${st.name} ${dest.nombre}`]],
      toks: ts, lat: st.lat, lng: st.lng, radio: 400, width: STOP_W, exigirNombre: true,
    });
    if (!f || (hero && f.title === (out.hero && hero.title))) { console.log('  parada', n, 'sin foto:', st.name); continue; }
    if (Object.values(out.stops).some(x => x.fuente === f.title)) { console.log('  parada', n, 'repetida, se omite:', st.name); continue; }
    await bajar(f, path.join(dir, `s${n}.jpg`));
    out.stops[st.name] = { file: `s${n}.jpg`, w: f.thumbW, h: f.thumbH, alt: `${st.name}, ${dest.nombre}`, autor: f.autor, licencia: f.licencia, url: f.page, fuente: f.title };
    console.log('  parada', n, 'OK  ', st.name, '←', f.title.slice(0, 50));
  }
  // Sin foto del destino (rutas de trekking por aldeas): la mejor foto de sus paradas hace de portada
  if (!out.hero) {
    for (const [nombre, s] of Object.entries(out.stops)) {
      const [c] = await info([s.fuente], HERO_W);
      if (!c || c.w < 2000) continue;
      await bajar(c, path.join(dir, 'hero.jpg'));
      out.hero = { file: 'hero.jpg', w: c.thumbW, h: c.thumbH, alt: `${dest.nombre}, ${country.name}: ${nombre}`, autor: c.autor, licencia: c.licencia, url: c.page };
      console.log('  hero (de la parada ' + nombre + ')');
      break;
    }
  }
  fs.writeFileSync(meta, JSON.stringify(out, null, 1));
  registrarGuia(slug, route);
  console.log(`  ${slug}: hero ${out.hero ? 'sí' : 'no'}, ${Object.keys(out.stops).length}/${stops.length} paradas con foto`);
}



// Paradas sin foto propia (aldeas de trekking…): una foto del paisaje de alrededor (hasta 4 km), sin exigir el nombre.
// Se dice en el alt («Paisaje cerca de X»). Nunca repite una foto de la página ni usa retratos.
const RETRATO = /(portrait|selfie|man|woman|girl|boy|child|children|people|persona|retrato|group|family)/i;
async function completarPagina(slug) {
  const dir = path.join(ROOT, 'destinos', 'img', slug);
  const meta = path.join(dir, 'fotos.json');
  const out = JSON.parse(fs.readFileSync(meta, 'utf8'));
  const m = slug.match(/^(.*)-([a-z-]+)$/);
  let country, destId;
  for (const c of COUNTRIES) { const cs = norm(c.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); if (slug.endsWith('-' + cs)) { country = c; destId = slug.slice(0, -(cs.length + 1)); } }
  const cs = norm(country.name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const route = JSON.parse(fs.readFileSync(path.join(ROUTES_DIR, destId + '-' + cs + '.json'), 'utf8'));
  const dest = (JSON.parse(fs.readFileSync(path.join(KV_DIR, country.code + '.json'), 'utf8')).destinos || []).find(d => d.id === destId);
  const usadas = new Set(Object.values(out.stops).map(x => x.fuente).concat(out.hero ? [out.hero.url] : []));
  const urlsUsadas = new Set(Object.values(out.stops).map(x => x.url).concat(out.hero ? [out.hero.url] : []));
  let n = 0, nuevas = 0;
  for (const st of route.stops) {
    n++;
    if (out.stops[st.name] || typeof st.lat !== 'number') continue;
    let best = null;
    try {
      const files = await cercanas(st.lat, st.lng, 4000);
      const cands = [];
      for (let i = 0; i < files.length; i += 25) for (const c of await info(files.slice(i, i + 25), STOP_W)) cands.push(c);
      for (const c of cands) {
        if (usadas.has(c.title) || urlsUsadas.has(c.page) || MALAS.test(c.title) || RETRATO.test(c.title + ' ' + c.desc)) continue;
        const ratio = c.w / c.h; if (ratio < 1.3 || ratio > 2.2 || c.w < 2000) continue;
        const sc = Math.min(c.w / 3000, 2) + (tokens(st.name).some(t => norm(c.title + c.desc).includes(t)) ? 3 : 0);
        if (!best || sc > best.sc) best = { sc, c };
      }
    } catch (_) {}
    await sleep(250);
    if (!best) { console.log('  parada', n, 'sin foto cercana:', st.name); continue; }
    const c = best.c;
    await bajar(c, path.join(dir, 's' + n + '.jpg'));
    usadas.add(c.title); urlsUsadas.add(c.page);
    out.stops[st.name] = { file: 's' + n + '.jpg', w: c.thumbW, h: c.thumbH, alt: 'Paisaje cerca de ' + st.name + ', ' + dest.nombre, autor: c.autor, licencia: c.licencia, url: c.page, fuente: c.title, cercana: true };
    nuevas++; console.log('  parada', n, 'paisaje cerca de', st.name, '←', c.title.slice(0, 50));
  }
  fs.writeFileSync(meta, JSON.stringify(out, null, 1));
  registrarGuia(slug, route);
  console.log('  ' + slug + ': +' + nuevas + ' → ' + Object.keys(out.stops).length + '/' + route.stops.length);
}

(async () => {
  const args = process.argv.slice(2);
  const rehacer = args.includes('--rehacer');
  const completar = args.includes('--completar');
  let slugs = args.filter(a => !a.startsWith('--'));
  if (args.includes('--indexables')) {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, 'destinos-indexables.json'), 'utf8'));
    slugs = j.slugs.filter(s => s !== 'index' && fs.existsSync(path.join(ROUTES_DIR, s + '.json')));
  }
  if (!slugs.length) { console.log('Uso: node scripts/fotos-destinos.cjs <slug> | --indexables [--rehacer]'); process.exit(1); }
  for (const s of slugs) { console.log('▶', s); try { await (completar ? completarPagina(s) : hacer(s, rehacer)); } catch (e) { console.log('  ❌', e.message); } }
})();
