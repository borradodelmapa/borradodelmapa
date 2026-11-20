// REVISOR DE VÍDEO: el CANDADO antes de exportar y antes de publicar (Paco, 20 nov 2026: «quiero que metas las 145… 138 de 145 automáticas»).
// 0 €, local. Cuenta TODAS las reglas de docs/video-checklist.md y exige que cada una esté resuelta en uno de estos sitios:
//   ⚙️🔎 MOTOR   → línea MOTOR de docs/video-fichas/0-como-se-trabaja.md · se exige el informe del motor sin ❌.
//   🧮 SCRIPT    → las comprueba este archivo (textos, archivos, calidad, fechas).
//   🤖 REVISORES → revision-guion.json y revision-imagen.json en la carpeta ULTIMA, que hace el chat siguiendo
//                  docs/video-fichas/revisor-guion.md y revisor-imagen.md. Cada ID: { "estado": "✅"|"❌", "como"|"motivo": "…" }.
//   👤 PACO      → las 7 que solo puede hacer Paco, en ok-paco.json con sus palabras: { "F3": "«Ok al guión sigue» (19 nov)", … }.
// textos-youtube.txt, revision-*.json y ok-paco.json pueden estar en la carpeta del mp4 o en la del vídeo (la de encima). El motor lo llama sobre la carpeta temporal de la exportación ANTES de copiar a ULTIMA.
// Desde el motor: node scripts/revisar-video.cjs "<carpeta del vídeo>" --mp4 <salida/id.mp4> --informe <salida/id-informe-reglas.txt> --acta <salida/id-acta.txt> --nombre <nombre final> [--fase …]
// Uso: node scripts/revisar-video.cjs "<carpeta ULTIMA>" [--fase exportar|publicar] [--fecha 2026-12-22T10:00] [--tipo short|largo]
//   --fase exportar (por defecto): lo que tiene que estar antes de «★ Exportar para publicar».
//   --fase publicar: además, blog, Web Story, fecha válida, registro y OK de Paco a todo.
// Sale con código 1 si algo falla (❌). Escribe el resultado en "<carpeta>/revision-candado.txt".
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const R = path.join(__dirname, '..');
const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--'));
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const fase = opt('fase') || 'exportar';
if (!dir || !fs.existsSync(dir)) { console.log('Uso: node scripts/revisar-video.cjs "<carpeta ULTIMA>" [--fase exportar|publicar] [--fecha AAAA-MM-DDTHH:MM] [--tipo short|largo]'); process.exit(2); }
// Llamada desde el motor (antes de escribir ULTIMA): dir = carpeta del vídeo, con --mp4, --informe, --acta (los recién montados en salida/) y --nombre (el nombre final de ULTIMA).
const MP4 = opt('mp4'), desdeMotor = !!MP4;
const base = desdeMotor ? path.resolve(dir) : path.dirname(path.resolve(dir));
const ls = fs.readdirSync(desdeMotor ? path.dirname(path.resolve(MP4)) : dir);
const leer = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return null; } };
const OK = [], MAL = [], AVISO = [];
const ok = (id, t) => OK.push('✅ ' + id + ' ' + t), mal = (id, t) => MAL.push('❌ ' + id + ' ' + t), aviso = (id, t) => AVISO.push('⚠ ' + id + ' ' + t);

