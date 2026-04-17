/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — app.js
   Firebase init, auth, navegación, Mis Viajes
   ═══════════════════════════════════════════ */

// Firebase ya inicializado en index.html — solo referencias
const auth = firebase.auth();
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') console.warn('[offline] Persistence failed: multiple tabs open');
  else if (err.code === 'unimplemented') console.warn('[offline] Persistence not supported in this browser');
});
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Forzar comprobación de SW nuevo en cada carga
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(reg => { if (reg) reg.update(); });
}

// ── Splash ──
function hideSplash() {
  const s = document.getElementById('splash');
  if (s && !s.classList.contains('splash-hidden')) {
    s.classList.add('splash-hidden');
    setTimeout(() => s.remove(), 450);
  }
}
// Fallback: ocultar splash máximo a los 4s aunque Firebase tarde
setTimeout(hideSplash, 4000);

// Estado global
let currentUser = null;
let currentState = 'welcome'; // 'welcome' | 'chat' | 'viajes' | 'profile'
let currentUserSOSConfig = null;

// ═══ DOM refs ═══
const $content = document.getElementById('app-content');
// Header eliminado
const $input = document.getElementById('main-input');
const $send = document.getElementById('main-send');
const $toast = document.getElementById('toast');

// ═══ NAVEGACIÓN — 3 estados ═══

function showState(state) {
  currentState = state;
  updateHeader();

  const inputBar = document.querySelector('.app-input-bar');

  if (state === 'welcome') {
    renderWelcome();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '0';
  } else if (state === 'rutas') {
    loadUserGuides();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'viajes' || state === 'profile') {
    renderProfile();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'bitacora') {
    renderBitacora();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'diario') {
    // renderDiario se llama con parámetros desde renderBitacora
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'documentos') {
    if (typeof docsViajero !== 'undefined') docsViajero.render();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'notas') {
    if (typeof notasManager !== 'undefined') notasManager.renderNotasView();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'vuelos') {
    if (typeof flightWatches !== 'undefined') flightWatches.renderVuelosView();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'chat') {
    // Limpiar welcome si estaba visible (ej: llegando desde ?go=chat)
    const welcomeEl = $content.querySelector('.welcome-area');
    if (welcomeEl) $content.innerHTML = '';
    $input.placeholder = 'Escribe a Salma...';
    if (inputBar) inputBar.style.display = '';
    // Resetear botones cam/mic/send al volver al chat
    if (typeof resetInputButtons === 'function') resetInputButtons();
    $content.classList.add('app-content--chat');
    $content.style.paddingBottom = '';
    if (!document.getElementById('chat-bg-layer')) {
      const layer = document.createElement('div');
      layer.id = 'chat-bg-layer';
      layer.className = 'chat-bg-layer';
      document.body.insertBefore(layer, document.body.firstChild);
    }
    // Restaurar sesión previa o mostrar estado vacío
    if (!document.getElementById('chat-area') || !document.getElementById('chat-area').hasChildNodes()) {
      const restored = typeof salma !== 'undefined' && salma._restoreSession();
      if (!restored) _renderChatEmpty();
    }
    // Handoff desde guía pública o destino externo
    const handoff = localStorage.getItem('_salmaHandoff');
    if (handoff) {
      localStorage.removeItem('_salmaHandoff');
      setTimeout(() => {
        $input.value = handoff;
        $input.dispatchEvent(new Event('input'));
        $input.focus();
      }, 150);
    }
  }
  // Quitar fondo mapa y padding extra si salimos del chat
  if (state !== 'chat') {
    const layer = document.getElementById('chat-bg-layer');
    if (layer) layer.remove();
    $content.classList.remove('app-content--chat');
  }
  // Limpiar barra flotante de guía si quedó huérfana
  const _orphanBar = document.body.querySelector('.itin-action-bar');
  if (_orphanBar) _orphanBar.remove();
  // FAB mapa: visible en todo menos welcome
  const fab = document.getElementById('fab-map');
  if (fab) fab.style.display = (state === 'welcome' || !currentUser) ? 'none' : '';
}

function updateHeader() {
  // Header eliminado — solo actualiza bottom bar
  updateBottomBar();
}

function updateBottomBar() {
  let bar = document.getElementById('app-bottom-bar');
  if (!bar) {
    bar = document.createElement('nav');
    bar.id = 'app-bottom-bar';
    bar.className = 'app-bottom-bar';
    document.body.appendChild(bar);
  }

  const isHome = currentState === 'welcome';
  const isChat = currentState === 'chat';
  const isRutas = currentState === 'rutas';
  const isVuelos = currentState === 'vuelos';
  const isProfile = currentState === 'profile' || currentState === 'bitacora' || currentState === 'diario' || currentState === 'documentos' || currentState === 'notas';

  bar.innerHTML = `
    ${!currentUser ? `<button class="bottom-tab ${isHome ? 'bottom-tab-active' : ''}" id="tab-home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </button>` : ''}
    <button class="bottom-tab ${isRutas ? 'bottom-tab-active' : ''}" id="tab-rutas">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/><rect x="1" y="3" width="4" height="4" rx="1"/><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="1" y="17" width="4" height="4" rx="1"/></svg>
      <span>Mis Viajes</span>
    </button>
    ${isChat ? `<button class="bottom-tab bottom-tab-newchat" id="tab-newchat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span>Nuevo</span>
    </button>` : ''}
    <button class="bottom-tab ${isChat ? 'bottom-tab-active' : ''}" id="tab-chat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Salma</span>
    </button>
    <button class="bottom-tab ${isProfile ? 'bottom-tab-active' : ''}" id="tab-profile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>${currentUser ? 'Perfil' : 'Entrar'}</span>
    </button>`;

  const tabHome = document.getElementById('tab-home');
  if (tabHome) tabHome.addEventListener('click', () => showState('welcome'));
  document.getElementById('tab-chat').addEventListener('click', () => {
    // Si hay guía abierta, cerrarla primero
    if (window._itinViewOpen && typeof closeItinerarioView === 'function') {
      closeItinerarioView();
    } else if (window._itinViewOpen) {
      const _view = document.getElementById('itin-view');
      const _appContent = document.getElementById('app-content');
      const _inputBar = document.getElementById('app-input-bar');
      window._itinViewOpen = false;
      // Quitar barra flotante (Google Maps + Compartir) del body
      const _actionBar = document.body.querySelector('.itin-action-bar');
      if (_actionBar) _actionBar.remove();
      if (_view) _view.style.display = 'none';
      if (_appContent) _appContent.style.display = '';
      if (_inputBar) _inputBar.style.display = '';
      if (typeof mapaRuta !== 'undefined') mapaRuta.destroy();
      if (typeof mapaItinerario !== 'undefined') mapaItinerario.destroy();
    }
    if (typeof salma !== 'undefined') salma._initChat();
    showState('chat');
  });
  const tabNewchat = document.getElementById('tab-newchat');
  if (tabNewchat) tabNewchat.addEventListener('click', () => {
    if (typeof salma !== 'undefined') salma.newChat();
  });
  document.getElementById('tab-rutas').addEventListener('click', () => {
    if (!currentUser) { window._afterLogin = 'rutas'; openModal(); return; }
    showState('rutas');
  });
  document.getElementById('tab-profile').addEventListener('click', handleAvatarClick);
}

function handleAvatarClick() {
  if (currentUser) {
    showState('profile');
  } else {
    openModal();
  }
}

// ═══ CHAT VACÍO — saludo + chips ═══

function _renderChatEmpty() {
  if (!document.getElementById('chat-area')) {
    $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
  }
  const area = document.getElementById('chat-area');
  if (!area || area.hasChildNodes()) return;

  const saludos = [
    'Dime. Ruta, hotel, restaurante, vuelo — lo que necesites.',
    'Ey, ¿qué plan tienes? Cuéntame y lo montamos.',
    '¿A dónde vamos? Te armo la ruta entera.',
    'Aquí estoy. Dime destino o lo que necesites resolver.'
  ];
  const saludo = saludos[Math.floor(Math.random() * saludos.length)];

  const _ci = (d) => `<svg class="chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const chipsLeft = [
    { label: 'Quiero ir a...', icon: _ci('<circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>'), msg: null, action: 'goto' },
    { label: 'Hazme una ruta', icon: _ci('<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>'), msg: 'Hazme una ruta' },
    { label: 'Buscar vuelo', icon: _ci('<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5 5.2 3L5.8 13 4 12.5l-1 1 3 2 2 3 1-1-.5-1.8 2.8-2.8 3 5.2.5-.3c.4-.2.6-.6.5-1.1z"/>'), msg: 'Busca vuelos' },
    { label: 'Alerta vuelos', icon: _ci('<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>'), msg: null, action: 'vuelos' },
    { label: 'Pide taxi', icon: _ci('<path d="M5 17h14v-5H5z"/><path d="M7 12V9a1 1 0 011-1h8a1 1 0 011 1v3"/><path d="M5 17l-1 2h1M19 17l1 2h-1"/><circle cx="7.5" cy="14.5" r="1"/><circle cx="16.5" cy="14.5" r="1"/><path d="M9 8l1-3h4l1 3"/>'), msg: null, action: 'taxi' },
    { label: 'Hotel cerca', icon: _ci('<path d="M3 21V7a2 2 0 012-2h6v16"/><path d="M13 21V3h6a2 2 0 012 2v16"/><path d="M7 9h2M7 13h2M15 9h2M15 13h2"/>'), msg: 'Busca un hotel cerca' },
    { label: 'Dónde comer', icon: _ci('<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'), msg: 'Recomiéndame dónde comer cerca' },
  ];
  const chipsRight = [
    { label: 'Mis Notas', icon: _ci('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'), msg: null, action: 'notas' },
    { label: 'Galería', icon: _ci('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'), msg: null, action: 'galeria' },
    { label: 'Explorar zona', icon: _ci('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'), msg: null, action: 'explorar' },
    { label: 'Emergencia', icon: '', msg: null, action: 'sos', cls: 'chat-empty-chip--sos', emoji: '🆘' },
  ];
  const renderChip = c => `<button class="chat-empty-chip ${c.cls || ''}" data-msg="${c.msg || ''}" data-action="${c.action || ''}">${c.icon || ''}${c.emoji ? `<span class="chip-emoji">${c.emoji}</span>` : ''}${c.label}</button>`;

  area.innerHTML = `
    <div class="chat-empty">
      <div class="msg msg-salma">
        <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
        <div class="msg-body-salma">${saludo}</div>
      </div>
      <div class="chat-empty-chips">
        <div class="chat-empty-col">${chipsLeft.map(renderChip).join('')}</div>
        <div class="chat-empty-col">${chipsRight.map(renderChip).join('')}</div>
      </div>
    </div>`;

  area.querySelectorAll('.chat-empty-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const action = chip.dataset.action;
      if (action === 'sos') {
        const sosConfigured = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim()).length > 0;
        if (sosConfigured) showSOSConfirm(); else renderSOSConfig();
        return;
      }
      if (action === 'explorar') {
        if (typeof salma !== 'undefined') {
          if (salma._narratorActive) {
            salma.stopNarrator();
            salma.showNarratorToast('Narrador desactivado.', 3000);
          } else {
            salma.startNarrator().then(ok => {
              if (ok === false) salma.showNarratorToast('Permite notificaciones y ubicación para usar el narrador.', 5000);
              else if (ok === true) salma.showNarratorToast('Narrador activado. Te avisaré cerca de lugares con historia.', 5000);
            });
          }
          updateBottomBar();
        }
        return;
      }
      if (action === 'taxi') {
        if (typeof salma !== 'undefined') salma.askTaxiDestination();
        return;
      }
      if (action === 'vuelos') {
        if (!currentUser) { window._afterLogin = 'vuelos'; openModal(); return; }
        showState('vuelos');
        return;
      }
      if (action === 'goto') {
        const input = document.getElementById('main-input');
        if (input) { input.value = 'Quiero ir a '; input.focus(); }
        return;
      }
      if (action === 'notas') {
        if (!currentUser) { window._afterLogin = 'notas'; openModal(); return; }
        showState('notas');
        return;
      }
      if (action === 'galeria') {
        if (!currentUser) { window._afterLogin = 'galeria'; openModal(); return; }
        renderGaleria();
        return;
      }
      if (chip.dataset.msg && typeof salma !== 'undefined') salma.send(chip.dataset.msg);
    });
  });
}

// ═══ WELCOME (estado 1) ═══

async function renderWelcome() {
  window.scrollTo(0, 0);
  // Chips fallback — se muestran inmediatamente, Firestore actualiza después
  const defaultChips = `
    <div class="chip" data-msg="3 días en Lisboa sola">Mi primer viaje sola</div>
    <div class="chip" data-msg="Vietnam 15 días mochilero">Vietnam 15 días</div>
    <div class="chip" data-msg="Me han robado el pasaporte en el extranjero">Pasaporte robado</div>`;

  $content.innerHTML = `
    <div class="welcome-hero fade-in">
      <div class="welcome-bg"></div>
      <div class="welcome-cloud"></div>
      <div class="welcome-content">
        <h1 class="welcome-title">Dime dónde vamos.<br><em>De lo demás yo me encargo.</em></h1>
        <div class="welcome-input-wrap">
          <div class="input-row">
            <textarea class="welcome-input" id="welcome-input" placeholder="¿A dónde vamos?" rows="1"></textarea>
            <button class="app-mic welcome-mic" id="welcome-mic-btn" aria-label="Hablar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="1" width="6" height="12" rx="3"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <button class="welcome-send" id="welcome-send" aria-label="Enviar" style="display:none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="welcome-chips" id="welcome-chips">
          ${defaultChips}
        </div>
        <div class="welcome-proof">
          <div class="welcome-features">
            <div class="welcome-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              <div>
                <div class="welcome-feature-title">Planifica</div>
                <div class="welcome-feature-desc">Ruta con mapa, fotos y paradas día a día</div>
              </div>
            </div>
            <div class="welcome-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div>
                <div class="welcome-feature-title">Busca</div>
                <div class="welcome-feature-desc">Vuelos, hoteles y restaurantes con datos reales</div>
              </div>
            </div>
            <div class="welcome-feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              <div>
                <div class="welcome-feature-title">Acompaña</div>
                <div class="welcome-feature-desc">Te guía en ruta y resuelve imprevistos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="welcome-reminders"></div>`;

  // Welcome input → enviar
  const wInput = document.getElementById('welcome-input');
  const wSend = document.getElementById('welcome-send');
  const wMic = document.getElementById('welcome-mic-btn');

  function resetWelcomeButtons() {
    if (!wInput) return;
    const hasText = wInput.value.trim().length > 0;
    if (wSend) wSend.style.display = hasText ? '' : 'none';
    if (wMic) wMic.style.display = hasText ? 'none' : '';
  }

  if (wSend) wSend.addEventListener('click', () => {
    const msg = wInput.value.trim();
    if (!msg) return;
    wInput.value = '';
    wInput.style.height = 'auto';
    resetWelcomeButtons();
    if (typeof salma !== 'undefined') salma.send(msg);
  });
  if (wInput) wInput.addEventListener('input', () => {
    wInput.style.height = 'auto';
    wInput.style.height = Math.min(wInput.scrollHeight, 120) + 'px';
    resetWelcomeButtons();
  });
  if (wInput) wInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const msg = wInput.value.trim();
      if (!msg) return;
      wInput.value = '';
      wInput.style.height = 'auto';
      resetWelcomeButtons();
      if (typeof salma !== 'undefined') salma.send(msg);
    }
  });

  // Placeholder rotativo
  if (wInput) {
    const ejemplos = [
      'Vietnam en moto',
      'Sin hotel en Bangkok',
      'Lisboa 3 días sola',
      'Vacunas para Nepal',
      'Me han robado en Roma',
      'Japón 2 semanas',
      'Médico urgente',
      'Marruecos 5 días',
      'Avería en Turquía',
      'Ferry a Santorini'
    ];
    let idx = 0;
    window._placeholderInterval = setInterval(() => {
      if (wInput.value) return;
      idx = (idx + 1) % ejemplos.length;
      wInput.placeholder = ejemplos[idx];
    }, 3000);
  }

  // Event listeners para chips fallback (inmediatos)
  const chipsEl = document.getElementById('welcome-chips');
  if (chipsEl) {
    chipsEl.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const msg = chip.dataset.msg;
        if (msg && typeof salma !== 'undefined') salma.send(msg);
      });
    });
  }

  // Actualizar chips con datos reales de Firestore (async, sin layout shift)
  _loadChipsAsync(chipsEl);


  // Recordatorios próximos
  if (currentUser && typeof notasManager !== 'undefined') {
    notasManager.renderWelcomeReminders('welcome-reminders');
  }
}


function chipLabel(name, max = 18) {
  if (name.length <= max) return name;
  const cut = name.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 6 ? cut.slice(0, lastSpace) : cut;
}

async function _loadChipsAsync(chipsEl) {
  if (!chipsEl) return;
  try {
    let chipsHtml = '';
    let chipsType = 'none';

    if (currentUser) {
      const snap = await db.collection('users').doc(currentUser.uid)
        .collection('maps').orderBy('createdAt', 'desc').limit(6).get();
      if (!snap.empty) {
        const seen = new Set();
        snap.forEach(doc => {
          if (seen.size >= 3) return;
          const d = doc.data();
          const label = chipLabel(d.nombre || 'Mi ruta');
          if (seen.has(label)) return; // evitar chips duplicados
          seen.add(label);
          chipsHtml += `<div class="chip chip-saved" data-doc-id="${doc.id}">${escapeHTML(label)}</div>`;
        });
        if (seen.size > 0) chipsType = 'saved';
      }
    }
    if (!chipsHtml) {
      const snap = await db.collection('public_guides')
        .where('featured', '==', true).limit(3).get();
      if (!snap.empty) {
        snap.forEach(doc => {
          const d = doc.data();
          const label = chipLabel(d.nombre || 'Ruta');
          chipsHtml += `<div class="chip chip-featured" data-slug="${doc.id}">${escapeHTML(label)}</div>`;
        });
        chipsType = 'featured';
      }
    }

    if (!chipsHtml) return; // Mantener fallback

    // Reemplazar contenido sin cambiar tamaño
    chipsEl.innerHTML = chipsHtml;

    if (chipsType === 'saved') {
      chipsEl.querySelectorAll('.chip-saved').forEach(chip => {
        chip.addEventListener('click', async () => {
          try {
            const guideDoc = await db.collection('users').doc(currentUser.uid)
              .collection('maps').doc(chip.dataset.docId).get();
            if (guideDoc.exists && typeof salma !== 'undefined') {
              salma.cargarGuia(chip.dataset.docId, guideDoc.data());
            }
          } catch (_) {}
        });
      });
    } else if (chipsType === 'featured') {
      chipsEl.querySelectorAll('.chip-featured').forEach(chip => {
        chip.addEventListener('click', () => {
          window.location.href = '/' + chip.dataset.slug;
        });
      });
    }
  } catch (_) {}
}

// ═══ PERFIL DE USUARIO ═══

function renderSalmaCan() {
  const features = [
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
      title: 'Planifica',
      desc: 'Rutas a medida con IA, mapas, fotos reales e info pre-viaje para 193 países.'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
      title: 'Reserva',
      desc: 'Vuelos, trenes, ferry, hotel, coche, bus y lo que haga falta. Enlace directo sin publicidad.'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      title: 'Búsquedas',
      desc: 'Restaurantes, lugares y servicios cerca de ti. Google sin anuncios ni patrocinados.'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      title: 'Acompaña',
      desc: 'Copiloto con info del país en tiempo real. Narrador de lo que tienes cerca.'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
      title: 'Documenta',
      desc: 'Galería de fotos por álbum, bitácora de viaje y notas asociadas a cada destino.'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
      title: 'Comparte',
      desc: 'Tu ruta con URL propia. Google Maps de toda la ruta de un solo toque.'
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      title: 'Protege',
      desc: 'SOS a tus contactos de emergencia. Embajadas, hospitales y policía al instante.'
    }
  ];

  $content.innerHTML = `
    <div class="salma-can-area fade-in">
      <div class="salma-can-header">
        <div class="salma-can-title">¿Qué puedo hacer?</div>
        <div class="salma-can-sub">Todo lo que Salma puede hacer por ti</div>
      </div>
      <div class="salma-can-list">
        ${features.map(f => `
          <div class="salma-can-row">
            <div class="salma-can-icon">${f.icon}</div>
            <div class="salma-can-info">
              <div class="salma-can-name">${f.title}</div>
              <div class="salma-can-desc">${f.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}

async function renderProfile() {
  if (!currentUser) { showState('welcome'); return; }

  const coins = currentUser.coins_saldo || 0;
  const rutas = currentUser.rutas_gratis_usadas || 0;
  const freeLeft = Math.max(0, 3 - rutas);
  const initial = (currentUser.name || currentUser.email || 'V')[0].toUpperCase();
  const sosConfigured = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim()).length > 0;

  const avatarHtml = currentUser.avatarURL
    ? `<div class="prof-avatar prof-avatar-has-img" id="prof-avatar-btn"><img src="${currentUser.avatarURL}" alt="Avatar"><div class="prof-avatar-edit-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div></div>`
    : `<div class="prof-avatar" id="prof-avatar-btn">${escapeHTML(initial)}<div class="prof-avatar-edit-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div></div>`;

  $content.innerHTML = `
    <div class="profile-area prof-v2 fade-in">
      <input type="file" id="prof-avatar-input" accept="image/*" style="display:none">
      <input type="file" id="prof-avatar-camera" accept="image/*" capture="user" style="display:none">

      <!-- Hero Header -->
      <div class="prof-hero">
        <div class="prof-hero-glow"></div>
        ${avatarHtml}
        <div class="prof-hero-name">${escapeHTML(currentUser.name || 'Viajero')}</div>
        <div class="prof-stats-strip">
          <div class="prof-stat-card" id="prof-stat-coins">
            <div class="prof-stat-number">${coins}</div>
            <div class="prof-stat-label">COINS</div>
          </div>
          <div class="prof-stat-divider"></div>
          <div class="prof-stat-card">
            <div class="prof-stat-number">${freeLeft}</div>
            <div class="prof-stat-label">GRATIS</div>
          </div>
          <div class="prof-stat-divider"></div>
          <div class="prof-stat-card">
            <div class="prof-stat-number" id="prof-stat-guides">&ndash;</div>
            <div class="prof-stat-label">VIAJES</div>
          </div>
        </div>
      </div>

      <!-- Card 1: Tu Viaje -->
      <div class="prof-group">
        <div class="prof-group-title">TU VIAJE</div>
        <div class="prof-card">
          <div class="prof-row" id="prof-notas">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
            <span class="prof-row-label">Mis Notas</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-galeria">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
            <span class="prof-row-label">Galería</span>
            <button class="prof-row-info-btn" id="prof-galeria-info" onclick="event.stopPropagation()">i</button>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-bitacora">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg></span>
            <span class="prof-row-label">Cuaderno de Viaje</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-docs">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
            <span class="prof-row-label">Documentos del Viajero</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Card 2: Seguridad -->
      <div class="prof-group">
        <div class="prof-group-title">SEGURIDAD</div>
        <div class="prof-card ${sosConfigured ? 'prof-card-sos-on' : 'prof-card-sos-off'}">
          <div class="prof-row prof-row-sos" id="prof-sos">
            <span class="prof-row-icon prof-row-icon-sos"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
            <span class="prof-row-label">SOS Emergencia</span>
            <span class="prof-sos-badge">${sosConfigured
              ? '<span class="prof-sos-on">configurado</span>'
              : '<span class="prof-sos-off">sin configurar</span>'}</span>
            <button class="prof-row-info-btn prof-sos-edit-btn" id="prof-sos-edit" onclick="event.stopPropagation()" title="Editar contactos">✏️</button>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Card 3: Cuenta -->
      <div class="prof-group">
        <div class="prof-group-title">CUENTA</div>
        <div class="prof-card">
          <div class="prof-row" id="prof-logout">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            <span class="prof-row-label">Cerrar sesión</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-coins">
            <span class="prof-row-icon prof-row-icon-coins"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.5 9a3.5 3.5 0 0 0-5 0"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/></svg></span>
            <span class="prof-row-label">Salma Coins</span>
            <span class="prof-coins-badge">${coins}</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-help">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
            <span class="prof-row-label">¿Qué puedo hacer?</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="prof-legal">
        <a href="/legal.html#aviso-legal" target="_blank">Aviso legal</a>
        <span>·</span>
        <a href="/legal.html#privacidad" target="_blank">Privacidad</a>
        <span>·</span>
        <a href="/legal.html#cookies" target="_blank">Cookies</a>
        <span>·</span>
        <a href="/legal.html#terminos" target="_blank">Términos</a>
      </div>
    </div>`;

  // Event listeners
  // Avatar — click abre selector, sube a R2, guarda URL en Firestore
  const avatarBtn = document.getElementById('prof-avatar-btn');
  const avatarInput = document.getElementById('prof-avatar-input');
  const avatarCamera = document.getElementById('prof-avatar-camera');
  if (avatarBtn && avatarInput) {
    avatarBtn.addEventListener('click', () => {
      // En móvil se ofrece cámara nativa automáticamente con accept="image/*"
      avatarInput.click();
    });
    const handleAvatarFile = async (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) { if (typeof showToast === 'function') showToast('La imagen supera 5 MB'); return; }
      try {
        if (typeof showToast === 'function') showToast('Subiendo avatar...');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uid', currentUser.uid);
        formData.append('docId', 'avatar');
        const res = await fetch(window.SALMA_API + '/upload-doc', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Error subiendo');
        const { url } = await res.json();
        await db.collection('users').doc(currentUser.uid).update({ avatarURL: url });
        currentUser.avatarURL = url;
        if (typeof showToast === 'function') showToast('Avatar actualizado');
        renderProfile();
      } catch (e) {
        console.error('Error subiendo avatar:', e);
        if (typeof showToast === 'function') showToast('Error al subir avatar');
      }
    };
    avatarInput.addEventListener('change', (e) => handleAvatarFile(e.target.files[0]));
    avatarCamera.addEventListener('change', (e) => handleAvatarFile(e.target.files[0]));
  }
  document.getElementById('prof-bitacora').addEventListener('click', () => showState('bitacora'));
  document.getElementById('prof-coins').addEventListener('click', openCoinsModal);
  document.getElementById('prof-notas').addEventListener('click', () => showState('notas'));
  document.getElementById('prof-galeria').addEventListener('click', () => renderGaleria());
  document.getElementById('prof-docs').addEventListener('click', () => {
    if (typeof docsViajero !== 'undefined') docsViajero.render();
  });
  document.getElementById('prof-galeria-info')?.addEventListener('click', () => {
    showInfoPopup('Aquí puedes organizar las fotos de todos tus viajes. Crear galerías nuevas. Y hacer videos para compartir con tus amigos en redes sociales o como quieras.');
  });
  document.getElementById('prof-help').addEventListener('click', () => renderSalmaCan());
  document.getElementById('prof-sos').addEventListener('click', () => {
    const contacts = (currentUserSOSConfig?.contacts || []).filter(c => c.phone && c.phone.trim());
    if (contacts.length === 0) {
      renderSOSConfig();
    } else {
      showSOSConfirm();
    }
  });
  document.getElementById('prof-sos-edit').addEventListener('click', () => renderSOSConfig());
  document.getElementById('prof-logout').addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) logout();
  });
  // Stats: click en coins abre modal
  document.getElementById('prof-stat-coins')?.addEventListener('click', openCoinsModal);
  // Stats: cargar conteo de guías async
  db.collection('users').doc(currentUser.uid)
    .collection('maps').get().then(snap => {
      const el = document.getElementById('prof-stat-guides');
      if (el) el.textContent = snap.size;
    }).catch(() => {
      const el = document.getElementById('prof-stat-guides');
      if (el) el.textContent = '0';
    });
  // Cargar guías del usuario
  _loadProfileGuides();
}

