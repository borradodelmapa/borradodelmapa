#!/usr/bin/env node
// scripts/abrir-tanda.cjs — UN solo comando para preparar una tanda de páginas de destino, en orden, y PARAR si algo falla.
// No sube nada, no toca el Worker y no llama a APIs de pago: coste 0 € (solo Wikimedia, páginas de la web y lecturas de Firestore).
//
// Uso:
//   node scripts/abrir-tanda.cjs <slug> [<slug> …]       prepara esas páginas
//   node scripts/abrir-tanda.cjs --siguientes 20          propone y prepara las 20 siguientes con guía que aún no están abiertas
//   --max 30                                             tope por tanda (por defecto 30; un fallo afecta a 30 páginas, no a 1.700)
//   --confirmar                                          (DESPUÉS de revisar la hoja y con el OK de Paco) añade los slugs a
//                                                        destinos-indexables.json y regenera sitemap-destinos.xml
//
// Pasos: 1 solo entra lo que tiene guía → 2 fotos libres de Wikimedia (+paisaje cercano) → 3 genera SOLO esas páginas →
//        4 verificador (página + guía de la app) → 5 hoja de fotos para mirar en 30 s → 6 informe. Si falla un paso, se para.
// Después (manual, con OK de Paco): revisar la hoja → --confirmar → commit+push (protocolo) → verificar-destinos.cjs contra la web
//        → abrir «Abrir la guía» en la app → Paco lo ve (§2). Reglas completas: docs/seo-plan-minimo.md.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const ROUTES = path.join(ROOT, 'worker', 'kv', 'routes-nivel3');
const IND_FILE = path.join(__dirname, 'destinos-indexables.json');
const args = process.argv.slice(2);
const val = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const MAX = +(val('--max') || 30);
const ind = JSON.parse(fs.readFileSync(IND_FILE, 'utf8'));
const run = (cmd, a, opt = {}) => spawnSync(process.execPath, [path.join(__dirname, cmd), ...a], Object.assign({ cwd: ROOT, encoding: 'utf8', stdio: opt.mudo ? 'pipe' : 'inherit' }, opt));
const parar = m => { console.log('\n⛔ ' + m + '\nNo se continúa. No se ha subido nada.'); process.exit(1); };

let slugs = args.filter(a => /^[a-z0-9-]+$/.test(a) && !/^\d+$/.test(a) && !['--max'].includes(a));
const sig = val('--siguientes');
if (sig) {
  const ya = new Set(ind.slugs);
  slugs = fs.readdirSync(ROUTES).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')).filter(s => !ya.has(s)).slice(0, +sig);
}

// ── CONFIRMAR: añade a indexables y regenera el sitemap ──
if (args.includes('--confirmar')) {
  if (!slugs.length) parar('Indica los slugs a confirmar (los mismos que preparaste).');
  const nuevos = slugs.filter(s => !ind.slugs.includes(s));
  ind.slugs = ind.slugs.concat(nuevos);
  fs.writeFileSync(IND_FILE, JSON.stringify(ind, null, 1) + '\n');
  run('build-destinos.js', ['--only', slugs.join(',')]);       // para que salgan con robots=index
  run('build-destinos.js', ['--sitemap-only']);
  console.log(`\n✅ ${nuevos.length} slug(s) añadidos a destinos-indexables.json y sitemap regenerado. Ahora: commit + push (protocolo) y repetir verificar-destinos.cjs contra la web.`);
  process.exit(0);
}

if (!slugs.length) parar('Indica slugs o usa --siguientes N.');
if (slugs.length > MAX) parar(`Son ${slugs.length} páginas y el tope por tanda es ${MAX}. Divide la tanda (un fallo no debe afectar a más de ${MAX} a la vez).`);

console.log(`\n▶ TANDA de ${slugs.length} página(s): ${slugs.join(', ')}\n   Coste: 0 € (sin APIs de pago).\n`);

// 1. Solo entra lo que tiene guía
const sinGuia = slugs.filter(s => !fs.existsSync(path.join(ROUTES, s + '.json')));
if (sinGuia.length) parar(`Sin guía (no hay ${ROUTES}\\<slug>.json), no entran: ${sinGuia.join(', ')}.\n   Una página sin guía es solo una ficha corta: no se abre a Google. Crear su guía cuesta (Google + Anthropic): decirlo antes a Paco (§8).`);
console.log('✔ 1/6 todas tienen guía');

// 2. Fotos
console.log('\n── 2/6 fotos libres (Wikimedia) ──');
let r = run('fotos-destinos.cjs', slugs);
if (r.status) parar('Falló la descarga de fotos.');
r = run('fotos-destinos.cjs', ['--completar', ...slugs]);
if (r.status) parar('Falló el paisaje cercano.');

// 3. Generar solo esas páginas
console.log('\n── 3/6 generar las páginas ──');
r = run('build-destinos.js', ['--only', slugs.join(',')], { mudo: true });
if (r.status || /Errores: [1-9]/.test(r.stdout || '')) parar('El generador dio errores.\n' + (r.stdout || '').slice(-400));
console.log('✔ páginas generadas');

// 4. Verificar (página + guía de la app)
console.log('\n── 4/6 verificación (página, datos para Google, fotos, guía de la app) ──');
r = run('verificar-destinos.cjs', ['--local', ...slugs]);
const verificadoOK = r.status === 0;

// 5. Hoja de fotos
console.log('\n── 5/6 hoja de fotos para revisar ──');
let h = '<meta charset="utf-8"><title>Revisión de tanda</title><body style="background:#111;color:#eee;font:12px sans-serif;margin:10px"><h2>Revisión de fotos — mirar de arriba abajo (30 s). Quitar las malas: borrar la entrada en fotos.json y su .jpg</h2>';
for (const s of slugs) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(ROOT, 'destinos', 'img', s, 'fotos.json'), 'utf8')); } catch (_) { continue; }
  h += `<h3 style="margin:14px 0 4px">${s}</h3><div style="display:flex;flex-wrap:wrap;gap:6px">`;
  const add = (t, f, extra) => { h += `<div style="width:170px"><img src="/destinos/img/${s}/${f.file}" style="width:170px;height:110px;object-fit:cover"><div><b>${t}</b>${f.cercana ? ' <span style="color:#fa0">(paisaje cercano)</span>' : ''}<br><span style="color:#999">${(extra || '').slice(0, 46)}</span></div></div>`; };
  if (j.hero) add('PORTADA', j.hero, j.hero.alt);
  for (const [n, f] of Object.entries(j.stops || {})) add(n.slice(0, 30), f, f.fuente);
  h += '</div>';
}
fs.writeFileSync(path.join(ROOT, '_revision-tanda.html'), h);
console.log('✔ Hoja creada: abre http://localhost:<puerto del servidor de la copia>/_revision-tanda.html  (fichero _revision-tanda.html en la raíz; NO se sube)');

// 6. Informe
console.log('\n── 6/6 informe ──');
console.log(verificadoOK ? '✅ La verificación automática pasa.' : '❌ La verificación automática FALLA: arreglar antes de seguir.');
console.log('Falta lo que ninguna máquina ve: (a) mirar la hoja de fotos, (b) abrir 2-3 guías en la app, (c) OK de Paco.');
console.log('Si todo bien →  node scripts/abrir-tanda.cjs --confirmar ' + slugs.join(' ') + '   y luego commit + push.');
process.exit(verificadoOK ? 0 : 1);
