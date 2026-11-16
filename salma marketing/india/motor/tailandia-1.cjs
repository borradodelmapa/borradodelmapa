// LARGO 16:9 «Tailandia 1 · qué saber antes de ir» (encargo T3.1, 14 nov 2026; sale el mar 1 dic). Por preguntas (N13), viaje real de Paco contado por Salma (N12).
// Mismo método que tuvalu-preguntas.cjs: el TEXTO sale tal cual de docs/tailandia-1-preguntas-guion.md (líneas **S:**, en orden; guion v5 aprobado por Paco). Aquí solo van las imágenes.
// Fotos: las del viaje de Paco (móvil y cámara), copiadas a tailandia-largos/T1/fotos por preparar-fotos.cjs y revisadas una a una. Mapas: mapa-tailandia.cjs (0 €).
// Portada PROVISIONAL (las carátulas están en pausa: la definitiva la pasa el chat de Carátulas y se cambia cfg.portada).
// Uso: SOLO_TEXTO=1 node tailandia-1.cjs (letras, sin gastar) | WORK_BASE="E:/tmp-motor" node tailandia-1.cjs
const fs = require('fs');
const { build, vozEnCache, voice } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const ROOT = 'C:/Users/User/Desktop/salma', TL = ROOT + '/salma marketing/tailandia-largos', T1 = TL + '/T1';
const textos = fs.readFileSync(ROOT + '/docs/tailandia-1-guion-v6-3.md', 'utf8').split('## CIERRE')[0].split(/\r?\n/).filter(l => l.startsWith('**S:** ')).map(l => l.slice(7).replace(/\s*\((?:[A-Z](?:, )?)+\)\s*$/, '').trim());
if (textos.length !== 35) throw new Error('el guion tiene ' + textos.length + ' frases de Salma; esta configuración espera 35');
const usados = new Set();
const uso = a => { if (usados.has(a)) throw new Error('imagen repetida (M3): ' + a); usados.add(a); return a; };
// M12: en 16:9 la pantalla siempre llena. Toda foto más estrecha que 16:9 se recorre de arriba abajo (pan, z 0). PANV = inicio y fin mirados foto a foto (se empieza por la cara o por lo que importa).
const APT = Object.fromEntries(JSON.parse(fs.readFileSync(T1 + '/aptas.json', 'utf8')).map(a => [a.id, a]));
const PANV = { 1: [0.15, 0.45], 2: [0.1, 0.55], 61: [0.1, 0.5], 15: [0.05, 0.55], 71: [0.25, 0.55], 79: [0.2, 0.45], 81: [0.2, 0.6], 103: [0.1, 0.5], 113: [0.35, 0.7], 44: [0.3, 0.7], 88: [0.3, 0.7], 86: [0.15, 0.6], 43: [0.1, 0.6], 105: [0.1, 0.6], 114: [0.1, 0.6] };
let panN = 0;
const W = (n, sc = 'GP', o = {}) => { if (!process.env.SOLO_TEXTO && !fs.existsSync(`${T1}/fotos16/W${n}.jpg`)) throw new Error('falta la foto W' + n);
  const a = APT['W' + n], estrecha = a && a.w / a.h < 1.69, v = PANV[n] || (panN++ % 2 ? [0.65, 0.35] : [0.35, 0.65]);
  return { a: 'W' + n, sc, ...o }; }; // sin paneos (Paco, 15 nov): las fotos van ya encuadradas a 16:9 en T1/fotos16 (recorte16.cjs)
