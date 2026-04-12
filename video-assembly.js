/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — video-assembly.js
   Smart Assembly: selección inteligente de fotos
   para generación automática de vídeo (1 tap)
   ═══════════════════════════════════════════ */

const videoAssembly = {

  _routeCache: {},  // docId → { routeData, routeDoc }

  /**
   * Ensambla fotos + params listos para videoPlayer.init()
   * @param {Object} config
   * @param {string} config.source - 'route'|'album'|'gallery'|'day'|'pins'|'custom'
   * @param {string} [config.id] - docId (route/day) o albumId (album)
   * @param {number} [config.dayNum] - nº de día (source='day')
   * @param {Array}  [config.photos] - fotos pre-seleccionadas (source='custom')
   * @param {Object} [config.routeData] - itinerarioIA ya parseado (opcional)
   * @returns {Promise<{photoUrls:string[], params:Object, photoCount:number}|null>}
   */
  async assemble(config) {
    const uid = typeof currentUser !== 'undefined' && currentUser ? currentUser.uid : null;
    if (!uid || typeof db === 'undefined') return null;

    try {
      // 1. Obtener fotos según fuente
      let photos = config.source === 'custom'
        ? (config.photos || []).slice()
        : await this._fetchPhotos(config.source, config.id, config.dayNum, uid);

      // 2. Filtrar y ordenar
      photos = this._filterAndSort(photos);
      if (photos.length < 3) return null;

      // 3. Cargar datos de ruta si aplica
      let routeData = config.routeData || null;
      let routeDoc = null;
      if (!routeData && (config.source === 'route' || config.source === 'day') && config.id) {
        const cached = await this._loadRouteDoc(config.id, uid);
        routeData = cached.routeData;
        routeDoc = cached.routeDoc;
      }

      // 4. Determinar estilo y máximo
      const hasRealStops = routeData && routeData.stops && routeData.stops.filter(s => s.lat && s.lng).length >= 2;
      const { style, maxPhotos } = this._determineStyle(photos.length, hasRealStops);

      // 5. Seleccionar las mejores
      const maxPerDay = photos.length > 15 ? 2 : 4;
      let selected = this._selectBest(photos, maxPerDay);
      if (selected.length > maxPhotos) selected = selected.slice(0, maxPhotos);
      if (selected.length < 3) return null;

      // 6. Generar título y stops
      const titulo = this._generateTitle(config.source, config, routeData, routeDoc);
      const stops = this._extractStops(config.source, routeData, selected);

      return {
        photoUrls: selected.map(p => p.url),
        params: { titulo, highlight: '', style, stops },
        photoCount: selected.length
      };
    } catch (e) {
      console.warn('[VideoAssembly] Error:', e.message);
      return null;
    }
  },

  // ═══ FETCH FOTOS ═══

  async _fetchPhotos(source, id, dayNum, uid) {
    const photos = [];

    if (source === 'route' && id) {
      // Fotos de galería central con routeId
      const snap = await db.collection('users').doc(uid)
        .collection('fotos').where('routeId', '==', id)
        .orderBy('createdAt', 'desc').limit(60).get();
      snap.forEach(d => photos.push({ id: d.id, ...d.data() }));

      // Merge con fotos del documento de ruta
      try {
        const routeSnap = await db.collection('users').doc(uid)
          .collection('maps').doc(id).get();
        if (routeSnap.exists) {
          const rPhotos = routeSnap.data().photos || [];
          for (const rp of rPhotos) {
            if (rp.url && !photos.some(p => p.url === rp.url)) {
              photos.push({ ...rp, createdAt: rp.uploadedAt || rp.createdAt || '' });
            }
          }
        }
      } catch (_) {}

    } else if (source === 'album' && id) {
      const snap = await db.collection('users').doc(uid)
        .collection('fotos').where('albumId', '==', id)
        .orderBy('createdAt', 'desc').limit(60).get();
      snap.forEach(d => photos.push({ id: d.id, ...d.data() }));

    } else if (source === 'gallery') {
      const snap = await db.collection('users').doc(uid)
        .collection('fotos').orderBy('createdAt', 'desc').limit(60).get();
      snap.forEach(d => photos.push({ id: d.id, ...d.data() }));

    } else if (source === 'day' && id) {
      // Fotos de ruta filtradas por día
      const snap = await db.collection('users').doc(uid)
        .collection('fotos').where('routeId', '==', id)
        .orderBy('createdAt', 'desc').limit(60).get();
      snap.forEach(d => photos.push({ id: d.id, ...d.data() }));

      // Merge con fotos del doc de ruta para ese día
      try {
        const routeSnap = await db.collection('users').doc(uid)
          .collection('maps').doc(id).get();
        if (routeSnap.exists) {
          const rPhotos = (routeSnap.data().photos || []).filter(p => p.day === dayNum);
          for (const rp of rPhotos) {
            if (rp.url && !photos.some(p => p.url === rp.url)) {
              photos.push({ ...rp, day: rp.day, createdAt: rp.uploadedAt || rp.createdAt || '' });
            }
          }
        }
      } catch (_) {}

      // Filtrar solo el día pedido (por campo day o agrupando por fecha)
      if (dayNum) {
        const withDay = photos.filter(p => p.day === dayNum);
        if (withDay.length >= 3) return withDay;
        // Fallback: no hay campo day, usar todas las del routeId
      }

    } else if (source === 'pins') {
      // map_pins con photoUrl
      try {
        const snap1 = await db.collection('users').doc(uid)
          .collection('map_pins').limit(50).get();
        snap1.forEach(d => {
          const data = d.data();
          if (data.photoUrl) {
            photos.push({
              url: data.photoUrl, lat: data.lat, lng: data.lng,
              caption: data.label || data.locName || '',
              createdAt: data.createdAt || '', tag: 'otro'
            });
          }
        });
      } catch (_) {}

      // pins collection (legacy)
      try {
        const snap2 = await db.collection('users').doc(uid)
          .collection('pins').limit(50).get();
        snap2.forEach(d => {
          const data = d.data();
          if (data.photoUrl && !photos.some(p => p.url === data.photoUrl)) {
            photos.push({
              url: data.photoUrl, lat: data.lat, lng: data.lng,
              caption: data.locName || '', createdAt: data.createdAt || '', tag: 'otro'
            });
          }
        });
      } catch (_) {}
    }

    return photos;
  },

  // ═══ FILTRAR Y ORDENAR ═══

  _filterAndSort(photos) {
    return photos
      .filter(p => p.url && p.tag !== 'documento' && p.tag !== 'cartel')
      .sort((a, b) => {
        const da = a.createdAt || a.uploadedAt || '';
        const db2 = b.createdAt || b.uploadedAt || '';
        return da < db2 ? -1 : da > db2 ? 1 : 0;
      });
  },

  // ═══ SELECCIÓN INTELIGENTE ═══

  _selectBest(photos, maxPerDay) {
    // Agrupar por día (campo day o por fecha)
    const groups = {};
    for (const p of photos) {
      let key = 'all';
      if (p.day) {
        key = 'day_' + p.day;
      } else if (p.createdAt) {
        key = 'date_' + (p.createdAt || '').substring(0, 10);
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }

    const selected = [];
    const groupKeys = Object.keys(groups).sort();

    for (const key of groupKeys) {
      const group = groups[key];
      if (group.length <= maxPerDay) {
        selected.push(...group);
        continue;
      }

      // Priorizar variedad de tags
      const usedTags = new Set();
      const picked = [];
      // Primera pasada: uno de cada tag
      for (const p of group) {
        if (picked.length >= maxPerDay) break;
        if (!usedTags.has(p.tag)) {
          usedTags.add(p.tag);
          picked.push(p);
        }
      }
      // Segunda pasada: rellenar con los restantes
      for (const p of group) {
        if (picked.length >= maxPerDay) break;
        if (!picked.includes(p)) picked.push(p);
      }
      selected.push(...picked);
    }

    return selected;
  },

  // ═══ DETERMINAR ESTILO ═══

  _determineStyle(count, hasRealStops) {
    if (count <= 5) return { style: 'historia', maxPhotos: 5 };
    if (hasRealStops) return { style: 'viaje', maxPhotos: 15 };
    return { style: 'documental', maxPhotos: 15 };
  },

  // ═══ GENERAR TÍTULO ═══

  _generateTitle(source, config, routeData, routeDoc) {
    if (source === 'route') {
      if (routeDoc && routeDoc.nombre) return routeDoc.nombre;
      if (routeData && routeData.title) return routeData.title;
      return 'Mi viaje';
    }
    if (source === 'album') {
      // El nombre del álbum se cargará en el caller si es posible
      return config._albumName || 'Mi álbum';
    }
    if (source === 'day') {
      const dayNum = config.dayNum || 1;
      if (routeData && routeData.stops) {
        const dayStop = routeData.stops.find(s => s.day === dayNum);
        if (dayStop && dayStop.day_title) return 'Día ' + dayNum + ' · ' + dayStop.day_title;
      }
      return 'Día ' + dayNum;
    }
    if (source === 'pins') return 'Mis lugares';
    if (source === 'custom') return 'Mi selección';
    if (source === 'gallery') {
      if (typeof salma !== 'undefined' && salma.currentRoute && salma.currentRoute.title) {
        return salma.currentRoute.title;
      }
      return 'Mi viaje';
    }
    return 'Mi viaje';
  },

  // ═══ EXTRAER STOPS PARA MAPA ═══

  _extractStops(source, routeData, photos) {
    // Desde ruta
    if (routeData && routeData.stops && routeData.stops.length >= 2) {
      return routeData.stops
        .filter(s => s.lat && s.lng && Math.abs(s.lat) > 0.01)
        .map(s => ({ name: s.name || '', lat: s.lat, lng: s.lng, day: s.day || null }));
    }

    // Desde fotos con coordenadas
    const withCoords = photos.filter(p => p.lat && p.lng && Math.abs(p.lat) > 0.01);
    if (withCoords.length >= 2) {
      return withCoords.map(p => ({
        name: p.caption || '', lat: p.lat, lng: p.lng, day: p.day || null
      }));
    }

    // videoPlayer generará stops sintéticos
    return [];
  },

  // ═══ CARGAR DOC DE RUTA ═══

  async _loadRouteDoc(docId, uid) {
    if (this._routeCache[docId]) return this._routeCache[docId];

    let routeData = null;
    let routeDoc = null;
    try {
      const snap = await db.collection('users').doc(uid)
        .collection('maps').doc(docId).get();
      if (snap.exists) {
        routeDoc = snap.data();
        if (routeDoc.itinerarioIA) {
          routeData = JSON.parse(routeDoc.itinerarioIA);
        }
      }
    } catch (_) {}

    const result = { routeData, routeDoc };
    this._routeCache[docId] = result;
    return result;
  }
};

window.videoAssembly = videoAssembly;
