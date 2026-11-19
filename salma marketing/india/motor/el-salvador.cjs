// LARGO 16:9 «Indígenas de El Salvador: del exterminio a cantar el himno» (T25, 19 nov 2026, 🎬 Vídeo 2). Guion aprobado por Paco: docs/el-salvador-guion-direccion.md v2.1.
// Método de tuvalu-preguntas.cjs: el TEXTO sale tal cual del guion (líneas **S…:**, en orden). Si Paco cambia el guion, se cambia allí y aquí solo las imágenes.
// Narra solo Salma (SALMA_DOC), sin «viaje real» (F2, M14). Excepción a F10 y a P4 (canto de la Asamblea y niños en la carátula), dadas por Paco el 19 nov.
// Material: el-salvador/clips (ATRIBUCIONES.txt), el-salvador/fotos (Commons, preparar-fotos.cjs), caratula/ y hoja2/ (Commons), mapas/ (mapa-el-salvador.cjs).
// Uso: SOLO_TEXTO=1 node el-salvador.cjs (0 €) · SOLO_VOZ=1 node el-salvador.cjs · WORK_BASE=E:/tmp-motor CACHE_PLANOS=E:/tmp-motor/cache-planos node el-salvador.cjs
const fs = require('fs'), { spawnSync } = require('child_process');
const { build, voice, vozEnCache } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const ROOT = 'C:/Users/User/Desktop/salma', ES = ROOT + '/salma marketing/el-salvador';
const FFM = ROOT + '/salma marketing/india/herramientas/node_modules/ffmpeg-static/ffmpeg.exe';
const textos = fs.readFileSync(ROOT + '/docs/el-salvador-guion-direccion.md', 'utf8').split(/\r?\n/)
  .filter(l => /^\*\*S[^*]*\*\* /.test(l)).map(l => l.replace(/^\*\*S[^*]*\*\* /, '').replace(/\*/g, '').trim());
if (textos.length !== 49) throw new Error('el guion tiene ' + textos.length + ' frases de Salma; esta configuración espera 49');
// Pronunciación (N8): mismo número de palabras que el texto; el subtítulo sigue bien escrito
const PR = [['Gould', 'Gúld'], ['Lauria-Santiago', 'Láuria-Santiago'], ['nantzin', 'nántsin'], ['yek peyna', 'yek péina']];
const voz = t => PR.reduce((s, [a, b]) => s.split(a).join(b), t);
module.exports = { textos, voz };
if (require.main !== module) return;

// ---------- imágenes ----------
const usados = new Set();
const uso = a => { if (usados.has(a)) throw new Error('imagen repetida (M3): ' + a); usados.add(a); return a; };
const ruta = n => { const c = [`${ES}/fotos/${n}.jpg`, `${ES}/fotos/${n}.png`, `${ES}/caratula/${n}.jpg`, `${ES}/hoja2/${n}.jpg`];
  const f = c.find(x => fs.existsSync(x)); if (!f && !process.env.SOLO_TEXTO) throw new Error('falta la foto ' + n); return f || c[0]; };
const aspecto = f => { if (process.env.SOLO_TEXTO) return 1.5; const r = spawnSync(FFM, ['-hide_banner', '-i', f], { encoding: 'utf8' }); const m = (r.stderr || '').match(/(\d{2,5})x(\d{2,5})/); return m ? m[1] / m[2] : 1.5; };
let panN = 0;
// M12 (Paco, 16 nov 2026): FOTOS QUIETAS, sin barridos ni Ken Burns. Las más estrechas que 16:9 llevan un encuadre FIJO a todo el ancho, con la cara dentro (v[0] = altura de la cara, mirada foto a foto)
// Encuadre mirado FOTO A FOTO (19 nov, tras Paco: «fotos cortadas»): posición vertical de la ventana 16:9 (0 = arriba, 1 = abajo) para que la cabeza entre entera
const Y = { AMA: 0, AMA2: 0.28, BUKELE4: 0.17, CORETO: 0.16, FUNES: 0.23, GRABA31: 0.5, GRABA53: 0.6, MARTI: 0.2, MARTINEZ: 0.28, SIXTA1: 0, anastacia: 0.05, 'bukele-1': 0.16, 'bukele-2': 0.23, 'bukele-3': 0.26, e: 0, elva: 0.05, f: 0.19, guadalupe: 0, l: 0.58, tacuba: 0.05,
  'QUIETO-hombre-sombrero': 0.2, 'QUIETO-abuela-2': 0.2, 'QUIETO-abuela-3': 0.2, 'QUIETO-abuela-sentada': 0.3 };
