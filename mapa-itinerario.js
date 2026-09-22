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
    this._photoQueue = [];
    this._container.innerHTML = '';

    const country = routeData.country || routeData.region || '';
    // Si la ruta sigue una carretera con nombre (N2…), el enlace a Google Maps se
    // arma con puntos del trazado real, no solo con las paradas → Google no se
    // desvía a la autopista paralela.
    const _rg = routeData.road_geometry;
    const mapsUrl = (_rg && Array.isArray(_rg.coords) && _rg.coords.length > 2)
      ? this._roadGmapsUrl(_rg.coords)
      : this._fullRouteGmapsUrl(stops, country);

    // Header de la ruta (título + volver — desktop)
    const header = document.createElement('div');
    header.className = 'itin-header';
    header.innerHTML = `
      <div class="itin-header-info">
        <div class="itin-title">${this._esc(routeData.title || routeData.name || 'Tu ruta')}</div>
        <div class="itin-meta">${this._totalDays(stops)} días · ${stops.length} paradas · ${this._esc(country.toUpperCase())}</div>
        ${country ? `<div class="hist-inline-mount" data-place="${this._esc(country)}"></div>` : ''}
      </div>
    `;
    this._container.appendChild(header);
    if (country && typeof historiaModule !== 'undefined') {
      const countryMount = header.querySelector('.hist-inline-mount');
      if (countryMount) historiaModule.renderCompactInto(countryMount, { place: country });
    }

    // Barra de acciones flotante — se añade al body para escapar del stacking context
    {
      const existingBar = document.body.querySelector('.itin-action-bar');
      if (existingBar) existingBar.remove();
      const actionBar = document.createElement('div');
      actionBar.className = 'itin-action-bar';
      actionBar.innerHTML = `
        ${mapsUrl ? `<a class="itin-btn itin-btn-maps" href="${mapsUrl}" target="_blank" rel="noopener" title="Abrir en Google Maps"><svg width="15" height="15" viewBox="0 0 24 24" style="flex-shrink:0;margin-right:5px"><path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle fill="#fff" cx="12" cy="9" r="2.5"/></svg>Google Maps</a>` : ''}
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

    // Fotos por tandas, no todas a la vez (ver comentario en _createCard)
    this._processPhotoQueue();

    // Extras: antes de salir, info práctica, tips (reutiliza guide-renderer)
    if (typeof guideRenderer !== 'undefined') {
      try { console.log('[NEARBY] itin.init nearby:', (routeData.nearby_stops||[]).length, 'loc:', routeData.anchor_locality || null, 'fn:', typeof guideRenderer._renderNearby); } catch (_) {}
      const extrasHtml = [
        (typeof guideRenderer._renderNearby === 'function'
          ? guideRenderer._renderNearby(routeData.nearby_stops || null, country, routeData.anchor_locality || '')
          : ''),
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

  // A diferencia del link de SEO (public_guides, lectura abierta sin login),
  // esto escribe en shared_routes — el que abre el link tiene que registrarse/
  // entrar para verla (app.js lo intercepta con ?compartir=ID al iniciar sesión).
  async _doShare(routeData, id) {
    try {
      if (typeof db === 'undefined' || typeof currentUser === 'undefined' || !currentUser) {
        if (typeof showToast !== 'undefined') showToast('Inicia sesión para compartir');
        return;
      }
      await db.collection('shared_routes').doc(id).set({
        uid: currentUser.uid,
        owner_name: currentUser.name || 'Un viajero',
        nombre: routeData.title || routeData.name || 'Mi ruta',
        itinerarioIA: JSON.stringify(routeData),
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Error preparando ruta compartida:', e);
      if (typeof showToast !== 'undefined') showToast('No se pudo preparar el link para compartir');
      return;
    }
    const url = window.location.origin + '/?compartir=' + id;
    const title = routeData.title || routeData.name || 'Mi ruta';
    const text = `Te comparto esta ruta: ${title}`;
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
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

    // "Cómo llegar" = direcciones hasta ESA parada (Google pone el origen = ubicación del
    // usuario). place_id si lo hay; si no, coordenadas; si no, el nombre. Siempre sale.
    const mapsDirUrl = this._stopDirUrl(stop);
    const notaLarga = nota && nota.length > 140;

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
        ${nota ? `<div class="itin-card-nota${notaLarga ? '' : ' expanded'}">${this._esc(nota)}</div>` : ''}
        ${notaLarga ? `<span class="itin-card-leermas">Leer más</span>` : ''}
        ${stop.context ? `<div class="guide-stop-tag tag-context"><span class="guide-stop-tag-label">📖 CONTEXTO</span>${this._esc(stop.context)}</div>` : ''}
        ${stop.food_nearby ? `<div class="guide-stop-tag tag-food"><span class="guide-stop-tag-label">🍜 COME CERCA</span>${this._esc(stop.food_nearby)}</div>` : ''}
        ${stop.local_secret ? `<div class="guide-stop-tag tag-secret"><span class="guide-stop-tag-label">🔑 SECRETO LOCAL</span>${this._esc(stop.local_secret)}</div>` : ''}
        ${stop.practical ? `<div class="guide-stop-practical">${this._esc(stop.practical)}</div>` : ''}
        <div class="itin-card-places" id="itin-places-${index}"></div>
        ${stop.con_historia !== false ? `<div class="hist-inline-mount" data-place="${this._esc(stop.name || stop.headline || '')}" data-lat="${stop.lat != null ? stop.lat : ''}" data-lng="${stop.lng != null ? stop.lng : ''}"></div>` : ''}
        ${mapsDirUrl ? `<div class="itin-card-actions">
          <a class="itin-card-nav" href="${mapsDirUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🗺️ Cómo llegar</a>
        </div>` : ''}
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
            salma.salmaSpeak(text);
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

    // "Leer más" — desplegar/plegar la descripción de la parada
    const leermas = card.querySelector('.itin-card-leermas');
    if (leermas) {
      leermas.addEventListener('click', (e) => {
        e.stopPropagation();
        const nd = card.querySelector('.itin-card-nota');
        if (!nd) return;
        const expandida = nd.classList.toggle('expanded');
        leermas.textContent = expandida ? 'Leer menos' : 'Leer más';
      });
    }

    // Foto inicial — encolada, no se pide aquí. Con rutas de muchas paradas (12+) las
    // pedía TODAS a la vez en el mismo milisegundo, y si alguna foto no estaba aún en
    // caché R2 (llamada real a Google), 12 llamadas simultáneas competían entre sí y
    // acababan fallando en cadena con "Failed to fetch" — reportado 16 sept, tarde.
    // _processPhotoQueue() (llamado al final de init()) las pide en tandas pequeñas.
    (this._photoQueue = this._photoQueue || []).push({ stop, index, cardEl: card });

    // Botón "Historia de [parada]"
    const histMount = card.querySelector('.hist-inline-mount');
    if (histMount && typeof historiaModule !== 'undefined') {
      historiaModule.renderCompactInto(histMount, {
        place: histMount.dataset.place,
        lat: histMount.dataset.lat ? parseFloat(histMount.dataset.lat) : null,
        lng: histMount.dataset.lng ? parseFloat(histMount.dataset.lng) : null,
      });
    }

    return card;
  },

  // ═══ COLA DE FOTOS — tandas pequeñas y espaciadas, no las 12+ de golpe ═══
  // 16 sept, tercera vuelta: con wrangler tail bloqueado por la propia red (ETIMEDOUT
  // hacia la infraestructura de logs de Cloudflare, confirmado por Paco) no hay forma
  // de ver en vivo qué le pasa al Worker desde aquí. Sin ese diagnóstico, se reduce el
  // tamaño de tanda (4→2) y se espacian más (400ms→900ms) — menos peticiones a la vez
  // en cualquier escenario (rate limiting, Worker bajo carga, red intermedia con poco
  // margen) reduce las probabilidades de fallo sea cual sea la causa exacta.
  _processPhotoQueue() {
    const queue = this._photoQueue || [];
    const BATCH = 2;
    let i = 0;
    const next = () => {
      const batch = queue.slice(i, i + BATCH);
      if (!batch.length) return;
      i += BATCH;
      batch.forEach(({ stop, index, cardEl }) => this._loadInitialPhoto(stop, index, cardEl));
      if (i < queue.length) setTimeout(next, 900);
    };
    next();
  },

  // ═══ FOTO INICIAL ═══
  _loadInitialPhoto(stop, index, cardEl, _retryNum) {
    _retryNum = _retryNum || 0;
    // Buscar dentro del card (antes de estar en el DOM) o en el documento si ya está
    const photoDiv = (cardEl && cardEl.querySelector('.itin-card-photo')) || document.getElementById(`itin-photo-${index}`);
    if (!photoDiv) return;

    // Sin console.warn en los fallos, esto no dejaba ningún rastro en el panel 🐛 cuando
    // una foto no cargaba — imposible saber si era el endpoint, Google sin foto para ese
    // sitio, o un error de red, solo se veía "no salió la foto".
    // 16 sept: añadido también log al ARRANCAR el fetch y onerror en el propio <img> —
    // el fetch que trae la URL puede ir bien y aun así la imagen fallar al cargar de
    // verdad en el navegador, y ESO no dejaba ningún rastro (ni warn ni catch) hasta hoy.
    // 16 sept, tercera vuelta: hasta 2 reintentos (antes 1), con más espera cada vez
    // (4s, luego 8s) — sin diagnóstico en vivo del Worker (wrangler tail bloqueado por
    // la red), dar más margen a que un fallo puntual se resuelva solo es lo único que
    // se puede hacer desde aquí sin más información.
    const MAX_RETRIES = 2;
    const retry = () => {
      if (_retryNum >= MAX_RETRIES) return;
      const delay = 4000 * (_retryNum + 1);
      setTimeout(() => this._loadInitialPhoto(stop, index, cardEl, _retryNum + 1), delay);
    };
    if (stop.photo_ref) {
      console.log(`[FOTO] pidiendo (ref) para "${stop.name}"${_retryNum ? ` (reintento ${_retryNum})` : ''}`);
      // Se manda también nombre+coords (si hay) junto al ref: el photo_reference de una
      // guía guardada puede caducar con los días — si el Worker ve que el ref ya no
      // resuelve, con el nombre puede buscar una foto nueva en vez de rendirse.
      const fallbackQS = (stop.name && stop.lat && stop.lng)
        ? `&name=${encodeURIComponent(stop.name)}&lat=${stop.lat}&lng=${stop.lng}` : '';
      fetch(`${window.SALMA_API}/photo?ref=${encodeURIComponent(stop.photo_ref)}${fallbackQS}&json=1`)
        .then(r => r.json())
        .then(data => {
          if (data.url) {
            console.log(`[FOTO] url recibida para "${stop.name}":`, data.url);
            photoDiv.innerHTML = `<img src="${data.url}" alt="" class="itin-card-img" loading="lazy" onerror="console.warn('[FOTO] la imagen NO cargó (onerror) para índice ${index}:', this.src)">`;
          } else {
            console.warn(`[FOTO] sin url para "${stop.name}" (ref):`, data);
            retry();
          }
        })
        .catch(e => { console.warn(`[FOTO] fetch falló para "${stop.name}" (ref):`, e); retry(); });
    } else if (stop.name && stop.lat && stop.lng) {
      console.log(`[FOTO] pidiendo (name+coords) para "${stop.name}"${_retryNum ? ` (reintento ${_retryNum})` : ''}`);
      fetch(`${window.SALMA_API}/photo?name=${encodeURIComponent(stop.name)}&lat=${stop.lat}&lng=${stop.lng}&json=1`)
        .then(r => r.json())
        .then(data => {
          if (data.url) {
            console.log(`[FOTO] url recibida para "${stop.name}":`, data.url);
            photoDiv.innerHTML = `<img src="${data.url}" alt="" class="itin-card-img" loading="lazy" onerror="console.warn('[FOTO] la imagen NO cargó (onerror) para índice ${index}:', this.src)">`;
          } else {
            console.warn(`[FOTO] sin url para "${stop.name}" (name+coords):`, data);
            retry();
          }
        })
        .catch(e => { console.warn(`[FOTO] fetch falló para "${stop.name}" (name+coords):`, e); retry(); });
    } else {
      console.warn(`[FOTO] "${stop.name}" sin photo_ref y sin lat/lng — no se intenta buscar foto`);
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
  // Deuda técnica (22 sept 2026): delega en escapeHTML() de app.js — mismo algoritmo
  // exacto, repetido aquí y en docs-viajero.js.
  _esc(str) {
    return escapeHTML(str);
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
  // Regla única: sin place_id validado → no hay enlace.
  // URL de "cómo llegar" a UNA parada. Preferencia: place_id > coords > nombre.
  _stopDirUrl(stop) {
    if (!stop) return null;
    const base = 'https://www.google.com/maps/dir/?api=1&';
    if (stop.place_id) {
      return base + `destination=${encodeURIComponent(stop.headline || stop.name || '')}&destination_place_id=${stop.place_id}`;
    }
    if (typeof stop.lat === 'number' && typeof stop.lng === 'number' && Math.abs(stop.lat) > 0.01) {
      return base + `destination=${stop.lat}%2C${stop.lng}`;
    }
    if (stop.name || stop.headline) return base + `destination=${encodeURIComponent(stop.name || stop.headline)}`;
    return null;
  },

  _fullRouteGmapsUrl(stops, country) {
    const valid = (stops || []).filter(s => s && s.lat && s.lng && Math.abs(s.lat) > 0.01);
    if (valid.length === 0) return null;
    if (valid.length === 1) return this._stopDirUrl(valid[0]);
    const sampled = this._sampleWaypoints(valid, 25);
    // Con nombre+place_id cuando lo hay (igual que _stopDirUrl) — si solo se manda la
    // coordenada, Google Maps le pone al waypoint la etiqueta del sitio indexado más
    // cercano a ese punto, que puede no ser el real. Visto en producción: la Cueva de
    // Tito Bustillo (que SÍ tiene ficha en Google Places) salía en el mapa como "Club
    // Piragüismo" porque solo se mandaban las coordenadas, sin nombre ni place_id.
    const point = (p) => p.place_id
      ? encodeURIComponent(p.headline || p.name || '')
      : `${p.lat}%2C${p.lng}`;
    const origin = sampled[0], destination = sampled[sampled.length - 1];
    const middle = sampled.slice(1, -1);
    let url = 'https://www.google.com/maps/dir/?api=1'
      + `&origin=${point(origin)}${origin.place_id ? `&origin_place_id=${origin.place_id}` : ''}`
      + `&destination=${point(destination)}${destination.place_id ? `&destination_place_id=${destination.place_id}` : ''}`;
    if (middle.length) {
      url += `&waypoints=${middle.map(point).join('%7C')}`;
      if (middle.some(p => p.place_id)) {
        url += `&waypoint_place_ids=${middle.map(p => p.place_id || '').join('%7C')}`;
      }
    }
    return url;
  },

  // Enlace /dir/ con ~10 puntos repartidos por el trazado real de la carretera.
  // Con tantos waypoints Google no tiene margen para irse por la autopista.
  _roadGmapsUrl(coords) {
    const n = (coords || []).length;
    if (n < 2) return null;
    const MAX = 10;
    const step = Math.max(1, Math.floor((n - 1) / (MAX - 1)));
    const pts = [];
    for (let i = 0; i < n; i += step) pts.push(coords[i]);
    if (pts[pts.length - 1] !== coords[n - 1]) pts.push(coords[n - 1]);
    return 'https://www.google.com/maps/dir/' + pts.map(c => `${c[0]},${c[1]}`).join('/');
  },

  // Deuda técnica (22 sept 2026): delega en la versión compartida de app.js —
  // era una copia idéntica del mismo algoritmo, repetida aquí y en guide-renderer.js.
  _sampleWaypoints(arr, max) {
    return sampleWaypoints(arr, max);
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
          if (data.url) photoDiv.innerHTML = `<img src="${data.url}" alt="" class="itin-card-img" loading="lazy" onerror="console.warn('[FOTO] la imagen NO cargó (onerror, updateVerified) para índice ${i}:', this.src)">`;
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
    // 19 sept 2026 — pantalla en negro real encontrada: si routeData.stops llega vacío
    // (ej. el verify de Google descartó TODAS las paradas de una ruta sin ancla de país,
    // como una guía montada desde una foto sin lugares verificables), mapaRuta.init()
    // simplemente hace `if (!stops.length) return;` sin avisar — el mapa y las tarjetas
    // no pintan nada y la vista se queda negra, sin el aviso de "Reintentar" que ya
    // existe para otros fallos de este mismo botón (ver catch en salma.js). Lanzar aquí
    // para que ese catch, ya escrito, se encargue de deshacer la vista y avisar.
    if (!Array.isArray(routeData?.stops) || routeData.stops.length === 0) {
      throw new Error('Ruta sin paradas válidas — 0 stops al abrir la vista de itinerario.');
    }
    // Si ya había una vista abierta, cerrarla (sin tocar historial) antes de reabrir
    if (window._itinViewOpen) _teardownItinView();
    _openedFromChat = !!options.fromChat;

    // Guardar referencia global para que salma.js pueda reabrir la vista
    window._itinViewOpen = true;
    window._itinViewRoute = routeData;
    window._itinViewDocId = docId;
    window._itinViewOptions = options;

    // Sincroniza salma.currentRoute/currentRouteId aquí mismo, no solo al abrir
    // el popup de consulta (_openItinQuery) — bug real: abrir una guía guardada
    // desde la tarjeta "ruta activa" del billete o desde Mi Diario llama a esta
    // función directo, sin pasar por salma.cargarGuia(), así que currentRoute se
    // quedaba a null. Con eso, tocar "Compartir" sin abrir antes el chat creía
    // que no había ninguna ruta y ni guardaba ni compartía nada.
    if (typeof salma !== 'undefined') {
      salma.currentRoute = routeData;
      salma.currentRouteId = docId || null;
    }

    // La última guía guardada que se abre pasa a ser la RUTA ACTIVA (índice + mapa).
    // Solo si es una guía guardada (tiene docId); los borradores del chat no.
    if (docId && typeof window.setActiveRoute === 'function') {
      try { window.setActiveRoute(routeData, docId); } catch (_) {}
    }

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
    mapaRuta.init('itin-map-container', stops, { preview: true, roadGeometry: routeData.road_geometry || null });
    mapaItinerario.init('itin-cards-container', stops, routeData, options);

    // Asegurar que el mapa se dimensiona bien
    setTimeout(() => mapaRuta.invalidateSize(), 200);

    // FAB de chat sobre la guía (abre el popup de consulta)
    _setupItinChatFab();

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

    // Navegación Fase 4: la vista itinerario se comporta como un modal en el
    // historial (pushModal / popModal). El botón atrás del móvil la cierra.
    // Fuera el monkey-patch de window.showState (causaba un leak: cada
    // apertura/cierre por ✕ apilaba otro wrapper sin restaurarlo).
    if (window.pushModal) window.pushModal('itinerario', _teardownItinView);
  }

  // Desmontaje puro de la vista (DOM + mapas). NO toca historial.
  function _teardownItinView() {
    if (!window._itinViewOpen) return;
    window._itinViewOpen = false;
    // Por si se cierra la guía con el popup de consulta abierto (el body no
    // desmonta el overlay de #itin-view, así que hay que cerrarlo aparte).
    if (typeof _closeItinQuery === 'function') _closeItinQuery();

    try { mapaRuta.destroy(); } catch (_) {}
    try { mapaItinerario.destroy(); } catch (_) {}

    document.body.querySelectorAll('.itin-action-bar').forEach(el => el.remove());

    const view = document.getElementById('itin-view');
    const appContent = document.getElementById('app-content');
    const inputBar = document.getElementById('app-input-bar');
    if (view) view.style.display = 'none';
    if (appContent) appContent.style.display = '';
    if (inputBar) inputBar.style.display = '';
    document.querySelector('.app-header')?.style.removeProperty('display');
    const bottomBar = document.getElementById('app-bottom-bar');
    if (bottomBar) bottomBar.style.display = '';

    const fab = document.getElementById('itin-chat-fab');
    if (fab) fab.style.display = 'none';
  }
  window._teardownItinView = _teardownItinView;

  // Refresca mapa + tarjetas con datos NUEVOS sin tocar visibilidad/historial —
  // para cuando se edita la ruta desde el popup de consulta (añadir/quitar
  // parada) y hay que reflejarlo en la guía de detrás. mapaItinerario.updateVerified()
  // no vale aquí: solo repone fotos de paradas que YA existían en el mismo
  // índice, no sabe insertar/quitar/reordenar — por eso se rehace init() entero.
  function _refreshItinInPlace(routeData, docId) {
    if (!window._itinViewOpen || !routeData || !Array.isArray(routeData.stops)) return;
    window._itinViewRoute = routeData;
    if (docId) window._itinViewDocId = docId;
    try { mapaRuta.destroy(); } catch (_) {}
    try { mapaItinerario.destroy(); } catch (_) {}
    mapaRuta.init('itin-map-container', routeData.stops, { preview: true, roadGeometry: routeData.road_geometry || null });
    mapaItinerario.init('itin-cards-container', routeData.stops, routeData, window._itinViewOptions || {});
    setTimeout(() => mapaRuta.invalidateSize(), 200);
  }
  window._refreshItinInPlace = _refreshItinInPlace;

  // ── FAB "hablar con Salma" sobre la guía → popup de consulta ──
  // v2 (18 sept): Paco pidió el mismo patrón visual que el modal del Narrador
  // (overlay oscuro + tarjeta pequeña) en vez de tapar/traslucir la pantalla
  // entera con el chat completo — la v1 arrastraba conversación vieja sin
  // relación y el banner del tiempo, confuso. Aquí es un cuadro de texto +
  // respuesta de Salma autocontenido; la guía se ve detrás, atenuada.
  function _setupItinChatFab() {
    const fab = document.getElementById('itin-chat-fab');
    if (!fab) return;
    fab.style.display = 'flex';
    fab.onclick = _openItinQuery;
  }

  let _itinQueryObserver = null;

  async function _openItinQuery() {
    const overlay = document.getElementById('itin-query-overlay');
    const answer = document.getElementById('itin-query-answer');
    const input = document.getElementById('itin-query-input');
    if (!overlay || !answer || !input) return;

    answer.innerHTML = '';   // vacío: el aviso fijo de arriba ya explica para qué sirve el popup (no repetirlo aquí)
    // Aviso FIJO (fuera de la conversación, siempre visible aunque haya mensajes de antes): que aquí se edita
    // ESTA guía (con su nombre), adónde ir para buscar cerca de uno, y borrar la conversación guardada de la guía.
    // Nodos de texto: el título de la guía puede llevar cualquier carácter.
    const _sub = document.getElementById('itin-query-sub');
    if (_sub) {
      const _gTitle = (window._itinViewRoute && (window._itinViewRoute.title || window._itinViewRoute.name)) || '';
      _sub.innerHTML = '';
      const _st = document.createElement('strong');
      _st.textContent = _gTitle ? 'Editando «' + _gTitle + '»' : 'Editando esta guía';
      _sub.appendChild(_st);
      _sub.appendChild(document.createTextNode('Añade, quita, cambia o pregunta sobre esta guía. Para buscar cerca de ti: «Cerca mía» o el chat general.'));
    }
    // "Borrar conversación": botón fijo debajo de "Cerca mía" / "Narrador" (ver index.html)
    const _clrBtn = document.getElementById('itin-query-clear');
    if (_clrBtn) _clrBtn.onclick = _clearItinQueryHistory;
    input.value = '';
    overlay.style.display = 'flex';
    setTimeout(() => input.focus(), 50);

    // Mientras el popup esté abierto, todo lo que salma.send() renderice
    // (burbujas, "buscando...", etc.) va a este contenedor en vez de a
    // #chat-area — mismo motor de siempre, solo cambia dónde pinta.
    if (typeof salma === 'undefined') return;
    salma._chatAreaOverride = 'itin-query-answer';
    // Guardar el historial que hubiera en curso (chat normal) para devolverlo
    // tal cual al cerrar — el de aquí es el de ESTA ruta, no se mezclan.
    // Si se cerró el popup con una respuesta en curso y se reabre antes de que acabe, el cierre
    // sigue pendiente (ver _closeItinQuery): se cancela y NO se vuelve a copiar/vaciar el historial.
    if (_itinQueryClosePoll) {
      clearInterval(_itinQueryClosePoll);
      _itinQueryClosePoll = null;
    } else {
      salma._prevHistoryBackup = salma.history.slice();
      salma.history = [];
    }
    // Sincronizar qué ruta es "la actual" para salma.send(): sin esto,
    // currentRouteId se queda del último hilo de chat normal (o vacío) y
    // un "quita esta parada" desde aquí no editaba la guía que se está
    // viendo — la trataba como ruta nueva sin relación (isEdit=false).
    salma.currentRouteId = window._itinViewDocId || null;
    salma.currentRoute = window._itinViewRoute || null;

    if (_itinQueryObserver) _itinQueryObserver.disconnect();
    _itinQueryObserver = new MutationObserver(() => { answer.scrollTop = answer.scrollHeight; });
    _itinQueryObserver.observe(answer, { childList: true, subtree: true, characterData: true });

    const closeBtn = document.getElementById('itin-query-close');
    const sendBtn = document.getElementById('itin-query-send');
    closeBtn.onclick = _closeItinQuery;
    overlay.onclick = (e) => { if (e.target === overlay) _closeItinQuery(); };
    sendBtn.onclick = _sendItinQuery;
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _sendItinQuery(); }
    };
    input.oninput = () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';
    };

    // Foto: botón cámara + menú hacer foto/galería, misma UX que el chat
    // normal pero con su propia preview (ver _handleItinPhotoSelected).
    const camBtn = document.getElementById('itin-query-cam');
    const camMenu = document.getElementById('itin-query-cam-menu');
    const camPhotoInput = document.getElementById('itin-query-photo-input');
    const camCameraInput = document.getElementById('itin-query-camera-input');
    const camCancelBtn = document.getElementById('itin-query-photo-cancel');
    if (camBtn && camMenu) {
      camBtn.onclick = (e) => {
        if (salma._streaming) return;
        e.stopPropagation();
        camMenu.style.display = camMenu.style.display === 'none' ? '' : 'none';
      };
    }
    document.getElementById('itin-query-cam-foto')?.addEventListener('click', () => {
      camMenu.style.display = 'none';
      if (camCameraInput) camCameraInput.click();
    });
    document.getElementById('itin-query-cam-galeria')?.addEventListener('click', () => {
      camMenu.style.display = 'none';
      if (camPhotoInput) camPhotoInput.click();
    });
    const _handleItinFileChange = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (file) _handleItinPhotoSelected(file);
    };
    if (camPhotoInput) camPhotoInput.onchange = _handleItinFileChange;
    if (camCameraInput) camCameraInput.onchange = _handleItinFileChange;
    if (camCancelBtn) camCancelBtn.onclick = _clearItinQueryPhoto;
    if (!overlay._camMenuOutsideClick) {
      overlay._camMenuOutsideClick = true;
      overlay.addEventListener('click', () => { if (camMenu) camMenu.style.display = 'none'; });
    }

    // Accesos rápidos, debajo del cuadro de texto
    const nearBtn = document.getElementById('itin-query-near');
    const narradorBtn = document.getElementById('itin-query-narrador');
    if (nearBtn) {
      const _nearLabel = nearBtn.textContent;
      nearBtn.onclick = () => {
        // Pedir una posición GPS fresca antes de preguntar "qué tengo cerca":
        // this._userLocation puede llevar rato sin refrescarse (el watch se
        // para al llegar a <500m de precisión si el Narrador no está activo,
        // ver salma.js:initGeolocation) — con el usuario en movimiento eso da
        // una ubicación vieja y una respuesta que no tiene que ver con dónde
        // está de verdad. Sin coste: getCurrentPosition es una llamada del
        // propio navegador, no toca ninguna API de pago.
        if (!navigator.geolocation) { input.value = '¿Qué tengo cerca?'; _sendItinQuery(); return; }
        nearBtn.disabled = true;
        nearBtn.textContent = 'Localizando…';
        const _finish = () => {
          nearBtn.disabled = false;
          nearBtn.textContent = _nearLabel;
          input.value = '¿Qué tengo cerca?';
          _sendItinQuery();
        };
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            salma._userLocation = {
              lat: Math.round(pos.coords.latitude * 10000) / 10000,
              lng: Math.round(pos.coords.longitude * 10000) / 10000,
              accuracy: Math.round(pos.coords.accuracy)
            };
            _finish();
          },
          () => _finish(),
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      };
    }
    if (narradorBtn) {
      narradorBtn.onclick = (e) => {
        if (e.target.closest('[data-camera-badge]')) {
          e.stopPropagation();
          if (typeof narratorTakePhoto === 'function') narratorTakePhoto();
          return;
        }
        // Mismo camino que el chip Narrador del chat: si ya está activo abre
        // el menú (olvidar avisos/desactivar), si no el modal de activación.
        if (salma._narratorActive && typeof showNarratorActiveMenu === 'function') {
          showNarratorActiveMenu();
        } else if (typeof showNarratorConfirm === 'function') {
          showNarratorConfirm();
        }
      };
      // Estado inicial (verde + 📷 si el Narrador ya estaba activo al abrir el popup)
      if (typeof updateNarratorChipUI === 'function') updateNarratorChipUI();
    }

    // Historial de ESTA ruta, si ya se había hablado con ella antes (aunque
    // fuera otro día) — vive en su propio documento, no en sessionStorage.
    if (salma.currentRouteId && window.currentUser && typeof db !== 'undefined') {
      try {
        const doc = await db.collection('users').doc(window.currentUser.uid).collection('maps').doc(salma.currentRouteId).get();
        const hist = doc.exists && Array.isArray(doc.data().query_history) ? doc.data().query_history : [];
        if (hist.length) {
          salma.history = hist;
          answer.innerHTML = '';
          for (const m of hist) {
            if (m.role === 'user') salma._addUserBubble(m.content);
            else salma._addSalmaBubble(m.content);
          }
        }
      } catch (_) {}
    }
  }

  // Borra la conversación guardada de ESTA guía (popup de consulta): la pantalla, el historial en memoria y su copia
  // en Firestore (users/{uid}/maps/{id}.query_history). NO toca la guía. Ese historial se manda a Claude como contexto
  // en cada mensaje, así que borrarlo también limpia lo que Salma "recuerda" de esta guía.
  async function _clearItinQueryHistory() {
    if (typeof salma === 'undefined') return;
    if (salma._streaming) { salma.isBusyNotify(); return; }
    if (!confirm('¿Borrar la conversación de esta guía? No borra la guía.')) return;
    salma.history = [];
    const answer = document.getElementById('itin-query-answer');
    if (answer) answer.innerHTML = '';
    try {
      if (salma.currentRouteId && window.currentUser && typeof db !== 'undefined') {
        await db.collection('users').doc(window.currentUser.uid).collection('maps').doc(salma.currentRouteId)
          .update({ query_history: firebase.firestore.FieldValue.delete() });
      }
    } catch (e) {
      console.warn('[Salma] No se pudo borrar el historial guardado de la guía:', e);
    }
    if (typeof showToast === 'function') showToast('Conversación borrada');
  }

  function _closeItinQuery() {
    const overlay = document.getElementById('itin-query-overlay');
    const camMenu = document.getElementById('itin-query-cam-menu');
    if (overlay) overlay.style.display = 'none';
    if (camMenu) camMenu.style.display = 'none';
    _clearItinQueryPhoto();
    if (_itinQueryObserver) { _itinQueryObserver.disconnect(); _itinQueryObserver = null; }
    if (typeof salma === 'undefined') return;
    // Si Salma está respondiendo (p. ej. aplicando un cambio a la guía), NO soltar aún el modo popup:
    // la petición sigue en marcha aunque se cierre la ventana, y su respuesta debe procesarse como
    // edición de ESTA guía (refrescarla en su sitio), no caer en el chat normal ni contaminar su
    // historial. Se suelta en cuanto termine (tope 2 min por si algo se quedara colgado).
    if (salma._streaming && salma._chatAreaOverride) {
      if (!_itinQueryClosePoll) {
        const t0 = Date.now();
        _itinQueryClosePoll = setInterval(() => {
          if (!salma._streaming || Date.now() - t0 > 120000) _finalizeItinQueryClose();
        }, 300);
      }
      return;
    }
    _finalizeItinQueryClose();
  }

  let _itinQueryClosePoll = null;
  function _finalizeItinQueryClose() {
    if (_itinQueryClosePoll) { clearInterval(_itinQueryClosePoll); _itinQueryClosePoll = null; }
    if (typeof salma === 'undefined') return;
    salma._chatAreaOverride = null;
    if (salma._prevHistoryBackup) {
      salma.history = salma._prevHistoryBackup;
      salma._prevHistoryBackup = null;
    }
  }

  function _sendItinQuery() {
    const input = document.getElementById('itin-query-input');
    const answer = document.getElementById('itin-query-answer');
    if (typeof salma === 'undefined') return;
    const msg = input ? input.value.trim() : '';
    const hasPendingPhoto = !!salma._pendingPhoto;
    if (!msg && !hasPendingPhoto) return;
    if (salma.isBusyNotify()) return;   // Salma responde: se puede seguir escribiendo, no enviar ni vaciar la caja
    if (input) { input.value = ''; input.style.height = 'auto'; }
    const hint = answer && answer.querySelector('.itin-chat-hint');
    if (hint) hint.remove();
    _hideItinQueryPhotoPreview();
    salma.send(msg);
  }

  // ═══ FOTO EN EL POPUP DE CONSULTA — reutiliza _pendingPhoto/_compressImage
  // de salma.js (mismo objeto que lee salma.send()), pero con su propia
  // preview: la del chat normal (#chat-photo-preview) queda tapada detrás
  // del overlay y el usuario no la vería.
  async function _handleItinPhotoSelected(file) {
    if (typeof salma === 'undefined' || !file) return;
    if (!file.type.startsWith('image/')) {
      if (typeof showToast === 'function') showToast('Solo se permiten imágenes');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      if (typeof showToast === 'function') showToast('Imagen demasiado grande (máx 10MB)');
      return;
    }
    try {
      const blob = await salma._compressImage(file, 1024, 0.8);
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      const localUrl = URL.createObjectURL(blob);
      salma._pendingPhoto = { blob, base64, localUrl };
      const preview = document.getElementById('itin-query-photo-preview');
      const thumb = document.getElementById('itin-query-photo-thumb');
      if (preview && thumb) { thumb.src = localUrl; preview.style.display = ''; }
    } catch (e) {
      console.error('[Salma] Error procesando foto (popup itinerario):', e);
      if (typeof showToast === 'function') showToast('Error al procesar la foto');
    }
  }

  function _hideItinQueryPhotoPreview() {
    const preview = document.getElementById('itin-query-photo-preview');
    if (preview) preview.style.display = 'none';
  }

  function _clearItinQueryPhoto() {
    if (typeof salma !== 'undefined' && salma._pendingPhoto?.localUrl) {
      URL.revokeObjectURL(salma._pendingPhoto.localUrl);
    }
    if (typeof salma !== 'undefined') salma._pendingPhoto = null;
    _hideItinQueryPhotoPreview();
  }
  // El micro (app.js, sistema de dictado compartido) llama a esta misma
  // función al terminar de hablar — necesita encontrarla en window.
  window._sendItinQuery = _sendItinQuery;

  // Cierre "de verdad" (✕ / itin:close / Ir al mapa): desmonta y consume
  // la entrada de historial. El botón atrás llega por popModal → _teardownItinView.
  function closeItinerarioView() {
    if (!window._itinViewOpen) return;
    _teardownItinView();
    if (window.popModal) window.popModal('itinerario');
  }

  window.openItinerarioView = openItinerarioView;
  document.addEventListener('itin:close', closeItinerarioView);
})();
