// ===== AUTH MODAL — disponible inmediatamente, fuera de window.onload =====
function openModal(view) {
  var modal = document.getElementById("modal-auth");
  if (modal) modal.classList.add("active");
  switchModal(view);
}
function closeModal() {
  var modal = document.getElementById("modal-auth");
  if (modal) modal.classList.remove("active");
}
function switchModal(view) {
  var login = document.getElementById("modal-login-view");
  var register = document.getElementById("modal-register-view");
  if (login) login.style.display = view === "login" ? "block" : "none";
  if (register) register.style.display = view === "register" ? "block" : "none";
}
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;

// Firebase ya inicializado en index.html - solo referencias
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

window._fbAuth = auth;
window._fbDb = db;
window._fbGoogleProvider = googleProvider;

// Manejar retorno de signInWithRedirect
auth.getRedirectResult().then(function(result) {
  if (!result || !result.user) return;
  var user = result.user;
  db.collection("users").doc(user.uid).get().then(function(doc) {
    if (!doc.exists) {
      db.collection("users").doc(user.uid).set({
        name: user.displayName || user.email.split("@")[0],
        email: user.email, isPremium: false, mapsCount: 0, createdAt: new Date().toISOString()
      }).catch(function(e) { console.warn('Could not create user doc:', e); });
    }
  });
}).catch(function(e) { console.error('Redirect result error:', e.code, e.message); });

let currentUser = null;
let isPremium = false;
let map = null;
let markers = [];
let polyline = null;

const POIS_DEMO = [
  {id:1, name:"Puente Long Bien", type:"🏛️", note:"Icono colonial francés. Mejor al amanecer.", day:1, lat:21.044, lng:105.852},
  {id:2, name:"Pho Thin Bo Ho", type:"🍜", note:"El mejor pho de Hanoi. Abre desde las 6am.", day:1, lat:21.028, lng:105.849},
  {id:3, name:"Hoan Kiem Lake", type:"📸", note:"El lago del espada. Paseo nocturno imprescindible.", day:1, lat:21.028, lng:105.852},
  {id:4, name:"Bun Bo Nam Bo", type:"🍜", note:"Fideos con ternera. Local sin turistas.", day:1, lat:21.031, lng:105.848},
  {id:5, name:"Ho Chi Minh Mausoleum", type:"🏛️", note:"Llegar pronto, colas desde las 8am.", day:2, lat:21.037, lng:105.835},
  {id:6, name:"Old Quarter", type:"🏛️", note:"36 calles de artesanos. Perderse es el plan.", day:2, lat:21.033, lng:105.850},
  {id:7, name:"Bia Hoi Corner", type:"🍜", note:"Cerveza a 25 céntimos. Esquina más famosa de Asia.", day:2, lat:21.034, lng:105.851},
  {id:8, name:"Dong Van Geopark", type:"🏛️", note:"Patrimonio UNESCO. Paisaje lunar.", day:3, lat:23.278, lng:105.362},
  {id:9, name:"Ma Pi Leng Pass", type:"📸", note:"El paso de montaña más espectacular de Vietnam.", day:3, lat:23.165, lng:105.354},
  {id:10, name:"Lung Cu Flag Tower", type:"📸", note:"El punto más al norte de Vietnam.", day:3, lat:23.366, lng:105.334},
  {id:11, name:"Trang An", type:"🏖️", note:"Kayak entre karsts. Reservar con antelación.", day:4, lat:20.253, lng:105.975},
  {id:12, name:"Mua Cave", type:"📸", note:"500 escalones. Las vistas valen cada uno.", day:4, lat:20.218, lng:105.974},
  {id:13, name:"Ninh Binh Local Resto", type:"🍜", note:"Cabra de montaña y arroz. Especialidad local.", day:4, lat:20.253, lng:105.975},
  {id:14, name:"Phong Nha Cave", type:"🏖️", note:"Cueva navegable en barca. Impresionante.", day:5, lat:17.599, lng:106.142},
  {id:15, name:"Hang En Cave", type:"🏖️", note:"3ª cueva más grande del mundo. Trek 2 días.", day:5, lat:17.551, lng:106.081},
  {id:16, name:"Hue Imperial City", type:"🏛️", note:"Ciudad prohibida vietnamita. Medio día.", day:6, lat:16.469, lng:107.578},
  {id:17, name:"Thien Mu Pagoda", type:"🏛️", note:"La pagoda más antigua de Hue.", day:6, lat:16.453, lng:107.546},
  {id:18, name:"Bun Bo Hue", type:"🍜", note:"La sopa más picante de Vietnam. Origen aquí.", day:6, lat:16.463, lng:107.590},
  {id:19, name:"Hoi An Ancient Town", type:"🏛️", note:"Casco antiguo UNESCO. Por la tarde con las linternas.", day:7, lat:15.880, lng:108.338},
  {id:20, name:"An Bang Beach", type:"🏖️", note:"La mejor playa cerca de Hoi An.", day:7, lat:15.920, lng:108.373},
  {id:21, name:"White Rose Restaurant", type:"🍜", note:"Especialidad local: banh bao vac.", day:7, lat:15.877, lng:108.329},
  {id:22, name:"Marble Mountains", type:"🏛️", note:"Cuevas y pagodas en montañas de mármol.", day:8, lat:16.003, lng:108.263},
  {id:23, name:"My Khe Beach", type:"🏖️", note:"Forbes la eligió top 6 del mundo.", day:8, lat:16.060, lng:108.247},
  {id:24, name:"Po Nagar Towers", type:"🏛️", note:"Torres cham del siglo VII.", day:9, lat:12.265, lng:109.194},
  {id:25, name:"Nha Trang Beach", type:"🏖️", note:"La bahía más bonita de Vietnam.", day:9, lat:12.238, lng:109.197},
  {id:26, name:"Red Sand Dunes", type:"📸", note:"Dunas de arena roja. Al atardecer.", day:10, lat:10.947, lng:108.286},
  {id:27, name:"Fairy Stream", type:"🏖️", note:"Paseo descalzo por el arroyo entre dunas.", day:10, lat:10.933, lng:108.272},
  {id:28, name:"Cu Chi Tunnels", type:"🏛️", note:"270km de túneles de la guerra. Imprescindible.", day:11, lat:11.135, lng:106.462},
  {id:29, name:"Ben Thanh Market", type:"🍜", note:"El mercado más famoso de Saigon.", day:11, lat:10.772, lng:106.698},
  {id:30, name:"War Remnants Museum", type:"🏛️", note:"El museo más impactante que verás.", day:12, lat:10.779, lng:106.692},
];

let poiList = [...POIS_DEMO];
let nextPoiId = 100;

const ROUTE_COORDS = [
  [21.028,105.834],[23.278,105.362],[20.253,105.975],[17.551,106.081],
  [16.463,107.590],[15.880,108.338],[16.060,108.247],[12.238,109.197],
  [10.947,108.286],[10.772,106.698],
];

auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Leer doc de usuario (no bloquear si falla)
    let userData = {};
    try {
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists) userData = userDoc.data();
    } catch(e) {
      console.warn("No se pudo leer el doc de usuario (reglas Firestore?):", e.code, e.message);
    }

    currentUser = {
      uid: user.uid,
      name: userData.name || user.displayName || (user.email ? user.email.split("@")[0] : 'Viajero'),
      email: user.email || '',
      isPremium: userData.isPremium || false,
      bio: userData.bio || '',
      country: userData.country || '',
      photo: userData.photo || ''
    };
    isPremium = currentUser.isPremium;
    updateNavForUser(currentUser);
    updateSidebar(currentUser);
    const mobileNav = document.getElementById("mobile-dash-nav");
    if (mobileNav) mobileNav.style.display = "flex";
    injectProfilePanel();
    injectCuadernoPanel();
    // Restaurar ruta desde localStorage si viene de redirect de Google
    if (!window._salmaLastRoute) {
      try {
        var _backup = localStorage.getItem('_salmaRouteBackup');
        if (_backup) { window._salmaLastRoute = JSON.parse(_backup); }
      } catch(e) {}
    }
    var _hasPendingRoute = !!(window._salmaLastRoute && window._salmaLastRoute.stops);
    if (_hasPendingRoute) {
      salmaShowModalSaving();
    } else {
      closeModal();
    }

    if (_hasPendingRoute) {
      try {
        const r = window._salmaLastRoute;
        const numDias = r.duration_days ? Number(r.duration_days) : (r.stops ? [...new Set(r.stops.map(s => s.day||1))].length : 0);
        const destino = (r.region || r.country || '').toString();
        let coverImageUrl = '';
        if (destino) {
          try {
            const stops = r.stops || [];
            const firstValidStop = stops.find(s => s && s.lat && s.lng && Math.abs(s.lat) > 0.01 && Math.abs(s.lng) > 0.01);
            const coverLat = firstValidStop ? firstValidStop.lat : '';
            const coverLng = firstValidStop ? firstValidStop.lng : '';
            const coverPhotoUrl = 'https://salma-api.paco-defoto.workers.dev/photo?name=' + encodeURIComponent(destino) + '&json=1'
              + (coverLat && coverLng ? '&lat=' + coverLat + '&lng=' + coverLng : '');
            const photoJsonRes = await fetch(coverPhotoUrl);
            if (photoJsonRes.ok) {
              const photoJsonData = await photoJsonRes.json();
              coverImageUrl = photoJsonData.url || '';
            }
          } catch(e) {}
        }
        const ruta = {
          nombre: r.title || r.name || 'Mi ruta',
          destino: destino,
          num_dias: numDias,
          dias: numDias,
          notas: r.summary || '',
          cover_image: coverImageUrl,
          itinerarioIA: JSON.stringify(r),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          published: false
        };
        await db.collection('users').doc(user.uid).collection('maps').add(ruta);
        window._salmaLastRoute = null;
        localStorage.removeItem('_salmaRouteBackup');
        showToast('¡Bienvenido! Tu ruta se ha guardado automáticamente ✓');
      } catch(saveErr) {
        console.error('Error al guardar ruta automáticamente:', saveErr.code, saveErr.message);
        showToast('No se pudo guardar la ruta: ' + (saveErr.message || saveErr.code || 'Error desconocido'));
      } finally {
        var _sv = document.getElementById('modal-saving-view');
        if (_sv) _sv.style.display = 'none';
        var _cb = document.querySelector('#modal-auth .modal-close');
        if (_cb) _cb.style.display = '';
        closeModal();
      }
    }

    try {
      await loadUserMaps();
    } catch(e) {
      console.warn("No se pudieron cargar los mapas:", e.code, e.message);
    }

    const currentPage = document.querySelector('.page.active');
    if (!currentPage || currentPage.id === 'page-home') {
      showPage('dashboard');
    }
  } else {
    currentUser = null;
    isPremium = false;
    updateNavForGuest();
  }
});

