const firebaseConfig = {
  apiKey: "AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA",
  authDomain: "borradodelmapa-85257.firebaseapp.com",
  projectId: "borradodelmapa-85257",
  storageBucket: "borradodelmapa-85257.firebasestorage.app",
  messagingSenderId: "833042338746",
  appId: "1:833042338746:web:32b58e582488c6064d8383",
  measurementId: "G-JZ00MFJEHB"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

window._fbAuth = auth;
window._fbDb = db;
window._fbGoogleProvider = googleProvider;
window.db = db;

let currentUser = null;

function $(id){ return document.getElementById(id); }

window.showToast = function(msg){
  const t = $("toast");
  if(!t) return;
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>{ t.style.display = "none"; }, 3000);
};

window.openModal = function(view){
  const m = $("modal-auth");
  if(!m) return;
  m.style.display = "flex";
  window.switchModal(view || "login");
};

window.closeModal = function(){
  const m = $("modal-auth");
  if(m) m.style.display = "none";
};

window.switchModal = function(view){
  const login = $("modal-login-view");
  const reg = $("modal-register-view");
  if(login) login.style.display = view === "register" ? "none" : "block";
  if(reg) reg.style.display = view === "register" ? "block" : "none";
};

window.toggleUserMenu = function(){
  const m = $("user-menu");
  if(!m) return;
  m.style.display = m.style.display === "block" ? "none" : "block";
};

window.showPage = function(name){
  document.querySelectorAll(".page").forEach(p => {
    p.style.display = "none";
    p.classList.remove("active");
  });
  const target = $("page-" + name);
  if(target){
    target.style.display = "block";
    target.classList.add("active");
  }
};

window.setDashTab = function(tab, el){
  document.querySelectorAll(".dash-content").forEach(c => c.style.display = "none");
  const target = $("dash-tab-" + tab);
  if(target) target.style.display = "block";
  document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
  if(el) el.classList.add("active");
};

function navGuest(){
  if($("nav-links-guest")) $("nav-links-guest").style.display = "flex";
  if($("nav-links-user")) $("nav-links-user").style.display = "none";
}

function navUser(user){
  if($("nav-links-guest")) $("nav-links-guest").style.display = "none";
  if($("nav-links-user")) $("nav-links-user").style.display = "flex";
  if($("nav-avatar")) $("nav-avatar").innerText = (user.name || "U").charAt(0).toUpperCase();
  if($("sidebar-name")) $("sidebar-name").innerText = user.name || "Viajero";
  if($("sidebar-avatar")) $("sidebar-avatar").innerText = (user.name || "U").charAt(0).toUpperCase();
  if($("profile-display-name")) $("profile-display-name").innerText = user.name || "Viajero";
  if($("profile-display-email")) $("profile-display-email").innerText = user.email || "";
}

window.doLogin = async function(){
  const email = $("login-email")?.value.trim();
  const pass = $("login-pass")?.value;
  if(!email || !pass){ window.showToast("Introduce email y contraseña"); return; }
  try{
    await auth.signInWithEmailAndPassword(email, pass);
    window.closeModal();
    window.showPage("dashboard");
  }catch(e){
    console.error(e);
    window.showToast("Error login");
  }
};

window.doRegister = async function(){
  const name = $("reg-name")?.value.trim();
  const email = $("reg-email")?.value.trim();
  const pass = $("reg-pass")?.value;
  if(!name || !email || !pass){ window.showToast("Completa todos los campos"); return; }
  try{
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await cred.user.updateProfile({displayName:name});
    await db.collection("users").doc(cred.user.uid).set({
      name,
      email,
      isPremium:false,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    }, {merge:true});
    window.closeModal();
    window.showPage("dashboard");
  }catch(e){
    console.error(e);
    window.showToast("Error registro");
  }
};

window.doSocialLogin = async function(){
  try{
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    if(!snap.exists){
      await ref.set({
        name:user.displayName || "Viajero",
        email:user.email || "",
        isPremium:false,
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      }, {merge:true});
    }
    window.closeModal();
    window.showPage("dashboard");
  }catch(e){
    console.error(e);
    window.showToast("Error Google login");
  }
};