// ── 1. Todas las reglas de la checklist ──
const lista = fs.readFileSync(path.join(R, 'docs/video-checklist.md'), 'utf8');
const TODAS = [...new Set(lista.split(/\r?\n/).map(l => l.match(/^\|\s*([A-Z]\d{1,2})\s*\|.*\|\s*(motor[^|]*|manual[^|]*|script[^|]*)\|\s*$/)).filter(Boolean).map(m => m[1]))];
const ficha0 = fs.readFileSync(path.join(R, 'docs/video-fichas/0-como-se-trabaja.md'), 'utf8');
const MOTOR = new Set(((ficha0.match(/^MOTOR:(.*)$/m) || [])[1] || '').trim().split(/\s+/).filter(Boolean));
// De la línea MOTOR, solo cuentan como resueltas por el motor las que la checklist marca «motor» o las que el motor ya aplica sin más (HACEYA).
// Las demás (programadas pero aún no subidas) las revisa el revisor de imagen a mano hasta que estén en el motor.
const COLMOTOR = new Set(lista.split(/\r?\n/).map(l => l.match(/^\|\s*([A-Z]\d{1,2})\s*\|.*\|\s*motor\s*\|\s*$/)).filter(Boolean).map(m => m[1]));
const HACEYA = new Set(['M5', 'M16', 'M29', 'N8', 'N22', 'Y22']);
const PACO = { F3: 'aprueba el guion y los 20 primeros segundos (G1)', F5: 'da el OK al coste', F6: 'elige la foto protagonista y los audios',
  S5: 'elige la música de oído (y su tempo, S6)', N25: 'oye la entonación al cierre de cada bloque', F8: 've y oye el montaje y lo aprueba', Y13: 'elige el título y la carátula' };
const SCRIPT = new Set(['Y3', 'Y5', 'Y6', 'Y7', 'Y8', 'Y10', 'Y12', 'P2', 'P5', 'P6', 'P9', 'P14', 'P18', 'F12', 'P3', 'P7', 'P10', 'P11', 'P12', 'P13', 'P15', 'Y1', 'Y9', 'Y17', 'S10']);

// ── 2. Archivos de la carpeta ──
const mp4Path = desdeMotor ? path.resolve(MP4) : (ls.find(f => f.endsWith('.mp4')) ? path.join(dir, ls.find(f => f.endsWith('.mp4'))) : null);
const mp4 = desdeMotor ? ((opt('nombre') || '').replace(/\.mp4$/, '') + '.mp4') : (mp4Path ? path.basename(mp4Path) : null);
const informePath = opt('informe') || (ls.find(f => /informe de reglas\.txt$/.test(f)) ? path.join(dir, ls.find(f => /informe de reglas\.txt$/.test(f))) : null);
const actaPath = opt('acta') || (ls.find(f => / - acta\.txt$/.test(f)) ? path.join(dir, ls.find(f => / - acta\.txt$/.test(f))) : null);
const leerAqui = f => [dir, base, path.join(base, 'ULTIMA')].map(d => leer(path.join(d, f))).find(x => x != null) ?? null; // carpeta del mp4, del vídeo o su ULTIMA
const textos = leerAqui('textos-youtube.txt');
if (!mp4Path || !fs.existsSync(mp4Path)) mal('F7', 'no encuentro el mp4' + (MP4 ? ' (' + MP4 + ')' : ' en la carpeta'));
if (desdeMotor && !opt('nombre')) mal('Y7', 'el motor no ha pasado --nombre (el nombre final del mp4 en ULTIMA)');
const informe = informePath && leer(informePath);
if (!informe) mal('P5', 'falta el informe de reglas del motor');
else { const x = (informe.match(/^❌.*$/gm) || []); x.length ? mal('P5', 'el informe del motor tiene ' + x.length + ' ❌: ' + x.slice(0, 3).join(' | ')) : ok('P5', 'informe del motor sin ❌'); }
actaPath && leer(actaPath) ? ok('F12', 'hay acta (' + path.basename(actaPath) + ')') : mal('F12', 'falta el acta');