function showPage(name) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
    p.style.display = "none";
  });
  const target = document.getElementById("page-" + name);
  if (target) {
    target.classList.add("active");
    target.style.display = "block";
  }
  const mobileNav = document.getElementById("mobile-dash-nav");
  if (mobileNav) mobileNav.style.display = currentUser ? "flex" : "none";
  window.scrollTo(0,0);
}
window.showPage = showPage;

const GITHUB_USER = "borradodelmapa";
const GITHUB_REPO = "borradodelmapa";
const BLOG_PATH = "blog";

async function loadBlog() {
  const list = document.getElementById("blog-list");
  const post = document.getElementById("blog-post");
  list.style.display = "grid";
  post.style.display = "none";
  list.innerHTML = `<div style="font-family:'Space Mono',monospace;font-size:11px;color:var(--crema);opacity:.5;">Cargando artículos...</div>`;
  try {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${BLOG_PATH}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("no blog");
    const files = await res.json();
    const articles = files.filter(f => f.name.endsWith(".md") || f.name.endsWith(".txt"));
    if (articles.length === 0) {
      list.innerHTML = `<div style="color:var(--crema);opacity:.5;font-size:18px;">Pronto habrá artículos aquí. Síguenos en <a href="https://instagram.com/borradodelmapa" target="_blank" style="color:var(--dorado);">@borradodelmapa</a></div>`;
      return;
    }
    list.innerHTML = articles.map(f => {
      const title = f.name.replace(".md","").replace(".txt","").replace(/-/g," ");
      return `<div onclick="loadBlogPost('${f.download_url}','${title}')" style="background:var(--gris);border:1px solid var(--gris2);padding:28px;cursor:pointer;transition:border-color .2s;" onmouseover="this.style.borderColor='var(--dorado)'" onmouseout="this.style.borderColor='var(--gris2)'">
        <div style="font-family:'Inter Tight',sans-serif;font-size:22px;color:var(--blanco);margin-bottom:8px;text-transform:capitalize;">${title}</div>
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--dorado);letter-spacing:1px;">LEER ARTÍCULO →</div>
      </div>`;
    }).join("");
  } catch(e) {
    list.innerHTML = `<div style="color:var(--crema);opacity:.5;font-size:18px;">Pronto habrá artículos aquí. Síguenos en <a href="https://instagram.com/borradodelmapa" target="_blank" style="color:var(--dorado);">@borradodelmapa</a></div>`;
  }
}

async function loadBlogPost(url, title) {
  const list = document.getElementById("blog-list");
  const post = document.getElementById("blog-post");
  const content = document.getElementById("blog-post-content");
  list.style.display = "none";
  post.style.display = "block";
  content.innerHTML = `<div style="font-family:'Space Mono',monospace;font-size:11px;color:var(--crema);opacity:.5;">Cargando...</div>`;
  try {
    const res = await fetch(url);
    const raw = await res.text();
    const safeTitle = title.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const safeText = raw.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    content.innerHTML = `
      <div style="font-family:'Inter Tight',sans-serif;font-size:36px;color:var(--blanco);margin-bottom:32px;text-transform:capitalize;">${safeTitle}</div>
      <div style="color:var(--crema);line-height:1.9;font-size:15px;opacity:.85;white-space:pre-wrap;">${safeText}</div>`;
  } catch(e) {
    content.innerHTML = `<div style="color:var(--crema);opacity:.5;">Error cargando el artículo.</div>`;
  }
}

function closeBlogPost() {
  document.getElementById("blog-list").style.display = "grid";
  document.getElementById("blog-post").style.display = "none";
}

const origShowPage = showPage;
window.showPage = function(name) {
  origShowPage(name);
  if (name === "blog") loadBlog();
};
window.closeBlogPost = closeBlogPost;

document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".page").forEach(p => {
    if (!p.classList.contains("active")) p.style.display = "none";
  });
});

async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;
  const err = document.getElementById("login-error");
  if (!email || !pass) { showError(err, "Rellena email y contrasena"); return; }
  try {
    showToast("Entrando...");
    await auth.signInWithEmailAndPassword(email, pass);
    closeModal();
    showPage("dashboard");
  } catch(e) {
    const msgs = {
      "auth/user-not-found": "No existe cuenta con ese email",
      "auth/wrong-password": "Contrasena incorrecta",
      "auth/invalid-email": "Email no valido",
      "auth/invalid-credential": "Email o contrasena incorrectos"
    };
    showError(err, msgs[e.code] || "Error al iniciar sesion");
  }
}
window.doLogin = doLogin;

async function doRegister() {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-pass").value;
  const err = document.getElementById("register-error");
  if (!name || !email || !pass) { showError(err, "Rellena todos los campos"); return; }
  if (pass.length < 6) { showError(err, "Contrasena minimo 6 caracteres"); return; }
  try {
    showToast("Creando cuenta...");
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({ displayName: name });
    try {
      await db.collection("users").doc(cred.user.uid).set({
        name, email, isPremium: false, mapsCount: 0, createdAt: new Date().toISOString()
      });
    } catch(dbErr) {
      console.warn("Firestore no disponible:", dbErr);
    }
    closeModal();
    showPage("dashboard");
  } catch(e) {
    const msgs = {
      "auth/email-already-in-use": "Ya existe cuenta con ese email",
      "auth/weak-password": "Contrasena demasiado debil",
      "auth/invalid-email": "Email no valido"
    };
    showError(err, msgs[e.code] || "Error al crear cuenta");
  }
}
window.doRegister = doRegister;

function doSocialLogin() {
  showToast("Conectando con Google...");
  auth.signInWithPopup(googleProvider).then(function(result) {
    var user = result.user;
    db.collection("users").doc(user.uid).get().then(function(doc) {
      if (!doc.exists) {
        db.collection("users").doc(user.uid).set({
          name: user.displayName || user.email.split("@")[0],
          email: user.email, isPremium: false, mapsCount: 0, createdAt: new Date().toISOString()
        }).catch(function(e) { console.warn('No se pudo crear doc usuario:', e); });
      }
    });
  }).catch(function(e) {
    if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
    console.error("Google login error:", e.code, e.message);
    showToast("Error al conectar con Google: " + (e.message || e.code));
  });
}
window.doSocialLogin = doSocialLogin;

async function logout() {
  await auth.signOut();
  showPage("home");
  showToast("Sesion cerrada");
}
window.logout = logout;

function updateNavForUser(user) {
  document.getElementById("nav-links-guest").style.display = "none";
  document.getElementById("nav-links-user").style.display = "flex";
  document.getElementById("nav-avatar").textContent = (user.name||"U")[0].toUpperCase();
}
function updateNavForGuest() {
  document.getElementById("nav-links-guest").style.display = "flex";
  document.getElementById("nav-links-user").style.display = "none";
}
function updateSidebar(user) {
  document.getElementById("sidebar-name").textContent = user.name;
  document.getElementById("sidebar-avatar").textContent = (user.name||"U")[0].toUpperCase();
  document.getElementById("sidebar-plan").textContent = user.isPremium ? "Plan Premium" : "Plan Gratuito";
  document.getElementById("profile-name-input").value = user.name || "";
  document.getElementById("profile-country-input").value = user.country || "";
  document.getElementById("profile-bio-input").value = user.bio || "";
  document.getElementById("profile-display-name").textContent = user.name || "Viajero";
  document.getElementById("profile-display-email").textContent = user.email || "";
  document.getElementById("profile-avatar-big").textContent = (user.name||"U")[0].toUpperCase();
  showToast("Bienvenido, " + user.name + "!");
}

async function loadUserMaps() {
  if (!currentUser) return;
  try {
    const mapsRef = db.collection("users").doc(currentUser.uid).collection("maps");
    const snap = await mapsRef.get();
    const maps = [];
    snap.forEach(d => maps.push({id: d.id, ...d.data()}));
    renderMapsGrid(maps);
  } catch(e) {
    console.error("Error loading maps:", e);
  }
}
window.loadUserMaps = loadUserMaps;

function salmaShowModalSaving() {
  var modal = document.getElementById('modal-auth');
  if (!modal) return;
  modal.classList.add('active');
  var loginView = document.getElementById('modal-login-view');
  var regView = document.getElementById('modal-register-view');
  var savingView = document.getElementById('modal-saving-view');
  var closeBtn = modal.querySelector('.modal-close');
  if (loginView) loginView.style.display = 'none';
  if (regView) regView.style.display = 'none';
  if (savingView) savingView.style.display = 'block';
  if (closeBtn) closeBtn.style.display = 'none';
  var avatarImg = document.getElementById('modal-saving-avatar');
  if (avatarImg && window.SALMA_AVATAR_SRC) avatarImg.src = window.SALMA_AVATAR_SRC;
}
window.salmaShowModalSaving = salmaShowModalSaving;

