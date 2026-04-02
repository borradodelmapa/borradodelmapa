/**
 * Generador de base de conocimiento de viajes — Nivel 1
 * Genera fichas base de todos los países usando Claude API
 * 
 * Uso:
 *   node generate.js                    → genera todos los países pendientes
 *   node generate.js --country vietnam  → genera solo un país
 *   node generate.js --dry-run          → muestra el prompt sin llamar a la API
 * 
 * Requisitos:
 *   npm install
 *   Crear archivo .env con: ANTHROPIC_API_KEY=sk-ant-...
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Configuración ──────────────────────────────────────────────
const CONFIG = {
  apiUrl: 'https://api.anthropic.com/v1/messages',
  model: 'claude-sonnet-4-20250514',
  maxTokens: 2500,           // +1000 por el bloque transporte
  delayBetweenCalls: 1500,  // ms entre llamadas (evitar rate limit)
  outputDir: path.join(__dirname, 'output'),
  countriesFile: path.join(__dirname, 'countries.json'),
  progressFile: path.join(__dirname, 'progress.json'),
};

// ── Prompt de generación ───────────────────────────────────────
function buildPrompt(country) {
  return `Genera una ficha de viaje práctica y concisa del país "${country.name}" para viajeros independientes.

FORMATO: Responde SOLO con JSON válido, sin backticks ni texto adicional. Usa esta estructura exacta:

{
  "pais": "${country.name}",
  "codigo": "${country.code}",
  "capital": "nombre",
  "idioma_oficial": "idioma(s) principales",
  "idioma_viajero": "qué idioma te sirve como turista (inglés, francés, español...)",
  "moneda": "nombre (código ISO)",
  "cambio_aprox_eur": "1 EUR ≈ X moneda local (aproximado)",
  "huso_horario": "UTC+X",
  "prefijo_tel": "+XX",
  "enchufes": "tipo(s) de enchufe y voltaje",
  "visado_espanoles": "descripción breve: exento X días, e-visa, visado embajada, etc.",
  "visado_eu": "si difiere del español, indicar; si es igual, poner 'Igual que España'",
  "mejor_epoca": "meses recomendados y por qué",
  "evitar_epoca": "meses menos recomendados y por qué",
  "seguridad": "nivel general (1-5, donde 1=muy seguro 5=muy peligroso) + comentario breve",
  "vacunas": "obligatorias y recomendadas",
  "agua_potable": "sí/no/solo embotellada",
  "emergencias": "número de emergencias general",
  "coste_diario_mochilero": "rango en EUR (alojamiento+comida+transporte básico)",
  "coste_diario_medio": "rango en EUR (hotel medio+restaurantes+actividades)",
  "propinas": "costumbre local sobre propinas",
  "curiosidad_viajera": "un dato útil o curioso que todo viajero debería saber",
  "keywords": ["lista", "de", "ciudades", "y", "lugares", "clave", "para", "búsqueda"],
  "transporte": {
    "taxi": [
      {"nombre": "NombreApp", "url": "https://... o null", "nota": "cobertura real"}
    ],
    "tren": {
      "operadora": "Nombre oficial o null si no hay red ferroviaria",
      "url": "https://... o null",
      "plataforma_global": "Rail Europe / Trainline / Omio / null",
      "url_global": "https://... o null"
    },
    "bus_interurbano": {
      "plataforma": "Nombre real de la plataforma principal o null",
      "url": "https://... o null"
    },
    "ferry_maritimo": {
      "existe": true,
      "plataforma": "Nombre real o null",
      "url": "https://... o null",
      "url_global": "https://www.bookaway.com"
    },
    "ferry_fluvial": {
      "existe": false,
      "descripcion": null,
      "plataforma": null,
      "url": null,
      "url_global": null
    },
    "alquiler_coche": [
      {"nombre": "Rentalcars", "url": "https://www.rentalcars.com"},
      {"nombre": "Discover Cars", "url": "https://www.discovercars.com"}
    ]
  }
}

REGLAS GENERALES:
- Datos realistas y actualizados. Si no estás seguro de un dato, indica "verificar".
- Precios orientativos en EUR.
- keywords: incluye ciudades principales, destinos turísticos clave y variantes de nombre (ej: "Ho Chi Minh", "Saigón").
- Sé directo, sin relleno.

REGLAS CRÍTICAS — BLOQUE TRANSPORTE (incumplirlas puede dejar a un viajero tirado):
- NUNCA inventes URLs, nombres de apps ni operadoras. Una URL falsa es peor que null — el viajero hace click y no llega a ningún sitio.
- Si no conoces una URL con certeza absoluta: null. Ante cualquier duda: null o añade "verificar": true.
- Incluye SOLO apps y plataformas que realmente operan en ${country.name}. Ejemplos de errores a evitar: Uber no opera en China, Bolt no opera en Irán, Grab no llega a India.
- Sentido geográfico obligatorio:
  · País sin costa → ferry_maritimo.existe: false, resto de campos null
  · País sin ríos navegables con tráfico de pasajeros → ferry_fluvial.existe: false, resto null
  · País sin red ferroviaria → tren.operadora: null, tren.url: null
- alquiler_coche: Rentalcars y Discover Cars son agregadores globales — inclúyelos siempre.
- Un campo null o existe: false es siempre mejor que un dato incorrecto.`;
}

// ── Llamada a la API ───────────────────────────────────────────
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

  // Limpiar posibles backticks
  const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean);
}

// ── Progreso (para poder retomar) ──────────────────────────────
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

// ── Utilidades ─────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getApiKey() {
  // Intentar .env manual (sin dependencia dotenv)
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
    const match = envFile.match(/ANTHROPIC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch {}

  // Variable de entorno
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;

  console.error('❌ No se encontró ANTHROPIC_API_KEY');
  console.error('   Crea un archivo .env con: ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleCountryFlag = args.indexOf('--country');
  const singleCountry = singleCountryFlag >= 0 ? args[singleCountryFlag + 1] : null;

  const countries = JSON.parse(fs.readFileSync(CONFIG.countriesFile, 'utf-8'));
  const apiKey = dryRun ? 'dry-run' : getApiKey();

  // Crear directorio de salida
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Filtrar países
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
    // Saltar los ya completados
    const progress = loadProgress();
    toProcess = countries.filter(c => !progress.completed.includes(c.code));
  }

  console.log(`\n🌍 Salma Knowledge Base — Generador Nivel 1`);
  console.log(`   Países a procesar: ${toProcess.length}/${countries.length}`);
  console.log(`   Modo: ${dryRun ? 'DRY RUN (sin llamadas API)' : 'PRODUCCIÓN'}\n`);

  if (dryRun) {
    const sample = toProcess[0];
    console.log(`── Prompt de ejemplo para "${sample.name}" ──\n`);
    console.log(buildPrompt(sample));
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
      const ficha = await callClaude(buildPrompt(country), apiKey);

      // Guardar JSON individual
      const outFile = path.join(CONFIG.outputDir, `${country.code}.json`);
      fs.writeFileSync(outFile, JSON.stringify(ficha, null, 2));

      // Actualizar progreso
      progress.completed.push(country.code);
      saveProgress(progress);

      console.log(` ✅`);
      ok++;
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      progress.failed.push({ code: country.code, error: err.message });
      saveProgress(progress);
      fail++;

      // Si es rate limit, esperar más
      if (err.message.includes('429')) {
        console.log('   ⏸️  Rate limit — esperando 30s...');
        await sleep(30000);
      }
    }

    // Pausa entre llamadas
    if (i < toProcess.length - 1) {
      await sleep(CONFIG.delayBetweenCalls);
    }
  }

  console.log(`\n── Resumen ──`);
  console.log(`   ✅ Completados: ${ok}`);
  console.log(`   ❌ Fallidos: ${fail}`);
  console.log(`   📁 Fichas en: ${CONFIG.outputDir}/`);

  if (fail > 0) {
    console.log(`\n   Ejecuta de nuevo para reintentar los fallidos.`);
  }
}

main().catch(console.error);
