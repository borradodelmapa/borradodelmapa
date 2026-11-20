// V2 (20 nov 2026, 🎬 Vídeo, Paco: «Sí, reedítalo»): el mismo short remontado con las reglas de hoy, misma voz (0 €). Original: india-3-lugares.cjs.
// SHORT VERTICAL «India: 3 lugares sagrados y un consejo en cada uno» (11 nov 2026, encargo de Paco al chat de Estrategia).
// Crónica (N12): gancho del hotel para morir (el mismo del largo de Vídeo, hace de anzuelo), Rishikesh, Dharamsala, Benarés con la frase de Twain
// repartida (su nombre va en la descripción), Sarnath como cierre abierto. Datos: los ya comprobados en docs/india-cronica-guion.md.
// Material: vídeos del móvil (V), fotos Sony (S) y clips de monos hechos con IA (RW900x: MARCAR COMO IA al publicar). No toca nada de Vídeo.
const fs = require('fs');
const { build } = require('./motor.cjs');
const { SALMA } = require('./voces.cjs');
const R = 'C:/Users/User/Desktop/salma/salma marketing', O = R + '/india/corto-3-lugares';
fs.mkdirSync(O, { recursive: true });
const RIO = { src: 'V33', db: -30 }, MONJES = { src: 'V09', db: -30 }, GHAT = { src: 'V57', db: -31 }, CALMA = { src: 'V45', db: -30 };
let n = 0;
const S = (text, shots, o = {}) => { n++; const mk = { emocion: o.emocion, ...(o.pico ? { pico: true } : {}), ...(o.datoFuerte ? { datoFuerte: true } : {}), ...(o.humano ? { humano: true } : {}), ...(o.cambioTono ? { cambioTono: true } : {}) }; const w = text.split(/\s+/); shots = shots.map((s, j) => j && !s.from ? { ...s, from: w[Math.round(j / shots.length * w.length)].replace(/[.,:;¿?¡!«»]/g, '') } : s);
  return { id: o.id || 'f' + n, who: 'salma', scene: true, sceneEnd: true, pause: o.pause ?? 0.22, amb: { ...(o.amb || RIO), ss: o.ass ?? 1 }, text, en: o.en || [''], shots, ...mk, ...(o.advertencia ? { advertencia: true } : {}), ...(o.cifra ? { cifra: o.cifra } : {}), ...(o.rotulo ? { rotulo: o.rotulo } : {}) }; };
const C = (word, text, sub, dur = 2) => ({ word, text, sub, dur });
const P = (a, sc = 'GP', ss = 0, x = {}) => ({ a, sc, ss, ...x });

