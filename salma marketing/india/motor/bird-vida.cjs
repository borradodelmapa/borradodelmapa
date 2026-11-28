// VIAJEROS DEL MUNDO · 2 · «La insensata viajera» (Isabella Bird) — 26 nov 2026, 🎬 Vídeo 2.
// Guion v8 (docs/bird-biografia-guion-v8.md, gancho C elegido por Paco: para qué viajaba; «Sí, monta» 26 nov). Antes: guion v7 en bird-vida-v7guion.cjs. Guion v7: su vida entera contada como aventura, con el formato del capítulo 1 (mapa, tres partes, giro).
// Paco (26 nov): «no engancha… no se sabe que hablamos de una viajera insólita» → G4 (quién es y por qué es insólita en 20 s);
// «LA C» → voz más suelta y texto de tú a tú; «SI CON MATERIAL REAL PERO APROVECHA LO QUE TENEMOS… CON CUIDADO» → fotos y grabados
// reales del XIX (fotos/reales, con ATRIBUCIONES.txt) y solo las recreaciones que no se deforman, casi todas como imagen fija.
// La versión anterior (guion v6, montaje v15) está en bird-vida-v6guion.cjs.
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/bird-vida', AB = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu-bird';
const R = n => `FILE:${B}/recreaciones/${n}.mp4`, I = n => `FILE:${B}/recreaciones/${n}.png`, M = n => `FILE:${B}/mapas/${n}.mp4`;
const FO = n => `FILE:${B}/fotos/${n}.jpg`, FR = n => `FILE:${B}/fotos/reales/${n}`, ABF = n => `FILE:${AB}/fotos/${n}.jpg`, REAL = { real: true };
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const BOSQUE = (db, ss = 0) => ({ src: 'SFX_bosque-invierno', ss, db });
const NOCHE = (db, ss = 0) => ({ src: 'SFX_noche-calma', ss, db });
const MAR = (db, ss = 0) => ({ src: 'SFX_baler-galeon-mar', ss, db });
const LLUVIA = (db, ss = 0) => ({ src: 'SFX_baler-lluvia-exterior', ss, db });
const TT = process.env.TIKTOK === '1';
const SALMA_C = { ...SALMA_DOC, vs: { stability: 0.0, similarity_boost: 1.0 } }; // voz C, elegida por Paco de oído (26 nov)
const S = b => ({ who: 'salma', scene: true, sceneEnd: true, ...b });
const cfg = {
  titulo: 'VIAJEROS DEL MUNDO · 2',
  id: 'viajeros-2-bird-vida-v45' + (TT ? '-tiktok' : ''),
  nombre: ['Isabella Bird'],
  out: B + '/salida', fotosSerie: B + '/fotos', ultima: B + (TT ? '/ULTIMA-tiktok' : '/ULTIMA'), ultimaNombre: 'mujeres-viajeras-viajo-sola-cuando-era-imposible',
  look: 'portra', counter: 'RECREACIÓN', // F10/L1: cartel de esquina en las recreaciones; fotos, grabados, cuadros y mapas con real:true
  portada: { png: B + '/caratula/bird-vida-caratula.png' },
  voices: { salma: SALMA_C }, voiceDb: { salma: -25 },
  cardSecs: 3.5, kb: 0.8, seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 20 },
  cardP1: 3.5, card: TT ? { l1: 'VIAJEROS DEL MUNDO', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'VIAJEROS DEL MUNDO', l2: 'SUSCRÍBETE AL CANAL', l3: '', l4: '', l5: '' },
  descartes: {
    N10: 'serie «Viajeros del mundo» en formato de 2-3 min, como el capítulo 1 (excepción de Paco del 22 nov); pendiente de que Paco la confirme para la serie',
    M14: 'short (N10 con excepción): tarjeta de short de 3,5 s',
    M16: 'shorts sin clip de la app (18 nov)',
    M7: 'los mapas animados van como planos de los bloques (formato del capítulo 1 aprobado); no hace falta otro bloque de vídeo',
    G2: 'Paco mandó abrir con la serie («tenemos que meter algo sobre la serie al principio», 26 nov): «Viajeros del mundo. Capítulo dos.» va antes del nombre, que suena hacia el segundo 6; además en esta serie el nombre no es el gancho (checklist 25 nov · 23:00)',
    S5: 'sin música hasta que Paco la elija de oído',
    S3: 'serie nueva sin sintonía propia todavía: la elige Paco de oído (S5)',
  },
  blocks: [
    // ── 0 · LA SERIE ──
    S({ id: 'serie', sinCounter: true, pause: 0.2, amb: VIENTO(-30),
      text: 'Viajeros del mundo. Capítulo dos.',
      en: ['Travellers of the world.', 'Chapter two.'],
      shots: [{ a: `FILE:${B}/caratula/serie-intro.png`, sc: 'GP' }] }),
    // ── GANCHO C (Paco, 26 nov): para qué viajaba ──
    S({ id: 'mision', pico: true, pause: 0.2, amb: VIENTO(-32, 3),
      text: 'Esta señora tan seria se llama Isabella Bird. Y recorrió medio mundo, sola, con una misión.',
      voz: 'Esta señora tan seria se llama Isabela Bird. Y recorrió medio mundo, sola, con una misión.',
      subPartes: [['Esta señora tan seria', 'se llama Isabella Bird.'], ['Y recorrió medio mundo, sola,', 'con una misión.']],
      en: ['This very serious lady is called Isabella Bird.', 'And she travelled half the world, alone, with a mission.'],
      shots: [{ ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PM', rotulo: 'ISABELLA BIRD' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PP', from: 'se llama' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'GP', from: 'Y recorrió' }, { a: I('i-lago'), sc: 'GP', from: 'sola' }] }),
    S({ id: 'contar', cambioTono: true, pause: 0.2, amb: VIENTO(-30, 7),
      text: 'Contar cómo vivían pueblos lejanos: los ainu de Japón, los kurdos, los coreanos…',
      subPartes: [['Contar cómo vivían', 'pueblos lejanos:'], ['los ainu de Japón,'], ['los kurdos, los coreanos…']],
      en: ['To tell how faraway peoples lived: the Ainu of Japan, the Kurds, the Koreans…'],
      shots: [{ ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'PM', rotulo: 'GRABADO DE SU LIBRO SOBRE JAPÓN' }, { ...REAL, a: ABF('W7-mujer'), sc: 'PM', from: 'pueblos' }, { ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'PP', from: 'los ainu' }, { ...REAL, a: FR('persia-muralla.png'), sc: 'GP', from: 'los kurdos' }, { ...REAL, a: FR('corea-seul-1894.png'), sc: 'GP', from: 'los coreanos', rotulo: 'SEÚL · FOTO DE ISABELLA BIRD, 1894' }] }),
    S({ id: 'cartas', pause: 0.2, amb: VIENTO(-32, 11),
      text: 'Lo escribía todo en cartas a su hermana, y aquellas cartas acabaron siendo libros.',
      subPartes: [['Lo escribía todo', 'en cartas a su hermana,'], ['y aquellas cartas', 'acabaron siendo libros.']],
      en: ['She wrote it all down in letters to her sister, and those letters became books.'],
      shots: [{ ...REAL, a: M('pueblos'), sc: 'GP' }, { ...REAL, a: FR('lady-p121.png'), sc: 'GP', from: 'y aquellas', rotulo: 'DE SU LIBRO, 1879' }] }),
    S({ id: 'pregunta', datoFuerte: true, pause: 0.4, amb: VIENTO(-32, 15),
      text: 'Y con su dinero levantó cinco hospitales. ¿Cómo llega a eso una niña a la que daban por inválida?',
      subPartes: [['Y con su dinero', 'levantó cinco hospitales.'], ['¿Cómo llega a eso una niña'], ['a la que daban por inválida?']],
      en: ['And with her own money she built five hospitals.', 'How does a girl they wrote off as an invalid get there?'],
      cifra: { word: 'cinco', text: '5 HOSPITALES', sub: 'CACHEMIRA · INDIA · COREA · CHINA', dur: 1.6, size: 120, retraso: 0.2, y: 300 },
      shots: [{ ...REAL, a: ABF('Bird-manchu'), sc: 'PM', rotulo: 'ISABELLA BIRD · 1899' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'GP', from: 'levantó' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'PP', from: '¿Cómo' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'PM', from: 'a la que' }] }),
    S({ id: 'tres', pause: 0.3, amb: VIENTO(-32, 19),
      text: 'Su vida tiene tres partes: la inválida, la que lo contaba todo… y la de los hospitales.',
      en: ['Her life has three parts: the invalid, the woman who told everything…', 'and the woman of the hospitals.'],
      shots: [{ ...REAL, a: M('tres'), sc: 'GP' }] }),
    // ── 1 · LA INVÁLIDA ──
    S({ id: 'nina', cambioTono: true, emocion: 'calida', pause: 0.3, amb: NOCHE(-34),
      text: 'De pequeña tenía la espalda mal y siempre decía lo mismo: «estoy muy cansada».',
      subPartes: [['De pequeña tenía la espalda mal'], ['y siempre decía lo mismo:'], ['«estoy muy cansada».']],
      en: ['As a child she had a bad back and always said the same thing: “I’m so tired.”'],
      shots: [{ ...REAL, a: FR('fildes-doctor.png'), sc: 'GP', rotulo: 'CUADRO DE LUKE FILDES, 1891' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'PP', from: 'y siempre' }] }),
    S({ id: 'barco', pause: 0.3, amb: MAR(-28),
      text: 'A los veintidós, el médico le recetó… ¡un viaje en barco! Volvió mucho más sana.',
      subPartes: [['A los veintidós,', 'el médico le recetó…'], ['¡un viaje en barco!'], ['Volvió mucho más sana.']],
      en: ['At twenty-two, the doctor prescribed…', 'a sea voyage!', 'She came back much healthier.'],
      shots: [{ ...REAL, a: M('barco'), sc: 'GP' }, { ...REAL, a: ABF('Isabella_Bird'), sc: 'PM', from: 'Volvió' }] }),
    S({ id: 'sanson', datoFuerte: true, pause: 0.4, amb: MAR(-32, 6),
      text: 'Un médico lo resumió así: en casa, una inválida… y de viaje, Sansón.',
      en: ['A doctor summed it up: at home, an invalid…', 'abroad, a Samson.'],
      cifra: { word: 'resumió', text: '«THE INVALID AT HOME AND THE SAMSON ABROAD»', sub: '— EDINBURGH MEDICAL JOURNAL, 1904', dur: 2.6, size: 46, retraso: 0.3, y: 300 },
      shots: [{ ...REAL, a: ABF('Isabella_Bird'), sc: 'PP' }, { ...REAL, a: ABF('Isabella_Bird'), sc: 'GP', from: 'así' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'PM', from: 'en casa' }, { ...REAL, a: FR('lady-p230.png'), sc: 'GP', from: 'y de viaje' }] }),
    // ── 2 · LA QUE LO CONTABA TODO ──
    S({ id: 'rocosas', cambioTono: true, pause: 0.3, amb: VIENTO(-30, 4),
      text: 'En las Montañas Rocosas subió un pico más alto que el Teide con un forajido tuerto… y se lo contó todo a su hermana.',
      subPartes: [["En las Montañas Rocosas","subió un pico más alto que el Teide"],["con un forajido tuerto…"],["y se lo contó todo","a su hermana."]],
      en: ["In the Rocky Mountains she climbed a peak higher than Mount Teide with a one-eyed outlaw…","and told her sister all about it."],
      shots: [{ ...REAL, a: FR('jackson-longs-estes.jpg'), sc: 'GP', rotulo: 'PICO LONGS · FOTO DE W. H. JACKSON, 1873' }, { ...REAL, a: FR('jackson-longs-517493.jpg'), sc: 'GP', from: 'más alto' }, { a: I('i-jim-ojo'), sc: 'PP', from: 'con un' }, { ...REAL, a: FR('lady-p132.png'), sc: 'GP', from: 'y se lo' }] }),
    S({ id: 'ainu', pause: 0.3, amb: VIENTO(-32, 24),
      text: 'En Japón durmió en las casas de los ainu y apuntó con todo detalle cómo vivían.',
      subPartes: [["En Japón durmió","en las casas de los ainu"],["y apuntó con todo detalle","cómo vivían."]],
      en: ["In Japan she slept in the homes of the Ainu and wrote down in great detail how they lived."],
      shots: [{ ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'GP', rotulo: 'AINU · GRABADO DE SU LIBRO, 1880' }, { ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'PM', from: 'en las casas' }, { ...REAL, a: ABF('W9-mujer'), sc: 'PM', from: 'y apuntó' }, { ...REAL, a: FR('torii-bird.jpg'), sc: 'GP', from: 'cómo vivían' }] }),
    S({ id: 'kurdos', pause: 0.3, amb: VIENTO(-30, 30),
      text: 'En Persia y el Kurdistán durmió en casas junto a las mulas, las vacas y las ovejas.',
      subPartes: [["En Persia y el Kurdistán"],["durmió en casas junto a las mulas,","las vacas y las ovejas."]],
      en: ["In Persia and Kurdistan she slept in houses alongside mules, cows and sheep."],
      shots: [{ ...REAL, a: FR('persia-muralla.png'), sc: 'GP', rotulo: 'KURDISTÁN · GRABADO DE SU LIBRO, 1891' }, { ...REAL, a: FR('persia-muralla.png'), sc: 'PM', from: 'durmió' }, { ...REAL, a: FR('persia-alijan.png'), sc: 'PM', from: 'las vacas' }] }),
    S({ id: 'china', datoFuerte: true, pause: 0.4, amb: VIENTO(-32, 28),
      text: 'En China hacía sus propias fotos. Allí, a los sesenta y cuatro, le dieron una pedrada en la cabeza. Y siguió.',
      subPartes: [['En China hacía sus propias fotos.'], ['Allí, a los sesenta y cuatro,'], ['le dieron una pedrada', 'en la cabeza.'], ['Y siguió.']],
      en: ['In China she took her own photographs.', 'There, at sixty-four, she was hit on the head by a stone.', 'And she carried on.'],
      shots: [{ ...REAL, a: FO('yangtze-97-foto'), sc: 'GP', rotulo: 'FOTOS DE ISABELLA BIRD · CHINA, 1896' }, { ...REAL, a: FO('yangtze-107-foto'), sc: 'GP', from: 'propias' }, { ...REAL, a: FO('yangtze-116-foto'), sc: 'GP', from: 'Allí' }, { ...REAL, a: FO('yangtze-215-foto'), sc: 'PM', from: 'le dieron' }, { ...REAL, a: FO('yangtze-237-foto'), sc: 'GP', from: 'Y siguió' }] }),
    // ── 3 · LOS HOSPITALES ──
    S({ id: 'boda', humano: true, cambioTono: true, emocion: 'calida', pause: 0.4, amb: LLUVIA(-34),
      text: 'A los cuarenta y nueve se casó con el médico de su hermana. Cinco años después, él murió.',
      subPartes: [['A los cuarenta y nueve se casó', 'con el médico de su hermana.'], ['Cinco años después,', 'él murió.']],
      en: ['At forty-nine she married her sister’s doctor.', 'Five years later, he died.'],
      shots: [{ ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'PM' }, { ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'GP', from: 'con el' }, { ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'PP', from: 'Cinco' }] }),
    S({ id: 'hospitales', datoFuerte: true, pause: 0.4, amb: LLUVIA(-34, 6),
      text: 'Con su dinero levantó hospitales en recuerdo de los suyos: uno en Cachemira con el nombre de él, otro en la India con el de su hermana, y tres más en Corea y China.',
      subPartes: [["Con su dinero levantó hospitales","en recuerdo de los suyos:"],["uno en Cachemira","con el nombre de él,"],["otro en la India","con el de su hermana,"],["y tres más en Corea y China."]],
      en: ["With her own money she built hospitals in memory of her loved ones: one in Kashmir with his name, another in India with her sister’s, and three more in Korea and China."],
      shots: [{ ...REAL, a: M('hospitales'), sc: 'GP' }] }),
    S({ id: 'minimo', pause: 0.4, amb: LLUVIA(-34, 12),
      text: 'Para poder dar a otros, gastaba lo mínimo en sí misma.',
      en: ["To be able to give to others, she spent as little as possible on herself."],
      shots: [{ ...REAL, a: ABF('Bird-manchu'), sc: 'GP' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'PP', from: 'gastaba' }] }),
    // ── GIRO ──
    S({ id: 'escalera', datoFuerte: true, emocion: 'calida', pause: 0.4, amb: MAR(-32, 10),
      text: 'A los sesenta y nueve, en Marruecos, subía al caballo del sultán… ¡con una escalera!',
      en: ['At sixty-nine, in Morocco, she climbed onto the sultan’s horse…', 'with a ladder!'],
      shots: [{ a: R('v-escalera'), sc: 'GP', ss: 0.8, rotulo: 'MARRUECOS · 1901' }, { a: I('i-escalera-fin'), sc: 'GP', from: 'sultán' }] }),
    S({ id: 'muere', pause: 0.5, amb: LLUVIA(-34, 6),
      text: 'Murió en 1904. Sus libros se siguen leyendo para saber cómo vivían aquellos pueblos.',
      subPartes: [['Murió en 1904.'], ['Sus libros se siguen leyendo'], ['para saber cómo vivían', 'aquellos pueblos.']],
      en: ['She died in 1904.', 'Her books are still read to learn how those peoples lived.'],
      cifra: { word: 'Murió', text: 'ISABELLA BIRD', sub: '1831 – 1904', dur: 1.9, size: 90, retraso: 0.2, y: 260 },
      shots: [{ ...REAL, a: ABF('Isabella_Bird'), sc: 'PM' }, { ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'PM', from: 'Sus libros' }, { ...REAL, a: FR('persia-tienda.png'), sc: 'GP', from: 'para saber' }] }),
    S({ id: 'cap1', pause: 1.5, amb: VIENTO(-34, 30),
      text: 'Su viaje con los ainu es el capítulo uno.',
      en: ['Her journey with the Ainu is chapter one.'],
      shots: [{ ...REAL, a: `FILE:${AB}/clips/caballo-v4.mp4`, sc: 'GP', rotulo: 'CAPÍTULO 1 · LOS AINU' }] }),
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
