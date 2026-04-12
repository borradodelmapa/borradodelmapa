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

    // Barra de acciones flotante — se añade al body para escapar del stacking context
    {
      const existingBar = document.body.querySelector('.itin-action-bar');
      if (existingBar) existingBar.remove();
      const actionBar = document.createElement('div');
      actionBar.className = 'itin-action-bar';
      actionBar.innerHTML = `
        <a class="itin-btn itin-btn-maps" href="${mapsUrl}" target="_blank" rel="noopener" title="Abrir en Google Maps"><svg width="15" height="15" viewBox="0 0 24 24" style="flex-shrink:0;margin-right:5px"><path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle fill="#fff" cx="12" cy="9" r="2.5"/></svg>Google Maps</a>
        ${options.saved ? '' : '<button class="itin-btn itin-btn-save" id="itin-save-btn">GUARDAR</button>'}
        <button class="itin-btn itin-btn-share" id="itin-share-btn" title="Compartir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
      `;
      document.body.appendChild(actionBar);
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
      const card = this._createCard(stop, i, country);
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
      // Guardar primero y luego compartir al terminar
      if (typeof salma !== 'undefined') {
        salma.guardar().then(() => {
          const newId = salma.currentRouteId;
          if (newId) this._doShare(routeData, newId);
        });
      }
      return;
    }
    this._doShare(routeData, id);
  },

  async _doShare(routeData, id) {
    // Buscar el slug de la guía pública (no el ID del documento)
    let slug = id;
    try {
      if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
        const doc = await db.collection('users').doc(currentUser.uid).collection('maps').doc(id).get();
        if (doc.exists && doc.data().slug) slug = doc.data().slug;
      }
    } catch (_) {}
    const url = window.location.origin + '/' + slug;
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
  _createCard(stop, index, country) {
    const card = document.createElement('div');
    card.className = 'itin-card';
    card.dataset.index = index;

    const icon = this._icons[stop.type] || '📍';
    const nota = stop.narrative || stop.nota || '';
    const horas = stop.estimated_hours || stop.duracion_horas || null;
    const km = stop.km_from_previous || 0;

    const hasCoords = stop.lat && stop.lng && Math.abs(stop.lat) > 0.01 && Math.abs(stop.lng) > 0.01;
    const mapsNavUrl = hasCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([stop.name || stop.headline, country].filter(Boolean).join(', '))}`;

    card.innerHTML = `
      <div class="itin-card-photo" id="itin-photo-${index}">
        <div class="itin-card-photo-placeholder">${icon}</div>
      </div>
      <div class="itin-card-body">
        <div class="itin-card-num">${index + 1}</div>
        <div class="itin-card-name">${this._esc(stop.headline || stop.name)}</div>
        <button class="guide-stop-speak itin-speak" aria-label="Escuchar" data-text="${this._esc((stop.headline || stop.name) + '. ' + (stop.narrative || ''))}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </button>
        <div class="itin-card-details" id="itin-details-${index}">
          ${km > 0 ? `<span class="itin-card-km">${Math.round(km)} km</span>` : ''}
          ${horas ? `<span class="itin-card-hours">${this._formatHours(horas)}</span>` : ''}
        </div>
        ${nota ? `<div class="itin-card-nota">${this._esc(nota)}</div>` : ''}
        ${stop.context ? `<div class="guide-stop-tag tag-context"><span class="guide-stop-tag-label">📖 CONTEXTO</span>${this._esc(stop.context)}</div>` : ''}
        ${stop.food_nearby ? `<div class="guide-stop-tag tag-food"><span class="guide-stop-tag-label">🍜 COME CERCA</span>${this._esc(stop.food_nearby)}</div>` : ''}
        ${stop.local_secret ? `<div class="guide-stop-tag tag-secret"><span class="guide-stop-tag-label">🔑 SECRETO LOCAL</span>${this._esc(stop.local_secret)}</div>` : ''}
        ${stop.practical ? `<div class="guide-stop-practical">${this._esc(stop.practical)}</div>` : ''}
        <div class="itin-card-places" id="itin-places-${index}"></div>
        <a class="itin-card-nav" href="${mapsNavUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">📍 Ir aquí</a>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.itin-speak')) return; // no navegar al pulsar altavoz
      this.highlightCard(index);
      mapaRuta.centerOn(index);
    });

    // Altavoz — leer parada
    const speakBtn = card.querySelector('.itin-speak');
    if (speakBtn) {
      speakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = speakBtn.dataset.text;
        if (text && typeof salma !== 'undefined') {
          if (salma._currentAudio || (window.speechSynthesis && speechSynthesis.speaking)) {
            salma.salmaSpeakStop();
            speakBtn.classList.remove('speaking');
          } else {
            salma.salmaSpeakDirect(text);
            speakBtn.classList.add('speaking');
            const checkEnd = setInterval(() => {
              if (!salma._currentAudio && !(window.speechSynthesis && speechSynthesis.speaking)) {
                speakBtn.classList.remove('speaking');
                clearInterval(checkEnd);
              }
            }, 500);
          }
        }
      });
    }

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
    const segments = sampled.map(p => p.lat + ',' + p.lng).join('/');
    return 'https://www.google.com/maps/dir/' + segments;
  },

  _sampleWaypoints(arr, max) {
    if (arr.length <= max) return arr;
    const step = arr.length / max;
    const result = [];
    for (let i = 0; i < max; i++) result.push(arr[Math.floor(i * step)]);
    return result;
  },

  // ═══ ACTUALIZAR FOTOS CON DATOS VERIFICADOS (después del verify del worker) ═══
  updateVerified(stops) {
    if (!Array.isArray(stops)) return;
    stops.forEach((stop, i) => {
      if (!stop.photo_ref) return;
      const photoDiv = document.getElementById(`itin-photo-${i}`);
      if (!photoDiv || photoDiv.querySelector('img')) return; // ya tiene foto real
      fetch(`${window.SALMA_API}/photo?ref=${encodeURIComponent(stop.photo_ref)}&json=1`)
        .then(r => r.json())
        .then(data => {
          if (data.url) photoDiv.innerHTML = `<img src="${data.url}" alt="" class="itin-card-img" loading="lazy">`;
        })
        .catch(() => {});
    });
  },

  // ═══ ACTUALIZAR CAMPOS ENRIQUECIDOS (después de enrichGuia) ═══
  updateEnrichedFields(stops) {
    if (!Array.isArray(stops)) return;
    stops.forEach((stop, i) => {
      const card = this._cards[i];
      if (!card) return;
      const body = card.querySelector('.itin-card-body');
      if (!body) return;
      // Eliminar tags enriquecidos anteriores para no duplicar
      body.querySelectorAll('.guide-stop-tag, .guide-stop-practical').forEach(el => el.remove());
      // Insertar antes del div de places
      const placesDiv = body.querySelector('.itin-card-places');
      if (!placesDiv) return;
      const tags = [];
      if (stop.context) tags.push(`<div class="guide-stop-tag tag-context"><span class="guide-stop-tag-label">📖 CONTEXTO</span>${this._esc(stop.context)}</div>`);
      if (stop.food_nearby) tags.push(`<div class="guide-stop-tag tag-food"><span class="guide-stop-tag-label">🍜 COME CERCA</span>${this._esc(stop.food_nearby)}</div>`);
      if (stop.local_secret) tags.push(`<div class="guide-stop-tag tag-secret"><span class="guide-stop-tag-label">🔑 SECRETO LOCAL</span>${this._esc(stop.local_secret)}</div>`);
      if (stop.practical) tags.push(`<div class="guide-stop-practical">${this._esc(stop.practical)}</div>`);
      if (tags.length) {
        const temp = document.createElement('div');
        temp.innerHTML = tags.join('');
        while (temp.firstChild) body.insertBefore(temp.firstChild, placesDiv);
      }
    });
  },

  // ═══ DESTROY ═══
  destroy() {
    document.removeEventListener('itin:marker-click', this._onMarkerClick);
    this._stops = [];
    this._cards = [];
    this._activeIdx = -1;
    if (this._container) this._container.innerHTML = '';
    // Limpiar barra de acciones flotante (ahora en body)
    document.body.querySelectorAll('.itin-action-bar').forEach(el => el.remove());
  },
};

