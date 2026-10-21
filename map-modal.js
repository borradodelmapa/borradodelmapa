// ═══════════════════════════════════════════════════════════════
// map-modal.js — Modal fullscreen con Google Maps JS completo
// Toda la UI nativa de Google: Street View (pegman), layers,
// zoom, tipos de mapa, search. Marker dorado en destino.
// ═══════════════════════════════════════════════════════════════
(function() {
  let _mmMap = null;
  let _mmInfoWindow = null;

  function _injectCSS() {
    if (document.getElementById('mm-css')) return;
    const s = document.createElement('style');
    s.id = 'mm-css';
    s.textContent = `
#mm { position: fixed; inset: 0; z-index: 10000; background: #060503; }
#mm-map { position: absolute; inset: 0; }
#mm-close { position: absolute; top: 14px; right: 14px; width: 42px; height: 42px; border-radius: 50%; background: rgba(0,0,0,0.82); color: #fff; border: none; font-size: 26px; line-height: 1; cursor: pointer; z-index: 12; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
#mm-open { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: #F4630B; color: #060503; border: none; padding: 12px 20px; border-radius: 22px; font-size: 13px; font-weight: 700; cursor: pointer; z-index: 12; box-shadow: 0 4px 14px rgba(0,0,0,0.5); font-family: 'Inter', sans-serif; }
#mm-spinner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #F4630B; font-size: 14px; z-index: 5; font-family: 'Inter', sans-serif; background: rgba(0,0,0,0.7); padding: 10px 16px; border-radius: 8px; }
    `;
    document.head.appendChild(s);
  }

  function _getUserLoc() {
    if (typeof salma !== 'undefined' && salma._userLocation) {
      return { lat: salma._userLocation.lat, lng: salma._userLocation.lng };
    }
    return null;
  }

  function _extractDest(url) {
    let name = '', placeId = null, multiStop = null, multiStopIds = null;
    try {
      if (/\/maps\/dir\/?\?api=1/i.test(url)) {
        const u = new URL(url);
        const origin = u.searchParams.get('origin');
        const destination = u.searchParams.get('destination') || '';
        const waypointsParam = u.searchParams.get('waypoints');
        const originId = u.searchParams.get('origin_place_id');
        const destinationId = u.searchParams.get('destination_place_id');
        const waypointIdsParam = u.searchParams.get('waypoint_place_ids');
        if (origin || waypointsParam) {
          // "Ruta completa" (esquema oficial origin+waypoints+destination). Cada punto puede
          // venir como lat,lng o como nombre+place_id (el Worker manda nombre siempre que
          // tiene place_id validado — ver salma-worker.js buildEnrichedReply). Guardamos los
          // place_id en paralelo para resolver por ellos, no solo por el texto del nombre.
          const points = [];
          const ids = [];
          if (origin) { points.push(origin); ids.push(originId || null); }
          if (waypointsParam) {
            const wps = waypointsParam.split('|').filter(Boolean);
            const wpIds = waypointIdsParam ? waypointIdsParam.split('|') : [];
            wps.forEach((wp, i) => { points.push(wp); ids.push(wpIds[i] || null); });
          }
          if (destination) { points.push(destination); ids.push(destinationId || null); }
          if (points.length >= 2) { multiStop = points; multiStopIds = ids; }
          else { name = destination || origin || ''; placeId = destinationId || originId || null; }
        } else {
          // "Cómo llegar" a un solo destino con place_id
          name = destination;
          placeId = destinationId || null;
        }
      } else if (/\/maps\/dir\/[^?]/i.test(url)) {
        const parts = url.split('/dir/')[1].split('/').filter(Boolean);
        const places = parts.map(p => decodeURIComponent(p.replace(/\+/g, ' ')));
        if (places.length > 0) {
          name = places[places.length - 1];
          multiStop = places;
        }
      }
    } catch (_) {}
    return { name, placeId, multiStop, multiStopIds };
  }

  // Resuelve un punto de ruta SIN pedir nada a Google desde el navegador (21 oct 2026, caso p-mvijaz0s3mj: antes
  // getDetails/findPlaceFromQuery con la clave pública, fuera del tope de gasto del Worker). Prioridad: 1) "lat,lng"
  // literal 2) place_id → catálogo del Worker (GET /place-details: 0 llamadas si el lugar ya está; si no, el Worker lo
  // pide UNA vez, con su contador y tope, y lo guarda) 3) el nombre en OpenStreetMap/Nominatim (gratis).
  // cb(loc, label) — loc es null si no se pudo resolver de ninguna forma.
  function _resolvePoint(pointStr, placeId, cb) {
    const m = String(pointStr).trim().match(/^(-?d+(?:.d+)?),s*(-?d+(?:.d+)?)$/);
    if (m) { cb({ lat: parseFloat(m[1]), lng: parseFloat(m[2]) }, pointStr); return; }
    const api = window.SALMA_API;
    if (placeId && api) {
      fetch(api + '/place-details?place_id=' + encodeURIComponent(placeId), { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d && typeof d.lat === 'number' && typeof d.lng === 'number') cb({ lat: d.lat, lng: d.lng }, d.name || pointStr);
          else _resolvePointByName(pointStr, cb);
        })
        .catch(() => _resolvePointByName(pointStr, cb));
      return;
    }
    _resolvePointByName(pointStr, cb);
  }

  // Nominatim pide como mucho una búsqueda por segundo: las de una misma ruta van en fila.
  let _nomQueue = Promise.resolve();
  function _resolvePointByName(pointStr, cb) {
    const q = String(pointStr || '').trim();
    if (!q) { cb(null, pointStr); return; }
    _nomQueue = _nomQueue.then(async () => {
      try {
        const j = await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=es&q=' + encodeURIComponent(q))).json();
        if (j && j[0]) cb({ lat: +j[0].lat, lng: +j[0].lon }, q);
        else cb(null, pointStr);
      } catch (_) { cb(null, pointStr); }
      await new Promise(r => setTimeout(r, 1000));
    });
  }

  function _close() {
    const m = document.getElementById('mm');
    if (m) m.remove();
    _mmMap = null; _mmInfoWindow = null;
  }

  function _initMap(dest) {
    const mapEl = document.getElementById('mm-map');
    if (!mapEl || !window.google || !google.maps) return;

    const userLoc = _getUserLoc();
    const initialCenter = userLoc || { lat: 40.4168, lng: -3.7038 };

    _mmMap = new google.maps.Map(mapEl, {
      center: initialCenter,
      zoom: 14,
      // UI nativa COMPLETA de Google Maps
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position: google.maps.ControlPosition.BOTTOM_LEFT,
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM,
      },
      rotateControl: true,
      scaleControl: true,
      gestureHandling: 'greedy',
    });
    _mmInfoWindow = new google.maps.InfoWindow();

    // Resolver destino y marcarlo
    const markDest = (loc, name) => {
      _mmMap.setCenter(loc);
      _mmMap.setZoom(15);
      const mk = new google.maps.Marker({
        position: loc,
        map: _mmMap,
        title: name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
          fillColor: '#F4630B',
          fillOpacity: 1,
          strokeColor: '#060503',
          strokeWeight: 2,
          scale: 2.2,
          anchor: new google.maps.Point(12, 22),
        },
        zIndex: 999,
        animation: google.maps.Animation.DROP,
      });

      // Si hay GPS del usuario, mostrar también origen + ruta
      if (userLoc) {
        new google.maps.Marker({
          position: userLoc, map: _mmMap, title: 'Tu ubicación',
          icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#4285F4', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3, scale: 9 },
          zIndex: 998,
        });
        const ds = new google.maps.DirectionsService();
        const dr = new google.maps.DirectionsRenderer({
          map: _mmMap, suppressMarkers: true, preserveViewport: false,
          polylineOptions: { strokeColor: '#F4630B', strokeWeight: 5, strokeOpacity: 0.85 },
        });
        ds.route({ origin: userLoc, destination: loc, travelMode: google.maps.TravelMode.DRIVING }, (r, st) => {
          console.log('[map-modal] DirectionsService status:', st);
          if (st === 'OK') {
            dr.setDirections(r);
          } else {
            // Fallback: polyline recta dorada
            new google.maps.Polyline({
              path: [userLoc, loc], map: _mmMap,
              strokeColor: '#F4630B', strokeWeight: 4, strokeOpacity: 0.7,
              geodesic: true,
            });
            const b = new google.maps.LatLngBounds();
            b.extend(userLoc); b.extend(loc);
            _mmMap.fitBounds(b, 80);
          }
        });
      }

      const sp = document.getElementById('mm-spinner');
      if (sp) sp.remove();
    };

    // Multi-stop: colocar markers numerados en todos los puntos
    if (dest.multiStop && dest.multiStop.length >= 2) {
      const bounds = new google.maps.LatLngBounds();
      let pending = dest.multiStop.length;
      const locs = new Array(dest.multiStop.length);
      dest.multiStop.forEach((point, i) => {
        const pointId = dest.multiStopIds && dest.multiStopIds[i];
        _resolvePoint(point, pointId, (loc, label) => {
          if (loc) locs[i] = { loc, name: label };
          if (--pending === 0) {
            const valid = locs.filter(Boolean);
            if (valid.length === 0) {
              const sp = document.getElementById('mm-spinner');
              if (sp) sp.textContent = 'No se pudo encontrar los lugares';
              return;
            }
            valid.forEach((pt, idx) => {
              new google.maps.Marker({
                position: pt.loc, map: _mmMap, title: pt.name,
                icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#F4630B', fillOpacity: 1, strokeColor: '#060503', strokeWeight: 3, scale: 14 },
                label: { text: String(idx + 1), color: '#060503', fontSize: '12px', fontWeight: '700' },
                zIndex: 999,
              });
              bounds.extend(pt.loc);
            });
            // Polyline/directions
            if (valid.length >= 2) {
              const origin = userLoc || valid[0].loc;
              const destination = valid[valid.length - 1].loc;
              const wpSrc = userLoc ? valid.slice(0, -1) : valid.slice(1, -1);
              const waypoints = wpSrc.map(p => ({ location: p.loc, stopover: true }));
              const ds = new google.maps.DirectionsService();
              const dr = new google.maps.DirectionsRenderer({
                map: _mmMap, suppressMarkers: true, preserveViewport: true,
                polylineOptions: { strokeColor: '#F4630B', strokeWeight: 5, strokeOpacity: 0.85 },
              });
              ds.route({ origin, destination, waypoints, travelMode: google.maps.TravelMode.DRIVING }, (result, status) => {
                if (status === 'OK') dr.setDirections(result);
              });
            }
            if (userLoc) bounds.extend(userLoc);
            _mmMap.fitBounds(bounds, 60);
            const sp = document.getElementById('mm-spinner');
            if (sp) sp.remove();
          }
        });
      });
      return;
    }

    // Destino único: por el nombre (el place_id suelto de estos enlaces a menudo no vale)
    if (dest.name) {
      _resolvePoint(dest.name, null, (loc, label) => {
        if (loc) markDest(loc, label);
        else { const sp = document.getElementById('mm-spinner'); if (sp) sp.textContent = 'No se pudo encontrar el lugar'; }
      });
    } else {
      const sp = document.getElementById('mm-spinner'); if (sp) sp.remove();
    }
  }

  window.openMapsModal = function(url) {
    try {
      _injectCSS();
      document.getElementById('mm')?.remove();

      const dest = _extractDest(url);

      const modal = document.createElement('div');
      modal.id = 'mm';
      modal.innerHTML = `
        <div id="mm-map"></div>
        <div id="mm-spinner">Cargando mapa…</div>
        <button id="mm-close" aria-label="Cerrar">×</button>
        <button id="mm-open">📍 Abrir en Google Maps</button>
      `;
      document.body.appendChild(modal);

      document.getElementById('mm-close').addEventListener('click', _close);
      document.getElementById('mm-open').addEventListener('click', () => window.open(url, '_blank'));

      const ensureGoogle = () => {
        if (window.google && google.maps && google.maps.Map) return Promise.resolve();
        if (typeof window._loadGoogleMaps === 'function') return window._loadGoogleMaps();
        return Promise.reject();
      };

      ensureGoogle()
        .then(() => {
          const wait = (tries = 0) => {
            if (window.google && google.maps && google.maps.Map) {
              _initMap(dest);
            } else if (tries < 30) {
              setTimeout(() => wait(tries + 1), 100);
            } else {
              const sp = document.getElementById('mm-spinner');
              if (sp) sp.textContent = 'Google Maps no pudo cargar';
            }
          };
          wait();
        })
        .catch(() => {
          const sp = document.getElementById('mm-spinner');
          if (sp) sp.textContent = 'Google Maps no pudo cargar';
        });
    } catch (e) {
      console.error('[map-modal] error:', e);
      window.open(url, '_blank');
    }
  };
})();
