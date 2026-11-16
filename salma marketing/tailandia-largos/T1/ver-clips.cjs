// Para VER un vídeo del viaje antes de usarlo (F10): saca N fotogramas repartidos por toda su duración, en una fila por vídeo. Uso: node ver-clips.cjs <salida.jpg> <n1> <n2> ...
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'videos-lista.json'), 'utf8')), [out, ...ns] = process.argv.slice(2), N = 6;
const tmp = path.join(__dirname, '_vc'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp); let k = 0;
for (const n of ns) { const v = L[+n]; for (let i = 0; i < N; i++) { const t = v.s * (i + 0.5) / N;
  spawnSync(FF, ['-v', 'quiet', '-y', '-ss', String(t), '-i', 'D:/salma-movil/DCIM/Camera/' + v.archivo, '-frames:v', '1', '-vf', `scale=300:300:force_original_aspect_ratio=decrease,pad=304:304:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,drawtext=text='${n} ${Math.round(t)}s':x=4:y=4:fontsize=24:fontcolor=yellow:box=1:boxcolor=black@0.7`, path.join(tmp, String(k++).padStart(3, '0') + '.jpg')]); } }
spawnSync(FF, ['-v', 'quiet', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-frames:v', '1', '-vf', `tile=${N}x${ns.length}`, path.join(__dirname, out)]); fs.rmSync(tmp, { recursive: true, force: true }); console.log(out);
