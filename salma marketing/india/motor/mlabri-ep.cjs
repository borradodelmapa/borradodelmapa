// PUEBLOS BORRADOS DEL MAPA · «LOS MLABRI» — short 9:16 (20 nov 2026, 🎬 Vídeo, encargo T33). Guion: docs/pueblos-mlabri-guion-direccion.md v1.1, voz aprobada por Paco («Ok», 20 nov, chat de Estrategia).
// Narra solo Salma con voz expresiva (N22). Paco no ha estado: sin «viaje real» (F2). Sin clip de la app (M16); tarjeta final M14 en dos versiones.
// Imagen: vídeos CC BY del canal BN SAOLAO (clips/ATRIBUCIONES.txt), sin presentador, sin rótulos de donativo y sin entregas; fotos de Commons (fotos/ATRIBUCIONES.txt). Mapa: mapa-mlabri.cjs.
// Estreno de M34 en el motor (T32): `cara: [x, y]` en los planos de persona para que el final de cada bloque se acelere con general → medio → detalle.
// Uso: CACHE_PLANOS=E:/tmp-motor/cache-planos WORK_BASE=E:/tmp-motor node mlabri-ep.cjs · CALIDAD=publicar para exportar · TIKTOK=1 para la versión de TikTok
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const SALMA_EXPRESIVA = { ...SALMA_DOC, vs: { ...SALMA_DOC.vs, stability: 0.0 } };
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/mlabri', CL = B + '/clips', FO = B + '/fotos';
const PAJAROS = (db, ss = 0) => ({ src: 'SFX_pajaros-libre', ss, db });
const SELVA = (db, ss = 0) => ({ src: 'SFX_selva-tailandia', ss, db });
const V = (n, sc, ss, o = {}) => ({ a: `FILE:${CL}/${n}.mp4`, sc, ss, ...o });
const F = (n, sc, o = {}) => ({ a: `FILE:${FO}/${n}`, sc, ...o });
const TT = process.env.TIKTOK === '1';
const S = (b) => ({ who: 'salma', scene: true, sceneEnd: true, ...b });
const MUS = (de, a, ss, db = -6) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.2 }, ss, db, fi: 0.8, fo: 0.8, voz: 1 });
const cfg = {
  titulo: 'LOS MLABRI · PUEBLOS BORRADOS DEL MAPA',
  id: 'pueblos-mlabri-v1' + (TT ? '-tiktok' : ''),
  // MARCAS (ficha ① E): nombre → G2 · fecha / fechaTikTok → S10 (pendientes de Estrategia)
  nombre: ['mlabri'], fecha: '2026-11-24', fechaTikTok: '2026-11-24', // S10: mar 24 nov 19:00 en YouTube y TikTok (Estrategia, 20 nov: prueba de dos shorts el mismo día; las haenyeo a las 10:00)
  out: B + '/salida', fotosSerie: FO, ultima: B + (TT ? '/ULTIMA-tiktok' : '/ULTIMA'), ultimaNombre: 'mlabri-los-espiritus-de-las-hojas-amarillas',
  look: 'portra', counter: 'PUEBLOS BORRADOS',
  portada: { png: B + '/caratula/mlabri-A.png' },
  voices: { salma: SALMA_EXPRESIVA }, sintonia: { src: 'SFX_sintonia-pueblos', db: -8 },
  musica: { src: 'SFX_fading-shoreline', ratio: 2, trozos: [MUS('ancla', 'adn', 20), MUS('hoy', 'hoy', 60)] }, // S5: la elige Paco de oído; sin música en la leyenda (humano)
  cardSecs: 3.0, kb: 0.8, gap: { same: 0.25, change: 0.45 }, humanoExtra: 0.1, // N10: ≤ 60 s con la tarjeta (mínimo de tarjeta en short: 3 s)
  seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 43 }, // M13: en la leyenda, sobre la caminata (revisor de imagen: no encima del plano de asombro C9, M24; a los 15 s taparía el pico del ADN)
  cardP1: 3.0, card: TT ? { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SUSCRÍBETE AL CANAL', l3: '▼  Mira el vídeo relacionado', l4: '', l5: '' }, // relacionado: «Tailandia 2: el norte en moto» (tToGJVR1VFE)
  descartes: { S10: 'excepción de Paco solo para los mlabri del 24 nov (los shompen del 26 llevan la misma pista): «Si la dejamos pasar total tenemos pocas visitas» (chat de Estrategia) y «si» en el chat de Vídeo (20 nov 2026)', M10: 'subtítulos EN aparte (Y10)', M16: 'M16 (18 nov): shorts sin clip de la app' },
  blocks: [
    // 0 · GANCHO (Y20: el título es la primera frase; G2: «mlabri» en el segundo 0,5; M15: persona primero)
    S({ id: 'g0', emocion: 'calida', minD: 3, pause: 0.25, amb: PAJAROS(-30), // F10 (revisión): sin rótulo aquí: cruzaba la cara; el lugar y la fecha del clip van en g1
      text: 'A los mlabri los llaman los espíritus de las hojas amarillas.', subPartes: [['A los mlabri los llaman'], ['los espíritus', 'de las hojas amarillas.']],
      shots: [V('v1-mujer-refugio', 'PP', 11.4, { cara: [0.45, 0.35] })] }), // M21 · M28: de frente desde el primer fotograma, después del salto de 10,33
    S({ id: 'g1', emocion: 'calida', pause: 0.25, amb: PAJAROS(-30, 3),
      text: 'Cuando sus refugios de hojas amarilleaban, se iban.', subPartes: [['Cuando sus refugios', 'de hojas amarilleaban,'], ['se iban.']],
      shots: [V('v1-refugio-mujer2', 'GP', 6, { rotulo: 'MLABRI · SELVA DE LAOS · 2023' }), { ...V('v1-refugio-inicio', 'GP', 10.3), from: 'amarilleaban' }] }), // F10 · M28 · M48 + M34: el refugio vacío entra en «amarilleaban» y el motor lo acerca en «se iban» // M48: el refugio vacío
    // 0b · PROMESA (N15) y bucle abierto (N16): «la misma historia» se cierra en la leyenda
    S({ id: 'ancla', emocion: 'calida', pause: 0.25, amb: PAJAROS(-30, 6),
      text: 'Su ADN y una leyenda de sus vecinos cuentan la misma historia.', subPartes: [['Su ADN y una leyenda', 'de sus vecinos'], ['cuentan la misma historia.']],
      shots: [V('hombre-ancla-v', 'PP', 0, { cara: [0.5, 0.3] }), { ...V('v1-mortero', 'D', 25, { cara: [0.5, 0.55] }), from: 'cuentan' }] }), // M47: su sonrisa a cámara (ss 15,5, centrado) · M28: mortero sin saltos (24,5 → final) // M47 sonrisa · M26 manos
    // 2 · MAPA (sintonía, S3)
    { id: 'mapa', video: B + '/mapa-mlabri-30.mp4', fixed: 3.0, amb: PAJAROS(-34, 2) },
    // 3 · EL ADN — pico, dato fuerte (S9 silencio antes, M19), fría (M23)
    S({ id: 'adn', pico: true, datoFuerte: true, emocion: 'fria', pause: 0.35, amb: SELVA(-32, 2),
      text: 'Según el genetista Hiroki Oota, en 2005, sus cincuenta y ocho muestras de ADN materno eran idénticas. Quizá todos descienden de una sola mujer, a finales de la Edad Media.',
      voz: 'Según el genetista Jiroki Oota, en 2005, sus cincuenta y ocho muestras de ADN materno eran idénticas. Quizá todos descienden de una sola mujer, a finales de la Edad Media.',
      subPartes: [['Según el genetista', 'Hiroki Oota, en 2005,'], ['sus cincuenta y ocho', 'muestras de ADN materno'], ['eran idénticas.'], ['Quizá todos descienden', 'de una sola mujer,'], ['a finales', 'de la Edad Media.']],
      cifra: { word: 'idénticas', text: '58 DE 58', sub: 'UNA LÍNEA MATERNA · 500-800 AÑOS', dur: 2.3, retraso: 0.2, y: 260 }, // M46/N32 (revisor de guion) · M21: arriba, sin tapar la cara
      shots: [F('C1-grupo-mlabri.png', 'PM', { cara: [0.62, 0.28], pan: [0.62, 0.12, 0.6, 0.22], z: 0.55, rotulo: 'FOTO: TAKAFUMI ISHIDA · ESTUDIO DE 2005' }), { ...V('v1-hombre', 'PM', 7.6, { cara: [0.5, 0.35] }), from: 'en 2005', rotulo: 'SELVA DE LAOS · 2023' }, { ...V('v1-refugio-mujer2', 'PP', 47.9, { cara: [0.45, 0.42] }), from: 'ADN materno' }] }),
    // 4 · LA LEYENDA — cambio de tono, tramo humano (sin música), cierra el bucle (N16)
    S({ id: 'leyenda', cambioTono: true, humano: true, emocion: 'calida', pause: 0.35, amb: SELVA(-28, 10),
      text: 'Sus vecinos, los tin, ya lo contaban: hace siglos, una de sus aldeas echó río abajo a dos niños, en una balsa. De ellos vendrían los mlabri. Según el mismo estudio, sus antepasados probablemente eran agricultores y volvieron a la selva.',
      subPartes: [['Sus vecinos, los tin,', 'ya lo contaban:'], ['hace siglos,', 'una de sus aldeas'], ['echó río abajo', 'a dos niños, en una balsa.'], ['De ellos vendrían', 'los mlabri.'], ['Según el mismo estudio,', 'sus antepasados'], ['probablemente', 'eran agricultores'], ['y volvieron a la selva.']],
      shots: [F('C9-chaloem-phra-kiat-nan.jpg', 'GP', { asombro: true }), { ...V('v2-refugio-hojas', 'GP', 23.5), from: 'De ellos', rotulo: 'SELVA DE LAOS · 2024' }, { ...V('v1-caminan', 'PM', 22, { cara: [0.55, 0.35] }), from: 'Según el mismo', rotulo: 'SELVA DE LAOS · 2023' }] }),
    // 5 · HOY (N31) — recuento de 2010 (Na Nan 2016)
    S({ id: 'hoy', emocion: 'calida', pause: 0.25, amb: PAJAROS(-30, 2),
      text: 'Hoy quedan unos pocos cientos, en aldeas de Nan y Phrae. Muchos trabajan de jornaleros para sus vecinos hmong.',
      voz: 'Hoy quedan unos pocos cientos, en aldeas de Nan y Prae. Muchos trabajan de jornaleros para sus vecinos mong.',
      subPartes: [['Hoy quedan', 'unos pocos cientos,'], ['en aldeas de Nan y Phrae.'], ['Muchos trabajan', 'de jornaleros'], ['para sus vecinos hmong.']],
      cifra: { word: 'cientos', text: '356', sub: 'EN TAILANDIA · RECUENTO DE 2010', dur: 2.0, retraso: 0.2 },
      shots: [V('v3-campos', 'GP', 0), { ...V('v3-mujer-lena', 'PM', 15.5, { cara: [0.55, 0.35], rotulo: 'HUAI LU · NAN · 2024' }), from: 'Muchos' }] }),
    // 6 · M43: imagen sola antes de la tarjeta (cierre lento, M18; M34 no lo acelera)
    { id: 'silencio', video: CL + '/mujer-cierre-09.mp4', fixed: 0.9, amb: PAJAROS(-30, 2) },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
