/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — salma.js
   Motor de conversación ÚNICO
   ═══════════════════════════════════════════ */

const SALMA_WELCOME_MESSAGES = [
  "Cuéntame a dónde quieres ir. Te armo la ruta día a día con nombres de carreteras, kilómetros y alternativas si algo falla. Busco vuelos, hoteles con disponibilidad real, dónde comer y qué ver — con historia y contexto, no solo listas. Y cuando estés en ruta, voy contigo.",
  "Dime un destino y te doy una ruta completa: camino, alojamiento, vuelos, presupuesto desglosado y un plan B para cuando llueve. Sin paja — solo lo que necesitas para salir por la puerta.",
  "Puedo planear el viaje entero: la ruta con mapa y días reales, vuelos con precios actuales, hoteles con disponibilidad, qué comer, qué ver, cuánto llevar y qué documentos no olvidar. ¿Por dónde empezamos?",
  "He cruzado Vietnam en moto, buscado auroras en Islandia y perdido el tren en Roma. Cuéntame el viaje que tienes en la cabeza — rutas, vuelos, hoteles, cultura, presupuesto — y lo montamos juntos."
];

const SALMA_WELCOME_RETURNING = "¿Tienes ya un viaje guardado? Puedo acompañarte en tiempo real cuando salgas — te cuento qué hay cerca, qué no te puedes perder y cómo llegar. Si todavía estás planeando, dime destino y empezamos.";