// M12 (Paco, 19 nov 2026: «movimiento suave»): las más estrechas que 16:9 se desplazan un poco (≈8 %) y TERMINAN en el encuadre de la cara; las horizontales, acercamiento lento (cfg.kb)
const F = (n, sc = 'GP', o = {}) => { const f = ruta(n), estrecha = aspecto(f) < 1.69; const y = o.y ?? Y[n] ?? 0.45, y0 = Math.min(1, y + 0.08);
  const { y: _, v: __, ...resto } = o; return { a: 'FILE:' + uso(f), sc, ...(estrecha && !o.pan ? { pan: [0.5, y0, 0.5, y], z: 0 } : {}), ...resto }; };
const BN = (n, sc = 'GP', o = {}) => F(n, sc, { look: 'trix', ...o }); // archivo histórico en blanco y negro (M4)
const durClip = f => { const r = spawnSync(FFM, ['-hide_banner', '-i', f], { encoding: 'utf8' }); const m = (r.stderr || '').match(/Duration: (\d+):(\d+):([\d.]+)/); return m ? +m[1] * 3600 + +m[2] * 60 + +m[3] : 5; };
const V = (n, sc = 'GP') => { const f = `${ES}/clips/${n}.mp4`; if (!fs.existsSync(f)) throw new Error('no existe el clip ' + n); return { a: 'FILE:' + uso(f), sc, cap: durClip(f) - 0.2 }; };
const MAPA = n => ({ a: 'FILE:' + uso(`${ES}/mapas/mapa-${n}.mp4`), sc: 'GP', cap: 5.3, fijo: 5.3 });
const CANTO = 'SFX_es-canto'; // sfx/es-canto.mp3 = clips/canto-audio.wav (el fondo no admite rutas FILE:)
const A = { VI: { src: 'SFX_viento-libre', db: -36 }, PAJ: { src: 'SFX_pajaros-libre', db: -36 }, NOCHE: { src: 'SFX_noche-calma', db: -34 }, CANTO: (ss, db = -16) => ({ src: CANTO, ss, db }) };
const tam = t => Math.min(200, Math.floor(1680 / (t.length * 0.56)));
const C = (word, text, sub = '', dur = 2) => ({ word, text, sub, dur, size: tam(text) });
const R74 = { CANTO25: 'ASAMBLEA LEGISLATIVA · 10 SEPT 2025', MEMORIA: 'NAHUIZALCO · MEMORIA DE 1932 · 2017' };

