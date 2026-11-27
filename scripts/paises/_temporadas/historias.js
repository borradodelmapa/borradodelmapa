// Entradas del blog que juntan varios países (largos de temporada): no son de ningún país, así que no salen en «Historias por país» (variosPaises).
// Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const EPS = [
  ['filipinas', 'filipinas-whang-od-tatuadora-kalinga'], ['filipinas', 'filipinas-sagada-ataudes-colgantes'], ['corea-del-sur', 'corea-haenyeo-mujeres-del-mar-jeju'],
  ['india', 'india-konyak-ultimos-tatuados-nagaland'], ['tailandia', 'tailandia-moken-nomadas-del-mar-surin'], ['india', 'india-sentineleses-isla-que-no-se-visita'],
  ['japon', 'japon-ainu-hokkaido-tatuaje-prohibido'], ['china', 'china-mosuo-lago-lugu-matrimonio-andante'], ['mongolia', 'mongolia-dukha-pastores-de-renos'], ['mongolia', 'mongolia-cazadores-con-aguila-bayan-olgii'],
];
// Las fuentes son las de cada episodio: se juntan de ahí, no se copian.
const fuentes = () => {
  const vistas = new Set();
  return EPS.flatMap(([pais, slug]) => require(`../${pais}/historias.js`).find((e) => e.slug === slug).fuentes).filter((f) => !vistas.has(f.u) && vistas.add(f.u));
};
const W = (t, u) => ({ t, u });
const H = (slug) => '/blog/viajes/' + slug;
const LUZON = '/luzon-norte-en-4-dias-banaue-batad-sagada-y-buscalan-brjk';

