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
// TODO MAPA LLEVA SU SINTONÍA (Paco, 9 nov 2026): qué bloques y planos son mapas. Bloque de vídeo con id «mapa», «…-mapa», «mapa-…» o fichero mapa-*; plano FILE: de un fichero mapa-*.
const esFicheroMapa = p => /^mapa[-_.]/i.test(String(p || '').split(/[\\/]/).pop());
function mapasDe(cfg) {
  const bloques = cfg.blocks.filter(b => b.video && (b.id === 'mapa' || /(-mapa$|^mapa-)/.test(b.id) || esFicheroMapa(b.video)));
  const planos = cfg.blocks.flatMap(b => (b.shots || []).filter(s => esFicheroMapa(s.a)).map(s => ({ b, s })));
  return { bloques, planos };
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
  chk('M11', !(cfg.portada && (cfg.portada.foto || cfg.portada.png)), 'sin portada (cfg.portada)');
  // M12 (Paco, 16 nov 2026): fotos QUIETAS a pantalla completa. ❌ si hay Ken Burns (cfg.kb > 0) o una foto con barrido (pan con inicio ≠ fin). El encuadre fijo (pan [x,y,x,y]) y el zoom de énfasis (enfasis: true, N14) sí valen.
  const fotos = todos.flatMap(b => (b.shots || []).filter(s => s.a && !/^(RW|V)/.test(s.a) && !/\.mp4$/i.test(s.a)));
  const barridos = fotos.filter(s => s.pan && (s.pan[0] !== s.pan[2] || s.pan[1] !== s.pan[3]));
  const barridosLargos = barridos.filter(s => Math.hypot(s.pan[2] - s.pan[0], s.pan[3] - s.pan[1]) > 0.15);
  // M12 (Paco, 19 nov 2026: «movimiento suave»): vale un acercamiento lento (cfg.kb hasta 1,2) y desplazamientos cortos (hasta el 15 % de la foto). ❌ solo con Ken Burns fuerte o barridos largos.
  chk('M12', (cfg.kb ?? 0) > 1.2 || barridosLargos.length > 0, 'movimiento demasiado fuerte: ' + ((cfg.kb ?? 0) > 1.2 ? 'Ken Burns cfg.kb = ' + cfg.kb + ' (máximo 1,2); ' : '') + (barridosLargos.length ? barridosLargos.length + ' con barrido largo (más del 15 % de la foto): ' + barridosLargos.slice(0, 6).map(s => s.a.split('/').pop()).join(', ') : '') + ' — movimiento suave: acercamiento lento y desplazamiento corto que termina en la cara');
  const enf = fotos.filter(s => s.enfasis).length; if (enf) I.push('ℹ zoom de énfasis (la del punto 10 de la regla de enganche) en ' + enf + ' foto' + (enf > 1 ? 's' : '') + ' (solo en los datos importantes)');
  chk('M13', !(cfg.seguir && cfg.seguir.activo !== false), 'aviso «Si te está gustando, sígueme» desactivado o sin configurar (cfg.seguir)');
  const F9x16 = !cfg.formato || cfg.formato === '9:16', esShort = F9x16 && TOTAL <= 65, minCard = esShort ? 3 : 8;
  // M14 (T29): tarjeta final presente, de 3 s o más en shorts (8 en largos), y que ningún vídeo crudo la empuje fuera del final (fallo de los aché v3)
  const rawLargos = (cfg._raw || []).filter(x => x.dur > x.D + 0.1);
  chk('M14', !cfg.card || (cfg.cardSecs || 8) < minCard || rawLargos.length > 0, !cfg.card ? 'sin tarjeta final (cfg.card)' : (cfg.cardSecs || 8) < minCard ? 'tarjeta final de ' + cfg.cardSecs + ' s (mínimo ' + minCard + ' s)' : 'la tarjeta se corta: ' + rawLargos.map(x => x.id + ' dura ' + x.dur.toFixed(1) + ' s y tiene ' + x.D.toFixed(1)).join(', '));
  chk('N5', voz.some(b => /\b(app|aplicaci[oó]n|borradodelmapa)\b/i.test(b.voz || b.text)), 'la app se menciona en la voz (va en la tarjeta final): ' + voz.filter(b => /\b(app|aplicaci[oó]n|borradodelmapa)\b/i.test(b.voz || b.text)).map(b => b.id).join(', '));
  chk('S1', !todos.some(b => b.amb || b.intro) && !cfg.musica, 'solo hay voz: sin ambiente, detalle ni música (cfg.musica / b.amb)');
  const MP = mapasDe(cfg); chk('S3', MP.bloques.length + MP.planos.length > 0 && cfg.sintonia === false, 'hay un mapa sin su sintonía (solo se quita con cfg.descartes.S3 y un motivo)');
  const VD = cfg.voiceDb || {}; chk('S2', (VD.salma != null && VD.salma !== -25) || (VD.paco != null && VD.paco !== -21), 'nivel de voz distinto del protocolo (Paco −21, Salma −25)');
  // ---- T29 (19 nov 2026): comprobaciones nuevas. Marcas en la config (ficha ①, apartado E): cfg.nombre · b.pico · cfg.fecha / cfg.fechaTikTok ----
  // N14 (9): ninguna FOTO fija más de 3,5 s (los clips de vídeo no cuentan: se mueven)
  const fijas = sh.filter(s => s.foto && s.d > 3.55 && !s.asombro); // M24 (T31): el plano de asombro (s.asombro) es la única foto que puede pasar de 3,5 s
  const asom = sh.filter(s => s.asombro); if (asom.length > 1) L.push('⚠ M24 hay ' + asom.length + ' planos de asombro: la regla pide uno por vídeo'); else if (asom.length) I.push('ℹ M24 plano de asombro: ' + String(asom[0].id).split('/').pop() + ', ' + asom[0].d.toFixed(1) + ' s');
  chk('N14', fijas.length > 0, 'foto fija de más de 3,5 s (punto 9 de la regla de enganche): ' + fijas.map(s => String(s.id).split('/').pop() + ' ' + s.d.toFixed(1) + ' s en ' + s.blk).join(', '));
  // G2: el nombre del pueblo o lugar (cfg.nombre) suena antes del segundo 5
  chk('G2', !cfg.nombre || cfg._nombreT == null || cfg._nombreT > 5, !cfg.nombre ? 'falta la marca cfg.nombre (el pueblo o lugar que tiene que sonar antes de 5 s)' : cfg._nombreT == null ? 'el nombre «' + [].concat(cfg.nombre).join(' / ') + '» no se dice en la voz' : 'el nombre suena en el segundo ' + cfg._nombreT.toFixed(1) + ' (tiene que ser antes del 5)');
  // N10: shorts (9:16) de 60 s como máximo, tarjeta incluida
  chk('N10', F9x16 && TOTAL > 60.05, 'short de ' + TOTAL.toFixed(1) + ' s (máximo 60 s, tarjeta incluida)');
  // F11: dos bloques marcados pico (b.pico) seguidos, sin un bloque con voz entre medias
  const vozB = todos.filter(b => b.text), picosSeg = [];
  vozB.forEach((b, i) => { if (i && b.pico && vozB[i - 1].pico) picosSeg.push(vozB[i - 1].id + ' → ' + b.id); });
  chk('F11', picosSeg.length > 0, 'dos picos seguidos sin tramo neutro: ' + picosSeg.join(', '));
  // S10: la misma pista de música en otro vídeo que se publica la misma semana (cfg.fecha / cfg.fechaTikTok en las configs del motor)
  const pista = cfg.musica && cfg.musica.src;
  const semana = d => { const t = new Date(d + 'T12:00:00Z'); const dia = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - dia); return t.toISOString().slice(0, 10); };
  const choques = [];
  if (pista && (cfg.fecha || cfg.fechaTikTok)) {
    for (const f of fs.readdirSync(__dirname).filter(f => /\.cjs$/.test(f))) {
      let t; try { t = fs.readFileSync(path.join(__dirname, f), 'utf8'); } catch (e) { continue; }
      if (!t.includes(pista)) continue;
      const id = (t.match(/id:\s*'([^']+)'/) || [])[1]; if (!id || String(cfg.id).startsWith(id)) continue; // el propio vídeo (también su versión TikTok o una prueba) no cuenta
      for (const [campo, mia] of [['fecha', cfg.fecha], ['fechaTikTok', cfg.fechaTikTok]]) {
        if (!mia) continue; const m = t.match(new RegExp(campo + ":\\s*'(\\d{4}-\\d\\d-\\d\\d)'"));
        if (m && semana(m[1]) === semana(mia)) choques.push(f + ' (' + campo + ' ' + m[1] + ')');
      }
    }
  }
  chk('S10', choques.length > 0, 'la pista ' + pista + ' sale otra vez la misma semana: ' + choques.join(', '));
  if (pista && !cfg.fecha && !cfg.fechaTikTok) L.push('⚠ [S10] sin cfg.fecha: no se puede comprobar si la música se repite la misma semana');
  // M34 (T32): el motor parte el último plano (general → medio → detalle); aquí solo queda el aviso de lo que no ha podido, con su motivo
  { const m3 = Object.fromEntries((cfg._m34 || []).map(x => [x.blk, x]));
    for (const blk of Object.keys(byBlk)) { const a = byBlk[blk], x = m3[blk]; if (x && x.ok) continue; if (x) { L.push('⚠ [M34] bloque ' + blk + ': ' + x.motivo); continue; } if (a.length >= 2 && a[a.length - 1].d > Math.max(...a.slice(0, -1).map(s => s.d)) + 0.2) L.push('⚠ [M34] bloque ' + blk + ': el último plano es el más largo; el ritmo no se acelera al final'); } }
  // ---- T30 (20 nov 2026): comprobaciones de la tanda 2 ----
  // M17: algo reinicia la atención cada 45 s como mucho (cambio de bloque, rótulo o cifra)
  { const ev = [0, ...todos.filter(b => b.t0 != null).map(b => b.t0), ...todos.filter(b => b.rotulo && b.t0 != null).map(b => b.t0 + 0.5), cfg._cardT || TOTAL].sort((a, b) => a - b);
    let peor = 0, en = 0; for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > peor) { peor = ev[i] - ev[i - 1]; en = ev[i - 1]; }
    chk('M17', peor > 45, 'más de 45 s sin reinicio de atención (ni bloque nuevo, ni rótulo, ni cifra): ' + peor.toFixed(0) + ' s desde el segundo ' + en.toFixed(0)); }
  // N14 (3): sin cortinilla de más de 2 s (bloque de vídeo sin voz que no es mapa, marcado cortinilla o con id intro/cortinilla/logo)
  { const MPb = mapasDe(cfg).bloques; const cort = todos.filter(b => b.video && !b.text && !MPb.includes(b) && (b.cortinilla || /intro|cortinilla|logo/i.test(b.id)) && (b.D ?? b.fixed) > 2);
    chk('N14', cort.length > 0, 'cortinilla de más de 2 s (punto 3 de la regla de enganche): ' + cort.map(b => b.id + ' ' + (b.D ?? b.fixed).toFixed(1) + ' s').join(', ')); }
  // M31 (aviso): el corte de imagen cae a mitad de una frase (antes de la palabra «from» no hay , . : ; ? ! …)
  { const mitad = []; todos.forEach(b => (b.shots || []).forEach((sh2, k) => { if (!k || !sh2.from || !b.text) return; const i = b.text.indexOf(sh2.from); if (i > 0 && !/[,.:;!?…]$/.test(b.text.slice(0, i).trim())) mitad.push(b.id + ' «' + sh2.from + '»'); }));
    if (mitad.length) L.push('⚠ [M31] ' + mitad.length + ' cortes a mitad de frase (suele ser para que ninguna foto pase de 3,5 s, N14-9): ' + mitad.join(', ')); }
  // M38 (aviso): tres planos seguidos de un bloque con casi la misma duración (±5 %)
  for (const blk of Object.keys(byBlk)) { const a = byBlk[blk]; for (let i = 2; i < a.length; i++) { const ds = [a[i - 2].d, a[i - 1].d, a[i].d], m = (ds[0] + ds[1] + ds[2]) / 3; if (ds.every(x => Math.abs(x - m) / m < 0.05)) { L.push('⚠ [M38] bloque ' + blk + ': tres planos seguidos casi iguales (' + ds.map(x => x.toFixed(1)).join(' / ') + ' s)'); break; } } }
  // M42 (aviso): dos paneos seguidos en la misma dirección (el acercamiento/alejamiento automático ya se alterna solo)
  { const pans = sh.filter(x => x.pan && (x.pan[0] !== x.pan[2] || x.pan[1] !== x.pan[3])); for (let i = 1; i < pans.length; i++) { const d0 = [Math.sign(pans[i - 1].pan[2] - pans[i - 1].pan[0]), Math.sign(pans[i - 1].pan[3] - pans[i - 1].pan[1])], d1 = [Math.sign(pans[i].pan[2] - pans[i].pan[0]), Math.sign(pans[i].pan[3] - pans[i].pan[1])]; if (d0[0] === d1[0] && d0[1] === d1[1]) L.push('⚠ [M42] dos paneos seguidos en la misma dirección: ' + String(pans[i - 1].id).split('/').pop() + ' y ' + String(pans[i].id).split('/').pop()); } }
  // ⚙️ lo que el motor HACE solo (T30): constancia en el informe
  if (todos.some(b => b.datoFuerte)) I.push('ℹ [M19] datoFuerte: ' + todos.filter(b => b.datoFuerte).map(b => b.id).join(', ') + ' aguanta un 30 % más · [S9] con 0,6 s de silencio total antes'); else L.push('⚠ [S9] ningún bloque marcado datoFuerte: sin silencio antes del dato más fuerte ni plano que aguante más (M19)');
  I.push('ℹ [S7] el ambiente entra ' + (cfg.ambPrelap ?? 0.17) + ' s antes de cada corte');
  if (todos.some(b => b.cambioTono)) I.push('ℹ [S8] la música baja antes del cambio de tono en: ' + todos.filter(b => b.cambioTono).map(b => b.id).join(', '));
  if (todos.some(b => b.humano)) I.push('ℹ N14 (4) bloque humano más lento y sin música: ' + todos.filter(b => b.humano).map(b => b.id).join(', '));
  if (todos.some(b => b.advertencia)) I.push('ℹ N14 (10) zoom de énfasis en: ' + todos.filter(b => b.advertencia).map(b => b.id).join(', '));
  I.push('ℹ [F7] hoja de planos automática; en calidad máxima, copia con fecha en VIDEOS-TERMINADOS · [P14] en calidad máxima se mide el mp4 de ULTIMA (≥ 1080 px y ≥ 10 Mb/s)');
  if (cfg.golpeCifra !== false && todos.some(b => b.cifra)) I.push('ℹ [M22] golpe del batok (sfx/golpe-cifra.mp3, elegido por Paco de oído el 20 nov 2026) al fotograma exacto de cada cifra'); else if (todos.some(b => b.cifra)) L.push('⚠ [M22] cfg.golpeCifra = false: las cifras entran sin golpe de sonido');
  // ⚙️ lo que el motor HACE solo (T29): se anota en el informe para que quede constancia
  I.push('ℹ [M30] las cifras entran ' + (cfg.cifraRetraso ?? 0.5) + ' s después de decir su palabra');
  I.push('ℹ [M41] los rótulos entran ' + (cfg.rotuloRetraso ?? 0.5) + ' s después del corte');
  I.push('ℹ [M45] cada subtítulo dura al menos lo necesario para leerlo (' + (cfg.subPalabrasSeg ?? 3.5) + ' palabras/s); el resultado, al final de este informe');
  const emoB = todos.filter(b => b.emocion).map(b => b.id + ' ' + b.emocion), picoB = todos.filter(b => b.pico).map(b => b.id);
  if (emoB.length) I.push('ℹ [M23] temperatura de color: ' + emoB.join(', ')); else L.push('⚠ [M23] ningún bloque marcado con emocion (calida | fria): el color no cambia con la emoción');
  if (picoB.length) I.push('ℹ [M27] fondo oscurecido en el plano pico de: ' + picoB.join(', ')); else L.push('⚠ [M27] ningún bloque marcado pico: no se oscurece el fondo en el momento fuerte');
  const info = [...I]; if (TOTAL > 100) info.push('ℹ duración ' + TOTAL.toFixed(0) + ' s: preferible 60-90 s, pero si la historia lo pide, sin problema (regla de Paco, 26 oct 2026)');
  const looks = {}; sh.forEach(s => { looks[s.look] = (looks[s.look] || 0) + 1; });
  const sc = ['GP', 'PM', 'PP', 'D'].map(k => k + ' ' + sh.filter(s => s.sc === k).length).join(' · ');
  const head = ['INFORME DE REGLAS · ' + cfg.id + ' · ' + TOTAL.toFixed(0) + ' s · ' + sh.length + ' planos · escalas: ' + sc + ' · looks: ' + Object.keys(looks).map(k => k + ' ' + looks[k]).join(', '),
    'Comprobado contra docs/video-checklist.md (última actualización: ' + versionChecklist() + ')',
    X.length ? '❌ ' + X.length + ' PIEZAS DE LA CHECKLIST SIN CUMPLIR — NO DARLO POR TERMINADO:' : '✅ Piezas automáticas de la checklist cumplidas (lo manual —guion, fuentes, sonido, publicación— lo revisan quien monta y Paco).',
    ...X, L.length ? L.length + ' avisos:' : 'Sin avisos.'];
  const txt = head.concat(L, info).join('\n'); fs.writeFileSync(OUT + '/' + cfg.id + '-informe-reglas.txt', txt); console.log(txt);
  acta(cfg, TOTAL, OUT, X, L, I, { esShort });
  return L.concat(X);
};
module.exports.mapasDe = mapasDe;

