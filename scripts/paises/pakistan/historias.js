// Entradas del blog de Pakistán (ver scripts/datos-pais.cjs). «orden» = posición en el blog: menor sale antes.
const W = (t, u) => ({ t, u });

module.exports = [
  // Short 9:16 · Pueblos T2 · montaje: salma marketing/pueblos/kalash (v4, ULTIMA) · guion: docs/pueblos-kalash-guion-direccion.md
  // YouTube mié 16 dic 2026 (T36: cada vídeo con su entrada). Fuera: cuántos se convierten al año (las fuentes se contradicen).
  {
    orden: 173,
    slug: 'kalash-el-pueblo-que-se-salvo-por-una-raya-en-el-mapa',
    fecha: '2026-12-16',
    serie: 'Pueblos borrados del mapa',
    cap: 'Pakistán',
    pais: 'Pakistán',
    titulo: 'Kalash, el pueblo que se salvó por una raya en el mapa',
    resumen: 'Dicen que son los hijos de Alejandro Magno. Los kalash viven en tres valles de las montañas de Pakistán, el vino es sagrado y en mayo bailan durante días. Su ADN desmiente la leyenda; lo increíble es que sigan aquí, y los salvó una frontera.',
    video: 'pueblos-kalash.mp4',
    realidad: 'Capítulo documental narrado por Salma con fotos de Wikimedia Commons (autores al final). No hemos estado en los valles kalash: cada dato sale de las fuentes que citamos.',
    creditosDe: 'salma marketing/pueblos/kalash',
    // Sin tiempos.json en la carpeta del montaje: estas son las fotos del vídeo, para los créditos
    creditosIds: ['W11', 'W12', 'W13', 'W135', 'W16', 'W18', 'W19', 'W2', 'W20', 'W22', 'W23', 'W232', 'W240', 'W4', 'W5', 'W51', 'W53', 'W54', 'W55', 'W58', 'W6', 'W73', 'W74', 'W76', 'W8', 'W80', 'W81', 'W83', 'W84'],
    fotos: { portada: 'W83', galeria: [
      ['W232', 'Casas de Rumbur, uno de los tres valles kalash.'],
      ['W53', 'Los guardianes de madera de una aldea kalash.'],
      ['W54', 'Un tocado de la fiesta de la cosecha.'],
      ['W51', 'Un vestido kalash en el museo del Quai Branly, en París.'],
      ['W74', 'Un tamborilero en la fiesta de primavera.'],
      ['W58', 'Casas kalash en el valle de Chitral.'],
    ] },
    cifras: [['3', 'Valles: Bumburet, Rumbur y Birir'], ['7.466', 'Hablan kalasha (censo de 2023)'], ['1896', 'Año en que se salvaron']],
    story: {
      portada: 'W83',
      slides: [
        { foto: 'W84', h: '¿Hijos de Alejandro Magno?', t: 'Eso dice la leyenda de los kalash, que viven escondidos en las montañas de Pakistán.', credito: ['Omer Imran', 'CC BY-SA 4.0'] },
        { foto: 'W83', h: 'El ADN dice que no', t: 'Muchos tienen los ojos claros, pero un estudio del Instituto Sanger no encontró rastro griego en su ADN.', credito: ['Numan Ali', 'CC BY-SA 4.0'] },
        { foto: 'W74', h: 'Lo increíble es que sigan aquí', t: 'Las mujeres no se cubren el pelo, el vino es sagrado y en mayo bailan durante días.', credito: ['manalahmadkhan', 'CC BY 2.0'] },
        { foto: 'W232', h: 'Los salvó una raya', t: 'En 1896, al otro lado de la frontera, el emir de Afganistán convirtió a la fuerza a pueblos como ellos. Los kalash quedaron del lado británico.', credito: ['Imran Shah', 'CC BY-SA 2.0'] },
        { foto: 'W53', h: 'Leer el sol', t: 'En 2018, la UNESCO puso en su lista de urgencia su forma de leer el sol para saber cuándo sembrar.', credito: ['Martin Jung', 'CC BY-SA 3.0'] },
        { foto: 'W58', h: 'Hoy', t: 'Unas 7.500 personas tienen el kalasha como lengua materna, según el censo de Pakistán de 2023.', credito: ['Azmat akbar', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'La leyenda de Alejandro', foto: ['W84', 'La fiesta de Chilam Joshi, en un valle kalash.'], p: [
        'Los **kalash** viven en tres valles del distrito de **Chitral** (Bumburet, Rumbur y Birir), en el Hindu Kush de Pakistán, junto a la frontera afgana. Dicen descender de los soldados de **Alejandro Magno**, y muchos tienen los ojos claros: de ahí la leyenda.',
        'La genética no lo confirma. Un estudio del **Instituto Sanger** (Ayub y otros, 2015) no encontró rastro griego en su ADN: los kalash son un grupo muy antiguo y aislado, uno de los primeros que se separaron de las poblaciones actuales del subcontinente.',
      ], enlaces: [['Chitral', '/destinos/chitral-pakistan.html']] },
      { h: 'Lo increíble es que sigan aquí', foto: ['W83', 'Bumburet, uno de los tres valles kalash.'], p: [
        'Rodeados de un país musulmán, mantienen su religión: las mujeres no se cubren el pelo y llevan túnicas negras bordadas y el tocado *kupás*, de conchas; el **vino es sagrado**; y celebran tres grandes fiestas: **Chilam Joshi** en mayo, en la que bailan durante días; Uchau en otoño y Chaumos en diciembre.',
      ] },
      { h: 'Los salvó una raya en el mapa', foto: ['W232', 'Casas de Rumbur.'], p: [
        'En 1893, la **línea Durand** dejó la mayor parte de Kafiristán, la tierra de pueblos con creencias parecidas a las suyas, en Afganistán. En el invierno de **1895-96**, el emir **Abdur Rahman** la conquistó y convirtió a la fuerza a sus habitantes; la región pasó a llamarse **Nuristán**, «tierra de la luz».',
        'Los kalash estaban al otro lado de la raya, en Chitral, del lado británico. **Los salvó la frontera**.',
      ] },
      { h: 'Los kalash hoy', foto: ['W53', 'Los guardianes de madera de una aldea kalash.'], p: [
        'En **2018**, la **UNESCO** inscribió en su lista de salvaguardia **urgente** el *Suri Jagek*: su forma de leer el sol, la luna y las sombras de las montañas para saber cuándo sembrar.',
        'Según el censo de Pakistán de **2023**, **7.466 personas** tienen el kalasha como lengua materna. Cuántos se convierten cada año es una cifra que las fuentes no aclaran: unas lo llaman mito y otras hablan de decenas de casos, así que no damos ninguna.',
      ], enlaces: [['Pakistán', '/destinos/pakistan.html']] },
    ],
    cierre: 'Si visitas los valles kalash, pide permiso antes de fotografiar a nadie: son personas, no una atracción.',
    nota: 'Datos revisados en noviembre de 2026. Que desciendan de Alejandro Magno es una leyenda: la genética no la confirma.',
    fuentes: [
      W('Ayub y otros: «The Kalash Genetic Isolate», American Journal of Human Genetics (2015)', 'https://doi.org/10.1016/j.ajhg.2015.03.012'),
      W('UNESCO: Suri Jagek, en la lista de salvaguardia urgente (2018)', 'https://ich.unesco.org/en/USL/suri-jagek-observing-the-sun-traditional-meteorological-and-astronomical-practice-based-on-the-observation-of-the-sun-moon-and-stars-in-reference-to-the-local-topography-01385'),
      W('Wikipedia: kalash', 'https://en.wikipedia.org/wiki/Kalash_people'),
      W('Wikipedia: lengua kalasha (censo de 2023)', 'https://en.wikipedia.org/wiki/Kalasha_language'),
      W('Wikipedia: Nuristán', 'https://en.wikipedia.org/wiki/Nuristan_Province'),
    ],
  },
];
