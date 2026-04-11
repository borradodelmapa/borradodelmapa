/**
 * Sube transport-routes/*.json enriquecidos a Cloudflare KV
 * Reemplaza las entradas básicas de transport-apps.json con datos completos:
 * rutas, aeropuertos, operadores, precios, URLs de booking.
 *
 * Usa la misma clave "transport:{cc}" — los datos enriquecidos sustituyen los básicos.
 *
 * Uso:
 *   node upload-transport-routes.js           → sube todos los países disponibles
 *   node upload-transport-routes.js --dry-run → muestra qué subiría sin hacerlo
 *   node upload-transport-routes.js ES TH     → sube solo esos países
 *   node upload-transport-routes.js --stats   → muestra estadísticas de cada archivo
 *
 * Requiere en .env (o variables de entorno):
 *   CF_ACCOUNT_ID
 *   CF_API_TOKEN
 *   CF_KV_NAMESPACE_ID
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_DIR = path.join(__dirname, 'transport-routes');

// ── Leer .env ──────────────────────────────────────────────────
function loadEnv() {
  const env = {};
  try {
    const lines = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.+)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    }
  } catch {}
  return { ...env, ...process.env };
}

// ── Cloudflare KV bulk write ───────────────────────────────────
async function kvBulkWrite(accountId, namespaceId, token, pairs) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/bulk`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pairs),
  });
  const data = await res.json();
  if (!data.success) throw new Error(JSON.stringify(data.errors));
  return data;
}

// ── Leer archivos de transport-routes/ ─────────────────────────
function loadRouteFiles(filterCountries) {
  const files = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  const results = [];

  for (const file of files) {
    const cc = path.basename(file, '.json').toUpperCase();
    if (filterCountries.length && !filterCountries.includes(cc)) continue;

    const filePath = path.join(ROUTES_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    // Validar campos mínimos
    if (!data.country || !data.routes || !Array.isArray(data.routes)) {
      console.warn(`⚠️  ${file}: falta country o routes — saltando`);
      continue;
    }

    results.push({
      cc: cc.toLowerCase(),
      country: data.country_name || data.country,
      data,
      size: Buffer.byteLength(raw, 'utf-8'),
      routeCount: data.routes.length,
      airportCount: data.airports ? Object.keys(data.airports).length : 0,
      platformCount: data.booking_platforms ? data.booking_platforms.length : 0,
    });
  }

  return results;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const env = loadEnv();
  const { CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID } = env;

  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const showStats = args.includes('--stats');
  const filterCountries = args.filter(a => !a.startsWith('--')).map(a => a.toUpperCase());

  const entries = loadRouteFiles(filterCountries);

  if (entries.length === 0) {
    console.log('❌ No se encontraron archivos JSON en transport-routes/');
    console.log(`   Directorio: ${ROUTES_DIR}`);
    process.exit(1);
  }

  console.log(`\n📦 Transport Routes enriquecidos — ${entries.length} países\n`);

  // Mostrar tabla de stats
  console.log('  País              Rutas  Aerop  Plataformas  Tamaño');
  console.log('  ────────────────  ─────  ─────  ───────────  ──────');
  let totalSize = 0;
  let totalRoutes = 0;
  for (const e of entries) {
    const name = (e.country || e.cc).padEnd(16);
    const sizeKB = (e.size / 1024).toFixed(1).padStart(5) + ' KB';
    console.log(`  ${name}  ${String(e.routeCount).padStart(5)}  ${String(e.airportCount).padStart(5)}  ${String(e.platformCount).padStart(11)}  ${sizeKB}`);
    totalSize += e.size;
    totalRoutes += e.routeCount;
  }
  console.log(`  ────────────────  ─────  ─────  ───────────  ──────`);
  console.log(`  TOTAL             ${String(totalRoutes).padStart(5)}                   ${(totalSize / 1024).toFixed(1).padStart(5)} KB\n`);

  if (showStats) return;

  if (!isDryRun && (!CF_ACCOUNT_ID || !CF_API_TOKEN || !CF_KV_NAMESPACE_ID)) {
    console.error('❌ Faltan variables: CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID');
    console.error('   Configura en .env o como variables de entorno');
    process.exit(1);
  }

  const pairs = entries.map(e => ({
    key: `transport:${e.cc}`,
    value: JSON.stringify(e.data),
  }));

  if (isDryRun) {
    console.log('🔍 DRY RUN — claves que se subirían:\n');
    for (const p of pairs) {
      console.log(`  ${p.key} → ${(Buffer.byteLength(p.value) / 1024).toFixed(1)} KB`);
    }
    console.log(`\n✅ ${pairs.length} entradas listas. Ejecuta sin --dry-run para subir.\n`);
    return;
  }

  // Subir en lotes de 100
  const BATCH = 100;
  let uploaded = 0;
  for (let i = 0; i < pairs.length; i += BATCH) {
    const batch = pairs.slice(i, i + BATCH);
    process.stdout.write(`  Subiendo ${i + 1}–${Math.min(i + BATCH, pairs.length)}/${pairs.length}... `);
    await kvBulkWrite(CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN, batch);
    uploaded += batch.length;
    console.log('✅');
  }

  console.log(`\n🎉 ${uploaded} países subidos a KV con datos enriquecidos (transport:{cc})`);
  console.log(`   Total: ${totalRoutes} rutas, ${(totalSize / 1024).toFixed(1)} KB\n`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
