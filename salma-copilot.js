/* ============================================================
   SALMA COPILOTO — Asistente en tiempo real durante el viaje
   Activo en la vista verRuta(). Edita la ruta en memoria y
   guarda a Firestore solo cuando el usuario lo pide.
   ============================================================ */

window._copilot = {
  routeId: null,
  routeData: null,   // objeto completo de la ruta (con .stops)
  pois: [],          // copia de trabajo de los stops
  destination: '',
  uid: null,
  currentDay: 1,
  pendingMoveStop: null,
  userLocation: null,
  dirty: false,
  initialized: false
};

// ===== MOCK DATA (sustituir por Google Places en fase 2) =====

var COPILOT_MOCK_HOTELS = [
  { id: 'h1', name: 'Hotel del Centro', price: '45€/noche', desc: 'Bien ubicado, a menos de 10 min de las paradas principales del día.' },
  { id: 'h2', name: 'Hostal Local',     price: '32€/noche', desc: 'Opción económica sólida. Sin lujos pero limpio y bien situado.' },
  { id: 'h3', name: 'Apartamento Zona', price: '58€/noche', desc: 'Más espacio, ideal si vais dos o más. Cocina incluida.' }
];

var COPILOT_MOCK_FOOD = [
  { id: 'f1', name: 'Bar de tapas local',    price: '8–12€/persona',  desc: 'Cocina del barrio, buena relación calidad/precio y sin esperas.' },
  { id: 'f2', name: 'Mercado central',       price: '5–10€/persona',  desc: 'Variado y rápido. Ideal si no quieres perder tiempo.' },
  { id: 'f3', name: 'Restaurante del barrio', price: '12–18€/persona', desc: 'Para sentarte tranquilo. Cocina local de verdad.' }
];

// ===== INIT =====

function copilotInit(routeId, routeData, pois, destination, uid) {
  window._copilot.routeId    = routeId;
  window._copilot.routeData  = routeData || {};
  window._copilot.pois       = (pois || []).slice();
  window._copilot.destination = destination || (routeData && (routeData.country || routeData.region)) || '';
  window._copilot.uid        = uid;
  window._copilot.currentDay = 1;
  window._copilot.pendingMoveStop = null;
  window._copilot.userLocation    = null;
  window._copilot.dirty           = false;

  if (!window._copilot.initialized) {
    copilotInjectHTML();
    copilotBindEvents();
    // Parchar showPage para ocultar el copiloto al salir de la vista ruta
    var _orig = window.showPage;
    if (_orig) {
      window.showPage = function(page) {
        _orig(page);
        if (page !== 'ruta') {
          copilotHideFloating();
          copilotClose();
        }
      };
    }
    window._copilot.initialized = true;
  }

  // Reset del chat en cada apertura de ruta
  var msgs = document.getElementById('copilot-messages');
  if (msgs) msgs.innerHTML = '';
  copilotHideSaveBanner();
  copilotShowFloating();
}
window.copilotInit = copilotInit;

// ===== INJECT HTML & CSS =====

