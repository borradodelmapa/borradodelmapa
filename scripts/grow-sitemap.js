/**
 * Añade países al sitemap gradualmente
 *
 * Uso:
 *   node scripts/grow-sitemap.js              → añade 5 países (por defecto)
 *   node scripts/grow-sitemap.js --count 10   → añade 10 países
 *   node scripts/grow-sitemap.js --list        → muestra qué países se añadirían
 *
 * Prioridad: países más buscados primero (Europa, América, Asia populares)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SITEMAP_FILE = path.join(ROOT, 'sitemap-destinos.xml');
const KV_DIR = path.join(ROOT, 'worker', 'kv', 'output-nivel2');
const COUNTRIES_FILE = path.join(ROOT, 'worker', 'kv', 'countries.json');
const DOMAIN = 'https://borradodelmapa.com';

// Países ordenados por popularidad turística (los más buscados primero)
const PRIORITY_ORDER = [
  // Ya publicados
  'vn', 'np',
  // Tier 1 — destinos top de búsqueda desde España
  'es', 'fr', 'it', 'pt', 'gr', 'th', 'mx', 'jp', 'ma', 'tr',
  // Tier 2 — muy populares
  'gb', 'de', 'us', 'hr', 'id', 'cu', 'pe', 'co', 'cr', 'in',
  'eg', 'tn', 'cz', 'nl', 'at', 'ch', 'ie', 'pl', 'hu', 'se',
  // Tier 3 — populares
  'ar', 'br', 'cl', 'ec', 'bo', 'pa', 'do', 'za', 'ke', 'tz',
  'lk', 'mm', 'kh', 'la', 'ph', 'my', 'au', 'nz', 'is', 'no',
  'dk', 'fi', 'be', 'ro', 'bg', 'rs', 'ba', 'me', 'al', 'mk',
  // Tier 4 — resto
  'ge', 'am', 'az', 'jo', 'il', 'ae', 'om', 'sa', 'ir', 'uz',
  'kg', 'kz', 'mn', 'cn', 'kr', 'tw', 'sg', 'mv', 'fj', 'ws',
];

function slugify(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function main() {
  const args = process.argv.slice(2);
  const listOnly = args.includes('--list');
  const countIdx = args.indexOf('--count');
  const count = countIdx >= 0 ? parseInt(args[countIdx + 1], 10) : 5;

  // Load current sitemap to see what's already in
  const currentSitemap = fs.readFileSync(SITEMAP_FILE, 'utf-8');

  // Load countries
  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.name;

  // Find available KV files
  const kvFiles = new Set(fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')));

  // Find countries already in sitemap
  const inSitemap = new Set();
  for (const c of countries) {
    const slug = slugify(c.name);
    if (currentSitemap.includes(`/destinos/${slug}.html`)) {
      inSitemap.add(c.code);
    }
  }

  console.log(`📍 Grow Sitemap`);
  console.log(`   En sitemap: ${inSitemap.size} países`);
  console.log(`   KV disponibles: ${kvFiles.size} países`);

  // Pick next countries by priority
  const allCodes = [...PRIORITY_ORDER, ...countries.map(c => c.code)];
  const seen = new Set();
  const candidates = [];
  for (const code of allCodes) {
    if (seen.has(code)) continue;
    seen.add(code);
    if (!inSitemap.has(code) && kvFiles.has(code) && countryMap[code]) {
      candidates.push(code);
    }
  }

  const toAdd = candidates.slice(0, count);

  if (toAdd.length === 0) {
    console.log('   ✅ Todos los países disponibles ya están en el sitemap.');
    return;
  }

  console.log(`   A añadir: ${toAdd.length} países\n`);
  for (const code of toAdd) {
    console.log(`   + ${countryMap[code]} (${code})`);
  }

  if (listOnly) {
    console.log(`\n   (--list mode, no se modifica nada)`);
    return;
  }

  // Generate new URLs
  let newUrls = '';
  for (const code of toAdd) {
    const name = countryMap[code];
    const countrySlug = slugify(name);

    // Country page
    newUrls += `  <url>\n    <loc>${DOMAIN}/destinos/${countrySlug}.html</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    // Destination pages
    try {
      const data = JSON.parse(fs.readFileSync(path.join(KV_DIR, `${code}.json`), 'utf-8'));
      for (const dest of (data.destinos || [])) {
        if (!dest.id) continue;
        const slug = `${dest.id}-${countrySlug}`;
        newUrls += `  <url>\n    <loc>${DOMAIN}/destinos/${slug}.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    } catch (_) {}
  }

  // Insert before </urlset>
  const updated = currentSitemap.replace('</urlset>', newUrls + '</urlset>');
  fs.writeFileSync(SITEMAP_FILE, updated);

  const newCount = (updated.match(/<url>/g) || []).length;
  console.log(`\n   ✅ Sitemap actualizado: ${newCount} URLs totales`);
  console.log(`   Ejecuta: git add sitemap-destinos.xml && git commit -m "sitemap: +${toAdd.length} países" && git push`);
}

main();
