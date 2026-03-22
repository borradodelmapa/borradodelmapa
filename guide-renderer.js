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

      <div class="guide-map-container" id="guide-map-main"></div>
      <a class="guide-gmaps-link" href="${this._fullRouteGmapsUrl(stops, country)}" target="_blank" rel="noopener">
        ABRIR EN GOOGLE MAPS →
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
            <div class="guide-day-map" id="guide-map-day-${num}" data-day="${num}"></div>
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
    // Usar nombres para que Google muestre nombres reales, no coordenadas
    const segments = valid.map(p => encodeURIComponent(p.headline || p.name)).join('/');
    return 'https://www.google.com/maps/dir/' + segments;
  },

  _fullRouteGmapsUrl(stops, country) {
    const valid = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (valid.length < 2) {
      if (valid.length === 1) return this._stopGmapsUrl(valid[0], country);
      return 'https://www.google.com/maps';
    }
    const sampled = this._sampleWaypoints(valid, 25);
    const segments = sampled.map(p => encodeURIComponent(p.headline || p.name)).join('/');
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

    const map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18
    }).addTo(map);

    // Pins por día con colores distintos
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
    dayNums.forEach((num, idx) => {
      const color = this._dayColors[idx % this._dayColors.length];
      const dayStops = this._getValidStops(days[num].stops);
      dayStops.forEach(s => {
        const marker = L.circleMarker([s.lat, s.lng], {
          radius: 7, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
        }).addTo(map);
        this._bindRichPopup(marker, s, num);
      });
    });

    // Ajustar vista a todos los puntos
    const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
    this._maps['main'] = map;
  },

  _initDayMap(dayNum, stops) {
    const mapId = 'guide-map-day-' + dayNum;
    const el = document.getElementById(mapId);
    if (!el || this._maps[mapId]) return;

    const valid = this._getValidStops(stops);
    if (valid.length === 0) { el.style.display = 'none'; return; }

    const color = this._dayColors[(dayNum - 1) % this._dayColors.length];
    const map = L.map(el, { scrollWheelZoom: false, zoomControl: false, attributionControl: false });
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

    // Ajustar vista
    const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [20, 20] });
    this._maps[mapId] = map;

    // Pedir ruta real a Google Directions
    if (valid.length >= 2) {
      this._loadDirections(map, valid, color);
    }
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
    html += `<a class="map-popup-link" href="${gmapsUrl}" target="_blank" rel="noopener">Ver en Maps →</a>`;
    html += `</div>`;

    marker.bindPopup(html, { maxWidth: 220, className: 'dark-popup' });

    // Cargar foto cuando se abre el popup
    if (stop.photo_ref) {
      marker.on('popupopen', () => {
        const el = document.getElementById(photoId);
        if (!el || el.dataset.loaded) return;
        el.dataset.loaded = '1';
        fetch(window.SALMA_API + '/photo?ref=' + encodeURIComponent(stop.photo_ref) + '&json=1')
          .then(r => r.json()).then(data => {
            if (data.url) {
              el.innerHTML = `<img src="${data.url}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:6px;">`;
            } else { el.remove(); }
          }).catch(() => el.remove());
      });
    }
  },

  _loadDirections(map, stops, color) {
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
