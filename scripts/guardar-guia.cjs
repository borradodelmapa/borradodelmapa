// Guardar una guía (JSON de crear-guia.cjs) en «Mis Viajes» de la cuenta de pruebas, con los MISMOS campos que
// app.js:guardarGuiaDirecto (users/{uid}/maps). NO la publica: publicar (guía pública / Explorar) lo decide Paco.
// Paso 3 de la creación automática de guías (21 oct 2026). Sin coste: solo escribe en Firestore.
//
//   node scripts/guardar-guia.cjs guia.json
const fs = require('fs');
const path = require('path');
const FIREBASE_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA';
const PROJECT = 'borradodelmapa-85257';
const cred = () => { const [e, p] = fs.readFileSync(path.join(__dirname, '..', 'api', 'test-user.txt'), 'utf8').split(/\r?\n/).filter(x => x.trim()).map(s => s.trim()); if (e && p) return [e, p]; throw new Error('Falta api/test-user.txt'); };
const valor = v => typeof v === 'boolean' ? { booleanValue: v } : (typeof v === 'number' ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : { stringValue: String(v) });
(async () => {
  const fichero = process.argv[2];
  if (!fichero) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 5).join('\n')); return; }
  const r = JSON.parse(fs.readFileSync(fichero, 'utf8'));
  const [email, password] = cred();
  const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) })).json();
  if (!login.idToken) throw new Error('Login falló: ' + JSON.stringify(login.error || login).slice(0, 200));
  const numDias = r.duration_days ? Number(r.duration_days) : new Set((r.stops || []).map(s => s.day || 1)).size;
  const destino = String(r.region || r.country || '');
  const ahora = new Date().toISOString();
  const ruta = { nombre: r.title || r.name || 'Mi ruta', destino, country: r.country || destino, num_dias: numDias, dias: numDias,
    notas: r.summary || '', cover_image: '', itinerarioIA: JSON.stringify(r), enriched: false, createdAt: ahora, updatedAt: ahora, published: false };
  const fields = Object.fromEntries(Object.entries(ruta).map(([k, v]) => [k, valor(v)]));
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${login.localId}/maps`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.idToken }, body: JSON.stringify({ fields }) });
  const j = await res.json();
  if (!res.ok) throw new Error('Firestore: ' + JSON.stringify(j).slice(0, 300));
  console.log(`✅ Guardada en Mis Viajes de ${email}: «${ruta.nombre}» · ${numDias} días · id ${j.name.split('/').pop()}`);
})().catch(e => { console.error(e.message); process.exitCode = 1; });
