/* Aviso «Instala la app» — UN solo script para app, destinos, blog, legal y 404 (CLAUDE.md §9 y §13).
   Sin Firebase ni dependencias: se carga con <script src="/instalar-app.js?v=N" defer>.
   - Sale desde el primer segundo mientras la app NO esté instalada; la ✕ lo cierra solo en esta visita.
   - Cerrado, vuelve como recordatorio corto cada 2 min de uso (pestaña visible), máx. 3 por visita.
   - Android/escritorio (Chrome, Edge): botón que lanza la instalación de la PWA (beforeinstallprompt).
     iPhone/iPad: pasos «Compartir → Añadir a pantalla de inicio». Navegador de Instagram/TikTok…: «ábrelo en Chrome/Safari».
   - Cuenta (Firestore stats_instalacion/<día>, sin API de pago): vistos, cierres, clics, instalados, abiertos_app.
   - Google Play aún no autorizado: PLAY_URL vacío = apagado. Cuando Google autorice, poner aquí la URL de la ficha.
   - Pruebas: ?instalar=ver (o =ios / =android / =escritorio / =inapp) fuerza el aviso sin contar nada. */
(function () {
  'use strict';
  var PLAY_URL = ''; // ← cuando Google autorice: 'https://play.google.com/store/apps/details?id=com.borradodelmapa.app'
  var PROJECT = 'borradodelmapa-85257', API_KEY = 'AIzaSyDjpJMEs-I_3bAR4OP2O9thKqecgNkpjkA';
  var REMIND_EVERY = 120, REMIND_MAX = 3;

  var qs = location.search.match(/[?&]instalar=([a-z]+)/);
  var FORCE = qs ? qs[1] : '';
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var ua = navigator.userAgent || '';

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; }

  var standalone = false;
  try { standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || !!window.BDM_TWA; } catch (e) {}

  var isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var isInApp = /FBAN|FBAV|Instagram|musical_ly|TikTok|Snapchat|Line\/|Twitter|LinkedInApp|; wv\)/i.test(ua);
  var plat = isIOS ? 'ios' : isAndroid ? 'android' : 'escritorio';
  if (isInApp) plat = 'inapp';
  if (FORCE === 'ios' || FORCE === 'android' || FORCE === 'escritorio' || FORCE === 'inapp') plat = FORCE;

  /* ── Contadores (Firestore REST; increment sin leer; nada en localhost) ── */
  function contar(campo) {
    if (FORCE) { try { console.log('[instalar] (prueba, no cuenta)', campo + '.' + plat); } catch (e) {} return; }
    if (LOCAL) { try { console.log('[instalar] (local, no cuenta)', campo + '.' + plat); } catch (e) {} return; }
    try {
      var dia = new Date().toISOString().slice(0, 10);
      var doc = 'projects/' + PROJECT + '/databases/(default)/documents/stats_instalacion/' + dia;
      fetch('https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents:commit?key=' + API_KEY, {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ writes: [{ transform: { document: doc, fieldTransforms: [
          { fieldPath: campo + '.' + plat, increment: { integerValue: '1' } },
          { fieldPath: 'dia', setToServerValue: 'REQUEST_TIME' }
        ] } }] })
      }).catch(function () {});
    } catch (e) {}
  }

  /* ── Ya instalada: no se enseña nada; la 1ª apertura de la app se cuenta una vez por móvil (así entra también iPhone) ── */
  if (standalone && !FORCE) {
    if (!ls('bdm_app_abierta')) { ls('bdm_app_abierta', '1'); contar('abiertos_app'); }
    return;
  }

  var prompt_ = null, cerrada = false, recordatorios = 0, activos = 0, caja = null, visto = false;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); prompt_ = e;
    if (!cerrada && !caja) mostrar(false);
  });
  window.addEventListener('appinstalled', function () {
    ls('bdm_app_instalada', '1'); ls('bdm_app_abierta', '1'); contar('instalados'); quitar(); prompt_ = null; cerrada = true; recordatorios = REMIND_MAX;
  });

  // Por encima del banner de cookies mientras esté a la vista (no lo tapa)
  function ajustar() {
    if (!caja) return;
    var c = document.getElementById('cookie-banner');
    if (c && c.offsetHeight > 0 && getComputedStyle(c).display !== 'none') caja.style.bottom = (c.offsetHeight + 10) + 'px';
    else caja.style.bottom = '';
  }
  function quitar() { if (caja) { caja.remove(); caja = null; } }

  var ICONO_COMPARTIR = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

  function estilos() {
    if (document.getElementById('bdm-inst-css')) return;
    var s = document.createElement('style'); s.id = 'bdm-inst-css';
    s.textContent =
      '#bdm-inst{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:10002;background:#111;color:#fff;border:2px solid #F4630B;padding:14px 16px 16px;font-family:"Barlow Condensed","Barlow",system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.55);animation:bdminst .35s ease-out}' +
      '@media(min-width:900px){#bdm-inst{left:auto;right:24px;bottom:24px;width:380px}}' +
      '@keyframes bdminst{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}' +
      '#bdm-inst .bi-x{position:absolute;top:2px;right:4px;width:40px;height:40px;background:none;border:0;color:#fff;font-size:24px;line-height:1;cursor:pointer;opacity:.85}' +
      '#bdm-inst .bi-row{display:flex;gap:12px;align-items:center;padding-right:30px}' +
      '#bdm-inst img{width:48px;height:48px;flex:none;border-radius:50%}' +
      '#bdm-inst .bi-t{font-size:20px;font-weight:700;line-height:1.1;letter-spacing:.2px}' +
      '#bdm-inst .bi-s{font-size:15px;opacity:.88;margin-top:3px;line-height:1.25}' +
      '#bdm-inst .bi-b{display:block;width:100%;margin-top:12px;padding:13px;background:#F4630B;color:#fff;border:0;font:700 18px "Barlow Condensed","Barlow",system-ui,sans-serif;letter-spacing:.6px;text-transform:uppercase;cursor:pointer}' +
      '#bdm-inst .bi-pasos{margin-top:10px;font-size:16px;line-height:1.5;background:#1c1c1c;padding:10px 12px}';
    document.head.appendChild(s);
  }

  function texto(recordatorio) {
    if (plat === 'inapp') return { t: 'Instala la app de Salma', s: 'Ábrela en Chrome o Safari (menú ⋮ → «Abrir en el navegador») y podrás instalarla.', boton: '' };
    if (recordatorio) return { t: 'Descárgate la app', s: 'Y ten siempre a Salma en la mano 🧡', boton: 'Instalar app' };
    return { t: 'Lleva a Salma en el móvil', s: 'Instala la app gratis: se abre al toque, como cualquier otra, y tienes tus rutas siempre a mano.', boton: 'Instalar app' };
  }

  function mostrar(recordatorio) {
    if (caja) return;
    var tx = texto(recordatorio);
    var pasos = '';
    if (plat === 'ios') { tx.boton = ''; pasos = '<div class="bi-pasos">1. Pulsa ' + ICONO_COMPARTIR + ' <b>Compartir</b> (abajo o arriba)<br>2. Elige <b>«Añadir a pantalla de inicio»</b></div>'; }
    else if (plat === 'android' && !prompt_ && !FORCE) {
      if (PLAY_URL) tx.boton = 'Descargar en Google Play';
      else pasos = '<div class="bi-pasos">Abre el menú <b>⋮</b> del navegador y pulsa <b>«Instalar aplicación»</b> o <b>«Añadir a pantalla de inicio»</b></div>', tx.boton = '';
    }
    estilos();
    caja = document.createElement('div'); caja.id = 'bdm-inst'; caja.setAttribute('role', 'dialog'); caja.setAttribute('aria-label', 'Instalar la app');
    caja.innerHTML = '<button class="bi-x" aria-label="Cerrar">✕</button>' +
      '<div class="bi-row"><img src="/icon-salma-redondo-512.png" alt=""><div><div class="bi-t">' + tx.t + '</div><div class="bi-s">' + tx.s + '</div></div></div>' +
      pasos + (tx.boton ? '<button class="bi-b">' + tx.boton + '</button>' : '');
    document.body.appendChild(caja); ajustar();
    if (!visto) { visto = true; contar('vistos'); }
    caja.querySelector('.bi-x').onclick = function () { cerrada = true; activos = 0; quitar(); contar('cierres'); };
    var b = caja.querySelector('.bi-b');
    if (b) b.onclick = function () {
      contar('clics');
      if (prompt_) {
        var p = prompt_; prompt_ = null; quitar(); cerrada = true;
        try { p.prompt(); p.userChoice.then(function (r) { if (r && r.outcome === 'dismissed') { contar('rechazados'); } }); } catch (e) {}
      } else if (PLAY_URL) { window.open(PLAY_URL, '_blank'); }
    };
  }

  /* ── Sale ya: según plataforma. Android/escritorio con Chrome o Edge esperan al evento (si no se puede instalar, no sale). ── */
  function arrancar() {
    if (FORCE) { if (plat === 'android' || plat === 'escritorio') { prompt_ = prompt_ || {}; } mostrar(false); return; }
    if (plat === 'inapp' || plat === 'ios') { mostrar(false); return; }
    if (plat === 'android' && !/Chrome|EdgA|SamsungBrowser|OPR/.test(ua) && !prompt_) { setTimeout(function () { if (!prompt_ && !caja && !cerrada) mostrar(false); }, 1500); }
    // Chrome/Edge: mostrar() ya lo lanza beforeinstallprompt; si ya estaba instalada no llega y no sale.
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();

  /* ── Recordatorio: cada 2 min de uso con la pestaña visible, máx. 3 por visita ── */
  setInterval(function () {
    ajustar();
    if (document.visibilityState !== 'visible' || !cerrada || caja || recordatorios >= REMIND_MAX) return;
    if (ls('bdm_app_instalada') === '1' && !FORCE) return;
    activos++;
    if (activos >= (FORCE ? 6 : REMIND_EVERY)) {
      activos = 0;
      if (plat === 'escritorio' || (plat === 'android' && /Chrome|EdgA|SamsungBrowser|OPR/.test(ua))) { if (!prompt_ && !FORCE) return; }
      recordatorios++; cerrada = false; mostrar(true);
    }
  }, 1000);
})();
