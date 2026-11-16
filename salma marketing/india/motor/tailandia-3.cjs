// LARGO 16:9 «Una noche de MUAY THAI en TAILANDIA: así es por dentro» (encargo T3.3, 16 nov 2026; sale el jue 10 dic). Por preguntas (N13), con N14.
// El TEXTO sale tal cual de docs/tailandia-3-muay-thai-guion-n14.md (líneas **S:**, en orden; guion v3 aprobado por Paco 16 nov con Lina por su nombre y el Ram Muay corregido).
// Fotos: la noche de Lina en Phetch Buncha (cámara Canon, con permiso de Lina y su equipo), Koh Samui (móvil de Paco) y archivo de Wikimedia Commons (T3/archivo/creditos.json).
// Encuadre fijo 16:9 foto a foto y QUIETAS (M12; tailandia-largos/T3/preparar-fotos.cjs): el único movimiento es el énfasis en los datos. Clips: T3/cortar-clips.cjs. Mapa: mapa-tailandia.cjs samui (0 €).
// Uso: SOLO_TEXTO=1 node tailandia-3.cjs (comprueba reparto, sin gastar) | CACHE_PLANOS="E:/tmp-motor/cache-planos" WORK_BASE="E:/tmp-motor" node tailandia-3.cjs
const fs = require('fs');
const { build, vozEnCache, voice } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const ROOT = 'C:/Users/User/Desktop/salma', TL = ROOT + '/salma marketing/tailandia-largos', T3 = TL + '/T3';
const textos = fs.readFileSync(ROOT + '/docs/tailandia-3-muay-thai-guion-n14.md', 'utf8').split(/\r?\n/).filter(l => l.startsWith('**S:** ')).map(l => l.slice(7).trim());
if (textos.length !== 32) throw new Error('el guion tiene ' + textos.length + ' frases de Salma; esta configuración espera 32');
const usados = new Set();
const uso = a => { if (usados.has(a)) throw new Error('imagen repetida (M3): ' + a); usados.add(a); return a; };
const F = (id, sc = 'GP', o = {}) => { if (!fs.existsSync(`${T3}/fotos16/${id}.jpg`)) throw new Error('falta la foto ' + id); return { a: 'FILE:' + `${T3}/fotos16/${id}.jpg`, sc, ...o }; };
const E = { enfasis: true }; // N14 (10): zoom de énfasis, solo en los datos importantes
// Pronunciación (N8): el subtítulo sigue bien escrito
const PR = [['Wai Khru', 'Uái Kru'], ['Ram Muay', 'Ram Muái'], ['Muay Thai', 'Muai Tai'], ['Koh Samui', 'Ko Samúi'], ['Nai Khanom Tom', 'Nai Kanom Tom'], ['mongkhon', 'móngkon'], ['Rajadamnern', 'Ratchadamnén'], ['Phetch Buncha', 'Pech Búncha'], ['Chaweng', 'Cháueng'], ['bahts', 'bats']];
const voz = t => PR.reduce((s, [a, b]) => s.split(a).join(b), t);
// Sonido (S1): el gimnasio es sonido REAL del viaje (vídeo n.º 96, golpes en las manoplas); el resto, de banco (S4). No hay grabación del estadio de esa noche.
const A = { GYM: { src: 'SFX_th-gimnasio', db: -28 }, SALA: { src: 'SFX_sala-vacia-creada', db: -34 }, NOCHE: { src: 'SFX_noche-calma', db: -34 }, MAR: { src: 'SFX_olas-jeju', db: -32 }, CALLE: { src: 'SFX_th-ciudad', db: -32 } };
const C = (word, text, sub, dur = 2) => ({ word, text, sub, dur });
const CLIPS = Object.fromEntries(JSON.parse(fs.readFileSync(T3 + '/clips/clips.json', 'utf8')).map(k => [k.clip, k]));
const V = (n, sc = 'GP', o = {}) => { const k = CLIPS[n]; if (!k) throw new Error('no existe el clip ' + n); return { a: 'FILE:' + `${T3}/clips/${n}.mp4`, sc, cap: k.dura - 0.2, ...o }; };
const MAPA = n => ({ a: 'FILE:' + `${TL}/mapas/mapa-${n}.mp4`, sc: 'GP', cap: 5.3, fijo: 5.3 });
// Subtítulos EN (M10, Y10): una entrada por frase española (corte en . ? ! …), en el mismo orden que las líneas **S:** del guion.
const EN = [
  ['Minutes before she steps into the ring.', 'They wrap her hands.', 'Nobody speaks.'],
  ['Her name is Lina.', 'She is a professional fighter, she is German, and tonight she fights on an island in Thailand.', 'But before the first strike, she will perform the Wai Khru, an important ritual, in front of the whole stadium.'],
  ['This is what a Muay Thai fight night is like, from the inside.'],
  ['Fists, elbows, knees and legs.', 'That is why they call it the art of eight limbs.'],
  ['It was born as an art of war, among the soldiers of old Siam: hands wrapped in rope, no gloves and no rounds.', 'Today\'s rules, with gloves, rounds and a referee, arrived in the 1930s.'],
  ['But what almost nobody sees happens before, in the dressing room.'],
  ['This is almost never seen.'],
  ['A small room, with fans, shared with the other fighters of the night.'],
  ['First, the wraps: turn after turn, until the fist is a stone.', 'Then, an oil massage on the legs.'],
  ['And before going out, she and her trainer focus together, in silence.'],
  ['And in the ring, before the first strike…', 'the Wai Khru.'],
  ['She steps in with a band on her head, the mongkhon.', 'Her trainer puts it on her, and he will take it off before the fight.'],
  ['And then the Wai Khru begins: the salute to the teacher.'],
  ['She circles the ring, stopping at each corner, bows in the centre and honours her teachers, her parents and her ancestors.'],
  ['Then, the Ram Muay: a personal dance that also honours her teachers.', 'Its movements show who taught her and where she comes from.', 'Lina performed all of it, slowly.'],
  ['A few years ago, a woman could not have stepped into the great rings of Bangkok.'],
  ['The bad news: in Bangkok\'s two big stadiums, women were banned from the ring for decades.', 'It was not a law: it was tradition.'],
  ['The good news: at Rajadamnern, the first women\'s fight came in 2022.'],
  ['And that night, on Koh Samui, Lina was on the card.'],
  ['They will also tell you a story from 1767.', 'And it is not what it seems.'],
  ['A prisoner, Nai Khanom Tom, is said to have beaten ten Burmese fighters in a row and won his freedom.'],
  ['Historians consider it a legend, written much later.', 'But every March 17th, Thailand celebrates Muay Thai Day.'],
  ['And if you want to see it with your own eyes, this is what it costs.'],
  ['1,500 baht for a standard ticket; 2,000 ringside.', 'On resale websites, quite a lot more: buy on the stadium\'s website or at the box office.'],
  ['It is in Chaweng, on Koh Samui: Phetch Buncha stadium has fight nights on Mondays, Wednesdays and Saturdays, from nine.'],
  ['Six fights or more.', 'And it does not start on time.'],
  ['And once inside, three details that change everything.'],
  ['Arrive early and find a good spot facing the ring.'],
  ['During the Wai Khru, watch and stay quiet: it is a ritual.'],
  ['And learn a little of its history before you go.', 'It changes what you see.'],
  ['The bell rings.', 'Everything you have seen was half of the night.', 'The other half starts now.'],
  ['And if you want more Thailand, on this channel you have the north by motorbike and the ten things you should know before you go.'],
];
if (EN.length !== 32) throw new Error('faltan traducciones EN');
// [imágenes, opciones]. Tope ~3,5 s por imagen salvo «fijas»; desde = el plano entra al decir ese trozo (N7).
const P = [
  /*1 gancho*/[[F('K4045', 'PM'), F('K4029', 'D', { desde: 'Le vendan' }), F('K4063', 'PP', { desde: 'Nadie habla' })], { id: 'g0', amb: A.SALA, fijas: true, pause: 0.6 }],
  /*2*/[[F('K4037', 'PP'), F('S16', 'GP', { desde: 'en una isla' }), F('K4207', 'PM', { desde: 'Pero antes' }), F('K4221', 'GP', { desde: 'delante de todo' })], { amb: A.SALA, fijas: true }],
  /*3*/[[F('K4253')], { amb: A.NOCHE, cifra: [C('dentro', 'ANTES', 'DEL RING', 2.2)] }],
  /*4 qué es*/[[V('manoplas-a'), V('patada', 'PM', { desde: 'Por eso' })], { id: 'quees', preg: ['¿QUÉ ES EL MUAY THAI?'], amb: A.GYM, fijas: true, cifra: [C('ocho', '8', 'ARMAS', 2.2)] }],
  /*5*/[[F('H11'), F('H12', 'PM', { desde: 'manos vendadas' }), F('H12d', 'PP', { desde: 'sin guantes' }), F('H13', 'GP', { desde: 'Las reglas' })], { amb: A.NOCHE, fijas: true, cifra: [C('guerra', 'DE LA GUERRA', 'AL RING', 2.4)] }],
  /*6*/[[F('K4011', 'PM'), F('P4081', 'PM', { desde: 'en el vestuario' })], { amb: A.SALA, fijas: true }],
  /*7 vestuario*/[[F('K4031')], { id: 'vestuario', preg: ['¿QUÉ PASA EN EL VESTUARIO?'], amb: A.SALA, pause: 0.8 }],
  /*8*/[[F('K4039'), F('K4069', 'PM', { desde: 'compartida' })], { amb: A.SALA, fijas: true, pause: 0.6 }],
  /*9*/[[F('K4035', 'PM'), F('K4036', 'PP', { desde: 'vuelta a vuelta' }), F('K4013', 'PM', { desde: 'Después' })], { amb: A.SALA, fijas: true, pause: 0.6, cifra: [C('piedra', 'EL PUÑO,', 'UNA PIEDRA', 2.2)] }],
  /*10*/[[F('K4048', 'PM'), F('P4044', 'PP', { desde: 'se concentran' })], { amb: A.SALA, fijas: true, pause: 0.8 }],
  /*11*/[[F('K4206', 'PM'), F('K4218', 'GP', { desde: 'el Wai Khru' })], { amb: A.NOCHE, fijas: true }],
  /*12 wai khru*/[[F('K4212', 'PM'), F('P4041', 'PM', { desde: 'Se la pone' })], { id: 'waikhru', preg: ['¿QUÉ ES EL WAI KHRU?'], amb: A.NOCHE, fijas: true, cifra: [C('entrenador', 'SE LA PONE', 'SU ENTRENADOR', 2.2)] }],
  /*13*/[[F('K4221d'), F('K4231d', 'PM', { desde: 'el saludo' })], { amb: A.NOCHE, fijas: true }],
  /*14*/[[F('K4231'), F('K4228', 'GP', { desde: 'se inclina' }), F('K4233', 'PM', { desde: 'y honra' })], { amb: A.NOCHE, fijas: true }],
  /*15*/[[F('K4236'), F('K4238', 'GP', { desde: 'En sus movimientos' }), F('K4239', 'PM', { desde: 'quién le enseñó' }), F('K4245', 'PM', { desde: 'Lina lo hizo' })], { amb: A.NOCHE, fijas: true }],
  /*16*/[[F('H1')], { amb: A.CALLE, pause: 0.6 }],
  /*17 mujeres*/[[F('H10'), F('H2', 'GP', { desde: 'durante décadas' }), F('H13d', 'PM', { desde: 'No era una ley' })], { id: 'mujeres', preg: ['¿PELEAN MUJERES?'], amb: A.CALLE, fijas: true, cifra: [C('tradición', 'NO ERA LEY:', 'ERA COSTUMBRE', 2.4)] }],
  /*18*/[[F('K4265'), F('K4266', 'GP', { desde: 'llegó en' })], { amb: A.NOCHE, fijas: true, cifra: [C('veintidós', '2022', 'PRIMER COMBATE FEMENINO EN RAJADAMNERN', 2.6)] }],
  /*19*/[[F('S12'), F('K4269', 'GP', { desde: 'Lina estaba' })], { amb: A.MAR, fijas: true }],
  /*20*/[[F('H11d', 'PM'), F('H8d', 'GP', { desde: 'Y no es' })], { amb: A.NOCHE, fijas: true }],
  /*21 1767*/[[F('H8', 'GP'), V('manoplas-c', 'PM', { desde: 'y ganado' })], { id: 'leyenda', preg: ['¿ES VERDAD LO DE 1767?'], amb: A.NOCHE, fijas: true }],
  /*22*/[[F('H9', 'PM'), V('manoplas-b', 'GP', { desde: 'Pero cada' })], { amb: A.GYM, fijas: true, cifra: [C('leyenda', 'LEYENDA,', 'NO HISTORIA', 2.2)] }],
  /*23*/[[F('S15'), V('fas', 'PM', { desde: 'esto es' })], { amb: A.MAR, fijas: true }],
  /*24 dónde*/[[F('K4253d', 'PM', E), F('K4266d', 'PM', { desde: 'dos mil', ...E }), F('K4269d', 'PM', { desde: 'En las webs' })], { id: 'donde', preg: ['¿DÓNDE VERLO?'], amb: A.NOCHE, fijas: true, cifra: [C('normal', '1.500 BAHTS', 'ENTRADA NORMAL', 2.2), C('reventa', 'REVENTA:', 'MÁS CARO', 2.2)] }],
  /*25*/[[MAPA('samui'), F('K4265d', 'PM', { desde: 'desde las nueve' })], { amb: A.MAR, fijas: true, cifra: [C('nueve', 'CONFÍRMALO', 'ANTES DE IR', 2.4)] }],
  /*26*/[[F('K4245d', 'PM', E)], { amb: A.NOCHE }],
  /*27*/[[F('K4239d', 'PP')], { amb: A.NOCHE }],
  /*28 comportarse*/[[F('K4236d', 'PM')], { id: 'comportarse', preg: ['¿CÓMO COMPORTARSE?'], amb: A.NOCHE }],
  /*29*/[[F('K4212d', 'PP')], { amb: A.NOCHE, pause: 0.8, cifra: [C('calla', 'SILENCIO', '', 2)] }],
  /*30*/[[F('K4238d', 'PM'), F('S13', 'GP', { desde: 'Cambia lo que' })], { amb: A.MAR, fijas: true }],
  /*31 cierre*/[[F('K4253w'), F('K4269w', 'GP', { desde: 'Todo lo que' })], { id: 'cierre', amb: A.NOCHE, fijas: true, pause: 0.8 }],
  /*32*/[[F('S29'), F('S49', 'GP', { desde: 'y las diez' })], { amb: A.MAR, fijas: true, pause: 1.0 }],
];
if (P.length !== textos.length) throw new Error('reparto de imágenes: ' + P.length + ' frente a ' + textos.length + ' frases');
let idn = 0;
const limpia = w => w.replace(/[.,:;¿?¡!«»]/g, '');
// Reparto de planos por tiempo (M2), igual que en tailandia-1.cjs
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
  for (const s of shots) if (s.desde && !text.includes(s.desde)) throw new Error(`«${s.desde}» no está en la frase ${idn}: ${text.slice(0, 40)}`);
  if (al && !o.fijas) { const D = al.en[al.en.length - 1] + 0.6, n = Math.max(1, Math.min(shots.length, Math.ceil(D / 3.5))); shots = shots.slice(0, n); } // tope ~3,5 s por imagen
  shots.forEach(x => uso(x.a.replace(/^FILE:/, ''))); shots = al ? reparto(text, vz, al, shots) : shots.map(({ cap, fijo, ...s }) => s);
  { const p0 = P[idn - 1][0]; if (al && p0.length === 1 && p0[0].cap && al.en[al.en.length - 1] + 0.6 > p0[0].cap + 0.3) console.log(`⚠ el plano único de «${text.slice(0, 30)}…» pide ${(al.en[al.en.length - 1] + 0.6).toFixed(1)} s y su clip da ${p0[0].cap.toFixed(1)}`); }
  shots = shots.map(({ desde, ...x }) => (desde ? { ...x, from: desde } : x));
  for (const c of o.cifra || []) if (!words.some(w => limpia(w) === c.word)) throw new Error(`la cifra «${c.text}» busca «${c.word}» y no está en: ${text.slice(0, 40)}`);
  const cifra = [...(o.preg ? [C(limpia(words[0]), o.preg[0], o.preg[1] || '', 1.6)] : []), ...(o.cifra || [])];
  return { id: o.id || 'f' + idn, who: 'salma', scene: !!o.preg || idn <= 2, sceneEnd: true, pause: o.pause ?? 0.3, amb: { ...(o.amb || A.VI), ss: (idn % 4) * 2 }, text, ...(vz !== text ? { voz: vz } : {}), shots, ...(cifra.length ? { cifra } : {}), en: EN[idn - 1] }; };
