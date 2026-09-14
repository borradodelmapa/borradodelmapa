/**
 * road-resolver.js — Resolver de carreteras con nombre contra OpenStreetMap.
 *
 * AISLADO A PROPÓSITO: no importa nada de Salma (ni prompt, ni Firestore, ni
 * verificación de paradas). Entrada = nombre de carretera + país. Salida =
 * geometría real + metadatos. Pensado para que una futura app (moteros) lo
 * reutilice llamando al mismo módulo/endpoint sin refactor.
 *
 * API pública:
 *   resolveNamedRoad(input, deps) -> Promise<result>
 *   toGeoJSON(result) -> FeatureCollection
 *   toGPX(result) -> string
 *   ROAD_SCHEMA
 *
 * `input`:  string  |  { query, country }  |  { ref, country }  |  { relationId }
 * `deps` :  { kv?, fetch?, nocache?, maxLevels? }
 *   - kv     : binding KV (opcional). Sin él no hay caché, solo resolución en vivo.
 *   - fetch  : implementación de fetch (por defecto el global).
 *   - nocache: true = ignora KV de lectura (sí escribe).
 *
 * `result` (ok):
 *   { schema:'road/v1', ok:true,
 *     road:{ name, ref, network, relation_id, osm_url },
 *     geometry:[[lat,lng],...],        // simplificada
 *     length_km, continuity:'clean'|'minor_gaps'|'fragmented',
 *     gaps:[{lat,lng,km}], fragments, fragments_km,
 *     stats:null,                      // reservado (desnivel, curvas, ...)
 *     cached:boolean, resolved_at:ISO }
 * `result` (fallo):
 *   { schema:'road/v1', ok:false, reason:'not_found'|'low_confidence'|'overpass_error'|'no_geometry' }
 */

'use strict';

export const ROAD_SCHEMA = 'road/v1';

// Orden por defecto pensado para Node/precarga (overpass-api.de va fino desde
// ahí y tiene el mejor soporte de `area[...]`). DESDE UN WORKER de Cloudflare
// overpass-api.de suele dar timeout con payloads grandes -> el wiring del Worker
// debe pasar deps.endpoints con maps.mail.ru el primero.
const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const OVERPASS_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent': 'borradodelmapa.com road-resolver (paco.defoto@gmail.com)',
  Accept: 'application/json',
};
const OVERPASS_TIMEOUT_MS = 25000;

const GAP_THRESHOLD_M = 2000;   // hueco "real" a efectos del veredicto
const JOIN_CAP_M = 8000;        // no se puentean huecos mayores: se abre otra tirada
const RAMAL_MIN_M = 800;        // super-tramos más cortos = ramales, se apartan
const SIMPLIFY_TOL_M = 12;      // Douglas-Peucker antes de guardar/devolver
const MIN_SELECT_SCORE = 60;    // por debajo -> low_confidence

const KV_PREFIX = 'road_geom:v1:';
const KV_TTL_OK = 5184000;      // 60 días
const KV_TTL_NEG = 604800;      // 7 días (not_found / low_confidence)

// ───────────────────────── geo ─────────────────────────
function hav(a, b) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]), dLon = rad(b[1] - a[1]);
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
function polyLen(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += hav(pts[i - 1], pts[i]);
  return s;
}
const km1 = (m) => Math.round(m / 100) / 10;

// distancia perpendicular de p al segmento a-b, en metros (equirectangular local)
function perpDistM(p, a, b) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180;
  const cosLat = Math.cos(rad(a[0]));
  const X = (lon) => rad(lon - a[1]) * cosLat * R;
  const Y = (lat) => rad(lat - a[0]) * R;
  const px = X(p[1]), py = Y(p[0]);
  const bx = X(b[1]), by = Y(b[0]);
  const L2 = bx * bx + by * by;
  if (L2 === 0) return Math.hypot(px, py);
  let t = (px * bx + py * by) / L2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - t * bx, py - t * by);
}

// Douglas-Peucker iterativo (evita desbordar la pila con cadenas largas)
function simplify(pts, tolM) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    let maxD = -1, idx = -1;
    for (let i = lo + 1; i < hi; i++) {
      const d = perpDistM(pts[i], pts[lo], pts[hi]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tolM && idx !== -1) {
      keep[idx] = 1;
      stack.push([lo, idx], [idx, hi]);
    }
  }
  const out = [];
  for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
  return out;
}

