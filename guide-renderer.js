/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — guide-renderer.js
   Renderizado ÚNICO de la tarjeta de guía
   ═══════════════════════════════════════════ */

// Asegurar que escapeHTML existe (en destinos no se carga app.js)
if (typeof escapeHTML === 'undefined') {
  window.escapeHTML = function(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  };
}

// Escapar HTML + linkificar URLs y teléfonos
function linkify(str) {
  if (!str) return '';
  let html = escapeHTML(str);
  // URLs → enlaces clicables
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--dorado);word-break:break-all;">$1</a>');
  // Teléfonos internacionales
  html = html.replace(/(\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{2,4}[ .-]?\d{2,4}[ .-]?\d{0,4})/g, function(match) {
    var clean = match.replace(/[\s.-]/g, '').trim();
    return '<a href="tel:' + clean + '" style="color:var(--dorado);">' + match.trim() + '</a>';
  });
  return html;
}

// Estilo del número sobre cada pin del mapa principal (L.divIcon no trae estilo propio).
// Se inyecta una vez, no depende de que styles.css tenga esta clase.
function ensureGuideMapPinStyles() {
  if (document.getElementById('guide-map-pin-style')) return;
  const style = document.createElement('style');
  style.id = 'guide-map-pin-style';
  style.textContent = `.guide-map-pin-num{display:flex;align-items:center;justify-content:center;
    width:16px;height:16px;font:700 10px/1 var(--font-mono,monospace);color:#060503;
    pointer-events:none;}`;
  document.head.appendChild(style);
}

