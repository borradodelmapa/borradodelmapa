/* ============================================================
   SALMA — Motor de conversación inline
   Se muestra debajo del hero, a pantalla completa.
   ============================================================ */

window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
window.GOOGLE_STREETVIEW_KEY = 'AIzaSyCFklQ_zdpb0HEaU1rr8tz5gCdz97PtBxs';

// Avatar de Salma (base64)
const SALMA_AVATAR = '<img src="data:image/png;base64,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" width="36" height="36" style="border-radius:50%;">';

let salmaHistory = [];

// ===== GEOCODIFICACIÓN (fallback cuando la API no devuelve coordenadas) =====
var NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function salmaGeocode(query) {
  if (!query || typeof query !== 'string') return Promise.resolve(null);
  var q = query.trim();
  if (!q) return Promise.resolve(null);
  var params = new URLSearchParams({
    q: q,
    format: 'json',
    limit: '1',
    addressdetails: '0'
  });
  return fetch(NOMINATIM_URL + '?' + params.toString(), {
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'es',
      'User-Agent': 'BorradodelmapaSalma/1.0 (viaje con IA; https://borradodelmapa.com)'
    }
  })
    .then(function(res) { return res.json(); })
    .then(function(arr) {
      if (Array.isArray(arr) && arr.length > 0 && arr[0].lat != null && arr[0].lon != null) {
        return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
      }
      return null;
    })
    .catch(function() { return null; });
}

function delay(ms) {
  return new Promise(function(r) { setTimeout(r, ms); });
}

// Enriquecer una ruta: geocodificar paradas que no tengan lat/lng (Nominatim 1 req/s)
function salmaEnrichRouteWithCoords(route) {
  if (!route || !route.stops || !route.stops.length) return Promise.resolve(route);
  var country = (route.country || route.region || '').toString().trim();
  var suffix = country ? ', ' + country : '';
  var stops = route.stops.slice();
  var coordsByIndex = [];
  var chain = Promise.resolve();
  stops.forEach(function(stop, i) {
    var lat = stop.lat != null ? Number(stop.lat) : NaN;
    var lng = stop.lng != null ? Number(stop.lng) : NaN;
    var hasCoord = lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    if (hasCoord) {
      coordsByIndex[i] = { lat: lat, lng: lng };
      return;
    }
    var name = (stop.headline || stop.name || stop.title || '').toString().trim();
    if (!name) {
      coordsByIndex[i] = { lat: 0, lng: 0 };
      return;
    }
    chain = chain
      .then(function() { return delay(1100); })
      .then(function() { return salmaGeocode(name + suffix); })
      .then(function(coord) {
        coordsByIndex[i] = coord ? { lat: coord.lat, lng: coord.lng } : { lat: 0, lng: 0 };
      });
  });
  return chain.then(function() {
    var enriched = {
      title: route.title, name: route.name, country: route.country, region: route.region,
      duration_days: route.duration_days, summary: route.summary, stops: [],
      tips: route.tips || [], tags: route.tags || [], budget_level: route.budget_level, suggestions: route.suggestions || []
    };
    stops.forEach(function(stop, i) {
      var c = coordsByIndex[i] || { lat: 0, lng: 0 };
      enriched.stops.push(Object.assign({}, stop, { lat: c.lat, lng: c.lng }));
    });
    return enriched;
  });
}

// Si la API dice que no tiene coordenadas/información pero el usuario pidió un lugar, crear ruta mínima geocodificada
function salmaTryMinimalRouteFromReply(userMessage, replyText) {
  var lower = (replyText || '').toLowerCase();
  var sinCoords = lower.indexOf('coordenada') !== -1 || lower.indexOf('no tengo') !== -1 ||
    lower.indexOf('no dispongo') !== -1 || lower.indexOf('no tiene') !== -1 ||
    lower.indexOf('no hay') !== -1 || lower.indexOf('sin coordenada') !== -1 ||
    lower.indexOf('no puedo ubicar') !== -1 || lower.indexOf('no encuentro') !== -1 ||
    lower.indexOf('no tengo información') !== -1 || lower.indexOf('no tiene información') !== -1 ||
    lower.indexOf('no tengo informacion') !== -1 || lower.indexOf('no tiene informacion') !== -1 ||
    lower.indexOf('no dispongo de información') !== -1 || lower.indexOf('sin información sobre') !== -1 ||
    lower.indexOf('sin informacion sobre') !== -1 || lower.indexOf('no tengo información sobre') !== -1 ||
    lower.indexOf('no tiene información sobre') !== -1 || lower.indexOf('no tengo informacion sobre') !== -1 ||
    lower.indexOf('no tiene informacion sobre') !== -1;
  if (!sinCoords) return Promise.resolve(null);
  var place = (userMessage || '').trim().replace(/^(ruta|viaje|qué ver|que ver|dame|quiero)\s*(por|en|a|para)?\s*/i, '').trim();
  var m = place.match(/^([^,.\d]+)/);
  if (m) place = m[1].trim();
  if (!place || place.length < 2) return Promise.resolve(null);

  function buildMinimal(coord, title) {
    if (!coord) return null;
    return {
      title: title || place,
      name: title || place,
      country: 'España',
      region: '',
      duration_days: 0,
      summary: 'Ruta creada a partir de tu búsqueda. Pide más detalles a Salma para ampliarla.',
      stops: [{ name: title || place, headline: title || place, lat: coord.lat, lng: coord.lng, type: 'other', day: 1 }],
      tips: [],
      tags: [],
      budget_level: 'sin_definir',
      suggestions: []
    };
  }

  return salmaGeocode(place + ', España')
    .then(function(coord) {
      if (coord) return buildMinimal(coord, place);
      return delay(1100).then(function() { return salmaGeocode(place); }).then(function(c) { return c ? buildMinimal(c, place) : null; });
    })
    .then(function(result) {
      if (result) return result;
      var sinAcento = place.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
      if (sinAcento === place) return null;
      return delay(1100).then(function() { return salmaGeocode(sinAcento + ', Spain'); }).then(function(c) { return c ? buildMinimal(c, place) : null; });
    });
}

// ===== FUNCIONES DE UI INLINE =====

function salmaShowInline() {
  var section = document.getElementById('salma-inline');
  if (section) section.style.display = 'block';
}

// En el chat solo mostramos 1–2 frases; el detalle va en la ruta de abajo
function salmaShortenReplyForChat(text) {
  if (!text || typeof text !== 'string') return text;
  var t = text.trim();
  if (t.length <= 180) return t;
  var firstPara = t.split(/\n\n+/)[0].trim();
  var sentences = (firstPara || t).match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length >= 1) {
    var breve = sentences.length >= 2 ? (sentences[0] + ' ' + sentences[1]).trim() : sentences[0].trim();
    return breve.length > 220 ? breve.slice(0, 220).trim() + '…' : breve;
  }
  var cut = (firstPara || t).slice(0, 200).trim();
  return (cut + (cut.length >= 200 ? '…' : ''));
}