// ── 3. Calidad del archivo (P14) y nombre (Y7) ──
if (mp4Path && fs.existsSync(mp4Path)) {
  const FF = [path.join(R, 'salma marketing'), 'C:/Users/User/Desktop/salma/salma marketing'].map(b => path.join(b, 'india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe')).find(f => fs.existsSync(f)) || 'ffmpeg';
  const r = spawnSync(FF, ['-hide_banner', '-i', mp4Path], { encoding: 'utf8' });
  const t = (r.stderr || '') + (r.stdout || '');
  const res = t.match(/Video: [^\n]*?, (\d{3,4})x(\d{3,4})/), br = t.match(/bitrate:\s*(\d+)\s*kb\/s/), dur = t.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!res || !br) mal('P14', 'no se pudo leer resolución o Mb/s del mp4');
  else { const lado = Math.min(+res[1], +res[2]), mbs = +br[1] / 1000; (lado >= 1080 && mbs >= 10) ? ok('P14', res[1] + 'x' + res[2] + ', ' + mbs.toFixed(1) + ' Mb/s') : mal('P14', res[1] + 'x' + res[2] + ', ' + mbs.toFixed(1) + ' Mb/s (mínimo 1080 px y 10 Mb/s)'); }
  if (dur) { const s = +dur[1] * 3600 + +dur[2] * 60 + +dur[3]; const vertical = res && +res[2] > +res[1]; if (vertical && s > 60.5) mal('N10', 'short de ' + s.toFixed(1) + ' s (máximo 60)'); }
  /^[a-z0-9ñ-]+\.mp4$/.test(mp4) ? ok('Y7', 'nombre de archivo con palabras clave: ' + mp4) : mal('Y7', 'nombre de archivo con espacios, mayúsculas o signos: ' + mp4);
}

