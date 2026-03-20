/* ============================================================
   MAPA RUTA — Pantalla de navegación integrada
   Google Maps JavaScript API + Directions API
   ============================================================ */

(function () {
  'use strict';

  // ── Estado interno ────────────────────────────────────────────
  var _state = {
    routeData: null,
    routeId: null,
    routeMeta: null,
    map: null,
    markers: [],
    directionsRenderer: null,
    directionsService: null,
    userMarker: null,
    infoWindow: null,
    gmapsLoading: false,
    routeSteps: [],
    watchId: null,
    desvioAlertado: false
  };

  var TYPE_ICONS = {
    city:'🏙', town:'🏘', nature:'🌿', beach:'🏖', mountain:'⛰',
    temple:'🛕', viewpoint:'📸', route:'🛤', activity:'🎯',
    other:'📍', lugar:'📍', hotel:'🏨', restaurante:'🍜',
    experiencia:'🎯', mirador:'📸', ruta:'🛤'
  };

  // ── Cargar Google Maps API (lazy, una sola vez) ───────────────
  function _loadGmaps(callback) {
    if (window.google && window.google.maps && window.google.maps.DirectionsService) {
      callback();
      return;
    }
    if (_state.gmapsLoading) {
      var poll = setInterval(function () {
        if (window.google && window.google.maps && window.google.maps.DirectionsService) {
          clearInterval(poll);
          callback();
        }
      }, 150);
      return;
    }
    _state.gmapsLoading = true;
    window._mapaRutaGmapsReady = function () {
      _state.gmapsLoading = false;
      callback();
    };
    var key = window.GOOGLE_STREETVIEW_KEY || '';
    var s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + key + '&libraries=geometry&callback=_mapaRutaGmapsReady&loading=async';
    s.async = true;
    s.defer = true;
    s.onerror = function () {
      _state.gmapsLoading = false;
      _mostrarError('No se pudo cargar Google Maps. Verifica que la API key tiene Maps JavaScript API habilitado.');
    };
    document.head.appendChild(s);
  }

  // ── POIs con coordenadas válidas ──────────────────────────────
  function _getPois(routeData) {
    if (!routeData || !routeData.stops) return [];
    return routeData.stops.filter(function (s) {
      var lat = Number(s.lat), lng = Number(s.lng);
      return lat && lng && Math.abs(lat) > 0.001 && Math.abs(lng) > 0.001;
    });
  }

  // ── PUNTO DE ENTRADA PÚBLICO ──────────────────────────────────
  function abrirMapaRuta(routeData, routeId, routeMeta) {
    _state.routeData = routeData;
    _state.routeId = routeId || null;
    _state.routeMeta = routeMeta || {};

    var titulo = document.getElementById('mapa-ruta-titulo');
    if (titulo) {
      titulo.textContent = (routeMeta && routeMeta.nombre) ||
        (routeData && (routeData.title || routeData.name)) || 'Mi ruta';
    }

    _mostrarPagina();

    // Limpiar chat Salma previo
    var msgs = document.getElementById('mapa-salma-msgs');
    if (msgs) msgs.innerHTML = '';

    var pois = _getPois(routeData);
    if (pois.length === 0) {
      _mostrarError('Esta ruta no tiene coordenadas. Ábrela desde Mis rutas para geocodificarla.');
      return;
    }

    var contenedor = document.getElementById('mapa-ruta-contenedor');
    if (contenedor) {
      contenedor.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;"><div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:rgba(212,160,23,.6);letter-spacing:.15em;">CARGANDO MAPA...</div></div>';
    }

    _loadGmaps(function () {
      _initMapa(pois, routeData);
    });
  }
  window.abrirMapaRuta = abrirMapaRuta;

  // ── Mostrar página mapa (full screen) ─────────────────────────
  function _mostrarPagina() {
    document.querySelectorAll('.page').forEach(function (p) {
      p.classList.remove('active');
      p.style.display = 'none';
    });
    var pageEl = document.getElementById('page-mapa-ruta');
    if (pageEl) {
      pageEl.classList.add('active');
      pageEl.style.display = 'block';
    }
    var nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
    var mobileNav = document.getElementById('mobile-dash-nav');
    if (mobileNav) mobileNav.style.display = 'none';
  }

  // ── Cerrar mapa, volver a vista de ruta ───────────────────────
  function cerrarMapaRuta() {
    _pararSeguimiento();
    var nav = document.querySelector('nav');
    if (nav) nav.style.display = '';
    var mobileNav = document.getElementById('mobile-dash-nav');
    if (mobileNav && window.currentUser) mobileNav.style.display = 'flex';
    _cerrarSalmaPanel();
    if (typeof window.showPage === 'function') window.showPage('ruta');
  }
  window.cerrarMapaRuta = cerrarMapaRuta;

  // ── Init mapa ─────────────────────────────────────────────────
  function _initMapa(pois, routeData) {
    var contenedor = document.getElementById('mapa-ruta-contenedor');
    if (!contenedor) return;

    _limpiarMapa();
    contenedor.innerHTML = '';

    var centro = { lat: Number(pois[0].lat), lng: Number(pois[0].lng) };

    var map = new google.maps.Map(contenedor, {
      center: centro,
      zoom: 10,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      clickableIcons: false,
      styles: _estilosMapa()
    });
    _state.map = map;
    _state.infoWindow = new google.maps.InfoWindow();
    _state.directionsService = new google.maps.DirectionsService();

    // Configurar renderer — suprimimos los markers por defecto
    // para usar los nuestros personalizados
    _state.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      suppressInfoWindows: true,
      polylineOptions: {
        strokeColor: '#d4a017',
        strokeOpacity: 0.85,
        strokeWeight: 4
      }
    });
    _state.directionsRenderer.setMap(map);

    // Añadir markers personalizados
    _renderizarMarkers(map, pois, routeData);

    // Calcular y dibujar ruta por carreteras reales
    _calcularRutaReal(pois, map);
  }

  function _limpiarMapa() {
    _state.markers.forEach(function (m) { m.setMap(null); });
    _state.markers = [];
    if (_state.directionsRenderer) {
      _state.directionsRenderer.setMap(null);
      _state.directionsRenderer = null;
    }
    if (_state.userMarker) { _state.userMarker.setMap(null); _state.userMarker = null; }
    if (_state.infoWindow) _state.infoWindow.close();
    _state.map = null;
    _state.directionsService = null;
  }

  // ── Directions API: ruta real por carreteras ──────────────────
  function _calcularRutaReal(pois, map) {
    if (pois.length < 2) {
      // Solo un punto: centrar el mapa en él
      map.setCenter({ lat: Number(pois[0].lat), lng: Number(pois[0].lng) });
      map.setZoom(13);
      return;
    }

    var origin = new google.maps.LatLng(Number(pois[0].lat), Number(pois[0].lng));
    var destination = new google.maps.LatLng(
      Number(pois[pois.length - 1].lat),
      Number(pois[pois.length - 1].lng)
    );

    // El Directions API permite máx 25 waypoints (23 intermedios)
    // Si hay más paradas, tomamos las primeras 23 intermedias
    var intermedias = pois.slice(1, -1).slice(0, 23);
    var waypoints = intermedias.map(function (p) {
      return {
        location: new google.maps.LatLng(Number(p.lat), Number(p.lng)),
        stopover: true
      };
    });

    _state.directionsService.route({
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false
    }, function (result, status) {
      if (status === 'OK') {
        _state.directionsRenderer.setDirections(result);
        _mostrarResumenRuta(result);
        // Guardar puntos de la ruta para detección de desvío
        _state.routeSteps = [];
        result.routes[0].legs.forEach(function (leg) {
          leg.steps.forEach(function (step) {
            _state.routeSteps.push(step.start_location);
            _state.routeSteps.push(step.end_location);
          });
        });
      } else {
        // Fallback: dibujar polilínea recta si Directions falla
        console.warn('Directions API status:', status);
        _fallbackPolyline(map, pois);
        _ajustarBounds(map, pois);
      }
    });
  }

  // Fallback si Directions API no funciona (ej: sin conexión)
  function _fallbackPolyline(map, pois) {
    var path = pois.map(function (p) {
      return { lat: Number(p.lat), lng: Number(p.lng) };
    });
    new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#d4a017',
      strokeOpacity: 0.7,
      strokeWeight: 3,
      strokeDashArray: [8, 4],
      map: map
    });
  }

  // Mostrar distancia y tiempo en el header
  function _mostrarResumenRuta(result) {
    var leg = result.routes[0] && result.routes[0].legs;
    if (!leg) return;
    var totalDist = 0, totalTime = 0;
    leg.forEach(function (l) {
      totalDist += l.distance ? l.distance.value : 0;
      totalTime += l.duration ? l.duration.value : 0;
    });
    var distKm = Math.round(totalDist / 1000);
    var horas = Math.floor(totalTime / 3600);
    var mins = Math.floor((totalTime % 3600) / 60);
    var resumen = distKm + ' km';
    if (horas > 0) resumen += ' · ' + horas + 'h ' + mins + 'min conduciendo';
    else if (mins > 0) resumen += ' · ' + mins + ' min';

    var subtituloEl = document.getElementById('mapa-ruta-subtitulo');
    if (subtituloEl) subtituloEl.textContent = resumen;
  }

  // ── Markers personalizados ────────────────────────────────────
  function _renderizarMarkers(map, pois, routeData) {
    var country = routeData ? (routeData.country || routeData.region || '') : '';

    pois.forEach(function (poi, idx) {
      var position = { lat: Number(poi.lat), lng: Number(poi.lng) };
      var isFirst = idx === 0;
      var isLast = idx === pois.length - 1;
      var label = isFirst ? 'S' : (isLast ? 'F' : String(idx + 1));
      var color = isFirst ? '#22c55e' : (isLast ? '#ef4444' : '#d4a017');

      var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: poi.headline || poi.name || '',
        label: {
          text: label,
          color: '#050505',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          fontWeight: '700'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 18,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#050505',
          strokeWeight: 2
        },
        zIndex: isFirst || isLast ? 10 : idx + 1
      });

      marker.addListener('click', function () {
        _mostrarInfoWindow(marker, poi, country);
      });

      _state.markers.push(marker);
    });
  }

  function _mostrarInfoWindow(marker, poi, country) {
    var name = (poi.headline || poi.name || '').replace(/</g, '&lt;');
    var icon = TYPE_ICONS[poi.type] || TYPE_ICONS[poi.tipo] || '📍';
    var narrative = (poi.narrative || poi.description || poi.note || '').replace(/</g, '&lt;');
    var secret = (poi.local_secret || '').replace(/</g, '&lt;');
    var mapsUrl = name && country
      ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ' ' + country)
      : 'https://www.google.com/maps?q=' + poi.lat + ',' + poi.lng;
    var photoRef = poi.photo_ref || '';
    var apiBase = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    var photoHtml = photoRef
      ? '<img src="' + apiBase + '/photo?ref=' + encodeURIComponent(photoRef) + '" alt="" style="width:100%;height:140px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block;" onerror="this.style.display=\'none\'">'
      : '';

    var content =
      '<div style="font-family:Inter,sans-serif;max-width:260px;padding:2px;">' +
      photoHtml +
      '<div style="font-size:15px;font-weight:700;color:#111;margin-bottom:6px;line-height:1.3;">' + icon + ' ' + name + '</div>' +
      (narrative ? '<div style="font-size:13px;color:#555;line-height:1.55;margin-bottom:8px;">' + narrative.substring(0, 140) + (narrative.length > 140 ? '…' : '') + '</div>' : '') +
      (secret ? '<div style="font-size:12px;color:#92400e;margin-bottom:8px;font-style:italic;">🔑 ' + secret.substring(0, 100) + '</div>' : '') +
      '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-size:12px;color:#d4a017;font-weight:600;text-decoration:none;">Navegar aquí →</a>' +
      '</div>';

    _state.infoWindow.setContent(content);
    _state.infoWindow.open(_state.map, marker);
  }

  // ── Ajustar zoom para ver toda la ruta ────────────────────────
  function _ajustarBounds(map, pois) {
    var bounds = new google.maps.LatLngBounds();
    pois.forEach(function (p) {
      bounds.extend({ lat: Number(p.lat), lng: Number(p.lng) });
    });
    map.fitBounds(bounds, { top: 90, bottom: 110, left: 40, right: 40 });
  }

  // ── Error visual ──────────────────────────────────────────────
  function _mostrarError(msg) {
    var contenedor = document.getElementById('mapa-ruta-contenedor');
    if (contenedor) {
      contenedor.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;">' +
        '<div style="text-align:center;max-width:300px;">' +
        '<div style="font-size:32px;margin-bottom:16px;">🗺</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:rgba(245,240,232,.5);line-height:1.7;">' +
        msg.replace(/</g, '&lt;') + '</div>' +
        '</div></div>';
    }
  }

  // ── PANEL SOS SALMA ───────────────────────────────────────────
  function abrirSalmaPanel() {
    var panel = document.getElementById('mapa-salma-panel');
    if (!panel) return;
    panel.style.display = 'flex';
    var msgs = document.getElementById('mapa-salma-msgs');
    if (msgs && !msgs.children.length) {
      msgs.innerHTML = '<div style="background:rgba(212,160,23,.08);border-left:2px solid rgba(212,160,23,.4);padding:10px 12px;border-radius:8px;font-size:13px;color:#f5f0e8;line-height:1.6;">Estoy aquí. Dime lo que necesitas.</div>';
    }
    // No hacer focus automático — evita que el teclado móvil suba al abrir el panel
  }
  window.abrirSalmaPanel = abrirSalmaPanel;

  function _cerrarSalmaPanel() {
    var panel = document.getElementById('mapa-salma-panel');
    if (panel) panel.style.display = 'none';
  }
  window.cerrarSalmaPanel = _cerrarSalmaPanel;

  function enviarMensajeSalma() {
    var input = document.getElementById('mapa-salma-input');
    if (!input) return;
    var msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    var msgs = document.getElementById('mapa-salma-msgs');
    if (msgs) {
      msgs.innerHTML +=
        '<div style="background:rgba(212,160,23,.1);border-left:2px solid #d4a017;padding:8px 12px;border-radius:8px;font-size:13px;color:#f5f0e8;word-break:break-word;">' +
        msg.replace(/</g, '&lt;') + '</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }

    _llamarSalmaApi(msg);
  }
  window.enviarMensajeSalma = enviarMensajeSalma;

  function _llamarSalmaApi(userMsg) {
    var msgs = document.getElementById('mapa-salma-msgs');
    var typingId = 'mapa-typing-' + Date.now();
    if (msgs) {
      msgs.innerHTML +=
        '<div id="' + typingId + '" style="font-size:12px;color:rgba(245,240,232,.4);font-style:italic;padding:4px 2px;">Salma está pensando...</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }

    var rd = _state.routeData;
    var routeCtx = '';
    if (rd) {
      var stopsCtx = JSON.stringify((rd.stops || []).map(function (s, i) {
        return { idx: i + 1, name: s.headline || s.name || '', lat: s.lat, lng: s.lng, type: s.type || s.tipo || 'lugar', day: s.day || 1 };
      }));
      routeCtx = '[MODO MAPA] Ruta activa: "' + (rd.title || rd.name || '') + '" en ' + (rd.country || '') + '. Paradas actuales: ' + stopsCtx + '. ';
    }

    fetch(window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: routeCtx + userMsg }] })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var reply = (data.reply || data.content || data.text || '').toString().trim();
        _mostrarRespuestaSalma(typingId, reply || 'No te llegó bien. Prueba de nuevo.');
      })
      .catch(function () {
        _mostrarRespuestaSalma(typingId, 'Sin señal. Prueba cuando tengas cobertura.');
      });
  }

  function _mostrarRespuestaSalma(typingId, texto) {
    var typing = document.getElementById(typingId);
    if (typing) typing.remove();

    // Detectar SALMA_ROUTE_UPDATE y actualizar paradas
    var updateMatch = texto.match(/SALMA_ROUTE_UPDATE\s*\n(\[[\s\S]*?\]|\{[\s\S]*?\})/);
    if (updateMatch) {
      try {
        var updateData = JSON.parse(updateMatch[1]);
        var newStops = Array.isArray(updateData) ? updateData : (updateData.stops || []);
        if (newStops.length > 0) {
          _actualizarParadas(newStops);
        }
      } catch (e) { /* JSON inválido, ignorar */ }
      texto = texto.replace(/SALMA_ROUTE_UPDATE[\s\S]*$/, '').trim();
    }

    var msgs = document.getElementById('mapa-salma-msgs');
    if (msgs && texto) {
      msgs.innerHTML +=
        '<div style="background:rgba(255,255,255,.04);padding:8px 12px;border-radius:8px;font-size:13px;color:#f5f0e8;line-height:1.55;word-break:break-word;">' +
        texto.replace(/</g, '&lt;').replace(/\n/g, '<br>') + '</div>';
      msgs.scrollTop = msgs.scrollHeight;
    }
  }

  function _actualizarParadas(newStops) {
    if (!_state.routeData) return;
    _state.routeData.stops = newStops;
    _state.routeSteps = [];
    var pois = _getPois(_state.routeData);
    if (pois.length === 0) {
      _mostrarError('La ruta actualizada no tiene coordenadas válidas.');
      return;
    }
    _initMapa(pois, _state.routeData);
    var subtituloEl = document.getElementById('mapa-ruta-subtitulo');
    if (subtituloEl) subtituloEl.textContent = 'Recalculando ruta...';
  }

  // ── BOTONES BOTTOM BAR ────────────────────────────────────────

  // + Parada: abre Salma con mensaje prefijado
  function abrirAnadirParada() {
    abrirSalmaPanel();
    var input = document.getElementById('mapa-salma-input');
    if (input) {
      input.value = 'Quiero añadir una parada a mi ruta: ';
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
    }
  }
  window.abrirAnadirParada = abrirAnadirParada;

  // Cerca de mí: activa/desactiva seguimiento continuo de posición
  function buscarCercaDeMi() {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización.');
      return;
    }
    if (_state.watchId !== null) {
      _pararSeguimiento();
      return;
    }
    _iniciarSeguimiento();
  }
  window.buscarCercaDeMi = buscarCercaDeMi;

  function _iniciarSeguimiento() {
    _state.watchId = navigator.geolocation.watchPosition(
      function (pos) {
        if (!_state.map) return;
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        // Actualizar marker de posición
        if (_state.userMarker) _state.userMarker.setMap(null);
        _state.userMarker = new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: _state.map,
          title: 'Tu ubicación',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          },
          zIndex: 100
        });
        _comprobarDesvio(lat, lng);
      },
      function (err) {
        _state.watchId = null;
        alert(err.code === 1 ? 'Permiso de ubicación denegado.' : 'No se pudo obtener tu ubicación.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }

  function _pararSeguimiento() {
    if (_state.watchId !== null) {
      navigator.geolocation.clearWatch(_state.watchId);
      _state.watchId = null;
    }
    _ocultarAlertaDesvio();
  }

  function _comprobarDesvio(lat, lng) {
    if (!_state.routeSteps.length || !window.google) return;
    var userLatLng = new google.maps.LatLng(lat, lng);
    var minDist = Infinity;
    _state.routeSteps.forEach(function (step) {
      var d = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, step);
      if (d < minDist) minDist = d;
    });
    if (minDist > 500) {
      _mostrarAlertaDesvio(Math.round(minDist));
    } else {
      _ocultarAlertaDesvio();
    }
  }

  function _mostrarAlertaDesvio(metros) {
    var el = document.getElementById('mapa-alerta-desvio');
    if (!el) return;
    var txt = metros >= 1000
      ? '⚠️ Estás ' + (metros / 1000).toFixed(1) + ' km fuera de la ruta'
      : '⚠️ Estás ' + metros + ' m fuera de la ruta';
    var span = el.querySelector('span');
    if (span) span.textContent = txt;
    el.style.display = 'flex';
  }

  function _ocultarAlertaDesvio() {
    var el = document.getElementById('mapa-alerta-desvio');
    if (el) el.style.display = 'none';
  }

  // Abrir ruta completa en Google Maps externo
  function abrirEnGoogleMaps() {
    var rd = _state.routeData;
    if (!rd) return;
    var pois = _getPois(rd);
    if (!pois.length) return;
    var url;
    if (pois.length === 1) {
      url = 'https://www.google.com/maps?q=' + pois[0].lat + ',' + pois[0].lng;
    } else {
      var origin = pois[0].lat + ',' + pois[0].lng;
      var dest = pois[pois.length - 1].lat + ',' + pois[pois.length - 1].lng;
      var wp = pois.slice(1, -1).map(function (p) { return p.lat + ',' + p.lng; }).join('|');
      url = 'https://www.google.com/maps/dir/?api=1&origin=' + origin +
        '&destination=' + dest + (wp ? '&waypoints=' + wp : '') + '&travelmode=driving';
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  window.abrirEnGoogleMaps = abrirEnGoogleMaps;

  // ── Enter en input Salma ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('mapa-salma-input');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          enviarMensajeSalma();
        }
      });
    }
  });

  // ── Estilos dark del mapa ─────────────────────────────────────
  function _estilosMapa() {
    return [
      { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#d4d4d4' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#050505' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
      { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111111' }] },
      { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#a0a0a0' }] },
      { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3d3d3d' }] },
      { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
      { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#c8c8c8' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2a' }] },
      { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a90b8' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2e2e2e' }] },
      { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#d4a017' }] },
      { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#e0e0e0' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#141414' }] },
      { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#1c2b1c' }] }
    ];
  }

})();