function renderMapsGrid(maps) {
  const grid = document.getElementById("maps-grid-dynamic");
  if (!grid) return;
  // Ordenar por fecha de creación descendente (más nuevas primero)
  maps = maps.slice().sort(function(a, b) {
    var da = a.createdAt || a.updated_at || '';
    var db = b.createdAt || b.updated_at || '';
    return db.localeCompare(da);
  });
  const el = document.getElementById('profile-routes-count');
  if (el) el.textContent = maps.length;
  const destPhoto = (d='') => {
    d = d.toLowerCase();
    if (d.includes('vietnam')) return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=200&fit=crop&q=75';
    if (d.includes('japon') || d.includes('japan') || d.includes('japón')) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop&q=75';
    if (d.includes('tailandia') || d.includes('thailand')) return 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=200&fit=crop&q=75';
    if (d.includes('islandia') || d.includes('iceland')) return 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=200&fit=crop&q=75';
    if (d.includes('marruecos') || d.includes('morocco')) return 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&h=200&fit=crop&q=75';
    if (d.includes('españa') || d.includes('spain') || d.includes('andaluc')) return 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400&h=200&fit=crop&q=75';
    if (d.includes('italia') || d.includes('italy')) return 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=200&fit=crop&q=75';
    if (d.includes('portugal')) return 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop&q=75';
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop&q=75';
  };
  let html = maps.map(m => {
    const photo = m.cover_image || destPhoto(m.destino || m.country || m.nombre || '');
    const name = (m.nombre || m.title || 'Mi ruta').replace(/</g,'&lt;');
    const diasNum = Array.isArray(m.dias) ? m.dias.length : (m.dias||m.num_dias||m.days||0);
    const meta = diasNum + ' días · ' + (m.destino||m.country||'Destino');
    const desc = m.desc ? m.desc.substring(0,80).replace(/</g,'&lt;') + (m.desc.length>80?'...':'') : '';
    return `
    <div class="map-card" style="position:relative;cursor:pointer;overflow:hidden;" onclick="verRuta('${m.id}','${name.replace(/'/g,"\\'")}')">
      <div style="height:140px;background:url('${photo}') center/cover;position:relative;">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,#111 0%,rgba(17,17,17,.2) 60%,transparent 100%);"></div>
      </div>
      <div class="map-card-body">
        <div class="map-card-title">${name}</div>
        <div class="map-card-meta">${meta}</div>
        ${desc ? `<div style="font-size:12px;color:rgba(245,240,232,.6);margin-bottom:8px;line-height:1.5;">${desc}</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:8px;" onclick="event.stopPropagation()">
          <button onclick="eliminarRuta('${m.id}')" style="background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:10px;color:rgba(245,240,232,.5);padding:6px 12px;font-family:'JetBrains Mono',monospace;font-size:9px;cursor:pointer;letter-spacing:.1em;transition:all .2s;" onmouseover="this.style.borderColor='#f87171';this.style.color='#f87171'" onmouseout="this.style.borderColor='rgba(212,160,23,.2)';this.style.color='rgba(245,240,232,.5)'">BORRAR</button>
        </div>
      </div>
    </div>`;
  }).join("");
  html += `<div class="map-card map-card-new" onclick="newMap()" style="cursor:pointer;min-height:260px;">
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;padding:40px 20px;">
      <div style="font-size:36px;opacity:.6;">＋</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--crema);opacity:.5;text-align:center;letter-spacing:.14em;">NUEVA RUTA</div>
    </div>
  </div>`;
  if (maps.length === 0) {
    html = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
      <div style="font-size:48px;margin-bottom:16px;">🌍</div>
      <div style="font-family:'Inter Tight',sans-serif;font-size:28px;font-weight:700;color:#fff;margin-bottom:8px;">Tu primera aventura empieza aquí</div>
      <div style="font-size:15px;color:rgba(245,240,232,.65);line-height:1.7;max-width:440px;margin:0 auto 24px;">Cuéntale a Salma adónde quieres ir y ella te monta la ruta completa.</div>
      <button onclick="newMap()" style="background:#d4a017;color:#0a0908;border:none;border-radius:14px;padding:16px 32px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.14em;cursor:pointer;" onmouseover="this.style.background='#e0b84a'" onmouseout="this.style.background='#d4a017'">CREAR MI PRIMERA RUTA →</button>
    </div>`;
  }
  grid.innerHTML = html;
}

async function eliminarRuta(id) {
  if (!currentUser || !id) return;
  if (!confirm('¿Borrar esta ruta?')) return;
  try {
    await db.collection('users').doc(currentUser.uid).collection('maps').doc(id).delete();
    showToast('Ruta eliminada');
    loadUserMaps();
    // Decrementar contador global
    try {
      db.collection('stats').doc('global').set(
        { totalRoutes: firebase.firestore.FieldValue.increment(-1) },
        { merge: true }
      ).then(function() {
        if (typeof window.loadGlobalStats === 'function') window.loadGlobalStats();
      }).catch(function() {});
    } catch(e2) {}
  } catch(e) {
    showToast('Error al eliminar');
  }
}
window.eliminarRuta = eliminarRuta;

