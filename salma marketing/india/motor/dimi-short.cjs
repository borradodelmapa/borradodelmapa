// SHORT 9:16 «Los daasanach: de niña a mujer y de padre a ANCIANO» · Pueblos borrados del mapa, bloque Etiopía/Kenia (24 nov 2026, 🎬 Vídeo; guion v4 aprobado por Paco: «Sí, adelante»).
// Guion de dirección: docs/pueblos-daasanach-dimi-short-guion-direccion.md (tres revisores de guion). Investigación: pueblos/daasanach/investigacion-dimi.md.
// Narra solo Salma (Paco no ha estado: F2). Sin IA. Fotos: Oryx 2023 (D. Burgas, CC BY 4.0), Rod Waddington (Commons, CC BY-SA 2.0), satélite (ESA/NASA/UNEP; excepción F10 de Paco, 22 nov).
// Vídeo: «Romaliens · Deep in Cultures» (Doza de călătorie, YouTube CC BY, 2025).
const fs = require('fs');
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const SALMA_EXPRESIVA = { ...SALMA_DOC, vs: { ...SALMA_DOC.vs, stability: 0.0 } }; // la de los episodios de Pueblos
const B = 'C:/Users/User/Desktop/salma/salma marketing/pueblos/daasanach';
const F = n => 'FILE:' + B + '/' + n;
const TT = !!process.env.TIKTOK;
const MUSICA = process.env.MUSICA || 'SFX_fading-shoreline'; // S5: la elige Paco de oído
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const S = ({ sub, ...o }) => ({ who: 'salma', scene: true, sceneEnd: true, pause: o.pause ?? 0.15, ...o, ...(sub ? { subPartes: sub } : {}) }); // sub → subPartes (M25)
const MUS = (de, a, ss, db = -12) => ({ de: { b: de }, a: { b: a, fin: 1, off: 0.6 }, ss, db, fi: 1.2, fo: 1.5, voz: 1 });