window.logout = function(){
  auth.signOut();
  window.showPage("home");
};

window.normalizeSalmaRoute = function(routeData){
  const stops = Array.isArray(routeData?.stops) ? routeData.stops : [];
  return {
    nombre: routeData?.title || "Mi ruta",
    destino: routeData?.region || routeData?.country || "",
    dias: routeData?.duration_days || 0,
    desc: routeData?.summary || "",
    notas: "",
    itinerarioIA: JSON.stringify(routeData || {}),
    pois: stops.map((s,i)=>({
      id:i+1,
      name:s.name || "",
      type:s.type || "other",
      note:s.description || "",
      day:s.day || 1,
      lat:s.lat || null,
      lng:s.lng || null
    })),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    published:false
  };
};

window.saveRoute = async function(route){
  if(!currentUser){
    window.openModal("register");
    return;
  }
  try{
    await db.collection("users").doc(currentUser.uid).collection("maps").add(route);
    window.showToast("Ruta guardada");
    window.loadUserMaps();
  }catch(e){
    console.error(e);
    window.showToast("Error guardando ruta");
  }
};

window.loadUserMaps = async function(){
  if(!currentUser) return;
  const grid = $("maps-grid-dynamic");
  if(!grid) return;
  try{
    const snap = await db.collection("users").doc(currentUser.uid).collection("maps").get();
    let html = "";
    snap.forEach(doc => {
      const m = doc.data();
      html += `<div class="map-card"><div class="map-card-body"><div class="map-card-title">${m.nombre || "Ruta"}</div><div class="map-card-meta">${m.dias || 0} días</div></div></div>`;
    });
    if(!html) html = "<div style='padding:40px;text-align:center'>Aún no tienes rutas</div>";
    grid.innerHTML = html;
  }catch(e){
    console.error(e);
  }
};

window.newMap = function(){
  if(!currentUser){
    window.openModal("register");
    return;
  }
  window.showPage("home");
  setTimeout(()=>{ const input = $("salma-hero-input"); if(input) input.focus(); }, 100);
};

window.crearRuta = window.newMap;
window.generarRutaConIA = window.newMap;

window.saveProfile = async function(){
  if(!currentUser) return;
  const name = $("profile-name-input")?.value.trim() || "";
  const country = $("profile-country-input")?.value.trim() || "";
  const bio = $("profile-bio-input")?.value.trim() || "";
  if(!name){ window.showToast("El nombre no puede estar vacío"); return; }
  await db.collection("users").doc(currentUser.uid).set({
    name, country, bio, updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, {merge:true});
  window.showToast("Perfil actualizado ✓");
};

window.openHeroDemo = function(id){
  const modal = $("hero-demo-modal");
  const content = $("hero-demo-content");
  if(!modal || !content) return;
  content.innerHTML = `<div style="padding:24px;color:#fff;font-family:Inter">Demo de ruta: ${id}</div>`;
  modal.style.display = "block";
};

auth.onAuthStateChanged(async (user)=>{
  if(!user){
    currentUser = null;
    navGuest();
    return;
  }
  try{
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    if(!snap.exists){
      await ref.set({
        name:user.displayName || "Viajero",
        email:user.email || "",
        isPremium:false,
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      }, {merge:true});
    }
    const data = (await ref.get()).data() || {};
    currentUser = { uid:user.uid, name:data.name || user.displayName || "Viajero", email:data.email || user.email || "" };
    navUser(currentUser);
    await window.loadUserMaps();
  }catch(e){
    console.error(e);
  }
});

window.addEventListener("load", ()=>{
  const hero = $("hero-map");
  if(hero){
    hero.style.backgroundImage = "url('https://raw.githubusercontent.com/borradodelmapa/borradodelmapa/main/mapa.png')";
    hero.style.backgroundSize = "cover";
    hero.style.backgroundPosition = "center";
  }
  document.querySelectorAll(".page").forEach(p => {
    if(!p.classList.contains("active")) p.style.display = "none";
  });
});
