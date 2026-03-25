/**
 * Generador de rutas completas — Nivel 3
 * Lee destinos de nivel 2 y genera itinerarios con Sonnet
 *
 * Uso:
 *   node generate-nivel3.js --country np        → genera rutas para Nepal
 *   node generate-nivel3.js --country np --max 3 → solo 3 destinos de Nepal
 *   node generate-nivel3.js --all --max 5       → 5 destinos de países sin nivel 3
 *   node generate-nivel3.js --dry-run           → muestra qué haría
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-4-6',
  maxTokens: 6000,
  temperature: 0.7,
  delayBetweenCalls: 3000,
  nivel2Dir: path.join(__dirname, 'output-nivel2'),
  outputDir: path.join(__dirname, 'routes-nivel3'),
};

// ── Prompt de ruta (mismo formato que el worker) ──
function buildRoutePrompt(destination, country) {
  const days = destination.dias_recomendados || 3;
  return `Genera una ruta de viaje de ${days} días por ${destination.nombre}, ${country.name}.

CONTEXTO DEL DESTINO:
- Tipo: ${destination.tipo}
- Región: ${destination.region}
- Cómo llegar: ${destination.como_llegar}
- Mejor época: ${destination.mejor_epoca}

Responde SOLO con JSON válido, sin backticks ni texto adicional. Estructura:

{"title":"${destination.nombre} en ${days} días","name":"${destination.nombre} en ${days} días","country":"${country.name}","region":"${destination.region}","duration_days":${days},"summary":"Resumen 1-2 frases","stops":[{"name":"Nombre exacto Google Maps","headline":"Nombre","narrative":"1-2 frases de viajero","day_title":"Título del día","type":"lugar","day":1,"lat":0.0,"lng":0.0,"km_from_previous":0,"road_name":"nombre carretera","road_difficulty":"bajo","estimated_hours":0}],"maps_links":[{"day":1,"url":"https://www.google.com/maps/dir/PuntoA/PuntoB","label":"Día 1: A → B"}],"tips":["Consejo 1","Consejo 2"],"tags":["tag1"],"budget_level":"bajo","suggestions":["Sugerencia"]}

REGLAS:
- 3-5 paradas por día, nombres EXACTOS como aparecen en Google Maps.
- Orden geográfico: traza la ruta primero, pon paradas en el camino.
- km_from_previous: distancia real entre paradas.
- road_name: nombre real de la carretera.
- lat/lng: tu mejor estimación (se verificará después).
- maps_links: un enlace Google Maps por día con los nombres de las paradas.
- narrative: experiencia del viajero, no datos logísticos.
- tips: 3-5 consejos prácticos con datos concretos.
- Sé directo. Nombres reales, precios reales, distancias reales.`;
}

// ── Llamada a Claude ──
async function callClaude(prompt, apiKey) {
  const response = await fetch(CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CONFIG.model,
      max_tokens: CONFIG.maxTokens,
      temperature: CONFIG.temperature,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// ── Leer API key ──
function getApiKey() {
  try {
    const lines = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^ANTHROPIC_API_KEY=(.+)$/);
      if (m) return m[1].trim();
    }
  } catch {}
  return process.env.ANTHROPIC_API_KEY;
}

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countryFlag = args.indexOf('--country');
  const countryCode = countryFlag >= 0 ? args[countryFlag + 1] : null;
  const allFlag = args.includes('--all');
  const maxFlag = args.indexOf('--max');
  const maxRoutes = maxFlag >= 0 ? parseInt(args[maxFlag + 1]) : 10;

  const apiKey = getApiKey();
  if (!apiKey && !dryRun) {
    console.error('❌ Falta ANTHROPIC_API_KEY en .env');
    process.exit(1);
  }

  // Crear directorio de salida
  if (!fs.existsSync(CONFIG.outputDir)) fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  // Leer países con nivel 2
  const nivel2Files = fs.readdirSync(CONFIG.nivel2Dir).filter(f => f.endsWith('.json'));
  let toProcess = [];

  if (countryCode) {
    const file = countryCode + '.json';
    if (!nivel2Files.includes(file)) {
      console.error(`❌ No existe nivel 2 para: ${countryCode}`);
      process.exit(1);
    }
    toProcess = [{ code: countryCode, file }];
  } else if (allFlag) {
    // Todos los que tengan nivel 2 pero no nivel 3
    for (const file of nivel2Files) {
      const code = file.replace('.json', '');
      const existingRoutes = fs.readdirSync(CONFIG.outputDir).filter(f => f.includes('-' + code + '.json') || f.includes(code + '-'));
      if (existingRoutes.length === 0) {
        toProcess.push({ code, file });
      }
    }
  } else {
    console.error('Uso: node generate-nivel3.js --country XX | --all [--max N] [--dry-run]');
    process.exit(1);
  }

  console.log(`\n🗺️  Generador de Rutas — Nivel 3`);
  console.log(`   Países a procesar: ${toProcess.length}`);
  console.log(`   Máx rutas/país: ${maxRoutes}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}\n`);

  let totalGenerated = 0;
  let totalCost = 0;

  for (const { code, file } of toProcess) {
    const data = JSON.parse(fs.readFileSync(path.join(CONFIG.nivel2Dir, file), 'utf-8'));
    const country = { name: data.pais, code: data.codigo };
    const destinos = (data.destinos || []).slice(0, maxRoutes);

    console.log(`\n🌍 ${country.name} (${code}) — ${destinos.length} destinos`);

    for (const dest of destinos) {
      const outFile = `${dest.id}-${code}.json`;
      const outPath = path.join(CONFIG.outputDir, outFile);

      // Saltar si ya existe
      if (fs.existsSync(outPath)) {
        console.log(`   ⏭️  ${dest.nombre} — ya existe`);
        continue;
      }

      if (dryRun) {
        console.log(`   🔍 ${dest.nombre} (${dest.dias_recomendados} días) — generaría ruta`);
        continue;
      }

      process.stdout.write(`   ⏳ ${dest.nombre} (${dest.dias_recomendados} días)...`);

      try {
        const prompt = buildRoutePrompt(dest, country);
        const text = await callClaude(prompt, apiKey);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON en respuesta');

        const route = JSON.parse(jsonMatch[0]);

        // Validar estructura mínima
        if (!route.stops || route.stops.length === 0) throw new Error('Sin paradas');

        fs.writeFileSync(outPath, JSON.stringify(route, null, 2));
        totalGenerated++;
        totalCost += 0.06;
        console.log(` ✅ ${route.stops.length} paradas`);

        // Pausa entre llamadas
        await new Promise(r => setTimeout(r, CONFIG.delayBetweenCalls));

      } catch (e) {
        console.log(` ❌ ${e.message}`);
      }
    }
  }

  console.log(`\n✅ Generación completada: ${totalGenerated} rutas (~$${totalCost.toFixed(2)})`);
  console.log(`   Archivos en: ${CONFIG.outputDir}/`);
}

main().catch(console.error);
