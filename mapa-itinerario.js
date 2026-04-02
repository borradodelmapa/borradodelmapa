/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — mapa-itinerario.js
   Cards de parada + enriquecimiento Places
   ══════════════════════════════════════════ */

const mapaItinerario = {
  _stops: [],
  _cards: [],
  _activeIdx: -1,
  _container: null,

  // Iconos por tipo
  _icons: {
    lugar: '🏛️', hotel: '🏨', restaurante: '🍜', experiencia: '🎒',
    mirador: '📸', ruta: '🛤️', playa: '🏖️', templo: '🛕',
    museo: '🏛️', mercado: '🛒', bar: '🍺', café: '☕',
  },

  // ═══ INIT ═══
  init(containerId, stops, routeData, options = {}) {
    this._container = document.getElementById(containerId);
    if (!this._container || !stops || !stops.length) return;

    this._stops = stops;
    this._cards = [];
    this._activeIdx = -1;
    this._container.innerHTML = '';

    const country = routeData.country || routeData.region || '';
    const mapsUrl = this._fullRouteGmapsUrl(stops, country);

    // Header de la ruta (título + volver — desktop)
    const header = document.createElement('div');
    header.className = 'itin-header';
    header.innerHTML = `
      <button class="itin-back" id="itin-back-btn">&larr;</button>
      <div class="itin-header-info">
        <div class="itin-title">${this._esc(routeData.title || routeData.name || 'Tu ruta')}</div>
        <div class="itin-meta">${this._totalDays(stops)} días · ${stops.length} paradas · ${this._esc(country.toUpperCase())}</div>
      </div>
    `;
    this._container.appendChild(header);

    // Barra de acciones flotante — visible siempre (móvil y desktop)
    const itinView = document.getElementById('itin-view');
    if (itinView) {
      const existingBar = itinView.querySelector('.itin-action-bar');
      if (existingBar) existingBar.remove();
      const actionBar = document.createElement('div');
      actionBar.className = 'itin-action-bar';
      actionBar.innerHTML = `
        <a class="itin-btn itin-btn-maps" href="${mapsUrl}" target="_blank" rel="noopener" title="Abrir en Google Maps">🗺️</a>
        ${options.saved ? '' : '<button class="itin-btn itin-btn-save" id="itin-save-btn">GUARDAR</button>'}
        <button class="itin-btn itin-btn-share" id="itin-share-btn" title="Compartir">⤴</button>
      `;
      itinView.appendChild(actionBar);
    }

    // Contenedor scroll de cards
    const scroll = document.createElement('div');
    scroll.className = 'itin-cards-scroll';
    scroll.id = 'itin-cards-scroll';

    let currentDay = -1;
    stops.forEach((stop, i) => {
      const day = stop.day || 1;

      // Separador de día
      if (day !== currentDay) {
        currentDay = day;
        const daySep = document.createElement('div');
        daySep.className = 'itin-day-sep';
        daySep.innerHTML = `<span class="itin-day-num">DÍA ${day}</span><span class="itin-day-title">${this._esc(stop.day_title || '')}</span>`;
        scroll.appendChild(daySep);
      }

      // Card
      const card = this._createCard(stop, i);
      scroll.appendChild(card);
      this._cards.push(card);
    });

    this._container.appendChild(scroll);

    // Extras: antes de salir, info práctica, tips (reutiliza guide-renderer)
    if (typeof guideRenderer !== 'undefined') {
      const extrasHtml = [
        guideRenderer._renderPreDeparture(routeData.pre_departure || null),
        guideRenderer._renderPracticalInfo(routeData.practical_info || null),
        guideRenderer._renderTips(routeData.tips || null),
      ].join('');
      if (extrasHtml.trim()) {
        const extras = document.createElement('div');
        extras.className = 'itin-extras';
        extras.innerHTML = extrasHtml;
        this._container.appendChild(extras);
      }
    }

    // Botón volver
    document.getElementById('itin-back-btn')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('itin:close'));
    });

    // Botón guardar
    document.getElementById('itin-save-btn')?.addEventListener('click', () => {
      if (typeof salma !== 'undefined') salma.guardar();
    });

    // Botón compartir
    document.getElementById('itin-share-btn')?.addEventListener('click', () => {
      this._handleShare(routeData);
    });

    // Escuchar clicks en marcadores del mapa
    document.addEventListener('itin:marker-click', (e) => {
      this.highlightCard(e.detail.index);
    });

    // Enriquecer con Places API en paralelo
    this._enrichAll(stops);
  },

  // ═══ COMPARTIR ═══
  _handleShare(routeData) {
    const id = typeof salma !== 'undefined' ? salma.currentRouteId : null;
    if (!id) {
      if (typeof showToast !== 'undefined') showToast('Guarda la ruta primero para poder compartirla');
      if (typeof salma !== 'undefined') salma.guardar();
      return;
    }
    const url = window.location.origin + '/' + id;
    if (navigator.share) {
      navigator.share({ title: routeData.title || routeData.name || 'Mi ruta', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        if (typeof showToast !== 'undefined') showToast('Link copiado');
      }).catch(() => {
        if (typeof showToast !== 'undefined') showToast('Link: ' + url);
      });
    }
  },

  // ═══ CREAR CARD ═══
  _createCard(stop, index) {
    const card = document.createElement('div');
    card.className = 'itin-card';
    card.dataset.index = index;

    const icon = this._icons[stop.type] || '📍';
    const nota = stop.narrative || stop.nota || '';
    const horas = stop.estimated_hours || stop.duracion_horas || null;
    const km = stop.km_from_previous || 0;

    card.innerHTML = `
      <div class="itin-card-photo" id="itin-photo-${index}">
        <div class="itin-card-photo-placeholder">${icon}</div>
      </div>
      <div class="itin-card-body">
        <div class="itin-card-num">${index + 1}</div>
        <div class="itin-card-name">${this._esc(stop.headline || stop.name)}</div>
        <div class="itin-card-details" id="itin-details-${index}">
          ${km > 0 ? `<span class="itin-card-km">${Math.round(km)} km</span>` : ''}
          ${horas ? `<span class="itin-card-hours">${this._formatHours(horas)}</span>` : ''}
        </div>
        ${nota ? `<div class="itin-card-nota">${this._esc(nota)}</div>` : ''}
        <div class="itin-card-places" id="itin-places-${index}"></div>
      </div>
    `;

    card.addEventListener('click', () => {
      this.highlightCard(index);
      mapaRuta.centerOn(index);
    });

    // Cargar foto inicial — pasamos el card directamente porque aún no está en el DOM
    this._loadInitialPhoto(stop, index, card);

    return card;
  },

  // ═══ FOTO INICIAL ═══
  _loadInitialPhoto(stop, index, cardEl) {
    // Buscar dentro del card (antes de estar en el DOM) o en el documento si ya está
    const photoDiv = (cardEl && cardEl.querySelector('.itin-card-photo')) || document.getElementById(`itin-photo-${index}`);
    if (!photoDiv) return;

    if (stop.photo_ref) {
      fetch(`${window.SALMA_API}/photo?ref=${encodeURIComponent(stop.photo_ref)}&json=1`)
        .then(r => r.json())
        .then(data => {
          if (data.url) {
            photoDiv.innerHTML = `<img src="${data.url}" alt="" class="itin-card-img" loading="lazy">`;
          }
        })
        .catch(() => {});
    } else if (stop.name && stop.lat && stop.lng) {
      fetch(`${window.SALMA_API}/photo?name=${encodeURIComponent(stop.name)}&lat=${stop.lat}&lng=${stop.lng}&json=1`)
        .then(r => r.json())
        .then(data => {
          if (data.url) {
            photoDiv.innerHTML = `<img src="${data.url}" alt="" class="itin-card-img" loading="lazy">`;
          }
        })
        .catch(() => {});
    }
  },

  // ═══ ENRIQUECER CON PLACES API ═══
  _enrichAll(stops) {
    const promises = stops.map((stop, i) => {
      if (!stop.place_id) return Promise.resolve(null);
      return fetch(`${window.SALMA_API}/place-details?place_id=${encodeURIComponent(stop.place_id)}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
        .then(data => ({ index: i, data }));
    });

    Promise.all(promises).then(results => {
      results.forEach(r => {
        if (!r || !r.data) return;
        this._applyEnrichment(r.index, r.data);
      });
    });
  },

  // ═══ APLICAR ENRIQUECIMIENTO A CARD ═══
  _applyEnrichment(index, data) {
    // Foto mejorada (Places suele dar mejor foto)
    if (data.photo_url) {
      const photoDiv = document.getElementById(`itin-photo-${index}`);
      if (photoDiv) {
        photoDiv.innerHTML = `<img src="${data.photo_url}" alt="" class="itin-card-img" loading="lazy">`;
      }
    }

    // Rating + reviews + horario
    const placesDiv = document.getElementById(`itin-places-${index}`);
    if (!placesDiv) return;

    let html = '';

    if (data.rating) {
      const stars = '★'.repeat(Math.round(data.rating)) + '☆'.repeat(5 - Math.round(data.rating));
      html += `<div class="itin-card-rating">
        <span class="itin-stars">${stars}</span>
        <span class="itin-rating-num">${data.rating}</span>
        ${data.reviews ? `<span class="itin-reviews">(${this._formatNum(data.reviews)})</span>` : ''}
      </div>`;
    }

    if (data.open_now !== null) {
      const openClass = data.open_now ? 'open' : 'closed';
      const openText = data.open_now ? 'Abierto ahora' : 'Cerrado';
      html += `<div class="itin-card-open ${openClass}">${openText}</div>`;
    }

    if (data.hours && data.hours.length) {
      const today = new Date().getDay();
      // Google devuelve lunes=0, JS domingo=0 → ajustar
      const googleDay = today === 0 ? 6 : today - 1;
      const todayHours = data.hours[googleDay] || '';
      if (todayHours) {
        html += `<div class="itin-card-hours-detail">${this._esc(todayHours)}</div>`;
      }
    }

    if (html) placesDiv.innerHTML = html;
  },

  // ═══ RESALTAR CARD ═══
  highlightCard(index) {
    if (this._activeIdx >= 0 && this._cards[this._activeIdx]) {
      this._cards[this._activeIdx].classList.remove('active');
    }
    this._activeIdx = index;
    if (this._cards[index]) {
      this._cards[index].classList.add('active');
      this._cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  },

  // ═══ HELPERS ═══
  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _totalDays(stops) {
    const days = new Set(stops.map(s => s.day || 1));
    return days.size;
  },

  _formatHours(h) {
    if (h < 1) return `${Math.round(h * 60)} min`;
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
  },

  _formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n;
  },

  // ═══ GOOGLE MAPS RUTA COMPLETA ═══
  _fullRouteGmapsUrl(stops, country) {
    const valid = (stops || []).filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (valid.length < 2) {
      if (valid.length === 1) return 'https://www.google.com/maps?q=' + valid[0].lat + ',' + valid[0].lng;
      return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(country || 'ruta');
    }
    const sampled = this._sampleWaypoints(valid, 25);
    const segments = sampled.map(p => encodeURIComponent(p.headline || p.name) + '/@' + p.lat + ',' + p.lng).join('/');
    return 'https://www.google.com/maps/dir/' + segments;
  },

  _sampleWaypoints(arr, max) {
    if (arr.length <= max) return arr;
    const step = arr.length / max;
    const result = [];
    for (let i = 0; i < max; i++) result.push(arr[Math.floor(i * step)]);
    return result;
  },

  // ═══ DESTROY ═══
  destroy() {
    document.removeEventListener('itin:marker-click', this._onMarkerClick);
    this._stops = [];
    this._cards = [];
    this._activeIdx = -1;
    if (this._container) this._container.innerHTML = '';
    // Limpiar barra de acciones flotante
    const bar = document.getElementById('itin-view')?.querySelector('.itin-action-bar');
    if (bar) bar.remove();
  },
};

// ═══ VISTA ITINERARIO — apertura/cierre ═══
(function() {
  let _openedFromChat = false;

  function openItinerarioView(routeData, docId, options = {}) {
    _openedFromChat = !!options.fromChat;

    const view = document.getElementById('itin-view');
    const appContent = document.getElementById('app-content');
    const inputBar = document.getElementById('app-input-bar');
    if (!view) return;

    // Limpiar guide-cards del chat y loading/retry si los hay
    document.querySelectorAll('.guide-card').forEach(el => el.remove());
    if (typeof salma !== 'undefined' && typeof salma._removeLoading === 'function') salma._removeLoading();

    // Ocultar contenido principal y barra de input
    if (appContent) appContent.style.display = 'none';
    if (inputBar) inputBar.style.display = 'none';
    view.style.display = 'block';

    // Inicializar mapa y cards
    const stops = routeData.stops;
    mapaRuta.init('itin-map-container', stops);
    mapaItinerario.init('itin-cards-container', stops, routeData, options);

    // Asegurar que el mapa se dimensiona bien
    setTimeout(() => mapaRuta.invalidateSize(), 200);

    // Interceptar showState para cerrar la vista si el usuario navega con el bottom bar
    const _origShowState = window.showState;
    window.showState = function(state) {
      if (view.style.display !== 'none') {
        view.style.display = 'none';
        if (appContent) appContent.style.display = '';
        if (inputBar) inputBar.style.display = '';
        mapaRuta.destroy();
        mapaItinerario.destroy();
        window.showState = _origShowState; // restaurar
      }
      _origShowState(state);
    };
  }

  function closeItinerarioView() {
    const view = document.getElementById('itin-view');
    const appContent = document.getElementById('app-content');
    const inputBar = document.getElementById('app-input-bar');

    mapaRuta.destroy();
    mapaItinerario.destroy();

    if (view) view.style.display = 'none';
    if (appContent) appContent.style.display = '';
    if (inputBar) inputBar.style.display = '';

    // Restaurar showState si fue interceptado
    if (window.showState !== window._showStateOriginal && typeof window._showStateOriginal === 'function') {
      window.showState = window._showStateOriginal;
    }

    // Solo volver a bitácora si veníamos de ella (no del chat)
    if (!_openedFromChat && typeof showState === 'function') showState('bitacora');
  }

  // Puente con bitacoraRenderer (Mis Viajes)
  if (typeof bitacoraRenderer !== 'undefined') {
    const _originalRenderDiario = bitacoraRenderer.renderDiario.bind(bitacoraRenderer);
    bitacoraRenderer.renderDiario = function(routeData, docId, notes, photos, docData) {
      if (!routeData || !routeData.stops || !routeData.stops.length) {
        return _originalRenderDiario(routeData, docId, notes, photos, docData);
      }
      openItinerarioView(routeData, docId, { saved: true });
    };
  }

  // Exponer globalmente para que salma.js pueda llamarlo
  window.openItinerarioView = openItinerarioView;

  // Escuchar cierre desde el botón back
  document.addEventListener('itin:close', closeItinerarioView);
})();