function salmaAddDialog(text, who) {
  var dialog = document.getElementById('salma-dialog');
  if (!dialog) return;

  var div = document.createElement('div');

  if (who === 'bot') {
    var displayText = salmaShortenReplyForChat(text);
    div.style.cssText = 'display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;';
    div.innerHTML = '<div style="flex-shrink:0;width:40px;height:40px;border-radius:50%;border:1.5px solid #d4a017;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1816;">' + SALMA_AVATAR + '</div>' +
      '<div style="flex:1;background:#111;border:1px solid rgba(212,160,23,.18);border-radius:18px;padding:16px 20px;font-size:15px;color:#f5f0e8;line-height:1.7;">' + escapeHTML(displayText) + '</div>';
  } else if (who === 'user') {
    div.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:16px;';
    div.innerHTML = '<div style="background:#d4a017;color:#0a0908;border-radius:18px;padding:14px 20px;font-size:15px;font-weight:600;max-width:80%;line-height:1.5;">' + escapeHTML(text) + '</div>';
  } else if (who === 'loading') {
    var LOADING_PHRASES = [
      'Recopilando información de la ruta...',
      'Buscando rutas alternativas...',
      'Ahorrando horas a tu compañero de viaje...',
      'Habla conmigo como si fuera un colega...',
      'Luego puedes editar la ruta conmigo...',
      'Soy experta en viajes, te acompaño durante el viaje...',
      'Buscando los mejores sitios locales...',
      'Calculando la mejor combinación de días...'
    ];
    div.id = 'salma-loading-msg';
    div.style.cssText = 'display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;';
    div.innerHTML = '<div style="flex-shrink:0;width:40px;height:40px;border-radius:50%;border:1.5px solid #d4a017;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1816;">' + SALMA_AVATAR + '</div>' +
      '<div style="flex:1;padding:16px 20px;">' +
        '<div id="salma-loading-phrase" style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:#d4a017;letter-spacing:.12em;margin-bottom:8px;">' + LOADING_PHRASES[0] + '</div>' +
        '<div style="display:flex;gap:6px;">' +
          '<div style="width:8px;height:8px;background:#d4a017;border-radius:50%;animation:salmaDot 1.2s infinite;"></div>' +
          '<div style="width:8px;height:8px;background:#d4a017;border-radius:50%;animation:salmaDot 1.2s infinite .2s;"></div>' +
          '<div style="width:8px;height:8px;background:#d4a017;border-radius:50%;animation:salmaDot 1.2s infinite .4s;"></div>' +
        '</div>' +
      '</div>';
    var phraseIdx = 0;
    window._salmaLoadingInterval = setInterval(function() {
      phraseIdx = (phraseIdx + 1) % LOADING_PHRASES.length;
      var el = document.getElementById('salma-loading-phrase');
      if (el) el.textContent = LOADING_PHRASES[phraseIdx];
    }, 2500);
  }

  dialog.appendChild(div);
}

function salmaRemoveLoading() {
  if (window._salmaLoadingInterval) {
    clearInterval(window._salmaLoadingInterval);
    window._salmaLoadingInterval = null;
  }
  var el = document.getElementById('salma-loading-msg');
  if (el) el.remove();
}

function salmaShowInput() {
  var wrap = document.getElementById('salma-inline-input-wrap');
  if (wrap) {
    wrap.style.display = 'block';
    var input = document.getElementById('salma-inline-input');
    if (input) input.focus();
  }
}

function salmaHideInput() {
  var wrap = document.getElementById('salma-inline-input-wrap');
  if (wrap) wrap.style.display = 'none';
}

