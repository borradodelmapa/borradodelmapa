window.onload = function() {
firebase.initializeApp({
  apiKey: "AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA",
  authDomain: "borradodelmapa-85257.firebaseapp.com",
  projectId: "borradodelmapa-85257",
  storageBucket: "borradodelmapa-85257.firebasestorage.app",
  messagingSenderId: "833042338746",
  appId: "1:833042338746:web:32b58e582488c6064d8383"
});
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Exponer al scope global para que Salma pueda guardar rutas
window._fbAuth = auth;
window._fbDb = db;
window._fbGoogleProvider = googleProvider;

// ===== STATE =====
let currentUser = null;
let isPremium = false;
let map = null;
let markers = [];
let polyline = null;

const POIS_DEMO = [
  // Día 1 - Hanoi
  {id:1, name:"Puente Long Bien", type:"🏛️", note:"Icono colonial francés. Mejor al amanecer.", day:1, lat:21.044, lng:105.852},
  {id:2, name:"Pho Thin Bo Ho", type:"🍜", note:"El mejor pho de Hanoi. Abre desde las 6am.", day:1, lat:21.028, lng:105.849},
  {id:3, name:"Hoan Kiem Lake", type:"📸", note:"El lago del espada. Paseo nocturno imprescindible.", day:1, lat:21.028, lng:105.852},
  {id:4, name:"Bun Bo Nam Bo", type:"🍜", note:"Fideos con ternera. Local sin turistas.", day:1, lat:21.031, lng:105.848},
  // Día 2 - Hanoi
  {id:5, name:"Ho Chi Minh Mausoleum", type:"🏛️", note:"Llegar pronto, colas desde las 8am.", day:2, lat:21.037, lng:105.835},
  {id:6, name:"Old Quarter", type:"🏛️", note:"36 calles de artesanos. Perderse es el plan.", day:2, lat:21.033, lng:105.850},
  {id:7, name:"Bia Hoi Corner", type:"🍜", note:"Cerveza a 25 céntimos. Esquina más famosa de Asia.", day:2, lat:21.034, lng:105.851},
  // Día 3 - Ha Giang
  {id:8, name:"Dong Van Geopark", type:"🏛️", note:"Patrimonio UNESCO. Paisaje lunar.", day:3, lat:23.278, lng:105.362},
  {id:9, name:"Ma Pi Leng Pass", type:"📸", note:"El paso de montaña más espectacular de Vietnam.", day:3, lat:23.165, lng:105.354},
  {id:10, name:"Lung Cu Flag Tower", type:"📸", note:"El punto más al norte de Vietnam.", day:3, lat:23.366, lng:105.334},
  // Día 4 - Ninh Binh
  {id:11, name:"Trang An", type:"🏖️", note:"Kayak entre karsts. Reservar con antelación.", day:4, lat:20.253, lng:105.975},
  {id:12, name:"Mua Cave", type:"📸", note:"500 escalones. Las vistas valen cada uno.", day:4, lat:20.218, lng:105.974},
  {id:13, name:"Ninh Binh Local Resto", type:"🍜", note:"Cabra de montaña y arroz. Especialidad local.", day:4, lat:20.253, lng:105.975},
  // Día 5 - Phong Nha
  {id:14, name:"Phong Nha Cave", type:"🏖️", note:"Cueva navegable en barca. Impresionante.", day:5, lat:17.599, lng:106.142},
  {id:15, name:"Hang En Cave", type:"🏖️", note:"3ª cueva más grande del mundo. Trek 2 días.", day:5, lat:17.551, lng:106.081},
  // Día 6 - Hue
  {id:16, name:"Hue Imperial City", type:"🏛️", note:"Ciudad prohibida vietnamita. Medio día.", day:6, lat:16.469, lng:107.578},
  {id:17, name:"Thien Mu Pagoda", type:"🏛️", note:"La pagoda más antigua de Hue.", day:6, lat:16.453, lng:107.546},
  {id:18, name:"Bun Bo Hue", type:"🍜", note:"La sopa más picante de Vietnam. Origen aquí.", day:6, lat:16.463, lng:107.590},
  // Día 7 - Hoi An
  {id:19, name:"Hoi An Ancient Town", type:"🏛️", note:"Casco antiguo UNESCO. Por la tarde con las linternas.", day:7, lat:15.880, lng:108.338},
  {id:20, name:"An Bang Beach", type:"🏖️", note:"La mejor playa cerca de Hoi An.", day:7, lat:15.920, lng:108.373},
  {id:21, name:"White Rose Restaurant", type:"🍜", note:"Especialidad local: banh bao vac.", day:7, lat:15.877, lng:108.329},
  // Día 8 - Da Nang
  {id:22, name:"Marble Mountains", type:"🏛️", note:"Cuevas y pagodas en montañas de mármol.", day:8, lat:16.003, lng:108.263},
  {id:23, name:"My Khe Beach", type:"🏖️", note:"Forbes la eligió top 6 del mundo.", day:8, lat:16.060, lng:108.247},
  // Día 9 - Nha Trang
  {id:24, name:"Po Nagar Towers", type:"🏛️", note:"Torres cham del siglo VII.", day:9, lat:12.265, lng:109.194},
  {id:25, name:"Nha Trang Beach", type:"🏖️", note:"La bahía más bonita de Vietnam.", day:9, lat:12.238, lng:109.197},
  // Día 10 - Mui Ne
  {id:26, name:"Red Sand Dunes", type:"📸", note:"Dunas de arena roja. Al atardecer.", day:10, lat:10.947, lng:108.286},
  {id:27, name:"Fairy Stream", type:"🏖️", note:"Paseo descalzo por el arroyo entre dunas.", day:10, lat:10.933, lng:108.272},
  // Día 11-12 - Ho Chi Minh
  {id:28, name:"Cu Chi Tunnels", type:"🏛️", note:"270km de túneles de la guerra. Imprescindible.", day:11, lat:11.135, lng:106.462},
  {id:29, name:"Ben Thanh Market", type:"🍜", note:"El mercado más famoso de Saigon.", day:11, lat:10.772, lng:106.698},
  {id:30, name:"War Remnants Museum", type:"🏛️", note:"El museo más impactante que verás.", day:12, lat:10.779, lng:106.692},
];

let poiList = [...POIS_DEMO];
let nextPoiId = 100;

const ROUTE_COORDS = [
  [21.028,105.834], // Hanoi
  [23.278,105.362], // Ha Giang
  [20.253,105.975], // Ninh Binh
  [17.551,106.081], // Phong Nha
  [16.463,107.590], // Hue
  [15.880,108.338], // Hoi An
  [16.060,108.247], // Da Nang
  [12.238,109.197], // Nha Trang
  [10.947,108.286], // Mui Ne
  [10.772,106.698], // Ho Chi Minh
];

// ===== AUTH STATE LISTENER =====
auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const userDoc = await db.collection("users").doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      currentUser = {
        uid: user.uid,
        name: userData.name || user.displayName || user.email.split("@")[0],
        email: user.email,
        isPremium: userData.isPremium || false,
        bio: userData.bio || '',
        country: userData.country || '',
        photo: userData.photo || ''
      };
      isPremium = currentUser.isPremium;
      updateNavForUser(currentUser);
      updateSidebar(currentUser);
      
      // Mostrar mobile nav
      const mobileNav = document.getElementById("mobile-dash-nav");
      if (mobileNav) mobileNav.style.display = "flex";
      
      // Cerrar modal de auth si estaba abierto
      closeModal();
      
      // ── Auto-guardar ruta pendiente de Salma ──
      if (window._salmaLastRoute && window._salmaLastRoute.stops) {
        try {
          const r = window._salmaLastRoute;
          const ruta = {
            nombre: r.title || 'Mi ruta',
            destino: r.region || r.country || '',
            dias: r.duration_days || 0,
            desc: r.summary || '',
            itinerarioIA: JSON.stringify(r),
            pois: (r.stops || []).map(function(s, i) {
              return { id: i+1, name: s.name, type: s.type, note: s.description, day: s.day || 1, lat: s.lat, lng: s.lng };
            }),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            published: false
          };
          await db.collection('users').doc(user.uid).collection('maps').add(ruta);
          window._salmaLastRoute = null;
          showToast('¡Bienvenido! Tu ruta se ha guardado automáticamente ✓');
        } catch(saveErr) {
          console.error('Error auto-saving route:', saveErr);
          showToast('Bienvenido. Hubo un error al guardar la ruta automáticamente.');
        }
      }
      
      // Cargar mapas DESPUÉS del posible auto-guardado
      await loadUserMaps();
      
      // Ir al dashboard
      const currentPage = document.querySelector('.page.active');
      if (!currentPage || currentPage.id === 'page-home') {
        showPage('dashboard');
      }
      
    } catch(e) {
      console.error("Error loading user:", e);
    }
  } else {
    currentUser = null;
    isPremium = false;
    updateNavForGuest();
  }
});

