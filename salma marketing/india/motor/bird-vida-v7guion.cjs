// VIAJEROS DEL MUNDO · 2 · «La insensata viajera» (Isabella Bird) — 26 nov 2026, 🎬 Vídeo 2.
// Guion v7 (docs/bird-biografia-guion-v7.md): su vida entera contada como aventura, con el formato del capítulo 1 (mapa, tres partes, giro).
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
  id: 'viajeros-2-bird-vida-v30' + (TT ? '-tiktok' : ''),
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
    // ── 0 · LA SERIE (Paco, 26 nov: «tenemos que meter algo sobre la serie al principio») ──
    S({ id: 'serie', sinCounter: true, pause: 0.2, amb: VIENTO(-30),
      text: 'Viajeros del mundo. Capítulo dos.',
      en: ["Travellers of the world.","Chapter two."],
      shots: [{ a: `FILE:${B}/caratula/bird-vida-caratula.png`, sc: 'GP' }] }),
    // ── GANCHO (G4: quién es y por qué es insólita) ──
    S({ id: 'senora', pico: true, pause: 0.2, amb: VIENTO(-32, 3),
      text: 'Esta señora tan seria… se llama Isabella Bird. Parece la típica dama inglesa de 1870, ¿verdad?',
      voz: 'Esta señora tan seria… se llama Isabela Bird. Parece la típica dama inglesa de 1870, ¿verdad?',
      subPartes: [['Esta señora tan seria…'], ['se llama Isabella Bird.'], ['Parece la típica dama inglesa', 'de 1870, ¿verdad?']],
      en: ['This very serious lady…', 'is called Isabella Bird.', 'Looks like the typical English lady of 1870, right?'],
      shots: [{ ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PM', rotulo: 'ISABELLA BIRD' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PP', from: 'se llama' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'GP', from: 'Parece' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PM', from: 'de 1870' }] }),
    S({ id: 'puesno', cambioTono: true, pause: 0.2, amb: VIENTO(-30, 6),
      text: '¡Pues no! Medía metro y medio, estaba enferma desde niña… ¡y se fue sola, a caballo, a recorrer medio mundo!',
      subPartes: [['¡Pues no!'], ['Medía metro y medio,', 'estaba enferma desde niña…'], ['¡y se fue sola, a caballo,', 'a recorrer medio mundo!']],
      en: ['Not at all!', 'She was barely five feet tall, sick since childhood…', 'and she set off alone, on horseback, to travel half the world!'],
      shots: [{ a: R('v-cara'), sc: 'PP' }, { a: I('i-lago'), sc: 'GP', from: '¡y se fue' }] }),
    S({ id: 'hazanas', pause: 0.2, amb: VIENTO(-30, 10),
      text: 'Subió las Montañas Rocosas con un forajido tuerto. Llegó al Pequeño Tíbet. Cruzó Persia. En China… la recibieron a pedradas.',
      voz: 'Subió las Montañas Rocosas con un forajido tuerto. Yegó al Pequeño Tíbet. Cruzó Persia. En China… la recibieron a pedradas.',
      subPartes: [['Subió las Montañas Rocosas', 'con un forajido tuerto.'], ['Llegó al Pequeño Tíbet.', 'Cruzó Persia.'], ['En China…', 'la recibieron a pedradas.']],
      en: ["She climbed the Rocky Mountains with a one-eyed outlaw.","She reached Little Tibet.","She crossed Persia.","In China…","they greeted her with stones."],
      shots: [{ ...REAL, a: FR('jackson-longs-sureste.jpg'), sc: 'GP', rotulo: 'MONTAÑAS ROCOSAS · FOTO DE 1873' }, { a: I('i-jim-ojo'), sc: 'PP', from: 'con un' }, { ...REAL, a: M('ruta'), sc: 'GP', ss: 2, from: 'Llegó al' }, { ...REAL, a: FO('yangtze-215-foto'), sc: 'PM', from: 'En China', rotulo: 'FOTO DE ISABELLA BIRD · CHINA' }] }),
    S({ id: 'pregunta', datoFuerte: true, pause: 0.4, amb: VIENTO(-32, 14),
      text: '¿Paró? No: casi hasta los setenta. Pero espera… ¿cómo lo hizo una mujer, hace 150 años, cuando viajar sola era casi imposible?',
      voz: '¿Paró? No: casi hasta los setenta. Pero espera… ¿cómo lo hizo una mujer, hace 150 años, cuando viajar sola era casi imposible?',
      subPartes: [['¿Paró? No:', 'casi hasta los setenta.'], ['Pero espera…'], ['¿cómo lo hizo una mujer,', 'hace 150 años,'], ['cuando viajar sola', 'era casi imposible?']],
      en: ["Did she stop?","No: not until almost seventy.","But wait…","how did a woman do it, 150 years ago, when travelling alone was almost impossible?"],
      shots: [{ ...REAL, a: ABF('Bird-manchu'), sc: 'PM', rotulo: 'ISABELLA BIRD · 1899' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'GP', from: 'casi' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'PP', from: 'Pero espera' }, { ...REAL, a: ABF('Isabella_Bird'), sc: 'PM', from: '¿cómo' }, { a: R('v-cara'), sc: 'PP', ss: 2, from: 'cuando viajar' }] }),
    S({ id: 'tres', pause: 0.3, amb: VIENTO(-32, 18),
      text: 'Su vida tiene tres partes: la niña enferma, el forajido… y la insensata que no paró.',
      en: ["Her life has three parts: the sick girl, the outlaw…","and the reckless woman who never stopped."],
      shots: [{ ...REAL, a: M('tres'), sc: 'GP' }] }),
    // ── 1 · LA NIÑA ENFERMA ──
    S({ id: 'nina', cambioTono: true, emocion: 'calida', pause: 0.3, amb: NOCHE(-34),
      text: 'De pequeña tenía la espalda mal, dolores de cabeza… y siempre se quejaba de lo mismo: «estoy muy cansada».',
      subPartes: [['De pequeña tenía la espalda mal,', 'dolores de cabeza…'], ['y siempre se quejaba de lo mismo:'], ['«estoy muy cansada».']],
      en: ['As a child she had a bad back, headaches…', 'and she always complained of the same thing: \u201CI\u2019m so tired.\u201D'],
      shots: [{ ...REAL, a: FR('fildes-doctor.png'), sc: 'GP', rotulo: 'CUADRO DE LUKE FILDES, 1891' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'PM', from: 'dolores' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'PP', from: 'y siempre' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'GP', from: '«estoy' }] }),
    S({ id: 'barco', pause: 0.3, amb: MAR(-28),
      text: 'A los veintidós, el médico le recetó… ¡un viaje en barco! Su padre le dio cien libras. Volvió siete meses después, mucho más sana.',
      subPartes: [['A los veintidós,', 'el médico le recetó…'], ['¡un viaje en barco!'], ['Su padre le dio cien libras.'], ['Volvió siete meses después,', 'mucho más sana.']],
      en: ["At twenty-two, the doctor prescribed…","a sea voyage!","Her father gave her a hundred pounds.","She came back seven months later, much healthier."],
      shots: [{ ...REAL, a: M('barco'), sc: 'GP' }, { ...REAL, a: ABF('Isabella_Bird'), sc: 'PM', from: 'Volvió' }] }),
    S({ id: 'sanson', datoFuerte: true, pause: 0.4, amb: MAR(-32, 6),
      text: 'Un médico lo resumió así: en casa era una inválida… y de viaje, Sansón.',
      en: ["A doctor summed it up: at home, an invalid…","abroad, a Samson."],
      cifra: { word: 'resumió', text: '«THE INVALID AT HOME AND THE SAMSON ABROAD»', sub: '— EDINBURGH MEDICAL JOURNAL, 1904', dur: 2.6, size: 50, retraso: 0.3, y: 300 },
      shots: [{ ...REAL, a: ABF('Isabella_Bird'), sc: 'PP' }, { ...REAL, a: ABF('Isabella_Bird'), sc: 'GP', from: 'así' }, { ...REAL, a: FR('fildes-doctor.png'), sc: 'PM', from: 'en casa' }, { ...REAL, a: FR('lady-p230.png'), sc: 'GP', from: 'y de viaje' }] }),
    // ── 2 · EL FORAJIDO ──
    S({ id: 'rocosas', pause: 0.3, amb: VIENTO(-30, 4),
      text: 'En 1873, con cuarenta y un años, llegó a las Montañas Rocosas. Gastaba diez chelines al día… y el equipaje lo llevaba en un fardo.',
      voz: 'En 1873, con cuarenta y un años, yegó a las Montañas Rocosas. Gastaba diez chelines al día… y el equipaje lo yevaba en un fardo.',
      subPartes: [['En 1873, con cuarenta y un años,'], ['llegó a las Montañas Rocosas.'], ['Gastaba diez chelines al día…'], ['y el equipaje', 'lo llevaba en un fardo.']],
      en: ["In 1873, aged forty-one, she reached the Rocky Mountains.","She spent ten shillings a day…","and carried her luggage in a bundle."],
      shots: [{ ...REAL, a: M('colorado'), sc: 'GP' }, { ...REAL, a: FR('lady-p121.png'), sc: 'GP', from: 'Gastaba' }, { ...REAL, a: FR('lady-p121.png'), sc: 'PM', from: 'diez' }, { ...REAL, a: FR('lady-p121.png'), sc: 'GP', from: 'al día' }, { ...REAL, a: FR('lady-p121.png'), sc: 'PP', from: 'y el equipaje', rotulo: 'ESTES PARK · GRABADO DE SU LIBRO' }] }),
    S({ id: 'jim', cambioTono: true, pause: 0.3, amb: BOSQUE(-32, 6),
      text: 'Su guía fue Jim Nugent: tuerto, con revólver… Ella escribió que llevaba «forajido» escrito por todas partes.',
      voz: 'Su guía fue Yim Niúyent: tuerto, con revólver… Eya escribió que yevaba «forajido» escrito por todas partes.',
      subPartes: [['Su guía fue Jim Nugent:'], ['tuerto, con revólver…'], ['Ella escribió que llevaba'], ['«forajido»', 'escrito por todas partes.']],
      en: ['Her guide was Jim Nugent: one-eyed, with a revolver…', 'She wrote that \u201Cdesperado\u201D was written all over him.'],
      cifra: [{ word: 'escribió', text: '«DESPERADO» WAS WRITTEN IN LARGE LETTERS ALL OVER HIM', sub: '— ISABELLA BIRD · 1873', dur: 2.6, size: 40, retraso: 0.2, y: 260 }],
      shots: [{ a: I('i-jim-cara'), sc: 'PM' }, { a: I('i-jim-ojo'), sc: 'PP', from: 'tuerto' }, { a: I('i-jim-cara'), sc: 'GP', from: 'Ella' }] }),
    S({ id: 'subida', pico: true, datoFuerte: true, pause: 0.4, amb: VIENTO(-28, 20),
      text: 'La subió al pico Longs, más alto que el Teide, atada a él con una cuerda. ¡Seis horas de terror!',
      en: ['He took her up Longs Peak, higher than Mount Teide, roped to him.', 'Six hours of terror!'],
      shots: [{ ...REAL, a: FR('jackson-longs-estes.jpg'), sc: 'GP', rotulo: 'PICO LONGS · FOTO DE W. H. JACKSON' }, { ...REAL, a: FR('jackson-longs-517493.jpg'), sc: 'GP', from: 'más alto' }, { ...REAL, a: FR('lady-p132.png'), sc: 'GP', from: 'atada' }, { ...REAL, a: FR('lady-p132.png'), sc: 'PP', from: '¡Seis' }] }),
    S({ id: 'promesa', cambioTono: true, pause: 0.4, amb: BOSQUE(-32, 12),
      text: 'Al despedirse, se prometieron algo: el primero que muriera… se le aparecería al otro.',
      subPartes: [['Al despedirse,', 'se prometieron algo:'], ['el primero que muriera…'], ['se le aparecería al otro.']],
      en: ["When they parted, they promised each other something: whoever died first…","would appear to the other."],
      shots: [{ a: I('i-despedida'), sc: 'GP' }, { a: I('i-despedida'), sc: 'PM', from: 'se prometieron' }, { a: I('i-despedida'), sc: 'PP', from: 'el primero' }] }),
    S({ id: 'fantasma', pico: true, datoFuerte: true, emocion: 'fria', pause: 0.6, amb: NOCHE(-32, 6),
      text: 'A Jim le pegaron un tiro y murió días después. Según su biógrafa, el día en que murió, en Suiza… ella lo vio de pie en su habitación.',
      voz: 'A Yim le pegaron un tiro y murió días después. Según su biógrafa, el día en que murió, en Suiza… eya lo vio de pie en su habitación.',
      subPartes: [['A Jim le pegaron un tiro', 'y murió días después.'], ['Según su biógrafa,', 'el día en que murió, en Suiza…'], ['ella lo vio de pie', 'en su habitación.']],
      cifra: { word: 'Suiza', text: 'SUIZA · 1874', sub: '', dur: 2.2, size: 70, retraso: 0.2, y: 260 },
      en: ['Jim was shot and died days later.', 'According to her biographer, on the day he died, in Switzerland…', 'she saw him standing in her room.'],
      shots: [{ a: I('i-jim-gris'), sc: 'PM', rotulo: 'JIM NUGENT · 1874' }, { a: I('i-jim-gris'), sc: 'PP', from: 'un tiro' }, { a: I('i-fantasma'), sc: 'GP', from: 'Según' }, { a: I('i-fantasma'), sc: 'PP', from: 'el día' }, { a: R('v-fantasma'), sc: 'PM', from: 'ella lo vio' }] }),
    // ── 3 · LA MUJER QUE NO PARÓ ──
    S({ id: 'ainu', pause: 0.3, amb: VIENTO(-32, 24),
      text: 'En 1878 durmió en las casas de los ainu, en el norte de Japón.',
      voz: 'En 1878 durmió en las casas de los ainu, en el norte de Japón.',
      en: ['In 1878 she slept in the homes of the Ainu, in northern Japan.'],
      shots: [{ ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'PM', rotulo: 'DE SU LIBRO SOBRE JAPÓN, 1880' }, { ...REAL, a: ABF('Ainu_by_Isabella_Bird'), sc: 'PP', from: 'de los ainu' }, { ...REAL, a: FR('torii-bird.jpg'), sc: 'GP', from: 'en el norte' }] }),
    S({ id: 'boda', humano: true, emocion: 'calida', pause: 0.4, amb: LLUVIA(-34),
      text: 'A los cuarenta y nueve se casó con el médico de su hermana. Cuando él murió, fundó un hospital con su nombre en Cachemira… y siguió viajando.',
      subPartes: [['A los cuarenta y nueve se casó', 'con el médico de su hermana.'], ['Cuando él murió,'], ['fundó un hospital con su nombre', 'en Cachemira…'], ['y siguió viajando.']],
      en: ["At forty-nine she married her sister’s doctor.","When he died, she founded a hospital in his name in Kashmir…","and kept travelling."],
      shots: [{ ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'PM' }, { ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'GP', from: 'se casó' }, { ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'PP', from: 'Cuando' }, { ...REAL, a: M('ruta'), sc: 'GP', ss: 2, from: 'fundó' }, { ...REAL, a: FR('viaje-bird.jpg'), sc: 'GP', from: 'y siguió', rotulo: 'FOTO DE ISABELLA BIRD, 1894-97' }] }),
    S({ id: 'rgs', pause: 0.4, amb: VIENTO(-34, 32),
      text: 'En 1892 fue la primera mujer aceptada en la Real Sociedad Geográfica de Londres.',
      voz: 'En 1892 fue la primera mujer aceptada en la Real Sociedad Geográfica de Londres.',
      subPartes: [['En 1892 fue', 'la primera mujer aceptada'], ['en la Real Sociedad Geográfica', 'de Londres.']],
      en: ['In 1892 she became the first woman admitted to the Royal Geographical Society in London.'],
      shots: [{ ...REAL, a: ABF('Bird-manchu'), sc: 'PP' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'GP', from: 'primera' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'GP', from: 'en la Real' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PM', from: 'de Londres' }] }),
    S({ id: 'fotos', datoFuerte: true, pause: 0.4, amb: VIENTO(-32, 28),
      text: 'Hacía sus propias fotos. Estas son suyas, de China… donde a los sesenta y cuatro le dieron una pedrada en la cabeza.',
      subPartes: [['Hacía sus propias fotos.'], ['Estas son suyas, de China…'], ['donde a los sesenta y cuatro'], ['le dieron una pedrada', 'en la cabeza.']],
      en: ['She took her own photographs.', 'These are hers, from China…', 'where, at sixty-four, she was hit on the head by a stone.'],
      shots: [{ ...REAL, a: FO('yangtze-97-foto'), sc: 'GP', rotulo: 'FOTOS DE ISABELLA BIRD · CHINA, 1896' }, { ...REAL, a: FO('yangtze-116-foto'), sc: 'GP', from: 'Estas' }, { ...REAL, a: FO('yangtze-158-foto'), sc: 'PM', from: 'donde' }, { ...REAL, a: FO('yangtze-237-foto'), sc: 'PM', from: 'le dieron' }] }),
    // ── GIRO ──
    S({ id: 'escalera', datoFuerte: true, emocion: 'calida', pause: 0.4, amb: MAR(-32, 10),
      text: 'A los sesenta y nueve, en Marruecos, subía al caballo del sultán… ¡con una escalera!',
      en: ["At sixty-nine, in Morocco, she climbed onto the sultan’s horse…","with a ladder!"],
      shots: [{ a: R('v-escalera'), sc: 'GP', ss: 0.8, rotulo: 'MARRUECOS · 1901' }, { a: I('i-escalera-fin'), sc: 'GP', from: 'sultán' }] }),
    S({ id: 'muere', pause: 0.5, amb: LLUVIA(-34, 6),
      text: 'Murió en 1904, soñando con volver a China.',
      voz: 'Murió en 1904, soñando con volver a China.',
      en: ['She died in 1904, dreaming of returning to China.'],
      cifra: { word: 'Murió', text: 'ISABELLA BIRD', sub: '1831 – 1904', dur: 2.2, size: 90, retraso: 0.2, y: 260 },
      shots: [{ ...REAL, a: ABF('Isabella_Bird'), sc: 'PM' }, { ...REAL, a: FO('yangtze-107-foto'), sc: 'GP', from: 'soñando' }] }),
    S({ id: 'cap1', pause: 1.5, amb: VIENTO(-34, 30),
      text: 'Su viaje con los ainu es el capítulo uno.',
      en: ['Her journey with the Ainu is chapter one.'],
      shots: [{ ...REAL, a: `FILE:${AB}/clips/caballo-v4.mp4`, sc: 'GP', rotulo: 'CAPÍTULO 1 · LOS AINU' }] }),
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
