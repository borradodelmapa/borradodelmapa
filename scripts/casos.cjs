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
//   node scripts/casos.cjs borrar [<id>...]                  borra casos ya cerrados (sin id: lista los borrables)
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
//   node scripts/casos.cjs enlaces [horas=24] [todos]        enlaces que ha dado el chat (sin "todos": solo los que se quedaron sin enlace)
//   node scripts/casos.cjs guias [n=10]                      últimas guías creadas: camino (lector/Sonnet/fallo), motivo, tiempos, paradas
//   node scripts/casos.cjs gasto [horas=24] [uid]            gasto de Claude por persona y petición del chat (total, caché, las más caras)
//   node scripts/casos.cjs revisor [días=1 | estado | on | off]   revisor de conversaciones: prueba (no escribe) / encender el diario
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
  // Sesiones de Claude Code en la nube: la llave va como variable de entorno CASES_TOKEN
  // en los ajustes del entorno (no hay api/cases-token.txt en el clon de la nube).
  if (process.env.CASES_TOKEN && process.env.CASES_TOKEN.trim()) return process.env.CASES_TOKEN.trim();
  const cands = [
    path.join(__dirname, '..', 'api', 'cases-token.txt'),
    'C:/Users/User/Desktop/salma/api/cases-token.txt',
  ];
  for (const c of cands) { try { const t = fs.readFileSync(c, 'utf8').trim(); if (t) return t; } catch (_) {} }
  return null; // en la nube la cabecera Authorization la pone el entorno
}
async function call(p, body) {
  const t = token();
  const res = await fetch(API + p, {
    method: body ? 'POST' : 'GET',
    headers: Object.assign(t ? { Authorization: 'Bearer ' + t } : {}, body ? { 'Content-Type': 'application/json' } : {}),
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
  } else if (cmd === 'borrar') {
    // Borra casos YA CERRADOS (arreglado/descartado). Sin id: lista los borrables. Varios ids separados por espacio.
    const ids = process.argv.slice(3);
    if (!ids.length) { const { groups } = await call('/admin/feedback-groups'); groups.filter(g => ['arreglado', 'descartado'].includes(g.estado)).forEach(g => console.log(g.id.padEnd(16) + g.estado.padEnd(11) + g.titulo)); return; }
    for (const id of ids) { try { await call('/admin/feedback-group-delete', { id }); console.log(id + ' → borrado'); } catch (e) { console.log(id + ' ✗ ' + e.message); } }
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
    try {
      const { links } = await call('/admin/chat-links?limite=500');
      const r = links.filter(l => Date.parse(l.at) > Date.now() - 86400000);
      const mal = r.filter(l => l.estado !== 'ok');
      console.log(`\n🔗 ENLACES DEL CHAT (24 h): ${r.length - mal.length} dados, ${mal.length} sin enlace → node scripts/casos.cjs enlaces`);
    } catch (e) { console.log('\n🔗 Enlaces del chat: no se pudieron leer (' + e.message + ')'); }
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
  } else if (cmd === 'enlaces') {
    // Registro de enlaces del chat (Firestore chat_links, lo escribe el Worker: logChatLink). Revisar al empezar:
    // ¿el sitio de Google es el que se pedía? ¿km al ancla razonables? ¿qué se quedó sin enlace y por qué?
    const horas = parseInt(a1, 10) || 24;
    const { links } = await call('/admin/chat-links?limite=500');
    const r = links.filter(l => Date.parse(l.at) > Date.now() - horas * 3600000);
    const mal = r.filter(l => l.estado !== 'ok');
    console.log(`Enlaces del chat, últimas ${horas} h: ${r.length - mal.length} dados, ${mal.length} sin enlace\n`);
    const ver = process.argv.includes('todos') ? r : mal;
    for (const l of ver) {
      console.log(`${fecha(l.at)} ${l.estado === 'ok' ? '✅' : '❌ ' + l.estado} [${l.origen}${l.medio ? ' · ' + l.medio : ''}] "${l.pedido}" en ${l.ciudad || '?'}`
        + (l.google ? ` → ${l.google}${typeof l.km === 'number' ? ' (' + l.km + ' km)' : ''}` : '')
        + `\n      mensaje: "${l.mensaje}" · Worker ${String(l.worker || '').slice(0, 8)}`);
    }
    if (ver !== r) console.log(`\n(todos, también los que sí tuvieron enlace: node scripts/casos.cjs enlaces ${horas} todos)`);
  } else if (cmd === 'guias') {
    // Cada "Crear ruta con mapa" (Firestore guide_timings, lo escribe el Worker: logGuideTiming, 30 sept 2026):
    // por qué camino salió (lector / lector+coords / sonnet / fallo), por qué no la cogió el lector y cuánto tardó.
    const n = parseInt(a1, 10) || 10;
    const { guias } = await call('/admin/guide-timings?limite=' + n);
    const s = (ms) => (Number(ms) / 1000).toFixed(1) + ' s';
    const icono = { lector: '⚡', 'lector+coords': '⚡', sonnet: '🐢', fallo: '❌' };
    console.log(`Últimas ${guias.length} guías creadas (⚡ lector · 🐢 reescritura con Sonnet · ❌ fallo)\n`);
    for (const g of guias) {
      console.log(`${fecha(g.at)} ${icono[g.camino] || '?'} ${g.camino || '?'} · total ${s(g.ms_total)} (guía ${s(g.ms_guia)} + Google ${s(g.ms_google)}) · ${g.paradas} paradas, ${g.dias} días`
        + `${Number(g.descartadas) ? ', ' + g.descartadas + ' descartadas' : ''}${Number(g.cerca) ? ', ' + g.cerca + ' cerca' : ''}`
        + `\n      "${g.titulo || g.destino}"${g.motivo ? ' · motivo: ' + g.motivo : ''} · Worker ${String(g.worker || '').slice(0, 8)}`);
      if (g.lista) console.log(`      paradas: ${g.lista}`);
      if (g.desc_lista) console.log(`      descartadas: ${g.desc_lista}`);
      if (g.cerca_lista) console.log(`      cerca de: ${g.cerca_lista}`);
    }
  } else if (cmd === 'gasto') {
    // Gasto de Claude por petición del chat (Firestore chat_costs, lo escribe el Worker: logChatCost, 3 oct 2026).
    // node scripts/casos.cjs gasto [horas=24] [uid]   → total, por persona (mayor gasto primero) y las peticiones más caras.
    const horas = parseFloat(a1) || 24; const uidF = process.argv[4] || '';
    const { filas } = await call('/admin/chat-costs?horas=' + horas + '&limite=2000');
    const rows = (filas || []).filter(r => !uidF || r.uid === uidF);
    const eur = (r) => (Number(r.usd_micro) || 0) / 1e6 * 0.92;   // USD → EUR aprox.
    const sum = (a) => a.reduce((t, r) => t + eur(r), 0);
    const por = {};
    rows.forEach(r => { (por[r.uid] = por[r.uid] || []).push(r); });
    const fmt = (x) => x.toFixed(3) + ' €';
    const cache = rows.reduce((t, r) => t + (Number(r.cr) || 0), 0), entrada = rows.reduce((t, r) => t + (Number(r.tin) || 0), 0);
    console.log(`Últimas ${horas} h · ${rows.length} peticiones · ${Object.keys(por).length} personas · Claude ≈ ${fmt(sum(rows))} (precio de lista; solo Claude, sin Google)`);
    console.log(`Caché: ${entrada ? Math.round(100 * cache / entrada) : 0} % de las fichas de entrada se leyeron de caché\n`);
    Object.entries(por).sort((x, y) => sum(y[1]) - sum(x[1])).slice(0, 15).forEach(([uid, a]) => {
      console.log(`${uid.slice(0, 10)}…  ${a[0].plan || '?'}  ${a.length} pet.  ${fmt(sum(a))}  (${fmt(sum(a) / a.length)}/pet.)`);
    });
    const pm = {}; rows.forEach(r => { const m = r.modelo || '(sin dato)'; (pm[m] = pm[m] || []).push(r); });
    console.log('Por modelo: ' + Object.entries(pm).map(([m, a]) => `${m} ${a.length} pet. ${fmt(sum(a))} (${fmt(sum(a) / a.length)}/pet.)`).join(' · '));
    const errs = rows.filter(r => r.error);
    console.log(`\nErrores: ${errs.length} peticiones con error · gastaron ${fmt(sum(errs))} sin dar respuesta buena`);
    errs.slice(0, 8).forEach(r => console.log(`  ${fecha(r.at)} ${fmt(eur(r))} ${String(r.uid).slice(0, 8)}… ${r.error} · "${r.mensaje}"`));
    console.log('\nLas 8 peticiones más caras:');
    rows.sort((x, y) => eur(y) - eur(x)).slice(0, 8).forEach(r => {
      console.log(`${fecha(r.at)} ${fmt(eur(r))} ${r.tipo} ${Math.round((r.ms || 0) / 1000)}s · ${String(r.uid).slice(0, 8)}… · "${r.mensaje}"`);
    });
  } else if (cmd === 'revisor') {
    // Revisor de conversaciones (caso p-mulc92f6l52). Sin argumento: MODO PRUEBA de las últimas 24 h (no escribe
    // nada; cuesta la IA, ~0,1 cént./conversación). `revisor 3` = 3 días. `revisor estado` / `revisor on|off`.
    if (a1 === 'estado') { console.log((await call('/admin/revisor?estado=1')).activo ? 'Revisor diario: ENCENDIDO' : 'Revisor diario: apagado'); return; }
    if (a1 === 'on' || a1 === 'off') { await call('/admin/revisor', { activo: a1 === 'on' }); console.log('Revisor diario: ' + (a1 === 'on' ? 'ENCENDIDO' : 'apagado')); return; }
    const dias = parseFloat(a1) || 1;
    const r = await call('/admin/revisor?dias=' + dias);
    console.log(`MODO PRUEBA (no se ha escrito nada) · ${dias} día(s): ${r.conversaciones} conversaciones, ${r.revisadas} revisadas, ${r.fallos} fallos, ${r.errores} errores · ${r.tokens_in}+${r.tokens_out} tokens · $${r.coste_usd} · ${r.segundos} s\n`);
    for (const h of r.hallazgos) {
      console.log(`[${h.gravedad}] ${h.tipo} → ${h.junto_a ? 'se juntaría con: ' + h.junto_a + ' (' + h.caso + ')' : 'caso ' + h.caso}\n   ${h.motivo}\n   ${h.fragmento.replace(/\n/g, '\n   ')}\n`);
    }
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
