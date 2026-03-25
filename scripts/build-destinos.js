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
const ROUTES_DIR = path.join(ROOT, 'worker', 'kv', 'routes-nivel3');
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

// ── Route Loading ────────────────────────────────────────────

function loadRoute(destId, countrySlug) {
  const routeFile = path.join(ROUTES_DIR, `${destId}-${countrySlug}.json`);
  try {
    if (fs.existsSync(routeFile)) {
      return JSON.parse(fs.readFileSync(routeFile, 'utf-8'));
    }
  } catch (_) {}
  return null;
}

// Genera HTML estático del itinerario (indexable por Google)
function buildStaticItinerary(route) {
  if (!route || !route.stops || route.stops.length === 0) return '';

  // Agrupar stops por día
  const byDay = {};
  for (const stop of route.stops) {
    const day = stop.day || 1;
    if (!byDay[day]) byDay[day] = { stops: [], day_title: stop.day_title || `Día ${day}` };
    if (stop.day_title) byDay[day].day_title = stop.day_title;
    byDay[day].stops.push(stop);
  }

  const days = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
  let html = '<div class="destino-itinerary-static">\n';
  html += '  <h2 class="destino-h2">🗺️ Itinerario completo</h2>\n';

  for (const dayNum of days) {
    const { stops, day_title } = byDay[dayNum];
    html += `  <details class="destino-acc-item">\n`;
    html += `    <summary class="destino-acc-header">Día ${dayNum} — ${escapeHTML(day_title)} <span class="destino-day-stops">${stops.length} paradas</span></summary>\n`;
    html += `    <div class="destino-acc-body">\n`;
    for (const stop of stops) {
      html += `      <div class="destino-stop">\n`;
      html += `        <h4 class="destino-stop-name">${escapeHTML(stop.name || '')}</h4>\n`;
      if (stop.narrative) html += `        <p class="destino-stop-desc">${escapeHTML(stop.narrative)}</p>\n`;
      if (stop.duration) html += `        <span class="destino-stop-meta">⏱ ${escapeHTML(stop.duration)}</span>\n`;
      if (stop.km_from_previous) html += `        <span class="destino-stop-meta">📍 ${stop.km_from_previous} km</span>\n`;
      html += `      </div>\n`;
    }
    html += `    </div>\n`;
    html += `  </details>\n`;
  }

  html += '</div>';
  return html;
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

function buildHTML(dest, countryName, countryCode, slug, route, nav) {
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
  ${route ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>` : ''}
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

  <!-- NAV BREADCRUMB -->
  <nav class="destino-nav-bar">
    <a href="/destinos/" class="destino-nav-link">Destinos</a>
    <span class="destino-nav-sep">›</span>
    <a href="/destinos/${slugify(countryName)}.html" class="destino-nav-link">${escapeHTML(countryName)}</a>
  </nav>

  <!-- HERO -->
  <section class="destino-hero">
    <div class="destino-hero-nav">
      ${nav?.prev ? `<a href="/destinos/${nav.prev.slug}.html" class="destino-arrow destino-arrow-prev" title="${escapeHTML(nav.prev.name)}">‹</a>` : '<span class="destino-arrow destino-arrow-disabled">‹</span>'}
      <div class="destino-hero-center">
        <span class="destino-badge">${typeBadge(dest.tipo)}</span>
        <h1 class="destino-title">Viajar a ${escapeHTML(dest.nombre)}</h1>
        <p class="destino-subtitle">${escapeHTML(dest.region || '')} · ${escapeHTML(countryName)}</p>
      </div>
      ${nav?.next ? `<a href="/destinos/${nav.next.slug}.html" class="destino-arrow destino-arrow-next" title="${escapeHTML(nav.next.name)}">›</a>` : '<span class="destino-arrow destino-arrow-disabled">›</span>'}
    </div>
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

    ${route ? `
    <!-- ITINERARIO COMPLETO -->
    ${buildStaticItinerary(route)}

    <!-- ITINERARIO INTERACTIVO (mapa + guide-renderer) -->
    <div id="chat-area"></div>
    <script>
    window.__ROUTE_DATA = ${JSON.stringify(route)};
    </script>
    <script src="/guide-renderer.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (window.__ROUTE_DATA && typeof guideRenderer !== 'undefined') {
        guideRenderer.render(window.__ROUTE_DATA, { saved: true });
        var staticIt = document.querySelector('.destino-itinerary-static');
        if (staticIt) staticIt.style.display = 'none';
      }
    });
    </script>
    ` : ''}

    <!-- Más info en acordeón -->
    <div class="destino-accordion">

      <details class="destino-acc-item" open>
        <summary class="destino-acc-header">✈️ Cómo llegar</summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.como_llegar)}</p>
          <a class="destino-cta-subtle" href="#salma-chat-input" data-salma-msg="Buscar vuelos a ${escapeHTML(dest.nombre)}">Salma te busca vuelos <span class="destino-cta-note">· te ahorra horas comparando</span></a>
        </div>
      </details>

      <details class="destino-acc-item">
        <summary class="destino-acc-header">🛏️ Dónde dormir</summary>
        <div class="destino-acc-body">
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
          <a class="destino-cta-subtle" href="#salma-chat-input" data-salma-msg="Hoteles en ${escapeHTML(dest.nombre)}">Pídele a Salma los mejores hoteles <span class="destino-cta-note">· filtra por tu presupuesto</span></a>
        </div>
      </details>

      <details class="destino-acc-item">
        <summary class="destino-acc-header">🎯 Qué hacer</summary>
        <div class="destino-acc-body">
          <ul class="destino-list">
${activitiesHTML}
          </ul>
          <a class="destino-cta-subtle" href="#salma-chat-input" data-salma-msg="Plan personalizado en ${escapeHTML(dest.nombre)}">Salma te monta un plan a medida <span class="destino-cta-note">· en segundos</span></a>
        </div>
      </details>

      <details class="destino-acc-item">
        <summary class="destino-acc-header">🍽️ Dónde comer</summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.donde_comer)}</p>
        </div>
      </details>

      <details class="destino-acc-item destino-highlight">
        <summary class="destino-acc-header">💡 Consejo local</summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.consejo_local)}</p>
        </div>
      </details>

      <details class="destino-acc-item">
        <summary class="destino-acc-header">🌧️ Plan B si llueve</summary>
        <div class="destino-acc-body">
          <p>${escapeHTML(dest.plan_b_lluvia)}</p>
        </div>
      </details>

      <details class="destino-acc-item">
        <summary class="destino-acc-header">❓ Preguntas frecuentes</summary>
        <div class="destino-acc-body">
          ${faqsHTML}
        </div>
      </details>

    </div>

    <!-- SHARE -->
    <div class="destino-share-wrap">
      <button class="destino-share-btn" id="destino-share">Compartir esta guía</button>
    </div>

    <!-- SALMA INLINE CHAT -->
    <section class="destino-salma-section">
      <div class="destino-salma-header">
        <img class="salma-chat-avatar" src="/salma_ai_avatar.png" alt="Salma" width="28" height="28">
        <span class="destino-salma-title">Pregúntale a Salma sobre ${escapeHTML(dest.nombre)}</span>
      </div>
      <div class="salma-chat-body" id="salma-chat-body">
        <div class="salma-chat-bubble">¡Ey! Estás viendo ${escapeHTML(dest.nombre)}. ¿En qué te ayudo?</div>
        <div class="salma-chat-chips" id="salma-chat-chips">
          <button class="salma-chip" data-msg="Consejos para viajar a ${escapeHTML(dest.nombre)}">💡 Consejos ${escapeHTML(dest.nombre)}</button>
          <button class="salma-chip" data-msg="Itinerario en ${escapeHTML(dest.nombre)}">📋 Itinerarios</button>
          <button class="salma-chip" data-msg="Presupuesto para viajar a ${escapeHTML(dest.nombre)}">💰 Presupuesto</button>
          <button class="salma-chip" data-msg="Buscar vuelos a ${escapeHTML(dest.nombre)}">✈️ Vuelos</button>
          <button class="salma-chip" data-msg="Hoteles en ${escapeHTML(dest.nombre)}">🏨 Hoteles</button>
        </div>
      </div>
      <div class="salma-chat-input-bar">
        <input type="text" class="salma-chat-input" id="salma-chat-input" placeholder="" autocomplete="off" data-placeholders="¿qué ver en ${escapeHTML(dest.nombre)}?|ruta por ${escapeHTML(countryName)}|¿dónde comer en ${escapeHTML(dest.nombre)}?|${escapeHTML(dest.nombre)} en ${dest.dias_recomendados || 3} días|presupuesto ${escapeHTML(countryName)}|¿es seguro viajar a ${escapeHTML(dest.nombre)}?|mejor época para ${escapeHTML(countryName)}">
        <button class="salma-chat-send" id="salma-chat-send">›</button>
      </div>
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

  <script>
  window.DESTINO = ${JSON.stringify({ nombre: dest.nombre, pais: countryName, id: dest.id, code: countryCode })};
  window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
  </script>
  <script src="/destinos/destinos.js"></script>
</body>
</html>`;
}

