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
// Se cumple la primera vez que onAuthStateChanged deja currentUser listo (con sesión o
// sin ella). Hasta entonces currentUser === null NO significa "sin sesión": la app aún
// está reconociendo al usuario (bug real, 26 sept 2026: el botón de WhatsApp mandaba a
// la pantalla de entrada a quien ya había entrado con Google si lo tocaba al cargar).
let _authReadyResolve;
const _authReady = new Promise((r) => { _authReadyResolve = r; });
let currentState = 'chat'; // 'chat' | 'viajes' | 'profile' (welcome deprecado — ya no se usa)
let currentUserSOSConfig = null;

// ═══ DOM refs ═══
const $content = document.getElementById('app-content');
// Header eliminado
const $input = document.getElementById('main-input');
const $send = document.getElementById('main-send');
const $toast = document.getElementById('toast');

// ═══ NAVEGACIÓN — 3 estados ═══

function showState(state) {
  // Navegación Fase 4: si la vista itinerario estaba abierta y el usuario
  // navega (bottom bar), desmontarla primero. Sin tocar historial.
  if (window._itinViewOpen && typeof window._teardownItinView === 'function') {
    window._teardownItinView();
  }
  // 'welcome' está deprecado (Fase 5 navegación): el estado por defecto es el chat.
  if (state === 'welcome') state = 'chat';
  currentState = state;
  updateHeader();

  const inputBar = document.querySelector('.app-input-bar');

  if (state === 'ayuda') {
    // Propuesta UX (26 sept 2026): "Ayuda" enseña qué puede hacer Salma (igual que
    // ya hace el menú de /destinos/) y el formulario de fallos queda como opción.
    renderSalmaCan();
    const _area = $content.querySelector('.salma-can-area');
    if (_area) {
      _area.insertAdjacentHTML('beforeend', `
        <div class="ayuda-actions">
          <button class="login-needed-btn" id="ayuda-ask">Pregúntale a Salma <span>→</span></button>
        </div>`);
      document.getElementById('ayuda-ask').addEventListener('click', () => {
        showState('chat');
        setTimeout(() => { const i = document.getElementById('salma-input') || $input; if (i) i.focus(); }, 150);
      });
      // Mejora Salma (26 sept 2026): arriba del todo, no al final — todo el mundo es tester.
      _area.insertAdjacentHTML('afterbegin', `
        <div class="mejora-card">
          <div class="mejora-card-t">Mejora Salma</div>
          <p>Salma está creciendo y tú nos ayudas a mejorarla. Cuéntanos qué falla o qué se te ocurre: lo leemos todo. Si es un fallo y lo confirmamos, te regalamos <b>1 guía gratis</b>.</p>
          <div class="mejora-card-kinds">
            <button type="button" data-k="panel_fallo"><span>🐞</span>Algo no va</button>
            <button type="button" data-k="panel_idea"><span>💡</span>Tengo una idea</button>
            <button type="button" data-k="panel_encanta"><span>❤️</span>Me ha encantado</button>
          </div>
        </div>`);
      _area.querySelectorAll('.mejora-card-kinds button').forEach(b => b.addEventListener('click', () => {
        if (window.__dbg && typeof window.__dbg.open === 'function') window.__dbg.open({ kind: b.dataset.k });
      }));
    }
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
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
  } else if (state === 'perfil-ia') {
    renderPerfilIA();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'historia') {
    if (typeof historiaModule !== 'undefined') historiaModule.render();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'galeria') {
    $content.classList.remove('app-content--chat');
    $content.style.paddingBottom = '80px';
    const _bgL = document.getElementById('chat-bg-layer');
    if (_bgL) _bgL.remove();
    if (inputBar) inputBar.style.display = 'none';
    renderGaleria();
  } else if (state === 'notas') {
    if (typeof notasManager !== 'undefined') notasManager.renderNotasView();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'vuelos') {
    if (typeof flightWatches !== 'undefined') flightWatches.renderVuelosView();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'consultas') {
    if (typeof salma !== 'undefined') salma.renderConsultasView();
    if (inputBar) inputBar.style.display = 'none';
    $content.style.paddingBottom = '80px';
  } else if (state === 'chat') {
    // Si venimos de una vista a pantalla completa (welcome, notas, vuelos, consultas…)
    // el $content tiene OTRO markup: hay que recrear el #chat-area antes de restaurar.
    if (!$content.querySelector('#chat-area')) {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
    }
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
    // Restaurar sesión previa (conversación que estabas viendo) o estado vacío
    const _ca = document.getElementById('chat-area');
    if (!_ca || !_ca.querySelector('.msg')) {
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
  // FAB mapa DESACTIVADO 7 sept 2026 — popup "Cómo llegar" roto + botones del picker raros.
  // Ver PENDIENTES.md. Reactivar: volver a la línea de abajo comentada.
  const fab = document.getElementById('fab-map');
  if (fab) fab.style.display = 'none';
  // if (fab) fab.style.display = (state === 'welcome' || !currentUser) ? 'none' : '';
}

function updateHeader() {
  // Header eliminado — solo actualiza bottom bar
  updateBottomBar();
}

// Botón fijo "Mejora Salma" arriba a la derecha (26 sept 2026) — abre el formulario de
// debug-panel.js. Solo en las pantallas principales; en el chat con conversación se
// aparta a la izquierda de "Nueva" (#chat-fresh, ver styles.css).
function _ensureMejoraBtn() {
  let b = document.getElementById('mejora-btn');
  if (!b) {
    b = document.createElement('button');
    b.id = 'mejora-btn';
    b.type = 'button';
    b.innerHTML = '<span aria-hidden="true">✦</span> Mejora Salma';
    b.addEventListener('click', () => {
      if (window.__dbg && typeof window.__dbg.open === 'function') window.__dbg.open();
    });
    document.body.appendChild(b);
  }
  // En Ayuda no: ahí ya está la tarjeta grande de Mejora Salma
  b.style.display = ['chat', 'rutas', 'profile'].includes(currentState) ? '' : 'none';
}

// ⚠️ CLAUDE.md protocolo §9: si tocas este menú (pestañas, iconos, el "+"), replica
// el mismo cambio en scripts/build-destinos.js (constante BOTTOM_NAV) y regenera al
// menos un país de prueba — las 1.793 páginas de /destinos/ usan una copia estática
// de este mismo menú. No es opcional, Paco lo pidió explícito el 22 sept 2026.
function updateBottomBar() {
  let bar = document.getElementById('app-bottom-bar');
  if (!bar) {
    bar = document.createElement('nav');
    bar.id = 'app-bottom-bar';
    bar.className = 'app-bottom-bar';
    document.body.appendChild(bar);
  }

  const isChat = currentState === 'chat';
  const isRutas = currentState === 'rutas';
  const isProfile = ['profile', 'bitacora', 'diario', 'documentos', 'notas', 'galeria', 'vuelos'].includes(currentState);

  // Barra fija de 4 — Historia DESACTIVADA 7 sept 2026 (ver PENDIENTES.md).
  // "Consultas" quitada de aquí el 21 sept 2026 (sigue accesible desde el chip
  // "Últimas consultas" de la pantalla vacía) — su sitio lo ocupa "Ayuda", que
  // abre el panel de feedback de testers (debug-panel.js, window.__dbg.open).
  bar.innerHTML = `
    <button class="bottom-tab bottom-tab-tester ${currentState === 'ayuda' ? 'bottom-tab-active' : ''}" id="tab-tester">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.5-1 1-1 1.7"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>Ayuda</span>
    </button>
    <button class="bottom-tab ${isRutas && window._rutasTab === 'explorar' ? 'bottom-tab-active' : ''}" id="tab-explorar">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>
      <span>Explorar</span>
    </button>
    <div class="bottom-tab-fab-spacer" aria-hidden="true"></div>
    <button class="bottom-tab ${isRutas && window._rutasTab !== 'explorar' ? 'bottom-tab-active' : ''}" id="tab-rutas">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/><rect x="1" y="3" width="4" height="4" rx="1"/><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="1" y="17" width="4" height="4" rx="1"/></svg>
      <span>Mis Viajes</span>
    </button>
    <button class="bottom-tab ${isProfile ? 'bottom-tab-active' : ''}" id="tab-profile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>${currentUser ? 'Perfil' : 'Entrar'}</span>
    </button>`;

  document.getElementById('tab-tester').addEventListener('click', () => showState('ayuda'));
  // Propuesta UX (26 sept 2026): "Salma" pasa al botón central; su hueco lo ocupa
  // Explorar (antes escondido dentro de Mis Viajes). Mis Viajes = solo las tuyas.
  document.getElementById('tab-explorar').addEventListener('click', () => {
    window._rutasTab = 'explorar';
    showState('rutas');
  });
  document.getElementById('tab-rutas').addEventListener('click', () => {
    window._rutasTab = 'mis';
    if (!currentUser) { window._afterLogin = 'rutas'; openModal(); return; }
    showState('rutas');
  });
  document.getElementById('tab-profile').addEventListener('click', handleAvatarClick);
  _ensureMejoraBtn();

  // FAB "+" real, FUERA de la barra (position:fixed, sibling de #app-bottom-bar) —
  // .bottom-tab-fab-spacer de arriba solo reserva el hueco en el flex. Si estuviera
  // DENTRO de la barra, el hueco recortado (mask-image en .app-bottom-bar, ver
  // styles.css) se comería también el propio círculo donde se solapan.
  let fab = document.getElementById('tab-newroute');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'tab-newroute';
    fab.className = 'bottom-tab-fab';
    fab.setAttribute('aria-label', 'Salma');
    fab.title = 'Salma';
    fab.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="bottom-tab-fab-label">Salma</span>';
    // Central = Salma: lleva SIEMPRE a la portada (Paco, 26 sept 2026: "no quiero lío
    // de botones"). Con guía activa, la portada enseña su tarjeta arriba y el cuadro de
    // texto debajo. La conversación anterior no se pierde: queda en "Últimas consultas"
    // (cada hilo se guarda aparte; newChat() solo empieza otro). Antes retomaba la última
    // conversación y la portada quedaba escondida detrás de "Nueva".
    fab.addEventListener('click', () => {
      if (typeof salma !== 'undefined') salma._initChat();
      showState('chat');
      // Con una respuesta a medias no se corta: solo se lleva al chat.
      if (typeof salma !== 'undefined' && salma.newChat && !salma._streaming) salma.newChat();
      try { window.scrollTo(0, 0); } catch (_) {}
    });
    document.body.appendChild(fab);
  }
}

// Botón "+" central del bottom bar — pura navegación, no crea nada nuevo: lleva
// al creador de ruta que ya existe (el billete de destino+días, con "Afinar" para
// los otros 6 campos). Si hay conversación sin guardar (mensajes en curso sin haber
// generado/guardado ninguna guía), avisa antes de perderla — una ruta ya guardada
// nunca corre ese riesgo, vive en Firestore aparte y esto no la toca.
function _hasUnsavedChatConversation() {
  try {
    return typeof salma !== 'undefined' && Array.isArray(salma.history) &&
      salma.history.length > 0 && !salma.currentRouteId;
  } catch (_) { return false; }
}

function _goToFreshBillete() {
  showState('chat');
  if (typeof salma !== 'undefined' && salma.newChat) salma.newChat();
  // Sube a la caja de ejemplos de ARRIBA — NO al billete de "Ruta rápida" más
  // abajo. Solo la deja a la vista, con los ejemplos rotando tal cual (sin
  // borrarlos ni entrar en modo edición solo); hace falta tocarla para que se
  // vuelva editable — eso ya lo hace _startEditing() por su cuenta al tocarla.
  // Corregido 22 sept 2026 dos veces: primero llevaba al campo "¿A dónde?" del
  // billete; después entraba en modo edición sola al llegar (Paco: "que no se
  // borren los ejemplos, que sea al pulsar" — pulsar la caja, no el "+").
  // Si hay ruta activa debajo, "Trazar nueva ruta +" (oculto con `hidden` desde
  // que existe el FAB, sigue en el DOM solo como gancho programático) cambia la
  // tarjeta a hero+billete oculto — así aparece la caja de ejemplos, que si no
  // solo se pinta en el estado "sin ruta activa". .click() dispara el listener
  // aunque el botón esté oculto.
  // Desde el 26 sept 2026 la portada con guía activa ya enseña el cuadro de texto
  // debajo de la tarjeta (#ce-rotable), así que solo hace falta el gancho si no está.
  const newBtn = document.querySelector('[data-ce-newbillete]');
  if (newBtn && !document.getElementById('ce-rotable')) newBtn.click();
  const rot = document.getElementById('ce-rotable');
  if (rot) rot.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


function goToNewRouteFAB() {
  if (_hasUnsavedChatConversation()) {
    showNewRouteConfirm();
  } else {
    _goToFreshBillete();
  }
}

function showNewRouteConfirm() {
  let overlay = document.getElementById('newroute-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'newroute-confirm-overlay';
    overlay.className = 'narrator-confirm-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="narrator-confirm-modal">
      <div class="narrator-confirm-icon">🗺️</div>
      <h2 class="narrator-confirm-title">¿Ruta nueva?</h2>
      <p class="narrator-confirm-text">Perderás la conversación actual — todavía no la has guardado como guía.</p>
      <div class="narrator-confirm-btns">
        <button class="narrator-confirm-cancel" id="newroute-confirm-cancel">Cancelar</button>
        <button class="narrator-confirm-go" id="newroute-confirm-go">Empezar</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';
  document.getElementById('newroute-confirm-cancel').addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  document.getElementById('newroute-confirm-go').addEventListener('click', () => {
    overlay.style.display = 'none';
    _goToFreshBillete();
  });
}

function updateNarratorChipUI() {
  const on = typeof salma !== 'undefined' && !!salma._narratorActive;
  const targets = [
    ...document.querySelectorAll('.chat-empty-chip[data-action="explorar"]'),
    ...document.querySelectorAll('#itin-query-narrador')
  ];
  targets.forEach(el => {
    if (el.classList.contains('chat-empty-chip')) el.classList.toggle('chat-empty-chip--narrator-on', on);
    if (el.id === 'itin-query-narrador') el.classList.toggle('itin-query-quick--narrator-on', on);
    let badge = el.querySelector('[data-camera-badge]');
    if (on && !badge) {
      badge = document.createElement('span');
      badge.className = 'chip-camera-badge';
      badge.dataset.cameraBadge = '1';
      badge.title = 'Identifica lo que ves al momento por foto';
      badge.textContent = '📷';
      el.appendChild(badge);
    } else if (!on && badge) {
      badge.remove();
    }
  });
}

function handleAvatarClick() {
  if (currentUser) {
    showState('profile');
  } else {
    openModal();
  }
}

// ═══ Fase 3 navegación — los modales participan en el historial ═══
// Al abrir un modal se empuja una entrada. El botón atrás del móvil la
// deshace y cierra el modal, en vez de navegar por la pantalla de debajo.
window._modalStack = [];
window.pushModal = function (name, closeFn) {
  var top = window._modalStack[window._modalStack.length - 1];
  if (top && top.name === name) { top.closeFn = closeFn; return; } // ya hay uno arriba: refrescar, no duplicar
  window._modalStack.push({ name: name, closeFn: closeFn });
  try { history.pushState({ state: history.state && history.state.state, modal: name }, ''); } catch (_) {}
};
// Llamar cuando el modal se cierra por su propia ✕ / Esc / clic-fuera:
// consume la entrada de historial sin volver a cerrar nada.
window.popModal = function (name) {
  var top = window._modalStack[window._modalStack.length - 1];
  if (!top || (name && top.name !== name)) return;
  window._modalStack.pop();
  window._skipModalPop = true;
  try { history.back(); } catch (_) { window._skipModalPop = false; }
};
window.addEventListener('popstate', function (e) {
  if (window._skipModalPop) { window._skipModalPop = false; return; }
  if (window._modalStack.length) {
    var m = window._modalStack.pop();
    e.stopImmediatePropagation();
    try { m.closeFn(); } catch (_) {}
  }
});

// ═══ CHAT VACÍO — chips de acceso rápido ═══

function _renderChatEmpty() {
  if (!document.getElementById('chat-area')) {
    $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
  }
  const area = document.getElementById('chat-area');
  if (!area || area.querySelector('.msg')) return;

  const _ci = (d) => `<svg class="chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  // Simplificación 19 sept 2026 (a petición de Paco): solo 6 chips fijos, centrados
  // en la guía — el resto (uso menos frecuente) vive detrás de "Más opciones".
  // Propuesta UX (26 sept 2026): 4 a la vista (lo que más se usa + SOS por
  // seguridad), el resto en "Más opciones". Lo que exige cuenta (auth:true) no se
  // enseña sin sesión — antes se veía y al tocarlo pedía entrar.
  const _hasUser = !!currentUser;
  const _chipDefs = {
    cerca: { label: 'Cerca mía', icon: _ci('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'), msg: 'Hazme una ruta desde donde estoy', action: 'ruta-aqui' },
    consultas: { label: 'Últimas consultas', icon: _ci('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>'), msg: null, action: 'consultas' },
    notas: { label: 'Mis notas', icon: _ci('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>'), msg: null, action: 'notas', auth: true },
    narrador: { label: 'Narrador', icon: _ci('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'), msg: null, action: 'explorar' },
    alojamiento: { label: 'Alojamiento', icon: _ci('<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 13h18"/><path d="M7 13V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"/>'), msg: 'Busca alojamiento' },
    sos: { label: 'SOS', icon: _ci('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'), msg: null, action: 'sos', cls: 'chat-empty-chip--sos' },
    vuelos: { label: 'Vuelos', icon: _ci('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'), msg: 'Busca vuelos' },
    alertas: { label: 'Alertas vuelos', icon: _ci('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'), msg: null, action: 'vuelos', auth: true },
    moneda: { label: 'Cambio moneda', icon: _ci('<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>'), msg: null, action: 'moneda' },
    traductor: { label: 'Traductor', icon: _ci('<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"/>'), msg: null, action: 'traductor' },
  };
  const _pick = keys => keys.map(k => _chipDefs[k]).filter(c => _hasUser || !c.auth);
  const chipsLeft = _pick(['cerca', 'vuelos']);
  const chipsRight = _pick(['alojamiento', 'sos']);
  const chipsMore = _pick(['narrador', 'consultas', 'notas', 'alertas', 'moneda', 'traductor']);
  // Salma en WhatsApp — fila propia a todo lo ancho, no es un acceso más: es otro canal.
  const _ceWaRow = `<button class="chat-empty-chip ce-wa-chip" data-action="whatsapp"><svg class="chip-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z"/></svg><span class="ce-wa-label">${_salmaWaChipLabel()}</span></button>`;
  const renderChip = c => {
    const narratorOn = c.action === 'explorar' && typeof salma !== 'undefined' && salma._narratorActive;
    const cameraBadge = narratorOn ? '<span class="chip-camera-badge" data-camera-badge="1" title="Identifica lo que ves al momento por foto">📷</span>' : '';
    return `<button class="chat-empty-chip ${c.cls || ''} ${narratorOn ? 'chat-empty-chip--narrator-on' : ''}" data-msg="${c.msg || ''}" data-action="${c.action || ''}">${c.icon || ''}${c.emoji ? `<span class="chip-emoji">${c.emoji}</span>` : ''}${c.label}${cameraBadge}</button>`;
  };

  // ── Rediseño v1 (rama rediseno-visual) — tablero de guía + chips estilo panel de aeropuerto ──
  const _mapIco = '<svg class="chip-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>';

  const _ceSkySel = _ceSkyReadSel();
  const _ceSkyWxKey = _ceSkyWeatherKey(_ceSkySel);
  const _ceSkyCachedEntry = (window._ceSkyWxCache && window._ceSkyWxCache[_ceSkyWxKey]) || null;
  const _ceSkyCachedData = _ceSkyCachedEntry ? _ceSkyCachedEntry.data : null;
  const _ceSkyTimeInit = _ceSkyTimeText(_ceSkySel);
  const _ceSkyLocInit = _ceSkyLocLabel(_ceSkySel, _ceSkyCachedData);
  const _ceSkyTempInit = _ceSkyCachedData
    ? `${(typeof salma !== 'undefined' && salma._wxEmoji) ? salma._wxEmoji(_ceSkyCachedData.icon) : '🌡️'} ${_ceSkyCachedData.temp}°`
    : '…';
  const _ceSkyDescInit = (_ceSkyCachedData && _ceSkyCachedData.description) || '';
  const _ceSkyExtrasInit = _ceSkyExtrasHTML(_ceSkyCachedData);
  const _ceSkyFcCached = (_ceSkyCachedData && _ceSkyCachedData.forecast) || [];
  const _ceSkyFcHTML = _ceSkyForecastHTML(_ceSkyFcCached);
  let _ceSkyFcOpen = false;
  try { _ceSkyFcOpen = localStorage.getItem('bdm_sky_fc_open') === '1'; } catch (_) {}
  // Bloque de tiempo (tarjeta + previsión + info del país) plegado por defecto,
  // detrás de un botón — la fecha/hora se queda siempre visible fuera del pliegue
  // (petición de Paco, 22 sept 2026, para descargar el index).
  let _ceSkyWxOpen = false;
  try { _ceSkyWxOpen = localStorage.getItem('bdm_sky_wx_open') === '1'; } catch (_) {}
  let _ceName = '';
  try { _ceName = (currentUser && (currentUser.displayName || '')) || (window.currentUserData && window.currentUserData.name) || ''; } catch (e) {}
  const _ceHi = _ceName ? ('Buenas, ' + String(_ceName).trim().split(/\s+/)[0]) : 'Hola, viajero';

  // Normaliza una ruta real (itinerarioIA parseado) para el tablero
  const _ceFromRoute = (r, docId, docData) => {
    const stops = (r && Array.isArray(r.stops)) ? r.stops : [];
    if (!stops.length) return null;
    const named = stops.map(s => s.name || s.headline).filter(Boolean);
    const days = stops.reduce((m, s) => Math.max(m, s.day || 1), 1);
    const withCoords = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01).length;
    const title = r.title || r.name || (docData && docData.nombre) || (named[0] || 'Tu ruta');
    const head = named.slice(0, 3).map(escapeHTML).join(' · ') + (named.length > 3 ? ` <b>· +${named.length - 3}</b>` : '');
    const _a = named[0], _z = named[named.length - 1];
    const code = (named.length >= 2 && _a && _z) ? `${_a} → ${_z}`.toUpperCase() : String(title).toUpperCase();
    return {
      title: String(title),
      code: code,
      ribbon: (named.slice(0, 4).join(' · ').toUpperCase()) || 'RUTA',
      sub: `${days} día${days > 1 ? 's' : ''} · ${stops.length} paradas`,
      stopsHtml: head,
      thumbUrl: r.map_thumbnail_url || null,
      stats: [['DÍAS', String(days)], ['PARADAS', String(stops.length)], ['EN MAPA', String(withCoords)]],
      docId: docId || null,
      docData: docData || null
    };
  };

  // ── BILLETE: el índice es el creador de ruta. Destino + días a la vista,
  //    los otros 6 campos (= los 8 pasos del flujo guiado) plegados en "Afinar".
  const _ceChips = (field, opts, single) =>
    `<div class="ce-chips" data-field="${field}"${single ? ' data-single' : ''}>` +
    opts.map(o => `<button class="ce-chip${o.on ? ' on' : ''}" data-v="${o.v}">${o.l}</button>`).join('') +
    `</div>`;

  const _paxName = (_ceName ? String(_ceName).trim().split(/\s+/)[0] : 'Viajero').toUpperCase();
  const _tkNum = 'BDM·' + String(new Date().getMonth() + 1).padStart(2, '0') + String(new Date().getDate()).padStart(2, '0');

  const _ceBilleteHTML = (hasActive) => `
      <div class="ce-tk-head">
        <span class="ce-tk-t">Nº ${_tkNum}</span>
      </div>
      <div class="ce-tk-pax"><span class="ce-k">Pasajero</span><span class="ce-tk-pax-v">${_paxName}</span></div>
      <div class="ce-fld">
        <div class="ce-k">Destino</div>
        <input class="ce-tk-dest" type="text" autocomplete="off" placeholder="¿A dónde?">
      </div>
      <div class="ce-fld">
        <div class="ce-k">Días</div>
        ${_ceChips('duracion_dias', [
          { v: '1', l: '1' }, { v: '2', l: '2' },
          { v: '3-4', l: '3–4' }, { v: '5-7', l: '5–7', on: true },
          { v: '8-14', l: '8–14' }, { v: '+14', l: '+14' }
        ], true)}
      </div>
      <button class="ce-afinar" data-ce-afinar>Afinar la ruta <span class="ce-afinar-c">6 detalles · opcional ▾</span></button>
      <div class="ce-more">
        <div class="ce-fld">
          <div class="ce-k">Fechas</div>
          ${_ceChips('fechas', [{ v: '', l: 'A ojo', on: true }, { v: '__fechas__', l: 'Tengo fechas' }], true)}
          <div class="ce-tk-fechas" hidden>
            <label>Ida <input class="ce-tk-f1" type="date"></label>
            <label>Vuelta <input class="ce-tk-f2" type="date"></label>
          </div>
        </div>
        <div class="ce-fld">
          <div class="ce-k">Con quién</div>
          ${_ceChips('compania', [
            { v: 'solo', l: 'Solo' }, { v: 'pareja', l: 'Pareja' },
            { v: 'familia', l: 'Familia' }, { v: 'amigos', l: 'Amigos' }
          ], true)}
        </div>
        <div class="ce-fld">
          <div class="ce-k">Presupuesto / día</div>
          ${_ceChips('presupuesto', [
            { v: 'ajustado', l: 'Ajustado' }, { v: 'medio', l: 'Medio' }, { v: 'sin_limite', l: 'Sin límite' }
          ], true)}
        </div>
        <div class="ce-fld">
          <div class="ce-k">Ritmo</div>
          ${_ceChips('ritmo', [
            { v: 'tranquilo', l: 'Tranquilo' }, { v: 'equilibrado', l: 'Equilibrado' }, { v: 'intenso', l: 'Intenso' }
          ], true)}
        </div>
        <div class="ce-fld">
          <div class="ce-k">Intereses</div>
          ${_ceChips('intereses', [
            { v: 'cultura', l: 'Cultura' }, { v: 'naturaleza', l: 'Naturaleza' }, { v: 'gastronomia', l: 'Gastronomía' },
            { v: 'playa', l: 'Playa' }, { v: 'fiesta', l: 'Fiesta' }, { v: 'compras', l: 'Compras' }
          ], false)}
        </div>
        <div class="ce-fld ce-fld--last">
          <div class="ce-k">Notas</div>
          <input class="ce-tk-notes" type="text" autocomplete="off" placeholder="Dieta, movilidad, lo que sea…">
        </div>
      </div>
      <div class="ce-perf"></div>
      <div class="ce-stub">
        <button class="ce-emit" data-ce-emit>Trazar ruta <span>→</span></button>
        <div class="ce-stub-hint">Salma monta la ruta con lo que hayas puesto</div>
      </div>`;

  // Tablero de RUTA ACTIVA — modo compañero. Abre la GUÍA del viaje + billete nuevo.
  // Miniatura con mapa+paradas en vez de solo texto (18 sept): tocar la imagen abre
  // la guía igual que el botón — mismo atributo data-ce-guide, mismo listener de
  // abajo, sin cablear nada nuevo. Si aún no hay imagen generada (ruta recién abierta
  // por primera vez, ver _ensureRouteThumbnail) se queda solo con el ribbon de texto.
  const _ceRouteHTML = (rt) => `
      ${rt.thumbUrl ? `<img class="ce-card-thumb" data-ce-guide src="${escapeHTML(rt.thumbUrl)}" alt="Mapa de la ruta" loading="lazy">` : ''}
      <div class="ce-card-ribbon"><span>${rt.ribbon}</span></div>
      <div class="ce-row"><span class="ce-code">${escapeHTML(rt.code)}</span><span class="ce-arr"></span></div>
      <div class="ce-head">
        <span class="ce-eyebrow">En ruta</span>
        <div class="ce-title" data-ce-guide>${escapeHTML(rt.title)}</div>
        <div class="ce-sub">${rt.sub}</div>
      </div>
      <div class="ce-stops">${rt.stopsHtml}</div>
      <div class="ce-stats">${rt.stats.map(s => `<div class="ce-stat"><div class="ce-k">${s[0]}</div><div class="ce-v">${s[1]}</div></div>`).join('')}</div>
      <div class="ce-cta ce-cta--dual">
        <button class="ce-cta-main" data-ce-guide>Abrir ruta <span>→</span></button>
        <!-- Oculto a propósito (22 sept 2026): con el "+" del bottom bar ya no hace
             falta este botón visible — carecía de sentido tener los dos. Se queda en
             el DOM solo como gancho programático de _goToFreshBillete(). -->
        <button class="ce-cta-main ce-cta-2nd" data-ce-newbillete hidden>Trazar nueva ruta <span>+</span></button>
      </div>`;

  // Versión compacta de la tarjeta de ruta activa (Paco, 26 sept 2026): la grande
  // ocupaba casi toda la pantalla del móvil y el cuadro "¿Y el próximo viaje?" quedaba
  // debajo, con scroll. Una sola fila (miniatura + título + días/paradas + flecha) que
  // entera abre la guía — las paradas y cifras ya se ven dentro. _ceRouteHTML (la
  // grande) se queda para no romper nada que la use.
  const _ceRouteCompactHTML = (rt) => `
      <div class="ce-mini" data-ce-guide role="button" tabindex="0" aria-label="Abrir ${escapeHTML(rt.title)}">
        ${rt.thumbUrl ? `<img class="ce-mini-thumb" src="${escapeHTML(rt.thumbUrl)}" alt="" loading="lazy">` : '<div class="ce-mini-thumb ce-mini-thumb--empty" aria-hidden="true">🗺️</div>'}
        <div class="ce-mini-txt">
          <span class="ce-eyebrow">En ruta</span>
          <div class="ce-mini-title">${escapeHTML(rt.title)}</div>
          <div class="ce-sub">${rt.sub}</div>
        </div>
        <span class="ce-mini-go" aria-hidden="true">→</span>
      </div>
      <button data-ce-newbillete hidden></button>`;

  // "Ruta nueva" quitado (Fase 5): el billete ya es el creador de ruta; ese chip
  // abría el flujo viejo de 8 preguntas y duplicaba la función.
  let _ceMoreOpen = false;
  try { _ceMoreOpen = localStorage.getItem('bdm_ce_more_open') === '1'; } catch (_) {}
  const _ceMoreHTML = `
      <button class="ce-more-toggle" id="ce-more-toggle" aria-expanded="${_ceMoreOpen}">
        <span>Más opciones</span>
        <span class="ce-more-toggle-ic">${_ceMoreOpen ? '▴' : '▾'}</span>
      </button>
      <div class="ce-more-chips${_ceMoreOpen ? ' open' : ''}" id="ce-more-chips">${chipsMore.map(renderChip).join('')}</div>`;

  const _ceChipsRow = `
      <div class="chat-empty-chips">
        <div class="ce-chip-row">${chipsLeft.map(renderChip).join('')}</div>
        <div class="ce-chip-row">${chipsRight.map(renderChip).join('')}</div>
      </div>
      ${_ceWaRow}
      ${_ceMoreHTML}`;

  const _ceFallback = `
    <div class="chat-empty">
      <div class="chat-empty-chips">
        <div class="ce-chip-row">${chipsLeft.map(renderChip).join('')}</div>
        <div class="ce-chip-row">${chipsRight.map(renderChip).join('')}</div>
      </div>
      ${_ceWaRow}
      ${_ceMoreHTML}
    </div>`;

  // ¿Hay ruta activa? (localStorage — igual criterio que _restoreActiveRoute)
  let _ceActive = null;
  try {
    const raw = localStorage.getItem('bdm_live_active_route');
    if (raw) {
      const _rawRoute = JSON.parse(raw);
      const _rawId = localStorage.getItem('bdm_live_active_route_id') || null;
      _ceActive = _ceFromRoute(_rawRoute, _rawId, null);
      // Rutas que ya estaban activas ANTES de que existiera esta miniatura (18 sept)
      // nunca vuelven a pasar por setActiveRoute si no se reabre la guía — sin esto
      // se quedarían sin imagen para siempre. Pedirla aquí también cubre ese caso.
      if (_rawId && !_rawRoute.map_thumbnail_url) _ensureRouteThumbnail(_rawRoute, _rawId);
    }
  } catch (e) { _ceActive = null; }
  try {
    const _initCard = _ceActive
      ? { cls: 'ce-card ce-active ce-active--mini', html: _ceRouteCompactHTML(_ceActive) }
      : { cls: 'ce-card ce-ticket', html: _ceBilleteHTML() };
    const _greet = _ceActive ? '¿Cómo va el viaje?' : '¿A dónde vamos?';
    // Eslogan hero + línea de apoyo + caja de ejemplo rotable (doc 8 sep).
    // Van SIEMPRE que se muestre el billete: al arrancar sin ruta activa, y también
    // cuando desde el modo compañero se pulsa "Billete nuevo" (ver _ensureHero).
    const _ceHeroHTML = `
        <div class="ce-hero" data-ce-hero><p class="ce-slogan">Sin mapa,<br><span>con rumbo.</span></p></div>
        <div class="ce-tagline" data-ce-hero><p>Pregunta lo <span>imposible</span></p></div>
        <div class="ce-rotable" id="ce-rotable" data-ce-hero>
          <span class="ce-rotable-tag" id="ce-rotable-tag"></span>
          <p class="ce-rotable-ex" id="ce-rotable-ex"></p>
          <div class="ce-rotable-foot">
            <div class="ce-rotable-dots" id="ce-rotable-dots"><span class="on"></span><span></span><span></span><span></span><span></span><span></span></div>
            <span class="ce-rotable-hint">Toca para escribir la ruta</span>
          </div>
        </div>
        <button class="ce-rotable-cta" data-ce-hero data-ce-rotable-cta>Trazar ruta <span>→</span></button>
        <button class="ce-openbillete" data-ce-hero data-ce-openbillete>O rellena destino y días <span>↓</span></button>
        ${_ceActive ? '<button class="ce-back-active" data-ce-hero data-ce-back-active>← Volver a la ruta activa</button>' : ''}`;

    // Con guía activa: el cuadro de texto de siempre DEBAJO de su tarjeta, para pedir
    // otra ruta o preguntar (Paco, 26 sept 2026). Antes quedaba escondido y quien ya
    // tenía una guía no encontraba cómo crear otra. Mismos ids que el bloque hero, que
    // en este modo no se pinta (_wireRotable lo cablea igual).
    const _ceNextHTML = `
        <div class="ce-next" data-ce-next>
          <div class="ce-greet ce-greet--next">¿Y el próximo viaje?</div>
          <div class="ce-rotable" id="ce-rotable">
            <span class="ce-rotable-tag" id="ce-rotable-tag"></span>
            <p class="ce-rotable-ex" id="ce-rotable-ex"></p>
            <div class="ce-rotable-foot">
              <div class="ce-rotable-dots" id="ce-rotable-dots"><span class="on"></span><span></span><span></span><span></span><span></span><span></span></div>
              <span class="ce-rotable-hint">Toca para escribir la ruta</span>
            </div>
          </div>
          <button class="ce-rotable-cta" data-ce-rotable-cta>Trazar ruta <span>→</span></button>
        </div>`;

    area.innerHTML = `
      <div class="chat-empty">
        <!-- ⚠️ CLAUDE.md protocolo §9: logo/eslogan replicados en scripts/build-destinos.js
             (LOGO_HTML) para las 1.793 páginas de /destinos/ — si tocas texto/clases aquí,
             tócalo también ahí. -->
        <div class="ce-top"><span class="ce-brand" data-ce-home role="button" tabindex="0">✦ BORRADO<span>DEL</span>MAPA</span></div>
        <div class="ce-sky-date" id="ce-sky-time" data-ce-clock role="button" tabindex="0" title="Cambiar país o ciudad">${escapeHTML(_ceSkyTimeInit)}</div>
        <button class="ce-sky-wx-toggle" id="ce-sky-wx-toggle" data-ce-sky-wx-toggle aria-expanded="${_ceSkyWxOpen ? 'true' : 'false'}">${_ceSkyWxOpen ? '▴ ocultar' : '▾ tiempo'}</button>
        <div class="ce-sky-wx-wrap" id="ce-sky-wx-wrap"${_ceSkyWxOpen ? '' : ' hidden'}>
          <div class="ce-sky-wx" id="ce-sky-wxcard" data-ce-clock role="button" tabindex="0" title="Cambiar país o ciudad">
            <div class="wx-main">
              <span class="wx-loc" id="ce-sky-loc">${escapeHTML(_ceSkyLocInit)}</span>
              <div class="wx-center">
                <span class="wx-temp" id="ce-sky-temp">${escapeHTML(_ceSkyTempInit)}</span>
                <span class="wx-desc" id="ce-sky-desc">${escapeHTML(_ceSkyDescInit)}</span>
              </div>
            </div>
            <div class="wx-extras" id="ce-sky-extras"${_ceSkyCachedData ? '' : ' hidden'}>${_ceSkyExtrasInit}</div>
          </div>
          <button class="ce-sky-fc-toggle" id="ce-sky-fc-toggle" data-ce-sky-fc-toggle aria-expanded="${_ceSkyFcOpen ? 'true' : 'false'}"${_ceSkyFcCached.length ? '' : ' hidden'}>${_ceSkyFcOpen ? '▴' : '▾'} previsión</button>
          <div class="wx-forecast" id="ce-sky-fc"${(_ceSkyFcCached.length && _ceSkyFcOpen) ? '' : ' hidden'}>${_ceSkyFcHTML}</div>
          <div id="ce-sky-info"></div>
        </div>
        ${_ceActive ? `<div class="ce-greet">${_greet}</div>` : _ceHeroHTML}
        <div class="${_initCard.cls}" id="ce-card"${_ceActive ? '' : ' hidden'}>${_initCard.html}</div>
        ${_ceActive ? _ceNextHTML : ''}
        ${_ceChipsRow}
      </div>`;

    const ceCard = area.querySelector('#ce-card');
    if (ceCard) {
      ceCard.addEventListener('click', (e) => {
        // Ruta activa → abrir la GUÍA de ese viaje (vista itinerario)
        if (e.target.closest('[data-ce-guide]')) {
          try {
            const raw = localStorage.getItem('bdm_live_active_route');
            const rd = raw ? JSON.parse(raw) : null;
            const id = localStorage.getItem('bdm_live_active_route_id') || null;
            if (rd && rd.stops && rd.stops.length && typeof window.openItinerarioView === 'function') {
              window.openItinerarioView(rd, id, { saved: true, fromChat: false });
            } else if (id && typeof salma !== 'undefined' && salma.cargarGuia) {
              salma.cargarGuia(id, null);
            } else if (typeof openLiveMap === 'function') {
              openLiveMap();
            }
          } catch (_) {}
          return;
        }
        // Ruta activa → empezar un billete nuevo sin perder la ruta
        if (e.target.closest('[data-ce-newbillete]')) {
          // El cuadro de texto ya está debajo de la tarjeta: no duplicarlo (ids repetidos).
          if (area.querySelector('[data-ce-next]')) return;
          ceCard.className = 'ce-card ce-ticket';
          ceCard.innerHTML = _ceBilleteHTML(true);
          ceCard.hidden = true;              // arranca oculto tras "Desliza para trazar ruta rápida"
          const g = area.querySelector('.ce-greet');
          if (g) g.remove();                 // el eslogan hero lo sustituye
          _ensureHero();                     // eslogan + rotable + botón "Desliza..." + volver a ruta activa
          return;
        }
        // Billete — desplegar "Afinar"
        const afinar = e.target.closest('[data-ce-afinar]');
        if (afinar) {
          const more = ceCard.querySelector('.ce-more');
          const open = more.classList.toggle('open');
          const c = afinar.querySelector('.ce-afinar-c');
          if (c) c.textContent = open ? 'ocultar ▴' : '6 detalles · opcional ▾';
          return;
        }
        // Billete — chips
        const chip = e.target.closest('.ce-chip');
        if (chip) {
          const grp = chip.parentElement;
          if (grp.hasAttribute('data-single')) {
            grp.querySelectorAll('.ce-chip').forEach(x => x.classList.remove('on'));
            chip.classList.add('on');
            if (grp.dataset.field === 'fechas') {
              const box = ceCard.querySelector('.ce-tk-fechas');
              if (box) box.hidden = chip.dataset.v !== '__fechas__';
            }
          } else {
            chip.classList.toggle('on');
          }
          return;
        }
        // Billete — emitir
        if (e.target.closest('[data-ce-emit]')) {
          const cv = f => { const el = ceCard.querySelector(`.ce-chips[data-field="${f}"] .ce-chip.on`); return el ? (el.dataset.v || null) : null; };
          const mv = f => [...ceCard.querySelectorAll(`.ce-chips[data-field="${f}"] .ce-chip.on`)].map(x => x.dataset.v);
          const dest = ceCard.querySelector('.ce-tk-dest');
          const destino = dest ? dest.value.trim() : '';
          if (!destino) {
            if (dest) { dest.classList.add('ce-tk-dest--err'); dest.focus(); setTimeout(() => dest.classList.remove('ce-tk-dest--err'), 1600); }
            return;
          }
          let fechas = null;
          if (cv('fechas') === '__fechas__') {
            const i = ceCard.querySelector('.ce-tk-f1'), f = ceCard.querySelector('.ce-tk-f2');
            const ini = i && i.value ? i.value : null, fin = f && f.value ? f.value : null;
            if (ini || fin) fechas = { inicio: ini, fin: fin };
          }
          const notas = ceCard.querySelector('.ce-tk-notes');
          if (typeof salma !== 'undefined' && salma.emitirBillete) {
            salma.emitirBillete({
              destino,
              duracion_dias: cv('duracion_dias') || '5-7',
              fechas,
              compania: cv('compania'),
              presupuesto: cv('presupuesto'),
              ritmo: cv('ritmo'),
              intereses: mv('intereses'),
              restricciones: notas ? notas.value : null
            });
          }
          return;
        }
      });
    }

    // ── Caja de ejemplo rotable (doc 8 sep) — 4 perfiles en orden fijo ──
    const _wireRotable = () => {
      const _rot = area.querySelector('#ce-rotable');
      if (!_rot || _rot._wired) return;
      _rot._wired = true;
      // Propuesta UX (26 sept 2026): cada ejemplo enseña una capacidad distinta que
      // Salma SÍ hace bien (antes 3 de 4 eran Portugal y uno prometía pedir un Uber).
      const _exs = [
        { tag: 'Ruta', t: '10 días por Vietnam en moto, de norte a sur, sin autopistas y durmiendo en casas locales' },
        { tag: 'Imprevisto', t: 'Me han robado la cartera en Nápoles, ¿qué hago ahora mismo?' },
        { tag: 'Aquí y ahora', t: 'Estoy en Ronda con dos niños reventados, ¿dónde comemos ya algo que no sea para turistas?' },
        { tag: 'Vuelos', t: 'El vuelo más barato de Madrid a Bangkok en noviembre, me da igual el día' },
        { tag: 'Antes de ir', t: 'Japón en marzo: enchufes, SIM, efectivo y qué no hacer para no quedar mal' },
        { tag: 'Foto', t: '📷 Mándame una foto de un edificio y te digo qué es y si merece la pena entrar' }
      ];
      const _exEl = area.querySelector('#ce-rotable-ex');
      const _dots = area.querySelector('#ce-rotable-dots');
      const _hint = _rot.querySelector('.ce-rotable-hint');
      let _ri = 0, _rTimer = null, _rStopped = false, _editing = false;
      const _paint = () => {
        if (_exEl) _exEl.textContent = '“' + _exs[_ri].t + '”';
        const _tagEl = area.querySelector('#ce-rotable-tag');
        if (_tagEl) _tagEl.textContent = _exs[_ri].tag;
        if (_dots) [..._dots.children].forEach((d, i) => d.classList.toggle('on', i === _ri));
      };
      const _adv = () => {
        if (!_exEl || !_exEl.isConnected) { if (_rTimer) { clearInterval(_rTimer); _rTimer = null; } return; }
        _ri = (_ri + 1) % _exs.length; _paint();
      };
      const _stopRot = () => { if (_rTimer) { clearInterval(_rTimer); _rTimer = null; } _rStopped = true; };
      _paint();
      if (!_rStopped) _rTimer = setInterval(_adv, 6000);
      // Al tocar la caja, se convierte EN SITIO en un campo de texto editable —
      // antes bajaba al input de Salma más abajo (fix del 18 sept). Los ejemplos
      // siguen sin mandarse nunca solos: hace falta escribir algo y pulsar
      // "Trazar ruta" para que se mande (petición de Paco, 22 sept 2026).
      const _startEditing = () => {
        if (_editing || !_exEl) return;
        _editing = true;
        _stopRot();
        const ta = document.createElement('textarea');
        ta.className = 'ce-rotable-input';
        ta.id = 'ce-rotable-input';
        ta.rows = 3;
        ta.placeholder = 'Escríbeme la ruta que quieres...';
        ta.addEventListener('click', (e) => e.stopPropagation());
        _exEl.replaceWith(ta);
        ta.focus();
        if (_dots) _dots.hidden = true;
        const _tg = area.querySelector('#ce-rotable-tag'); if (_tg) _tg.hidden = true;
        if (_hint) _hint.textContent = 'Pulsa Trazar ruta para mandarla';
      };
      _rot.addEventListener('click', _startEditing);
      if (_dots) _dots.addEventListener('click', (e) => { e.stopPropagation(); if (_editing) return; _stopRot(); _adv(); });
      const _rcta = area.querySelector('[data-ce-rotable-cta]');
      if (_rcta) _rcta.addEventListener('click', (e) => {
        e.stopPropagation();
        const ta = document.getElementById('ce-rotable-input');
        const text = ta ? ta.value.trim() : '';
        if (text) { if (typeof salma !== 'undefined' && salma.send) salma.send(text); return; }
        if (ta) { ta.focus(); return; }
        _startEditing();
      });
    };
    // Inserta eslogan + caja rotable encima del billete si no están, y los cablea.
    const _ensureHero = () => {
      const card = area.querySelector('#ce-card');
      if (card && !area.querySelector('[data-ce-hero]')) card.insertAdjacentHTML('beforebegin', _ceHeroHTML);
      if (card) card.hidden = true;
      _wireRotable();
    };
    _wireRotable();   // hero (sin guía activa) o el bloque "¿Y el próximo viaje?" (con guía activa)

    // Botón "Desliza para trazar ruta rápida" → revela el billete. Y "Volver a la ruta
    // activa" (ambos viven en el bloque hero, fuera de #ce-card, por eso van aquí).
    // _renderChatEmpty() se llama varias veces por sesión (nueva ruta, volver al
    // índice, etc.) sobre el mismo #chat-area persistente — sin este guardián,
    // cada llamada apilaba OTRO listener encima sin quitar el anterior, y un
    // solo toque disparaba la acción 2-3 veces (el toggle de la previsión, al no
    // ser indiferente a repetirse, abría y cerraba en el mismo click — bug real
    // reportado por Paco, 20 sept 2026).
    if (!area._ceEmptyClickWired) {
      area._ceEmptyClickWired = true;
      area.addEventListener('click', (e) => {
      // Bloque de tiempo entero (tarjeta+previsión+info país) → plegar/desplegar,
      // la fecha/hora queda siempre visible fuera de este toggle.
      if (e.target.closest('[data-ce-sky-wx-toggle]')) {
        _ceSkyToggleWx();
        return;
      }
      // Previsión de varios días → plegar/desplegar (por defecto plegada, no distrae)
      if (e.target.closest('[data-ce-sky-fc-toggle]')) {
        _ceSkyToggleForecast();
        return;
      }
      // Hora + tiempo + país → cambiar de país
      if (e.target.closest('[data-ce-clock]')) {
        _ceSkyOpenPicker();
        return;
      }
      // Logo → volver al índice limpio
      if (e.target.closest('[data-ce-home]')) {
        if (typeof salma !== 'undefined' && salma.newChat) salma.newChat();
        try { window.scrollTo(0, 0); } catch (_) {}
        return;
      }
      if (e.target.closest('[data-ce-openbillete]')) {
        const card = area.querySelector('#ce-card');
        if (card) {
          card.hidden = false;
          // Sube directo al cuadro "¿A dónde?", no solo a la tarjeta — con
          // scrollIntoView sobre la tarjeta entera se veía primero la cabecera
          // del billete (Nº/Pasajero) en vez del campo de texto (Paco, 22 sept).
          const dest = card.querySelector('.ce-tk-dest');
          (dest || card).scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (dest) setTimeout(() => { try { dest.focus(); } catch (_) {} }, 320);
        }
        const ob = area.querySelector('[data-ce-openbillete]');
        if (ob) ob.hidden = true;
        return;
      }
      if (e.target.closest('[data-ce-back-active]')) {
        const card = area.querySelector('#ce-card');
        if (_ceActive && card) {
          card.className = 'ce-card ce-active ce-active--mini';
          card.hidden = false;
          card.innerHTML = _ceRouteCompactHTML(_ceActive);
          area.querySelectorAll('[data-ce-hero]').forEach(el => el.remove());
          if (!area.querySelector('.ce-greet')) card.insertAdjacentHTML('beforebegin', '<div class="ce-greet">¿Cómo va el viaje?</div>');
        }
        return;
      }
      });
    }
  } catch (err) {
    console.warn('[chat-empty] render nuevo falló, uso fallback', err);
    area.innerHTML = _ceFallback;
  }

  area.querySelectorAll('.chat-empty-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const action = chip.dataset.action;
      if (action === 'explorar' && e.target.closest('[data-camera-badge]')) {
        e.stopPropagation();
        narratorTakePhoto();
        return;
      }
      if (action === 'crear-ruta') {
        if (typeof salma !== 'undefined' && salma.startRutaGuiada) salma.startRutaGuiada();
        return;
      }
      if (action === 'sos') {
        const sosConfigured = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim()).length > 0;
        if (sosConfigured) showSOSConfirm(); else renderSOSConfig();
        return;
      }
      if (action === 'explorar') {
        if (typeof salma !== 'undefined') {
          if (salma._narratorActive) {
            showNarratorActiveMenu();
          } else {
            showNarratorConfirm();
          }
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
      if (action === 'consultas') {
        showState('consultas');   // funciona sin login (guarda en localStorage)
        return;
      }
      if (action === 'galeria') {
        if (!currentUser) { window._afterLogin = 'galeria'; openModal(); return; }
        showState('galeria');
        return;
      }
      if (action === 'moneda') {
        openCurrencyConverter();
        return;
      }
      if (action === 'whatsapp') {
        _openSalmaWhatsApp();
        return;
      }
      if (action === 'traductor') {
        if (typeof window.openTranslator === 'function') window.openTranslator();
        else if (typeof showToast === 'function') showToast('Traductor no disponible');
        return;
      }
      if (action === 'ruta-aqui') {
        if (typeof salma !== 'undefined') salma.send(chip.dataset.msg, { routeFromHere: true });
        return;
      }
      if (chip.dataset.msg && typeof salma !== 'undefined') salma.send(chip.dataset.msg);
    });
  });

  const _moreToggle = area.querySelector('#ce-more-toggle');
  const _moreChips = area.querySelector('#ce-more-chips');
  if (_moreToggle && _moreChips) {
    _moreToggle.addEventListener('click', () => {
      const open = _moreChips.classList.toggle('open');
      _moreToggle.setAttribute('aria-expanded', String(open));
      const ic = _moreToggle.querySelector('.ce-more-toggle-ic');
      if (ic) ic.textContent = open ? '▴' : '▾';
      try { localStorage.setItem('bdm_ce_more_open', open ? '1' : '0'); } catch (_) {}
    });
  }

  _ceSkyStartTicker();
  _ceSkyWeatherRefresh(_ceSkySel);
  const _ceSkyInfoCC = _ceSkyInfoCountryFor(_ceSkySel);
  if (_ceSkyInfoCC) _ceSkyInfoRefresh(_ceSkyInfoCC);
}

// ═══ HORA + TIEMPO + PAÍS (cabecera del billete) ═══
// Hora: Intl + huso IANA (COUNTRY_TZ) para "mi ubicación"/país — sin API,
// coste cero. Para una ciudad suelta buscada a mano usa el desfase UTC que
// ya trae /weather (utc_offset_sec), sin tabla propia.
// Tiempo (clima): reutiliza /weather (OpenWeatherMap) — con caché de 20 min
// por selección para no repetir llamadas. Aviso de coste dado a Paco al
// implementarlo (20 sept 2026): con "mi ubicación" no cambia nada (la
// llamada ya existía); al elegir país o buscar ciudad sí es una llamada
// nueva por selección, gratis hasta 1000/día en el plan actual.
// Info del país: /practical-info es solo lectura de KV (Cloudflare), sin
// ninguna API de pago detrás — cero coste, cambia con la misma selección.

// Estado guardado: {mode:'here'} | {mode:'country', code} | {mode:'city', query, label, countryCode}
function _ceSkyReadSel() {
  try {
    const raw = localStorage.getItem('bdm_sky_sel');
    if (raw) {
      const sel = JSON.parse(raw);
      if (sel && sel.mode) return sel;
    }
    // Migración del formato de la sesión anterior (string suelto)
    const old = localStorage.getItem('bdm_clock_country');
    if (old) {
      const sel = (old === 'here') ? { mode: 'here' } : { mode: 'country', code: old };
      localStorage.setItem('bdm_sky_sel', JSON.stringify(sel));
      localStorage.removeItem('bdm_clock_country');
      return sel;
    }
  } catch (_) {}
  return { mode: 'here' };
}

function _ceSkyWeatherKey(sel) {
  if (!sel || sel.mode === 'here') return 'here';
  if (sel.mode === 'country') return 'country:' + sel.code;
  if (sel.mode === 'city') return 'city:' + String(sel.query || '').toLowerCase();
  return 'here';
}

// País a usar para la tarjeta de info práctica (mismo país que la hora/tiempo)
function _ceSkyInfoCountryFor(sel) {
  if (!sel) return null;
  if (sel.mode === 'country') return sel.code;
  if (sel.mode === 'city') return sel.countryCode || null;
  if (sel.mode === 'here') {
    try { return (typeof salma !== 'undefined' && salma._copilotCountry) ? String(salma._copilotCountry).toUpperCase() : null; } catch (_) { return null; }
  }
  return null;
}

// Solo la hora+día, sin nombre de país delante (eso vive en la tarjeta de tiempo)
function _ceSkyTimeText(sel) {
  if (!sel || sel.mode === 'here') {
    let code = null;
    try { code = (typeof salma !== 'undefined' && salma._copilotCountry) ? String(salma._copilotCountry).toUpperCase() : null; } catch (_) {}
    if (code && typeof COUNTRY_TZ !== 'undefined' && COUNTRY_TZ[code] && typeof countryTimeString === 'function') {
      const name = (typeof CODE_TO_NAME !== 'undefined' && CODE_TO_NAME[code]) || code;
      const full = countryTimeString(code);
      return full.startsWith(name) ? full.slice(name.length).trim() : full;
    }
    return (typeof deviceTimeString === 'function') ? deviceTimeString() : '';
  }
  if (sel.mode === 'country') {
    const name = (typeof CODE_TO_NAME !== 'undefined' && CODE_TO_NAME[sel.code]) || sel.code;
    const full = (typeof countryTimeString === 'function') ? countryTimeString(sel.code) : '';
    return full.startsWith(name) ? full.slice(name.length).trim() : full;
  }
  if (sel.mode === 'city') {
    const key = _ceSkyWeatherKey(sel);
    const cached = window._ceSkyWxCache && window._ceSkyWxCache[key];
    const offsetSec = (cached && cached.data && typeof cached.data.utc_offset_sec === 'number') ? cached.data.utc_offset_sec : null;
    if (offsetSec !== null && typeof offsetTimeString === 'function') return offsetTimeString(offsetSec);
    if (sel.countryCode && typeof COUNTRY_TZ !== 'undefined' && COUNTRY_TZ[sel.countryCode] && typeof countryTimeString === 'function') {
      const name = (typeof CODE_TO_NAME !== 'undefined' && CODE_TO_NAME[sel.countryCode]) || sel.countryCode;
      const full = countryTimeString(sel.countryCode);
      return full.startsWith(name) ? full.slice(name.length).trim() : full;
    }
    return (typeof deviceTimeString === 'function') ? deviceTimeString() : '';
  }
  return '';
}

// "📍 Ribadedeva 🇪🇸" — ubicación exacta (de /weather) cuando ya llegó, si no un
// nombre razonable según el modo mientras se carga.
function _ceSkyLocLabel(sel, data) {
  const cc = (data && data.country) ? String(data.country).toUpperCase() : _ceSkyInfoCountryFor(sel);
  const emoji = cc ? ((typeof countryEmoji === 'function') ? countryEmoji(cc) : '') : '';
  if (data && data.location) return `📍 ${data.location}${emoji ? ' ' + emoji : ''}`;
  if (sel && sel.mode === 'country') {
    const name = (typeof CODE_TO_NAME !== 'undefined' && CODE_TO_NAME[sel.code]) || sel.code;
    return `${emoji} ${name}`.trim();
  }
  if (sel && sel.mode === 'city') return `📍 ${sel.label || sel.query || ''}${emoji ? ' ' + emoji : ''}`;
  return '📍 Buscando...';
}

// "Sens. 17° · 💨 14 km/h ESE · ráf. 20 · 💧 86% · 🟢 Buena" — mismo formato que
// la Weather Banner del chat (_wxRender en salma.js), reutilizado aquí.
function _ceSkyExtrasHTML(data) {
  if (!data) return '';
  const aqiLabels = ['', '🟢 Buena', '🟡 Acept.', '🟠 Moder.', '🔴 Mala', '🟣 Muy mala'];
  const gust = data.wind_gust_kmph ? ` · ráf. ${data.wind_gust_kmph}` : '';
  const aqi = data.aqi ? ` <span class="wx-dot">·</span> ${aqiLabels[data.aqi] || ''}` : '';
  return `Sens. ${data.feels_like}° <span class="wx-dot">·</span> 💨 ${data.wind_kmph} km/h ` +
    `<span class="wx-dir">${escapeHTML(data.wind_dir || '')}</span>${gust} <span class="wx-dot">·</span> 💧 ${data.humidity}%${aqi}`;
}

function _ceSkyForecastHTML(forecast) {
  if (!forecast || !forecast.length) return '';
  return forecast.map(f => {
    const icon = (typeof salma !== 'undefined' && salma._wxEmoji) ? salma._wxEmoji(f.icon) : '🌡️';
    return `<div class="wx-fc-day">
      <span class="wx-fc-name">${escapeHTML(f.day || '')}</span>
      <span class="wx-fc-icon">${icon}</span>
      <span class="wx-fc-temp">${f.max}°</span>
      <span class="wx-fc-min">${f.min}°</span>
    </div>`;
  }).join('');
}

function _ceSkyRenderTick() {
  const time = document.getElementById('ce-sky-time');
  if (!time) return;
  time.textContent = _ceSkyTimeText(_ceSkyReadSel());
}

function _ceSkyStartTicker() {
  if (window._ceSkyInterval) return;
  window._ceSkyInterval = setInterval(_ceSkyRenderTick, 30000);
  // Un par de repasos rápidos al principio: por si el país por GPS (copiloto)
  // tarda unos segundos en resolver, o si la info del país aún no se pidió.
  // Lo mismo para el tiempo en modo "mi ubicación": si la primera vez que se
  // pintó la pantalla el GPS (salma._userLocation) todavía no estaba listo,
  // antes se quedaba en blanco para siempre sin volver a intentarlo — bug
  // real reportado por Paco (20 sept 2026), corregido con este mismo reintento.
  const catchUp = () => {
    _ceSkyRenderTick();
    const sel = _ceSkyReadSel();
    const cc = _ceSkyInfoCountryFor(sel);
    if (cc) _ceSkyInfoRefresh(cc);
    if (sel.mode === 'here') {
      const key = _ceSkyWeatherKey(sel);
      const cached = window._ceSkyWxCache && window._ceSkyWxCache[key];
      if (!cached) _ceSkyWeatherRefresh(sel);
    }
  };
  setTimeout(catchUp, 3000);
  setTimeout(catchUp, 8000);
}

window._ceSkyWxCache = window._ceSkyWxCache || {};

// Pinta el bloque de tiempo completo (icono+temp+desc, extras de viento/sens./
// humedad/AQI, ubicación exacta y previsión) a partir de la respuesta de /weather.
// data === null → todavía no hay nada (cargando o falló), deja los huecos vacíos.
function _ceSkyPaintWeather(data) {
  const loc = document.getElementById('ce-sky-loc');
  const temp = document.getElementById('ce-sky-temp');
  const desc = document.getElementById('ce-sky-desc');
  const extras = document.getElementById('ce-sky-extras');
  const fc = document.getElementById('ce-sky-fc');
  const fcToggle = document.getElementById('ce-sky-fc-toggle');
  const sel = _ceSkyReadSel();
  if (loc) loc.textContent = _ceSkyLocLabel(sel, data);
  if (!data) {
    if (temp) temp.textContent = '…';
    if (desc) desc.textContent = '';
    if (extras) { extras.innerHTML = ''; extras.hidden = true; }
    if (fc) { fc.innerHTML = ''; fc.hidden = true; }
    if (fcToggle) fcToggle.hidden = true;
    return;
  }
  const icon = (typeof salma !== 'undefined' && salma._wxEmoji) ? salma._wxEmoji(data.icon) : '🌡️';
  if (temp) temp.textContent = `${icon} ${data.temp}°`;
  if (desc) desc.textContent = data.description || '';
  if (extras) { extras.innerHTML = _ceSkyExtrasHTML(data); extras.hidden = false; }
  const forecast = data.forecast || [];
  if (fcToggle) fcToggle.hidden = !forecast.length;
  if (fc) {
    if (!forecast.length) { fc.innerHTML = ''; fc.hidden = true; }
    else {
      fc.innerHTML = _ceSkyForecastHTML(forecast);
      // Rellena la previsión pero respeta si está plegada o desplegada (por
      // defecto plegada, a petición de Paco, para no llamar la atención).
      let open = false;
      try { open = localStorage.getItem('bdm_sky_fc_open') === '1'; } catch (_) {}
      fc.hidden = !open;
    }
  }
}

async function _ceSkyWeatherRefresh(sel) {
  const key = _ceSkyWeatherKey(sel);
  const FRESH_MS = 20 * 60 * 1000;
  const cache = window._ceSkyWxCache;
  const cached = cache[key];
  if (cached && (Date.now() - cached.ts) < FRESH_MS) {
    _ceSkyPaintWeather(cached.data);
    if (sel.mode === 'city') _ceSkyRenderTick();
    return;
  }
  try {
    let url;
    if (!sel || sel.mode === 'here') {
      let loc = null;
      try { loc = (typeof salma !== 'undefined') ? salma._userLocation : null; } catch (_) {}
      // Aún sin GPS — no lo dejamos en blanco (parecía "desaparecido"), el
      // reintento de _ceSkyStartTicker (3s/8s) lo rellena en cuanto lo haya.
      if (!loc) { _ceSkyPaintWeather(null); return; }
      url = `${window.SALMA_API}/weather?lat=${loc.lat}&lon=${loc.lng}`;
    } else if (sel.mode === 'country') {
      const q = (typeof countryWeatherQuery === 'function') ? countryWeatherQuery(sel.code) : null;
      if (!q) { _ceSkyPaintWeather(null); return; }
      url = `${window.SALMA_API}/weather?city=${encodeURIComponent(q)}`;
    } else if (sel.mode === 'city') {
      url = `${window.SALMA_API}/weather?city=${encodeURIComponent(sel.query)}`;
    } else return;
    const res = await fetch(url);
    if (!res.ok) { _ceSkyPaintWeather(null); return; }
    const data = await res.json();
    cache[key] = { data, ts: Date.now() };
    // Puede haber cambiado de selección mientras la petición estaba en vuelo
    if (_ceSkyWeatherKey(_ceSkyReadSel()) === key) {
      _ceSkyPaintWeather(data);
      if (sel.mode === 'city' && typeof data.utc_offset_sec === 'number') _ceSkyRenderTick();
    }
  } catch (_) {
    _ceSkyPaintWeather(null);
  }
}

// Plegar/desplegar el bloque de tiempo entero (tarjeta+previsión+info país) —
// plegado por defecto (petición de Paco, 22 sept: descargar visualmente el
// index). La fecha/hora (#ce-sky-time) se queda siempre visible, fuera de esto.
function _ceSkyToggleWx() {
  const el = document.getElementById('ce-sky-wx-wrap');
  const toggle = document.getElementById('ce-sky-wx-toggle');
  if (!el) return;
  const open = !!el.hidden; // estaba oculto → lo vamos a abrir
  el.hidden = !open;
  try { localStorage.setItem('bdm_sky_wx_open', open ? '1' : '0'); } catch (_) {}
  if (toggle) {
    toggle.textContent = open ? '▴ ocultar' : '▾ tiempo';
    toggle.setAttribute('aria-expanded', String(open));
  }
}

// Plegar/desplegar la previsión — plegada por defecto (petición de Paco, 20
// sept: no debe ocupar tanta atención), pero disponible con un toque.
function _ceSkyToggleForecast() {
  const el = document.getElementById('ce-sky-fc');
  const toggle = document.getElementById('ce-sky-fc-toggle');
  if (!el) return;
  const open = !!el.hidden; // estaba oculta → la vamos a abrir
  el.hidden = !open;
  try { localStorage.setItem('bdm_sky_fc_open', open ? '1' : '0'); } catch (_) {}
  if (toggle) {
    toggle.textContent = (open ? '▴' : '▾') + ' previsión';
    toggle.setAttribute('aria-expanded', String(open));
  }
}

function _ceSkySetSel(sel) {
  try { localStorage.setItem('bdm_sky_sel', JSON.stringify(sel)); } catch (_) {}
  _ceSkyRenderTick();
  _ceSkyWeatherRefresh(sel);
  const cc = _ceSkyInfoCountryFor(sel);
  if (cc) { _ceSkyInfoRefresh(cc); } else { const el = document.getElementById('ce-sky-info'); if (el) el.innerHTML = ''; }
}

async function _ceSkyInfoRefresh(cc) {
  const el = document.getElementById('ce-sky-info');
  if (!el) return;
  if (!cc) { el.innerHTML = ''; return; }
  const cacheKey = 'ce_sky_info_' + cc.toLowerCase();
  let pi = null;
  try { const cached = sessionStorage.getItem(cacheKey); if (cached) pi = JSON.parse(cached); } catch (_) {}
  if (!pi) {
    try {
      const res = await fetch(`${window.SALMA_API}/practical-info?country=${cc}`);
      if (!res.ok) { if (_ceSkyInfoCountryFor(_ceSkyReadSel()) === cc) el.innerHTML = ''; return; }
      const data = await res.json();
      pi = data.practical_info;
      if (!pi) { if (_ceSkyInfoCountryFor(_ceSkyReadSel()) === cc) el.innerHTML = ''; return; }
      try { sessionStorage.setItem(cacheKey, JSON.stringify(pi)); } catch (_) {}
    } catch (_) { return; }
  }
  // Puede haber cambiado de selección mientras la petición estaba en vuelo
  if (_ceSkyInfoCountryFor(_ceSkyReadSel()) !== cc) return;
  el.innerHTML = _ceSkyInfoHTML(pi);
}

function _ceSkyInfoHTML(pi) {
  let html = '<div class="copilot-card ce-sky-info-card">';
  html += '<div class="copilot-header" onclick="document.getElementById(\'ce-sky-info-body\').classList.toggle(\'copilot-open\')">';
  html += '<span class="copilot-title">📍 Info práctica del país</span><span class="copilot-toggle">▸</span></div>';
  html += '<div id="ce-sky-info-body" class="copilot-body">';
  if (pi.emergencies) {
    html += '<div class="copilot-section"><strong>🚨 Emergencias</strong><br>';
    if (pi.emergencies.general_number) html += '<strong>' + escapeHTML(pi.emergencies.general_number) + '</strong><br>';
    if (pi.emergencies.embassy) html += '<small>' + escapeHTML(pi.emergencies.embassy) + '</small>';
    html += '</div>';
  }
  if (pi.phrases && pi.phrases.list) {
    html += '<div class="copilot-section"><strong>🗣️ ' + escapeHTML(pi.phrases.language || 'Frases') + '</strong><div class="copilot-phrases">';
    for (const p of pi.phrases.list.slice(0, 6)) {
      html += '<span class="copilot-phrase"><b>' + escapeHTML(p.phrase) + '</b> ' + escapeHTML(p.meaning) + '</span>';
    }
    html += '</div></div>';
  }
  if (pi.useful_apps && pi.useful_apps.length) {
    html += '<div class="copilot-section"><strong>📱 Apps</strong><br><small>' + pi.useful_apps.map(escapeHTML).join('<br>') + '</small></div>';
  }
  if (pi.connectivity && pi.connectivity.sim_local) {
    html += '<div class="copilot-section"><strong>📶 Conectividad</strong><br><small>' + escapeHTML(pi.connectivity.sim_local) + '</small></div>';
  }
  if (pi.health) {
    html += '<div class="copilot-section"><strong>🏥 Salud</strong><br>';
    if (pi.health.hospitals) html += '<small>' + escapeHTML(pi.health.hospitals) + '</small><br>';
    if (pi.health.water) html += '<small><em>' + escapeHTML(pi.health.water) + '</em></small>';
    html += '</div>';
  }
  if (pi.budget) {
    html += '<div class="copilot-section"><strong>💰 Presupuesto</strong><br>';
    if (pi.budget.total_estimated) html += '<small>' + escapeHTML(pi.budget.total_estimated) + '</small><br>';
    if (pi.budget.exchange_tip) html += '<small><em>' + escapeHTML(pi.budget.exchange_tip) + '</em></small>';
    html += '</div>';
  }
  html += '</div></div>';
  return html;
}

async function _ceSkyCitySearch(query, overlay, btnEl) {
  const btn = btnEl || (overlay && overlay.querySelector('[data-city-search]'));
  if (btn) btn.textContent = 'Buscando...';
  try {
    const res = await fetch(`${window.SALMA_API}/weather?city=${encodeURIComponent(query)}`);
    if (!res.ok) { if (btn) btn.textContent = 'No se encontró esa ciudad — prueba otro nombre'; return; }
    const data = await res.json();
    const sel = { mode: 'city', query, label: data.location || query, countryCode: (data.country || '').toUpperCase() };
    const key = _ceSkyWeatherKey(sel);
    window._ceSkyWxCache[key] = { data, ts: Date.now() };
    if (overlay) overlay.remove();
    _ceSkySetSel(sel);
  } catch (_) {
    if (btn) btn.textContent = 'Error buscando — prueba otra vez';
  }
}

function _ceSkyOpenPicker() {
  if (document.getElementById('ce-clock-picker')) return;
  const current = _ceSkyReadSel();
  const list = (typeof countryList === 'function') ? countryList() : [];
  const overlay = document.createElement('div');
  overlay.id = 'ce-clock-picker';
  overlay.className = 'wx-picker-overlay';
  overlay.innerHTML = `
    <div class="wx-picker">
      <div class="wx-picker-head">
        <span>Hora, tiempo y país</span>
        <button data-ce-clock-close>✕</button>
      </div>
      <button class="wx-picker-gps${current.mode === 'here' ? ' on' : ''}" data-code="here">📍 Mi ubicación</button>
      <div class="wx-picker-row">
        <input id="ce-clock-search" class="wx-city-input" type="text" placeholder="Buscar país o ciudad..." autocomplete="off">
      </div>
      <div id="ce-clock-list" class="ce-clock-list"></div>
    </div>`;
  document.body.appendChild(overlay);

  const _norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  // Si el texto coincide EXACTO con un país de la lista (ej. "Catar"), ese país
  // gana siempre sobre la búsqueda libre de ciudad — evita que un intro/Enter
  // dispare una geocodificación ambigua que puede devolver cualquier cosa
  // parecida (bug real: "Catar" resolvió a "Csatár", un pueblo de Hungría).
  const _exactCountry = (q) => { const qq = _norm(q); return list.find(c => _norm(c.name) === qq) || null; };
  const listEl = overlay.querySelector('#ce-clock-list');
  const inp = overlay.querySelector('#ce-clock-search');
  const paint = (q) => {
    const qq = _norm(q);
    const filtered = qq ? list.filter(c => _norm(c.name).includes(qq)) : list;
    let html = filtered.length
      ? filtered.slice(0, 80).map(c =>
          `<button class="ce-clock-item${(current.mode === 'country' && current.code === c.code) ? ' on' : ''}" data-code="${c.code}">${c.emoji} ${escapeHTML(c.name)}</button>`
        ).join('')
      : (qq ? '' : '<div class="ce-clock-empty">Sin resultados</div>');
    // Sin ofrecer "buscar como ciudad" si el texto ya es un país exacto de la
    // lista — sería una alternativa confusa y más arriesgada que la buena.
    if (qq && !_exactCountry(q)) {
      html += `<button class="ce-clock-item ce-clock-item--city" data-city-search="1">🔍 Buscar "${escapeHTML(q.trim())}" como ciudad</button>`;
    }
    listEl.innerHTML = html;
  };
  paint('');

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('[data-ce-clock-close]')) { overlay.remove(); return; }
    const cityBtn = e.target.closest('[data-city-search]');
    if (cityBtn) {
      const q = (inp.value || '').trim();
      if (q) _ceSkyCitySearch(q, overlay, cityBtn);
      return;
    }
    const btn = e.target.closest('[data-code]');
    if (!btn) return;
    _ceSkySetSel(btn.dataset.code === 'here' ? { mode: 'here' } : { mode: 'country', code: btn.dataset.code });
    overlay.remove();
  });
  inp.addEventListener('input', () => paint(inp.value));
  inp.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = (inp.value || '').trim();
    if (!q) return;
    const exact = _exactCountry(q);
    if (exact) { _ceSkySetSel({ mode: 'country', code: exact.code }); overlay.remove(); return; }
    _ceSkyCitySearch(q, overlay);
  });
  setTimeout(() => { try { inp.focus(); } catch (_) {} }, 80);
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
    if (typeof salma !== 'undefined' && salma.isBusyNotify()) return;   // Salma responde: no vaciar lo escrito
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
      if (typeof salma !== 'undefined' && salma.isBusyNotify()) return;   // Salma responde: no vaciar lo escrito
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
          if (d.estado === 'borrador') return; // ruta guiada a medias — no mostrar
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
    },
    {
      icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
      title: 'En tu WhatsApp',
      desc: 'Todo esto también por WhatsApp: por texto, nota de voz o foto. Vincúlalo en Perfil.'
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
  if (!currentUser) { showState('chat'); return; }

  // Plan del usuario (coins eliminados 21 sept 2026): Premium activo ⇔ premium_until futuro
  const _puMs = currentUser.premium_until ? new Date(currentUser.premium_until).getTime() : 0;
  const premiumActivo = _puMs > Date.now();
  const planNum = premiumActivo ? 'PREMIUM' : 'GRATIS';
  const planBadge = premiumActivo ? 'Premium' : 'Gratis';
  const initial = (currentUser.name || currentUser.email || 'V')[0].toUpperCase();
  const sosConfigured = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim()).length > 0;

  const avatarHtml = currentUser.avatarURL
    ? `<div class="prof-avatar prof-avatar-has-img" id="prof-avatar-btn"><img src="${currentUser.avatarURL}" alt="Avatar"><div class="prof-avatar-edit-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div></div>`
    : `<div class="prof-avatar" id="prof-avatar-btn">${escapeHTML(initial)}<div class="prof-avatar-edit-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div></div>`;

  // Orden del Perfil (Paco, 26 sept 2026): fuera "Cuaderno de Viaje" (duplicaba Mis Viajes:
  // las mismas rutas agrupadas por país) y las filas ocultas (Notas, Galería, ¿Qué puedo
  // hacer?) con sus separadores; "Mi plan" pasa a CUENTA; se ve con qué cuenta se ha
  // entrado; SOS aquí solo configura contactos (el envío está en el acceso SOS del inicio).
  const _waPhone = currentUser.waPhone || '';
  const _viaLine = currentUser.email
    ? 'Entraste con Google · ' + escapeHTML(currentUser.email)
    : (currentUser.phone ? 'Entraste con WhatsApp · ' + escapeHTML(currentUser.phone) : '');

  $content.innerHTML = `
    <div class="profile-area prof-v2 fade-in">
      <input type="file" id="prof-avatar-input" accept="image/*" style="display:none">
      <input type="file" id="prof-avatar-camera" accept="image/*" capture="user" style="display:none">

      <!-- Hero Header -->
      <div class="prof-hero">
        <div class="prof-hero-glow"></div>
        ${avatarHtml}
        <div class="prof-hero-name">${escapeHTML(currentUser.name || 'Viajero')}</div>
        ${_viaLine ? `<div class="prof-hero-via">${_viaLine}</div>` : ''}
        <div class="prof-stats-strip">
          <div class="prof-stat-card" id="prof-stat-plan">
            <div class="prof-stat-number">${planNum}</div>
            <div class="prof-stat-label">TU PLAN</div>
          </div>
          <div class="prof-stat-divider"></div>
          <div class="prof-stat-card">
            <div class="prof-stat-number" id="prof-stat-guides">&ndash;</div>
            <div class="prof-stat-label">VIAJES</div>
          </div>
        </div>
      </div>

      <!-- Tu viaje -->
      <div class="prof-group">
        <div class="prof-group-title">TU VIAJE</div>
        <div class="prof-card">
          <div class="prof-row prof-row-highlight" id="prof-perfil-ia">
            <span class="prof-row-icon prof-row-icon-accent"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2a4.5 4.5 0 0 0-4.5 4.5v.34A3.5 3.5 0 0 0 3 10v1a3.5 3.5 0 0 0 1.35 2.76A4.5 4.5 0 0 0 9 18.5V21"/><path d="M14.5 2a4.5 4.5 0 0 1 4.5 4.5v.34A3.5 3.5 0 0 1 21 10v1a3.5 3.5 0 0 1-1.35 2.76A4.5 4.5 0 0 1 15 18.5V21"/><path d="M9 21h6"/></svg></span>
            <span class="prof-row-label">Lo que Salma sabe de ti</span>
            <span class="prof-row-badge">${(currentUser.perfil_ia?.facts || []).length} DATOS</span>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-docs">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
            <span class="prof-row-label">Documentos del Viajero</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Seguridad: aquí solo se configuran los contactos -->
      <div class="prof-group">
        <div class="prof-group-title">SEGURIDAD</div>
        <div class="prof-card ${sosConfigured ? 'prof-card-sos-on' : 'prof-card-sos-off'}">
          <div class="prof-row prof-row-sos" id="prof-sos">
            <span class="prof-row-icon prof-row-icon-sos"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
            <span class="prof-row-label">Contactos SOS<span class="prof-row-hint">A quién avisamos si pulsas SOS</span></span>
            <span class="prof-sos-badge">${sosConfigured
              ? '<span class="prof-sos-on">configurado</span>'
              : '<span class="prof-sos-off">sin configurar</span>'}</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>

      <!-- Cuenta -->
      <div class="prof-group">
        <div class="prof-group-title">CUENTA</div>
        <div class="prof-card">
          <div class="prof-row" id="prof-plan">
            <span class="prof-row-icon prof-row-icon-coins"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.5 9a3.5 3.5 0 0 0-5 0"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/></svg></span>
            <span class="prof-row-label">Mi plan</span>
            <span class="prof-coins-badge">${planBadge}</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row prof-row-switch" id="prof-share-routes">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></span>
            <span class="prof-row-label">Compartir mis rutas<span class="prof-row-hint">Otros viajeros las ven en Explorar, con tu nombre de pila</span></span>
            <label class="prof-switch"><input type="checkbox" id="prof-share-toggle" ${currentUser.share_routes !== false ? 'checked' : ''}><span class="prof-switch-track"></span></label>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-whatsapp">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
            ${_waPhone
              ? `<span class="prof-row-label">WhatsApp vinculado<span class="prof-row-hint">${escapeHTML(_waPhone)} · toca para hablar con Salma</span></span>`
              : '<span class="prof-row-label">Vincular WhatsApp<span class="prof-row-hint">Tus rutas y notas de WhatsApp, también aquí</span></span>'}
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row" id="prof-logout">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            <span class="prof-row-label">Cerrar sesión</span>
            <svg class="prof-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div class="prof-row-sep"></div>
          <div class="prof-row prof-row-danger" id="prof-delete-account">
            <span class="prof-row-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></span>
            <span class="prof-row-label">Borrar mi cuenta</span>
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
  document.getElementById('prof-perfil-ia').addEventListener('click', () => showState('perfil-ia'));
  document.getElementById('prof-plan').addEventListener('click', openCoinsModal);
  document.getElementById('prof-docs').addEventListener('click', () => {
    if (typeof docsViajero !== 'undefined') docsViajero.render();
  });
  document.getElementById('prof-whatsapp').addEventListener('click', () => {
    // Con WhatsApp (creada desde WhatsApp o ya vinculada) → abre la conversación; si no, vincular
    _openSalmaWhatsApp();
  });
  document.getElementById('prof-share-toggle').addEventListener('change', async (e) => {
    const on = e.target.checked;
    e.target.disabled = true;
    try {
      await setShareRoutes(on);
      showToast(on ? 'Tus rutas se ven en Explorar' : 'Tus rutas ya no salen en Explorar');
    } catch (err) {
      console.warn('Error cambiando Compartir mis rutas:', err);
      e.target.checked = !on;
      showToast('No se pudo cambiar, prueba otra vez');
    }
    e.target.disabled = false;
  });
  document.getElementById('prof-galeria-info')?.addEventListener('click', () => {
    showInfoPopup('Aquí puedes organizar las fotos de todos tus viajes. Crear galerías nuevas. Y hacer videos para compartir con tus amigos en redes sociales o como quieras.');
  });
  // Aquí solo se configuran los contactos (antes, con contactos puestos, abría el ENVÍO del SOS)
  document.getElementById('prof-sos').addEventListener('click', () => renderSOSConfig());
  document.getElementById('prof-logout').addEventListener('click', () => {
    if (confirm('¿Cerrar sesión?')) logout();
  });
  document.getElementById('prof-delete-account').addEventListener('click', openDeleteAccountModal);
  // Stats: click en el plan abre el modal Premium
  document.getElementById('prof-stat-plan')?.addEventListener('click', openCoinsModal);
  // Stats: cargar conteo de guías async
  db.collection('users').doc(currentUser.uid)
    .collection('maps').get().then(snap => {
      const el = document.getElementById('prof-stat-guides');
      let n = 0;
      snap.forEach(doc => { const d = doc.data(); if (d.estado !== 'borrador' && !d.saved_from) n++; }); // ni rutas guiadas a medias ni rutas guardadas de otros
      if (el) el.textContent = n;
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
    snap.forEach(doc => {
      const d = doc.data();
      if (d.estado === 'borrador') return; // ruta guiada a medias — no mostrar
      allGuides.push({ id: doc.id, data: d });
    });

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
  const photo = d.map_thumbnail_url || d.cover_image || destPhoto(d.destino || d.country || d.nombre || '');
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
  // Miniatura de mapa con las paradas: si esta guía todavía no la tiene (nunca se
  // abrió como ruta activa), generarla ahora — una sola vez, Google Static Maps,
  // se cachea para siempre — y sustituir la foto genérica de destPhoto() en cuanto
  // llegue. Mismo endpoint que ya usa la tarjeta de "ruta activa" (_ensureRouteThumbnail).
  if (!isOffline && !d.map_thumbnail_url && d.itinerarioIA) {
    let routeDataThumb = null;
    try { routeDataThumb = JSON.parse(d.itinerarioIA); } catch (_) {}
    if (routeDataThumb) {
      _ensureRouteThumbnail(routeDataThumb, doc.id).then(() => {
        if (routeDataThumb.map_thumbnail_url) {
          const img = card.querySelector('.viaje-card-img');
          if (img) img.style.backgroundImage = `url('${routeDataThumb.map_thumbnail_url}')`;
        }
      });
    }
  }
  return card;
}

// ═══ PERFIL IA — "Lo que Salma sabe de ti" ═══
// Perfil de viajero: se guarda en users/{uid}.perfil_ia (facts + proactive).
// Esta pantalla es solo lectura/edición manual sobre Firestore — no llama a
// ninguna IA. La extracción automática de facts (GPT-4o-mini tras cada ruta)
// es un paso aparte, pendiente de aviso de coste antes de implementarse.

const PERFIL_IA_CATEGORIAS = [
  { id: 'estilo', title: 'ESTILO DE VIAJE' },
  { id: 'restricciones', title: 'RESTRICCIONES' },
  { id: 'patrones', title: 'PATRONES DETECTADOS' },
  // Señal de satisfacción/tono detectada en el chat (ej. "esto no me sirvió",
  // "qué borde", "gracias, genial") — solo para detectar y mostrar, NUNCA para
  // que el prompt cambie de personalidad solo por queja de un usuario (ver
  // conversación 19 sept 2026: Salma es una marca con carácter fijo).
  { id: 'trato', title: 'TRATO Y SATISFACCIÓN' }
];

function renderPerfilIA() {
  const $c = document.getElementById('app-content');
  const perfilIA = currentUser.perfil_ia || { facts: [], proactive: true };
  const facts = perfilIA.facts || [];

  const gruposHtml = PERFIL_IA_CATEGORIAS.map(cat => {
    const factsCat = facts.filter(f => f.categoria === cat.id);
    const factsHtml = factsCat.length
      ? factsCat.map(f => `
        <div class="perfil-ia-fact">
          <span class="perfil-ia-fact-text">${escapeHTML(f.texto)}</span>
          <button class="perfil-ia-fact-remove" data-fact-id="${f.id}" aria-label="Quitar este dato" type="button">✕</button>
        </div>`).join('')
      : `<div class="perfil-ia-empty">Nada guardado aquí todavía.</div>`;
    return `
      <div class="perfil-ia-group">
        <div class="perfil-ia-group-title">${cat.title}</div>
        ${factsHtml}
      </div>`;
  }).join('');

  $c.innerHTML = `
    <div class="perfil-ia-area fade-in">
      <div class="perfil-ia-header">
        <button class="perfil-ia-back" id="perfil-ia-back">← PERFIL</button>
        <div class="perfil-ia-title">Lo que Salma sabe de ti</div>
        <div class="perfil-ia-sub">Lo va aprendiendo solo de tus rutas y notas — nunca con un formulario. Puedes corregirlo o borrarlo cuando quieras.</div>
      </div>

      ${gruposHtml}

      <div class="perfil-ia-add">
        <input class="perfil-ia-add-input" id="perfil-ia-add-input" type="text" placeholder="Añade algo tú mismo…" maxlength="140">
        <button class="perfil-ia-add-btn" id="perfil-ia-add-btn" type="button">AÑADIR</button>
      </div>

      <div class="perfil-ia-toggle-row">
        <div style="flex:1;min-width:0;">
          <div class="perfil-ia-toggle-title">Que Salma use esto para avisarte sola</div>
          <div class="perfil-ia-toggle-sub">Ej: recordarte el aniversario de un viaje, o un seguro a punto de caducar.</div>
        </div>
        <label class="profile-toggle">
          <input type="checkbox" id="perfil-ia-proactive" ${perfilIA.proactive !== false ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>`;

  document.querySelector('.app-input-bar').style.display = 'none';
  currentState = 'perfil-ia';

  document.getElementById('perfil-ia-back').addEventListener('click', () => {
    document.querySelector('.app-input-bar').style.display = '';
    showState('profile');
  });

  $c.querySelectorAll('.perfil-ia-fact-remove').forEach(btn => {
    btn.addEventListener('click', () => _perfilIARemoveFact(btn.dataset.factId));
  });

  document.getElementById('perfil-ia-add-btn').addEventListener('click', _perfilIAAddFact);
  document.getElementById('perfil-ia-add-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') _perfilIAAddFact();
  });

  document.getElementById('perfil-ia-proactive').addEventListener('change', (e) => {
    _perfilIASetProactive(e.target.checked);
  });
}

async function _perfilIASave(newPerfilIA) {
  await db.collection('users').doc(currentUser.uid).update({ perfil_ia: newPerfilIA });
  currentUser.perfil_ia = newPerfilIA;
}

async function _perfilIARemoveFact(factId) {
  if (!currentUser || !factId) return;
  const perfilIA = currentUser.perfil_ia || { facts: [], proactive: true };
  const newPerfilIA = { ...perfilIA, facts: (perfilIA.facts || []).filter(f => f.id !== factId) };
  try {
    await _perfilIASave(newPerfilIA);
    renderPerfilIA();
  } catch (e) {
    showToast('Error al borrar');
  }
}

async function _perfilIAAddFact() {
  const input = document.getElementById('perfil-ia-add-input');
  const texto = (input?.value || '').trim();
  if (!texto || !currentUser) return;
  const perfilIA = currentUser.perfil_ia || { facts: [], proactive: true };
  const newFact = { id: 'manual-' + Date.now(), categoria: 'estilo', texto, origen: 'manual', fecha: Date.now() };
  const newPerfilIA = { ...perfilIA, facts: [...(perfilIA.facts || []), newFact] };
  try {
    await _perfilIASave(newPerfilIA);
    renderPerfilIA();
  } catch (e) {
    showToast('Error al guardar');
  }
}

async function _perfilIASetProactive(value) {
  if (!currentUser) return;
  const perfilIA = currentUser.perfil_ia || { facts: [], proactive: true };
  try {
    await _perfilIASave({ ...perfilIA, proactive: value });
  } catch (e) {
    showToast('Error al guardar');
  }
}

// Llamada en segundo plano tras guardar una ruta — GPT-4o-mini extrae como mucho
// 3 datos nuevos (estilo/restricciones/patrones/trato) a partir de la ruta y del
// chat reciente. Silenciosa: si falla, no molesta ni bloquea el guardado de la ruta.
async function _perfilIAExtract(ruta) {
  if (!currentUser) { console.log('[PerfilIA] sin currentUser, no se llama'); return; }
  const perfilIA = currentUser.perfil_ia || { facts: [], proactive: true };

  const authUser = auth.currentUser;
  if (!authUser) { console.log('[PerfilIA] sin auth.currentUser, no se llama'); return; }
  const token = await authUser.getIdToken();

  const existingFacts = (perfilIA.facts || []).map(f => ({ categoria: f.categoria, texto: f.texto }));
  const recentMessages = (typeof salma !== 'undefined' && Array.isArray(salma.history))
    ? salma.history.slice(-12).map(m => ({ role: m.role, text: m.content }))
    : [];
  const guideSummary = {
    nombre: ruta.nombre,
    destino: ruta.destino,
    num_dias: ruta.num_dias,
    notas: (ruta.notas || '').slice(0, 500)
  };
  console.log('[PerfilIA] pidiendo extracción', { guideSummary, existingFactsCount: existingFacts.length, recentMessagesCount: recentMessages.length });

  let res;
  try {
    res = await fetch(`${window.SALMA_API}/perfil-ia-extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ guideSummary, existingFacts, recentMessages })
    });
  } catch (e) {
    console.warn('[PerfilIA] fetch falló:', e.message);
    return;
  }
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.warn('[PerfilIA] respuesta no OK:', res.status, errText);
    return;
  }
  const { facts } = await res.json();
  console.log('[PerfilIA] facts recibidos:', facts);
  if (!Array.isArray(facts) || !facts.length) { console.log('[PerfilIA] sin datos nuevos que aportar'); return; }

  const newFacts = facts.map(f => ({
    id: 'auto-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    categoria: f.categoria,
    texto: f.texto,
    origen: 'auto',
    fecha: Date.now()
  }));
  await _perfilIASave({ ...perfilIA, facts: [...(perfilIA.facts || []), ...newFacts] });
  console.log('[PerfilIA] guardados', newFacts.length, 'datos nuevos en Firestore');
}