function copilotInjectHTML() {
  // --- CSS ---
  var style = document.createElement('style');
  style.textContent = [
    '.copilot-float{',
      'position:fixed;right:18px;z-index:200;',
      'border:none;border-radius:999px;padding:14px 20px;',
      "font-family:'JetBrains Mono',monospace;font-size:11px;",
      'font-weight:700;letter-spacing:.1em;cursor:pointer;',
      'box-shadow:0 8px 28px rgba(0,0,0,.45);transition:transform .15s, box-shadow .15s;',
    '}',
    '.copilot-float:hover{transform:scale(1.06);box-shadow:0 12px 36px rgba(0,0,0,.55);}',
    '.copilot-float.salma{bottom:78px;background:#d4a017;color:#0a0908;}',
    '.copilot-float.sos  {bottom:146px;background:#b00020;color:#fff;}',
    '.copilot-float.cplt-hidden{display:none!important;}',

    '#copilot-backdrop{',
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:300;display:none;',
    '}',

    '#copilot-panel{',
      'position:fixed;bottom:0;left:50%;transform:translateX(-50%);',
      'width:100%;max-width:620px;height:76vh;',
      'background:#111;',
      'border-radius:20px 20px 0 0;',
      'border-top:1px solid rgba(212,160,23,.3);',
      'border-left:1px solid rgba(212,160,23,.15);',
      'border-right:1px solid rgba(212,160,23,.15);',
      'display:none;flex-direction:column;z-index:301;',
      'box-shadow:0 -12px 48px rgba(0,0,0,.55);',
    '}',

    '#copilot-head{',
      'padding:16px 20px;border-bottom:1px solid rgba(212,160,23,.12);',
      'display:flex;align-items:center;justify-content:space-between;flex-shrink:0;',
    '}',

    '#copilot-messages{',
      'flex:1;overflow-y:auto;padding:14px;',
      'display:flex;flex-direction:column;gap:10px;',
      'background:rgba(0,0,0,.2);',
    '}',

    '.cplt-msg{',
      'max-width:88%;padding:12px 15px;border-radius:16px;',
      'font-size:14px;line-height:1.5;',
    '}',
    '.cplt-msg.user  {align-self:flex-end;background:rgba(212,160,23,.2);color:#f5f0e8;}',
    '.cplt-msg.salma {align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(212,160,23,.18);color:#f5f0e8;}',
    '.cplt-msg.system{align-self:center;background:transparent;border:1px dashed rgba(212,160,23,.2);',
      "color:rgba(245,240,232,.45);font-size:12px;font-family:'JetBrains Mono',monospace;}",

    '.cplt-card{',
      'background:rgba(255,255,255,.04);border:1px solid rgba(212,160,23,.2);',
      'border-radius:14px;padding:14px;',
    '}',
    '.cplt-card h4{margin:0 0 5px;font-size:14px;color:#f5f0e8;font-weight:700;}',
    '.cplt-card p {margin:0 0 10px;font-size:13px;color:rgba(245,240,232,.65);line-height:1.4;}',
    '.cplt-card-actions{display:flex;gap:8px;flex-wrap:wrap;}',
    '.cplt-card-btn{',
      'border:1px solid rgba(212,160,23,.3);background:transparent;border-radius:8px;',
      "padding:7px 12px;font-size:12px;color:#d4a017;cursor:pointer;",
      "font-family:'JetBrains Mono',monospace;letter-spacing:.06em;",
    '}',
    '.cplt-card-btn:hover{background:rgba(212,160,23,.1);}',

    '#copilot-quick{',
      'display:flex;gap:8px;overflow-x:auto;padding:11px 16px;',
      'border-top:1px solid rgba(212,160,23,.1);flex-shrink:0;',
      'scrollbar-width:none;',
    '}',
    '#copilot-quick::-webkit-scrollbar{display:none;}',
    '.cplt-quick{',
      'white-space:nowrap;border:1px solid rgba(212,160,23,.22);border-radius:999px;',
      "padding:9px 14px;background:transparent;color:#d4a017;cursor:pointer;",
      "font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;",
    '}',
    '.cplt-quick:hover{background:rgba(212,160,23,.1);}',

    '#copilot-input-row{',
      'display:flex;gap:8px;padding:12px 16px 20px;',
      'border-top:1px solid rgba(212,160,23,.1);flex-shrink:0;',
    '}',
    '#copilot-input{',
      'flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(212,160,23,.22);',
      "border-radius:10px;padding:11px 14px;font-size:14px;color:#f5f0e8;",
      "font-family:'Inter',sans-serif;",
    '}',
    '#copilot-input::placeholder{color:rgba(245,240,232,.3);}',
    '#copilot-input:focus{outline:none;border-color:rgba(212,160,23,.55);}',
    '#copilot-send{',
      'background:#d4a017;color:#0a0908;border:none;border-radius:10px;',
      "padding:11px 18px;font-family:'JetBrains Mono',monospace;font-size:11px;",
      'font-weight:700;letter-spacing:.08em;cursor:pointer;',
    '}',
    '#copilot-send:hover{background:#e0b020;}',

    '#copilot-save-banner{',
      'position:fixed;top:0;left:50%;transform:translateX(-50%);',
      'width:100%;max-width:620px;z-index:250;',
      'background:#d4a017;color:#0a0908;padding:11px 20px;',
      'display:none;align-items:center;justify-content:space-between;gap:12px;',
      "font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.08em;",
    '}',
    '#copilot-save-btn{',
      'background:#0a0908;color:#d4a017;border:none;border-radius:8px;',
      "padding:8px 16px;font-family:'JetBrains Mono',monospace;",
      'font-size:10px;font-weight:700;letter-spacing:.08em;cursor:pointer;white-space:nowrap;',
    '}',

    '#copilot-toast{',
      'position:fixed;left:50%;transform:translateX(-50%);bottom:92px;z-index:400;',
      'background:#1a1816;color:#f5f0e8;padding:10px 18px;border-radius:999px;',
      'font-size:13px;border:1px solid rgba(212,160,23,.25);',
      'pointer-events:none;display:none;white-space:nowrap;',
    '}'
  ].join('');
  document.head.appendChild(style);

  // --- HTML ---
  var wrap = document.createElement('div');
  wrap.innerHTML = [
    '<button id="copilot-btn-salma" class="copilot-float salma cplt-hidden">SALMA</button>',
    '<button id="copilot-btn-sos"   class="copilot-float sos   cplt-hidden">SOS</button>',

    '<div id="copilot-backdrop"></div>',

    '<div id="copilot-panel">',
      '<div id="copilot-head">',
        '<div>',
          "<div style=\"font-family:'Inter Tight',sans-serif;font-size:16px;font-weight:700;color:#fff;\">SALMA</div>",
          "<div style=\"font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(212,160,23,.75);letter-spacing:.12em;margin-top:3px;\">COPILOTO &middot; EN RUTA</div>",
        '</div>',
        '<button id="copilot-close" style="background:transparent;border:1px solid rgba(212,160,23,.2);border-radius:8px;padding:8px 14px;color:rgba(245,240,232,.55);font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.08em;">CERRAR</button>',
      '</div>',

      '<div id="copilot-messages"></div>',

      '<div id="copilot-quick">',
        '<button class="cplt-quick" data-action="hotel">🏨 Hotel esta noche</button>',
        '<button class="cplt-quick" data-action="food">🍜 Comer cerca</button>',
        '<button class="cplt-quick" data-action="reduce">✂️ Aligerar ruta</button>',
        '<button class="cplt-quick" data-action="rain">☔ Plan lluvia</button>',
      '</div>',

      '<div id="copilot-input-row">',
        '<input id="copilot-input" type="text" placeholder="Pregunta a SALMA lo que necesites...">',
        '<button id="copilot-send">ENVIAR</button>',
      '</div>',
    '</div>',

    '<div id="copilot-save-banner">',
      '<span>⚠ Tienes cambios sin guardar en la ruta</span>',
      '<button id="copilot-save-btn" onclick="copilotSave()">GUARDAR CAMBIOS</button>',
    '</div>',

    '<div id="copilot-toast"></div>'
  ].join('');
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
}

