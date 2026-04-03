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
  _copilotActive: false,

  // Colores por día
  _dayColors: ['#D4A843', '#E87040', '#5CB85C', '#5BC0DE', '#D9534F', '#AA66CC', '#FF8C00'],

  // ═══ INIT ═══
  init(containerId, stops) {
    const el = document.getElementById(containerId);
    if (!el || !stops || !stops.length) return;

    this._currentContainerId = containerId;
    this._currentStops = stops;
    this.destroy();

    if (this._copilotActive) {
      this._initGoogleMaps(containerId, stops);
    } else {
      this._renderStaticMap(containerId, stops);
    }

    this._renderCopilotFab(containerId);
    if (this._copilotActive) {
      this._renderTurnPanel(containerId);
      this._renderChatSheet();
    } else {
      this._removeChatSheet();
    }
  },

  // ═══ FAB COPILOTO ═══
  _renderCopilotFab(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    // Eliminar FAB anterior si existía
    const old = el.querySelector('.copilot-fab');
    if (old) old.remove();

    const fab = document.createElement('button');
    fab.id = 'copilot-fab';
    fab.className = `copilot-fab ${this._copilotActive ? 'copilot-fab-on' : 'copilot-fab-off'}`;
    fab.setAttribute('aria-label', 'Copiloto');
    fab.title = this._copilotActive ? 'Copiloto activo' : 'Activar Copiloto';
    fab.innerHTML = `
      <svg class="copilot-fab-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
      <span class="copilot-fab-label">${this._copilotActive ? 'ON' : 'COPILOTO'}</span>
    `;
    fab.addEventListener('click', () => {
      if (typeof window.toggleCopilot === 'function') window.toggleCopilot();
    });
    el.appendChild(fab);
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

    el.innerHTML = `<img src="${url}" class="static-map-img" alt="Mapa de ruta">
      <div class="static-map-badge">Activa el Copiloto para navegar 🧭</div>`;

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
        if (!el || this._copilotActive) return; // Puede que Copiloto se activó mientras cargaba

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

    // Cargar Maps JS si no está cargado aún, luego inicializar
    (window._loadGoogleMaps ? window._loadGoogleMaps() : Promise.reject('no loader'))
      .then(() => this._buildGoogleMap(el, valid))
      .catch(() => {
        // Fallback a Leaflet si Maps JS no carga
        this._mapType = 'leaflet';
        this._buildLeafletMap(el, valid);
      });
  },

  _buildGoogleMap(el, valid) {
    if (!window.google || !window.google.maps) return;

    // Dark style con colores Salma
    const darkStyle = [
      { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
      { featureType: 'poi', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
    ];

    const center = { lat: valid[0].lat, lng: valid[0].lng };
    this._map = new google.maps.Map(el, {
      center,
      zoom: 7,
      styles: darkStyle,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      mapTypeId: 'roadmap',
    });

    // Traffic layer
    new google.maps.TrafficLayer().setMap(this._map);

    // Advanced Markers numerados por día
    const { AdvancedMarkerElement } = google.maps.marker || {};
    this._markers = valid.map((stop, i) => {
      const color = this._dayColors[((stop.day || 1) - 1) % this._dayColors.length];
      const pin = document.createElement('div');
      pin.className = 'itin-marker-pin';
      pin.style.cssText = `background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
        border:2px solid rgba(255,255,255,.8);box-shadow:0 2px 8px rgba(0,0,0,.4);`;
      pin.innerHTML = `<span style="transform:rotate(45deg);color:#fff;font-size:12px;font-weight:700;font-family:monospace">${i + 1}</span>`;

      let marker;
      if (AdvancedMarkerElement) {
        marker = new AdvancedMarkerElement({
          map: this._map,
          position: { lat: stop.lat, lng: stop.lng },
          title: stop.headline || stop.name || `Parada ${i + 1}`,
          content: pin,
        });
        marker.addListener('click', () => {
          this.highlightMarker(i);
          document.dispatchEvent(new CustomEvent('itin:marker-click', { detail: { index: i } }));
        });
      } else {
        // Fallback: legacy marker
        marker = new google.maps.Marker({
          map: this._map,
          position: { lat: stop.lat, lng: stop.lng },
          title: stop.headline || stop.name || `Parada ${i + 1}`,
          label: { text: String(i + 1), color: '#fff', fontSize: '12px', fontWeight: '700' },
        });
        marker.addListener('click', () => {
          this.highlightMarker(i);
          document.dispatchEvent(new CustomEvent('itin:marker-click', { detail: { index: i } }));
        });
      }
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

    // Cargar ruta real con DirectionsRenderer
    if (valid.length >= 2) {
      this._loadDirectionsRenderer(valid);
    }
  },

  // DirectionsRenderer — dibuja la ruta real con flechas de giro
  _loadDirectionsRenderer(valid) {
    const origin = `${valid[0].lat},${valid[0].lng}`;
    const dest = `${valid[valid.length - 1].lat},${valid[valid.length - 1].lng}`;
    let waypoints = '';
    if (valid.length > 2) {
      waypoints = valid.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
    }

    let url = `${window.SALMA_API}/directions?origin=${origin}&destination=${dest}&steps=1`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.polyline || !this._map || this._mapType !== 'google') return;

        // Eliminar polyline provisional
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

        // Guardar steps y actualizar panel turn-by-turn
        if (data.steps && data.steps.length) {
          this._steps = data.steps;
          this._currentStep = 0;
          this._updateTurnPanel();
        }
      })
      .catch(() => {});
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

    // Centrar mapa en posición actual si Google Maps
    if (this._map && this._mapType === 'google' && window.google) {
      this._map.panTo({ lat: latitude, lng: longitude });
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

  // ═══ CHAT BOTTOM SHEET (Copiloto ON) ═══
  _chatExpanded: false,

  _renderChatSheet() {
    if (document.getElementById('copilot-chat-sheet')) return;

    const sheet = document.createElement('div');
    sheet.id = 'copilot-chat-sheet';
    sheet.className = 'copilot-chat-sheet';
    sheet.innerHTML = `
      <div class="ccs-handle" id="ccs-handle">
        <div class="ccs-handle-bar"></div>
        <span class="ccs-handle-label">
          <img src="/salma_ai_avatar.png" class="ccs-avatar" alt="Salma">
          Salma · Pídeme algo
        </span>
      </div>
      <div class="ccs-body" id="ccs-body">
        <div class="ccs-messages" id="ccs-messages"></div>
        <div class="ccs-input-row">
          <input type="text" class="ccs-input" id="ccs-input" placeholder="Añade una parada, cambia el plan…" autocomplete="off">
          <button class="ccs-send" id="ccs-send" aria-label="Enviar">›</button>
        </div>
      </div>`;
    document.getElementById('itin-view').appendChild(sheet);

    // Toggle expandir/colapsar
    document.getElementById('ccs-handle').addEventListener('click', () => {
      this._chatExpanded = !this._chatExpanded;
      sheet.classList.toggle('ccs-expanded', this._chatExpanded);
      if (this._chatExpanded) document.getElementById('ccs-input').focus();
    });

    // Enviar mensaje a Salma
    const doSend = () => {
      const input = document.getElementById('ccs-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      this._addChatMessage('user', text);
      if (typeof salma !== 'undefined') {
        salma.sendFromCopilot(text, msg => this._addChatMessage('salma', msg));
      }
    };
    document.getElementById('ccs-send').addEventListener('click', doSend);
    document.getElementById('ccs-input').addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
  },

  _addChatMessage(role, text) {
    const msgs = document.getElementById('ccs-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = `ccs-msg ccs-msg-${role}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    // Expandir el sheet cuando llega una respuesta
    if (role === 'salma') {
      const sheet = document.getElementById('copilot-chat-sheet');
      if (sheet && !this._chatExpanded) {
        this._chatExpanded = true;
        sheet.classList.add('ccs-expanded');
      }
    }
  },

  _removeChatSheet() {
    const sheet = document.getElementById('copilot-chat-sheet');
    if (sheet) sheet.remove();
    this._chatExpanded = false;
  },

  // ═══ ACTIVAR / DESACTIVAR COPILOTO ═══
  activateCopilot() {
    if (this._copilotActive) return;
    this._copilotActive = true;
    if (this._currentContainerId && this._currentStops.length) {
      this.init(this._currentContainerId, this._currentStops);
    } else {
      this._updateFab();
    }
  },

  deactivateCopilot() {
    if (!this._copilotActive) return;
    this._copilotActive = false;
    this._stopGpsTracking();
    this._removeChatSheet();
    if (this._currentContainerId && this._currentStops.length) {
      this.init(this._currentContainerId, this._currentStops);
    } else {
      this._updateFab();
    }
  },

  _updateFab() {
    const fab = document.getElementById('copilot-fab');
    if (!fab) return;
    fab.className = `copilot-fab ${this._copilotActive ? 'copilot-fab-on' : 'copilot-fab-off'}`;
    fab.title = this._copilotActive ? 'Copiloto activo' : 'Activar Copiloto';
    fab.querySelector('.copilot-fab-label').textContent = this._copilotActive ? 'ON' : 'COPILOTO';
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
    // Limpiar contenedor si tiene imagen estática
    if (this._currentContainerId) {
      const el = document.getElementById(this._currentContainerId);
      if (el && el.querySelector('.static-map-img')) el.innerHTML = '';
    }
  },
};
