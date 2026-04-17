// share-inbox.js — Recibe fotos compartidas desde la galería del móvil
// y las añade al mapa leyendo GPS + fecha del EXIF.
//
// Flujo: usuario comparte N fotos desde galería → sw.js las guarda en Cache →
// redirige a /?share=ready&count=N → este script procesa el inbox.

(function () {
  'use strict';

  // ─────────── EXIF parser mínimo (solo GPS + DateTimeOriginal) ───────────
  // JPEG: SOI 0xFFD8, luego segmentos 0xFF<marker> <len BE 16> <data>
  // APP1 (0xFFE1) con header "Exif\0\0" contiene el TIFF con los tags.

  function readUInt16(dv, offset, little) { return dv.getUint16(offset, little); }
  function readUInt32(dv, offset, little) { return dv.getUint32(offset, little); }

  function findExif(buffer) {
    const dv = new DataView(buffer);
    if (dv.getUint16(0, false) !== 0xFFD8) return null; // no es JPEG
    let pos = 2;
    while (pos < dv.byteLength - 4) {
      if (dv.getUint8(pos) !== 0xFF) return null;
      const marker = dv.getUint8(pos + 1);
      const segLen = dv.getUint16(pos + 2, false);
      if (marker === 0xE1) {
        // APP1 — comprobar header Exif
        const headerOk =
          dv.getUint8(pos + 4) === 0x45 && dv.getUint8(pos + 5) === 0x78 &&
          dv.getUint8(pos + 6) === 0x69 && dv.getUint8(pos + 7) === 0x66 &&
          dv.getUint8(pos + 8) === 0x00 && dv.getUint8(pos + 9) === 0x00;
        if (headerOk) {
          return { tiffStart: pos + 10, segEnd: pos + 2 + segLen, dv };
        }
      }
      // Saltar segmento
      pos += 2 + segLen;
    }
    return null;
  }

  function parseIfd(dv, ifdOffset, tiffStart, little, wanted) {
    const out = {};
    if (ifdOffset + 2 > dv.byteLength) return out;
    const entries = readUInt16(dv, ifdOffset, little);
    for (let i = 0; i < entries; i++) {
      const entry = ifdOffset + 2 + i * 12;
      if (entry + 12 > dv.byteLength) break;
      const tag = readUInt16(dv, entry, little);
      if (!wanted[tag]) continue;
      const type = readUInt16(dv, entry + 2, little);
      const count = readUInt32(dv, entry + 4, little);
      // Dato/offset
      const dataPos = (() => {
        const typeSize = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 10: 8 }[type] || 1;
        const totalSize = typeSize * count;
        return totalSize <= 4 ? entry + 8 : tiffStart + readUInt32(dv, entry + 8, little);
      })();
      out[tag] = { type, count, dataPos };
    }
    return out;
  }

  function readAscii(dv, pos, count) {
    let s = '';
    for (let i = 0; i < count; i++) {
      const c = dv.getUint8(pos + i);
      if (c === 0) break;
      s += String.fromCharCode(c);
    }
    return s;
  }

  function readRational3(dv, pos, little) {
    // Lee 3 rationals consecutivos (8 bytes cada uno: num/den uint32)
    const r = [];
    for (let i = 0; i < 3; i++) {
      const num = readUInt32(dv, pos + i * 8, little);
      const den = readUInt32(dv, pos + i * 8 + 4, little);
      r.push(den === 0 ? 0 : num / den);
    }
    return r;
  }

  function extractExif(buffer) {
    const exif = findExif(buffer);
    if (!exif) return null;
    const { tiffStart, dv } = exif;
    if (tiffStart + 8 > dv.byteLength) return null;
    // Byte order
    const bo = dv.getUint16(tiffStart, false);
    const little = bo === 0x4949; // II=little, MM=big
    if (bo !== 0x4949 && bo !== 0x4D4D) return null;
    if (dv.getUint16(tiffStart + 2, little) !== 42) return null;
    const ifd0Offset = tiffStart + readUInt32(dv, tiffStart + 4, little);

    // IFD0 — queremos tags 0x8825 (GPSInfo offset) y 0x8769 (ExifOffset)
    const ifd0 = parseIfd(dv, ifd0Offset, tiffStart, little, { 0x8825: 1, 0x8769: 1 });

    const result = { lat: null, lng: null, date: null };

    // GPS IFD
    if (ifd0[0x8825]) {
      const gpsOffset = tiffStart + readUInt32(dv, ifd0[0x8825].dataPos, little);
      const gps = parseIfd(dv, gpsOffset, tiffStart, little, { 0x0001: 1, 0x0002: 1, 0x0003: 1, 0x0004: 1 });
      if (gps[0x0002] && gps[0x0004]) {
        const latDMS = readRational3(dv, gps[0x0002].dataPos, little);
        const lngDMS = readRational3(dv, gps[0x0004].dataPos, little);
        const latRef = gps[0x0001] ? String.fromCharCode(dv.getUint8(gps[0x0001].dataPos)) : 'N';
        const lngRef = gps[0x0003] ? String.fromCharCode(dv.getUint8(gps[0x0003].dataPos)) : 'E';
        let lat = latDMS[0] + latDMS[1] / 60 + latDMS[2] / 3600;
        let lng = lngDMS[0] + lngDMS[1] / 60 + lngDMS[2] / 3600;
        if (latRef === 'S') lat = -lat;
        if (lngRef === 'W') lng = -lng;
        if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) > 0.001 && Math.abs(lng) > 0.001) {
          result.lat = lat;
          result.lng = lng;
        }
      }
    }

    // Exif IFD — DateTimeOriginal (tag 0x9003, ASCII "YYYY:MM:DD HH:MM:SS")
    if (ifd0[0x8769]) {
      const exifOffset = tiffStart + readUInt32(dv, ifd0[0x8769].dataPos, little);
      const exifIfd = parseIfd(dv, exifOffset, tiffStart, little, { 0x9003: 1 });
      if (exifIfd[0x9003]) {
        const raw = readAscii(dv, exifIfd[0x9003].dataPos, exifIfd[0x9003].count);
        // Convertir "YYYY:MM:DD HH:MM:SS" → ISO
        const m = raw.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        if (m) {
          result.date = new Date(
            Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])
          ).toISOString();
        }
      }
    }

    return result;
  }

  // ─────────── Procesado del inbox ───────────

  async function getInboxFiles() {
    try {
      const cache = await caches.open('share-inbox');
      const keys = await cache.keys();
      const files = [];
      for (const req of keys) {
        const resp = await cache.match(req);
        if (!resp) continue;
        const blob = await resp.blob();
        const name = decodeURIComponent(resp.headers.get('X-Share-Name') || 'photo.jpg');
        const lastModified = parseInt(resp.headers.get('X-Share-LastModified') || '0', 10);
        files.push({ blob, name, lastModified, req });
      }
      return { cache, files };
    } catch (_) {
      return { cache: null, files: [] };
    }
  }

  function showOverlay(message) {
    let el = document.getElementById('share-inbox-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'share-inbox-overlay';
      el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(5,5,5,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);';
      el.innerHTML = `
        <div style="font-family:'Bebas Neue',sans-serif;color:#f0b429;font-size:28px;letter-spacing:.05em;margin-bottom:12px">AÑADIENDO AL MAPA</div>
        <div id="share-inbox-msg" style="font-family:'Inter',sans-serif;color:#f5f0e8;font-size:14px;text-align:center;line-height:1.5;max-width:320px"></div>
        <div id="share-inbox-progress" style="margin-top:18px;width:220px;height:4px;background:rgba(240,180,41,.15);border-radius:999px;overflow:hidden">
          <div id="share-inbox-bar" style="height:100%;width:0%;background:#f0b429;transition:width .3s"></div>
        </div>
        <button id="share-inbox-close" style="display:none;margin-top:22px;padding:10px 24px;background:#f0b429;color:#060503;border:none;border-radius:999px;font-family:'Inter',sans-serif;font-weight:700;font-size:14px;cursor:pointer">Ver en el mapa</button>`;
      document.body.appendChild(el);
    }
    document.getElementById('share-inbox-msg').textContent = message;
  }

  function updateProgress(pct) {
    const bar = document.getElementById('share-inbox-bar');
    if (bar) bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }

  function closeOverlay() {
    const el = document.getElementById('share-inbox-overlay');
    if (el) el.remove();
  }

  function _showLoginBanner() {
    if (document.getElementById('share-login-banner')) return;
    const b = document.createElement('div');
    b.id = 'share-login-banner';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:100000;background:#f0b429;color:#060503;padding:10px 16px;font-family:Inter,sans-serif;font-size:13px;font-weight:600;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.4)';
    b.textContent = 'Inicia sesión y tus fotos se añadirán automáticamente';
    document.body.appendChild(b);
  }

  function _hideLoginBanner() {
    const b = document.getElementById('share-login-banner');
    if (b) b.remove();
  }

  async function uploadPhoto(blob, uid) {
    const fd = new FormData();
    fd.append('photo', blob, 'shared.jpg');
    fd.append('uid', uid);
    const res = await fetch(window.SALMA_API + '/upload-gallery-photo', {
      method: 'POST',
      body: fd
    });
    if (!res.ok) throw new Error('upload failed');
    return res.json(); // { key, url }
  }

  async function processOne(file, uid, fdb) {
    const buf = await file.blob.arrayBuffer();
    const exif = extractExif(buf);
    const hasGps = exif && exif.lat != null && exif.lng != null;
    const exifDate = exif && exif.date ? exif.date : null;
    console.log('[share-inbox] EXIF:', file.name, 'size:', (file.blob.size / 1024).toFixed(0) + 'KB', 'GPS:', hasGps ? `${exif.lat.toFixed(5)},${exif.lng.toFixed(5)}` : 'NO', 'date:', exifDate || '—');
    const createdAt = exifDate || (file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString());

    const { key, url } = await uploadPhoto(file.blob, uid);

    // Foto en galería (sin ruta asignada todavía)
    const fotoRef = await fdb.collection('users').doc(uid).collection('fotos').add({
      key, url,
      tag: 'compartida',
      caption: '',
      albumId: null,
      routeId: null,
      lat: hasGps ? exif.lat : null,
      lng: hasGps ? exif.lng : null,
      source: 'share',
      createdAt
    });

    // Pin en el mapa solo si hay GPS
    let pinRef = null;
    if (hasGps) {
      pinRef = await fdb.collection('users').doc(uid).collection('pins').add({
        lat: exif.lat,
        lng: exif.lng,
        locName: '',
        photoUrl: url,
        routeId: null,
        source: 'share',
        createdAt
      });
    }

    return {
      hasGps,
      lat: hasGps ? exif.lat : null,
      lng: hasGps ? exif.lng : null,
      key,
      url,
      fotoDocId: fotoRef.id,
      pinDocId: pinRef ? pinRef.id : null,
      exifDate,
      lastModified: file.lastModified || 0,
      createdAt,
    };
  }

  // ─────────── UI de asignación (grid de selección) ───────────

  function injectAssignStyles() {
    if (document.getElementById('share-assign-styles')) return;
    const s = document.createElement('style');
    s.id = 'share-assign-styles';
    s.textContent = `
      .sa-overlay{position:fixed;inset:0;z-index:99998;background:#060503;display:flex;flex-direction:column;font-family:'Inter',sans-serif;color:#f5f0e8}
      .sa-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid rgba(240,180,41,.18)}
      .sa-title{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#f0b429;letter-spacing:.04em}
      .sa-done{background:transparent;border:1px solid rgba(240,180,41,.4);color:#f0b429;border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer}
      .sa-controls{display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(240,180,41,.12);align-items:center;flex-wrap:wrap}
      .sa-select{flex:1;min-width:180px;background:#141209;color:#f5f0e8;border:1px solid rgba(240,180,41,.25);border-radius:10px;padding:10px 12px;font-size:13px;font-family:inherit}
      .sa-all{background:transparent;border:1px solid rgba(240,180,41,.4);color:#f0b429;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}
      .sa-grid{flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;-webkit-overflow-scrolling:touch}
      .sa-tile{position:relative;aspect-ratio:1;overflow:hidden;cursor:pointer;background:#141209}
      .sa-tile img{width:100%;height:100%;object-fit:cover;display:block}
      .sa-tile .sa-mark{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,.5);border:1.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:12px;color:transparent}
      .sa-tile.sa-selected .sa-mark{background:#f0b429;border-color:#f0b429;color:#060503}
      .sa-tile.sa-assigned{pointer-events:none}
      .sa-tile.sa-assigned::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.55)}
      .sa-tile.sa-assigned .sa-mark{background:#4285F4;border-color:#4285F4;color:#fff;z-index:1}
      .sa-tile .sa-nogps{position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,.7);color:#f5f0e8;font-size:9px;padding:2px 6px;border-radius:4px;letter-spacing:.04em}
      .sa-footer{padding:12px 16px;border-top:1px solid rgba(240,180,41,.18);background:#0a0806;display:flex;flex-direction:column;gap:8px}
      .sa-count{font-size:12px;color:rgba(245,240,232,.6);text-align:center}
      .sa-actions{display:flex;gap:8px}
      .sa-add{flex:2;background:#f0b429;color:#060503;border:none;border-radius:999px;padding:12px;font-size:14px;font-weight:700;cursor:pointer}
      .sa-add:disabled{background:rgba(240,180,41,.25);color:rgba(6,5,3,.5);cursor:not-allowed}
      .sa-discard{flex:1;background:transparent;border:1px solid rgba(239,68,68,.5);color:#ef4444;border-radius:999px;padding:12px;font-size:14px;font-weight:600;cursor:pointer}
      .sa-discard:disabled{opacity:.3;cursor:not-allowed}
      .sa-locate{flex:1;background:transparent;border:1px solid rgba(240,180,41,.55);color:#f0b429;border-radius:999px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
      .sa-tile .sa-nogps{background:rgba(239,68,68,.85)}
      /* Modal de ubicación */
      .sl-overlay{position:fixed;inset:0;z-index:99999;background:rgba(5,5,5,.92);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);padding:20px}
      .sl-box{background:#141209;border:1px solid rgba(240,180,41,.25);border-radius:16px;padding:20px;width:100%;max-width:440px;display:flex;flex-direction:column;gap:14px}
      .sl-title{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#f0b429;letter-spacing:.04em}
      .sl-sub{font-size:12px;color:rgba(245,240,232,.6);line-height:1.5}
      .sl-input{background:#0a0806;color:#f5f0e8;border:1px solid rgba(240,180,41,.25);border-radius:10px;padding:12px;font-size:14px;font-family:inherit;outline:none}
      .sl-input:focus{border-color:rgba(240,180,41,.55)}
      .sl-preview{font-size:13px;color:#f5f0e8;background:#0a0806;border:1px solid rgba(240,180,41,.18);border-radius:10px;padding:10px 12px;min-height:42px;display:flex;align-items:center;gap:8px}
      .sl-preview.empty{color:rgba(245,240,232,.35);font-style:italic}
      .sl-actions{display:flex;gap:8px;margin-top:4px}
      .sl-cancel{flex:1;background:transparent;border:1px solid rgba(245,240,232,.25);color:#f5f0e8;border-radius:999px;padding:10px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer}
      .sl-apply{flex:2;background:#f0b429;color:#060503;border:none;border-radius:999px;padding:10px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer}
      .sl-apply:disabled{background:rgba(240,180,41,.25);color:rgba(6,5,3,.5);cursor:not-allowed}
      .pac-container{z-index:100001 !important}
    `;
    document.head.appendChild(s);
  }

  async function showAssignmentUI(uploadedPhotos, uid, fdb) {
    injectAssignStyles();

    // Cargar rutas del usuario
    let routes = [];
    try {
      const snap = await fdb.collection('users').doc(uid).collection('maps')
        .orderBy('createdAt', 'desc').limit(30).get();
      snap.forEach(doc => {
        const d = doc.data();
        routes.push({ id: doc.id, name: d.nombre || 'Mi ruta', days: d.num_dias || d.dias || '?', destino: d.destino || '' });
      });
    } catch (_) {}

    // Orden: más recientes primero (EXIF date → lastModified → createdAt)
    uploadedPhotos.sort((a, b) => {
      const ta = a.exifDate || (a.lastModified ? new Date(a.lastModified).toISOString() : a.createdAt);
      const tb = b.exifDate || (b.lastModified ? new Date(b.lastModified).toISOString() : b.createdAt);
      return tb.localeCompare(ta);
    });

    const overlay = document.createElement('div');
    overlay.className = 'sa-overlay';

    const routeOptions = routes.length
      ? routes.map(r => `<option value="${r.id}">${escapeHTML(r.name)} · ${r.days} día${r.days > 1 ? 's' : ''}${r.destino ? ' · ' + escapeHTML(r.destino) : ''}</option>`).join('')
      : '<option value="" disabled selected>No tienes rutas guardadas</option>';

    overlay.innerHTML = `
      <div class="sa-header">
        <div class="sa-title">Asigna tus fotos</div>
        <button class="sa-done" id="sa-done">✕ Hecho</button>
      </div>
      <div class="sa-controls">
        <select class="sa-select" id="sa-route">${routeOptions}</select>
        <button class="sa-all" id="sa-all">Seleccionar todas</button>
      </div>
      <div class="sa-grid" id="sa-grid"></div>
      <div class="sa-footer">
        <div class="sa-count" id="sa-count">0 seleccionadas</div>
        <div class="sa-actions">
          <button class="sa-locate" id="sa-locate" style="display:none">📍 Ubicar</button>
          <button class="sa-add" id="sa-add" disabled>Añadir a ruta</button>
          <button class="sa-discard" id="sa-discard" disabled>Descartar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const grid = overlay.querySelector('#sa-grid');
    const countEl = overlay.querySelector('#sa-count');
    const addBtn = overlay.querySelector('#sa-add');
    const discardBtn = overlay.querySelector('#sa-discard');
    const locateBtn = overlay.querySelector('#sa-locate');
    const allBtn = overlay.querySelector('#sa-all');
    const routeSel = overlay.querySelector('#sa-route');

    // Estado
    const selected = new Set();
    const assigned = new Set(); // indices ya asignados (lock)

    function renderTiles() {
      grid.innerHTML = '';
      uploadedPhotos.forEach((p, idx) => {
        const tile = document.createElement('div');
        tile.className = 'sa-tile';
        if (selected.has(idx)) tile.classList.add('sa-selected');
        if (assigned.has(idx)) tile.classList.add('sa-assigned');
        tile.innerHTML = `
          <img src="${p.url}" loading="lazy" alt="">
          <div class="sa-mark">✓</div>
          ${!p.hasGps ? '<div class="sa-nogps">Sin GPS</div>' : ''}
        `;
        tile.addEventListener('click', () => {
          if (assigned.has(idx)) return;
          if (selected.has(idx)) selected.delete(idx);
          else selected.add(idx);
          tile.classList.toggle('sa-selected');
          updateCount();
        });
        grid.appendChild(tile);
      });
    }

    function updateCount() {
      const n = selected.size;
      const noGpsSelected = Array.from(selected).filter(i => !uploadedPhotos[i].hasGps).length;
      countEl.textContent = n === 0
        ? '0 seleccionadas'
        : noGpsSelected
          ? `${n} seleccionada${n === 1 ? '' : 's'} · ${noGpsSelected} sin ubicación`
          : `${n} seleccionada${n === 1 ? '' : 's'}`;
      const hasRoutes = routes.length > 0;
      addBtn.disabled = n === 0 || !hasRoutes;
      discardBtn.disabled = n === 0;
      if (hasRoutes && routeSel.value) {
        const r = routes.find(x => x.id === routeSel.value);
        addBtn.textContent = n ? `Añadir ${n} a ${r ? r.name : 'ruta'}` : 'Añadir a ruta';
      }
      // Botón Ubicar solo si hay seleccionadas sin GPS
      if (noGpsSelected > 0) {
        locateBtn.style.display = '';
        locateBtn.textContent = `📍 Ubicar ${noGpsSelected}`;
      } else {
        locateBtn.style.display = 'none';
      }
    }

    allBtn.addEventListener('click', () => {
      // Alterna: si hay pendientes sin seleccionar → selecciona todos los no asignados; si todos seleccionados → deselecciona
      const pending = uploadedPhotos.map((_, i) => i).filter(i => !assigned.has(i));
      const allSelected = pending.every(i => selected.has(i));
      if (allSelected) pending.forEach(i => selected.delete(i));
      else pending.forEach(i => selected.add(i));
      renderTiles();
      updateCount();
    });

    routeSel.addEventListener('change', updateCount);

    locateBtn.addEventListener('click', () => {
      const noGpsIds = Array.from(selected).filter(i => !uploadedPhotos[i].hasGps);
      if (!noGpsIds.length) return;
      showLocatePicker(noGpsIds.length, async (place) => {
        // place: { lat, lng, name }
        locateBtn.disabled = true;
        try {
          const batch = fdb.batch();
          for (const idx of noGpsIds) {
            const p = uploadedPhotos[idx];
            // Offset aleatorio 5-20m para evitar solapamiento
            const { dLat, dLng } = randomOffsetMeters(place.lat, 5, 20);
            const lat = place.lat + dLat;
            const lng = place.lng + dLng;
            // Actualizar foto
            batch.update(
              fdb.collection('users').doc(uid).collection('fotos').doc(p.fotoDocId),
              { lat, lng, caption: place.name }
            );
            // Crear pin (no existía)
            const pinRef = fdb.collection('users').doc(uid).collection('pins').doc();
            batch.set(pinRef, {
              lat, lng,
              locName: place.name,
              photoUrl: p.url,
              routeId: null,
              source: 'share',
              createdAt: p.createdAt
            });
            // Actualizar objeto en memoria
            p.hasGps = true;
            p.lat = lat;
            p.lng = lng;
            p.pinDocId = pinRef.id;
            p.locName = place.name;
          }
          await batch.commit();
          renderTiles();
          updateCount();
          showShareToast(`📍 ${noGpsIds.length} foto${noGpsIds.length === 1 ? '' : 's'} ubicada${noGpsIds.length === 1 ? '' : 's'} en ${place.name}`);
        } catch (err) {
          console.error('[share-inbox] locate error', err);
          alert('Error ubicando fotos');
        }
        locateBtn.disabled = false;
      });
    });

    addBtn.addEventListener('click', async () => {
      if (!selected.size || !routeSel.value) return;
      const ids = Array.from(selected);
      const noGpsCount = ids.filter(i => !uploadedPhotos[i].hasGps).length;
      // Aviso si hay seleccionadas sin ubicación — irían a la galería pero sin pin en mapa
      if (noGpsCount > 0) {
        const msg = noGpsCount === ids.length
          ? `Esta${noGpsCount === 1 ? '' : 's'} ${noGpsCount} foto${noGpsCount === 1 ? '' : 's'} no tiene${noGpsCount === 1 ? '' : 'n'} ubicación.\n\n"Aceptar" = Añadir sin pin en el mapa\n"Cancelar" = Ubicar primero`
          : `De las ${ids.length} seleccionadas, ${noGpsCount} no tiene${noGpsCount === 1 ? '' : 'n'} ubicación e irá${noGpsCount === 1 ? '' : 'n'} solo a la galería (sin pin en el mapa).\n\n"Aceptar" = Añadir igualmente\n"Cancelar" = Ubicarlas primero`;
        if (!confirm(msg)) return;
      }
      addBtn.disabled = true; addBtn.textContent = 'Asignando...';
      const routeId = routeSel.value;
      try {
        const batch = fdb.batch();
        ids.forEach(idx => {
          const p = uploadedPhotos[idx];
          batch.update(fdb.collection('users').doc(uid).collection('fotos').doc(p.fotoDocId), { routeId });
          if (p.pinDocId) batch.update(fdb.collection('users').doc(uid).collection('pins').doc(p.pinDocId), { routeId });
        });
        await batch.commit();
        ids.forEach(idx => { assigned.add(idx); selected.delete(idx); });
        renderTiles();
        updateCount();
        const routeName = (routes.find(r => r.id === routeId) || {}).name || 'ruta';
        showShareToast(`✓ ${ids.length} foto${ids.length === 1 ? '' : 's'} añadida${ids.length === 1 ? '' : 's'} a ${routeName}`);
      } catch (err) {
        console.error('[share-inbox] assign error', err);
        alert('Error asignando fotos');
        addBtn.disabled = false;
      }
    });

    discardBtn.addEventListener('click', async () => {
      if (!selected.size) return;
      if (!confirm(`¿Borrar ${selected.size} foto${selected.size === 1 ? '' : 's'}? Esta acción es irreversible.`)) return;
      discardBtn.disabled = true; discardBtn.textContent = 'Borrando...';
      const ids = Array.from(selected);
      try {
        for (const idx of ids) {
          const p = uploadedPhotos[idx];
          // Borrar de R2
          try {
            await fetch(window.SALMA_API + '/delete-photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: p.key })
            });
          } catch (_) {}
          // Borrar de Firestore
          try { await fdb.collection('users').doc(uid).collection('fotos').doc(p.fotoDocId).delete(); } catch (_) {}
          if (p.pinDocId) try { await fdb.collection('users').doc(uid).collection('pins').doc(p.pinDocId).delete(); } catch (_) {}
          // Marcar como "desaparecida" del array (null placeholder) para que índices sigan estables
          uploadedPhotos[idx] = null;
        }
        // Rebuild array sin nulls, reset selected
        const remaining = uploadedPhotos.filter(x => x);
        uploadedPhotos.length = 0;
        remaining.forEach(p => uploadedPhotos.push(p));
        selected.clear();
        assigned.clear(); // los índices cambiaron, pero ya no hay forma simple de preservarlos → se limpian
        renderTiles();
        updateCount();
        discardBtn.textContent = 'Descartar';
      } catch (err) {
        console.error('[share-inbox] discard error', err);
        alert('Error borrando fotos');
        discardBtn.disabled = false;
        discardBtn.textContent = 'Descartar';
      }
    });

    overlay.querySelector('#sa-done').addEventListener('click', async () => {
      overlay.remove();
      if (typeof window.openLiveMap !== 'function') return;
      window.openLiveMap();
      // Esperar a que el mapa esté cargado
      await new Promise(r => setTimeout(r, 500));
      // Forzar recarga de pins (el mapa existente no recarga en openLiveMap)
      if (typeof window.reloadSavedPins === 'function') {
        try { await window.reloadSavedPins(); } catch(_){}
      }
      // Centrar en los pins nuevos con GPS
      const withGps = uploadedPhotos.filter(p => p && p.hasGps);
      if (withGps.length && typeof window.liveMapFitPins === 'function') {
        window.liveMapFitPins(withGps.map(p => ({ lat: p.lat, lng: p.lng })));
      }
    });

    renderTiles();
    updateCount();
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function randomOffsetMeters(lat, minMeters, maxMeters) {
    // Distancia aleatoria entre min y max metros, dirección aleatoria
    const distance = minMeters + Math.random() * (maxMeters - minMeters);
    const angle = Math.random() * 2 * Math.PI;
    const metersPerDegLat = 111111;
    const metersPerDegLng = 111111 * Math.cos(lat * Math.PI / 180);
    const dLat = (distance * Math.cos(angle)) / metersPerDegLat;
    const dLng = (distance * Math.sin(angle)) / Math.max(metersPerDegLng, 1);
    return { dLat, dLng };
  }

  async function ensureMapsLoaded() {
    if (window.google && window.google.maps && window.google.maps.places) return true;
    if (typeof window._loadGoogleMaps === 'function') {
      try { await window._loadGoogleMaps(); return true; } catch(_) { return false; }
    }
    return false;
  }

  async function showLocatePicker(count, onApply) {
    const ok = await ensureMapsLoaded();
    if (!ok) { alert('No se pudo cargar Google Maps'); return; }

    const overlay = document.createElement('div');
    overlay.className = 'sl-overlay';
    overlay.innerHTML = `
      <div class="sl-box">
        <div class="sl-title">Ubicar ${count} foto${count === 1 ? '' : 's'}</div>
        <div class="sl-sub">Busca un lugar (ciudad, monumento, playa...). Las fotos se colocarán ahí con un pequeño desplazamiento aleatorio para que no queden superpuestas.</div>
        <input class="sl-input" id="sl-input" placeholder="Ej: Hoi An, Vietnam" autocomplete="off">
        <div class="sl-preview empty" id="sl-preview">Aún no has elegido un lugar</div>
        <div class="sl-actions">
          <button class="sl-cancel" id="sl-cancel">Cancelar</button>
          <button class="sl-apply" id="sl-apply" disabled>Aplicar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#sl-input');
    const preview = overlay.querySelector('#sl-preview');
    const cancelBtn = overlay.querySelector('#sl-cancel');
    const applyBtn = overlay.querySelector('#sl-apply');

    let chosen = null;

    const ac = new google.maps.places.Autocomplete(input, {
      types: ['geocode', 'establishment'],
      fields: ['geometry', 'name', 'formatted_address']
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      chosen = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name || place.formatted_address || input.value
      };
      preview.textContent = '📍 ' + chosen.name;
      preview.classList.remove('empty');
      applyBtn.disabled = false;
    });

    cancelBtn.addEventListener('click', () => overlay.remove());
    applyBtn.addEventListener('click', async () => {
      if (!chosen) return;
      applyBtn.disabled = true; applyBtn.textContent = 'Aplicando...';
      try { await onApply(chosen); } finally { overlay.remove(); }
    });

    setTimeout(() => input.focus(), 100);
  }

  function showShareToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#141209;border:1px solid rgba(240,180,41,.4);color:#f0b429;padding:12px 22px;border-radius:999px;font-family:Inter,sans-serif;font-size:13px;font-weight:600;z-index:100000;box-shadow:0 4px 18px rgba(0,0,0,.5)';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
  }

  async function runInbox() {
    // Espera un firebase.auth().currentUser (instantáneo en cuanto Firebase restaura sesión).
    // No esperamos a window.currentUser porque ése se llena tras leer Firestore y puede tardar.
    const waitForAuthUser = () => new Promise((resolve) => {
      if (!window.firebase || !firebase.auth) {
        const poll = () => {
          if (window.firebase && firebase.auth) setup();
          else setTimeout(poll, 100);
        };
        poll();
      } else setup();

      function setup() {
        if (firebase.auth().currentUser) { resolve(firebase.auth().currentUser); return; }
        // Subscribirse hasta que haya user. NO abrimos el login nosotros — Firebase ya lo hace solo.
        const unsub = firebase.auth().onAuthStateChanged((user) => {
          if (user) { unsub(); resolve(user); }
        });
      }
    });

    // Limpiar el param de la URL para que no se re-ejecute en recargas
    try {
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    } catch (_) {}

    showOverlay('Leyendo fotos compartidas...');

    const { cache, files } = await getInboxFiles();

    if (!files.length) {
      showOverlay('No se encontraron fotos para añadir.');
      setTimeout(closeOverlay, 2000);
      return;
    }

    // Si no hay sesión, esperar 500ms silenciosamente por si Firebase la restaura
    // rápido (caso habitual). Solo mostramos banner si el retardo es real.
    // Firebase ya abre el login solo en app.js:onAuthStateChanged.
    const hasAuthNow = !!(window.firebase && firebase.auth && firebase.auth().currentUser);
    let bannerTimer = null;
    if (!hasAuthNow) {
      bannerTimer = setTimeout(() => {
        closeOverlay();
        _showLoginBanner();
      }, 500);
    }

    const authUser = await waitForAuthUser();
    if (bannerTimer) clearTimeout(bannerTimer);
    _hideLoginBanner();
    showOverlay('Preparando subida...');

    const uid = authUser.uid;
    const fdb = (typeof db !== 'undefined') ? db : firebase.firestore();

    const uploaded = [];
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      showOverlay(`Subiendo ${i + 1} de ${files.length}...`);
      updateProgress((i / files.length) * 100);
      try {
        const res = await processOne(files[i], uid, fdb);
        uploaded.push(res);
        if (cache) await cache.delete(files[i].req);
      } catch (err) {
        console.warn('[share-inbox]', err);
        failed++;
      }
    }

    updateProgress(100);
    closeOverlay();

    if (!uploaded.length) {
      try { sessionStorage.removeItem('share_pending'); } catch (_) {}
      showOverlay('No se pudo subir ninguna foto.');
      setTimeout(closeOverlay, 2500);
      return;
    }

    // Decidir flujo según haya ruta activa
    const activeRouteId = await _getActiveRouteId(fdb, uid);
    if (activeRouteId) {
      await _fastAssignToActiveRoute(uploaded, uid, fdb, activeRouteId);
    } else {
      // Sin ruta activa → pantalla de asignación manual
      await showAssignmentUI(uploaded, uid, fdb);
    }
  }

  // ─────────── Flujo rápido: hay ruta activa ───────────
  async function _getActiveRouteId(fdb, uid) {
    try {
      const doc = await fdb.collection('users').doc(uid).get();
      return doc.exists ? (doc.data().active_route_id || null) : null;
    } catch (_) { return null; }
  }

  async function _getUserPosition() {
    // 1) Última posición guardada si es fresca (<30 min)
    try {
      const raw = localStorage.getItem('salma_last_pos');
      if (raw) {
        const p = JSON.parse(raw);
        if (p && p.lat && p.lng) {
          const age = p.ts ? (Date.now() - p.ts) : Infinity;
          if (age < 30 * 60 * 1000) return { lat: p.lat, lng: p.lng, source: 'cached' };
        }
      }
    } catch (_) {}
    // 2) GPS fresco (con timeout 8s)
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        showOverlay('Obteniendo tu ubicación...');
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'fresh' }),
          () => resolve(null),
          { maximumAge: 60000, timeout: 8000, enableHighAccuracy: false }
        );
      });
    }
    return null;
  }

  async function _fastAssignToActiveRoute(uploaded, uid, fdb, routeId) {
    // Obtener nombre de la ruta para el toast
    let routeName = 'ruta activa';
    try {
      const mapDoc = await fdb.collection('users').doc(uid).collection('maps').doc(routeId).get();
      if (mapDoc.exists) routeName = mapDoc.data().nombre || routeName;
    } catch (_) {}

    // Si alguna foto no trae EXIF GPS, necesitamos la posición del móvil
    const needDevicePos = uploaded.some(p => !p.hasGps);
    let devicePos = null;
    if (needDevicePos) devicePos = await _getUserPosition();

    showOverlay(`Añadiendo a ${routeName}...`);

    const batch = fdb.batch();
    const coordsForMap = [];
    let withPin = 0;
    let noLoc = 0;

    for (const p of uploaded) {
      // Determinar coords: EXIF primero, si no GPS del móvil
      let lat = null, lng = null;
      if (p.hasGps) { lat = p.lat; lng = p.lng; }
      else if (devicePos) { lat = devicePos.lat; lng = devicePos.lng; }

      const fotoRef = fdb.collection('users').doc(uid).collection('fotos').doc(p.fotoDocId);
      const fotoUpd = { routeId };
      if (lat !== null && lng !== null) { fotoUpd.lat = lat; fotoUpd.lng = lng; }
      batch.update(fotoRef, fotoUpd);

      if (lat !== null && lng !== null) {
        if (p.pinDocId) {
          batch.update(
            fdb.collection('users').doc(uid).collection('pins').doc(p.pinDocId),
            { routeId }
          );
        } else {
          const pinRef = fdb.collection('users').doc(uid).collection('pins').doc();
          batch.set(pinRef, {
            lat, lng,
            locName: '',
            photoUrl: p.url,
            routeId,
            source: 'share',
            createdAt: p.createdAt
          });
          p.pinDocId = pinRef.id;
        }
        withPin++;
        coordsForMap.push({ lat, lng });
      } else {
        noLoc++;
      }
    }

    try {
      await batch.commit();
      try { sessionStorage.removeItem('share_pending'); } catch (_) {}
      closeOverlay();

      const msgs = [];
      if (withPin) msgs.push(`${withPin} en el mapa`);
      if (noLoc) msgs.push(`${noLoc} solo galería`);
      showShareToast(`✓ Añadido${withPin + noLoc === 1 ? '' : 's'} a ${routeName} · ${msgs.join(' · ')}`);

      if (withPin > 0 && typeof window.openLiveMap === 'function') {
        setTimeout(async () => {
          window.openLiveMap();
          await new Promise(r => setTimeout(r, 500));
          if (typeof window.reloadSavedPins === 'function') {
            try { await window.reloadSavedPins(); } catch (_) {}
          }
          if (typeof window.liveMapFitPins === 'function') {
            window.liveMapFitPins(coordsForMap);
          }
        }, 1800);
      }
    } catch (err) {
      console.error('[share-inbox] fast path error', err);
      alert('Error añadiendo fotos a la ruta activa');
      // Fallback: pasar a pantalla de asignación
      await showAssignmentUI(uploaded, uid, fdb);
    }
  }

  // Arrancar si venimos de un share
  function maybeStart() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('share') === 'ready') {
        runInbox();
      } else if (params.get('share') === 'error') {
        showOverlay('No se pudieron recibir las fotos compartidas.');
        setTimeout(closeOverlay, 3000);
        try { window.history.replaceState({}, '', window.location.pathname); } catch (_) {}
      }
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeStart);
  } else {
    maybeStart();
  }
})();
