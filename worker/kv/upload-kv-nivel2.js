/**
 * Subida Nivel 2 a Cloudflare KV
 * Sube destinos + genera índice de keywords para búsqueda
 * 
 * Claves generadas:
 *   dest:vn:destinos           → JSON con los 10 destinos de Vietnam
 *   dest:vn:spot:hanoi         → JSON del destino individual (acceso rápido)
 *   kw:hanoi → vn              → ya creado en Nivel 1
 *   kw:hoi-an → vn             → nuevas keywords de destinos
 *   spot:hanoi → vn:hanoi      → índice de slug a país:destino
 * 
 * Uso:
 *   node upload-kv-nivel2.js
 *   node upload-kv-nivel2.js --country vn
 *   node upload-kv-nivel2.js --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  outputDir: path.join(__dirname, 'output-nivel2'),
  batchSize: 100,
};

function loadEnv() {
  const env = {};
  try {
    const lines = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.+)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    }
  } catch {}
  return {
    accountId: process.env.CF_ACCOUNT_ID || env.CF_ACCOUNT_ID,
    apiToken: process.env.CF_API_TOKEN || env.CF_API_TOKEN,
    namespaceId: process.env.CF_KV_NAMESPACE_ID || env.CF_KV_NAMESPACE_ID,
  };
}

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
    throw new Error(`KV error ${response.status}: ${err}`);
  }
  return response.json();
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleFlag = args.indexOf('--country');
  const singleCode = singleFlag >= 0 ? args[singleFlag + 1] : null;

  const credentials = loadEnv();
  if (!dryRun && (!credentials.accountId || !credentials.apiToken || !credentials.namespaceId)) {
    console.error('❌ Faltan credenciales de Cloudflare en .env');
    process.exit(1);
  }

  const files = fs.readdirSync(CONFIG.outputDir).filter(f => f.endsWith('.json'));
  let toUpload = singleCode ? files.filter(f => f.startsWith(singleCode)) : files;

  console.log(`\n🌍 Salma Knowledge Base — Subida Nivel 2 a KV`);
  console.log(`   Países a subir: ${toUpload.length}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}\n`);

  const kvPairs = [];
  let totalSpots = 0;
  let totalKeywords = 0;

  for (const file of toUpload) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(CONFIG.outputDir, file), 'utf-8'));

    // 1. Bloque completo del país con todos los destinos
    kvPairs.push({
      key: `dest:${code}:destinos`,
      value: JSON.stringify(data),
    });

    // 2. Cada destino individual (acceso rápido cuando ya sabes cuál)
    if (data.destinos) {
      for (const spot of data.destinos) {
        if (!spot.id) continue;

        kvPairs.push({
          key: `dest:${code}:spot:${spot.id}`,
          value: JSON.stringify(spot),
        });
        totalSpots++;

        // 3. Índice de slug → país:destino
        kvPairs.push({
          key: `spot:${spot.id}`,
          value: `${code}:${spot.id}`,
        });

        // 4. Keywords → código de país
        if (spot.keywords) {
          for (const kw of spot.keywords) {
            const normalized = kw.toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '-');
            kvPairs.push({
              key: `kw:${normalized}`,
              value: code,
            });
            totalKeywords++;
          }
        }
      }
    }
  }

  console.log(`   📍 Destinos individuales: ${totalSpots}`);
  console.log(`   🔑 Keywords nuevas: ${totalKeywords}`);
  console.log(`   📦 Pares KV totales: ${kvPairs.length}\n`);

  if (dryRun) {
    console.log('── Muestra de claves ──\n');

    const tipos = {
      'dest:*:destinos': p => p.key.endsWith(':destinos'),
      'dest:*:spot:*': p => p.key.includes(':spot:'),
      'spot:*': p => p.key.startsWith('spot:') && !p.key.includes(':spot:'),
      'kw:*': p => p.key.startsWith('kw:'),
    };

    for (const [label, filter] of Object.entries(tipos)) {
      const matches = kvPairs.filter(filter);
      console.log(`   ${label} (${matches.length} claves)`);
      matches.slice(0, 3).forEach(p => {
        const val = p.value.length > 60 ? p.value.substring(0, 60) + '...' : p.value;
        console.log(`     ${p.key} → ${val}`);
      });
      console.log('');
    }
    return;
  }

  // Subir en lotes
  for (let i = 0; i < kvPairs.length; i += CONFIG.batchSize) {
    const batch = kvPairs.slice(i, i + CONFIG.batchSize);
    const batchNum = Math.floor(i / CONFIG.batchSize) + 1;
    const total = Math.ceil(kvPairs.length / CONFIG.batchSize);

    process.stdout.write(`   ⏳ Lote ${batchNum}/${total} (${batch.length} pares)...`);
    try {
      await uploadBatch(batch, credentials);
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌ ${err.message}`);
    }
  }

  console.log(`\n✅ Nivel 2 subido a KV.`);
}

main().catch(console.error);
