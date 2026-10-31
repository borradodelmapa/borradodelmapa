// Mapa de «vuelo» Madrid → Sagada (Mountain Province, Filipinas) para «Pueblos borrados del mapa» · Ep.2; copia de mapa-whang-od.cjs de Borrado del Mapa. Mismo estilo que mapa.cjs (India): fronteras reales (Natural Earth),
// fondo oscuro, contorno naranja. Globo ortográfico: sigue el arco del vuelo y hace zoom hasta la frontera de Bután. 0 €, todo local.
// Uso: node mapa-sagada.cjs png <salida.png> <t>   |   node mapa-sagada.cjs <salida.mp4>
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const D = path.join(__dirname, 'datos');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1080, H = 1920, CY = 960, T = 5.5, FPS = 30;
const world = JSON.parse(fs.readFileSync(D + '/countries-50m.json', 'utf8'));
const countries = topo.feature(world, world.objects.countries).features;
const butan = countries.find(f => String(f.id) === '608');
const MADRID = [-3.7038, 40.4168], PARO = [120.904, 17.083], CENTRO = [121.1, 16.9];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = u => u * u * (3 - 2 * u), easeIO = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const arc = d3.geoInterpolate(MADRID, PARO);
const lerp = (a, b, u) => a + (b - a) * u;
const esc = s => String(s).replace(/&/g, '&amp;');

