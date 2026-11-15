// FICHAS CON FUENTES, AUTOMÁTICAS (15 nov 2026, Paco, caso p-mwfityix43c). Modelo aprobado: docs/fichas/MODELO-chitwan-nepal.md
//
//   node generar.mjs np                 → todos los destinos de Nepal (los de worker/kv/output-spots/np_*.json)
//   node generar.mjs np pokhara         → solo los que contengan «pokhara» en el nombre del fichero
//   node generar.mjs np --seco          → no llama a Claude: solo dice qué fuentes encuentra y cuánto texto
//
// Cómo trabaja, por destino:
//   1. Lee GRATIS las fuentes: Wikipedia en inglés y en español, y Wikivoyage en inglés (texto entero del artículo).
//   2. Claude (Opus 5.5) escribe la ficha con el formato del modelo. CADA dato lleva la fuente y una CITA LITERAL de ella.
//   3. El programa comprueba que cada cita está de verdad, letra por letra, en el texto de esa fuente. Si no está, el dato
//      se cae y va a la lista de dudas. Nada se escribe «de memoria».
//   4. Con los datos que han pasado, una segunda llamada (corta) escribe el bloque SEO.
//   5. Guarda la ficha en worker/kv/fichas/auto/<cc>_<id>.json y las dudas del país en docs/fichas/auto/<cc>-dudas.md.
// NO sube nada a la base de la app ni toca el Worker: eso se decide con Paco después de revisarlas.
//
// COSTE (§8): ~0,10-0,20 € por destino (Opus 5.5: ~15-25 mil fichas de entrada y ~3-5 mil de salida, más el SEO).
// Lo real sale medido al final de cada pasada. Las fuentes (Wikipedia, Wikivoyage) son gratis.
// Llave: api/«api antropich salma new.txt» (gitignored) o ANTHROPIC_API_KEY.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const SPOTS = path.join(RAIZ, 'worker', 'kv', 'output-spots');
const SALIDA = path.join(RAIZ, 'worker', 'kv', 'fichas', 'auto');
const DUDAS = path.join(RAIZ, 'docs', 'fichas', 'auto');
const MODELO = 'claude-opus-5-5';
const PRECIO = { in: 4 / 1e6, out: 20 / 1e6, usd_eur: 0.92 };   // Opus 5.5, $ por ficha de texto
const UA = 'BorradoDelMapa/1.0 (https://borradodelmapa.com; fichas con fuentes)';

const args = process.argv.slice(2);
const cc = (args[0] || '').toLowerCase();
const filtro = args.find((a, i) => i > 0 && !a.startsWith('--')) || '';
const seco = args.includes('--seco');
if (!/^[a-z]{2}$/.test(cc)) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 7).join('\n')); process.exit(1); }

function llave() {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY.trim();
  for (const d of [path.join(RAIZ, 'api'), 'C:/Users/User/Desktop/salma/api']) {
    try { const t = fs.readFileSync(path.join(d, 'api antropich salma new.txt'), 'utf8').match(/sk-ant-[\w-]+/); if (t) return t[0]; } catch (_) {}
  }
  throw new Error('Falta la llave de Claude (api/«api antropich salma new.txt» o ANTHROPIC_API_KEY)');
}

