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
//   node scripts/casos.cjs diagnostico <id> <fichero.json>   guarda {causa, archivos, riesgo, coste, propuesta, prueba, rama}
//   node scripts/casos.cjs estado <id> <estado>              nuevo|visto|en_marcha|propuesta|comprobando|arreglado|descartado
//   node scripts/casos.cjs nota <id> "texto"                 nota del caso (la ve Paco en el panel)
//   node scripts/casos.cjs crear <fichero.json>              caso a mano (objeto o lista): {titulo, tipo, zona, gravedad, ejemplo, nota, estado}
//
// Flujo de un caso (ver CLAUDE.md, "Mejora Salma"): leer → diagnosticar → preparar el arreglo en la
// copia (worktree) → `diagnostico` + `estado propuesta` → enseñar a Paco → con su OK subir →
// `estado comprobando` (a las 48 h sin avisos pasa solo a arreglado; si vuelve, se reabre).
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
  if (!res.ok) { console.error('Error ' + res.status + ': ' + (d.error || JSON.stringify(d))); process.exit(1); }
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
      console.log(`${g.id.padEnd(16)} ${String(g.gravedad).padEnd(8)} ${String(g.estado).padEnd(12)} ${String(g.tipo).padEnd(12)} ${String(g.zona).padEnd(9)} ${String(g.count).padStart(3)}× ${g.titulo}${g.diagnostico ? '  [diagnosticado]' : ''}`);
    }
    console.log(`\n${sel.length} casos (${f}) de ${groups.length}`);
  } else if (cmd === 'ver') {
    const { groups } = await call('/admin/feedback-groups');
    const g = groups.find(x => x.id === a1);
    if (!g) { console.error('No existe el caso ' + a1); process.exit(1); }
    console.log(`CASO ${g.id} — ${g.titulo}\n${g.tipo} · ${g.zona} · ${g.gravedad} · estado ${g.estado} (${fecha(g.estado_at)}) · origen ${g.origen}`);
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
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 18).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  }
})();
