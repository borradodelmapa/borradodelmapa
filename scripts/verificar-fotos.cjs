#!/usr/bin/env node
// VERIFICAR FOTOS DE DESTINOS CONTRA WIKIMEDIA (18 nov 2026, Paco: «estoy viendo fotos de mierda, este tipo de fotos joden la web»:
// una bici de Cracovia como «Trekking por el fondo» del Colca). 0 €: API pública de Wikimedia Commons, sin clave.
//
// REGLA: una foto de destinos/img/<sitio>/ SOLO vale si Wikimedia demuestra que es de allí:
//   · «geo»: el archivo tiene coordenadas a menos de MAX_KM del sitio (coordenadas del sitio en el KV), o
//   · «categoria»: el archivo está en una categoría de Commons que nombra el sitio (palabra propia del sitio, no genérica).
// Nunca solo por palabras del título. Sin prueba → la foto se quita (mejor sin foto). La prueba se guarda en fotos.json
// ("prueba": {"tipo":"geo","km":3.2} o {"tipo":"categoria","cat":"Colca Canyon"}) y comprobar-nada-atras exige que esté.
//
//   node scripts/verificar-fotos.cjs <sitio> [<sitio>…]        solo informa
//   node scripts/verificar-fotos.cjs --pais pe [--pais it…]     todos los sitios de esos países
//   … --aplicar                                               guarda la prueba y QUITA las fotos sin prueba
// Después: revisar a ojo las que quedan (una foto del sitio puede ser mala igual) y regenerar el país.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const UA = 'BorradoDelMapaBot/1.0 (https://borradodelmapa.com)';
const MAX_KM = 15;
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugify = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Palabras que no identifican un sitio (no valen para dar por buena una categoría)
const GEN = new Set(['region', 'parque', 'nacional', 'national', 'park', 'isla', 'island', 'islands', 'islas', 'ciudad', 'city', 'district', 'costa', 'coast', 'capital', 'valle', 'valley', 'lago', 'lake', 'monte', 'mount', 'playa', 'beach', 'beaches', 'playas', 'canon', 'canyon', 'rio', 'river', 'bahia', 'bay', 'desierto', 'desert', 'reserva', 'reserve', 'sierra', 'centro', 'norte', 'north', 'south', 'east', 'west', 'old', 'town', 'casco', 'antiguo', 'viejo', 'nueva', 'nuevo', 'santa', 'santo', 'saint', 'san', 'grande', 'gran', 'great', 'little', 'trekking', 'montana', 'mountains', 'mountain', 'islands', 'gorges', 'falls', 'cataratas', 'castle', 'castillo', 'fort', 'fuerte', 'palace', 'palacio', 'church', 'iglesia', 'temple', 'templo', 'museum', 'museo', 'market', 'mercado', 'square', 'plaza', 'peninsula', 'circuit', 'route', 'ruta', 'road', 'festival', 'riviera', 'district', 'capital', 'sur', 'del', 'las', 'los', 'the']);
// Palabras corrientes de los pies de foto que no nombran ningún sitio
const GEN2 = new Set(['paisaje', 'cerca', 'desde', 'donde', 'hace', 'entre', 'sobre', 'para', 'nocturno', 'nocturna', 'crucero', 'cascada', 'carretera', 'barranquismo', 'vista', 'vistas', 'atardecer', 'amanecer', 'paseo', 'antiguo', 'antigua', 'tradicional', 'calle', 'barrio', 'puerto', 'mercado', 'templo', 'iglesia', 'catedral', 'playa', 'isla', 'terrazas', 'arroz', 'montanas', 'tatuando', 'sobrina', 'nieta', 'aprendiz', 'como', 'esta', 'este', 'todo', 'gente', 'mujeres', 'hombres', 'ninos', 'casa', 'casas', 'jardin', 'jardines', 'ruinas', 'torre', 'puente', 'lago', 'parque', 'noche', 'foto']);
const pal = (t) => norm(t).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !GEN.has(w) && !GEN2.has(w));
const PAISES =JSON.parse(fs.readFileSync(path.join(ROOT, 'worker', 'kv', 'countries.json'), 'utf8'));
const { sitiosNuevos } = require('./datos-pais.cjs');

