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

  async function processOne(file, uid, db) {
    const buf = await file.blob.arrayBuffer();
    const exif = extractExif(buf);
    const hasGps = exif && exif.lat != null && exif.lng != null;
    const createdAt = exif && exif.date
      ? exif.date
      : (file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString());

    const { key, url } = await uploadPhoto(file.blob, uid);

    // Foto en galería
    await db.collection('users').doc(uid).collection('fotos').add({
      key, url,
      tag: 'compartida',
      caption: '',
      albumId: null,
      routeId: (window._activeRouteDocId || null),
      lat: hasGps ? exif.lat : null,
      lng: hasGps ? exif.lng : null,
      source: 'share',
      createdAt
    });

    // Pin en el mapa solo si hay GPS
    if (hasGps) {
      await db.collection('users').doc(uid).collection('pins').add({
        lat: exif.lat,
        lng: exif.lng,
        locName: '',
        photoUrl: url,
        routeId: (window._activeRouteDocId || null),
        source: 'share',
        createdAt
      });
    }

    return { hasGps, url };
  }

  async function runInbox() {
    // Esperar a que Firebase y currentUser estén listos
    const waitForUser = () => new Promise((resolve) => {
      const check = () => {
        const hasDb = typeof db !== 'undefined' || (window.firebase && window.firebase.firestore);
        if (hasDb && window.currentUser) resolve();
        else setTimeout(check, 300);
      };
      check();
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

    showOverlay('Necesitas iniciar sesión para guardar tus fotos.');

    await waitForUser();

    const uid = window.currentUser.uid;
    // `db` es const global de app.js — accesible por scope global en scripts no-módulo
    const fdb = (typeof db !== 'undefined') ? db : firebase.firestore();

    let withGps = 0;
    let withoutGps = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      showOverlay(`Subiendo ${i + 1} de ${files.length}...`);
      updateProgress((i / files.length) * 100);
      try {
        const res = await processOne(files[i], uid, fdb);
        if (res.hasGps) withGps++;
        else withoutGps++;
        // Borrar de la inbox tras procesar con éxito
        if (cache) await cache.delete(files[i].req);
      } catch (err) {
        console.warn('[share-inbox]', err);
        failed++;
      }
    }

    updateProgress(100);

    const parts = [];
    if (withGps) parts.push(`${withGps} añadida${withGps > 1 ? 's' : ''} al mapa`);
    if (withoutGps) parts.push(`${withoutGps} en galería sin ubicación`);
    if (failed) parts.push(`${failed} fallaron`);
    showOverlay(parts.join(' · ') || 'Listo');

    const btn = document.getElementById('share-inbox-close');
    if (btn) {
      btn.style.display = 'inline-block';
      btn.onclick = () => {
        closeOverlay();
        if (withGps && typeof window.openLiveMap === 'function') {
          // Resetear flag de pins cargados para que traiga los nuevos
          if (typeof window._pinsLoaded !== 'undefined') window._pinsLoaded = false;
          window.openLiveMap();
        }
      };
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