// ── Fuentes gratis ──────────────────────────────────────────────────────────────────────────────────────────────
const limpia = s => String(s || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
async function wikiBuscar(host, consulta) {
  const u = `https://${host}/w/api.php?` + new URLSearchParams({ action: 'query', list: 'search', srsearch: consulta, srlimit: '3', format: 'json' });
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) return [];
  const j = await r.json();
  return ((j.query && j.query.search) || []).map(x => x.title);
}
async function wikiTexto(host, titulo) {
  const u = `https://${host}/w/api.php?` + new URLSearchParams({ action: 'query', prop: 'extracts|revisions', rvprop: 'timestamp', explaintext: '1', redirects: '1', titles: titulo, format: 'json' });
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) return null;
  const j = await r.json();
  const p = Object.values((j.query && j.query.pages) || {})[0];
  if (!p || !p.extract || p.missing !== undefined) return null;
  return { titulo: p.title, texto: limpia(p.extract), revisado: (p.revisions && p.revisions[0] && p.revisions[0].timestamp || '').slice(0, 10), url: `https://${host}/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}` };
}
// El artículo que ES el destino, no uno que solo lo nombra («Aeropuerto de Pokhara», «Chitwan District»):
// primero el título exacto de cada nombre; si no, el resultado de búsqueda con más puntos (título igual > contiene el
// nombre entero > comparte palabras), y nunca uno de otro tipo de sitio (aeropuerto, distrito, montaña, templo…)
// que el nombre del destino no lleve.
const _n = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const OTRO_TIPO = /\b(aeropuerto|airport|district|distrito|municipality|municipio|provincia|province|templo|temple|palacio|palace|lirung|monte|mount|peak|pico|river|rio|lake|lago|zone|zona|batalla|battle)\b/;
async function wikiMejor(host, consultas, nombres) {
  const ns = [...new Set(nombres.map(_n).filter(Boolean))];
  const otroTipo = t => OTRO_TIPO.test(_n(t)) && !ns.some(n => OTRO_TIPO.test(n));
  for (const t of nombres) { const x = await wikiTexto(host, t); if (x && x.texto.length > 800 && !otroTipo(x.titulo)) return x; }
  const pal = s => _n(s).split(' ').filter(w => w.length > 3 && !['parque', 'nacional', 'national', 'park', 'valle', 'valley', 'circuito', 'circuit', 'campo', 'base', 'royal'].includes(w));
  const claves = new Set(nombres.flatMap(pal));
  const cand = [];
  for (const q of consultas) for (const t of await wikiBuscar(host, q)) {
    if (otroTipo(t)) continue;
    const nt = _n(t);
    const pts = ns.includes(nt) ? 3 : ns.some(n => nt.includes(n) || n.includes(nt)) ? 2 : pal(t).some(w => claves.has(w)) ? 1 : 0;
    if (pts) cand.push({ t, pts });
  }
  cand.sort((a, b) => b.pts - a.pts);
  for (const c of cand) { const x = await wikiTexto(host, c.t); if (x && x.texto.length > 800) return x; }
  return null;
}
async function fuentes(spot, pais) {
  const nombres = [spot.nombre, ...(spot.keywords || []).slice(0, 4)];
  const en = (spot.keywords || []).find(k => /^[\x00-\x7f]+$/.test(k) && /[A-Z]/.test(k)) || spot.nombre;
  const [w1, w2, wv] = await Promise.all([
    wikiMejor('en.wikipedia.org', [`${en} ${pais.en}`, en], nombres),
    wikiMejor('es.wikipedia.org', [`${spot.nombre} ${pais.es}`, spot.nombre], nombres),
    wikiMejor('en.wikivoyage.org', [en, spot.nombre], nombres),
  ]);
  const out = {};
  if (w1) out.W1 = { ...w1, nombre: `Wikipedia (en), «${w1.titulo}»`, tipo: 'referencia', texto: w1.texto.slice(0, 60000) };
  if (w2) out.W2 = { ...w2, nombre: `Wikipedia (es), «${w2.titulo}»`, tipo: 'referencia', texto: w2.texto.slice(0, 40000) };
  if (wv) out.WV = { ...wv, nombre: `Wikivoyage (en), «${wv.titulo}», revisión del ${wv.revisado}`, tipo: 'referencia', texto: wv.texto.slice(0, 40000) };
  return out;
}

