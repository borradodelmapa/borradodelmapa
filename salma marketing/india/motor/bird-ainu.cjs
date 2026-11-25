// DIARIO DE GRANDES VIAJEROS · 1 · «Los AINU confiaron en una viajera inglesa 🇯🇵» — short 9:16 (22 nov 2026, 🎬 Vídeo 2; Paco: «Hazlo»).
// Guion: salma marketing/pueblos/ainu-bird/guion-completo-v2.md (Bird es el personaje; Salma, periodista que interroga y remata).
// Voces generadas y escuchadas por Paco (voces/guion/*.mp3): BIRD = Alice con el tono bajado (N8, 22 nov), SALMA = SALMA_DOC. Entran como audioPropio.
// Recreaciones de Runway (excepción L1 de Paco, 22 nov): clips/p1-caballo, p2-carta, p3-londres, con «RECREACIÓN» pequeño. A los ainu, siempre con fotos reales (ainu/fotos, ATRIBUCIONES.txt).
// Excepciones de Paco: N10 (voz de 66 s, «No recortes nada»), Y16 anulada y carátula E3 con dos protagonistas.
// v6 (22 nov, «Si» de Paco a la versión verdadera): F4 del revisor de guion (le pidieron que no lo supiera EL GOBIERNO, no silencio; «sus voces», de los hombres;
// fuera «muchas se tatuaron a escondidas») · revisor de imagen: mapa propio (mapa-bird.cjs), N7 en abuela/motivo/dato, rótulos con fecha en las fotos del dato,
// cifra más abajo, plano de asombro en Biratori (M24), cierre con cara fuerte y sin voz (M18, M43), subtítulos por frases (M25).
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const BIRD = { id: 'Xb7hH8MSUJpSbSDYk0k2', model: 'eleven_v4', lang: 'es', vs: { stability: 0.45, similarity_boost: 0.85, style: 0.3 } };
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu-bird', AIN = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu', AF = AIN + '/fotos';
const VZ = n => `${B}/voces/guion/${n}.mp3`;
const F = n => `FILE:${AF}/${n}.jpg`, BF = n => `FILE:${B}/fotos/${n}.jpg`, C = n => `FILE:${B}/clips/${n}.mp4`;
const BOSQUE = (db, ss = 0) => ({ src: 'SFX_bosque-invierno', ss, db });
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const NOCHE = (db, ss = 0) => ({ src: 'SFX_noche-calma', ss, db });
const PAPEL = (db, ss = 0) => ({ src: 'SFX_baler-papel-periodico', ss, db });
const PLUMA = (db, ss = 0) => ({ src: 'SFX_baler-pluma-papel', ss, db });
const TT = process.env.TIKTOK === '1';
const bl = (who, n, b) => ({ who, scene: true, sceneEnd: true, audioPropio: VZ(`${n}-${who}`), ...b });
const cfg = {
  titulo: 'DIARIO DE GRANDES VIAJEROS · 1',
  id: 'viajeros-1-bird-ainu-v12' + (TT ? '-tiktok' : ''),
  nombre: ['ainu'],
  out: B + '/salida', fotosSerie: AF, ultima: B + (TT ? '/ULTIMA-tiktok' : '/ULTIMA'), ultimaNombre: 'los-ainu-confiaron-en-una-viajera-inglesa',
  look: 'portra', counter: 'DIARIO DE GRANDES VIAJEROS',
  portada: { png: B + '/caratula/bird-E3.png' },
  voices: { salma: SALMA_DOC, bird: BIRD }, voiceDb: { salma: -25, bird: -24 },
  cardSecs: 3.5, kb: 0.8, seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 20 },
  cardP1: 3.5, card: TT ? { l1: 'DIARIO DE GRANDES VIAJEROS', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'DIARIO DE GRANDES VIAJEROS', l2: 'SUSCRÍBETE AL CANAL', l3: '', l4: '', l5: '' },
  descartes: {
    N10: 'excepción de Paco (22 nov 2026): «No recortes nada. Hacemos una excepción»',
    M14: 'es un short (N10 con excepción de Paco): tarjeta de short de 3,5 s; el motor lo toma por largo porque pasa de 65 s',
    M16: 'shorts sin clip de la app (18 nov)',
    S5: 'sin música hasta que Paco la elija de oído',
    S3: 'serie nueva sin sintonía propia todavía: la elige Paco de oído (S5); no se usa la de «Pueblos borrados»',
  },
  blocks: [
    // 0 · GANCHO: el caballo se mueve desde el fotograma 0 y pasa a color; «Que no se enterara EL GOBIERNO → Y ella lo PUBLICÓ → El tatuaje MURIÓ»
    bl('bird', '01', { id: 'g0', emocion: 'fria', pause: 0.3, amb: BOSQUE(-30),
      text: 'Antes de contarme nada, los ainu me suplicaron que no se lo dijera al Gobierno japonés.',
      subPartes: [['Antes de contarme nada,'], ['los ainu me suplicaron'], ['que no se lo dijera', 'al Gobierno japonés.']],
      en: ["Before telling me anything, the Ainu begged me not to tell the Japanese Government."],
      shots: [{ a: C('p1-caballo'), sc: 'GP' }] }),
    bl('salma', '02', { id: 'g1', pause: 0.3, amb: PAPEL(-30),
      text: 'Aun así… acabó escribiéndolo en un libro.',
      en: ["Even so…","she ended up writing it in a book."],
      shots: [{ a: C('p3-londres'), sc: 'PM' }] }),
    bl('salma', '03', { id: 'quien', emocion: 'calida', humano: true, pause: 0.35, amb: NOCHE(-34), rotulo: 'ISABELLA BIRD',
      text: 'Se llamaba Isabella Bird. Enferma desde niña, los médicos le recetaron viajar. Acabó recorriendo medio mundo.',
      voz: 'Se yamaba Isabela Bird. Enferma desde niña, los médicos le recetaron viajar. Acabó recorriendo medio mundo.',
      en: ["Her name was Isabella Bird.","Ill since childhood, she was prescribed travel by her doctors.","She ended up crossing half the world."],
      shots: [{ a: BF('Isabella_Bird'), sc: 'PP' }, { a: BF('Portrait_of_Isabella_Bird'), sc: 'PM', from: 'Enferma' }, { a: BF('Bird-manchu'), sc: 'GP', from: 'viajar' }, { a: BF('Bird-manchu'), sc: 'PP', from: 'medio' }] }),
    bl('bird', '04', { id: 'tatuaje', pause: 0.35, amb: VIENTO(-32),
      text: 'Me imploraron que intercediera ante el Gobierno. Japón les había prohibido su tatuaje.',
      en: ["They implored me to intercede with the Government.","Japan had banned their tattoo."],
      shots: [{ a: F('W3'), sc: 'PP' }, { a: BF('W9-mujer'), sc: 'PM', from: 'ante' }] }),
    bl('salma', '05', { id: 'pregunta', pause: 0.4, amb: PLUMA(-30),
      text: 'Le pidieron que no lo supiera el Gobierno. Lo publicó en Londres. ¿Hizo lo correcto?',
      en: ["They asked her to keep it from the Government.","She published it in London.","Did she do the right thing?"],
      shots: [{ a: C('p2-carta'), sc: 'PM' }] }),
    // MAPA propio (M7): Tokio → Biratori, «Diario de grandes viajeros · Capítulo 1 · 1878»
    { id: 'mapa', video: B + '/mapa-bird.mp4', fixed: 4.5, amb: VIENTO(-34, 10) },
    // M24: plano de asombro del valle del Saru (Biratori hoy), sin voz
    { id: 'valle', video: B + '/clips/valle-saru.mp4', fixed: 4.0, asombro: true, amb: VIENTO(-30, 14), rotulo: 'VALLE DEL SARU · BIRATORI · HOY', rotuloSegs: 2.0 },
    // 1 · BIRATORI: plano de asombro de la aldea (M24)
    bl('salma', '06', { id: 'biratori', pause: 0.5, amb: BOSQUE(-32, 6),
      text: 'Sin conocerla de nada, la metieron en casa de su jefe.',
      en: ['Without knowing her at all, they took her into their chief\u2019s house.'],
      shots: [{ a: F('W16'), sc: 'GP', rotulo: 'PIRATORI (BIRATORI) · HACIA 1908' }] }),
    bl('bird', '07', { id: 'abuela', cambioTono: true, pause: 0.3, amb: BOSQUE(-32, 10),
      text: 'La madre del jefe reñía a su nieto por contarme demasiado.',
      subPartes: [['La madre del jefe'], ['reñía a su nieto'], ['por contarme demasiado.']],
      en: ['The chief\u2019s mother scolded her grandson for telling me too much.'],
      shots: [{ a: F('W21'), sc: 'PM' }, { a: F('W20'), sc: 'GP', from: 'nieto' }] }),
    bl('salma', '08', { id: 'motivo', pause: 0.3, amb: BOSQUE(-32, 14),
      text: 'Tenía un motivo.',
      en: ["She had a reason."],
      shots: [{ a: F('W5'), sc: 'PP' }] }),
    bl('bird', '09', { id: 'dano', pause: 0.4, amb: BOSQUE(-32, 16),
      text: 'Decía que eso traería daño a su pueblo.',
      en: ["She said it would bring harm to her people."],
      shots: [{ a: F('W17'), sc: 'PM' }, { a: BF('W10-anciana'), sc: 'PM', from: 'traería' }] }),
    // 2 · LA CONTRADICCIÓN (pico)
    bl('bird', '10', { id: 'dulce', pause: 1.0, amb: NOCHE(-34, 4),
      text: 'Sus voces son más suaves y dulces que nada que haya oído.',
      subPartes: [['Sus voces son'], ['más suaves y dulces'], ['que nada que haya oído.']],
      en: ["Their voices are softer and sweeter than anything I have ever heard."],
      shots: [{ a: BF('Ainu_by_Isabella_Bird'), sc: 'PM' }, { a: F('W13'), sc: 'GP', from: 'dulces' }] }),
    bl('salma', '11', { id: 'ninos', pico: true, pause: 0.5, amb: NOCHE(-34, 8),
      text: 'Sin embargo… en ese mismo párrafo los llamó «niños adultos».',
      voz: 'Sin embargo… en ese mismo párrafo los yamó «niños adultos».',
      subPartes: [['Sin embargo…'], ['en ese mismo párrafo'], ['los llamó «niños adultos».']],
      en: ['And yet…', 'in that same paragraph she called them \u201Cadult children\u201D.'],
      shots: [{ a: F('W26'), sc: 'PP' }, { a: F('W22'), sc: 'PM', from: 'ese' }] }),
    // 3 · EL DATO (silencio antes, S9); cada foto con su fecha real para que nadie la tome por «la última»
    bl('salma', '12', { id: 'dato', datoFuerte: true, emocion: 'fria', pause: 0.5, amb: VIENTO(-32, 6),
      text: 'La prohibición siguió. La última con el tatuaje completo murió en 1998.',
      voz: 'La prohibición siguió. La última con el tatuaje completo murió en mil novecientos noventa y ocho.',
      subPartes: [['La prohibición siguió.'], ['La última', 'con el tatuaje completo'], ['murió en 1998.']],
      en: ["The ban stayed.","The last woman with the full tattoo died in 1998."],
      cifra: { word: 'completo', text: '1998', sub: 'HACE MENOS DE 30 AÑOS', dur: 1.2, size: 200, retraso: 0.5, y: 470 },
      shots: [{ a: F('W4'), sc: 'PP', rotulo: 'MUJER AINU · HACIA 1930' }, { a: BF('W7-mujer'), sc: 'PM', from: 'La última', rotulo: 'MUJER AINU · SIGLO XIX' }, { a: F('W23'), sc: 'GP', from: 'murió', rotulo: 'AINU · HACIA 1930' }, { a: F('W23'), sc: 'PM', from: '1998', rotulo: 'AINU · HACIA 1930' }] }),
    // 4 · CIERRE CON DATO (N6), Upopoy en «hoy»
    bl('salma', '13', { id: 'hoy', emocion: 'calida', pause: 0.3, amb: VIENTO(-34, 12),
      text: 'Lo que le suplicaron que no supiera el Gobierno… hoy se lee traducido al japonés.',
      subPartes: [['Lo que le suplicaron'], ['que no supiera el Gobierno…'], ['hoy se lee', 'traducido al japonés.']],
      en: ["What they begged her to keep from the Government…","is now read in Japanese."],
      shots: [{ a: C('p3-londres'), sc: 'D', ss: 4.0 }, { a: F('W39'), sc: 'GP', from: 'hoy', rotulo: 'UPOPOY · MUSEO AINU · 2020' }] }),
    // M18 · M43: imagen sola, la cara más fuerte, antes de la tarjeta
    { id: 'silencio', video: B + '/clips/cierre-W11.mp4', fixed: 1.8, amb: VIENTO(-32, 16), rotulo: 'SHIRAOI · HOKKAIDO', rotuloSegs: 1.0 },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