// ---- ACTA DE CUMPLIMIENTO (F12; T29, 19 nov 2026): las reglas que hace (⚙️) o comprueba (🔎) el motor salen rellenas; las 📋 las rellena el chat con su ficha ----
// Qué marca de la config usa cada regla (ficha ①, apartado E): pico → M27 y F11 · emocion (calida | fria) → M23 · nombre → G2 · fecha / fechaTikTok → S10.
// Ajustes: cfg.cifraRetraso (M30, 0,5 s) · cfg.rotuloRetraso (M41, 0,5 s) · b.picoPlano (qué plano del bloque pico se oscurece; por defecto el último).
function acta(cfg, TOTAL, OUT, X, L, I, o) {
  const falla = id => X.find(x => x.includes('[' + id + ']')), aviso = id => L.filter(x => x.includes('[' + id + ']')), desc = id => I.find(x => x.includes('[' + id + ']'));
  const est = (id, ok) => falla(id) || desc(id) || (aviso(id).length ? '⚠ ' + id + ' ' + ok + ' · avisos: ' + aviso(id).join(' | ') : '✅ ' + id + ' ' + ok);
  const sh = cfg._shots || [], fotos = sh.filter(s => s.foto), emo = sh.filter(s => s.emo), pic = sh.filter(s => s.pico);
  const lin = [
    '🔎 LO COMPRUEBA EL MOTOR',
    est('N14', '(9) ninguna foto fija pasa de 3,5 s: la más larga dura ' + (fotos.length ? Math.max(...fotos.map(s => s.d)).toFixed(1) : '—') + ' s (' + fotos.length + ' fotos)'),
    est('G2', 'el nombre suena en el segundo ' + (cfg._nombreT != null ? cfg._nombreT.toFixed(1) : '—')),
    est('M14', 'tarjeta final de ' + (cfg.cardSecs || 8) + ' s, entera hasta el final (ningún vídeo crudo la empuja)'),
    est('N10', 'dura ' + TOTAL.toFixed(1) + ' s' + (o.esShort ? ' (short: máximo 60)' : '')),
    est('F11', 'picos marcados: ' + (cfg.blocks.filter(b => b.pico).map(b => b.id).join(', ') || 'ninguno') + '; ninguno seguido de otro'),
    est('S10', 'música ' + ((cfg.musica && cfg.musica.src) || 'sin música') + ' · fecha ' + (cfg.fecha || '—') + (cfg.fechaTikTok ? ' · TikTok ' + cfg.fechaTikTok : '') + ': ninguna otra pieza con la misma pista esa semana'),
    est('M12', 'movimiento suave: cfg.kb = ' + (cfg.kb ?? 0) + ', sin barridos largos'),
    est('M17', 'ningún tramo de más de 45 s sin bloque nuevo, rótulo o cifra'),
    est('M31', 'los cortes caen al final de una frase'),
    est('M38', 'las duraciones de los planos varían dentro de cada bloque'),
    est('M42', 'acercamiento y alejamiento alternados; ningún paneo seguido en la misma dirección'),
    '⚙️ LO HACE EL MOTOR (T30)',
    (cfg.blocks.some(b => b.datoFuerte) ? '✅ M19 · S9 datoFuerte en ' + cfg.blocks.filter(b => b.datoFuerte).map(b => b.id).join(', ') + ': el plano aguanta un 30 % más y antes hay 0,6 s de silencio total' : '⚠ M19 · S9 ningún bloque marcado datoFuerte (márcalo en el guion: ficha ① E)'),
    '✅ S7 el ambiente entra ' + (cfg.ambPrelap ?? 0.17) + ' s antes de cada corte',
    (cfg.blocks.some(b => b.cambioTono) ? '✅' : '·') + ' S8 respiro de la música antes del cambio de tono' + (cfg.blocks.some(b => b.cambioTono) ? ': ' + cfg.blocks.filter(b => b.cambioTono).map(b => b.id).join(', ') : ' (ningún bloque marcado cambioTono)'),
    (cfg.blocks.some(b => b.humano) ? '✅' : '·') + ' N14 (4) bloque humano más lento y sin música' + (cfg.blocks.some(b => b.humano) ? ': ' + cfg.blocks.filter(b => b.humano).map(b => b.id).join(', ') : ' (ningún bloque marcado humano)'),
    (cfg.blocks.some(b => b.advertencia) ? '✅' : '·') + ' N14 (10) zoom de énfasis en las advertencias' + (cfg.blocks.some(b => b.advertencia) ? ': ' + cfg.blocks.filter(b => b.advertencia).map(b => b.id).join(', ') : ' (ningún bloque marcado advertencia)'),
    '✅ N14 (11) la música baja 6 dB bajo el ambiente real (amb.real)' + (cfg.blocks.some(b => [].concat(b.amb || []).some(a => a && a.real)) ? '' : ' (este vídeo no tiene ambiente real marcado)'),
    '✅ F7 hoja de planos numerada en ULTIMA; en calidad máxima, copia con fecha en VIDEOS-TERMINADOS',
    '· P14 se mide al exportar en calidad máxima (el resultado va al final del acta de ULTIMA)',
    (cfg.golpeCifra !== false ? '✅ M22 golpe del batok al fotograma exacto de cada cifra (elegido por Paco de oído)' : '⚠ M22 sin golpe en las cifras (cfg.golpeCifra = false)'),
    '⚙️ LO HACE EL MOTOR (T29)',
    '✅ M30 la cifra entra ' + (cfg.cifraRetraso ?? 0.5) + ' s después de decir su palabra (' + cfg.blocks.filter(b => b.cifra).length + ' bloques con cifra)',
    '✅ M41 el rótulo entra ' + (cfg.rotuloRetraso ?? 0.5) + ' s después del corte de su bloque',
    (emo.length ? '✅' : '⚠') + ' M23 temperatura de color por bloque: ' + (emo.length ? [...new Set(emo.map(s => s.blk + ' ' + s.emo))].join(', ') : 'ningún bloque marcado con emocion (calida | fria): hay que marcarlos en el guion'),
    (pic.length ? '✅' : '⚠') + ' M27 fondo oscurecido en el plano pico: ' + (pic.length ? pic.map(s => s.blk + ' (' + String(s.id).split('/').pop() + ')').join(', ') : 'ningún plano marcado pico'),
    aviso('M34').length ? '⚠ M34 ' + aviso('M34').map(x => x.replace('⚠ [M34] ', '')).join(' | ') + ' (el motor no ha podido partir el plano: añade uno o mueve el corte)' : '✅ M34 el ritmo se acelera al final de cada bloque' + ((cfg._m34 || []).length ? ': ' + cfg._m34.map(x => x.blk + (x.exento ? ' (no se acelera: ' + x.exento + ')' : ' plano ' + x.plano + (x.fijo ? ' (penúltimo: el último es el dato fuerte)' : '') + ' partido en ' + x.partes.join(' · ') + ' s')).join(' | ') : ''),
    'Además, del informe: M2 M3 M4 M6 M7 M8 M9 M10 M11 M13 N5 S1 S2 S3 (ver «informe de reglas»).',
    '',
    '📋 LAS RELLENA EL CHAT (✅ con cómo se comprobó / ❌ con el motivo y qué se hizo), con la ficha de cada paso delante (docs/video-fichas/):',
    '① guion, título y carátula · ② material · ③ revisión del montaje · ④ publicación'];
  fs.writeFileSync(OUT + '/' + cfg.id + '-acta.txt', ['ACTA DE CUMPLIMIENTO (F12) · ' + cfg.id + ' · ' + new Date().toLocaleString('es-ES'), 'Parte automática del motor. El acta no está completa hasta que el chat rellena las 📋.', ...lin].join('\n') + '\n');
}
module.exports.acta = acta;
