// BUTÁN · Short 1 «EL NIDO DEL TIGRE» — configuración (piloto de shorts de guías con historia, 29-30 oct 2026)
// Datos: guía borradodelmapa.com/butan-en-15-dias-de-paro-a-trashigang-xolc (3.120 m, 5 h, 700 m, salir a las 7, sin móvil) + Rubin Museum / MyBhutan (1692, incendio 1998, reconstrucción hasta 2005). Fuentes: docs/india-notas-y-fuentes.md
// Fotos: Wikimedia Commons (CC BY / CC BY-SA, atribuciones en butan/fotos/ATRIBUCIONES.txt). Clip de la app: butan/clip-app-nido.mp4 (grabación de Paco). Mapa: mapa-butan.cjs (0 €).
const { build } = require('./motor.cjs');
const { SALMA } = require('./voces.cjs');
const B = 'C:/Users/User/Desktop/salma/salma marketing/butan';
const f = n => 'FILE:' + B + '/fotos/' + n + '.jpg';
const cfg = {
  titulo: 'BUTÁN · EL NIDO DEL TIGRE',
  id: 'butan-short1-nido-del-tigre-v2',
  out: B + '/salida',
  look: 'portra', counter: 'BUTÁN · DÍA 2',
  portada: { foto: f('t3'), foco: [0.5, 0.45, 0.85], l1: 'EL NIDO DEL TIGRE', l2: 'LA LEYENDA', tag: 'BORRADO DEL MAPA · BUTÁN' },
  voices: { salma: SALMA },
  cardSecs: 8, kb: 1.6, seguir: { activo: true, seg: 30, texto: 'Si te está gustando, sígueme' }, duckRatio: 5, gap: { same: 0.4, change: 0.85 }, voiceDb: { salma: -25 },
  card: { l1: 'EL NIDO DEL TIGRE', l2: 'BUTÁN · DÍA 2', l3: 'Ruta de 16 días · 37 paradas', l4: 'RUTA COMPLETA', l5: 'Bután en 16 días' },
  blocks: [
    { id: 'gancho', who: 'salma', scene: true, sceneEnd: true, pause: 0.4,
      text: '¿Cómo se sube un monasterio a un acantilado de 3.120 metros?', en: ['How do you get a monastery up a 3,120-metre cliff?'],
      cifra: { word: '3120', text: '3.120 M', sub: 'DE ALTITUD', dur: 2.4 },
      shots: [{ a: f('t9'), sc: 'GP' }, { a: f('t4'), sc: 'PM', from: 'a un acantilado' }] },
    { id: 'mapa', video: B + '/mapa-butan.mp4', fixed: 5.5 },
    { id: 'leyenda', who: 'salma', scene: true, sceneEnd: true, pause: 0.4, look: 'trix', rotulo: 'TAKTSANG · PARO, BUTÁN',
      text: 'Según la tradición, en el siglo VIII Guru Rinpoche llegó volando a lomos de una tigresa. Y meditó aquí tres años, tres meses y tres días.',
      voz: 'Según la tradición, en el siglo ocho Guru Rinpoche llegó volando a lomos de una tigresa. Y meditó aquí tres años, tres meses y tres días.',
      en: ['According to tradition, in the 8th century Guru Rinpoche flew here on the back of a tigress.', 'And he meditated here for three years, three months and three days.'],
      shots: [{ a: f('t2'), sc: 'GP' }, { a: f('t3'), sc: 'PM', from: 'Y meditó' }] },
    { id: 'historia', who: 'salma', scene: true, sceneEnd: true, pause: 0.4,
      text: 'El templo se levantó alrededor de su cueva en 1692. En 1998 un incendio lo devastó. Y lo reconstruyeron igual que estaba, hasta 2005.',
      en: ['The temple was built around his cave in 1692.', 'In 1998 a fire devastated it.', 'And it was rebuilt just as it was, until 2005.'],
      cifra: [{ word: '1692', text: '1692', sub: 'SE LEVANTA EL TEMPLO', dur: 2 }, { word: '1998', text: '1998', sub: 'EL INCENDIO', dur: 2 }],
      shots: [{ a: f('t5'), sc: 'PM' }, { a: f('t7'), sc: 'PP', from: 'En 1998' }, { a: f('t6'), sc: 'GP', from: 'Y lo reconstruyeron' }] },
    { id: 'viaje', who: 'salma', scene: true, sceneEnd: true, pause: 0.4, rotulo: 'SUBIDA · 5 H IDA Y VUELTA',
      text: 'Hoy se llega andando: cinco horas entre ida y vuelta, 700 metros de desnivel. Sal a las siete, antes de que suba la niebla. Y dentro no dejan entrar el móvil.',
      en: ['Today you walk up: five hours round trip, 700 metres of climbing.', 'Leave at seven, before the fog rises.', "And phones aren't allowed inside."],
      cifra: { word: '700', text: '700 M', sub: 'DE DESNIVEL', dur: 2.2 },
      shots: [{ a: f('t8'), sc: 'GP' }, { a: f('t1'), sc: 'PM', from: 'Sal a las siete' }] },
    { id: 'app', who: 'salma', scene: true, sceneEnd: true, pause: 0.5,
      text: 'Es el día 2 de nuestra ruta por Bután. Entera, en la app.', en: ["It's day 2 of our route through Bhutan.", 'The whole thing, in the app.'],
      shots: [{ a: 'FILE:' + B + '/clip-app-nido.mp4', sc: 'PM', look: 'app', ok: 'grabación de la app' }] },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
