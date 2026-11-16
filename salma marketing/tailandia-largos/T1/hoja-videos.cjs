// Hoja de contactos de los VÍDEOS del viaje (16 ene–20 feb 2026): un fotograma por vídeo (al 30 % de su duración), numerado. Lista en videos-lista.json (n, archivo, fecha, segundos). 0 €.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const a = require('D:/salma-movil/indice.json').filter(x => /v[ií]deo/i.test(x.tipo) && !/pantalla/.test(x.tipo) && x.carpeta === 'DCIM/Camera' && x.fecha >= '2026-01-16' && x.fecha <= '2026-02-20');
const tmp = path.join(__dirname, '_hv'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
const lista = [];
a.forEach((x, i) => { const src = 'D:/salma-movil/DCIM/Camera/' + x.archivo;
  const p = spawnSync(FF, ['-i', src], { encoding: 'utf8' }); const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(p.stderr || ''); const dur = m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0;
  lista.push({ n: i, archivo: x.archivo, fecha: x.fecha, s: Math.round(dur) });
  spawnSync(FF, ['-v', 'quiet', '-y', '-ss', String(Math.max(0, dur * 0.3)), '-i', src, '-frames:v', '1', '-vf', `scale=220:220:force_original_aspect_ratio=decrease,pad=224:224:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,drawtext=text='${i} ${Math.round(dur)}s':x=4:y=4:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7`, path.join(tmp, String(i).padStart(3, '0') + '.jpg')]); });
fs.writeFileSync(path.join(__dirname, 'videos-lista.json'), JSON.stringify(lista));
for (let k = 0; k * 96 < a.length; k++) spawnSync(FF, ['-v', 'quiet', '-y', '-start_number', String(k * 96), '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-frames:v', '1', '-vf', 'tile=12x8', path.join(__dirname, `hoja-videos-${k + 1}.jpg`)]);
fs.rmSync(tmp, { recursive: true, force: true }); console.log('videos', a.length);
