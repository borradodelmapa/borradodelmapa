// Historias del blog de filipinas (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

module.exports = [
  // ─── Pueblos borrados del mapa (P12 de docs/video-checklist.md: un vídeo = una entrada) ───
  // Ep.1 Whang-Od · guion y fuentes: docs/pueblos-ep1-whang-od-guion-direccion.md · vídeo: salma marketing/pueblos/whang-od/ULTIMA
  {
    orden: 120,
    slug: 'filipinas-whang-od-tatuadora-kalinga',
    fecha: '2026-10-31',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 1',
    pais: 'Filipinas',
    redes: { tituloYT: 'Whang-Od, la tatuadora de más de 100 años · Kalinga, Filipinas', tituloTT: 'Whang-Od: más de 100 años tatuando con una espina', hashtags: ['#filipinas', '#whangod', '#pueblosborradosdelmapa'] },
    titulo: 'Whang-Od: más de cien años tatuando con una espina',
    resumen: 'En Buscalan, en las montañas de Kalinga, la tatuadora más anciana de Filipinas sigue golpeando la piel con una espina. Su arte tiene relevo; sus cantos, no.',
    video: 'pueblos-ep1-whang-od.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final) y fuentes citadas. No es un viaje de Paco.',
    destino: ['buscalan-filipinas', 'Buscalan'],
    creditosDe: 'salma marketing/pueblos/whang-od',
    fotos: { portada: 'W39', galeria: [['W27', 'Whang-Od, con la varilla del *batok* en la mano.'], ['W24', 'Enseñando sus diseños a quien llega.'], ['W25', 'Un tatuaje recién hecho: los dibujos de siempre, en piel de visitante.'], ['W43', 'Whang-Od en Buscalan.'], ['W47', 'Las terrazas de arroz de Buscalan.'], ['W65', 'Niebla al amanecer sobre las montañas de Kalinga.']] },
    cita: { tras: 5, t: 'Cuando yo ya no esté, ellas seguirán con la firma de los tres puntos', de: 'Whang-Od' },
    cifras: [['107-109', 'Años (fecha exacta desconocida)'], ['106', 'Años en su portada de Vogue (2023)'], ['3', 'Puntos de su firma']],
    secciones: [
      { h: 'Buscalan, en Kalinga', foto: ['W84', 'Buscalan, entre terrazas de arroz en las montañas de Tinglayan.'], p: [
        'Buscalan es un pueblo del municipio de **Tinglayan**, en las montañas de la provincia de Kalinga, a unas quince horas de Manila. Allí vive **Apo Whang-Od** (Maria Oggay), del pueblo butbut, considerada la *mambabatok* —tatuadora tradicional kalinga— de más edad.',
        'Nadie sabe su edad exacta, ni ella: unas fuentes dan como fecha de nacimiento el 17 de febrero de 1917 y otras el 6 de marzo de 1919. Tiene entre 107 y 109 años.' ] },
      { h: 'Una espina, una varilla y hollín', foto: ['W11', 'Todo lo que hace falta: la varilla con la espina, el mazo de bambú y el hollín.'], p: [
        'La técnica se llama ***batok***: una espina sujeta a una varilla que se golpea con otra vara de bambú, y una tinta de hollín y agua. Golpe a golpe, sin máquinas.',
        'Hoy hace diseños sencillos: según Wikipedia, entre veinte y treinta tatuajes al día a los visitantes que suben al pueblo.' ] },
      { h: 'Antes, el tatuaje se ganaba', foto: ['W38', 'Una anciana de Tinglayan con los tatuajes tradicionales de las mujeres kalinga.'], p: [
        'Entre los kalinga, el tatuaje de los hombres marcaba el valor del guerrero; el de las mujeres, la belleza (algunas fuentes hablan también de fertilidad, pero no se ponen de acuerdo en cuánto pesaba).',
        'A principios del siglo XX, la administración estadounidense prohibió la caza de cabezas, y el tatuaje guerrero fue perdiendo su sentido. El de las mujeres siguió más tiempo.' ] },
      { h: 'La fama', foto: ['W07', 'Cada día suben visitantes a Buscalan para tatuarse.'], p: [
        'Un documental de **2009** la hizo conocida fuera de Filipinas, y desde entonces suben visitantes cada día a tatuarse con ella.',
        'En abril de **2023**, con 106 años, fue portada de **Vogue Philippines**: la persona de más edad en una portada de Vogue. El récord anterior era de Judi Dench, con 85.' ] },
      { h: 'El relevo y los tres puntos', foto: ['W94', 'Grace Palicas, su sobrina nieta y aprendiz, tatuando con el *batok*.'], p: [
        'El *batok* solo se hereda por sangre, y Whang-Od no tuvo hijos. Lo ha enseñado a su sobrina nieta, **Grace Palicas**, y a una prima de esta (su nombre se escribe de varias formas: Ilyang o Elyang Wigan).',
        'Su firma son **tres puntos**: ella y sus dos aprendices. «Cuando yo ya no esté, ellas seguirán con la firma de los tres puntos», ha dicho.' ] },
      { h: 'Lo que se está borrando: los cantos', foto: ['W64', 'Una anciana butbut de Buscalan.'], p: [
        'Antes, cada tatuaje iba acompañado de cantos, adivinación y ritual. Whang-Od ya no canta para los turistas: esos cantos son para embellecer a las mujeres kalinga y celebrar la victoria de los guerreros.',
        'En 2018, al recibir un reconocimiento de la Comisión Nacional de Cultura y Artes (NCCA), cantó una nana (*uwawi*), cantos de cortejo y de la siembra del arroz. La antropóloga **Analyn Salvador-Amores** avisa de que esos cantos y rituales no se han pasado a sus aprendices: se pueden ir con ella.' ] },
    ],
    guia: {
      json: 'guias-generadas/filipinas-21-dias-2026-10-22.json',
      url: '/filipinas-en-21-dias-manila-palawan-visayas-y-cordillera-gw2t',
      titulo: 'Kalinga y nuestra guía de Filipinas',
      intro: 'Nuestra guía **Filipinas en 21 días** sube a la cordillera por Banaue y Sagada, pero no llega a Buscalan. Si quieres incluirlo, pídele a Salma que añada Tinglayan a tu ruta.',
      dias: [],
    },
    ficha: [
      '**Guía local obligatorio** en Buscalan. La página del municipio da tarifas desde 1.000 ₱ al día para un guía con hasta cinco personas (sin fecha: confírmalo).',
      'Se llega a Tinglayan desde **Tabuk** (Kalinga) o **Bontoc** (Mountain Province); desde la carretera, **hora y media a pie** hasta el pueblo.',
      'Hay una **tasa ecocultural**; las cifras que dan las fuentes no coinciden, pregunta en la oficina de turismo de Tinglayan.',
      '**Respeto:** en septiembre de 2026 el municipio pidió respeto tras el caso de un visitante que insistió en tatuarse una zona íntima: «la cultura kalinga no es un decorado, el patrimonio no es un souvenir». Pide permiso antes de hacer fotos.',
      'Colas largas: Whang-Od tatúa pocas horas al día; las aprendices atienden a la mayoría de los visitantes.',
    ],
    nota: 'Datos de octubre de 2026; tarifas y accesos cambian, confírmalos siempre en la oficina de turismo de Tinglayan.',
    fuentes: [
      W('Wikipedia: Whang-od', 'https://en.wikipedia.org/wiki/Whang-od'),
      W('Euronews, 10 abr 2023: portada de Vogue con 106 años', 'https://www.euronews.com/2023/04/10/a-106-year-old-indigenous-filipino-tattoo-artist-becomes-vogues-oldest-ever-cover-model'),
      W('Vogue Philippines: la nueva generación de mambabatok', 'https://vogue.ph/lifestyle/inked-in-tradition-the-next-generation-of-mambabatok/'),
      W('Vera Files: el batok y su resurgir', 'https://verafiles.org/articles/batok-traditional-tattoos-a-revival-here-and-elsewhere'),
      W('SunStar Baguio: Whang-od, icono de Kalinga (2018)', 'https://www.sunstar.com.ph/baguio/local-news/whang-od-hailed-as-kalinga-icon'),
      W('Daily Tribune, 11 sep 2026: Tinglayan pide respeto', 'https://tribune.net.ph/2026/09/11/tinglayan-raises-concern-over-whang-od-intimate-tattoo-incident'),
      W('Municipio de Tinglayan: tarifas de guía', 'https://tinglayan.gov.ph/node/38'),
      W('Atlas Obscura: Fang-od Oggay', 'https://assets.atlasobscura.com/articles/fang-od-oggay-kalinga-tattoo-philippines'),
    ],
    cierre: 'Siguiente episodio: Sagada, el pueblo donde a los muertos se les cuelga.',
  },
  // Ep.2 Sagada · guion y fuentes: docs/pueblos-ep2-sagada-guion-direccion.md · vídeo: salma marketing/pueblos/sagada/ULTIMA
  {
    orden: 130,
    slug: 'filipinas-sagada-ataudes-colgantes',
    fecha: '2026-10-31',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 2',
    pais: 'Filipinas',
    redes: { tituloYT: 'Ataúdes colgantes de Sagada · Filipinas', tituloTT: 'Sagada: aquí a los muertos se les cuelga', hashtags: ['#filipinas', '#sagada', '#pueblosborradosdelmapa'] },
    titulo: 'Sagada: el pueblo donde a los muertos se les cuelga',
    resumen: 'En las montañas de Luzón, los ataúdes no se entierran: cuelgan de la roca. Por qué tan alto, quién tiene derecho a ese entierro y por qué cada vez se ven menos.',
    video: 'pueblos-ep2-sagada.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final) y fuentes citadas. No es un viaje de Paco.',
    destino: ['sagada-filipinas', 'Sagada'],
    creditosDe: 'salma marketing/pueblos/sagada',
    fotos: { portada: 'W09', galeria: [['W07', 'Ataúdes vistos desde abajo, contra la luz.'], ['W16', 'Una pared entera de ataúdes en el Valle del Eco.'], ['W19', 'Los más antiguos, gastados por la lluvia.'], ['W20', 'Algunos ataúdes se han abierto con los años.'], ['W23', 'Dentro de la cueva de Lumiang.'], ['W22', 'Casas de Sagada junto al Valle del Eco.']] },
    cita: { tras: 3, t: 'Se iba del mundo como había llegado' },
    cifras: [['1.500 m', 'Altitud de Sagada'], ['~400 km', 'Desde Manila'], ['+10.000', 'Habitantes']],
    secciones: [
      { h: 'Un pueblo en la cordillera', foto: ['W42', 'Sagada, entre pinos y montañas, a unos 1.500 metros.'], p: [
        'Sagada está en la **Mountain Province**, en la cordillera del norte de Luzón, a unos **1.500 metros** de altura y a unos 400 kilómetros de Manila. Tiene algo más de diez mil habitantes y, según su alcalde, es el pueblo que más turistas recibe del norte de Filipinas.' ] },
      { h: 'Ataúdes en la pared', foto: ['W02', 'Ataúdes colgados de la roca en el Valle del Eco.'], p: [
        'En el **Valle del Eco**, los ataúdes cuelgan de la pared de piedra, sujetos con vigas clavadas a la roca. Muchos llevan el nombre del difunto pintado en un lado.',
        'Según la tradición, cuanto más arriba, más cerca de los espíritus de los antepasados. Hay quien añade una razón práctica: así quedaban lejos de los animales y de las riadas.' ] },
      { h: 'El ritual', foto: ['W08', 'Sillas de madera junto a los ataúdes, como las que se usaban para velar al difunto.'], p: [
        'Antes, al difunto lo sentaban en una silla de madera, la **sangadil**, atado con ratán, y lo velaban varios días mientras se ahumaba el cuerpo. En el Valle del Eco todavía se ven sillas colgadas junto a los ataúdes.',
        'Después lo encogían para meterlo en el ataúd, con las piernas hacia el pecho: **se iba del mundo como había llegado**. Por eso hay ataúdes tan cortos, y no son de niños. Los más recientes son más largos, porque las familias ya no quieren romper huesos para encajar el cuerpo.' ] },
      { h: 'No vale cualquiera', foto: ['W12', 'Muchos ataúdes llevan pintado el nombre del difunto.'], p: [
        'Este entierro es para ancianos respetados: casados, con nietos y que hayan servido a su comunidad. Muchos tallaban su propio ataúd en un tronco y pintaban su nombre; si ya no tenían fuerzas, lo hacía la familia.' ] },
      { h: 'Lo más común, las cuevas', foto: ['W21', 'Ataúdes amontonados a la entrada de la cueva de Lumiang.'], p: [
        'Aunque son la imagen más conocida, colgar los ataúdes nunca fue lo más habitual entre los kankanaey. Lo común era **meterlos o apilarlos dentro de cuevas de caliza**, como en la cueva de **Lumiang**, donde se amontonan a la entrada.' ] },
      { h: 'Lo que se está borrando', foto: ['W13', 'Cada vez se cuelgan menos ataúdes en la roca.'], p: [
        'Cada vez se cuelgan menos ataúdes: hoy la mayoría de las familias elige el cementerio. Las fuentes no se ponen de acuerdo sobre cuándo fue el último entierro en la roca, así que no damos fecha.',
        'Tampoco repetimos la cifra de «2.000 años» que circula por internet: no hemos encontrado una fuente sólida que la respalde.' ] },
    ],
    guia: {
      json: 'guias-generadas/filipinas-21-dias-2026-10-22.json',
      url: '/filipinas-en-21-dias-manila-palawan-visayas-y-cordillera-gw2t',
      titulo: 'Sagada en nuestra guía de Filipinas',
      intro: 'Nuestra guía **Filipinas en 21 días** sube a la cordillera: un día en las terrazas de Banaue y dos en Sagada.',
      dias: [18, 19, 20],
    },
    ficha: [
      '**Registro obligatorio** en la oficina de turismo al llegar; se paga una tasa que incluye el fondo ambiental (entre 50 y 100 ₱ según la fuente).',
      '**Guía local** para bajar al Valle del Eco; se contrata en la misma oficina.',
      'Las cuevas de **Lumiang y Sumaguing**, solo hasta la entrada desde julio de 2025 por las lluvias. La cascada **Bomod-ok**, cerrada por *ubaya*, un cierre tradicional del pueblo.',
      '**Respeto:** no tocar los ataúdes ni subirse a ellos, y fotos solo donde lo permita el guía.',
      'Llegada: unas 2 horas en jeepney o furgoneta desde Banaue; bus nocturno desde Manila (10-12 h).',
    ],
    nota: 'Datos de octubre de 2026; tasas y accesos cambian, confírmalos siempre en la oficina de turismo de Sagada.',
    fuentes: [
      W('CNA (Agencia Central de Noticias de Taiwán), 9 mar 2026', 'https://www.cna.com.tw/news/aopl/202603090027.aspx'),
      W('Rough Guides: The hanging coffins of Sagada', 'https://www.roughguides.com/article/hanging-coffins/'),
      W('NAFD: Buried in a hanging coffin (sep 2022)', 'https://www.nafd.org.uk/wp-content/uploads/2022/10/Buried-in-a-hanging-coffin-Sept-2022.pdf'),
      W('Wikipedia: Hanging coffins', 'https://en.wikipedia.org/wiki/Hanging_coffins'),
      W('Daily Tribune: Sagada reopens key tourist spots (jul 2025)', 'https://tribune.net.ph/2025/07/20/sagada-reopens-key-tourist-spots'),
      W('PTV: Sagada braces for tourists influx', 'https://ptvnews.ph/sagada-braces-for-tourists-influx-issues-guidelines/'),
    ],
    cierre: 'Próximo episodio: las haenyeo de Jeju, las abuelas que bucean sin botella.',
  },
  // ─── BLOQUE FILIPINAS (L2, 4 nov 2026, chat 2): publicadas en la web el 5 nov 2026 (Paco: «hay que subirlas»); en YouTube/TikTok, cuando Paco decida ───
  // Los ifugao · guion: docs/pueblos-ep-ifugao-guion-direccion.md · vídeo: salma marketing/pueblos/ifugao/ULTIMA
  {
    orden: 220,
    slug: 'filipinas-ifugao-terrazas-de-arroz-batad',
    fecha: '2026-11-05',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 11',
    pais: 'Filipinas',
    redes: { tituloYT: 'Terrazas de arroz de Batad: los ifugao · Filipinas', tituloTT: 'Ifugao: las terrazas que un tifón partió en una noche', hashtags: ['#filipinas', '#ifugao', '#pueblosborradosdelmapa'], archivo: 'terrazas-de-arroz-batad-ifugao-filipinas.mp4' },
    titulo: 'Los ifugao y las terrazas de arroz de Batad',
    resumen: 'Terrazas cultivadas a mano en la cordillera de Luzón, un debate sobre su edad y un corrimiento en noviembre de 2025. Qué se está perdiendo y cómo visitarlas con respeto.',
    video: 'pueblos-t2-ifugao.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final) y fuentes citadas. No es un viaje de Paco.',
    destino: ['batad-filipinas', 'Batad'],
    creditosDe: 'salma marketing/pueblos/ifugao',
    fotos: { portada: 'W135', galeria: [['W79', 'Batad desde el aire.'], ['W131', 'Siembra en grupo en las terrazas de Batad.'], ['W166', 'Bulul sentado, guardián del arroz (Museo de Arte de Honolulu).'], ['W140', 'Terrazas de Batad en una foto antigua.'], ['W147', 'Un agricultor con su carabao en el arrozal.'], ['W100', 'Muros de piedra de las terrazas.']] },
    cita: { tras: 3, t: 'Un tifón se llevó un trozo en una noche' },
    cifras: [['1995', 'Patrimonio de la Humanidad'], ['11 años', 'En la lista de peligro'], ['150', 'Agricultores afectados en 2025']],
    secciones: [
      { h: 'Terrazas en la cordillera', foto: ['W85', 'El anfiteatro de terrazas de Batad.'], p: [
        'Las terrazas de arroz de la Cordillera son **Patrimonio de la Humanidad desde 1995**. La UNESCO inscribió cinco conjuntos: **Batad, Bangaan, Hungduan, Mayoyao y Nagacadan**. Suben por la montaña a unos 1.500 metros.' ] },
      { h: 'El bosque de arriba y el bulul', foto: ['W93', 'Bosque sobre las terrazas: de ahí baja el agua.'], p: [
        'Encima de las terrazas está el **muyong**, el bosque comunal que hace de cuenca: de ahí baja el agua que las riega.',
        'En los graneros se guardaba un **bulul**, una figura tallada en madera de narra que protegía el arroz.',
        'Para sembrar y cosechar se cantaban los ***hudhud***: más de doscientos cantos, que la UNESCO proclamó Obra Maestra en 2001. Los cantan sobre todo mujeres mayores.' ] },
      { h: '¿Dos mil años o cuatrocientos?', foto: ['W140', 'Terrazas de Batad en una foto antigua.'], p: [
        'La UNESCO habla de un paisaje de «dos milenios». El arqueólogo **Stephen Acabado** (UCLA) excavó en Ifugao, con dataciones de carbono 14, y concluyó que el cultivo en terrazas es **reciente**: una respuesta de los pueblos de montaña a la llegada de los españoles, que nunca llegaron a controlar del todo la Cordillera. Es un **debate abierto**.' ] },
      { h: 'Lo que se está borrando', foto: ['W127', 'Bancales con maleza.'], p: [
        'Las terrazas estuvieron **de 2001 a 2012 en la lista de patrimonio en peligro**: los jóvenes emigran, y la erosión y el turismo sin control hacen el resto.',
        'En **noviembre de 2025**, el supertifón Uwan (Fung-wong) provocó un corrimiento en Batad: **dos muertos**, un canal de siglos destruido, más de dos hectáreas de arrozal dañadas y unos **150 agricultores** afectados. Los muros los siguen reparando los vecinos, a mano.' ] },
    ],
    guia: {
      json: 'guias-generadas/luzon-norte-4-dias-2026-11-04-c.json',
      url: '/luzon-norte-en-4-dias-banaue-batad-sagada-y-buscalan-brjk',
      titulo: 'Batad en nuestra guía de Luzón norte',
      intro: 'Nuestra guía **Luzón norte en 4 días** dedica los dos primeros días a Banaue y Batad.',
      dias: [1, 2],
    },
    ficha: [
      '**Pregunta en la oficina de turismo de Banaue** cómo está el sendero de Batad tras el corrimiento de noviembre de 2025.',
      '**Respeto:** no pises los muros ni uses las plantas de arroz como bastón (lo piden los carteles del propio Batad); paga la tasa que cobra la comunidad.',
    ],
    nota: 'Datos de noviembre de 2026; accesos y tasas cambian, confírmalos siempre en la oficina de turismo de Banaue.',
    fuentes: [
      W('UNESCO: Rice Terraces of the Philippine Cordilleras', 'https://whc.unesco.org/en/list/722'),
      W('UNESCO, 2012: salen de la lista en peligro', 'https://whc.unesco.org/en/news/891'),
      W('UNESCO: Hudhud chants of the Ifugao', 'https://ich.unesco.org/en/RL/hudhud-chants-of-the-ifugao-00015'),
      W('Acabado et al., Journal of Field Archaeology, 2019', 'https://digitalscholarship.unlv.edu/anthro_fac_articles/501'),
      W('Inquirer: On the edge, saving Ifugao rice terraces', 'https://newsinfo.inquirer.net/1204273/on-the-edge-saving-ifugao-rice-terraces'),
      W('The Met: Bulul (male rice deity figure)', 'https://www.metmuseum.org/art/collection/search/626371'),
      W('Philstar, 27 jun 2026: Batad tras el tifón', 'https://www.philstar.com/music/2026/06/27/2538081/president-marcos-urged-save-disaster-hit-batad-rice-terraces'),
      W('Al Jazeera, 27 jul 2026: el clima y las terrazas', 'https://www.aljazeera.com/features/2026/7/27/climate-change-presents-new-threat-to-philippines-unesco-rice-terraces'),
    ],
    cierre: 'Sigue con la introducción del país: Filipinas, antes de viajar.',
  },
  // Filipinas, antes de viajar (pieza #3; texto: docs/paises/filipinas-articulo-borrador.md, del expediente aprobado). Vídeo de apertura: salma marketing/filipinas/apertura/ULTIMA (se añade c.video cuando se publique)
  {
    orden: 230,
    slug: 'filipinas-historia-culturas-antes-de-viajar',
    fecha: '2026-11-05',
    serie: 'Conoce cada país',
    cap: 'Filipinas',
    pais: 'Filipinas',
    titulo: 'Filipinas: historia, culturas y volcanes antes de viajar',
    resumen: '7.641 islas, una especie humana propia y unas montañas que España nunca conquistó. Lo que conviene saber de Filipinas antes de ir.',
    video: 'filipinas-apertura.mp4', // vídeo de apertura 16:9 (borrador aprobado para la web por Paco, 5 nov 2026; se cambia por la exportación final)
    realidad: 'Lo cuenta Salma con fuentes citadas y fotos de Wikimedia Commons (autores al final). No es un viaje de Paco.',
    destino: ['filipinas', 'Filipinas'],
    creditosDe: 'salma marketing/filipinas/apertura',
    fotos: { portada: 'W75', galeria: [['W35', 'La bahía de El Nido (Palawan).'], ['W168', 'El volcán Mayon.'], ['W187', 'La cueva de Callao (Cagayán).'], ['W268', 'La lámina de cobre de Laguna, del año 900.'], ['W332', 'Un galeón, en un grabado de 1734.'], ['W228', 'Un ayta en su tierra ancestral (Bataan).']] },
    cita: { tras: 4, t: 'En esas montañas la colonia no entró del todo' },
    cifras: [['7.641', 'Islas'], ['24', 'Volcanes activos'], ['~175', 'Lenguas indígenas']],
    secciones: [
      { h: 'Islas, volcanes y tifones', foto: ['W35', 'La bahía de El Nido (Palawan).'], p: [
        'La agencia cartográfica filipina (NAMRIA) cuenta **7.641 islas**; durante décadas la cifra oficial fue 7.107. Solo unas **2.000 están habitadas** y más de 5.000 ni siquiera tienen nombre oficial. Se agrupan en tres: **Luzón**, las **Visayas** y **Mindanao**.',
        'Todo el archipiélago está en el **Cinturón de Fuego del Pacífico**: el instituto de vulcanología (PHIVOLCS) contaba **24 volcanes activos** en enero de 2020; otras bases de datos dan más, según qué se llame «activo».',
        'Entran de media **unos 20 tifones al año** en la zona que vigila el servicio meteorológico (PAGASA) y **8 o 9 cruzan el país**, más que en ningún otro lugar. La temporada fuerte va **de julio a octubre**.',
        'En el norte de Luzón, la **Cordillera Central** es la región menos poblada: **1,81 millones** de habitantes de los **112,7 millones** del censo de 2024. Retén este dato: es la clave del resto.' ] },
      { h: 'Los primeros filipinos', foto: ['W187', 'La cueva de Callao (Cagayán).'], p: [
        'En 2019, *Nature* describió una especie humana nueva a partir de huesos y dientes de la **cueva de Callao**: ***Homo luzonensis***, con al menos **50.000 años**. Aún no se sabe dónde encaja en el árbol humano.',
        'Los **ayta** descienden de los primeros cazadores. Un estudio genético de 2021 encontró que los ayta magbukon tienen el **mayor porcentaje de ADN denisovano del mundo**.',
        'Hace unos **4.000 años** llegaron desde Taiwán agricultores **austronesios**. De ellos vienen casi todas las lenguas de Filipinas, de la familia que va de Madagascar a Hawái.' ] },
      { h: 'Antes de la colonia', foto: ['W268', 'La lámina de cobre de Laguna, del año 900.'], p: [
        'El documento escrito más antiguo del país es del **año 900**: la **lámina de cobre de Laguna**, en malayo antiguo, que **perdona una deuda** a un tal Namwaran y a su familia. Está en el Museo Nacional, en Manila.',
        'Siguen vivas escrituras propias, como las de los **mangyan** de Mindoro, el primer patrimonio documental filipino en la **Memoria del Mundo** de la UNESCO. Y en la Cordillera, los ifugao cantan los ***hudhud***, que la UNESCO proclamó Obra Maestra en 2001.' ] },
      { h: 'La colonia y la montaña que no se rindió', foto: ['W332', 'Un galeón, en un grabado de 1734.'], p: [
        'En **1521** Magallanes llegó al archipiélago. En **1565** Legazpi fundó en Cebú el primer asentamiento español, y empezó el **galeón de Manila**: 250 años de ruta con Acapulco, que abrió el fraile **Andrés de Urdaneta** al encontrar la vuelta por el Pacífico.',
        'Pero España **nunca llegó a controlar del todo el interior de la Cordillera**: tuvo que aceptar la independencia de los pueblos *igorot*, que guardaban las minas de oro que quería.',
        '**El debate de las terrazas:** la UNESCO habla de «dos milenios»; las excavaciones del arqueólogo **Stephen Acabado** apuntan a que el cultivo en terrazas es **reciente**, una respuesta a la llegada de los españoles. Es un debate abierto.' ] },
      { h: 'Siglo XX: Estados Unidos, la independencia y el río Chico', foto: ['W366', 'La iglesia de Santa María la Virgen de Sagada, en 1923.'], p: [
        'En **1898**, por el Tratado de París, España cedió Filipinas a Estados Unidos, que la gobernó **hasta 1946**. En **1904** llegó a Sagada la misión episcopaliana del reverendo John Staunton. Ese mismo año, en la **Feria Mundial de San Luis**, más de **1.000 filipinos de al menos 10 pueblos** fueron expuestos al público, y los folletos llamaban «bárbaros» a los igorot.',
        'Filipinas se independizó el **4 de julio de 1946**. En los años setenta, la dictadura de Marcos quiso hacer **cuatro presas en el río Chico** que anegaban tierras y cementerios kalinga y bontoc. El jefe kalinga **Macli-ing Dulag** encabezó la resistencia y fue asesinado por soldados el **24 de abril de 1980** en Tinglayan. El proyecto se abandonó.',
        'En **1997**, la ley de Derechos de los Pueblos Indígenas reconoció los **dominios ancestrales**.' ] },
      { h: 'Las culturas de hoy y lo que se está borrando', foto: ['W285', 'Un hombre mangyan en Mindoro.'], p: [
        'Se hablan **unas 175 lenguas indígenas**; las oficiales son el filipino y el inglés. En la Cordillera conviven los **ifugao** (terrazas y *hudhud*), los **kalinga** (el tatuaje *batok* de Whang-Od) y los **bontoc y kankanaey** (los ataúdes colgantes de Sagada).',
        'Los *hudhud* se quedan sin uso con la cosecha a máquina; las terrazas se abandonan porque los jóvenes emigran (estuvieron de 2001 a 2012 en la lista de peligro); el *batok* se vuelve recuerdo de viaje, y en septiembre de 2026 Tinglayan tuvo que pedir respeto; las escrituras mangyan las aprenden cada vez menos jóvenes.',
        '**Cómo visitar con respeto:** guía local, pagar las tasas del municipio, preguntar antes de fotografiar a nadie, no entrar en enterramientos ni tocar ataúdes, y no regatear un tatuaje como si fuera un souvenir.' ] },
    ],
    guia: {
      json: 'guias-generadas/luzon-norte-4-dias-2026-11-04-c.json',
      url: '/luzon-norte-en-4-dias-banaue-batad-sagada-y-buscalan-brjk',
      titulo: 'La Cordillera en nuestra guía',
      intro: 'Nuestra guía **Luzón norte en 4 días** recorre Banaue, Batad, Sagada y Buscalan.',
      dias: [1, 2, 3, 4],
    },
    ficha: [
      '**Visado (pasaporte español):** no hace falta para turismo de **30 días o menos**, con billete de salida y **pasaporte con 6 meses de validez**; decide el agente de inmigración.',
      '**eTravel:** registro **gratis** y obligatorio en **etravel.gov.ph**, la única web oficial, en las **72 horas antes de llegar**. Las webs que cobran no son oficiales.',
      '**Cuándo ir:** mejor evitar **julio-octubre** (tifones).',
      '**Cordillera:** en Buscalan, guía local obligatorio y tasa ecocultural; en Sagada, registro y tasa en la oficina de turismo y guía para el Valle del Eco.',
    ],
    nota: 'Datos a 4 de noviembre de 2026; confírmalos siempre en fuentes oficiales (embajada, eTravel, oficinas de turismo).',
    fuentes: [
      W('NAMRIA vía Wikipedia: List of islands of the Philippines', 'https://en.wikipedia.org/wiki/List_of_islands_of_the_Philippines'),
      W('Philstar, 14 ene 2020: volcanes activos (PHIVOLCS)', 'https://www.philstar.com/headlines/2020/01/14/1984829/list-active-volcanoes-philippines'),
      W('PAGASA: Tropical Cyclone Information', 'https://www.pagasa.dost.gov.ph/climate/tropical-cyclone-information'),
      W('Philstar, 18 jul 2025: censo 2024 (PSA)', 'https://www.philstar.com/headlines/2025/07/18/2458844/philippines-population-reached-1127-million-2024-psa'),
      W('CNRS, 2019: Homo luzonensis', 'https://www.cnrs.fr/en/press/homo-luzonensis-new-human-species-contemporaneous-homo-sapiens-discovered-philippines'),
      W('Larena et al., Current Biology, 2021', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8596304'),
      W('Hung, Bellwood et al., Antiquity, 2022', 'https://www.cambridge.org/core/services/aop-cambridge-core/content/view/018B349F98B18C1668C944B0B287A678/S0003598X22000655a.pdf'),
      W('Wikipedia: Laguna Copperplate Inscription', 'https://en.wikipedia.org/wiki/Laguna_Copperplate_Inscription'),
      W('Wikipedia: Philippine scripts', 'https://en.wikipedia.org/wiki/Philippine_scripts'),
      W('UNESCO: Hudhud chants of the Ifugao', 'https://ich.unesco.org/en/RL/hudhud-chants-of-the-ifugao-00015'),
      W('Britannica: Philippines, the Spanish period', 'https://www.britannica.com/place/Philippines/The-Spanish-period'),
      W('Wikipedia: Igorot revolt', 'https://en.wikipedia.org/wiki/Igorot_revolt'),
      W('Acabado et al., Journal of Field Archaeology, 2019', 'https://digitalscholarship.unlv.edu/anthro_fac_articles/501'),
      W('UNESCO: Rice Terraces of the Philippine Cordilleras', 'https://whc.unesco.org/en/list/722'),
      W('NPR, 2004: Living Exhibits at 1904 World’s Fair Revisited', 'https://www.npr.org/2004/05/31/1909651/living-exhibits-at-1904-worlds-fair-revisited'),
      W('Bantayog ng mga Bayani: Macli-ing Dulag', 'https://bantayogngmgabayani.org/bayani/macli-ing/'),
      W('RA 8371 (texto)', 'https://www.icnl.org/wp-content/uploads/Indig8371.pdf'),
      W('Inquirer: 181 languages (Ethnologue)', 'https://opinion.inquirer.net/59901/181-languages'),
      W('Embajada de Filipinas en Madrid: visados', 'https://www.philembassymadrid.com/visa-information'),
      W('eTravel: preguntas frecuentes', 'https://www.etravel.gov.ph/frequently-asked-questions'),
      W('Límites de placas del mapa: Bird (2003), PB2002, en GeoJSON de H. Ahlenius / Nordpil (ODC-By 1.0)', 'https://github.com/fraxen/tectonicplates'),
    ],
    cierre: 'Sigue con los pueblos de la Cordillera: Whang-Od, Sagada y los ifugao.',
  },
  // Guía «Luzón norte en 4 días» (borrador del chat 1: docs/paises/filipinas-blog-luzon-norte.md; texto solo del expediente aprobado)
  {
    orden: 240,
    slug: 'filipinas-luzon-norte-4-dias-cordillera',
    fecha: '2026-11-05',
    serie: 'Guías',
    cap: 'Guía',
    pais: 'Filipinas',
    titulo: 'Luzón norte en 4 días: la Cordillera que España no conquistó',
    resumen: 'Banaue, Batad, Sagada y Buscalan en 4 días: la ruta por la Cordillera filipina y la historia de por qué allí sobrevivieron sus culturas.',
    realidad: 'Guía hecha con la app; lo cuenta Salma con fuentes citadas. No es un viaje de Paco.',
    destino: ['filipinas', 'Filipinas'],
    creditosDe: 'salma marketing/pueblos/ifugao',
    fotos: { portada: 'W85', galeria: [['W79', 'Batad desde el aire.'], ['W67', 'El pueblo de Batad entre terrazas.'], ['W131', 'Siembra en Batad.'], ['W147', 'Agricultor con su carabao.'], ['W94', 'El sendero de Batad.'], ['W166', 'Bulul, guardián del arroz.']] },
    cifras: [['4', 'Días'], ['1995', 'Terrazas, Patrimonio'], ['+300 años', 'De colonia sin conquistar la Cordillera']],
    secciones: [
      { h: 'Una cordillera que no se rindió', foto: ['W86', 'Montañas de la Cordillera.'], p: [
        'España gobernó Filipinas más de 300 años, pero nunca llegó a controlar del todo el interior de la Cordillera de Luzón. Sus pueblos guardaron su independencia y las minas de oro que España quería. Por eso allí siguen vivos el tatuaje *batok*, los ataúdes colgantes y las terrazas de arroz con sus cantos.' ] },
      { h: 'Días 1 y 2: Banaue y Batad, las terrazas', foto: ['W85', 'El anfiteatro de Batad.'], p: [
        'Las terrazas de arroz de la Cordillera son **Patrimonio de la Humanidad desde 1995** y estuvieron **de 2001 a 2012** en la lista de patrimonio en peligro. Su edad está en debate: la UNESCO habla de dos milenios; las excavaciones de **Stephen Acabado** apuntan a que el cultivo en terrazas es reciente, una respuesta a la llegada de los españoles.',
        'Los ifugao cantan el ***hudhud***, más de doscientos cantos para la siembra, la cosecha y los funerales; los cantan sobre todo mujeres mayores. Lo contamos en «Los ifugao y las terrazas de arroz de Batad».' ] },
      { h: 'Día 3: Sagada', foto: ['W92', 'Montañas de la Cordillera.'], p: [
        'Ataúdes colgados en el acantilado del Valle del Eco (lo contamos en «Sagada: el pueblo donde a los muertos se les cuelga»). Registro y tasa en la oficina de turismo y guía local para bajar al valle; la cueva de Sumaguing, desde julio de 2025, solo hasta la entrada. En 1904 llegó la misión episcopaliana del reverendo John Staunton, con la iglesia de Santa María la Virgen y su escuela.' ] },
      { h: 'Día 4: Buscalan y Whang-Od', foto: ['W122', 'Trabajo en el arrozal.'], p: [
        'El pueblo kalinga de **Whang-Od**, la *mambabatok* más conocida de Filipinas; hoy tatúan sobre todo sus aprendices (lo contamos en su entrada). Guía local obligatorio y tasa ecocultural. En 1980, en Bugnay, también en Tinglayan, el jefe kalinga **Macli-ing Dulag** fue asesinado por oponerse a las presas del río Chico; el proyecto se abandonó.' ] },
    ],
    guia: {
      json: 'guias-generadas/luzon-norte-4-dias-2026-11-04-c.json',
      url: '/luzon-norte-en-4-dias-banaue-batad-sagada-y-buscalan-brjk',
      titulo: 'Luzón norte en 4 días',
      intro: 'La guía completa, día a día, con todas sus paradas.',
      dias: [1, 2, 3, 4],
    },
    ficha: [
      '**Respeto:** pide permiso antes de fotografiar a nadie, no toques ni te subas a los ataúdes, el tatuaje no es un souvenir (Tinglayan lo pidió en septiembre de 2026) y paga guías y tasas locales: el dinero se queda en el pueblo.',
      '**Antes de ir (a 4 nov 2026):** sin visado para turismo de 30 días o menos con pasaporte español; eTravel gratis en etravel.gov.ph, 72 h antes; mejor evitar julio-octubre por los tifones.',
    ],
    nota: 'Datos a 4 de noviembre de 2026; confírmalos siempre en fuentes oficiales.',
    fuentes: [
      W('Wikipedia: Igorot revolt', 'https://en.wikipedia.org/wiki/Igorot_revolt'),
      W('UNESCO: Rice Terraces of the Philippine Cordilleras', 'https://whc.unesco.org/en/list/722'),
      W('UNESCO, 2012: salen de la lista en peligro', 'https://whc.unesco.org/en/news/891'),
      W('Acabado et al., Journal of Field Archaeology, 2019', 'https://digitalscholarship.unlv.edu/anthro_fac_articles/501'),
      W('UNESCO: Hudhud chants of the Ifugao', 'https://ich.unesco.org/en/RL/hudhud-chants-of-the-ifugao-00015'),
      W('Episcopal Church in the Philippines: fechas', 'https://ecphilippines.org/special-dates-in-ecp-church-history/'),
      W('Daily Tribune, jul 2025: Sagada reabre', 'https://tribune.net.ph/2025/07/20/sagada-reopens-key-tourist-spots'),
      W('Municipio de Tinglayan: tarifas de guía', 'https://tinglayan.gov.ph/node/38'),
      W('Daily Tribune, 11 sep 2026: Tinglayan pide respeto', 'https://tribune.net.ph/2026/09/11/tinglayan-raises-concern-over-whang-od-intimate-tattoo-incident'),
      W('Bantayog ng mga Bayani: Macli-ing Dulag', 'https://bantayogngmgabayani.org/bayani/macli-ing/'),
      W('Embajada de Filipinas en Madrid: visados', 'https://www.philembassymadrid.com/visa-information'),
      W('eTravel: preguntas frecuentes', 'https://www.etravel.gov.ph/frequently-asked-questions'),
    ],
    cierre: 'Antes de ir, lee la introducción: Filipinas, antes de viajar.',
  },
];
