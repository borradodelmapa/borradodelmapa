// Gráfico animado HORIZONTAL (1920x1080) para «Tatuajes del mundo» · escena 1.1 (3 nov 2026). 0 €, local (resvg + ffmpeg).
// Los tatuajes de Ötzi son marcas de líneas cortas: aquí son 61 rayas naranjas que aparecen en grupos mientras sube el contador.
// Es un esquema, no la posición real de cada tatuaje (no hay foto libre de su piel y es una momia: F9).
// Uso: node grafico-otzi.cjs 61|costillas [salida.mp4]   |   node grafico-otzi.cjs <tipo> png <salida.png> <t>
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1920, H = 1080, FPS = 30, T = { 61: 6, costillas: 5 };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
// 61 rayas en 19 grupos de 2 a 5 (suma 61), repartidos en una rejilla irregular fija
const TAM = [4, 3, 4, 2, 4, 3, 3, 4, 3, 2, 4, 3, 3, 4, 3, 3, 4, 2, 3];
let s = 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
const GRUPOS = TAM.map((n, i) => ({ n, x: 200 + (i % 7) * 175 + rnd() * 50, y: 250 + Math.floor(i / 7) * 190 + rnd() * 50, ang: -20 + rnd() * 40 }));
const COSTILLA = 9; // el grupo que se ilumina en «costillas»
function svg(tipo, t) {
  const TT = T[tipo], fade = clamp(t / 0.3) * clamp((TT - t) / 0.3);
  let n = 0, rayas = '';
  const vis = tipo === '61' ? Math.round(61 * clamp((t - 0.3) / 3.6)) : 61; // en «61» aparecen una a una en 3,6 s
  GRUPOS.forEach((g, gi) => {
    const luz = tipo === 'costillas' && gi === COSTILLA, op = tipo === 'costillas' && !luz ? 0.25 : 1;
    for (let k = 0; k < g.n; k++) {
      n++; if (n > vis) continue;
      const x = g.x + k * 16;
      rayas += `<line x1="${x}" y1="${g.y - 38}" x2="${x}" y2="${g.y + 38}" stroke="${luz ? '#FFFFFF' : '#F4630B'}" stroke-width="${luz ? 9 : 7}" stroke-linecap="round" opacity="${op}" transform="rotate(${g.ang.toFixed(1)} ${g.x} ${g.y})"/>`;
    }
    if (luz) { const p = 1 + 0.25 * Math.sin(t * 6), a = clamp((t - 0.4) / 0.4);
      rayas += `<circle cx="${g.x + 24}" cy="${g.y}" r="${(78 * p).toFixed(1)}" fill="none" stroke="#F4630B" stroke-width="4" opacity="${a}"/>`; }
  });
  const num = tipo === '61' ? vis : 61;
  const der = tipo === '61'
    ? `<text x="1650" y="560" font-family="Impact" font-size="260" fill="#ffffff" text-anchor="middle">${num}</text><text x="1650" y="640" font-family="Arial" font-weight="700" font-size="46" fill="#F4630B" text-anchor="middle" letter-spacing="4">TATUAJES</text>`
    : `<text x="1650" y="520" font-family="Impact" font-size="96" fill="#ffffff" text-anchor="middle" opacity="${clamp((t - 0.6) / 0.4)}">UNO</text><text x="1650" y="600" font-family="Arial" font-weight="700" font-size="44" fill="#F4630B" text-anchor="middle" letter-spacing="3" opacity="${clamp((t - 0.6) / 0.4)}">EN LAS COSTILLAS</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0D0D0D"/>
  <g opacity="${fade.toFixed(3)}"><text x="260" y="150" font-family="Arial" font-weight="700" font-size="40" fill="#ffffff" letter-spacing="4">ÖTZI · LOS TATUAJES MÁS ANTIGUOS QUE SE CONOCEN</text><rect x="260" y="172" width="200" height="5" fill="#F4630B"/>${rayas}${der}</g></svg>`;
}
const render = (tipo, t) => new Resvg(svg(tipo, t), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
async function make(tipo, out) {
  const sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  for (let f = 0; f < Math.round(T[tipo] * FPS); f++) { if (!sp.stdin.write(render(tipo, f / FPS))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done;
}
if (require.main === module) {
  const [tipo, modo, out, t] = process.argv.slice(2);
  if (!T[tipo]) { console.error('tipo: 61 o costillas'); process.exit(1); }
  if (modo === 'png') { fs.writeFileSync(out, render(tipo, parseFloat(t || '4'))); console.log('png', out); }
  else { const o = modo || path.join(__dirname, `../../tatuajes/grafico-otzi-${tipo}.mp4`); make(tipo, o).then(() => console.log('mp4 listo', o)); }
}
