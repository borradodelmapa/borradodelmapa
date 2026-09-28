// Prueba del INTÉRPRETE de frases del chat (caso p-mul559lkvkr): ~28 formas de pedir (o no) un sitio, con gpt-4o-mini
// y Google REALES, sin login ni web. Reproduce la decisión del Worker: ¿atajo con enlace?, ¿enlaces en la respuesta de
// Salma?, ¿a qué sitio? — y, si hay atajo, qué sitio real sale. KV: lee la real, escribe solo en memoria.
// Coste por pasada: ~0,01 cént. por frase (IA) + Google solo en los atajos con sitio nuevo (céntimos). Uso: igual que
// entry.js, exportando además mightAskForPlace e interpretPlaceRequest:
//   echo "export { resolveChatPlaces, mightAskForPlace, interpretPlaceRequest, findVehicleParking };" >> _prueba-salma-worker.js
// Caso p-mul9bn4uc1c: 'medio' (taxi → botones de Bolt/Uber; camper/coche/moto → buscar dónde dejarlo junto al sitio).
// Las frases con vehículo propio buscan de verdad el área/parking (Text Search ~3 cént. la primera vez, luego caché).
import { resolveChatPlaces, mightAskForPlace, interpretPlaceRequest, findVehicleParking } from './_prueba-salma-worker.js';

