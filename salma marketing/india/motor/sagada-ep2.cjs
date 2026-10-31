// PUEBLOS BORRADOS DEL MAPA · Ep.2 «SAGADA» — configuración (31 oct 2026). Guion: docs/pueblos-ep2-sagada-guion-direccion.md
// Narra solo Salma (Paco no ha estado). Fotos: Wikimedia Commons (pueblos/sagada/fotos/ATRIBUCIONES.txt), PROVISIONALES para que Paco las cambie en el editor.
// Gancho con los ataúdes: no hay foto libre de personas de Sagada (excepción a M15 en este episodio, «ok dale» de Paco, 31 oct).
// Sonido: viento y pájaros con licencia libre; sígueme a los 20 s con los golpes del batok (M13). Mapa: mapa-sagada.cjs. Clip de la app común (M16).
const { build } = require('./motor.cjs');
const { SALMA } = require('./voces.cjs');
const P = 'C:/Users/User/Desktop/salma/salma marketing/pueblos';
const B = P + '/sagada';
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const PAJAROS = (db, ss = 0) => ({ src: 'SFX_pajaros-libre', ss, db });
const cfg = {
  titulo: 'SAGADA · PUEBLOS BORRADOS DEL MAPA',
  id: 'pueblos-ep2-sagada-v2',
  out: B + '/salida', fotosSerie: B + '/fotos', ultima: B + '/ULTIMA', ultimaNombre: 'Sagada · Pueblos borrados del mapa',
  look: 'portra', counter: 'PUEBLOS BORRADOS · 2',
  portada: { foto: 'W09', foco: [0.5, 0.45, 0.85], l1: 'SAGADA', l2: 'AQUÍ CUELGAN A LOS MUERTOS', tag: 'PUEBLOS BORRADOS DEL MAPA · FILIPINAS' },
  voices: { salma: SALMA }, sintonia: { src: 'SFX_sintonia-pueblos', db: -8 }, // sintonía de la serie (Paco, 31 oct 2026)
  cardSecs: 8, kb: 1.6, seguir: { activo: true, texto: 'Si te está gustando, sígueme' }, duckRatio: 5, gap: { same: 0.4, change: 0.85 }, voiceDb: { salma: -25 },
  card: { l1: 'SAGADA', l2: 'PUEBLOS BORRADOS DEL MAPA', l3: 'Mountain Province · Filipinas', l4: 'PRÓXIMO EPISODIO', l5: 'Las haenyeo de Jeju' },
  blocks: [
    // 0 · GANCHO
    { id: 'gancho', who: 'salma', scene: true, sceneEnd: true, minD: 5, pause: 0.5, amb: VIENTO(-30),
      text: 'En Sagada, a los muertos no se les entierra. Se les cuelga.', en: ['In Sagada, the dead are not buried.', 'They are hung.'],
      shots: [{ a: 'W09', sc: 'PM' }, { a: 'W07', sc: 'PP', from: 'Se' }] },
    // 1 · SITUAR
    { id: 'mapa', video: B + '/mapa-sagada.mp4', fixed: 5.5, amb: VIENTO(-34) },
    { id: 'situar', who: 'salma', scene: true, sceneEnd: true, pause: 0.5, rotulo: 'SAGADA · MOUNTAIN PROVINCE', amb: PAJAROS(-30),
      text: 'Sagada, en la cordillera de Luzón. A 1.500 metros de altura, a unos 400 kilómetros de Manila.',
      en: ['Sagada, in the Cordillera of Luzon.', '1,500 metres up, about 400 kilometres from Manila.'],
      cifra: { word: '1.500', text: '1.500 M', sub: 'DE ALTITUD', dur: 2.4 },
      shots: [{ a: 'W43', sc: 'GP' }] },
    // 2 · QUÉ ES
    { id: 'que', who: 'salma', scene: true, sceneEnd: true, pause: 0.5, rotulo: 'VALLE DEL ECO', amb: VIENTO(-32, 6),
      text: 'En el Valle del Eco, los ataúdes cuelgan de la pared de piedra, sujetos con vigas clavadas a la roca.',
      en: ['In Echo Valley, the coffins hang from the stone wall,', 'held up by beams driven into the rock.'],
      shots: [{ a: 'W02', sc: 'PM' }, { a: 'W16', sc: 'GP', from: 'sujetos' }] },
    // 3 · POR QUÉ TAN ALTO (sígueme a los 20 s)
    { id: 'alto', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, amb: VIENTO(-32, 12),
      text: 'Según la tradición, cuanto más arriba, más cerca de los espíritus de los antepasados.',
      en: ['According to tradition, the higher up,', 'the closer to the spirits of the ancestors.'],
      shots: [{ a: 'W01', sc: 'PP' }, { a: 'W13', sc: 'GP', from: 'más' }] },
    // 4 · EL RITUAL — Tri-X B/N
    { id: 'silla', who: 'salma', scene: true, pause: 0.5, look: 'trix', amb: VIENTO(-36, 18),
      text: 'Antes, al difunto lo sentaban en una silla de madera, la sangadil, y lo velaban varios días.', voz: 'Antes, al difunto lo sentaban en una silla de madera, la sangadíl, y lo velaban varios días.',
      en: ['In the past, the dead were seated on a wooden chair, the sangadil,', 'and watched over for several days.'],
      shots: [{ a: 'W08', sc: 'PM', ok: 'la silla (sangadil) colgada con los ataúdes' }] },
    { id: 'encogido', who: 'salma', sceneEnd: true, pause: 0.5, look: 'trix', amb: VIENTO(-36, 24),
      text: 'Después lo encogían para meterlo en el ataúd: se iba como había llegado al mundo.',
      en: ['Then they folded the body into the coffin:', 'leaving the world the way they came into it.'],
      shots: [{ a: 'W20', sc: 'PP' }] },
    { id: 'cortos', who: 'salma', scene: true, sceneEnd: true, pause: 1.2, look: 'trix', amb: VIENTO(-36, 30),
      text: 'Por eso hay ataúdes tan cortos. No son de niños.', en: ['That is why some coffins are so short.', 'They are not for children.'],
      shots: [{ a: 'W19', sc: 'D' }, { a: 'W03', sc: 'GP', from: 'No' }] },
    // 5 · QUIÉN PUEDE
    { id: 'quien', who: 'salma', scene: true, sceneEnd: true, pause: 0.6, amb: PAJAROS(-32, 10),
      text: 'No vale cualquiera. Hay que haber sido un anciano respetado, con nietos. Muchos tallaban su propio ataúd.',
      en: ['Not just anyone. You had to be a respected elder, with grandchildren.', 'Many carved their own coffin.'],
      shots: [{ a: 'W12', sc: 'PM' }, { a: 'W42', sc: 'GP', from: 'Muchos' }] },
    // 6 · LO QUE SE BORRA — el pico
    { id: 'menos', who: 'salma', scene: true, sceneEnd: true, pause: 2.5, amb: VIENTO(-30, 36),
      text: 'Cada vez se cuelgan menos. Hoy la mayoría de las familias elige el cementerio.',
      en: ['Fewer and fewer are hung.', 'Today most families choose the cemetery.'],
      shots: [{ a: 'W11', sc: 'PM' }, { a: 'W05', sc: 'GP', from: 'Hoy' }] },
    // 7 · CIERRE CON DATO (N6)
    { id: 'cuevas', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'CUEVA DE LUMIANG', amb: VIENTO(-34, 42),
      text: 'Y lo más común nunca fue colgarlos: era apilarlos dentro de las cuevas, como en Lumiang.',
      en: ['And the most common custom was never hanging them:', 'it was stacking them inside caves, like at Lumiang.'],
      shots: [{ a: 'W21', sc: 'PM' }, { a: 'W23', sc: 'GP', from: 'como' }] },
    // 8 · CÓMO IR + clip común de la app (M16)
    { id: 'como-ir', who: 'salma', scene: true, sceneEnd: true, pause: 0.6, rotulo: 'REGISTRO + GUÍA LOCAL', amb: PAJAROS(-30, 20),
      text: 'Te registras en la oficina de turismo y bajas al valle con guía local.', en: ['You register at the tourism office', 'and go down into the valley with a local guide.'],
      shots: [{ a: 'W22', sc: 'PM' }, { a: 'W34', sc: 'GP', from: 'bajas' }] },
    { id: 'app', video: P + '/comun/clip-app.mp4', fixed: 5.9 },
  ],
};
// EDITOR: node editor/server.cjs sagada-ep2 (puerto en el plan de la serie). Sus cambios (fotos, portada…) se guardan en editor/overrides-sagada-ep2.json y se aplican SIEMPRE al montar.
if (process.env.APLICAR_EDITOR !== 'no' && require('fs').existsSync(process.env.EDITOR_OVR || __dirname + '/editor/overrides-sagada-ep2.json')) require('./editor/aplicar.cjs')(cfg, JSON.parse(require('fs').readFileSync(process.env.EDITOR_OVR || __dirname + '/editor/overrides-sagada-ep2.json', 'utf8'))); // lo cambiado en el editor se aplica SIEMPRE, se monte desde donde se monte
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
