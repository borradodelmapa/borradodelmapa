/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — fotos-viaje.js
   Pestañas "RUTA · FOTOS" dentro de cada guía propia (29 sept 2026, caso 14 paso 2).
   FOTOS reúne TODAS las fotos de ese viaje en un solo sitio:
     - users/{uid}/fotos con routeId = la guía (subidas aquí, desde el mapa —
       "tocar el mapa → foto en este punto" ya guarda routeId de la ruta activa—,
       desde el chat o desde viaje-fotos.html)
     - users/{uid}/pins con foto y routeId (si su foto no está ya en fotos)
     - maps/{id}.photos (fotos viejas del cuaderno)
   Subir: varias de golpe; se leen fecha y GPS (EXIF), se reducen a 1600 px y se
   guardan SIEMPRE en la nube (R2 vía /upload-gallery-photo, UNA A UNA: el Worker
   nombra con Date.now() y dos subidas en el mismo milisegundo se pisarían — caso 03).
   💶 Solo almacenamiento R2 (~0,01–0,02 €/mes por cada 1.000 fotos). Sin APIs de pago.
   ═══════════════════════════════════════════ */

const fotosViaje = (() => {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toDate = v => { if (!v) return null; const d = v.toDate ? v.toDate() : new Date(v); return isNaN(d) ? null : d; };
  const MAX_SIDE = 1600;
  const IC_PLUS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  const IC_CAM = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  const IC_TRASH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
  const IC_MAP = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

  let _st = null; // { root, docId, routeData, photos, tab, busy }

  /* ── montaje ── */
  // Se llama después de mapaItinerario.init(). Solo en guías propias guardadas
  // (Paco, 29 sept 2026: en las de Explorar o guardadas de otros, no).
  function mount(container, docId, routeData, options) {
    unmount();
    const u = window.currentUser;
    if (!container || !u || !docId || !(options && options.saved) || (options && options._preview)) return;

    // Lo que pintó mapaItinerario pasa a ser el panel RUTA
    const ruta = document.createElement('div');
    ruta.className = 'fv-pane fv-pane-ruta';
    while (container.firstChild) ruta.appendChild(container.firstChild);

    const tabs = document.createElement('div');
    tabs.className = 'fv-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.hidden = true; // hasta confirmar que la guía es tuya
    tabs.innerHTML = `
      <button type="button" class="fv-tab" role="tab" data-tab="ruta" aria-selected="true">Ruta</button>
      <button type="button" class="fv-tab" role="tab" data-tab="fotos" aria-selected="false">Fotos <span class="fv-count" id="fv-count"></span></button>
      <button type="button" class="fv-tab" role="tab" data-tab="vid" aria-selected="false">Vídeo</button>
      <button type="button" class="fv-tab" role="tab" data-tab="alb" aria-selected="false">Álbum</button>`;

    const fotos = document.createElement('div');
    fotos.className = 'fv-pane fv-pane-fotos';
    fotos.hidden = true;

    // VÍDEO y ÁLBUM: hueco donde se coloca encima el visor del motor (viaje-fotos.html en modo app)
    const media = document.createElement('div');
    media.className = 'fv-pane fv-pane-media';
    media.hidden = true;

    container.appendChild(tabs);
    container.appendChild(ruta);
    container.appendChild(fotos);
    container.appendChild(media);

    _st = { container, tabs, ruta, fotos, media, docId, routeData, photos: null, tab: 'ruta', busy: false, uid: u.uid };
    tabs.addEventListener('click', e => { const b = e.target.closest('.fv-tab'); if (b) _show(b.dataset.tab); });
    // Tocar una parada en el mapa lleva a su tarjeta: volver a RUTA para que se vea
    document.addEventListener('itin:marker-click', _onMarker);

    const my = _st;
    _checkOwn(u.uid, docId).then(own => {
      if (_st !== my) return;
      if (!own) { unmount(true); return; }
      tabs.hidden = false;
      _load().catch(() => {});
      // Venimos del aviso "Tu vídeo está listo": abrir directamente su pestaña
      if (window._fvOpenTab && window._fvOpenTab.guia === docId) { const t = window._fvOpenTab.tab; window._fvOpenTab = null; _show(t); }
      _pillPaint();
    });
  }

  // Guías guardadas de otros viajeros (saved_from) no llevan pestaña Fotos
  async function _checkOwn(uid, docId) {
    try {
      const d = await firebase.firestore().collection('users').doc(uid).collection('maps').doc(docId).get();
      return d.exists && !d.data().saved_from;
    } catch (_) { return false; }
  }

  // keepRuta: deja el contenido del panel RUTA en el contenedor (guía de otro)
  function unmount(keepRuta) {
    if (!_st) return;
    const s = _st; _st = null;
    document.removeEventListener('itin:marker-click', _onMarker);
    _clearPhotoMarkers();
    _mapSmall(false);
    _mapNone(false);
    if (keepRuta && s.ruta && s.container.isConnected) {
      while (s.ruta.firstChild) s.container.insertBefore(s.ruta.firstChild, s.tabs);
      s.tabs.remove(); s.ruta.remove(); s.fotos.remove(); s.media.remove();
    }
    if (s.container) s.container.classList.remove('fv-media-on');
    _closeViewer();
    _mediaDetach();
  }

  function _mapNone(on) {
    const v = document.getElementById('itin-view'); if (!v) return;
    if (v.classList.contains('fv-map-none') === on) return;
    v.classList.toggle('fv-map-none', on);
    setTimeout(() => { try { if (typeof mapaRuta !== 'undefined' && mapaRuta.invalidateSize) mapaRuta.invalidateSize(); } catch (_) {} }, 260);
  }

  function _mapSmall(on) {
    const v = document.getElementById('itin-view'); if (!v) return;
    if (v.classList.contains('fv-map-small') === on) return;
    v.classList.toggle('fv-map-small', on);
    setTimeout(() => { try { if (typeof mapaRuta !== 'undefined' && mapaRuta.invalidateSize) mapaRuta.invalidateSize(); } catch (_) {} }, 260);
  }

  /* ── Fotos en el mapa de la guía (29 sept 2026): con la pestaña FOTOS, las que tienen ubicación
     salen como miniaturas en el mapa de arriba.
     AGRUPADAS (Paco: "que no salgan exageradamente juntas"): las que en pantalla quedarían a menos
     de un dedo (GROUP_PX) se juntan en una miniatura con el número; al acercar el mapa se separan.
     Tocar un grupo acerca el mapa a esas fotos; si ya no se separan (mismo sitio), abre la primera.
     💶 0 €: el mapa ya está cargado; los marcadores no se cobran. ── */
  const GROUP_PX = 46;
  let _pm = [], _pmGen = 0, _pmOff = null, _pmZoom = null, _pmList = null;
  const _thumbCache = new Map(); // url → miniatura (dataURL) | null
  function _removeMarkers() {
    _pm.forEach(m => { try { if (m.setMap) m.setMap(null); else if (m.remove) m.remove(); } catch (_) {} });
    _pm = [];
  }
  function _clearPhotoMarkers() {
    _pmGen++; // corta cualquier pintado a medias
    _removeMarkers();
    if (_pmOff) { try { _pmOff(); } catch (_) {} _pmOff = null; }
    _pmZoom = null; _pmList = null;
  }
  // Miniatura cuadrada con marco naranja (si la imagen deja leerse; si no, la foto tal cual)
  function _thumbIcon(url) {
    return new Promise(res => {
      const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async';
      im.onload = () => {
        try {
          const S = 88, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
          g.fillStyle = '#F4630B'; g.fillRect(0, 0, S, S);
          const k = Math.max((S - 8) / im.width, (S - 8) / im.height), w = im.width * k, h = im.height * k;
          g.save(); g.beginPath(); g.rect(4, 4, S - 8, S - 8); g.clip(); g.drawImage(im, (S - w) / 2, (S - h) / 2, w, h); g.restore();
          res(c.toDataURL('image/jpeg', .8));
        } catch (_) { res(url); }
      };
      im.onerror = () => res(null);
      im.src = url;
    });
  }
  async function _thumbFor(url) { if (!_thumbCache.has(url)) _thumbCache.set(url, await _thumbIcon(url)); return _thumbCache.get(url); }
  // Miniatura de grupo: la foto + el número en un recuadro naranja arriba a la derecha
  const _groupCache = new Map();
  function _groupIcon(base, n) {
    const key = base + '|' + n; if (_groupCache.has(key)) return Promise.resolve(_groupCache.get(key));
    return new Promise(res => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => {
        let out = base;
        try {
          const S = 88, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
          g.drawImage(im, 0, 0, S, S);
          const t = n > 99 ? '99+' : String(n);
          g.font = '800 30px "Barlow Condensed", "Arial Narrow", sans-serif';
          const w = Math.max(32, g.measureText(t).width + 14);
          g.fillStyle = '#F4630B'; g.fillRect(S - w, 0, w, 34);
          g.fillStyle = '#0D0F10'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, S - w / 2, 18);
          out = c.toDataURL('image/jpeg', .85);
        } catch (_) {}
        _groupCache.set(key, out); res(out);
      };
      im.onerror = () => res(base);
      im.src = base;
    });
  }

  async function _photoMarkers() {
    _clearPhotoMarkers();
    const gen = _pmGen;
    const s = _st; if (!s || s.tab !== 'fotos' || !s.photos || typeof mapaRuta === 'undefined' || !mapaRuta._map) return;
    const ok = p => p.lat != null && isFinite(+p.lat) && isFinite(+p.lng) && Math.abs(+p.lat) > .01;
    const list = s.photos.map((p, i) => ({ p, i, lat: +p.lat, lng: +p.lng })).filter(x => ok(x.p)).slice(0, 300);
    if (!list.length) return;
    // Miniaturas (se guardan: al volver a la pestaña o al acercar no se recalculan)
    let next = 0;
    const lane = async () => { while (next < list.length && gen === _pmGen) { const x = list[next++]; x.icon = await _thumbFor(x.p.url); } };
    await Promise.all([lane(), lane(), lane(), lane(), lane(), lane()]); // 6 a la vez
    if (gen !== _pmGen || _st !== s || s.tab !== 'fotos') return; // se cambió de pestaña o se volvió a pintar
    _pmList = list.filter(x => x.icon);
    const map = mapaRuta._map;
    if (mapaRuta._mapType === 'google' && window.google && google.maps) {
      const l = map.addListener('idle', () => { if (map.getZoom() !== _pmZoom) _renderGroups(gen); });
      _pmOff = () => google.maps.event.removeListener(l);
    } else if (map.on) {
      const f = () => _renderGroups(gen);
      map.on('zoomend', f); _pmOff = () => map.off('zoomend', f);
    }
    _renderGroups(gen);
  }

  // Posición en píxeles del "mundo" al zoom actual (sirve para medir distancias en pantalla)
  function _px(map, isG, lat, lng) {
    if (isG) {
      const proj = map.getProjection(); if (!proj) return null;
      const w = proj.fromLatLngToPoint(new google.maps.LatLng(lat, lng)), k = Math.pow(2, map.getZoom());
      return { x: w.x * k, y: w.y * k };
    }
    const p = map.project([lat, lng], map.getZoom()); return { x: p.x, y: p.y };
  }

  async function _renderGroups(gen) {
    if (gen !== _pmGen || !_pmList || typeof mapaRuta === 'undefined' || !mapaRuta._map) return;
    const map = mapaRuta._map, isG = mapaRuta._mapType === 'google' && window.google && google.maps;
    const zoom = map.getZoom(); if (zoom == null) return;
    // Agrupar: cada foto va al primer grupo cuyo centro quede a menos de GROUP_PX; si no, abre uno nuevo
    const groups = [];
    for (const x of _pmList) {
      const q = _px(map, isG, x.lat, x.lng); if (!q) return; // mapa aún sin proyección: lo hará el 'idle'
      let g = null;
      for (const G of groups) { if (Math.abs(G.x - q.x) < GROUP_PX && Math.abs(G.y - q.y) < GROUP_PX) { g = G; break; } }
      if (g) { g.items.push(x); const n = g.items.length; g.x += (q.x - g.x) / n; g.y += (q.y - g.y) / n; g.lat += (x.lat - g.lat) / n; g.lng += (x.lng - g.lng) / n; }
      else groups.push({ x: q.x, y: q.y, lat: x.lat, lng: x.lng, items: [x] });
    }
    const icons = await Promise.all(groups.map(G => G.items.length > 1 ? _groupIcon(G.items[0].icon, G.items.length) : G.items[0].icon));
    if (gen !== _pmGen) return;
    _removeMarkers();
    _pmZoom = zoom;
    groups.forEach((G, k) => {
      const n = G.items.length, pos = { lat: G.lat, lng: G.lng };
      const tap = () => _groupTap(G);
      let m;
      if (isG) {
        m = new google.maps.Marker({ map, position: pos, zIndex: 900 + n, title: n > 1 ? `${n} fotos` : 'Ver foto', icon: { url: icons[k], scaledSize: new google.maps.Size(42, 42), anchor: new google.maps.Point(21, 21) } });
        m.addListener('click', tap);
      } else if (typeof L !== 'undefined' && map.addLayer) {
        m = L.marker([pos.lat, pos.lng], { icon: L.divIcon({ className: 'fv-map-thumb', html: `<img src="${esc(icons[k])}" alt="">`, iconSize: [42, 42], iconAnchor: [21, 21] }), zIndexOffset: 900 + n }).addTo(map);
        m.on('click', tap);
      }
      if (m) _pm.push(m);
    });
  }

  // Tocar un grupo: acercar el mapa hasta que se separen; si ya están en el mismo sitio, abrir la primera
  function _groupTap(G) {
    const first = G.items[0].i;
    if (G.items.length === 1) { _openViewer(first); return; }
    const map = mapaRuta._map, isG = mapaRuta._mapType === 'google' && window.google && google.maps;
    let a = 90, b = 180, c = -90, d = -180;
    G.items.forEach(x => { a = Math.min(a, x.lat); b = Math.min(b, x.lng); c = Math.max(c, x.lat); d = Math.max(d, x.lng); });
    const spreadKm = _hav({ lat: a, lng: b }, { lat: c, lng: d });
    const maxZoom = 18;
    if (spreadKm < .03 || map.getZoom() >= maxZoom) { _openViewer(first); return; }
    if (isG) map.fitBounds(new google.maps.LatLngBounds({ lat: a, lng: b }, { lat: c, lng: d }), 30);
    else map.fitBounds([[a, b], [c, d]], { padding: [30, 30], maxZoom });
  }

  function _onMarker() { if (_st && _st.tab !== 'ruta') _show('ruta'); }

  function _show(tab) {
    if (!_st) return;
    _st.tab = tab;
    _st.tabs.querySelectorAll('.fv-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    _st.ruta.hidden = tab !== 'ruta';
    _st.fotos.hidden = tab !== 'fotos';
    const isMedia = tab === 'vid' || tab === 'alb';
    _st.media.hidden = !isMedia;
    _st.container.classList.toggle('fv-media-on', isMedia);
    // En el móvil, con FOTOS el mapa se encoge; con VÍDEO y ÁLBUM se quita (necesitan la pantalla)
    _mapSmall(tab === 'fotos');
    _mapNone(isMedia);
    if (tab === 'fotos') {
      if (!_st.photos) _st.fotos.innerHTML = '<p class="fv-note fv-pad">Cargando tus fotos…</p>';
      else _paint();
    }
    if (isMedia) _mediaShow(tab); else _mediaHide();
    if (tab === 'fotos') _photoMarkers(); else _clearPhotoMarkers();
    try { _st.container.scrollTop = 0; } catch (_) {}
  }

  /* ── VÍDEO y ÁLBUM ──
     El motor es viaje-fotos.html en modo app (?embed=1&guia=<id>), dentro de un iframe que vive
     en el <body> (fijo, colocado encima del hueco .fv-pane-media). Así se puede salir de la
     guía mientras se crea el vídeo sin cortarlo (mover un iframe en el DOM lo recarga). */
  const MED = { frame: null, holder: null, guia: null, engine: null, encoding: false, hasVideo: false, pill: '', done: false, ro: null };
  // Guías fuera de la zona del motor nuevo (avisa 'unsupported'): su VÍDEO vuelve al motor anterior
  const OLD_ENGINE = new Set();

  // v=: subirlo al cambiar viaje-fotos.html (si no, el móvil puede usar una copia vieja)
  // VÍDEO: motor nuevo (video.html: mapa propio + relieve 3D + vehículo 3D, 30 sept 2026); ÁLBUM y guías fuera de zona: el anterior
  function _engineFor(guia, tab) { return tab === 'vid' && !OLD_ENGINE.has(guia) ? 'nuevo' : 'viejo'; }
  function _mediaURL(guia, tab, engine) {
    return engine === 'nuevo' ? `/video.html?v=6&guia=${encodeURIComponent(guia)}`
      : `/viaje-fotos.html?embed=1&v=14&guia=${encodeURIComponent(guia)}&tab=${tab}`;
  }

  function _mediaShow(tab) {
    const s = _st; if (!s) return;
    // Otro viaje creando su vídeo: no se corta
    const engine = _engineFor(s.docId, tab);
    if (MED.frame && (MED.guia !== s.docId || MED.engine !== engine) && MED.encoding) {
      s.media.innerHTML = `<div class="fv-empty fv-pad"><b>Se está creando otro vídeo</b><p>${esc(MED.pill || '')}</p><p class="fv-note">Cuando termine podrás hacer el de este viaje.</p></div>`;
      return;
    }
    s.media.innerHTML = '';
    if (!MED.frame || MED.guia !== s.docId || MED.engine !== engine) {
      if (MED.frame) _mediaDestroy();
      MED.holder = document.createElement('div');
      MED.holder.className = 'fv-media-holder';
      MED.frame = document.createElement('iframe');
      MED.frame.className = 'fv-media-frame';
      MED.frame.title = 'Vídeo y álbum del viaje';
      MED.frame.setAttribute('allow', 'fullscreen; web-share; screen-wake-lock');
      MED.frame.src = _mediaURL(s.docId, tab, engine);
      MED.holder.appendChild(MED.frame);
      document.body.appendChild(MED.holder);
      MED.guia = s.docId; MED.engine = engine; MED.encoding = false; MED.hasVideo = false; MED.pill = ''; MED.done = false;
    } else {
      _post({ tab });
      if (s._mediaStale) { s._mediaStale = false; _post({ reload: true }); }
    }
    MED.holder.classList.add('on');
    if (tab === 'vid') MED.done = false; // ya lo ha visto: el aviso "listo" no vuelve a salir
    _place();
    if (MED.ro) MED.ro.disconnect();
    MED.ro = new ResizeObserver(_place); MED.ro.observe(s.media);
    window.addEventListener('resize', _place);
    setTimeout(_place, 320); // después de que el mapa termine de plegarse
    _pillPaint();
  }
  function _place() {
    const s = _st; if (!s || !MED.holder || s.media.hidden) return;
    const r = s.media.getBoundingClientRect();
    Object.assign(MED.holder.style, { top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px' });
  }
  function _mediaHide() {
    if (MED.holder) MED.holder.classList.remove('on');
    if (MED.ro) { MED.ro.disconnect(); MED.ro = null; }
    window.removeEventListener('resize', _place);
    _pillPaint();
  }
  // Al cerrar la guía: si no se está creando un vídeo (ni hay uno listo sin ver), se libera
  // la memoria del motor (hasta 60 fotos en HD); si no, sigue en segundo plano.
  function _mediaDetach() {
    _mediaHide();
    if (MED.frame && !MED.encoding && !(MED.hasVideo && MED.done)) _mediaDestroy();
  }
  function _mediaDestroy() {
    if (MED.holder) MED.holder.remove();
    MED.frame = null; MED.holder = null; MED.guia = null; MED.engine = null; MED.encoding = false; MED.hasVideo = false; MED.pill = ''; MED.done = false;
    _pillPaint();
  }
  function _post(o) {
    try { if (MED.frame && MED.frame.contentWindow) MED.frame.contentWindow.postMessage(Object.assign({ type: 'bdm-host' }, o), location.origin); } catch (_) {}
  }
  window.addEventListener('message', e => {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'bdm-vf') return;
    if (!MED.frame || e.source !== MED.frame.contentWindow) return;
    const d = e.data;
    // Guía fuera de la zona del motor nuevo: vuelve al anterior sin que el usuario note nada
    if (d.unsupported && MED.guia) {
      OLD_ENGINE.add(MED.guia);
      const t = _st && _st.docId === MED.guia ? _st.tab : null;
      _mediaDestroy();
      if (t === 'vid' || t === 'alb') _mediaShow(t);
      return;
    }
    // "Subir fotos" desde VÍDEO/ÁLBUM vacíos: se suben como en FOTOS (misma revisión de fotos intrusas)
    if (Array.isArray(d.upload) && d.upload.length && _st && _st.docId === MED.guia) {
      _show('fotos');
      _upload(d.upload);
      return;
    }
    MED.encoding = !!d.encoding; MED.hasVideo = !!d.hasVideo;
    if ('pill' in d) { MED.pill = d.pill || ''; MED.done = !!d.done; }
    _pillPaint();
  });

  // Aviso flotante: cómo va el vídeo cuando no se está mirando la pestaña VÍDEO de ese viaje
  function _pillPaint() {
    let p = document.getElementById('fv-gen-pill');
    const viewing = !!(_st && _st.tab === 'vid' && MED.guia === _st.docId && MED.holder && MED.holder.classList.contains('on'));
    const show = !!(MED.frame && MED.pill && !viewing && (MED.encoding || MED.done));
    if (!show) { if (p) p.hidden = true; return; }
    if (!p) {
      p = document.createElement('button');
      p.id = 'fv-gen-pill'; p.type = 'button'; p.className = 'fv-gen-pill';
      p.addEventListener('click', _pillGo);
      document.body.appendChild(p);
    }
    p.hidden = false;
    p.classList.toggle('done', MED.done);
    p.textContent = MED.done ? 'Tu vídeo está listo · Verlo' : MED.pill;
  }
  function _pillGo() {
    const guia = MED.guia; if (!guia) return;
    if (_st && _st.docId === guia) { _show('vid'); return; }
    // Abrir la guía de ese vídeo y su pestaña VÍDEO
    window._fvOpenTab = { guia, tab: 'vid' };
    if (typeof salma !== 'undefined' && salma.cargarGuia) salma.cargarGuia(guia);
  }

  /* ── cargar todas las fotos del viaje ── */
  async function _load() {
    const s = _st; if (!s) return;
    const U = firebase.firestore().collection('users').doc(s.uid);
    const [fq, pq, mdoc] = await Promise.all([
      U.collection('fotos').where('routeId', '==', s.docId).get().catch(() => ({ docs: [] })),
      U.collection('pins').where('routeId', '==', s.docId).get().catch(() => ({ docs: [] })),
      U.collection('maps').doc(s.docId).get().catch(() => null),
    ]);
    const out = [], seen = new Set();
    fq.docs.forEach(d => {
      const x = d.data(); if (!x.url || x.type === 'video' || x.tag === 'documento') return;
      seen.add(x.url);
      out.push({ id: d.id, kind: 'foto', url: x.url, date: toDate(x.takenAt || x.createdAt), lat: x.lat, lng: x.lng, place: x.caption || '', origName: x.origName || '', takenAt: x.takenAt || '' });
    });
    pq.docs.forEach(d => {
      const x = d.data(); if (!x.photoUrl || seen.has(x.photoUrl)) return;
      seen.add(x.photoUrl);
      out.push({ id: d.id, kind: 'pin', url: x.photoUrl, date: toDate(x.createdAt), lat: x.lat, lng: x.lng, place: x.locName || x.label || '' });
    });
    const legacy = mdoc && mdoc.exists ? (mdoc.data().photos || []) : [];
    legacy.forEach((p, i) => {
      const url = typeof p === 'string' ? p : (p && (p.url || p.photoUrl)); if (!url || seen.has(url)) return;
      seen.add(url);
      out.push({ id: 'legacy' + i, kind: 'legacy', url, date: toDate(p && (p.takenAt || p.date || p.createdAt)), place: (p && (p.caption || p.stop || '')) || '' });
    });
    out.sort((a, b) => (a.date || 0) - (b.date || 0));
    if (_st !== s) return;
    s.photos = out;
    _count();
    if (s.tab === 'fotos') _paint();
  }

  function _count() {
    const el = _st && _st.tabs.querySelector('#fv-count');
    if (el) el.textContent = _st.photos && _st.photos.length ? _st.photos.length : '';
  }

  /* ── pintar el panel FOTOS ── */
  function _dayKey(d) { return d ? d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() : 'x'; }
  function _dayLabel(d) {
    try { return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, ''); } catch (_) { return ''; }
  }

  function _paint() {
    const s = _st; if (!s) return;
    const P = s.photos || [];
    const head = `
      <div class="fv-head fv-pad">
        <button type="button" class="fv-add" id="fv-add">${IC_PLUS} Añadir fotos</button>
        <input type="file" id="fv-input" accept="image/*" multiple hidden>
        <div class="fv-progress" id="fv-progress" hidden><div class="fv-progress-t" id="fv-progress-t"></div><div class="fv-bar"><i id="fv-bar"></i></div></div>
      </div>`;
    let body;
    if (!P.length) {
      body = `
        <div class="fv-empty fv-pad">
          <span class="fv-empty-ic">${IC_CAM}</span>
          <b>Aún no hay fotos de este viaje</b>
          <p>Súbelas todas de una vez, cuando te sientes un rato: se ordenan solas por día y quedan guardadas en tu cuenta.</p>
          <p class="fv-note">Las fotos que hagas tocando el mapa durante el viaje también aparecen aquí.</p>
        </div>`;
    } else {
      // Agrupar por día natural; "Día N" cuenta desde la primera foto con fecha
      const groups = new Map();
      P.forEach((p, i) => { const k = _dayKey(p.date); if (!groups.has(k)) groups.set(k, { d: p.date, items: [] }); groups.get(k).items.push(i); });
      // 'Día 1' = primer día del grupo principal de fechas (una foto suelta de otro año no cuenta)
      const mr = _mainRange(P.filter(p => p.date).map(p => +p.date));
      const first = mr ? new Date(mr.a) : (P.find(p => p.date) || {}).date;
      const d0 = first ? new Date(first.getFullYear(), first.getMonth(), first.getDate()) : null;
      body = [...groups.values()].map(g => {
        let lbl = 'Sin fecha';
        if (g.d && d0 && mr && (+g.d < mr.a - GAP || +g.d > mr.b + GAP)) {
          lbl = esc(_dayLabel(g.d)) + ' <span>· ' + g.d.getFullYear() + '</span>';
        } else if (g.d && d0) {
          const n = Math.round((new Date(g.d.getFullYear(), g.d.getMonth(), g.d.getDate()) - d0) / 864e5) + 1;
          lbl = `Día ${n} <span>· ${esc(_dayLabel(g.d))}</span>`;
        }
        return `<section class="fv-day"><h4 class="fv-day-h">${lbl}<em>${g.items.length}</em></h4><div class="fv-grid">${g.items.map(i => `<button type="button" class="fv-th" data-i="${i}" aria-label="Ver foto"><img src="${esc(P[i].url)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div></section>`;
      }).join('');
      body = `<div class="fv-days fv-pad">${body}</div>`;
    }
    const ready = s._justUploaded && P.length >= 2 ? `
      <button type="button" class="fv-ready fv-pad" id="fv-ready">
        <span class="fv-ready-play" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg></span>
        <span><b>Tu vídeo ya está montado</b><span>Con tus ${P.length} fotos, listo para ver y compartir</span></span>
        <span class="fv-ready-go" aria-hidden="true">→</span>
      </button>` : '';
    s.fotos.innerHTML = head + ready + body;
    const rb = s.fotos.querySelector('#fv-ready');
    if (rb) rb.addEventListener('click', () => { s._justUploaded = false; _show('vid'); });
    s.fotos.querySelector('#fv-add').addEventListener('click', () => { if (!s.busy) s.fotos.querySelector('#fv-input').click(); });
    s.fotos.querySelector('#fv-input').addEventListener('change', e => { const files = [...(e.target.files || [])]; e.target.value = ''; if (files.length) _upload(files); });
    s.fotos.querySelectorAll('.fv-th').forEach(b => b.addEventListener('click', () => _openViewer(+b.dataset.i)));
    if (s.busy) _progress(s._prog || '', s._progPct || 0);
    else { _checkExisting(); if (s.tab === 'fotos') _photoMarkers(); }
  }

  /* ── subir ── */
  let _exifP = null;
  function _loadExif() {
    if (typeof exifr !== 'undefined') return Promise.resolve();
    if (_exifP) return _exifP;
    _exifP = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://cdn.jsdelivr.net/npm/exifr@7.1.3/dist/lite.umd.js'; sc.onload = res; sc.onerror = () => { _exifP = null; rej(); }; document.head.appendChild(sc); });
    return _exifP;
  }
  async function _readMeta(f) {
    let lat = null, lng = null, date = null;
    try { await _loadExif(); } catch (_) {}
    if (typeof exifr !== 'undefined') {
      try { const g = await exifr.gps(f); if (g && isFinite(g.latitude) && !(g.latitude === 0 && g.longitude === 0)) { lat = g.latitude; lng = g.longitude; } } catch (_) {}
      try { const m = await exifr.parse(f, { tiff: true, exif: true, gps: false, interop: false, ifd1: false, xmp: false, icc: false, iptc: false, jfif: false, ihdr: false }); date = m && (m.DateTimeOriginal || m.CreateDate || m.ModifyDate) || null; if (date && !(date instanceof Date)) date = new Date(date); if (date && isNaN(date)) date = null; } catch (_) {}
    }
    return { lat, lng, date: date || new Date(f.lastModified || Date.now()), hasDate: !!date };
  }
  async function _toJpeg(f) {
    let img;
    try { img = await createImageBitmap(f); } catch (_) {
      img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(f); });
    }
    const sw = img.width, sh = img.height, k = Math.min(1, MAX_SIDE / Math.max(sw, sh));
    const c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height);
    if (img.close) img.close();
    return await new Promise(r => c.toBlob(r, 'image/jpeg', .86));
  }
  function _progress(t, pct) {
    const s = _st; if (!s) return;
    s._prog = t; s._progPct = pct;
    const box = s.fotos.querySelector('#fv-progress'); if (!box) return;
    box.hidden = !t;
    s.fotos.querySelector('#fv-progress-t').textContent = t;
    s.fotos.querySelector('#fv-bar').style.width = Math.round(pct * 100) + '%';
    const add = s.fotos.querySelector('#fv-add'); if (add) add.disabled = !!s.busy;
  }

  /* ── fotos intrusas (29 sept 2026, caso p-mun0e1qy0f3) ──
     "Que no entre una foto de Nepal en una guía de Asturias". Sin IA, 0 €:
     - con GPS: lejos de TODAS las paradas de la guía → no es de este viaje;
     - sin GPS pero con fecha real (EXIF): separada más de 2 días del grupo principal de fechas del viaje.
     Nunca se aparta nada sola: se pregunta. */
  const GAP = 2 * 864e5;
  // Grupo principal de fechas: el tramo sin huecos de más de 2 días con más fotos (null si no hay uno claro)
  function _mainRange(dates) {
    const ds = dates.filter(Boolean).slice().sort((a, b) => a - b);
    if (ds.length < 3) return null;
    let best = null, st = 0;
    for (let i = 1; i <= ds.length; i++) {
      if (i === ds.length || ds[i] - ds[i - 1] > GAP) { const n = i - st; if (!best || n > best.n) best = { n, a: ds[st], b: ds[i - 1] }; st = i; }
    }
    return best && best.n >= ds.length * .5 ? best : null;
  }
  function _stopsOf(s) {
    return ((s.routeData && s.routeData.stops) || []).map(p => ({ lat: +p.lat, lng: +p.lng })).filter(p => isFinite(p.lat) && isFinite(p.lng) && Math.abs(p.lat) > .01);
  }
  // La ruta como línea: carretera real de la guía si la tiene (road_geometry), si no las paradas en orden
  function _lineOf(s) {
    const rg = s.routeData && s.routeData.road_geometry;
    if (rg && Array.isArray(rg.coords) && rg.coords.length > 1) return rg.coords.map(c => ({ lat: +c[0], lng: +c[1] }));
    return _stopsOf(s);
  }
  // Distancia (km) de p a la línea: al tramo más cercano (proyección plana local, suficiente para esto)
  function _kmTo(line, p) {
    if (line.length === 1) return _hav(line[0], p);
    let m = Infinity; const k = Math.cos(p.lat * Math.PI / 180);
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1], b = line[i];
      const ax = (a.lng - p.lng) * k, ay = a.lat - p.lat, bx = (b.lng - p.lng) * k, by = b.lat - p.lat;
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      const t = L ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L)) : 0;
      const q = { lat: p.lat + ay + t * dy, lng: p.lng + (ax + t * dx) / (k || 1) };
      const d = _hav(q, p); if (d < m) m = d;
    }
    return m;
  }
  function _hav(a, b) { const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r; const x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); }
  // items: [{lat, lng, date, hasDate}] → [{i, why}] de los que no parecen del viaje
  function _suspects(s, items, refDates) {
    const stops = _stopsOf(s);
    let span = 0; for (let i = 0; i < stops.length; i++) for (let j = i + 1; j < stops.length; j++) span = Math.max(span, _hav(stops[i], stops[j]));
    const line = _lineOf(s);
    const farKm = Math.max(60, span * .15);
    // Grupo principal de fechas: el tramo sin huecos de más de 2 días con más fotos
    const ds = [...refDates, ...items.filter(x => x.hasDate && x.date).map(x => +x.date)].filter(Boolean).sort((a, b) => a - b);
    const best = _mainRange(ds);
    const out = [];
    items.forEach((x, i) => {
      const hasGps = x.lat != null && isFinite(x.lat) && Math.abs(x.lat) > .01;
      if (hasGps && stops.length) {
        const km = _kmTo(line, { lat: +x.lat, lng: +x.lng });
        if (km > farKm) out.push({ i, why: `A ${Math.round(km).toLocaleString('es-ES')} km de la ruta` });
        return; // con GPS cerca de la ruta: es del viaje
      }
      if (best && x.hasDate && x.date && (+x.date < best.a - GAP || +x.date > best.b + GAP)) {
        out.push({ i, why: `De otra fecha (${_dayLabel(x.date)} ${x.date.getFullYear()})` });
      }
    });
    return out;
  }

  // Panel "Estas N no parecen de este viaje": thumbs marcados (= apartar) que se pueden desmarcar
  function _review(title, sub, list, btns) {
    const s = _st; if (!s) return;
    const box = document.createElement('div');
    box.className = 'fv-review fv-pad';
    box.innerHTML = `<b class="fv-review-t">${esc(title)}</b><p>${esc(sub)}</p>
      <div class="fv-review-grid">${list.map((x, k) => `<button type="button" class="fv-th fv-pick on" data-k="${k}" aria-pressed="true"><img src="${esc(x.thumb)}" alt="" decoding="async"><i aria-hidden="true"></i><span class="fv-review-why">${esc(x.why)}</span></button>`).join('')}</div>
      <div class="fv-review-btns">${btns.map((b, k) => `<button type="button" class="${b.main ? 'fv-add' : 'fv-review-alt'}" data-b="${k}">${esc(b.label)}</button>`).join('')}</div>`;
    const old = s.fotos.querySelector('.fv-review'); if (old) old.remove();
    const head = s.fotos.querySelector('.fv-head');
    if (head) head.after(box); else s.fotos.prepend(box);
    box.querySelectorAll('.fv-pick').forEach(t => t.addEventListener('click', () => { t.classList.toggle('on'); t.setAttribute('aria-pressed', String(t.classList.contains('on'))); }));
    box.querySelectorAll('[data-b]').forEach(el => el.addEventListener('click', () => {
      const marked = new Set([...box.querySelectorAll('.fv-pick.on')].map(t => +t.dataset.k));
      box.remove();
      btns[+el.dataset.b].fn(marked);
    }));
    try { box.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (_) {}
  }

  async function _upload(files) {
    const s = _st; if (!s || s.busy) return;
    s.busy = true;
    // 1) Leer fecha y GPS de todas antes de subir nada
    const items = [];
    for (let i = 0; i < files.length; i++) {
      if (_st !== s) return;
      _progress(`Revisando ${i + 1} de ${files.length}…`, i / files.length);
      const meta = await _readMeta(files[i]);
      items.push(Object.assign({ f: files[i] }, meta));
    }
    s.busy = false; s._prog = ''; _progress('', 0);
    if (_st !== s) return;
    // 2) ¿Alguna no parece de este viaje?
    const ref = (s.photos || []).filter(p => p.date && p.kind !== 'legacy').map(p => +p.date);
    const sus = _suspects(s, items, ref);
    if (!sus.length) return _uploadItems(items.map(x => Object.assign(x, { route: s.docId })));
    const title = s.routeData && (s.routeData.title || s.routeData.name) || 'este viaje';
    const list = sus.map(x => ({ thumb: URL.createObjectURL(items[x.i].f), why: x.why, i: x.i }));
    const nOk = items.length - sus.length;
    _review(`${sus.length === 1 ? 'Esta foto no parece' : `Estas ${sus.length} fotos no parecen`} de este viaje`,
      `Ni el sitio ni la fecha cuadran con «${title}». Las marcadas van a Fotos sin viaje; desmarca las que sí sean de aquí.`,
      list, [
        { label: nOk ? `Subir y apartar las marcadas` : 'Guardarlas en Fotos sin viaje', main: true, fn: marked => {
          const out = new Set([...marked].map(k => list[k].i));
          list.forEach(x => URL.revokeObjectURL(x.thumb));
          _uploadItems(items.map((x, i) => Object.assign(x, { route: out.has(i) ? null : s.docId })));
        } },
        { label: 'Son de este viaje: subirlas todas', fn: () => {
          list.forEach(x => URL.revokeObjectURL(x.thumb));
          _uploadItems(items.map(x => Object.assign(x, { route: s.docId })));
        } },
        { label: 'Cancelar', fn: () => { list.forEach(x => URL.revokeObjectURL(x.thumb)); } },
      ]);
  }

  async function _uploadItems(items) {
    const s = _st; if (!s || s.busy) return;
    s.busy = true;
    const api = window.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
    const U = firebase.firestore().collection('users').doc(s.uid);
    const existing = new Set((s.photos || []).filter(p => p.origName).map(p => p.origName + '|' + p.takenAt));
    let ok = 0, dup = 0, fail = 0, aside = 0;
    // Pantalla encendida mientras sube (si el móvil lo permite)
    let lock = null; try { lock = await navigator.wakeLock.request('screen'); } catch (_) {}
    for (let i = 0; i < items.length; i++) {
      if (_st !== s) break; // se cerró la guía
      const x = items[i], f = x.f;
      _progress(`Subiendo ${i + 1} de ${items.length}…`, i / items.length);
      try {
        const takenAt = x.date.toISOString();
        if (x.route && existing.has(f.name + '|' + takenAt)) { dup++; continue; }
        const blob = await _toJpeg(f);
        const fd = new FormData(); fd.append('photo', blob, 'viaje.jpg'); fd.append('uid', s.uid);
        const r = await fetch(api + '/upload-gallery-photo', { method: 'POST', body: fd });
        if (!r.ok) throw new Error('subida ' + r.status);
        const { key, url } = await r.json();
        const ref = await U.collection('fotos').add({
          key, url, tag: 'viaje', caption: '', albumId: null, routeId: x.route,
          lat: x.lat, lng: x.lng, source: 'guia', origName: f.name, takenAt, createdAt: takenAt,
        });
        if (x.route) {
          existing.add(f.name + '|' + takenAt);
          s.photos.push({ id: ref.id, kind: 'foto', url, date: x.date, lat: x.lat, lng: x.lng, place: '', origName: f.name, takenAt });
          ok++;
        } else aside++;
      } catch (e) { fail++; console.warn('[fotos-viaje] subida', e); }
    }
    try { if (lock) lock.release(); } catch (_) {}
    s.busy = false;
    if (aside) _stray = null; // "Fotos sin viaje" tiene fotos nuevas
    if (_st !== s) return;
    s.photos.sort((a, b) => (a.date || 0) - (b.date || 0));
    _count();
    // Tu mundo: que la franja de Mis Viajes se recalcule con las fotos nuevas
    try { localStorage.removeItem('bdm_tumundo_sum'); } catch (_) {}
    s._prog = '';
    // El vídeo se monta solo con las fotos nuevas: aviso para ir a verlo (Paco: "aparece al subir fotos")
    if (ok) {
      s._justUploaded = true;
      if (MED.frame && MED.guia === s.docId && !MED.encoding) _post({ reload: true }); else s._mediaStale = true;
    }
    _paint();
    const msg = [ok ? `${ok} ${ok === 1 ? 'foto guardada' : 'fotos guardadas'}` : '', aside ? `${aside} en Fotos sin viaje` : '', dup ? `${dup} ya estaban` : '', fail ? `${fail} no se pudieron subir: vuelve a intentarlo` : ''].filter(Boolean).join(' · ');
    if (msg && typeof showToast === 'function') showToast(msg);
  }

  // Las que YA están en la guía y no parecen de ella (p. ej. subidas antes de existir esta revisión)
  function _okKey(s) { return 'fv-ok-' + s.docId; }
  function _okSet(s) { try { return new Set(JSON.parse(localStorage.getItem(_okKey(s)) || '[]')); } catch (_) { return new Set(); } }
  function _checkExisting() {
    const s = _st; if (!s || !s.photos || s.busy) return;
    const okd = _okSet(s);
    const P = s.photos.filter(p => p.kind !== 'legacy' && !okd.has(p.id));
    // Las fechas sin EXIF no se conocen: se juzga por fecha solo si hay grupo claro (lo decide _suspects)
    const items = P.map(p => ({ lat: p.lat, lng: p.lng, date: p.date, hasDate: !!p.date }));
    const ref = [];
    const sus = _suspects(s, items, ref);
    const bar = s.fotos.querySelector('#fv-intrusas');
    if (!sus.length) { if (bar) bar.remove(); return; }
    if (bar) return;
    const head = s.fotos.querySelector('.fv-head'); if (!head) return;
    head.insertAdjacentHTML('afterend', `<button type="button" class="fv-intrusas fv-pad" id="fv-intrusas"><b>${sus.length === 1 ? '1 foto no parece' : `${sus.length} fotos no parecen`} de este viaje</b><span>Revisar</span></button>`);
    s.fotos.querySelector('#fv-intrusas').addEventListener('click', () => {
      s.fotos.querySelector('#fv-intrusas').remove();
      const list = sus.map(x => ({ thumb: P[x.i].url, why: x.why, p: P[x.i] }));
      _review(`${sus.length === 1 ? 'Esta foto no parece' : `Estas ${sus.length} fotos no parecen`} de este viaje`,
        'Las marcadas salen de la guía y pasan a Fotos sin viaje (no se borran). Desmarca las que sí sean de aquí.',
        list, [
          { label: 'Sacar las marcadas del viaje', main: true, fn: async marked => {
            const db = firebase.firestore(), U = db.collection('users').doc(s.uid), batch = db.batch();
            const out = list.filter((_, k) => marked.has(k)).map(x => x.p);
            const keep = list.filter((_, k) => !marked.has(k)).map(x => x.p.id);
            out.forEach(p => batch.update(U.collection(p.kind === 'pin' ? 'pins' : 'fotos').doc(p.id), { routeId: null }));
            try {
              if (out.length) await batch.commit();
              if (keep.length) { const o = _okSet(s); keep.forEach(id => o.add(id)); try { localStorage.setItem(_okKey(s), JSON.stringify([...o])); } catch (_) {} }
              const ids = new Set(out.map(p => p.id));
              s.photos = s.photos.filter(p => !ids.has(p.id));
              _stray = null; try { localStorage.removeItem('bdm_tumundo_sum'); } catch (_) {}
              _count(); _paint();
              if (MED.frame && MED.guia === s.docId && !MED.encoding) _post({ reload: true }); else s._mediaStale = true;
              if (out.length && typeof showToast === 'function') showToast(`${out.length} ${out.length === 1 ? 'foto pasada' : 'fotos pasadas'} a Fotos sin viaje`);
            } catch (_) { if (typeof showToast === 'function') showToast('No se pudieron sacar. Prueba otra vez.'); _paint(); }
          } },
          { label: 'Son de este viaje', fn: () => {
            const o = _okSet(s); list.forEach(x => o.add(x.p.id)); try { localStorage.setItem(_okKey(s), JSON.stringify([...o])); } catch (_) {}
          } },
        ]);
    });
  }

  /* ── ver en grande ── */
  let _vw = null;
  function _openViewer(i) {
    const s = _st; if (!s || !s.photos[i]) return;
    _closeViewer(true);
    _vw = document.createElement('div');
    _vw.className = 'fv-viewer';
    _vw.setAttribute('role', 'dialog');
    _vw.setAttribute('aria-label', 'Foto');
    document.body.appendChild(_vw);
    _vw._i = i;
    _vwPaint();
    if (window.pushModal) window.pushModal('fotos-viaje', () => _closeViewer(true));
  }
  function _vwPaint() {
    const s = _st; if (!_vw || !s) return;
    const P = s.photos, i = _vw._i, p = P[i];
    const when = p.date ? p.date.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    const hasLoc = isFinite(+p.lat) && isFinite(+p.lng) && p.lat != null && Math.abs(+p.lat) > .01;
    _vw.innerHTML = `
      <button type="button" class="fv-v-close" aria-label="Cerrar">✕</button>
      <img class="fv-v-img" src="${esc(p.url)}" alt="">
      <div class="fv-v-bar">
        <button type="button" class="fv-v-nav" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Anterior">‹</button>
        <div class="fv-v-info"><b>${esc(when)}</b><span>${esc(p.place || '')}${hasLoc ? ` <a href="https://www.google.com/maps/search/?api=1&query=${(+p.lat).toFixed(6)},${(+p.lng).toFixed(6)}" target="_blank" rel="noopener">${IC_MAP} Ver sitio</a>` : ''}</span><em>${i + 1} / ${P.length}</em></div>
        ${p.kind === 'foto' ? `<button type="button" class="fv-v-del" aria-label="Quitar esta foto">${IC_TRASH}</button>` : ''}
        <button type="button" class="fv-v-nav" data-d="1" ${i === P.length - 1 ? 'disabled' : ''} aria-label="Siguiente">›</button>
      </div>`;
    _vw.querySelector('.fv-v-close').onclick = () => _closeViewer();
    _vw.querySelectorAll('.fv-v-nav').forEach(b => b.onclick = () => { _vw._i = Math.max(0, Math.min(P.length - 1, _vw._i + (+b.dataset.d))); _vwPaint(); });
    const del = _vw.querySelector('.fv-v-del');
    if (del) del.onclick = async () => {
      if (!confirm('¿Quitar esta foto del viaje?')) return;
      try {
        await firebase.firestore().collection('users').doc(s.uid).collection('fotos').doc(p.id).delete();
        P.splice(i, 1); _count();
        try { localStorage.removeItem('bdm_tumundo_sum'); } catch (_) {}
        if (!P.length) { _closeViewer(); _paint(); return; }
        _vw._i = Math.min(i, P.length - 1); _vwPaint(); _paint();
      } catch (_) { if (typeof showToast === 'function') showToast('No se pudo quitar. Prueba otra vez.'); }
    };
    // Deslizar a los lados
    let x0 = null;
    _vw.ontouchstart = e => { x0 = e.touches[0].clientX; };
    _vw.ontouchend = e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) < 50) return; const n = _vw._i + (dx < 0 ? 1 : -1); if (n >= 0 && n < P.length) { _vw._i = n; _vwPaint(); } };
  }
  // fromHistory: ya lo cerró el botón atrás (no tocar historial)
  function _closeViewer(fromHistory) {
    if (!_vw) return;
    _vw.remove(); _vw = null;
    if (!fromHistory && window.popModal) window.popModal('fotos-viaje');
  }

  /* ═══ FOTOS SIN VIAJE (caso 14 paso 4) ═══
     Fotos de la cuenta que no están en ninguna guía (routeId null): las de la Galería vieja,
     las del chat sin ruta abierta, las compartidas desde el móvil sin elegir ruta…
     Se eligen y se pasan a un viaje (o se quitan). Sustituye a la Galería. */
  let _stray = null; // { uid, list } — caché de la sesión
  async function _loadStray(force) {
    const u = window.currentUser; if (!u) return [];
    if (!force && _stray && _stray.uid === u.uid) return _stray.list;
    const q = await firebase.firestore().collection('users').doc(u.uid).collection('fotos').where('routeId', '==', null).limit(500).get();
    const list = [];
    q.docs.forEach(d => {
      const x = d.data(); if (!x.url || x.type === 'video' || x.tag === 'documento' || x.tag === 'cartel') return;
      list.push({ id: d.id, url: x.url, date: toDate(x.takenAt || x.createdAt), lat: x.lat, lng: x.lng, place: x.caption || '' });
    });
    list.sort((a, b) => (a.date || 0) - (b.date || 0));
    _stray = { uid: u.uid, list };
    return list;
  }

  // Fila en Mis Viajes (solo si hay alguna)
  function strayStrip(el) {
    if (!el || !window.currentUser) return;
    el.hidden = true;
    _loadStray().then(list => {
      if (!list.length || !el.isConnected) return;
      el.className = 'fv-stray-strip';
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
      el.innerHTML = `<span class="fv-stray-ic">${IC_CAM}</span><span class="fv-stray-txt"><b>Fotos sin viaje</b><span>${list.length} ${list.length === 1 ? 'foto que no está' : 'fotos que no están'} en ningún viaje</span></span><span class="fv-stray-go" aria-hidden="true">→</span>`;
      el.hidden = false;
      const go = () => showState('fotos-sin-viaje');
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    }).catch(() => {});
  }

  let _sel = new Set();
  async function renderStray() {
    const $c = document.getElementById('app-content');
    if (!window.currentUser) { window._afterLogin = 'fotos-sin-viaje'; if (typeof openModal === 'function') openModal(); return; }
    _sel = new Set();
    $c.innerHTML = `
      <div class="fv-stray fade-in" id="fv-stray">
        <button class="tm-back" type="button" id="fv-stray-back">‹ Mis Viajes</button>
        <h2 class="fv-stray-title">Fotos <span>sin viaje</span></h2>
        <p class="fv-stray-lede" id="fv-stray-lede">Cargando…</p>
        <div id="fv-stray-body"></div>
      </div>
      <div class="fv-stray-bar" id="fv-stray-bar" hidden>
        <span id="fv-stray-n"></span>
        <button type="button" class="fv-stray-del" id="fv-stray-del" aria-label="Quitar las fotos elegidas">${IC_TRASH}</button>
        <button type="button" class="fv-stray-vid" id="fv-stray-vid">Crear vídeo</button>
        <button type="button" class="fv-stray-move" id="fv-stray-move">Pasar a un viaje</button>
      </div>`;
    document.getElementById('fv-stray-back').addEventListener('click', () => { window._rutasTab = 'mis'; showState('rutas'); });
    let list;
    try { list = await _loadStray(true); } catch (_) { document.getElementById('fv-stray-lede').textContent = 'No se pudieron cargar. Revisa la conexión y vuelve a entrar.'; return; }
    if (!document.getElementById('fv-stray')) return;
    _strayPaint(list);
    document.getElementById('fv-stray-move').addEventListener('click', () => _strayPickTrip());
    document.getElementById('fv-stray-del').addEventListener('click', () => _strayDelete());
    document.getElementById('fv-stray-vid').addEventListener('click', () => _strayVideo());
  }

  function _strayPaint(list) {
    const lede = document.getElementById('fv-stray-lede'), body = document.getElementById('fv-stray-body'); if (!body) return;
    if (!list.length) {
      lede.textContent = 'Todas tus fotos están en algún viaje.';
      body.innerHTML = '';
      _strayBar();
      return;
    }
    lede.textContent = `${list.length} ${list.length === 1 ? 'foto' : 'fotos'}. Toca las que sean del mismo viaje (o el día entero) y pásalas a su guía.`;
    const groups = new Map();
    list.forEach((p, i) => { const k = _dayKey(p.date); if (!groups.has(k)) groups.set(k, { d: p.date, items: [] }); groups.get(k).items.push(i); });
    body.innerHTML = `<div class="fv-days">${[...groups.values()].map(g => `
      <section class="fv-day"><button type="button" class="fv-day-h fv-day-pick" data-items="${g.items.join(',')}">${g.d ? esc(_dayLabel(g.d)) + ` <span>· ${g.d.getFullYear()}</span>` : 'Sin fecha'}<em>${g.items.length}</em></button>
      <div class="fv-grid">${g.items.map(i => `<button type="button" class="fv-th fv-pick${_sel.has(list[i].id) ? ' on' : ''}" data-id="${esc(list[i].id)}" aria-pressed="${_sel.has(list[i].id)}"><img src="${esc(list[i].url)}" alt="" loading="lazy" decoding="async"><i aria-hidden="true"></i></button>`).join('')}</div></section>`).join('')}</div>`;
    body.querySelectorAll('.fv-pick').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id; if (_sel.has(id)) _sel.delete(id); else _sel.add(id);
      b.classList.toggle('on', _sel.has(id)); b.setAttribute('aria-pressed', String(_sel.has(id))); _strayBar();
    }));
    body.querySelectorAll('.fv-day-pick').forEach(h => h.addEventListener('click', () => {
      const ids = h.dataset.items.split(',').map(i => list[+i].id);
      const all = ids.every(id => _sel.has(id));
      ids.forEach(id => all ? _sel.delete(id) : _sel.add(id));
      _strayPaint(list);
    }));
    _strayBar();
  }
  function _strayBar() {
    const bar = document.getElementById('fv-stray-bar'); if (!bar) return;
    bar.hidden = !_sel.size;
    document.getElementById('fv-stray-n').textContent = `${_sel.size} ${_sel.size === 1 ? 'elegida' : 'elegidas'}`;
  }

  async function _strayPickTrip() {
    if (!_sel.size) return;
    const uid = window.currentUser.uid;
    const sheet = document.createElement('div');
    sheet.className = 'fv-sheet';
    sheet.innerHTML = `<div class="fv-sheet-box" role="dialog" aria-label="Elige el viaje"><div class="fv-sheet-head"><b>¿A qué viaje?</b><button type="button" class="fv-sheet-x" aria-label="Cerrar">✕</button></div><div class="fv-sheet-list"><p class="fv-note fv-pad">Cargando tus guías…</p></div></div>`;
    document.body.appendChild(sheet);
    const close = (fromHistory) => { sheet.remove(); if (!fromHistory && window.popModal) window.popModal('fv-sheet'); };
    if (window.pushModal) window.pushModal('fv-sheet', () => close(true));
    sheet.querySelector('.fv-sheet-x').onclick = () => close();
    sheet.addEventListener('click', e => { if (e.target === sheet) close(); });
    try {
      const snap = await firebase.firestore().collection('users').doc(uid).collection('maps').orderBy('createdAt', 'desc').limit(100).get();
      const guides = [];
      snap.forEach(d => { const x = d.data(); if (x.estado === 'borrador' || x.saved_from) return; let t = x.nombre; if (!t) { try { t = JSON.parse(x.itinerarioIA || '{}').title; } catch (_) {} } guides.push({ id: d.id, t: t || 'Guía sin nombre', dias: x.dias || x.num_dias || '', dest: x.destino || '' }); });
      const box = sheet.querySelector('.fv-sheet-list');
      if (!guides.length) { box.innerHTML = '<p class="fv-note fv-pad">Aún no tienes guías. Crea una con Salma y vuelve aquí.</p>'; return; }
      box.innerHTML = guides.map(g => `<button type="button" class="fv-sheet-item" data-id="${esc(g.id)}"><b>${esc(g.t)}</b><span>${[g.dias ? g.dias + ' días' : '', esc(g.dest)].filter(Boolean).join(' · ')}</span></button>`).join('');
      box.querySelectorAll('.fv-sheet-item').forEach(b => b.addEventListener('click', async () => {
        const gid = b.dataset.id, name = b.querySelector('b').textContent;
        box.querySelectorAll('button').forEach(x => x.disabled = true);
        try {
          const ids = [..._sel], db = firebase.firestore();
          for (let i = 0; i < ids.length; i += 400) {
            const batch = db.batch();
            ids.slice(i, i + 400).forEach(id => batch.update(db.collection('users').doc(uid).collection('fotos').doc(id), { routeId: gid }));
            await batch.commit();
          }
          close();
          _stray.list = _stray.list.filter(p => !_sel.has(p.id));
          try { localStorage.removeItem('bdm_tumundo_sum'); } catch (_) {}
          if (typeof showToast === 'function') showToast(`${ids.length} ${ids.length === 1 ? 'foto pasada' : 'fotos pasadas'} a «${name}»`);
          _sel = new Set(); _strayPaint(_stray.list);
        } catch (_) {
          box.querySelectorAll('button').forEach(x => x.disabled = false);
          if (typeof showToast === 'function') showToast('No se pudieron pasar. Prueba otra vez.');
        }
      }));
    } catch (_) { sheet.querySelector('.fv-sheet-list').innerHTML = '<p class="fv-note fv-pad">No se pudieron cargar tus guías.</p>'; }
  }

  // Vídeo sin guía (30 sept 2026): el editor de vídeo (video.html?singuia) con las fotos elegidas; las paradas
  // salen de dónde se hizo cada foto. Los ids van por sessionStorage (misma pestaña, mismo origen).
  function _strayVideo() {
    if (!_sel.size) return;
    try { sessionStorage.setItem('bdm_video_fotos', JSON.stringify([..._sel])); } catch (_) {}
    const ov = document.createElement('div');
    ov.className = 'fv-vidsg';
    ov.innerHTML = '<div class="fv-vidsg-h"><button type="button" class="tm-back">‹ Fotos sin viaje</button></div><iframe src="/video.html?v=6&singuia=1" title="Vídeo de tus fotos"></iframe>';
    document.body.appendChild(ov);
    const fr = ov.querySelector('iframe');
    let enc = false;
    const onMsg = e => { if (e.origin === location.origin && e.data && e.data.type === 'bdm-vf' && e.source === fr.contentWindow) enc = !!e.data.encoding; };
    addEventListener('message', onMsg);
    const close = (fromHistory) => {
      if (enc && !fromHistory && !confirm('Se está creando el vídeo. ¿Salir y perderlo?')) return;
      removeEventListener('message', onMsg); ov.remove();
      if (!fromHistory && window.popModal) window.popModal('fv-vidsg');
    };
    if (window.pushModal) window.pushModal('fv-vidsg', () => close(true));
    ov.querySelector('.tm-back').onclick = () => close();
  }

  async function _strayDelete() {
    if (!_sel.size) return;
    if (!confirm(`¿Quitar ${_sel.size} ${_sel.size === 1 ? 'foto' : 'fotos'} de tu cuenta?`)) return;
    const uid = window.currentUser.uid, ids = [..._sel], db = firebase.firestore();
    try {
      for (let i = 0; i < ids.length; i += 400) {
        const batch = db.batch();
        ids.slice(i, i + 400).forEach(id => batch.delete(db.collection('users').doc(uid).collection('fotos').doc(id)));
        await batch.commit();
      }
      _stray.list = _stray.list.filter(p => !_sel.has(p.id));
      try { localStorage.removeItem('bdm_tumundo_sum'); } catch (_) {}
      _sel = new Set(); _strayPaint(_stray.list);
    } catch (_) { if (typeof showToast === 'function') showToast('No se pudieron quitar. Prueba otra vez.'); }
  }

  return { mount, unmount, strayStrip, renderStray };
})();
window.fotosViaje = fotosViaje;