// ═══ VISTA ITINERARIO — apertura/cierre ═══
(function() {
  let _openedFromChat = false;

  function openItinerarioView(routeData, docId, options = {}) {
    _openedFromChat = !!options.fromChat;

    // Guardar referencia global para que salma.js pueda reabrir la vista
    window._itinViewOpen = true;
    window._itinViewRoute = routeData;
    window._itinViewDocId = docId;
    window._itinViewOptions = options;

    const view = document.getElementById('itin-view');
    const appContent = document.getElementById('app-content');
    const inputBar = document.getElementById('app-input-bar');
    if (!view) return;

    // Eliminar barra volver/apagar si existía
    document.getElementById('copilot-return-bar')?.remove();
    // Asegurar que nunca quede el modo fullscreen activo
    view.classList.remove('copilot-fullscreen');

    // Limpiar guide-cards del chat y loading/retry si los hay
    document.querySelectorAll('.guide-card').forEach(el => el.remove());
    if (typeof salma !== 'undefined' && typeof salma._removeLoading === 'function') salma._removeLoading();

    // Ocultar contenido principal y header
    if (appContent) appContent.style.display = 'none';
    if (inputBar) inputBar.style.display = 'none';
    document.querySelector('.app-header')?.style.setProperty('display', 'none', 'important');
    view.style.display = 'block';

    // Inicializar mapa (preview: sin controles, solo botón "Ir al mapa") y cards
    const stops = routeData.stops;
    mapaRuta.init('itin-map-container', stops, { preview: true });
    mapaItinerario.init('itin-cards-container', stops, routeData, options);

    // Asegurar que el mapa se dimensiona bien
    setTimeout(() => mapaRuta.invalidateSize(), 200);

    // Botón "Ir al mapa" → cierra itinerario + abre mapa live con la ruta cargada + pins
    const _onOpenLiveMap = () => {
      document.removeEventListener('itin:open-live-map', _onOpenLiveMap);
      closeItinerarioView();
      // Abrir mapa live
      if (typeof openLiveMap === 'function') openLiveMap();
      // Cargar la ruta en el mapa live (esperar a que el mapa esté listo)
      setTimeout(() => {
        if (typeof selectRouteOnMap === 'function') selectRouteOnMap(routeData);
      }, 400);
    };
    document.addEventListener('itin:open-live-map', _onOpenLiveMap);

    // Interceptar showState para cerrar la vista si el usuario navega con el bottom bar
    const _origShowState = window.showState;
    window.showState = function(state) {
      if (view.style.display !== 'none') {
        view.style.display = 'none';
        if (appContent) appContent.style.display = '';
        if (inputBar) inputBar.style.display = '';
        document.querySelector('.app-header')?.style.removeProperty('display');
        const bb = document.getElementById('app-bottom-bar');
        if (bb) bb.style.display = '';
        // Quitar barra flotante (Google Maps + Compartir)
        document.body.querySelectorAll('.itin-action-bar').forEach(el => el.remove());
        mapaRuta.destroy();
        mapaItinerario.destroy();
        window.showState = _origShowState;
      }
      _origShowState(state);
    };

  }

  function closeItinerarioView() {
    const view = document.getElementById('itin-view');
    const appContent = document.getElementById('app-content');
    const inputBar = document.getElementById('app-input-bar');

    window._itinViewOpen = false;

    mapaRuta.destroy();
    mapaItinerario.destroy();

    // Quitar barra flotante (Google Maps + Compartir) del body
    const actionBar = document.body.querySelector('.itin-action-bar');
    if (actionBar) actionBar.remove();

    if (view) view.style.display = 'none';
    if (appContent) appContent.style.display = '';
    if (inputBar) inputBar.style.display = '';
    const bottomBar = document.getElementById('app-bottom-bar');
    if (bottomBar) bottomBar.style.display = '';

    // Restaurar showState si fue interceptado
    if (window.showState !== window._showStateOriginal && typeof window._showStateOriginal === 'function') {
      window.showState = window._showStateOriginal;
    }

    // Solo volver a bitácora si veníamos de ella (no del chat)
    if (!_openedFromChat && typeof showState === 'function') showState('bitacora');
  }

  // Exponer globalmente para que app.js y salma.js puedan llamarlo (P2-11: ya no hay monkey-patch)
  window.openItinerarioView = openItinerarioView;

  // Escuchar cierre desde el botón back
  document.addEventListener('itin:close', closeItinerarioView);
})();
