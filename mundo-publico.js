/* ═══ MI MUNDO PÚBLICO (19 oct 2026, caso p-mvea7qqetzp) — borradodelmapa.com/mundo/<nombre> ═══
   Página SIN cuenta que pinta la copia pública de «Tu mundo» (Worker: GET /mundo/datos). La carga 404.html
   cuando la ruta empieza por /mundo/. Todo lo que viene del servidor se escapa con esc() antes de pintarlo.
   Fase 1: países, cifras y puntos del recorrido (coordenadas redondeadas a ~1 km). Sin fotos todavía. */
(function () {
  const API = (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).get('api')) || window.SALMA_API;
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = n => Math.round(+n || 0).toLocaleString('es-ES');
  const ISO = {"533":"AW","004":"AF","024":"AO","660":"AI","248":"AX","008":"AL","020":"AD","784":"AE","032":"AR","051":"AM","016":"AS","010":"AQ","260":"TF","028":"AG","036":"AU","040":"AT","031":"AZ","108":"BI","056":"BE","204":"BJ","535":"BQ","854":"BF","050":"BD","100":"BG","048":"BH","044":"BS","070":"BA","652":"BL","112":"BY","084":"BZ","060":"BM","068":"BO","076":"BR","052":"BB","096":"BN","064":"BT","074":"BV","072":"BW","140":"CF","124":"CA","166":"CC","756":"CH","152":"CL","156":"CN","384":"CI","120":"CM","180":"CD","178":"CG","184":"CK","170":"CO","174":"KM","132":"CV","188":"CR","192":"CU","531":"CW","162":"CX","136":"KY","196":"CY","203":"CZ","276":"DE","262":"DJ","212":"DM","208":"DK","214":"DO","012":"DZ","218":"EC","818":"EG","232":"ER","732":"EH","724":"ES","233":"EE","231":"ET","246":"FI","242":"FJ","238":"FK","250":"FR","234":"FO","583":"FM","266":"GA","826":"GB","268":"GE","831":"GG","288":"GH","292":"GI","324":"GN","312":"GP","270":"GM","624":"GW","226":"GQ","300":"GR","308":"GD","304":"GL","320":"GT","254":"GF","316":"GU","328":"GY","344":"HK","334":"HM","340":"HN","191":"HR","332":"HT","348":"HU","360":"ID","833":"IM","356":"IN","086":"IO","372":"IE","364":"IR","368":"IQ","352":"IS","376":"IL","380":"IT","388":"JM","832":"JE","400":"JO","392":"JP","398":"KZ","404":"KE","417":"KG","116":"KH","296":"KI","659":"KN","410":"KR","414":"KW","418":"LA","422":"LB","430":"LR","434":"LY","662":"LC","438":"LI","144":"LK","426":"LS","440":"LT","442":"LU","428":"LV","446":"MO","663":"MF","504":"MA","492":"MC","498":"MD","450":"MG","462":"MV","484":"MX","584":"MH","807":"MK","466":"ML","470":"MT","104":"MM","499":"ME","496":"MN","580":"MP","508":"MZ","478":"MR","500":"MS","474":"MQ","480":"MU","454":"MW","458":"MY","175":"YT","516":"NA","540":"NC","562":"NE","574":"NF","566":"NG","558":"NI","570":"NU","528":"NL","578":"NO","524":"NP","520":"NR","554":"NZ","512":"OM","586":"PK","591":"PA","612":"PN","604":"PE","608":"PH","585":"PW","598":"PG","616":"PL","630":"PR","408":"KP","620":"PT","600":"PY","275":"PS","258":"PF","634":"QA","638":"RE","642":"RO","643":"RU","646":"RW","682":"SA","729":"SD","686":"SN","702":"SG","239":"GS","654":"SH","744":"SJ","090":"SB","694":"SL","222":"SV","674":"SM","706":"SO","666":"PM","688":"RS","728":"SS","678":"ST","740":"SR","703":"SK","705":"SI","752":"SE","748":"SZ","534":"SX","690":"SC","760":"SY","796":"TC","148":"TD","768":"TG","764":"TH","762":"TJ","772":"TK","795":"TM","626":"TL","776":"TO","780":"TT","788":"TN","792":"TR","798":"TV","158":"TW","834":"TZ","800":"UG","804":"UA","581":"UM","858":"UY","840":"US","860":"UZ","336":"VA","670":"VC","862":"VE","092":"VG","850":"VI","704":"VN","548":"VU","876":"WF","882":"WS","887":"YE","710":"ZA","894":"ZM","716":"ZW","-99":""};
  const dn = (() => { try { return new Intl.DisplayNames(['es'], { type: 'region' }); } catch (_) { return null; } })();
  const flagOf = a2 => a2 && a2.length === 2 ? String.fromCodePoint(...[...a2.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '';
  const nameOf = a2 => { try { return dn ? dn.of(a2) : a2; } catch (_) { return a2; } };
  const $c = document.getElementById('public-content');
  const slug = (location.pathname.match(/^\/mundo\/([a-z0-9-]+)\/?$/) || [])[1] || '';
  function _loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function setMeta(id, v) { const e = document.getElementById(id); if (e) e.setAttribute(e.tagName === 'TITLE' ? 'text' : 'content', v); }
  function notFound() {
    document.title = 'Mundo no encontrado · Borrado del Mapa';
    $c.innerHTML = '<div class="public-error"><h2>Este mundo no está publicado</h2><p>Puede que el enlace esté mal escrito o que su dueño lo haya retirado.</p><a class="btn-primary" href="/">Crea el tuyo en Borrado del Mapa</a></div>';
  }
  async function main() {
    if (!slug || !API) return notFound();
    let d;
    try {
      const r = await fetch(API.replace(/\/$/, '') + '/mundo/datos?slug=' + encodeURIComponent(slug));
      if (!r.ok) return notFound();
      d = await r.json();
    } catch (_) { $c.innerHTML = '<div class="public-error"><h2>No se pudo cargar</h2><p>Revisa la conexión y vuelve a intentarlo.</p></div>'; return; }
    const c = d.cifras || {}, paises = d.paises || [], planeados = (d.planeados || []).filter(x => !paises.includes(x)), nombre = d.nombre || 'Un viajero';
    const titulo = d.titulo || ('El mundo de ' + nombre);
    const desc = nombre + ' ha pisado ' + (c.paises || paises.length) + ' países' + (c.km ? ' y recorrido ' + nf(c.km) + ' km' : '') + '. Mira su vuelta al mundo y crea la tuya con Salma.';
    document.title = titulo + ' · Borrado del Mapa';
    setMeta('page-desc', desc); setMeta('og-title', titulo); setMeta('og-desc', desc);
    const og = document.getElementById('og-type'); if (og) og.setAttribute('content', 'website');
    const flags = paises.map(a => '<span class="mp-flag" title="' + esc(nameOf(a)) + '">' + flagOf(a) + '</span>').join('');
    const cifra = (n, l) => '<div class="mp-cif"><b>' + nf(n) + '</b><span>' + l + '</span></div>';
    $c.innerHTML = '<div class="mp">' +
      '<h1 class="mp-title">' + esc(titulo) + '</h1>' +
      '<p class="mp-sub">Su vuelta al mundo, con Salma</p>' +
      '<div class="mp-cifs">' + cifra(c.paises || paises.length, 'países') + (c.km ? cifra(c.km, 'km') : '') + (c.viajes ? cifra(c.viajes, 'viajes') : '') + (c.dias ? cifra(c.dias, 'días') : '') + '</div>' +
      '<div class="mp-map" id="mp-map"></div>' +
      '<div class="mp-leg"><span><i style="background:#F4630B"></i>Ha estado</span>' + (planeados.length ? '<span><i style="background:#7a3a14"></i>Planeado, aún no</span>' : '') + '</div>' +
      (flags ? '<div class="mp-flags">' + flags + '</div>' : '') +
      ((d.records || []).length ? '<section><h2 class="mp-h">Sus récords</h2><div class="mp-recs">' + d.records.map(r => '<div class="mp-rec"><span class="mp-k">' + esc(r.k) + '</span><b>' + esc(r.v) + '</b><span class="mp-s">' + esc(r.s) + '</span></div>').join('') + '</div></section>' : '') +
      ((d.viajes || []).length ? '<section><h2 class="mp-h">Sus viajes</h2><div class="mp-trips">' + d.viajes.map(t => '<div class="mp-trip"><b>' + esc(t.title) + '</b><span>' + (t.countries || []).map(flagOf).join(' ') + ' ' + (t.year ? t.year + ' · ' : '') + (t.days ? t.days + ' días · ' : '') + nf(t.km) + ' km' + (t.fotos ? ' · ' + t.fotos + (t.fotos === 1 ? ' foto' : ' fotos') : '') + '</span></div>').join('') + '</div></section>' : '') +
      '<div class="mp-cta"><h2>¿Y tu vuelta al mundo?</h2><p>Crea tu cuenta gratis, planea tu próximo viaje con Salma y pinta tu propio mapa.</p><a class="btn-primary" href="/">Crear mi mundo</a></div>' +
      '</div>';
    if (typeof L === 'undefined') return;
    try {
      if (typeof topojson === 'undefined') await _loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js');
      const topo = await (await fetch('/vendor/countries-50m.json')).json();
      const fc = topojson.feature(topo, topo.objects.countries);
      const map = L.map('mp-map', { worldCopyJump: true, minZoom: 1, maxZoom: 14 });
      map.setView([25, 10], 2); // vista inicial antes de añadir capas (Leaflet la exige)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      const vis = new Set(paises), pla = new Set(planeados);
      const grp = L.featureGroup().addTo(map);
      fc.features.forEach(f => {
        if (!f.geometry) return;
        const a2 = ISO[f.id] || (f.properties.name === 'Kosovo' ? 'XK' : ''), v = vis.has(a2), p = !v && pla.has(a2);
        if (!v && !p) return;
        L.geoJSON(f, { style: { color: v ? '#F4630B' : '#a8541c', weight: 1, fillColor: v ? '#F4630B' : '#7a3a14', fillOpacity: v ? .38 : .3 }, interactive: false }).addTo(grp);
      });
      const pts = (d.paradas || []).filter(p => isFinite(p.lat) && isFinite(p.lng));
      pts.forEach(p => { const m = L.circleMarker([p.lat, p.lng], { radius: 5, color: '#fff', weight: 2, fillColor: '#F4630B', fillOpacity: 1 }).addTo(map); if (p.name) m.bindTooltip(esc(p.name)); });
      map.invalidateSize();
      // con puntos: se encuadran ellos (los contornos de países con islas lejanas, como Francia, estirarían demasiado); sin puntos, los países
      const bb = pts.length ? L.latLngBounds(pts.map(p => [p.lat, p.lng])) : (grp.getLayers().length ? grp.getBounds() : null);
      // encuadra todos los países pisados (y los puntos) para que el mapa se vea entero, también en móvil
      if (bb && bb.isValid()) map.fitBounds(bb, { padding: [24, 24], maxZoom: 6 }); else map.setView([25, 10], 2);
      const refit = () => { map.invalidateSize(); if (bb && bb.isValid()) map.fitBounds(bb, { padding: [24, 24], maxZoom: 6 }); };
      setTimeout(refit, 250); window.addEventListener('resize', refit);
    } catch (e) { console.warn('[mundo-publico] mapa', e); const m = document.getElementById('mp-map'); if (m) m.innerHTML = '<p style="padding:20px;color:#999">No se pudo cargar el mapa.</p>'; }
  }
  main();
})();
