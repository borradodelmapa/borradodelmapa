// Historias del blog de india (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

module.exports = [
  // Ep.4 Los konyak · guion y fuentes: docs/pueblos-ep4-konyak-guion-direccion.md · vídeo: salma marketing/pueblos/konyak/ULTIMA
  // Sin destino: no hay página de la India en destinos/ (el generador quita el «Más sobre…»).
  {
    orden: 150,
    slug: 'india-konyak-ultimos-tatuados-nagaland',
    fecha: '2026-11-01',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 4',
    pais: 'India',
    redes: { tituloYT: 'Los konyak: los últimos guerreros con la cara tatuada · Nagaland, India', tituloTT: 'Konyak: las últimas caras tatuadas de la India', hashtags: ['#nagaland', '#konyak', '#pueblosborradosdelmapa'] },
    titulo: 'Los konyak: las últimas caras tatuadas de Nagaland',
    resumen: 'En Nagaland, en la frontera de la India con Birmania, los últimos guerreros konyak con la cara tatuada tienen entre ochenta y noventa y cinco años. Cuando se vayan, se irán las últimas caras que cuentan esa historia.',
    video: 'pueblos-ep4-konyak.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final) y fuentes citadas. El sonido de ambiente es de licencia libre y no está grabado en Nagaland. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/konyak',
    fotos: { portada: 'W90', galeria: [['W90', 'Nyemwang Wanghu, uno de los últimos cazadores de cabezas tatuados.'], ['W52', 'El tatuaje del pecho, en Longwa.'], ['W62', 'La fiesta de Aoleang.'], ['W59', 'Un anciano konyak.'], ['W01', 'Mujeres konyak.'], ['W88', 'El paisaje de Longwa, en la frontera.']] },
    cita: { tras: 5, t: 'Todo cambió con la modernidad; nuestra cultura se muere', de: 'Bo Wang, 90 años, rey de Hongphoi (AFP, 2023)' },
    cifras: [['80-95', 'Años de los últimos tatuados'], ['1-6 abril', 'Fiesta de Aoleang'], ['2 países', 'En la casa del jefe de Longwa']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'W90',
      slides: [
        { foto: 'W90', h: 'Las últimas caras tatuadas', t: 'En Nagaland, en la frontera de la India con Birmania, quedan los últimos guerreros konyak con la cara tatuada.', credito: ['JyotiPN', 'CC BY-SA 4.0'] },
        { foto: 'W51', h: 'Se ganaban en combate', t: 'Durante siglos fueron cazadores de cabezas. Los tatuajes de la cara y del pecho marcaban a un guerrero.', credito: ['Avantikac98', 'CC BY-SA 4.0'] },
        { foto: 'W14', h: 'Por qué se acabó', t: 'Fueron el último pueblo naga en hacerse cristiano y la caza de cabezas se volvió tabú. Cuándo terminó, se discute.', credito: ['JyotiPN', 'CC BY-SA 4.0'] },
        { foto: 'W87', h: 'Una casa con frontera', t: 'En Longwa, la línea con Birmania pasa por dentro de la casa del jefe: una mitad está en cada país.', credito: ['Rwf-art', 'CC BY-SA 3.0'] },
        { foto: 'W80', h: 'Lo que se está borrando', t: 'Los últimos tatuados tienen entre ochenta y noventa y cinco años. Cuando se vayan, se irán las últimas caras de esa historia.', credito: ['Rod Waddington', 'CC BY-SA 2.0'] },
        { foto: 'W62', h: 'Visitar con respeto', t: 'La fiesta de Aoleang es del 1 al 6 de abril, en Mon. Pide permiso antes de fotografiar: son personas, no una atracción.', credito: ['Sujansarkarphotography', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'La tierra de los angh', foto: ['W91', 'Las colinas de Mon, en Nagaland.'], p: [
        'Los **konyak** son uno de los pueblos naga. La mayoría vive en el distrito de **Mon**, en el estado indio de **Nagaland**, al que llaman «la tierra de los *angh*», sus jefes tradicionales. También hay konyak en Arunachal Pradesh, en Assam y al otro lado de la frontera, en la Zona Naga de Birmania.' ] },
      { h: 'Caras que se ganaban en combate', foto: ['W51', 'Un anciano tatuado en Longwa.'], p: [
        'Durante siglos fueron **cazadores de cabezas**. Los tatuajes de la cara y del pecho no eran un adorno: se ganaban en combate y marcaban a un guerrero.',
        'Las fuentes no lo cuentan igual en el detalle. Según Wikipedia, el tatuaje de la cara se ganaba al cortar la cabeza de un enemigo; según Outlook Traveller, la cara marcaba haber combatido y el tatuaje del cuello, al verdadero cazador de cabezas.' ] },
      { h: 'El collar de latón', foto: ['W89', 'Colgante konyak de latón con cabezas, en el Museo Nacional de Delhi.'], p: [
        'Algunos ancianos llevan un collar con **cabecitas de latón**. Se dice que cada una recuerda a un enemigo; lo cuenta una sola fuente (Outlook Traveller), que además avisa de que hoy muchos lo llevan sin haber matado a nadie.' ] },
      { h: 'Por qué se acabó', foto: ['W14', 'Un cazador de cabezas konyak.'], p: [
        'Los konyak fueron el **último pueblo naga en hacerse cristiano**. Con los misioneros, la caza de cabezas se convirtió en tabú y dejaron de tatuarse la cara.',
        'Cuándo terminó exactamente se discute: unas fuentes dicen hace medio siglo, otras hace más de cuatro décadas, otras dan 1960 o 1969. Por eso no damos un año.' ] },
      { h: 'Longwa, una casa con frontera', foto: ['W87', 'Atardecer desde Longwa, mirando hacia Mon.'], p: [
        '**Longwa** es la aldea más grande del distrito de Mon y está justo en la frontera con Birmania. La línea pasa por dentro de la casa del *angh*: **una mitad está en la India y la otra en Birmania**. Las fuentes no coinciden en qué habitación cae en cada lado.',
        'Muchos blogs repiten que los vecinos tienen «doble nacionalidad». No es así: la Constitución india no la permite.' ] },
      { h: 'Lo que se está borrando', foto: ['W80', 'Un jefe konyak con su collar.'], p: [
        'Los últimos guerreros tatuados tienen hoy **entre ochenta y noventa y cinco años**. En 2023, la agencia AFP habló con varios de ellos, como Nokkho Konyak, de 90 años.',
        'La investigadora Phejin Konyak, con el fotógrafo Peter Bos, publicó un libro que retrata a los últimos tatuados antes de que se vayan.' ] },
      { h: 'La valla', foto: ['W88', 'Las montañas de la frontera, cerca de Longwa.'], p: [
        'En 2024, el Gobierno indio anunció el fin del régimen de libre movimiento con Birmania y una valla a lo largo de la frontera. Los konyak protestan: partiría en dos aldeas y familias que viven a los dos lados.' ] },
    ],
    ficha: [
      '**Fiesta de Aoleang:** del 1 al 6 de abril, la mayor fiesta de los konyak, en el distrito de Mon.',
      '**Permiso para extranjeros (PAP):** Nagaland lo volvió a exigir el 17 de diciembre de 2024 (se había levantado en 2021) y el Gobierno del estado pide quitarlo. Confírmalo justo antes de ir.',
      '**Respeto:** pide permiso antes de fotografiar a nadie; los tatuados son personas, no una atracción.',
    ],
    nota: 'Datos de noviembre de 2026; el permiso para extranjeros cambia a menudo, confírmalo con el Gobierno de Nagaland antes de ir.',
    fuentes: [
      W('Wikipedia: Konyak Naga', 'https://en.wikipedia.org/wiki/Konyak_Naga'),
      W('Outlook Traveller: los tatuajes de los konyak', 'https://www.outlooktraveller.com/experiences/heritage/ancestral-memories-tattoos-on-skin'),
      W('AFP en Kuwait Times, 5 jul 2023: los últimos cazadores de cabezas', 'https://kuwaittimes.com/indias-headhunter-warriors-sever-past-fret-over-future/'),
      W('Morung Express, mar 2024: los tatuados de Longwa', 'https://morungexpress.com/the-tattooed-headhunters-of-longwa-village'),
      W('Wikipedia: Lungwa', 'https://en.wikipedia.org/wiki/Lungwa'),
      W('Outlook Traveller: la casa con un pie en cada país', 'https://www.outlooktraveller.com/experiences/places-of-interest/this-house-in-nagaland-has-one-foot-in-india-and-another-in-myanmar'),
      W('EastMojo, 5 feb 2025: los konyak contra la valla', 'https://eastmojo.com/premium/2025/02/05/indigenous-rights-now-konyaks-protest-indo-myanmar-fencing/'),
      W('Morung Express: voces de Longwa contra la valla', 'https://morungexpress.com/voices-from-longwa-why-the-villagers-oppose-the-india-myanmar-border-fence'),
      W('Morung Express: el PAP vuelve a ser obligatorio', 'https://morungexpress.com/pap-mandatory-for-foreigners-in-nagaland'),
      W('The Week, 30 nov 2025: Nagaland pide quitar el PAP', 'https://www.theweek.in/wire-updates/national/2025/11/30/cal31-nl-rio-pap.html'),
      W('Sonido: viento en un pinar, W.carter, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'),
      W('Sonido: pájaros en Bourne Woods, Robert EA Harvey, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Birdsong_Bourne_Woods_2020-04-27_0722.mp3'),
    ],
    cierre: 'Próximo episodio: los moken, los nómadas del mar de Andamán.',
  },
  // Ep.6 Los sentineleses (el capítulo «por qué NO se visita») · guion y fuentes: docs/pueblos-ep6-sentineleses-guion-direccion.md · vídeo: salma marketing/pueblos/sentineleses/ULTIMA
  // Sin destino: no hay página de la India en destinos/. Ninguna imagen de sentineleses (excepción M15, aprobada por Paco).
  {
    orden: 170,
    slug: 'india-sentineleses-isla-que-no-se-visita',
    fecha: '2026-11-01',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 6',
    pais: 'las Andamán',
    redes: { tituloYT: 'Los sentineleses: la isla que no se visita · Andamán, India', tituloTT: 'Sentinel del Norte: la isla que no se visita', hashtags: ['#sentineleses', '#andaman', '#pueblosborradosdelmapa'] },
    titulo: 'Los sentineleses: la isla que no se visita',
    resumen: 'En la isla Sentinel del Norte, en las Andamán, vive un pueblo que no deja entrar a nadie. Nadie sabe cuántos son ni entiende su idioma, y tienen buenas razones para no querer visitas: nuestras enfermedades podrían acabar con ellos.',
    video: 'pueblos-ep6-sentineleses.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con imágenes de la isla vista desde lejos (Wikimedia Commons, autores al final), una foto antigua de otros andamaneses y fuentes citadas. No hay ninguna imagen de sentineleses: está prohibido fotografiarlos y no queremos hacerlo. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/sentineleses',
    fotos: { portada: 'W9', galeria: [['W1', 'La isla por la ventanilla de un avión comercial.'], ['W10', 'Sentinel del Norte desde el satélite (NASA).'], ['W11', 'La isla desde la Estación Espacial Internacional.'], ['W6', 'El arrecife que rodea la isla.'], ['W18', 'Las islas Andamán desde el espacio.'], ['W15', 'Corbyn\'s Cove, una playa de Port Blair.']] },
    cifras: [['15-500', 'Estimaciones de cuántos son'], ['5.000 → 59', 'Gran andamaneses, del siglo XIX a 2020'], ['0', 'Visitas permitidas']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'W18',
      slides: [
        { foto: 'W18', h: 'La isla que no se visita', t: 'En Sentinel del Norte, en las islas Andamán, vive un pueblo que no deja entrar a nadie.', credito: ['NASA, MODIS / LANCE', 'Public domain'] },
        { foto: 'W10', h: 'Una isla cerrada', t: 'Mide unos 60 km² y está a unos 64 km de Port Blair. Nadie de fuera entiende su idioma.', credito: ['NASA Earth Observatory (Jesse Allen)', 'Public domain'] },
        { foto: 'W3', h: 'Nadie sabe cuántos son', t: 'Siempre se les ha contado desde lejos. Las estimaciones van de 15 a 500.', credito: ['PJeganathan', 'CC BY-SA 4.0'] },
        { foto: 'W2', h: 'Por qué no', t: 'No tienen defensas contra enfermedades que para nosotros son leves. Sus vecinos, los gran andamaneses, pasaron de unos 5.000 a 59.', credito: ['PJeganathan', 'CC BY-SA 4.0'] },
        { foto: 'W7', h: 'Las flechas', t: 'Rechazan cualquier contacto. Tras el tsunami de 2004, respondieron con flechas a un helicóptero que fue a ver si estaban bien.', credito: ['PJeganathan', 'CC BY-SA 4.0'] },
        { foto: 'W12', h: 'Prohibido acercarse', t: 'La isla está protegida por la ley india y patrullada. Acercarse y fotografiar a sus habitantes está prohibido.', credito: ['autor desconocido', 'CC BY-SA 2.0'] },
        { foto: 'W15', h: 'Si vas a las Andamán', t: 'Port Blair y Havelock sí se visitan. Sentinel del Norte, solo en el mapa. Y nada de tours para ver a los jarawa.', credito: ['Yercaud-elango', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'Una isla cerrada', foto: ['W10', 'Sentinel del Norte vista desde el satélite.'], p: [
        'La isla **Sentinel del Norte** mide unos 60 km² y está a unos 64 km al oeste de Port Blair, la capital de las islas **Andamán**, que pertenecen a la India. Sus habitantes, los **sentineleses**, rechazan cualquier contacto con el exterior.',
        'Su idioma no está descrito ni clasificado: nadie de fuera lo entiende, y no se parece al de los jarawa, sus vecinos más cercanos.' ] },
      { h: 'Lo que no sabemos', foto: ['W3', 'La playa y el arrecife, desde el aire.'], p: [
        'Nadie sabe cuántos son. Los recuentos se han hecho siempre desde lejos: 39 en 2001, 15 en 2011. El Anthropological Survey of India calculó entre 100 y 150 en 2016, y las estimaciones van de **15 a 500**.' ] },
      { h: '1880', foto: ['W13', 'Andamaneses pescando hacia 1870 (no son sentineleses).'], p: [
        'En 1880, una expedición británica dirigida por Maurice Vidal Portman desembarcó en la isla y se llevó a varios sentineleses a la fuerza. Enfermaron y algunos murieron. Las fuentes no coinciden en cuántos eran.',
        'Entre 1967 y 1991, el antropólogo indio T. N. Pandit dirigió expediciones para dejarles regalos. El 4 de enero de 1991 hubo el primer contacto pacífico conocido, y la antropóloga Madhumala Chattopadhyay fue la primera mujer en participar. Las visitas se dejaron a mediados de los noventa.' ] },
      { h: 'Por qué no', foto: ['W2', 'La costa de la isla desde lejos.'], p: [
        'El mayor peligro para ellos somos nosotros: no tienen defensas contra enfermedades que para nosotros son leves.',
        'Sus vecinos lo demuestran. Los **gran andamaneses** eran unos 5.000 a principios del siglo XIX; tras el contacto con los británicos llegaron la neumonía (1868), el sarampión (1877) y la gripe (1896). En 1901 quedaban 625, y en 2020, **59**.' ] },
      { h: 'Las flechas', foto: ['W7', 'La isla con el ala del avión: siempre desde lejos.'], p: [
        'Después del tsunami de 2004, un helicóptero de la Guardia Costera india fue a ver si estaban bien y le respondieron con flechas. El tsunami levantó el fondo marino un metro y medio y les secó las lagunas donde pescaban.',
        'En 2006 murieron dos pescadores cuya barca había derivado hasta la isla, y en noviembre de 2018, **John Allen Chau**, un misionero estadounidense de 26 años que desembarcó sin permiso. La India no recuperó su cuerpo.',
        'Para las puntas de flecha usan el hierro de los barcos que naufragan en su arrecife, como el *Primrose* en 1981.' ] },
      { h: 'Prohibido acercarse', foto: ['W12', 'Mapa de la isla Sentinel del Norte.'], p: [
        'La isla está protegida por la ley india y patrullada; está prohibido acercarse y fotografiar a sus habitantes. Las fuentes no coinciden en la distancia exacta (5 km o 3 millas náuticas).',
        'Aun así, el 29 de marzo de 2025 un youtuber estadounidense, Mykhailo Polyakov, desembarcó para dejarles una lata de refresco y un coco. No vio a nadie y lo detuvieron dos días después.' ] },
      { h: 'Si vas a las Andamán', foto: ['W15', 'Corbyn\'s Cove, una playa de Port Blair.'], p: [
        'Las Andamán sí se visitan: Port Blair, la isla de Swaraj Dweep (Havelock) y sus playas. **Sentinel del Norte, solo en el mapa.**',
        'Evita también los tours que pasan por la carretera de la reserva de los jarawa para «verlos»: Survival International los llama «safaris humanos» y pide no hacerlos.' ] },
    ],
    ficha: [
      '**Sentinel del Norte:** no se visita. Acercarse a la isla es ilegal en la India.',
      '**Islas Andamán:** se llega en avión a Port Blair desde Chennai, Calcuta o Delhi; desde allí, ferris a Swaraj Dweep (Havelock) y otras islas.',
      '**Jarawa:** no hagas tours para verlos por la carretera de su reserva.',
    ],
    nota: 'Datos de noviembre de 2026; las normas de las Andamán cambian, confírmalas con la Administración de las islas antes de ir.',
    fuentes: [
      W('Wikipedia: Sentinelese', 'https://en.wikipedia.org/wiki/Sentinelese'),
      W('Wikipedia: Great Andamanese', 'https://en.wikipedia.org/wiki/Great_Andamanese_peoples'),
      W('Down To Earth: las enfermedades de los andamaneses', 'https://www.downtoearth.org.in/news/embracing-disease-20643'),
      W('ScienceAlert: lo que sabemos de los sentineleses (2018)', 'https://www.sciencealert.com/here-s-what-we-know-about-the-isolated-tribe-that-reportedly-killed-a-26-year-old-american-tourist'),
      W('NBC News, nov 2018: John Allen Chau', 'https://www.nbcnews.com/news/world/american-killed-isolated-tribe-india-s-north-sentinel-island-police-n938826'),
      W('CBS News, abr 2025: detenido por llevar una lata a la isla', 'https://www.cbsnews.com/amp/news/us-tourist-remote-tribe-forbidden-north-sentinel-island-india'),
      W('NBC News, abr 2025: el youtuber sigue detenido', 'https://www.nbcnews.com/news/world/us-youtuber-remains-custody-india-visiting-restricted-island-diet-coke-rcna201838'),
      W('Survival International: los «safaris humanos» de los jarawa', 'https://www.survivalinternational.org/news/9008'),
      W('Sonido: «Small Waves at the Beach», ultradust, CC BY 4.0', 'https://freesound.org/people/ultradust/sounds/165126/'),
      W('Sonido: «Korean island shore at night», rizzin, CC BY 3.0', 'https://freesound.org/people/rizzin/sounds/400791/'),
      W('Sonido: viento en un pinar, W.carter, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'),
    ],
    cierre: 'Próximo episodio: los ainu, el pueblo indígena del norte de Japón.',
  },
  // Short vertical · CRÓNICA (N12) · montaje: salma marketing/india/motor/india-3-lugares.cjs · borrador de 74 s (Paco rehará el texto a 60 s para redes)
  // Sin programar en Metricool: Paco decide la fecha cuando esté el largo de la India. Monos que enseñan los dientes = clips hechos con IA (RW9001, RW9002).
  {
    orden: 118,
    slug: 'india-3-lugares-sagrados-rishikesh-dharamsala-benares',
    fecha: '2026-11-11',
    serie: 'India',
    cap: 'Corto',
    pais: 'India',
    titulo: 'India: tres lugares sagrados y un consejo en cada uno',
    resumen: 'Rishikesh, Dharamsala y Benarés: el yoga junto al Ganges, el Dalái Lama en el exilio y la ciudad donde se despide a los muertos con fuego. Lo que se ve en cada uno y lo que conviene saber antes de ir.',
    video: 'india-3-lugares-sagrados.mp4',
    realidad: 'Basado en un viaje real: las fotos y los vídeos son de Paco, que estuvo en Rishikesh, Dharamsala y Benarés en noviembre de 2019. La narración es la crónica de ese viaje, con la voz de Salma. Los primeros planos de los monos enseñando los dientes están hechos con inteligencia artificial a partir de una foto de Paco.',
    fotosDe: { '': 'salma marketing/india/corto-3-lugares/fotos.lst' },
    fotos: { portada: '546', galeria: [
      ['416', 'Una ofrenda en el Ganges.'],
      ['404', 'Yoga al amanecer en las rocas del río, en Rishikesh.'],
      ['152', 'El Dalái Lama, en Dharamsala, el 6 de noviembre de 2019.'],
      ['153', 'Monjes y fieles en las enseñanzas del Dalái Lama.'],
      ['598', 'Miles de lámparas sobre el río, en Benarés.'],
      ['588', 'Monjes frente a la estupa de Sarnath.'],
      ['v36', 'Uno de los monos del balcón, en Rishikesh.'],
      ['v74', 'Una boda en Benarés.'],
      ['v56', 'Las lámparas desde la barca, en Benarés.'],
      ['v46', 'Un monje en Sarnath.'],
    ] },
    cifras: [['3', 'Lugares sagrados'], ['25', 'Días por el norte'], ['10 km', 'De Benarés a Sarnath']],
    cita: { tras: 2, t: 'Más vieja que la historia, más vieja que la tradición, más vieja incluso que la leyenda', de: 'Mark Twain, sobre Benarés («Following the Equator», 1897)' },
    secciones: [
      { h: 'Un hotel para morir', foto: ['546', 'El crematorio de Manikarnika, desde el río.'], p: [
        'En Benarés hay un hotel donde no se viene a dormir. Se viene a morir. Es la **Kashi Labh Mukti Bhawan**: unas pocas habitaciones, un sacerdote, agua del Ganges, y un plazo de unas dos semanas. Si en ese tiempo no llega la muerte, hay que dejar la habitación.',
        'Para los hindúes, morir en Benarés libera del ciclo de las reencarnaciones. Por eso hay quien viene a esperar el final. Y por eso, en la orilla, el fuego no se apaga.' ] },
      { h: 'Rishikesh: el Ganges, el yoga y los monos', foto: ['404', 'Yoga al amanecer junto al Ganges.'], p: [
        'Aquí el Ganges acaba de bajar del Himalaya y todavía corre con fuerza. Al amanecer, en las rocas del río, hay gente haciendo yoga. Viene a buscar calma medio mundo, y hay maestros de toda una vida junto a profesores de curso rápido: antes de pagar, pregunta con quién aprendió quien te enseña.',
        '**El consejo:** los monos tienen mala leche de verdad. No los molestes, no les enseñes comida y no les des de comer. En la India sigue habiendo rabia: si te muerde un mono o un perro, al médico ese mismo día.' ] },
      { h: 'Dharamsala: el Dalái Lama en el exilio', foto: ['152', 'El Dalái Lama, en Dharamsala.'], p: [
        'Ruedas de oración, monjes de granate, banderas al viento. En Dharamsala vive el Dalái Lama desde que huyó del Tíbet en 1959, y aquí tiene su sede el gobierno tibetano en el exilio. En noviembre de 2019 daba enseñanzas en el templo principal, y allí lo vi.',
        '**El consejo:** sus enseñanzas son gratis, pero hay que inscribirse con el pasaporte en McLeod Ganj, el barrio alto. Mira su calendario oficial antes de ir: las fechas cambian, y su salud también.' ] },
      { h: 'Benarés: más vieja que la leyenda', foto: ['598', 'Lámparas en los ghats de Benarés.'], p: [
        'Escaleras de piedra que bajan al río, barcas de madera al amanecer, miles de lámparas por la noche. En las mismas escaleras hay bodas, con música y flores, y a unos metros se queman los muertos. **Manikarnika** es el crematorio más antiguo: ya aparece en una inscripción del siglo V.',
        '**El consejo:** los crematorios se miran desde la barca, en silencio. Y ni una foto a nadie.' ] },
      { h: 'Sarnath: diez kilómetros más allá', foto: ['588', 'Monjes ante la estupa de Sarnath.'], p: [
        'A unos diez kilómetros de Benarés vuelve el silencio. En **Sarnath**, Buda dio su primer sermón. Hoy hay monjes sentados frente a una estupa enorme, la Dhamek. Hinduismo y budismo, a un paseo de distancia: si vas a Benarés, guárdate una mañana para Sarnath.' ] },
    ],
    ficha: [
      '**Rabia:** no te acerques a monos ni a perros; si te muerden, al médico el mismo día.',
      '**Dalái Lama:** enseñanzas gratis, con inscripción y pasaporte en McLeod Ganj; calendario en dalailama.com.',
      '**Crematorios de Benarés:** desde la barca, en silencio y sin fotos.',
      '**Seguridad:** lee las recomendaciones de Exteriores antes de ir; emergencias en la India, 112.',
    ],
    fuentes: [
      W('Recomendaciones de viaje a la India (Ministerio de Asuntos Exteriores de España)', 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=India'),
      W('Los hoteles de la muerte de Benarés (Al Jazeera)', 'https://www.aljazeera.com/gallery/2013/12/5/hotels-of-death-in-indian-holy-city'),
      W('Mukti Bhawan, el hotel donde los hindúes van a morir (South China Morning Post)', 'https://www.scmp.com/lifestyle/travel-leisure/article/2186308/welcome-indias-death-hotel-salvation-house-where-hindus-go'),
      W('Calendario de enseñanzas del Dalái Lama (web oficial)', 'https://www.dalailama.com/schedule'),
      W('Primer día de enseñanzas en Dharamsala, noviembre de 2019 (web oficial)', 'https://dalailama.com/pictures/first-day-of-teachings-in-dharamsala'),
      W('Manikarnika Ghat (Wikipedia)', 'https://en.wikipedia.org/wiki/Manikarnika_Ghat'),
      W('Sarnath (Wikipedia)', 'https://en.wikipedia.org/wiki/Sarnath'),
      W('Following the Equator, de Mark Twain (Wikipedia)', 'https://en.wikipedia.org/wiki/Following_the_Equator'),
    ],
    nota: 'Datos de noviembre de 2026: confírmalos en fuentes oficiales antes de ir.',
    story: {
      portada: 'v56',
      slides: [
        { foto: 'v56', h: 'India: tres lugares sagrados', t: 'Y un consejo en cada uno. Crónica de un viaje por el norte.' },
        { foto: 'v36', h: 'Rishikesh', t: 'Yoga al amanecer junto al Ganges. Los monos, ni tocarlos: en la India sigue habiendo rabia.' },
        { foto: '152', h: 'Dharamsala', t: 'Aquí vive el Dalái Lama. Verlo enseñar es gratis: te inscribes con el pasaporte.' },
        { foto: 'v74', h: 'Benarés', t: 'Más vieja que la historia. Los crematorios, desde la barca y sin fotos.' },
        { foto: 'v46', h: 'Sarnath', t: 'A diez kilómetros, donde Buda dio su primer sermón.', salida: 'Ver la crónica' },
      ],
    },
  },
  // Largo 16:9 · versión v3 (10 preguntas rápidas + el viaje, N13) · montaje: salma marketing/india/motor/india-v3.cjs · guion: docs/india-guion-v3.md
  // YouTube 04Ibzy_MxQQ, programado mar 17 nov 2026 a las 10:00 (poner youtube: '04Ibzy_MxQQ' cuando sea público)
  {
    orden: 119,
    slug: 'viajar-a-la-india-donde-se-viene-a-morir',
    fecha: '2026-11-12',
    serie: 'India',
    cap: 'Documental',
    pais: 'India',
    formato: '16:9',
    titulo: 'Así es la INDIA: donde se viene a morir',
    resumen: 'Las 10 preguntas que todo el mundo hace antes de viajar a la India (seguridad, visado, vacunas, agua, dinero, cómo moverse) y 25 días por el norte: Rishikesh, Dharamsala y Benarés, la ciudad donde se viene a morir.',
    video: 'viajar-a-la-india-donde-se-viene-a-morir.mp4',
    realidad: 'Basado en un viaje real: las fotos y los vídeos son de Paco, que estuvo en Rishikesh, Dharamsala y Benarés en noviembre de 2019. La narración es la crónica de ese viaje, con la voz de Salma. Algunas escenas de los monos están animadas a partir de una foto (se indica en el vídeo como RECREACIÓN). Las fotos de archivo (Delhi, la historia del Tíbet y de la Partición) llevan su autor al final de la página.',
    fotosDe: { '': 'salma marketing/india/cronica/fotos-blog.lst' },
    creditosIntro: 'Las fotos y los vídeos del viaje son de Paco. Las fotos de archivo vienen de Wikimedia Commons, con licencia libre. Gracias a sus autores:',
    creditosExtra: [["Foto de archivo: Biswarup Ganguly","CC BY 3.0","https://commons.wikimedia.org/wiki/File:Terminal_3_Interior_-_Indira_Gandhi_International_Airport_-_New_Delhi_2016-08-08Terminal_3_Interior_-_Indira_Gandhi_International_Airport_-_New_Delhi_2016-08-08_9234.JPG"],["Foto de archivo: Raya Sharbain","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Taxi_in_New_Delhi.jpg"],["Foto de archivo: Franzfoto","CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Delhi_-_Rad-Taxi.JPG"],["Foto de archivo: Biswarup Ganguly","CC BY 3.0","https://commons.wikimedia.org/wiki/File:Terminal_3_Interior_-_Indira_Gandhi_International_Airport_-_New_Delhi_2016-08-08_9230.JPG"],["Foto de archivo: Biswarup Ganguly","CC BY 3.0","https://commons.wikimedia.org/wiki/File:Terminal_3_Interior_-_Indira_Gandhi_International_Airport_-_New_Delhi_2016-08-08_9237.JPG"],["Foto de archivo: Varun Shiv Kapur from New Delhi, India","CC BY 2.0","https://commons.wikimedia.org/wiki/File:McDonald%27s_in_Chandni_Chowk,_Old_Delhi_(4142476659).jpg"],["Foto de archivo: Monito - Money Transfer Comparison","CC BY 2.0","https://commons.wikimedia.org/wiki/File:Indian_100_and_2000_rupee_notes_(32190943222).jpg"],["Foto de archivo: Ash7876","CC BY 4.0","https://commons.wikimedia.org/wiki/File:Indian_Railways_Train_in_2025.jpg"],["Foto de archivo: UY Scuti","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:An_Indian_Railways_woman_guard.jpg"],["Foto de archivo: Rickard Törnblad","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:View_of_Chandni_Chowk,_Old_Delhi,_India_-_September_2014.jpg"],["Foto de archivo: Sasha India","CC BY-SA 2.0","https://commons.wikimedia.org/wiki/File:Pre-paid_taxi_-_Indira_Gandhi_Airport_New_Delhi_India_2018.jpg"],["Foto de archivo: autor desconocido","Public domain","https://commons.wikimedia.org/wiki/File:The_14th_Dalai_Lama_being_received_at_Palam_by_Indian_dignitaries_in_Nov_1956.jpg"],["Foto de archivo: Larry Sharkey, Los Angeles Times","CC BY 4.0","https://commons.wikimedia.org/wiki/File:Maharishi_Mahesh_Yogi_and_Sam_Yorty.jpg"],["Foto de archivo: Centre Védique Maharishi","CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Maharishi_Mahesh_Yogi_with_Nandkishore.jpg"],["Foto de archivo: Ondřej Žváček","CC BY 2.5","https://commons.wikimedia.org/wiki/File:Potala.jpg"],["Foto de archivo: Nabin K. Sapkota","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Potala_Palace,_Lhasa_08.jpg"],["Foto de archivo: autor desconocido","Public domain","https://commons.wikimedia.org/wiki/File:Dalai_Lama_fleeing_Tibet,_March_1959.jpg"],["Foto de archivo: Homai Vyarawalla","Public domain","https://commons.wikimedia.org/wiki/File:14th_Dalai_Lama_of_Tibet_visiting_Delhi,_India_in_1956_(cropped).jpg"],["Foto de archivo: Luca Galuzzi (Lucag)","CC BY-SA 2.5","https://commons.wikimedia.org/wiki/File:Dalai_Lama_1471_Luca_Galuzzi_2007.jpg"],["Foto de archivo: Dennis G. Jarvis","CC BY-SA 2.0","https://commons.wikimedia.org/wiki/File:Manikarnika_Cremation_Ghat,_Varanasi.jpg"],["Foto de archivo: Dudva","CC0","https://commons.wikimedia.org/wiki/File:Manikarnika_Cremation_Ghat,_Varanasi,_10.2025.jpg"],["Foto de archivo: autor desconocido","Public domain","https://commons.wikimedia.org/wiki/File:Dr_B_R_Ambedkar_as_Barrister_in_1922.jpg"],["Foto de archivo: Illumination/ornamentation by Beohar Rammanohar Sinha, calligraphy by Prem Behar","Public domain","https://commons.wikimedia.org/wiki/File:Constitution_of_India.jpg"],["Foto de archivo: Photo Division, Govt. of India","Public domain","https://commons.wikimedia.org/wiki/File:Refugees_at_Kotla_camp.jpg"],["Foto de archivo: Photo Division, Govt. of India","Public domain","https://commons.wikimedia.org/wiki/File:Refugees_taken_to_camps_from_Delhi_Station.jpg"],["Foto de archivo: shankar s.","CC BY 2.0","https://commons.wikimedia.org/wiki/File:Millions_fled_across_the_border_to_the_other_country.jpg"],["Foto de archivo: Eclicks by Bunny","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Attari_-_Wagah_border.jpg"],["Foto de archivo: Schüler1000","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Indian_Wagah_Attari_border_arena_-Wagah_-Punjab_-20190605_172115.jpg"],["Foto de archivo: Chandradhar yadav","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Rajiv_chowk_metro_station_01.jpg"],["Foto de archivo: Rickard Törnblad","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Chandni_Chowk,_Old_Delhi,_India_-_September_2014.jpg"],["Foto de archivo: Sumita Roy Dutta","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Low_visibility_due_to_Smog_at_New_Delhi_Railway_station_31st_Dec_2017_after_9AM_DSCN8829_1.jpg"],["Foto de archivo: Saurabh Kumar","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Smog_as_visible_in_the_Gurgaon_area_near_Delhi_on_Nov_2016.jpg"],["Foto de archivo: Yann; edited by King of Hearts","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India_edit2.jpg"],["Foto de archivo: Dhirad, picture edited by J. A. Knudsen","CC BY-SA 3.0","https://commons.wikimedia.org/wiki/File:Taj_Mahal_in_March_2004.jpg"],["Foto de archivo: McKay Savage from London, UK","CC BY 2.0","https://commons.wikimedia.org/wiki/File:India_-_Chennai_-_Monsoon_-_05_(3058218683).jpg"],["Foto de archivo: Keithbob at English Wikipedia","Public domain","https://commons.wikimedia.org/wiki/File:Maharishi_Mahesh_Yogi_during_a_1979_visit_to_MUM.jpg"],["Foto de archivo: Jan Kranendonk (https://www.jankranendonk.nl)","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Inside_the_Potala_Palace_in_Lhasa,_Tibet.jpg"],["Foto de archivo: Jan Kranendonk (https://www.jankranendonk.nl)","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:View_from_the_Potala_Palace_in_Lhasa,_Tibet.jpg"],["Foto de archivo: Nabin K. Sapkota","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Potala_Palace,_Lhasa_03.jpg"],["Foto de archivo: Homai Vyarawalla","Public domain","https://commons.wikimedia.org/wiki/File:The_Dalai_Lama,_Nehru_and_Zhou_Enlai_in_1956_in_India.jpg"],["Foto de archivo: Muhammad Umair Mirza","CC BY-SA 4.0","https://commons.wikimedia.org/wiki/File:Scene_of_Migrants_Train_for_Pakistan_(Army_Museum,_Lahore).jpg"],["Foto de archivo: Captain AmericanBurger1775","CC0","https://commons.wikimedia.org/wiki/File:Partition_of_India_Collage.jpg"],["Foto de archivo: Guilhem Vellut","CC BY 2.0","https://commons.wikimedia.org/wiki/File:Wagah_border_ceremony2.jpg"]],
    fotos: { portada: 'caratula', posicion: '50% 50%', galeria: [
      ['416', 'Una ofrenda en el Ganges, en Rishikesh.'],
      ['41', 'El puente colgante y los templos de Rishikesh, sobre el Ganges.'],
      ['94', 'El ashram de los Beatles, hoy en ruinas, en Rishikesh.'],
      ['152', 'El Dalái Lama, en Dharamsala, el 6 de noviembre de 2019.'],
      ['474', 'Amanecer en barca, en Benarés.'],
      ['598', 'Miles de lámparas sobre el río, en Benarés.'],
    ] },
    cifras: [['10', 'Preguntas antes de ir'], ['25', 'Días por el norte'], ['11 min', 'De documental']],
    cita: { tras: 3, t: 'Más vieja que la historia, más vieja que la tradición, más vieja incluso que la leyenda', de: 'Mark Twain, sobre Benarés («Following the Equator», 1897)' },
    secciones: [
      { h: 'Un hotel donde se viene a morir', min: '0:00', foto: ['553', 'El crematorio de Manikarnika, en Benarés.'], p: [
        'En Benarés hay un hotel donde no se viene a dormir: se viene a morir. Te dan una habitación y unas dos semanas; si en ese tiempo no llega la muerte, hay que dejarla. Para los hindúes, morir aquí libera del ciclo de las reencarnaciones. Por eso hay quien viene a esperar el final, y por eso en la orilla el fuego no se apaga.',
        'Antes del viaje, las diez preguntas que todo el mundo hace antes de ir a la India, respondidas en dos minutos.' ] },
      { h: '¿Es seguro viajar a la India?', min: '0:31', foto: ['402', 'Rishikesh al amanecer.'], p: [
        'Sí, con reglas. Exteriores pide viajar con precaución y desaconseja **Cachemira, Manipur y la frontera con Pakistán**.',
        'Cuidado con los taxistas que te dicen que tu hotel ha cerrado: precio cerrado antes de subir o, mejor, taxi por aplicación. Uber es la más usada para coche; Rapido, la más usada del país (sobre todo en moto y rickshaw).',
        'Si eres mujer, Exteriores aconseja no viajar sola y no coger rickshaw ni taxi de noche. Emergencias: **112**.' ] },
      { h: 'Cuándo ir, visado, vacunas y seguro', min: '0:48', foto: ['159', 'Dharamsala en noviembre, con el cielo limpio.'], p: [
        '**Cuándo:** al norte, de octubre a marzo. El monzón, de junio a octubre, corta carreteras y vías de tren.',
        '**Visado:** electrónico de turista, 30 días y dos entradas. Desde España, 25 $ de julio a marzo y 10 $ de abril a junio, solo en la web oficial del Gobierno indio. Pasaporte con seis meses de validez y dos páginas en blanco.',
        '**Vacunas:** ninguna obligatoria desde España; se recomiendan hepatitis A y B, tétanos y fiebre tifoidea.',
        '**Seguro:** con repatriación. La Seguridad Social no cubre en la India y la sanidad privada se paga por adelantado.' ] },
      { h: 'Agua, dinero, transporte e internet', min: '1:17', foto: ['484', 'Barcas en el Ganges, en Benarés.'], p: [
        '**Agua:** solo embotellada y precintada, y nada de hielo en la calle.',
        '**Dinero:** tarjeta en ciudades y sitios turísticos, efectivo para lo demás. La rupia no sale del país: cámbiala o gástala antes de irte.',
        '**Moverse:** tren o avión entre ciudades. El tren tiene un cupo para turistas extranjeros que se reserva en la web de los ferrocarriles indios. Para conducir hace falta el permiso internacional; se conduce por la izquierda y Exteriores recomienda ir con conductor.',
        '**Internet:** SIM local con pasaporte y visado. Enchufes de tipo C, D y M.' ] },
      { h: 'Rishikesh: los Beatles y los monos', min: '2:29', foto: ['94', 'Una de las cúpulas del ashram de los Beatles.'], p: [
        'Rishikesh es donde el Ganges acaba de bajar del Himalaya. En 1968 los Beatles subieron a un ashram de la colina para meditar con el Maharishi, y escribieron allí buena parte del Álbum Blanco. Hoy el ashram es una ruina con grafitis, y se visita con entrada.',
        'Desde la habitación, sobre el río, una familia de monos pasaba cada día por la barandilla. Un plátano pelado delante del cristal bastó para que el más grande se lanzara contra él. **En la India hay rabia:** a perros y monos, ni comida ni caricias; si te muerden, al médico ese mismo día.' ] },
      { h: 'Dharamsala y el Dalái Lama', min: '4:44', foto: ['152', 'El Dalái Lama, en Dharamsala.'], p: [
        'Un autobús nocturno, toda la noche y medio día de curvas. Arriba, banderas de oración, monjes de granate y el Himalaya detrás. Aquí vive el Dalái Lama desde que en 1959 huyó del Tíbet cruzando las montañas.',
        'En julio de 2025 cumplió 90 años y anunció que habrá sucesor, reconocido solo por su oficina. **Sus enseñanzas son gratis**, pero hay que inscribirse con el pasaporte en McLeod Ganj; mira su calendario oficial antes de ir.' ] },
      { h: 'Benarés: el fuego que no se apaga', min: '6:39', foto: ['540', 'Piras en Manikarnika, desde la barca.'], p: [
        'De noche, una ciudad entera en silencio. Al amanecer, barca por el río. **Manikarnika** es el crematorio más antiguo: ya aparece en una inscripción del siglo V. Las piras las encienden los Dom, una comunidad dalit; la Constitución de 1950 prohibió la intocabilidad, pero la orilla sigue diciendo otra cosa.',
        'En las mismas escaleras hay bodas, y la noche del 23 de noviembre la orilla se llenó de miles de lámparas. **Los crematorios se miran desde la barca, en silencio y sin fotos.** Y el aarti de Dashashwamedh se llena: llega una hora antes.' ] },
      { h: 'La India de hoy', min: '9:36', foto: ['604', 'El Ganges al amanecer.'], p: [
        'La Partición de 1947 sigue siendo una herida: la frontera de Wagah está cerrada al paso desde abril de 2025. La India es, desde 2023, el país más poblado del mundo. Y si vas a Delhi y Agra, mira el calendario: el Taj Mahal cierra los viernes.' ] },
    ],
    ficha: [
      '**Seguridad:** ni Cachemira, ni Manipur, ni la frontera con Pakistán; taxi de precio cerrado o por app; emergencias, 112.',
      '**Visado:** e-Visa de turista de 30 días, 25 $ desde España (julio-marzo), solo en la web oficial.',
      '**Salud:** ninguna vacuna obligatoria; hepatitis A y B, tétanos y tifoidea recomendadas; seguro con repatriación.',
      '**Agua:** embotellada y precintada.',
      '**Tren:** cupo para turistas extranjeros, reservado con tiempo.',
      '**Conducir:** permiso internacional, y mejor con conductor.',
      '**Benarés:** crematorios desde la barca y sin fotos; el aarti, una hora antes.',
    ],
    fuentes: [
      W('Recomendaciones de viaje a la India (Ministerio de Asuntos Exteriores de España)', 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=India'),
      W('Tasas oficiales del e-Visa de turista (Gobierno de la India)', 'https://indianvisaonline.gov.in/evisa/images/Etourist_fee_final.pdf'),
      W('Cupo de turistas extranjeros en los trenes (Trainman)', 'https://www.trainman.in/article/foreign-tourist-quota'),
      W('Rapido supera a Uber y Ola en usuarios (Ascendants)', 'https://ascendants.in/business-stories/rapido-overtakes-uber-ola-india-ride-hailing-market/'),
      W('Declaración del Dalái Lama sobre su sucesión, 2 de julio de 2025 (web oficial)', 'https://www.dalailama.com/the-dalai-lama/biography-and-daily-life/reincarnation/statement-affirming-the-continuation-of-the-institution-of-dalai-lama-july-2-2025'),
      W('Calendario de enseñanzas del Dalái Lama (web oficial)', 'https://www.dalailama.com/schedule'),
      W('Los hoteles de la muerte de Benarés (Al Jazeera)', 'https://www.aljazeera.com/gallery/2013/12/5/hotels-of-death-in-indian-holy-city'),
      W('Manikarnika Ghat (Wikipedia)', 'https://en.wikipedia.org/wiki/Manikarnika_Ghat'),
      W('Following the Equator, de Mark Twain (Wikipedia)', 'https://en.wikipedia.org/wiki/Following_the_Equator'),
    ],
    nota: 'Datos de noviembre de 2026: visados, precios y avisos cambian. Confírmalos en fuentes oficiales antes de ir.',
    story: {
      portada: '152',
      slides: [
        { foto: '545', h: 'Así es la India', t: 'Benarés: aquí se viene a morir. Y antes de ir, las diez preguntas que todo el mundo hace.' },
        { foto: '402', h: '¿Es seguro?', t: 'Sí, con reglas: ni Cachemira, ni Manipur, ni la frontera con Pakistán. Taxi de precio cerrado o por app.' },
        { foto: '159', h: 'Visado y vacunas', t: 'e-Visa de 30 días, 25 $ desde España. Ninguna vacuna obligatoria; hepatitis, tétanos y tifoidea, recomendadas.' },
        { foto: '94', h: 'Rishikesh', t: 'El ashram de los Beatles, en ruinas. Y los monos: en la India hay rabia.' },
        { foto: '152', h: 'Dharamsala', t: 'Aquí vive el Dalái Lama. Sus enseñanzas son gratis, con inscripción y pasaporte.' },
        { foto: '598', h: 'Benarés', t: 'Miles de lámparas sobre el río. Los crematorios, desde la barca y sin fotos.', salida: 'Ver el documental' },
      ],
    },
  },
];
