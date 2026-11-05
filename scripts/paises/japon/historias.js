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
];