function svg(t) {
  // fases: 0-3.1 s vuelo (la cámara sigue la cabeza del arco) · 2.3-5.0 s zoom hasta Bután · 3.9 s en adelante rótulos
  const pFly = ease(clamp((t - 0.2) / 2.9)), head = arc(pFly);
  const pZoom = easeIO(clamp((t - 2.3) / 2.7));
  const center = pZoom > 0 ? d3.geoInterpolate(head, CENTRO)(pZoom) : head;
  const scale = Math.exp(lerp(Math.log(430), Math.log(7200), pZoom));
  const proj = d3.geoOrthographic().rotate([-center[0], -center[1]]).scale(scale).translate([W / 2, CY]).clipAngle(90).precision(0.4)
    .clipExtent([[-60, -60], [W + 60, H + 60]]);
  const gen = d3.geoPath(proj);
  const fade = clamp(t / 0.4) * clamp((T - t) / 0.4);
  const P = ll => { const q = proj(ll); return q && q[0] > -50 && q[0] < W + 50 && q[1] > -50 && q[1] < H + 50 ? q : null; };
  // arco recorrido hasta la cabeza
  const pts = []; for (let i = 0; i <= 80; i++) { const u = i / 80 * pFly; pts.push(arc(u)); }
  const arcPath = gen({ type: 'LineString', coordinates: pts });
  const land = countries.map(f => `<path d="${gen(f) || ''}" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="${scale > 3000 ? 1.4 : 0.7}" stroke-linejoin="round"/>`).join('');
  const globe = scale < 3000 ? `<path d="${gen({ type: 'Sphere' })}" fill="#101010" stroke="#F4630B" stroke-opacity="0.25" stroke-width="2"/>` : '';
  const bu = gen(butan) || '';
  let marks = '';
  const m = P(MADRID); // Madrid mientras se ve
  if (m) marks += `<circle cx="${m[0]}" cy="${m[1]}" r="12" fill="#0D0D0D"/><circle cx="${m[0]}" cy="${m[1]}" r="7" fill="#fff"/><circle cx="${m[0]}" cy="${m[1]}" r="3.5" fill="#F4630B"/><text x="${m[0] + 18}" y="${m[1] - 14}" font-family="Arial" font-weight="700" font-size="34" fill="#fff" stroke="#0D0D0D" stroke-width="7" paint-order="stroke" letter-spacing="1">MADRID</text>`;
  const pa = P(PARO), pulse = 1 + 0.3 * Math.sin(t * 6);
  if (pa && pFly > 0.97) { const a = clamp((t - 3.0) / 0.4);
    marks += `<circle cx="${pa[0]}" cy="${pa[1]}" r="${(30 * pulse).toFixed(1)}" fill="none" stroke="#F4630B" stroke-opacity="${(0.55 * a).toFixed(2)}" stroke-width="3"/><circle cx="${pa[0]}" cy="${pa[1]}" r="16" fill="#0D0D0D" opacity="${a}"/><circle cx="${pa[0]}" cy="${pa[1]}" r="11" fill="#fff" opacity="${a}"/><circle cx="${pa[0]}" cy="${pa[1]}" r="5.5" fill="#F4630B" opacity="${a}"/>`;
    marks += `<text x="${pa[0] - 24}" y="${pa[1] - 20}" font-family="Arial" font-weight="700" font-size="50" fill="#fff" stroke="#0D0D0D" stroke-width="8" paint-order="stroke" text-anchor="end" letter-spacing="1" opacity="${a}">SAGADA</text>`; }
  // avión (cabeza del arco) mientras vuela
  const h = P(head); if (h && pFly < 0.995) marks += `<circle cx="${h[0]}" cy="${h[1]}" r="22" fill="#F4630B" fill-opacity="0.3"/><circle cx="${h[0]}" cy="${h[1]}" r="9" fill="#F4630B"/><circle cx="${h[0]}" cy="${h[1]}" r="4" fill="#fff"/>`;
  const e = x => clamp(x);
  const titleA = e((t - 0.15) / 0.4), nameA = e((t - 3.9) / 0.5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0D0D0D"/>
  <g opacity="${fade.toFixed(3)}">
   ${globe}${land}
   <path d="${bu}" fill="#F4630B" fill-opacity="${(0.10 + 0.14 * pZoom).toFixed(2)}" stroke="#F4630B" stroke-opacity="0.35" stroke-width="12" stroke-linejoin="round"/>
   <path d="${bu}" fill="none" stroke="#F4630B" stroke-width="3" stroke-linejoin="round"/>
   <path d="${arcPath}" fill="none" stroke="#F4630B" stroke-opacity="0.28" stroke-width="14" stroke-linecap="round"/>
   <path d="${arcPath}" fill="none" stroke="#F4630B" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 12"/>
   ${marks}
   <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.55" stop-color="#0D0D0D" stop-opacity="0.9"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient><linearGradient id="gt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.6" stop-color="#0D0D0D" stop-opacity="0.85"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient></defs><rect x="0" y="1400" width="1080" height="520" fill="url(#gb)"/><rect x="0" y="0" width="1080" height="480" fill="url(#gt)"/>
   <g opacity="${titleA.toFixed(2)}">
    <text x="540" y="305" font-family="Impact" font-size="104" fill="#F4630B" text-anchor="middle" letter-spacing="3">BORRADO DEL MAPA</text>
    <text x="540" y="385" font-family="Arial" font-weight="700" font-size="52" fill="#ffffff" text-anchor="middle" letter-spacing="4">PUEBLOS · EPISODIO 2</text>
    <rect x="440" y="415" width="200" height="6" fill="#F4630B"/>
   </g>
   <g opacity="${nameA.toFixed(2)}">
    <text x="540" y="1640" font-family="Impact" font-size="150" fill="#ffffff" text-anchor="middle" letter-spacing="4">FILIPINAS</text>
    <text x="540" y="1710" font-family="Arial" font-weight="700" font-size="40" fill="#F4630B" text-anchor="middle" letter-spacing="3">LOS ATAÚDES COLGANTES</text>
   </g>
  </g></svg>`;
}
const render = t => new Resvg(svg(t), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
async function makeMap(out) {
  const sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  const n = Math.round(T * FPS);
  for (let f = 0; f < n; f++) { if (!sp.stdin.write(render(f / FPS))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done;
}
module.exports = { makeMap, render, T };
if (require.main === module) {
  if (process.argv[2] === 'png') { fs.writeFileSync(process.argv[3], render(parseFloat(process.argv[4] || '3'))); console.log('png', process.argv[3]); }
  else makeMap(process.argv[2] || path.join(__dirname, '../../pueblos/sagada/mapa-sagada.mp4')).then(() => console.log('mp4 listo'));
}
