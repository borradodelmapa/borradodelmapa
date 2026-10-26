// Mapa de ruta de India para los reels de Borrado del Mapa. Geometría real (Natural Earth vía world-atlas), vector -> PNG con resvg -> mp4 con ffmpeg.
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const D = path.join(__dirname, 'datos');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1080, H = 1920;
const world = JSON.parse(fs.readFileSync(D + '/countries-50m.json', 'utf8'));
const countries = topo.feature(world, world.objects.countries).features;
const rivers = JSON.parse(fs.readFileSync(D + '/rios.geojson', 'utf8')).features;
const byId = id => countries.find(f => String(f.id) === String(id));
const india = byId('356');
const near = ['586', '156', '524', '050', '064', '104', '144', '004'].map(byId).filter(Boolean);
// proyección ajustada a India dentro de un recuadro
const BOX = [[40, 420], [1040, 1480]];
const mk = () => d3.geoConicConformal().parallels([12, 28]).rotate([-80, 0]);
const pA = mk().fitExtent(BOX, india);
const pB = mk().fitExtent([[360, 650], [640, 1190]], { type: 'MultiPoint', coordinates: [[76.3, 32.2], [78.3, 30.1], [83.0, 25.3], [83.1, 25.4]] });
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = u => u * u * (3 - 2 * u);
let proj = pA, gen = d3.geoPath(pA), P = ll => pA([ll[1], ll[0]]);
function setProj(t) {
  const u = smooth(Math.max(0, Math.min(1, (t - 0.8) / 1.4)));
  proj = mk().scale(lerp(pA.scale(), pB.scale(), u)).translate([lerp(pA.translate()[0], pB.translate()[0], u), lerp(pA.translate()[1], pB.translate()[1], u)]);
  gen = d3.geoPath(proj); P = ll => proj([ll[1], ll[0]]);
}
const CITIES = {
  rish: { n: 'RISHIKESH', ll: [30.0869, 78.2676], side: 'r', dx: 22, dy: -18 },
  dhar: { n: 'DHARAMSALA', ll: [32.2190, 76.3234], side: 'l', dx: -22, dy: -14 },
  vara: { n: 'BENARÉS', ll: [25.3176, 82.9739], side: 'r', dx: 26, dy: 40, big: true, dy: 52 },
  sarn: { n: 'SARNATH', ll: [25.3762, 83.0227], side: 'r', dx: 22, dy: -30, small: true },
};
// tramos: de, a, curvatura (px; signo = lado)
const LEGS = [['rish', 'dhar', -70], ['dhar', 'rish', 70], ['rish', 'vara', -90], ['vara', 'sarn', 0]];
const quad = (a, b, bend) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [mx - dy / L * bend, my + dx / L * bend]; };
const sample = (a, b, bend, n = 48) => { const c = quad(a, b, bend), pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]); } return pts; };
let legPts = [];
const ganges = rivers.filter(f => /ganges|ganga|yamuna|ghaghara|gandak|kosi/i.test((f.properties.name || '') + (f.properties.name_en || '')));
const poly = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
const esc = s => String(s).replace(/&/g, '&amp;');