// ═══ BITÁCORA — Organizada por países ═══

async function renderBitacora() {
  if (!currentUser) { showState('chat'); return; }

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
      if (d.estado === 'borrador') return; // ruta guiada a medias — no mostrar
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

  const $c = document.getElementById('app-content');
  // Limpiar herencias del chat (si venimos de ahí): bg-layer oscuro + padding grande
  $c.classList.remove('app-content--chat');
  $c.style.paddingBottom = '80px';
  const _bgLayer = document.getElementById('chat-bg-layer');
  if (_bgLayer) _bgLayer.remove();

  updateHeader();

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
        <button class="sv-back" onclick="history.back()" aria-label="Volver">‹</button>
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
  // Pestaña activa: sin sesión solo existe "Explorar"
  if (!currentUser || window._rutasTab === 'explorar') { renderExplorar(); return; }

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
    ${_rutasTabsHtml('mis')}
    <div class="viajes-grid" id="viajes-grid">
      <div class="viaje-card viaje-card-new" id="btn-new-guide">
        <div class="viaje-card-new-icon">+</div>
        <div class="viaje-card-new-txt">NUEVA GUÍA</div>
      </div>
    </div>`;

  _wireRutasTabs();
  document.getElementById('btn-new-guide').addEventListener('click', () => {
    if (typeof salma !== 'undefined') salma.reset();
    if (typeof salma !== 'undefined') salma._initChat();
    showState('chat');
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
      if (d.estado === 'borrador') return; // ruta guiada a medias — no mostrar
      allGuides.push({ id: doc.id, data: d });
    });
    if (kvDocs.length > 0) {
      kvDocs.forEach(doc => db.collection('users').doc(currentUser.uid).collection('maps').doc(doc.id).delete().catch(() => {}));
    }

    // Rutas de otros viajeros guardadas desde Explorar → sección aparte al final
    const savedGuides = allGuides.filter(g => g.data.saved_from);
    for (let i = allGuides.length - 1; i >= 0; i--) if (allGuides[i].data.saved_from) allGuides.splice(i, 1);

    // Función para crear una card
    function createCard(doc, d) {
      const card = document.createElement('div');
      card.className = 'viaje-card';
      const photo = d.map_thumbnail_url || d.cover_image || destPhoto(d.destino || d.country || d.nombre || '');
      card.innerHTML = `
        <div class="viaje-card-img" style="background-image:url('${escapeHTML(photo)}')"></div>
        <div class="viaje-card-body">
          <div class="viaje-card-title">${escapeHTML(d.nombre || 'Mi ruta')}</div>
          <div class="viaje-card-meta">${d.num_dias || d.dias || '?'} DÍAS · ${escapeHTML((d.destino || '').toUpperCase())}</div>
          ${d.saved_from ? `<div class="expl-card-autor">de ${escapeHTML(d.saved_from.autor || 'Viajero')}</div>` : ''}
        </div>
        <button class="viaje-card-delete" data-doc-id="${doc.id}" title="Eliminar guía">✕</button>`;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.viaje-card-delete')) return;
        if (e.target.closest('.viaje-card-historia')) {
          e.stopPropagation();
          const destino = e.target.closest('.viaje-card-historia').dataset.destino;
          if (typeof historiaModule !== 'undefined' && destino) {
            historiaModule.loadPlace(destino);
            showState('historia');
          }
          return;
        }
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
          if (slug) _refreshExplorarIndex();
          card.remove();
          // Si el grupo queda vacío, quitar el header
          const group = card.closest('.viaje-group');
          if (group && group.querySelectorAll('.viaje-card').length === 0) group.remove();
          showToast('Guía eliminada');
        } catch (err) {
          showToast('Error al eliminar');
        }
      });
      // Miniatura de mapa con las paradas: si esta guía todavía no la tiene, generarla
      // ahora (una sola vez, se cachea para siempre) y sustituir la foto genérica en
      // cuanto llegue — mismo endpoint que ya usa la tarjeta de "ruta activa".
      if (!d.map_thumbnail_url && d.itinerarioIA) {
        let routeDataThumb = null;
        try { routeDataThumb = JSON.parse(d.itinerarioIA); } catch (_) {}
        if (routeDataThumb) {
          _ensureRouteThumbnail(routeDataThumb, doc.id).then(() => {
            if (routeDataThumb.map_thumbnail_url) {
              const img = card.querySelector('.viaje-card-img');
              if (img) img.style.backgroundImage = `url('${routeDataThumb.map_thumbnail_url}')`;
            }
          });
        }
      }
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
    } else if (allGuides.length === 0 && savedGuides.length === 0) {
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
    if (savedGuides.length) {
      const group = document.createElement('div');
      group.className = 'viaje-group';
      group.innerHTML = `<div class="viaje-group-header">RUTAS GUARDADAS <span class="viaje-group-count">${savedGuides.length}</span></div>`;
      const groupGrid = document.createElement('div');
      groupGrid.className = 'viaje-group-grid';
      for (const g of savedGuides) groupGrid.appendChild(createCard(g, g.data));
      group.appendChild(groupGrid);
      grid.appendChild(group);
    }
  } catch (e) {
    console.error('Error cargando guías:', e);
    showToast('Error al cargar guías');
  }
}

// ═══ EXPLORAR — rutas de otros viajeros (25 sept 2026) ═══
// Guías públicas de todos los usuarios que tienen "Compartir mis rutas" activado,
// agrupadas por país → provincia. El índice lo arma el Worker (GET /explorar, caché KV)
// para no leer aquí cada guía entera. Visible sin sesión.

function _firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'Viajero';
}

function _rutasTabsHtml(active) {
  // Propuesta UX (26 sept 2026): Explorar y Mis Viajes son ya dos pestañas del menú de
  // abajo — esta segunda fila duplicaba lo mismo. Se deja sin pintar.
  return '';
  // eslint-disable-next-line no-unreachable
  return `<div class="rutas-tabs" role="tablist">
      <button class="rutas-tab ${active === 'mis' ? 'rutas-tab-active' : ''}" data-tab="mis">Mis rutas</button>
      <button class="rutas-tab ${active === 'explorar' ? 'rutas-tab-active' : ''}" data-tab="explorar">Explorar</button>
    </div>`;
}

function _wireRutasTabs() {
  $content.querySelectorAll('.rutas-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab === 'mis' && !currentUser) { window._rutasTab = 'mis'; window._afterLogin = 'rutas'; openModal(); return; }
      window._rutasTab = tab;
      loadUserGuides();
    });
  });
}

let _explorarData = null, _explorarAt = 0;

async function renderExplorar(countryIdx) {
  window._rutasTab = 'explorar';
  $content.innerHTML = `
    <div class="viajes-header fade-in">
      <h2 class="viajes-title">Explorar</h2>
      <div class="viajes-sub">Rutas que otros viajeros han hecho con Salma</div>
    </div>
    ${_rutasTabsHtml('explorar')}
    <div class="viajes-grid" id="expl-body"><div class="expl-msg">Cargando rutas…</div></div>`;
  _wireRutasTabs();
  const body = document.getElementById('expl-body');

  try {
    if (!_explorarData || Date.now() - _explorarAt > 5 * 60 * 1000) {
      const res = await fetch(window.SALMA_API + '/explorar');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _explorarData = await res.json();
      _explorarAt = Date.now();
    }
  } catch (e) {
    console.warn('Explorar: no se pudo cargar el índice', e);
    body.innerHTML = '<div class="expl-msg">No se pudieron cargar las rutas. Prueba otra vez en un rato.</div>';
    return;
  }
  // Si el usuario ya se fue a otra pantalla mientras cargaba, no pintar encima
  if (currentState !== 'rutas' || window._rutasTab !== 'explorar' || !document.getElementById('expl-body')) return;

  const countries = _explorarData.countries || [];
  if (!countries.length) {
    body.innerHTML = '<div class="expl-msg">Todavía no hay rutas compartidas. ¡Crea la primera con Salma!</div>';
    return;
  }
  // Código de país: el del índice o, si no viene, deducido del nombre (country-utils.js)
  const ccOf = (co) => co.cc || (typeof normalizeCountry === 'function' ? (normalizeCountry(co.name) || {}).code : '') || '';
  const flag = (co) => { const cc = ccOf(co); return (cc && typeof countryEmoji === 'function') ? countryEmoji(cc) + ' ' : ''; };

  // Nivel 1: lista de países
  const c = Number.isInteger(countryIdx) ? countries[countryIdx] : null;
  if (!c) {
    // Tarjeta por país con el mapa de una de sus rutas de fondo (más visual que una lista)
    const coverOf = (co) => {
      for (const p of co.provinces) for (const g of p.guides) if (g.thumb) return g.thumb;
      for (const p of co.provinces) for (const g of p.guides) if (g.cover) return g.cover;
      return destPhoto(co.name);
    };
    body.innerHTML = `<div class="expl-countries">${countries.map((co, i) => {
      const cc = ccOf(co);
      const fl = (cc && typeof countryEmoji === 'function') ? countryEmoji(cc) : '';
      return `
      <button class="expl-country" data-i="${i}" style="background-image:url('${escapeHTML(coverOf(co))}')">
        ${fl ? `<span class="expl-country-flag">${fl}</span>` : ''}
        <span class="expl-country-name">${escapeHTML(co.name)}</span>
        <span class="expl-country-count">${co.count} ${co.count === 1 ? 'RUTA' : 'RUTAS'}</span>
      </button>`;
    }).join('')}</div>`;
    body.querySelectorAll('.expl-country').forEach(btn => {
      btn.addEventListener('click', () => renderExplorar(Number(btn.dataset.i)));
    });
    return;
  }

  // Nivel 2: un país → provincias con sus rutas
  body.innerHTML = `<button class="expl-back" id="expl-back">‹ Todos los países</button>
    <div class="expl-country-title">${flag(c)}${escapeHTML(c.name)}</div>`;
  document.getElementById('expl-back').addEventListener('click', () => renderExplorar());
  for (const p of c.provinces) {
    const group = document.createElement('div');
    group.className = 'viaje-group';
    group.innerHTML = `<div class="viaje-group-header">${escapeHTML((p.name || '').toUpperCase())} <span class="viaje-group-count">${p.count}</span></div>`;
    const grid = document.createElement('div');
    grid.className = 'viaje-group-grid';
    for (const g of p.guides) grid.appendChild(_explorarCard(g));
    group.appendChild(grid);
    body.appendChild(group);
  }
  window.scrollTo(0, 0);
}

function _explorarCard(g) {
  const card = document.createElement('div');
  card.className = 'viaje-card';
  const photo = g.thumb || g.cover || destPhoto(g.destino || g.nombre || ''); // mismo orden que Mis rutas
  const dias = g.dias ? `${g.dias} ${g.dias == 1 ? 'DÍA' : 'DÍAS'} · ` : '';
  card.innerHTML = `
    <div class="viaje-card-img" style="background-image:url('${escapeHTML(photo)}')"></div>
    <div class="viaje-card-body">
      <div class="viaje-card-title">${escapeHTML(g.nombre || 'Ruta')}</div>
      <div class="viaje-card-meta">${dias}${escapeHTML((g.destino || '').toUpperCase())}</div>
      <div class="expl-card-autor">por ${escapeHTML(g.autor || 'Viajero')} · ${g.paradas} paradas</div>
    </div>`;
  card.addEventListener('click', () => _openPublicGuide(g.slug, g));
  return card;
}

// Con y sin sesión: se abre dentro de la app (vista itinerario, igual que una ruta
// compartida). Antes, sin sesión saltaba a la página pública (404.html), con el diseño y
// el menú antiguos (Paco, 26 sept 2026: "es lo antiguo"). public_guides es de lectura
// abierta, y GUARDAR sin sesión ya pide entrar (guardarGuia).
// Slug de guía pública válido (mismo formato que genera generateSlug) o null.
function _validSlug(s) {
  return (typeof s === 'string' && /^[a-z0-9-]{3,120}$/.test(s)) ? s : null;
}

async function _openPublicGuide(slug, g) {
  try {
    const doc = await db.collection('public_guides').doc(slug).get();
    if (!doc.exists) { showToast('Esta ruta ya no está disponible'); return; }
    const pg = doc.data();
    const routeData = JSON.parse(pg.itinerarioIA || '{}');
    // Marca de "ruta de otro viajero": si se pulsa GUARDAR, guardarGuiaDirecto() la guarda
    // como ruta guardada (no como propia) y no la vuelve a publicar en Explorar.
    routeData._saved_from = {
      slug, uid: pg.uid || '', autor: _firstName(pg.owner_name),
      thumb: (g && g.thumb) || '', cover: pg.cover_image || '',
    };
    if (!routeData.stops || !routeData.stops.length) { showToast('Esta ruta no tiene paradas'); return; }
    if (typeof window.openItinerarioView === 'function') {
      window.openItinerarioView(routeData, null, { fromChat: false, saved: false });
    } else {
      window.location.href = '/' + encodeURIComponent(slug);
    }
  } catch (e) {
    console.warn('Error abriendo ruta de Explorar:', e);
    window.location.href = '/' + encodeURIComponent(slug);
  }
}

// Borra la caché del índice en el Worker para que un cambio (ocultar/borrar) se note ya.
async function _refreshExplorarIndex() {
  _explorarData = null;
  try {
    const u = auth.currentUser;
    if (!u) return;
    const t = await u.getIdToken();
    await fetch(window.SALMA_API + '/explorar/refresh', { method: 'POST', headers: { 'Authorization': 'Bearer ' + t } });
  } catch (_) {}
}

// Interruptor "Compartir mis rutas" del Perfil: guarda la preferencia y marca todas sus
// guías públicas como visibles/ocultas en Explorar (de paso deja solo el nombre de pila).
async function setShareRoutes(on) {
  if (!currentUser) return;
  await db.collection('users').doc(currentUser.uid).set({ share_routes: on }, { merge: true });
  currentUser.share_routes = on;
  const snap = await db.collection('public_guides').where('uid', '==', currentUser.uid).get();
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    docs.slice(i, i + 400).forEach(d => batch.update(d.ref, { listed: on, owner_name: _firstName(currentUser.name) }));
    await batch.commit();
  }
  await _refreshExplorarIndex();
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
  // Código de "Entrar con WhatsApp" pedido ya (solo móvil), para abrir WhatsApp al instante.
  if (typeof window._waPrepLogin === 'function') { try { window._waPrepLogin(); } catch (_) {} }
  // La 1ª vez (al llegar) el botón es "Echar un vistazo sin cuenta"; si la portada se
  // abre desde dentro (un corte de registro, una ruta abierta detrás) es "Volver sin entrar".
  const _vb = document.getElementById('btn-vistazo-sin-login');
  if (_vb && (window._gateShownOnce || window._itinViewOpen)) {
    _vb.dataset.inside = '1';
    _vb.textContent = 'Volver sin entrar';
  }
  window._gateShownOnce = true;
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

// "Ver rutas de otros viajeros" en la pantalla de entrada — sin login, abre Explorar
document.getElementById('btn-explorar-sin-login')?.addEventListener('click', () => {
  _skipOnboardingFromGate();
  closeModal();
  window._rutasTab = 'explorar';
  showState('rutas');
});
// "Echar un vistazo sin cuenta" — entra al inicio de la app; escribir a Salma pide
// entrar en ese momento (salma._showLoginNeeded), sin gastar nada.
document.getElementById('btn-vistazo-sin-login')?.addEventListener('click', (e) => {
  _skipOnboardingFromGate();
  // Si la portada se vuelve a abrir desde dentro (ej. "Entrar gratis"), el botón
  // ya no es "echar un vistazo" sino volver a donde estaba, sin tocar la pantalla.
  // Con una ruta abierta detrás (avance del día 1) también: solo cerrar, sin ir al inicio.
  if (e.currentTarget.dataset.inside || window._itinViewOpen) {
    e.currentTarget.dataset.inside = '1';
    e.currentTarget.textContent = 'Volver sin entrar';
    try { localStorage.removeItem('bdm_reopen_guia'); } catch (_) {}
    closeModal();
    return;
  }
  e.currentTarget.dataset.inside = '1';
  e.currentTarget.textContent = 'Volver sin entrar';
  closeModal();
  showState('chat');
});
// La portada ya explica qué hace Salma: si el usuario elige un camino desde ahí, el
// tutorial de 3 pantallas (que estaba DEBAJO de la portada) no se le planta encima.
function _skipOnboardingFromGate() {
  try { localStorage.setItem('bdm_onboarding_done', '1'); } catch (_) {}
  const ob = document.getElementById('onboarding-overlay');
  if (ob) ob.remove();
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

// Una sola ventana de Google a la vez. Un segundo signInWithPopup con el primero abierto (doble toque, volver a
// pulsar porque el popup tarda en el móvil, o el respaldo de la huella a la vez que el botón) hace que Firebase
// cancele el primero con "auth/cancelled-popup-request" y salga un error rojo en inglés (21 sept 2026).
let _googlePopupBusy = false;
async function _signInWithGooglePopup() {
  if (_googlePopupBusy) return null;   // ya hay una ventana abierta: ignorar este toque
  _googlePopupBusy = true;
  const btn = document.getElementById('btn-google-login');
  if (btn) btn.disabled = true;
  try {
    return await auth.signInWithPopup(googleProvider);
  } finally {
    _googlePopupBusy = false;
    if (btn) btn.disabled = false;
  }
}
// Cancelaciones que no son un fallo: el usuario cerró la ventana o se abrió otra encima. Sin mensaje rojo.
function _isBenignPopupCancel(e) {
  return !!e && (e.code === 'auth/cancelled-popup-request' || e.code === 'auth/popup-closed-by-user');
}

// Todo lo que hay que hacer tras un login con Google que NO cubre ya
// auth.onAuthStateChanged (currentUser/enrutado, genérico para popup/redirect/sesión
// ya abierta): crear el doc de Firestore si es la primera vez, y ofrecer la huella.
// Compartida entre doGoogleLogin() (popup) y el respaldo por redirect (paso 3, ver
// abajo) para no duplicar esta lógica en los dos sitios.
async function _afterGoogleAuth(user) {
  const doc = await db.collection('users').doc(user.uid).get();
  if (!doc.exists) {
    await db.collection('users').doc(user.uid).set({
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      mapsCount: 0,
      // premium_until / isPremium / coins_saldo / rutas_gratis_usadas: NO se escriben desde
      // el cliente (las reglas de Firestore lo prohíben). Solo el Worker los toca.
      createdAt: new Date().toISOString()
    });
  }
  closeModal();
  // Ofrecer registrar huella si no la tiene y el dispositivo la soporta
  if (!localStorage.getItem('bdm_webauthn_cred') && window.PublicKeyCredential) {
    registerFingerprint(user.email);
  }
}

async function doGoogleLogin() {
  try {
    const result = await _signInWithGooglePopup();
    if (!result) return;   // había otra ventana abierta: no hacer nada
    await _afterGoogleAuth(result.user);
  } catch (e) {
    if (_isBenignPopupCancel(e)) { console.log('Google login cancelado (' + e.code + ')'); return; }
    // Paso 3 del protocolo (22 sept 2026): el navegador bloqueó el popup (frecuente en
    // Safari/móvil) — reintentar con redirect de página completa. auth.getRedirectResult()
    // (ver junto a auth.onAuthStateChanged, más abajo) recoge el resultado al volver.
    if (e && e.code === 'auth/popup-blocked') {
      console.log('Google: popup bloqueado, reintentando con signInWithRedirect...');
      try {
        await auth.signInWithRedirect(googleProvider);
      } catch (e2) {
        console.error('Google redirect error:', e2);
        showAuthError('login-error', authErrorMsg(e2));
      }
      return; // signInWithRedirect navega fuera de la página — nada más que hacer aquí
    }
    console.error('Google login error:', e);
    showAuthError('login-error', authErrorMsg(e));
  }
}

// Botón "Entrar con WhatsApp" — 26 sept 2026, reescrito de cero. Antes, en el móvil se
// mandaba el texto fijo "Hola Salma" y el Worker intentaba adivinar por el TEXTO si eso
// significaba "quiero entrar" — frágil (dependía de qué escribiera cada uno) y encima
// se rompía al probarlo varias veces el mismo día (el primer intento consumía la única
// pista que tenía el Worker). Ahora móvil y ordenador usan EXACTAMENTE el mismo
// mecanismo: un código de un solo uso que el propio botón mete en el mensaje, invisible
// para quien lo manda — no importa nada del texto, cada toque genera un código nuevo
// (/wa-qr-start + /wa-qr-poll, Firestore `wa_qr_logins/{código}`). En el ordenador se
// enseña como QR (como WhatsApp Web); en el móvil, WhatsApp se abre directo con el texto
// ya escrito y, al volver a la pestaña de la web, esta entra sola — sin escribir nada.
let _waDigits = '';
const WA_LOGIN_PENDING_KEY = 'bdm_wa_login_pending';
const WA_LOGIN_TTL_MS = 10 * 60 * 1000;

async function _setupWhatsAppStartButton() {
  const btn = document.getElementById('btn-whatsapp-start');
  if (!btn) return;
  try {
    const res = await fetch(window.SALMA_API + '/version');
    const data = await res.json();
    _waDigits = (data.whatsapp_number || '').replace(/[^\d]/g, '');
    if (!_waDigits) return;
    btn.classList.remove('hidden');
    // Móvil (26 sept 2026, Paco: la 1ª vez se abrió WhatsApp Web en vez de la app): el
    // navegador solo pasa un enlace a la app de WhatsApp si se abre JUSTO en el toque.
    // Antes se esperaba al Worker (/wa-qr-start) y después se abría — si tardaba, el
    // "permiso" del toque caducaba y se quedaba en la web. Ahora el código se pide al
    // abrirse la pantalla de entrada en el móvil (y, de respaldo, al EMPEZAR el toque:
    // pointerdown/touchstart) — el Worker tarda más que un toque — y al soltar ya está:
    // se abre sin esperar. Si aún no ha llegado, el botón pasa a "Abrir WhatsApp →" y el 2º toque (un toque
    // nuevo, con su permiso) lo abre. Nunca se abre WhatsApp después de un await.
    const isDesktop = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const _waHello = () => 'https://wa.me/' + _waDigits + '?text=' + encodeURIComponent('Hola Salma');
    let _waPrep = null;   // { ts, url, promise } — código pedido por adelantado
    const _prep = () => {
      if (_waPrep && Date.now() - _waPrep.ts < 8 * 60 * 1000) return _waPrep;   // el código dura 10 min
      const o = { ts: Date.now(), url: null, data: null };
      // Sin conexión para pedir el código: al menos WhatsApp con el saludo de siempre
      // (no se podrá auto-entrar, pero no bloquea) — igual que antes.
      o.promise = _waLoginStart(false).then(d => { o.data = d; o.url = _waLoginBuildUrl(d); }).catch(() => { o.url = _waHello(); });
      _waPrep = o;
      return o;
    };
    const _labelNode = [...btn.childNodes].reverse().find(n => n.nodeType === 3 && n.textContent.trim());
    const _labelOrig = _labelNode ? _labelNode.textContent : '';
    const _setLabel = (t) => { if (_labelNode) _labelNode.textContent = t; };
    const _early = () => { if (!isDesktop()) _prep(); };
    // Lo llama openModal() al enseñar la pantalla de entrada (y aquí mismo si ya estaba
    // abierta cuando llegó el número de WhatsApp).
    window._waPrepLogin = _early;
    const _scr = document.getElementById('auth-screen');
    if (_scr && _scr.classList.contains('active')) _early();
    btn.addEventListener('pointerdown', _early, { passive: true });
    btn.addEventListener('touchstart', _early, { passive: true });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isDesktop()) { _openWaQrLogin(); return; }
      const o = _prep();
      if (o.url) {
        _waPrep = null;          // un código por intento
        if (o.data) _waLoginSavePending(o.data);   // para entrar sola al volver de WhatsApp
        _setLabel(_labelOrig);
        location.href = o.url;   // síncrono, dentro del toque
        return;
      }
      if (btn.dataset.waWaiting) return;
      btn.dataset.waWaiting = '1';
      _setLabel(' Preparando…');
      o.promise.then(() => {
        delete btn.dataset.waWaiting;
        _setLabel(' Abrir WhatsApp →');
      });
    });
  } catch (e) {
    // sin número no se muestra el botón — no bloquea el resto del login
  }
}

function _loadQrLib() {
  if (window.qrcode) return Promise.resolve();
  return new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = '/vendor/qrcode-generator-1.4.4.js';
    s.onload = ok; s.onerror = ko;
    document.head.appendChild(s);
  });
}

// Pide un código nuevo al Worker y lo guarda en localStorage — lo usan tanto el QR del
// ordenador como el redirect directo del móvil.
async function _waLoginStart(save = true) {
  const r = await fetch(window.SALMA_API + '/wa-qr-start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const d = await r.json();
  if (!r.ok || !d.code) throw new Error('wa-qr-start');
  if (save) _waLoginSavePending(d);
  return d;
}
// Solo cuando de verdad se sale a WhatsApp con ese código: si se guardara al pedirlo por
// adelantado, _waLoginResume sondearía códigos que nadie ha usado.
function _waLoginSavePending(d) {
  try {
    localStorage.setItem(WA_LOGIN_PENDING_KEY, JSON.stringify({ code: d.code, secret: d.secret, ts: Date.now() }));
  } catch (e) { /* localStorage bloqueado: sigue funcionando el QR/redirect, solo no se podrá reanudar al volver */ }
}

function _waLoginBuildUrl(d) {
  const digits = (d.whatsapp_number || _waDigits).replace(/[^\d]/g, '');
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent('Entrar en la app · código ' + d.code);
}

// Una sola llamada a /wa-qr-poll. Devuelve el JSON o null si hubo un fallo de red.
async function _waLoginPollOnce(code, secret) {
  try {
    const r = await fetch(window.SALMA_API + '/wa-qr-poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, secret }) });
    return await r.json();
  } catch (e) {
    return null;
  }
}

// 26 sept 2026 — reanuda el login al volver a esta pestaña desde WhatsApp (móvil): si
// hay un código pendiente sin caducar y sin sesión activa, pregunta varias veces
// seguidas (cubre el caso normal de "mandar el WhatsApp y volver enseguida") y se para
// sola si no hay suerte, sin dejar un temporizador corriendo para siempre en segundo
// plano. Se llama al cargar la página y cada vez que la pestaña vuelve a ser visible.
//
// Contador de generación en vez de un simple booleano "ocupado" (bug real, encontrado
// 26 sept 2026): si el primer intento de abrir WhatsApp falla o se cancela, este bucle
// se queda escuchando el código VIEJO (que nunca se va a confirmar) hasta agotar sus
// ~30s. Con el booleano, un segundo intento que sí manda bien el mensaje y sí se
// confirma en el servidor quedaba bloqueado sin sondear ese código nuevo mientras el
// bucle viejo seguía vivo — el usuario recibía el WhatsApp de "ya deberías estar
// dentro" pero la web nunca llegaba a comprobarlo. Cada llamada ahora sube la
// generación y cualquier bucle anterior se para solo en su siguiente vuelta.
let _waLoginResumeGen = 0;
async function _waLoginResume() {
  let pending;
  try { pending = JSON.parse(localStorage.getItem(WA_LOGIN_PENDING_KEY) || 'null'); } catch (e) { pending = null; }
  if (!pending || !pending.code || !pending.secret) return;
  if (Date.now() - (pending.ts || 0) > WA_LOGIN_TTL_MS) { localStorage.removeItem(WA_LOGIN_PENDING_KEY); return; }
  if (typeof auth !== 'undefined' && auth.currentUser) { localStorage.removeItem(WA_LOGIN_PENDING_KEY); return; }
  const myGen = ++_waLoginResumeGen;
  for (let i = 0; i < 15; i++) { // ~30s de intentos cada vez que se reanuda
    if (myGen !== _waLoginResumeGen) return; // se ha lanzado un intento más nuevo (código distinto) — este se para
    const d = await _waLoginPollOnce(pending.code, pending.secret);
    if (d && d.status === 'ok' && d.custom_token) {
      localStorage.removeItem(WA_LOGIN_PENDING_KEY);
      await auth.signInWithCustomToken(d.custom_token);
      closeModal();
      return;
    }
    if (d && d.status === 'expired') { localStorage.removeItem(WA_LOGIN_PENDING_KEY); return; }
    await new Promise((r) => setTimeout(r, 2000));
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) _waLoginResume(); });
window.addEventListener('pageshow', () => _waLoginResume());

async function _openWaQrLogin() {
  if (document.getElementById('wa-qr-overlay')) return;
  const ov = document.createElement('div');
  ov.id = 'wa-qr-overlay';
  ov.className = 'wa-qr-overlay';
  ov.innerHTML = '<div class="wa-qr-card"><button class="wa-qr-close" aria-label="Cerrar">✕</button>' +
    '<p class="wa-qr-warn">⚠️ No lo escanees desde WhatsApp</p>' +
    '<div class="wa-qr-box" id="wa-qr-box"></div>' +
    '<p class="wa-qr-hint">Ábrelo con la cámara del móvil (la app de fotos, no WhatsApp)</p></div>';
  document.body.appendChild(ov);
  let timer = null, closed = false;
  const stop = () => { closed = true; if (timer) clearTimeout(timer); ov.remove(); };
  ov.querySelector('.wa-qr-close').addEventListener('click', stop);
  ov.addEventListener('click', (e) => { if (e.target === ov) stop(); });
  const box = ov.querySelector('#wa-qr-box');
  const deadline = Date.now() + WA_LOGIN_TTL_MS;

  const start = async () => {
    if (closed) return;
    if (Date.now() > deadline) { stop(); return; }
    try {
      await _loadQrLib();
      const d = await _waLoginStart();
      const url = _waLoginBuildUrl(d);
      const qr = window.qrcode(0, 'M');
      qr.addData(url); qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
      poll(d.code, d.secret);
    } catch (e) {
      box.textContent = 'Sin conexión. Reintentando…';
      timer = setTimeout(start, 4000);
    }
  };

  const poll = (code, secret) => {
    timer = setTimeout(async () => {
      if (closed) return;
      if (Date.now() > deadline) { stop(); return; }
      const d = await _waLoginPollOnce(code, secret);
      if (d && d.status === 'ok' && d.custom_token) {
        try { localStorage.removeItem(WA_LOGIN_PENDING_KEY); } catch (e) {}
        await auth.signInWithCustomToken(d.custom_token);
        stop();
        closeModal();
        return;
      }
      if (d && d.status === 'expired') { start(); return; }
      poll(code, secret);
    }, 2000);
  };

  start();
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
        const gRes = await _signInWithGooglePopup();
        if (gRes) closeModal();   // null = ya había otra ventana de Google abierta: no abrir otra
      } catch (gErr) {
        if (_isBenignPopupCancel(gErr)) { console.log('Google (respaldo huella) cancelado (' + gErr.code + ')'); return; }
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
// ═══ BORRAR MI CUENTA (26 sept 2026) — RGPD + requisito de Google Play ═══
// Mismo borrado que el panel admin (Worker: deleteUserCompletely vía /account/delete).
// Irreversible: se pide escribir BORRAR. Al terminar se cierra la sesión.
function openDeleteAccountModal() {
  let overlay = document.getElementById('narrator-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'narrator-confirm-overlay';
    overlay.className = 'narrator-confirm-overlay';
    document.body.appendChild(overlay);
  }
  const _pu = currentUser && currentUser.premium_until ? new Date(currentUser.premium_until).getTime() : 0;
  const premiumAviso = _pu > Date.now()
    ? '<li><b>Pierdes el Premium</b> que te quede (hasta el ' + new Date(_pu).toLocaleDateString('es-ES') + '), sin devolución.</li>' : '';
  overlay.innerHTML = `
    <div class="narrator-confirm-modal del-acc-modal">
      <div class="narrator-confirm-icon">⚠️</div>
      <h2 class="narrator-confirm-title">Borrar mi cuenta</h2>
      <p class="narrator-confirm-text">Se borra <b>para siempre</b> y no se puede recuperar:</p>
      <ul class="del-acc-list">
        <li>Tus rutas guardadas y sus guías públicas (también en Explorar)</li>
        <li>Notas, fotos, documentos del viajero y contactos SOS</li>
        <li>Lo que Salma sabe de ti y tu WhatsApp vinculado</li>
        ${premiumAviso}
      </ul>
      <label class="del-acc-label" for="del-acc-input">Escribe <b>BORRAR</b> para confirmar</label>
      <input class="del-acc-input" id="del-acc-input" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false">
      <div class="del-acc-status" id="del-acc-status"></div>
      <div class="narrator-confirm-btns">
        <button class="narrator-confirm-cancel" id="del-acc-cancel">Cancelar</button>
        <button class="narrator-confirm-go del-acc-go" id="del-acc-go" disabled>Borrar para siempre</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';
  const input = document.getElementById('del-acc-input');
  const go = document.getElementById('del-acc-go');
  const status = document.getElementById('del-acc-status');
  input.addEventListener('input', () => { go.disabled = input.value.trim().toUpperCase() !== 'BORRAR'; });
  document.getElementById('del-acc-cancel').addEventListener('click', () => { overlay.style.display = 'none'; });
  go.addEventListener('click', async () => {
    if (input.value.trim().toUpperCase() !== 'BORRAR') return;
    go.disabled = true; input.disabled = true;
    document.getElementById('del-acc-cancel').disabled = true;
    status.textContent = 'Borrando tu cuenta… no cierres la app.';
    try {
      const u = auth.currentUser;
      if (!u) throw new Error('Sin sesión');
      const t = await u.getIdToken(true);
      const res = await fetch(window.SALMA_API + '/account/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t },
        body: JSON.stringify({ confirm: 'BORRAR' })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) throw new Error(j.error || ('HTTP ' + res.status));
      // Datos locales de esta cuenta fuera del móvil
      try { ['bdm_live_active_route', 'bdm_live_active_route_id', 'bdm_reopen_guia', '_salmaHandoff', '_salmaRouteBackup'].forEach(k => localStorage.removeItem(k)); } catch (_) {}
      try { sessionStorage.clear(); } catch (_) {}
      overlay.style.display = 'none';
      showToast('Cuenta borrada. Gracias por viajar con Salma.');
      logout();
    } catch (e) {
      console.warn('Error borrando cuenta:', e);
      status.textContent = 'No se ha podido borrar: ' + e.message + '. Prueba otra vez o escríbenos desde Ayuda.';
      go.disabled = false; input.disabled = false;
      document.getElementById('del-acc-cancel').disabled = false;
    }
  });
  setTimeout(() => input.focus(), 50);
}