// [imágenes, opciones] por frase del guion (49). preg = la pregunta del bloque en grande (N13), como en Tuvalu.
const P = [
  /*0 gancho*/[[V('canto-ninas', 'PP')], { id: 'g0', amb: A.CANTO(4.4, -34), rotulo: R74.CANTO25 }],
  /*1*/[[V('canto-cerca-2', 'PM')], { id: 'g1', amb: A.CANTO(8.5, -34) }],
  /*2*/[[BN('AMA', 'PP'), F('elva', 'PP')], { id: 'g2', amb: A.VI, cifra: [C('1932', '1932', 'LA MATANZA', 1.8)] }],
  /*3*/[[F('bukele-2', 'PM'), V('bus', 'PM'), V('canto-ninos-3', 'GP')], { id: 'g3', amb: A.VI, cifra: [C('vez', 'PRIMERA VEZ', 'EL HIMNO EN NÁHUAT, EN LA ASAMBLEA', 2.2)] }],
  /*4*/[[F('bukele-3', 'PP')], { id: 'g4', amb: A.VI, pause: 0.8 }],
  /*5 1932*/[[BN('CAFE1927'), BN('CAFE2', 'PM')], { id: 'matanza', preg: ['¿QUÉ PASÓ EN 1932?'], amb: A.VI, rotulo: 'PLANTACIÓN DE CAFÉ · EL SALVADOR, 1927' }],
  /*6*/[[F('MAPA1932'), BN('IZALCO', 'PM')], { amb: A.NOCHE, cifra: [C('veintidós', '22 DE ENERO', '1932', 2)] }],
  /*7*/[[BN('MARTI', 'PP'), BN('AMA2', 'PP')], { amb: A.VI }],
  /*8*/[[V('velas-2'), V('ramas-2', 'PM')], { amb: A.VI, cifra: [C('Matanza', '«LA MATANZA»', '', 1.8)] }],
  /*9*/[[BN('MARTINEZ', 'PP'), F('tacuba', 'PM')], { amb: A.VI }],
  /*10*/[[BN('IZALCO2')], { amb: A.VI, pause: 1.2 }],
  /*11*/[[V('velas'), V('ofrenda', 'PM')], { amb: A.NOCHE, rotulo: R74.MEMORIA, cifra: [C('mil', '10.000-30.000', 'SEGÚN LOS HISTORIADORES', 2.4)], pause: 1.0 }],
  /*12 escondieron*/[[F('guadalupe', 'PP')], { id: 'escondieron', preg: ['¿POR QUÉ SE ESCONDIERON?'], amb: A.PAJ, rotulo: 'GUADALUPE ESTRADA · SONSONATE', pause: 0.8 }],
  /*13*/[[F('e', 'PM'), V('alfarera-2', 'GP')], { amb: A.PAJ, pause: 0.8 }],
  /*14*/[[F('h', 'PM'), V('alfarera', 'GP')], { amb: A.PAJ, pause: 0.8 }],
  /*15*/[[F('QUIETO-abuela-2', 'PP')], { amb: A.PAJ, pause: 1.2 }],
  /*16*/[[F('QUIETO-hombre-sombrero', 'PP')], { amb: A.PAJ, pause: 0.8 }],
  /*17*/[[F('anastacia', 'PP'), F('l', 'PM')], { amb: A.PAJ, rotulo: 'ANASTACIA LÓPEZ · SANTO DOMINGO DE GUZMÁN', cifra: [C('nueve', '9 AÑOS', 'EL CASTELLANO, DESPUÉS', 2)], pause: 0.8 }],
  /*18*/[[F('QUIETO-abuela-3', 'PP')], { amb: A.PAJ, pause: 1.0 }],
  /*19 país*/[[F('FUNES', 'PM'), V('fuego-3', 'GP')], { id: 'pais', preg: ['¿QUÉ HA HECHO EL PAÍS?'], amb: A.VI, cifra: [C('2010', 'PRIMER PERDÓN', '2010', 2)] }],
  /*20*/[[F('SALON2016')], { amb: A.VI, cifra: [C('frase', 'ARTÍCULO 63', 'CONSTITUCIÓN · 2014', 2.2)] }],
  /*21*/[[F('BUKELE4', 'PM'), BN('CRISTOS', 'GP', { look: 'portra' })], { amb: A.VI, cifra: [C('agosto', '9 DE AGOSTO', 'DÍA NACIONAL DE LOS PUEBLOS INDÍGENAS', 2.4)] }],
  /*22*/[[V('ninos-entran'), V('talpa')], { amb: A.VI, cifra: [C('siguiente', 'OTRA VEZ', 'ASAMBLEA LEGISLATIVA · 3 SEPT 2026', 2.4)] }],
  /*23*/[[F('j'), F('c', 'PM')], { amb: A.PAJ }],
  /*24*/[[F('d', 'PM')], { amb: A.PAJ, cifra: [C('mil', '68.148', '×5 DESDE 2007', 2.2)] }],
  /*25*/[[F('CORETO', 'PM')], { amb: A.PAJ, cifra: [C('cien', '1.135', 'HABLANTES · CENSO 2024', 2.2)] }],
  /*26*/[[F('GRABA07')], { amb: A.PAJ }],
  /*27*/[[V('ramas')], { amb: A.VI, pause: 0.5 }],
  /*28*/[[V('fuego-1'), V('olla-cerca', 'D'), V('fuego-2', 'PM')], { amb: A.NOCHE, cifra: [C('169', 'SIN LEY · SIN CONVENIO 169', '', 2.6)], pause: 1.0 }],
  /*29 cunas*/[[F('f', 'PP')], { id: 'cunas', preg: ['¿QUÉ PASÓ CON LAS CUNAS?'], amb: A.PAJ, rotulo: 'PAULA LÓPEZ · MAESTRA DE NÁHUAT · 1959-2016', pause: 0.8 }],
  /*30*/[[F('ELSA', 'PP')], { amb: A.PAJ, cifra: [C('nantzin', 'LAS ABUELAS MAESTRAS', '', 2)], pause: 0.8 }],
  /*31*/[[F('GRABA14')], { amb: A.PAJ, cifra: [C('seiscientos', '+600 NIÑOS', 'DESDE 2010', 2)] }],
  /*32*/[[F('QUIETO-abuela-sentada', 'PM')], { amb: A.PAJ }],
  /*33*/[[V('ollas')], { amb: A.PAJ, cifra: [C('cinco', '13 → 5', 'MAESTRAS', 2.2)], pause: 1.0 }],
  /*34*/[[V('barro-manos', 'PP')], { amb: A.PAJ, pause: 0.8 }],
  /*35 ayuda*/[[F('GRABA18'), F('GRABA48', 'PM')], { id: 'ayuda', preg: ['¿QUIÉN LES AYUDA A VOLVER?'], amb: A.PAJ }],
  /*36*/[[F('GRABA31', 'PM'), F('WIKI_TALLER', 'PM')], { amb: A.PAJ, cifra: [C('Wikipedia', 'WIKIPEDIA EN NÁHUAT', 'FEBRERO DE 2026', 2.2)] }],
  /*37*/[[F('NAHUI2')], { amb: A.PAJ, cifra: [C('diecisiete', '17 NIÑOS', 'DE 3 A 5 AÑOS', 2)] }],
  /*38*/[[MAPA('pamplona')], { amb: A.VI, pause: 0.5 }],
  /*39*/[[F('PAMPLONA')], { amb: A.VI }],
  /*40*/[[F('GRABA53', 'PM')], { amb: A.PAJ }],
  /*41 visitar*/[[F('RUTA')], { id: 'visitar', preg: ['¿SE PUEDE VISITAR?'], amb: A.PAJ }],
  /*42*/[[F('NAHUIZALCO')], { amb: A.PAJ, cifra: [C('veintidós', 'IZALCO · 22 DE ENERO', 'SE RECUERDA EL LEVANTAMIENTO', 2.2)] }],
  /*43*/[[F('SIXTA1', 'PP')], { amb: A.PAJ }],
  /*44 cierre*/[[V('canto-sala', 'PM')], { id: 'cierre', amb: A.CANTO(0, -32), pause: 0.8 }],
  /*45*/[[F('bukele-1', 'PM'), V('ninos-pasillo', 'GP'), V('talpa-2', 'PM')], { amb: A.VI, cifra: [C('1932', 'UNA PALABRA SOBRE 1932', '', 2.2)] }],
  /*46*/[[V('salon-azul-fuera')], { amb: A.VI, pause: 1.0 }],
  /*47*/[[F('GRABA38'), V('ninos-saludan', 'PM')], { amb: A.PAJ }],
  /*48*/[[V('manos-olla', 'PP')], { amb: A.PAJ }],
];
if (P.length !== textos.length) throw new Error('reparto de imágenes: ' + P.length + ' frente a ' + textos.length + ' frases');

