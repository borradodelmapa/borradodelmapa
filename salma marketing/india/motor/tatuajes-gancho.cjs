// TATUAJES DEL MUNDO (documental largo, HORIZONTAL 16:9) · prueba de montaje del GANCHO (escena 1.0) — 3 nov 2026.
// Guion: docs/tatuajes-documental-guion-direccion.md (versión A, voz aprobada por Paco). Fotos: salma marketing/tatuajes/fotos (ATRIBUCIONES.txt).
// Narra solo Salma (Paco no ha estado: sin «Basado en un viaje real»). Prueba del formato 16:9 del motor: sin mapa, sin sígueme ni portada todavía.
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs'); // voz de Salma más viva, solo para este documental (Paco, 3 nov 2026)
const T = 'C:/Users/User/Desktop/salma/salma marketing/tatuajes';
const cfg = {
  titulo: 'TATUAJES DEL MUNDO', formato: '16:9',
  id: 'tatuajes-gancho-16x9-v4', out: T + '/salida', fotosSerie: T + '/fotos',
  look: 'portra', counter: 'TATUAJES DEL MUNDO',
  voices: { salma: SALMA_DOC }, cardSecs: 8, kb: 1.6, voiceDb: { salma: -25 },
  card: { l1: 'TATUAJES DEL MUNDO', l2: 'BORRADO DEL MAPA', l3: 'Documental', l4: 'BLOQUE 1', l5: 'Historia del tatuaje' },
  descartes: { M7: 'prueba del gancho: el mapa entra en la escena 1.1', M11: 'portada horizontal pendiente (la miniatura de YouTube largo va aparte)', M13: 'sígueme en el documental largo: por decidir con Paco' },
  blocks: [
    // «5.300» se dice «cinco mil trescientos»: los dos huecos («5.300  ») cuadran las 3 palabras de la voz con 1 del subtítulo (la toma de estabilidad 0,3 elegida por Paco está en la caché: no se vuelve a pagar)
    // ambiente: los golpecitos del tatuaje (sonido creado, 0 €; no se presenta como sonido real de ningún sitio, S4), bajo la voz como en el gancho de Whang-Od
    { id: 'gancho', who: 'salma', scene: true, sceneEnd: true, pause: 0.8, amb: { src: 'SFX_golpecitos-creados', ss: 0, db: -30 },
      text: 'Hace 5.300   años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.',
      voz: 'Hace cinco mil trescientos años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.',
      cifra: { word: '5300', text: '5.300', sub: 'AÑOS', dur: 2.6 },
      shots: [
        { a: 'W2', sc: 'PP', foc: [0.5, 0.3] },             // cara de la reconstrucción de Ötzi (persona primero, M15)
        // v3 (Paco, 3 nov 2026: «usa las fotos nuevas menos la de Ötzi, que la dejas»)
        { a: 'W52', sc: 'PM', foc: [0.5, 0.35], from: '¿Estás' }, // ¿estás tatuado?: mujer apatani (India), en color
        { a: 'W74', sc: 'PP', foc: [0.5, 0.35], from: '¿Sabes' },  // ¿sabes por qué?: anciana atayal (Taiwán)
        { a: 'W29', sc: 'GP', from: 'A lo largo' },          // a lo largo de la historia: guerrero de Nuku Hiva (Marquesas, 1813)
        { a: 'W67', sc: 'PM', from: 'la gente' },            // la gente se ha tatuado: mentawai tatuando (Indonesia)
        { a: 'W6', sc: 'GP', from: 'curarse' },              // curarse: Ötzi (otra reconstrucción; W1 se guarda para el final)
        { a: 'W45', sc: 'PP', foc: [0.5, 0.35], from: 'pueblo' }, // pueblo: tohunga maorí con moko (grabado)
        { a: 'W13', sc: 'D', from: 'castigo' },              // castigo: tatuajes penales japoneses (no hay foto nueva de castigo)
        { a: 'W28', sc: 'PP', foc: [0.5, 0.35], from: 'cárcel' }, // cárcel: preso soviético
        { a: 'W17', sc: 'PM', from: 'mafia' },               // mafia: irezumi (Kimbei)
        { a: 'W1', sc: 'GP', from: 'Tu motivo' },            // vuelta a Ötzi (sin repetir foto, M3)
      ] },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
