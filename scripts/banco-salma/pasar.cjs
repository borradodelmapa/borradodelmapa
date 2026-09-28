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

function prepararCopia(ref) {
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
  console.log(rejuzgar ? `Banco Salma: solo el juez sobre ${rejuzgar.out.length} respuestas guardadas (céntimos)` : `Banco Salma: ${ids.length} preguntas con ${ref ? 'la versión ' + ref : 'el salma-worker.js de esta carpeta'}. Coste aprox: ${(ids.length * 0.05).toFixed(2)} €`);

  prepararCopia(ref);
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
    for (const id of rejuzgar ? [] : ids) {
      process.stdout.write(`  ${id} … `);
      const r = await fetch(`http://127.0.0.1:${PUERTO}/?ids=${encodeURIComponent(id)}`).then(r => r.json());
      const x = r.out[0] || { id, pasa: null, error: 'no existe en preguntas.json' };
      out.push(x); cortadas.push(...(r.escrituras_cortadas || []));
      console.log(x.pasa === true ? '✅' : x.pasa === false ? '❌' : '⚪ ' + (x.error || ''), `(${Math.round((x.ms || 0) / 1000)} s${x.lento ? " ⏱ más de 18 s" : ""})`);
      for (const g of (x.reglas || []).filter(g => !g.cumple)) console.log(`      ✗ ${g.regla} — ${g.por_que}`);
    }
  } catch (e) {
    console.error('\nERROR: ' + e.message + '\n--- log de wrangler ---\n' + log.slice(-3000));
  } finally { parar(); }

  const informe = { nombre, ref: ref || null, fecha: new Date().toISOString(), pasan: out.filter(x => x.pasa).length + '/' + out.length, escrituras_cortadas: cortadas, out };
  fs.mkdirSync(RES, { recursive: true });
  const f = path.join(RES, `${nombre}-${informe.fecha.slice(0, 16).replace(/[:T]/g, '')}.json`);
  fs.writeFileSync(f, JSON.stringify(informe, null, 1));
  console.log(`\nPasan ${informe.pasan}. Escrituras cortadas: ${cortadas.length}. Informe: ${path.relative(RAIZ, f)}`);
}

main().catch(e => { console.error(e); limpiar(); process.exit(1); });