// ---------- reparto por tiempo (copiado de tuvalu-preguntas.cjs) ----------
const limpia = w => w.replace(/[.,:;¿?¡!«»…]/g, '');
const reparto = (text, vz, al, shots) => { const D = al.en[al.en.length - 1] + 0.6, n = shots.length; if (n === 1) return shots.map(({ cap, fijo, ...s }) => s);
  const dur = shots.map(() => 0), libre = new Set(shots.map((_, i) => i)); let resto = D;
  for (;;) { const m = resto / libre.size, pasa = [...libre].filter(i => shots[i].fijo || (shots[i].cap || 99) < m); if (!pasa.length) { for (const i of libre) dur[i] = m; break; } for (const i of pasa) { dur[i] = shots[i].fijo || shots[i].cap; resto -= dur[i]; libre.delete(i); } if (!libre.size) break; }
  const words = text.split(' '), sp = vz.split(' '), posV = [], posT = []; let p = 0, pt = 0; for (let q = 0; q < words.length; q++) { posV.push(p); posT.push(pt); p += (sp[q] || '').length + 1; pt += words[q].length + 1; }
  const tw = q => al.st[Math.min(posV[q], al.st.length - 1)] + 0.3; const out = [shots[0]]; let t = 0, qPrev = 0;
  for (let j = 1; j < n; j++) { t += dur[j - 1]; let best = -1, bd = 1e9, bf = '';
    for (let q = qPrev + 1; q < words.length; q++) { const d = Math.abs(tw(q) - t); if (d >= bd) continue; let fr = ''; for (let k = 1; q + k <= words.length; k++) { fr = words.slice(q, q + k).join(' '); if (text.indexOf(fr) === posT[q]) break; fr = ''; } if (fr) { bd = d; best = q; bf = fr; } }
    if (best < 0) throw new Error('no puedo colocar el plano ' + j + ' de «' + text.slice(0, 30) + '»'); out[j] = { ...shots[j], from: bf }; qPrev = best; t = tw(best); }
  const fin = D - t, ult = shots[n - 1]; if (ult.cap && fin > ult.cap + 0.3) console.log(`⚠ el último plano de «${text.slice(0, 30)}…» pide ${fin.toFixed(1)} s y su recorte da ${ult.cap.toFixed(1)}`);
  return out.map(({ cap, fijo, ...s }) => s); };
