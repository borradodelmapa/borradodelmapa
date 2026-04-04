#!/usr/bin/env node
/**
 * Sube spots enriquecidos (con lat/lng/photo_ref) al KV remoto
 * Los destinos del nivel 2 ahora tienen coords verificadas
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const NIVEL2_DIR = path.join(__dirname, 'output-nivel2');
const TMP = path.join(__dirname, '_tmp_spot.json');

let ok = 0, fail = 0;

const files = fs.readdirSync(NIVEL2_DIR).filter(f => f.endsWith('.json'));
console.log(`Subiendo destinos enriquecidos de ${files.length} países...`);

for (const file of files) {
  const code = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(NIVEL2_DIR, file), 'utf8'));

  // Subir el documento destinos completo (con coords)
  fs.writeFileSync(TMP, JSON.stringify(data));
  try {
    execSync(`npx wrangler kv key put "dest:${code}:destinos" --path="${TMP}" --namespace-id=${NAMESPACE_ID} --remote`, {
      cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 30000
    });
    ok++;
  } catch (e) { fail++; }

  // Subir cada spot individual
  if (data.destinos && Array.isArray(data.destinos)) {
    for (const spot of data.destinos) {
      if (!spot.lat || !spot.lng) continue;
      const spotName = (spot.nombre || spot.name || spot.id || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[\\\/:"*?<>|]+/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80);
      if (!spotName) continue;

      fs.writeFileSync(TMP, JSON.stringify(spot));
      try {
        // spot:nombre → countryCode:nombre (para lookup rápido)
        execSync(`npx wrangler kv key put "spot:${spotName}" --path="${TMP}" --namespace-id=${NAMESPACE_ID} --remote`, {
          cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 30000
        });
        // dest:XX:spot:nombre → datos completos del spot
        execSync(`npx wrangler kv key put "dest:${code}:spot:${spotName}" --path="${TMP}" --namespace-id=${NAMESPACE_ID} --remote`, {
          cwd: path.join(__dirname, '..'), stdio: 'pipe', timeout: 30000
        });
        ok++;
      } catch (e) { fail++; }
    }
  }

  if (ok % 50 === 0) console.log(`  ${ok} subidos...`);
}

try { fs.unlinkSync(TMP); } catch (_) {}
console.log(`\nDONE: ${ok} ok, ${fail} fail`);
