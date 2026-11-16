// Hoja de comprobación de T1/fotos (número = W<n>). Uso: node hoja-sel.cjs [desde] [hasta]
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const apt = JSON.parse(fs.readFileSync(path.join(__dirname, 'aptas.json'), 'utf8')), d = +process.argv[2] || 1, h = +process.argv[3] || 999;
const sel = apt.filter(a => +a.id.slice(1) >= d && +a.id.slice(1) <= h);
const tmp = path.join(__dirname, '_h'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp); let err = '';
sel.forEach((a, i) => { const r = spawnSync(FF, ['-v', 'error', '-y', '-i', path.join(__dirname, 'fotos', a.id + '.jpg'), '-vf', `scale=300:300:force_original_aspect_ratio=decrease,pad=310:310:(ow-iw)/2:(oh-ih)/2:black,format=yuv420p,drawtext=text='${a.id.slice(1)}':x=5:y=5:fontsize=30:fontcolor=yellow:box=1:boxcolor=black@0.7`, '-frames:v', '1', path.join(tmp, String(i).padStart(3, '0') + '.jpg')], { encoding: 'utf8' }); if (r.status && !err) err = a.id + ' ' + r.stderr.replace(/Fontconfig[^\n]*\n/g, '').slice(0, 300); });
if (err) console.log('PRIMER FALLO', err);
const out = path.join(__dirname, `hoja-sel-${d}-${h}.jpg`);
spawnSync(FF, ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-vf', 'tile=8x' + Math.ceil(sel.length / 8), '-frames:v', '1', out]); fs.rmSync(tmp, { recursive: true, force: true }); console.log(out, sel.length);