let idn = 0;
const frase = (text, shots, o = {}, al) => { idn++; const words = text.split(/\s+/); const vz = voz(text); shots = reparto(text, vz, al, shots);
  const cifra = [...(o.preg ? [C(limpia(words[0]), o.preg[0], o.preg[1] || '', 1.6)] : []), ...(o.cifra || [])];
  return { id: o.id || 'f' + idn, who: 'salma', scene: !!o.preg || idn <= 5, sceneEnd: true, pause: o.pause ?? 0.3, amb: { ...(o.amb || A.VI), ss: o.amb?.ss ?? (idn % 4) * 2 }, text, ...(vz !== text ? { voz: vz } : {}), shots, ...(cifra.length ? { cifra } : {}), ...(o.rotulo ? { rotulo: o.rotulo } : {}), ...(o.look ? { look: o.look } : {}) }; };
const CAPIS = [['canto0', 'Del exterminio a cantar el himno'], ['matanza', '¿Qué pasó en 1932?'], ['escondieron', '¿Por qué se escondieron?'], ['pais', '¿Qué ha hecho el país?'], ['cunas', '¿Qué pasó con las Cunas Náhuat?'], ['ayuda', '¿Quién les ayuda a volver?'], ['visitar', '¿Se puede visitar?'], ['cierre', '¿Y con Bukele?']];

const nuevas = textos.filter(t => !vozEnCache(voz(t), SALMA_DOC));
console.log(`VOZ: ${textos.length} frases, ${textos.reduce((a, t) => a + voz(t).length, 0)} caracteres · por generar ${nuevas.length} frases, ${nuevas.reduce((a, t) => a + voz(t).length, 0)} caracteres`);
if (process.env.SOLO_TEXTO) process.exit(0);
if (process.env.SOLO_VOZ) { (async () => { let g = 0; for (const t of textos) g += (await voice(voz(t), SALMA_DOC)).chars; console.log('voz hecha · caracteres gastados ahora:', g); })().catch(e => { console.error('FALLO:', e.message); process.exit(1); }); return; }

