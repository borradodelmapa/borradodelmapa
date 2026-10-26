// MINI EDITOR LOCAL — escenas, fotos por plano, ambiente, montar y ver. Todo en tu PC (127.0.0.1), nada sale fuera, 0 € (no llama a ninguna API).
// Uso: node editor/server.cjs  →  http://localhost:8095     (el motor reutiliza las voces ya generadas: no gasta ElevenLabs si no cambias texto)
const http = require('http'), fs = require('fs'), path = require('path'), Module = require('module'), { spawn, spawnSync } = require('child_process');
const HERE = path.resolve(__dirname, '..'), BASE = path.resolve(HERE, '..'), FF = BASE + '/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const CACHE = __dirname + '/cache', OVR = __dirname + '/overrides.json', PORT = 8095;
fs.mkdirSync(CACHE, { recursive: true });
const { resolve, RW, vozEnCache } = require('../motor.cjs');
const aplicar = require('./aplicar.cjs');
const leerOv = () => ({ shots: {}, amb: {}, text: {}, audio: {}, ...JSON.parse(fs.readFileSync(OVR, 'utf8')) });
const isVideo = id => /^(RW|V)/.test(id);

// configuración base del capítulo (sin overrides): misma técnica que hoja.cjs
const cargarCfg = () => {
  const src = fs.readFileSync(HERE + '/cap4.cjs', 'utf8').replace(/const \{ build \} = require\('\.\/motor\.cjs'\);/, '').replace(/if \(process\.env\.APLICAR_EDITOR[\s\S]*$/, 'module.exports = cfg;');
  const m = new Module(HERE + '/cfg-virtual.cjs'); m.filename = HERE + '/cfg-virtual.cjs'; m.paths = Module._nodeModulePaths(HERE); m._compile(src, m.filename); return m.exports;
};
const AUDIOS = { 'AGUA-1': 'V32', 'AGUA-2': 'V33', 'AGUA-3': 'V34', 'AGUA-4': 'SFX_agua-remos', 'CALLE-1': 'V71', 'CALMA-1': 'V45', 'CALMA-2': 'V43', 'CALMA-3': 'SFX_noche-calma', 'GHAT-1': 'V50' };
const audioFiles = () => fs.readdirSync(BASE + '/audios-candidatos').filter(f => /\.mp3$/.test(f)).map(f => { const k = f.match(/^([A-Z]+-\d)/)[1]; return { nombre: k, src: AUDIOS[k], file: f }; });

const galeria = () => {
  const out = { sony: [], movil: [], video: [], runway: Object.keys(RW) };
  fs.readdirSync(BASE + '/india web').forEach(f => { const x = f.match(/pacogomezduarte-(\d+)\.jpg$/); if (x && +x[1] >= 470 && +x[1] <= 610) out.sony.push('S' + x[1]); });
  out.sony.sort((a, b) => +a.slice(1) - +b.slice(1));
  for (let i = 1; i <= 182; i++) out.movil.push('M' + i);
  for (let i = 1; i <= 75; i++) out.video.push('V' + i);
  return out;
};

const thumb = id => {
  const out = `${CACHE}/${id}.jpg`; if (fs.existsSync(out)) return out;
  const f = resolve(id);
  const args = isVideo(id) ? ['-v', 'error', '-y', '-ss', '1', '-i', f, '-frames:v', '1', '-vf', 'scale=260:-2', '-q:v', '4', out] : ['-v', 'error', '-y', '-i', f, '-frames:v', '1', '-vf', 'scale=260:-2', '-q:v', '4', out];
  spawnSync(FF, args); return fs.existsSync(out) ? out : null;
};

let job = { estado: 'libre', log: '', fin: 0, ini: 0, cambios: [], total: 0 };
const resumenCambios = () => { const o = leerOv(), base = cargarCfg(), c = [];
  base.blocks.forEach(b => { (o.shots[b.id] || []).forEach((a, k) => { if (b.shots[k] && a !== b.shots[k].a) c.push(`Escena «${b.id}», plano ${k + 1}: ${b.shots[k].a} → ${a}`); }); if (o.amb[b.id] && o.amb[b.id] !== b.amb) c.push(`Escena «${b.id}»: ambiente ${b.amb} → ${o.amb[b.id]}`); if (o.text[b.id] && o.text[b.id] !== b.text) c.push(`Escena «${b.id}»: texto cambiado (voz nueva)`); if (o.audio[b.id]) c.push(`Escena «${b.id}»: audio propio (${o.audio[b.id]})`); });
  return { c, planos: base.blocks.reduce((n, b) => n + (b.shots || []).length, 0) }; };
const montar = () => {
  if (job.estado === 'montando') return;
  const rc = resumenCambios(); job = { estado: 'montando', log: '', fin: 0, ini: Date.now(), cambios: rc.c, total: rc.planos };
  const p = spawn(process.execPath, ['cap4.cjs'], { cwd: HERE, env: { ...process.env, APLICAR_EDITOR: '1' } });
  const add = d => { job.log = (job.log + d).slice(-6000); };
  p.stdout.on('data', add); p.stderr.on('data', add);
  p.on('close', c => { job.estado = c === 0 ? 'listo' : 'error'; job.fin = Date.now(); });
};
const ORIG = () => BASE + '/animatica-cap4/india-cap4-benares-v8.mp4';
const VIDEO = () => BASE + '/animatica-cap4/india-cap4-benares-v8-editor.mp4';

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
      return send(res, 200, { id: cfg.id, bloques: cfg.blocks.map(b => ({ id: b.id, who: b.who || null, text: b.text || null, video: !!b.video, silencio: !!b.silencio, look: b.look || null, amb: b.amb ? b.amb.src : null, shots: (b.shots || []).map(s => ({ a: s.a, sc: s.sc || null, look: s.look || null })) })), audios: audioFiles(), galeria: galeria(), overrides: leerOv() });
    }
    if (p === '/api/guardar' && req.method === 'POST') { let b = ''; req.on('data', d => b += d); req.on('end', () => { const o = JSON.parse(b); if (!o || typeof o !== 'object') return send(res, 400, { error: 'mal' }); const ant = leerOv(); fs.writeFileSync(OVR, JSON.stringify({ shots: o.shots || {}, amb: o.amb || {}, text: o.text || {}, audio: ant.audio }, null, 1)); send(res, 200, leerOv()); }); return; }
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
    if (p === '/api/estado') { const L = job.log, et = [...L.matchAll(/ETAPA (\d)\/6 ([^\n]*)/g)].pop(), pl = [...L.matchAll(/PLANO (\d+)/g)].pop(); return send(res, 200, { estado: job.estado, log: L.split('\n').filter(x => !/^(PLANO|ETAPA)/.test(x)).join('\n'), fin: job.fin, seg: job.ini ? Math.round(((job.estado === 'montando' ? Date.now() : job.fin) - job.ini) / 1000) : 0, etapa: et ? +et[1] : 0, etapaTxt: et ? et[2] : '', plano: pl ? +pl[1] : 0, total: job.total, cambios: job.cambios, tieneVideo: fs.existsSync(VIDEO()), tieneOriginal: fs.existsSync(ORIG()) }); }
    if (p.startsWith('/thumb/')) { const id = p.slice(7); if (!/^(S|M|V|RW)\d+$/.test(id)) return send(res, 400, 'id', 'text/plain'); return file(req, res, thumb(id), 'image/jpeg'); }
    if (p.startsWith('/audio/')) { const f = decodeURIComponent(p.slice(7)); if (!audioFiles().some(a => a.file === f)) return send(res, 404, 'no', 'text/plain'); return file(req, res, BASE + '/audios-candidatos/' + f, 'audio/mpeg'); }
    if (p === '/video-original') return file(req, res, ORIG(), 'video/mp4');
    if (p === '/video') return file(req, res, VIDEO(), 'video/mp4');
    send(res, 404, 'no existe', 'text/plain');
  } catch (e) { send(res, 500, { error: String(e.message || e) }); }
}).listen(PORT, '127.0.0.1', () => console.log('Editor en http://localhost:' + PORT));
