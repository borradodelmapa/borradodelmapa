import { extractRoadQuery } from './road-resolver.js';

// [mensaje, countryHint, esperado]  esperado: null | {kind, ref?/name?}
const CASES = [
  // --- deben detectar ---
  ['hazme una ruta siguiendo la N2 de Chaves a Faro', 'PT', { kind: 'ref', ref: 'EN2' }],
  ['quiero recorrer la N-340 entre Cádiz y Barcelona', 'ES', { kind: 'ref', ref: 'N340' }],
  ['un viaje por la Ruta 40 en Argentina', '', { kind: 'ref', ref: 'RN40' }],
  ['road trip por la Great Ocean Road', '', { kind: 'name', name: 'Great Ocean Road' }],
  ['me flipa la Carretera Austral', '', { kind: 'ref', ref: '7' }],
  ['quiero hacer la Route 66', '', { kind: 'ref', ref: 'US66' }],
  ['sin salirte de la EN2', 'PT', { kind: 'ref', ref: 'EN2' }],
  ['dame una ruta por la Amalfitana', 'IT', { kind: 'ref', ref: 'SS163' }],
  ['sin salirme de la A-24', 'PT', { kind: 'ref', ref: 'A24' }],
  ['coge la carretera 63 y tira p’arriba', 'NO', { kind: 'ref', ref: '63' }],
  ['ruta por el Transfagarasan', 'RO', { kind: 'ref', ref: 'DN7C' }],
  ['la ring road de Islandia en 7 días', '', { kind: 'ref', ref: '1' }],
  ['North Coast 500 en moto', '', { kind: 'name', name: 'North Coast 500' }],
  // --- NO deben detectar (falsos positivos) ---
  ['quiero 3 días en Málaga', 'ES', null],
  ['tengo 40 euros de presupuesto', 'AR', null],
  ['una ruta de 2 semanas por el sur', 'PT', null],
  ['a 40 km de la costa', 'ES', null],
  ['dame una ruta por Andalucía', 'ES', null],
  ['sígueme la corriente', '', null],
];

let ok = 0, fail = 0;
for (const [msg, cc, exp] of CASES) {
  const got = extractRoadQuery(msg, cc);
  let pass;
  if (exp === null) pass = got === null;
  else pass = got && got.kind === exp.kind &&
    (exp.ref ? got.ref === exp.ref : true) &&
    (exp.name ? got.name === exp.name : true);
  console.log(`${pass ? '·' : '✗'} "${msg}"`);
  if (!pass) console.log(`     esperado ${JSON.stringify(exp)}  ·  obtuve ${JSON.stringify(got)}`);
  else if (got) console.log(`     -> ${got.kind} ${got.ref || got.name}  cands=${(got.refCandidates || []).join('|') || '-'}  país=${got.country || '-'}`);
  pass ? ok++ : fail++;
}
console.log(`\n${ok}/${ok + fail} OK`);
process.exit(fail ? 1 : 0);