// ===== BIND EVENTS =====

function copilotBindEvents() {
  document.getElementById('copilot-btn-salma').addEventListener('click', function() {
    copilotOpen();
    var msgs = document.getElementById('copilot-messages');
    if (msgs && !msgs.children.length) {
      copilotAddMessage('Estoy contigo en el viaje. Puedo buscar hotel, comida, aligerar el día o adaptar el plan si algo cambia.', 'salma');
    }
  });

  document.getElementById('copilot-btn-sos').addEventListener('click', function() {
    copilotOpen();
    copilotAddMessage('🔴 SOS activado. ¿Qué necesitas ahora mismo?', 'salma');
    setTimeout(function() {
      copilotAddMessage('Usa los botones rápidos de abajo o escríbeme directamente.', 'salma');
    }, 300);
  });

  document.getElementById('copilot-close').addEventListener('click', copilotClose);
  document.getElementById('copilot-backdrop').addEventListener('click', copilotClose);
  document.getElementById('copilot-send').addEventListener('click', copilotHandleInput);
  document.getElementById('copilot-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') copilotHandleInput();
  });

  document.querySelectorAll('.cplt-quick').forEach(function(btn) {
    btn.addEventListener('click', function() {
      copilotTriggerAction(btn.dataset.action);
    });
  });
}

// ===== VISIBILIDAD =====

function copilotShowFloating() {
  ['copilot-btn-salma', 'copilot-btn-sos'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('cplt-hidden');
  });
}
function copilotHideFloating() {
  ['copilot-btn-salma', 'copilot-btn-sos'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('cplt-hidden');
  });
}

