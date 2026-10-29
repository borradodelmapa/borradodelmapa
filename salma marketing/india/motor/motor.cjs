// MOTOR DE MONTAJE · BORRADO DEL MAPA · India (derivado del montador de Asia, adaptado a 2 voces)
// Entrada: una configuración de capítulo (ver cap4.cjs). Salida: mp4 vertical con voces, subtítulos con palabra iluminada,
// cifras, mapa, ambiente real por escena con ducking y nivelación a -14 LUFS. Local salvo la voz (ElevenLabs).
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { spawnSync } = require('child_process');
const ROOT = 'C:/Users/User/Desktop/salma', BASE = ROOT + '/salma marketing/india', HERE = __dirname;
const reglas = require('./reglas.cjs');
const FF = BASE + '/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const FONTD = 'C\\:/Windows/Fonts', IMPACT = FONTD + '/impact.ttf', ARIALB = FONTD + '/arialbd.ttf';
const ORANGE_ASS = '&H0B63F4&';
const run = (a, o = {}) => { const r = spawnSync(FF, ['-v', 'error', '-y', ...a], { encoding: 'utf8', maxBuffer: 1e9, ...o }); if (r.status) { console.error('FFMPEG FALLÓ:\n', a.join(' ').slice(0, 500), '\n', (r.stderr || '').slice(0, 1200)); process.exit(1); } return r; };
const info = f => spawnSync(FF, ['-hide_banner', '-i', f], { encoding: 'utf8' }).stderr || '';
const dur = f => { const m = info(f).match(/Duration: (\d+):(\d+):([\d.]+)/); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 0; };
const meanDb = f => { const r = spawnSync(FF, ['-hide_banner', '-nostats', '-i', f, '-vn', '-t', '25', '-af', 'volumedetect', '-f', 'null', 'NUL'], { encoding: 'utf8' }); const m = (r.stderr || '').match(/mean_volume: (-?[\d.]+) dB/); return m ? +m[1] : -30; };
const photo = n => `${BASE}/india web/india 2019 @pacogomezduarte-${n}.jpg`;
const vidsList = fs.readFileSync(path.join(HERE, 'videos-info.csv'), 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l => l.split(',')[0].replace(/"/g, ''));
const mobList = fs.readFileSync(BASE + '/hojas-contacto-movil/indice-movil.csv', 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l => l.replace(/"/g, '').split(','));
const RW = { RW546: 'ghat-incineraciones-546-5s.mp4', RW598: 'ghat-lamparas-598-v2-humo-5s.mp4', RW494: 'ghat-amanecer-494-5s.mp4' };
// 'S485' foto Sony · 'M87' foto móvil · 'V41' vídeo móvil · 'RW494' clip Runway
function resolve(id) {
  if (/^SFX_/.test(id)) return HERE + '/sfx/' + id.slice(4) + '.mp3';
  if (/^RW/.test(id)) return BASE + '/runway-pruebas/' + RW[id];
  if (/^S\d+/.test(id)) return photo(id.slice(1));
  if (/^M\d+/.test(id)) return BASE + '/fotos-movil-2019/' + mobList.find(r => r[0] === id)[1];
  if (/^V\d+/.test(id)) return BASE + '/videos-2019/' + vidsList[+id.slice(1) - 1];
  throw new Error('id desconocido ' + id);
}
const isVideo = id => /^(RW|V)/.test(id);
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, '’');
const LOOKS = {
  portra: { tone: "curves=all='0/0.025 0.25/0.23 0.5/0.52 0.75/0.79 1/0.975',colorbalance=rs=0.02:gs=-0.005:bs=-0.03:rm=0.025:bm=-0.025:rh=0.045:bh=-0.045,eq=saturation=1.04:contrast=1.02", grain: 6 },
  vision3: { tone: "format=gbrp,split[ka][kb];[kb]lutrgb=r='if(gt(val,215),val,0)':g='if(gt(val,215),val*0.35,0)':b='if(gt(val,215),val*0.12,0)',gblur=sigma=16[kh];[ka][kh]blend=all_mode=screen:all_opacity=0.5,curves=all='0/0.03 0.25/0.21 0.5/0.5 0.78/0.8 1/0.97',colorbalance=rs=-0.015:gs=0.005:bs=0.03:rh=0.05:bh=-0.04,eq=saturation=1.06:contrast=1.04", grain: 9 },
  trix: { tone: "hue=s=0,curves=all='0/0.04 0.3/0.2 0.7/0.82 1/0.985'", grain: 13 },
};
// Normalización «BDM Film»: lleva cada foto hacia luma ≈105/255 y saturación ≈46 con límites (estilo-fotografico.md)
function normFilter(f) {
  const r = spawnSync(FF, ['-hide_banner', '-v', 'info', '-i', f, '-frames:v', '1', '-vf', 'signalstats,metadata=mode=print', '-f', 'null', '-'], { encoding: 'utf8' });
  const t = r.stderr || ''; const y = +(t.match(/lavfi.signalstats.YAVG=([d.]+)/) || [])[1], s = +(t.match(/lavfi.signalstats.SATAVG=([d.]+)/) || [])[1];
  if (!y || !s) return '';
  const cl = (v, a, b) => Math.max(a, Math.min(b, v)); const br = cl((105 - y) / 255, -0.10, 0.17), sa = cl(46 / s, 0.85, 1.30);
  return `,eq=brightness=${br.toFixed(3)}:saturation=${sa.toFixed(3)}`;
}
const keyEL = () => (fs.readFileSync(ROOT + '/api/salma voice.txt', 'utf8').match(/sk_[A-Za-z0-9]+/) || [])[0];

const hashVoz = (text, who) => crypto.createHash('md5').update(JSON.stringify([who.id, who.model, who.vs, who.lang || null, text])).digest('hex').slice(0, 14);
const vozEnCache = (text, who) => { const h = hashVoz(text, who); return fs.existsSync(`${HERE}/voz/${h}.mp3`) && fs.existsSync(`${HERE}/voz/${h}.json`); };
// Audio grabado por Paco (editor): se recorta el silencio de los extremos y los tiempos por carácter se reparten por la duración (aproximado)
function vozPropia(file, text, id) {
  const dir = HERE + '/voz-propia'; fs.mkdirSync(dir, { recursive: true }); const out = `${dir}/${id}.wav`;
  const sr = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05';
  const r = spawnSync(FF, ['-v', 'error', '-y', '-i', file, '-af', `${sr},areverse,${sr},areverse`, '-ar', '44100', out], { encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(out)) throw new Error('no puedo leer el audio de ' + id + ': ' + (r.stderr || '').slice(0, 200));
  const d0 = dur(out);
  const n = text.length; return { mp3: out, al: { st: Array.from({ length: n }, (_, i) => d0 * i / n), en: Array.from({ length: n }, (_, i) => d0 * (i + 1) / n) }, chars: 0 };
}
async function voice(text, who) {
  const h = hashVoz(text, who);
  const dir = HERE + '/voz'; fs.mkdirSync(dir, { recursive: true });
  const mp3 = `${dir}/${h}.mp3`, js = `${dir}/${h}.json`;
  if (fs.existsSync(mp3) && fs.existsSync(js)) return { mp3, al: JSON.parse(fs.readFileSync(js, 'utf8')), chars: 0 };
  const key = keyEL(); if (!key) throw new Error('sin clave de ElevenLabs');
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${who.id}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json' }, body: JSON.stringify({ text, model_id: who.model, voice_settings: who.vs, ...(who.lang ? { language_code: who.lang } : {}) }) });
  if (!r.ok) throw new Error('ElevenLabs ' + r.status + ' ' + (await r.text()).split(key).join('***').slice(0, 250));
  const j = await r.json(); fs.writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
  const a = j.alignment || j.normalized_alignment; const al = { st: a.character_start_times_seconds, en: a.character_end_times_seconds };
  fs.writeFileSync(js, JSON.stringify(al)); return { mp3, al, chars: text.length };
}

async function build(cfg) {
  const W = HERE + '/work_' + cfg.id; fs.rmSync(W, { recursive: true, force: true }); fs.mkdirSync(W, { recursive: true });
  const OUT = BASE + '/animatica-cap4'; fs.mkdirSync(OUT, { recursive: true });
  const LEAD = 0.25;
  // 1) voces
  console.log('ETAPA 1/6 Voces (las que ya existen se reutilizan; solo se genera lo nuevo)');
  let charsNow = 0;
  for (const b of cfg.blocks) {
    if (!b.text) continue;
    const v = b.audioPropio ? vozPropia(b.audioPropio, b.voz || b.text, b.id) : await voice(b.voz || b.text, cfg.voices[b.who]); b.v = v; charsNow += v.chars;
    b.vEnd = v.al.en[v.al.en.length - 1];
  }
  console.log('Caracteres de voz generados ahora:', charsNow);
  // 2) línea de tiempo
  console.log('ETAPA 2/6 Línea de tiempo');
  let t = 0; const G = cfg.gap || { same: 0.4, change: 0.85 }, LC = cfg.leadChange ?? 0.45;
  const vb = cfg.blocks.filter(x => x.text);
  for (const b of cfg.blocks) {
    b.t0 = t;
    if (b.text) { const i = vb.indexOf(b), prev = vb[i - 1], next = vb[i + 1]; b.lead = prev && prev.who !== b.who ? LC : LEAD; const need = next && next.who !== b.who ? G.change : G.same; b.D = b.lead + b.vEnd + Math.max(b.pause ?? 0, need); } else b.D = b.fixed;
    if (b.minD && b.D < b.minD) b.D = b.minD;
    t += b.D;
  }
  const cardT = t; const TOTAL = t + (cfg.cardSecs || 8);
  // 3) planos
  console.log('ETAPA 3/6 Cortando y revelando cada plano (looks Kodak, zooms)');
  const clips = []; let nclip = 0, kbN = 0;
  const tow = (b, from) => { const i = b.text.indexOf(from); if (i < 0) throw new Error(`no encuentro «${from}» en el bloque ${b.id}`); const wi = b.text.slice(0, i).split(' ').length - 1; const sp = (b.voz || b.text).split(' '); let p = 0; for (let q = 0; q < wi; q++) p += sp[q].length + 1; return b.v.al.st[Math.min(p, b.v.al.st.length - 1)]; };
  for (const b of cfg.blocks) {
    if (b.video) { clips.push({ file: b.video, d: b.D, raw: true }); continue; }
    const S = b.shots; const starts = S.map((s, k) => k === 0 ? 0 : Math.max(0.9, b.lead + tow(b, s.from) - 0.06));
    for (let k = 1; k < S.length; k++) if (starts[k] < starts[k - 1] + 0.9) starts[k] = starts[k - 1] + 0.9;
    if (b.golpe) { const kg = S.findIndex(x => x.from === b.golpe.en); if (kg >= 0) b._golpeT = b.t0 + starts[kg]; }
    S.forEach((s, k) => {
      const d = (k + 1 < S.length ? starts[k + 1] : b.D) - starts[k]; const n = ++nclip; const out = `${W}/c${String(n).padStart(2, '0')}.mp4`; const f = resolve(s.a);
      console.log('PLANO ' + n); const frames = Math.round(d * 30); const last = k === S.length - 1;
      const fadeV = (b.scene && k === 0 ? `,fade=t=in:st=0:d=0.3` : '') + (b.sceneEnd && last ? `,fade=t=out:st=${Math.max(0, d - 0.3).toFixed(2)}:d=0.3` : '');
      const lk = LOOKS[s.look || b.look || cfg.look || 'portra']; const norm = isVideo(s.a) ? '' : normFilter(f);
      const tail = `${norm},${lk.tone},noise=alls=${lk.grain}:allf=t+u,vignette=PI/6,format=yuv420p${fadeV}`;
      if (isVideo(s.a)) {
        const ss = s.ss || 0; const td = dur(f); const pad = td - ss < d ? `,tpad=stop_mode=clone:stop_duration=${(d - (td - ss) + 0.2).toFixed(2)}` : '';
        run(['-ss', String(ss), '-i', f, '-an', '-t', String(d + 0.1), '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30${pad}${tail}`, '-frames:v', String(frames), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', out]);
      } else {
        // Ken Burns: intensidad por escala (GP más que D) x cfg.kb; entrar/salir se alternan entre fotos seguidas; s.zfijo = valor absoluto fijado desde el editor
        const AUTO = { GP: 0.06, PM: 0.05, PP: 0.04, D: 0.025 }, KB = cfg.kb ?? 1.6; const dirAuto = (kbN++ % 2 === 0) ? 'in' : 'out';
        const z = s.zfijo ? s.z : (s.z ?? AUTO[s.sc] ?? 0.05) * KB, [fx, fy] = s.foc || [0.5, 0.5], cx = s.cx ?? 0.5, inn = (s.dir || dirAuto) === 'in';
        let zexpr = inn ? `1+${z}*on/${frames}` : `${1 + z}-${z}*on/${frames}`;
        const f0 = Math.max(1, frames - 12); // GOLPE (s.golpe): en los últimos 0,4 s el zoom se dispara hacia el foco y la cámara se sacude
        if (s.golpe) zexpr += `+${s.golpeZ ?? 0.6}*pow(max(0,on-${f0})/12,3)`;
        const shake = s.golpe ? `,scale=1160:2064,crop=1080:1920:x='40+36*sin(n*9.1)*gt(n,${f0})':y='72+36*cos(n*11.7)*gt(n,${f0})'` : '';
        const pre = s.cover ? 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,scale=2160:3840:flags=lanczos' : `crop='if(gt(iw*16,ih*9),ih*9/16,iw)':'if(gt(iw*16,ih*9),ih,iw*16/9)':'if(gt(iw*16,ih*9),(iw-ih*9/16)*${cx},0)':0,scale=2160:3840:flags=lanczos`; // más ancha que 9:16 (apaisada o vertical 3:4) → recorta a lo ancho; si no, a lo alto
        run(['-i', f, '-vf', `${pre},zoompan=z='${zexpr}':x='(iw-iw/zoom)*${fx}':y='(ih-ih/zoom)*${fy}':d=${frames}:s=1080x1920:fps=30${shake}${tail}`, '-frames:v', String(frames), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', out]);
      }
      clips.push({ file: out, d }); (cfg._shots = cfg._shots || []).push({ blk: b.id, i: k, id: s.a, sc: s.sc, d, ok: s.ok, look: s.look || b.look || cfg.look || 'portra' });
    });
  }
  reglas(cfg, TOTAL, OUT);
  // tarjeta final
  const card = `${W}/card.mp4`;
  const ct = cfg.card;
  // Cierre en dos tiempos: 1) título de la serie · 2) invitación a la app (icono de Salma) + capítulo siguiente
  const CS = cfg.cardSecs || 8, P1 = cfg.cardP1 || 3, AVC = ROOT + '/salma marketing/editor/ep1/avatar.png';
  const dtx = (txt, font, size, col, y, t0, t1, extra = '') => `drawtext=expansion=none:fontfile='${font}':text='${esc(txt)}':fontsize=${size}:fontcolor=${col}:x=(w-text_w)/2:y=${y}:alpha='if(lt(t,${t0}+0.4),(t-${t0})/0.4,if(gt(t,${t1}-0.4),(${t1}-t)/0.4,1))':enable='between(t,${t0},${t1})'${extra}`;
  const ctF = `[1:v]scale=360:-1,format=rgba,fade=t=in:st=${P1}:d=0.4:alpha=1[av];[0:v][av]overlay=(W-w)/2:170:eof_action=pass,` + [
    dtx(ct.l1, IMPACT, 96, '0xF4630B', 720, 0, P1), dtx(ct.l2, IMPACT, 76, 'white', 850, 0, P1), dtx(ct.l3, ARIALB, 44, 'white', 1050, 0, P1),
    dtx('CREA TUS RUTAS', IMPACT, 104, '0xF4630B', 640, P1, CS), dtx('CONMIGO', IMPACT, 140, '0xF4630B', 770, P1, CS),
    dtx('Descarga la app de guías de viaje', ARIALB, 54, 'white', 990, P1, CS), dtx('Gratis', ARIALB, 54, 'white', 1065, P1, CS),
    dtx('borradodelmapa.com', IMPACT, 74, 'white', 1220, P1, CS, ':box=1:boxcolor=0xF4630B:boxborderw=22'),
    dtx(ct.l4, ARIALB, 46, '0xF4630B', 1560, P1, CS), dtx(ct.l5, ARIALB, 52, 'white', 1655, P1, CS)].join(',') + ',format=yuv420p[vout]';
  run(['-f', 'lavfi', '-i', `color=c=0x0d0d0d:s=1080x1920:r=30:d=${CS}`, '-loop', '1', '-i', AVC, '-filter_complex', ctF, '-map', '[vout]', '-an', '-t', String(CS), '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', card]);
  clips.push({ file: card, d: CS });
  fs.writeFileSync(`${W}/lista.txt`, clips.map(c => `file '${c.file.replace(/\\/g, '/')}'`).join('\n'));
  run(['-f', 'concat', '-safe', '0', '-i', `${W}/lista.txt`, '-c', 'copy', `${W}/mudo.mp4`]);
  // 4) subtítulos
  console.log('ETAPA 4/6 Subtítulos y cifras'); // ASS (palabra iluminada) y cifras
  const ts = x => { x = Math.max(0, x); const h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`; };
  let ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Main,Arial,66,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,2,5,60,60,60,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
  const srt = []; const nums = [];
  for (const b of cfg.blocks) {
    if (!b.text) continue;
    const toks = []; let pos = 0; const shown = b.text.split(' '); (b.voz || b.text).split(' ').forEach((sw, wi) => { const w = shown[wi]; if (w) { const a = pos; toks.push({ w, s: b.v.al.st[Math.min(a, b.v.al.st.length - 1)], e: b.v.al.en[Math.min(a + sw.length - 1, b.v.al.en.length - 1)] }); } pos += sw.length + 1; });
    const T = x => b.t0 + b.lead + x;
    const phr = []; let cur = []; toks.forEach((k, i) => { cur.push(i); if (/[,.:;!?…]$/.test(k.w)) { phr.push(cur); cur = []; } }); if (cur.length) phr.push(cur);
    const merged = []; phr.forEach(p => { const len = p.map(i => toks[i].w).join(' ').length; if (merged.length && merged[merged.length - 1].len < 14) { merged[merged.length - 1].ks.push(...p); merged[merged.length - 1].len += len + 1; } else merged.push({ ks: [...p], len }); });
    const split = []; merged.forEach(ph => { if (ph.len > 52 && ph.ks.length > 4) { const half = Math.ceil(ph.ks.length / 2); split.push({ ks: ph.ks.slice(0, half) }, { ks: ph.ks.slice(half) }); } else split.push(ph); });
    split.forEach(ph => {
      const lines = []; let line = [], ll = 0; ph.ks.forEach(i => { const L = toks[i].w.length; if (line.length && ll + 1 + L > 26) { lines.push(line); line = []; ll = 0; } line.push(i); ll += (ll ? 1 : 0) + L; }); if (line.length) lines.push(line);
      const t0 = T(toks[ph.ks[0]].s) - 0.05, tEnd = T(toks[ph.ks[ph.ks.length - 1]].e) + 0.12;
      ph.ks.forEach((kc, idx) => {
        const a = idx === 0 ? t0 : T(toks[kc].s), e = idx === ph.ks.length - 1 ? tEnd : T(toks[ph.ks[idx + 1]].s);
        const txt = lines.map(ln => ln.map(i => i === kc ? `{\\c${ORANGE_ASS}}${toks[i].w}{\\r}` : toks[i].w).join(' ')).join('\\N');
        ass += `Dialogue: 0,${ts(a)},${ts(e)},Main,,0,0,0,,{\\an5\\pos(540,1424)}${txt}\n`;
      });
      srt.push({ a: t0, e: tEnd, t: ph.ks.map(i => toks[i].w).join(' ') });
    });
    if (b.cifra) { const k = toks.find(x => x.w.replace(/[^A-Za-z0-9áéíóúñ]/gi, '').toLowerCase() === b.cifra.word.toLowerCase()); const t0 = T(k ? k.s : 0); nums.push({ ...b.cifra, t0, t1: t0 + (b.cifra.dur || 3) }); }
  }
  fs.writeFileSync(`${W}/sub.ass`, ass);
  fs.writeFileSync(`${OUT}/${cfg.id}-subtitulos-es.srt`, srt.map((x, i) => `${i + 1}\n${ts(x.a).replace('.', ',')}0 --> ${ts(x.e).replace('.', ',')}0\n${x.t}\n`).join('\n'));
  const numF = nums.map(c => { const al = `if(lt(t,${c.t0.toFixed(2)}),0,min(1,(t-${c.t0.toFixed(2)})/0.25))*if(gt(t,${c.t1.toFixed(2)}),max(0,1-(t-${c.t1.toFixed(2)})/0.3),1)`; return `drawtext=fontfile='${IMPACT}':text='${esc(c.text)}':fontsize=${c.size || 230}:fontcolor=white:borderw=10:bordercolor=0xF4630B:x=(w-text_w)/2:y=${c.y || 640}:alpha='${al}':enable='between(t,${c.t0.toFixed(2)},${(c.t1 + 0.3).toFixed(2)})',drawtext=fontfile='${ARIALB}':text='${esc(c.sub)}':fontsize=48:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=${(c.y || 640) + 270}:alpha='${al}':enable='between(t,${c.t0.toFixed(2)},${(c.t1 + 0.3).toFixed(2)})'`; }).join(',');
  // 5) audio
  console.log('ETAPA 5/6 Mezcla de audio (voces niveladas + ambiente)'); // audio: voces + ambiente real por escena con ducking
  let fv = '', vin = []; const vparts = [];
  cfg.blocks.forEach(b => { if (b.v) { vin.push('-i', b.v.mp3); vparts.push({ idx: vparts.length, t: b.t0 + b.lead, b }); } });
  const VT = cfg.voiceDb || { paco: -21, salma: -24 };
  vparts.forEach(p => { const m = meanDb(p.b.v.mp3); p.g = (VT[p.b.who] ?? -22) - m; console.log("nivel voz", p.b.id, p.b.who, m.toFixed(1), "dB -> ganancia", p.g.toFixed(1)); });
  fv = vparts.map(p => `[${p.idx}:a]highpass=f=80,volume=${p.g.toFixed(2)}dB,adelay=${Math.round(p.t * 1000)}:all=1[p${p.idx}]`).join(';') + ';' + vparts.map(p => `[p${p.idx}]`).join('') + `amix=inputs=${vparts.length}:normalize=0:duration=longest,apad=whole_dur=${TOTAL.toFixed(2)},atrim=0:${TOTAL.toFixed(2)},acompressor=threshold=0.12:ratio=3:attack=15:release=200:makeup=2[voz]`;
  fs.writeFileSync(`${W}/fv.txt`, fv); run([...vin, '-filter_complex_script', `${W}/fv.txt`, '-map', '[voz]', '-ar', '44100', `${W}/voz.wav`]);
  const bedFiles = []; const cache = {};
  cfg.blocks.forEach(b => {
    if (!b.amb) return; const a = b.amb; const f = resolve(a.src); const key = a.src + '|' + (a.ss || 0);
    if (!cache[key]) { const o = `${W}/amb_${a.src}_${a.ss || 0}.wav`; run(['-ss', String(a.ss || 0), '-i', f, '-vn', '-t', '25', '-ac', '2', '-ar', '44100', o]); cache[key] = { f: o, mean: meanDb(o), d: dur(o) }; }
    const c = cache[key]; const gain = (a.db ?? -26) - c.mean; const L = b.D + 0.8; const off = ((b.t0 * 1.7) % (2 * c.d));
    const o2 = `${W}/bed_${bedFiles.length}.wav`;
    run(['-i', c.f, '-filter_complex', `[0:a]highpass=f=140,asplit[x][y];[y]areverse[r];[x][r]concat=n=2:v=0:a=1,aloop=loop=-1:size=2147483647,atrim=start=${off.toFixed(2)}:end=${(off + L).toFixed(2)},asetpts=PTS-STARTPTS,volume=${gain.toFixed(1)}dB,afade=t=in:d=0.5,afade=t=out:st=${(L - 0.5).toFixed(2)}:d=0.5,adelay=${Math.round(Math.max(0, b.t0 - 0.3) * 1000)}:all=1[o]`, '-map', '[o]', o2]);
    bedFiles.push(o2);
  });
  const bin = bedFiles.flatMap(f => ['-i', f]);
  const fb = bedFiles.map((_, i) => `[${i}:a]`).join('') + `amix=inputs=${bedFiles.length}:normalize=0:duration=longest,apad=whole_dur=${TOTAL.toFixed(2)},atrim=0:${TOTAL.toFixed(2)}[amb]`;
  fs.writeFileSync(`${W}/fb.txt`, fb); run([...bin, '-filter_complex_script', `${W}/fb.txt`, '-map', '[amb]', `${W}/amb.wav`]);
  run(['-i', `${W}/voz.wav`, '-i', `${W}/amb.wav`, '-filter_complex', `[0]asplit[v1][v2];[1][v2]sidechaincompress=threshold=0.03:ratio=${cfg.duckRatio || 4}:attack=20:release=500[bd];[v1][bd]amix=inputs=2:normalize=0:duration=first[m]`, '-map', '[m]', `${W}/mix.wav`]);
  const golpes = cfg.blocks.filter(b => b.golpe && b._golpeT != null); let mixIn = `${W}/mix.wav`;
  if (golpes.length) {
    const gin = [], gf = [];
    golpes.forEach((b, i) => { const g = b.golpe, o = `${W}/golpe_${i}.wav`; run(['-ss', String(g.ss), '-i', resolve(g.src), '-vn', '-t', String(g.dur), '-ac', '2', '-ar', '44100', '-af', `highpass=f=40,volume=${g.gain ?? 0}dB`, o]); gin.push('-i', o); gf.push(`[${i + 1}:a]adelay=${Math.max(0, Math.round((b._golpeT - g.pico) * 1000))}:all=1[g${i}]`); });
    run(['-i', mixIn, ...gin, '-filter_complex', gf.join(';') + ';[0:a]' + golpes.map((_, i) => `[g${i}]`).join('') + `amix=inputs=${golpes.length + 1}:normalize=0:duration=first[m2]`, '-map', '[m2]', `${W}/mix2.wav`]); mixIn = `${W}/mix2.wav`;
  }
  run(['-i', mixIn, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-ar', '44100', `${W}/final.wav`]);
  // 6) composición
  console.log('ETAPA 6/6 Montaje final y exportación'); // composición final
  const mapB = cfg.blocks.find(b => b.video); const cStart = mapB ? mapB.t0 + mapB.D : 0;
  const cnt = cfg.counter ? `drawtext=fontfile='${IMPACT}':text='${esc(cfg.counter)}':fontsize=46:fontcolor=white:box=1:boxcolor=0xF4630B@0.9:boxborderw=14:x=w-text_w-40:y=70:enable='between(t,${cStart.toFixed(2)},${cardT.toFixed(2)})'` : '';
  const rot = cfg.blocks.filter(b => b.rotulo).map(b => `drawtext=fontfile='${ARIALB}':text='${esc(b.rotulo)}':fontsize=44:fontcolor=white:box=1:boxcolor=0xF4630B@0.92:boxborderw=16:x=60:y=1180:enable='between(t,${(b.t0 + 0.4).toFixed(2)},${(b.t0 + b.D - 0.3).toFixed(2)})'`).join(',');
  const SG = cfg.seguir && cfg.seguir.activo !== false ? cfg.seguir : null; let seguirF = '';
  // aviso de seguir: franja naranja diagonal (como la portada) que entra deslizando desde la izquierda, ♥ + frase en Impact, ~5 s
  let sgIn = [], sgT = null, sgF = '';
  if (SG) {
    // Coreografía (u = segundos desde t0): 0-0.5 la franja cruza entrando por la izquierda · 0.3 aparece el corazón naranja detrás y late (varios latidos) ·
    // 4.6-5.1 la franja sale por la derecha · 5.1-5.5 el corazón revienta (crece y se desvanece)
    const t0 = Math.min(SG.seg ?? 30, Math.max(1, cardT - 7)); sgT = { a: t0.toFixed(2), b: (t0 + 5.1).toFixed(2), c: (t0 + 5.55).toFixed(2) };
    const txt = String(SG.texto || 'Si te está gustando, sígueme').toUpperCase(), tam = Math.min(70, Math.floor(900 / (txt.length * 0.5)));
    const rot5 = 'rotate=-5*PI/180:ow=rotw(-5*PI/180):oh=roth(-5*PI/180):c=none';
    sgIn = ['-loop', '1', '-i', `${W}/sg-banda.png`, '-loop', '1', '-i', `${W}/sg-corazon.png`];
    // franja naranja + tira negra debajo (como la portada), texto centrado, todo inclinado
    const band = `drawbox=x=0:y=130:w=1000:h=48:color=0x0D0D0D:t=fill,drawtext=expansion=none:fontfile='${IMPACT}':text='${esc(txt)}':fontsize=${tam}:fontcolor=black:x=(w-text_w)/2:y=(130-text_h)/2+6,drawtext=expansion=none:fontfile='${ARIALB}':text='BORRADO DEL MAPA':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=140,${rot5}`;
    const u = `(t-${sgT.a})`, Ub = 5.1;
    // tamaño del corazón: nace (0-0.3 s), late con latidos secos, y revienta al final
    // el corazón sustituye al icono de Salma (arriba a la izquierda) solo mientras sale la franja: nace con un pop y late con latidos secos
    const S = `if(lt(${u},0.25),0.3+0.7*${u}/0.25,1+0.2*pow(sin(PI*(${u}-0.25)*2.6),8))`;
    const heart = `drawtext=expansion=none:fontfile='${FONTD}/seguisym.ttf':text='♥':fontsize=560:fontcolor=0xF4630B:borderw=9:bordercolor=white:shadowcolor=black@0.5:shadowx=6:shadowy=8:x=(w-text_w)/2:y=(h-text_h)/2-30`;
    // banda y corazón se dibujan UNA vez en PNG (rápido); en el montaje solo se mueven/escalan
    run(['-f', 'lavfi', '-i', 'color=c=0xF4630B:s=1000x178,format=rgba', '-vf', band, '-frames:v', '1', `${W}/sg-banda.png`]);
    run(['-f', 'lavfi', '-i', 'color=c=black@0.0:s=700x700,format=rgba', '-vf', heart, '-frames:v', '1', `${W}/sg-corazon.png`]);
    sgF = { band: 'format=rgba[sg]', heart: `scale=w='max(2,240*${S})':h=-1:eval=frame[hc]`,
      xBand: `if(lt(${u},0.5),-w+((1080-w)/2+w)*(1-pow(1-${u}/0.5,3)),if(lt(${u},4.6),(1080-w)/2,(1080-w)/2+(1080-(1080-w)/2)*pow((${u}-4.6)/0.5,3)))` };
  }
  const vf = [cnt, rot, numF].filter(Boolean).join(','), subF = `subtitles=sub.ass:fontsdir='${FONTD}'`; // los subtítulos van ENCIMA de la franja y el corazón
  const outFile = `${OUT}/${cfg.id}.mp4`;
  // icono de Salma arriba a la izquierda, latiendo, hasta la tarjeta final (igual que la serie Asia)
  const AV = ROOT + '/salma marketing/editor/ep1/avatar.png';
  // portada por defecto (modelo Tailandia): se pone encima en los primeros 0,2 s para que sea el fotograma de portada en las redes
  const P = cfg.portada && cfg.portada.foto ? cfg.portada : null; let covIn = [];
  if (P) { const covPng = `${W}/portada.png`; await require('./portada.cjs').generar({ src: resolve(P.foto), foco: P.foco || [0.5, 0.5, 0.9], l1: P.l1, l2: P.l2, tag: P.tag, out: covPng }); covIn = ['-loop', '1', '-i', covPng]; }
  let fc = `[2:v]scale=w='170*(1+0.035*sin(2*PI*t*2.2))':h=-1:eval=frame[av];[0:v][av]overlay=x=40+(170-w)/2:y=50+(170-h)/2:enable='lt(t,${cardT.toFixed(2)})${SG ? `*not(between(t,${sgT.a},${sgT.b}))` : ''}'${vf ? ',' + vf : ''}[m0]`;
  let ult = 'm0';
  if (SG) { const ib = P ? 4 : 3;
    fc += `;[${ib}:v]${sgF.band};[${ib + 1}:v]${sgF.heart};[${ult}][hc]overlay=x='125-w/2':y='145-h/2':enable='between(t,${sgT.a},${sgT.b})'[mh];[mh][sg]overlay=x='${sgF.xBand}':y=1450:enable='between(t,${sgT.a},${sgT.b})'[m1]`; ult = 'm1'; }
  fc += `;[${ult}]${subF}[ms]`; ult = 'ms';
  fc += P ? `;[${ult}][3:v]overlay=0:0:enable='lt(t,0.2)'[v]` : `;[${ult}]null[v]`;
  run(['-i', 'mudo.mp4', '-i', 'final.wav', '-loop', '1', '-i', AV, ...covIn, ...sgIn, '-filter_complex', fc, '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-t', TOTAL.toFixed(2), '-movflags', '+faststart', outFile], { cwd: W });
  console.log('LISTO', outFile, TOTAL.toFixed(1) + ' s', clips.length, 'planos');
  fs.writeFileSync(`${OUT}/${cfg.id}-tiempos.json`, JSON.stringify(cfg.blocks.map(b => ({ id: b.id, t0: +b.t0.toFixed(2), D: +b.D.toFixed(2), shots: (b.shots || []).map(s => s.a) })), null, 1));
  return outFile;
}
module.exports = { build, voice, resolve, RW, vozEnCache };
