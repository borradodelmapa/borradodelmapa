// MINI EDITOR LOCAL — escenas, fotos por plano, ambiente, montar y ver. Todo en tu PC (127.0.0.1), nada sale fuera, 0 € (no llama a ninguna API).
// Uso: node editor/server.cjs  →  http://localhost:8095     (el motor reutiliza las voces ya generadas: no gasta ElevenLabs si no cambias texto)
const http = require('http'), fs = require('fs'), path = require('path'), Module = require('module'), { spawn, spawnSync } = require('child_process');
const HERE = path.resolve(__dirname, '..'), BASE = path.resolve(HERE, '..'), FF = BASE + '/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const CACHE = __dirname + '/cache', CAP = process.argv[2] || 'cap4', OVR = __dirname + (CAP === 'cap4' ? '/overrides.json' : '/overrides-' + CAP + '.json'), PORT = { cap4: 8095, monos: 8096, cap3: 8097, 'whang-od-ep1': 8098, 'sagada-ep2': 8102 }[CAP] || 8103; // un servidor por capítulo: cap4 → 8095, monos → 8096
if (!fs.existsSync(OVR)) fs.writeFileSync(OVR, '{"shots":{},"amb":{},"text":{},"audio":{}}');
fs.mkdirSync(CACHE, { recursive: true });
const ck = id => /^[WH]\d+$/.test(id) ? CAP + '-' + id : id; // nombre en la caché: las fotos W/H de cada serie llevan su capítulo delante (W05 de Sagada ≠ W05 de Whang-Od)
const { resolve, setSerie, RW, vozEnCache } = require('../motor.cjs');
const aplicar = require('./aplicar.cjs');
const crypto = require('crypto');
const { generar: generarPortada } = require('../portada.cjs');
const leerOv = () => ({ shots: {}, amb: {}, text: {}, audio: {}, ss: {}, portada: {}, mov: {}, seguir: {}, intro: {}, ...JSON.parse(fs.readFileSync(OVR, 'utf8')) });
const isVideo = id => /^(RW|V)/.test(id);

