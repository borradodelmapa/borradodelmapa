// Banco de preguntas de Salma (caso p-mulj7j4n4mz). Lo arranca pasar.cjs: es una copia de Salma que no ve nadie.
// Nada se escribe: KV en memoria, y cualquier escritura a Firestore / Twilio / Stripe / Resend se corta aquí.
// POST / {ids, modo, cintas} → pasa esas preguntas y devuelve JSON con respuesta + veredicto del juez + coste.
//   modo 'vivo'       → Claude + Google + juez REALES (el coste real sale medido en cada informe)
//   modo 'grabar'     → igual que vivo, y además devuelve la CINTA: todo lo que contestó cada servicio y el KV leído
//   modo 'reproducir' → sirve la cinta en vez de llamar a nadie: 0 €, el código nuevo con las MISMAS respuestas de fuera.
//                       Lo que el código nuevo pida distinto sale marcado (⚠ necesita en vivo).
import salma from './_banco-salma-worker.js';
import BANCO from './_banco-preguntas.json';

const BLOQUEADO = /firestore\.googleapis\.com|api\.twilio\.com|api\.stripe\.com|api\.resend\.com|identitytoolkit|securetoken/;
const _fetch = globalThis.fetch;
globalThis.__BANCO_BLOQUEOS = [];

// ── Coste de cada llamada (precios de lista aprox., en €; 1 $ ≈ 0,92 €) ──
const USD = 0.92;
const PRECIO_IA = { // $ por millón de tokens: entrada, salida, caché escrita, caché leída
  'claude-sonnet': [3, 15, 3.75, 0.30], 'claude-haiku': [1, 5, 1.25, 0.10],
  'gpt-4o-mini': [0.15, 0.60, 0.15, 0.075], 'gpt-4o': [2.5, 10, 2.5, 1.25],
};
const GOOGLE_EUR = { find: 0.016, details: 0.025, text: 0.030, nearby: 0.030, photo: 0.0065, directions: 0.009, static: 0.0019, geocode: 0.0046, other: 0.010 };
function tipoDe(url) {
  if (/anthropic/.test(url)) return 'claude';
  if (/openai/.test(url)) return 'openai';
  if (/googleapis\.com\/maps|places\.googleapis/.test(url)) return 'google';
  return 'otro';
}
function skuGoogle(url) {
  const m = url.match(/\/maps\/api\/(place\/)?(findplacefromtext|details|textsearch|nearbysearch|photo|directions|staticmap|geocode)/);
  return m ? ({ findplacefromtext: 'find', textsearch: 'text', nearbysearch: 'nearby', staticmap: 'static' }[m[2]] || m[2]) : 'other';
}
function tokens(tipo, cuerpoPedido, texto) {
  let modelo = ''; try { modelo = JSON.parse(cuerpoPedido || '{}').model || ''; } catch (_) {}
  const u = { modelo, in: 0, out: 0, cw: 0, cr: 0 };
  try {
    if (tipo === 'claude') {
      for (const l of texto.split('\n')) {
        let j = null;
        try { j = l.startsWith('data: ') ? JSON.parse(l.slice(6)) : (l.trim().startsWith('{') ? JSON.parse(l) : null); } catch (_) {}
        const us = j && (j.usage || (j.message && j.message.usage));
        if (!us) continue;
        u.in += us.input_tokens || 0; u.out += us.output_tokens || 0;
        u.cw += us.cache_creation_input_tokens || 0; u.cr += us.cache_read_input_tokens || 0;
      }
    } else {
      const j = JSON.parse(texto); const us = j.usage || {};
      const cached = (us.prompt_tokens_details || {}).cached_tokens || 0;
      u.in = (us.prompt_tokens || 0) - cached; u.cr = cached; u.out = us.completion_tokens || 0;
    }
  } catch (_) {}
  const clave = Object.keys(PRECIO_IA).filter(k => modelo.startsWith(k)).sort((a, b) => b.length - a.length)[0];
  const p = PRECIO_IA[clave] || [3, 15, 3.75, 0.30];
  u.eur = (u.in * p[0] + u.out * p[1] + u.cw * p[2] + u.cr * p[3]) / 1e6 * USD;
  return u;
}
function coste(tipo, url, pedido, texto) {
  if (tipo === 'google') { const sku = skuGoogle(url); return { sku, eur: GOOGLE_EUR[sku] || GOOGLE_EUR.other }; }
  if (tipo === 'claude' || tipo === 'openai') return tokens(tipo, pedido, texto || '');
  return { eur: 0 };
}

