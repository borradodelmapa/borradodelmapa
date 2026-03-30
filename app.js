/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — app.js
   Firebase init, auth, navegación, Mis Viajes
   ═══════════════════════════════════════════ */

// Firebase ya inicializado en index.html — solo referencias
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Estado global
let currentUser = null;
let currentState = 'welcome'; // 'welcome' | 'chat' | 'viajes' | 'profile'
let currentUserSOSConfig = null;

// ═══ DOM refs ═══
const $content = document.getElementById('app-content');
const $headerActions = document.getElementById('header-actions');
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
  } else if (state === 'rutas') {
    loadUserGuides();
    if (inputBar) inputBar.style.display = 'none';
  } else if (state === 'viajes' || state === 'profile') {
    renderProfile();
    if (inputBar) inputBar.style.display = 'none';
  } else if (state === 'bitacora') {
    renderBitacora();
    if (inputBar) inputBar.style.display = 'none';
  } else if (state === 'diario') {
    // renderDiario se llama con parámetros desde renderBitacora
    if (inputBar) inputBar.style.display = 'none';
  } else if (state === 'chat') {
    $input.placeholder = 'Escribe a Salma...';
    if (inputBar) inputBar.style.display = '';
  }
}

function updateHeader() {
  // Header limpio — solo logo. Navegación en bottom bar.
  $headerActions.innerHTML = '';
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
  const isProfile = currentState === 'profile' || currentState === 'bitacora' || currentState === 'diario';
  const sosContacts = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim());
  const sosReady = currentUser && sosContacts.length > 0;

  bar.innerHTML = `
    <button class="bottom-tab ${isHome ? 'bottom-tab-active' : ''}" id="tab-home">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </button>
    <button class="bottom-tab ${isChat ? 'bottom-tab-active' : ''}" id="tab-chat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Chat</span>
    </button>
    <button class="bottom-tab ${isRutas ? 'bottom-tab-active' : ''}" id="tab-rutas">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/><rect x="1" y="3" width="4" height="4" rx="1"/><rect x="1" y="10" width="4" height="4" rx="1"/><rect x="1" y="17" width="4" height="4" rx="1"/></svg>
      <span>Mis Rutas</span>
    </button>
    <button class="bottom-tab ${isProfile ? 'bottom-tab-active' : ''}" id="tab-profile">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>${currentUser ? 'Perfil' : 'Entrar'}</span>
    </button>`;

  // Botón SOS flotante
  let sosBtn = document.getElementById('sos-fab');
  if (!sosBtn) {
    sosBtn = document.createElement('button');
    sosBtn.id = 'sos-fab';
    sosBtn.className = 'sos-fab';
    sosBtn.setAttribute('aria-label', 'SOS Emergencia');
    sosBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    document.body.appendChild(sosBtn);
    sosBtn.addEventListener('click', () => {
      if (!currentUser) { window._afterLogin = 'profile'; openModal('login'); return; }
      if (sosReady) { showSOSConfirm(); } else { renderSOSConfig(); }
    });
  }
  sosBtn.className = `sos-fab ${sosReady ? 'sos-fab-ready' : 'sos-fab-off'}`;

  document.getElementById('tab-home').addEventListener('click', () => showState('welcome'));
  document.getElementById('tab-chat').addEventListener('click', () => {
    if (currentState !== 'chat') {
      if (typeof salma !== 'undefined') salma._initChat();
    }
  });
  document.getElementById('tab-rutas').addEventListener('click', () => {
    if (!currentUser) { window._afterLogin = 'rutas'; openModal('login'); return; }
    showState('rutas');
  });
  document.getElementById('tab-profile').addEventListener('click', handleAvatarClick);
}

