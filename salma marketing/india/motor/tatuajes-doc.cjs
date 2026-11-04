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
const SELVA = (db, ss = 0) => ({ src: 'SFX_selva-tailandia', ss, db });     // Amada44, CC BY-SA 3.0 (selva del sudeste asiático; no se presenta como de Borneo, S4)
const BOSQUE = (db, ss = 0) => ({ src: 'SFX_bosque-invierno', ss, db });    // kyles, CC0
const PAJAROS = (db, ss = 0) => ({ src: 'SFX_pajaros-libre', ss, db });     // Robert EA Harvey, CC BY-SA 4.0
const AINU = n => 'FILE:C:/Users/User/Desktop/salma/salma marketing/pueblos/ainu/fotos/' + n + '.jpg'; // fotos ya revisadas del episodio de los ainu
const SALA = (db, ss = 0) => ({ src: 'SFX_sala-vacia-creada', ss, db });   // sonido creado (rumor grave), S4
const CALLE = (db, ss = 0) => ({ src: 'SFX_calle-madrugada', ss, db });    // Sallyamane, CC BY-SA 4.0 (no se presenta como de Honduras, S4)
const PUERTA = en => ({ src: 'SFX_puerta-celda-creada', ss: 0, dur: 1.6, pico: 0, en, gain: 4 }); // portazo de celda creado, al empezar la escena
const GOLPES = (db, ss = 0) => ({ src: 'SFX_golpecitos-creados', ss, db }); // sonido creado: no se presenta como real (S4)
// sonido del puñetazo del clip de Kimbei (sfx/punetazo-creado.mp3, sintetizado, 0 €): zumbido 0,35 s + impacto. El golpe llega a cámara en el s 4,8 del clip;
// el motor pone el sonido en (inicio del plano − pico), así que pico = 0,35 − (4,8 − ss del plano) para que el impacto caiga con el puño.
const PUNETAZO = (en, ss) => ({ src: 'SFX_punetazo-creado', ss: 0, dur: 0.89, pico: 0.35 - (4.8 - ss), en, gain: 2 });
const cfg = {
  titulo: 'TATUAJES DEL MUNDO', formato: '16:9',
  id: 'tatuajes-doc-completo-v2', out: T + '/salida', fotosSerie: T + '/fotos',
  look: 'portra', counter: 'TATUAJES DEL MUNDO',
  voices: { salma: SALMA_DOC },
  // TRES avisos de seguir (Paco, 4 nov 2026), el modelo de siempre (franja + corazón + batok), cada uno al empezar un mapa (sin voz encima) y con su texto
  seguir: [{ seg: 105.90, texto: 'Si te está gustando, suscríbete' }, { seg: 233.21, texto: 'Hay más documentales: suscríbete' }, { seg: 307.44, texto: 'Dale a me gusta y compártelo' }], cardSecs: 8, kb: 1.6, voiceDb: { salma: -25 }, duckRatio: 5,
  card: { l1: 'TATUAJES DEL MUNDO', l2: 'BORRADO DEL MAPA', l3: 'Documental', l4: 'GRACIAS POR VERLO', l5: 'Borrado del Mapa' },
  descartes: { M11: 'portada horizontal pendiente (la miniatura de YouTube largo va aparte)', M3: 'el clip del puñetazo va al final del gancho, del bloque 1 y del documental, y el cierre repite tatuajes ya vistos, a propósito (Paco, 3-4 nov 2026)' },
  blocks: [
    // 1.0 · GANCHO (igual que tatuajes-gancho.cjs v4, aprobado por Paco)
    { id: 'gancho', who: 'salma', scene: true, sceneEnd: true, pause: 0.8, amb: GOLPES(-30), golpe: PUNETAZO('Tu motivo', 1.9),
      text: 'Hace 5.300   años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.',
      voz: 'Hace cinco mil trescientos años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.',
      en: ['5,300 years ago, someone used a needle to try to cure chest pain.', 'Are you tattooed?', 'Do you know why?', 'Throughout history, people have tattooed themselves to heal, to show which people they belong to, as punishment, to mark their rank in prison…', 'or to join a mafia.', 'Your reason may be in this story.'],
      cifra: { word: '5300', text: '5.300', sub: 'AÑOS', dur: 2.6, y: 560 }, // más abajo: arriba tapaba la cara de Ötzi,
      shots: [
        { a: 'FILE:' + T + '/runway/otzi-camina-tatuado-lento.mp4', sc: 'GP', look: 'app' }, // Runway (IA, Kling 3.0 Pro): Ötzi, con los tatuajes visibles de frente pintados (costillas y muñeca izq.), se acerca andando, a 0,83x para llenar la primera frase (Paco: sin la segunda imagen de Ötzi)
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
    // ═══ BLOQUE 2 · PUEBLOS Y SU SIGNIFICADO ═══
    { id: 'mapa-pueblos', video: T + '/mapa-pueblos.mp4', fixed: 5.5, amb: OLAS(-30, 12) },
    // 2.1 · MAORÍES
    { id: 'maories', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'NUEVA ZELANDA · MAORÍES', amb: OLAS(-32, 20),
      text: 'En Nueva Zelanda, el tā moko maorí no se talla con aguja, sino con cincel: cortes profundos en la piel, no simple punción. Por eso deja una cicatriz distinta a la de cualquier otro tatuaje polinesio. Su origen está ligado al luto: las mujeres se cortaban la piel y añadían hollín en memoria de alguien querido. Y a la mitología, al dios Rūaumoko y al mito de Mataora y Niwareka.',
      voz: 'En Nueva Zelanda, el ta moko maorí no se talla con aguja, sino con cincel: cortes profundos en la piel, no simple punción. Por eso deja una cicatriz distinta a la de cualquier otro tatuaje polinesio. Su origen está ligado al luto: las mujeres se cortaban la piel y añadían hollín en memoria de alguien querido. Y a la mitología, al dios Ruaumoko y al mito de Mataora y Niwareka.',
      en: ['In New Zealand, Māori tā moko is not made with a needle but with a chisel: deep cuts in the skin, not simple puncturing.', 'That is why it leaves a scar unlike any other Polynesian tattoo.', 'Its origin is tied to mourning: women cut their skin and added soot in memory of a loved one.', 'And to mythology, to the god Rūaumoko and the myth of Mataora and Niwareka.'],
      shots: [
        { a: 'FILE:' + T + '/runway/maori-moko-color-kling-5s.mp4', sc: 'PP', look: 'app', ss: 1.0 }, // Runway (IA, Kling 3.0 Pro): W43 de sepia a color, mira a cámara (Paco: al principio de la escena, 1:51); ss 1 para que en ~4 s se vea la sonrisa final
        { a: 'W27', sc: 'D', look: 'trix', from: 'sino con' }, // uhi, el cincel (dibujo de Robley)
        { a: 'W46', sc: 'PP', foc: [0.5, 0.35], from: 'cortes' }, // Tuterei Karewa (cambiado de sitio con el clip animado, Paco)
        { a: 'W26', sc: 'D', from: 'distinta' },                // autorretrato del moko de Te Pehi Kupe (1826)
        { a: 'W48', sc: 'PM', from: 'Su origen' },             // Aotea, moko kauae
        { a: 'W49', sc: 'PP', foc: [0.5, 0.35], from: 'las mujeres' },
        { a: 'W47', sc: 'GP', from: 'Y a la' },                // retrato de Goldie
      ] },
    // 2.2 · SAMOA
    { id: 'samoa', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'SAMOA', amb: GOLPES(-30, 2),
      text: "En Samoa, el pe'a cubre de la cintura a las rodillas. En teoría se hace en cinco sesiones a lo largo de diez días; en la práctica, por el dolor y la curación, pueden ser semanas. Se golpea un peine de hueso, el ausogi'aso, con una maceta, el sausau. Antes era un requisito para el título de matai, jefe de familia. Ya no lo es — pero muchos lo siguen haciendo igual.",
      voz: "En Samoa, el pe-a cubre de la cintura a las rodillas. En teoría se hace en cinco sesiones a lo largo de diez días; en la práctica, por el dolor y la curación, pueden ser semanas. Se golpea un peine de hueso, el ausonguiaso, con una maceta, el sausau. Antes era un requisito para el título de matái, jefe de familia. Ya no lo es — pero muchos lo siguen haciendo igual.",
      en: ["In Samoa, the pe'a covers from the waist to the knees.", 'In theory it takes five sessions over ten days; in practice, because of the pain and healing, it can take weeks.', "A bone comb, the ausogi'aso, is tapped with a mallet, the sausau.", 'It used to be a requirement for the title of matai, head of the family.', 'It no longer is — but many still do it the same way.'],
      shots: [
        { a: 'W38', sc: 'GP' },                                // pe'a, espalda
        { a: 'W88', sc: 'PM', look: 'trix', from: 'En teoría' }, // tatuando, h. 1895 (Thomas Andrew)
        { a: 'W90', sc: 'PP', from: 'en la práctica' },        // sesión de hoy
        { a: 'W89', sc: 'D', from: 'Se golpea' },              // peine y maceta
        { a: 'W93', sc: 'PP', from: 'Antes era' },             // pe'a, detalle
        { a: 'W91', sc: 'PM', from: 'Ya no' },
        { a: 'W39', sc: 'PP', from: 'pero muchos' },
      ] },
    // 2.3 · IBAN (BORNEO)
    { id: 'iban', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'SARAWAK · BORNEO', amb: SELVA(-28, 5),
      text: 'Entre los iban de Borneo, un tatuaje de rana en la garganta se cree que protege de morir decapitado en combate. El primer tatuaje de un hombre, una espiral en el hombro llamada bunga terung, se hace antes de su bejalai, un viaje iniciático, y se cree que le da fuerza para el camino. Los iban creen que los espíritus conceden los tatuajes en sueños — y que un hombre sin tatuajes es casi invisible para los dioses.',
      voz: 'Entre los iban de Borneo, un tatuaje de rana en la garganta se cree que protege de morir decapitado en combate. El primer tatuaje de un hombre, una espiral en el hombro llamada bunga terung, se hace antes de su beyalai, un viaje iniciático, y se cree que le da fuerza para el camino. Los iban creen que los espíritus conceden los tatuajes en sueños — y que un hombre sin tatuajes es casi invisible para los dioses.',
      en: ['Among the Iban of Borneo, a frog tattoo on the throat is believed to protect against being beheaded in battle.', "A man's first tattoo, a spiral on the shoulder called bunga terung, is made before his bejalai, a journey of initiation, and is believed to give him strength for the road.", 'The Iban believe spirits grant tattoos in dreams — and that a man without tattoos is almost invisible to the gods.'],
      shots: [
        { a: 'W101', sc: 'GP' },                               // casa larga iban
        { a: 'W100', sc: 'PM', look: 'trix', from: 'un tatuaje' },
        { a: 'W97', sc: 'PP', look: 'trix', from: 'El primer' }, // espirales en los hombros
        { a: 'W96', sc: 'D', look: 'app', from: 'bunga' },     // el dibujo del bunga terung
        { a: 'W95', sc: 'D', from: 'se hace' },                // la flor de berenjena que le da nombre
        { a: 'W102', sc: 'PM', from: 'y se cree' },
        { a: 'W70', sc: 'GP', look: 'trix', from: 'Los iban' }, // dayak tatuando (1909)
      ] },
    // 2.4 · AINU
    { id: 'ainu', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'HOKKAIDO · JAPÓN', amb: BOSQUE(-30),
      text: 'Las mujeres ainu, en el norte de Japón, se tatuaban la boca y los antebrazos. Empezaban entre los diez y los trece años — a veces antes — y terminaban hacia los quince o dieciséis: la señal de que estaban listas para casarse. La colonización japonesa de Hokkaido, entre 1869 y 1904, acabó prohibiéndolo.',
      en: ['Ainu women, in northern Japan, tattooed their mouths and forearms.', 'They started between ten and thirteen — sometimes earlier — and finished around fifteen or sixteen: the sign that they were ready to marry.', 'The Japanese colonisation of Hokkaido, between 1869 and 1904, ended up banning it.'],
      cifra: { word: '1869', text: '1869-1904', sub: 'COLONIZACIÓN DE HOKKAIDO', dur: 2.6, y: 560 },
      shots: [
        { a: AINU('W4'), sc: 'PP', look: 'trix', foc: [0.5, 0.4] },
        { a: AINU('W7'), sc: 'PM', look: 'trix', from: 'Empezaban' },
        { a: AINU('W3'), sc: 'PP', look: 'trix', from: 'a veces' },
        { a: AINU('W5'), sc: 'PP', look: 'trix', foc: [0.5, 0.35], from: 'la señal' },
        { a: AINU('W11'), sc: 'GP', look: 'trix', from: 'La colonización' },
        { a: AINU('W10'), sc: 'PM', look: 'trix', from: 'acabó' },
      ] },
    // 2.5 · APATANI
    { id: 'apatani', who: 'salma', scene: true, sceneEnd: true, pause: 1.2, rotulo: 'VALLE DE ZIRO · INDIA', amb: PAJAROS(-30, 10),
      text: 'En el valle de Ziro, en India, las mujeres apatani llevaban tatuaje facial y tapones de nariz de madera. No era estética: era protección contra el rapto. Se lo hacían con diez años, otras mujeres mayores. Se prohibió en los años setenta. Hoy, solo las abuelas lo llevan.',
      en: ['In the Ziro valley, in India, Apatani women wore facial tattoos and wooden nose plugs.', 'It was not about beauty: it was protection against abduction.', 'Older women did it to them at ten.', 'It was banned in the 1970s.', 'Today, only grandmothers wear it.'],
      shots: [
        { a: 'W55', sc: 'GP' },                                // en el arrozal
        { a: 'W54', sc: 'PP', from: 'las mujeres' },
        { a: 'W51', sc: 'PM', look: 'trix', from: 'No era' },
        { a: 'W104', sc: 'PP', foc: [0.5, 0.4], from: 'Se lo' },
        { a: 'W103', sc: 'PM', from: 'Se prohibió' },
        { a: 'W50', sc: 'PP', look: 'trix', from: 'Hoy,' },
      ] },
    // ═══ BLOQUE 3 · TATUAJES TALEGUEROS ═══
    { id: 'mapa-rusia', video: T + '/mapa-ziro-rusia.mp4', fixed: 5.5, amb: SALA(-30) },
    // 3.1 · RUSIA — EL CÓDIGO VORY V ZAKONE (esquemas propios: no hay fotos libres de estos tatuajes)
    { id: 'vory', who: 'salma', scene: true, pause: 0.8, rotulo: 'CÓDIGO DE LAS CÁRCELES SOVIÉTICAS · FOTOS: LITUANIA, 2010', amb: SALA(-28, 4), golpe: PUERTA('En las'),
      text: 'En las cárceles rusas, cada tatuaje del código vory v zakone dice algo concreto. Estrellas en los hombros o las rodillas: «no me arrodillo ante nadie» — la de ocho puntas marca rango. Cúpulas de iglesia ortodoxa en el pecho: cada cúpula, una condena; tres cúpulas, preso para siempre. Un ojo en el pecho: «te vigilo». Un gato, a veces con sombrero: el ladrón profesional.',
      voz: 'En las cárceles rusas, cada tatuaje del código vori v zakone dice algo concreto. Estrellas en los hombros o las rodillas: «no me arrodillo ante nadie» — la de ocho puntas marca rango. Cúpulas de iglesia ortodoxa en el pecho: cada cúpula, una condena; tres cúpulas, preso para siempre. Un ojo en el pecho: «te vigilo». Un gato, a veces con sombrero: el ladrón profesional.',
      en: ['In Russian prisons, every tattoo in the vory v zakone code says something specific.', 'Stars on the shoulders or knees: "I kneel before no one" — the eight-pointed one marks rank.', 'Orthodox church domes on the chest: each dome, one sentence; three domes, a prisoner for life.', 'An eye on the chest: "I am watching you."', 'A cat, sometimes wearing a hat: the professional thief.'],
      shots: [
        // fotos reales: presos de una cárcel de Lituania (antigua URSS), 2010, www.pvz.lt (CC BY-SA); sin caras
        { a: 'W137', sc: 'GP', look: 'trix', from: 'En las' },                       // patio de la cárcel
        { a: 'W133', sc: 'PM', pan: [0.5, 0, 0.5, 1], from: 'cada tatuaje' },         // espalda tatuada, de arriba abajo
        { a: 'W131', sc: 'PP', pan: [0.15, 0.7, 0.85, 0.7], z: 0.5, from: 'Estrellas' }, // pecho, de hombro a hombro
        { a: 'W139', sc: 'D', pan: [0.2, 0.5, 0.8, 0.5], z: 0.4, from: 'rodillas:' },
        { a: 'W106', sc: 'D', look: 'app', from: 'la de ocho' },                      // charretera con estrella de 8 puntas (dibujo)
        { a: 'FILE:' + T + '/grafico-vory-cupulas.mp4', sc: 'PM', look: 'app', from: 'Cúpulas' },
        { a: 'W134', sc: 'PP', pan: [0.5, 0.15, 0.5, 0.85], from: 'cada cúpula' },    // espalda con crucifijo
        { a: 'FILE:' + T + '/grafico-vory-ojo.mp4', sc: 'D', look: 'app', from: 'Un ojo' },
        { a: 'W130', sc: 'PP', pan: [0.5, 0.25, 0.5, 0.7], z: 0.5, from: '«te' },    // pecho tatuado
        { a: 'FILE:' + T + '/grafico-vory-gato.mp4', sc: 'PM', look: 'app', from: 'Un gato' },
        { a: 'W141', sc: 'D', pan: [0.15, 0.4, 0.75, 0.55], z: 0.5, from: 'el ladrón' }, // manos tatuadas
      ] },
    { id: 'vory-castigo', who: 'salma', sceneEnd: true, pause: 1.2, amb: SALA(-28, 12),
      text: 'Pero llevar un tatuaje que no te has ganado era, y a veces sigue siendo, peligroso de verdad: en los años cincuenta, bajo la represión de Jrushchov, se castigaba con violación o muerte. Hacia los setenta, al extenderse entre los presos más jóvenes, los líderes dejaron de castigarlo así.',
      en: ["But wearing a tattoo you hadn't earned was, and sometimes still is, truly dangerous: in the 1950s, under Khrushchev's crackdown, it was punished with rape or death.", 'By the 1970s, as tattoos spread among younger prisoners, the leaders stopped punishing it that way.'],
      shots: [
        { a: 'W140', sc: 'PP', pan: [0.5, 0.15, 0.5, 0.75] },                       // espalda tatuada
        { a: 'W143', sc: 'D', pan: [0.3, 1, 0.7, 0.9], z: 0.6, from: 'peligroso' },   // pecho (sin la cara)
        { a: 'W127', sc: 'GP', look: 'trix', from: 'en los años' },                  // barracón y torre, Vorkutá
        { a: 'W123', sc: 'PM', look: 'trix', from: 'se castigaba' },                 // llegada del tren, Vorkutá
        { a: 'W136', sc: 'PM', from: 'Hacia' },
        { a: 'W132', sc: 'PP', pan: [0.3, 0.15, 0.7, 0.6], from: 'los líderes' },
      ] },
    // 3.2 · MS-13 — EL GIRO: ABANDONAR LA MARCA (sin caras; nada que dé escaparate a la pandilla)
    { id: 'mapa-maras', video: T + '/mapa-rusia-honduras.mp4', fixed: 5.5, amb: CALLE(-32) },
    { id: 'maras', who: 'salma', scene: true, sceneEnd: true, pause: 1.2, rotulo: 'MS-13 · FOTOS: EL SALVADOR Y EE. UU.', amb: CALLE(-30, 6),
      text: 'En Honduras, según un policía que investiga a las maras, muchos miembros de la MS-13   han dejado de tatuarse símbolos de la pandilla. El mismo tatuaje que antes marcaba pertenencia hoy los hace fáciles de identificar — por la policía, y por bandas rivales.',
      voz: 'En Honduras, según un policía que investiga a las maras, muchos miembros de la eme ese trece han dejado de tatuarse símbolos de la pandilla. El mismo tatuaje que antes marcaba pertenencia hoy los hace fáciles de identificar — por la policía, y por bandas rivales.',
      en: ['In Honduras, according to a police officer who investigates the maras, many MS-13 members have stopped getting gang symbols tattooed.', 'The same tattoo that once marked belonging now makes them easy to identify — by the police, and by rival gangs.'],
      shots: [
        { a: 'W146', sc: 'GP', z: 1.2, zfijo: true, dir: 'in', foc: [0.5, 0.45] },   // preso con la cara tatuada («MS» en la frente), CECOT, El Salvador, 2025: acercamiento lento a la cara (Paco)
        { a: 'W113', sc: 'PP', pan: [0.2, 0.25, 0.8, 0.45], z: 0.5, from: 'muchos' }, // espalda, sin cara
        { a: 'W129', sc: 'D', pan: [0.2, 0.5, 0.7, 0.6], z: 0.4, from: 'símbolos' },  // hombro «Salvatrucha»
        { a: 'W112', sc: 'PP', pan: [0.5, 0.2, 0.5, 0.8], z: 0.4, from: 'El mismo' },
        { a: 'W118', sc: 'D', pan: [0.1, 0.4, 0.9, 0.4], z: 0.5, from: 'hoy' },      // «MARA» en la espalda
        { a: 'W128', sc: 'PM', pan: [0.3, 0.75, 0.6, 0.6], z: 0.5, from: 'por la' }, // detenido, torso (sin la cara)
        { a: 'W114', sc: 'D', pan: [0.5, 0.3, 0.5, 0.8], z: 0.4, from: 'y por' },
      ] },
    // ═══ BLOQUE 4 · MAFIAS DEL MUNDO ═══
    { id: 'mapa-mafias', video: T + '/mapa-mafias.mp4', fixed: 5.5, amb: CALLE(-32, 10) },
    // 4.1 · YAKUZA
    { id: 'yakuza', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'JAPÓN', amb: GOLPES(-30, 6),
      text: 'La Yakuza heredó el irezumi integral, el tebori, hecho a mano. Pero el estigma que empezó con la prohibición Meiji de 1868 sigue vivo: balnearios, gimnasios y negocios siguen prohibiendo la entrada a quien lleva tatuajes visibles.',
      en: ['The Yakuza inherited full-body irezumi, tebori, done by hand.', 'But the stigma that began with the Meiji ban of 1868 is still alive: bathhouses, gyms and businesses still refuse entry to anyone with visible tattoos.'],
      shots: [
        { a: 'W151', sc: 'PP', foc: [0.5, 0.35] },                              // Horiyoshi III, maestro tatuador
        { a: 'W150', sc: 'D', pan: [0.2, 0.4, 0.8, 0.5], z: 0.4, from: 'el tebori,' }, // tebori: tatuaje a mano
        { a: 'W152', sc: 'PM', from: 'Pero el' },                               // brazo con irezumi de hoy
        { a: 'W147', sc: 'PP', pan: [0.5, 0.2, 0.5, 0.6], z: 0.3, from: 'balnearios,' }, // cartel de balneario
        { a: 'W148', sc: 'D', pan: [0.2, 0.5, 0.9, 0.5], z: 0.3, from: 'negocios' },  // «tatuajes y yakuza (暴力団): no se admite la entrada»
      ] },
    // 4.2 · COSA NOSTRA Y CAMORRA
    { id: 'italia', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'SICILIA · NÁPOLES', amb: OLAS(-32, 30),
      text: 'En Sicilia, la mayoría de los miembros de la Cosa Nostra no llevan tatuajes que los identifiquen como tales — aunque hay excepciones documentadas, como un caso de «mano negra» ligado a la organización. En Nápoles, la Camorra es justo lo contrario: tiene tradición de tatuaje carcelario desde el siglo XIX, para marcar lealtad. Un grupo joven de Ponticelli se ganó el apodo de «los tatuados» por tatuarse el nombre de su jefe.',
      voz: 'En Sicilia, la mayoría de los miembros de la Cosa Nostra no llevan tatuajes que los identifiquen como tales — aunque hay excepciones documentadas, como un caso de «mano negra» ligado a la organización. En Nápoles, la Camorra es justo lo contrario: tiene tradición de tatuaje carcelario desde el siglo diecinueve, para marcar lealtad. Un grupo joven de Ponticelli se ganó el apodo de «los tatuados» por tatuarse el nombre de su jefe.',
      en: ['In Sicily, most members of Cosa Nostra wear no tattoos that identify them as such — although there are documented exceptions, such as a "black hand" case linked to the organisation.', 'In Naples, the Camorra is the exact opposite: it has a tradition of prison tattoos since the 19th century, to mark loyalty.', 'A young group from Ponticelli earned the nickname "the tattooed ones" for tattooing their boss\'s name.'],
      shots: [
        { a: 'W217', sc: 'GP', pan: [0, 0.6, 1, 0.6], z: 0.15 },               // Corleone (Sicilia)
        { a: 'W218', sc: 'PM', from: 'aunque' },
        { a: 'W154', sc: 'GP', from: 'En Nápoles,' },                            // cárcel de Poggioreale
        { a: 'W153', sc: 'D', look: 'trix', pan: [0.5, 0.05, 0.5, 0.95], z: 0.6, from: 'tiene tradición' }, // camorrista tatuado (dibujo del s. XIX)
        { a: 'W209', sc: 'PM', from: 'Un grupo' },                               // tatuando
      ] },
    // 4.3 · TRÍADAS
    { id: 'triadas', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'HONG KONG', amb: CALLE(-30, 2),
      text: 'En las tríadas chinas, los tatuajes de dragón y tigre marcaban antiguamente el rango. Pero, según un criminólogo especializado, hoy el tatuaje ya no forma parte de la iniciación: los grupos lo evitan para no ser detectados. Muchos líderes no llevan ninguno. Un tatuaje de tríada, por sí solo, ya no prueba nada.',
      en: ['In the Chinese triads, dragon and tiger tattoos once marked rank.', 'But, according to a specialist criminologist, tattoos are no longer part of initiation today: groups avoid them so as not to be detected.', 'Many leaders have none.', 'A triad tattoo, on its own, no longer proves anything.'],
      shots: [
        { a: 'W193', sc: 'GP', look: 'trix', pan: [0.5, 0.2, 0.5, 0.8], z: 0.2 }, // ciudad amurallada de Kowloon desde el aire
        { a: 'W165', sc: 'D', from: 'los tatuajes' },                           // dragón tatuado
        { a: 'W184', sc: 'PM', from: 'Pero,' },                                  // calle de Kowloon
        { a: 'W196', sc: 'PP', from: 'los grupos' },                             // callejón
        { a: 'W197', sc: 'GP', from: 'Muchos' },                                 // Kowloon de noche
        { a: 'W198', sc: 'PM', pan: [0.2, 0.5, 0.8, 0.5], z: 0.3, from: 'Un tatuaje' },
      ] },
    // 4.4 · MÉXICO, SANTA MUERTE
    { id: 'mexico', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'MÉXICO', amb: CALLE(-30, 12),
      text: 'En México, la Santa Muerte se tatúa pidiendo protección. Se la ha llamado «la santa narco» — pero una investigación académica de más de diez años de observación dice que esa etiqueta es reduccionista: también la veneran policías, militares y guardias de prisión, pidiendo protección para ellos y sus familias. Hay más de mil grupos y decenas de miles de devotos. Las autoridades mexicanas han destruido miles de altares.',
      en: ['In Mexico, people tattoo the Santa Muerte asking for protection.', 'She has been called "the narco saint" — but academic research based on more than ten years of observation calls that label reductive: police officers, soldiers and prison guards also worship her, asking protection for themselves and their families.', 'There are more than a thousand groups and tens of thousands of devotees.', 'Mexican authorities have destroyed thousands of altars.'],
      cifra: { word: 'mil', text: '+1.000', sub: 'GRUPOS', dur: 2.4, y: 560 },
      shots: [
        { a: 'W155', sc: 'PP', pan: [0.5, 0.25, 0.5, 0.55], z: 0.4 },          // espalda con la Santa Muerte tatuada
        { a: 'W160', sc: 'PM', from: 'Se la' },
        { a: 'W161', sc: 'GP', pan: [0, 0.5, 1, 0.5], z: 0.25, from: 'pero una' }, // templo de la Santa Muerte (Querétaro)
        { a: 'W158', sc: 'PP', from: 'también' },
        { a: 'W157', sc: 'PM', from: 'Hay más' },                              // velas
        { a: 'W156', sc: 'PP', from: 'Las autoridades' },                      // altar
      ] },
    // 4.5 · RUSIA HOY
    { id: 'rusia-hoy', who: 'salma', scene: true, sceneEnd: true, pause: 1.0, rotulo: 'RUSIA · FOTOS: LITUANIA, 2010', amb: SALA(-28, 20),
      text: 'El código de los vory v zakone sobrevivió a la caída de la URSS: hoy la Bratva, la mafia rusa, es la red más amplia, con los vory como una élite que sigue sus reglas — lealtad, silencio, nunca cooperar con la policía. Pero ese código ya se había empezado a resquebrajar desde los años cuarenta, con presos que volvían del Ejército Rojo y sí colaboraban con el Estado.',
      voz: 'El código de los vori v zakone sobrevivió a la caída de la URSS: hoy la Bratva, la mafia rusa, es la red más amplia, con los vori como una élite que sigue sus reglas — lealtad, silencio, nunca cooperar con la policía. Pero ese código ya se había empezado a resquebrajar desde los años cuarenta, con presos que volvían del Ejército Rojo y sí colaboraban con el Estado.',
      en: ['The vory v zakone code survived the fall of the USSR: today the Bratva, the Russian mafia, is the widest network, with the vory as an elite that follows its rules — loyalty, silence, never cooperating with the police.', 'But that code had already started to crack in the 1940s, with prisoners returning from the Red Army who did cooperate with the State.'],
      shots: [
        { a: 'W145', sc: 'GP', look: 'trix' },                                  // taquillas de la cárcel
        { a: 'W214', sc: 'PM', from: 'hoy la' },                                // celda
        { a: 'W215', sc: 'D', pan: [0.5, 0.6, 0.5, 0.95], z: 0.4, from: 'lealtad,' }, // pies tatuados
        { a: 'W216', sc: 'GP', from: 'Pero ese' },                              // pesas en el patio
        { a: 'W138', sc: 'PM', pan: [0.2, 0.4, 0.8, 0.6], z: 0.3, from: 'con presos' },
      ] },
    // 4.6 · CIERRE (aprobado por Paco el 4 nov 2026) — último plano: el puñetazo del tatuado
    { id: 'cierre', who: 'salma', scene: true, sceneEnd: true, pause: 1.6, amb: GOLPES(-30, 10), golpe: PUNETAZO('Quizá', 1.5),
      text: 'Yakuza, tríadas, maras: tres mafias, en tres continentes, han llegado a la misma conclusión. El tatuaje que antes probaba pertenencia hoy puede delatarte. Pero fuera de las cárceles, casi todos nos tatuamos por gusto: por un viaje, por un recuerdo, por alguien a quien no queremos olvidar. Hace cinco mil trescientos años, Ötzi se tatuó para curarse. Quizá nosotros seguimos haciendo lo mismo.',
      en: ['Yakuza, triads, maras: three mafias, on three continents, have reached the same conclusion.', 'The tattoo that once proved belonging can now give you away.', 'But outside prisons, almost all of us get tattooed because we want to: for a journey, for a memory, for someone we do not want to forget.', 'Five thousand three hundred years ago, Ötzi got tattooed to heal himself.', 'Perhaps we are still doing the same.'],
      shots: [
        { a: 'W84', sc: 'PM' },                                                 // irezumi de hoy (ya visto: repaso)
        { a: 'W39', sc: 'PP', from: 'El tatuaje' },                             // pe'a samoano (ya visto: repaso)
        { a: 'W208', sc: 'PM', from: 'Pero fuera' },                            // tatuador trabajando
        { a: 'W210', sc: 'D', pan: [0.3, 0.5, 0.7, 0.5], z: 0.3, from: 'por un recuerdo' },
        { a: 'W209', sc: 'PP', from: 'por alguien' },
        { a: 'W2', sc: 'PP', foc: [0.5, 0.3], from: 'Hace cinco' },             // Ötzi
        { a: 'FILE:' + T + '/runway/kimbei-golpe-kling-5s.mp4', sc: 'PM', ss: 1.5, from: 'Quizá' }, // ÚLTIMO PLANO: el puñetazo (Runway, IA)
      ] },
  ],
};
build(cfg).catch(e => { console.error('FALLO:', e.message); process.exit(1); });
