// Informe de reglas de montaje: se ejecuta antes de dar por buena una versión. Fuente de las reglas: docs/video-checklist.md (única, versionada).
// Cada comprobación lleva el ID de la checklist entre corchetes ([M7]…): scripts/comprobar-checklist-video.cjs verifica que lista y motor no se desincronizan.
// Una pieza se puede DESCARTAR a propósito con cfg.descartes = { M7: 'por qué' } (Biblia §22: cada guion dice qué usa y qué descarta); sale como ℹ, no como ❌.
const fs = require('fs'), path = require('path');
function versionChecklist() {
  try {
    const t = fs.readFileSync(path.join(__dirname, '../../../docs/video-checklist.md'), 'utf8'), i = t.indexOf('## Registro de cambios');
    const fila = t.slice(i).split(/\r?\n/).filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l) && !/Versión/.test(l))[0];
    return fila ? fila.split('|')[1].trim() : 'desconocida';
  } catch (e) { return 'no se pudo leer'; }
}
module.exports = function reglas(cfg, TOTAL, OUT) {
  const L = [], W = t => L.push(t);
  const X = [], I = [], desc = cfg.descartes || {};
  // X(id, falla, texto): ❌ si falla, salvo que la pieza esté descartada con motivo
  const chk = (id, falla, texto) => { if (!falla) return; if (desc[id]) I.push('ℹ [' + id + '] descartado a propósito: ' + desc[id]); else X.push('❌ [' + id + '] ' + texto); };
  const MIN = { GP: 2.0, PM: 1.2, PP: 1.0, D: 0.6 }, MAX = { GP: 8, PM: 5, PP: 5, D: 2.5 };
  const sh = cfg._shots || [], byBlk = {};
  sh.forEach((s, ix) => {
    (byBlk[s.blk] = byBlk[s.blk] || []).push(s);
    if (!s.sc) { W('⚠ [M2] plano ' + (ix + 1) + ' (' + s.id + '): sin escala GP/PM/PP/D'); return; }
    if (!s.ok && s.d < MIN[s.sc]) W('⚠ [M2] plano ' + (ix + 1) + ' (' + s.id + ', ' + s.sc + '): dura ' + s.d.toFixed(1) + ' s, mínimo recomendado ' + MIN[s.sc] + ' s');
    if (!s.ok && s.d > MAX[s.sc]) W('⚠ [M2] plano ' + (ix + 1) + ' (' + s.id + ', ' + s.sc + '): dura ' + s.d.toFixed(1) + ' s, máximo recomendado ' + MAX[s.sc] + ' s');
  });
  for (const blk of Object.keys(byBlk)) {
    let run = 0; const arr = byBlk[blk];
    arr.forEach((s, i) => {
      if (i > 0 && s.sc && arr[i - 1].sc === s.sc && !s.ok) W('⚠ [M2] bloque ' + blk + ': ' + arr[i - 1].id + ' y ' + s.id + ' repiten escala ' + s.sc + ' seguidas');
      run = s.sc === 'D' ? run + 1 : 0; if (run > 2) W('⚠ [M2] bloque ' + blk + ': más de 2 detalles seguidos');
    });
  }
  const cnt = {}; sh.forEach(s => { cnt[s.id] = (cnt[s.id] || 0) + 1; });
  Object.keys(cnt).filter(k => cnt[k] > 1).forEach(k => W('⚠ [M3] imagen repetida: ' + k + ' (' + cnt[k] + ' veces)'));
  cfg.blocks.filter(b => b.silencio && b.amb).forEach(b => W('⚠ [S1] bloque ' + b.id + ' debe ir en silencio y lleva ambiente'));
  // ---- piezas obligatorias de la checklist (❌ si faltan) ----
  const voz = cfg.blocks.filter(b => b.text), todos = cfg.blocks;
  chk('M4', !cfg.look && !todos.some(b => b.look), 'ningún look Kodak definido (portra/vision3/trix)');
  chk('M6', voz.some(b => !b.scene && !b.sceneEnd), 'bloques sin fundido a negro (scene/sceneEnd): ' + voz.filter(b => !b.scene && !b.sceneEnd).map(b => b.id).join(', '));
  chk('M7', !todos.some(b => b.video), 'sin mapa de ruta animado de cabecera (bloque con video: mapa)');
  chk('M8', !cfg.counter && !todos.some(b => b.rotulo), 'sin contador/rótulo de serie ni rótulos de lugar (cfg.counter, b.rotulo)');
  chk('M9', !todos.some(b => b.cifra), 'sin cifras grandes animadas (b.cifra)');
  chk('M10', voz.some(b => !b.en), 'sin subtítulos EN en: ' + voz.filter(b => !b.en).map(b => b.id).join(', ') + ' (b.en)');
  chk('M11', !(cfg.portada && cfg.portada.foto), 'sin portada (cfg.portada)');
  chk('M12', cfg.kb === 0, 'Ken Burns apagado (cfg.kb = 0)');
  chk('M13', !(cfg.seguir && cfg.seguir.activo !== false), 'aviso «Si te está gustando, sígueme» desactivado o sin configurar (cfg.seguir)');
  chk('M14', (cfg.cardSecs || 8) < 8 || !cfg.card, 'tarjeta final de menos de 8 s o sin cfg.card');
  chk('N5', voz.some(b => /\b(app|aplicaci[oó]n|borradodelmapa)\b/i.test(b.voz || b.text)), 'la app se menciona en la voz (va en la tarjeta final): ' + voz.filter(b => /\b(app|aplicaci[oó]n|borradodelmapa)\b/i.test(b.voz || b.text)).map(b => b.id).join(', '));
  chk('S1', !todos.some(b => b.amb || b.intro) && !cfg.musica, 'solo hay voz: sin ambiente, detalle ni música (cfg.musica / b.amb)');
  const VD = cfg.voiceDb || {}; chk('S2', (VD.salma != null && VD.salma !== -25) || (VD.paco != null && VD.paco !== -21), 'nivel de voz distinto del protocolo (Paco −21, Salma −25)');
  const info = [...I]; if (TOTAL > 100) info.push('ℹ duración ' + TOTAL.toFixed(0) + ' s: preferible 60-90 s, pero si la historia lo pide, sin problema (regla de Paco, 26 oct 2026)');
  const looks = {}; sh.forEach(s => { looks[s.look] = (looks[s.look] || 0) + 1; });
  const sc = ['GP', 'PM', 'PP', 'D'].map(k => k + ' ' + sh.filter(s => s.sc === k).length).join(' · ');
  const head = ['INFORME DE REGLAS · ' + cfg.id + ' · ' + TOTAL.toFixed(0) + ' s · ' + sh.length + ' planos · escalas: ' + sc + ' · looks: ' + Object.keys(looks).map(k => k + ' ' + looks[k]).join(', '),
    'Comprobado contra docs/video-checklist.md (última actualización: ' + versionChecklist() + ')',
    X.length ? '❌ ' + X.length + ' PIEZAS DE LA CHECKLIST SIN CUMPLIR — NO DARLO POR TERMINADO:' : '✅ Piezas automáticas de la checklist cumplidas (lo manual —guion, fuentes, sonido, publicación— lo revisan quien monta y Paco).',
    ...X, L.length ? L.length + ' avisos:' : 'Sin avisos.'];
  const txt = head.concat(L, info).join('\n'); fs.writeFileSync(OUT + '/' + cfg.id + '-informe-reglas.txt', txt); console.log(txt); return L.concat(X);
};
