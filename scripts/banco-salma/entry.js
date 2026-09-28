// Banco de preguntas de Salma (caso p-mulj7j4n4mz). Lo arranca pasar.cjs con `wrangler dev --remote`: es una copia
// de Salma que no ve nadie. Claude + Google + juez gpt-4o REALES (cuesta: ~0,5-1 € las 20). Nada se escribe:
// KV en memoria, y cualquier escritura a Firestore / Twilio / Stripe / Resend se corta aquí.
// GET /?ids=a,b  → pasa esas preguntas (sin ids, todas) y devuelve JSON con respuesta + veredicto del juez.
import salma from './_banco-salma-worker.js';
import BANCO from './_banco-preguntas.json';

const BLOQUEADO = /firestore\.googleapis\.com|api\.twilio\.com|api\.stripe\.com|api\.resend\.com|identitytoolkit|securetoken/;
const _fetch = globalThis.fetch;
globalThis.__BANCO_BLOQUEOS = [];
globalThis.fetch = (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url) || String(input);
  const metodo = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
  if (metodo !== 'GET' && BLOQUEADO.test(url)) {
    globalThis.__BANCO_BLOQUEOS.push(metodo + ' ' + url.slice(0, 120));
    return Promise.resolve(new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));
  }
  return _fetch(input, init);
};

function memKV(real) {
  const mem = new Map();
  return {
    async get(k, t) { if (mem.has(k)) { const v = mem.get(k); return t === 'json' || (t && t.type === 'json') ? JSON.parse(v) : v; } try { return await real.get(k, t); } catch (_) { return null; } },
    async put(k, v) { mem.set(k, typeof v === 'string' ? v : JSON.stringify(v)); },
    async delete(k) { mem.delete(k); },
    async list(o) { try { return await real.list(o); } catch (_) { return { keys: [], list_complete: true }; } },
    async getWithMetadata(k, t) { return { value: await this.get(k, t), metadata: null }; },
  };
}

const GPS = {
  Madrid: { lat: 40.4168, lng: -3.7038, name: 'Madrid' },
  Granada: { lat: 37.1773, lng: -3.5986, name: 'Granada' },
  Estepona: { lat: 36.4256, lng: -5.1463, name: 'Estepona' },
  Ribadedeva: { lat: 43.3753, lng: -4.5631, name: 'Ribadedeva' },
};

// Ruta mínima abierta para las preguntas de edición
const RUTAS = {
  'estepona-1-dia': { title: 'Estepona en 1 día', country: 'España', region: 'Estepona', stops: [
    { name: 'Casco antiguo de Estepona', day: 1, lat: 36.4262, lng: -5.1467, type: 'monumento' },
    { name: 'Plaza de las Flores', day: 1, lat: 36.4265, lng: -5.1452, type: 'plaza' },
    { name: 'Orquidario de Estepona', day: 1, lat: 36.4281, lng: -5.1470, type: 'jardín' },
    { name: 'Puerto de Estepona', day: 1, lat: 36.4182, lng: -5.1571, type: 'puerto' },
  ] },
};

function cuerpo(p) {
  const b = { message: p.mensaje, history: p.historial || [], stream: true };
  if (p.gps) b.user_location = GPS[p.gps];
  if (p.nacionalidad) b.nationality = p.nacionalidad;
  if (p.ruta_abierta) { b.current_route = RUTAS[p.ruta_abierta]; b.editing_active_route = true; }
  if (p.boton === 'guia') {
    const [dias, ...resto] = p.mensaje.replace(/^(\d+) d[ií]as? en /i, '$1|').split('|');
    b.guided_route = { destino: resto.join('|') || p.mensaje, duracion_dias: parseInt(dias, 10) || 1 };
    b.guided_stage = 'reco';
    b.dest_hint = b.guided_route.destino;
  }
  if (p.foto_base64) b.image_base64 = p.foto_base64;
  return b;
}

async function leerSSE(res) {
  const txt = await res.text();
  let trozos = '', final = null;
  const otros = [];
  for (const linea of txt.split('\n')) {
    if (!linea.startsWith('data: ')) continue;
    let d; try { d = JSON.parse(linea.slice(6)); } catch (_) { continue; }
    if (typeof d.t === 'string') trozos += d.t;
    else if (d.done) final = d;
    else otros.push(Object.keys(d).join(','));
  }
  if (!txt.includes('data: ')) { try { final = JSON.parse(txt); } catch (_) { final = { reply: txt.slice(0, 2000) }; } }
  return {
    texto: (final && final.reply) || trozos,
    ruta: final && final.route ? { titulo: final.route.title || null, paradas: (final.route.stops || []).map(s => (s.day ? 'D' + s.day + ' ' : '') + s.name) } : null,
    eventos: [...new Set(otros)],
  };
}

