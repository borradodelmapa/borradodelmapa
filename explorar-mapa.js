/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — explorar-mapa.js
   Explorar con mapa del mundo (20 oct 2026, caso p-mvfrvjvh200). Al entrar: SOLO el mapa a pantalla
   completa y el buscador, sin scroll. Al elegir un país (tocarlo o buscarlo) el mapa baja a media
   pantalla y debajo salen sus guías: primero las de destino y después las de viajeros, con el
   selector «Todas / De viajeros».
   - Datos: el mismo índice de siempre (GET /explorar del Worker, lo carga app.js).
   - Guía de destino = slug «<destino>-ruta» o una de destinos/img/guias-publicas.json (Barcelona).
     Provisional hasta que el Worker las marque.
   - Mapa: mapa-mundo.js (compartido, §12). Sin fondo de calles: países pintados en naranja según
     cuántas guías tienen, con el número encima.
   💶 0 €: ninguna API de pago (Leaflet, contornos propios, el índice cacheado de siempre).
   ═══════════════════════════════════════════ */

const explorarMapa = (() => {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
  const flag = a2 => (a2 && a2.length === 2) ? String.fromCodePoint(...[...a2.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '';
  const dn = (() => { try { return new Intl.DisplayNames(['es'], { type: 'region' }); } catch (_) { return null; } })();

  let st = null; // estado de la pantalla abierta
  // la etiqueta «País · N guías» solo con ratón: en el móvil se queda pegada tras tocar
  const _raton = !!(window.matchMedia && matchMedia('(hover: hover)').matches);

  function _css() {
    if (document.getElementById('exm-css')) return;
    const s = document.createElement('style');
    s.id = 'exm-css';
    s.textContent = `
.exm-escena { position: relative; }
.exm-mapa { background: #0b1216; transition: height .35s ease; }
.exm-mapa.leaflet-container { background: #0b1216; font-family: var(--font-body); }
.exm .leaflet-bar a, .exm .leaflet-bar a:hover { background: var(--gris); color: var(--crema); border-radius: 0 !important; border-bottom-color: var(--linea); }
.exm .leaflet-bar { border: 1px solid var(--linea-fuerte) !important; border-radius: 0 !important; box-shadow: none !important; }
.exm-tt.leaflet-tooltip { background: var(--negro); color: var(--crema); border: 1px solid var(--dorado); border-radius: 0; box-shadow: none; font: 700 14px var(--font-display); letter-spacing: .05em; text-transform: uppercase; padding: 4px 8px; }
.exm-tt.leaflet-tooltip::before { display: none; }
.exm-num { box-sizing: border-box; background: var(--dorado); color: var(--negro); font: 800 14px/24px var(--font-display); text-align: center; width: 28px; height: 28px; padding: 0; border: 2px solid var(--negro); border-radius: 50%; box-shadow: 0 0 0 2px rgba(244,99,11,.45); }
.exm-num.sel { background: var(--crema); }
.exm-busca { position: absolute; z-index: 800; top: 12px; left: 12px; right: 52px; max-width: 560px; } /* a la derecha queda el botón flotante de Mejora Salma */
.exm-busca input { width: 100%; box-sizing: border-box; font: 500 16px var(--font-body); color: var(--crema); background: var(--negro); border: 1px solid var(--linea-fuerte); border-radius: 0; padding: 14px 14px 14px 44px; outline: none; box-shadow: 0 6px 20px rgba(0,0,0,.45); -webkit-appearance: none; }
.exm-busca input:focus { border-color: var(--dorado); }
.exm-busca svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--dorado); pointer-events: none; }
.exm-sug { position: absolute; left: 0; right: 0; top: 100%; background: var(--negro); border: 1px solid var(--dorado); border-top: 0; max-height: 50vh; overflow-y: auto; }
.exm-sug button { display: flex; width: 100%; justify-content: space-between; gap: 10px; align-items: baseline; text-align: left; background: none; border: 0; border-bottom: 1px solid var(--linea); color: var(--crema); font: 500 15px var(--font-body); padding: 12px 14px; cursor: pointer; }
.exm-sug button:hover, .exm-sug button.on { background: var(--gris); color: var(--dorado2); }
.exm-sug small { color: rgba(236,235,232,.6); font-size: 12px; white-space: nowrap; }
.exm-panel { padding: 14px 16px 24px; }
.exm-fila { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.exm-volver { font: 700 14px var(--font-display); letter-spacing: .08em; text-transform: uppercase; color: var(--dorado); background: none; border: 0; padding: 6px 0; cursor: pointer; }
.exm-seg { display: inline-flex; border: 1px solid var(--linea-fuerte); }
.exm-seg button { font: 700 13px var(--font-display); letter-spacing: .1em; text-transform: uppercase; background: none; color: var(--crema); border: 0; padding: 8px 13px; cursor: pointer; }
.exm-seg button + button { border-left: 1px solid var(--linea-fuerte); }
.exm-seg button[aria-pressed="true"] { background: var(--dorado); color: var(--negro); }
.exm-pais { display: flex; align-items: center; gap: 10px; margin-top: 6px; font: 800 32px/1 var(--font-display); text-transform: uppercase; color: var(--crema); }
.exm-sub { color: rgba(236,235,232,.6); font-size: 13.5px; margin: 6px 0 2px; }
.exm-h { font: 700 15px var(--font-display); letter-spacing: .12em; text-transform: uppercase; color: rgba(236,235,232,.6); margin: 22px 0 10px; }
.exm-h span { color: var(--dorado); margin-left: 6px; }
.exm-vacio { color: rgba(236,235,232,.6); font-size: 14px; border: 1px dashed var(--linea-fuerte); padding: 14px; margin-top: 16px; }
.exm-msg { padding: 24px 16px; color: rgba(236,235,232,.7); }
.exm .viaje-card.exm-hl { outline: 2px solid var(--dorado); }
.exm path.leaflet-interactive:focus { outline: none; }`;
    document.head.appendChild(s);
  }

  // Guías del índice /explorar, aplanadas, con su país y si son de destino
  function _guias(data, destMap) {
    const out = [];
    const ccOf = co => co.cc || (typeof normalizeCountry === 'function' ? (normalizeCountry(co.name) || {}).code : '') || '';
    for (const co of (data.countries || [])) {
      const cc = String(ccOf(co) || '').toUpperCase();
      if (!cc) continue;
      for (const p of co.provinces || []) for (const g of p.guides || []) {
        const dest = /-ruta$/.test(g.slug || '') || !!destMap[g.slug];
        out.push({ ...g, cc, pais: co.name, prov: p.name, _dest: dest, autor: dest ? 'Borrado del Mapa' : g.autor });
      }
    }
    return out;
  }

  function _nombre(cc) {
    const co = st && st.nombres[cc];
    if (co) return co;
    try { return dn ? dn.of(cc) : cc; } catch (_) { return cc; }
  }
  const _lista = () => st.filtro === 'via' ? st.guias.filter(g => !g._dest) : st.guias;
  const _porPais = () => { const m = {}; for (const g of _lista()) (m[g.cc] = m[g.cc] || []).push(g); return m; };

  // Alto del mapa: al entrar, todo lo que queda hasta el menú de abajo (sin scroll)
  // (el contenedor de la app reserva abajo más hueco que el menú: se recupera con un margen negativo)
  function _alto() {
    const el = document.getElementById('exm-mapa'), raiz = document.getElementById('exm');
    if (!el || !raiz) return;
    if (st.sel) { raiz.style.marginBottom = ''; el.style.height = Math.max(240, Math.round(window.innerHeight * .46)) + 'px'; return; }
    const top = el.getBoundingClientRect().top + window.scrollY;
    const bar = document.getElementById('app-bottom-bar');
    const barH = bar && getComputedStyle(bar).display !== 'none' ? bar.getBoundingClientRect().height : 0;
    const pad = parseFloat(getComputedStyle(raiz.parentElement).paddingBottom) || 0;
    raiz.style.marginBottom = pad > barH ? -(pad - barH) + 'px' : '';
    el.style.height = Math.max(300, window.innerHeight - top - barH) + 'px';
  }

  // El mundo entero a la vista (como en Tu vuelta al mundo), centrado; no se puede alejar más que eso
  const MUNDO = L.latLngBounds([[-58, -180], [84, 190]]);
  function _verMundo(anim) {
    const map = st.map;
    map.invalidateSize();
    const z = map.getBoundsZoom(MUNDO, false, L.point(4, 4));
    map.setMinZoom(z);
    return anim ? map.flyTo(MUNDO.getCenter(), z, { duration: .6 }) : map.setView(MUNDO.getCenter(), z, { animate: false });
  }

  function _pintar() {
    const pp = _porPais();
    for (const cc in st.capas) {
      const n = (pp[cc] || []).length, sel = cc === st.sel;
      st.capas[cc].forEach(l => {
        l.setStyle({ fillColor: n ? '#F4630B' : '#383B3D', fillOpacity: 1, color: sel ? '#ECEBE8' : '#0b1216', weight: sel ? 2.2 : .6 });
        l.unbindTooltip();
        if (_raton) l.bindTooltip(_nombre(cc) + ' · ' + (n ? plural(n, 'guía', 'guías') : 'sin guías aún'), { className: 'exm-tt', sticky: true, direction: 'top' });
      });
    }
    _nums(pp);
  }

  // Números redondos. Si dos caen casi en el mismo punto (España y Portugal con el mundo entero a la vista),
  // se pinta el de más guías y el otro aparece al acercar; el país sigue naranja y se puede tocar.
  function _nums(pp) {
    pp = pp || _porPais();
    st.nums.clearLayers();
    const puestos = [];
    for (const cc of Object.keys(pp).filter(c => st.centros[c]).sort((a, b) => pp[b].length - pp[a].length)) {
      const p = st.map.latLngToContainerPoint(st.centros[cc]);
      if (puestos.some(q => Math.hypot(q.x - p.x, q.y - p.y) < 30)) continue;
      puestos.push(p);
      const m = L.marker(st.centros[cc], { icon: L.divIcon({ className: '', html: '<div class="exm-num' + (cc === st.sel ? ' sel' : '') + '">' + pp[cc].length + '</div>', iconSize: null, iconAnchor: [14, 14] }), keyboard: false, zIndexOffset: pp[cc].length * 10 });
      m.on('click', () => _elegir(cc));
      m.addTo(st.nums);
    }
  }

  function _panel() {
    const $p = document.getElementById('exm-panel');
    if (!$p) return;
    $p.hidden = !st.sel;
    _alto();
    setTimeout(() => st && st.map && st.map.invalidateSize(), 380);
    if (!st.sel) { $p.innerHTML = ''; return; }
    const lista = _porPais()[st.sel] || [], dest = lista.filter(g => g._dest), via = lista.filter(g => !g._dest);
    $p.innerHTML = '<div class="exm-fila"><button type="button" class="exm-volver" id="exm-volver">‹ Mapa del mundo</button>' +
      '<div class="exm-seg" role="group" aria-label="Qué guías ver"><button type="button" data-f="todas" aria-pressed="' + (st.filtro === 'todas') + '">Todas</button><button type="button" data-f="via" aria-pressed="' + (st.filtro === 'via') + '">De viajeros</button></div></div>' +
      '<div class="exm-pais"><span>' + flag(st.sel) + '</span><span>' + esc(_nombre(st.sel)) + '</span></div>' +
      '<div class="exm-sub">' + (lista.length ? plural(lista.length, 'guía', 'guías') : 'Todavía sin guías') + '</div>' +
      (dest.length ? '<div class="exm-h">Guías de destino<span>' + dest.length + '</span></div><div class="viaje-group-grid" id="exm-g-dest"></div>' : '') +
      (via.length ? '<div class="exm-h">De viajeros<span>' + via.length + '</span></div><div class="viaje-group-grid" id="exm-g-via"></div>' : '') +
      (!lista.length ? '<div class="exm-vacio">' + (st.filtro === 'via' ? 'Ningún viajero ha compartido todavía una ruta aquí.' : 'Aún no hay guías de este país. Salen aquí en cuanto se publiquen.') + '</div>' : '') ;
    const pon = (id, arr) => { const el = document.getElementById(id); if (!el) return; for (const g of arr) { const c = st.card(g); if (g.slug === st.hl) c.classList.add('exm-hl'); c.id = 'exm-c-' + g.slug; el.appendChild(c); } };
    pon('exm-g-dest', dest); pon('exm-g-via', via);
    document.getElementById('exm-volver').onclick = () => {
      st.sel = null; st.hl = null; const q = document.getElementById('exm-q'); if (q) q.value = '';
      _pintar(); _panel(); window.scrollTo(0, 0); setTimeout(() => st && _verMundo(true), 400);
    };
    $p.querySelectorAll('.exm-seg button').forEach(b => b.onclick = () => { st.filtro = b.dataset.f; _pintar(); _panel(); });
  }

  function _elegir(cc) {
    const primera = !st.sel;
    st.sel = cc;
    if (st.hl && !(_porPais()[cc] || []).some(g => g.slug === st.hl)) st.hl = null;
    _pintar(); _panel();
    const ir = () => {
      if (!st || !st.capas[cc]) return;
      const b = L.featureGroup(st.capas[cc]).getBounds(), c = st.centros[cc];
      // países con territorios lejanos: encuadre en el trozo principal
      const big = c && (b.getEast() - b.getWest() > 60) ? L.latLngBounds([c.lat - 8, c.lng - 12], [c.lat + 8, c.lng + 12]) : b;
      st.map.invalidateSize();
      st.map.flyToBounds(big, { padding: [40, 40], maxZoom: 5, duration: .7 });
    };
    if (primera) setTimeout(ir, 400); else ir();
  }

  function _buscador() {
    const $q = document.getElementById('exm-q'), $s = document.getElementById('exm-sug');
    const idx = [];
    for (const cc in st.capas) idx.push({ k: 'pais', cc, txt: _nombre(cc) });
    const vistos = new Set();
    for (const g of st.guias) {
      idx.push({ k: 'guia', cc: g.cc, txt: g.nombre || 'Ruta', slug: g.slug });
      const d = (g.destino || '').trim();
      if (d && !vistos.has(g.cc + '|' + norm(d))) { vistos.add(g.cc + '|' + norm(d)); idx.push({ k: 'dest', cc: g.cc, txt: d }); }
    }
    let sugs = [], act = -1;
    const ir = it => {
      $s.hidden = true; $q.value = it.txt; $q.blur();
      st.hl = it.k === 'guia' ? it.slug : null;
      _elegir(it.cc);
      if (st.hl) setTimeout(() => { const el = document.getElementById('exm-c-' + st.hl); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 450);
    };
    $q.addEventListener('input', () => {
      const q = norm($q.value.trim());
      if (q.length < 2) { $s.hidden = true; return; }
      const pp = _porPais();
      const rank = it => (norm(it.txt).startsWith(q) ? 0 : 1) + (it.k === 'pais' ? 0 : it.k === 'guia' ? .2 : .4);
      sugs = idx.filter(it => norm(it.txt).includes(q) && (it.k !== 'guia' || _lista().some(g => g.slug === it.slug))).sort((a, b) => rank(a) - rank(b)).slice(0, 8);
      act = -1;
      $s.innerHTML = sugs.length ? sugs.map((it, i) => '<button type="button" data-i="' + i + '"><span>' + (it.k === 'pais' ? flag(it.cc) + ' ' : '') + esc(it.txt) + '</span><small>' +
        (it.k === 'pais' ? plural((pp[it.cc] || []).length, 'guía', 'guías') : (it.k === 'guia' ? 'guía · ' : 'destino · ') + esc(_nombre(it.cc))) + '</small></button>').join('')
        : '<button type="button" disabled><span>Nada con «' + esc($q.value.trim()) + '»</span></button>';
      $s.hidden = false;
      $s.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => ir(sugs[+b.dataset.i]));
    });
    $q.addEventListener('keydown', e => {
      const bs = [...$s.querySelectorAll('button[data-i]')];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!bs.length) return; act = (act + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length; bs.forEach((b, i) => b.classList.toggle('on', i === act)); }
      else if (e.key === 'Enter' && sugs.length) { e.preventDefault(); ir(sugs[Math.max(0, act)]); }
      else if (e.key === 'Escape') $s.hidden = true;
    });
    document.getElementById('exm').addEventListener('click', e => { if (!e.target.closest('.exm-busca')) $s.hidden = true; });
  }

  // container: donde se pinta · cargar(): promesa con el índice /explorar · card(g): tarjeta de guía (la de app.js)
  // seguir(): false si el usuario ya se fue de Explorar mientras cargaba
  async function render(container, { cargar, card, seguir }) {
    _css();
    if (st && st.map) { try { st.map.remove(); } catch (_) {} }
    st = null;
    container.innerHTML = `<div class="exm" id="exm">
      <div class="exm-escena">
        <div class="exm-mapa" id="exm-mapa" role="img" aria-label="Mapa del mundo con el número de guías por país"></div>
        <div class="exm-busca">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
          <input id="exm-q" type="search" autocomplete="off" placeholder="Busca país o destino" aria-label="Buscar">
          <div class="exm-sug" id="exm-sug" hidden></div>
        </div>
      </div>
      <div class="exm-panel" id="exm-panel" hidden></div>
    </div>`;
    window.scrollTo(0, 0);
    const $m = document.getElementById('exm-mapa');
    st = { sel: null, hl: null, filtro: 'todas', capas: {}, centros: {}, guias: [], nombres: {}, card };
    _alto();
    let data, feats, destMap = {};
    try {
      [data, feats, destMap] = await Promise.all([
        cargar(),
        mapaMundo.paises(),
        fetch('/destinos/img/guias-publicas.json').then(r => r.ok ? r.json() : {}).catch(() => ({})),
      ]);
    } catch (e) {
      console.warn('Explorar: no se pudo cargar', e);
      if (seguir() && document.getElementById('exm-mapa') === $m) $m.outerHTML = '<div class="exm-msg">No se pudieron cargar las guías. Prueba otra vez en un rato.</div>';
      return;
    }
    if (!seguir() || document.getElementById('exm-mapa') !== $m || typeof L === 'undefined') return;
    st.guias = _guias(data, destMap || {});
    for (const co of (data.countries || [])) if (co.cc) st.nombres[String(co.cc).toUpperCase()] = co.name;

    const map = st.map = L.map($m, { minZoom: 0, maxZoom: 8, zoomSnap: 0, attributionControl: false, zoomControl: false, maxBounds: MUNDO });
    map.on('zoomend', () => { if (st && st.map === map && st.nums) _nums(); });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    _verMundo(false);
    for (const f of feats) {
      const cc = f.properties.a2;
      const lay = L.geoJSON(f, { style: { color: '#0D0F10', weight: .6, fillColor: '#2A2D30', fillOpacity: 1 } }).addTo(map);
      // centro del trozo más grande (Francia con la Guayana, EE. UU. con Alaska…)
      let best = null, area = -1;
      lay.eachLayer(l => {
        const ll = l.getLatLngs ? l.getLatLngs() : [];
        const rings = Array.isArray(ll[0] && ll[0][0]) ? ll.map(p => p[0]) : [ll[0]];
        rings.forEach(r => { if (!r || !r.length) return; const b = L.latLngBounds(r), a = (b.getNorth() - b.getSouth()) * (b.getEast() - b.getWest()); if (a > area) { area = a; best = b; } });
      });
      if (best && !st.centros[cc]) st.centros[cc] = best.getCenter();
      (st.capas[cc] = st.capas[cc] || []).push(lay);
      lay.on('click', () => _elegir(cc));
      lay.on('mouseover', () => lay.setStyle({ weight: 1.6, color: '#ECEBE8' }));
      lay.on('mouseout', () => _pintar());
    }
    st.nums = L.layerGroup().addTo(map);
    _pintar();
    _buscador();
  }

  return { render };
})();
