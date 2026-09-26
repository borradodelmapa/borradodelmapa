#!/usr/bin/env node
// scripts/casos.cjs — leer y escribir los CASOS de "Mejora Salma" desde una sesión de Claude Code
// (Paso A, 26 sept 2026). Los casos viven en Firestore (feedback_groups) y se ven en el panel
// admin → Feedback → Casos. Este script habla con el Worker usando la llave de casos
// (CASES_TOKEN), que SOLO sirve para esto. Copia local de la llave: api/cases-token.txt
// (carpeta gitignored — nunca subirla).
//
// Uso:
//   node scripts/casos.cjs lista [abiertos|todos|<estado>]   casos, urgentes primero
//   node scripts/casos.cjs ver <id>                          caso completo + sus mensajes
//   node scripts/casos.cjs diagnostico <id> <fichero.json>   guarda {causa, archivos, riesgo, coste, propuesta, prueba, rama, enlace} (enlace = URL https para "▶ Abrir para probar")
//   node scripts/casos.cjs estado <id> <estado>              nuevo|visto|en_marcha|propuesta|comprobando|arreglado|descartado
//   node scripts/casos.cjs nota <id> "texto"                 nota del caso (la ve Paco en el panel)
//   node scripts/casos.cjs crear <fichero.json>              caso a mano (objeto o lista): {titulo, tipo, zona, area, gravedad, ejemplo, nota, estado, decision}
//   node scripts/casos.cjs hoy                               AL EMPEZAR UNA SESIÓN: lo que espera a Paco, urgente, en marcha, comentarios de Paco
//   node scripts/casos.cjs comentar <id> "texto"             comentario en el hilo del caso (firmado "Claude")
//   node scripts/casos.cjs coger <id> ["sesión"]             candado: esta sesión trabaja el caso (§1) + estado en_marcha
//   node scripts/casos.cjs soltar <id>                       quita el candado
//   node scripts/casos.cjs area <id> <area>                  fallos|salma|ux|dev|seguridad|costes|negocio|legal
//   node scripts/casos.cjs decision <id> "pregunta"          lo convierte en decisión de Paco ("" la quita)
//   node scripts/casos.cjs version "qué se subió" [ids...]   apunta una subida a producción (Worker + commit solos)
//   node scripts/casos.cjs modelo <id> <sonnet|opus> "por qué"   modelo recomendado para trabajar el caso (Paco lo ve en el panel)
//
// Criterio de modelo (26 sept 2026, para ahorrar sin perder calidad): SONNET = trabajo mecánico o ya
// decidido (mover textos, subir algo aprobado, cambios pequeños y claros, probar, ordenar). OPUS =
// diagnosticar un fallo con causa desconocida, diseñar, tocar el prompt de Salma, seguridad, pagos,
// cualquier cosa con riesgo de romper producción. Ante la duda, Opus para diagnosticar y Sonnet para ejecutar.
// Al crear o diagnosticar un caso, poner siempre su `modelo`.
// Flujo de un caso (ver CLAUDE.md, "Mejora Salma"): `hoy` → `coger` → leer → diagnosticar → preparar el
// arreglo en la copia (worktree) → `diagnostico` + `estado propuesta` (suelta el candado) → enseñar a
// Paco → con su OK subir → `version "…" <id>` + `estado comprobando` (lo cierra Paco al probarlo; un fallo sin avisos en 14 días pasa solo a
// arreglado; si vuelve, se reabre). Al terminar la sesión: `comentar` en lo que quede a medias.
const fs = require('fs');
const path = require('path');

