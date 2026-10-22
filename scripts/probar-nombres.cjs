// Pruebas de la comparación de nombres de sitios (strictNameMatch del Worker) — 0 €, sin red.
// Es LA ÚNICA comparación que usan guías, enlaces y fotos del chat y /photo: cualquier cambio en ella se prueba aquí.
//
//   node scripts/probar-nombres.cjs
//
// Cada caso: [lo que pide Salma/la guía, lo que contesta Google, ¿es el mismo sitio?]. Casos reales de los fallos
// (Tailandia, Filipinas, estación abandonada, Pig Island) — añadir aquí cada fallo nuevo antes de arreglarlo.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'worker', 'salma-worker.js'), 'utf8');
function cogerFuncion(nombre) {
  const i = src.indexOf('function ' + nombre + '(');
  if (i < 0) throw new Error('No encuentro la función ' + nombre + ' en salma-worker.js');
  let d = 0;
  for (let k = src.indexOf('{', i); k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1);
  }
}
function cogerConst(nombre) {
  const i = src.indexOf('const ' + nombre + ' =');
  if (i < 0) throw new Error('No encuentro ' + nombre);
  return src.slice(i, src.indexOf(';\n', i) + 1);
}
const codigo = ['_NOMBRE_SINONIMOS', '_NOMBRE_GENERICAS', '_NOMBRE_VACIAS', '_NOMBRE_NEGOCIO'].map(cogerConst).join('\n') + '\n'
  + ['normalizeForMatch', '_nombreTokens', '_nombresEquivalentes', '_primeraPropiaEnGoogle', 'strictNameMatch', '_strictNameMatchPalabras'].map(cogerFuncion).join('\n');
const { strictNameMatch } = new Function(codigo + '\nreturn { strictNameMatch };')();

const CASOS = [
  // ── Tienen que PASAR (mismo sitio, otro idioma u otra forma de escribirlo) ──
  ['Khao Sok National Park Thailand', 'Parque Nacional de Khao Sok', true],
  ['Khao Sok Tailandia', 'Parque Nacional de Khao Sok', true],
  ['Parque Nacional Khao Sok', 'Khao Sok National Park', true],
  ['Cheow Lan Lake Khao Sok', 'Lago Cheow Lan', true],
  ['Lago Cheow Lan Tailandia', 'Cheow Lan Lake', true],
  ['Grand Palace Bangkok', 'Gran Palacio', true],
  ['Gran Palacio Bangkok', 'Grand Palace', true],
  ['Wat Pho Bangkok', 'Wat Pho', true],
  ['Doi Suthep Chiang Mai', 'Wat Phra That Doi Suthep', true],
  ['Ha Long Bay Vietnam', 'Bahía de Ha-Long', true],
  ['Eiffel Tower Paris', 'Torre Eiffel', true],
  ['Torre Eiffel París', 'Torre Eiffel', true],
  ['Cueva de Nam Talu Khao Sok', 'Nam Talu Cave', true],
  ['Phi Phi Islands Krabi', 'Islas Phi Phi', true],
  ['Alhambra Granada España', 'La Alhambra', true],
  ['Sagrada Familia Barcelona', 'Basílica de la Sagrada Familia', true],
  ['Koh Madsum', 'Ko Madsum', true],
  ['Chocolate Hills Bohol', 'Colinas de Chocolate', false], // sin traducción de «chocolate hills» → no se adivina (sin foto, nunca la equivocada)
  ['Siquijor', 'Siquijor', true],
  ['Cascadas de Kawasan', 'Kawasan Falls', true],
  ['Kawasan Falls Cebu', 'Cascadas de Kawasan', true],
  ['Twin Lagoon Coron', 'Twin Lagoon', true],
  ['Lago Kayangan', 'Kayangan Lake', true],
  ['Mercado de Warorot', 'Warorot Market', true],
  ['Puente Nuevo Ronda', 'Puente Nuevo', true],
  ['Intramuros', 'Intramuros', true],
  // ── Tienen que FALLAR (otro sitio) ──
  ['Koh Madsum Pig Island', 'Pig Island Thailand (Koh Madsum) - Koh Samui Office', false],
  ['Estación de tren abandonada de Canfranc', 'Hotel La Estación', false],
  ['Isla Gran Laguna El Nido', 'Pagbilao Grande Island', false],
  ['Mercado de Triana Sevilla', 'Sevilla', false],
  ['Wat Arun Bangkok', 'Wat Pho', false],
  ['Alhambra Granada', 'Parking Alhambra Tours', false],
  ['Playa de la Concha San Sebastián', 'Playa de Ondarreta', false],
  ['Cascada de Tappiya', 'Cascada de Bomod-ok', false],
  ['Parque Nacional de Doñana', 'Parque Nacional de Ordesa', false],
  ['Lago Kayangan', 'Lago Barracuda', false],
];

// Parejas REALES que el chat dio por buenas (registro de enlaces, casos.cjs enlaces): tienen que seguir pasando todas.
for (const [pedido, google] of JSON.parse(fs.readFileSync(path.join(__dirname, 'probar-nombres-reales.json'), 'utf8'))) CASOS.push([pedido, google, true]);

let mal = 0;
for (const [pedido, google, debe] of CASOS) {
  const sale = strictNameMatch(pedido, google);
  const ok = sale === debe;
  if (!ok) mal++;
  console.log(`${ok ? '✅' : '❌'} ${debe ? 'PASA ' : 'FALLA'} ${pedido.padEnd(40)} → ${google}${ok ? '' : `   (sale ${sale})`}`);
}
console.log(`\n${CASOS.length - mal} de ${CASOS.length} bien${mal ? ` — ${mal} MAL` : ''}`);
process.exitCode = mal ? 1 : 0;