// ── La ficha ────────────────────────────────────────────────────────────────────────────────────────────────────
const DATO = { type: 'object', additionalProperties: false, required: ['t', 'f', 'cita'], properties: {
  t: { type: 'string', description: 'el dato en español, una frase clara y corta' },
  f: { type: 'string', description: 'clave de la fuente: W1, W2 o WV' },
  cita: { type: 'string', description: 'fragmento LITERAL de esa fuente, copiado letra por letra en su idioma original, de 6 a 40 palabras, que dice este dato' },
} };
const lista = d => ({ type: 'array', description: d, items: DATO });
const FICHA = { type: 'object', additionalProperties: false,
  required: ['estable', 'cuando', 'fauna', 'sitios', 'normas', 'cambia', 'llegar', 'gente', 'delicado', 'no_escribir'],
  properties: {
    estable: lista('historia, geografía, tamaño, fechas clave'),
    cuando: lista('mejor época, clima por meses, cuántos días'),
    fauna: lista('qué animales o plantas se ven de verdad y con qué probabilidad; vacío si no aplica (ciudad, templo…)'),
    sitios: { type: 'array', description: 'los sitios concretos de dentro o junto al destino, cada uno con la actividad que se hace allí', items: { type: 'object', additionalProperties: false, required: ['hace', 'maps', 'nota', 'f', 'cita'], properties: {
      hace: { type: 'string', description: 'qué se hace allí, en español' },
      maps: { type: 'string', description: 'nombre del sitio tal como saldría en Google Maps (el nombre propio más usado)' },
      nota: { type: 'string', description: 'algo útil y comprobado en la cita (ej. «fuera del parque»); vacío si nada' },
      f: { type: 'string' }, cita: { type: 'string', description: 'fragmento LITERAL de la fuente que nombra este sitio' },
    } } },
    normas: lista('permisos, obligaciones, prohibiciones, horarios de apertura que dice la fuente'),
    cambia: { type: 'array', description: 'precios, horarios y tarifas: SOLO si la fuente los da; con el año si la fuente lo dice', items: { type: 'object', additionalProperties: false, required: ['t', 'f', 'cita', 'de_cuando'], properties: {
      t: { type: 'string' }, f: { type: 'string' }, cita: { type: 'string' },
      de_cuando: { type: 'string', description: 'año o fecha del dato según la fuente; vacío si la fuente no lo dice' },
    } } },
    llegar: lista('cómo llegar: aeropuertos, carreteras, transporte'),
    gente: lista('pueblos y culturas del lugar, su historia, cómo visitarlos con respeto'),
    delicado: lista('lo que conviene saber antes de pagar o hacer algo (animales en cautividad, lugares sagrados, conflictos)'),
    no_escribir: { type: 'array', description: 'datos que se repiten mucho en internet sobre este sitio y que estas fuentes NO confirman o contradicen', items: { type: 'string' } },
  } };

