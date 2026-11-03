// TATUAJES DEL MUNDO · documental HORIZONTAL (16:9), versión de ~10 min (Paco, 3 nov 2026) — se monta por bloques; de momento: BLOQUE 1 (historia).
// Guion: docs/tatuajes-documental-guion-direccion.md. Fotos: salma marketing/tatuajes/fotos (ATRIBUCIONES.txt). Sonidos: tatuajes/sonidos/ATRIBUCIONES.txt.
// Narra solo Salma con SALMA_DOC (más viva, solo este documental). Paco no ha estado: sin «Basado en un viaje real».
// Clips de IA (Runway, Kling 3.0 Pro, 60 créditos cada uno; marcar «contenido con IA» al publicar, P1): tatuajes/runway/. Mapas: mapa-tatuajes.cjs (0 €). Gráfico de Ötzi: grafico-otzi.cjs (0 €; esquema, no la posición real de cada tatuaje).
// «5.300  »: los dos huecos cuadran las 3 palabras de la voz («cinco mil trescientos») con 1 del subtítulo.
const { build } = require('./motor.cjs');
const { SALMA_DOC } = require('./voces.cjs');
const T = 'C:/Users/User/Desktop/salma/salma marketing/tatuajes';
const VIENTO = (db, ss = 0) => ({ src: 'SFX_viento-libre', ss, db });
const OLAS = (db, ss = 0) => ({ src: 'SFX_olas-jeju', ss, db });
const GOLPES = (db, ss = 0) => ({ src: 'SFX_golpecitos-creados', ss, db }); // sonido creado: no se presenta como real (S4)
// sonido del puñetazo del clip de Kimbei (sfx/punetazo-creado.mp3, sintetizado, 0 €): zumbido 0,35 s + impacto. El golpe llega a cámara en el s 4,8 del clip;
// el motor pone el sonido en (inicio del plano − pico), así que pico = 0,35 − (4,8 − ss del plano) para que el impacto caiga con el puño.
const PUNETAZO = (en, ss) => ({ src: 'SFX_punetazo-creado', ss: 0, dur: 0.89, pico: 0.35 - (4.8 - ss), en, gain: 2 });
const cfg = {
  titulo: 'TATUAJES DEL MUNDO', formato: '16:9',
  id: 'tatuajes-doc-bloque1-v3', out: T + '/salida', fotosSerie: T + '/fotos',
  look: 'portra', counter: 'TATUAJES DEL MUNDO',
  voices: { salma: SALMA_DOC }, cardSecs: 8, kb: 1.6, voiceDb: { salma: -25 }, duckRatio: 5,
  card: { l1: 'TATUAJES DEL MUNDO', l2: 'BORRADO DEL MAPA', l3: 'Documental', l4: 'SIGUE EN EL BLOQUE 2', l5: 'Pueblos y su significado' },
  descartes: { M11: 'portada horizontal pendiente (la miniatura de YouTube largo va aparte)', M13: 'sígueme en el documental largo: por decidir con Paco', M3: 'el clip del puñetazo va al final del gancho y al final del bloque a propósito (Paco, 3 nov 2026)' },
  blocks: [
    // 1.0 · GANCHO (igual que tatuajes-gancho.cjs v4, aprobado por Paco)
    { id: 'gancho', who: 'salma', scene: true, sceneEnd: true, pause: 0.8, amb: GOLPES(-30), golpe: PUNETAZO('Tu motivo', 1.9),
      text: 'Hace 5.300   años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.',
      voz: 'Hace cinco mil trescientos años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.',
      en: ['5,300 years ago, someone used a needle to try to cure chest pain.', 'Are you tattooed?', 'Do you know why?', 'Throughout history, people have tattooed themselves to heal, to show which people they belong to, as punishment, to mark their rank in prison…', 'or to join a mafia.', 'Your reason may be in this story.'],
      cifra: { word: '5300', text: '5.300', sub: 'AÑOS', dur: 2.6, y: 560 }, // más abajo: arriba tapaba la cara de Ötzi,
      shots: [
        { a: 'FILE:' + T + '/runway/otzi-camina-kling-lento.mp4', sc: 'GP', look: 'app' }, // Runway (IA, Kling 3.0 Pro): Ötzi se acerca andando, a 0,83x para llenar la primera frase (Paco: sin la segunda imagen de Ötzi)
        { a: 'W52', sc: 'PM', foc: [0.5, 0.35], from: '¿Estás' },
        { a: 'W74', sc: 'PP', foc: [0.5, 0.35], from: '¿Sabes' },
        { a: 'W29', sc: 'GP', from: 'A lo largo' },
        { a: 'W67', sc: 'PM', from: 'la gente' },
        { a: 'W6', sc: 'GP', from: 'curarse' },
        { a: 'W45', sc: 'PP', foc: [0.5, 0.35], from: 'pueblo' },
        { a: 'W13', sc: 'D', from: 'castigo' },
        { a: 'W28', sc: 'PP', foc: [0.5, 0.35], from: 'cárcel' },
        { a: 'W20', sc: 'PM', from: 'mafia' },            // W17 pasa al clip final (misma foto): aquí, Kuniyoshi (M3)
        { a: 'FILE:' + T + '/runway/kimbei-golpe-kling-5s.mp4', sc: 'PM', ss: 1.9, from: 'Tu motivo' }, // ÚLTIMO plano del gancho (Paco): el puñetazo a cámara (llega en el s 4,8 del clip)
      ] },
    // 1.1 · ÖTZI
    { id: 'mapa-alpes', video: T + '/mapa-alpes.mp4', fixed: 5.5, amb: VIENTO(-30) },
    { id: 'otzi', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'ÖTZTAL · FRONTERA ITALIA-AUSTRIA', amb: VIENTO(-32, 6),
      text: 'Ötzi, la momia de los Alpes, murió hace unos 5.300   años con 61 tatuajes mapeados sobre su piel. La mayoría coinciden con puntos de acupuntura. Uno, en las costillas, no está cerca de ninguna articulación: los investigadores creen que buscaba tratar un dolor en el pecho. No era decoración. Era medicina.',
      voz: 'Ötzi, la momia de los Alpes, murió hace unos cinco mil trescientos años con 61 tatuajes mapeados sobre su piel. La mayoría coinciden con puntos de acupuntura. Uno, en las costillas, no está cerca de ninguna articulación: los investigadores creen que buscaba tratar un dolor en el pecho. No era decoración. Era medicina.',
      en: ['Ötzi, the Alpine mummy, died about 5,300 years ago with 61 tattoos mapped on his skin.', 'Most of them match acupuncture points.', 'One, on the ribs, is nowhere near a joint: researchers believe it was meant to treat chest pain.', 'It was not decoration.', 'It was medicine.'],
      shots: [
        { a: 'W81', sc: 'GP' },                                              // camino al lugar del hallazgo, con la estela de Ötzi
        { a: 'W80', sc: 'PM', from: 'murió' },                               // obelisco en el lugar del hallazgo
        { a: 'FILE:' + T + '/grafico-otzi-61.mp4', sc: 'D', look: 'app', from: '61' },        // las 61 rayas y el contador
        { a: 'FILE:' + T + '/grafico-otzi-costillas.mp4', sc: 'D', look: 'app', from: 'Uno,' }, // la de las costillas
        { a: 'W82', sc: 'PP', from: 'No era' },                               // reconstrucción de su calzado (museo)
      ] },
    // 1.2 · LA PALABRA
    { id: 'mapa-tahiti', video: T + '/mapa-alpes-tahiti.mp4', fixed: 5.5, amb: OLAS(-30) },
    { id: 'palabra', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, amb: OLAS(-32, 8),
      text: 'La palabra «tattoo» viene del tahitiano y samoano tatau. La escribió así, por primera vez en inglés, el capitán Cook en 1769.',
      voz: 'La palabra «tatú» viene del tahitiano y samoano tatau. La escribió así, por primera vez en inglés, el capitán Cook en 1769.',
      en: ['The word "tattoo" comes from the Tahitian and Samoan tatau.', 'Captain Cook first wrote it that way in English in 1769.'],
      cifra: { word: '1769', text: '1769', sub: 'CAPITÁN COOK', dur: 2.6 },
      shots: [
        { a: 'W11', sc: 'GP' },                                  // mapa antiguo con la ruta del Endeavour
        { a: 'W36', sc: 'PM', from: 'samoano' },                 // tatau samoano (foto de Thomas Andrew, 1890s)
        { a: 'W9', sc: 'PP', from: 'La escribió' },              // grabado de Sydney Parkinson, dibujante del viaje
      ] },
    // 1.3 · JAPÓN
    { id: 'mapa-japon', video: T + '/mapa-tahiti-japon.mp4', fixed: 5.5, amb: OLAS(-32, 3) },
    { id: 'japon', who: 'salma', scene: true, sceneEnd: true, pause: 1.2, amb: GOLPES(-32, 4), golpe: PUNETAZO('precisamente', 0.5),
      text: 'En Japón, el tatuaje se usó como castigo penal desde el periodo Kofun, en torno al siglo III, y siguió marcando a los condenados durante siglos. Pero en 1868 el gobierno Meiji lo prohibió por completo. Y fue esa prohibición, no el tatuaje en sí, lo que lo empujó a la clandestinidad — y lo unió, para siempre, a la idea de criminalidad. Se legalizó de nuevo en 1948. Hoy, muchos miembros de la Yakuza evitan tatuarse precisamente por el estigma que arrastra desde entonces.',
      voz: 'En Japón, el tatuaje se usó como castigo penal desde el periodo Kofun, en torno al siglo tercero, y siguió marcando a los condenados durante siglos. Pero en 1868 el gobierno Meiji lo prohibió por completo. Y fue esa prohibición, no el tatuaje en sí, lo que lo empujó a la clandestinidad — y lo unió, para siempre, a la idea de criminalidad. Se legalizó de nuevo en 1948. Hoy, muchos miembros de la Yakuza evitan tatuarse precisamente por el estigma que arrastra desde entonces.',
      en: ['In Japan, tattoos were used as criminal punishment from the Kofun period, around the 3rd century, and kept marking convicts for centuries.', 'But in 1868 the Meiji government banned them completely.', 'And it was that ban, not the tattoo itself, that pushed it underground — and tied it, forever, to the idea of crime.', 'It was legalised again in 1948.', 'Today, many Yakuza members avoid tattoos precisely because of the stigma it has carried ever since.'],
      cifra: [{ word: '1868', text: '1868', sub: 'PROHIBIDO', dur: 2.4 }, { word: '1948', text: '1948', sub: 'LEGAL DE NUEVO', dur: 2.4 }],
      shots: [
        { a: 'W14', sc: 'D' },                                   // láminas de tatuajes penales
        { a: 'W87', sc: 'PM', from: 'y siguió' },                // hombre tatuado, foto coloreada s. XIX
        { a: 'W15', sc: 'GP', from: 'Pero' },                    // Beato, h. 1870
        { a: 'W16', sc: 'PP', from: 'Y fue' },                   // Stillfried
        { a: 'W86', sc: 'PM', from: 'clandestinidad' },          // mensajero tatuado (Kimbei)
        { a: 'W18', sc: 'PP', from: 'y lo unió' },               // Ogawa
        { a: 'W19', sc: 'GP', from: 'Se legalizó' },             // Kuniyoshi (respiro de color)
        { a: 'W84', sc: 'PM', from: 'Hoy,' },                    // espalda con irezumi de hoy (sin cara: no se dice quién es)
        { a: 'FILE:' + T + '/runway/kimbei-golpe-kling-5s.mp4', sc: 'PM', ss: 0.5, from: 'precisamente' }, // Runway (IA, Kling 3.0 Pro): el tatuado de Kimbei se gira y golpea; ÚLTIMO PLANO (Paco)
      ] },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
