// Hoja de planos: por bloque de voz, miniaturas numeradas de cada plano + la frase. Para ver en el móvil y corregir por número.
const fs = require('fs'), path = require('path'), Module = require('module'), { spawnSync } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const HERE = __dirname, BASE = path.resolve(HERE, '..'), FF = BASE + '/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const ver = process.argv[2] || 'v6';
const src = fs.readFileSync(HERE + '/cap4.cjs', 'utf8').replace(/const \{ build \} = require\('\.\/motor\.cjs'\);/, '').replace(/build\(cfg\)[\s\S]*$/, 'module.exports = cfg;');
const m = new Module('cfg'); m._compile(src, HERE + '/cfg-virtual.cjs'); const cfg = m.exports;
const W = HERE + '/work_' + cfg.id; const tmp = HERE + '/hoja-tmp'; fs.mkdirSync(tmp, { recursive: true });
const dur = f => { const r = spawnSync(FF, ['-hide_banner', '-i', f], { encoding: 'utf8' }); const x = (r.stderr || '').match(/Duration: (\d+):(\d+):([\d.]+)/); return x ? +x[1] * 3600 + +x[2] * 60 + +x[3] : 0; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wrap = (t, n) => { const out = []; let l = ''; t.split(' ').forEach(w => { if ((l + ' ' + w).trim().length > n) { out.push(l); l = w; } else l = (l + ' ' + w).trim(); }); if (l) out.push(l); return out; };
let n = 0; const rows = [];
cfg.blocks.forEach(b => {
  const shots = (b.shots || []).map(s => { n++; const f = `${W}/c${String(n).padStart(2, '0')}.mp4`; const d = dur(f); const jp = `${tmp}/t${n}.jpg`; spawnSync(FF, ['-v', 'error', '-y', '-ss', String(Math.max(0.2, d * 0.4)), '-i', f, '-frames:v', '1', '-vf', 'scale=150:267', '-q:v', '3', jp]); return { n, id: s.a, d, uri: 'data:image/jpeg;base64,' + fs.readFileSync(jp).toString('base64') }; });
  rows.push({ b, shots });
});
const PER = 5, RH = 330; let sheet = 0;
for (let i = 0; i < rows.length; i += PER) {
  const part = rows.slice(i, i + PER); const H = 70 + part.length * RH; let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${H}"><rect width="1080" height="${H}" fill="#0D0D0D"/><text x="20" y="46" font-family="Arial" font-weight="700" font-size="30" fill="#F4630B">HOJA DE PLANOS · ${esc(ver)} · ${i + 1}-${i + part.length} de ${rows.length} bloques</text>`;
  part.forEach((r, k) => {
    const y = 70 + k * RH, who = r.b.who, col = who === 'salma' ? '#4FB3C8' : who === 'paco' ? '#F4630B' : '#888';
    s += `<rect x="10" y="${y}" width="1060" height="${RH - 12}" fill="#161616" stroke="${col}" stroke-opacity="0.5"/>`;
    s += `<text x="24" y="${y + 30}" font-family="Arial" font-weight="700" font-size="26" fill="${col}">${esc((who || 'MAPA').toUpperCase())} · ${esc(r.b.id)}</text>`;
    r.shots.forEach((t, j) => { const x = 20 + j * 162, yy = y + 42; s += `<image href="${t.uri}" x="${x}" y="${yy}" width="150" height="267"/><rect x="${x}" y="${yy}" width="100" height="30" fill="#000" fill-opacity="0.75"/><text x="${x + 5}" y="${yy + 22}" font-family="Arial" font-weight="700" font-size="22" fill="#F4630B">${t.n}·${esc(t.id)}</text><text x="${x + 5}" y="${yy + 258}" font-family="Arial" font-weight="700" font-size="20" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${t.d.toFixed(1)} s</text>`; });
    const tx = r.shots.length ? 20 + Math.max(r.shots.length, 1) * 162 + 8 : 24;
    const col2 = Math.max(18, Math.floor((1060 - tx) / 13));
    if (r.b.text) wrap(r.b.text, col2).slice(0, 12).forEach((ln, q) => { s += `<text x="${tx}" y="${y + 70 + q * 26}" font-family="Arial" font-size="22" fill="#e8e8e8">${esc(ln)}</text>`; });
    else s += `<text x="${tx}" y="${y + 80}" font-family="Arial" font-size="24" fill="#bbb">(sin voz) mapa y rótulo</text>`;
  });
  s += '</svg>'; sheet++;
  fs.writeFileSync(`${BASE}/hoja-planos/hoja-planos-${ver}-${sheet}.png`, new Resvg(s, { font: { loadSystemFonts: true } }).render().asPng());
}
console.log('hojas:', sheet);
