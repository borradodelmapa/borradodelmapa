/**
 * Generador Nivel 2 — 10 destinos populares por país
 * 
 * Genera una ficha con los 10 destinos más relevantes de cada país,
 * con info práctica para viajeros independientes.
 * 
 * Uso:
 *   node generate-nivel2.js                    → genera todos los pendientes
 *   node generate-nivel2.js --country vietnam  → genera solo un país
 *   node generate-nivel2.js --dry-run          → muestra prompt sin llamar API
 * 
 * Requisitos:
 *   .env con ANTHROPIC_API_KEY=sk-ant-...
 * 
 * Coste estimado: 193 llamadas × ~4000 tokens ≈ 800K tokens ≈ ~$2.50 (Sonnet)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuración ──────────────────────────────────────────────
const CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  delayBetweenCalls: 2000,
  outputDir: path.join(__dirname, 'output-nivel2'),
  countriesFile: path.join(__dirname, 'countries.json'),
  progressFile: path.join(__dirname, 'progress-nivel2.json'),
};

// ── Prompt ─────────────────────────────────────────────────────
function buildPrompt(country) {
  return `Genera los 10 destinos más importantes para viajeros independientes en "${country.name}" (${country.name_en}).

Responde SOLO con JSON válido, sin backticks ni texto adicional.

{
  "pais": "${country.name}",
  "codigo": "${country.code}",
  "destinos": [
    {
      "id": "slug-unico-sin-espacios",
      "nombre": "Nombre del destino",
      "tipo": "ciudad | playa | naturaleza | montaña | rural | isla | desierto | histórico",
      "region": "zona/región dentro del país",
      "descripcion": "2-3 frases: qué es, por qué ir, qué lo hace especial. Sin relleno.",
      "dias_recomendados": 3,
      "mejor_epoca": "meses concretos",
      "como_llegar": "desde la capital o punto de entrada más lógico: medio de transporte, duración, coste aproximado en EUR",
      "donde_dormir": {
        "mochilero": "tipo de alojamiento + rango de precio en EUR/noche",
        "medio": "tipo + rango EUR/noche",
        "comfort": "tipo + rango EUR/noche"
      },
      "que_hacer": ["actividad 1 (gratis/precio)", "actividad 2", "actividad 3 (mínimo)"],
      "donde_comer": "qué probar, rango de precios, zona recomendada para comer",
      "consejo_local": "un tip que solo sabría alguien que ha estado allí",
      "plan_b_lluvia": "qué hacer si el tiempo no acompaña",
      "keywords": ["variantes de nombre", "barrios clave", "atracciones principales"]
    }
  ]
}

REGLAS:
- Exactamente 10 destinos, ordenados por relevancia para un viajero independiente (no necesariamente los más turísticos, sino los más valiosos).
- Datos realistas: precios en EUR, tiempos de viaje reales, nombres de zonas/barrios reales.
- Si el país es pequeño o tiene pocos destinos turísticos (ej: Mónaco, Nauru), incluye los que haya y completa con excursiones a países vecinos marcándolas como "excursion_desde": true.
- Si el país es peligroso o desaconsejado para turismo, igualmente lista los destinos que serían relevantes SI se pudiera viajar, pero añade "alerta_seguridad": "texto de advertencia" en cada destino afectado.
- keywords: variantes de nombre (con/sin tildes, en inglés, abreviaciones) + barrios/zonas clave + atracciones principales.
- "id" debe ser un slug válido: solo minúsculas, guiones, sin tildes ni espacios. Ej: "ho-chi-minh", "chiang-mai", "machu-picchu".
- Sé directo y práctico. Nada de "es un destino maravilloso que no te puedes perder".`;
}

// ── API ────────────────────────────────────────────────────────
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
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

// ── Progreso ───────────────────────────────────────────────────
function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf-8'));
  } catch {
    return { completed: [], failed: [] };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getApiKey() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    const match = envFile.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch {}
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  console.error('❌ No se encontró ANTHROPIC_API_KEY');
  process.exit(1);
}

// ── Validación ─────────────────────────────────────────────────
function validateResponse(data, countryCode) {
  const errors = [];
  if (!data.destinos || !Array.isArray(data.destinos)) {
    errors.push('Sin array "destinos"');
    return errors;
  }
  if (data.destinos.length < 3) {
    errors.push(`Solo ${data.destinos.length} destinos (mínimo 3)`);
  }
  for (const d of data.destinos) {
    if (!d.id) errors.push(`Destino sin id: ${d.nombre}`);
    if (!d.nombre) errors.push(`Destino sin nombre`);
    if (!d.keywords || d.keywords.length === 0) {
      errors.push(`${d.nombre}: sin keywords`);
    }
  }
  return errors;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleCountryFlag = args.indexOf('--country');
  const singleCountry = singleCountryFlag >= 0 ? args[singleCountryFlag + 1] : null;

  const countries = JSON.parse(fs.readFileSync(CONFIG.countriesFile, 'utf-8'));
  const apiKey = dryRun ? 'dry-run' : getApiKey();

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  let toProcess = countries;
  if (singleCountry) {
    toProcess = countries.filter(c =>
      c.code === singleCountry || c.name.toLowerCase().includes(singleCountry.toLowerCase())
    );
    if (toProcess.length === 0) {
      console.error(`❌ País no encontrado: ${singleCountry}`);
      process.exit(1);
    }
  } else {
    const progress = loadProgress();
    toProcess = countries.filter(c => !progress.completed.includes(c.code));
  }

  console.log(`\n🌍 Salma Knowledge Base — Generador Nivel 2 (Destinos)`);
  console.log(`   Países a procesar: ${toProcess.length}/${countries.length}`);
  console.log(`   Destinos por país: 10`);
  console.log(`   Total destinos:    ~${toProcess.length * 10}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}\n`);

  if (dryRun) {
    const sample = toProcess[0];
    console.log(`── Prompt de ejemplo para "${sample.name}" ──\n`);
    console.log(buildPrompt(sample));
    return;
  }

  const progress = loadProgress();
  let ok = 0;
  let fail = 0;
  let totalDestinos = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const country = toProcess[i];
    const label = `[${i + 1}/${toProcess.length}] ${country.name}`;

    try {
      process.stdout.write(`⏳ ${label}...`);
      const data = await callClaude(buildPrompt(country), apiKey);

      // Validar
      const errors = validateResponse(data, country.code);
      if (errors.length > 0) {
        console.log(` ⚠️  ${errors.length} warnings: ${errors[0]}`);
      }

      // Guardar
      const outFile = path.join(CONFIG.outputDir, `${country.code}.json`);
      fs.writeFileSync(outFile, JSON.stringify(data, null, 2));

      const numDest = data.destinos?.length || 0;
      totalDestinos += numDest;

      progress.completed.push(country.code);
      // Limpiar de fallidos si estaba ahí
      progress.failed = progress.failed.filter(f => f.code !== country.code);
      saveProgress(progress);

      console.log(errors.length === 0 ? ` ✅ (${numDest} destinos)` : '');
      ok++;
    } catch (err) {
      console.log(` ❌ ${err.message.substring(0, 80)}`);
      progress.failed.push({ code: country.code, error: err.message.substring(0, 200) });
      saveProgress(progress);
      fail++;

      if (err.message.includes('429')) {
        console.log('   ⏸️  Rate limit — esperando 60s...');
        await sleep(60000);
      } else if (err.message.includes('529') || err.message.includes('overloaded')) {
        console.log('   ⏸️  API sobrecargada — esperando 30s...');
        await sleep(30000);
      }
    }

    if (i < toProcess.length - 1) {
      await sleep(CONFIG.delayBetweenCalls);
    }
  }

  console.log(`\n── Resumen Nivel 2 ──`);
  console.log(`   ✅ Países completados: ${ok}`);
  console.log(`   ❌ Fallidos: ${fail}`);
  console.log(`   📍 Total destinos generados: ${totalDestinos}`);
  console.log(`   📁 Fichas en: ${CONFIG.outputDir}/`);

  if (fail > 0) {
    console.log(`\n   Ejecuta de nuevo para reintentar los fallidos.`);
  }
}

main().catch(console.error);