const guideRenderer = {

  // Iconos por tipo de parada
  _icons: {
    lugar: '🏛️', hotel: '🏨', restaurante: '🍜', experiencia: '🎒',
    mirador: '📸', ruta: '🛤️', playa: '🏖️', templo: '🛕',
    museo: '🏛️', mercado: '🛒', bar: '🍺', café: '☕',
  },

  // ═══ RENDER PRINCIPAL ═══
  render(routeData, options = {}) {
    const area = document.getElementById('chat-area');
    if (!area || !routeData) return;
    ensureGuideMapPinStyles();

    // Eliminar guide-card anterior y limpiar mapas
    const prev = area.querySelector('.guide-card');
    if (prev) prev.remove();
    // Destruir mapas Leaflet anteriores
    for (const key of Object.keys(this._maps)) {
      try { this._maps[key].remove(); } catch (_) {}
    }
    this._maps = {};

    const r = routeData;
    const stops = r.stops || [];
    this._stops = stops;
    this._preferredRoad = r.preferred_road || null;
    // Geometría real de la carretera pedida (OSM, ver resolveNamedRoad en el Worker) —
    // si existe, se pinta tal cual en vez de pedir un trazado "óptimo" a Directions.
    this._roadGeometry = Array.isArray(r.road_geometry) ? r.road_geometry : null;
    this._roadCheck = r.road_check || null;
    const country = r.country || r.region || '';

    // Agrupar stops por día
    const days = this._groupByDay(stops);
    const totalStops = stops.length;
    const totalDays = Object.keys(days).length;
    const totalKm = Math.round(stops.reduce((sum, s) => sum + (s.km_from_previous || 0), 0));

    // Construir HTML
    const card = document.createElement('div');
    card.className = 'guide-card';

    // Header
    card.innerHTML = `
      <div class="guide-header">
        <div class="guide-title">${escapeHTML(r.title || r.name || 'Tu ruta')}</div>
        <div class="guide-meta">${totalDays} DÍAS · ${escapeHTML(country.toUpperCase())} · ${totalStops} PARADAS</div>
        ${r.summary ? `<p class="guide-summary">${escapeHTML(r.summary)}</p>` : ''}
        ${r.road_name ? `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;">
          <div style="background:var(--gris2,#1e190f);border:1px solid var(--linea,rgba(240,180,41,.22));border-radius:10px;padding:8px 10px;">
            <div style="font-family:var(--font-mono,monospace);font-size:16px;color:var(--dorado2,#ffc947);">${totalKm} km</div>
            <div style="font-size:9px;letter-spacing:.06em;color:var(--crema-dim,#a99f8c);text-transform:uppercase;">Distancia</div>
          </div>
          <div style="background:var(--gris2,#1e190f);border:1px solid var(--linea,rgba(240,180,41,.22));border-radius:10px;padding:8px 10px;">
            <div style="font-family:var(--font-mono,monospace);font-size:16px;color:var(--dorado2,#ffc947);">${totalStops}</div>
            <div style="font-size:9px;letter-spacing:.06em;color:var(--crema-dim,#a99f8c);text-transform:uppercase;">Paradas</div>
          </div>
          <div style="background:var(--gris2,#1e190f);border:1px solid var(--linea,rgba(240,180,41,.22));border-radius:10px;padding:8px 10px;">
            <div style="font-family:var(--font-mono,monospace);font-size:16px;color:var(--dorado2,#ffc947);">${escapeHTML(r.road_name)}</div>
            <div style="font-size:9px;letter-spacing:.06em;color:var(--crema-dim,#a99f8c);text-transform:uppercase;">Carretera</div>
          </div>
        </div>` : ''}
      </div>

      <div class="guide-map-container" id="guide-map-main"></div>

      <div class="guide-days">
        <div class="guide-days-label">ITINERARIO</div>
        ${this._renderDays(days, country, r.maps_links)}
      </div>

      ${this._renderPreDeparture(r.pre_departure)}
      ${this._renderPracticalInfo(r.practical_info)}
      ${this._renderTips(r.tips)}

      ${options.partial ? '<div class="guide-actions"><div class="guide-loading-blocks">Cargando más días...</div></div>' : `<div class="guide-actions">
        ${options.saved ? '' : '<button class="btn-primary" id="guide-save-btn">GUARDAR MI GUÍA</button>'}
        ${(() => { const u = options.showGmapsOffer ? this._fullRouteGmapsUrl(stops, country, r.road_gmaps_url) : null; return u ? `<a class="btn-primary" id="guide-gmaps-btn" href="${u}" target="_blank" rel="noopener">🗺 ABRIR EN GOOGLE MAPS</a>` : ''; })()}
        <button class="btn-ghost" id="guide-share-btn">COMPARTIR</button>
      </div>`}
    `;

    area.appendChild(card);

    // Cargar fotos de paradas visibles (primera parada abierta)
    this._loadVisiblePhotos(card);

    // Inicializar mapa general
    this._initMainMap(stops, days);

    // Inicializar mini-mapa del primer día (abierto por defecto)
    const firstDayNum = Object.keys(days).map(Number).sort((a, b) => a - b)[0];
    if (firstDayNum) this._initDayMap(firstDayNum, days[firstDayNum].stops);

    // Event delegation — toggles de día y parada
    card.addEventListener('click', (e) => {
      const dayHead = e.target.closest('.guide-day-head');
      if (dayHead) {
        const dayEl = dayHead.parentElement;
        dayEl.classList.toggle('open');
        // Lazy load mini-mapa al abrir día
        if (dayEl.classList.contains('open')) {
          const dayNum = dayEl.querySelector('.guide-day-map')?.dataset.day;
          if (dayNum && days[Number(dayNum)]) {
            this._initDayMap(Number(dayNum), days[Number(dayNum)].stops);
          }
        }
        return;
      }
      const stopHead = e.target.closest('.guide-stop-head');
      if (stopHead) {
        const stop = stopHead.parentElement;
        stop.classList.toggle('open');
        // Lazy load foto al abrir
        if (stop.classList.contains('open')) {
          this._lazyLoadPhoto(stop);
        }
        return;
      }
    });

    // Botón guardar
    const saveBtn = document.getElementById('guide-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (typeof salma !== 'undefined') salma.guardar();
      });
    }

    // Botón compartir — menú con opciones
    const shareBtn = document.getElementById('guide-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Cerrar menú si ya existe
        const existing = document.querySelector('.share-menu');
        if (existing) { existing.remove(); document.querySelector('.share-menu-overlay')?.remove(); return; }

        // Crear menú
        const menu = document.createElement('div');
        menu.className = 'share-menu';
        menu.innerHTML = `
          <button class="share-menu-item" data-action="link">🔗 Compartir link</button>
        `;

        // Overlay para cerrar al pulsar fuera
        const overlay = document.createElement('div');
        overlay.className = 'share-menu-overlay';
        overlay.addEventListener('click', () => { menu.remove(); overlay.remove(); });
        document.body.appendChild(overlay);

        // Posicionar relativo al botón
        shareBtn.style.position = 'relative';
        shareBtn.appendChild(menu);

        // Acciones
        menu.addEventListener('click', async (ev) => {
          const action = ev.target.closest('.share-menu-item')?.dataset.action;
          if (!action) return;
          menu.remove(); overlay.remove();

          if (action === 'link') {
            let shareUrl = null;
            if (typeof salma !== 'undefined' && salma.currentRouteId && typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
              try {
                const userDoc = await db.collection('users').doc(currentUser.uid)
                  .collection('maps').doc(salma.currentRouteId).get();
                let slug = userDoc.data()?.slug;
                // Si no tiene slug, generar y publicar ahora
                if (!slug && typeof generateSlug === 'function' && typeof publishGuide === 'function') {
                  slug = generateSlug(r.title || r.name || 'mi-ruta');
                  publishGuide(salma.currentRouteId, userDoc.data(), slug, r).catch(() => {});
                }
                if (slug) shareUrl = 'https://borradodelmapa.com/' + slug;
              } catch (_) {}
            }
            if (!shareUrl) {
              showToast('Guarda la guía primero para compartirla');
              return;
            }
            if (navigator.share) {
              navigator.share({ title: r.title || 'Mi ruta de viaje', text: 'Mapa en mano, viaje en camino', url: shareUrl }).catch(() => {});
            } else {
              navigator.clipboard.writeText(shareUrl).then(() => showToast('Link copiado')).catch(() => {});
            }
          }

        });
      });
    }
  },

  // ═══ AGRUPAR STOPS POR DÍA ═══
  _groupByDay(stops) {
    const days = {};
    for (const stop of stops) {
      const d = stop.day || 1;
      if (!days[d]) days[d] = { title: stop.day_title || '', stops: [] };
      days[d].stops.push(stop);
      if (stop.day_title && !days[d].title) days[d].title = stop.day_title;
    }
    return days;
  },

  // ═══ RENDER DÍAS ═══
  _renderDays(days, country, mapsLinks) {
    let html = '';
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
    const linksMap = {};
    if (Array.isArray(mapsLinks)) {
      // BLOQUE E (frontend) — descarta enlaces de días con coords imposibles (guías antiguas ya guardadas)
      mapsLinks.forEach(l => { if (l.day && l.url && this._mapsUrlCoordsSane(l.url)) linksMap[l.day] = l; });
    }

    for (let i = 0; i < dayNums.length; i++) {
      const num = dayNums[i];
      const day = days[num];
      const isFirst = i === 0;
      const stopsHtml = this._renderStops(day.stops, country, isFirst);

      // Resumen de km totales del día
      const dayKm = day.stops.reduce((sum, s) => sum + (s.km_from_previous || 0), 0);
      const kmBadge = dayKm > 0 ? `<span class="guide-day-km">${Math.round(dayKm)} km</span>` : '';

      // Enlace Google Maps del día
      const dayLink = linksMap[num];
      const mapsLinkHtml = dayLink
        ? `<a class="guide-day-gmaps-link" href="${dayLink.url}" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" style="flex-shrink:0"><path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle fill="#fff" cx="12" cy="9" r="2.5"/></svg> Abrir en Google Maps</a>`
        : '';

      html += `
        <div class="guide-day${isFirst ? ' open' : ''}" data-day="${num}">
          <div class="guide-day-head">
            <span class="guide-day-num">DÍA ${num}</span>
            <span class="guide-day-title">${escapeHTML(day.title)}</span>
            ${kmBadge}
            <span class="guide-day-count">${day.stops.length} paradas</span>
            <span class="guide-day-arrow">▾</span>
          </div>
          <div class="guide-day-body">
            <div class="guide-day-map" id="guide-map-day-${num}" data-day="${num}"></div>
            ${mapsLinkHtml}
            ${stopsHtml}
          </div>
        </div>`;
    }
    return html;
  },

  // ═══ RENDER STOPS ═══
  _renderStops(stops, country, isFirstDay) {
    let html = '';
    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      const icon = this._icons[s.type] || '📍';
      const isFirstStop = isFirstDay && i === 0;
      const gmapsUrl = this._stopGmapsUrl(s, country);

      // Badge de ruta (km + carretera) — si hay km desde la parada anterior
      let routeBadgeHtml = '';
      if (s.km_from_previous && s.km_from_previous > 0) {
        const parts = [];
        parts.push(s.km_from_previous + ' km');
        if (s.road_name) parts.push(escapeHTML(s.road_name));
        if (s.estimated_hours && s.estimated_hours > 0) {
          const h = Math.floor(s.estimated_hours);
          const m = Math.round((s.estimated_hours - h) * 60);
          parts.push(h > 0 ? (m > 0 ? h + 'h ' + m + 'min' : h + 'h') : m + 'min');
        }
        if (s.road_difficulty) {
          const diffIcons = { bajo: '🟢', medio: '🟡', alto: '🔴' };
          parts.push((diffIcons[s.road_difficulty] || '') + ' ' + s.road_difficulty);
        }
        routeBadgeHtml = `<div class="guide-stop-route-badge">🛣️ ${parts.join(' · ')}</div>`;
      }

      // Tags opcionales (solo si tienen contenido)
      let tagsHtml = '';
      if (s.context) {
        tagsHtml += `<div class="guide-stop-tag tag-context">
          <span class="guide-stop-tag-label">📖 CONTEXTO</span>
          ${linkify(s.context)}
        </div>`;
      }
      if (s.food_nearby) {
        tagsHtml += `<div class="guide-stop-tag tag-food">
          <span class="guide-stop-tag-label">🍜 COME CERCA</span>
          ${linkify(s.food_nearby)}
        </div>`;
      }
      if (s.eat && (s.eat.dish || s.eat.name)) {
        const eatParts = [];
        if (s.eat.name) eatParts.push('<strong>' + escapeHTML(s.eat.name) + '</strong>');
        if (s.eat.dish) eatParts.push(linkify(s.eat.dish));
        if (s.eat.price_approx) eatParts.push(escapeHTML(s.eat.price_approx));
        tagsHtml += `<div class="guide-stop-tag tag-eat">
          <span class="guide-stop-tag-label">🍽️ COMER AQUÍ</span>
          ${eatParts.join(' · ')}
        </div>`;
      }
      if (s.local_secret) {
        tagsHtml += `<div class="guide-stop-tag tag-secret">
          <span class="guide-stop-tag-label">🔑 SECRETO LOCAL</span>
          ${linkify(s.local_secret)}
        </div>`;
      }
      if (s.sleep && (s.sleep.zone || s.sleep.name)) {
        const sleepParts = [];
        if (s.sleep.name) sleepParts.push('<strong>' + escapeHTML(s.sleep.name) + '</strong>');
        if (s.sleep.zone) sleepParts.push(escapeHTML(s.sleep.zone));
        if (s.sleep.type) sleepParts.push(escapeHTML(s.sleep.type));
        if (s.sleep.price_range) sleepParts.push(escapeHTML(s.sleep.price_range));
        tagsHtml += `<div class="guide-stop-tag tag-sleep">
          <span class="guide-stop-tag-label">🛏️ DORMIR</span>
          ${sleepParts.join(' · ')}
        </div>`;
      }
      if (s.alt_bad_weather) {
        tagsHtml += `<div class="guide-stop-tag tag-weather">
          <span class="guide-stop-tag-label">🌧️ SI LLUEVE</span>
          ${linkify(s.alt_bad_weather)}
        </div>`;
      }
      if (s.practical) {
        tagsHtml += `<div class="guide-stop-practical">${linkify(s.practical)}</div>`;
      }

      // Foto: lazy load — si hay photo_ref usa eso, si no busca por nombre+coords
      const photoHtml = s.photo_ref
        ? `<div class="guide-stop-photo" data-photo-ref="${s.photo_ref}"><div class="guide-stop-photo-placeholder">📷</div></div>`
        : `<div class="guide-stop-photo" data-photo-name="${escapeHTML(s.name || s.headline || '')}" data-lat="${s.lat||''}" data-lng="${s.lng||''}"><div class="guide-stop-photo-placeholder">📷</div></div>`;

      html += `
        <div class="guide-stop${isFirstStop ? ' open' : ''}" data-stop-lat="${s.lat ? s.lat.toFixed(5) : ''}" data-stop-lng="${s.lng ? s.lng.toFixed(5) : ''}">
          ${routeBadgeHtml}
          <div class="guide-stop-head">
            <span class="guide-stop-icon">${icon}</span>
            <span class="guide-stop-name">${escapeHTML(s.headline || s.name)}</span>
            <span class="guide-stop-arrow">▾</span>
          </div>
          <div class="guide-stop-body">
            ${photoHtml}
            ${s.narrative ? `<p class="guide-stop-narrative">${linkify(s.narrative)}</p>` : ''}
            ${tagsHtml}
            ${gmapsUrl ? `<a class="guide-stop-gmaps" href="${gmapsUrl}" target="_blank" rel="noopener">
              VER EN GOOGLE MAPS →
            </a>` : ''}
          </div>
        </div>`;
    }
    return html;
  },

  // ═══ RENDER PRE-DEPARTURE ═══
  _renderPreDeparture(pd) {
    if (!pd) return '';
    let html = '<div class="guide-section guide-pre-departure"><div class="guide-section-label">ANTES DE SALIR</div>';

    if (pd.transport && (pd.transport.type || pd.transport.provider)) {
      html += '<div class="guide-info-block"><strong>🚗 Transporte</strong><br>';
      const parts = [];
      if (pd.transport.type) parts.push(escapeHTML(pd.transport.type));
      if (pd.transport.provider) parts.push(escapeHTML(pd.transport.provider));
      if (pd.transport.price) parts.push(escapeHTML(pd.transport.price));
      html += parts.join(' · ');
      if (pd.transport.address) html += '<br>' + escapeHTML(pd.transport.address);
      if (pd.transport.details) html += '<br><em>' + escapeHTML(pd.transport.details) + '</em>';
      html += '</div>';
    }

    if (pd.first_night && (pd.first_night.name || pd.first_night.address)) {
      html += '<div class="guide-info-block"><strong>🛏️ Primera noche</strong><br>';
      const parts = [];
      if (pd.first_night.name) parts.push(escapeHTML(pd.first_night.name));
      if (pd.first_night.address) parts.push(escapeHTML(pd.first_night.address));
      if (pd.first_night.price) parts.push(escapeHTML(pd.first_night.price));
      html += parts.join(' · ');
      if (pd.first_night.why) html += '<br><em>' + escapeHTML(pd.first_night.why) + '</em>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  // ═══ RENDER PRACTICAL INFO ═══
  _renderPracticalInfo(pi) {
    if (!pi) return '';
    let html = '<div class="guide-section guide-practical-info"><div class="guide-section-label">INFO PRÁCTICA</div>';

    // Presupuesto
    if (pi.budget) {
      html += '<div class="guide-info-block"><strong>💰 Presupuesto estimado</strong>';
      if (pi.budget.daily_breakdown) {
        const bd = pi.budget.daily_breakdown;
        html += '<div class="guide-budget-grid">';
        for (const [key, val] of Object.entries(bd)) {
          if (val) {
            const labels = { transport: 'Transporte', sleep: 'Alojamiento', food: 'Comida', activities: 'Actividades', misc: 'Otros' };
            html += `<span class="guide-budget-item">${labels[key] || key}: <strong>${escapeHTML(val)}</strong></span>`;
          }
        }
        html += '</div>';
      }
      if (pi.budget.total_estimated) html += '<div class="guide-budget-total">Total: <strong>' + escapeHTML(pi.budget.total_estimated) + '</strong></div>';
      if (pi.budget.currency) html += '<br>Moneda: ' + escapeHTML(pi.budget.currency);
      if (pi.budget.exchange_tip) html += '<br><em>' + escapeHTML(pi.budget.exchange_tip) + '</em>';
      html += '</div>';
    }

    // Documentos
    if (pi.documents && pi.documents.length) {
      html += '<div class="guide-info-block"><strong>📄 Documentos</strong><br>';
      html += pi.documents.map(d => escapeHTML(d)).join('<br>');
      html += '</div>';
    }

    // Kit
    if (pi.kit && pi.kit.length) {
      html += '<div class="guide-info-block"><strong>🎒 Kit recomendado</strong><br>';
      html += pi.kit.map(k => escapeHTML(k)).join(' · ');
      html += '</div>';
    }

    // Apps
    if (pi.useful_apps && pi.useful_apps.length) {
      html += '<div class="guide-info-block"><strong>📱 Apps útiles</strong><br>';
      html += pi.useful_apps.map(a => escapeHTML(a)).join('<br>');
      html += '</div>';
    }

    // Frases
    if (pi.phrases && pi.phrases.list && pi.phrases.list.length) {
      html += '<div class="guide-info-block"><strong>🗣️ Frases en ' + escapeHTML(pi.phrases.language || 'idioma local') + '</strong>';
      html += '<div class="guide-phrases-grid">';
      for (const p of pi.phrases.list) {
        html += `<div class="guide-phrase"><span class="guide-phrase-original">${escapeHTML(p.phrase)}</span> <span class="guide-phrase-meaning">${escapeHTML(p.meaning)}</span></div>`;
      }
      html += '</div></div>';
    }

    // Emergencias
    if (pi.emergencies) {
      html += '<div class="guide-info-block"><strong>🚨 Emergencias</strong><br>';
      if (pi.emergencies.general_number) html += 'Tel: <strong>' + linkify(pi.emergencies.general_number) + '</strong><br>';
      if (pi.emergencies.police) html += 'Policía: <strong>' + linkify(pi.emergencies.police) + '</strong><br>';
      if (pi.emergencies.ambulance) html += 'Ambulancia: <strong>' + linkify(pi.emergencies.ambulance) + '</strong><br>';
      if (pi.emergencies.embassy) html += linkify(pi.emergencies.embassy);
      html += '</div>';
    }

    // Conectividad
    if (pi.connectivity) {
      html += '<div class="guide-info-block"><strong>📶 Conectividad</strong><br>';
      if (pi.connectivity.sim_local) html += escapeHTML(pi.connectivity.sim_local) + '<br>';
      if (pi.connectivity.wifi) html += '<em>' + escapeHTML(pi.connectivity.wifi) + '</em>';
      html += '</div>';
    }

    // Salud
    if (pi.health) {
      html += '<div class="guide-info-block"><strong>🏥 Salud</strong><br>';
      if (pi.health.hospitals) html += escapeHTML(pi.health.hospitals) + '<br>';
      if (pi.health.pharmacy) html += escapeHTML(pi.health.pharmacy) + '<br>';
      if (pi.health.water) html += '<em>' + escapeHTML(pi.health.water) + '</em>';
      html += '</div>';
    }

    html += '</div>';
    return html;
  },

  // ═══ RENDER TIPS ═══
  _renderTips(tips) {
    if (!tips || !tips.length) return '';
    let html = '<div class="guide-tips"><div class="guide-tips-label">CONSEJOS DE SALMA</div>';
    for (const tip of tips) {
      html += `<p>${escapeHTML(tip)}</p>`;
    }
    html += '</div>';
    return html;
  },

  // ═══ GOOGLE MAPS URLS ═══

  // BLOQUE E (frontend) — true si la URL de Maps NO lleva coords imposibles. Sin red.
  // Gemelo de mapsUrlCoordsSane() en app.js (guide-renderer se usa también en 404.html, sin app.js).
  _mapsUrlCoordsSane(url) {
    if (!url || typeof url !== 'string') return true;
    if (!/google\.[a-z.]+\/maps|maps\.google\./i.test(url)) return true;
    const pats = [
      /[?&](?:q|query|destination|center|ll|sll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
      /\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
      /\/dir\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/
    ];
    for (const p of pats) {
      const m = url.match(p);
      if (m) {
        const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
        if (!isFinite(lat) || !isFinite(lng)) return false;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
        if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
        return true;
      }
    }
    return true;
  },

  // Regla única: sin place_id validado por Google Places → no hay enlace.
  _stopGmapsUrl(stop, country) {
    if (stop && stop.place_id) {
      return 'https://www.google.com/maps/place/?q=place_id:' + stop.place_id;
    }
    return null;
  },

  _dayGmapsUrl(stops, country) {
    const valid = (stops || []).filter(s => s && s.place_id && s.lat && s.lng);
    if (valid.length === 0) return null;
    if (valid.length === 1) return this._stopGmapsUrl(valid[0], country);
    // /dir/ usa lat,lng (place_id: no funciona en path)
    const segments = valid.map(p => `${p.lat},${p.lng}`).join('/');
    return 'https://www.google.com/maps/dir/' + segments;
  },

  // roadGmapsUrl: enlace ya construido en el Worker con puntos reales de la carretera
  // pedida cada ~12km (route.road_gmaps_url, ver sampleRoadForGmaps) — el enlace público
  // de Google Maps no admite forzar una carretera, así que la única forma de que no se
  // desvíe es no dejarle margen: muchos puntos reales en vez de solo las paradas.
  _fullRouteGmapsUrl(stops, country, roadGmapsUrl) {
    if (roadGmapsUrl) return roadGmapsUrl;
    const valid = (stops || []).filter(s => s && s.place_id && s.lat && s.lng);
    if (valid.length === 0) return null;
    if (valid.length === 1) return this._stopGmapsUrl(valid[0], country);
    const sampled = this._sampleWaypoints(valid, 25);
    const segments = sampled.map(p => `${p.lat},${p.lng}`).join('/');
    return 'https://www.google.com/maps/dir/' + segments;
  },

  _sampleWaypoints(arr, max) {
    if (arr.length <= max) return arr;
    const step = arr.length / max;
    const result = [];
    for (let i = 0; i < max; i++) {
      result.push(arr[Math.floor(i * step)]);
    }
    return result;
  },

  // ═══ LAZY LOAD FOTOS ═══
  _lazyLoadPhoto(stopEl) {
    const photoDiv = stopEl.querySelector('.guide-stop-photo');
    if (!photoDiv || photoDiv.dataset.loaded) return;
    photoDiv.dataset.loaded = '1';

    const ref = photoDiv.dataset.photoRef;
    const name = photoDiv.dataset.photoName;
    const lat = photoDiv.dataset.lat;
    const lng = photoDiv.dataset.lng;

    let url;
    if (ref) {
      url = window.SALMA_API + '/photo?ref=' + encodeURIComponent(ref) + '&json=1';
    } else if (name) {
      url = window.SALMA_API + '/photo?name=' + encodeURIComponent(name) + (lat ? '&lat=' + lat : '') + (lng ? '&lng=' + lng : '') + '&json=1';
    } else {
      photoDiv.remove();
      return;
    }

    fetch(url).then(r => r.json()).then(data => {
      if (data.url) {
        photoDiv.innerHTML = `<img src="${data.url}" alt="" class="guide-stop-img" loading="lazy">`;
      } else {
        photoDiv.remove();
      }
    }).catch(() => photoDiv.remove());
  },

  _loadVisiblePhotos(card) {
    const openStops = card.querySelectorAll('.guide-stop.open');
    openStops.forEach(stop => this._lazyLoadPhoto(stop));
  },

  // ═══ MAPAS LEAFLET ═══

  _dayColors: ['#D4A843', '#E87040', '#5CB85C', '#5BC0DE', '#D9534F', '#AA66CC', '#FF8C00'],
  _maps: {},

  _getValidStops(stops) {
    return (stops || []).filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
  },

  _initMainMap(allStops, days) {
    const el = document.getElementById('guide-map-main');
    if (!el || this._maps['main']) return;

    const valid = this._getValidStops(allStops);
    if (valid.length === 0) { el.style.display = 'none'; return; }

    const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
    const map = L.map(el, {
      scrollWheelZoom: false, zoomControl: true, attributionControl: false,
      maxBounds: bounds.pad(0.3), maxBoundsViscosity: 0.8,
      dragging: !L.Browser.mobile, tap: !L.Browser.mobile
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18
    }).addTo(map);

    // Trazado real de la ruta — ANTES de los pines para que quede debajo.
    // Bug que reportó Paco: este mapa nunca pintaba línea, solo puntos sueltos —
    // por eso parecía "no haber cambiado nada" con la geometría real de carretera.
    this._loadDirections(map, valid, '#f0b429', this._roadGeometry);

    // Pins por día con colores distintos — numerados y clicables: al tocar uno,
    // se abre esa parada en el itinerario de abajo y se hace scroll hasta ella
    // (igual que en la demo aprobada).
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
    let stopNum = 0;
    dayNums.forEach((num, idx) => {
      const color = this._dayColors[idx % this._dayColors.length];
      const dayStops = this._getValidStops(days[num].stops);
      dayStops.forEach(s => {
        stopNum++;
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
        }).addTo(map);
        const label = L.divIcon({
          className: 'guide-map-pin-num', html: String(stopNum),
          iconSize: [16, 16], iconAnchor: [8, 8]
        });
        L.marker([s.lat, s.lng], { icon: label, interactive: false }).addTo(map);
        this._bindRichPopup(marker, s, num);
        marker.on('click', () => this._scrollToStop(s));
      });
    });

    // Ajustar vista a todos los puntos — limitado a la ruta
    map.fitBounds(bounds, { padding: [30, 30] });
    this._maps['main'] = map;

    // Brújula (centro-izquierda)
    this._renderGuideCompass(el);
  },

  // Abre el día y la parada correspondientes en el itinerario y hace scroll hasta ella —
  // usado al tocar un pin numerado en el mapa principal.
  _scrollToStop(stop) {
    if (!stop.lat || !stop.lng) return;
    const lat = stop.lat.toFixed(5), lng = stop.lng.toFixed(5);
    const el = document.querySelector(`.guide-stop[data-stop-lat="${lat}"][data-stop-lng="${lng}"]`);
    if (!el) return;
    const dayEl = el.closest('.guide-day');
    if (dayEl && !dayEl.classList.contains('open')) {
      dayEl.classList.add('open');
      const dayNum = dayEl.dataset.day;
      const dayStops = this._groupByDay(this._stops || [])[dayNum];
      if (dayNum) this._initDayMap(Number(dayNum), (dayStops && dayStops.stops) || []);
    }
    if (!el.classList.contains('open')) {
      el.classList.add('open');
      this._lazyLoadPhoto(el);
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'box-shadow .3s ease';
    el.style.boxShadow = '0 0 0 2px var(--dorado)';
    setTimeout(() => { el.style.boxShadow = ''; }, 1600);
  },

  _guideCompassHandler: null,
  _guideCompassActive: false,

  _renderGuideCompass(mapEl) {
    if (!mapEl) return;
    mapEl.querySelector('.map-compass')?.remove();
    this._stopGuideCompass();

    if (localStorage.getItem('compass_hidden') === '1') return;

    const compass = document.createElement('div');
    compass.className = 'map-compass';
    compass.innerHTML = `
      <button class="map-compass-close" aria-label="Cerrar brújula">&times;</button>
      <div class="map-compass-ring">
        <div class="map-compass-n">N</div>
        <div class="map-compass-e">E</div>
        <div class="map-compass-s">S</div>
        <div class="map-compass-w">O</div>
        <div class="map-compass-needle">
          <div class="map-compass-needle-n"></div>
          <div class="map-compass-needle-s"></div>
        </div>
      </div>`;
    mapEl.style.position = 'relative';
    mapEl.appendChild(compass);

    const ring = compass.querySelector('.map-compass-ring');

    compass.querySelector('.map-compass-close').addEventListener('click', (e) => {
      e.stopPropagation();
      compass.remove();
      this._stopGuideCompass();
      localStorage.setItem('compass_hidden', '1');
    });

    // Magnetómetro del móvil
    const onOrientation = (e) => {
      let heading = null;
      if (typeof e.webkitCompassHeading === 'number') {
        heading = e.webkitCompassHeading;
      } else if (typeof e.alpha === 'number') {
        heading = 360 - e.alpha;
      }
      if (heading === null) return;
      this._guideCompassActive = true;
      ring.style.transform = `rotate(${-heading}deg)`;
    };

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const askPermission = () => {
        DeviceOrientationEvent.requestPermission()
          .then(state => {
            if (state === 'granted') {
              this._guideCompassHandler = onOrientation;
              window.addEventListener('deviceorientation', onOrientation, true);
            }
          }).catch(() => {});
        compass.removeEventListener('click', askPermission);
      };
      compass.addEventListener('click', askPermission);
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      this._guideCompassHandler = onOrientation;
      window.addEventListener('deviceorientation', onOrientation, true);
    }
  },

  _stopGuideCompass() {
    if (this._guideCompassHandler) {
      window.removeEventListener('deviceorientation', this._guideCompassHandler, true);
      this._guideCompassHandler = null;
    }
    this._guideCompassActive = false;
  },

  _initDayMap(dayNum, stops) {
    const mapId = 'guide-map-day-' + dayNum;
    const el = document.getElementById(mapId);
    if (!el || this._maps[mapId]) return;

    const valid = this._getValidStops(stops);
    if (valid.length === 0) { el.style.display = 'none'; return; }

    const color = this._dayColors[(dayNum - 1) % this._dayColors.length];
    const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
    const map = L.map(el, {
      scrollWheelZoom: false, zoomControl: false, attributionControl: false,
      maxBounds: bounds.pad(0.3), maxBoundsViscosity: 0.8,
      dragging: !L.Browser.mobile, tap: !L.Browser.mobile
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18
    }).addTo(map);

    // Pins
    valid.forEach((s, i) => {
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 6, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
      }).addTo(map);
      this._bindRichPopup(marker, s, dayNum);
    });

    // Ajustar vista — limitado a la ruta
    map.fitBounds(bounds, { padding: [20, 20] });
    this._maps[mapId] = map;

    // Trazado: geometría real de OSM si se pidió seguir una carretera concreta,
    // si no, ruta normal a Google Directions.
    if (valid.length >= 2) {
      this._loadDirections(map, valid, color, this._clipRoadGeometryToStops(this._roadGeometry, valid));
    }
  },

  // Recorta la geometría real de la carretera (route.road_geometry, todo el trayecto)
  // al tramo que corresponde a las paradas de un día concreto — cada mini-mapa de día
  // solo debe pintar su trozo, no la carretera entera.
  _clipRoadGeometryToStops(roadGeometry, stops) {
    if (!Array.isArray(roadGeometry) || roadGeometry.length < 2 || !stops?.length) return null;
    const nearestIdx = (lat, lng) => {
      let best = 0, bestD = Infinity;
      for (let i = 0; i < roadGeometry.length; i++) {
        const dLat = roadGeometry[i].lat - lat, dLon = roadGeometry[i].lon - lng;
        const d = dLat * dLat + dLon * dLon;
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    };
    let i0 = nearestIdx(stops[0].lat, stops[0].lng);
    let i1 = nearestIdx(stops[stops.length - 1].lat, stops[stops.length - 1].lng);
    if (i0 > i1) { const t = i0; i0 = i1; i1 = t; }
    const slice = roadGeometry.slice(i0, i1 + 1);
    return slice.length >= 2 ? slice : null;
  },

  _bindRichPopup(marker, stop, dayNum) {
    const name = escapeHTML(stop.headline || stop.name);
    const narrative = stop.narrative ? escapeHTML(stop.narrative).substring(0, 120) + (stop.narrative.length > 120 ? '...' : '') : '';
    const gmapsUrl = this._stopGmapsUrl(stop, '');
    const photoId = 'popup-photo-' + Math.random().toString(36).slice(2, 8);

    let html = `<div class="map-popup">`;
    if (stop.photo_ref) {
      html += `<div class="map-popup-photo" id="${photoId}"></div>`;
    }
    html += `<div class="map-popup-name">${name}</div>`;
    html += `<div class="map-popup-day">Día ${dayNum}</div>`;
    if (narrative) html += `<div class="map-popup-desc">${narrative}</div>`;
    if (gmapsUrl) html += `<a class="map-popup-link" href="${gmapsUrl}" target="_blank" rel="noopener">Ver en Maps →</a>`;
    html += `</div>`;

    // No usar bindPopup de Leaflet — creamos overlay propio centrado en el mapa
    marker.on('click', () => {
      // Cerrar cualquier popup anterior
      document.querySelectorAll('.map-overlay-popup').forEach(el => el.remove());

      const mapEl = marker._map ? marker._map.getContainer() : marker._eventParents ? Object.values(marker._eventParents)[0]?.getContainer() : null;
      if (!mapEl) return;

      // Crear overlay centrado en el mapa
      const overlay = document.createElement('div');
      overlay.className = 'map-overlay-popup';
      overlay.innerHTML = `
        <div class="map-overlay-close">&times;</div>
        ${stop.photo_ref ? `<div class="map-popup-photo" id="${photoId}"></div>` : ''}
        <div class="map-popup-name">${name}</div>
        <div class="map-popup-day">Día ${dayNum}</div>
        ${narrative ? `<div class="map-popup-desc">${narrative}</div>` : ''}
        ${gmapsUrl ? `<a class="map-popup-link" href="${gmapsUrl}" target="_blank" rel="noopener">Ver en Maps →</a>` : ''}
      `;
      mapEl.style.position = 'relative';
      mapEl.appendChild(overlay);

      // Cerrar con X
      overlay.querySelector('.map-overlay-close').addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.remove();
      });

      // Cerrar al tocar fuera del overlay
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });

      // Lazy-load foto
      if (stop.photo_ref) {
        const el = document.getElementById(photoId);
        if (el && !el.dataset.loaded) {
          el.dataset.loaded = '1';
          fetch(window.SALMA_API + '/photo?ref=' + encodeURIComponent(stop.photo_ref) + '&json=1')
            .then(r => r.json()).then(data => {
              if (data.url) {
                el.innerHTML = `<img src="${data.url}" alt="" style="width:100%;height:70px;object-fit:cover;border-radius:6px;">`;
              } else { el.remove(); }
            }).catch(() => el.remove());
        }
      }
    });
  },

  // roadGeometry: array real de {lat,lon} de OpenStreetMap (route.road_geometry,
  // ver resolveNamedRoad en el Worker) cuando el usuario pidió seguir una carretera
  // concreta. Si existe, se pinta tal cual — nada de pedirle a Directions "la más
  // rápida" y confiar en que no se vaya por una autopista paralela.
  _loadDirections(map, stops, color, roadGeometry) {
    if (Array.isArray(roadGeometry) && roadGeometry.length >= 2) {
      const coords = roadGeometry.map(p => [p.lat, p.lon]);
      L.polyline(coords, { color: color, weight: 3, opacity: 0.7 }).addTo(map);
      if (this._roadCheck) this._renderRoadWarning(map.getContainer(), this._roadCheck);
      return;
    }

    const origin = stops[0].lat + ',' + stops[0].lng;
    const dest = stops[stops.length - 1].lat + ',' + stops[stops.length - 1].lng;
    const waypoints = stops.slice(1, -1).map(s => s.lat + ',' + s.lng).join('|');

    const url = window.SALMA_API + '/directions?origin=' + origin + '&destination=' + dest
      + (waypoints ? '&waypoints=' + waypoints : '');

    fetch(url).then(r => r.json()).then(data => {
      if (data.polyline) {
        const coords = this._decodePolyline(data.polyline);
        L.polyline(coords, { color: color, weight: 3, opacity: 0.7 }).addTo(map);
      }
    }).catch(() => {
      // Fallback: línea recta entre paradas
      const coords = stops.map(s => [s.lat, s.lng]);
      L.polyline(coords, { color: color, weight: 2, opacity: 0.5, dashArray: '6,8' }).addTo(map);
    });
  },

  // Aviso discreto en el propio mapa cuando alguna parada cae lejos de la carretera
  // pedida (route.road_check, calculado en el Worker contra la geometría real de OSM).
  _renderRoadWarning(mapEl, roadCheck) {
    if (!mapEl) return;
    mapEl.querySelectorAll('.map-road-warning').forEach(el => el.remove());
    if (!roadCheck || !roadCheck.flagged || !roadCheck.off_stops?.length) return;

    const worst = roadCheck.off_stops[0];
    const detail = roadCheck.off_stops.length > 1
      ? `${worst.name} y ${roadCheck.off_stops.length - 1} parada(s) más, a ${worst.km}+ km`
      : `${worst.name}, a ${worst.km} km`;

    const badge = document.createElement('div');
    badge.className = 'map-road-warning';
    badge.textContent = `⚠️ Alguna parada no está justo en la ${roadCheck.target}: ${detail}`;
    badge.style.cssText = 'position:absolute;left:8px;right:8px;bottom:8px;z-index:500;'
      + 'background:rgba(20,20,20,0.88);color:#f5d78e;font-size:11px;line-height:1.35;'
      + 'padding:6px 10px;border-radius:8px;border:1px solid rgba(245,215,142,0.35);pointer-events:none;';

    mapEl.style.position = 'relative';
    mapEl.appendChild(badge);
  },

  // ═══ PRINT / PDF ═══
  _printGuide(card) {
    // Abrir todos los días y paradas
    card.querySelectorAll('.guide-day').forEach(d => d.classList.add('open'));
    card.querySelectorAll('.guide-stop').forEach(s => {
      s.classList.add('open');
      this._lazyLoadPhoto(s);
    });

    // Invalidar mapas para que se rendericen bien
    for (const key of Object.keys(this._maps)) {
      try { this._maps[key].invalidateSize(); } catch (_) {}
    }

    // Esperar un poco a que carguen fotos y mapas
    setTimeout(() => window.print(), 600);
  },

  // ═══ UPDATE VERIFICADO (parcheo post-draft) ═══
  // Actualiza fotos, coords y mapas sin re-renderizar la tarjeta completa
  updateVerified(routeData) {
    if (!routeData?.stops) return;
    const card = document.querySelector('.guide-card');
    if (!card) return;

    const stops = routeData.stops;
    const stopEls = card.querySelectorAll('.guide-stop');

    // Parchear cada parada: foto + coords
    stopEls.forEach((el, i) => {
      const stop = stops[i];
      if (!stop) return;

      // Inyectar foto si el verify la trajo y no existía
      const photoDiv = el.querySelector('.guide-stop-photo');
      if (stop.photo_ref) {
        if (!photoDiv) {
          // No había foto en el draft — crear placeholder
          const body = el.querySelector('.guide-stop-body');
          if (body) {
            const newPhoto = document.createElement('div');
            newPhoto.className = 'guide-stop-photo';
            newPhoto.dataset.photoRef = stop.photo_ref;
            newPhoto.innerHTML = '<div class="guide-stop-photo-placeholder">📷</div>';
            body.insertBefore(newPhoto, body.firstChild);
            // Si la parada está abierta, cargar foto inmediatamente
            if (el.classList.contains('open')) this._lazyLoadPhoto(el);
          }
        } else if (!photoDiv.dataset.loaded) {
          // Había placeholder pero sin ref válida — actualizar ref
          photoDiv.dataset.photoRef = stop.photo_ref;
          if (el.classList.contains('open')) this._lazyLoadPhoto(el);
        }
      }
    });

    // Re-centrar mapas con coords verificadas
    this._updateMaps(routeData);
  },

  // Actualizar mapas existentes con coords verificadas
  _updateMaps(routeData) {
    const stops = routeData.stops || [];
    const days = this._groupByDay(stops);
    if (routeData.preferred_road) this._preferredRoad = routeData.preferred_road;
    if (Array.isArray(routeData.road_geometry)) this._roadGeometry = routeData.road_geometry;
    if (routeData.road_check) this._roadCheck = routeData.road_check;

    // Mapa principal
    const mainMap = this._maps['main'];
    if (mainMap) {
      const valid = this._getValidStops(stops);
      if (valid.length > 0) {
        // Limpiar markers, línea de ruta y números — y re-crear
        mainMap.eachLayer(l => {
          if (l instanceof L.CircleMarker || l instanceof L.Polyline || l instanceof L.Marker) mainMap.removeLayer(l);
        });
        this._loadDirections(mainMap, valid, '#f0b429', this._roadGeometry);
        const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
        let stopNum = 0;
        dayNums.forEach((num, idx) => {
          const color = this._dayColors[idx % this._dayColors.length];
          this._getValidStops(days[num].stops).forEach(s => {
            stopNum++;
            const marker = L.circleMarker([s.lat, s.lng], {
              radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
            }).addTo(mainMap);
            const label = L.divIcon({
              className: 'guide-map-pin-num', html: String(stopNum),
              iconSize: [16, 16], iconAnchor: [8, 8]
            });
            L.marker([s.lat, s.lng], { icon: label, interactive: false }).addTo(mainMap);
            this._bindRichPopup(marker, s, num);
            marker.on('click', () => this._scrollToStop(s));
          });
        });
        const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
        mainMap.fitBounds(bounds, { padding: [30, 30] });
      }
    }

    // Mini-mapas por día — solo los ya inicializados
    for (const key of Object.keys(this._maps)) {
      if (!key.startsWith('guide-map-day-')) continue;
      const dayNum = Number(key.replace('guide-map-day-', ''));
      if (!days[dayNum]) continue;

      const map = this._maps[key];
      const dayStops = this._getValidStops(days[dayNum].stops);
      if (dayStops.length === 0) continue;

      // Limpiar markers y polylines
      map.eachLayer(l => { if (l instanceof L.CircleMarker || l instanceof L.Polyline) map.removeLayer(l); });

      const color = this._dayColors[(dayNum - 1) % this._dayColors.length];
      dayStops.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 6, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
        }).addTo(map);
        this._bindRichPopup(marker, s, dayNum);
      });
      const bounds = L.latLngBounds(dayStops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });

      // Re-pedir ruta
      if (dayStops.length >= 2) this._loadDirections(map, dayStops, color, this._clipRoadGeometryToStops(this._roadGeometry, dayStops));
    }
  },

  // Decode Google polyline encoding
  _decodePolyline(encoded) {
    const coords = [];
    let i = 0, lat = 0, lng = 0;
    while (i < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      coords.push([lat / 1e5, lng / 1e5]);
    }
    return coords;
  }
};

// Exponer globalmente
window.guideRenderer = guideRenderer;
