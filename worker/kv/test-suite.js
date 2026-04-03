/**
 * SALMA TEST SUITE — Validación KV + APIs
 *
 * Comprueba:
 *   1. KV Nivel 1: cobertura de fichas base de países
 *   2. KV Nivel 2: spots con coords + photo_ref
 *   3. KV Keywords: lookups por ciudad/destino
 *   4. KV Transport: datos de transporte por país
 *   5. APIs en producción: llama a /health del worker
 *
 * Uso:
 *   node test-suite.js                  → tests completos
 *   node test-suite.js --quick          → muestra solo errores
 *   node test-suite.js --kv-only        → solo KV, sin llamar al worker
 *
 * Requisitos: wrangler autenticado + worker desplegado
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const WORKER_URL = 'https://salma-api.paco-defoto.workers.dev';

const args = process.argv.slice(2);
const QUICK = args.includes('--quick');
const KV_ONLY = args.includes('--kv-only');

// ── Colores terminal ──────────────────────────────────────────
const C = {
  ok:   '\x1b[32m✅\x1b[0m',
  err:  '\x1b[31m❌\x1b[0m',
  warn: '\x1b[33m⚠️ \x1b[0m',
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim:  (s) => `\x1b[2m${s}\x1b[0m`,
};

// ── KV helpers ────────────────────────────────────────────────
function kvGet(key) {
  try {
    return execSync(
      `npx wrangler kv key get "${key}" --namespace-id=${NAMESPACE_ID} --remote`,
      { cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 15000 }
    ).toString().trim();
  } catch {
    return null;
  }
}

function kvList(prefix, limit = 1000) {
  try {
    return JSON.parse(execSync(
      `npx wrangler kv key list --prefix="${prefix}" --namespace-id=${NAMESPACE_ID} --remote --limit=${limit}`,
      { cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 30000 }
    ).toString().trim());
  } catch {
    return [];
  }
}

// ── Muestra representativa de países por región ────────────────
const SAMPLE_COUNTRIES = {
  Europa:       ['es', 'fr', 'de', 'pt', 'it', 'pl', 'gr', 'nl', 'be', 'at'],
  Asia:         ['th', 'vn', 'jp', 'in', 'id', 'sg', 'cn', 'ph', 'bt', 'my'],
  'América S':  ['br', 'ar', 'co', 'pe', 'cl', 'uy', 'bo', 'ec'],
  'América C':  ['mx', 'cu', 'cr', 'pa', 'gt', 'hn'],
  África:       ['ma', 'ke', 'za', 'eg', 'tz', 'ng', 'et', 'gh'],
  'Oriente M.': ['tr', 'ae', 'sa', 'il', 'jo', 'ir'],
  Oceanía:      ['au', 'nz', 'fj'],
};

// ── Destinos clave con coords esperadas (spot lookup) ──────────
const SPOT_TESTS = [
  { query: 'bangkok',          country: 'TH', expect_lat: 13.7 },
  { query: 'paris',            country: 'FR', expect_lat: 48.8 },
  { query: 'barcelona',        country: 'ES', expect_lat: 41.3 },
  { query: 'tokyo',            country: 'JP', expect_lat: 35.6 },
  { query: 'roma',             country: 'IT', expect_lat: 41.9 },
  { query: 'marrakech',        country: 'MA', expect_lat: 31.6 },
  { query: 'amsterdam',        country: 'NL', expect_lat: 52.3 },
  { query: 'nueva-york',       country: 'US', expect_lat: 40.7 },
  { query: 'rio-de-janeiro',   country: 'BR', expect_lat: -22.9 },
  { query: 'hanoi',            country: 'VN', expect_lat: 21.0 },
  { query: 'bali',             country: 'ID', expect_lat: -8.3 },
  { query: 'estambul',         country: 'TR', expect_lat: 41.0 },
  { query: 'cartagena',        country: 'CO', expect_lat: 10.3 },
  { query: 'cusco',            country: 'PE', expect_lat: -13.5 },
  { query: 'dubai',            country: 'AE', expect_lat: 25.2 },
];

// ── Keywords críticos (country lookup) ────────────────────────
const KW_TESTS = [
  { keyword: 'vietnam',   expected_cc: 'VN' },
  { keyword: 'tailandia', expected_cc: 'TH' },
  { keyword: 'espana',    expected_cc: 'ES' },
  { keyword: 'japon',     expected_cc: 'JP' },
  { keyword: 'marruecos', expected_cc: 'MA' },
  { keyword: 'argentina', expected_cc: 'AR' },
  { keyword: 'indonesia', expected_cc: 'ID' },
  { keyword: 'turquia',   expected_cc: 'TR' },
];

// ── Nivel 1: campos obligatorios ──────────────────────────────
const NIVEL1_REQUIRED = ['pais', 'capital', 'moneda', 'idioma_oficial', 'emergencias', 'visado_espanoles'];
// ── Nivel 1: campos de transporte ─────────────────────────────
const NIVEL1_TRANSPORT = ['transporte'];

// ══════════════════════════════════════════════════════════════
// TEST 1 — KV Nivel 1: cobertura de fichas base
// ══════════════════════════════════════════════════════════════
async function testNivel1() {
  console.log(`\n${C.bold('TEST 1 — KV Nivel 1 (fichas base de países)')}`);
  const results = { ok: 0, missing: 0, incomplete: 0, no_transport: 0 };

  for (const [region, codes] of Object.entries(SAMPLE_COUNTRIES)) {
    const regionResults = [];
    for (const cc of codes) {
      const raw = kvGet(`dest:${cc}:base`);
      if (!raw) {
        regionResults.push({ cc, status: 'missing' });
        results.missing++;
        continue;
      }
      try {
        const d = JSON.parse(raw);
        const missingFields = NIVEL1_REQUIRED.filter(f => !d[f]);
        const hasTransport = !!d.transporte;
        if (missingFields.length > 0) {
          regionResults.push({ cc, status: 'incomplete', missing: missingFields });
          results.incomplete++;
        } else {
          regionResults.push({ cc, status: 'ok', hasTransport });
          results.ok++;
          if (!hasTransport) results.no_transport++;
        }
      } catch {
        regionResults.push({ cc, status: 'parse_error' });
        results.incomplete++;
      }
    }

    if (!QUICK) {
      const line = regionResults.map(r => {
        if (r.status === 'ok') return `${C.ok}${r.cc.toUpperCase()}${r.hasTransport ? '' : '(sin🚕)'}`;
        if (r.status === 'missing') return `${C.err}${r.cc.toUpperCase()}`;
        return `${C.warn}${r.cc.toUpperCase()}`;
      }).join('  ');
      console.log(`  ${region.padEnd(12)} ${line}`);
    }
  }

  const total = Object.values(SAMPLE_COUNTRIES).flat().length;
  const icon = results.missing === 0 && results.incomplete === 0 ? C.ok : C.warn;
  console.log(`  ${icon} Resultado: ${results.ok}/${total} ok | ${results.missing} missing | ${results.incomplete} incompletos | ${results.no_transport} sin transporte`);
  return results;
}

// ══════════════════════════════════════════════════════════════
// TEST 2 — KV Spots: cobertura de destinos clave
// ══════════════════════════════════════════════════════════════
async function testSpots() {
  console.log(`\n${C.bold('TEST 2 — KV Spots (destinos clave)')}`);
  const results = { ok: 0, no_coords: 0, missing: 0 };

  for (const test of SPOT_TESTS) {
    const raw = kvGet(`spot:${test.query}`);
    if (!raw) {
      if (!QUICK) console.log(`  ${C.err} spot:${test.query.padEnd(20)} — NO EXISTE`);
      results.missing++;
      continue;
    }
    try {
      const d = JSON.parse(raw);
      const hasCoords = !!(d.lat && d.lng);
      const hasPhoto = !!d.photo_ref;
      const coordsOk = hasCoords && Math.abs(d.lat - test.expect_lat) < 5;

      if (hasCoords && coordsOk) {
        if (!QUICK) console.log(`  ${C.ok} spot:${test.query.padEnd(20)} lat=${d.lat} photo=${hasPhoto ? C.ok : C.err}`);
        results.ok++;
      } else if (hasCoords) {
        console.log(`  ${C.warn} spot:${test.query.padEnd(20)} coords RARAS: lat=${d.lat} (esperado ~${test.expect_lat})`);
        results.no_coords++;
      } else {
        console.log(`  ${C.err} spot:${test.query.padEnd(20)} — SIN COORDS`);
        results.no_coords++;
      }
    } catch {
      console.log(`  ${C.err} spot:${test.query.padEnd(20)} — JSON inválido`);
      results.missing++;
    }
  }

  const icon = results.missing === 0 && results.no_coords === 0 ? C.ok : C.warn;
  console.log(`  ${icon} Resultado: ${results.ok}/${SPOT_TESTS.length} con coords válidas | ${results.missing} missing | ${results.no_coords} sin coords`);
  return results;
}

// ══════════════════════════════════════════════════════════════
// TEST 3 — KV Keywords: country lookup
// ══════════════════════════════════════════════════════════════
async function testKeywords() {
  console.log(`\n${C.bold('TEST 3 — KV Keywords (country code lookup)')}`);
  const results = { ok: 0, wrong: 0, missing: 0 };

  for (const test of KW_TESTS) {
    const cc = kvGet(`kw:${test.keyword}`);
    if (!cc) {
      console.log(`  ${C.err} kw:${test.keyword.padEnd(15)} — NO EXISTE`);
      results.missing++;
    } else if (cc.toUpperCase() !== test.expected_cc) {
      console.log(`  ${C.warn} kw:${test.keyword.padEnd(15)} → ${cc} (esperado ${test.expected_cc})`);
      results.wrong++;
    } else {
      if (!QUICK) console.log(`  ${C.ok} kw:${test.keyword.padEnd(15)} → ${cc}`);
      results.ok++;
    }
  }

  const icon = results.missing === 0 && results.wrong === 0 ? C.ok : C.err;
  console.log(`  ${icon} Resultado: ${results.ok}/${KW_TESTS.length} correctos | ${results.wrong} incorrectos | ${results.missing} missing`);
  return results;
}

// ══════════════════════════════════════════════════════════════
// TEST 4 — KV Conteo total
// ══════════════════════════════════════════════════════════════
async function testKVCount() {
  console.log(`\n${C.bold('TEST 4 — KV Conteo total de claves')}`);

  const prefixes = [
    { prefix: 'dest:',       label: 'Fichas base (nivel 1)',    expected_min: 100 },
    { prefix: 'spot:',       label: 'Destinos específicos',     expected_min: 1000 },
    { prefix: 'kw:',         label: 'Keywords (lookups)',       expected_min: 500 },
    { prefix: 'transport:',  label: 'Datos transporte',         expected_min: 50 },
    { prefix: 'route:',      label: 'Rutas cacheadas (nivel 3)', expected_min: 0 },
  ];

  for (const { prefix, label, expected_min } of prefixes) {
    const keys = kvList(prefix, 1000);
    const count = keys.length;
    const icon = count >= expected_min ? C.ok : C.warn;
    console.log(`  ${icon} ${label.padEnd(35)} ${count.toString().padStart(5)} claves${count < expected_min ? ` (mínimo esperado: ${expected_min})` : ''}`);
  }
}

// ══════════════════════════════════════════════════════════════
// TEST 5 — Worker /health endpoint
// ══════════════════════════════════════════════════════════════
async function testWorkerHealth() {
  console.log(`\n${C.bold('TEST 5 — Worker /health (APIs externas)')}`);

  // Leer ADMIN_TOKEN si existe
  let adminToken = '';
  try {
    const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    const m = env.match(/ADMIN_TOKEN=(.+)/);
    if (m) adminToken = m[1].trim();
  } catch {}

  if (!adminToken) {
    console.log(`  ${C.warn} No hay ADMIN_TOKEN en .env — saltando test de /health`);
    console.log(`  ${C.dim('Para habilitarlo: añade ADMIN_TOKEN=xxx en .env y en Cloudflare secrets')}`);
    return;
  }

  try {
    const res = await fetch(`${WORKER_URL}/health`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();

    const statusIcon = data.status === 'all_ok' ? C.ok : C.warn;
    console.log(`  ${statusIcon} Estado global: ${data.status} (${data.total_ms}ms)`);

    for (const [service, check] of Object.entries(data.checks || {})) {
      const icon = check.status === 'ok' ? C.ok : C.err;
      const extra = check.ms ? `${check.ms}ms` : (check.error || '');
      console.log(`    ${icon} ${service.padEnd(20)} ${extra}`);
    }
  } catch (e) {
    console.log(`  ${C.err} No se pudo conectar con el worker: ${e.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
// TEST 6 — Comportamiento de Salma (test cases)
// ══════════════════════════════════════════════════════════════
async function testSalmaBehavior() {
  console.log(`\n${C.bold('TEST 6 — Comportamiento de Salma (conversaciones)')}`);
  console.log(`  ${C.dim('(Llama al worker en producción — consume tokens)')}`);

  const TEST_CASES = [
    {
      id: 'kv-visado',
      label: 'Visado Vietnam (debe usar KV, no alucinar)',
      message: '¿Necesito visado para ir a Vietnam siendo español?',
      must_contain: ['días', 'visado', 'gratis'],
      must_not_contain: ['no sé', 'no tengo información', 'consulta'],
    },
    {
      id: 'kv-ferry',
      label: 'Ferry Koh Samui→Bangkok (ruta real, sin alucinaciones)',
      message: '¿Hay ferry directo de Koh Samui a Bangkok?',
      must_not_contain: ['ferry directo', 'hay ferry'],
      must_contain: ['Surat', 'bus', 'autobús'],
    },
    {
      id: 'route-missing-params',
      label: 'Ruta sin C+D (debe preguntar, no generar)',
      message: 'Vietnam 5 días',
      must_contain: ['qué quieres', 'solo', 'pareja'],
      must_not_contain: ['SALMA_ROUTE_JSON'],
    },
    {
      id: 'route-with-params',
      label: 'Ruta con C+D (debe generar directamente)',
      message: 'Vietnam 5 días, cultura y templos, voy solo',
      must_contain: ['SALMA_ROUTE_JSON'],
    },
    {
      id: 'no-invented-url',
      label: 'No inventar URLs de apps',
      message: 'Cómo llego del aeropuerto de Bangkok al centro',
      must_not_contain: ['grab.com', 'bolt.com', 'uber.com', 'http://'],
      must_contain: ['Grab', 'Bolt'],
    },
    {
      id: 'no-paja',
      label: 'Sin frases prohibidas',
      message: 'Qué ver en Marrakech',
      must_not_contain: ['no te puedes perder', 'experiencia única', 'increíble', 'inolvidable'],
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    process.stdout.write(`  ⏳ ${tc.label}...`);
    try {
      const res = await fetch(`${WORKER_URL}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: tc.message, history: [], uid: 'test-suite' }),
        signal: AbortSignal.timeout(30000),
      });

      // Recoger SSE o JSON
      const text = await res.text();
      let reply = '';
      // Parsear SSE
      const sseMatches = [...text.matchAll(/data: (\{.+?\})\n/g)];
      for (const m of sseMatches) {
        try {
          const evt = JSON.parse(m[1]);
          if (evt.t) reply += evt.t;
          if (evt.reply) reply = evt.reply;
        } catch {}
      }
      if (!reply) {
        try { const d = JSON.parse(text); reply = d.reply || ''; } catch {}
      }

      const failures = [];
      for (const phrase of (tc.must_contain || [])) {
        if (!reply.toLowerCase().includes(phrase.toLowerCase())) {
          failures.push(`FALTA: "${phrase}"`);
        }
      }
      for (const phrase of (tc.must_not_contain || [])) {
        if (reply.toLowerCase().includes(phrase.toLowerCase())) {
          failures.push(`PRESENTE (prohibido): "${phrase}"`);
        }
      }

      if (failures.length === 0) {
        console.log(` ${C.ok}`);
        passed++;
      } else {
        console.log(` ${C.err}`);
        for (const f of failures) console.log(`      ${C.dim(f)}`);
        failed++;
      }
    } catch (e) {
      console.log(` ${C.err} Error: ${e.message.slice(0, 60)}`);
      failed++;
    }
  }

  const icon = failed === 0 ? C.ok : C.err;
  console.log(`\n  ${icon} Resultado: ${passed}/${TEST_CASES.length} pasados | ${failed} fallidos`);
  return { passed, failed };
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
async function main() {
  const startTime = Date.now();
  console.log(`\n${'═'.repeat(60)}`);
  console.log(C.bold('  SALMA TEST SUITE'));
  console.log(`  Worker: ${WORKER_URL}`);
  console.log(`  Modo: ${QUICK ? 'QUICK (solo errores)' : 'FULL'}`);
  console.log(`${'═'.repeat(60)}`);

  const n1 = await testNivel1();
  const spots = await testSpots();
  const kw = await testKeywords();
  await testKVCount();

  if (!KV_ONLY) {
    await testWorkerHealth();
    await testSalmaBehavior();
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(C.bold('  RESUMEN FINAL'));
  const kvOk = n1.missing === 0 && kw.missing === 0;
  const spotsOk = spots.missing < 3 && spots.no_coords < 3;
  console.log(`  KV Nivel 1:  ${kvOk ? C.ok : C.warn} ${n1.ok} países completos`);
  console.log(`  KV Spots:    ${spotsOk ? C.ok : C.warn} ${spots.ok}/${SPOT_TESTS.length} con coords válidas`);
  console.log(`  KV Keywords: ${kw.missing === 0 ? C.ok : C.err} ${kw.ok}/${KW_TESTS.length} correctos`);
  console.log(`  Tiempo total: ${elapsed}s`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(console.error);
