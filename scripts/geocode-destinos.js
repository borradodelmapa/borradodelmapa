/**
 * Geocodifica los destinos (nivel 2) con Nominatim (OpenStreetMap) — gratis,
 * sin API key. Guarda el resultado en worker/kv/destinos-coords.json, que
 * build-destinos.js lee para pintar un mapa por destino. Solo pide lo que
 * falte en la caché — volver a ejecutarlo no repite trabajo ya hecho.
 *
 * Uso:
 *   node scripts/geocode-destinos.js --country es   → solo un país
 *   node scripts/geocode-destinos.js                → todos los que falten
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KV_DIR = path.join(ROOT, 'worker', 'kv', 'output-nivel2');
const COORDS_FILE = path.join(ROOT, 'worker', 'kv', 'destinos-coords.json');
const COUNTRIES_FILE = path.join(ROOT, 'worker', 'kv', 'countries.json');

const UA = 'BorradoDelMapa/1.0 (+https://borradodelmapa.com; contacto: paco.defoto@gmail.com)';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocodeOnce(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !data[0]) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

// Nombres de zona compuestos ("X y Y", "Ruta (Variante)") no resuelven tal cual en
// Nominatim — se prueba en cascada, de más preciso a más aproximado, hasta que uno
// dé resultado. Cada intento gasta su propio 1 req/seg (ver sleep en el bucle).
async function geocode(nombre, region, countryName) {
  const attempts = [];
  attempts.push(`${nombre}, ${region || ''}, ${countryName}`);
  if (/ y /.test(nombre)) attempts.push(`${nombre.split(/ y /)[0].trim()}, ${region || ''}, ${countryName}`);
  const sinParentesis = nombre.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  if (sinParentesis !== nombre) attempts.push(`${sinParentesis}, ${region || ''}, ${countryName}`);
  if (region) attempts.push(`${region.split('/')[0].trim()}, ${countryName}`);

  for (let i = 0; i < attempts.length; i++) {
    const q = attempts[i].replace(/,\s*,/g, ',').replace(/,\s*$/, '');
    const point = await geocodeOnce(q);
    if (point) return { point, query: q, fallback: i > 0 };
    if (i < attempts.length - 1) await sleep(1100);
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const countryFlag = args.indexOf('--country');
  const onlyCountry = countryFlag >= 0 ? args[countryFlag + 1] : null;

  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.name;

  let coords = {};
  if (fs.existsSync(COORDS_FILE)) coords = JSON.parse(fs.readFileSync(COORDS_FILE, 'utf-8'));

  let files = fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json'));
  if (onlyCountry) files = files.filter(f => f.startsWith(onlyCountry));

  let pending = [];
  for (const file of files) {
    const code = file.replace('.json', '');
    const countryName = countryMap[code] || code;
    const data = JSON.parse(fs.readFileSync(path.join(KV_DIR, file), 'utf-8'));
    for (const dest of data.destinos || []) {
      if (!dest.id || !dest.nombre) continue;
      const key = `${code}:${dest.id}`;
      if (coords[key]) continue;
      pending.push({ key, nombre: dest.nombre, region: dest.region, countryName });
    }
  }

  console.log(`\n📍 Geocodificar destinos — ${pending.length} pendientes de ${Object.keys(coords).length} ya en caché`);
  let ok = 0, fail = 0, viaFallback = 0;

  for (const item of pending) {
    try {
      const result = await geocode(item.nombre, item.region, item.countryName);
      if (result) {
        coords[item.key] = result.point;
        ok++;
        if (result.fallback) viaFallback++;
        console.log(`   ✅ ${item.key} → ${result.point.lat.toFixed(4)}, ${result.point.lng.toFixed(4)}${result.fallback ? '  (con fallback: ' + result.query + ')' : ''}`);
      } else {
        fail++;
        console.log(`   ⚠️  ${item.key} — sin resultado tras todos los intentos (${item.nombre})`);
      }
    } catch (e) {
      fail++;
      console.log(`   ❌ ${item.key} — ${e.message}`);
    }
    fs.writeFileSync(COORDS_FILE, JSON.stringify(coords, null, 2));
    await sleep(1100); // Nominatim: máx 1 petición/seg
  }

  console.log(`\n── Resumen ──`);
  console.log(`   ✅ Geocodificados: ${ok} (${viaFallback} con fallback de nombre compuesto)`);
  console.log(`   ⚠️ Sin resultado / error: ${fail}`);
  console.log(`   💾 Total en caché: ${Object.keys(coords).length}`);
}

main().catch(console.error);