async function juez(env, p, r) {
  const reglas = {
    debe: p.debe || [],
    no_debe: [...(p.no_debe || []), ...((BANCO.siempre && BANCO.siempre.no_debe) || [])],
  };
  const lista = [...reglas.debe.map(x => 'DEBE ' + x), ...reglas.no_debe.map(x => 'NO DEBE ' + x)];
  const prompt = `Eres un revisor estricto de las respuestas de Salma, una asistente de viajes.
Mensaje del usuario: ${JSON.stringify(p.mensaje)}
Contexto: ${JSON.stringify({ perfil: p.perfil || null, gps: p.gps || null, ruta_abierta: p.ruta_abierta ? RUTAS[p.ruta_abierta].stops.map(s => s.name) : null, boton: p.boton || null })}
Respuesta de Salma:
"""${r.texto.slice(0, 6000)}"""
${r.ruta ? 'Ruta devuelta (si había ruta abierta, así queda tras el cambio): ' + JSON.stringify(r.ruta).slice(0, 1500) : ''}

Reglas (numeradas):
${lista.map((x, i) => `${i + 1}. ${x}`).join('\n')}

Para CADA regla di si Salma lo hace BIEN ("bien": true) o MAL ("bien": false).
- "DEBE X": bien si la respuesta hace X. "NO DEBE X": bien si la respuesta NO hace X.
- Juzga SOLO lo que dice la regla, con sentido común; no añadas exigencias que no estén escritas.
- "por_que": una frase que cite o describa la parte de la respuesta en la que te basas.
Contesta SOLO JSON: {"reglas":[{"n":1,"bien":true,"por_que":"..."}]}`;
  try {
    const res = await _fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.OPENAI_API_KEY },
      body: JSON.stringify({ model: 'gpt-4o', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
    });
    const j = await res.json();
    const out = JSON.parse(j.choices[0].message.content);
    const rs = lista.map((regla, i) => { const x = (out.reglas || []).find(y => y.n === i + 1) || {}; return { regla, cumple: x.bien === true, por_que: x.por_que || 'el juez no la valoró' }; });
    return { pasa: rs.every(x => x.cumple), reglas: rs };
  } catch (e) { return { pasa: null, error: 'juez: ' + e.message }; }
}

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    // POST /juzgar {id, respuesta} → solo el juez sobre una respuesta ya guardada (no gasta Claude)
    if (u.pathname === '/juzgar' && req.method === 'POST') {
      const { id, respuesta } = await req.json();
      const p = BANCO.preguntas.find(x => x.id === id);
      if (!p) return new Response(JSON.stringify({ error: 'no existe ' + id }), { status: 400 });
      return new Response(JSON.stringify(await juez(env, p, respuesta)), { headers: { 'Content-Type': 'application/json' } });
    }
    if (u.pathname !== '/') return new Response('', { status: 404 });
    const ids = (u.searchParams.get('ids') || '').split(',').filter(Boolean);
    const envT = { ...env, SALMA_KB: memKV(env.SALMA_KB) };
    const out = [];
    for (const p of BANCO.preguntas) {
      if (ids.length && !ids.includes(p.id)) continue;
      if (p.foto && !p.foto_base64) { out.push({ id: p.id, pasa: null, error: 'falta la foto (pendiente)' }); continue; }
      globalThis.__BANCO_USER = {
        uid: 'banco-prueba', name: null, isPremium: true, premium_active: true, bonus_guides: 0,
        perfil_facts: (p.perfil || []).map(texto => ({ categoria: 'estilo', texto })),
      };
      const t0 = Date.now();
      let r, err = null;
      try {
        const res = await salma.fetch(new Request('http://banco/', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer banco-prueba-' + 'x'.repeat(60) },
          body: JSON.stringify(cuerpo(p)),
        }), envT, ctx);
        r = await leerSSE(res);
      } catch (e) { err = e.message; r = { texto: '', ruta: null }; }
      const ms = Date.now() - t0;
      // Sin texto = el chat se queda colgado en la app (caso p-mulisbyv3q3): ❌ sin gastar juez
      const v = err ? { pasa: false, error: err }
        : !String(r.texto || '').trim() ? { pasa: false, error: 'respuesta vacía (en la app se queda colgado)' }
        : await juez(env, p, r);
      out.push({ id: p.id, mensaje: p.mensaje, ...v, ms, lento: ms > 18000, respuesta: r });
    }
    globalThis.__BANCO_USER = null;
    return new Response(JSON.stringify({
      version_worker: env.CF_VERSION_METADATA ? env.CF_VERSION_METADATA.id : null,
      pasan: out.filter(x => x.pasa).length + '/' + out.length,
      escrituras_cortadas: globalThis.__BANCO_BLOQUEOS.splice(0),
      out,
    }, null, 1), { headers: { 'Content-Type': 'application/json' } });
  },
};
