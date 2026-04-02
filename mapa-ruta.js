/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — mapa-ruta.js
   Mapa de itinerario: marcadores numerados,
   polyline y sincronización con cards
   ═══════════════════════════════════════════ */

const mapaRuta = {
  _map: null,
  _markers: [],
  _polyline: null,
  _activeIdx: -1,

  // Colores por día
  _dayColors: ['#D4A843', '#E87040', '#5CB85C', '#5BC0DE', '#D9534F', '#AA66CC', '#FF8C00'],

  // ═══ INIT ═══
  init(containerId, stops) {
    const el = document.getElementById(containerId);
    if (!el || !stops || !stops.length) return;

    // Limpiar mapa anterior
    this.destroy();

    const valid = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
    if (!valid.length) { el.style.display = 'none'; return; }

    const bounds = L.latLngBounds(valid.map(s => [s.lat, s.lng]));
    this._map = L.map(el, {
      scrollWheelZoom: true,
      zoomControl: true,
      attributionControl: false,
      maxBounds: bounds.pad(0.5),
      maxBoundsViscosity: 0.7,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18
    }).addTo(this._map);

    // Marcadores numerados
    this._markers = valid.map((stop, i) => {
      const dayIdx = (stop.day || 1) - 1;
      const color = this._dayColors[dayIdx % this._dayColors.length];
      const icon = L.divIcon({
        className: 'itin-marker',
        html: `<div class="itin-marker-pin" style="background:${color}"><span>${i + 1}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(this._map);
      marker._stopIndex = i;

      marker.on('click', () => {
        this.highlightMarker(i);
        // Emitir evento para que mapa-itinerario resalte la card
        document.dispatchEvent(new CustomEvent('itin:marker-click', { detail: { index: i } }));
      });

      return marker;
    });

    // Polyline conectando todos los stops
    const latlngs = valid.map(s => [s.lat, s.lng]);
    this._polyline = L.polyline(latlngs, {
      color: '#D4A843',
      weight: 2.5,
      opacity: 0.6,
      dashArray: '8 6',
    }).addTo(this._map);

    this._map.fitBounds(bounds, { padding: [40, 40] });

    // Cargar polyline real de Google Directions si hay 2+ stops
    if (valid.length >= 2) {
      this._loadRealPolyline(valid);
    }
  },

  // ═══ POLYLINE REAL (Google Directions) ═══
  _loadRealPolyline(stops) {
    const origin = `${stops[0].lat},${stops[0].lng}`;
    const dest = `${stops[stops.length - 1].lat},${stops[stops.length - 1].lng}`;
    let waypoints = '';
    if (stops.length > 2) {
      waypoints = stops.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
    }

    let url = `${window.SALMA_API}/directions?origin=${origin}&destination=${dest}`;
    if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.polyline || !this._map) return;
        const decoded = this._decodePolyline(data.polyline);
        if (this._polyline) this._map.removeLayer(this._polyline);
        this._polyline = L.polyline(decoded, {
          color: '#D4A843',
          weight: 3,
          opacity: 0.7,
        }).addTo(this._map);
      })
      .catch(() => {}); // Mantener polyline recta como fallback
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

  // ═══ RESALTAR MARCADOR ═══
  highlightMarker(index) {
    if (this._activeIdx === index) return;

    // Quitar resaltado anterior
    if (this._activeIdx >= 0 && this._markers[this._activeIdx]) {
      const prev = this._markers[this._activeIdx];
      const pin = prev.getElement()?.querySelector('.itin-marker-pin');
      if (pin) pin.classList.remove('active');
    }

    this._activeIdx = index;
    const marker = this._markers[index];
    if (!marker || !this._map) return;

    const pin = marker.getElement()?.querySelector('.itin-marker-pin');
    if (pin) pin.classList.add('active');

    this._map.flyTo(marker.getLatLng(), Math.max(this._map.getZoom(), 13), { duration: 0.5 });
  },

  // ═══ CENTRAR EN STOP ═══
  centerOn(index) {
    this.highlightMarker(index);
  },

  // ═══ RESIZE ═══
  invalidateSize() {
    if (this._map) setTimeout(() => this._map.invalidateSize(), 100);
  },

  // ═══ DESTROY ═══
  destroy() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    this._markers = [];
    this._polyline = null;
    this._activeIdx = -1;
  },
};
