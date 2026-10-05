/* ═══════════════════════════════════════════
   BORRADO DEL MAPA — cronologia.js
   Cronología de Google Maps → línea de tiempo del viaje (caso p-muvr31hqld8, 5 oct 2026).
   Lee el Timeline.json exportado del móvil (Android, iPhone o el Takeout antiguo), TODO en el navegador:
   el historial de ubicaciones no sale del móvil. Solo se podrá guardar el resumen (días, países, km).
   💶 0 €: sin APIs de pago; los países salen de los contornos locales (tuMundo.countryAt).

   cronologia.parse(json)            → { visits:[{t0,t1,lat,lng}], moves:[{t0,t1,km,from,to}] }
   cronologia.summarize(parsed)      → { days:[{date,places:[{lat,lng,country}]}], countries:[{a2,name,days,first,last}], km, ... }
   cronologia.render(el, summary)    → pinta resumen + países + lista por días
   ═══════════════════════════════════════════ */

const cronologia = (() => {
  const hav = (a, b) => { const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r; const x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // "41.1494°, -8.6107°" (Android) · "geo:41.1494,-8.6107" (iPhone) · E7 enteros (Takeout antiguo)
  function ll(v) {
    if (!v) return null;
    if (typeof v === 'object') {
      if (v.latitudeE7 != null) return { lat: v.latitudeE7 / 1e7, lng: v.longitudeE7 / 1e7 };
      if (v.latLng) return ll(v.latLng);
      if (v.lat != null) return { lat: +v.lat, lng: +v.lng };
      return null;
    }
    const m = String(v).match(/(-?\d+(?:\.\d+)?)\s*°?\s*,\s*(-?\d+(?:\.\d+)?)/);
    return m ? { lat: +m[1], lng: +m[2] } : null;
  }
  const T = s => { const d = new Date(s); return isNaN(d) ? null : d.getTime(); };

  function parse(json) {
    const visits = [], moves = [];
    const addVisit = (t0, t1, p) => { if (p && t0 && isFinite(p.lat) && isFinite(p.lng)) visits.push({ t0, t1: t1 || t0, lat: p.lat, lng: p.lng }); };
    const addMove = (t0, t1, a, b, m) => { if (t0 && a && b) moves.push({ t0, t1: t1 || t0, from: a, to: b, km: m != null ? m / 1000 : hav(a, b) }); };
    let arr = null;
    if (Array.isArray(json)) arr = json;                       // iPhone
    else if (json && Array.isArray(json.semanticSegments)) arr = json.semanticSegments; // Android
    else if (json && Array.isArray(json.timelineObjects)) {    // Takeout antiguo
      json.timelineObjects.forEach(o => {
        if (o.placeVisit) { const d = o.placeVisit.duration || {}; addVisit(T(d.startTimestamp), T(d.endTimestamp), ll(o.placeVisit.location)); }
        if (o.activitySegment) { const s = o.activitySegment, d = s.duration || {}; addMove(T(d.startTimestamp), T(d.endTimestamp), ll(s.startLocation), ll(s.endLocation), s.distance); }
      });
      return { visits, moves };
    }
    if (!arr) throw new Error('No reconozco este archivo. Tiene que ser el Timeline.json que exporta Google Maps.');
    arr.forEach(s => {
      const t0 = T(s.startTime), t1 = T(s.endTime);
      if (s.visit) { const tc = s.visit.topCandidate || {}; addVisit(t0, t1, ll(tc.placeLocation)); }
      else if (s.activity) { const a = s.activity; addMove(t0, t1, ll(a.start), ll(a.end), a.distanceMeters != null ? +a.distanceMeters : null); }
    });
    return { visits, moves };
  }

  const dayKey = t => new Date(t).toISOString().slice(0, 10);

  // Agrupa por día (en UTC: suficiente para una vista de viaje) y por país.
  function summarize(P, countryAt, nameOf) {
    const days = new Map();
    const dayOf = k => days.get(k) || (days.set(k, { date: k, places: [], km: 0 }), days.get(k));
    P.visits.forEach(v => {
      const f = countryAt ? countryAt(v.lat, v.lng) : null;
      const d = dayOf(dayKey(v.t0));
      if (!d.places.some(p => hav(p, v) < 0.5)) d.places.push({ lat: v.lat, lng: v.lng, a2: f ? f.a2 : '', country: f ? (nameOf ? nameOf(f.a2, f.en) : f.en) : '' });
    });
    let km = 0;
    P.moves.forEach(m => { dayOf(dayKey(m.t0)).km += m.km; km += m.km; });
    const list = [...days.values()].sort((a, b) => a.date < b.date ? -1 : 1);
    const cmap = new Map();
    list.forEach(d => new Set(d.places.map(p => p.a2 + '|' + p.country)).forEach(k => {
      const [a2, name] = k.split('|'); if (!name) return;
      const c = cmap.get(a2 + name) || { a2, name, days: 0, first: d.date, last: d.date }; c.days++; c.last = d.date; cmap.set(a2 + name, c);
    }));
    return { days: list, countries: [...cmap.values()].sort((a, b) => a.first < b.first ? -1 : 1), km, nDays: list.length, from: list[0] && list[0].date, to: list.length && list[list.length - 1].date };
  }

  const nf = n => Math.round(n).toLocaleString('es-ES');
  const fdate = k => new Date(k + 'T12:00:00Z').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const flag = a2 => a2 && a2.length === 2 ? String.fromCodePoint(...[...a2.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🌍';

  function render(el, S) {
    if (!S.nDays) { el.innerHTML = '<p class="cr-vacio">No he encontrado visitas en este archivo.</p>'; return; }
    const paises = S.countries.map(c => `<li><span class="cr-flag">${flag(c.a2)}</span><b>${esc(c.name)}</b><span>${c.days} día${c.days === 1 ? '' : 's'} · ${esc(fdate(c.first))}</span></li>`).join('');
    const dias = S.days.map(d => {
      const names = [...new Set(d.places.map(p => p.country).filter(Boolean))];
      const f = d.places.find(p => p.a2);
      return `<li><span class="cr-d">${esc(fdate(d.date))}</span><span class="cr-p">${f ? flag(f.a2) : '🌍'} ${esc(names.join(' · ') || 'Sin país')}</span><span class="cr-k">${d.km >= 1 ? nf(d.km) + ' km' : ''}</span></li>`;
    }).join('');
    el.innerHTML = `<div class="cr-cifras"><div><b>${S.countries.length}</b><span>países</span></div><div><b>${S.nDays}</b><span>días con datos</span></div><div><b>${nf(S.km)}</b><span>km</span></div></div>
      <div id="cr-map" class="cr-map"></div>
      <h3>Países</h3><ul class="cr-paises">${paises}</ul>
      <h3>Día a día</h3><ul class="cr-dias">${dias}</ul>`;
    if (window.L) {
      const map = L.map('cr-map', { zoomControl: true }).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      const pts = []; S.days.forEach(d => d.places.forEach(p => pts.push([p.lat, p.lng])));
      L.polyline(pts, { color: '#c8963e', weight: 3 }).addTo(map);
      pts.length && map.fitBounds(pts, { padding: [20, 20] });
    }
  }

  return { parse, summarize, render };
})();
window.cronologia = cronologia;
