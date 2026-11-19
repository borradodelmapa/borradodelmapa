// LARGO 16:9 «Indígenas de El Salvador: del exterminio a cantar el himno» (T25, 19 nov 2026, 🎬 Vídeo 2). Guion aprobado por Paco: docs/el-salvador-guion-direccion.md v2.1.
// Método de tuvalu-preguntas.cjs: el TEXTO sale tal cual del guion (líneas **S…:**, en orden). Si Paco cambia el guion, se cambia allí y aquí solo las imágenes.
// Narra solo Salma (SALMA_DOC), sin «viaje real» (F2, M14). Excepción a F10 y a P4 (canto de la Asamblea y niños en la carátula), dadas por Paco el 19 nov.
// Uso: SOLO_TEXTO=1 node el-salvador.cjs (caracteres, 0 €) · SOLO_VOZ=1 node el-salvador.cjs (genera y guarda la voz; Paco: «sí, genera voz», 19 nov)
const fs = require('fs');
const { voice, vozEnCache } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const ROOT = 'C:/Users/User/Desktop/salma', ES = ROOT + '/salma marketing/el-salvador';
const textos = fs.readFileSync(ROOT + '/docs/el-salvador-guion-direccion.md', 'utf8').split(/\r?\n/)
  .filter(l => /^\*\*S[^*]*\*\* /.test(l)).map(l => l.replace(/^\*\*S[^*]*\*\* /, '').replace(/\*/g, '').trim());
if (textos.length !== 49) throw new Error('el guion tiene ' + textos.length + ' frases de Salma; esta configuración espera 49');
// Pronunciación (N8): mismo número de palabras que el texto; el subtítulo sigue bien escrito
const PR = [['Gould', 'Gúld'], ['Lauria-Santiago', 'Láuria-Santiago'], ['nantzin', 'nántsin'], ['yek peyna', 'yek péina'], ['Juayúa', 'Juayúa']];
const voz = t => PR.reduce((s, [a, b]) => s.split(a).join(b), t);
module.exports = { textos, voz };
if (require.main === module) {
  const nuevas = textos.filter(t => !vozEnCache(voz(t), SALMA_DOC));
  console.log(`VOZ: ${textos.length} frases, ${textos.reduce((a, t) => a + voz(t).length, 0)} caracteres · por generar ${nuevas.length} frases, ${nuevas.reduce((a, t) => a + voz(t).length, 0)} caracteres`);
  if (process.env.SOLO_TEXTO) process.exit(0);
  if (process.env.SOLO_VOZ) {
    (async () => { let gastados = 0; for (const t of textos) { const v = await voice(voz(t), SALMA_DOC); gastados += v.chars; process.stdout.write('.'); } console.log(`\nvoz hecha · caracteres gastados ahora: ${gastados}`); })()
      .catch(e => { console.error('FALLO:', e.message); process.exit(1); });
  } else { console.error('El montaje se añade cuando estén las fotos. Por ahora: SOLO_TEXTO=1 o SOLO_VOZ=1'); process.exit(1); }
}
