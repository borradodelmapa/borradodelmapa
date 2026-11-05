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
];
