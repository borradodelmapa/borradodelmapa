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
  // Ocultar botón flotante de Salma en el hero (ya tiene input propio)
  const salmaBtn = document.getElementById("salma-btn");
  const salmaChat = document.getElementById("salma-chat");
  if (salmaBtn) {
    salmaBtn.style.display = (name === "home") ? "none" : "flex";
  }
  // Cerrar chat de Salma al cambiar de página
  if (salmaChat && salmaChat.classList.contains("open")) {
    salmaChat.classList.remove("open");
  }
  window.scrollTo(0,0);
  if (name === "editor") setTimeout(initDemoMap, 100);
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
  
  const SALMA_SVG = '<img src="data:image/png;base64,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" width="32" height="32" style="border-radius:50%;">';
  
  let modal = document.getElementById('modal-nueva-ruta');
  if (modal) {
    const msgs = document.getElementById('salma-create-messages');
    if (msgs) msgs.innerHTML = '<div style="display:flex;gap:10px;align-items:flex-start;"><div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;border:1.5px solid #d4a017;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1816;">' + SALMA_SVG + '</div><div class="salma-msg bot" style="margin:0;">¡Buenas! ¿Adónde vamos? Cuéntame tu viaje: destino, días, estilo... lo que tengas. Yo me encargo. 🌍</div></div>';
    modal.style.display = 'flex';
    window._salmaCreateHistory = [];
    setTimeout(function() { var inp = document.getElementById('salma-create-input'); if (inp) inp.focus(); }, 100);
    return;
  }
  
  const m = document.createElement('div');
  m.id = 'modal-nueva-ruta';
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:12px;';
  m.onclick = function(e) { if (e.target === m) m.style.display = 'none'; };
  m.innerHTML = `
    <div style="background:#111;border:1px solid rgba(212,160,23,.25);border-radius:20px;width:100%;max-width:520px;height:75vh;max-height:580px;display:flex;flex-direction:column;overflow:hidden;" onclick="event.stopPropagation()">
      <div style="padding:14px 18px;border-bottom:1px solid rgba(212,160,23,.12);display:flex;align-items:center;gap:10px;flex-shrink:0;">
        <div style="width:38px;height:38px;border-radius:50%;border:1.5px solid #d4a017;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1816;">${SALMA_SVG}</div>
        <div style="flex:1;">
          <div style="font-family:'Inter Tight',sans-serif;font-size:15px;font-weight:700;color:#fff;">Salma</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--dorado);letter-spacing:.18em;">TU COPILOTO DE VIAJE</div>
        </div>
        <div onclick="document.getElementById('modal-nueva-ruta').style.display='none'" style="cursor:pointer;color:var(--crema);opacity:.4;font-size:20px;padding:4px 8px;transition:opacity .2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.4'">✕</div>
      </div>
      <div id="salma-create-messages" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(212,160,23,.15) transparent;">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;border:1.5px solid #d4a017;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1816;">${SALMA_SVG}</div>
          <div class="salma-msg bot" style="margin:0;">¡Buenas! ¿Adónde vamos? Cuéntame tu viaje: destino, días, estilo... lo que tengas. Yo me encargo. 🌍</div>
        </div>
      </div>
      <div style="padding:10px 14px;border-top:1px solid rgba(212,160,23,.12);display:flex;gap:8px;flex-shrink:0;background:rgba(255,255,255,.02);">
        <input type="text" id="salma-create-input" placeholder="Cuéntale a Salma tu próximo viaje..." autocomplete="off" style="flex:1;background:#0c0b0a;border:1px solid rgba(212,160,23,.2);border-radius:24px;padding:12px 18px;color:#f5f0e8;font-family:'Inter',sans-serif;font-size:15px;outline:none;transition:border-color .2s;" onfocus="this.style.borderColor='#d4a017'" onblur="this.style.borderColor='rgba(212,160,23,.2)'">
        <button onclick="salmaCreateSend()" style="width:44px;height:44px;border-radius:50%;background:#d4a017;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s;" onmouseover="this.style.background='#e0b84a'" onmouseout="this.style.background='#d4a017'">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#0a0908"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(m);
  
  document.getElementById('salma-create-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); salmaCreateSend(); }
  });
  
  window._salmaCreateHistory = [];
}
window.newMap = newMap;

function salmaCreateAddMsg(text, who) {
  const container = document.getElementById('salma-create-messages');
  if (!container) return null;
  
  const SALMA_MINI = '<img src="data:image/png;base64,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" width="32" height="32" style="border-radius:50%;">';
  
  if (who === 'bot') {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:10px;align-items:flex-start;';
    wrapper.innerHTML = '<div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;border:1.5px solid #d4a017;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1816;">' + SALMA_MINI + '</div>';
    const div = document.createElement('div');
    div.className = 'salma-msg bot';
    div.style.margin = '0';
    div.textContent = text;
    wrapper.appendChild(div);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
  } else if (who === 'typing') {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:10px;align-items:flex-start;';
    wrapper.innerHTML = '<div style="flex-shrink:0;width:32px;height:32px;"></div>';
    const div = document.createElement('div');
    div.className = 'salma-msg typing';
    div.textContent = text;
    wrapper.appendChild(div);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
  } else {
    const div = document.createElement('div');
    div.className = 'salma-msg user';
    div.style.alignSelf = 'flex-end';
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }
}

async function salmaCreateSend() {
  const input = document.getElementById('salma-create-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  
  salmaCreateAddMsg(msg, 'user');
  input.value = '';
  input.disabled = true;
  
  const typing = salmaCreateAddMsg('Salma está pensando...', 'typing');
  
  if (!window._salmaCreateHistory) window._salmaCreateHistory = [];
  
  try {
    const res = await fetch(SALMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: window._salmaCreateHistory })
    });
    const data = await res.json();
    if (typing && typing.parentNode) typing.remove();
    
    if (data.reply) {
      salmaCreateAddMsg(data.reply, 'bot');
      window._salmaCreateHistory.push({ role: 'user', content: msg });
      window._salmaCreateHistory.push({ role: 'assistant', content: data.reply });
      if (window._salmaCreateHistory.length > 20) window._salmaCreateHistory = window._salmaCreateHistory.slice(-20);
      
      // Si Salma devuelve ruta con JSON → guardar automáticamente y mostrar
      if (data.route && data.route.stops && data.route.stops.length > 0) {
        salmaCreateAddMsg('Guardando tu ruta...', 'typing');
        
        try {
          const r = data.route;
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
          
          const docRef = await db.collection('users').doc(currentUser.uid).collection('maps').add(ruta);
          
          // Cerrar modal del mini-chat
          document.getElementById('modal-nueva-ruta').style.display = 'none';
          
          // Refrescar listado
          await loadUserMaps();
          
          showToast('¡Ruta creada con ' + r.stops.length + ' paradas! ✓');
          
          // Abrir directamente la vista de la ruta con mapa
          setTimeout(function() {
            verRuta(docRef.id, ruta.nombre);
          }, 300);
          
        } catch(saveErr) {
          console.error('Error saving route:', saveErr);
          if (typing && typing.parentNode) typing.remove();
          salmaCreateAddMsg('Error al guardar la ruta. ¿Puedes intentarlo de nuevo?', 'bot');
        }
      }
    } else {
      salmaCreateAddMsg('Uy, algo ha fallado. ¿Puedes repetir?', 'bot');
    }
  } catch(err) {
    if (typing && typing.parentNode) typing.remove();
    salmaCreateAddMsg('No puedo conectar ahora mismo. Inténtalo en un momento.', 'bot');
  }
  
  input.disabled = false;
  input.focus();
}
window.salmaCreateSend = salmaCreateSend;

// Legacy functions — mantener por compatibilidad con botones existentes
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
    if (id === 'mapas-diarios') initDayMaps();
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

// ===== DEMO DAY MAPS =====
const DEMO_DAYS = [
  {label:"Día 1-2 · Hanoi",pois:[{n:"Hoan Kiem Lake",lat:21.028,lng:105.852},{n:"Old Quarter 36 calles",lat:21.033,lng:105.850},{n:"Ho Chi Minh Mausoleum",lat:21.037,lng:105.835},{n:"Temple of Literature",lat:21.023,lng:105.836},{n:"Tay Ho West Lake",lat:21.058,lng:105.820},{n:"Museo de Etnología",lat:21.038,lng:105.800},{n:"Bia Hoi Corner",lat:21.034,lng:105.851},{n:"Bún Chả Huong Lien",lat:21.022,lng:105.845}]},
  {label:"Día 3-6 · Ha Giang",pois:[{n:"Mã Pí Lèng Pass",lat:23.165,lng:105.354},{n:"Dong Van Plateau",lat:23.278,lng:105.362},{n:"Lung Cu Flag Tower",lat:23.366,lng:105.334},{n:"Nho Quế River",lat:23.148,lng:105.358},{n:"Dong Van Old Quarter",lat:23.277,lng:105.360},{n:"Meo Vac Market",lat:23.152,lng:105.425},{n:"Quan Ba Heaven Gate",lat:23.050,lng:105.032}]},
  {label:"Día 7-8 · Ninh Binh",pois:[{n:"Tam Coc barcas",lat:20.218,lng:105.961},{n:"Mua Cave 500 escalones",lat:20.218,lng:105.974},{n:"Trang An UNESCO",lat:20.253,lng:105.975},{n:"Hoa Lu capital imperial",lat:20.280,lng:105.908},{n:"Van Long Reserve",lat:20.348,lng:105.825},{n:"Bich Dong Pagoda",lat:20.230,lng:105.953}]},
  {label:"Día 9-11 · Phong Nha",pois:[{n:"Paradise Cave 31km",lat:17.599,lng:106.142},{n:"Dark Cave kayak",lat:17.565,lng:106.089},{n:"Phong Nha Cave barca",lat:17.551,lng:106.081},{n:"Ho Chi Minh Road",lat:17.600,lng:106.050},{n:"Nuoc Mooc Spring",lat:17.555,lng:106.038},{n:"Son Trach village",lat:17.551,lng:106.064}]},
  {label:"Día 12-13 · Huế",pois:[{n:"Ciudadela UNESCO",lat:16.469,lng:107.578},{n:"Mausoleo Tu Duc",lat:16.438,lng:107.553},{n:"Mausoleo Khai Dinh",lat:16.424,lng:107.573},{n:"Pagoda Thien Mu",lat:16.453,lng:107.546},{n:"Río Perfume barca",lat:16.450,lng:107.560},{n:"Mercado Dong Ba",lat:16.470,lng:107.582},{n:"Bún Bò Huế puesto",lat:16.462,lng:107.578}]},
  {label:"Día 14-16 · Hội An",pois:[{n:"Hai Van Pass cumbre",lat:16.200,lng:108.120},{n:"Casco antiguo UNESCO",lat:15.880,lng:108.338},{n:"Linternas Thu Bon",lat:15.877,lng:108.329},{n:"Mỹ Sơn ruinas Cham",lat:15.763,lng:108.124},{n:"An Bang Beach",lat:15.920,lng:108.373},{n:"Thanh Ha pottery",lat:15.887,lng:108.305},{n:"Mercado central",lat:15.879,lng:108.334}]},
  {label:"Día 17-18 · Nha Trang",pois:[{n:"Quy Nhon Bãi Xép",lat:13.762,lng:109.218},{n:"Hon Mun diving",lat:12.172,lng:109.280},{n:"Torres Po Nagar s.VII",lat:12.265,lng:109.194},{n:"Playa Nha Trang 6km",lat:12.238,lng:109.197},{n:"Long Son Pagoda",lat:12.253,lng:109.183},{n:"Mercado Dam",lat:12.245,lng:109.192}]},
  {label:"Día 19-21 · Đà Lạt",pois:[{n:"Crazy House",lat:11.934,lng:108.442},{n:"Datanla Falls",lat:11.907,lng:108.454},{n:"Cau Dat Tea Farm",lat:11.824,lng:108.499},{n:"Lago Xuân Hương",lat:11.941,lng:108.441},{n:"Weasel Coffee farm",lat:11.950,lng:108.430},{n:"Mercado nocturno",lat:11.940,lng:108.440},{n:"Valle de Amor",lat:11.962,lng:108.423}]},
  {label:"Día 22-25 · Regreso",pois:[{n:"Mui Ne dunas rojas",lat:10.947,lng:108.286},{n:"Fairy Stream Mui Ne",lat:10.933,lng:108.272},{n:"Hoan Kiem cierre",lat:21.028,lng:105.852},{n:"Bún chả Obama",lat:21.022,lng:105.845},{n:"Bia Hoi 20 céntimos",lat:21.034,lng:105.851},{n:"Venta moto Hanoi",lat:21.030,lng:105.848}]},
];
let dayMapInstance = null;
let dayMarkers = [];
let dayMapsInited = false;

function initDayMaps() {
  if (dayMapsInited) return;
  dayMapsInited = true;
  const tabsEl = document.getElementById('day-tabs-demo');
  if (!tabsEl) return;
  tabsEl.innerHTML = DEMO_DAYS.map((d,i) => `<div onclick="showDayMap(${i})" id="dtab-${i}" style="font-family:'Space Mono',monospace;font-size:10px;padding:6px 12px;border:1px solid var(--gris2);cursor:pointer;color:var(--crema);opacity:.7;letter-spacing:1px;">${d.label}</div>`).join('');
  showDayMap(0);
}

function showDayMap(idx) {
  document.querySelectorAll('[id^="dtab-"]').forEach((t,i) => {
    t.style.borderColor = i===idx ? 'var(--dorado)' : 'var(--gris2)';
    t.style.color = i===idx ? 'var(--dorado)' : 'var(--crema)';
    t.style.opacity = i===idx ? '1' : '.7';
  });
  const day = DEMO_DAYS[idx];
  const mapEl = document.getElementById('day-map-demo');
  if (!mapEl) return;
  if (dayMapInstance) { dayMapInstance.remove(); dayMapInstance = null; }
  const center = [day.pois[0].lat, day.pois[0].lng];
  dayMapInstance = L.map('day-map-demo', {zoomControl:false}).setView(center, 11);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:18}).addTo(dayMapInstance);
  day.pois.forEach(poi => {
    const icon = L.divIcon({html:`<div style="background:#0a0908;border:2px solid #d4a017;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#d4a017;font-family:Space Mono,monospace;box-shadow:0 2px 8px #050505;">📍</div>`,className:'',iconSize:[24,24],iconAnchor:[12,12]});
    L.marker([poi.lat,poi.lng],{icon}).addTo(dayMapInstance)
      .bindPopup(`<div style="font-family:Inter,sans-serif;"><strong style="color:#d4a017;">${poi.n}</strong><br><a href="https://www.google.com/maps/search/${encodeURIComponent(poi.n)}+Vietnam" target="_blank" style="font-size:11px;color:#d4a017;">Abrir en Google Maps →</a></div>`);
  });
  const poisEl = document.getElementById('day-pois-demo');
  if (poisEl) poisEl.innerHTML = day.pois.map(p=>`<a href="https://www.google.com/maps/search/${encodeURIComponent(p.n)}+Vietnam" target="_blank" style="font-family:'Space Mono',monospace;font-size:9px;background:#d4a017;color:var(--dorado);padding:5px 10px;border:1px solid #d4a017;text-decoration:none;letter-spacing:1px;">${p.n} ↗</a>`).join('');
}
window.showDayMap = showDayMap;

// ===== DEMO MAIN MAP INIT =====
function initDemoMap() {
  const el = document.getElementById('demo-leaflet-map');
  if (!el || el._leaflet_id) return;
  const demoMap = L.map('demo-leaflet-map', {zoomControl:false, scrollWheelZoom:false}).setView([16.5,106.5], 5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:18}).addTo(demoMap);
  const route = [[21.028,105.834],[23.278,105.362],[20.253,105.975],[17.551,106.081],[16.463,107.590],[15.880,108.338],[12.238,109.197],[11.934,108.442],[21.028,105.834]];
  L.polyline(route, {color:'#d4a017',weight:2,opacity:.7,dashArray:'8,6'}).addTo(demoMap);
  const stops = [{n:'Hanoi',lat:21.028,lng:105.834},{n:'Ha Giang',lat:23.278,lng:105.362},{n:'Ninh Binh',lat:20.253,lng:105.975},{n:'Phong Nha',lat:17.551,lng:106.081},{n:'Huế',lat:16.463,lng:107.590},{n:'Hội An',lat:15.880,lng:108.338},{n:'Nha Trang',lat:12.238,lng:109.197},{n:'Đà Lạt',lat:11.934,lng:108.442}];
  stops.forEach(s => {
    const icon = L.divIcon({html:`<div style="background:#d4a017;border-radius:50%;width:10px;height:10px;box-shadow:0 0 0 3px #d4a017;"></div>`,className:'',iconSize:[10,10],iconAnchor:[5,5]});
    L.marker([s.lat,s.lng],{icon}).addTo(demoMap).bindTooltip(s.n,{permanent:false,direction:'right',className:'hero-tooltip'});
  });
}
window.initDemoMap = initDemoMap;
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

    // Paradas HTML
    var stopsHTML = '';
    if (pois.length > 0) {
      stopsHTML = '<div style="margin-top:24px;">';
      stopsHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:14px;">PARADAS (' + pois.length + ')</div>';
      pois.forEach(function(stop) {
        var icon = typeIcons[stop.type] || '📍';
        var sname = (stop.name || '').replace(/</g,'&lt;');
        var sdesc = (stop.description || stop.note || '').replace(/</g,'&lt;');
        var day = stop.day ? 'Día ' + stop.day : '';
        var mapsUrl = stop.lat && stop.lng ? 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng : '';
        stopsHTML += '<div style="display:flex;align-items:flex-start;gap:14px;padding:14px 0;border-bottom:1px solid rgba(212,160,23,.1);">';
        stopsHTML += '<div style="min-width:32px;text-align:center;"><span style="font-size:22px;">' + icon + '</span>';
        if (day) stopsHTML += '<div style="font-family:\'JetBrains Mono\',monospace;font-size:8px;color:var(--dorado);margin-top:3px;">' + day + '</div>';
        stopsHTML += '</div>';
        stopsHTML += '<div style="flex:1;">';
        stopsHTML += '<div style="font-size:16px;font-weight:600;color:#fff;margin-bottom:4px;">' + sname + '</div>';
        if (sdesc) stopsHTML += '<div style="font-size:14px;color:rgba(245,240,232,.7);line-height:1.65;">' + sdesc + '</div>';
        if (mapsUrl) stopsHTML += '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;margin-top:6px;display:inline-block;">VER EN MAPA →</a>';
        stopsHTML += '</div></div>';
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
    var hasMapData = pois.some(function(p) { return p.lat && p.lng; });

    // Google Maps URL
    var gmapsUrl = '';
    if (hasMapData) {
      var gmapsPois = pois.filter(function(p) { return p.lat && p.lng; });
      if (gmapsPois.length >= 2) {
        var origin = gmapsPois[0].lat + ',' + gmapsPois[0].lng;
        var dest = gmapsPois[gmapsPois.length-1].lat + ',' + gmapsPois[gmapsPois.length-1].lng;
        var waypoints = gmapsPois.slice(1, -1).map(function(p) { return p.lat + ',' + p.lng; }).join('|');
        gmapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + origin + '&destination=' + dest + (waypoints ? '&waypoints=' + waypoints : '') + '&travelmode=driving';
      } else {
        gmapsUrl = 'https://www.google.com/maps?q=' + gmapsPois[0].lat + ',' + gmapsPois[0].lng;
      }
    }

    // Descripción sin duplicados
    var descText = '';
    if (summary && r.desc && summary !== r.desc.replace(/</g,'&lt;')) {
      descText = '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + summary + '</div>';
    } else if (summary) {
      descText = '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + summary + '</div>';
    } else if (r.desc) {
      descText = '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:16px;">' + r.desc.replace(/</g,'&lt;') + '</div>';
    }

    // Renderizar en la página
    container.innerHTML = 
      // Botón volver
      '<div style="padding:16px 24px 0;">' +
        '<div onclick="showPage(\'dashboard\')" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.12em;padding:8px 0;transition:opacity .2s;opacity:.8;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'.8\'">← MIS RUTAS</div>' +
      '</div>' +
      // Mapa
      (hasMapData ? '<div style="position:relative;margin:12px 0 0;">' +
        '<div id="ver-ruta-map" style="width:100%;height:340px;background:#0a0a09;border-radius:0;"></div>' +
        '<a href="' + gmapsUrl + '" target="_blank" rel="noopener" style="position:absolute;bottom:14px;left:14px;z-index:500;font-family:\'JetBrains Mono\',monospace;font-size:9px;background:rgba(10,10,9,.85);color:#d4a017;border:1px solid rgba(212,160,23,.3);border-radius:10px;padding:10px 16px;text-decoration:none;letter-spacing:.1em;backdrop-filter:blur(4px);">VER RUTA EN GOOGLE MAPS →</a>' +
      '</div>' : '') +
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
          (gmapsUrl ? '<a href="' + gmapsUrl + '" target="_blank" rel="noopener" style="flex:1;min-width:120px;text-align:center;background:var(--dorado);border:none;border-radius:12px;color:#0a0908;padding:14px;font-family:\'JetBrains Mono\',monospace;font-size:10px;font-weight:700;text-decoration:none;letter-spacing:.12em;">ABRIR EN GOOGLE MAPS</a>' : '') +
          '<button onclick="editarRutaModal(\'' + id + '\')" style="flex:1;min-width:100px;background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:12px;color:var(--dorado);padding:14px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.12em;">EDITAR</button>' +
          '<button onclick="showPage(\'dashboard\')" style="flex:1;min-width:100px;background:transparent;border:1px solid rgba(212,160,23,.1);border-radius:12px;color:rgba(245,240,232,.5);padding:14px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.12em;">VOLVER</button>' +
        '</div>' +
      '</div>';

    // Cambiar a la página de ruta
    showPage('ruta');

    // Inicializar mapa
    if (hasMapData) {
      setTimeout(function() {
        var mapEl = document.getElementById('ver-ruta-map');
        if (!mapEl || mapEl._leaflet_id) return;
        var coords = pois.filter(function(p) { return p.lat && p.lng; }).map(function(p) { return [p.lat, p.lng]; });
        var rutaMap = L.map('ver-ruta-map', {zoomControl:false, scrollWheelZoom:true}).setView(coords[0], 6);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:18}).addTo(rutaMap);
        L.polyline(coords, {color:'#d4a017', weight:2.5, opacity:.8, dashArray:'8,6'}).addTo(rutaMap);
        pois.filter(function(p) { return p.lat && p.lng; }).forEach(function(p) {
          var markerIcon = L.divIcon({
            html:'<div style="background:#d4a017;border-radius:50%;width:12px;height:12px;box-shadow:0 0 0 3px rgba(212,160,23,.3);"></div>',
            className:'', iconSize:[12,12], iconAnchor:[6,6]
          });
          L.marker([p.lat, p.lng], {icon:markerIcon}).addTo(rutaMap)
            .bindTooltip((p.name || p.n || ''), {permanent:false, direction:'top'});
        });
        if (coords.length > 1) rutaMap.fitBounds(coords, {padding:[40,40]});
      }, 250);
    }
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

// ===== MAP EDITOR =====
function initMap() {
  if (map) { map.remove(); map = null; }
  const el = document.getElementById("leaflet-map");
  if (!el) return;
  map = L.map("leaflet-map", {zoomControl: false}).setView([16.5, 106.5], 6);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "CartoDB", maxZoom: 18
  }).addTo(map);
  polyline = L.polyline(ROUTE_COORDS, {
    color: "#d4a017", weight: 3, opacity: 0.7, dashArray: "8,6"
  }).addTo(map);
  renderMapMarkers();
  renderPoiList();
}

function renderMapMarkers() {
  markers.forEach(m => m.remove()); markers = [];
  poiList.forEach(poi => {
    const icon = L.divIcon({
      html: `<div style="background:#0a0908;border:2px solid #d4a017;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px #050505;">${poi.type}</div>`,
      className: "", iconSize: [28,28], iconAnchor: [14,14]
    });
    const m = L.marker([poi.lat, poi.lng], {icon}).addTo(map)
      .bindPopup(`<div style="font-family:Inter,sans-serif;min-width:140px;"><strong style="color:#d4a017;">${poi.type} ${poi.name}</strong><br><span style="font-size:12px;opacity:.7;">${poi.note||""}</span></div>`);
    markers.push(m);
  });
}

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
  renderMapMarkers(); renderPoiList();
  showToast("Punto eliminado");
}
window.deletePoi = deletePoi;

function setDay(el, day) {
  document.querySelectorAll(".day-tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  showToast("Dia " + (day === 0 ? "completo" : day) + " seleccionado");
}
window.setDay = setDay;

function mapZoom(dir) { if (map) map.setZoom(map.getZoom() + dir); }
window.initMap = initMap;
window.mapZoom = mapZoom;

function centerMap() {
  if (map && polyline) map.fitBounds(polyline.getBounds(), {padding:[40,40]});
}
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
  const center = map ? map.getCenter() : {lat:16.5,lng:106.5};
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

  renderMapMarkers(); renderPoiList();
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


// ===== HERO MAP =====
function initHeroMap() {
  // Usar imagen estática como fondo del hero
  const el = document.getElementById("hero-map");
  if (!el) return;
  el.style.backgroundImage = "url('https://raw.githubusercontent.com/borradodelmapa/borradodelmapa/main/mapa.png')";
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center";
  el.style.filter = "brightness(0.55)";
}
initHeroMap();

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