function newMap() {
  if (!currentUser) { openModal('register'); return; }
  // Limpiar conversación anterior antes de ir al home
  if (typeof salmaReset === 'function') salmaReset();
  showPage('home');
  setTimeout(function() {
    var input = document.getElementById('salma-hero-input');
    if (input) { input.focus(); input.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, 100);
}
window.newMap = newMap;

async function crearRuta() { newMap(); }
window.crearRuta = crearRuta;
async function generarRutaConIA() { newMap(); }
window.generarRutaConIA = generarRutaConIA;

async function saveProfile() {
  const name = document.getElementById("profile-name-input").value.trim();
  const country = document.getElementById("profile-country-input").value.trim();
  const bio = document.getElementById("profile-bio-input").value.trim();
  if (!name) { showToast('El nombre no puede estar vacío'); return; }
  if (!currentUser) { showToast('No hay sesión activa'); return; }
  try {
    await db.collection("users").doc(currentUser.uid).update({ name, country, bio });
    await auth.currentUser.updateProfile({ displayName: name });
    currentUser.name = name;
    currentUser.country = country;
    currentUser.bio = bio;
    document.getElementById("sidebar-name").textContent = name;
    document.getElementById("nav-avatar").textContent = name[0].toUpperCase();
    document.getElementById("profile-display-name").textContent = name;
    document.getElementById("profile-avatar-big").textContent = name[0].toUpperCase();
    showToast("Perfil actualizado ✓");
  } catch(e) {
    showToast("Error: " + e.message);
  }
}
window.saveProfile = saveProfile;

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
window.toggleUserMenu = toggleUserMenu;

function verRuta(id, nombre) {
  if (!currentUser) return;
  var oldModal = document.getElementById('modal-editar-ruta');
  if (oldModal) oldModal.style.display = 'none';
  db.collection('users').doc(currentUser.uid).collection('maps').doc(id).get().then(doc => {
    if (!doc.exists) return;
    const r = doc.data();
    const container = document.getElementById('ruta-view-container');
    if (!container) return;
    var routeData = null;
    if (r.itinerarioIA) { try { routeData = JSON.parse(r.itinerarioIA); } catch(e) {} }
    var pois = [];
    if (routeData && routeData.stops && routeData.stops.length > 0) pois = routeData.stops;
    else if (r.pois && r.pois.length > 0) pois = r.pois;
    var typeIcons = {city:'🏙',town:'🏘',nature:'🌿',beach:'🏖',mountain:'⛰',temple:'🛕',viewpoint:'📸',route:'🛤',activity:'🎯',other:'📍',lugar:'📍',hotel:'🏨',restaurante:'🍜',experiencia:'🎯',mirador:'📸',ruta:'🛤'};
    var stopsHTML = '';
    var mapPois = [];
    var vrCountry = routeData && (routeData.country || routeData.region) ? (routeData.country || routeData.region) : '';

    // Google Maps global para la ruta completa
    var vrGmapsUrl = '';
    if (pois.length > 0) {
      var vrAllPois = pois.filter(function(p) { return p.lat && p.lng && Number(p.lat) && Number(p.lng); });
      if (vrAllPois.length >= 2) {
        var vrN0 = (vrAllPois[0].headline || vrAllPois[0].name || '').toString().trim();
        var vrNLast = (vrAllPois[vrAllPois.length - 1].headline || vrAllPois[vrAllPois.length - 1].name || '').toString().trim();
        var vrOrigin = (vrN0 && vrCountry) ? encodeURIComponent(vrN0 + ' ' + vrCountry) : (vrAllPois[0].lat + ',' + vrAllPois[0].lng);
        var vrDest = (vrNLast && vrCountry) ? encodeURIComponent(vrNLast + ' ' + vrCountry) : (vrAllPois[vrAllPois.length - 1].lat + ',' + vrAllPois[vrAllPois.length - 1].lng);
        var vrWp = vrAllPois.slice(1, -1).map(function(p) { var n = (p.headline || p.name || '').toString().trim(); return n && vrCountry ? encodeURIComponent(n + ' ' + vrCountry) : (p.lat + ',' + p.lng); }).join('|');
        vrGmapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + vrOrigin + '&destination=' + vrDest + (vrWp ? '&waypoints=' + vrWp : '') + '&travelmode=driving';
      } else if (vrAllPois.length === 1) {
        var vrN = (vrAllPois[0].headline || vrAllPois[0].name || '').toString().trim();
        vrGmapsUrl = (vrN && vrCountry) ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(vrN + ' ' + vrCountry)) : ('https://www.google.com/maps?q=' + vrAllPois[0].lat + ',' + vrAllPois[0].lng);
      }
    }

    if (pois.length > 0) {
      pois.forEach(function(p) { if (p.lat && p.lng && Number(p.lat) && Number(p.lng)) mapPois.push(p); });

      var vrDayGroups = {};
      var vrDayOrder = [];
      pois.forEach(function(stop) {
        var d = stop.day || 1;
        if (!vrDayGroups[d]) { vrDayGroups[d] = []; vrDayOrder.push(d); }
        vrDayGroups[d].push(stop);
      });
      vrDayOrder.sort(function(a, b) { return a - b; });

      stopsHTML = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:12px;">ITINERARIO · ' + pois.length + ' EXPERIENCIAS</div>';
      var vrStopIdx = 0;

      vrDayOrder.forEach(function(dayNum) {
        var dayStops = vrDayGroups[dayNum];
        var dayTitle = '';
        for (var di = 0; di < dayStops.length; di++) {
          if (dayStops[di].day_title) { dayTitle = dayStops[di].day_title; break; }
        }
        var dayContentId = 'vr-day-content-' + dayNum;
        var dayArrowId = 'vr-day-arrow-' + dayNum;

        var dayPois = dayStops.filter(function(s) { return s.lat && s.lng && Number(s.lat) && Number(s.lng); });
        var dayGmapsUrl = '';
        if (dayPois.length >= 2) {
          var dn0 = (dayPois[0].headline || dayPois[0].name || '').toString().trim();
          var dnLast = (dayPois[dayPois.length - 1].headline || dayPois[dayPois.length - 1].name || '').toString().trim();
          var dOrigin = (dn0 && vrCountry) ? encodeURIComponent(dn0 + ' ' + vrCountry) : (dayPois[0].lat + ',' + dayPois[0].lng);
          var dDest = (dnLast && vrCountry) ? encodeURIComponent(dnLast + ' ' + vrCountry) : (dayPois[dayPois.length - 1].lat + ',' + dayPois[dayPois.length - 1].lng);
          var dWp = dayPois.slice(1, -1).map(function(p) { var n = (p.headline || p.name || '').toString().trim(); return n && vrCountry ? encodeURIComponent(n + ' ' + vrCountry) : (p.lat + ',' + p.lng); }).join('|');
          dayGmapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + dOrigin + '&destination=' + dDest + (dWp ? '&waypoints=' + dWp : '') + '&travelmode=driving';
        } else if (dayPois.length === 1) {
          var dn = (dayPois[0].headline || dayPois[0].name || '').toString().trim();
          dayGmapsUrl = (dn && vrCountry) ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(dn + ' ' + vrCountry)) : ('https://www.google.com/maps?q=' + dayPois[0].lat + ',' + dayPois[0].lng);
        }

        var dayStopsHTML = '';
        dayStops.forEach(function(stop) {
          var idx = vrStopIdx++;
          var icon = typeIcons[stop.type] || typeIcons[stop.tipo] || '📍';
          var rawName = (stop.headline || stop.name || '');
          var headline = rawName.replace(/</g, '&lt;');
          var narrative = (stop.narrative || stop.description || stop.note || '').replace(/</g, '&lt;');
          var secret = (stop.local_secret || '').replace(/</g, '&lt;');
          var alt = (stop.alternative || '').replace(/</g, '&lt;');
          var practical = (stop.practical || '').replace(/</g, '&lt;');
          var context = (stop.context || '').replace(/</g, '&lt;');
          var food_nearby = (stop.food_nearby || '').replace(/</g, '&lt;');
          var links = (stop.links && Array.isArray(stop.links)) ? stop.links.filter(function(l) { return l && l.label && l.url; }) : [];
          var hasDetails = narrative || secret || alt || practical || context || food_nearby || links.length > 0;
          var stopId = 'vr-stop-' + idx;
          var mapsUrl = rawName && vrCountry
            ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(rawName + ' ' + vrCountry)
            : (stop.lat && stop.lng ? 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng : '');

          var linksHTML = '';
          if (links.length > 0) {
            linksHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;">' +
              links.map(function(l) {
                return '<a href="' + l.url.replace(/</g, '&lt;') + '" target="_blank" rel="noopener noreferrer" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;border:1px solid rgba(212,160,23,.3);padding:6px 12px;border-radius:999px;letter-spacing:.08em;" onmouseover="this.style.background=\'rgba(212,160,23,.1)\'" onmouseout="this.style.background=\'transparent\'">' + l.label.replace(/</g, '&lt;') + ' ↗</a>';
              }).join('') +
            '</div>';
          }

          dayStopsHTML += '<div style="border-bottom:1px solid rgba(212,160,23,.08);">' +
            '<div onclick="salmaToggleStop(\'' + stopId + '\')" style="display:flex;align-items:center;gap:10px;padding:16px 0;cursor:pointer;transition:background .15s;" onmouseover="this.style.background=\'rgba(255,255,255,.02)\'" onmouseout="this.style.background=\'none\'">' +
              '<div style="flex:1;">' +
                '<div style="font-family:\'Inter Tight\',sans-serif;font-size:18px;font-weight:700;color:#fff;line-height:1.2;">' +
                  '<span style="font-size:16px;margin-right:6px;">' + icon + '</span>' + headline +
                '</div>' +
              '</div>' +
              (hasDetails ? '<div style="flex-shrink:0;font-size:12px;color:var(--dorado);" id="' + stopId + '-arrow">▾</div>' : '') +
            '</div>' +
            (hasDetails ? '<div id="' + stopId + '" style="display:none;padding:0 0 16px 8px;">' +
              '<div id="vr-stop-img-' + idx + '"></div>' +
              (narrative ? '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.75;margin-bottom:16px;">' + narrative + '</div>' : '') +
              (context ? '<div style="background:rgba(100,140,255,.05);border-left:3px solid rgba(100,140,255,.4);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
                '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(100,180,255,.8);letter-spacing:.14em;margin-bottom:6px;">📖 CONTEXTO</div>' +
                '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + context + '</div></div>' : '') +
              (food_nearby ? '<div style="background:rgba(255,140,50,.05);border-left:3px solid rgba(255,140,50,.35);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
                '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(255,160,80,.85);letter-spacing:.14em;margin-bottom:6px;">🍜 COME CERCA</div>' +
                '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + food_nearby + '</div></div>' : '') +
              (secret ? '<div style="background:rgba(212,160,23,.06);border-left:3px solid var(--dorado);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
                '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.14em;margin-bottom:6px;">🔑 SECRETO LOCAL</div>' +
                '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + secret + '</div></div>' : '') +
              (alt ? '<div style="padding:10px 0;margin-bottom:12px;">' +
                '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(245,240,232,.4);letter-spacing:.12em;margin-bottom:4px;">↗ ALTERNATIVA</div>' +
                '<div style="font-size:14px;color:rgba(245,240,232,.6);line-height:1.6;">' + alt + '</div></div>' : '') +
              (practical ? '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:rgba(245,240,232,.55);line-height:1.8;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:10px;margin-bottom:12px;">📋 ' + practical + '</div>' : '') +
              linksHTML +
              (mapsUrl ? '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;' + (links.length > 0 ? 'display:inline-block;margin-top:10px;' : '') + '">VER EN MAPA →</a>' : '') +
            '</div>' : '') +
          '</div>';
        });

        stopsHTML +=
          '<div style="border:1px solid rgba(212,160,23,.15);border-radius:14px;margin-bottom:10px;overflow:hidden;">' +
            '<div onclick="salmaToggleDay(\'' + dayContentId + '\',\'' + dayArrowId + '\')" style="display:flex;align-items:center;gap:10px;padding:14px 18px;cursor:pointer;background:rgba(212,160,23,.04);transition:background .15s;" onmouseover="this.style.background=\'rgba(212,160,23,.09)\'" onmouseout="this.style.background=\'rgba(212,160,23,.04)\'">' +
              '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;white-space:nowrap;">DÍA ' + dayNum + '</div>' +
              (dayTitle ? '<div style="font-size:13px;color:rgba(245,240,232,.75);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">· ' + dayTitle.replace(/</g, '&lt;') + '</div>' : '') +
              '<div style="flex:1;"></div>' +
              '<div style="font-size:10px;color:rgba(212,160,23,.55);font-family:\'JetBrains Mono\',monospace;">' + dayStops.length + ' paradas</div>' +
              '<div id="' + dayArrowId + '" style="font-size:12px;color:var(--dorado);margin-left:8px;">▾</div>' +
            '</div>' +
            '<div id="' + dayContentId + '" style="display:none;">' +
              (dayGmapsUrl ?
                '<div style="padding:12px 16px 0;">' +
                  '<a href="' + dayGmapsUrl + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.2);border-radius:10px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;transition:background .15s;" onmouseover="this.style.background=\'rgba(212,160,23,.14)\'" onmouseout="this.style.background=\'rgba(212,160,23,.07)\'">' +
                    '🗺 NAVEGAR DÍA ' + dayNum + ' EN GOOGLE MAPS →' +
                  '</a>' +
                '</div>'
                : '') +
              '<div style="padding:0 16px 8px;">' + dayStopsHTML + '</div>' +
            '</div>' +
          '</div>';
      });
    }
    var tipsHTML = '';
    if (routeData && routeData.tips && routeData.tips.length > 0) {
      tipsHTML = '<div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(212,160,23,.12);">';
      tipsHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:12px;">CONSEJOS DE SALMA</div>';
      routeData.tips.forEach(function(tip) {
        tipsHTML += '<div style="font-size:14px;color:rgba(245,240,232,.7);line-height:1.65;margin-bottom:8px;">• ' + (tip || '').replace(/</g,'&lt;') + '</div>';
      });
      tipsHTML += '</div>';
    }
    var tagsHTML = '';
    if (routeData && routeData.tags && routeData.tags.length > 0) {
      tagsHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:16px;">';
      routeData.tags.forEach(function(tag) {
        tagsHTML += '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;padding:5px 12px;border:1px solid rgba(212,160,23,.2);border-radius:999px;color:var(--dorado);">' + (tag || '').replace(/</g,'&lt;') + '</span>';
      });
      tagsHTML += '</div>';
    }
    var summary = routeData && routeData.summary ? routeData.summary.replace(/</g,'&lt;') : '';
    var budget = routeData && routeData.budget_level && routeData.budget_level !== 'sin_definir' ? ' · ' + routeData.budget_level.toUpperCase() : '';
    var descText = summary
      ? '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + summary + '</div>'
      : (r.desc ? '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + r.desc.replace(/</g,'&lt;') + '</div>' : '');
    var hasMapCoords = mapPois.length > 0;
    container.innerHTML =
      '<div style="padding:16px 24px 0;"><div onclick="showPage(\'dashboard\')" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.12em;padding:8px 0;opacity:.8;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'.8\'">← MIS RUTAS</div></div>' +
      '<div style="padding:24px 24px 0;"><div style="font-family:\'Inter Tight\',sans-serif;font-size:28px;font-weight:700;color:#fff;line-height:1.1;letter-spacing:-.02em;">' + (r.nombre||'Mi ruta').replace(/</g,'&lt;') + '</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.14em;margin-top:8px;">' + (routeData && routeData.duration_days ? routeData.duration_days : (Array.isArray(r.dias) ? r.dias.length : (r.dias || 0))) + ' DÍAS · ' + (r.destino||'').replace(/</g,'&lt;').toUpperCase() + budget + ' · ' + pois.length + ' PARADAS</div></div>' +
      '<div style="padding:20px 24px 40px;">' + descText + tagsHTML +
      (vrGmapsUrl ? '<a id="vr-gmaps-global" href="' + vrGmapsUrl + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px;padding:14px 16px;background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.2);border-radius:12px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;transition:background .15s;" onmouseover="this.style.background=\'rgba(212,160,23,.14)\'" onmouseout="this.style.background=\'rgba(212,160,23,.07)\'">🗺 VER RUTA COMPLETA EN GOOGLE MAPS →</a>' : '') +
      (hasMapCoords ? '<div id="ruta-leaflet-map" style="height:260px;width:100%;border-radius:14px;margin-bottom:24px;border:1px solid rgba(212,160,23,.15);overflow:hidden;"></div>' : '') +
      '<div id="vr-stops-wrapper">' + stopsHTML + '</div>' +
      tipsHTML +
      '<div style="display:flex;gap:10px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(212,160,23,.1);flex-wrap:wrap;">' +
      '<button onclick="showPage(\'dashboard\')" style="flex:1;min-width:100px;background:transparent;border:1px solid rgba(212,160,23,.1);border-radius:12px;color:rgba(245,240,232,.5);padding:14px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.12em;">VOLVER</button>' +
      '</div></div>';
    showPage('ruta');
    // Inicializar mapa Leaflet tras mostrar la página
    if (hasMapCoords) {
      setTimeout(function() {
        if (typeof window.salmaInitLeaflet === 'function') {
          window.salmaInitLeaflet('ruta-leaflet-map', mapPois, routeData);
        }
      }, 150);
    }
    // Imágenes reales Wikipedia (async)
    setTimeout(function() {
      if (typeof window.salmaFetchWikipediaImages === 'function') {
        window.salmaFetchWikipediaImages(pois, 'vr-stop', vrCountry);
      }
    }, 400);
    // Copiloto SALMA — se activa al abrir una ruta guardada
    if (typeof copilotInit === 'function') {
      copilotInit(id, routeData, pois, r.destino || vrCountry || '', currentUser.uid);
    }
  }).catch(e => showToast('Error: ' + e.message));
}
window.verRuta = verRuta;


document.addEventListener("DOMContentLoaded", function() {
  document.addEventListener('click', function(e) {
    const avatar = document.getElementById('nav-avatar');
    const menu = document.getElementById('user-menu');
    if (menu && menu.style.display !== 'none' && avatar && !avatar.contains(e.target)) {
      menu.style.display = 'none';
    }
  });
});

function setDashTab(tab, el) {
  document.querySelectorAll(".dash-content").forEach(c => c.style.display = "none");
  const target = document.getElementById("dash-tab-" + tab);
  if (target) target.style.display = "block";
  document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
  document.querySelectorAll(".mobile-nav-item").forEach(i => i.classList.remove("active"));
  if (el) el.classList.add("active");
  if (tab === 'cuaderno') loadCuaderno();
}
window.setDashTab = setDashTab;

const BOOKING_LINKS = {
  1:{city:"Hanoi",url:"https://www.booking.com/searchresults.es.html?ss=Hanoi&nflt=price%3D1-20"},
  2:{city:"Hanoi",url:"https://www.booking.com/searchresults.es.html?ss=Hanoi&nflt=price%3D1-20"},
  3:{city:"Ha Giang",url:"https://www.booking.com/searchresults.es.html?ss=Ha+Giang&nflt=price%3D1-20"},
  4:{city:"Ninh Binh",url:"https://www.booking.com/searchresults.es.html?ss=Ninh+Binh&nflt=price%3D1-20"},
  5:{city:"Phong Nha",url:"https://www.booking.com/searchresults.es.html?ss=Phong+Nha&nflt=price%3D1-20"},
  6:{city:"Hue",url:"https://www.booking.com/searchresults.es.html?ss=Hue+Vietnam&nflt=price%3D1-20"},
  7:{city:"Hoi An",url:"https://www.booking.com/searchresults.es.html?ss=Hoi+An&nflt=price%3D1-20"},
  8:{city:"Da Nang",url:"https://www.booking.com/searchresults.es.html?ss=Da+Nang&nflt=price%3D1-20"},
  9:{city:"Nha Trang",url:"https://www.booking.com/searchresults.es.html?ss=Nha+Trang&nflt=price%3D1-20"},
  10:{city:"Mui Ne",url:"https://www.booking.com/searchresults.es.html?ss=Mui+Ne&nflt=price%3D1-20"},
  11:{city:"Ho Chi Minh",url:"https://www.booking.com/searchresults.es.html?ss=Ho+Chi+Minh&nflt=price%3D1-20"},
  12:{city:"Ho Chi Minh",url:"https://www.booking.com/searchresults.es.html?ss=Ho+Chi+Minh&nflt=price%3D1-20"},
};

function renderPoiList() {
  const el = document.getElementById("poi-list-editor");
  if (!el) return;
  const days = [...new Set(poiList.map(p => p.day))].sort((a,b) => a-b);
  el.innerHTML = days.map(day => {
    const booking = BOOKING_LINKS[day];
    const pois = poiList.filter(p => p.day === day);
    return `<div style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--gris2);">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--dorado);letter-spacing:1px;">DÍA ${day}${booking ? " · " + booking.city : ""}</div>
        ${booking ? `<a href="${booking.url}" target="_blank" style="font-family:'Space Mono',monospace;font-size:9px;color:var(--negro);background:var(--dorado);padding:3px 8px;text-decoration:none;letter-spacing:1px;">🏨 BOOKING</a>` : ""}
      </div>
      ${pois.map(poi => `<div class="poi-item-editor">
        <div class="poi-emoji">${poi.type}</div>
        <div class="poi-info-editor"><div class="poi-name-editor">${poi.name}</div><div class="poi-meta-editor">${poi.note||"Sin nota"}</div></div>
        <button class="poi-del" onclick="deletePoi(${poi.id})">x</button>
      </div>`).join("")}
    </div>`;
  }).join("");
}

function deletePoi(id) {
  poiList = poiList.filter(p => p.id !== id);
  renderPoiList();
  showToast("Punto eliminado");
}
window.deletePoi = deletePoi;

function setDay(el, day) {
  document.querySelectorAll(".day-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
}
window.setDay = setDay;

function mapZoom(dir) {}
window.initMap = function() { renderPoiList(); };
window.mapZoom = mapZoom;
function centerMap() {}
window.centerMap = centerMap;

function openPoiModal() {
  document.getElementById("poi-modal").classList.add("active");
  document.getElementById("poi-name-input").value = "";
  document.getElementById("poi-note-input").value = "";
}
function closePoiModal() {
  document.getElementById("poi-modal").classList.remove("active");
}
window.openPoiModal = openPoiModal;
window.closePoiModal = closePoiModal;

async function addPoi() {
  const name = document.getElementById("poi-name-input").value.trim();
  if (!name) { showToast("Escribe el nombre del lugar"); return; }
  const type = document.getElementById("poi-type-input").value;
  const note = document.getElementById("poi-note-input").value.trim();
  const newPoi = { id: nextPoiId++, name, type, note, day: 1, lat: 16.5, lng: 106.5 };
  poiList.push(newPoi);
  if (currentUser) {
    try {
      await db.collection("users").doc(currentUser.uid).collection("pois").add({
        name, type, note, day: 1, lat: newPoi.lat, lng: newPoi.lng,
        createdAt: new Date().toISOString()
      });
    } catch(e) { console.error("Error saving poi:", e); }
  }
  renderPoiList();
  closePoiModal();
  showToast("📍 " + name + " anadido");
}
window.addPoi = addPoi;

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}
window.showToast = showToast;

function showError(el, msg) {
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 4000);
}

function scrollToSection(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({behavior:"smooth"});
}
window.scrollTo2 = scrollToSection;

function initHeroMap() {
  const el = document.getElementById("hero-map");
  if (!el) return;
  el.style.backgroundImage = "url('https://raw.githubusercontent.com/borradodelmapa/borradodelmapa/main/mapa.png')";
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center";
  el.style.filter = "brightness(0.55)";
}
document.addEventListener("DOMContentLoaded", initHeroMap);

// ===== STATS GLOBALES =====
async function loadGlobalStats() {
  try {
    var snap = await db.collection('stats').doc('global').get();
    var data = snap.exists ? snap.data() : {};
    var total = data.totalRoutes || 0;
    var el = document.getElementById('counter-routes');
    if (el) el.textContent = total > 0 ? total : '—';
    // Calcular países únicos si hay datos, si no usar valor por defecto
    var countries = data.totalCountries || 0;
    var elC = document.getElementById('counter-countries');
    if (elC) elC.textContent = countries > 0 ? countries : '—';
  } catch(e) {
    // Firestore rules pueden bloquearlo, no pasa nada
  }
}
window.loadGlobalStats = loadGlobalStats;
document.addEventListener("DOMContentLoaded", loadGlobalStats);

// ===== PLACEHOLDER SLIDER =====
document.addEventListener("DOMContentLoaded", function() {
  var HERO_PLACEHOLDERS = [
    'Diseñame una ruta de 5 días por la provincia de Málaga',
    '10 días Portugal playas y aventura',
    'Tailandia 15 días, mochilero, playa y montaña',
    'Japón cultural 7 días en primavera',
    'Road trip por Escocia 10 días con coche',
    'Semana en Marruecos, budget medio',
    'Costa Amalfitana 6 días en pareja',
    'Islandia aurora boreal 8 días en invierno'
  ];
  var pIdx = 0;
  var heroInput = document.getElementById('salma-hero-input');
  if (heroInput) {
    setInterval(function() {
      if (document.activeElement === heroInput) return;
      pIdx = (pIdx + 1) % HERO_PLACEHOLDERS.length;
      heroInput.placeholder = HERO_PLACEHOLDERS[pIdx];
    }, 3500);
  }
});

document.addEventListener("DOMContentLoaded", function() {
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") { closeModal(); closePoiModal(); }
  });
  var modalAuth = document.getElementById("modal-auth");
  if (modalAuth) modalAuth.addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });
  var poiModal = document.getElementById("poi-modal");
  if (poiModal) poiModal.addEventListener("click", function(e) {
    if (e.target === this) closePoiModal();
  });
});
// ===== PANEL PERFIL FLOTANTE (móvil) =====