const SISTEMA = `Preparas la ficha de un destino de viaje para Borrado del Mapa. La ficha es la verdad que luego usa la app para escribir guías, así que SOLO puede llevar lo que dicen las fuentes que te paso.
Reglas:
- Cada dato lleva la clave de su fuente y una cita LITERAL de esa fuente, copiada letra por letra en su idioma, que diga ese dato. Si no encuentras la cita, el dato NO va.
- Nada de memoria, nada de «se suele decir», nada que no esté en las fuentes. Mejor una ficha corta que un dato sin cita.
- Español de España, frases cortas y concretas, sin adjetivos vacíos.
- Precios y horarios solo si la fuente los da, y entonces con el año que diga la fuente.
- En «sitios», solo lugares concretos que la fuente nombra, con el nombre propio que usaría Google Maps.
- En «no_escribir», pon lo que en internet se repite sobre este sitio y estas fuentes desmienten o no dicen (sin cita).`;

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[‘’‛′`´]/g, "'").replace(/[“”«»]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
function comprobar(ficha, fu, dudas, destino) {
  let ok = 0, fuera = 0;
  const vale = (x, bloque) => {
    const src = fu[x.f];
    const bien = !!(src && x.cita && x.cita.split(/\s+/).length >= 4 && norm(src.texto).includes(norm(x.cita)));
    if (bien) { ok++; return true; }
    fuera++;
    dudas.push(`| ${destino} | ${bloque} | ${String(x.t || x.maps || '').replace(/\|/g, '/')} | ${src ? 'la cita no está en ' + x.f : 'fuente «' + x.f + '» desconocida'} |`);
    return false;
  };
  for (const b of ['estable', 'cuando', 'fauna', 'sitios', 'normas', 'cambia', 'llegar', 'gente', 'delicado']) {
    ficha[b] = (ficha[b] || []).filter(x => vale(x, b)).map(x => { const { cita, ...resto } = x; return { ...resto, f: [x.f], cita }; });
  }
  return { ok, fuera };
}

const SEO = { type: 'object', additionalProperties: false, required: ['titulo', 'descripcion', 'faq'], properties: {
  titulo: { type: 'string', description: 'máx. 58 caracteres: nombre del destino + qué ver y cómo ir + (año)' },
  descripcion: { type: 'string', description: '140-155 caracteres, con datos concretos de la ficha' },
  faq: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['p', 'r'], properties: { p: { type: 'string' }, r: { type: 'string' } } } },
} };

let gasto = { in: 0, out: 0 };
async function pedir(client, system, user, schema, maxTokens) {
  const stream = client.beta.messages.stream({
    model: MODELO,
    max_tokens: maxTokens,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'high', format: { type: 'json_schema', schema } },
    system,
    messages: [{ role: 'user', content: user }],
  });
  const m = await stream.finalMessage();
  gasto.in += m.usage.input_tokens || 0; gasto.out += m.usage.output_tokens || 0;
  if (m.stop_reason === 'refusal') throw new Error('Claude rechazó la petición');
  if (m.stop_reason === 'max_tokens') throw new Error('respuesta cortada por largo');
  const txt = m.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(txt);
}

const PAISES = { np: { es: 'Nepal', en: 'Nepal' } };
async function main() {
  const pais = PAISES[cc] || { es: cc.toUpperCase(), en: cc.toUpperCase() };
  const ficheros = fs.readdirSync(SPOTS).filter(f => f.startsWith(cc + '_') && f.includes(filtro)).sort();
  if (!ficheros.length) throw new Error('No hay destinos de ' + cc + (filtro ? ' con «' + filtro + '»' : ''));
  console.log(`${ficheros.length} destino(s) de ${pais.es}${seco ? ' — EN SECO (sin Claude, 0 €)' : ''}`);
  const client = seco ? null : new Anthropic({ apiKey: llave() });
  fs.mkdirSync(SALIDA, { recursive: true }); fs.mkdirSync(DUDAS, { recursive: true });
  const dudas = [], resumen = [];
  const hoy = new Date().toISOString().slice(0, 10);
  const mas = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
  for (const f of ficheros) {
    const spot = JSON.parse(fs.readFileSync(path.join(SPOTS, f), 'utf8'));
    const id = f.replace(/^[a-z]{2}_/, '').replace(/\.json$/, '');
    const fu = await fuentes(spot, pais);
    const ks = Object.keys(fu);
    const chars = ks.reduce((a, k) => a + fu[k].texto.length, 0);
    console.log(`\n· ${spot.nombre}: ${ks.map(k => fu[k].nombre).join(' · ') || 'SIN FUENTES'} (${chars} caracteres)`);
    if (!ks.length) { dudas.push(`| ${spot.nombre} | — | sin ficha | no se encontró ninguna fuente |`); resumen.push({ destino: spot.nombre, datos: 0, caidos: 0, fuentes: 0 }); continue; }
    if (seco) continue;
    const g0 = { ...gasto };
    try {
      const textoFuentes = ks.map(k => `<fuente clave="${k}" nombre="${fu[k].nombre}">\n${fu[k].texto}\n</fuente>`).join('\n\n');
      const ficha = await pedir(client, SISTEMA, `Destino: ${spot.nombre} (${pais.es}). Prepara su ficha solo con estas fuentes.\n\n${textoFuentes}`, FICHA, 32000);
      const { ok, fuera } = comprobar(ficha, fu, dudas, spot.nombre);
      const datos = ['estable', 'cuando', 'fauna', 'normas', 'cambia', 'llegar', 'gente', 'delicado'].flatMap(b => ficha[b].map(x => x.t));
      const seo = datos.length >= 4
        ? await pedir(client, 'Escribes el SEO de una página de destino de viaje (Borrado del Mapa). Usa SOLO los datos que te paso; si una pregunta no se puede contestar con ellos, no la pongas. Español de España.', `Destino: ${spot.nombre} (${pais.es}). Año: ${hoy.slice(0, 4)}.\nDATOS COMPROBADOS:\n- ${datos.join('\n- ')}\n\nEntre 4 y 7 preguntas frecuentes reales (cuándo ir, cómo llegar, qué se ve, normas…).`, SEO, 4000)
        : null;
      const salida = {
        _nota: `FICHA AUTOMÁTICA CON FUENTES (scripts/fichas/generar.mjs, ${hoy}). Cada dato pasó la comprobación de cita literal. SIN REVISAR por Paco. Clave en KV cuando se apruebe: ficha:${cc}:${(spot.id || id)}.`,
        ref: `${cc}:${spot.id || id}`, nombre: spot.nombre, pais: pais.es,
        revisada: hoy, proxima_revision_cambia: mas(hoy, 6), proxima_revision_estable: mas(hoy, 12),
        estable: ficha.estable, cuando: ficha.cuando, fauna: ficha.fauna,
        sitios: ficha.sitios.map(s => ({ ...s, comprobado: null })),
        normas: ficha.normas, cambia: ficha.cambia, llegar: ficha.llegar, gente: ficha.gente, delicado: ficha.delicado,
        no_escribir: ficha.no_escribir || [],
        seo: seo || null,
        fuentes: Object.fromEntries(ks.map(k => [k, { nombre: fu[k].nombre, url: fu[k].url, tipo: fu[k].tipo, leida: hoy }])),
      };
      fs.writeFileSync(path.join(SALIDA, `${cc}_${id}.json`), JSON.stringify(salida, null, 2) + '\n');
      const eur = (((gasto.in - g0.in) * PRECIO.in + (gasto.out - g0.out) * PRECIO.out) * PRECIO.usd_eur);
      console.log(`  ✓ ${ok} datos con cita comprobada · ${fuera} caídos · ${salida.sitios.length} sitios · ${eur.toFixed(3)} €`);
      resumen.push({ destino: spot.nombre, datos: ok, caidos: fuera, fuentes: ks.length, eur });
    } catch (e) {
      console.log('  ✗ ' + e.message);
      dudas.push(`| ${spot.nombre} | — | sin ficha | error: ${String(e.message).replace(/\|/g, '/')} |`);
      resumen.push({ destino: spot.nombre, datos: 0, caidos: 0, fuentes: ks.length, error: e.message });
    }
  }
  if (seco) return;
  const total = (gasto.in * PRECIO.in + gasto.out * PRECIO.out) * PRECIO.usd_eur;
  const md = [`# Dudas de las fichas automáticas — ${pais.es} (${hoy})`, '',
    `Generadas con \`scripts/fichas/generar.mjs ${cc}\`. Coste real: **${total.toFixed(2)} €** (${gasto.in} fichas de entrada, ${gasto.out} de salida).`, '',
    '## Resumen', '', '| Destino | Datos con cita | Caídos | Fuentes |', '|---|---|---|---|',
    ...resumen.map(r => `| ${r.destino} | ${r.datos} | ${r.caidos} | ${r.fuentes}${r.error ? ' · error' : ''} |`), '',
    '## Datos que se cayeron (la cita no estaba en la fuente) y destinos sin ficha', '', '| Destino | Bloque | Dato | Motivo |', '|---|---|---|---|', ...dudas, ''].join('\n');
  fs.writeFileSync(path.join(DUDAS, `${cc}-dudas.md`), md);
  console.log(`\nTOTAL: ${total.toFixed(2)} € · fichas en worker/kv/fichas/auto/ · dudas en docs/fichas/auto/${cc}-dudas.md`);
}
main().catch(e => { console.error('ERROR: ' + e.message); process.exit(1); });
