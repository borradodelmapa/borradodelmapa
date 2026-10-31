// INDIA · Cap. 3 «EL DALÁI LAMA» — configuración (guion de dirección: docs/india-cap3-guion-direccion.md; textos: docs/india-cap3-textos-finales.md)
// sc = escala del plano (GP/PM/PP/D) · ss = segundo del vídeo donde empieza · amb = ambiente real (src, ss, db)
const { build } = require('./motor.cjs');
const { PACO, SALMA } = require('./voces.cjs');
const cfg = {
  titulo: 'INDIA CAP. 3 · EL DALÁI LAMA',
  id: 'india-cap3-dalai-lama-v1',
  look: 'portra', counter: 'INDIA 2019',
  portada: { foto: 'S152', foco: [0.5, 0.4, 0.85], l1: 'EL DALÁI LAMA', l2: 'SIN IDOLATRÍA', tag: 'BORRADO DEL MAPA · INDIA 3/7' },
  voices: { paco: PACO, salma: SALMA },
  cardSecs: 8, kb: 1.6, seguir: { activo: true, seg: 30, texto: 'Si te está gustando, sígueme' }, duckRatio: 5, gap: { same: 0.4, change: 0.85 }, leadChange: 0.45, voiceDb: { paco: -21, salma: -25 },
  card: { l1: 'MUCHO YOGI, POCO YOGA', l2: 'INDIA 2019', l3: 'Basado en un viaje real', l4: 'CAPÍTULO SIGUIENTE', l5: 'Benarés, la muerte y las castas' },
  blocks: [
    { id: 'gancho', who: 'paco', scene: true, pause: 0.6, amb: { src: 'V1', ss: 0, db: -26 },
      text: 'La gente del yoga me preguntaba siempre lo mismo: «¿Y el Dalái Lama? ¿Qué sentiste?»',
      shots: [{ a: 'V1', sc: 'PM', ss: 0 }, { a: 'S152', sc: 'PP', from: '¿Y el Dalái Lama?', foc: [0.5, 0.4] }] },
    { id: 'exilio', who: 'salma', pause: 0.5, amb: { src: 'V2', ss: 0, db: -32 },
      text: 'En marzo de 1959, el Dalái Lama salió de Lhasa de noche y cruzó el Himalaya. Llegó a Tezpur, en el nordeste de India, el 18 de abril. Con él salieron miles de tibetanos. Hoy cerca de cien mil viven refugiados en India, Nepal y Bután.',
      shots: [{ a: 'S160', sc: 'GP' }, { a: 'S162', sc: 'PM', from: 'Llegó a Tezpur' }, { a: 'S157', sc: 'D', from: 'el 18 de abril' }, { a: 'S153', sc: 'PM', from: 'Con él salieron' }, { a: 'S161', sc: 'GP', from: 'Hoy cerca' }] },
    { id: 'alpargatazo', who: 'paco', pause: 0.4, amb: { src: 'V4', ss: 0, db: -30 },
      text: 'Pegué un alpargatazo desde Rishikesh hasta Dharamsala, donde está exiliado el Dalái. No te dejaban entrar con cámara sin acreditación de prensa. Así que un poco de imaginación y Photoshop.',
      shots: [{ a: 'V4', sc: 'PM', ss: 0 }, { a: 'M26', sc: 'PP', from: 'desde Rishikesh' }, { a: 'S159', sc: 'GP', from: 'hasta Dharamsala' }, { a: 'S148', sc: 'PM', from: 'No te dejaban' }, { a: 'S146', sc: 'PP', from: 'Así que' }] },
    { id: 'devotos', who: 'paco', pause: 0.5, amb: { src: 'V3', ss: 0, db: -30 },
      text: 'Muchísimos devotos de todo el mundo. Lo saludé y le dije que para cualquier cosa me diera un toque. Buen tipo.',
      shots: [{ a: 'S147', sc: 'GP' }, { a: 'S145', sc: 'PM', from: 'Lo saludé' }, { a: 'S151', sc: 'PP', from: 'Buen tipo' }] },
    { id: 'mundo', who: 'salma', pause: 0.5, amb: { src: 'V2', ss: 2, db: -32 },
      text: 'Hay unos 324 millones de budistas en el mundo, el 4 % de la humanidad, según el centro Pew. Y a las enseñanzas del Dalái Lama en Dharamsala suelen reunirse discípulos de más de sesenta países.',
      shots: [{ a: 'S164', sc: 'GP' }, { a: 'S169', sc: 'D', from: 'el 4 %' }, { a: 'S170', sc: 'PM', from: 'según el centro Pew' }, { a: 'S144', sc: 'GP', from: 'Y a las enseñanzas' }, { a: 'S173', sc: 'PM', from: 'discípulos de más' }] },
    { id: 'quien', who: 'salma', pause: 0.5, amb: { src: 'V3', ss: 2, db: -32 },
      text: 'Nació en 1935 en una familia de campesinos del Tíbet. A los dos años lo reconocieron como reencarnación del anterior Dalái Lama y a los quince asumió el poder político. En 1989 recibió el Nobel de la Paz. En julio de 2025, a punto de cumplir noventa años, anunció que la institución continuará y que solo su fundación puede reconocer a su sucesor. Pekín dice que lo elegirá ella.',
      shots: [{ a: 'S244', sc: 'GP' }, { a: 'S178', sc: 'PM', from: 'A los dos años' }, { a: 'S175', sc: 'PP', from: 'a los quince' }, { a: 'S154', sc: 'PM', from: 'En 1989' }, { a: 'S181', sc: 'GP', from: 'En julio de 2025' }, { a: 'S186', sc: 'PM', from: 'anunció que' }, { a: 'S185', sc: 'PP', from: 'Pekín dice' }] },
    { id: 'importante', who: 'salma', pause: 0.6, amb: { src: 'V1', ss: 2, db: -32 },
      text: 'Un dato que cambia la imagen que se tiene de él. En 2011, el Dalái Lama renunció a todo el poder político y se lo entregó a un gobierno elegido en las urnas por los tibetanos del exilio. Y lo que pide para el Tíbet no es la independencia, sino una autonomía real dentro de China. Es lo que el gobierno tibetano en el exilio llama la vía media.',
      shots: [{ a: 'S190', sc: 'PM' }, { a: 'S182', sc: 'GP', from: 'En 2011' }, { a: 'S203', sc: 'PM', from: 'un gobierno elegido' }, { a: 'S156', sc: 'D', from: 'Y lo que pide' }, { a: 'S155', sc: 'GP', from: 'sino una autonomía' }, { a: 'S212', sc: 'PM', from: 'Es lo que' }] },
    { id: 'cierre', who: 'paco', sceneEnd: true, pause: 1.2, amb: { src: 'V2', ss: 4, db: -30 },
      text: 'Una vida, muchos maestros. Cuidadín con los falsos gurús, está petado.',
      shots: [{ a: 'S249', sc: 'GP', ok: 'cierre contemplativo' }] },
  ],
};
// EDITOR: si lo lanza editor/server.cjs (APLICAR_EDITOR=1) se aplican las elecciones del editor
if (process.env.APLICAR_EDITOR === '1') require('./editor/aplicar.cjs')(cfg, JSON.parse(require('fs').readFileSync(process.env.EDITOR_OVR || __dirname + '/editor/overrides-cap3.json', 'utf8')));
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
