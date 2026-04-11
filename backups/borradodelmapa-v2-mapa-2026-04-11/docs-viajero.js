/* ═══════════════════════════════════════════
   DOCUMENTOS DEL VIAJERO — docs-viajero.js
   Subida a Firebase Storage + metadatos en Firestore
   ═══════════════════════════════════════════ */

const DOC_CATEGORIES = [
  { id: 'passport',   label: 'Pasaporte',          emoji: '\u{1F6C2}' },
  { id: 'id',         label: 'DNI / ID',            emoji: '\u{1FAAA}' },
  { id: 'visa',       label: 'Visado',              emoji: '\u{1F4CB}' },
  { id: 'insurance',  label: 'Seguro de viaje',     emoji: '\u{1F6E1}\uFE0F' },
  { id: 'rental',     label: 'Contrato alquiler',   emoji: '\u{1F3E0}' },
  { id: 'transport',  label: 'Billetes / Reservas', emoji: '\u2708\uFE0F' },
  { id: 'other',      label: 'Otros',               emoji: '\u{1F4C1}' }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const docsViajero = {
  _docs: [],

  // ── Render principal ──
  render() {
    if (typeof currentUser === 'undefined' || !currentUser) return;
    currentState = 'documentos';
    if (typeof updateHeader === 'function') updateHeader();

    const $content = document.getElementById('app-content');
    $content.innerHTML = '<div class="docs-area"><div class="docs-header"><button class="docs-back" id="docs-back">\u2039</button><div class="docs-title">Documentos del Viajero</div></div><div id="docs-alerts"></div><div id="docs-grid-wrap"></div><button class="docs-salma-btn" id="docs-ask-salma">\u{1F4AC} Consultar a Salma \u2192</button></div>';

    document.getElementById('docs-back').addEventListener('click', () => {
      if (typeof showState === 'function') showState('profile');
    });
    document.getElementById('docs-ask-salma').addEventListener('click', () => this._askSalma());

    this._loadDocs();
  },

  // ── Cargar docs desde Firestore ──
  async _loadDocs() {
    const uid = currentUser.uid;
    try {
      const snap = await db.collection('users').doc(uid).collection('travel_docs')
        .orderBy('createdAt', 'desc').get();
      this._docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error cargando docs:', e);
      this._docs = [];
    }
    this._renderAlerts();
    this._renderGrid();
  },

  // ── Alertas de caducidad ──
  _getExpiryStatus(expiresAt) {
    if (!expiresAt) return null;
    const expDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const days = Math.ceil((expDate - new Date()) / 86400000);
    if (days < 0)   return { status: 'expired',  label: 'Caducado',   days };
    if (days <= 30) return { status: 'critical',  label: `${days}d`,   days };
    if (days <= 60) return { status: 'warning',   label: `${days}d`,   days };
    return             { status: 'ok',       label: 'Vigente',    days };
  },

  _renderAlerts() {
    const el = document.getElementById('docs-alerts');
    if (!el) return;

    const expired = this._docs.filter(d => {
      const s = this._getExpiryStatus(d.expiresAt);
      return s && s.status === 'expired';
    });
    const critical = this._docs.filter(d => {
      const s = this._getExpiryStatus(d.expiresAt);
      return s && s.status === 'critical';
    });

    let html = '';
    if (expired.length > 0) {
      const names = expired.map(d => d.name).join(', ');
      html += `<div class="docs-alert docs-alert-expired"><span class="docs-alert-icon">\u26A0\uFE0F</span><span><strong>${expired.length === 1 ? 'Documento caducado' : 'Documentos caducados'}:</strong> ${this._esc(names)}</span></div>`;
    }
    if (critical.length > 0) {
      const names = critical.map(d => `${d.name} (${this._getExpiryStatus(d.expiresAt).days}d)`).join(', ');
      html += `<div class="docs-alert docs-alert-critical"><span class="docs-alert-icon">\u23F3</span><span><strong>Caduca pronto:</strong> ${this._esc(names)}</span></div>`;
    }
    el.innerHTML = html;
  },

  // ── Lista de documentos ──
  _renderGrid() {
    const wrap = document.getElementById('docs-grid-wrap');
    if (!wrap) return;

    if (this._docs.length === 0) {
      wrap.innerHTML = `<div class="docs-empty"><div class="docs-empty-icon">\u{1F5C4}\uFE0F</div><div class="docs-empty-text">Aún no tienes documentos guardados.<br>Sube tu pasaporte, visados, seguros...</div><div class="docs-list"><div class="doc-row-add" id="doc-add-empty"><div class="doc-row-add-icon">+</div><div class="doc-row-add-label">Añadir documento</div></div></div></div>`;
      document.getElementById('doc-add-empty').addEventListener('click', () => this._openAddModal());
      return;
    }

    let html = '<div class="docs-list">';
    this._docs.forEach(doc => {
      const cat = DOC_CATEGORIES.find(c => c.id === doc.category) || DOC_CATEGORIES[6];
      const expiry = this._getExpiryStatus(doc.expiresAt);
      let badge = '';
      if (expiry) {
        badge = `<span class="doc-row-badge doc-badge-${expiry.status}">${this._esc(expiry.label)}</span>`;
      }
      html += `<div class="doc-row" data-doc-id="${doc.id}"><span class="doc-row-emoji">${cat.emoji}</span><div class="doc-row-info"><div class="doc-row-name">${this._esc(doc.name)}</div><div class="doc-row-cat">${this._esc(cat.label)}</div></div><div class="doc-row-right">${badge}<span class="doc-row-arrow">\u203A</span></div></div>`;
    });
    html += `<div class="doc-row-add" id="doc-add-btn"><div class="doc-row-add-icon">+</div><div class="doc-row-add-label">Añadir documento</div></div></div>`;
    wrap.innerHTML = html;

    // Listeners
    wrap.querySelectorAll('.doc-row[data-doc-id]').forEach(row => {
      row.addEventListener('click', () => {
        const doc = this._docs.find(d => d.id === row.dataset.docId);
        if (doc) this._openViewModal(doc);
      });
    });
    document.getElementById('doc-add-btn').addEventListener('click', () => this._openAddModal());
  },

  // ── Modal añadir documento ──
  _openAddModal() {
    const overlay = document.createElement('div');
    overlay.className = 'docs-modal-overlay';

    let catOptions = DOC_CATEGORIES.map(c => `<option value="${c.id}">${c.emoji} ${c.label}</option>`).join('');

    overlay.innerHTML = `<div class="docs-modal"><div class="docs-modal-handle"></div><div class="docs-modal-title">Nuevo documento</div><div class="docs-field"><label class="docs-label">Nombre *</label><input class="docs-input" id="doc-name" type="text" placeholder="Ej: Pasaporte España" maxlength="100"></div><div class="docs-field"><label class="docs-label">Categoría *</label><select class="docs-select" id="doc-category">${catOptions}</select></div><div class="docs-field"><label class="docs-label">Archivos *</label><div class="docs-file-buttons"><button class="docs-file-btn" id="doc-camera-btn">\u{1F4F8} Hacer foto</button><button class="docs-file-btn" id="doc-file-btn">\u{1F4CE} Elegir archivos</button></div><input type="file" id="doc-file-input" accept="*" multiple style="display:none"><input type="file" id="doc-camera-input" accept="image/*" capture="environment" style="display:none"><div id="doc-file-list" class="docs-file-list"></div><div class="docs-file-error" id="doc-file-error"></div></div><div class="docs-field"><label class="docs-label">Fecha de caducidad</label><input class="docs-input" id="doc-expires" type="date"></div><div class="docs-field"><label class="docs-label">Notas</label><textarea class="docs-textarea" id="doc-notes" placeholder="Opcional" rows="2" maxlength="500"></textarea></div><div id="doc-progress-wrap"></div><div class="docs-modal-actions"><button class="docs-btn docs-btn-secondary" id="doc-cancel">Cancelar</button><button class="docs-btn docs-btn-primary" id="doc-save" disabled>Guardar</button></div></div>`;

    document.body.appendChild(overlay);

    const selectedFiles = [];

    const fileInput = overlay.querySelector('#doc-file-input');
    const cameraInput = overlay.querySelector('#doc-camera-input');
    const nameInput = overlay.querySelector('#doc-name');
    const saveBtn = overlay.querySelector('#doc-save');
    const fileListEl = overlay.querySelector('#doc-file-list');

    const updateSaveState = () => {
      const hasName = nameInput.value.trim().length > 0;
      saveBtn.disabled = !(hasName && selectedFiles.length > 0);
    };

    const renderFileList = () => {
      if (selectedFiles.length === 0) {
        fileListEl.innerHTML = '';
        return;
      }
      fileListEl.innerHTML = selectedFiles.map((f, i) => `<div class="docs-file-item"><span class="docs-file-item-name">${this._esc(f.name)}</span><span class="docs-file-item-size">${this._formatSize(f.size)}</span><button class="docs-file-item-remove" data-idx="${i}">\u2715</button></div>`).join('');
      fileListEl.querySelectorAll('.docs-file-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedFiles.splice(parseInt(btn.dataset.idx), 1);
          renderFileList();
          updateSaveState();
        });
      });
    };

    const addFiles = (files) => {
      const errorEl = overlay.querySelector('#doc-file-error');
      errorEl.textContent = '';
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          errorEl.textContent = `"${file.name}" supera 10 MB`;
          continue;
        }
        selectedFiles.push(file);
      }
      renderFileList();
      updateSaveState();
    };

    nameInput.addEventListener('input', updateSaveState);

    // Botón cámara — cada foto se añade a la lista, puede hacer varias
    overlay.querySelector('#doc-camera-btn').addEventListener('click', () => {
      cameraInput.value = '';
      cameraInput.click();
    });
    // Botón archivo — multiple
    overlay.querySelector('#doc-file-btn').addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => addFiles(Array.from(e.target.files)));
    cameraInput.addEventListener('change', (e) => addFiles(Array.from(e.target.files)));

    overlay.querySelector('#doc-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    saveBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const category = overlay.querySelector('#doc-category').value;
      const expiresVal = overlay.querySelector('#doc-expires').value;
      const notes = overlay.querySelector('#doc-notes').value.trim();

      if (!name || selectedFiles.length === 0) return;

      saveBtn.disabled = true;
      saveBtn.textContent = `Subiendo ${selectedFiles.length} archivo${selectedFiles.length > 1 ? 's' : ''}...`;

      const progressWrap = overlay.querySelector('#doc-progress-wrap');
      progressWrap.innerHTML = '<div class="docs-progress"><div class="docs-progress-bar" id="doc-upload-bar"></div></div>';

      try {
        await this._saveDoc({
          name, category, files: selectedFiles,
          expiresAt: expiresVal ? new Date(expiresVal) : null,
          notes,
          progressBar: overlay.querySelector('#doc-upload-bar')
        });
        overlay.remove();
        if (typeof showToast === 'function') showToast('Documento guardado');
        this._loadDocs();
      } catch (err) {
        console.error('Error guardando doc:', err);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar';
        progressWrap.innerHTML = '';
        if (typeof showToast === 'function') showToast('Error al guardar documento');
      }
    });
  },

  // ── Subir archivos a R2 via worker + guardar metadatos en Firestore ──
  async _saveDoc({ name, category, files, expiresAt, notes, progressBar }) {
    const uid = currentUser.uid;
    const docRef = db.collection('users').doc(uid).collection('travel_docs').doc();
    const docId = docRef.id;

    const uploadedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (progressBar) progressBar.style.width = ((i / files.length) * 80) + '%';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uid', uid);
      formData.append('docId', docId);

      const res = await fetch(window.SALMA_API + '/upload-doc', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error(`Error subiendo ${file.name}`);
      const { key, url } = await res.json();
      uploadedFiles.push({ fileName: file.name, fileType: file.type || 'application/octet-stream', r2Key: key, downloadURL: url });
    }

    if (progressBar) progressBar.style.width = '90%';

    // Guardar metadatos en Firestore
    await docRef.set({
      name,
      category,
      files: uploadedFiles,
      // Compatibilidad: primer archivo como campo principal
      fileName: uploadedFiles[0].fileName,
      fileType: uploadedFiles[0].fileType,
      r2Key: uploadedFiles[0].r2Key,
      downloadURL: uploadedFiles[0].downloadURL,
      expiresAt: expiresAt ? firebase.firestore.Timestamp.fromDate(expiresAt) : null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      notes: notes || ''
    });

    if (progressBar) progressBar.style.width = '100%';
  },

  // ── Modal ver documento ──
  _openViewModal(doc) {
    const overlay = document.createElement('div');
    overlay.className = 'docs-modal-overlay';

    const cat = DOC_CATEGORIES.find(c => c.id === doc.category) || DOC_CATEGORIES[6];
    const expiry = this._getExpiryStatus(doc.expiresAt);

    let expiryRow = '';
    if (doc.expiresAt) {
      const expDate = doc.expiresAt.toDate ? doc.expiresAt.toDate() : new Date(doc.expiresAt);
      const dateStr = expDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      let badge = '';
      if (expiry) {
        badge = ` <span class="doc-card-badge doc-badge-${expiry.status}" style="position:static;display:inline-block;vertical-align:middle;margin-left:6px">${this._esc(expiry.label)}</span>`;
      }
      expiryRow = `<div class="docs-view-row"><span class="docs-view-label">Caducidad</span><span class="docs-view-value">${dateStr}${badge}</span></div>`;
    }

    let notesSection = '';
    if (doc.notes) {
      notesSection = `<div class="docs-view-notes">${this._esc(doc.notes)}</div>`;
    }

    // Archivos (soporta docs antiguos con 1 archivo y nuevos con array)
    const docFiles = doc.files || [{ fileName: doc.fileName, fileType: doc.fileType, downloadURL: doc.downloadURL, r2Key: doc.r2Key }];

    // Renderizar previews inline: imágenes directas, PDFs embebidos, otros como link
    const previewsHtml = docFiles.map(f => {
      const type = (f.fileType || '').toLowerCase();
      if (type.startsWith('image/')) {
        return `<div class="docs-preview-item"><img class="docs-preview-img" src="${f.downloadURL}" alt="${this._esc(f.fileName)}" loading="lazy"><a class="docs-preview-download" href="${f.downloadURL}" target="_blank" rel="noopener">\u{2B07}\uFE0F ${this._esc(f.fileName)}</a></div>`;
      }
      if (type === 'application/pdf') {
        return `<div class="docs-preview-item"><iframe class="docs-preview-pdf" src="${f.downloadURL}" title="${this._esc(f.fileName)}"></iframe><a class="docs-preview-download" href="${f.downloadURL}" target="_blank" rel="noopener">\u{2B07}\uFE0F ${this._esc(f.fileName)}</a></div>`;
      }
      return `<div class="docs-preview-item"><a class="docs-view-file-link" href="${f.downloadURL}" target="_blank" rel="noopener">\u{1F4CE} ${this._esc(f.fileName)}</a></div>`;
    }).join('');

    overlay.innerHTML = `<div class="docs-modal"><div class="docs-modal-handle"></div><div class="docs-modal-title">${cat.emoji} ${this._esc(doc.name)}</div><div class="docs-preview-grid">${previewsHtml}</div><div class="docs-view-info">${expiryRow}${notesSection}</div><div class="docs-modal-actions"><button class="docs-btn docs-btn-danger" id="doc-delete">Eliminar</button></div></div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#doc-delete').addEventListener('click', async () => {
      if (!confirm('¿Eliminar este documento? Se borrarán todos los archivos y no se puede deshacer.')) return;
      await this._deleteDoc(doc);
      overlay.remove();
    });
  },

  // ── Eliminar documento ──
  async _deleteDoc(doc) {
    const uid = currentUser.uid;
    try {
      // Borrar archivos de R2
      const docFiles = doc.files || (doc.r2Key ? [{ r2Key: doc.r2Key }] : []);
      for (const f of docFiles) {
        if (!f.r2Key) continue;
        try {
          await fetch(window.SALMA_API + '/delete-doc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: f.r2Key })
          });
        } catch (e) {
          console.warn('No se pudo borrar archivo de R2:', e);
        }
      }
      // Borrar metadata de Firestore
      await db.collection('users').doc(uid).collection('travel_docs').doc(doc.id).delete();
      if (typeof showToast === 'function') showToast('Documento eliminado');
      this._loadDocs();
    } catch (e) {
      console.error('Error eliminando doc:', e);
      if (typeof showToast === 'function') showToast('Error al eliminar');
    }
  },

  // ── Consultar a Salma ──
  _askSalma() {
    if (typeof showState === 'function') showState('chat');
    const $input = document.getElementById('user-input');
    if ($input) {
      $input.value = '¿Qué documentos necesito para mi próximo viaje?';
      $input.focus();
      // Disparar envío
      const sendBtn = document.getElementById('btn-send');
      if (sendBtn) setTimeout(() => sendBtn.click(), 100);
    }
  },

  // ── Utilidades ──
  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  },

  _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};
