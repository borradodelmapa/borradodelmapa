#!/usr/bin/env node
// Prueba LOCAL (0 €, sin APIs) de la regla «N días: ¿viaje o pregunta?» (caso rev-no_contesta_primero, 12 oct 2026).
// Carga isRouteRequest / isDaysDestination / diasAmbiguos del Worker de ANTES (git HEAD) y de AHORA (el fichero) y
// compara frases de guía y frases con «N días» que no lo son. Lo que NO prueba: lo que contesta gpt-4o-mini en las dudosas.
//   node scripts/prueba-dias-ambiguos.cjs [ref-antes=HEAD]
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const RAIZ = path.resolve(__dirname, '..');
const ref = process.argv[2] || 'HEAD';
const antes = execSync(`git show ${ref}:worker/salma-worker.js`, { cwd: RAIZ, maxBuffer: 64 << 20 }).toString('utf8');
const ahora = fs.readFileSync(path.join(RAIZ, 'worker/salma-worker.js'), 'utf8');

function trozo(src, inicio) {           // desde `inicio` hasta cerrar sus llaves
  const i = src.indexOf(inicio); if (i < 0) return '';
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); }
  return '';
}
function cargar(src) {
  const piezas = ['function isHelpRequest', 'function isNearbySearch', 'function isRouteRequest', 'function isDaysDestination', 'function diasAmbiguos']
    .map(n => trozo(src, n)).filter(Boolean);
  const pre = (src.match(/const _msgsPregunta[^\n]*\n(?:const _[A-Z_]+RE = [^\n]*\n)*/) || [''])[0];
  const f = new Function(`${pre}\n${piezas.join('\n')}\nreturn { isRouteRequest, isDaysDestination, isHelpRequest, diasAmbiguos: typeof diasAmbiguos === 'function' ? diasAmbiguos : null, set: typeof _msgsPregunta !== 'undefined' ? _msgsPregunta : null };`);
  return f();
}
const A = cargar(antes), B = cargar(ahora);

const banco = JSON.parse(fs.readFileSync(path.join(__dirname, 'banco-salma/preguntas.json'), 'utf8'));
const delBanco = (Array.isArray(banco) ? banco : banco.preguntas).map(x => x.mensaje).filter(Boolean);
const guias = [...delBanco,
  '3 días en Cádiz', '5 días en Tailandia', 'Cádiz 3 días', 'un día en Estepona', 'dos días en Lisboa', 'Salma 4 días en Roma',
  'hazme una ruta de 4 días por Asturias', 'quiero una guía de 7 días en Japón', 'planea 10 días por Vietnam en moto',
  'ruta de 15 días por la Toscana en coche', 'itinerario de 3 días en Granada con niños', 'organízame 5 días en Sevilla',
  'me voy 15 días a Tailandia, prepárame un plan', 'qué ver en 2 días en Bilbao', 'road trip de 8 días por Portugal',
  'escapada de 3 días a Ronda', 'Salma hazme una guía: Estepona un día', 'quiero hacer la Transpirenaica en moto en 5 días',
  'voy a pasar 4 días en Ciudad Real y quiero ver lo mejor', 'viaje de 12 días por Marruecos en camper'];
const preguntas = [
  'Salma mírame el camping río Jara lo que cuesta ahora 15 días', 'dame precios 15 días en el camping río Jara tarifa',
  'cuánto cuesta el visado para Tailandia si me quedo 30 días', 'cuánto vale alquilar un coche 5 días en Málaga',
  'qué tiempo va a hacer los próximos 3 días en Bilbao', 'el hotel Miramar tiene habitación libre 4 días en agosto',
  'cuánto cuesta el parking del aeropuerto 7 días', 'hasta cuándo es válido el billete si lo uso en 10 días'];

const f = (v) => v ? 'sí' : 'no';
let cambios = 0, rotas = 0, aLLM = [];
console.log(`Antes = ${ref}  ·  Ahora = fichero actual\n`);
console.log('── FRASES DE GUÍA (deben seguir igual, y sin llamar a ningún modelo) ──');
for (const m of guias) {
  const a = [A.isRouteRequest(m, []), A.isDaysDestination(m)], b = [B.isRouteRequest(m, []), B.isDaysDestination(m)];
  const amb = B.diasAmbiguos ? B.diasAmbiguos(m) : false;
  const igual = a[0] === b[0] && a[1] === b[1];
  if (!igual) { rotas++; console.log(`  🔴 CAMBIA  «${m}»  ruta ${f(a[0])}→${f(b[0])}  días ${f(a[1])}→${f(b[1])}`); }
  if (amb) { aLLM.push(m); console.log(`  🟠 DUDOSA (iría al clasificador)  «${m}»`); }
}
console.log(rotas ? `  → ${rotas} guías CAMBIAN` : `  → las ${guias.length} frases dan EXACTAMENTE lo mismo que antes`);
console.log(`  → ${aLLM.length} de ${guias.length} frases de guía irían al clasificador${aLLM.length ? ' (revisar las 🟠)' : ''}\n`);
console.log('── FRASES CON «N días» QUE NO SON GUÍA ──');
for (const m of preguntas) {
  const a = A.isRouteRequest(m, []) || A.isDaysDestination(m), amb = B.diasAmbiguos(m);
  console.log(`  ${amb ? '🟠 va al clasificador' : '⚪ se queda como antes '}  antes: ${a ? 'modo viaje' : 'chat'}  «${m}»`);
}
// El caso del camping con el clasificador diciendo «pregunta»: ¿sale del modo viaje?
const cam = preguntas[0]; B.set.add(cam);
console.log(`\nCamping con veredicto «pregunta» → modo viaje: ${f(B.isRouteRequest(cam, []) || B.isDaysDestination(cam))} (debe ser no)`);
B.set.delete(cam);
process.exit(rotas ? 1 : 0);