async function _loadProfileGuides() {
  if (!currentUser) return;
  const grid = document.getElementById('viajes-grid');
  if (!grid) return;
  try {
    const snap = await db.collection('users').doc(currentUser.uid)
      .collection('maps').orderBy('createdAt', 'desc').get();

    const allGuides = [];
    snap.forEach(doc => allGuides.push({ id: doc.id, data: doc.data() }));

    for (const g of allGuides) {
      // Sincronizar copia offline: guardar SIEMPRE al cargar desde Firestore
      // (permite abrir guías sin conexión aunque el dispositivo sea nuevo)
      try {
        const existing = JSON.parse(localStorage.getItem('offline_route_' + g.id) || 'null');
        localStorage.setItem('offline_route_' + g.id, JSON.stringify({
          ...g.data, id: g.id,
          _savedAt: existing?._savedAt || Date.now()
        }));
      } catch (_) {}
      grid.appendChild(_createGuideCard(g, g.data));
    }
  } catch (e) {
    // Sin conexión — cargar desde localStorage
    console.warn('[offline] Firestore falló, cargando desde localStorage:', e.message);
    const offlineKeys = Object.keys(localStorage).filter(k => k.startsWith('offline_route_'));
    if (offlineKeys.length === 0) {
      grid.innerHTML = '<p style="color:rgba(244,239,230,.35);text-align:center;padding:32px 16px">Sin conexión y sin guías descargadas.</p>';
      return;
    }
    const banner = document.createElement('div');
    banner.className = 'offline-banner';
    banner.textContent = '📵 Sin conexión · mostrando guías guardadas localmente';
    grid.before(banner);
    const offlineGuides = offlineKeys
      .map(k => { try { return JSON.parse(localStorage.getItem(k)); } catch(_) { return null; } })
      .filter(Boolean)
      .sort((a, b) => (b._savedAt || 0) - (a._savedAt || 0));
    for (const g of offlineGuides) {
      grid.appendChild(_createGuideCard({ id: g.id }, g, true));
    }
  }
}

function _createGuideCard(doc, d, isOffline) {
  const card = document.createElement('div');
  card.className = 'viaje-card' + (isOffline ? ' viaje-card-offline' : '');
  const photo = d.cover_image || destPhoto(d.destino || d.country || d.nombre || '');
  const offlineBadge = isOffline ? '<span class="viaje-card-offline-badge">📵 offline</span>' : '';
  const isCached = !isOffline && !!localStorage.getItem('offline_route_' + doc.id);
  card.innerHTML = `
    <div class="viaje-card-img" style="background-image:url('${escapeHTML(photo)}')"></div>
    <div class="viaje-card-body">
      <div class="viaje-card-title">${escapeHTML(d.nombre || 'Mi ruta')} ${offlineBadge}</div>
      <div class="viaje-card-meta">${d.num_dias || d.dias || '?'} DÍAS · ${escapeHTML((d.destino || '').toUpperCase())}</div>
    </div>
    <button class="viaje-card-delete" data-doc-id="${doc.id}" title="Eliminar guía">✕</button>
    <button class="viaje-card-dl${isCached ? ' viaje-card-dl-saved' : ''}" data-doc-id="${doc.id}" title="${isCached ? 'Disponible sin conexión' : 'Guardar para leer sin conexión'}">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
    </button>
    ${(d.photos && d.photos.length >= 3) ? '<button class="viaje-card-video" data-doc-id="' + doc.id + '" title="Crear video">🎬</button>' : ''}`;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.viaje-card-delete')) return;
    if (e.target.closest('.viaje-card-dl')) return;
    if (e.target.closest('.viaje-card-video')) return;
    if (d.source === 'kv-nivel2' && d.slug) {
      window.location.href = '/destinos/' + d.slug + '.html';
      return;
    }
    if (typeof salma !== 'undefined') salma.cargarGuia(doc.id, d);
  });
  card.querySelector('.viaje-card-delete').addEventListener('click', async (e) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta guía?')) return;
    try {
      const slug = d.slug;
      if (slug) await db.collection('public_guides').doc(slug).delete();
      await db.collection('users').doc(currentUser.uid).collection('maps').doc(doc.id).delete();
      // Limpiar copia offline
      try { localStorage.removeItem('offline_route_' + doc.id); } catch (_) {}
      card.remove();
      showToast('Guía eliminada');
    } catch (err) {
      showToast('Error al eliminar');
    }
  });
  card.querySelector('.viaje-card-dl').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    try {
      localStorage.setItem('offline_route_' + doc.id, JSON.stringify({ ...d, id: doc.id, _savedAt: Date.now() }));
      btn.classList.add('viaje-card-dl-saved');
      btn.title = 'Disponible sin conexión';
      showToast('Guía guardada para leer sin conexión');
    } catch (_) {
      showToast('No hay espacio suficiente en el dispositivo');
    }
  });
  // Video de ruta (1 tap)
  card.querySelector('.viaje-card-video')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (typeof videoAssembly === 'undefined') return;

    const routeData = d.itinerarioIA ? JSON.parse(d.itinerarioIA) : null;
    const result = await videoAssembly.assemble({ source: 'route', id: doc.id, routeData });
    if (!result) { showToast('Necesitas al menos 3 fotos en esta ruta'); return; }
    _showVideoModal(result.photoUrls, result.params);
  });
  return card;
}

// ═══ BITÁCORA — Organizada por países ═══

async function renderBitacora() {
  if (!currentUser) { showState('welcome'); return; }

  $content.innerHTML = `
    <div class="bitacora-area fade-in">
      <div class="bitacora-header">
        <div class="bitacora-title">Mis Viajes</div>
      </div>
      <div class="bitacora-countries" id="bitacora-countries">
        <div class="bitacora-loading">Cargando tus viajes...</div>
      </div>
    </div>`;

  try {
    const mapsSnap = await db.collection('users').doc(currentUser.uid).collection('maps').orderBy('createdAt', 'desc').get();

    const container = document.getElementById('bitacora-countries');
    if (!container) return;

    // Agrupar rutas por país
    const countriesMap = {}; // code → { name, emoji, rutas: [] }

    mapsSnap.forEach(doc => {
      const d = doc.data();
      let route = null;
      try { route = JSON.parse(d.itinerarioIA || '{}'); } catch (_) {}
      let country = normalizeCountry(d.country || '');
      if (!country.code) country = normalizeCountry(d.destino || '');
      if (!country.code && route?.country) country = normalizeCountry(route.country);
      if (!country.code && d.nombre) country = normalizeCountry(d.nombre);
      const code = country.code || 'XX';
      if (!countriesMap[code]) countriesMap[code] = { name: country.name || 'Otros', emoji: country.emoji || '', rutas: [] };
      if (!countriesMap[code].rutas.some(r => r.doc.id === doc.id)) {
        countriesMap[code].rutas.push({ doc, data: d, route });
      }
    });

    // Filtrar países sin rutas
    const sorted = Object.entries(countriesMap)
      .filter(([_, c]) => c.rutas.length > 0)
      .sort((a, b) => {
        const aDate = a[1].rutas[0]?.data?.createdAt || '';
        const bDate = b[1].rutas[0]?.data?.createdAt || '';
        return bDate.localeCompare(aDate);
      });

    if (sorted.length === 0) {
      container.innerHTML = `
        <div class="bitacora-empty">
          <div class="bitacora-empty-icon">\u{1F30D}</div>
          <div class="bitacora-empty-text">A\u00fan no tienes viajes</div>
          <div class="bitacora-empty-sub">Habla con Salma para planificar tu primera ruta</div>
          <button class="btn-primary" id="bitacora-new">Habla con Salma</button>
        </div>`;
      document.getElementById('bitacora-new')?.addEventListener('click', () => {
        if (typeof salma !== 'undefined') { salma.reset(); salma._initChat(); }
      });
      return;
    }

    container.innerHTML = '';

    sorted.forEach(([code, country]) => {
      const rutasCount = country.rutas.length;

      const el = document.createElement('div');
      el.className = 'bitacora-country';
      el.innerHTML = `
        <div class="bitacora-country-header" data-code="${code}">
          <span class="bitacora-country-flag">${country.emoji}</span>
          <span class="bitacora-country-name">${escapeHTML(country.name)}</span>
          <span class="bitacora-country-counts">${rutasCount} ruta${rutasCount > 1 ? 's' : ''}</span>
          <span class="bitacora-country-arrow">\u203A</span>
        </div>
        <div class="bitacora-country-body" id="country-body-${code}" style="display:none;">
          <div class="bitacora-rutas-list">
            ${country.rutas.map(r => {
              const d = r.data;
              const stops = r.route?.stops?.length || 0;
              const days = r.route?.duration_days || d.num_dias || '?';
              return `
                <div class="bitacora-ruta-item" data-docid="${r.doc.id}">
                  <div class="bitacora-ruta-name">${escapeHTML(d.nombre || 'Mi ruta')}</div>
                  <div class="bitacora-ruta-meta">${days} d\u00edas \u00b7 ${stops} paradas</div>
                </div>`;
            }).join('')}
          </div>
        </div>`;

      el.querySelector('.bitacora-country-header').addEventListener('click', () => {
        const body = document.getElementById('country-body-' + code);
        const arrow = el.querySelector('.bitacora-country-arrow');
        if (body.style.display === 'none') {
          body.style.display = 'block';
          arrow.textContent = '\u2304';
        } else {
          body.style.display = 'none';
          arrow.textContent = '\u203A';
        }
      });

      container.appendChild(el);
    });

    // Event delegation para abrir rutas
    container.addEventListener('click', (e) => {
      const ruta = e.target.closest('.bitacora-ruta-item');
      if (ruta) {
        const docId = ruta.dataset.docid;
        const doc = mapsSnap.docs.find(d => d.id === docId);
        if (doc) {
          const d = doc.data();
          let route = null;
          try { route = JSON.parse(d.itinerarioIA || '{}'); } catch (_) {}
          currentState = 'diario';
          updateBottomBar();
          // Abrir en vista itinerario si está disponible, sino fallback a bitacora (P2-11)
          if (typeof window.openItinerarioView === 'function' && route && route.stops && route.stops.length) {
            window.openItinerarioView(route, doc.id, { saved: true });
          } else if (typeof bitacoraRenderer !== 'undefined') {
            bitacoraRenderer.renderDiario(route, doc.id, d.notes || {}, d.photos || [], d);
          }
        }
      }
    });

  } catch (e) {
    console.error('Error cargando viajes:', e);
    const container = document.getElementById('bitacora-countries');
    if (container) container.innerHTML = '<div class="bitacora-empty-text">Error cargando tus viajes</div>';
  }
}

// ═══ GALERÍA DE FOTOS ═══

const TAG_ICONS = { paisaje:'🏔️', monumento:'🏛️', comida:'🍜', persona:'👤', documento:'📄', cartel:'🪧', transporte:'🚗', alojamiento:'🏨', otro:'📷' };

async function renderGaleria(albumFilter) {
  if (!currentUser) return;
  currentState = 'galeria';
  updateHeader();

  const $c = document.getElementById('app-content');
  $c.innerHTML = '<div class="galeria-area fade-in"><div class="galeria-loading">Cargando galería...</div></div>';
  document.querySelector('.app-input-bar').style.display = 'none';

  const uid = currentUser.uid;
  let fotos = [];
  let albumes = [];
  try {
    const [fotosSnap, albumesSnap] = await Promise.all([
      db.collection('users').doc(uid).collection('fotos').orderBy('createdAt', 'desc').limit(60).get(),
      db.collection('users').doc(uid).collection('albumes').orderBy('createdAt', 'desc').limit(20).get()
    ]);
    fotosSnap.forEach(d => fotos.push({ id: d.id, ...d.data() }));
    albumesSnap.forEach(d => albumes.push({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('[Galería] Error Firestore (puede faltar reglas):', e.message);
    // Intentar cargar fotos de las rutas existentes como fallback
    try {
      const mapsSnap = await db.collection('users').doc(uid).collection('maps').orderBy('createdAt', 'desc').limit(20).get();
      mapsSnap.forEach(doc => {
        const data = doc.data();
        if (data.photos && Array.isArray(data.photos)) {
          data.photos.forEach((p, i) => {
            fotos.push({
              id: doc.id + '_' + i,
              key: p.key, url: p.url,
              tag: p.tag || 'otro',
              caption: p.caption || '',
              albumId: null,
              routeId: doc.id,
              createdAt: p.uploadedAt || data.createdAt || '',
              _fromFallback: true
            });
          });
        }
      });
    } catch (_) {}
  }

  const sinAlbum = fotos.filter(f => !f.albumId).length;
  const activeAlbum = albumFilter || null;
  const filtered = activeAlbum === '__sin_album__'
    ? fotos.filter(f => !f.albumId)
    : activeAlbum
      ? fotos.filter(f => f.albumId === activeAlbum)
      : fotos;

  const activeAlbumName = activeAlbum === '__sin_album__'
    ? 'Sin álbum'
    : activeAlbum
      ? (albumes.find(a => a.id === activeAlbum)?.nombre || 'Álbum')
      : 'Todas las fotos';

  const albumsHtml = `
    <div class="galeria-albums">
      <div class="galeria-album-chip ${!activeAlbum ? 'active' : ''}" data-album="">Todas (${fotos.length})</div>
      ${albumes.map(a => {
        const count = fotos.filter(f => f.albumId === a.id).length;
        const isActive = activeAlbum === a.id;
        return `<div class="galeria-album-chip ${isActive ? 'active' : ''}" data-album="${a.id}">${escapeHTML(a.nombre)} (${count})${isActive ? '<button class="galeria-album-delete-x" data-album-id="' + a.id + '" title="Eliminar álbum">✕</button>' : ''}</div>`;
      }).join('')}
      ${sinAlbum > 0 ? `<div class="galeria-album-chip ${activeAlbum === '__sin_album__' ? 'active' : ''}" data-album="__sin_album__">Sin álbum (${sinAlbum})</div>` : ''}
      <div class="galeria-album-chip galeria-album-new" id="galeria-new-album">+ Álbum</div>
    </div>`;

  const isAlbumEmpty = filtered.length === 0 && activeAlbum && activeAlbum !== '__sin_album__';
  const gridHtml = filtered.length === 0
    ? (isAlbumEmpty
      ? `<div class="galeria-empty">Este álbum está vacío.<br><br>
          <button class="galeria-add-album-btn" id="galeria-add-from-gallery">Añadir fotos de la galería</button>
          <label for="galeria-file-input" class="galeria-add-album-btn galeria-add-album-upload">Subir nuevas</label>
        </div>`
      : '<div class="galeria-empty">No hay fotos todavía.<br>Pulsa <strong>📤 Añadir</strong> para subir desde tu galería, o envía fotos a Salma desde el chat.</div>')
    : `<div class="galeria-grid">${filtered.map(f => {
        const isVid = f.type === 'video' || f.tag === 'video';
        const media = isVid
          ? `<video src="${escapeHTML(f.url)}" class="galeria-thumb" muted playsinline preload="metadata"></video><span class="galeria-video-badge">▶</span>`
          : `<img src="${escapeHTML(f.url)}" class="galeria-thumb" alt="${escapeHTML(f.caption || '')}" loading="lazy">`;
        return `<div class="galeria-item" data-foto-id="${f.id}">
          ${media}
          <span class="galeria-tag-badge">${TAG_ICONS[f.tag] || '📷'}</span>
          <button class="galeria-item-delete" data-foto-id="${f.id}" data-foto-key="${escapeHTML(f.key || '')}" title="Eliminar">✕</button>
        </div>`;
      }).join('')}</div>`;

  $c.innerHTML = `
    <div class="galeria-area fade-in">
      <div class="galeria-header">
        <span class="galeria-title">Galería</span>
        <div class="galeria-header-btns">
          ${activeAlbum && activeAlbum !== '__sin_album__'
            ? `<button class="galeria-upload-btn" id="galeria-add-to-album-btn" title="Añadir fotos existentes al álbum">+ Fotos</button>
               <label for="galeria-file-input" class="galeria-video-btn" title="Subir nuevas fotos">📤</label>
               ${filtered.length >= 3 ? '<button class="galeria-video-btn" id="galeria-album-video-btn" title="Video del álbum">🎬</button>' : ''}
               ${filtered.length > 0 ? '<button class="galeria-video-btn" id="galeria-select-btn" title="Seleccionar fotos">☑</button>' : ''}`
            : `<label for="galeria-file-input" class="galeria-upload-btn" title="Añadir fotos">+ Añadir</label>
               ${fotos.length >= 3 ? '<button class="galeria-video-btn" id="galeria-video-btn" title="Crear video">🎬</button>' : ''}
               <button class="galeria-video-btn" id="galeria-select-btn" title="Seleccionar fotos">☑</button>`}
        </div>
      </div>
      <input type="file" id="galeria-file-input" accept="image/*" multiple style="display:none">
      ${albumsHtml}
      ${gridHtml}
    </div>`;

  // Event: info
  document.getElementById('galeria-info-btn')?.addEventListener('click', () => {
    showInfoPopup('Aquí puedes organizar las fotos de todos tus viajes. Crear galerías nuevas. Y hacer videos para compartir con tus amigos en redes sociales o como quieras.');
  });

  // Event: album chips
  document.querySelectorAll('.galeria-album-chip[data-album]').forEach(chip => {
    chip.addEventListener('click', () => {
      const aid = chip.dataset.album;
      renderGaleria(aid || undefined);
    });
  });

  // Event: crear álbum (formulario inline, sin prompt)
  document.getElementById('galeria-new-album')?.addEventListener('click', function() {
    // Sustituir el chip por un mini-formulario inline
    this.outerHTML = `
      <div class="galeria-album-form" id="galeria-album-form">
        <input class="galeria-album-input" id="galeria-album-input"
          type="text" placeholder="Nombre del álbum" maxlength="30" autocomplete="off">
        <button class="galeria-album-confirm" id="galeria-album-confirm">✓</button>
        <button class="galeria-album-cancel"  id="galeria-album-cancel">✕</button>
      </div>`;

    const input = document.getElementById('galeria-album-input');
    input?.focus();

    const guardar = async () => {
      const nombre = document.getElementById('galeria-album-input')?.value?.trim();
      if (!nombre) { renderGaleria(activeAlbum); return; }
      try {
        const docRef = await db.collection('users').doc(uid).collection('albumes').add({
          nombre, createdAt: new Date().toISOString()
        });
        if (typeof showToast === 'function') showToast(`Álbum "${nombre}" creado`);
        renderGaleria(docRef.id); // navegar directo al nuevo álbum
      } catch (e) {
        if (typeof showToast === 'function') showToast('Error al crear álbum');
        renderGaleria(activeAlbum);
      }
    };

    document.getElementById('galeria-album-confirm')?.addEventListener('click', guardar);
    document.getElementById('galeria-album-cancel')?.addEventListener('click', () => renderGaleria(activeAlbum));
    document.getElementById('galeria-album-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') guardar();
      if (e.key === 'Escape') renderGaleria(activeAlbum);
    });
  });

  // ─── Modo "Añadir fotos al álbum" ───
  let _addToAlbumId = null;
  let _addToAlbumName = '';

  function _enterAddToAlbumMode(targetAlbumId) {
    _addToAlbumId = targetAlbumId;
    _addToAlbumName = albumes.find(a => a.id === targetAlbumId)?.nombre || 'Álbum';

    // Mostrar fotos que NO están en este álbum. Excluir fotos de fallback (rutas) que no tienen doc real en fotos/
    const available = fotos.filter(f => f.albumId !== targetAlbumId && f.url && !f._fromFallback);
    if (!available.length) {
      showToast('No hay fotos disponibles para añadir');
      return;
    }

    // Reconstruir la grid con las fotos disponibles
    const grid = document.querySelector('.galeria-grid');
    const emptyEl = document.querySelector('.galeria-empty');
    const container = grid || emptyEl;
    if (!container) return;

    const gridEl = document.createElement('div');
    gridEl.className = 'galeria-grid galeria-selecting';
    gridEl.innerHTML = available.map(f => {
      const isVid = f.type === 'video' || f.tag === 'video';
      const media = isVid
        ? `<video src="${escapeHTML(f.url)}" class="galeria-thumb" muted playsinline preload="metadata"></video><span class="galeria-video-badge">▶</span>`
        : `<img src="${escapeHTML(f.url)}" class="galeria-thumb" alt="${escapeHTML(f.caption || '')}" loading="lazy">`;
      return `<div class="galeria-item" data-foto-id="${f.id}">
        ${media}
        <span class="galeria-tag-badge">${TAG_ICONS[f.tag] || '📷'}</span>
      </div>`;
    }).join('');
    container.replaceWith(gridEl);

    // Click en cada item para seleccionar
    gridEl.querySelectorAll('.galeria-item').forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('selected');
        _updateAddToAlbumBar();
      });
    });

    _updateAddToAlbumBar();
  }

  function _updateAddToAlbumBar() {
    const count = document.querySelectorAll('.galeria-item.selected').length;
    let bar = document.getElementById('galeria-select-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'galeria-select-bar';
      bar.className = 'galeria-select-bar';
      document.body.appendChild(bar);
    }
    bar.innerHTML = `
      <span class="galeria-select-count">${count} foto${count !== 1 ? 's' : ''}</span>
      <button class="galeria-select-video-btn" id="galeria-confirm-add-album" ${count === 0 ? 'disabled' : ''}>Añadir a ${escapeHTML(_addToAlbumName)}</button>
      <button class="galeria-select-cancel-btn" id="galeria-cancel-add-album">✕</button>`;

    document.getElementById('galeria-confirm-add-album')?.addEventListener('click', async () => {
      const selectedIds = [...document.querySelectorAll('.galeria-item.selected')]
        .map(el => el.dataset.fotoId).filter(Boolean);
      if (!selectedIds.length) return;
      let ok = 0;
      for (const fid of selectedIds) {
        try {
          await db.collection('users').doc(uid).collection('fotos').doc(fid).update({ albumId: _addToAlbumId });
          ok++;
        } catch (e) {
          console.warn('[Galería] No se pudo mover foto', fid, e.message);
        }
      }
      showToast(ok > 0
        ? `${ok} foto${ok !== 1 ? 's' : ''} añadida${ok !== 1 ? 's' : ''} a "${_addToAlbumName}"`
        : 'Error al mover fotos');
      _addToAlbumId = null;
      document.getElementById('galeria-select-bar')?.remove();
      renderGaleria(activeAlbum);
    });

    document.getElementById('galeria-cancel-add-album')?.addEventListener('click', () => {
      _addToAlbumId = null;
      document.getElementById('galeria-select-bar')?.remove();
      renderGaleria(activeAlbum);
    });
  }

  // Event: botón "Añadir fotos" en estado vacío de álbum
  document.getElementById('galeria-add-from-gallery')?.addEventListener('click', () => {
    if (activeAlbum && activeAlbum !== '__sin_album__') _enterAddToAlbumMode(activeAlbum);
  });

  // Event: botón "+ Fotos" en cabecera de álbum
  document.getElementById('galeria-add-to-album-btn')?.addEventListener('click', () => {
    if (activeAlbum && activeAlbum !== '__sin_album__') _enterAddToAlbumMode(activeAlbum);
  });

  // Event: eliminar álbum (X en el chip del álbum activo)
  document.querySelectorAll('.galeria-album-delete-x').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation(); // no navegar al álbum
      const albumId = btn.dataset.albumId;
      const albumName = albumes.find(a => a.id === albumId)?.nombre || 'Álbum';
      if (!confirm(`¿Eliminar "${albumName}"?\nLas fotos no se borran.`)) return;
      try {
        const fotosInAlbum = fotos.filter(f => f.albumId === albumId);
        for (const f of fotosInAlbum) {
          try { await db.collection('users').doc(uid).collection('fotos').doc(f.id).update({ albumId: null }); } catch (_) {}
        }
        await db.collection('users').doc(uid).collection('albumes').doc(albumId).delete();
        showToast(`"${albumName}" eliminado`);
        renderGaleria();
      } catch (e) {
        showToast('Error al eliminar álbum');
      }
    });
  });

  // Event: crear video desde galería → edición
  document.getElementById('galeria-video-btn')?.addEventListener('click', async () => {
    if (typeof videoAssembly === 'undefined' || typeof videoPlayer === 'undefined') {
      if (typeof showToast === 'function') showToast('Cargando motor de video…');
      return;
    }

    const result = await videoAssembly.assemble({ source: 'gallery' });
    if (!result) { showToast('Necesitas al menos 3 fotos'); return; }
    _showVideoModal(result.photoUrls, result.params);
  });

  // Event: crear video del álbum activo → edición
  document.getElementById('galeria-album-video-btn')?.addEventListener('click', async () => {
    if (typeof videoAssembly === 'undefined') return;

    const result = await videoAssembly.assemble({ source: 'album', id: activeAlbum });
    if (!result) { showToast('Necesitas al menos 3 fotos en este álbum'); return; }
    result.params.titulo = activeAlbumName || result.params.titulo;
    _showVideoModal(result.photoUrls, result.params);
  });

  // Event: subir fotos directamente a la galería (el label dispara el input directamente)
  document.getElementById('galeria-file-input')?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await _uploadFilesToGaleria(files, uid, activeAlbum, fotos, albumes, albumes);
    // Limpiar input para poder subir el mismo archivo otra vez
    e.target.value = '';
    renderGaleria(activeAlbum);
  });

  // Event: eliminar foto con la X directa
  document.querySelectorAll('.galeria-item-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const fotoId = btn.dataset.fotoId;
      const fotoKey = btn.dataset.fotoKey;
      if (!confirm('¿Eliminar esta foto?')) return;
      try {
        await db.collection('users').doc(uid).collection('fotos').doc(fotoId).delete();
        if (fotoKey) {
          fetch(window.SALMA_API + '/delete-photo', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: fotoKey, uid })
          }).catch(() => {});
        }
        btn.closest('.galeria-item')?.remove();
        showToast('Foto eliminada');
      } catch (_) { showToast('Error al eliminar'); }
    });
  });

  // Event: click foto → acciones (mover, eliminar) + long-press/botón → multi-select
  let _selectMode = false;
  let _longPressTimer = null;

  function _enterSelectMode() {
    if (_selectMode) return;
    _selectMode = true;
    document.querySelector('.galeria-grid')?.classList.add('galeria-selecting');
    _updateSelectBar();
  }

  function _exitSelectMode() {
    _selectMode = false;
    document.querySelectorAll('.galeria-item.selected').forEach(el => el.classList.remove('selected'));
    document.querySelector('.galeria-grid')?.classList.remove('galeria-selecting');
    document.getElementById('galeria-select-bar')?.remove();
  }

  function _updateSelectBar() {
    const count = document.querySelectorAll('.galeria-item.selected').length;
    let bar = document.getElementById('galeria-select-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'galeria-select-bar';
      bar.className = 'galeria-select-bar';
      document.body.appendChild(bar);
    }
    const hasAlbums = albumes.length > 0;
    bar.innerHTML = `
      <span class="galeria-select-count">${count} foto${count !== 1 ? 's' : ''}</span>
      ${hasAlbums ? '<button class="galeria-select-album-btn" id="galeria-select-album">📁 Álbum</button>' : ''}
      <button class="galeria-select-delete-btn" id="galeria-select-delete">🗑</button>
      <button class="galeria-select-video-btn" id="galeria-select-video" ${count < 3 ? 'disabled' : ''}>🎬</button>
      <button class="galeria-select-cancel-btn" id="galeria-select-cancel">✕</button>`;
    document.getElementById('galeria-select-cancel')?.addEventListener('click', _exitSelectMode);

    // Botón "Álbum" → menú flotante de álbumes
    document.getElementById('galeria-select-album')?.addEventListener('click', () => {
      const existing = document.getElementById('galeria-album-menu');
      if (existing) { existing.remove(); return; }

      const selectedIds = [...document.querySelectorAll('.galeria-item.selected')]
        .map(el => el.dataset.fotoId).filter(Boolean);
      if (!selectedIds.length) return;

      const menu = document.createElement('div');
      menu.id = 'galeria-album-menu';
      menu.className = 'galeria-album-menu';
      menu.innerHTML = albumes.map(a =>
        `<button class="galeria-album-menu-item" data-album-id="${a.id}">${escapeHTML(a.nombre)}</button>`
      ).join('') + `<button class="galeria-album-menu-item galeria-album-menu-none" data-album-id="__none__">Sin álbum</button>`;
      bar.appendChild(menu);

      menu.querySelectorAll('.galeria-album-menu-item').forEach(btn => {
        btn.addEventListener('click', async () => {
          const targetId = btn.dataset.albumId;
          const albumId = targetId === '__none__' ? null : targetId;
          const albumName = targetId === '__none__' ? 'Sin álbum' : (albumes.find(a => a.id === targetId)?.nombre || 'Álbum');
          let ok = 0;
          for (const fid of selectedIds) {
            try {
              await db.collection('users').doc(uid).collection('fotos').doc(fid).update({ albumId });
              ok++;
            } catch (_) {}
          }
          showToast(ok > 0 ? `${ok} foto${ok !== 1 ? 's' : ''} → ${albumName}` : 'Error al mover fotos');
          _exitSelectMode();
          renderGaleria(activeAlbum);
        });
      });

      // Cerrar menú al tocar fuera
      setTimeout(() => {
        document.addEventListener('click', function _closeMenu(e) {
          if (!menu.contains(e.target) && e.target.id !== 'galeria-select-album') {
            menu.remove();
            document.removeEventListener('click', _closeMenu);
          }
        });
      }, 10);
    });
    document.getElementById('galeria-select-delete')?.addEventListener('click', async () => {
      const selectedEls = [...document.querySelectorAll('.galeria-item.selected')];
      const selectedPhotos = selectedEls.map(el => fotos.find(f => f.id === el.dataset.fotoId)).filter(Boolean);
      if (!selectedPhotos.length) return;
      if (!confirm(`¿Eliminar ${selectedPhotos.length} foto${selectedPhotos.length !== 1 ? 's' : ''}?`)) return;
      for (const foto of selectedPhotos) {
        try {
          await db.collection('users').doc(uid).collection('fotos').doc(foto.id).delete();
          if (foto.key) {
            fetch(window.SALMA_API + '/delete-photo', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: foto.key, uid })
            }).catch(() => {});
          }
        } catch (_) {}
      }
      showToast(`${selectedPhotos.length} foto${selectedPhotos.length !== 1 ? 's' : ''} eliminada${selectedPhotos.length !== 1 ? 's' : ''}`);
      _exitSelectMode();
      renderGaleria(activeAlbum);
    });
    document.getElementById('galeria-select-video')?.addEventListener('click', async () => {
      const selectedPhotos = [...document.querySelectorAll('.galeria-item.selected')]
        .map(el => fotos.find(f => f.id === el.dataset.fotoId))
        .filter(Boolean);
      if (selectedPhotos.length < 3) { showToast('Selecciona al menos 3 fotos'); return; }
      if (typeof videoAssembly === 'undefined') return;

      const result = await videoAssembly.assemble({ source: 'custom', photos: selectedPhotos });
      if (!result) { showToast('Error al preparar video'); return; }
      _exitSelectMode();
      _showVideoModal(result.photoUrls, result.params);
    });
  }

  // Botón "Seleccionar" en el header
  document.getElementById('galeria-select-btn')?.addEventListener('click', () => {
    if (_selectMode) { _exitSelectMode(); } else { _enterSelectMode(); }
  });

  document.querySelectorAll('.galeria-item').forEach(item => {
    // Long-press para activar modo selección
    item.addEventListener('touchstart', (e) => {
      _longPressTimer = setTimeout(() => {
        _longPressTimer = null;
        _enterSelectMode();
        item.classList.toggle('selected');
        _updateSelectBar();
      }, 500);
    }, { passive: true });
    item.addEventListener('touchmove', () => { if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; } }, { passive: true });
    item.addEventListener('touchend', () => { if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; } });

    // Click normal
    item.addEventListener('click', () => {
      if (_selectMode) {
        item.classList.toggle('selected');
        _updateSelectBar();
        // Si no queda ninguna seleccionada, salir del modo
        if (!document.querySelectorAll('.galeria-item.selected').length) _exitSelectMode();
        return;
      }
      const fotoId = item.dataset.fotoId;
      const foto = fotos.find(f => f.id === fotoId);
      if (!foto) return;
      _showFotoActions(foto, albumes, uid, activeAlbum);
    });
  });
}

