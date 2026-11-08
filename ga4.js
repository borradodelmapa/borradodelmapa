/* Google Analytics 4 — UN solo script para app, 404, guías públicas, destinos, blog, legal y funciones (CLAUDE.md §9 y §13).
   Se carga con <script src="/ga4.js?v=N" defer> al lado de instalar-app.js. Gratis: no toca ninguna API de pago.
   - Mide SOLO si la persona aceptó las cookies analíticas (localStorage cookie_consent === 'all'), como pide legal.html.
   - Manda cada visita a DOS propiedades de GA4 (Paco, 8 nov 2026): la nueva G-JZ00MFJEHB y la antigua G-B2YWQKPTZZ,
     que lleva datos desde abril. Para dejar solo una, quitarla de IDS y subir el ?v= en todas las páginas.
   - Si la página no trae su propio aviso de cookies (solo lo trae index.html), lo pinta este script con el mismo
     texto y estilo (.cookie-banner de styles.css). Quien ya eligió en la app no lo vuelve a ver: es el mismo localStorage.
   - En localhost no mide nada. */
(function () {
  'use strict';
  var IDS = ['G-JZ00MFJEHB', 'G-B2YWQKPTZZ'];
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // La llama también el aviso de cookies de index.html al pulsar «Aceptar»
  window.loadGA4 = function () {
    if (LOCAL || document.getElementById('ga4-script')) return;
    var s = document.createElement('script');
    s.id = 'ga4-script'; s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + IDS[0];
    document.head.appendChild(s);
    window.gtag('js', new Date());
    for (var i = 0; i < IDS.length; i++) window.gtag('config', IDS[i]);
  };

  var consent = ls('cookie_consent');
  if (consent === 'all') { window.loadGA4(); return; }
  if (consent) return;                                  // eligió «Solo esenciales»
  if (document.getElementById('cookie-banner')) return; // la página ya trae su aviso (index.html)

  var caja = document.createElement('div');
  caja.className = 'cookie-banner'; caja.id = 'cookie-banner';
  caja.innerHTML = '<p>Usamos cookies esenciales para que la app funcione y analíticas para mejorarla. <a href="/legal.html#cookies">Más info</a></p>'
    + '<div class="cookie-banner-actions"><button class="cookie-btn-accept" id="cookie-accept">Aceptar</button>'
    + '<button class="cookie-btn-reject" id="cookie-reject">Solo esenciales</button></div>';
  document.body.appendChild(caja);
  caja.querySelector('#cookie-accept').addEventListener('click', function () {
    ls('cookie_consent', 'all'); caja.remove(); window.loadGA4();
  });
  caja.querySelector('#cookie-reject').addEventListener('click', function () {
    ls('cookie_consent', 'essential'); caja.remove();
  });
})();
