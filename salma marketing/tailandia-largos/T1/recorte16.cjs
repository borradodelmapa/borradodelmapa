// Encuadre fijo 16:9 de cada foto (Paco, 15 nov 2026: nada de paneos; el zoom, solo en los datos importantes).
// Cada foto se recorta UNA vez a 1920x1080 en el punto elegido (y: 0 = arriba, 1 = abajo; se mira foto a foto para no cortar caras) → T1/fotos16/W<n>.jpg.
// Con eso el motor ya no recorre las verticales: la imagen queda quieta, con un acercamiento mínimo (kb) y el de énfasis solo donde se marca. 0 €.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const T1 = __dirname, out = path.join(T1, 'fotos16'); fs.mkdirSync(out, { recursive: true });
// punto de encuadre por foto (las que no están: 0.38 en verticales, 0.5 en apaisadas)
const Y = { 5: 0.62, 1: 0.18, 2: 0.12, 15: 0.1, 61: 0.15, 71: 0.3, 79: 0.28, 81: 0.25, 103: 0.15, 113: 0.45, 86: 0.25, 43: 0.2, 105: 0.25, 114: 0.2, 53: 0.55, 55: 0.6, 56: 0.6, 57: 0.6, 58: 0.6, 59: 0.6, 60: 0.6, 62: 0.6, 54: 0.55, 107: 0.45, 108: 0.45, 116: 0.35, 111: 0.45, 75: 0.5, 76: 0.5, 77: 0.5, 78: 0.5, 30: 0.5, 34: 0.5 };
const apt = JSON.parse(fs.readFileSync(path.join(T1, 'aptas.json'), 'utf8'));
for (const a of apt) { const n = +a.id.slice(1), y = Y[n] ?? (a.h > a.w ? 0.38 : 0.5), dst = path.join(out, a.id + '.jpg');
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', path.join(T1, 'fotos', a.id + '.jpg'), '-vf', `crop=iw:'min(ih,iw*9/16)':0:'(ih-min(ih,iw*9/16))*${y}',scale=1920:1080`, '-q:v', '2', dst], { encoding: 'utf8' });
  if (r.status) console.log('FALLO', a.id, r.stderr.slice(0, 200)); }
console.log('recortadas', apt.length);
