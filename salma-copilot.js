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

  // Re-renderizar acordeón para añadir botones ↑↓✕ desde el inicio
  setTimeout(function() { copilotRerenderAccordion(); }, 50);
}
window.copilotInit = copilotInit;

// ===== INJECT HTML & CSS =====

function copilotInjectHTML() {
  // --- CSS ---
  var style = document.createElement('style');
  style.textContent = [
    /* Botones de reordenar dentro del acordeón */
    '.cplt-stop-btn{',
      'background:transparent;border:1px solid rgba(212,160,23,.18);border-radius:6px;',
      'color:rgba(212,160,23,.7);font-size:11px;padding:3px 7px;cursor:pointer;line-height:1;',
      'font-family:monospace;transition:all .15s;',
    '}',
    '.cplt-stop-btn:hover{background:rgba(212,160,23,.12);color:#d4a017;border-color:rgba(212,160,23,.4);}',
    '.cplt-stop-btn.del{border-color:rgba(248,113,113,.2);color:rgba(248,113,113,.5);}',
    '.cplt-stop-btn.del:hover{background:rgba(248,113,113,.12);color:#f87171;border-color:#f87171;}',

    '#copilot-backdrop{',
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1500;display:none;',
    '}',

    '#copilot-panel{',
      'position:fixed;bottom:0;left:50%;transform:translateX(-50%);',
      'width:100%;max-width:620px;height:76vh;',
      'background:#111;',
      'border-radius:20px 20px 0 0;',
      'border-top:1px solid rgba(212,160,23,.3);',
      'border-left:1px solid rgba(212,160,23,.15);',
      'border-right:1px solid rgba(212,160,23,.15);',
      'display:none;flex-direction:column;z-index:1501;',
      'box-shadow:0 -12px 48px rgba(0,0,0,.55);',
    '}',

    '#copilot-head{',
      'padding:16px 20px;border-bottom:1px solid rgba(212,160,23,.12);',
      'display:flex;align-items:center;justify-content:space-between;flex-shrink:0;',
    '}',

    '#copilot-messages{',
      'flex:1;overflow-y:auto;padding:14px;min-height:0;',
      'display:flex;flex-direction:column;gap:12px;',
      'background:rgba(0,0,0,.2);',
    '}',

    '.cplt-msg{',
      'max-width:82%;padding:12px 15px;border-radius:16px;',
      'font-size:14px;line-height:1.55;word-break:break-word;',
    '}',
    '.cplt-msg.user  {background:rgba(212,160,23,.2);color:#f5f0e8;border-radius:16px 4px 16px 16px;}',
    '.cplt-msg.salma {background:rgba(255,255,255,.05);border:1px solid rgba(212,160,23,.18);color:#f5f0e8;border-radius:4px 16px 16px 16px;}',
    '.cplt-msg.system{background:transparent;border:1px dashed rgba(212,160,23,.2);',
      "color:rgba(245,240,232,.45);font-size:12px;font-family:'JetBrains Mono',monospace;border-radius:8px;}",

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
    '<div id="copilot-backdrop"></div>',

    '<div id="copilot-panel">',
      '<div id="copilot-head">',
        '<div style="display:flex;align-items:center;gap:12px;">',
          '<div id="copilot-head-avatar" style="width:44px;height:44px;border-radius:50%;border:2px solid #d4a017;overflow:hidden;flex-shrink:0;background:#1a1816;display:flex;align-items:center;justify-content:center;"></div>',
          '<div>',
            "<div style=\"font-family:'Inter Tight',sans-serif;font-size:16px;font-weight:700;color:#fff;\">SALMA</div>",
            "<div style=\"font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(212,160,23,.75);letter-spacing:.12em;margin-top:3px;\">COPILOTO &middot; EN RUTA</div>",
          '</div>',
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
  // Cargar avatar de Salma en el header
  var avatarEl = document.getElementById('copilot-head-avatar');
  if (avatarEl) {
    var src = window.SALMA_AVATAR_SRC || '';
    if (src) {
      avatarEl.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;object-position:center 25%;">';
    } else {
      avatarEl.textContent = 'S';
      avatarEl.style.color = '#d4a017';
      avatarEl.style.fontFamily = 'Bebas Neue,sans-serif';
      avatarEl.style.fontSize = '20px';
    }
  }

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

function copilotShowFloating() { /* SOS siempre visible en la nav */ }
function copilotHideFloating() { /* SOS siempre visible en la nav */ }

// Función global llamada desde el botón SOS de la nav móvil
function navSosSalma() {
  if (!window._copilot || !window._copilot.routeId) {
    if (typeof showToast === 'function') showToast('Abre una ruta para hablar con Salma ✈️');
    return;
  }
  copilotOpen();
  var msgs = document.getElementById('copilot-messages');
  if (msgs && !msgs.children.length) {
    copilotAddMessage('Estoy aquí. ¿Qué necesitas ahora mismo?', 'salma');
    setTimeout(function() {
      copilotAddMessage('Puedo buscar hotel, comida, aligerar el día o adaptar el plan si algo cambia.', 'salma');
    }, 300);
  }
}
window.navSosSalma = navSosSalma;

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

function copilotAvatarHTML() {
  var src = window.SALMA_AVATAR_SRC || '';
  if (src) return '<img src="' + src + '" style="width:32px;height:32px;border-radius:50%;border:1.5px solid #d4a017;object-fit:cover;object-position:center 25%;flex-shrink:0;">';
  return '<div style="width:32px;height:32px;border-radius:50%;border:1.5px solid #d4a017;background:#1a1816;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;color:#d4a017;font-family:Bebas Neue,sans-serif;">S</div>';
}

function copilotAddMessage(text, who) {
  var msgs = document.getElementById('copilot-messages');
  if (!msgs) return;
  var wrap = document.createElement('div');

  if (who === 'salma') {
    wrap.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
    wrap.innerHTML = copilotAvatarHTML() +
      '<div class="cplt-msg salma">' + (text || '').replace(/\n/g, '<br>') + '</div>';
  } else if (who === 'user') {
    wrap.style.cssText = 'display:flex;justify-content:flex-end;';
    wrap.innerHTML = '<div class="cplt-msg user">' + (text || '') + '</div>';
  } else {
    wrap.style.cssText = 'display:flex;justify-content:center;';
    wrap.innerHTML = '<div class="cplt-msg system">' + (text || '') + '</div>';
  }

  msgs.appendChild(wrap);
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

// ===== MOVER Y ELIMINAR PARADAS =====

function copilotMoveStop(globalIdx, direction) {
  var pois = window._copilot.pois;
  var stop = pois[globalIdx];
  if (!stop) return;
  var day = stop.day || 1;

  // Índices globales de paradas de ese día, en orden
  var dayIndices = [];
  for (var i = 0; i < pois.length; i++) {
    if ((pois[i].day || 1) === day) dayIndices.push(i);
  }
  var posInDay = dayIndices.indexOf(globalIdx);
  if (direction === 'up'   && posInDay === 0) return;
  if (direction === 'down' && posInDay === dayIndices.length - 1) return;

  var swapIdx = dayIndices[direction === 'up' ? posInDay - 1 : posInDay + 1];
  var temp = pois[globalIdx];
  pois[globalIdx] = pois[swapIdx];
  pois[swapIdx]   = temp;

  if (window._copilot.routeData) window._copilot.routeData.stops = pois;
  copilotRerenderAccordion();
  // Asegurar que el día del stop movido quede abierto
  var contentEl = document.getElementById('vr-day-content-' + day);
  var arrowEl   = document.getElementById('vr-day-arrow-'   + day);
  if (contentEl) contentEl.style.display = 'block';
  if (arrowEl)   arrowEl.textContent = '▴';
  copilotMarkDirty();
}
window.copilotMoveStop = copilotMoveStop;

function copilotDeleteStop(globalIdx) {
  var pois = window._copilot.pois;
  var stop = pois[globalIdx];
  if (!stop) return;
  var name = stop.headline || stop.name || 'esta parada';
  if (!confirm('¿Eliminar "' + name + '"?')) return;
  pois.splice(globalIdx, 1);
  if (window._copilot.routeData) window._copilot.routeData.stops = pois;
  copilotRerenderAccordion();
  copilotMarkDirty();
  copilotShowToast('"' + name + '" eliminada');
}
window.copilotDeleteStop = copilotDeleteStop;

// ===== RE-RENDER DEL ACORDEÓN =====
// Reconstruye solo el bloque de días/paradas sin recargar toda la ruta

function copilotRerenderAccordion() {
  var wrapper = document.getElementById('vr-stops-wrapper');
  if (!wrapper) return;

  // Guardar qué días están abiertos para restaurarlos tras el rerender
  var openDays = {};
  wrapper.querySelectorAll('[id^="vr-day-content-"]').forEach(function(el) {
    if (el.style.display !== 'none') {
      var dayNum = el.id.replace('vr-day-content-', '');
      openDays[dayNum] = true;
    }
  });

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

  // Mapa de índice global: stop → posición en pois[]
  var globalIndexMap = {};
  pois.forEach(function(s, i) { globalIndexMap[i] = i; });

  var stopIdx = 0;

  dayOrder.forEach(function(dayNum) {
    var dayStops = dayGroups[dayNum];
    var dayTitle = '';
    for (var di = 0; di < dayStops.length; di++) {
      if (dayStops[di].day_title) { dayTitle = dayStops[di].day_title; break; }
    }
    var contentId = 'vr-day-content-' + dayNum;
    var arrowId   = 'vr-day-arrow-'   + dayNum;

    // Índices globales de paradas de este día
    var dayGlobalIndices = [];
    for (var gi = 0; gi < pois.length; gi++) {
      if ((pois[gi].day || 1) === dayNum) dayGlobalIndices.push(gi);
    }

    var dayStopsHTML = '';
    dayStops.forEach(function(stop, posInDay) {
      var globalIdx = dayGlobalIndices[posInDay];
      var domIdx    = stopIdx++;
      var icon      = typeIcons[stop.type] || typeIcons[stop.tipo] || '📍';
      var rawName   = (stop.headline || stop.name || '');
      var headline  = rawName.replace(/</g, '&lt;');
      var narrative = (stop.narrative || stop.description || '').replace(/</g, '&lt;');
      var secret    = (stop.local_secret || '').replace(/</g, '&lt;');
      var practical = (stop.practical || '').replace(/</g, '&lt;');
      var stopId    = 'vr-stop-' + domIdx;
      var hasDetails = !!(narrative || secret || practical);
      var mapsUrl = rawName && dest
        ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(rawName + ' ' + dest)
        : (stop.lat && stop.lng ? 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng : '');

      var isFirst = posInDay === 0;
      var isLast  = posInDay === dayStops.length - 1;

      var ctrlBtns =
        '<div style="display:flex;gap:4px;flex-shrink:0;align-items:center;" onclick="event.stopPropagation()">' +
          '<button class="cplt-stop-btn" title="Subir" ' +
            (isFirst ? 'disabled style="opacity:.25;cursor:default;"' : '') +
            ' onclick="copilotMoveStop(' + globalIdx + ',\'up\')">↑</button>' +
          '<button class="cplt-stop-btn" title="Bajar" ' +
            (isLast  ? 'disabled style="opacity:.25;cursor:default;"' : '') +
            ' onclick="copilotMoveStop(' + globalIdx + ',\'down\')">↓</button>' +
          '<button class="cplt-stop-btn del" title="Eliminar" ' +
            ' onclick="copilotDeleteStop(' + globalIdx + ')">✕</button>' +
        '</div>';

      dayStopsHTML +=
        '<div style="border-bottom:1px solid rgba(212,160,23,.08);">' +
          '<div style="display:flex;align-items:center;gap:8px;padding:16px 0;">' +
            '<div onclick="salmaToggleStop(\'' + stopId + '\')" style="flex:1;cursor:pointer;">' +
              '<div style="font-family:\'Inter Tight\',sans-serif;font-size:18px;font-weight:700;color:#fff;line-height:1.2;">' +
                '<span style="font-size:16px;margin-right:6px;">' + icon + '</span>' + headline +
              '</div>' +
            '</div>' +
            ctrlBtns +
            (hasDetails ? '<div onclick="salmaToggleStop(\'' + stopId + '\')" style="flex-shrink:0;font-size:12px;color:var(--dorado);cursor:pointer;" id="' + stopId + '-arrow">▾</div>' : '') +
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

    // Enlace Google Maps por día (se regenera con el nuevo orden)
    var dayPois = dayStops.filter(function(s) { return s.lat && s.lng && Number(s.lat) && Number(s.lng); });
    var dayGmapsUrl = '';
    if (dayPois.length >= 2) {
      var dn0    = (dayPois[0].headline || dayPois[0].name || '').toString().trim();
      var dnLast = (dayPois[dayPois.length - 1].headline || dayPois[dayPois.length - 1].name || '').toString().trim();
      var dOrig  = (dn0    && dest) ? encodeURIComponent(dn0    + ' ' + dest) : (dayPois[0].lat + ',' + dayPois[0].lng);
      var dDest  = (dnLast && dest) ? encodeURIComponent(dnLast + ' ' + dest) : (dayPois[dayPois.length - 1].lat + ',' + dayPois[dayPois.length - 1].lng);
      var dWp    = dayPois.slice(1, -1).map(function(p) {
        var n = (p.headline || p.name || '').toString().trim();
        return (n && dest) ? encodeURIComponent(n + ' ' + dest) : (p.lat + ',' + p.lng);
      }).join('|');
      dayGmapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + dOrig + '&destination=' + dDest + (dWp ? '&waypoints=' + dWp : '') + '&travelmode=driving';
    } else if (dayPois.length === 1) {
      var dn = (dayPois[0].headline || dayPois[0].name || '').toString().trim();
      dayGmapsUrl = (dn && dest) ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(dn + ' ' + dest)) : ('https://www.google.com/maps?q=' + dayPois[0].lat + ',' + dayPois[0].lng);
    }

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
          (dayGmapsUrl ?
            '<div style="padding:12px 16px 0;">' +
              '<a href="' + dayGmapsUrl + '" target="_blank" rel="noopener" ' +
                'style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;' +
                'background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.2);border-radius:10px;' +
                'font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;" ' +
                'onmouseover="this.style.background=\'rgba(212,160,23,.14)\'" onmouseout="this.style.background=\'rgba(212,160,23,.07)\'">' +
                '🗺 NAVEGAR DÍA ' + dayNum + ' EN GOOGLE MAPS →' +
              '</a>' +
            '</div>'
          : '') +
          '<div style="padding:0 16px 8px;">' + dayStopsHTML + '</div>' +
        '</div>' +
      '</div>';
  });

  wrapper.innerHTML = html;

  // Restaurar días que estaban abiertos
  Object.keys(openDays).forEach(function(dayNum) {
    var contentEl = document.getElementById('vr-day-content-' + dayNum);
    var arrowEl   = document.getElementById('vr-day-arrow-'   + dayNum);
    if (contentEl) contentEl.style.display = 'block';
    if (arrowEl)   arrowEl.textContent = '▴';
  });

  // Actualizar enlace global de ruta completa
  var globalLink = document.getElementById('vr-gmaps-global');
  if (globalLink && pois.length >= 2) {
    var allPois = pois.filter(function(p) { return p.lat && p.lng && Number(p.lat) && Number(p.lng); });
    if (allPois.length >= 2) {
      var gN0    = (allPois[0].headline || allPois[0].name || '').toString().trim();
      var gNLast = (allPois[allPois.length - 1].headline || allPois[allPois.length - 1].name || '').toString().trim();
      var gOrig  = (gN0    && dest) ? encodeURIComponent(gN0    + ' ' + dest) : (allPois[0].lat + ',' + allPois[0].lng);
      var gDest2 = (gNLast && dest) ? encodeURIComponent(gNLast + ' ' + dest) : (allPois[allPois.length - 1].lat + ',' + allPois[allPois.length - 1].lng);
      var gWp    = allPois.slice(1, -1).map(function(p) {
        var n = (p.headline || p.name || '').toString().trim();
        return (n && dest) ? encodeURIComponent(n + ' ' + dest) : (p.lat + ',' + p.lng);
      }).join('|');
      globalLink.href = 'https://www.google.com/maps/dir/?api=1&origin=' + gOrig + '&destination=' + gDest2 + (gWp ? '&waypoints=' + gWp : '') + '&travelmode=driving';
    }
  }
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

  var routeCtx = 'Contexto del viaje: el usuario está viajando' + (dest ? ' por ' + dest : '') +
    ', ruta de ' + pois.length + ' paradas en ' + Object.keys(dayCount).length + ' días.' +
    ' Día actual: ' + window._copilot.currentDay + '. Modo copiloto en tiempo real.';

  var msgs = document.getElementById('copilot-messages');

  // Burbuja de streaming con avatar
  var loadWrap = document.createElement('div');
  loadWrap.id = 'copilot-loading-tmp';
  loadWrap.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
  loadWrap.innerHTML = copilotAvatarHTML() +
    '<div class="cplt-msg salma" id="copilot-stream-bubble">...</div>';
  if (msgs) { msgs.appendChild(loadWrap); msgs.scrollTop = msgs.scrollHeight; }

  fetch(window.SALMA_API, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      message: routeCtx + '\n\n' + text,
      stream:  true,
      mode:    'copiloto'
    })
  })
  .then(function(res) {
    var ct = (res.headers.get('content-type') || '');
    // Respuesta JSON directa (error o fallback del worker)
    if (ct.indexOf('application/json') !== -1) {
      return res.json().then(function(data) {
        var el = document.getElementById('copilot-loading-tmp');
        if (el) el.remove();
        var reply = (data.reply || data.text || data.message || '').trim();
        copilotAddMessage(reply || 'Puedo ayudarte con hotel, comida, reducir la ruta o plan lluvia.', 'salma');
      });
    }
    // SSE stream
    var bubbleEl = document.getElementById('copilot-stream-bubble');
    var reader   = res.body.getReader();
    var decoder  = new TextDecoder();
    var buffer   = '';
    var fullText = '';

    function pump() {
      reader.read().then(function(result) {
        if (result.done) {
          if (!fullText) {
            var el = document.getElementById('copilot-loading-tmp');
            if (el) el.remove();
            copilotAddMessage('No he recibido respuesta. Prueba de nuevo.', 'salma');
          }
          return;
        }
        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('data: ') !== 0) continue;
          var jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            var evt = JSON.parse(jsonStr);
            if (evt.done) {
              fullText = evt.reply || fullText;
              if (bubbleEl) bubbleEl.innerHTML = fullText.replace(/\n/g, '<br>');
              return;
            }
            if (evt.t) {
              fullText += evt.t;
              if (bubbleEl) {
                bubbleEl.innerHTML = fullText.replace(/\n/g, '<br>');
                if (msgs) msgs.scrollTop = msgs.scrollHeight;
              }
            }
          } catch(e) {}
        }
        pump();
      }).catch(function() {
        var el = document.getElementById('copilot-loading-tmp');
        if (el) el.remove();
        copilotAddMessage('No he podido conectar ahora mismo. Usa los botones rápidos de abajo.', 'salma');
      });
    }
    pump();
  })
  .catch(function() {
    var el = document.getElementById('copilot-loading-tmp');
    if (el) el.remove();
    copilotAddMessage('No he podido conectar ahora mismo. Usa los botones rápidos de abajo.', 'salma');
  });
}