// Pronunciación (N8): el subtítulo sigue bien escrito
const PR = [['Chiang Mai', 'Chiang Mái'], ['Chiang Rai', 'Chiang Rái'], ['Doi Inthanon', 'Doi Intanón'], ['Mae Hong Son', 'Mae Jong Son'], ['Koh Samui', 'Ko Samúi'], ['Wai Khru', 'Uái Kru'], ['bahts', 'bats'], ['tuk-tuk', 'tuk tuk'], ['Elephant Nature Park', 'Élefant Néichur Park'], ['Grab', 'Grab']];
const voz = t => PR.reduce((s, [a, b]) => s.split(a).join(b), t);
const A = { MOTO: { src: 'SFX_th-moto', db: -30 }, CIUDAD: { src: 'SFX_th-ciudad', db: -30 }, AGUA: { src: 'SFX_th-cascada', db: -30 }, OLAS: { src: 'SFX_olas-jeju', db: -34 }, VI: { src: 'SFX_viento-libre', db: -36 }, PAJ: { src: 'SFX_pajaros-libre', db: -36 }, CALLE: { src: 'SFX_calle-madrugada', db: -34 }, MOTOFUERTE: { src: 'SFX_th-moto', db: -20 }, CALLE2: { src: 'SFX_th-calle', db: -26 } }; // MOTOFUERTE: las curvas, sin música y con la moto real arriba; CALLE2: la calle peatonal real (vídeo n.º 134) // MOTO, CIUDAD y AGUA = sonido REAL de los vídeos del viaje (S1); el resto, de banco donde no hay propio (S4)
const C = (word, text, sub, dur = 2) => ({ word, text, sub, dur });
// Clips de VÍDEO del viaje (T1/clips, cortar-clips.cjs): vistos enteros, a 16:9, sin su sonido (el ambiente real va aparte: th-*.mp3)
const CLIPS = Object.fromEntries(JSON.parse(fs.readFileSync(T1 + '/clips/clips.json', 'utf8')).map(k => [k.clip, k]));
const V = (n, sc = 'GP', o = {}) => { const k = CLIPS[n]; if (!k) throw new Error('no existe el clip ' + n); return { a: 'FILE:' + `${T1}/clips/${n}.mp4`, sc, cap: k.dura - 0.2, ...o }; };
const MAPA = n => ({ a: 'FILE:' + `${TL}/mapas/mapa-${n}.mp4`, sc: 'GP', cap: 5.3, fijo: 5.3 });
// [imágenes candidatas, opciones]. Cada frase usa tantas como pida su duración para que ninguna imagen pase de ~3,5 s (nota de Paco, 15 nov: «corte en cada punto»);
// las primeras de la lista son las imprescindibles. Z = acercamiento rápido de énfasis en las advertencias (nota de Paco). desde = el plano entra al decir ese trozo (N7).
const Z = { z: 0.14, zfijo: true, dir: 'in' };
const P = [
  /*0 gancho*/[[W(1, 'PP'), V('calle-noche', 'GP', { desde: 'la marihuana' }), W(53, 'PM', { desde: 'y el norte' })], { id: 'g0', amb: A.CALLE2, fijas: true }],
  /*1*/[[W(2, 'PM'), V('carretera-a'), W(113), W(42, 'GP'), V('mercado-noche')], { id: 'g1', amb: A.MOTO, pause: 0.6, cifra: [C('Diez', '10 RESPUESTAS', 'RÁPIDAS Y REALES', 2)] }],
  /*2 visado*/[[W(8, 'PM'), W(9, 'GP', Z), W(10, 'PM'), W(11)], { id: 'visado', preg: ['¿NECESITO VISADO?'], amb: A.VI, cifra: [C('treinta', 'DESDE SEPTIEMBRE', '30 DÍAS SIN VISADO', 2.4)] }],
  /*3*/[[W(12), W(13, 'PM'), W(14)], { amb: A.CIUDAD, cifra: [C('tres', 'TARJETA DIGITAL', '3 DÍAS ANTES DE LLEGAR', 2.4)] }],
  /*4*/[[W(15, 'PP', Z), W(7)], { amb: A.CIUDAD, cifra: [C('quinientos', '500 BAHTS', 'POR CADA DÍA DE MÁS', 2.2)] }],
  /*5*/[[W(17, 'PM')], { amb: A.VI }],
  /*6 cuándo*/[[W(16), W(19, 'PM'), W(21), W(51, 'PM')], { id: 'cuando', preg: ['¿CUÁNDO IR?'], amb: A.OLAS, cifra: [C('noviembre', 'NOV-FEB', 'SECO Y FRESCO', 2.2)] }],
  /*7*/[[W(22), W(23, 'PM'), W(24), W(25, 'PM')], { amb: A.VI, cifra: [C('diciembre', 'NORTE', 'MEJOR NOV-DIC', 2.2)] }],
  /*8*/[[V('mercado-noche')], { amb: A.CIUDAD }],
  /*9 seguro*/[[MAPA('zonas'), W(26, 'PM'), W(27)], { id: 'seguro', preg: ['¿ES SEGURO?'], amb: A.VI, fijas: true }],
  /*10*/[[V('carretera-b'), W(28), W(30, 'D'), W(33, 'PM'), W(34, 'PP')], { amb: A.CIUDAD, cifra: [C('carretera', 'EN CARRETERA', 'CON CALMA', 2.2)], rotulo: 'POLICÍA TURÍSTICA · 1155' }],
  /*11*/[[W(39, 'PM')], { amb: A.CIUDAD }],
  /*12 cuánto*/[[V('avenida'), W(5, 'PM', Z), W(4)], { id: 'cuesta', preg: ['¿CUÁNTO CUESTA?'], amb: A.CIUDAD, cifra: [C('treinta', 'CAMIONETA ROJA', 'UNOS 30 BAHTS', 2.2)] }],
  /*13*/[[V('cascada'), W(41, 'PM', Z), W(43), W(102, 'PM')], { amb: A.AGUA, cifra: [C('trescientos', 'DOI INTHANON', '300 BAHTS', 2), C('doscientos', 'TEMPLO BLANCO', '200 BAHTS', 2)] }],
  /*14 moverse*/[[W(45, 'PM'), W(100), V('foso'), W(47, 'PM')], { id: 'muevo', preg: ['¿CÓMO ME MUEVO?'], amb: A.CIUDAD, cifra: [C('veinticinco', '25 MINUTOS', 'EL CENTRO, A PIE', 2.2)] }],
  /*15*/[[W(50), W(52, 'PM')], { amb: A.OLAS, cifra: [C('chalecos', 'FERRIS', 'MIRA EL CHALECO', 2)] }],
  /*16*/[[W(54, 'PM')], { amb: A.CIUDAD }],
  /*17 moto*/[[W(55, 'PP'), W(56, 'PM'), W(57)], { id: 'moto', preg: ['¿ALQUILO MOTO?'], amb: A.CIUDAD, cifra: [C('coche', 'CARNÉ DE COCHE', 'NO VALE PARA MOTO', 2.4)] }],
  /*18*/[[W(29)], { amb: A.MOTO }],
  /*19*/[[W(58, 'PM'), W(59), W(60, 'PM')], { amb: A.CIUDAD, cifra: [C('fotos', 'FOTOS A LA MOTO', 'ANTES DE SALIR', 2.2)] }],
  /*20 curvas*/[[MAPA('norte'), V('carretera-c'), W(61, 'PM'), W(63), W(64, 'PM')], { amb: A.MOTOFUERTE, fijas: true, cifra: [C('setecientas', '762 CURVAS', 'HASTA PAI', 2), C('ochocientas', '1.864 CURVAS', 'EL BUCLE DE MAE HONG SON', 2.4)] }],
  /*21*/[[W(62, 'PM')], { amb: A.CIUDAD }],
  /*22 no hacer*/[[W(66), W(67, 'PM', Z)], { id: 'nohacer', preg: ['¿QUÉ NO HACER?'], amb: A.CIUDAD, cifra: [C('multa', 'VAPEAR', 'HASTA 1.000 €', 2.2)] }],
  /*23*/[[W(70), W(71, 'PM', { desde: 'tiendas en cada esquina' }), W(99), W(69, 'PM')], { amb: A.CALLE2, cifra: [C('receta', 'TIENDAS SÍ', 'CALLE NO', 2.4)] }],
  /*24 kayán*/[[W(75), W(76, 'PM'), W(78), W(79, 'PM', { desde: 'Yo fui por mi cuenta' }), W(77, 'GP', { desde: 'Si vas con agencia' })], { amb: A.PAJ, pause: 1.2, cifra: [C('kayán', 'SU NOMBRE ES KAYÁN', '', 2.6)] }],
  /*25*/[[V('elefante'), W(81, 'PP'), W(82, 'PM'), W(83)], { amb: A.PAJ, pause: 1.0, cifra: [C('montan', 'ELEFANTES', 'SIN MONTAR', 2.2)] }],
  /*26*/[[W(85, 'PM')], { amb: A.PAJ }],
  /*27 vacunas*/[[W(86), W(87, 'PM'), W(48)], { id: 'vacunas', preg: ['¿VACUNAS?'], amb: A.PAJ, cifra: [C('ninguna', 'OBLIGATORIAS', 'NINGUNA', 2.2)] }],
  /*28*/[[W(20), W(93, 'PM'), W(92)], { amb: A.AGUA, cifra: [C('Seguridad', 'LLEVA SEGURO', 'DE VIAJE', 2)] }],
  /*29 dinero*/[[W(38, 'PM'), W(118, 'GP', { desde: 'Si te despistas', ...Z })], { id: 'dinero', preg: ['¿Y EL DINERO?'], amb: A.CIUDAD, fijas: true, cifra: [C('billetes', '1.º BILLETES', '2.º TARJETA', 2.6)] }],
  /*30*/[[W(32), W(101, 'PM')], { amb: A.CIUDAD, cifra: [C('efectivo', 'DISCOTECAS', 'SOLO EFECTIVO', 2.2)] }],
  /*31*/[[V('lago')], { amb: A.PAJ }],
  /*32 norte o islas*/[[W(18, 'PM', { desde: 'Chiang Mai, fundada' }), W(105, 'GP', { desde: 'el templo blanco' }), W(103, 'PM', { desde: 'y el Triángulo' }), W(104, 'GP', { desde: 'donde se tocan' })], { id: 'norteislas', preg: ['¿NORTE O ISLAS?'], amb: A.PAJ, fijas: true }],
  /*33*/[[W(106), W(116, 'PM'), W(107), W(108, 'PM')], { amb: A.OLAS, cifra: [C('Khru', 'WAI KHRU', 'EL SALUDO AL MAESTRO', 2.4)] }],
  /*34*/[[W(111, 'PM'), W(112)], { id: 'cierre', amb: A.PAJ, cifra: [C('ocho', '8 Y 10 DIC', 'EL NORTE EN MOTO · MUAY THAI', 3)], pause: 1.0 }],
];
if (P.length !== textos.length) throw new Error('reparto de imágenes: ' + P.length + ' frente a ' + textos.length + ' frases');
let idn = 0;
const limpia = w => w.replace(/[.,:;¿?¡!«»]/g, '');
// Reparto de planos por tiempo (M2), igual que en tuvalu-preguntas.cjs: con los tiempos reales de la voz, los planos de una frase duran lo mismo; los mapas, lo suyo (fijo).
const reparto = (text, vz, al, shots) => { const D = al.en[al.en.length - 1] + 0.6, n = shots.length; if (n === 1) return shots.map(({ cap, fijo, ...s }) => s);
  const dur = shots.map(() => 0), libre = new Set(shots.map((_, i) => i)); let resto = D;
  for (;;) { const m = resto / libre.size, pasa = [...libre].filter(i => shots[i].fijo || (shots[i].cap || 99) < m); if (!pasa.length) { for (const i of libre) dur[i] = m; break; } for (const i of pasa) { dur[i] = shots[i].fijo || shots[i].cap; resto -= dur[i]; libre.delete(i); } if (!libre.size) break; }
  const words = text.split(' '), sp = vz.split(' '), posV = [], posT = []; let p = 0, pt = 0; for (let q = 0; q < words.length; q++) { posV.push(p); posT.push(pt); p += (sp[q] || '').length + 1; pt += words[q].length + 1; }
  const tw = q => al.st[Math.min(posV[q], al.st.length - 1)] + 0.3; const out = [shots[0]]; let t = 0, qPrev = 0;
  for (let j = 1; j < n; j++) { t += dur[j - 1]; let best = -1, bd = 1e9, bf = '';
    for (let q = qPrev + 1; q < words.length; q++) { const d = Math.abs(tw(q) - t); if (d >= bd) continue; let fr = ''; for (let k = 1; q + k <= words.length; k++) { fr = words.slice(q, q + k).join(' '); if (text.indexOf(fr) === posT[q]) break; fr = ''; } if (fr) { bd = d; best = q; bf = fr; } }
    if (best < 0) throw new Error('no puedo colocar el plano ' + j + ' de «' + text.slice(0, 30) + '»'); out[j] = { ...shots[j], from: bf }; qPrev = best; t = tw(best); }
  return out.map(({ cap, fijo, ...s }) => s); };