async function api(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?format=json&' + new URLSearchParams(params).toString();
  // Wikimedia frena si se le pide mucho seguido (429): se espera lo que pida y se reintenta, hasta ~3 minutos
  for (let i = 0; i < 9; i++) {
    let espera = 3000 * (i + 1);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (r.ok) { const j = await r.json(); if (!j.error) return j; }
      const ra = +r.headers.get('retry-after'); if (ra) espera = Math.max(espera, ra * 1000);
    } catch (_) {}
    await sleep(espera);
  }
  throw new Error('No responde Wikimedia Commons');
}
const km = (a, b, c, d) => { const R = 6371, t = Math.PI / 180, x = Math.sin((c - a) * t / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin((d - b) * t / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };

function sitio(slug) {
  const p = PAISES.find((c) => slug.endsWith('-' + slugify(c.name)));
  if (!p) return null;
  const id = slug.slice(0, -slugify(p.name).length - 1);
  const f = path.join(ROOT, 'worker', 'kv', 'output-nivel2', p.code + '.json');
  const kv = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).destinos || [] : [];
  const d = kv.concat(sitiosNuevos()[p.code] || []).find((x) => x.id === id);
  if (!d) return null;
  const claves = [...new Set([...pal(d.nombre), ...pal(id), ...(d.keywords || []).slice(0, 4).flatMap(pal)])];
  return { cc: p.code, nombre: d.nombre, lat: d.lat, lng: d.lng, claves };
}

// Coordenadas y categorías de hasta 50 archivos por llamada
async function datosArchivos(titulos) {
  const out = {};
  for (let i = 0; i < titulos.length; i += 40) {
    const lote = titulos.slice(i, i + 40);
    let cont = {};
    do {
      const j = await api({ action: 'query', titles: lote.map((t) => 'File:' + t).join('|'), prop: 'coordinates|categories', coprop: 'type', colimit: 'max', cllimit: 'max', clshow: '!hidden', ...cont });
      const norma = {}; for (const n of (j.query && j.query.normalized) || []) norma[n.to] = n.from;
      for (const p of Object.values((j.query && j.query.pages) || {})) {
        const t = (norma[p.title] || p.title).replace(/^File:/, '');
        const o = out[t] || (out[t] = { coords: [], cats: [] });
        for (const c of p.coordinates || []) o.coords.push([c.lat, c.lon]);
        for (const c of p.categories || []) o.cats.push(c.title.replace(/^Category:/, ''));
      }
      cont = j.continue || {};
    } while (cont.clcontinue || cont.cocontinue);
    await sleep(800);
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const aplicar = args.includes('--aplicar');
  let slugs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--pais');
  const paises = args.filter((a, i) => args[i - 1] === '--pais');
  for (const cc of paises) {
    const p = PAISES.find((c) => c.code === cc); if (!p) continue;
    const kv = JSON.parse(fs.readFileSync(path.join(ROOT, 'worker', 'kv', 'output-nivel2', cc + '.json'), 'utf8')).destinos || [];
    slugs = slugs.concat(kv.concat(sitiosNuevos()[cc] || []).map((d) => `${d.id}-${slugify(p.name)}`));
  }
  let bien = 0, mal = 0; const quitadas = [];
  for (const slug of [...new Set(slugs)]) {
    const fj = path.join(ROOT, 'destinos', 'img', slug, 'fotos.json');
    if (!fs.existsSync(fj)) continue;
    const s = sitio(slug); if (!s) { console.log(`  ? ${slug}: no encuentro el sitio`); continue; }
    const raw = fs.readFileSync(fj, 'utf8'); const j = JSON.parse(raw);
    const huecos = [];
    if (j.hero) huecos.push(['hero', j.hero]);
    for (const [k, v] of Object.entries(j.que_hacer || {})) huecos.push(['q' + k, v]);
    for (const [k, v] of Object.entries(j.stops || {})) huecos.push(['s' + k, v]);
    const titulo = (v) => decodeURIComponent(String(v.url || '').split('File:')[1] || '').replace(/_/g, ' ');
    const info = await datosArchivos(huecos.map(([, v]) => titulo(v)).filter(Boolean));
    for (const [h, v] of huecos) {
      const d = info[titulo(v)] || { coords: [], cats: [] };
      // La categoría también vale si nombra lo que enseña la foto: la parada de la ruta o lo que dice su pie (nunca el título del archivo)
      // Foto propia del viaje de Paco (no está en Wikimedia): vale por ser suya
      const propia = v.autor === 'Borrado del Mapa' && !/commons\.wikimedia\.org/.test(v.url || '');
      const prueba = propia ? { tipo: 'propia' } : probar(s, d, [...pal(v.alt), ...(h[0] === 's' ? pal(h.slice(1)) : [])]);
      if (prueba) { bien++; v.prueba = prueba; }
      else { mal++; quitadas.push([slug, h, titulo(v).slice(0, 60), v.alt]); }
    }
    if (aplicar) {
      for (const [, h] of quitadas.filter((q) => q[0] === slug).map((q) => [q[0], q[1]])) {
        const dato = h === 'hero' ? j.hero : h[0] === 'q' ? j.que_hacer[h.slice(1)] : j.stops[h.slice(1)];
        const f = path.join(ROOT, 'destinos', 'img', slug, dato.file); if (fs.existsSync(f)) fs.unlinkSync(f);
        if (h === 'hero') delete j.hero; else if (h[0] === 'q') delete j.que_hacer[h.slice(1)]; else delete j.stops[h.slice(1)];
      }
      if (j.que_hacer && !Object.keys(j.que_hacer).length) delete j.que_hacer;
      const t = JSON.stringify(j, null, 1) + '\n';
      fs.writeFileSync(fj, raw.includes('\r\n') ? t.replace(/\n/g, '\r\n') : t);
    }
  }
  for (const q of quitadas) console.log(`  ✗ ${q[0]} ${q[1]}: ${q[2]}  («${q[3]}»)`);
  console.log(`\n${aplicar ? 'Aplicado' : 'Sin aplicar'}: ${bien} fotos con prueba · ${mal} sin prueba${aplicar ? ' (quitadas)' : ''}`);
}
// La prueba de UNA foto (la usa fotos-sitio.cjs al poner fotos): {tipo:'geo',km} | {tipo:'categoria',cat} | null
function probar(s, d, extra = []) {
  let prueba = null; const claves = [...(s.claves || []), ...extra];
  if (s.lat != null && s.lng != null) for (const [a, b] of d.coords) { const dist = km(s.lat, s.lng, a, b); if (dist <= MAX_KM && (!prueba || dist < prueba.km)) prueba = { tipo: 'geo', km: Math.round(dist * 10) / 10 }; }
  if (!prueba) { const cat = d.cats.find((c) => claves.some((w) => norm(c).includes(w))); if (cat) prueba = { tipo: 'categoria', cat }; }
  return prueba;
}
module.exports = { datosArchivos, sitio, probar, MAX_KM };
if (require.main === module) main().catch((e) => { console.error('❌ ' + e.message); process.exitCode = 1; });