function _showFotoActions(foto, albumes, uid, currentAlbumFilter) {
  const existing = document.getElementById('foto-actions-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'foto-actions-modal';
  modal.className = 'modal-overlay active';

  const hasCoords = foto.lat && foto.lng && Math.abs(foto.lat) > 0.01;
  const dateStr = foto.createdAt ? new Date(foto.createdAt).toLocaleDateString('es-ES') : '';

  modal.innerHTML = `
    <div class="foto-detail">
      <button class="foto-detail-close" id="foto-modal-close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${(foto.type === 'video' || foto.tag === 'video')
        ? `<video src="${escapeHTML(foto.url)}" class="foto-detail-img" controls autoplay loop muted playsinline></video>`
        : `<img src="${escapeHTML(foto.url)}" class="foto-detail-img">`}
      <div class="foto-detail-meta">
        ${foto.caption ? `<div class="foto-detail-caption">${escapeHTML(foto.caption)}</div>` : ''}
        <div class="foto-detail-info">${TAG_ICONS[foto.tag] || '📷'} ${foto.tag || 'foto'} ${dateStr ? '· ' + dateStr : ''}</div>
        ${hasCoords ? `<div class="foto-detail-coords">📍 ${foto.lat.toFixed(3)}, ${foto.lng.toFixed(3)}</div>` : ''}
      </div>
      <div class="foto-detail-actions">
        <button class="foto-act" id="foto-act-share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Compartir
        </button>
        <button class="foto-act" id="foto-act-download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Descargar
        </button>
        <button class="foto-act foto-act-danger" id="foto-delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Eliminar
        </button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Cerrar
  modal.querySelector('#foto-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  // Compartir (descarga blob y comparte como archivo)
  modal.querySelector('#foto-act-share')?.addEventListener('click', async () => {
    try {
      const isVid = foto.type === 'video' || foto.tag === 'video';
      const resp = await fetch(foto.url);
      const blob = await resp.blob();
      const ext = isVid ? '.mp4' : '.jpg';
      const mime = isVid ? 'video/mp4' : 'image/jpeg';
      const file = new File([blob], (foto.caption || 'borradodelmapa') + ext, { type: mime });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: foto.caption || '' });
      } else if (navigator.share) {
        await navigator.share({ url: foto.url, title: foto.caption || '' });
      } else {
        await navigator.clipboard.writeText(foto.url);
        if (typeof showToast === 'function') showToast('Enlace copiado');
      }
    } catch (_) {}
  });

  // Descargar
  modal.querySelector('#foto-act-download')?.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = foto.url;
    a.download = foto.caption || 'foto-viaje';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Ver en mapa → guardar pin + abrir mapa
  modal.querySelector('#foto-act-map')?.addEventListener('click', async () => {
    try {
      // Guardar pin en mapa
      await db.collection('users').doc(uid).collection('map_pins').add({
        lat: foto.lat,
        lng: foto.lng,
        type: 'photo',
        label: foto.caption || 'Foto',
        photoUrl: foto.url,
        createdAt: new Date().toISOString()
      });
      modal.remove();
      if (typeof showToast === 'function') showToast('📍 Pin guardado en el mapa');
      // Abrir mapa si está disponible
      if (typeof openLiveMap === 'function') openLiveMap();
    } catch (e) {
      if (typeof showToast === 'function') showToast('Error al guardar pin');
    }
  });

  // Eliminar
  modal.querySelector('#foto-delete')?.addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await db.collection('users').doc(uid).collection('fotos').doc(foto.id).delete();
      if (foto.key) {
        fetch(window.SALMA_API + '/delete-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: foto.key })
        }).catch(() => {});
      }
      modal.remove();
      if (typeof showToast === 'function') showToast('Foto eliminada');
      renderGaleria(currentAlbumFilter);
    } catch (e) {
      if (typeof showToast === 'function') showToast('Error al eliminar');
    }
  });
}

// ─── Subir fotos directamente a la galería ───
async function _uploadFilesToGaleria(files, uid, albumId, existingFotos, albumes) {
  const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 20);
  if (!validFiles.length) return;

  const btn = document.getElementById('galeria-upload-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Subiendo…'; }

  let ok = 0, fail = 0;

  for (const file of validFiles) {
    try {
      // 1. Comprimir (reutiliza lógica de salma.js si está disponible)
      let blob;
      if (typeof salma !== 'undefined' && typeof salma._compressImage === 'function') {
        blob = await salma._compressImage(file, 1024, 0.8);
      } else {
        blob = await _compressImageLocal(file, 1024, 0.8);
      }

      // 2. Subir a R2 via worker
      const formData = new FormData();
      formData.append('photo', blob, 'photo.jpg');
      formData.append('uid', uid);

      const res = await fetch(window.SALMA_API + '/upload-gallery-photo', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const { key, url } = await res.json();

      // 3. Guardar en Firestore fotos/
      await db.collection('users').doc(uid).collection('fotos').add({
        key, url,
        tag: 'otro',
        caption: '',
        albumId: albumId && albumId !== '__sin_album__' ? albumId : null,
        routeId: null,
        source: 'gallery',
        createdAt: new Date().toISOString()
      });

      ok++;
    } catch (e) {
      console.warn('[Galería upload]', e);
      fail++;
    }
  }

  if (btn) { btn.disabled = false; btn.textContent = '📤 Añadir'; }

  if (typeof showToast === 'function') {
    if (ok > 0 && fail === 0) showToast(`${ok} foto${ok > 1 ? 's' : ''} añadida${ok > 1 ? 's' : ''} ✓`);
    else if (ok > 0) showToast(`${ok} subidas, ${fail} con error`);
    else showToast('Error al subir las fotos');
  }
}

// Compresión local (fallback si salma.js no está cargado)
function _compressImageLocal(file, maxW, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        blob ? resolve(blob) : reject(new Error('toBlob failed'));
      }, 'image/jpeg', quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
    img.src = url;
  });
}

// ─── Modal UNIFICADO de video — Click & Play ───
async function _showVideoModal(photoUrls, params) {
  if (typeof videoPlayer === 'undefined') {
    if (typeof showToast === 'function') showToast('Motor de video no cargado');
    return;
  }

  // Limpiar modal anterior
  const existing = document.getElementById('video-player-modal');
  if (existing) { videoPlayer.pause(); existing.remove(); }

  let _exporting = false;

  const modal = document.createElement('div');
  modal.id = 'video-player-modal';
  modal.className = 'video-modal-overlay';

  const hasStops = params.stops && params.stops.length >= 2;

  modal.innerHTML = `
    <div class="video-modal-inner">
      <div class="video-modal-header">
        <button class="video-modal-close" id="vm-close">✕</button>
        <span class="video-modal-titulo">${escapeHTML(params.titulo || '')}</span>
      </div>
      <div class="video-modal-canvas-wrap" id="vm-canvas-wrap">
        <div class="video-modal-loading" id="vm-loading">Preparando video…</div>
        <div class="video-tap-icon" id="vm-tap-icon">▶</div>
        <div class="video-export-overlay" id="vm-export" style="display:none">
          <div class="video-export-text" id="vm-export-text">Exportando… 0%</div>
          <div class="video-export-bar"><div class="video-export-bar-fill" id="vm-export-fill"></div></div>
        </div>
      </div>
      <div class="video-progress" id="vm-progress" style="margin-top:6px">
        <div class="video-progress-fill" id="vm-progress-fill"></div>
      </div>
      <div class="video-modal-actions">
        <button class="vm-share-btn" id="vm-share" disabled>Compartir</button>
        <button class="vm-save-btn" id="vm-save" disabled>Guardar</button>
      </div>
      <details class="vpm-customize" id="vm-customize">
        <summary class="vpm-customize-toggle">Personalizar</summary>
        <div class="vpm-customize-body">
          <div class="vpm-customize-row">
            <label class="vpm-customize-label">Estilo</label>
            <div class="vpm-style-group">
              ${hasStops ? '<button class="vpm-style-btn ' + (params.style === 'viaje' ? 'active' : '') + '" data-style="viaje">Viaje</button>' : ''}
              <button class="vpm-style-btn ${params.style === 'documental' ? 'active' : ''}" data-style="documental">Documental</button>
              <button class="vpm-style-btn ${params.style === 'historia' ? 'active' : ''}" data-style="historia">Historia</button>
            </div>
          </div>
          <div class="vpm-customize-row">
            <label class="vpm-customize-label">Título</label>
            <input class="vpm-input" id="vm-titulo-input" type="text" value="${escapeHTML(params.titulo || '')}" maxlength="60">
          </div>
          <button class="vpm-apply-btn" id="vm-apply">Aplicar cambios</button>
        </div>
      </details>
    </div>`;

  document.body.appendChild(modal);

  // Refs
  const canvasWrap  = document.getElementById('vm-canvas-wrap');
  const exportOvr   = document.getElementById('vm-export');
  const exportText  = document.getElementById('vm-export-text');
  const exportFill  = document.getElementById('vm-export-fill');
  const tapIcon     = document.getElementById('vm-tap-icon');
  const shareBtn    = document.getElementById('vm-share');
  const saveBtn     = document.getElementById('vm-save');
  let currentParams = { ...params };

  // Helpers
  function _flashTap(icon) {
    tapIcon.textContent = icon;
    tapIcon.classList.add('flash');
    setTimeout(() => tapIcon.classList.remove('flash'), 400);
  }

  function _showExport() {
    _exporting = true;
    shareBtn.disabled = true;
    saveBtn.disabled = true;
    exportOvr.style.display = '';
    exportText.textContent = 'Exportando… 0%';
    exportFill.style.width = '0%';
  }

  function _hideExport() {
    _exporting = false;
    shareBtn.disabled = false;
    saveBtn.disabled = false;
    exportOvr.style.display = 'none';
  }

  function _onProgress(pct) {
    exportText.textContent = 'Exportando… ' + pct + '%';
    exportFill.style.width = pct + '%';
  }

  // Inicializar player
  const ok = await videoPlayer.init(canvasWrap, photoUrls, currentParams);
  const loadingEl = document.getElementById('vm-loading');

  if (!ok) {
    if (loadingEl) loadingEl.textContent = '⚠ No se pudieron cargar las fotos';
    return;
  }

  if (loadingEl) loadingEl.remove();
  canvasWrap.appendChild(videoPlayer._canvas);
  shareBtn.disabled = false;
  saveBtn.disabled = false;

  videoPlayer._progressFill = document.getElementById('vm-progress-fill');
  videoPlayer._onEnd = () => _flashTap('▶');

  // AUTO-PLAY
  videoPlayer.play();

  // Tap en canvas = play/pause
  canvasWrap.addEventListener('click', (e) => {
    if (_exporting) return;
    if (e.target.closest('.video-export-overlay')) return;
    if (videoPlayer._playing) {
      videoPlayer.pause();
      _flashTap('▶');
    } else {
      videoPlayer.play();
      _flashTap('⏸');
    }
  });

  // Barra de progreso clicable
  document.getElementById('vm-progress')?.addEventListener('click', e => {
    if (_exporting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoPlayer._frame = Math.floor(pct * videoPlayer._totalFrames);
    videoPlayer._renderFrame(videoPlayer._frame);
    videoPlayer._updateProgress();
  });

  // Reset para poder ver el vídeo de nuevo tras export
  function _resetAfterExport() {
    _hideExport();
    videoPlayer._frame = 0;
    videoPlayer._renderFrame(0);
    videoPlayer._updateProgress();
  }

  // COMPARTIR
  shareBtn.addEventListener('click', async () => {
    if (_exporting) return;
    videoPlayer.pause();
    _showExport();
    try {
      await videoPlayer.shareAsFile(_onProgress);
    } catch (e) { /* ignore */ }
    _resetAfterExport();
  });

  // GUARDAR
  saveBtn.addEventListener('click', async () => {
    if (_exporting) return;
    videoPlayer.pause();
    _showExport();
    try {
      await videoPlayer.downloadWithProgress(_onProgress);
    } catch (e) { /* ignore */ }
    _resetAfterExport();
  });

  // Personalizar — estilo
  modal.querySelectorAll('.vpm-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.vpm-style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Personalizar — aplicar
  document.getElementById('vm-apply')?.addEventListener('click', async () => {
    const activeStyle = modal.querySelector('.vpm-style-btn.active');
    currentParams = {
      ...currentParams,
      style: activeStyle ? activeStyle.dataset.style : currentParams.style,
      titulo: (document.getElementById('vm-titulo-input')?.value || '').trim() || currentParams.titulo
    };
    const tituloEl = modal.querySelector('.video-modal-titulo');
    if (tituloEl) tituloEl.textContent = currentParams.titulo;

    videoPlayer.pause();
    showToast('Regenerando…');
    const oldCanvas = canvasWrap.querySelector('.video-canvas');
    if (oldCanvas) oldCanvas.remove();
    const ok2 = await videoPlayer.init(canvasWrap, photoUrls, currentParams);
    if (ok2) {
      canvasWrap.appendChild(videoPlayer._canvas);
      videoPlayer._progressFill = document.getElementById('vm-progress-fill');
      videoPlayer._onEnd = () => _flashTap('▶');
      videoPlayer.play();
      const details = document.getElementById('vm-customize');
      if (details) details.removeAttribute('open');
    }
  });

  // Cerrar
  document.getElementById('vm-close')?.addEventListener('click', () => {
    videoPlayer.pause();
    modal.remove();
  });
}
window._showVideoModal = _showVideoModal;

// ═══ MIS VIAJES (legacy — redirige a perfil) ═══

async function loadUserGuides() {
  if (!currentUser) { showState('welcome'); return; }

  // Si es el usuario Salma, redirigir al perfil público
  const SALMA_UID = 'LlXDmuXD1qgM97Xya8FiVHONXDw2';
  if (currentUser.uid === SALMA_UID) {
    window.location.href = '/destinos/';
    return;
  }

  $content.innerHTML = `
    <div class="viajes-header fade-in">
      <h2 class="viajes-title">Mis Viajes</h2>
      <div class="viajes-sub">Nacido para el Ocio</div>
    </div>
    <div class="viajes-grid" id="viajes-grid">
      <div class="viaje-card viaje-card-new" id="btn-new-guide">
        <div class="viaje-card-new-icon">+</div>
        <div class="viaje-card-new-txt">NUEVA GUÍA</div>
      </div>
    </div>`;

  document.getElementById('btn-new-guide').addEventListener('click', () => {
    if (typeof salma !== 'undefined') salma.reset();
    showState('welcome');
  });

  try {
    const snap = await db.collection('users').doc(currentUser.uid)
      .collection('maps').orderBy('createdAt', 'desc').limit(30).get();

    const grid = document.getElementById('viajes-grid');

    // Limpiar guías KV pre-generadas (una sola vez) y recopilar las del usuario
    const allGuides = [];
    const kvDocs = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (d.source === 'kv-nivel2') { kvDocs.push(doc); return; }
      allGuides.push({ id: doc.id, data: d });
    });
    if (kvDocs.length > 0) {
      kvDocs.forEach(doc => db.collection('users').doc(currentUser.uid).collection('maps').doc(doc.id).delete().catch(() => {}));
    }

    // Función para crear una card
    function createCard(doc, d) {
      const card = document.createElement('div');
      card.className = 'viaje-card';
      const photo = d.cover_image || destPhoto(d.destino || d.country || d.nombre || '');
      card.innerHTML = `
        <div class="viaje-card-img" style="background-image:url('${escapeHTML(photo)}')"></div>
        <div class="viaje-card-body">
          <div class="viaje-card-title">${escapeHTML(d.nombre || 'Mi ruta')}</div>
          <div class="viaje-card-meta">${d.num_dias || d.dias || '?'} DÍAS · ${escapeHTML((d.destino || '').toUpperCase())}</div>
        </div>
        <button class="viaje-card-delete" data-doc-id="${doc.id}" title="Eliminar guía">✕</button>`;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.viaje-card-delete')) return;
        if (d.source === 'kv-nivel2' && d.slug) {
          window.location.href = '/destinos/' + d.slug + '.html';
          return;
        }
        if (typeof salma !== 'undefined') salma.cargarGuia(doc.id, d);
      });
      card.querySelector('.viaje-card-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar esta guía?')) return;
        try {
          const slug = d.slug;
          if (slug) await db.collection('public_guides').doc(slug).delete();
          await db.collection('users').doc(currentUser.uid).collection('maps').doc(doc.id).delete();
          card.remove();
          // Si el grupo queda vacío, quitar el header
          const group = card.closest('.viaje-group');
          if (group && group.querySelectorAll('.viaje-card').length === 0) group.remove();
          showToast('Guía eliminada');
        } catch (err) {
          showToast('Error al eliminar');
        }
      });
      return card;
    }

    // Si más de 5 guías → agrupar por país (detección en cascada, cacheada en Firestore)
    if (allGuides.length > 5) {
      // Resolver el país de cada guía en paralelo (con límite suave para no saturar Nominatim)
      const resolved = await Promise.all(allGuides.map(g => _detectGuideCountry(g.id, g.data)));
      const byCountry = {};
      for (let i = 0; i < allGuides.length; i++) {
        const g = allGuides[i];
        const c = resolved[i] || { code: 'XX', name: 'Otros', emoji: '' };
        if (!byCountry[c.code]) byCountry[c.code] = { name: c.name, emoji: c.emoji, guides: [] };
        byCountry[c.code].guides.push(g);
      }
      // Ordenar países: el grupo con la guía más reciente primero
      const sorted = Object.keys(byCountry).sort((a, b) => {
        const ta = byCountry[a].guides[0].data.createdAt || '';
        const tb = byCountry[b].guides[0].data.createdAt || '';
        return tb.localeCompare(ta);
      });
      // "Otros" siempre al final
      const otros = sorted.indexOf('XX');
      if (otros > -1) { sorted.splice(otros, 1); sorted.push('XX'); }
      for (const code of sorted) {
        const group = document.createElement('div');
        group.className = 'viaje-group';
        const emoji = byCountry[code].emoji ? byCountry[code].emoji + ' ' : '';
        group.innerHTML = `<div class="viaje-group-header">${emoji}${escapeHTML((byCountry[code].name || 'Otros').toUpperCase())} <span class="viaje-group-count">${byCountry[code].guides.length}</span></div>`;
        const groupGrid = document.createElement('div');
        groupGrid.className = 'viaje-group-grid';
        for (const g of byCountry[code].guides) {
          groupGrid.appendChild(createCard(g, g.data));
        }
        group.appendChild(groupGrid);
        grid.appendChild(group);
      }
    } else if (allGuides.length === 0) {
      // Estado vacío — ninguna ruta todavía
      grid.innerHTML = `
        <div class="viajes-empty">
          <div class="viajes-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
          </div>
          <div class="viajes-empty-title">Aún no tienes ninguna ruta</div>
          <div class="viajes-empty-sub">Dile a Salma a dónde quieres ir y en un minuto tienes tu primera guía con mapa, fotos y toda la info.</div>
          <button class="viajes-empty-btn" id="btn-empty-new">Habla con Salma</button>
        </div>`;
      document.getElementById('btn-empty-new').addEventListener('click', () => {
        if (typeof salma !== 'undefined') { salma.reset(); salma._initChat(); }
        showState('chat');
      });
    } else {
      // Lista plana normal
      for (const g of allGuides) {
        grid.appendChild(createCard(g, g.data));
      }
    }
  } catch (e) {
    console.error('Error cargando guías:', e);
    showToast('Error al cargar guías');
  }
}

// ═══ Detección de país de una guía (cascada + cache en Firestore) ═══
async function _detectGuideCountry(docId, d) {
  // 1. Ya guardado en la guía
  if (d.country_code) {
    const emoji = (typeof countryEmoji === 'function') ? countryEmoji(d.country_code) : '';
    return { code: d.country_code, name: d.country_name || d.country_code, emoji };
  }

  // 2. Texto: destino + nombre
  const txt = [d.destino, d.nombre].filter(Boolean).join(' ');
  if (txt && typeof detectCountryInMessage === 'function') {
    const r = detectCountryInMessage(txt);
    if (r && r.code) {
      _saveGuideCountry(docId, r.code, r.name);
      return r;
    }
  }

  // 3. Parsear itinerarioIA y buscar country en el primer stop
  let firstStop = null;
  try {
    const route = d.itinerarioIA ? JSON.parse(d.itinerarioIA) : null;
    firstStop = route && route.stops && route.stops[0];
    if (firstStop) {
      if (firstStop.country_code && typeof countryEmoji === 'function') {
        const code = String(firstStop.country_code).toUpperCase();
        const name = firstStop.country || code;
        _saveGuideCountry(docId, code, name);
        return { code, name, emoji: countryEmoji(code) };
      }
      if (firstStop.country && typeof normalizeCountry === 'function') {
        const r = normalizeCountry(firstStop.country);
        if (r && r.code) {
          _saveGuideCountry(docId, r.code, r.name);
          return r;
        }
      }
    }
  } catch (_) {}

  // 4. Reverse geocode con Nominatim
  if (firstStop && firstStop.lat && firstStop.lng) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${firstStop.lat}&lon=${firstStop.lng}&format=json&accept-language=es&zoom=3`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const j = await res.json();
        const code = (j.address && j.address.country_code ? j.address.country_code : '').toUpperCase();
        if (code) {
          const name = (j.address && j.address.country) || code;
          _saveGuideCountry(docId, code, name);
          const emoji = (typeof countryEmoji === 'function') ? countryEmoji(code) : '';
          return { code, name, emoji };
        }
      }
    } catch (_) {}
  }

  // 5. Desconocido
  return { code: 'XX', name: 'Otros', emoji: '' };
}

function _saveGuideCountry(docId, code, name) {
  if (!currentUser || typeof db === 'undefined') return;
  db.collection('users').doc(currentUser.uid).collection('maps').doc(docId)
    .set({ country_code: code, country_name: name }, { merge: true })
    .catch(() => {});
}