// ── Continentes ──────────────────────────────────────────────

const CONTINENTS = {
  'Europa': ['al','ad','at','by','be','ba','bg','hr','cy','cz','dk','ee','fi','fr','de','gr','hu','is','ie','it','kz','lv','li','lt','lu','mk','mt','md','mc','me','nl','no','pl','pt','ro','ru','sm','rs','sk','si','es','se','ch','ua','gb','va'],
  'Asia': ['af','am','az','bd','bt','bn','kh','cn','cy','ge','in','id','ir','iq','il','jp','jo','kz','kw','kg','la','lb','my','mv','mn','mm','np','kp','kr','om','pk','ps','ph','qa','sa','sg','lk','sy','tj','th','tl','tm','tr','ae','uz','vn','ye'],
  'África': ['dz','ao','bj','bw','bf','bi','cv','cm','cf','td','km','cg','cd','ci','dj','eg','gq','er','sz','et','ga','gm','gh','gn','gw','ke','ls','lr','ly','mg','mw','ml','mr','mu','ma','mz','na','ne','ng','rw','st','sn','sc','sl','so','za','ss','sd','tz','tg','tn','ug','zm','zw'],
  'América del Norte': ['ca','cr','cu','dm','do','sv','gt','ht','hn','jm','mx','ni','pa','tt','us'],
  'América del Sur': ['ar','bo','br','cl','co','ec','gy','py','pe','sr','uy','ve'],
  'Oceanía': ['au','fj','ki','fm','nr','nz','pw','pg','ws','to','tv','vu'],
  'Caribe': ['ag','bs','bb','bz','gd','kn','lc','vc'],
};

