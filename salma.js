/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — salma.js
   Motor de conversación ÚNICO
   ═══════════════════════════════════════════ */

const SALMA_WELCOME_MESSAGES = [
  "Cuéntame a dónde quieres ir. Te armo la ruta día a día con nombres de carreteras, kilómetros y alternativas si algo falla. Busco vuelos, hoteles con disponibilidad real, dónde comer y qué ver — con historia y contexto, no solo listas. Y cuando estés en ruta, voy contigo.",
  "Dime un destino y te doy una ruta completa: camino, alojamiento, vuelos, presupuesto desglosado y un plan B para cuando llueve. Sin paja — solo lo que necesitas para salir por la puerta.",
  "Puedo planear el viaje entero: la ruta con mapa y días reales, vuelos con precios actuales, hoteles con disponibilidad, qué comer, qué ver, cuánto llevar y qué documentos no olvidar. ¿Por dónde empezamos?",
  "He cruzado Vietnam en moto, buscado auroras en Islandia y perdido el tren en Roma. Cuéntame el viaje que tienes en la cabeza — rutas, vuelos, hoteles, cultura, presupuesto — y lo montamos juntos."
];

const SALMA_WELCOME_RETURNING = "¿Tienes ya un viaje guardado? Puedo acompañarte en tiempo real cuando salgas — te cuento qué hay cerca, qué no te puedes perder y cómo llegar. Si todavía estás planeando, dime destino y empezamos.";