// ===== NAVIGATION =====
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
  // Mostrar mobile nav en todas las páginas si hay usuario
  const mobileNav = document.getElementById("mobile-dash-nav");
  if (mobileNav) {
    mobileNav.style.display = currentUser ? "flex" : "none";
  }
  window.scrollTo(0,0);
  if (name === "editor") { /* mapa demo eliminado (sin Leaflet) */ }
}
window.showPage = showPage;

// ===== BLOG =====
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
      list.innerHTML = `<div style="color:var(--crema);opacity:.5;font-size:18px;">Pronto habrá artículos aquí. Mientras tanto, síguenos en <a href="https://instagram.com/borradodelmapa" target="_blank" style="color:var(--dorado);">@borradodelmapa</a></div>`;
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
    list.innerHTML = `<div style="color:var(--crema);opacity:.5;font-size:18px;">Pronto habrá artículos aquí. Mientras tanto, síguenos en <a href="https://instagram.com/borradodelmapa" target="_blank" style="color:var(--dorado);">@borradodelmapa</a></div>`;
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

// Load blog when page is shown
const origShowPage = showPage;
window.showPage = function(name) {
  origShowPage(name);
  if (name === "blog") loadBlog();
};
window.closeBlogPost = closeBlogPost;

// Init: hide all pages except home on load
document.querySelectorAll(".page").forEach(p => {
  if (!p.classList.contains("active")) p.style.display = "none";
});

// ===== AUTH MODAL =====
function openModal(view) {
  document.getElementById("modal-auth").classList.add("active");
  switchModal(view);
}
function closeModal() {
  document.getElementById("modal-auth").classList.remove("active");
}
function switchModal(view) {
  document.getElementById("modal-login-view").style.display = view === "login" ? "block" : "none";
  document.getElementById("modal-register-view").style.display = view === "register" ? "block" : "none";
}
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;

// ===== LOGIN =====
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