const km = (a, b, c, d) => { const R = 6371, r = x => x * Math.PI / 180; const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const MADRID = { lat: 40.4168, lng: -3.7038, ciudad: 'Madrid' }, VALENCIA = { lat: 39.4699, lng: -0.3763, ciudad: 'Valencia' };
const GRANADA = { lat: 37.1773, lng: -3.5986 }, ALHAMBRA = 'ChIJO7l_l7f8cQ0Rf6IhEu_RjYA';
// atajo: nombre esperado del sitio (y cerca de dónde debe salir) · 'no' = no debe haber atajo
// enlaces: 'uno' (solo al sitio pedido) · 'todos' (cerca de mí) · 'no'
const A = (sitio, cerca, id) => ({ atajo: sitio, cerca, id });
const CASOS = [
  { m: 'como llego alhambra', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'cómo llego a la Alhambra', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'alhambra como llego', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'donde esta la alhabra', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'como llegar a la alhambra', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'pasame la ubi de la alhambra', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'enlace de la alhambra porfa', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'como voy pa la alhambra', ...A('alhambra', GRANADA, ALHAMBRA) },
  { m: 'cómo se llega al mirador de san nicolás', ...A('san nicolas', GRANADA) },
  { m: '¿Dónde está el Museo del Prado?', ...A('prado', MADRID) },
  { m: 'llevame a la sagrada familia', ...A('sagrada familia', { lat: 41.4036, lng: 2.1744 }) },
  { m: 'ruta hasta el retiro', ...A('retiro', MADRID) },
  { m: 'como llego a la torre eiffel', ...A('eiffel', { lat: 48.8584, lng: 2.2945 }) },
  { m: 'cómo llego al Mercado Central', gps: VALENCIA, ...A('mercado central', VALENCIA) },
  { m: '¿y cómo llego?', hist: [{ role: 'user', content: 'qué me recomiendas ver en Granada' }, { role: 'assistant', content: 'Sin duda la **Alhambra**: reserva entradas con antelación, y al atardecer sube al Mirador de San Nicolás.' }], ...A('alhambra', GRANADA, ALHAMBRA) },
  // con contexto → contesta Salma; el enlace va solo al sitio pedido
  { m: 'cómo llego a la Alhambra en camper', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra', medio: 'camper', aparcar: true },
  { m: 'como llegar a la alhambra en autocaravana', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra', medio: 'camper', aparcar: true },
  { m: 'voy en furgo a la alhambra, como llego', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra', medio: 'camper', aparcar: true },
  { m: 'cómo llegar en coche a la Alhambra', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra', medio: 'coche', aparcar: true },
  { m: 'dónde aparco para ir al Museo del Prado', atajo: 'no', enlaces: 'uno', objetivo: 'prado', medio: 'coche', aparcar: true },
  { m: 'como llego en moto a la sagrada familia', atajo: 'no', enlaces: 'uno', objetivo: 'sagrada familia', medio: 'moto', aparcar: true },
  { m: 'cómo llegar a la Alhambra en taxi', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra', medio: 'taxi' },
  { m: 'pídeme un uber a la alhambra', atajo: 'no', objetivo: 'alhambra', medio: 'taxi' },
  { m: 'como llego andando al retiro', atajo: 'no', enlaces: 'uno', objetivo: 'retiro', medio: 'andando' },
  { m: 'cómo llegar a la Alhambra en bus', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra', medio: 'publico' },
  { m: 'como llego a la alhambra desde madrid', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra' },
  { m: 'como llego a la alhambra con mi madre en silla de ruedas', atajo: 'no', enlaces: 'uno', objetivo: 'alhambra' },
  { m: 'necesito un taxi al aeropuerto', atajo: 'no', medio: 'taxi' },
  // viajes (ciudad/país) → sin atajo y sin enlaces
  { m: 'cómo llego a Granada', atajo: 'no', enlaces: 'no' },
  { m: 'como llego a japon', atajo: 'no', enlaces: 'no' },
  // cerca de mí → sin atajo, enlaces a todas las opciones
  { m: 'farmacia cerca de mí', atajo: 'no', enlaces: 'todos' },
  { m: 'donde puedo comer por aqui', atajo: 'no', enlaces: 'todos' },
  // no pide ir a ningún sitio → sin atajo ni enlaces
  { m: 'qué ver en Granada', atajo: 'no', enlaces: 'no' },
  { m: 'dónde comer en Triana', atajo: 'no', enlaces: 'no' },
  { m: 'hola salma', atajo: 'no', enlaces: 'no' },
  { m: 'como llego a mi hotel', atajo: 'no' },
  { m: '3 días en Cádiz', atajo: 'no', enlaces: 'no' },
];

function memKV(real) {
  const mem = new Map();
  return { async get(k) { if (mem.has(k)) return mem.get(k); try { return await real.get(k); } catch (_) { return null; } }, async put(k, v) { mem.set(k, v); } };
}
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default {
  async fetch(req, env) {
    const envT = { ...env, SALMA_KB: memKV(env.SALMA_KB) };
    const uno = async c => {
      const gps = c.gps || MADRID;
      const history = c.hist || [];
      // Misma decisión que el Worker (ver _placeIntent / _directTarget / _chatWantsMapLinks / _linkTarget)
      const filtro = mightAskForPlace(c.m);
      const pi = filtro ? await interpretPlaceRequest(c.m, { history, userLocationName: gps.ciudad, destino: '' }, envT) : null;
      const p = pi || {};
      const atajo = (p.quiere_ir && p.sitio && !p.es_destino && !p.contexto && !p.cerca_de_mi) ? p.sitio : null;
      const enlaces = !((p.quiere_ir && !p.es_destino) || p.cerca_de_mi) ? 'no' : ((p.quiere_ir && p.sitio && !p.es_destino && !p.cerca_de_mi) ? 'uno' : 'todos');
      const objetivo = enlaces === 'uno' ? p.sitio : null;
      let sitioReal = null, dist = null, pid = null, aparcar = null;
      // Igual que el Worker: con vehículo propio se verifica el sitio y se busca dónde dejarlo al lado
      const vehiculo = ['camper', 'coche', 'moto'].includes(p.medio) && objetivo ? objetivo : null;
      const buscar = atajo || vehiculo;
      if (buscar) {
        const ctx = { message: c.m, history, userLocation: gps, userLocationName: gps.ciudad, destino: '', cityHints: p.ciudad ? { [buscar]: p.ciudad } : null, incidents: [] };
        const v = (await resolveChatPlaces([buscar], ctx, envT)).get(buscar);
        if (v) {
          sitioReal = v.name; pid = v.place_id; if (c.cerca) dist = km(v.lat, v.lng, c.cerca.lat, c.cerca.lng);
          if (vehiculo) aparcar = (await findVehicleParking(v, p.medio, envT)).map(x => x.name + ' (' + x.km + ' km)');
        }
      }
      const fallos = [];
      if (c.atajo === 'no' && atajo) fallos.push('no debía haber atajo');
      if (c.atajo && c.atajo !== 'no') {
        if (!atajo || !norm(atajo).includes(c.atajo)) fallos.push('atajo esperado: ' + c.atajo);
        else if (!sitioReal) fallos.push('atajo sin sitio verificado');
        else if (c.cerca && dist > 35) fallos.push('sitio a ' + Math.round(dist) + ' km');
        else if (c.id && pid !== c.id) fallos.push('place_id distinto');
      }
      if (c.enlaces && c.enlaces !== enlaces) fallos.push('enlaces esperado: ' + c.enlaces);
      if (c.objetivo && !norm(objetivo || p.sitio).includes(c.objetivo)) fallos.push('objetivo esperado: ' + c.objetivo);
      if ((c.medio || null) !== (p.medio || null)) fallos.push('medio esperado: ' + (c.medio || 'ninguno'));
      if (c.aparcar && !(aparcar && aparcar.length)) fallos.push('sin sitio para dejar el vehículo');
      return { frase: c.m, pasa: !fallos.length, fallos, filtro, interprete: pi, atajo, sitioReal, km: dist == null ? null : Math.round(dist * 10) / 10, enlaces, objetivo, aparcar };
    };
    // En tandas de 4: un Worker solo abre 6 conexiones a la vez (en el chat real va una frase cada vez)
    // ?desde=0&hasta=12 → solo ese trozo (todas de golpe pueden pasar del tiempo máximo de wrangler dev)
    const u = new URL(req.url);
    const lista = CASOS.slice(+u.searchParams.get('desde') || 0, +u.searchParams.get('hasta') || CASOS.length);
    const out = [];
    for (let i = 0; i < lista.length; i += 4) out.push(...await Promise.all(lista.slice(i, i + 4).map(uno)));
    return new Response(JSON.stringify({ ok: out.filter(x => x.pasa).length + '/' + out.length, out }, null, 1), { headers: { 'Content-Type': 'application/json' } });
  },
};
