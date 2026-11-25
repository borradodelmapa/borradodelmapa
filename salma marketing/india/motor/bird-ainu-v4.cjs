// DIARIO DE GRANDES VIAJEROS · 1 · «Los AINU confiaron en una viajera inglesa 🇯🇵» — GUION v4 (25 nov 2026, 🎬 Vídeo 2; Paco: «SI, REESCRIBE LA V4 CON ESE FORMATO» y «MONTA»).
// Guion: documento de Paco https://claude.ai/artifact/RsTGVLoKfbhEusSRnDYxiL (sección «Guion v4»). Formato del short de los garífunas (Planeta en Mapas):
// una sola narradora sobre mapa animado (mapas-bird-v4.cjs), misterio en el segundo 20, tres partes y giro final. Las frases de Bird van como citas en pantalla (cifra).
// Recreaciones de Runway (excepciones L1 de Paco del 22 y el 25 nov): caballo, carta, Londres y la mujer ainu que pasa a color (tatuajes/runway). Rótulo RECREACIÓN.
// Excepciones de Paco: N10 (dura unos 2 min), Y16 anulada, carátula E3, sígueme en el 20.
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu-bird', AF = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu/fotos';
const F = n => `FILE:${AF}/${n}.jpg`, BF = n => `FILE:${B}/fotos/${n}.jpg`, C = n => `FILE:${B}/clips/${n}.mp4`, M = n => `FILE:${B}/mapas/${n}.mp4`;
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const BOSQUE = (db, ss = 0) => ({ src: 'SFX_bosque-invierno', ss, db });
const NOCHE = (db, ss = 0) => ({ src: 'SFX_noche-calma', ss, db });
const PAPEL = (db, ss = 0) => ({ src: 'SFX_baler-papel-periodico', ss, db });
const TT = process.env.TIKTOK === '1';
const S = b => ({ who: 'salma', scene: true, sceneEnd: true, ...b });
// Cita de Bird en pantalla (va en la mitad de arriba, lejos de los subtítulos)
const CITA = (word, text, o = {}) => ({ word, text, sub: '— ISABELLA BIRD, 1878', dur: 2.2, size: 66, retraso: 0.2, y: 420, ...o });
const cfg = {
  titulo: 'DIARIO DE GRANDES VIAJEROS · 1',
  id: 'viajeros-1-bird-ainu-v4j' + (TT ? '-tiktok' : ''),
  nombre: ['ainu'],
  out: B + '/salida', fotosSerie: AF, ultima: B + (TT ? '/ULTIMA-tiktok' : '/ULTIMA'), ultimaNombre: 'los-ainu-confiaron-en-una-viajera-inglesa',
  look: 'portra', counter: 'DIARIO DE GRANDES VIAJEROS',
  portada: { png: B + '/caratula/bird-F3.png' }, fecha: '2026-11-26',
  voices: { salma: SALMA_DOC }, voiceDb: { salma: -25 },
  cardSecs: 3.5, kb: 0.8, seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 20 },
  cardP1: 3.5, card: TT ? { l1: 'DIARIO DE GRANDES VIAJEROS', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'DIARIO DE GRANDES VIAJEROS', l2: 'SUSCRÍBETE AL CANAL', l3: '', l4: '', l5: '' },
  descartes: {
    N10: 'excepción de Paco (22 nov 2026): «No recortes nada. Hacemos una excepción»; v4 en el formato de 2-3 min que mandó estudiar',
    M14: 'es un short (N10 con excepción de Paco): tarjeta de short de 3,5 s',
    M16: 'shorts sin clip de la app (18 nov)',
    S5: 'sin música hasta que Paco la elija de oído',
    S3: 'serie nueva sin sintonía propia todavía: la elige Paco de oído (S5)',
  },
  blocks: [
    // 1-2 · Mira esta isla → tierra ainu
    S({ id: 'isla', emocion: 'fria', pause: 0.2, amb: VIENTO(-30),
      text: 'Mira esta isla del norte de Japón: Hokkaido, la tierra de los ainu. Antes tenía otro nombre.',
      subPartes: [['Mira esta isla', 'del norte de Japón:'], ['Hokkaido,', 'la tierra de los ainu.'], ['Antes tenía otro nombre.']],
      en: ['Look at this island in the north of Japan: Hokkaido, the land of the Ainu.', 'It used to have another name.'],
      shots: [{ a: M('hokkaido'), sc: 'GP', ss: 2.2 }, { a: C('ainu-color'), sc: 'PP', from: 'Antes' }] }),
    // 3 · 1869
    S({ id: 'colonos', pause: 0.2, amb: VIENTO(-30, 4),
      text: 'En 1869, Japón la rebautizó y empezó a llenarla de colonos.',
      subPartes: [['En 1869,', 'Japón la rebautizó'], ['y empezó a llenarla', 'de colonos.']],
      voz: 'En mil ochocientos sesenta y nueve, Japón la rebautizó y empezó a yenarla de colonos.',
      en: ['In 1869, Japan renamed it and began filling it with settlers.'],
      shots: [{ a: M('colonos'), sc: 'GP' }] }),
    // 4 · 1871 · 1878
    S({ id: 'llega', pause: 0.2, amb: BOSQUE(-30),
      text: 'En 1871 les prohibió su tatuaje. En 1878 llegó una inglesa a caballo.',
      voz: 'En mil ochocientos setenta y uno les prohibió su tatuaje. En mil ochocientos setenta y ocho yegó una inglesa a caballo.',
      en: ['In 1871 it banned their tattoo.', 'In 1878 an Englishwoman arrived on horseback.'],
      cifra: { word: 'les', text: '1871', sub: 'TATUAJE PROHIBIDO', dur: 1.0, size: 170, retraso: 0.2, y: 420 },
      shots: [{ a: F('W3'), sc: 'PP' }, { a: C('caballo-v4'), sc: 'GP', from: 'En 1878' }] }),
    // 5 · Misterio
    S({ id: 'misterio', pico: true, pause: 0.3, amb: VIENTO(-32, 6),
      text: '¿Por qué sabemos tanto de esta aldea? Porque ella lo contó todo. Justo lo que le suplicaron que no supiera el Gobierno.',
      en: ['Why do we know so much about this village?', 'Because she told it all.', 'Exactly what they begged her to keep from the Government.'],
      shots: [{ a: M('biratori'), sc: 'GP' }] }),
    // 6 · Tres partes (sígueme en el 20)
    S({ id: 'partes', pause: 0.3, amb: VIENTO(-32, 10),
      text: 'La historia tiene tres partes: un tatuaje, un secreto y un libro. Al final vas a ver adónde llegó ese libro.',
      voz: 'La historia tiene tres partes: un tatuaje, un secreto y un libro. Al final vas a ver adónde yegó ese libro.',
      en: ['The story has three parts: a tattoo, a secret and a book.', 'At the end you will see where that book ended up.'],
      shots: [{ a: M('partes'), sc: 'GP' }] }),
    // 7 · Parte 1: quién y la ruta
    S({ id: 'quien', emocion: 'calida', pause: 0.3, amb: NOCHE(-34), 
      text: 'Se llamaba Isabella Bird. Enferma desde niña, los médicos le recetaron viajar. Tardó más de dos meses en llegar desde Tokio.',
      voz: 'Se yamaba Isabela Bird. Enferma desde niña, los médicos le recetaron viajar. Tardó más de dos meses en yegar desde Tokio.',
      en: ['Her name was Isabella Bird.', 'Ill since childhood, she was prescribed travel by her doctors.', 'It took her more than two months to get there from Tokyo.'],
      shots: [{ a: BF('Isabella_Bird-pad'), sc: 'GP', rotulo: 'ISABELLA BIRD · 46 AÑOS' }, { a: C('p2-carta'), sc: 'PM', from: 'Enferma' }, { a: `FILE:${B}/mapa-bird.mp4`, sc: 'GP', from: 'Tardó' }] }),
    // 8-9 · El tatuaje
    S({ id: 'cuchillo', datoFuerte: true, emocion: 'fria', pause: 0.4, amb: VIENTO(-32, 2),
      text: 'Allí vio cómo a una niña le cortaban el labio con un cuchillo y le frotaban hollín. Sin ese tatuaje, decían, ninguna mujer podía casarse.',
      voz: 'Allí vio cómo a una niña le cortaban el labio con un cuchiyo y le frotaban hoyín. Sin ese tatuaje, decían, ninguna mujer podía casarse.',
      en: ['There she saw a girl\u2019s lip being cut with a knife and rubbed with soot.', 'Without that tattoo, they said, no woman could marry.'],
      cifra: [CITA('niña', '«APRETÓ LAS MANOS… Y NO LLORÓ»', { dur: 2.5, size: 46, y: 300 })],
      subPartes: [['Allí vio cómo a una niña'], ['le cortaban el labio', 'con un cuchillo'], ['y le frotaban hollín.'], ['Sin ese tatuaje, decían,'], ['ninguna mujer', 'podía casarse.']],
      shots: [{ a: BF('W9-mujer'), sc: 'PM' }, { a: F('W27'), sc: 'PP', from: 'labio' }, { a: F('W5'), sc: 'PP', from: 'le frotaban' }, { a: C('ainu-color'), sc: 'PP', from: 'Sin', ss: 1.5 }] }),
    // 10 · Parte 2: el secreto
    S({ id: 'secreto', cambioTono: true, pause: 0.3, amb: BOSQUE(-32, 6),
      text: 'Antes de contarle nada, le suplicaron que no se lo dijera al Gobierno japonés.',
      subPartes: [['Antes de contarle nada,'], ['le suplicaron', 'que no se lo dijera'], ['al Gobierno japonés.']],
      en: ['Before telling her anything, they begged her not to tell the Japanese Government.'],
      shots: [{ a: M('secreto'), sc: 'GP' }] }),
    // 11 · El miedo
    S({ id: 'miedo', pause: 0.3, amb: BOSQUE(-32, 10),
      text: 'Tenían miedo. Un padre rechazó la medicina para su niño, por si el Gobierno se enfadaba.',
      en: ['They were afraid.', 'A father refused medicine for his child, in case the Government got angry.'],
      cifra: [CITA('medicina', '«EL GOBIERNO SE ENFADARÍA»', { size: 56, dur: 1.4, y: 300 })],
      subPartes: [['Tenían miedo.'], ['Un padre rechazó', 'la medicina para su niño,'], ['por si el Gobierno', 'se enfadaba.']],
      shots: [{ a: F('W13'), sc: 'PM' }, { a: F('W20'), sc: 'GP', from: 'rechazó' }] }),
    // 12 · El templo
    S({ id: 'templo', pause: 0.3, amb: BOSQUE(-30, 14),
      text: 'Aun así, la subieron al monte y le enseñaron su templo. Otra vez le pidieron que el Gobierno no lo supiera.',
      subPartes: [['Aun así,', 'la subieron al monte'], ['y le enseñaron su templo.'], ['Otra vez le pidieron'], ['que el Gobierno', 'no lo supiera.']],
      en: ['Even so, they took her up the hill and showed her their temple.', 'Once again they asked her to keep it from the Government.'],
      shots: [{ a: M('templo'), sc: 'GP' }, { a: `FILE:${B}/clips/valle-saru.mp4`, sc: 'GP', from: 'Otra', rotulo: 'VALLE DEL SARU · BIRATORI · HOY' }] }),
    // 13 · Parte 3: el libro
    S({ id: 'libro', pause: 0.3, amb: PAPEL(-30),
      text: 'Dos años después, en Londres, todo estaba impreso.',
      subPartes: [['Dos años después,'], ['en Londres,', 'todo estaba impreso.']],
      en: ['Two years later, in London, it was all in print.'],
      shots: [{ a: M('londres'), sc: 'GP' }, { a: C('p3-londres'), sc: 'PM', from: 'todo' }] }),
    // 14 · La contradicción
    S({ id: 'ninos', pico: true, pause: 0.5, amb: NOCHE(-34, 6),
      text: 'Escribió que sus voces eran las más dulces que había oído… y, en el mismo párrafo, que eran «niños adultos».',
      subPartes: [['Escribió que sus voces'], ['eran las más dulces', 'que había oído…'], ['y, en el mismo párrafo,'], ['que eran «niños adultos».']],
      en: ['She wrote that their voices were the sweetest she had ever heard…', 'and, in the same paragraph, that they were \u201Cadult children\u201D.'],
      shots: [{ a: BF('Portrait_of_Isabella_Bird'), sc: 'PM' }, { a: BF('Ainu_by_Isabella_Bird'), sc: 'PM', from: 'sus voces' }, { a: F('W22'), sc: 'PM', from: 'había' }, { a: F('W26'), sc: 'PP', from: 'y,' }, { a: F('W26'), sc: 'PM', from: 'niños' }] }),
    // 15 · 1998
    S({ id: 'ultima', emocion: 'fria', pause: 0.3, amb: VIENTO(-32, 8),
      text: 'Japón mantuvo la prohibición. La última mujer con el tatuaje completo murió en 1998.',
      subPartes: [['Japón mantuvo', 'la prohibición.'], ['La última mujer', 'con el tatuaje completo'], ['murió en 1998.']],
      voz: 'Japón mantuvo la prohibición. La última mujer con el tatuaje completo murió en mil novecientos noventa y ocho.',
      en: ['Japan kept the ban.', 'The last woman with the full tattoo died in 1998.'],
      cifra: { word: 'murió', text: '1998', sub: 'LA ÚLTIMA CON EL TATUAJE', dur: 1.4, size: 170, retraso: 0.2, y: 420 },
      shots: [{ a: M('ultima'), sc: 'GP' }, { a: BF('W7-mujer'), sc: 'PM', from: 'La', rotulo: 'MUJER AINU · SIGLO XIX' }, { a: F('W23'), sc: 'GP', from: 'murió', rotulo: 'AINU · HACIA 1930' }] }),
    // 16 · 2019
    S({ id: 'r2019', emocion: 'calida', pause: 0.3, amb: VIENTO(-34, 12),
      text: 'En 2019, Japón los reconoció por fin como pueblo indígena.',
      voz: 'En dos mil diecinueve, Japón los reconoció por fin como pueblo indígena.',
      en: ['In 2019, Japan finally recognised them as an indigenous people.'],
      shots: [{ a: M('r2019'), sc: 'GP' }] }),
    // 17 · Giro final
    S({ id: 'giro', emocion: 'calida', pause: 0.4, amb: VIENTO(-34, 16),
      text: 'El libro que no debía llegar al Gobierno… hoy se lee en japonés. Le pidieron que Japón no se enterara. Y Japón acabó leyéndolo.',
      subPartes: [['El libro que no debía', 'llegar al Gobierno…'], ['hoy se lee en japonés.'], ['Le pidieron', 'que Japón no se enterara.'], ['Y Japón acabó leyéndolo.']],
      voz: 'El libro que no debía yegar al Gobierno… hoy se lee en japonés. Le pidieron que Japón no se enterara. Y Japón acabó leyéndolo.',
      en: ['The book that was never meant to reach the Government…', 'is read in Japanese today.', 'They asked her to keep it from Japan.', 'And Japan ended up reading it.'],
      shots: [{ a: M('vuelta'), sc: 'GP' }, { a: F('W39'), sc: 'GP', from: 'Le', rotulo: 'UPOPOY · MUSEO AINU · 2020' }, { a: F('W40'), sc: 'GP', from: 'Y Japón' }] }),
    // M18 · M43: imagen sola antes de la tarjeta
    { id: 'silencio', video: B + '/clips/cierre-W11.mp4', fixed: 1.8, amb: VIENTO(-32, 20), rotulo: 'SHIRAOI · HOKKAIDO', rotuloSegs: 1.0 },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