const salma = {
  history: [],
  currentRoute: null,
  currentRouteId: null,
  _streaming: false,
  _rateTimes: [],
  _userLocation: null,
  _pendingRouteInfo: null,  // Info parcial mientras esperamos fechas

  // Pedir geolocalización al usuario (se llama una vez, se actualiza continuamente)
  initGeolocation() {
    if (!navigator.geolocation) return;
    // watchPosition actualiza conforme el GPS mejora la precisión
    // Primero puede dar torre de celda, luego corrige con GPS real
    this._geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        this._userLocation = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
          accuracy: Math.round(pos.coords.accuracy)
        };
        console.log('[Salma] Ubicación:', this._userLocation.lat, this._userLocation.lng, '±' + this._userLocation.accuracy + 'm');
        // Activar copiloto cuando tenemos ubicación
        if (!this._copilotCountry) this.initCopilot();
        // Si ya tenemos buena precisión (<500m), dejar de monitorizar para ahorrar batería
        if (pos.coords.accuracy < 500 && this._geoWatchId) {
          navigator.geolocation.clearWatch(this._geoWatchId);
          this._geoWatchId = null;
        }
      },
      () => { console.log('[Salma] Ubicación no disponible'); },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  },

  // ═══ DETECCIÓN DE INFO DE RUTA ═══
  _detectRouteInfo(msg) {
    const lower = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ¿Es petición de ruta? (destino + días)
    const daysMatch = lower.match(/(\d+)\s*d[ií]as?/);
    const days = daysMatch ? parseInt(daysMatch[1]) : null;
    const isRoute = !!days || /\bruta\s+de\b|\bruta\s+por\b|itinerario|viaje a |escapada|roadtrip|road trip|semana\s*santa|en\s+coche|mochilero/i.test(msg);
    if (!isRoute) return { isRoute: false };

    // Fechas explícitas
    const datePatterns = [
      /del\s+(\d{1,2})\s+(al|a)\s+(\d{1,2})\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
      /(\d{1,2})\s+(de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /semana\s*santa/i,
      /navidad|nochevieja|fin\s+de\s+a[nñ]o|nochebuena/i,
      /puente\s+de/i,
      /este\s+finde|este\s+fin\s+de\s+semana/i,
      /la\s+semana\s+que\s+viene|proxima\s+semana|pr[oó]xima\s+semana/i,
      /en\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
    ];
    let dates = null;
    for (const pat of datePatterns) {
      const m = msg.match(pat);
      if (m) { dates = m[0]; break; }
    }

    // Transporte
    const transportMatch = msg.match(/\b(en\s+coche|roadtrip|road\s*trip|sin\s+coche|en\s+tren|en\s+moto|en\s+bici|en\s+autobus|en\s+bus|en\s+camper|en\s+furgo|a\s+pie|andando|en\s+avion|mochilero)\b/i);
    const transport = transportMatch ? transportMatch[1].trim() : null;

    // Niños
    const kids = /con\s+ni[nñ]os|con\s+peques|en\s+familia|con\s+hijos|with\s+kids|family/i.test(msg);

    // Completo = tiene fechas (lo principal que queremos preguntar)
    const complete = !!dates;

    return { isRoute: true, days, dates, transport, kids, complete };
  },

  _buildDateQuestion(info) {
    const parts = [];
    // Siempre preguntar fechas (es lo principal)
    parts.push('Si me dices las fechas, busco qué eventos, fiestas o expos hay esos días');
    if (!info.transport) {
      parts.push('¿Vas en coche, en tren, o cómo te mueves?');
    }
    if (!info.kids) {
      parts.push('¿Viajas con niños? Así ajusto el ritmo');
    }

    let question = '¡Me pongo con ello!\n\nAntes de montar la ruta:\n';
    question += parts.map(p => '- ' + p).join('\n');
    question += '\n\nSi no quieres complicarte, dale al botón y te la monto ya.';
    return question;
  },

  _addSkipButton() {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'skip-dates-wrap';
    div.id = 'salma-skip-dates';
    div.innerHTML = '<button class="skip-dates-btn" onclick="salma._skipDateQuestion()">Generar ruta ya →</button>';
    area.appendChild(div);
    this._scrollToBottom();
  },

  _skipDateQuestion() {
    // Quitar botón
    const btn = document.getElementById('salma-skip-dates');
    if (btn) btn.remove();

    if (!this._pendingRouteInfo) return;
    const originalMsg = this._pendingRouteInfo._originalMsg;
    this._pendingRouteInfo = null;

    // Enviar al worker sin fechas
    this._addUserBubble('Hazla ya');
    // NO push a history aquí — _doSend lo hace tras recibir respuesta
    this._doSend(originalMsg, {});
  },

  _resolveDates(dateStr, days) {
    if (!dateStr) return null;
    const lower = dateStr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const now = new Date();
    const year = now.getFullYear();
    const numDays = days || 3;

    const monthNames = { enero:0, febrero:1, marzo:2, abril:3, mayo:4, junio:5, julio:6, agosto:7, septiembre:8, octubre:9, noviembre:10, diciembre:11 };

    // "del 15 al 17 de abril"
    const rangeMatch = dateStr.match(/del\s+(\d{1,2})\s+(?:al|a)\s+(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
    if (rangeMatch) {
      const m = monthNames[rangeMatch[3].toLowerCase()];
      const from = new Date(year, m, parseInt(rangeMatch[1]));
      const to = new Date(year, m, parseInt(rangeMatch[2]));
      if (from < now) { from.setFullYear(year + 1); to.setFullYear(year + 1); }
      return { from: this._fmtDate(from), to: this._fmtDate(to) };
    }

    // "15 de abril"
    const singleMatch = dateStr.match(/(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
    if (singleMatch) {
      const m = monthNames[singleMatch[2].toLowerCase()];
      const from = new Date(year, m, parseInt(singleMatch[1]));
      if (from < now) from.setFullYear(year + 1);
      const to = new Date(from); to.setDate(to.getDate() + numDays - 1);
      return { from: this._fmtDate(from), to: this._fmtDate(to) };
    }

    // "en abril"
    const monthMatch = lower.match(/en\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
    if (monthMatch) {
      const m = monthNames[monthMatch[1]];
      const from = new Date(year, m, 1);
      if (from < now) from.setFullYear(year + 1);
      const to = new Date(from); to.setDate(to.getDate() + numDays - 1);
      return { from: this._fmtDate(from), to: this._fmtDate(to) };
    }

    // "este finde"
    if (/este\s+finde|este\s+fin\s+de\s+semana/.test(lower)) {
      const sat = new Date(now);
      sat.setDate(sat.getDate() + (6 - sat.getDay()));
      const sun = new Date(sat); sun.setDate(sun.getDate() + 1);
      return { from: this._fmtDate(sat), to: this._fmtDate(sun) };
    }

    // "la semana que viene"
    if (/semana\s+que\s+viene|proxima\s+semana/.test(lower)) {
      const mon = new Date(now);
      mon.setDate(mon.getDate() + (8 - mon.getDay()) % 7);
      const to = new Date(mon); to.setDate(to.getDate() + numDays - 1);
      return { from: this._fmtDate(mon), to: this._fmtDate(to) };
    }

    // "semana santa" — aproximación
    if (/semana\s*santa/.test(lower)) {
      // Semana Santa 2026 = 29 marzo - 5 abril
      // Semana Santa 2027 = 18 abril - 25 abril
      const ss2026 = new Date(2026, 2, 29);
      const ss2027 = new Date(2027, 3, 18);
      const ss = now < ss2026 ? ss2026 : ss2027;
      const to = new Date(ss); to.setDate(to.getDate() + 7);
      return { from: this._fmtDate(ss), to: this._fmtDate(to) };
    }

    // Fallback: próximas 2 semanas
    return { from: this._fmtDate(now), to: this._fmtDate(new Date(now.getTime() + numDays * 86400000)) };
  },

  _fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  // ═══ PUNTO DE ENTRADA ÚNICO ═══
  async send(msg) {
    if (!msg || this._streaming) return;
    if (!this._checkRate()) return;

    // Si no tenemos ubicación todavía, reintentar (ahora hay interacción del usuario)
    if (!this._userLocation && !this._geoWatchId) this.initGeolocation();

    // Transicionar a chat si estamos en welcome
    if (currentState === 'welcome' || currentState === 'viajes') {
      this._initChat();
    }

    // Burbuja del usuario
    this._addUserBubble(msg);
    // NO push a history aquí — se hace en _doSend tras recibir respuesta
    // para evitar duplicación (el worker ya recibe msg como campo separado)

    // Si estamos esperando respuesta a la pregunta de fechas
    if (this._pendingRouteInfo) {
      const btn = document.getElementById('salma-skip-dates');
      if (btn) btn.remove();

      const pending = this._pendingRouteInfo;
      this._pendingRouteInfo = null;

      // Intentar extraer fechas/transporte/niños de la respuesta
      const newInfo = this._detectRouteInfo(msg);
      const dates = newInfo.dates || pending.dates;
      const transport = newInfo.transport || pending.transport;
      const kids = newInfo.kids || pending.kids;

      const extra = {};
      if (dates) extra.travel_dates = this._resolveDates(dates, pending.days);
      if (transport) extra.transport = transport;
      if (kids) extra.with_kids = true;

      // Reconstruir mensaje completo para el worker
      const fullMsg = pending._originalMsg;
      this._doSend(fullMsg, extra);
      return;
    }

    // Detección de info de ruta (solo para rutas nuevas, no ediciones)
    if (!this.currentRouteId) {
      const info = this._detectRouteInfo(msg);
      if (info.isRoute && !info.complete) {
        // Guardar info parcial y preguntar
        info._originalMsg = msg;
        this._pendingRouteInfo = info;
        const question = this._buildDateQuestion(info);
        this._addSalmaBubble(question);
        this._addSkipButton();
        return;
      }

      // Si tiene todo completo, pasar extra al worker
      if (info.isRoute && info.complete) {
        const extra = {};
        if (info.dates) extra.travel_dates = this._resolveDates(info.dates, info.days);
        if (info.transport) extra.transport = info.transport;
        if (info.kids) extra.with_kids = true;
        this._doSend(msg, extra);
        return;
      }
    }

    // Mensaje normal (no ruta, o edición) → directo al worker
    this._doSend(msg, {});
  },

  // ═══ ENVÍO AL WORKER ═══
  async _doSend(msg, extra) {
    this._streaming = true;
    $send.disabled = true;
    const loadingEl = this._addLoading();

    try {
      const body = {
        message: msg,
        history: this.history.slice(-20),
        stream: true
      };
      if (this.currentRoute) body.current_route = this.currentRoute;
      if (window.currentUser?.country) body.nationality = window.currentUser.country;
      if (window.currentUser?.name) body.user_name = window.currentUser.name;
      if (window.currentUser) {
        body.coins_saldo = window.currentUser.coins_saldo || 0;
        body.rutas_gratis_usadas = window.currentUser.rutas_gratis_usadas || 0;
      }
      if (this._userLocation) body.user_location = this._userLocation;
      // Datos extra de detección
      if (extra.travel_dates) body.travel_dates = extra.travel_dates;
      if (extra.transport) body.transport = extra.transport;
      if (extra.with_kids) body.with_kids = extra.with_kids;

      const data = await this._stream(body, loadingEl);

      // Guardar mensaje del usuario + respuesta en historial (juntos, tras éxito)
      this.history.push({ role: 'user', content: msg });
      if (data.reply) {
        this.history.push({ role: 'assistant', content: data.reply });
      }

      // Si hay ruta, renderizar guide-card
      if (data.route && data.route.stops) {
        const isEdit = this.currentRouteId && this.currentRoute;
        this.currentRoute = data.route;
        if (!data._hadDraft) {
          this._removeLoading();
          try {
            guideRenderer.render(data.route, isEdit ? { saved: true } : {});
          } catch (renderErr) {
            console.error('Error renderizando guía:', renderErr);
          }
        } else {
          // Draft ya renderizado — parchear con datos verificados (fotos, coords)
          try {
            guideRenderer.updateVerified(data.route);
          } catch (e) {
            console.warn('Error actualizando guía verificada:', e);
          }
        }

        if (isEdit) {
          // Editando ruta guardada — actualizar Firestore
          this._addSalmaBubble('Ruta actualizada. Dime si quieres más cambios.');
          try {
            await db.collection('users').doc(window.currentUser.uid)
              .collection('maps').doc(this.currentRouteId).update({
                itinerarioIA: JSON.stringify(data.route),
                nombre: data.route.title || data.route.name || 'Mi ruta',
                updatedAt: new Date().toISOString()
              });
          } catch (e) { console.warn('Error actualizando guía:', e); }
        } else {
          // Ruta nueva — indicar que hay que pulsar GUARDAR
          this._addSalmaBubble('Dale al botón GUARDAR de abajo para no perderla. Cuando quieras otra ruta, dime destino y días.');
          this.history = [];
        }
      }

      this._scrollToBottom();

    } catch (e) {
      console.error('Error en salma.send:', e);
      this._removeLoading();
      this._removeStreamBubble();
      const errMsg = (e && e.message) ? e.message : String(e);
      this._addSalmaBubble('Uf, algo ha fallado (' + errMsg + '). Vuelve a intentarlo.');
    } finally {
      this._streaming = false;
      $send.disabled = false;
      if (!('ontouchstart' in window)) $input.focus();
    }
  },

  // ═══ SSE STREAMING ═══
  _stream(bodyObj, loadingEl) {
    return new Promise((resolve, reject) => {
      fetch(window.SALMA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj)
      }).then(res => {
        // Si viene JSON normal (error/fallback)
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return res.json().then(data => {
            this._removeLoading();
            if (data.reply) this._addSalmaBubble(data.reply);
            resolve(data);
          });
        }

        // SSE stream
        this._removeLoading();
        const textEl = this._addStreamBubble();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';
        let resolved = false;
        let textDone = false;
        let draftSent = false;

        const processLines = () => {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const evt = JSON.parse(jsonStr);

              // DONE — final
              if (evt.done) {
                this._removeStreamBubble();
                this._removeLoading();
                resolved = true;
                resolve({
                  reply: evt.reply || fullText,
                  route: evt.route || null,
                  _hadDraft: draftSent
                });
                return;
              }

              // DRAFT — ruta borrador
              if (evt.draft && !draftSent) {
                draftSent = true;
                textDone = true;
                this._fixStreamBubble();
                this._removeLoading();
                if (evt.route && evt.route.stops) {
                  this.currentRoute = evt.route;
                  try {
                    guideRenderer.render(evt.route);
                  } catch (renderErr) {
                    console.error('Error renderizando guía draft:', renderErr);
                  }
                  this._scrollToBottom();
                }
              }

              // GENERATING — Salma genera JSON
              if (evt.generating && !textDone) {
                textDone = true;
                this._fixStreamBubble();
                this._addLoading();
              }

              // KEEPALIVE — verificando paradas
              if (evt.k && !textDone) {
                textDone = true;
                this._fixStreamBubble();
                this._addLoading();
              }

              // TEXT CHUNK
              if (evt.t) {
                fullText += evt.t;
                if (textEl) {
                  let display = fullText;
                  const markerPos = display.indexOf('SALMA_ROUTE');
                  if (markerPos !== -1) {
                    display = display.substring(0, markerPos);
                  } else {
                    display = display.replace(/[\n.][ ]?SAL[MA_ROUTE]*$/, '');
                  }
                  textEl.innerHTML = formatMessage(display.trim());
                }
              }
            } catch (e) { /* ignorar JSON mal formado */ }
          }
        };

        const pump = () => {
          reader.read().then(result => {
            if (result.value) {
              buffer += decoder.decode(result.value, { stream: true });
              try { processLines(); } catch (e) { console.warn('processLines error:', e); }
            }
            if (resolved) return;
            if (result.done) {
              if (buffer.trim()) { buffer += '\n'; try { processLines(); } catch (e) {} }
              if (!resolved) {
                this._removeStreamBubble();
                resolve({ reply: fullText, route: null, _hadDraft: draftSent });
              }
              return;
            }
            pump();
          }).catch(err => {
            console.warn('Stream read error:', err);
            this._removeStreamBubble();
            // Si ya tenemos texto, resolver en vez de rechazar
            if (!resolved) {
              if (fullText) {
                resolve({ reply: fullText, route: null, _hadDraft: draftSent });
              } else {
                reject(err);
              }
            }
          });
        };
        pump();

      }).catch(err => {
        console.error('Fetch error:', err);
        reject(err);
      });
    });
  },

  // ═══ CARGAR GUÍA GUARDADA ═══
  async cargarGuia(docId, docData) {
    let routeData = null;
    try {
      if (docData && docData.itinerarioIA) {
        routeData = JSON.parse(docData.itinerarioIA);
      } else if (docId && window.currentUser) {
        const doc = await db.collection('users').doc(window.currentUser.uid)
          .collection('maps').doc(docId).get();
        if (doc.exists) routeData = JSON.parse(doc.data().itinerarioIA);
      }
    } catch (e) {
      console.error('Error parseando guía:', e);
    }

    if (!routeData || !routeData.stops) {
      showToast('No se pudo cargar la guía');
      return;
    }

    this.history = [];
    this.currentRoute = routeData;
    this.currentRouteId = docId;

    this._initChat();
    const title = routeData.title || routeData.name || 'Tu ruta';
    this._addSalmaBubble('Aquí tienes tu guía de ' + title + '. Si quieres cambiar algo, dímelo. También puedo crearte la ruta completa para Google Maps en un momento.');
    guideRenderer.render(routeData, { saved: true, showGmapsOffer: true });
    // Scroll al inicio de la guía, no al final
    const guideCard = document.querySelector('.guide-card');
    if (guideCard) {
      setTimeout(() => guideCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    showState('chat');

    // Si no está enriquecida, enriquecer ahora en background
    const isEnriched = docData && docData.enriched === true;
    if (!isEnriched && docId && typeof enrichGuia === 'function') {
      enrichGuia(docId, routeData);
    }
  },

  // ═══ GUARDAR ═══
  async guardar() {
    if (!this.currentRoute) {
      showToast('No hay ruta para guardar');
      return;
    }
    const id = await guardarGuia(this.currentRoute);
    if (id) {
      this.currentRouteId = id;
      // Quitar botón guardar de la guide-card
      const btn = document.getElementById('guide-save-btn');
      if (btn) btn.remove();
      showToast('Guía guardada en Mis Viajes');
    }
    // Si id es null → el modal de registro se ha abierto (guardarGuia lo maneja)
  },

  // ═══ RESET ═══
  reset() {
    this.history = [];
    this.currentRoute = null;
    this.currentRouteId = null;
    this._streaming = false;
    this._pendingRouteInfo = null;
  },

  // ═══ COPILOTO — TARJETA INFO PAÍS ═══
  _copilotCountry: null,
  _copilotData: null,

  async initCopilot() {
    if (!this._userLocation) return;
    try {
      // Reverse geocoding con Nominatim (OpenStreetMap, gratuito)
      const { lat, lng } = this._userLocation;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&zoom=3`);
      const geo = await res.json();
      const countryCode = (geo.address?.country_code || '').toLowerCase();
      if (!countryCode || countryCode === this._copilotCountry) return;

      // Pedir info práctica del país al worker
      const piRes = await fetch(window.SALMA_API + '/practical-info?country=' + countryCode);
      if (!piRes.ok) return;
      const piData = await piRes.json();
      if (!piData.practical_info) return;

      this._copilotCountry = countryCode;
      this._copilotData = piData.practical_info;
      console.log('[Salma] Copiloto activado:', geo.address?.country, countryCode);
    } catch (e) {
      console.log('[Salma] Copiloto: error obteniendo info', e.message);
    }
  },

  showCopilotCard() {
    const pi = this._copilotData;
    if (!pi) return;

    // No mostrar si ya existe
    if (document.getElementById('copilot-card')) return;

    const area = this._getChatArea();
    if (!area) return;

    let html = '<div id="copilot-card" class="copilot-card">';
    html += '<div class="copilot-header" onclick="document.getElementById(\'copilot-body\').classList.toggle(\'copilot-open\')">';
    html += '<span class="copilot-title">📍 Info práctica del país</span>';
    html += '<span class="copilot-toggle">▸</span></div>';
    html += '<div id="copilot-body" class="copilot-body">';

    // Emergencias (siempre visible, es lo más urgente)
    if (pi.emergencies) {
      html += '<div class="copilot-section"><strong>🚨 Emergencias</strong><br>';
      if (pi.emergencies.general_number) html += '<strong>' + pi.emergencies.general_number + '</strong><br>';
      if (pi.emergencies.embassy) html += '<small>' + pi.emergencies.embassy + '</small>';
      html += '</div>';
    }

    // Frases clave
    if (pi.phrases && pi.phrases.list) {
      html += '<div class="copilot-section"><strong>🗣️ ' + (pi.phrases.language || 'Frases') + '</strong>';
      html += '<div class="copilot-phrases">';
      for (const p of pi.phrases.list.slice(0, 6)) {
        html += '<span class="copilot-phrase"><b>' + p.phrase + '</b> ' + p.meaning + '</span>';
      }
      html += '</div></div>';
    }

    // Apps
    if (pi.useful_apps && pi.useful_apps.length) {
      html += '<div class="copilot-section"><strong>📱 Apps</strong><br>';
      html += '<small>' + pi.useful_apps.join('<br>') + '</small>';
      html += '</div>';
    }

    // Conectividad
    if (pi.connectivity) {
      html += '<div class="copilot-section"><strong>📶 Conectividad</strong><br>';
      if (pi.connectivity.sim_local) html += '<small>' + pi.connectivity.sim_local + '</small>';
      html += '</div>';
    }

    // Salud
    if (pi.health) {
      html += '<div class="copilot-section"><strong>🏥 Salud</strong><br>';
      if (pi.health.hospitals) html += '<small>' + pi.health.hospitals + '</small><br>';
      if (pi.health.water) html += '<small><em>' + pi.health.water + '</em></small>';
      html += '</div>';
    }

    // Presupuesto
    if (pi.budget) {
      html += '<div class="copilot-section"><strong>💰 Presupuesto</strong><br>';
      if (pi.budget.total_estimated) html += '<small>' + pi.budget.total_estimated + '</small><br>';
      if (pi.budget.exchange_tip) html += '<small><em>' + pi.budget.exchange_tip + '</em></small>';
      html += '</div>';
    }

    html += '</div></div>';

    // Insertar al principio del chat
    area.insertAdjacentHTML('afterbegin', html);
  },

  // ═══ CHAT DOM ═══

  _initChat(skipWelcome) {
    if (currentState !== 'chat') {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
      showState('chat');
    }
    if (!document.getElementById('chat-area')) {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
    }
    // Mostrar tarjeta copiloto si hay datos del país
    if (this._copilotData) this.showCopilotCard();
  },

  _getChatArea() {
    return document.getElementById('chat-area');
  },

  _addUserBubble(text) {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-user';
    div.innerHTML = `<div class="msg-body-user">${escapeHTML(text)}</div>`;
    area.appendChild(div);
    this._scrollToBottom(true);  // forzar: es el mensaje del usuario
  },

  _addSalmaBubble(text) {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma">${formatMessage(text)}</div>`;
    area.appendChild(div);
    this._scrollToBottom();
  },

  _addStreamBubble() {
    const area = this._getChatArea();
    if (!area) return null;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.id = 'salma-stream-msg';
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma" id="salma-stream-text"></div>`;
    area.appendChild(div);
    return document.getElementById('salma-stream-text');
  },

  _fixStreamBubble() {
    const el = document.getElementById('salma-stream-msg');
    if (el) el.removeAttribute('id');
    const txt = document.getElementById('salma-stream-text');
    if (txt) txt.removeAttribute('id');
    // No re-procesar: el innerHTML ya está formateado durante el streaming
  },

  _removeStreamBubble() {
    const el = document.getElementById('salma-stream-msg');
    if (el) {
      const txt = document.getElementById('salma-stream-text');
      if (txt && !txt.textContent.trim()) {
        el.remove(); // Vacía, quitar
      } else {
        // No re-procesar: el innerHTML ya está formateado
        if (txt) txt.removeAttribute('id');
        if (el) el.removeAttribute('id');
      }
    }
  },

  _loadingPhrases: [
    'Mirando el mapa...', 'Calculando la ruta...', 'Buscando los mejores sitios...',
    'Consultando precios...', 'Organizando el itinerario...',
    'Preguntando a los locales...', 'Comprobando horarios...',
    'Buscando restaurantes de verdad...', 'Verificando coordenadas...',
  ],
  _loadingInterval: null,

  _addLoading() {
    this._removeLoading();
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.id = 'salma-loading';
    const phrase = this._loadingPhrases[Math.floor(Math.random() * this._loadingPhrases.length)];
    div.innerHTML = `
      <div class="msg-salma-header"><div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div><span class="msg-salma-name">Salma</span></div>
      <div class="msg-body-salma">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text" id="loading-phrase">${phrase}</div>
      </div>`;
    area.appendChild(div);
    this._scrollToBottom(true);  // forzar: loading inicial

    // Rotar frases
    let idx = 0;
    this._loadingInterval = setInterval(() => {
      idx = (idx + 1) % this._loadingPhrases.length;
      const el = document.getElementById('loading-phrase');
      if (el) el.textContent = this._loadingPhrases[idx];
    }, 3000);
  },

  _removeLoading() {
    const el = document.getElementById('salma-loading');
    if (el) el.remove();
    if (this._loadingInterval) {
      clearInterval(this._loadingInterval);
      this._loadingInterval = null;
    }
  },

  _scrollToBottom(force) {
    // Solo hacer scroll si el usuario ya está cerca del fondo (< 300px)
    // o si se fuerza (ej: mensaje del usuario, no contenido streaming)
    const distFromBottom = document.body.scrollHeight - window.innerHeight - window.scrollY;
    if (!force && distFromBottom > 300) return;
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 50);
  },

  // ═══ RATE LIMIT ═══
  _checkRate() {
    const now = Date.now();
    this._rateTimes = this._rateTimes.filter(t => now - t < 60000);
    if (this._rateTimes.length >= 10) {
      showToast('Espera un momento, demasiados mensajes');
      return false;
    }
    this._rateTimes.push(now);
    return true;
  }
};

// Exponer globalmente
window.salma = salma;
