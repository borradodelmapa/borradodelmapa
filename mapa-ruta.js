/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — mapa-ruta.js
   Copiloto OFF → Google Static Maps (imagen)
   Copiloto ON  → Google Maps Dynamic (interactivo)
   ═══════════════════════════════════════════ */

const mapaRuta = {
  _map: null,
  _mapType: null, // 'google' | 'leaflet' | null
  _markers: [],
  _polyline: null,
  _steps: [],
  _activeIdx: -1,
  _currentStops: [],
  _currentContainerId: null,
  _userMarker: null, // Punto azul de ubicación del usuario
  _infoWindow: null, // InfoWindow activo
  _searchMarker: null, // Marker de búsqueda temporal
  _autocomplete: null, // Google Places Autocomplete

  // Colores por día
  _dayColors: ['#D4A843', '#E87040', '#5CB85C', '#5BC0DE', '#D9534F', '#AA66CC', '#FF8C00'],

  // ═══ INIT ═══
  init(containerId, stops, options) {
    const el = document.getElementById(containerId);
    if (!el || !stops || !stops.length) return;

    this._currentContainerId = containerId;
    this._currentStops = stops;
    this._previewMode = !!(options && options.preview);
    this.destroy();

    this._initGoogleMaps(containerId, stops);
  },


  // ═══ MAP CONTROLS (Copiloto ON) ═══
  _renderMapControls(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    this._removeMapControls(containerId);

    const controls = document.createElement('div');
    controls.className = 'map-controls map-controls-hidden';
    controls.id = 'map-controls';

    // Botón Google Maps (re-centrar)
    const btnMaps = document.createElement('button');
    btnMaps.className = 'map-ctrl-btn map-ctrl-gmaps';
    btnMaps.setAttribute('aria-label', 'Recentrar mapa');
    btnMaps.title = 'Recentrar';
    btnMaps.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
    btnMaps.addEventListener('click', () => {
      if (!this._map || this._mapType !== 'google' || !window.google) return;
      const valid = this._currentStops.filter(s => s.lat && s.lng);
      if (!valid.length) return;
      const bounds = new google.maps.LatLngBounds();
      valid.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
      this._map.fitBounds(bounds, { top: 40, right: 40, bottom: 60, left: 40 });
    });

    // Botón Compartir
    const btnShare = document.createElement('button');
    btnShare.className = 'map-ctrl-btn map-ctrl-share';
    btnShare.setAttribute('aria-label', 'Compartir');
    btnShare.title = 'Compartir';
    btnShare.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
    btnShare.addEventListener('click', async () => {
      let shareUrl = null;
      // Intentar obtener URL pública de la ruta (mismo flujo que guide-renderer)
      try {
        if (typeof salma !== 'undefined' && salma.currentRouteId &&
            typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
          const userDoc = await db.collection('users').doc(currentUser.uid)
            .collection('maps').doc(salma.currentRouteId).get();
          let slug = userDoc.data()?.slug;
          if (!slug && typeof generateSlug === 'function' && typeof publishGuide === 'function') {
            const r = userDoc.data();
            slug = generateSlug(r?.title || r?.name || 'mi-ruta');
            publishGuide(salma.currentRouteId, userDoc.data(), slug, r).catch(() => {});
          }
          if (slug) shareUrl = 'https://borradodelmapa.com/' + slug;
        }
      } catch(e) {}

      if (!shareUrl) shareUrl = window.location.href;

      if (navigator.share) {
        navigator.share({ title: 'Mi ruta de viaje', text: 'Viaja con alguien que sabe lo que hace', url: shareUrl }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareUrl).then(() => {
          btnShare.title = '¡Copiado!';
          setTimeout(() => { btnShare.title = 'Compartir'; }, 2000);
        });
      }
    });

    // Botón Utilidades (menú desplegable)
    const btnUtil = document.createElement('button');
    btnUtil.className = 'map-ctrl-btn map-ctrl-util';
    btnUtil.setAttribute('aria-label', 'Utilidades');
    btnUtil.title = 'Utilidades';
    btnUtil.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;

    const utilMenu = document.createElement('div');
    utilMenu.className = 'map-util-menu';
    utilMenu.id = 'map-util-menu';
    utilMenu.innerHTML = `
      <button class="map-util-item" id="util-satellite">Satélite</button>
      <button class="map-util-item" id="util-terrain">Terreno</button>
      <button class="map-util-item" id="util-roadmap">Mapa</button>
      <div class="map-util-sep"></div>
      <a class="map-util-item" href="https://open.spotify.com" target="_blank" rel="noopener">Spotify</a>
    `;
    btnUtil.addEventListener('click', (e) => {
      e.stopPropagation();
      utilMenu.classList.toggle('map-util-open');
    });
    document.addEventListener('click', () => utilMenu.classList.remove('map-util-open'), { once: false });

    utilMenu.querySelector('#util-satellite')?.addEventListener('click', () => {
      if (this._map && this._mapType === 'google') this._map.setMapTypeId('satellite');
      utilMenu.classList.remove('map-util-open');
    });
    utilMenu.querySelector('#util-terrain')?.addEventListener('click', () => {
      if (this._map && this._mapType === 'google') this._map.setMapTypeId('terrain');
      utilMenu.classList.remove('map-util-open');
    });
    utilMenu.querySelector('#util-roadmap')?.addEventListener('click', () => {
      if (this._map && this._mapType === 'google') this._map.setMapTypeId('roadmap');
      utilMenu.classList.remove('map-util-open');
    });

    // Separador visual
    const sep = document.createElement('div');
    sep.className = 'map-ctrl-sep';

    // Zoom +
    const btnZoomIn = document.createElement('button');
    btnZoomIn.className = 'map-ctrl-btn map-ctrl-zoom';
    btnZoomIn.setAttribute('aria-label', 'Acercar');
    btnZoomIn.title = 'Acercar';
    btnZoomIn.textContent = '+';
    btnZoomIn.addEventListener('click', () => {
      if (this._map && this._mapType === 'google') this._map.setZoom((this._map.getZoom() || 10) + 1);
    });

    // Zoom −
    const btnZoomOut = document.createElement('button');
    btnZoomOut.className = 'map-ctrl-btn map-ctrl-zoom';
    btnZoomOut.setAttribute('aria-label', 'Alejar');
    btnZoomOut.title = 'Alejar';
    btnZoomOut.textContent = '−';
    btnZoomOut.addEventListener('click', () => {
      if (this._map && this._mapType === 'google') this._map.setZoom(Math.max(1, (this._map.getZoom() || 10) - 1));
    });

    controls.appendChild(btnMaps);
    controls.appendChild(btnShare);
    controls.appendChild(btnUtil);
    controls.appendChild(utilMenu);
    controls.appendChild(sep);
    controls.appendChild(btnZoomIn);
    controls.appendChild(btnZoomOut);
    el.appendChild(controls);
  },

  _removeMapControls(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.querySelector('#map-controls')?.remove();
  },

  // ═══ BOTÓN "IR AL MAPA" (modo preview del itinerario) ═══
  _renderGoToMapButton(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.querySelector('.itin-go-to-map')?.remove();

    const btn = document.createElement('button');
    btn.className = 'itin-go-to-map';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> Ir al mapa`;
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('itin:open-live-map'));
    });
    el.appendChild(btn);
  },

  // ═══ COMPASS (brújula sobre el mapa) ═══
  _compassListener: null,
  _deviceOrientationHandler: null,

  _renderCompass(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.querySelector('.map-compass')?.remove();
    this._stopDeviceOrientation();

    // Si el usuario la cerró, no mostrar
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
    el.appendChild(compass);

    const ring = compass.querySelector('.map-compass-ring');

    // Botón cerrar
    compass.querySelector('.map-compass-close').addEventListener('click', (e) => {
      e.stopPropagation();
      compass.remove();
      this._stopDeviceOrientation();
      localStorage.setItem('compass_hidden', '1');
    });

    // Tap en brújula → resetear mapa a norte arriba
    ring.addEventListener('click', () => {
      if (this._map && this._mapType === 'google' && window.google) {
        this._map.setHeading(0);
      }
    });

    // 1) Magnetómetro del móvil — orientación real del teléfono
    this._startDeviceOrientation(ring);

    // 2) Fallback: heading del mapa (3D/tilt en desktop)
    if (this._map && this._mapType === 'google' && window.google) {
      if (this._compassListener) google.maps.event.removeListener(this._compassListener);
      this._compassListener = this._map.addListener('heading_changed', () => {
        // Solo usar heading del mapa si NO hay magnetómetro activo
        if (this._deviceOrientationActive) return;
        const heading = this._map.getHeading() || 0;
        if (ring) ring.style.transform = `rotate(${-heading}deg)`;
      });
    }
  },

  _deviceOrientationActive: false,

  _startDeviceOrientation(ring) {
    if (!ring) return;

    const onOrientation = (e) => {
      // webkitCompassHeading (iOS) o alpha (Android)
      let heading = null;
      if (typeof e.webkitCompassHeading === 'number') {
        heading = e.webkitCompassHeading; // iOS: 0=Norte, ya es heading magnético
      } else if (typeof e.alpha === 'number' && e.absolute) {
        heading = 360 - e.alpha; // Android absolute: convertir a heading
      } else if (typeof e.alpha === 'number') {
        heading = 360 - e.alpha; // Android relative: aproximación
      }
      if (heading === null) return;
      this._deviceOrientationActive = true;
      ring.style.transform = `rotate(${-heading}deg)`;
    };

    // iOS 13+ requiere permiso explícito
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Pedir permiso al primer toque en la brújula
      const compass = ring.closest('.map-compass');
      if (compass) {
        const askPermission = () => {
          DeviceOrientationEvent.requestPermission()
            .then(state => {
              if (state === 'granted') {
                this._deviceOrientationHandler = onOrientation;
                window.addEventListener('deviceorientation', onOrientation, true);
              }
            })
            .catch(() => {});
          compass.removeEventListener('click', askPermission);
        };
        compass.addEventListener('click', askPermission);
      }
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
      // Android y otros: directamente
      this._deviceOrientationHandler = onOrientation;
      window.addEventListener('deviceorientation', onOrientation, true);
    }
  },

  _stopDeviceOrientation() {
    if (this._deviceOrientationHandler) {
      window.removeEventListener('deviceorientation', this._deviceOrientationHandler, true);
      this._deviceOrientationHandler = null;
    }
    this._deviceOrientationActive = false;
  },

  // ═══ SEARCH BAR (buscador sobre el mapa) ═══
  _renderSearchBar(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.querySelector('#map-search-bar')?.remove();

    const bar = document.createElement('div');
    bar.className = 'map-search-bar map-search-hidden';
    bar.id = 'map-search-bar';
    bar.innerHTML = `
      <div class="map-search-row input-row">
        <svg class="map-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="map-search-input" id="map-search-input" placeholder="Buscar lugar..." autocomplete="off">
        <button class="app-mic map-search-mic" aria-label="Buscar con voz">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="1" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </button>
      </div>
      <div class="map-search-hint">Pregunta a Salma: restaurantes, hoteles, farmacias...</div>`;
    el.appendChild(bar);

    const input = document.getElementById('map-search-input');
    if (!input || !window.google || !google.maps.places) return;

    // Google Places Autocomplete
    this._autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['geometry', 'name', 'formatted_address', 'place_id'],
      types: ['establishment', 'geocode'],
    });
    this._autocomplete.addListener('place_changed', () => {
      const place = this._autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      const pos = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      this._map.panTo(pos);
      this._map.setZoom(15);
      this._addSearchMarker(pos, place.name || place.formatted_address);
    });

    // Enter → detectar servicios y enviar a Salma
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._handleSearchSubmit(input.value.trim());
        input.value = '';
      }
    });

    // Evento del mic (app.js dispatch)
    this._searchSubmitHandler = (e) => this._handleSearchSubmit(e.detail.query);
    document.addEventListener('map:search-submit', this._searchSubmitHandler);
  },

  _addSearchMarker(pos, title) {
    if (this._searchMarker) this._searchMarker.setMap(null);
    this._searchMarker = new google.maps.Marker({
      map: this._map,
      position: pos,
      title: title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#f0b429',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
        scale: 12,
      },
      animation: google.maps.Animation.DROP,
      zIndex: 1000,
    });
  },

  _handleSearchSubmit(query) {
    if (!query) return;
    const servicePattern = /restaurante|hotel|hostal|grúa|grua|embajada|farmacia|hospital|gasolina|cajero|supermercado|policia|policía|taxi|bus|tren|aeropuerto|parking/i;
    if (servicePattern.test(query)) {
      if (typeof salma !== 'undefined') salma.send(query);
    }
  },

  // ═══ STATIC MAPS (Copiloto OFF) ═══
  _renderStaticMap(containerId, stops) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const valid = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (!valid.length) { el.style.display = 'none'; return; }

    const KEY = 'AIzaSyCtNPO5QVnLpHPkaJraQM0M71RXqAJ6L4U';
    // offsetWidth/offsetHeight puede ser 0 si el contenedor aún no se ha pintado
    const w = el.offsetWidth > 10 ? el.offsetWidth : 640;
    const h = el.offsetHeight > 10 ? el.offsetHeight : 380;
    const size = `${Math.min(w, 640)}x${Math.min(h, 400)}`;

    // Marcadores numerados con color por día
    const markers = valid.map((s, i) => {
      const hex = this._dayColors[((s.day || 1) - 1) % this._dayColors.length].replace('#', '0x');
      return `markers=color:${hex}|label:${i + 1}|${s.lat},${s.lng}`;
    }).join('&');

    // Ruta como línea recta inicial
    const pathCoords = valid.map(s => `${s.lat},${s.lng}`).join('|');
    const path = `path=color:0xD4A843CC|weight:3|${pathCoords}`;

    // Dark style Salma (colores suficientemente contrastados para ser visibles)
    const styles = [
      'style=feature:all|element:geometry|color:0x242424',
      'style=feature:road|element:geometry|color:0x4a5568',
      'style=feature:road.highway|element:geometry|color:0x6b7280',
      'style=feature:water|element:geometry|color:0x1e3a5f',
      'style=feature:landscape|element:geometry|color:0x2d3748',
      'style=feature:poi|element:all|visibility:off',
      'style=feature:transit|element:all|visibility:off',
      'style=feature:all|element:labels.text.fill|color:0xb0b0b0',
      'style=feature:all|element:labels.text.stroke|color:0x1a1a1a',
    ].join('&');

    const url = `https://maps.googleapis.com/maps/api/staticmap?size=${size}&scale=2&${markers}&${path}&${styles}&key=${KEY}`;

    el.innerHTML = `<img src="${url}" class="static-map-img" alt="Mapa de ruta">`;

    // Cargar polyline real y actualizar imagen
    if (valid.length >= 2) {
      this._loadPolylineForStatic(containerId, valid, markers, styles, KEY, size);
    }
  },

  // Carga polyline real de Directions API y actualiza el Static Map
  _loadPolylineForStatic(containerId, valid, markers, styles, KEY, size) {
    const origin = `${valid[0].lat},${valid[0].lng}`;
    const dest = `${valid[valid.length - 1].lat},${valid[valid.length - 1].lng}`;
    let waypoints = '';
    if (valid.length > 2) {
      waypoints = valid.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
    }

    let url = `${window.SALMA_API}/directions?origin=${origin}&destination=${dest}`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.polyline) return;
        const el = document.getElementById(containerId);
        if (!el) return;

        const path = `path=enc:${encodeURIComponent(data.polyline)}`;
        const imgUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${size}&scale=2&${markers}&${path}&${styles}&key=${KEY}`;

        const img = el.querySelector('.static-map-img');
        if (img) img.src = imgUrl;
      })
      .catch(() => {}); // Mantener línea recta como fallback
  },

  // ═══ GOOGLE MAPS DYNAMIC (Copiloto ON) ═══
  _initGoogleMaps(containerId, stops) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const valid = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (!valid.length) { el.style.display = 'none'; return; }

    el.innerHTML = ''; // Limpiar imagen estática
    this._mapType = 'google';

    // Lanzar fetch de directions EN PARALELO con la carga del API
    const dirPromise = valid.length >= 2 ? this._fetchDirections(valid) : null;

    // Cargar Maps JS si no está cargado aún, luego inicializar
    (window._loadGoogleMaps ? window._loadGoogleMaps() : Promise.reject('no loader'))
      .then(() => this._buildGoogleMap(el, valid, dirPromise))
      .catch(() => {
        // Fallback a Leaflet si Maps JS no carga
        this._mapType = 'leaflet';
        this._buildLeafletMap(el, valid);
      });
  },

  _buildGoogleMap(el, valid, dirPromise) {
    if (!window.google || !window.google.maps) return;

    const center = { lat: valid[0].lat, lng: valid[0].lng };
    this._map = new google.maps.Map(el, {
      center,
      zoom: 7,
      heading: 0,                    // Norte arriba siempre al cargar
      tiltInteractionEnabled: false, // Bloquear tilt 3D accidental
      styles: window._mapStyle || [],
      disableDefaultUI: true,
      zoomControl: false,
      gestureHandling: 'greedy',
      mapTypeId: 'roadmap',
    });

    // Legacy markers numerados por día (no requieren Map ID)
    this._markers = valid.map((stop, i) => {
      const color = this._dayColors[((stop.day || 1) - 1) % this._dayColors.length];
      const marker = new google.maps.Marker({
        map: this._map,
        position: { lat: stop.lat, lng: stop.lng },
        title: stop.headline || stop.name || `Parada ${i + 1}`,
        label: { text: String(i + 1), color: '#fff', fontSize: '12px', fontWeight: '700' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 14,
        },
      });
      marker.addListener('click', () => {
        this.highlightMarker(i);
        this._showStopPanel(i);
        document.dispatchEvent(new CustomEvent('itin:marker-click', { detail: { index: i } }));
      });
      marker._latLng = { lat: stop.lat, lng: stop.lng };
      return marker;
    });

    // Polyline provisional recta
    this._polyline = new google.maps.Polyline({
      path: valid.map(s => ({ lat: s.lat, lng: s.lng })),
      map: this._map,
      strokeColor: '#D4A843',
      strokeWeight: 3,
      strokeOpacity: 0.6,
      icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 3, strokeColor: '#D4A843' }, repeat: '80px' }],
    });

    // Ajustar bounds
    const bounds = new google.maps.LatLngBounds();
    valid.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
    this._map.fitBounds(bounds, { top: 40, right: 40, bottom: 60, left: 40 });

    // Aplicar ruta real (pre-fetched en paralelo o fetch ahora)
    if (dirPromise) {
      dirPromise.then(data => this._applyDirections(data)).catch(() => {});
    } else if (valid.length >= 2) {
      this._fetchDirections(valid).then(data => this._applyDirections(data)).catch(() => {});
    }

    // Controles DESPUÉS del mapa (evita que innerHTML='' los borre)
    // En modo preview (itinerario) no se renderizan controles — solo el botón "Ir al mapa"
    if (!this._previewMode) {
      this._renderMapControls(this._currentContainerId);
      this._renderCompass(this._currentContainerId);
      this._renderSearchBar(this._currentContainerId);

      // Tap en mapa → revelar controles y buscador
      this._map.addListener('click', () => {
        const ctrl = document.getElementById('map-controls');
        if (ctrl) ctrl.classList.remove('map-controls-hidden');
        const sb = document.getElementById('map-search-bar');
        if (sb) sb.classList.remove('map-search-hidden');
      });
    } else {
      this._renderGoToMapButton(this._currentContainerId);
    }
  },

  // Fetch de directions (separado para poder lanzar en paralelo)
  _fetchDirections(valid) {
    const origin = `${valid[0].lat},${valid[0].lng}`;
    const dest = `${valid[valid.length - 1].lat},${valid[valid.length - 1].lng}`;
    let waypoints = '';
    if (valid.length > 2) {
      waypoints = valid.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
    }
    let url = `${window.SALMA_API}/directions?origin=${origin}&destination=${dest}&steps=1`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
    return fetch(url).then(r => r.json());
  },

  // Aplicar polyline real + steps turn-by-turn
  _applyDirections(data) {
    if (!data.polyline || !this._map || this._mapType !== 'google') return;

    if (this._polyline) this._polyline.setMap(null);

    const decoded = this._decodePolyline(data.polyline);
    this._polyline = new google.maps.Polyline({
      path: decoded.map(([lat, lng]) => ({ lat, lng })),
      map: this._map,
      strokeColor: '#D4A843',
      strokeWeight: 3,
      strokeOpacity: 0.85,
      icons: [{ icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 3, strokeColor: '#D4A843' }, repeat: '80px' }],
    });

    if (data.steps && data.steps.length) {
      this._steps = data.steps;
      this._currentStep = 0;
      this._updateTurnPanel();
    }
  },

  // Fallback Leaflet si Google Maps falla
  _buildLeafletMap(el, valid) {
    const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
    this._map = L.map(el, { scrollWheelZoom: true, zoomControl: false, attributionControl: false });
    L.control.zoom({ position: 'bottomleft' }).addTo(this._map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 18 }).addTo(this._map);

    this._markers = valid.map((stop, i) => {
      const color = this._dayColors[((stop.day || 1) - 1) % this._dayColors.length];
      const icon = L.divIcon({
        className: 'itin-marker',
        html: `<div class="itin-marker-pin" style="background:${color}"><span>${i + 1}</span></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32],
      });
      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(this._map);
      marker.on('click', () => {
        this.highlightMarker(i);
        document.dispatchEvent(new CustomEvent('itin:marker-click', { detail: { index: i } }));
      });
      marker._latLng = { lat: stop.lat, lng: stop.lng };
      return marker;
    });

    this._polyline = L.polyline(valid.map(s => [s.lat, s.lng]), { color: '#D4A843', weight: 3, opacity: 0.7, dashArray: '8 6' }).addTo(this._map);
    this._map.fitBounds(bounds, { padding: [40, 40] });

    // En modo preview (itinerario) solo botón "Ir al mapa"
    if (!this._previewMode) {
      this._renderMapControls(this._currentContainerId);
    } else {
      this._renderGoToMapButton(this._currentContainerId);
    }
  },

  // ═══ DECODE GOOGLE POLYLINE ═══
  _decodePolyline(encoded) {
    const points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += (result & 1) ? ~(result >> 1) : (result >> 1);
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += (result & 1) ? ~(result >> 1) : (result >> 1);
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  },

  // ═══ PANEL TURN-BY-TURN ═══
  _currentStep: 0,
  _gpsWatchId: null,

  _renderTurnPanel(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const old = el.querySelector('.turn-panel');
    if (old) old.remove();

    const panel = document.createElement('div');
    panel.className = 'turn-panel';
    panel.id = 'turn-panel';
    panel.innerHTML = `
      <div class="turn-panel-content">
        <div class="turn-maneuver" id="turn-maneuver">▶</div>
        <div class="turn-info">
          <div class="turn-instruction" id="turn-instruction">Calculando ruta…</div>
          <div class="turn-meta" id="turn-meta"></div>
        </div>
      </div>`;
    el.appendChild(panel);

    // Activar GPS para avance automático
    this._currentStep = 0;
    this._startGpsTracking();
  },

  _updateTurnPanel() {
    const steps = this._steps;
    if (!steps || !steps.length) return;
    const step = steps[Math.min(this._currentStep, steps.length - 1)];
    if (!step) return;

    const instrEl = document.getElementById('turn-instruction');
    const metaEl = document.getElementById('turn-meta');
    const manEl = document.getElementById('turn-maneuver');
    if (instrEl) instrEl.textContent = step.instruction;
    if (metaEl) metaEl.textContent = [step.distance, step.duration].filter(Boolean).join(' · ');
    if (manEl) manEl.textContent = this._maneuverIcon(step.maneuver);
  },

  _maneuverIcon(maneuver) {
    const icons = {
      'turn-left': '↰', 'turn-right': '↱', 'turn-slight-left': '↖', 'turn-slight-right': '↗',
      'turn-sharp-left': '⬅', 'turn-sharp-right': '➡', 'uturn-left': '↩', 'uturn-right': '↪',
      'roundabout-left': '↺', 'roundabout-right': '↻', 'straight': '↑', 'merge': '⤵',
      'ramp-left': '↖', 'ramp-right': '↗', 'fork-left': '↖', 'fork-right': '↗',
      'ferry': '⛴', 'keep-left': '↖', 'keep-right': '↗',
    };
    return icons[maneuver] || '▶';
  },

  _startGpsTracking() {
    if (!navigator.geolocation) return;
    if (this._gpsWatchId) navigator.geolocation.clearWatch(this._gpsWatchId);

    this._gpsWatchId = navigator.geolocation.watchPosition(
      pos => this._onGpsUpdate(pos),
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  },

  _onGpsUpdate(pos) {
    const { latitude, longitude } = pos.coords;

    // Mostrar punto azul de usuario SIN mover el mapa
    if (this._map && this._mapType === 'google' && window.google) {
      const userPos = { lat: latitude, lng: longitude };
      if (this._userMarker) {
        this._userMarker.setPosition(userPos);
      } else {
        this._userMarker = new google.maps.Marker({
          map: this._map,
          position: userPos,
          title: 'Tu ubicación',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
            scale: 9,
          },
          zIndex: 999,
        });
      }
    }

    // Avanzar step si el usuario está cerca del end_location del step actual
    const steps = this._steps;
    if (!steps || !steps.length) return;
    const step = steps[this._currentStep];
    if (!step || !step.end_location) return;

    const dist = this._haversine(latitude, longitude, step.end_location.lat, step.end_location.lng);
    if (dist < 50 && this._currentStep < steps.length - 1) { // < 50m del punto de giro
      this._currentStep++;
      this._updateTurnPanel();
    }
  },

  _stopGpsTracking() {
    if (this._gpsWatchId) {
      navigator.geolocation.clearWatch(this._gpsWatchId);
      this._gpsWatchId = null;
    }
  },

  _haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  _removeChatSheet() {
    document.getElementById('copilot-chat-sheet')?.remove();
  },

  activateCopilot() {},
  deactivateCopilot() {},

  // ═══ INFO PARADA — InfoWindow nativo Google Maps ═══
  _showStopPanel(index) {
    const stop = this._currentStops[index];
    if (!stop || !this._map || this._mapType !== 'google' || !window.google) return;

    const marker = this._markers[index];
    if (!marker) return;

    const gmapsUrl = stop.place_id
      ? `https://www.google.com/maps/place/?q=place_id:${stop.place_id}`
      : `https://www.google.com/maps?q=${stop.lat},${stop.lng}`;
    const dayColor = this._dayColors ? this._dayColors[((stop.day || 1) - 1) % this._dayColors.length] : '#D4A843';

    const _buildContent = (photoHtml) => `
      <div style="font-family:'Inter',sans-serif;width:280px;max-height:380px;background:#0c0a06;border-radius:10px;overflow:hidden;color:#f4efe6;display:flex;flex-direction:column;">
        ${photoHtml}
        <div style="padding:12px 14px 14px;overflow-y:auto;flex:1;">
          <div style="font-size:10px;color:#D4A843;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Día ${stop.day || ''}</div>
          <div style="font-size:15px;font-weight:700;margin-bottom:6px;line-height:1.3;">${stop.headline || stop.name || ''}</div>
          ${stop.narrative ? `<p style="font-size:12px;color:rgba(244,239,230,.65);line-height:1.5;margin:0 0 10px;">${stop.narrative}</p>` : ''}
          ${stop.context ? `<p style="font-size:11px;color:rgba(244,239,230,.5);line-height:1.4;margin:0 0 8px;">📖 ${stop.context}</p>` : ''}
          ${stop.food_nearby ? `<p style="font-size:11px;color:rgba(244,239,230,.5);line-height:1.4;margin:0 0 8px;">🍜 ${stop.food_nearby}</p>` : ''}
          ${stop.local_secret ? `<p style="font-size:11px;color:rgba(244,239,230,.5);line-height:1.4;margin:0 0 8px;">🔑 ${stop.local_secret}</p>` : ''}
          <a href="${gmapsUrl}" target="_blank" rel="noopener"
             style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;
                    color:#f4efe6;text-decoration:none;padding:5px 10px;border-radius:6px;
                    background:rgba(66,133,244,.15);border:1px solid rgba(66,133,244,.3);">
            <svg width="12" height="12" viewBox="0 0 24 24"><path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle fill="#fff" cx="12" cy="9" r="2.5"/></svg>
            Ver en Google Maps
          </a>
        </div>
      </div>`;

    const _photoImgHtml = (url) => `<img src="${url}"
      style="width:100%;height:160px;object-fit:cover;display:block;border-radius:8px 8px 0 0;flex-shrink:0;"
      onerror="this.style.display='none'">`;

    // Placeholder de color mientras carga la foto
    const placeholderHtml = `<div style="width:100%;height:160px;flex-shrink:0;background:linear-gradient(135deg,${dayColor}44,${dayColor}11);border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="${dayColor}" fill-opacity=".2"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${dayColor}" fill-opacity=".7"/><circle cx="12" cy="9" r="2.5" fill="#fff" fill-opacity=".9"/></svg>
    </div>`;

    // Cerrar el anterior y abrir con placeholder
    if (this._infoWindow) this._infoWindow.close();
    this._infoWindow = new google.maps.InfoWindow({ content: _buildContent(placeholderHtml), disableAutoPan: false });
    this._infoWindow.open(this._map, marker);

    // Cargar foto real vía worker: photo_ref primero, si falla fallback por nombre+coords
    if (window.SALMA_API) {
      const _setPhoto = (url) => {
        if (!this._infoWindow) return;
        this._infoWindow.setContent(_buildContent(_photoImgHtml(url)));
      };
      const _tryByName = () => {
        if (!(stop.name || stop.headline)) return;
        fetch(`${window.SALMA_API}/photo?name=${encodeURIComponent(stop.name || stop.headline)}&lat=${stop.lat}&lng=${stop.lng}&json=1`)
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.url) _setPhoto(data.url); })
          .catch(() => {});
      };

      if (stop.photo_ref) {
        fetch(`${window.SALMA_API}/photo?ref=${encodeURIComponent(stop.photo_ref)}&json=1`)
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data?.url) _setPhoto(data.url); else _tryByName(); })
          .catch(() => _tryByName());
      } else {
        _tryByName();
      }
    }
  },

  // ═══ RESALTAR MARCADOR ═══
  highlightMarker(index) {
    if (!this._map) return;
    if (this._activeIdx === index) return;
    this._activeIdx = index;

    const marker = this._markers[index];
    if (!marker) return;

    if (this._mapType === 'google' && window.google) {
      // Google Maps: centrar en marker
      const pos = marker._latLng || (marker.position ? { lat: marker.position.lat, lng: marker.position.lng } : null);
      if (pos) this._map.panTo(pos);
    } else if (this._map.flyTo) {
      // Leaflet
      const pin = marker.getElement()?.querySelector('.itin-marker-pin');
      if (pin) pin.classList.add('active');
      this._map.flyTo(marker.getLatLng(), Math.max(this._map.getZoom(), 13), { duration: 0.5 });
    }
  },

  // ═══ CENTRAR EN STOP ═══
  centerOn(index) {
    this.highlightMarker(index);
  },

  // ═══ RESIZE ═══
  invalidateSize() {
    if (!this._map) return;
    if (this._mapType === 'google' && window.google) {
      google.maps.event.trigger(this._map, 'resize');
    } else if (this._map.invalidateSize) {
      setTimeout(() => this._map.invalidateSize(), 100);
    }
  },

  // ═══ DESTROY ═══
  destroy() {
    if (this._map) {
      if (this._mapType === 'google' && window.google) {
        // Google Maps: limpiar markers y polyline
        this._markers.forEach(m => { try { m.map = null; } catch(e) {} });
        if (this._polyline) this._polyline.setMap(null);
      } else if (this._map.remove) {
        this._map.remove();
      }
      this._map = null;
    }
    this._markers = [];
    this._polyline = null;
    this._steps = [];
    this._activeIdx = -1;
    this._mapType = null;
    if (this._userMarker) {
      try { this._userMarker.setMap(null); } catch(e) {}
      this._userMarker = null;
    }
    if (this._infoWindow) {
      try { this._infoWindow.close(); } catch(e) {}
      this._infoWindow = null;
    }
    if (this._compassListener && window.google) {
      try { google.maps.event.removeListener(this._compassListener); } catch(e) {}
      this._compassListener = null;
    }
    this._stopDeviceOrientation();
    if (this._searchMarker) {
      try { this._searchMarker.setMap(null); } catch(e) {}
      this._searchMarker = null;
    }
    this._autocomplete = null;
    if (this._searchSubmitHandler) {
      document.removeEventListener('map:search-submit', this._searchSubmitHandler);
      this._searchSubmitHandler = null;
    }
    // Limpiar contenedor si tiene imagen estática
    if (this._currentContainerId) {
      const el = document.getElementById(this._currentContainerId);
      if (el && el.querySelector('.static-map-img')) el.innerHTML = '';
    }
  },
};
