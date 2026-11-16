// T3.3: recortes 16:9 de los vídeos de entrenamiento del viaje (Paco en el gimnasio, Chiang Mai; gimnasio FAS en Koh Samui). Sin sonido; 0 €.
// Y el sonido REAL del gimnasio (n.º 96, golpes en las manoplas) para el motor: sfx/th-gimnasio.mp3 (S1).
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const L = JSON.parse(fs.readFileSync(path.join(__dirname, '../T1/videos-lista.json'), 'utf8')), out = path.join(__dirname, 'clips'); fs.mkdirSync(out, { recursive: true });
const C = [ // [nombre, n.º en videos-lista, desde (s), dura (s), y]
  ['manoplas-a', 96, 8, 6, 0.5], ['manoplas-b', 97, 26, 6, 0.5], ['manoplas-c', 96, 68, 6, 0.5], ['patada', 201, 75, 5, 0.45], ['fas', 270, 11, 6, 0.55],
];
const info = [];
for (const [nom, n, ss, t, y] of C) { const src = 'D:/salma-movil/DCIM/Camera/' + L[n].archivo, dst = path.join(out, nom + '.mp4');
  const r = spawnSync(FF, ['-v', 'error', '-y', '-ss', String(ss), '-t', String(t), '-i', src, '-an', '-vf', `crop='if(gt(iw/ih,16/9),ih*16/9,iw)':'if(gt(iw/ih,16/9),ih,iw*9/16)':'(iw-ow)/2':'(ih-oh)*${y}',scale=1920:1080,fps=30`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', dst], { encoding: 'utf8' });
  if (r.status) { console.log('FALLO', nom, r.stderr.slice(0, 200)); continue; }
  info.push({ clip: nom, dura: t, origen: L[n].archivo, desde: ss }); }
fs.writeFileSync(path.join(out, 'clips.json'), JSON.stringify(info, null, 1)); console.log('clips', info.length);
const sfx = 'C:/Users/User/Desktop/salma/salma marketing/india/motor/sfx/th-gimnasio.mp3';
const r = spawnSync(FF, ['-v', 'error', '-y', '-ss', '2', '-t', '110', '-i', 'D:/salma-movil/DCIM/Camera/' + L[96].archivo, '-vn', '-ac', '2', '-ar', '44100', '-af', 'highpass=f=80,loudnorm=I=-20', '-b:a', '192k', sfx], { encoding: 'utf8' });
console.log(r.status ? 'FALLO sfx ' + r.stderr.slice(0, 200) : 'sfx ' + sfx);