function injectProfilePanel() {
  if (document.getElementById('profile-panel')) return;
  var style = document.createElement('style');
  style.textContent = [
    '#profile-panel-backdrop{position:fixed;top:0;left:0;right:0;bottom:62px;background:rgba(0,0,0,.55);z-index:1500;display:none;}',
    '#profile-panel{',
      'position:fixed;bottom:62px;left:50%;transform:translateX(-50%);',
      'width:100%;max-width:520px;',
      'background:#111;border-radius:20px 20px 0 0;',
      'border-top:1px solid rgba(212,160,23,.3);',
      'border-left:1px solid rgba(212,160,23,.15);',
      'border-right:1px solid rgba(212,160,23,.15);',
      'display:none;flex-direction:column;z-index:1501;',
      'box-shadow:0 -12px 48px rgba(0,0,0,.55);',
      'max-height:78vh;overflow-y:auto;',
    '}',
    '#profile-panel-head{',
      'padding:16px 20px 14px;border-bottom:1px solid rgba(212,160,23,.12);',
      'display:flex;align-items:center;justify-content:space-between;',
      'position:sticky;top:0;background:#111;z-index:2;',
    '}',
    '#profile-panel-body{padding:20px 20px 32px;display:flex;flex-direction:column;gap:14px;}',
    '.pp-label{font-family:"JetBrains Mono",monospace;font-size:9px;color:rgba(212,160,23,.75);letter-spacing:.14em;text-transform:uppercase;margin-bottom:5px;}',
    '.pp-input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);border:1px solid rgba(212,160,23,.22);border-radius:10px;padding:11px 14px;font-size:14px;color:#f5f0e8;font-family:"Inter",sans-serif;outline:none;}',
    '.pp-input:focus{border-color:rgba(212,160,23,.6);}',
    '.pp-btn{width:100%;background:#d4a017;color:#0a0908;border:none;border-radius:10px;padding:13px;font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;letter-spacing:.1em;cursor:pointer;}',
    '.pp-btn:hover{background:#e0b020;}',
    '.pp-btn-outline{width:100%;background:transparent;color:#d4a017;border:1px solid rgba(212,160,23,.35);border-radius:10px;padding:13px;font-family:"JetBrains Mono",monospace;font-size:11px;font-weight:700;letter-spacing:.1em;cursor:pointer;text-decoration:none;display:block;text-align:center;box-sizing:border-box;}',
    '.pp-btn-outline:hover{background:rgba(212,160,23,.08);}',
    '.pp-divider{border:none;border-top:1px solid rgba(212,160,23,.1);margin:4px 0;}',
    '.pp-stat{text-align:center;background:rgba(255,255,255,.03);border:1px solid rgba(212,160,23,.12);border-radius:12px;padding:14px;}',
    '.pp-stat-num{font-family:"Bebas Neue",sans-serif;font-size:32px;color:#d4a017;}',
    '.pp-stat-lbl{font-family:"JetBrains Mono",monospace;font-size:8px;color:rgba(245,240,232,.4);letter-spacing:.14em;}'
  ].join('');
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.innerHTML = [
    '<div id="profile-panel-backdrop"></div>',
    '<div id="profile-panel">',
      '<div id="profile-panel-head">',
        '<div style="font-family:\'Inter Tight\',sans-serif;font-size:17px;font-weight:700;color:#fff;">MI PERFIL</div>',
        '<button onclick="closeProfilePanel()" style="background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:8px;padding:7px 13px;color:rgba(245,240,232,.55);font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.08em;">CERRAR</button>',
      '</div>',
      '<div id="profile-panel-body">',
        '<!-- ACCIONES PRIMERO — siempre visibles al abrir -->',
        '<button class="pp-btn" onclick="saveProfilePanel()">GUARDAR CAMBIOS</button>',
        '<a href="https://ko-fi.com/borradodelmapa" target="_blank" class="pp-btn-outline">☕ Colaborar en Ko-fi</a>',
        '<hr class="pp-divider">',
        '<div>',
          '<div class="pp-label">Nombre</div>',
          '<input class="pp-input" id="pp-name" type="text" placeholder="Tu nombre">',
        '</div>',
        '<div>',
          '<div class="pp-label">País de origen</div>',
          '<input class="pp-input" id="pp-country" type="text" placeholder="España, México, Argentina...">',
        '</div>',
        '<div>',
          '<div class="pp-label">Sobre ti</div>',
          '<textarea class="pp-input" id="pp-bio" rows="3" placeholder="Cuéntanos cómo viajas..." style="resize:none;font-family:\'Inter\',sans-serif;"></textarea>',
        '</div>',
        '<hr class="pp-divider">',
        '<div style="display:flex;gap:10px;">',
          '<div class="pp-stat" style="flex:1;">',
            '<div class="pp-stat-num" id="pp-routes-count">0</div>',
            '<div class="pp-stat-lbl">RUTAS</div>',
          '</div>',
          '<div class="pp-stat" style="flex:1;">',
            '<div class="pp-stat-num">∞</div>',
            '<div class="pp-stat-lbl">PLAN GRATIS</div>',
          '</div>',
        '</div>',
        '<button onclick="logout();closeProfilePanel();" style="width:100%;background:transparent;color:rgba(248,113,113,.7);border:1px solid rgba(248,113,113,.25);border-radius:10px;padding:11px;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;letter-spacing:.1em;cursor:pointer;">🚪 CERRAR SESIÓN</button>',
      '</div>',
    '</div>'
  ].join('');
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

  document.getElementById('profile-panel-backdrop').addEventListener('click', closeProfilePanel);
}

