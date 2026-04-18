// translator.js — Traductor simultáneo push-to-talk
// Depende de: SALMA_API (worker), showToast (app.js)
// Voz: ES via ElevenLabs (/tts), resto via speechSynthesis del navegador

(function () {
  'use strict';

  const LANGS = [
    // Europa — románicas
    { code: 'es',    bcp: 'es-ES', name: 'Español',            flag: '🇪🇸' },
    { code: 'en',    bcp: 'en-US', name: 'Inglés',             flag: '🇬🇧' },
    { code: 'fr',    bcp: 'fr-FR', name: 'Francés',            flag: '🇫🇷' },
    { code: 'it',    bcp: 'it-IT', name: 'Italiano',           flag: '🇮🇹' },
    { code: 'pt',    bcp: 'pt-PT', name: 'Portugués',          flag: '🇵🇹' },
    { code: 'ca',    bcp: 'ca-ES', name: 'Catalán',            flag: '🏴' },
    { code: 'ro',    bcp: 'ro-RO', name: 'Rumano',             flag: '🇷🇴' },
    // Europa — germánicas / nórdicas
    { code: 'de',    bcp: 'de-DE', name: 'Alemán',             flag: '🇩🇪' },
    { code: 'nl',    bcp: 'nl-NL', name: 'Holandés',           flag: '🇳🇱' },
    { code: 'da',    bcp: 'da-DK', name: 'Danés',              flag: '🇩🇰' },
    { code: 'sv',    bcp: 'sv-SE', name: 'Sueco',              flag: '🇸🇪' },
    { code: 'no',    bcp: 'nb-NO', name: 'Noruego',            flag: '🇳🇴' },
    { code: 'fi',    bcp: 'fi-FI', name: 'Finlandés',          flag: '🇫🇮' },
    // Europa — eslavas y otras
    { code: 'pl',    bcp: 'pl-PL', name: 'Polaco',             flag: '🇵🇱' },
    { code: 'cs',    bcp: 'cs-CZ', name: 'Checo',              flag: '🇨🇿' },
    { code: 'hu',    bcp: 'hu-HU', name: 'Húngaro',            flag: '🇭🇺' },
    { code: 'ru',    bcp: 'ru-RU', name: 'Ruso',               flag: '🇷🇺' },
    { code: 'uk',    bcp: 'uk-UA', name: 'Ucraniano',          flag: '🇺🇦' },
    { code: 'el',    bcp: 'el-GR', name: 'Griego',             flag: '🇬🇷' },
    { code: 'tr',    bcp: 'tr-TR', name: 'Turco',              flag: '🇹🇷' },
    // Oriente Medio
    { code: 'ar',    bcp: 'ar-SA', name: 'Árabe',              flag: '🇸🇦' },
    { code: 'he',    bcp: 'he-IL', name: 'Hebreo',             flag: '🇮🇱' },
    { code: 'fa',    bcp: 'fa-IR', name: 'Persa',              flag: '🇮🇷' },
    // Sur de Asia
    { code: 'hi',    bcp: 'hi-IN', name: 'Hindi',              flag: '🇮🇳' },
    { code: 'bn',    bcp: 'bn-IN', name: 'Bengalí',            flag: '🇧🇩' },
    { code: 'ne',    bcp: 'ne-NP', name: 'Nepalí',             flag: '🇳🇵' },
    // Este de Asia
    { code: 'zh',    bcp: 'zh-CN', name: 'Chino (simplif.)',   flag: '🇨🇳' },
    { code: 'zh-TW', bcp: 'zh-TW', name: 'Chino tradicional',  flag: '🇹🇼' },
    { code: 'ja',    bcp: 'ja-JP', name: 'Japonés',            flag: '🇯🇵' },
    { code: 'ko',    bcp: 'ko-KR', name: 'Coreano',            flag: '🇰🇷' },
    // Sudeste asiático
    { code: 'th',    bcp: 'th-TH', name: 'Tailandés',          flag: '🇹🇭' },
    { code: 'vi',    bcp: 'vi-VN', name: 'Vietnamita',         flag: '🇻🇳' },
    { code: 'ms',    bcp: 'ms-MY', name: 'Malayo',             flag: '🇲🇾' },
    { code: 'id',    bcp: 'id-ID', name: 'Indonesio',          flag: '🇮🇩' },
    { code: 'fil',   bcp: 'fil-PH',name: 'Filipino',           flag: '🇵🇭' },
    // África
    { code: 'af',    bcp: 'af-ZA', name: 'Afrikáans',          flag: '🇿🇦' },
  ];

  const API = (typeof SALMA_API !== 'undefined' && SALMA_API) || 'https://salma-api.paco-defoto.workers.dev';
  const LS_PREFS = 'bdm_translator_langs';
  const LS_ELEVEN_DOWN = 'bdm_11labs_out_until';

  const state = {
    langA: 'es',
    langB: 'en',
    recognition: null,
    recognizing: false,
    recognizingSide: null,
    recognizingFromCode: null,
    userStopped: false,
    accumulated: '',
    interim: '',
    lastFinalIdx: 0, // fix móvil: trackear qué finales ya acumulé (no fiarme de e.resultIndex)
    stopTimer: null, // failsafe si onend no dispara tras abort()
    history: [], // { from, to, textFrom, textTo }
  };

  // ─── Helpers ───
  const getLang = (code) => LANGS.find(l => l.code === code) || LANGS[0];
  const esc = (s) => String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  function loadPrefs() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_PREFS) || '{}');
      if (s.a && LANGS.find(l => l.code === s.a)) state.langA = s.a;
      if (s.b && LANGS.find(l => l.code === s.b)) state.langB = s.b;
    } catch (_) {}
  }
  function savePrefs() {
    try { localStorage.setItem(LS_PREFS, JSON.stringify({ a: state.langA, b: state.langB })); } catch (_) {}
  }
  function isElevenDown() {
    try { return parseInt(localStorage.getItem(LS_ELEVEN_DOWN) || '0') > Date.now(); } catch (_) { return false; }
  }
  function markElevenDown() {
    try { localStorage.setItem(LS_ELEVEN_DOWN, String(Date.now() + 12 * 3600 * 1000)); } catch (_) {}
  }

  // ─── TTS cascada: ES→ElevenLabs Salma · resto→Google Cloud TTS · fallback→navegador ───
  let _currentAudio = null;
  let _playingBtn = null;

  const PLAY_ICON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>';
  const STOP_ICON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>';

  function setPlayingBtn(btn) {
    if (_playingBtn && _playingBtn !== btn) {
      _playingBtn.innerHTML = PLAY_ICON_SVG;
      _playingBtn.classList.remove('translator-replay--playing');
    }
    _playingBtn = btn || null;
    if (btn) {
      btn.innerHTML = STOP_ICON_SVG;
      btn.classList.add('translator-replay--playing');
    }
  }

  function clearPlayingBtn() {
    if (_playingBtn) {
      _playingBtn.innerHTML = PLAY_ICON_SVG;
      _playingBtn.classList.remove('translator-replay--playing');
      _playingBtn = null;
    }
  }

  function stopAllAudio() {
    if (_currentAudio) {
      try { _currentAudio.pause(); } catch (_) {}
      try { if (_currentAudio._blobUrl) URL.revokeObjectURL(_currentAudio._blobUrl); } catch (_) {}
      _currentAudio = null;
    }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (_) {}
    clearPlayingBtn();
  }

  async function playBlob(blob) {
    if (!blob || !blob.size) return false;
    try {
      const u = URL.createObjectURL(blob);
      const a = new Audio(u);
      a._blobUrl = u;
      _currentAudio = a;
      const clean = () => {
        URL.revokeObjectURL(u);
        if (_currentAudio === a) { _currentAudio = null; clearPlayingBtn(); }
      };
      a.onended = clean;
      a.onerror = clean;
      a.onpause = () => { if (a.ended) clean(); };
      await a.play();
      return true;
    } catch (_) { return false; }
  }

  async function tryElevenSalma(text) {
    if (isElevenDown()) return false;
    try {
      const res = await fetch(API + '/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        if ([401, 403, 429].includes(res.status)) markElevenDown();
        return false;
      }
      return await playBlob(await res.blob());
    } catch (_) { return false; }
  }

  async function tryGoogleTTS(text, languageCode) {
    try {
      const res = await fetch(API + '/tts-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode }),
      });
      if (!res.ok) return false;
      return await playBlob(await res.blob());
    } catch (_) { return false; }
  }

  function isSpeaking() {
    if (_currentAudio && !_currentAudio.paused && !_currentAudio.ended) return true;
    if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) return true;
    return false;
  }

  async function speak(text, langCode) {
    if (!text) return;
    // Si ya hay algo sonando, lo cortamos antes de empezar algo nuevo.
    stopAllAudio();
    const bcp = getLang(langCode).bcp;
    if (langCode === 'es') {
      if (await tryElevenSalma(text)) return;
      if (await tryGoogleTTS(text, bcp)) return;
      speakNative(text, bcp);
      return;
    }
    if (await tryGoogleTTS(text, bcp)) return;
    speakNative(text, bcp);
  }

  function speakNative(text, bcp) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = bcp;
      const voices = window.speechSynthesis.getVoices();
      const base = bcp.split('-')[0];
      const match = voices.find(v => v.lang === bcp) || voices.find(v => v.lang && v.lang.startsWith(base));
      if (match) u.voice = match;
      u.rate = 0.95;
      u.onend = () => clearPlayingBtn();
      u.onerror = () => clearPlayingBtn();
      window.speechSynthesis.speak(u);
    } catch (_) { clearPlayingBtn(); }
  }

  // ─── Speech Recognition ───
  function createRecognition(langCode) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = getLang(langCode).bcp;
    // continuous=true: aguanta silencios mientras grabamos una conversación.
    // Si el engine muere por su cuenta, en onend creamos una instancia NUEVA (no restart
    // sobre la misma) → results vacíos → imposible re-emitir finales antiguos.
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    return r;
  }

  // ─── API /translate ───
  async function translate(text, fromCode, toCode) {
    const res = await fetch(API + '/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        fromLang: getLang(fromCode).name,
        toLang: getLang(toCode).name,
      }),
    });
    if (!res.ok) throw new Error('translate ' + res.status);
    const data = await res.json();
    return (data.translated || '').trim();
  }

  // ─── UI ───
  function build() {
    const bd = document.createElement('div');
    bd.id = 'translator-backdrop';
    bd.className = 'translator-backdrop';
    bd.innerHTML = `
      <div class="translator-modal" role="dialog" aria-modal="true" aria-label="Traductor">
        <div class="translator-header">
          <div class="translator-title">Traductor</div>
          <button class="translator-close" aria-label="Cerrar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="translator-langs">
          <select class="translator-sel" id="tr-sel-a"></select>
          <button class="translator-swap" id="tr-swap" aria-label="Invertir idiomas">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          </button>
          <select class="translator-sel" id="tr-sel-b"></select>
        </div>
        <div class="translator-history" id="tr-history"></div>
        <div class="translator-mics">
          <button class="translator-mic" id="tr-mic-a" data-side="a">
            <div class="translator-mic-lang" id="tr-mic-a-lang"></div>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button class="translator-mic" id="tr-mic-b" data-side="b">
            <div class="translator-mic-lang" id="tr-mic-b-lang"></div>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(bd);
    return bd;
  }

  function fillSelect(id, selected) {
    const sel = document.getElementById(id);
    sel.innerHTML = LANGS.map(l => `<option value="${l.code}" ${l.code === selected ? 'selected' : ''}>${l.flag} ${l.name}</option>`).join('');
  }

  function updateMicLabels() {
    const la = getLang(state.langA);
    const lb = getLang(state.langB);
    const a = document.getElementById('tr-mic-a-lang');
    const b = document.getElementById('tr-mic-b-lang');
    if (a) a.textContent = la.flag + ' ' + la.name;
    if (b) b.textContent = lb.flag + ' ' + lb.name;
  }

  function renderHistory() {
    const box = document.getElementById('tr-history');
    if (!box) return;
    if (state.history.length === 0) {
      box.innerHTML = '<div class="translator-hint">Toca el micro del idioma en el que vas a hablar. Vuelve a tocarlo para parar y traducir. Puedes dejarlo grabando lo que diga otra persona y leer la traducción después.</div>';
      return;
    }
    box.innerHTML = state.history.map((h, i) => {
      const from = getLang(h.from);
      const to = getLang(h.to);
      return `
        <div class="translator-row">
          <div class="translator-msg translator-msg-from">
            <span class="translator-msg-lang">${from.flag} ${from.name}</span>
            <div class="translator-msg-text">${esc(h.textFrom)}</div>
          </div>
          <div class="translator-msg translator-msg-to">
            <span class="translator-msg-lang">${to.flag} ${to.name}</span>
            <div class="translator-msg-text translator-msg-big">${esc(h.textTo)}</div>
            <button class="translator-replay" data-idx="${i}" aria-label="Repetir">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
    box.scrollTop = box.scrollHeight;

    box.querySelectorAll('.translator-replay').forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle: si está sonando algo, paramos. Si no, reproducimos esta entrada.
        if (isSpeaking()) { stopAllAudio(); return; }
        const h = state.history[parseInt(btn.dataset.idx)];
        if (!h) return;
        setPlayingBtn(btn);
        speak(h.textTo, h.to);
      });
    });
  }

  // ─── Toggle recording (toque para empezar / toque para parar) ───
  function updateMicUI(side, recording) {
    const btn = document.getElementById('tr-mic-' + side);
    if (!btn) return;
    btn.classList.toggle('translator-mic--active', !!recording);
    const otherSide = side === 'a' ? 'b' : 'a';
    const otherBtn = document.getElementById('tr-mic-' + otherSide);
    if (otherBtn) otherBtn.classList.toggle('translator-mic--disabled', !!recording);
  }

  function showLiveTranscript() {
    const box = document.getElementById('tr-history');
    if (!box) return;
    const live = document.getElementById('tr-live');
    const text = (state.accumulated + ' ' + state.interim).trim();
    if (!live) {
      const el = document.createElement('div');
      el.id = 'tr-live';
      el.className = 'translator-live';
      el.innerHTML = `<span class="translator-live-dot"></span><span class="translator-live-text"></span>`;
      box.appendChild(el);
    }
    const el = document.getElementById('tr-live');
    if (el) {
      el.querySelector('.translator-live-text').textContent = text || 'Escuchando…';
      box.scrollTop = box.scrollHeight;
    }
  }

  function removeLiveTranscript() {
    const el = document.getElementById('tr-live');
    if (el) el.remove();
  }

  // ─── Debug logging ───
  let _startMs = 0;
  function _dlog(...args) {
    const t = _startMs ? ((Date.now() - _startMs) / 1000).toFixed(2) + 's' : '0s';
    console.log('[TR ' + t + ']', ...args);
  }
  function _summarizeResults(results) {
    const out = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      out.push({ i, final: r.isFinal, t: r[0].transcript });
    }
    return out;
  }

  // Monta todos los handlers en una instancia de SpeechRecognition.
  // Si el engine muere solo (sin userStopped), creamos INSTANCIA NUEVA y reenlazamos.
  // Así evitamos que results conserve finales antiguos y se re-emitan como nuevos (bug "hola hola hola").
  function _attachRecHandlers(rec, side, fromCode) {
    rec.onresult = (e) => {
      _dlog('onresult', {
        resultIndex: e.resultIndex,
        total: e.results.length,
        lastFinalIdx_before: state.lastFinalIdx,
        results: _summarizeResults(e.results),
      });
      let newFinal = '';
      let interimChunk = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          if (i >= state.lastFinalIdx) {
            const t = r[0].transcript.trim();
            const acc = (state.accumulated + ' ' + newFinal).trim();
            if (t && !acc.toLowerCase().endsWith(t.toLowerCase())) {
              newFinal += t + ' ';
              _dlog('  → ADD final[' + i + ']:', JSON.stringify(t));
            } else {
              _dlog('  → SKIP final[' + i + '] (dedup contenido):', JSON.stringify(t));
            }
            state.lastFinalIdx = i + 1;
          } else {
            _dlog('  → SKIP final[' + i + '] (dedup idx, lastFinalIdx=' + state.lastFinalIdx + ')');
          }
        } else {
          interimChunk += r[0].transcript + ' ';
        }
      }
      if (newFinal.trim()) {
        state.accumulated = (state.accumulated + ' ' + newFinal).trim();
      }
      state.interim = interimChunk.trim();
      _dlog('  accumulated:', JSON.stringify(state.accumulated), 'interim:', JSON.stringify(state.interim));
      showLiveTranscript();
    };

    rec.onerror = (e) => {
      _dlog('onerror', e.error, e.message || '');
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        if (typeof showToast === 'function') showToast('Permite el acceso al micrófono');
        state.userStopped = true;
      }
    };

    rec.onend = () => {
      _dlog('onend', { userStopped: state.userStopped, recognizing: state.recognizing, accumulated: state.accumulated });
      if (state.recognizing && !state.userStopped) {
        _dlog('  → creando instancia NUEVA (engine murió solo)');
        const fresh = createRecognition(fromCode);
        if (fresh) {
          state.recognition = fresh;
          state.lastFinalIdx = 0;
          _attachRecHandlers(fresh, side, fromCode);
          try { fresh.start(); _dlog('  → nueva instancia.start() OK'); return; }
          catch (err) { _dlog('  → nueva instancia.start() FALLO:', err.message); }
        } else {
          _dlog('  → createRecognition devolvió null');
        }
      }
      _dlog('  → finishRec');
      finishRec();
    };
  }

  async function startRec(side) {
    if (state.recognizing) { _dlog('startRec ignorado (ya grabando)'); return; }
    const fromCode = side === 'a' ? state.langA : state.langB;
    _startMs = Date.now();
    _dlog('startRec', { side, fromCode, bcp: getLang(fromCode).bcp });
    const rec = createRecognition(fromCode);
    if (!rec) {
      _dlog('  → SpeechRecognition no soportado');
      if (typeof showToast === 'function') showToast('Tu navegador no soporta reconocimiento de voz');
      return;
    }
    state.recognition = rec;
    state.recognizing = true;
    state.recognizingSide = side;
    state.recognizingFromCode = fromCode;
    state.userStopped = false;
    state.accumulated = '';
    state.interim = '';
    state.lastFinalIdx = 0;

    updateMicUI(side, true);
    showLiveTranscript();

    _attachRecHandlers(rec, side, fromCode);

    try { rec.start(); _dlog('  → rec.start() OK'); }
    catch (err) {
      _dlog('  → rec.start() FALLO:', err.message);
      state.recognizing = false;
      state.recognizingSide = null;
      state.recognizingFromCode = null;
      updateMicUI(side, false);
      removeLiveTranscript();
    }
  }

  async function finishRec() {
    if (state.stopTimer) { clearTimeout(state.stopTimer); state.stopTimer = null; }
    const side = state.recognizingSide;
    const fromCode = state.recognizingFromCode;
    state.recognizing = false;
    state.recognizingSide = null;
    state.recognizingFromCode = null;
    state.recognition = null;
    if (side) updateMicUI(side, false);
    removeLiveTranscript();
    const spoken = (state.accumulated + ' ' + state.interim).trim();
    _dlog('finishRec. Texto final a traducir:', JSON.stringify(spoken));
    state.accumulated = '';
    state.interim = '';
    if (!spoken || !side || !fromCode) { _dlog('  → sin texto o sin side/fromCode, fin'); return; }
    const toCode = side === 'a' ? state.langB : state.langA;
    await processTranslation(spoken, fromCode, toCode);
  }

  function stopRec() {
    if (!state.recognizing) { _dlog('stopRec ignorado (no grabando)'); return; }
    _dlog('stopRec (user tocó parar). Acumulado hasta ahora:', JSON.stringify(state.accumulated));
    state.userStopped = true;
    try { state.recognition && state.recognition.abort(); _dlog('  → abort() OK'); }
    catch (err) { _dlog('  → abort() FALLO:', err.message); }
    if (state.stopTimer) clearTimeout(state.stopTimer);
    state.stopTimer = setTimeout(() => {
      if (state.recognizing) { _dlog('stopRec failsafe 1.5s: forzando finishRec'); finishRec(); }
    }, 1500);
  }

  function toggleRec(side) {
    _dlog('toggleRec side=' + side, { recognizing: state.recognizing, recognizingSide: state.recognizingSide });
    if (state.recognizing) {
      if (state.recognizingSide === side) stopRec();
      return;
    }
    startRec(side);
  }

  async function processTranslation(text, fromCode, toCode) {
    state.history.push({ from: fromCode, to: toCode, textFrom: text, textTo: '…' });
    renderHistory();
    try {
      const t = await translate(text, fromCode, toCode);
      state.history[state.history.length - 1].textTo = t || '(vacío)';
      renderHistory();
      if (t) speak(t, toCode);
    } catch (_) {
      state.history[state.history.length - 1].textTo = '(error)';
      renderHistory();
      if (typeof showToast === 'function') showToast('Error al traducir');
    }
  }

  // ─── Open / close ───
  function open() {
    if (document.getElementById('translator-backdrop')) return;
    loadPrefs();
    const bd = build();
    fillSelect('tr-sel-a', state.langA);
    fillSelect('tr-sel-b', state.langB);
    updateMicLabels();
    renderHistory();

    const close = () => {
      stopRec();
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
      bd.remove();
      state.history = [];
    };
    bd.querySelector('.translator-close').addEventListener('click', close);
    bd.addEventListener('click', (e) => { if (e.target === bd) close(); });

    document.getElementById('tr-sel-a').addEventListener('change', (e) => {
      state.langA = e.target.value; savePrefs(); updateMicLabels();
    });
    document.getElementById('tr-sel-b').addEventListener('change', (e) => {
      state.langB = e.target.value; savePrefs(); updateMicLabels();
    });
    document.getElementById('tr-swap').addEventListener('click', () => {
      const t = state.langA; state.langA = state.langB; state.langB = t;
      fillSelect('tr-sel-a', state.langA);
      fillSelect('tr-sel-b', state.langB);
      updateMicLabels();
      savePrefs();
    });

    ['a', 'b'].forEach(side => {
      const btn = document.getElementById('tr-mic-' + side);
      if (!btn) return;
      btn.addEventListener('click', (e) => { e.preventDefault(); toggleRec(side); });
    });
  }

  window.openTranslator = open;
})();
