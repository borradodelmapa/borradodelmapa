// SHORT 9:16 «Los ifugao» · Pueblos borrados del mapa T2, bloque Filipinas (21 nov 2026, 🎬 Vídeo; OK de Paco: «Sí, adelante»).
// Guion de dirección: docs/pueblos-ifugao-short-guion-direccion.md (revisado por el revisor de guion). Estudio de título: pueblos/ifugao/estudio-titulo.md (título 2).
// Narra solo Salma (Paco no ha estado: F2). Fotos de Wikimedia Commons libres (pueblos/ifugao/fotos/ATRIBUCIONES.txt). Sin IA.
// Puede pasar de 60 s (Paco, 21 nov: «si es necesario no importa en esta ocasión que supere los 60 segundos»).
const fs = require('fs');
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const SALMA_EXPRESIVA = { ...SALMA_DOC, vs: { ...SALMA_DOC.vs, stability: 0.0 } }; // la de los episodios de Pueblos (mlabri, kalash)
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ifugao';
const TT = !!process.env.TIKTOK;
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const PAJAROS = (db, ss = 0) => ({ src: 'SFX_pajaros-libre', ss, db });
const S = ({ sub, ...o }) => ({ who: 'salma', scene: true, sceneEnd: true, pause: o.pause ?? 0.3, ...o, ...(sub ? { subPartes: sub } : {}) }); // sub → subPartes (M25)
const Q = (word, text, sub, dur = 1.6) => ({ word, text, sub, dur, retraso: 0.1, size: 190 });
const MUS = (de, a, ss, db = -12) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.6 }, ss, db, fi: 1.2, fo: 1.5, voz: 1 });

