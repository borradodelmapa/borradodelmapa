/**
 * Publica destinos de KV como guías del usuario Salma en Firestore
 *
 * Uso:
 *   node scripts/publish-destinos-salma.js --country vn     → solo Vietnam
 *   node scripts/publish-destinos-salma.js                   → todos los países
 *   node scripts/publish-destinos-salma.js --dry-run          → muestra sin subir
 *
 * Requisitos:
 *   Cuenta salma@borradodelmapa.com creada en Firebase Auth
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KV_DIR = path.join(ROOT, 'worker', 'kv', 'output-nivel2');
const COUNTRIES_FILE = path.join(ROOT, 'worker', 'kv', 'countries.json');

const FIREBASE_API_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA';
const PROJECT_ID = 'borradodelmapa-85257';
const SALMA_EMAIL = 'salmaborradodelmapa@gmail.com';
const SALMA_PASS = 'Zonakanjea159876';

// ── Helpers ──────────────────────────────────────────────

function slugify(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Firebase Auth ────────────────────────────────────────

async function getAuthToken() {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SALMA_EMAIL, password: SALMA_PASS, returnSecureToken: true })
    }
  );
  const data = await res.json();
  if (!data.idToken) throw new Error('Auth failed: ' + JSON.stringify(data.error));
  return { token: data.idToken, uid: data.localId };
}

// ── Firestore REST ───────────────────────────────────────

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

async function firestoreSet(collection, docId, data, token) {
  const url = `${FIRESTORE_BASE}/${collection}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(toFirestoreDoc(data))
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore ${res.status}: ${err.substring(0, 200)}`);
  }
  return res.json();
}

// ── Build guide data from KV destination ─────────────────

const WORKER_API = 'https://salma-api.paco-defoto.workers.dev';

async function destCoverPhoto(dest, countryName) {
  try {
    const query = `${dest.nombre} ${countryName}`;
    const res = await fetch(`${WORKER_API}/photo?name=${encodeURIComponent(query)}&json=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (_) {}
  // Fallback genérico
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop';
}

async function buildGuideFromDest(dest, countryName, countryCode) {
  const slug = `${dest.id}-${slugify(countryName)}`;
  const now = new Date().toISOString();
  const photo = await destCoverPhoto(dest, countryName);

  // Datos para users/{uid}/maps/{docId}
  const userDoc = {
    nombre: `${dest.nombre} - ${countryName}`,
    destino: countryName,
    num_dias: dest.dias_recomendados || 3,
    cover_image: photo,
    createdAt: now,
    updatedAt: now,
    slug: slug,
    published: true,
    source: 'kv-nivel2',
    // Guardar datos de KV como itinerarioIA (JSON string)
    itinerarioIA: JSON.stringify({
      title: `Viajar a ${dest.nombre}`,
      name: dest.nombre,
      country: countryName,
      country_code: countryCode,
      type: dest.tipo,
      region: dest.region,
      days: dest.dias_recomendados || 3,
      description: dest.descripcion,
      best_season: dest.mejor_epoca,
      how_to_get: dest.como_llegar,
      accommodation: dest.donde_dormir,
      activities: dest.que_hacer,
      food: dest.donde_comer,
      local_tip: dest.consejo_local,
      rain_plan: dest.plan_b_lluvia,
      // Sin stops/itinerario — es guía light
      stops: [],
      is_light: true
    })
  };

  // Datos para public_guides/{slug}
  const publicDoc = {
    slug: slug,
    ownerDocId: slug, // el doc ID en maps es el mismo slug
    nombre: `${dest.nombre} - ${countryName}`,
    destino: countryName,
    num_dias: dest.dias_recomendados || 3,
    summary: dest.descripcion,
    cover_image: photo,
    itinerarioIA: userDoc.itinerarioIA,
    createdAt: now,
    updatedAt: now,
    source: 'kv-nivel2',
    featured: false
  };

  return { slug, userDoc, publicDoc };
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countryFlag = args.indexOf('--country');
  const onlyCountry = countryFlag >= 0 ? args[countryFlag + 1] : null;

  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.name;

  let files = fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json'));
  if (onlyCountry) files = files.filter(f => f.startsWith(onlyCountry));

  console.log(`\n📍 Publicar destinos bajo usuario Salma`);
  console.log(`   Países: ${files.length}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}\n`);

  let token, uid;
  if (!dryRun) {
    console.log('   🔐 Autenticando como Salma...');
    const auth = await getAuthToken();
    token = auth.token;
    uid = auth.uid;
    console.log(`   ✅ UID: ${uid}\n`);
  }

  let total = 0;
  let errors = 0;

  for (const file of files) {
    const code = file.replace('.json', '');
    const countryName = countryMap[code] || code;

    try {
      const data = JSON.parse(fs.readFileSync(path.join(KV_DIR, file), 'utf-8'));
      const destinos = data.destinos || [];

      for (const dest of destinos) {
        if (!dest.id || !dest.nombre) continue;

        const { slug, userDoc, publicDoc } = await buildGuideFromDest(dest, countryName, code);

        if (dryRun) {
          console.log(`   📄 ${slug} — ${dest.nombre} (${countryName})`);
        } else {
          process.stdout.write(`   ⏳ ${slug}...`);
          // 1. Guardar en users/{uid}/maps/{slug}
          await firestoreSet(`users/${uid}/maps`, slug, userDoc, token);
          // 2. Publicar en public_guides/{slug}
          await firestoreSet('public_guides', slug, publicDoc, token);
          console.log(' ✅');
          // Small delay to avoid rate limits
          await sleep(200);
        }
        total++;
      }
    } catch (e) {
      console.error(`   ❌ ${code}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n── Resumen ──`);
  console.log(`   ✅ Destinos publicados: ${total}`);
  console.log(`   ❌ Errores: ${errors}`);
  if (dryRun) console.log(`   (dry-run — no se subió nada)`);
}

main().catch(console.error);
