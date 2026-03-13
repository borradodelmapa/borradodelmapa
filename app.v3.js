/* app.v3.js - limpio y estable */

(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA",
    authDomain: "borradodelmapa-85257.firebaseapp.com",
    projectId: "borradodelmapa-85257",
    storageBucket: "borradodelmapa-85257.firebasestorage.app",
    messagingSenderId: "833042338746",
    appId: "1:833042338746:web:32b58e582488c6064d8383",
    measurementId: "G-JZ00MFJEHB"
  };

  if (!window.firebase) {
    console.error("Firebase no está cargado.");
    return;
  }

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

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeShow(el, displayValue = "block") {
    if (el) el.style.display = displayValue;
  }

  function safeHide(el) {
    if (el) el.style.display = "none";
  }

  /* ===== helpers globales ===== */

  window.showToast = function (msg) {
    const t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    t.style.opacity = "1";
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => {
        t.style.display = "none";
      }, 250);
    }, 2600);
  };

  window.switchModal = function (view) {
    const loginView = $("modal-login-view");
    const registerView = $("modal-register-view");
    if (loginView) loginView.style.display = view === "register" ? "none" : "block";
    if (registerView) registerView.style.display = view === "register" ? "block" : "none";
  };

  window.openModal = function (view) {
    const modal = $("modal-auth");
    if (!modal) return;
    modal.style.display = "flex";
    window.switchModal(view || "login");
  };

  window.closeModal = function () {
    const modal = $("modal-auth");
    if (!modal) return;
    modal.style.display = "none";
  };

  window.toggleUserMenu = function () {
    const menu = $("user-menu");
    if (!menu) return;
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  };

  window.showPage = function (name) {
    document.querySelectorAll(".page").forEach((p) => {
      p.classList.remove("active");
      p.style.display = "none";
    });
    const target = $("page-" + name);
    if (target) {
      target.classList.add("active");
      target.style.display = "block";
    }
    if (name === "dashboard") {
      const mapsTab = $("dash-tab-maps");
      const profileTab = $("dash-tab-profile");
      if (mapsTab && profileTab && mapsTab.style.display === "none" && profileTab.style.display === "none") {
        mapsTab.style.display = "block";
      }
    }
    window.scrollTo(0, 0);
  };

  window.setDashTab = function (tab, el) {
    document.querySelectorAll(".dash-content").forEach((c) => (c.style.display = "none"));
    const target = $("dash-tab-" + tab);
    if (target) target.style.display = "block";

    document.querySelectorAll(".sidebar-item").forEach((i) => i.classList.remove("active"));
    if (el) el.classList.add("active");
  };

  window.openHeroDemo = function (id) {
    const modal = $("hero-demo-modal");
    const content = $("hero-demo-content");
    if (!modal || !content) return;
    content.innerHTML = `
      <div style="padding:24px;color:#fff;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#d4a017;letter-spacing:.16em;margin-bottom:10px;">RUTA DEMO</div>
        <div style="font-family:'Inter Tight',sans-serif;font-size:28px;font-weight:700;margin-bottom:10px;">${escapeHtml(id)}</div>
        <div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.7;">Demo visual. El siguiente paso es conectarla al flujo real de Salma.</div>
      </div>`;
    modal.style.display = "block";
  };

  window.closeBlogPost = function () {
    safeShow($("blog-list"), "grid");
    safeHide($("blog-post"));
  };

  /* ===== auth ===== */

  function navGuest() {
    safeShow($("nav-links-guest"), "flex");
    safeHide($("nav-links-user"));
    safeHide($("mobile-dash-nav"));
  }

  function navUser(user) {
    safeHide($("nav-links-guest"));
    safeShow($("nav-links-user"), "flex");
    safeShow($("mobile-dash-nav"), "flex");

    if ($("nav-avatar")) $("nav-avatar").textContent = (user.name || "U").charAt(0).toUpperCase();
    if ($("sidebar-avatar")) $("sidebar-avatar").textContent = (user.name || "U").charAt(0).toUpperCase();
    if ($("sidebar-name")) $("sidebar-name").textContent = user.name || "Viajero";
    if ($("sidebar-plan")) $("sidebar-plan").textContent = user.isPremium ? "Plan Premium" : "Plan Gratuito";
    if ($("profile-avatar-big")) $("profile-avatar-big").textContent = (user.name || "U").charAt(0).toUpperCase();
    if ($("profile-display-name")) $("profile-display-name").textContent = user.name || "Viajero";
    if ($("profile-display-email")) $("profile-display-email").textContent = user.email || "";
    if ($("profile-name-input")) $("profile-name-input").value = user.name || "";
    if ($("profile-country-input")) $("profile-country-input").value = user.country || "";
    if ($("profile-bio-input")) $("profile-bio-input").value = user.bio || "";
  }

  async function ensureUserDoc(user) {
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        name: user.displayName || (user.email ? user.email.split("@")[0] : "Viajero"),
        email: user.email || "",
        country: "",
        bio: "",
        isPremium: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    const data = (await ref.get()).data() || {};
    currentUser = {
      uid: user.uid,
      name: data.name || user.displayName || "Viajero",
      email: data.email || user.email || "",
      country: data.country || "",
      bio: data.bio || "",
      isPremium: !!data.isPremium
    };
    navUser(currentUser);
  }

  window.doLogin = async function () {
    const email = $("login-email")?.value.trim();
    const pass = $("login-pass")?.value || "";
    if (!email || !pass) {
      window.showToast("Introduce email y contraseña");
      return;
    }
    try {
      await auth.signInWithEmailAndPassword(email, pass);
      window.closeModal();
      window.showPage("dashboard");
    } catch (e) {
      console.error(e);
      window.showToast("Error login");
    }
  };

  window.doRegister = async function () {
    const name = $("reg-name")?.value.trim();
    const email = $("reg-email")?.value.trim();
    const pass = $("reg-pass")?.value || "";
    if (!name || !email || !pass) {
      window.showToast("Completa todos los campos");
      return;
    }
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await cred.user.updateProfile({ displayName: name });
      await db.collection("users").doc(cred.user.uid).set({
        name: name,
        email: email,
        country: "",
        bio: "",
        isPremium: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      window.closeModal();
      window.showPage("dashboard");
    } catch (e) {
      console.error(e);
      window.showToast("Error registro");
    }
  };

  window.doSocialLogin = async function () {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      await ensureUserDoc(result.user);
      window.closeModal();
      window.showPage("dashboard");
    } catch (e) {
      console.error(e);
      window.showToast("Error Google login");
    }
  };

  window.logout = async function () {
    try {
      await auth.signOut();
      currentUser = null;
      navGuest();
      window.showPage("home");
    } catch (e) {
      console.error(e);
    }
  };

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      currentUser = null;
      navGuest();
      return;
    }
    try {
      await ensureUserDoc(user);
      if (window._salmaLastRoute && window.normalizeSalmaRoute) {
        const routeDoc = window.normalizeSalmaRoute(window._salmaLastRoute);
        await db.collection("users").doc(user.uid).collection("maps").add(routeDoc);
        window._salmaLastRoute = null;
        window.showToast("Ruta guardada ✓");
      }
      await window.loadUserMaps();
    } catch (e) {
      console.error(e);
    }
  });

  /* ===== rutas ===== */

  window.normalizeSalmaRoute = function (routeData) {
    const stops = Array.isArray(routeData?.stops) ? routeData.stops : [];
    return {
      nombre: routeData?.title || "Mi ruta",
      destino: routeData?.region || routeData?.country || "",
      dias: routeData?.duration_days || 0,
      desc: routeData?.summary || "",
      notas: "",
      itinerarioIA: JSON.stringify(routeData || {}),
      pois: stops.map((s, i) => ({
        id: i + 1,
        name: s.name || "",
        type: s.type || "other",
        note: s.description || "",
        description: s.description || "",
        day: s.day || 1,
        lat: s.lat || null,
        lng: s.lng || null
      })),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      published: false
    };
  };

  window.saveRoute = async function (route) {
    if (!currentUser) {
      window._salmaLastRoute = route;
      window.openModal("register");
      return;
    }
    try {
      await db.collection("users").doc(currentUser.uid).collection("maps").add(route);
      window.showToast("Ruta guardada");
      await window.loadUserMaps();
    } catch (e) {
      console.error(e);
      window.showToast("Error guardando ruta");
    }
  };

  function routeCover(dest) {
    const d = String(dest || "").toLowerCase();
    if (d.includes("japon") || d.includes("japón") || d.includes("japan")) return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop&q=75";
    if (d.includes("tailandia") || d.includes("thailand")) return "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=200&fit=crop&q=75";
    if (d.includes("islandia") || d.includes("iceland")) return "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=200&fit=crop&q=75";
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop&q=75";
  }

  window.loadUserMaps = async function () {
    if (!currentUser) return;
    const grid = $("maps-grid-dynamic");
    if (!grid) return;
    try {
      const snap = await db.collection("users").doc(currentUser.uid).collection("maps").orderBy("updatedAt", "desc").get();
      if (snap.empty) {
        grid.innerHTML = "<div style='padding:40px;text-align:center;color:rgba(245,240,232,.7)'>Aún no tienes rutas</div>";
        if ($("profile-routes-count")) $("profile-routes-count").textContent = "0 rutas guardadas";
        return;
      }
      let html = "";
      let count = 0;
      snap.forEach((doc) => {
        count += 1;
        const m = doc.data();
        html += `
          <div class="map-card" style="cursor:pointer;overflow:hidden;">
            <div style="height:140px;background:url('${routeCover(m.destino)}') center/cover;"></div>
            <div class="map-card-body">
              <div class="map-card-title">${escapeHtml(m.nombre || "Ruta")}</div>
              <div class="map-card-meta">${m.dias || 0} días · ${escapeHtml(m.destino || "")}</div>
            </div>
          </div>`;
      });
      grid.innerHTML = html;
      if ($("profile-routes-count")) $("profile-routes-count").textContent = count + " rutas guardadas";
    } catch (e) {
      console.error(e);
      grid.innerHTML = "<div style='padding:40px;text-align:center;color:#f87171'>Error cargando rutas</div>";
    }
  };

  window.newMap = function () {
    if (!currentUser) {
      window.openModal("register");
      return;
    }
    window.showPage("home");
    setTimeout(() => {
      const input = $("salma-hero-input");
      if (input) input.focus();
    }, 100);
  };

  window.crearRuta = window.newMap;
  window.generarRutaConIA = window.newMap;

  window.saveProfile = async function () {
    if (!currentUser) return;
    try {
      await db.collection("users").doc(currentUser.uid).set({
        name: $("profile-name-input")?.value.trim() || currentUser.name || "",
        country: $("profile-country-input")?.value.trim() || "",
        bio: $("profile-bio-input")?.value.trim() || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      window.showToast("Perfil actualizado ✓");
    } catch (e) {
      console.error(e);
      window.showToast("Error guardando perfil");
    }
  };

  /* ===== init UI ===== */

  window.addEventListener("load", () => {
    const hero = $("hero-map");
    if (hero) {
      hero.style.backgroundImage = "url('https://raw.githubusercontent.com/borradodelmapa/borradodelmapa/main/mapa.png')";
      hero.style.backgroundSize = "cover";
      hero.style.backgroundPosition = "center";
      hero.style.filter = "brightness(0.55)";
    }

    document.querySelectorAll(".page").forEach((p) => {
      if (!p.classList.contains("active")) p.style.display = "none";
    });

    document.addEventListener("click", (e) => {
      const menu = $("user-menu");
      const avatar = $("nav-avatar");
      if (menu && avatar && menu.style.display === "block" && !avatar.contains(e.target)) {
        menu.style.display = "none";
      }
    });
  });
})();
