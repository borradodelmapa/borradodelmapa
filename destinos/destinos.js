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

      if (user) {
        const initial = (user.displayName || user.email || '?')[0].toUpperCase();
        $actions.innerHTML = `<div class="app-avatar" id="btn-avatar" title="Mis Viajes">${initial}</div>`;
        document.getElementById('btn-avatar')?.addEventListener('click', () => {
          window.location.href = '/?state=viajes';
        });
      } else {
        $actions.innerHTML = `<div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>`;
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

  function addBubble(text, isUser) {
    const div = document.createElement('div');
    div.className = 'salma-chat-bubble' + (isUser ? ' user' : '');
    div.textContent = text;
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

    // Check if this is a route request → redirect to main app
    const routeKeywords = ['itinerario', 'ruta', 'días', 'dias', 'planear', 'planifica'];
    const isRouteRequest = routeKeywords.some(k => text.toLowerCase().includes(k));
    if (isRouteRequest) {
      streamEl.textContent = 'Para crear una ruta completa con mapa y paradas, te llevo a la app.';
      setTimeout(() => {
        window.location.href = '/?q=' + encodeURIComponent(DESTINO.nombre + ' ' + text.match(/\d+/)?.[0] + ' días');
      }, 1500);
      streaming = false;
      return;
    }

    // Simple Q&A via worker — add destination context
    const body = {
      messages: [
        { role: 'user', content: `[Contexto: el usuario está en la página de ${DESTINO.nombre}, ${DESTINO.pais}. Responde sobre este destino de forma breve y práctica.]\n\n${text}` }
      ],
      destino_context: true
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
              if (evt.text) {
                fullText += evt.text;
                streamEl.textContent = fullText;
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

  // ═══ INIT ═══
  initAuth();
  initPlaceholder();
  initShare();

})();
