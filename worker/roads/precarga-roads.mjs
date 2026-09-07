/**
 * precarga-roads.mjs — PASO 6 del motor de road-trips.
 *
 * Resuelve una lista curada de carreteras famosas y siembra el KV `ROAD_GEOM`.
 * Se ejecuta EN LOCAL con Node (desde aquí overpass-api.de responde bien; desde
 * un Worker de CF no). NO toca producción: solo escribe claves nuevas en KV.
 *
 * Uso:
 *   node worker/roads/precarga-roads.mjs                 # resuelve y escribe out/precarga-*.json
 *   node worker/roads/precarga-roads.mjs --kv            # además sube a KV con wrangler kv bulk
 *   node worker/roads/precarga-roads.mjs --only=n2-pt    # una sola (para reintentos)
 *
 * Camino fiable: `relationId` fijo. Para las que no lo tengo, `{query,country}`
 * descubre-y-fija; su relationId se imprime para pegarlo aquí y no volver a
 * depender de la búsqueda.
 */
import { resolveNamedRoad } from './road-resolver.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KV_PREFIX = 'road_geom:v1:';
const HERE = path.dirname(fileURLToPath(import.meta.url));   // worker/roads
const WORKER_DIR = path.join(HERE, '..');                   // worker
const OUT_DIR = path.join(HERE, 'out');

// slug = clave estable. cc = país. id = relation OSM. q = texto (solo si aún no hay id).
// Los id se fijaron tras el primer descubrimiento (paso 6, 7 sept 2026): reruns
// rápidos y sin depender de la búsqueda. Para reañadir una carretera: ponerla con
// `q` + `cc`, correr `--only=slug`, y pegar aquí el id que imprime.
const ROADS = [
  { slug: 'n2-pt',               cc: 'PT', id: 7362083,  label: 'Estrada Nacional 2 (Chaves–Faro)' },
  { slug: 'ruta40-ar',           cc: 'AR', id: 168012,   label: 'Ruta Nacional 40' },
  { slug: 'great-ocean-road-au', cc: 'AU', id: 6592912,  label: 'Great Ocean Road' },
  { slug: 'transfagarasan-ro',   cc: 'RO', id: 3432007,  label: 'Transfăgărășan (DN7C)' },
  { slug: 'amalfitana-it',       cc: 'IT', id: 4542085,  label: 'SS163 Amalfitana' },
  { slug: 'stelvio-ss38-it',     cc: 'IT', id: 9502582,  label: 'SS38 dello Stelvio' },
  { slug: 'ring-road-is',        cc: 'IS', id: 65617,    label: 'Ring Road / Þjóðvegur 1' },
  { slug: 'nc500-gb',            cc: 'GB', id: 5723406,  label: 'North Coast 500' },
  { slug: 'romantische-strasse-de', cc: 'DE', id: 56917, label: 'Romantische Straße' },
  { slug: 'grossglockner-at',    cc: 'AT', id: 4205967,  label: 'Großglockner Hochalpenstraße' },
  { slug: 'trollstigen-no',      cc: 'NO', id: 1693967,  label: 'Trollstigen' },
  { slug: 'atlanterhavsvegen-no',cc: 'NO', id: 1171818,  label: 'Atlantic Ocean Road' },
  { slug: 'transalpina-ro',      cc: 'RO', id: 1169079,  label: 'Transalpina (DN67C)' },
  { slug: 'route-grandes-alpes-fr', cc: 'FR', id: 15722245, label: 'Route des Grandes Alpes' },
  { slug: 'blue-ridge-parkway-us', cc: 'US', id: 55450,  label: 'Blue Ridge Parkway' },
  { slug: 'chapmans-peak-za',    cc: 'ZA', id: 16487221, label: "Chapman's Peak Drive" },
  { slug: 'causeway-coastal-gb', cc: 'GB', id: 4719145,  label: 'Causeway Coastal Route' },
  { slug: 'schwarzwaldhochstrasse-de', cc: 'DE', id: 27947, label: 'Schwarzwaldhochstraße (B500)' },

  // --- PENDIENTES (paso 6 no las resolvió — fijar id a mano desde openstreetmap.org) ---
  // wild-atlantic-way-ie : la búsqueda coge un tramo de 9.8km. La ruta real (~2500km) es
  //   un superroute; localizar su relation id y añadirla con `id:`.
  // carretera-austral-cl, pch-ca-us, garden-route-za, great-alpine-road-au,
  //   tail-of-the-dragon-us : overpass_error (timeout del mirror) — reintentar con --only=.
  // route66-us : desmantelada, no hay relation vigente con ese nombre.
  // sa-calobra-es (MA-2141), furkapass-ch, grande-corniche-fr (D2564),
  //   col-galibier-fr (D902) : no casan por nombre — necesitan id o búsqueda por ref.
  { slug: 'carretera-austral-cl', cc: 'CL', q: 'Carretera Austral', label: 'Carretera Austral (Ruta 7)' },
  { slug: 'pch-ca-us',           cc: 'US', q: 'California State Route 1', label: 'Pacific Coast Highway (SR 1)' },
  { slug: 'garden-route-za',     cc: 'ZA', q: 'Garden Route', label: 'Garden Route' },
  { slug: 'great-alpine-road-au',cc: 'AU', q: 'Great Alpine Road', label: 'Great Alpine Road' },
  { slug: 'tail-of-the-dragon-us', cc: 'US', q: 'U.S. Route 129', label: 'Tail of the Dragon (US 129)' },
];

