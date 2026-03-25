/**
 * Carga Progresiva — Orquestador semanal
 * Ejecuta todo el pipeline para N países nuevos:
 *   1. Genera nivel 2 (destinos) si no existe
 *   2. Genera nivel 3 (rutas completas)
 *   3. Genera HTML estático
 *   4. Publica en Firestore como Salma
 *   5. Añade al sitemap
 *   6. Sube rutas a KV
 *
 * Uso:
 *   node scripts/progressive-load.js                → 5 países por defecto
 *   node scripts/progressive-load.js --count 3      → 3 países
 *   node scripts/progressive-load.js --country th   → solo Tailandia
 *   node scripts/progressive-load.js --dry-run      → muestra qué haría
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const countryFlag = args.indexOf('--country');
const singleCountry = countryFlag >= 0 ? args[countryFlag + 1] : null;
const countFlag = args.indexOf('--count');
const count = countFlag >= 0 ? parseInt(args[countFlag + 1]) : 5;

// Prioridad de países (los más buscados primero)
const PRIORITY = [
  'es', 'fr', 'it', 'pt', 'gr', 'th', 'mx', 'jp', 'ma', 'tr',  // Tier 1
  'hr', 'id', 'pe', 'co', 'ar', 'in', 'eg', 'za', 'ke', 'tz',  // Tier 2
  'cr', 'cu', 'ph', 'mm', 'la', 'kh', 'lk', 'np', 'vn', 'nz',  // Tier 3
  'au', 'us', 'ca', 'gb', 'de', 'nl', 'be', 'ch', 'at', 'cz',  // Tier 4
];

function run(cmd, label) {
  console.log(`\n  ▶ ${label}`);
  if (dryRun) {
    console.log(`    [DRY RUN] ${cmd}`);
    return true;
  }
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', timeout: 600000 });
    return true;
  } catch (e) {
    console.error(`    ❌ Error: ${e.message?.substring(0, 100)}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Carga Progresiva — Borrado del Mapa');
  console.log(`   Modo: ${dryRun ? 'DRY RUN' : 'PRODUCCIÓN'}`);

  // Determinar qué países procesar
  let countries = [];

  if (singleCountry) {
    countries = [singleCountry];
  } else {
    // Buscar países con nivel 2 pero sin nivel 3 (rutas)
    const nivel2Dir = path.join(ROOT, 'worker/kv/output-nivel2');
    const nivel3Dir = path.join(ROOT, 'worker/kv/routes-nivel3');
    const nivel2Files = fs.existsSync(nivel2Dir) ? fs.readdirSync(nivel2Dir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')) : [];
    const nivel3Files = fs.existsSync(nivel3Dir) ? fs.readdirSync(nivel3Dir) : [];

    // Países con nivel 2 pero sin rutas nivel 3
    const withoutRoutes = nivel2Files.filter(code => {
      return !nivel3Files.some(f => f.includes('-' + code + '.json') || f.includes(code + '-'));
    });

    // Ordenar por prioridad
    countries = withoutRoutes.sort((a, b) => {
      const aIdx = PRIORITY.indexOf(a);
      const bIdx = PRIORITY.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    }).slice(0, count);
  }

  if (countries.length === 0) {
    console.log('\n✅ Todos los países con nivel 2 ya tienen rutas. Nada que hacer.');
    return;
  }

  console.log(`   Países: ${countries.join(', ')} (${countries.length})\n`);

  for (const code of countries) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`🌍 Procesando: ${code.toUpperCase()}`);
    console.log('═'.repeat(50));

    // 1. Verificar nivel 2
    const nivel2File = path.join(ROOT, 'worker/kv/output-nivel2', code + '.json');
    if (!fs.existsSync(nivel2File)) {
      run(`node worker/kv/generate-nivel2.js --country ${code}`, `Generar nivel 2 (10 destinos)`);
    } else {
      console.log(`\n  ✓ Nivel 2 ya existe`);
    }

    // 2. Generar rutas nivel 3
    run(`node worker/kv/generate-nivel3.js --country ${code} --max 10`, `Generar nivel 3 (rutas completas)`);

    // 3. Generar HTML estático
    run(`node scripts/build-destinos.js --country ${code}`, `Generar HTML estático`);

    // 4. Publicar en Firestore como Salma
    run(`node scripts/publish-destinos-salma.js --country ${code}`, `Publicar en Firestore`);
  }

  // 5. Actualizar sitemap
  run(`node scripts/grow-sitemap.js --count ${countries.length}`, `Actualizar sitemap (+${countries.length} países)`);

  // 6. Subir rutas a KV (nivel 3)
  console.log('\n  ▶ Subir rutas a KV...');
  if (!dryRun) {
    try {
      const nivel3Dir = path.join(ROOT, 'worker/kv/routes-nivel3');
      const routeFiles = fs.readdirSync(nivel3Dir).filter(f => f.endsWith('.json'));
      const pairs = [];

      for (const file of routeFiles) {
        const route = JSON.parse(fs.readFileSync(path.join(nivel3Dir, file), 'utf-8'));
        if (!route.stops || !route.country) continue;

        const country = (route.country || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
        const region = (route.region || route.country || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
        const days = route.duration_days || 3;
        const key = `route:${country.substring(0, 2)}:${region}:${days}`;
        pairs.push({ key, value: JSON.stringify(route) });
      }

      if (pairs.length > 0) {
        const tmpFile = path.join(ROOT, 'worker/kv/_routes_bulk.json');
        fs.writeFileSync(tmpFile, JSON.stringify(pairs));
        try {
          execSync(`npx wrangler kv bulk put kv/_routes_bulk.json --namespace-id b2056c0613d94feb955b92279ba02fb6 --remote`, {
            cwd: path.join(ROOT, 'worker'),
            stdio: 'inherit',
            timeout: 60000,
          });
        } catch (e) {
          console.log('    ⚠️ KV upload falló (rate limit?) — las rutas se cachearán cuando se pidan');
        }
        try { fs.unlinkSync(tmpFile); } catch {}
      }

      console.log(`    ✅ ${pairs.length} rutas preparadas para KV`);
    } catch (e) {
      console.log(`    ⚠️ Error subiendo a KV: ${e.message}`);
    }
  }

  // Resumen
  console.log('\n' + '═'.repeat(50));
  console.log('✅ CARGA PROGRESIVA COMPLETADA');
  console.log('═'.repeat(50));
  console.log(`   Países procesados: ${countries.join(', ')}`);
  console.log(`   Próximo paso: git add + commit + push para publicar HTMLs`);
  console.log(`   Coste estimado: ~$${(countries.length * 0.60).toFixed(2)}`);
}

main().catch(console.error);