function escapeHTML(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Fusionar ruta nueva con la existente: al pedir "añade otro lugar" se añade a la ruta actual, no se crea una nueva
function salmaMergeRoute(existing, incoming) {
  if (!existing || !incoming) return incoming || existing;
  var merged = {};
  var keys = ['country', 'region', 'duration_days', 'summary', 'tips', 'tags', 'budget_level', 'suggestions'];
  keys.forEach(function(k) {
    if (incoming[k] !== undefined && incoming[k] !== null) merged[k] = incoming[k];
    else if (existing[k] !== undefined && existing[k] !== null) merged[k] = existing[k];
  });
  var incTitle = (incoming.title || incoming.name || '').toString().trim();
  var extTitle = (existing.title || existing.name || '').toString().trim();
  merged.title = incTitle || extTitle || 'Mi ruta';
  merged.name = merged.title;

  var existingStops = existing.stops && Array.isArray(existing.stops) ? existing.stops : [];
  var incomingStops = incoming.stops && Array.isArray(incoming.stops) ? incoming.stops : [];
  if (incomingStops.length === 0) {
    merged.stops = existingStops.slice();
  } else if (existingStops.length === 0) {
    merged.stops = incomingStops.slice();
  } else if (incomingStops.length >= existingStops.length) {
    merged.stops = incomingStops.slice();
  } else {
    merged.stops = existingStops.slice();
    var names = {};
    existingStops.forEach(function(s) { var n = (s.headline || s.name || s.title || '').toString().trim(); if (n) names[n] = true; });
    incomingStops.forEach(function(s) {
      var n = (s.headline || s.name || s.title || '').toString().trim();
      if (n && !names[n]) { merged.stops.push(s); names[n] = true; }
    });
  }
  return merged;
}

// ===== RENDERIZAR RUTA A PANTALLA COMPLETA =====
function salmaRenderRoute(routeData) {
  var result = document.getElementById('salma-route-result');
  if (!result || !routeData || !routeData.stops) return;

  var typeIcons = {city:'🏙',town:'🏘',nature:'🌿',beach:'🏖',mountain:'⛰',temple:'🛕',viewpoint:'📸',route:'🛤',activity:'🎯',other:'📍'};
  var pois = routeData.stops;
  var hasMapData = pois.some(function(p) { return p.lat && p.lng; });

  var countryOrRegion = (routeData.country || routeData.region || '').toString().trim();
  // Google Maps: usar nombres de lugar para enlaces más precisos
  var gmapsUrl = '';
  if (hasMapData) {
    var gmapsPois = pois.filter(function(p) { return p.lat && p.lng; });
    if (gmapsPois.length >= 2) {
      var name0 = (gmapsPois[0].headline || gmapsPois[0].name || '').toString().trim();
      var nameLast = (gmapsPois[gmapsPois.length - 1].headline || gmapsPois[gmapsPois.length - 1].name || '').toString().trim();
      var origin = (name0 && countryOrRegion) ? encodeURIComponent(name0 + ' ' + countryOrRegion) : (gmapsPois[0].lat + ',' + gmapsPois[0].lng);
      var dest = (nameLast && countryOrRegion) ? encodeURIComponent(nameLast + ' ' + countryOrRegion) : (gmapsPois[gmapsPois.length - 1].lat + ',' + gmapsPois[gmapsPois.length - 1].lng);
      var waypoints = gmapsPois.slice(1, -1).map(function(p) {
        var n = (p.headline || p.name || '').toString().trim();
        return n && countryOrRegion ? encodeURIComponent(n + ' ' + countryOrRegion) : (p.lat + ',' + p.lng);
      }).join('|');
      gmapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + origin + '&destination=' + dest + (waypoints ? '&waypoints=' + waypoints : '') + '&travelmode=driving';
    } else {
      var n0 = (gmapsPois[0].headline || gmapsPois[0].name || '').toString().trim();
      gmapsUrl = (n0 && countryOrRegion) ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(n0 + ' ' + countryOrRegion)) : ('https://www.google.com/maps?q=' + gmapsPois[0].lat + ',' + gmapsPois[0].lng);
    }
  }

  // Tags
  var tagsHTML = '';
  if (routeData.tags && routeData.tags.length > 0) {
    tagsHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px;">' +
      routeData.tags.map(function(t) { return '<span style="font-family:\'JetBrains Mono\',monospace;font-size:9px;padding:5px 12px;border:1px solid rgba(212,160,23,.25);border-radius:999px;color:var(--dorado);">' + escapeHTML(t) + '</span>'; }).join('') + '</div>';
  }

  // Stops — acordeón por días
  var dayGroups = {};
  var dayOrder = [];
  pois.forEach(function(stop) {
    var d = stop.day || 1;
    if (!dayGroups[d]) { dayGroups[d] = []; dayOrder.push(d); }
    dayGroups[d].push(stop);
  });
  dayOrder.sort(function(a, b) { return a - b; });

  var stopsHTML = '';
  var allStopIdx = 0;

  dayOrder.forEach(function(dayNum) {
    var dayStops = dayGroups[dayNum];
    var dayTitle = '';
    for (var di = 0; di < dayStops.length; di++) {
      if (dayStops[di].day_title) { dayTitle = dayStops[di].day_title; break; }
    }
    var dayContentId = 'salma-day-content-' + dayNum;
    var dayArrowId = 'salma-day-arrow-' + dayNum;

    // Google Maps para este día
    var dayPois = dayStops.filter(function(s) { return s.lat && s.lng && Number(s.lat) && Number(s.lng); });
    var dayGmapsUrl = '';
    if (dayPois.length >= 2) {
      var dn0 = (dayPois[0].headline || dayPois[0].name || '').toString().trim();
      var dnLast = (dayPois[dayPois.length - 1].headline || dayPois[dayPois.length - 1].name || '').toString().trim();
      var dOrigin = (dn0 && countryOrRegion) ? encodeURIComponent(dn0 + ' ' + countryOrRegion) : (dayPois[0].lat + ',' + dayPois[0].lng);
      var dDest = (dnLast && countryOrRegion) ? encodeURIComponent(dnLast + ' ' + countryOrRegion) : (dayPois[dayPois.length - 1].lat + ',' + dayPois[dayPois.length - 1].lng);
      var dWp = dayPois.slice(1, -1).map(function(p) {
        var n = (p.headline || p.name || '').toString().trim();
        return n && countryOrRegion ? encodeURIComponent(n + ' ' + countryOrRegion) : (p.lat + ',' + p.lng);
      }).join('|');
      dayGmapsUrl = 'https://www.google.com/maps/dir/?api=1&origin=' + dOrigin + '&destination=' + dDest + (dWp ? '&waypoints=' + dWp : '') + '&travelmode=driving';
    } else if (dayPois.length === 1) {
      var dn = (dayPois[0].headline || dayPois[0].name || '').toString().trim();
      dayGmapsUrl = (dn && countryOrRegion) ? ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(dn + ' ' + countryOrRegion)) : ('https://www.google.com/maps?q=' + dayPois[0].lat + ',' + dayPois[0].lng);
    }

    // Paradas del día
    var dayStopsHTML = '';
    dayStops.forEach(function(stop) {
      var idx = allStopIdx++;
      var icon = typeIcons[stop.type] || '📍';
      var headline = stop.headline || stop.name || '';
      var mapsUrl = '';
      if (headline && countryOrRegion) {
        mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(headline + ' ' + countryOrRegion);
      } else if (stop.lat && stop.lng) {
        mapsUrl = 'https://www.google.com/maps?q=' + stop.lat + ',' + stop.lng;
      }
      var narrative = stop.narrative || stop.description || '';
      var secret = stop.local_secret || '';
      var alt = stop.alternative || '';
      var practical = stop.practical || '';
      var context = stop.context || '';
      var food_nearby = stop.food_nearby || '';
      var links = (stop.links && Array.isArray(stop.links)) ? stop.links.filter(function(l) { return l && l.label && l.url; }) : [];
      var hasDetails = narrative || secret || alt || practical || context || food_nearby || links.length > 0;
      var stopId = 'salma-stop-' + idx;

      var linksHTML = '';
      if (links.length > 0) {
        linksHTML = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;">' +
          links.map(function(l) {
            return '<a href="' + escapeHTML(l.url) + '" target="_blank" rel="noopener noreferrer" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;border:1px solid rgba(212,160,23,.3);padding:6px 12px;border-radius:999px;letter-spacing:.08em;" onmouseover="this.style.background=\'rgba(212,160,23,.1)\'" onmouseout="this.style.background=\'transparent\'">' + escapeHTML(l.label) + ' ↗</a>';
          }).join('') +
        '</div>';
      }

      dayStopsHTML += '<div style="border-bottom:1px solid rgba(212,160,23,.08);">' +
        '<div onclick="salmaToggleStop(\'' + stopId + '\')" style="display:flex;align-items:center;gap:10px;padding:16px 0;cursor:pointer;transition:background .15s;" onmouseover="this.style.background=\'rgba(255,255,255,.02)\'" onmouseout="this.style.background=\'none\'">' +
          '<div style="flex:1;">' +
            '<div style="font-family:\'Inter Tight\',sans-serif;font-size:18px;font-weight:700;color:#fff;line-height:1.2;">' +
              '<span style="font-size:16px;margin-right:6px;">' + icon + '</span>' + escapeHTML(headline) +
            '</div>' +
          '</div>' +
          (hasDetails ? '<div style="flex-shrink:0;font-size:12px;color:var(--dorado);" id="' + stopId + '-arrow">▾</div>' : '') +
        '</div>' +
        (hasDetails ? '<div id="' + stopId + '" style="display:none;padding:0 0 16px 8px;">' +
          '<div id="salma-stop-img-' + idx + '"></div>' +
          (narrative ? '<div style="font-size:15px;color:rgba(245,240,232,.8);line-height:1.75;margin-bottom:16px;">' + escapeHTML(narrative) + '</div>' : '') +
          (context ? '<div style="background:rgba(100,140,255,.05);border-left:3px solid rgba(100,140,255,.4);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(100,180,255,.8);letter-spacing:.14em;margin-bottom:6px;">📖 CONTEXTO</div>' +
            '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + escapeHTML(context) + '</div>' +
          '</div>' : '') +
          (food_nearby ? '<div style="background:rgba(255,140,50,.05);border-left:3px solid rgba(255,140,50,.35);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(255,160,80,.85);letter-spacing:.14em;margin-bottom:6px;">🍜 COME CERCA</div>' +
            '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + escapeHTML(food_nearby) + '</div>' +
          '</div>' : '') +
          (secret ? '<div style="background:rgba(212,160,23,.06);border-left:3px solid var(--dorado);padding:12px 16px;margin-bottom:12px;border-radius:0 12px 12px 0;">' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.14em;margin-bottom:6px;">🔑 SECRETO LOCAL</div>' +
            '<div style="font-size:14px;color:rgba(245,240,232,.75);line-height:1.6;">' + escapeHTML(secret) + '</div>' +
          '</div>' : '') +
          (alt ? '<div style="padding:10px 0;margin-bottom:12px;">' +
            '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:rgba(245,240,232,.4);letter-spacing:.12em;margin-bottom:4px;">↗ ALTERNATIVA</div>' +
            '<div style="font-size:14px;color:rgba(245,240,232,.6);line-height:1.6;">' + escapeHTML(alt) + '</div>' +
          '</div>' : '') +
          (practical ? '<div style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:rgba(245,240,232,.55);line-height:1.8;padding:10px 14px;background:rgba(255,255,255,.02);border-radius:10px;margin-bottom:12px;">📋 ' + escapeHTML(practical) + '</div>' : '') +
          linksHTML +
          (mapsUrl ? '<a href="' + mapsUrl + '" target="_blank" rel="noopener" style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;' + (links.length > 0 ? 'display:inline-block;margin-top:10px;' : '') + '">VER EN MAPA →</a>' : '') +
        '</div>' : '') +
      '</div>';
    });

    // Bloque de día con acordeón
    stopsHTML +=
      '<div style="border:1px solid rgba(212,160,23,.15);border-radius:14px;margin-bottom:10px;overflow:hidden;">' +
        '<div onclick="salmaToggleDay(\'' + dayContentId + '\',\'' + dayArrowId + '\')" style="display:flex;align-items:center;gap:10px;padding:14px 18px;cursor:pointer;background:rgba(212,160,23,.04);transition:background .15s;" onmouseover="this.style.background=\'rgba(212,160,23,.09)\'" onmouseout="this.style.background=\'rgba(212,160,23,.04)\'">' +
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;white-space:nowrap;">DÍA ' + dayNum + '</div>' +
          (dayTitle ? '<div style="font-size:13px;color:rgba(245,240,232,.75);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">· ' + escapeHTML(dayTitle) + '</div>' : '') +
          '<div style="flex:1;"></div>' +
          '<div style="font-size:10px;color:rgba(212,160,23,.55);font-family:\'JetBrains Mono\',monospace;">' + dayStops.length + ' paradas</div>' +
          '<div id="' + dayArrowId + '" style="font-size:12px;color:var(--dorado);margin-left:8px;">▾</div>' +
        '</div>' +
        '<div id="' + dayContentId + '" style="display:none;">' +
          (dayGmapsUrl ?
            '<div style="padding:12px 16px 0;">' +
              '<a href="' + dayGmapsUrl + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.2);border-radius:10px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;transition:background .15s;" onmouseover="this.style.background=\'rgba(212,160,23,.14)\'" onmouseout="this.style.background=\'rgba(212,160,23,.07)\'">' +
                '🗺 NAVEGAR DÍA ' + dayNum + ' EN GOOGLE MAPS →' +
              '</a>' +
            '</div>'
            : '') +
          '<div style="padding:0 16px 8px;">' + dayStopsHTML + '</div>' +
        '</div>' +
      '</div>';
  });

  // Tips
  var tipsHTML = '';
  if (routeData.tips && routeData.tips.length > 0) {
    tipsHTML = '<div style="margin-top:28px;padding:24px;background:rgba(255,255,255,.02);border:1px solid rgba(212,160,23,.12);border-radius:18px;">' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:12px;">CONSEJOS DE SALMA</div>' +
      routeData.tips.map(function(tip) { return '<div style="font-size:14px;color:rgba(245,240,232,.7);line-height:1.7;margin-bottom:8px;">• ' + escapeHTML(tip) + '</div>'; }).join('') +
    '</div>';
  }

  var budget = routeData.budget_level && routeData.budget_level !== 'sin_definir' ? ' · ' + routeData.budget_level.toUpperCase() : '';

  result.style.display = 'block';
  var heroEl = document.querySelector('.hero');
  if (heroEl) heroEl.classList.add('hero-has-route');
  // Orden: primero la ruta (texto e itinerario), al final el mapa debajo
  result.innerHTML =
    // Header
    '<div style="font-family:\'Inter Tight\',sans-serif;font-size:32px;font-weight:700;color:#fff;line-height:1.1;letter-spacing:-.02em;margin-bottom:8px;">' + escapeHTML(routeData.title || 'Tu ruta') + '</div>' +
    '<div style="font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);letter-spacing:.14em;margin-bottom:16px;">' + (routeData.duration_days || 0) + ' DÍAS · ' + escapeHTML((routeData.country || '').toUpperCase()) + budget + ' · ' + pois.length + ' PARADAS</div>' +
    (routeData.summary ? '<div style="font-size:16px;color:rgba(245,240,232,.8);line-height:1.7;margin-bottom:20px;">' + escapeHTML(routeData.summary) + '</div>' : '') +
    tagsHTML +
    // Botón Google Maps general (fix: antes estaba calculado pero nunca renderizado)
    (gmapsUrl ? '<a href="' + gmapsUrl + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px;padding:14px 16px;background:rgba(212,160,23,.07);border:1px solid rgba(212,160,23,.2);border-radius:12px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--dorado);text-decoration:none;letter-spacing:.1em;transition:background .15s;" onmouseover="this.style.background=\'rgba(212,160,23,.14)\'" onmouseout="this.style.background=\'rgba(212,160,23,.07)\'">🗺 VER RUTA COMPLETA EN GOOGLE MAPS →</a>' : '') +
    // Mapa Leaflet
    (hasMapData ? '<div id="salma-route-map" style="height:260px;width:100%;border-radius:14px;margin-bottom:24px;border:1px solid rgba(212,160,23,.15);overflow:hidden;"></div>' : '') +
    // Stops (itinerario primero)
    '<div style="font-family:\'JetBrains Mono\',monospace;font-size:9px;color:var(--dorado);letter-spacing:.18em;margin-bottom:12px;">ITINERARIO · ' + pois.length + ' EXPERIENCIAS</div>' +
    stopsHTML +
    tipsHTML +
    // Botones principales
    '<div style="display:flex;gap:12px;margin-top:28px;margin-bottom:24px;flex-wrap:wrap;">' +
      '<button id="salma-btn-guardar-ruta" onclick="salmaGuardarRuta()" style="flex:2;min-width:140px;background:var(--dorado);border:none;border-radius:14px;color:#0a0908;padding:16px;font-family:\'JetBrains Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.12em;cursor:pointer;transition:background .2s;" onmouseover="if(!this.disabled)this.style.background=\'#e0b84a\'" onmouseout="this.style.background=\'#d4a017\'">GUARDAR MI RUTA</button>' +
      '<button onclick="salmaReset()" style="flex:1;min-width:100px;background:transparent;border:1px solid rgba(212,160,23,.1);border-radius:14px;color:rgba(245,240,232,.5);padding:16px;font-family:\'JetBrains Mono\',monospace;font-size:10px;cursor:pointer;letter-spacing:.12em;">NUEVA RUTA</button>' +
    '</div>' +
    '';

  window._salmaLastRoute = routeData;

  // Inicializar mapa Leaflet tras renderizar el DOM
  if (hasMapData) {
    setTimeout(function() {
      var mapPois = pois.filter(function(p) { return p.lat && p.lng && Number(p.lat) && Number(p.lng); });
      if (mapPois.length && typeof window.salmaInitLeaflet === 'function') {
        window.salmaInitLeaflet('salma-route-map', mapPois, routeData);
      }
    }, 150);
  }
  // Imágenes reales Wikipedia (async, no bloquea el render)
  setTimeout(function() { salmaFetchWikipediaImages(pois, 'salma-stop'); }, 400);
}

