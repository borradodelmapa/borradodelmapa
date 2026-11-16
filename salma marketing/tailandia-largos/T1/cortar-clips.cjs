// Tailandia 1: recortes de los VÍDEOS del viaje de Paco (vistos enteros con ver-clips.cjs; solo adultos de lejos, sin acompañantes ni menores), pasados a 16:9 (1920x1080, sin sonido) en T1/clips/.
// y = dónde cae la ventana 16:9 dentro del vídeo vertical (0 arriba, 1 abajo). Y el sonido REAL de tres de ellos, para el ambiente (S1): motor/sfx/th-*.mp3. 0 €.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'videos-lista.json'), 'utf8')), out = path.join(__dirname, 'clips'); fs.mkdirSync(out, { recursive: true });
const C = [ // [nombre, n.º en videos-lista, desde (s), dura (s), y]
  ['carretera-a', 103, 14, 7, 0.36], ['carretera-b', 105, 6, 7, 0.4], ['carretera-c', 171, 3, 6, 0.33],
  ['mercado-noche', 3, 0, 5, 0.42], ['avenida', 7, 2, 7, 0.62], ['foso', 202, 6, 6, 0.5], ['calle-noche', 134, 13, 7, 0.6],
  ['lago', 148, 4, 8, 0.5], ['cascada', 177, 3, 7, 0.36], ['elefante', 180, 1, 7, 0.3],
];
const info = [];
for (const [nom, n, ss, t, y] of C) { const src = 'D:/salma-movil/DCIM/Camera/' + L[n].archivo, dst = path.join(out, nom + '.mp4');
  const r = spawnSync(FF, ['-v', 'error', '-y', '-ss', String(ss), '-t', String(t), '-i', src, '-an', '-vf', `crop='if(gt(iw/ih,16/9),ih*16/9,iw)':'if(gt(iw/ih,16/9),ih,iw*9/16)':'(iw-ow)/2':'(ih-oh)*${y}',scale=1920:1080,fps=30`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', dst], { encoding: 'utf8' });
  if (r.status) { console.log('FALLO', nom, r.stderr.slice(0, 200)); continue; } info.push({ clip: nom, dura: t, origen: L[n].archivo, desde: ss }); }
fs.writeFileSync(path.join(out, 'clips.json'), JSON.stringify(info, null, 1)); console.log('clips', info.length);
const SFX = 'C:/Users/User/Desktop/salma/salma marketing/india/motor/sfx/';
for (const [nom, n, ss, t] of [['th-moto', 103, 10, 40], ['th-ciudad', 7, 0, 12], ['th-cascada', 177, 0, 20]]) {
  const r = spawnSync(FF, ['-v', 'error', '-y', '-ss', String(ss), '-t', String(t), '-i', 'D:/salma-movil/DCIM/Camera/' + L[n].archivo, '-vn', '-ac', '2', '-ar', '44100', '-b:a', '160k', SFX + nom + '.mp3'], { encoding: 'utf8' });
  const v = spawnSync(FF, ['-i', SFX + nom + '.mp3', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }); console.log(nom, r.status ? 'FALLO' : 'ok', (/mean_volume: [-\d.]+ dB/.exec(v.stderr) || [''])[0]); }
