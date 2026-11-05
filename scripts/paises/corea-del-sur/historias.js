// Historias del blog de corea-del-sur (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

module.exports = [
  // Ep.3 Las haenyeo · guion y fuentes: docs/pueblos-ep3-haenyeo-guion-direccion.md · vídeo: salma marketing/pueblos/haenyeo/ULTIMA
  {
    orden: 140,
    slug: 'corea-haenyeo-mujeres-del-mar-jeju',
    fecha: '2026-11-01',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 3',
    pais: 'Corea del Sur',
    redes: { tituloYT: 'Las haenyeo de Jeju: bucean a pulmón con más de 70 años · Corea', tituloTT: 'Haenyeo: bucean sin botella con más de 70 años', hashtags: ['#jeju', '#haenyeo', '#pueblosborradosdelmapa'] },
    titulo: 'Las haenyeo: las mujeres del mar de Jeju',
    resumen: 'En la isla de Jeju, mujeres de más de setenta años siguen bajando al fondo del mar sin botella. Quedan 2.371 y dos de cada tres tienen setenta años o más.',
    video: 'pueblos-ep3-haenyeo.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons y sonido de Freesound (autores al final) y fuentes citadas. No es un viaje de Paco.',
    destino: ['jeju-corea-del-sur', 'Jeju'],
    creditosDe: 'salma marketing/pueblos/haenyeo',
    fotos: { portada: 'W36', galeria: [['W27', 'Entrando al agua con el flotador y la red.'], ['W12', 'Limpiando lo recogido en la orilla.'], ['H02', 'Haenyeo de Jeju en 1962.'], ['H03', 'De vuelta del mar, en 1958.'], ['W10', 'Trabajo en la orilla, en la playa de Yongmeori.'], ['W03', 'Haenyeo junto al puerto de Seongsan.']] },
    cita: { tras: 4, t: 'Se gana en el mundo de los muertos para gastar en el de los vivos', de: 'Dicho de las haenyeo' },
    cifras: [['2.371', 'Haenyeo a finales de 2025'], ['63 %', 'Con 70 años o más'], ['10-20 m', 'A pulmón']],
    secciones: [
      { h: 'Las mujeres del mar', foto: ['W42', 'En el mar, junto al flotador naranja (*taewak*) que marca dónde bucea cada una.'], p: [
        'Las **haenyeo** («mujeres del mar») bucean a pulmón en la costa de **Jeju**, una isla volcánica al sur de Corea. Sin botella: con traje de neopreno, gafas, aletas, plomos, una herramienta para despegar las conchas y una red atada a un flotador.',
        'Recogen orejas de mar, erizos, caracolas, pulpos y algas, y lo venden a través de las cofradías de cada pueblo, que reparten las zonas de pesca.' ] },
      { h: 'Uno o dos minutos sin respirar', foto: ['W24', 'Con la red de lo recogido.'], p: [
        'Bajan hasta unos **diez metros**, las más expertas hasta veinte, y aguantan normalmente de uno a tres minutos. Desde que llegaron los trajes de neopreno pueden pasar cinco o seis horas en el agua.',
        'Al salir sueltan el aire con un silbido largo, el ***sumbisori***, una forma de respirar que les permite volver a bajar enseguida.',
        'Un estudio publicado en *Cell Reports* en 2025 comparó a haenyeo con otras mujeres de Jeju: al bucear, su pulso baja un 50 % más, y los investigadores encontraron dos variantes genéticas ligadas al frío y a la tensión arterial que son más frecuentes en toda la isla.' ] },
      { h: 'Una historia de mujeres', foto: ['H01', 'Haenyeo en la costa de Jeju en 1958.'], p: [
        'Según los registros, en el siglo XVIII ya había en Jeju más mujeres que hombres buceando. Muchas trabajaron también fuera: comerciantes japoneses y coreanos las contrataban para bucear en Japón y en la península.',
        'En 1932, bajo la ocupación japonesa, las haenyeo del este de la isla se levantaron contra la administración colonial japonesa. Tres de sus líderes, **Bu Chun-hwa, Kim Ok-ryeon y Bu Deok-ryang**, fueron reconocidas en 2022 como luchadoras por la independencia de Corea. Las fuentes no coinciden en cuántas participaron (unas mil en la manifestación del 12 de enero; unas diecisiete mil en todo el movimiento), así que no damos una cifra.' ] },
      { h: 'Sehwa, 1932', foto: ['W38', 'Sehwa, en el este de Jeju, donde las haenyeo se manifestaron el 12 de enero de 1932.'], p: [
        'La manifestación más conocida fue en el mercado de **Sehwa**, en el municipio de Gujwa, muy cerca de **Hado**, donde hoy está el Museo de las Haenyeo.' ] },
      { h: 'El otro mundo', foto: ['W23', 'Una haenyeo de Jeju.'], p: [
        'Bucear a pulmón es peligroso, y ellas lo resumen en un dicho que se repite en Jeju: se gana la vida en el mundo de los muertos para gastarla en el de los vivos.',
        'Entre 2020 y 2024, los bomberos de Jeju atendieron 102 accidentes de haenyeo. En el periodo anterior, tres de cada cuatro víctimas tenían setenta años o más.' ] },
      { h: 'Lo que se está borrando', foto: ['W01', 'Haenyeo de Jeju en la orilla, con sus redes.'], p: [
        'El 31 de diciembre de 2025 quedaban **2.371 haenyeo** en activo (2.350 mujeres y 21 hombres), casi la mitad que diez años antes (4.377 en 2015). **1.500 tienen setenta años o más**, 423 pasan de los ochenta y solo 105 tienen menos de cincuenta.' ] },
      { h: 'Patrimonio y relevo', foto: ['W11', 'Estatua de una haenyeo en Jeju.'], p: [
        'Desde **2016**, la cultura de las haenyeo es Patrimonio Cultural Inmaterial de la Humanidad de la UNESCO.',
        'La provincia paga 500.000 wones al mes durante tres años a las nuevas haenyeo menores de 45 años, y lo mismo a las que se retiran con 75 o más, para que no se arriesguen en el mar. Aun así, entran pocas: el trabajo es duro, se gana poco al principio y no es fácil que una cofradía te acepte.' ] },
    ],
    ficha: [
      '**Espectáculo de haenyeo en Seongsan:** en la playa bajo Seongsan Ilchulbong, normalmente a las 14:00 (otra fuente da 13:00 y 15:30). Se ve gratis por el camino de la izquierda del volcán y se cancela sin aviso si hay mala mar.',
      '**Museo de las Haenyeo** en Hado-ri (Gujwa, este de la isla): unos 1.100 wones para adultos, de 9:00 a 17:00; las fuentes no coinciden en el día de cierre (festivos o lunes).',
      '**Respeto:** no entres en sus zonas de pesca ni cojas nada del mar (es de las cofradías), y pide permiso antes de hacerles fotos.',
    ],
    nota: 'Datos de noviembre de 2026; horarios y precios cambian, confírmalos en la web oficial de turismo de Jeju y del museo antes de ir.',
    fuentes: [
      W('Kyunghyang Shinmun, 20 ene 2026: recuento de haenyeo a finales de 2025', 'https://www.khan.co.kr/en/article/202601201436577'),
      W('Korea JoongAng Daily: 10 años de las haenyeo en la UNESCO', 'https://www.koreajoongangdaily.com/lifestyle/take-a-deep-breath-jejus-haenyeo-festival-dives-into-10-years-of-unesco-heritage/12881337'),
      W('Wikipedia: Haenyeo', 'https://en.wikipedia.org/wiki/Haenyeo'),
      W('Korea Times, 1 ene 2022: tres haenyeo, luchadoras por la independencia', 'https://www.koreatimes.co.kr/amp/lifestyle/people-events/20220101/jejus-three-female-divers-named-independence-fighters-by-patriots-ministry'),
      W('Korea Times, 1 dic 2016: inscripción en la UNESCO', 'https://www.koreatimes.co.kr/amp/southkorea/20161201/haenyeo-inscribed-on-unesco-cultural-heritage-list'),
      W('NPR, 15 may 2025: el estudio de Cell Reports', 'https://www.npr.org/sections/shots-health-news/2025/05/15/nx-s1-5381139/korean-haenyeo-female-free-divers-genes-adaptations-jeju'),
      W('AFP en Malay Mail, 10 sep 2026: el dicho y las nuevas haenyeo', 'https://www.malaymail.com/news/life/2026/09/10/the-sea-is-dangerous-but-for-some-young-south-korean-women-escaping-the-rat-race-means-diving-into-the-deep-end/234664'),
      W('Asia Economy, 30 jun 2026: accidentes de haenyeo', 'https://view.asiae.co.kr/en/article/2026063015424154817'),
      W('Visit Jeju: el sumbisori', 'https://www.visitjeju.net/u/5JS'),
      W('Sonido: «Small Waves at the Beach» (Jeju), ultradust, CC BY 4.0', 'https://freesound.org/people/ultradust/sounds/165126/'),
      W('Sonido: «Korean island shore at night» (Jeju-do), rizzin, CC BY 3.0', 'https://freesound.org/people/rizzin/sounds/400791/'),
    ],
    cierre: 'Próximo episodio: los konyak de Nagaland, en el noreste de la India.',
  },
];
