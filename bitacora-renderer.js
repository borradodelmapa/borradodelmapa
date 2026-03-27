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

        <div class="diario-map-main" id="diario-map-main"></div>

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

    // Init main map (toda la ruta)
    this._initMainMap(stops);

    // Init day maps
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
    for (const d of dayNums) {
      this._initDayMap(d, days[d]);
    }

    // Init note listeners
    this._initNoteListeners(docId);

    // Init photo upload listeners
    this._initPhotoUploadListeners(docId);

    // Init photo delete listeners
    this._initPhotoDeleteListeners(docId, routeData, docData);

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
            ${userPhotos.map((p, pi) => `<div class="diario-photo-user" data-photo-key="${escapeHTML(p.key)}"><img src="${escapeHTML(p.url)}" alt="Mi foto"><button class="diario-photo-delete" data-key="${escapeHTML(p.key)}" title="Eliminar foto">✕</button>${p.caption ? `<div class="diario-photo-caption">${escapeHTML(p.caption)}</div>` : ''}</div>`).join('')}
          </div>

          <div class="diario-stop-actions">
            <label class="diario-upload-btn">
              <input type="file" accept="image/*" capture="environment" class="diario-photo-input diario-photo-camera" data-day="${dayNum}" data-stop="${idx}" style="display:none">
              📷
            </label>
            <label class="diario-upload-btn">
              <input type="file" accept="image/*" multiple class="diario-photo-input diario-photo-gallery" data-day="${dayNum}" data-stop="${idx}" style="display:none">
              🖼️
            </label>
            <button class="diario-note-toggle ${hasNote ? 'has-note' : ''}" data-key="${noteKey}">📝</button>
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
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const dayNum = parseInt(input.dataset.day);
        const stopIdx = parseInt(input.dataset.stop);

        // Límite 5 fotos por parada
        const existing = this._currentPhotos.filter(p => p.day === dayNum && p.stop === stopIdx).length;
        const allowed = Math.min(files.length, 5 - existing);
        if (allowed <= 0) {
          showToast('Máximo 5 fotos por parada');
          return;
        }
        if (allowed < files.length) {
          showToast(`Solo se suben ${allowed} fotos (límite 5 por parada)`);
        }

        for (let i = 0; i < allowed; i++) {
          await this._uploadPhoto(files[i], docId, dayNum, stopIdx);
        }
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

  _initPhotoDeleteListeners(docId, routeData, docData) {
    document.querySelectorAll('.diario-photo-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const key = btn.dataset.key;
        if (!key || !confirm('¿Eliminar esta foto?')) return;

        // Quitar del array local
        this._currentPhotos = this._currentPhotos.filter(p => p.key !== key);

        // Actualizar Firestore
        try {
          await db.collection('users').doc(currentUser.uid)
            .collection('maps').doc(docId).update({ photos: this._currentPhotos });
          // Eliminar de R2
          fetch(window.SALMA_API + '/delete-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
          }).catch(() => {});
          // Quitar del DOM
          const photoEl = btn.closest('.diario-photo-user');
          if (photoEl) photoEl.remove();
          showToast('Foto eliminada');
        } catch (err) {
          showToast('Error al eliminar');
        }
      });
    });
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
      el.innerHTML = '<div class="diario-photo-placeholder">Cargando...</div>';
      fetch(window.SALMA_API + '/photo?ref=' + encodeURIComponent(ref) + '&json=1')
        .then(r => r.json())
        .then(data => {
          if (data.url) {
            el.innerHTML = `<img src="${data.url}" alt="Foto" loading="lazy">`;
          } else {
            el.style.display = 'none';
          }
        })
        .catch(() => { el.style.display = 'none'; });
    });
  },

  // ═══ MAPAS ═══

  _initMainMap(stops) {
    const el = document.getElementById('diario-map-main');
    if (!el || this._maps['main']) return;
    if (typeof L === 'undefined') return;

    const validStops = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01);
    if (validStops.length === 0) { el.style.display = 'none'; return; }

    el.style.height = '250px';
    el.style.borderRadius = '12px';
    el.style.overflow = 'hidden';
    el.style.marginBottom = '16px';

    const map = L.map('diario-map-main', { zoomControl: true, attributionControl: false, dragging: false, scrollWheelZoom: false, touchZoom: true, doubleClickZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const bounds = [];
    const dayColors = ['#d4a843', '#e8734a', '#4a9de8', '#6dd45a', '#d44a9d', '#9d4ae8', '#e8c84a', '#4ae8c8'];

    validStops.forEach((s, i) => {
      const dayIdx = (s.day || 1) - 1;
      const color = dayColors[dayIdx % dayColors.length];
      L.circleMarker([s.lat, s.lng], {
        radius: 7, fillColor: color, color: '#222', weight: 2, fillOpacity: 0.9
      }).bindTooltip(`Día ${s.day}: ${s.name || ''}`, { direction: 'top' }).addTo(map);
      bounds.push([s.lat, s.lng]);
    });

    // Línea de ruta
    if (bounds.length > 1) {
      L.polyline(bounds, { color: '#d4a843', weight: 2, opacity: 0.5, dashArray: '5,8' }).addTo(map);
    }

    map.fitBounds(bounds, { padding: [30, 30] });
    this._maps['main'] = map;
  },

  _initDayMap(dayNum, dayData) {
    const mapId = 'diario-map-day-' + dayNum;
    const el = document.getElementById(mapId);
    if (!el || this._maps[mapId]) return;
    if (typeof L === 'undefined') return;

    const stops = dayData.stops || dayData;
    const validStops = stops.filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01);
    if (validStops.length === 0) { el.style.display = 'none'; return; }

    el.style.height = '200px';
    const map = L.map(mapId, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, touchZoom: true, doubleClickZoom: true });
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

  async _togglePrivacy(docId, docData) {
    const levels = ['private', 'link', 'public'];
    const current = docData?.privacy || 'private';
    const next = levels[(levels.indexOf(current) + 1) % levels.length];
    const labels = { private: 'Privada', link: 'Con enlace', public: 'Pública' };
    const icons = { private: '🔒', link: '🔗', public: '🌍' };

    try {
      // Actualizar privacidad en la guía del usuario
      await db.collection('users').doc(currentUser.uid)
        .collection('maps').doc(docId).update({ privacy: next });
      docData.privacy = next;

      // Si pasa a enlace o público, publicar/actualizar en public_guides
      if (next !== 'private') {
        let slug = docData.slug;
        if (!slug) {
          // Generar slug
          const title = docData.nombre || docData.destino || 'mi-viaje';
          slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60)
            + '-' + Math.random().toString(36).substring(2, 6);
          docData.slug = slug;
          await db.collection('users').doc(currentUser.uid)
            .collection('maps').doc(docId).update({ slug, published: true });
        }
        // Copiar a public_guides con notas y fotos actualizadas
        await db.collection('public_guides').doc(slug).set({
          slug,
          ownerDocId: docId,
          nombre: docData.nombre || docData.destino || 'Mi viaje',
          destino: docData.destino,
          num_dias: docData.num_dias,
          summary: docData.notas || '',
          cover_image: docData.cover_image || '',
          itinerarioIA: docData.itinerarioIA,
          notes: this._currentNotes || {},
          photos: this._currentPhotos || [],
          privacy: next,
          owner_name: currentUser?.name || currentUser?.displayName || 'Viajero',
          createdAt: docData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        showToast(icons[next] + ' ' + labels[next] + ' — enlace listo');
      } else {
        // Si vuelve a privada, eliminar de public_guides
        if (docData.slug) {
          await db.collection('public_guides').doc(docData.slug).delete().catch(() => {});
        }
        showToast(icons[next] + ' ' + labels[next]);
      }

      // Actualizar UI
      const el = document.querySelector('.diario-privacy');
      if (el) {
        const urlText = docData.slug && next !== 'private' ? `<div style="font-size:10px;margin-top:4px;word-break:break-all;"><a href="https://borradodelmapa.com/${docData.slug}" target="_blank" rel="noopener" onclick="window.open(this.href);return false;" style="color:var(--dorado);text-decoration:underline;">borradodelmapa.com/${docData.slug}</a></div>` : '';
        el.innerHTML = `${icons[next]} ${labels[next]} <button class="diario-privacy-change" id="diario-privacy-btn">Cambiar</button> <button class="diario-share-btn" id="diario-share-btn">Compartir</button>${urlText}`;
      }
      document.getElementById('diario-privacy-btn')?.addEventListener('click', () => this._togglePrivacy(docId, docData));
      document.getElementById('diario-share-btn')?.addEventListener('click', () => this._share(docId, docData));
    } catch (e) {
      console.error('Error cambiando privacidad:', e);
      showToast('Error al cambiar privacidad');
    }
  },

  // ═══ COMPARTIR ═══

  _share(docId, docData) {
    // Cerrar menú si ya existe
    const existing = document.querySelector('.diario-share-menu');
    if (existing) { existing.remove(); return; }

    const slug = docData?.slug;
    const url = slug ? 'https://borradodelmapa.com/' + slug : 'https://borradodelmapa.com';

    const menu = document.createElement('div');
    menu.className = 'diario-share-menu';
    menu.innerHTML = `
      ${url ? `<button class="diario-share-option" data-action="link">🔗 Copiar enlace</button>` : ''}
      ${url && navigator.share ? `<button class="diario-share-option" data-action="native">📤 Compartir</button>` : ''}
      <button class="diario-share-option" data-action="instagram-post">📸 Instagram Post</button>
      <button class="diario-share-option" data-action="instagram-story">📱 Instagram Story</button>
      <button class="diario-share-option" data-action="carousel">🎠 Carrusel</button>
    `;

    const shareBtn = document.getElementById('diario-share-btn');
    if (shareBtn) shareBtn.parentElement.appendChild(menu);

    menu.addEventListener('click', async (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      menu.remove();

      if (action === 'link' && url) {
        try {
          if (navigator.clipboard) { await navigator.clipboard.writeText(url); }
          else { const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        } catch (_) {}
        showToast('Enlace copiado');
      } else if (action === 'native' && url) {
        navigator.share({ title: docData.nombre || 'Mi viaje', url });
      } else if (action === 'instagram-post') {
        await this._generateShareImage('post', docData);
      } else if (action === 'instagram-story') {
        await this._generateShareImage('story', docData);
      } else if (action === 'carousel') {
        await this._generateCarousel(docData);
      }
    });

    // Cerrar al click fuera
    setTimeout(() => {
      const close = (e) => { if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); } };
      document.addEventListener('click', close);
    }, 100);
  },

  // ═══ CANVAS — IMÁGENES PARA REDES ═══

  async _generateShareImage(format, docData) {
    const route = this._getCurrentRoute(docData);
    if (!route) return;

    const isStory = format === 'story';
    const w = isStory ? 1080 : 1080;
    const h = isStory ? 1920 : 1350;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Fondo degradado oscuro
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a0a');
    grad.addColorStop(0.5, '#111');
    grad.addColorStop(1, '#050505');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Intentar cargar foto de portada
    const coverUrl = docData.cover_image;
    if (coverUrl) {
      try {
        const img = await this._loadImageAsync(coverUrl);
        // Foto ocupa la mitad superior
        const imgH = isStory ? h * 0.55 : h * 0.5;
        ctx.save();
        ctx.globalAlpha = 0.7;
        const scale = Math.max(w / img.width, imgH / img.height);
        const dx = (w - img.width * scale) / 2;
        const dy = (imgH - img.height * scale) / 2;
        ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
        ctx.restore();

        // Degradado sobre la foto
        const fadeGrad = ctx.createLinearGradient(0, imgH * 0.5, 0, imgH);
        fadeGrad.addColorStop(0, 'rgba(10,10,10,0)');
        fadeGrad.addColorStop(1, 'rgba(10,10,10,1)');
        ctx.fillStyle = fadeGrad;
        ctx.fillRect(0, imgH * 0.5, w, imgH * 0.5);
      } catch (_) {}
    }

    // Título
    const textY = isStory ? h * 0.58 : h * 0.55;
    ctx.fillStyle = '#d4a843';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📍 ' + (route.region || route.country || '').toUpperCase(), w / 2, textY);

    // Nombre de la ruta
    ctx.fillStyle = '#f4efe6';
    ctx.font = 'bold 48px Inter, sans-serif';
    const title = route.title || route.name || docData.nombre || 'Mi viaje';
    this._wrapText(ctx, title, w / 2, textY + 60, w - 120, 56);

    // Stats
    const stops = route.stops || [];
    const totalKm = Math.round(stops.reduce((s, st) => s + (st.km_from_previous || 0), 0));
    const days = route.duration_days || new Set(stops.map(s => s.day)).size;
    ctx.fillStyle = 'rgba(244,239,230,0.5)';
    ctx.font = '500 24px Inter, sans-serif';
    ctx.fillText(`${days} días · ${stops.length} paradas · ${totalKm} km`, w / 2, textY + 180);

    // Nota del usuario (primera que encuentre)
    const firstNote = this._getFirstNote(docData.notes);
    if (firstNote) {
      ctx.fillStyle = 'rgba(244,239,230,0.6)';
      ctx.font = 'italic 26px Inter, sans-serif';
      this._wrapText(ctx, '"' + firstNote + '"', w / 2, textY + 240, w - 160, 34);
    }

    // Branding
    ctx.fillStyle = 'rgba(212,168,67,0.4)';
    ctx.font = '600 18px JetBrains Mono, monospace';
    ctx.fillText('borradodelmapa.com', w / 2, h - 40);

    // Línea dorada decorativa
    ctx.strokeStyle = 'rgba(212,168,67,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h - 70);
    ctx.lineTo(w * 0.7, h - 70);
    ctx.stroke();

    this._downloadCanvas(canvas, `${(route.title || 'viaje').replace(/\s+/g, '-')}-${format}.png`);
    showToast('Imagen descargada');
  },

  async _generateCarousel(docData) {
    const route = this._getCurrentRoute(docData);
    if (!route) return;

    const stops = route.stops || [];
    const days = {};
    stops.forEach(s => {
      const d = s.day || 1;
      if (!days[d]) days[d] = { title: s.day_title || '', stops: [] };
      days[d].stops.push(s);
    });

    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);
    const w = 1080, h = 1080;
    let slideNum = 0;

    // Slide 1: portada
    const c1 = document.createElement('canvas');
    c1.width = w; c1.height = h;
    const ctx1 = c1.getContext('2d');
    const grad1 = ctx1.createLinearGradient(0, 0, 0, h);
    grad1.addColorStop(0, '#111');
    grad1.addColorStop(1, '#050505');
    ctx1.fillStyle = grad1;
    ctx1.fillRect(0, 0, w, h);

    ctx1.fillStyle = '#d4a843';
    ctx1.font = 'bold 24px Inter';
    ctx1.textAlign = 'center';
    ctx1.fillText('📍 ' + (route.country || '').toUpperCase(), w / 2, h * 0.35);
    ctx1.fillStyle = '#f4efe6';
    ctx1.font = 'bold 56px Inter';
    this._wrapText(ctx1, route.title || 'Mi viaje', w / 2, h * 0.45, w - 120, 64);
    ctx1.fillStyle = 'rgba(244,239,230,0.4)';
    ctx1.font = '500 22px Inter';
    const totalKm = Math.round(stops.reduce((s, st) => s + (st.km_from_previous || 0), 0));
    ctx1.fillText(`${dayNums.length} días · ${stops.length} paradas · ${totalKm} km`, w / 2, h * 0.62);
    ctx1.fillStyle = 'rgba(212,168,67,0.4)';
    ctx1.font = '600 16px JetBrains Mono';
    ctx1.fillText('borradodelmapa.com', w / 2, h - 40);

    this._downloadCanvas(c1, `carrusel-00-portada.png`);

    // Slides por día (máx 9 para Instagram)
    for (const dayNum of dayNums.slice(0, 9)) {
      slideNum++;
      const day = days[dayNum];
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(1, '#080808');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Número de día
      ctx.fillStyle = 'rgba(212,168,67,0.2)';
      ctx.font = 'bold 200px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(dayNum, w / 2, h * 0.25);

      // Título del día
      ctx.fillStyle = '#d4a843';
      ctx.font = 'bold 20px JetBrains Mono';
      ctx.fillText(`DÍA ${dayNum}`, w / 2, h * 0.35);
      ctx.fillStyle = '#f4efe6';
      ctx.font = 'bold 36px Inter';
      ctx.fillText(day.title || '', w / 2, h * 0.42);

      // Paradas del día
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(244,239,230,0.7)';
      ctx.font = '500 22px Inter';
      let y = h * 0.52;
      for (const stop of day.stops.slice(0, 5)) {
        ctx.fillStyle = '#d4a843';
        ctx.fillText('●', 100, y);
        ctx.fillStyle = 'rgba(244,239,230,0.8)';
        ctx.fillText(stop.name || '', 130, y);
        y += 40;
      }

      // Nota del día si existe
      const dayNote = docData.notes?.['day_' + dayNum + '_general'];
      if (dayNote) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(244,239,230,0.5)';
        ctx.font = 'italic 20px Inter';
        this._wrapText(ctx, '"' + dayNote + '"', w / 2, h * 0.82, w - 200, 28);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(212,168,67,0.3)';
      ctx.font = '600 14px JetBrains Mono';
      ctx.fillText('borradodelmapa.com', w / 2, h - 30);

      this._downloadCanvas(c, `carrusel-${String(slideNum).padStart(2, '0')}-dia${dayNum}.png`);
    }

    showToast(`${slideNum + 1} imágenes descargadas`);
  },

  _getCurrentRoute(docData) {
    try {
      if (docData.itinerarioIA) return JSON.parse(docData.itinerarioIA);
    } catch (_) {}
    // Fallback: buscar en currentRoute del renderer
    const stops = document.querySelectorAll('.diario-stop');
    return stops.length > 0 ? { stops: [], title: docData.nombre } : null;
  },

  _getFirstNote(notes) {
    if (!notes) return null;
    for (const key of Object.keys(notes)) {
      if (notes[key] && notes[key].trim()) return notes[key].trim().slice(0, 120);
    }
    return null;
  },

  _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line.trim(), x, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), x, y);
  },

  _loadImageAsync(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  },

  _downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
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
