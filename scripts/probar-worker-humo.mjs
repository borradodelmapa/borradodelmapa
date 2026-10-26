// PRUEBA DE HUMO DEL WORKER — 0 €, sin red, unos segundos. OBLIGATORIA antes de desplegar (CLAUDE.md §4).
// Carga worker/salma-worker.js ENTERO en local, con todo lo externo (Claude, Google, Firestore, KV) falseado, y le lanza
// peticiones de chat de todos los caminos. Caza los errores de código que tumban el chat para TODOS (22 oct 2026: una
// variable usada antes de crearse → «worker_exception» en cada mensaje durante 80 s). No prueba respuestas: solo que no
// revienta. Con el prompt de siempre y con el único (PROMPT_UNICO="*").
//
//   node scripts/probar-worker-humo.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COPIA = path.join(RAIZ, 'worker', '_humo.mjs');   // dentro de worker/ para que funcionen sus import relativos
const src = fs.readFileSync(path.join(RAIZ, 'worker', 'salma-worker.js'), 'utf8')
  .replace(/(async function verifyAuthAndGetUser\([^)]*\)\s*\{)/, '$1 if (globalThis.__HUMO_USER) return globalThis.__HUMO_USER;');
fs.writeFileSync(COPIA, src);
let mal = 0;
try {
  globalThis.__HUMO_USER = { uid: 'humo', email: 'humo@borradodelmapa.com', plan: 'premium', premium: true };
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'humo' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  const W = (await import(pathToFileURL(COPIA).href)).default;
  const kv = () => { const m = new Map(); return { get: async k => m.get(k) ?? null, put: async (k, v) => { m.set(k, v); }, delete: async k => m.delete(k), list: async () => ({ keys: [], list_complete: true }), getWithMetadata: async k => ({ value: m.get(k) ?? null, metadata: null }) }; };
  const guia = { title: 'Tailandia', country: 'Tailandia', region: 'Tailandia', stops: [
    { name: 'Wat Pho', day: 1, lat: 13.7465, lng: 100.4927, place_id: 'a' }, { name: 'Gran Palacio', day: 1, lat: 13.75, lng: 100.4913, place_id: 'b' },
    { name: 'Wat Phra That Doi Suthep', day: 2, lat: 18.8048, lng: 98.9216, place_id: 'c' }, { name: 'Railay Beach', day: 3, lat: 8.0115, lng: 98.8378, place_id: 'd' },
    { name: 'Maya Bay', day: 4, lat: 7.6776, lng: 98.7661, place_id: 'e' }, { name: 'Chaweng Beach', day: 5, lat: 9.5321, lng: 100.0616, place_id: 'f' } ] };
  const plan = '**Día 1 — Ronda**\n[[Puente Nuevo]] — x.\n[[Plaza de toros de Ronda]] — y.\n'.repeat(20);
  const casos = [
    ['charla', { message: 'háblame de Granada' }],
    ['plan por días', { message: '3 días en Ronda' }],
    ['con GPS', { message: 'farmacia cerca de mí', user_location: { lat: 40.4168, lng: -3.7038 } }],
    ['cómo llegar', { message: 'cómo llego a la Alhambra' }],
    ['guía abierta: pregunta', { message: 'Khao Sok y al rededores', current_route: guia, editing_active_route: true }],
    ['guía abierta: añade', { message: 'añade 2 días en Krabi', current_route: guia, editing_active_route: true }],
    ['edición desde el chat', { message: 'quita la parada 3', current_route: guia }],
    ['última guía + charla', { message: '¿qué tiempo hace en Sevilla?', current_route: guia }],
    ['crear ruta con mapa', { message: 'Salma hazme una guía: 3 días en Ronda', guided_stage: 'map', source_text: plan, dest_hint: 'Ronda' }],
    ['añadir a la guía', { message: 'Salma hazme una guía: Pai', guided_stage: 'map', merge_into_route: true, current_route: guia, source_text: '[[Pai Canyon]] — z. '.repeat(10) }],
    ['ruta desde aquí', { message: 'ruta desde aquí', route_from_here: true, user_location: { lat: 36.72, lng: -4.42 } }],
  ];
  for (const unico of ['', '*']) {
    const env = { SALMA_KB: kv(), ROAD_GEOM: kv(), ANTHROPIC_API_KEY: 'x', OPENAI_API_KEY: 'x', GOOGLE_PLACES_KEY: 'x', PROMPT_UNICO: unico, GOOGLE_LAZY_DETAILS: '1' };
    console.log(`\n── ${unico ? 'prompt ÚNICO' : 'prompt de siempre'} ──`);
    for (const [n, b] of casos) {
      const req = new Request('https://humo/', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer humo' }, body: JSON.stringify({ history: [], stream: true, ...b }) });
      let txt, st = '-';
      try { const res = await W.fetch(req, env, { waitUntil: () => {}, passThroughOnException: () => {} }); st = res.status; txt = await res.text(); }
      catch (e) { txt = 'THROW ' + e.message; }
      const exc = /worker_exception|^THROW|ReferenceError|TypeError|is not defined|before initialization/.test(txt);
      if (exc) mal++;
      console.log(`${exc ? '❌' : '✅'} ${n.padEnd(24)} ${st}${exc ? '  ' + txt.slice(0, 160) : ''}`);
    }
  }
} finally { fs.rmSync(COPIA, { force: true }); }
console.log(mal ? `\n❌ ${mal} CON ERROR DE CÓDIGO — NO DESPLEGAR` : '\n✅ Sin errores de código — se puede desplegar');
process.exitCode = mal ? 1 : 0;
