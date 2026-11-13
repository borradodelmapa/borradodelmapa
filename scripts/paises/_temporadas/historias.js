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
    // youtube: '_SnSzkDIkmw' SOLO cuando sea público (jue 19 nov 15:30): con youtube puesto la entrada usa ese reproductor y, privado, da error
    titulo: 'Pueblos que se están borrando del mapa: 10 culturas de Asia',
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
  // Largo 16:9 · montaje: india/motor/tatuajes-doc.cjs · minutos: tatuajes/capitulos.txt · fuentes: docs/tatuajes-documental-fuentes.md · YouTube, jue 10 dic 2026 a las 15:30 (poner c.youtube cuando sea público)
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
    titulo: 'Tatuajes por el mundo: un viaje desde Ötzi hasta la Yakuza',
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
  // Largo 16:9 · montaje: india/motor/tuvalu-preguntas.cjs (v5) · minutos: pueblos/tuvalu/capitulos.txt · guion y fuentes: docs/tuvalu-guion-direccion.md · YouTube, jue 26 nov 2026 a las 10:00 (poner youtube: 'QMWkfY186lk' SOLO cuando sea público)
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
];
