#!/usr/bin/env node
/**
 * Enriquece spots del KV nivel 2 con lat/lng + photo_ref de Google Places
 * Una sola vez. Guarda resultados en output-nivel2/ y sube al KV.
 *
 * Uso: GOOGLE_PLACES_KEY=xxx node enrich-spots.cjs
 */

const fs = require('fs');
const path = require('path');

const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY;
if (!GOOGLE_KEY) {
  console.error('Falta GOOGLE_PLACES_KEY. Uso: GOOGLE_PLACES_KEY=xxx node enrich-spots.cjs');
  process.exit(1);
}

const NIVEL2_DIR = path.join(__dirname, 'output-nivel2');
const OUTPUT_DIR = path.join(__dirname, 'output-spots');
const BATCH_SIZE = 10; // máximo paralelas a Google
const DELAY_MS = 500; // pausa entre lotes

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Progreso
const PROGRESS_FILE = path.join(__dirname, 'progress-spots.json');
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
}

function saveProgress() {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function searchPlace(name, country, region) {
  const query = `${name} ${region || ''} ${country || ''}`.trim();
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=geometry,photos,name,formatted_address&language=es&key=${GOOGLE_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const c = data?.candidates?.[0];
    if (!c?.geometry?.location) return null;

    return {
      lat: c.geometry.location.lat,
      lng: c.geometry.location.lng,
      photo_ref: c.photos?.[0]?.photo_reference || null,
      verified_name: c.name || null,
      verified_address: c.formatted_address || null
    };
  } catch (e) {
    return null;
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const files = fs.readdirSync(NIVEL2_DIR).filter(f => f.endsWith('.json'));
  let totalSpots = 0;
  let enriched = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`\n📍 Enriqueciendo spots de ${files.length} países con Google Places...\n`);

  for (const file of files) {
    const code = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(NIVEL2_DIR, file), 'utf8'));

    if (!data.destinos || !Array.isArray(data.destinos)) continue;

    const country = data.pais || '';
    let modified = false;

    // Procesar en lotes de BATCH_SIZE
    const spots = data.destinos;
    totalSpots += spots.length;

    for (let i = 0; i < spots.length; i += BATCH_SIZE) {
      const batch = spots.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (spot) => {
        const spotKey = `${code}:${spot.id || spot.nombre}`;

        // Skip si ya enriquecido
        if (spot.lat && spot.lng && spot.photo_ref) {
          skipped++;
          return;
        }
        if (progress[spotKey]) {
          // Restaurar de progreso
          Object.assign(spot, progress[spotKey]);
          skipped++;
          return;
        }

        const result = await searchPlace(
          spot.nombre || spot.name || spot.id,
          country,
          spot.region || ''
        );

        if (result) {
          spot.lat = result.lat;
          spot.lng = result.lng;
          if (result.photo_ref) spot.photo_ref = result.photo_ref;
          if (result.verified_address) spot.verified_address = result.verified_address;
          progress[spotKey] = { lat: result.lat, lng: result.lng, photo_ref: result.photo_ref, verified_address: result.verified_address };
          enriched++;
          modified = true;
        } else {
          failed++;
          progress[spotKey] = { failed: true };
        }
      });

      await Promise.all(promises);
      await sleep(DELAY_MS);
    }

    // Guardar JSON actualizado
    if (modified) {
      fs.writeFileSync(path.join(NIVEL2_DIR, file), JSON.stringify(data, null, 2));
    }

    // Guardar spots individuales para KV
    for (const spot of spots) {
      if (spot.lat && spot.lng) {
        const spotName = (spot.nombre || spot.name || spot.id || '').toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[\\\/:"*?<>|]+/g, '-')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 80);
        if (spotName) {
          const spotFile = path.join(OUTPUT_DIR, `${code}_${spotName}.json`);
          fs.writeFileSync(spotFile, JSON.stringify(spot));
        }
      }
    }

    saveProgress();

    const countryEnriched = spots.filter(s => s.lat && s.lng).length;
    console.log(`  ${code} (${country}): ${countryEnriched}/${spots.length} spots con coords`);
  }

  console.log(`\n✅ Total: ${totalSpots} spots`);
  console.log(`  Enriquecidos: ${enriched}`);
  console.log(`  Ya tenían datos: ${skipped}`);
  console.log(`  Fallidos: ${failed}`);
  console.log(`  Coste aprox: $${((enriched * 0.017) / 1000).toFixed(4)} (Find Place)\n`);
}

main().catch(console.error);
