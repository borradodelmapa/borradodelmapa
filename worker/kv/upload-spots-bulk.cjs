#!/usr/bin/env node
/**
 * Sube spots enriquecidos al KV usando wrangler bulk (mucho más rápido)
 * wrangler kv bulk put acepta un JSON array de {key, value}
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const NIVEL2_DIR = path.join(__dirname, 'output-nivel2');
const TMP = path.join(__dirname, '_bulk_spots.json');
const BATCH = 500; // wrangler bulk acepta hasta 10000

const files = fs.readdirSync(NIVEL2_DIR).filter(f => f.endsWith('.json'));
const entries = [];

for (const file of files) {
  const code = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(NIVEL2_DIR, file), 'utf8'));

  // destinos completo
  entries.push({ key: `dest:${code}:destinos`, value: JSON.stringify(data) });

  if (!data.destinos || !Array.isArray(data.destinos)) continue;

  for (const spot of data.destinos) {
    if (!spot.lat || !spot.lng) continue;
    const spotName = (spot.nombre || spot.name || spot.id || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[\\\/:"*?<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);
    if (!spotName) continue;

    const val = JSON.stringify(spot);
    entries.push({ key: `spot:${spotName}`, value: val });
    entries.push({ key: `dest:${code}:spot:${spotName}`, value: val });
  }
}

console.log(`Total entries: ${entries.length}`);

// Subir en lotes de BATCH
for (let i = 0; i < entries.length; i += BATCH) {
  const batch = entries.slice(i, i + BATCH);
  fs.writeFileSync(TMP, JSON.stringify(batch));
  try {
    execSync(`npx wrangler kv bulk put "${TMP}" --namespace-id=${NAMESPACE_ID} --remote`, {
      cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 120000
    });
    console.log(`  Lote ${Math.floor(i/BATCH)+1}/${Math.ceil(entries.length/BATCH)}: ${batch.length} entries ✅`);
  } catch (e) {
    console.log(`  Lote ${Math.floor(i/BATCH)+1}: FAIL — ${e.message?.slice(0, 100)}`);
  }
}

try { fs.unlinkSync(TMP); } catch (_) {}
console.log('DONE');