function logout() {
  auth.signOut();
  currentUser = null;
  if (typeof salma !== 'undefined') salma.reset();
  // La guía activa se quita SOLO de este navegador (26 sept 2026): antes se quedaba en
  // localStorage y, sin cuenta, la portada seguía enseñando "¿Cómo va el viaje?" con la
  // guía del que salió — y al tocarla se abría entera, saltándose el corte de §10.
  // En la cuenta (users/{uid}.active_route_id) sigue: al volver a entrar se recupera
  // con _pullActiveRouteFromAccount().
  try { localStorage.removeItem('bdm_live_active_route'); } catch (_) {}
  try { localStorage.removeItem('bdm_live_active_route_id'); } catch (_) {}
  _activeRouteData = null;
  _activeRouteDocId = null;
  if (window._itinViewOpen && typeof window._teardownItinView === 'function') window._teardownItinView();
  if (typeof salma !== 'undefined' && salma.newChat) salma.newChat();   // portada vacía, sin la guía
  // onAuthStateChanged se encarga de mostrar el gate
}

// Al entrar: si este navegador no tiene guía activa (se borró al salir, o es otro
// dispositivo), traerla de la cuenta para la tarjeta de la portada — sin tocar el mapa
// ni volver a escribir en Firestore. Solo lecturas de Firestore (2 como mucho).
async function _pullActiveRouteFromAccount() {
  try {
    if (!currentUser || typeof db === 'undefined') return;
    if (localStorage.getItem('bdm_live_active_route')) return;
    const uid = currentUser.uid;
    const userDoc = await db.collection('users').doc(uid).get();
    const activeId = userDoc.exists ? userDoc.data().active_route_id : null;
    if (!activeId) { console.log('[Salma] Guía activa: la cuenta no tiene ninguna apuntada'); return; }
    const mapDoc = await db.collection('users').doc(uid).collection('maps').doc(activeId).get();
    if (!mapDoc.exists) { console.log('[Salma] Guía activa: ' + activeId + ' ya no existe en la cuenta'); return; }
    if (!currentUser || currentUser.uid !== uid) return;
    const d = mapDoc.data();
    let routeData = null;
    try { routeData = d.itinerarioIA ? JSON.parse(d.itinerarioIA) : null; } catch (_) {}
    if (!routeData) { console.log('[Salma] Guía activa: ' + activeId + ' sin datos de ruta'); return; }
    if (localStorage.getItem('bdm_live_active_route')) return;
    localStorage.setItem('bdm_live_active_route', JSON.stringify(routeData));
    localStorage.setItem('bdm_live_active_route_id', activeId);
    console.log('[Salma] Guía activa recuperada de la cuenta: ' + (routeData.title || activeId));
    // Repintar la portada solo si está a la vista y vacía (no pisar una conversación).
    const area = document.getElementById('chat-area');
    if (currentState === 'chat' && area && !area.querySelector('.msg')) {
      area.innerHTML = '';
      _renderChatEmpty();
    }
  } catch (e) { console.warn('[Salma] Guía activa: no se pudo leer de la cuenta', e && e.message); }
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

// ?compartir=ID en la URL (link del botón Compartir de una guía) — a diferencia
// de una guía pública de SEO, esta SÍ exige login: como el gate ya obliga a
// cualquier visitante sin sesión a registrarse/entrar antes de ver nada de la
// app, solo hace falta guardar el ID aquí y recogerlo cuando onAuthStateChanged
// confirme sesión (recién logueado o ya la tenía).
window._pendingShareId = new URLSearchParams(window.location.search).get('compartir') || null;

// ?entrada=CÓDIGO (25 sept 2026) — enlace de auto-entrada que el Worker mete en un
// mensaje de WhatsApp cuando ya sabe quién eres (ver buildAutoLoginLink en
// salma-worker.js): el código ya lleva el uid resuelto, así que aquí solo hace falta
// canjearlo por un token y entrar — sin escribir número ni código a mano. Si falla
// (caducado, ya usado, sin red) no rompe nada: se limpia la URL y sigue el login
// normal (Google / WhatsApp) como si no hubiera parámetro.
(async function _tryWaAutoLogin() {
  const code = new URLSearchParams(window.location.search).get('entrada');
  if (!code) return;
  history.replaceState(null, '', '/');
  try {
    const res = await fetch(window.SALMA_API + '/wa-weblogin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (res.ok && data.custom_token) {
      // La URL se borró justo arriba (history.replaceState), así que un posible destino
      // (ej. "premium") no puede viajar como query param — viaja en la propia respuesta
      // del canje de código, ver buildAutoLoginLink()/wa-weblogin-verify en el Worker.
      if (data.go) window._waLoginGo = data.go;
      await auth.signInWithCustomToken(data.custom_token);
    }
  } catch (e) {
    console.warn('Auto-entrada por WhatsApp falló:', e);
  }
})();

async function _openSharedRoute(shareId) {
  try {
    const doc = await db.collection('shared_routes').doc(shareId).get();
    if (!doc.exists) { showToast('Este link ya no está disponible'); return; }
    const d = doc.data();
    const routeData = JSON.parse(d.itinerarioIA || '{}');
    if (!routeData.stops || !routeData.stops.length) { showToast('Esta ruta no tiene paradas'); return; }
    if (typeof window.openItinerarioView === 'function') {
      window.openItinerarioView(routeData, null, { fromChat: false, saved: false });
    }
  } catch (e) {
    console.warn('Error cargando ruta compartida:', e);
    showToast('No se pudo cargar la ruta compartida');
  }
}

// Respaldo de doGoogleLogin() por popup bloqueado (paso 3, ver _afterGoogleAuth arriba):
// al volver de signInWithRedirect(), esto recoge el resultado UNA vez. Si no hay ningún
// redirect pendiente (carga normal de la página), resuelve con result=null — inofensivo.
// El enrutado/currentUser los pone igual auth.onAuthStateChanged de abajo, que dispara
// con cualquier método de login; esto solo cubre lo que ese listener no hace (doc nuevo
// + huella).
auth.getRedirectResult().then((result) => {
  if (result && result.user) _afterGoogleAuth(result.user);
}).catch((e) => {
  if (!_isBenignPopupCancel(e)) console.warn('Google getRedirectResult error:', e);
});

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
      premium_until: userData.premium_until ? (userData.premium_until.toDate ? userData.premium_until.toDate().toISOString() : userData.premium_until) : null,
      country: userData.country || '',
      avatarURL: userData.avatarURL || '',
      copilot_data: userData.copilot_data || {},
      share_routes: userData.share_routes !== false, // "Compartir mis rutas" — activado por defecto
      phone: userData.phone || '', // solo lo tienen las cuentas creadas desde WhatsApp
      // WhatsApp de la cuenta: creada desde WhatsApp (phone) o vinculada después
      // (whatsapp_phone, lo anota el Worker al vincular — 26 sept 2026).
      waPhone: userData.phone || userData.whatsapp_phone || '',
    };
    _refreshSalmaWaChip();
    _authReadyResolve();

    currentUserSOSConfig = userData.sos_config || {
      contacts: [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
      custom_message: ''
    };

    startTrackingLastPosition();
    _checkSOSQueue();
    _restoreCopilotState();

    updateHeader();
    _showAvisoGracias(user.uid, userData.aviso_gracias);

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
    const pagoParam = new URLSearchParams(window.location.search).get('pago');
    const goParam = new URLSearchParams(window.location.search).get('go');
    // ?guia= (botón del corte de registro) y ?ruta= (enlace a una guía pública, ver 404.html)
    const guiaParam = _validSlug(new URLSearchParams(window.location.search).get('guia'))
      || _validSlug(new URLSearchParams(window.location.search).get('ruta'));
    let _reopenSlug = null;
    try { _reopenSlug = _validSlug(localStorage.getItem('bdm_reopen_guia')); } catch (_) {}
    if (window._pendingShareId) {
      const shareId = window._pendingShareId;
      window._pendingShareId = null;
      history.replaceState(null, '', '/');
      if (typeof salma !== 'undefined') salma._initChat();
      showState('chat');
      _openSharedRoute(shareId);
    } else if (typeof window._waLoginGo === 'string' && /^ruta:[A-Za-z0-9]{10,40}$/.test(window._waLoginGo)) {
      // Enlace de auto-entrada por WhatsApp tras "guárdala" (F5.3 paso 3) — abre directa la
      // guía recién guardada (vista de itinerario con mapa), mismo camino que Mis Viajes.
      const waMapId = window._waLoginGo.slice(5);
      window._waLoginGo = null;
      if (typeof salma !== 'undefined') salma._initChat();
      showState('chat');
      if (typeof salma !== 'undefined' && salma.cargarGuia) salma.cargarGuia(waMapId, null);
    } else if (window._waLoginGo === 'premium') {
      // Enlace de auto-entrada por WhatsApp con destino "premium" (ej. al tope de guías
      // gratis) — mismo camino que ya usa pago=cancel: Perfil + el modal de Premium abierto.
      window._waLoginGo = null;
      showState('profile');
      openCoinsModal();
    } else if (pagoParam === 'ok') {
      history.replaceState(null, '', '/');
      showState('profile');
      _verificarPagoPremium();
    } else if (pagoParam === 'cancel') {
      history.replaceState(null, '', '/');
      showState('profile');
      openCoinsModal();
    } else if (guiaParam || window._reopenRouteAfterLogin || _reopenSlug) {
      // Política §10: venía de un avance (día 1) → al entrar, la MISMA ruta, ya entera.
      // guiaParam = enlace desde la página pública; _reopenSlug sobrevive a recargas
      // (entrar con WhatsApp en el móvil sale de la pestaña y vuelve).
      const _r = window._reopenRouteAfterLogin;
      window._reopenRouteAfterLogin = null;
      try { localStorage.removeItem('bdm_reopen_guia'); } catch (_) {}
      if (guiaParam) history.replaceState(null, '', '/');
      if (typeof salma !== 'undefined') salma._initChat();
      showState('chat');
      if (_r && _r.stops && typeof window.openItinerarioView === 'function') {
        window.openItinerarioView(_r, null, { fromChat: false, saved: false });
      } else {
        _openPublicGuide(guiaParam || _reopenSlug);
      }
    } else if (goParam) {
      history.replaceState(null, '', '/');
      if (goParam === 'explorar') { window._rutasTab = 'explorar'; showState('rutas'); }
      else showState(goParam);
      // Botón central "Salma" de destinos/blog/404 (/?go=chat): portada siempre, igual que
      // en la app (26 sept 2026) — no la última conversación de la pestaña.
      if (goParam === 'chat' && typeof salma !== 'undefined' && salma.newChat) salma.newChat();
    } else if (window._afterLogin) {
      const dest = window._afterLogin;
      window._afterLogin = null;
      showState(dest);
    } else if (currentState !== 'sos') {
      // Usuario registrado → directo al chat (no interrumpir SOS)
      if (typeof salma !== 'undefined') salma._initChat();
      showState('chat');
    }
    _pullActiveRouteFromAccount();

    // Flight alerts — avisar en chat si hay bajadas de precio (async, no bloquea)
    if (typeof flightWatches !== 'undefined') {
      setTimeout(() => flightWatches.injectAlerts(), 2000);
    }
  } else {
    // No hay sesión → mostrar gate obligatorio
    currentUser = null;
    _refreshSalmaWaChip();
    _authReadyResolve();
    // Sin sesión no hay guía activa que enseñar: quitar la que se hubiera quedado en este
    // navegador (sesiones cerradas con versiones anteriores a app.js v=186, que no la
    // borraban al salir) y repintar la portada si ya la enseñaba. La de la cuenta sigue
    // en Firestore y vuelve al entrar (_pullActiveRouteFromAccount).
    try {
      if (localStorage.getItem('bdm_live_active_route')) {
        localStorage.removeItem('bdm_live_active_route');
        localStorage.removeItem('bdm_live_active_route_id');
        _activeRouteData = null;
        _activeRouteDocId = null;
        const _ca = document.getElementById('chat-area');
        if (_ca && _ca.querySelector('.chat-empty') && !_ca.querySelector('.msg')) { _ca.innerHTML = ''; _renderChatEmpty(); }
      }
    } catch (_) {}
    updateHeader();
    hideSplash();
    // Desde el menú de /destinos/: Explorar y Ayuda se pueden ver sin cuenta, sin
    // pasar por la portada (propuesta UX 26 sept 2026).
    const _goAnon = new URLSearchParams(window.location.search).get('go');
    // ?guia=<slug> (botón "Ver la ruta completa" de la página pública): sin cuenta se ve el
    // avance del día 1 dentro de la app, con el corte para registrarse (CLAUDE.md §10).
    const _guiaAnon = _validSlug(new URLSearchParams(window.location.search).get('guia'));
    // ?ruta=<slug> (enlace a una guía pública / compartida): sin cuenta, el avance del día 1
    // en la vista de ruta de la app, con su corte para registrarse — sin portada delante.
    const _rutaAnon = _validSlug(new URLSearchParams(window.location.search).get('ruta'));
    if (_rutaAnon && !_guiaAnon) {
      history.replaceState(null, '', '/');
      showState('chat');
      _openPublicGuide(_rutaAnon);
      return;
    }
    if (_guiaAnon) {
      // Viene de pulsar "Ver la ruta completa" en la página pública: ya pidió verla
      // entera → registro directo, con el avance detrás ("Volver sin entrar" lo enseña)
      // y, al entrar, la ruta completa (bdm_reopen_guia sobrevive a la vuelta de WhatsApp).
      history.replaceState(null, '', '/');
      try { localStorage.setItem('bdm_reopen_guia', _guiaAnon); } catch (_) {}
      showState('chat');
      _openPublicGuide(_guiaAnon);
      window._gateShownOnce = true;   // botón "Volver sin entrar" (hay ruta detrás)
      openModal();
      return;
    }
    if (_goAnon === 'explorar' || _goAnon === 'ayuda') {
      history.replaceState(null, '', '/');
      if (_goAnon === 'explorar') window._rutasTab = 'explorar';
      showState(_goAnon === 'explorar' ? 'rutas' : 'ayuda');
      return;
    }
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
  if (routeData && routeData._saved_from) return guardarRutaDeOtro(routeData);
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

    // Contador de rutas gratis / coins: ya NO lo escribe el cliente — cualquier usuario podía
    // ponérselo a 0 o inflar su saldo desde la consola. El conteo pasa al Worker (paso 3 del
    // plan de pagos: gates server-side). Hasta entonces no se contabiliza nada aquí.

    // Publicar guía pública (no esperar)
    const slug = generateSlug(r.title || r.name || 'mi-ruta');
    publishGuide(docRef.id, ruta, slug, r).catch(() => {});

    // PIEZA A — Enrich (Pasada 2) eliminado: era una 2ª llamada de IA por ruta.

    // Perfil IA (memoria) — en segundo plano, sin bloquear ni frenar el guardado.
    // Aviso de coste dado y confirmado con Paco (19 sept 2026): GPT-4o-mini,
    // ~$0,0006 por ruta guardada — ver renderPerfilIA()/_perfilIAExtract().
    _perfilIAExtract(ruta).catch(e => console.warn('[PerfilIA] error inesperado:', e.message));

    return docRef.id;
  } catch (e) {
    console.error('Error guardando guía:', e);
    showToast('Error al guardar: ' + (e.message || ''));
    return null;
  }
}