function copilotOpen() {
  var panel    = document.getElementById('copilot-panel');
  var backdrop = document.getElementById('copilot-backdrop');
  if (panel)    panel.style.display    = 'flex';
  if (backdrop) backdrop.style.display = 'block';
}
function copilotClose() {
  var panel    = document.getElementById('copilot-panel');
  var backdrop = document.getElementById('copilot-backdrop');
  if (panel)    panel.style.display    = 'none';
  if (backdrop) backdrop.style.display = 'none';
}
window.copilotClose = copilotClose;

// ===== MENSAJES =====

function copilotAddMessage(text, who) {
  var msgs = document.getElementById('copilot-messages');
  if (!msgs) return;
  var div = document.createElement('div');
  div.className = 'cplt-msg ' + (who || 'salma');
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function copilotAddCard(title, subtitle, actions) {
  var msgs = document.getElementById('copilot-messages');
  if (!msgs) return;
  var card = document.createElement('div');
  card.className = 'cplt-card';
  var btnsHTML = (actions || []).map(function(a) {
    return '<button class="cplt-card-btn">' + (a.label || '') + '</button>';
  }).join('');
  card.innerHTML = '<h4>' + (title || '') + '</h4><p>' + (subtitle || '') + '</p>' +
    '<div class="cplt-card-actions">' + btnsHTML + '</div>';
  card.querySelectorAll('.cplt-card-btn').forEach(function(btn, i) {
    if (actions[i] && actions[i].onClick) btn.addEventListener('click', actions[i].onClick);
  });
  msgs.appendChild(card);
  msgs.scrollTop = msgs.scrollHeight;
}

function copilotShowToast(text) {
  var t = document.getElementById('copilot-toast');
  if (!t) return;
  t.textContent = text;
  t.style.display = 'block';
  clearTimeout(window._copilotToastTimer);
  window._copilotToastTimer = setTimeout(function() { t.style.display = 'none'; }, 2200);
}

// ===== BANNER GUARDAR =====

function copilotMarkDirty() {
  window._copilot.dirty = true;
  var banner = document.getElementById('copilot-save-banner');
  if (banner) banner.style.display = 'flex';
}
function copilotHideSaveBanner() {
  window._copilot.dirty = false;
  var banner = document.getElementById('copilot-save-banner');
  if (banner) banner.style.display = 'none';
}

// ===== EDICIÓN DE RUTA =====

function copilotAddStopToDay(stop, dayNum) {
  stop.day = dayNum || window._copilot.currentDay;
  window._copilot.pois.push(stop);
  if (window._copilot.routeData) window._copilot.routeData.stops = window._copilot.pois;
  copilotRerenderAccordion();
  copilotMarkDirty();
}

function copilotRemoveLastStopFromDay(dayNum) {
  var day  = dayNum || window._copilot.currentDay;
  var pois = window._copilot.pois;
  for (var i = pois.length - 1; i >= 0; i--) {
    if ((pois[i].day || 1) === day) {
      var removed = pois.splice(i, 1)[0];
      if (window._copilot.routeData) window._copilot.routeData.stops = pois;
      copilotRerenderAccordion();
      copilotMarkDirty();
      return removed;
    }
  }
  return null;
}

// ===== RE-RENDER DEL ACORDEÓN =====
// Reconstruye solo el bloque de días/paradas sin recargar toda la ruta

function copilotRerenderAccordion() {
  var wrapper = document.getElementById('vr-stops-wrapper');
  if (!wrapper) return;

  var pois = window._copilot.pois;
  var dest = window._copilot.destination;

  var typeIcons = {
    city:'🏙', town:'🏘', nature:'🌿', beach:'🏖', mountain:'⛰',
    temple:'🛕', viewpoint:'📸', route:'🛤', activity:'🎯', other:'📍',
    lugar:'📍', hotel:'🏨', restaurante:'🍜', experiencia:'🎯', mirador:'📸', ruta:'🛤'
  };

  // Agrupar por día
  var dayGroups = {}, dayOrder = [];
  pois.forEach(function(s) {
    var d = s.day || 1;
    if (!dayGroups[d]) { dayGroups[d] = []; dayOrder.push(d); }
    dayGroups[d].push(s);
  });
  dayOrder.sort(function(a, b) { return a - b; });

  var html = '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;' +
    'color:var(--dorado);letter-spacing:.18em;margin-bottom:12px;">' +
    'ITINERARIO · ' + pois.length + ' PARADAS</div>';

  var stopIdx = 0;

  dayOrder.forEach(function(dayNum) {
    var dayStops = dayGroups[dayNum];
    var dayTitle = '';
    for (var di = 0; di < dayStops.length; di++) {
      if (dayStops[di].day_title) { dayTitle = dayStops[di].day_title; break; }
    }
    var contentId = 'vr-day-content-' + dayNum;
    var arrowId   = 'vr-day-arrow-'   + dayNum;

    var dayStopsHTML = '';
    dayStops.forEach(function(stop) {
      var idx      = stopIdx++;
      var icon     = typeIcons[stop.type] || typeIcons[stop.tipo] || '📍';
      var rawName  = (stop.headline || stop.name || '');
      var headline = rawName.replace(/</g, '&lt;');
      var narrative = (stop.narrative || stop.description || '').replace(/</g, '&lt;');
      var secret    = (stop.local_secret || '').replace(/</g, '&lt;');
      var practical = (stop.practical || '').replace(/</g, '&lt;');
      var stopId    = 'vr-stop-' + idx;
      var hasDetails = !!(narrative || secret || practical);
      var mapsUrl = rawName && dest
        ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(rawName + ' ' + dest)
        : (stop.lat && stop.lng ? 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng : '');

      dayStopsHTML +=
        '<div style="border-bottom:1px solid rgba(212,160,23,.08);">' +
          '<div onclick="salmaToggleStop(\'' + stopId + '\')" ' +
            'style="display:flex;align-items:center;gap:10px;padding:16px 0;cursor:pointer;" ' +
            'onmouseover="this.style.background=\'rgba(255,255,255,.02)\'" ' +
            'onmouseout="this.style.background=\'none\'">' +
            '<div style="flex:1;">' +
              '<div style="font-family:\'Inter Tight\',sans-serif;font-size:18px;font-weight:700;color:#fff;line-height:1.2;">' +
                '<span style="font-size:16px;margin-right:6px;">' + icon + '</span>' + headline +
              '</div>' +
            '</div>' +
            (hasDetails ? '<div style="flex-shrink:0;font-size:12px;color:var(--dorado);" id="' + stopId + '-arrow">▾</div>' : '') +
          '</div>' +
          (hasDetails
            ? '<div id="' + stopId + '" style="display:none;padding:0 0 16px 8px;">' +
                (narrative  ? '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.75;margin-bottom:16px;">' + narrative + '</div>' : '') +
                (secret     ? '<div style="background:rgba(212,160,23,.06);border-left:3px solid var(--dorado);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
                                '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.14em;margin-bottom:6px;">🔑 SECRETO LOCAL</div>' +
                                '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + secret + '</div>' +
                              '</div>' : '') +
                (practical  ? '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:rgba(245,240,232,.55);line-height:1.8;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:10px;margin-bottom:12px;">📋 ' + practical + '</div>' : '') +
                (mapsUrl    ? '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;">VER EN MAPA →</a>' : '') +
              '</div>'
            : '') +
        '</div>';
    });

    html +=
      '<div style="border:1px solid rgba(212,160,23,.15);border-radius:14px;margin-bottom:10px;overflow:hidden;">' +
        '<div onclick="salmaToggleDay(\'' + contentId + '\',\'' + arrowId + '\')" ' +
          'style="display:flex;align-items:center;gap:10px;padding:14px 18px;cursor:pointer;background:rgba(212,160,23,.04);" ' +
          'onmouseover="this.style.background=\'rgba(212,160,23,.09)\'" ' +
          'onmouseout="this.style.background=\'rgba(212,160,23,.04)\'">' +
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;white-space:nowrap;">DÍA ' + dayNum + '</div>' +
          (dayTitle ? '<div style="font-size:13px;color:rgba(245,240,232,.75);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">· ' + dayTitle.replace(/</g,'&lt;') + '</div>' : '') +
          '<div style="flex:1;"></div>' +
          '<div style="font-size:10px;color:rgba(212,160,23,.55);font-family:\'JetBrains Mono\',monospace;">' + dayStops.length + ' paradas</div>' +
          '<div id="' + arrowId + '" style="font-size:12px;color:var(--dorado);margin-left:8px;">▾</div>' +
        '</div>' +
        '<div id="' + contentId + '" style="display:none;">' +
          '<div style="padding:0 16px 8px;">' + dayStopsHTML + '</div>' +
        '</div>' +
      '</div>';
  });

  wrapper.innerHTML = html;
}

// ===== GUARDAR EN FIRESTORE =====

function copilotSave() {
  var uid     = window._copilot.uid;
  var routeId = window._copilot.routeId;
  if (!uid || !routeId || !window._fbDb) {
    copilotShowToast('No se puede guardar ahora mismo');
    return;
  }
  var routeData = window._copilot.routeData || {};
  routeData.stops = window._copilot.pois;
  window._fbDb.collection('users').doc(uid).collection('maps').doc(routeId)
    .update({ itinerarioIA: JSON.stringify(routeData), updatedAt: new Date().toISOString() })
    .then(function() {
      copilotHideSaveBanner();
      copilotShowToast('Cambios guardados ✓');
      copilotAddMessage('Ruta guardada. Los cambios ya están en tu perfil.', 'salma');
    })
    .catch(function(e) {
      copilotShowToast('Error al guardar: ' + e.message);
    });
}
window.copilotSave = copilotSave;

// ===== GEOLOCALIZACIÓN =====

function copilotRequestLocation(callback) {
  if (window._copilot.userLocation) { callback(); return; }
  if (!navigator.geolocation) {
    copilotAddMessage('Tu navegador no permite geolocalización. Te doy sugerencias sin posición exacta.', 'system');
    callback();
    return;
  }
  copilotAddMessage('Activa tu ubicación para ver opciones más cercanas.', 'system');
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      window._copilot.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      copilotAddMessage('Ubicación activada ✓', 'system');
      callback();
    },
    function() {
      copilotAddMessage('No he podido acceder a tu ubicación. Sugerencias sin posición exacta.', 'system');
      callback();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}

// ===== ACCIONES RÁPIDAS =====

function copilotActionHotel() {
  copilotRequestLocation(function() {
    var dest = window._copilot.destination;
    copilotAddMessage(
      'He buscado opciones para esta noche' + (dest ? ' en ' + dest : '') +
      '. Las 3 mejores por ubicación y precio:',
      'salma'
    );
    COPILOT_MOCK_HOTELS.forEach(function(h) {
      copilotAddCard(h.name + ' · ' + h.price, h.desc, [
        {
          label: 'Añadir a ruta',
          onClick: function() {
            var day    = window._copilot.currentDay;
            var existe = window._copilot.pois.some(function(p) {
              return (p.name || p.headline) === h.name;
            });
            if (existe) { copilotShowToast('Ya está en la ruta'); return; }
            copilotAddStopToDay({
              name: h.name, headline: h.name, type: 'hotel',
              narrative: h.desc + ' · ' + h.price, day: day
            }, day);
            copilotAddMessage('He añadido ' + h.name + ' al día ' + day + '. Guarda cuando quieras.', 'salma');
          }
        },
        {
          label: 'Ver en Maps',
          onClick: function() {
            var q = encodeURIComponent(h.name + (dest ? ' ' + dest : ''));
            window.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank');
          }
        }
      ]);
    });
  });
}

function copilotActionFood() {
  copilotRequestLocation(function() {
    var dest = window._copilot.destination;
    copilotAddMessage(
      'Sitios para comer ahora' + (dest ? ' en ' + dest : '') + ':',
      'salma'
    );
    COPILOT_MOCK_FOOD.forEach(function(f) {
      copilotAddCard(f.name + ' · ' + f.price, f.desc, [
        {
          label: 'Añadir a ruta',
          onClick: function() {
            var day    = window._copilot.currentDay;
            var existe = window._copilot.pois.some(function(p) {
              return (p.name || p.headline) === f.name;
            });
            if (existe) { copilotShowToast('Ya está en la ruta'); return; }
            copilotAddStopToDay({
              name: f.name, headline: f.name, type: 'restaurante',
              narrative: f.desc + ' · ' + f.price, day: day
            }, day);
            copilotAddMessage('Añadido ' + f.name + ' al día ' + day + '.', 'salma');
          }
        }
      ]);
    });
  });
}

function copilotActionReduce() {
  var day      = window._copilot.currentDay;
  var dayStops = window._copilot.pois.filter(function(p) { return (p.day || 1) === day; });
  if (dayStops.length <= 3) {
    copilotAddMessage(
      'El día ' + day + ' ya está bastante ajustado (' + dayStops.length + ' paradas). No tocaría más.',
      'salma'
    );
    return;
  }
  var removed = copilotRemoveLastStopFromDay(day);
  if (removed) {
    copilotAddMessage(
      'He quitado "' + (removed.headline || removed.name) + '" del día ' + day +
      '. Así va más cómodo.',
      'salma'
    );
  }
}

function copilotActionRain() {
  var day      = window._copilot.currentDay;
  var dayStops = window._copilot.pois.filter(function(p) { return (p.day || 1) === day; });
  copilotAddMessage(
    'Plan lluvia para el día ' + day + ': busca museos, mercados cubiertos o cafeterías con encanto. ' +
    'Si el día tiene muchas paradas al aire libre, te lo aligero ahora.',
    'salma'
  );
  if (dayStops.length > 3) {
    setTimeout(function() {
      var removed = copilotRemoveLastStopFromDay(day);
      if (removed) {
        copilotAddMessage(
          'He quitado "' + (removed.headline || removed.name) + '" para dejarte margen de maniobra.',
          'salma'
        );
      }
    }, 700);
  }
}

function copilotTriggerAction(action) {
  copilotOpen();
  var labels = {
    hotel:  'Hotel esta noche',
    food:   'Quiero comer cerca',
    reduce: 'Aligera el día de hoy',
    rain:   'Está lloviendo, plan B'
  };
  copilotAddMessage(labels[action] || action, 'user');
  if      (action === 'hotel')  copilotActionHotel();
  else if (action === 'food')   copilotActionFood();
  else if (action === 'reduce') copilotActionReduce();
  else if (action === 'rain')   copilotActionRain();
}

// ===== INPUT Y DETECCIÓN DE INTENCIÓN =====

function copilotHandleInput() {
  var input = document.getElementById('copilot-input');
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;
  copilotAddMessage(text, 'user');
  input.value = '';
  copilotProcessText(text);
}

function copilotProcessText(text) {
  var q = text.toLowerCase();
  if (q.includes('hotel') || q.includes('aloja') || q.includes('dormir') || q.includes('hostal')) {
    copilotActionHotel(); return;
  }
  if (q.includes('comer') || q.includes('restaurante') || q.includes('tapa') ||
      q.includes('hambre') || q.includes('comida') || q.includes('bar')) {
    copilotActionFood(); return;
  }
  if (q.includes('reduce') || q.includes('aligera') || q.includes('cansado') ||
      q.includes('mucho') || q.includes('menos parada') || q.includes('corta')) {
    copilotActionReduce(); return;
  }
  if (q.includes('lluv') || q.includes('plan b') || q.includes('llueve') || q.includes('mojado')) {
    copilotActionRain(); return;
  }
  // Texto libre → SALMA API
  copilotSendToSalma(text);
}

function copilotSendToSalma(text) {
  var dest     = window._copilot.destination;
  var pois     = window._copilot.pois;
  var dayCount = {};
  pois.forEach(function(p) { var d = p.day || 1; dayCount[d] = (dayCount[d] || 0) + 1; });

  var routeCtx = 'El usuario está viajando' + (dest ? ' por ' + dest : '') +
    ' con una ruta de ' + pois.length + ' paradas en ' + Object.keys(dayCount).length + ' días.' +
    ' Día actual del viaje: día ' + window._copilot.currentDay + '.' +
    ' Está usando el copiloto de SALMA en tiempo real, durante el viaje.';

  // Burbuja de espera
  var msgs    = document.getElementById('copilot-messages');
  var loadDiv = document.createElement('div');
  loadDiv.id        = 'copilot-loading-tmp';
  loadDiv.className = 'cplt-msg salma';
  loadDiv.textContent = '...';
  if (msgs) { msgs.appendChild(loadDiv); msgs.scrollTop = msgs.scrollHeight; }

  fetch(window.SALMA_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      messages: [{ role: 'user', content: routeCtx + '\n\nEl usuario dice: ' + text }],
      mode:     'copiloto'
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var el = document.getElementById('copilot-loading-tmp');
    if (el) el.remove();
    var reply = (data.reply || data.text || data.message || '').trim();
    copilotAddMessage(reply || 'Puedo ayudarte con hotel, comida, reducir la ruta o plan lluvia. ¿Qué necesitas?', 'salma');
  })
  .catch(function() {
    var el = document.getElementById('copilot-loading-tmp');
    if (el) el.remove();
    copilotAddMessage('No he podido conectar ahora mismo. Usa los botones rápidos de abajo.', 'salma');
  });
}