// ── La cinta de la pregunta en curso ──
let MODO = 'vivo';
let GRABADAS = [];   // grabando: todo lo que salió y volvió · reproduciendo: lo que trae la cinta
let USADAS = [];     // reproduciendo: qué grabada ya se sirvió
let INFORME = [];    // cada llamada de esta pregunta: tipo, estado (vivo/igual/distinta/falta), coste
let KV_CINTA = {};   // KV leído de verdad al grabar (clave → texto o null)
const quitarClave = (url) => url.replace(/([?&](key|api_key|appid|apiKey)=)[^&]*/g, '$1·');
// Lo que cambia cada día sin que cambie nada de verdad (la fecha del prompt, marcas de tiempo): fuera al comparar
const normal = (t) => String(t || '').replace(/\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?/g, 'FECHA').replace(/\b1\d{12}\b/g, 'TS');
function primeraDiferencia(a, b) {
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return { antes: a.slice(Math.max(0, i - 80), i + 120), ahora: b.slice(Math.max(0, i - 80), i + 120) };
}
const b64 = (buf) => { let s = ''; const v = new Uint8Array(buf); for (let i = 0; i < v.length; i += 32768) s += String.fromCharCode.apply(null, v.subarray(i, i + 32768)); return btoa(s); };
const desdeB64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const esTexto = (ct) => !ct || /json|text|event-stream|xml|javascript/.test(ct);

