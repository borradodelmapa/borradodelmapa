/**
 * Sube transport-apps.json a Cloudflare KV
 * Una entrada por país: clave "transport:ES", "transport:TH", etc.
 *
 * Uso:
 *   node upload-transport.js           → sube todos los países
 *   node upload-transport.js --dry-run → muestra qué subiría sin hacerlo
 *   node upload-transport.js ES TH     → sube solo esos países
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

// ── Config ─────────────────────────────────────────────────────
const SOURCE_FILE = path.join(__dirname, '..', '..', 'transport-apps.json');

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

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const env = loadEnv();
  const { CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID } = env;

  const isDryRun = process.argv.includes('--dry-run');
  const filterCountries = process.argv.slice(2).filter(a => !a.startsWith('--')).map(a => a.toUpperCase());

  if (!isDryRun && (!CF_ACCOUNT_ID || !CF_API_TOKEN || !CF_KV_NAMESPACE_ID)) {
    console.error('❌ Faltan variables: CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
  const countries = raw.countries;

  let codes = Object.keys(countries);
  if (filterCountries.length) {
    codes = codes.filter(c => filterCountries.includes(c.toUpperCase()));
    console.log(`🔍 Filtrando: ${codes.join(', ')}`);
  }

  console.log(`📦 Total países a subir: ${codes.length}`);

  const pairs = codes.map(code => ({
    key: `transport:${code.toLowerCase()}`,
    value: JSON.stringify(countries[code]),
    expiration_ttl: undefined, // sin expiración
  }));

  if (isDryRun) {
    console.log('\n🔍 DRY RUN — primeras 5 claves:');
    pairs.slice(0, 5).forEach(p => {
      const val = JSON.parse(p.value);
      const cats = Object.keys(val).join(', ');
      console.log(`  ${p.key} → [${cats}]`);
    });
    console.log(`\n✅ ${pairs.length} entradas listas para subir.`);
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

  console.log(`\n🎉 ${uploaded} países subidos a KV con prefijo "transport:"`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
