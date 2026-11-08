// Historias del blog de china (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

module.exports = [
  // Ep.8 Los mosuo · guion y fuentes: docs/pueblos-ep8-mosuo-guion-direccion.md · vídeo: salma marketing/pueblos/mosuo/ULTIMA
  {
    orden: 190,
    slug: 'china-mosuo-lago-lugu-matrimonio-andante',
    fecha: '2026-11-02',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 8',
    pais: 'China',
    redes: { tituloYT: 'Los mosuo: donde la casa la lleva una mujer · Lago Lugu, China', tituloTT: 'Mosuo: el matrimonio andante del lago Lugu', hashtags: ['#mosuo', '#china', '#pueblosborradosdelmapa'] },
    titulo: 'Los mosuo: donde la casa la lleva una mujer',
    resumen: 'Junto al lago Lugu, entre Yunnan y Sichuan, los mosuo viven en la casa de la familia de la madre y, por tradición, no se casan: practican el matrimonio andante. El turismo está cambiando su forma de vida.',
    video: 'pueblos-ep8-mosuo.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final) y fuentes citadas. No es un viaje de Paco.',
    destino: ['lijiang-yunan-china', 'Lijiang'],
    creditosDe: 'salma marketing/pueblos/mosuo',
    fotos: { portada: 'W25', galeria: [['W24', 'Una abuela mosuo en la puerta de su casa.'], ['W9', 'Remando en el lago Lugu.'], ['W43', 'Una mujer mosuo con el tocado tradicional.'], ['W13', 'Chicos mosuo.'], ['W60', 'Campesinos mosuo.'], ['W77', 'El lago Lugu desde el monte.']] },
    cifras: [['13 años', 'Ceremonia de mayoría de edad'], ['378', 'Hostales en el lago (2025)'], ['40.000-50.000', 'Mosuo, según la fuente']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'W24',
      slides: [
        { foto: 'W24', h: 'La casa la lleva una mujer', t: 'Junto al lago Lugu, entre Yunnan y Sichuan, los mosuo viven en la casa de la familia de la madre.', credito: ['Rod Waddington', 'CC BY-SA 2.0'] },
        { foto: 'W76', h: 'El lago de los mosuo', t: 'Viven en las montañas del suroeste de China. Las fuentes calculan entre 40.000 y 50.000.', credito: ['祝鱼贵', 'CC BY-SA 4.0'] },
        { foto: 'W43', h: 'La casa de la madre', t: 'Una gran casa de unas veinte personas que dirige una mujer. A los niños los crían su madre y sus tíos maternos.', credito: ['Rod Waddington', 'CC BY-SA 2.0'] },
        { foto: 'W73', h: 'El matrimonio andante', t: 'El hombre visita de noche a su pareja, si ella quiere, y por la mañana vuelve a casa de su madre.', credito: ['祝鱼贵', 'CC BY-SA 4.0'] },
        { foto: 'W74', h: 'El turismo lo cambia', t: 'Según China Daily, hoy la mayoría de los mosuo del lago trabaja en el turismo. En 2025 había 378 hostales.', credito: ['祝鱼贵', 'CC BY-SA 4.0'] },
        { foto: 'W55', h: 'Un pueblo sin casilla', t: 'Para el Gobierno chino no son una etnia propia: en Yunnan los cuenta como naxi, aunque su cultura es distinta.', credito: ['Rod Waddington', 'CC BY-SA 2.0'] },
        { foto: 'W9', h: 'Visitar con respeto', t: 'Su forma de familia no es un espectáculo. Pregunta antes de fotografiar y no trates el matrimonio andante como una curiosidad.', credito: ['Himangframe', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'El lago de los mosuo', foto: ['W76', 'El lago Lugu, entre Yunnan y Sichuan.'], p: [
        'Los **mosuo** viven en las montañas de Hengduan, en el suroeste de China, entre las provincias de **Yunnan** y **Sichuan**, muchos en torno al **lago Lugu**. Las fuentes calculan entre 40.000 y 50.000.',
        'Hablan el na, una lengua emparentada con el naxi, sin escritura de uso diario. Su religión, el daba, convive con el budismo tibetano.' ] },
      { h: 'La casa de la madre', foto: ['W6', 'Una familia mosuo extensa.'], p: [
        'La familia mosuo vive en una gran casa, el *awo*, de unas veinte personas, que dirige una mujer. Allí viven juntos hermanos, hermanas, hijos y sobrinos de la línea de la madre.',
        'A los niños los crían su madre y sus tíos maternos. A los trece años celebran la mayoría de edad: las chicas reciben su primera falda y los chicos, su primer pantalón.' ] },
      { h: 'El matrimonio andante', foto: ['W73', 'El puente del matrimonio andante, en el lago Lugu.'], p: [
        'Lo llaman ***zǒu hūn***, «matrimonio andante» (en su lengua, *tisese*): el hombre visita de noche a su pareja, si ella quiere, y por la mañana vuelve a casa de su madre. Cada uno sigue viviendo con su familia.',
        'No es lo que algunos tours venden. Muchos visitantes llegan con fantasías sexuales que no tienen nada que ver con sus normas, y eso también forma parte del problema.' ] },
      { h: 'El turismo', foto: ['W74', 'Barcas en la orilla del lago Lugu.'], p: [
        'Según *China Daily* (marzo de 2025), hoy la mayoría de los mosuo del lago trabaja en el turismo: hostales, barcas, danzas, casas de huéspedes. Hay **378 hostales** con 13.590 camas. El Gobierno protege 127 casas tradicionales y 25 pueblos, y ya en 2016 prohibió construir hoteles nuevos en el lago.',
        'Fuentes más antiguas (una tesis de 2013 y un análisis de 2015) describen otra cara: cada vez más jóvenes se casan como en el resto de China o se van a trabajar a la ciudad. No hemos encontrado datos recientes de cuántos siguen con el matrimonio andante.' ] },
      { h: 'Un pueblo sin casilla', foto: ['W55', 'Una joven mosuo de hoy.'], p: [
        'Para el Gobierno chino, los mosuo no son una etnia propia: en Yunnan los cuenta como naxi, aunque su cultura es distinta.' ] },
    ],
    ficha: [
      '**Cómo llegar:** el lago Lugu está en el norte de Yunnan, junto al límite con Sichuan; se llega por carretera desde Lijiang. Confirma rutas y tiempos antes de ir.',
      '**Dónde dormir:** en una casa o un hostal mosuo junto al lago.',
      '**Respeto:** su forma de familia no es un espectáculo; pregunta antes de fotografiar y no hagas preguntas sobre el matrimonio andante como si fuera una curiosidad.',
    ],
    nota: 'Datos de noviembre de 2026; carreteras, entradas al área escénica y precios cambian, confírmalos antes de ir.',
    fuentes: [
      W('Wikipedia: Mosuo', 'https://en.wikipedia.org/wiki/Mosuo'),
      W('NPR, 26 nov 2016: el lugar de China donde mandan las mujeres', 'https://www.npr.org/sections/parallels/2016/11/26/501012446/the-place-in-china-where-the-women-lead'),
      W('China Daily, 18 mar 2025: turismo en el lago Lugu', 'https://global.chinadaily.com.cn/a/202503/18/WS67d8b6eda310c240449db4ec_4.html'),
      W('Bruce Humes, 2015: el declive de la cultura mosuo', 'https://bruce-humes.com/2015/10/28/mosuo-cultural-decline-allure-of-modernization-impact-of-tourism-and-conveniently-airbrushed-history/'),
      W('College of Wooster, 2013: turismo y matrimonio andante (tesis)', 'https://openworks.wooster.edu/independentstudy/1137'),
      W('Sonido: viento en un pinar, W.carter, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'),
      W('Sonido: pájaros en Bourne Woods, Robert EA Harvey, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Birdsong_Bourne_Woods_2020-04-27_0722.mp3'),
    ],
    cierre: 'Próximo episodio: los dukha, los pastores de renos de Mongolia.',
  },
];
