// Historias del blog de japon (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

module.exports = [
  // Ep.7 Los ainu · guion y fuentes: docs/pueblos-ep7-ainu-guion-direccion.md · vídeo: salma marketing/pueblos/ainu/ULTIMA
  // Sin destino: no hay página de Japón en destinos/ (el generador quita el «Más sobre…»).
  {
    orden: 180,
    slug: 'japon-ainu-hokkaido-tatuaje-prohibido',
    fecha: '2026-11-02',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 7',
    pais: 'Japón',
    redes: { tituloYT: 'Los ainu: el tatuaje que Japón prohibió · Hokkaido', tituloTT: 'Ainu: el pueblo indígena de Japón', hashtags: ['#ainu', '#hokkaido', '#pueblosborradosdelmapa'] },
    titulo: 'Los ainu: el tatuaje que Japón prohibió',
    resumen: 'Las niñas ainu se tatuaban la boca desde pequeñas hasta que Japón lo prohibió en 1871. Después les quitaron la caza, la pesca y el idioma, que hoy tiene como mucho dos hablantes nativos. Japón no los reconoció como pueblo indígena hasta 2019.',
    video: 'pueblos-ep7-ainu.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons, casi todas antiguas y de dominio público (autores al final), y fuentes citadas. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/ainu',
    fotos: { portada: 'W4', galeria: [['W5', 'Mujer ainu con el tatuaje de la boca (colección Bälz).'], ['W11', 'Mujer de Shiraoi con el traje de fiesta.'], ['W13', 'Una familia ainu ante su casa.'], ['W22', 'Un anciano ainu hacia 1930.'], ['W25', 'Casa ainu de Hokkaido en 1912.'], ['W37', 'El lago Poroto desde el Museo Nacional Ainu.']] },
    cifras: [['1871', 'Prohibición del tatuaje'], ['2', 'Hablantes nativos del ainu (2025)'], ['2019', 'Reconocidos como pueblo indígena']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'W5',
      slides: [
        { foto: 'W5', h: 'El tatuaje que Japón prohibió', t: 'Las niñas ainu se tatuaban la boca desde pequeñas. En 1871, Japón lo prohibió.', credito: ['anónimo', 'Public domain'] },
        { foto: 'W12', h: 'El pueblo del norte', t: 'Los ainu son el pueblo indígena de Hokkaido. Antes vivían también en Sajalín, las Kuriles y el norte de Honshu.', credito: ['Museo Nacional de Dinamarca', 'No restrictions'] },
        { foto: 'W7', h: 'El tatuaje de la boca', t: 'Empezaba entre los 10 y los 13 años. Marcaba el paso a mujer y protegía de los malos espíritus.', credito: ['Tamoto Kenzō', 'Public domain'] },
        { foto: 'W30', h: 'Antiguos aborígenes', t: 'Así los llamó una ley de 1899. En la práctica les negó la caza, la recolección y su lengua.', credito: ['Sapporo Ward', 'Public domain'] },
        { foto: 'W10', h: 'Una lengua casi muda', t: 'Al ainu le quedan, como mucho, dos hablantes nativos. Cada vez más gente lo aprende de adulta.', credito: ['autor desconocido', 'Public domain'] },
        { foto: 'W29', h: 'Reconocidos en 2019', t: 'Fue la primera vez que una ley nacional de Japón los reconocía como pueblo indígena.', credito: ['munechika tanaka', 'CC BY 2.0'] },
        { foto: 'W39', h: 'Visitar Upopoy', t: 'El Museo Nacional Ainu, en Shiraoi, a una hora de Sapporo. Pregunta antes de fotografiar a nadie en las danzas.', credito: ['掬茶', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'El pueblo del norte', foto: ['W12', 'Un hombre ainu de Shiraoi.'], p: [
        'Los **ainu** son el pueblo indígena de **Hokkaido**, la isla más al norte de Japón. Antes vivían también en Sajalín, en las Kuriles y en el norte de Honshu.',
        'En la encuesta oficial de Hokkaido de 2023 respondieron 11.450 personas, pero la cifra real es mayor: muchos descendientes no saben que lo son o no lo dicen. En Rusia quedan unos 300 (censo de 2021).' ] },
      { h: 'El tatuaje de la boca', foto: ['W7', 'Dos mujeres ainu tatuadas, fotografiadas por Tamoto Kenzō.'], p: [
        'Las niñas ainu empezaban a tatuarse alrededor de la boca entre los 10 y los 13 años, a veces antes. Era la marca de que se hacían mujeres y una protección contra los malos espíritus.',
        'En **1871**, el Gobierno japonés lo prohibió por «demasiado cruel». Muchas siguieron tatuándose a escondidas: creían que sin el tatuaje no podrían casarse ni llegar al otro mundo. Según las fuentes divulgativas, la última mujer con el tatuaje completo murió en **1998**.' ] },
      { h: 'Antiguos aborígenes', foto: ['W30', 'Alumnos ainu en una escuela de Tokio.'], p: [
        'En **1899**, la Ley de Protección de los Antiguos Aborígenes de Hokkaido los llamó así, «antiguos aborígenes», con la idea de integrarlos del todo. En la práctica les negó la caza, la recolección y su lengua, y los empujó a vivir como japoneses.' ] },
      { h: 'Una lengua casi muda', foto: ['W10', 'La poeta ainu Imekanu con el lingüista Kindaichi Kyōsuke.'], p: [
        'Hoy al ainu le quedan, como mucho, **dos hablantes nativos** (Endangered Languages Project, 2025). En la encuesta de Hokkaido de 2023, solo el 0,8 % de los ainu que respondieron podía mantener una conversación.',
        'Shigeru Kayano, el primer diputado ainu, abrió una escuela de lengua en 1987, y desde 2001 la radio FM Pipaushi emite clases. Hay cada vez más «neohablantes», gente que la aprende de adulta.' ] },
      { h: 'Reconocidos, por fin', foto: ['W29', 'Una boda ainu de hoy.'], p: [
        'En 2008, el Parlamento de Japón aprobó por unanimidad una resolución que pedía reconocerlos como pueblo indígena. La ley llegó en **2019**: fue la primera vez que una ley nacional lo decía.' ] },
      { h: 'Upopoy', foto: ['W39', 'Upopoy, el Museo Nacional Ainu, en Shiraoi.'], p: [
        'En julio de 2020 abrió en Shiraoi **Upopoy**, el Museo Nacional Ainu, junto al lago Poroto, con danzas, música y talleres. Desde el museo dicen que recuperar la lengua es uno de sus objetivos principales.',
        'Otros lugares para conocerlos: el pueblo de Nibutani, en el valle del río Saru, con el museo que fundó Shigeru Kayano.' ] },
    ],
    ficha: [
      '**Upopoy (Shiraoi):** de 9:00 a 17:00 (cambia según la época), cerrado los lunes (si es festivo, al día siguiente); entrada de adulto, 1.200 yenes (web oficial, abril de 2026). A una hora de Sapporo en tren.',
      '**Nibutani (Biratori):** museos ainu en el valle del río Saru, al sur de Hokkaido.',
      '**Respeto:** pregunta antes de fotografiar a nadie en las danzas o talleres y respeta lo que te digan en las ceremonias.',
    ],
    nota: 'Datos de noviembre de 2026; horarios y precios cambian, confírmalos en la web oficial de Upopoy antes de ir.',
    fuentes: [
      W('Wikipedia: Ainu people', 'https://en.wikipedia.org/wiki/Ainu_people'),
      W('Wikipedia: Ainu language', 'https://en.wikipedia.org/wiki/Ainu_language'),
      W('Rekishi Nihon: el tatuaje ainu', 'https://rekishinihon.com/2013/12/05/ainu-tattooing/'),
      W('Nippon.com: el tatuaje en Japón', 'https://www.nippon.com/en/articles/-/12663'),
      W('FPCJ: la ley ainu de 2019', 'https://fpcj.jp/wp/wp-content/uploads/2019/11/b8102b519c7b7c4a4e129763f23ed690.pdf'),
      W('Upopoy: información oficial (abril de 2026)', 'https://ainu-upopoy.go.jp/en/wp-content/uploads/sites/2/2026/04/0a861bc42e82b35e4bc85ab3090b23c2.pdf'),
      W('Sonido: viento en un pinar, W.carter, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'),
      W('Sonido: pájaros en Bourne Woods, Robert EA Harvey, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Birdsong_Bourne_Woods_2020-04-27_0722.mp3'),
    ],
    cierre: 'Próximo episodio: los mosuo, junto al lago Lugu, en China.',
  },
  // Short 9:16 · «Diario de grandes viajeros · 1» (P12/P15, encargo de Vídeo 2, 25 nov 2026) · montaje: salma marketing/pueblos/ainu-bird (ULTIMA)
  // Textos y fuentes: pueblos/ainu-bird/textos-youtube.txt y el guion v4 (claude.ai/artifact/RsTGVLoKfbhEusSRnDYxiL). YouTube jue 26 nov 2026 a las 16:00.
  // Va en el carril de «Pueblos borrados del mapa» porque el vídeo manda a borradodelmapa.com/pueblos. Las escenas de Runway no se usan como fotos.
  {
    orden: 167,
    slug: 'los-ainu-confiaron-en-una-viajera-inglesa',
    fecha: '2026-11-26',
    serie: 'Pueblos borrados del mapa',
    cap: 'Diario de grandes viajeros · 1',
    pais: 'Japón',
    titulo: 'Isabella Bird y los ainu: le pidieron que el Gobierno no se enterara',
    resumen: 'En 1878, los ainu de Biratori, en Hokkaido, le suplicaron a una viajera inglesa que no contara al Gobierno japonés lo que le enseñaban. Dos años después, Isabella Bird lo publicó todo en Londres. Hoy ese libro se lee en japonés.',
    video: 'viajeros-1-bird-ainu.mp4',
    realidad: 'Capítulo documental narrado por Salma. Lo que pasó en Biratori sale de las cartas de Isabella Bird; las fotos son de Wikimedia Commons (autores al final). En el vídeo, la viajera a caballo, su carta, Londres y la mujer que pasa a color son recreaciones. No es un viaje de Paco.',
    caratula: 'salma marketing/pueblos/ainu-bird/caratula/bird-F3.png', // carátula de YouTube (F3) = portada del blog y de la story (Y15), aviso de Vídeo 2 del 25 nov 2026
    creditosDe: 'salma marketing/pueblos/ainu-bird',
    otraSerie: 'salma marketing/pueblos',
    atrFotos: {
      'Isabella_Bird.jpg': { autor: 'autor desconocido', lic: 'Public domain', u: 'https://commons.wikimedia.org/wiki/File:Isabella_Bird.jpg' },
      'Ainu_by_Isabella_Bird.jpg': { autor: 'Isabella Bird', lic: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Ainu_by_Isabella_Bird.jpg' },
      'Nibutani-lago.jpg': { autor: 'Calistemon', lic: 'CC BY-SA 4.0', u: 'https://commons.wikimedia.org/wiki/File:Swans_on_Lake_Nibutani,_Hokkaido,_April_2023_01.jpg' },
    },
    creditosExtra: [
      ['Grabado de Isabella Bird · autor desconocido', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Isabella_Bird.jpg'],
      ['Grabado «Ainu» de su libro · Isabella Bird', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Ainu_by_Isabella_Bird.jpg'],
      ['Lago de Nibutani · Calistemon', 'CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Swans_on_Lake_Nibutani,_Hokkaido,_April_2023_01.jpg'],
    ],
    fotos: { portada: 'Isabella_Bird.jpg', galeria: [
      ['ainu/W16', 'Jefes ainu de Piratori, el Biratori de hoy.'],
      ['ainu/W20', 'Mujeres y niños ainu ante una casa.'],
      ['ainu/W5', 'Mujer ainu con el tatuaje de la boca (colección Bälz).'],
      ['ainu/W11', 'Mujer de Shiraoi con el traje de fiesta.'],
      ['Nibutani-lago.jpg', 'El lago de Nibutani, en el valle del río Saru (Biratori).'],
      ['ainu/W39', 'Upopoy, el Museo Nacional Ainu, en Shiraoi.'],
    ] },
    cifras: [['1878', 'Bird llega a Biratori'], ['1880', 'Su libro sale en Londres'], ['1973', 'Primera traducción al japonés']],
    story: {
      portadaSola: true, // la carátula F3 ya lleva su texto: va sola delante
      portada: 'Isabella_Bird.jpg',
      slides: [
        { foto: 'Isabella_Bird.jpg', h: 'Le pidieron silencio', t: 'En 1878, los ainu le suplicaron a una viajera inglesa que no se lo contara al Gobierno japonés. Ella lo publicó todo.', credito: ['autor desconocido', 'Public domain'] },
        { foto: 'ainu/W16', h: 'Biratori, 1878', t: 'Isabella Bird tenía 46 años. Salió de Tokio en junio y llegó a esta aldea de Hokkaido el 23 de agosto.' },
        { foto: 'ainu/W3', h: 'Un tatuaje prohibido', t: 'Japón lo había prohibido en 1871. Bird vio cómo tatuaban la boca a una niña con un cuchillo y hollín.' },
        { foto: 'ainu/W13', h: 'El miedo', t: 'Un padre rechazó la medicina para su hijo enfermo, «porque el Gobierno japonés se enfadaría».' },
        { foto: 'Ainu_by_Isabella_Bird.jpg', h: 'Londres, 1880', t: 'Dos años después, todo estaba impreso. En el mismo párrafo, voces «las más dulces» y «niños adultos».', credito: ['Isabella Bird', 'CC BY-SA 4.0'] },
        { foto: 'ainu/W39', h: 'Y Japón lo leyó', t: 'Su libro se tradujo al japonés en 1973. En 2019, una ley reconoció a los ainu como pueblo indígena.', salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'Una isla que cambió de nombre', foto: ['ainu/W9', 'Un matrimonio ainu; ella lleva el tatuaje de la boca.'], p: [
        'La isla del norte de Japón se llamaba **Ezo** y era la tierra de los **ainu**. En **1869**, Japón la anexionó, la rebautizó como **Hokkaido** y creó una Comisión de Colonización (*Kaitakushi*) para llenarla de colonos.',
        'En **1871** prohibió el tatuaje de las mujeres ainu, el que llevaban alrededor de la boca.',
      ] },
      { h: 'Una inglesa a caballo', foto: ['Isabella_Bird.jpg', 'Isabella Bird, en un grabado.'], p: [
        '**Isabella Bird** era inglesa y tenía **46 años**. Enferma desde niña, los médicos le recetaron viajar, y acabó recorriendo medio mundo: de las Montañas Rocosas al Tíbet.',
        'Salió de Tokio en junio de **1878** con un intérprete, **Itō Tsurukichi**, y llegó a **Biratori**, en el valle del río Saru, el **23 de agosto**. Lo que sigue lo cuenta ella en sus cartas.',
      ] },
      { h: 'El tatuaje', foto: ['ainu/W3', 'Mujer ainu con el tatuaje de la boca.'], p: [
        'En Biratori vio cómo una mujer le hacía cortes en el labio a una niña con un cuchillo grande y le frotaba hollín. La niña apretó las manos y no lloró.',
        'Le explicaron que sin ese tatuaje ninguna mujer podía casarse («*no woman could marry without it*»), y que la prohibición los tenía muy afligidos.',
      ] },
      { h: 'El secreto', foto: ['ainu/W13', 'Una familia ainu ante su casa.'], p: [
        'Antes de contarle nada, le suplicaron que no informara al Gobierno japonés. Tenían miedo: un padre no quiso que le enviara medicina para su niño enfermo, porque «el Gobierno japonés se enfadaría».',
        'Aun así, la subieron al monte que hay sobre la aldea y le enseñaron su templo, que según le dijeron no había visto ningún extranjero. Otra vez le pidieron que el Gobierno no se enterara.',
      ] },
      { h: 'El libro', foto: ['Ainu_by_Isabella_Bird.jpg', 'Grabado «Ainu» de su libro.'], p: [
        'Dos años después, en **1880**, todo estaba impreso en Londres: *Unbeaten Tracks in Japan* (John Murray).',
        'En el mismo párrafo escribió que su voz era «más suave y dulce que nada que haya oído» y que eran «*adult children*», niños adultos.',
      ] },
      { h: 'Lo que pasó después', foto: ['ainu/W39', 'Upopoy, el Museo Nacional Ainu, en Shiraoi.'], p: [
        'Japón mantuvo la prohibición. Según las fuentes divulgativas, la última mujer con el tatuaje completo murió en **1998**.',
        'En **2019**, una ley reconoció por primera vez a los ainu como pueblo indígena de Japón, y en 2020 abrió **Upopoy**, el Museo Nacional Ainu, en Shiraoi.',
        'El libro que no debía llegar al Gobierno se tradujo al japonés en **1973** (Kenkichi Takanashi, Heibonsha) y hoy tiene varias traducciones más.',
      ], enlaces: [['Los ainu: el tatuaje que Japón prohibió', '/blog/viajes/japon-ainu-hokkaido-tatuaje-prohibido']] },
    ],
    ficha: [
      '**Upopoy (Shiraoi):** de 9:00 a 17:00 (cambia según la época), cerrado los lunes; entrada de adulto, 1.200 yenes (web oficial, abril de 2026). A una hora de Sapporo en tren.',
      '**Nibutani (Biratori):** museos ainu en el valle del río Saru, al sur de Hokkaido.',
      '**Respeto:** pregunta antes de fotografiar a nadie en las danzas o talleres.',
    ],
    nota: 'Datos de noviembre de 2026; horarios y precios cambian, confírmalos en la web oficial de Upopoy antes de ir. Lo que pasó en Biratori es lo que cuenta Bird en su libro.',
    fuentes: [
      W('Isabella Bird: «Unbeaten Tracks in Japan» (1880), texto en Internet Archive', 'https://archive.org/details/unbeatentracksin02184gut'),
      W('Wikipedia: Unbeaten Tracks in Japan', 'https://en.wikipedia.org/wiki/Unbeaten_Tracks_in_Japan'),
      W('Wikipedia (japonés): 日本奥地紀行, traducciones', 'https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E5%A5%A5%E5%9C%B0%E7%B4%80%E8%A1%8C'),
      W('Wikipedia: Isabella Bird', 'https://en.wikipedia.org/wiki/Isabella_Bird'),
      W('Wikipedia: Hokkaido', 'https://en.wikipedia.org/wiki/Hokkaido'),
      W('Wikipedia: Hokkaidō Development Commission', 'https://en.wikipedia.org/wiki/Hokkaid%C5%8D_Development_Commission'),
      W('Rekishi Nihon: el tatuaje ainu', 'https://rekishinihon.com/2013/12/05/ainu-tattooing/'),
      W('Nippon.com: el tatuaje en Japón', 'https://www.nippon.com/en/articles/-/12663'),
      W('FPCJ: la ley ainu de 2019', 'https://fpcj.jp/wp/wp-content/uploads/2019/11/b8102b519c7b7c4a4e129763f23ed690.pdf'),
      W('Upopoy: información oficial (abril de 2026)', 'https://ainu-upopoy.go.jp/en/wp-content/uploads/sites/2/2026/04/0a861bc42e82b35e4bc85ab3090b23c2.pdf'),
    ],
    cierre: 'Diario de grandes viajeros: viajeros que contaron lo que vieron, y lo que pasó después.',
  },
];