// ---------- montaje ----------
// MÚSICA POR TRAMOS (S5): «Fading Shoreline», como en Tatuajes, Vietnam y Tuvalu. Sin música en el gancho (canto real), en lo humano (bloques 2 y 4, N14(4)) ni en los mapas (sintonía).
const VOZ = (de, a, ss, db = -10) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.4 }, ss, db, fi: 1.5, fo: 1.5, voz: 1 });
const musica = { src: 'SFX_fading-shoreline', ratio: 3, trozos: [VOZ('matanza', 'f9', 16), VOZ('pais', 'f29', 48), VOZ('ayuda', 'f43', 24), VOZ('f46', 'f49', 110, -8)] };
const blocks = [];
// Y10 / M10: pista .srt en inglés (una frase inglesa por cada frase española), aprobado el montaje v2 por Paco el 19 nov 2026
const EN = require('./el-salvador-en.json'); if (EN.length !== textos.length) throw new Error('el-salvador-en.json no tiene 49 entradas');
const cfg = {
  titulo: 'INDÍGENAS DE EL SALVADOR', formato: '16:9', id: 'el-salvador-v2', out: ES + '/salida', ultima: ES + '/ULTIMA', ultimaNombre: 'indigenas-de-el-salvador-del-exterminio-a-cantar-el-himno',
  look: 'portra', counter: 'EL SALVADOR', voices: { salma: SALMA_DOC }, musica, sintonia: { src: 'SFX_sintonia-pueblos', db: -8, dbVoz: -14, mapas: true }, rotuloSegs: 4,
  seguir: [{ en: 'g4', texto: 'Si te está gustando, suscríbete' }, { en: 'pais', texto: 'Hay más documentales: suscríbete' }, { en: 'visitar', texto: 'Guárdalo y compártelo' }],
  cardSecs: 8, kb: 0.8, voiceDb: { salma: -25 }, duckRatio: 5, gap: { same: 0.3, change: 0.6 },
  portada: { png: ES + '/caratula/ENTREGA/caratula-el-salvador-1920.png' }, // A4-fila, aprobada por Paco (19 nov, chat de Carátulas)
  descartes: { M12: 'Paco, 19 nov 2026: «movimiento suave» (M12 actualizada): acercamiento lento y desplazamiento corto que termina en la cara; el informe aún marca ❌ con kb > 0', M14: 'Paco no ha estado: sin «Basado en un viaje real» (F2)' },
  card: { l1: 'INDÍGENAS DE EL SALVADOR', l2: 'DEL EXTERMINIO AL HIMNO', l3: 'ÚNETE · SUSCRÍBETE', l4: '▼ Mira el vídeo relacionado', l5: 'Borrado del Mapa' },
  blocks,
};
(async () => {
  const frases = []; for (let i = 0; i < textos.length; i++) { const v = await voice(voz(textos[i]), SALMA_DOC); frases.push({ ...frase(textos[i], P[i][0], P[i][1], v.al), en: EN[i] }); }
  // gancho: 3,2 s del canto real antes de la primera frase (G1, M15: caras desde el fotograma 0); mapa del occidente tras el gancho (M40, S3)
  const canto0 = { id: 'canto0', video: `${ES}/clips/canto0-30.mp4`, fixed: 4.4, audioFile: `${ES}/clips/canto-audio.wav`, gainAudio: -4, amb: { ...A.VI, db: -60, ss: 0 } };
  const mapa = { id: 'mapa', video: `${ES}/mapas/mapa-occidente.mp4`, fixed: 5.5, amb: { ...A.VI, ss: 0 } };
  const iMat = frases.findIndex(b => b.id === 'matanza');
  const vozAbuela = { id: 'abuela', video: `${ES}/clips/abuela-voz-30.mp4`, fixed: 5.3, audioFile: `${ES}/clips/abuela-voz.wav`, gainAudio: 2, amb: { ...A.PAJ, db: -60, ss: 0 } };
  const iHab = frases.findIndex(b => b.text.startsWith('Hablarlo fuera de casa')); frases.splice(iHab + 1, 0, vozAbuela);
  blocks.push(canto0, ...frases.slice(0, iMat), mapa, ...frases.slice(iMat));
  blocks.push({ id: 'app', video: ROOT + '/salma marketing/pueblos/comun/clip-app-16x9.mp4', fixed: 5.9, amb: { ...A.PAJ, db: -40, ss: 0 } });
  console.log('PLANOS', blocks.reduce((a, b) => a + (b.shots || []).length, 0));
  await build(cfg);
  const t = JSON.parse(fs.readFileSync(`${ES}/salida/${cfg.id}-tiempos.json`, 'utf8')); const mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const lin = CAPIS.map(([id, ti], i) => `${i === 0 ? '0:00' : mm(t.find(x => x.id === id).t0)} ${ti}`); fs.writeFileSync(`${ES}/capitulos.txt`, lin.join('\n') + '\n'); console.log('CAPÍTULOS\n' + lin.join('\n'));
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
