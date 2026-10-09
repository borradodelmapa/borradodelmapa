/* premium-modal.js — modal "Hazte Premium" (SOLO interfaz).
 *
 * La lógica de pago vive en app.js (openCoinsModal): aquí solo se pinta, se elige el periodo y se
 * llama a opts.onPay(planKey). Sin dependencias de Firebase ni de app.js → se puede ver suelto.
 *
 * FUENTE DE VERDAD DE PRECIOS Y TOPES = el Worker (PREMIUM_PLANS y PLAN_LIMITS), que los devuelve
 * en GET /usage (prices, plans). Los precios de PLANS de abajo son solo de RESPALDO para pintar al
 * instante; en cuanto llega /usage se sustituyen por los reales. Si cambias precios, cámbialos en el
 * Worker (es lo que cobra Stripe) — no hace falta tocar esto.
 */
(function () {
  'use strict';

  // Planes (3 oct 2026, plan nuevo). anual_oferta no se lista: solo se ofrece al cerrar sin comprar.
  var FALLBACK_PLANS = [
    { key: 'guia',         label: 'Guía suelta', months: 1,  cents: 999 },
    { key: 'trimestral',   label: 'Trimestral',  months: 3,  cents: 1999 },
    { key: 'anual',        label: 'Anual',       months: 12, cents: 4999, best: true },
    { key: 'anual_oferta', label: 'Anual',       months: 12, cents: 3999, hidden: true },
  ];
  var PLAN_NAMES = { free: 'Plan gratuito', guia: 'Guía suelta', trimestral: 'Premium · Trimestral', anual: 'Premium · Anual', anual_oferta: 'Premium · Anual' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function eur(cents) { return (cents / 100).toFixed(2).replace('.', ',') + ' €'; }
  function fmtDate(ms) {
    return new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function monthsText(n) { return n === 1 ? 'mes' : 'meses'; }

  function open(opts) {
    opts = opts || {};
    var ID = 'premium-modal-overlay';
    var existing = document.getElementById(ID);
    if (existing) { existing.remove(); return null; }

    var plans = FALLBACK_PLANS.map(function (p) { return Object.assign({}, p); });
    var selected = 'anual';
    var offerShown = false;
    var premiumUntilMs = opts.premiumUntilMs || 0;
    var isPremium = premiumUntilMs > Date.now();
    var usage = null;
    var usageFailed = false;
    // App de Google Play (TWA): Google no deja cobrar con Stripe dentro de la app → solo se enseña el plan y el uso,
    // sin precios ni botón de pagar (Premium se contrata en la web). 1 oct 2026.
    var sinPago = !!opts.sinPago;

    var overlay = document.createElement('div');
    overlay.id = ID;
    overlay.className = 'pm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Hazte Premium');
    overlay.innerHTML =
      '<div class="pm-sheet">' +
        '<button class="pm-close" type="button" aria-label="Cerrar">&times;</button>' +
        '<div class="pm-head">' +
          '<div class="pm-kicker" data-pm="kicker">Pase Premium</div>' +
          '<div class="pm-title" data-pm="title"></div>' +
          '<div class="pm-sub" data-pm="sub"></div>' +
        '</div>' +
        '<div class="pm-status" data-pm="status"></div>' +
        '<div data-pm="servicios" style="display:none;padding:14px 20px 4px">' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;"><span style="font-size:20px;line-height:1.2">🗺️</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">Rutas a tu medida</b><br>Las diseño y las ajusto cuando cambian los planes</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;"><span style="font-size:20px;line-height:1.2">✈️</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">Vuelos</b><br>Te los busco y te aviso si bajan de precio</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;"><span style="font-size:20px;line-height:1.2">📍</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">Guía en ruta</b><br>Mapa en directo y fotos de cada lugar</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;"><span style="font-size:20px;line-height:1.2">🎧</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">Narrador</b><br>Te cuento la historia de lo que ves</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;"><span style="font-size:20px;line-height:1.2">🆘</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">SOS</b><br>Si hay un imprevisto, te ayudo al momento</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 10px;margin:4px -10px;border-radius:10px;background:rgba(61,220,132,.10);border:1px solid rgba(61,220,132,.28);"><span style="font-size:20px;line-height:1.2">💬</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">WhatsApp</b><br>Escríbeme desde donde estés, también ahí te respondo</span></div>' +
          '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;"><span style="font-size:20px;line-height:1.2">📖</span><span style="font-size:14px;line-height:1.35;color:var(--text-secondary)"><b style="color:var(--crema);font-weight:600">Tu álbum</b><br>Guardo tus recuerdos de cada viaje</span></div>' +
        '</div>' +
        // Quien ya paga Premium NO ve precios ni "Pagar" por defecto: solo este enlace discreto (7 oct 2026, Paco)
        '<button type="button" class="pm-more" data-pm="more" style="display:none;width:100%;background:none;border:0;color:inherit;opacity:.6;text-decoration:underline;cursor:pointer;font:inherit;font-size:14px;padding:16px 0 20px;text-align:center">Añadir más tiempo</button>' +
        '<div class="pm-body" data-pm="body"' + (sinPago ? ' style="display:none"' : '') + '>' +
          '<div class="pm-plans">' +
            '<div class="pm-label">Elige periodo</div>' +
            '<div class="pm-grid" data-pm="grid" role="radiogroup" aria-label="Periodo"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pm-compare" data-pm="compare"></div>' +
        // El botón de pagar es hijo DIRECTO de la hoja para poder quedarse pegado abajo (sticky):
        // así se puede pagar sin tener que bajar por toda la lista de topes.
        '<div class="pm-cta" data-pm="cta"' + (sinPago ? ' style="display:none"' : '') + '>' +
          '<button class="pm-pay" type="button" data-pm="pay"></button>' +
          '<div class="pm-fine" data-pm="fine"></div>' +
          '<div class="pm-error" data-pm="error" role="alert"></div>' +
        '</div>' +
        '<div class="pm-loading" data-pm="loading" style="display:none">' +
          '<div class="pm-spinner"></div><span>' + (opts.viaPlay ? 'Abriendo Google Play…' : 'Conectando con Stripe…') + '</span>' +
        '</div>' +
      '</div>';

    var $ = function (name) { return overlay.querySelector('[data-pm="' + name + '"]'); };

    function selectedPlan() {
      for (var i = 0; i < plans.length; i++) if (plans[i].key === selected) return plans[i];
      return plans[2];
    }

    // ── MODO según el plan (7 oct 2026, Paco: «a quien paga Premium no hay que venderle nada») ──
    // Gratis → "Hazte Premium" con planes. Premium trimestral/anual → "Tu plan" COMPACTO: estado, uso y un enlace
    // discreto "Añadir más tiempo" (que despliega los planes). Guía suelta → "Tu plan" con los planes a la vista.
    var masAbierto = false;
    function planKey() { return usage && usage.plan ? usage.plan : (isPremium ? 'trimestral' : 'free'); }
    function premiumNow() { return usage ? !!usage.is_premium : isPremium; }
    function esCompacto() { return !sinPago && premiumNow() && planKey() !== 'guia' && !masAbierto; }
    function applyMode() {
      var prem = premiumNow(), compact = esCompacto();
      $('kicker').style.display = prem ? 'none' : '';
      $('title').textContent = sinPago ? 'Tu plan' : prem ? (masAbierto ? 'Añadir más tiempo' : 'Tu plan') : 'Hazte Premium';
      $('sub').textContent = sinPago
        ? (opts.viaPlay ? '' : 'Premium no se puede contratar desde la app de Android.')
        : prem
          ? (masAbierto ? 'El tiempo nuevo se suma al que ya tienes: no pierdes nada.'
             : planKey() === 'guia' ? 'Tu viaje con Salma y 30 días de chat. ¿Quieres más?' : 'Qué alegría tenerte a bordo. Aquí sigo para lo que necesites en tu próximo viaje.')
          : 'Guías verificadas, cambios en tus rutas y Salma sin que te cuente los mensajes.';
      $('body').style.display = (sinPago || compact) ? 'none' : '';
      $('cta').style.display = (sinPago || compact) ? 'none' : '';
      $('more').style.display = compact ? '' : 'none';
      $('servicios').style.display = compact ? '' : 'none';
      // Compacto: la hoja ocupa casi toda la pantalla (sin gran hueco negro arriba) y el enlace queda abajo
      var sh = overlay.querySelector('.pm-sheet');
      sh.style.minHeight = compact ? '88vh' : '';
      if (compact) { sh.style.minHeight = '88dvh'; sh.style.display = 'flex'; sh.style.flexDirection = 'column'; }
      else { sh.style.display = ''; sh.style.flexDirection = ''; }
      $('more').style.marginTop = compact ? 'auto' : '';
      $('servicios').style.padding = compact ? '18px 20px 8px' : '';
    }

    function renderStatus() {
      var el = $('status');
      var plan = usage && usage.plan ? usage.plan : (isPremium ? 'trimestral' : 'free');
      var premiumNow = usage ? !!usage.is_premium : isPremium;
      var stateHtml = '<span class="pm-status-val' + (premiumNow ? ' is-premium' : '') + '">' + esc(PLAN_NAMES[plan] || 'Plan gratuito') + '</span>';
      var sub = '';
      if (premiumNow) {
        sub = '<div class="pm-status-sub">Activo hasta el <b>' + esc(fmtDate(premiumUntilMs || (usage && usage.premium_until ? new Date(usage.premium_until).getTime() : 0))) + '</b></div>';
      }
      var meters = '';
      if (usage && usage.limits) {
        var l = usage.limits;
        var rows = [];
        if (plan === 'free' || plan === 'guia') rows.push(['Mensajes hoy', usage.today_msgs || 0, l.chatPerDay]);
        if (plan === 'free') rows.push(['Guía gratis', (usage.total && usage.total.guides) || 0, 1]);
        meters = rows.length ? '<div class="pm-meters">' + rows.map(function (r) {
          var pct = r[2] ? Math.min(100, Math.round((r[1] / r[2]) * 100)) : 0;
          return '<div class="pm-meter-row"><span class="pm-meter-name">' + esc(r[0]) + '</span>' +
            '<span class="pm-bar' + (pct >= 100 ? ' is-full' : '') + '"><i style="width:' + pct + '%"></i></span>' +
            '<span class="pm-meter-val">' + r[1] + '/' + r[2] + '</span></div>';
        }).join('') +
          // Guías que le quedan (guía suelta o regalo por avisar de un fallo)
          (usage.bonus_guides > 0
            ? '<div class="pm-meter-row"><span class="pm-meter-name">🎁 Guías disponibles</span><span></span><span class="pm-meter-val">' + usage.bonus_guides + '</span></div>'
            : '') +
          '</div>' : (usage.bonus_guides > 0 ? '<div class="pm-status-sub">🎁 Guías disponibles: <b>' + usage.bonus_guides + '</b></div>' : '');
      } else if (opts.loadUsage && !usageFailed) {
        meters = '<div class="pm-meters is-loading"><span class="pm-skel"></span><span class="pm-skel"></span><span class="pm-skel"></span></div>';
      }
      el.innerHTML = '<div class="pm-status-top"><span class="pm-label">' + (premiumNow ? 'Estás en' : 'Tu plan') + '</span>' + stateHtml + '</div>' + sub + meters;
    }

    function renderCompare() {
      var el = $('compare');
      if (!usage || !usage.plans || premiumNow()) { el.style.display = 'none'; return; }
      el.style.display = '';
      var f = usage.plans.free, p = usage.plans.premium;
      var stops = (p.maxStops || 50);
      var rows = [
        ['Mensajes con Salma', f.chatPerDay + ' al día', 'Sin límite a la vista'],
        ['Guías con mapa', '1 gratis', 'Todas (hasta ' + stops + ' paradas)'],
        ['Cambios en tus guías', 'Pocos', 'Los que necesites'],
        ['Alertas de vuelo', f.alerts, 'hasta ' + p.alerts],
      ];
      el.innerHTML = '<div class="pm-label">Qué incluye</div>' +
        '<table class="pm-table"><thead><tr><th></th><th>Gratis</th><th class="is-pro">Premium</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="is-pro">' + esc(r[2]) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }

    function renderPlans() {
      var visible = plans.filter(function (p) { return !p.hidden; });
      $('grid').innerHTML = visible.map(function (p) {
        var sel = p.key === selected;
        var big = p.key === 'guia' ? '1<small>guía</small>' : p.months + '<small>' + monthsText(p.months) + '</small>';
        var sub = p.key === 'guia' ? '+ chat 30 días · pago único' : eur(Math.round(p.cents / p.months)) + ' al mes';
        return '<button type="button" class="pm-plan' + (sel ? ' is-selected' : '') + '" role="radio" aria-checked="' + sel + '" data-plan="' + esc(p.key) + '"' + (p.best ? ' style="grid-column:1 / -1"' : '') + '>' +
          (p.best ? '<span class="pm-badge">Mejor precio</span>' : '') +
          '<span class="pm-plan-months">' + big + '</span>' +
          '<span class="pm-plan-name">' + esc(p.label) + '</span>' +
          '<span class="pm-plan-price">' + eur(p.cents) + '</span>' +
          '<span class="pm-plan-permonth">' + esc(sub) + '</span>' +
        '</button>';
      }).join('');
      var sp = selectedPlan();
      $('pay').innerHTML = '<span>Pagar</span><span>' + eur(sp.cents) + '</span>';
      $('fine').innerHTML = esc(sp.key === 'guia' ? '1 guía (hasta 50 paradas) y chat durante 30 días' : sp.months + ' ' + monthsText(sp.months) + ' de Premium') +
        ' · pago único, sin renovación · IVA incluido · ' + (opts.viaPlay ? 'Google Play' : 'Stripe') +
        '<br>Al pagar aceptas las <a href="/legal.html#compra" target="_blank" rel="noopener">condiciones de compra</a>: el servicio empieza al momento y pierdes el desistimiento de 14 días.' +
        ' <a href="mailto:salma@borradodelmapa.com?subject=Problema%20con%20un%20pago" style="color:inherit">¿Problema con un pago?</a>' +
        // "No se cobrará" es del modo prueba de STRIPE: con Google Play (cobro real) no se enseña nunca
        (!opts.viaPlay && usage && usage.modo_prueba ? '<br><span class="pm-test">MODO PRUEBA · no se cobrará</span>' : '');
    }

    function applyUsage(d) {
      if (!d || d.error) { usage = null; usageFailed = true; renderStatus(); return; }
      usage = d;
      if (d.prices) {
        plans.forEach(function (p) {
          var real = d.prices[p.key];
          if (real && typeof real.amount === 'number' && real.months) { p.cents = real.amount; p.months = real.months; }
        });
      }
      applyMode(); renderStatus(); renderCompare(); renderPlans();
    }

    function close() {
      if (!overlay.parentNode) return;
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (_) {} }
    }
    function onKey(e) { if (e.key === 'Escape') requestClose(); }

    // OFERTA DE SALIDA (plan nuevo, 3 oct 2026): quien cierra sin comprar ve UNA vez el anual a precio de oferta. Después se cierra.
    function offerPlan() {
      for (var i = 0; i < plans.length; i++) if (plans[i].key === 'anual_oferta') return plans[i];
      return null;
    }
    function requestClose() {
      var op = offerPlan();
      if (sinPago || isPremium || offerShown || !op || (usage && usage.is_premium)) { close(); return; }
      offerShown = true;
      var sheet = overlay.querySelector('.pm-sheet');
      var full = null;
      for (var i = 0; i < plans.length; i++) if (plans[i].key === 'anual') full = plans[i];
      sheet.querySelectorAll('.pm-head, .pm-status, .pm-body, .pm-compare, .pm-cta').forEach(function (n) { n.style.display = 'none'; });
      var box = document.createElement('div');
      box.className = 'pm-head';
      box.setAttribute('data-pm', 'offer');
      box.innerHTML =
        '<div class="pm-kicker">Antes de irte</div>' +
        '<div class="pm-title">Anual a ' + eur(op.cents) + '</div>' +
        '<div class="pm-sub">12 meses de Premium' + (full ? ' en vez de ' + eur(full.cents) : '') + ' · pago único, sin renovación. Solo te lo enseño ahora.</div>' +
        '<div class="pm-cta" style="position:static;margin-top:18px">' +
          '<button class="pm-pay" type="button" data-pm="offer-pay"><span>Pagar</span><span>' + eur(op.cents) + '</span></button>' +
          '<button type="button" data-pm="offer-no" style="margin-top:12px;background:none;border:0;color:inherit;opacity:.7;text-decoration:underline;cursor:pointer;font:inherit">No, gracias</button>' +
          '<div class="pm-error" data-pm="offer-err" role="alert"></div>' +
        '</div>';
      sheet.appendChild(box);
      box.querySelector('[data-pm="offer-no"]').addEventListener('click', close);
      box.querySelector('[data-pm="offer-pay"]').addEventListener('click', function () {
        var btn = this, er = box.querySelector('[data-pm="offer-err"]');
        er.textContent = ''; btn.disabled = true;
        Promise.resolve().then(function () { return opts.onPay('anual_oferta'); }).catch(function (e) {
          btn.disabled = false; er.textContent = (e && e.message) || 'Error de conexión. Inténtalo de nuevo.';
        });
      });
    }

    // Eventos
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { requestClose(); return; }
      var planBtn = e.target.closest && e.target.closest('.pm-plan');
      if (planBtn && overlay.contains(planBtn)) { selected = planBtn.getAttribute('data-plan'); renderPlans(); }
    });
    overlay.querySelector('.pm-close').addEventListener('click', requestClose);
    document.addEventListener('keydown', onKey);

    $('pay').addEventListener('click', function () {
      var payBtn = $('pay'), err = $('error'), body = $('body'), cta = $('cta'), loading = $('loading');
      err.textContent = '';
      payBtn.disabled = true; body.style.display = 'none'; cta.style.display = 'none'; loading.style.display = 'flex';
      Promise.resolve().then(function () { return opts.onPay(selected); }).catch(function (e) {
        loading.style.display = 'none'; body.style.display = ''; cta.style.display = ''; payBtn.disabled = false;
        err.textContent = (e && e.message) || 'Error de conexión. Inténtalo de nuevo.';
      });
    });

    $('more').addEventListener('click', function () { masAbierto = true; applyMode(); renderPlans(); });
    applyMode(); renderStatus(); renderCompare(); renderPlans();
    document.body.appendChild(overlay);
    if (typeof opts.loadUsage === 'function') {
      Promise.resolve().then(opts.loadUsage).then(applyUsage).catch(function () {
        // Sin /usage el modal funciona igual (precios de respaldo); solo se quitan los contadores
        usage = null; usageFailed = true; renderStatus();
      });
    }
    return { close: close };
  }

  window.PremiumModal = { open: open };
})();
