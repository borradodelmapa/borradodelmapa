




const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const topo = require('topojson-client');
const d3 = require('d3-geo');
const D = path.join(__dirname, 'datos');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const OUT = path.join(__dirname, '../../pueblos/bird-vida/mapas'); fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920, CY = 820, FPS = 30;
const world = JSON.parse(fs.readFileSync(D + '/countries-50m.json', 'utf8'));
const countries = topo.feature(world, world.objects.countries).features;
const japon = countries.find(f => String(f.id) === '392');

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

const terr = (d, col, pat, a) => d && a > 0.001 ? `<g opacity="${a.toFixed(3)}"><path d="${d}" fill="url(#${pat})" stroke="${col}" stroke-width="5" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-opacity="0.35" stroke-width="18" stroke-linejoin="round"/></g>` : '';
const pin = (q, t, a = 1, col = NAR) => q ? `<g opacity="${a.toFixed(2)}"><circle cx="${q[0]}" cy="${q[1]}" r="${(32 * (1 + 0.3 * Math.sin(t * 6))).toFixed(1)}" fill="none" stroke="${col}" stroke-opacity="0.6" stroke-width="4"/><circle cx="${q[0]}" cy="${q[1]}" r="17" fill="#0D0D0D"/><circle cx="${q[0]}" cy="${q[1]}" r="12" fill="#fff"/><circle cx="${q[0]}" cy="${q[1]}" r="6" fill="${col}"/></g>` : '';
const etq = (q, txt, a = 1, dx = 28, dy = -24, anchor = 'start', size = 46) => q ? `<text x="${q[0] + dx}" y="${q[1] + dy}" font-family="Arial" font-weight="700" font-size="${size}" fill="#fff" stroke="#0D0D0D" stroke-width="9" paint-order="stroke" text-anchor="${anchor}" letter-spacing="1" opacity="${a.toFixed(2)}">${txt}</text>` : '';

