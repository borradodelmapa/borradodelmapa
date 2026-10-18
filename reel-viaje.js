/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — reel-viaje.js
   "Crear Reel" (caso p-mve4547l7rl): vídeo vertical 9:16 (1080×1920, MP4) de tu viaje, para Reels / TikTok / Shorts.
   Dibuja el mapa del mundo con los países (los mismos contornos de Tu mundo, sin descargar mapas), la ruta que se va
   trazando, la cámara que viaja de parada en parada y las fotos de cada una como polaroids.
   Funciona en cualquier país. Se crea en el móvil con WebCodecs + mp4-muxer (los mismos del editor de vídeo).
   💶 0 €: sin Claude, sin Google, sin mapas de pago. Solo lee las fotos ya subidas.

   reelViaje.open({ title, stops:[{lat,lng,t,place,photos:[{url,t}]}], feats:[{id,name,polys,on:[bool],st:'v'|'p'}] })
   ═══════════════════════════════════════════ */
const reelViaje = (() => {
  const W = 1080, H = 1920, FPS = 30;
  const mx = lng => (lng + 180) / 360;
  const my = lat => { const l = Math.max(-85, Math.min(85, lat)) * Math.PI / 180; return (1 - Math.log(Math.tan(Math.PI / 4 + l / 2)) / Math.PI) / 2; };
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const backOut = u => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const FONT = '"Barlow Condensed","Arial Narrow",sans-serif';
  const sc = z => 512 * Math.pow(2, z);   // píxeles por unidad de mundo (0..1) a zoom z, en el lienzo lógico de 1080 px

  /* ── datos preparados para dibujar ── */
  function prepare(o) {
    const stops = o.stops.map(s => ({ ...s, X: mx(s.lng), Y: my(s.lat), imgs: [] }));
    const feats = o.feats.map(f => {
      const polys = f.polys.map(p => p.map(r => { const a = new Float32Array(r.length * 2); r.forEach(([x, y], i) => { a[2 * i] = mx(x); a[2 * i + 1] = my(y); }); return a; }));
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
      polys.forEach(p => { const a = p[0]; for (let i = 0; i < a.length; i += 2) { if (a[i] < x0) x0 = a[i]; if (a[i] > x1) x1 = a[i]; if (a[i + 1] < y0) y0 = a[i + 1]; if (a[i + 1] > y1) y1 = a[i + 1]; } });
      const pbb = polys.map(p => { const a = p[0]; let a0 = 1, b0 = 1, a1 = 0, b1 = 0; for (let i = 0; i < a.length; i += 2) { if (a[i] < a0) a0 = a[i]; if (a[i] > a1) a1 = a[i]; if (a[i + 1] < b0) b0 = a[i + 1]; if (a[i + 1] > b1) b1 = a[i + 1]; } return [a0, b0, a1, b1]; });
      return { name: f.name, polys, pbb, on: f.on || [], st: f.st || '', bb: [x0, y0, x1, y1] };
    });
    // vista de conjunto (para la portada y el final): encaja todas las paradas con margen
    let a0 = 1, b0 = 1, a1 = 0, b1 = 0; stops.forEach(s => { a0 = Math.min(a0, s.X); a1 = Math.max(a1, s.X); b0 = Math.min(b0, s.Y); b1 = Math.max(b1, s.Y); });
    const dx = Math.max(a1 - a0, .004), dy = Math.max(b1 - b0, .004);
    const zAll = clamp(Math.min(Math.log2(.62 * W / (512 * dx)), Math.log2(.30 * H / (512 * dy))), 1.2, 6.5);
    const all = { fx: (a0 + a1) / 2, fy: (b0 + b1) / 2, z: zAll, yo: .5 };
    return { stops, feats, all, title: o.title || 'Mi viaje', range: o.range || '', fotosN: o.fotosN || 0 };
  }

  /* ── línea de tiempo: portada → (viaje + parada)×N → final ── */
  const INTRO = 2.0, FLY = 1.5, FLY0 = 1.8, HOLD = 3.0, OUTRO = 3.0;
  function timeline(D) {
    const n = D.stops.length, seg = []; let t = INTRO;
    for (let i = 0; i < n; i++) { const f = i ? FLY : FLY0; seg.push({ i, t0: t, fly: f, hold: HOLD }); t += f + HOLD; }
    return { seg, outroAt: t, total: t + OUTRO };
  }
  function stopZoom(s) { return s.photos && s.photos.length > 1 ? 6.2 : 6.8; }
  function camAt(D, TL, t) {
    const n = D.stops.length;
    if (t < INTRO) { const u = ease(clamp(t / INTRO, 0, 1)); const s0 = D.stops[0]; return { ...D.all, z: lerp(Math.max(1.2, D.all.z - .6), D.all.z, u), mark: null, prog: 0, cur: -1 }; }
    for (const g of TL.seg) {
      if (t < g.t0 + g.fly + g.hold) {
        const s = D.stops[g.i], p = g.i ? D.stops[g.i - 1] : null, zs = stopZoom(s);
        const A = g.i ? { fx: p.X, fy: p.Y, z: stopZoom(p), yo: .30 } : { ...D.all };
        const B = { fx: s.X, fy: s.Y, z: zs, yo: .30 };
        const u = clamp((t - g.t0) / g.fly, 0, 1), e = ease(u);
        const base = lerp(A.z, B.z, e), dist = Math.hypot(A.fx - B.fx, A.fy - B.fy), zFit = Math.log2(.55 * W / (512 * Math.max(dist, .002)));
        const dip = clamp(lerp(A.z, B.z, .5) - zFit, 0, 4.2);
        const cam = { fx: lerp(A.fx, B.fx, e), fy: lerp(A.fy, B.fy, e), z: base - dip * Math.sin(Math.PI * u), yo: lerp(A.yo, B.yo, e) };
        return { ...cam, mark: { X: cam.fx, Y: cam.fy }, prog: e, cur: g.i, inHold: t >= g.t0 + g.fly, holdT: t - g.t0 - g.fly };
      }
    }
    const u = ease(clamp((t - TL.outroAt) / 1.6, 0, 1)), last = D.stops[n - 1], zl = stopZoom(last);
    return { fx: lerp(last.X, D.all.fx, u), fy: lerp(last.Y, D.all.fy, u), z: lerp(zl, D.all.z, u), yo: lerp(.30, .5, u), mark: null, prog: 1, cur: n, outro: u };
  }

  /* ── dibujo de un fotograma (en lienzo lógico 1080×1920; k = escala del lienzo real) ── */
  function draw(cx, k, D, TL, t) {
    cx.setTransform(k, 0, 0, k, 0, 0);
    const cam = camAt(D, TL, t), s = sc(cam.z), ox = W / 2 - cam.fx * s, oy = H * cam.yo - cam.fy * s;
    const X = x => x * s + ox, Y = y => y * s + oy;
    cx.fillStyle = '#0b1216'; cx.fillRect(0, 0, W, H);
    // países
    cx.lineJoin = 'round';
    for (const f of D.feats) {
      const b = f.bb; if (X(b[2]) < -20 || X(b[0]) > W + 20 || Y(b[3]) < -20 || Y(b[1]) > H + 20) continue;
      f.polys.forEach((poly, pi) => {
        const pb = f.pbb[pi]; if (X(pb[2]) < -20 || X(pb[0]) > W + 20 || Y(pb[3]) < -20 || Y(pb[1]) > H + 20) return;
        cx.beginPath();
        poly.forEach(r => { for (let i = 0; i < r.length; i += 2) { const px = X(r[i]), py = Y(r[i + 1]); i ? cx.lineTo(px, py) : cx.moveTo(px, py); } cx.closePath(); });
        const on = f.st && f.on[pi] !== false;
        cx.fillStyle = on ? (f.st === 'v' ? 'rgba(244,99,11,.42)' : 'rgba(122,58,20,.35)') : '#23272b';
        cx.fill('evenodd'); cx.strokeStyle = on && f.st === 'v' ? '#F4630B' : '#0d0f10'; cx.lineWidth = on && f.st === 'v' ? 2 : 1.2; cx.stroke();
      });
    }
    // nombres de países visitados (solo con el mapa lejos)
    if (cam.z < 6.4) {
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      for (const f of D.feats) {
        if (f.st !== 'v') continue; const b = f.bb, px = X((b[0] + b[2]) / 2), py = Y((b[1] + b[3]) / 2);
        if (px < 60 || px > W - 60 || py < 80 || py > H - 80) continue;
        const wpx = (b[2] - b[0]) * s; if (wpx < 90) continue;
        cx.font = `700 ${clamp(wpx / 9, 26, 54)}px ${FONT}`; cx.fillStyle = 'rgba(236,235,232,.78)'; cx.fillText(f.name.toUpperCase(), px, py);
      }
    }
    // ruta
    const n = D.stops.length, upto = cam.cur < 0 ? -1 : Math.min(cam.cur, n);
    const pts = []; for (let i = 0; i < Math.max(0, upto); i++) pts.push([D.stops[i].X, D.stops[i].Y]);
    if (cam.mark) pts.push([cam.mark.X, cam.mark.Y]); else if (cam.cur >= n) pts.push([D.stops[n - 1].X, D.stops[n - 1].Y]);
    if (cam.cur >= 0 && cam.cur < n && !cam.mark) pts.push([D.stops[cam.cur].X, D.stops[cam.cur].Y]);
    if (pts.length > 1) {
      cx.beginPath(); pts.forEach(([x, y], i) => i ? cx.lineTo(X(x), Y(y)) : cx.moveTo(X(x), Y(y)));
      cx.lineCap = 'round'; cx.strokeStyle = 'rgba(244,99,11,.28)'; cx.lineWidth = 16; cx.stroke(); cx.strokeStyle = '#F4630B'; cx.lineWidth = 6; cx.stroke();
    }
    // paradas ya visitadas
    for (let i = 0; i < n; i++) { if (cam.cur >= 0 && i > cam.cur) break; if (i === cam.cur && cam.mark) continue; const px = X(D.stops[i].X), py = Y(D.stops[i].Y); cx.beginPath(); cx.arc(px, py, 11, 0, 7); cx.fillStyle = '#F4630B'; cx.fill(); cx.lineWidth = 4; cx.strokeStyle = '#fff'; cx.stroke(); }
    // marcador actual con pulso
    const cur = cam.cur >= 0 && cam.cur < n ? (cam.mark || { X: D.stops[cam.cur].X, Y: D.stops[cam.cur].Y }) : null;
    if (cur) { const px = X(cur.X), py = Y(cur.Y), ph = (t * 1.2) % 1; cx.beginPath(); cx.arc(px, py, 16 + 34 * ph, 0, 7); cx.strokeStyle = `rgba(244,99,11,${.7 * (1 - ph)})`; cx.lineWidth = 5; cx.stroke(); cx.beginPath(); cx.arc(px, py, 17, 0, 7); cx.fillStyle = '#F4630B'; cx.fill(); cx.lineWidth = 6; cx.strokeStyle = '#fff'; cx.stroke(); }

    // degradados para leer el texto
    let g = cx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, 'rgba(13,15,16,.92)'); g.addColorStop(1, 'rgba(13,15,16,0)'); cx.fillStyle = g; cx.fillRect(0, 0, W, 520);
    g = cx.createLinearGradient(0, H - 700, 0, H); g.addColorStop(0, 'rgba(13,15,16,0)'); g.addColorStop(1, 'rgba(13,15,16,.9)'); cx.fillStyle = g; cx.fillRect(0, H - 700, W, 700);

    // cabecera
    cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    cx.fillStyle = '#F4630B'; cx.font = `800 46px ${FONT}`; cx.fillText('BORRADO DEL MAPA', 70, 118);
    cx.fillStyle = '#ECEBE8'; let fs = 150; cx.font = `800 ${fs}px ${FONT}`; const tt = D.title.toUpperCase(); while (cx.measureText(tt).width > W - 140 && fs > 60) { fs -= 6; cx.font = `800 ${fs}px ${FONT}`; }
    const ti = t < INTRO ? ease(clamp(t / .8, 0, 1)) : 1; cx.globalAlpha = ti; cx.fillText(tt, 70, 118 + 20 + fs * .9); cx.globalAlpha = 1;
    if (D.range) { cx.fillStyle = '#C4C7C9'; cx.font = `600 40px ${FONT}`; cx.fillText(D.range.toUpperCase(), 72, 118 + 20 + fs * .9 + 56); }

    // fotos de la parada en curso
    if (cam.cur >= 0 && cam.cur < n && cam.inHold) {
      const st = D.stops[cam.cur], imgs = st.imgs, m = imgs.length, ht = cam.holdT, out = clamp((ht - (HOLD - .45)) / .45, 0, 1);
      for (let j = 0; j < m; j++) {
        const appear = clamp((ht - .15 - j * .25) / .6, 0, 1); if (appear <= 0) continue;
        const big = m === 1, cw = big ? 760 : 600, ch = big ? 900 : 730, ix = big ? 0 : [-150, 150, 0][j] * (m === 2 ? 1 : 1), rot = big ? -.03 : [-.09, .08, -.02][j];
        const cxp = W / 2 + ix, cyp = 1390 + (big ? 0 : (j === 2 ? -20 : 10)) + (1 - backOut(appear)) * 1000 + out * 1100 + Math.sin(ht * .8 + j) * 4;
        cx.save(); cx.translate(cxp, cyp); cx.rotate(rot); cx.scale(1 + ht * .006, 1 + ht * .006);
        cx.shadowColor = 'rgba(0,0,0,.55)'; cx.shadowBlur = 40; cx.shadowOffsetY = 16; cx.fillStyle = '#f4f1ea'; cx.fillRect(-cw / 2, -ch / 2, cw, ch); cx.shadowColor = 'transparent';
        const pad = 26, iw = cw - 2 * pad, ih = ch - pad - 150, im = imgs[j];
        if (im) { const r = Math.max(iw / im.width, ih / im.height), sw = iw / r, sh = ih / r; cx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, -cw / 2 + pad, -ch / 2 + pad, iw, ih); }
        else { cx.fillStyle = '#c9c4b8'; cx.fillRect(-cw / 2 + pad, -ch / 2 + pad, iw, ih); }
        if (j === m - 1) { cx.fillStyle = '#16181a'; cx.textAlign = 'left'; cx.font = `800 ${big ? 64 : 54}px ${FONT}`; cx.fillText((st.place || '').toUpperCase(), -cw / 2 + pad, ch / 2 - 78); cx.fillStyle = '#6b6f73'; cx.font = `600 ${big ? 36 : 32}px ${FONT}`; cx.fillText(st.when || '', -cw / 2 + pad, ch / 2 - 30); }
        cx.restore();
      }
    }
    // contador y firma
    cx.textAlign = 'right'; cx.textBaseline = 'alphabetic';
    if (cam.cur >= 0 && cam.cur < n) { cx.fillStyle = '#ECEBE8'; cx.font = `800 54px ${FONT}`; cx.fillText(`${String(cam.cur + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, W - 70, 118); }
    cx.textAlign = 'left'; cx.fillStyle = 'rgba(236,235,232,.75)'; cx.font = `600 34px ${FONT}`; cx.fillText('borradodelmapa.com', 70, H - 52);
    // final
    if (cam.cur >= n) {
      const a = clamp(cam.outro * 1.4, 0, 1); cx.globalAlpha = a; cx.textAlign = 'center'; cx.fillStyle = '#ECEBE8'; cx.font = `800 120px ${FONT}`; cx.fillText(`${D.stops.length} PARADAS`, W / 2, 1460);
      cx.fillStyle = '#F4630B'; cx.font = `800 70px ${FONT}`; cx.fillText(D.fotosN ? `${D.fotosN} FOTOS · UN VIAJE` : 'UN VIAJE', W / 2, 1550); cx.globalAlpha = 1;
    }
  }

  /* ── fotos ── */
  async function loadImgs(D, onProg) {
    const jobs = []; D.stops.forEach(s => (s.photos || []).slice(0, 3).forEach(p => jobs.push({ s, p })));
    let done = 0;
    await Promise.all(jobs.map(async j => {
      let bm = null;
      try { const r = await fetch(j.p.url); if (!r.ok) throw 0; bm = await createImageBitmap(await r.blob(), { resizeWidth: 760, resizeQuality: 'medium' }); } catch (_) {}
      j.s.imgs.push(bm); onProg && onProg(++done, jobs.length);
    }));
    D.stops.forEach(s => { const ok = s.imgs.filter(Boolean); s.imgs = ok.length ? ok : []; });
  }

  /* ── pantalla del Reel ── */
  let _ov = null;
  function _loadScript(src) { return new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = rej; document.head.appendChild(el); }); }
  function close(fromHistory) {
    if (!_ov) return; _ov._stop = true; try { if (_ov._url) URL.revokeObjectURL(_ov._url); } catch (_) {} _ov.remove(); _ov = null;
    if (!fromHistory && window.popModal) window.popModal('reel-viaje');
  }

  async function open(o) {
    if (_ov) close(true);
    const D = prepare(o), TL = timeline(D);
    const ov = _ov = document.createElement('div'); ov.className = 'rl-ov'; ov._stop = false;
    ov.innerHTML = `<div class="rl-head"><button type="button" class="tm-back" id="rl-back">‹ Tu mundo</button></div>
      <div class="rl-body"><div class="rl-stage"><canvas id="rl-cv"></canvas><video id="rl-vid" controls playsinline hidden></video></div>
      <p class="rl-note" id="rl-note">Cargando las fotos…</p>
      <div class="rl-acts"><button type="button" class="tm-btn" id="rl-make" disabled>🎬 Crear el vídeo</button><button type="button" class="tm-btn" id="rl-share" hidden>Compartir</button><button type="button" class="tm-btn rl-sec" id="rl-dl" hidden>Descargar</button></div>
      <p class="rl-small">Vertical 9:16 · 1080p · para Reels, TikTok y Shorts. Se crea en tu móvil, sin coste. Sin música: añádela al publicarlo.</p></div>`;
    document.body.appendChild(ov);
    const $ = s => ov.querySelector(s), cv = $('#rl-cv'), note = $('#rl-note'), make = $('#rl-make');
    ov.querySelector('#rl-back').onclick = () => close();
    if (window.pushModal) window.pushModal('reel-viaje', () => close(true));
    try { await document.fonts.load('800 40px "Barlow Condensed"'); await document.fonts.load('600 40px "Barlow Condensed"'); } catch (_) {}
    await loadImgs(D, (i, n) => { note.textContent = `Cargando las fotos… ${i}/${n}`; });
    if (ov._stop) return;

    // vista previa en directo (lienzo pequeño)
    const PK = 360 / W; cv.width = Math.round(W * PK); cv.height = Math.round(H * PK); const pcx = cv.getContext('2d');
    let t0 = performance.now(), busy = false;
    const loop = () => { if (!_ov || ov._stop) return; if (!busy) { const t = ((performance.now() - t0) / 1000) % (TL.total + .8); draw(pcx, PK, D, TL, Math.min(t, TL.total - .01)); } requestAnimationFrame(loop); };
    loop();
    note.textContent = `${D.stops.length} paradas · ${Math.round(TL.total)} s de vídeo. Esto es la vista previa.`; make.disabled = false;

    make.onclick = async () => {
      if (busy) return;
      if (typeof VideoEncoder === 'undefined') { note.textContent = 'Este navegador no puede crear el vídeo. Prueba con Chrome.'; return; }
      busy = true; make.disabled = true; $('#rl-share').hidden = $('#rl-dl').hidden = true; $('#rl-vid').hidden = true; cv.hidden = false;
      let wake = null; try { wake = await navigator.wakeLock.request('screen'); } catch (_) {}
      try {
        if (typeof Mp4Muxer === 'undefined') await _loadScript('/vendor/mapa/mp4-muxer.js');
        const bTope = Math.floor(40 * 8 * 1048576 / TL.total) - 2e5;   // por debajo de 50 MB: el móvil no deja compartir más desde la web
        const cfg = { codec: 'avc1.640028', width: W, height: H, bitrate: Math.max(15e5, Math.min(8e6, bTope)), framerate: FPS, avc: { format: 'avc' } };
        try { if (!(await VideoEncoder.isConfigSupported(cfg)).supported) cfg.codec = 'avc1.42e028'; } catch (_) {}
        const mux = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
        let err = null; const enc = new VideoEncoder({ output: (c, m) => mux.addVideoChunk(c, m), error: e => err = e }); enc.configure(cfg);
        const big = document.createElement('canvas'); big.width = W; big.height = H; const bcx = big.getContext('2d'), N = Math.ceil(TL.total * FPS), tt0 = performance.now();
        for (let f = 0; f < N; f++) {
          if (err || ov._stop) break; draw(bcx, 1, D, TL, f / FPS);
          const vf = new VideoFrame(big, { timestamp: Math.round(f * 1e6 / FPS), duration: Math.round(1e6 / FPS) }); enc.encode(vf, { keyFrame: f % 60 === 0 }); vf.close();
          while (enc.encodeQueueSize > 4) await new Promise(r => setTimeout(r, 2));
          if (f % 6 === 0) { note.textContent = `Creando el vídeo: ${Math.round(f / N * 100)} %. No cierres esta pantalla.`; await new Promise(r => setTimeout(r, 0)); }
        }
        if (ov._stop) return;
        try { await enc.flush(); } catch (e) { err = e; }
        if (err) throw err;
        mux.finalize();
        const blob = new Blob([mux.target.buffer], { type: 'video/mp4' }), file = new File([blob], 'mi-viaje-reel.mp4', { type: 'video/mp4' });
        if (ov._url) URL.revokeObjectURL(ov._url); ov._url = URL.createObjectURL(blob);
        const v = $('#rl-vid'); v.src = ov._url; v.hidden = false; cv.hidden = true;
        note.textContent = `Listo en ${Math.round((performance.now() - tt0) / 1000)} s · ${(blob.size / 1048576).toFixed(1)} MB`;
        const sh = $('#rl-share'), dl = $('#rl-dl');
        dl.hidden = false; dl.onclick = () => { const a = document.createElement('a'); a.href = ov._url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); };
        if (navigator.canShare && navigator.canShare({ files: [file] }) && blob.size < 50 * 1048576) { sh.hidden = false; sh.onclick = async () => { try { await navigator.share({ files: [file] }); } catch (_) {} }; }
        make.textContent = '🎬 Crear otra vez';
        try { navigator.vibrate && navigator.vibrate([120, 60, 120]); } catch (_) {}
      } catch (e) { console.warn('[reel]', e); note.textContent = 'No se pudo crear el vídeo. Prueba otra vez.'; }
      try { wake && wake.release(); } catch (_) {}
      busy = false; make.disabled = false; t0 = performance.now();
    };
  }
  return { open };
})();
window.reelViaje = reelViaje;
