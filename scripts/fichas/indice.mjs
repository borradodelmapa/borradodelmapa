// ÍNDICE DEL BUSCADOR DE FICHAS (15 nov 2026, caso p-mwfityix43c). Lo lee el Worker como `fichas:indice` (buscarFichas).
//
//   node indice.mjs            → escribe worker/kv/fichas/indice.json (no sube nada)
//
// Por ficha (worker/kv/fichas/*.json a mano y worker/kv/fichas/auto/*.json; la hecha a mano gana si hay las dos):
//   nombres = nombre de la ficha (y sus partes entre paréntesis) + palabras clave de su ficha de abril + alias.json,
//   en minúsculas y sin acentos, quitando las que solo son palabras genéricas («parque nacional», «safari nepal»…)
//   o llevan el nombre del país (servirían para cualquier sitio del país).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(RAIZ, 'worker', 'kv', 'fichas');
const SPOTS = path.join(RAIZ, 'worker', 'kv', 'output-spots');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const GENERICAS = new Set('parque nacional national park lago lake valle valley circuito circuit campo base templo temple ciudad city playa beach isla island monte mount montana mountain rio river reserva reserve safari trekking trek ruta route plaza square palacio palace museo museum mercado market cascada falls cueva cave mirador viewpoint pueblo village aldea barrio casco antiguo old town centro historico historic de del la el las los y en of the and rinoceronte rhino tigre tiger bengala elefante elephant budismo budista buddha buda hindu jungla jungle selva himalaya terai'.split(' '));
const PAISES = { np: ['nepal'] };
// Nombres que suenan a sitio pero valen para muchos (hay una «Durbar Square» en cada ciudad del valle, «lakeside» en cualquier lago).
const AMBIGUOS = new Set(['durbar square', 'lakeside', 'tamang', 'peregrinacion budista', 'arte newar']);

const alias = JSON.parse(fs.readFileSync(path.join(DIR, 'alias.json'), 'utf8'));
const fichas = new Map();   // ref → ficha (la hecha a mano gana)
for (const d of [path.join(DIR, 'auto'), DIR]) {
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter(x => x.endsWith('.json') && !['alias.json', 'indice.json'].includes(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
    if (j.ref) fichas.set(j.ref, j);
  }
}
const spotsPorRef = new Map();
for (const f of fs.readdirSync(SPOTS)) {
  try { const j = JSON.parse(fs.readFileSync(path.join(SPOTS, f), 'utf8')); spotsPorRef.set(f.slice(0, 2) + ':' + j.id, j); } catch (_) {}
}
const indice = [];
for (const [ref, fi] of fichas) {
  const cc = ref.split(':')[0];
  const paises = PAISES[cc] || [];
  const spot = spotsPorRef.get(ref);
  const brutos = [fi.nombre, ...(String(fi.nombre).match(/\(([^)]+)\)/g) || []).map(x => x.slice(1, -1)), String(fi.nombre).replace(/\([^)]*\)/g, ''),
    spot && spot.nombre, ...((spot && spot.keywords) || []), ...(alias[ref] || [])];
  const n = [...new Set(brutos.map(norm).filter(x => x.length >= 4
    && !x.split(' ').every(w => GENERICAS.has(w))
    && !AMBIGUOS.has(x)
    && !paises.some(p => x.split(' ').includes(p))))];
  indice.push({ r: ref, n });
}
// Un nombre que tienen dos o más fichas no sirve para elegir (ej. «valle de katmandu»): fuera de todas.
const cuenta = new Map(); indice.forEach(e => e.n.forEach(x => cuenta.set(x, (cuenta.get(x) || 0) + 1)));
indice.forEach(e => { e.n = e.n.filter(x => cuenta.get(x) === 1); });
indice.sort((a, b) => a.r.localeCompare(b.r));
fs.writeFileSync(path.join(DIR, 'indice.json'), JSON.stringify(indice, null, 1) + '\n');
console.log(`${indice.length} fichas en el índice:`);
for (const e of indice) console.log(`  ${e.r.padEnd(26)} ${e.n.join(' · ')}`);