// Guardar una ruta de OTRO viajero (abierta desde Explorar): queda en Mis Viajes como
// "ruta guardada" (campo saved_from), no como propia — no se publica en Explorar a nombre
// de quien la guarda, no pide foto de portada a Google (usa la del original) y no alimenta
// el Perfil IA. Si ya la tenía guardada o es suya, avisa y no duplica.
async function guardarRutaDeOtro(routeData) {
  try {
    const src = routeData._saved_from;
    const r = Object.assign({}, routeData);
    delete r._saved_from;
    if (src.uid && src.uid === currentUser.uid) { showToast('Esta ruta ya es tuya'); return null; }
    const dup = await db.collection('users').doc(currentUser.uid).collection('maps')
      .where('saved_from.slug', '==', src.slug).limit(1).get();
    if (!dup.empty) { showToast('Ya tienes esta ruta guardada'); return dup.docs[0].id; }
    const numDias = r.duration_days ? Number(r.duration_days) : (r.stops ? [...new Set(r.stops.map(s => s.day || 1))].length : 0);
    const destino = (r.region || r.country || '').toString();
    const now = new Date().toISOString();
    const ruta = {
      nombre: r.title || r.name || 'Ruta',
      destino: destino,
      country: r.country || destino,
      num_dias: numDias,
      dias: numDias,
      notas: r.summary || '',
      cover_image: src.cover || '',
      itinerarioIA: JSON.stringify(r),
      enriched: false,
      createdAt: now,
      updatedAt: now,
      published: false,
      saved_from: { slug: src.slug, uid: src.uid || '', autor: src.autor || 'Viajero' },
    };
    if (src.thumb) ruta.map_thumbnail_url = src.thumb;
    const docRef = await db.collection('users').doc(currentUser.uid).collection('maps').add(ruta);
    showToast('Guardada en Mis Viajes → Rutas guardadas');
    try {
      localStorage.setItem('offline_route_' + docRef.id, JSON.stringify({ id: docRef.id, ...ruta, _savedAt: Date.now() }));
    } catch (_) {}
    return docRef.id;
  } catch (e) {
    console.error('Error guardando ruta de otro viajero:', e);
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
      owner_name: _firstName(currentUser?.name),
      listed: currentUser?.share_routes !== false, // sale en Explorar salvo que lo desactive en Perfil
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

// ═══ ENRIQUECIMIENTO (Pasada 2) — ELIMINADO en PIEZA A ═══
// Era una 2ª llamada de IA (GPT-4o-mini) por ruta para rellenar context/food/sleep/eat.
// Corte limpio: los datos de cada parada (rating, horario, foto) los da Google Places
// vía mapaItinerario._enrichAll, sin IA y sin llamada extra.
// El endpoint /enrich del worker queda inerte — se retira en la Pieza D.

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
  if (typeof salma !== 'undefined' && salma.isBusyNotify()) return;   // Salma responde: no vaciar lo escrito
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
      const _placeholders = {
        'welcome-input': '¿A dónde vamos?',
        'itin-query-input': 'Pregunta o pide un cambio...'
      };
      activeInputEl.placeholder = _placeholders[activeInputEl.id] || 'Escribe aquí...';
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
      } else if (inputEl.id === 'itin-query-input') {
        // Popup de consulta sobre una guía (mapa-itinerario.js) — su propio
        // envío, no el del chat general.
        if (typeof window._sendItinQuery === 'function') window._sendItinQuery();
      } else if (isWelcome) {
        const msg = inputEl.value.trim();
        if (msg && typeof salma !== 'undefined' && salma.isBusyNotify()) return;   // Salma responde: no vaciar lo dictado
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
_setupWhatsAppStartButton();

// Logo eliminado — navegación solo por bottom bar

// ═══ MODAL PREMIUM (Stripe Checkout hospedado — pago único por periodo) ═══
// La interfaz vive en premium-modal.js (PremiumModal.open). Aquí solo la lógica: estado del usuario,
// lectura de /usage (precios y topes REALES del Worker) y creación de la sesión de pago.
// Los precios que se cobran están en PREMIUM_PLANS del Worker — no hay precios escritos aquí.

function openCoinsModal() {
  if (!window.PremiumModal) { showToast('No se pudo abrir el plan. Recarga la página.'); return; }

  const premiumUntilMs = currentUser && currentUser.premium_until ? new Date(currentUser.premium_until).getTime() : 0;

  const handle = window.PremiumModal.open({
    premiumUntilMs,
    // Uso del usuario + topes de cada plan + precios: los cuenta y decide el Worker
    loadUsage: async () => {
      const u = firebase.auth().currentUser;
      if (!u) return null;
      const t = await u.getIdToken();
      const r = await fetch(window.SALMA_API + '/usage', { headers: { 'Authorization': 'Bearer ' + t } });
      return r.ok ? await r.json() : null;
    },
    // Pagar → crear Checkout Session en el Worker y redirigir a Stripe (misma lógica de siempre)
    onPay: async (planKey) => {
      const authUser = auth.currentUser;
      if (!authUser) throw new Error('Tu sesión ha caducado, vuelve a entrar');
      const idToken = await authUser.getIdToken();

      const res = await fetch(window.SALMA_API + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
        body: JSON.stringify({ plan: planKey })
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'No se pudo iniciar el pago');

      // Fecha de Premium ANTES de pagar, para _verificarPagoPremium (vale para cualquier pago, no solo tras un límite)
      try { sessionStorage.setItem('bdm_pay_pu', JSON.stringify({ pu: currentUser.premium_until || null })); } catch (_) {}
      window.location.href = data.url; // Redirige a Stripe Checkout (pantalla hospedada)
    },
    onClose: () => { if (window.popModal) window.popModal('coins'); },
  });

  if (handle && window.pushModal) window.pushModal('coins', handle.close);
}

window.openCoinsModal = openCoinsModal;

// ═══ "SALMA TAMBIÉN EN TU WHATSAPP" (propuesta UX 26 sept 2026, rehecho el mismo día) ═══
// Sin sesión → portada (ahí está "Entrar con WhatsApp"). Con WhatsApp en la cuenta (creada
// desde WhatsApp → `phone`; vinculada después → `whatsapp_phone`, lo anota el Worker) → el
// botón dice "Sigue con Salma en WhatsApp" y abre la conversación directa. Sin él → ventana
// con UN solo botón, "Vincular mi WhatsApp" (antes había también "Ya lo tengo vinculado",
// que abría WhatsApp sin comprobar nada — Paco: "no debería"). Si la ficha aún no lo tiene
// anotado (vinculado antes de existir el campo, o con la app abierta), se pregunta una vez
// al Worker (/whatsapp-status), que además lo deja anotado.
function _salmaWaChipLabel() {
  return (currentUser && currentUser.waPhone) ? 'Sigue con Salma en WhatsApp' : 'Salma también en tu WhatsApp';
}
function _refreshSalmaWaChip() {
  document.querySelectorAll('.ce-wa-chip .ce-wa-label').forEach(el => { el.textContent = _salmaWaChipLabel(); });
}
async function _salmaWaDigits() {
  if (_waDigits) return _waDigits;
  try {
    const data = await (await fetch(window.SALMA_API + '/version')).json();
    _waDigits = (data.whatsapp_number || '').replace(/[^\d]/g, '');
  } catch (_) {}
  return _waDigits;
}
async function _salmaWaCheckLinked() {
  try {
    const authUser = auth.currentUser;
    if (!authUser) return false;
    const idToken = await authUser.getIdToken();
    const r = await fetch(window.SALMA_API + '/whatsapp-status', { method: 'POST', headers: { 'Authorization': 'Bearer ' + idToken } });
    const data = await r.json();
    if (data && data.linked && data.phone && currentUser) {
      currentUser.waPhone = data.phone;
      _refreshSalmaWaChip();
      return true;
    }
  } catch (_) {}
  return false;
}
async function _openSalmaWhatsApp() {
  // Recién abierta la web puede que aún no se sepa si hay sesión: esperar (máx. 6 s).
  if (!currentUser) await Promise.race([_authReady, new Promise((r) => setTimeout(r, 6000))]);
  if (!currentUser) { openModal(); return; }
  if (!currentUser.waPhone) await _salmaWaCheckLinked();
  if (!currentUser.waPhone) { _showSalmaWaLinkPrompt(); return; }
  const digits = await _salmaWaDigits();
  if (!digits) { if (typeof showToast === 'function') showToast('No se pudo abrir WhatsApp, prueba otra vez'); return; }
  const waUrl = 'https://wa.me/' + digits + '?text=' + encodeURIComponent('Hola Salma');
  // Tras un await el navegador del móvil puede bloquear la pestaña nueva → misma pestaña.
  const w = window.open(waUrl, '_blank');
  if (!w) window.location.href = waUrl;
}
function _showSalmaWaLinkPrompt() {
  let overlay = document.getElementById('narrator-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'narrator-confirm-overlay';
    overlay.className = 'narrator-confirm-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="narrator-confirm-modal">
      <div class="narrator-confirm-icon">💬</div>
      <h2 class="narrator-confirm-title">Salma en tu WhatsApp</h2>
      <p class="narrator-confirm-text">Escríbele como a una amiga: rutas, vuelos, hoteles, sitios cerca, notas de voz y fotos. Vincúlalo una vez y tus rutas y notas de WhatsApp aparecen también aquí.</p>
      <div class="narrator-confirm-btns">
        <button class="narrator-confirm-go" id="salma-wa-link">Vincular mi WhatsApp</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.style.display = 'none'; };
  document.getElementById('salma-wa-link').addEventListener('click', () => {
    overlay.style.display = 'none';
    openWhatsAppLinkModal();
  });
}

// ═══ VINCULAR WHATSAPP (F5.4, 24 sept 2026) ═══
// Genera un código de 6 caracteres (10 min) y lo enseña con instrucciones — el usuario
// se lo manda al número de Salma en WhatsApp y ese número queda vinculado a su cuenta.
// Sin esto, Salma no responde nada por WhatsApp salvo cómo vincularse (ver worker).
async function openWhatsAppLinkModal() {
  let overlay = document.getElementById('narrator-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'narrator-confirm-overlay';
    overlay.className = 'narrator-confirm-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="narrator-confirm-modal">
      <div class="narrator-confirm-icon">💬</div>
      <h2 class="narrator-confirm-title">Vincular WhatsApp</h2>
      <p class="narrator-confirm-text">Generando tu código...</p>
      <div class="narrator-confirm-btns">
        <button class="narrator-confirm-cancel" id="wa-link-close">Cerrar</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';
  document.getElementById('wa-link-close').addEventListener('click', () => { overlay.style.display = 'none'; });

  try {
    const authUser = auth.currentUser;
    if (!authUser) throw new Error('Tu sesión ha caducado, vuelve a entrar');
    const idToken = await authUser.getIdToken();
    const res = await fetch(window.SALMA_API + '/whatsapp-link-code', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + idToken },
    });
    const data = await res.json();
    if (!data.code) throw new Error(data.error || 'No se pudo generar el código');

    const textEl = overlay.querySelector('.narrator-confirm-text');
    if (textEl) {
      const digits = (data.whatsapp_number || '').replace(/[^\d]/g, '');
      const waLink = digits
        ? `https://wa.me/${digits}?text=${encodeURIComponent(data.code)}`
        : null;
      textEl.innerHTML = `
        <span style="font-size:28px;font-weight:700;letter-spacing:4px;color:var(--dorado)">${escapeHTML(data.code)}</span><br><br>
        ${waLink
          ? `<a href="${waLink}" target="_blank" rel="noopener" style="display:inline-block;background:var(--dorado);color:#000;font-weight:700;padding:10px 18px;border-radius:999px;text-decoration:none;margin-bottom:10px">Abrir WhatsApp y enviar código</a><br>`
          : ''}
        Caduca en 10 minutos. Una vez vinculado, hablas con Salma por WhatsApp igual que en la app.
        ${data.whatsapp_number ? `<br><br><span style="opacity:.7;font-size:13px">Número de Salma: ${escapeHTML(data.whatsapp_number)} — guárdalo en tus contactos si quieres</span>` : ''}`;
    }
  } catch (e) {
    const textEl = overlay.querySelector('.narrator-confirm-text');
    if (textEl) textEl.textContent = 'No se pudo generar el código: ' + e.message;
  }
}
window.openWhatsAppLinkModal = openWhatsAppLinkModal;

// ═══ RETORNO DE PAGO STRIPE (?pago=ok / ?pago=cancel) ═══

async function _verificarPagoPremium() {
  if (!currentUser) return;
  showToast('Verificando tu pago…');
  // Caso p-mui1yhp9ls1 (26 sept 2026): si el pago viene de chocar con un límite, comparar con la fecha
  // guardada ANTES de ir a Stripe. La cargada al volver ya suele traer la nueva (el webhook llega antes
  // que la página) → nunca veía el cambio, no retomaba la guía y decía "se activa en unos minutos".
  // bdm_pay_pu: guardada en onPay justo antes de ir a Stripe (cualquier pago). bdm_pending_retry.pu: por si
  // la pestaña trae el retry de antes de esa versión.
  let _puAntes;
  try {
    const _pay = JSON.parse(sessionStorage.getItem('bdm_pay_pu') || 'null');
    sessionStorage.removeItem('bdm_pay_pu');
    if (_pay && 'pu' in _pay) _puAntes = _pay.pu;
    const _pend = JSON.parse(sessionStorage.getItem('bdm_pending_retry') || 'null');
    if (_puAntes === undefined && _pend && 'pu' in _pend) _puAntes = _pend.pu;
  } catch (_) {}
  if (_puAntes === undefined) _puAntes = currentUser.premium_until;
  const baselineMs = _puAntes ? new Date(_puAntes).getTime() : 0;
  const nowMs = Date.now();

  for (let i = 0; i < 8; i++) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const snap = await db.collection('users').doc(currentUser.uid).get();
      const data = snap.exists ? snap.data() : {};
      const pu = data.premium_until;
      const puMs = pu ? (pu.toDate ? pu.toDate().getTime() : new Date(pu).getTime()) : 0;
      if (puMs > baselineMs && puMs > nowMs) {
        currentUser.premium_until = pu.toDate ? pu.toDate().toISOString() : pu;
        currentUser.isPremium = true;
        // 24 sept 2026: si el pago vino de "recargar" tras chocar con un límite (guía, cambio
        // o mensaje), retoma sola lo que se estaba pidiendo — sin esto, comprar Premium no
        // perdía la guía en Firestore, pero sí obligaba a volver a escribirla desde cero.
        const _resumed = (typeof salma !== 'undefined' && typeof salma._resumePendingRetry === 'function')
          ? salma._resumePendingRetry() : false;
        if (!_resumed && (currentState === 'profile' || currentState === 'viajes')) renderProfile();
        showToast(_resumed ? '¡Premium activado! Sigo con lo que tenías a medias.' : '¡Premium activado! Ya tienes acceso completo.');
        return;
      }
    } catch (e) {
      console.warn('[Premium] Error comprobando pago:', e);
    }
  }
  showToast('Pago recibido — tu Premium se activa en unos minutos. Si no aparece, escríbeme.');
}

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
  culture:  { types: ['museum', 'tourist_attraction', 'art_gallery'],                 color: '#F4630B', label: 'A' },
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