// Toggle acordeón de parada individual
function salmaToggleStop(id) {
  var el = document.getElementById(id);
  var arrow = document.getElementById(id + '-arrow');
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = 'block';
    if (arrow) arrow.textContent = '▴';
  } else {
    el.style.display = 'none';
    if (arrow) arrow.textContent = '▾';
  }
}

// Toggle acordeón de día completo
function salmaToggleDay(contentId, arrowId) {
  var el = document.getElementById(contentId);
  var arrow = document.getElementById(arrowId);
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = 'block';
    if (arrow) arrow.textContent = '▴';
  } else {
    el.style.display = 'none';
    if (arrow) arrow.textContent = '▾';
  }
}

// Imágenes reales: Wikipedia EN → Wikipedia ES → Street View (lat/lng) → nada
function salmaFetchWikipediaImages(pois, prefix) {
  if (!pois || !pois.length) return;
  pois.forEach(function(stop, idx) {
    var name = (stop.headline || stop.name || '').toString().trim();
    var containerId = prefix + '-img-' + idx;
    var lat = stop.lat || null;
    var lng = stop.lng || null;

    // 1. Google Places Photos (mejor cobertura)
    var tryPlaces = (name && name.length >= 3)
      ? (function() {
          var pUrl = 'https://salma-api.paco-defoto.workers.dev/photo?name=' + encodeURIComponent(name) + (lat && lng ? '&lat=' + lat + '&lng=' + lng : '');
          return fetch(pUrl).then(function(r) {
            if (!r.ok) return Promise.reject();
            var ct = r.headers.get('Content-Type') || '';
            if (ct.indexOf('image') === -1) return Promise.reject();
            return pUrl;
          });
        })()
      : Promise.reject();

    // 2. Wikipedia EN
    var tryEN = tryPlaces.catch(function() {
      if (!name || name.length < 3) return Promise.reject();
      return fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(name), { headers: { 'Accept': 'application/json' } })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function(d) { return (d && d.thumbnail && d.thumbnail.source) ? d.thumbnail.source : Promise.reject(); });
    });

    // 3. Wikipedia ES
    var tryES = tryEN.catch(function() {
      if (!name || name.length < 3) return Promise.reject();
      return fetch('https://es.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(name), { headers: { 'Accept': 'application/json' } })
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function(d) { return (d && d.thumbnail && d.thumbnail.source) ? d.thumbnail.source : Promise.reject(); });
    });

    tryES.then(function(imgUrl) {
      var c = document.getElementById(containerId);
      if (c) c.innerHTML = '<img src="' + escapeHTML(imgUrl) + '" alt="' + escapeHTML(name) + '" style="width:100%;height:auto;border-radius:10px;margin-bottom:14px;display:block;" loading="lazy">';
    }).catch(function() {});
  });
}