function openProfilePanel() {
  var panel = document.getElementById('profile-panel');
  var backdrop = document.getElementById('profile-panel-backdrop');
  if (!panel) { injectProfilePanel(); panel = document.getElementById('profile-panel'); backdrop = document.getElementById('profile-panel-backdrop'); }
  // Rellenar con datos actuales
  if (currentUser) {
    var nameEl    = document.getElementById('pp-name');
    var countryEl = document.getElementById('pp-country');
    var bioEl     = document.getElementById('pp-bio');
    var routesEl  = document.getElementById('pp-routes-count');
    if (nameEl)    nameEl.value    = currentUser.name    || '';
    if (countryEl) countryEl.value = currentUser.country || '';
    if (bioEl)     bioEl.value     = currentUser.bio     || '';
    if (routesEl) {
      var grid = document.getElementById('maps-grid-dynamic');
      routesEl.textContent = grid ? grid.querySelectorAll('[data-map-id]').length : '—';
    }
  }
  if (panel)    panel.style.display    = 'flex';
  if (backdrop) backdrop.style.display = 'block';
}
window.openProfilePanel = openProfilePanel;

function closeProfilePanel() {
  var panel    = document.getElementById('profile-panel');
  var backdrop = document.getElementById('profile-panel-backdrop');
  if (panel)    panel.style.display    = 'none';
  if (backdrop) backdrop.style.display = 'none';
}
window.closeProfilePanel = closeProfilePanel;

async function saveProfilePanel() {
  var nameEl    = document.getElementById('pp-name');
  var countryEl = document.getElementById('pp-country');
  var bioEl     = document.getElementById('pp-bio');
  var name    = nameEl    ? nameEl.value.trim()    : '';
  var country = countryEl ? countryEl.value.trim() : '';
  var bio     = bioEl     ? bioEl.value.trim()     : '';
  if (!name) { showToast('El nombre no puede estar vacío'); return; }
  if (!currentUser) { showToast('No hay sesión activa'); return; }
  try {
    await db.collection('users').doc(currentUser.uid).update({ name: name, country: country, bio: bio });
    await auth.currentUser.updateProfile({ displayName: name });
    currentUser.name    = name;
    currentUser.country = country;
    currentUser.bio     = bio;
    // Sync con los campos del dashboard por si está abierto
    ['sidebar-name','profile-display-name'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = name;
    });
    ['nav-avatar','profile-avatar-big','sidebar-avatar'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = name[0].toUpperCase();
    });
    var emailEl = document.getElementById('profile-display-email'); if (emailEl) emailEl.textContent = currentUser.email;
    showToast('Perfil actualizado ✓');
    closeProfilePanel();
  } catch(e) {
    showToast('Error: ' + e.message);
  }
}
window.saveProfilePanel = saveProfilePanel;

// ===== PANEL CUADERNO FLOTANTE (móvil) =====

