// Mapas HORIZONTALES (1920x1080) de los largos de Tailandia (encargo T3, 14 nov 2026); copia de mapa-tuvalu.cjs con otros tramos. 0 €, todo local.
// Mismo estilo que los de la serie: fronteras reales (Natural Earth), fondo oscuro, contorno naranja, globo ortográfico que sigue el arco y hace zoom. 0 €, todo local.
// Un tramo por escena (TRAMOS abajo). Uso: node mapa-tatuajes.cjs <tramo> png <salida.png> <t>   |   node mapa-tatuajes.cjs <tramo> [salida.mp4]
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const D = path.join(__dirname, 'datos');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1920, H = 1080, CY = 560, T = 5.5, FPS = 30;
const world = JSON.parse(fs.readFileSync(D + '/countries-50m.json', 'utf8'));
const countries = topo.feature(world, world.objects.countries).features;
const SALIDA = path.join(__dirname, '../../tailandia-largos/mapas');
const PLACAS = JSON.parse(fs.readFileSync(D + '/pb2002-boundaries.json', 'utf8'));
const TRAMOS = {
  // Tailandia 1 · zonas a las que Exteriores pide no ir (puntos en rojo, sin línea entre ellos)
  'zonas': { ruta: [[102.9, 14.2, 'FRONTERA CON CAMBOYA', 'r'], [101.3, 6.4, 'EXTREMO SUR', 'r'], [98.3, 17.2, 'FRONTERA CON BIRMANIA', 'l']], sinArcos: true, rojo: true, centro: [100.8, 12.5], paises: ['764'], l1: 'TRES ZONAS A EVITAR', l2: 'RECOMENDACIONES DE EXTERIORES · NOVIEMBRE DE 2026' },
  // Tailandia 1 y 2 · el bucle de Mae Hong Son
  'norte': { ruta: [[98.99, 18.79, 'CHIANG MAI', 'r'], [98.44, 19.36, 'PAI', 'r'], [97.97, 19.30, 'MAE HONG SON', 'l'], [97.93, 18.16, 'MAE SARIANG', 'l'], [98.99, 18.79, '', 'r']], centro: [98.5, 18.8], paises: ['764'], l1: 'EL BUCLE DE MAE HONG SON', l2: '1.864 CURVAS' },
  // situar: Tailandia en el sudeste asiático, con las tres paradas del vídeo
  // Tailandia 3 (T3.3) · dónde ver la velada: de Bangkok a Chaweng (Koh Samui), estadio Phetch Buncha
  'samui': { ruta: [[100.5, 13.75, 'BANGKOK', 'r'], [100.06, 9.53, 'CHAWENG · KOH SAMUI', 'r']], centro: [100.3, 11.6], paises: ['764'], l1: 'KOH SAMUI', l2: 'ESTADIO PHETCH BUNCHA · LUNES, MIÉRCOLES Y SÁBADOS' },
  'pais': { ruta: [[100.5, 13.75, 'BANGKOK', 'r'], [98.99, 18.79, 'CHIANG MAI', 'l'], [100.06, 9.5, 'KOH SAMUI', 'r']], sinArcos: true, centro: [100.8, 13.5], paises: ['764'], l1: 'TAILANDIA', l2: 'BANGKOK · EL NORTE · LAS ISLAS' },
};
function svgRuta(R, t) {
  const proj = (R.mundo ? d3.geoNaturalEarth1().rotate([-R.centro[0], 0]) : d3.geoOrthographic().rotate([-R.centro[0], -R.centro[1]]).clipAngle(90)).precision(0.4).fitExtent([[420, 270], [1500, 700]], { type: 'MultiPoint', coordinates: R.ruta.map(p => [p[0], p[1]]) }); // todas las paradas entre el título y el rótulo
  const gen = d3.geoPath(proj), fade = clamp(t / 0.4) * clamp((T - t) / 0.4), n = R.ruta.length - 1, paso = 3.6 / n;
  const land = countries.map(f => `<path d="${gen(f) || ''}" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="0.8" stroke-linejoin="round"/>`).join('');
  const hi = R.paises.map(id => gen(countries.find(f => String(f.id) === id)) || '').join(' ');
  let arcs = '', marks = '';
  R.ruta.forEach((p, i) => {
    const t0 = 0.5 + i * paso; // la parada i aparece cuando llega el arco
    if (i < n && !R.sinArcos) { const u = ease(clamp((t - t0) / paso)); if (u > 0) { const it = d3.geoInterpolate(p, R.ruta[i + 1]), pts = []; for (let k = 0; k <= 60; k++) pts.push(it(k / 60 * u));
      const d = gen({ type: 'LineString', coordinates: pts }); arcs += `<path d="${d}" fill="none" stroke="#F4630B" stroke-opacity="0.28" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#F4630B" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="2 11"/>`; } }
    const a = clamp((t - t0 + 0.1) / 0.3), q = proj([p[0], p[1]]); if (!q || a <= 0 || !p[2]) return;
    const tx = p[3] === 'l' ? q[0] - 24 : q[0] + 24, anc = p[3] === 'l' ? 'end' : 'start';
    marks += `<circle cx="${q[0]}" cy="${q[1]}" r="14" fill="#0D0D0D" opacity="${a}"/><circle cx="${q[0]}" cy="${q[1]}" r="9" fill="#fff" opacity="${a}"/><circle cx="${q[0]}" cy="${q[1]}" r="${R.rojo ? 26 : 4.5}" fill="${R.rojo ? '#ff2a1a' : '#F4630B'}" fill-opacity="${R.rojo ? 0.55 : 1}" opacity="${a}"/>`;
    marks += `<text x="${tx}" y="${q[1] - 14}" font-family="Arial" font-weight="700" font-size="34" fill="#fff" stroke="#0D0D0D" stroke-width="7" paint-order="stroke" text-anchor="${anc}" letter-spacing="1" opacity="${a}">${esc(p[2])}</text>`;
  });
  const titleA = clamp((t - 0.15) / 0.4), nameA = clamp((t - 3.6) / 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0D0D0D"/>
  <g><path d="${gen({ type: 'Sphere' })}" fill="#101010" stroke="#F4630B" stroke-opacity="0.25" stroke-width="2"/>${land}
   <path d="${hi}" fill="#F4630B" fill-opacity="0.22" stroke="#F4630B" stroke-width="2.5" stroke-linejoin="round"/>${arcs}${marks}
   <g opacity="${titleA.toFixed(2)}"><text x="960" y="110" font-family="Impact" font-size="84" fill="#F4630B" text-anchor="middle" letter-spacing="3">BORRADO DEL MAPA</text>
    <text x="960" y="168" font-family="Arial" font-weight="700" font-size="40" fill="#ffffff" text-anchor="middle" letter-spacing="4">LA HISTORIA DETRÁS DE CADA LUGAR</text><rect x="860" y="188" width="200" height="5" fill="#F4630B"/></g>
   <g opacity="${nameA.toFixed(2)}"><rect x="0" y="770" width="${W}" height="170" fill="#0D0D0D" opacity="0.75"/><text x="960" y="850" font-family="Impact" font-size="84" fill="#ffffff" text-anchor="middle" letter-spacing="3">${esc(R.l1)}</text>
    <text x="960" y="908" font-family="Arial" font-weight="700" font-size="34" fill="#F4630B" text-anchor="middle" letter-spacing="3">${esc(R.l2)}</text></g>
  </g><rect width="${W}" height="${H}" fill="#0D0D0D" opacity="${(1 - fade).toFixed(3)}"/></svg>`;
}
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = u => u * u * (3 - 2 * u), easeIO = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp = (a, b, u) => a + (b - a) * u;
const esc = s => String(s).replace(/&/g, '&amp;');

function svg(R, t) {
  // fases: 0.2-3.1 s vuelo (la cámara sigue la cabeza del arco) · 2.3-5.0 s zoom al destino · 3.9 s en adelante rótulos. Sin «de»: la cámara parte del destino con el globo entero.
  const arc = R.de ? d3.geoInterpolate(R.de, R.a) : () => R.a;
  const pFly = R.de ? ease(clamp((t - 0.2) / 2.9)) : 1, head = arc(pFly);
  const pZoom = easeIO(clamp((t - (R.de ? 2.3 : 0.6)) / (R.de ? 2.7 : 3.6)));
  const center = pZoom > 0 ? d3.geoInterpolate(head, R.a)(pZoom) : head;
  const scale = Math.exp(lerp(Math.log(420), Math.log(R.zoom), pZoom));
  const proj = d3.geoOrthographic().rotate([-center[0], -center[1]]).scale(scale).translate([W / 2, CY]).clipAngle(90).precision(0.4)
    .clipExtent([[-60, -60], [W + 60, H + 60]]);
  const gen = d3.geoPath(proj);
  const fade = clamp(t / 0.4) * clamp((T - t) / 0.4);
  const P = ll => { const q = proj(ll); return q && q[0] > -50 && q[0] < W + 50 && q[1] > -50 && q[1] < H + 50 ? q : null; };
  const pts = []; for (let i = 0; i <= 80; i++) pts.push(arc(i / 80 * pFly));
  const arcPath = R.de ? gen({ type: 'LineString', coordinates: pts }) : '';
  const land = countries.map(f => `<path d="${gen(f) || ''}" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="${scale > 3000 ? 1.4 : 0.7}" stroke-linejoin="round"/>`).join('');
  const globe = scale < 3000 ? `<path d="${gen({ type: 'Sphere' })}" fill="#101010" stroke="#F4630B" stroke-opacity="0.25" stroke-width="2"/>` : '';
  const hi = R.paises.map(id => gen(countries.find(f => String(f.id) === id)) || '').join(' ');
  let marks = '';
  const o = R.de && P(R.de); // punto de salida mientras se ve
  if (o) marks += `<circle cx="${o[0]}" cy="${o[1]}" r="12" fill="#0D0D0D"/><circle cx="${o[0]}" cy="${o[1]}" r="7" fill="#fff"/><circle cx="${o[0]}" cy="${o[1]}" r="3.5" fill="#F4630B"/>`;
  const pa = P(R.a), pulse = 1 + 0.3 * Math.sin(t * 6), a = clamp((t - (R.de ? 3.0 : 1.2)) / 0.4);
  if (pa && pFly > 0.97 && a > 0) {
    const tx = R.lado === 'l' ? pa[0] - 28 : pa[0] + 28, anc = R.lado === 'l' ? 'end' : 'start';
    marks += `<circle cx="${pa[0]}" cy="${pa[1]}" r="${(30 * pulse).toFixed(1)}" fill="none" stroke="#F4630B" stroke-opacity="${(0.55 * a).toFixed(2)}" stroke-width="3"/><circle cx="${pa[0]}" cy="${pa[1]}" r="16" fill="#0D0D0D" opacity="${a}"/><circle cx="${pa[0]}" cy="${pa[1]}" r="11" fill="#fff" opacity="${a}"/><circle cx="${pa[0]}" cy="${pa[1]}" r="5.5" fill="#F4630B" opacity="${a}"/>`;
    marks += `<text x="${tx}" y="${pa[1] - 20}" font-family="Arial" font-weight="700" font-size="46" fill="#fff" stroke="#0D0D0D" stroke-width="8" paint-order="stroke" text-anchor="${anc}" letter-spacing="1" opacity="${a}">${esc(R.punto)}</text>`;
  }
  const h = R.de && P(head); if (h && pFly < 0.995) marks += `<circle cx="${h[0]}" cy="${h[1]}" r="22" fill="#F4630B" fill-opacity="0.3"/><circle cx="${h[0]}" cy="${h[1]}" r="9" fill="#F4630B"/><circle cx="${h[0]}" cy="${h[1]}" r="4" fill="#fff"/>`;
  const titleA = clamp((t - 0.15) / 0.4), nameA = clamp((t - (R.de ? 3.9 : 2.4)) / 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0D0D0D"/>
  <g>
   ${globe}${land}
   <path d="${hi}" fill="#F4630B" fill-opacity="${(0.10 + 0.14 * pZoom).toFixed(2)}" stroke="#F4630B" stroke-opacity="0.35" stroke-width="12" stroke-linejoin="round"/>
   <path d="${hi}" fill="none" stroke="#F4630B" stroke-width="3" stroke-linejoin="round"/>
   <path d="${arcPath}" fill="none" stroke="#F4630B" stroke-opacity="0.28" stroke-width="14" stroke-linecap="round"/>
   <path d="${arcPath}" fill="none" stroke="#F4630B" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 12"/>
   ${marks}
   <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.55" stop-color="#0D0D0D" stop-opacity="0.9"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient><linearGradient id="gt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.6" stop-color="#0D0D0D" stop-opacity="0.85"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient></defs><rect x="0" y="800" width="${W}" height="280" fill="url(#gb)"/><rect x="0" y="0" width="${W}" height="230" fill="url(#gt)"/>
   <g opacity="${titleA.toFixed(2)}">
    <text x="960" y="110" font-family="Impact" font-size="84" fill="#F4630B" text-anchor="middle" letter-spacing="3">BORRADO DEL MAPA</text>
    <text x="960" y="168" font-family="Arial" font-weight="700" font-size="40" fill="#ffffff" text-anchor="middle" letter-spacing="4">LA HISTORIA DETRÁS DE CADA LUGAR</text>
    <rect x="860" y="188" width="200" height="5" fill="#F4630B"/>
   </g>
   <g opacity="${nameA.toFixed(2)}">
    <text x="960" y="850" font-family="Impact" font-size="92" fill="#ffffff" text-anchor="middle" letter-spacing="3">${esc(R.l1)}</text>
    <text x="960" y="908" font-family="Arial" font-weight="700" font-size="36" fill="#F4630B" text-anchor="middle" letter-spacing="3">${esc(R.l2)}</text>
   </g>
  </g><rect width="${W}" height="${H}" fill="#0D0D0D" opacity="${(1 - fade).toFixed(3)}"/></svg>`;
}

function svgPlacas(R, t) {
  const proj = d3.geoOrthographic().rotate([-R.centro[0], -R.centro[1]]).scale(R.zoom).translate([W / 2, CY]).clipAngle(90).precision(0.4).clipExtent([[-60, -60], [W + 60, H + 60]]);
  const gen = d3.geoPath(proj), fade = clamp(t / 0.4) * clamp((T - t) / 0.4);
  const land = countries.map(f => `<path d="${gen(f) || ''}" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="1.2" stroke-linejoin="round"/>`).join('');
  const hi = R.paises.map(id => gen(countries.find(f => String(f.id) === id)) || '').join(' ');
  const u = ease(clamp((t - 0.4) / 2.0)); // los límites se dibujan de 0,4 a 2,4 s
  const lim = PLACAS.features.map(f => gen(f.geometry) || '').filter(Boolean).join(' ');
  let marks = '';
  R.volcanes.forEach((v, i) => { const a = clamp((t - 2.2 - i * 0.25) / 0.3), q = proj([v[0], v[1]]); if (!q || a <= 0) return;
    const tx = v[3] === 'l' ? q[0] - 22 : q[0] + 22, anc = v[3] === 'l' ? 'end' : 'start';
    marks += `<path d="M${q[0]} ${q[1] - 16} L${q[0] + 13} ${q[1] + 9} L${q[0] - 13} ${q[1] + 9} Z" fill="#F4630B" stroke="#0D0D0D" stroke-width="3" opacity="${a}"/>`;
    marks += `<text x="${tx}" y="${q[1] - 10}" font-family="Arial" font-weight="700" font-size="30" fill="#fff" stroke="#0D0D0D" stroke-width="7" paint-order="stroke" text-anchor="${anc}" opacity="${a}">${esc(v[2])}</text>`; });
  const titleA = clamp((t - 0.15) / 0.4), nameA = clamp((t - 3.4) / 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0D0D0D"/>
  <g>${land}<path d="${hi}" fill="#F4630B" fill-opacity="0.18" stroke="#F4630B" stroke-width="2.5" stroke-linejoin="round"/>
   <path d="${lim}" fill="none" stroke="#ff3b1f" stroke-width="4" stroke-dasharray="${(3000 * u).toFixed(0)} 3000" stroke-opacity="0.9"/>${marks}
   <text x="1880" y="1060" font-family="Arial" font-size="18" fill="#777" text-anchor="end">Límites de placas: Bird (2003), PB2002 · H. Ahlenius / Nordpil (ODC-By)</text>
   <g opacity="${titleA.toFixed(2)}"><text x="960" y="110" font-family="Impact" font-size="84" fill="#F4630B" text-anchor="middle" letter-spacing="3">BORRADO DEL MAPA</text>
    <text x="960" y="168" font-family="Arial" font-weight="700" font-size="40" fill="#ffffff" text-anchor="middle" letter-spacing="4">LA HISTORIA DETRÁS DE CADA LUGAR</text><rect x="860" y="188" width="200" height="5" fill="#F4630B"/></g>
   <g opacity="${nameA.toFixed(2)}"><rect x="0" y="900" width="${W}" height="150" fill="#0D0D0D" opacity="0.75"/><text x="960" y="975" font-family="Impact" font-size="84" fill="#ffffff" text-anchor="middle" letter-spacing="3">${esc(R.l1)}</text>
    <text x="960" y="1030" font-family="Arial" font-weight="700" font-size="34" fill="#F4630B" text-anchor="middle" letter-spacing="3">${esc(R.l2)}</text></g>
  </g><rect width="${W}" height="${H}" fill="#0D0D0D" opacity="${(1 - fade).toFixed(3)}"/></svg>`;
}
const render1 = (R, t) => new Resvg((R.placas ? svgPlacas : R.ruta ? svgRuta : svg)(R, t), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
// resvg se cae en los primeros fotogramas de alguna ruta (fundido casi a 0): se usa el primer fotograma que sí sale, a opacidad baja (4 nov 2026)
const render = (R, t) => { for (let k = 0; k < 10; k++) { try { return render1(R, t + k * 0.1); } catch (e) { if (k === 9) throw e; } } };
async function makeMap(R, out) {
  const sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  const n = Math.round(T * FPS);
  for (let f = 0; f < n; f++) { if (!sp.stdin.write(render(R, f / FPS))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done;
}
module.exports = { makeMap, render, T, TRAMOS, svgRuta };
if (require.main === module) {
  const [nom, modo, out, t] = process.argv.slice(2), R = TRAMOS[nom];
  if (!R) { console.error('tramo desconocido; hay:', Object.keys(TRAMOS).join(', ')); process.exit(1); }
  if (modo === 'png') { fs.writeFileSync(out, render(R, parseFloat(t || '4.5'))); console.log('png', out); }
  else { const o = modo || path.join(SALIDA, `mapa-${nom}.mp4`); makeMap(R, o).then(() => console.log('mp4 listo', o)); }
}