globalThis.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url) || String(input);
  const metodo = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
  if (metodo !== 'GET' && BLOQUEADO.test(url)) {
    globalThis.__BANCO_BLOQUEOS.push(metodo + ' ' + url.slice(0, 120));
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  const tipo = tipoDe(url);
  const pedido = init && typeof init.body === 'string' ? init.body : '';
  const u = quitarClave(url);
  const clave = metodo + ' ' + normal(u) + '\n' + normal(pedido);

  if (MODO === 'reproducir') {
    let i = GRABADAS.findIndex((g, n) => !USADAS[n] && g.clave === clave);
    let estado = 'igual', dif = null;
    if (i < 0 && (tipo === 'claude' || tipo === 'openai')) {
      // Misma API, pedido distinto: se sirve la grabada que tocaba por orden y se marca (cambió lo que recibe la IA)
      i = GRABADAS.findIndex((g, n) => !USADAS[n] && g.tipo === tipo && g.ruta === u.split('?')[0]);
      if (i >= 0) { estado = 'distinta'; dif = primeraDiferencia(GRABADAS[i].clave, clave); }
    }
    if (i < 0) {
      INFORME.push({ tipo, estado: 'falta', url: u.slice(0, 160), eur: 0 });
      // Sin grabación no se llama a nadie: Google contesta "sin resultados"; la IA, error (sale ⚠ en el informe)
      if (tipo === 'google') return new Response(JSON.stringify({ status: 'ZERO_RESULTS', results: [], candidates: [], routes: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      return new Response('{"error":"banco: sin grabación"}', { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    USADAS[i] = true;
    const g = GRABADAS[i];
    INFORME.push({ tipo, estado, url: u.slice(0, 160), eur: 0, eur_en_vivo: g.eur || 0, ...(dif ? { dif } : {}) });
    return new Response(g.b64 ? desdeB64(g.b64) : g.cuerpo, { status: g.status, headers: g.ct ? { 'Content-Type': g.ct } : {} });
  }

  const res = await _fetch(input, init);
  if (MODO !== 'grabar' && tipo === 'otro') { INFORME.push({ tipo, estado: 'vivo', url: u.slice(0, 160), eur: 0 }); return res; }
  const ct = res.headers.get('content-type') || '';
  const texto = esTexto(ct) ? await res.text() : null;
  const bin = texto == null ? await res.arrayBuffer() : null;
  const c = coste(tipo, url, pedido, texto);
  INFORME.push({ tipo, estado: 'vivo', url: u.slice(0, 160), ...c });
  if (MODO === 'grabar') {
    GRABADAS.push({ tipo, ruta: u.split('?')[0], clave, status: res.status, ct, eur: c.eur || 0,
      ...(texto != null ? { cuerpo: texto } : { b64: b64(bin) }) });
  }
  return new Response(texto != null ? texto : bin, { status: res.status, statusText: res.statusText, headers: res.headers });
};

// KV: lo escrito queda en memoria; lo leído de verdad se graba, y al reproducir se sirve lo grabado
function memKV(real, nombre) {
  const mem = new Map();
  const conTipo = (v, t) => (v != null && (t === 'json' || (t && t.type === 'json')) ? JSON.parse(v) : v);
  return {
    async get(k, t) {
      if (mem.has(k)) return conTipo(mem.get(k), t);
      const tt = t && t.type ? t.type : t;
      if (tt && tt !== 'json' && tt !== 'text') { try { return await real.get(k, t); } catch (_) { return null; } }
      const ck = nombre + ':' + k;
      if (MODO === 'reproducir') return Object.prototype.hasOwnProperty.call(KV_CINTA, ck) ? conTipo(KV_CINTA[ck], t) : null;
      let v = null; try { v = await real.get(k); } catch (_) {}
      if (MODO === 'grabar') KV_CINTA[ck] = v;
      return conTipo(v, t);
    },
    async put(k, v) { mem.set(k, typeof v === 'string' ? v : JSON.stringify(v)); },
    async delete(k) { mem.delete(k); },
    async list(o) { if (MODO === 'reproducir') return { keys: [], list_complete: true }; try { return await real.list(o); } catch (_) { return { keys: [], list_complete: true }; } },
    async getWithMetadata(k, t) { return { value: await this.get(k, t), metadata: null }; },
  };
}

// Azar con semilla por pregunta: así lo que se pide a Claude sale igual al grabar y al reproducir
function semilla(txt) {
  let h = 2166136261; for (const ch of txt) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let a = h >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
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
  'transpirenaica-moto': { title: 'Transpirenaica en moto: Hondarribia → Cadaqués', country: 'España', region: 'Pirineos', stops: [
    { name: 'Hondarribia', day: 1, lat: 43.3626, lng: -1.7913, type: 'pueblo' },
    { name: 'Roncesvalles', day: 2, lat: 43.0092, lng: -1.3197, type: 'pueblo' },
    { name: 'Jaca', day: 3, lat: 42.5700, lng: -0.5490, type: 'ciudad' },
    { name: 'Cadaqués', day: 5, lat: 42.2887, lng: 3.2779, type: 'pueblo' },
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
    const cj = tokens('openai', JSON.stringify({ model: 'gpt-4o' }), JSON.stringify(j));
    const out = JSON.parse(j.choices[0].message.content);
    const rs = lista.map((regla, i) => { const x = (out.reglas || []).find(y => y.n === i + 1) || {}; return { regla, cumple: x.bien === true, por_que: x.por_que || 'el juez no la valoró' }; });
    return { pasa: rs.every(x => x.cumple), reglas: rs, eur_juez: cj.eur };
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
    const pet = req.method === 'POST' ? await req.json() : {};
    const ids = pet.ids || (u.searchParams.get('ids') || '').split(',').filter(Boolean);
    const cintas = pet.cintas || {};
    const out = [];
    for (const p of BANCO.preguntas) {
      if (ids.length && !ids.includes(p.id)) continue;
      if (p.foto && !p.foto_base64) { out.push({ id: p.id, pasa: null, error: 'falta la foto (pendiente)' }); continue; }
      MODO = pet.modo || 'vivo';
      const cinta = cintas[p.id];
      if (MODO === 'reproducir' && !cinta) { out.push({ id: p.id, pasa: null, error: 'no está en la grabación' }); continue; }
      GRABADAS = MODO === 'reproducir' ? cinta.llamadas : []; USADAS = []; INFORME = []; KV_CINTA = MODO === 'reproducir' ? cinta.kv : {};
      semilla(p.id);
      const envT = { ...env, SALMA_KB: memKV(env.SALMA_KB, 'kb'), ROAD_GEOM: env.ROAD_GEOM ? memKV(env.ROAD_GEOM, 'road') : env.ROAD_GEOM };
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
      const llamadas = INFORME.splice(0);
      // Reproduciendo: si sale EXACTAMENTE la misma respuesta que en la grabación, vale el veredicto grabado (0 €)
      const mismaRespuesta = MODO === 'reproducir' && !!cinta.respuesta && JSON.stringify(cinta.respuesta) === JSON.stringify(r);
      const vale = mismaRespuesta && cinta.veredicto && cinta.veredicto.pasa != null;
      // Sin texto = el chat se queda colgado en la app (caso p-mulisbyv3q3): ❌ sin gastar juez
      const v = err ? { pasa: false, error: err }
        : !String(r.texto || '').trim() ? { pasa: false, error: 'respuesta vacía (en la app se queda colgado)' }
        : vale ? { ...cinta.veredicto, eur_juez: 0, juez: 'grabado (misma respuesta)' }
        : await juez(env, p, r);
      const gasto = { claude: 0, openai: 0, google: 0, juez: v.eur_juez || 0, n_google: {} };
      for (const c of llamadas) { if (c.tipo in gasto) gasto[c.tipo] += c.eur || 0; if (c.tipo === 'google' && c.sku) gasto.n_google[c.sku] = (gasto.n_google[c.sku] || 0) + 1; }
      gasto.total = gasto.claude + gasto.openai + gasto.google + gasto.juez;
      const x = { id: p.id, mensaje: p.mensaje, ...v, ms, lento: ms > 18000, respuesta: r, gasto, llamadas };
      if (MODO === 'reproducir') {
        const cambios = llamadas.filter(c => c.estado !== 'igual' && c.tipo !== 'otro');
        x.reproduccion = { igual: llamadas.filter(c => c.estado === 'igual').length, distintas: cambios.filter(c => c.estado === 'distinta').length, faltan: cambios.filter(c => c.estado === 'falta').length, sin_usar: GRABADAS.filter((g, n) => !USADAS[n]).length, misma_respuesta: !!mismaRespuesta };
        x.necesita_vivo = cambios.some(c => c.tipo === 'claude' || c.tipo === 'openai');
      }
      if (MODO === 'grabar') x.cinta = { llamadas: GRABADAS, kv: KV_CINTA, respuesta: r, veredicto: { pasa: v.pasa, reglas: v.reglas, error: v.error } };
      out.push(x);
      MODO = 'vivo';
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
