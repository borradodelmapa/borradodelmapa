// V3 (20 nov 2026, 🎬 Vídeo, Paco: «Guion y voz nuevos»): guion de dirección docs/india-3-lugares-guion-direccion.md (F3). Voz NUEVA de Salma (704 caracteres).
// Cambios: apertura distinta del largo (G3), bucle del hotel cerrado con Mukti Bhawan y pregunta que contesta el largo (N16, N27), preguntas en pantalla (N13),
// crematorio solo de lejos salvo RW546 en el gancho (excepción de Paco: se ven cuerpos amortajados de lejos), monos recreados RW9001 y RW9002 (Paco) y fotos reales de Paco (M75, M78), Dharamsala y Benarés con plano de situación (M40), plano de asombro M100 (M24). Sin Sarnath.
// Material: V vídeos del móvil, S fotos Sony, M fotos del móvil (todo de Paco, 2019); RW = clips hechos con IA a partir de sus fotos (RW416, RW546, RW598, RW9001, RW9002: marcar IA al publicar, P1).
const fs = require('fs');
const { build } = require('./motor.cjs');
const { SALMA } = require('./voces.cjs');
const R = 'C:/Users/User/Desktop/salma/salma marketing', O = R + '/india/corto-3-lugares';
fs.mkdirSync(O, { recursive: true });
const RIO = { src: 'V33', db: -30 }, MONJES = { src: 'V09', db: -30 }, GHAT = { src: 'V57', db: -31 }, CALMA = { src: 'V45', db: -30 };
let n = 0;
const S = (text, shots, o = {}) => { n++; const mk = { emocion: o.emocion, ...(o.pico ? { pico: true } : {}), ...(o.datoFuerte ? { datoFuerte: true } : {}), ...(o.humano ? { humano: true } : {}), ...(o.cambioTono ? { cambioTono: true } : {}) }; const w = text.split(/\s+/); shots = shots.map((s, j) => j && !s.from ? { ...s, from: w[Math.round(j / shots.length * w.length)].replace(/[.,:;¿?¡!«»]/g, '') } : s);
  return { id: o.id || 'f' + n, who: 'salma', scene: true, sceneEnd: true, pause: o.pause ?? 0.22, amb: { ...(o.amb || RIO), ss: o.ass ?? 1 }, text, en: o.en || [''], shots, ...mk, ...(o.advertencia ? { advertencia: true } : {}), ...(o.sub ? { subPartes: o.sub } : {}), ...(o.cifra ? { cifra: o.cifra } : {}), ...(o.rotulo ? { rotulo: o.rotulo } : {}) }; };
const C = (word, text, sub, dur = 2) => ({ word, text, sub, dur });
const P = (a, sc = 'GP', ss = 0, x = {}) => ({ a, sc, ss, ...x });
const Q = (word, text, sub, dur = 1.6) => ({ word, text, sub, dur, retraso: 0.1, size: 190 }); // M10: 190 para dejar 100 px de margen // N13: la pregunta en pantalla al entrar el bloque

