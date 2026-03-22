/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — guide-renderer.js
   Renderizado ÚNICO de la tarjeta de guía
   ═══════════════════════════════════════════ */

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

    // Eliminar guide-card anterior si existe
    const prev = area.querySelector('.guide-card');
    if (prev) prev.remove();

    const r = routeData;
    const stops = r.stops || [];
    const country = r.country || r.region || '';

    // Agrupar stops por día
    const days = this._groupByDay(stops);
    const totalStops = stops.length;
    const totalDays = Object.keys(days).length;

    // Construir HTML
    const card = document.createElement('div');
    card.className = 'guide-card';

    // Header
    card.innerHTML = `
      <div class="guide-header">
        <div class="guide-title">${escapeHTML(r.title || r.name || 'Tu ruta')}</div>
        <div class="guide-meta">${totalDays} DÍAS · ${escapeHTML(country.toUpperCase())} · ${totalStops} PARADAS</div>
        ${r.summary ? `<p class="guide-summary">${escapeHTML(r.summary)}</p>` : ''}
      </div>

      <a class="guide-map-placeholder" href="${this._fullRouteGmapsUrl(stops, country)}" target="_blank" rel="noopener">
        <span class="guide-map-label">VER RUTA EN GOOGLE MAPS →</span>
      </a>

      <div class="guide-days">
        <div class="guide-days-label">ITINERARIO</div>
        ${this._renderDays(days, country)}
      </div>

      ${this._renderTips(r.tips)}

      <div class="guide-actions">
        ${options.saved ? '' : '<button class="btn-primary" id="guide-save-btn">GUARDAR MI GUÍA</button>'}
        <button class="btn-ghost" id="guide-share-btn">COMPARTIR</button>
      </div>
    `;

    area.appendChild(card);

    // Cargar fotos de paradas visibles (primera parada abierta)
    this._loadVisiblePhotos(card);

    // Event delegation — toggles de día y parada
    card.addEventListener('click', (e) => {
      const dayHead = e.target.closest('.guide-day-head');
      if (dayHead) {
        dayHead.parentElement.classList.toggle('open');
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

    // Botón compartir
    const shareBtn = document.getElementById('guide-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: r.title || 'Mi ruta de viaje',
            text: `Mira mi ruta: ${r.title || ''}`,
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copiado');
          }).catch(() => {});
        }
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
  _renderDays(days, country) {
    let html = '';
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);

    for (let i = 0; i < dayNums.length; i++) {
      const num = dayNums[i];
      const day = days[num];
      const isFirst = i === 0;
      const stopsHtml = this._renderStops(day.stops, country, isFirst);
      const gmapsUrl = this._dayGmapsUrl(day.stops, country);

      html += `
        <div class="guide-day${isFirst ? ' open' : ''}">
          <div class="guide-day-head">
            <span class="guide-day-num">DÍA ${num}</span>
            <span class="guide-day-title">${escapeHTML(day.title)}</span>
            <span class="guide-day-count">${day.stops.length} paradas</span>
            <span class="guide-day-arrow">▾</span>
          </div>
          <div class="guide-day-body">
            <a class="guide-day-gmaps" href="${gmapsUrl}" target="_blank" rel="noopener">
              🗺 Navegar Día ${num} en Google Maps →
            </a>
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

      // Tags opcionales (solo si tienen contenido)
      let tagsHtml = '';
      if (s.context) {
        tagsHtml += `<div class="guide-stop-tag tag-context">
          <span class="guide-stop-tag-label">📖 CONTEXTO</span>
          ${escapeHTML(s.context)}
        </div>`;
      }
      if (s.food_nearby) {
        tagsHtml += `<div class="guide-stop-tag tag-food">
          <span class="guide-stop-tag-label">🍜 COME CERCA</span>
          ${escapeHTML(s.food_nearby)}
        </div>`;
      }
      if (s.local_secret) {
        tagsHtml += `<div class="guide-stop-tag tag-secret">
          <span class="guide-stop-tag-label">🔑 SECRETO LOCAL</span>
          ${escapeHTML(s.local_secret)}
        </div>`;
      }
      if (s.practical) {
        tagsHtml += `<div class="guide-stop-practical">📋 ${escapeHTML(s.practical)}</div>`;
      }

      // Foto: lazy load desde /photo si hay photo_ref
      const photoHtml = s.photo_ref
        ? `<div class="guide-stop-photo" data-photo-ref="${s.photo_ref}"><div class="guide-stop-photo-placeholder">📷</div></div>`
        : '';

      html += `
        <div class="guide-stop${isFirstStop ? ' open' : ''}">
          <div class="guide-stop-head">
            <span class="guide-stop-icon">${icon}</span>
            <span class="guide-stop-name">${escapeHTML(s.headline || s.name)}</span>
            <span class="guide-stop-arrow">▾</span>
          </div>
          <div class="guide-stop-body">
            ${photoHtml}
            ${s.narrative ? `<p class="guide-stop-narrative">${escapeHTML(s.narrative)}</p>` : ''}
            ${tagsHtml}
            <a class="guide-stop-gmaps" href="${gmapsUrl}" target="_blank" rel="noopener">
              VER EN GOOGLE MAPS →
            </a>
          </div>
        </div>`;
    }
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

  _stopGmapsUrl(stop, country) {
    if (stop.lat && stop.lng && Math.abs(stop.lat) > 0.01 && Math.abs(stop.lng) > 0.01) {
      return 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng
        + '&query=' + encodeURIComponent(stop.headline || stop.name);
    }
    return 'https://www.google.com/maps/search/?api=1&query='
      + encodeURIComponent((stop.headline || stop.name) + ' ' + country);
  },

  _dayGmapsUrl(stops, country) {
    const valid = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (valid.length < 2) return this._stopGmapsUrl(valid[0] || stops[0], country);

    const origin = valid[0].lat + ',' + valid[0].lng;
    const dest = valid[valid.length - 1].lat + ',' + valid[valid.length - 1].lng;
    const waypoints = valid.slice(1, -1).map(p => p.lat + ',' + p.lng).join('|');

    return 'https://www.google.com/maps/dir/?api=1&origin=' + origin
      + '&destination=' + dest
      + (waypoints ? '&waypoints=' + waypoints : '')
      + '&travelmode=driving';
  },

  _fullRouteGmapsUrl(stops, country) {
    const valid = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (valid.length < 2) {
      if (valid.length === 1) return this._stopGmapsUrl(valid[0], country);
      return 'https://www.google.com/maps';
    }

    const origin = valid[0].lat + ',' + valid[0].lng;
    const dest = valid[valid.length - 1].lat + ',' + valid[valid.length - 1].lng;
    // Google Maps limita a ~25 waypoints
    const sampled = this._sampleWaypoints(valid.slice(1, -1), 23);
    const waypoints = sampled.map(p => p.lat + ',' + p.lng).join('|');

    return 'https://www.google.com/maps/dir/?api=1&origin=' + origin
      + '&destination=' + dest
      + (waypoints ? '&waypoints=' + waypoints : '')
      + '&travelmode=driving';
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
    const ref = photoDiv.dataset.photoRef;
    if (!ref) return;

    photoDiv.dataset.loaded = '1';
    const url = window.SALMA_API + '/photo?ref=' + encodeURIComponent(ref) + '&json=1';

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
  }
};

// Exponer globalmente
window.guideRenderer = guideRenderer;
