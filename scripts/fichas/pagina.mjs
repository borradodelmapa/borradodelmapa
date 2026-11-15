// PÁGINA DE REVISIÓN DE LAS FICHAS DE UN PAÍS (15 nov 2026, caso p-mwfityix43c). 0 €.
//
//   node pagina.mjs np        → docs/fichas/auto/np-revision.html (para publicarla como página privada y que Paco la mire)
//
// Lee las fichas del país (la hecha a mano gana a la automática) y los datos caídos de docs/fichas/auto/<cc>-dudas.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const DIR = path.join(RAIZ, 'worker', 'kv', 'fichas');
const cc = (process.argv[2] || '').toLowerCase();
if (!/^[a-z]{2}$/.test(cc)) { console.log('Uso: node pagina.mjs <código de país, ej. np>'); process.exit(1); }
const PAISES = { np: 'Nepal' };
const fichas = new Map();
for (const d of [path.join(DIR, 'auto'), DIR]) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(x => x.startsWith(cc + '_') && x.endsWith('.json'))) {
    const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
    if (!j.ref) continue;
    if (!Array.isArray(j.sitios)) j.sitios = [];
    const { _nota, ...resto } = j;
    fichas.set(j.ref, { id: j.ref.split(':')[1], ...resto });
  }
}
let caidos = [], coste = '—';
const dudas = path.join(RAIZ, 'docs', 'fichas', 'auto', `${cc}-dudas.md`);
if (fs.existsSync(dudas)) {
  const t = fs.readFileSync(dudas, 'utf8');
  const parte = t.split(/## Datos que se cayeron[^\n]*\n/)[1] || '';
  caidos = parte.split('\n').filter(l => /^\| [^-|]/.test(l) && !/^\| Destino/.test(l)).map(l => l.split('|').slice(1, 5).map(s => s.trim()));
  const m = t.match(/Coste real: \*\*([^*]+)\*\*/); if (m) coste = m[1];
}
const datos = { fichas: [...fichas.values()], caidos, coste };
const html = fs.readFileSync(path.join(AQUI, 'pagina-plantilla.html'), 'utf8')
  .replaceAll('__PAIS__', PAISES[cc] || cc.toUpperCase())
  .replace('/*DATOS*/', () => JSON.stringify(datos).replace(/</g, '\u003c'));
const salida = path.join(RAIZ, 'docs', 'fichas', 'auto', `${cc}-revision.html`);
fs.writeFileSync(salida, html);
console.log(`${datos.fichas.length} fichas → ${path.relative(RAIZ, salida)}`);
