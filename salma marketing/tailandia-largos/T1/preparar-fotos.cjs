// Tailandia 1 (T3.1): copia las fotos elegidas del viaje a T1/fotos como W<n>.jpg (rotación ya aplicada, máx. 3840 px) y escribe aptas.json (id, w, h, origen). 0 €.
// Códigos: B/C/L/D/S + número = índice de la hoja de contactos (hoja-bangkok, -chiangmai, -loop, -dia0207, -samui .txt); K = cámara (Muay Thai); A = asia/material-v4.
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const T = path.join(__dirname, '..'), FF = 'C:/Users/User/Desktop/salma/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const hoja = n => Object.fromEntries(fs.readFileSync(path.join(T, `hoja-${n}.txt`), 'utf8').split('\n').filter(Boolean).map(l => l.split(' ')));
const H = { B: hoja('bangkok'), C: hoja('chiangmai'), L: hoja('loop'), D: hoja('dia0207'), S: hoja('samui') };
const src = c => { const k = c[0], n = c.slice(1);
  if (k === 'K') return `D:/salma-movil/camara-canon/drive/IMG_${n}.JPG`;
  if (k === 'X') return 'D:/salma-movil/DCIM/Camera/IMG_' + n + '.jpg';
  if (k === 'A') return `C:/Users/User/Desktop/salma/salma marketing/asia/material-v4/${n}.jpg`;
  if (!H[k][n]) throw new Error('no existe ' + c); return 'D:/salma-movil/DCIM/Camera/' + H[k][n]; };
const SEL = JSON.parse(fs.readFileSync(path.join(__dirname, 'seleccion.json'), 'utf8')); // { "W1": "K4037", ... }
const out = path.join(__dirname, 'fotos'); fs.mkdirSync(out, { recursive: true });
const apt = [];
for (const [id, c] of Object.entries(SEL)) { const dst = path.join(out, id + '.jpg');
  if (!fs.existsSync(dst)) { const r = spawnSync(FF, ['-v', 'error', '-y', '-i', src(c), '-vf', "scale='min(3840,iw)':-2", '-q:v', '2', dst], { encoding: 'utf8' }); if (r.status) { console.log('FALLO', id, c, r.stderr.slice(0, 200)); continue; } }
  const b = fs.readFileSync(dst); let i = 2, w = 0, h = 0; while (i < b.length) { const m = b[i + 1], l = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; } i += 2 + l; }
  apt.push({ id, w, h, origen: c, archivo: path.basename(src(c)) }); }
fs.writeFileSync(path.join(__dirname, 'aptas.json'), JSON.stringify(apt, null, 1)); console.log('fotos', apt.length);
// hoja de comprobación
const tmp = path.join(__dirname, '_h'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
apt.forEach((a, i) => spawnSync(FF, ['-v', 'quiet', '-y', '-i', path.join(out, a.id + '.jpg'), '-vf', `scale=230:230:force_original_aspect_ratio=decrease,pad=240:240:(ow-iw)/2:(oh-ih)/2:black,drawtext=fontfile=impact.ttf:text='${a.id.slice(1)}':x=5:y=5:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.7`, path.join(tmp, String(i).padStart(3, '0') + '.jpg')], { cwd: 'C:/Windows/Fonts' }));
spawnSync(FF, ['-v', 'quiet', '-y', '-framerate', '1', '-i', path.join(tmp, '%03d.jpg'), '-vf', 'tile=10x' + Math.ceil(apt.length / 10), '-frames:v', '1', path.join(__dirname, 'hoja-seleccion.jpg')]); fs.rmSync(tmp, { recursive: true, force: true });
