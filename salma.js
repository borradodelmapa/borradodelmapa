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
  _userScrolled: false,
  _rateTimes: [],
  _userLocation: null,
  _geoBlocked: false,
  _pendingRouteInfo: null,  // Info parcial mientras esperamos fechas
  _pendingPhoto: null,      // {blob, base64, localUrl} mientras compone mensaje con foto
  _pendingTaxiDest: false,  // Chip "Pide Taxi" activo: el próximo mensaje es un destino de taxi
  _narratorActive: false,
  _narratorNotified: new Set(),
  _narratorLastCheck: 0,
  _narratorInterval: null,
  _voices: [],
  _currentAudio: null,
  _ttsQueue: [],
  _ttsBuffer: '',
  _ttsPlaying: false,
  _ttsStreaming: false,
  _ttsPreloaded: null,
  _ttsPrefetchAbort: null,

  // ═══ VOZ DE SALMA — Toggle global + ElevenLabs + fallback Web Speech ═══
  _voiceOn: false,

  initVoices() {
    if (!window.speechSynthesis) return;
    this._voices = speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => { this._voices = speechSynthesis.getVoices(); };
  },

  initVoiceToggle() {
    const btn = document.getElementById('voice-toggle');
    if (!btn) return;
    // Restaurar estado desde localStorage
    this._voiceOn = localStorage.getItem('salma_voice') === 'true';
    this._updateVoiceToggleUI();
    btn.addEventListener('click', () => {
      this._voiceOn = !this._voiceOn;
      localStorage.setItem('salma_voice', this._voiceOn ? 'true' : 'false');
      this._updateVoiceToggleUI();
      if (!this._voiceOn) this.salmaSpeakStop();
    });
  },

  _updateVoiceToggleUI() {
    const btn = document.getElementById('voice-toggle');
    if (!btn) return;
    btn.classList.toggle('voice-on', this._voiceOn);
    btn.setAttribute('aria-label', this._voiceOn ? 'Desactivar voz de Salma' : 'Activar voz de Salma');
  },

  // Limpiar texto para TTS
  _ttsClean(text) {
    return text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
      .replace(/^[\s]*[-•]\s*/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  // Partir texto en frases para la cola TTS
  _ttsSplitSentences(text) {
    const sentences = [];
    // Partir por ". " "! " "? " seguido de mayúscula o final, o por doble salto de línea
    const parts = text.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])|(?:\n\n+)/);
    let current = '';
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (current.length + trimmed.length > 800) {
        if (current) sentences.push(current.trim());
        current = trimmed;
      } else {
        current += (current ? ' ' : '') + trimmed;
      }
    }
    if (current.trim()) sentences.push(current.trim());
    return sentences.filter(s => s.length > 0);
  },

  // Fetch audio de ElevenLabs para un trozo de texto
  async _ttsFetchAudio(text, signal) {
    const api = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    const res = await fetch(api + '/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal,
    });
    if (!res.ok) throw new Error('ElevenLabs ' + res.status);
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio._blobUrl = audioUrl;
    return audio;
  },

  // Fallback Web Speech para una frase
  _ttsSpeakWebSpeech(text) {
    if (!window.speechSynthesis) return;
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const esVoice = this._voices.find(v => v.lang.startsWith('es'));
    utt.voice = esVoice || this._voices[0] || null;
    utt.lang = esVoice ? esVoice.lang : 'es-ES';
    utt.rate = 1.0;
    utt.pitch = 1.05;
    utt.onend = () => { this._ttsPlaying = false; this._ttsPlayNext(); };
    utt.onerror = () => { this._ttsPlaying = false; this._ttsPlayNext(); };
    this._ttsPlaying = true;
    speechSynthesis.speak(utt);
  },

  // Encolar una frase limpia
  _ttsEnqueue(sentence) {
    const clean = this._ttsClean(sentence);
    if (!clean) return;
    this._ttsQueue.push(clean);
    if (!this._ttsPlaying) this._ttsPlayNext();
  },

  // Reproducir siguiente frase de la cola
  async _ttsPlayNext() {
    if (!this._voiceOn || this._ttsQueue.length === 0) {
      this._ttsPlaying = false;
      return;
    }
    this._ttsPlaying = true;
    const sentence = this._ttsQueue.shift();

    // Usar audio pre-cargado si existe
    let audio = this._ttsPreloaded;
    this._ttsPreloaded = null;

    if (!audio) {
      try {
        audio = await this._ttsFetchAudio(sentence);
      } catch (e) {
        console.warn('[Salma] ElevenLabs falló, fallback Web Speech:', e.message);
        this._ttsSpeakWebSpeech(sentence);
        return;
      }
    }

    if (!this._voiceOn) { // voz desactivada durante fetch
      if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
      this._ttsPlaying = false;
      return;
    }

    this._currentAudio = audio;
    audio.onended = () => {
      if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
      this._currentAudio = null;
      this._ttsPlaying = false;
      this._ttsPlayNext();
    };
    audio.onerror = () => {
      if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
      this._currentAudio = null;
      this._ttsPlaying = false;
      this._ttsPlayNext();
    };
    audio.play().catch(() => { this._ttsPlaying = false; this._ttsPlayNext(); });

    // Pre-fetch siguiente frase mientras esta suena
    if (this._ttsQueue.length > 0) {
      try {
        if (this._ttsPrefetchAbort) this._ttsPrefetchAbort.abort();
        this._ttsPrefetchAbort = new AbortController();
        this._ttsPreloaded = await this._ttsFetchAudio(this._ttsQueue[0], this._ttsPrefetchAbort.signal);
      } catch (_) { this._ttsPreloaded = null; }
    }
  },

  // Iniciar modo streaming TTS
  _ttsStartStreaming() {
    this._ttsStopAll();
    this._ttsStreaming = true;
    this._ttsBuffer = '';
  },

  // Alimentar chunk de texto durante streaming
  _ttsFeedChunk(chunk) {
    if (!this._voiceOn || !this._ttsStreaming) return;
    this._ttsBuffer += chunk;
    // Buscar frases completas: termina en . ! ? seguido de espacio y mayúscula, o doble newline
    const re = /^([\s\S]*?[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/;
    let match;
    while ((match = re.exec(this._ttsBuffer))) {
      const sentence = match[1].trim();
      if (sentence.length > 10) { // evitar fragmentos minúsculos
        this._ttsEnqueue(sentence);
      }
      this._ttsBuffer = this._ttsBuffer.slice(match[0].length);
    }
  },

  // Flush buffer al terminar streaming
  _ttsFlush() {
    if (this._ttsBuffer.trim().length > 5) {
      this._ttsEnqueue(this._ttsBuffer.trim());
    }
    this._ttsBuffer = '';
    this._ttsStreaming = false;
  },

  // Parar todo el sistema TTS
  _ttsStopAll() {
    this._ttsQueue = [];
    this._ttsBuffer = '';
    this._ttsPlaying = false;
    this._ttsStreaming = false;
    if (this._ttsPreloaded) {
      if (this._ttsPreloaded._blobUrl) URL.revokeObjectURL(this._ttsPreloaded._blobUrl);
      this._ttsPreloaded = null;
    }
    if (this._ttsPrefetchAbort) {
      this._ttsPrefetchAbort.abort();
      this._ttsPrefetchAbort = null;
    }
    if (this._currentAudio) {
      this._currentAudio.pause();
      if (this._currentAudio._blobUrl) URL.revokeObjectURL(this._currentAudio._blobUrl);
      this._currentAudio.src = '';
      this._currentAudio = null;
    }
    if (window.speechSynthesis) speechSynthesis.cancel();
  },

  // salmaSpeak — ahora con soporte para textos largos via cola
  async salmaSpeak(text) {
    try {
      if (!this._voiceOn) return;
      const clean = this._ttsClean(text);
      if (!clean) return;

      this._ttsStopAll();

      // Textos largos → partir en frases y encolar
      if (clean.length > 1200) {
        const sentences = this._ttsSplitSentences(clean);
        for (const s of sentences) this._ttsEnqueue(s);
        return;
      }

      // Texto corto → una sola llamada directa
      try {
        const audio = await this._ttsFetchAudio(clean);
        if (!this._voiceOn) { if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl); return; }
        this._currentAudio = audio;
        this._ttsPlaying = true;
        audio.onended = () => {
          if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
          this._currentAudio = null;
          this._ttsPlaying = false;
        };
        audio.play();
        return;
      } catch (e) {
        console.warn('[Salma] ElevenLabs falló, usando voz del navegador:', e.message);
      }

      // Fallback Web Speech
      this._ttsSpeakWebSpeech(clean);
    } catch (e) { console.warn('[Salma] Error voz:', e); }
  },

  salmaSpeakStop() {
    this._ttsStopAll();
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
      // Mostrar botón enviar (la foto ya se puede enviar sin texto)
      const $send = document.getElementById('main-send');
      const camBtn = document.getElementById('cam-btn');
      const micBtn = document.getElementById('mic-btn');
      if ($send) $send.style.display = '';
      if (camBtn) camBtn.style.display = 'none';
      if (micBtn) micBtn.style.display = 'none';
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
    // Restaurar botones cam/mic/send
    if (typeof resetInputButtons === 'function') resetInputButtons();
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

    // Chip "Pide Taxi": el usuario acaba de escribir el destino → prepend "taxi a"
    if (this._pendingTaxiDest && msg) {
      this._pendingTaxiDest = false;
      msg = 'Necesito un taxi a ' + msg;
      // Restaurar placeholder
      const input = document.getElementById('salma-input');
      if (input) input.placeholder = 'Escribe a Salma...';
    }

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
      const needsLocation = /desde donde estoy|desde aqu[ií]|desde ah[ií]|cerca de m[ií]|por aqu[ií]|aqu[ií] cerca|donde estoy|mi ubicaci[oó]n|nearest|near me|vuelo.*desde aqu[ií]|vuelo.*desde ah[ií]/i.test(msg);
      if (needsLocation) {
        this._addUserBubble(msg);
        this._pendingGeoMessage = msg;  // guardar para reenviar tras GPS
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
    this._userScrolled = false; // nuevo mensaje → retomar auto-scroll
    $send.disabled = true;
    const camBtn = document.getElementById('cam-btn');
    if (camBtn) camBtn.disabled = true;
    const loadingPhrase = this._isRouteMsg(msg)
      ? null  // aleatoria del pool de rutas
      : this._loadingPhrasesSimple[Math.floor(Math.random() * this._loadingPhrasesSimple.length)];
    const loadingEl = this._addLoading(loadingPhrase);

    try {
      const body = {
        message: msg,
        history: this.history.slice(-20),
        stream: true
      };
      if (this.currentRoute) body.current_route = this.currentRoute;
      if (window.currentUser?.country) body.nationality = window.currentUser.country;
      if (window.currentUser?.name) body.user_name = window.currentUser.name;
      // coins_saldo y rutas_gratis_usadas se leen server-side desde Firestore
      // (ya no se envían desde el frontend por seguridad — P0-2)
      if (this._userLocation) body.user_location = this._userLocation;
      // Inyectar notas del usuario (sistema unificado)
      if (window.currentUser && typeof notasManager !== 'undefined') {
        try {
          // Notas del país detectado en el mensaje
          const msgCountry = typeof detectCountryInMessage === 'function'
            ? (detectCountryInMessage(msg) || (this.currentRoute ? normalizeCountry(this.currentRoute.country) : null))
            : null;
          if (msgCountry?.code) {
            const countryNotas = await notasManager.getByCountry(msgCountry.code);
            if (countryNotas.length) body.country_notes = countryNotas.slice(-10).map(n => ({ texto: n.texto, tipo: n.tipo }));
          }
          // Notas generales del usuario
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
      this._saveSession();

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
            // Vista itinerario (mapa-itinerario.js)
            if (window._itinViewOpen && typeof mapaItinerario !== 'undefined') {
              mapaItinerario.updateVerified(data.route.stops);
            }
            // Vista guía clásica (guide-renderer.js)
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
          this._saveSession();
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
      // añadir botón para volver a la ruta — solo si el copiloto NO está activo
      // (si lo está, el botón VOLVER flotante ya cubre esta función)
      if (_itinWasOpen && _itinSavedRoute && !(data.route && data.route.stops) && !window.mapaRuta?._copilotActive) {
        this._addReturnToRouteButton(_itinSavedRoute, _itinSavedDocId, _itinSavedOptions);
      }

    } catch (e) {
      console.error('Error en salma.send:', e);
      this._removeLoading();
      this._removeStreamBubble();
      const errMsg = (e && e.message) ? e.message : String(e);
      this._addSalmaBubble('Uf, sin conexión o me he aturrullado. Vuelve a intentarlo.');
    } finally {
      this._streaming = false;
      $send.disabled = false;
      const camBtnF = document.getElementById('cam-btn');
      if (camBtnF) camBtnF.disabled = false;
      if (typeof resetInputButtons === 'function') resetInputButtons();
      if (!('ontouchstart' in window)) $input.focus();
    }
  },

  // ═══ SSE STREAMING ═══
  async _stream(bodyObj, loadingEl) {
    // Obtener Firebase ID token para auth server-side
    let idToken = null;
    try {
      const user = firebase.auth().currentUser;
      if (user) idToken = await user.getIdToken();
    } catch (e) { console.warn('[Salma] No se pudo obtener idToken:', e); }

    return new Promise((resolve, reject) => {
      const signal = this._currentAbort ? this._currentAbort.signal : undefined;
      const headers = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = 'Bearer ' + idToken;

      fetch(window.SALMA_API, {
        method: 'POST',
        headers,
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

        // SSE stream — reusar burbuja loading como stream (una sola burbuja)
        const textEl = this._addStreamBubble();
        if (this._voiceOn) this._ttsStartStreaming();
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
                // (transport_actions se manejan como evento SSE independiente, antes del texto)
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
                  if (typeof notasManager !== 'undefined' && window.currentUser) {
                    const c = typeof normalizeCountry === 'function' ? normalizeCountry(evt.country_hint) : null;
                    notasManager.create({
                      texto: evt.summary,
                      countryCode: c?.code || null,
                      countryName: c?.name || null,
                      emoji: c?.emoji || null,
                      origen: 'auto',
                      fuente: evt.tool
                    });
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
                this._addLoading('Generando tu ruta...', true);  // noRetry=true durante generación
              }

              // KEEPALIVE — verificando paradas
              if (evt.k) {
                // Actualizar texto de progreso y resetear retry
                const loadPhrase = document.getElementById('loading-phrase');
                if (loadPhrase) loadPhrase.textContent = 'Verificando paradas y cargando fotos...';
                // Esconder botón reintentar si existe
                const retryBtn = document.querySelector('.btn-retry-salma');
                if (retryBtn) retryBtn.remove();
                if (!textDone) {
                  textDone = true;
                  this._fixStreamBubble();
                  this._addLoading('Verificando paradas y cargando fotos...', true);
                }
              }

              // TRANSPORT ACTIONS — botones de apps (emitidos ANTES del texto de Claude)
              if (evt.transport_actions && evt.transport_actions.length > 0) {
                try { this._renderTransportActions(evt.transport_actions, evt.transport_tip); } catch (_) {}
                continue;
              }

              // GO_TO — "Quiero ir a..." secciones progresivas
              if (evt.go_to) {
                try { this._renderGoToSection(evt.go_to, evt.data); } catch (_) {}
                continue;
              }

              // SEARCHING — tools ejecutando en paralelo
              if (evt.searching) {
                // Actualizar texto de progreso
                const loadPhrase = document.getElementById('loading-phrase');
                if (loadPhrase) loadPhrase.textContent = 'Buscando información...';
                // Esconder botón reintentar si existe
                const retryBtn = document.querySelector('.btn-retry-salma');
                if (retryBtn) retryBtn.remove();
                if (textEl && !document.getElementById('salma-searching-dots')) {
                  const dots = document.createElement('div');
                  dots.id = 'salma-searching-dots';
                  dots.className = 'loading-dots searching-dots';
                  dots.innerHTML = '<span></span><span></span><span></span>';
                  textEl.appendChild(dots);
                  this._scrollToBottom();
                }
                continue;
              }

              // TEXT CHUNK
              if (evt.t) {
                // Quitar dots de búsqueda cuando llega contenido real
                const searchingDots = document.getElementById('salma-searching-dots');
                if (searchingDots) searchingDots.remove();
                fullText += evt.t;
                if (textEl) {
                  let display = fullText;
                  const markerPos = display.indexOf('SALMA_ROUTE');
                  if (markerPos !== -1) {
                    display = display.substring(0, markerPos);
                  } else {
                    display = display.replace(/[\n.][ ]?SAL[MA_ROUTE]*$/, '');
                  }
                  // Ocultar SALMA_ACTION:{...} del streaming (se procesan en el done event)
                  display = display.replace(/SALMA_ACTION:\s*\{[^\n]{0,500}\}/g, '').replace(/\n{3,}/g, '\n\n');
                  // Ocultar fragmentos parciales de SALMA_ACTION que aún no cerraron
                  display = display.replace(/SALMA_ACTION:\s*\{[^\n]*$/g, '');
                  textEl.innerHTML = formatMessage(display.trim());
                  textEl.dataset.raw = fullText.replace(/SALMA_ACTION:\s*\{[^\n]{0,500}\}/g, '').trim();
                  this._scrollToBottom();
                }
                // TTS en tiempo real: alimentar cola con cada chunk
                if (this._ttsStreaming) this._ttsFeedChunk(evt.t);
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

    // Resetear copiloto para mostrar vista de guía, no mapa fullscreen
    if (typeof mapaRuta !== 'undefined') mapaRuta._copilotActive = false;

    // Abrir directamente la guía seleccionada
    if (typeof window.openItinerarioView === 'function') {
      window.openItinerarioView(routeData, this.currentRouteId, { saved: true, fromChat: false });
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
    try { sessionStorage.removeItem('salma_chat'); } catch (_) {}
  },

  newChat() {
    this.history = [];
    this._pendingRouteInfo = null;
    this._pendingTaxiDest = false;
    try { sessionStorage.removeItem('salma_chat'); } catch (_) {}
    const area = document.getElementById('chat-area');
    if (area) area.innerHTML = '';
    if (typeof _renderChatEmpty === 'function') _renderChatEmpty();
    if (this._copilotData) this.showCopilotCard();
    if (typeof showToast === 'function') showToast('Nueva conversación');
  },

  // ═══ PERSISTENCIA CHAT — sessionStorage ═══
  _saveSession() {
    try {
      sessionStorage.setItem('salma_chat', JSON.stringify({
        history: this.history.slice(-20),
        ts: Date.now()
      }));
    } catch (_) {}
  },

  _restoreSession() {
    try {
      const raw = sessionStorage.getItem('salma_chat');
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > 30 * 60 * 1000) {
        sessionStorage.removeItem('salma_chat');
        return false;
      }
      if (!data.history?.length) return false;
      this.history = data.history;
      const area = document.getElementById('chat-area');
      if (!area) return false;
      for (const msg of data.history) {
        if (msg.role === 'user') this._addUserBubble(msg.content);
        else this._addSalmaBubble(msg.content);
      }
      return true;
    } catch (_) { return false; }
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

  showNarratorToast(text, duration, poi) {
    const existing = document.getElementById('narrator-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'narrator-toast';
    toast.className = 'narrator-toast narrator-toast-in';
    const mapsLink = poi && poi.place_id
      ? `https://www.google.com/maps/place/?q=place_id:${poi.place_id}`
      : poi ? `https://www.google.com/maps/search/?api=1&query=${poi.lat},${poi.lng}` : '';
    toast.innerHTML = `
      <div class="narrator-toast-close" onclick="this.parentElement.remove()">✕</div>
      ${poi ? `<div class="narrator-toast-poi">\uD83D\uDCCD ${poi.name}</div>` : ''}
      <div class="narrator-toast-text">${text}</div>
      ${mapsLink ? `<a class="narrator-toast-link" href="${mapsLink}" target="_blank" rel="noopener">Ver en Google Maps</a>` : ''}`;
    document.body.appendChild(toast);
    const autoDismiss = duration || 10000;
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('narrator-toast-in');
        toast.classList.add('narrator-toast-out');
        setTimeout(() => toast.remove(), 400);
      }
    }, autoDismiss);
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

          // Notificación push (app en background)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Salma', {
              body: narData.narrative,
              icon: '/salma_ai_avatar.png',
              tag: 'narrator-' + key,
              data: { poi_name: poi.name, narrative: narData.narrative }
            });
          }

          // Destino de la burbuja: copiloto si visible, sino toast flotante
          const ccsArea = document.getElementById('ccs-messages');
          const itinView = document.getElementById('itin-view');
          const itinVisible = itinView && itinView.style.display !== 'none';

          if (ccsArea && itinVisible) {
            const bubble = document.createElement('div');
            bubble.className = 'msg msg-salma narrator-msg';
            bubble.innerHTML = `
              <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma \u00b7 narrador</span></div>
              <div class="msg-body-salma">
                <div class="narrator-poi-name">\uD83D\uDCCD ${poi.name}</div>
                ${narData.narrative}
              </div>`;
            ccsArea.appendChild(bubble);
            ccsArea.scrollTop = ccsArea.scrollHeight;
          } else {
            this.showNarratorToast(narData.narrative, 10000, poi);
          }

          if (this._voiceOn) {
            const narText = narData.narrative;
            setTimeout(() => this.salmaSpeak(narText), 50);
          }

          console.log('[Salma] Narrador:', poi.name, '\u2192', narData.narrative.substring(0, 60) + '...');
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

      // Comprobar caché sessionStorage antes de fetch al worker
      try {
        const cached = sessionStorage.getItem('salma_copilot_' + countryCode);
        if (cached) {
          this._copilotCountry = countryCode;
          this._copilotData = JSON.parse(cached);
          console.log('[Salma] Copiloto (caché):', geo.address?.country, countryCode);
          return;
        }
      } catch (_) {}

      // Pedir info práctica del país al worker
      const piRes = await fetch(window.SALMA_API + '/practical-info?country=' + countryCode);
      if (!piRes.ok) return;
      const piData = await piRes.json();
      if (!piData.practical_info) return;

      this._copilotCountry = countryCode;
      this._copilotData = piData.practical_info;
      try { sessionStorage.setItem('salma_copilot_' + countryCode, JSON.stringify(piData.practical_info)); } catch (_) {}
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
    // Banner de recordatorios (una vez al día)
    if (window.currentUser && typeof notasManager !== 'undefined') {
      notasManager.renderChatReminders(document.getElementById('chat-area'));
    }
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
    // Enriquecer con fotos si es respuesta PLAN
    const bodyEl = div.querySelector('.msg-body-salma');
    if (bodyEl && this._isPlanBubble(bodyEl)) {
      this._enrichPlanPhotos(bodyEl);
    }
    // Auto-speak si la voz está activada
    if (this._voiceOn) {
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
    const items = result.hotels || [];
    const hasResults = items.length > 0;
    const hasAirbnb = !!result.airbnb_link;
    if (!hasResults && !hasAirbnb) return;
    const SALMA_API = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    const header = document.createElement('div');
    header.className = 'salma-results-header';
    header.textContent = hasAirbnb
      ? `🏠 Alojamiento en ${result.city || 'la zona'}${result.checkin ? ' · ' + result.checkin : ''}`
      : `🏨 Hoteles en ${result.city || 'la zona'}${result.checkin ? ' · ' + result.checkin : ''}`;
    wrap.appendChild(header);
    // Enlace directo a Airbnb si aplica
    if (hasAirbnb) {
      const airbnbCard = document.createElement('div');
      airbnbCard.className = 'salma-result-card salma-airbnb-card';
      airbnbCard.innerHTML = `
        <div class="salma-result-card-body">
          <div class="salma-result-card-name">🏠 Apartamentos en Airbnb</div>
          <div class="salma-result-card-sub">${result.city || 'Ver opciones'}${result.checkin ? ' · ' + result.checkin + (result.checkout ? ' → ' + result.checkout : '') : ''}</div>
          <a class="salma-result-card-cta" href="${result.airbnb_link}" target="_blank" rel="noopener">Ver en Airbnb</a>
        </div>`;
      wrap.appendChild(airbnbCard);
    }
    if (hasResults) {
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
    }
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

  // ═══ TRANSPORTE — Flujo taxi: pregunta destino → botones + info ═══

  askTaxiDestination() {
    // Mostrar burbuja de Salma preguntando destino (sin IA, hardcoded)
    const area = this._getChatArea();
    if (!area) return;
    // Limpiar chat-empty si existe
    const empty = area.querySelector('.chat-empty');
    if (empty) empty.remove();
    this._addSalmaBubble('¿A dónde quieres ir?');
    this._pendingTaxiDest = true;
    // Focus en el input
    const input = document.getElementById('salma-input');
    if (input) { input.focus(); input.placeholder = 'Escribe el destino...'; }
  },

  _renderTransportActions(actions, tip) {
    const area = this._getChatArea();
    if (!area) return;
    const wrap = document.createElement('div');
    wrap.className = 'salma-action-results';

    const header = document.createElement('div');
    header.className = 'salma-results-header';
    header.textContent = '🚕 Transporte';
    wrap.appendChild(header);

    if (tip) {
      const tipEl = document.createElement('div');
      tipEl.className = 'salma-transport-tip';
      tipEl.textContent = tip;
      wrap.appendChild(tipEl);
    }

    const grid = document.createElement('div');
    grid.className = 'salma-result-grid';

    const _isAndroid = /Android/i.test(navigator.userAgent);
    const _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    for (const a of actions) {
      // Para apps sin deep link: intent en Android, scheme en iOS, web en desktop
      let href = a.url;
      if (a.type === 'app' && a.pkg && _isAndroid) {
        href = `intent://open#Intent;scheme=${a.scheme};package=${a.pkg};S.browser_fallback_url=${encodeURIComponent(a.store_android || a.url)};end`;
      } else if (a.type === 'app' && a.scheme && _isIOS) {
        href = a.scheme + '://';
      }

      const card = document.createElement('div');
      card.className = 'salma-result-card';
      card.innerHTML = `<div class="salma-result-card-body">
        <div class="salma-result-card-name">${a.icon} ${a.name}</div>
        <a class="salma-result-card-cta" href="${href}" target="_blank" rel="noopener">${a.label}</a>
      </div>`;
      grid.appendChild(card);
    }
    wrap.appendChild(grid);
    area.appendChild(wrap);
    this._scrollToBottom(true);
  },

  // ═══ "QUIERO IR A..." — Renderers de secciones progresivas ═══

  _esc(str) {
    return typeof escapeHTML === 'function' ? escapeHTML(String(str)) : String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  _getGoToContainer() {
    const area = this._getChatArea();
    if (!area) return null;
    let c = area.querySelector('.salma-goto-container');
    if (!c) {
      c = document.createElement('div');
      c.className = 'salma-goto-container';
      area.appendChild(c);
    }
    return c;
  },

  _renderGoToSection(section, data) {
    if (!data) return;
    switch (section) {
      case 'header': this._renderGoToHeader(data); break;
      case 'directions': this._renderGoToDirections(data); break;
      case 'country_info': this._renderGoToCountryInfo(data); break;
      case 'transport': this._renderTransportActions(data.actions || [], data.tip); break;
      case 'flights': this._renderGoToFlights(data); break;
      case 'weather': this._renderGoToWeather(data); break;
      case 'attractions': this._renderGoToPlaces(data, 'Qué ver'); break;
      case 'restaurants': this._renderGoToPlaces(data, 'Dónde comer'); break;
      case 'resumen': this._renderGoToResumen(data); break;
      case 'chips': this._renderGoToChips(data); break;
    }
    this._scrollToBottom(true);
  },

  _renderGoToHeader(data) {
    const c = this._getGoToContainer();
    if (!c) return;
    const flag = data.destCC ? String.fromCodePoint(...[...data.destCC.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '';
    const levelLabels = { local: 'Cerca', regional: 'Regional', international: 'Internacional' };
    const el = document.createElement('div');
    el.className = 'salma-goto-header';
    el.innerHTML = `
      <span class="salma-goto-header-flag">${flag}</span>
      <div>
        <div class="salma-goto-header-name">${this._esc(data.destName || '')}</div>
        <div class="salma-goto-header-meta">${data.distanceKm ? data.distanceKm.toLocaleString() + ' km' : ''}</div>
      </div>
      <span class="salma-goto-level-badge salma-goto-level-badge--${data.level || 'international'}">${levelLabels[data.level] || ''}</span>
    `;
    c.appendChild(el);
  },

  _renderGoToDirections(data) {
    const c = this._getGoToContainer();
    if (!c || !data.url) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    sec.innerHTML = `<a class="salma-goto-directions" href="${data.url}" target="_blank" rel="noopener">🗺️ Cómo llegar a ${this._esc(data.name || 'destino')}${data.distanceKm ? ' (' + data.distanceKm + ' km)' : ''}</a>`;
    c.appendChild(sec);
  },

  _renderGoToCountryInfo(data) {
    const c = this._getGoToContainer();
    if (!c) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    const pills = [];
    if (data.visa_kv) pills.push({ label: 'Visado', value: data.visa_kv });
    if (data.moneda) pills.push({ label: 'Moneda', value: data.moneda + (data.cambio ? ' (' + data.cambio + ')' : '') });
    if (data.idioma) pills.push({ label: 'Idioma', value: data.idioma });
    if (data.enchufes) pills.push({ label: 'Enchufes', value: data.enchufes });
    if (data.emergencias) pills.push({ label: 'Emergencias', value: data.emergencias });
    if (data.seguridad) pills.push({ label: 'Seguridad', value: data.seguridad });
    if (data.mejor_epoca) pills.push({ label: 'Mejor época', value: data.mejor_epoca });
    if (data.coste_mochilero) pills.push({ label: 'Coste/día', value: 'Backpacker: ' + data.coste_mochilero + (data.coste_medio ? ' · Medio: ' + data.coste_medio : '') });
    sec.innerHTML = `<div class="salma-goto-section-title">Info práctica</div>
      <div class="salma-goto-info-grid">${pills.map(p => `<div class="salma-goto-info-pill"><div class="salma-goto-info-pill-label">${this._esc(p.label)}</div><div class="salma-goto-info-pill-value">${this._esc(p.value)}</div></div>`).join('')}</div>`;
    c.appendChild(sec);
  },

  _renderGoToFlights(data) {
    const c = this._getGoToContainer();
    if (!c || !data.vuelos?.length) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    let html = '<div class="salma-goto-section-title">Vuelos</div><div class="salma-result-grid">';
    for (const f of data.vuelos.slice(0, 4)) {
      const dep = f.salida ? new Date(f.salida).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '';
      const arr = f.llegada ? new Date(f.llegada).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '';
      const stops = f.escalas === 0 ? 'Directo' : f.escalas === 1 ? '1 escala' : f.escalas + ' escalas';
      html += `<div class="salma-result-card"><div class="salma-result-card-body">
        <div class="salma-result-card-name">✈ ${this._esc(f.aerolinea || '')}</div>
        <div class="salma-result-card-sub">${dep} → ${arr} · ${stops}</div>
        <div class="salma-result-card-price">${this._esc(f.precio || '')}</div>
      </div></div>`;
    }
    html += '</div>';
    if (data.enlace_reserva) html += `<a class="salma-goto-directions" href="${data.enlace_reserva}" target="_blank" rel="noopener" style="margin-top:6px">✈️ Ver más en Skyscanner</a>`;
    sec.innerHTML = html;
    c.appendChild(sec);
  },

  _renderGoToVisa(data) {
    const c = this._getGoToContainer();
    if (!c || !data.results?.length) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    let html = '<div class="salma-goto-section-title">Visado — verificación online</div>';
    html += '<div class="salma-goto-visa-online">';
    for (const r of data.results.slice(0, 2)) {
      html += `<div style="margin-bottom:4px"><a href="${r.url}" target="_blank" rel="noopener">${this._esc(r.titulo || r.url)}</a></div>`;
      if (r.snippet) html += `<div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:6px">${this._esc(r.snippet.slice(0, 150))}</div>`;
    }
    html += '</div>';
    sec.innerHTML = html;
    c.appendChild(sec);
  },

  _renderGoToWeather(data) {
    const c = this._getGoToContainer();
    if (!c || !data.current) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    let forecastHtml = '';
    if (data.forecast?.length) {
      forecastHtml = '<div class="salma-goto-weather-forecast">';
      for (const d of data.forecast.slice(0, 3)) {
        const date = d.date ? new Date(d.date + 'T12:00:00').toLocaleDateString('es', { weekday: 'short' }) : '';
        forecastHtml += `<div class="salma-goto-weather-day">${date}<br>${d.max_c}°/${d.min_c}°</div>`;
      }
      forecastHtml += '</div>';
    }
    sec.innerHTML = `<div class="salma-goto-section-title">Clima${data.location ? ' en ' + this._esc(data.location) : ''}</div>
      <div class="salma-goto-weather">
        <div class="salma-goto-weather-temp">${data.current.temp_c}°</div>
        <div><div class="salma-goto-weather-desc">${this._esc(data.current.description || '')}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.35)">Humedad ${data.current.humidity}% · Viento ${data.current.wind_kmph} km/h</div></div>
      </div>${forecastHtml}`;
    c.appendChild(sec);
  },

  _renderGoToPlaces(data, title) {
    const c = this._getGoToContainer();
    if (!c || !data.places?.length) return;
    const SALMA_API = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    let html = `<div class="salma-goto-section-title">${this._esc(title)}</div><div class="salma-result-grid">`;
    for (const p of data.places.slice(0, 4)) {
      const stars = p.rating ? '⭐ ' + p.rating.toFixed(1) + (p.reviews ? ' (' + p.reviews.toLocaleString() + ')' : '') : '';
      const openBadge = p.open_now === true ? '<span class="salma-open-badge">Abierto</span>' : p.open_now === false ? '<span class="salma-closed-badge">Cerrado</span>' : '';
      html += `<div class="salma-result-card">
        ${p.photo_ref ? `<img src="${SALMA_API}/photo?ref=${encodeURIComponent(p.photo_ref)}&maxwidth=400" alt="${this._esc(p.name)}" loading="lazy" onerror="this.style.display='none'">` : ''}
        <div class="salma-result-card-body">
          <div class="salma-result-card-name">${this._esc(p.name)} ${openBadge}</div>
          <div class="salma-result-card-sub">${this._esc(p.address || '')}</div>
          ${stars ? `<div class="salma-result-card-rating">${stars}</div>` : ''}
          ${p.maps_link ? `<a class="salma-result-card-cta" href="${p.maps_link}" target="_blank" rel="noopener">Ver en Maps</a>` : ''}
        </div></div>`;
    }
    html += '</div>';
    sec.innerHTML = html;
    c.appendChild(sec);
  },

  _renderGoToRoutes(data) {
    const c = this._getGoToContainer();
    if (!c) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    if (data.viable === false) {
      sec.innerHTML = `<div class="salma-goto-section-title">Por tierra</div><div class="salma-goto-visa-kv">${this._esc(data.message || 'Solo avión')}</div>`;
    } else if (data.results?.length) {
      let html = '<div class="salma-goto-section-title">Cómo llegar por tierra</div><div class="salma-goto-routes-list">';
      for (const r of data.results) {
        html += `<div class="salma-goto-route-item"><a href="${r.url}" target="_blank" rel="noopener">${this._esc(r.titulo || r.url)}</a>`;
        if (r.snippet) html += `<p>${this._esc(r.snippet.slice(0, 120))}</p>`;
        html += '</div>';
      }
      html += '</div>';
      sec.innerHTML = html;
    }
    if (sec.innerHTML) c.appendChild(sec);
  },

  _renderGoToNews(data) {
    const c = this._getGoToContainer();
    if (!c || !data.results?.length) return;
    const sec = document.createElement('div');
    sec.className = 'salma-goto-section';
    let html = '<div class="salma-goto-section-title">Noticias viajeros</div><div class="salma-goto-news-list">';
    for (const r of data.results.slice(0, 3)) {
      html += `<div class="salma-goto-news-item"><a href="${r.url}" target="_blank" rel="noopener">${this._esc(r.titulo || r.url)}</a></div>`;
    }
    html += '</div>';
    sec.innerHTML = html;
    c.appendChild(sec);
  },

  _renderGoToResumen(data) {
    const c = this._getGoToContainer();
    if (!c || !data.text) return;
    const el = document.createElement('div');
    el.className = 'salma-goto-resumen';
    el.textContent = data.text;
    c.appendChild(el);
  },

  _renderGoToChips(data) {
    const c = this._getGoToContainer();
    if (!c || !data.chips?.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'salma-goto-chips';
    for (const chip of data.chips) {
      const btn = document.createElement('button');
      btn.className = 'salma-goto-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', () => {
        const input = document.getElementById('salma-input');
        if (input) input.value = chip.msg;
        if (typeof salma !== 'undefined' && salma.send) salma.send(chip.msg);
      });
      wrap.appendChild(btn);
    }
    c.appendChild(wrap);
  },

  // ═══ FIN "QUIERO IR A..." renderers ═══

  async _saveNoteFromBubble(text, btnEl) {
    if (!window.currentUser) {
      window._pendingSaveNote = { text, btnEl };
      if (typeof openModal === 'function') openModal('register');
      return;
    }
    if (typeof notasManager === 'undefined') return;

    // Feedback inmediato
    if (btnEl) {
      btnEl.innerHTML = 'Guardando...';
      btnEl.disabled = true;
    }

    // País opcional — si se detecta, bien; si no, se guarda sin país
    const country = (typeof detectCountryInMessage === 'function' ? detectCountryInMessage(text) : null)
      || (this.currentRoute ? normalizeCountry(this.currentRoute.country) : null);

    try {
      // Extraer imágenes markdown ![alt](url) y limpiar del texto
      const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
      const imageUrls = [];
      let match;
      while ((match = imgRegex.exec(text)) !== null) {
        imageUrls.push({ alt: match[1], url: match[2] });
      }
      // Capturar fotos PLAN inyectadas en el DOM (no están en el texto raw)
      const bubble = btnEl?.closest('.msg-salma');
      if (bubble) {
        bubble.querySelectorAll('.plan-stop-photo').forEach(img => {
          if (img.src && !imageUrls.some(i => i.url === img.src)) {
            imageUrls.push({ alt: img.alt || 'foto', url: img.src });
          }
        });
      }
      const cleanText = text.replace(imgRegex, '').replace(/\n{3,}/g, '\n\n').trim();

      // Convertir enlaces markdown [texto](url) → texto (url) para que linkify los pille
      const linkifiedText = cleanText.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1 $2');

      // Subir imágenes a R2 en background
      const files = [];
      const api = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
      const uid = window.currentUser.uid;
      for (const img of imageUrls) {
        try {
          const resp = await fetch(img.url);
          if (!resp.ok) continue;
          const blob = await resp.blob();
          const fileName = (img.alt || 'foto').replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
          const formData = new FormData();
          formData.append('file', new File([blob], fileName, { type: blob.type || 'image/jpeg' }));
          formData.append('uid', uid);
          formData.append('docId', 'nota_' + Date.now());
          const upRes = await fetch(api + '/upload-doc', { method: 'POST', body: formData });
          if (upRes.ok) {
            const { key, url } = await upRes.json();
            files.push({ fileName, fileType: 'image/jpeg', r2Key: key, downloadURL: url });
          }
        } catch (e) { console.warn('Error subiendo imagen a R2:', e); }
      }

      await notasManager.create({
        texto: linkifiedText,
        countryCode: country?.code || null,
        countryName: country?.name || null,
        emoji: country?.emoji || null,
        files,
        origen: 'chat',
        fuente: 'guardar_burbuja'
      });
      if (btnEl) {
        btnEl.innerHTML = '&#x2713; Guardado';
        btnEl.style.background = 'rgba(92,184,92,.2)';
        btnEl.style.borderColor = 'rgba(92,184,92,.4)';
        btnEl.style.color = '#5cb85c';
      }
    } catch (err) {
      console.error('Error guardando nota desde chat:', err);
      if (btnEl) {
        btnEl.innerHTML = '&#x2717; Error';
        btnEl.style.background = 'rgba(217,83,79,.2)';
        btnEl.style.borderColor = 'rgba(217,83,79,.4)';
        btnEl.style.color = '#d9534f';
        btnEl.disabled = false;
      }
    }
  },


  _addStreamBubble() {
    // Reusar la burbuja de loading si existe (evita dos burbujas)
    const existing = document.getElementById('salma-loading');
    if (existing) {
      existing.id = 'salma-stream-msg';
      const body = existing.querySelector('.msg-body-salma');
      if (body) {
        body.innerHTML = '';
        body.id = 'salma-stream-text';
      }
      // Limpiar intervalos de loading
      if (this._loadingInterval) { clearInterval(this._loadingInterval); this._loadingInterval = null; }
      if (this._retryTimer) { clearTimeout(this._retryTimer); this._retryTimer = null; }
      return document.getElementById('salma-stream-text');
    }
    // Fallback: crear nueva burbuja
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
      const rawText = bodyEl?.dataset.raw || bodyEl?.textContent || '';
      // Añadir botón guardar nota solo si hay contenido relevante
      if (rawText.length > 150 && !el.querySelector('.msg-save-note')) {
        const btn = document.createElement('button');
        btn.className = 'msg-save-note';
        btn.innerHTML = '&#x1F516; Guardar nota';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._saveNoteFromBubble(rawText, btn);
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
        const rawText = txt?.dataset.raw || txt?.textContent || '';
        const textContent = txt ? txt.textContent : '';
        if (txt) txt.removeAttribute('id');
        el.removeAttribute('id');
        // Flush TTS streaming (encola lo que quede en el buffer)
        if (this._ttsStreaming) {
          this._ttsFlush();
        } else if (this._voiceOn && textContent) {
          // Fallback: si no estaba en modo streaming, hablar todo
          const t = textContent;
          setTimeout(() => this.salmaSpeak(t), 50);
        }
        // Botón guardar nota solo si hay contenido relevante
        if (rawText.length > 150 && !el.querySelector('.msg-save-note')) {
          const btn = document.createElement('button');
          btn.className = 'msg-save-note';
          btn.innerHTML = '&#x1F516; Guardar nota';
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._saveNoteFromBubble(rawText, btn);
          });
          el.appendChild(btn);
        }
        // Enriquecer con fotos si es respuesta PLAN
        const bodyEl = txt || el.querySelector('.msg-body-salma');
        if (bodyEl && this._isPlanBubble(bodyEl)) {
          this._enrichPlanPhotos(bodyEl);
        }
      }
    }
  },

  // ═══ PLAN PHOTOS — Enriquecer respuestas PLAN con fotos inline ═══
  _isPlanBubble(bodyEl) {
    return /D[ií]a\s+\d/.test(bodyEl.textContent);
  },

  _extractPlanStops(bodyEl) {
    const stops = [];
    const html = bodyEl.innerHTML;
    // Buscar <strong>Nombre</strong> que NO sean headers de día
    const re = /<strong>(?!D[ií]a\s+\d)((?:(?!<\/strong>).)+)<\/strong>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const name = m[1].replace(/<[^>]*>/g, '').trim();
      if (name.length < 3 || /salma|gu[ií]a|dónde comer|donde comer/i.test(name)) continue;
      // Buscar URL Maps cercana para extraer query con ciudad
      const afterStr = html.slice(m.index, m.index + 500);
      const mapsMatch = afterStr.match(/maps\/search\/([^"&<]+)/);
      const searchQuery = mapsMatch
        ? decodeURIComponent(mapsMatch[1].replace(/\+/g, ' '))
        : name;
      // Skip si ya hay <img> justo antes (dedup con buscar_foto)
      const beforeStr = html.slice(Math.max(0, m.index - 200), m.index);
      if (/<img\s[^>]*>[\s<br>]*$/i.test(beforeStr)) continue;
      stops.push({ name, searchQuery });
    }
    return stops;
  },

  async _enrichPlanPhotos(bodyEl) {
    if (!window.SALMA_API) return;
    const stops = this._extractPlanStops(bodyEl);
    if (!stops.length) return;
    const API = window.SALMA_API;

    // Encontrar elementos <strong> de paradas para inyectar placeholders
    const strongEls = Array.from(bodyEl.querySelectorAll('strong'));
    const placeholderMap = new Map();
    for (const s of stops) {
      const matchEl = strongEls.find(el => el.textContent.trim() === s.name);
      if (!matchEl) continue;
      // Insertar placeholder shimmer antes del <strong>
      const ph = document.createElement('div');
      ph.className = 'plan-photo-placeholder';
      matchEl.parentElement.insertBefore(ph, matchEl);
      placeholderMap.set(s.name, ph);
    }

    // Fetch fotos en paralelo
    const results = await Promise.allSettled(
      stops.map(s =>
        fetch(`${API}/photo?name=${encodeURIComponent(s.searchQuery)}&json=1`)
          .then(r => r.ok ? r.json() : null)
          .then(data => ({ name: s.name, url: data?.url || null }))
          .catch(() => ({ name: s.name, url: null }))
      )
    );

    // Reemplazar placeholders con imágenes reales
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { name, url } = r.value;
      const ph = placeholderMap.get(name);
      if (!ph) continue;
      if (!url) { ph.remove(); continue; }
      const img = document.createElement('img');
      img.alt = name;
      img.className = 'plan-stop-photo';
      img.onload = () => ph.replaceWith(img);
      img.onerror = () => ph.remove();
      img.src = url;
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
        No tienes el GPS activo. Actívalo y te digo.<br><br>
        <button class="btn-geo-retry" onclick="salma.retryGeolocation(this)">📍 Activar ubicación</button>
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
        // Reenviar el mensaje original automáticamente
        if (this._pendingGeoMessage) {
          const pendingMsg = this._pendingGeoMessage;
          this._pendingGeoMessage = null;
          setTimeout(() => this.send(pendingMsg), 400);
        }
      },
      (err) => {
        if (btn) btn.textContent = '📍 Activar ubicación';
        this._geoBlocked = (err.code === 1);
        if (err.code === 1 && btn) {
          btn.insertAdjacentHTML('afterend', '<br><small style="opacity:0.6">Permiso denegado. Ve a Ajustes del navegador → Ubicación → Permitir.</small>');
        }
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
    'Organizando el itinerario...', 'Preguntando a los locales...',
    'Buscando restaurantes de verdad...', 'Verificando coordenadas...',
  ],
  _motivationalPhrases: [
    'Esto va a merecer la pena', 'Casi lo tengo',
    'Un poco más y lo tienes', 'Preparando algo bueno',
    'Va quedando bonito', 'Estoy en ello, tranqui',
    'Que no cunda el pánico', 'Tú relájate',
  ],
  _loadingPhrasesSimple: [
    'Un momento...', 'Dame un segundo...', 'Ahí voy...',
    'Déjame ver...', 'Lo miro...',
  ],
  _isRouteMsg(msg) {
    return /ruta|itinerario|días|dias|semana|viaje a |voy a |me voy a |quiero ir|visitar|recorrer|\d+\s*d[íi]/i.test(msg);
  },
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
    // Si ya existe, solo actualizar el texto de status
    const existing = document.getElementById('salma-loading');
    if (existing && customText) {
      const statusEl = document.getElementById('loading-status');
      if (statusEl) statusEl.textContent = customText;
      return existing;
    }
    this._removeLoading();
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.id = 'salma-loading';
    const phrase = customText || this._loadingPhrases[Math.floor(Math.random() * this._loadingPhrases.length)];
    const motiv = this._motivationalPhrases[Math.floor(Math.random() * this._motivationalPhrases.length)];
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text" id="loading-phrase">
          <span id="loading-status">${phrase}</span>
          <span class="loading-motiv" id="loading-motiv">${motiv}</span>
        </div>
      </div>`;
    area.appendChild(div);
    this._scrollToBottom(true);

    // Rotar frase motivadora cada 4s
    let motivIdx = 0;
    this._loadingInterval = setInterval(() => {
      motivIdx = (motivIdx + 1) % this._motivationalPhrases.length;
      const el = document.getElementById('loading-motiv');
      if (el) el.textContent = this._motivationalPhrases[motivIdx];
      // Si no hay texto custom, también rotar el status
      if (!customText) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
          const statusIdx = Math.floor(Math.random() * this._loadingPhrases.length);
          statusEl.textContent = this._loadingPhrases[statusIdx];
        }
      }
    }, 4000);

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
    if (typeof resetInputButtons === 'function') resetInputButtons();

    // Reintentar con el último mensaje
    if (this._lastMsg !== undefined) {
      this._doSend(this._lastMsg, this._lastExtra || {});
    }
  },

  _scrollToBottom(force) {
    // force=true: siempre scroll (mensaje usuario, loading inicial)
    // force=false/undefined: solo si el usuario no ha scrolleado manualmente hacia arriba
    if (!force && this._userScrolled) return;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  },

  _initScrollTracking() {
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
      const distFromBottom = document.body.scrollHeight - window.innerHeight - window.scrollY;
      const scrolledUp = window.scrollY < lastScrollY;
      lastScrollY = window.scrollY;
      if (scrolledUp && distFromBottom > 80) {
        this._userScrolled = true;
      } else if (distFromBottom < 80) {
        this._userScrolled = false;
      }
    }, { passive: true });
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
      message: msg,
      history: this._history || [],
      user_location: this._userLocation || null,
      country: this._copilotCountry || '',
    };

    let streamCompleted = false;
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
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.done) { streamDone = true; break; }
            const delta = parsed.t || '';
            if (delta) { fullText += delta; if (onChunk) onChunk(fullText); }
          } catch {}
        }
      }

      streamCompleted = true;
      // Actualizar historial
      this._history.push({ role: 'user', content: msg });
      this._history.push({ role: 'assistant', content: fullText });
      if (this._history.length > 20) this._history = this._history.slice(-20);

    } catch (e) {
      if (!streamCompleted && onChunk) onChunk('Error conectando con Salma. Inténtalo de nuevo.');
    }
  }
};

// Exponer globalmente
window.salma = salma;

// Auto-inicializar cámara (DOM ya está listo porque los scripts van al final del body)
salma._initCameraBtn();
salma._initScrollTracking();