function liveMapAbrirHistoria() {
  const btn = document.getElementById('live-map-historia-btn');
  if (btn) { btn.textContent = '⏳'; btn.disabled = true; }
  const restore = () => { if (btn) { btn.textContent = '📚'; btn.disabled = false; } };

  const _lastPos = JSON.parse(localStorage.getItem('salma_last_pos') || 'null');
  const lat = _lastPos?.lat, lng = _lastPos?.lng;

  if (!lat || !lng) {
    restore();
    showToast('Sin ubicación GPS — activa el mapa primero');
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es&zoom=10`, {
    headers: { 'User-Agent': 'borradodelmapa.com' }
  })
    .then(r => r.json())
    .then(d => {
      const place = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.address?.state || d.name;
      restore();
      if (!place) { showToast('No se pudo detectar el lugar'); return; }
      closeLiveMap();
      if (typeof historiaModule !== 'undefined') {
        historiaModule.loadPlace(place);
        showState('historia');
      }
    })
    .catch(() => {
      restore();
      showToast('Error al detectar ubicación');
    });
}

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
      if (d.estado === 'borrador') return; // ruta guiada a medias — no seleccionable en el mapa
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
// Distancia real de carretera para el chip "parada más cercana" — cacheada, se
// refresca solo al cambiar de parada más cercana o cada 5 min (nunca en cada GPS tick,
// dispararía llamadas a Directions API sin necesidad — decisión con Paco, 15 sept).
let _nearestChipRealDist = null; // { stopIndex, text, fetchedAt }
let _nearestChipFetching = false;
let _activeRouteData = null;

// Persiste la ruta activa (localStorage + Firestore) SIN tocar el mapa.
// Se llama al ver una guía guardada → la última visitada pasa a ser la activa.
function setActiveRoute(routeData, docId) {
  try { localStorage.setItem('bdm_live_active_route', JSON.stringify(routeData)); } catch (_) {}
  try { if (docId) localStorage.setItem('bdm_live_active_route_id', docId); else localStorage.removeItem('bdm_live_active_route_id'); } catch (_) {}
  if (typeof currentUser !== 'undefined' && currentUser && typeof db !== 'undefined') {
    db.collection('users').doc(currentUser.uid)
      .set({ active_route_id: docId || null }, { merge: true })
      .catch(() => {});
    if (docId && routeData && !routeData.map_thumbnail_url) _ensureRouteThumbnail(routeData, docId);
  }
}
window.setActiveRoute = setActiveRoute;

// Miniatura de la ruta (mapa + paradas) para la tarjeta de "ruta activa" — se pide
// UNA sola vez por ruta (18 sept). El Worker la genera con Google Static Maps (de
// pago) solo la primera vez y la deja fija en R2 bajo la clave del propio mapId; a
// partir de ahí este mismo POST solo devuelve esa URL ya guardada, sin volver a
// llamar a Google — por eso aquí no hace falta ninguna caché propia ni comprobar
// nada antes de llamar, el Worker ya resuelve "¿ya existe?" el mismo.
// Logs con el mismo prefijo "[Salma]" que ya usa el resto de la app — así se ven en
// el panel 🐛 si algo no llega a pedirse o el Worker no responde lo esperado.
const _thumbInFlight = new Set();
async function _ensureRouteThumbnail(routeData, docId) {
  if (!docId || _thumbInFlight.has(docId)) return;
  if (!currentUser || !window.SALMA_API) {
    console.log('[Salma] Miniatura ruta: sin sesión o sin API, no se pide');
    return;
  }
  const stops = (routeData.stops || [])
    .filter(s => s && isFinite(+s.lat) && isFinite(+s.lng) && Math.abs(+s.lat) > 0.01)
    .map(s => ({ lat: +s.lat, lng: +s.lng }));
  if (stops.length < 2) {
    console.log('[Salma] Miniatura ruta: sin coordenadas suficientes, no se pide');
    return;
  }
  _thumbInFlight.add(docId);
  console.log('[Salma] Miniatura ruta: pidiendo para', docId);
  try {
    // currentUser (arriba) es un objeto propio armado desde Firestore, no el
    // usuario real de Firebase Auth — no tiene getIdToken(). El de verdad es
    // auth.currentUser (mismo patrón que ya usa el pago con Stripe, app.js:3415).
    const authUser = auth.currentUser;
    if (!authUser) {
      console.warn('[Salma] Miniatura ruta: sin auth.currentUser, no se pide');
      return;
    }
    const token = await authUser.getIdToken();
    const res = await fetch(`${window.SALMA_API}/route-thumbnail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ mapId: docId, stops, road_geometry: routeData.road_geometry || null })
    });
    if (!res.ok) {
      let errBody = null;
      try { errBody = await res.json(); } catch (_) {}
      console.warn('[Salma] Miniatura ruta: el Worker respondió', res.status, errBody);
      return;
    }
    const data = await res.json();
    if (!data.url) {
      console.warn('[Salma] Miniatura ruta: respuesta sin url', data);
      return;
    }
    console.log('[Salma] Miniatura ruta: lista', data.url);
    routeData.map_thumbnail_url = data.url;
    db.collection('users').doc(currentUser.uid).collection('maps').doc(docId)
      .set({ map_thumbnail_url: data.url }, { merge: true }).catch(() => {});
    // Solo si esta ruta sigue siendo la activa ahora mismo (pudo cambiar mientras
    // esperábamos la respuesta) — si no, la próxima vez que se abra ya la lee del campo.
    if (localStorage.getItem('bdm_live_active_route_id') === docId) {
      try { localStorage.setItem('bdm_live_active_route', JSON.stringify(routeData)); } catch (_) {}
      if (currentState === 'chat' && document.querySelector('.chat-empty')) _renderChatEmpty();
    }
  } catch (e) {
    console.warn('[Salma] Miniatura ruta: fallo de red', e);
  } finally {
    _thumbInFlight.delete(docId);
  }
}

