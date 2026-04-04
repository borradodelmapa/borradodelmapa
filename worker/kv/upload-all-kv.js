#!/usr/bin/env node
/**
 * Sube todos los datos KV (nivel 1, 2, 2.5) a Cloudflare KV
 * Ejecutar: node upload-all-kv.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_NIVEL2_DIR = path.join(__dirname, 'output-nivel2');
const OUTPUT_NIVEL25_DIR = path.join(__dirname, 'output-nivel25');

function putKV(key, value) {
  const escaped = typeof value === 'string' ? value : JSON.stringify(value);
  const tmpFile = path.join(__dirname, '_tmp_kv.json');
  fs.writeFileSync(tmpFile, escaped);
  try {
    execSync(`npx wrangler kv key put "${key}" --path="${tmpFile}" --namespace-id=${NAMESPACE_ID}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
      timeout: 30000,
    });
    return true;
  } catch (e) {
    console.error(`  ❌ Error subiendo ${key}: ${e.message?.slice(0, 100)}`);
    return false;
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
}

async function main() {
  let uploaded = 0;
  let failed = 0;
  const countriesIndex = [];

  // 1. Nivel 1 — datos base del país
  console.log('\n📦 Subiendo nivel 1 (base)...');
  const nivel1Files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json'));
  for (const file of nivel1Files) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
    const key = `dest:${code}:base`;
    process.stdout.write(`  ${code} (${data.pais || '?'})...`);
    if (putKV(key, data)) {
      uploaded++;
      console.log(' ✅');

      // Añadir keyword mappings
      const pais = (data.pais || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (pais) {
        putKV(`kw:${pais}`, code);
        // Variantes comunes
        if (pais !== code) putKV(`kw:${code}`, code);
      }

      countriesIndex.push({ code, name: data.pais, capital: data.capital });
    } else {
      failed++;
      console.log(' ❌');
    }
  }

  // 2. Nivel 2 — destinos
  console.log('\n📦 Subiendo nivel 2 (destinos)...');
  const nivel2Files = fs.readdirSync(OUTPUT_NIVEL2_DIR).filter(f => f.endsWith('.json'));
  for (const file of nivel2Files) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_NIVEL2_DIR, file), 'utf8'));
    const key = `dest:${code}:destinos`;
    process.stdout.write(`  ${code}...`);
    if (putKV(key, data)) {
      uploaded++;
      console.log(' ✅');

      // Crear spot entries para cada destino
      if (data.destinos && Array.isArray(data.destinos)) {
        for (const dest of data.destinos) {
          const spotName = (dest.nombre || dest.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
          if (spotName) {
            putKV(`spot:${spotName}`, `${code}:${spotName}`);
            putKV(`dest:${code}:spot:${spotName}`, JSON.stringify(dest));
          }
        }
      }
    } else {
      failed++;
      console.log(' ❌');
    }
  }

  // 3. Nivel 2.5 — info práctica
  console.log('\n📦 Subiendo nivel 2.5 (practical)...');
  const nivel25Files = fs.readdirSync(OUTPUT_NIVEL25_DIR).filter(f => f.endsWith('.json'));
  for (const file of nivel25Files) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(OUTPUT_NIVEL25_DIR, file), 'utf8'));
    const key = `dest:${code}:practical`;
    process.stdout.write(`  ${code}...`);
    if (putKV(key, data)) {
      uploaded++;
      console.log(' ✅');
    } else {
      failed++;
      console.log(' ❌');
    }
  }

  // 4. Índice de países
  console.log('\n📦 Subiendo índice de países...');
  putKV('_index:countries', JSON.stringify(countriesIndex));

  console.log(`\n✅ Subidos: ${uploaded} | ❌ Fallidos: ${failed}`);
}

main().catch(console.error);