// ===== ENVIAR DESDE EL HERO =====

async function salmaHeroSend() {
  var heroInput = document.getElementById('salma-hero-input');
  if (!heroInput) return;
  var msg = heroInput.value.trim();
  if (!msg) return;

  // Limpiar estado anterior
  var dialog = document.getElementById('salma-dialog');
  var routeResult = document.getElementById('salma-route-result');
  if (dialog) dialog.innerHTML = '';
  if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }

  // Mostrar sección inline
  salmaShowInline();

  // Deshabilitar botón
  var heroBtn = heroInput.nextElementSibling;
  if (heroBtn) { heroBtn.textContent = 'CREANDO RUTA...'; heroBtn.disabled = true; }

  // Mostrar mensaje del usuario + loading
  salmaAddDialog(msg, 'user');
  salmaAddDialog('', 'loading');
  

  // Reset historial
  salmaHistory = [];

  try {
    var res = await fetch(window.SALMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: [] })
    });
    var data = await res.json();
    salmaRemoveLoading();
    if (data._error) console.error('[SALMA WORKER ERROR]', data._error);

    if (data.reply) {
      salmaAddDialog(data.reply, 'bot');
      salmaHistory.push({ role: 'user', content: msg });
      salmaHistory.push({ role: 'assistant', content: data.reply });

      if (data.route && data.route.stops && data.route.stops.length > 0) {
        var hasAnyCoord = data.route.stops.some(function(s) { var a = s.lat, b = s.lng; return a != null && b != null && Number(a) && Number(b); });
        if (!hasAnyCoord) salmaAddDialog('Buscando coordenadas en el mapa…', 'loading');
        salmaEnrichRouteWithCoords(data.route).then(function(enriched) {
          salmaRemoveLoading();
          salmaRenderRoute(enriched);
        }).catch(function() { salmaRemoveLoading(); salmaRenderRoute(data.route); });
      } else {
        salmaAddDialog('Buscando en el mapa…', 'loading');
        salmaTryMinimalRouteFromReply(msg, data.reply).then(function(minimalRoute) {
          salmaRemoveLoading();
          if (minimalRoute) {
            salmaAddDialog('No tenía coordenadas, pero he ubicado "' + (minimalRoute.title || '') + '" en el mapa. Puedes guardar la ruta y pedirme más detalles.', 'bot');
            salmaRenderRoute(minimalRoute);
          } else {
            salmaAddDialog('No he podido ubicar ese lugar. Prueba con "Málaga, España" o el nombre en inglés.', 'bot');
          }
        }).catch(function() {
          salmaRemoveLoading();
          salmaAddDialog('No he podido ubicar ese lugar en el mapa. Inténtalo de nuevo.', 'bot');
        });
      }
    } else {
      salmaAddDialog('Uy, algo ha fallado. ¿Puedes intentarlo de nuevo?', 'bot');
    }
  } catch (err) {
    salmaRemoveLoading();
    salmaAddDialog('No puedo conectar ahora mismo. Inténtalo en un momento.', 'bot');
  }

  heroInput.value = '';
  if (heroBtn) { heroBtn.textContent = 'PLANEAR →'; heroBtn.disabled = false; }
}

