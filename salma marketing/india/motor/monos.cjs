// INDIA · Reel «LOS MONOS» — configuración (guion de dirección: docs/india-monos-guion-direccion.md). Borrador v1: imágenes = vídeos reales del balcón (V29-V36).
// sc = escala del plano (GP/PM/PP/D) · ss = segundo del vídeo donde empieza · amb = ambiente (src, ss, db)
const { build } = require('./motor.cjs');
const { PACO } = require('./voces.cjs');
const RIO = (db, ss = 0) => ({ src: 'V33', ss, db }); // río real del balcón
const cfg = {
  titulo: 'INDIA · REEL LOS MONOS',
  id: 'india-monos-v1',
  look: 'portra', counter: 'INDIA 2019',
  voices: { paco: PACO },
  cardSecs: 4, duckRatio: 5, gap: { same: 0.4, change: 0.85 }, leadChange: 0.45, voiceDb: { paco: -21 },
  card: { l1: 'MUCHO YOGI, POCO YOGA', l2: 'INDIA 2019', l3: 'Basado en un viaje real', l4: 'EL VIAJE CONTINÚA', l5: 'Benarés, la muerte y las castas' },
  blocks: [
    { id: 'gancho', who: 'paco', scene: true, pause: 0.3, amb: RIO(-26),
      text: 'Mi habitación en Rishikesh tenía vistas al río y un balcón estrecho, con un cristal finísimo. Y cada día pasaba por delante una familia de monos.',
      shots: [{ a: 'V31', sc: 'GP', ss: 5 }, { a: 'V29', sc: 'PM', ss: 0, from: 'Y cada día' }] },
    { id: 'educados', who: 'paco', pause: 0.5, amb: RIO(-26, 3),
      text: 'Tranquilos. Educados.',
      shots: [{ a: 'V32', sc: 'PP', ss: 0 }] },
    { id: 'platano', who: 'paco', pause: 0.3, amb: RIO(-30, 5),
      text: 'Un día se me ocurrió dar un golpecito al cristal. Y pelar un plátano delante de sus narices.',
      shots: [{ a: 'V35', sc: 'PM', ss: 0 }, { a: 'V36', sc: 'PP', ss: 3, from: 'Y pelar' }] },
    { id: 'cara', who: 'paco', pause: 0.4, amb: { src: 'V35', ss: 0, db: -20 },
      text: 'Uno se quedó mirándome fijo. Le cambió la cara. Y se tiró contra el cristal.',
      shots: [{ a: 'V33', sc: 'GP', ss: 0 }, { a: 'V35', sc: 'PM', ss: 1.2, from: 'Y se tiró' }] },
    { id: 'escondi', who: 'paco', pause: 0.8, silencio: true,
      text: 'Me escondí. En mi propia habitación.',
      shots: [{ a: 'V34', sc: 'PM', ss: 2 }] },
    { id: 'cierre', who: 'paco', sceneEnd: true, pause: 1.2, amb: RIO(-26, 2),
      text: 'Con los monos de Rishikesh no se juega. Son unos hijos de puta.',
      shots: [{ a: 'V36', sc: 'GP', ss: 8 }] },
  ],
};
// EDITOR: si lo lanza editor/server.cjs (APLICAR_EDITOR=1) se aplican las elecciones del editor
if (process.env.APLICAR_EDITOR === '1') require('./editor/aplicar.cjs')(cfg, JSON.parse(require('fs').readFileSync(process.env.EDITOR_OVR || __dirname + '/editor/overrides-monos.json', 'utf8')));
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
