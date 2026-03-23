/* ═══════════════════════════════════════════
   BORRADO DEL MAPA V2 — salma.js
   Motor de conversación ÚNICO
   ═══════════════════════════════════════════ */

const salma = {
  history: [],
  currentRoute: null,
  currentRouteId: null,
  _streaming: false,
  _rateTimes: [],
  _userLocation: null,

  // Pedir geolocalización al usuario (se llama una vez al iniciar)
  initGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this._userLocation = {
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000
        };
        console.log('[Salma] Ubicación del viajero:', this._userLocation);
      },
      () => { /* Usuario denegó o error — sin ubicación, no pasa nada */ },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  },

  // ═══ PUNTO DE ENTRADA ÚNICO ═══
  async send(msg) {
    if (!msg || this._streaming) return;
    if (!this._checkRate()) return;

    // Pedir geolocalización en la primera interacción del usuario
    if (!this._geoRequested) {
      this._geoRequested = true;
      this.initGeolocation();
    }

    // Transicionar a chat si estamos en welcome
    if (currentState === 'welcome' || currentState === 'viajes') {
      this._initChat();
    }

    // Burbuja del usuario
    this._addUserBubble(msg);
    this.history.push({ role: 'user', content: msg });

    // Loading
    this._streaming = true;
    $send.disabled = true;
    const loadingEl = this._addLoading();

    try {
      const body = {
        message: msg,
        history: this.history.slice(-20), // últimos 20 mensajes
        stream: true
      };
      if (this.currentRoute) body.current_route = this.currentRoute;
      if (window.currentUser?.country) body.nationality = window.currentUser.country;
      if (window.currentUser?.name) body.user_name = window.currentUser.name;
      if (this._userLocation) body.user_location = this._userLocation;

      const data = await this._stream(body, loadingEl);

      // Guardar respuesta en historial
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
          // Ruta nueva
          this._addSalmaBubble('Guárdala y la tienes completa en Mis Viajes. Cuando quieras otra, dime destino y días.');
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
      $input.focus();
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
                  textEl.textContent = display.trim();
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
    this._addSalmaBubble('Aquí tienes tu guía de ' + title + '. Si quieres cambiar algo — quitar una parada, añadir un restaurante, cambiar un día entero — dímelo y lo actualizo.');
    guideRenderer.render(routeData, { saved: true });
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
    if (!this.currentRoute) return;
    const id = await guardarGuia(this.currentRoute);
    if (id) {
      this.currentRouteId = id;
      // Quitar botón guardar de la guide-card
      const btn = document.getElementById('guide-save-btn');
      if (btn) btn.remove();
    }
  },

  // ═══ RESET ═══
  reset() {
    this.history = [];
    this.currentRoute = null;
    this.currentRouteId = null;
    this._streaming = false;
  },

  // ═══ CHAT DOM ═══

  _initChat() {
    if (currentState !== 'chat') {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
      showState('chat');
    }
    if (!document.getElementById('chat-area')) {
      $content.innerHTML = '<div class="chat-area" id="chat-area"></div>';
    }
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
    this._scrollToBottom();
  },

  _addSalmaBubble(text) {
    const area = this._getChatArea();
    if (!area) return;
    const div = document.createElement('div');
    div.className = 'msg msg-salma';
    div.innerHTML = `
      <div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div>
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
      <div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div>
      <div class="msg-body-salma" id="salma-stream-text"></div>`;
    area.appendChild(div);
    return document.getElementById('salma-stream-text');
  },

  _fixStreamBubble() {
    const el = document.getElementById('salma-stream-msg');
    if (el) el.removeAttribute('id');
    const txt = document.getElementById('salma-stream-text');
    if (txt) {
      // Convertir texto plano a HTML con enlaces clicables
      txt.innerHTML = formatMessage(txt.textContent);
      txt.removeAttribute('id');
    }
  },

  _removeStreamBubble() {
    const el = document.getElementById('salma-stream-msg');
    if (el) {
      const txt = document.getElementById('salma-stream-text');
      if (txt && !txt.textContent.trim()) {
        el.remove(); // Vacía, quitar
      } else {
        if (txt) {
          txt.innerHTML = formatMessage(txt.textContent);
          txt.removeAttribute('id');
        }
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
      <div class="msg-avatar"><img src="salma_ai_avatar.webp" alt="Salma"></div>
      <div class="msg-body-salma">
        <div class="loading-dots"><span></span><span></span><span></span></div>
        <div class="loading-text" id="loading-phrase">${phrase}</div>
      </div>`;
    area.appendChild(div);
    this._scrollToBottom();

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

  _scrollToBottom() {
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