function injectCuadernoPanel() {
  if (document.getElementById('cuaderno-panel')) return;
  var style = document.createElement('style');
  style.textContent = [
    '#cuaderno-panel-backdrop{position:fixed;top:0;left:0;right:0;bottom:62px;background:rgba(0,0,0,.55);z-index:1500;display:none;}',
    '#cuaderno-panel{position:fixed;bottom:62px;left:50%;transform:translateX(-50%);width:100%;max-width:560px;',
      'background:#111;border-radius:20px 20px 0 0;',
      'border-top:1px solid rgba(212,160,23,.3);border-left:1px solid rgba(212,160,23,.15);border-right:1px solid rgba(212,160,23,.15);',
      'display:none;flex-direction:column;z-index:1501;box-shadow:0 -12px 48px rgba(0,0,0,.55);height:80vh;}',
    '#cuaderno-panel-head{padding:16px 20px 0;border-bottom:1px solid rgba(212,160,23,.12);flex-shrink:0;}',
    '#cuaderno-panel-head-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}',
    '#cuaderno-panel-tabs{display:flex;gap:0;}',
    '.cpnl-tab{padding:9px 14px;font-family:"JetBrains Mono",monospace;font-size:9px;letter-spacing:1.5px;cursor:pointer;',
      'color:rgba(245,240,232,.4);border-bottom:2px solid transparent;transition:all .15s;}',
    '.cpnl-tab.active{color:#d4a017;border-bottom-color:#d4a017;}',
    '#cuaderno-panel-body{flex:1;overflow-y:auto;padding:16px 18px 20px;scrollbar-width:none;}',
    '#cuaderno-panel-body::-webkit-scrollbar{display:none;}',
    '.cpnl-pane{display:none;}',
    '.cpnl-pane.active{display:block;}',
    '.cpnl-nota{background:rgba(255,255,255,.04);border:1px solid rgba(212,160,23,.15);border-radius:12px;padding:14px 16px;margin-bottom:10px;}',
    '.cpnl-nota-ruta{font-family:"JetBrains Mono",monospace;font-size:8px;color:rgba(212,160,23,.6);letter-spacing:1.5px;margin-bottom:6px;}',
    '.cpnl-nota-q{font-family:"JetBrains Mono",monospace;font-size:10px;color:#d4a017;letter-spacing:.8px;margin-bottom:6px;}',
    '.cpnl-nota-r{font-size:14px;color:rgba(245,240,232,.85);line-height:1.65;}',
    '.cpnl-nota-footer{display:flex;justify-content:space-between;align-items:center;margin-top:10px;}',
    '.cpnl-nota-fecha{font-family:"JetBrains Mono",monospace;font-size:8px;color:rgba(245,240,232,.25);}',
    '.cpnl-del{background:none;border:none;color:rgba(248,113,113,.4);cursor:pointer;font-size:12px;padding:2px 6px;}',
    '.cpnl-doc{background:rgba(255,255,255,.04);border:1px solid rgba(212,160,23,.15);border-radius:12px;padding:13px 15px;margin-bottom:8px;display:flex;align-items:center;gap:12px;}',
    '.cpnl-upload-area{display:block;width:100%;box-sizing:border-box;border:1px dashed rgba(212,160,23,.3);border-radius:12px;padding:24px;text-align:center;cursor:pointer;margin-bottom:14px;}',
    '.cpnl-upload-area:hover{border-color:rgba(212,160,23,.6);background:rgba(212,160,23,.03);}'
  ].join('');
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.innerHTML = [
    '<div id="cuaderno-panel-backdrop"></div>',
    '<div id="cuaderno-panel">',
      '<div id="cuaderno-panel-head">',
        '<div id="cuaderno-panel-head-top">',
          '<div style="font-family:\'Inter Tight\',sans-serif;font-size:17px;font-weight:700;color:#fff;">📒 MI CUADERNO</div>',
          '<button onclick="closeCuadernoPanel()" style="background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:8px;padding:7px 13px;color:rgba(245,240,232,.55);font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.08em;">CERRAR</button>',
        '</div>',
        '<div id="cuaderno-panel-tabs">',
          '<div class="cpnl-tab active" id="cpnl-tab-viaje" onclick="setCuadernoPanelTab(\'viaje\')">MI VIAJE</div>',
          '<div class="cpnl-tab" id="cpnl-tab-global" onclick="setCuadernoPanelTab(\'global\')">SIEMPRE ÚTIL</div>',
          '<div class="cpnl-tab" id="cpnl-tab-docs" onclick="setCuadernoPanelTab(\'docs\')">DOCS</div>',
        '</div>',
      '</div>',
      '<div id="cuaderno-panel-body">',
        '<div class="cpnl-pane active" id="cpnl-pane-viaje">',
          '<div id="cpnl-notas-viaje" style="padding-top:4px;"></div>',
        '</div>',
        '<div class="cpnl-pane" id="cpnl-pane-global">',
          '<div id="cpnl-notas-global" style="padding-top:4px;"></div>',
        '</div>',
        '<div class="cpnl-pane" id="cpnl-pane-docs">',
          '<label for="cpnl-doc-upload" class="cpnl-upload-area">',
            '<div style="font-size:26px;margin-bottom:6px;">📎</div>',
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:#d4a017;letter-spacing:1.5px;margin-bottom:4px;">SUBIR DOCUMENTO</div>',
            '<div style="font-size:11px;color:rgba(245,240,232,.35);">Pasaporte · Carnet · Seguro · Contrato · PDF / JPG · máx. 5MB</div>',
          '</label>',
          '<input type="file" id="cpnl-doc-upload" accept=".pdf,.jpg,.jpeg,.png" style="display:none;" onchange="uploadDoc(this,\'cpnl-docs-list\')">',
          '<div id="cpnl-docs-list"></div>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  document.getElementById('cuaderno-panel-backdrop').addEventListener('click', closeCuadernoPanel);
}

function setCuadernoPanelTab(tab) {
  ['viaje','global','docs'].forEach(function(t) {
    var pane = document.getElementById('cpnl-pane-' + t);
    var btn  = document.getElementById('cpnl-tab-' + t);
    if (pane) pane.className = 'cpnl-pane';
    if (btn)  btn.className  = 'cpnl-tab';
  });
  var pane = document.getElementById('cpnl-pane-' + tab);
  var btn  = document.getElementById('cpnl-tab-'  + tab);
  if (pane) pane.className = 'cpnl-pane active';
  if (btn)  btn.className  = 'cpnl-tab active';
  if (tab === 'viaje')  loadNotasViaje('cpnl-notas-viaje');
  else if (tab === 'global') loadNotasGlobal('cpnl-notas-global');
  else if (tab === 'docs')   loadDocs('cpnl-docs-list');
}
window.setCuadernoPanelTab = setCuadernoPanelTab;

function openCuadernoPanel() {
  var panel = document.getElementById('cuaderno-panel');
  if (!panel) { injectCuadernoPanel(); panel = document.getElementById('cuaderno-panel'); }
  panel.style.display = 'flex';
  document.getElementById('cuaderno-panel-backdrop').style.display = 'block';
  // Carga la pestaña activa
  var activeTab = document.querySelector('.cpnl-tab.active');
  var tab = activeTab ? activeTab.id.replace('cpnl-tab-','') : 'viaje';
  setCuadernoPanelTab(tab);
}
window.openCuadernoPanel = openCuadernoPanel;

function closeCuadernoPanel() {
  var panel = document.getElementById('cuaderno-panel');
  var backdrop = document.getElementById('cuaderno-panel-backdrop');
  if (panel)    panel.style.display    = 'none';
  if (backdrop) backdrop.style.display = 'none';
}
window.closeCuadernoPanel = closeCuadernoPanel;

// Renderizado de notas en el panel (misma estructura que renderNotaCard pero con clases cpnl-*)
function renderNotaPanel(id, d, coleccion) {
  var fecha = d.createdAt ? new Date(d.createdAt).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '';
  return '<div class="cpnl-nota">' +
    (d.routeName ? '<div class="cpnl-nota-ruta">' + d.routeName.toUpperCase() + '</div>' : '') +
    '<div class="cpnl-nota-q">' + (d.pregunta || '') + '</div>' +
    '<div class="cpnl-nota-r">' + (d.respuesta || '') + '</div>' +
    '<div class="cpnl-nota-footer">' +
      '<div class="cpnl-nota-fecha">' + fecha + '</div>' +
      '<button class="cpnl-del" onclick="deleteNotaPanel(\'' + coleccion + '\',\'' + id + '\',this)" title="Eliminar">✕</button>' +
    '</div></div>';
}

function deleteNotaPanel(coleccion, id, btn) {
  if (!currentUser) return;
  var card = btn ? btn.closest('.cpnl-nota') : null;
  if (card) card.style.opacity = '.4';
  db.collection('users').doc(currentUser.uid).collection(coleccion).doc(id).delete()
    .then(function() { if (card) card.remove(); showToast('Nota eliminada'); })
    .catch(function() { if (card) card.style.opacity = '1'; showToast('Error al eliminar'); });
}
window.deleteNotaPanel = deleteNotaPanel;

// ===== MI CUADERNO =====
// Firebase Storage (opcional — funciona si está disponible)
var _fbStorage = null;
try {
  if (typeof firebase !== 'undefined' && firebase.storage) {
    _fbStorage = firebase.storage();
    window._fbStorage = _fbStorage;
  }
} catch(e) {}

function setCuadernoTab(tab) {
  ['viaje','global','docs'].forEach(function(t) {
    var pane = document.getElementById('cuaderno-pane-' + t);
    if (pane) pane.style.display = 'none';
    var btn = document.getElementById('cuaderno-tab-' + t);
    if (btn) {
      btn.style.color = 'var(--crema)';
      btn.style.opacity = '.5';
      btn.style.borderBottomColor = 'transparent';
    }
  });
  var pane = document.getElementById('cuaderno-pane-' + tab);
  if (pane) pane.style.display = 'block';
  var activeBtn = document.getElementById('cuaderno-tab-' + tab);
  if (activeBtn) {
    activeBtn.style.color = 'var(--dorado)';
    activeBtn.style.opacity = '1';
    activeBtn.style.borderBottomColor = 'var(--dorado)';
  }
  if (tab === 'viaje') loadNotasViaje();
  else if (tab === 'global') loadNotasGlobal();
  else if (tab === 'docs') loadDocs();
}
window.setCuadernoTab = setCuadernoTab;

function loadCuaderno() {
  setCuadernoTab('viaje');
}
window.loadCuaderno = loadCuaderno;

function loadNotasViaje(listId) {
  if (!currentUser) return;
  var id   = listId || 'cuaderno-notas-viaje';
  var list = document.getElementById(id);
  if (!list) return;
  var isPanel = id.indexOf('cpnl') === 0;
  list.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:rgba(245,240,232,.35);letter-spacing:1px;padding:8px 0;">Cargando...</div>';
  db.collection('users').doc(currentUser.uid).collection('notas_viaje')
    .orderBy('createdAt','desc').limit(50)
    .get().then(function(snap) {
      if (snap.empty) {
        list.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:rgba(245,240,232,.3);letter-spacing:1px;padding:20px 0;">AÚN NO HAY NOTAS · Salma guardará aquí las consultas de tu viaje</div>';
        return;
      }
      list.innerHTML = snap.docs.map(function(doc) {
        return isPanel ? renderNotaPanel(doc.id, doc.data(), 'notas_viaje') : renderNotaCard(doc.id, doc.data(), 'notas_viaje');
      }).join('');
    }).catch(function() {
      list.innerHTML = '<div style="color:#f87171;font-size:12px;">Error cargando notas</div>';
    });
}

function loadNotasGlobal(listId) {
  if (!currentUser) return;
  var id   = listId || 'cuaderno-notas-global';
  var list = document.getElementById(id);
  if (!list) return;
  var isPanel = id.indexOf('cpnl') === 0;
  list.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:rgba(245,240,232,.35);letter-spacing:1px;padding:8px 0;">Cargando...</div>';
  db.collection('users').doc(currentUser.uid).collection('notas_globales')
    .orderBy('createdAt','desc').limit(50)
    .get().then(function(snap) {
      if (snap.empty) {
        list.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:rgba(245,240,232,.3);letter-spacing:1px;padding:20px 0;">AÚN NO HAY NOTAS · Aquí quedarán tus consultas de visados, vacunas y más</div>';
        return;
      }
      list.innerHTML = snap.docs.map(function(doc) {
        return isPanel ? renderNotaPanel(doc.id, doc.data(), 'notas_globales') : renderNotaCard(doc.id, doc.data(), 'notas_globales');
      }).join('');
    }).catch(function() {
      list.innerHTML = '<div style="color:#f87171;font-size:12px;">Error cargando notas</div>';
    });
}

function renderNotaCard(id, d, coleccion) {
  var fecha = d.createdAt ? new Date(d.createdAt).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '';
  return '<div style="background:var(--gris);border:1px solid var(--gris2);padding:18px 20px;margin-bottom:8px;">' +
    (d.routeName ? '<div style="font-family:\'Space Mono\',monospace;font-size:8px;color:var(--dorado);letter-spacing:1.5px;margin-bottom:8px;opacity:.7;">' + d.routeName.toUpperCase() + '</div>' : '') +
    '<div style="font-family:\'Space Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:1px;margin-bottom:8px;opacity:.8;">' + (d.pregunta || '') + '</div>' +
    '<div style="font-size:15px;color:var(--crema);opacity:.85;line-height:1.7;">' + (d.respuesta || '') + '</div>' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:8px;color:var(--crema);opacity:.3;">' + fecha + '</div>' +
      '<button onclick="deleteNota(\'' + coleccion + '\',\'' + id + '\',this)" style="background:none;border:none;color:rgba(248,113,113,.4);cursor:pointer;font-size:12px;padding:2px 6px;" title="Eliminar">✕</button>' +
    '</div></div>';
}

function deleteNota(coleccion, id, btn) {
  if (!currentUser) return;
  var card = btn ? btn.closest('div[style*="background:var(--gris)"]') : null;
  if (card) card.style.opacity = '.4';
  db.collection('users').doc(currentUser.uid).collection(coleccion).doc(id).delete()
    .then(function() {
      if (card) card.remove();
      showToast('Nota eliminada');
    }).catch(function() {
      if (card) card.style.opacity = '1';
      showToast('Error al eliminar');
    });
}
window.deleteNota = deleteNota;

// Guardar nota desde el copiloto
function saveNotaCuaderno(pregunta, respuesta, tipo, routeId, routeName) {
  if (!currentUser) return;
  var coleccion = tipo === 'global' ? 'notas_globales' : 'notas_viaje';
  var data = { pregunta: pregunta, respuesta: respuesta, createdAt: new Date().toISOString() };
  if (tipo !== 'global' && routeId) { data.routeId = routeId; data.routeName = routeName || ''; }
  db.collection('users').doc(currentUser.uid).collection(coleccion).add(data)
    .then(function() {
      showToast('✓ Guardado en Mi cuaderno');
      // Recargar panel si está abierto en la pestaña correcta
      var panelOpen = document.getElementById('cuaderno-panel') && document.getElementById('cuaderno-panel').style.display === 'flex';
      if (panelOpen) {
        if (tipo === 'global') loadNotasGlobal('cpnl-notas-global');
        else loadNotasViaje('cpnl-notas-viaje');
      }
    })
    .catch(function() { showToast('Error al guardar la nota'); });
}
window.saveNotaCuaderno = saveNotaCuaderno;

// DOCS
function loadDocs(listId) {
  if (!currentUser) return;
  var list = document.getElementById(listId || 'cuaderno-docs-list');
  if (!list) return;
  list.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:rgba(245,240,232,.35);letter-spacing:1px;padding:8px 0;">Cargando...</div>';
  // Sin orderBy para evitar problema de índices en Firestore
  db.collection('users').doc(currentUser.uid).collection('docs')
    .limit(20)
    .get().then(function(snap) {
      if (snap.empty) {
        list.innerHTML = '<div style="font-family:\'Space Mono\',monospace;font-size:9px;color:rgba(245,240,232,.3);letter-spacing:1px;padding:12px 0;">SIN DOCUMENTOS · Sube tu pasaporte, carnet o seguro aquí</div>';
        return;
      }
      list.innerHTML = snap.docs.map(function(doc) {
        return renderDocCard(doc.id, doc.data());
      }).join('');
    }).catch(function(e) {
      console.error('loadDocs error:', e);
      list.innerHTML = '<div style="color:#f87171;font-size:11px;line-height:1.6;">Error al cargar docs.<br><span style="opacity:.6;">Verifica las reglas de Firestore (ver consola)</span></div>';
    });
}

function renderDocCard(id, d) {
  var fecha = d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}) : '';
  var icon = d.docType === 'pasaporte' ? '🛂' : d.docType === 'conducir' ? '🚗' : d.docType === 'seguro' ? '🏥' : '📄';
  return '<div style="background:var(--gris);border:1px solid var(--gris2);padding:16px 18px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">' +
    '<div style="font-size:24px;flex-shrink:0;">' + icon + '</div>' +
    '<div style="flex:1;min-width:0;">' +
      '<div style="font-family:\'Inter Tight\',sans-serif;font-size:15px;color:var(--blanco);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (d.name || d.fileName || 'Documento') + '</div>' +
      '<div style="font-family:\'Space Mono\',monospace;font-size:8px;color:var(--crema);opacity:.4;">' + fecha + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;flex-shrink:0;">' +
      (d.downloadUrl ? '<a href="' + d.downloadUrl + '" target="_blank" style="background:rgba(212,160,23,.1);border:1px solid rgba(212,160,23,.3);color:var(--dorado);padding:6px 10px;font-family:\'Space Mono\',monospace;font-size:8px;text-decoration:none;letter-spacing:1px;">VER</a>' : '') +
      '<button onclick="deleteDoc(\'' + id + '\',\'' + (d.storageRef||'') + '\',this)" style="background:none;border:none;color:rgba(248,113,113,.4);cursor:pointer;font-size:12px;padding:2px 6px;" title="Eliminar">✕</button>' +
    '</div></div>';
}