const frase = (text, shots, o = {}, al) => { idn++; const words = text.split(/\s+/); const vz = voz(text);
  if (al && !o.fijas) { const D = al.en[al.en.length - 1] + 0.6, n = Math.max(1, Math.min(shots.length, Math.ceil(D / 3.5))); shots = shots.slice(0, n); } // tope ~3,5 s por imagen
  shots.forEach(x => uso(x.a.replace(/^FILE:/, ''))); shots = al ? reparto(text, vz, al, shots) : shots.map(({ cap, fijo, ...s }) => s);
  { const p0 = P[idn - 1][0]; if (al && p0.length === 1 && p0[0].cap && al.en[al.en.length - 1] + 0.6 > p0[0].cap + 0.3) console.log(`⚠ el plano único de «${text.slice(0, 30)}…» pide ${(al.en[al.en.length - 1] + 0.6).toFixed(1)} s y su clip da ${p0[0].cap.toFixed(1)}`); }
  shots = shots.map(({ desde, ...x }) => (desde ? { ...x, from: desde } : x)); // desde = el plano entra justo al decir ese trozo (N7), en vez del reparto por tiempo
  const cifra = [...(o.preg ? [C(limpia(words[0]), o.preg[0], o.preg[1] || '', 1.6)] : []), ...(o.cifra || [])];
  return { id: o.id || 'f' + idn, who: 'salma', scene: !!o.preg || idn <= 2, sceneEnd: true, pause: o.pause ?? 0.3, amb: { ...(o.amb || A.VI), ss: (idn % 4) * 2 }, text, ...(vz !== text ? { voz: vz } : {}), shots, ...(cifra.length ? { cifra } : {}), ...(o.rotulo ? { rotulo: o.rotulo } : {}) }; };
