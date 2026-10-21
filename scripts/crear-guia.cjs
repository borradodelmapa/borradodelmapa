// Crear una GUÍA con mapa en PRODUCCIÓN, igual que la app al pulsar «Crear ruta con mapa» (Tiempo 2), con la cuenta de pruebas.
// Paso 2 de la creación automática de guías (21 oct 2026): el paso 1 es pedir el plan a Salma (probar-chat.cjs); este toma
// ese plan (último mensaje de Salma en el historial de probar-chat) y manda lo mismo que salma.js:_doSend con
// { source_text, guided_stage: 'map', dest_hint }. Guarda la guía (JSON) y dice lo que costó (Claude, de chat_costs).
//
//   node scripts/crear-guia.cjs "Filipinas" salida.json
//
// CUESTA DINERO: convierte el texto con Claude y verifica cada parada con Google (≈ 1-2 € una guía de 21 días).
const fs = require('fs');
const path = require('path');
const API = process.env.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
const FIREBASE_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA';
const HIST = path.join(__dirname, '..', 'api', '.probar-chat-historial.json');
const cred = () => { for (const f of [path.join(__dirname, '..', 'api', 'test-user.txt')]) { const [e, p] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(x => x.trim()).map(s => s.trim()); if (e && p) return [e, p]; } throw new Error('Falta api/test-user.txt'); };
const token = () => { try { return fs.readFileSync(path.join(__dirname, '..', 'api', 'cases-token.txt'), 'utf8').trim(); } catch (_) { return ''; } };
(async () => {
  const [destHint, salida] = process.argv.slice(2);
  if (!destHint || !salida) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 8).join('\n')); return; }
  const hist = JSON.parse(fs.readFileSync(HIST, 'utf8'));
  const plan = [...hist].reverse().find(m => m.role === 'assistant');
  const pedido = [...hist].reverse().find(m => m.role === 'user');
  if (!plan) throw new Error('No hay plan de Salma en el historial (paso 1: probar-chat.cjs)');
  const [email, password] = cred();
  const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) })).json();
  if (!login.idToken) throw new Error('Login falló: ' + JSON.stringify(login.error || login).slice(0, 200));
  const body = { message: 'Salma hazme una guía: ' + (pedido ? pedido.content : destHint), history: hist.slice(-20),
    source_text: (() => { try { const m = fs.readFileSync(path.join(path.dirname(HIST), '.probar-chat-marcas.txt'), 'utf8'); if (m.includes('[[')) return m; } catch (_) {} return plan.content; })(), // como la app: el plan CON marcas [[ ]] (reply_marcas)
    guided_stage: 'map', dest_hint: destHint, stream: true }; // stream: true como la app
  const t0 = Date.now();
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.idToken }, body: JSON.stringify(body) });
  let route = null, eventos = {}, fin = null;
  const txt = await res.text();
  for (const linea of txt.split('\n')) {
    if (!linea.startsWith('data: ')) continue;
    try {
      const ev = JSON.parse(linea.slice(6));
      const tipo = ev.type || (ev.done ? 'done' : (typeof ev.t === 'string' ? 'texto' : Object.keys(ev)[0]));
      eventos[tipo] = (eventos[tipo] || 0) + 1;
      if (ev.route) route = ev.route;
      if (ev.done) fin = ev;
    } catch (_) {}
  }
  const seg = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`Respuesta en ${seg} s · Worker ${res.headers.get('x-worker-version') || '?'} · eventos: ${JSON.stringify(eventos)}`);
  if (!route && fin && fin.route) route = fin.route;
  if (!route) { console.log('❌ No llegó guía. Final:', JSON.stringify(fin || {}).slice(0, 400)); process.exitCode = 1; return; }
  fs.writeFileSync(salida, JSON.stringify(route, null, 1));
  const st = route.stops || [];
  console.log(`✅ Guía: «${route.title}» · ${st.length} paradas · ${new Set(st.map(s => s.day)).size} días · verificadas con Google ${st.filter(s => s.place_id).length} · con foto ${st.filter(s => s.photo_ref).length}`);
  const tok = token();
  if (tok) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const { filas } = await (await fetch(API + '/admin/chat-costs?horas=1&limite=200', { headers: { Authorization: 'Bearer ' + tok } })).json();
      const f = (filas || []).filter(x => x.uid === login.localId).sort((a, b) => (a.at < b.at ? 1 : -1))[0];
      if (f) console.log(`Coste Claude de este paso: ${(f.usd_micro / 1e6 * 0.92 * 100).toFixed(2)} cént. · entrada ${f.tin} · salida ${f.tout} · ${f.modelo}`);
    } catch (_) {}
  }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