function svg(t, T) {
  setProj(t); legPts = LEGS.map(([a, b, bend]) => sample(P(CITIES[a].ll), P(CITIES[b].ll), bend));
  // t en segundos, T = duración total
  const e = x => Math.max(0, Math.min(1, x));
  const fade = e(t / 0.4) * e((T - t) / 0.4);
  const legWin = LEGS.map((_, i) => [1.9 + i * 0.6, 1.9 + (i + 1) * 0.6]);
  let routes = '', dots = '';
  LEGS.forEach((l, i) => {
    const p = e((t - legWin[i][0]) / (legWin[i][1] - legWin[i][0])); if (p <= 0) return;
    const pts = legPts[i], k = Math.max(2, Math.round(p * pts.length)), part = pts.slice(0, k);
    const dash = i === 2 ? 'stroke-dasharray="3 14" stroke-linecap="round"' : 'stroke-linecap="round"';
    routes += `<path d="${poly(part)}" fill="none" stroke="#F4630B" stroke-opacity="0.28" stroke-width="16" ${dash}/>`;
    routes += `<path d="${poly(part)}" fill="none" stroke="#F4630B" stroke-width="5.5" ${dash}/>`;
  });
  Object.entries(CITIES).forEach(([id, c]) => {
    const [x, y] = P(c.ll);
    const first = id === 'rish' ? 0 : id === 'dhar' ? legWin[0][1] : id === 'vara' ? legWin[2][1] : legWin[3][1];
    const a = e((t - first + 0.15) / 0.3); if (a <= 0 && id !== 'rish') return;
    const r = c.big ? 15 : c.small ? 8 : 11;
    const pulse = c.big ? 1 + 0.35 * Math.sin(t * 5) : 1;
    if (c.big) dots += `<circle cx="${x}" cy="${y}" r="${(34 * pulse).toFixed(1)}" fill="none" stroke="#F4630B" stroke-opacity="${(0.55 * a).toFixed(2)}" stroke-width="3"/>`;
    dots += `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="#0D0D0D" opacity="${a.toFixed(2)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c.small ? '#bdbdbd' : '#fff'}" opacity="${a.toFixed(2)}"/><circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="#F4630B" opacity="${a.toFixed(2)}"/>`;
    const anchor = c.side === 'l' ? 'end' : 'start';
    dots += `<text x="${x + c.dx}" y="${y + c.dy}" font-family="Arial" font-weight="700" font-size="${c.big ? 52 : c.small ? 30 : 36}" fill="${c.small ? '#cfcfcf' : '#ffffff'}" stroke="#0D0D0D" stroke-width="7" paint-order="stroke" text-anchor="${anchor}" opacity="${a.toFixed(2)}" letter-spacing="1">${esc(c.n)}</text>`;
  });
  const rivs = ganges.map(f => `<path d="${gen(f)}" fill="none" stroke="#4FB3C8" stroke-opacity="0.75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const grid = Array.from({ length: 5 }, (_, i) => `<line x1="${i * 270}" y1="0" x2="${i * 270}" y2="${H}" stroke="#fff" stroke-opacity="0.04"/>`).join('') + Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${i * 270}" x2="${W}" y2="${i * 270}" stroke="#fff" stroke-opacity="0.04"/>`).join('');
  const titleA = e((t - 0.15) / 0.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0D0D0D"/>${grid}
  <g opacity="${fade.toFixed(3)}">
   ${near.map(f => `<path d="${gen(f)}" fill="#151515" stroke="#2c2c2c" stroke-width="1.5"/>`).join('')}
   <path d="${gen(india)}" fill="#1c1c1c" stroke="#F4630B" stroke-opacity="0.35" stroke-width="12" stroke-linejoin="round"/>
   <path d="${gen(india)}" fill="none" stroke="#F4630B" stroke-width="3" stroke-linejoin="round"/>
   ${rivs}${routes}${dots}
   <defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.55" stop-color="#0D0D0D" stop-opacity="0.9"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient><linearGradient id="gt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.6" stop-color="#0D0D0D" stop-opacity="0.85"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient></defs><rect x="0" y="1400" width="1080" height="520" fill="url(#gb)"/><rect x="0" y="0" width="1080" height="430" fill="url(#gt)"/>
    <g opacity="${titleA.toFixed(2)}">
    <text x="540" y="250" font-family="Impact" font-size="104" fill="#F4630B" text-anchor="middle" letter-spacing="3">BORRADO DEL MAPA</text>
    <text x="540" y="330" font-family="Arial" font-weight="700" font-size="52" fill="#ffffff" text-anchor="middle" letter-spacing="4">INDIA 2019 · CAP. 4</text>
    <rect x="440" y="360" width="200" height="6" fill="#F4630B"/>
    <text x="540" y="1640" font-family="Impact" font-size="150" fill="#ffffff" text-anchor="middle" letter-spacing="4">BENARÉS</text>
    <text x="540" y="1710" font-family="Arial" font-weight="700" font-size="40" fill="#F4630B" text-anchor="middle" letter-spacing="3">LA CIUDAD MÁS ANTIGUA DEL GANGES</text>
   </g>
  </g></svg>`;
}
const render = (t, T) => new Resvg(svg(t, T), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
async function makeMap(out, T = 4.5, fps = 30) {
  const sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  const n = Math.round(T * fps);
  for (let f = 0; f < n; f++) { if (!sp.stdin.write(render(f / fps, T))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done;
}
module.exports = { makeMap, render, svg };
if (require.main === module) {
  const mode = process.argv[2];
  if (mode === 'png') { fs.writeFileSync(process.argv[3], render(parseFloat(process.argv[4] || '3.5'), 4.5)); console.log('png', process.argv[3]); }
  else makeMap(process.argv[3] || path.join(__dirname, 'mapa-india-cap4.mp4'), 4.5).then(() => console.log('mp4 listo'));
}
