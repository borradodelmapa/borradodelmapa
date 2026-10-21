// Probar el chat de Salma en PRODUCCIÓN con la cuenta de pruebas (12 oct 2026, caso p-mulprefz0fz).
// Para que cualquier sesión de Claude Code (nube o portátil) pruebe un cambio sin pedirle capturas a Paco.
//
//   node scripts/probar-chat.cjs "¿cuánto cuesta el ferry de Tarifa a Tánger?"
//   node scripts/probar-chat.cjs --gps 36.4537,-5.0578 "dime una farmacia cerca"
//   node scripts/probar-chat.cjs --seguir "y mañana?"      → sigue la conversación anterior (historial guardado)
//
// Credenciales de la cuenta de pruebas (NUNCA en el repo):
//   - variables de entorno SALMA_TEST_EMAIL y SALMA_TEST_PASSWORD (entorno de la nube), o
//   - api/test-user.txt (gitignored) con dos líneas: email y contraseña (portátil de Paco).
// CUESTA DINERO DE VERDAD: cada mensaje es una llamada real a Claude (~1-8 céntimos) y puede llamar a Google.
// Al final se imprime lo que costó ese mensaje (de chat_costs) y lo que escribió Salma.
const fs = require('fs');
const path = require('path');

const API = process.env.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
const FIREBASE_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA'; // clave web pública de Firebase (la misma que va en index.html)
const HIST = path.join(__dirname, '..', 'api', '.probar-chat-historial.json');

function credenciales() {
  if (process.env.SALMA_TEST_EMAIL && process.env.SALMA_TEST_PASSWORD) return [process.env.SALMA_TEST_EMAIL, process.env.SALMA_TEST_PASSWORD];
  for (const f of [path.join(__dirname, '..', 'api', 'test-user.txt'), 'C:/Users/User/Desktop/salma/api/test-user.txt']) {
    try { const [e, p] = fs.readFileSync(f, 'utf8').split(/\r?\n/).map(s => s.trim()); if (e && p) return [e, p]; } catch (_) {}
  }
  throw new Error('Falta la cuenta de pruebas: SALMA_TEST_EMAIL/SALMA_TEST_PASSWORD o api/test-user.txt');
}
function casesToken() {
  if (process.env.CASES_TOKEN) return process.env.CASES_TOKEN.trim();
  try { return fs.readFileSync(path.join(__dirname, '..', 'api', 'cases-token.txt'), 'utf8').trim(); } catch (_) { return ''; }
}

(async () => {
  const args = process.argv.slice(2);
  let gps = null, seguir = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--gps') { const [la, ln] = String(args[i + 1] || '').split(',').map(Number); gps = { lat: la, lng: ln, accuracy: 20 }; args.splice(i, 2); i--; }
    else if (args[i] === '--seguir') { seguir = true; args.splice(i, 1); i--; }
  }
  const mensaje = args.join(' ').trim();
  if (!mensaje) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 13).join('\n')); return; }

  const [email, password] = credenciales();
  const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }),
  })).json();
  if (!login.idToken) throw new Error('Login de la cuenta de pruebas falló: ' + JSON.stringify(login.error || login).slice(0, 200));

  let history = [];
  if (seguir) { try { history = JSON.parse(fs.readFileSync(HIST, 'utf8')); } catch (_) {} }
  const body = { message: mensaje, history: history.slice(-20) };
  if (gps) body.user_location = gps;

  const t0 = Date.now();
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.idToken }, body: JSON.stringify(body) });
  let reply = '', ultimo = null, marcas = '';
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    ultimo = await res.json(); reply = ultimo.reply || '';
  } else {
    const txt = await res.text();
    for (const linea of txt.split('\n')) {
      if (!linea.startsWith('data: ')) continue;
      try { const ev = JSON.parse(linea.slice(6)); if (typeof ev.t === "string") reply += ev.t; if (ev.done) { ultimo = ev; if (ev.reply) reply = ev.reply; if (ev.reply_marcas) marcas = ev.reply_marcas; } } catch (_) {}
    }
  }
  const seg = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n── Salma (${seg} s, Worker ${res.headers.get('x-worker-version') || '?'}) ──\n${reply}\n`);
  // El plan CON los sitios marcados [[ ]] (lo que la app manda al pulsar «Crear ruta con mapa»): lo usa crear-guia.cjs
  try { fs.writeFileSync(path.join(path.dirname(HIST), '.probar-chat-marcas.txt'), marcas || ''); } catch (_) {}
  console.log(`Caracteres: ${reply.length}${marcas ? ' · con marcas: ' + (marcas.match(/\[\[/g) || []).length + ' sitios' : ''}${ultimo && ultimo.route ? ' · trae GUÍA' : ''}`);
  try { fs.mkdirSync(path.dirname(HIST), { recursive: true }); fs.writeFileSync(HIST, JSON.stringify([...history, { role: 'user', content: mensaje }, { role: 'assistant', content: reply }].slice(-20))); } catch (_) {}

  // Coste de este mensaje (lo escribe el Worker en chat_costs unos segundos después).
  const tok = casesToken();
  if (!tok) return;
  await new Promise(r => setTimeout(r, 4000));
  try {
    const { filas } = await (await fetch(API + '/admin/chat-costs?horas=1&limite=200', { headers: { Authorization: 'Bearer ' + tok } })).json();
    const f = (filas || []).filter(x => x.uid === login.localId).sort((a, b) => (a.at < b.at ? 1 : -1))[0];
    if (f) console.log(`Coste Claude: ${(f.usd_micro / 1e6 * 0.92 * 100).toFixed(2)} cént. · entrada ${f.tin} (caché leída ${f.cr}, guardada ${f.cw}) · salida ${f.tout} fichas · ${f.modelo}`);
  } catch (_) {}
})().catch(e => { console.error(e.message); process.exitCode = 1; });
