// PORTADA por defecto (modelo de Tailandia/Vietnam: estilo B constructivista, foto en color con look BDM Film).
// Foto + banda naranja inclinada (título negro, frase blanca) + franja negra inclinada con el rótulo de la serie. 1080x1920.
// Es el MISMO diseño de salma marketing/portadas/covers-all.cjs, ya sin listas de fotos atadas a otras sesiones. Una sola copia viva: esta.
// Uso: await generar({ src, foco:[x,y,h], l1, l2, tag, out, ancho }) · ancho < 1080 = vista previa rápida. Local, 0 €.
const { spawn } = require('child_process');
const BASE = require('path').resolve(__dirname, '..'), FF = BASE + '/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const FONTD = 'C\\:/Windows/Fonts';
const exec = args => new Promise((ok, ko) => {
  const p = spawn(FF, ['-v', 'error', '-y', ...args]); let o = '', e = '';
  p.stdout.on('data', d => o += d); p.stderr.on('data', d => e += d);
  p.on('error', ko); p.on('close', c => c ? ko(new Error(e.slice(0, 600))) : ok(o + e));
});
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
async function stat(src) {
  const o = await exec(['-i', src, '-frames:v', '1', '-vf', 'scale=320:-1,signalstats,metadata=print:file=-', '-f', 'null', '-']);
  const g = k => { const m = o.match(new RegExp('lavfi.signalstats.' + k + '=([0-9.]+)')); return m ? +m[1] : null; };
  return { y: g('YAVG') ?? 105, sat: g('SATAVG') ?? 46 };
}
const LOOK = st => { const dy = clamp((105 - st.y) / 255 * 0.95, -0.10, 0.17), sf = clamp(46 / Math.max(st.sat, 8), 0.85, 1.30);
  return `eq=brightness=${dy.toFixed(3)}:contrast=1.06:saturation=${(sf * 0.96).toFixed(3)},curves=all='0/0.04 0.18/0.17 0.5/0.52 0.82/0.84 1/0.965',huesaturation=colors=b+c:saturation=-0.42,huesaturation=colors=g:saturation=-0.28,colorbalance=rs=-0.02:gs=0.008:bs=0.04:rm=0.02:bm=-0.015:rh=0.035:bh=-0.035,noise=alls=6:allf=t+u,vignette=PI/7`; };
const esc = s => String(s).replace(/'/g, '’');
const fnt = s => /[^\u0000-ÿ]/.test(s) ? 'segoeuib.ttf' : 'impact.ttf';
const size = (s, base, maxw, k) => Math.min(base, Math.floor(maxw / (Math.max(1, s.length) * k)));
async function generar({ src, foco = [0.5, 0.5, 0.9], l1, l2, tag, out, ancho = 1080 }) {
  const st = await stat(src), [fx, fy, fh] = foco;
  const s1 = size(l1, 230, 930, 0.50), s2 = size(l2, 108, 930, fnt(l2) === 'impact.ttf' ? 0.50 : 0.60), s3 = size(tag, 60, 930, 0.43);
  const T = (txt, fsz, col, x, y, font) => `drawtext=expansion=none:fontfile='${FONTD}/${font}':text='${esc(txt)}':fontsize=${fsz}:fontcolor=${col}:x=${x}:y=${y}`;
  const base = `[0:v]crop=w='trunc(min(ih*${fh}*9/16,iw)/2)*2':h='trunc(min(ih*${fh}*9/16,iw)*16/9/2)*2':x='max(0,min(iw-out_w,iw*${fx}-out_w/2))':y='max(0,min(ih-out_h,ih*${fy}-out_h/2))',scale=1080:1920:flags=lanczos,${LOOK(st)}[bg]`;
  const hh = s1 * 1.02 + 14 + s2 * 1.05, y1 = Math.max(20, Math.round(30 + (360 - hh) / 2)), y2 = Math.round(y1 + s1 * 1.02 + 14);
  const rot = 'rotate=-8*PI/180:ow=rotw(-8*PI/180):oh=roth(-8*PI/180):c=none';
  const fin = ancho < 1080 ? `,scale=${ancho}:-2` : '';
  await exec(['-i', src, '-f', 'lavfi', '-i', 'color=c=0xF4630B:s=1700x440,format=rgba', '-f', 'lavfi', '-i', 'color=c=0x0D0D0D:s=1700x150,format=rgba', '-filter_complex',
    `${base};[1:v]${T(l1, s1, 'black', 330, y1, fnt(l1))},${T(l2, s2, 'white', 330, y2, fnt(l2))},${rot}[b1];[2:v]${T(tag, s3, 'white', 330, 46, 'ARIALNB.TTF')},${rot}[b2];[bg][b1]overlay=x=-260:y=1110[v1];[v1][b2]overlay=x=-260:y=1535,format=rgb24${fin}`,
    '-frames:v', '1', out]);
  return out;
}
module.exports = { generar };
