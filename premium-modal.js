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

  var FALLBACK_PLANS = [
    { key: '1viaje',     label: '1 viaje',    months: 1,  cents: 499 },
    { key: 'trimestral', label: 'Trimestral', months: 3,  cents: 899 },
    { key: 'semestral',  label: 'Semestral',  months: 6,  cents: 1499 },
    { key: 'anual',      label: 'Anual',      months: 12, cents: 2499, best: true },
  ];

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
    var premiumUntilMs = opts.premiumUntilMs || 0;
    var isPremium = premiumUntilMs > Date.now();
    var usage = null;
    var usageFailed = false;

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
          '<div class="pm-kicker">Pase Premium</div>' +
          '<div class="pm-title">' + (isPremium ? 'Amplía tu Premium' : 'Hazte Premium') + '</div>' +
          '<div class="pm-sub">' + (isPremium
            ? 'El tiempo nuevo se suma al que ya tienes: no pierdes nada.'
            : 'Más guías verificadas, más cambios y más mensajes con Salma.') + '</div>' +
        '</div>' +
        '<div class="pm-status" data-pm="status"></div>' +
        '<div class="pm-body" data-pm="body">' +
          '<div class="pm-plans">' +
            '<div class="pm-label">Elige periodo</div>' +
            '<div class="pm-grid" data-pm="grid" role="radiogroup" aria-label="Periodo"></div>' +
          '</div>' +
        '</div>' +
        '<div class="pm-compare" data-pm="compare"></div>' +
        // El botón de pagar es hijo DIRECTO de la hoja para poder quedarse pegado abajo (sticky):
        // así se puede pagar sin tener que bajar por toda la lista de topes.
        '<div class="pm-cta" data-pm="cta">' +
          '<button class="pm-pay" type="button" data-pm="pay"></button>' +
          '<div class="pm-fine" data-pm="fine"></div>' +
          '<div class="pm-error" data-pm="error" role="alert"></div>' +
        '</div>' +
        '<div class="pm-loading" data-pm="loading" style="display:none">' +
          '<div class="pm-spinner"></div><span>Conectando con Stripe…</span>' +
        '</div>' +
      '</div>';

    var $ = function (name) { return overlay.querySelector('[data-pm="' + name + '"]'); };

    function selectedPlan() {
      for (var i = 0; i < plans.length; i++) if (plans[i].key === selected) return plans[i];
      return plans[plans.length - 1];
    }

    function renderStatus() {
      var el = $('status');
      var stateHtml = isPremium
        ? '<span class="pm-status-val is-premium">Premium</span>'
        : '<span class="pm-status-val">Plan gratuito</span>';
      var sub = isPremium
        ? '<div class="pm-status-sub">Activo hasta el <b>' + esc(fmtDate(premiumUntilMs)) + '</b></div>'
        : '';
      var meters = '';
      if (usage && usage.limits) {
        var l = usage.limits, m = usage.month || {}, t = usage.total || {};
        var rows = usage.plan === 'premium'
          ? [['Guías este mes', m.guides || 0, l.guidesPerMonth], ['Cambios este mes', m.edits || 0, l.editsPerMonth], ['Mensajes hoy', usage.today_msgs || 0, l.chatPerDay]]
          : [['Guías', t.guides || 0, l.guides], ['Cambios', t.edits || 0, l.edits], ['Mensajes hoy', usage.today_msgs || 0, l.chatPerDay]];
        meters = '<div class="pm-meters">' + rows.map(function (r) {
          var pct = r[2] ? Math.min(100, Math.round((r[1] / r[2]) * 100)) : 0;
          return '<div class="pm-meter-row"><span class="pm-meter-name">' + esc(r[0]) + '</span>' +
            '<span class="pm-bar' + (pct >= 100 ? ' is-full' : '') + '"><i style="width:' + pct + '%"></i></span>' +
            '<span class="pm-meter-val">' + r[1] + '/' + r[2] + '</span></div>';
        }).join('') +
          // Guías extra (caso p-mui1yhp9ls1): las da recargar siendo ya Premium; se gastan tras el cupo del mes.
          (usage.plan === 'premium' && usage.bonus_guides > 0
            ? '<div class="pm-meter-row"><span class="pm-meter-name">Guías extra</span><span></span><span class="pm-meter-val">+' + usage.bonus_guides + '</span></div>'
            : '') +
          '</div>' +
          (usage.plan === 'premium' && usage.bonus_per_payment
            ? '<div class="pm-status-sub">Si recargas ahora: más meses y <b>' + usage.bonus_per_payment + ' guías extra</b> para cuando acabes las del mes.</div>'
            : '');
      } else if (opts.loadUsage && !usageFailed) {
        meters = '<div class="pm-meters is-loading"><span class="pm-skel"></span><span class="pm-skel"></span><span class="pm-skel"></span></div>';
      }
      el.innerHTML = '<div class="pm-status-top"><span class="pm-label">Tu plan</span>' + stateHtml + '</div>' + sub + meters;
    }

    function renderCompare() {
      var el = $('compare');
      if (!usage || !usage.plans) { el.style.display = 'none'; return; }
      el.style.display = '';
      var f = usage.plans.free, p = usage.plans.premium;
      var rows = [
        ['Guías', f.guides + ' en total', p.guidesPerMonth + ' al mes'],
        ['Cambios en tus guías', f.edits + ' en total', p.editsPerMonth + ' al mes'],
        ['Mensajes con Salma', f.chatPerDay + ' al día', p.chatPerDay + ' al día'],
        ['Alertas de vuelo', f.alerts, 'hasta ' + p.alerts],
      ];
      el.innerHTML = '<div class="pm-label">Qué incluye</div>' +
        '<table class="pm-table"><thead><tr><th></th><th>Gratis</th><th class="is-pro">Premium</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td class="is-pro">' + esc(r[2]) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }

    function renderPlans() {
      var base = plans[0];
      $('grid').innerHTML = plans.map(function (p) {
        var perMonth = Math.round(p.cents / p.months);
        var saving = p.months > 1 && base ? Math.round((1 - perMonth / (base.cents / base.months)) * 100) : 0;
        var sel = p.key === selected;
        return '<button type="button" class="pm-plan' + (sel ? ' is-selected' : '') + '" role="radio" aria-checked="' + sel + '" data-plan="' + esc(p.key) + '">' +
          (p.best ? '<span class="pm-badge">Mejor precio</span>' : '') +
          '<span class="pm-plan-months">' + p.months + '<small>' + monthsText(p.months) + '</small></span>' +
          '<span class="pm-plan-name">' + esc(p.label) + '</span>' +
          '<span class="pm-plan-price">' + eur(p.cents) + '</span>' +
          '<span class="pm-plan-permonth">' + (p.months > 1 ? eur(perMonth) + ' al mes' : 'pago único') +
            (saving > 0 ? ' <b class="pm-save">−' + saving + '%</b>' : '') + '</span>' +
        '</button>';
      }).join('');
      var sp = selectedPlan();
      $('pay').innerHTML = '<span>Pagar</span><span>' + eur(sp.cents) + '</span>';
      $('fine').innerHTML = esc(sp.months + ' ' + monthsText(sp.months) + ' de Premium') +
        ' · pago único, sin renovación · Stripe<br><span class="pm-test">MODO PRUEBA · no se cobrará</span>';
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
      renderStatus(); renderCompare(); renderPlans();
    }

    function close() {
      if (!overlay.parentNode) return;
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (_) {} }
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    // Eventos
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { close(); return; }
      var planBtn = e.target.closest && e.target.closest('.pm-plan');
      if (planBtn && overlay.contains(planBtn)) { selected = planBtn.getAttribute('data-plan'); renderPlans(); }
    });
    overlay.querySelector('.pm-close').addEventListener('click', close);
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

    renderStatus(); renderCompare(); renderPlans();
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
