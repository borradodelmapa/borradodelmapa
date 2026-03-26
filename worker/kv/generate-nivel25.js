/**
 * Generador Nivel 2.5 — Info práctica por país
 *
 * Genera datos prácticos (frases, apps, kit, documentos, emergencias,
 * presupuesto desglosado) para cada país. Estos datos se inyectan
 * automáticamente en las rutas y en la tarjeta copiloto.
 *
 * Uso:
 *   node generate-nivel25.js                    → genera todos los pendientes
 *   node generate-nivel25.js --country mg       → genera solo un país
 *   node generate-nivel25.js --dry-run          → muestra prompt sin llamar API
 *
 * Requisitos:
 *   .env con ANTHROPIC_API_KEY=sk-ant-...
 *
 * Coste estimado: 193 llamadas × ~2000 tokens ≈ 400K tokens ≈ ~$1.20 (Haiku)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuración ──────────────────────────────────────────────
const CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-haiku-4-5-20251001',  // Haiku — más barato, suficiente para datos factuales
  maxTokens: 4000,
  delayBetweenCalls: 1500,
  outputDir: path.join(__dirname, 'output-nivel25'),
  countriesFile: path.join(__dirname, 'countries.json'),
  progressFile: path.join(__dirname, 'progress-nivel25.json'),
};

// ── Prompt ─────────────────────────────────────────────────────
function buildPrompt(country, nivel1Data) {
  // Si tenemos datos nivel 1, los usamos para contexto
  const ctx = nivel1Data ? `
Datos ya conocidos del país (NO repitas, úsalos como contexto):
- Idioma: ${nivel1Data.idioma_oficial}
- Moneda: ${nivel1Data.moneda} (${nivel1Data.cambio_aprox_eur})
- Emergencias base: ${nivel1Data.emergencias}
- Enchufes: ${nivel1Data.enchufes}
` : '';

  return `Genera la ficha de INFO PRÁCTICA de "${country.name}" para viajeros independientes.
${ctx}
Responde SOLO con JSON válido, sin backticks ni texto adicional.

{
  "pais": "${country.name}",
  "codigo": "${country.code}",
  "practical_info": {
    "budget": {
      "daily_breakdown": {
        "transport": "rango EUR/día transporte local típico",
        "sleep": "rango EUR/noche alojamiento medio",
        "food": "rango EUR/día comida (local + restaurante)",
        "activities": "rango EUR/día entradas y actividades",
        "misc": "rango EUR/día (SIMs, propinas, imprevistos)"
      },
      "total_estimated": "rango EUR/día total viajero medio",
      "currency": "nombre moneda local + código",
      "exchange_tip": "dónde/cómo cambiar — consejo práctico breve"
    },
    "documents": [
      "documento 1 necesario (ej: Pasaporte válido 6 meses)",
      "documento 2 (ej: Visado a la llegada, 30 días gratuito)",
      "documento 3 (ej: Seguro de viaje — imprescindible, hospitales exigen pago adelantado)",
      "documento 4 si aplica (ej: Carnet internacional de conducir)"
    ],
    "kit": [
      "item 1 imprescindible para este país concreto",
      "item 2",
      "item 3",
      "item 4",
      "item 5 — máximo 8 items, solo lo específico del país"
    ],
    "useful_apps": [
      "NombreApp (para qué sirve — ej: pagos, taxi, mapas offline)",
      "OtraApp (para qué) — máximo 6 apps, solo las realmente útiles allí"
    ],
    "phrases": {
      "language": "idioma local principal",
      "list": [
        { "phrase": "frase en idioma local", "meaning": "traducción" },
        { "phrase": "otra frase", "meaning": "traducción" }
      ]
    },
    "emergencies": {
      "general_number": "número emergencias principal",
      "police": "número policía si difiere",
      "ambulance": "número ambulancia si difiere",
      "embassy": "Embajada/Consulado de España: dirección + teléfono. Si no hay, la más cercana."
    },
    "connectivity": {
      "sim_local": "dónde comprar SIM, operador recomendado, precio aproximado datos",
      "wifi": "disponibilidad general wifi en alojamientos/cafés"
    },
    "health": {
      "hospitals": "nivel de atención médica general + consejo (ej: seguro con repatriación obligatorio)",
      "pharmacy": "disponibilidad farmacias + medicamentos que llevar de casa",
      "water": "potable/embotellada + consejo sobre hielo y ensaladas"
    }
  }
}

REGLAS:
- Datos realistas y prácticos. Si algo varía mucho por región, indica el rango.
- Precios SIEMPRE en EUR (con equivalente local si ayuda).
- Frases: exactamente 10 frases esenciales (hola, gracias, adiós, cuánto cuesta, dónde está, ayuda, no entiendo, la cuenta por favor, agua, sí/no). Usa la transliteración más útil para un viajero (no necesariamente la académica).
- Kit: solo items ESPECÍFICOS de este país. No pongas "pasaporte" (eso va en documents) ni genéricos como "ropa cómoda".
- Apps: solo las que se usan DE VERDAD en ese país. No pongas Google Maps o WhatsApp (son universales).
- Embassy: busca la embajada o consulado de España real. Si no hay en ese país, indica la más cercana (ej: "No hay embajada en Comoras — la más cercana está en Antananarivo, Madagascar").
- Sé directo. Nada de relleno.`;
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
function validateResponse(data) {
  const errors = [];
  const pi = data.practical_info;
  if (!pi) { errors.push('Sin practical_info'); return errors; }
  if (!pi.budget?.daily_breakdown) errors.push('Sin budget.daily_breakdown');
  if (!pi.documents?.length) errors.push('Sin documents');
  if (!pi.phrases?.list?.length) errors.push('Sin phrases');
  if (!pi.emergencies?.general_number) errors.push('Sin emergencies.general_number');
  if (!pi.useful_apps?.length) errors.push('Sin useful_apps');
  if (pi.phrases?.list?.length < 8) errors.push(`Solo ${pi.phrases.list.length} frases (mínimo 8)`);
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

  console.log(`\n🌍 Salma Knowledge Base — Generador Nivel 2.5 (Info Práctica)`);
  console.log(`   Países a procesar: ${toProcess.length}/${countries.length}`);
  console.log(`   Modelo: ${CONFIG.model}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}\n`);

  if (dryRun) {
    const sample = toProcess[0];
    // Cargar nivel 1 si existe
    let nivel1 = null;
    const n1File = path.join(__dirname, 'output', `${sample.code}.json`);
    try { nivel1 = JSON.parse(fs.readFileSync(n1File, 'utf-8')); } catch {}
    console.log(`── Prompt de ejemplo para "${sample.name}" ──\n`);
    console.log(buildPrompt(sample, nivel1));
    return;
  }

  const progress = loadProgress();
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const country = toProcess[i];
    const label = `[${i + 1}/${toProcess.length}] ${country.name}`;

    try {
      process.stdout.write(`⏳ ${label}...`);

      // Cargar nivel 1 para contexto
      let nivel1 = null;
      const n1File = path.join(__dirname, 'output', `${country.code}.json`);
      try { nivel1 = JSON.parse(fs.readFileSync(n1File, 'utf-8')); } catch {}

      const data = await callClaude(buildPrompt(country, nivel1), apiKey);

      // Validar
      const errors = validateResponse(data);
      if (errors.length > 0) {
        console.log(` ⚠️  ${errors.length} warnings: ${errors[0]}`);
      }

      // Guardar
      const outFile = path.join(CONFIG.outputDir, `${country.code}.json`);
      fs.writeFileSync(outFile, JSON.stringify(data, null, 2));

      progress.completed.push(country.code);
      progress.failed = progress.failed.filter(f => f.code !== country.code);
      saveProgress(progress);

      const numPhrases = data.practical_info?.phrases?.list?.length || 0;
      const numApps = data.practical_info?.useful_apps?.length || 0;
      console.log(errors.length === 0 ? ` ✅ (${numPhrases} frases, ${numApps} apps)` : '');
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

  console.log(`\n── Resumen Nivel 2.5 ──`);
  console.log(`   ✅ Países completados: ${ok}`);
  console.log(`   ❌ Fallidos: ${fail}`);
  console.log(`   📁 Fichas en: ${CONFIG.outputDir}/`);

  if (fail > 0) {
    console.log(`\n   Ejecuta de nuevo para reintentar los fallidos.`);
  }
}

main().catch(console.error);
