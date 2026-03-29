/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — video-player.js
   Motor de video slideshow animado v2
   Canvas + requestAnimationFrame + Ken Burns + Mapa animado
   ═══════════════════════════════════════════ */

const videoPlayer = {
  _canvas: null,
  _ctx: null,
  _container: null,
  _photos: [],        // Array de Image objects cargados
  _params: {},        // {titulo, highlight, tipo, stops:[{name,lat,lng}]}
  _stops: [],         // Paradas de ruta con coords normalizadas
  _stopsSimulated: false, // true = stops generados sintéticamente
  _style: 'documental',  // 'documental' | 'historia'
  _frame: 0,
  _totalFrames: 600,
  _fps: 30,
  _playing: false,
  _raf: null,
  _progressFill: null,
  _onEnd: null,       // Callback cuando termina

  // Offsets de escenas (calculados en init)
  _titleEnd: 90,
  _mapEnd: 90,        // = titleEnd si no hay mapa
  _photosEnd: 0,

  // ═══ COLORES ═══
  BG: '#050505',
  GOLD: '#d4a017',
  GOLD2: '#f0c040',
  CREAM: '#f5f0e8',
  CREAM2: 'rgba(245,240,232,0.7)',
  MAP_BG: '#080c12',
  MAP_LINE: '#d4a017',
  MAP_DOT: '#ffffff',

  // ═══ INICIALIZACIÓN ═══
  async init(container, photoUrls, params) {
    this._container = container;
    this._params = params || {};
    this._style  = params.style || 'documental';
    this._frame = 0;
    this._playing = false;
    this._photos = [];
    this._stops = [];

    // Crear canvas
    this._canvas = document.createElement('canvas');
    this._canvas.className = 'video-canvas';
    this._canvas.width = 540;
    this._canvas.height = 960;
    this._ctx = this._canvas.getContext('2d');

    // Cargar imágenes
    const loaded = await Promise.all(photoUrls.map(url => this._loadImage(url)));
    this._photos = loaded.filter(Boolean);
    if (this._photos.length === 0) return false;

    // Procesar paradas de ruta para el mapa
    const rawStops = (params.stops || []).filter(s => s.lat && s.lng);
    this._stopsSimulated = false;
    if (rawStops.length >= 2) {
      this._stops = this._normalizeStops(rawStops);
    } else {
      // Generar recorrido simulado a partir del título (siempre hay escena de mapa)
      this._stops = this._generateSimulatedStops(params.titulo || '');
      this._stopsSimulated = true;
    }

    if (this._style === 'historia') {
      // Historia: solo fotos, 2s por foto (60 frames), sin escenas extra
      const framesPerPhoto = 60;
      this._titleEnd  = 0;
      this._mapEnd    = 0;
      this._photosEnd = this._photos.length * framesPerPhoto;
      this._totalFrames = this._photosEnd;
    } else {
      // Documental: título + mapa + fotos + cierre
      const mapFrames   = 120;
      const photoFrames = Math.max(this._photos.length * 90, 270);
      this._titleEnd  = 90;
      this._mapEnd    = this._titleEnd + mapFrames;
      this._photosEnd = this._mapEnd + photoFrames;
      this._totalFrames = this._photosEnd + 120;
    }

    // Renderizar primer frame
    this._renderFrame(0);
    return true;
  },

  // Normalizar coords a espacio canvas (0..1)
  _normalizeStops(stops) {
    const lats = stops.map(s => s.lat);
    const lngs = stops.map(s => s.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const padLat = (maxLat - minLat) * 0.2 || 0.5;
    const padLng = (maxLng - minLng) * 0.2 || 0.5;

    return stops.map(s => ({
      name: s.name || '',
      day: s.day || null,
      // nx/ny en [0..1] donde ny=0 es arriba (lat mayor)
      nx: (s.lng - minLng + padLng) / (maxLng - minLng + padLng * 2),
      ny: 1 - (s.lat - minLat + padLat) / (maxLat - minLat + padLat * 2)
    }));
  },

  // Genera paradas sintéticas cuando no hay ruta real.
  // Usa el título como semilla para que cada video tenga un camino diferente.
  _generateSimulatedStops(titulo) {
    const seed = (titulo || 'viaje').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
    const rnd = (i) => Math.abs(Math.sin(seed * 9301 + i * 49297)) % 1;

    const count = 4 + (Math.abs(seed) % 3); // 4, 5 o 6 paradas
    const labels = ['Salida', 'Día 1', 'Día 2', 'Día 3', 'Día 4', 'Destino'];
    const stops = [];

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      // Camino de izquierda a derecha con ondulación vertical
      const nx = 0.08 + t * 0.84 + (rnd(i * 3) - 0.5) * 0.1;
      const ny = 0.3 + (rnd(i * 3 + 1) - 0.5) * 0.5;
      stops.push({
        nx: Math.max(0.05, Math.min(0.95, nx)),
        ny: Math.max(0.1, Math.min(0.9, ny)),
        name: i === 0 ? labels[0] : (i === count - 1 ? labels[5] : labels[i] || `Día ${i}`),
        day: i > 0 ? i : null
      });
    }
    return stops;
  },

  _loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  },

  // ═══ REPRODUCCIÓN ═══
  play() {
    if (this._playing) return;
    this._playing = true;
    if (this._frame >= this._totalFrames) this._frame = 0;
    this._lastTime = performance.now();
    this._tick();
  },

  pause() {
    this._playing = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  },

  _tick() {
    if (!this._playing) return;
    const now = performance.now();
    const elapsed = now - this._lastTime;
    const interval = 1000 / this._fps;
    if (elapsed >= interval) {
      this._lastTime = now - (elapsed % interval);
      this._frame++;
      if (this._frame >= this._totalFrames) {
        this._playing = false;
        this._frame = this._totalFrames - 1;
        this._renderFrame(this._frame);
        this._updateProgress();
        if (typeof this._onEnd === 'function') this._onEnd();
        return;
      }
      this._renderFrame(this._frame);
      this._updateProgress();
    }
    this._raf = requestAnimationFrame(() => this._tick());
  },

  _updateProgress() {
    if (this._progressFill) {
      this._progressFill.style.width = (this._frame / this._totalFrames * 100) + '%';
    }
  },

  // ═══ INTERPOLACIÓN Y EASING ═══
  _lerp(frame, fromFrame, toFrame, fromVal, toVal) {
    if (frame <= fromFrame) return fromVal;
    if (frame >= toFrame) return toVal;
    const t = (frame - fromFrame) / (toFrame - fromFrame);
    return fromVal + t * (toVal - fromVal);
  },

  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  _easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  _easeIn(t) {
    return t * t * t;
  },

  _lerpEased(frame, fromFrame, toFrame, fromVal, toVal) {
    if (frame <= fromFrame) return fromVal;
    if (frame >= toFrame) return toVal;
    const t = this._easeInOut((frame - fromFrame) / (toFrame - fromFrame));
    return fromVal + t * (toVal - fromVal);
  },

  // Texto con sombra (helper)
  _drawText(ctx, text, x, y, color, shadow) {
    if (shadow !== false) {
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
    }
    ctx.fillStyle = color || this.CREAM;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  },

  // Envolver texto
  _wrapText(ctx, text, maxWidth) {
    const words = (text || '').split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  },

  // ═══ RENDERIZADO DE FRAMES ═══
  _renderFrame(frame) {
    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;

    // Fondo negro base
    ctx.fillStyle = this.BG;
    ctx.fillRect(0, 0, w, h);

    // Historia de Instagram — renderer propio
    if (this._style === 'historia') {
      this._renderFrameHistoria(frame, w, h);
      return;
    }

    if (frame < this._titleEnd) {
      this._drawTitleScene(frame, w, h);

    } else if (frame < this._mapEnd) {
      // Escena mapa (solo si hay paradas)
      const localFrame = frame - this._titleEnd;
      const totalMap   = this._mapEnd - this._titleEnd;
      this._drawMapScene(localFrame, totalMap, w, h);

    } else if (frame < this._photosEnd) {
      // Fotos
      const photoFrames = this._photosEnd - this._mapEnd;
      const photoFramesPerImage = Math.floor(photoFrames / Math.max(this._photos.length, 1));
      const photoFrame = frame - this._mapEnd;
      const photoIdx   = Math.min(Math.floor(photoFrame / photoFramesPerImage), this._photos.length - 1);
      const localFrame = photoFrame % photoFramesPerImage;
      this._drawPhotoScene(photoIdx, localFrame, photoFramesPerImage, w, h);

    } else {
      const localFrame  = frame - this._photosEnd;
      const totalClose  = this._totalFrames - this._photosEnd;
      this._drawCloseScene(localFrame, totalClose, w, h);
    }
  },

  // ═══ ESCENA: TÍTULO ═══
  _drawTitleScene(frame, w, h) {
    const ctx = this._ctx;

    // Gradiente de fondo
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Partículas sutiles (puntos fijos en posición)
    this._drawStarfield(frame, w, h);

    const opacity = this._lerpEased(frame, 0, 25, 0, 1);
    ctx.globalAlpha = opacity;

    // Línea dorada superior (crece)
    const lineW = this._lerpEased(frame, 5, 40, 0, 140);
    ctx.fillStyle = this.GOLD;
    ctx.fillRect((w - lineW) / 2, h * 0.34, lineW, 2);

    // Título principal
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    const titulo = this._params.titulo || 'Mi viaje';
    const lines  = this._wrapText(ctx, titulo, w * 0.8);
    const lineH  = 38;
    const startY = h * 0.42 - ((lines.length - 1) * lineH) / 2;

    lines.forEach((line, i) => {
      this._drawText(ctx, line, w / 2, startY + i * lineH, this.CREAM);
    });

    // Fecha
    ctx.font = '13px monospace';
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const dateY = startY + lines.length * lineH + 18;
    this._drawText(ctx, fecha, w / 2, dateY, this.GOLD);

    // Destino / tipo (si hay ruta)
    if (this._stops.length >= 2) {
      const opLabel = this._lerpEased(frame, 30, 60, 0, 0.6);
      ctx.globalAlpha = opLabel;
      ctx.font = '11px monospace';
      const mapHint = this._stopsSimulated ? 'recorrido · ver mapa' : `${this._stops.length} paradas · ver mapa`;
      this._drawText(ctx, mapHint, w / 2, dateY + 22, this.CREAM2);
      ctx.globalAlpha = opacity;
    }

    // Línea dorada inferior
    ctx.fillStyle = this.GOLD;
    ctx.fillRect((w - lineW) / 2, h * 0.34 + (lines.length * lineH) + 52, lineW, 2);

    // Marca de agua muy tenue
    const brandOp = this._lerp(frame, 50, 80, 0, 0.25);
    ctx.globalAlpha = brandOp;
    ctx.font = '10px monospace';
    ctx.fillStyle = this.GOLD;
    ctx.fillText('SALMA · borradodelmapa.com', w / 2, h * 0.92);

    ctx.globalAlpha = 1;
  },

  // Estrellitas de fondo (decorativas)
  _drawStarfield(frame, w, h) {
    const ctx = this._ctx;
    ctx.save();
    // Puntos fijos basados en pseudo-random determinista
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + 23) % 100) / 100 * w;
      const sy = ((i * 97 + 11) % 100) / 100 * h;
      const sr = 0.5 + (i % 3) * 0.5;
      const flicker = 0.2 + 0.3 * Math.abs(Math.sin((frame + i * 7) * 0.04));
      ctx.globalAlpha = flicker;
      ctx.fillStyle = this.CREAM;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // ═══ ESCENA: MAPA ANIMADO ═══
  _drawMapScene(localFrame, totalFrames, w, h) {
    if (this._stops.length < 2) return;
    const ctx = this._ctx;

    // Fondo mapa (azul noche)
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#060a10');
    grad.addColorStop(1, '#030508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid sutil tipo mapa
    this._drawMapGrid(w, h);

    // Fade in global de la escena
    const sceneOp = this._lerpEased(localFrame, 0, 20, 0, 1);
    ctx.globalAlpha = sceneOp;

    // Área del mapa en canvas (centrada, con padding)
    const mapPad  = 80;
    const mapX    = mapPad;
    const mapY    = h * 0.18;
    const mapW    = w - mapPad * 2;
    const mapH    = h * 0.58;

    // Calcular posición de cada parada en canvas
    const pts = this._stops.map(s => ({
      ...s,
      cx: mapX + s.nx * mapW,
      cy: mapY + s.ny * mapH
    }));

    // Progreso del trazo (0→1 durante frames 10..totalFrames-20)
    const traceT = this._easeInOut(
      Math.max(0, Math.min(1, (localFrame - 10) / (totalFrames - 35)))
    );

    // Dibujar conexiones (línea de ruta)
    this._drawRouteTrace(ctx, pts, traceT);

    // Dibujar paradas
    this._drawStops(ctx, pts, traceT, localFrame, totalFrames);

    // Título del mapa
    const labelOp = this._lerpEased(localFrame, 15, 40, 0, 1);
    ctx.globalAlpha = sceneOp * labelOp;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    const mapHeader = this._stopsSimulated ? 'EL RECORRIDO' : 'TU RUTA';
    this._drawText(ctx, mapHeader, w / 2, h * 0.14, this.GOLD);
    ctx.font = '11px sans-serif';
    this._drawText(ctx, this._params.titulo || '', w / 2, h * 0.14 + 20, this.CREAM2);

    // Contador de paradas
    ctx.globalAlpha = sceneOp * this._lerpEased(localFrame, totalFrames - 25, totalFrames - 5, 0, 1);
    ctx.font = '11px monospace';
    const countLabel = this._stopsSimulated ? 'el viaje comienza' : `${this._stops.length} destinos`;
    this._drawText(ctx, countLabel, w / 2, h * 0.84, this.GOLD);

    ctx.globalAlpha = 1;
  },

  _drawMapGrid(w, h) {
    const ctx = this._ctx;
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#4488aa';
    ctx.lineWidth = 0.5;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  },

  _drawRouteTrace(ctx, pts, progress) {
    if (pts.length < 2) return;
    ctx.save();

    // Total length of the path
    const totalLen = pts.reduce((acc, p, i) => {
      if (i === 0) return 0;
      const dx = p.cx - pts[i-1].cx;
      const dy = p.cy - pts[i-1].cy;
      return acc + Math.sqrt(dx*dx + dy*dy);
    }, 0);

    // Dibujar hasta 'progress' de la longitud total
    let drawn = 0;
    const targetLen = totalLen * progress;

    // Glow exterior (gold difuso)
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = this.GOLD2;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].cx, pts[0].cy);

    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].cx - pts[i-1].cx;
      const dy = pts[i].cy - pts[i-1].cy;
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (drawn >= targetLen) break;
      if (drawn + segLen <= targetLen) {
        ctx.lineTo(pts[i].cx, pts[i].cy);
        drawn += segLen;
      } else {
        const frac = (targetLen - drawn) / segLen;
        ctx.lineTo(pts[i-1].cx + dx * frac, pts[i-1].cy + dy * frac);
        drawn = targetLen;
        break;
      }
    }
    ctx.stroke();

    // Línea principal (dorada)
    drawn = 0;
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = this.GOLD;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(pts[0].cx, pts[0].cy);

    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].cx - pts[i-1].cx;
      const dy = pts[i].cy - pts[i-1].cy;
      const segLen = Math.sqrt(dx*dx + dy*dy);
      if (drawn >= targetLen) break;
      if (drawn + segLen <= targetLen) {
        ctx.lineTo(pts[i].cx, pts[i].cy);
        drawn += segLen;
      } else {
        const frac = (targetLen - drawn) / segLen;
        ctx.lineTo(pts[i-1].cx + dx * frac, pts[i-1].cy + dy * frac);
        drawn = targetLen;
        break;
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  _drawStops(ctx, pts, traceT, localFrame, totalFrames) {
    ctx.save();
    const n = pts.length;

    pts.forEach((p, i) => {
      // Cuándo aparece esta parada (distribuido por traceT)
      const stopThreshold = i / (n - 1);
      const stopProgress  = Math.max(0, Math.min(1, (traceT - stopThreshold * 0.9) / 0.12));
      if (stopProgress <= 0) return;

      const isFirst  = i === 0;
      const isLast   = i === n - 1;
      const isCurrent = i === Math.floor(traceT * (n - 1));

      // Glow del punto
      ctx.globalAlpha = stopProgress * 0.4;
      const glowR = isFirst || isLast ? 18 : 12;
      const glowGrad = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, glowR);
      glowGrad.addColorStop(0, this.GOLD2);
      glowGrad.addColorStop(1, 'rgba(212,160,23,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Punto central
      ctx.globalAlpha = stopProgress;
      const r = isFirst || isLast ? 6 : 4;
      ctx.fillStyle = isFirst || isLast ? this.GOLD : this.MAP_DOT;
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Borde
      ctx.strokeStyle = this.GOLD;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pulso animado en el último punto dibujado
      if (isCurrent && traceT > 0.02) {
        const pulseT = (localFrame * 0.15) % 1;
        const pulseR = r + pulseT * 14;
        ctx.globalAlpha = stopProgress * (1 - pulseT) * 0.6;
        ctx.strokeStyle = this.GOLD;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Etiqueta del nombre
      ctx.globalAlpha = stopProgress;
      const shortName = p.name.length > 14 ? p.name.substring(0, 13) + '…' : p.name;
      ctx.font = isFirst || isLast ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';

      // Posición del texto: alternar arriba/abajo para evitar solapamientos
      const labelOffset = i % 2 === 0 ? -14 : 16;
      this._drawText(ctx, shortName, p.cx, p.cy + labelOffset, isFirst || isLast ? this.GOLD : this.CREAM);

      if (p.day) {
        ctx.globalAlpha = stopProgress * 0.6;
        ctx.font = '9px monospace';
        this._drawText(ctx, `Día ${p.day}`, p.cx, p.cy + labelOffset + 11, this.GOLD);
      }
    });

    ctx.restore();
  },

  // ═══ ESCENA: FOTOS (Ken Burns mejorado) ═══
  _drawPhotoScene(photoIdx, localFrame, totalFrames, w, h) {
    const ctx = this._ctx;
    const photo = this._photos[photoIdx];
    if (!photo) return;

    // Ken Burns con easing suave
    const progress = this._easeInOut(localFrame / totalFrames);
    const zoom     = 1.0 + 0.12 * progress;
    // Alternar dirección del pan por foto
    const dirX = (photoIdx % 2 === 0 ? 1 : -1);
    const dirY = (photoIdx % 3 === 0 ? -1 : 1);
    const panX = dirX * 18 * progress;
    const panY = dirY * 10 * progress;

    // Fade in / fade out con easing
    const fadeIn  = this._lerpEased(localFrame, 0, 18, 0, 1);
    const fadeOut = this._lerpEased(localFrame, totalFrames - 18, totalFrames, 1, 0);
    const alpha   = Math.min(fadeIn, fadeOut);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.scale(zoom, zoom);

    // Cover: llenar canvas manteniendo relación de aspecto
    const imgRatio    = photo.width / photo.height;
    const canvasRatio = w / h;
    let dw, dh;
    if (imgRatio > canvasRatio) {
      dh = h; dw = h * imgRatio;
    } else {
      dw = w; dh = w / imgRatio;
    }
    ctx.drawImage(photo, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    // Overlay gradient (abajo) para legibilidad del contador
    ctx.globalAlpha = alpha * 0.6;
    const overlayGrad = ctx.createLinearGradient(0, h * 0.75, 0, h);
    overlayGrad.addColorStop(0, 'rgba(0,0,0,0)');
    overlayGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Contador de foto
    ctx.globalAlpha = alpha;
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    this._drawText(ctx, `${photoIdx + 1} / ${this._photos.length}`, w - 20, h - 18, this.CREAM2);

    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
  },

  // ═══ ESCENA: CIERRE ═══
  _drawCloseScene(localFrame, totalFrames, w, h) {
    const ctx = this._ctx;

    // Fondo degradado oscuro
    const grad = ctx.createLinearGradient(0, h * 0.3, 0, h);
    grad.addColorStop(0, '#050505');
    grad.addColorStop(1, '#0a0805');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Estrellas de fondo
    this._drawStarfield(localFrame + 300, w, h);

    const sceneOp = this._lerpEased(localFrame, 0, 25, 0, 1);
    ctx.globalAlpha = sceneOp;

    // Comillas decorativas
    const quoteOp = this._lerpEased(localFrame, 5, 30, 0, 0.3);
    ctx.globalAlpha = sceneOp * quoteOp;
    ctx.font = 'bold 72px serif';
    ctx.fillStyle = this.GOLD;
    ctx.textAlign = 'left';
    ctx.fillText('"', w * 0.12, h * 0.38);
    ctx.textAlign = 'right';
    ctx.fillText('"', w * 0.88, h * 0.52);

    // Highlight (frase del día)
    if (this._params.highlight) {
      ctx.globalAlpha = sceneOp;
      ctx.font = 'italic 19px sans-serif';
      ctx.textAlign = 'center';
      const lines = this._wrapText(ctx, this._params.highlight, w * 0.72);
      const lineH = 28;
      const startY = h * 0.42 - ((lines.length - 1) * lineH) / 2;
      lines.forEach((line, i) => {
        this._drawText(ctx, line, w / 2, startY + i * lineH, this.CREAM);
      });
    }

    // Línea dorada central
    const lineW = this._lerpEased(localFrame, 20, 55, 0, 100);
    ctx.globalAlpha = sceneOp;
    ctx.fillStyle = this.GOLD;
    ctx.fillRect((w - lineW) / 2, h * 0.58, lineW, 2);

    // Branding
    const brandOp = this._lerpEased(localFrame, 40, 70, 0, 1);
    ctx.globalAlpha = sceneOp * brandOp;

    // SALMA (grande)
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    this._drawText(ctx, 'SALMA', w / 2, h * 0.655, this.GOLD);

    // Línea separadora
    ctx.globalAlpha = sceneOp * brandOp * 0.4;
    ctx.fillStyle = this.GOLD;
    ctx.fillRect(w / 2 - 30, h * 0.672, 60, 1);

    // URL
    ctx.globalAlpha = sceneOp * brandOp * 0.6;
    ctx.font = '11px monospace';
    this._drawText(ctx, 'borradodelmapa.com', w / 2, h * 0.69, this.CREAM2);

    // Destino (de params)
    if (this._params.titulo) {
      ctx.globalAlpha = sceneOp * this._lerpEased(localFrame, 55, 80, 0, 0.5);
      ctx.font = '12px sans-serif';
      this._drawText(ctx, this._params.titulo, w / 2, h * 0.73, this.CREAM2);
    }

    ctx.globalAlpha = 1;
  },

  // ══════════════════════════════════════════════
  //   MODO HISTORIA — Instagram Stories 9:16
  // ══════════════════════════════════════════════

  _renderFrameHistoria(frame, w, h) {
    const framesPerPhoto = 60;
    const n       = this._photos.length;
    const photoIdx = Math.min(Math.floor(frame / framesPerPhoto), n - 1);
    const local    = frame % framesPerPhoto;
    this._drawHistoriaSlide(photoIdx, local, framesPerPhoto, w, h);
  },

  _drawHistoriaSlide(photoIdx, localFrame, totalFrames, w, h) {
    const ctx   = this._ctx;
    const photo = this._photos[photoIdx];
    if (!photo) return;

    const n = this._photos.length;

    // Ken Burns (zoom + pan suave)
    const progress = this._easeInOut(localFrame / totalFrames);
    const zoom     = 1.0 + 0.08 * progress;
    const dirX     = (photoIdx % 2 === 0 ? 1 : -1);
    const panX     = dirX * 12 * progress;

    // Fade in / out rápidos (6 frames)
    const fadeIn   = this._lerpEased(localFrame, 0, 8, 0, 1);
    const fadeOut  = this._lerpEased(localFrame, totalFrames - 8, totalFrames, 1, 0);
    const alpha    = Math.min(fadeIn, fadeOut);

    // ── Foto con Ken Burns ──
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(w / 2 + panX, h / 2);
    ctx.scale(zoom, zoom);
    const imgRatio    = photo.width / photo.height;
    const canvasRatio = w / h;
    let dw, dh;
    if (imgRatio > canvasRatio) { dh = h; dw = h * imgRatio; }
    else                        { dw = w; dh = w / imgRatio; }
    ctx.drawImage(photo, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    ctx.globalAlpha = alpha;

    // ── Gradiente superior (para barra de progreso) ──
    const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.22);
    topGrad.addColorStop(0,   'rgba(0,0,0,0.72)');
    topGrad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, w, h * 0.22);

    // ── Gradiente inferior (para texto) ──
    const botGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
    botGrad.addColorStop(0,   'rgba(0,0,0,0)');
    botGrad.addColorStop(0.5, 'rgba(0,0,0,0.55)');
    botGrad.addColorStop(1,   'rgba(0,0,0,0.88)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    // ── Barra de progreso tipo Instagram (top) ──
    this._drawStoryProgress(ctx, photoIdx, localFrame, totalFrames, n, w, h, alpha);

    // ── Marca SALMA (top-left bajo la barra) ──
    const labelFade = this._lerpEased(localFrame, 6, 18, 0, 1);
    ctx.globalAlpha = alpha * labelFade * 0.75;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('SALMA', 20, h * 0.075);
    ctx.font = '10px monospace';
    ctx.globalAlpha = alpha * labelFade * 0.5;
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    ctx.fillText(fecha, 20, h * 0.075 + 14);
    ctx.shadowBlur = 0;

    // ── Contenido inferior según posición ──
    ctx.textAlign = 'center';
    const textFade = this._lerpEased(localFrame, 10, 24, 0, 1);
    ctx.globalAlpha = alpha * textFade;

    if (photoIdx === 0) {
      // Primera foto — título grande
      this._drawHistoriaTitulo(ctx, w, h);
    } else if (photoIdx === n - 1 && this._params.highlight) {
      // Última foto — highlight
      this._drawHistoriaHighlight(ctx, w, h, localFrame, totalFrames);
    } else {
      // Fotos del medio — contador limpio
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText(`${photoIdx + 1} / ${n}`, w / 2, h - 24);
    }

    // ── Branding final en última foto ──
    if (photoIdx === n - 1) {
      const brandFade = this._lerpEased(localFrame, totalFrames - 30, totalFrames - 8, 0, 1);
      ctx.globalAlpha = alpha * brandFade;
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 6;
      ctx.fillText('borradodelmapa.com', w / 2, h - 22);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
  },

  _drawStoryProgress(ctx, photoIdx, localFrame, totalFrames, n, w, h, alpha) {
    ctx.save();
    const barH    = 2.5;
    const barY    = h * 0.045;
    const gap     = 4;
    const totalW  = w - 32;
    const segW    = (totalW - gap * (n - 1)) / n;
    const startX  = 16;

    for (let i = 0; i < n; i++) {
      const x = startX + i * (segW + gap);

      if (i < photoIdx) {
        // Completado
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, barY, segW, barH, 2) : ctx.rect(x, barY, segW, barH);
        ctx.fill();
      } else if (i === photoIdx) {
        // Activo: fondo dim + relleno progresivo
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, barY, segW, barH, 2) : ctx.rect(x, barY, segW, barH);
        ctx.fill();

        const fill = (localFrame / totalFrames) * segW;
        ctx.globalAlpha = alpha * 0.95;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, barY, fill, barH, 2) : ctx.rect(x, barY, fill, barH);
        ctx.fill();
      } else {
        // Pendiente
        ctx.globalAlpha = alpha * 0.25;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, barY, segW, barH, 2) : ctx.rect(x, barY, segW, barH);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  _drawHistoriaTitulo(ctx, w, h) {
    const titulo = this._params.titulo || 'Mi viaje';
    ctx.font = 'bold 32px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;

    const lines  = this._wrapText(ctx, titulo, w * 0.78);
    const lineH  = 40;
    const startY = h * 0.82 - ((lines.length - 1) * lineH) / 2;

    ctx.fillStyle = '#ffffff';
    lines.forEach((line, i) => ctx.fillText(line, w / 2, startY + i * lineH));

    // Línea decorativa bajo el título
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(w / 2 - 24, startY + lines.length * lineH - 2, 48, 1.5);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  },

  _drawHistoriaHighlight(ctx, w, h, localFrame, totalFrames) {
    const highlight = this._params.highlight;
    if (!highlight) return;

    // Comilla de apertura
    ctx.globalAlpha = 0.4;
    ctx.font = 'bold 48px serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('"', w * 0.1, h * 0.78);
    ctx.textAlign = 'center';

    // Texto de highlight
    ctx.globalAlpha = 1;
    ctx.font = 'italic 20px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    const lines  = this._wrapText(ctx, highlight, w * 0.72);
    const lineH  = 28;
    const startY = h * 0.82 - ((lines.length - 1) * lineH) / 2;
    lines.forEach((line, i) => ctx.fillText(line, w / 2, startY + i * lineH));
    ctx.shadowBlur = 0;
  },

  // ═══ DESCARGAR COMO WEBM ═══
  async download() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width  = 1080;
    exportCanvas.height = 1920;
    const exportCtx = exportCanvas.getContext('2d');

    if (typeof MediaRecorder === 'undefined') {
      if (typeof showToast === 'function') showToast('Tu navegador no soporta la descarga de video');
      return;
    }

    const stream    = exportCanvas.captureStream(this._fps);
    let mimeType    = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6000000 });
    const chunks   = [];
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    const done = new Promise(resolve => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        const name = (this._params.titulo || 'mi-viaje')
          .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, '')
          .replace(/\s+/g, '_');
        a.download = name + '.webm';
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      };
    });

    if (typeof showToast === 'function') showToast('Generando video… puede tardar unos segundos');
    recorder.start();

    // Renderizar a resolución 2x usando canvas de exportación
    const origCanvas = this._canvas;
    const origCtx    = this._ctx;

    this._canvas        = exportCanvas;
    this._ctx           = exportCtx;
    this._canvas.width  = 1080;
    this._canvas.height = 1920;

    for (let f = 0; f < this._totalFrames; f++) {
      this._renderFrame(f);
      await new Promise(r => setTimeout(r, 1000 / this._fps));
    }

    this._canvas = origCanvas;
    this._ctx    = origCtx;

    recorder.stop();
    await done;
    if (typeof showToast === 'function') showToast('Video descargado ✓');
  },

  // ═══ COMPARTIR ═══
  async share() {
    if (navigator.share && navigator.canShare) {
      try {
        if (typeof showToast === 'function') showToast('Preparando para compartir…');
        await this.download();
      } catch (e) {
        this.download();
      }
    } else {
      this.download();
    }
  }
};

window.videoPlayer = videoPlayer;