const blocks = [
  S({ id: 'g0', emocion: 'fria', amb: PAJAROS(-30),
    text: 'Los ifugao cultivaron estas montañas a mano durante siglos. En noviembre de 2025, un tifón se llevó un trozo.',
    en: ['The Ifugao farmed these mountains by hand for centuries.', 'In November 2025, a typhoon took a piece of them.'],
    sub: [['Los ifugao cultivaron', 'estas montañas a mano'], ['durante siglos.'], ['En noviembre de 2025,', 'un tifón se llevó un trozo.']],
    shots: [{ a: 'W23', sc: 'PM' }, { a: 'W118', sc: 'PM', from: 'durante' }, { a: 'W67', sc: 'GP', from: 'En' }, { a: 'W78', sc: 'GP', from: 'tifón' }] }),
  S({ id: 'promesa', emocion: 'fria', amb: PAJAROS(-30, 4),
    text: 'Lo que se llevó quizá no tenía la edad que se dijo.',
    en: ['What it took may not have been as old as they said.'],
    sub: [['Lo que se llevó quizá no tenía', 'la edad que se dijo.']],
    shots: [{ a: 'W79', sc: 'GP', asombro: true }] }), // M24: Batad desde el aire, sostenido, sin cifra ni rótulo
  { id: 'mapa', video: B + '/mapa-ifugao-short.mp4', fixed: 5.5, amb: VIENTO(-34) },
  S({ id: 'situar', emocion: 'calida', amb: PAJAROS(-30, 8), cifra: [{ word: 'metros', text: '1.500 M', sub: '4 TORRES EIFFEL Y MEDIA', dur: 1.3, size: 190 }], // N20
    text: 'Ifugao, en el norte de Filipinas. Terrazas de arroz hasta unos 1.500 metros, Patrimonio de la Humanidad desde 1995.',
    en: ['Ifugao, in northern Philippines.', 'Rice terraces up to about 1,500 metres, a World Heritage Site since 1995.'],
    sub: [['Ifugao,', 'en el norte de Filipinas.'], ['Terrazas de arroz', 'hasta unos 1.500 metros,'], ['Patrimonio de la Humanidad', 'desde 1995.']],
    shots: [{ a: 'W85', sc: 'GP', rotulo: 'IFUGAO · FILIPINAS' }, { a: 'W114', sc: 'GP', from: 'Terrazas' }, { a: 'W125', sc: 'GP', from: 'Patrimonio' }, { a: 'W135', sc: 'PM', from: '1995' }] }), // M10: la cifra cae sobre paisaje, no sobre la cara
  S({ id: 'como', emocion: 'calida', amb: VIENTO(-32, 6),
    text: 'Arriba de las terrazas hay un bosque, el muyong. De ahí baja el agua que las riega, de bancal en bancal.',
    en: ['Above the terraces there is a forest, the muyong.', 'From there comes the water that irrigates them, terrace by terrace.'],
    sub: [['Arriba de las terrazas', 'hay un bosque, el muyong.'], ['De ahí baja el agua', 'que las riega,'], ['de bancal en bancal.']],
    shots: [{ a: 'W93', sc: 'GP' }, { a: 'W90', sc: 'GP', from: 'muyong' }, { a: 'W99', sc: 'PM', from: 'De' }, { a: 'W100', sc: 'PM', from: 'bancal' }] }),
  S({ id: 'debate', emocion: 'fria', pico: true, datoFuerte: true, pause: 0.4, amb: VIENTO(-34, 12),
    text: '¿Cuántos años tienen? La UNESCO habla de dos mil, desde tiempos de los romanos. Según el arqueólogo Stephen Acabado, de la UCLA, con carbono 14, unos cuatrocientos: las levantaron al llegar los españoles, para hacerse fuertes en la montaña.',
    voz: '¿Cuántos años tienen? La UNESCO habla de dos mil, desde tiempos de los romanos. Según el arqueólogo Stephen Acabado, de la U.C.L.A., con carbono catorce, unos cuatrocientos: las levantaron al llegar los españoles, para hacerse fuertes en la montaña.',
    en: ['How old are they?', 'UNESCO says two thousand years, since Roman times.', 'According to archaeologist Stephen Acabado, of UCLA, with carbon-14 dating, about four hundred: they were built when the Spanish arrived, to hold out in the mountains.'],
    sub: [['¿Cuántos años tienen?'], ['La UNESCO habla de dos mil,', 'desde tiempos de los romanos.'], ['Según el arqueólogo', 'Stephen Acabado, de la UCLA,'], ['con carbono 14,', 'unos cuatrocientos:'], ['las levantaron', 'al llegar los españoles,'], ['para hacerse fuertes', 'en la montaña.']],
    cifra: [{ ...Q('Cuántos', '¿2.000 AÑOS?', 'LO QUE DICE LA UNESCO', 1.1), size: 150 }, { word: 'cuatrocientos', text: '400 AÑOS', sub: 'LO QUE DICE LA ARQUEOLOGÍA', dur: 1.8, size: 190 }],
    shots: [{ a: 'W140', sc: 'GP', look: 'trix' }, { a: 'W61', sc: 'PM', from: 'UNESCO', look: 'trix' }, { a: 'W112', sc: 'GP', from: 'Según' }, { a: 'W120', sc: 'GP', from: 'Acabado' }, { a: 'W140', sc: 'D', from: 'carbono', look: 'trix', pan: [0.6, 0.55, 0.68, 0.5], z: 0.5 }, { a: 'W86', sc: 'GP', from: 'unos' }, { a: 'W87', sc: 'GP', from: 'levantaron' }, { a: 'W71', sc: 'GP', from: 'para' }] }),
  // Historia del pueblo (Paco, 21 nov 2026: «sobre los ifugao no dice nada. Podría hablar un poco de su historia»; texto suyo: «Los ifugao Filipinas habitan estas montañas. El arroz está protegido con un bulul un dios tallado en madera. Al cosechar cantaban los hudhud (¿qué es?)»)
  S({ id: 'historia', emocion: 'calida', amb: PAJAROS(-30, 16),
    text: 'Su arroz lo protege un bulul, un dios tallado en madera. Al cosechar cantaban los hudhud, largos cantos sobre sus héroes y antepasados, que hoy recuerdan sobre todo las mujeres mayores.',
    en: ['Their rice is protected by a bulul, a god carved in wood.', 'At harvest they sang the hudhud, long chants about their heroes and ancestors, which today are remembered mostly by older women.'],
    sub: [['Su arroz lo protege un bulul,'], ['un dios tallado en madera.'], ['Al cosechar cantaban', 'los hudhud, largos cantos'], ['sobre sus héroes', 'y antepasados,'], ['que hoy recuerdan sobre todo', 'las mujeres mayores.']],
    shots: [{ a: 'W163', sc: 'PP' }, { a: 'W165', sc: 'PM', from: 'dios' }, { a: 'W32', sc: 'PM', from: 'Al' }, { a: 'W39', sc: 'PM', from: 'sobre sus' }, { a: 'W41', sc: 'PM', from: 'que', pan: [0.5, 1.0, 0.5, 1.0], z: 0.6 }] }),
  S({ id: 'borra', emocion: 'fria', humano: true, cambioTono: true, amb: VIENTO(-30, 4),
    text: 'Ahora los jóvenes se van y muchas terrazas se abandonan. El tifón de 2025 rompió en Batad un canal de siglos y se llevó dos vidas.',
    en: ['Now the young people leave and many terraces are abandoned.', 'The 2025 typhoon broke a centuries-old canal in Batad and took two lives.'],
    sub: [['Ahora los jóvenes se van'], ['y muchas terrazas', 'se abandonan.'], ['El tifón de 2025', 'rompió en Batad'], ['un canal de siglos', 'y se llevó dos vidas.']],
    shots: [{ a: 'W127', sc: 'PM' }, { a: 'W98', sc: 'GP', from: 'muchas' }, { a: 'W141', sc: 'GP', from: 'El' }, { a: 'W91', sc: 'GP', from: 'canal' }] }),
  S({ id: 'cierre', emocion: 'calida', pause: 0.3, amb: PAJAROS(-30, 10),
    text: 'Los muros los vuelven a levantar los vecinos, a mano, piedra a piedra.',
    en: ['The walls are being rebuilt by the neighbours, by hand, stone by stone.'],
    sub: [['Los muros los vuelven', 'a levantar los vecinos,'], ['a mano, piedra a piedra.']],
    shots: [{ a: 'W89', sc: 'GP' }, { a: 'W147', sc: 'PM', from: 'levantar' }, { a: 'W131', sc: 'PM', from: 'mano' }] }), // M18: cierra con la gente trabajando a mano
  { id: 'silencio', video: B + '/clips/w131-cierre-09.mp4', fixed: 0.9, amb: PAJAROS(-30, 14) }, // M43
];
fs.writeFileSync(B + '/guion-short.txt', blocks.filter(b => b.who).map(b => b.text).join('\n') + '\n');
console.log('VOZ: ' + blocks.filter(b => b.who).reduce((a, b) => a + (b.voz || b.text).length, 0) + ' caracteres');
if (process.env.SOLO_TEXTO) process.exit(0);
build({
  titulo: 'LOS IFUGAO · PUEBLOS BORRADOS DEL MAPA', id: 'pueblos-ifugao-short-v1' + (TT ? '-tiktok' : ''),
  nombre: ['ifugao'], fecha: '2026-12-17', fechaTikTok: '2026-12-30', // Estrategia (21 nov): YouTube jue 17 dic 10:00 (el 16 es de los kalash); TikTok mié 30 dic 10:00 (primer mar-jue libre en Metricool desde el 29)
  out: B + '/salida-short', fotosSerie: B + '/fotos', ultima: B + (TT ? '/ULTIMA-short-tiktok' : '/ULTIMA-short'), ultimaNombre: 'ifugao-terrazas-de-arroz-2000-o-400-anos',
  look: 'portra', counter: 'PUEBLOS BORRADOS · T2', portada: { png: B + '/caratula/ifugao-B.png' } /* Paco, 21 nov: «la imagen de la carátula está quemada. Pon otra imagen» → W41 */,
  voices: { salma: SALMA_EXPRESIVA }, sintonia: { src: 'SFX_sintonia-pueblos', db: -8 },
  musica: { src: 'SFX_bosque-invierno', ratio: 3, trozos: [MUS('situar', 'como', 2), MUS('cierre', 'cierre', 42)] }, // N14-4: sin música en lo humano (borra)
  cardSecs: 4.0, cardP1: 2.2, kb: 1.0, humanoExtra: 0, gap: { same: 0.2, change: 0.4 }, voiceDb: { salma: -25 }, duckRatio: 5,
  seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 26.5 }, // M10: después de la cifra de 1.500 m, sin taparla
  card: TT ? { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SUSCRÍBETE AL CANAL', l3: '▼  Mira el vídeo relacionado', l4: '', l5: '' }, // M14 · relacionado: Sagada
  descartes: { M16: 'M16 (18 nov): shorts sin clip de la app', M10: 'subtítulos EN aparte (Y10)', M14: 'tarjeta de short (4 s, con el fotograma de la app, M14 del 20 nov): el vídeo pasa de 65 s solo por la excepción N10 de Paco', N10: 'excepción de Paco solo para este short: «si es necesario no importa en esta ocasión que supere los 60 segundos» (21 nov 2026)' },
  blocks,
}).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