// ── 4. Textos (P6, Y3, Y5, Y6, Y8, Y10, P2, P9, P18) ──
const SEC = {};
if (textos) { const L = textos.split(/\r?\n/); let k = null; for (const l of L) { const h = l.match(/^═{3,}\s*(.+?)\s*═{3,}\s*$/); if (h) { k = h[1].toUpperCase(); SEC[k] = []; } else if (k) SEC[k].push(l); } for (const x in SEC) SEC[x] = SEC[x].join('\n').trim(); }
const sec = n => { const k = Object.keys(SEC).find(h => h.startsWith(n)); return k ? SEC[k] : null; };
if (!textos) mal('P6', 'falta textos-youtube.txt en la carpeta (paquete completo, mismo formato que El Salvador)');
else {
  const tit = (sec('TÍTULO') || '').split('\n')[0].trim(), des = sec('DESCRIPCIÓN') || '', eti = sec('ETIQUETAS') || '', com = sec('PRIMER COMENTARIO') || '', en = sec('ENGLISH') || '';
  if (!tit) mal('Y3', 'sin título'); else { const n = [...tit].length; n <= 60 ? ok('Y3', 'título de ' + n + ' caracteres: «' + tit + '»') : mal('Y3', 'título de ' + n + ' caracteres (máximo 60): «' + tit + '»'); }
  const lin = des.split('\n').filter(l => l.trim());
  lin.length >= 2 ? ok('Y5', 'descripción con ' + lin.length + ' líneas') : mal('Y5', 'descripción vacía o de una línea');
  /borradodelmapa\.com/.test(lin.slice(0, 5).join(' ')) ? ok('P6', 'borradodelmapa.com en las primeras líneas') : mal('P6', 'borradodelmapa.com no está en las primeras líneas de la descripción');
  /(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\.? (de )?20\d\d|20\d\d-\d\d-\d\d/i.test(des) && /confírm|fuentes oficiales/i.test(des) ? ok('P9', 'datos de viaje con fecha y aviso de confirmarlos') : mal('P9', 'faltan datos de viaje con fecha («noviembre de 2026; confírmalos…»)');
  const tags = (des.match(/(^|\s)#[\wÀ-ÿ]+/g) || []).length; (tags >= 3 && tags <= 5) ? ok('P6·hashtags', tags + ' hashtags') : mal('P6', tags + ' hashtags en la descripción (3 en YouTube)');
  const largo = (opt('tipo') || '') === 'largo' || /CAP[IÍ]TULOS/.test(des);
  if (largo) /(^|\n)0:00 /.test(des) ? ok('Y6', 'capítulos con 0:00') : mal('Y6', 'largo sin capítulos 0:00 en la descripción'); else ok('Y6', 'short: YouTube no enseña capítulos en Shorts');
  eti ? ok('Y8', 'etiquetas: ' + eti.split(',').length) : mal('Y8', 'sin etiquetas');
  com && /\?/.test(com) ? ok('P18', 'comentario fijado con pregunta') : mal('P18', 'el comentario fijado no lleva pregunta');
  /borradodelmapa\.com/.test(com) ? ok('P6·comentario', 'llamada a la app en el comentario') : mal('P6', 'el comentario fijado no lleva borradodelmapa.com');
  (/📷|autores/i.test(com)) ? ok('P2·comentario', 'autores en el comentario') : mal('P2', 'el comentario fijado no lleva los autores (📷 … o «autores de todas las fotos en la descripción»)');
  const srtEN = [ls, ...[base, path.join(base, 'ULTIMA')].map(d => { try { return fs.readdirSync(d); } catch (e) { return []; } })].some(a => a.some(f => /subtitulos[ -]en\.srt$/i.test(f)));
  (srtEN && /TITLE/i.test(en)) ? ok('Y10', 'paquete EN: título, descripción y .srt') : mal('Y10', 'falta ' + (srtEN ? '' : 'el .srt EN ') + (/TITLE/i.test(en) ? '' : 'el título/descripción EN'));
  // P2: cada autor de ATRIBUCIONES en la descripción
  const atrib = [path.join(dir, 'ATRIBUCIONES.txt'), path.join(base, 'ATRIBUCIONES.txt'), path.join(base, 'videos', 'ATRIBUCIONES.txt'), path.join(base, 'fotos', 'ATRIBUCIONES.txt'), path.join(base, 'caratula', 'ATRIBUCIONES.txt')].filter(f => fs.existsSync(f));
  if (!atrib.length) aviso('P2', 'no encuentro ATRIBUCIONES.txt junto al vídeo: no puedo cruzar autores');
  else ok('P2', 'ATRIBUCIONES encontradas (' + atrib.length + '); el cruce autor a autor lo confirma revision-imagen.json');
}

// ── 5. Estudio de título (Y12) ──
fs.existsSync(path.join(base, 'estudio-titulo.md')) ? ok('Y12', 'estudio-titulo.md') : mal('Y12', 'falta estudio-titulo.md en ' + base);

// ── 6. Revisores (guion e imagen) ──
const rev = {}; let faltanRev = false;
for (const f of ['revision-guion.json', 'revision-imagen.json']) {
  const t = leerAqui(f);
  if (!t) { mal('REVISOR', 'falta ' + f + ' (docs/video-fichas/' + f.replace('revision-', 'revisor-').replace('.json', '.md') + ')'); faltanRev = true; continue; }
  try { Object.assign(rev, JSON.parse(t)); } catch (e) { mal('REVISOR', f + ' no es JSON válido'); faltanRev = true; }
}
// ── 7. OK de Paco ──
let okp = {}; const tp = leerAqui('ok-paco.json'); if (tp) { try { okp = JSON.parse(tp); } catch (e) { mal('PACO', 'ok-paco.json no es JSON válido'); } }

// ── 8. Fase publicar ──
if (fase === 'publicar') {
  const slug = mp4 ? mp4.replace(/\.mp4$/, '') : '';
  fs.existsSync(path.join(R, 'blog/viajes', slug + '.html')) ? ok('P12', 'entrada de blog ' + slug) : mal('P12', 'falta blog/viajes/' + slug + '.html');
  fs.existsSync(path.join(R, 'stories', slug)) ? ok('P15', 'Web Story ' + slug) : mal('P15', 'falta stories/' + slug + '/');
  const f = opt('fecha');
  if (!f) mal('P13', 'falta --fecha AAAA-MM-DDTHH:MM');
  else { const d = new Date(f + ':00'), dia = d.getDay(), hm = f.slice(11, 16), vertical = true; const shortOk = [2, 3, 4].includes(dia), largoOk = [5, 6, 0, 1].includes(dia); const esLargo = (opt('tipo') || '') === 'largo';
    ((esLargo ? largoOk : shortOk) && hm === '10:00') ? ok('P13', f + ' (' + ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][dia] + ')') : mal('P13', f + ': los shorts van de martes a jueves y los largos de viernes a lunes, a las 10:00'); }
  const reg = leer(path.join(R, 'docs/publicaciones-registro.md')) || '';
  (slug && reg.toLowerCase().includes(slug.split('-').slice(0, 3).join('-'))) || (textos && reg.includes((sec('TÍTULO') || '').split('\n')[0].trim().slice(0, 25))) ? ok('P7', 'anotado en publicaciones-registro.md') : aviso('P7', 'no encuentro el vídeo en publicaciones-registro.md: se anota al programar');
}

// ── 9. Reparto: cada una de las reglas tiene que estar resuelta ──
const SIN = [];
for (const id of TODAS) {
  if (MOTOR.has(id) && (COLMOTOR.has(id) || HACEYA.has(id))) continue;   // las mira el informe del motor (paso 2)
  if (MOTOR.has(id)) { if (rev[id]) { const e = rev[id]; if (e.estado === '✅' && e.como) ok(id, '(aún no la hace el motor; revisada a mano) ' + e.como); else if (e.estado === '❌' && e.motivo && /\bArreglo\b/i.test(e.motivo) && !e.paco) mal(id, 'TIENE ARREGLO y no está hecho (F12: lo que tiene arreglo se arregla): ' + e.motivo); else if (e.estado === '❌' && e.motivo) aviso(id, 'no se cumple, explicado: ' + e.motivo); else mal(id, 'revisión sin estado o sin explicación'); } else if (!faltanRev) SIN.push(id); continue; }
  if (PACO[id]) { if (fase === 'publicar' || ['F3', 'F5', 'F6', 'Y13'].includes(id)) { okp[id] ? ok(id, 'Paco: ' + okp[id]) : mal(id, 'falta el OK de Paco: ' + PACO[id] + ' (ok-paco.json, con sus palabras)'); } continue; }
  if (rev[id]) { const e = rev[id]; if (e.estado === '✅' && e.como) ok(id, e.como); else if (e.estado === '❌' && e.motivo && /\bArreglo\b/i.test(e.motivo) && !e.paco) mal(id, 'TIENE ARREGLO y no está hecho (F12: lo que tiene arreglo se arregla): ' + e.motivo); else if (e.estado === '❌' && e.motivo) aviso(id, 'no se cumple, explicado: ' + e.motivo); else mal(id, 'revisión sin estado o sin explicación'); continue; }
  if (SCRIPT.has(id)) { if (![...OK, ...MAL, ...AVISO].some(l => l.includes(' ' + id + ' ') || l.includes(' ' + id + '·'))) { if (['P12', 'P15', 'P13', 'P7', 'P3', 'P10', 'P11', 'Y1', 'Y9', 'Y17'].includes(id) && fase !== 'publicar') continue; if (!rev[id]) SIN.push(id); } continue; }
  if (!faltanRev) SIN.push(id);
}
if (SIN.length) mal('SIN RESOLVER', SIN.length + ' reglas sin revisar: ' + SIN.join(' '));

// ── 10. Resultado ──
const total = TODAS.length;
const out = ['REVISIÓN · ' + path.basename(path.resolve(dir)) + ' · fase ' + fase + ' · ' + new Date().toISOString().slice(0, 16),
  'Reglas en la checklist: ' + total + ' · del motor: ' + MOTOR.size + ' · de Paco: ' + Object.keys(PACO).length + ' · del script y de los revisores: el resto',
  '', ...MAL, ...AVISO, ...OK, '',
  MAL.length ? '❌ NO PASA (' + MAL.length + '): no se exporta ni se publica hasta arreglarlo.' : '✅ PASA: todas las reglas resueltas (' + AVISO.length + ' explicadas como no cumplibles).'].join('\n');
try { fs.writeFileSync(path.join(dir, 'revision-candado.txt'), out); } catch (e) { }
console.log(out);
process.exit(MAL.length ? 1 : 0);
