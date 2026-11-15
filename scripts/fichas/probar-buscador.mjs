// BATERÍA DEL BUSCADOR DE FICHAS (15 nov 2026, caso p-mwfityix43c). 0 €: no llama a nadie.
// Prueba la función buscarFichas DEL WORKER (la copia de worker/salma-worker.js, no otra) con el índice de
// worker/kv/fichas/indice.json. Tiene que dar todo ✅ antes de subir un cambio del buscador o del índice.
//
//   node probar-buscador.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const src = fs.readFileSync(path.join(RAIZ, 'worker', 'salma-worker.js'), 'utf8').replace(/\r\n/g, '\n');
const trozo = (inicio, fin) => { const a = src.indexOf(inicio); const b = src.indexOf(fin, a); if (a < 0 || b < 0) throw new Error('no encuentro ' + inicio); return src.slice(a, b); };
const codigo = trozo('const _normFicha =', 'let _fichasIndice');
const buscarFichas = new Function(codigo + '\nreturn buscarFichas;')();
const indice = JSON.parse(fs.readFileSync(path.join(RAIZ, 'worker', 'kv', 'fichas', 'indice.json'), 'utf8'));

// [frase, país detectado (o ''), fichas esperadas en orden]
const CASOS = [
  ['Hazme un plan de 2 días en Chitwan', 'np', ['np:chitwan']],
  ['Hazme un plan de 2 días en el Parque Nacional de Chitwan, Nepal', 'np', ['np:chitwan']],
  ['2 días en chitwan', '', ['np:chitwan']],
  ['hazme una ruta de 3 dias por chitwan', '', ['np:chitwan']],
  ['safari en Chitwan National Park', '', ['np:chitwan']],
  ['2 dias en Chitwán', '', ['np:chitwan']],
  ['Nepal 10 días: Katmandú, Chitwan y Pokhara', 'np', ['np:kathmandu', 'np:chitwan', 'np:pokhara']],
  ['quiero hacer el trekking al Upper Mustang', 'np', ['np:upper-mustang']],
  ['Ruta por Mustang en 5 días', 'np', ['np:upper-mustang']],
  ['Circuito del Annapurna en 12 días', 'np', ['np:circuito-annapurna']],
  ['quiero ir al campo base del Everest', 'np', ['np:everest-base-camp']],
  ['3 días en Bhaktapur y Patan', 'np', ['np:bhaktapur', 'np:patan']],
  ['Lumbini, donde nació Buda', '', ['np:lumbini']],
  ['qué ver en el valle de Langtang', 'np', ['np:langtang']],
  ['Pokhara 2 dias', '', ['np:pokhara']],
  // No deben encontrar nada (o no lo que no toca)
  ['Hazme un plan de 2 días en Ronda', 'es', []],
  ['Parque Nacional de Doñana en 2 días', 'es', []],
  ['10 días por Nepal', 'np', []],
  ['un lago bonito para remar', '', []],
  ['templo de Debod en Madrid', 'es', []],
  ['patanegra y jamón en Guijuelo', 'es', []],
  ['estoy en Lalín', 'es', []],
];
let bien = 0;
for (const [frase, cc, esperado] of CASOS) {
  const r = buscarFichas(frase, indice, cc);
  const ok = r.length === esperado.length && esperado.every(x => r.includes(x));
  if (ok) bien++;
  console.log(`${ok ? '✅' : '❌'} «${frase}»${cc ? ' [' + cc + ']' : ''} → ${r.join(', ') || '—'}${ok ? '' : '   (esperaba: ' + (esperado.join(', ') || '—') + ')'}`);
}
console.log(`\nBuscador de fichas: ${bien} de ${CASOS.length} bien`);
process.exit(bien === CASOS.length ? 0 : 1);