const CAPIS = [['g0', 'Una noche de Muay Thai, por dentro'], ['quees', '¿Qué es el Muay Thai?'], ['vestuario', '¿Qué pasa en el vestuario?'], ['waikhru', '¿Qué es el Wai Khru? El mongkhon y el Ram Muay'], ['mujeres', '¿Pelean mujeres?'], ['leyenda', '¿Es verdad lo de 1767?'], ['donde', '¿Dónde verlo y cuánto cuesta?'], ['comportarse', '¿Cómo comportarse?']];
const nuevas = textos.filter(t => !vozEnCache(voz(t), SALMA_DOC));
console.log(`VOZ: ${textos.length} frases, ${textos.reduce((a, t) => a + voz(t).length, 0)} caracteres · por generar ${nuevas.length} frases, ${nuevas.reduce((a, t) => a + voz(t).length, 0)} caracteres`);
if (process.env.SOLO_TEXTO) { P.forEach((p, i) => frase(textos[i], p[0], p[1])); console.log('reparto y desde: bien'); process.exit(0); }
const blocks = [];
blocks.push({ id: 'app', video: ROOT + '/salma marketing/pueblos/comun/clip-app-16x9.mp4', fixed: 5.9, amb: { ...A.MAR, db: -40, ss: 0 } });
// MÚSICA POR TRAMOS (S5): música ORIGINAL de estilo Muay Thai (síntesis propia, editor/ep1/mkmusic_mt.cjs: oboe tipo pi, tambores y címbalo; no copia ninguna pieza).
// Sin música en el vestuario (guion: «más despacio, casi sin música»): solo en el gancho, el ritual del ring, dónde verlo y el cierre.
const VOZ = (de, a, ss, db = -14) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.4 }, ss, db, fi: 1.5, fo: 1.5, voz: 1 });
const musica = { src: 'SFX_muaythai-original', ratio: 3, trozos: [VOZ('g0', 'f3', 0), VOZ('waikhru', 'f15', 20), VOZ('donde', 'f27', 44), VOZ('cierre', 'f32', 60), { de: { b: 'app' }, a: { b: 'app', finB: 1, off: 0.3 }, ss: 70, db: -12, fi: 1, fo: 1.2 }] };
const cfg = {
  titulo: 'TAILANDIA · UNA NOCHE DE MUAY THAI', formato: '16:9', id: 'tailandia-3-final', out: T3 + '/salida', ultima: T3 + '/ULTIMA', ultimaNombre: 'muay-thai-tailandia-koh-samui-una-noche-por-dentro', fotosSerie: T3 + '/fotos16',
  look: 'vision3', counter: 'TAILANDIA', voices: { salma: SALMA_DOC }, musica, sintonia: { src: 'SFX_sintonia-pueblos', db: -8, dbVoz: -14, mapas: true }, rotuloSegs: 4,
  seguir: [{ en: 'f8', texto: 'Si te está gustando, suscríbete' }, { en: 'f18', texto: 'Hay más documentales: suscríbete' }, { en: 'f29', texto: 'Guárdalo y compártelo' }],
  cardSecs: 8, voiceDb: { salma: -25 }, duckRatio: 5, gap: { same: 0.3, change: 0.6 },
  portada: { png: TL + '/caratulas-y18/ENTREGA/T3.3-muay-thai-caratula-1920.png' }, // carátula aprobada por Paco (16 nov): Lina de rodillas en el Wai Khru, «El RITUAL»
  
  card: { l1: 'TAILANDIA', l2: 'UNA NOCHE DE MUAY THAI', l3: 'Basado en un viaje real', l4: 'ÚNETE · SUSCRÍBETE', l5: 'Borrado del Mapa' },
  blocks,
};
(async () => {
  const frases = []; for (let i = 0; i < textos.length; i++) { const v = await voice(voz(textos[i]), SALMA_DOC); frases.push(frase(textos[i], P[i][0], P[i][1], v.al)); }
  blocks.unshift(...frases);
  console.log('PLANOS', blocks.reduce((a, b) => a + (b.shots || []).length, 0));
  await build(cfg);
  const t = JSON.parse(fs.readFileSync(`${T3}/salida/${cfg.id}-tiempos.json`, 'utf8')); const mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const lin = CAPIS.map(([id, ti], i) => `${i === 0 ? '0:00' : mm(t.find(x => x.id === id).t0)} ${ti}`); fs.writeFileSync(`${T3}/capitulos.txt`, lin.join('\n') + '\n'); console.log('CAPÍTULOS\n' + lin.join('\n'));
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
