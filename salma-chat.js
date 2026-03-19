/* ============================================================
   SALMA — Motor de conversación inline
   Se muestra debajo del hero, a pantalla completa.
   ============================================================ */

window.SALMA_API = "https://salma-api.paco-defoto.workers.dev";
window.GOOGLE_STREETVIEW_KEY = 'AIzaSyCFklQ_zdpb0HEaU1rr8tz5gCdz97PtBxs';

// Avatar de Salma (base64)
const SALMA_AVATAR = '<img src="data:image/png;base64,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" style="width:140%;height:140%;margin:-20%;display:block;object-fit:cover;object-position:center 25%;">';
window.SALMA_AVATAR_SRC = (SALMA_AVATAR.match(/src="([^"]+)"/) || [])[1] || '';

let salmaHistory = [];

// ===== GEOCODIFICACIÓN =====
var NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

function salmaGeocode(query, viewbox) {
  if (!query || typeof query !== 'string') return Promise.resolve(null);
  var q = query.trim();
  if (!q) return Promise.resolve(null);
  var params = new URLSearchParams({
    q: q,
    format: 'json',
    limit: '1',
    addressdetails: '0'
  });
  // viewbox = "lng_min,lat_max,lng_max,lat_min" — Nominatim prefiere resultados dentro del área
  if (viewbox) {
    params.set('viewbox', viewbox);
    params.set('bounded', '0'); // prefer dentro del viewbox, no restringir
  }
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

// Determinar la ubicación central de la ruta (texto para geocodificar)
function salmaGetRouteLocationCtx(route) {
  var country = (route.country || '').trim().toLowerCase();
  var region = (route.region || '').trim();
  var title = (route.title || route.name || '').trim();
  var regionIsVague = !region || region.toLowerCase() === country;
  var ctx = regionIsVague ? (title || region) : region;
  // Fallback: usar ruta anterior si la actual no tiene contexto específico
  if ((!ctx || ctx.toLowerCase() === country) && window._salmaLastRoute) {
    var pr = (window._salmaLastRoute.region || '').trim();
    var pt = (window._salmaLastRoute.title || window._salmaLastRoute.name || '').trim();
    var pc = (window._salmaLastRoute.country || '').trim().toLowerCase();
    ctx = (pr && pr.toLowerCase() !== pc) ? pr : (pt || ctx);
  }
  return ctx;
}

// Enriquecer una ruta: geocodificar paradas usando viewbox geográfico centrado en la ubicación de la ruta
function salmaEnrichRouteWithCoords(route) {
  if (!route || !route.stops || !route.stops.length) return Promise.resolve(route);

  var locationCtx = salmaGetRouteLocationCtx(route);
  var suffix = locationCtx ? ', ' + locationCtx : '';

  // Paso 1: geocodificar la ubicación central de la ruta para obtener el viewbox
  var centerPromise = locationCtx ? salmaGeocode(locationCtx) : Promise.resolve(null);

  return centerPromise.then(function(center) {
    var viewbox = null;
    if (center && center.lat && center.lng) {
      // Radio ~50km alrededor del centro (0.45 grados ≈ 50km)
      var d = 0.45;
      viewbox = (center.lng - d) + ',' + (center.lat + d) + ',' + (center.lng + d) + ',' + (center.lat - d);
    }

    var stops = route.stops.slice();
    var coordsByIndex = [];
    var chain = Promise.resolve();

    stops.forEach(function(stop, i) {
      var name = (stop.headline || stop.name || stop.title || '').toString().trim();
      if (!name) {
        coordsByIndex[i] = { lat: 0, lng: 0 };
        return;
      }
      chain = chain
        .then(function() { return delay(1100); })
        .then(function() { return salmaGeocode(name + suffix, viewbox); })
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
  // Ocultar hero (título, subtítulo, input inicial)
  var heroBox = document.getElementById('salma-hero-box');
  if (heroBox) heroBox.style.display = 'none';
  var heroLabel = document.querySelector('.hero-label');
  if (heroLabel) heroLabel.style.display = 'none';
  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.style.display = 'none';
  var heroSub = document.querySelector('.hero-sub');
  if (heroSub) heroSub.style.display = 'none';

  // Mostrar sección de conversación (input se muestra solo cuando Salma pregunta)
  var section = document.getElementById('salma-inline');
  if (section) section.style.display = 'block';
}

function salmaReset() {
  // Restaurar hero
  var heroBox = document.getElementById('salma-hero-box');
  if (heroBox) heroBox.style.display = 'flex';
  var heroLabel = document.querySelector('.hero-label');
  if (heroLabel) heroLabel.style.display = '';
  var heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.style.display = '';
  var heroSub = document.querySelector('.hero-sub');
  if (heroSub) heroSub.style.display = '';

  // Ocultar y limpiar conversación
  var section = document.getElementById('salma-inline');
  if (section) section.style.display = 'none';
  var dialog = document.getElementById('salma-dialog');
  if (dialog) dialog.innerHTML = '';
  var routeResult = document.getElementById('salma-route-result');
  if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }
  salmaHideInput();
  salmaHistory = [];
  window._salmaLastRoute = null;

  // Foco al hero input
  var heroInput = document.getElementById('salma-hero-input');
  if (heroInput) { heroInput.value = ''; heroInput.focus(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.salmaReset = salmaReset;

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

function salmaExtractPlaceholder(text) {
  var clean = (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  var matches = clean.match(/[^.!?]*\?/g);
  if (!matches || matches.length === 0) return 'Escribe tu respuesta...';
  var q = matches[matches.length - 1].trim().replace(/^[\s,yYoO]+/, '').trim();
  if (q.length > 120) q = q.substring(0, 117) + '...';
  return q || 'Escribe tu respuesta...';
}

function salmaShowInput(botReply) {
  var wrap = document.getElementById('salma-inline-input-wrap');
  if (wrap) {
    wrap.style.display = 'block';
    var input = document.getElementById('salma-inline-input');
    if (input) {
      if (botReply) input.placeholder = salmaExtractPlaceholder(botReply);
      input.focus();
    }
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
      body: JSON.stringify({
        message: msg,
        history: [],
        nationality: (typeof currentUser !== 'undefined' && currentUser && currentUser.country) ? currentUser.country : null,
        user_name: (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : null
      })
    });
    var data = await res.json();
    salmaRemoveLoading();
    if (data._error) console.error('[SALMA WORKER ERROR]', data._error);

    if (data.reply) {
      salmaAddDialog(data.reply, 'bot');
      salmaHistory.push({ role: 'user', content: msg });
      salmaHistory.push({ role: 'assistant', content: data.reply });

      if (data.route && data.route.stops && data.route.stops.length > 0) {
        // Salma generó ruta — NO mostrar input de preguntas
        var hasAnyCoord = data.route.stops.some(function(s) { var a = s.lat, b = s.lng; return a != null && b != null && Number(a) && Number(b); });
        if (!hasAnyCoord) salmaAddDialog('Buscando coordenadas en el mapa…', 'loading');
        salmaEnrichRouteWithCoords(data.route).then(function(enriched) {
          salmaRemoveLoading();
          salmaRenderRoute(enriched);
        }).catch(function() { salmaRemoveLoading(); salmaRenderRoute(data.route); });
      } else {
        // Salma pregunta o responde sin ruta — mostrar input para que el usuario responda
        salmaShowInput(data.reply);
      }
    } else {
      salmaAddDialog('Uy, algo ha fallado. ¿Puedes intentarlo de nuevo?', 'bot');
      salmaShowInput();
    }
  } catch (err) {
    salmaRemoveLoading();
    salmaAddDialog('No puedo conectar ahora mismo. Inténtalo en un momento.', 'bot');
    salmaShowInput();
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
  salmaHideInput();
  salmaAddDialog('', 'loading');

  try {
    var body = {
      message: msg,
      history: salmaHistory,
      nationality: (typeof currentUser !== 'undefined' && currentUser && currentUser.country) ? currentUser.country : null,
      user_name: (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : null
    };
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
          salmaShowInput();
          if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        }).catch(function() {
          salmaRemoveLoading();
          salmaRenderRoute(baseRoute);
          salmaShowInput();
          if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        });
      } else {
        // Solo geocodificar si Salma indica que no pudo ubicar — si es conversacional, mostrar input
        var replyLowerInline = (data.reply || '').toLowerCase();
        var indicaSinUbicacionInline = replyLowerInline.indexOf('no tengo') !== -1 ||
          replyLowerInline.indexOf('no dispongo') !== -1 || replyLowerInline.indexOf('no encuentro') !== -1 ||
          replyLowerInline.indexOf('coordenada') !== -1 || replyLowerInline.indexOf('no puedo ubicar') !== -1 ||
          replyLowerInline.indexOf('sin informacion') !== -1 || replyLowerInline.indexOf('sin información') !== -1;
        if (indicaSinUbicacionInline) {
          salmaAddDialog('Buscando en el mapa…', 'loading');
          salmaTryMinimalRouteFromReply(msg, data.reply).then(function(minimalRoute) {
            salmaRemoveLoading();
            if (minimalRoute) {
              var routeResult = document.getElementById('salma-route-result');
              if (routeResult) { routeResult.innerHTML = ''; routeResult.style.display = 'none'; }
              salmaAddDialog('He ubicado "' + (minimalRoute.title || '') + '" en el mapa. Puedes guardarla y pedirme más detalles.', 'bot');
              salmaRenderRoute(minimalRoute);
              if (routeResult) setTimeout(function() { routeResult.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            }
            salmaShowInput();
          }).catch(function() { salmaRemoveLoading(); salmaShowInput(); });
        } else {
          salmaShowInput(data.reply);
        }
      }
    } else {
      salmaAddDialog('No he entendido bien. ¿Puedes repetir?', 'bot');
      salmaShowInput();
    }
  } catch (err) {
    salmaRemoveLoading();
    salmaAddDialog('Error de conexión. Inténtalo de nuevo.', 'bot');
    salmaShowInput();
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
    cover_image: destinoRuta ? 'https://salma-api.paco-defoto.workers.dev/photo?name=' + encodeURIComponent(destinoRuta) : '',
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

// ===== RESET — definición única en salmaShowInline (arriba) =====

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
    var body = {
      message: msg,
      history: salmaHistory,
      nationality: (typeof currentUser !== 'undefined' && currentUser && currentUser.country) ? currentUser.country : null,
      user_name: (typeof currentUser !== 'undefined' && currentUser && currentUser.name) ? currentUser.name : null
    };
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