function getContinent(code) {
  for (const [cont, codes] of Object.entries(CONTINENTS)) {
    if (codes.includes(code)) return cont;
  }
  return 'Otros';
}

// ── Country Page Template ────────────────────────────────────

function buildCountryHTML(countryName, countryCode, destinos) {
  const countrySlug = slugify(countryName);
  const pageTitle = `Viajar a ${countryName}: ${destinos.length} destinos imprescindibles · Borradodelmapa`;
  const metaDesc = `Guía para viajar a ${countryName}. Los ${destinos.length} mejores destinos con presupuesto, alojamiento y consejos. Planifica tu ruta con IA.`;
  const canonical = `${DOMAIN}/destinos/${countrySlug}.html`;

  const cardsHTML = destinos.map(dest => {
    const destSlug = `${dest.id}-${countrySlug}`;
    const badge = typeBadge(dest.tipo);
    const budget = estimateBudget(dest);
    return `
      <a href="/destinos/${destSlug}.html" class="destino-country-card">
        <div class="destino-country-card-badge">${badge}</div>
        <h3 class="destino-country-card-title">${escapeHTML(dest.nombre)}</h3>
        <p class="destino-country-card-desc">${escapeHTML((dest.descripcion || '').substring(0, 120))}...</p>
        <div class="destino-country-card-meta">
          <span>${dest.dias_recomendados || 3} días</span>
          <span>${budget}/día</span>
        </div>
      </a>`;
  }).join('');

  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Destinos en ${countryName}`,
    "description": metaDesc,
    "numberOfItems": destinos.length,
    "itemListElement": destinos.map((dest, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": dest.nombre,
      "url": `${DOMAIN}/destinos/${dest.id}-${countrySlug}.html`
    }))
  });

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

  <script type="application/ld+json">${schemaOrg}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/destinos.css">
</head>
<body class="destino-page">

  <header class="app-header">
    <a href="/" class="app-logo-link"><div class="app-logo">borrado<span>del</span>mapa</div></a>
    <div class="app-header-actions" id="header-actions">
      <div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>
    </div>
  </header>

  <!-- NAV -->
  <nav class="destino-nav-bar">
    <a href="/destinos/" class="destino-nav-link">Destinos</a>
  </nav>

  <section class="destino-hero">
    <h1 class="destino-title">Viajar a ${escapeHTML(countryName)}</h1>
    <p class="destino-subtitle">${destinos.length} DESTINOS</p>
  </section>

  <main class="destino-content destino-content-wide">
    <div class="destino-country-grid">
      ${cardsHTML}
    </div>

    <!-- SALMA INLINE -->
    <section class="destino-salma-section">
      <div class="destino-salma-header">
        <img class="salma-chat-avatar" src="/salma_ai_avatar.png" alt="Salma" width="28" height="28">
        <span class="destino-salma-title">Planifica tu viaje a ${escapeHTML(countryName)}</span>
      </div>
      <div class="salma-chat-body" id="salma-chat-body">
        <div class="salma-chat-bubble">¡Ey! ¿Quieres viajar a ${escapeHTML(countryName)}? Pregúntame lo que quieras.</div>
        <div class="salma-chat-chips" id="salma-chat-chips">
          <button class="salma-chip" data-msg="Mejor ruta por ${escapeHTML(countryName)}">📋 Mejor ruta</button>
          <button class="salma-chip" data-msg="Presupuesto para ${escapeHTML(countryName)}">💰 Presupuesto</button>
          <button class="salma-chip" data-msg="Vuelos a ${escapeHTML(countryName)}">✈️ Vuelos</button>
        </div>
      </div>
      <div class="salma-chat-input-bar">
        <input type="text" class="salma-chat-input" id="salma-chat-input" placeholder="" autocomplete="off" data-placeholders="ruta por ${escapeHTML(countryName)}|presupuesto ${escapeHTML(countryName)}|mejor época ${escapeHTML(countryName)}|¿es seguro ${escapeHTML(countryName)}?">
        <button class="salma-chat-send" id="salma-chat-send">›</button>
      </div>
    </section>
  </main>

  <footer class="destino-footer">
    <div class="destino-footer-links">
      <a href="/legal.html">Términos y condiciones</a>
      <a href="/legal.html#privacidad">Privacidad</a>
      <a href="/legal.html#cookies">Cookies</a>
    </div>
    <p class="destino-footer-copy">© ${new Date().getFullYear()} Borradodelmapa</p>
  </footer>

  <script>
  window.DESTINO = ${JSON.stringify({ nombre: countryName, pais: countryName, id: countryCode, code: countryCode })};
  window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
  </script>
  <script src="/destinos/destinos.js"></script>
</body>
</html>`;
}