function selectRouteOnMap(routeData, docId) {
  if (!_liveMap || !window.google) return;
  clearRouteFromLiveMap();
  _activeRouteData = routeData;
  _activeRouteDocId = docId || null;
  setActiveRoute(routeData, docId);

  const dayColors = ['#F4630B','#E87040','#5CB85C','#5BC0DE','#D9534F','#AA66CC','#FF8C00'];
  // Coord usable: número finito, dentro de rango, no (0,0) — igual criterio que mapaRuta._validStops.
  // "s.lat && s.lng" dejaba pasar basura (NaN de string, fuera de rango) que reventaba
  // los Marker de Google Maps con "Lat/Long not supported" y cortaba el resto del pintado.
  const valid = (routeData.stops || []).filter(s => {
    if (!s) return false;
    const la = +s.lat, ln = +s.lng;
    return isFinite(la) && isFinite(ln) && Math.abs(la) > 0.01 && Math.abs(ln) > 0.01
      && la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
  });
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
    strokeColor: '#F4630B',
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
  // Bajo 1km mostramos metros en línea recta directamente (Directions no aporta nada
  // fiable a esa escala peatonal). A partir de 1km, usamos la distancia real de
  // carretera si ya la tenemos cacheada para ESTA parada; si no, "km recta" de momento
  // — se corrige sola en cuanto llega la respuesta de _fetchRealNearestDistance.
  let dist;
  if (minDist < 1) {
    dist = Math.round(minDist * 1000) + ' m';
  } else if (_nearestChipRealDist && _nearestChipRealDist.stopIndex === nearest.i) {
    dist = _nearestChipRealDist.text;
  } else {
    dist = minDist.toFixed(1) + ' km recta';
  }
  const label = nearest.stop.headline || nearest.stop.name || `Parada ${nearest.i + 1}`;
  chip.textContent = `📍 #${nearest.i + 1} ${label} · ${dist}`;
  chip.style.display = 'block';
  chip.style.pointerEvents = 'auto';
  chip.style.cursor = 'pointer';
  chip.onclick = () => {
    const dayColors = ['#F4630B','#E87040','#5CB85C','#5BC0DE','#D9534F','#AA66CC','#FF8C00'];
    const color = dayColors[((nearest.stop.day || 1) - 1) % dayColors.length];
    _liveMap.panTo({ lat: nearest.stop.lat, lng: nearest.stop.lng });
    _liveMap.setZoom(14);
    _showStopInfo(nearest.stop, nearest.i, _liveRouteMarkers[nearest.i], color);
  };

  // Distancia real de carretera (Directions API) — solo al cambiar de parada más
  // cercana o cada 5 min, NUNCA en cada tick de GPS (~5s): dispararía coste y rate
  // limit de Google sin necesidad. Confirmado con Paco, 15 sept.
  if (minDist >= 1 && !_nearestChipFetching) {
    const stale = !_nearestChipRealDist || _nearestChipRealDist.stopIndex !== nearest.i ||
      (Date.now() - _nearestChipRealDist.fetchedAt) >= 5 * 60 * 1000;
    if (stale) _fetchRealNearestDistance(pos, nearest);
  }
}