// ───────────────────────── cosido ─────────────────────────
// Grafo por nodos compartidos -> fundir cadenas de grado 2 -> encadenar los
// pocos super-tramos sin puentear huecos gigantes -> quedarse con la tirada
// continua más larga. (Validado en Fase 0: N2 727 km, Great Ocean Road limpio.)
export function stitch(ways) {
  ways = ways.filter((w) => w.pts && w.pts.length >= 2);
  if (!ways.length) return { chain: [], gaps: [], superCount: 0, totalWays: 0, fragCount: 0, fragLenM: 0 };

  const K = (p) => p[0].toFixed(7) + ',' + p[1].toFixed(7);

  const adj = new Map();
  ways.forEach((w, wi) => {
    for (const pt of [w.pts[0], w.pts[w.pts.length - 1]]) {
      const k = K(pt);
      if (!adj.has(k)) adj.set(k, []);
      adj.get(k).push(wi);
    }
  });

  const usedWay = new Array(ways.length).fill(false);
  function extend(pts) {
    while (true) {
      const curKey = K(pts[pts.length - 1]);
      const inc = adj.get(curKey) || [];
      const free = inc.filter((wi) => !usedWay[wi]);
      if (inc.length !== 2 || free.length !== 1) break;
      const wi = free[0];
      usedWay[wi] = true;
      let wp = ways[wi].pts.slice();
      if (K(wp[0]) !== curKey) wp.reverse();
      pts.push(...wp.slice(1));
    }
    return pts;
  }

  const supers = [];
  for (let wi = 0; wi < ways.length; wi++) {
    if (usedWay[wi]) continue;
    usedWay[wi] = true;
    let pts = ways[wi].pts.slice();
    pts = extend(pts);
    pts.reverse();
    pts = extend(pts);
    supers.push(pts);
  }

  const segs = [];
  for (const s of supers) {
    if (polyLen(s) < RAMAL_MIN_M && supers.length > 2) continue;
    segs.push(s);
  }
  if (!segs.length) return { chain: [], gaps: [], superCount: supers.length, totalWays: ways.length, fragCount: 0, fragLenM: 0 };

  const pool = segs.slice().sort((a, b) => polyLen(b) - polyLen(a));
  const runs = [];
  while (pool.length) {
    let chain = pool.shift().slice();
    const gaps = [];
    while (pool.length) {
      const head = chain[0], tail = chain[chain.length - 1];
      let best = null;
      pool.forEach((s, idx) => {
        const opts = [
          { d: hav(tail, s[0]),            where: 'tail', flip: false },
          { d: hav(tail, s[s.length - 1]), where: 'tail', flip: true },
          { d: hav(head, s[s.length - 1]), where: 'head', flip: false },
          { d: hav(head, s[0]),            where: 'head', flip: true },
        ];
        for (const o of opts) if (!best || o.d < best.d) best = { idx, ...o };
      });
      if (!best || best.d > JOIN_CAP_M) break;
      let s = pool[best.idx].slice();
      if (best.flip) s.reverse();
      if (best.where === 'tail') {
        if (best.d > GAP_THRESHOLD_M) gaps.push({ at: tail, to: s[0], dist: best.d });
        chain = chain.concat(s);
      } else {
        if (best.d > GAP_THRESHOLD_M) gaps.push({ at: head, to: s[s.length - 1], dist: best.d });
        chain = s.concat(chain);
      }
      pool.splice(best.idx, 1);
    }
    runs.push({ chain, gaps, len: polyLen(chain) });
  }

  runs.sort((a, b) => b.len - a.len);
  const main = runs[0];
  const fragLenM = runs.slice(1).reduce((s, r) => s + r.len, 0);
  return {
    chain: main.chain, gaps: main.gaps,
    superCount: supers.length, totalWays: ways.length,
    fragCount: runs.length - 1, fragLenM,
  };
}