function destPhoto(destino) {
  const d = (destino || '').toLowerCase().trim();
  const map = {
    vietnam:'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=200&fit=crop',
    tailandia:'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400&h=200&fit=crop',
    thailand:'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400&h=200&fit=crop',
    japón:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop',
    japan:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop',
    'españa':'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=200&fit=crop',
    spain:'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=200&fit=crop',
    'andalucía':'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=200&fit=crop',
  };
  for (const [k, v] of Object.entries(map)) { if (d.includes(k)) return v; }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop';
}

// ═══ AUTH — Pantallas completas ═══

function openModal() {
  const screen = document.getElementById('auth-screen');
  if (!screen) return;
  screen.classList.add('active');
  _checkBiometricAvailable();
}

function closeModal() {
  const screen = document.getElementById('auth-screen');
  if (screen) screen.classList.remove('active');
  const err = document.getElementById('login-error');
  if (err) { err.textContent = ''; err.classList.remove('show'); }
}

window.openModal = openModal;
window.closeModal = closeModal;

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

async function doGoogleLogin() {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    const doc = await db.collection('users').doc(user.uid).get();
    if (!doc.exists) {
      await db.collection('users').doc(user.uid).set({
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        isPremium: false,
        mapsCount: 0,
        coins_saldo: 0,
        rutas_gratis_usadas: 0,
        createdAt: new Date().toISOString()
      });
    }
    closeModal();
    // Ofrecer registrar huella si no la tiene y el dispositivo la soporta
    if (!localStorage.getItem('bdm_webauthn_cred') && window.PublicKeyCredential) {
      registerFingerprint(user.email);
    }
  } catch (e) {
    console.error('Google login error:', e);
    showAuthError('login-error', authErrorMsg(e));
  }
}

// ═══ WebAuthn — Huella dactilar ═══

async function doFingerprintLogin() {
  const btn = document.getElementById('btn-fingerprint');
  if (!btn) return;
  try {
    btn.classList.remove('success','error');
    const storedCred = localStorage.getItem('bdm_webauthn_cred');
    if (!storedCred) { btn.classList.add('error'); return; }
    const { credentialId } = JSON.parse(storedCred);
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        allowCredentials: [{ id: _base64ToBuffer(credentialId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 30000
      }
    });
    if (assertion) {
      btn.classList.add('success');
      // Patrón lock screen: si Firebase tiene sesión viva, solo desbloquear
      if (auth.currentUser) {
        closeModal();
        // Ir directo al chat sin pasar por onAuthStateChanged
        window._fingerprintUnlock = true;
        if (typeof salma !== 'undefined') salma._initChat();
        showState('chat');
        return;
      }
      // Sin sesión Firebase → necesitamos Google popup como fallback
      try {
        await auth.signInWithPopup(googleProvider);
        closeModal();
      } catch (gErr) {
        btn.classList.remove('success');
        btn.classList.add('error');
        showAuthError('login-error', 'Sesión expirada. Usa el botón de Google.');
      }
    }
  } catch (e) {
    btn.classList.add('error');
    if (e.name !== 'NotAllowedError') console.error('WebAuthn error:', e);
  }
}

async function registerFingerprint(email) {
  if (!window.PublicKeyCredential) return;
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: 'Borrado del Mapa', id: location.hostname },
        user: {
          id: new TextEncoder().encode(email),
          name: email,
          displayName: email.split('@')[0]
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
        timeout: 30000
      }
    });
    if (cred) {
      localStorage.setItem('bdm_webauthn_cred', JSON.stringify({
        credentialId: _bufferToBase64(cred.rawId),
        email
      }));
    }
  } catch (e) {
    if (e.name !== 'NotAllowedError') console.error('WebAuthn register error:', e);
  }
}

function _bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
function _base64ToBuffer(base64) {
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

function _checkBiometricAvailable() {
  const stored = localStorage.getItem('bdm_webauthn_cred');
  const biometric = document.getElementById('auth-biometric');
  if (biometric) biometric.classList.toggle('hidden', !stored);
}

// Lock screen — bloquea UI sin cerrar sesión Firebase (huella desbloquea)
function lockScreen() {
  openModal();
}

// Logout real — cierra sesión Firebase (requiere Google para volver)
function logout() {
  auth.signOut();
  currentUser = null;
  if (typeof salma !== 'undefined') salma.reset();
  // onAuthStateChanged se encarga de mostrar el gate
}

function authErrorMsg(e) {
  const map = {
    'auth/email-already-in-use': 'Este email ya tiene cuenta',
    'auth/invalid-email': 'Email no válido',
    'auth/user-not-found': 'No existe cuenta con ese email',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/weak-password': 'Contraseña muy corta (mínimo 6)',
    'auth/too-many-requests': 'Demasiados intentos, espera un momento',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
  };
  return map[e.code] || e.message || 'Error desconocido';
}

// ═══ AUTH STATE ═══

auth.onAuthStateChanged(async (user) => {
  if (user) {
    closeModal();
    let userData = {};
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) userData = userDoc.data();
    } catch (e) {
      console.warn('No se pudo leer doc usuario:', e);
    }

    currentUser = {
      uid: user.uid,
      name: userData.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Viajero'),
      email: user.email || '',
      isPremium: userData.isPremium || false,
      country: userData.country || '',
      coins_saldo: userData.coins_saldo || 0,
      rutas_gratis_usadas: userData.rutas_gratis_usadas || 0,
      avatarURL: userData.avatarURL || '',
      copilot_data: userData.copilot_data || {},
    };

    currentUserSOSConfig = userData.sos_config || {
      contacts: [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
      custom_message: ''
    };

    startTrackingLastPosition();
    _checkSOSQueue();
    _restoreCopilotState();

    updateHeader();

    // Restaurar ruta pendiente
    if (!window._salmaLastRoute) {
      try {
        const backup = localStorage.getItem('_salmaRouteBackup');
        if (backup) window._salmaLastRoute = JSON.parse(backup);
      } catch (e) {}
    }

    if (window._salmaLastRoute && window._salmaLastRoute.stops) {
      await guardarGuiaAuto(window._salmaLastRoute);
      window._salmaLastRoute = null;
      localStorage.removeItem('_salmaRouteBackup');
    }

    // Guardar nota pendiente (usuario se registró al pulsar "Guardar nota")
    if (window._pendingSaveNote) {
      const pending = window._pendingSaveNote;
      window._pendingSaveNote = null;
      if (typeof salma !== 'undefined') {
        salma._saveNoteFromBubble(pending.text, pending.btnEl);
      }
    }

    // Tras login, ir al destino indicado o directo al chat
    hideSplash();
    // Si la huella ya desbloqueó, no redirigir de nuevo
    if (window._fingerprintUnlock) {
      window._fingerprintUnlock = false;
      return;
    }
    const goParam = new URLSearchParams(window.location.search).get('go');
    if (goParam) {
      history.replaceState(null, '', '/');
      showState(goParam);
    } else if (window._afterLogin) {
      const dest = window._afterLogin;
      window._afterLogin = null;
      showState(dest);
    } else if (currentState !== 'sos') {
      // Usuario registrado → directo al chat (no interrumpir SOS)
      if (typeof salma !== 'undefined') salma._initChat();
      showState('chat');
    }

    // Flight alerts — avisar en chat si hay bajadas de precio (async, no bloquea)
    if (typeof flightWatches !== 'undefined') {
      setTimeout(() => flightWatches.injectAlerts(), 2000);
    }
  } else {
    // No hay sesión → mostrar gate obligatorio
    currentUser = null;
    updateHeader();
    hideSplash();
    openModal();
  }
});

// ═══ GUARDAR GUÍA ═══

async function guardarGuia(routeData) {
  if (!currentUser) {
    // Registro lazy — guardar ruta y pedir login
    window._salmaLastRoute = routeData;
    localStorage.setItem('_salmaRouteBackup', JSON.stringify(routeData));
    showToast('Inicia sesión para guardar tu ruta');
    openModal();
    return null;
  }
  return await guardarGuiaDirecto(routeData);
}

async function guardarGuiaDirecto(routeData) {
  try {
    const r = routeData;
    const numDias = r.duration_days ? Number(r.duration_days) : (r.stops ? [...new Set(r.stops.map(s => s.day || 1))].length : 0);
    const destino = (r.region || r.country || '').toString();
    // Normalizar país para bitácora
    const countryInfo = typeof normalizeCountry === 'function'
      ? (normalizeCountry(r.country || '') || normalizeCountry(destino) || normalizeCountry(r.name || ''))
      : { code: '', name: destino };
    const countryNormalized = countryInfo.code ? countryInfo.name : destino;

    // Cover image
    let coverImageUrl = '';
    if (destino) {
      try {
        const stops = r.stops || [];
        const first = stops.find(s => s && s.lat && s.lng && Math.abs(s.lat) > 0.01);
        const url = window.SALMA_API + '/photo?name=' + encodeURIComponent(destino) + '&json=1'
          + (first ? '&lat=' + first.lat + '&lng=' + first.lng : '');
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          coverImageUrl = data.url || '';
        }
      } catch (e) {}
    }

    const ruta = {
      nombre: r.title || r.name || 'Mi ruta',
      destino: destino,
      country: countryNormalized,
      num_dias: numDias,
      dias: numDias,
      notas: r.summary || '',
      cover_image: coverImageUrl,
      itinerarioIA: JSON.stringify(r),
      enriched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false
    };

    const docRef = await db.collection('users').doc(currentUser.uid).collection('maps').add(ruta);
    showToast('Guía guardada');

    // Guardar copia offline en localStorage (disponible sin conexión)
    try {
      const offlineData = { id: docRef.id, ...ruta, _savedAt: Date.now() };
      localStorage.setItem('offline_route_' + docRef.id, JSON.stringify(offlineData));
    } catch (_) {}

    // Contabilizar uso de ruta — gratis (3 primeras) o descontar 2 coins
    try {
      const usadas = currentUser.rutas_gratis_usadas || 0;
      const coins = currentUser.coins_saldo || 0;
      if (usadas < 3) {
        // Ruta gratuita — gastar una de las 3 incluidas
        const newUsadas = usadas + 1;
        await db.collection('users').doc(currentUser.uid).update({ rutas_gratis_usadas: newUsadas });
        currentUser.rutas_gratis_usadas = newUsadas;
        updateHeader();
      } else if (coins >= 2) {
        // Descontar 2 coins (coste de ruta IA según modelo de negocio)
        const newCoins = coins - 2;
        await db.collection('users').doc(currentUser.uid).update({ coins_saldo: newCoins });
        currentUser.coins_saldo = newCoins;
        updateHeader();
        showToast('−2 Salma Coins · saldo: ' + newCoins);
      } else {
        // Sin gratis y sin coins — la ruta ya está guardada, pero avisar
        showToast('Sin Salma Coins. Recarga para seguir creando rutas.');
      }
    } catch (e) {
      console.warn('Error actualizando contador rutas:', e);
    }

    // Publicar guía pública (no esperar)
    const slug = generateSlug(r.title || r.name || 'mi-ruta');
    publishGuide(docRef.id, ruta, slug, r).catch(() => {});

    // Enriquecer en background (no esperar)
    enrichGuia(docRef.id, r);

    return docRef.id;
  } catch (e) {
    console.error('Error guardando guía:', e);
    showToast('Error al guardar: ' + (e.message || ''));
    return null;
  }
}

async function guardarGuiaAuto(routeData) {
  const id = await guardarGuiaDirecto(routeData);
  if (id) showToast('Tu ruta se ha guardado automáticamente');
}

// ═══ GUÍAS PÚBLICAS (SEO) ═══

function generateSlug(title) {
  const base = (title || 'mi-ruta').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  // Añadir timestamp corto para unicidad
  const ts = Date.now().toString(36).slice(-4);
  return base + '-' + ts;
}

async function publishGuide(docId, rutaData, slug, routeData) {
  try {
    await db.collection('public_guides').doc(slug).set({
      slug: slug,
      uid: currentUser.uid, // Ownership: solo el dueño puede editar/borrar (P0-5)
      ownerDocId: docId,
      nombre: rutaData.nombre,
      destino: rutaData.destino,
      num_dias: rutaData.num_dias,
      summary: rutaData.notas || '',
      cover_image: rutaData.cover_image || '',
      itinerarioIA: rutaData.itinerarioIA,
      notes: rutaData.notes || null,
      photos: rutaData.photos || null,
      privacy: rutaData.privacy || 'link',
      owner_name: currentUser?.name || 'Viajero',
      createdAt: rutaData.createdAt,
      updatedAt: rutaData.updatedAt
    });
    // Guardar slug en la guía del usuario
    await db.collection('users').doc(currentUser.uid)
      .collection('maps').doc(docId).update({ slug: slug, published: true });
  } catch (e) {
    console.warn('Error publicando guía:', e);
  }
}

// ═══ ENRIQUECIMIENTO (Pasada 2 — Haiku en background) ═══

async function enrichGuia(docId, routeData) {
  if (!currentUser || !docId || !routeData) return;
  try {
    const res = await fetch(window.SALMA_API + '/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: routeData })
    });
    const data = await res.json();

    if (data.route && data.route.stops) {
      const enrichedJSON = JSON.stringify(data.route);
      await db.collection('users').doc(currentUser.uid)
        .collection('maps').doc(docId).update({
          itinerarioIA: enrichedJSON,
          enriched: true,
          enrichedAt: new Date().toISOString()
        });

      // Actualizar guía pública también
      try {
        const userDoc = await db.collection('users').doc(currentUser.uid)
          .collection('maps').doc(docId).get();
        const slug = userDoc.data()?.slug;
        if (slug) {
          await db.collection('public_guides').doc(slug).update({
            itinerarioIA: enrichedJSON,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (_) {}

      // Si el usuario sigue viendo esta guía, actualizar la vista
      if (typeof salma !== 'undefined' && salma.currentRouteId === docId) {
        salma.currentRoute = data.route;
        // Actualizar cards de mapaItinerario si está activo
        if (typeof mapaItinerario !== 'undefined' && typeof mapaItinerario.updateEnrichedFields === 'function') {
          mapaItinerario.updateEnrichedFields(data.route.stops);
        } else {
          guideRenderer.render(data.route, { saved: true });
        }
      }
    }
  } catch (e) {
    console.warn('Enriquecimiento fallido:', e);
    // No pasa nada — la guía ligera funciona perfectamente
  }
}

window.enrichGuia = enrichGuia;

// ═══ INPUT — textarea auto-resize + enviar ═══

// Reset centralizado de botones cam/mic/send según contenido del input o foto pendiente
function resetInputButtons() {
  const hasText = $input.value.trim().length > 0;
  const hasPhoto = typeof salma !== 'undefined' && !!salma._pendingPhoto;
  const showSend = hasText || hasPhoto;
  if ($send) $send.style.display = showSend ? '' : 'none';
  const chatCam = document.getElementById('cam-btn');
  const chatMic = document.getElementById('mic-btn');
  if (chatCam) chatCam.style.display = showSend ? 'none' : '';
  if (chatMic) chatMic.style.display = showSend ? 'none' : '';
}
window.resetInputButtons = resetInputButtons;

$input.addEventListener('input', () => {
  $input.style.height = 'auto';
  $input.style.height = Math.min($input.scrollHeight, 100) + 'px';
  resetInputButtons();
});

$send.addEventListener('click', sendMessage);

// FAB Mapa → abrir mapa en vivo
const _fabMap = document.getElementById('fab-map');
if (_fabMap) _fabMap.addEventListener('click', () => {
  if (typeof openLiveMap === 'function') openLiveMap();
});

$input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
function sendMessage() {
  const msg = $input.value.trim();
  const hasPendingPhoto = typeof salma !== 'undefined' && salma._pendingPhoto;
  if (!msg && !hasPendingPhoto) return;
  $input.value = '';
  $input.style.height = 'auto';
  resetInputButtons();
  if (typeof salma !== 'undefined') salma.send(msg);
}

// ═══ MICRÓFONO — Speech to Text (event delegation) ═══

(function initMicSystem() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    // Ocultar todos los micros si el navegador no soporta
    document.querySelectorAll('.app-mic').forEach(b => b.style.display = 'none');
    return;
  }

  let listening = false;      // true = sesión de micro activa
  let activeMicBtn = null;
  let activeRec = null;
  let activeInputEl = null;
  let accumulatedText = '';    // texto confirmado de ráfagas anteriores
  let gotResult = false;

  function resetMicState() {
    listening = false;
    if (activeMicBtn) activeMicBtn.classList.remove('listening');
    if (activeInputEl) {
      activeInputEl.classList.remove('mic-active');
      activeInputEl.placeholder = activeInputEl.id === 'welcome-input'
        ? '¿A dónde vamos?' : 'Escribe aquí...';
    }
    activeMicBtn = null;
    activeInputEl = null;
    activeRec = null;
    accumulatedText = '';
    gotResult = false;
  }

  function stopAndSend() {
    listening = false;  // marcar ANTES de stop para que onend no reenganche
    try { if (activeRec) activeRec.stop(); } catch (_) {}
    const inputEl = activeInputEl;
    const hadResult = gotResult;
    resetMicState();
    if (hadResult && inputEl && inputEl.value.trim()) {
      const isWelcome = inputEl.id === 'welcome-input';
      const isMapSearch = inputEl.id === 'map-search-input' || inputEl.id === 'live-map-search-input' || inputEl.id === 'dpick-search-input';
      if (isMapSearch) {
        document.dispatchEvent(new CustomEvent('map:search-submit', { detail: { query: inputEl.value.trim() } }));
        inputEl.value = '';
      } else if (isWelcome) {
        const msg = inputEl.value.trim();
        inputEl.value = '';
        inputEl.style.height = 'auto';
        // Reset welcome buttons
        const wS = document.getElementById('welcome-send');
        const wM = document.getElementById('welcome-mic-btn');
        if (wS) wS.style.display = 'none';
        if (wM) wM.style.display = '';
        if (msg && typeof salma !== 'undefined') salma.send(msg);
      } else {
        sendMessage();
      }
    } else if (!hadResult) {
      if (typeof showToast === 'function') showToast('No he captado nada, pulsa y habla claro');
    }
  }

  function createRec(micBtn, inputEl) {
    const rec = new SpeechRecognition();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = false;    // ráfaga única — escucha bien, sin repeticiones
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      listening = true;
      micBtn.classList.add('listening');
      inputEl.classList.add('mic-active');
      inputEl.placeholder = '🎙️ Escuchando...';
    };

    rec.onresult = (event) => {
      gotResult = true;
      let current = '';
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      // Mostrar acumulado + lo que está diciendo ahora
      const sep = accumulatedText ? ' ' : '';
      inputEl.value = accumulatedText + sep + current;
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    };

    rec.onend = () => {
      if (!listening) return;  // el usuario pidió parar — no reenganchar

      // Guardar texto confirmado de esta ráfaga
      if (inputEl.value.trim()) {
        accumulatedText = inputEl.value.trim();
      }

      // Reenganchar automáticamente con nueva ráfaga
      setTimeout(() => {
        if (!listening) return;
        try {
          const newRec = createRec(micBtn, inputEl);
          activeRec = newRec;
          newRec.start();
        } catch (_) {
          // No se pudo reiniciar — enviar lo que haya
          stopAndSend();
        }
      }, 200);
    };

    rec.onerror = (event) => {
      if (event.error === 'aborted') return;
      // no-speech: no pasa nada, reenganchar
      if (event.error === 'no-speech') return;
      listening = false;
      resetMicState();
      const msgs = {
        'not-allowed': 'Permite el micrófono en ajustes del navegador',
        'network': 'Sin conexión para reconocimiento de voz',
        'audio-capture': 'No se detecta micrófono en el dispositivo'
      };
      if (typeof showToast === 'function') {
        showToast(msgs[event.error] || 'Error de micro: ' + event.error);
      }
    };

    return rec;
  }

  function startListening(micBtn) {
    const row = micBtn.closest('.input-row');
    const inputEl = row ? (row.querySelector('textarea') || row.querySelector('input[type="text"]')) : null;
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
      // Reintentar una vez tras 300ms (Android a veces necesita pausa)
      setTimeout(() => {
        try {
          const rec = createRec(micBtn, inputEl);
          activeRec = rec;
          rec.start();
        } catch (_) {
          resetMicState();
          if (typeof showToast === 'function') showToast('No se pudo iniciar el micro');
        }
      }, 300);
    }
  }

  // Handler único para click y touch
  function handleMicTap(e) {
    const micBtn = e.target.closest('.app-mic');
    if (!micBtn) return;
    e.preventDefault();
    e.stopPropagation();

    if (listening) {
      stopAndSend();
      return;
    }

    startListening(micBtn);
  }

  // Bloquear long-press en el botón de micro (evita menú contextual)
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.app-mic')) e.preventDefault();
  });

  // Evitar que el botón de micro quite el foco al textarea
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.app-mic')) e.preventDefault();
  });

  // touchend responde al instante en móvil (no espera 300ms del click)
  document.addEventListener('touchend', handleMicTap);
  // click como fallback para desktop
  document.addEventListener('click', (e) => {
    // En móvil touchend ya lo manejó, evitar doble disparo
    if (e.target.closest('.app-mic') && 'ontouchend' in window) return;
    handleMicTap(e);
  });
})();

// ═══ AUTH GATE — Event listeners ═══

document.getElementById('btn-google-login')?.addEventListener('click', doGoogleLogin);
document.getElementById('btn-fingerprint')?.addEventListener('click', doFingerprintLogin);

// Logo eliminado — navegación solo por bottom bar

// ═══ MODAL COINS ═══