// ── Index Page Template ──────────────────────────────────────

function buildIndexHTML(countriesByContinent) {
  const pageTitle = 'Destinos de viaje — Guías por país · Borradodelmapa';
  const metaDesc = 'Explora más de 190 países con guías de viaje prácticas. Presupuestos, alojamiento, qué hacer y consejos locales. Planifica tu ruta con IA.';

  let continentsHTML = '';
  for (const [continent, countries] of Object.entries(countriesByContinent)) {
    if (countries.length === 0) continue;
    const cardsHTML = countries.map(c => `
        <a href="/destinos/${slugify(c.name)}.html" class="destino-index-card">
          <span class="destino-index-card-name">${escapeHTML(c.name)}</span>
          <span class="destino-index-card-count">${c.numDestinos} destinos</span>
        </a>`).join('');

    continentsHTML += `
      <section class="destino-index-continent">
        <h2 class="destino-index-continent-title">${escapeHTML(continent)}</h2>
        <div class="destino-index-grid">
          ${cardsHTML}
        </div>
      </section>`;
  }

  const schemaOrg = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Destinos de viaje",
    "description": metaDesc,
    "url": `${DOMAIN}/destinos/`
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHTML(pageTitle)}</title>
  <meta name="description" content="${escapeHTML(metaDesc)}">
  <meta name="theme-color" content="#050505">
  <meta name="robots" content="index,follow,max-snippet:-1">
  <link rel="canonical" href="${DOMAIN}/destinos/">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Borradodelmapa">
  <meta property="og:title" content="${escapeHTML(pageTitle)}">
  <meta property="og:description" content="${escapeHTML(metaDesc)}">
  <meta property="og:url" content="${DOMAIN}/destinos/">
  <meta property="og:image" content="${DOMAIN}/og-image.jpg">
  <meta property="og:locale" content="es_ES">

  <script type="application/ld+json">${schemaOrg}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/destinos.css">