const API = process.env.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
function token() {
  const cands = [
    path.join(__dirname, '..', 'api', 'cases-token.txt'),
    'C:/Users/User/Desktop/salma/api/cases-token.txt',
  ];
  for (const c of cands) { try { const t = fs.readFileSync(c, 'utf8').trim(); if (t) return t; } catch (_) {} }
  console.error('Falta la llave de casos: api/cases-token.txt'); process.exit(1);
}
async function call(p, body) {
  const res = await fetch(API + p, {
    method: body ? 'POST' : 'GET',
    headers: Object.assign({ Authorization: 'Bearer ' + token() }, body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Error ' + res.status + ': ' + (d.error || JSON.stringify(d)));
  return d;
}
const GRAV = { urgente: 0, alta: 1, media: 2, baja: 3 };
const fecha = iso => iso ? String(iso).slice(0, 16).replace('T', ' ') : '—';

(async () => {
  const [cmd, a1, a2] = process.argv.slice(2);
  if (cmd === 'lista') {
    const { groups } = await call('/admin/feedback-groups');
    const f = a1 || 'abiertos';
    const sel = groups.filter(g => f === 'todos' ? true : f === 'abiertos' ? !['arreglado', 'descartado'].includes(g.estado) : g.estado === f)
      .sort((x, y) => (GRAV[x.gravedad] - GRAV[y.gravedad]) || (y.count - x.count));
    for (const g of sel) {
      console.log(`${g.id.padEnd(16)} ${String(g.gravedad).padEnd(8)} ${String(g.estado).padEnd(12)} ${String(g.tipo).padEnd(12)} ${String(g.zona).padEnd(9)} ${String(g.count).padStart(3)}× ${g.titulo}${g.diagnostico ? '  [diagnosticado]' : ''}${g.modelo ? '  [' + g.modelo + ']' : ''}`);
    }
    console.log(`\n${sel.length} casos (${f}) de ${groups.length}`);
  } else if (cmd === 'ver') {
    const { groups } = await call('/admin/feedback-groups');
    const g = groups.find(x => x.id === a1);
    if (!g) throw new Error('No existe el caso ' + a1);
    console.log(`CASO ${g.id} — ${g.titulo}\n${g.tipo} · ${g.zona} · ${g.gravedad} · estado ${g.estado} (${fecha(g.estado_at)}) · origen ${g.origen} · área ${g.area}${g.modelo ? ' · hacer con ' + g.modelo + (g.modelo_por ? ' (' + g.modelo_por + ')' : '') : ''}`);
    console.log(`${g.count} avisos · ${g.reporters} personas · primero ${fecha(g.first_at)} · último ${fecha(g.last_at)}${g.reabierto_at ? ' · REABIERTO ' + fecha(g.reabierto_at) : ''}`);
    if (g.nota) console.log('\nNOTA:\n' + g.nota);
    if (g.ejemplo) console.log('\nEJEMPLO:\n' + g.ejemplo);
    if (g.detalle) console.log('\nDETALLE TÉCNICO:\n' + g.detalle);
    if (g.diagnostico) console.log('\nDIAGNÓSTICO (' + fecha(g.diagnostico_at) + '):\n' + JSON.stringify(g.diagnostico, null, 2));
    if ((g.items || []).length) {
      const { items } = await call('/admin/feedback');
      const its = items.filter(i => g.items.includes(i.id));
      console.log(`\nMENSAJES (${its.length} de ${g.items.length} entre los 100 últimos):`);
      for (const i of its) console.log(`\n— ${fecha(i.at)} · ${i.email || i.user_name || 'anónimo'} · ${i.page || ''}\n${i.note}\n${i.logs ? '  [logs: ' + i.logs.split('\n').slice(-12).join('\n  ') + ']' : ''}`);
    }
  } else if (cmd === 'diagnostico') {
    const dg = JSON.parse(fs.readFileSync(a2, 'utf8'));
    await call('/admin/feedback-group', { id: a1, diagnostico: dg });
    console.log('Diagnóstico guardado en ' + a1);
  } else if (cmd === 'estado') {
    await call('/admin/feedback-group', { id: a1, estado: a2 });
    console.log(a1 + ' → ' + a2);
  } else if (cmd === 'nota') {
    await call('/admin/feedback-group', { id: a1, nota: a2 || '' });
    console.log('Nota guardada en ' + a1);
  } else if (cmd === 'crear') {
    const data = JSON.parse(fs.readFileSync(a1, 'utf8'));
    for (const c of (Array.isArray(data) ? data : [data])) {
      const r = await call('/admin/feedback-group-create', c);
      console.log(r.id + '  ' + c.titulo);
    }
  } else if (cmd === 'hoy') {
    const { groups } = await call('/admin/feedback-groups');
    const open = groups.filter(g => !['arreglado', 'descartado'].includes(g.estado));
    const linea = g => `  ${g.id.padEnd(16)} [${g.area}] ${g.titulo}`;
    const sec = (t, l) => { console.log(`\n${t} (${l.length})`); l.forEach(g => console.log(linea(g) + (g.decision ? '\n      ❓ ' + g.decision : ''))); };
    sec('✅ ESPERA EL OK DE PACO', open.filter(g => g.estado === 'propuesta'));
    sec('🧭 DECISIONES DE PACO', open.filter(g => g.decision));
    sec('📱 PACO TIENE QUE PROBAR', open.filter(g => g.estado === 'comprobando'));
    sec('🚨 URGENTE', open.filter(g => g.gravedad === 'urgente'));
    sec('🔧 EN MARCHA', open.filter(g => g.estado === 'en_marcha').map(g => Object.assign({}, g, { titulo: g.titulo + (g.lock ? '  🔒 ' + g.lock.sesion + ' ' + fecha(g.lock.at) : '') })));
    const semana = Date.now() - 7 * 86400000;
    const coms = [];
    for (const g of groups) for (const c of (g.comentarios || [])) if (c.de === 'paco' && Date.parse(c.at) > semana) coms.push({ g, c });
    console.log(`\n💬 COMENTARIOS DE PACO (7 días) (${coms.length})`);
    coms.sort((a, b) => b.c.at.localeCompare(a.c.at)).forEach(({ g, c }) => console.log(`  ${fecha(c.at)} ${g.id} [${g.titulo.slice(0, 50)}]\n      "${c.texto}"`));
    console.log(`\n${open.length} casos abiertos. Detalle: node scripts/casos.cjs ver <id>`);
  } else if (cmd === 'comentar') {
    await call('/admin/feedback-group', { id: a1, comentario: a2 || '' });
    console.log('Comentario añadido a ' + a1);
  } else if (cmd === 'coger') {
    const { groups } = await call('/admin/feedback-groups');
    const g = groups.find(x => x.id === a1);
    if (g && g.lock && Date.now() - Date.parse(g.lock.at) < 12 * 3600000) {
      console.error(`⚠️ El caso ya lo tiene cogido "${g.lock.sesion}" desde ${fecha(g.lock.at)}. PARAR y preguntar a Paco (CLAUDE.md §1).`);
      process.exitCode = 2; return;
    }
    await call('/admin/feedback-group', { id: a1, estado: 'en_marcha', lock: a2 || ('Claude Code ' + new Date().toISOString().slice(0, 16)) });
    console.log(a1 + ' cogido (en marcha, con candado)');
  } else if (cmd === 'soltar') {
    await call('/admin/feedback-group', { id: a1, lock: '' });
    console.log('Candado quitado de ' + a1);
  } else if (cmd === 'area') {
    await call('/admin/feedback-group', { id: a1, area: a2 });
    console.log(a1 + ' → área ' + a2);
  } else if (cmd === 'decision') {
    await call('/admin/feedback-group', { id: a1, decision: a2 || '' });
    console.log(a2 ? 'Decisión apuntada en ' + a1 : 'Decisión quitada de ' + a1);
  } else if (cmd === 'modelo') {
    await call('/admin/feedback-group', { id: a1, modelo: a2 || '', modelo_por: process.argv[5] || '' });
    console.log(a1 + ' → hacer con ' + (a2 || '(sin recomendar)'));
  } else if (cmd === 'version') {
    const { execSync } = require('child_process');
    let commit = '', worker = '', front = '';
    try { commit = execSync('git rev-parse --short HEAD', { cwd: path.join(__dirname, '..') }).toString().trim(); } catch (_) {}
    try { worker = (await (await fetch(API + '/version')).json()).version_short || ''; } catch (_) {}
    try {
      const idx = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
      front = (idx.match(/(app|salma|mapa-itinerario|debug-panel)\.js\?v=\d+|styles\.css\?v=\d+/g) || []).join(' ');
    } catch (_) {}
    const casos = process.argv.slice(4);
    await call('/admin/deploy-log', { texto: a1, commit, worker, front, casos });
    console.log(`Subida apuntada: "${a1}" · commit ${commit} · Worker ${worker}${casos.length ? ' · casos ' + casos.join(' ') : ''}`);
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 30).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
