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
  async function _getStats(force) {
    const u = window.currentUser; if (!u) throw new Error('Sin sesión');
    if (!force && _cache && _cache.uid === u.uid) return _cache.S;
    const [D] = await Promise.all([loadUser(u.uid), loadWorld()]);
    const S = compute(D);
    _cache = { uid: u.uid, D, S };
    _saveSummary(u.uid, S);
    return S;
  }

  /* ── franja de Mis Viajes ── */
  function _stripHTML(sum) {
    if (!sum) return `<span class="tm-strip-ic">${IC_GLOBE}</span><span class="tm-strip-txt"><b>Tu mundo</b><span>Tus países, kilómetros y récords</span></span><span class="tm-strip-go">→</span>`;
    const pct = sum.n / TOTAL_PAISES * 100;
    const flags = (sum.flags || []).slice(0, 8).map(flagOf).join(' ');
    if (!sum.n) return `<span class="tm-strip-ic">${IC_GLOBE}</span><span class="tm-strip-txt"><b>Tu mundo</b><span>Sube fotos a tus viajes y tu mapa se irá pintando</span></span><span class="tm-strip-go">→</span>`;
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
    el.setAttribute('aria-label', 'Abrir Tu mundo');
    const sum = _readSummary(u.uid);
    el.innerHTML = _stripHTML(sum);
    const go = () => showState('tu-mundo');
    el.addEventListener('click', go);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    // Recalcular en segundo plano si no hay resumen o tiene más de 12 h
    if (!sum || Date.now() - sum.t > SUM_TTL) {
      _getStats(true).then(() => { if (el.isConnected) el.innerHTML = _stripHTML(_readSummary(u.uid)); }).catch(() => {});
    }
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
    g.fillStyle = '#ECEBE8'; g.font = '800 150px "Barlow Condensed",sans-serif'; g.fillText('MI MUNDO', 80, 260);
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
    drawWorld(_q('#tm-world'), S);
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
        if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Mi mundo', text: 'Mi mapa de viajero en borradodelmapa.com' }); } catch (e) {} }
        else { const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); _q('#tm-share-note').textContent = 'Tarjeta descargada: compártela desde tu galería.'; }
      } catch (e) { _q('#tm-share-note').textContent = 'No se pudo crear la tarjeta. Prueba otra vez.'; }
      b.disabled = false; b.innerHTML = old;
    };
  }

  async function render() {
    const $c = document.getElementById('app-content');
    if (!window.currentUser) { window._afterLogin = 'tu-mundo'; if (typeof openModal === 'function') openModal(); return; }
    $c.innerHTML = `
      <div class="tm-screen fade-in" id="tm-screen">
        <button class="tm-back" id="tm-back" type="button">‹ Mis Viajes</button>
        <header class="tm-head">
          <h2 class="tm-title">Tu <span>mundo</span></h2>
          <p class="tm-lede" id="tm-lede">Cargando tus viajes…</p>
        </header>
        <div id="tm-body" hidden>
          <section class="tm-big" id="tm-big"></section>
          <section class="tm-mapw">
            <canvas id="tm-world" width="1600" height="820"></canvas>
            <div class="tm-legend"><span><i style="background:#F4630B"></i>Has estado</span><span><i style="background:#7a3a14"></i>Planeado, aún no</span></div>
          </section>
          <section><h3 class="tm-h">Tus países</h3><div class="tm-flags" id="tm-flags"></div></section>
          <section><h3 class="tm-h">Tus récords</h3><div class="tm-recs" id="tm-recs"></div></section>
          <section><h3 class="tm-h">Comparte tu mundo</h3>
            <button class="tm-btn" id="tm-share" type="button">${IC_SHARE} Crear tarjeta para compartir</button>
            <p class="tm-note" id="tm-share-note"></p>
            <div class="tm-card" id="tm-card" hidden><img id="tm-card-img" alt="Tarjeta de tu mundo"></div>
          </section>
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
    } catch (e) {
      const l = document.getElementById('tm-lede');
      if (l) l.textContent = 'No se pudieron cargar tus viajes. Revisa la conexión y vuelve a entrar.';
    }
  }

  return { render, strip };
})();
window.tuMundo = tuMundo;
