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
      <button type="button" class="fv-tab" role="tab" data-tab="fotos" aria-selected="false">Fotos <span class="fv-count" id="fv-count"></span></button>`;

    const fotos = document.createElement('div');
    fotos.className = 'fv-pane fv-pane-fotos';
    fotos.hidden = true;

    container.appendChild(tabs);
    container.appendChild(ruta);
    container.appendChild(fotos);

    _st = { container, tabs, ruta, fotos, docId, routeData, photos: null, tab: 'ruta', busy: false, uid: u.uid };
    tabs.addEventListener('click', e => { const b = e.target.closest('.fv-tab'); if (b) _show(b.dataset.tab); });
    // Tocar una parada en el mapa lleva a su tarjeta: volver a RUTA para que se vea
    document.addEventListener('itin:marker-click', _onMarker);

    const my = _st;
    _checkOwn(u.uid, docId).then(own => {
      if (_st !== my) return;
      if (!own) { unmount(true); return; }
      tabs.hidden = false;
      _load().catch(() => {});
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
    _mapSmall(false);
    if (keepRuta && s.ruta && s.container.isConnected) {
      while (s.ruta.firstChild) s.container.insertBefore(s.ruta.firstChild, s.tabs);
      s.tabs.remove(); s.ruta.remove(); s.fotos.remove();
    }
    _closeViewer();
  }

  function _mapSmall(on) {
    const v = document.getElementById('itin-view'); if (!v) return;
    if (v.classList.contains('fv-map-small') === on) return;
    v.classList.toggle('fv-map-small', on);
    setTimeout(() => { try { if (typeof mapaRuta !== 'undefined' && mapaRuta.invalidateSize) mapaRuta.invalidateSize(); } catch (_) {} }, 260);
  }

  function _onMarker() { if (_st && _st.tab !== 'ruta') _show('ruta'); }

  function _show(tab) {
    if (!_st) return;
    _st.tab = tab;
    _st.tabs.querySelectorAll('.fv-tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    _st.ruta.hidden = tab !== 'ruta';
    _st.fotos.hidden = tab !== 'fotos';
    // En el móvil, con FOTOS el mapa se encoge para dejar sitio a las fotos
    _mapSmall(tab !== 'ruta');
    if (tab === 'fotos') {
      if (!_st.photos) _st.fotos.innerHTML = '<p class="fv-note fv-pad">Cargando tus fotos…</p>';
      else _paint();
    }
    try { _st.container.scrollTop = 0; } catch (_) {}
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
      const first = P.find(p => p.date);
      const d0 = first ? new Date(first.date.getFullYear(), first.date.getMonth(), first.date.getDate()) : null;
      body = [...groups.values()].map(g => {
        let lbl = 'Sin fecha';
        if (g.d && d0) {
          const n = Math.round((new Date(g.d.getFullYear(), g.d.getMonth(), g.d.getDate()) - d0) / 864e5) + 1;
          lbl = `Día ${n} <span>· ${esc(_dayLabel(g.d))}</span>`;
        }
        return `<section class="fv-day"><h4 class="fv-day-h">${lbl}<em>${g.items.length}</em></h4><div class="fv-grid">${g.items.map(i => `<button type="button" class="fv-th" data-i="${i}" aria-label="Ver foto"><img src="${esc(P[i].url)}" alt="" loading="lazy" decoding="async"></button>`).join('')}</div></section>`;
      }).join('');
      body = `<div class="fv-days fv-pad">${body}</div>`;
    }
    s.fotos.innerHTML = head + body;
    s.fotos.querySelector('#fv-add').addEventListener('click', () => { if (!s.busy) s.fotos.querySelector('#fv-input').click(); });
    s.fotos.querySelector('#fv-input').addEventListener('change', e => { const files = [...(e.target.files || [])]; e.target.value = ''; if (files.length) _upload(files); });
    s.fotos.querySelectorAll('.fv-th').forEach(b => b.addEventListener('click', () => _openViewer(+b.dataset.i)));
    if (s.busy) _progress(s._prog || '', s._progPct || 0);
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
    return { lat, lng, date: date || new Date(f.lastModified || Date.now()) };
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

  async function _upload(files) {
    const s = _st; if (!s || s.busy) return;
    s.busy = true;
    const api = window.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
    const U = firebase.firestore().collection('users').doc(s.uid);
    const existing = new Set((s.photos || []).filter(p => p.origName).map(p => p.origName + '|' + p.takenAt));
    let ok = 0, dup = 0, fail = 0;
    // Pantalla encendida mientras sube (si el móvil lo permite)
    let lock = null; try { lock = await navigator.wakeLock.request('screen'); } catch (_) {}
    for (let i = 0; i < files.length; i++) {
      if (_st !== s) break; // se cerró la guía
      const f = files[i];
      _progress(`Subiendo ${i + 1} de ${files.length}…`, i / files.length);
      try {
        const meta = await _readMeta(f);
        const takenAt = meta.date.toISOString();
        if (existing.has(f.name + '|' + takenAt)) { dup++; continue; }
        const blob = await _toJpeg(f);
        const fd = new FormData(); fd.append('photo', blob, 'viaje.jpg'); fd.append('uid', s.uid);
        const r = await fetch(api + '/upload-gallery-photo', { method: 'POST', body: fd });
        if (!r.ok) throw new Error('subida ' + r.status);
        const { key, url } = await r.json();
        const ref = await U.collection('fotos').add({
          key, url, tag: 'viaje', caption: '', albumId: null, routeId: s.docId,
          lat: meta.lat, lng: meta.lng, source: 'guia', origName: f.name, takenAt, createdAt: takenAt,
        });
        existing.add(f.name + '|' + takenAt);
        s.photos.push({ id: ref.id, kind: 'foto', url, date: meta.date, lat: meta.lat, lng: meta.lng, place: '', origName: f.name, takenAt });
        ok++;
      } catch (e) { fail++; console.warn('[fotos-viaje] subida', e); }
    }
    try { if (lock) lock.release(); } catch (_) {}
    s.busy = false;
    if (_st !== s) return;
    s.photos.sort((a, b) => (a.date || 0) - (b.date || 0));
    _count();
    // Tu mundo: que la franja de Mis Viajes se recalcule con las fotos nuevas
    try { localStorage.removeItem('bdm_tumundo_sum'); } catch (_) {}
    s._prog = ''; _paint();
    const msg = [ok ? `${ok} ${ok === 1 ? 'foto guardada' : 'fotos guardadas'}` : '', dup ? `${dup} ya estaban` : '', fail ? `${fail} no se pudieron subir: vuelve a intentarlo` : ''].filter(Boolean).join(' · ');
    if (msg && typeof showToast === 'function') showToast(msg);
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

  return { mount, unmount };
})();
window.fotosViaje = fotosViaje;