const blocks = [
  S({ id: 'g0', emocion: 'calida', amb: VIENTO(-32),
    text: 'En una sola ceremonia de los daasanach, una niña queda bendecida para casarse y su padre se convierte en anciano.',
    en: ['In a single ceremony of the Daasanach, a girl is blessed for marriage and her father becomes an elder.'],
    sub: [['En una sola ceremonia', 'de los daasanach,'], ['una niña queda bendecida', 'para casarse'], ['y su padre se convierte', 'en anciano.']],
    shots: [{ a: F('clips/puente-omo.mp4'), sc: 'PM', rotulo: 'RÍO OMO · OMORATE · 2025' }, { a: 'W04', sc: 'PP', from: 'una niña', pan: [0.5, 0.52, 0.5, 0.5], z: 0.2 }, { a: 'W46', sc: 'PP', from: 'padre', pan: [0.5, 0.58, 0.5, 0.6], z: 0.15 }] }),
  S({ id: 'promesa', emocion: 'calida', amb: VIENTO(-32, 4),
    text: 'Así es el Dimi.',
    en: ['This is the Dimi.'],
    sub: [['Así es el Dimi.']],
    shots: [{ a: F('fotos/O2-hombres-pieles.png'), sc: 'PM', rotulo: 'EL DIMI · 111 PIELES', pan: [0.5, 0.62, 0.5, 0.5], z: 0.75 }] }),
  { id: 'mapa', video: B + '/mapa-dimi.mp4', fixed: 3.2, amb: VIENTO(-34) },
  S({ id: 'situar', emocion: 'fria', amb: VIENTO(-32, 8),
    text: 'Viven donde el Omo entra en el lago Turkana, entre Etiopía y Kenia.',
    en: ['They live where the Omo River flows into Lake Turkana, between Ethiopia and Kenya.'],
    sub: [['Viven donde el Omo', 'entra en el lago Turkana,'], ['entre Etiopía y Kenia.']],
    shots: [{ a: F('satelite/S01.jpg'), sc: 'GP', pan: [0.5, 0.42, 0.5, 0.54], z: 0.7 }, { a: F('satelite/S09-delta-1973.jpg'), sc: 'GP', from: 'lago', rotulo: '1973 · NASA · UNEP' }, { a: F('satelite/S10-delta-2006.jpg'), sc: 'GP', from: 'entre', rotulo: '2006 · +12 KM EN 33 AÑOS' }] }),
  S({ id: 'dimi', emocion: 'calida', humano: true, amb: VIENTO(-30, 12),
    text: 'El padre lo hace antes de que su primera hija cumpla diez años: semanas de ceremonia, vestido con pieles.',
    en: ['The father does it before his first daughter turns ten: weeks of ceremony, dressed in skins.'],
    sub: [['El padre lo hace'], ['antes de que su primera hija', 'cumpla diez años:'], ['semanas de ceremonia,', 'vestido con pieles.']],
    shots: [{ a: F('fotos/O1-aerea-dimi-2018-c.png'), sc: 'GP', asombro: true, pan: [0.5, 0.62, 0.5, 0.5], z: 0.12 }, { a: F('fotos/O2-hombres-pieles.png'), sc: 'PD', from: 'vestido', pan: [0.5, 0.6, 0.5, 0.6], z: 0.55 }] }), // M24: el Dimi desde el aire, sostenido, sin rótulo
  S({ id: 'pieles', emocion: 'fria', pico: true, datoFuerte: true, pause: 0.3, amb: VIENTO(-34, 16),
    text: 'En una, contaron ciento once pieles de leopardo y guepardo. La mayoría se alquilan o se heredan. Alquilarlas cuesta hasta doce veces más que en los noventa. Un daasanach lo dijo a la revista Oryx: tener una piel es como tener una cuenta en el banco.',
    en: ['In one, they counted 111 leopard and cheetah skins.', 'Most are rented or inherited.', 'Renting one costs up to twelve times more than in the nineties.', 'A Daasanach man told the journal Oryx: having a skin is like having a bank account.'],
    sub: [['En una, contaron', 'ciento once pieles'], ['de leopardo y guepardo.'], ['La mayoría se alquilan', 'o se heredan.'], ['Alquilarlas cuesta', 'hasta doce veces más'], ['que en los noventa.'], ['Un daasanach lo dijo', 'a la revista Oryx:'], ['tener una piel'], ['es como tener una cuenta', 'en el banco.']],
    cifra: [{ word: 'ciento', text: '60 + 51', sub: 'LEOPARDOS + GUEPARDOS · 2021', dur: 1.3, size: 190 }, { word: 'doce', text: '400 → 5.000', sub: 'CHELINES (≈ 47 $)', dur: 1.8, size: 150 }],
    shots: [{ a: F('fotos/oryx-fig3.png'), sc: 'GP', pan: [0.28, 0.5, 0.29, 0.5], z: 0.85 }, { a: F('fotos/oryx-fig3.png'), sc: 'PD', from: 'pieles', pan: [0.0, 0.55, 0.0, 0.5], z: 0.8 }, { a: F('clips/leopardo-mara.mp4'), sc: 'GP', from: 'guepardo', rotulo: 'MAASAI MARA · KENIA · 2025' }, { a: F('clips/poblado-cita.mp4'), sc: 'GP', from: 'Un', rotulo: 'POBLADO DAASANACH · 2025' }] }), // N7: la cita, sin cara
  S({ id: 'ley', emocion: 'fria', advertencia: true, cambioTono: true, amb: VIENTO(-34, 20),
    text: 'En Kenia, matar un guepardo puede costar cadena perpetua; nunca han juzgado a un daasanach.',
    en: ['In Kenya, killing a cheetah can mean life imprisonment; no Daasanach has ever been tried.'],
    sub: [['En Kenia, matar un guepardo', 'puede costar cadena perpetua;'], ['nunca han juzgado', 'a un daasanach.']],
    shots: [{ a: F('clips/guepardo-hierba.mp4'), sc: 'GP', rotulo: 'SABANA AFRICANA · 2025' }, { a: F('fotos/O3-guepardo-sibiloi.png'), sc: 'PP', from: 'perpetua', pan: [0.62, 0.35, 0.6, 0.35], z: 0.5 }, { a: F('clips/poblado-cierre.mp4'), sc: 'GP', from: 'nunca' }] }),
  S({ id: 'cierre', emocion: 'calida', pause: 0.15, amb: VIENTO(-30, 24),
    text: 'Ahora, algunos jóvenes proponen pasar a pieles sintéticas.',
    en: ['Now, some young people propose switching to synthetic skins.'],
    sub: [['Ahora, algunos jóvenes'], ['proponen pasar', 'a pieles sintéticas.']],
    shots: [{ a: F('clips/poblado-jovenes.mp4'), sc: 'GP', rotulo: 'POBLADO DAASANACH · 2025' }, { a: F('fotos/O2-hombres-pieles.png'), sc: 'GP', from: 'pasar' }] }),
  { id: 'silencio', video: B + '/clips/w28-cierre.mp4', fixed: 0.75, amb: VIENTO(-30, 28) }, // M43
];
fs.writeFileSync(B + '/guion-short.txt', blocks.filter(b => b.who).map(b => b.text).join('\n') + '\n');
console.log('VOZ: ' + blocks.filter(b => b.who).reduce((a, b) => a + (b.voz || b.text).length, 0) + ' caracteres');
if (process.env.SOLO_TEXTO) process.exit(0);
build({
  titulo: 'LOS DAASANACH · PUEBLOS BORRADOS DEL MAPA', id: 'pueblos-dimi-short-v1' + (TT ? '-tiktok' : ''),
  nombre: ['daasanach'],
  out: B + '/salida-short', fotosSerie: B + '/fotos', ultima: B + (TT ? '/ULTIMA-short-tiktok' : '/ULTIMA-short'), ultimaNombre: 'daasanach-dimi-de-nina-a-mujer-de-padre-a-anciano',
  look: 'portra', counter: 'PUEBLOS BORRADOS', portada: { png: B + '/caratula/dimi-A.png' } /* Paco, 24 nov: «w44» */,
  voices: { salma: SALMA_EXPRESIVA }, sintonia: { src: 'SFX_sintonia-pueblos', db: -8 },
  musica: { src: MUSICA, ratio: 3, trozos: [MUS('situar', 'situar', 2), MUS('cierre', 'cierre', 30)] }, // N14-4: sin música en lo humano (dimi); nada en lo más duro
  cardSecs: 4.0, cardP1: 2.2, kb: 1.0, humanoExtra: 0, gap: { same: 0.2, change: 0.4 }, voiceDb: { salma: -25 }, duckRatio: 5,
  seguir: { activo: true, texto: 'Si te está gustando, sígueme', seg: 20 },
  card: TT ? { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SÍGUEME PARA MÁS', l3: '', l4: '', l5: '' } : { l1: 'MÁS PUEBLOS BORRADOS', l2: 'SUSCRÍBETE AL CANAL', l3: '▼  Mira el vídeo relacionado', l4: '', l5: '' }, // M14
  descartes: { M16: 'M16 (18 nov): shorts sin clip de la app', M10: 'subtítulos EN aparte (Y10)' },
  blocks,
}).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
