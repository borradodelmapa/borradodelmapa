/**
 * Subida de fichas a KV usando wrangler CLI (no necesita API token manual)
 * Genera un archivo JSON bulk y lo sube con wrangler kv bulk put
 *
 * Uso:
 *   node upload-wrangler.js              → sube nivel 1 + nivel 2 + nivel 2.5
 *   node upload-wrangler.js --nivel1     → solo nivel 1
 *   node upload-wrangler.js --nivel2     → solo nivel 2
 *   node upload-wrangler.js --nivel25    → solo nivel 2.5
 *   node upload-wrangler.js --dry-run    → solo muestra stats
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const BATCH_SIZE = 500; // wrangler bulk acepta hasta 10000

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyNivel1 = args.includes('--nivel1');
const onlyNivel2 = args.includes('--nivel2');
const onlyNivel25 = args.includes('--nivel25');
const hasFilter = onlyNivel1 || onlyNivel2 || onlyNivel25;
const doNivel1 = hasFilter ? onlyNivel1 : true;
const doNivel2 = hasFilter ? onlyNivel2 : true;
const doNivel25 = hasFilter ? onlyNivel25 : true;

async function main() {
  const kvPairs = [];

  // ── NIVEL 1: Fichas de país ──
  if (doNivel1) {
    const outputDir = path.join(__dirname, 'output');
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));
    console.log(`\n📦 Nivel 1: ${files.length} fichas de país`);

    for (const file of files) {
      const code = file.replace('.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));

      // Ficha completa
      kvPairs.push({ key: `dest:${code}:base`, value: JSON.stringify(data) });

      // Keywords
      if (data.keywords && Array.isArray(data.keywords)) {
        for (const kw of data.keywords) {
          const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          kvPairs.push({ key: `kw:${kwNorm}`, value: code });
        }
      }
    }
  }

  // ── NIVEL 2: Destinos por país ──
  if (doNivel2) {
    const outputDir2 = path.join(__dirname, 'output-nivel2');
    if (fs.existsSync(outputDir2)) {
      const files2 = fs.readdirSync(outputDir2).filter(f => f.endsWith('.json'));
      console.log(`📦 Nivel 2: ${files2.length} países con destinos`);

      for (const file of files2) {
        const code = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(outputDir2, file), 'utf-8'));

        // Array completo de destinos del país
        if (data.destinos) {
          kvPairs.push({ key: `dest:${code}:destinos`, value: JSON.stringify(data.destinos) });

          // Cada destino individual + keywords
          for (const dest of data.destinos) {
            if (dest.id) {
              kvPairs.push({ key: `dest:${code}:spot:${dest.id}`, value: JSON.stringify(dest) });
              kvPairs.push({ key: `spot:${dest.id}`, value: `${code}:${dest.id}` });

              // Keywords del destino
              if (dest.keywords && Array.isArray(dest.keywords)) {
                for (const kw of dest.keywords) {
                  const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                  kvPairs.push({ key: `kw:${kwNorm}`, value: code });
                }
              }
            }
          }
        }
      }
    } else {
      console.log('⚠️ No se encontró output-nivel2/');
    }
  }

  // ── NIVEL 2.5: Info práctica por país ──
  if (doNivel25) {
    const outputDir25 = path.join(__dirname, 'output-nivel25');
    if (fs.existsSync(outputDir25)) {
      const files25 = fs.readdirSync(outputDir25).filter(f => f.endsWith('.json'));
      console.log(`📦 Nivel 2.5: ${files25.length} países con info práctica`);

      for (const file of files25) {
        const code = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(outputDir25, file), 'utf-8'));

        // Info práctica del país — key: dest:{code}:practical
        if (data.practical_info) {
          kvPairs.push({ key: `dest:${code}:practical`, value: JSON.stringify(data.practical_info) });
        }
      }
    } else {
      console.log('⚠️ No se encontró output-nivel25/');
    }
  }

  console.log(`\n📊 Total pares KV: ${kvPairs.length}`);

  if (dryRun) {
    console.log('\n── Primeros 20 pares ──');
    kvPairs.slice(0, 20).forEach(p => {
      const v = p.value.length > 60 ? p.value.substring(0, 60) + '...' : p.value;
      console.log(`   ${p.key} → ${v}`);
    });
    console.log('\n🏁 Dry run completado.');
    return;
  }

  // Subir en lotes con wrangler kv bulk put
  const totalBatches = Math.ceil(kvPairs.length / BATCH_SIZE);
  let uploaded = 0;

  for (let i = 0; i < kvPairs.length; i += BATCH_SIZE) {
    const batch = kvPairs.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const tmpName = `_kv_bulk_${batchNum}.json`;
    const tmpFile = path.join(__dirname, tmpName);

    // Escribir batch a archivo temporal
    fs.writeFileSync(tmpFile, JSON.stringify(batch));

    process.stdout.write(`   ⏳ Lote ${batchNum}/${totalBatches} (${batch.length} pares)...`);

    try {
      const result = execSync(`npx wrangler kv bulk put kv/${tmpName} --namespace-id ${NAMESPACE_ID} --remote 2>&1`, {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf-8',
        timeout: 120000,
      });
      if (!result.includes('Success')) throw new Error(result.trim().split('\n').pop());
      console.log(' ✅');
      uploaded += batch.length;
    } catch (err) {
      console.log(` ❌ ${err.message?.substring(0, 100)}`);
    }

    // Limpiar archivo temporal
    try { fs.unlinkSync(tmpFile); } catch {}
  }

  console.log(`\n✅ Subida completada: ${uploaded}/${kvPairs.length} pares.`);
}

main().catch(console.error);
