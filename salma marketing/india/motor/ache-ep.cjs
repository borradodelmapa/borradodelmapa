// PUEBLOS BORRADOS DEL MAPA · «LOS ACHÉ» — short 9:16 (19 nov 2026, 🎬 Vídeo, encargo T27; Paco: «Sí, móntalo»). Guion: docs/pueblos-ache-guion-direccion.md v3. v5 (19 nov): checklist repasada entera (F1): G2 (aché antes de 5 s), N14(9) (ninguna foto fija más de 3,5 s), M12 (movimiento suave).
// Narra solo Salma con voz expresiva (N22). Sin clip de la app (M16); tarjeta final M14 en dos versiones. Paco no ha estado: sin «viaje real» (F2).
// Imagen: vídeos CC BY de Puerto Barra 2012 (TV local, excepción F10 de Paco del 19 nov: recortados sin micrófono, rótulo de fuente y fecha)
// y de Cerro Morotí 2010 (recortados por encima del subtítulo grabado); fotos de Commons (fotos/ATRIBUCIONES.txt). Mapa: mapa-ache.cjs.
// Reglas: G2 (aché antes de 5 s) · M15/M21 (cara primero) · N15/N16 (bucle «muy pocos» → 40/30) · S3 · S9 silencio antes del pico · M19 · M30/M46 · M18 · M43 · N10 ≤ 60 s.
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const SALMA_EXPRESIVA = { ...SALMA_DOC, vs: { ...SALMA_DOC.vs, stability: 0.0 } };
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/ache', CL = B + '/clips';
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const PAJAROS = (db, ss = 0) => ({ src: 'SFX_pajaros-libre', ss, db });
const V = (n, sc = 'GP', o = {}) => ({ a: `FILE:${CL}/${n}.mp4`, sc, ...o });
const TT = process.env.TIKTOK === '1';
const S = (b) => ({ who: 'salma', scene: true, sceneEnd: true, ...b });
const MUS = (de, a, ss, db = -12) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.2 }, ss, db, fi: 0.8, fo: 0.8, voz: 1 });
const YP = 'ipetí'; // pronunciación de «ypeti» (guaraní: y = vocal), solo en la voz
const cfg = {
  titulo: 'LOS ACHÉ · PUEBLOS BORRADOS DEL MAPA',
  id: 'pueblos-ache-v9' + (TT ? '-tiktok' : ''), // v9 (19 nov 2026): propuesta aprobada por Paco — N23, N26, N32, M48; un solo pico
  // MARCAS (T29, ficha ① E): nombre → G2 · fecha / fechaTikTok → S10 · b.pico → M27 y F11 · b.emocion → M23
  nombre: ['aché'], fecha: '2026-12-22', fechaTikTok: '2026-12-29',
  out: B + '/salida', fotosSerie: B + '/fotos', ultima: B + (TT ? '/ULTIMA-v9-tiktok' : '/ULTIMA-v9'), ultimaNombre: 'tribus-de-paraguay-los-ache-casi-se-borran-del-mapa', // v8 = prueba del motor nuevo: el v7 programado (ULTIMA) no se toca
  look: 'portra', counter: 'PUEBLOS BORRADOS',
  portada: { png: B + '/caratula/ache-A.png' },
  voices: { salma: SALMA_EXPRESIVA }, sintonia: { src: 'SFX_sintonia-pueblos', db: -8 },
  musica: { src: 'SFX_fading-shoreline', ratio: 3, trozos: [MUS('ancla', 'como', 20), MUS('hoy', 'hoy', 60)] },
  cardSecs: 3.5, kb: 0.8, seguir: { activo: true, texto: 'Si te está gustando, sígueme' }, duckRatio: 5, gap: { same: 0.25, change: 0.45 }, voiceDb: { salma: -25 },
  // CTA final (M14): YouTube con flecha al vídeo relacionado (Pueblos T1); TikTok sin flecha. Uso: TIKTOK=1 node ache-ep.cjs → ULTIMA-tiktok/
  cardP1: 3.5, card: TT ? { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SUSCRÍBETE AL CANAL', l3: '▼  Mira el vídeo relacionado', l4: '', l5: '' },
  descartes: { M10: 'subtítulos EN aparte (ache-EN.srt, Y10)', M16: 'M16 (18 nov): shorts sin clip de la app' },
  blocks: [
    // 0 · GANCHO: cosquillas primero (Paco, 19 nov: «empieza por los que arreglaban los conflictos con cosquillas»)
    S({ id: 'g0', emocion: 'calida', minD: 3, pause: 0.3, amb: PAJAROS(-30), rotulo: 'PUERTO BARRA · CANAL 16 · 2012',
      text: 'En el bosque de Paraguay, los aché ypeti arreglaban sus conflictos con cosquillas.',
      voz: `En el bosque de Paraguay, los aché ${YP} arreglaban sus conflictos con cosquillas.`,
      shots: [V('anciano-barba', 'PP'), { ...V('anciano-casa', 'PM'), from: 'arreglaban' }] }),
    S({ id: 'g1', emocion: 'calida', pause: 0.4, amb: PAJAROS(-30, 0), rotulo: 'TÕ MUMBU · «PARTIR CABEZAS»',
      text: 'Los demás aché lo hacían a garrotazos.',
      shots: [V('arco-manos', 'D')] }),
    // 0b · ANCLAJE (N15) y bucle abierto (N16): la cifra llega en «bucle»
    S({ id: 'ancla', pause: 0.4, amb: PAJAROS(-30, 4), rotulo: 'CERRO MOROTÍ · 2010',
      text: 'Eran muy pocos.',
      shots: [V('moroti-anciano', 'PP'), { a: 'W11', sc: 'D', from: 'pocos' }] }), // M48: las manos con el móvil, sin explicar; se resuelve en «hoy»
    // 1 · CÓMO (DOBES, Instituto Max Planck)
    S({ id: 'como', emocion: 'calida', pause: 0.4, amb: PAJAROS(-28, 2), rotulo: 'FUENTE: INSTITUTO MAX PLANCK',
      text: 'Se emparejaban hombres de bandas rivales… y cosquillas. Después, cantos y un juego: coger el frijol.',
      cifra: { word: 'frijol', text: 'PROAA MATA', sub: '«COGER EL FRIJOL»', dur: 0.8, size: 170, retraso: 0.3, y: 480 },
      shots: [V('rosa-arcos', 'PM'), { ...V('bosque-arboles', 'GP'), from: 'Después' }] }),
    // 2 · MAPA (sintonía, S3)
    { id: 'mapa', video: B + '/mapa-ache.mp4', fixed: 4.0, amb: PAJAROS(-34, 2) },
    // 3 · EL GIRO (pico; silencio antes, S9; dato quieto, M19)
    // 3 · EL CASO Y LA CIFRA, en un solo bloque pico (v9): primero los ypeti (N26), 1959 con referencia (N32); después la cifra general de Kim Hill
    S({ id: 'giro', pico: true, emocion: 'fria', pause: 0.5, amb: VIENTO(-30, 4),
      text: 'En 1959, hace menos de setenta años, los ypeti fueron los primeros en salir del bosque. Eran unos cuarenta. En 1987 quedaban treinta. No fueron los únicos: según el antropólogo Kim Hill, en pocos años murió más de la mitad de los que salieron del bosque, de epidemias que nunca habían conocido.',
      voz: `En 1959, hace menos de setenta años, los ${YP} fueron los primeros en salir del bosque. Eran unos cuarenta. En 1987 quedaban treinta. No fueron los únicos: según el antropólogo Kim Jil, en pocos años murió más de la mitad de los que salieron del bosque, de epidemias que nunca habían conocido.`,
      cifra: [{ word: 'treinta', text: '40 → 30', sub: 'LOS YPETI · KIM HILL', dur: 1.0 }, { word: 'mitad', text: '1 DE CADA 2', sub: 'EPIDEMIAS TRAS EL CONTACTO', dur: 2.2, size: 170 }],
      shots: [{ a: 'W4', sc: 'GP' }, { ...V('moroti-anciano2', 'PP'), from: 'hace menos' }, { a: 'W1', sc: 'PM', from: 'los ypeti' }, { ...V('casas', 'GP'), from: 'Eran unos' }, { ...V('comunidad', 'PM'), from: 'En 1987' }, { a: 'W7', sc: 'GP', from: 'No fueron' }, { a: 'W8', sc: 'PM', from: 'en pocos' }, { ...V('moroti-pensando', 'PP'), from: 'salieron' }] }),
    // 5 · HOY (N31)
    S({ id: 'hoy', emocion: 'calida', pause: 0.4, amb: PAJAROS(-30, 2), rotulo: 'ACHE DJAWU · DESDE 2014',
      text: 'Hoy, desde Kuetuvy, junto a la reserva de Mbaracayú, suben su lengua a internet.',
      voz: 'Hoy, desde Kuetuví, junto a la reserva de Mbaracayú, suben su lengua a internet.',
      shots: [{ a: 'W3', sc: 'PM' }, { a: 'W6', sc: 'GP', from: 'junto' }, { a: 'W5', sc: 'D', from: 'suben' }] }),
    // 6 · «Aché significa persona»: quitada para caber en 60 s (N10), como preveía el guion
    // M43: imagen sola antes de la tarjeta
    { id: 'silencio', video: CL + '/anciano-barba-fin-13.mp4', fixed: 1.3, amb: PAJAROS(-30, 2) },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