function uploadDoc(input) {
  if (!currentUser || !input.files || !input.files[0]) return;
  if (!window._fbStorage) { showToast('Activa Firebase Storage para subir docs'); return; }
  var file = input.files[0];
  if (file.size > 5 * 1024 * 1024) { showToast('El archivo no puede superar 5MB'); input.value = ''; return; }
  var docName = prompt('Nombre del documento:', file.name.replace(/\.[^.]+$/, ''));
  if (!docName) { input.value = ''; return; }
  showToast('Subiendo...');
  var storagePath = 'users/' + currentUser.uid + '/docs/' + Date.now() + '_' + file.name;
  var storageRef = window._fbStorage.ref(storagePath);
  storageRef.put(file).then(function(snap) {
    return snap.ref.getDownloadURL();
  }).then(function(downloadUrl) {
    var n = docName.toLowerCase();
    var docType = n.includes('pasaporte') || n.includes('passport') ? 'pasaporte'
      : n.includes('conducir') || n.includes('carnet') ? 'conducir'
      : n.includes('seguro') || n.includes('poliza') || n.includes('insurance') ? 'seguro'
      : 'otro';
    return db.collection('users').doc(currentUser.uid).collection('docs').add({
      name: docName, fileName: file.name, docType: docType,
      storageRef: storagePath, downloadUrl: downloadUrl,
      uploadedAt: new Date().toISOString()
    });
  }).then(function() {
    showToast('✓ Documento guardado');
    input.value = '';
    loadDocs();
    // Recargar también en el panel si está abierto
    if (document.getElementById('cpnl-docs-list')) loadDocs('cpnl-docs-list');
  }).catch(function(e) {
    showToast('Error al subir: ' + (e.message || ''));
    input.value = '';
  });
}
window.uploadDoc = uploadDoc;

function deleteDoc(id, storagePath, btn) {
  if (!currentUser) return;
  if (!confirm('¿Eliminar este documento?')) return;
  var card = btn ? btn.closest('div[style*="display:flex"]') : null;
  if (card) card.style.opacity = '.4';
  var promises = [db.collection('users').doc(currentUser.uid).collection('docs').doc(id).delete()];
  if (storagePath && window._fbStorage) {
    promises.push(window._fbStorage.ref(storagePath).delete().catch(function(){}));
  }
  Promise.all(promises).then(function() {
    if (card) card.remove();
    showToast('Documento eliminado');
  }).catch(function() {
    if (card) card.style.opacity = '1';
    showToast('Error al eliminar');
  });
}
window.deleteDoc = deleteDoc;

// end of app.js
