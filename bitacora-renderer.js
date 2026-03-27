// ═══════════════════════════════════════════════════════════════
// BITÁCORA — Diario de viaje
// ═══════════════════════════════════════════════════════════════

const bitacoraRenderer = {
  _maps: {},
  _saveTimers: {},
  _currentDocId: null,
  _currentNotes: {},
  _currentPhotos: [],

  renderDiario(routeData, docId, notes, photos, docData) {
    if (!routeData || !routeData.stops) return;
    this._currentDocId = docId;
    this._currentNotes = notes || {};
    this._currentPhotos = photos || [];

    const $content = document.getElementById('app-content');
    if (!$content) return;

    const stops = routeData.stops || [];
    const days = this._groupByDay(stops);
    const totalDays = Object.keys(days).length;
    const totalStops = stops.length;
    const totalKm = stops.reduce((sum, s) => sum + (s.km_from_previous || 0), 0);
    const notesCount = Object.keys(this._currentNotes).length;
    const photosCount = this._currentPhotos.length;
    const privacy = docData?.privacy || 'private';
    const privacyLabel = privacy === 'public' ? 'Pública' : privacy === 'link' ? 'Con enlace' : 'Privada';
    const privacyIcon = privacy === 'public' ? '🌍' : privacy === 'link' ? '🔗' : '🔒';

    $content.innerHTML = `
      <div class="diario-area fade-in">
        <div class="diario-header">
          <button class="diario-back" id="diario-back">←</button>
          <div class="diario-header-info">
            <div class="diario-title">${escapeHTML(routeData.title || routeData.name || 'Mi viaje')}</div>
            <div class="diario-meta">${totalDays} días · ${Math.round(totalKm)} km · ${totalStops} paradas</div>
          </div>
        </div>

        <div class="diario-stats">
          <div class="diario-stat"><span class="diario-stat-num">${totalStops}</span><span class="diario-stat-label">paradas</span></div>
          <div class="diario-stat"><span class="diario-stat-num">${Math.round(totalKm)}</span><span class="diario-stat-label">km</span></div>
          <div class="diario-stat"><span class="diario-stat-num">${photosCount}</span><span class="diario-stat-label">fotos</span></div>
          <div class="diario-stat"><span class="diario-stat-num">${notesCount}</span><span class="diario-stat-label">notas</span></div>
        </div>

        <div class="diario-privacy">
          ${privacyIcon} ${privacyLabel}
          <button class="diario-privacy-change" id="diario-privacy-btn">Cambiar</button>
          <button class="diario-share-btn" id="diario-share-btn">Compartir</button>
        </div>

        <div class="diario-timeline" id="diario-timeline">
          ${this._renderTimeline(days, routeData.country || routeData.region || '')}
        </div>
      </div>`;

    // Events
    document.getElementById('diario-back').addEventListener('click', () => {
      this._cleanup();
      showState('bitacora');
    });

    document.getElementById('diario-privacy-btn')?.addEventListener('click', () => {
      this._togglePrivacy(docId, docData);
    });

    document.getElementById('diario-share-btn')?.addEventListener('click', () => {
      this._share(docId, docData);
    });

    // Init maps
    const firstDay = Object.keys(days).map(Number).sort((a, b) => a - b)[0];
    if (firstDay) this._initDayMap(firstDay, days[firstDay]);

    // Init note listeners
    this._initNoteListeners(docId);

    // Init photo upload listeners
    this._initPhotoUploadListeners(docId);

    // Load Google Places photos
    this._loadAllPhotos();
  },

  _groupByDay(stops) {
    const days = {};
    for (const stop of stops) {
      const d = stop.day || 1;
      if (!days[d]) days[d] = { title: stop.day_title || '', stops: [] };
      days[d].stops.push(stop);
    }
    return days;
  },

  _renderTimeline(days, country) {
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
    return dayNums.map(dayNum => {
      const day = days[dayNum];
      return `
        <div class="diario-day" data-day="${dayNum}">
          <div class="diario-day-header">
            <div class="diario-day-num">DÍA ${dayNum}</div>
            <div class="diario-day-title">${escapeHTML(day.title || '')}</div>
          </div>
          <div class="diario-day-map" id="diario-map-day-${dayNum}"></div>
          <div class="diario-day-note">
            <textarea class="diario-note-input diario-note-day" data-key="day_${dayNum}_general" placeholder="Nota del día...">${escapeHTML(this._currentNotes['day_' + dayNum + '_general'] || '')}</textarea>
          </div>
          <div class="diario-day-stops">
            ${day.stops.map((stop, idx) => this._renderStop(stop, dayNum, idx)).join('')}
          </div>
        </div>`;
    }).join('');
  },

  _renderStop(stop, dayNum, idx) {
    const noteKey = `day_${dayNum}_stop_${idx}`;
    const note = this._currentNotes[noteKey] || '';
    const userPhotos = this._currentPhotos.filter(p => p.day === dayNum && p.stop === idx);
    const hasNote = note.length > 0;

    return `
      <div class="diario-stop">
        <div class="diario-stop-marker"></div>
        <div class="diario-stop-content">
          <div class="diario-stop-name">${escapeHTML(stop.name || stop.headline || '')}</div>
          ${stop.narrative ? `<div class="diario-stop-narrative">${escapeHTML(stop.narrative)}</div>` : ''}

          <div class="diario-stop-photos">
            ${stop.photo_ref ? `<div class="diario-photo-google" data-ref="${escapeHTML(stop.photo_ref)}"><div class="diario-photo-placeholder">Cargando foto...</div></div>` : ''}
            ${userPhotos.map(p => `<div class="diario-photo-user"><img src="${escapeHTML(p.url)}" alt="Mi foto"><div class="diario-photo-caption">${escapeHTML(p.caption || '')}</div></div>`).join('')}
          </div>

          <div class="diario-stop-actions">
            <label class="diario-upload-btn">
              <input type="file" accept="image/*" capture="environment" class="diario-photo-input" data-day="${dayNum}" data-stop="${idx}" style="display:none">
              📷 Foto
            </label>
            <button class="diario-note-toggle ${hasNote ? 'has-note' : ''}" data-key="${noteKey}">📝 ${hasNote ? 'Nota' : 'Nota'}</button>
          </div>

          <div class="diario-stop-note ${hasNote ? 'open' : ''}" data-key="${noteKey}">
            <textarea class="diario-note-input" data-key="${noteKey}" placeholder="Escribe tu nota...">${escapeHTML(note)}</textarea>
            <div class="diario-note-status" id="note-status-${noteKey}"></div>
          </div>
        </div>
      </div>`;
  },

  // ═══ NOTAS ═══

  _initNoteListeners(docId) {
    document.querySelectorAll('.diario-note-input').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        const value = e.target.value;
        this._currentNotes[key] = value;
        this._debounceSaveNote(docId, key, value);
      });
    });

    document.querySelectorAll('.diario-note-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        const noteDiv = document.querySelector(`.diario-stop-note[data-key="${key}"]`);
        if (noteDiv) {
          noteDiv.classList.toggle('open');
          if (noteDiv.classList.contains('open')) {
            noteDiv.querySelector('textarea')?.focus();
          }
        }
      });
    });
  },

  _debounceSaveNote(docId, key, value) {
    if (this._saveTimers[key]) clearTimeout(this._saveTimers[key]);
    const statusEl = document.getElementById('note-status-' + key);
    if (statusEl) statusEl.textContent = '...';

    this._saveTimers[key] = setTimeout(async () => {
      try {
        const notesUpdate = {};
        notesUpdate['notes.' + key] = value;
        await db.collection('users').doc(currentUser.uid)
          .collection('maps').doc(docId).update(notesUpdate);
        if (statusEl) statusEl.textContent = '✓';
        setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2000);
      } catch (e) {
        console.error('Error guardando nota:', e);
        if (statusEl) statusEl.textContent = 'Error';
      }
    }, 2000);
  },

  // ═══ FOTOS ═══

  _initPhotoUploadListeners(docId) {
    document.querySelectorAll('.diario-photo-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const dayNum = parseInt(input.dataset.day);
        const stopIdx = parseInt(input.dataset.stop);
        await this._uploadPhoto(file, docId, dayNum, stopIdx);
      });
    });
  },

  async _uploadPhoto(file, docId, dayNum, stopIdx) {
    // Comprimir imagen
    const compressed = await this._compressImage(file, 1200, 0.8);

    // Subir a R2 via worker
    const formData = new FormData();
    formData.append('photo', compressed);
    formData.append('uid', currentUser.uid);
    formData.append('mapId', docId);
    formData.append('day', dayNum);
    formData.append('stop', stopIdx);

    try {
      const res = await fetch(window.SALMA_API + '/upload-photo', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      // Guardar ref en Firestore
      const photoEntry = {
        key: data.key,
        url: data.url,
        day: dayNum,
        stop: stopIdx,
        caption: '',
        uploadedAt: new Date().toISOString()
      };
      this._currentPhotos.push(photoEntry);

      await db.collection('users').doc(currentUser.uid)
        .collection('maps').doc(docId).update({
          photos: this._currentPhotos
        });

      // Re-render la parada
      showToast('Foto subida');
      // Refresh diario
      const docSnap = await db.collection('users').doc(currentUser.uid)
        .collection('maps').doc(docId).get();
      const d = docSnap.data();
      let route = null;
      try { route = JSON.parse(d.itinerarioIA || '{}'); } catch (_) {}
      if (route) this.renderDiario(route, docId, d.notes || {}, d.photos || [], d);
    } catch (e) {
      console.error('Error subiendo foto:', e);
      showToast('Error al subir foto');
    }
  },

  _compressImage(file, maxWidth, quality) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // ═══ FOTOS GOOGLE PLACES ═══

  _loadAllPhotos() {
    document.querySelectorAll('.diario-photo-google[data-ref]').forEach(el => {
      const ref = el.dataset.ref;
      if (!ref) return;
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${ref}&key=AIzaSyBSgOFqIjB1EHjiRKVGPSg6sNBaqxbptTE`;
      el.innerHTML = `<img src="${url}" alt="Foto" loading="lazy" onerror="this.parentElement.style.display='none'">`;
    });
  },

  // ═══ MAPAS ═══

  _initDayMap(dayNum, dayData) {
    const mapId = 'diario-map-day-' + dayNum;
    const el = document.getElementById(mapId);
    if (!el || this._maps[mapId]) return;
    if (typeof L === 'undefined') return;

    const stops = dayData.stops || dayData;
    const validStops = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01);
    if (validStops.length === 0) { el.style.display = 'none'; return; }

    el.style.height = '200px';
    const map = L.map(mapId, { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const bounds = [];
    validStops.forEach((s, i) => {
      const color = i === 0 ? '#d4a843' : '#888';
      L.circleMarker([s.lat, s.lng], { radius: 6, fillColor: color, color: '#222', weight: 1, fillOpacity: 0.9 })
        .bindTooltip(s.name || '', { direction: 'top' })
        .addTo(map);
      bounds.push([s.lat, s.lng]);
    });

    if (validStops.length > 1) {
      L.polyline(bounds, { color: '#d4a843', weight: 2, opacity: 0.6 }).addTo(map);
    }
    map.fitBounds(bounds, { padding: [20, 20] });
    this._maps[mapId] = map;
  },

  // ═══ PRIVACIDAD ═══

  _togglePrivacy(docId, docData) {
    const levels = ['private', 'link', 'public'];
    const current = docData?.privacy || 'private';
    const next = levels[(levels.indexOf(current) + 1) % levels.length];
    const labels = { private: 'Privada', link: 'Con enlace', public: 'Pública' };
    const icons = { private: '🔒', link: '🔗', public: '🌍' };

    db.collection('users').doc(currentUser.uid)
      .collection('maps').doc(docId).update({ privacy: next })
      .then(() => {
        docData.privacy = next;
        const el = document.querySelector('.diario-privacy');
        if (el) el.innerHTML = `${icons[next]} ${labels[next]} <button class="diario-privacy-change" id="diario-privacy-btn">Cambiar</button> <button class="diario-share-btn" id="diario-share-btn">Compartir</button>`;
        document.getElementById('diario-privacy-btn')?.addEventListener('click', () => this._togglePrivacy(docId, docData));
        document.getElementById('diario-share-btn')?.addEventListener('click', () => this._share(docId, docData));
        showToast(icons[next] + ' ' + labels[next]);
      });
  },

  // ═══ COMPARTIR ═══

  _share(docId, docData) {
    const slug = docData?.slug;
    if (!slug) {
      showToast('Guarda la guía primero');
      return;
    }
    const url = 'https://borradodelmapa.com/' + slug;
    if (navigator.share) {
      navigator.share({ title: docData.nombre || 'Mi viaje', url });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Enlace copiado');
    }
  },

  // ═══ LIMPIEZA ═══

  _cleanup() {
    for (const key of Object.keys(this._maps)) {
      try { this._maps[key].remove(); } catch (_) {}
    }
    this._maps = {};
    for (const key of Object.keys(this._saveTimers)) {
      clearTimeout(this._saveTimers[key]);
    }
    this._saveTimers = {};
  }
};