// ───────────────────────── overpass ─────────────────────────
async function overpassQuery(query, fetchImpl, opts = {}) {
  const endpoints = opts.endpoints || OVERPASS_ENDPOINTS;
  const wantElements = opts.wantElements !== false; // por defecto exigimos elements no vacío
  let lastErr;
  for (let round = 0; round < 2; round++) {
    for (const url of endpoints) {
      try {
        const res = await fetchImpl(url, {
          method: 'POST',
          headers: OVERPASS_HEADERS,
          body: 'data=' + encodeURIComponent(query),
          signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
        });
        if (!res.ok) { lastErr = new Error(url.split('/')[2] + ' HTTP ' + res.status); continue; }
        const j = await res.json();
        if (wantElements && (!j.elements || j.elements.length === 0)) {
          // mirror con datos/area incompletos -> probar el siguiente
          lastErr = new Error(url.split('/')[2] + ' elements vacío');
          continue;
        }
        return j;
      } catch (e) {
        lastErr = e;
      }
    }
    if (round === 0) await new Promise((r) => setTimeout(r, 3000));
  }
  throw lastErr || new Error('overpass unreachable');
}

function reEscape(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// "N2" -> ["N2","N-2","N 2","EN2","EN-2","EN 2","2",...]. En OSM la misma
// carretera puede estar como "EN 2" (Portugal) o "N-2". Generamos variantes y
// se consultan por coincidencia EXACTA (usa índice, rápido). scoreRelation()
// desempata después (prioriza network nacional + longitud de geometría).
// "N2" -> ["N2","N-2","N 2","EN2","EN 2","RN2","A2","2"]. Pocas variantes, todas
// para coincidencia EXACTA (índice). scoreRelation() desempata después.
function refCandidatesFrom(refRaw) {
  const compact = String(refRaw || '').toUpperCase().replace(/\s+/g, '').trim();
  if (!compact) return [];
  const set = new Set([compact]);
  const m = compact.match(/^([A-Z]{0,3})[- ]?(\d{1,4})([A-Z]?)$/);
  if (m) {
    const [, pre, num, suf] = m;
    const n = num + (suf || '');
    if (pre) {
      set.add(`${pre}-${n}`); set.add(`${pre} ${n}`); set.add(n);
    } else {
      for (const p of ['N', 'EN', 'RN', 'A']) { set.add(`${p}${n}`); set.add(`${p} ${n}`); }
      set.add(n);
    }
  }
  return [...set].filter(Boolean).slice(0, 10);
}

// ───────────────── detección en el mensaje del usuario ─────────────────
// Carreteras/rutas famosas: nombre reconocible sin necesidad de disparador.
// `name` = como suele venir en OSM (para casar). `ref` = si tiene número oficial.
// `cc` = país por defecto (el llamante puede sobreescribir con el ancla real).
// `slug` = clave estable en KV ROAD_GEOM (road_geom:v1:{cc}:{slug}); la que siembra
//   worker/roads/precarga-roads.mjs. Debe coincidir con el slug de esa tabla.
//   `id` = relation OSM, cuando se conoce (camino de resolución fiable).
const ROAD_LEXICON = [
  { rx: /\bgreat ocean road\b/i,                         slug: 'great-ocean-road-au', name: 'Great Ocean Road', cc: 'AU', id: 6592912 },
  { rx: /\bgreat alpine road\b/i,                        slug: 'great-alpine-road-au', name: 'Great Alpine Road', cc: 'AU' },
  { rx: /\b(ruta\s*(nacional)?\s*40|rn\s*-?\s*40)\b/i,   slug: 'ruta40-ar', name: 'Ruta Nacional 40', ref: 'RN40', cc: 'AR', id: 168012 },
  { rx: /\b(route|ruta)\s*(66|us\s*-?\s*66)\b/i,         slug: 'route66-us', name: 'U.S. Route 66', ref: 'US 66', cc: 'US' },
  { rx: /\bcarretera austral\b/i,                        slug: 'carretera-austral-cl', name: 'Carretera Austral', ref: '7', cc: 'CL' },
  { rx: /\b(ring road|hringvegur|þjóðvegur 1|thjodvegur 1)\b/i, slug: 'ring-road-is', name: 'Hringvegur', ref: '1', cc: 'IS', id: 65617 },
  { rx: /\bwild atlantic way\b/i,                        slug: 'wild-atlantic-way-ie', name: 'Wild Atlantic Way', cc: 'IE' },
  { rx: /\btransf[aă]g[aă]r[aă][sș]an\b/i,               slug: 'transfagarasan-ro', name: 'Transfăgărășan', ref: 'DN7C', cc: 'RO', id: 3432007 },
  { rx: /\btransalpina\b/i,                              slug: 'transalpina-ro', name: 'Transalpina', ref: 'DN67C', cc: 'RO', id: 1169079 },
  { rx: /\b(costiera amalfitana|amalfi coast|amalfitana)\b/i, slug: 'amalfitana-it', name: 'Strada Statale 163 Amalfitana', ref: 'SS163', cc: 'IT', id: 4542085 },
  { rx: /\b(passo dello )?stelvio\b/i,                   slug: 'stelvio-ss38-it', name: 'Passo dello Stelvio', ref: 'SS38', cc: 'IT', id: 9502582 },
  { rx: /\b(gro[sß]glockner)\b/i,                        slug: 'grossglockner-at', name: 'Großglockner Hochalpenstraße', cc: 'AT', id: 4205967 },
  { rx: /\btrollstigen\b/i,                              slug: 'trollstigen-no', name: 'Trollstigen', cc: 'NO', id: 1693967 },
  { rx: /\b(atlanterhavsveg|atlantic (ocean )?road)\b/i, slug: 'atlanterhavsvegen-no', name: 'Atlanterhavsvegen', ref: 'Fv64', cc: 'NO', id: 1171818 },
  { rx: /\b(north coast 500|nc\s*-?\s*500)\b/i,          slug: 'nc500-gb', name: 'North Coast 500', cc: 'GB', id: 5723406 },
  { rx: /\bcauseway coastal route\b/i,                   slug: 'causeway-coastal-gb', name: 'Causeway Coastal Route', cc: 'GB', id: 4719145 },
  { rx: /\bgarden route\b/i,                             slug: 'garden-route-za', name: 'Garden Route', cc: 'ZA' },
  { rx: /\bchapman'?s peak\b/i,                          slug: 'chapmans-peak-za', name: "Chapman's Peak Drive", cc: 'ZA', id: 16487221 },
  { rx: /\b(romantische stra[sß]e|romantic road)\b/i,    slug: 'romantische-strasse-de', name: 'Romantische Straße', cc: 'DE', id: 56917 },
  { rx: /\b(schwarzwaldhochstra[sß]e|black forest high road)\b/i, slug: 'schwarzwaldhochstrasse-de', name: 'Schwarzwaldhochstraße', ref: 'B500', cc: 'DE', id: 27947 },
  { rx: /\broute des grandes alpes\b/i,                  slug: 'route-grandes-alpes-fr', name: 'Route des Grandes Alpes', cc: 'FR', id: 15722245 },
  { rx: /\b(col du galibier|route du galibier)\b/i,      slug: 'col-galibier-fr', name: 'Col du Galibier', ref: 'D902', cc: 'FR' },
  { rx: /\b(blue ridge parkway)\b/i,                     slug: 'blue-ridge-parkway-us', name: 'Blue Ridge Parkway', cc: 'US', id: 55450 },
  { rx: /\b(pacific coast highway|\bpch\b|highway 1 california)\b/i, slug: 'pch-ca-us', name: 'California State Route 1', ref: 'SR 1', cc: 'US' },
  { rx: /\b(tail of the dragon|us\s*-?\s*129|deals gap)\b/i, slug: 'tail-of-the-dragon-us', name: 'U.S. Route 129', ref: 'US 129', cc: 'US' },
  { rx: /\bsa calobra\b/i,                               slug: 'sa-calobra-es', name: 'Sa Calobra', ref: 'MA-2141', cc: 'ES' },
  { rx: /\bfurka(pass| pass)\b/i,                        slug: 'furkapass-ch', name: 'Furkapass', cc: 'CH' },
  { rx: /\b(estrada nacional 2|\ben\s*-?\s*2\b|(?:la|carretera)\s+n\s*-?\s*2\b|nacional 2)\b/i, slug: 'n2-pt', name: 'Estrada Nacional 2', ref: 'EN2', cc: 'PT', id: 7362083 },
];

// Disparadores: solo con uno de estos delante nos fiamos de un "ref" suelto
// (para no confundir "2 días" o "40 euros" con carreteras).
const TRIGGER = '(?:sigue(?:s|n|me|le)?|siguiendo|recorr\\w+|por|sin\\s+salir(?:te|se|me)?\\s+de|coge|coger|toma|tomar|baja(?:ndo)?\\s+por|v[ií]a|follow(?:ing)?|along|down|take|lungo|pela|pelo|sur)';
const ROADWORD = '(?:carretera|autov[ií]a|autopista|ruta(?:\\s+nacional)?|nacional|estrada(?:\\s+nacional)?|route(?:\\s+nationale)?|national\\s+route|strada(?:\\s+statale)?|road|rodovia)';
// prefijo de 0-3 letras PEGADO a los dígitos (una sola separación opcional),
// y sufijo de letra solo si va pegado (evita "63 y tira" -> "63Y").
const REF = '([A-Za-zÀ-ÿ]{1,3}[-\\s]?\\d{1,4}[A-Za-zÀ-ÿ]?|\\d{1,4}[A-Za-zÀ-ÿ]?)';

const RX_TRIGGER_REF = new RegExp(`\\b${TRIGGER}\\s+(?:la\\s+|el\\s+|the\\s+|a\\s+)?(?:${ROADWORD}\\s+(?:la\\s+|el\\s+)?)?${REF}(?![A-Za-zÀ-ÿ])`, 'i');
const RX_ROADWORD_REF = new RegExp(`\\b${ROADWORD}\\s+(?:la\\s+|el\\s+)?${REF}(?![A-Za-zÀ-ÿ])`, 'i');

// prefijos que en realidad son preposiciones/artículos, no códigos de carretera
const REF_STOP_PREFIX = new Set(['DE', 'DEL', 'LA', 'EL', 'EN', 'POR', 'THE', 'DI', 'DA', 'DO', 'DU', 'AL', 'UN', 'SU']);

// forma canónica compacta: "N-340"/"N 340" -> "N340", "en 2" -> "EN2".
// refCandidatesFrom() re-genera todas las variantes para consultar Overpass.
function normRefToken(tok) {
  const up = String(tok).toUpperCase().replace(/[\s]+/g, '');
  const m = up.match(/^([A-ZÀ-ÿ]{0,3})-?(\d{1,4})([A-ZÀ-ÿ]?)$/);
  if (!m) return null;
  const [, pre, num, suf] = m;
  if (pre && REF_STOP_PREFIX.has(pre)) return null;
  return pre + num + (suf || '');
}

/**
 * Detecta si el usuario ha nombrado una carretera concreta.
 * @param {string} message
 * @param {string} [countryHint] ISO2 o nombre de país (el ancla real de la ruta)
 * @returns {null | { kind:'ref'|'name', raw, ref?, refCandidates?, name?, country,
 *                    slug?, cacheSlug?, relationId? }}
 *   slug/cacheSlug -> clave en KV ROAD_GEOM (precarga). relationId -> camino fiable.
 */
export function extractRoadQuery(message, countryHint) {
  const msg = String(message || '');
  if (!msg.trim()) return null;
  const country = (countryHint || '').toString().trim();

  // 1) léxico de carreteras famosas (no necesita disparador)
  for (const e of ROAD_LEXICON) {
    const m = msg.match(e.rx);
    if (m) {
      const cc = country || e.cc || '';
      const base = { raw: m[0].trim().toLowerCase(), country: cc, slug: e.slug, cacheSlug: e.slug };
      if (e.id) base.relationId = e.id;
      if (e.ref) {
        const ref = normRefToken(e.ref) || e.ref;
        return { kind: 'ref', ...base, ref, refCandidates: refCandidatesFrom(ref), name: e.name };
      }
      return { kind: 'name', ...base, name: e.name };
    }
  }

  // 2) ref suelto, solo con disparador o palabra de carretera delante
  for (const rx of [RX_TRIGGER_REF, RX_ROADWORD_REF]) {
    const m = msg.match(rx);
    if (m && m[1]) {
      const ref = normRefToken(m[1]);
      if (!ref) continue;
      // descartar números "pelados" sin contexto fuerte (p.ej. "sigue 20 min")
      const hasPrefix = /^[A-Za-z]/.test(ref);
      const strongCtx = new RegExp(ROADWORD, 'i').test(m[0]);
      if (!hasPrefix && !strongCtx) continue;
      return { kind: 'ref', raw: m[0].trim().toLowerCase(), ref,
        refCandidates: refCandidatesFrom(ref), country };
    }
  }

  return null;
}

// PASO A: descubrir relaciones candidatas SIN geometría (rápido).
function buildDiscoverQuery(iso, { refCandidates, nameRaw }) {
  const clauses = [];
  for (const r of refCandidates || []) {
    const rr = r.replace(/"/g, '');
    clauses.push(`relation["type"~"route|superroute"]["ref"="${rr}"](area.a);`);
  }
  if (nameRaw) {
    const esc = reEscape(nameRaw);
    clauses.push(`relation["type"~"route|superroute"]["name"~"^${esc}$",i](area.a);`);
    clauses.push(`relation["type"~"route|superroute"]["name"~"${esc}",i](area.a);`);
  }
  // 'out;' (no 'geom'): trae tags + lista de miembros (refs, sin coords). Ligero.
  return `[out:json][timeout:60];
area["ISO3166-1"="${iso}"][admin_level=2]->.a;
(
  ${clauses.join('\n  ')}
);
out;`;
}

// PASO B: bajar la geometría de las relaciones ya elegidas.
function buildByIdQuery(ids) {
  return `[out:json][timeout:180];relation(id:${ids.join(',')});out geom;`;
}

// ───────────────── selección de la relación ─────────────────
function scoreRelation(rel, { refNorm, nameLc }) {
  const t = rel.tags || {};
  const ref = (t.ref || '').toUpperCase().replace(/\s+/g, '');
  const name = (t.name || '').toLowerCase();
  const net = (t.network || '').toLowerCase();
  let sc = 0;
  if (refNorm) {
    if (ref === refNorm) sc += 100;
    else if (ref && (ref.includes(refNorm) || refNorm.includes(ref))) sc += 35;
  }
  if (nameLc) {
    if (name === nameLc) sc += 80;
    else if (name.includes(nameLc)) sc += 40;
  }
  if (/national|state|trunk|primary|federal|autopista|nacional/.test(net)) sc += 30;
  if ((t.type || '') === 'route') sc += 10;
  // penalizar líneas de bus / rutas que no son de carretera
  if (t.route && t.route !== 'road') sc -= 60;
  // desempate suave: nº de miembros (proxy de longitud) o geometría si la trae
  let geomKm = 0;
  for (const m of rel.members || []) {
    if (m.type === 'way' && Array.isArray(m.geometry) && m.geometry.length > 1) {
      geomKm += polyLen(m.geometry.map((g) => [g.lat, g.lon])) / 1000;
    }
  }
  sc += geomKm ? Math.min(20, geomKm / 100) : Math.min(15, (rel.members || []).length / 40);
  return sc;
}

function pickRelation(elements, sel) {
  const rels = (elements || []).filter((e) => e.type === 'relation');
  let best = null, bestSc = -1;
  for (const r of rels) {
    const sc = scoreRelation(r, sel);
    if (sc > bestSc) { bestSc = sc; best = r; }
  }
  return { rel: best, score: bestSc };
}

// junta los ways con geometría de una relación; devuelve también ids de relaciones hijas
function collectWays(rel, seenWays) {
  const ways = [];
  const childRelIds = [];
  for (const m of rel.members || []) {
    if (m.type === 'way' && Array.isArray(m.geometry) && m.geometry.length > 1) {
      if (seenWays.has(m.ref)) continue;
      seenWays.add(m.ref);
      ways.push({ id: m.ref, pts: m.geometry.map((g) => [g.lat, g.lon]) });
    } else if (m.type === 'relation') {
      childRelIds.push(m.ref);
    }
  }
  return { ways, childRelIds };
}

// ───────────────── normalización de entrada ─────────────────
function slugify(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
const looksLikeRef = (s) => /^[a-z]{0,3}[- ]?\d{1,4}[a-z]?$/i.test(String(s || '').trim());

function normalizeInput(input) {
  if (input && typeof input === 'object') {
    const country = (input.country || '').toString().trim();
    const cacheSlug = (input.cacheSlug || input.slug || '').toString().trim() || null;
    if (input.relationId) return { mode: 'id', relationId: Number(input.relationId), country, cacheSlug };
    const refCandidates = Array.isArray(input.refCandidates) && input.refCandidates.length ? input.refCandidates : null;
    if (input.ref || refCandidates) return { mode: 'ref', ref: input.ref ? String(input.ref).trim() : null, refCandidates, name: input.name || null, country, cacheSlug };
    if (input.name) return { mode: 'name', ref: null, refCandidates: null, name: String(input.name).trim(), query: String(input.name).trim(), country, cacheSlug };
    if (input.query) {
      const q = String(input.query).trim();
      return { mode: looksLikeRef(q) ? 'ref' : 'name', ref: looksLikeRef(q) ? q : null, name: looksLikeRef(q) ? null : q, query: q, country, cacheSlug };
    }
  }
  const q = String(input || '').trim();
  return { mode: looksLikeRef(q) ? 'ref' : 'name', ref: looksLikeRef(q) ? q : null, name: looksLikeRef(q) ? null : q, query: q, country: '', cacheSlug: null };
}

function classify(stitchRes, totalKm) {
  if (!stitchRes.chain || stitchRes.chain.length < 2) return 'no_geometry';
  const bigGaps = stitchRes.gaps.filter((g) => g.dist > GAP_THRESHOLD_M);
  const maxGapM = bigGaps.reduce((mx, g) => Math.max(mx, g.dist), 0);
  const fragRatio = (stitchRes.fragLenM || 0) / Math.max(1, totalKm * 1000);
  if (bigGaps.length === 0 && fragRatio < 0.01) return 'clean';
  if (bigGaps.length <= 6 && maxGapM < 15000 && fragRatio < 0.15) return 'minor_gaps';
  return 'fragmented';
}

// ───────────────────────── público ─────────────────────────
export async function resolveNamedRoad(input, deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const kv = deps.kv || null;
  const n = normalizeInput(input);

  // Clave preferente: slug estable del léxico/precarga (road_geom:v1:{cc}:{slug}).
  // Si no hay slug: por relación (id) o por país+texto (resolución libre).
  const ccKey = (n.country && n.country.length === 2 ? n.country : (ISO_BY_NAME[(n.country || '').toLowerCase()] || 'xx')).toLowerCase();
  const cacheKey = n.cacheSlug
    ? `${KV_PREFIX}${ccKey}:${n.cacheSlug}`
    : n.mode === 'id'
      ? `${KV_PREFIX}rel:${n.relationId}`
      : `${KV_PREFIX}${ccKey}:${slugify(n.query || n.ref || n.name)}`;

  if (kv && !deps.nocache) {
    try {
      const hit = await kv.get(cacheKey);
      if (hit) { const r = JSON.parse(hit); r.cached = true; return r; }
    } catch (_) {}
  }

  // cacheOnly: para el camino caliente (generar ruta). Si no está en KV, se rinde
  // al instante en vez de llamar a Overpass en vivo (que tarda 60-140s y bloquearía
  // la entrega de la ruta). La resolución en vivo se hace offline con precarga-roads.mjs.
  if (deps.cacheOnly) return { schema: ROAD_SCHEMA, ok: false, reason: 'not_cached' };

  // ── elegir la relación ──
  let relId;
  let tags = null;
  try {
    if (n.mode === 'id') {
      relId = n.relationId;
    } else {
      if (!n.country) return fail('low_confidence'); // ref/name necesitan país
      const iso = n.country.length === 2 ? n.country.toUpperCase() : ISO_BY_NAME[n.country.toLowerCase()];
      if (!iso) return fail('low_confidence');
      const refCandidates = n.refCandidates || (n.ref ? refCandidatesFrom(n.ref) : null);
      // PASO A: descubrir candidatas sin geometría (rápido)
      const jd = await overpassQuery(buildDiscoverQuery(iso, { refCandidates, nameRaw: n.name }), fetchImpl, { endpoints: deps.endpoints });
      const sel = {
        refNorm: n.ref ? n.ref.toUpperCase().replace(/\s+/g, '') : (refCandidates && refCandidates[0]) || null,
        nameLc: n.name ? n.name.toLowerCase() : null,
      };
      const { rel: pick, score } = pickRelation(jd.elements, sel);
      if (!pick) return maybeCacheNeg('not_found');
      if (score < MIN_SELECT_SCORE) return maybeCacheNeg('low_confidence');
      relId = pick.id;
      tags = pick.tags || null;
    }
  } catch (e) {
    return fail('overpass_error', e && e.message);
  }

  // ── PASO B: bajar geometría de la relación elegida (+ superroutes) ──
  const seen = new Set();
  let ways = [];
  let rel = null;
  let idsToFetch = [relId];
  let level = 0;
  try {
    while (idsToFetch.length && level < 4) {
      level++;
      const j = await overpassQuery(buildByIdQuery(idsToFetch.slice(0, 60)), fetchImpl, { endpoints: deps.endpoints, wantElements: level === 1 });
      const next = [];
      for (const e of j.elements || []) {
        if (e.type !== 'relation') continue;
        if (e.id === relId) rel = e;
        const c = collectWays(e, seen);
        ways = ways.concat(c.ways);
        next.push(...c.childRelIds);
      }
      idsToFetch = next;
    }
  } catch (e) {
    return fail('overpass_error', e && e.message);
  }
  if (!rel) rel = { id: relId, tags: tags || {} };
  else if (tags && (!rel.tags || !rel.tags.name)) rel.tags = tags;

  if (!ways.length) return maybeCacheNeg('no_geometry');

  const st = stitch(ways);
  if (!st.chain || st.chain.length < 2) return maybeCacheNeg('no_geometry');

  const geometry = simplify(st.chain, SIMPLIFY_TOL_M);
  const length_km = km1(polyLen(st.chain));
  const continuity = classify(st, length_km);
  const t = rel.tags || {};

  const result = {
    schema: ROAD_SCHEMA,
    ok: true,
    road: {
      name: t.name || t.ref || null,
      ref: t.ref || null,
      network: t.network || null,
      relation_id: rel.id,
      osm_url: `https://www.openstreetmap.org/relation/${rel.id}`,
    },
    geometry,
    length_km,
    continuity,
    gaps: st.gaps.map((g) => ({ lat: g.at[0], lng: g.at[1], km: km1(g.dist) })),
    fragments: st.fragCount,
    fragments_km: km1(st.fragLenM),
    stats: null,
    cached: false,
    resolved_at: new Date().toISOString(),
  };

  if (kv) {
    try { await kv.put(cacheKey, JSON.stringify(result), { expirationTtl: KV_TTL_OK }); } catch (_) {}
  }
  return result;

  function fail(reason, detail) {
    return { schema: ROAD_SCHEMA, ok: false, reason, detail: detail || undefined };
  }
  async function maybeCacheNeg(reason) {
    const r = fail(reason);
    if (kv) { try { await kv.put(cacheKey, JSON.stringify(r), { expirationTtl: KV_TTL_NEG }); } catch (_) {} }
    return r;
  }
}

// mínimo: solo lo que hace falta para el endpoint de debug y el banco de pruebas.
// En producción el país lo resuelve quien llama (resolverPaisDestino) y pasa ISO2.
const ISO_BY_NAME = {
  'portugal': 'PT', 'españa': 'ES', 'espana': 'ES', 'spain': 'ES',
  'argentina': 'AR', 'francia': 'FR', 'france': 'FR', 'italia': 'IT', 'italy': 'IT',
  'chile': 'CL', 'islandia': 'IS', 'iceland': 'IS', 'irlanda': 'IE', 'ireland': 'IE',
  'rumania': 'RO', 'romania': 'RO', 'estados unidos': 'US', 'usa': 'US',
  'reino unido': 'GB', 'uk': 'GB', 'escocia': 'GB', 'noruega': 'NO', 'norway': 'NO',
  'australia': 'AU', 'alemania': 'DE', 'germany': 'DE', 'sudafrica': 'ZA', 'south africa': 'ZA',
  'marruecos': 'MA', 'morocco': 'MA', 'grecia': 'GR', 'greece': 'GR',
};

// ───────────────────────── export helpers ─────────────────────────
export function toGeoJSON(result) {
  if (!result || !result.ok) return { type: 'FeatureCollection', features: [] };
  const features = [{
    type: 'Feature',
    properties: {
      name: result.road.name, ref: result.road.ref,
      length_km: result.length_km, continuity: result.continuity,
    },
    geometry: { type: 'LineString', coordinates: result.geometry.map(([la, lo]) => [lo, la]) },
  }];
  for (const g of result.gaps || []) {
    features.push({
      type: 'Feature',
      properties: { kind: 'gap', km: g.km },
      geometry: { type: 'Point', coordinates: [g.lng, g.lat] },
    });
  }
  return { type: 'FeatureCollection', features };
}

export function toGPX(result) {
  if (!result || !result.ok) return '<?xml version="1.0"?><gpx version="1.1"/>';
  const name = (result.road.name || result.road.ref || 'road').replace(/[<>&]/g, '');
  const pts = result.geometry
    .map(([la, lo]) => `<trkpt lat="${la.toFixed(6)}" lon="${lo.toFixed(6)}"/>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="borradodelmapa.com road-resolver" xmlns="http://www.topografix.com/GPX/1/1">
<trk><name>${name}</name><trkseg>${pts}</trkseg></trk>
</gpx>`;
}
