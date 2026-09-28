// Prueba del buscador de enlaces del chat (caso p-mul559lkvkr): 12 casos con Google y gpt-4o-mini REALES, sin login
// ni web. KV: lee la real, escribe solo en memoria. Coste por pasada: 0,20-0,60 € (avisar a Paco). Uso, desde worker:
//   cp salma-worker.js _prueba-salma-worker.js ; echo "export { resolveChatPlaces };" >> _prueba-salma-worker.js
//   cp ../scripts/prueba-buscador-enlaces/entry.js _prueba-enlaces-entry.js
//   sed -e "s/^main = .*/main = \"_prueba-enlaces-entry.js\"/" -e "/^\[triggers\]/,/^crons/d" wrangler.toml > _prueba-wrangler.toml
//   npx wrangler dev -c _prueba-wrangler.toml --remote --port 8799   →   curl.exe -s http://127.0.0.1:8799/
//   (al terminar: borrar los tres _prueba-*; están en .gitignore)
import { resolveChatPlaces } from './_prueba-salma-worker.js';

const km = (a, b, c, d) => { const R = 6371, r = x => x * Math.PI / 180; const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const MADRID = { lat: 40.4168, lng: -3.7038 }, GRANADA = { lat: 37.1773, lng: -3.5986 }, VALENCIA = { lat: 39.4699, lng: -0.3763 }, ALICANTE = { lat: 38.3452, lng: -0.4810 };
// esperado: { lat, lng } = debe salir un sitio a <35 km de ahí · 'nada' = no debe salir enlace · 'nada-o-cerca' = nada o a <35 km del GPS
const CASOS = [
  { id: 'alhambra-gps-madrid', n: 'Alhambra', msg: '¿Cómo llego a la Alhambra?', gps: MADRID, ciudad: 'Madrid', esperado: GRANADA, id_ok: 'ChIJO7l_l7f8cQ0Rf6IhEu_RjYA' },
  { id: 'alhambra-gps-granada', n: 'Alhambra', msg: '¿Cómo llego a la Alhambra?', gps: GRANADA, ciudad: 'Granada', esperado: GRANADA, id_ok: 'ChIJO7l_l7f8cQ0Rf6IhEu_RjYA' },
  { id: 'alhambra-sin-gps', n: 'Alhambra', msg: 'cómo llego a la Alhambra en camper', esperado: GRANADA, id_ok: 'ChIJO7l_l7f8cQ0Rf6IhEu_RjYA' },
  { id: 'mercado-central-valencia', n: 'Mercado Central', msg: '¿Cómo llego al Mercado Central?', gps: VALENCIA, ciudad: 'Valencia', esperado: VALENCIA },
  { id: 'mercado-central-alicante', n: 'Mercado Central', msg: '¿Cómo llego al Mercado Central?', gps: ALICANTE, ciudad: 'Alicante', esperado: ALICANTE },
  { id: 'mercado-triana-gps-madrid', n: 'Mercado de Triana', msg: 'cómo llego al Mercado de Triana', gps: MADRID, ciudad: 'Madrid', esperado: { lat: 37.3862, lng: -6.0027 } },
  { id: 'eiffel-gps-madrid', n: 'Torre Eiffel', msg: '¿Cómo llego a la Torre Eiffel?', gps: MADRID, ciudad: 'Madrid', esperado: { lat: 48.8584, lng: 2.2945 } },
  { id: 'belem-ruta-lisboa-gps-madrid', n: 'Torre de Belém', msg: '¿cómo llego a la Torre de Belém?', gps: MADRID, ciudad: 'Madrid', destino: 'Lisboa', esperado: { lat: 38.6916, lng: -9.2160 } },
  { id: 'san-nicolas-destino-granada', n: 'Mirador de San Nicolás', msg: 'dónde está el Mirador de San Nicolás', destino: 'Granada', esperado: GRANADA },
  { id: 'casa-pepe-gps-madrid', n: 'Casa Pepe', msg: 'cómo llego a Casa Pepe', gps: MADRID, ciudad: 'Madrid', esperado: 'nada-o-cerca' },
  { id: 'aeropuerto-taxi-madrid', n: 'aeropuerto', msg: 'necesito un taxi al aeropuerto', gps: MADRID, ciudad: 'Madrid', esperado: { lat: 40.4983, lng: -3.5676 }, days: 3 },
  { id: 'inventado', n: 'Palacio de Cristal Morado de Zamora', msg: 'cómo llego al Palacio de Cristal Morado de Zamora', esperado: 'nada' },
];

function memKV(real) {
  const mem = new Map();
  return {
    async get(k) { if (mem.has(k)) return mem.get(k); try { return await real.get(k); } catch (_) { return null; } },
    async put(k, v) { mem.set(k, v); },
  };
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    const solo = u.searchParams.get('caso');
    const envT = { ...env, SALMA_KB: memKV(env.SALMA_KB) };
    const out = [];
    for (const c of CASOS) {
      if (solo && c.id !== solo) continue;
      const ctx = { message: c.msg, history: [], userLocation: c.gps || null, userLocationName: c.ciudad || null, destino: c.destino || '', incidents: [] };
      const t0 = Date.now();
      let v = null, err = null;
      try { v = (await resolveChatPlaces([c.n], ctx, envT, c.days || 1)).get(c.n) || null; } catch (e) { err = e.message; }
      let pasa, dist = null;
      if (c.esperado === 'nada') pasa = !v;
      else if (c.esperado === 'nada-o-cerca') { dist = v ? km(v.lat, v.lng, c.gps.lat, c.gps.lng) : null; pasa = !v || dist < 35; }
      else { dist = v ? km(v.lat, v.lng, c.esperado.lat, c.esperado.lng) : null; pasa = !!v && dist < 35 && (!c.id_ok || v.place_id === c.id_ok); }
      out.push({ caso: c.id, pasa, ciudad_localizador: (ctx.cities || {})[c.n] || null, sitio: v ? v.name : null, place_id: v ? v.place_id : null,
        km_al_esperado: dist == null ? null : Math.round(dist * 10) / 10, rechazos: ctx.incidents.map(i => i.reason + ' ' + i.replacement_url), ms: Date.now() - t0, err });
    }
    return new Response(JSON.stringify({ ok: out.filter(x => x.pasa).length + '/' + out.length, out }, null, 1), { headers: { 'Content-Type': 'application/json' } });
  },
};