function openCoinsModal() {
  // Cerrar si ya existe
  const existing = document.getElementById('coins-modal-overlay');
  if (existing) { existing.remove(); return; }

  const coins = currentUser ? (currentUser.coins_saldo || 0) : 0;
  const rutasGratis = currentUser ? Math.max(0, 3 - (currentUser.rutas_gratis_usadas || 0)) : 3;

  const overlay = document.createElement('div');
  overlay.id = 'coins-modal-overlay';
  overlay.className = 'coins-modal-overlay';
  overlay.innerHTML = `
    <div class="coins-modal">
      <button class="coins-modal-close" id="coins-modal-close">&times;</button>

      <!-- Saldo -->
      <div class="coins-modal-saldo">
        <div class="coins-modal-saldo-row">
          <span class="coins-modal-saldo-label">Crédito</span>
          <span class="coins-modal-saldo-val">${coins} coins</span>
        </div>
        <div class="coins-modal-saldo-row">
          <span class="coins-modal-saldo-label">Rutas gratis</span>
          <span class="coins-modal-saldo-val coins-modal-saldo-free">${rutasGratis} de 3</span>
        </div>
      </div>

      <!-- Pago integrado -->
      <div id="stripe-card-wrapper" class="stripe-card-wrapper">
        <div id="stripe-card-element" class="stripe-card-element"></div>
        <div id="stripe-card-errors" class="stripe-card-errors"></div>
      </div>

      <!-- Selector de pack -->
      <div class="coins-packs" id="coins-packs">
        <label class="coins-pack" data-pack="starter" data-coins="10" data-price="4,99€" data-price-raw="499">
          <input type="radio" name="coins-pack" value="starter">
          <div class="coins-pack-inner">
            <div class="coins-pack-coins">10 <span>coins</span></div>
            <div class="coins-pack-name">Starter</div>
            <div class="coins-pack-price">4,99€</div>
          </div>
        </label>
        <label class="coins-pack coins-pack-featured" data-pack="viajero" data-coins="25" data-price="9,99€" data-price-raw="999">
          <input type="radio" name="coins-pack" value="viajero" checked>
          <div class="coins-pack-inner">
            <div class="coins-pack-badge">Popular</div>
            <div class="coins-pack-coins">25 <span>coins</span></div>
            <div class="coins-pack-name">Viajero</div>
            <div class="coins-pack-price">9,99€</div>
          </div>
        </label>
        <label class="coins-pack" data-pack="explorador" data-coins="60" data-price="19,99€" data-price-raw="1999">
          <input type="radio" name="coins-pack" value="explorador">
          <div class="coins-pack-inner">
            <div class="coins-pack-coins">60 <span>coins</span></div>
            <div class="coins-pack-name">Explorador</div>
            <div class="coins-pack-price">19,99€</div>
          </div>
        </label>
      </div>

      <!-- Botón pagar -->
      <div class="coins-modal-plan">
        <div class="coins-modal-plan-row">
          <div class="coins-modal-plan-note" id="coins-plan-note">25 coins · no caducan</div>
          <button class="coins-modal-pay" id="coins-pay-btn" disabled>9,99€</button>
        </div>
        <div class="stripe-test-badge">MODO PRUEBA · no se cobrará</div>
      </div>
      <div id="stripe-loading" class="stripe-loading" style="display:none">
        <div class="stripe-spinner"></div>
        <span>Procesando pago...</span>
      </div>
      <div id="stripe-success" class="stripe-success" style="display:none">
        ✓ ¡<span id="stripe-success-coins">25</span> coins añadidos!
      </div>

      <!-- Acordeón: qué puedes hacer -->
      <button class="coins-modal-accordion" id="coins-accordion">
        <span>¿Qué puedes hacer con coins?</span>
        <span class="coins-modal-accordion-arrow">›</span>
      </button>
      <div class="coins-modal-accordion-body" id="coins-accordion-body">
        <div class="coins-modal-cost"><span>Buscar vuelos reales</span><span>1</span></div>
        <div class="coins-modal-cost"><span>Buscar hoteles reales</span><span>1</span></div>
        <div class="coins-modal-cost"><span>Crear ruta con IA</span><span>2</span></div>
        <div class="coins-modal-cost"><span>Copiloto en tu viaje</span><span>3</span></div>
        <div class="coins-modal-cost"><span>Modo emergencia</span><span>2</span></div>
        <div class="coins-modal-cost"><span>Resumen post-viaje</span><span>1</span></div>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Cerrar
  document.getElementById('coins-modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  // Acordeón
  document.getElementById('coins-accordion').addEventListener('click', () => {
    const body = document.getElementById('coins-accordion-body');
    const arrow = overlay.querySelector('.coins-modal-accordion-arrow');
    const open = body.classList.toggle('open');
    arrow.style.transform = open ? 'rotate(90deg)' : '';
  });

  // Selección de pack — actualiza botón y nota
  overlay.querySelectorAll('.coins-pack').forEach(label => {
    label.addEventListener('click', () => {
      overlay.querySelectorAll('.coins-pack').forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
      label.querySelector('input').checked = true;
      const payBtn = document.getElementById('coins-pay-btn');
      const noteEl = document.getElementById('coins-plan-note');
      if (payBtn) payBtn.textContent = label.dataset.price;
      if (noteEl) noteEl.textContent = label.dataset.coins + ' coins · no caducan';
    });
  });
  // Marcar viajero como seleccionado por defecto
  const defaultPack = overlay.querySelector('.coins-pack-featured');
  if (defaultPack) defaultPack.classList.add('selected');

  // Stripe Elements — formulario de tarjeta integrado
  initStripeCard(overlay);
}

// ═══ STRIPE ELEMENTS — Tarjeta integrada ═══

function initStripeCard(overlay) {
  // STRIPE_PK: tu publishable key de Stripe (test o live)
  // De momento usa la test key. Cuando tengas la real, cámbiala aquí.
  const STRIPE_PK = 'pk_test_51TEhUfDT9GNHUXNZJB0yABaUKu4KIR7HPihR2RJaHIOeSmDfBZvcplmXjcFfeUVQbBYSHURE0HmXoRz1DeD5l0Qc00R0YSOWwe';

  const cardEl = document.getElementById('stripe-card-element');
  const errorsEl = document.getElementById('stripe-card-errors');
  const payBtn = document.getElementById('coins-pay-btn');
  const loadingEl = document.getElementById('stripe-loading');
  const successEl = document.getElementById('stripe-success');
  const wrapperEl = document.getElementById('stripe-card-wrapper');

  // Si Stripe no cargó o no hay key real, mostrar placeholder
  if (typeof Stripe === 'undefined' || STRIPE_PK.includes('PLACEHOLDER')) {
    cardEl.innerHTML = '<div class="stripe-placeholder">Introduce tu Stripe key para activar pagos</div>';
    payBtn.disabled = true;
    return;
  }

  const stripe = Stripe(STRIPE_PK);
  const elements = stripe.elements();
  const card = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        color: '#f5f0e8',
        fontFamily: '"Inter", sans-serif',
        fontSize: '15px',
        '::placeholder': { color: 'rgba(244,239,230,.35)' }
      },
      invalid: { color: '#ef4444' }
    }
  });
  card.mount('#stripe-card-element');

  card.on('change', (event) => {
    errorsEl.textContent = event.error ? event.error.message : '';
    payBtn.disabled = !event.complete;
  });

  payBtn.addEventListener('click', async () => {
    payBtn.disabled = true;
    wrapperEl.style.display = 'none';
    loadingEl.style.display = 'flex';

    try {
      // Leer pack seleccionado del modal
      const selectedLabel = overlay.querySelector('.coins-pack.selected') || overlay.querySelector('.coins-pack-featured');
      const selectedPack = selectedLabel ? selectedLabel.dataset.pack : 'viajero';
      const selectedCoins = parseInt(selectedLabel ? selectedLabel.dataset.coins : '25', 10);
      const selectedPrice = selectedLabel ? selectedLabel.dataset.price : '9,99€';

      // 1. Pedir PaymentIntent al worker
      const res = await fetch(window.SALMA_API + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.uid,
          pack: selectedPack
        })
      });
      const payData = await res.json();
      if (!payData.client_secret) throw new Error(payData.error || 'Error creando pago');
      const { client_secret, coins: coinsFromServer } = payData;
      const coinsToAdd = coinsFromServer || selectedCoins;

      // 2. Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card: card }
      });

      if (error) {
        loadingEl.style.display = 'none';
        wrapperEl.style.display = '';
        errorsEl.textContent = error.message;
        payBtn.disabled = false;
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // TODO: P0-1 — Los coins se sumarán via Stripe webhook (server-side).
        // La actualización client-side se ha eliminado por seguridad.
        // Cuando el webhook esté implementado, el server actualizará Firestore
        // y el frontend detectará el cambio automáticamente.

        // Mostrar confirmación de pago (sin sumar coins localmente)
        const coinsSpan = document.getElementById('stripe-success-coins');
        if (coinsSpan) coinsSpan.textContent = coinsToAdd;
        loadingEl.style.display = 'none';
        successEl.style.display = 'flex';

        // Cerrar modal tras 2s
        setTimeout(() => {
          overlay.remove();
          showToast('Pago confirmado — coins pendientes de activar');
        }, 2000);
      }
    } catch (e) {
      loadingEl.style.display = 'none';
      wrapperEl.style.display = '';
      errorsEl.textContent = 'Error de conexión. Inténtalo de nuevo.';
      payBtn.disabled = false;
    }
  });
}

window.openCoinsModal = openCoinsModal;

// ═══ COPILOTO — toggle con lógica de Coins ═══

function toggleCopilot() {}
function _doCopilotActivate() {}

// Copiloto eliminado — función vacía para compatibilidad
function _restoreCopilotState() {}

window.toggleCopilot = toggleCopilot;

// ═══ CONFIGURACIÓN COMPARTIDA DE MAPAS ═══

window._mapConfig = { food: false, medical: false, lodging: false, shopping: false, parks: false, culture: false, transit: false };

// PlacesService types por categoría (reales, no estilos)
const _catConfig = {
  food:     { types: ['restaurant', 'cafe', 'bar', 'bakery'],                         color: '#E87040', label: '🍽' },
  medical:  { types: ['pharmacy', 'hospital', 'doctor'],                              color: '#D9534F', label: '+' },
  lodging:  { types: ['lodging'],                                                     color: '#5BC0DE', label: 'H' },
  shopping: { types: ['supermarket', 'grocery_or_supermarket', 'convenience_store'],  color: '#AA66CC', label: 'S' },
  parks:    { types: ['park'],                                                        color: '#5CB85C', label: 'P' },
  culture:  { types: ['museum', 'tourist_attraction', 'art_gallery'],                 color: '#D4A843', label: 'A' },
  transit:  { types: ['transit_station', 'bus_station', 'subway_station'],            color: '#666',    label: 'T' },
};

let _poiInfoWindow = null;
let _placesService = null;
let _catMarkers = {};

function _buildMapStyle() {
  window._mapStyle = [
    { featureType: 'poi',     elementType: 'all', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'all', stylers: [{ visibility: 'off' }] },
  ];
  return window._mapStyle;
}

function _applyMapStyle() {
  const style = _buildMapStyle();
  if (_liveMap) _liveMap.setOptions({ styles: style });
  if (typeof mapaRuta !== 'undefined' && mapaRuta._map && mapaRuta._mapType === 'google') {
    mapaRuta._map.setOptions({ styles: style });
  }
}

function _showPoiInfo(place, latLng, placeId) {
  if (!_poiInfoWindow || !_liveMap) return;
  const photoHtml = place.photos && place.photos.length
    ? `<img src="${place.photos[0].getUrl({ maxWidth: 280, maxHeight: 140 })}" style="width:100%;height:130px;object-fit:cover;border-radius:10px 10px 0 0;display:block">`
    : `<div style="width:100%;height:70px;background:#f0f0f0;border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:center;font-size:32px">📍</div>`;
  const stars = place.rating ? `<span style="color:#F5A623;font-size:11px">★ ${place.rating.toFixed(1)}</span>` : '';
  const mapsUrl = place.url || (placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : '#');
  const content = `
    <div style="font-family:'Inter',sans-serif;width:260px;border-radius:10px;overflow:hidden;background:#fff">
      ${photoHtml}
      <div style="padding:10px 12px 12px">
        <div style="font-size:15px;font-weight:700;color:#111;line-height:1.3;margin-bottom:4px">${place.name || ''}</div>
        ${stars}
        ${place.formatted_address ? `<div style="font-size:11px;color:#777;margin-top:4px;margin-bottom:10px">${place.formatted_address}</div>` : '<div style="margin-bottom:8px"></div>'}
        <a href="${mapsUrl}" target="_blank" rel="noopener"
          style="display:flex;align-items:center;justify-content:center;gap:6px;background:#4285F4;color:#fff;border-radius:8px;padding:8px;font-size:12px;font-weight:600;text-decoration:none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="rgba(255,255,255,.9)"/></svg>
          Ver en Google Maps
        </a>
      </div>
    </div>`;
  _poiInfoWindow.setContent(content);
  _poiInfoWindow.setPosition(latLng || place.geometry?.location);
  _poiInfoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -10) });
  _poiInfoWindow.open(_liveMap);
}

function _loadCatMarkers(cat) {
  if (!_liveMap || !_placesService) return;
  const cfg = _catConfig[cat];
  if (!cfg) return;
  if (!_catMarkers[cat]) _catMarkers[cat] = [];
  const seenIds = new Set(_catMarkers[cat].map(m => m._placeId).filter(Boolean));
  const bounds = _liveMap.getBounds();

  function addResults(results, pagination) {
    if (!results || !results.length) return;
    results.forEach(place => {
      if (!place.geometry || !place.place_id) return;
      if (seenIds.has(place.place_id)) return;
      seenIds.add(place.place_id);
      const marker = new google.maps.Marker({
        map: _liveMap,
        position: place.geometry.location,
        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: cfg.color, fillOpacity: 0.92, strokeColor: '#fff', strokeWeight: 2, scale: 12 },
        label: { text: cfg.label, color: '#fff', fontSize: '10px', fontWeight: '700' },
        title: place.name,
        zIndex: 10,
      });
      marker._placeId = place.place_id;
      marker.addListener('click', () => {
        _placesService.getDetails(
          { placeId: place.place_id, fields: ['name', 'photos', 'formatted_address', 'rating', 'url', 'geometry'] },
          (detail, s) => {
            if (s !== google.maps.places.PlacesServiceStatus.OK || !detail) return;
            _showPoiInfo(detail, detail.geometry.location, place.place_id);
          }
        );
      });
      _catMarkers[cat].push(marker);
    });
    if (pagination && pagination.hasNextPage) pagination.nextPage();
  }

  cfg.types.forEach(type => {
    const req = bounds
      ? { bounds, type }
      : { location: _liveMap.getCenter(), radius: 5000, type };
    _placesService.nearbySearch(req, addResults);
  });
}

function _removeCatMarkers(cat) {
  (_catMarkers[cat] || []).forEach(m => m.setMap(null));
  _catMarkers[cat] = [];
}

function toggleMapCat(checkbox) {
  const cat = checkbox.dataset.cat;
  window._mapConfig[cat] = checkbox.checked;
  if (checkbox.checked) {
    _loadCatMarkers(cat);
  } else {
    _removeCatMarkers(cat);
  }
}

function _closeMapPanels() {
  document.getElementById('live-map-layers-panel').style.display = 'none';
  document.getElementById('live-map-maptype-panel').style.display = 'none';
}

function toggleMapLayersPanel() {
  const panel = document.getElementById('live-map-layers-panel');
  if (panel) {
    document.getElementById('live-map-maptype-panel').style.display = 'none';
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }
}

function toggleMapTypePanel() {
  const panel = document.getElementById('live-map-maptype-panel');
  if (panel) {
    document.getElementById('live-map-layers-panel').style.display = 'none';
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
  }
}


function setLiveMapType(type) {
  if (_liveMap) _liveMap.setMapTypeId(type);
  document.getElementById('live-map-maptype-panel').style.display = 'none';
  document.querySelectorAll('.lmt-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
}

window.toggleMapCat = toggleMapCat;
window.toggleMapLayersPanel = toggleMapLayersPanel;
window.toggleMapTypePanel = toggleMapTypePanel;
window.setLiveMapType = setLiveMapType;

// Inicializar estilo base
_buildMapStyle();

// ═══ MAPA EN VIVO ═══

let _liveMap = null;
let _liveMapWatchId = null;
let _liveUserMarker = null;
let _liveRouteMarkers = [];
let _liveRoutePolyline = null;

function openLiveMap() {
  const view = document.getElementById('live-map-view');
  const bar = document.getElementById('app-bottom-bar');
  if (!view) return;

  view.style.display = 'block';
  if (bar) bar.style.display = 'none';
  // Header eliminado — no hay nada que ocultar
  // Ocultar elementos que se filtran al mapa
  const inputBar = document.querySelector('.app-input-bar');
  if (inputBar) inputBar.style.display = 'none';
  const fab = document.getElementById('fab-map');
  if (fab) fab.style.display = 'none';

  // Cerrar cualquier sheet que haya quedado abierta
  closeSalmaMapSheet();
  closeTapSheet();
  closeShareSheet();
  _closeMapPanels();

  // Si el mapa ya existe, solo reanudar GPS y forzar redimensión
  if (_liveMap) {
    setTimeout(() => google.maps.event.trigger(_liveMap, 'resize'), 100);
    _resumeMapGPS();
    return;
  }

  (window._loadGoogleMaps ? window._loadGoogleMaps() : Promise.reject())
    .then(() => {
      const el = document.getElementById('live-map-container');
      if (!el || _liveMap) return;

      const _lastPos = JSON.parse(localStorage.getItem('salma_last_pos') || 'null');
      _liveMap = new google.maps.Map(el, {
        zoom: 15,
        center: _lastPos || { lat: 40.416, lng: -3.703 },
        heading: 0,
        tiltInteractionEnabled: false,
        mapTypeId: 'hybrid',
        styles: window._mapStyle,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
      });

      _poiInfoWindow = new google.maps.InfoWindow();
      _placesService = new google.maps.places.PlacesService(_liveMap);

      _liveMap.addListener('click', _onMapTap);
      _liveMap.addListener('drag', _closeMapPanels);

      // Forzar que Google Maps recalcule tamaño (el contenedor pasa de display:none a visible)
      setTimeout(() => google.maps.event.trigger(_liveMap, 'resize'), 200);

      // Brújula (centro-izquierda)
      _renderLiveCompass(el);

      // Cargar pins guardados del usuario
      _loadSavedPins();

      _resumeMapGPS();

      // Restaurar ruta activa — primero Firestore (sync entre dispositivos), fallback localStorage
      _restoreActiveRoute();
    })
    .catch((e) => {
      console.error('[LiveMap] Error cargando Google Maps:', e);
      showToast('No se pudo cargar Google Maps');
    });
}

// ═══ BRÚJULA LIVE MAP ═══
let _liveCompassHandler = null;
function _renderLiveCompass(mapEl) {
  if (!mapEl) return;
  mapEl.querySelector('.map-compass')?.remove();
  if (_liveCompassHandler) {
    window.removeEventListener('deviceorientation', _liveCompassHandler, true);
    _liveCompassHandler = null;
  }
  // Brújula siempre visible al abrir mapa (se resetea cada apertura)
  localStorage.removeItem('compass_hidden');

  const compass = document.createElement('div');
  compass.className = 'map-compass';
  compass.innerHTML = `
    <button class="map-compass-close" aria-label="Cerrar brújula">&times;</button>
    <div class="map-compass-ring">
      <div class="map-compass-n">N</div>
      <div class="map-compass-e">E</div>
      <div class="map-compass-s">S</div>
      <div class="map-compass-w">O</div>
      <div class="map-compass-needle">
        <div class="map-compass-needle-n"></div>
        <div class="map-compass-needle-s"></div>
      </div>
    </div>`;
  mapEl.style.position = 'relative';
  mapEl.appendChild(compass);

  const ring = compass.querySelector('.map-compass-ring');

  compass.querySelector('.map-compass-close').addEventListener('click', (e) => {
    e.stopPropagation();
    compass.remove();
    if (_liveCompassHandler) {
      window.removeEventListener('deviceorientation', _liveCompassHandler, true);
      _liveCompassHandler = null;
    }
    localStorage.setItem('compass_hidden', '1');
  });

  // Heading del mapa (rotación 3D)
  if (_liveMap) {
    _liveMap.addListener('heading_changed', () => {
      if (_liveCompassHandler) return; // magnetómetro tiene prioridad
      const heading = _liveMap.getHeading() || 0;
      ring.style.transform = `rotate(${-heading}deg)`;
    });
  }

  // Magnetómetro del móvil
  const onOrientation = (e) => {
    let heading = null;
    if (typeof e.webkitCompassHeading === 'number') {
      heading = e.webkitCompassHeading;
    } else if (typeof e.alpha === 'number') {
      heading = 360 - e.alpha;
    }
    if (heading === null) return;
    ring.style.transform = `rotate(${-heading}deg)`;
  };

  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    const askPermission = () => {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            _liveCompassHandler = onOrientation;
            window.addEventListener('deviceorientation', onOrientation, true);
          }
        }).catch(() => {});
      compass.removeEventListener('click', askPermission);
    };
    compass.addEventListener('click', askPermission);
  } else if (typeof DeviceOrientationEvent !== 'undefined') {
    _liveCompassHandler = onOrientation;
    window.addEventListener('deviceorientation', onOrientation, true);
  }
}

function _resumeMapGPS() {
  if (!navigator.geolocation || _liveMapWatchId !== null) return;
  // maximumAge alto → usa posición cacheada del navegador (respuesta inmediata)
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (_liveMap && !_liveUserMarker) _liveMap.setCenter(latlng);
    _placeUserMarker(latlng);
  }, null, { maximumAge: 60000, timeout: 10000 });
  _liveMapWatchId = navigator.geolocation.watchPosition(pos => {
    _placeUserMarker({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  }, null, { enableHighAccuracy: true, maximumAge: 5000 });
}

function _placeUserMarker(latlng) {
  if (!_liveMap) return;
  localStorage.setItem('salma_last_pos', JSON.stringify({ lat: latlng.lat, lng: latlng.lng, ts: Date.now() }));
  if (_liveUserMarker) {
    _liveUserMarker.setPosition(latlng);
  } else {
    _liveUserMarker = new google.maps.Marker({
      map: _liveMap,
      position: latlng,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
        scale: 10,
      },
      title: 'Tu ubicación',
      zIndex: 999,
    });
  }
  _updateNearestChip();
}

function liveMapCenter() {
  if (!_liveMap || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    _liveMap.panTo(latlng);
    _liveMap.setZoom(16);
  });
}

function closeLiveMap() {
  const view = document.getElementById('live-map-view');
  const bar = document.getElementById('app-bottom-bar');
  if (view) view.style.display = 'none';
  if (bar) bar.style.display = '';
  // Header eliminado — no hay nada que restaurar
  // Restaurar elementos ocultos
  const inputBar = document.querySelector('.app-input-bar');
  if (inputBar && currentState === 'chat') inputBar.style.display = '';
  const fab = document.getElementById('fab-map');
  if (fab && currentUser && currentState !== 'welcome') fab.style.display = '';
  // Cerrar sheets y paneles
  _closeMapPanels();
  closeSalmaMapSheet();
  closeTapSheet();
  closeShareSheet();
  // Limpiar markers de búsqueda
  closeDiarioPicker();
  // Pausar GPS (se reanuda al volver)
  if (_liveMapWatchId !== null) {
    navigator.geolocation.clearWatch(_liveMapWatchId);
    _liveMapWatchId = null;
  }
  // El mapa queda vivo en memoria — pins, ruta y capas se preservan
  // Volver al chat al cerrar el mapa
  if (currentState !== 'chat') showState('chat');
}

async function openRouteSelector() {
  if (!currentUser || typeof db === 'undefined') return;
  const sheet = document.getElementById('live-map-routes-sheet');
  const list = document.getElementById('live-map-routes-list');
  if (!sheet || !list) return;

  list.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(244,239,230,.4)">Cargando...</div>';
  sheet.style.display = 'block';

  try {
    const snap = await db.collection('users').doc(currentUser.uid).collection('maps')
      .orderBy('createdAt', 'desc').limit(30).get();

    if (snap.empty) {
      list.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(244,239,230,.4)">No tienes rutas guardadas</div>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      // Las paradas están serializadas en itinerarioIA
      let routeData = null;
      try { routeData = d.itinerarioIA ? JSON.parse(d.itinerarioIA) : null; } catch(_) {}
      const stops = routeData?.stops || [];
      const validStops = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01);
      const days = d.num_dias || d.dias || '?';
      const item = document.createElement('div');
      item.className = 'lmrs-item';
      item.innerHTML = `<span class="lmrs-item-title">${d.nombre || 'Mi ruta'}</span>
        <span class="lmrs-item-meta">${days} día${days > 1 ? 's' : ''} · ${validStops.length} paradas con coords</span>`;
      item.addEventListener('click', () => {
        if (routeData) selectRouteOnMap(routeData, doc.id);
        else showToast('Esta ruta no tiene datos de mapa');
        closeRouteSelector();
      });
      list.appendChild(item);
    });
  } catch(e) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(244,239,230,.4)">Error cargando rutas</div>';
  }
}

function closeRouteSelector() {
  document.getElementById('live-map-routes-sheet').style.display = 'none';
}

let _liveRouteStops = [];
let _liveInfoWindow = null;
let _activeRouteData = null;

function selectRouteOnMap(routeData, docId) {
  if (!_liveMap || !window.google) return;
  clearRouteFromLiveMap();
  _activeRouteData = routeData;
  _activeRouteDocId = docId || null;
  try { localStorage.setItem('bdm_live_active_route', JSON.stringify(routeData)); } catch(_){}
  try { if (docId) localStorage.setItem('bdm_live_active_route_id', docId); else localStorage.removeItem('bdm_live_active_route_id'); } catch(_){}
  // Sincronizar con Firestore (entre dispositivos)
  if (currentUser && typeof db !== 'undefined') {
    db.collection('users').doc(currentUser.uid)
      .set({ active_route_id: docId || null }, { merge: true })
      .catch(() => {});
  }

  const dayColors = ['#D4A843','#E87040','#5CB85C','#5BC0DE','#D9534F','#AA66CC','#FF8C00'];
  const valid = (routeData.stops || []).filter(s => s.lat && s.lng);
  if (!valid.length) { showToast('Esta ruta no tiene coordenadas'); return; }

  _liveRouteStops = valid;
  _liveInfoWindow = new google.maps.InfoWindow();
  const bounds = new google.maps.LatLngBounds();

  _liveRouteMarkers = valid.map((stop, i) => {
    const color = dayColors[((stop.day || 1) - 1) % dayColors.length];
    const marker = new google.maps.Marker({
      map: _liveMap,
      position: { lat: stop.lat, lng: stop.lng },
      label: { text: String(i + 1), color: '#fff', fontSize: '11px', fontWeight: '700' },
      icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 13 },
      title: stop.headline || stop.name || `Parada ${i + 1}`,
    });
    marker.addListener('click', () => _showStopInfo(stop, i, marker, color));
    bounds.extend({ lat: stop.lat, lng: stop.lng });
    return marker;
  });

  _liveRoutePolyline = new google.maps.Polyline({
    path: valid.map(s => ({ lat: s.lat, lng: s.lng })),
    map: _liveMap,
    strokeColor: '#D4A843',
    strokeWeight: 3,
    strokeOpacity: 0.7,
  });

  _liveMap.fitBounds(bounds, { top: 80, right: 40, bottom: 80, left: 40 });
  document.getElementById('live-map-clear-route').style.display = 'block';
  _updateNearestChip();
}

function _showStopInfo(stop, i, marker, color) {
  const gmapsUrl = stop.place_id
    ? `https://www.google.com/maps/place/?q=place_id:${stop.place_id}`
    : `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}&travelmode=driving`;

  const _buildStopContent = (photoHtml) => `
    <div style="font-family:'Inter',sans-serif;width:280px;max-height:380px;border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;">
      ${photoHtml}
      <div style="padding:10px 12px 12px;overflow-y:auto;flex:1;">
        <div style="font-size:10px;color:${color};font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Día ${stop.day || i+1}</div>
        <div style="font-size:14px;font-weight:700;color:#111;line-height:1.3;margin-bottom:6px">${stop.headline || stop.name || `Parada ${i+1}`}</div>
        ${stop.narrative ? `<div style="font-size:12px;color:#555;line-height:1.5;margin-bottom:8px">${stop.narrative}</div>` : ''}
        ${stop.context ? `<div style="font-size:11px;color:#777;line-height:1.4;margin-bottom:6px">📖 ${stop.context}</div>` : ''}
        ${stop.food_nearby ? `<div style="font-size:11px;color:#777;line-height:1.4;margin-bottom:6px">🍜 ${stop.food_nearby}</div>` : ''}
        ${stop.local_secret ? `<div style="font-size:11px;color:#777;line-height:1.4;margin-bottom:6px">🔑 ${stop.local_secret}</div>` : ''}
        <a href="${gmapsUrl}" target="_blank" rel="noopener"
          style="display:flex;align-items:center;justify-content:center;gap:6px;background:#4285F4;color:#fff;border-radius:8px;padding:8px;font-size:12px;font-weight:600;text-decoration:none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="rgba(255,255,255,.9)"/></svg>
          Cómo llegar
        </a>
      </div>
    </div>`;

  const placeholderHtml = `<div style="width:100%;height:130px;flex-shrink:0;background:linear-gradient(135deg,${color}44,${color}22);border-radius:10px 10px 0 0;display:flex;align-items:center;justify-content:center;font-size:28px">${_stopEmoji(stop)}</div>`;

  _liveInfoWindow.setContent(_buildStopContent(placeholderHtml));
  _liveInfoWindow.open(_liveMap, marker);

  // Cargar foto real: photo_ref primero, si falla fallback por nombre+coords
  if (window.SALMA_API) {
    const _setPhoto = (url) => {
      const imgHtml = `<img src="${url}" style="width:100%;height:130px;object-fit:cover;display:block;border-radius:10px 10px 0 0;flex-shrink:0;" onerror="this.style.display='none'">`;
      _liveInfoWindow.setContent(_buildStopContent(imgHtml));
    };
    const _tryByName = () => {
      if (!(stop.name || stop.headline)) return;
      fetch(`${window.SALMA_API}/photo?name=${encodeURIComponent(stop.name || stop.headline)}&lat=${stop.lat}&lng=${stop.lng}&json=1`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.url) _setPhoto(data.url); })
        .catch(() => {});
    };

    if (stop.photo_ref) {
      fetch(`${window.SALMA_API}/photo?ref=${encodeURIComponent(stop.photo_ref)}&json=1`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.url) _setPhoto(data.url); else _tryByName(); })
        .catch(() => _tryByName());
    } else {
      _tryByName();
    }
  }
}

function _stopEmoji(stop) {
  const n = (stop.name || stop.headline || '').toLowerCase();
  if (n.includes('playa') || n.includes('beach')) return '🏖️';
  if (n.includes('templo') || n.includes('temple') || n.includes('iglesia')) return '🛕';
  if (n.includes('muse')) return '🏛️';
  if (n.includes('parque') || n.includes('park')) return '🌿';
  if (n.includes('monta') || n.includes('mount')) return '⛰️';
  return '📍';
}

function _haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function _updateNearestChip() {
  const chip = document.getElementById('live-map-nearest-chip');
  if (!chip || !_liveRouteStops.length || !_liveUserMarker) return;
  const pos = _liveUserMarker.getPosition();
  if (!pos) return;
  let nearest = null, minDist = Infinity;
  _liveRouteStops.forEach((stop, i) => {
    const d = _haversineKm(pos.lat(), pos.lng(), stop.lat, stop.lng);
    if (d < minDist) { minDist = d; nearest = { stop, i }; }
  });
  if (!nearest) return;
  const dist = minDist < 1 ? Math.round(minDist * 1000) + ' m' : minDist.toFixed(1) + ' km';
  const label = nearest.stop.headline || nearest.stop.name || `Parada ${nearest.i + 1}`;
  chip.textContent = `📍 #${nearest.i + 1} ${label} · ${dist}`;
  chip.style.display = 'block';
  chip.style.pointerEvents = 'auto';
  chip.style.cursor = 'pointer';
  chip.onclick = () => {
    const dayColors = ['#D4A843','#E87040','#5CB85C','#5BC0DE','#D9534F','#AA66CC','#FF8C00'];
    const color = dayColors[((nearest.stop.day || 1) - 1) % dayColors.length];
    _liveMap.panTo({ lat: nearest.stop.lat, lng: nearest.stop.lng });
    _liveMap.setZoom(14);
    _showStopInfo(nearest.stop, nearest.i, _liveRouteMarkers[nearest.i], color);
  };
}