// ===== RESPONDER A SALMA (diálogo inline) =====

async function salmaInlineReply() {
  var input = document.getElementById('salma-inline-input');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;

  salmaAddDialog(msg, 'user');
  input.value = '';
  salmaAddDialog('', 'loading');

  try {
    var body = { message: msg, history: salmaHistory };
    if (window._salmaLastRoute && window._salmaLastRoute.stops && window._salmaLastRoute.stops.length > 0) {
      body.current_route = window._salmaLastRoute;
    }
    var res = await fetch(window.SALMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var data = await res.json();
    salmaRemoveLoading();

    if (data.reply) {
      salmaAddDialog(data.reply, 'bot');
      salmaHistory.push({ role: 'user', content: msg });
      salmaHistory.push({ role: 'assistant', content: data.reply });
      if (salmaHistory.length > 20) salmaHistory = salmaHistory.slice(-20);

      if (data.route && data.route.stops && data.route.stops.length > 0) {
        var routeResult = document.getElementById('salma-route-result');
        if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }
        var baseRoute = window._salmaLastRoute ? salmaMergeRoute(window._salmaLastRoute, data.route) : data.route;
        var hasAnyCoord = baseRoute.stops && baseRoute.stops.some(function(s) { var a = s.lat, b = s.lng; return a != null && b != null && Number(a) && Number(b); });
        if (!hasAnyCoord) salmaAddDialog('Buscando coordenadas en el mapa…', 'loading');
        salmaEnrichRouteWithCoords(baseRoute).then(function(enriched) {
          salmaRemoveLoading();
          salmaRenderRoute(enriched);
          if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }).catch(function() {
          salmaRemoveLoading();
          salmaRenderRoute(baseRoute);
          if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        });
      } else {
        salmaAddDialog('Buscando en el mapa…', 'loading');
        salmaTryMinimalRouteFromReply(msg, data.reply).then(function(minimalRoute) {
          salmaRemoveLoading();
          if (minimalRoute) {
            var routeResult = document.getElementById('salma-route-result');
            if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }
            salmaAddDialog('He ubicado "' + (minimalRoute.title || '') + '" en el mapa. Puedes guardarla y pedirme más detalles.', 'bot');
            salmaRenderRoute(minimalRoute);
            if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
          } else {
            salmaAddDialog('No he podido ubicar ese lugar. Prueba con "Málaga, España" o más detalle.', 'bot');
          }
        }).catch(function() {
          salmaRemoveLoading();
          salmaAddDialog('No he podido ubicar ese lugar. Inténtalo de nuevo.', 'bot');
        });
      }
    } else {
      salmaAddDialog('No he entendido bien. ¿Puedes repetir?', 'bot');
    }
  } catch (err) {
    salmaRemoveLoading();
    salmaAddDialog('Error de conexión. Inténtalo de nuevo.', 'bot');
  }
}

// ===== GUARDAR RUTA =====

function salmaSetGuardarButtonState(guardando) {
  var btn = document.getElementById('salma-btn-guardar-ruta');
  if (!btn) return;
  btn.disabled = guardando;
  btn.textContent = guardando ? 'Guardando...' : 'GUARDAR MI RUTA';
  btn.style.opacity = guardando ? '0.8' : '1';
  btn.style.cursor = guardando ? 'wait' : 'pointer';
}

