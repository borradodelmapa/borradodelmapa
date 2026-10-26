// Hoja de contacto rápida: node hoja-fotos.cjs salida.png S455-S475 M68-M82 ...  (usa las miniaturas del editor, en editor/cache)
const fs = require('fs'), { Resvg } = require('@resvg/resvg-js');
const [out, ...rangos] = process.argv.slice(2); const ids = [];
rangos.forEach(r => { const m = r.match(/^([A-Z]+)(\d+)(?:-[A-Z]*(\d+))?$/); for (let n = +m[2]; n <= +(m[3] || m[2]); n++) ids.push(m[1] + n); });
const W = 150, H = 230, COL = 8, rows = Math.ceil(ids.length / COL);
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${COL * (W + 6)}" height="${rows * (H + 6)}"><rect width="100%" height="100%" fill="#000"/>`;
ids.forEach((id, i) => { const f = `${__dirname}/editor/cache/${id}.jpg`; if (!fs.existsSync(f)) return; const x = (i % COL) * (W + 6), y = Math.floor(i / COL) * (H + 6);
  s += `<image href="data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}" x="${x}" y="${y}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet"/><rect x="${x}" y="${y}" width="64" height="22" fill="#000" fill-opacity="0.8"/><text x="${x + 4}" y="${y + 17}" font-family="Arial" font-weight="700" font-size="17" fill="#F4630B">${id}</text>`; });
fs.writeFileSync(out, new Resvg(s + '</svg>', { font: { loadSystemFonts: true } }).render().asPng()); console.log('ok', ids.length);