const blocks = [
  S('Hay un hotel en Benarés donde te dan unas dos semanas para morir.',
    [P('S558', 'PM'), P('RW546', 'GP', 0, { from: 'dos' })], { id: 'g0', sub: [["Hay un hotel en Benarés","donde te dan"],["unas dos semanas","para morir."]], amb: GHAT, emocion: 'fria',
    en: ['There is a hotel in Varanasi where they give you about two weeks to die.'] }),
  S('Tres lugares sagrados, un consejo en cada uno.',
    [P('FILE:' + O + '/clips/mapa-india3.mp4', 'GP')], { id: 'g1', sub: [["Tres lugares sagrados,"],["un consejo en cada uno."]], amb: GHAT, ass: 8, emocion: 'calida', en: ['Three sacred places, one tip for each.'] }),
  S('Rishikesh. Aquí, la primera lección te la da un mono.',
    [P('V31', 'GP', 6), P('RW416', 'PM', 0, { from: 'Aquí', cara: [0.48, 0.15] }), P('M75', 'PM', 0, { from: 'la', pan: [0.45, 0.5, 0.45, 0.5], z: 0.3 })], { id: 'r1', sub: [["Rishikesh."],["Aquí, la primera lección","te la da un mono."]], rotulo: 'RISHIKESH', emocion: 'calida', en: ['Rishikesh.', 'Here, your first lesson comes from a monkey.'] }),
  S('Si llevas un plátano, viene a por él. No les des de comer: hay rabia.',
    [P('RW9001', 'PM', 0, { rotulo: 'RECREACIÓN' }), P('FILE:' + O + '/clips/rw9002-sin-bandas.mp4', 'PM', 0, { from: 'No', rotulo: 'RECREACIÓN' }), P('M78', 'PM', 0, { from: 'hay' })], { id: 'r2', sub: [["Si llevas un plátano,","viene a por él."],["No les des de comer:","hay rabia."]], ass: 4, emocion: 'calida', advertencia: true,
    cifra: [Q('Si', '¿COMIDA?', 'A LOS MONOS')],
    en: ['If you carry a banana, it comes for it.', 'Do not feed them: there is rabies.'] }),
  S('Dharamsala. Aquí vive en el exilio el Dalái Lama, y en sus enseñanzas puedes verlo.',
    [P('V06', 'GP', 2, { rotulo: 'DHARAMSALA' }), P('S152', 'PM', 0, { from: 'Aquí' }), P('S154', 'PM', 0, { from: 'sus', pan: [0.5, 0.22, 0.5, 0.28], z: 0.15 })], { id: 'd1', sub: [["Dharamsala."],["Aquí vive en el exilio","el Dalái Lama,"],["y en sus enseñanzas","puedes verlo."]], amb: MONJES, emocion: 'calida',
    cifra: [Q('Dharamsala', '¿VERLO?', 'AL DALÁI LAMA', 1.0)],
    en: ['Dharamsala.', 'The Dalai Lama lives here in exile, and you can see him at his teachings.'] }),
  S('Yo lo vi con pase de prensa. Tú te registras con el pasaporte, y dentro, ni cámara ni móvil.',
    [P('S153', 'GP'), P('V06', 'GP', 6, { from: 'Tú' }), P('V05', 'PM', 2, { from: 'dentro' })], { id: 'd2', sub: [["Yo lo vi","con pase de prensa."],["Tú te registras","con el pasaporte,"],["y dentro,","ni cámara ni móvil."]], amb: MONJES, ass: 12, emocion: 'calida',
    cifra: [{ ...C('pasaporte', '10 RUPIAS', 'LA INSCRIPCIÓN · DATO DE 2024', 1.6), size: 190 }],
    en: ['I saw him with a press pass.', 'You register with your passport, and inside, no camera and no phone.'] }),
  S('Benarés, la ciudad de ese hotel. Más vieja que la historia, más vieja que la tradición, más vieja incluso que la leyenda.',
    [P('S494', 'GP', 0, { rotulo: 'BENARÉS' }), P('RW598', 'GP', 0, { from: 'Más' }), P('M100', 'GP', 0, { from: 'más', asombro: true })], { id: 'b1', sub: [["Benarés,","la ciudad de ese hotel."],["Más vieja","que la historia,"],["más vieja","que la tradición,"],["más vieja incluso","que la leyenda."]], amb: GHAT, ass: 15, emocion: 'calida',
    en: ['Varanasi, the city of that hotel.', 'Older than history, older than tradition, older even than legend.'] }),
  S('Las cremaciones las miras desde la barca, en silencio. Fotos de cuerpos, ninguna.',
    [P('S536', 'GP'), P('S542', 'GP', 0, { from: 'desde' }), P('S523', 'PM', 0, { from: 'Fotos', pan: [0.5, 0.0, 0.5, 0.04], z: 0.04 })], { id: 'b2', sub: [["Las cremaciones las miras","desde la barca,"],["en silencio."],["Fotos de cuerpos,","ninguna."]], amb: GHAT, ass: 25, emocion: 'fria', pico: true, datoFuerte: true, humano: true, cambioTono: true, advertencia: true, pause: 0.3,
    cifra: [Q('Las', '¿VERLAS?', 'LAS CREMACIONES'), { ...C('cuerpos', 'RESPETO', 'ES UN FUNERAL', 1.2), y: 640 }],
    en: ['You watch the cremations from the boat, in silence.', 'Photos of bodies: none.'] }),
  S('Ese hotel se llama Mukti Bhawan. ¿Por qué vienen a morir aquí? Te lo cuento en el vídeo largo.',
    [P('M112', 'GP'), P('S559', 'GP', 0, { from: 'Por' }), P('S560', 'GP', 0, { from: 'Te' })], { id: 's1', sub: [["Ese hotel se llama","Mukti Bhawan."],["¿Por qué vienen","a morir aquí?"],["Te lo cuento","en el vídeo largo."]], amb: GHAT, ass: 30, pause: 0.3, emocion: 'calida',
    en: ['That hotel is called Mukti Bhawan.', 'Why do people come to die right here?', 'I tell you in the long video.'] }),
  { id: 'silencio', video: O + '/clips/s560-cierre-09.mp4', fixed: 0.9, amb: { ...GHAT, ss: 40 } }, // M43 · M16: sin clip de la app
];
const VOZ = (de, a, ss, db = -12) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.6 }, ss, db, fi: 1.2, fo: 1.5, voz: 1 });
const musica = { src: 'SFX_bosque-invierno', ratio: 3, trozos: [VOZ('g1', 'b1', 2), VOZ('s1', 's1', 42)] } // S10: fading-shoreline ya suena el 24 (mlabri) y el 26 (shompen); Paco eligió esta de oído («Ok», 21 nov); // N14-4: sin música en las cremaciones (b2)
fs.writeFileSync(O + '/guion-v3.txt', blocks.filter(b => b.who).map(b => b.text).join('\n') + '\n');
console.log('VOZ: ' + blocks.filter(b => b.who).reduce((a, b) => a + b.text.length, 0) + ' caracteres');
if (process.env.SOLO_TEXTO) process.exit(0);
const TT = !!process.env.TIKTOK;
const cfg = {
  titulo: 'INDIA: 3 LUGARES SAGRADOS', id: 'india-3-lugares-v3', nombre: ['Benarés'], fecha: '2026-11-25', fechaTikTok: '2026-11-25', // mié 25 nov 10:00, el primero del día (Paco, 20 nov)
  out: O + '/salida', ultima: O + (TT ? '/ULTIMA-tiktok' : '/ULTIMA'), ultimaNombre: 'benares-hotel-donde-vienen-a-morir',
  look: 'portra', counter: 'INDIA', voices: { salma: SALMA }, sintonia: { src: 'SFX_sintonia-pueblos', db: -8 }, musica, portada: { png: O + '/caratula/benares-558.png' }, // Y18 · Y22: barquero de Benarés mirando a cámara · sintonía: Paco, 20 nov, «¿y qué pasa con el sonido del batok en el final?» (S3: el final, con su golpe, bajo la tarjeta)
  cardSecs: 4.0, cardP1: 2.2, // Paco, 20 nov: «me falta el último fotograma recomendando la app… solo el último fotograma» (2.ª parte de la tarjeta: CREA TUS RUTAS CONMIGO · app · borradodelmapa.com)
  kb: 1.0, humanoExtra: 0, seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 20.5 }, duckRatio: 5, gap: { same: 0.2, change: 0.4 }, voiceDb: { salma: -25 },
  card: TT ? { l1: 'LA INDIA, EN CRÓNICA', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'LA INDIA, EN CRÓNICA', l2: 'SUSCRÍBETE AL CANAL', l3: '▼  Mira el vídeo relacionado', l4: '', l5: '' }, // M14 · relacionado: «Así es la INDIA: donde se viene a morir» (04Ibzy_MxQQ)
  descartes: { M16: 'M16 (18 nov): shorts sin clip de la app', M10: 'subtítulos EN aparte (Y10)' },
  blocks,
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
