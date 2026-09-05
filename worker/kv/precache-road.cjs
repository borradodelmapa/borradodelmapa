/**
 * precache-road.cjs — Precarga la geometría real de una carretera en KV.
 *
 * POR QUÉ EXISTE: el Worker no siempre consigue alcanzar Overpass. Visto en
 * producción el 5 sept 2026: overpass-api.de devolvía HTTP 521 al Worker (error
 * de Cloudflare alcanzando el origen, no del servicio) mientras respondía en 1,6s
 * desde un PC normal. Sin geometría no se pinta la carretera real en el mapa.
 *
 * resolveNamedRoad() mira la caché KV `road_geom:{cc}:{codigo}` ANTES de llamar a
 * Overpass, así que si la geometría está precargada el Worker no necesita salir a
 * internet. Este script la resuelve desde aquí (donde Overpass sí responde) y la
 * deja lista para subir.
 *
 * Las funciones de stitching y simplificado se EXTRAEN del propio salma-worker.js
 * en tiempo de ejecución, para que el resultado sea idéntico al que produciría el
 * Worker y no se desincronicen dos copias del algoritmo.
 *
 * Uso:
 *   node precache-road.cjs --road N-2 --country PT
 *   node precache-road.cjs --road N-2 --country PT --from-file geom.json
 *   node precache-road.cjs --road N-2 --country PT --upload
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const WORKER_FILE = path.join(__dirname, '..', 'salma-worker.js');

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.osm.ch/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const HEADERS = {
  'User-Agent': 'SalmaWorker/1.0 (borradodelmapa.com; contacto: paco.defoto@gmail.com)',
  'Content-Type': 'application/x-www-form-urlencoded',
};

// ── Extrae una función del worker por nombre, contando llaves ──
function extractFn(src, name) {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`No se encontró ${name}() en salma-worker.js`);
  let depth = 0, i = src.indexOf('{', start);
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) return src.slice(start, j + 1); }
  }
  throw new Error(`No se pudo cerrar ${name}()`);
}

const workerSrc = fs.readFileSync(WORKER_FILE, 'utf8');
const sandbox = {};
new Function('exports',
  extractFn(workerSrc, '_stitchWaysNearestNeighbor') + '\n' +
  extractFn(workerSrc, '_simplifyLatLng') + '\n' +
  extractFn(workerSrc, '_roadRefVariants') + '\n' +
  extractFn(workerSrc, '_roadNamePatterns') + '\n' +
  'exports._stitchWaysNearestNeighbor = _stitchWaysNearestNeighbor;' +
  'exports._simplifyLatLng = _simplifyLatLng;' +
  'exports._roadRefVariants = _roadRefVariants;' +
  'exports._roadNamePatterns = _roadNamePatterns;'
)(sandbox);

async function overpass(body, label) {
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST', headers: HEADERS,
        body: 'data=' + encodeURIComponent(body),
        signal: AbortSignal.timeout(150000),
      });
      if (!res.ok) { console.log(`  ${url} → HTTP ${res.status}, siguiente espejo`); continue; }
      const json = await res.json();
      console.log(`  ${url} → OK (${label})`);
      return json;
    } catch (e) {
      console.log(`  ${url} → ${e.message}, siguiente espejo`);
    }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  const roadCode = (get('--road') || '').toUpperCase();
  const cc = (get('--country') || '').toUpperCase();
  const fromFile = get('--from-file');
  const doUpload = args.includes('--upload');

  if (!roadCode || !cc) {
    console.error('Uso: node precache-road.cjs --road N-2 --country PT [--from-file geom.json] [--upload]');
    process.exit(1);
  }

  const cacheKey = `road_geom:${cc.toLowerCase()}:${roadCode.replace(/\s+/g, '')}`;
  console.log(`\nCarretera ${roadCode} (${cc}) → clave KV: ${cacheKey}\n`);

  let wayData;
  if (fromFile) {
    console.log(`Leyendo geometría de ${fromFile}`);
    wayData = JSON.parse(fs.readFileSync(fromFile, 'utf8'));
  } else {
    const refVariants = sandbox._roadRefVariants(roadCode);
    const namePatterns = sandbox._roadNamePatterns(roadCode, cc);
    // Las variantes solo llevan letras, digitos, guion y espacio (las produce
    // _roadRefVariants desde un codigo ya validado), asi que no hay metacaracteres
    // de regex que escapar. Se filtra por si acaso antes de meterlas en la query.
    const refRegex = refVariants.filter(v => /^[A-Za-z0-9 -]+$/.test(v)).join("|");
    const nameClauses = namePatterns.map(p => `relation["name"~"^${p}$",i](area.a);`).join('\n  ');

    console.log('1. Buscando la relación route=road...');
    const relData = await overpass(`[out:json][timeout:25];
area["ISO3166-1"="${cc}"][admin_level=2]->.a;
(
  relation["ref"~"^(${refRegex})$",i]["route"="road"](area.a);
  ${nameClauses}
);
out tags;`, 'relación');
    const relation = relData?.elements?.find(e => e.type === 'relation');
    if (!relation) { console.error('❌ No se encontró la relación en OSM.'); process.exit(1); }
    console.log(`   → id ${relation.id}  ref=${relation.tags.ref || '-'}  name=${relation.tags.name || '-'}\n`);

    console.log('2. Descargando geometría (puede tardar, son cientos de km)...');
    wayData = await overpass(`[out:json][timeout:120];\nrelation(${relation.id});\nway(r);\nout geom;`, 'geometría');
    if (!wayData) { console.error('❌ Ningún espejo devolvió la geometría.'); process.exit(1); }
    wayData._relation = relation;
  }

  const relation = wayData._relation || { id: Number(get('--relation')) || 0, tags: { name: roadCode } };
  const ways = (wayData.elements || []).filter(e => e.type === 'way' && e.geometry?.length >= 2);
  if (!ways.length) { console.error('❌ Sin ways con geometría.'); process.exit(1); }

  console.log(`\n3. Reconstruyendo trazado (${ways.length} tramos)...`);
  const points = sandbox._stitchWaysNearestNeighbor(ways);
  const simplified = sandbox._simplifyLatLng(points, 0.0003);
  console.log(`   ${points.length} puntos → ${simplified.length} tras simplificar`);

  const result = {
    found: true,
    relationId: relation.id,
    name: relation.tags?.name || roadCode,
    points: simplified,
  };

  const outFile = path.join(__dirname, `road_geom_${cc.toLowerCase()}_${roadCode.replace(/\s+/g, '')}.json`);
  fs.writeFileSync(outFile, JSON.stringify(result));
  const kb = (fs.statSync(outFile).size / 1024).toFixed(0);
  console.log(`\n✅ Guardado en ${path.basename(outFile)} (${kb} KB)`);

  if (doUpload) {
    console.log(`\n4. Subiendo a KV (${cacheKey})...`);
    execSync(`npx wrangler kv key put "${cacheKey}" --path="${outFile}" --namespace-id=${NAMESPACE_ID} --remote --expiration-ttl 15552000`,
      { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('✅ Subido. El Worker ya no necesita alcanzar Overpass para esta carretera.');
  } else {
    console.log(`\nPara subirlo:\n  node ${path.basename(__filename)} --road ${roadCode} --country ${cc} --from-file <geom.json> --upload`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
