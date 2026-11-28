// VIAJEROS DEL MUNDO · 2 · «La insensata viajera» (Isabella Bird) — 26 nov 2026, 🎬 Vídeo 2.
// Guion v6 con el formato del capítulo 1 (docs/bird-biografia-guion-v6-formato-cap1.md): un hilo (Colorado, 1873), mapa que abre y vuelve,
// misterio en el segundo 20, tres partes y giro. Paco: «SI REHAZLO CON ESE FORMATO» y, al ver el guion, «Sí, monta» (26 nov).
// UNA IMAGEN POR FRASE, la que enseña lo que se dice. Recreaciones de Runway ya hechas (0 € nuevos); mapas: mapas-bird-vida.cjs.
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/bird-vida', AB = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu-bird';
const R = n => `FILE:${B}/recreaciones/${n}.mp4`, I = n => `FILE:${B}/recreaciones/${n}.png`, M = n => `FILE:${B}/mapas/${n}.mp4`;
const FO = n => `FILE:${B}/fotos/${n}.jpg`, ABF = n => `FILE:${AB}/fotos/${n}.jpg`, REAL = { real: true }, CA = n => `FILE:${B}/caratula/ia/${n}.png`;
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const BOSQUE = (db, ss = 0) => ({ src: 'SFX_bosque-invierno', ss, db });
const NOCHE = (db, ss = 0) => ({ src: 'SFX_noche-calma', ss, db });
const TT = process.env.TIKTOK === '1';
const S = b => ({ who: 'salma', scene: true, sceneEnd: true, ...b });
const cfg = {
  titulo: 'VIAJEROS DEL MUNDO · 2',
  id: 'viajeros-2-bird-vida-v15' + (TT ? '-tiktok' : ''),
  nombre: ['Isabella Bird'],
  out: B + '/salida', fotosSerie: B + '/fotos', ultima: B + (TT ? '/ULTIMA-tiktok' : '/ULTIMA'), ultimaNombre: 'mujeres-viajeras-viajo-sola-cuando-era-imposible',
  look: 'portra', counter: 'RECREACIÓN', // F10/L1: cartel de esquina en todas las recreaciones; fotos reales y mapas con real:true
  portada: { png: B + '/caratula/bird-vida-caratula.png' },
  voices: { salma: SALMA_DOC }, voiceDb: { salma: -25 },
  cardSecs: 3.5, kb: 0.8, seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 20 },
  cardP1: 3.5, card: TT ? { l1: 'VIAJEROS DEL MUNDO', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'VIAJEROS DEL MUNDO', l2: 'SUSCRÍBETE AL CANAL', l3: '', l4: '', l5: '' },
  descartes: {
    N10: 'serie «Viajeros del mundo» en formato de 2 min, como el capítulo 1 (excepción de Paco del 22 nov); pendiente de que Paco la confirme para la serie',
    M14: 'short (N10 con excepción): tarjeta de short de 3,5 s',
    M16: 'shorts sin clip de la app (18 nov)',
    G2: 'formato del capítulo 1 que pidió Paco (26 nov): abre con el mapa de Colorado y el nombre llega en la tercera frase; en esta serie el nombre no es el gancho (checklist 25 nov · 23:00)',
    M7: 'el mapa animado abre como primer plano del bloque 1 (montana), igual que el capítulo 1 aprobado; no hace falta otro bloque de vídeo',
    S5: 'sin música hasta que Paco la elija de oído',
    S3: 'serie nueva sin sintonía propia todavía: la elige Paco de oído (S5)',
  },
  blocks: [
    // ── ARRANQUE (misterio en el segundo 20) ──
    // 1 · Mapa: del mundo a Colorado
    S({ id: 'montana', pause: 0.2, amb: VIENTO(-30),
      text: 'Mira esta montaña de Colorado: el pico Longs, más alto que el Teide.',
      subPartes: [['Mira esta montaña', 'de Colorado:'], ['el pico Longs,', 'más alto que el Teide.']],
      en: ['Look at this mountain in Colorado: Longs Peak, higher than Mount Teide.'],
      shots: [{ ...REAL, a: M('colorado'), sc: 'GP' }, { ...REAL, a: FO('longs-hoy'), sc: 'GP', from: 'el pico', rotulo: 'PICO LONGS · 4.346 M · HOY' }] }),
    // 2 · Foto real del pico
    S({ id: 'subio', pause: 0.2, amb: VIENTO(-30, 4),
      text: 'En 1873 la subió una inglesa de cuarenta y un años, enferma desde niña.',
      voz: 'En mil ochocientos setenta y tres la subió una inglesa de cuarenta y un años, enferma desde niña.',
      subPartes: [['En 1873 la subió', 'una inglesa de cuarenta y un años,'], ['enferma desde niña.']],
      en: ['In 1873 a 41-year-old Englishwoman climbed it, sick since childhood.'],
      shots: [{ ...REAL, a: FO('longs-bierstadt'), sc: 'GP', rotulo: 'CUADRO DE HACIA 1876 · HACE 150 AÑOS' }, { ...REAL, a: ABF('Isabella_Bird'), sc: 'PM', from: 'una inglesa' }] }),
    // 3 · Grabado real de Bird
    S({ id: 'nombre', pause: 0.2, amb: VIENTO(-32, 8),
      text: 'Se llamaba Isabella Bird, y viajaba sola, a caballo.',
      voz: 'Se yamaba Isabela Bird, y viajaba sola, a caballo.',
      en: ['Her name was Isabella Bird, and she travelled alone, on horseback.'],
      shots: [{ ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PM', rotulo: 'ISABELLA BIRD' }, { ...REAL, a: ABF('Isabella_Bird-pad'), sc: 'PP', from: 'y viajaba' }] }),
    // 4 · El forajido y la promesa (se abre el misterio)
    S({ id: 'misterio', datoFuerte: true, pause: 0.4, amb: BOSQUE(-32),
      text: 'Allí conoció a un forajido y se hicieron una promesa imposible. Su biógrafa cuenta que se cumplió.',
      subPartes: [['Allí conoció a un forajido'], ['y se hicieron', 'una promesa imposible.'], ['Su biógrafa cuenta', 'que se cumplió.']],
      en: ['There she met an outlaw, and they made an impossible promise.', 'Her biographer says it came true.'],
      shots: [{ a: I('i-jim-niebla2'), sc: 'GP' }, { a: CA('cine-2'), sc: 'PM', from: 'y se hicieron' }, { a: CA('cine-3'), sc: 'PP', from: 'Su biógrafa' }] }),
    // 5 · Mapa: tres partes
    S({ id: 'partes', pause: 0.3, amb: VIENTO(-32, 12),
      text: 'La historia tiene tres partes: un forajido, una ventisca y una promesa. Al final vas a ver cómo se cumplió.',
      subPartes: [['La historia tiene tres partes:'], ['un forajido,', 'una ventisca y una promesa.'], ['Al final vas a ver', 'cómo se cumplió.']],
      en: ['The story has three parts: an outlaw, a blizzard and a promise.', 'At the end you\u2019ll see how it came true.'],
      shots: [{ ...REAL, a: M('partes'), sc: 'GP' }] }),
    // ── 1 · EL FORAJIDO ──
    S({ id: 'jim', cambioTono: true, pause: 0.3, amb: VIENTO(-32, 16),
      text: 'Su guía era Jim Nugent: tuerto, con revólver y cuchillo. Ella escribió que llevaba «forajido» escrito por todas partes.',
      voz: 'Su guía era Yim Niúyent: tuerto, con revólver y cuchiyo. Ella escribió que yevaba «forajido» escrito por todas partes.',
      subPartes: [['Su guía era Jim Nugent:'], ['tuerto, con revólver', 'y cuchillo.'], ['Ella escribió que llevaba'], ['«forajido»', 'escrito por todas partes.']],
      en: ['Her guide was Jim Nugent: one-eyed, with a revolver and a knife.', 'She wrote that \u201Cdesperado\u201D was written all over him.'],
      cifra: [{ word: 'escribió', text: '«DESPERADO» WAS WRITTEN ALL OVER HIM', sub: '— ISABELLA BIRD · 1873', dur: 2.6, size: 50, retraso: 0.2, y: 260 }],
      shots: [{ a: I('i-jim-cara'), sc: 'PM' }, { a: I('i-jim-ojo'), sc: 'PP', from: 'tuerto' }, { a: I('i-jim-cara'), sc: 'GP', from: 'Ella' }] }),
    S({ id: 'estorbo', pause: 0.3, amb: VIENTO(-30, 20),
      text: 'En la subida, uno del grupo dijo que una mujer era un estorbo peligroso. Jim contestó que, si no era para subir a una dama, él no subía.',
      voz: 'En la subida, uno del grupo dijo que una mujer era un estorbo peligroso. Yim contestó que, si no era para subir a una dama, él no subía.',
      subPartes: [['En la subida, uno del grupo dijo'], ['que una mujer era', 'un estorbo peligroso.'], ['Jim contestó que,'], ['si no era para subir a una dama,'], ['él no subía.']],
      en: ['On the way up, one of the group said a woman was a dangerous encumbrance.', 'Jim replied that if it wasn\u2019t to take a lady up, he wasn\u2019t going up.'],
      shots: [{ a: I('i-estorbo'), sc: 'GP' }, { a: I('i-estorbo'), sc: 'PM', from: 'que una mujer' }, { a: I('i-jim-ojo'), sc: 'PM', from: 'Jim contestó' }, { a: CA('cine-2'), sc: 'GP', from: 'si no era' }] }),
    S({ id: 'fardo', pause: 0.4, amb: VIENTO(-28, 24),
      text: 'La arrastró hasta la cumbre como un fardo. Seis horas de terror, escribió ella.',
      en: ['He dragged her to the summit like a bale of goods.', '\u201CSix hours of terror,\u201D she wrote.'],
      cifra: { word: 'Seis', text: '6 HORAS', sub: 'ATADA A JIM CON UNA CUERDA', dur: 1.6, size: 150, retraso: 0.1, y: 310 },
      shots: [{ a: I('i-subida'), sc: 'GP' }, { a: I('i-subida'), sc: 'PM', from: 'como un' }, { a: R('v-cara'), sc: 'PP', from: 'Seis' }] }),
    // ── 2 · LA VENTISCA ──
    S({ id: 'llano', pause: 0.3, amb: BOSQUE(-30, 4),
      text: 'Dos meses después bajó sola al llano, a por las cartas de su hermana.',
      voz: 'Dos meses después bajó sola al yano, a por las cartas de su hermana.',
      en: ['Two months later she rode down alone to the plains, to collect her sister\u2019s letters.'],
      shots: [{ ...REAL, a: M('llano'), sc: 'GP' }] }),
    S({ id: 'tiro-broma', cambioTono: true, pause: 0.4, amb: BOSQUE(-30, 10),
      text: 'En la niebla sonó un tiro junto a su oreja. Era Jim, gastándole una broma. En su cabaña le dijo que nunca había visto a nadie tan insensato.',
      voz: 'En la niebla sonó un tiro junto a su oreja. Era Yim, gastándole una broma. En su cabaña le dijo que nunca había visto a nadie tan insensato.',
      subPartes: [['En la niebla sonó un tiro', 'junto a su oreja.'], ['Era Jim,', 'gastándole una broma.'], ['En su cabaña le dijo'], ['que nunca había visto', 'a nadie tan insensato.']],
      en: ['In the fog a shot rang out beside her ear.', 'It was Jim, playing a joke on her.', 'In his cabin he told her he had never seen anyone so foolish.'],
      shots: [{ a: R('v-jim-niebla'), sc: 'PM', ss: 0.8 }, { a: I('i-jim-niebla'), sc: 'PM', from: 'sonó' }, { a: I('i-jim-niebla2'), sc: 'PP', from: 'Era Jim' }, { a: I('i-cena'), sc: 'GP', from: 'En su cabaña' }, { a: I('i-jim-ojo'), sc: 'PP', from: 'a nadie' }] }),
    S({ id: 'lago', datoFuerte: true, emocion: 'fria', pause: 0.4, amb: VIENTO(-24, 12),
      text: 'Ella siguió. Su poni se metió en un lago helado y el hielo se rompió.',
      subPartes: [['Ella siguió.'], ['Su poni se metió', 'en un lago helado'], ['y el hielo se rompió.']],
      en: ['She rode on.', 'Her pony walked onto a frozen lake and the ice broke.'],
      shots: [{ a: R('v-lago'), sc: 'PM' }, { a: I('i-lago'), sc: 'PM', from: 'Su poni' }, { a: I('i-lago'), sc: 'PP', from: 'y el hielo' }] }),
    S({ id: 'posadero', humano: true, emocion: 'fria', pause: 0.4, amb: VIENTO(-30, 20),
      text: 'Llegó tan helada que el posadero tuvo que bajarla del caballo en brazos.',
      subPartes: [['Llegó tan helada'], ['que el posadero tuvo que bajarla', 'del caballo en brazos.']],
      voz: 'Yegó tan helada que el posadero tuvo que bajarla del caballo en brazos.',
      en: ['She arrived so frozen that the innkeeper had to lift her down from the horse in his arms.'],
      shots: [{ a: R('v-posadero'), sc: 'PM' }, { a: I('i-posadero'), sc: 'PP', from: 'del caballo' }] }),
    // ── 3 · LA PROMESA ──
    S({ id: 'promesa', cambioTono: true, pause: 0.4, amb: BOSQUE(-32, 12),
      text: 'Al despedirse, se prometieron una cosa: el primero que muriera se le aparecería al otro.',
      subPartes: [['Al despedirse,', 'se prometieron una cosa:'], ['el primero que muriera'], ['se le aparecería al otro.']],
      en: ['When they parted, they promised each other one thing: whoever died first would appear to the other.'],
      shots: [{ a: I('i-despedida'), sc: 'GP' }, { a: I('i-despedida'), sc: 'PM', from: 'el primero' }, { a: I('i-despedida'), sc: 'PP', from: 'se le' }] }),
    S({ id: 'muerte-jim', pause: 0.6, amb: NOCHE(-34),
      text: 'Meses después, a Jim le pegaron un tiro.',
      voz: 'Meses después, a Yim le pegaron un tiro.',
      en: ['Months later, Jim was shot.'],
      shots: [{ a: I('i-jim-gris'), sc: 'PM', rotulo: 'JIM NUGENT · 1874' }, { a: I('i-jim-gris'), sc: 'PP', from: 'le pegaron' }] }),
    S({ id: 'fantasma', pico: true, datoFuerte: true, emocion: 'fria', pause: 0.7, amb: NOCHE(-32, 6),
      text: 'En Suiza, ella lo vio de pie en su habitación. Le hizo una reverencia y desapareció. Era el día de su muerte.',
      subPartes: [['En Suiza, ella lo vio', 'de pie en su habitación.'], ['Le hizo una reverencia', 'y desapareció.'], ['Era el día de su muerte.']],
      cifra: { word: 'Suiza', text: '1874', sub: 'INTERLAKEN · SUIZA', dur: 1.6, size: 150, retraso: 0.1, y: 240 },
      en: ['In Switzerland, she saw him standing in her room.', 'He bowed and vanished.', 'It was the day of his death.'],
      shots: [{ a: I('i-fantasma'), sc: 'GP' }, { a: I('i-fantasma'), sc: 'PP', from: 'de pie' }, { a: R('v-fantasma'), sc: 'PM', from: 'Le hizo' }, { a: I('i-jim-gris'), sc: 'PP', from: 'Era el día' }] }),
    // ── GIRO ──
    S({ id: 'treinta', pause: 0.3, amb: VIENTO(-32, 24),
      text: 'Ella siguió viajando casi treinta años más.',
      en: ['She kept travelling for almost thirty more years.'],
      shots: [{ ...REAL, a: M('vuelta'), sc: 'GP' }] }),
    S({ id: 'escalera', emocion: 'calida', pause: 0.4, amb: VIENTO(-34, 28),
      text: 'A los sesenta y nueve, subía al caballo con escalera. Murió en 1904, soñando con volver a China.',
      voz: 'A los sesenta y nueve, subía al caballo con escalera. Murió en mil novecientos cuatro, soñando con volver a China.',
      subPartes: [['A los sesenta y nueve,', 'subía al caballo con escalera.'], ['Murió en 1904,', 'soñando con volver a China.']],
      en: ['At sixty-nine, she climbed onto her horse with a ladder.', 'She died in 1904, dreaming of returning to China.'],
      shots: [{ a: R('v-escalera'), sc: 'PM' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'PM', from: 'Murió', rotulo: 'ISABELLA BIRD · 1899' }, { ...REAL, a: ABF('Bird-manchu'), sc: 'PP', from: 'soñando' }, { ...REAL, a: ABF('Portrait_of_Isabella_Bird'), sc: 'PM', from: 'volver' }] }),
    S({ id: 'cap1', pause: 0.3, amb: VIENTO(-34, 30),
      text: 'En 1878 se metió en una aldea ainu: esa historia es el capítulo uno.',
      voz: 'En mil ochocientos setenta y ocho se metió en una aldea ainu: esa historia es el capítulo uno.',
      en: ['In 1878 she went into an Ainu village: that story is chapter one.'],
      shots: [{ ...REAL, a: `FILE:${AB}/clips/caballo-v4.mp4`, sc: 'GP', rotulo: 'CAPÍTULO 1 · LOS AINU' }] }),
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
