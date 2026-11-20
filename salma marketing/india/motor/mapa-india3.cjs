// Mapa «India: 3 lugares sagrados» (V2, 20 nov 2026, 🎬 Vídeo): globo → norte de la India y aparecen Rishikesh, Dharamsala y Benarés al ritmo de la voz de g1 (M1: situar). 0 €, todo local. Base: mapa-mlabri.cjs.
// Uso: node mapa-india3.cjs png <salida.png> <t>   |   node mapa-india3.cjs <salida.mp4>
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const D = path.join(__dirname, 'datos');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1080, H = 1920, CY = 760, T = 6.0, FPS = 30;
const world = JSON.parse(fs.readFileSync(D + '/countries-50m.json', 'utf8'));
const countries = topo.feature(world, world.objects.countries).features;
const india = countries.find(f => String(f.id) === '356');
const INI = [40, 30], CENTRO = [79.8, 28.6];
const PTS = [ { n: 'RISHIKESH', ll: [78.27, 30.09], t: 2.2, dx: 26, dy: 14, a: 'start' }, { n: 'DHARAMSALA', ll: [76.32, 32.22], t: 2.9, dx: 26, dy: -14, a: 'start' }, { n: 'BENARÉS', ll: [83.01, 25.32], t: 3.6, dx: 0, dy: 66, a: 'middle' } ];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const easeIO = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp = (a, b, u) => a + (b - a) * u;
function svg(t) {
  const pZoom = easeIO(clamp((t - 0.2) / 2.0));
  const center = d3.geoInterpolate(INI, CENTRO)(pZoom);
  const scale = Math.exp(lerp(Math.log(430), Math.log(3300), pZoom));
  const proj = d3.geoOrthographic().rotate([-center[0], -center[1]]).scale(scale).translate([W / 2, CY]).clipAngle(90).precision(0.4).clipExtent([[-60, -60], [W + 60, H + 60]]);
  const gen = d3.geoPath(proj);
  const fade = clamp(t / 0.3) * clamp((T - t) / 0.3);
  const land = countries.map(f => '<path d="' + (gen(f) || '') + '" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="' + (scale > 3000 ? 1.4 : 0.7) + '" stroke-linejoin="round"/>').join('');
  const globe = scale < 3000 ? '<path d="' + gen({ type: 'Sphere' }) + '" fill="#101010" stroke="#F4630B" stroke-opacity="0.25" stroke-width="2"/>' : '';
  const ind = gen(india) || '';
  let marks = '', ruta = [];
  for (const p of PTS) { const q = proj(p.ll); const a = clamp((t - p.t) / 0.35); if (!q || a <= 0) continue; ruta.push(q); const pulse = 1 + 0.3 * Math.sin(t * 6);
    marks += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (26 * pulse).toFixed(1) + '" fill="none" stroke="#F4630B" stroke-opacity="' + (0.55 * a).toFixed(2) + '" stroke-width="3"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="15" fill="#0D0D0D" opacity="' + a + '"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="10" fill="#fff" opacity="' + a + '"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="5" fill="#F4630B" opacity="' + a + '"/>';
    marks += '<text x="' + (q[0] + p.dx) + '" y="' + (q[1] + p.dy) + '" font-family="Arial" font-weight="700" font-size="46" fill="#fff" stroke="#0D0D0D" stroke-width="8" paint-order="stroke" text-anchor="' + p.a + '" letter-spacing="1" opacity="' + a + '">' + p.n + '</text>'; }
  const titleA = clamp((t - 0.15) / 0.4), nameA = 0; // M10: sin título abajo (chocaba con los subtítulos); lo dice la voz
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '"><rect width="' + W + '" height="' + H + '" fill="#0D0D0D"/><g opacity="' + fade.toFixed(3) + '">' + globe + land +
   '<path d="' + ind + '" fill="#F4630B" fill-opacity="' + (0.08 + 0.12 * pZoom).toFixed(2) + '" stroke="#F4630B" stroke-width="3" stroke-linejoin="round"/>' + marks +
   '<defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.55" stop-color="#0D0D0D" stop-opacity="0.9"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient><linearGradient id="gt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.6" stop-color="#0D0D0D" stop-opacity="0.85"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient></defs><rect x="0" y="1300" width="1080" height="620" fill="url(#gb)"/><rect x="0" y="0" width="1080" height="420" fill="url(#gt)"/>' +
   '<g opacity="' + titleA.toFixed(2) + '"><text x="540" y="330" font-family="Impact" font-size="96" fill="#F4630B" text-anchor="middle" letter-spacing="3">BORRADO DEL MAPA</text><text x="540" y="405" font-family="Arial" font-weight="700" font-size="48" fill="#ffffff" text-anchor="middle" letter-spacing="4">LA INDIA, EN CRÓNICA</text><rect x="440" y="432" width="200" height="6" fill="#F4630B"/></g>' +
   '<g opacity="' + nameA.toFixed(2) + '"><text x="540" y="1215" font-family="Impact" font-size="110" fill="#ffffff" text-anchor="middle" letter-spacing="4">NORTE DE LA INDIA</text><text x="540" y="1265" font-family="Arial" font-weight="700" font-size="38" fill="#F4630B" text-anchor="middle" letter-spacing="3">3 LUGARES SAGRADOS</text></g></g></svg>';
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
  else makeMap(process.argv[2] || path.join(__dirname, '../corto-3-lugares/clips/mapa-india3.mp4')).then(() => console.log('mp4 listo'));
}
