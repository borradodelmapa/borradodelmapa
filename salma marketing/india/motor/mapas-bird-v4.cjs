// Mapas animados de «Diario de grandes viajeros · 1» (Isabella Bird y los ainu), guion v4 (25 nov 2026, 🎬 Vídeo 2; Paco: «MONTA»).
// Formato estudiado en el short de los garífunas (Planeta en Mapas): todo sobre el mapa, territorio rayado en verde (ainu) o rojo (colonos), fechas grandes arriba.
// Mismo estilo que mapa-bird.cjs (fronteras Natural Earth, fondo oscuro). 0 €, todo local.
// Uso: node mapas-bird-v4.cjs [escena …]   (sin argumentos: todas) → salma marketing/pueblos/ainu-bird/mapas/<escena>.mp4
// Zona de texto: arriba (200-520 px). Nada entre 1.080 y 1.260 (subtítulos) ni por debajo de 1.260 (botones, M10).
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const D = path.join(__dirname, 'datos');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const OUT = path.join(__dirname, '../../pueblos/ainu-bird/mapas'); fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920, CY = 820, FPS = 30;
const world = JSON.parse(fs.readFileSync(D + '/countries-50m.json', 'utf8'));
const countries = topo.feature(world, world.objects.countries).features;
const japon = countries.find(f => String(f.id) === '392');
// Hokkaido = el polígono de Japón cuyo centro está al norte de 41,4° N
const hokkaido = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: japon.geometry.coordinates.filter(p => d3.geoCentroid({ type: 'Polygon', coordinates: p })[1] > 41.4) } };
const TOKIO = [139.69, 35.69], BIRATORI = [142.13, 42.60], TEMPLO = [142.19, 42.66], LONDRES = [-0.13, 51.51], UPOPOY = [141.36, 42.55], CENTRO_HK = [142.8, 43.3];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = u => u * u * (3 - 2 * u), easeIO = u => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const lerp = (a, b, u) => a + (b - a) * u;
const VERDE = '#3BD16F', ROJO = '#E5483A', NAR = '#F4630B', GRIS = '#8a8a8a';

