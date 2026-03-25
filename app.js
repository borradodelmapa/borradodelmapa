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
let currentState = 'welcome'; // 'welcome' | 'chat' | 'viajes'

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
  } else if (state === 'viajes') {
    loadUserGuides();
    if (inputBar) inputBar.style.display = 'none';
  } else if (state === 'chat') {
    $input.placeholder = 'Escribe a Salma...';
    if (inputBar) inputBar.style.display = '';
  }
}

function updateHeader() {
  let html = '<button class="app-help-btn" id="btn-help" title="¿Qué puede hacer Salma?">?</button>';
  if (currentUser) {
    const coins = currentUser.coins_saldo || 0;
    html += `<button class="coins-btn" id="btn-coins" title="Salma Coins"><span class="coins-icon-circle">S</span> ${coins}</button>`;
    const initial = (currentUser.name || currentUser.email || 'V')[0].toUpperCase();
    html += `<div class="app-avatar" id="btn-avatar" title="Mis Viajes">${escapeHTML(initial)}</div>`;
  } else {
    html += `<div class="app-avatar" id="btn-avatar" title="Entrar">✦</div>`;
  }
  $headerActions.innerHTML = html;

  const btnAvatar = document.getElementById('btn-avatar');
  if (btnAvatar) btnAvatar.addEventListener('click', handleAvatarClick);

  const btnCoins = document.getElementById('btn-coins');
  if (btnCoins) btnCoins.addEventListener('click', openCoinsModal);

  const btnHelp = document.getElementById('btn-help');
  if (btnHelp) btnHelp.addEventListener('click', () => {
    document.getElementById('salma-info-overlay').style.display = 'flex';
  });
}

function handleAvatarClick() {
  if (currentUser) {
    if (currentState === 'viajes') {
      if (confirm('¿Cerrar sesión?')) logout();
    } else {
      showState('viajes');
    }
  } else {
    window._afterLogin = 'viajes';
    openModal('login');
  }
}

// ═══ WELCOME (estado 1) ═══

