// ═══════════════════════════════════════════════════════════════
// map-modal.js — Modal fullscreen con Google Maps JS API
// Sustituye al iframe embed. Incluye brújula, capas, Street View
// y enlace a navegación nativa. Aislado del live-map de Salma.
// ═══════════════════════════════════════════════════════════════
(function() {
  let _mmMap = null;
  let _mmSV = null;
  let _mmPlaces = null;
  let _mmMarkers = {};
  let _mmDestLoc = null;
  let _mmDestName = '';
  let _mmInfoWindow = null;
  let _mmRouteMarkers = [];

  const _mmCats = {
    food:     { types: ['restaurant','cafe','bar','bakery'],                        color: '#E87040', icon: '🍽', label: 'Restaurantes' },
    medical:  { types: ['pharmacy'],                                                color: '#D9534F', icon: '💊', label: 'Farmacias' },
    lodging:  { types: ['lodging'],                                                 color: '#5BC0DE', icon: '🏨', label: 'Hoteles' },
    shopping: { types: ['supermarket','grocery_or_supermarket','convenience_store'], color: '#AA66CC', icon: '🛒', label: 'Supermercados' },
    parks:    { types: ['park'],                                                    color: '#5CB85C', icon: '🌳', label: 'Parques' },
    culture:  { types: ['museum','tourist_attraction','art_gallery'],               color: '#D4A843', icon: '🏛', label: 'Cultura' },
    transit:  { types: ['transit_station','bus_station','subway_station'],          color: '#888',    icon: '🚇', label: 'Transporte' },
  };

  const _mmStyles = [
    { featureType: 'poi',     elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
  ];

  function _injectCSS() {
    if (document.getElementById('mm-css')) return;
    const s = document.createElement('style');
    s.id = 'mm-css';
    s.textContent = `
#mm { position: fixed; inset: 0; z-index: 10000; background: #060503; }
#mm-map, #mm-sv { position: absolute; inset: 0; }
#mm-sv { display: none; }
#mm-close { position: absolute; top: 14px; right: 14px; width: 42px; height: 42px; border-radius: 50%; background: rgba(0,0,0,0.72); color: #fff; border: none; font-size: 26px; line-height: 1; cursor: pointer; z-index: 12; display:flex; align-items:center; justify-content:center; }
#mm-compass { position: absolute; top: 14px; left: 14px; width: 56px; height: 56px; z-index: 11; background: rgba(6,5,3,0.82); border: 1.5px solid rgba(240,180,41,0.35); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
#mm-compass .mm-c-ring { position: relative; width: 44px; height: 44px; transition: transform 0.3s; }
#mm-compass .mm-c-n { position: absolute; top: -2px; left: 50%; transform: translateX(-50%); color: #f0b429; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; }
#mm-compass .mm-c-needle { position: absolute; top: 50%; left: 50%; width: 2px; height: 18px; background: linear-gradient(180deg, #f0b429 50%, #8a5f10 50%); transform: translate(-50%, -50%); border-radius: 2px; }
#mm-bottom { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 11; max-width: calc(100% - 28px); overflow-x: auto; padding: 4px; }
#mm-bottom button { background: rgba(6,5,3,0.88); color: #fff; border: 1.5px solid rgba(240,180,41,0.28); padding: 10px 14px; border-radius: 22px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'Inter', sans-serif; }
#mm-bottom button.active { background: #f0b429; color: #060503; border-color: #f0b429; }
#mm-bottom button#mm-btn-nav { background: #f0b429; color: #060503; border-color: #f0b429; }
#mm-layers { position: absolute; bottom: 74px; left: 50%; transform: translateX(-50%); background: #060503; border: 1.5px solid rgba(240,180,41,0.35); border-radius: 14px; padding: 14px 16px; min-width: 260px; max-width: calc(100% - 28px); z-index: 11; display: none; font-family: 'Inter', sans-serif; }
#mm-layers h3 { color: #f0b429; font-size: 12px; margin: 0 0 10px; letter-spacing: 1.5px; font-weight: 700; }
#mm-layers label { display: flex; align-items: center; gap: 10px; color: #fff; padding: 8px 0; cursor: pointer; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
#mm-layers label:last-child { border-bottom: 0; }
#mm-layers label .mm-ic { font-size: 16px; }
#mm-layers label .mm-lbl { flex: 1; }
#mm-layers label input { appearance: none; width: 40px; height: 22px; background: #333; border-radius: 11px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; }
#mm-layers label input:checked { background: #f0b429; }
#mm-layers label input::before { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
#mm-layers label input:checked::before { transform: translateX(18px); }
#mm-spinner { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #f0b429; font-size: 14px; z-index: 5; }
    `;
    document.head.appendChild(s);
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

  function _getUserLoc() {
    if (typeof salma !== 'undefined' && salma._userLocation) {
      return { lat: salma._userLocation.lat, lng: salma._userLocation.lng };
    }
    return null;
  }

  function _fallbackIframe(url) {
    const mapEl = document.getElementById('mm-map');
    if (mapEl) {
      // Convertir URL a formato embed adecuado
      let embed = url;
      try {
        if (/\/maps\/dir\/\?api=1/i.test(url)) {
          const u = new URL(url);
          const dest = u.searchParams.get('destination') || '';
          const userLoc = _getUserLoc();
          const saddr = userLoc ? userLoc.lat + ',' + userLoc.lng : '';
          embed = 'https://maps.google.com/maps?saddr=' + encodeURIComponent(saddr) + '&daddr=' + encodeURIComponent(dest) + '&output=embed';
        } else if (!/[?&]output=embed/i.test(embed)) {
          embed += (embed.indexOf('?') === -1 ? '?' : '&') + 'output=embed';
        }
      } catch (_) {}
      mapEl.innerHTML = '<iframe src="' + embed + '" style="width:100%;height:100%;border:0" frameborder="0" allowfullscreen></iframe>';
    }
    const sp = document.getElementById('mm-spinner');
    if (sp) sp.remove();
  }

  function _onDocClickClosePanel(e) {
    const p = document.getElementById('mm-layers');
    if (!p || p.style.display !== 'block') return;
    const btn = document.getElementById('mm-btn-layers');
    if (p.contains(e.target) || (btn && btn.contains(e.target))) return;
    p.style.display = 'none';
    if (btn) btn.classList.remove('active');
  }

  function _close() {
    document.removeEventListener('click', _onDocClickClosePanel, true);
    const m = document.getElementById('mm');
    if (m) m.remove();
    _mmMap = null; _mmSV = null; _mmPlaces = null; _mmMarkers = {};
    _mmDestLoc = null; _mmDestName = '';
    _mmInfoWindow = null; _mmRouteMarkers = [];
  }

  function _toggleLayer(cat, enabled) {
    if (!_mmMap || !_mmPlaces) return;
    if (enabled) _loadLayer(cat); else _removeLayer(cat);
  }

  function _loadLayer(cat) {
    const cfg = _mmCats[cat];
    if (!cfg) return;
    if (!_mmMarkers[cat]) _mmMarkers[cat] = [];
    const seen = new Set(_mmMarkers[cat].map(m => m._pid).filter(Boolean));

    const add = (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
      for (const p of results.slice(0, 25)) {
        if (seen.has(p.place_id)) continue;
        seen.add(p.place_id);
        const mk = new google.maps.Marker({
          map: _mmMap,
          position: p.geometry.location,
          title: p.name,
          icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: cfg.color, fillOpacity: 0.92, strokeColor: '#fff', strokeWeight: 2, scale: 9 },
          label: { text: cfg.icon, fontSize: '11px' },
        });
        mk._pid = p.place_id;
        mk.addListener('click', () => _showPlaceInfo(mk._pid, mk.getPosition()));
        _mmMarkers[cat].push(mk);
      }
    };

    cfg.types.forEach(type => {
      _mmPlaces.nearbySearch({ location: _mmMap.getCenter(), radius: 2500, type }, add);
    });
  }

  function _showPlaceInfo(placeId, pos) {
    if (!_mmPlaces || !_mmMap) return;
    if (!_mmInfoWindow) _mmInfoWindow = new google.maps.InfoWindow();
    _mmPlaces.getDetails({
      placeId,
      fields: ['name','photos','formatted_address','rating','user_ratings_total','opening_hours','website','international_phone_number','url']
    }, (p, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !p) return;
      const photo = p.photos && p.photos[0] ? p.photos[0].getUrl({ maxWidth: 320, maxHeight: 160 }) : '';
      const rating = p.rating ? `<span style="color:#f0b429;font-size:12px;font-weight:600">★ ${p.rating.toFixed(1)}</span>` +
        (p.user_ratings_total ? `<span style="color:#777;font-size:11px;margin-left:4px">(${p.user_ratings_total})</span>` : '') : '';
      const openNow = (p.opening_hours && typeof p.opening_hours.isOpen === 'function')
        ? (p.opening_hours.isOpen() ? '<span style="color:#4ade80;font-size:11px;font-weight:600">● Abierto</span>' : '<span style="color:#ef4444;font-size:11px;font-weight:600">● Cerrado</span>')
        : '';
      const addr = p.formatted_address ? `<div style="font-size:11px;color:#777;margin:4px 0 8px">${p.formatted_address}</div>` : '';
      const phone = p.international_phone_number ? `<a href="tel:${p.international_phone_number.replace(/\s/g,'')}" style="display:block;font-size:12px;color:#060503;text-decoration:none;margin-bottom:4px">📞 ${p.international_phone_number}</a>` : '';
      const mapsUrl = p.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`;
      const content = `
        <div style="font-family:'Inter',sans-serif;width:260px;border-radius:8px;overflow:hidden;background:#fff">
          ${photo ? `<img src="${photo}" style="width:100%;height:130px;object-fit:cover;display:block">` : ''}
          <div style="padding:10px 12px 12px">
            <div style="font-size:14px;font-weight:700;color:#111;line-height:1.3;margin-bottom:4px">${p.name || ''}</div>
            <div style="display:flex;gap:10px;align-items:center">${rating}${openNow}</div>
            ${addr}
            ${phone}
            <a href="${mapsUrl}" target="_blank" rel="noopener" style="display:block;text-align:center;background:#f0b429;color:#060503;border-radius:6px;padding:8px;font-size:12px;font-weight:600;text-decoration:none;margin-top:6px">📍 Abrir en Google Maps</a>
          </div>
        </div>`;
      _mmInfoWindow.setContent(content);
      _mmInfoWindow.setPosition(pos);
      _mmInfoWindow.open(_mmMap);
    });
  }

  function _removeLayer(cat) {
    (_mmMarkers[cat] || []).forEach(m => m.setMap(null));
    _mmMarkers[cat] = [];
  }

  function _initStreetView() {
    if (_mmSV || !_mmDestLoc) return;
    const svEl = document.getElementById('mm-sv');
    if (!svEl) return;
    _mmSV = new google.maps.StreetViewPanorama(svEl, {
      position: _mmDestLoc,
      pov: { heading: 0, pitch: 0 },
      addressControl: false,
      fullscreenControl: false,
      panControl: false,
      zoomControl: true,
      enableCloseButton: false,
    });
  }

  function _toggleStreetView(btn) {
    const mapEl = document.getElementById('mm-map');
    const svEl = document.getElementById('mm-sv');
    if (!mapEl || !svEl) return;
    const showing = svEl.style.display === 'block';
    if (!showing) {
      _initStreetView();
      mapEl.style.display = 'none';
      svEl.style.display = 'block';
      btn.classList.add('active');
    } else {
      svEl.style.display = 'none';
      mapEl.style.display = 'block';
      btn.classList.remove('active');
    }
  }

  function _updateCompass() {
    if (!_mmMap) return;
    const h = _mmMap.getHeading() || 0;
    const ring = document.querySelector('#mm-compass .mm-c-ring');
    if (ring) ring.style.transform = `rotate(${-h}deg)`;
  }

  function _drawRoute(originLoc, destLoc) {
    if (!originLoc || !destLoc) return;
    const ds = new google.maps.DirectionsService();
    const dr = new google.maps.DirectionsRenderer({
      map: _mmMap,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#f0b429', strokeWeight: 5, strokeOpacity: 0.85 },
    });
    ds.route({
      origin: originLoc,
      destination: destLoc,
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') dr.setDirections(result);
    });
  }

  function _initMap(dest) {
    const mapEl = document.getElementById('mm-map');
    if (!mapEl || !window.google || !google.maps) return;

    _mmDestName = dest.name;
    const userLoc = _getUserLoc();

    _mmMap = new google.maps.Map(mapEl, {
      center: userLoc || { lat: 40.4168, lng: -3.7038 },
      zoom: 14,
      heading: 0,
      tilt: 0,
      rotateControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: _mmStyles,
      gestureHandling: 'greedy',
    });
    _mmPlaces = new google.maps.places.PlacesService(_mmMap);
    _mmInfoWindow = new google.maps.InfoWindow();

    _mmMap.addListener('heading_changed', _updateCompass);

    // Cerrar panel Capas al tocar el mapa
    _mmMap.addListener('click', () => {
      const p = document.getElementById('mm-layers');
      if (p && p.style.display === 'block') {
        p.style.display = 'none';
        document.getElementById('mm-btn-layers')?.classList.remove('active');
      }
    });

    // Multi-stop: geocodificar TODOS los puntos y dibujar ruta numerada
    if (dest.multiStop && dest.multiStop.length >= 2) {
      _resolveMultiStop(dest.multiStop, userLoc);
    } else {
      _resolveSingle(dest, userLoc);
    }
  }

  function _resolveSingle(dest, userLoc) {
    const render = (loc) => {
      _mmDestLoc = loc;
      _mmMap.setCenter(loc);
      _mmMap.setZoom(15);

      const mk = new google.maps.Marker({
        position: loc, map: _mmMap, title: dest.name,
        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#f0b429', fillOpacity: 1, strokeColor: '#060503', strokeWeight: 3, scale: 12 },
        zIndex: 999,
      });
      if (dest.placeId) {
        mk._pid = dest.placeId;
        mk.addListener('click', () => _showPlaceInfo(dest.placeId, loc));
      }

      if (userLoc) {
        _drawRoute(userLoc, loc);
        const b = new google.maps.LatLngBounds(); b.extend(userLoc); b.extend(loc);
        _mmMap.fitBounds(b, 80);
      }

      const sp = document.getElementById('mm-spinner');
      if (sp) sp.remove();
    };

    // 1) placeId → Places Details
    if (dest.placeId) {
      _mmPlaces.getDetails({ placeId: dest.placeId, fields: ['geometry','name'] }, (p, s) => {
        if (s === google.maps.places.PlacesServiceStatus.OK && p && p.geometry) return render(p.geometry.location);
        _geocodeByName(dest.name, render);
      });
    } else {
      _geocodeByName(dest.name, render);
    }
  }

  function _resolveMultiStop(places, userLoc) {
    // Geocodificar cada punto en paralelo
    const geocodeOne = (name) => new Promise(resolve => {
      _mmPlaces.findPlaceFromQuery({ query: name, fields: ['geometry','place_id','name'] }, (r, s) => {
        if (s === google.maps.places.PlacesServiceStatus.OK && r && r[0]) {
          resolve({ name, loc: r[0].geometry.location, placeId: r[0].place_id, gName: r[0].name });
        } else {
          // Fallback: Geocoder
          new google.maps.Geocoder().geocode({ address: name }, (res, st) => {
            if (st === 'OK' && res[0]) resolve({ name, loc: res[0].geometry.location, placeId: null, gName: name });
            else resolve(null);
          });
        }
      });
    });

    Promise.all(places.map(geocodeOne)).then(results => {
      const valid = results.filter(Boolean);
      if (valid.length === 0) {
        const sp = document.getElementById('mm-spinner');
        if (sp) sp.textContent = 'No se pudo encontrar los lugares';
        return;
      }

      _mmDestLoc = valid[valid.length - 1].loc;
      const bounds = new google.maps.LatLngBounds();

      // Markers numerados
      valid.forEach((pt, i) => {
        const num = i + 1;
        const mk = new google.maps.Marker({
          position: pt.loc, map: _mmMap, title: pt.gName,
          icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#f0b429', fillOpacity: 1, strokeColor: '#060503', strokeWeight: 3, scale: 13 },
          label: { text: String(num), color: '#060503', fontSize: '12px', fontWeight: '700' },
          zIndex: 999,
        });
        if (pt.placeId) {
          mk._pid = pt.placeId;
          mk.addListener('click', () => _showPlaceInfo(pt.placeId, pt.loc));
        }
        _mmRouteMarkers.push(mk);
        bounds.extend(pt.loc);
      });

      // Polyline conectando en orden (líneas entre puntos + Directions para realismo)
      const ds = new google.maps.DirectionsService();
      const dr = new google.maps.DirectionsRenderer({
        map: _mmMap,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: '#f0b429', strokeWeight: 5, strokeOpacity: 0.85 },
      });
      const origin = userLoc || valid[0].loc;
      const destination = valid[valid.length - 1].loc;
      const waypointsList = userLoc ? valid.slice(0, -1) : valid.slice(1, -1);
      const waypoints = waypointsList.map(p => ({ location: p.loc, stopover: true }));
      ds.route({
        origin, destination, waypoints,
        optimizeWaypoints: false,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') dr.setDirections(result);
        else {
          // Si Directions falla, al menos unir con polyline simple
          new google.maps.Polyline({
            path: [userLoc, ...valid.map(v => v.loc)].filter(Boolean),
            map: _mmMap, strokeColor: '#f0b429', strokeWeight: 4, strokeOpacity: 0.7,
          });
        }
      });

      if (userLoc) bounds.extend(userLoc);
      _mmMap.fitBounds(bounds, 60);

      const sp = document.getElementById('mm-spinner');
      if (sp) sp.remove();
    });
  }

  function _geocodeByName(name, cb) {
    // Intentar primero FindPlace con user location bias
    const userLoc = _getUserLoc();
    const find = () => new Promise(resolve => {
      if (!_mmPlaces) return resolve(null);
      _mmPlaces.findPlaceFromQuery({ query: name, fields: ['geometry','name','place_id'] }, (r, s) => {
        if (s === google.maps.places.PlacesServiceStatus.OK && r && r[0]) resolve(r[0].geometry.location);
        else resolve(null);
      });
    });
    const geocode = () => new Promise(resolve => {
      new google.maps.Geocoder().geocode({ address: name }, (res, st) => {
        if (st === 'OK' && res[0]) resolve(res[0].geometry.location);
        else resolve(null);
      });
    });
    find().then(loc => loc ? cb(loc) : geocode().then(loc2 => {
      if (loc2) cb(loc2);
      else {
        const sp = document.getElementById('mm-spinner');
        if (sp) sp.textContent = 'No se pudo encontrar el lugar';
      }
    }));
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
        <div id="mm-sv"></div>
        <div id="mm-spinner">Cargando mapa…</div>
        <button id="mm-close" aria-label="Cerrar">×</button>
        <div id="mm-compass" title="Tocar para centrar al norte">
          <div class="mm-c-ring">
            <div class="mm-c-n">N</div>
            <div class="mm-c-needle"></div>
          </div>
        </div>
        <div id="mm-layers">
          <h3>MOSTRAR EN EL MAPA</h3>
          ${Object.keys(_mmCats).map(cat => {
            const c = _mmCats[cat];
            return `<label><span class="mm-ic">${c.icon}</span><span class="mm-lbl">${c.label}</span><input type="checkbox" data-mm-cat="${cat}"></label>`;
          }).join('')}
        </div>
        <div id="mm-bottom">
          <button id="mm-btn-layers">🎛 Capas</button>
          <button id="mm-btn-sv">👁 Street View</button>
          <button id="mm-btn-nav">🧭 Iniciar ruta</button>
        </div>
      `;
      document.body.appendChild(modal);

      // Listeners
      document.getElementById('mm-close').addEventListener('click', _close);
      document.getElementById('mm-btn-nav').addEventListener('click', () => {
        window.open(url, '_blank');
      });
      document.getElementById('mm-btn-layers').addEventListener('click', (e) => {
        e.stopPropagation();
        const p = document.getElementById('mm-layers');
        const open = p.style.display !== 'block';
        p.style.display = open ? 'block' : 'none';
        e.currentTarget.classList.toggle('active', open);
      });
      // Panel capas: no cerrar al togglear items (para activar varios), pero stopPropagation
      document.getElementById('mm-layers').addEventListener('click', (e) => e.stopPropagation());
      // Cerrar panel al tocar fuera (en el documento)
      document.addEventListener('click', _onDocClickClosePanel, true);
      document.getElementById('mm-btn-sv').addEventListener('click', (e) => {
        _toggleStreetView(e.currentTarget);
      });
      document.getElementById('mm-compass').addEventListener('click', () => {
        if (_mmMap) { _mmMap.setHeading(0); _mmMap.setTilt(0); _updateCompass(); }
      });
      document.querySelectorAll('#mm-layers input[data-mm-cat]').forEach(cb => {
        cb.addEventListener('change', () => _toggleLayer(cb.dataset.mmCat, cb.checked));
      });

      // Disparar carga de Google Maps JS (lazy-loaded en index.html)
      const ensureGoogle = () => {
        if (window.google && google.maps && google.maps.places) return Promise.resolve();
        if (typeof window._loadGoogleMaps === 'function') return window._loadGoogleMaps();
        return new Promise((_, reject) => setTimeout(reject, 8000));
      };

      ensureGoogle()
        .then(() => {
          // Places library puede tardar un poco más que core maps
          const waitPlaces = (tries = 0) => {
            if (window.google && google.maps && google.maps.places) {
              _initMap(dest);
            } else if (tries < 30) {
              setTimeout(() => waitPlaces(tries + 1), 100);
            } else {
              _fallbackIframe(url);
            }
          };
          waitPlaces();
        })
        .catch(() => _fallbackIframe(url));
    } catch (e) {
      console.error('[map-modal] error:', e);
      window.open(url, '_blank');
    }
  };
})();
