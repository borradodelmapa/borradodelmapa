// PUEBLOS BORRADOS DEL MAPA · Ep.1 «WHANG-OD» — configuración (30 oct 2026). Guion: docs/pueblos-ep1-whang-od-guion-direccion.md
// Narra solo Salma (Paco no ha estado: sin «Basado en un viaje real»). Fotos: Wikimedia Commons (pueblos/whang-od/fotos/ATRIBUCIONES.txt);
// las que no son la elegida por Paco (W39, gancho) son PROVISIONALES para que Paco las cambie en el editor.
// Sonido: viento y pájaros con licencia libre (pueblos/comun/sonidos/creditos.txt) + golpecitos creados; nada se presenta como sonido real de Buscalan (S4).
// Mapa: mapa-whang-od.cjs (0 €). Clip de la app: pueblos/comun/clip-app.mp4 (capturas de Google Play, M16).
const fs = require('fs');
const { build } = require('./motor.cjs');
const { SALMA } = require('./voces.cjs');
const P = 'C:/Users/User/Desktop/salma/salma marketing/pueblos';
const B = P + '/whang-od';
const f = id => { const g = `${B}/fotos/${id}-g.jpg`; return 'FILE:' + (fs.existsSync(g) ? g : `${B}/fotos/${id}.jpg`); };
// ambiente: copias en motor/sfx (el motor arma el nombre del .wav temporal con el id y no admite rutas FILE:)
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const PAJAROS = (db, ss = 0) => ({ src: 'SFX_pajaros-libre', ss, db });
const GOLPES = (db, ss = 0) => ({ src: 'SFX_golpecitos-creados', ss, db });
const cfg = {
  titulo: 'WHANG-OD · PUEBLOS BORRADOS DEL MAPA',
  id: 'pueblos-ep1-whang-od-v2',
  out: B + '/salida',
  look: 'portra', counter: 'PUEBLOS BORRADOS · 1',
  portada: { foto: f('W39'), foco: [0.72, 0.4, 0.85], l1: 'WHANG-OD', l2: 'TATÚA CON MÁS DE 100 AÑOS', tag: 'PUEBLOS BORRADOS DEL MAPA · FILIPINAS' },
  voices: { salma: SALMA },
  cardSecs: 8, kb: 1.6, seguir: { activo: true, texto: 'Si te está gustando, sígueme' }, duckRatio: 5, gap: { same: 0.4, change: 0.85 }, voiceDb: { salma: -25 },
  card: { l1: 'WHANG-OD', l2: 'PUEBLOS BORRADOS DEL MAPA', l3: 'Kalinga · Filipinas', l4: 'PRÓXIMO EPISODIO', l5: 'Las haenyeo de Jeju' },
  blocks: [
    // 0 · GANCHO — foto elegida por Paco (W39)
    { id: 'gancho', who: 'salma', scene: true, sceneEnd: true, minD: 5, pause: 0.5, amb: GOLPES(-30),
      text: 'Tiene más de cien años. Y sigue tatuando… con una espina.', en: ['She is over a hundred years old.', 'And she still tattoos… with a thorn.'],
      cifra: { word: 'cien', text: '+100', sub: 'AÑOS', dur: 2.2 },
      shots: [{ a: f('W39'), sc: 'PP', cx: 0.72, foc: [0.72, 0.4], ok: 'elegida por Paco' }] },
    // 1 · SITUAR
    { id: 'mapa', video: B + '/mapa-whang-od.mp4', fixed: 5.5, amb: VIENTO(-34) },
    { id: 'situar', who: 'salma', scene: true, sceneEnd: true, pause: 0.5, rotulo: 'BUSCALAN · TINGLAYAN', amb: PAJAROS(-30),
      text: 'Buscalan, en las montañas de Kalinga. A unas quince horas de Manila.', en: ['Buscalan, in the mountains of Kalinga.', 'About fifteen hours from Manila.'],
      shots: [{ a: f('W42'), sc: 'GP' }] },
    // 2 · QUIÉN ES
    { id: 'quien', who: 'salma', scene: true, sceneEnd: true, pause: 1.5, amb: PAJAROS(-32, 8),
      text: 'Se llama Whang-Od. Su edad exacta no la sabe nadie, ni ella: entre 107 y 109 años.', voz: 'Se llama Uang-Od. Su edad exacta no la sabe nadie, ni ella: entre 107 y 109 años.',
      en: ['Her name is Whang-Od.', 'No one knows her exact age, not even her: between 107 and 109.'],
      cifra: { word: '107', text: '107-109', sub: 'AÑOS', dur: 2.4 },
      shots: [{ a: f('W27'), sc: 'PM', cx: 0.4 }, { a: f('W24'), sc: 'PP', cx: 0.62, from: 'Su edad' }] },
    // 3 · EL BATOK (~30 s: aviso de seguir)
    { id: 'batok', who: 'salma', scene: true, sceneEnd: true, pause: 2.0, amb: GOLPES(-26, 3),
      text: 'La técnica se llama batok: una espina, una varilla de bambú y hollín. Golpe a golpe.', voz: 'La técnica se llama batók: una espina, una varilla de bambú y hollín. Golpe a golpe.',
      en: ['The technique is called batok: a thorn, a bamboo stick and soot.', 'Tap by tap.'],
      shots: [{ a: f('W05'), sc: 'PM', cx: 0.3 }, { a: f('W11'), sc: 'D', from: 'una' }, { a: f('W23'), sc: 'PP', from: 'Golpe' }] },
    // 4 · PARA QUÉ ERA — Tri-X B/N
    { id: 'antes', who: 'salma', scene: true, pause: 0.5, look: 'trix', amb: VIENTO(-36, 10),
      text: 'Antes, el tatuaje se ganaba. A los guerreros, por su valor. A las mujeres, por belleza.', en: ['Once, a tattoo had to be earned.', 'Warriors, for their courage. Women, for beauty.'],
      shots: [{ a: f('H01'), sc: 'PM', ok: 'Dean C. Worcester, 1906, dominio público' }, { a: f('W38'), sc: 'PP', from: 'A las mujeres' }] },
    { id: 'prohibicion', who: 'salma', sceneEnd: true, pause: 0.8, look: 'trix', rotulo: 'PRINCIPIOS DEL S. XX', amb: VIENTO(-36, 18),
      text: 'A principios del siglo XX, la administración estadounidense prohibió la caza de cabezas.', voz: 'A principios del siglo veinte, la administración estadounidense prohibió la caza de cabezas.',
      en: ['In the early 20th century, the American administration banned headhunting.'],
      shots: [{ a: f('W53'), sc: 'GP' }] },
    // 5 · LA FAMA
    { id: 'fama', who: 'salma', scene: true, pause: 0.5, amb: PAJAROS(-32, 15),
      text: 'Un documental en 2009 la hizo famosa. Hoy suben visitantes cada día a tatuarse con ella.', en: ['A 2009 documentary made her famous.', 'Today visitors climb up every day to be tattooed by her.'],
      shots: [{ a: f('W07'), sc: 'PM', cx: 0.35 }, { a: f('W25'), sc: 'D', from: 'Hoy' }] },
    { id: 'vogue', who: 'salma', sceneEnd: true, pause: 0.8, amb: PAJAROS(-34, 20),
      text: 'En 2023, con 106 años, fue portada de Vogue. Nadie mayor lo había sido.', en: ['In 2023, at 106, she was on the cover of Vogue.', 'No one older ever had been.'],
      cifra: { word: '106', text: '106', sub: 'PORTADA DE VOGUE · 2023', dur: 2.6 },
      shots: [{ a: f('W21'), sc: 'PP', cx: 0.6 }] },
    // 6 · EL RELEVO — el pico
    { id: 'sangre', who: 'salma', scene: true, pause: 0.6, amb: VIENTO(-34, 25),
      text: 'El batok solo se hereda por sangre. Y ella no tuvo hijos.', voz: 'El batók solo se hereda por sangre. Y ella no tuvo hijos.',
      en: ['Batok can only be inherited by blood.', 'And she never had children.'],
      shots: [{ a: f('W04'), sc: 'GP', cx: 0.4 }] },
    { id: 'relevo', who: 'salma', sceneEnd: true, pause: 2.5, amb: VIENTO(-34, 32),
      text: 'Lo ha enseñado a su sobrina nieta, Grace Palicas, y a una prima de ella. Su firma son tres puntos: ella y sus dos aprendices.',
      en: ['She has taught it to her grandniece, Grace Palicas, and to a cousin of hers.', 'Her signature is three dots: herself and her two apprentices.'],
      cifra: { word: 'tres', text: '• • •', sub: 'ELLA Y SUS DOS APRENDICES', dur: 3 },
      shots: [{ a: f('W94'), sc: 'PM', cx: 0.4 }, { a: f('W08'), sc: 'D', from: 'Su firma' }] },
    // 7 · LO QUE SE PIERDE — cierre con dato (N6)
    { id: 'cantos', who: 'salma', scene: true, pause: 0.6, amb: VIENTO(-32, 40),
      text: 'Antes, cada tatuaje iba con un canto. A los turistas ya no se lo canta: es para las mujeres y los guerreros kalinga.',
      en: ['Once, every tattoo came with a chant.', 'She no longer sings it for tourists: it belongs to Kalinga women and warriors.'],
      shots: [{ a: f('W55'), sc: 'GP' }, { a: f('W64'), sc: 'PP', from: 'para' }] },
    { id: 'nadie', who: 'salma', sceneEnd: true, pause: 1.2, amb: VIENTO(-32, 48),
      text: 'Y esos cantos, avisa la antropóloga Analyn Salvador-Amores, no los ha aprendido nadie.',
      en: ['And those chants, warns anthropologist Analyn Salvador-Amores, no one has learned.'],
      shots: [{ a: f('W84'), sc: 'GP' }, { a: f('W43'), sc: 'PP', cx: 0.5, from: 'no' }] },
    // 8 · CÓMO IR + clip común de la app (M16)
    { id: 'como-ir', who: 'salma', scene: true, sceneEnd: true, pause: 0.6, rotulo: 'GUÍA LOCAL OBLIGATORIA · 1,5 H A PIE', amb: PAJAROS(-30, 25),
      text: 'Se sube con guía local: hora y media a pie desde la carretera.', en: ['You go up with a local guide: an hour and a half on foot from the road.'],
      shots: [{ a: f('W48'), sc: 'GP' }, { a: f('W47'), sc: 'PM', from: 'hora' }] },
    { id: 'app', video: P + '/comun/clip-app.mp4', fixed: 5.9 },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
