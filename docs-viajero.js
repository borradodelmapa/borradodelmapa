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

  // ── Grid de tarjetas ──
  _renderGrid() {
    const wrap = document.getElementById('docs-grid-wrap');
    if (!wrap) return;

    if (this._docs.length === 0) {
      wrap.innerHTML = `<div class="docs-empty"><div class="docs-empty-icon">\u{1F5C4}\uFE0F</div><div class="docs-empty-text">Aún no tienes documentos guardados.<br>Sube tu pasaporte, visados, seguros...</div><div class="docs-grid"><div class="doc-card doc-card-add" id="doc-add-empty"><div class="doc-card-add-icon">+</div><div class="doc-card-add-label">Añadir documento</div></div></div></div>`;
      document.getElementById('doc-add-empty').addEventListener('click', () => this._openAddModal());
      return;
    }

    let html = '<div class="docs-grid">';
    this._docs.forEach(doc => {
      const cat = DOC_CATEGORIES.find(c => c.id === doc.category) || DOC_CATEGORIES[6];
      const expiry = this._getExpiryStatus(doc.expiresAt);
      let badge = '';
      if (expiry) {
        badge = `<span class="doc-card-badge doc-badge-${expiry.status}">${this._esc(expiry.label)}</span>`;
      }
      html += `<div class="doc-card" data-doc-id="${doc.id}"><span class="doc-card-emoji">${cat.emoji}</span><div class="doc-card-name">${this._esc(doc.name)}</div><div class="doc-card-cat">${this._esc(cat.label)}</div>${badge}</div>`;
    });
    html += `<div class="doc-card doc-card-add" id="doc-add-btn"><div class="doc-card-add-icon">+</div><div class="doc-card-add-label">Añadir</div></div></div>`;
    wrap.innerHTML = html;

    // Listeners
    wrap.querySelectorAll('.doc-card[data-doc-id]').forEach(card => {
      card.addEventListener('click', () => {
        const doc = this._docs.find(d => d.id === card.dataset.docId);
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

    overlay.innerHTML = `<div class="docs-modal"><div class="docs-modal-handle"></div><div class="docs-modal-title">Nuevo documento</div><div class="docs-field"><label class="docs-label">Nombre *</label><input class="docs-input" id="doc-name" type="text" placeholder="Ej: Pasaporte España" maxlength="100"></div><div class="docs-field"><label class="docs-label">Categoría *</label><select class="docs-select" id="doc-category">${catOptions}</select></div><div class="docs-field"><label class="docs-label">Archivo *</label><div class="docs-file-area" id="doc-file-area"><div class="docs-file-icon">\u{1F4CE}</div><div class="docs-file-text">Pulsa para seleccionar archivo</div><div class="docs-file-name" id="doc-file-name"></div><div class="docs-file-size" id="doc-file-size"></div><div class="docs-file-error" id="doc-file-error"></div><input type="file" id="doc-file-input" accept="*"></div></div><div class="docs-field"><label class="docs-label">Fecha de caducidad</label><input class="docs-input" id="doc-expires" type="date"></div><div class="docs-field"><label class="docs-label">Notas</label><textarea class="docs-textarea" id="doc-notes" placeholder="Opcional" rows="2" maxlength="500"></textarea></div><div id="doc-progress-wrap"></div><div class="docs-modal-actions"><button class="docs-btn docs-btn-secondary" id="doc-cancel">Cancelar</button><button class="docs-btn docs-btn-primary" id="doc-save" disabled>Guardar</button></div></div>`;

    document.body.appendChild(overlay);

    let selectedFile = null;

    const fileInput = overlay.querySelector('#doc-file-input');
    const nameInput = overlay.querySelector('#doc-name');
    const saveBtn = overlay.querySelector('#doc-save');

    const updateSaveState = () => {
      const hasName = nameInput.value.trim().length > 0;
      saveBtn.disabled = !(hasName && selectedFile);
    };

    nameInput.addEventListener('input', updateSaveState);

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        overlay.querySelector('#doc-file-error').textContent = 'El archivo supera 10 MB';
        overlay.querySelector('#doc-file-name').textContent = '';
        overlay.querySelector('#doc-file-size').textContent = '';
        selectedFile = null;
        updateSaveState();
        return;
      }

      selectedFile = file;
      overlay.querySelector('#doc-file-error').textContent = '';
      overlay.querySelector('#doc-file-name').textContent = file.name;
      overlay.querySelector('#doc-file-size').textContent = this._formatSize(file.size);
      updateSaveState();
    });

    overlay.querySelector('#doc-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    saveBtn.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      const category = overlay.querySelector('#doc-category').value;
      const expiresVal = overlay.querySelector('#doc-expires').value;
      const notes = overlay.querySelector('#doc-notes').value.trim();

      if (!name || !selectedFile) return;

      saveBtn.disabled = true;
      saveBtn.textContent = 'Subiendo...';

      const progressWrap = overlay.querySelector('#doc-progress-wrap');
      progressWrap.innerHTML = '<div class="docs-progress"><div class="docs-progress-bar" id="doc-upload-bar"></div></div>';

      try {
        await this._saveDoc({
          name, category, file: selectedFile,
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

  // ── Subir archivo a Firebase Storage + guardar en Firestore ──
  async _saveDoc({ name, category, file, expiresAt, notes, progressBar }) {
    const uid = currentUser.uid;
    const docRef = db.collection('users').doc(uid).collection('travel_docs').doc();
    const docId = docRef.id;
    const storagePath = `users/${uid}/docs/${docId}/${file.name}`;

    const storageRef = firebase.storage().ref(storagePath);
    const uploadTask = storageRef.put(file);

    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressBar) progressBar.style.width = pct + '%';
        },
        reject,
        resolve
      );
    });

    const downloadURL = await storageRef.getDownloadURL();

    await docRef.set({
      name,
      category,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      storagePath,
      downloadURL,
      expiresAt: expiresAt ? firebase.firestore.Timestamp.fromDate(expiresAt) : null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      notes: notes || ''
    });
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

    overlay.innerHTML = `<div class="docs-modal"><div class="docs-modal-handle"></div><div class="docs-modal-title">${cat.emoji} ${this._esc(doc.name)}</div><div class="docs-view-info"><div class="docs-view-row"><span class="docs-view-label">Categoría</span><span class="docs-view-value">${this._esc(cat.label)}</span></div><div class="docs-view-row"><span class="docs-view-label">Archivo</span><span class="docs-view-value">${this._esc(doc.fileName)}</span></div>${expiryRow}${notesSection}</div><div class="docs-modal-actions"><button class="docs-btn docs-btn-danger" id="doc-delete">Eliminar</button><a class="docs-btn docs-btn-primary" id="doc-download" href="${doc.downloadURL}" target="_blank" rel="noopener" style="text-decoration:none;display:flex;align-items:center;justify-content:center">Ver / Descargar</a></div></div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#doc-delete').addEventListener('click', async () => {
      if (!confirm('¿Eliminar este documento? Se borrará el archivo y no se puede deshacer.')) return;
      await this._deleteDoc(doc);
      overlay.remove();
    });
  },

  // ── Eliminar documento ──
  async _deleteDoc(doc) {
    const uid = currentUser.uid;
    try {
      // Borrar archivo de Storage
      if (doc.storagePath) {
        try {
          await firebase.storage().ref(doc.storagePath).delete();
        } catch (e) {
          console.warn('No se pudo borrar archivo de Storage:', e);
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