// ===== REGISTER =====
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
        name, email, isPremium: false, mapsCount: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(dbErr) {
      console.warn("Firestore no disponible, continuando:", dbErr);
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

// ===== GOOGLE LOGIN =====
async function doSocialLogin() {
  try {
    showToast("Conectando con Google...");
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      await db.collection("users").doc(user.uid).set({
        name: user.displayName || user.email.split("@")[0],
        email: user.email, isPremium: false, mapsCount: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    closeModal();
    showPage("dashboard");
  } catch(e) {
    showToast("Error con Google. Intenta con email.");
  }
}
window.doSocialLogin = doSocialLogin;

// ===== LOGOUT =====
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

// ===== LOAD MAPS FROM FIRESTORE =====
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

function renderMapsGrid(maps) {
  const grid = document.getElementById("maps-grid-dynamic");
  if (!grid) return;

  const el = document.getElementById('profile-routes-count');
  if (el) el.textContent = maps.length;

  // Fotos por destino/país — Unsplash con búsqueda por keyword
  const destPhoto = (d='') => {
    d = d.toLowerCase();
    if (d.includes('vietnam')) return 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=200&fit=crop&q=75';
    if (d.includes('japon') || d.includes('japan') || d.includes('japón')) return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop&q=75';
    if (d.includes('tailandia') || d.includes('thailand')) return 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=200&fit=crop&q=75';
    if (d.includes('islandia') || d.includes('iceland')) return 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=200&fit=crop&q=75';
    if (d.includes('marruecos') || d.includes('morocco')) return 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400&h=200&fit=crop&q=75';
    if (d.includes('peru') || d.includes('perú')) return 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=200&fit=crop&q=75';
    if (d.includes('india')) return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop&q=75';
    if (d.includes('italia') || d.includes('italy')) return 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=200&fit=crop&q=75';
    if (d.includes('españa') || d.includes('spain') || d.includes('andaluc')) return 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400&h=200&fit=crop&q=75';
    if (d.includes('grecia') || d.includes('greece')) return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=200&fit=crop&q=75';
    if (d.includes('mexico') || d.includes('méxico')) return 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&h=200&fit=crop&q=75';
    if (d.includes('nepal')) return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=200&fit=crop&q=75';
    if (d.includes('camboya') || d.includes('cambodia')) return 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&h=200&fit=crop&q=75';
    if (d.includes('bali') || d.includes('indonesia')) return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=200&fit=crop&q=75';
    if (d.includes('portugal')) return 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop&q=75';
    if (d.includes('turqu') || d.includes('turkey')) return 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=200&fit=crop&q=75';
    // Default: foto genérica de viaje
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop&q=75';
  };

  let html = maps.map(m => {
    const photo = destPhoto(m.destino || m.country || m.nombre || '');
    const name = (m.nombre || m.title || 'Mi ruta').replace(/</g,'&lt;');
    const meta = (m.dias||m.days||0) + ' días · ' + (m.destino||m.country||'Destino');
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

  // Botón nueva ruta
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
      <div style="font-size:15px;color:rgba(245,240,232,.65);line-height:1.7;max-width:440px;margin:0 auto 24px;">Cuéntale a Salma adónde quieres ir y ella te monta la ruta completa con paradas, consejos y todo lo que necesitas.</div>
      <button onclick="newMap()" style="background:#d4a017;color:#0a0908;border:none;border-radius:14px;padding:16px 32px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.14em;cursor:pointer;transition:background .2s;" onmouseover="this.style.background='#e0b84a'" onmouseout="this.style.background='#d4a017'">CREAR MI PRIMERA RUTA →</button>
      <div style="font-size:13px;color:rgba(245,240,232,.4);margin-top:8px;">Solo te llevará un minuto. Salma se encarga del resto.</div>
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
  } catch(e) {
    showToast('Error al eliminar');
  }
}
window.eliminarRuta = eliminarRuta;

// ===== NEW MAP =====
function newMap() {
  if (!currentUser) { openModal('register'); return; }
  // Llevar al hero y enfocar el input de Salma
  showPage('home');
  setTimeout(function() {
    var input = document.getElementById('salma-hero-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
}
window.newMap = newMap;

// Legacy aliases
async function crearRuta() { newMap(); }
window.crearRuta = crearRuta;
async function generarRutaConIA() { newMap(); }
window.generarRutaConIA = generarRutaConIA;


// ===== SAVE PROFILE =====
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
    console.error("saveProfile error:", e);
    showToast("Error: " + e.message);
  }
}
window.saveProfile = saveProfile;

// ===== DEMO ACCORDION DATA =====
const ITINERARIO_DATA = [
  {n:"01",dias:"Días 1–2",km:"Punto de partida",ciudad:"Hanoi",desc:"Capital con 1.000 años de historia. Pasea por el Casco Antiguo de 36 calles gremiales, visita el Mausoleo de Ho Chi Minh y el Templo de la Literatura. Come bún chả en los puestos callejeros. Clave para alquilar la moto y afinar el equipaje.",pois:["Hoan Kiem Lake","Old Quarter 36 calles","Street Food","Ho Chi Minh Mausoleum","Temple of Literature"],alt:"Barrio de Ba Dinh y Tay Ho (West Lake): mercado de flores Quảng Bá al amanecer, templo Trấn Quốc y los cafés de especialidad de Đặng Thai Mai Street.",altmap:"https://www.google.com/maps/dir/Hoan+Kiem+Lake,+Hanoi/Tay+Ho+District,+Hanoi/Tran+Quoc+Pagoda,+Hanoi",booking:"https://www.booking.com/searchresults.es.html?ss=Hanoi&nflt=price%3DEUR-max-20-1"},
  {n:"02",dias:"Días 3–6",km:"320 km desde Hanoi",ciudad:"Ha Giang Loop",desc:"El bucle de montaña más espectacular del sudeste asiático. 4 días por la meseta kárstica de Dong Van, el paso Mã Pí Lèng a 1.400 m sobre el cañón del río Nho Quế, aldeas H'Mong y Dao.",pois:["Mã Pí Lèng Pass","Dong Van Plateau","Lung Cu Flag Tower","Nho Quế River"],alt:"Extensión Bac Me → Na Hang: un 80% menos de turistas, paisaje igual de épico y pueblos de minoría Tay completamente auténticos.",altmap:"https://www.google.com/maps/dir/Ha+Giang,+Vietnam/Bac+Me,+Ha+Giang/Na+Hang,+Tuyen+Quang,+Vietnam",booking:"https://www.booking.com/searchresults.es.html?ss=Ha+Giang&nflt=price%3DEUR-max-20-1"},
  {n:"03",dias:"Días 7–8",km:"90 km desde Hanoi",ciudad:"Ninh Binh / Tam Coc",desc:"La Bahía de Ha Long terrestre. Barcas de remo entre picos calizos, el mirador de Mua Cave con 500 escalones, la antigua capital imperial de Hoa Lu y la zona UNESCO de Trang An.",pois:["Tam Coc","Mua Cave","Trang An UNESCO","Hoa Lu","Van Long"],alt:"Van Long Nature Reserve: 20 km de Tam Coc, 90% menos turistas, monos langur dorados y reflejos perfectos al amanecer.",altmap:"https://www.google.com/maps/place/Van+Long+Nature+Reserve,+Ninh+Binh,+Vietnam/@20.348,105.825",booking:"https://www.booking.com/searchresults.es.html?ss=Ninh+Binh&nflt=price%3DEUR-max-20-1"},
  {n:"04",dias:"Días 9–11",km:"500 km desde Ninh Binh",ciudad:"Phong Nha-Kẻ Bàng",desc:"El parque nacional con las cuevas más grandes del mundo. Paradise Cave (31 km), Dark Cave con kayak y tirolina, Phong Nha Cave en barca por el río subterráneo.",pois:["Paradise Cave","Dark Cave kayak","Phong Nha Cave","Ho Chi Minh Road"],alt:"Tu Lan Cave System: expedición 2 días con Oxalis Adventures. Natación subterránea en ríos de cuevas vírgenes — la experiencia más brutal de Vietnam.",altmap:"https://www.google.com/maps/place/Tu+Lan+Cave,+Quang+Binh,+Vietnam/@17.65,105.95",booking:"https://www.booking.com/searchresults.es.html?ss=Phong+Nha&nflt=price%3DEUR-max-20-1"},
  {n:"05",dias:"Días 12–13",km:"200 km desde Phong Nha",ciudad:"Huế",desc:"La antigua capital imperial de Vietnam. La Ciudadela UNESCO, los mausoleos reales en la jungla, la Pagoda Thien Mu y la gastronomía de la corte imperial.",pois:["Ciudadela UNESCO","Mausoleo Tu Duc","Pagoda Thien Mu","Río Perfume","Bún Bò Huế"],alt:"Bach Ma National Park: 45 km en moto, sube 1.450 m entre niebla y selva hasta ruinas de una estación francesa. Casi sin turistas.",altmap:"https://www.google.com/maps/dir/Hue,+Vietnam/Bach+Ma+National+Park,+Vietnam",booking:"https://www.booking.com/searchresults.es.html?ss=Hue+Vietnam&nflt=price%3DEUR-max-20-1"},
  {n:"06",dias:"Días 14–16",km:"130 km desde Huế",ciudad:"Hải Vân → Hội An",desc:"El paso de las nubes Hải Vân en moto y la llegada al casco antiguo UNESCO de Hội An. Linternas de seda sobre el río Thu Bon, sastres a medida en 24h y las ruinas Cham de Mỹ Sơn.",pois:["Hai Van Pass","Casco antiguo UNESCO","Linternas Thu Bon","Mỹ Sơn Cham","An Bang Beach"],alt:"Pueblo alfarero Thanh Ha: alfareros con torno de pie desde el siglo XV. Combínalo con Mỹ Sơn en tarde para un día perfecto fuera del circuito.",altmap:"https://www.google.com/maps/dir/Hoi+An+Old+Town/Thanh+Ha+Pottery+Village,+Hoi+An/My+Son+Sanctuary,+Vietnam",booking:"https://www.booking.com/searchresults.es.html?ss=Hoi+An&nflt=price%3DEUR-max-20-1"},
  {n:"07",dias:"Días 17–18",km:"530 km desde Hội An",ciudad:"Nha Trang",desc:"La capital del buceo en Vietnam. Seis kilómetros de playa blanca, arrecifes de coral en las islas y las torres Cham de Po Nagar del siglo VII.",pois:["Hon Mun diving","Torres Po Nagar","Playa 6 km","Long Son Pagoda"],alt:"Parada en Quy Nhon: la cala de Bãi Xép y la isla de Kỳ Co tienen agua turquesa igual que Nha Trang pero con un 95% menos de turistas.",altmap:"https://www.google.com/maps/dir/Hoi+An,+Vietnam/Bai+Xep+Beach,+Quy+Nhon,+Vietnam/Ky+Co+Island,+Quy+Nhon/Nha+Trang,+Vietnam",booking:"https://www.booking.com/searchresults.es.html?ss=Nha+Trang&nflt=price%3DEUR-max-20-1"},
  {n:"08",dias:"Días 19–21",km:"200 km desde Nha Trang",ciudad:"Đà Lạt",desc:"La ciudad de los pinos a 1.500 m. Arquitectura colonial francesa, la Crazy House de Hang Nga, plantaciones de weasel coffee y la cascada Datanla.",pois:["Crazy House","Weasel coffee","Datanla Falls","Lago Xuân Hương","Mercado nocturno"],alt:"Plantaciones de té Cau Dat: terrazas a 1.500 m, una de las vistas más fotogénicas de todo Vietnam y apenas aparecen en las guías.",altmap:"https://www.google.com/maps/dir/Da+Lat,+Vietnam/Cau+Dat+Tea+Farm,+Lac+Duong,+Lam+Dong,+Vietnam",booking:"https://www.booking.com/searchresults.es.html?ss=Da+Lat&nflt=price%3DEUR-max-20-1"},
  {n:"09",dias:"Días 22–25",km:"✈️ Vuelo DLI → HAN",ciudad:"Regreso a Hanoi",desc:"Vuelo Đà Lạt → Hanoi en 45 minutos. Últimos días para vender la moto, el bún chả que comió Obama, la bia hoi a 20 céntimos, y cerrar el círculo en Hoan Kiem.",pois:["Venta moto","Bún chả Obama","Bia Hoi Corner","Hoan Kiem cierre"],alt:"Da Lat → Mui Ne → bus nocturno: ruta por las dunas de arena roja. Vende la moto en Mui Ne y toma el sleeper bus a Hanoi (12h, ~15€).",altmap:"https://www.google.com/maps/dir/Da+Lat,+Vietnam/Mui+Ne,+Phan+Thiet,+Vietnam/Hanoi,+Vietnam",booking:"https://www.booking.com/searchresults.es.html?ss=Hanoi&nflt=price%3DEUR-max-20-1"}
];

const CONSEJOS_DATA = [
  {icon:"🏍",titulo:"Qué moto elegir",texto:"Honda Win o Minsk para rutas largas (~300–500 USD). Para Ha Giang mínimo 150cc. Compra en Hanoi, vende en Hanoi o Saigón. Mr. Pumpy y Tigit Motorbikes son los más fiables."},
  {icon:"📄",titulo:"Documentación",texto:"Carnet internacional categoría A. E-Visa de 90 días online (~25 USD). Fotocopias del pasaporte siempre encima. Seguro de moto 5–10 USD/mes."},
  {icon:"🛡",titulo:"Seguridad vial",texto:"Casco integral, no de cuenco. El tráfico vietnamita tiene su lógica: fluye, cede, no confrontes. Nunca conduzcas de noche. Ha Giang tiene tramos sin guardarraíl sobre precipicios de 500 m."},
  {icon:"🌧",titulo:"Mejor época",texto:"Nov–Feb para norte y centro. El sur es seco todo el año. Ha Giang en octubre (cosecha del arroz amarillo) es mágico. Evita el monzón del norte: mayo–septiembre."},
  {icon:"🔧",titulo:"Mecánicos",texto:"Cada pocos km hay un taller. Reparaciones de 1 a 5 USD. Lleva parches, aceite de cadena y cable de embrague de repuesto."},
  {icon:"💊",titulo:"Salud y seguro",texto:"Seguro con cobertura de moto obligatorio: World Nomads o SafetyWing. Vacunas: hepatitis A/B y tifoidea. Botiquín con antidiarreicos y antihistamínico."}
];

const RECOMENDACIONES_DATA = [
  {icon:"🏙",ciudad:"Hanoi",tip:"No te quedes más de dos días. El Old Quarter se ve en uno. El segundo: Museo de Etnología por la mañana, Tay Ho al atardecer y la esquina de la bia hoi por la noche."},
  {icon:"⛰",ciudad:"Ha Giang",tip:"Hazlo en sentido antihorario. Yendo al revés evitas los grupos y tienes el paso Mã Pí Lèng con luz de tarde, que es cuando la fotografía es espectacular."},
  {icon:"🚣",ciudad:"Ninh Binh",tip:"Madrugar o nada. Las barcas de Tam Coc al amanecer son otra cosa. A las 7am estás solo. A las 9am hay 50 barcas."},
  {icon:"🦇",ciudad:"Phong Nha",tip:"Reserva Dark Cave. Paradise Cave impresiona, pero Dark Cave es la que recuerdas: kayak, tirolina, nado en barro blanco."},
  {icon:"👑",ciudad:"Huế",tip:"Céntrate en los mausoleos. Tu Duc y Khai Dinh en un día en moto, luego Thien Mu al atardecer. Cena bún bò Huế en puesto local, no en restaurante turístico."},
  {icon:"🏖",ciudad:"Hội An",tip:"Merece tres días. Casco antiguo antes de las 8am. Mỹ Sơn el segundo día. Playa de An Bang el tercero. Si te haces ropa, lleva foto y da 48h al sastre."},
  {icon:"🤿",ciudad:"Nha Trang",tip:"Para una noche en Quy Nhon. El trayecto de 530 km es largo — la cala de Bãi Xép tiene el agua más clara de Vietnam central."},
  {icon:"☕",ciudad:"Đà Lạt",tip:"Sube a Cau Dat. Las terrazas de té a 1.500 m son una de las imágenes más bonitas del viaje. El frío nocturno es un lujo después de semanas de calor."}
];

// ===== DEMO ACCORDION =====
function toggleDemo(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);
  if (!el) return;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if (icon) icon.textContent = isOpen ? '＋' : '－';
  if (!isOpen) {
    if (id === 'mapas-diarios') { /* mapas diarios eliminados (sin Leaflet) */ }
    if (id === 'itinerario') renderItinerario();
    if (id === 'presupuesto') renderConsejos();
    if (id === 'recomendaciones') renderRecomendaciones();
  }
}
window.toggleDemo = toggleDemo;

function renderItinerario() {
  const el = document.getElementById('itinerario');
  if (!el || el.innerHTML.trim()) return;
  el.innerHTML = ITINERARIO_DATA.map(p => `
    <div style="border-bottom:1px solid var(--gris2);padding:28px 24px;">
      <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--dorado);letter-spacing:2px;margin-bottom:6px;">${p.n} · ${p.dias} · ${p.km}</div>
      <div style="font-family:'Inter Tight',sans-serif;font-size:24px;color:var(--blanco);margin-bottom:12px;">${p.ciudad}</div>
      <div style="font-size:15px;color:var(--crema);opacity:.82;line-height:1.75;margin-bottom:16px;">${p.desc}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;">${p.pois.map(poi=>`<span style="font-family:'Space Mono',monospace;font-size:10px;background:#d4a017;color:var(--dorado);padding:5px 10px;border:1px solid #d4a017;">${poi}</span>`).join('')}</div>
      <div style="background:#d4a017;border-left:2px solid var(--dorado);padding:12px 16px;margin-bottom:18px;">
        <div style="font-family:'Space Mono',monospace;font-size:10px;color:#c8930f;letter-spacing:1.4px;margin-bottom:10px;font-weight:700;">RUTA ALTERNATIVA</div>
        <div style="font-size:18px;color:var(--crema);opacity:.7;line-height:1.7;margin-bottom:10px;">${p.alt}</div>
        <a href="${p.altmap}" target="_blank" class="demo-map-btn">🗺 VER EN GOOGLE MAPS</a>
      </div>
      <a href="${p.booking}" target="_blank" class="demo-booking-btn">🏨 BOOKING &lt;20€/NOCHE</a>
    </div>`).join('');
}

function renderConsejos() {
  const el = document.getElementById('presupuesto');
  if (!el || el.innerHTML.trim()) return;
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1px;margin-bottom:1px;">
      ${CONSEJOS_DATA.map(c=>`
        <div style="background:var(--negro);padding:24px;border:1px solid var(--gris2);">
          <div style="font-family:'Space Mono',monospace;font-size:11px;color:var(--dorado);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">${c.titulo}</div>
          <div style="font-size:18px;color:var(--crema);opacity:.75;line-height:1.75;">${c.texto}</div>
        </div>`).join('')}
    </div>
    <div style="background:var(--negro);border:1px solid var(--gris2);padding:24px;margin-top:1px;">
      <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--dorado);letter-spacing:2px;margin-bottom:20px;">PRESUPUESTO ESTIMADO · 25 DÍAS</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:16px;">
        ${[["~400€","Moto compra+venta"],["~10€/día","Alojamiento"],["~8€/día","Comida"],["~5€/día","Gasolina"],["~1.100€","TOTAL 25 días"]].map(([v,l])=>`
          <div><div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--dorado);">${v}</div><div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--crema);opacity:.5;letter-spacing:1px;margin-top:4px;">${l}</div></div>`).join('')}
      </div>
    </div>`;
}

function renderRecomendaciones() {
  const el = document.getElementById('recomendaciones');
  if (!el || el.innerHTML.trim()) return;
  el.innerHTML = RECOMENDACIONES_DATA.map(r=>`
    <div style="border-bottom:1px solid var(--gris2);padding:20px 0;">
      <div style="font-family:'Space Mono',monospace;font-size:10px;color:var(--dorado);letter-spacing:2px;margin-bottom:8px;">${r.ciudad.toUpperCase()}</div>
      <div style="font-size:15px;color:var(--crema);opacity:.82;line-height:1.75;">${r.tip}</div>
    </div>`).join('');
}

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}
window.toggleUserMenu = toggleUserMenu;

function verRuta(id, nombre) {
  if (!currentUser) return;
  
  // Cerrar modal si estaba abierto (legacy)
  var oldModal = document.getElementById('modal-editar-ruta');
  if (oldModal) oldModal.style.display = 'none';
  
  db.collection('users').doc(currentUser.uid).collection('maps').doc(id).get().then(doc => {
    if (!doc.exists) return;
    const r = doc.data();
    const container = document.getElementById('ruta-view-container');
    if (!container) return;

    // Parsear datos
    var routeData = null;
    if (r.itinerarioIA) {
      try { routeData = JSON.parse(r.itinerarioIA); } catch(e) {}
    }
    
    var pois = [];
    if (routeData && routeData.stops && routeData.stops.length > 0) {
      pois = routeData.stops;
    } else if (r.pois && r.pois.length > 0) {
      pois = r.pois;
    }

    var typeIcons = {city:'🏙',town:'🏘',nature:'🌿',beach:'🏖',mountain:'⛰',temple:'🛕',viewpoint:'📸',route:'🛤',activity:'🎯',other:'📍'};

    // Paradas HTML (agrupadas por día, botón de ruta por día)
    var stopsHTML = '';
    if (pois.length > 0) {
      var country = routeData && routeData.country ? ' ' + routeData.country : '';

      var byDay = {};
      pois.forEach(function(stop) {
        var day = stop.day || 1;
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(stop);
      });

      var days = Object.keys(byDay).map(Number).sort(function(a,b) { return a-b; });

      stopsHTML = '<div style="margin-top:24px;">';
      stopsHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:14px;">PARADAS (' + pois.length + ')</div>';

      days.forEach(function(day) {
        var dayPois = byDay[day];

        var dayRoute = '';
        if (dayPois.length === 1) {
          dayRoute = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((dayPois[0].name || '') + country);
        } else {
          dayRoute = 'https://www.google.com/maps/dir/' + dayPois.map(function(p) {
            return encodeURIComponent((p.name || '') + country);
          }).join('/');
        }

        stopsHTML += '<div style="display:flex;align-items:center;justify-content:space-between;margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid rgba(212,160,23,.2);">';
        stopsHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;">DÍA ' + day + '</div>';
        stopsHTML += '<a href="' + dayRoute + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;background:var(--dorado);color:#0a0908;padding:6px 12px;border-radius:8px;text-decoration:none;letter-spacing:.1em;font-weight:700;">RUTA DÍA ' + day + ' →</a>';
        stopsHTML += '</div>';

        dayPois.forEach(function(stop) {
          var icon = typeIcons[stop.type] || '📍';
          var sname = (stop.name || '').replace(/</g,'&lt;');
          var sdesc = (stop.description || stop.note || '').replace(/</g,'&lt;');
          var stopUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((stop.name || stop.headline || '') + country);

          stopsHTML += '<div style="display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid rgba(212,160,23,.06);">';
          stopsHTML += '<div style="min-width:32px;text-align:center;"><span style="font-size:22px;">' + icon + '</span></div>';
          stopsHTML += '<div style="flex:1;">';
          stopsHTML += '<div style="font-size:16px;font-weight:600;color:#fff;margin-bottom:4px;">' + sname + '</div>';
          if (sdesc) stopsHTML += '<div style="font-size:14px;color:rgba(245,240,232,.7);line-height:1.65;margin-bottom:6px;">' + sdesc + '</div>';
          stopsHTML += '<a href="' + stopUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;">VER EN MAPA →</a>';
          stopsHTML += '</div></div>';
        });
      });

      stopsHTML += '</div>';
    }

    // Tips
    var tipsHTML = '';
    if (routeData && routeData.tips && routeData.tips.length > 0) {
      tipsHTML = '<div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(212,160,23,.12);">';
      tipsHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:12px;">CONSEJOS DE SALMA</div>';
      routeData.tips.forEach(function(tip) {
        tipsHTML += '<div style="font-size:14px;color:rgba(245,240,232,.7);line-height:1.65;margin-bottom:8px;">• ' + (tip || '').replace(/</g,'&lt;') + '</div>';
      });
      tipsHTML += '</div>';
    }

    // Texto plano si no hay JSON
    var textHTML = '';
    if (!routeData && r.itinerarioIA) {
      textHTML = '<div style="margin-top:20px;padding:16px;background:rgba(255,255,255,.02);border:1px solid rgba(212,160,23,.1);border-radius:14px;">';
      textHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.14em;margin-bottom:8px;">ITINERARIO</div>';
      textHTML += '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.7;white-space:pre-wrap;">' + r.itinerarioIA.replace(/</g,'&lt;') + '</div>';
      textHTML += '</div>';
    }

    // Tags
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

    // Descripción sin duplicados
    var descText = '';
    if (summary && r.desc && summary !== r.desc.replace(/</g,'&lt;')) {
      descText = '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + summary + '</div>';
    } else if (summary) {
      descText = '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + summary + '</div>';
    } else if (r.desc) {
      descText = '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + r.desc.replace(/</g,'&lt;') + '</div>';
    }

    // Renderizar en la página (sin mapa Leaflet; enlace a Google Maps por nombre)
    container.innerHTML = 
      // Botón volver
      '<div style="padding:16px 24px 0;">' +
        '<div onclick="showPage(\'dashboard\')" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.12em;padding:8px 0;transition:opacity .2s;opacity:.8;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'.8\'">← MIS RUTAS</div>' +
      '</div>' +
      // Header
      '<div style="padding:24px 24px 0;">' +
        '<div style="font-family:\'Inter Tight\',sans-serif;font-size:28px;font-weight:700;color:#fff;line-height:1.1;letter-spacing:-.02em;">' + (r.nombre||'Mi ruta').replace(/</g,'&lt;') + '</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.14em;margin-top:8px;">' + (r.dias||0) + ' DÍAS · ' + (r.destino||'').replace(/</g,'&lt;').toUpperCase() + budget + ' · ' + pois.length + ' PARADAS</div>' +
      '</div>' +
      // Content
      '<div style="padding:20px 24px 40px;">' +
        descText +
        tagsHTML +
        stopsHTML +
        tipsHTML +
        textHTML +
        // Botones de acción
        '<div style="display:flex;gap:10px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(212,160,23,.1);flex-wrap:wrap;">' +
          '<button onclick="editarRutaModal(\'' + id + '\')" style="flex:1;min-width:100px;background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:12px;color:var(--dorado);padding:14px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.12em;">EDITAR</button>' +
          '<button onclick="showPage(\'dashboard\')" style="flex:1;min-width:100px;background:transparent;border:1px solid rgba(212,160,23,.1);border-radius:12px;color:rgba(245,240,232,.5);padding:14px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.12em;">VOLVER</button>' +
        '</div>' +
      '</div>';

    // Cambiar a la página de ruta
    showPage('ruta');
  }).catch(e => showToast('Error: ' + e.message));
}
window.verRuta = verRuta;

// Función para abrir el modal de edición desde la vista de ruta
function editarRutaModal(id) {
  if (!currentUser) return;
  db.collection('users').doc(currentUser.uid).collection('maps').doc(id).get().then(doc => {
    if (!doc.exists) return;
    const r = doc.data();
    const modal = document.getElementById('modal-editar-ruta');
    if (!modal) return;
    modal.innerHTML = 
      '<div style="background:#111;border:1px solid rgba(212,160,23,.2);border-radius:18px;padding:32px;max-width:480px;width:100%;margin:auto;" onclick="event.stopPropagation()">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;">EDITAR RUTA</div>' +
          '<div onclick="document.getElementById(\'modal-editar-ruta\').style.display=\'none\'" style="cursor:pointer;color:var(--crema);opacity:.5;font-size:20px;">✕</div>' +
        '</div>' +
        '<label class="form-label">Nombre</label>' +
        '<input class="form-input" id="edit-ruta-nombre" value="' + (r.nombre||'').replace(/"/g,'&quot;') + '">' +
        '<label class="form-label">Destino</label>' +
        '<input class="form-input" id="edit-ruta-destino" value="' + (r.destino||'').replace(/"/g,'&quot;') + '">' +
        '<label class="form-label">Días</label>' +
        '<input class="form-input" id="edit-ruta-dias" type="number" value="' + (r.dias||0) + '">' +
        '<label class="form-label">Descripción</label>' +
        '<textarea class="form-input" id="edit-ruta-desc" style="height:80px;resize:none;">' + (r.desc||'').replace(/</g,'&lt;') + '</textarea>' +
        '<label class="form-label">Notas / Presupuesto</label>' +
        '<textarea class="form-input" id="edit-ruta-notas" style="height:80px;resize:none;" placeholder="Presupuesto, notas importantes...">' + (r.notas||'').replace(/</g,'&lt;') + '</textarea>' +
        '<div style="display:flex;gap:12px;margin-top:16px;">' +
          '<button onclick="document.getElementById(\'modal-editar-ruta\').style.display=\'none\'" style="flex:1;background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:12px;color:var(--crema);padding:12px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.1em;">CANCELAR</button>' +
          '<button onclick="guardarEdicionRuta(\'' + id + '\')" style="flex:2;background:var(--dorado);border:none;border-radius:12px;color:var(--negro);padding:12px;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:.1em;">GUARDAR →</button>' +
        '</div>' +
      '</div>';
    modal.style.display = 'flex';
  });
}
window.editarRutaModal = editarRutaModal;

async function guardarEdicionRuta(id) {
  const nombre = document.getElementById('edit-ruta-nombre').value.trim();
  const destino = document.getElementById('edit-ruta-destino').value.trim();
  const dias = parseInt(document.getElementById('edit-ruta-dias').value) || 0;
  const desc = document.getElementById('edit-ruta-desc').value.trim();
  const notas = document.getElementById('edit-ruta-notas').value.trim();
  if (!nombre || !currentUser) return;
  try {
    await db.collection('users').doc(currentUser.uid).collection('maps').doc(id).update({
      nombre, destino, dias, desc, notas,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('modal-editar-ruta').style.display = 'none';
    showToast('Ruta actualizada ✓');
    loadUserMaps();
  } catch(e) {
    showToast('Error: ' + e.message);
  }
}
window.guardarEdicionRuta = guardarEdicionRuta;

// Cerrar menú usuario al hacer click fuera
document.addEventListener('click', function(e) {
  const avatar = document.getElementById('nav-avatar');
  const menu = document.getElementById('user-menu');
  if (menu && menu.style.display !== 'none' && avatar && !avatar.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function setDashTab(tab, el) {
  // Ocultar todos los tabs
  document.querySelectorAll(".dash-content").forEach(c => c.style.display = "none");
  // Mostrar el tab correcto
  const target = document.getElementById("dash-tab-" + tab);
  if (target) target.style.display = "block";
  // Actualizar sidebar
  document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
  // Actualizar mobile nav
  document.querySelectorAll(".mobile-nav-item").forEach(i => i.classList.remove("active"));
  if (el) el.classList.add("active");
}
window.setDashTab = setDashTab;

// ===== MAP EDITOR (sin Leaflet: solo lista de POIs) =====
const BOOKING_LINKS = {
  1:  {city:"Hanoi",     url:"https://www.booking.com/searchresults.es.html?ss=Hanoi&nflt=price%3D1-20"},
  2:  {city:"Hanoi",     url:"https://www.booking.com/searchresults.es.html?ss=Hanoi&nflt=price%3D1-20"},
  3:  {city:"Ha Giang",  url:"https://www.booking.com/searchresults.es.html?ss=Ha+Giang&nflt=price%3D1-20"},
  4:  {city:"Ninh Binh", url:"https://www.booking.com/searchresults.es.html?ss=Ninh+Binh&nflt=price%3D1-20"},
  5:  {city:"Phong Nha", url:"https://www.booking.com/searchresults.es.html?ss=Phong+Nha&nflt=price%3D1-20"},
  6:  {city:"Hue",       url:"https://www.booking.com/searchresults.es.html?ss=Hue+Vietnam&nflt=price%3D1-20"},
  7:  {city:"Hoi An",    url:"https://www.booking.com/searchresults.es.html?ss=Hoi+An&nflt=price%3D1-20"},
  8:  {city:"Da Nang",   url:"https://www.booking.com/searchresults.es.html?ss=Da+Nang&nflt=price%3D1-20"},
  9:  {city:"Nha Trang", url:"https://www.booking.com/searchresults.es.html?ss=Nha+Trang&nflt=price%3D1-20"},
  10: {city:"Mui Ne",    url:"https://www.booking.com/searchresults.es.html?ss=Mui+Ne&nflt=price%3D1-20"},
  11: {city:"Ho Chi Minh",url:"https://www.booking.com/searchresults.es.html?ss=Ho+Chi+Minh&nflt=price%3D1-20"},
  12: {city:"Ho Chi Minh",url:"https://www.booking.com/searchresults.es.html?ss=Ho+Chi+Minh&nflt=price%3D1-20"},
};

function renderPoiList() {
  const el = document.getElementById("poi-list-editor");
  if (!el) return;
  // Group by day
  const days = [...new Set(poiList.map(p => p.day))].sort((a,b) => a-b);
  el.innerHTML = days.map(day => {
    const booking = BOOKING_LINKS[day];
    const pois = poiList.filter(p => p.day === day);
    return `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--gris2);">
          <div style="font-family:'Space Mono',monospace;font-size:9px;color:var(--dorado);letter-spacing:1px;">DÍA ${day}${booking ? " · " + booking.city : ""}</div>
          ${booking ? `<a href="${booking.url}" target="_blank" style="font-family:'Space Mono',monospace;font-size:9px;color:var(--negro);background:var(--dorado);padding:3px 8px;text-decoration:none;letter-spacing:1px;">🏨 BOOKING</a>` : ""}
        </div>
        ${pois.map(poi => `
          <div class="poi-item-editor">
            <div class="poi-emoji">${poi.type}</div>
            <div class="poi-info-editor">
              <div class="poi-name-editor">${poi.name}</div>
              <div class="poi-meta-editor">${poi.note||"Sin nota"}</div>
            </div>
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
  showToast("Dia " + (day === 0 ? "completo" : day) + " seleccionado");
}
window.setDay = setDay;

function mapZoom(dir) { /* sin Leaflet */ }
window.initMap = function() { renderPoiList(); };
window.mapZoom = mapZoom;

function centerMap() { /* sin Leaflet */ }
window.centerMap = centerMap;

// ===== POI MODAL =====
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
  const center = { lat: 16.5, lng: 106.5 };
  const newPoi = {
    id: nextPoiId++, name, type, note, day: 1,
    lat: center.lat + (Math.random()-.5)*.5,
    lng: center.lng + (Math.random()-.5)*.5
  };
  poiList.push(newPoi);

  // Save to Firestore if logged in
  if (currentUser) {
    try {
      await db.collection("users").doc(currentUser.uid).collection("pois").add({
        name, type, note, day: 1,
        lat: newPoi.lat, lng: newPoi.lng,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) { console.error("Error saving poi:", e); }
  }

  renderPoiList();
  closePoiModal();
  showToast("📍 " + name + " anadido al mapa");
}
window.addPoi = addPoi;

// ===== TOAST =====
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

function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({behavior:"smooth"});
}
window.scrollTo2 = scrollTo;


// ===== KEYBOARD =====
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closePoiModal(); }
});
document.getElementById("modal-auth").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});
document.getElementById("poi-modal").addEventListener("click", function(e) {
  if (e.target === this) closePoiModal();
});
}; // end window.onload

