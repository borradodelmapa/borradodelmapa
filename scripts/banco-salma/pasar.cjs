#!/usr/bin/env node
// Banco de preguntas de Salma (caso p-mulj7j4n4mz). Arranca una COPIA de Salma en local (`wrangler dev --remote`,
// no la ve nadie), le pasa las preguntas de preguntas.json y un juez (gpt-4o; el 4o-mini se equivocaba) marca ✅/❌ cada una.
// COSTE (avisar a Paco, §8): Claude Sonnet + Google + juez REALES → ~0,5-1 € las 20; ~0,05 € por pregunta suelta.
//
//   node scripts/banco-salma/pasar.cjs                          → las 20, con el salma-worker.js de esta carpeta
//   node scripts/banco-salma/pasar.cjs --ids perro-ronda,rusia  → solo esas
//   node scripts/banco-salma/pasar.cjs --ref v-pre-prompt-X     → con la Salma de ese commit/tag (para el "antes")
//   node scripts/banco-salma/pasar.cjs --rejuzgar informe.json  → solo el juez otra vez sobre respuestas guardadas (céntimos)
//   node scripts/banco-salma/pasar.cjs --comparar a.json b.json → qué pasaba antes y ahora falla (y al revés), sin gastar
//   --veces 3   → cada pregunta 3 veces (Salma no contesta igual dos veces: cuenta cuántas fallan de N)
//   --grabar                → en vivo, y guarda la CINTA (lo que contestaron Claude, Google, OpenAI y el KV) en grabaciones/
//   --reproducir cinta.json → el código de esta carpeta con las respuestas de la cinta: 0 € (juez solo si cambia la
//                             respuesta, céntimos). Para arreglos de CÓDIGO. Si cambió lo que se manda a la IA (prompt),
//                             esa pregunta sale "⚠ NECESITA EN VIVO" y solo esa se paga.
//   --temp 0.3  → en la copia, las llamadas a Sonnet con ese "azar" (en producción no llevan: van a 1)
//
// Resultados en scripts/banco-salma/resultados/ (no se suben a git).
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..', '..');
const WORKER = path.join(RAIZ, 'worker');
const RES = path.join(__dirname, 'resultados');
const PUERTO = 8798;
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : null; };

function comparar(a, b) {
  const A = JSON.parse(fs.readFileSync(a, 'utf8')), B = JSON.parse(fs.readFileSync(b, 'utf8'));
  const mapa = new Map(A.out.map(x => [x.id, x]));
  console.log(`ANTES ${A.pasan} (${A.nombre})  →  AHORA ${B.pasan} (${B.nombre})`);
  for (const x of B.out) {
    const y = mapa.get(x.id);
    const ant = y ? y.pasa : undefined;
    if (ant === x.pasa) continue;
    const marca = x.pasa === false && ant === true ? '🔴 EMPEORA' : x.pasa === true && ant === false ? '🟢 MEJORA' : '⚪ cambia';
    console.log(`${marca}  ${x.id}`);
    for (const r of (x.reglas || []).filter(r => !r.cumple)) console.log(`      ✗ ${r.regla} — ${r.por_que}`);
  }
}

function prepararCopia(ref, temp) {
  let src = ref
    ? execSync(`git show ${ref}:worker/salma-worker.js`, { cwd: RAIZ, maxBuffer: 64 * 1024 * 1024 }).toString('utf8')
    : fs.readFileSync(path.join(WORKER, 'salma-worker.js'), 'utf8');
  // Usuario falso de prueba y nada de escrituras/efectos: solo en esta copia, nunca en el Worker real.
  const parches = [
    ['verifyAuthAndGetUser', 'if (globalThis.__BANCO_USER) return globalThis.__BANCO_USER;', true],
    ['perfilIALearnFromChat', 'if (globalThis.__BANCO_USER) return;', false],
    ['recordAutoError', 'if (globalThis.__BANCO_USER) return;', false],
    ['logChatLink', 'if (globalThis.__BANCO_USER) return;', false],
    ['logUrlIncidents', 'if (globalThis.__BANCO_USER) return;', false],
  ];
  for (const [fn, linea, obligatorio] of parches) {
    const re = new RegExp(`(async function ${fn}\\([^)]*\\)\\s*\\{)`);
    if (!re.test(src)) { if (obligatorio) throw new Error('no encuentro ' + fn + ' en la copia'); console.warn('aviso: esta versión no tiene ' + fn); continue; }
    src = src.replace(re, `$1 ${linea}`);
  }
  if (temp != null) {
    const n = (src.match(/model: 'claude-sonnet-4-6',/g) || []).length;
    src = src.replace(/model: 'claude-sonnet-4-6',/g, `model: 'claude-sonnet-4-6', temperature: ${temp},`);
    console.log(`temperatura ${temp} en ${n} llamadas a Sonnet (solo en la copia)`);
  }
  fs.writeFileSync(path.join(WORKER, '_banco-salma-worker.js'), src);
  fs.copyFileSync(path.join(__dirname, 'entry.js'), path.join(WORKER, '_banco-entry.js'));
  fs.copyFileSync(path.join(__dirname, 'preguntas.json'), path.join(WORKER, '_banco-preguntas.json'));
  const toml = fs.readFileSync(path.join(WORKER, 'wrangler.toml'), 'utf8')
    .replace(/^main = .*/m, 'main = "_banco-entry.js"')
    .replace(/^\[triggers\][\s\S]*?^crons.*$/m, '');   // la copia no lleva crons
  fs.writeFileSync(path.join(WORKER, '_banco-wrangler.toml'), toml);
}

