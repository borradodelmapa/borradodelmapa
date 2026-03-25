/**
 * destinos.js — JS ligero para páginas de destino
 *
 * Funciones:
 * 1. Header auth (avatar dinámico con Firebase)
 * 2. Chat flotante con Salma (FAB + popup)
 * 3. SSE streaming simplificado
 */

(function() {
  'use strict';

  const DESTINO = window.DESTINO || {};
  const API = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';

  // ═══ HEADER AUTH ═══

  function initAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) return;

    const $actions = document.getElementById('header-actions');
    const $avatar = document.getElementById('btn-avatar');

    firebase.auth().onAuthStateChanged(user => {
      if (!$actions) return;

      const helpBtn = '<button class="app-help-btn" id="btn-help" title="¿Qué puede hacer Salma?">?</button>';

      if (user) {
        const initial = (user.displayName || user.email || '?')[0].toUpperCase();
        $actions.innerHTML = helpBtn +
          `<button class="coins-btn" title="Salma Coins"><span class="coins-icon-circle">S</span> 0</button>` +
          `<div class="app-avatar" id="btn-avatar" title="Mis Viajes">${initial}</div>`;
        document.getElementById('btn-avatar')?.addEventListener('click', () => {
          window.location.href = '/?state=viajes';
        });
        // Long press avatar → logout
        let pressTimer;
        const av = document.getElementById('btn-avatar');
        if (av) {
          av.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) firebase.auth().signOut();
          });
        }
      } else {
        $actions.innerHTML = helpBtn +
          `<div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>`;
        document.getElementById('btn-avatar')?.addEventListener('click', () => {
          window.location.href = '/?login=1';
        });
      }

      // Help button → show info (mismo modal que index.html)
      document.getElementById('btn-help')?.addEventListener('click', () => {
        const existing = document.querySelector('.salma-info-overlay');
        if (existing) { existing.remove(); return; }
        const overlay = document.createElement('div');
        overlay.className = 'salma-info-overlay';
        overlay.style.display = 'flex';
        overlay.innerHTML = `
          <div class="salma-info-modal">
            <button class="salma-info-close" onclick="this.closest('.salma-info-overlay').remove()">&times;</button>
            <div class="salma-info-hero">
              <div class="salma-info-hero-line">Ahorro de tiempo al viajero</div>
              <div class="salma-info-hero-line">Asistente de viajes personal</div>
              <div class="salma-info-hero-big">Generador de rutas</div>
            </div>
            <div class="salma-info-list">
              <div class="salma-info-item done">Rutas dia a dia con mapa</div>
              <div class="salma-info-item done">Vuelos con precios reales</div>
              <div class="salma-info-item done">Hoteles con disponibilidad</div>
              <div class="salma-info-item done">Alquiler de coches</div>
              <div class="salma-info-item done">Restaurantes cerca</div>
              <div class="salma-info-item done">Info del destino (visa, vacunas, moneda)</div>
              <div class="salma-info-item done">Presupuesto desglosado</div>
              <div class="salma-info-item done">Plan B si llueve</div>
              <div class="salma-info-item done">Compartir guia por link</div>
              <div class="salma-info-item soon">Trenes y buses</div>
              <div class="salma-info-item soon">Audio guia en ruta</div>
              <div class="salma-info-item soon">Salma te acompana durante el viaje</div>
            </div>
          </div>`;
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
        document.body.appendChild(overlay);
      });
    });
  }

  // ═══ CHAT INLINE ═══

  const $body = document.getElementById('salma-chat-body');
  const $input = document.getElementById('salma-chat-input');
  const $send = document.getElementById('salma-chat-send');
  const $chips = document.getElementById('salma-chat-chips');

  let streaming = false;
  let chatHistory = [];

  // Chips
  if ($chips) {
    $chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.salma-chip');
      if (!chip) return;
      const msg = chip.dataset.msg;
      if (msg) sendMessage(msg);
    });
  }

  // Send
  if ($send) $send.addEventListener('click', () => {
    const msg = $input?.value?.trim();
    if (msg) sendMessage(msg);
  });

  if ($input) $input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const msg = $input.value.trim();
      if (msg) sendMessage(msg);
    }
  });

  // ═══ MESSAGES ═══

  function miniMarkdown(text) {
    let raw = text || '';
    // Extraer imágenes markdown ANTES del escape
    const images = [];
    raw = raw.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_, alt, url) => {
      const idx = images.length;
      images.push('<img src="' + url + '" alt="' + alt + '" style="width:100%;max-width:280px;border-radius:8px;margin:6px 0;display:block;" loading="lazy">');
      return '%%IMG' + idx + '%%';
    });
    // Escape HTML
    let html = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // URLs → enlaces clicables
    html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener" style="color:var(--dorado);word-break:break-all;">$1</a>');
    // Teléfonos internacionales
    html = html.replace(/(\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{2,4}[ .-]?\d{2,4}[ .-]?\d{0,4})/g, (match) => {
      const clean = match.replace(/[\s.-]/g, '').trim();
      return '<a href="tel:' + clean + '">' + match.trim() + '</a>';
    });
    // **negrita**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // *cursiva*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Restaurar imágenes
    images.forEach((img, i) => { html = html.replace('%%IMG' + i + '%%', img); });
    // Saltos de línea
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function scrollToChat() {
    const salmaSection = document.querySelector('.destino-salma-section');
    if (salmaSection) salmaSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function addBubble(text, isUser) {
    const div = document.createElement('div');
    div.className = 'salma-chat-bubble' + (isUser ? ' user' : '');
    div.innerHTML = isUser ? (text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;') : miniMarkdown(text);
    $body.appendChild(div);
    $body.scrollTop = $body.scrollHeight;
    scrollToChat();
    return div;
  }

  function addStreamBubble() {
    const div = document.createElement('div');
    div.className = 'salma-chat-bubble streaming';
    div.textContent = '...';
    $body.appendChild(div);
    $body.scrollTop = $body.scrollHeight;
    scrollToChat();
    return div;
  }

  // ═══ SEND + SSE ═══

  // Limpiar texto de marcadores de ruta
  function cleanRouteText(text) {
    if (!text) return text;
    const marker = text.indexOf('SALMA_ROUTE');
    if (marker !== -1) return text.substring(0, marker).trim();
    return text.replace(/[\n.][ ]?SAL[MA_ROUTE]*$/, '').trim();
  }

  function sendMessage(text) {
    if (streaming) return;
    streaming = true;

    addBubble(text, true);
    chatHistory.push({ role: 'user', content: text });
    if ($input) $input.value = '';

    const streamEl = addStreamBubble();

    const contextPrefix = DESTINO.nombre ? `[Contexto: el usuario está en la página de ${DESTINO.nombre}${DESTINO.pais ? ', ' + DESTINO.pais : ''}]\n\n` : '';
    const body = {
      message: contextPrefix + text,
      history: chatHistory.slice(-10),
      stream: true
    };

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => {
      const ct = res.headers.get('content-type') || '';

      // JSON response
      if (ct.includes('application/json')) {
        return res.json().then(data => {
          streamEl.remove();
          const reply = cleanRouteText(data.reply) || 'No he podido responder, prueba de nuevo.';
          addBubble(reply, false);
          chatHistory.push({ role: 'assistant', content: reply });
          streaming = false;
        });
      }

      // SSE stream — mismo sistema que el index
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let resolved = false;
      let textDone = false;
      let draftSent = false;

      function processLines() {
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const evt = JSON.parse(jsonStr);

            // DONE — final con ruta verificada
            if (evt.done) {
              streamEl.remove();
              resolved = true;
              const reply = cleanRouteText(evt.reply || fullText);
              if (reply) {
                addBubble(reply, false);
                chatHistory.push({ role: 'assistant', content: reply });
              }
              // Renderizar ruta completa
              if (evt.route && evt.route.stops && typeof guideRenderer !== 'undefined') {
                const area = document.getElementById('chat-area') || $body;
                // Crear chat-area si no existe
                if (!document.getElementById('chat-area')) {
                  const div = document.createElement('div');
                  div.id = 'chat-area';
                  $body.parentElement.insertBefore(div, $body.nextSibling);
                }
                try {
                  guideRenderer.render(evt.route, {});
                  // Scroll a la guía
                  const gc = document.querySelector('.guide-card');
                  if (gc) setTimeout(() => gc.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
                } catch (e) { console.warn('Error renderizando guía:', e); }
                // Limpiar historial después de ruta
                chatHistory = [];
              } else if (draftSent) {
                // Draft ya renderizado, parchear con datos verificados
                if (evt.route && typeof guideRenderer !== 'undefined') {
                  try { guideRenderer.updateVerified(evt.route); } catch (_) {}
                }
              }
              streaming = false;
              return;
            }

            // DRAFT — ruta borrador (render rápido)
            if (evt.draft && !draftSent) {
              draftSent = true;
              textDone = true;
              // Fijar burbuja de texto
              streamEl.innerHTML = miniMarkdown(cleanRouteText(fullText));
              streamEl.classList.remove('streaming');
              if (evt.route && evt.route.stops && typeof guideRenderer !== 'undefined') {
                if (!document.getElementById('chat-area')) {
                  const div = document.createElement('div');
                  div.id = 'chat-area';
                  $body.parentElement.insertBefore(div, $body.nextSibling);
                }
                try {
                  guideRenderer.render(evt.route);
                  const gc = document.querySelector('.guide-card');
                  if (gc) setTimeout(() => gc.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
                } catch (e) { console.warn('Error renderizando draft:', e); }
              }
            }

            // GENERATING / KEEPALIVE — Salma está generando JSON
            if ((evt.generating || evt.k) && !textDone) {
              textDone = true;
              streamEl.innerHTML = miniMarkdown(cleanRouteText(fullText));
              streamEl.classList.remove('streaming');
              // Mostrar loading
              const loadDiv = document.createElement('div');
              loadDiv.className = 'salma-chat-bubble streaming';
              loadDiv.id = 'salma-destino-loading';
              loadDiv.textContent = 'Generando ruta...';
              $body.appendChild(loadDiv);
              $body.scrollTop = $body.scrollHeight;
            }

            // TEXT CHUNK
            if (evt.t || evt.text) {
              fullText += evt.t || evt.text;
              if (!textDone) {
                const display = cleanRouteText(fullText);
                streamEl.innerHTML = miniMarkdown(display);
                $body.scrollTop = $body.scrollHeight;
              }
            }
          } catch (_) {}
        }
      }

      function pump() {
        reader.read().then(result => {
          if (result.value) {
            buffer += decoder.decode(result.value, { stream: true });
            try { processLines(); } catch (_) {}
          }
          if (resolved) {
            const ld = document.getElementById('salma-destino-loading');
            if (ld) ld.remove();
            return;
          }
          if (result.done) {
            if (buffer.trim()) { buffer += '\n'; try { processLines(); } catch (_) {} }
            if (!resolved) {
              streamEl.remove();
              const ld = document.getElementById('salma-destino-loading');
              if (ld) ld.remove();
              const clean = cleanRouteText(fullText);
              if (clean) {
                addBubble(clean, false);
                chatHistory.push({ role: 'assistant', content: clean });
              }
              streaming = false;
            }
            return;
          }
          pump();
        }).catch(() => {
          streamEl.remove();
          const ld = document.getElementById('salma-destino-loading');
          if (ld) ld.remove();
          if (!resolved) {
            addBubble('Error de conexión. Prueba de nuevo.', false);
            streaming = false;
          }
        });
      }
      pump();

    }).catch(() => {
      streamEl.remove();
      addBubble('Error de conexión. Prueba de nuevo.', false);
      streaming = false;
    });
  }

  // ═══ ROTATING PLACEHOLDER ═══

  function initPlaceholder() {
    // Apply to ALL inputs with data-placeholders
    document.querySelectorAll('[data-placeholders]').forEach(input => {
      const texts = (input.dataset.placeholders || '').split('|').filter(Boolean);
      if (texts.length === 0) return;
      let idx = 0;
      input.placeholder = texts[0];
      setInterval(() => {
        idx = (idx + 1) % texts.length;
        input.placeholder = texts[idx];
      }, 3000);
    });
  }

  // ═══ SHARE BUTTON ═══

  function initShare() {
    const btn = document.getElementById('destino-share');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url).then(() => {
          btn.textContent = '¡Copiado!';
          setTimeout(() => { btn.textContent = 'Compartir esta guía'; }, 2000);
        }).catch(() => {});
      }
    });
  }

  // ═══ SUBTLE CTAs ═══

  function initSubtleCTAs() {
    document.querySelectorAll('.destino-cta-subtle').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = link.dataset.salmaMsg;
        if (msg && $input) {
          $input.value = msg;
          $input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => $input.focus(), 400);
        }
      });
    });
  }

  // ═══ INDEX SEARCH + RECENT ═══

  function initIndexSearch() {
    const searchInput = document.getElementById('destino-search');
    const countriesDiv = document.getElementById('destino-countries');
    const planearBtn = document.getElementById('destino-planear');
    if (!searchInput || !countriesDiv) return;

    const allSections = countriesDiv.querySelectorAll('.destino-index-continent');

    // Filtrar países mientras escribe
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!q) {
        countriesDiv.querySelectorAll('.destino-index-card').forEach(c => c.style.display = '');
        allSections.forEach(s => s.style.display = '');
        return;
      }
      allSections.forEach(s => {
        const cards = s.querySelectorAll('.destino-index-card');
        let visible = 0;
        cards.forEach(c => {
          const name = (c.querySelector('.destino-index-card-name')?.textContent || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          c.style.display = name.includes(q) ? '' : 'none';
          if (name.includes(q)) visible++;
        });
        s.style.display = visible > 0 ? '' : 'none';
      });
    });

    // Send → app con query
    if (planearBtn) {
      planearBtn.addEventListener('click', () => {
        const q = searchInput.value.trim();
        if (q) window.location.href = '/?q=' + encodeURIComponent(q);
      });
    }

    // Enter → planear viaje
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.location.href = '/?q=' + encodeURIComponent(q);
      }
    });
  }

  function initRecentGuides() {
    const recentSection = document.getElementById('destino-recent');
    const recentGrid = document.getElementById('destino-recent-grid');
    if (!recentSection || !recentGrid) return;

    // Track current page visit
    if (DESTINO.nombre && window.location.pathname.includes('/destinos/') && !window.location.pathname.endsWith('/')) {
      try {
        const recent = JSON.parse(localStorage.getItem('bdm_recent') || '[]');
        const entry = { name: DESTINO.nombre, url: window.location.pathname, ts: Date.now() };
        const filtered = recent.filter(r => r.url !== entry.url);
        filtered.unshift(entry);
        localStorage.setItem('bdm_recent', JSON.stringify(filtered.slice(0, 8)));
      } catch (_) {}
    }

    // Show recent on index page
    try {
      const recent = JSON.parse(localStorage.getItem('bdm_recent') || '[]');
      if (recent.length === 0) return;
      recentGrid.innerHTML = recent.slice(0, 6).map(r => `
        <a href="${r.url}" class="destino-index-card">
          <span class="destino-index-card-name">${r.name}</span>
        </a>
      `).join('');
      recentSection.style.display = '';
    } catch (_) {}
  }

  // ═══ MIC (Speech Recognition) — sistema completo con auto-send ═══

  function initMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      document.querySelectorAll('.salma-mic, .app-mic').forEach(b => b.style.display = 'none');
      return;
    }

    let listening = false;
    let activeMicBtn = null;
    let activeRec = null;
    let activeInputEl = null;
    let accumulatedText = '';
    let gotResult = false;

    function resetMicState() {
      listening = false;
      if (activeMicBtn) activeMicBtn.classList.remove('listening');
      if (activeInputEl) activeInputEl.classList.remove('mic-active');
      activeMicBtn = null;
      activeInputEl = null;
      activeRec = null;
      accumulatedText = '';
      gotResult = false;
    }

    function stopAndSend() {
      listening = false;
      try { if (activeRec) activeRec.stop(); } catch (_) {}
      const inputEl = activeInputEl;
      const hadResult = gotResult;
      resetMicState();
      if (hadResult && inputEl && inputEl.value.trim()) {
        const msg = inputEl.value.trim();
        // Index page search → redirect to main app
        if (inputEl.id === 'destino-search') {
          window.location.href = '/?q=' + encodeURIComponent(msg);
        } else {
          // Country/destination chat → send via Salma
          sendMessage(msg);
        }
      }
    }

    function createRec(micBtn, inputEl) {
      const rec = new SpeechRecognition();
      rec.lang = 'es-ES';
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        listening = true;
        micBtn.classList.add('listening');
        inputEl.classList.add('mic-active');
      };

      rec.onresult = (event) => {
        gotResult = true;
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        const sep = accumulatedText ? ' ' : '';
        inputEl.value = accumulatedText + sep + current;
      };

      rec.onend = () => {
        if (!listening) return;
        if (inputEl.value.trim()) accumulatedText = inputEl.value.trim();
        setTimeout(() => {
          if (!listening) return;
          try {
            const newRec = createRec(micBtn, inputEl);
            activeRec = newRec;
            newRec.start();
          } catch (_) { stopAndSend(); }
        }, 200);
      };

      rec.onerror = (event) => {
        if (event.error === 'aborted' || event.error === 'no-speech') return;
        listening = false;
        resetMicState();
      };

      return rec;
    }

    function startListening(micBtn) {
      const bar = micBtn.closest('.salma-chat-input-bar');
      const inputEl = bar ? bar.querySelector('input, textarea') : null;
      if (!inputEl) return;

      activeMicBtn = micBtn;
      activeInputEl = inputEl;
      accumulatedText = '';
      gotResult = false;

      try {
        const rec = createRec(micBtn, inputEl);
        activeRec = rec;
        rec.start();
      } catch (e) {
        resetMicState();
        setTimeout(() => {
          try {
            const rec = createRec(micBtn, inputEl);
            activeRec = rec;
            rec.start();
          } catch (_) { resetMicState(); }
        }, 300);
      }
    }

    function handleMicTap(e) {
      const micBtn = e.target.closest('.salma-mic, .app-mic');
      if (!micBtn) return;
      e.preventDefault();
      e.stopPropagation();

      if (listening) {
        stopAndSend();
        return;
      }
      startListening(micBtn);
    }

    // Block long-press context menu on mic
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.salma-mic, .app-mic')) e.preventDefault();
    });

    // touchend for instant mobile response
    document.addEventListener('touchend', handleMicTap);
    // click as fallback for desktop
    document.addEventListener('click', (e) => {
      if (e.target.closest('.salma-mic, .app-mic') && 'ontouchend' in window) return;
      handleMicTap(e);
    });
  }

  // ═══ COMMUNITY ROUTES ═══

  function initCommunityRoutes() {
    const section = document.getElementById('destino-community');
    const grid = document.getElementById('destino-community-grid');
    if (!section || !grid || !DESTINO.pais) return;
    if (typeof firebase === 'undefined' || !firebase.firestore) return;

    const db = firebase.firestore();
    db.collection('public_guides')
      .where('destino', '==', DESTINO.pais)
      .limit(20)
      .get()
      .then(snap => {
        if (snap.empty) { console.log('Community: 0 results for', DESTINO.pais); return; }
        let html = '';
        snap.forEach(doc => {
          const d = doc.data();
          const slug = d.slug || doc.id;
          const photo = d.cover_image || '';
          const title = d.nombre || 'Ruta';
          const days = d.num_dias || '?';
          html += `
            <a href="/${slug}" class="destino-community-card">
              ${photo ? `<div class="destino-community-img" style="background-image:url('${photo}')"></div>` : ''}
              <div class="destino-community-body">
                <div class="destino-community-title">${title}</div>
                <div class="destino-community-meta">${days} días</div>
              </div>
            </a>`;
        });
        grid.innerHTML = html;
        section.style.display = '';
      })
      .catch(err => { console.log('Community error:', err.message); });
  }

  // ═══ INIT ═══
  initAuth();
  initPlaceholder();
  initShare();
  initSubtleCTAs();
  initIndexSearch();
  initRecentGuides();
  initMic();
  initCommunityRoutes();

})();
