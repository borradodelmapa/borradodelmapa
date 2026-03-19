/**
 * Subida de fichas a Cloudflare KV
 * Lee los JSON generados y los sube a un namespace KV
 * 
 * Uso:
 *   node upload-kv.js                  → sube todos los JSON de /output
 *   node upload-kv.js --country vn     → sube solo Vietnam
 *   node upload-kv.js --dry-run        → muestra qué subiría sin hacerlo
 * 
 * Requisitos en .env:
 *   CF_ACCOUNT_ID=tu_account_id
 *   CF_API_TOKEN=tu_token_con_permisos_kv
 *   CF_KV_NAMESPACE_ID=id_del_namespace
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuración ──────────────────────────────────────────────
const CONFIG = {
  outputDir: path.join(__dirname, 'output'),
  kvPrefix: 'dest',  // clave: dest:vn:base
  batchSize: 100,     // Cloudflare KV bulk write acepta hasta 10k pares
};

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

  // Merge con process.env
  return {
    accountId: process.env.CF_ACCOUNT_ID || env.CF_ACCOUNT_ID,
    apiToken: process.env.CF_API_TOKEN || env.CF_API_TOKEN,
    namespaceId: process.env.CF_KV_NAMESPACE_ID || env.CF_KV_NAMESPACE_ID,
  };
}

// ── Subida bulk a KV ───────────────────────────────────────────
async function uploadBatch(pairs, credentials) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/storage/kv/namespaces/${credentials.namespaceId}/bulk`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.apiToken}`,
    },
    body: JSON.stringify(pairs),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`KV bulk write error ${response.status}: ${err}`);
  }

  return response.json();
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleFlag = args.indexOf('--country');
  const singleCode = singleFlag >= 0 ? args[singleFlag + 1] : null;

  const credentials = loadEnv();

  if (!dryRun) {
    if (!credentials.accountId || !credentials.apiToken || !credentials.namespaceId) {
      console.error('❌ Faltan credenciales de Cloudflare en .env:');
      console.error('   CF_ACCOUNT_ID=...');
      console.error('   CF_API_TOKEN=...');
      console.error('   CF_KV_NAMESPACE_ID=...');
      process.exit(1);
    }
  }

  // Leer ficheros JSON generados
  const files = fs.readdirSync(CONFIG.outputDir).filter(f => f.endsWith('.json'));
  let toUpload = files;

  if (singleCode) {
    toUpload = files.filter(f => f.startsWith(singleCode));
    if (toUpload.length === 0) {
      console.error(`❌ No se encontró ficha para: ${singleCode}`);
      process.exit(1);
    }
  }

  console.log(`\n🌍 Salma Knowledge Base — Subida a Cloudflare KV`);
  console.log(`   Fichas a subir: ${toUpload.length}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}\n`);

  // Construir pares clave-valor
  const kvPairs = [];

  for (const file of toUpload) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(CONFIG.outputDir, file), 'utf-8'));

    // Clave principal: dest:vn:base
    const key = `${CONFIG.kvPrefix}:${code}:base`;
    kvPairs.push({
      key,
      value: JSON.stringify(data),
    });

    // Índice de keywords para búsqueda por ciudades
    if (data.keywords && Array.isArray(data.keywords)) {
      for (const kw of data.keywords) {
        const kwKey = `kw:${kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`;
        kvPairs.push({
          key: kwKey,
          value: code,  // apunta al código del país
        });
      }
    }
  }

  console.log(`   Pares KV totales: ${kvPairs.length} (${toUpload.length} fichas + keywords)\n`);

  if (dryRun) {
    console.log('── Primeros 10 pares ──');
    kvPairs.slice(0, 10).forEach(p => {
      const preview = p.value.length > 80 ? p.value.substring(0, 80) + '...' : p.value;
      console.log(`   ${p.key} → ${preview}`);
    });
    console.log('\n── Keywords de ejemplo ──');
    kvPairs.filter(p => p.key.startsWith('kw:')).slice(0, 10).forEach(p => {
      console.log(`   ${p.key} → ${p.value}`);
    });
    return;
  }

  // Subir en lotes
  for (let i = 0; i < kvPairs.length; i += CONFIG.batchSize) {
    const batch = kvPairs.slice(i, i + CONFIG.batchSize);
    const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
    const totalBatches = Math.ceil(kvPairs.length / CONFIG.batchSize);

    process.stdout.write(`   ⏳ Lote ${batchNum}/${totalBatches} (${batch.length} pares)...`);

    try {
      await uploadBatch(batch, credentials);
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }
  }

  console.log(`\n✅ Subida completada.`);
  console.log(`   Las fichas están disponibles en KV con prefijo "${CONFIG.kvPrefix}:"`);
  console.log(`   Las keywords están indexadas con prefijo "kw:"`);
}

main().catch(console.error);