const args = process.argv.slice(2);
const DO_KV = args.includes('--kv');
const UPLOAD_ONLY = args.includes('--upload-only'); // sube out/kv-*.json ya generados, sin re-resolver
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || null;
const list = ONLY ? ROADS.filter((r) => r.slug === ONLY) : ROADS;

fs.mkdirSync(OUT_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (UPLOAD_ONLY) {
  const bulk = [];
  for (const road of ROADS) {
    const f = path.join(OUT_DIR, `kv-${road.slug}.json`);
    if (!fs.existsSync(f)) { console.log(`- ${road.slug}: sin kv-*.json (no resuelta), se omite`); continue; }
    const body = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!body.ok || body.continuity === 'no_geometry' || !Array.isArray(body.geometry) || body.geometry.length < 2) {
      console.log(`- ${road.slug}: geometría no válida, se omite`); continue;
    }
    bulk.push({ key: `${KV_PREFIX}${road.cc.toLowerCase()}:${road.slug}`, value: JSON.stringify(body) });
    console.log(`+ ${road.slug.padEnd(28)} #${body.road.relation_id} ${body.length_km}km [${body.continuity}]`);
  }
  const bulkFile = path.join(OUT_DIR, 'kv-bulk.json');
  fs.writeFileSync(bulkFile, JSON.stringify(bulk));
  console.log(`\n${bulk.length} claves -> ${path.relative(process.cwd(), bulkFile)}`);
  if (DO_KV) {
    console.log('Subiendo a KV ROAD_GEOM (remote)…');
    const out = execFileSync('npx', ['wrangler', 'kv', 'bulk', 'put', bulkFile,
      '--binding', 'ROAD_GEOM', '-c', 'wrangler.toml', '--remote'], { cwd: WORKER_DIR, encoding: 'utf8', stdio: 'pipe' });
    console.log(out);
  } else {
    console.log('(sin --kv: kv-bulk.json escrito pero NO subido)');
  }
  process.exit(0);
}

const results = [];
for (const road of list) {
  const input = road.id ? { relationId: road.id } : { query: road.q, country: road.cc };
  const t0 = Date.now();
  let r;
  try {
    r = await resolveNamedRoad(input, { nocache: true });
  } catch (e) {
    console.log(`✗ ${road.slug.padEnd(28)} THREW ${e.message}`);
    results.push({ slug: road.slug, ok: false, error: e.message });
    await sleep(4000);
    continue;
  }
  const s = ((Date.now() - t0) / 1000).toFixed(0);
  if (!r.ok) {
    console.log(`✗ ${road.slug.padEnd(28)} ${r.reason}  (${s}s)`);
    results.push({ slug: road.slug, ok: false, reason: r.reason });
    await sleep(4000);
    continue;
  }
  const kvKey = KV_PREFIX + road.cc.toLowerCase() + ':' + road.slug;
  const rec = {
    slug: road.slug, cc: road.cc, label: road.label,
    relation_id: r.road.relation_id, name: r.road.name, ref: r.road.ref,
    length_km: r.length_km, continuity: r.continuity,
    fragments: r.fragments, gaps: r.gaps.length, points: r.geometry.length,
    kvKey, discovered: !road.id,
  };
  results.push({ ok: true, ...rec });
  // fija el objeto exacto que irá al KV
  fs.writeFileSync(path.join(OUT_DIR, `kv-${road.slug}.json`), JSON.stringify({ ...r, slug: road.slug, cc: road.cc }));
  console.log(
    `${r.continuity === 'fragmented' ? '⚠' : '·'} ${road.slug.padEnd(28)} #${r.road.relation_id} ` +
    `${String(r.length_km).padStart(6)}km [${r.continuity}] ${r.geometry.length}pts` +
    `${road.id ? '' : '  <-- FIJA id:' + r.road.relation_id}  (${s}s)`
  );
  await sleep(4000);
}

const okList = results.filter((x) => x.ok);
const summary = {
  generated_at: new Date().toISOString(),
  total: list.length, resolved: okList.length,
  fragmented: okList.filter((x) => x.continuity === 'fragmented').map((x) => x.slug),
  failed: results.filter((x) => !x.ok).map((x) => ({ slug: x.slug, why: x.reason || x.error })),
  rows: results,
};
fs.writeFileSync(path.join(OUT_DIR, 'precarga-summary.json'), JSON.stringify(summary, null, 2));
console.log(`\n${okList.length}/${list.length} resueltas.  Detalle en ${path.relative(process.cwd(), OUT_DIR)}/precarga-summary.json`);
if (summary.failed.length) console.log('Fallidas (reintentar con --only=slug o fijar id a mano):', summary.failed.map((f) => f.slug).join(', '));

if (DO_KV) {
  const bulk = okList.map((x) => {
    const body = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `kv-${x.slug}.json`), 'utf8'));
    return { key: x.kvKey, value: JSON.stringify(body) };
  });
  const bulkFile = path.join(OUT_DIR, 'kv-bulk.json');
  fs.writeFileSync(bulkFile, JSON.stringify(bulk));
  console.log(`\nSubiendo ${bulk.length} claves a KV ROAD_GEOM…`);
  const out = execFileSync('npx', ['wrangler', 'kv', 'bulk', 'put', bulkFile,
    '--binding', 'ROAD_GEOM', '-c', 'wrangler.toml', '--remote'], {
    cwd: WORKER_DIR, encoding: 'utf8', stdio: 'pipe',
  });
  console.log(out);
} else {
  console.log('\n(sin --kv: no se ha subido nada. Revisa el summary y relanza con --kv)');
}