module.exports = [
  // Largo 16:9 de la temporada 1 · montaje y capítulos: salma marketing/pueblos/temporada-1 · YouTube, jue 19 nov 2026 a las 15:30
  {
    orden: 215,
    slug: 'pueblos-borrados-del-mapa-temporada-1',
    variosPaises: true,
    fecha: '2026-11-19',
    serie: 'Pueblos borrados del mapa',
    cap: 'Temporada 1',
    pais: 'Asia',
    formato: '16:9',
    caratula: 'pueblos', // carátula de YouTube (Y18, aprobada por Paco el 13 nov 2026) = portada del blog y de la story (Y15)
    youtube: '_SnSzkDIkmw', // público desde el 18 nov 2026 (comprobado con oEmbed)
    titulo: 'TRIBUS que desaparecen: las 10 últimas culturas de Asia',
    resumen: 'Diez pueblos de Asia cuyas culturas se están borrando del mapa: la última gran tatuadora de Filipinas, las buceadoras de Jeju, los últimos konyak con la cara tatuada y los nómadas del mar. Quiénes son, qué están perdiendo y cómo llegar con respeto.',
    video: 'pueblos-t1-largo.mp4',
    realidad: 'Documental narrado por Salma con fotos y vídeos de archivo con licencia libre. Algunas escenas son recreaciones y llevan rótulo. Autores y fuentes, al final de la página.',
    creditosDe: 'salma marketing/pueblos/temporada-1',
    fotosEpisodios: 'salma marketing/pueblos',
    fotos: { portada: 'whang-od/W39', posicion: '72% 30%', galeria: [
      ['haenyeo/W27', 'Una haenyeo entra al agua con el flotador y la red, en Jeju.'],
      ['konyak/W52', 'El tatuaje del pecho de un konyak, en Longwa.'],
      ['mosuo/W9', 'Remando en el lago Lugu, la tierra de los mosuo.'],
      ['aguila/W49', 'Cazadores con águila a caballo, en Mongolia.'],
      ['dukha/W7', 'Una tienda dukha en el bosque.'],
      ['konyak/W62', 'La fiesta de Aoleang de los konyak.'],
    ] },
    cifras: [['10', 'Pueblos'], ['7', 'Países de Asia'], ['13 min', 'De documental']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'whang-od/W27',
      slides: [
        { foto: 'whang-od/W27', h: 'Pueblos que se borran del mapa', t: 'Diez pueblos de Asia cuyas culturas se están borrando del mapa. Quiénes son, qué están perdiendo y cómo llegar con respeto.', credito: ['Lee', 'CC BY 2.0'] },
        { foto: 'haenyeo/W27', h: 'Las buceadoras de Jeju', t: 'Bajan al fondo del mar sin botella con más de setenta años. A finales de 2025 quedaban 2.371, casi la mitad que diez años antes.', credito: ['idobi', 'CC BY-SA 3.0'] },
        { foto: 'konyak/W90', h: 'Las últimas caras tatuadas', t: 'En Nagaland, los últimos guerreros konyak con la cara tatuada tienen entre ochenta y noventa y cinco años.', credito: ['JyotiPN', 'CC BY-SA 4.0'] },
        { foto: 'sentineleses/W1', h: 'La isla que no se visita', t: 'Nadie sabe cuántos sentineleses hay: de 15 a 500. Nuestras enfermedades podrían acabar con ellos. Acercarse es ilegal.', credito: ['PJeganathan', 'CC BY-SA 4.0'] },
        { foto: 'mosuo/W24', h: 'El matrimonio andante', t: 'Junto al lago Lugu, los mosuo viven en la casa de la familia de la madre y, por tradición, no se casan.', credito: ['Rod Waddington', 'CC BY-SA 2.0'] },
        { foto: 'dukha/W1', h: 'Los pastores de renos', t: 'En la taiga del norte de Mongolia quedan unos doscientos dukha. Cada vez más familias bajan cuando los hijos van al colegio.', credito: ['MN5', 'CC0'] },
        { foto: 'aguila/W48', h: 'Con respeto', t: 'Y los cazadores con águila del Altái. En cada pueblo, pide permiso antes de fotografiar: son personas, no una atracción.', credito: ['Ceyhun Kavakci', 'CC BY-SA 2.0'], salida: 'Ver el documental' },
      ],
    },
    secciones: [
      { h: 'Whang-Od, la última mambabatok · Filipinas', min: '0:00', foto: ['whang-od/W27', 'Whang-Od, con la varilla del *batok* en la mano.'], p: [
        'En **Buscalan**, en las montañas de Kalinga, la tatuadora más anciana de Filipinas sigue golpeando la piel con una espina. Tiene entre 107 y 109 años: nadie conoce la fecha exacta. Su arte tiene relevo en las aprendices del pueblo; sus cantos, no.',
        '**Para ir:** guía local obligatorio y hora y media a pie desde la carretera. Whang-Od tatúa pocas horas al día y las aprendices atienden a la mayoría de los visitantes. Pide permiso antes de hacer fotos.' ],
        enlaces: [['La historia completa', H('filipinas-whang-od-tatuadora-kalinga')], ['Buscalan', '/destinos/buscalan-filipinas.html'], ['Guía de Luzón Norte en 4 días', LUZON]] },
      { h: 'Los ataúdes colgantes de Sagada · Filipinas', min: '1:42', foto: ['sagada/W02', 'Ataúdes colgados de la roca en el Valle del Eco.'], p: [
        'En las montañas de Luzón, a unos 1.500 metros, los ataúdes no se entierran: cuelgan de la roca. Por qué tan alto, quién tiene derecho a ese entierro y por qué cada vez se ven menos.',
        '**Para ir:** registro obligatorio en la oficina de turismo y guía local para bajar al Valle del Eco. No toques los ataúdes ni te subas a ellos, y haz fotos solo donde lo permita el guía.' ],
        enlaces: [['La historia completa', H('filipinas-sagada-ataudes-colgantes')], ['Sagada', '/destinos/sagada-filipinas.html'], ['Guía de Luzón Norte en 4 días', LUZON]] },
      { h: 'Las haenyeo de Jeju · Corea del Sur', min: '3:00', foto: ['haenyeo/W42', 'En el mar, junto al flotador naranja (*taewak*) que marca dónde bucea cada una.'], p: [
        'En la isla de Jeju, mujeres de más de setenta años siguen bajando al fondo del mar sin botella, a diez metros y las más expertas a veinte. A finales de 2025 quedaban **2.371**, casi la mitad que diez años antes, y dos de cada tres tienen setenta años o más.',
        '**Para ir:** el Museo de las Haenyeo está en Hado-ri, en el este de la isla. No entres en sus zonas de pesca ni cojas nada del mar, y pide permiso antes de hacerles fotos.' ],
        enlaces: [['La historia completa', H('corea-haenyeo-mujeres-del-mar-jeju')], ['Jeju', '/destinos/jeju-corea-del-sur.html']] },
      { h: 'Los konyak, los últimos tatuados · India', min: '4:26', foto: ['konyak/W90', 'Nyemwang Wanghu, uno de los últimos cazadores de cabezas tatuados.'], p: [
        'En Nagaland, en la frontera de la India con Birmania, los últimos guerreros konyak con la cara tatuada tienen entre ochenta y noventa y cinco años. Cuando se vayan, se irán las últimas caras que cuentan esa historia.',
        '**Para ir:** Nagaland volvió a exigir un permiso a los extranjeros en diciembre de 2024: confírmalo justo antes de viajar. La fiesta de Aoleang es del 1 al 6 de abril, en el distrito de Mon. Los tatuados son personas, no una atracción: pide permiso antes de fotografiar a nadie.' ],
        enlaces: [['La historia completa', H('india-konyak-ultimos-tatuados-nagaland')]] },
      { h: 'Los moken, nómadas del mar · Tailandia', min: '5:48', foto: ['moken/W25', 'Una anciana moken de Surin.'], p: [
        'Durante siglos vivieron en barcas entre Tailandia y Birmania. En 2004 se salvaron del tsunami porque reconocieron la ola de sus leyendas. Hoy viven en un poblado fijo, y el último *kabang* de Surin se construyó en 2006.',
        '**Para ir:** el parque nacional de Mu Ko Surin abre del 15 de octubre al 15 de mayo y la entrada se compra antes, por internet. Sigue al guía del poblado y pide permiso antes de fotografiar a nadie.' ],
        enlaces: [['La historia completa', H('tailandia-moken-nomadas-del-mar-surin')], ['Tailandia', '/destinos/tailandia.html']] },
      { h: 'Los sentineleses, la isla que no se visita · India', min: '7:05', foto: ['sentineleses/W1', 'La isla por la ventanilla de un avión comercial.'], p: [
        'En la isla Sentinel del Norte, en las Andamán, vive un pueblo que no deja entrar a nadie. Nadie sabe cuántos son (las estimaciones van de 15 a 500) ni entiende su idioma, y tienen buenas razones para no querer visitas: nuestras enfermedades podrían acabar con ellos.',
        '**No se visita:** acercarse a la isla es ilegal en la India. Si vas a las Andamán, tampoco hagas tours para ver a los jarawa por la carretera de su reserva.' ],
        enlaces: [['La historia completa', H('india-sentineleses-isla-que-no-se-visita')]] },
      { h: 'Los ainu, el tatuaje prohibido · Japón', min: '8:30', foto: ['ainu/W5', 'Mujer ainu con el tatuaje de la boca (colección Bälz).'], p: [
        'Las niñas ainu se tatuaban la boca desde pequeñas hasta que Japón lo prohibió en 1871. Después les quitaron la caza, la pesca y el idioma, que hoy tiene como mucho dos hablantes nativos. Japón no los reconoció como pueblo indígena hasta 2019.',
        '**Para ir:** Upopoy, el Museo Nacional Ainu, está en Shiraoi, a una hora de Sapporo en tren, y cierra los lunes. Pregunta antes de fotografiar a nadie en las danzas o talleres.' ],
        enlaces: [['La historia completa', H('japon-ainu-hokkaido-tatuaje-prohibido')]] },
      { h: 'Los mosuo y el matrimonio andante · China', min: '9:37', foto: ['mosuo/W24', 'Una abuela mosuo en la puerta de su casa.'], p: [
        'Junto al lago Lugu, entre Yunnan y Sichuan, los mosuo viven en la casa de la familia de la madre y, por tradición, no se casan: practican el matrimonio andante. El turismo está cambiando su forma de vida: en 2025 había 378 hostales en el lago.',
        '**Para ir:** se llega por carretera desde Lijiang. Su forma de familia no es un espectáculo: pregunta antes de fotografiar y no preguntes por el matrimonio andante como si fuera una curiosidad.' ],
        enlaces: [['La historia completa', H('china-mosuo-lago-lugu-matrimonio-andante')], ['Lijiang', '/destinos/lijiang-yunan-china.html']] },
      { h: 'Los dukha, pastores de renos · Mongolia', min: '10:39', foto: ['dukha/W1', 'Montando en reno por la taiga nevada.'], p: [
        'En la taiga del norte de Mongolia, junto a Siberia, los dukha viven de sus renos: les dan leche, queso y transporte. Quedan unos doscientos, y cada vez más familias bajan de la taiga cuando sus hijos tienen que ir al colegio.',
        '**Para ir:** de Mörön a Tsagaannuur, 9-12 horas en coche por pistas, y después 4-8 horas a caballo. Hace falta un permiso de zona fronteriza. Pregunta antes de fotografiar, sobre todo a niños y ceremonias.' ],
        enlaces: [['La historia completa', H('mongolia-dukha-pastores-de-renos')]] },
      { h: 'Los cazadores con águila · Mongolia', min: '11:43', foto: ['aguila/W48', 'Un cazador kazajo en el festival.'], p: [
        'En los montes Altái, en el oeste de Mongolia, los kazajos de Bayan-Ölgii cazan zorros a caballo con águilas reales. Nadie sabe cuántos quedan: las cifras van de 60 a 250. Una niña, Aisholpan, abrió la tradición a las chicas.',
        '**Para ir:** el Festival del Águila Dorada es el primer fin de semana de octubre en Shar Nuur, a 15 km de Ölgii. Pide permiso antes de fotografiar a los cazadores y no pagues por posar con un águila.' ],
        enlaces: [['La historia completa', H('mongolia-cazadores-con-aguila-bayan-olgii')]] },
    ],
    cierre: 'Cada pueblo tiene su historia completa, con más datos, su ficha útil y sus fuentes.',
    nota: 'Datos de octubre y noviembre de 2026. Permisos, accesos y precios cambian: confírmalos en fuentes oficiales antes de ir. Estas son las fuentes de los diez episodios.',
    get fuentes() { return fuentes(); },
  },
  // Largo 16:9 · montaje: india/motor/tatuajes-doc.cjs · minutos: tatuajes/capitulos.txt · fuentes: docs/tatuajes-documental-fuentes.md · YouTube 0nNCUhMiSdI, lun 23 nov 2026 a las 10:00 (poner youtube: '0nNCUhMiSdI' cuando sea público)
  {
    orden: 216,
    slug: 'historia-de-los-tatuajes',
    variosPaises: true,
    fecha: '2026-11-09',
    serie: 'Documentales',
    cap: 'Documental',
    salmaPais: 'viajar',
    formato: '16:9',
    caratula: 'tatuajes', // carátula de YouTube (Y18, aprobada por Paco el 13 nov 2026) = portada del blog y de la story (Y15)
    youtube: '0nNCUhMiSdI', // público desde el 23 nov 2026 (comprobado con oEmbed el 27 nov)
    titulo: 'La HISTORIA de los tatuajes: de Ötzi a la Yakuza',
    resumen: 'La historia de los tatuajes en 5.300 años: del hombre de hielo de los Alpes a los maoríes, las cárceles rusas, las maras y la Yakuza. Por qué nos tatuamos y por qué las mafias empiezan a esconderlo.',
    video: 'historia-de-los-tatuajes.mp4',
    realidad: 'Documental narrado por Salma con fotos de archivo con licencia libre. Algunas escenas están animadas a partir de fotos antiguas: Ötzi, el retrato maorí, la mujer ainu, los tatuadores samoanos y el tatuado japonés. El resto son fotos reales. Autores y fuentes, al final de la página.',
    creditosDe: 'salma marketing/tatuajes',
    otraSerie: 'salma marketing/pueblos',
    creditosIds: ['W1', 'W43', 'W85', 'W88', 'ainu/W4'],
    creditosIntro: 'Fotos de Wikimedia Commons, Flickr y Openverse, y sonidos de ambiente, con licencia libre. Gracias a sus autores:',
    creditosExtra: [
      ['Sonido: ultradust', 'CC BY 4.0', 'https://freesound.org/people/ultradust/sounds/165126/'],
      ['Sonido: W.carter', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'],
      ['Sonido: Amada44', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Jungle_Sound_Thailand_Phuket.flac'],
      ['Sonido: kyles', 'CC0', 'https://freesound.org/people/kyles/sounds/637566/'],
      ['Sonido: Robert EA Harvey', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Birdsong_Bourne_Woods_2020-04-27_0722.mp3'],
      ['Sonido: Sallyamane', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Caminando_en_madrugada.ogg'],
    ],
    fotos: { portada: 'W54', posicion: '50% 30%', galeria: [
      ['W87', 'Tatuaje japonés fotografiado por Kusakabe Kimbei.'],
      ['W101', 'Casa comunal iban en el parque nacional de Batang Ai, en Borneo.'],
      ['W90', 'Tatuaje tradicional en Samoa.'],
      ['W84', 'Un irezumi de cuerpo entero.'],
      ['W147', 'Aviso de «sin tatuajes» en un balneario japonés.'],
      ['W133', 'La espalda tatuada de un preso, en una cárcel de Lituania en 2010.'],
    ] },
    cifras: [['5.300', 'Años de historia'], ['17', 'Capítulos'], ['8 min', 'De documental']],
    story: {
      portada: 'W20',
      slides: [
        { foto: 'W54', h: 'Historia de los tatuajes', t: 'Para curarse, para decir de qué pueblo eres, como castigo o para entrar en una mafia.', credito: ['Bhrigu bayan', 'CC BY-SA 4.0'] },
        { foto: 'W6', h: 'Ötzi: 61 tatuajes', t: 'Murió en los Alpes hace unos 5.300 años. La mayoría de sus tatuajes coinciden con puntos de acupuntura.' },
        { foto: 'W14', h: 'Japón: del castigo al estigma', t: 'El tatuaje marcó a condenados durante siglos. En 1868 se prohibió, y esa prohibición lo unió a la delincuencia.' },
        { foto: 'W46', h: 'El tā moko maorí', t: 'No se hacía con aguja, sino con cincel. Su origen está ligado al luto.' },
        { foto: 'W131', h: 'El código de las cárceles rusas', t: 'Cada cúpula, una condena. Un tatuaje que no te habías ganado podía costarte la vida.' },
        { foto: 'W113', h: 'Las maras', t: 'Un informe de 2014 decía que muchos miembros de la MS-13 en Honduras habían dejado de tatuarse: los delataba.' },
        { foto: 'W208', h: '¿Y tú, por qué te tatúas?', t: 'De Ötzi a la Yakuza, la historia completa y con fuentes.', salida: 'Ver el documental' },
      ],
    },
    secciones: [
      { h: '¿Por qué te tatúas?', min: '0:00', foto: ['W20', 'Shi Jin, el de los nueve dragones tatuados, en un grabado de Utagawa Kuniyoshi.'], p: [
        'A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel o para entrar en una mafia. Este documental sigue esa marca durante 5.300 años, de los Alpes a Nueva Zelanda, Samoa, Borneo, Japón, India, Rusia, Centroamérica, Italia, Hong Kong y México.',
      ] },
      { h: 'Ötzi: el tatuaje como medicina', min: '0:21', foto: ['W6', 'Reconstrucción de Ötzi en un museo.'], p: [
        '**Ötzi**, la momia de los Alpes, murió hace unos 5.300 años con **61 tatuajes** mapeados con imagen multiespectral. La mayoría coinciden con puntos de acupuntura.',
        'Uno, en las costillas, no está cerca de ninguna articulación: los investigadores creen que podía servir para tratar un dolor en el pecho. Es una teoría, pero apunta a una función médica y no decorativa.',
      ] },
      { h: 'De dónde viene la palabra «tattoo»', min: '0:49', foto: ['W9', '«Cabeza de un nativo de Otaheite», dibujo de Sydney Parkinson.'], p: [
        'Viene del tahitiano y samoano *tatau* (en marquesano, *tatu*). Se registró por primera vez en inglés en 1769, en los escritos del capitán Cook.',
      ] },
      { h: 'Japón: del castigo al estigma', min: '1:06', foto: ['W14', 'Marcas penales japonesas, en la enciclopedia Kojiruien.'], p: [
        'En Japón, el tatuaje se usó como castigo penal desde el periodo Kofun (300-600) y siguió marcando a condenados durante el periodo Edo. El gobierno Meiji lo prohibió al empezar su etapa, en 1868.',
        'Fue esa prohibición la que lo empujó a la clandestinidad y lo unió a la criminalidad. Se legalizó en 1948, con las fuerzas de ocupación.',
      ] },
      { h: 'Maoríes: el tā moko', min: '1:45', foto: ['W46', 'Tuterei Karewa, de los Ngāti Maru, retratado por Arthur James Iles.'], p: [
        'En Nueva Zelanda, el **tā moko** se talla con cincel: son cortes en la piel y no una simple punción, y por eso deja una cicatriz distinta a la de otros tatuajes polinesios.',
        'Te Ara, la enciclopedia de Nueva Zelanda, lo liga al luto (las mujeres se cortaban la piel y añadían hollín en memoria de alguien querido) y a la mitología: el dios Rūaumoko y el mito de Mataora y Niwareka.',
      ] },
      { h: "Samoa: el pe'a", min: '2:17', foto: ['W89', 'Instrumentos tradicionales del tatuaje en el Pacífico.'], p: [
        "El **pe'a** cubre de la cintura a las rodillas. En teoría se hace en cinco sesiones a lo largo de unos diez días; en la práctica, por el dolor y la curación, pueden ser semanas. Se golpea un peine de hueso, el *ausogi'aso*, con una maceta, el *sausau*.",
        "Un pe'a a medias se consideraba vergonzoso. Antes era requisito para el título de *matai*, jefe de familia. Ya no lo es, pero muchos lo siguen haciendo a la manera tradicional.",
      ], enlaces: [['Samoa', '/destinos/samoa.html']] },
      { h: 'Borneo: los iban', min: '2:43', foto: ['W100', 'Dos hombres iban, en una foto de la colección del Tropenmuseum.'], p: [
        'Entre los iban, un tatuaje de rana en la garganta se cree que protege de morir decapitado en combate. El primero de un hombre suele ser el *bunga terung*, una espiral en el hombro, antes de su *bejalai*, un viaje iniciático.',
        'Creen que los espíritus conceden los tatuajes en sueños, y que un hombre sin tatuajes es casi invisible para los dioses.',
      ], enlaces: [['Kuching', '/destinos/kuching-malasia.html']] },
      { h: 'Los ainu de Hokkaido', min: '3:10', foto: ['ainu/W5', 'Mujer ainu con el tatuaje de la boca (colección Bälz).'], p: [
        'Las mujeres ainu se tatuaban la boca y los antebrazos. Empezaban entre los 10 y los 13 años, a veces antes, y terminaban hacia los 15 o 16: era la señal de que estaban listas para casarse. La colonización japonesa de Hokkaido, entre 1869 y 1904, acabó prohibiéndolo.',
      ], enlaces: [['Los ainu: el tatuaje prohibido', '/blog/viajes/japon-ainu-hokkaido-tatuaje-prohibido']] },
      { h: 'Las apatani de India', min: '3:33', foto: ['W55', 'Una mujer apatani trabajando en el campo.'], p: [
        'En el valle de Ziro, las mujeres apatani llevaban tatuaje facial, el *tippei*, y tapones de nariz de madera. Empezaron como protección contra el rapto, no por estética. Se hacían a los 10 años, a manos de mujeres mayores. Se prohibieron en los años setenta y hoy solo los llevan las mayores.',
      ] },
      { h: 'Tatuajes de cárcel en Rusia', min: '3:53', foto: ['W131', 'Preso tatuado en una cárcel de Lituania, en 2010.'], p: [
        'En las cárceles rusas, cada tatuaje de los *vory v zakone* decía algo concreto. Estrellas en hombros o rodillas: «no me arrodillo ante nadie»; la de ocho puntas marca rango. Cúpulas ortodoxas en el pecho: cada una, una condena; tres, preso para siempre. Un ojo en el pecho: «te vigilo». Un gato: el ladrón profesional.',
        'Llevar uno sin haberlo ganado era peligroso. En los años cincuenta, bajo la represión de Jrushchov, podía castigarse con violación o muerte. Hacia los setenta, al extenderse entre los presos jóvenes, los líderes dejaron de castigarlo así.',
      ] },
      { h: 'Maras: la MS-13', min: '4:44', foto: ['W113', 'Tatuaje de la MS-13, en una foto del servicio de inmigración de EE. UU.'], p: [
        'Un informe de inteligencia hondureño, publicado por El Heraldo y resumido por InSight Crime en 2014, decía que muchos miembros de la MS-13 en Honduras habían dejado de tatuarse símbolos de la pandilla. El motivo lo dio una fuente policial anónima: les identificaban tanto la policía como las bandas rivales.',
      ] },
      { h: 'Yakuza', min: '5:08', foto: ['W150', 'Tebori, el tatuaje japonés hecho a mano.'], p: [
        'La Yakuza heredó el *irezumi* integral, el *tebori*, hecho a mano. Pero el estigma que nació con la prohibición Meiji sigue vivo: balnearios, gimnasios y negocios prohíben la entrada a quien lleva tatuajes visibles, y muchos miembros evitan tatuarse por eso.',
      ] },
      { h: 'Cosa Nostra y Camorra', min: '5:31', foto: ['W153', 'Dibujo de un camorrista tatuado.'], p: [
        'La mayoría de los miembros de la Cosa Nostra no llevan tatuajes específicos de pertenencia, aunque hay excepciones documentadas, como un caso de «mano negra».',
        'La Camorra es lo contrario: tiene tradición de tatuaje carcelario desde el siglo XIX, para marcar lealtad. Un grupo joven de Ponticelli se ganó el apodo de «los tatuados» por tatuarse el nombre de su jefe.',
      ] },
      { h: 'Tríadas chinas', min: '5:59', foto: ['W226', 'Un dragón tatuado en la espalda, en Hong Kong.'], p: [
        'Los tatuajes de dragón y tigre marcaban antiguamente el rango en las tríadas. El criminólogo P. Sundramoorthy, de la Universiti Sains Malaysia, explicaba en 2020 que hoy, en las bandas de Malasia, el tatuaje ya no forma parte de la iniciación: lo evitan para no ser detectados. Un tatuaje así, por sí solo, ya no prueba pertenencia.',
      ] },
      { h: 'México: la Santa Muerte', min: '6:23', foto: ['W161', 'Interior del Templo de la Santa Muerte, en Querétaro.'], p: [
        'La Santa Muerte se tatúa pidiendo protección y la llaman «la santa narco». Los investigadores Kate Kingsbury y Andrew Chesnut rechazan esa etiqueta por reduccionista: la presentan como la patrona de los dos bandos de la guerra contra el narco. También la veneran policías, militares y guardias de prisión.',
        'En marzo de 2009, en Nuevo Laredo, con soldados vigilando, las excavadoras arrasaron más de treinta altares. La versión oficial fue que estaban en terreno público sin permiso; los militares los llamaban narcoaltares.',
      ] },
      { h: 'La mafia rusa hoy', min: '7:04', foto: ['W127', 'El campo de Vorkutá, en la Unión Soviética.'], p: [
        'El código de los *vory v zakone* sobrevivió a la caída de la URSS: la Bratva es la red más amplia, con los *vory* como élite. Pero ya se había empezado a resquebrajar en los años cuarenta, con los presos que volvían del Ejército Rojo y sí colaboraban con el Estado. Las fuentes no aclaran si el sistema de tatuajes sobrevivió igual.',
      ] },
      { h: 'Por qué nos tatuamos hoy', min: '7:30', foto: ['W208', 'Un tatuador trabajando.'], p: [
        'Yakuza, tríadas y maras aparecen en estas fuentes con el mismo patrón: el tatuaje que antes probaba pertenencia puede delatar. Fuera de las cárceles, casi todos nos tatuamos por gusto: por un viaje, por un recuerdo o por alguien a quien no queremos olvidar.',
      ] },
    ],
    cierre: 'Si vas a viajar a alguno de estos lugares, pregunta antes de fotografiar a nadie: un tatuaje puede contar una historia que no te corresponde a ti enseñar.',
    nota: 'Datos revisados en noviembre de 2026. Donde las fuentes son parciales o discuten, lo decimos: las maras con un informe de 2014, las tríadas solo con el caso de Malasia. Sobre la mafia rusa, no hay confirmación de que el sistema de tatuajes siga igual.',
    fuentes: [
      W('Smithsonian Magazine: los 61 tatuajes de Ötzi', 'https://www.smithsonianmag.com/smart-news/61-tattoos-otzi-5300-year-old-iceman-180954035/'),
      W('Etymonline: tattoo', 'https://www.etymonline.com/word/tattoo'),
      W('Wikipedia: Irezumi', 'https://en.wikipedia.org/wiki/Irezumi'),
      W('Te Ara: tā moko', 'https://teara.govt.nz/en/ta-moko-maori-tattooing/page-1'),
      W('Pitt Rivers Museum: tatuaje samoano', 'https://web.prm.ox.ac.uk/bodyarts/index.php/permanent-body-arts/tattooing/175-samoan-tattooing.html'),
      W('SAYS: tatuajes tribales de Sarawak', 'https://says.com/my/lifestyle/the-history-behind-sarawak-s-ancient-tribal-tattoos'),
      W('Wikipedia: pueblo ainu', 'https://en.wikipedia.org/wiki/Ainu_people'),
      W('Vajiram & Ravi: las apatani', 'https://vajiramandravi.com/current-affairs/who-are-apatani-tribes/'),
      W('Wikipedia: tatuajes criminales rusos', 'https://en.wikipedia.org/wiki/Russian_criminal_tattoos'),
      W('InSight Crime: informe sobre las pandillas de Honduras', 'https://insightcrime.org/news/brief/investigation-reveals-social-control-of-honduras-gangs/'),
      W('JHU Stripe: tatuajes de la mafia siciliana', 'https://stripe.jhu.edu/news/sicilian-mafia-tattoos'),
      W('Worldcrunch: tatuajes de la mafia italiana', 'https://worldcrunch.com/culture-society/italian-mafia-tattoos-camorra'),
      W('MCPF / Free Malaysia Today: tríadas en Malasia', 'https://www.mcpfpg.org/triads-no-longer-tattoo-their-initiates-says-expert'),
      W('Wikipedia: mafia rusa', 'https://en.wikipedia.org/wiki/Russian_mafia'),
      W('Kingsbury y Chesnut (2020): Not Just a Narcosaint', 'https://link.springer.com/article/10.1007/s41603-020-00095-2'),
      W('Baylor: resumen sobre la Santa Muerte', 'https://religionwatch.web.baylor.edu/news/story/2020/santa-muerte-folk-saint-both-sides-drug-wars'),
      W('NPR: los altares de Nuevo Laredo, 2009', 'https://www.npr.org/transcripts/102928118'),
      W('AP en Sun Journal: Nuevo Laredo, 2009', 'https://www.sunjournal.com/?p=85763'),
    ],
  },
  // Largo 16:9 · montaje: india/motor/tuvalu-preguntas.cjs (v5) · minutos: pueblos/tuvalu/capitulos.txt · guion y fuentes: docs/tuvalu-guion-direccion.md · YouTube, vie 27 nov 2026 a las 10:00 (poner youtube: 'QMWkfY186lk' SOLO cuando sea público)
  {
    orden: 217,
    slug: 'tuvalu-se-hunde-asi-se-vive',
    variosPaises: true,
    fecha: '2026-11-26',
    serie: 'Documentales',
    cap: 'Documental',
    pais: 'Tuvalu',
    formato: '16:9',
    caratula: 'tuvalu', // carátula de YouTube (Y18, aprobada por Paco el 13 nov 2026) = portada del blog y de la story (Y15)
    youtube: 'QMWkfY186lk', // público desde el 27 nov 2026 (comprobado con oEmbed)
    titulo: 'Tuvalu se hunde: así se vive en el país que desaparece',
    resumen: 'El punto más alto de Tuvalu está a 4,6 metros sobre el mar. Así se vive en el país que puede desaparecer: cuánta gente vive allí, de qué vive, qué ha pactado con Australia y cómo se viaja hasta él.',
    video: 'tuvalu-se-hunde-asi-se-vive.mp4',
    realidad: 'Documental narrado por Salma con fotos de Wikimedia Commons con licencia libre y planos de vídeo del Banco Asiático de Desarrollo y de la Fondation Tara Océan. No hemos estado en Tuvalu: cada dato sale de las fuentes que citamos al final. La imagen de portada es una ilustración.',
    creditosDe: 'salma marketing/pueblos/tuvalu',
    creditosIntro: 'Fotos de Wikimedia Commons y vídeo con licencia libre. Gracias a sus autores:',
    creditosExtra: [
      ['Vídeo: Asian Development Bank', 'CC BY', 'https://www.youtube.com/watch?v=33oyhytL0yk'],
      ['Vídeo: Asian Development Bank', 'CC BY', 'https://www.youtube.com/watch?v=AzqUe4HXayA'],
      ['Vídeo: Fondation Tara Océan', 'CC BY', 'https://www.youtube.com/watch?v=NQBKHMKXzAc'],
    ],
    fotos: { portada: 'W15', posicion: '50% 45%', galeria: [
      ['W13', 'Mujeres en una maneapa, la casa comunal, en Funafuti.'],
      ['W122', 'Voleibol al atardecer sobre la pista del aeropuerto.'],
      ['W63', 'Agua potable de un punto de reparto, en la sequía de 2011.'],
      ['W39', '«Stand with Tuvalu» en la cumbre del clima de Copenhague, 2009.'],
      ['W11', 'La oficina de Tuvalu Telecom, en Funafuti.'],
      ['W136', 'Un supermercado de Funafuti: casi todo llega en barco.'],
    ] },
    cifras: [['4,6 m', 'Punto más alto'], ['10.643', 'Habitantes (2022)'], ['5 min', 'De documental']],
    story: {
      portada: 'W15',
      slides: [
        { foto: 'W15', h: 'Tuvalu se hunde', t: 'El punto más alto de este país del Pacífico está a 4,6 metros sobre el mar.', credito: ['FabGUTIE', 'CC BY-SA 4.0'] },
        { foto: 'W125', h: 'Nueve islas, 26 km²', t: 'Seis atolones y tres islas de arrecife entre Australia y Hawái. Viven 10.643 personas.' },
        { foto: 'W7', h: 'El problema es la marea', t: 'Según Naciones Unidas, hacia 2050 la marea alta puede cubrir hasta la mitad de la capital.' },
        { foto: 'W105', h: 'Y sin embargo, crecen', t: 'Un estudio midió sus 101 islas durante 40 años: la superficie total creció casi un 3 %.' },
        { foto: 'W56', h: 'Fabricar tierra', t: 'Con arena de la laguna ya han levantado más de 15 hectáreas nuevas, más altas que el resto de la isla.' },
        { foto: 'W11', h: 'Un país que vive de «.tv»', t: 'Su dominio de internet llegó a ser cerca del 8 % de los ingresos del Gobierno.' },
        { foto: 'W126', h: '¿Se puede viajar?', t: 'Solo en avión desde Fiyi, sin visado hasta 30 días y todo en efectivo: no hay cajeros.', salida: 'Ver el documental' },
      ],
    },
    secciones: [
      { h: 'El país que se hunde', min: '0:00', foto: ['W62', 'Una mujer de Tuvalu.'], p: [
        'El punto más alto de Tuvalu está a **4,6 metros** sobre el nivel del mar, en la isla de Niulakita. Por eso se le llama «el país que se hunde». Este documental responde a lo que más se pregunta de él, con la fuente de cada dato.',
      ] },
      { h: '¿Dónde está Tuvalu?', min: '0:09', foto: ['W105', 'Un islote de Tuvalu fotografiado desde la Estación Espacial Internacional.'], p: [
        'En mitad del Pacífico, más o menos a medio camino entre Australia y Hawái. Son **nueve islas**: seis atolones y tres islas de arrecife. Juntas suman unos **26 km²** de tierra.',
        'Un atolón es un anillo de coral alrededor de una laguna: la tierra firme es solo el borde.',
      ], enlaces: [['Tuvalu', '/destinos/tuvalu.html'], ['Vaitupu', '/destinos/vaitupu-tuvalu.html']] },
      { h: '¿Cuánta gente vive en Tuvalu?', min: '0:31', foto: ['W125', 'Funafuti desde el aire: la pista del aeropuerto ocupa buena parte de la isla.'], p: [
        '**10.643 personas**, según el censo de 2022. Más de la mitad vive en un solo atolón: Funafuti, la capital. La isla principal es una franja entre la laguna y el océano abierto; en algunos tramos se ven las dos orillas desde la misma carretera.',
        'En el centro de cada comunidad está la **maneapa**, la casa comunal: ahí se decide, se celebra y se baila. Y la plaza es la pista del aeropuerto, que construyeron los marines de Estados Unidos en la Segunda Guerra Mundial. Cuando no hay avión, es campo de rugby y de voleibol.',
      ], enlaces: [['Funafuti', '/destinos/funafuti-tuvalu.html']] },
      { h: '¿De verdad se hunde?', min: '1:09', foto: ['W7', 'Olas contra la orilla del océano en Funafuti.'], p: [
        'No como una ola que lo tapa todo: el problema es la marea. Según el Programa de Naciones Unidas para el Desarrollo, si no se hace nada, **hacia 2050 la marea alta puede cubrir hasta la mitad de la capital**.',
        'Pero hay un dato que casi nunca se cuenta. Un estudio de Kench, Ford y Owen publicado en *Nature Communications* (2018) midió las **101 islas** del país con fotos aéreas y de satélite de cuarenta años, y la superficie total había crecido **casi un 3 %**: las olas y las tormentas mueven arena y coral, y las islas cambian de forma.',
        'Eso no significa que se pueda vivir igual. No hay ríos: el agua dulce es la que cae del cielo. En la sequía de 2011 el país declaró el estado de emergencia, y el agua y las desaladoras tuvieron que llegar de fuera.',
      ] },
      { h: '¿Va a desaparecer Tuvalu?', min: '1:58', foto: ['W56', 'Obras de tierra nueva en Funafuti, en 2025.'], p: [
        'Tuvalu ha decidido que no. Primero, por ley: su ministro de Exteriores, Simon Kofe, habló a la cumbre del clima de Glasgow con el agua por las rodillas, y en 2023 el país cambió su **Constitución** para seguir siendo un Estado aunque pierda su territorio, con sus fronteras en el mar fijas. Según su Gobierno, es el primer país del mundo que lo hace.',
        'Y segundo, fabricando tierra: con arena de la laguna se levanta suelo nuevo en la capital, más alto que el resto de la isla. En septiembre de 2026, el primer ministro Feleti Teo habló de **más de 15 hectáreas** ya hechas.',
      ] },
      { h: '¿Se van a Australia?', min: '2:37', foto: ['W79', 'Baile tuvaluano en el festival Pasifika de Auckland, Nueva Zelanda, en 2025.'], p: [
        'El tratado **Falepili**, firmado con Australia, permite que **280 personas al año** se instalen allí con residencia permanente. Las primeras llegaron a finales de 2025.',
        'No todo el mundo lo ve bien: el tratado obliga a Tuvalu a consultar a Australia antes de firmar pactos de seguridad con otros países. Varios políticos lo han criticado, y el propio primer ministro ha dicho que quiere revisar ese punto.',
        'Muchos tuvaluanos viven ya fuera. En Auckland, Nueva Zelanda, siguen ensayando el **fatele**, su baile, lejos de casa.',
      ] },
      { h: '¿De qué vive Tuvalu?', min: '3:14', foto: ['W25', 'Pescado recién traído del mar, en Funafuti.'], p: [
        'De dos cosas que no ocupan tierra. La primera, los permisos para pescar atún en sus aguas, enormes comparadas con sus islas.',
        'La segunda, internet: a Tuvalu le tocó el dominio **.tv**, las mismas letras que en inglés quieren decir televisión. Según el Presupuesto Nacional de 2019, era **cerca del 8 %** de los ingresos del Gobierno.',
        'Casi todo lo demás llega en barco. Y hay islas sin puerto: la carga se pasa a barcas y se lleva hasta el arrecife.',
      ], enlaces: [['Niutao', '/destinos/niutao-tuvalu.html']] },
      { h: 'La historia de Tuvalu', min: '3:47', foto: ['W130', 'Grabado holandés de las islas, de 1829.'], p: [
        'El primer europeo que vio estas islas fue un español: la expedición de **Álvaro de Mendaña** pasó junto a una de ellas en enero de 1568, probablemente Nui, sin desembarcar.',
        'Después fueron colonia británica con el nombre de **islas Ellice**, unidas a las Gilbert, que hoy son Kiribati. Votaron separarse y en **1978** Tuvalu se hizo independiente.',
      ], enlaces: [['Nui', '/destinos/nui-tuvalu.html']] },
      { h: '¿Se puede viajar a Tuvalu?', min: '4:12', foto: ['W126', 'Un avión en la pista de Funafuti.'], p: [
        'Sí, y casi nadie lo hace. Solo se llega **en avión desde Fiyi**, con una sola aerolínea (Fiji Airways), y los horarios cambian a menudo: compra con margen.',
        'Con pasaporte español **no hace falta visado** para estancias de turismo de hasta 30 días. Piden billete de salida y el pasaporte con seis meses de validez. La moneda es el dólar australiano y **no hay cajeros ni se aceptan tarjetas**: todo en efectivo (Ministerio de Asuntos Exteriores de España).',
      ], enlaces: [['Reserva marina de Funafuti', '/destinos/reserva-marina-funafuti-tuvalu.html']] },
    ],
    cierre: 'Datos de viaje a noviembre de 2026: confírmalos siempre en fuentes oficiales antes de ir.',
    nota: 'Datos revisados en noviembre de 2026. Lo que no tiene fuente suficiente se queda fuera. Que Mendaña viera Nui es la identificación más probable, no segura. El 8 % del .tv se calcula sobre todos los ingresos del Gobierno, ayuda exterior incluida; sobre los ingresos propios sería cerca de un 13 %.',
    fuentes: [
      W('PNUD / Green Climate Fund: proyecto de adaptación costera de Tuvalu (4,6 m)', 'https://www.adaptation-undp.org/sites/default/files/resources/gcf_tuvalu_funding_proposal_-undp-300616-5699.pdf'),
      W('Kench, Ford y Owen, Nature Communications (2018)', 'https://www.nature.com/articles/s41467-018-02954-1'),
      W('Presupuesto Nacional de Tuvalu 2019 (.tv)', 'https://finance.gov.tv/wp-content/uploads/2022/05/Tuvalu-National-Budget-2019.pdf'),
      W('Ministerio de Asuntos Exteriores de España: recomendaciones de viaje', 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=Tuvalu'),
      W('Wikipedia: Tuvalu (censo, historia, aeródromo)', 'https://en.wikipedia.org/wiki/Tuvalu'),
      W('Wikipedia: tratado Falepili', 'https://en.wikipedia.org/wiki/Australia%E2%80%93Tuvalu_Falepili_Union'),
      W('Wikipedia: Simon Kofe', 'https://en.wikipedia.org/wiki/Simon_Kofe'),
      W('Wikipedia: .tv', 'https://en.wikipedia.org/wiki/.tv'),
    ],
  },
  // Largo 16:9 · T25 · montaje: salma marketing/el-salvador (v2, ULTIMA) · minutos: el-salvador/capitulos.txt · expediente: docs/el-salvador-expediente.md · guion: docs/el-salvador-guion-direccion.md
  // YouTube, dom 22 nov 2026 a las 10:00 (puede cambiar; poner youtube: '<id>' SOLO cuando sea público). Límites (F4, Estrategia 19 nov): nada atribuido a la primera dama;
  // Pamplona sin partidos; «al menos diez mil» muertos; el náhuat se dejó «por miedo», sin decreto.
  {
    orden: 219,
    slug: 'indigenas-de-el-salvador-del-exterminio-a-cantar-el-himno',
    variosPaises: true,
    fecha: '2026-11-22',
    serie: 'Documentales',
    cap: 'Documental',
    pais: 'El Salvador',
    formato: '16:9',
    caratula: 'salma marketing/el-salvador/caratula/ENTREGA/caratula-el-salvador.jpg', // carátula de YouTube aprobada por Paco (19 nov 2026, «La 2, en fila») = portada del blog y de la story (Y15)
    titulo: 'Indígenas de El Salvador: del exterminio a cantar el himno',
    resumen: 'En 1932, el ejército de El Salvador mató a miles de indígenas y los eligió por su ropa y por su lengua. Noventa y tres años después, unos niños de Izalco cantaron el himno nacional en náhuat en la Asamblea Legislativa. Qué pasó en medio, qué ha hecho el país y qué ha cambiado con Bukele.',
    video: 'indigenas-de-el-salvador.mp4',
    realidad: 'Documental narrado por Salma con fotos de Wikimedia Commons con licencia libre y vídeos con licencia libre o de la Asamblea Legislativa. No hemos estado en El Salvador: cada dato sale de las fuentes que citamos al final.',
    creditosDe: 'salma marketing/el-salvador',
    creditosIntro: 'Fotos de Wikimedia Commons y vídeos. Gracias a sus autores:',
    creditosExtra: [
      ['René Figueroa · Centro Cultural de España en El Salvador (Guadalupe Estrada)', 'CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Shicuase_nanzin_uan_sepilzin_(Guadalupe_Estrada).jpg'],
      ['René Figueroa · Centro Cultural de España en El Salvador (Anastacia López)', 'CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Anastacia_L%C3%B3pez_de_Santo_Domingo_de_Guzm%C3%A1n.jpg'],
      ['René Figueroa · Centro Cultural de España en El Salvador (Elva Pérez)', 'CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Elva_P%C3%A9rez_-_53737349219.jpg'],
      ['René Figueroa (Manuel Coreto)', 'CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Manuel_Coreto,_m%C3%BAsico.jpg'],
      ['Mauricio Kabistán (Paula López)', 'CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Paula_L%C3%B3pez.jpg'],
      ['Marcelo Galicia (mujer de Tacuba)', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:VESTIMENTA_MUJER_INDIGENA_DEL_DISTRITO_DE_TACUBA,_EL_SALVADOR.jpg'],
      ['Enriquehg1989 (Nantzin Sixta)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Nantzin_Sixta.jpg'],
      ['Enriquehg1989 (Nantzin Sixta)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Nantzin_Sixta_3.jpg'],
      ['Enriquehg1989 (Nantzin Elsa López)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Nantzin_Elsa_L%C3%B3pez.jpg'],
      ['Feralmej (Panchimalco)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Procesion_de_las_flores_en_Panchimalco.jpg'],
      ['Feralmej (Panchimalco)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Elderly_man_holding_a_pole_during_a_traditional_dance_in_Panchimalco_during_%22procesi%C3%B3n_de_las_palmas%22.jpg'],
      ['Efegé (Nahuizalco)', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Musical_group_Nahuizalco.JPG'],
      ['Efegé (iglesia de Nahuizalco)', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Iglesia_San_Juan_Bautista_Nahuizalco.JPG'],
      ['Metztli (Nahuizalco)', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Nahuizalco_3836.JPG'],
      ['CapitanCan (Izalco)', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Iglesia_Nuestra_Se%C3%B1ora_de_La_Asunci%C3%B3n,_Izalco,_Sonsonate.jpg'],
      ['Beatriz Fortinez (Izalco)', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:Iglesia_La_Asunci%C3%B3n_Izalco.JPG'],
      ['Mario Galan (Cristos de Izalco)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Los_Cristos_de_Izalco.jpg'],
      ['Feliciano Ama, hacia 1932 (autor desconocido)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Feliciano_Ama_chief_leader_of_the_peasant_uprising_in_Izalco_circa_1932.jpg'],
      ['Feliciano Ama (autor desconocido)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Feliciano_Ama_agricultor_salvadore%C3%B1o_L%C3%ADder_pol%C3%ADtico_cacique_ind%C3%ADgena.jpg'],
      ['Farabundo Martí en 1929 (autor desconocido)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Farabundo_marti_en_1929.png'],
      ['Maximiliano Hernández Martínez (autor desconocido)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:General_Maximiliano_Hern%C3%A1ndez_Mart%C3%ADnez,_President_of_El_Salvador.jpg'],
      ['Netito777 y Jarke (mapa de 1932)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Mapa_levantamiento_campesino_1932.svg'],
      ['Eduard Paulig (cafetal, 1927)', 'CC BY 4.0', 'https://commons.wikimedia.org/wiki/File:Arbetare_p%C3%A5_en_kaffeplantage_i_El_Salvador_1927_SLSA_1232-3_foto_14.jpg'],
      ['State Government Photographer (café)', 'CC0', 'https://commons.wikimedia.org/wiki/File:Drying_coffee_on_a_plantation_in_El_Salvador(GN03500).jpg'],
      ['Korea.net (Mauricio Funes)', 'CC BY-SA 2.0', 'https://commons.wikimedia.org/wiki/File:Mauricio_Funes.jpg'],
      ['Tribunal Supremo Electoral (Nayib Bukele)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Nayib_Bukele_with_the_TSE_(cropped).jpg'],
      ['Casa Presidencial El Salvador (Nayib Bukele)', 'CC0', 'https://commons.wikimedia.org/wiki/File:Nayib_Bukele_(53255984989_1a255e1dff_o).jpg'],
      ['AndreX (Nayib Bukele)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Presidente_Nayib_Bukele_(cropped).jpg'],
      ['Scarabocchio1999 (Salón Azul)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Salon_Azul_Asamblea_Legislativa.jpg'],
      ['TimumachtikanNawat (grabaciones en Santo Domingo de Guzmán)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Viaje_de_campo_a_Santo_Domingo_de_Guzm%C3%A1n_para_la_grabaci%C3%B3n_de_audios_en_Lingua_Libre_para_el_Wikcionario_en_n%C3%A1huat_07.jpg'],
      ['Centro Cultural de España en El Salvador (taller de Wikipedia en náhuat)', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:Taller_para_la_edici%C3%B3n_en_Wikipedia_de_contenido_n%C3%A1huat.jpg'],
      ['Krzysztof Golik (Pamplona)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Plaza_del_Castillo_in_Pamplona_(1).jpg'],
      ['feinteriano (Ruta de las Flores)', 'CC BY-SA 3.0', 'https://commons.wikimedia.org/wiki/File:RUTA_DE_LAS_FLORES_EN_ATACO._-_panoramio.jpg'],
      ['La Radio Tomada (audio «yek peyna»)', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Yek_peyna_-_buenos_dias.ogg'],
      ['Vídeo: Ernesto Castro, «Takwikalis Tutalyu» (10 sept 2025)', 'YouTube', 'https://www.youtube.com/watch?v=vx8crmplcos'],
      ['Vídeo: Noticiero Legislativo, Asamblea Legislativa (10 sept 2025)', 'YouTube', 'https://www.youtube.com/watch?v=z-g9c9PhJ90'],
      ['Vídeo: Noticiero Legislativo, Asamblea Legislativa (3 sept 2026)', 'YouTube', 'https://www.youtube.com/watch?v=Jp3vUDO32M8'],
      ['Vídeo: Leslie Ortiz, «Ne Nawat mulini / El Náhuat se mueve»', 'CC BY', 'https://www.youtube.com/watch?v=-zk99vCKLl4'],
      ['Vídeo: Paula López, «Achtu At» (JM Castillo / Wild Films)', 'CC BY', 'https://www.youtube.com/watch?v=QlVaxfZ2HJ4'],
      ['Vídeo: The World of Suiri, conmemoración de 1932 en Nahuizalco (2017)', 'CC BY', 'https://www.youtube.com/watch?v=F08PTTLu6Q4'],
    ],
    fotos: { portada: 'NAHUIZALCO', posicion: '50% 50%', galeria: [
      ['CRISTOS', 'La procesión de los Cristos de Izalco.'],
      ['NAHUI2', 'La iglesia de San Juan Bautista, en Nahuizalco.'],
      ['CAFE2', 'Café secándose en una finca de El Salvador.'],
      ['GRABA14', 'Grabando a los mayores en náhuat, en Santo Domingo de Guzmán.'],
      ['CORETO', 'Manuel Coreto, músico, que enseña náhuat en Cuisnahuat.'],
      ['MAPA1932', 'Las zonas del levantamiento de 1932, en el occidente del país.'],
    ] },
    cifras: [['68.148', 'Indígenas en el censo de 2024'], ['1.135', 'Dicen hablar náhuat'], ['6 min', 'De documental']],
    story: {
      portada: 'NAHUIZALCO',
      slides: [
        { foto: 'MAPA1932', h: 'El Salvador, 1932', t: 'El ejército mató a miles de indígenas del occidente del país y los eligió por su ropa y por su lengua.', credito: ['Netito777 y Jarke', 'Dominio público'] },
        { foto: 'AMA', h: 'Feliciano Ama', t: 'Líder indígena de Izalco. Lo ahorcaron en la plaza de su pueblo el 28 de enero de 1932.', credito: ['Autor desconocido', 'Dominio público'] },
        { foto: 'SIXTA1', h: 'Esconderse para vivir', t: 'Muchas familias guardaron el refajo y el huipil y dejaron de hablar náhuat a sus hijos. Por miedo.', credito: ['Enriquehg1989', 'CC BY-SA 4.0'] },
        { foto: 'FUNES', h: 'El perdón de 2010', t: 'El presidente Mauricio Funes pidió perdón a los pueblos indígenas. Ningún presidente ha vuelto a hacerlo.', credito: ['Korea.net', 'CC BY-SA 2.0'] },
        { foto: 'SALON2016', h: 'El himno, en náhuat', t: 'En septiembre de 2025, niños de Izalco cantaron el himno nacional en náhuat en la Asamblea Legislativa.', credito: ['Scarabocchio1999', 'CC BY-SA 4.0'] },
        { foto: 'GRABA14', h: '68.148', t: 'Personas que se declararon indígenas en el censo de 2024. En 2007 eran 13.310: cinco veces más.', credito: ['TimumachtikanNawat', 'CC BY-SA 4.0'] },
        { foto: 'NAHUI2', h: 'La ayuda de Pamplona', t: 'El edificio nuevo de la cuna de náhuat de Nahuizalco lo pagó el Ayuntamiento de Pamplona.', credito: ['Efegé', 'CC BY-SA 3.0'] },
        { foto: 'RUTA', h: '¿Se puede visitar?', t: 'Sí: Izalco y Nahuizalco están en la Ruta de las Flores, a una o dos horas de San Salvador.', credito: ['feinteriano', 'CC BY-SA 3.0'], salida: 'Ver el documental' },
      ],
    },
    secciones: [
      { h: 'Del exterminio a cantar el himno', min: '0:00', foto: ['SALON2016', 'El Salón Azul de la Asamblea Legislativa, donde sonó el himno en náhuat.'], p: [
        'En **1932**, el ejército de El Salvador mató a miles de indígenas y los eligió por su ropa y por su lengua. Noventa y tres años después, en septiembre de 2025, unos niños de Izalco cantaron el himno nacional en náhuat en el Salón Azul de la Asamblea Legislativa. Según la prensa, era la primera vez que sonaba en una lengua indígena dentro del Parlamento.',
        'Este documental cuenta qué pasó en medio, qué ha hecho el país y qué falta. Cada dato lleva su fuente al final.',
      ], enlaces: [['El Salvador', '/destinos/el-salvador.html']] },
      { h: '¿Qué pasó en 1932?', min: '0:38', foto: ['AMA', 'Feliciano Ama, líder indígena de Izalco, hacia 1932.'], p: [
        'Primero, el café. Con él, los pueblos indígenas del occidente fueron perdiendo sus **tierras comunales**. La noche del **22 de enero de 1932**, campesinos, en su mayoría indígenas nahua-pipiles de Sonsonate y Ahuachapán, se alzaron y tomaron Izalco, Nahuizalco, Juayúa, Tacuba y otros pueblos. Con ellos estaban el Partido Comunista de Farabundo Martí y líderes indígenas como **Feliciano Ama**, de Izalco.',
        'Tres días después, el ejército ya había recuperado todos los pueblos. Gobernaba el general **Maximiliano Hernández Martínez**. Durante unas dos semanas, sus soldados fusilaron a quien pareciera indígena: por cómo vestía y por cómo hablaba. A Feliciano Ama lo ahorcaron en la plaza de Izalco el 28 de enero.',
        'En El Salvador lo llaman, simplemente, «la Matanza». Nadie sabe con exactitud cuántos murieron: **al menos diez mil**, según los historiadores Gould y Lauria-Santiago (2008); otros autores hablan de hasta treinta mil.',
      ] },
      { h: '¿Por qué se escondieron?', min: '1:45', foto: ['SIXTA1', 'Nantzin Sixta, con huipil y refajo.'], p: [
        'Guadalupe Estrada nació en Sonsonate en 1948, dieciséis años después de la Matanza. Según la ficha de su retrato (Centro Cultural de España en El Salvador), las heridas que 1932 dejó en su familia la llevaron a decir en voz alta que es indígena.',
        'Muchas familias hicieron lo contrario. Las mujeres guardaron el **refajo y el huipil**, y los padres dejaron de hablar náhuat a sus hijos. Bastó el **miedo**: hablarlo fuera de casa daba vergüenza y miedo.',
        'Anastacia López, de Santo Domingo de Guzmán, sí lo aprendió en casa; el castellano, dice, lo aprendió a los nueve años. Hoy quienes aprendieron el náhuat de niños son ya muy pocos, casi todos mayores.',
      ] },
      { h: '¿Qué ha hecho el país?', min: '2:42', foto: ['FUNES', 'Mauricio Funes, presidente de El Salvador de 2009 a 2014.'], p: [
        'El **12 de octubre de 2010**, el presidente **Mauricio Funes** pidió perdón a los pueblos indígenas por la «persecución y exterminio» que sufrieron. Fue la primera vez. Cuatro años después, la reforma del **artículo 63** de la Constitución dejó escrito: «El Salvador reconoce a los pueblos indígenas».',
        'Con Nayib Bukele en la presidencia, la Asamblea declaró en 2023, por unanimidad, el **9 de agosto** Día Nacional de los Pueblos Indígenas. En esa Asamblea sonó el himno en náhuat, cantado por los alumnos del Centro Escolar Dr. Mario Calvo Marroquín, de Izalco (10 de septiembre de 2025); al año siguiente, otra escuela, de San Juan Talpa, lo volvió a cantar allí.',
        'Y el censo de 2024 volvió a preguntar por pueblo y lengua. En 2007 se declararon indígenas **13.310** personas; en 2024, **68.148**: cinco veces más. Y **1.135** personas dicen hablar náhuat.',
        'Lo que no ha llegado: ningún presidente ha vuelto a pedir perdón desde 2010; los consejos indígenas siguen pidiendo que se esclarezca el genocidio de 1932 (Diario El Mundo); sigue sin aprobarse una ley de pueblos indígenas; y El Salvador no ha ratificado el **Convenio 169** de la OIT, que protege a estos pueblos. En julio de 2024, además, el Decreto Legislativo 33 hizo desaparecer la red de Casas de la Cultura, también las de los pueblos indígenas.',
      ] },
      { h: '¿Qué pasó con las Cunas Náhuat?', min: '4:00', foto: ['ELSA', 'Nantzin Elsa López.'], p: [
        'Las **Cunas Náhuat** son nidos de lengua: niños de **3 a 5 años** pasan el día entero en náhuat, sin una palabra de castellano. Las maestras son abuelas que lo aprendieron de niñas, las *nantzin*. La primera abrió en **2010** en Santo Domingo de Guzmán, con la Universidad Don Bosco; por ellas han pasado más de seiscientos niños.',
        'En **2023**, el Ministerio de Educación trasladó las cunas a su nuevo programa de primera infancia, Crecer Juntos, **sin consultar** a las comunidades. Ese febrero, las de Santo Domingo y Santa Catarina Masahuat no pudieron empezar las clases, y de trece maestras quedaron cinco.',
        'Las abuelas y los pueblos las volvieron a abrir, con ayuda de fuera.',
      ] },
      { h: '¿Quién les ayuda a volver?', min: '4:41', foto: ['WIKI_TALLER', 'Un taller para escribir la Wikipedia en náhuat.'], p: [
        'Los jóvenes, primero. En 2017 y 2018, el Ministerio de Cultura, con fondos de la UNESCO, formó a **25 chicos de 15 a 17 años** de Santo Domingo de Guzmán para grabar a sus mayores. Y el **21 de febrero de 2026** el náhuat estrenó su propia **Wikipedia**.',
        'En **Nahuizalco**, el pueblo que se alzó en 1932, la cuna tiene edificio nuevo desde el 28 de noviembre de 2025: diecisiete niños de lunes a viernes y clases los sábados para todas las edades. Lo pagó el **Ayuntamiento de Pamplona**, con el colectivo navarro El Salvador Elkartasuna y la Universidad Pública de Navarra.',
        '¿Por qué Pamplona? Lo explican ellos: en Navarra saben lo que es ver retroceder una lengua y recuperarla con escuelas de inmersión como esta, las ikastolas. Desde 2012, estudiantes de Magisterio de Navarra han ido a las cunas a hacer sus prácticas.',
      ] },
      { h: '¿Se puede visitar?', min: '5:28', foto: ['RUTA', 'La Ruta de las Flores, en Ataco.'], p: [
        'Sí. Izalco y Nahuizalco están en Sonsonate, en la **Ruta de las Flores**, a una o dos horas de San Salvador. En Nahuizalco hay mercado de noche y artesanía de tule; en Izalco, cada **22 de enero**, se recuerda el levantamiento.',
        'Con pasaporte español no hace falta visado para estancias turísticas de hasta 180 días; el pasaporte debe tener al menos seis meses de validez. La moneda es el dólar estadounidense y, según la ficha de Exteriores, en muchos comercios no aceptan billetes de 50 y 100 dólares.',
        'Si te cruzas con alguien que habla náhuat, ya sabes cómo saludar: *yek peyna*, buenos días.',
      ], enlaces: [['El Salvador', '/destinos/el-salvador.html']] },
      { h: '¿Y con Bukele?', min: '5:50', foto: ['BUKELE4', 'Nayib Bukele con el Tribunal Supremo Electoral.'], p: [
        'Con Bukele, el país ha contado a sus indígenas y les ha dado un día. Lo que sigue esperando tiene nombre: una palabra sobre 1932, una ley y náhuat en las escuelas de Sonsonate.',
        'El presidente que cambió El Salvador… ¿cambiará también esto? Mientras, la lengua que sonó en la Asamblea la sostienen unas abuelas. Y niños de cinco años.',
      ] },
    ],
    cierre: 'Datos de viaje a noviembre de 2026: confírmalos siempre en fuentes oficiales antes de ir.',
    nota: 'Datos revisados en noviembre de 2026. Las cifras de muertos de 1932 no coinciden entre historiadores: damos la más prudente con su fuente y el máximo que se cita. No hemos encontrado ninguna ley que prohibiera hablar náhuat: lo que está documentado es el miedo. No hay datos públicos de cuántos niños tienen hoy los nidos de Crecer Juntos ni de si enseñan náhuat.',
    fuentes: [
      W('Wikipedia: matanza de 1932 en El Salvador', 'https://en.wikipedia.org/wiki/1932_Salvadoran_peasant_massacre'),
      W('Cifras de Anderson (1982) y de Gould y Lauria-Santiago (2008), en eScholarship', 'https://escholarship.org/content/qt6910z7qv/qt6910z7qv.pdf'),
      W('Revista de Historia (Universidad Nacional de Costa Rica): «Políticas de la memoria»', 'https://www.revistas.una.ac.cr/index.php/historia/article/download/1789/1695/0'),
      W('Tico Times: el perdón de Mauricio Funes (13 oct 2010)', 'https://ticotimes.net/2010/10/13/el-salvador-s-president-apologizes-to-indigenous-peoples'),
      W('Diario El Mundo: censo 2024, la población indígena crece cinco veces', 'https://diario.elmundo.sv/nacionales/censo-2024-poblacion-indigena-crece-cinco-veces-y-destaca-el-resurgir-del-pueblo-nahua-pipil'),
      W('Diario El Mundo: idiomas que se hablan en El Salvador según el censo 2024', 'https://diario.elmundo.sv/economia/ademas-del-espanol-estos-idiomas-se-hablan-en-el-salvador-segun-censo-2024'),
      W('elsalvador.com: el himno en náhuat en la Asamblea (12 sept 2025)', 'https://www.elsalvador.com/noticias/nacional/himno-el-salvador-nahuat/1242187/2025/'),
      W('elsalvador.com: 9 de agosto, Día Nacional de los Pueblos Indígenas (2023)', 'https://www.elsalvador.com/noticias/nacional/diputados-declaran-el-9-de-agosto-como-dia-nacional-pueblos-indigenas/1081858/2023/'),
      W('Agencia Presentes: Juliana Ama y la memoria de Izalco (2022)', 'https://agenciapresentes.org/2022/01/21/juliana-ama-la-mujer-indigena-que-preserva-la-memoria-de-todo-un-pueblo-en-el-salvador'),
      W('UNESCO: jóvenes nahuas de El Salvador (2018)', 'https://ich.unesco.org/en/news/young-nahuats-from-el-salvador-contribute-to-the-safeguarding-of-their-living-heritage-00314'),
      W('Diario El Mundo: las cunas náhuat buscan renacer (26 feb 2023)', 'https://diario.elmundo.sv/nacionales/las-cunas-nahuat-buscan-renacer-en-occidente-de-el-salvador'),
      W('El Independiente: Cunas Náhuat sin apoyo del MINED (20 feb 2023)', 'https://www.elindependiente.sv/2023/02/20/programa-cunas-nahuat-sin-apoyo-del-mined/'),
      W('Jorge Lemus: «La Cuna Náhuat» (resumen, 2017)', 'https://escuelaeducadores.educacion.navarra.es/wp-content/uploads/2019/11/La-Cuna-N%C3%A1huat-Resumen.pdf'),
      W('Diario Co Latino: el edificio de la Kuna Nawat de Nahuizalco (28 nov 2025)', 'https://www.diariocolatino.com/inauguran-edificio-de-kuna-nawat-para-revitalizar-el-nahuat-pipil-en-nahuizalco/'),
      W('Ayuntamiento de Pamplona: memoria de cooperación 2022', 'https://www.pamplona.es/aytomemoria2022/areas-municipales/serviciossociales/274.html'),
      W('El Salvador Elkartasuna: Cuna Náhuat', 'https://www.elsalvadorelkartasuna.eus/zertan-ari-gara-que-hacemos/cuna-nahuat/'),
      W('Ministerio de Asuntos Exteriores de España: recomendaciones de viaje a El Salvador', 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=El%20Salvador'),
    ],
  },
  // Short 9:16 · T27 · montaje: salma marketing/pueblos/ache (v7, ULTIMA) · expediente: docs/ache-expediente.md · guion: docs/pueblos-ache-guion-direccion.md
  // YouTube _lnY6gA-40o, mar 22 dic 2026 (los shorts llevan su vídeo propio en la entrada). Límites (F4, Estrategia 19 nov): «genocidio» solo como denuncia de Münzel;
  // los ypeti NO eran el grupo más pequeño; sin cifra de población actual.
  {
    orden: 221,
    slug: 'tribus-de-paraguay-los-ache-casi-se-borran-del-mapa',
    variosPaises: true,
    fecha: '2026-12-22',
    serie: 'Pueblos borrados del mapa',
    cap: 'Paraguay',
    pais: 'Paraguay',
    titulo: 'Tribus de Paraguay: los aché casi se borran del mapa',
    resumen: 'En el bosque de Paraguay, los aché ypeti arreglaban sus conflictos con cosquillas, mientras otros grupos aché lo hacían a garrotazos. En 1959 fueron los primeros en salir del bosque. Tras el contacto, las epidemias se llevaron a más de la mitad de los aché. Hoy suben su lengua a internet.',
    video: 'pueblos-ache.mp4',
    realidad: 'Capítulo documental narrado por Salma con fotos de Wikimedia Commons y vídeos con licencia libre o de una televisión local, con su autor al final. No hemos estado allí: cada dato sale de las fuentes que citamos.',
    creditosDe: 'salma marketing/pueblos/ache',
    creditosIntro: 'Fotos de Wikimedia Commons y vídeos. Gracias a sus autores:',
    creditosExtra: [
      ['Vídeo: Carito Serafini, «Los Aché de Cerro Morotí» (IPAC, 2010)', 'CC BY', 'https://www.youtube.com/watch?v=VrKhoKqq0Hc'],
      ['Vídeo: red interior tv, Canal 16 Santa Rita, «Indígenas ACHE de Puerto Barra» (2012)', 'CC BY', 'https://www.youtube.com/watch?v=0ztV_-LzhPU'],
    ],
    fotos: { portada: 'W3', posicion: '50% 0%', galeria: [
      ['W4', 'Un túnel de árboles en la reserva de Mbaracayú.'],
      ['W1', 'El bosque Atlántico de Paraguay.'],
      ['W6', 'Un tronco en la reserva de Mbaracayú.'],
      ['W7', 'Atardecer en la reserva de Mbaracayú.'],
      ['W8', 'Nubes sobre la reserva de Mbaracayú.'],
      ['W5', 'Hongos en el bosque de Mbaracayú.'],
    ] },
    cifras: [['1959', 'Los ypeti salen del bosque'], ['40 → 30', 'Ypeti, del contacto a 1987'], ['+ de la mitad', 'De todos los aché, tras el contacto']],
    story: {
      portada: 'W3',
      slides: [
        { foto: 'W4', h: 'Paz con cosquillas', t: 'En el bosque de Paraguay, los aché ypeti arreglaban sus conflictos con cosquillas. Los demás aché lo hacían a garrotazos.', credito: ['Víctor Azcona', 'CC BY-SA 4.0'] },
        { foto: 'W1', h: 'Cómo era', t: 'Se emparejaban hombres de bandas rivales y se hacían cosquillas. Después, cantos y un juego: coger el frijol.', credito: ['Ilosuna', 'CC BY-SA 3.0'] },
        { foto: 'W7', h: '1959', t: 'Los ypeti fueron los primeros aché en salir del bosque.', credito: ['Víctor Azcona', 'CC BY-SA 4.0'] },
        { foto: 'W8', h: 'Más de la mitad', t: 'Entre todos los grupos aché, tras el contacto, más de la mitad murió en pocos años de epidemias que nunca habían conocido (Kim Hill).', credito: ['Víctor Azcona', 'CC BY-SA 4.0'] },
        { foto: 'W6', h: 'Unos cuarenta', t: 'Los ypeti eran unos cuarenta cuando salieron del bosque. En 1987 quedaban treinta.', credito: ['Víctor Azcona', 'CC BY-SA 4.0'] },
        { foto: 'W3', h: 'Hoy', t: 'Desde Kuetuvy, junto a la reserva de Mbaracayú, suben su lengua y su cultura a internet.', credito: ['Barrioflores', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'Paz con cosquillas', foto: ['W4', 'Un túnel de árboles en la reserva de Mbaracayú, en el bosque Atlántico de Paraguay.'], p: [
        'Los **aché** son un pueblo cazador y recolector del bosque del este de **Paraguay**. Su nombre quiere decir «persona». Vivían en varios grupos, y la mayoría resolvía las ofensas y las muertes con el ***tõ mumbu*** («partir cabezas»): una pelea a garrotazos entre hombres de bandas distintas.',
        'Los **ypeti** no. Según el proyecto de lenguas DOBES, del Instituto Max Planck, en sus reuniones los hombres de bandas rivales **se emparejaban y se hacían cosquillas**. Se pintaban con carbón y plumón de buitre, como los demás para la pelea, y después venían los cantos y un juego, el *proaa mata*: «coger el frijol».',
      ] },
      { h: 'Salir del bosque', foto: ['W7', 'Atardecer en la reserva de Mbaracayú.'], p: [
        'En **1959**, los ypeti fueron los primeros aché en salir del bosque y quedarse en contacto con los paraguayos. Lo que vino después lo cuenta el antropólogo **Kim Hill**, que trabajó décadas con los aché: entre todos los grupos aché, tras el contacto, **más de la mitad** murió en pocos años de epidemias que nunca habían conocido.',
        'Los ypeti eran **unos cuarenta** cuando salieron; en **1987 quedaban treinta**.',
        'En los años setenta, el antropólogo alemán **Mark Münzel** denunció lo que les pasaba a los aché como un genocidio (IWGIA, 1973). Es un término discutido, y el Gobierno de Paraguay lo negó. En 2014 se presentó una querella en Argentina; no consta sentencia.',
      ] },
      { h: 'Los aché hoy', foto: ['W3', 'Aché de Kuetuvy con el móvil, en el proyecto Ache Djawu (2014).'], p: [
        'Hoy los aché viven en comunidades del este de Paraguay. Una de ellas, **Kuetuvy**, está junto a la reserva de **Mbaracayú**. Desde allí, el proyecto **Ache Djawu** sube a internet su lengua y su cultura desde 2014.',
        'No hemos encontrado una cifra fiable de cuántos aché hay hoy en los datos abiertos del censo indígena de 2022, así que no damos ninguna.',
      ], enlaces: [['Paraguay', '/destinos/paraguay.html']] },
    ],
    cierre: 'Si visitas comunidades indígenas, hazlo con permiso y con guías de la propia comunidad: son personas, no una atracción.',
    nota: 'Datos revisados en noviembre de 2026. Lo de las cosquillas sale de DOBES (Instituto Max Planck); las cifras de los ypeti y de las epidemias, de Kim Hill. «Genocidio» es la denuncia de Münzel, un término discutido; no lo afirmamos. No damos cifra de población actual porque no hemos encontrado una fuente abierta.',
    fuentes: [
      W('DOBES (Instituto Max Planck): los aché', 'https://dobes.mpi.nl/projects/ache/people'),
      W('Kim Hill: «Ache», Encyclopedia of World Cultures', 'https://www.encyclopedia.com/humanities/encyclopedias-almanacs-transcripts-and-maps/ache'),
      W('Traditions of Conflict: «Tickle-fight Diplomacy» (2021)', 'https://traditionsofconflict.com/blog/2021/10/17/tickle-fight-diplomacy-and-other-methods-of-greeting-and-conflict-management'),
      W('Wikipedia: aché', 'https://en.wikipedia.org/wiki/Ach%C3%A9'),
      W('ABC Color: la querella de 2014 en Argentina', 'https://www.abc.com.py/edicion-impresa/internacionales/garzon-apoya-querella-por-genocidio-contra-etnia-ache-1233028.html'),
    ],
  },
];
