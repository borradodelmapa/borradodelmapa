import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';
const outputDir = path.join(__dirname, 'output-nivel2');
const BATCH = 50;
const DELAY = 2000; // ms entre lotes — KV Free plan: 1 req/seg

const sleep = ms => new Promise(r => setTimeout(r, ms));

const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));
const kvPairs = [];

for (const file of files) {
  const code = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf-8'));
  if (!data.destinos) continue;

  // dest:{cc}:destinos — bloque completo del país
  kvPairs.push({ key: `dest:${code}:destinos`, value: JSON.stringify(data.destinos) });

  for (const dest of data.destinos) {
    if (!dest.id) continue;
    // spot:{slug} — destino individual (el más crítico para lookup)
    kvPairs.push({ key: `spot:${dest.id}`, value: JSON.stringify(dest) });
    // keywords → código país
    if (dest.keywords) {
      for (const kw of dest.keywords) {
        const norm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
        kvPairs.push({ key: `kw:${norm}`, value: code });
      }
    }
  }
}

console.log(`\n📦 Total pares KV: ${kvPairs.length}`);
console.log(`   Lotes de ${BATCH} con ${DELAY}ms pausa\n`);

const workerDir = path.join(__dirname, '..');
const tmpFile = path.join(__dirname, '_upload_tmp.json');
let ok = 0, fail = 0;
const totalBatches = Math.ceil(kvPairs.length / BATCH);

for (let i = 0; i < kvPairs.length; i += BATCH) {
  const batch = kvPairs.slice(i, i + BATCH);
  const batchNum = Math.floor(i / BATCH) + 1;
  fs.writeFileSync(tmpFile, JSON.stringify(batch));

  try {
    execSync(`npx wrangler kv bulk put kv/_upload_tmp.json --namespace-id ${NAMESPACE_ID} --remote`, {
      cwd: workerDir, encoding: 'utf-8', timeout: 60000, stdio: 'pipe'
    });
    ok += batch.length;
  } catch (e) {
    const err = (e.stderr || e.stdout || '').replace(/\x1b\[[0-9;]*m/g, '').split('\n').find(l => l.includes('ERROR') || l.includes('error')) || e.message?.slice(0, 80);
    fail += batch.length;
    console.log(`  ❌ Lote ${batchNum}: ${err}`);
  }

  process.stdout.write(`\r  ✅ ${ok} subidos | ❌ ${fail} errores | lote ${batchNum}/${totalBatches}`);
  if (i + BATCH < kvPairs.length) await sleep(DELAY);
}

try { fs.unlinkSync(tmpFile); } catch {}

console.log(`\n\n${'─'.repeat(50)}`);
console.log(`✅ Subidos:  ${ok}/${kvPairs.length}`);
console.log(`❌ Fallidos: ${fail}`);
if (fail === 0) console.log('\n🎉 Nivel 2 completamente en KV.');
else console.log('\nVuelve a ejecutar para reintentar fallidos.');
