// T2 · Encuadre fijo 16:9 de cada foto (Paco, 15 nov 2026: nada de paneos; el zoom, solo en los datos importantes).
// Cada foto se recorta UNA vez a 1920x1080 en el punto elegido (y: 0 = arriba, 1 = abajo; se mira foto a foto para no cortar caras) → T1/fotos16/W<n>.jpg.
// Con eso el motor ya no recorre las verticales: la imagen queda quieta, con un acercamiento mínimo (kb) y el de énfasis solo donde se marca. 0 €.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const T1 = __dirname, out = path.join(T1, 'fotos16'); fs.mkdirSync(out, { recursive: true });
// punto de encuadre por foto (las que no están: 0.38 en verticales, 0.5 en apaisadas)
const Y = { 1: 0.82, 2: 0.85, 3: 0.4, 7: 0.4, 27: 0.5, 30: 0.3, 36: 0.4, 37: 0.4, 46: 0.55, 47: 0.55, 62: 0.4, 68: 0.4, 71: 0.3, 13: 0.55, 33: 0.55, 31: 0.5, 32: 0.5, 52: 0.5, 51: 0.5 };
const apt = JSON.parse(fs.readFileSync(path.join(T1, 'aptas.json'), 'utf8'));
for (const a of apt) { const n = +a.id.slice(1), y = Y[n] ?? (a.h > a.w ? 0.38 : 0.5), dst = path.join(out, a.id + '.jpg');
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', path.join(T1, 'fotos', a.id + '.jpg'), '-vf', `crop=iw:'min(ih,iw*9/16)':0:'(ih-min(ih,iw*9/16))*${y}',scale=1920:1080`, '-q:v', '2', dst], { encoding: 'utf8' });
  if (r.status) console.log('FALLO', a.id, r.stderr.slice(0, 200)); }
console.log('recortadas', apt.length);