const blocks = [
  S('En Benarés hay un hotel donde no se viene a dormir. Se viene a morir.',
    [P('RW416', 'PM', 0, { cara: [0.48, 0.15] }), P('RW546', 'GP', 0, { from: 'Se' })], { id: 'g0', amb: GHAT, emocion: 'fria', en: ['In Varanasi there is a hotel where you do not come to sleep.', 'You come to die.'] }),
  S('Tres lugares sagrados del norte de la India. Y un consejo en cada uno.',
    [P('FILE:' + O + '/clips/mapa-india3.mp4', 'GP')], { id: 'g1', amb: GHAT, ass: 8, emocion: 'calida', en: ['Three sacred places in northern India.', 'And one tip for each.'] }),
  S('Rishikesh. El Ganges recién bajado del Himalaya. Yoga al amanecer.',
    [P('V31', 'GP', 6), P('S404', 'PM', 0, { from: 'Yoga' })], { id: 'r1', rotulo: 'RISHIKESH', emocion: 'calida', en: ['Rishikesh.', 'The Ganges, fresh down from the Himalayas.', 'Yoga at sunrise.'] }),
  S('Y los monos tienen mala leche de verdad. No los molestes, ni les des de comer: aquí sigue habiendo rabia.',
    [P('RW9001', 'PP'), P('V36', 'PM', 2, { from: 'No' }), P('RW9002', 'PP', 0, { from: 'aquí' })], { id: 'r2', ass: 4, emocion: 'calida', advertencia: true, en: ['And the monkeys really are bad-tempered.', 'Do not bother them or feed them: rabies is still around here.'], cifra: [C('sigue', 'RABIA', 'NO LOS MOLESTES', 0.9)] }),
  S('Dharamsala. Ruedas de oración, monjes de granate.',
    [P('V02', 'PP', 2), P('V09', 'PM', 6, { from: 'monjes' })], { id: 'd1', amb: MONJES, rotulo: 'DHARAMSALA', emocion: 'calida', en: ['Dharamsala.', 'Prayer wheels, monks in maroon.'] }),
  S('Aquí vive el Dalái Lama, en el exilio. Yo lo vi enseñar. Es gratis: te inscribes con el pasaporte.',
    [P('S152', 'PM'), P('S153', 'GP', 0, { from: 'Yo' }), P('S154', 'PM', 0, { from: 'Es' })], { id: 'd2', amb: MONJES, ass: 12, emocion: 'calida', en: ['The Dalai Lama lives here, in exile.', 'I saw him teach.', 'It is free: you sign up with your passport.'], cifra: [C('gratis', 'GRATIS', 'CON EL PASAPORTE', 2)] }),
  S('Benarés. Más vieja que la historia. Miles de lámparas sobre el río. Más vieja que la tradición. Bodas en las escaleras. Más vieja incluso que la leyenda.',
    [P('S494', 'GP'), P('V56', 'GP', 4, { from: 'Miles', asombro: true }), P('V74', 'PM', 2, { from: 'Bodas' }), P('S544', 'GP', 0, { from: 'incluso' })], { id: 'b1', amb: GHAT, ass: 15, rotulo: 'BENARÉS', emocion: 'calida', en: ['Varanasi.', 'Older than history.', 'Thousands of lamps on the river.', 'Older than tradition.', 'Weddings on the steps.', 'Older even than legend.'] }),
  S('Y el fuego. Los crematorios se miran desde la barca, en silencio. Y ni una foto.',
    [P('S546', 'GP'), P('V41', 'PM', 4, { from: 'desde' }), P('S552', 'GP', 0, { from: 'ni' })], { id: 'b2', amb: GHAT, ass: 25, emocion: 'fria', advertencia: true, en: ['And the fire.', 'The cremation grounds are watched from a boat, in silence.', 'And not a single photo.'], pico: true, datoFuerte: true, humano: true, cambioTono: true, pause: 0.35, cifra: [C('foto', 'SIN FOTOS', 'EN LOS CREMATORIOS', 2)] }),
  S('A diez kilómetros, Buda dio su primer sermón. Pero esa es otra historia.',
    [P('V44', 'GP', 4), P('V46', 'PM', 2, { from: 'Pero' })], { id: 's1', amb: CALMA, pause: 0.35, rotulo: 'SARNATH', emocion: 'calida', en: ['Ten kilometres away, the Buddha gave his first sermon.', 'But that is another story.'] }),
  { id: 'silencio', video: O + '/clips/v46-cierre-09.mp4', fixed: 0.9, amb: { ...CALMA, ss: 7 } }, // M43: instante sin voz antes de la tarjeta · M16: shorts sin clip de la app
];
const VOZ = (de, a, ss, db = -12) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.6 }, ss, db, fi: 1.2, fo: 1.5, voz: 1 });
const musica = { src: 'SFX_fading-shoreline', ratio: 3, trozos: [VOZ('g0', 'b1', 20), VOZ('s1', 's1', 60)] } // N14-4: sin música en el fuego (b2);
fs.writeFileSync(O + '/guion.txt', blocks.filter(b => b.who).map(b => b.text).join('\n') + '\n');
console.log('VOZ: ' + blocks.filter(b => b.who).reduce((a, b) => a + b.text.length, 0) + ' caracteres');
if (process.env.SOLO_TEXTO) process.exit(0);
const cfg = {
  titulo: 'INDIA: 3 LUGARES SAGRADOS', id: 'india-3-lugares-v2', nombre: ['Benarés'], out: O + '/salida', ultima: O + '/ULTIMA', ultimaNombre: 'india-3-lugares-sagrados',
  look: 'portra', counter: 'INDIA', voices: { salma: SALMA }, musica,
  portada: { foto: 'S546', foco: [0.5, 0.5, 1], l1: 'INDIA', l2: '3 LUGARES SAGRADOS', tag: 'BORRADO DEL MAPA' },
  cardSecs: 3.0, cardP1: 3.0, kb: 1.0, humanoExtra: 0, seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 16.5 }, duckRatio: 5, gap: { same: 0.2, change: 0.4 }, voiceDb: { salma: -25 },
  card: process.env.TIKTOK ? { l1: 'LA INDIA, EN CRÓNICA', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'LA INDIA, EN CRÓNICA', l2: 'SUSCRÍBETE AL CANAL', l3: '▼  Mira el vídeo relacionado', l4: '', l5: '' }, // M14
  descartes: { N10: 'excepción de Paco solo para este short: ≈65 s, «dejalo no pasa nada por esta vez» (chat de Vídeo, 20 nov 2026)', M16: 'M16 (18 nov): shorts sin clip de la app' },
  blocks,
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
