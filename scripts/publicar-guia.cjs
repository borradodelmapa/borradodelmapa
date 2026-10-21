// Publicar una guía ya guardada en «Mis Viajes» de la cuenta de pruebas (guardar-guia.cjs) como GUÍA PÚBLICA, con los
// MISMOS campos que app.js:publishGuide (public_guides/{slug} + slug/published en la guía) y el mismo aviso al Worker
// (/guide-published → GitHub Action que genera borradodelmapa.com/<slug>.html). Solo con OK de Paco (21 oct 2026).
// La página sale noindex salvo que cumpla isGood() de scripts/build-guias.js. Sin coste de APIs de pago.
//
//   node scripts/publicar-guia.cjs <id de la guía en Mis Viajes>
const fs = require('fs');
const path = require('path');
const API = process.env.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
const FIREBASE_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA';
const DOCS = 'https://firestore.googleapis.com/v1/projects/borradodelmapa-85257/databases/(default)/documents';
const cred = () => { const [e, p] = fs.readFileSync(path.join(__dirname, '..', 'api', 'test-user.txt'), 'utf8').split(/\r?\n/).filter(x => x.trim()).map(s => s.trim()); if (e && p) return [e, p]; throw new Error('Falta api/test-user.txt'); };
const leer = f => f && (f.stringValue ?? (f.integerValue != null ? Number(f.integerValue) : (f.doubleValue ?? f.booleanValue ?? null)));
// Igual que app.js:generateSlug
const slugDe = t => (t || 'mi-ruta').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 60) + '-' + Date.now().toString(36).slice(-4);
(async () => {
  const docId = process.argv[2];
  if (!docId) { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(0, 6).join('\n')); return; }
  const [email, password] = cred();
  const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) })).json();
  if (!login.idToken) throw new Error('Login falló');
  const H = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.idToken };
  const mapUrl = `${DOCS}/users/${login.localId}/maps/${docId}`;
  const m = await (await fetch(mapUrl, { headers: H })).json();
  if (!m.fields) throw new Error('No encuentro la guía ' + docId);
  const f = m.fields;
  // PORTADA = MINIATURA DEL MAPA (22 oct 2026: las publicadas con este script salían con la foto genérica). Lo mismo que
  // app.js:_ensureRouteThumbnail + _syncPublicCover: /route-thumbnail (mapa estático, ~0,002 € una vez, se guarda en R2)
  // → map_thumbnail_url y cover_image en la guía y en la guía pública.
  const portada = async (slugPub) => {
    let url = leer(f.map_thumbnail_url) || '';
    if (!url) {
      const ruta = JSON.parse(leer(f.itinerarioIA) || '{}');
      const stops = (ruta.stops || []).filter(s => s && isFinite(+s.lat) && isFinite(+s.lng) && Math.abs(+s.lat) > 0.01).map(s => ({ lat: +s.lat, lng: +s.lng }));
      if (stops.length < 2) { console.log('Sin coordenadas para la miniatura del mapa'); return ''; }
      const t = await (await fetch(API + '/route-thumbnail', { method: 'POST', headers: H, body: JSON.stringify({ mapId: docId, stops, road_geometry: ruta.road_geometry || null }) })).json().catch(() => ({}));
      url = t.url || '';
      if (!url) { console.log('La miniatura del mapa no salió:', JSON.stringify(t).slice(0, 200)); return ''; }
    }
    await fetch(`${mapUrl}?updateMask.fieldPaths=map_thumbnail_url&updateMask.fieldPaths=cover_image`, { method: 'PATCH', headers: H,
      body: JSON.stringify({ fields: { map_thumbnail_url: { stringValue: url }, cover_image: { stringValue: url } } }) });
    if (slugPub) await fetch(`${DOCS}/public_guides/${slugPub}?updateMask.fieldPaths=cover_image`, { method: 'PATCH', headers: H, body: JSON.stringify({ fields: { cover_image: { stringValue: url } } }) });
    return url;
  };
  if (leer(f.slug) && leer(f.published)) {
    // Ya pública: solo se le pone la portada que le falte (node scripts/publicar-guia.cjs <id>)
    const url = await portada(leer(f.slug));
    if (url) await fetch(API + '/guide-published', { method: 'POST', headers: H, body: JSON.stringify({ slug: leer(f.slug) }) }).catch(() => {});
    console.log('Ya era pública: https://borradodelmapa.com/' + leer(f.slug) + (url ? ' · portada del mapa puesta: ' + url : ''));
    return;
  }
  // Autor público: «Salma». La cuenta de pruebas se llama «Claude (pruebas)», y en público nunca se dice IA.
  const nombreDueno = 'Salma';
  const slug = slugDe(leer(f.nombre));
  const pub = { slug, uid: login.localId, ownerDocId: docId, nombre: leer(f.nombre), destino: leer(f.destino), num_dias: leer(f.num_dias),
    summary: leer(f.notas) || '', cover_image: leer(f.cover_image) || '', itinerarioIA: leer(f.itinerarioIA), privacy: 'link',
    owner_name: nombreDueno, listed: true, createdAt: leer(f.createdAt), updatedAt: leer(f.updatedAt) };
  const campos = Object.fromEntries(Object.entries(pub).map(([k, v]) => [k, typeof v === 'boolean' ? { booleanValue: v } : (typeof v === 'number' ? { integerValue: String(v) } : { stringValue: String(v ?? '') })]));
  let r = await fetch(`${DOCS}/public_guides?documentId=${slug}`, { method: 'POST', headers: H, body: JSON.stringify({ fields: campos }) });
  if (!r.ok) throw new Error('public_guides: ' + (await r.text()).slice(0, 300));
  r = await fetch(`${mapUrl}?updateMask.fieldPaths=slug&updateMask.fieldPaths=published`, { method: 'PATCH', headers: H,
    body: JSON.stringify({ fields: { slug: { stringValue: slug }, published: { booleanValue: true } } }) });
  if (!r.ok) throw new Error('marcar publicada: ' + (await r.text()).slice(0, 300));
  const urlPortada = await portada(slug);
  if (urlPortada) console.log('Portada del mapa:', urlPortada);
  const aviso = await (await fetch(API + '/guide-published', { method: 'POST', headers: H, body: JSON.stringify({ slug }) })).json().catch(() => ({}));
  console.log(`✅ Publicada (autor «${nombreDueno}»): https://borradodelmapa.com/${slug} · en la app: https://borradodelmapa.com/?ruta=${slug} · página: ${JSON.stringify(aviso)}`);
})().catch(e => { console.error(e.message); process.exitCode = 1; });
