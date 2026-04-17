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

  function _close() {
    const m = document.getElementById('mm');
    if (m) m.remove();
    _mmMap = null; _mmSV = null; _mmPlaces = null; _mmMarkers = {};
    _mmDestLoc = null; _mmDestName = '';
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
        _mmMarkers[cat].push(mk);
      }
    };

    cfg.types.forEach(type => {
      _mmPlaces.nearbySearch({ location: _mmMap.getCenter(), radius: 2500, type }, add);
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

    // Centro inicial: destino (aún sin geocodificar) → usa cualquier ubicación, se centra al resolver
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

    // Actualizar brújula cuando cambie heading
    _mmMap.addListener('heading_changed', _updateCompass);

    // Resolver destino
    const resolveAndRender = (loc) => {
      _mmDestLoc = loc;
      _mmMap.setCenter(loc);
      _mmMap.setZoom(15);

      // Marker destino
      new google.maps.Marker({
        position: loc,
        map: _mmMap,
        title: dest.name,
        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#f0b429', fillOpacity: 1, strokeColor: '#060503', strokeWeight: 3, scale: 11 },
        zIndex: 999,
      });

      // Ruta desde GPS usuario
      if (userLoc) {
        if (dest.multiStop && dest.multiStop.length >= 2) {
          // Multi-stop: dibujar waypoints
          const waypoints = dest.multiStop.slice(0, -1).map(p => ({ location: p, stopover: true }));
          const ds = new google.maps.DirectionsService();
          const dr = new google.maps.DirectionsRenderer({
            map: _mmMap,
            suppressMarkers: false,
            polylineOptions: { strokeColor: '#f0b429', strokeWeight: 5, strokeOpacity: 0.85 },
          });
          ds.route({
            origin: userLoc,
            destination: loc,
            waypoints,
            optimizeWaypoints: false,
            travelMode: google.maps.TravelMode.DRIVING,
          }, (result, status) => {
            if (status === 'OK') dr.setDirections(result);
          });
        } else {
          _drawRoute(userLoc, loc);
          // Ajustar bounds para ver origen + destino
          const b = new google.maps.LatLngBounds();
          b.extend(userLoc);
          b.extend(loc);
          _mmMap.fitBounds(b, 80);
        }
      }

      const sp = document.getElementById('mm-spinner');
      if (sp) sp.remove();
    };

    // Geocodificar por place_id o por nombre
    if (dest.placeId) {
      _mmPlaces.getDetails({ placeId: dest.placeId, fields: ['geometry'] }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          resolveAndRender(place.geometry.location);
        } else {
          _geocodeByName(dest.name, resolveAndRender);
        }
      });
    } else {
      _geocodeByName(dest.name, resolveAndRender);
    }
  }

  function _geocodeByName(name, cb) {
    const gc = new google.maps.Geocoder();
    gc.geocode({ address: name }, (results, status) => {
      if (status === 'OK' && results[0]) cb(results[0].geometry.location);
      else {
        const sp = document.getElementById('mm-spinner');
        if (sp) sp.textContent = 'No se pudo encontrar el lugar';
      }
    });
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
        const p = document.getElementById('mm-layers');
        p.style.display = p.style.display === 'block' ? 'none' : 'block';
        e.currentTarget.classList.toggle('active');
      });
      document.getElementById('mm-btn-sv').addEventListener('click', (e) => {
        _toggleStreetView(e.currentTarget);
      });
      document.getElementById('mm-compass').addEventListener('click', () => {
        if (_mmMap) { _mmMap.setHeading(0); _mmMap.setTilt(0); _updateCompass(); }
      });
      document.querySelectorAll('#mm-layers input[data-mm-cat]').forEach(cb => {
        cb.addEventListener('change', () => _toggleLayer(cb.dataset.mmCat, cb.checked));
      });

      // Esperar a que Google Maps esté disponible
      const tryInit = (tries = 0) => {
        if (window.google && google.maps && google.maps.places) {
          _initMap(dest);
        } else if (tries < 20) {
          setTimeout(() => tryInit(tries + 1), 200);
        } else {
          // Fallback iframe si Google Maps no carga
          const mapEl = document.getElementById('mm-map');
          if (mapEl) {
            const embed = url.indexOf('?') === -1 ? url + '?output=embed' : url + '&output=embed';
            mapEl.innerHTML = `<iframe src="${embed}" style="width:100%;height:100%;border:0" frameborder="0"></iframe>`;
          }
          const sp = document.getElementById('mm-spinner');
          if (sp) sp.remove();
        }
      };
      tryInit();
    } catch (e) {
      console.error('[map-modal] error:', e);
      window.open(url, '_blank');
    }
  };
})();
