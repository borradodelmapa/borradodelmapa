// Tailandia 2 (T3.2): recortes de los VÍDEOS del bucle (5-10 feb 2026), vistos con T1/ver-clips.cjs (_vc-a.jpg, _vc-b.jpg); solo adultos de lejos, sin acompañantes ni menores. 16:9, sin sonido. 0 €.
// Además copia de T1/clips los que ya se usaron allí y valen aquí (calle de Pai, carretera, foso, lago).
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const L = JSON.parse(fs.readFileSync(path.join(__dirname, '../T1/videos-lista.json'), 'utf8')), out = path.join(__dirname, 'clips'); fs.mkdirSync(out, { recursive: true });
const C = [ // [nombre, n.º en videos-lista, desde (s), dura (s), y]
  ['curvas-a', 131, 3, 7, 0.45], ['curvas-b', 131, 26, 7, 0.45], ['pai-atardecer', 133, 1, 7, 0.55], ['lago-tarde', 143, 5, 7, 0.55], ['lago-barcas', 150, 12, 8, 0.6],
  ['lago-niebla', 152, 2, 8, 0.6], ['niebla-2', 153, 2, 7, 0.62], ['pista', 158, 30, 6, 0.5], ['kayan-casas', 162, 5, 6, 0.6], ['kayan-calle', 166, 1, 6, 0.6],
  ['rio-sariang', 169, 9, 5, 0.6], ['cascada-2', 176, 7, 7, 0.4], ['elefante-2', 182, 10, 8, 0.4],
];
const info = [];
for (const [nom, n, ss, t, y] of C) { const src = 'D:/salma-movil/DCIM/Camera/' + L[n].archivo, dst = path.join(out, nom + '.mp4');
  if (!fs.existsSync(dst)) { const r = spawnSync(FF, ['-v', 'error', '-y', '-ss', String(ss), '-t', String(t), '-i', src, '-an', '-vf', `crop='if(gt(iw/ih,16/9),ih*16/9,iw)':'if(gt(iw/ih,16/9),ih,iw*9/16)':'(iw-ow)/2':'(ih-oh)*${y}',scale=1920:1080,fps=30`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-pix_fmt', 'yuv420p', dst], { encoding: 'utf8' });
    if (r.status) { console.log('FALLO', nom, r.stderr.slice(0, 200)); continue; } }
  info.push({ clip: nom, dura: t, origen: L[n].archivo, desde: ss }); }
const T1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../T1/clips/clips.json'), 'utf8'));
for (const k of T1.filter(k => ['calle-noche', 'carretera-c', 'foso', 'lago'].includes(k.clip))) { fs.copyFileSync(path.join(__dirname, '../T1/clips', k.clip + '.mp4'), path.join(out, k.clip + '.mp4')); info.push(k); }
fs.writeFileSync(path.join(out, 'clips.json'), JSON.stringify(info, null, 1)); console.log('clips', info.length);
