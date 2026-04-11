/**
 * Backup completo de Cloudflare KV → archivo JSON local
 * Descarga TODAS las claves del namespace y las guarda en worker/kv/backups/
 *
 * Uso:
 *   node backup-kv.js                      → backup completo
 *   node backup-kv.js --prefix transport   → solo claves con prefijo "transport"
 *   node backup-kv.js --upload-r2          → backup + sube a R2
 *
 * Requiere: wrangler autenticado (wrangler login)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NAMESPACE_ID = 'b2056c0613d94feb955b92279ba02fb6';

async function main() {
  const args = process.argv.slice(2);
  const uploadR2 = args.includes('--upload-r2');
  const prefixIdx = args.indexOf('--prefix');
  const prefix = prefixIdx >= 0 ? args[prefixIdx + 1] : null;

  console.log(`\n📦 Backup KV${prefix ? ` (prefix: ${prefix})` : ' completo'}...\n`);

  // 1. Listar claves
  let listCmd = `wrangler kv key list --namespace-id=${NAMESPACE_ID} --remote`;
  if (prefix) listCmd += ` --prefix="${prefix}"`;

  console.log('  Listando claves...');
  const keysRaw = execSync(listCmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  const keys = JSON.parse(keysRaw).map(k => k.name);

  // Filtrar claves efímeras
  const filtered = keys.filter(k =>
    !k.startsWith('geo:') && !k.startsWith('geocity:') &&
    !k.startsWith('sos_rate:') && !k.startsWith('_cache:')
  );

  console.log(`  ${filtered.length} claves (${keys.length - filtered.length} efímeras excluidas)\n`);

  // 2. Descargar valores (de 1 en 1, wrangler no tiene bulk get)
  const backup = {};
  for (let i = 0; i < filtered.length; i++) {
    const key = filtered[i];
    try {
      const value = execSync(
        `wrangler kv key get "${key}" --namespace-id=${NAMESPACE_ID} --remote`,
        { encoding: 'utf-8', maxBuffer: 1024 * 1024 }
      );
      try { backup[key] = JSON.parse(value); }
      catch { backup[key] = value; }
    } catch (e) {
      console.log(`  ⚠️ Error leyendo ${key}`);
    }
    process.stdout.write(`  ${i + 1}/${filtered.length}\r`);
  }

  // 3. Guardar
  const backupsDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const filename = `kv-backup-${date}.json`;
  const filepath = path.join(backupsDir, filename);

  const meta = {
    date,
    timestamp: Date.now(),
    total_keys: Object.keys(backup).length,
    prefixes: {},
  };
  for (const key of Object.keys(backup)) {
    const p = key.split(':')[0];
    meta.prefixes[p] = (meta.prefixes[p] || 0) + 1;
  }

  const output = { _meta: meta, data: backup };
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
  const sizeKB = (fs.statSync(filepath).size / 1024).toFixed(1);

  console.log(`\n\n✅ Backup guardado: ${filepath}`);
  console.log(`   ${meta.total_keys} claves, ${sizeKB} KB\n`);

  // Resumen por prefijo
  console.log('  Prefijos:');
  Object.entries(meta.prefixes).sort((a, b) => b[1] - a[1]).forEach(([p, n]) => {
    console.log(`    ${p}: ${n}`);
  });

  // 4. Subir a R2 si se pide
  if (uploadR2) {
    console.log(`\n  Subiendo a R2...`);
    try {
      execSync(
        `wrangler r2 object put salma-photos/backups/kv/${filename} --file="${filepath}" --content-type="application/json"`,
        { encoding: 'utf-8' }
      );
      console.log(`  ✅ Subido a R2: backups/kv/${filename}`);
    } catch (e) {
      console.log(`  ❌ Error subiendo a R2: ${e.message}`);
    }
  }

  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