</head>
<body class="destino-page">

  <header class="app-header">
    <a href="/" class="app-logo-link"><div class="app-logo">borrado<span>del</span>mapa</div></a>
    <div class="app-header-actions" id="header-actions">
      <div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>
    </div>
  </header>

  <section class="destino-hero">
    <h1 class="destino-title">Destinos</h1>
    <p class="destino-subtitle">MÁS DE 190 PAÍSES · GUÍAS PRÁCTICAS</p>
  </section>

  <main class="destino-content destino-content-wide">

    <!-- Salma input -->
    <div class="destino-salma-input-wrap">
      <div class="destino-salma-input-row">
        <input type="text" class="destino-salma-input" id="destino-search" placeholder="" autocomplete="off" data-placeholders="Marruecos 5 días desde Tánger|Vietnam 2 semanas mochilero|Roma fin de semana romántico|Nepal trekking Everest|Tailandia playas e islas 10 días">
        <div class="destino-input-actions">
          <button class="destino-mic-btn" id="destino-mic" aria-label="Hablar" type="button">🎙️</button>
          <button class="destino-send-btn" id="destino-planear" type="button">›</button>
        </div>
      </div>
    </div>

    <!-- Últimas guías visitadas -->
    <section class="destino-recent" id="destino-recent" style="display:none">
      <h2 class="destino-index-continent-title">Últimas guías visitadas</h2>
      <div class="destino-index-grid" id="destino-recent-grid"></div>
    </section>

    <!-- Países por continente -->
    <div id="destino-countries">
    ${continentsHTML}
    </div>

    <!-- SALMA INLINE -->
    <section class="destino-salma-section">
      <div class="destino-salma-header">
        <img class="salma-chat-avatar" src="/salma_ai_avatar.png" alt="Salma" width="28" height="28">
        <span class="destino-salma-title">¿No encuentras tu destino? Pregúntale a Salma</span>
      </div>
      <div class="salma-chat-body" id="salma-chat-body">
        <div class="salma-chat-bubble">Dime adónde quieres ir y te armo la ruta en un minuto.</div>
        <div class="salma-chat-chips" id="salma-chat-chips">
          <button class="salma-chip" data-msg="Destinos baratos desde España">💰 Destinos baratos</button>
          <button class="salma-chip" data-msg="Destinos de playa en invierno">🏖️ Playa en invierno</button>
          <button class="salma-chip" data-msg="Escapada fin de semana Europa">✈️ Escapada Europa</button>
        </div>
      </div>
      <div class="salma-chat-input-bar">
        <input type="text" class="salma-chat-input" id="salma-chat-input" placeholder="" autocomplete="off" data-placeholders="Japón 2 semanas|playa Caribe presupuesto|trekking Nepal|ruta Marruecos en coche|islas Grecia 7 días">
        <button class="salma-chat-send" id="salma-chat-send">›</button>
      </div>
    </section>
  </main>

  <footer class="destino-footer">
    <div class="destino-footer-links">
      <a href="/legal.html">Términos y condiciones</a>
      <a href="/legal.html#privacidad">Privacidad</a>
      <a href="/legal.html#cookies">Cookies</a>
    </div>
    <p class="destino-footer-copy">© ${new Date().getFullYear()} Borradodelmapa</p>
  </footer>

  <script>
  window.DESTINO = { nombre: 'Destinos', pais: '', id: 'index', code: '' };
  window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
  </script>
  <script src="/destinos/destinos.js"></script>