const arriba = (l1, l2, a, col = NAR, y = 430, size = 150) => a > 0.001 ? `<g opacity="${a.toFixed(3)}"><text x="540" y="${y}" font-family="Impact" font-size="${size}" fill="${col}" text-anchor="middle" letter-spacing="2" stroke="#0D0D0D" stroke-width="10" paint-order="stroke">${l1}</text>${l2 ? `<text x="540" y="${y + 70}" font-family="Arial" font-weight="700" font-size="46" fill="#fff" text-anchor="middle" letter-spacing="3" stroke="#0D0D0D" stroke-width="8" paint-order="stroke">${l2}</text>` : ''}</g>` : '';
const marco = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}<rect width="${W}" height="${H}" fill="#0D0D0D"/>${inner}<rect x="0" y="0" width="${W}" height="560" fill="url(#gt)"/><rect x="0" y="1250" width="${W}" height="670" fill="url(#gb)"/>`;
const fin = top => `${top}</svg>`;

const hkHasta = lat => ({ type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: hokkaido.geometry.coordinates.map(p => p.map(r => r.map(([x, y]) => [x, Math.min(y, lat)]))) } });

// Mapas de «Viajeros del mundo · 2 · Isabella Bird» (25-26 nov 2026), con las piezas de mapas-bird-v4.cjs (§12: un solo mapa).
const LIVERPOOL = [-2.98, 53.41], HALIFAX = [-63.57, 44.65], YORK = [-1.08, 53.96], ESTES = [-105.52, 40.38], LONGS = [-105.615, 40.255], LONGMONT = [-105.10, 40.17];
const SRINAGAR = [74.8, 34.08], LEH = [77.58, 34.16], TEHERAN = [51.39, 35.69], SEUL = [126.98, 37.57], MIANZHOU = [104.68, 31.47], PEKIN = [116.4, 39.9], MARRAKECH = [-7.99, 31.63], EDIMBURGO = [-3.19, 55.95];
const linea = (b, arc, u, col = NAR) => { const pts = []; for (let i = 0; i <= 80; i++) pts.push(arc(i / 80 * u)); return `<path d="${b.gen({ type: 'LineString', coordinates: pts })}" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="3 12" stroke-linecap="round"/>`; };
const ESC = {
  // 1854: Inglaterra → Canadá en barco, con 100 libras
  barco: { T: 7, f: t => { const arc = d3.geoInterpolate(LIVERPOOL, HALIFAX), u = ease(clamp((t - 1.2) / 4)), b = base(d3.geoInterpolate(YORK, HALIFAX)(0.5), 1050);
    return fin(marco(b.globe + b.land + linea(b, arc, u) + pin(b.P(YORK), t, 1) + etq(b.P(YORK), 'YORKSHIRE', clamp(t / 0.5), -28, 64, 'end') + pin(b.P(HALIFAX), t, clamp((t - 5) / 0.4)) + etq(b.P(HALIFAX), 'CANADÁ', clamp((t - 5) / 0.4), 28, 64, 'start')) + arriba('1854', 'UN BARCO Y CIEN LIBRAS', clamp((t - 0.2) / 0.5), NAR, 430, 170)); } },
  // 1873: zoom a las Montañas Rocosas, pico Longs
  rocosas: { T: 6.5, f: t => { const z = easeIO(clamp(t / 3.2)), b = base(d3.geoInterpolate([-95, 40], LONGS)(z), Math.exp(lerp(Math.log(1300), Math.log(6000), z)));
    const a = clamp((t - 3) / 0.4); return fin(marco(b.globe + b.land + pin(b.P(LONGS), t, a) + etq(b.P(LONGS), 'PICO LONGS', a)) + arriba('MONTAÑAS ROCOSAS', '1873', clamp((t - 0.3) / 0.5), '#fff', 430, 120)); } },
  // dos meses después: baja sola de Estes Park al llano (Longmont)
  llano: { T: 6, f: t => { const b = base([-105.33, 40.28], 60000), arc = d3.geoInterpolate(ESTES, LONGMONT), u = ease(clamp((t - 0.8) / 3.8));
    return fin(marco(b.land + linea(b, arc, u, '#fff') + pin(b.P(ESTES), t, 1) + etq(b.P(ESTES), 'ESTES PARK', 1, -28, -24, 'end') + pin(b.P(LONGMONT), t, clamp((t - 4.4) / 0.4)) + etq(b.P(LONGMONT), 'LONGMONT', clamp((t - 4.4) / 0.4))) + arriba('DOS MESES DESPUÉS', 'DICIEMBRE DE 1873', clamp((t - 0.2) / 0.5), '#fff', 430, 110)); } },
  // no para: Japón → Cachemira → Tíbet → Persia → Corea → China
  ruta: { T: 7, f: t => { const b = base([92, 34], 600), etapas = [[TOKIO, 'JAPÓN'], [SRINAGAR, 'CACHEMIRA'], [LEH, 'LADAKH'], [TEHERAN, 'PERSIA'], [SEUL, 'COREA'], [MIANZHOU, 'CHINA']];
    let s = ''; etapas.forEach(([p, n], i) => { const a = clamp((t - 0.4 - i * 0.9) / 0.35); if (i) s += linea(b, d3.geoInterpolate(etapas[i - 1][0], p), clamp((t - 0.4 - i * 0.9 + 0.6) / 0.6)); s += pin(b.P(p), t, a) + etq(b.P(p), n, a, ...({ 'JAPÓN': [-10, 70, 'end'], 'COREA': [-28, -30, 'end'], 'PERSIA': [0, -36, 'middle'], 'CACHEMIRA': [-20, 62, 'end'], 'LADAKH': [24, -26, 'start'], 'CHINA': [0, 70, 'middle'] }[n]), 42); });
    return fin(marco(b.globe + b.land + s) + arriba('NO PARA', '', clamp((t - 0.2) / 0.5), NAR, 430, 170)); } },
  // 1896: Sichuan, la pedrada
  china: { T: 5.5, f: t => { const z = easeIO(clamp(t / 2.6)), b = base(d3.geoInterpolate([105, 33], MIANZHOU)(z), Math.exp(lerp(Math.log(1300), Math.log(9000), z))), a = clamp((t - 2.4) / 0.4);
    return fin(marco(b.globe + b.land + pin(b.P(MIANZHOU), t, a) + etq(b.P(MIANZHOU), 'SICHUAN', a)) + arriba('CHINA · 1896', '64 AÑOS', clamp((t - 0.2) / 0.5), '#fff', 430, 130)); } },
  // 1903: el equipaje para Pekín (la línea no llega)
  pekin: { T: 6.5, f: t => { const arc = d3.geoInterpolate(EDIMBURGO, PEKIN), u = ease(clamp((t - 0.6) / 3.4)) * 0.62, b = base(arc(0.5), 560);
    const fade = 1 - clamp((t - 4.4) / 1); return fin(marco(b.globe + b.land + `<g opacity="${fade.toFixed(2)}">${linea(b, arc, u)}</g>` + pin(b.P(EDIMBURGO), t, 1) + etq(b.P(EDIMBURGO), 'EDIMBURGO', 1) + pin(b.P(PEKIN), t, 0.9, GRIS) + etq(b.P(PEKIN), 'PEKÍN', 0.9, -28, -24, 'end')) + arriba('72 AÑOS', 'EL EQUIPAJE, HECHO', clamp((t - 0.2) / 0.5), '#fff', 430, 150)); } },
  // v6 fila 1: del mundo a Colorado; se enciende el pico Longs
  colorado: { T: 5, f: t => { const z = easeIO(clamp((t - 0.2) / 3)), b = base(d3.geoInterpolate([-60, 30], LONGS)(z), Math.exp(lerp(Math.log(420), Math.log(2600), z)));
    const a = clamp((t - 3) / 0.4); return fin(marco(b.globe + b.land + pin(b.P(LONGS), t, a) + etq(b.P(LONGS), 'PICO LONGS · 4.346 M', a, 0, 74, 'middle')) + arriba('COLORADO', 'ESTADOS UNIDOS', clamp((t - 0.2) / 0.5), '#fff', 430, 150)); } },
  // v6 fila 5: tres partes, tres sitios
  partes: { T: 7.5, f: t => { const b = base([-105.36, 40.28], 60000), P3 = [[LONGS, '1 · EL FORAJIDO', [0, 74, 'middle']], [LONGMONT, '2 · LA VENTISCA', [0, 74, 'middle']], [ESTES, '3 · LA PROMESA', [0, -36, 'middle']]];
    let s = ''; P3.forEach(([p, n, o], i) => { const a = clamp((t - 1.2 - i * 0.9) / 0.35); s += pin(b.P(p), t, a) + etq(b.P(p), n, a, ...o, 44); });
    return fin(marco(b.land + s) + arriba('TRES PARTES', 'COLORADO · 1873', clamp((t - 0.2) / 0.5), NAR, 430, 150)); } },
  // v6 fila 16: siguió viajando treinta años más (Colorado → Japón → Persia → China)
  vuelta: { T: 4.5, f: t => { const et = [[ESTES, 'COLORADO'], [TOKIO, 'JAPÓN'], [TEHERAN, 'PERSIA'], [MIANZHOU, 'CHINA']], cen = d3.geoInterpolate([-150, 40], [95, 35]), b = base(cen(easeIO(clamp(t / 3.6))), 430);
    let s = ''; et.forEach(([p, n], i) => { const a = clamp((t - 0.2 - i * 0.9) / 0.3); if (i) s += linea(b, d3.geoInterpolate(et[i - 1][0], p), clamp((t - 0.2 - i * 0.9 + 0.6) / 0.6)); const q = b.P(p); s += pin(q, t, a) + (q && q[1] > 600 ? etq(q, n, a, 0, 70, "middle", 42) : ""); });
    return fin(marco(b.globe + b.land + s) + arriba('30 AÑOS MÁS', '1874 – 1904', clamp((t - 0.1) / 0.4), NAR, 430, 150)); } },
  // v7 fila 5: tres partes de su vida (Inglaterra · Colorado · Asia)
  tres: { T: 7.5, f: t => { const et = [[YORK, '1 · LA INVÁLIDA'], [ESTES, '2 · LO CONTABA TODO'], [MIANZHOU, '3 · LOS HOSPITALES']], u0 = easeIO(clamp((t - 0.3) / 6)), b = base([lerp(-5, -250, u0), lerp(50, 36, u0)], 430);
    let s = ''; et.forEach(([p, n], i) => { const a = clamp((t - [0.6, 2.6, 5.2][i]) / 0.35); const q = b.P(p); s += (q && q[1] > 600 ? pin(q, t, a) + etq(q, n, a, ...(q[0] > 640 ? [-28, 70, 'end'] : q[0] < 440 ? [28, 70, 'start'] : [0, 70, 'middle']), 42) : ''); });
    return fin(marco(b.globe + b.land + s) + arriba('TRES PARTES', '1831 – 1904', clamp((t - 0.1) / 0.4), NAR, 430, 150)); } },
  // v8: los pueblos que contó (Japón · Corea · China · Kurdistán)
  pueblos: { T: 7, f: t => { const u0 = easeIO(clamp((t - 0.3) / 5.5)), b = base([lerp(140, 50, u0), lerp(40, 36, u0)], 520), et = [[[142.5, 43], 'AINU · JAPÓN'], [SEUL, 'COREA'], [MIANZHOU, 'CHINA'], [[44, 37.5], 'KURDOS']];
    let s = ''; et.forEach(([p, n], i) => { const a = clamp((t - [0.4, 1.8, 3.2, 4.8][i]) / 0.35); const q = b.P(p); const o = { 'AINU · JAPÓN': [-28, -30, 'end'], 'COREA': [-28, 60, 'end'] }[n] || [0, 70, 'middle']; s += (q && q[1] > 600 ? pin(q, t, a) + etq(q, n, a, ...o, 42) : ''); });
    return fin(marco(b.globe + b.land + s) + arriba('LO CONTABA TODO', '', clamp((t - 0.1) / 0.4), NAR, 430, 130)); } },
  // v8: cinco hospitales (Cachemira · Amritsar · Seúl · dos en China)
  hospitales: { T: 7, f: t => { const b = base([95, 32], 650), et = [[[75.15, 33.73], 'CACHEMIRA', [-24, -30, 'end']], [[74.87, 31.63], 'AMRITSAR', [-24, 60, 'end']], [SEUL, 'SEÚL', [0, 70, 'middle']], [[105.97, 31.56], 'CHINA ×2', [0, 70, 'middle']]];
    let s = ''; et.forEach(([p, n, o], i) => { const a = clamp((t - 0.6 - i * 1.1) / 0.35); s += pin(b.P(p), t, a) + etq(b.P(p), n, a, ...o, 42); });
    return fin(marco(b.globe + b.land + s) + arriba('5 HOSPITALES', 'PAGADOS POR ELLA', clamp((t - 0.1) / 0.4), NAR, 430, 150)); } },
};
const render = (k, t) => new Resvg(ESC[k].f(t), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
async function make(k) {
  const out = `${OUT}/${k}.mp4`, sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  for (let f = 0, n = Math.round(ESC[k].T * FPS); f < n; f++) { if (!sp.stdin.write(render(k, f / FPS))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done; console.log('ok', k);
}
if (require.main === module) { const a = process.argv.slice(2);
  if (a[0] === 'png') { fs.writeFileSync(a[2], render(a[1], parseFloat(a[3] || '3'))); console.log('png', a[2]); }
  else (async () => { for (const k of (a.length ? a : Object.keys(ESC))) await make(k); })(); }