function clearRouteFromLiveMap() {
  _activeRouteData = null;
  _activeRouteDocId = null;
  try { localStorage.removeItem('bdm_live_active_route'); } catch(_){}
  try { localStorage.removeItem('bdm_live_active_route_id'); } catch(_){}
  if (currentUser && typeof db !== 'undefined') {
    db.collection('users').doc(currentUser.uid)
      .set({ active_route_id: null }, { merge: true })
      .catch(() => {});
  }
  _liveRouteMarkers.forEach(m => m.setMap(null));
  _liveRouteMarkers = [];
  if (_liveRoutePolyline) { _liveRoutePolyline.setMap(null); _liveRoutePolyline = null; }
  if (_liveInfoWindow) { _liveInfoWindow.close(); }
  _liveRouteStops = [];
  const btn = document.getElementById('live-map-clear-route');
  if (btn) btn.style.display = 'none';
  const chip = document.getElementById('live-map-nearest-chip');
  if (chip) chip.style.display = 'none';
}

async function _restoreActiveRoute() {
  // 1) Intentar Firestore (sincronizado entre dispositivos)
  if (currentUser && typeof db !== 'undefined') {
    try {
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      const activeId = userDoc.exists ? userDoc.data().active_route_id : null;
      if (activeId) {
        const mapDoc = await db.collection('users').doc(currentUser.uid).collection('maps').doc(activeId).get();
        if (mapDoc.exists) {
          const d = mapDoc.data();
          let routeData = null;
          try { routeData = d.itinerarioIA ? JSON.parse(d.itinerarioIA) : null; } catch(_){}
          if (routeData) { selectRouteOnMap(routeData, activeId); return; }
        }
        // La ruta ya no existe → limpiar referencia
        await db.collection('users').doc(currentUser.uid).set({ active_route_id: null }, { merge: true }).catch(() => {});
      }
    } catch(_){}
  }
  // 2) Fallback localStorage (offline o sesión invitada)
  try {
    const saved = JSON.parse(localStorage.getItem('bdm_live_active_route') || 'null');
    const savedId = localStorage.getItem('bdm_live_active_route_id') || null;
    if (saved) selectRouteOnMap(saved, savedId);
  } catch(_){}
}

window.closeLiveMap = closeLiveMap;
window.liveMapCenter = liveMapCenter;
window.openRouteSelector = openRouteSelector;
window.closeRouteSelector = closeRouteSelector;
window.clearRouteFromLiveMap = clearRouteFromLiveMap;

// ═══ SALMA MAPA — Guardar lugares ═══

let _mapPins = [];
let _savedPinsData = []; // persiste entre sesiones del mapa
let _tapPin = null;
let _tapLatLng = null;
let _tapPhotoBase64 = null;
let _pinIdCounter = 0;
let _activeRouteDocId = null;

// ── Cargar pins guardados de Firestore ──
let _pinsLoaded = false;
async function _loadSavedPins() {
  if (_pinsLoaded || !currentUser || typeof db === 'undefined' || !_liveMap || !window.google) return;
  _pinsLoaded = true;
  try {
    const snap = await db.collection('users').doc(currentUser.uid).collection('pins').get();
    if (snap.empty) return;
    snap.forEach(doc => {
      const d = doc.data();
      if (!d.lat || !d.lng) return;
      const pinId = 'db_' + doc.id;
      // Evitar duplicados si ya existe en memoria
      if (_savedPinsData.some(p => p._pinId === pinId)) return;
      const marker = new google.maps.Marker({
        map: _liveMap, position: { lat: d.lat, lng: d.lng },
        icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#D4A843', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 1.8, anchor: new google.maps.Point(12, 22) },
        title: d.locName || 'Pin guardado', zIndex: 150,
      });
      marker._pinId = pinId;
      marker._pinData = { lat: d.lat, lng: d.lng, locName: d.locName || '', photoUrl: d.photoUrl || null };
      marker._firestoreId = doc.id;
      marker.addListener('click', () => _showPinInfo(marker));
      _mapPins.push(marker);
      _savedPinsData.push({ lat: d.lat, lng: d.lng, locName: d.locName || '', place_type: d.place_type || 'other', _pinId: pinId });
    });
  } catch (e) { console.warn('[LoadPins]', e); }
  // Mostrar botón video si hay 3+ pins con foto
  const photoPins = _mapPins.filter(m => m._pinData && m._pinData.photoUrl);
  const videoBtn = document.getElementById('dpick-video-btn');
  if (videoBtn) videoBtn.style.display = photoPins.length >= 3 ? '' : 'none';
}

// ── Recargar pins desde Firestore (tras añadir fotos compartidas, etc) ──
async function reloadSavedPins() {
  // Quitar markers actuales del mapa
  _mapPins.forEach(m => m.setMap(null));
  _mapPins = [];
  _savedPinsData = [];
  _pinsLoaded = false;
  await _loadSavedPins();
}
window.reloadSavedPins = reloadSavedPins;

// ── Encuadrar el mapa en un conjunto de coords ──
function liveMapFitPins(coords) {
  if (!_liveMap || !window.google || !coords || !coords.length) return;
  const bounds = new google.maps.LatLngBounds();
  coords.forEach(c => { if (c && c.lat && c.lng) bounds.extend({ lat: c.lat, lng: c.lng }); });
  if (bounds.isEmpty()) return;
  if (coords.length === 1) {
    _liveMap.panTo(coords[0]);
    _liveMap.setZoom(15);
  } else {
    _liveMap.fitBounds(bounds, { top: 80, right: 40, bottom: 120, left: 40 });
  }
}
window.liveMapFitPins = liveMapFitPins;

// ── Compartir mapa ──

function openShareSheet() {
  if (!_savedPinsData.length) { showToast('No hay pins guardados'); return; }
  document.getElementById('lmsh-status').textContent = '';
  document.getElementById('live-map-share-sheet').style.display = 'block';
}
function closeShareSheet() {
  const el = document.getElementById('live-map-share-sheet');
  if (el) el.style.display = 'none';
}

async function shareAsImage() {
  const status = document.getElementById('lmsh-status');
  if (!_savedPinsData.length) { showToast('No hay pins guardados'); return; }
  status.textContent = '⏳ Generando imagen…';
  const center = _liveMap.getCenter();
  const zoom = Math.min(_liveMap.getZoom(), 14);
  const markerColors = { hotel: 'blue', restaurant: 'orange', monument: 'yellow', beach: 'green', park: 'green', other: 'red' };
  const markersParam = _savedPinsData.map(p => {
    const col = markerColors[p.place_type] || 'red';
    return `markers=color:${col}%7C${p.lat},${p.lng}`;
  }).join('&');
  const imgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat()},${center.lng()}&zoom=${zoom}&size=600x600&maptype=roadmap&${markersParam}&key=AIzaSyCtNPO5QVnLpHPkaJraQM0M71RXqAJ6L4U`;
  try {
    const res = await fetch(imgUrl);
    const blob = await res.blob();
    const file = new File([blob], 'mapa-salma.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Mi mapa de viaje — Salma' });
      status.textContent = '';
      closeShareSheet();
    } else {
      // Fallback: descargar
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'mapa-salma.jpg';
      a.click();
      status.textContent = '✅ Imagen descargada';
    }
  } catch (e) {
    // Si fetch falla por CORS, abrir en nueva pestaña
    window.open(imgUrl, '_blank');
    status.textContent = '';
    closeShareSheet();
  }
}


function _showPinInfo(marker) {
  if (!_liveMap) return;
  const d = marker._pinData || {};
  const pinId = marker._pinId || '';
  const lat = d.lat || marker.getPosition().lat();
  const lng = d.lng || marker.getPosition().lng();
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const photoHtml = d.photoUrl
    ? `<img src="${d.photoUrl}" style="width:100%;height:140px;object-fit:cover;border-radius:10px 10px 0 0;display:block">`
    : '';
  const padTop = d.photoUrl ? '10px' : '12px';
  const content = `
    <div style="font-family:'Inter',sans-serif;width:260px;border-radius:10px;overflow:hidden;background:#fff">
      ${photoHtml}
      <div style="padding:${padTop} 12px 12px">
        <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:3px">📍 ${d.locName || 'Pin guardado'}</div>
        <div style="font-size:11px;color:#888;margin-bottom:10px">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <a href="${navUrl}" target="_blank" rel="noopener"
            style="flex:1;text-align:center;background:#D4A843;color:#0a0a0f;border-radius:8px;padding:8px 6px;font-size:11px;font-weight:700;text-decoration:none;min-width:60px">
            Ir aquí
          </a>
          <button onclick="window._sharePinById('${lat}','${lng}','${encodeURIComponent(d.locName || 'Pin guardado')}','${encodeURIComponent(d.photoUrl || '')}')"
            style="flex:1;background:#5CB85C;color:#fff;border:none;border-radius:8px;padding:8px 6px;font-size:11px;font-weight:700;cursor:pointer;min-width:60px">
            Compartir
          </button>
          <button onclick="window._deletePinById('${pinId}')"
            style="flex:1;background:#D9534F;color:#fff;border:none;border-radius:8px;padding:8px 6px;font-size:11px;font-weight:700;cursor:pointer;min-width:60px">
            Eliminar
          </button>
        </div>
      </div>
    </div>`;
  // Cada pin tiene su propio InfoWindow para poder estar todos abiertos
  if (!marker._infoWindow) {
    marker._infoWindow = new google.maps.InfoWindow();
  }
  marker._infoWindow.setContent(content);
  marker._infoWindow.open(_liveMap, marker);
}
window._sharePinById = async function(lat, lng, name, photoUrlEnc) {
  const locName = decodeURIComponent(name);
  const photoUrl = decodeURIComponent(photoUrlEnc || '');
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const msg = `Estoy muy bien!!! Mira donde estoy!!! 📍\n${locName}\n${mapsUrl}\n\n🌍 https://borradodelmapa.com`;

  // Si hay foto, compartir foto + texto juntos
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl);
      const blob = await res.blob();
      const file = new File([blob], 'mi-ubicacion.jpg', { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text: msg }); return; } catch(e) {}
      }
    } catch(e) {}
  }

  // Sin foto o share falló: compartir texto
  if (navigator.share) {
    navigator.share({ title: 'Estoy bien!', text: msg }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(msg).then(() => showToast('Mensaje copiado'));
  }
};
window._deletePinById = function(pinId) {
  const marker = _mapPins.find(m => m._pinId === pinId);
  // Cerrar su InfoWindow individual
  if (marker?._infoWindow) marker._infoWindow.close();
  const mi = _mapPins.findIndex(m => m._pinId === pinId);
  if (mi !== -1) { _mapPins[mi].setMap(null); _mapPins.splice(mi, 1); }
  const di = _savedPinsData.findIndex(d => d._pinId === pinId);
  if (di !== -1) _savedPinsData.splice(di, 1);
  if (_poiInfoWindow) _poiInfoWindow.close();
  // Borrar de Firestore
  if (marker?._firestoreId && currentUser && typeof db !== 'undefined') {
    db.collection('users').doc(currentUser.uid).collection('pins').doc(marker._firestoreId).delete().catch(() => {});
  }
  showToast('Pin eliminado');
};

function deletePinById(pinId) {
  const mi = _mapPins.findIndex(m => m._pinId === pinId);
  if (mi !== -1) { _mapPins[mi].setMap(null); _mapPins.splice(mi, 1); }
  const di = _savedPinsData.findIndex(d => d._pinId === pinId);
  if (di !== -1) _savedPinsData.splice(di, 1);
  if (_poiInfoWindow) _poiInfoWindow.close();
}

const _tapPlaceIcons = {
  restaurant:'🍽️', cafe:'☕', bar:'🍺', night_club:'🍸',
  lodging:'🏨', hotel:'🏨',
  supermarket:'🛒', grocery_or_supermarket:'🛒', convenience_store:'🏪',
  pharmacy:'💊', hospital:'🏥', doctor:'🩺',
  museum:'🏛️', art_gallery:'🖼️', tourist_attraction:'📸',
  park:'🌳', church:'⛪', mosque:'🕌', synagogue:'🕍',
  atm:'💳', bank:'🏦', gas_station:'⛽',
  shopping_mall:'🛍️', clothing_store:'👕',
  transit_station:'🚇', subway_station:'🚇', bus_station:'🚌',
  airport:'✈️',
};

// ── Diario: estado + picker ──
const _diario = { photo: null, locName: '', lat: 0, lng: 0, lastBlob: null, mapImg: null };

// Tap mapa o FAB → muestra picker foto/galería
function diarioCapture() {
  if (_liveMap) {
    const c = _liveMap.getCenter();
    _diario.lat = c.lat(); _diario.lng = c.lng();
  } else if (window._salmaUserLat) {
    _diario.lat = window._salmaUserLat; _diario.lng = window._salmaUserLng;
  }
  _diarioGeocode();
  _showDiarioPicker();
}

function _diarioGeocode() {
  if (!window.google || !google.maps || !google.maps.Geocoder) {
    _diario.locName = window._salmaUserCountry || '';
    return;
  }
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat: _diario.lat, lng: _diario.lng } }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const parts = results[0].address_components;
      const city = (parts.find(p => p.types.includes('locality')) || parts.find(p => p.types.includes('administrative_area_level_1')) || {}).long_name || '';
      const country = (parts.find(p => p.types.includes('country')) || {}).long_name || '';
      _diario.locName = city && country ? city + ' · ' + country : results[0].formatted_address;
    } else {
      _diario.locName = _diario.lat.toFixed(3) + ', ' + _diario.lng.toFixed(3);
    }
  });
}

let _dpickAutocomplete = null;

function _showDiarioPicker() {
  const picker = document.getElementById('diario-picker');
  if (picker) picker.style.display = 'block';
  const loc = document.getElementById('dpick-loc');
  if (loc) loc.textContent = _diario.locName || '';
  // Mostrar botón brújula solo si está oculta
  const compassBtn = document.getElementById('dpick-compass-btn');
  if (compassBtn) compassBtn.style.display = localStorage.getItem('compass_hidden') === '1' ? 'flex' : 'none';
  // Inicializar Autocomplete del buscador (una sola vez)
  _initDpickSearch();
}
function closeDiarioPicker() {
  const picker = document.getElementById('diario-picker');
  if (picker) picker.style.display = 'none';
  // Cerrar paneles desplegables de tipo mapa y capas
  _closeMapPanels();
}

function _initDpickSearch() {
  const input = document.getElementById('dpick-search-input');
  if (!input || _dpickAutocomplete || !window.google || !google.maps.places) return;

  _dpickAutocomplete = new google.maps.places.Autocomplete(input, {
    fields: ['geometry', 'name', 'formatted_address', 'place_id'],
  });
  if (_liveMap) _dpickAutocomplete.bindTo('bounds', _liveMap);

  _dpickAutocomplete.addListener('place_changed', () => {
    const place = _dpickAutocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      _goToPlace(place.geometry.location.lat(), place.geometry.location.lng(), place.name || place.formatted_address);
    } else if (place.name) {
      // El usuario escribió y pulsó Enter sin seleccionar — geocoding manual
      _geocodeAndGo(place.name);
    }
  });

  // Enter sin seleccionar sugerencia — geocoding directo
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = input.value.trim();
      if (q) setTimeout(() => {
        // Si place_changed no se disparó (sin selección), hacer geocoding
        if (input.value.trim() === q) _geocodeAndGo(q);
      }, 300);
    }
  });
}

function _goToPlace(lat, lng, title) {
  if (!_liveMap || !window.google) return;
  _liveMap.panTo({ lat, lng });
  _liveMap.setZoom(16);
  const input = document.getElementById('dpick-search-input');
  if (input) input.value = '';
  // Simular tap en esas coordenadas → mismo pin + picker con FOTO/IR AQUI/GUARDAR
  const latLng = new google.maps.LatLng(lat, lng);
  _onMapTap({ latLng });
}

function _geocodeAndGo(query) {
  if (!window.google || !google.maps.Geocoder) return;
  new google.maps.Geocoder().geocode({ address: query }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const loc = results[0].geometry.location;
      _goToPlace(loc.lat(), loc.lng(), results[0].formatted_address);
    }
  });
}
function diarioPickCamera() {
  closeDiarioPicker();
  const input = document.getElementById('diario-camera-input');
  if (input) input.click();
}
function diarioPickGallery() {
  closeDiarioPicker();
  const input = document.getElementById('diario-gallery-input');
  if (input) input.click();
}
function diarioPickNavigate() {
  const lat = _diario.lat, lng = _diario.lng;
  if (!lat && !lng) return;
  window.open('https://www.google.com/maps?q=' + lat + ',' + lng, '_blank');
}
async function diarioPickSave() {
  if (!currentUser) { showToast('Inicia sesión para guardar'); closeDiarioPicker(); openModal(); return; }
  const lat = _diario.lat, lng = _diario.lng;
  if (!lat && !lng) { showToast('Toca el mapa primero'); return; }
  if (_liveMap) {
    const pinId = 'spin_' + (++_pinIdCounter) + '_' + Date.now();
    const marker = new google.maps.Marker({
      map: _liveMap, position: { lat, lng },
      icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#D4A843', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 1.8, anchor: new google.maps.Point(12, 22) },
      title: _diario.locName, zIndex: 150,
    });
    marker._pinId = pinId;
    marker._pinData = { lat, lng, locName: _diario.locName, photoUrl: null };
    marker.addListener('click', () => _showPinInfo(marker));
    _mapPins.push(marker);
    _savedPinsData.push({ lat, lng, locName: _diario.locName, place_type: 'other', _pinId: pinId });
  }
  if (_tapPin) { _tapPin.setMap(null); _tapPin = null; }
  try {
    const docRef = await db.collection('users').doc(currentUser.uid).collection('pins').add({
      lat, lng, locName: _diario.locName, routeId: _activeRouteDocId || null, createdAt: new Date().toISOString()
    });
    // Guardar ID de Firestore para poder borrar después
    const m = _mapPins.find(p => p._pinId === pinId);
    if (m) m._firestoreId = docRef.id;
  } catch (e) { console.warn('[Pin save]', e); }
  showToast('📌 Punto guardado');
  closeDiarioPicker();
}
function diarioPickDelete() {
  if (_tapPin) { _tapPin.setMap(null); _tapPin = null; }
  _tapLatLng = null;
  closeDiarioPicker();
  showToast('Pin eliminado');
}
window.diarioPickNavigate = diarioPickNavigate;
window.diarioPickSave = diarioPickSave;
window.diarioPickDelete = diarioPickDelete;
window.diarioPickCamera = diarioPickCamera;
window.diarioPickGallery = diarioPickGallery;
function diarioPickVideo() {
  closeDiarioPicker();
  const input = document.getElementById('diario-video-input');
  if (input) input.click();
}
window.diarioPickVideo = diarioPickVideo;
window.closeDiarioPicker = closeDiarioPicker;
function diarioPickCompass() {
  closeDiarioPicker();
  localStorage.removeItem('compass_hidden');
  if (typeof mapaRuta !== 'undefined') mapaRuta._renderCompass('live-map-container');
}
window.diarioPickCompass = diarioPickCompass;
function diarioPickSOS() {
  closeDiarioPicker();
  const sosConfigured = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim()).length > 0;
  if (sosConfigured) {
    showSOSConfirm();
  } else {
    closeLiveMap();
    renderSOSConfig();
  }
}
window.diarioPickSOS = diarioPickSOS;
function toggleImFineMenu() {
  const menu = document.getElementById('dpick-imfine-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
}
window.toggleImFineMenu = toggleImFineMenu;

// ── Listener: tras elegir/capturar foto → generar story ──
function _onDiarioPhoto(e) {
  const f = e.target.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      _diario.photo = img;
      _diario.isVideo = false;
      if (_tapPin) { _tapPin.setMap(null); _tapPin = null; }
      generateDiarioStory();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(f);
  e.target.value = '';
}
document.addEventListener('DOMContentLoaded', () => {
  const cam = document.getElementById('diario-camera-input');
  const gal = document.getElementById('diario-gallery-input');
  const vid = document.getElementById('diario-video-input');
  if (cam) cam.addEventListener('change', _onDiarioPhoto);
  if (gal) gal.addEventListener('change', _onDiarioPhoto);
  if (vid) vid.addEventListener('change', _onDiarioVideo);
});

// ── Listener: tras grabar vídeo → validar + subir + mostrar resultado ──
function _onDiarioVideo(e) {
  const f = e.target.files[0]; if (!f) return;
  e.target.value = '';

  if (!f.type.startsWith('video/')) {
    showToast('Selecciona un vídeo'); return;
  }
  if (f.size > 50 * 1024 * 1024) {
    showToast('El vídeo es demasiado grande (máx 50MB)'); return;
  }

  // Comprobar duración
  const video = document.createElement('video');
  video.preload = 'metadata';
  const objectUrl = URL.createObjectURL(f);
  video.src = objectUrl;
  video.onloadedmetadata = () => {
    const duration = video.duration;
    const trimStart = duration > 15 ? duration - 15 : 0;
    if (duration > 15) {
      showToast('Se usarán los últimos 15 segundos');
    }
    // Guardar datos del vídeo
    _diario.isVideo = true;
    _diario.videoFile = f;
    _diario.videoUrl = objectUrl;
    _diario.videoDuration = duration;
    _diario.videoTrimStart = trimStart;
    _diario.lastBlob = f; // raw file temporal (se reemplaza con el Kodak grabado)
    if (_tapPin) { _tapPin.setMap(null); _tapPin = null; }
    generateDiarioVideoStory();
  };
  video.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    showToast('Error al cargar el vídeo');
  };
}

async function _saveDiarioVideoToGallery() {
  if (_diarioSaved || !_diario.videoFile || !currentUser) return;
  _diarioSaved = true;
  try {
    const uid = currentUser.uid;
    const formData = new FormData();
    formData.append('photo', _diario.videoFile, 'mi-diario.mp4');
    formData.append('uid', uid);

    const res = await fetch(window.SALMA_API + '/upload-gallery-photo', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const { key, url } = await res.json();

    const now = new Date().toISOString();
    await db.collection('users').doc(uid).collection('fotos').add({
      key, url, tag: 'video', caption: _diario.locName, albumId: null,
      routeId: _activeRouteDocId || null, lat: _diario.lat, lng: _diario.lng,
      source: 'diario', type: 'video', duration: _diario.videoDuration,
      trimStart: _diario.videoTrimStart, createdAt: now
    });
    await db.collection('users').doc(uid).collection('pins').add({
      lat: _diario.lat, lng: _diario.lng, locName: _diario.locName,
      photoUrl: url, type: 'video', routeId: _activeRouteDocId || null, createdAt: now
    });

    // Guardar URL de R2 para share
    _diario.videoR2Url = url;
    if (typeof showToast === 'function') showToast('🎬 Vídeo guardado en tu galería');
  } catch (e) {
    console.warn('[Diario video save]', e);
    _diarioSaved = false;
  }
}

// ── Estado de grabación vídeo Kodak ──
let _diarioVideoState = null; // { video, recorder, raf }

// ── Generar story Kodak VÍDEO (mismo flujo que foto) ──
async function generateDiarioVideoStory() {
  // 1. Cargar mapa estático — EXACTO igual que generateDiarioStory
  const mapUrl = window.SALMA_API + '/staticmap?lat=' + _diario.lat + '&lng=' + _diario.lng + '&zoom=13&size=640x640&maptype=terrain&scale=2&key=AIzaSyCtNPO5QVnLpHPkaJraQM0M71RXqAJ6L4U';
  try {
    const mapImg = await new Promise((resolve, reject) => {
      const i = new Image(); i.crossOrigin='anonymous';
      i.onload = () => resolve(i); i.onerror = reject; i.src = mapUrl;
    });
    const tmp = document.createElement('canvas'); tmp.width=1080; tmp.height=1920;
    const tCtx = tmp.getContext('2d');
    const iw = mapImg.naturalWidth, ih = mapImg.naturalHeight;
    const canvasRatio = 1080/1920, imgRatio = iw/ih;
    let sx=0, sy=0, sw=iw, sh=ih;
    if (imgRatio > canvasRatio) { sw = Math.round(ih * canvasRatio); sx = Math.round((iw - sw) / 2); }
    else { sh = Math.round(iw / canvasRatio); sy = Math.round((ih - sh) / 2); }
    tCtx.drawImage(mapImg, sx, sy, sw, sh, 0, 0, 1080, 1920);
    const scaled = new Image();
    await new Promise(r => { scaled.onload=r; scaled.src=tmp.toDataURL(); });
    _diario.mapImg = scaled;
  } catch(e) { _diario.mapImg = null; }

  // 2. Crear video oculto para leer frames
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true;
  video.src = _diario.videoUrl;
  await new Promise(r => { video.onloadeddata = r; });
  if (_diario.videoTrimStart > 0) {
    video.currentTime = _diario.videoTrimStart;
    await new Promise(r => { video.onseeked = r; });
  }

  // 3. Mismo canvas que foto (#diario-canvas en el DOM)
  const c = document.getElementById('diario-canvas');
  const ctx = c.getContext('2d');

  // Dibujar primer frame inmediatamente
  _drawDiarioKodak(ctx, video, 1080, 1920, null, _diario.locName, _diario.mapImg, '');

  // 4. Mostrar modal — EXACTO igual que foto
  const locTxt = document.getElementById('diario-result-loc-txt');
  if (locTxt) locTxt.textContent = _diario.locName;
  const resultEl = document.getElementById('diario-result');
  if (resultEl) resultEl.classList.add('on');

  // 5. Subir vídeo crudo a galería (en paralelo)
  _diarioSaved = false;
  _saveDiarioVideoToGallery();

  // 6. Grabar el canvas con MediaRecorder
  let recorder = null, chunks = [], mime = '';
  if (typeof MediaRecorder !== 'undefined') {
    const stream = c.captureStream(30);
    mime = 'video/mp4';
    if (!MediaRecorder.isTypeSupported(mime)) {
      mime = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
    }
    recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4000000 });
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.start();
  }

  // 7. Play + render loop (mismo _drawDiarioKodak que foto)
  await video.play();
  const dur = Math.min(15, _diario.videoDuration || 15);
  const loc = _diario.locName || '';
  const t0 = performance.now();
  _diarioVideoState = { video, recorder };

  function drawFrame() {
    if (!_diarioVideoState) return;
    _drawDiarioKodak(ctx, video, 1080, 1920, null, loc, _diario.mapImg, '');
    if ((performance.now() - t0) / 1000 < dur) {
      _diarioVideoState.raf = requestAnimationFrame(drawFrame);
    } else {
      video.pause();
      if (recorder && recorder.state === 'recording') recorder.stop();
    }
  }
  requestAnimationFrame(drawFrame);

  // 8. Cuando termina la grabación → blob maquetado reemplaza al crudo
  if (recorder) {
    await new Promise(r => { recorder.onstop = r; });
    const blob = new Blob(chunks, { type: mime.split(';')[0] });
    _diario.lastBlob = blob;
    _diario.videoExt = mime.includes('mp4') ? 'mp4' : 'webm';
    if (typeof showToast === 'function') showToast('✓ Kodak listo');
  }
  _diarioVideoState = null;
}