function salmaGuardarRuta() {
  console.log('[Salma] salmaGuardarRuta llamado. _salmaLastRoute:', window._salmaLastRoute ? 'OK (stops: ' + (window._salmaLastRoute.stops ? window._salmaLastRoute.stops.length : 0) + ')' : 'NULL');

  if (!window._salmaLastRoute) {
    if (typeof window.showToast === 'function') window.showToast('No hay ruta para guardar');
    return;
  }

  var firedb = window._fbDb || (window.firebase && window.firebase.firestore && window.firebase.firestore());
  var user = window._fbAuth ? window._fbAuth.currentUser : null;

  console.log('[Salma] user:', user ? user.uid : 'NULL', '| firedb:', firedb ? 'OK' : 'NULL');

  if (!user || !firedb) {
    if (typeof window.openModal === 'function') window.openModal('register');
    if (typeof window.showToast === 'function') window.showToast('Regístrate para guardar tu ruta');
    return;
  }

  salmaSetGuardarButtonState(true);
  if (typeof window.showToast === 'function') window.showToast('Guardando tu ruta...');

  var r = window._salmaLastRoute;
  var stops = r.stops || [];

  var destinoRuta = (r.region || r.country || r.destination || '').toString().trim();
  var notasRuta = (r.summary || '').toString().trim();

  // Mapear tipo a valores del proyecto técnico: lugar, hotel, restaurante, experiencia, mirador, ruta
  function mapTipoCanonico(t) {
    if (!t) return 'lugar';
    var s = String(t).toLowerCase();
    if (s.includes('hotel') || s === '🏨') return 'hotel';
    if (s.includes('restaurant') || s.includes('comida') || s === '🍜' || s === '🍴') return 'restaurante';
    if (s.includes('mirador') || s.includes('viewpoint') || s === '📸') return 'mirador';
    if (s.includes('ruta') || s === 'route' || s === '🛤') return 'ruta';
    if (s.includes('nature') || s.includes('beach') || s.includes('mountain') || s.includes('temple') || s.includes('activity') || /[🌿🏖⛰🛕🎯]/.test(t)) return 'experiencia';
    return 'lugar';
  }

  // Normalizar paradas y agrupar por día → estructura canónica dias[]
  var stopsNorm = stops.map(function(s, i) {
    var name = (s && (s.headline || s.name || s.title)) != null ? String(s.headline || s.name || s.title) : '';
    var desc = (s && (s.narrative || s.description)) != null ? String(s.narrative || s.description) : '';
    var day = (s && s.day) != null ? Number(s.day) : 1;
    var lat = (s && s.lat) != null ? Number(s.lat) : 0;
    var lng = (s && s.lng) != null ? Number(s.lng) : 0;
    return {
      id: 'p' + (i + 1), tipo: mapTipoCanonico(s && s.type), nombre: name, headline: name, descripcion: desc,
      narrative: (s && s.narrative) ? String(s.narrative) : desc,
      local_secret: (s && s.local_secret) ? String(s.local_secret) : '',
      alternative: (s && s.alternative) ? String(s.alternative) : '',
      practical: (s && s.practical) ? String(s.practical) : '',
      day_title: (s && s.day_title) ? String(s.day_title) : '',
      context: (s && s.context) ? String(s.context) : '',
      food_nearby: (s && s.food_nearby) ? String(s.food_nearby) : '',
      links: (s && Array.isArray(s.links)) ? s.links : [],
      duracion_min: 0, lat: lat, lng: lng, day: day, name: name, description: desc, type: s && s.type
    };
  });

  var diasByNum = {};
  stopsNorm.forEach(function(p) {
    var d = p.day || 1;
    if (!diasByNum[d]) diasByNum[d] = [];
    diasByNum[d].push(p);
  });
  var diasOrden = Object.keys(diasByNum).map(Number).sort(function(a, b) { return a - b; });
  var diasCanonico = diasOrden.map(function(diaNum) {
    var paradasDelDia = diasByNum[diaNum];
    var zona = (paradasDelDia[0] && paradasDelDia[0].nombre) ? paradasDelDia[0].nombre : ('Día ' + diaNum);
    var paradas = paradasDelDia.map(function(p) {
      return { id: p.id, tipo: p.tipo, nombre: p.nombre, descripcion: p.descripcion, duracion_min: p.duracion_min, lat: p.lat, lng: p.lng };
    });
    return { dia: diaNum, zona: zona, paradas: paradas };
  });
  // Título: nunca guardar "Mi ruta"; usar siempre un nombre concreto
  var tituloRuta = (r.title || r.name || r.route_name || '').toString().trim();
  if (tituloRuta.toLowerCase() === 'mi ruta') tituloRuta = '';
  if (!tituloRuta && r.country && r.duration_days) tituloRuta = (r.country + ' ' + r.duration_days + ' días').trim();
  if (!tituloRuta && stops.length > 0) {
    var firstStop = stops[0];
    tituloRuta = (firstStop && (firstStop.headline || firstStop.name || firstStop.title)) ? String(firstStop.headline || firstStop.name || firstStop.title).trim() : '';
  }
  if (!tituloRuta && destinoRuta) tituloRuta = destinoRuta + ' - Ruta';
  if (!tituloRuta && diasCanonico[0] && diasCanonico[0].zona) tituloRuta = diasCanonico[0].zona + ' - Ruta';
  if (!tituloRuta && stopsNorm.length > 0) tituloRuta = 'Ruta · ' + stopsNorm.length + ' paradas';
  if (!tituloRuta) tituloRuta = 'Ruta guardada';
  if (!tituloRuta || tituloRuta.length === 0 || tituloRuta.toLowerCase() === 'mi ruta') {
    tituloRuta = (destinoRuta && destinoRuta.length > 0) ? (destinoRuta + ' - Ruta') : 'Ruta guardada';
  }

  // itinerarioIA: JSON completo para verRuta (tips, tags, resumen) y compatibilidad
  var itinerarioCompleto = {
    title: tituloRuta,
    name: tituloRuta,
    country: (destinoRuta || r.country || '').toString(),
    region: (r.region || destinoRuta || '').toString(),
    duration_days: r.duration_days || diasOrden.length || 0,
    summary: (notasRuta || '').toString(),
    stops: stopsNorm.map(function(p) {
      return {
        id: (p.id || '').toString(),
        name: (p.nombre || '').toString(),
        headline: (p.headline || p.nombre || '').toString(),
        description: (p.descripcion || '').toString(),
        narrative: (p.narrative || '').toString(),
        local_secret: (p.local_secret || '').toString(),
        alternative: (p.alternative || '').toString(),
        practical: (p.practical || '').toString(),
        day_title: (p.day_title || '').toString(),
        context: (p.context || '').toString(),
        food_nearby: (p.food_nearby || '').toString(),
        links: Array.isArray(p.links) ? p.links : [],
        type: (p.tipo || 'lugar').toString(),
        day: typeof p.day === 'number' ? p.day : 1,
        lat: typeof p.lat === 'number' ? p.lat : 0,
        lng: typeof p.lng === 'number' ? p.lng : 0
      };
    }),
    tips: Array.isArray(r.tips) ? r.tips.map(function(t) { return (t || '').toString(); }) : [],
    tags: Array.isArray(r.tags) ? r.tags.map(function(t) { return (t || '').toString(); }) : [],
    budget_level: (r.budget_level || 'sin_definir').toString(),
    suggestions: Array.isArray(r.suggestions) ? r.suggestions.map(function(s) { return (s || '').toString(); }) : []
  };

  // Estructura Firestore: sin undefined (Firestore lo rechaza)
  var ruta = {
    titulo: tituloRuta,
    nombre: tituloRuta,
    destino: (destinoRuta || '').toString(),
    dias: diasCanonico,
    hotel_base: "",
    notas: (notasRuta || '').toString(),
    updated_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    published: false,
    itinerarioIA: JSON.stringify(itinerarioCompleto)
  };

  // Sanitizar dias/paradas por si algún campo viene undefined
  ruta.dias = (ruta.dias || []).map(function(d) {
    return {
      dia: typeof d.dia === 'number' ? d.dia : 1,
      zona: (d.zona || '').toString(),
      paradas: (d.paradas || []).map(function(p) {
        return {
          id: (p.id || '').toString(),
          tipo: (p.tipo || 'lugar').toString(),
          nombre: (p.nombre || '').toString(),
          descripcion: (p.descripcion || '').toString(),
          duracion_min: typeof p.duracion_min === 'number' ? p.duracion_min : 0,
          lat: typeof p.lat === 'number' ? p.lat : 0,
          lng: typeof p.lng === 'number' ? p.lng : 0
        };
      })
    };
  });

  try {
    var uid = (window._fbAuth && window._fbAuth.currentUser && window._fbAuth.currentUser.uid) ? window._fbAuth.currentUser.uid : user.uid;
    if (!uid) {
      salmaSetGuardarButtonState(false);
      if (typeof window.showToast === 'function') window.showToast('Sesión expirada. Vuelve a iniciar sesión.');
      return;
    }
    firedb.collection('users').doc(uid).collection('maps').add(ruta)
      .then(function(docRef) {
        // Incrementar contador global de rutas
        try {
          firedb.collection('stats').doc('global').set(
            { totalRoutes: firebase.firestore.FieldValue.increment(1) },
            { merge: true }
          ).then(function() {
            if (typeof window.loadGlobalStats === 'function') window.loadGlobalStats();
          }).catch(function() {});
        } catch(e) {}
        window._salmaLastRoute = null;
        if (typeof window.showToast === 'function') window.showToast('¡Ruta guardada! Redirigiendo a Mis rutas...');
        var loadMaps = typeof window.loadUserMaps === 'function' ? window.loadUserMaps() : Promise.resolve();
        var goDashboard = function() {
          if (typeof window.setDashTab === 'function') window.setDashTab('maps', null);
          if (typeof window.showPage === 'function') window.showPage('dashboard');
        };
        if (loadMaps && typeof loadMaps.then === 'function') {
          loadMaps.then(goDashboard).catch(goDashboard);
        } else {
          setTimeout(goDashboard, 600);
        }
      })
      .catch(function(e) {
        salmaSetGuardarButtonState(false);
        if (typeof window.showToast === 'function') window.showToast('Error al guardar: ' + (e && e.message ? e.message : 'Error desconocido'));
      });
  } catch (err) {
    salmaSetGuardarButtonState(false);
    if (typeof window.showToast === 'function') window.showToast('Error al guardar: ' + (err && err.message ? err.message : 'Error desconocido'));
  }
}