// configuración base del capítulo (sin overrides): misma técnica que hoja.cjs
const cargarCfg = () => {
  const src = fs.readFileSync(HERE + '/' + CAP + '.cjs', 'utf8').replace(/const \{ build \} = require\('\.\/motor\.cjs'\);/, '').replace(/if \(process\.env\.APLICAR_EDITOR[\s\S]*$/, 'module.exports = cfg;');
  const m = new Module(HERE + '/cfg-virtual.cjs'); m.filename = HERE + '/cfg-virtual.cjs'; m.paths = Module._nodeModulePaths(HERE); m._compile(src, m.filename); return m.exports;
};
const AUDIOS = { 'AGUA-1': 'V32', 'AGUA-2': 'V33', 'AGUA-3': 'V34', 'AGUA-4': 'SFX_agua-remos', 'CALLE-1': 'V71', 'CALMA-1': 'V45', 'CALMA-2': 'V43', 'CALMA-3': 'SFX_noche-calma', 'GHAT-1': 'V50' };
const audioFiles = () => fs.readdirSync(BASE + '/audios-candidatos').filter(f => /\.mp3$/.test(f)).map(f => { const k = f.match(/^([A-Z]+-\d)/)[1]; return { nombre: k, src: AUDIOS[k], file: f }; });

const sonidosDisp = () => { const l = fs.readdirSync(HERE + '/sfx').filter(f => /.mp3$/.test(f)).map(f => ({ id: 'SFX_' + f.replace(/.mp3$/, ''), nombre: f.replace(/.mp3$/, '').replace(/-/g, ' '), archivo: f })); return l.concat([{ id: 'V29', nombre: 'golpe real del cristal (V29, tu vídeo)', archivo: '' }, { id: 'V35', nombre: 'golpe real (V35, tu vídeo)', archivo: '' }]); };
const galeria = () => {
  const out = { sony: [], movil: [], video: [], runway: Object.keys(RW) };
  const fs0 = cargarCfg().fotosSerie; setSerie(fs0); // series nuevas (Pueblos…): fotos W05/H01 de su carpeta
  if (fs0 && fs.existsSync(fs0)) out.serie = fs.readdirSync(fs0).map(f => (f.match(/^([WH]\d+)\.jpg$/) || [])[1]).filter(Boolean).sort((a, b) => a[0] === b[0] ? +a.slice(1) - +b.slice(1) : a < b ? -1 : 1);
  fs.readdirSync(BASE + '/india web').forEach(f => { const x = f.match(/pacogomezduarte-(\d+)\.jpg$/); if (x) out.sony.push('S' + x[1]); });
  out.sony.sort((a, b) => +a.slice(1) - +b.slice(1));
  for (let i = 1; i <= 182; i++) out.movil.push('M' + i);
  for (let i = 1; i <= 75; i++) out.video.push('V' + i);
  return out;
};

// Miniaturas SIN bloquear el servidor (antes spawnSync paraba todo mientras se creaban): cola de 4 ffmpeg a la vez, y se precalientan al arrancar
const enCurso = new Map(); let activos = 0; const espera = [];
const lanzar = () => { while (activos < 4 && espera.length) { const t = espera.shift(); activos++; t(); } };
const thumb = id => {
  const out = `${CACHE}/${ck(id)}.jpg`; if (fs.existsSync(out)) return Promise.resolve(out);
  if (enCurso.has(id)) return enCurso.get(id);
  const pr = new Promise(ok => espera.push(() => {
    const f = resolve(id), args = isVideo(id) ? ['-v', 'error', '-y', '-ss', '1', '-i', f, '-frames:v', '1', '-vf', 'scale=260:-2', '-q:v', '4', out] : ['-v', 'error', '-y', '-i', f, '-frames:v', '1', '-vf', 'scale=260:-2', '-q:v', '4', out];
    const p = spawn(FF, args); const fin = () => { activos--; enCurso.delete(id); ok(fs.existsSync(out) ? out : null); lanzar(); }; p.on('close', fin); p.on('error', fin);
  }));
  enCurso.set(id, pr); lanzar(); return pr;
};
setTimeout(() => { const g = galeria(); [...(g.serie || []), ...g.runway, ...g.sony, ...g.video, ...g.movil].forEach(id => thumb(id).catch(() => {})); }, 1500);

let job = { estado: 'libre', log: '', fin: 0, ini: 0, cambios: [], total: 0 };
const resumenCambios = () => { const o = leerOv(), base = cargarCfg(), c = [];
  base.blocks.forEach(b => { (o.shots[b.id] || []).forEach((a, k) => { if (b.shots[k] && a !== b.shots[k].a) c.push(`Escena «${b.id}», plano ${k + 1}: ${b.shots[k].a} → ${a}`); }); if (o.amb[b.id] && o.amb[b.id] !== b.amb) c.push(`Escena «${b.id}»: ambiente ${b.amb} → ${o.amb[b.id]}`); if (o.text[b.id] && o.text[b.id] !== b.text) c.push(`Escena «${b.id}»: texto cambiado (voz nueva)`); (o.ss[b.id] || []).forEach((v, k) => { if (v != null && b.shots[k] && v !== (b.shots[k].ss || 0)) c.push(`Escena «${b.id}», plano ${k + 1}: recortado, empieza en el segundo ${v}`); }); if (o.audio[b.id]) c.push(`Escena «${b.id}»: audio propio (${o.audio[b.id]})`); });
  Object.keys(o.mov || {}).forEach(id => c.push(`Escena «${id}»: movimiento de foto retocado`));
  if (o.seguir && Object.keys(o.seguir).length) c.push('Aviso de seguir retocado');
  if (o.intro && Object.keys(o.intro).length) c.push('Intro retocada (clip o sonidos)');
  if (o.portada && Object.keys(o.portada).length) c.push('Portada cambiada (foto, textos o encuadre)');
  return { c, planos: base.blocks.reduce((n, b) => n + (b.shots || []).length, 0) }; };
const montar = () => {
  if (job.estado === 'montando') return;
  const rc = resumenCambios(); job = { estado: 'montando', log: '', fin: 0, ini: Date.now(), cambios: rc.c, total: rc.planos };
  const p = spawn(process.execPath, [CAP + '.cjs'], { cwd: HERE, env: { ...process.env, APLICAR_EDITOR: '1', EDITOR_OVR: OVR } });
  const add = d => { job.log = (job.log + d).slice(-6000); };
  p.stdout.on('data', add); p.stderr.on('data', add);
  p.on('close', c => { job.estado = c === 0 ? 'listo' : 'error'; job.fin = Date.now(); if (c === 0) guardarTerminado(); });
};
// Cada montaje que acaba bien se copia con nombre claro (capítulo + fecha y hora) a VIDEOS-TERMINADOS: nunca se pisa nada
const TERM = BASE + '/VIDEOS-TERMINADOS'; fs.mkdirSync(TERM, { recursive: true });
// Al guardar un montaje nuevo, las versiones anteriores del MISMO capítulo pasan a ANTIGUOS (se mueven, no se borran)
const archivarAnteriores = id => { try { const ant = TERM + '/ANTIGUOS'; fs.mkdirSync(ant, { recursive: true }); fs.readdirSync(TERM).filter(f => f.endsWith('_' + id + '.mp4') || f.endsWith('_' + id + '-PORTADA.png')).forEach(f => { try { fs.renameSync(TERM + '/' + f, ant + '/' + f); } catch (e) { /* abierto en el reproductor: queda para la próxima */ } }); } catch (e) { /* sin permiso: no pasa nada */ } };
const guardarTerminado = () => { if (cargarCfg().ultima) return; /* series nuevas: el motor ya deja la última en su carpeta ÚLTIMA */ try { archivarAnteriores(cargarCfg().id); const d = new Date(), z = n => String(n).padStart(2, '0'); const nom = `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}_${cargarCfg().id}.mp4`; fs.copyFileSync(VIDEO(), TERM + '/' + nom); job.copia = nom; const png = VIDEO().replace(/-editor.mp4$/, '-editor-portada.png'); if (fs.existsSync(png)) fs.copyFileSync(png, TERM + '/' + nom.replace(/.mp4$/, '-PORTADA.png')); } catch (e) { job.log += '\nNo pude copiar a VIDEOS-TERMINADOS: ' + e.message; } };
const SALIDA = () => cargarCfg().out || BASE + '/animatica-cap4'; // series nuevas guardan en su carpeta (cfg.out), India en animatica-cap4
const ORIG = () => SALIDA() + '/' + cargarCfg().id + '.mp4';
const VIDEO = () => SALIDA() + '/' + cargarCfg().id + '-editor.mp4';

const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };
const file = (req, res, f, type) => {
  if (!f || !fs.existsSync(f)) return send(res, 404, 'no existe', 'text/plain');
  const st = fs.statSync(f), r = req.headers.range;
  if (r) { const [a, b] = r.replace('bytes=', '').split('-'); const s = +a, e = b ? +b : st.size - 1; res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${s}-${e}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': e - s + 1 }); fs.createReadStream(f, { start: s, end: e }).pipe(res); }
  else { res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); }
};

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'), p = u.pathname;
  try {
    if (p === '/') return file(req, res, __dirname + '/editor.html', 'text/html; charset=utf-8');
    if (p === '/api/datos') {
      const cfg = cargarCfg();
      return send(res, 200, { id: cfg.id, titulo: cfg.titulo || cfg.id, sonidosDisp: sonidosDisp(), portada: cfg.portada || null, seguir: cfg.seguir || null, bloques: cfg.blocks.map(b => ({ id: b.id, who: b.who || null, text: b.text || null, video: !!b.video, intro: b.intro || null, etiqueta: b.etiqueta || null, silencio: !!b.silencio, look: b.look || null, amb: b.amb ? b.amb.src : null, shots: (b.shots || []).map(s => ({ ss: s.ss || 0, cx: s.cx ?? 0.5, foc: s.foc || null, a: s.a, sc: s.sc || null, look: s.look || null })) })), audios: audioFiles(), galeria: galeria(), overrides: leerOv() });
    }
    if (p === '/api/guardar' && req.method === 'POST') { let b = ''; req.on('data', d => b += d); req.on('end', () => { const o = JSON.parse(b); if (!o || typeof o !== 'object') return send(res, 400, { error: 'mal' }); const ant = leerOv(); fs.writeFileSync(OVR, JSON.stringify({ shots: o.shots || {}, amb: o.amb || {}, text: o.text || {}, ss: o.ss || {}, portada: o.portada || {}, mov: o.mov || {}, seguir: o.seguir || {}, intro: o.intro || {}, audio: ant.audio }, null, 1)); send(res, 200, leerOv()); }); return; }
    if (p === '/api/reset' && req.method === 'POST') { const v = __dirname + '/versiones'; fs.mkdirSync(v, { recursive: true }); fs.copyFileSync(OVR, `${v}/${CAP}-${Date.now()}.json`); fs.writeFileSync(OVR, JSON.stringify({ shots: {}, amb: {}, text: {}, audio: {}, ss: {} }, null, 1)); return send(res, 200, leerOv()); }
    if (p.startsWith('/media/')) { const id = p.slice(7); if (!/^(V|RW)\d+$/.test(id)) return send(res, 400, 'id', 'text/plain'); return file(req, res, resolve(id), 'video/mp4'); }
    if (p === '/api/terminados') return send(res, 200, fs.readdirSync(TERM).filter(f => /\.mp4$/.test(f)).sort().reverse());
    if (p.startsWith('/terminado/')) return file(req, res, TERM + '/' + path.basename(decodeURIComponent(p.slice(11))), 'video/mp4');
    if (p === '/inicio') return file(req, res, __dirname + '/inicio.html', 'text/html; charset=utf-8');
    if (p === '/api/recorte') { // la foto recortada a 9:16 como la verá el zoom (para elegir el punto de enfoque)
      const id = u.searchParams.get('id') || '', cx = Math.min(1, Math.max(0, parseFloat(u.searchParams.get('cx')) || 0.5));
      if (!/^(S|M|W|H)[0-9]+$/.test(id)) return send(res, 400, 'id', 'text/plain');
      const out = CACHE + '/rec-' + ck(id) + '-' + cx + '.jpg'; if (fs.existsSync(out)) return file(req, res, out, 'image/jpeg');
      const crop = "crop='if(gt(iw*16,ih*9),ih*9/16,iw)':'if(gt(iw*16,ih*9),ih,iw*16/9)':'if(gt(iw*16,ih*9),(iw-ih*9/16)*" + cx + ",0)':0,scale=360:-2";
      return new Promise(ok => { const pr = spawn(FF, ['-v', 'error', '-y', '-i', resolve(id), '-vf', crop, '-frames:v', '1', '-q:v', '3', out]); pr.on('close', ok); pr.on('error', ok); }).then(() => file(req, res, out, 'image/jpeg'));
    }
    if (p === '/api/portada') { // vista previa de la portada (ffmpeg local, 0 €)
      const q = u.searchParams, foto = q.get('foto') || '', n = (k, d, lo = 0) => { const v = parseFloat(q.get(k)); return isFinite(v) ? Math.min(1, Math.max(lo, v)) : d; };
      if (!/^(S|M|W|H)[0-9]+$/.test(foto)) return send(res, 400, 'foto', 'text/plain');
      const o = { src: resolve(foto), foco: [n('x', 0.5), n('y', 0.5), n('h', 0.9, 0.5)], l1: (q.get('l1') || ' ').slice(0, 40), l2: (q.get('l2') || ' ').slice(0, 60), tag: (q.get('tag') || ' ').slice(0, 60), ancho: 540 };
      o.out = CACHE + '/portada-' + crypto.createHash('md5').update(JSON.stringify([ck(foto), o.foco, o.l1, o.l2, o.tag])).digest('hex').slice(0, 12) + '.png';
      return (fs.existsSync(o.out) ? Promise.resolve(o.out) : generarPortada(o)).then(f => file(req, res, f, 'image/png')).catch(e => send(res, 500, { error: String(e.message || e) }));
    }
    if (p.startsWith('/sfx/')) { const f = path.basename(decodeURIComponent(p.slice(5))); return file(req, res, HERE + '/sfx/' + f, 'audio/mpeg'); }
    if (p.startsWith('/bvideo/')) { const b = cargarCfg().blocks.find(x => x.id === p.slice(8) && x.video); return file(req, res, b && b.video, 'video/mp4'); }
    if (p === '/api/estimar') { // qué voces habría que generar ahora (las que ya existen en la caché no cuestan nada)
      const cfg = aplicar(cargarCfg(), leerOv()); let chars = 0; const bloques = [];
      cfg.blocks.forEach(b => { if (b.text && !b.audioPropio && !vozEnCache(b.voz || b.text, cfg.voices[b.who])) { chars += (b.voz || b.text).length; bloques.push(b.id); } });
      return send(res, 200, { chars, bloques });
    }
    if (p === '/api/subir' && req.method === 'POST') {
      const id = u.searchParams.get('id') || '', ext = (u.searchParams.get('ext') || '').toLowerCase();
      if (!/^[a-z0-9-]+$/.test(id) || !/^(mp3|wav|m4a|aac|ogg|flac|webm|mp4)$/.test(ext)) return send(res, 400, { error: 'id o formato no válido' });
      const trozos = []; let n = 0; req.on('data', d => { n += d.length; if (n > 60e6) req.destroy(); else trozos.push(d); });
      req.on('end', () => { const nombre = id + '.' + ext; fs.writeFileSync(__dirname + '/uploads/' + nombre, Buffer.concat(trozos)); const o = leerOv(); o.audio[id] = nombre; fs.writeFileSync(OVR, JSON.stringify(o, null, 1)); send(res, 200, o); });
      return;
    }
    if (p === '/api/quitar-audio' && req.method === 'POST') { const id = u.searchParams.get('id') || ''; const o = leerOv(); delete o.audio[id]; fs.writeFileSync(OVR, JSON.stringify(o, null, 1)); return send(res, 200, o); }
    if (p.startsWith('/audio-propio/')) { const f = path.basename(decodeURIComponent(p.slice(14))); return file(req, res, __dirname + '/uploads/' + f, 'audio/mpeg'); }
    if (p === '/api/montar' && req.method === 'POST') { montar(); return send(res, 200, { ok: true }); }
    if (p === '/api/estado') { const L = job.log, et = [...L.matchAll(/ETAPA (\d)\/6 ([^\n]*)/g)].pop(), pl = [...L.matchAll(/PLANO (\d+)/g)].pop(); return send(res, 200, { estado: job.estado, log: L.split('\n').filter(x => !/^(PLANO|ETAPA)/.test(x)).join('\n'), fin: job.fin, seg: job.ini ? Math.round(((job.estado === 'montando' ? Date.now() : job.fin) - job.ini) / 1000) : 0, etapa: et ? +et[1] : 0, etapaTxt: et ? et[2] : '', plano: pl ? +pl[1] : 0, total: job.total, cambios: job.cambios, tieneVideo: fs.existsSync(VIDEO()), tieneOriginal: fs.existsSync(ORIG()), copia: job.copia || '' }); }
    if (p.startsWith('/thumb/')) { const id = p.slice(7); if (!/^(S|M|V|RW|W|H)\d+$/.test(id)) return send(res, 400, 'id', 'text/plain'); return thumb(id).then(f => file(req, res, f, 'image/jpeg')); }
    if (p.startsWith('/audio/')) { const f = decodeURIComponent(p.slice(7)); if (!audioFiles().some(a => a.file === f)) return send(res, 404, 'no', 'text/plain'); return file(req, res, BASE + '/audios-candidatos/' + f, 'audio/mpeg'); }
    if (p === '/video-original') return file(req, res, ORIG(), 'video/mp4');
    if (p === '/video') return file(req, res, VIDEO(), 'video/mp4');
    send(res, 404, 'no existe', 'text/plain');
  } catch (e) { send(res, 500, { error: String(e.message || e) }); }
}).listen(PORT, '127.0.0.1', () => console.log('Editor en http://localhost:' + PORT));
