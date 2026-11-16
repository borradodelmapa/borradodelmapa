// T3.3 · Una noche de Muay Thai: fotos con encuadre FIJO 16:9 (M12: quietas, sin paneo; el zoom solo como énfasis en los datos). 0 €.
// Códigos: K = cámara Canon (D:/salma-movil/camara-canon/drive, fotos de la noche con permiso de Lina y su equipo) · P = cámara Canon (Pictures/Canon EOS RP)
//          S = hoja-samui (móvil de Paco, Koh Samui) · H = archivo de Wikimedia Commons (T3/archivo, créditos en creditos.json).
// Encuadre: y (0 arriba … 1 abajo) en un recorte 16:9 del ancho entero; o [cx, cy, ancho] para un plano de DETALLE sacado de la misma foto (otro plano, misma foto).
// Salida: T3/fotos16/<id>.jpg (1920x1080). Uso: node preparar-fotos.cjs
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const T = path.join(__dirname, '..'), out = path.join(__dirname, 'fotos16'); fs.mkdirSync(out, { recursive: true });
const samui = Object.fromEntries(fs.readFileSync(path.join(T, 'hoja-samui.txt'), 'utf8').split('\n').filter(Boolean).map(l => l.trim().split(' ')));
const src = c => { const k = c[0], n = c.slice(1).replace(/[a-z]$/, '');
  if (k === 'K') return `D:/salma-movil/camara-canon/drive/IMG_${n}.JPG`;
  if (k === 'P') return `D:/salma-movil/Pictures/Canon EOS RP/IMG_${n}.JPG`;
  if (k === 'S') return 'D:/salma-movil/DCIM/Camera/' + samui[n];
  if (k === 'H') return path.join(__dirname, 'archivo', `H${n}.jpg`);
  throw new Error('código ' + c); };
// id: encuadre. Las verticales de la Canon salen a 1080 de ancho: van como detalle (D) y pocas.
const F = {
  K4045: 0.35, K4029: 0.45, K4063: 0.3, K4037: 0.25, S16: 0.5, K4207: 0.25, K4218: 0.6, K4253: 0.55,
  K4011: 0.4, P4081: 0.4, K4031: 0.3, K4039: 0.4, K4069: 0.35, K4035: 0.4, K4036: 0.35, K4013: 0.6,
  K4048: 0.3, P4044: 0.3, K4206: 0.35, K4212: 0.35, P4041: 0.25, K4221: 0.6, K4231: 0.6, K4228: 0.6, K4233: 0.55,
  K4236: 0.55, K4238: 0.55, K4239: 0.55, K4245: 0.55, K4265: 0.5, K4266: 0.55, K4269: 0.5, S12: 0.5, S15: 0.5, S17: 0.5, S14: 0.3, S22: 0.5, S13: 0.5, S29: 0.4, S49: 0.4,
  H11: 0.5, H12: 0.4, H13: 0.5, H4: 0.5, H1: 0.5, H2: 0.5, H3: 0.5, H5: 0.5, H6: 0.5, H10: 0.5, H7: 0.3, H8: 0.35, H9: 0.4,
  // detalles (misma foto, otro plano)
  K4253d: [0.62, 0.55, 0.55], K4265d: [0.45, 0.5, 0.5], K4266d: [0.4, 0.5, 0.5], K4269d: [0.45, 0.5, 0.5], K4221d: [0.5, 0.55, 0.7],
  K4231d: [0.5, 0.5, 0.5], K4245d: [0.5, 0.45, 0.5], K4239d: [0.45, 0.5, 0.5], K4236d: [0.45, 0.5, 0.5], K4212d: [0.55, 0.4, 0.55], K4238d: [0.5, 0.5, 0.5], K4269w: [0.55, 0.5, 0.75], K4253w: [0.5, 0.5, 0.75], H8d: [0.5, 0.65, 0.6], H11d: [0.55, 0.5, 0.6], H7d: [0.5, 0.35, 0.7], H13d: [0.45, 0.5, 0.55], H12d: [0.5, 0.45, 0.6],
};
let n = 0;
for (const [id, e] of Object.entries(F)) { const dst = path.join(out, id + '.jpg');
  const vf = Array.isArray(e)
    ? `crop='iw*${e[2]}':'iw*${e[2]}*9/16':'min(max(0,iw*${e[0]}-iw*${e[2]}/2),iw-iw*${e[2]})':'min(max(0,ih*${e[1]}-iw*${e[2]}*9/32),ih-iw*${e[2]}*9/16)',scale=1920:1080:flags=lanczos`
    : `crop=iw:'min(ih,iw*9/16)':0:'(ih-min(ih,iw*9/16))*${e}',scale=1920:1080:flags=lanczos`;
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', src(id), '-vf', vf, '-q:v', '2', dst], { encoding: 'utf8' });
  if (r.status) console.log('FALLO', id, r.stderr.slice(0, 300)); else n++; }
console.log('fotos16', n, 'de', Object.keys(F).length);
// hoja de comprobación
const tmp = path.join(__dirname, '_h'); fs.mkdirSync(tmp, { recursive: true }); fs.readdirSync(tmp).forEach(f => fs.unlinkSync(path.join(tmp, f)));
Object.keys(F).forEach((id, i) => spawnSync(FF, ['-v', 'quiet', '-y', '-i', path.join(out, id + '.jpg'), '-vf', `scale=384:216,drawtext=fontfile=impact.ttf:text='${id}':x=5:y=5:fontsize=24:fontcolor=yellow:box=1:boxcolor=black@0.7`, path.join(tmp, String(i).padStart(3, '0') + '.jpg')], { cwd: 'C:/Windows/Fonts' }));
spawnSync(FF, ['-v', 'quiet', '-y', '-reinit_filter', '0', '-i', path.join(tmp, '%03d.jpg'), '-vf', 'tile=6x' + Math.ceil(Object.keys(F).length / 6), '-frames:v', '1', path.join(__dirname, 'hoja-fotos16.jpg')]);