// ── Generar story Kodak ──
async function generateDiarioStory() {
  if (!_diario.photo) return;

  // Mapa estático de fondo (via worker proxy para evitar CORS)
  // Pedimos 640x640 y hacemos crop centrado a proporción 9:16 en el canvas
  const mapUrl = window.SALMA_API + '/staticmap?lat=' + _diario.lat + '&lng=' + _diario.lng + '&zoom=13&size=640x640&maptype=terrain&scale=2&key=AIzaSyCtNPO5QVnLpHPkaJraQM0M71RXqAJ6L4U';
  try {
    const mapImg = await new Promise((resolve, reject) => {
      const i = new Image(); i.crossOrigin='anonymous';
      i.onload = () => resolve(i); i.onerror = reject; i.src = mapUrl;
    });
    // Cover: escalar mapa para cubrir TODO el canvas 1080x1920 (recortar laterales si hace falta)
    const tmp = document.createElement('canvas'); tmp.width=1080; tmp.height=1920;
    const tCtx = tmp.getContext('2d');
    const iw = mapImg.naturalWidth, ih = mapImg.naturalHeight;
    const canvasRatio = 1080/1920, imgRatio = iw/ih;
    let sx=0, sy=0, sw=iw, sh=ih;
    if (imgRatio > canvasRatio) {
      // Imagen más ancha que canvas → recortar laterales
      sw = Math.round(ih * canvasRatio);
      sx = Math.round((iw - sw) / 2);
    } else {
      // Imagen más alta que canvas → recortar arriba/abajo
      sh = Math.round(iw / canvasRatio);
      sy = Math.round((ih - sh) / 2);
    }
    tCtx.drawImage(mapImg, sx, sy, sw, sh, 0, 0, 1080, 1920);
    const scaled = new Image();
    await new Promise(r => { scaled.onload=r; scaled.src=tmp.toDataURL(); });
    _diario.mapImg = scaled;
  } catch(e) { _diario.mapImg = null; }

  const c = document.getElementById('diario-canvas');
  const ctx = c.getContext('2d');
  _drawDiarioKodak(ctx, _diario.photo, 1080, 1920, null, _diario.locName, _diario.mapImg, '');

  await new Promise(resolve => { c.toBlob(b => { _diario.lastBlob = b; resolve(); }, 'image/jpeg', 0.95); });

  const locTxt = document.getElementById('diario-result-loc-txt');
  if (locTxt) locTxt.textContent = _diario.locName;
  const resultEl = document.getElementById('diario-result');
  if (resultEl) resultEl.classList.add('on');

  _diarioSaved = false;
  _saveDiarioToGallery();
}

function _drawDiarioKodak(ctx, photo, W, H, transport, loc, mapImg, msgTxt) {
  const fs = W / 1080;

  // Background: map or dark gradient
  if (mapImg) {
    const mr = mapImg.naturalWidth/mapImg.naturalHeight, cr = W/H;
    let sx=0,sy=0,sw=mapImg.naturalWidth,sh=mapImg.naturalHeight;
    if(mr>cr){sw=sh*cr;sx=(mapImg.naturalWidth-sw)/2;}else{sh=sw/cr;sy=(mapImg.naturalHeight-sh)/2;}
    ctx.drawImage(mapImg,sx,sy,sw,sh,0,0,W,H);
    ctx.fillStyle='rgba(10,10,9,0.48)'; ctx.fillRect(0,0,W,H);
  } else {
    const bg=ctx.createLinearGradient(0,0,W,H);
    bg.addColorStop(0,'#0F1520');bg.addColorStop(1,'#060810');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  }

  // Kodak print
  const printW=Math.round(W*0.80), printX=Math.round((W-printW)/2);
  const bT=Math.round(26*fs),bS=Math.round(26*fs),bB=Math.round(96*fs);
  const phW=printW-bS*2, phH=Math.round(phW*1.24);
  const printH=bT+phH+bB, printY=Math.round((H-printH)*0.36);
  const phX=printX+bS, phY=printY+bT;

  ctx.save();
  ctx.shadowColor='rgba(0,0,0,0.85)';ctx.shadowBlur=Math.round(70*fs);ctx.shadowOffsetY=Math.round(30*fs);
  ctx.fillStyle='#F8F6F0';ctx.fillRect(printX,printY,printW,printH);
  ctx.restore();
  ctx.fillStyle='#F8F6F0';ctx.fillRect(printX,printY,printW,printH);

  // Photo
  if(photo){
    ctx.save();ctx.beginPath();ctx.rect(phX,phY,phW,phH);ctx.clip();
    const pw=photo.naturalWidth||photo.videoWidth,ph_=photo.naturalHeight||photo.videoHeight;
    const ir=pw/ph_,cr2=phW/phH;
    let sx=0,sy=0,sw=pw,sh=ph_;
    if(ir>cr2){sw=sh*cr2;sx=(pw-sw)/2;}else{sh=sw/cr2;sy=(ph_-sh)/2;}
    ctx.drawImage(photo,sx,sy,sw,sh,phX,phY,phW,phH);
    ctx.restore();
    const vig=ctx.createRadialGradient(phX+phW/2,phY+phH/2,phW*.3,phX+phW/2,phY+phH/2,phW*.72);
    vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.20)');
    ctx.fillStyle=vig;ctx.fillRect(phX,phY,phW,phH);
  }

  // Date badge
  const dateStr=new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'2-digit'});
  {
    const bH=Math.round(46*fs),bW=Math.round(158*fs),bPad=Math.round(16*fs);
    ctx.save();ctx.fillStyle='rgba(0,0,0,0.55)';
    ctx.beginPath();ctx.roundRect(phX+phW-bW-bPad,phY+bPad,bW,bH,Math.round(7*fs));ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.92)';ctx.font='bold '+Math.round(22*fs)+'px -apple-system,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(dateStr,phX+phW-bW/2-bPad,phY+bPad+bH/2);
    ctx.restore();
  }

  // Bottom strip: BORRADO DEL MAPA (logo con colores)
  const sY=phY+phH,sH=bB;
  const logoFont='bold '+Math.round(28*fs)+'px -apple-system,sans-serif';
  ctx.font=logoFont;ctx.textAlign='left';ctx.textBaseline='top';
  const logoY=sY+Math.round(14*fs);
  let logoX=phX;
  ctx.fillStyle='#111';ctx.fillText('BORRADO',logoX,logoY);
  logoX+=ctx.measureText('BORRADO').width;
  ctx.fillStyle='#D4A843';ctx.fillText('DEL',logoX,logoY);
  logoX+=ctx.measureText('DEL').width;
  ctx.fillStyle='#111';ctx.fillText('MAPA',logoX,logoY);
  const shortLoc=loc.length>26?loc.substring(0,24)+'…':loc;
  ctx.fillStyle='rgba(0,0,0,0.80)';ctx.font='bold '+Math.round(24*fs)+'px -apple-system,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('📍 '+shortLoc,W/2,sY+sH*0.46);

  if(msgTxt){
    const msgY=printY+printH+Math.round(56*fs);
    ctx.fillStyle='rgba(244,239,230,0.96)';ctx.font='bold '+Math.round(46*fs)+'px -apple-system,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';
    const words=msgTxt.split(' ');let line='',lines=[];
    words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>W-Math.round(140*fs)&&line){lines.push(line);line=w;}else line=t;});
    if(line)lines.push(line);
    lines.forEach((l,i)=>ctx.fillText(l,W/2,msgY+i*Math.round(62*fs)));
  }

  // Watermark
  ctx.fillStyle='rgba(244,239,230,0.20)';ctx.font=Math.round(22*fs)+'px -apple-system,sans-serif';
  ctx.textAlign='right';ctx.textBaseline='bottom';
  ctx.fillText('borradodelmapa.com',W-Math.round(44*fs),H-Math.round(44*fs));
}

// ── Share / Download ──
function _diarioMapsLink() { return 'https://www.google.com/maps?q='+_diario.lat+','+_diario.lng; }
function _diarioShareText() {
  return 'Estoy muy bien!!! Mira donde estoy!!! 📍\n'+_diario.locName+'\n'+_diarioMapsLink()+'\n\n🌍 https://borradodelmapa.com';
}

function _diarioAutoSave() {
  _saveDiarioToGallery();
  _diarioDropPermanentPin();
}

function _diarioDropPermanentPin() {
  if (!_liveMap || !_diario.lat) return;
  const pinId = 'dpin_' + (++_pinIdCounter) + '_' + Date.now();
  let photoUrl = null;
  if (_diario.lastBlob) {
    try { photoUrl = URL.createObjectURL(_diario.lastBlob); } catch(e) {}
  }
  const marker = new google.maps.Marker({
    map: _liveMap,
    position: { lat: _diario.lat, lng: _diario.lng },
    icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#D4A843', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 1.8, anchor: new google.maps.Point(12, 22) },
    title: _diario.locName, zIndex: 150,
  });
  marker._pinId = pinId;
  marker._pinData = { lat: _diario.lat, lng: _diario.lng, locName: _diario.locName, photoUrl: photoUrl };
  marker.addListener('click', () => _showPinInfo(marker));
  _mapPins.push(marker);
  _savedPinsData.push({ lat: _diario.lat, lng: _diario.lng, locName: _diario.locName, place_type: 'other', _pinId: pinId });
}

async function shareDiarioWA() {
  if(!_diario.lastBlob) return;
  _diarioAutoSave();
  const isVid = _diario.isVideo;
  const vExt = _diario.videoExt || 'mp4';
  const fname = isVid ? 'mi-diario.' + vExt : 'mi-diario.jpg';
  const ftype = isVid ? 'video/' + vExt : 'image/jpeg';
  const file=new File([_diario.lastBlob], fname, {type: ftype});
  const txt=_diarioShareText();
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],text:txt});return;}catch(e){}
  }
  const a=document.createElement('a');a.href=URL.createObjectURL(_diario.lastBlob);
  a.download=fname;a.click();
  if(typeof showToast==='function')showToast(isVid ? '🎬 Descargado — adjúntalo en WhatsApp' : '📸 Descargada — adjúntala en WhatsApp');
  setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank'),700);
}

function downloadDiario() {
  if(!_diario.lastBlob) return;
  _diarioAutoSave();
  const isVid = _diario.isVideo;
  const ext = isVid ? '.' + (_diario.videoExt || 'mp4') : '.jpg';
  const a=document.createElement('a');a.href=URL.createObjectURL(_diario.lastBlob);
  a.download='mi-diario-'+Date.now()+ext;a.click();
  if(typeof showToast==='function')showToast('✓ ' + (isVid ? 'Vídeo descargado' : 'Guardada'));
}

async function shareDiarioNative() {
  if(!_diario.lastBlob) return;
  _diarioAutoSave();
  const isVid = _diario.isVideo;
  const vExt = _diario.videoExt || 'mp4';
  const fname = isVid ? 'mi-diario.' + vExt : 'mi-diario.jpg';
  const ftype = isVid ? 'video/' + vExt : 'image/jpeg';
  const file=new File([_diario.lastBlob], fname, {type: ftype});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],text:_diarioShareText()});}catch(e){}
  } else { downloadDiario(); }
}

function closeDiarioResult() {
  // Parar grabación de vídeo si hay una en curso
  if (_diarioVideoState) {
    if (_diarioVideoState.raf) cancelAnimationFrame(_diarioVideoState.raf);
    _diarioVideoState.video.pause();
    if (_diarioVideoState.recorder && _diarioVideoState.recorder.state === 'recording')
      _diarioVideoState.recorder.stop();
    _diarioVideoState = null;
  }
  const el = document.getElementById('diario-result');
  if (el) el.classList.remove('on');
}

async function diarioResultSave() {
  _diarioAutoSave();
  showToast('📌 Guardado en tu mapa');
}

let _diarioSaved = false;
async function _saveDiarioToGallery() {
  if (_diarioSaved || !_diario.lastBlob || !currentUser) return;
  _diarioSaved = true;
  try {
    const uid = currentUser.uid;
    const formData = new FormData();
    formData.append('photo', _diario.lastBlob, 'mi-diario.jpg');
    formData.append('uid', uid);

    const res = await fetch(window.SALMA_API + '/upload-gallery-photo', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const { key, url } = await res.json();

    const now = new Date().toISOString();
    await db.collection('users').doc(uid).collection('fotos').add({
      key, url, tag: 'diario', caption: _diario.locName, albumId: null,
      routeId: _activeRouteDocId || null, lat: _diario.lat, lng: _diario.lng,
      source: 'diario', createdAt: now
    });
    await db.collection('users').doc(uid).collection('pins').add({
      lat: _diario.lat, lng: _diario.lng, locName: _diario.locName,
      photoUrl: url, routeId: _activeRouteDocId || null, createdAt: now
    });

    if (typeof showToast === 'function') showToast('📸 Guardada en tu galería');
  } catch (e) {
    console.warn('[Diario save]', e);
    _diarioSaved = false;
  }
}

window.generateDiarioStory = generateDiarioStory;
window.shareDiarioWA = shareDiarioWA;
window.downloadDiario = downloadDiario;
window.shareDiarioNative = shareDiarioNative;
window.closeDiarioResult = closeDiarioResult;
window.diarioResultSave = diarioResultSave;
window.diarioCapture = diarioCapture;

function _onMapTap(e) {
  _closeMapPanels();
  if (_poiInfoWindow) _poiInfoWindow.close();
  _tapLatLng = e.latLng;

  if (_tapPin) {
    _tapPin.setPosition(_tapLatLng);
  } else {
    _tapPin = new google.maps.Marker({
      map: _liveMap,
      position: _tapLatLng,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#D4A843', fillOpacity: 1,
        strokeColor: '#fff', strokeWeight: 1.5,
        scale: 1.5,
        anchor: new google.maps.Point(12, 22),
      },
      zIndex: 200,
    });
  }

  // Coordenadas para diario
  _diario.lat = _tapLatLng.lat();
  _diario.lng = _tapLatLng.lng();
  _diario.locName = _diario.lat.toFixed(3) + ', ' + _diario.lng.toFixed(3);

  // Reverse geocode en background
  if (!window._diarioGeocoder) window._diarioGeocoder = new google.maps.Geocoder();
  window._diarioGeocoder.geocode({ location: _tapLatLng }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const parts = results[0].address_components;
      const city = (parts.find(p => p.types.includes('locality')) || parts.find(p => p.types.includes('administrative_area_level_1')) || {}).long_name || '';
      const country = (parts.find(p => p.types.includes('country')) || {}).long_name || '';
      if (city || country) _diario.locName = city && country ? city + ' · ' + country : results[0].formatted_address;
    }
  });

  _showDiarioPicker();
}

function closeTapSheet() {
  const sheet = document.getElementById('live-map-tap-sheet');
  if (sheet) sheet.style.display = 'none';
  if (_tapPin) { _tapPin.setMap(null); _tapPin = null; }
  _tapLatLng = null;
  clearTapPhoto();
}

function handleTapPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _tapPhotoBase64 = e.target.result.split(',')[1];
    document.getElementById('lmts-photo-thumb').src = e.target.result;
    document.getElementById('lmts-photo-preview').style.display = 'flex';
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function clearTapPhoto() {
  _tapPhotoBase64 = null;
  const preview = document.getElementById('lmts-photo-preview');
  if (preview) preview.style.display = 'none';
  const thumb = document.getElementById('lmts-photo-thumb');
  if (thumb) thumb.src = '';
}

function _showTapSheet(latLng) {
  if (!_placesService) return;
  const sheet = document.getElementById('live-map-tap-sheet');
  const addrEl = document.getElementById('lmts-address');
  const coordsEl = document.getElementById('lmts-coords');
  const photoEl = document.getElementById('lmts-photo');
  const nearbyEl = document.getElementById('lmts-nearby-list');
  sheet.style.display = 'flex';
  addrEl.textContent = 'Buscando dirección…';
  nearbyEl.innerHTML = '<div style="color:rgba(244,239,230,.4);font-size:12px;padding:10px 0">Buscando lugares cerca…</div>';

  const lat = latLng.lat(), lng = latLng.lng();
  const latStr = lat.toFixed(5), lngStr = lng.toFixed(5);
  coordsEl.textContent = `${latStr}, ${lngStr}`;

  // Street View desactivado — falla en muchas zonas
  photoEl.style.display = 'none';

  // URL que abre Google Maps app nativa en móvil
  const navUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
  document.getElementById('lmts-dir-btn').onclick = () => window.open(navUrl, '_blank');

  function setSaveAction(name) {
    document.getElementById('lmts-save-btn').onclick = () => {
      _placeMapPin({ name, address: `${latStr}, ${lngStr}`, description: '', place_type: 'other', photo: _tapPhotoBase64, lat, lng });
      if (_tapPin) { _tapPin.setMap(null); _tapPin = null; }
      sheet.style.display = 'none';
      _tapLatLng = null;
      clearTapPhoto();
    };
  }
  setSaveAction(`📍 ${latStr}, ${lngStr}`);

  // Geocodificación inversa
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === 'OK' && results[0]) {
      addrEl.textContent = results[0].formatted_address;
      setSaveAction(results[0].formatted_address);
    } else {
      addrEl.textContent = `${latStr}, ${lngStr}`;
      coordsEl.textContent = '';
    }
  });

  // Lugares cercanos
  _placesService.nearbySearch({ location: latLng, radius: 400 }, (results, status) => {
    nearbyEl.innerHTML = '';
    if (!results || !results.length) {
      nearbyEl.innerHTML = '<div style="color:rgba(244,239,230,.4);font-size:12px;padding:10px 0">Sin lugares encontrados</div>';
      return;
    }
    results.slice(0, 15).forEach(place => {
      const icon = _tapPlaceIcons[place.types?.[0]] || '📍';
      const rating = place.rating ? `★ ${place.rating.toFixed(1)}` : '';
      const plLat = place.geometry.location.lat(), plLng = place.geometry.location.lng();
      const placeNavUrl = `https://maps.google.com/maps?daddr=${plLat},${plLng}`;
      const row = document.createElement('div');
      row.className = 'lmts-place-row';
      row.innerHTML = `
        <div class="lmts-place-icon">${icon}</div>
        <div class="lmts-place-info">
          <div class="lmts-place-name">${place.name}</div>
          ${rating ? `<div class="lmts-place-meta">${rating}</div>` : ''}
        </div>
        <a href="${placeNavUrl}" target="_blank" rel="noopener" class="lmts-place-dir">🗺️ Ir</a>`;
      row.addEventListener('click', ev => {
        if (ev.target.closest('a')) return;
        _placesService.getDetails(
          { placeId: place.place_id, fields: ['name','photos','formatted_address','rating','url','geometry'] },
          (detail, s) => {
            if (s !== google.maps.places.PlacesServiceStatus.OK || !detail) return;
            _showPoiInfo(detail, detail.geometry.location, place.place_id);
          }
        );
      });
      nearbyEl.appendChild(row);
    });
  });
}

function openSalmaMapSheet() {
  const sheet = document.getElementById('live-map-salma-sheet');
  const status = document.getElementById('salma-map-status');
  if (sheet) sheet.style.display = 'block';
  if (status) status.style.display = 'none';
}

function closeSalmaMapSheet() {
  const el = document.getElementById('live-map-salma-sheet');
  if (el) el.style.display = 'none';
}

function sendSalmaMapPhoto(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(',')[1];
    await _processSalmaMapRequest(base64);
  };
  reader.readAsDataURL(file);
  fileInput.value = '';
}

async function _processSalmaMapRequest(imageBase64) {
  const status = document.getElementById('salma-map-status');
  status.textContent = '🔍 Identificando...';
  status.style.display = 'block';

  try {
    const SALMA_API = window.SALMA_API || 'https://salma-api.paco-defoto.workers.dev';
    const res = await fetch(SALMA_API + '/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    const data = await res.json();

    if (!data.name || data.name === 'null' || !data.name.trim()) {
      // No identificado — pinear en GPS actual si disponible
      const userPos = _liveUserMarker ? _liveUserMarker.getPosition() : null;
      if (userPos) {
        const label = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        _placeMapPin({ name: `📷 ${label}`, address: '', description: '', place_type: 'other', photo: imageBase64, lat: userPos.lat(), lng: userPos.lng() });
        status.textContent = '📍 Guardado en tu posición actual';
        setTimeout(() => closeSalmaMapSheet(), 1800);
      } else {
        status.textContent = '❌ No he podido identificar el lugar';
        setTimeout(() => closeSalmaMapSheet(), 2500);
      }
      return;
    }

    await _handleMapPin(data, status, imageBase64);
  } catch (e) {
    status.textContent = '❌ Error al procesar la imagen';
    setTimeout(() => closeSalmaMapSheet(), 2500);
  }
}

async function _handleMapPin(action, status, photoBase64 = null) {
  if (!_placesService) { status.textContent = '❌ Mapa no disponible.'; return; }
  status.textContent = '📍 Buscando en el mapa...';

  const query = [action.name, action.address].filter(Boolean).join(', ');
  const userPos = _liveUserMarker ? _liveUserMarker.getPosition() : null;
  _placesService.findPlaceFromQuery(
    { query, fields: ['geometry', 'name', 'formatted_address', 'place_id'], ...(userPos ? { locationBias: userPos } : {}) },
    async (results, placeStatus) => {
      if (placeStatus !== google.maps.places.PlacesServiceStatus.OK || !results.length) {
        status.textContent = '❌ No he encontrado ese lugar. Sé más específico.';
        return;
      }
      const place = results[0];
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.name || action.name;
      const address = place.formatted_address || action.address || '';

      _placeMapPin({ name, address, description: action.description, place_type: action.place_type, checkin: action.checkin, checkout: action.checkout, confirmation: action.confirmation, photo: photoBase64, lat, lng });

      if (currentUser && typeof db !== 'undefined') {
        try {
          await db.collection('users').doc(currentUser.uid).collection('map_pins').add({
            name, address, description: action.description || '',
            place_type: action.place_type || 'other',
            checkin: action.checkin || null, checkout: action.checkout || null,
            lat, lng, created_at: firebase.firestore.FieldValue.serverTimestamp(),
          });
        } catch (_) {}
      }

      status.textContent = `✅ "${name}" guardado`;
      setTimeout(() => closeSalmaMapSheet(), 1800);
    }
  );
}

function _placeMapPin({ name, address, description, place_type, checkin, checkout, confirmation, photo, lat, lng }) {
  if (!_liveMap) return;
  const pinColors = { hotel: '#5BC0DE', monument: '#D4A843', restaurant: '#E87040', beach: '#5CB85C', park: '#5CB85C', other: '#AA66CC' };
  const pinEmojis = { hotel: '🏨', monument: '🏛️', restaurant: '🍽️', beach: '🏖️', park: '🌿', other: '⭐' };
  const color = pinColors[place_type] || '#AA66CC';
  const pinId = ++_pinIdCounter;

  const marker = new google.maps.Marker({
    map: _liveMap,
    position: { lat, lng },
    icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 14 },
    label: { text: pinEmojis[place_type] || '⭐', fontSize: '14px' },
    title: name, zIndex: 50,
  });
  marker._pinId = pinId;
  marker.addListener('click', () => {
    if (!_poiInfoWindow) return;
    const navUrl = `https://maps.google.com/maps?daddr=${lat},${lng}`;
    const mediaType = photo ? (photo.charAt(0) === 'i' ? 'image/png' : 'image/jpeg') : null;
    _poiInfoWindow.setContent(`<div style="font-family:'Inter',sans-serif;width:230px;overflow:hidden;border-radius:10px">
      ${photo ? `<img src="data:${mediaType};base64,${photo}" style="width:100%;height:140px;object-fit:cover;display:block">` : ''}
      <div style="padding:12px 14px">
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px">${name}</div>
        ${address ? `<div style="font-size:11px;color:#777;margin-bottom:8px">${address}</div>` : ''}
        ${description ? `<div style="font-size:12px;color:#444;margin-bottom:8px">${description}</div>` : ''}
        ${(checkin || checkout) ? `<div style="font-size:11px;color:#5BC0DE;margin-bottom:8px">🗓 ${checkin || ''}${checkin && checkout ? ' → ' : ''}${checkout || ''}</div>` : ''}
        ${confirmation ? `<div style="font-size:10px;color:#999;margin-bottom:8px">Ref: ${confirmation}</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:4px">
          <a href="${navUrl}" target="_blank" style="flex:1;text-align:center;background:#4285F4;color:#fff;border-radius:8px;padding:7px;font-size:12px;font-weight:600;text-decoration:none">Cómo llegar</a>
          <button onclick="deletePinById(${pinId})" style="background:#ff3b30;color:#fff;border:none;border-radius:8px;padding:7px 10px;font-size:12px;cursor:pointer">🗑️</button>
        </div>
      </div>
    </div>`);
    _poiInfoWindow.open(_liveMap, marker);
  });
  _mapPins.push(marker);
  _savedPinsData.push({ name, address, description, place_type, checkin, checkout, confirmation, photo, lat, lng, _pinId: pinId });
  _liveMap.panTo({ lat, lng });
}

window.openSalmaMapSheet = openSalmaMapSheet;
window.closeSalmaMapSheet = closeSalmaMapSheet;
window.sendSalmaMapPhoto = sendSalmaMapPhoto;
window.closeTapSheet = closeTapSheet;
window.handleTapPhoto = handleTapPhoto;
window.clearTapPhoto = clearTapPhoto;
window.deletePinById = deletePinById;
window.openShareSheet = openShareSheet;
window.closeShareSheet = closeShareSheet;
window.shareAsImage = shareAsImage;

// ═══ UTILIDADES ═══

function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  setTimeout(() => $toast.classList.remove('show'), 2500);
}

// ═══ SOS EMERGENCIA v3 (Twilio → WhatsApp → SMS → Queue) ═══

const SOS_QUEUE_KEY = 'sos_pending_queue';
let lastKnownCoords = null;

function startTrackingLastPosition() {
  if (!navigator.geolocation) return;
  navigator.geolocation.watchPosition(
    pos => { lastKnownCoords = pos.coords; },
    null,
    { enableHighAccuracy: false, maximumAge: 60000 }
  );
}

function _buildSOSMessage(coords) {
  const mapsUrl = coords
    ? `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`
    : null;
  const userName = currentUser?.name || 'Un viajero de Borrado del Mapa';
  const locationText = mapsUrl ? `📍 ${mapsUrl}` : '📍 Ubicación no disponible';
  const defaultMsg = `🆘 *${userName}* necesita ayuda urgente.\n${locationText}`;
  const raw = currentUserSOSConfig?.custom_message
    ? currentUserSOSConfig.custom_message
        .replace('{maps_url}', mapsUrl || 'no disponible')
        .replace('{nombre}', userName)
    : defaultMsg;
  return { message: raw, mapsUrl };
}

function showSOSConfirm() {
  let overlay = document.getElementById('sos-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sos-confirm-overlay';
    overlay.className = 'sos-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="sos-modal">
      <div class="sos-modal-icon">🆘</div>
      <h2 class="sos-modal-title">Aviso de emergencia</h2>
      <p class="sos-modal-text">Se enviará un SMS automático con tu ubicación a tus contactos de emergencia.</p>
      <div class="sos-countdown" id="sos-countdown">3</div>
      <div class="sos-modal-btns">
        <button class="sos-btn-cancel" id="sos-cancel">Cancelar</button>
        <button class="sos-btn-go" id="sos-go">Enviar ahora</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';

  let count = 3;
  const countEl = document.getElementById('sos-countdown');
  const timer = setInterval(() => {
    count--;
    if (countEl) countEl.textContent = count;
    if (count <= 0) {
      clearInterval(timer);
      overlay.style.display = 'none';
      triggerSOS();
    }
  }, 1000);

  document.getElementById('sos-cancel').addEventListener('click', () => {
    clearInterval(timer);
    overlay.style.display = 'none';
  });
  document.getElementById('sos-go').addEventListener('click', () => {
    clearInterval(timer);
    overlay.style.display = 'none';
    triggerSOS();
  });
}

async function triggerSOS() {
  currentState = 'sos';

  // Usar coords que ya tenemos (instantáneo), mejorar en background
  let coords = lastKnownCoords || null;
  const contacts = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim());
  const { message } = _buildSOSMessage(coords);

  // Sin internet → encolar + mostrar WhatsApp
  if (!navigator.onLine) {
    localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify({ contacts, message, timestamp: Date.now() }));
    _renderSOSScreen('offline', contacts, message);
    return;
  }

  // Mostrar WhatsApp INMEDIATAMENTE — no hacer esperar
  _renderSOSScreen('whatsapp', contacts, message);

  // En background: intentar SMS automático via Twilio
  try {
    // Intentar GPS fresco (3s máx) para mejorar el mensaje
    let freshCoords = null;
    try { freshCoords = await getPositionWithTimeout(3000); } catch (_) {}
    if (freshCoords) coords = freshCoords;
    const freshMsg = _buildSOSMessage(coords).message;

    const res = await fetch(window.SALMA_API + '/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts, message: freshMsg, uid: currentUser.uid }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const result = await res.json();
      if (result.sent_count > 0) {
        showToast(`✅ SMS enviado a ${result.sent_count} contacto${result.sent_count !== 1 ? 's' : ''}`);
      }
    }
  } catch (_) { /* SMS no disponible — WhatsApp ya visible */ }
}

function _renderSOSScreen(mode, contacts, message, sentCount) {
  const encodedMsg = encodeURIComponent(message);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const phonesSep = isIOS ? ';' : ',';
  const smsSep = isIOS ? '&' : '?';
  const phones = contacts.map(c => c.phone).join(phonesSep);

  const waButtons = contacts.map(c => `
    <a class="sos-wa-btn" href="https://wa.me/${c.phone.replace(/\D/g,'')}?text=${encodedMsg}" target="_blank" rel="noopener">
      <span class="sos-wa-icon">🟢</span>
      <span>WhatsApp → ${escapeHTML(c.name || c.phone)}</span>
    </a>`).join('');

  const smsBtn = `<a class="sos-sms-btn" href="sms:${phones}${smsSep}body=${encodedMsg}">
    📱 SMS a todos (sin datos)
  </a>`;

  let body = '';
  if (mode === 'success') {
    body = `
      <div class="sos-result sos-result-ok">
        <div class="sos-result-icon">✅</div>
        <p class="sos-result-text">SMS enviado a ${sentCount} contacto${sentCount !== 1 ? 's' : ''}. Confirma también por WhatsApp si puedes:</p>
      </div>
      ${waButtons}
      <div class="sos-divider"></div>
      ${smsBtn}`;
  } else if (mode === 'whatsapp') {
    body = `
      <div class="sos-result sos-result-warn">
        <div class="sos-result-icon">⚠️</div>
        <p class="sos-result-text">SMS automático no disponible. Avisa por WhatsApp:</p>
      </div>
      ${waButtons}
      <div class="sos-divider"></div>
      ${smsBtn}`;
  } else if (mode === 'offline') {
    body = `
      <div class="sos-result sos-result-warn">
        <div class="sos-result-icon">⏳</div>
        <p class="sos-result-text">Sin conexión. El aviso se enviará automáticamente cuando recuperes señal.</p>
      </div>
      <div class="sos-divider"></div>
      ${waButtons}
      <div class="sos-divider"></div>
      ${smsBtn}`;
  }

  // Overlay encima del mapa (no sobreescribe app-content)
  let overlay = document.getElementById('sos-screen-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sos-screen-overlay';
    overlay.className = 'sos-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="sos-modal" style="max-width:400px;width:92%;max-height:80vh;overflow-y:auto;">
    <div class="sos-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <span class="sos-header-title" style="font-size:18px;font-weight:700;">🆘 Emergencia</span>
      <button class="sos-back" id="sos-back" style="background:none;border:1px solid rgba(244,239,230,.2);border-radius:8px;color:rgba(244,239,230,.7);padding:6px 12px;cursor:pointer;font-size:13px;">✕ Cerrar</button>
    </div>
    ${body}
    <button class="sos-config-link" id="sos-edit-contacts" style="margin-top:16px;">Editar contactos</button>
  </div>`;
  overlay.style.display = 'flex';

  document.getElementById('sos-back').addEventListener('click', () => {
    overlay.style.display = 'none';
    currentState = 'chat';
  });
  document.getElementById('sos-edit-contacts').addEventListener('click', () => {
    overlay.style.display = 'none';
    currentState = 'chat';
    closeLiveMap();
    renderSOSConfig();
  });
}

// Cola offline: reintenta automáticamente al recuperar conexión
function _checkSOSQueue() {
  if (!currentUser) return;
  const raw = localStorage.getItem(SOS_QUEUE_KEY);
  if (!raw) return;
  let sosData;
  try { sosData = JSON.parse(raw); } catch (_) { localStorage.removeItem(SOS_QUEUE_KEY); return; }
  localStorage.removeItem(SOS_QUEUE_KEY);

  fetch(window.SALMA_API + '/sos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contacts: sosData.contacts,
      message: sosData.message + '\n⚠️ Enviado con retraso (sin señal en el momento del aviso)',
      uid: currentUser.uid
    })
  })
  .then(r => r.ok ? showToast('✅ Aviso SOS pendiente enviado') : null)
  .catch(() => {});
}
window.addEventListener('online', _checkSOSQueue);