function limpiar() {
  for (const f of ['_banco-salma-worker.js', '_banco-entry.js', '_banco-preguntas.json', '_banco-wrangler.toml']) {
    try { fs.unlinkSync(path.join(WORKER, f)); } catch (_) {}
  }
}

async function esperarServidor(ms) {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    try { const r = await fetch(`http://127.0.0.1:${PUERTO}/listo`); if (r.status === 404) return; } catch (_) {}
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error('la copia de Salma no arrancó en ' + ms / 1000 + ' s');
}

async function main() {
  if (arg('comparar')) return comparar(arg('comparar'), process.argv[process.argv.indexOf('--comparar') + 2]);
  // --rejuzgar informe.json → vuelve a pasar SOLO el juez sobre las respuestas guardadas (no gasta Claude)
  const rejuzgar = arg('rejuzgar') ? JSON.parse(fs.readFileSync(arg('rejuzgar'), 'utf8')) : null;
  const ref = arg('ref') || (rejuzgar && rejuzgar.ref) || null;
  const banco = JSON.parse(fs.readFileSync(path.join(__dirname, 'preguntas.json'), 'utf8'));
  const ids = arg('ids') ? arg('ids').split(',') : banco.preguntas.map(p => p.id);
  const nombre = (arg('nombre') || (ref ? ref : 'actual')).replace(/[^\w.-]/g, '_');
  const grabar = process.argv.includes('--grabar');
  const cinta = arg('reproducir') ? JSON.parse(fs.readFileSync(arg('reproducir'), 'utf8')) : null;
  const modo = cinta ? 'reproducir' : grabar ? 'grabar' : 'vivo';
  const grabacion = { nombre, ref: ref || null, fecha: new Date().toISOString(), preguntas: {} };
  if (cinta) console.log(`Banco Salma: REPRODUCIR ${ids.length} preguntas con la cinta "${cinta.nombre}" (${cinta.fecha.slice(0, 10)}). Coste: 0 €, salvo el juez si cambia la respuesta (céntimos)`);
  else console.log(rejuzgar ?`Banco Salma: solo el juez sobre ${rejuzgar.out.length} respuestas guardadas (céntimos)` : `Banco Salma: ${ids.length} preguntas con ${ref ? 'la versión ' + ref : 'el salma-worker.js de esta carpeta'}. Coste aprox: ${(ids.length * 0.05).toFixed(2)} €`);

  const temp = arg('temp') != null ? parseFloat(arg('temp')) : null;
  const veces = Math.max(1, parseInt(arg('veces') || '1', 10));
  prepararCopia(ref, temp);
  const dev = spawn('npx', ['wrangler', 'dev', '-c', '_banco-wrangler.toml', '--remote', '--port', String(PUERTO)], { cwd: WORKER, shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  dev.stdout.on('data', d => { log += d; }); dev.stderr.on('data', d => { log += d; });
  const parar = () => { try { if (process.platform === 'win32') execSync(`taskkill /pid ${dev.pid} /T /F`, { stdio: 'ignore' }); else dev.kill(); } catch (_) {} limpiar(); };
  process.on('SIGINT', () => { parar(); process.exit(1); });

  const out = [], cortadas = [];
  try {
    await esperarServidor(120000);
    if (rejuzgar) {
      for (const y of rejuzgar.out.filter(y => ids.includes(y.id) && y.respuesta)) {
        process.stdout.write(`  ${y.id} (re-juzgado) … `);
        const v = await fetch(`http://127.0.0.1:${PUERTO}/juzgar`, { method: 'POST', body: JSON.stringify({ id: y.id, respuesta: y.respuesta }) }).then(r => r.json());
        const x = { ...y, ...v, juez_anterior: y.pasa };
        out.push(x);
        console.log(x.pasa === true ? '✅' : x.pasa === false ? '❌' : '⚪ ' + (x.error || ''), `(antes el juez dijo ${y.pasa ? '✅' : '❌'})`);
        for (const g of (x.reglas || []).filter(g => !g.cumple)) console.log(`      ✗ ${g.regla} — ${g.por_que}`);
      }
    }
    for (const id of rejuzgar ? [] : ids.flatMap(i => Array(veces).fill(i))) {
      process.stdout.write(`  ${id} … `);
      // La copia remota a veces se cae ("fetch failed"): se espera a que vuelva y se repite UNA vez
      const cuerpo = { ids: [id], modo, cintas: cinta && cinta.preguntas[id] ? { [id]: cinta.preguntas[id] } : {} };
      const pedir = () => fetch(`http://127.0.0.1:${PUERTO}/`, { method: 'POST', body: JSON.stringify(cuerpo) }).then(r => r.json());
      let r;
      try { r = await pedir(); } catch (e) {
        process.stdout.write(`(se cayó la copia: ${e.message}; reintento) … `);
        await esperarServidor(120000); r = await pedir();
      }
      const x = r.out[0] || { id, pasa: null, error: 'no existe en preguntas.json' };
      if (x.cinta) { grabacion.preguntas[id] = x.cinta; delete x.cinta; }
      out.push(x); cortadas.push(...(r.escrituras_cortadas || []));
      const g = x.gasto || {};
      const eur = g.total != null ? ` · ${g.total.toFixed(3)} € (Claude ${(g.claude || 0).toFixed(3)} · Google ${(g.google || 0).toFixed(3)} · juez ${(g.juez || 0).toFixed(3)})` : '';
      let marca = '';
      if (x.reproduccion) {
        const antes = cinta.preguntas[id] && cinta.preguntas[id].veredicto;
        const R = x.reproduccion;
        marca = (R.misma_respuesta ? ' · misma respuesta que la cinta' : ' · respuesta distinta')
          + (x.necesita_vivo ? ' · ⚠ NECESITA EN VIVO (cambió lo que se manda a la IA)' : '')
          + (R.faltan ? ` · ${R.faltan} llamadas nuevas sin grabar` : '')
          + (antes && antes.pasa === true && x.pasa === false ? ' 🔴 EMPEORA' : antes && antes.pasa === false && x.pasa === true ? ' 🟢 MEJORA' : '');
      }
      console.log(x.pasa === true ? '✅' : x.pasa === false ? '❌' : '⚪ ' + (x.error || ''), `(${Math.round((x.ms || 0) / 1000)} s${x.lento ? " ⏱ más de 18 s" : ""})${eur}${marca}`);
      for (const c of (x.llamadas || []).filter(c => c.dif)) {
        console.log(`      ⚠ ${c.tipo} distinta:\n        cinta: …${c.dif.antes.replace(/\s+/g, ' ')}…\n        ahora: …${c.dif.ahora.replace(/\s+/g, ' ')}…`);
      }
      for (const g of (x.reglas || []).filter(g => !g.cumple)) console.log(`      ✗ ${g.regla} — ${g.por_que}`);
    }
  } catch (e) {
    console.error('\nERROR: ' + e.message + '\n--- log de wrangler ---\n' + log.slice(-3000));
  } finally { parar(); }

  if (veces > 1) {
    console.log('\nPor pregunta (bien de ' + veces + '):');
    for (const id of ids) { const r = out.filter(x => x.id === id); console.log(`  ${id}: ${r.filter(x => x.pasa).length}/${r.length}`); }
  }
  const total = out.reduce((a, x) => a + ((x.gasto && x.gasto.total) || 0), 0);
  const vivo = out.filter(x => x.necesita_vivo).map(x => x.id);
  if (grabar && Object.keys(grabacion.preguntas).length) {
    const dir = path.join(__dirname, 'grabaciones');
    fs.mkdirSync(dir, { recursive: true });
    const fg = path.join(dir, `${nombre}-${grabacion.fecha.slice(0, 16).replace(/[:T]/g, '')}.json`);
    fs.writeFileSync(fg, JSON.stringify(grabacion));
    console.log(`Cinta guardada: ${path.relative(RAIZ, fg)} (${(fs.statSync(fg).size / 1e6).toFixed(1)} MB)`);
  }
  if (cinta) console.log(vivo.length ? '\n⚠ Necesitan pasarse EN VIVO (cambió lo que recibe la IA): --ids ' + vivo.join(',') : '\nNinguna pregunta necesita ir en vivo: el cambio no toca lo que recibe la IA.');
  console.log(`\nGasto medido: ${total.toFixed(3)} € (${out.length} respuestas, ${out.length ? (total / out.length).toFixed(3) : 0} € de media)`);
  const informe = { nombre, modo, cinta: cinta ? cinta.nombre : null, gasto_total: total, necesitan_vivo: vivo, ref: ref || null, temp, veces, fecha: new Date().toISOString(), pasan: out.filter(x => x.pasa).length + '/' + out.length, escrituras_cortadas: cortadas, out };
  fs.mkdirSync(RES, { recursive: true });
  const f = path.join(RES, `${nombre}-${informe.fecha.slice(0, 16).replace(/[:T]/g, '')}.json`);
  fs.writeFileSync(f, JSON.stringify(informe, null, 1));
  console.log(`\nPasan ${informe.pasan}. Escrituras cortadas: ${cortadas.length}. Informe: ${path.relative(RAIZ, f)}`);
}

main().catch(e => { console.error(e); limpiar(); process.exit(1); });