const salma = {
  history: [],
  currentRoute: null,
  currentRouteId: null,
  _streaming: false,
  _rateTimes: [],
  _userLocation: null,
  _geoBlocked: false,
  _pendingRouteInfo: null,  // Info parcial mientras esperamos fechas
  _pendingPhoto: null,      // {blob, base64, localUrl} mientras compone mensaje con foto
  _narratorActive: false,
  _narratorNotified: new Set(),
  _narratorLastCheck: 0,
  _narratorInterval: null,
  _voices: [],

  // ═══ VOZ DE SALMA — Web Speech API ═══
  initVoices() {
    if (!window.speechSynthesis) return;
    this._voices = speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => { this._voices = speechSynthesis.getVoices(); };
  },

  salmaSpeak(text) {
    try {
      if (!window.speechSynthesis) return;
      if (localStorage.getItem('salma_voice') !== 'true') return;
      if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
      // Limpiar texto: quitar markdown, emojis, URLs, guiones de lista
      const clean = text
        .replace(/#{1,6}\s?/g, '')
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
        .replace(/^[\s]*[-•]\s*/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;
      const utt = new SpeechSynthesisUtterance(clean);
      const esVoice = this._voices.find(v => v.lang.startsWith('es'));
      utt.voice = esVoice || this._voices[0] || null;
      utt.lang = esVoice ? esVoice.lang : 'es-ES';
      utt.rate = 1.0;
      utt.pitch = 1.05;
      speechSynthesis.speak(utt);
    } catch (e) { console.warn('[Salma] Error voz:', e); }
  },

  salmaSpeakStop() {
    if (window.speechSynthesis) speechSynthesis.cancel();
  },

  // Pedir geolocalización al usuario (se llama una vez, se actualiza continuamente)
  initGeolocation() {
    if (!navigator.geolocation) return;
    // watchPosition actualiza conforme el GPS mejora la precisión
    // Primero puede dar torre de celda, luego corrige con GPS real
    this._geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        this._userLocation = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
          accuracy: Math.round(pos.coords.accuracy)
        };
        console.log('[Salma] Ubicación:', this._userLocation.lat, this._userLocation.lng, '±' + this._userLocation.accuracy + 'm');
        // Activar copiloto cuando tenemos ubicación
        if (!this._copilotCountry) this.initCopilot();
        // Si ya tenemos buena precisión (<500m), dejar de monitorizar para ahorrar batería
        // PERO si el narrador está activo, mantener GPS continuo
        if (pos.coords.accuracy < 500 && this._geoWatchId && !this._narratorActive) {
          navigator.geolocation.clearWatch(this._geoWatchId);
          this._geoWatchId = null;
        }
      },
      (err) => {
        console.log('[Salma] Ubicación no disponible:', err.code);
        if (err.code === 1) { // PERMISSION_DENIED
          this._geoBlocked = true;
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  },

  // ═══ DETECCIÓN DE INFO DE RUTA ═══
  _detectRouteInfo(msg) {
    const lower = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ¿Es petición de ruta? (destino + días)
    const daysMatch = lower.match(/(\d+)\s*d[ií]as?/);
    const days = daysMatch ? parseInt(daysMatch[1]) : null;
    // Excluir preguntas informativas ("qué sabes de", "háblame de", "cuéntame", "info sobre")
    const isInfoQuestion = /\b(qu[eé]\s+sabes|h[aá]blame|cu[eé]ntame|info\s+sobre|informaci[oó]n|c[oó]mo\s+es|qu[eé]\s+es|qu[eé]\s+tal)\b/i.test(msg);
    const isRoute = !isInfoQuestion && (!!days || /\b(hazme|cr[eé]ame|planifica|monta|genera)\s+(una\s+)?ruta\b|\bruta\s+de\s+\d|\bruta\s+por\b|itinerario|escapada|roadtrip|road trip/i.test(msg));
    if (!isRoute) return { isRoute: false };

    // Fechas explícitas
    const datePatterns = [
      /del\s+(\d{1,2})\s+(al|a)\s+(\d{1,2})\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
      /(\d{1,2})\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /semana\s*santa/i,
      /navidad|nochevieja|fin\s+de\s+a[nñ]o|nochebuena/i,
      /puente\s+de/i,
      /este\s+finde|este\s+fin\s+de\s+semana/i,
      /la\s+semana\s+que\s+viene|proxima\s+semana|pr[oó]xima\s+semana/i,
      /en\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
    ];
    let dates = null;
    for (const pat of datePatterns) {
      const m = msg.match(pat);
      if (m) { dates = m[0]; break; }
    }

    // Transporte
    const transportMatch = msg.match(/\b(en\s+coche|roadtrip|road\s*trip|sin\s+coche|en\s+tren|en\s+moto|en\s+bici|en\s+autobus|en\s+bus|en\s+camper|en\s+furgo|a\s+pie|andando|en\s+avion|mochilero)\b/i);
    const transport = transportMatch ? transportMatch[1].trim() : null;

    // Niños
    const kids = /con\s+ni[nñ]os|con\s+peques|en\s+familia|con\s+hijos|with\s+kids|family/i.test(msg);

    // Completo = tiene fechas (lo principal que queremos preguntar)
    const complete = !!dates;

    return { isRoute: true, days, dates, transport, kids, complete };
  },

  _buildDateQuestion(info) {
    const parts = [];
    // Siempre preguntar fechas (es lo principal)
    parts.push('Si me dices las fechas, busco qué eventos, fiestas o expos hay esos días');
    if (!info.transport) {
      parts.push('¿Vas en coche, en tren, o cómo te mueves?');
    }
    if (!info.kids) {
      parts.push('¿Viajas con niños? Así ajusto el ritmo');
    }

    let question = '¡Me pongo con ello!\n\nAntes de montar la ruta:\n';
    question += parts.map(p => '- ' + p).join('\n');
    question += '\n\nSi no quieres complicarte, dale al botón y te la monto ya.';
    return question;
  },

  _addSkipButton() {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'skip-dates-wrap';
    div.id = 'salma-skip-dates';
    div.innerHTML = '<button class="skip-dates-btn" onclick="salma._skipDateQuestion()">Generar ruta ya →</button>';
    area.appendChild(div);
    this._scrollToBottom();
  },

  _skipDateQuestion() {
    // Quitar botón
    const btn = document.getElementById('salma-skip-dates');
    if (btn) btn.remove();

    if (!this._pendingRouteInfo) return;
    const originalMsg = this._pendingRouteInfo._originalMsg;
    this._pendingRouteInfo = null;

    // Enviar al worker sin fechas
    this._addUserBubble('Hazla ya');
    // NO push a history aquí — _doSend lo hace tras recibir respuesta
    this._doSend(originalMsg, {});
  },

  _resolveDates(dateStr, days) {
    if (!dateStr) return null;
    const lower = dateStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const now = new Date();
    const year = now.getFullYear();
    const numDays = days || 3;

    const monthNames = { enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11 };

    // "del 15 al 17 de abril"
    const rangeMatch = dateStr.match(/del\s+(\d{1,2})\s+(?:al|a)\s+(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
    if (rangeMatch) {
      const m = monthNames[rangeMatch[3].toLowerCase()];
      const from = new Date(year, m, parseInt(rangeMatch[1]));
      const to = new Date(year, m, parseInt(rangeMatch[2]));
      if (from < now) { from.setFullYear(year + 1); to.setFullYear(year + 1); }
      return { from: this._fmtDate(from), to: this._fmtDate(to) };
    }

    // "15 de abril"
    const singleMatch = dateStr.match(/(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
    if (singleMatch) {
      const m = monthNames[singleMatch[2].toLowerCase()];
      const from = new Date(year, m, parseInt(singleMatch[1]));
      if (from < now) from.setFullYear(year + 1);
      const to = new Date(from); to.setDate(to.getDate() + numDays - 1);
      return { from: this._fmtDate(from), to: this._fmtDate(to) };
    }

    // "en abril"
    const monthMatch = lower.match(/en\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
    if (monthMatch) {
      const m = monthNames[monthMatch[1]];
      const from = new Date(year, m, 1);
      if (from < now) from.setFullYear(year + 1);
      const to = new Date(from); to.setDate(to.getDate() + numDays - 1);
      return { from: this._fmtDate(from), to: this._fmtDate(to) };
    }

    // "este finde"
    if (/este\s+finde|este\s+fin\s+de\s+semana/.test(lower)) {
      const sat = new Date(now);
      sat.setDate(sat.getDate() + (6 - sat.getDay()));
      const sun = new Date(sat); sun.setDate(sun.getDate() + 1);
      return { from: this._fmtDate(sat), to: this._fmtDate(sun) };
    }

    // "la semana que viene"
    if (/semana\s+que\s+viene|proxima\s+semana/.test(lower)) {
      const mon = new Date(now);
      mon.setDate(mon.getDate() + (8 - mon.getDay()) % 7);
      const to = new Date(mon); to.setDate(to.getDate() + numDays - 1);
      return { from: this._fmtDate(mon), to: this._fmtDate(to) };
    }

    // "semana santa" — aproximación
    if (/semana\s*santa/.test(lower)) {
      // Semana Santa 2026 = 29 marzo - 5 abril
      // Semana Santa 2027 = 18 abril - 25 abril
      const ss2026 = new Date(2026, 2, 29);
      const ss2027 = new Date(2027, 3, 18);
      const ss = now < ss2026 ? ss2026 : ss2027;
      const to = new Date(ss); to.setDate(to.getDate() + 7);
      return { from: this._fmtDate(ss), to: this._fmtDate(to) };
    }

    // Fallback: próximas 2 semanas
    return { from: this._fmtDate(now), to: this._fmtDate(new Date(now.getTime() + numDays * 86400000)) };
  },

  _fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  // ═══ CÁMARA EN EL CHAT ═══

  _initCameraBtn() {
    const camBtn = document.getElementById('cam-btn');
    const photoInput = document.getElementById('chat-photo-input');
    const cameraInput = document.getElementById('chat-camera-input');
    const camMenu = document.getElementById('cam-menu');
    const cancelBtn = document.getElementById('chat-photo-cancel');
    if (!camBtn || !photoInput) return;

    camBtn.addEventListener('click', (e) => {
      if (this._streaming) return;
      e.stopPropagation();
      if (camMenu) camMenu.style.display = camMenu.style.display === 'none' ? '' : 'none';
    });

    // Opción: Hacer foto
    document.getElementById('cam-menu-foto')?.addEventListener('click', () => {
      if (camMenu) camMenu.style.display = 'none';
      if (cameraInput) cameraInput.click();
    });
    // Opción: Galería
    document.getElementById('cam-menu-galeria')?.addEventListener('click', () => {
      if (camMenu) camMenu.style.display = 'none';
      photoInput.click();
    });

    const handleFile = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (file) this._handlePhotoSelected(file);
    };
    photoInput.addEventListener('change', handleFile);
    if (cameraInput) cameraInput.addEventListener('change', handleFile);

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this._clearPendingPhoto());
    }

    // Cerrar menú al tocar fuera
    document.addEventListener('click', () => {
      if (camMenu) camMenu.style.display = 'none';
      const wMenu = document.getElementById('welcome-cam-menu');
      if (wMenu) wMenu.style.display = 'none';
    });
  },

  async _handlePhotoSelected(file) {
    if (!file.type.startsWith('image/')) {
      if (typeof showToast === 'function') showToast('Solo se permiten imágenes');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      if (typeof showToast === 'function') showToast('Imagen demasiado grande (máx 10MB)');
      return;
    }

    try {
      // Comprimir
      const blob = await this._compressImage(file, 1024, 0.8);
      // Base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      // Preview local
      const localUrl = URL.createObjectURL(blob);

      this._pendingPhoto = { blob, base64, localUrl };

      // Mostrar preview
      const preview = document.getElementById('chat-photo-preview');
      const thumb = document.getElementById('chat-photo-thumb');
      if (preview && thumb) {
        thumb.src = localUrl;
        preview.style.display = '';
      }
    } catch (e) {
      console.error('[Salma] Error procesando foto:', e);
      if (typeof showToast === 'function') showToast('Error al procesar la foto');
    }
  },

  _clearPendingPhoto() {
    if (this._pendingPhoto?.localUrl) {
      URL.revokeObjectURL(this._pendingPhoto.localUrl);
    }
    this._pendingPhoto = null;
    const preview = document.getElementById('chat-photo-preview');
    if (preview) preview.style.display = 'none';
  },

  _compressImage(file, maxWidth, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  async _savePhotoToGallery(photoUrl, photoKey, photoTag, photoCaption) {
    if (!window.currentUser) return;
    const uid = currentUser.uid;
    const now = new Date().toISOString();
    // 1. Guardar en colección central de fotos (SIEMPRE, haya o no viaje)
    try {
      await db.collection('users').doc(uid).collection('fotos').add({
        key: photoKey, url: photoUrl,
        tag: photoTag || 'otro', caption: photoCaption || '',
        albumId: null, routeId: this.currentRouteId || null,
        createdAt: now
      });
    } catch (e) {
      console.warn('[Salma] Galería no disponible (reglas Firestore):', e.message);
    }

    // 2. Compatibilidad: guardar también en maps/{docId}.photos si hay viaje activo
    if (this.currentRouteId) {
      try {
        await db.collection('users').doc(uid)
          .collection('maps').doc(this.currentRouteId).update({
            photos: firebase.firestore.FieldValue.arrayUnion({
              key: photoKey, url: photoUrl, source: 'chat',
              tag: photoTag || 'otro', caption: photoCaption || '',
              uploadedAt: now
            })
          });
      } catch (e) {
        console.warn('[Salma] Error guardando en bitácora:', e.message);
      }
    }
  },

  // ═══ VIDEO PLAYER INLINE ═══
  async _renderVideoPlayer(params) {
    if (!window.currentUser) return;
    const area = this._getChatArea();
    if (!area) return;

    // Leer fotos de la galería (excluir documentos y carteles)
    let photoUrls = [];
    try {
      const fotosSnap = await db.collection('users').doc(currentUser.uid)
        .collection('fotos').orderBy('createdAt', 'desc').limit(20).get();
      fotosSnap.forEach(d => {
        const f = d.data();
        if (f.tag !== 'documento' && f.tag !== 'cartel' && f.url) photoUrls.push(f.url);
      });
    } catch (_) {}

    // Fallback: fotos de las rutas
    if (photoUrls.length === 0) {
      try {
        const mapsSnap = await db.collection('users').doc(currentUser.uid).collection('maps').get();
        mapsSnap.forEach(doc => {
          const data = doc.data();
          if (data.photos && Array.isArray(data.photos)) {
            data.photos.forEach(p => {
              if (p.url && p.tag !== 'documento' && p.tag !== 'cartel') photoUrls.push(p.url);
            });
          }
        });
      } catch (_) {}
    }

    if (photoUrls.length === 0) {
      this._addSalmaBubble('No tienes fotos todavía. Envíame fotos desde el chat y te monto el video con ellas.');
      return;
    }

    // Crear contenedor del player
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-salma';
    wrap.innerHTML = `
      <div class="video-player-wrap">
        <div class="video-canvas-wrap" id="video-canvas-container"></div>
        <div class="video-controls">
          <button class="video-btn" id="video-play-btn">▶ Play</button>
          <div class="video-progress"><div class="video-progress-fill" id="video-progress-fill"></div></div>
          <button class="video-btn" id="video-download-btn">⬇</button>
          <button class="video-btn" id="video-share-btn">↗</button>
        </div>
      </div>`;
    area.appendChild(wrap);

    // Inicializar video player
    const container = document.getElementById('video-canvas-container');
    const ok = await videoPlayer.init(container, photoUrls.slice(0, 10), params);
    if (!ok) {
      wrap.remove();
      this._addSalmaBubble('No se pudieron cargar las fotos para el video. Inténtalo de nuevo.');
      return;
    }
    container.appendChild(videoPlayer._canvas);
    videoPlayer._progressFill = document.getElementById('video-progress-fill');

    // Event listeners
    const playBtn = document.getElementById('video-play-btn');
    playBtn.addEventListener('click', () => {
      if (videoPlayer._playing) {
        videoPlayer.pause();
        playBtn.textContent = '▶ Play';
      } else {
        videoPlayer.play();
        playBtn.textContent = '⏸ Pausa';
      }
    });

    document.getElementById('video-download-btn').addEventListener('click', () => videoPlayer.download());
    document.getElementById('video-share-btn').addEventListener('click', () => videoPlayer.share());

    // Barra de progreso clicable
    document.querySelector('.video-progress').addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      videoPlayer._frame = Math.floor(pct * videoPlayer._totalFrames);
      videoPlayer._renderFrame(videoPlayer._frame);
      videoPlayer._updateProgress();
    });

    // Auto-save video JSON en Firestore
    if (this.currentRouteId) {
      try {
        await db.collection('users').doc(currentUser.uid)
          .collection('maps').doc(this.currentRouteId).update({
            videos: firebase.firestore.FieldValue.arrayUnion({
              titulo: params.titulo,
              highlight: params.highlight,
              tipo: params.tipo,
              photoUrls: photoUrls.slice(0, 10),
              createdAt: new Date().toISOString()
            })
          });
      } catch (_) {}
    }

    this._scrollToBottom();
  },

  // ═══ PUNTO DE ENTRADA ÚNICO ═══
  async send(msg) {
    // Capturar foto pendiente antes de validar msg
    const photo = this._pendingPhoto;
    if (photo) {
      // Ocultar preview pero NO revocar el blob URL todavía (lo necesita la burbuja)
      this._pendingPhoto = null;
      const preview = document.getElementById('chat-photo-preview');
      if (preview) preview.style.display = 'none';
    }
    if (!msg && !photo) return;
    if (this._streaming) return;
    if (!this._checkRate()) return;

    // Si no tenemos ubicación todavía, reintentar (ahora hay interacción del usuario)
    if (!this._userLocation && !this._geoWatchId && !this._geoBlocked) this.initGeolocation();

    // Transicionar a chat si estamos en welcome
    if (currentState === 'welcome' || currentState === 'viajes') {
      this._initChat();
    }

    // Si el usuario pide activar/desactivar GPS, mostrar botón toggle
    if (msg && /activa.*gps|desactiva.*gps|activa.*ubicaci|desactiva.*ubicaci|pon.*gps|quita.*gps|apaga.*gps|enciende.*gps|activar.*gps|desactivar.*gps|activar.*ubicaci|desactivar.*ubicaci/i.test(msg)) {
      this._addUserBubble(msg);
      this.showGPSToggle();
      return;
    }

    // Si el mensaje requiere ubicación y no la tenemos, mostrar prompt
    if (!this._userLocation && msg) {
      const needsLocation = /desde donde estoy|cerca de m[ií]|por aqu[ií]|aqu[ií] cerca|donde estoy|mi ubicaci[oó]n|nearest|near me/i.test(msg);
      if (needsLocation) {
        this._addUserBubble(msg);
        this._showGeoPrompt();
        return;
      }
    }

    // Burbuja del usuario (con foto si hay)
    this._addUserBubble(msg || '', photo ? photo.localUrl : null);
    // NO push a history aquí — se hace en _doSend tras recibir respuesta

    // Todo va directo al worker — Salma decide si preguntar
    this._doSend(msg || '', { photo });
  },

  // ═══ ENVÍO AL WORKER ═══
  async _doSend(msg, extra) {
    // Guardar para poder reintentar
    this._lastMsg = msg;
    this._lastExtra = extra || {};
    this._currentReader = null;
    this._currentAbort = new AbortController();

    // Si el itinerario está abierto, cerrarlo para mostrar la respuesta en el chat
    const _itinWasOpen = !!(window._itinViewOpen);
    const _itinSavedRoute = window._itinViewRoute || null;
    const _itinSavedDocId = window._itinViewDocId || null;
    const _itinSavedOptions = window._itinViewOptions || null;
    if (_itinWasOpen) {
      const _view = document.getElementById('itin-view');
      const _appContent = document.getElementById('app-content');
      const _inputBar = document.getElementById('app-input-bar');
      window._itinViewOpen = false;
      if (_view) _view.style.display = 'none';
      if (_appContent) _appContent.style.display = '';
      if (_inputBar) _inputBar.style.display = '';
      if (typeof mapaRuta !== 'undefined') mapaRuta.destroy();
      if (typeof mapaItinerario !== 'undefined') mapaItinerario.destroy();
    }

    this._streaming = true;
    $send.disabled = true;
    const camBtn = document.getElementById('cam-btn');
    if (camBtn) camBtn.disabled = true;
    const loadingEl = this._addLoading();

    try {
      const body = {
        message: msg,
        history: this.history.slice(-20),
        stream: true
      };
      if (this.currentRoute) body.current_route = this.currentRoute;
      if (window.currentUser?.country) body.nationality = window.currentUser.country;
      if (window.currentUser?.name) body.user_name = window.currentUser.name;
      if (window.currentUser) {
        body.coins_saldo = window.currentUser.coins_saldo || 0;
        body.rutas_gratis_usadas = window.currentUser.rutas_gratis_usadas || 0;
      }
      if (this._userLocation) body.user_location = this._userLocation;
      // Inyectar notas del país si hay contexto
      if (window.currentUser && typeof detectCountryInMessage === 'function') {
        const msgCountry = detectCountryInMessage(msg) || (this.currentRoute ? normalizeCountry(this.currentRoute.country) : null);
        if (msgCountry && msgCountry.code) {
          try {
            const paisDoc = await db.collection('users').doc(window.currentUser.uid).collection('paises').doc(msgCountry.code).get();
            if (paisDoc.exists) {
              const notas = (paisDoc.data().notas || []).slice(-10);
              if (notas.length) body.country_notes = notas.map(n => ({ texto: n.texto, tipo: n.tipo }));
            }
          } catch (_) {}
        }
      }
      // Inyectar notas del nuevo sistema (recordatorios y generales)
      if (window.currentUser && typeof notasManager !== 'undefined') {
        try {
          const userNotas = await notasManager.getAll({ limit: 10 });
          if (userNotas.length) body.user_notes = userNotas.map(n => ({ texto: n.texto, tipo: n.tipo, fecha: n.fechaRecordatorio }));
        } catch (_) {}
      }
      // Datos extra de detección
      if (extra.travel_dates) body.travel_dates = extra.travel_dates;
      if (extra.transport) body.transport = extra.transport;
      if (extra.with_kids) body.with_kids = extra.with_kids;
      // Foto del chat
      if (extra.photo) {
        body.image_base64 = extra.photo.base64;
        if (window.currentUser?.uid) body.uid = window.currentUser.uid;
      }

      const data = await this._stream(body, loadingEl);

      // Guardar mensaje del usuario + respuesta en historial (juntos, tras éxito)
      this.history.push({ role: 'user', content: msg });
      if (data.reply) {
        this.history.push({ role: 'assistant', content: data.reply });
      }

      // Si hay ruta, renderizar guide-card
      if (data.route && data.route.stops) {
        const isEdit = this.currentRouteId && this.currentRoute;
        const prevStopsCount = this.currentRoute?.stops?.length || 0;
        this.currentRoute = data.route;
        if (!data._hadDraft || data._isBlocks) {
          // Ruta nueva o ruta de bloques: abrir vista itinerario
          this._removeLoading();
          try {
            if (typeof window.openItinerarioView === 'function') {
              window.openItinerarioView(data.route, null, { fromChat: true });
            } else {
              guideRenderer.render(data.route, {});
            }
          } catch (renderErr) {
            console.error('Error renderizando guía:', renderErr);
          }
        } else {
          // Ruta normal con draft: parchear con datos verificados (fotos, coords)
          try {
            guideRenderer.updateVerified(data.route);
          } catch (e) {
            console.warn('Error actualizando guía verificada:', e);
          }
        }

        if (isEdit) {
          // Editando ruta guardada — actualizar Firestore
          this._addSalmaBubble('Ruta actualizada. Dime si quieres más cambios.');
          try {
            await db.collection('users').doc(window.currentUser.uid)
              .collection('maps').doc(this.currentRouteId).update({
                itinerarioIA: JSON.stringify(data.route),
                nombre: data.route.title || data.route.name || 'Mi ruta',
                updatedAt: new Date().toISOString()
              });
          } catch (e) { console.warn('Error actualizando guía:', e); }
        } else {
          // Ruta nueva — indicar que hay que pulsar GUARDAR
          this._addSalmaBubble('Dale al botón GUARDAR de abajo para no perderla. Cuando quieras otra ruta, dime destino y días.');
          this.history = [];
        }
      }

      // Si hay video_params, renderizar player inline
      if (data.video_params && typeof videoPlayer !== 'undefined') {
        // Enriquecer params con paradas de la ruta activa (para escena del mapa)
        const enrichedParams = Object.assign({}, data.video_params);
        if (this.currentRoute && this.currentRoute.stops && this.currentRoute.stops.length >= 2) {
          enrichedParams.stops = this.currentRoute.stops
            .filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01)
            .map(s => ({ name: s.name || '', lat: s.lat, lng: s.lng, day: s.day }));
        }
        this._renderVideoPlayer(enrichedParams);
      }

      this._scrollToBottom();

      // Si el usuario escribió desde el itinerario y la respuesta NO abre ruta nueva,
      // añadir botón para volver a la ruta
      if (_itinWasOpen && _itinSavedRoute && !(data.route && data.route.stops)) {
        this._addReturnToRouteButton(_itinSavedRoute, _itinSavedDocId, _itinSavedOptions);
      }

    } catch (e) {
      console.error('Error en salma.send:', e);
      this._removeLoading();
      this._removeStreamBubble();
      const errMsg = (e && e.message) ? e.message : String(e);
      this._addSalmaBubble('Uf, algo ha fallado (' + errMsg + '). Vuelve a intentarlo.');
    } finally {
      this._streaming = false;
      $send.disabled = false;
      const camBtnF = document.getElementById('cam-btn');
      if (camBtnF) camBtnF.disabled = false;
      if (!('ontouchstart' in window)) $input.focus();
    }
  },

  // ═══ SSE STREAMING ═══
  _stream(bodyObj, loadingEl) {
    return new Promise((resolve, reject) => {
      const signal = this._currentAbort ? this._currentAbort.signal : undefined;
      fetch(window.SALMA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
        signal,
      }).then(res => {
        // Si viene JSON normal (error/fallback)
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return res.json().then(data => {
            this._removeLoading();
            if (data.reply) this._addSalmaBubble(data.reply);
            resolve(data);
          });
        }

        // SSE stream
        this._removeLoading();
        const textEl = this._addStreamBubble();
        const reader = res.body.getReader();
        this._currentReader = reader;
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        let resolved = false;
        let textDone = false;
        let draftSent = false;
        let isBlocksRoute = false;

        const processLines = () => {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const evt = JSON.parse(jsonStr);

              // DONE — final
              if (evt.done) {
                this._removeStreamBubble();
                this._removeLoading();
                // Si no hubo texto streamed pero hay reply, mostrarlo
                if (!fullText.trim() && evt.reply) {
                  this._addSalmaBubble(evt.reply);
                }
                // Actualizar foto en burbuja con URL persistente de R2 y revocar blob
                if (evt.photo_url) {
                  const lastPhoto = document.querySelector('.msg-user:last-of-type .msg-user-photo');
                  if (lastPhoto) {
                    if (lastPhoto.src.startsWith('blob:')) URL.revokeObjectURL(lastPhoto.src);
                    lastPhoto.src = evt.photo_url;
                  }
                  if (evt.photo_key) this._savePhotoToGallery(evt.photo_url, evt.photo_key, evt.photo_tag, evt.photo_caption);
                }
                // Renderizar tarjetas de resultados de SALMA_ACTION
                if (evt.action_results && evt.action_results.length > 0) {
                  try { this._renderActionResults(evt.action_results); } catch (_) {}
                }
                // Guardar notas automáticas de SALMA_ACTION:SAVE_NOTE
                if (evt.action_results) {
                  for (const r of evt.action_results) {
                    if (r.type === 'note' && r.texto && window.currentUser) {
                      try {
                        if (typeof notasManager !== 'undefined') {
                          notasManager.create({ texto: r.texto, tipo: r.tipo || 'general', countryCode: r.country_code || null, countryName: r.country_name || null, origen: 'salma', fuente: 'salma_action' });
                        }
                      } catch (_) {}
                    }
                  }
                }
                resolved = true;
                resolve({
                  reply: evt.reply || fullText,
                  route: evt.route || null,
                  video_params: evt.video_params || null,
                  _hadDraft: draftSent,
                  _isBlocks: isBlocksRoute
                });
                return;
              }

              // SAVE_NOTA — guardar nota/recordatorio desde herramienta guardar_nota
              if (evt.save_nota && evt.nota_data) {
                try {
                  if (typeof notasManager !== 'undefined' && window.currentUser) {
                    const nd = evt.nota_data;
                    notasManager.create({
                      texto: nd.texto,
                      tipo: nd.tipo || 'general',
                      fechaRecordatorio: nd.fecha_recordatorio || null,
                      countryCode: nd.country_code || null,
                      countryName: nd.country_name || null,
                      emoji: nd.country_code && typeof countryEmoji === 'function' ? countryEmoji(nd.country_code) : null,
                      origen: 'salma',
                      fuente: 'guardar_nota'
                    });
                  }
                } catch (_) {}
                continue;
              }

              // TOOL_NOTE — auto-guardar nota del país
              if (evt.tool_note && evt.summary && evt.country_hint) {
                try {
                  if (typeof normalizeCountry === 'function' && typeof saveCountryNote === 'function' && window.currentUser) {
                    const c = normalizeCountry(evt.country_hint);
                    if (c.code) {
                      const tipoMap = { buscar_hotel:'hotel', buscar_vuelos:'vuelo', buscar_coche:'transporte', buscar_restaurante:'restaurante', buscar_lugar:'lugar', buscar_web:'nota' };
                      saveCountryNote(c.code, c.name, c.emoji, {
                        id: 'nota_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
                        texto: evt.summary,
                        tipo: tipoMap[evt.tool] || 'nota',
                        origen: 'auto',
                        fuente: evt.tool,
                        fecha: new Date().toISOString()
                      });
                    }
                  }
                } catch (_) {}
                continue;
              }

              // PLAN — bloques paralelos planificados
              if (evt.plan) {
                textDone = true;
                isBlocksRoute = true;
                this._fixStreamBubble();
                this._addLoading(`Montando ${evt.total_blocks || evt.plan.length} partes...`, true);
                continue;
              }

              // DRAFT_BLOCK — bloque parcial generado (sin verificar)
              if (evt.draft_block && evt.route_partial) {
                draftSent = true;
                textDone = true;
                this._fixStreamBubble();
                this._addLoading(`Verificando parte ${evt.draft_block} de ${evt.total_blocks}...`, true);
                // Renderizar bloque parcial progresivamente
                if (evt.route_partial.stops) {
                  if (!this.currentRoute) {
                    this.currentRoute = evt.route_partial;
                    try {
                      guideRenderer.render(evt.route_partial, { partial: true });
                    } catch (e) {}
                  } else {
                    // Añadir paradas al route existente
                    this.currentRoute.stops = [...(this.currentRoute.stops || []), ...evt.route_partial.stops];
                    if (evt.route_partial.maps_links) {
                      this.currentRoute.maps_links = [...(this.currentRoute.maps_links || []), ...evt.route_partial.maps_links];
                    }
                    try {
                      guideRenderer.render(this.currentRoute, { partial: true });
                    } catch (e) {}
                  }
                  // No hacer scroll — el usuario explora mientras carga
                }
                continue;
              }

              // VERIFIED_BLOCK — bloque verificado con Google Places
              if (evt.verified_block && evt.route_partial) {
                this._addLoading(`Parte ${evt.verified_block} de ${evt.total_blocks} lista ✓`, true);
                continue;
              }

              // VERIFIED — actualización background con coords/fotos de Google
              if (evt.verified && evt.route) {
                this.currentRoute = evt.route;
                try {
                  guideRenderer.updateVerified(evt.route);
                } catch (_) {}
                // Actualizar Firestore si ya estaba guardada
                if (this._lastSavedDocId && typeof currentUser !== 'undefined' && currentUser) {
                  try {
                    db.collection('users').doc(currentUser.uid)
                      .collection('maps').doc(this._lastSavedDocId)
                      .update({ itinerarioIA: JSON.stringify(evt.route) }).catch(() => {});
                  } catch (_) {}
                }
                continue;
              }

              // DRAFT — ruta borrador (flujo normal ≤7 días)
              if (evt.draft && !draftSent) {
                draftSent = true;
                textDone = true;
                this._fixStreamBubble();
                this._removeLoading();
                if (evt.route && evt.route.stops) {
                  this.currentRoute = evt.route;
                  try {
                    if (typeof window.openItinerarioView === 'function') {
                      window.openItinerarioView(evt.route, null, { fromChat: true });
                    } else {
                      guideRenderer.render(evt.route);
                    }
                  } catch (renderErr) {
                    console.error('Error renderizando guía draft:', renderErr);
                  }
                }
              }

              // GENERATING — Salma genera JSON
              if (evt.generating && !textDone) {
                textDone = true;
                this._fixStreamBubble();
                this._addLoading();
              }

              // KEEPALIVE — verificando paradas
              if (evt.k && !textDone) {
                textDone = true;
                this._fixStreamBubble();
                this._addLoading();
              }

              // TEXT CHUNK
              if (evt.t) {
                fullText += evt.t;
                if (textEl) {
                  let display = fullText;
                  const markerPos = display.indexOf('SALMA_ROUTE');
                  if (markerPos !== -1) {
                    display = display.substring(0, markerPos);
                  } else {
                    display = display.replace(/[\n.][ ]?SAL[MA_ROUTE]*$/, '');
                  }
                  textEl.innerHTML = formatMessage(display.trim());
                  this._scrollToBottom();
                }
              }
            } catch (e) { /* ignorar JSON mal formado */ }
          }
        };

        const pump = () => {
          reader.read().then(result => {
            if (result.value) {
              buffer += decoder.decode(result.value, { stream: true });
              try { processLines(); } catch (e) { console.warn('processLines error:', e); }
            }
            if (resolved) return;
            if (result.done) {
              if (buffer.trim()) { buffer += '\n'; try { processLines(); } catch (e) {} }
              if (!resolved) {
                this._removeStreamBubble();
                resolve({ reply: fullText, route: null, _hadDraft: draftSent });
              }
              return;
            }
            pump();
          }).catch(err => {
            console.warn('Stream read error:', err);
            this._removeStreamBubble();
            // Si ya tenemos texto, resolver en vez de rechazar
            if (!resolved) {
              if (fullText) {
                resolve({ reply: fullText, route: null, _hadDraft: draftSent });
              } else {
                reject(err);
              }
            }
          });
        };
        pump();

      }).catch(err => {
        console.error('Fetch error:', err);
        reject(err);
      });
    });
  },

  // ═══ CARGAR GUÍA GUARDADA ═══
  async cargarGuia(docId, docData) {
    let routeData = null;
    try {
      if (docData && docData.itinerarioIA) {
        routeData = JSON.parse(docData.itinerarioIA);
        // Refrescar copia offline cada vez que se carga una guía
        if (docId) {
          try {
            const existing = JSON.parse(localStorage.getItem('offline_route_' + docId) || 'null');
            localStorage.setItem('offline_route_' + docId, JSON.stringify({ ...(existing || {}), ...docData, id: docId, _savedAt: (existing?._savedAt) || Date.now() }));
          } catch (_) {}
        }
      } else if (docId && window.currentUser) {
        try {
          const doc = await db.collection('users').doc(window.currentUser.uid)
            .collection('maps').doc(docId).get();
          if (doc.exists) routeData = JSON.parse(doc.data().itinerarioIA);
        } catch (netErr) {
          // Sin red — intentar desde localStorage
          const cached = localStorage.getItem('offline_route_' + docId);
          if (cached) {
            const d = JSON.parse(cached);
            if (d.itinerarioIA) routeData = JSON.parse(d.itinerarioIA);
          }
          if (!routeData) throw netErr;
        }
      }
    } catch (e) {
      console.error('Error parseando guía:', e);
    }

    if (!routeData || !routeData.stops) {
      showToast('No se pudo cargar la guía');
      return;
    }

    this.history = [];
    this.currentRoute = routeData;
    this.currentRouteId = docId;

    this._initChat();
    const title = routeData.title || routeData.name || 'Tu ruta';
    this._addSalmaBubble('Aquí tienes tu guía de ' + title + '. Si quieres cambiar algo, dímelo.');
    showState('chat');

    // Abrir vista itinerario enriquecida
    if (typeof window.openItinerarioView === 'function') {
      window.openItinerarioView(routeData, this.currentRouteId, { saved: true, fromChat: true });
    } else {
      guideRenderer.render(routeData, { saved: true, showGmapsOffer: true });
    }

    // Si no está enriquecida, enriquecer ahora en background
    const isEnriched = docData && docData.enriched === true;
    if (!isEnriched && docId && typeof enrichGuia === 'function') {
      enrichGuia(docId, routeData);
    }
  },

  // ═══ GUARDAR ═══
  async guardar() {
    if (!this.currentRoute) {
      showToast('No hay ruta para guardar');
      return;
    }
    const id = await guardarGuia(this.currentRoute);
    if (id) {
      this.currentRouteId = id;
      // Quitar botón guardar (guide-card o itinerario)
      const btn = document.getElementById('guide-save-btn');
      if (btn) btn.remove();
      const itinBtn = document.getElementById('itin-save-btn');
      if (itinBtn) itinBtn.remove();
      showToast('Guía guardada en Mis Viajes');
    }
    // Si id es null → el modal de registro se ha abierto (guardarGuia lo maneja)
  },

  // ═══ RESET ═══
  reset() {
    this.history = [];
    this.currentRoute = null;
    this.currentRouteId = null;
    this._streaming = false;
    this._pendingRouteInfo = null;
  },

  // ═══ NARRADOR EN RUTA ═══

  async startNarrator() {
    if (this._narratorActive) return;
    // Pedir permiso notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        console.log('[Salma] Narrador: notificaciones denegadas');
        return false;
      }
    }
    if ('Notification' in window && Notification.permission === 'denied') {
      console.log('[Salma] Narrador: notificaciones bloqueadas');
      return false;
    }
    this._narratorActive = true;
    this._narratorNotified = new Set();
    this._narratorLastCheck = 0;
    // Reactivar GPS continuo si se había parado
    if (!this._geoWatchId) this.initGeolocation();
    // Check periódico cada 30s
    this._narratorInterval = setInterval(() => this.checkNearbyPOIs(), 30000);
    // Primer check inmediato
    this.checkNearbyPOIs();
    localStorage.setItem('narrator_active', 'true');
    console.log('[Salma] Narrador activado');
    if (typeof updateBottomBar === 'function') updateBottomBar();
    return true;
  },

  stopNarrator() {
    this._narratorActive = false;
    if (this._narratorInterval) {
      clearInterval(this._narratorInterval);
      this._narratorInterval = null;
    }
    localStorage.setItem('narrator_active', 'false');
    console.log('[Salma] Narrador desactivado');
    if (typeof updateBottomBar === 'function') updateBottomBar();
  },

  async checkNearbyPOIs() {
    if (!this._narratorActive || !this._userLocation) return;
    const now = Date.now();
    if (now - this._narratorLastCheck < 25000) return;
    this._narratorLastCheck = now;

    const { lat, lng } = this._userLocation;
    console.log('[Salma] Narrator check:', lat, lng);

    try {
      const res = await fetch(window.SALMA_API + '/nearby-pois?lat=' + lat + '&lng=' + lng + '&radius=500');
      if (!res.ok) return;
      const data = await res.json();
      if (!data.pois || !data.pois.length) return;

      for (const poi of data.pois) {
        const key = poi.place_id || poi.name;
        if (this._narratorNotified.has(key)) continue;
        this._narratorNotified.add(key);

        // Pedir narrativa a Haiku
        try {
          const narRes = await fetch(window.SALMA_API + '/narrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              poi_name: poi.name,
              lat: poi.lat,
              lng: poi.lng,
              country_code: this._copilotCountry || ''
            })
          });
          if (!narRes.ok) continue;
          const narData = await narRes.json();
          if (!narData.narrative) continue;

          // Notificación push
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Salma', {
              body: narData.narrative,
              icon: '/salma_ai_avatar.png',
              tag: 'narrator-' + key,
              data: { poi_name: poi.name, narrative: narData.narrative }
            });
          }

          // Si el chat está abierto, insertar burbuja
          const area = this._getChatArea();
          if (area) {
            const bubble = document.createElement('div');
            bubble.className = 'msg msg-salma narrator-msg';
            bubble.innerHTML = `
              <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma · narrador</span></div>
              <div class="msg-body-salma">
                <div class="narrator-poi-name">📍 ${poi.name}</div>
                ${narData.narrative}
              </div>`;
            area.appendChild(bubble);
            this._scrollToBottom(false);
            // Narrador habla automático solo si voz está activada
            if (localStorage.getItem('salma_voice') === 'true') {
              const narText = narData.narrative;
              setTimeout(() => this.salmaSpeak(narText), 50);
            }
          }

          console.log('[Salma] Narrador:', poi.name, '→', narData.narrative.substring(0, 60) + '...');
        } catch (e) {
          console.log('[Salma] Narrador: error narrativa', e.message);
        }
      }
    } catch (e) {
      console.log('[Salma] Narrador: error check POIs', e.message);
    }
  },

  // ═══ COPILOTO — TARJETA INFO PAÍS ═══
  _copilotCountry: null,
  _copilotData: null,

  async initCopilot() {
    if (!this._userLocation) return;
    try {
      // Reverse geocoding con Nominatim (OpenStreetMap, gratuito)
      const { lat, lng } = this._userLocation;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=3`);
      const geo = await res.json();
      const countryCode = (geo.address?.country_code || '').toLowerCase();
      if (!countryCode || countryCode === this._copilotCountry) return;

      // Pedir info práctica del país al worker
      const piRes = await fetch(window.SALMA_API + '/practical-info?country=' + countryCode);
      if (!piRes.ok) return;
      const piData = await piRes.json();
      if (!piData.practical_info) return;

      this._copilotCountry = countryCode;
      this._copilotData = piData.practical_info;
      console.log('[Salma] Copiloto activado:', geo.address?.country, countryCode);
    } catch (e) {
      console.log('[Salma] Copiloto: error obteniendo info', e.message);
    }
  },

  showCopilotCard() {
    const pi = this._copilotData;
    if (!pi) return;

    // No mostrar si ya existe
    if (document.getElementById('copilot-card')) return;

    const area = this._getChatArea();
    if (!area) return;

    let html = '<div id="copilot-card" class="copilot-card">';
    html += '<div class="copilot-header" onclick="document.getElementById(\'copilot-body\').classList.toggle(\'copilot-open\')">';
    html += '<span class="copilot-title">📍 Info práctica del país</span>';
    html += '<span class="copilot-toggle">▸</span></div>';
    html += '<div id="copilot-body" class="copilot-body">';

    // Emergencias (siempre visible, es lo más urgente)
    if (pi.emergencies) {
      html += '<div class="copilot-section"><strong>🚨 Emergencias</strong><br>';
      if (pi.emergencies.general_number) html += '<strong>' + pi.emergencies.general_number + '</strong><br>';
      if (pi.emergencies.embassy) html += '<small>' + pi.emergencies.embassy + '</small>';
      html += '</div>';
    }

    // Frases clave
    if (pi.phrases && pi.phrases.list) {
      html += '<div class="copilot-section"><strong>🗣️ ' + (pi.phrases.language || 'Frases') + '</strong>';
      html += '<div class="copilot-phrases">';
      for (const p of pi.phrases.list.slice(0, 6)) {
        html += '<span class="copilot-phrase"><b>' + p.phrase + '</b> ' + p.meaning + '</span>';
      }
      html += '</div></div>';
    }

    // Apps
    if (pi.useful_apps && pi.useful_apps.length) {
      html += '<div class="copilot-section"><strong>📱 Apps</strong><br>';
      html += '<small>' + pi.useful_apps.join('<br>') + '</small>';
      html += '</div>';
    }

    // Conectividad
    if (pi.connectivity) {
      html += '<div class="copilot-section"><strong>📶 Conectividad</strong><br>';
      if (pi.connectivity.sim_local) html += '<small>' + pi.connectivity.sim_local + '</small>';
      html += '</div>';
    }

    // Salud
    if (pi.health) {
      html += '<div class="copilot-section"><strong>🏥 Salud</strong><br>';
      if (pi.health.hospitals) html += '<small>' + pi.health.hospitals + '</small><br>';
      if (pi.health.water) html += '<small><em>' + pi.health.water + '</em></small>';
      html += '</div>';
    }

    // Presupuesto
    if (pi.budget) {
      html += '<div class="copilot-section"><strong>💰 Presupuesto</strong><br>';
      if (pi.budget.total_estimated) html += '<small>' + pi.budget.total_estimated + '</small><br>';
      if (pi.budget.exchange_tip) html += '<small><em>' + pi.budget.exchange_tip + '</em></small>';
      html += '</div>';
    }

    html += '</div></div>';

    // Insertar al principio del chat
    area.insertAdjacentHTML('afterbegin', html);
  },

  // ═══ CHAT DOM ═══

  _initChat(skipWelcome) {
    if (currentState !== 'chat') {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
      showState('chat');
    }
    if (!document.getElementById('chat-area')) {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
    }
    // Mostrar tarjeta copiloto si hay datos del país
    if (this._copilotData) this.showCopilotCard();
  },

  _getChatArea() {
    return document.getElementById('chat-area');
  },

  _addUserBubble(text, photoUrl) {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-user';
    const photoHtml = photoUrl ? `<img src="${photoUrl}" class="msg-user-photo" alt="Foto">` : '';
    const textHtml = text ? escapeHTML(text) : '';
    div.innerHTML = `<div class="msg-body-user">${photoHtml}${textHtml}</div>`;
    area.appendChild(div);
    this._scrollToBottom(true);
  },

  _addSalmaBubble(text) {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma">${formatMessage(text)}</div>`;
    this._addSpeakButton(div);
    // Botón guardar nota solo si el mensaje tiene contenido relevante (>80 chars)
    if (text.length > 150) {
      const btnHtml = document.createElement('button');
      btnHtml.className = 'msg-save-note';
      btnHtml.innerHTML = '&#x1F516; Guardar nota';
      btnHtml.addEventListener('click', (e) => {
        e.stopPropagation();
        this._saveNoteFromBubble(text, btnHtml);
      });
      div.appendChild(btnHtml);
    }
    area.appendChild(div);
    this._scrollToBottom(true);
    // Auto-speak solo si el usuario lo ha activado explícitamente
    if (localStorage.getItem('salma_voice') === 'true') {
      setTimeout(() => this.salmaSpeak(text), 50);
    }
  },

  // ═══ SALMA_ACTION — Renderizar tarjetas de resultados ═══
  _renderActionResults(results) {
    const area = this._getChatArea();
    if (!area) return;
    for (const result of results) {
      if (!result || result.error) continue;
      const wrap = document.createElement('div');
      wrap.className = 'salma-action-results';
      switch (result.type) {
        case 'flights': this._renderFlightResults(result, wrap); break;
        case 'hotels':  this._renderHotelResults(result, wrap); break;
        case 'places':  this._renderPlaceResults(result, wrap); break;
        default: continue;
      }
      if (wrap.children.length > 0) {
        area.appendChild(wrap);
        this._scrollToBottom(true);
      }
    }
  },

  _renderFlightResults(result, wrap) {
    if (!result.flights || result.flights.length === 0) return;
    const header = document.createElement('div');
    header.className = 'salma-results-header';
    header.textContent = `✈️ Vuelos ${result.origin} → ${result.destination} · ${result.date}${result.return_date ? ' (ida y vuelta)' : ''}`;
    wrap.appendChild(header);
    const grid = document.createElement('div');
    grid.className = 'salma-result-grid';
    for (const f of result.flights) {
      const dep = f.departure ? new Date(f.departure).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '';
      const arr = f.arrival ? new Date(f.arrival).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '';
      const stops = f.stops === 0 ? 'Directo' : f.stops === 1 ? '1 escala' : `${f.stops} escalas`;
      const card = document.createElement('div');
      card.className = 'salma-result-card';
      card.innerHTML = `
        <div class="salma-result-card-body">
          <div class="salma-result-card-name">✈ ${f.airlines || 'Aerolínea'}</div>
          <div class="salma-result-card-sub">${dep} → ${arr} · ${f.duration_h ? f.duration_h + 'h' : ''} · ${stops}</div>
          <div class="salma-result-card-price">${f.price ? f.price + ' ' + (result.currency || 'EUR') : ''}</div>
          ${f.booking_link ? `<a class="salma-result-card-cta" href="${f.booking_link}" target="_blank" rel="noopener">Reservar</a>` : ''}
        </div>`;
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  },

  _renderHotelResults(result, wrap) {
    const items = result.hotels;
    if (!items || items.length === 0) return;
    const SALMA_API = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    const header = document.createElement('div');
    header.className = 'salma-results-header';
    header.textContent = `🏨 Hoteles en ${result.city || 'la zona'}${result.checkin ? ' · ' + result.checkin : ''}`;
    wrap.appendChild(header);
    const grid = document.createElement('div');
    grid.className = 'salma-result-grid';
    for (const h of items) {
      const stars = h.rating ? '⭐ ' + h.rating.toFixed(1) + (h.reviews ? ` (${h.reviews.toLocaleString()})` : '') : '';
      const price = h.price_level ? '€'.repeat(h.price_level) : '';
      const card = document.createElement('div');
      card.className = 'salma-result-card';
      card.innerHTML = `
        ${h.photo_ref ? `<img src="${SALMA_API}/photo?ref=${encodeURIComponent(h.photo_ref)}&maxwidth=400" alt="${h.name}" loading="lazy" onerror="this.style.display='none'">` : ''}
        <div class="salma-result-card-body">
          <div class="salma-result-card-name">${h.name}</div>
          <div class="salma-result-card-sub">${h.address}</div>
          ${stars ? `<div class="salma-result-card-rating">${stars}</div>` : ''}
          ${price ? `<div class="salma-result-card-price">${price}</div>` : ''}
          ${h.maps_link ? `<a class="salma-result-card-cta" href="${h.maps_link}" target="_blank" rel="noopener">Ver en Maps</a>` : ''}
        </div>`;
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  },

  _renderPlaceResults(result, wrap) {
    const items = result.places;
    if (!items || items.length === 0) return;
    const SALMA_API = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    const header = document.createElement('div');
    header.className = 'salma-results-header';
    header.textContent = `📍 ${result.query}`;
    wrap.appendChild(header);
    const grid = document.createElement('div');
    grid.className = 'salma-result-grid';
    for (const p of items) {
      const stars = p.rating ? '⭐ ' + p.rating.toFixed(1) + (p.reviews ? ` (${p.reviews.toLocaleString()})` : '') : '';
      const openBadge = p.open_now === true ? '<span class="salma-open-badge">Abierto</span>' : p.open_now === false ? '<span class="salma-closed-badge">Cerrado</span>' : '';
      const card = document.createElement('div');
      card.className = 'salma-result-card';
      card.innerHTML = `
        ${p.photo_ref ? `<img src="${SALMA_API}/photo?ref=${encodeURIComponent(p.photo_ref)}&maxwidth=400" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">` : ''}
        <div class="salma-result-card-body">
          <div class="salma-result-card-name">${p.name} ${openBadge}</div>
          <div class="salma-result-card-sub">${p.address}</div>
          ${stars ? `<div class="salma-result-card-rating">${stars}</div>` : ''}
          ${p.maps_link ? `<a class="salma-result-card-cta" href="${p.maps_link}" target="_blank" rel="noopener">Ver en Maps</a>` : ''}
        </div>`;
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  },

  _saveNoteFromBubble(text, btnEl) {
    if (!window.currentUser) {
      // Guardar nota pendiente para después del registro
      window._pendingSaveNote = { text, btnEl };
      if (typeof openModal === 'function') openModal('register');
      return;
    }
    const country = detectCountryInMessage(text) || (this.currentRoute ? normalizeCountry(this.currentRoute.country) : null);
    const snippet = text;

    const doSave = (code, name, emoji) => {
      saveCountryNote(code, name, emoji, {
        id: 'nota_' + Date.now(),
        texto: snippet,
        tipo: 'nota',
        origen: 'manual',
        fecha: new Date().toISOString()
      });
      // Cambiar botón a "Guardado" en verde
      if (btnEl) {
        btnEl.innerHTML = '&#x2713; Guardado';
        btnEl.style.background = 'rgba(92,184,92,.2)';
        btnEl.style.borderColor = 'rgba(92,184,92,.4)';
        btnEl.style.color = '#5cb85c';
        btnEl.disabled = true;
      }
    };

    if (country && country.code) {
      doSave(country.code, country.name, country.emoji);
    } else {
      const pais = prompt('¿En qué país guardamos esta nota?');
      if (!pais) return;
      const c = normalizeCountry(pais);
      if (c.code) doSave(c.code, c.name, c.emoji);
    }
  },

  // Botón mute/unmute global en cada burbuja
  _addSpeakButton(el) {
    if (!window.speechSynthesis) return;
    const header = el.querySelector('.msg-salma-header');
    if (!header || header.querySelector('.msg-speak-btn')) return;
    const muted = localStorage.getItem('salma_voice') !== 'true';
    const speakBtn = document.createElement('button');
    speakBtn.className = 'msg-speak-btn';
    speakBtn.textContent = muted ? '\u{1F507}' : '\u{1F50A}';
    speakBtn.title = muted ? 'Activar voz' : 'Silenciar voz';
    speakBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOn = localStorage.getItem('salma_voice') === 'true';
      // Toggle global
      localStorage.setItem('salma_voice', isOn ? 'false' : 'true');
      if (isOn) this.salmaSpeakStop();
      // Actualizar TODOS los botones
      this._syncSpeakButtons();
    });
    header.appendChild(speakBtn);
  },

  // Sincronizar icono de todos los botones de voz
  _syncSpeakButtons() {
    const muted = localStorage.getItem('salma_voice') !== 'true';
    document.querySelectorAll('.msg-speak-btn').forEach(btn => {
      btn.textContent = muted ? '\u{1F507}' : '\u{1F50A}';
      btn.title = muted ? 'Activar voz' : 'Silenciar voz';
    });
  },

  _addStreamBubble() {
    const area = this._getChatArea();
    if (!area) return null;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.id = 'salma-stream-msg';
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma" id="salma-stream-text"></div>`;
    area.appendChild(div);
    return document.getElementById('salma-stream-text');
  },

  _fixStreamBubble() {
    const el = document.getElementById('salma-stream-msg');
    if (el) {
      el.removeAttribute('id');
      const bodyEl = el.querySelector('.msg-body-salma');
      const textContent = bodyEl ? bodyEl.textContent : '';
      this._addSpeakButton(el);
      // Añadir botón guardar nota solo si hay contenido relevante
      if (textContent.length > 150 && !el.querySelector('.msg-save-note')) {
        const btn = document.createElement('button');
        btn.className = 'msg-save-note';
        btn.innerHTML = '&#x1F516; Guardar nota';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._saveNoteFromBubble(textContent, btn);
        });
        el.appendChild(btn);
      }
    }
    const txt = document.getElementById('salma-stream-text');
    if (txt) txt.removeAttribute('id');
  },

  _removeStreamBubble() {
    const el = document.getElementById('salma-stream-msg');
    if (el) {
      const txt = document.getElementById('salma-stream-text');
      if (txt && !txt.textContent.trim()) {
        el.remove(); // Vacía, quitar
      } else {
        const textContent = txt ? txt.textContent : '';
        if (txt) txt.removeAttribute('id');
        el.removeAttribute('id');
        this._addSpeakButton(el);
        // Auto-speak solo si el usuario lo ha activado explícitamente
        if (textContent && localStorage.getItem('salma_voice') === 'true') {
          const t = textContent;
          setTimeout(() => this.salmaSpeak(t), 50);
        }
        // Botón guardar nota solo si hay contenido relevante
        if (textContent.length > 150 && !el.querySelector('.msg-save-note')) {
          const btn = document.createElement('button');
          btn.className = 'msg-save-note';
          btn.innerHTML = '&#x1F516; Guardar nota';
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._saveNoteFromBubble(textContent, btn);
          });
          el.appendChild(btn);
        }
      }
    }
  },

  _showGeoPrompt() {
    const area = this._getChatArea();
    if (!area) return;
    // Evitar duplicados
    if (area.querySelector('.msg-geo-prompt')) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma msg-geo-prompt';
    div.innerHTML = `
      <div class="msg-salma-header">
        <div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div>
        <span class="msg-salma-name">Salma</span>
      </div>
      <div class="msg-body-salma">
        Necesito tu ubicación para buscarte lo más cercano.<br><br>
        Toca el <strong>🔒 candado</strong> en la barra del navegador → <strong>Permisos</strong> → <strong>Ubicación</strong> → <strong>Permitir</strong>. Luego vuelve a enviar tu mensaje.<br><br>
        <button class="btn-geo-retry" onclick="salma.retryGeolocation(this)">📍 Intentar activar ubicación</button>
      </div>`;
    area.appendChild(div);
    this._scrollToBottom(true);
  },

  retryGeolocation(btn) {
    if (btn) btn.textContent = 'Activando...';
    this._geoBlocked = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this._userLocation = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
          accuracy: Math.round(pos.coords.accuracy)
        };
        const prompt = document.querySelector('.msg-geo-prompt');
        if (prompt) prompt.remove();
        if (!this._copilotCountry) this.initCopilot();
      },
      (err) => {
        if (btn) btn.textContent = '📍 Intentar activar ubicación';
        this._geoBlocked = (err.code === 1);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },

  showGPSToggle() {
    const area = this._getChatArea();
    if (!area) return;
    if (area.querySelector('.msg-gps-toggle')) return;
    const isActive = !!this._userLocation && !this._geoBlocked;
    const div = document.createElement('div');
    div.className = 'msg msg-salma msg-gps-toggle';
    div.innerHTML = `
      <div class="msg-salma-header">
        <div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div>
        <span class="msg-salma-name">Salma</span>
      </div>
      <div class="msg-body-salma">
        <button class="btn-gps-toggle" onclick="salma.toggleGPS(this)" style="
          padding:10px 20px;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;width:100%;
          background:${isActive ? '#c0392b' : 'var(--dorado, #d4a843)'};color:${isActive ? '#fff' : '#1a1a1a'};
        ">${isActive ? '📍 Desactivar GPS' : '📍 Activar GPS'}</button>
      </div>`;
    area.appendChild(div);
    this._scrollToBottom(true);
  },

  toggleGPS(btn) {
    const isActive = !!this._userLocation && !this._geoBlocked;
    if (isActive) {
      if (this._geoWatchId) { navigator.geolocation.clearWatch(this._geoWatchId); this._geoWatchId = null; }
      this._userLocation = null;
      this.stopNarrator();
      if (btn) { btn.textContent = '📍 Activar GPS'; btn.style.background = 'var(--dorado, #d4a843)'; btn.style.color = '#1a1a1a'; }
      const toggle = document.getElementById('narrator-toggle');
      if (toggle) toggle.checked = false;
    } else {
      this._geoBlocked = false;
      this.initGeolocation();
      if (btn) btn.textContent = 'Activando...';
      setTimeout(() => {
        if (this._userLocation) {
          if (btn) { btn.textContent = '📍 Desactivar GPS'; btn.style.background = '#c0392b'; btn.style.color = '#fff'; }
        } else {
          if (btn) { btn.textContent = '📍 Activar GPS'; btn.style.background = 'var(--dorado, #d4a843)'; btn.style.color = '#1a1a1a'; }
        }
      }, 3000);
    }
  },

  _loadingPhrases: [
    'Mirando el mapa...', 'Calculando la ruta...', 'Buscando los mejores sitios...',
    'Consultando precios...', 'Organizando el itinerario...',
    'Preguntando a los locales...', 'Comprobando horarios...',
    'Buscando restaurantes de verdad...', 'Verificando coordenadas...',
  ],
  _loadingInterval: null,

  // ═══ BOTÓN VOLVER A LA RUTA (cuando se chatea desde el itinerario) ═══
  _addReturnToRouteButton(route, docId, options) {
    const area = this._getChatArea();
    if (!area || !route) return;
    const div = document.createElement('div');
    div.className = 'msg-return-route';
    const btn = document.createElement('button');
    btn.className = 'btn-return-route';
    btn.textContent = '← Volver a la ruta';
    btn.addEventListener('click', () => {
      div.remove();
      if (typeof window.openItinerarioView === 'function') {
        window.openItinerarioView(route, docId, options || { fromChat: true });
      }
    });
    div.appendChild(btn);
    area.appendChild(div);
    this._scrollToBottom(true);
  },

  _addLoading(customText, noRetry = false) {
    this._removeLoading();
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.id = 'salma-loading';
    const phrase = customText || this._loadingPhrases[Math.floor(Math.random() * this._loadingPhrases.length)];
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text" id="loading-phrase">${phrase}</div>
      </div>`;
    area.appendChild(div);
    this._scrollToBottom(true);  // forzar: loading inicial

    // Rotar frases solo si no hay texto custom
    if (!customText) {
      let idx = 0;
      this._loadingInterval = setInterval(() => {
        idx = (idx + 1) % this._loadingPhrases.length;
        const el = document.getElementById('loading-phrase');
        if (el) el.textContent = this._loadingPhrases[idx];
      }, 3000);
    }

    // Botón reintentar: aparece a los 18s si Salma aún está pensando
    // noRetry=true cuando estamos en generación por bloques (cada bloque resetea el timer → loop infinito)
    if (!noRetry) {
      this._retryTimer = setTimeout(() => {
        const body = div.querySelector('.msg-body-salma');
        if (!body || div.querySelector('.btn-retry-salma')) return;
        const btn = document.createElement('button');
        btn.className = 'btn-retry-salma';
        btn.textContent = '↩ Reintentar';
        btn.addEventListener('click', () => this._cancelAndRetry());
        body.appendChild(btn);
        this._scrollToBottom(false);
      }, 18000);
    }

    return div;
  },

  _removeLoading() {
    const el = document.getElementById('salma-loading');
    if (el) el.remove();
    if (this._loadingInterval) {
      clearInterval(this._loadingInterval);
      this._loadingInterval = null;
    }
    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }
  },

  // Cancela la petición actual y vuelve a enviar el último mensaje
  _cancelAndRetry() {
    // Abortar fetch (cancela la red)
    if (this._currentAbort) {
      try { this._currentAbort.abort(); } catch (_) {}
      this._currentAbort = null;
    }
    // Cancelar el lector SSE si ya arrancó
    if (this._currentReader) {
      try { this._currentReader.cancel(); } catch (_) {}
      this._currentReader = null;
    }
    // Limpiar UI
    this._removeLoading();
    this._removeStreamBubble();
    this._streaming = false;
    const $send = document.getElementById('send-btn');
    if ($send) $send.disabled = false;
    const camBtn = document.getElementById('cam-btn');
    if (camBtn) camBtn.disabled = false;

    // Reintentar con el último mensaje
    if (this._lastMsg !== undefined) {
      this._doSend(this._lastMsg, this._lastExtra || {});
    }
  },

  _scrollToBottom(force) {
    // Solo hacer scroll si el usuario ya está cerca del fondo (< 300px)
    // o si se fuerza (ej: mensaje del usuario, no contenido streaming)
    const distFromBottom = document.body.scrollHeight - window.innerHeight - window.scrollY;
    if (!force && distFromBottom > 300) return;
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 50);
  },

  // ═══ RATE LIMIT ═══
  _checkRate() {
    const now = Date.now();
    this._rateTimes = this._rateTimes.filter(t => now - t < 60000);
    if (this._rateTimes.length >= 10) {
      showToast('Espera un momento, demasiados mensajes');
      return false;
    }
    this._rateTimes.push(now);
    return true;
  },

  // ═══ SEND DESDE COPILOTO (chat bottom sheet en itin-view) ═══
  async sendFromCopilot(msg, onChunk) {
    if (!msg || this._streaming) return;
    if (!this._checkRate()) return;

    const body = {
      messages: [...(this._history || []), { role: 'user', content: msg }],
      location: this._userLocation || null,
      country_code: this._copilotCountry || '',
    };

    try {
      const res = await fetch(window.SALMA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';
            if (delta) { fullText += delta; if (onChunk) onChunk(fullText); }
          } catch {}
        }
      }

      // Actualizar historial
      this._history.push({ role: 'user', content: msg });
      this._history.push({ role: 'assistant', content: fullText });
      if (this._history.length > 20) this._history = this._history.slice(-20);

    } catch (e) {
      if (onChunk) onChunk('Error conectando con Salma. Inténtalo de nuevo.');
    }
  }
};

// Exponer globalmente
window.salma = salma;

// Auto-inicializar cámara (DOM ya está listo porque los scripts van al final del body)
salma._initCameraBtn();
