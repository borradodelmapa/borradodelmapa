/**
 * Generador de páginas SEO de destinos
 *
 * Lee los JSONs de KV nivel 2 y genera HTMLs estáticos para cada destino.
 *
 * Uso:
 *   node scripts/build-destinos.js                → genera todas las páginas
 *   node scripts/build-destinos.js --country vn   → solo un país
 *   node scripts/build-destinos.js --dry-run      → muestra stats sin generar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KV_DIR = path.join(ROOT, 'worker', 'kv', 'output-nivel2');
const COUNTRIES_FILE = path.join(ROOT, 'worker', 'kv', 'countries.json');
const OUT_DIR = path.join(ROOT, 'destinos');
const SITEMAP_FILE = path.join(ROOT, 'sitemap-destinos.xml');
const DOMAIN = 'https://borradodelmapa.com';

// ── Helpers ──────────────────────────────────────────────────

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHTML(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeJSON(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

const TYPE_BADGES = {
  ciudad: { emoji: '🏛️', label: 'Ciudad' },
  playa: { emoji: '🏖️', label: 'Playa' },
  naturaleza: { emoji: '🌿', label: 'Naturaleza' },
  montaña: { emoji: '⛰️', label: 'Montaña' },
  'montaña': { emoji: '⛰️', label: 'Montaña' },
  rural: { emoji: '🌾', label: 'Rural' },
  isla: { emoji: '🏝️', label: 'Isla' },
  desierto: { emoji: '🏜️', label: 'Desierto' },
  historico: { emoji: '🏛️', label: 'Histórico' },
  'histórico': { emoji: '🏛️', label: 'Histórico' },
};

function typeBadge(tipo) {
  const t = TYPE_BADGES[tipo?.toLowerCase()] || { emoji: '📍', label: tipo || 'Destino' };
  return `${t.emoji} ${t.label}`;
}

// Extrae precio mínimo de strings tipo "Hostel: 5-8€/noche"
function extractMinPrice(str) {
  const m = (str || '').match(/(\d+)[^\d]*€/);
  return m ? parseInt(m[1], 10) : null;
}

function estimateBudget(dest) {
  const sleepMin = extractMinPrice(dest.donde_dormir?.mochilero) || 10;
  const sleepMid = extractMinPrice(dest.donde_dormir?.medio) || 30;
  // Rough estimate: sleep + food (~60% of sleep) + transport (~20% of sleep)
  const low = Math.round(sleepMin * 1.8);
  const mid = Math.round(sleepMid * 1.8);
  return `${low}-${mid}€`;
}

// ── FAQ Generation ───────────────────────────────────────────

function generateFAQs(dest, countryName) {
  const faqs = [];

  // 1. Cost
  const budget = estimateBudget(dest);
  faqs.push({
    q: `¿Cuánto cuesta viajar a ${dest.nombre} desde España?`,
    a: `El presupuesto diario en ${dest.nombre} va desde ${budget}, dependiendo del estilo de viaje. ` +
       `Alojamiento mochilero: ${dest.donde_dormir?.mochilero || 'varía'}. ` +
       `Rango medio: ${dest.donde_dormir?.medio || 'varía'}. ` +
       `${dest.como_llegar || ''}`
  });

  // 2. What to see
  const activities = (dest.que_hacer || []).slice(0, 3).join(', ');
  faqs.push({
    q: `¿Qué ver en ${dest.nombre} en ${dest.dias_recomendados || 3} días?`,
    a: `En ${dest.dias_recomendados || 3} días puedes: ${activities}. ` +
       `${dest.donde_comer ? 'Para comer: ' + dest.donde_comer : ''}`
  });

  // 3. Accommodation
  faqs.push({
    q: `¿Dónde alojarse en ${dest.nombre} barato?`,
    a: `Opciones económicas: ${dest.donde_dormir?.mochilero || 'hostels y guesthouses'}. ` +
       `Rango medio: ${dest.donde_dormir?.medio || 'hoteles boutique'}. ` +
       `Premium: ${dest.donde_dormir?.comfort || 'hoteles de lujo'}.`
  });

  // 4. Safety
  if (dest.alerta_seguridad) {
    faqs.push({
      q: `¿Es seguro viajar a ${dest.nombre}?`,
      a: `⚠️ ${dest.alerta_seguridad}. ${dest.consejo_local || ''}`
    });
  } else {
    faqs.push({
      q: `¿Es seguro viajar a ${dest.nombre}?`,
      a: `${dest.nombre} es un destino seguro para viajeros independientes. ` +
         `Consejo local: ${dest.consejo_local || 'aplica sentido común como en cualquier viaje.'}`
    });
  }

  // 5. Best time
  faqs.push({
    q: `¿Cuál es la mejor época para viajar a ${dest.nombre}?`,
    a: `La mejor época para visitar ${dest.nombre} es ${dest.mejor_epoca || 'todo el año'}. ` +
       `Se recomiendan ${dest.dias_recomendados || '3-5'} días para disfrutarlo bien.`
  });

  return faqs;
}

// ── Schema.org ───────────────────────────────────────────────

function buildSchemaOrg(dest, countryName, slug, faqs) {
  const tourist = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "name": dest.nombre,
    "description": dest.descripcion,
    "touristType": [dest.tipo || "destino"],
    "containedInPlace": {
      "@type": "Country",
      "name": countryName
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return `<script type="application/ld+json">${JSON.stringify(tourist)}</script>\n` +
         `  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
}

// ── HTML Template ────────────────────────────────────────────

function buildHTML(dest, countryName, countryCode, slug) {
  const faqs = generateFAQs(dest, countryName);
  const schemaOrg = buildSchemaOrg(dest, countryName, slug, faqs);
  const budget = estimateBudget(dest);
  const minPrice = extractMinPrice(dest.donde_dormir?.mochilero);
  const pageTitle = `Viajar a ${dest.nombre}: presupuesto, qué ver y mejor época · Borradodelmapa`;
  const metaDesc = `Guía para viajar a ${dest.nombre} (${countryName})${minPrice ? ` desde ${minPrice}€/noche` : ''}. ${dest.mejor_epoca ? 'Mejor época: ' + dest.mejor_epoca + '.' : ''} Planifica tu ruta con IA.`;
  const canonical = `${DOMAIN}/destinos/${slug}.html`;
  const security = dest.alerta_seguridad
    ? `<span class="destino-security-warn">⚠️ Precaución</span>`
    : `<span class="destino-security-ok">✅ Seguro</span>`;

  const activitiesHTML = (dest.que_hacer || [])
    .map(a => `          <li>${escapeHTML(a)}</li>`)
    .join('\n');

  const faqsHTML = faqs
    .map(f => `
        <div class="destino-faq-item">
          <h3>${escapeHTML(f.q)}</h3>
          <p>${escapeHTML(f.a)}</p>
        </div>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(metaDesc)}">
  <meta name="theme-color" content="#050505">
  <meta name="robots" content="index,follow,max-snippet:-1">
  <link rel="canonical" href="${canonical}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Borradodelmapa">
  <meta property="og:title" content="${escapeHTML(pageTitle)}">
  <meta property="og:description" content="${escapeHTML(metaDesc)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${DOMAIN}/og-image.jpg">
  <meta property="og:locale" content="es_ES">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHTML(pageTitle)}">
  <meta name="twitter:description" content="${escapeHTML(metaDesc)}">

  ${schemaOrg}

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/destinos.css">
</head>
<body class="destino-page">

  <!-- HEADER -->
  <header class="app-header">
    <a href="/" class="app-logo-link"><div class="app-logo">borrado<span>del</span>mapa</div></a>
    <div class="app-header-actions" id="header-actions">
      <div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>
    </div>
  </header>

  <!-- HERO -->
  <section class="destino-hero">
    <span class="destino-badge">${typeBadge(dest.tipo)}</span>
    <h1 class="destino-title">Viajar a ${escapeHTML(dest.nombre)}</h1>
    <p class="destino-subtitle">${escapeHTML(dest.region || '')} · ${escapeHTML(countryName)}</p>
  </section>

  <!-- CONTENT -->
  <main class="destino-content">

    <!-- Descripción -->
    <p class="destino-desc">${escapeHTML(dest.descripcion)}</p>

    <!-- Datos rápidos -->
    <div class="destino-facts">
      <div class="destino-fact">
        <span class="destino-fact-icon">💰</span>
        <span class="destino-fact-label">PRESUPUESTO DIARIO</span>
        <span class="destino-fact-value">${budget}</span>
      </div>
      <div class="destino-fact">
        <span class="destino-fact-icon">📅</span>
        <span class="destino-fact-label">DÍAS RECOMENDADOS</span>
        <span class="destino-fact-value">${dest.dias_recomendados || '3-5'}</span>
      </div>
      <div class="destino-fact">
        <span class="destino-fact-icon">🗓️</span>
        <span class="destino-fact-label">MEJOR ÉPOCA</span>
        <span class="destino-fact-value">${escapeHTML(dest.mejor_epoca || 'Todo el año')}</span>
      </div>
      <div class="destino-fact">
        <span class="destino-fact-icon">🔒</span>
        <span class="destino-fact-label">SEGURIDAD</span>
        <span class="destino-fact-value">${security}</span>
      </div>
    </div>

    <!-- Cómo llegar -->
    <section class="destino-section">
      <h2 class="destino-h2">✈️ Cómo llegar</h2>
      <p>${escapeHTML(dest.como_llegar)}</p>
    </section>

    <!-- Dónde dormir -->
    <section class="destino-section">
      <h2 class="destino-h2">🛏️ Dónde dormir</h2>
      <div class="destino-dormir-grid">
        <div class="destino-dormir-card">
          <span class="destino-dormir-label">MOCHILERO</span>
          <p>${escapeHTML(dest.donde_dormir?.mochilero || '')}</p>
        </div>
        <div class="destino-dormir-card">
          <span class="destino-dormir-label">RANGO MEDIO</span>
          <p>${escapeHTML(dest.donde_dormir?.medio || '')}</p>
        </div>
        <div class="destino-dormir-card">
          <span class="destino-dormir-label">COMFORT</span>
          <p>${escapeHTML(dest.donde_dormir?.comfort || '')}</p>
        </div>
      </div>
    </section>

    <!-- Qué hacer -->
    <section class="destino-section">
      <h2 class="destino-h2">🎯 Qué hacer</h2>
      <ul class="destino-list">
${activitiesHTML}
      </ul>
    </section>

    <!-- Dónde comer -->
    <section class="destino-section">
      <h2 class="destino-h2">🍽️ Dónde comer</h2>
      <p>${escapeHTML(dest.donde_comer)}</p>
    </section>

    <!-- Consejo local -->
    <section class="destino-section destino-highlight">
      <h2 class="destino-h2">💡 Consejo local</h2>
      <p>${escapeHTML(dest.consejo_local)}</p>
    </section>

    <!-- Plan B -->
    <section class="destino-section">
      <h2 class="destino-h2">🌧️ Plan B si llueve</h2>
      <p>${escapeHTML(dest.plan_b_lluvia)}</p>
    </section>

    <!-- FAQ -->
    <section class="destino-section destino-faq">
      <h2 class="destino-h2">❓ Preguntas frecuentes</h2>
      ${faqsHTML}
    </section>

    <!-- CTA -->
    <section class="destino-cta">
      <h2>Crea tu ruta de viaje por ${escapeHTML(dest.nombre)}</h2>
      <p>Salma te arma un itinerario día a día con mapa, paradas y presupuesto.</p>
      <a href="/?q=${encodeURIComponent(dest.nombre + ' ' + (dest.dias_recomendados || 3) + ' días')}" class="destino-cta-btn">Planear viaje ›</a>
      <button class="destino-share-btn" id="destino-share">Compartir esta guía</button>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="destino-footer">
    <div class="destino-footer-links">
      <a href="/legal.html">Términos y condiciones</a>
      <a href="/legal.html#privacidad">Privacidad</a>
      <a href="/legal.html#cookies">Cookies</a>
    </div>
    <p class="destino-footer-copy">© ${new Date().getFullYear()} Borradodelmapa</p>
  </footer>

  <!-- SALMA FAB -->
  <button class="salma-fab" id="salma-fab" aria-label="Pregúntale a Salma">
    <span class="salma-fab-icon">💬</span>
    <span class="salma-fab-label">Salma</span>
  </button>

  <!-- SALMA CHAT POPUP (hidden) -->
  <div class="salma-chat-popup" id="salma-chat-popup">
    <div class="salma-chat-header">
      <span class="salma-chat-title">Salma</span>
      <button class="salma-chat-close" id="salma-chat-close">×</button>
    </div>
    <div class="salma-chat-body" id="salma-chat-body">
      <div class="salma-chat-bubble">¡Ey! Estás viendo ${escapeHTML(dest.nombre)}. ¿En qué te ayudo?</div>
      <div class="salma-chat-chips" id="salma-chat-chips">
        <button class="salma-chip" data-msg="Consejos para viajar a ${escapeHTML(dest.nombre)}">💡 Consejos ${escapeHTML(dest.nombre)}</button>
        <button class="salma-chip" data-msg="Itinerario ${dest.dias_recomendados || 3} días en ${escapeHTML(dest.nombre)}">📋 Itinerario ${dest.dias_recomendados || 3} días</button>
        <button class="salma-chip" data-msg="Presupuesto para viajar a ${escapeHTML(dest.nombre)}">💰 Presupuesto</button>
        <button class="salma-chip" data-msg="Buscar vuelos a ${escapeHTML(dest.nombre)}">✈️ Vuelos</button>
        <button class="salma-chip" data-msg="Hoteles en ${escapeHTML(dest.nombre)}">🏨 Hoteles</button>
      </div>
    </div>
    <div class="salma-chat-input-bar">
      <input type="text" class="salma-chat-input" id="salma-chat-input" placeholder="" autocomplete="off" data-placeholders="¿qué ver en ${escapeHTML(dest.nombre)}?|ruta por ${escapeHTML(countryName)}|¿dónde comer en ${escapeHTML(dest.nombre)}?|${escapeHTML(dest.nombre)} en ${dest.dias_recomendados || 3} días|presupuesto ${escapeHTML(countryName)}|¿es seguro viajar a ${escapeHTML(dest.nombre)}?|mejor época para ${escapeHTML(countryName)}">
      <button class="salma-chat-send" id="salma-chat-send">›</button>
    </div>
  </div>

  <script>
  window.DESTINO = ${JSON.stringify({ nombre: dest.nombre, pais: countryName, id: dest.id, code: countryCode })};
  window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
  </script>
  <script src="/destinos/destinos.js"></script>
</body>
</html>`;
}

// ── Sitemap ──────────────────────────────────────────────────

function buildSitemap(slugs) {
  const urls = slugs.map(s => `  <url>
    <loc>${DOMAIN}/destinos/${s}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const countryFlag = args.indexOf('--country');
  const onlyCountry = countryFlag >= 0 ? args[countryFlag + 1] : null;

  // Load countries for name mapping
  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.name;

  // Find KV files
  let files = fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json'));
  if (onlyCountry) files = files.filter(f => f.startsWith(onlyCountry));

  console.log(`\n📍 Build Destinos — Páginas SEO`);
  console.log(`   Países disponibles: ${files.length}`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const allSlugs = [];
  let totalPages = 0;
  let errors = 0;

  for (const file of files) {
    const code = file.replace('.json', '');
    const countryName = countryMap[code] || code;

    try {
      const data = JSON.parse(fs.readFileSync(path.join(KV_DIR, file), 'utf-8'));
      const destinos = data.destinos || [];

      for (const dest of destinos) {
        if (!dest.id || !dest.nombre) {
          console.warn(`   ⚠️ ${countryName}: destino sin id/nombre, saltando`);
          errors++;
          continue;
        }

        const slug = `${dest.id}-${slugify(countryName)}`;
        allSlugs.push(slug);

        if (!dryRun) {
          const html = buildHTML(dest, countryName, code, slug);
          fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html);
        }
        totalPages++;
      }
    } catch (e) {
      console.error(`   ❌ ${code}: ${e.message}`);
      errors++;
    }
  }

  // Generate sitemap
  if (!dryRun && allSlugs.length > 0) {
    fs.writeFileSync(SITEMAP_FILE, buildSitemap(allSlugs));
    console.log(`   🗺️ Sitemap: ${SITEMAP_FILE} (${allSlugs.length} URLs)`);
  }

  console.log(`\n── Resumen ──`);
  console.log(`   ✅ Páginas generadas: ${totalPages}`);
  console.log(`   ⚠️ Errores: ${errors}`);
  console.log(`   📁 Directorio: ${OUT_DIR}/`);
  if (dryRun) console.log(`   (dry-run — no se generaron archivos)`);
}

main().catch(console.error);
