// Gráficos HORIZONTALES (1920x1080) para «Tatuajes del mundo» · escena 3.1 (código vory v zakone), 3 nov 2026. 0 €, local (resvg + ffmpeg).
// No hay fotos libres de estos tatuajes: se dibujan como ESQUEMA (línea naranja sobre negro, como el gráfico de Ötzi), sin copiar ningún dibujo existente.
// Uso: node grafico-vory.cjs cupulas|ojo|gato [salida.mp4]   |   node grafico-vory.cjs <tipo> png <salida.png> <t>
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { Resvg } = require('@resvg/resvg-js');
const FF = path.join(__dirname, '../herramientas/node_modules/ffmpeg-static/ffmpeg.exe');
const W = 1920, H = 1080, FPS = 30, T = 9; // más largo que cualquier frase: el montaje lo corta donde toca
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const O = '#F4630B';
// cúpula ortodoxa en forma de cebolla con su cruz; cx = centro, base = y de la base, s = escala
const cupula = (cx, base, s) => `<g transform="translate(${cx} ${base}) scale(${s})" fill="none" stroke="${O}" stroke-width="${6 / s}" stroke-linejoin="round" stroke-linecap="round">
  <path d="M-60 0 L-60 -40 L60 -40 L60 0 Z"/><path d="M-62 -40 C-95 -85 -40 -120 0 -175 C40 -120 95 -85 62 -40 Z"/>
  <path d="M0 -175 L0 -240 M-22 -218 L22 -218 M-14 -200 L14 -192"/></g>`;
const DIB = {
  cupulas: t => [cupula(760, 720, 1.0), cupula(960, 700, 1.25), cupula(1160, 720, 1.0)].map((c, i) => `<g opacity="${clamp((t - 0.3 - i * 0.6) / 0.4)}">${c}</g>`).join(''),
  ojo: t => { const a = clamp((t - 0.3) / 0.6), p = 1 + 0.04 * Math.sin(t * 3);
    return `<g opacity="${a}" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"><path d="M700 500 Q960 300 1220 500 Q960 700 700 500 Z"/><circle cx="960" cy="500" r="${(95 * p).toFixed(1)}"/></g><circle cx="960" cy="500" r="40" fill="${O}" opacity="${a}"/>`; },
  gato: t => { const a = clamp((t - 0.3) / 0.6);
    return `<g opacity="${a}" fill="none" stroke="${O}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
      <path d="M830 420 L850 300 L910 370 Q960 355 1010 370 L1070 300 L1090 420 Q1110 520 1040 580 Q960 630 880 580 Q810 520 830 420 Z"/>
      <path d="M905 470 Q920 455 935 470 M985 470 Q1000 455 1015 470 M960 505 L948 520 L972 520 Z M900 530 L820 515 M900 545 L825 555 M1020 530 L1100 515 M1020 545 L1095 555"/>
      <path d="M820 300 L1100 300 M870 300 L880 220 L1040 220 L1050 300" opacity="${clamp((t - 1.2) / 0.5)}"/></g>`; }, // con sombrero: aparece después
};
const TXT = { cupulas: ['CÚPULAS', 'CADA UNA, UNA CONDENA'], ojo: ['UN OJO', '«TE VIGILO»'], gato: ['UN GATO', 'EL LADRÓN PROFESIONAL'] };
function svg(tipo, t) {
  const fade = clamp(t / 0.3) * clamp((T - t) / 0.3), ta = clamp((t - 0.8) / 0.4), [a, b] = TXT[tipo];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#0D0D0D"/>
  <g opacity="${fade.toFixed(3)}"><text x="260" y="150" font-family="Arial" font-weight="700" font-size="40" fill="#ffffff" letter-spacing="4">CÓDIGO DE LAS CÁRCELES RUSAS</text><rect x="260" y="172" width="200" height="5" fill="${O}"/>
  ${DIB[tipo](t)}
  <g opacity="${ta}"><text x="960" y="830" font-family="Impact" font-size="96" fill="#ffffff" text-anchor="middle" letter-spacing="3">${a}</text></g></g></svg>`;
}
// la frase de debajo la dice la voz y sale en los subtítulos: el gráfico solo nombra el símbolo (b queda para el inglés si hiciera falta)
const render = (tipo, t) => new Resvg(svg(tipo, t), { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: W } }).render().asPng();
async function make(tipo, out) {
  const sp = spawn(FF, ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out]);
  const done = new Promise(r => sp.on('close', r)); sp.stdin.on('error', () => {});
  for (let f = 0; f < T * FPS; f++) { if (!sp.stdin.write(render(tipo, f / FPS))) await new Promise(r => sp.stdin.once('drain', r)); }
  sp.stdin.end(); await done;
}
if (require.main === module) {
  const [tipo, modo, out, t] = process.argv.slice(2);
  if (!DIB[tipo]) { console.error('tipo: cupulas, ojo o gato'); process.exit(1); }
  if (modo === 'png') { fs.writeFileSync(out, render(tipo, parseFloat(t || '3'))); console.log('png', out); }
  else { const o = modo || path.join(__dirname, `../../tatuajes/grafico-vory-${tipo}.mp4`); make(tipo, o).then(() => console.log('mp4 listo', o)); }
}