function handleAvatarClick() {
  if (currentUser) {
    showState('profile');
  } else {
    window._afterLogin = 'profile';
    openModal('login');
  }
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
        <h1 class="welcome-title">Dime a dónde vas.<br><em>Yo me encargo.</em></h1>
        <div class="welcome-input-wrap">
          <div class="input-row">
            <textarea class="welcome-input" id="welcome-input" placeholder="¿A dónde vamos?" rows="1"></textarea>
            <input type="file" id="welcome-photo-input" accept="image/*" style="display:none">
            <input type="file" id="welcome-camera-input" accept="image/*" capture="environment" style="display:none">
            <div class="cam-menu" id="welcome-cam-menu" style="display:none">
              <button class="cam-menu-opt" id="welcome-cam-menu-foto">📸 Hacer foto</button>
              <button class="cam-menu-opt" id="welcome-cam-menu-galeria">🖼️ Galería</button>
            </div>
            <button class="app-cam welcome-cam" id="welcome-cam-btn" aria-label="Enviar foto">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <button class="app-mic welcome-mic" id="welcome-mic-btn" aria-label="Hablar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="1" width="6" height="12" rx="3"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="welcome-chips" id="welcome-chips">
          ${defaultChips}
        </div>

      </div>
    </div>`;

  // Welcome input → enviar
  const wInput = document.getElementById('welcome-input');
  const wSend = document.getElementById('welcome-send');
  if (wSend) wSend.addEventListener('click', () => {
    const msg = wInput.value.trim();
    if (msg && typeof salma !== 'undefined') salma.send(msg);
  });
  if (wInput) wInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const msg = wInput.value.trim();
      if (msg && typeof salma !== 'undefined') salma.send(msg);
    }
  });

  // Welcome camera button — menú foto/galería
  const wCamBtn = document.getElementById('welcome-cam-btn');
  const wPhotoInput = document.getElementById('welcome-photo-input');
  const wCameraInput = document.getElementById('welcome-camera-input');
  const wCamMenu = document.getElementById('welcome-cam-menu');
  if (wCamBtn && wPhotoInput && typeof salma !== 'undefined') {
    wCamBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (wCamMenu) wCamMenu.style.display = wCamMenu.style.display === 'none' ? '' : 'none';
    });
    if (wCamMenu) {
      document.getElementById('welcome-cam-menu-foto')?.addEventListener('click', () => {
        wCamMenu.style.display = 'none';
        if (wCameraInput) wCameraInput.click();
      });
      document.getElementById('welcome-cam-menu-galeria')?.addEventListener('click', () => {
        wCamMenu.style.display = 'none';
        wPhotoInput.click();
      });
    }
    const handleWelcomeFile = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (file) salma._handlePhotoSelected(file);
    };
    wPhotoInput.addEventListener('change', handleWelcomeFile);
    if (wCameraInput) wCameraInput.addEventListener('change', handleWelcomeFile);
  }

  // Placeholder rotativo
  if (wInput) {
    const ejemplos = [
      'Vietnam 10 días en moto',
      'Bangkok sin hotel esta noche',
      '3 días en Lisboa sola',
      'Vacunas para Nepal',
      'Tailandia 15 días mochilero',
      'Me han robado en Roma',
      'Japón 2 semanas primer viaje',
      'Médico en Tailandia, no hablo tailandés',
      'Marruecos 5 días desde Tánger',
      'Avería en carretera en Turquía'
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
}

async function _loadChipsAsync(chipsEl) {
  if (!chipsEl) return;
  try {
    let chipsHtml = '';
    let chipsType = 'none';

    if (currentUser) {
      const snap = await db.collection('users').doc(currentUser.uid)
        .collection('maps').orderBy('createdAt', 'desc').limit(3).get();
      if (!snap.empty) {
        snap.forEach(doc => {
          const d = doc.data();
          chipsHtml += `<div class="chip chip-saved" data-doc-id="${doc.id}">${escapeHTML(d.nombre || 'Mi ruta')}</div>`;
        });
        chipsType = 'saved';
      }
    }
    if (!chipsHtml) {
      const snap = await db.collection('public_guides')
        .where('featured', '==', true).limit(3).get();
      if (!snap.empty) {
        snap.forEach(doc => {
          const d = doc.data();
          chipsHtml += `<div class="chip chip-featured" data-slug="${doc.id}">${escapeHTML(d.nombre || 'Ruta')}</div>`;
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

async function renderProfile() {
  if (!currentUser) { showState('welcome'); return; }

  const coins = currentUser.coins_saldo || 0;
  const rutas = currentUser.rutas_gratis_usadas || 0;
  const initial = (currentUser.name || currentUser.email || 'V')[0].toUpperCase();

  $content.innerHTML = `
    <div class="profile-area fade-in">
      <div class="profile-header">
        <div class="profile-avatar">${escapeHTML(initial)}</div>
        <div class="profile-info">
          <div class="profile-name">${escapeHTML(currentUser.name || 'Viajero')}</div>
          <div class="profile-stats">${coins} Salma Coins · ${3 - rutas} rutas gratis</div>
        </div>
      </div>

      <div class="profile-sections">
        <div class="profile-section" id="prof-bitacora">
          <span class="profile-section-icon">📓</span>
          <span class="profile-section-label">Bitácora</span>
          <button class="profile-info-btn" id="prof-bitacora-info" onclick="event.stopPropagation()">i</button>
          <span class="profile-section-arrow">›</span>
        </div>

        <div class="profile-section" id="prof-galeria">
          <span class="profile-section-icon">🖼️</span>
          <span class="profile-section-label">Galería</span>
          <button class="profile-info-btn" id="prof-galeria-info" onclick="event.stopPropagation()">i</button>
          <span class="profile-section-arrow">›</span>
        </div>

        <div class="profile-section" id="prof-narrator">
          <span class="profile-section-icon">📍</span>
          <span class="profile-section-label">Narrador en ruta</span>
          <button class="profile-info-btn" id="prof-narrator-info" onclick="event.stopPropagation()">i</button>
          <label class="profile-toggle" onclick="event.stopPropagation()">
            <input type="checkbox" id="narrator-toggle" ${typeof salma !== 'undefined' && salma._narratorActive ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="profile-section profile-section-sos ${(currentUserSOSConfig?.contacts || []).filter(c=>c.phone?.trim()).length > 0 ? 'sos-configured' : 'sos-unconfigured'}" id="prof-sos">
          <span class="profile-section-icon profile-section-icon-sos">🆘</span>
          <span class="profile-section-label">SOS Emergencia</span>
          <span class="sos-status-badge">
            ${(currentUserSOSConfig?.contacts || []).filter(c=>c.phone?.trim()).length > 0
              ? '<span class="sos-badge-on">configurado</span>'
              : '<span class="sos-badge-off">sin configurar</span>'}
          </span>
          <button class="profile-info-btn sos-edit-btn" id="prof-sos-edit" onclick="event.stopPropagation()" title="Editar contactos">✏️</button>
          <span class="profile-section-arrow">›</span>
        </div>

        <div class="profile-section profile-section-locked">
          <span class="profile-section-icon">📝</span>
          <span class="profile-section-label">Notas de Salma</span>
          <span class="profile-section-badge">pronto</span>
        </div>

        <div class="profile-section profile-section-locked">
          <span class="profile-section-icon">⚙️</span>
          <span class="profile-section-label">Preferencias</span>
          <span class="profile-section-badge">pronto</span>
        </div>

        <div class="profile-section" id="prof-help">
          <span class="profile-section-icon">?</span>
          <span class="profile-section-label">Ayuda</span>
          <span class="profile-section-arrow">›</span>
        </div>

        <div class="profile-section" id="prof-coins">
          <span class="profile-section-icon">S</span>
          <span class="profile-section-label">Salma Coins</span>
          <span class="profile-section-coins-badge">${coins}</span>
          <span class="profile-section-arrow">›</span>
        </div>

        <div class="profile-section profile-section-logout" id="prof-logout">
          <span class="profile-section-icon">🚪</span>
          <span class="profile-section-label">Cerrar sesión</span>
        </div>
      </div>

      <div class="profile-viajes">
        <div class="profile-viajes-header">MIS VIAJES</div>
        <div class="viajes-grid" id="viajes-grid">
          <div class="viaje-card viaje-card-new" id="btn-new-guide">
            <div class="viaje-card-new-icon">+</div>
            <div class="viaje-card-new-txt">NUEVA GUÍA</div>
          </div>
        </div>
      </div>
    </div>`;

  // Event listeners
  document.getElementById('prof-coins').addEventListener('click', openCoinsModal);
  document.getElementById('prof-bitacora').addEventListener('click', () => showState('bitacora'));
  document.getElementById('prof-galeria').addEventListener('click', () => renderGaleria());
  document.getElementById('narrator-toggle').addEventListener('change', async (e) => {
    if (typeof salma === 'undefined') return;
    if (e.target.checked) {
      const ok = await salma.startNarrator();
      if (ok === false) {
        e.target.checked = false;
        alert('Para usar el narrador, permite las notificaciones en tu navegador.');
      }
    } else {
      salma.stopNarrator();
    }
    updateBottomBar();
  });
  document.getElementById('prof-bitacora-info').addEventListener('click', () => {
    showInfoPopup('Aquí encontrarás listados todos tus viajes. Encontrarás las notas asignadas a cada viaje. Además podrás escribir un blog de viaje, añadirle fotos... y compartirlo si quieres con la comunidad.');
  });
  document.getElementById('prof-galeria-info').addEventListener('click', () => {
    showInfoPopup('Aquí puedes organizar las fotos de todos tus viajes. Crear galerías nuevas. Y hacer videos para compartir con tus amigos en redes sociales o como quieras.');
  });
  document.getElementById('prof-narrator-info').addEventListener('click', () => {
    showInfoPopup('Si estás cerca de un punto de interés cultural, Salma te manda una notificación y te cuenta la historia. Así no te pierdes nada. Info actualizada de más de 190 países.');
  });
  document.getElementById('prof-help').addEventListener('click', () => {
    document.getElementById('salma-info-overlay').style.display = 'flex';
  });
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
  document.getElementById('btn-new-guide').addEventListener('click', () => {
    if (typeof salma !== 'undefined') {
      salma.reset();
      salma._initChat();
    }
  });

  // Cargar guías del usuario
  _loadProfileGuides();
}

async function _loadProfileGuides() {
  if (!currentUser) return;
  try {
    const snap = await db.collection('users').doc(currentUser.uid)
      .collection('maps').orderBy('createdAt', 'desc').get();
    const grid = document.getElementById('viajes-grid');
    if (!grid) return;

    const allGuides = [];
    snap.forEach(doc => allGuides.push({ id: doc.id, data: doc.data() }));

    for (const g of allGuides) {
      grid.appendChild(_createGuideCard(g, g.data));
    }
  } catch (e) {
    console.error('Error cargando guías:', e);
  }
}

function _createGuideCard(doc, d) {
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
      showToast('Guía eliminada');
    } catch (err) {
      showToast('Error al eliminar');
    }
  });
  return card;
}

// ═══ BITÁCORA — Organizada por países ═══

// CRUD notas por país
async function saveCountryNote(countryCode, countryName, emoji, nota) {
  if (!currentUser || !countryCode) return;
  const ref = db.collection('users').doc(currentUser.uid).collection('paises').doc(countryCode);
  const doc = await ref.get();
  if (doc.exists) {
    // arrayUnion es atómico — no pierde notas si hay escrituras simultáneas
    await ref.update({
      notas: firebase.firestore.FieldValue.arrayUnion(nota),
      updatedAt: new Date().toISOString()
    });
  } else {
    await ref.set({ countryCode, countryName, emoji, notas: [nota], updatedAt: new Date().toISOString() });
  }
}

async function deleteCountryNote(countryCode, notaId) {
  if (!currentUser || !countryCode) return;
  const ref = db.collection('users').doc(currentUser.uid).collection('paises').doc(countryCode);
  const doc = await ref.get();
  if (!doc.exists) return;
  const notas = (doc.data().notas || []).filter(n => n.id !== notaId);
  await ref.update({ notas, updatedAt: new Date().toISOString() });
}

async function renderBitacora() {
  if (!currentUser) { showState('welcome'); return; }

  $content.innerHTML = `
    <div class="bitacora-area fade-in">
      <div class="bitacora-header">
        <button class="bitacora-back" id="bitacora-back">←</button>
        <div class="bitacora-title">Bitácora</div>
      </div>
      <div class="bitacora-countries" id="bitacora-countries">
        <div class="bitacora-loading">Cargando tu bitácora...</div>
      </div>
    </div>`;

  document.getElementById('bitacora-back').addEventListener('click', () => showState('profile'));

  try {
    // Cargar rutas y notas en paralelo
    const [mapsSnap, paisesSnap] = await Promise.all([
      db.collection('users').doc(currentUser.uid).collection('maps').orderBy('createdAt', 'desc').get(),
      db.collection('users').doc(currentUser.uid).collection('paises').get()
    ]);

    const container = document.getElementById('bitacora-countries');
    if (!container) return;

    // Agrupar rutas por país
    const countriesMap = {}; // code → { name, emoji, rutas: [], notas: [] }

    mapsSnap.forEach(doc => {
      const d = doc.data();
      let route = null;
      try { route = JSON.parse(d.itinerarioIA || '{}'); } catch (_) {}
      // Intentar normalizar por varios campos hasta encontrar un código válido
      let country = normalizeCountry(d.country || '');
      if (!country.code) country = normalizeCountry(d.destino || '');
      if (!country.code && route?.country) country = normalizeCountry(route.country);
      if (!country.code && d.nombre) country = normalizeCountry(d.nombre);
      const code = country.code || 'XX';
      if (!countriesMap[code]) countriesMap[code] = { name: country.name || 'Otros', emoji: country.emoji || '', rutas: [], notas: [] };
      // Evitar duplicados por doc.id
      if (!countriesMap[code].rutas.some(r => r.doc.id === doc.id)) {
        countriesMap[code].rutas.push({ doc, data: d, route });
      }
    });

    // Merge notas de países
    paisesSnap.forEach(doc => {
      const d = doc.data();
      const code = d.countryCode || doc.id;
      if (!countriesMap[code]) countriesMap[code] = { name: d.countryName || code, emoji: d.emoji || countryEmoji(code), rutas: [], notas: [] };
      countriesMap[code].notas = d.notas || [];
    });

    // Si no hay nada
    if (Object.keys(countriesMap).length === 0) {
      container.innerHTML = `
        <div class="bitacora-empty">
          <div class="bitacora-empty-icon">📓</div>
          <div class="bitacora-empty-text">Tu bitácora está vacía</div>
          <div class="bitacora-empty-sub">Habla con Salma y la info se irá guardando aquí</div>
          <button class="btn-primary" id="bitacora-new">Habla con Salma</button>
        </div>`;
      document.getElementById('bitacora-new')?.addEventListener('click', () => {
        if (typeof salma !== 'undefined') { salma.reset(); salma._initChat(); }
      });
      return;
    }

    // Ordenar países por última actividad
    const sorted = Object.entries(countriesMap).sort((a, b) => {
      const aDate = a[1].rutas[0]?.data?.createdAt || a[1].notas[0]?.fecha || '';
      const bDate = b[1].rutas[0]?.data?.createdAt || b[1].notas[0]?.fecha || '';
      return bDate.localeCompare(aDate);
    });

    container.innerHTML = '';

    sorted.forEach(([code, country]) => {
      const notasCount = country.notas.length;
      const rutasCount = country.rutas.length;

      const el = document.createElement('div');
      el.className = 'bitacora-country';
      el.innerHTML = `
        <div class="bitacora-country-header" data-code="${code}">
          <span class="bitacora-country-flag">${country.emoji}</span>
          <span class="bitacora-country-name">${escapeHTML(country.name)}</span>
          <span class="bitacora-country-counts">${notasCount ? notasCount + ' notas' : ''}${notasCount && rutasCount ? ' · ' : ''}${rutasCount ? rutasCount + ' ruta' + (rutasCount > 1 ? 's' : '') : ''}</span>
          <span class="bitacora-country-arrow">›</span>
        </div>
        <div class="bitacora-country-body" id="country-body-${code}" style="display:none;">
          <div class="bitacora-section">
            <div class="bitacora-section-title">NOTAS <button class="bitacora-add-note" data-code="${code}" data-name="${escapeHTML(country.name)}" data-emoji="${country.emoji}" title="Añadir nota">+</button></div>
            <div class="bitacora-notes-list" id="notes-${code}">
              ${notasCount === 0 ? '<div class="bitacora-note-empty">Sin notas aún</div>' :
                country.notas.map(n => `
                  <div class="bitacora-note" data-id="${n.id}">
                    <div class="bitacora-note-text">${escapeHTML(n.texto)}</div>
                    <div class="bitacora-note-meta">
                      <span class="bitacora-note-type tag-${n.tipo || 'nota'}">${n.tipo || 'nota'}</span>
                      <span class="bitacora-note-origin tag-${n.origen || 'manual'}">${n.origen === 'auto' ? 'auto' : 'guardado'}</span>
                      <button class="bitacora-note-delete" data-code="${code}" data-id="${n.id}">✕</button>
                    </div>
                  </div>`).join('')}
            </div>
          </div>
          <div class="bitacora-section">
            <div class="bitacora-section-title">RUTAS</div>
            <div class="bitacora-rutas-list">
              ${rutasCount === 0 ? '<div class="bitacora-note-empty">Aún no tienes rutas</div>' :
                country.rutas.map(r => {
                  const d = r.data;
                  const stops = r.route?.stops?.length || 0;
                  const days = r.route?.duration_days || d.num_dias || '?';
                  return `
                    <div class="bitacora-ruta-item" data-docid="${r.doc.id}">
                      <div class="bitacora-ruta-name">${escapeHTML(d.nombre || 'Mi ruta')}</div>
                      <div class="bitacora-ruta-meta">${days} días · ${stops} paradas</div>
                    </div>`;
                }).join('')}
            </div>
          </div>
        </div>`;

      // Acordeón toggle
      el.querySelector('.bitacora-country-header').addEventListener('click', () => {
        const body = document.getElementById('country-body-' + code);
        const arrow = el.querySelector('.bitacora-country-arrow');
        if (body.style.display === 'none') {
          body.style.display = 'block';
          arrow.textContent = '⌄';
        } else {
          body.style.display = 'none';
          arrow.textContent = '›';
        }
      });

      container.appendChild(el);
    });

    // Event delegation para expandir/contraer notas
    container.addEventListener('click', (e) => {
      const noteText = e.target.closest('.bitacora-note-text');
      if (noteText) {
        noteText.classList.toggle('expanded');
      }
    });

    // Event delegation para eliminar notas
    container.addEventListener('click', async (e) => {
      const del = e.target.closest('.bitacora-note-delete');
      if (del) {
        e.stopPropagation();
        const code = del.dataset.code;
        const id = del.dataset.id;
        del.closest('.bitacora-note')?.remove();
        await deleteCountryNote(code, id);
        // Actualizar contador
        const notesList = document.getElementById('notes-' + code);
        if (notesList && notesList.children.length === 0) {
          notesList.innerHTML = '<div class="bitacora-note-empty">Sin notas aún</div>';
        }
      }
    });

    // Event delegation para abrir rutas
    container.addEventListener('click', (e) => {
      const ruta = e.target.closest('.bitacora-ruta-item');
      if (ruta) {
        const docId = ruta.dataset.docid;
        // Buscar la ruta en mapsSnap
        const doc = mapsSnap.docs.find(d => d.id === docId);
        if (doc) {
          const d = doc.data();
          let route = null;
          try { route = JSON.parse(d.itinerarioIA || '{}'); } catch (_) {}
          currentState = 'diario';
          updateBottomBar();
          if (typeof bitacoraRenderer !== 'undefined') {
            bitacoraRenderer.renderDiario(route, doc.id, d.notes || {}, d.photos || [], d);
          }
        }
      }
    });

    // Event delegation para añadir nota manual
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.bitacora-add-note');
      if (btn) {
        e.stopPropagation();
        showAddNoteModal(btn.dataset.code, btn.dataset.name, btn.dataset.emoji);
      }
    });

  } catch (e) {
    console.error('Error cargando bitácora:', e);
    const container = document.getElementById('bitacora-countries');
    if (container) container.innerHTML = '<div class="bitacora-empty-text">Error cargando tu bitácora</div>';
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
      db.collection('users').doc(uid).collection('fotos').orderBy('createdAt', 'desc').get(),
      db.collection('users').doc(uid).collection('albumes').orderBy('createdAt', 'desc').get()
    ]);
    fotosSnap.forEach(d => fotos.push({ id: d.id, ...d.data() }));
    albumesSnap.forEach(d => albumes.push({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('[Galería] Error Firestore (puede faltar reglas):', e.message);
    // Intentar cargar fotos de las rutas existentes como fallback
    try {
      const mapsSnap = await db.collection('users').doc(uid).collection('maps').get();
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
              createdAt: p.uploadedAt || data.createdAt || ''
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
        return `<div class="galeria-album-chip ${activeAlbum === a.id ? 'active' : ''}" data-album="${a.id}">${escapeHTML(a.nombre)} (${count})</div>`;
      }).join('')}
      ${sinAlbum > 0 ? `<div class="galeria-album-chip ${activeAlbum === '__sin_album__' ? 'active' : ''}" data-album="__sin_album__">Sin álbum (${sinAlbum})</div>` : ''}
      <div class="galeria-album-chip galeria-album-new" id="galeria-new-album">+ Crear álbum</div>
    </div>`;

  const gridHtml = filtered.length === 0
    ? '<div class="galeria-empty">No hay fotos todavía.<br>Pulsa <strong>📤 Añadir</strong> para subir desde tu galería, o envía fotos a Salma desde el chat.</div>'
    : `<div class="galeria-grid">${filtered.map(f => `
        <div class="galeria-item" data-foto-id="${f.id}">
          <img src="${escapeHTML(f.url)}" class="galeria-thumb" alt="${escapeHTML(f.caption || '')}" loading="lazy">
          <span class="galeria-tag-badge">${TAG_ICONS[f.tag] || '📷'}</span>
        </div>`).join('')}</div>`;

  $c.innerHTML = `
    <div class="galeria-area fade-in">
      <div class="galeria-header">
        <button class="galeria-back" id="galeria-back">← Galería</button>
        <span class="galeria-title">${escapeHTML(activeAlbumName)}</span>
        <div class="galeria-header-btns">
          <button class="profile-info-btn" id="galeria-info-btn" title="Info">i</button>
          <label for="galeria-file-input" class="galeria-upload-btn" title="Añadir fotos">📤 Añadir</label>
          <button class="galeria-video-btn" id="galeria-video-btn" title="Crear video">🎬 Video</button>
        </div>
      </div>
      <input type="file" id="galeria-file-input" accept="image/*" multiple style="display:none">
      ${albumsHtml}
      ${gridHtml}
    </div>`;

  // Event: back
  document.getElementById('galeria-back').addEventListener('click', () => {
    showState('profile');
    document.querySelector('.app-input-bar').style.display = '';
  });

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

  // Event: crear video desde galería
  document.getElementById('galeria-video-btn')?.addEventListener('click', () => {
    if (typeof videoPlayer === 'undefined') {
      if (typeof showToast === 'function') showToast('Cargando motor de video…');
      return;
    }
    _showCreateVideoModal(fotos, albumes, uid, activeAlbum);
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

  // Event: click foto → acciones (mover, eliminar)
  document.querySelectorAll('.galeria-item').forEach(item => {
    item.addEventListener('click', () => {
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

  const albumOptions = albumes.map(a =>
    `<button class="foto-action-btn" data-move="${a.id}">${escapeHTML(a.nombre)}</button>`
  ).join('');

  modal.innerHTML = `
    <div class="modal" style="max-width:340px">
      <button class="modal-close" id="foto-modal-close">&times;</button>
      <img src="${escapeHTML(foto.url)}" style="width:100%;border-radius:8px;margin-bottom:12px">
      ${foto.caption ? `<p style="font-size:13px;color:var(--crema);margin-bottom:12px">${escapeHTML(foto.caption)}</p>` : ''}
      <div style="font-size:11px;color:rgba(244,239,230,.4);margin-bottom:16px">${TAG_ICONS[foto.tag] || '📷'} ${foto.tag || 'otro'} · ${new Date(foto.createdAt).toLocaleDateString('es-ES')}</div>
      ${albumes.length > 0 ? `<div class="foto-action-section">Mover a álbum:</div>${albumOptions}` : ''}
      ${foto.albumId ? `<button class="foto-action-btn" data-move="__quitar__">Quitar de álbum</button>` : ''}
      <button class="foto-action-btn foto-action-delete" id="foto-delete">Eliminar foto</button>
    </div>`;

  document.body.appendChild(modal);

  // Cerrar
  modal.querySelector('#foto-modal-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  // Mover a álbum
  modal.querySelectorAll('[data-move]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetAlbum = btn.dataset.move;
      try {
        await db.collection('users').doc(uid).collection('fotos').doc(foto.id).update({
          albumId: targetAlbum === '__quitar__' ? null : targetAlbum
        });
        modal.remove();
        if (typeof showToast === 'function') showToast(targetAlbum === '__quitar__' ? 'Foto quitada del álbum' : 'Foto movida');
        renderGaleria(currentAlbumFilter);
      } catch (e) {
        if (typeof showToast === 'function') showToast('Error al mover foto');
      }
    });
  });

  // Eliminar
  modal.querySelector('#foto-delete')?.addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await db.collection('users').doc(uid).collection('fotos').doc(foto.id).delete();
      // Eliminar de R2
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

// ─── Modal de CREACIÓN DE VIDEO desde galería ───
function _showCreateVideoModal(fotos, albumes, uid, activeAlbum) {
  const existing = document.getElementById('create-video-modal');
  if (existing) existing.remove();

  // Helpers de filtro
  const visual = (arr) => arr.filter(f => f.tag !== 'documento' && f.tag !== 'cartel' && f.url);
  const hoy    = new Date().toISOString().slice(0, 10);

  const sets = {
    jornada: visual(fotos.filter(f => f.createdAt && f.createdAt.slice(0, 10) === hoy)),
    resumen: visual(fotos),
    album:   visual(activeAlbum && activeAlbum !== '__sin_album__'
               ? fotos.filter(f => f.albumId === activeAlbum)
               : fotos)
  };

  const albumName = activeAlbum && activeAlbum !== '__sin_album__'
    ? (albumes.find(a => a.id === activeAlbum)?.nombre || 'Álbum')
    : 'Todas';

  // Título por defecto
  let defaultTitle = 'Mi viaje';
  if (typeof salma !== 'undefined' && salma.currentRoute?.title) {
    defaultTitle = salma.currentRoute.title;
  } else {
    defaultTitle = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Paradas de ruta (para la escena de mapa si hay ruta activa)
  let routeStops = null;
  if (typeof salma !== 'undefined' && salma.currentRoute?.stops?.length >= 2) {
    routeStops = salma.currentRoute.stops
      .filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01)
      .map(s => ({ name: s.name || '', lat: s.lat, lng: s.lng, day: s.day }));
  }

  const tipos = [
    { key: 'jornada', label: 'Jornada de hoy',    emoji: '📅', count: sets.jornada.length },
    { key: 'resumen', label: 'Todo el viaje',     emoji: '🌍', count: sets.resumen.length },
    { key: 'album',   label: albumName,            emoji: '📁', count: sets.album.length }
  ];

  const modal = document.createElement('div');
  modal.id = 'create-video-modal';
  modal.className = 'modal-overlay active';

  modal.innerHTML = `
    <div class="modal video-create-modal">
      <button class="modal-close" id="cv-close">&times;</button>
      <div class="video-create-title">🎬 Crear video</div>

      <div class="video-create-section">Formato</div>
      <div class="video-formato-group">
        <button class="video-formato-btn active" data-formato="documental">
          <span class="video-formato-icon">📽️</span>
          <span class="video-formato-name">Documental</span>
          <span class="video-formato-desc">Mapa animado · Ken Burns · 20s</span>
        </button>
        <button class="video-formato-btn" data-formato="historia">
          <span class="video-formato-icon">📱</span>
          <span class="video-formato-name">Historia</span>
          <span class="video-formato-desc">Instagram Stories · 2s/foto</span>
        </button>
      </div>

      <div class="video-create-section">Tipo de video</div>
      <div class="video-tipo-group">
        ${tipos.map(t => `
          <button class="video-tipo-btn ${t.key === 'jornada' ? 'active' : ''}" data-tipo="${t.key}">
            <span class="video-tipo-emoji">${t.emoji}</span>
            <span class="video-tipo-label">${escapeHTML(t.label)}</span>
            <span class="video-tipo-count">${t.count} fotos</span>
          </button>`).join('')}
      </div>

      <div class="video-create-section">Título</div>
      <input class="video-create-input" id="cv-titulo" type="text"
        placeholder="Ej: Koh Samui · Día 3" value="${escapeHTML(defaultTitle)}" maxlength="60">

      <div class="video-create-section">Frase memorable <span style="opacity:.45">(opcional)</span></div>
      <input class="video-create-input" id="cv-highlight" type="text"
        placeholder="Ej: El mejor atardecer de mi vida" maxlength="100">

      <div class="video-create-section">Fotos seleccionadas</div>
      <div class="video-foto-preview" id="cv-foto-preview"></div>

      <button class="video-create-gen-btn" id="cv-generar" disabled>▶ Generar video</button>
    </div>`;

  document.body.appendChild(modal);

  // Estado activo
  let tipoActivo    = 'jornada';
  let formatoActivo = 'documental';

  // Listeners formato
  modal.querySelectorAll('.video-formato-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.video-formato-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      formatoActivo = btn.dataset.formato;
    });
  });

  const updatePreview = () => {
    const sel = sets[tipoActivo] || [];
    const genBtn = document.getElementById('cv-generar');
    const preview = document.getElementById('cv-foto-preview');

    if (genBtn) {
      genBtn.disabled = sel.length === 0;
      genBtn.textContent = sel.length === 0
        ? '⚠ Sin fotos para este tipo'
        : `▶ Generar video (${Math.min(sel.length, 12)} fotos)`;
    }

    if (preview) {
      const visible = sel.slice(0, 8);
      const extra   = sel.length - visible.length;
      preview.innerHTML = visible.length === 0
        ? '<span class="video-foto-empty">No hay fotos para este tipo</span>'
        : visible.map(f =>
            `<img src="${escapeHTML(f.url)}" class="video-foto-thumb" alt="">`
          ).join('') + (extra > 0 ? `<span class="video-foto-more">+${extra}</span>` : '');
    }
  };

  updatePreview();

  // Listeners tipo
  modal.querySelectorAll('.video-tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.video-tipo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tipoActivo = btn.dataset.tipo;
      updatePreview();
    });
  });

  // Cerrar
  modal.querySelector('#cv-close').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // Generar
  modal.querySelector('#cv-generar').addEventListener('click', async () => {
    const sel    = (sets[tipoActivo] || []).slice(0, 12);
    if (!sel.length) return;

    const titulo    = (document.getElementById('cv-titulo')?.value || defaultTitle).trim();
    const highlight = (document.getElementById('cv-highlight')?.value || '').trim();
    const params    = { titulo, highlight, tipo: tipoActivo, style: formatoActivo };
    if (routeStops && formatoActivo === 'documental') params.stops = routeStops;

    modal.remove();
    await _showVideoPlayerModal(sel.map(f => f.url), params);
  });
}