async function renderWelcome() {
  const defaultChips = `<div class="welcome-chips-loading"></div>`;

  $content.innerHTML = `
    <div class="welcome-hero fade-in">
      <div class="welcome-bg"></div>
      <div class="welcome-content">
        <div class="welcome-label">SALMA · AI TRAVEL COPILOT</div>
        <h1 class="welcome-title">Tu próximo<br>viaje empieza<br><em>aquí</em></h1>
        <div class="welcome-claim">Escribe destino + días y sal con ruta lista</div>
        <div class="welcome-input-wrap">
          <div class="input-row">
            <textarea class="welcome-input" id="welcome-input" placeholder="Vietnam 10 días en moto" rows="1"></textarea>
            <button class="app-mic welcome-mic" id="welcome-mic-btn" aria-label="Hablar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="1" width="6" height="12" rx="3"/>
                <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
          </div>
          <button class="welcome-send" id="welcome-send">Planear viaje ›</button>
        </div>
        <div class="welcome-spacer"></div>
        <div class="welcome-chips" id="welcome-chips">
          ${defaultChips}
        </div>

        <div class="legal-links">
          <a href="/legal.html#aviso-legal">Aviso legal</a>
          <a href="/legal.html#privacidad">Privacidad</a>
          <a href="/legal.html#cookies">Cookies</a>
          <a href="/legal.html#terminos">Términos</a>
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

  // Placeholder rotativo
  if (wInput) {
    const ejemplos = [
      'Vietnam 10 días en moto',
      '3 días en Ronda con niños',
      'Andalucía 7 días en familia',
      'Tailandia 15 días mochilero',
      'Ruta por los pueblos blancos',
      'Japón 2 semanas primer viaje',
      'Transpirenaica en camper',
      'Costa Amalfitana 4 días en coche',
      'Marruecos 5 días desde Tánger',
      'Islandia Ring Road 10 días'
    ];
    let idx = 0;
    window._placeholderInterval = setInterval(() => {
      if (wInput.value) return;
      idx = (idx + 1) % ejemplos.length;
      wInput.placeholder = ejemplos[idx];
    }, 3000);
  }

  const chipsEl = document.getElementById('welcome-chips');
  let loaded = false;

  // Si hay usuario, intentar cargar sus últimas guías
  if (currentUser && chipsEl) {
    try {
      const snap = await db.collection('users').doc(currentUser.uid)
        .collection('maps').orderBy('createdAt', 'desc').limit(3).get();
      if (!snap.empty) {
        let chipsHtml = '';
        snap.forEach(doc => {
          const d = doc.data();
          chipsHtml += `<div class="chip chip-saved" data-doc-id="${doc.id}">${escapeHTML(d.nombre || 'Mi ruta')}</div>`;
        });
        chipsEl.innerHTML = chipsHtml;
        loaded = true;

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
      }
    } catch (_) {}
  }

  // Si no hay guías del usuario, cargar guías destacadas (featured)
  if (!loaded && chipsEl) {
    try {
      const snap = await db.collection('public_guides')
        .where('featured', '==', true).limit(3).get();
      if (!snap.empty) {
        let chipsHtml = '';
        snap.forEach(doc => {
          const d = doc.data();
          chipsHtml += `<div class="chip chip-featured" data-slug="${doc.id}">${escapeHTML(d.nombre || 'Ruta')}</div>`;
        });
        chipsEl.innerHTML = chipsHtml;

        chipsEl.querySelectorAll('.chip-featured').forEach(chip => {
          chip.addEventListener('click', () => {
            window.location.href = '/' + chip.dataset.slug;
          });
        });
      } else {
        // Fallback si no hay featured todavía
        chipsEl.innerHTML = `
          <div class="chip" data-msg="Vietnam 15 días mochilero">Vietnam 15 días</div>
          <div class="chip" data-msg="Andalucía 7 días en familia">Andalucía en familia</div>
          <div class="chip" data-msg="Tailandia 10 días mochilero">Tailandia mochilero</div>`;
        chipsEl.querySelectorAll('.chip').forEach(chip => {
          chip.addEventListener('click', () => {
            const msg = chip.dataset.msg;
            if (msg && typeof salma !== 'undefined') salma.send(msg);
          });
        });
      }
    } catch (_) {
      chipsEl.innerHTML = '';
    }
  }
}

// ═══ MIS VIAJES (estado 3) ═══

async function loadUserGuides() {
  if (!currentUser) { showState('welcome'); return; }

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
    snap.forEach(doc => {
      const d = doc.data();
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
      // Click en la tarjeta → abrir guía o página de destino
      card.addEventListener('click', (e) => {
        if (e.target.closest('.viaje-card-delete')) return;
        // Guías light (de KV) → abrir página de destino
        if (d.source === 'kv-nivel2' && d.slug) {
          window.location.href = '/destinos/' + d.slug + '.html';
          return;
        }
        if (typeof salma !== 'undefined') salma.cargarGuia(doc.id, d);
      });
      // Click en borrar
      card.querySelector('.viaje-card-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('¿Eliminar esta guía?')) return;
        try {
          // Borrar guía pública si existe
          const slug = d.slug;
          if (slug) {
            await db.collection('public_guides').doc(slug).delete();
          }
          await db.collection('users').doc(currentUser.uid).collection('maps').doc(doc.id).delete();
          card.remove();
          showToast('Guía eliminada');
        } catch (err) {
          showToast('Error al eliminar');
        }
      });
      grid.appendChild(card);
    });
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

// ═══ AUTH — Modal ═══

function openModal(view) {
  const modal = document.getElementById('modal-auth');
  if (modal) modal.classList.add('active');
  switchModalView(view || 'login');
}

function closeModal() {
  const modal = document.getElementById('modal-auth');
  if (modal) modal.classList.remove('active');
  // Reset
  ['login-email','login-pass','register-name','register-email','register-pass'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['login-error','register-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.remove('show'); }
  });
}

function switchModalView(view) {
  const login = document.getElementById('modal-login-view');
  const register = document.getElementById('modal-register-view');
  if (login) login.classList.toggle('hidden', view !== 'login');
  if (register) register.classList.toggle('hidden', view !== 'register');
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

    // Si venía de un intento de ver Mis Viajes sin login
    if (window._afterLogin === 'viajes') {
      window._afterLogin = null;
      showState('viajes');
    } else if (currentState === 'welcome') {
      // Logueado → ir directo a Mis Viajes
      showState('viajes');
    }
  } else {
    currentUser = null;
    updateHeader();
  }
});

// ═══ GUARDAR GUÍA ═══

async function guardarGuia(routeData) {
  if (!currentUser) {
    // Registro lazy
    window._salmaLastRoute = routeData;
    localStorage.setItem('_salmaRouteBackup', JSON.stringify(routeData));
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

// ═══ MODAL — Event listeners ═══

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('btn-login')?.addEventListener('click', doLogin);
document.getElementById('btn-register')?.addEventListener('click', doRegister);
document.getElementById('btn-google-login')?.addEventListener('click', doGoogleLogin);
document.getElementById('btn-google-register')?.addEventListener('click', doGoogleLogin);
document.getElementById('switch-to-register')?.addEventListener('click', () => switchModalView('register'));
document.getElementById('switch-to-login')?.addEventListener('click', () => switchModalView('login'));

// Enter en inputs de login
document.getElementById('login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('register-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

// Logo → welcome
document.getElementById('app-logo')?.addEventListener('click', () => {
  if (typeof salma !== 'undefined') salma.reset();
  showState('welcome');
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
        <div class="stripe-test-badge">MODO PRUEBA · no se cobrará</div>
      </div>
      <div id="stripe-loading" class="stripe-loading" style="display:none">
        <div class="stripe-spinner"></div>
        <span>Procesando pago...</span>
      </div>
      <div id="stripe-success" class="stripe-success" style="display:none">
        ✓ ¡25 coins añadidos a tu cuenta!
      </div>

      <!-- Pack -->
      <div class="coins-modal-plan">
        <div class="coins-modal-plan-row">
          <div>
            <div class="coins-modal-plan-name">Pack Viajero</div>
            <div class="coins-modal-plan-note">25 coins · no caducan</div>
          </div>
          <button class="coins-modal-pay" id="coins-pay-btn" disabled>9,99€</button>
        </div>
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
        // 3. Actualizar saldo local
        currentUser.coins_saldo = (currentUser.coins_saldo || 0) + 25;
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
  // URLs → enlaces clicables
  html = html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
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