async function _fetchRealNearestDistance(pos, nearest) {
  _nearestChipFetching = true;
  try {
    const origin = pos.lat() + ',' + pos.lng();
    const destination = nearest.stop.lat + ',' + nearest.stop.lng;
    const res = await fetch(`${window.SALMA_API}/directions?origin=${origin}&destination=${destination}`);
    if (!res.ok) return;
    const data = await res.json();
    const distText = data.legs && data.legs[0] && data.legs[0].distance;
    if (!distText) return;
    _nearestChipRealDist = { stopIndex: nearest.i, text: distText, fetchedAt: Date.now() };
    _updateNearestChip(); // repinta ya con la distancia real en vez de "recta"
  } catch (_) {
    // sin conexión o fallo puntual — se queda con "recta" hasta el próximo intento
  } finally {
    _nearestChipFetching = false;
  }
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
        icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#F4630B', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 1.8, anchor: new google.maps.Point(12, 22) },
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
            style="flex:1;text-align:center;background:#F4630B;color:#0a0a0f;border-radius:8px;padding:8px 6px;font-size:11px;font-weight:700;text-decoration:none;min-width:60px">
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
      icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#F4630B', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 1.8, anchor: new google.maps.Point(12, 22) },
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
  ctx.fillStyle='#F4630B';ctx.fillText('DEL',logoX,logoY);
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
    icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#F4630B', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5, scale: 1.8, anchor: new google.maps.Point(12, 22) },
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
        fillColor: '#F4630B', fillOpacity: 1,
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
    const SALMA_API = window.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev';
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
  const pinColors = { hotel: '#5BC0DE', monument: '#F4630B', restaurant: '#E87040', beach: '#5CB85C', park: '#5CB85C', other: '#AA66CC' };
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

// "Gracias + 1 guía gratis" (26 sept 2026): el Worker lo deja en users.aviso_gracias cuando Paco da las
// gracias desde el panel y no se pudo avisar por WhatsApp ni por email. Se enseña una vez y se marca visto.
function _showAvisoGracias(uid, aviso) {
  if (!aviso || aviso.visto || !aviso.texto) return;
  const box = document.createElement('div');
  box.setAttribute('role', 'dialog');
  box.style.cssText = 'position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px';
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;color:#111;max-width:420px;width:100%;padding:22px;border-top:6px solid #F4630B;font-size:16px;line-height:1.45';
  const h = document.createElement('div');
  h.style.cssText = "font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:26px;margin-bottom:8px";
  h.textContent = '🎁 ¡Gracias!';
  const p = document.createElement('p');
  p.style.cssText = 'white-space:pre-line;margin:0 0 16px';
  p.textContent = aviso.texto;
  const ok = document.createElement('button');
  ok.style.cssText = 'background:#F4630B;color:#fff;border:0;padding:12px 18px;font-weight:700;font-size:16px;width:100%;cursor:pointer';
  ok.textContent = '¡Genial!';
  ok.onclick = () => box.remove();
  card.append(h, p, ok); box.appendChild(card); document.body.appendChild(box);
  db.collection('users').doc(uid).update({ 'aviso_gracias.visto': true }).catch(e => console.warn('aviso_gracias:', e));
}

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

function showNarratorConfirm() {
  let overlay = document.getElementById('narrator-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'narrator-confirm-overlay';
    overlay.className = 'narrator-confirm-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="narrator-confirm-modal">
      <div class="narrator-confirm-icon">📍</div>
      <h2 class="narrator-confirm-title">Narrador</h2>
      <p class="narrator-confirm-text">Te cuenta curiosidades de lo que tienes cerca mientras te mueves — con notificaciones y, si quieres, en voz. Necesita acceso a tu ubicación. Se apaga solo si llevas 5 minutos parado, para no gastar batería.</p>
      <div class="narrator-confirm-btns">
        <button class="narrator-confirm-cancel" id="narrator-confirm-cancel">Cancelar</button>
        <button class="narrator-confirm-go" id="narrator-confirm-go">Activar</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';

  document.getElementById('narrator-confirm-cancel').addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  document.getElementById('narrator-confirm-go').addEventListener('click', () => {
    overlay.style.display = 'none';
    salma.startNarrator().then(ok => {
      if (ok === false) salma.showNarratorToast('Permite notificaciones y ubicación para usar el narrador.');
      else if (ok === true) {
        salma.showNarratorToast('Narrador activado. Te avisaré cerca de lugares con historia.', null, 4000);
        if (!localStorage.getItem('bdm_narrator_camera_tip_seen')) {
          localStorage.setItem('bdm_narrator_camera_tip_seen', '1');
          setTimeout(() => {
            salma.showNarratorToast('Consejo: toca el 📷 del chip Narrador para identificar lo que ves al momento por foto.', null, 6000);
          }, 4500);
        }
      }
      updateBottomBar();
      updateNarratorChipUI();
    });
  });
}

function showNarratorActiveMenu() {
  let overlay = document.getElementById('narrator-confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'narrator-confirm-overlay';
    overlay.className = 'narrator-confirm-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="narrator-confirm-modal">
      <div class="narrator-confirm-icon">📍</div>
      <h2 class="narrator-confirm-title">Narrador activo</h2>
      <p class="narrator-confirm-text">Ya no te avisa de sitios que ha visto antes en esta sesión. Si quieres que te vuelva a hablar de ellos (por ejemplo si has vuelto a pasar por el mismo sitio), puedes olvidarlos.</p>
      <div class="narrator-confirm-btns">
        <button class="narrator-confirm-cancel" id="narrator-active-cancel">Cerrar</button>
        <button class="narrator-confirm-go" id="narrator-active-reset">Olvidar avisos</button>
      </div>
      <button class="narrator-active-camera" id="narrator-active-camera">📷 Identifica lo que ves al momento por foto</button>
      <button class="narrator-active-stop" id="narrator-active-stop">Desactivar Narrador</button>
    </div>`;
  overlay.style.display = 'flex';

  document.getElementById('narrator-active-cancel').addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  document.getElementById('narrator-active-reset').addEventListener('click', () => {
    overlay.style.display = 'none';
    salma.resetNarratorNotified();
    salma.showNarratorToast('Avisos olvidados — te avisaré otra vez de los sitios de cerca.', null, 4000);
  });
  document.getElementById('narrator-active-camera').addEventListener('click', () => {
    overlay.style.display = 'none';
    narratorTakePhoto();
  });
  document.getElementById('narrator-active-stop').addEventListener('click', () => {
    overlay.style.display = 'none';
    salma.stopNarrator();
    salma.showNarratorToast('Narrador desactivado.', null, 3000);
    updateBottomBar();
    updateNarratorChipUI();
  });
}

// ═══ CÁMARA DEL NARRADOR — identificar lugar por foto sin salir del módulo ═══
// 16 sept 2026: reutiliza /pin (Claude Sonnet con visión, restaurado el mismo día —
// existía hace meses y se había perdido del Worker). Útil porque identificar por foto
// ya dio el dato correcto en ocasiones donde el Narrador por GPS aún tenía bugs (ver
// CLAUDE.md, 15 sept) — con los bugs de GPS ya arreglados, esto es un atajo más, no un
// respaldo de emergencia.
let _narratorCameraInput = null;
function narratorTakePhoto() {
  if (!_narratorCameraInput) {
    _narratorCameraInput = document.createElement('input');
    _narratorCameraInput.type = 'file';
    _narratorCameraInput.accept = 'image/*';
    _narratorCameraInput.capture = 'environment';
    _narratorCameraInput.style.display = 'none';
    _narratorCameraInput.addEventListener('change', () => {
      const file = _narratorCameraInput.files[0];
      _narratorCameraInput.value = '';
      if (file) _processNarratorPhoto(file);
    });
    document.body.appendChild(_narratorCameraInput);
  }
  _narratorCameraInput.click();
}

async function _processNarratorPhoto(file) {
  salma.showNarratorToast('🔍 Identificando el lugar...');
  try {
    const blob = await salma._compressImage(file, 1024, 0.8);
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const loc = salma._userLocation || {};
    const res = await fetch(window.SALMA_API + '/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: base64, lat: loc.lat, lng: loc.lng }),
    });
    const data = await res.json();
    if (data.name) {
      salma.showNarratorToast(data.description || 'Lugar identificado.', { name: data.name });
    } else {
      salma.showNarratorToast('No he podido identificar el lugar en la foto.', null, 3500);
    }
  } catch (e) {
    console.warn('[Narrador] Error identificando foto:', e);
    salma.showNarratorToast('Error al identificar la foto — inténtalo otra vez.', null, 3500);
  }
}
window.narratorTakePhoto = narratorTakePhoto;

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

// Reparte hasta `max` elementos de `arr` a intervalos regulares (para waypoints de
// Google Maps). Compartida por guide-renderer.js y mapa-itinerario.js (deuda técnica,
// 22 sept 2026) — eran dos copias idénticas del mismo algoritmo.
function sampleWaypoints(arr, max) {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  const result = [];
  for (let i = 0; i < max; i++) result.push(arr[Math.floor(i * step)]);
  return result;
}

// BLOQUE E (frontend) — true si la URL de Maps NO lleva coords imposibles. Sin red.
// Gemelo de _mapsUrlCoordsSane() en guide-renderer.js.
function mapsUrlCoordsSane(url) {
  if (!url || typeof url !== 'string') return true;
  if (!/google\.[a-z.]+\/maps|maps\.google\./i.test(url)) return true;
  var pats = [
    /[?&](?:q|query|destination|center|ll|sll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i,
    /\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /\/dir\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/
  ];
  for (var i = 0; i < pats.length; i++) {
    var m = url.match(pats[i]);
    if (m) {
      var lat = parseFloat(m[1]), lng = parseFloat(m[2]);
      if (!isFinite(lat) || !isFinite(lng)) return false;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
      if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
      return true;
    }
  }
  return true;
}

// Sanitizar URLs inventadas por Claude — solo permite dominios de herramientas reales
function sanitizeUrls(text) {
  if (!text) return text;
  var allowed = [
    'google.com/maps', 'googleusercontent.com', 'places.googleapis.com',
    'salma-api.borradodelmapa-api.workers.dev',
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
    if (!mapsUrlCoordsSane(url)) return '';   // BLOQUE E — enlace de Maps con coords imposibles
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
    if (!mapsUrlCoordsSane(url)) return text;  // BLOQUE E — enlace de Maps con coords imposibles → solo texto
    const idx = links.length;
    links.push('<a href="' + url + '" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href);return false;">' + text + '</a>');
    return '%%LINK' + idx + '%%';
  });
  // Sanitizar el resto del texto (URLs en texto plano — filtra inventadas)
  raw = sanitizeUrls(raw);

  let html = escapeHTML(raw);
  // URLs sueltas → enlaces clicables (onclick fuerza apertura externa en PWA)
  html = html.replace(/([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s<]+)/g, function(_, url) {
    // Si la URL termina en ')' sin '(' balanceado dentro, ese ')' pertenece al texto (ej. "(URL)") — quitarlo
    var trailing = '';
    while (url.length > 0 && url.charAt(url.length - 1) === ')') {
      var opens = (url.match(/\(/g) || []).length;
      var closes = (url.match(/\)/g) || []).length;
      if (closes > opens) { trailing = ')' + trailing; url = url.slice(0, -1); } else break;
    }
    var label = url;
    var isRouteMaps = false;
    if (url.indexOf('origin=') !== -1 && (url.indexOf('google.com/maps/dir/?') !== -1 || url.indexOf('google.com/maps/dir?') !== -1)) { label = '🗺️ Ruta completa en Google Maps'; isRouteMaps = true; }
    else if (url.indexOf('google.com/maps/dir/?') !== -1 || url.indexOf('google.com/maps/dir?') !== -1) label = '🗺️ Cómo llegar';
    else if (url.indexOf('google.com/maps/dir/') !== -1) { label = '🗺️ Ruta completa en Google Maps'; isRouteMaps = true; }
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
    else if (url.indexOf('rapido.bike') !== -1) label = '🏍️ Descargar Rapido';
    else if (url.indexOf('olacabs.com') !== -1) label = '🟡 Descargar Ola';
    else if (url.indexOf('airbnb.com') !== -1) label = '🏠 Ver en Airbnb';
    else if (url.indexOf('hostelworld.com') !== -1) label = '🛏️ Ver en Hostelworld';
    var clickHandler = isRouteMaps ? 'openMapsModal(this.href);return false;' : 'window.open(this.href);return false;';
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" onclick="' + clickHandler + '">' + label + '</a>' + trailing;
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
      // Obtener ubicación del usuario para saddr (directions desde su GPS)
      const _userLoc = (typeof salma !== 'undefined' && salma._userLocation)
        ? salma._userLocation.lat + ',' + salma._userLocation.lng
        : '';

      if (/\/maps\/dir\/\?api=1/i.test(url)) {
        // URL tipo "cómo llegar" a un solo destino con place_id
        const u = new URL(url);
        const dest = u.searchParams.get('destination');
        if (dest) {
          // saddr=GPS del usuario → directions reales; si no hay GPS, saddr vacío
          embedUrl = 'https://maps.google.com/maps?saddr=' + encodeURIComponent(_userLoc) +
            '&daddr=' + encodeURIComponent(dest) + '&output=embed';
        }
      } else if (/\/maps\/dir\/[^?]/i.test(url)) {
        // URL multi-parada /dir/X/Y/Z → embed directions con waypoints "to:"
        const parts = url.split('/dir/')[1].split('/').filter(Boolean);
        if (parts.length >= 2) {
          const places = parts.map(p => decodeURIComponent(p.replace(/\+/g, ' ')));
          // Si hay GPS, usarlo como origen; si no, primera parada como origen
          const saddr = _userLoc ? _userLoc : places[0];
          const daddrPlaces = _userLoc ? places : places.slice(1);
          const daddr = daddrPlaces.map(encodeURIComponent).join('+to:');
          embedUrl = 'https://maps.google.com/maps?saddr=' + encodeURIComponent(saddr) +
            '&daddr=' + daddr + '&output=embed';
        } else if (parts.length === 1) {
          const place = decodeURIComponent(parts[0].replace(/\+/g, ' '));
          embedUrl = 'https://maps.google.com/maps?saddr=' + encodeURIComponent(_userLoc) +
            '&daddr=' + encodeURIComponent(place) + '&output=embed';
        }
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
          '<button id="maps-modal-open" style="background:#F4630B;color:#060503;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">📍 Abrir en Google Maps</button>' +
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
      icon: `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M13 2 4 14h7v8l9-12h-7z"/></svg>`,
      title: 'Pregunta lo',
      titleEm: 'imposible.',
      body: 'Un Uber, un vuelo, un hotel, una ruta de 10 días con camping cada noche — todo en una sola frase. Yo lo cruzo.'
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

// ═══ CONVERSOR DE DIVISAS ═══

const CURRENCY_LIST = [
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'USD', name: 'Dólar USA', flag: '🇺🇸' },
  { code: 'GBP', name: 'Libra', flag: '🇬🇧' },
  { code: 'JPY', name: 'Yen japonés', flag: '🇯🇵' },
  { code: 'CNY', name: 'Yuan chino', flag: '🇨🇳' },
  { code: 'KRW', name: 'Won coreano', flag: '🇰🇷' },
  { code: 'THB', name: 'Baht tailandés', flag: '🇹🇭' },
  { code: 'VND', name: 'Đồng vietnamita', flag: '🇻🇳' },
  { code: 'IDR', name: 'Rupia indonesia', flag: '🇮🇩' },
  { code: 'INR', name: 'Rupia india', flag: '🇮🇳' },
  { code: 'AED', name: 'Dírham EAU', flag: '🇦🇪' },
  { code: 'MAD', name: 'Dírham marroquí', flag: '🇲🇦' },
  { code: 'TRY', name: 'Lira turca', flag: '🇹🇷' },
  { code: 'EGP', name: 'Libra egipcia', flag: '🇪🇬' },
  { code: 'MXN', name: 'Peso mexicano', flag: '🇲🇽' },
  { code: 'BRL', name: 'Real brasileño', flag: '🇧🇷' },
  { code: 'ARS', name: 'Peso argentino', flag: '🇦🇷' },
  { code: 'CLP', name: 'Peso chileno', flag: '🇨🇱' },
  { code: 'COP', name: 'Peso colombiano', flag: '🇨🇴' },
  { code: 'PEN', name: 'Sol peruano', flag: '🇵🇪' },
  { code: 'CAD', name: 'Dólar canadiense', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar australiano', flag: '🇦🇺' },
  { code: 'NZD', name: 'Dólar neozelandés', flag: '🇳🇿' },
  { code: 'CHF', name: 'Franco suizo', flag: '🇨🇭' },
  { code: 'NOK', name: 'Corona noruega', flag: '🇳🇴' },
  { code: 'SEK', name: 'Corona sueca', flag: '🇸🇪' },
  { code: 'DKK', name: 'Corona danesa', flag: '🇩🇰' },
  { code: 'PLN', name: 'Złoty polaco', flag: '🇵🇱' },
  { code: 'CZK', name: 'Corona checa', flag: '🇨🇿' },
  { code: 'HUF', name: 'Florín húngaro', flag: '🇭🇺' },
  { code: 'RUB', name: 'Rublo ruso', flag: '🇷🇺' },
  { code: 'ZAR', name: 'Rand sudafricano', flag: '🇿🇦' },
  { code: 'SGD', name: 'Dólar de Singapur', flag: '🇸🇬' },
  { code: 'MYR', name: 'Ringgit malayo', flag: '🇲🇾' },
  { code: 'PHP', name: 'Peso filipino', flag: '🇵🇭' },
  { code: 'HKD', name: 'Dólar HK', flag: '🇭🇰' },
  { code: 'TWD', name: 'Dólar taiwanés', flag: '🇹🇼' },
  { code: 'ILS', name: 'Shekel israelí', flag: '🇮🇱' },
  { code: 'SAR', name: 'Riyal saudí', flag: '🇸🇦' },
  { code: 'QAR', name: 'Riyal catarí', flag: '🇶🇦' },
  { code: 'KWD', name: 'Dinar kuwaití', flag: '🇰🇼' }
];

async function _fetchCurrencyRates() {
  const CACHE_KEY = 'bdm_currency_rates';
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && cached.ts && (Date.now() - cached.ts < CACHE_TTL) && cached.rates) {
      return cached;
    }
  } catch (_) {}
  const res = await fetch('https://open.er-api.com/v6/latest/EUR');
  if (!res.ok) throw new Error('fetch_failed');
  const data = await res.json();
  if (!data || !data.rates) throw new Error('bad_data');
  const payload = { ts: Date.now(), base: 'EUR', rates: data.rates, updated: data.time_last_update_utc || '' };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch (_) {}
  return payload;
}

function _formatCurrencyAmount(n) {
  if (!isFinite(n)) return '';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  if (abs >= 1) return n.toLocaleString('es-ES', { maximumFractionDigits: 4 });
  if (abs >= 0.01) return n.toLocaleString('es-ES', { maximumFractionDigits: 6 });
  return n.toExponential(2);
}

function openCurrencyConverter() {
  // Si ya está abierto, no duplicar
  if (document.getElementById('currency-modal-backdrop')) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'currency-modal-backdrop';
  backdrop.className = 'currency-backdrop';
  backdrop.innerHTML = `
    <div class="currency-modal" role="dialog" aria-modal="true" aria-label="Conversor de divisas">
      <button class="currency-close" aria-label="Cerrar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="currency-title">Cambio de moneda</div>
      <div class="currency-status" id="currency-status">Cargando…</div>
      <div class="currency-row">
        <input type="number" class="currency-amount" id="currency-amount-a" value="1" min="0" step="any" inputmode="decimal">
        <select class="currency-select" id="currency-sel-a"></select>
      </div>
      <button class="currency-swap" id="currency-swap" aria-label="Invertir">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
      </button>
      <div class="currency-row">
        <input type="number" class="currency-amount" id="currency-amount-b" value="" min="0" step="any" inputmode="decimal">
        <select class="currency-select" id="currency-sel-b"></select>
      </div>
      <div class="currency-foot" id="currency-foot">Datos informativos. Fuente: open.er-api.com</div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const $ = (id) => document.getElementById(id);
  const selA = $('currency-sel-a');
  const selB = $('currency-sel-b');
  const inpA = $('currency-amount-a');
  const inpB = $('currency-amount-b');
  const status = $('currency-status');
  const foot = $('currency-foot');

  // Poblar selectores
  const options = CURRENCY_LIST.map(c => `<option value="${c.code}">${c.flag} ${c.code} — ${c.name}</option>`).join('');
  selA.innerHTML = options;
  selB.innerHTML = options;
  selA.value = 'EUR';
  selB.value = 'USD';

  let rates = null; // rates relativos a EUR

  function convert(fromCode, toCode, amount) {
    if (!rates) return NaN;
    const rFrom = fromCode === 'EUR' ? 1 : rates[fromCode];
    const rTo = toCode === 'EUR' ? 1 : rates[toCode];
    if (!rFrom || !rTo) return NaN;
    // amount en EUR = amount / rFrom  → en toCode = * rTo
    return (amount / rFrom) * rTo;
  }

  function updateFromA() {
    const a = parseFloat(inpA.value);
    if (!isFinite(a)) { inpB.value = ''; return; }
    const r = convert(selA.value, selB.value, a);
    inpB.value = isFinite(r) ? _formatCurrencyAmount(r).replace(/\./g, '').replace(',', '.') : '';
  }
  function updateFromB() {
    const b = parseFloat(inpB.value);
    if (!isFinite(b)) { inpA.value = ''; return; }
    const r = convert(selB.value, selA.value, b);
    inpA.value = isFinite(r) ? _formatCurrencyAmount(r).replace(/\./g, '').replace(',', '.') : '';
  }

  inpA.addEventListener('input', updateFromA);
  inpB.addEventListener('input', updateFromB);
  selA.addEventListener('change', updateFromA);
  selB.addEventListener('change', updateFromA);

  $('currency-swap').addEventListener('click', () => {
    const a = selA.value, b = selB.value;
    selA.value = b; selB.value = a;
    updateFromA();
  });

  function close() {
    if (window.popModal) window.popModal('moneda');
    backdrop.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  backdrop.querySelector('.currency-close').addEventListener('click', close);
  if (window.pushModal) window.pushModal('moneda', close);

  // Cargar rates
  _fetchCurrencyRates().then(data => {
    rates = data.rates;
    status.style.display = 'none';
    if (data.updated) {
      try {
        const d = new Date(data.updated);
        if (!isNaN(d)) foot.textContent = `Actualizado ${d.toLocaleDateString('es-ES', { day:'2-digit', month:'short' })}. Datos informativos.`;
      } catch (_) {}
    }
    updateFromA();
  }).catch(() => {
    status.textContent = 'No se pudo cargar el cambio. Revisa tu conexión.';
    status.classList.add('currency-status--err');
  });
}

// ═══ INIT ═══
// No llamar showState('welcome') aquí — onAuthStateChanged decide:
// - Con sesión → directo al chat
// - Sin sesión → gate obligatorio
// El splash se mantiene visible hasta que Firebase resuelva el auth
// Tutorial de 3 pantallas QUITADO (propuesta UX 26 sept 2026): la portada ya explica
// qué hace Salma. showOnboarding() se deja por si se quiere recuperar.
// if (!localStorage.getItem('bdm_onboarding_done')) {
//   showOnboarding();
// }