const CAPIS = [['g0', 'Moto, marihuana y cajeros'], ['visado', '¿Necesito visado?'], ['cuando', '¿Cuándo ir?'], ['seguro', '¿Es seguro?'], ['cuesta', '¿Cuánto cuesta?'], ['muevo', '¿Cómo me muevo?'], ['moto', '¿Puedo alquilar una moto?'], ['nohacer', '¿Qué no debo hacer?'], ['vacunas', 'Vacunas, agua y seguro'], ['dinero', 'Dinero y cajeros'], ['norteislas', '¿Norte o islas?']];
const nuevas = textos.filter(t => !vozEnCache(voz(t), SALMA_DOC));
console.log(`VOZ: ${textos.length} frases, ${textos.reduce((a, t) => a + voz(t).length, 0)} caracteres · por generar ${nuevas.length} frases, ${nuevas.reduce((a, t) => a + voz(t).length, 0)} caracteres`);
if (process.env.SOLO_TEXTO) process.exit(0);
const blocks = [];
blocks.push({ id: 'app', video: ROOT + '/salma marketing/pueblos/comun/clip-app-16x9.mp4', fixed: 5.9, amb: { ...A.PAJ, db: -40, ss: 0 } });
// MÚSICA POR TRAMOS (S5): «Fading Shoreline», la aprobada por Paco de oído; bajo la voz solo la parte sin melodía. Sin música en los mapas (sintonía), ni en los kayán.
const VOZ = (de, a, ss, db = -10) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.4 }, ss, db, fi: 1.5, fo: 1.5, voz: 1 });
const musica = { src: 'SFX_fading-shoreline', ratio: 3, trozos: [VOZ('g0', 'g1', 16), VOZ('cuesta', 'f17', 48), VOZ('vacunas', 'f32', 24), VOZ('norteislas', 'cierre', 66), { de: { b: 'app' }, a: { b: 'app', finB: 1, off: 0.3 }, ss: 150, db: -10, fi: 1, fo: 1.2 }] };
const cfg = {
  titulo: 'TAILANDIA · ANTES DE IR', formato: '16:9', id: 'tailandia-1-v12', out: T1 + '/salida', ultima: T1 + '/ULTIMA', ultimaNombre: 'tailandia-que-saber-antes-de-ir', fotosSerie: T1 + '/fotos16',
  look: 'portra', counter: 'TAILANDIA', voices: { salma: SALMA_DOC }, musica, sintonia: { src: 'SFX_sintonia-pueblos', db: -8, dbVoz: -14, mapas: true }, rotuloSegs: 4,
  seguir: [{ en: 'visado', texto: 'Si te está gustando, suscríbete' }, { en: 'moto', texto: 'Hay más documentales: suscríbete' }, { en: 'norteislas', texto: 'Guárdalo y compártelo' }],
  cardSecs: 8, kb: 0.35, voiceDb: { salma: -25 }, duckRatio: 5, gap: { same: 0.3, change: 0.6 },
  portada: { png: TL + '/caratulas-y18/ENTREGA/T3.1-que-saber-antes-de-ir-caratula-1920.png' }, // carátula aprobada por Paco (15 nov): el ojo del elefante, «Antes de IR»
  descartes: { M10: 'borrador: los subtítulos EN se hacen cuando Paco apruebe el montaje (Y10)', N5: 'falso aviso: la «aplicación» es Grab (pedir coche), no nuestra app; guion v6.2 aprobado por Paco' },
  card: { l1: 'TAILANDIA', l2: 'ANTES DE IR', l3: 'Basado en un viaje real', l4: 'ÚNETE · SUSCRÍBETE', l5: 'Borrado del Mapa' },
  blocks,
};
(async () => {
  const frases = []; for (let i = 0; i < textos.length; i++) { const v = await voice(voz(textos[i]), SALMA_DOC); frases.push(frase(textos[i], P[i][0], P[i][1], v.al)); }
  blocks.unshift(...frases);
  console.log('PLANOS', blocks.reduce((a, b) => a + (b.shots || []).length, 0));
  await build(cfg);
  const t = JSON.parse(fs.readFileSync(`${T1}/salida/${cfg.id}-tiempos.json`, 'utf8')); const mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const lin = CAPIS.map(([id, ti], i) => `${i === 0 ? '0:00' : mm(t.find(x => x.id === id).t0)} ${ti}`); fs.writeFileSync(`${T1}/capitulos.txt`, lin.join('\n') + '\n'); console.log('CAPÍTULOS\n' + lin.join('\n'));
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
