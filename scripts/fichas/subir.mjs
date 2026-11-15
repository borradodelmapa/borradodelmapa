// SUBIR FICHAS A LA APP (15 nov 2026, caso p-mwfityix43c). Pone en el KV de producción `ficha:<ref>` de cada ficha y
// `fichas:indice` (el buscador). Solo escribe esas claves: no borra ni toca ninguna otra. Coste: 0 € (KV de Cloudflare).
//
//   node subir.mjs np          → las fichas de Nepal + el índice entero
//   node subir.mjs --indice    → solo el índice
//
// Antes: node indice.mjs (rehace el índice) y node probar-buscador.mjs (tiene que dar todo ✅). Este programa los pasa solo.
// La hecha a mano (worker/kv/fichas/<cc>_<id>.json) gana a la automática (worker/kv/fichas/auto/).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const WORKER = path.join(RAIZ, 'worker');
const DIR = path.join(WORKER, 'kv', 'fichas');
const args = process.argv.slice(2);
const soloIndice = args.includes('--indice');
const cc = (args.find(a => !a.startsWith('--')) || '').toLowerCase();
if (!soloIndice && !/^[a-z]{2}$/.test(cc)) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 8).join('\n')); process.exit(1); }

execSync('node indice.mjs', { cwd: AQUI, stdio: 'ignore' });
execSync('node probar-buscador.mjs', { cwd: AQUI, stdio: 'inherit' });   // si falla, se para aquí

const espera = ms => new Promise(r => setTimeout(r, ms));
async function poner(clave, fichero) {
  for (let i = 1; i <= 5; i++) {
    try {
      execSync(`npx wrangler kv key put "${clave}" --path "${fichero}" --binding SALMA_KB --remote -c wrangler.toml`, { cwd: WORKER, stdio: 'pipe' });
      console.log('  ✓ ' + clave);
      return;
    } catch (e) { if (i === 5) throw new Error('no se pudo subir ' + clave); await espera(15000); }
  }
}
if (!soloIndice) {
  const fichas = new Map();
  for (const d of [path.join(DIR, 'auto'), DIR]) {
    for (const f of fs.readdirSync(d).filter(x => x.startsWith(cc + '_') && x.endsWith('.json'))) {
      const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
      if (j.ref) fichas.set(j.ref, path.join(d, f));
    }
  }
  console.log(`\nSubiendo ${fichas.size} fichas de ${cc}:`);
  for (const [ref, f] of fichas) await poner('ficha:' + ref, f);
}
console.log('\nSubiendo el índice:');
await poner('fichas:indice', path.join(DIR, 'indice.json'));
console.log('\nHecho. El Worker relee el índice en 10 minutos como mucho.');
