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
    general:      { label: 'Nota',         icon: '\u{1F4DD}', tagClass: 'tag-nota' },
    recordatorio: { label: 'Recordatorio', icon: '\u{1F4CC}', tagClass: 'tag-nota' }
  };

  // ── Upload files to R2 ──

  async function _uploadFiles(files) {
    const uid = _uid();
    const uploaded = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', uid);
      formData.append('docId', 'nota_' + Date.now());
      const res = await fetch(window.SALMA_API + '/upload-doc', { method: 'POST', body: formData });
      if (!res.ok) { console.error('Upload failed:', file.name); continue; }
      const { key, url } = await res.json();
      uploaded.push({ fileName: file.name, fileType: file.type, r2Key: key, downloadURL: url });
    }
    return uploaded;
  }

  function _renderFileList(el, files) {
    if (!el) return;
    el.innerHTML = files.map((f, i) => `
      <div class="nota-file-item">
        <span class="nota-file-item-name">${_escHtml(f.name)}</span>
        <button class="nota-file-item-remove" data-idx="${i}">\u2715</button>
      </div>
    `).join('');
    el.querySelectorAll('.nota-file-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        files.splice(parseInt(btn.dataset.idx), 1);
        _renderFileList(el, files);
      });
    });
  }

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
      files: data.files || [],
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
      // Traer todas las notas y filtrar en JS (sin índice compuesto)
      const allNotas = await getAll();
      const today = _today();
      const future = new Date();
      future.setDate(future.getDate() + 7);
      const futureStr = future.toISOString().slice(0, 10);

      const all = allNotas
        .filter(n => !n.completado && n.fechaRecordatorio && n.fechaRecordatorio <= futureStr)
        .sort((a, b) => (a.fechaRecordatorio || '').localeCompare(b.fechaRecordatorio || ''));

      if (all.length === 0) { el.innerHTML = ''; return; }

      const shown = all.slice(0, 3);
      const hasMore = all.length > 3;

      el.innerHTML = `
        <div class="welcome-reminders">
          <div class="welcome-reminders-title">Pr\u00f3ximamente</div>
          ${shown.map(n => `
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
          ${hasMore ? '<button class="welcome-reminders-more" id="welcome-reminders-more">Ver todas</button>' : ''}
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

      // "Ver todas" → ir a Mis Notas con filtro Pendientes
      el.querySelector('#welcome-reminders-more')?.addEventListener('click', () => {
        _currentFilter = 'recordatorios';
        if (typeof showState === 'function') showState('notas');
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
    const isLong = (n.texto || '').length > 120;
    return `
      <div class="nota-card" data-id="${n.id}">
        <div class="nota-card-header">
          ${n.emoji ? `<span class="nota-card-country">${n.emoji}</span>` : ''}
          ${_dateBadge(n.fechaRecordatorio)}
          <div class="nota-card-actions">
            <button class="nota-card-edit" data-id="${n.id}" aria-label="Editar">\u270F\uFE0F</button>
            <button class="nota-card-delete" data-id="${n.id}" aria-label="Eliminar">\u2715</button>
          </div>
        </div>
        <div class="nota-card-texto ${isLong ? 'nota-truncated' : ''}" data-id="${n.id}">${typeof formatMessage === 'function' ? formatMessage(n.texto) : _escHtml(n.texto)}</div>
        ${(n.files && n.files.length) ? `<div class="nota-card-files">${n.files.map(f => {
          const isImg = (f.fileType || '').startsWith('image/');
          return isImg
            ? `<a href="${f.downloadURL}" target="_blank" rel="noopener"><img class="nota-card-thumb" src="${f.downloadURL}" alt="${_escHtml(f.fileName)}"></a>`
            : `<a class="nota-card-file-link" href="${f.downloadURL}" target="_blank" rel="noopener">\u{1F4CE} ${_escHtml(f.fileName)}</a>`;
        }).join('')}</div>` : ''}
        <div class="nota-card-date">${new Date(n.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
      </div>`;
  }

  function _renderEditForm(containerId, nota) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const isNew = !nota;
    const n = nota || { texto: '', tipo: 'general', fechaRecordatorio: '', countryCode: '' };

    const existingFiles = (n.files || []).map(f => `<div class="nota-file-item"><span class="nota-file-item-name">${_escHtml(f.fileName)}</span></div>`).join('');

    el.innerHTML = `
      <div class="nota-form">
        <textarea class="nota-form-input" id="nota-form-texto" placeholder="Escribe tu nota..." rows="3">${_escHtml(n.texto)}</textarea>
        <div class="nota-form-row">
          <input type="date" class="nota-form-date" id="nota-form-fecha" value="${n.fechaRecordatorio || ''}" placeholder="Recordatorio (opcional)">
        </div>
        <div class="nota-form-row">
          <button class="nota-form-file-btn" id="nota-form-file-btn">\u{1F4CE} Adjuntar archivo</button>
          <input type="file" id="nota-form-file-input" accept="image/*,application/pdf" multiple style="display:none">
        </div>
        ${existingFiles ? `<div class="nota-form-existing">${existingFiles}</div>` : ''}
        <div id="nota-form-file-list" class="nota-form-file-list"></div>
        <div class="nota-form-actions">
          <button class="nota-form-cancel" id="nota-form-cancel">Cancelar</button>
          <button class="nota-form-save" id="nota-form-save">${isNew ? 'Crear' : 'Guardar'}</button>
        </div>
      </div>`;

    // File handling
    const selectedFiles = [];
    const fileInput = document.getElementById('nota-form-file-input');
    const fileListEl = document.getElementById('nota-form-file-list');

    if (fileInput) {
      document.getElementById('nota-form-file-btn').addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
      fileInput.addEventListener('change', (e) => {
        for (const f of e.target.files) {
          if (f.size > 10 * 1024 * 1024) continue;
          selectedFiles.push(f);
        }
        _renderFileList(fileListEl, selectedFiles);
      });
    }

    document.getElementById('nota-form-cancel').addEventListener('click', () => { el.innerHTML = ''; });
    document.getElementById('nota-form-save').addEventListener('click', async () => {
      const texto = document.getElementById('nota-form-texto').value.trim();
      if (!texto) return;
      const fecha = document.getElementById('nota-form-fecha').value || null;
      const tipo = fecha ? 'recordatorio' : 'general';
      const saveBtn = document.getElementById('nota-form-save');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando...';

      try {
        // Subir archivos si hay
        let files = nota?.files || [];
        if (selectedFiles.length > 0) {
          files = [...files, ...(await _uploadFiles(selectedFiles))];
        }

        if (isNew) {
          await create({ texto, tipo, fechaRecordatorio: fecha, files });
        } else {
          await update(nota.id, { texto, tipo, fechaRecordatorio: fecha, files });
        }
        el.innerHTML = '';
        if (typeof showToast === 'function') showToast(isNew ? 'Nota creada' : 'Nota guardada');
        renderNotasView();
      } catch (err) {
        console.error('Error guardando nota:', err);
        saveBtn.disabled = false;
        saveBtn.textContent = isNew ? 'Crear' : 'Guardar';
        if (typeof showToast === 'function') showToast('Error al guardar nota');
      }
    });
  }

  function _initNotasListeners($content, notas) {
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

    // Expand truncated text
    $content.querySelectorAll('.nota-card-texto.nota-truncated').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        el.classList.toggle('nota-truncated');
        el.classList.toggle('nota-expanded');
      });
    });

    // Delete
    $content.querySelectorAll('.nota-card-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
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