function renderSOSConfig() {
  const $c = document.getElementById('app-content');
  const cfg = currentUserSOSConfig || {
    contacts: [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
    custom_message: ''
  };
  while (cfg.contacts.length < 3) cfg.contacts.push({ name: '', phone: '' });

  $c.innerHTML = `<div class="sos-config-area fade-in">
    <div class="sos-header">
      <button class="sos-back" id="sos-config-back">← Volver</button>
      <span class="sos-header-title">Contactos SOS</span>
    </div>
    <div class="sos-config-contacts">
      ${cfg.contacts.map((c, i) => `
        <div class="sos-config-row">
          <span class="sos-config-num">${i + 1}</span>
          <input class="sos-config-name" id="sos-name-${i}" type="text" placeholder="Nombre" value="${escapeHTML(c.name || '')}">
          <input class="sos-config-phone" id="sos-phone-${i}" type="tel" placeholder="+34666XXXXXX" value="${escapeHTML(c.phone || '')}">
        </div>
        <div class="sos-config-error" id="sos-err-${i}" style="display:none">Prefijo internacional obligatorio (+34...)</div>`).join('')}
    </div>
    <div class="sos-config-custom">
      <label class="sos-config-label">Mensaje personalizado <span class="sos-config-opt">(opcional)</span></label>
      <textarea class="sos-config-textarea" id="sos-custom-msg" placeholder="Usa {nombre} y {maps_url} para incluir tu nombre y ubicación">${escapeHTML(cfg.custom_message || '')}</textarea>
    </div>
    <div class="sos-config-error" id="sos-save-error" style="display:none">Añade al menos un contacto con teléfono válido.</div>
    <div class="sos-config-btns">
      <button class="sos-save-btn" id="sos-save">Guardar contactos</button>
      <button class="sos-test-btn" id="sos-test">Enviar prueba</button>
    </div>
    <div class="sos-config-explainer">
      <p>SOS y Salma avisa a tus contactos de emergencia automáticamente. Les manda un SMS con tu nombre y tu ubicación exacta en Google Maps. Sin que tengas que escribir nada. Si el SMS falla, te da los botones para avisar por WhatsApp o SMS directo desde tu móvil. Si no tienes señal, lo envía cuando la recuperes.</p>
    </div>
  </div>`;
  document.querySelector('.app-input-bar').style.display = 'none';
  currentState = 'sos-config';

  document.getElementById('sos-config-back').addEventListener('click', () => {
    document.querySelector('.app-input-bar').style.display = '';
    showState('profile');
  });

  const _getContactsFromForm = () => [0, 1, 2].map(i => ({
    name: document.getElementById(`sos-name-${i}`)?.value.trim() || '',
    phone: document.getElementById(`sos-phone-${i}`)?.value.trim() || ''
  }));

  const _validateContacts = (contacts) => {
    let valid = true;
    contacts.forEach((c, i) => {
      const errEl = document.getElementById(`sos-err-${i}`);
      const bad = c.phone && !/^\+[1-9]\d{6,14}$/.test(c.phone);
      if (errEl) errEl.style.display = bad ? '' : 'none';
      if (bad) valid = false;
    });
    const hasOne = contacts.some(c => c.phone && /^\+[1-9]\d{6,14}$/.test(c.phone));
    const saveErr = document.getElementById('sos-save-error');
    if (!hasOne) { if (saveErr) saveErr.style.display = ''; valid = false; }
    else { if (saveErr) saveErr.style.display = 'none'; }
    return valid && hasOne;
  };

  document.getElementById('sos-save').addEventListener('click', async () => {
    const contacts = _getContactsFromForm();
    if (!_validateContacts(contacts)) return;
    const custom_message = document.getElementById('sos-custom-msg')?.value.trim() || '';
    const newConfig = { contacts, custom_message };
    const btn = document.getElementById('sos-save');
    btn.disabled = true; btn.textContent = 'Guardando...';
    try {
      await db.collection('users').doc(currentUser.uid).update({ sos_config: newConfig });
      currentUserSOSConfig = newConfig;
      showToast('Contactos de emergencia guardados');
      document.querySelector('.app-input-bar').style.display = '';
      showState('profile');
    } catch (_) {
      btn.disabled = false; btn.textContent = 'Guardar contactos';
      showToast('Error al guardar');
    }
  });

  document.getElementById('sos-test').addEventListener('click', async () => {
    const contacts = _getContactsFromForm();
    if (!_validateContacts(contacts)) return;
    const firstContact = contacts.find(c => c.phone && /^\+[1-9]\d{6,14}$/.test(c.phone));
    if (!firstContact) return;
    const { message } = _buildSOSMessage(lastKnownCoords);
    const btn = document.getElementById('sos-test');
    btn.disabled = true; btn.textContent = 'Enviando...';
    try {
      const res = await fetch(window.SALMA_API + '/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: [firstContact], message, uid: currentUser.uid, test: true })
      });
      let result = {};
      try { result = await res.json(); } catch (_) {}
      if (result.sent_count > 0) {
        showToast('✅ SMS de prueba enviado a ' + (firstContact.name || firstContact.phone));
      } else if (result.error === 'Twilio not configured') {
        showToast('⚙️ Twilio pendiente de configurar en Cloudflare');
      } else if (result.error === 'rate_limit') {
        showToast('⏳ Límite alcanzado, espera 10 minutos');
      } else {
        showToast('⚠️ SMS no disponible aún — usa WhatsApp como alternativa');
      }
    } catch (_) {
      showToast('⚠️ Worker no desplegado — ejecuta wrangler deploy');
    }
    btn.disabled = false; btn.textContent = 'Enviar prueba';
  });
}

function getPositionWithTimeout(timeout) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('timeout')), timeout);
    navigator.geolocation.getCurrentPosition(
      pos => { clearTimeout(id); resolve(pos.coords); },
      err => { clearTimeout(id); reject(err); },
      { enableHighAccuracy: true, timeout }
    );
  });
}

function showInfoPopup(msg) {
  let overlay = document.getElementById('info-popup-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'info-popup-overlay';
    overlay.className = 'info-popup-overlay';
    overlay.innerHTML = `
      <div class="info-popup">
        <p class="info-popup-text"></p>
        <button class="info-popup-close">Entendido</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('info-popup-close'))
        overlay.style.display = 'none';
    });
  }
  overlay.querySelector('.info-popup-text').textContent = msg;
  overlay.style.display = 'flex';
}

function escapeHTML(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// Sanitizar URLs inventadas por Claude — solo permite dominios de herramientas reales
function sanitizeUrls(text) {
  if (!text) return text;
  var allowed = [
    'google.com/maps', 'googleusercontent.com', 'places.googleapis.com',
    'booking.com', 'airbnb.com', 'hostelworld.com',
    'kiwi.com', 'skyscanner.es', 'skyscanner.com',
    'rentalcars.com', 'discovercars.com',
    'thefork.com', 'thefork.es',
    '12go.asia', 'bookaway.com', 'lomprayah.com', 'seatrandiscovery.com', 'seatranferry.com', 'rajaferryport.com', 'rome2rio.com',
    'directferries.com', 'directferries.es', 'ferryscanner.com', 'clickferry.com', 'ferryhopper.com',
    'balearia.com', 'frs.es', 'frs-group.com', 'trasmediterranea.es', 'armasferry.com', 'aferry.com', 'aferry.es',
    'omio.com', 'omio.es', 'busbud.com', 'wanderu.com', 'virail.com', 'virail.es',
    'thetrainline.com', 'trainline.com', 'renfe.com', 'raileurope.com', 'sncf-connect.com', 'bahn.com', 'trenitalia.com', 'cp.pt',
    'alsa.es', 'flixbus.com', 'flixbus.es', 'blablacar.es', 'blablacar.com',
    'grab.com', 'gojek.com',
    'uber.com', 'm.uber.com', 'bolt.eu', 'indrive.com',
    'cabify.com', 'free-now.com', 'careem.com', 'lyft.com',
    'olacabs.com', 'rapido.bike', '99app.com', 'didiglobal.com', 'go.yandex.com',
    'kiwitaxi.com', 'intui.travel',
  ];
  // Extraer URLs de líneas 🔗 (inyectadas por el worker desde Brave, verificadas)
  var workerUrls = new Set();
  var linkLines = text.match(/🔗[^\n]*https?:\/\/[^\s<>]+/gi) || [];
  for (var li = 0; li < linkLines.length; li++) {
    var urlMatch = linkLines[li].match(/https?:\/\/[^\s<>]+/i);
    if (urlMatch) workerUrls.add(urlMatch[0]);
  }
  var clean = text.replace(/(?:https?:\/\/|[a-z]+:\/\/)[^\s<>]+/gi, function(url) {
    if (workerUrls.has(url)) return url;
    for (var i = 0; i < allowed.length; i++) {
      if (url.indexOf(allowed[i]) !== -1) return url;
    }
    return '';
  });
  // Limpiar restos huérfanos tras eliminar URLs inventadas
  return clean
    .replace(/^.*este enlace te abre[^.\n]*\.?\s*$/gm, '')
    .replace(/^.*descárga(?:te)?l[ao][^.\n]*\.?\s*$/gm, '')
    .replace(/^.*[Ss]i no l[ao] tienes[^.\n]*[.,]?\s*$/gm, '')
    .replace(/^.*[Ss]i tienes[^.\n]*instalad[ao][^.\n]*[.,]?\s*$/gm, '')
    .replace(/aquí[.:]\s*\n/gi, '\n')
    .replace(/:\s*\n\s*\n/g, '.\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Formatear mensaje de Salma: escapar HTML + linkificar URLs y teléfonos
function formatMessage(str) {
  let raw = str || '';
  // Extraer imágenes markdown ANTES de sanitizar y del escape HTML
  const images = [];
  raw = raw.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_, alt, url) => {
    const idx = images.length;
    images.push('<img src="' + url + '" alt="' + alt + '" style="width:100%;max-width:280px;border-radius:8px;margin:6px 0;display:block;" loading="lazy">');
    return '%%IMG' + idx + '%%';
  });
  // Extraer enlaces markdown [texto](url) ANTES de sanitizar — son links intencionales de Salma
  const links = [];
  raw = raw.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, text, url) => {
    const idx = links.length;
    links.push('<a href="' + url + '" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href);return false;">' + text + '</a>');
    return '%%LINK' + idx + '%%';
  });
  // Sanitizar el resto del texto (URLs en texto plano — filtra inventadas)
  raw = sanitizeUrls(raw);

  let html = escapeHTML(raw);
  // URLs sueltas → enlaces clicables (onclick fuerza apertura externa en PWA)
  html = html.replace(/([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s<]+)/g, function(_, url) {
    var label = url;
    if (url.indexOf('google.com/maps/dir/?') !== -1 || url.indexOf('google.com/maps/dir?') !== -1) label = '🗺️ Cómo llegar';
    else if (url.indexOf('google.com/maps/dir/') !== -1) label = '🗺️ Ruta completa en Google Maps';
    else if (url.indexOf('google.com/maps') !== -1) label = '📍 Abrir en Google Maps';
    else if (url.indexOf('booking.com') !== -1) label = '🏨 Ver en Booking';
    else if (url.indexOf('kiwi.com') !== -1) label = '✈️ Ver vuelo';
    else if (url.indexOf('skyscanner') !== -1) label = '✈️ Buscar en Skyscanner';
    else if (url.indexOf('thefork') !== -1) label = '🍴 Ver en TheFork';
    else if (url.indexOf('grab.com') !== -1) label = '🟩 Descargar Grab';
    else if (url.indexOf('m.uber.com') !== -1) label = '🚕 Descargar Uber';
    else if (url.indexOf('bolt.eu') !== -1) label = '🟢 Descargar Bolt';
    else if (url.indexOf('didiglobal.com') !== -1) label = '🟠 Descargar DiDi';
    else if (url.indexOf('gojek.com') !== -1) label = '🟢 Descargar Gojek';
    else if (url.indexOf('careem.com') !== -1) label = '🟢 Descargar Careem';
    else if (url.indexOf('indrive.com') !== -1) label = '🟣 Descargar inDrive';
    else if (url.indexOf('cabify.com') !== -1) label = '🟣 Descargar Cabify';
    else if (url.indexOf('free-now.com') !== -1) label = '🔴 Descargar FREENOW';
    else if (url.indexOf('lyft.com') !== -1) label = '🩷 Descargar Lyft';
    else if (url.indexOf('12go.asia') !== -1) label = '🚢 Reservar en 12Go Asia';
    else if (url.indexOf('bookaway.com') !== -1) label = '🚌 Reservar en Bookaway';
    else if (url.indexOf('rome2rio.com') !== -1) label = '🗺️ Ver opciones en Rome2Rio';
    else if (url.indexOf('directferries') !== -1) label = '🚢 Reservar en Direct Ferries';
    else if (url.indexOf('ferryscanner.com') !== -1) label = '🚢 Comparar en Ferryscanner';
    else if (url.indexOf('clickferry.com') !== -1) label = '🚢 Reservar en Clickferry';
    else if (url.indexOf('ferryhopper.com') !== -1) label = '🚢 Reservar en Ferryhopper';
    else if (url.indexOf('balearia.com') !== -1) label = '🚢 Reservar en Baleària';
    else if (url.indexOf('frs.es') !== -1 || url.indexOf('frs-group.com') !== -1) label = '🚢 Reservar en FRS';
    else if (url.indexOf('trasmediterranea.es') !== -1) label = '🚢 Reservar en Trasmediterránea';
    else if (url.indexOf('omio.com') !== -1 || url.indexOf('omio.es') !== -1) label = '🔍 Comparar en Omio';
    else if (url.indexOf('busbud.com') !== -1) label = '🚌 Reservar en Busbud';
    else if (url.indexOf('thetrainline.com') !== -1 || url.indexOf('trainline.com') !== -1) label = '🚆 Reservar en Trainline';
    else if (url.indexOf('renfe.com') !== -1) label = '🚄 Reservar en Renfe';
    else if (url.indexOf('raileurope.com') !== -1) label = '🚆 Reservar en Rail Europe';
    else if (url.indexOf('alsa.es') !== -1) label = '🚌 Reservar en Alsa';
    else if (url.indexOf('flixbus.com') !== -1 || url.indexOf('flixbus.es') !== -1) label = '🟢 Reservar en FlixBus';
    else if (url.indexOf('blablacar') !== -1) label = '🚗 Ver en BlaBlaCar';
    else if (url.indexOf('kiwitaxi.com') !== -1) label = '🚕 Reservar transfer';
    else if (url.indexOf('uber.com') !== -1) label = '🚕 Abrir Uber';
    else if (url.indexOf('gojek.com') !== -1) label = '🟢 Descargar Gojek';
    else if (url.indexOf('rapido.bike') !== -1) label = '🏍️ Descargar Rapido';
    else if (url.indexOf('olacabs.com') !== -1) label = '🟡 Descargar Ola';
    else if (url.indexOf('airbnb.com') !== -1) label = '🏠 Ver en Airbnb';
    else if (url.indexOf('hostelworld.com') !== -1) label = '🛏️ Ver en Hostelworld';
    var isMaps = url.indexOf('google.com/maps') !== -1;
    var clickHandler = isMaps ? 'openMapsModal(this.href);return false;' : 'window.open(this.href);return false;';
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" onclick="' + clickHandler + '">' + label + '</a>';
  });
  // Teléfonos internacionales: +XX XXX XXX XXX (con espacios, guiones o puntos)
  html = html.replace(/(\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{2,4}[ .-]?\d{2,4}[ .-]?\d{0,4})/g, (match) => {
    const clean = match.replace(/[\s.-]/g, '').trim();
    return `<a href="tel:${clean}">${match.trim()}</a>`;
  });
  // **negrita** → <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Restaurar imágenes y enlaces desde placeholders
  images.forEach((img, i) => { html = html.replace('%%IMG' + i + '%%', img); });
  links.forEach((link, i) => { html = html.replace('%%LINK' + i + '%%', link); });
  // Saltos de línea → <br>
  html = html.replace(/\n/g, '<br>');
  return html;
}

// ═══ MAPS MODAL (bottom sheet con iframe Google Maps) ═══
window.openMapsModal = function(url) {
  try {
    const existing = document.getElementById('maps-modal');
    if (existing) existing.remove();

    // Convertir URL a formato embed
    let embedUrl = url;
    try {
      if (/\/maps\/dir\/\?api=1/i.test(url)) {
        const u = new URL(url);
        const destPlace = u.searchParams.get('destination_place_id');
        const dest = u.searchParams.get('destination');
        if (destPlace) embedUrl = 'https://maps.google.com/maps?q=place_id:' + destPlace + '&output=embed';
        else if (dest) embedUrl = 'https://maps.google.com/maps?q=' + encodeURIComponent(dest) + '&output=embed';
      } else if (!/[?&]output=embed/i.test(embedUrl)) {
        embedUrl += (embedUrl.indexOf('?') === -1 ? '?' : '&') + 'output=embed';
      }
    } catch (_) {}

    const modal = document.createElement('div');
    modal.id = 'maps-modal';
    modal.innerHTML = '<div id="maps-modal-backdrop" style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div>' +
      '<div id="maps-modal-sheet" style="position:absolute;bottom:0;left:0;right:0;height:70vh;background:#141209;border-radius:16px 16px 0 0;display:flex;flex-direction:column;animation:mapsSheetUp 0.25s ease-out;overflow:hidden;">' +
        '<div style="width:40px;height:4px;background:#555;border-radius:2px;margin:8px auto;flex-shrink:0;"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 12px 8px;flex-shrink:0;gap:8px;">' +
          '<button id="maps-modal-open" style="background:#f0b429;color:#060503;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">📍 Abrir en Google Maps</button>' +
          '<button id="maps-modal-close" style="background:transparent;color:#fff;border:none;font-size:28px;cursor:pointer;padding:0 12px;line-height:1;">×</button>' +
        '</div>' +
        '<iframe src="' + embedUrl + '" style="flex:1;width:100%;border:0;" frameborder="0" allowfullscreen></iframe>' +
      '</div>';
    modal.style.cssText = 'position:fixed;inset:0;z-index:10000;';
    document.body.appendChild(modal);

    // Animación keyframe (inyectar si no existe)
    if (!document.getElementById('maps-modal-css')) {
      const s = document.createElement('style');
      s.id = 'maps-modal-css';
      s.textContent = '@keyframes mapsSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }';
      document.head.appendChild(s);
    }

    const close = () => modal.remove();
    document.getElementById('maps-modal-close').addEventListener('click', close);
    document.getElementById('maps-modal-backdrop').addEventListener('click', close);
    document.getElementById('maps-modal-open').addEventListener('click', () => {
      window.open(url, '_blank');
      close();
    });
  } catch (e) {
    window.open(url, '_blank');
  }
};

// Exponer globalmente
window.showToast = showToast;
window.escapeHTML = escapeHTML;
window.formatMessage = formatMessage;
window.guardarGuia = guardarGuia;
// Video desde pins del mapa (1 tap)
window.videoFromPins = async function() {
  if (typeof videoAssembly === 'undefined' || typeof videoPlayer === 'undefined') return;
  showToast('Preparando video…');
  const result = await videoAssembly.assemble({ source: 'pins' });
  if (!result) { showToast('Necesitas al menos 3 pins con foto'); return; }
  _showVideoModal(result.photoUrls, result.params);
};
window.currentUser = null;
Object.defineProperty(window, 'currentUser', {
  get: () => currentUser,
  set: (v) => { currentUser = v; }
});

// ═══ ONBOARDING ═══
function showOnboarding() {
  const slides = [
    {
      icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
      title: 'Dime dónde vamos.',
      titleEm: 'De lo demás yo me encargo.',
      body: 'Cuéntame tu destino y los días que tienes. En un minuto te monto la ruta con mapa, fotos y todo lo que necesitas saber.'
    },
    {
      icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
      title: 'Rutas, reservas,',
      titleEm: 'búsquedas y emergencias.',
      body: 'Vuelos, hoteles, trenes, ferry, restaurantes cerca tuyo, info del país en tiempo real... y si algo va mal, también estoy aquí.'
    },
    {
      icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
      title: 'Tu compañera',
      titleEm: 'de viaje.',
      body: 'Directa, con opinión propia y siempre a tu lado. Para el viaje de tu vida o para sacarte de un apuro esta noche.'
    }
  ];

  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.className = 'onboarding-overlay';

  let current = 0;

  function renderSlide() {
    const s = slides[current];
    const isLast = current === slides.length - 1;
    overlay.innerHTML = `
      <div class="onboarding-card">
        <button class="onboarding-skip" id="ob-skip">Saltar</button>
        <div class="onboarding-icon">${s.icon}</div>
        <div class="onboarding-title">${s.title}<br><em>${s.titleEm}</em></div>
        <div class="onboarding-body">${s.body}</div>
        <div class="onboarding-dots">
          ${slides.map((_, i) => `<span class="onboarding-dot ${i === current ? 'onboarding-dot-active' : ''}"></span>`).join('')}
        </div>
        <button class="onboarding-next" id="ob-next">${isLast ? 'Empezar' : 'Siguiente'}</button>
      </div>`;
    overlay.querySelector('#ob-next').addEventListener('click', () => {
      if (isLast) closeOnboarding(true);
      else { current++; renderSlide(); }
    });
    overlay.querySelector('#ob-skip').addEventListener('click', () => closeOnboarding(false));
  }

  function closeOnboarding(goToRegister) {
    localStorage.setItem('bdm_onboarding_done', '1');
    overlay.remove();
    if (goToRegister && !currentUser) openModal();
  }

  document.body.appendChild(overlay);
  renderSlide();
}

// ═══ INIT ═══
// No llamar showState('welcome') aquí — onAuthStateChanged decide:
// - Con sesión → directo al chat
// - Sin sesión → gate obligatorio
// El splash se mantiene visible hasta que Firebase resuelva el auth
if (!localStorage.getItem('bdm_onboarding_done')) {
  showOnboarding();
}
