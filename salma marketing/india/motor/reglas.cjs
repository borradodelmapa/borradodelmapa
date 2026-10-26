// Informe de reglas de montaje (estilo-visual.md + Biblia): se ejecuta antes de dar por buena una versión.
const fs = require('fs');
module.exports = function reglas(cfg, TOTAL, OUT) {
  const L = [], W = t => L.push(t);
  const MIN = { GP: 2.0, PM: 1.2, PP: 1.0, D: 0.6 }, MAX = { GP: 8, PM: 5, PP: 5, D: 2.5 };
  const sh = cfg._shots || [], byBlk = {};
  sh.forEach((s, ix) => {
    (byBlk[s.blk] = byBlk[s.blk] || []).push(s);
    if (!s.sc) { W('⚠ plano ' + (ix + 1) + ' (' + s.id + '): sin escala GP/PM/PP/D'); return; }
    if (!s.ok && s.d < MIN[s.sc]) W('⚠ plano ' + (ix + 1) + ' (' + s.id + ', ' + s.sc + '): dura ' + s.d.toFixed(1) + ' s, mínimo recomendado ' + MIN[s.sc] + ' s');
    if (!s.ok && s.d > MAX[s.sc]) W('⚠ plano ' + (ix + 1) + ' (' + s.id + ', ' + s.sc + '): dura ' + s.d.toFixed(1) + ' s, máximo recomendado ' + MAX[s.sc] + ' s');
  });
  for (const blk of Object.keys(byBlk)) {
    let run = 0; const arr = byBlk[blk];
    arr.forEach((s, i) => {
      if (i > 0 && s.sc && arr[i - 1].sc === s.sc && !s.ok) W('⚠ bloque ' + blk + ': ' + arr[i - 1].id + ' y ' + s.id + ' repiten escala ' + s.sc + ' seguidas');
      run = s.sc === 'D' ? run + 1 : 0; if (run > 2) W('⚠ bloque ' + blk + ': más de 2 detalles seguidos');
    });
  }
  const cnt = {}; sh.forEach(s => { cnt[s.id] = (cnt[s.id] || 0) + 1; });
  Object.keys(cnt).filter(k => cnt[k] > 1).forEach(k => W('⚠ imagen repetida: ' + k + ' (' + cnt[k] + ' veces)'));
  cfg.blocks.filter(b => b.silencio && b.amb).forEach(b => W('⚠ bloque ' + b.id + ' debe ir en silencio y lleva ambiente'));
  const info = []; if (TOTAL > 100) info.push('ℹ duración ' + TOTAL.toFixed(0) + ' s: preferible 60-90 s, pero si la historia lo pide, sin problema (regla de Paco, 26 oct 2026)');
  const looks = {}; sh.forEach(s => { looks[s.look] = (looks[s.look] || 0) + 1; });
  const sc = ['GP', 'PM', 'PP', 'D'].map(k => k + ' ' + sh.filter(s => s.sc === k).length).join(' · ');
  const head = ['INFORME DE REGLAS · ' + cfg.id + ' · ' + TOTAL.toFixed(0) + ' s · ' + sh.length + ' planos · escalas: ' + sc + ' · looks: ' + Object.keys(looks).map(k => k + ' ' + looks[k]).join(', '), L.length ? L.length + ' avisos:' : 'Sin avisos.'];
  const txt = head.concat(L, info).join('\n'); fs.writeFileSync(OUT + '/' + cfg.id + '-informe-reglas.txt', txt); console.log(txt); return L;
};