// ===== MAPA LEAFLET =====

function salmaInitLeaflet(containerId, pois, routeData) {
  if (typeof L === 'undefined') { console.warn('[Salma] Leaflet no está cargado'); return; }
  var container = document.getElementById(containerId);
  if (!container) { console.warn('[Salma] Contenedor de mapa no encontrado:', containerId); return; }
  // Destruir instancia previa si existe
  if (container._leafletMap) {
    try { container._leafletMap.remove(); } catch(e) {}
    container._leafletMap = null;
    container.innerHTML = '';
  }
  var validPois = (pois || []).filter(function(p) { return p.lat && p.lng && Number(p.lat) && Number(p.lng); });
  if (!validPois.length) return;
  var m = L.map(container, { zoomControl: true, scrollWheelZoom: false });
  container._leafletMap = m;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OSM</a>',
    maxZoom: 18
  }).addTo(m);
  var latlngs = [];
  validPois.forEach(function(p, i) {
    var ll = [Number(p.lat), Number(p.lng)];
    latlngs.push(ll);
    var nm = p.headline || p.name || ('Parada ' + (i + 1));
    var popup = '<b>' + nm.replace(/</g,'&lt;') + '</b>';
    var txt = (p.narrative || p.description || '');
    if (txt) popup += '<br><span style="font-size:12px;">' + txt.substring(0, 100).replace(/</g,'&lt;') + '</span>';
    L.marker(ll).addTo(m).bindPopup(popup);
  });
  if (latlngs.length > 1) {
    L.polyline(latlngs, { color: '#d4a017', weight: 2.5, opacity: 0.7, dashArray: '6,4' }).addTo(m);
    m.fitBounds(latlngs, { padding: [32, 32] });
  } else {
    m.setView(latlngs[0], 12);
  }
}
window.salmaInitLeaflet = salmaInitLeaflet;

// ===== RESET =====

function salmaReset() {
  var dialog = document.getElementById('salma-dialog');
  var routeResult = document.getElementById('salma-route-result');
  var section = document.getElementById('salma-inline');
  var heroEl = document.querySelector('.hero');
  if (heroEl) heroEl.classList.remove('hero-has-route');
  if (dialog) dialog.innerHTML = '';
  if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }
  if (section) section.style.display = 'none';
  
  salmaHistory = [];
  window._salmaLastRoute = null;
  // Enfocar el input del hero
  var heroInput = document.getElementById('salma-hero-input');
  if (heroInput) {
    heroInput.focus();
    heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ===== EDICIÓN DE RUTA =====

function salmaUseSuggestion(el) {
  var input = document.getElementById('salma-edit-input');
  if (input && el) {
    input.value = el.textContent;
    salmaEditFromBox();
  }
}

async function salmaEditFromBox() {
  var input = document.getElementById('salma-edit-input');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;

  // Deshabilitar input mientras procesa
  input.value = 'Salma está ajustando...';
  input.disabled = true;

  // Añadir al historial (sin scroll)
  salmaHistory.push({ role: 'user', content: msg });

  try {
    var body = { message: msg, history: salmaHistory };
    if (window._salmaLastRoute && window._salmaLastRoute.stops && window._salmaLastRoute.stops.length > 0) {
      body.current_route = window._salmaLastRoute;
    }
    var res = await fetch(window.SALMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    var data = await res.json();

    if (data.reply) {
      salmaHistory.push({ role: 'assistant', content: data.reply });
      if (salmaHistory.length > 20) salmaHistory = salmaHistory.slice(-20);

      if (data.route && data.route.stops && data.route.stops.length > 0) {
        var routeResult = document.getElementById('salma-route-result');
        if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }
        var baseRoute = window._salmaLastRoute ? salmaMergeRoute(window._salmaLastRoute, data.route) : data.route;
        salmaEnrichRouteWithCoords(baseRoute).then(function(enriched) {
          salmaRenderRoute(enriched);
          if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
        }).catch(function() {
          salmaRenderRoute(baseRoute);
          if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
        });
      } else {
        salmaAddDialog(data.reply, 'bot');
      }
    } else {
      input.value = '';
      input.placeholder = 'No he podido. Intenta de otra forma...';
    }
  } catch (err) {
    input.value = '';
    input.placeholder = 'Error de conexión. Inténtalo de nuevo.';
  }

  input.disabled = false;
  input.value = '';
  input.placeholder = 'Sugiere un cambio...';
}

async function salmaEditRoute() {
  salmaEditFromBox();
}

// ===== KEYBOARD =====

document.addEventListener('DOMContentLoaded', function() {
  var heroInput = document.getElementById('salma-hero-input');
  if (heroInput) {
    heroInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); salmaHeroSend(); }
    });
  }
  var inlineInput = document.getElementById('salma-inline-input');
  if (inlineInput) {
    inlineInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); salmaInlineReply(); }
    });
  }
  // Edit input keyboard — dentro de la ruta generada
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement && document.activeElement.id === 'salma-edit-input') {
      e.preventDefault();
      salmaEditFromBox();
    }
  });
});

// ===== INJECT CSS FOR LOADING ANIMATION =====
var salmaStyle = document.createElement('style');
salmaStyle.textContent = '@keyframes salmaDot{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.2)}}';
document.head.appendChild(salmaStyle);

// ===== EXPOSE TO GLOBAL =====
window.salmaHeroSend = salmaHeroSend;
window.salmaInlineReply = salmaInlineReply;
window.salmaGuardarRuta = salmaGuardarRuta;
window.salmaReset = salmaReset;
window.salmaRenderRoute = salmaRenderRoute;
window.salmaToggleStop = salmaToggleStop;
window.salmaToggleDay = salmaToggleDay;
window.salmaFetchWikipediaImages = salmaFetchWikipediaImages;
window.salmaUseSuggestion = salmaUseSuggestion;
window.salmaEditRoute = salmaEditRoute;
window.salmaEditFromBox = salmaEditFromBox;
