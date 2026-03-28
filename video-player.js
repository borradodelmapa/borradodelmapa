/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — video-player.js
   Motor de video slideshow animado
   Canvas + requestAnimationFrame + Ken Burns
   ═══════════════════════════════════════════ */

const videoPlayer = {
  _canvas: null,
  _ctx: null,
  _container: null,
  _photos: [],       // Array de Image objects cargados
  _params: {},       // {titulo, highlight, tipo}
  _frame: 0,
  _totalFrames: 600, // 20s a 30fps
  _fps: 30,
  _playing: false,
  _raf: null,
  _progressFill: null,

  // ═══ COLORES ═══
  BG: '#050505',
  GOLD: '#d4a017',
  CREAM: '#f5f0e8',
  FONT_TITLE: 'bold 28px sans-serif',
  FONT_SUB: '14px monospace',
  FONT_HIGHLIGHT: 'italic 18px sans-serif',
  FONT_BRAND: 'bold 12px monospace',

  // ═══ INICIALIZACIÓN ═══
  async init(container, photoUrls, params) {
    this._container = container;
    this._params = params || {};
    this._frame = 0;
    this._playing = false;
    this._photos = [];

    // Crear canvas
    this._canvas = document.createElement('canvas');
    this._canvas.className = 'video-canvas';
    this._canvas.width = 540;
    this._canvas.height = 960;
    this._ctx = this._canvas.getContext('2d');

    // Cargar imágenes
    const loaded = await Promise.all(photoUrls.map(url => this._loadImage(url)));
    this._photos = loaded.filter(Boolean);

    // Ajustar frames según número de fotos
    if (this._photos.length === 0) return false;
    const photoFrames = Math.max(this._photos.length * 90, 300);
    this._totalFrames = 90 + photoFrames + 120; // titulo + fotos + cierre

    // Renderizar primer frame
    this._renderFrame(0);
    return true;
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
    if (elapsed >= 1000 / this._fps) {
      this._lastTime = now - (elapsed % (1000 / this._fps));
      this._frame++;
      if (this._frame >= this._totalFrames) {
        this._playing = false;
        this._frame = this._totalFrames - 1;
        this._renderFrame(this._frame);
        this._updateProgress();
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

  // ═══ INTERPOLACIÓN ═══
  _lerp(frame, fromFrame, toFrame, fromVal, toVal) {
    if (frame <= fromFrame) return fromVal;
    if (frame >= toFrame) return toVal;
    const t = (frame - fromFrame) / (toFrame - fromFrame);
    return fromVal + t * (toVal - fromVal);
  },

  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  // ═══ RENDERIZADO DE FRAMES ═══
  _renderFrame(frame) {
    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;

    // Fondo negro
    ctx.fillStyle = this.BG;
    ctx.fillRect(0, 0, w, h);

    // Determinar escena
    const titleEnd = 90;
    const photoFramesPerImage = Math.floor((this._totalFrames - 90 - 120) / Math.max(this._photos.length, 1));
    const photosEnd = titleEnd + (this._photos.length * photoFramesPerImage);

    if (frame < titleEnd) {
      this._drawTitleScene(frame, w, h);
    } else if (frame < photosEnd) {
      const photoFrame = frame - titleEnd;
      const photoIdx = Math.min(Math.floor(photoFrame / photoFramesPerImage), this._photos.length - 1);
      const localFrame = photoFrame % photoFramesPerImage;
      this._drawPhotoScene(photoIdx, localFrame, photoFramesPerImage, w, h);
    } else {
      this._drawCloseScene(frame - photosEnd, this._totalFrames - photosEnd, w, h);
    }
  },

  // ═══ ESCENA: TÍTULO ═══
  _drawTitleScene(frame, w, h) {
    const ctx = this._ctx;
    const opacity = this._lerp(frame, 0, 30, 0, 1);

    ctx.globalAlpha = opacity;

    // Línea dorada decorativa
    const lineW = this._lerp(frame, 10, 50, 0, 120);
    ctx.fillStyle = this.GOLD;
    ctx.fillRect((w - lineW) / 2, h * 0.35, lineW, 2);

    // Título
    ctx.fillStyle = this.CREAM;
    ctx.font = this.FONT_TITLE;
    ctx.textAlign = 'center';
    const titulo = this._params.titulo || 'Mi viaje';
    // Word wrap
    const words = titulo.split(' ');
    let lines = [];
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > w * 0.8) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const lineHeight = 36;
    const startY = h * 0.42 - (lines.length - 1) * lineHeight / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight);
    });

    // Fecha
    ctx.font = this.FONT_SUB;
    ctx.fillStyle = this.GOLD;
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    ctx.fillText(fecha, w / 2, startY + lines.length * lineHeight + 20);

    // Línea dorada inferior
    ctx.fillStyle = this.GOLD;
    ctx.fillRect((w - lineW) / 2, startY + lines.length * lineHeight + 40, lineW, 2);

    ctx.globalAlpha = 1;
  },

  // ═══ ESCENA: FOTOS (Ken Burns) ═══
  _drawPhotoScene(photoIdx, localFrame, totalFrames, w, h) {
    const ctx = this._ctx;
    const photo = this._photos[photoIdx];
    if (!photo) return;

    // Ken Burns: zoom lento + pan
    const progress = localFrame / totalFrames;
    const zoom = 1.0 + 0.15 * progress;
    const panX = (photoIdx % 2 === 0 ? 1 : -1) * 20 * progress;
    const panY = (photoIdx % 3 === 0 ? -1 : 1) * 10 * progress;

    // Fade in (primeros 15 frames)
    const fadeIn = this._lerp(localFrame, 0, 15, 0, 1);
    // Fade out (últimos 15 frames)
    const fadeOut = this._lerp(localFrame, totalFrames - 15, totalFrames, 1, 0);
    ctx.globalAlpha = Math.min(fadeIn, fadeOut);

    // Dibujar foto con Ken Burns
    ctx.save();
    ctx.translate(w / 2 + panX, h / 2 + panY);
    ctx.scale(zoom, zoom);

    // Calcular dimensiones para cover
    const imgRatio = photo.width / photo.height;
    const canvasRatio = w / h;
    let dw, dh;
    if (imgRatio > canvasRatio) {
      dh = h;
      dw = h * imgRatio;
    } else {
      dw = w;
      dh = w / imgRatio;
    }

    ctx.drawImage(photo, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
    ctx.globalAlpha = 1;

    // Contador de foto (esquina inferior)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(w - 60, h - 36, 52, 24);
    ctx.fillStyle = this.CREAM;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${photoIdx + 1}/${this._photos.length}`, w - 34, h - 19);
    ctx.textAlign = 'center';
  },

  // ═══ ESCENA: CIERRE ═══
  _drawCloseScene(localFrame, totalFrames, w, h) {
    const ctx = this._ctx;
    const opacity = this._lerp(localFrame, 0, 30, 0, 1);
    ctx.globalAlpha = opacity;

    // Highlight (frase del día)
    if (this._params.highlight) {
      ctx.font = this.FONT_HIGHLIGHT;
      ctx.fillStyle = this.CREAM;
      ctx.textAlign = 'center';
      // Word wrap highlight
      const words = this._params.highlight.split(' ');
      let lines = [];
      let current = '';
      for (const word of words) {
        const test = current ? current + ' ' + word : word;
        if (ctx.measureText(test).width > w * 0.8) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      lines.forEach((line, i) => {
        ctx.fillText(line, w / 2, h * 0.4 + i * 26);
      });
    }

    // Línea dorada
    const lineW = this._lerp(localFrame, 15, 50, 0, 80);
    ctx.fillStyle = this.GOLD;
    ctx.fillRect((w - lineW) / 2, h * 0.55, lineW, 2);

    // Branding
    const brandOpacity = this._lerp(localFrame, 40, 70, 0, 1);
    ctx.globalAlpha = brandOpacity;
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = this.GOLD;
    ctx.textAlign = 'center';
    ctx.fillText('SALMA', w / 2, h * 0.62);
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(245,240,232,0.5)';
    ctx.fillText('borradodelmapa.com', w / 2, h * 0.66);

    ctx.globalAlpha = 1;
  },

  // ═══ DESCARGAR COMO WEBM ═══
  async download() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1080;
    exportCanvas.height = 1920;
    const exportCtx = exportCanvas.getContext('2d');

    // Comprobar soporte MediaRecorder
    if (typeof MediaRecorder === 'undefined') {
      if (typeof showToast === 'function') showToast('Tu navegador no soporta la descarga de video');
      return;
    }

    const stream = exportCanvas.captureStream(this._fps);
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    const chunks = [];

    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    const done = new Promise(resolve => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (this._params.titulo || 'mi-viaje').replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s-]/g, '').replace(/\s+/g, '_') + '.webm';
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      };
    });

    if (typeof showToast === 'function') showToast('Generando video...');
    recorder.start();

    // Escalar y renderizar cada frame en el canvas de exportación
    const origCanvas = this._canvas;
    const origCtx = this._ctx;
    const origW = this._canvas.width;
    const origH = this._canvas.height;

    // Temporalmente usar el canvas de exportación
    this._canvas = exportCanvas;
    this._ctx = exportCtx;
    this._canvas.width = 1080;
    this._canvas.height = 1920;

    for (let f = 0; f < this._totalFrames; f++) {
      this._renderFrame(f);
      await new Promise(r => setTimeout(r, 1000 / this._fps));
    }

    // Restaurar canvas original
    this._canvas = origCanvas;
    this._ctx = origCtx;

    recorder.stop();
    await done;
    if (typeof showToast === 'function') showToast('Video descargado');
  },

  // ═══ COMPARTIR ═══
  async share() {
    if (navigator.share && navigator.canShare) {
      try {
        // Generar blob rápido (resolución reducida para compartir)
        if (typeof showToast === 'function') showToast('Preparando para compartir...');
        await this.download(); // Por ahora descarga; Web Share con archivos requiere blob previo
      } catch (e) {
        this.download();
      }
    } else {
      this.download();
    }
  }
};

window.videoPlayer = videoPlayer;
