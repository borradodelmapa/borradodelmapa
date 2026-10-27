// INDIA · Cap. 4 «BENARÉS» — configuración (guion de dirección v3 + cambios de Paco + reglas de montaje de estilo-visual.md)
// sc = escala del plano (GP/PM/PP/D) · look = portra (día) | vision3 (noche/interior) | trix (historia, B/N) · silencio = sin ningún ambiente
const { build } = require('./motor.cjs');
const { PACO, SALMA } = require('./voces.cjs');
const MAPA = 'C:/Users/User/Desktop/salma/salma marketing/india/motor/mapa-india-cap4.mp4';
const AGUA = (db, ss = 0) => ({ src: 'V33', ss, db }); // río real de Rishikesh (vídeo del balcón)
const cfg = {
  titulo: 'INDIA CAP. 4 · BENARÉS',
  id: 'india-cap4-benares-v8',
  look: 'portra', counter: 'INDIA 2019',
  portada: { foto: 'S533', foco: [0.5, 0.5, 0.9], l1: 'BENARÉS', l2: 'ENTRE LA VIDA Y LA MUERTE', tag: 'BORRADO DEL MAPA · INDIA 4/7' },
  voices: { paco: PACO, salma: SALMA },
  cardSecs: 4, duckRatio: 5, gap: { same: 0.4, change: 0.85 }, leadChange: 0.45, voiceDb: { paco: -21, salma: -25 },
  card: { l1: 'MUCHO YOGI, POCO YOGA', l2: 'INDIA 2019', l3: 'Basado en un viaje real', l4: 'CAPÍTULO SIGUIENTE', l5: 'Sarnath, el primer discurso de Buda' },
  blocks: [
    // GANCHO
    { id: 'gancho', who: 'paco', scene: true, sceneEnd: true, minD: 5.2, pause: 0.5, amb: AGUA(-32),
      text: 'Esta foto la hice en Benarés... y la verdad, cuando la hice no entendía lo que estaba viendo.',
      shots: [{ a: 'RW546', sc: 'GP', ok: 'gancho con voz' }] },
    // RÓTULO + MAPA
    { id: 'mapa', video: MAPA, fixed: 4.5, amb: AGUA(-34) },
    // 1 · LLEGADA DE NOCHE: silencio total
    { id: 'llegada', who: 'paco', scene: true, pause: 2.0, silencio: true, look: 'vision3',
      text: 'Llegué de noche, en avión desde Rishikesh. Y mira... lo que más me chocó fue el silencio. La humedad del río, luces tenues, nada de ruido.',
      voz: 'Yegué de noche, en avión desde Rishikesh. Y mira... lo que más me chocó fue el silencio. La humedad del río, luces tenues, nada de ruido.',
      shots: [{ a: 'S491', sc: 'GP', z: 0.06, foc: [0.5, 0.55] }, { a: 'S482', sc: 'PM', from: 'Y mira', z: 0.05 }, { a: 'S474', sc: 'GP', from: 'La humedad', z: 0.05 }] },
    // 2 · LA CIUDAD
    { id: 'dia', who: 'paco', scene: true, pause: 0.4, amb: { src: 'V71', ss: 0, db: -22 },
      text: 'Y de día esto es otra cosa. Barcas, gente bañándose, rezando...',
      shots: [{ a: 'V71', sc: 'GP', ss: 1 }, { a: 'S478', sc: 'PM', from: 'Barcas', z: 0.06, foc: [0.4, 0.55] }, { a: 'S504', sc: 'D', from: 'rezando', z: 0.05, foc: [0.5, 0.5] }] },
    { id: 'antigua', who: 'salma', sceneEnd: true, pause: 3.0, look: 'trix', amb: AGUA(-30),
      text: 'Benarés lleva habitada miles de años. Es de las ciudades más antiguas del mundo.',
      shots: [{ a: 'S485', sc: 'GP', z: 0.08, foc: [0.5, 0.3] }, { a: 'S479', sc: 'PM', from: 'Es de las ciudades', z: 0.05, ok: 'silencio tras el dato' }] },
    // 3 · MORIR EN BENARÉS
    { id: 'normalidad', who: 'paco', scene: true, pause: 0.4, amb: { src: 'V50', ss: 2, db: -28 },
      text: 'Y a cuatro pasos, quemando cuerpos. Lo flipante es la normalidad. Nadie se inmuta. ¡La vida es así!',
      shots: [{ a: 'S540', sc: 'GP', z: 0.05 }, { a: 'S489', sc: 'D', from: 'cuerpos', z: 0.06, foc: [0.5, 0.5] }, { a: 'S541', sc: 'GP', from: 'Lo flipante', z: 0.05, cx: 0.38 }] },
    { id: 'liberacion', who: 'salma', sceneEnd: true, pause: 3.0, amb: { src: 'V50', ss: 6, db: -34 },
      text: 'Quien muere en Benarés, dice la tradición, se libera de volver a nacer.',
      shots: [{ a: 'S553', sc: 'GP', z: 0.05, ok: 'silencio sobre el humo (guion de dirección)' }] },
    // 4 · LA BARCA
    { id: 'barca', who: 'paco', scene: true, pause: 0.3, amb: AGUA(-22),
      text: 'Lo veía todo desde la barca. Es una imagen que retienes por mucho tiempo.',
      shots: [{ a: 'S533', sc: 'GP', z: 0.06, foc: [0.5, 0.45] }, { a: 'S565', sc: 'D', from: 'Es una imagen', z: 0.05 }, { a: 'S529', sc: 'PM', from: 'por mucho tiempo', z: 0.05 }] },
    { id: 'siglos', who: 'salma', sceneEnd: true, pause: 2.4, amb: AGUA(-23, 4),
      text: 'Desde hace siglos, esta escena se repite cada día.',
      shots: [{ a: 'S506', sc: 'PP', z: 0.06, foc: [0.5, 0.5] }, { a: 'S594', sc: 'PM', from: 'esta escena', z: 0.05, foc: [0.45, 0.5] }] },
    // 5 · EL PRECIO Y LOS INTOCABLES
    { id: 'precio', who: 'paco', scene: true, pause: 0.4, amb: { src: 'V50', ss: 3, db: -29 },
      text: 'Y hasta para esto hay clases. El que tiene pasta, más leña. El que no... ya te imaginas. Se quema un poquito menos.',
      shots: [{ a: 'S545', sc: 'PM', z: 0.05 }, { a: 'S543', sc: 'GP', from: 'más leña', z: 0.07, foc: [0.5, 0.6] }, { a: 'S490', sc: 'PM', from: 'ya te imaginas', z: 0.05 }] },
    { id: 'dom', who: 'salma', pause: 0.5, amb: { src: 'V50', ss: 7, db: -32 },
      text: 'Quienes encienden las piras son los Dom, intocables. Sin su fuego, dice la tradición, no hay salvación.',
      shots: [{ a: 'S548', sc: 'GP', z: 0.05, ok: 'plano sostenido sobre el dato' }] },
    { id: 'siglo21', who: 'paco', pause: 1.6, amb: { src: 'V50', ss: 9, db: -35 },
      text: 'Intocables. En pleno siglo XXI.',
      shots: [{ a: 'S542', sc: 'GP', z: 0.06, ok: 'frase corta' }] },
    { id: 'prohibido', who: 'salma', sceneEnd: true, pause: 0.8, amb: { src: 'V50', ss: 11, db: -35 },
      text: 'Está prohibido desde 1950. Sigue pasando.',
      shots: [{ a: 'S552', sc: 'GP', z: 0.05, foc: [0.5, 0.3] }] },
    // 6 · LÁMPARAS
    { id: 'lamparas', who: 'paco', scene: true, sceneEnd: true, pause: 0.5, look: 'vision3', amb: { src: 'V57', ss: 6, db: -20 },
      text: 'Otra noche, miles de lámparas en el ghat. Parecía un concierto de AC/DC. Y yo pensando: esta gente va a salir ardiendo.',
      shots: [{ a: 'RW598', sc: 'GP' }, { a: 'V57', sc: 'PM', ss: 8, from: 'Parecía' }, { a: 'V52', sc: 'D', ss: 2, from: 'esta gente' }] },
    // 7 · CIERRE: silencio total
    { id: 'cierre', who: 'paco', scene: true, pause: 2.0, silencio: true,
      voz: 'Esa primera noche vi mucha gente durmiendo en la caye, entre cartones. Al día siguiente, ni rastro. No sé quiénes eran, pero sin duda son los más olvidados de una ciudad que vive de lo sagrado. Para mí la solución es sencilla: nadie por encima de nadie, nadie por debajo de nadie.',
      text: 'Esa primera noche vi mucha gente durmiendo en la calle, entre cartones. Al día siguiente, ni rastro. No sé quiénes eran, pero sin duda son los más olvidados de una ciudad que vive de lo sagrado. Para mí la solución es sencilla: nadie por encima de nadie, nadie por debajo de nadie.',
      shots: [{ a: 'S597', sc: 'GP', look: 'vision3', z: 0.05, foc: [0.5, 0.6] }, { a: 'RW494', sc: 'GP', from: 'Al día siguiente', ok: 'cierre contemplativo' }, { a: 'S604', sc: 'GP', cover: true, from: 'Para mí', z: 0.04, ok: 'cierre contemplativo' }] },
    { id: 'mapa-final', who: 'salma', sceneEnd: true, pause: 2.2, silencio: true,
      text: 'Un mapa te lleva hasta la ciudad más sagrada. Lo que no te enseña es a quién no mira.',
      shots: [{ a: 'S484', sc: 'GP', z: 0.04, dir: 'out', ok: 'cierre' }] },
  ],
};
// EDITOR: si lo lanza editor/server.cjs (APLICAR_EDITOR=1) se aplican las elecciones de editor/overrides.json (fotos por plano, ambiente por bloque)
if (process.env.APLICAR_EDITOR === '1') require('./editor/aplicar.cjs')(cfg, JSON.parse(require('fs').readFileSync(__dirname + '/editor/overrides.json', 'utf8')));
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