</body>
</html>`;
}

// ── Sitemap ──────────────────────────────────────────────────

function buildSitemap(allUrls) {
  const urls = allUrls.map(u => `  <url>
    <loc>${u.url}</loc>
    <changefreq>${u.freq || 'monthly'}</changefreq>
    <priority>${u.priority || 0.8}</priority>
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

  const countries = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.name;

  let files = fs.readdirSync(KV_DIR).filter(f => f.endsWith('.json'));
  if (onlyCountry) files = files.filter(f => f.startsWith(onlyCountry));

  console.log(`\n📍 Build Destinos — Páginas SEO (3 niveles)`);
  console.log(`   Países disponibles: ${files.length}`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const allSitemapUrls = [];
  const countriesByContinent = {};
  let totalDest = 0;
  let totalCountry = 0;
  let errors = 0;

  for (const file of files) {
    const code = file.replace('.json', '');
    const countryName = countryMap[code] || code;
    const countrySlug = slugify(countryName);

    try {
      const data = JSON.parse(fs.readFileSync(path.join(KV_DIR, file), 'utf-8'));
      const destinos = data.destinos || [];
      if (destinos.length === 0) continue;

      // ── Nivel 3: páginas de destino ──
      const validDests = destinos.filter(d => d.id && d.nombre);
      for (let i = 0; i < validDests.length; i++) {
        const dest = validDests[i];
        const slug = `${dest.id}-${countrySlug}`;
        const nav = {
          prev: i > 0 ? { slug: `${validDests[i-1].id}-${countrySlug}`, name: validDests[i-1].nombre } : null,
          next: i < validDests.length - 1 ? { slug: `${validDests[i+1].id}-${countrySlug}`, name: validDests[i+1].nombre } : null,
        };
        if (!dryRun) {
          const route = loadRoute(dest.id, countrySlug);
          fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), buildHTML(dest, countryName, code, slug, route, nav));
        }
        allSitemapUrls.push({ url: `${DOMAIN}/destinos/${slug}.html`, priority: 0.8, freq: 'monthly' });
        totalDest++;
      }

      // ── Nivel 2: página de país ──
      if (!dryRun) {
        fs.writeFileSync(path.join(OUT_DIR, `${countrySlug}.html`), buildCountryHTML(countryName, code, destinos));
      }
      allSitemapUrls.push({ url: `${DOMAIN}/destinos/${countrySlug}.html`, priority: 0.9, freq: 'weekly' });
      totalCountry++;

      // Track for index page
      const continent = getContinent(code);
      if (!countriesByContinent[continent]) countriesByContinent[continent] = [];
      countriesByContinent[continent].push({ name: countryName, code, numDestinos: destinos.length });

    } catch (e) {
      console.error(`   ❌ ${code}: ${e.message}`);
      errors++;
    }
  }

  // ── Nivel 1: página índice ──
  if (!dryRun && !onlyCountry) {
    // Sort countries within each continent
    for (const cont of Object.keys(countriesByContinent)) {
      countriesByContinent[cont].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), buildIndexHTML(countriesByContinent));
    allSitemapUrls.push({ url: `${DOMAIN}/destinos/`, priority: 1.0, freq: 'weekly' });
    console.log(`   📄 Índice: destinos/index.html`);
  }

  // Sitemap
  if (!dryRun && allSitemapUrls.length > 0) {
    fs.writeFileSync(SITEMAP_FILE, buildSitemap(allSitemapUrls));
    console.log(`   🗺️ Sitemap: ${allSitemapUrls.length} URLs`);
  }

  console.log(`\n── Resumen ──`);
  console.log(`   📄 Índice: 1`);
  console.log(`   🌍 Países: ${totalCountry}`);
  console.log(`   📍 Destinos: ${totalDest}`);
  console.log(`   ⚠️ Errores: ${errors}`);
  if (dryRun) console.log(`   (dry-run)`);
}

main().catch(console.error);
