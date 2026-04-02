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
  init(containerId, stops, routeData) {
    this._container = document.getElementById(containerId);
    if (!this._container || !stops || !stops.length) return;

    this._stops = stops;
    this._cards = [];
    this._activeIdx = -1;
    this._container.innerHTML = '';

    // Header de la ruta
    const header = document.createElement('div');
    header.className = 'itin-header';
    header.innerHTML = `
      <button class="itin-back" id="itin-back-btn">&larr;</button>
      <div class="itin-header-info">
        <div class="itin-title">${this._esc(routeData.title || routeData.name || 'Tu ruta')}</div>
        <div class="itin-meta">${this._totalDays(stops)} días · ${stops.length} paradas · ${this._esc((routeData.country || routeData.region || '').toUpperCase())}</div>
      </div>
    `;
    this._container.appendChild(header);

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

    // Botón volver
    document.getElementById('itin-back-btn')?.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('itin:close'));
    });

    // Escuchar clicks en marcadores del mapa
    document.addEventListener('itin:marker-click', (e) => {
      this.highlightCard(e.detail.index);
    });

    // Enriquecer con Places API en paralelo
    this._enrichAll(stops);
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

    // Cargar foto inicial (sin Places, con el endpoint /photo existente)
    this._loadInitialPhoto(stop, index);

    return card;
  },

  // ═══ FOTO INICIAL ═══
  _loadInitialPhoto(stop, index) {
    const photoDiv = document.getElementById(`itin-photo-${index}`);
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

  // ═══ DESTROY ═══
  destroy() {
    document.removeEventListener('itin:marker-click', this._onMarkerClick);
    this._stops = [];
    this._cards = [];
    this._activeIdx = -1;
    if (this._container) this._container.innerHTML = '';
  },
};

// ═══ PUENTE: interceptar renderDiario para abrir vista itinerario ═══
(function() {
  if (typeof bitacoraRenderer === 'undefined') return;

  const _originalRenderDiario = bitacoraRenderer.renderDiario.bind(bitacoraRenderer);

  bitacoraRenderer.renderDiario = function(routeData, docId, notes, photos, docData) {
    if (!routeData || !routeData.stops || !routeData.stops.length) {
      // Sin stops, usar la vista original
      return _originalRenderDiario(routeData, docId, notes, photos, docData);
    }

    // Abrir vista itinerario enriquecida
    openItinerarioView(routeData, docId);
  };

  function openItinerarioView(routeData, docId) {
    const view = document.getElementById('itin-view');
    const appContent = document.getElementById('app-content');
    const inputBar = document.getElementById('app-input-bar');
    if (!view) return;

    // Ocultar contenido principal y barra de input
    if (appContent) appContent.style.display = 'none';
    if (inputBar) inputBar.style.display = 'none';
    view.style.display = 'block';

    // Inicializar mapa y cards
    const stops = routeData.stops;
    mapaRuta.init('itin-map-container', stops);
    mapaItinerario.init('itin-cards-container', stops, routeData);

    // Asegurar que el mapa se dimensiona bien
    setTimeout(() => mapaRuta.invalidateSize(), 200);
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

    // Volver a bitácora
    if (typeof showState === 'function') showState('bitacora');
  }

  // Escuchar cierre desde el botón back de las cards
  document.addEventListener('itin:close', closeItinerarioView);
})();