function base(center, scale) {
  const proj = d3.geoOrthographic().rotate([-center[0], -center[1]]).scale(scale).translate([W / 2, CY]).clipAngle(90).precision(0.3).clipExtent([[-60, -60], [W + 60, H + 60]]);
  const gen = d3.geoPath(proj);
  const P = ll => { const q = proj(ll); return q && q[0] > -50 && q[0] < W + 50 && q[1] > -50 && q[1] < H + 50 ? q : null; };
  const land = countries.map(f => `<path d="${gen(f) || ''}" fill="#1f1f1f" stroke="#3d3d3d" stroke-width="${scale > 3000 ? 1.4 : 0.7}" stroke-linejoin="round"/>`).join('');
  const globe = scale < 3000 ? `<path d="${gen({ type: 'Sphere' })}" fill="#0f1a24" stroke="${NAR}" stroke-opacity="0.2" stroke-width="2"/>` : '';
  return { proj, gen, P, land, globe };
}
const defs = `<defs>
 <pattern id="rv" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="${VERDE}" fill-opacity="0.28"/><rect width="7" height="22" fill="${VERDE}" fill-opacity="0.85"/></pattern>
 <pattern id="rr" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="${ROJO}" fill-opacity="0.30"/><rect width="7" height="22" fill="${ROJO}" fill-opacity="0.85"/></pattern>
 <linearGradient id="gt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.55" stop-color="#0D0D0D" stop-opacity="0.85"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient>
 <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0D0D" stop-opacity="0"/><stop offset="0.5" stop-color="#0D0D0D" stop-opacity="0.85"/><stop offset="1" stop-color="#0D0D0D" stop-opacity="1"/></linearGradient>
</defs>`;
// Territorio: relleno rayado + borde que brilla
const terr = (d, col, pat, a) => d && a > 0.001 ? `<g opacity="${a.toFixed(3)}"><path d="${d}" fill="url(#${pat})" stroke="${col}" stroke-width="5" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-opacity="0.35" stroke-width="18" stroke-linejoin="round"/></g>` : '';
const pin = (q, t, a = 1, col = NAR) => q ? `<g opacity="${a.toFixed(2)}"><circle cx="${q[0]}" cy="${q[1]}" r="${(32 * (1 + 0.3 * Math.sin(t * 6))).toFixed(1)}" fill="none" stroke="${col}" stroke-opacity="0.6" stroke-width="4"/><circle cx="${q[0]}" cy="${q[1]}" r="17" fill="#0D0D0D"/><circle cx="${q[0]}" cy="${q[1]}" r="12" fill="#fff"/><circle cx="${q[0]}" cy="${q[1]}" r="6" fill="${col}"/></g>` : '';
const etq = (q, txt, a = 1, dx = 28, dy = -24, anchor = 'start', size = 46) => q ? `<text x="${q[0] + dx}" y="${q[1] + dy}" font-family="Arial" font-weight="700" font-size="${size}" fill="#fff" stroke="#0D0D0D" stroke-width="9" paint-order="stroke" text-anchor="${anchor}" letter-spacing="1" opacity="${a.toFixed(2)}">${txt}</text>` : '';
// Texto grande arriba: línea principal (Impact) + secundaria
const arriba = (l1, l2, a, col = NAR, y = 330, size = 150) => a > 0.001 ? `<g opacity="${a.toFixed(3)}"><text x="540" y="${y}" font-family="Impact" font-size="${size}" fill="${col}" text-anchor="middle" letter-spacing="2" stroke="#0D0D0D" stroke-width="10" paint-order="stroke">${l1}</text>${l2 ? `<text x="540" y="${y + 70}" font-family="Arial" font-weight="700" font-size="46" fill="#fff" text-anchor="middle" letter-spacing="3" stroke="#0D0D0D" stroke-width="8" paint-order="stroke">${l2}</text>` : ''}</g>` : '';
const marco = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<rect width="${W}" height="${H}" fill="#0D0D0D"/>${inner}<rect x="0" y="0" width="${W}" height="560" fill="url(#gt)"/><rect x="0" y="1250" width="${W}" height="670" fill="url(#gb)"/>`;
const fin = top => `${top}</svg>`;
// Relleno rojo que sube desde el sur: Hokkaido recortado por debajo de una latitud
const hkHasta = lat => ({ type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: hokkaido.geometry.coordinates.map(p => p.map(r => r.map(([x, y]) => [x, Math.min(y, lat)]))) } });

const ESCENAS = {
  // 1-2 · «Mira esta isla… Hokkaido» → «era la tierra de los ainu»
  hokkaido: { T: 8.5, f: t => { const z = easeIO(clamp((t - 0.2) / 3.6)); const b = base(d3.geoInterpolate([139.5, 37], CENTRO_HK)(z), Math.exp(lerp(Math.log(900), Math.log(5200), z)));
    const g = clamp((t - 4.4) / 0.8), lab = clamp((t - 1.8) / 0.5) * (1 - g);
    return fin(marco(b.globe + b.land + `<path d="${b.gen(hokkaido)}" fill="none" stroke="#fff" stroke-opacity="${(0.5 * clamp((t - 2.5) / 0.6)).toFixed(2)}" stroke-width="3"/>` + terr(b.gen(hokkaido), VERDE, 'rv', g)) + arriba('HOKKAIDO', 'NORTE DE JAPÓN', lab, '#fff') + arriba('TIERRA AINU', 'HASTA 1869 SE LLAMABA EZO', g, VERDE)); } },
  // 3 · 1869: anexión, nombre nuevo y colonos (el rojo sube desde el sur)
  colonos: { T: 6.5, f: t => { const b = base(CENTRO_HK, 5200); const u = easeIO(clamp((t - 0.6) / 4.4));
    return fin(marco(b.land + terr(b.gen(hokkaido), VERDE, 'rv', 1) + terr(b.gen(hkHasta(lerp(41.3, 45.7, u))), ROJO, 'rr', clamp(t / 0.5))) + arriba('1869', 'ANEXIÓN Y COLONOS', clamp((t - 0.2) / 0.5))); } },
  // 5 · «¿Por qué sabemos tanto de esta aldea?»
  biratori: { T: 7, f: t => { const z = easeIO(clamp(t / 2.5)); const b = base(d3.geoInterpolate(CENTRO_HK, [142.3, 42.8])(z), Math.exp(lerp(Math.log(5200), Math.log(11000), z)));
    const a = clamp((t - 1.6) / 0.5); return fin(marco(b.land + terr(b.gen(hokkaido), ROJO, 'rr', 0.85) + pin(b.P(BIRATORI), t, a) + etq(b.P(BIRATORI), 'BIRATORI', a)) + arriba('¿QUÉ PASÓ AQUÍ?', '1878', clamp((t - 3.7) / 0.5), '#fff', 330, 120)); } },
  // 6 · Tres partes
  partes: { T: 7, f: t => { const b = base([142.3, 42.8], 11000); const l = i => clamp((t - 0.4 - 1.3 * i) / 0.4);
    const fila = (i, txt) => `<text x="120" y="${300 + i * 95}" font-family="Impact" font-size="84" fill="${i === 0 ? '#fff' : i === 1 ? NAR : '#fff'}" letter-spacing="2" stroke="#0D0D0D" stroke-width="9" paint-order="stroke" opacity="${l(i).toFixed(2)}">${txt}</text>`;
    return fin(marco(b.land + terr(b.gen(hokkaido), ROJO, 'rr', 0.45) + pin(b.P(BIRATORI), t, 0.9) + etq(b.P(BIRATORI), 'BIRATORI', 0.9)) + fila(0, '1. UN TATUAJE') + fila(1, '2. UN SECRETO') + fila(2, '3. UN LIBRO')); } },
  // 10 · «le suplicaron que no se lo dijera al Gobierno»: la aldea en gris, candado
  secreto: { T: 7, f: t => { const z = easeIO(clamp(t / 4)); const b = base([142.2, 42.66], Math.exp(lerp(Math.log(11000), Math.log(16000), z)));
    const q = b.P(BIRATORI), cand = q ? `<g opacity="${clamp((t - 0.8) / 0.5).toFixed(2)}" transform="translate(${q[0] - 38},${q[1] - 150})"><rect x="0" y="40" width="76" height="62" rx="10" fill="${NAR}"/><path d="M14 42 V26 a24 24 0 0 1 48 0 V42" fill="none" stroke="${NAR}" stroke-width="11"/><circle cx="38" cy="68" r="9" fill="#0D0D0D"/></g>` : '';
    return fin(marco(b.land + terr(b.gen(hokkaido), GRIS, 'rr', 0) + `<path d="${b.gen(hokkaido)}" fill="#555" fill-opacity="0.35" stroke="${GRIS}" stroke-width="3"/>` + pin(q, t, 1, GRIS) + etq(q, 'BIRATORI', 1) + cand) + arriba('2. UN SECRETO', 'QUE EL GOBIERNO NO SE ENTERE', clamp((t - 0.2) / 0.5), NAR, 330, 120)); } },
  // 12 · el templo en el monte
  templo: { T: 7, f: t => { const b = base([142.2, 42.75], 11000); const q1 = b.P(BIRATORI), q2 = q1 ? [q1[0] + 40, q1[1] - 150] : null; const u = easeIO(clamp((t - 0.8) / 2.2));
    const lin = q1 && q2 ? `<line x1="${q1[0]}" y1="${q1[1]}" x2="${lerp(q1[0], q2[0], u)}" y2="${lerp(q1[1], q2[1], u)}" stroke="${NAR}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round"/>` : '';
    return fin(marco(b.land + `<path d="${b.gen(hokkaido)}" fill="#555" fill-opacity="0.35" stroke="${GRIS}" stroke-width="3"/>` + lin + pin(q1, t, 1, GRIS) + etq(q1, 'BIRATORI', 1, -28, 60, 'end') + (q2 ? `<path d='M${q2[0] - 60} ${q2[1] + 45} L${q2[0]} ${q2[1] - 30} L${q2[0] + 60} ${q2[1] + 45} Z' fill='#2a2a2a' stroke='#777' stroke-width='3' opacity='${clamp((t - 1) / 0.6).toFixed(2)}'/>` : '') + pin(q2, t, clamp((t - 3) / 0.4)) + etq(q2, 'TEMPLO', clamp((t - 3) / 0.4))) + arriba('NINGÚN EXTRANJERO', 'LO HABÍA VISTO', clamp((t - 3.2) / 0.5), '#fff', 330, 110)); } },
  // 13 · Biratori → Londres, 1880
  londres: { T: 7, f: t => { const arc = d3.geoInterpolate(BIRATORI, LONDRES), u = ease(clamp((t - 0.6) / 3.8)), head = arc(u);
    const zc = easeIO(clamp(t / 1.8)), b = base(d3.geoInterpolate(BIRATORI, head)(0.5 + 0.5 * u), Math.exp(lerp(Math.log(1600), Math.log(430), zc)));
    const pts = []; for (let i = 0; i <= 80; i++) pts.push(arc(i / 80 * u)); const lp = b.gen({ type: 'LineString', coordinates: pts });
    const a = clamp((t - 4.4) / 0.4);
    return fin(marco(b.globe + b.land + terr(b.gen(hokkaido), ROJO, 'rr', 0.7) + `<path d="${lp}" fill="none" stroke="${NAR}" stroke-width="6" stroke-dasharray="3 12" stroke-linecap="round"/>` + pin(b.P(BIRATORI), t, 1) + pin(b.P(LONDRES), t, a) + etq(b.P(LONDRES), 'LONDRES', a)) + arriba('3. UN LIBRO', '1880', clamp((t - 0.2) / 0.5), NAR, 330, 120)); } },
  // 15 · 1998
  ultima: { T: 6.5, f: t => { const b = base(CENTRO_HK, 5200); return fin(marco(b.land + terr(b.gen(hokkaido), ROJO, 'rr', 1))); } },
  // 16 · 2019: reconocidos como pueblo indígena; Upopoy
  r2019: { T: 6.5, f: t => { const b = base(CENTRO_HK, 5200); const g = easeIO(clamp((t - 0.6) / 2)); const a = clamp((t - 2.6) / 0.4);
    return fin(marco(b.land + terr(b.gen(hokkaido), ROJO, 'rr', 1 - g) + terr(b.gen(hokkaido), VERDE, 'rv', g) + pin(b.P(UPOPOY), t, a, VERDE) + etq(b.P(UPOPOY), 'UPOPOY', a, -28, 60, 'end')) + arriba('2019', 'PUEBLO INDÍGENA', clamp((t - 0.4) / 0.5), VERDE, 330, 170)); } },
  // 17 · Londres → Japón: «Japón acabó leyéndolo»
  vuelta: { T: 7, f: t => { const arc = d3.geoInterpolate(LONDRES, TOKIO), u = ease(clamp((t - 0.4) / 3.6)), head = arc(u);
    const zc = easeIO(clamp((t - 3.6) / 2.4)), b = base(zc > 0 ? d3.geoInterpolate(arc(0.5), [139.7, 37])(zc) : arc(0.5), Math.exp(lerp(Math.log(430), Math.log(1400), zc)));
    const pts = []; for (let i = 0; i <= 80; i++) pts.push(arc(i / 80 * u)); const lp = b.gen({ type: 'LineString', coordinates: pts });
    const a = clamp((t - 4) / 0.4);
    return fin(marco(b.globe + b.land + terr(b.gen(hokkaido), VERDE, 'rv', 0.8) + `<path d="${lp}" fill="none" stroke="${NAR}" stroke-width="6" stroke-dasharray="3 12" stroke-linecap="round"/>` + pin(b.P(LONDRES), t, 1) + pin(b.P(TOKIO), t, a) + etq(b.P(TOKIO), 'JAPÓN', a)) + arriba('TRADUCIDO', 'AL JAPONÉS', clamp((t - 4.2) / 0.5), '#fff', 330, 140)); } },
};
const render = (k, t) => new Resvg(ESCENAS[k].f(t), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
async function make(k) {
  const out = `${OUT}/${k}.mp4`, sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  for (let f = 0, n = Math.round(ESCENAS[k].T * FPS); f < n; f++) { if (!sp.stdin.write(render(k, f / FPS))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done; console.log('ok', k);
}
if (require.main === module) {
  const a = process.argv.slice(2);
  if (a[0] === 'png') { fs.writeFileSync(a[2], render(a[1], parseFloat(a[3] || '3'))); console.log('png', a[2]); }
  else (async () => { for (const k of (a.length ? a : Object.keys(ESCENAS))) await make(k); })();
}
module.exports = { ESCENAS };
