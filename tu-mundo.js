/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — tu-mundo.js
   "Tu mundo" dentro de la app (29 sept 2026, caso 14 paso 1): países, % del mundo,
   km, récords y viajes por años a partir de las guías, fotos y pins del usuario.
   Antes era la página suelta tu-mundo.html (beta). Cálculo idéntico al de la beta.

   - tuMundo.strip(el): franja de cifras arriba de Mis Viajes (lee un resumen
     guardado en el móvil; lo recalcula como mucho cada 12 h).
   - tuMundo.render(): pantalla completa (estado 'tu-mundo' de showState).
   💶 0 €: lecturas de Firestore con límite (maps ≤200, fotos ≤800, pins ≤800) y cálculo en el móvil.
   ═══════════════════════════════════════════ */

const tuMundo = (() => {
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nf = n => Math.round(n).toLocaleString('es-ES');
  const hav = (a, b) => { const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r; const x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
  const ok = p => p && isFinite(+p.lat) && isFinite(+p.lng) && Math.abs(+p.lat) > .01;
  const toDate = v => v && v.toDate ? v.toDate() : v ? new Date(v) : null;
  const pctTxt = pct => pct < 1 ? pct.toFixed(1).replace('.', ',') : String(Math.round(pct));
  // ISO numérico (world-atlas) → código de 2 letras: para la bandera y el nombre en español (Intl.DisplayNames).
  const ISO = {"533":"AW","004":"AF","024":"AO","660":"AI","248":"AX","008":"AL","020":"AD","784":"AE","032":"AR","051":"AM","016":"AS","010":"AQ","260":"TF","028":"AG","036":"AU","040":"AT","031":"AZ","108":"BI","056":"BE","204":"BJ","535":"BQ","854":"BF","050":"BD","100":"BG","048":"BH","044":"BS","070":"BA","652":"BL","112":"BY","084":"BZ","060":"BM","068":"BO","076":"BR","052":"BB","096":"BN","064":"BT","074":"BV","072":"BW","140":"CF","124":"CA","166":"CC","756":"CH","152":"CL","156":"CN","384":"CI","120":"CM","180":"CD","178":"CG","184":"CK","170":"CO","174":"KM","132":"CV","188":"CR","192":"CU","531":"CW","162":"CX","136":"KY","196":"CY","203":"CZ","276":"DE","262":"DJ","212":"DM","208":"DK","214":"DO","012":"DZ","218":"EC","818":"EG","232":"ER","732":"EH","724":"ES","233":"EE","231":"ET","246":"FI","242":"FJ","238":"FK","250":"FR","234":"FO","583":"FM","266":"GA","826":"GB","268":"GE","831":"GG","288":"GH","292":"GI","324":"GN","312":"GP","270":"GM","624":"GW","226":"GQ","300":"GR","308":"GD","304":"GL","320":"GT","254":"GF","316":"GU","328":"GY","344":"HK","334":"HM","340":"HN","191":"HR","332":"HT","348":"HU","360":"ID","833":"IM","356":"IN","086":"IO","372":"IE","364":"IR","368":"IQ","352":"IS","376":"IL","380":"IT","388":"JM","832":"JE","400":"JO","392":"JP","398":"KZ","404":"KE","417":"KG","116":"KH","296":"KI","659":"KN","410":"KR","414":"KW","418":"LA","422":"LB","430":"LR","434":"LY","662":"LC","438":"LI","144":"LK","426":"LS","440":"LT","442":"LU","428":"LV","446":"MO","663":"MF","504":"MA","492":"MC","498":"MD","450":"MG","462":"MV","484":"MX","584":"MH","807":"MK","466":"ML","470":"MT","104":"MM","499":"ME","496":"MN","580":"MP","508":"MZ","478":"MR","500":"MS","474":"MQ","480":"MU","454":"MW","458":"MY","175":"YT","516":"NA","540":"NC","562":"NE","574":"NF","566":"NG","558":"NI","570":"NU","528":"NL","578":"NO","524":"NP","520":"NR","554":"NZ","512":"OM","586":"PK","591":"PA","612":"PN","604":"PE","608":"PH","585":"PW","598":"PG","616":"PL","630":"PR","408":"KP","620":"PT","600":"PY","275":"PS","258":"PF","634":"QA","638":"RE","642":"RO","643":"RU","646":"RW","682":"SA","729":"SD","686":"SN","702":"SG","239":"GS","654":"SH","744":"SJ","090":"SB","694":"SL","222":"SV","674":"SM","706":"SO","666":"PM","688":"RS","728":"SS","678":"ST","740":"SR","703":"SK","705":"SI","752":"SE","748":"SZ","534":"SX","690":"SC","760":"SY","796":"TC","148":"TD","768":"TG","764":"TH","762":"TJ","772":"TK","795":"TM","626":"TL","776":"TO","780":"TT","788":"TN","792":"TR","798":"TV","158":"TW","834":"TZ","800":"UG","804":"UA","581":"UM","858":"UY","840":"US","860":"UZ","336":"VA","670":"VC","862":"VE","092":"VG","850":"VI","704":"VN","548":"VU","876":"WF","882":"WS","887":"YE","710":"ZA","894":"ZM","716":"ZW","-99":""};
  const NAME2ISO = { Kosovo: 'XK' };
  const dn = (() => { try { return new Intl.DisplayNames(['es'], { type: 'region' }); } catch (_) { return null; } })();
  const flagOf = a2 => a2 && a2.length === 2 ? String.fromCodePoint(...[...a2.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '';
  const esName = (a2, en) => { try { return a2 && dn ? dn.of(a2) : en; } catch (_) { return en; } };
  const TOTAL_PAISES = 195;
  const SUM_KEY = 'bdm_tumundo_sum';
  const SUM_TTL = 12 * 3600 * 1000;

  // Iconos de línea, mismo trazo que el menú de abajo
  const IC_GLOBE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"/></svg>';
  const IC_PIN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const IC_SHARE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>';

  /* ── países del mundo (contornos de Natural Earth, los mismos de viaje-fotos) ── */
  let FEATS = [];
  let _worldP = null;
  function _loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }
  function loadWorld() {
    if (_worldP) return _worldP;
    _worldP = (async () => {
      if (typeof topojson === 'undefined') await _loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js');
      const topo = await (await fetch('/vendor/countries-50m.json')).json();
      const fc = topojson.feature(topo, topo.objects.countries);
      FEATS = fc.features.filter(f => f.geometry).map(f => {
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates; const bb = [180, 90, -180, -90];
        polys.forEach(p => p.forEach(r => r.forEach(([x, y]) => { if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (x > bb[2]) bb[2] = x; if (y > bb[3]) bb[3] = y; })));
        const a2 = ISO[f.id] || NAME2ISO[f.properties.name] || ''; return { id: a2 || f.properties.name, a2, en: f.properties.name, polys, bb };
      });
    })().catch(e => { _worldP = null; throw e; });
    return _worldP;
  }
  function inRing(x, y, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
  function countryAt(lat, lng) { for (const f of FEATS) { const b = f.bb; if (lng < b[0] || lng > b[2] || lat < b[1] || lat > b[3]) continue; for (const poly of f.polys) { if (inRing(lng, lat, poly[0])) { let hole = false; for (let k = 1; k < poly.length; k++) if (inRing(lng, lat, poly[k])) hole = true; if (!hole) return f; } } } return null; }

  /* ── datos del usuario ── */
  async function loadUser(uid) {
    const U = firebase.firestore().collection('users').doc(uid);
    const [maps, fotos, pins, mpins] = await Promise.all([
      U.collection('maps').limit(200).get(),
      U.collection('fotos').limit(800).get().catch(() => ({ docs: [] })),
      U.collection('pins').limit(400).get().catch(() => ({ docs: [] })),
      U.collection('map_pins').limit(400).get().catch(() => ({ docs: [] }))]);
    const guides = maps.docs.map(d => {
      const x = d.data(); let r = {}; try { r = JSON.parse(x.itinerarioIA || '{}'); } catch (_) {}
      const stops = (r.stops || []).map(s => ({ name: s.name || '', lat: +s.lat, lng: +s.lng, day: s.day })).filter(ok);
      return { id: d.id, title: x.nombre || r.title || 'Guía', days: +(x.dias || x.num_dias || 0) || Math.max(0, ...stops.map(s => +s.day || 0)), stops, cover: x.map_thumbnail_url || r.map_thumbnail_url || x.cover_image || '', photos: x.photos || [], createdAt: toDate(x.createdAt), rg: r.road_geometry || x.road_geometry || null, borrador: x.estado === 'borrador', hecho: !!x.viaje_hecho, raw: x };
    }).filter(g => !g.borrador);
    const photos = fotos.docs.map(d => ({ id: d.id, ...d.data() }));
    const allPins = [...pins.docs, ...mpins.docs].map(d => d.data());
    return { guides, photos, pins: allPins };
  }
  function compute(D) {
    const byRoute = {}; D.photos.forEach(p => { if (p.routeId) (byRoute[p.routeId] = byRoute[p.routeId] || []).push(p); });
    D.pins.forEach(p => { if (p.routeId && p.photoUrl) (byRoute[p.routeId] = byRoute[p.routeId] || []).push(p); });
    const visited = [], planned = [];
    D.guides.forEach(g => {
      const ph = (g.photos || []).concat(byRoute[g.id] || []); g.nPhotos = ph.length;
      const dates = ph.map(p => toDate(p.takenAt || p.uploadedAt || p.createdAt)).filter(d => d && !isNaN(d)); g.date = dates.length ? new Date(Math.min(...dates)) : g.createdAt;
      if (!g.cover) { const c = ph.find(p => p.url || p.photoUrl); if (c) g.cover = c.url || c.photoUrl; }
      // Cuenta como viaje hecho si tiene fotos o si el usuario lo marcó ("Ya hice este viaje")
      (ph.length || g.hecho ? visited : planned).push(g);
    });
    const seen = new Map(), plan = new Map();
    const mark = (m, f, src, pt) => { if (!f) return; const e = m.get(f.id) || { f, n: 0, src: new Set(), pts: [] }; e.n++; e.src.add(src); if (pt) e.pts.push(pt); m.set(f.id, e); };
    visited.forEach(g => { const cs = new Set(); g.stops.forEach(s => { const f = countryAt(s.lat, s.lng); if (f) { cs.add(f); mark(seen, f, g.id, s); } }); g.countries = [...cs]; });
    // fotos y pins con ubicación: prueba de que estuviste allí aunque no hubiera guía
    D.photos.forEach(p => { if (ok(p)) mark(seen, countryAt(+p.lat, +p.lng), 'foto', { lat: +p.lat, lng: +p.lng }); });
    D.pins.forEach(p => { if (ok(p)) mark(seen, countryAt(+p.lat, +p.lng), 'pin', { lat: +p.lat, lng: +p.lng }); });
    planned.forEach(g => { const cs = new Set(); g.stops.forEach(s => { const f = countryAt(s.lat, s.lng); if (f) { cs.add(f); if (!seen.has(f.id)) mark(plan, f, g.id, s); } }); g.countries = [...cs]; });
    const legKm = g => {
      if (g.rg && Array.isArray(g.rg.coords) && g.rg.coords.length > 1) { let k = 0; for (let i = 1; i < g.rg.coords.length; i++) k += hav({ lat: g.rg.coords[i - 1][0], lng: g.rg.coords[i - 1][1] }, { lat: g.rg.coords[i][0], lng: g.rg.coords[i][1] }); return k; }
      let k = 0; for (let i = 1; i < g.stops.length; i++) k += hav(g.stops[i - 1], g.stops[i]); return k;
    };
    visited.forEach(g => g.km = legKm(g));
    const km = visited.reduce((a, g) => a + g.km, 0), days = visited.reduce((a, g) => a + (g.days || 0), 0);
    const nFotos = D.photos.filter(p => p.tag !== 'documento' && p.tag !== 'cartel').length + visited.reduce((a, g) => a + (g.photos || []).length, 0);
    const places = []; visited.forEach(g => g.stops.forEach(s => places.push({ ...s, trip: g.title })));
    D.photos.forEach(p => { if (ok(p)) places.push({ lat: +p.lat, lng: +p.lng, name: p.caption || '', trip: '' }); });
    D.pins.forEach(p => { if (ok(p)) places.push({ lat: +p.lat, lng: +p.lng, name: p.locName || p.label || '', trip: '' }); });
    return { visited, planned, seen, plan, km, days, nFotos, places };
  }

  // Resumen pequeño para la franja de Mis Viajes (se guarda en el móvil)
  function _saveSummary(uid, S) {
    const flags = [...S.seen.values()].sort((a, b) => b.n - a.n).map(e => e.f.a2).filter(Boolean);
    const sum = { uid, t: Date.now(), n: S.seen.size, km: S.km, viajes: S.visited.length, flags };
    try { localStorage.setItem(SUM_KEY, JSON.stringify(sum)); } catch (_) {}
    return sum;
  }
  function _readSummary(uid) {
    try { const s = JSON.parse(localStorage.getItem(SUM_KEY) || 'null'); return s && s.uid === uid ? s : null; } catch (_) { return null; }
  }

  let _cache = null; // { uid, D, S }
  // datos del usuario, una carga por sesión (la comparten Tu mundo y las tarjetas de Mis Viajes)
  let _udP = null, _udUid = null;
  function _userData(uid, force) {
    if (force || !_udP || _udUid !== uid) { _udUid = uid; _udP = loadUser(uid).catch(e => { _udP = null; throw e; }); }
    return _udP;
  }
  async function _getStats(force) {
    const u = window.currentUser; if (!u) throw new Error('Sin sesión');
    if (!force && _cache && _cache.uid === u.uid) return _cache.S;
    const [D] = await Promise.all([_userData(u.uid, force), loadWorld()]);
    const S = compute(D);
    _cache = { uid: u.uid, D, S };
    _saveSummary(u.uid, S);
    return S;
  }

  /* ── franja de Mis Viajes ── */
  function _stripHTML(sum) {
    if (!sum) return `<span class="tm-strip-ic">${IC_GLOBE}</span><span class="tm-strip-txt"><b>Tu vuelta al mundo</b><span>Tus países, kilómetros y récords</span></span><span class="tm-strip-go">→</span>`;
    const pct = sum.n / TOTAL_PAISES * 100;
    const flags = (sum.flags || []).slice(0, 8).map(flagOf).join(' ');
    if (!sum.n) return `<span class="tm-strip-ic">${IC_GLOBE}</span><span class="tm-strip-txt"><b>Tu vuelta al mundo</b><span>Sube fotos a tus viajes y tu mapa se irá pintando</span></span><span class="tm-strip-go">→</span>`;
    return `<span class="tm-strip-ic">${IC_GLOBE}</span>
      <span class="tm-strip-nums">
        <span><b>${sum.n}</b><i>${sum.n === 1 ? 'país' : 'países'}</i></span>
        <span><b>${pctTxt(pct)}%</b><i>del mundo</i></span>
        <span><b>${nf(sum.km)}</b><i>km</i></span>
      </span>
      <span class="tm-strip-flags">${flags}</span>
      <span class="tm-strip-go">→</span>`;
  }
  function strip(el) {
    const u = window.currentUser; if (!el || !u) return;
    el.className = 'tm-strip';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Abrir Tu vuelta al mundo');
    const sum = _readSummary(u.uid);
    el.innerHTML = _stripHTML(sum);
    const go = () => showState('tu-mundo');
    el.addEventListener('click', go);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    // Recalcular en segundo plano si no hay resumen o tiene más de 12 h
    if (!sum || Date.now() - sum.t > SUM_TTL) {
      _getStats(true).then(() => { if (el.isConnected) el.innerHTML = _stripHTML(_readSummary(u.uid)); }).catch(() => {});
    }
    _watchCards();
  }

  /* ── estado en cada tarjeta de Mis Viajes (1 oct 2026, Paco) ──
     "📷 36 fotos" / "Sin fotos" · "🎬 Vídeo hecho" (si se creó en este móvil) · "✓ En tu mundo" o botón "Añadir a mi mundo"
     (el mismo viaje_hecho de "Ya lo hice"). Se añade a las tarjetas cuando aparecen, sin tocar app.js.
     💶 0 €: usa los datos de Tu mundo (una carga por sesión, con límite) y una escritura al marcar. */
  async function _videosHechos() {
    try {
      const db = await new Promise((res, rej) => { const r = indexedDB.open('bdm-videos', 1); r.onupgradeneeded = () => r.result.createObjectStore('v'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
      return await new Promise(res => { const q = db.transaction('v').objectStore('v').getAllKeys(); q.onsuccess = () => res(new Set(q.result || [])); q.onerror = () => res(new Set()); });
    } catch (_) { return new Set(); }
  }
  let _cardsObs = null;
  function _watchCards() {
    const grid = document.getElementById('viajes-grid'); if (!grid) return;
    if (_cardsObs) _cardsObs.disconnect();
    let t = null;
    _cardsObs = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => _decorateCards(grid), 150); });
    _cardsObs.observe(grid, { childList: true, subtree: true });
    _decorateCards(grid);
  }
  async function _decorateCards(grid) {
    if (!grid.isConnected || !window.currentUser) return;
    const cards = [...grid.querySelectorAll('.viaje-card')].filter(c => !c.querySelector('.viaje-card-st') && c.querySelector('.viaje-card-delete[data-doc-id]'));
    if (!cards.length) return;
    // sin el mapa del mundo: contar fotos solo necesita los datos del usuario
    let D; try { D = await _userData(window.currentUser.uid); } catch (_) { return; }
    const byRoute = {}; D.photos.forEach(p => { if (p.routeId) byRoute[p.routeId] = (byRoute[p.routeId] || 0) + 1; });
    D.pins.forEach(p => { if (p.routeId && p.photoUrl) byRoute[p.routeId] = (byRoute[p.routeId] || 0) + 1; });
    D.guides.forEach(g => { g.nPhotos = (g.photos || []).length + (byRoute[g.id] || 0); });
    const vids = await _videosHechos();
    const byId = new Map(D.guides.map(g => [g.id, g]));
    cards.forEach(c => {
      if (c.querySelector('.viaje-card-st')) return;
      const id = c.querySelector('.viaje-card-delete').dataset.docId, g = byId.get(id), body = c.querySelector('.viaje-card-body');
      if (!g || !body) return;
      const st = document.createElement('div'); st.className = 'viaje-card-st';
      _paintCardSt(st, g, vids.has(id));
      body.appendChild(st);
    });
  }
  function _paintCardSt(st, g, vid) {
    const n = g.nPhotos || 0, enMundo = !!(n || g.hecho);
    st.innerHTML = `<span class="vcs ${n ? 'vcs-on' : ''}">${n ? `📷 ${n} ${n === 1 ? 'foto' : 'fotos'}` : 'Sin fotos'}</span>`
      + (vid ? '<span class="vcs vcs-on">🎬 Vídeo hecho</span>' : '')
      + (enMundo ? '<span class="vcs vcs-on">✓ En tu mundo</span>' : '<button type="button" class="vcs vcs-add">Añadir a mi mundo</button>');
    const b = st.querySelector('.vcs-add');
    if (b) b.addEventListener('click', async e => {
      e.stopPropagation(); e.preventDefault();
      const u = window.currentUser; if (!u) return;
      b.disabled = true; b.textContent = "Guardando…";
      try {
        await firebase.firestore().collection('users').doc(u.uid).collection('maps').doc(g.id).update({ viaje_hecho: true });
        g.hecho = true; if (g.raw) g.raw.viaje_hecho = true;
        _paintCardSt(st, g, vid);
        // el resumen de Tu mundo (países, km) necesita el mapa del mundo: se recalcula en segundo plano
        _getStats(false).then(() => { if (_cache) { const S2 = compute(_cache.D); _cache.S = S2; _saveSummary(u.uid, S2); }
          const strip = document.querySelector('.tm-strip'); if (strip) strip.innerHTML = _stripHTML(_readSummary(u.uid)); }).catch(() => {});
        if (typeof showToast === 'function') showToast('Añadido a tu vuelta al mundo ✓');
      } catch (_) { b.disabled = false; b.textContent = "No se pudo · otra vez"; }
    });
  }

  /* ── mapa del mundo ── */
  const PROJ = { x0: -170, x1: 190, y0: 84, y1: -58 };
  function drawWorld(cv, S, opts = {}) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = opts.pad || 0;
    const X = l => pad + ((l - PROJ.x0) / (PROJ.x1 - PROJ.x0)) * (W - 2 * pad), Y = l => pad + ((PROJ.y0 - l) / (PROJ.y0 - PROJ.y1)) * (H - 2 * pad);
    g.fillStyle = opts.sea || '#0b1216'; g.fillRect(0, 0, W, H);
    for (const f of FEATS) {
      const e = S.seen.get(f.id) || S.plan.get(f.id), st = S.seen.has(f.id) ? 'v' : S.plan.has(f.id) ? 'p' : '';
      for (const poly of f.polys) {
        // solo se pinta la parte del país cerca de donde estuviste (Francia sí, la Guayana no)
        let on = !!st; if (on && e.pts.length && f.polys.length > 1) {
          let a = 180, b = 90, c = -180, d = -90; poly[0].forEach(([x, y]) => { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; });
          const cen = { lat: (b + d) / 2, lng: (a + c) / 2 }; on = e.pts.some(p => hav(p, cen) < 2500);
        }
        g.beginPath(); for (const ring of poly) { ring.forEach(([x, y], i) => { const xx = x < PROJ.x0 ? x + 360 : x; i ? g.lineTo(X(xx), Y(y)) : g.moveTo(X(xx), Y(y)); }); g.closePath(); }
        g.fillStyle = on ? (st === 'v' ? '#F4630B' : '#7a3a14') : '#2a2c2e'; g.fill('evenodd');
        g.strokeStyle = 'rgba(13,15,16,.9)'; g.lineWidth = Math.max(.6, W / 1600); g.stroke();
      }
    }
    // puntos donde has estado
    g.fillStyle = 'rgba(236,235,232,.9)'; S.places.forEach(p => { const xx = p.lng < PROJ.x0 ? p.lng + 360 : p.lng; g.beginPath(); g.arc(X(xx), Y(p.lat), Math.max(1.5, W / 700), 0, 7); g.fill(); });
  }

  /* ── mapa de fotos con zoom (caso p-mve4547l7rl, entrega 1) ──
     Leaflet + OpenStreetMap (0 € de mapas). Círculos con número que se separan al acercar el zoom (agrupado
     propio por píxeles, sin plugin), línea del recorrido por fechas. Fotos sin GPS: se colocan junto a la
     foto con ubicación más cercana en fecha (hasta 3 días) y salen marcadas como aproximadas.
     💶 0 €: usa las fotos ya cargadas (D.photos); no sube nada ni llama a ninguna API de pago. */
  let _fmap = null;
  // Las fotos subidas antes del 16 sept 2026 guardan el enlace del dominio antiguo del Worker (ya no responde): se lee con el actual
  const fixPhoto = u => String(u || '').replace('salma-api.paco-defoto.workers.dev', 'salma-api.borradodelmapa-api.workers.dev');
  function _photoPoints(D) {
    const all = D.photos.filter(p => p.url && p.tag !== 'documento' && p.tag !== 'cartel' && p.type !== 'video')
      .map(p => { const d = toDate(p.takenAt || p.createdAt); return { id: p.id, url: fixPhoto(p.url), t: d && !isNaN(d) ? +d : null, lat: +p.lat, lng: +p.lng, has: ok(p), approx: false, route: p.routeId || null }; });
    // Fotos sin GPS: 1.º junto a la foto con GPS más cercana en fecha de SU MISMO viaje (guía), sin límite de días;
    // 2.º si no tiene viaje o su viaje no tiene GPS, junto a la más cercana en fecha de cualquier viaje, hasta 30 días.
    const withGps = all.filter(p => p.has && p.t != null);
    const MAXGAP = 30 * 864e5;
    const nearest = (p, arr) => { let best = null, bd = Infinity; arr.forEach(q => { const d = Math.abs(q.t - p.t); if (d < bd) { bd = d; best = q; } }); return { best, bd }; };
    all.forEach(p => {
      if (p.has || p.t == null || !withGps.length) return;
      let q = null;
      if (p.route) { const same = withGps.filter(x => x.route === p.route); if (same.length) q = nearest(p, same).best; }
      if (!q) { const r = nearest(p, withGps); if (r.best && r.bd <= MAXGAP) q = r.best; }
      if (q) { p.lat = q.lat; p.lng = q.lng; p.has = true; p.approx = true; }
    });
    const pts = all.filter(p => p.has).sort((a, b) => (a.t || 0) - (b.t || 0)), sin = all.filter(p => !p.has).sort((a, b) => (a.t || 0) - (b.t || 0));
    return { pts, sin, sinSitio: sin.length };
  }
  function _clusterPts(map, pts, radius) {
    const cells = new Map(), z = map.getZoom();
    pts.forEach(p => { const c = map.project([p.lat, p.lng], z), k = Math.floor(c.x / radius) + ':' + Math.floor(c.y / radius); if (!cells.has(k)) cells.set(k, []); cells.get(k).push(p); });
    return [...cells.values()];
  }
  // Subir fotos desde aquí: la misma subida que "Fotos sin viaje" (R2 una a una, fotos sueltas); luego se repinta el mapa
  let _upBusy = false;
  function _wireUpload() {
    const inp = _q('#tm-fmap-in'), msg = _q('#tm-fmap-msg'), lab = _q('#tm-fmap-up');
    if (!inp || inp._w) return; inp._w = true;
    if (typeof fotosViaje === 'undefined' || !fotosViaje.strayUpload) { lab.hidden = true; return; }
    inp.addEventListener('change', async () => {
      const files = [...(inp.files || [])]; inp.value = ''; if (!files.length || _upBusy) return;
      _upBusy = true; lab.classList.add('off');
      let r = { ok: 0, fail: files.length };
      try { r = await fotosViaje.strayUpload(files, (i, n) => { if (msg) msg.textContent = `Subiendo ${i} de ${n}…`; }); } catch (_) {}
      _upBusy = false; lab.classList.remove('off');
      try { localStorage.removeItem(SUM_KEY); } catch (_) {}
      if (!document.getElementById('tm-screen')) return;
      if (msg) msg.textContent = `${r.ok} ${r.ok === 1 ? 'foto subida' : 'fotos subidas'}${r.fail ? ` · ${r.fail} no se pudieron subir` : ''}.`;
      try { const S = await _getStats(true); _paint(S); _drawMap(S, _cache.D); _renderSuggest(S, _cache.D); } catch (_) {}
    });
  }
  // Visor de fotos a pantalla completa (carrusel con flechas, deslizar y botón atrás), mismo diseño que el de las guías
  // Imagen de un círculo del mapa: gris que late mientras carga, la foto al llegar, "!" si el enlace falla
  const PIN_IMG = u => `<img src="${esc(u)}" alt="" decoding="async" style="display:none" onload="var p=this.parentNode,q=String.fromCharCode(39);p.style.backgroundImage='url('+q+this.src+q+')';p.classList.remove('tm-pin-load');this.remove()" onerror="var p=this.parentNode;this.remove();p.classList.replace('tm-pin-load','tm-pin-err')">`;
  let _lb = null;
  function _lbClose(fromHistory) {
    if (!_lb) return; document.removeEventListener('keydown', _lb._key); _lb.remove(); _lb = null;
    if (!fromHistory && window.popModal) window.popModal('tm-visor');
  }
  function _lbOpen(list, i) {
    if (!list || !list[i]) return; _lbClose(true);
    const v = _lb = document.createElement('div'); v.className = 'fv-viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Foto'); v._i = i;
    document.body.appendChild(v);
    const go = d => { const n = v._i + d; if (n >= 0 && n < list.length) { v._i = n; paint(); } };
    const paint = () => {
      const p = list[v._i], when = p.t ? new Date(p.t).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '', f = countryAt(p.lat, p.lng);
      v.innerHTML = `<button type="button" class="fv-v-close" aria-label="Cerrar">✕</button>
        <img class="fv-v-img" src="${esc(p.url)}" alt="" onerror="this.outerHTML='<div class=&quot;tm-v-err&quot;>Esta foto no se puede cargar.<br>Puede que ya no esté guardada o que el enlace falle.<br><small>${esc(String(p.url).split('/')[2] || '')}</small></div>'">
        <div class="fv-v-bar">
          <button type="button" class="fv-v-nav" data-d="-1" ${v._i === 0 ? 'disabled' : ''} aria-label="Anterior">‹</button>
          <div class="fv-v-info"><b>${esc(when)}</b><span>${f ? flagOf(f.a2) + ' ' + esc(esName(f.a2, f.en)) : ''}${p.approx ? ' · ubicación aproximada' : ''}</span><em>${v._i + 1} / ${list.length}</em></div>
          <button type="button" class="fv-v-nav" data-d="1" ${v._i === list.length - 1 ? 'disabled' : ''} aria-label="Siguiente">›</button>
        </div>`;
      v.querySelector('.fv-v-close').onclick = () => _lbClose();
      v.querySelectorAll('.fv-v-nav').forEach(b => b.onclick = () => go(+b.dataset.d));
    };
    let x0 = null; v.ontouchstart = e => { x0 = e.touches[0].clientX; };
    v.ontouchend = e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) >= 50) go(dx < 0 ? 1 : -1); };
    v._key = e => { if (e.key === 'Escape') _lbClose(); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', v._key);
    paint();
    if (window.pushModal) window.pushModal('tm-visor', () => _lbClose(true));
  }
  /* Asignar fotos sueltas a guías (entrega 2): cada foto suelta con sitio se compara con las paradas de las guías;
     si hay una a menos de 40 km se SUGIERE ("estas 86 fotos parecen de X") y Paco confirma. Una foto vive en un solo sitio.
     💶 0 €: comparación en el móvil; al confirmar, una escritura de Firestore por lote (routeId). Sin Claude ni Google. */
  const SUG_KM = 40;
  // Borra de la cuenta las fotos SUELTAS indicadas (las que están dentro de una guía no se tocan): desaparecen del mapa,
  // de Tu vuelta al mundo y, al actualizar el enlace, de la parte pública. Devuelve cuántas se borraron.
  async function _borrarFotos(ids) {
    const u = window.currentUser; if (!u || !_cache) return 0;
    const D = _cache.D, by = new Map(D.photos.map(p => [p.id, p]));
    const del = ids.filter(id => by.has(id) && !by.get(id).routeId), db = firebase.firestore();
    for (let i = 0; i < del.length; i += 400) { const b = db.batch(); del.slice(i, i + 400).forEach(id => b.delete(db.collection('users').doc(u.uid).collection('fotos').doc(id))); await b.commit(); }
    const gone = new Set(del); D.photos = D.photos.filter(p => !gone.has(p.id)); del.forEach(id => _pubSel.delete(id));
    try { localStorage.removeItem(SUM_KEY); } catch (_) {}
    const S2 = compute(D); _cache.S = S2; _saveSummary(u.uid, S2); _paint(S2); _drawMap(S2, D); _renderSuggest(S2, D);
    return del.length;
  }
  const _sugSkip = new Set((() => { try { return JSON.parse(localStorage.getItem('bdm-sug-no') || '[]'); } catch (_) { return []; } })());  // guías cuyas fotos sugeridas el usuario dijo «No lo son»
  function _suggest(D) {
    const { pts } = _photoPoints(D), by = new Map(); let sinGuia = 0;
    pts.filter(p => !p.route).forEach(p => {
      let best = null, bd = Infinity;
      D.guides.forEach(g => g.stops.forEach(st => { const d = hav(p, st); if (d < bd) { bd = d; best = g; } }));
      if (best && bd <= SUG_KM) { if (!by.has(best.id)) by.set(best.id, { g: best, photos: [] }); by.get(best.id).photos.push(p); } else sinGuia++;
    });
    return { groups: [...by.values()].filter(x => !_sugSkip.has(x.g.id)).sort((a, b) => b.photos.length - a.photos.length), sinGuia };
  }
  function _renderSuggest(S, D) {
    const sec = _q('#tm-sug-sec'), box = _q('#tm-sug'); if (!sec || !box) return;
    const { groups, sinGuia } = _suggest(D);
    sec.hidden = !groups.length; if (!groups.length) return;
    _q('#tm-sug-note').textContent = `Tus fotos sueltas se parecen a estas guías por el sitio. Confirma las que quieras: una foto vive en un solo sitio. ${sinGuia ? `Otras ${sinGuia} no encajan con ninguna y se quedan sueltas.` : ''}`;
    box.innerHTML = groups.map(x => `<div class="tm-sug-card" data-g="${esc(x.g.id)}">
        <div class="tm-sug-th">${x.photos.slice(0, 6).map((p, i) => `<button type="button" data-i="${i}" aria-label="Ver foto"><img src="${esc(p.url)}" alt="" loading="lazy"></button>`).join('')}</div>
        <div class="tm-sug-tx"><b>${x.photos.length} ${x.photos.length === 1 ? 'foto parece' : 'fotos parecen'} de «${esc(x.g.title)}»</b></div>
        <div class="tm-sug-bt"><button type="button" class="tm-btn tm-sug-ok">Pasar a esta guía</button><button type="button" class="tm-link tm-sug-no">No lo son</button></div>
      </div>`).join('');
    box.querySelectorAll('.tm-sug-card').forEach(card => {
      const x = groups.find(y => y.g.id === card.dataset.g);
      card.querySelectorAll('.tm-sug-th button').forEach(b => b.onclick = () => _lbOpen(x.photos, +b.dataset.i));
      card.querySelector('.tm-sug-no').onclick = async e => {
        const n = x.photos.length;
        if (!confirm('¿Borrar ' + (n === 1 ? 'esta foto' : 'estas ' + n + ' fotos') + ' de tu cuenta? Desaparecen de tu mapa, de Tu vuelta al mundo y de tu enlace público. No se puede deshacer. Las guías no se tocan.')) return;
        const bt = e.currentTarget; bt.disabled = true; bt.textContent = 'Borrando…';
        try {
          const k = await _borrarFotos(x.photos.map(p => p.id));
          if (typeof showToast === 'function') showToast(k + (k === 1 ? ' foto borrada' : ' fotos borradas'));
          if (window._tmPubRefresh) window._tmPubRefresh();
        } catch (_) { bt.disabled = false; bt.textContent = 'No se pudo · otra vez'; }
      };
      card.querySelector('.tm-sug-ok').onclick = async e => {
        const u = window.currentUser; if (!u) return; const bt = e.currentTarget; bt.disabled = true; bt.textContent = 'Pasando…';
        const ids = x.photos.map(p => p.id), db = firebase.firestore();
        try {
          for (let i = 0; i < ids.length; i += 400) { const batch = db.batch(); ids.slice(i, i + 400).forEach(id => batch.update(db.collection('users').doc(u.uid).collection('fotos').doc(id), { routeId: x.g.id })); await batch.commit(); }
          D.photos.forEach(p => { if (ids.includes(p.id)) p.routeId = x.g.id; });
          try { localStorage.removeItem(SUM_KEY); } catch (_) {}
          if (typeof showToast === 'function') showToast(`${ids.length} ${ids.length === 1 ? 'foto pasada' : 'fotos pasadas'} a «${x.g.title}»`);
          const S2 = compute(D); _cache.S = S2; _saveSummary(u.uid, S2); _paint(S2); _drawMap(S2, D); _renderSuggest(S2, D);
        } catch (_) { bt.disabled = false; bt.textContent = 'No se pudo · otra vez'; }
      };
    });
  }
  // Países pintados sobre el mismo mapa (los de FEATS; solo la parte del país cerca de donde estuviste, como en la tarjeta)
  function _paintCountries(groups, S) {
    for (const f of FEATS) {
      const e = S.seen.get(f.id) || S.plan.get(f.id), st = S.seen.has(f.id) ? 'v' : S.plan.has(f.id) ? 'p' : ''; if (!st) continue;
      for (const poly of f.polys) {
        if (e.pts.length && f.polys.length > 1) {
          let a = 180, b = 90, c = -180, d = -90; poly[0].forEach(([x, y]) => { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; });
          const cen = { lat: (b + d) / 2, lng: (a + c) / 2 }; if (!e.pts.some(p => hav(p, cen) < 2500)) continue;
        }
        L.polygon(poly.map(r => r.map(([x, y]) => [y, x])), { color: st === 'v' ? '#F4630B' : '#a8541c', weight: 1, fillColor: st === 'v' ? '#F4630B' : '#7a3a14', fillOpacity: st === 'v' ? .38 : .3, interactive: false }).addTo(groups[st]);
      }
    }
  }
  // Paradas para "Reproducir mi viaje": fotos seguidas en el tiempo y cerca unas de otras = una parada
  function _stopsOf(pts, max = 40) {
    for (let R = 25; R <= 1600; R *= 2) {
      const stops = [];
      pts.forEach(p => { const c = stops[stops.length - 1]; if (c && hav(c.first, p) < R) c.photos.push(p); else stops.push({ first: p, photos: [p] }); });
      if (stops.length <= max || R >= 1600) return stops.map(c => ({ lat: c.photos.reduce((a, p) => a + p.lat, 0) / c.photos.length, lng: c.photos.reduce((a, p) => a + p.lng, 0) / c.photos.length, photos: c.photos, t: c.photos[0].t }));
    }
  }
  // Datos para el Reel: contornos con su estado (visitado / planeado) y qué trozos de cada país pintar
  function _reelFeats(S) {
    return FEATS.map(f => {
      const e = S.seen.get(f.id) || S.plan.get(f.id), st = S.seen.has(f.id) ? 'v' : S.plan.has(f.id) ? 'p' : '';
      const on = f.polys.map(poly => {
        if (!st || !e.pts.length || f.polys.length < 2) return true;
        let a = 180, b = 90, c = -180, d = -90; poly[0].forEach(([x, y]) => { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; });
        const cen = { lat: (b + d) / 2, lng: (a + c) / 2 }; return e.pts.some(p => hav(p, cen) < 2500);
      });
      return { id: f.id, name: esName(f.a2, f.en), polys: f.polys, on, st };
    });
  }
  function _openReel(S, pts, card) {
    if (typeof reelViaje === 'undefined') return;
    const fm = { day: 'numeric', month: 'long', year: 'numeric' };
    let base = _stopsOf(pts, 14);
    // un solo sitio (p. ej. un mes entero en una ciudad): se reparte en varias "paradas" en el mismo punto, de 3 fotos cada una
    if (base.length === 1 && base[0].photos.length > 1) {
      const ph = base[0].photos, n = Math.min(ph.length, 15), pick = Array.from({ length: n }, (_, i) => ph[Math.floor(i * ph.length / n)]);
      base = []; for (let i = 0; i < pick.length; i += 3) { const c = pick.slice(i, i + 3); base.push({ lat: ph[0].lat, lng: ph[0].lng, t: c[0].t, photos: c, same: true }); }
    }
    const stops = base.map(s => {
      const f = countryAt(s.lat, s.lng), ph = s.photos, pick = ph.length <= 3 ? ph : [ph[0], ph[Math.floor(ph.length / 2)], ph[ph.length - 1]];
      return { lat: s.lat, lng: s.lng, t: s.t, place: f ? esName(f.a2, f.en) : '', when: s.t ? new Date(s.t).toLocaleDateString('es-ES', fm) : '', photos: pick.map(p => ({ url: p.url })) };
    });
    const ts = pts.map(p => p.t).filter(Boolean), d0 = ts.length ? new Date(Math.min(...ts)) : null, d1 = ts.length ? new Date(Math.max(...ts)) : null;
    const mes = d => d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const range = d0 ? (mes(d0) === mes(d1) ? mes(d0) : mes(d0) + ' – ' + mes(d1)) : '';
    const payload = { title: _year ? 'Mi viaje ' + (/-/.test(_year) ? MESES[+_year.split('-')[1]] : _year) : 'Mi viaje', range, stops, feats: _reelFeats(S), fotosN: pts.length, countries: S.seen.size };
    if (card) reelViaje.card(payload); else reelViaje.open(payload);
  }
  let _year = null;   // periodo elegido en el selector: año ("2025") o, si todas las fotos son de un año, mes ("2026-4"); null = todos
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function _drawMap(S, D) {
    const box = _q('#tm-fmap'); if (!box) return;
    if (_fmap) { try { _fmap.remove(); } catch (_) {} _fmap = null; }
    const PP = _photoPoints(D), sinSitio = PP.sinSitio;
    const verSin = () => { if (PP.sin.length) _lbOpen(PP.sin, 0); };
    // Selector: años si hay varios; si todas las fotos son del mismo año, meses de ese año
    const yrs = [...new Set(PP.pts.filter(p => p.t).map(p => new Date(p.t).getFullYear()))].sort();
    const byMonth = yrs.length === 1, keyOf = p => { const d = new Date(p.t); return byMonth ? d.getFullYear() + '-' + d.getMonth() : String(d.getFullYear()); };
    const keys = [...new Set(PP.pts.filter(p => p.t).sort((a, b) => a.t - b.t).map(keyOf))];
    const labelOf = k => byMonth ? MESES[+k.split('-')[1]] : k;
    if (_year && !keys.includes(_year)) _year = null;
    const pts = _year ? PP.pts.filter(p => p.t && keyOf(p) === _year) : PP.pts;
    const yb = _q('#tm-years');
    if (yb) {
      yb.hidden = keys.length < 2;
      yb.innerHTML = [null, ...keys].map(k => `<button type="button" class="tm-yr${k === _year ? ' on' : ''}" data-y="${k || ''}" aria-pressed="${k === _year}">${k ? labelOf(k) : 'Todos'}</button>`).join('');
      yb.querySelectorAll('.tm-yr').forEach(b => b.onclick = () => { _year = b.dataset.y || null; _drawMap(S, D); });
    }
    const ios = _q('#tm-ios'); if (ios) ios.hidden = !(/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    _wireUpload();
    const nt = _q('#tm-fmap-note');
    const txt = pts.length
      ? `${pts.length} ${pts.length === 1 ? 'foto' : 'fotos'} en el mapa${_year ? ' en ' + (byMonth ? labelOf(_year) + ' de ' + yrs[0] : _year) : ''}. Toca un círculo para acercarte.`
      : 'Aún no tienes fotos con ubicación ni fecha. Sube fotos de tu móvil y se pintan aquí.';
    // las que siguen sin sitio (sin GPS y sin viaje ni fechas cercanas): enlace para verlas
    nt.innerHTML = esc(txt) + (sinSitio && !_year ? ` <button type="button" class="tm-link" id="tm-sin">Ver las ${sinSitio} sin ubicación</button>` : '');
    const bs = _q('#tm-sin'); if (bs) bs.onclick = verSin;
    if (typeof L === 'undefined') { box.innerHTML = '<p class="tm-note">No se pudo cargar el mapa. Revisa la conexión.</p>'; return; }
    const map = _fmap = L.map(box, { worldCopyJump: true, minZoom: 1, maxZoom: 18 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    const cv = L.layerGroup().addTo(map), cp = L.layerGroup().addTo(map); _paintCountries({ v: cv, p: cp }, S);
    const lp = _q('#tm-fm-pl'); if (lp) lp.hidden = !cp.getLayers().length;
    const line = L.polyline(pts.map(p => [p.lat, p.lng]), { color: '#F4630B', weight: 2, opacity: .75, dashArray: '2 6' });
    const layer = L.layerGroup();
    const photos = L.layerGroup([line, layer]).addTo(map);
    const onePin = (p, lat, lng, grp, idx) => {
      const html = `<span class="tm-pin tm-pin-load tm-pin-one${p.approx ? ' tm-pin-approx' : ''}">${PIN_IMG(p.url)}</span>`;
      const m = L.marker([lat, lng], { icon: L.divIcon({ className: 'tm-pin-w', html, iconSize: [44, 44], iconAnchor: [22, 22] }) }).addTo(layer);
      m.on('click', () => _lbOpen(grp || [p], idx || 0));
    };
    const paint = () => {
      layer.clearLayers();
      const z = map.getZoom();
      _clusterPts(map, pts, z >= 15 ? 30 : z >= 12 ? 44 : 56).forEach(g => {
        const lat = g.reduce((a, p) => a + p.lat, 0) / g.length, lng = g.reduce((a, p) => a + p.lng, 0) / g.length;
        // muy cerca (zoom ≥ 16) y pocas: en abanico alrededor del punto, cada foto suelta
        if (z >= 16 && g.length > 1 && g.length <= 14) {
          const c = map.project([lat, lng], z), r = 34 + g.length * 4;
          g.forEach((p, i) => {
            const a = -Math.PI / 2 + (2 * Math.PI * i) / g.length, ll = map.unproject(L.point(c.x + r * Math.cos(a), c.y + r * Math.sin(a)), z);
            L.polyline([[lat, lng], ll], { color: '#F4630B', weight: 1, opacity: .6, interactive: false }).addTo(layer);
            onePin(p, ll.lat, ll.lng, g, i);
          });
          return;
        }
        const first = g[0];
        const html = g.length === 1
          ? `<span class="tm-pin tm-pin-load tm-pin-one${first.approx ? ' tm-pin-approx' : ''}">${PIN_IMG(first.url)}</span>`
          : `<span class="tm-pin tm-pin-load">${PIN_IMG(first.url)}<b>${g.length}</b></span>`;
        const m = L.marker([lat, lng], { icon: L.divIcon({ className: 'tm-pin-w', html, iconSize: [44, 44], iconAnchor: [22, 22] }) }).addTo(layer);
        m.on('click', () => {
          if (g.length === 1 || map.getZoom() >= 17) _lbOpen(g, 0);
          else map.fitBounds(L.latLngBounds(g.map(p => [p.lat, p.lng])), { padding: [60, 60], maxZoom: 18 });
        });
      });
    };
    map.on('zoomend', paint);
    if (pts.length) map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 14 }); else map.setView([25, 10], 2);
    paint();
    // ▶ Reproducir mi viaje: la cámara recorre las paradas por fecha, la ruta se va dibujando y salen las fotos de cada una.
    // 💶 0 €: solo mueve el mapa con las fotos ya cargadas.
    const playBtn = _q('#tm-play'), stops = pts.length > 1 ? _stopsOf(pts) : [];
    if (playBtn) {
      playBtn.hidden = stops.length < 2;
      let run = 0, trail = null, dot = null, card = null;
      const sleep = (ms, id) => new Promise(r => setTimeout(r, ms)).then(() => id === run);
      const fin = () => {
        run++; [trail, dot, card].forEach(x => { if (x) { if (x.remove) x.remove(); } }); trail = dot = card = null;
        if (_q('#tm-fm-f') && _q('#tm-fm-f').checked) photos.addTo(map);
        playBtn.textContent = '▶ Reproducir mi viaje';
      };
      playBtn.onclick = async () => {
        if (trail || card) { fin(); return; }
        const id = ++run; playBtn.textContent = '■ Parar';
        map.removeLayer(photos); map.closePopup();
        trail = L.polyline([], { color: '#F4630B', weight: 3, opacity: .9 }).addTo(map);
        dot = L.circleMarker([stops[0].lat, stops[0].lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#F4630B', fillOpacity: 1 }).addTo(map);
        card = document.createElement('div'); card.className = 'tm-play-card'; box.appendChild(card);
        map.setView([stops[0].lat, stops[0].lng], 4, { animate: false });
        for (let i = 0; i < stops.length; i++) {
          const st = stops[i]; if (id !== run) return;
          trail.addLatLng([st.lat, st.lng]); dot.setLatLng([st.lat, st.lng]);
          map.flyTo([st.lat, st.lng], st.photos.length > 1 ? 10 : 12, { duration: i ? 1.8 : .8 });
          if (!(await sleep(i ? 1900 : 900, id))) return;
          const f = countryAt(st.lat, st.lng), d = st.t ? new Date(st.t) : null;
          card.innerHTML = `<div class="tm-play-th">${st.photos.slice(0, 4).map(p => `<img src="${esc(p.url)}" alt="">`).join('')}</div><div class="tm-play-tx"><b>${f ? flagOf(f.a2) + ' ' + esc(esName(f.a2, f.en)) : ''}</b><span>${d ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} · ${st.photos.length} ${st.photos.length === 1 ? 'foto' : 'fotos'}</span><i>${i + 1} / ${stops.length}</i></div>`;
          card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
          if (!(await sleep(2600, id))) return;
        }
        if (id !== run) return;
        map.flyToBounds(trail.getBounds(), { padding: [50, 50], duration: 1.6 });
        card.innerHTML = `<div class="tm-play-tx"><b>Tu viaje completo</b><span>${stops.length} paradas · ${pts.length} fotos</span></div>`;
        if (!(await sleep(3500, id))) return;
        fin();
      };
    }
    const reelBtn = _q('#tm-reel'); if (reelBtn) { reelBtn.hidden = (stops.length < 2 && pts.length < 2) || typeof reelViaje === 'undefined'; reelBtn.onclick = () => _openReel(S, pts); }
    const cardBtn = _q('#tm-card-btn'); if (cardBtn) { cardBtn.hidden = !pts.length || typeof reelViaje === 'undefined'; cardBtn.onclick = () => _openReel(S, pts, true); }
    const on = (id, fn) => { const c = _q(id); if (c) c.onchange = () => fn(c.checked); };
    on('#tm-fm-c', v => v ? cv.addTo(map) : map.removeLayer(cv));
    on('#tm-fm-p', v => v ? cp.addTo(map) : map.removeLayer(cp));
    on('#tm-fm-f', v => v ? photos.addTo(map) : map.removeLayer(photos));
    on('#tm-fmap-route', v => v ? line.addTo(photos) : photos.removeLayer(line));
    // el tamaño del contenedor puede cambiar tras pintar (móvil): recalcular y reencuadrar para que se vea el recorrido entero
    setTimeout(() => { if (_fmap !== map) return; map.invalidateSize(); if (pts.length) map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 14 }); }, 250);
  }

  /* ── pantalla completa ── */
  function _q(s) { return document.querySelector('#tm-screen ' + s); }
  function placeName(p) { if (p.name) return p.name; if (p.trip) return p.trip; const f = countryAt(p.lat, p.lng); return f ? esName(f.a2, f.en) : '—'; }
  function getHome() { try { return JSON.parse(localStorage.getItem('bdm-casa') || 'null'); } catch (_) { return null; } }

  function renderRecords(S) {
    const R = [], home = getHome();
    if (S.places.length) {
      if (home) { const far = S.places.reduce((a, p) => hav(home, p) > hav(home, a) ? p : a, S.places[0]); R.push(['El punto más lejano de casa', placeName(far), `a ${nf(hav(home, far))} km de ${home.name || 'casa'}${far.trip ? ' · ' + far.trip : ''}`, 'home']); }
      const N = S.places.reduce((a, p) => p.lat > a.lat ? p : a), Su = S.places.reduce((a, p) => p.lat < a.lat ? p : a);
      R.push(['Lo más al norte', placeName(N), `${N.lat.toFixed(2).replace('.', ',')}° ${N.lat >= 0 ? 'N' : 'S'}${N.trip ? ' · ' + N.trip : ''}`]);
      R.push(['Lo más al sur', placeName(Su), `${Math.abs(Su.lat).toFixed(2).replace('.', ',')}° ${Su.lat >= 0 ? 'N' : 'S'}${Su.trip ? ' · ' + Su.trip : ''}`]);
    }
    if (S.visited.length) {
      const lg = S.visited.reduce((a, g) => (g.days || 0) > (a.days || 0) ? g : a); if (lg.days) R.push(['El viaje más largo', lg.title, `${lg.days} días`]);
      const km = S.visited.reduce((a, g) => g.km > a.km ? g : a); if (km.km > 1) R.push(['El de más kilómetros', km.title, `${nf(km.km)} km`]);
      const ph = S.visited.reduce((a, g) => g.nPhotos > a.nPhotos ? g : a); if (ph.nPhotos) R.push(['El de más fotos', ph.title, `${ph.nPhotos} ${ph.nPhotos === 1 ? 'foto' : 'fotos'}`]);
    }
    const top = [...S.seen.values()].sort((a, b) => b.src.size - a.src.size)[0];
    if (top && top.src.size > 1) R.push(['Tu país favorito', `${flagOf(top.f.a2)} ${esName(top.f.a2, top.f.en)}`, `${top.src.size} viajes o recuerdos`]);
    const HOME_FORM = `<form class="tm-home" id="tm-home-form" autocomplete="off">
        <input class="tm-home-in" id="tm-home-in" type="text" placeholder="Tu ciudad o pueblo" aria-label="Tu ciudad o pueblo" enterkeyhint="search">
        <button class="tm-btn" type="submit">Guardar</button>
      </form>
      <button class="tm-link" id="tm-home-gps" type="button">${IC_PIN} Usar mi ubicación actual</button>
      <span class="tm-s tm-home-msg" id="tm-home-msg"></span>`;
    _q('#tm-recs').innerHTML = R.map(([k, v, s, h]) => `<div class="tm-rec"><span class="tm-k">${esc(k)}</span><span class="tm-v">${esc(v)}</span><span class="tm-s">${esc(s)}</span>${h ? '<button class="tm-link" id="tm-home-change" type="button">Cambiar mi casa</button>' : ''}</div>`).join('') +
      (home ? '' : `<div class="tm-rec"><span class="tm-k">El punto más lejano de casa</span><span class="tm-s">¿Dónde está tu casa? Escribe tu ciudad y lo calculo.</span>${HOME_FORM}</div>`);
    const ch = _q('#tm-home-change');
    if (ch) ch.onclick = () => { const box = ch.parentElement; ch.remove(); box.insertAdjacentHTML('beforeend', HOME_FORM); _wireHome(S); _q('#tm-home-in').focus(); };
    _wireHome(S);
  }

  // Casa: se escribe la ciudad (búsqueda en OpenStreetMap/Nominatim, gratis) o se usa la ubicación.
  // 29 sept 2026: antes solo había "Mi casa es donde estoy ahora", que se quedaba en "Buscando…" si
  // el navegador no contestaba (permiso sin responder, ubicación del ordenador apagada) y que de
  // viaje guardaba como casa el sitio donde estabas.
  function _wireHome(S) {
    const form = _q('#tm-home-form'); if (!form) return;
    const msg = _q('#tm-home-msg'), inp = _q('#tm-home-in'), gps = _q('#tm-home-gps');
    const save = h => { try { localStorage.setItem('bdm-casa', JSON.stringify(h)); } catch (_) {} _paint(S); };
    form.onsubmit = async e => {
      e.preventDefault();
      const q = inp.value.trim(); if (!q) { inp.focus(); return; }
      msg.textContent = 'Buscando…';
      try {
        const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=es&q=' + encodeURIComponent(q));
        const j = await r.json();
        if (!j || !j[0]) { msg.textContent = 'No encuentro ese sitio. Prueba con la ciudad y el país.'; return; }
        // El nombre del propio sitio (San Pedro Alcántara), no el del municipio (Marbella)
        const name = String(j[0].name || String(j[0].display_name || q).split(',')[0]).trim();
        save({ lat: +j[0].lat, lng: +j[0].lon, name });
      } catch (_) { msg.textContent = 'No se pudo buscar. Revisa la conexión.'; }
    };
    gps.onclick = () => {
      if (!navigator.geolocation) { msg.textContent = 'Este navegador no da la ubicación: escribe tu ciudad.'; return; }
      msg.textContent = 'Buscando tu ubicación…';
      let done = false;
      // El navegador puede no contestar nunca (permiso sin responder): no dejarlo colgado
      const guard = setTimeout(() => { if (!done) { done = true; msg.textContent = 'No me llega tu ubicación. Revisa el permiso de ubicación o escribe tu ciudad.'; } }, 15000);
      navigator.geolocation.getCurrentPosition(async p => {
        if (done) return; done = true; clearTimeout(guard);
        const lat = p.coords.latitude, lng = p.coords.longitude;
        // Nombre del pueblo (Nominatim, gratis): pueblo/villa antes que ciudad o municipio
        let name = '';
        try {
          const a = (await (await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&accept-language=es&lat=${lat}&lon=${lng}`)).json()).address || {};
          name = a.village || a.town || a.city || a.municipality || '';
        } catch (_) {}
        save({ lat, lng, name });
      }, err => {
        if (done) return; done = true; clearTimeout(guard);
        msg.textContent = err && err.code === 1 ? 'No has dado permiso de ubicación. Escribe tu ciudad.' : 'No pude saber dónde estás. Escribe tu ciudad.';
      }, { timeout: 12000, maximumAge: 600000 });
    };
  }
  function renderTimeline(S) {
    const by = new Map(); [...S.visited].sort((a, b) => (b.date || 0) - (a.date || 0)).forEach(g => { const y = g.date ? g.date.getFullYear() : '—'; if (!by.has(y)) by.set(y, []); by.get(y).push(g); });
    _q('#tm-timeline').innerHTML = [...by].map(([y, gs]) => `<div class="tm-year"><h3>${y}</h3><div class="tm-trips">${gs.map(g => `<button type="button" class="tm-trip" data-id="${esc(g.id)}"><div class="tm-ph" style="${g.cover ? `background-image:url('${esc(g.cover)}')` : ''}"></div><div class="tm-tx"><b>${esc(g.title)}</b><span>${g.countries.map(f => flagOf(f.a2)).join(' ')} ${g.days ? g.days + ' días · ' : ''}${nf(g.km)} km · ${g.nPhotos} ${g.nPhotos === 1 ? 'foto' : 'fotos'}</span></div></button>`).join('')}</div></div>`).join('') || '<p class="tm-note">Aún no hay viajes con fotos.</p>';
    // Solo cuentan las guías con fotos o marcadas como hechas: decirlo para que no parezca que faltan
    const nPl = S.planned.length;
    _q('#tm-trips-note').textContent = nPl
      ? `Aquí salen los viajes con fotos o que marques como hechos. Tienes ${nPl} ${nPl === 1 ? 'guía más' : 'guías más'} sin fotos: marca abajo las que ya hiciste.`
      : '';
    renderPending(S);
    // Tocar un viaje → abre su guía (la misma función que usan las tarjetas de Mis Viajes)
    document.querySelectorAll('#tm-screen .tm-trip').forEach(b => b.addEventListener('click', () => {
      const g = S.visited.find(v => v.id === b.dataset.id);
      if (g && typeof salma !== 'undefined' && salma.cargarGuia) salma.cargarGuia(g.id, g.raw);
    }));
  }

  /* Guías sin fotos: botón "Ya hice este viaje" (guarda viaje_hecho en la guía; 0 €, una escritura
     de Firestore). Se recalcula en el móvil con los datos ya cargados, sin volver a leerlos. */
  function renderPending(S) {
    const sec = _q('#tm-pend-sec'); if (!sec) return;
    const list = S.visited.filter(g => g.hecho && !g.nPhotos).concat(S.planned)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    sec.hidden = !list.length;
    _q('#tm-pend-n').textContent = list.length;
    _q('#tm-pend').innerHTML = list.map(g => `<div class="tm-pend-row">
        <span class="tm-pend-t"><b>${esc(g.title)}</b><span>${(g.countries || []).map(f => flagOf(f.a2)).join(' ')} ${g.days ? g.days + ' días' : ''}</span></span>
        <button type="button" class="tm-chk" data-id="${esc(g.id)}" aria-pressed="${g.hecho ? 'true' : 'false'}">${g.hecho ? '✓ Hecho' : 'Ya lo hice'}</button>
      </div>`).join('');
    document.querySelectorAll('#tm-screen .tm-chk').forEach(b => b.addEventListener('click', async () => {
      const u = window.currentUser; if (!u || !_cache) return;
      const g = _cache.D.guides.find(x => x.id === b.dataset.id); if (!g) return;
      const val = !g.hecho;
      b.disabled = true;
      try {
        await firebase.firestore().collection('users').doc(u.uid).collection('maps').doc(g.id).update({ viaje_hecho: val });
        g.hecho = val; g.raw.viaje_hecho = val;
        const S2 = compute(_cache.D); _cache.S = S2; _saveSummary(u.uid, S2);
        _paint(S2);
        const d = _q('#tm-pend-sec'); if (d) d.open = true; // que no se cierre la lista al marcar
      } catch (e) {
        b.disabled = false; b.textContent = 'No se pudo guardar';
      }
    }));
  }

  /* tarjeta para compartir (story 1080×1920) */
  async function makeCard(S) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d');
    g.fillStyle = '#0D0F10'; g.fillRect(0, 0, 1080, 1920);
    const m = document.createElement('canvas'); m.width = 1080; m.height = 560; drawWorld(m, S, { sea: '#0D0F10' }); g.drawImage(m, 0, 430);
    const nP = S.seen.size, pct = nP / TOTAL_PAISES * 100;
    g.fillStyle = '#ECEBE8'; g.font = '800 150px "Barlow Condensed",sans-serif'; { const t = 'MI VUELTA AL MUNDO', w = g.measureText(t).width; if (w > 920) g.font = `800 ${Math.floor(150 * 920 / w)}px "Barlow Condensed",sans-serif`; g.fillText(t, 80, 260); }
    g.fillStyle = '#F4630B'; g.font = '800 44px "Barlow Condensed",sans-serif'; g.fillText('BORRADO DEL MAPA', 84, 330);
    const home = getHome(); if (home && home.name) { g.fillStyle = '#C4C7C9'; g.font = '700 40px "Barlow Condensed",sans-serif'; g.fillText('DESDE ' + home.name.toUpperCase(), 84, 392); }
    const st = [[nP, nP === 1 ? 'PAÍS' : 'PAÍSES'], [pctTxt(pct) + '%', 'DEL MUNDO'], [nf(S.km), 'KM'], [nf(S.days), 'DÍAS']];
    st.forEach(([b, l], i) => { const x = 80 + (i % 2) * 470, y = 1120 + Math.floor(i / 2) * 250; g.fillStyle = '#F4630B'; g.font = '800 150px "Barlow Condensed",sans-serif'; g.fillText(String(b), x, y + 130); g.fillStyle = '#C4C7C9'; g.font = '600 30px Inter,sans-serif'; g.fillText(l, x + 6, y + 180); });
    const flags = [...S.seen.values()].map(e => flagOf(e.f.a2)).join(' '); g.font = '64px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif';
    let line = '', y = 1680; flags.split(' ').forEach(f => { if (g.measureText(line + f + ' ').width > 920) { g.fillText(line, 80, y); line = ''; y += 80; } line += f + ' '; }); if (line && y < 1850) g.fillText(line, 80, y);
    g.fillStyle = '#9A9EA1'; g.font = '600 30px Inter,sans-serif'; g.fillText('borradodelmapa.com', 80, 1870);
    return new Promise(r => c.toBlob(r, 'image/png'));
  }

  function _paint(S) {
    const nP = S.seen.size, pct = nP / TOTAL_PAISES * 100;
    const home = getHome();
    _q('#tm-lede').textContent = nP
      ? `${home && home.name ? `Desde ${home.name} has` : 'Has'} pisado ${nP} ${nP === 1 ? 'país' : 'países'}: el ${pctTxt(pct)} % del mundo. Y lo que te queda.`
      : 'Todavía no hay fotos tuyas en ninguna guía. Sube fotos a tus viajes y tu mapa se irá pintando.';
    _q('#tm-big').innerHTML = [[nP, nP === 1 ? 'país' : 'países'], [pctTxt(pct) + ' %', 'del mundo'], [nf(S.km), 'km'], [nf(S.days), 'días de viaje'], [S.visited.length, S.visited.length === 1 ? 'viaje' : 'viajes'], [nf(S.nFotos), 'fotos']]
      .map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('');
    const list = [...S.seen.values()].sort((a, b) => b.n - a.n);
    _q('#tm-flags').innerHTML = list.map(e => `<span><b>${flagOf(e.f.a2)}</b>${esc(esName(e.f.a2, e.f.en))}</span>`).join('') || '<span>Aún ninguno</span>';
    renderRecords(S); renderTimeline(S);
    const pl = [...S.plan.values()]; _q('#tm-next-sec').hidden = !pl.length;
    _q('#tm-next').innerHTML = pl.map(e => `<span>${flagOf(e.f.a2)} ${esc(esName(e.f.a2, e.f.en))}</span>`).join('');
    const b = _q('#tm-share');
    b.onclick = async () => {
      b.disabled = true; const old = b.innerHTML; b.textContent = 'Creando…';
      try {
        try { await document.fonts.load('800 40px "Barlow Condensed"'); } catch (_) {}
        const blob = await makeCard(S); const url = URL.createObjectURL(blob); _q('#tm-card-img').src = url; _q('#tm-card').hidden = false;
        const file = new File([blob], 'mi-mundo-borradodelmapa.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Mi vuelta al mundo', text: window.SHARE_INVITE_FULL }); } catch (e) {} }
        else { const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); _q('#tm-share-note').textContent = 'Tarjeta descargada: compártela desde tu galería.'; }
      } catch (e) { _q('#tm-share-note').textContent = 'No se pudo crear la tarjeta. Prueba otra vez.'; }
      b.disabled = false; b.innerHTML = old;
    };
  }

  /* ── Mi mundo público (19 oct 2026, caso p-mvea7qqetzp) ──
     Lo que sale en el enlace: países, cifras y puntos del recorrido a ~1 km. Sin fotos (todavía), sin documentos,
     sin tu casa (nada a menos de 5 km de la casa guardada). El servidor valida que seas tú (token de Firebase). */
  const API_BASE = () => String(window.SALMA_API || 'https://salma-api.borradodelmapa-api.workers.dev').replace(/\/$/, '');
  async function _pubFetch(path, method, body) {
    const u = firebase.auth().currentUser; if (!u) throw new Error('Sin sesión');
    const t = await u.getIdToken();
    const r = await fetch(API_BASE() + path, { method, headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Error ' + r.status);
    return j;
  }
  let _pubSel = new Set();   // ids de las fotos elegidas para el enlace público
  function _pubPayload(S) {
    const home = getHome(), seen = new Set(), out = [];
    const paises = [...S.seen.values()].map(e => e.f.a2).filter(Boolean);
    const planeados = [...S.plan.values()].map(e => e.f.a2).filter(a => a && !paises.includes(a));
    S.places.forEach(p => {
      if (home && hav(home, p) < 5) return; // nunca cerca de casa
      const k = (+p.lat).toFixed(2) + ',' + (+p.lng).toFixed(2); if (seen.has(k)) return; seen.add(k);
      // solo nombre de paradas de guías; los pies de foto y pins personales no salen
      out.push({ lat: +p.lat, lng: +p.lng, name: p.trip ? p.name : '' });
    });
    // récords (sin «el más lejano de casa»: delataría dónde vives) y viajes; los hechos solo cerca de casa se omiten
    const lejos = S.places.filter(p => !(home && hav(home, p) < 5)), pn = p => { const f = countryAt(p.lat, p.lng), pais = f ? esName(f.a2, f.en) : ''; return p.trip && p.name ? p.name + (pais ? ' · ' + pais : '') : pais; }; // pies de foto y pins personales no salen
    const records = [], dec = (x, ns) => Math.abs(x).toFixed(2).replace('.', ',') + '° ' + ns;
    if (lejos.length) {
      const N = lejos.reduce((a, p) => p.lat > a.lat ? p : a), Su = lejos.reduce((a, p) => p.lat < a.lat ? p : a);
      records.push({ k: 'Lo más al norte', v: pn(N), s: dec(N.lat, N.lat >= 0 ? 'N' : 'S') }, { k: 'Lo más al sur', v: pn(Su), s: dec(Su.lat, Su.lat >= 0 ? 'N' : 'S') });
    }
    const vis = S.visited.filter(g => !(home && g.stops.length && g.stops.every(s => hav(home, s) < 5)));
    if (vis.length) {
      const lg = vis.reduce((a, g) => (g.days || 0) > (a.days || 0) ? g : a); if (lg.days) records.push({ k: 'El viaje más largo', v: lg.title, s: lg.days + ' días' });
      const km = vis.reduce((a, g) => g.km > a.km ? g : a); if (km.km > 1) records.push({ k: 'El de más kilómetros', v: km.title, s: nf(km.km) + ' km' });
      const ph = vis.reduce((a, g) => g.nPhotos > a.nPhotos ? g : a); if (ph.nPhotos) records.push({ k: 'El de más fotos', v: ph.title, s: ph.nPhotos + (ph.nPhotos === 1 ? ' foto' : ' fotos') });
    }
    const top = [...S.seen.values()].sort((a, b) => b.src.size - a.src.size)[0];
    if (top && top.src.size > 1) records.push({ k: 'Su país favorito', v: esName(top.f.a2, top.f.en), s: top.src.size + ' viajes o recuerdos' });
    const viajes = vis.slice().sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 60).map(g => ({ title: g.title, year: g.date ? new Date(g.date).getFullYear() : 0, countries: g.countries.map(f => f.a2).filter(Boolean), days: g.days || 0, km: Math.round(g.km), fotos: g.nPhotos || 0 }));
    return { paises, planeados, paradas: out.slice(0, 300), records, viajes, fotos: _pubFotos(), cifras: { paises: S.seen.size, km: Math.round(S.km), viajes: S.visited.length, dias: S.days } };
  }
  // fotos elegidas: solo el id y, si se sabe, el sitio (el servidor lee la foto de TU cuenta y la redondea); nada cerca de casa
  function _pubFotos() {
    if (!_cache || !_pubSel.size) return [];
    const PP = _photoPoints(_cache.D), home = getHome(), by = new Map([...PP.pts, ...PP.sin].map(p => [p.id, p]));
    return [..._pubSel].map(id => by.get(id)).filter(p => p && !(home && p.has && hav(home, p) < 5)).slice(0, 60).map(p => p.has ? { id: p.id, lat: p.lat, lng: p.lng } : { id: p.id });
  }
  async function _wirePublic(S) {
    const row = _q('#tm-pub-row'), info = _q('#tm-pub-info'), msg = _q('#tm-pub-msg'); if (!row) return;
    const home = getHome();
    let paint = est => {
      const url = est && est.slug ? 'https://borradodelmapa.com/mundo/' + est.slug : '';
      info.textContent = url
        ? 'Tu mundo está publicado. Cualquiera con el enlace lo ve, sin cuenta: tus países, tus cifras y los puntos de tu recorrido (a ~1 km, nunca tu casa) y las fotos que elijas.'
        : 'Publica un enlace para que cualquiera vea tu vuelta al mundo sin cuenta: tus países, tus cifras y los puntos de tu recorrido (a ~1 km). Las fotos las eliges tú, abajo' + (home ? ', y nada a menos de 5 km de tu casa.' : '. Consejo: guarda antes tu casa (en Tus récords) y no saldrá nada cerca de ella.');
      row.innerHTML = url
        ? `<input class="tm-home-in" id="tm-pub-url" type="text" readonly value="${esc(url)}" aria-label="Tu enlace">
           <button class="tm-btn" id="tm-pub-copy" type="button">${IC_SHARE} Compartir</button>
           <button class="tm-btn" id="tm-pub-upd" type="button">Actualizar mi enlace</button>
           <button class="tm-link" id="tm-pub-off" type="button">Despublicar</button>`
        : '<button class="tm-btn" id="tm-pub-on" type="button">🌍 Publicar mi mundo</button>';
      const run = async (fn, okTxt) => { msg.textContent = 'Un momento…'; try { const r = await fn(); msg.textContent = okTxt || ''; return r; } catch (e) { msg.textContent = e.message || 'No se pudo. Prueba otra vez.'; } };
      const pub = async () => { const r = await run(() => _pubFetch('/mundo/publicar', 'POST', _pubPayload(_cache.S)), 'Listo: tu enlace está al día.'); if (r && r.slug) paint({ slug: r.slug }); };
      const on = _q('#tm-pub-on'); if (on) on.onclick = pub;
      const upd = _q('#tm-pub-upd'); if (upd) upd.onclick = pub;
      const off = _q('#tm-pub-off'); if (off) off.onclick = async () => { if (!confirm('¿Despublicar? El enlace dejará de funcionar.')) return; const r = await run(() => _pubFetch('/mundo/despublicar', 'POST'), 'Despublicado: el enlace ya no funciona.'); if (r) paint(null); };
      const cp = _q('#tm-pub-copy'); if (cp) cp.onclick = async () => {
        if (navigator.share) { try { await navigator.share({ title: 'Mi vuelta al mundo', text: 'Mi vuelta al mundo en Borrado del Mapa', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
        try { await navigator.clipboard.writeText(url); msg.textContent = 'Enlace copiado.'; } catch (_) { _q('#tm-pub-url').select(); msg.textContent = 'Cópialo y compártelo.'; }
      };
    };
    // ── fotos del enlace: toca una para añadirla o quitarla; si el enlace ya está publicado se actualiza solo ──
    const box = _q('#tm-pub-ph');
    let timer = null, published = false;
    const share = !(window.currentUser && window.currentUser.share_routes === false);
    const apply = now => {
      if (!published) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        msg.textContent = 'Actualizando tu enlace…';
        try { const r = await _pubFetch('/mundo/publicar', 'POST', _pubPayload(_cache.S)); msg.textContent = r.fotosOmitidas ? 'Activa «Compartir mis rutas» en tu Perfil para que salgan fotos.' : 'Enlace al día.'; }
        catch (e) { msg.textContent = e.message || 'No se pudo actualizar. Prueba otra vez.'; }
      }, now ? 0 : 900);
    };
    window._tmPubRefresh = () => { drawPh(); apply(true); };
    const drawPh = () => {
      if (!box) return;
      if (!share) { box.innerHTML = '<p class="tm-note">Para poner fotos en tu enlace activa «Compartir mis rutas» en tu Perfil.</p>'; return; }
      const PP = _photoPoints(_cache.D), home2 = getHome();
      const all = [...PP.pts, ...PP.sin].filter(p => p.url).sort((a, b) => (b.t || 0) - (a.t || 0)).slice(0, 150);
      if (!all.length) { box.innerHTML = ''; return; }
      box.innerHTML = '<h4 class="tm-pubph-h">Fotos en tu vuelta al mundo <span id="tm-pubph-n"></span></h4><p class="tm-note">Ninguna sale si no la eliges. Toca una para ponerla o quitarla (se actualiza solo). No salen documentos ni fotos a menos de 5 km de tu casa.</p><div class="tm-pubph">' +
        all.map(p => { const cerca = home2 && p.has && hav(home2, p) < 5; return `<button type="button" class="tm-pubph-i${_pubSel.has(p.id) ? ' on' : ''}" data-id="${esc(p.id)}" ${cerca ? 'disabled title="Cerca de tu casa"' : ''} aria-pressed="${_pubSel.has(p.id)}"><img src="${esc(p.url)}" alt="" loading="lazy"><i>✓</i></button>`; }).join('') +
        '</div><button class="tm-link" id="tm-pubph-clear" type="button" hidden>Quitar fotos seleccionadas</button>';
      const cnt = () => { const n = _q('#tm-pubph-n'); if (n) n.textContent = _pubSel.size ? '(' + _pubSel.size + ')' : ''; const cl = _q('#tm-pubph-clear'); if (cl) cl.hidden = !_pubSel.size; };
      cnt();
      box.querySelectorAll('.tm-pubph-i').forEach(b => b.onclick = () => {
        const id = b.dataset.id; if (_pubSel.has(id)) _pubSel.delete(id); else if (_pubSel.size >= 60) { msg.textContent = 'Máximo 60 fotos en el enlace.'; return; } else _pubSel.add(id);
        b.classList.toggle('on', _pubSel.has(id)); b.setAttribute('aria-pressed', _pubSel.has(id)); cnt(); apply();
      });
      _q('#tm-pubph-clear').onclick = async () => {
        const ids = [..._pubSel]; if (!ids.length) return;
        const loose = new Set(_cache.D.photos.filter(p => !p.routeId).map(p => p.id)), nLoose = ids.filter(i => loose.has(i)).length, enGuia = ids.length - nLoose;
        if (!confirm('¿Borrar ' + (nLoose === 1 ? 'la foto seleccionada' : nLoose + ' fotos seleccionadas') + ' de tu cuenta? Desaparecen de tu mapa, de Tu vuelta al mundo y de tu enlace público. No se puede deshacer.' + (enGuia ? ' Las ' + enGuia + ' que están dentro de una guía no se borran: solo se quitan del enlace.' : ''))) return;
        msg.textContent = 'Borrando…';
        try { const k = await _borrarFotos(ids); _pubSel.clear(); drawPh(); if (typeof showToast === 'function') showToast(k + (k === 1 ? ' foto borrada' : ' fotos borradas')); msg.textContent = ''; apply(true); }
        catch (e) { msg.textContent = 'No se pudo borrar. Prueba otra vez.'; }
      };
    };
    const paint0 = paint;
    paint = est => { published = !!(est && est.slug); paint0(est); };
    _pubSel = new Set(); paint(null); drawPh();
    try { const est = await _pubFetch('/mundo/estado', 'GET'); if (est && est.publicado && document.getElementById('tm-pub')) { _pubSel = new Set(est.fotos || []); paint(est); drawPh(); } } catch (_) {}
  }

  async function render() {
    const $c = document.getElementById('app-content');
    if (!window.currentUser) { window._afterLogin = 'tu-mundo'; if (typeof openModal === 'function') openModal(); return; }
    $c.innerHTML = `
      <div class="tm-screen fade-in" id="tm-screen">
        <button class="tm-back" id="tm-back" type="button">‹ Mis Viajes</button>
        <header class="tm-head">
          <h2 class="tm-title">Tu vuelta al <span>mundo</span></h2>
          <p class="tm-lede" id="tm-lede">Cargando tus viajes…</p>
        </header>
        <div id="tm-body" hidden>
          <section class="tm-big" id="tm-big"></section>
          <section class="tm-mapw">
            <div class="tm-mapbar">
              <p class="tm-note" id="tm-fmap-note"></p>
              <button type="button" class="tm-btn tm-play" id="tm-play" hidden>▶ Reproducir mi viaje</button>
              <button type="button" class="tm-btn tm-play" id="tm-reel" hidden>🎬 Crear Reel</button>
              <button type="button" class="tm-btn tm-play" id="tm-card-btn" hidden>🖼 Tarjeta</button>
              <label class="tm-btn tm-fmap-up" id="tm-fmap-up">＋ Subir fotos<input type="file" id="tm-fmap-in" accept="image/*" multiple hidden></label>
              <p class="tm-note" id="tm-fmap-msg"></p>
              <p class="tm-note tm-ios" id="tm-ios" hidden>En iPhone: al elegir las fotos pulsa «Opciones» (abajo a la izquierda) y activa «Ubicación». Si no, el móvil quita el sitio de las fotos y no salen en el mapa.</p>
            </div>
            <div class="tm-years" id="tm-years" hidden></div>
            <div class="tm-fmap" id="tm-fmap"></div>
            <div class="tm-legend">
              <label><input type="checkbox" id="tm-fm-c" checked> <i style="background:#F4630B"></i>Has estado</label>
              <label><input type="checkbox" id="tm-fm-f" checked> Fotos</label>
              <label><input type="checkbox" id="tm-fmap-route" checked> Recorrido por fechas</label>
              <label id="tm-fm-pl"><input type="checkbox" id="tm-fm-p" checked> <i style="background:#7a3a14"></i>Planeado, aún no</label>
            </div>
          </section>
          <section><h3 class="tm-h">Tus países</h3><div class="tm-flags" id="tm-flags"></div></section>
          <section><h3 class="tm-h">Tus récords</h3><div class="tm-recs" id="tm-recs"></div></section>
          <section><h3 class="tm-h">Comparte tu vuelta al mundo</h3>
            <button class="tm-btn" id="tm-share" type="button">${IC_SHARE} Crear tarjeta para compartir</button>
            <p class="tm-note" id="tm-share-note"></p>
            <div class="tm-card" id="tm-card" hidden><img id="tm-card-img" alt="Tarjeta de tu vuelta al mundo"></div>
          </section>
          <section id="tm-pub"><h3 class="tm-h">Tu enlace público</h3>
            <p class="tm-note" id="tm-pub-info"></p>
            <div class="tm-pub-row" id="tm-pub-row"></div>
            <p class="tm-note" id="tm-pub-msg"></p>
            <div id="tm-pub-ph"></div>
          </section>
          <section id="tm-sug-sec" hidden><h3 class="tm-h">Fotos que encajan con tus guías</h3>
            <p class="tm-note" id="tm-sug-note"></p><div class="tm-sug" id="tm-sug"></div></section>
          <section><h3 class="tm-h">Tus viajes</h3><p class="tm-note" id="tm-trips-note"></p><div class="tm-timeline" id="tm-timeline"></div>
            <details class="tm-pend-sec" id="tm-pend-sec" hidden><summary>Tus guías sin fotos (<span id="tm-pend-n"></span>)</summary><div class="tm-pend" id="tm-pend"></div></details></section>
          <section id="tm-next-sec" hidden><h3 class="tm-h">Tus próximos destinos</h3><div class="tm-next" id="tm-next"></div></section>
        </div>
      </div>`;
    document.getElementById('tm-back').addEventListener('click', () => { window._rutasTab = 'mis'; showState('rutas'); });
    try {
      const S = await _getStats(true);
      if (!document.getElementById('tm-screen')) return; // el usuario ya se fue a otra pantalla
      _q('#tm-body').hidden = false;
      _paint(S);
      _wirePublic(S);
      try { _drawMap(S, _cache.D); _renderSuggest(S, _cache.D); } catch (e2) { console.warn('[tu-mundo] mapa de fotos', e2); }
    } catch (e) {
      const l = document.getElementById('tm-lede');
      if (l) l.textContent = 'No se pudieron cargar tus viajes. Revisa la conexión y vuelve a entrar.';
    }
  }

  return { render, strip };
})();
window.tuMundo = tuMundo;
