// Hoja de comprobación de T2: cada foto ya recortada (fotos16 si existe, si no fotos), numerada. Uso: node hoja-sel.cjs [fotos16|fotos] 0 €.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const dir = process.argv[2] || 'fotos', apt = JSON.parse(fs.readFileSync(path.join(__dirname, 'aptas.json'), 'utf8'));
const tmp = path.join(__dirname, '_h'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
apt.forEach((a, i) => { const r = spawnSync(FF, ['-v', 'error', '-y', '-i', path.join(__dirname, dir, a.id + '.jpg'), '-vf', `scale=300:300:force_original_aspect_ratio=decrease,pad=304:304:(ow-iw)/2:(oh-ih)/2:black,drawtext=fontfile=arialbd.ttf:text='${a.id.slice(1)}':x=5:y=5:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.7,format=yuvj420p`, '-pix_fmt', 'yuvj420p', '-frames:v', '1', path.join(tmp, String(i).padStart(3, '0') + '.jpg')], { cwd: 'C:/Windows/Fonts', encoding: 'utf8' }); if (r.status) console.log(a.id, r.stderr.slice(0, 150)); });
const r = spawnSync(FF, ['-v', 'error', '-y', '-framerate', '1', '-start_number', '0', '-i', path.join(tmp, '%03d.jpg'), '-vf', 'tile=10x' + Math.ceil(apt.length / 10), '-frames:v', '1', path.join(__dirname, `hoja-${dir}.jpg`)], { encoding: 'utf8' });
console.log(r.status ? r.stderr : 'hoja-' + dir + '.jpg', apt.length); 
