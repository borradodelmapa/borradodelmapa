/* ═══════════════════════════════════════════
   FLIGHT WATCHES — Vigilancia de vuelos
   Firestore: users/{uid}/flight_watches/{watchId}
   Alertas: KV fw_alerts:{uid} via Worker
   ═══════════════════════════════════════════ */

window.flightWatches = (() => {

  const FREE_LIMIT = 3;

  // ── Helpers ──
  function _uid() { return window.currentUser?.uid; }
  function _col() { return db.collection('users').doc(_uid()).collection('flight_watches'); }
  function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  async function _getAuthHeaders() {
    const user = firebase.auth().currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
  }

  // ── CRUD via Worker (server-validated) ──

  async function createWatch(data) {
    const headers = await _getAuthHeaders();
    if (!headers) { showToast('Inicia sesion primero'); return null; }
    try {
      const res = await fetch(window.SALMA_API + '/flight-watches', {
        method: 'POST', headers, body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.error === 'no_coins') {
          showToast('Necesitas Salma Coins para mas vigilancias');
        } else {
          showToast(result.error || 'Error al crear vigilancia');
        }
        return null;
      }
      if (result.coins_remaining !== undefined && window.currentUser) {
        window.currentUser.coins_saldo = result.coins_remaining;
      }
      showToast('Vigilancia creada');
      return result.watch;
    } catch (e) {
      showToast('Error de conexion');
      return null;
    }
  }

  async function deleteWatch(watchId) {
    const headers = await _getAuthHeaders();
    if (!headers) return false;
    try {
      const res = await fetch(window.SALMA_API + '/flight-watches', {
        method: 'DELETE', headers, body: JSON.stringify({ watchId })
      });
      return res.ok;
    } catch (e) { return false; }
  }

  async function togglePause(watchId, active) {
    const headers = await _getAuthHeaders();
    if (!headers) return false;
    try {
      const res = await fetch(window.SALMA_API + '/flight-watches/pause', {
        method: 'PUT', headers, body: JSON.stringify({ watchId, active })
      });
      return res.ok;
    } catch (e) { return false; }
  }

  // ── Alertas ──

  async function checkAlerts() {
    if (!_uid()) return [];
    try {
      const headers = await _getAuthHeaders();
      if (!headers) return [];
      const res = await fetch(window.SALMA_API + '/flight-alerts', { headers });
      if (!res.ok) return [];
      const { alerts } = await res.json();
      return (alerts || []).filter(a => !a.seen);
    } catch (e) { return []; }
  }

  async function markAlertsSeen(alertIds) {
    if (!alertIds || !alertIds.length) return;
    try {
      const headers = await _getAuthHeaders();
      if (!headers) return;
      await fetch(window.SALMA_API + '/flight-alerts/mark-seen', {
        method: 'PUT', headers, body: JSON.stringify({ alertIds })
      });
    } catch (e) {}
  }

  async function injectAlerts() {
    if (!_uid() || typeof salma === 'undefined') return;
    // Solo una vez por sesion
    const key = '_fw_alerts_shown';
    if (sessionStorage.getItem(key)) return;

    const alerts = await checkAlerts();
    if (alerts.length === 0) return;

    sessionStorage.setItem(key, '1');

    for (const alert of alerts) {
      let msg = '';
      const dest = alert.destination_name || alert.destination;
      if (alert.reason === 'price_drop' && alert.previous_price) {
        const drop = Math.round((1 - alert.current_price / alert.previous_price) * 100);
        msg = `Oye, el vuelo ${alert.origin} \u2192 ${dest} ha bajado un ${drop}%: ahora a **${alert.current_price} EUR** (antes ${alert.previous_price} EUR). \u00bfLo miramos?`;
      } else if (alert.reason === 'budget_hit') {
        msg = `Hay vuelo ${alert.origin} \u2192 ${dest} por **${alert.current_price} EUR**, dentro de tu presupuesto de ${alert.budget} EUR. \u00bfQuieres que busque opciones?`;
      } else {
        msg = `Novedad en tu vuelo ${alert.origin} \u2192 ${dest}: precio actual **${alert.current_price} EUR**.`;
      }
      if (msg) salma._addSalmaBubble(msg);
    }

    const ids = alerts.map(a => a.id);
    await markAlertsSeen(ids);
  }

  // ── Render: Vista principal ──

  async function renderVuelosView() {
    const $content = document.getElementById('app-content');
    if (!$content || !_uid()) return;

    $content.innerHTML = '<div class="vuelos-area fade-in"><div class="vuelos-loading">Cargando vigilancias...</div></div>';

    let watches = [];
    try {
      const headers = await _getAuthHeaders();
      if (headers) {
        const res = await fetch(window.SALMA_API + '/flight-watches', { headers });
        if (res.ok) {
          const data = await res.json();
          watches = data.watches || [];
        }
      }
    } catch (e) {
      console.warn('[FW] Error cargando watches:', e);
    }

    _renderList($content, watches);
  }

  function _renderList($content, watches) {
    const freeLeft = Math.max(0, FREE_LIMIT - watches.length);
    const freeText = freeLeft > 0
      ? `${freeLeft} vigilancia${freeLeft !== 1 ? 's' : ''} gratis restante${freeLeft !== 1 ? 's' : ''}`
      : 'Cada vigilancia extra: 1 Salma Coin';

    $content.innerHTML = `
      <div class="vuelos-area fade-in">
        <div class="vuelos-header">
          <div class="vuelos-title">VUELOS</div>
          <button class="vuelos-add-btn" id="vuelos-add-btn">+ Nueva</button>
        </div>
        <div class="vuelos-subtitle">${freeText}</div>
        <div id="vuelos-form-area"></div>
        <div class="vuelos-list" id="vuelos-list">
          ${watches.length === 0 ? _emptyState() : watches.map(_renderCard).join('')}
        </div>
      </div>`;

    _initListeners($content, watches);
  }

  function _emptyState() {
    return `
      <div class="vuelos-empty">
        <div class="vuelos-empty-icon">\u2708\uFE0F</div>
        <div class="vuelos-empty-text">Sin vigilancias activas</div>
        <div class="vuelos-empty-sub">Anade un destino y te aviso cuando baje el precio</div>
      </div>`;
  }

  function _renderCard(w) {
    const isActive = w.active !== false;
    const dateFrom = w.date_from || '';
    const dateTo = w.date_to || '';
    const dateRange = dateTo ? `${_fmtDate(dateFrom)} \u2014 ${_fmtDate(dateTo)}` : _fmtDate(dateFrom);
    const tripLabel = w.trip_type === 'roundtrip' ? 'Ida y vuelta' : 'Solo ida';

    let priceHtml = '<span class="watch-price-pending">Pendiente de revision</span>';
    if (w.last_price) {
      priceHtml = `<span class="watch-price">${w.last_price} EUR</span>`;
    }

    let lowestHtml = '';
    if (w.lowest_price && w.last_price && w.lowest_price < w.last_price) {
      lowestHtml = `<span class="watch-lowest">Mejor: ${w.lowest_price} EUR</span>`;
    }

    let budgetHtml = '';
    if (w.budget) {
      budgetHtml = `<span class="watch-budget">Ppto: ${w.budget} EUR</span>`;
    }

    let checkedHtml = '';
    if (w.last_checked) {
      checkedHtml = `<div class="watch-card-checked">Revisado: ${_fmtDate(w.last_checked)}</div>`;
    }

    return `
      <div class="watch-card ${!isActive ? 'watch-card-paused' : ''}" data-id="${w.id}">
        <div class="watch-card-route">
          <span class="watch-origin">${_esc(w.origin)}</span>
          <span class="watch-arrow">\u2192</span>
          <span class="watch-dest">${_esc(w.destination)}</span>
        </div>
        <div class="watch-card-meta">${_esc(w.destination_name || w.destination)}</div>
        <div class="watch-card-dates">${dateRange} \u00B7 ${tripLabel}</div>
        <div class="watch-card-price-row">
          ${priceHtml}
          ${lowestHtml}
          ${budgetHtml}
        </div>
        <div class="watch-card-actions">
          <button class="watch-btn-pause" data-id="${w.id}" data-active="${isActive}">
            ${isActive ? '\u23F8 Pausar' : '\u25B6 Reanudar'}
          </button>
          <button class="watch-btn-delete" data-id="${w.id}">Eliminar</button>
        </div>
        ${checkedHtml}
      </div>`;
  }

  function _fmtDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) { return iso.slice(0, 10); }
  }

  // ── Render: Formulario ──

  function _showForm() {
    const area = document.getElementById('vuelos-form-area');
    if (!area) return;

    area.innerHTML = `
      <div class="watch-form">
        <div class="watch-form-label">Origen (codigo IATA)</div>
        <input class="watch-form-input" id="fw-origin" type="text" placeholder="MAD, BCN, LIS..." maxlength="3" />

        <div class="watch-form-label" style="margin-top:12px">Destino</div>
        <input class="watch-form-input" id="fw-destination" type="text" placeholder="TYO, BKK, JFK..." maxlength="3" />
        <input class="watch-form-input" id="fw-dest-name" type="text" placeholder="Nombre completo (ej: Tokio, Japon)" style="margin-top:6px" />

        <div class="watch-form-row">
          <div style="flex:1">
            <div class="watch-form-label">Tipo</div>
            <select class="watch-form-select" id="fw-trip-type">
              <option value="roundtrip">Ida y vuelta</option>
              <option value="oneway">Solo ida</option>
            </select>
          </div>
          <div style="flex:1">
            <div class="watch-form-label">Cabina</div>
            <select class="watch-form-select" id="fw-cabin">
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        <div class="watch-form-row">
          <div style="flex:1">
            <div class="watch-form-label">Ida</div>
            <input class="watch-form-date" id="fw-date-from" type="date" />
          </div>
          <div style="flex:1" id="fw-return-group">
            <div class="watch-form-label">Vuelta</div>
            <input class="watch-form-date" id="fw-date-to" type="date" />
          </div>
        </div>

        <div class="watch-form-row">
          <div style="flex:1">
            <div class="watch-form-label">Presupuesto max (EUR, opcional)</div>
            <input class="watch-form-input" id="fw-budget" type="number" placeholder="500" />
          </div>
          <div style="flex:1">
            <div class="watch-form-label">Pasajeros</div>
            <input class="watch-form-input" id="fw-passengers" type="number" value="1" min="1" max="9" />
          </div>
        </div>

        <div class="watch-form-actions">
          <button class="watch-form-cancel" id="fw-cancel">Cancelar</button>
          <button class="watch-form-save" id="fw-save">Crear vigilancia</button>
        </div>
      </div>`;

    // Trip type toggle
    const tripType = document.getElementById('fw-trip-type');
    const returnGroup = document.getElementById('fw-return-group');
    tripType.addEventListener('change', () => {
      returnGroup.style.display = tripType.value === 'roundtrip' ? '' : 'none';
    });

    // Cancel
    document.getElementById('fw-cancel').addEventListener('click', () => {
      area.innerHTML = '';
    });

    // Save
    document.getElementById('fw-save').addEventListener('click', async () => {
      const origin = (document.getElementById('fw-origin').value || '').toUpperCase().trim();
      const destination = (document.getElementById('fw-destination').value || '').toUpperCase().trim();
      const destination_name = document.getElementById('fw-dest-name').value.trim();
      const trip_type = document.getElementById('fw-trip-type').value;
      const cabin = document.getElementById('fw-cabin').value;
      const date_from = document.getElementById('fw-date-from').value;
      const date_to = document.getElementById('fw-date-to').value;
      const budget = document.getElementById('fw-budget').value;
      const passengers = parseInt(document.getElementById('fw-passengers').value || '1', 10);

      if (!origin || origin.length < 2) { showToast('Indica el aeropuerto de origen'); return; }
      if (!destination || destination.length < 2) { showToast('Indica el aeropuerto de destino'); return; }
      if (!date_from) { showToast('Indica la fecha de ida'); return; }
      if (trip_type === 'roundtrip' && !date_to) { showToast('Indica la fecha de vuelta'); return; }

      const saveBtn = document.getElementById('fw-save');
      saveBtn.textContent = 'Creando...';
      saveBtn.disabled = true;

      const result = await createWatch({
        origin, destination, destination_name: destination_name || destination,
        trip_type, cabin, date_from,
        date_to: trip_type === 'roundtrip' ? date_to : null,
        budget: budget ? parseInt(budget, 10) : null,
        passengers
      });

      if (result) {
        renderVuelosView();
      } else {
        saveBtn.textContent = 'Crear vigilancia';
        saveBtn.disabled = false;
      }
    });
  }

  // ── Event listeners ──

  function _initListeners($content) {
    // Boton añadir
    const addBtn = document.getElementById('vuelos-add-btn');
    if (addBtn) addBtn.addEventListener('click', _showForm);

    // Pausar
    $content.querySelectorAll('.watch-btn-pause').forEach(btn => {
      btn.addEventListener('click', async () => {
        const watchId = btn.dataset.id;
        const isActive = btn.dataset.active === 'true';
        btn.textContent = isActive ? 'Pausando...' : 'Reanudando...';
        btn.disabled = true;
        const ok = await togglePause(watchId, !isActive);
        if (ok) {
          showToast(isActive ? 'Vigilancia pausada' : 'Vigilancia reanudada');
          renderVuelosView();
        } else {
          showToast('Error al actualizar');
          btn.textContent = isActive ? '\u23F8 Pausar' : '\u25B6 Reanudar';
          btn.disabled = false;
        }
      });
    });

    // Eliminar
    $content.querySelectorAll('.watch-btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const watchId = btn.dataset.id;
        const card = $content.querySelector(`.watch-card[data-id="${watchId}"]`);

        // Confirmacion inline: cambiar boton
        if (!btn._confirming) {
          btn._confirming = true;
          btn.textContent = 'Seguro?';
          btn.classList.add('watch-btn-delete-confirm');
          setTimeout(() => {
            if (btn._confirming) {
              btn._confirming = false;
              btn.textContent = 'Eliminar';
              btn.classList.remove('watch-btn-delete-confirm');
            }
          }, 3000);
          return;
        }

        btn.textContent = 'Eliminando...';
        btn.disabled = true;
        const ok = await deleteWatch(watchId);
        if (ok) {
          if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
          }
          showToast('Vigilancia eliminada');
          setTimeout(() => renderVuelosView(), 300);
        } else {
          showToast('Error al eliminar');
          btn.textContent = 'Eliminar';
          btn.disabled = false;
        }
      });
    });
  }

  // ── API publica ──
  return {
    renderVuelosView,
    injectAlerts,
    checkAlerts
  };

})();