// ─── Modal PLAYER de video (pantalla completa) ───
async function _showVideoPlayerModal(photoUrls, params) {
  if (typeof videoPlayer === 'undefined') {
    if (typeof showToast === 'function') showToast('Motor de video no cargado');
    return;
  }

  const existing = document.getElementById('video-player-modal');
  if (existing) { videoPlayer.pause(); existing.remove(); }

  const modal = document.createElement('div');
  modal.id = 'video-player-modal';
  modal.className = 'video-modal-overlay';

  modal.innerHTML = `
    <div class="video-modal-inner">
      <div class="video-modal-header">
        <button class="video-modal-close" id="vpm-close">✕ Cerrar</button>
        <span class="video-modal-titulo">${escapeHTML(params.titulo || '')}</span>
      </div>
      <div class="video-modal-canvas-wrap" id="vpm-canvas-wrap">
        <div class="video-modal-loading" id="vpm-loading">Preparando video…</div>
      </div>
      <div class="video-controls" id="vpm-controls" style="display:none">
        <button class="video-btn" id="vpm-play">▶ Play</button>
        <div class="video-progress" id="vpm-progress">
          <div class="video-progress-fill" id="vpm-progress-fill"></div>
        </div>
        <button class="video-btn" id="vpm-download" title="Descargar WebM">⬇</button>
        <button class="video-btn" id="vpm-share" title="Compartir">↗</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  // Inicializar player
  const canvasWrap = document.getElementById('vpm-canvas-wrap');
  const ok = await videoPlayer.init(canvasWrap, photoUrls, params);
  const loadingEl = document.getElementById('vpm-loading');

  if (!ok) {
    if (loadingEl) loadingEl.textContent = '⚠ No se pudieron cargar las fotos. Inténtalo de nuevo.';
    return;
  }

  if (loadingEl) loadingEl.remove();
  canvasWrap.appendChild(videoPlayer._canvas);

  videoPlayer._progressFill = document.getElementById('vpm-progress-fill');
  videoPlayer._onEnd = () => {
    const btn = document.getElementById('vpm-play');
    if (btn) btn.textContent = '▶ Play';
  };

  const controls = document.getElementById('vpm-controls');
  if (controls) controls.style.display = '';

  // Botón play
  const playBtn = document.getElementById('vpm-play');
  playBtn?.addEventListener('click', () => {
    if (videoPlayer._playing) {
      videoPlayer.pause();
      playBtn.textContent = '▶ Play';
    } else {
      videoPlayer.play();
      playBtn.textContent = '⏸ Pausa';
    }
  });

  document.getElementById('vpm-download')?.addEventListener('click', () => videoPlayer.download());
  document.getElementById('vpm-share')?.addEventListener('click', () => videoPlayer.share());

  // Progreso clicable
  document.getElementById('vpm-progress')?.addEventListener('click', e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoPlayer._frame = Math.floor(pct * videoPlayer._totalFrames);
    videoPlayer._renderFrame(videoPlayer._frame);
    videoPlayer._updateProgress();
  });

  // Cerrar
  document.getElementById('vpm-close')?.addEventListener('click', () => {
    videoPlayer.pause();
    modal.remove();
  });
}

// Modal para añadir nota manual
function showAddNoteModal(code, name, emoji) {
  const existing = document.getElementById('add-note-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'add-note-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal" style="max-width:400px;">
      <div class="modal-title">${emoji} ${escapeHTML(name)} — Nueva nota</div>
      <textarea class="app-input" id="note-text" placeholder="Escribe tu nota..." rows="3" style="width:100%;margin:12px 0;"></textarea>
      <select class="app-input" id="note-type" style="width:100%;margin-bottom:12px;padding:8px;">
        <option value="nota">Nota general</option>
        <option value="visado">Visado / requisitos</option>
        <option value="hotel">Hotel / alojamiento</option>
        <option value="vuelo">Vuelo / transporte</option>
        <option value="restaurante">Restaurante / comida</option>
        <option value="lugar">Lugar / sitio</option>
      </select>
      <div style="display:flex;gap:10px;">
        <button class="btn-primary" id="note-save" style="flex:1;">Guardar</button>
        <button class="btn-secondary" id="note-cancel" style="flex:1;">Cancelar</button>
      </div>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('note-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  document.getElementById('note-save').addEventListener('click', async () => {
    const texto = document.getElementById('note-text').value.trim();
    const tipo = document.getElementById('note-type').value;
    if (!texto) return;
    const nota = { id: 'nota_' + Date.now(), texto, tipo, origen: 'manual', fecha: new Date().toISOString() };
    await saveCountryNote(code, name, emoji, nota);
    modal.remove();
    renderBitacora(); // Refrescar
  });

  document.getElementById('note-text').focus();
}

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
      .collection('maps').orderBy('createdAt', 'desc').get();

    const grid = document.getElementById('viajes-grid');

    // Recopilar todas las guías
    const allGuides = [];
    snap.forEach(doc => allGuides.push({ id: doc.id, data: doc.data() }));

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

    // Si más de 5 guías → agrupar por país
    if (allGuides.length > 5) {
      const byCountry = {};
      for (const g of allGuides) {
        const country = g.data.destino || 'Otros';
        if (!byCountry[country]) byCountry[country] = [];
        byCountry[country].push(g);
      }
      // Ordenar países alfabéticamente
      const sorted = Object.keys(byCountry).sort((a, b) => a.localeCompare(b, 'es'));
      for (const country of sorted) {
        const group = document.createElement('div');
        group.className = 'viaje-group';
        group.innerHTML = `<div class="viaje-group-header">${escapeHTML(country.toUpperCase())} <span class="viaje-group-count">${byCountry[country].length}</span></div>`;
        const groupGrid = document.createElement('div');
        groupGrid.className = 'viaje-group-grid';
        for (const g of byCountry[country]) {
          groupGrid.appendChild(createCard(g, g.data));
        }
        group.appendChild(groupGrid);
        grid.appendChild(group);
      }
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

function openModal(view) {
  const screen = document.getElementById('auth-screen');
  if (!screen) return;
  screen.classList.add('active');
  _authShowView(view === 'register' ? 'register' : 'welcome');
}

function closeModal() {
  const screen = document.getElementById('auth-screen');
  if (screen) screen.classList.remove('active');
  ['login-email','login-pass','register-name','register-email','register-pass'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['login-error','register-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.remove('show'); }
  });
}

function _authShowView(view) {
  ['welcome','login','register'].forEach(v => {
    const el = document.getElementById('auth-' + v + '-view');
    if (el) el.classList.toggle('hidden', v !== view);
  });
}

window.openModal = openModal;
window.closeModal = closeModal;

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

async function doLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const pass = document.getElementById('login-pass')?.value;
  if (!email || !pass) return showAuthError('login-error', 'Rellena email y contraseña');
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    closeModal();
    // Ofrecer registrar huella si no la tiene y el dispositivo la soporta
    if (!localStorage.getItem('bdm_webauthn_cred') && window.PublicKeyCredential) {
      registerFingerprint(email);
    }
  } catch (e) {
    showAuthError('login-error', authErrorMsg(e));
  }
}

async function doRegister() {
  const name = document.getElementById('register-name')?.value.trim();
  const email = document.getElementById('register-email')?.value.trim();
  const pass = document.getElementById('register-pass')?.value;
  if (!email || !pass) return showAuthError('register-error', 'Rellena email y contraseña');
  if (pass.length < 6) return showAuthError('register-error', 'Mínimo 6 caracteres');
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await db.collection('users').doc(cred.user.uid).set({
      name: name || email.split('@')[0],
      email: email,
      isPremium: false,
      mapsCount: 0,
      coins_saldo: 0,
      rutas_gratis_usadas: 0,
      createdAt: new Date().toISOString()
    });
    closeModal();
  } catch (e) {
    showAuthError('register-error', authErrorMsg(e));
  }
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
    const { credentialId, email } = JSON.parse(storedCred);
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
      // Con WebAuthn verificado, iniciamos sesión con el email guardado
      // (en producción esto iría al servidor; aquí usamos custom token o email link)
      // Por ahora mostramos el formulario con el email prellenado
      document.getElementById('login-email').value = email || '';
      document.getElementById('login-pass').focus();
      showToast('Identidad verificada — introduce tu contraseña');
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

function logout() {
  auth.signOut();
  currentUser = null;
  if (typeof salma !== 'undefined') salma.reset();
  showState('welcome');
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
    };

    currentUserSOSConfig = userData.sos_config || {
      contacts: [{ name: '', phone: '' }, { name: '', phone: '' }, { name: '', phone: '' }],
      custom_message: ''
    };

    startTrackingLastPosition();
    _checkSOSQueue();

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

    // Tras login, ir al perfil
    if (window._afterLogin) {
      const dest = window._afterLogin;
      window._afterLogin = null;
      showState(dest);
    } else if (currentState === 'welcome') {
      showState('profile');
    }
  } else {
    currentUser = null;
    updateHeader();
  }
});

// ═══ GUARDAR GUÍA ═══

async function guardarGuia(routeData) {
  if (!currentUser) {
    // Registro lazy — guardar ruta y pedir login
    window._salmaLastRoute = routeData;
    localStorage.setItem('_salmaRouteBackup', JSON.stringify(routeData));
    showToast('Regístrate para guardar tu ruta');
    openModal('register');
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

    // Incrementar contador de rutas gratis usadas (si aplica)
    try {
      const usadas = currentUser.rutas_gratis_usadas || 0;
      const coins = currentUser.coins_saldo || 0;
      if (usadas < 3) {
        // Todavía tiene gratis — gastar una
        const newUsadas = usadas + 1;
        await db.collection('users').doc(currentUser.uid).update({
          rutas_gratis_usadas: newUsadas
        });
        currentUser.rutas_gratis_usadas = newUsadas;
        updateHeader();
      }
      // TODO: si no tiene gratis, descontar coins aquí
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
        guideRenderer.render(data.route, { saved: true });
      }
    }
  } catch (e) {
    console.warn('Enriquecimiento fallido:', e);
    // No pasa nada — la guía ligera funciona perfectamente
  }
}

window.enrichGuia = enrichGuia;

// ═══ INPUT — textarea auto-resize + enviar ═══

$input.addEventListener('input', () => {
  $input.style.height = 'auto';
  $input.style.height = Math.min($input.scrollHeight, 100) + 'px';
});

$send.addEventListener('click', sendMessage);
$input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
function sendMessage() {
  const msg = $input.value.trim();
  if (!msg) return;
  $input.value = '';
  $input.style.height = 'auto';
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
      if (isWelcome) {
        const msg = inputEl.value.trim();
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
    const inputEl = row ? row.querySelector('textarea') : null;
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

  // touchend responde al instante en móvil (no espera 300ms del click)
  document.addEventListener('touchend', handleMicTap);
  // click como fallback para desktop
  document.addEventListener('click', (e) => {
    // En móvil touchend ya lo manejó, evitar doble disparo
    if (e.target.closest('.app-mic') && 'ontouchend' in window) return;
    handleMicTap(e);
  });
})();

// ═══ AUTH SCREEN — Event listeners ═══

// Navegación entre vistas
document.getElementById('auth-go-login')?.addEventListener('click', () => { _authShowView('login'); _checkBiometricAvailable(); });
document.getElementById('auth-go-register')?.addEventListener('click', () => _authShowView('register'));
document.getElementById('auth-back-login')?.addEventListener('click', () => _authShowView('welcome'));
document.getElementById('auth-back-register')?.addEventListener('click', () => _authShowView('welcome'));
document.getElementById('auth-skip')?.addEventListener('click', closeModal);
document.getElementById('switch-to-register')?.addEventListener('click', () => _authShowView('register'));
document.getElementById('switch-to-login')?.addEventListener('click', () => _authShowView('login'));

// Login / Registro
document.getElementById('btn-login')?.addEventListener('click', doLogin);
document.getElementById('btn-register')?.addEventListener('click', doRegister);
document.getElementById('btn-google-login')?.addEventListener('click', doGoogleLogin);
document.getElementById('btn-google-login-2')?.addEventListener('click', doGoogleLogin);
document.getElementById('btn-google-register')?.addEventListener('click', doGoogleLogin);

// Huella dactilar (WebAuthn)
document.getElementById('btn-fingerprint')?.addEventListener('click', doFingerprintLogin);

// Enter en inputs
document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('register-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

// Logo → welcome
document.getElementById('app-logo')?.addEventListener('click', () => {
  if (currentUser) {
    showState('profile');
  } else {
    if (typeof salma !== 'undefined') salma.reset();
    showState('welcome');
  }
});

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

      <!-- Pack + botón pagar -->
      <div class="coins-modal-plan">
        <div class="coins-modal-plan-row">
          <div>
            <div class="coins-modal-plan-name">Pack Viajero</div>
            <div class="coins-modal-plan-note">25 coins · no caducan</div>
          </div>
          <button class="coins-modal-pay" id="coins-pay-btn" disabled>9,99€</button>
        </div>
        <div class="stripe-test-badge">MODO PRUEBA · no se cobrará</div>
      </div>
      <div id="stripe-loading" class="stripe-loading" style="display:none">
        <div class="stripe-spinner"></div>
        <span>Procesando pago...</span>
      </div>
      <div id="stripe-success" class="stripe-success" style="display:none">
        ✓ ¡25 coins añadidos a tu cuenta!
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
      // 1. Pedir PaymentIntent al worker
      const res = await fetch(window.SALMA_API + '/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.uid,
          pack: 'viajero'
        })
      });
      const { client_secret } = await res.json();

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
        // 3. Actualizar saldo en Firestore + local
        const newSaldo = (currentUser.coins_saldo || 0) + 25;
        try {
          await db.collection('users').doc(currentUser.uid).update({
            coins_saldo: newSaldo
          });
        } catch (e) {
          console.error('Error actualizando coins en Firestore:', e);
        }
        currentUser.coins_saldo = newSaldo;
        updateHeader();

        // Mostrar éxito
        loadingEl.style.display = 'none';
        successEl.style.display = 'flex';

        // Actualizar el saldo en el modal
        const valEl = overlay.querySelector('.coins-modal-saldo-val');
        if (valEl) valEl.textContent = currentUser.coins_saldo + ' coins';

        // Cerrar modal tras 2s
        setTimeout(() => {
          overlay.remove();
          showToast('¡25 Salma Coins añadidos!');
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
  const $c = document.getElementById('app-content');
  $c.innerHTML = `<div class="sos-area fade-in">
    <div class="sos-spinner">
      <div class="sos-spinner-icon">🆘</div>
      <p class="sos-spinner-text">Enviando aviso de emergencia...</p>
    </div>
  </div>`;
  document.querySelector('.app-input-bar').style.display = 'none';
  currentState = 'sos';

  // Obtener GPS (intenta fresco, usa último conocido como fallback)
  let coords = null;
  try { coords = await getPositionWithTimeout(10000); } catch (_) {}
  if (!coords && lastKnownCoords) coords = lastKnownCoords;

  const contacts = (currentUserSOSConfig?.contacts || []).filter(c => c.phone?.trim());
  const { message } = _buildSOSMessage(coords);

  // Sin internet → encolar
  if (!navigator.onLine) {
    localStorage.setItem(SOS_QUEUE_KEY, JSON.stringify({ contacts, message, timestamp: Date.now() }));
    _renderSOSScreen('offline', contacts, message);
    return;
  }

  // Plan A: Twilio via Worker
  try {
    const res = await fetch(window.SALMA_API + '/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts, message, uid: currentUser.uid })
    });
    if (!res.ok) throw new Error('Worker error ' + res.status);
    const result = await res.json();
    if (result.sent_count > 0) {
      _renderSOSScreen('success', contacts, message, result.sent_count);
      return;
    }
    throw new Error('0 sent');
  } catch (_) {
    // Plan B: WhatsApp
    _renderSOSScreen('whatsapp', contacts, message);
  }
}

function _renderSOSScreen(mode, contacts, message, sentCount) {
  const $c = document.getElementById('app-content');
  const encodedMsg = encodeURIComponent(message);
  const phones = contacts.map(c => c.phone).join(',');

  const waButtons = contacts.map(c => `
    <a class="sos-wa-btn" href="https://wa.me/${c.phone.replace(/\D/g,'')}?text=${encodedMsg}" target="_blank" rel="noopener">
      <span class="sos-wa-icon">🟢</span>
      <span>WhatsApp → ${escapeHTML(c.name || c.phone)}</span>
    </a>`).join('');

  const smsBtn = `<a class="sos-sms-btn" href="sms:${encodeURIComponent(phones)}?body=${encodedMsg}">
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

  $c.innerHTML = `<div class="sos-area fade-in">
    <div class="sos-header">
      <button class="sos-back" id="sos-back">← Volver</button>
      <span class="sos-header-title">🆘 Emergencia</span>
    </div>
    ${body}
    <button class="sos-config-link" id="sos-edit-contacts">Editar contactos de emergencia</button>
  </div>`;

  document.getElementById('sos-back').addEventListener('click', () => {
    document.querySelector('.app-input-bar').style.display = '';
    showState('profile');
  });
  document.getElementById('sos-edit-contacts').addEventListener('click', () => renderSOSConfig());
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
    <p class="sos-config-desc">SMS automático a tus contactos con tu ubicación exacta. Funciona en más de 180 países. Si falla, WhatsApp. Si no tienes datos, SMS directo. Si no tienes señal, lo envía cuando la recuperes.</p>
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

// Formatear mensaje de Salma: escapar HTML + linkificar URLs y teléfonos
function formatMessage(str) {
  let raw = str || '';
  // Extraer imágenes markdown ANTES del escape HTML y guardarlas como placeholders
  const images = [];
  raw = raw.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_, alt, url) => {
    const idx = images.length;
    images.push('<img src="' + url + '" alt="' + alt + '" style="width:100%;max-width:280px;border-radius:8px;margin:6px 0;display:block;" loading="lazy">');
    return '%%IMG' + idx + '%%';
  });

  let html = escapeHTML(raw);
  // URLs → enlaces clicables (onclick fuerza apertura externa en PWA)
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" onclick="window.open(this.href);return false;">$1</a>');
  // Teléfonos internacionales: +XX XXX XXX XXX (con espacios, guiones o puntos)
  html = html.replace(/(\+\d{1,3}[ .-]?\d{1,4}[ .-]?\d{2,4}[ .-]?\d{2,4}[ .-]?\d{0,4})/g, (match) => {
    const clean = match.replace(/[\s.-]/g, '').trim();
    return `<a href="tel:${clean}">${match.trim()}</a>`;
  });
  // **negrita** → <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Restaurar imágenes desde placeholders
  images.forEach((img, i) => { html = html.replace('%%IMG' + i + '%%', img); });
  // Saltos de línea → <br>
  html = html.replace(/\n/g, '<br>');
  return html;
}

// Exponer globalmente
window.showToast = showToast;
window.escapeHTML = escapeHTML;
window.formatMessage = formatMessage;
window.guardarGuia = guardarGuia;
window.currentUser = null;
Object.defineProperty(window, 'currentUser', {
  get: () => currentUser,
  set: (v) => { currentUser = v; }
});

// ═══ INIT ═══
showState('welcome');
