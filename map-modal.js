// ═══════════════════════════════════════════════════════════════
// map-modal.js — Modal fullscreen con Google Maps JS completo
// Toda la UI nativa de Google: Street View (pegman), layers,
// zoom, tipos de mapa, search. Marker dorado en destino.
// ═══════════════════════════════════════════════════════════════
(function() {
  let _mmMap = null;
  let _mmInfoWindow = null;
  let _mmSearchBox = null;
  let _mmSearchMarkers = [];

  function _injectCSS() {
    if (document.getElementById('mm-css')) return;
    const s = document.createElement('style');
    s.id = 'mm-css';
    s.textContent = `
#mm { position: fixed; inset: 0; z-index: 10000; background: #060503; }
#mm-map { position: absolute; inset: 0; }
#mm-close { position: absolute; top: 14px; right: 14px; width: 42px; height: 42px; border-radius: 50%; background: rgba(0,0,0,0.82); color: #fff; border: none; font-size: 26px; line-height: 1; cursor: pointer; z-index: 12; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
#mm-searchbox { position: absolute; top: 14px; left: 14px; z-index: 11; background: #fff; border-radius: 22px; padding: 8px 14px; width: min(340px, calc(100% - 80px)); box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
#mm-searchbox input { width: 100%; border: 0; outline: 0; font-size: 14px; font-family: 'Inter', sans-serif; color: #111; background: transparent; }
#mm-searchbox input::placeholder { color: #999; }
#mm-open { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: #f0b429; color: #060503; border: none; padding: 12px 20px; border-radius: 22px; font-size: 13px; font-weight: 700; cursor: pointer; z-index: 12; box-shadow: 0 4px 14px rgba(0,0,0,0.5); font-family: 'Inter', sans-serif; }
#mm-spinner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #f0b429; font-size: 14px; z-index: 5; font-family: 'Inter', sans-serif; background: rgba(0,0,0,0.7); padding: 10px 16px; border-radius: 8px; }
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
    let name = '', placeId = null, multiStop = null;
    try {
      if (/\/maps\/dir\/\?api=1/i.test(url)) {
        const u = new URL(url);
        name = u.searchParams.get('destination') || '';
        placeId = u.searchParams.get('destination_place_id') || null;
      } else if (/\/maps\/dir\/[^?]/i.test(url)) {
        const parts = url.split('/dir/')[1].split('/').filter(Boolean);
        const places = parts.map(p => decodeURIComponent(p.replace(/\+/g, ' ')));
        if (places.length > 0) {
          name = places[places.length - 1];
          multiStop = places;
        }
      }
    } catch (_) {}
    return { name, placeId, multiStop };
  }

  function _close() {
    const m = document.getElementById('mm');
    if (m) m.remove();
    _mmMap = null; _mmInfoWindow = null; _mmSearchBox = null; _mmSearchMarkers = [];
  }

  function _clearSearchMarkers() {
    _mmSearchMarkers.forEach(m => m.setMap(null));
    _mmSearchMarkers = [];
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
    const placesService = new google.maps.places.PlacesService(_mmMap);

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
          fillColor: '#f0b429',
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
          polylineOptions: { strokeColor: '#f0b429', strokeWeight: 5, strokeOpacity: 0.85 },
        });
        ds.route({ origin: userLoc, destination: loc, travelMode: google.maps.TravelMode.DRIVING }, (r, st) => {
          console.log('[map-modal] DirectionsService status:', st);
          if (st === 'OK') {
            dr.setDirections(r);
          } else {
            // Fallback: polyline recta dorada
            new google.maps.Polyline({
              path: [userLoc, loc], map: _mmMap,
              strokeColor: '#f0b429', strokeWeight: 4, strokeOpacity: 0.7,
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
      dest.multiStop.forEach((name, i) => {
        placesService.findPlaceFromQuery({ query: name, fields: ['geometry','name','place_id'] }, (r, s) => {
          if (s === google.maps.places.PlacesServiceStatus.OK && r && r[0]) {
            locs[i] = { loc: r[0].geometry.location, name: r[0].name, placeId: r[0].place_id };
          }
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
                icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#f0b429', fillOpacity: 1, strokeColor: '#060503', strokeWeight: 3, scale: 14 },
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
                polylineOptions: { strokeColor: '#f0b429', strokeWeight: 5, strokeOpacity: 0.85 },
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

    // Destino único — saltarnos getDetails con placeId (a menudo inválido)
    // Usar findPlaceFromQuery directamente → fallback a Geocoder
    if (dest.name) {
      console.log('[map-modal] resolviendo destino:', dest.name);
      placesService.findPlaceFromQuery({ query: dest.name, fields: ['geometry','name','place_id'] }, (r, st) => {
        console.log('[map-modal] findPlaceFromQuery status:', st, 'resultados:', r ? r.length : 0);
        if (st === google.maps.places.PlacesServiceStatus.OK && r && r[0] && r[0].geometry) {
          markDest(r[0].geometry.location, r[0].name);
        } else {
          // Fallback Geocoder
          new google.maps.Geocoder().geocode({ address: dest.name }, (res, gst) => {
            console.log('[map-modal] Geocoder status:', gst);
            if (gst === 'OK' && res[0]) markDest(res[0].geometry.location, dest.name);
            else { const sp = document.getElementById('mm-spinner'); if (sp) sp.textContent = 'No se pudo encontrar el lugar'; }
          });
        }
      });
    } else {
      const sp = document.getElementById('mm-spinner'); if (sp) sp.remove();
    }

    // Search box (Places Autocomplete/Search)
    const input = document.getElementById('mm-search-input');
    if (input && google.maps.places.SearchBox) {
      _mmSearchBox = new google.maps.places.SearchBox(input);
      _mmMap.addListener('bounds_changed', () => {
        _mmSearchBox.setBounds(_mmMap.getBounds());
      });
      _mmSearchBox.addListener('places_changed', () => {
        const places = _mmSearchBox.getPlaces();
        if (!places || places.length === 0) return;
        _clearSearchMarkers();
        const bounds = new google.maps.LatLngBounds();
        places.forEach(p => {
          if (!p.geometry || !p.geometry.location) return;
          const mk = new google.maps.Marker({
            map: _mmMap,
            position: p.geometry.location,
            title: p.name,
            icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#4285F4', fillOpacity: 0.92, strokeColor: '#fff', strokeWeight: 2, scale: 9 },
          });
          mk.addListener('click', () => {
            const content = `
              <div style="font-family:'Inter',sans-serif;max-width:240px">
                <div style="font-weight:700;font-size:14px;color:#111">${p.name || ''}</div>
                ${p.rating ? `<div style="color:#f0b429;font-size:12px">★ ${p.rating}</div>` : ''}
                ${p.formatted_address ? `<div style="color:#777;font-size:11px;margin-top:4px">${p.formatted_address}</div>` : ''}
              </div>`;
            _mmInfoWindow.setContent(content);
            _mmInfoWindow.open(_mmMap, mk);
          });
          _mmSearchMarkers.push(mk);
          if (p.geometry.viewport) bounds.union(p.geometry.viewport);
          else bounds.extend(p.geometry.location);
        });
        _mmMap.fitBounds(bounds);
      });
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
        <div id="mm-searchbox">
          <input id="mm-search-input" type="text" placeholder="Buscar hoteles, farmacias, restaurantes...">
        </div>
        <button id="mm-close" aria-label="Cerrar">×</button>
        <button id="mm-open">📍 Abrir en Google Maps</button>
      `;
      document.body.appendChild(modal);

      document.getElementById('mm-close').addEventListener('click', _close);
      document.getElementById('mm-open').addEventListener('click', () => window.open(url, '_blank'));

      const ensureGoogle = () => {
        if (window.google && google.maps && google.maps.places) return Promise.resolve();
        if (typeof window._loadGoogleMaps === 'function') return window._loadGoogleMaps();
        return Promise.reject();
      };

      ensureGoogle()
        .then(() => {
          const wait = (tries = 0) => {
            if (window.google && google.maps && google.maps.places) {
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
