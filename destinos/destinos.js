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

      const helpBtn = '<button class="app-help-btn" id="btn-help" title="¿Qué puede hacer Salma?" onclick="window.location.href=\'/?help=1\'">?</button>';

      if (user) {
        const initial = (user.displayName || user.email || '?')[0].toUpperCase();
        $actions.innerHTML = helpBtn +
          `<button class="coins-btn" onclick="window.location.href='/?coins=1'" title="Salma Coins"><span class="coins-icon-circle">S</span> 0</button>` +
          `<div class="app-avatar" id="btn-avatar" title="Mis Viajes">${initial}</div>`;
        document.getElementById('btn-avatar')?.addEventListener('click', () => {
          window.location.href = '/?state=viajes';
        });
      } else {
        $actions.innerHTML = helpBtn +
          `<div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>`;
        document.getElementById('btn-avatar')?.addEventListener('click', () => {
          window.location.href = '/?login=1';
        });
      }
    });
  }

  // ═══ CHAT INLINE ═══

  const $body = document.getElementById('salma-chat-body');
  const $input = document.getElementById('salma-chat-input');
  const $send = document.getElementById('salma-chat-send');
  const $chips = document.getElementById('salma-chat-chips');

  let streaming = false;

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
    return (text || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  function addBubble(text, isUser) {
    const div = document.createElement('div');
    div.className = 'salma-chat-bubble' + (isUser ? ' user' : '');
    div.innerHTML = isUser ? (text || '').replace(/&/g,'&amp;').replace(/</g,'&lt;') : miniMarkdown(text);
    $body.appendChild(div);
    $body.scrollTop = $body.scrollHeight;
    return div;
  }

  function addStreamBubble() {
    const div = document.createElement('div');
    div.className = 'salma-chat-bubble streaming';
    div.textContent = '...';
    $body.appendChild(div);
    $body.scrollTop = $body.scrollHeight;
    return div;
  }

  // ═══ SEND + SSE ═══

  function sendMessage(text) {
    if (streaming) return;
    streaming = true;

    addBubble(text, true);
    if ($input) $input.value = '';

    const streamEl = addStreamBubble();

    // No redirect — all messages go to Salma API

    // Simple Q&A via worker — add destination context
    const contextPrefix = DESTINO.nombre ? `[Contexto: el usuario está en la página de ${DESTINO.nombre}${DESTINO.pais ? ', ' + DESTINO.pais : ''}. Responde sobre este destino de forma breve y práctica.]\n\n` : '';
    const body = {
      message: contextPrefix + text
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
          addBubble(data.reply || 'No he podido responder, prueba de nuevo.', false);
          streaming = false;
        });
      }

      // SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      function read() {
        reader.read().then(({ done, value }) => {
          if (done) {
            streamEl.remove();
            if (fullText) addBubble(fullText, false);
            streaming = false;
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const evt = JSON.parse(jsonStr);
              if (evt.done) {
                streamEl.remove();
                addBubble(evt.reply || fullText, false);
                streaming = false;
                return;
              }
              if (evt.t || evt.text) {
                fullText += evt.t || evt.text;
                streamEl.innerHTML = miniMarkdown(fullText);
                $body.scrollTop = $body.scrollHeight;
              }
            } catch (_) {}
          }

          read();
        }).catch(() => {
          streamEl.remove();
          addBubble('Error de conexión. Prueba de nuevo.', false);
          streaming = false;
        });
      }

      read();
    }).catch(() => {
      streamEl.remove();
      addBubble('Error de conexión. Prueba de nuevo.', false);
      streaming = false;
    });
  }

  // ═══ ROTATING PLACEHOLDER ═══

  function initPlaceholder() {
    if (!$input) return;
    const raw = $input.dataset.placeholders;
    if (!raw) return;
    const texts = raw.split('|').filter(Boolean);
    if (texts.length === 0) return;

    let idx = 0;
    $input.placeholder = texts[0];
    setInterval(() => {
      idx = (idx + 1) % texts.length;
      $input.style.transition = 'opacity .3s';
      $input.style.opacity = '0';
      setTimeout(() => {
        $input.placeholder = texts[idx];
        $input.style.opacity = '1';
      }, 300);
    }, 3000);
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

  // ═══ MIC (Speech Recognition) ═══

  function initMic() {
    const mic = document.getElementById('salma-mic') || document.querySelector('.salma-mic');
    const input = document.getElementById('destino-search') || $input;
    if (!mic || !input) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { mic.style.display = 'none'; return; }

    let recognition = null;
    let recording = false;

    mic.addEventListener('click', () => {
      if (recording) {
        recognition?.stop();
        return;
      }
      recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        input.value = text;
        input.dispatchEvent(new Event('input'));
      };
      recognition.onend = () => { recording = false; mic.classList.remove('recording'); };
      recognition.onerror = () => { recording = false; mic.classList.remove('recording'); };

      recording = true;
      mic.classList.add('recording');
      recognition.start();
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
