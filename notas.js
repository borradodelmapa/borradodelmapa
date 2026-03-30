// ═══ NOTAS.JS — Sistema unificado de notas y recordatorios ═══
// Firestore: users/{uid}/notas/{notaId}

window.notasManager = (() => {

  // ── Helpers ──
  function _uid() { return window.currentUser?.uid; }
  function _col() { return db.collection('users').doc(_uid()).collection('notas'); }
  function _genId() { return 'nota_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); }
  function _today() { return new Date().toISOString().slice(0, 10); }
  function _escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  const TIPOS = {
    general:      { label: 'Nota',        icon: '\u{1F4DD}', tagClass: 'tag-nota' },
    recordatorio: { label: 'Recordatorio', icon: '\u{1F4CC}', tagClass: 'tag-nota' },
    hotel:        { label: 'Hotel',        icon: '\u{1F3E8}', tagClass: 'tag-hotel' },
    vuelo:        { label: 'Vuelo',        icon: '\u2708\uFE0F', tagClass: 'tag-vuelo' },
    restaurante:  { label: 'Restaurante',  icon: '\u{1F37D}\uFE0F', tagClass: 'tag-restaurante' },
    lugar:        { label: 'Lugar',        icon: '\u{1F4CD}', tagClass: 'tag-lugar' },
    visado:       { label: 'Visado',       icon: '\u{1F6C2}', tagClass: 'tag-visado' },
    transporte:   { label: 'Transporte',   icon: '\u{1F68C}', tagClass: 'tag-transporte' }
  };

  // ── CRUD ──

  async function create(data) {
    if (!_uid()) return null;
    const id = _genId();
    const now = new Date().toISOString();
    const doc = {
      id,
      texto: data.texto || '',
      tipo: data.tipo || (data.fechaRecordatorio ? 'recordatorio' : 'general'),
      countryCode: data.countryCode || null,
      countryName: data.countryName || null,
      emoji: data.emoji || null,
      fechaRecordatorio: data.fechaRecordatorio || null,
      completado: false,
      origen: data.origen || 'manual',
      fuente: data.fuente || null,
      createdAt: now,
      updatedAt: now
    };
    await _col().doc(id).set(doc);
    return id;
  }

  async function update(notaId, fields) {
    if (!_uid() || !notaId) return;
    fields.updatedAt = new Date().toISOString();
    await _col().doc(notaId).update(fields);
  }

  async function remove(notaId) {
    if (!_uid() || !notaId) return;
    await _col().doc(notaId).delete();
  }

  async function getAll(filters) {
    if (!_uid()) return [];
    try {
      let q = _col().orderBy('createdAt', 'desc');
      if (filters?.countryCode) q = q.where('countryCode', '==', filters.countryCode);
      if (filters?.limit) q = q.limit(filters.limit);
      const snap = await q.get();
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.warn('getAll notas error (probando sin orderBy):', e);
      // Fallback sin orderBy por si falta índice
      try {
        const snap = await _col().get();
        const docs = snap.docs.map(d => d.data());
        docs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        return filters?.limit ? docs.slice(0, filters.limit) : docs;
      } catch (e2) {
        console.error('getAll notas fallback error:', e2);
        return [];
      }
    }
  }

  async function getReminders(daysAhead = 7) {
    if (!_uid()) return [];
    const today = _today();
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);
    const futureStr = future.toISOString().slice(0, 10);

    try {
      // Intenta con índice compuesto (completado + fechaRecordatorio)
      const snap = await _col()
        .where('completado', '==', false)
        .orderBy('fechaRecordatorio', 'asc')
        .get();
      return snap.docs.map(d => d.data()).filter(n => n.fechaRecordatorio && n.fechaRecordatorio <= futureStr);
    } catch (e) {
      console.warn('getReminders índice no disponible, fallback client-side:', e);
      // Fallback: traer todo y filtrar
      try {
        const snap = await _col().get();
        return snap.docs.map(d => d.data())
          .filter(n => !n.completado && n.fechaRecordatorio && n.fechaRecordatorio <= futureStr)
          .sort((a, b) => (a.fechaRecordatorio || '').localeCompare(b.fechaRecordatorio || ''));
      } catch (e2) {
        return [];
      }
    }
  }

  async function getByCountry(code) {
    return getAll({ countryCode: code });
  }

  async function toggleComplete(notaId) {
    if (!_uid() || !notaId) return;
    const doc = await _col().doc(notaId).get();
    if (!doc.exists) return;
    await update(notaId, { completado: !doc.data().completado });
  }

  // ── Migrar notas antiguas (lazy, una vez) ──

  async function _migrateIfNeeded() {
    if (!_uid()) return;
    const userRef = db.collection('users').doc(_uid());
    const userDoc = await userRef.get();
    if (userDoc.exists && userDoc.data().notasMigrated) return;

    const paisesSnap = await db.collection('users').doc(_uid()).collection('paises').get();
    if (paisesSnap.empty) {
      await userRef.update({ notasMigrated: true });
      return;
    }

    const batch = db.batch();
    let count = 0;
    paisesSnap.forEach(paisDoc => {
      const data = paisDoc.data();
      const notas = data.notas || [];
      notas.forEach(n => {
        const id = n.id || _genId();
        const ref = _col().doc(id);
        batch.set(ref, {
          id,
          texto: n.texto || '',
          tipo: n.tipo || 'general',
          countryCode: data.countryCode || paisDoc.id,
          countryName: data.countryName || null,
          emoji: data.emoji || null,
          fechaRecordatorio: null,
          completado: false,
          origen: 'migrated',
          fuente: n.fuente || null,
          createdAt: n.fecha || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        count++;
      });
    });

    if (count > 0) await batch.commit();
    await userRef.update({ notasMigrated: true });
    return count;
  }

  // ── Date helpers ──

  function _dateBadge(fechaStr) {
    if (!fechaStr) return '';
    const today = new Date(_today());
    const fecha = new Date(fechaStr);
    const diff = Math.round((fecha - today) / (1000 * 60 * 60 * 24));
    let text, cls;
    if (diff < 0) { text = 'Vencido'; cls = 'reminder-badge-urgent'; }
    else if (diff === 0) { text = 'Hoy'; cls = 'reminder-badge-urgent'; }
    else if (diff === 1) { text = 'Ma\u00f1ana'; cls = 'reminder-badge-soon'; }
    else if (diff <= 7) { text = `En ${diff} d\u00edas`; cls = 'reminder-badge-future'; }
    else { text = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); cls = 'reminder-badge-far'; }
    return `<span class="reminder-badge ${cls}">${text}</span>`;
  }

  function _tipoTag(tipo) {
    const t = TIPOS[tipo] || TIPOS.general;
    return `<span class="nota-tipo-tag ${t.tagClass}">${t.icon} ${t.label}</span>`;
  }

  // ── RENDER: Recordatorios en Welcome ──

  async function renderWelcomeReminders(containerId) {
    const el = document.getElementById(containerId);
    if (!el || !_uid()) return;

    try {
      const reminders = await getReminders(7);
      // Incluir también los vencidos (hasta 7 días atrás)
      const snap = await _col()
        .where('completado', '==', false)
        .orderBy('fechaRecordatorio', 'asc')
        .get();
      const pastDue = snap.docs
        .map(d => d.data())
        .filter(n => n.fechaRecordatorio && n.fechaRecordatorio < _today());
      const all = [...pastDue, ...reminders].slice(0, 5);

      if (all.length === 0) { el.innerHTML = ''; return; }

      el.innerHTML = `
        <div class="welcome-reminders">
          <div class="welcome-reminders-title">Pr\u00f3ximamente</div>
          ${all.map(n => `
            <div class="reminder-card ${n.fechaRecordatorio <= _today() ? 'reminder-card-urgent' : ''}" data-id="${n.id}">
              <button class="reminder-check" data-id="${n.id}" aria-label="Completar">\u2713</button>
              <div class="reminder-body">
                <div class="reminder-text">${_escHtml(n.texto)}</div>
                <div class="reminder-meta">
                  ${n.emoji || ''} ${_dateBadge(n.fechaRecordatorio)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>`;

      // Listeners — completar recordatorio
      el.querySelectorAll('.reminder-check').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          await toggleComplete(id);
          const card = el.querySelector(`.reminder-card[data-id="${id}"]`);
          if (card) card.style.opacity = '0';
          setTimeout(() => renderWelcomeReminders(containerId), 300);
        });
      });
    } catch (e) {
      console.warn('Error cargando recordatorios:', e);
    }
  }

  // ── RENDER: Vista completa "Mis Notas" ──

  let _currentFilter = 'todas';

  async function renderNotasView() {
    const $content = document.getElementById('app-content');
    if (!$content || !_uid()) return;

    $content.innerHTML = `<div class="notas-area fade-in"><div class="notas-loading">Cargando notas...</div></div>`;

    try {
      await _migrateIfNeeded();
    } catch (e) {
      console.warn('Migración notas falló (no pasa nada):', e);
    }

    let notas = [];
    try {
      notas = await getAll();
    } catch (e) {
      console.warn('Error cargando notas:', e);
    }
    _renderNotasList($content, notas);
  }

  function _renderNotasList($content, notas) {
    // Extraer países únicos para filtros
    const paises = {};
    notas.forEach(n => {
      if (n.countryCode && n.emoji) paises[n.countryCode] = { name: n.countryName, emoji: n.emoji };
    });

    // Filtrar
    let filtered = notas;
    if (_currentFilter === 'recordatorios') {
      filtered = notas.filter(n => n.fechaRecordatorio);
    } else if (_currentFilter !== 'todas' && _currentFilter.length === 2) {
      filtered = notas.filter(n => n.countryCode === _currentFilter);
    }

    $content.innerHTML = `
      <div class="notas-area fade-in">
        <div class="notas-header">
          <button class="notas-back" id="notas-back">\u2039</button>
          <div class="notas-title">Mis Notas</div>
          <button class="notas-add-btn" id="notas-add-btn">+</button>
        </div>

        <div class="nota-filters" id="nota-filters">
          <button class="nota-filter-pill ${_currentFilter === 'todas' ? 'active' : ''}" data-filter="todas">Todas</button>
          <button class="nota-filter-pill ${_currentFilter === 'recordatorios' ? 'active' : ''}" data-filter="recordatorios">\u{1F4CC} Recordatorios</button>
          ${Object.entries(paises).map(([code, p]) =>
            `<button class="nota-filter-pill ${_currentFilter === code ? 'active' : ''}" data-filter="${code}">${p.emoji} ${p.name || code}</button>`
          ).join('')}
        </div>

        <div class="notas-form-area" id="notas-form-area"></div>

        <div class="notas-list" id="notas-list">
          ${filtered.length === 0
            ? `<div class="nota-empty">
                <div class="nota-empty-icon">\u{1F4DD}</div>
                <div class="nota-empty-text">A\u00fan no tienes notas</div>
                <div class="nota-empty-sub">Dile a Salma "ap\u00fantame que..." o pulsa + para crear una</div>
              </div>`
            : filtered.map(n => _renderNotaCard(n)).join('')
          }
        </div>
      </div>`;

    _initNotasListeners($content, notas);
  }

  function _renderNotaCard(n) {
    return `
      <div class="nota-card" data-id="${n.id}">
        <div class="nota-card-header">
          ${_tipoTag(n.tipo)}
          ${n.emoji ? `<span class="nota-card-country">${n.emoji}</span>` : ''}
          ${_dateBadge(n.fechaRecordatorio)}
          <div class="nota-card-actions">
            <button class="nota-card-edit" data-id="${n.id}" aria-label="Editar">\u270F\uFE0F</button>
            <button class="nota-card-delete" data-id="${n.id}" aria-label="Eliminar">\u2715</button>
          </div>
        </div>
        <div class="nota-card-texto" data-id="${n.id}">${_escHtml(n.texto)}</div>
        <div class="nota-card-date">${new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>`;
  }

  function _renderEditForm(containerId, nota) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const isNew = !nota;
    const n = nota || { texto: '', tipo: 'general', fechaRecordatorio: '', countryCode: '' };

    el.innerHTML = `
      <div class="nota-form">
        <textarea class="nota-form-input" id="nota-form-texto" placeholder="Escribe tu nota..." rows="3">${_escHtml(n.texto)}</textarea>
        <div class="nota-form-row">
          <select class="nota-form-select" id="nota-form-tipo">
            ${Object.entries(TIPOS).map(([k, v]) =>
              `<option value="${k}" ${n.tipo === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`
            ).join('')}
          </select>
          <input type="date" class="nota-form-date" id="nota-form-fecha" value="${n.fechaRecordatorio || ''}" placeholder="Fecha">
        </div>
        <div class="nota-form-actions">
          <button class="nota-form-cancel" id="nota-form-cancel">Cancelar</button>
          <button class="nota-form-save" id="nota-form-save">${isNew ? 'Crear' : 'Guardar'}</button>
        </div>
      </div>`;

    document.getElementById('nota-form-cancel').addEventListener('click', () => { el.innerHTML = ''; });
    document.getElementById('nota-form-save').addEventListener('click', async () => {
      const texto = document.getElementById('nota-form-texto').value.trim();
      if (!texto) return;
      const tipo = document.getElementById('nota-form-tipo').value;
      const fecha = document.getElementById('nota-form-fecha').value || null;

      if (isNew) {
        await create({ texto, tipo, fechaRecordatorio: fecha });
      } else {
        await update(nota.id, { texto, tipo, fechaRecordatorio: fecha });
      }
      el.innerHTML = '';
      renderNotasView();
    });
  }

  function _initNotasListeners($content, notas) {
    // Back
    const backBtn = $content.querySelector('#notas-back');
    if (backBtn) backBtn.addEventListener('click', () => {
      if (typeof showState === 'function') showState('profile');
    });

    // Add
    const addBtn = $content.querySelector('#notas-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => {
      _renderEditForm('notas-form-area', null);
    });

    // Filters
    $content.querySelectorAll('.nota-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        _currentFilter = pill.dataset.filter;
        _renderNotasList($content, notas);
      });
    });

    // Delete
    $content.querySelectorAll('.nota-card-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('\u00bfEliminar esta nota?')) return;
        await remove(btn.dataset.id);
        const card = $content.querySelector(`.nota-card[data-id="${btn.dataset.id}"]`);
        if (card) { card.style.opacity = '0'; card.style.transform = 'translateX(-20px)'; }
        setTimeout(() => renderNotasView(), 300);
      });
    });

    // Edit
    $content.querySelectorAll('.nota-card-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nota = notas.find(n => n.id === btn.dataset.id);
        if (nota) _renderEditForm('notas-form-area', nota);
      });
    });
  }

  // ── API pública ──
  return {
    create,
    update,
    delete: remove,
    getAll,
    getReminders,
    getByCountry,
    toggleComplete,
    renderWelcomeReminders,
    renderNotasView,
    TIPOS
  };

})();
