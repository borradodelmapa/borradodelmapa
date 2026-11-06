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
const H = (slug) => '/blog/viajes/' + slug;
const LUZON = '/luzon-norte-en-4-dias-banaue-batad-sagada-y-buscalan-brjk';

module.exports = [
  // Largo 16:9 de la temporada 1 · montaje y capítulos: salma marketing/pueblos/temporada-1 · YouTube, jue 12 nov 2026 a las 15:30
  {
    orden: 215,
    slug: 'pueblos-borrados-del-mapa-temporada-1',
    borrador: true,
    variosPaises: true,
    fecha: '2026-11-12',
    serie: 'Pueblos borrados del mapa',
    cap: 'Temporada 1',
    pais: 'Asia',
    formato: '16:9',
    youtube: '5JP5sYEI9Ig',
    titulo: 'Pueblos que se están borrando del mapa: 10 culturas de Asia',
    resumen: 'Diez pueblos de Asia cuyas culturas se están borrando del mapa: la última gran tatuadora de Filipinas, las buceadoras de Jeju, los últimos konyak con la cara tatuada y los nómadas del mar. Quiénes son, qué están perdiendo y cómo llegar con respeto.',
    video: 'pueblos-t1-largo.mp4',
    realidad: 'Documental: lo cuenta Salma con fotos de Wikimedia Commons, vídeos del tsunami con licencia libre (grabados en Ko Lanta, no en Surin) y sonido con licencia libre (autores al final), con fuentes citadas. No hay ninguna imagen de sentineleses. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/temporada-1',
    fotosEpisodios: 'salma marketing/pueblos',
    fotos: { portada: 'whang-od/W39', posicion: '72% 30%', galeria: [
      ['haenyeo/W27', 'Una haenyeo entra al agua con el flotador y la red, en Jeju.'],
      ['konyak/W52', 'El tatuaje del pecho de un konyak, en Longwa.'],
      ['mosuo/W9', 'Remando en el lago Lugu, la tierra de los mosuo.'],
      ['aguila/W19', 'Cazadores con águila cruzando el río en el festival de Bayan-Ölgii.'],
      ['dukha/W7', 'Una tienda dukha en el bosque.'],
      ['konyak/W62', 'La fiesta de Aoleang de los konyak.'],
    ] },
    cifras: [['10', 'Pueblos'], ['7', 'Países de Asia'], ['13 min', 'De documental']],
    secciones: [
      { h: 'Whang-Od, la última mambabatok · Filipinas', min: '0:00', foto: ['whang-od/W27', 'Whang-Od, con la varilla del *batok* en la mano.'], p: [
        'En **Buscalan**, en las montañas de Kalinga, la tatuadora más anciana de Filipinas sigue golpeando la piel con una espina. Tiene entre 107 y 109 años: nadie conoce la fecha exacta. Su arte tiene relevo en las aprendices del pueblo; sus cantos, no.',
        '**Para ir:** guía local obligatorio y hora y media a pie desde la carretera. Whang-Od tatúa pocas horas al día y las aprendices atienden a la mayoría de los visitantes. Pide permiso antes de hacer fotos.' ],
        enlaces: [['La historia completa', H('filipinas-whang-od-tatuadora-kalinga')], ['Buscalan', '/destinos/buscalan-filipinas.html'], ['Guía de Luzón Norte en 4 días', LUZON]] },
      { h: 'Los ataúdes colgantes de Sagada · Filipinas', min: '1:40', foto: ['sagada/W02', 'Ataúdes colgados de la roca en el Valle del Eco.'], p: [
        'En las montañas de Luzón, a unos 1.500 metros, los ataúdes no se entierran: cuelgan de la roca. Por qué tan alto, quién tiene derecho a ese entierro y por qué cada vez se ven menos.',
        '**Para ir:** registro obligatorio en la oficina de turismo y guía local para bajar al Valle del Eco. No toques los ataúdes ni te subas a ellos, y haz fotos solo donde lo permita el guía.' ],
        enlaces: [['La historia completa', H('filipinas-sagada-ataudes-colgantes')], ['Sagada', '/destinos/sagada-filipinas.html'], ['Guía de Luzón Norte en 4 días', LUZON]] },
      { h: 'Las haenyeo de Jeju · Corea del Sur', min: '2:58', foto: ['haenyeo/W42', 'En el mar, junto al flotador naranja (*taewak*) que marca dónde bucea cada una.'], p: [
        'En la isla de Jeju, mujeres de más de setenta años siguen bajando al fondo del mar sin botella, a diez metros y las más expertas a veinte. A finales de 2025 quedaban **2.371**, casi la mitad que diez años antes, y dos de cada tres tienen setenta años o más.',
        '**Para ir:** el Museo de las Haenyeo está en Hado-ri, en el este de la isla. No entres en sus zonas de pesca ni cojas nada del mar, y pide permiso antes de hacerles fotos.' ],
        enlaces: [['La historia completa', H('corea-haenyeo-mujeres-del-mar-jeju')], ['Jeju', '/destinos/jeju-corea-del-sur.html']] },
      { h: 'Los konyak, los últimos tatuados · India', min: '4:24', foto: ['konyak/W90', 'Nyemwang Wanghu, uno de los últimos cazadores de cabezas tatuados.'], p: [
        'En Nagaland, en la frontera de la India con Birmania, los últimos guerreros konyak con la cara tatuada tienen entre ochenta y noventa y cinco años. Cuando se vayan, se irán las últimas caras que cuentan esa historia.',
        '**Para ir:** Nagaland volvió a exigir un permiso a los extranjeros en diciembre de 2024: confírmalo justo antes de viajar. La fiesta de Aoleang es del 1 al 6 de abril, en el distrito de Mon. Los tatuados son personas, no una atracción: pide permiso antes de fotografiar a nadie.' ],
        enlaces: [['La historia completa', H('india-konyak-ultimos-tatuados-nagaland')]] },
      { h: 'Los moken, nómadas del mar · Tailandia', min: '5:46', foto: ['moken/W25', 'Una anciana moken de Surin.'], p: [
        'Durante siglos vivieron en barcas entre Tailandia y Birmania. En 2004 se salvaron del tsunami porque reconocieron la ola de sus leyendas. Hoy viven en un poblado fijo, y el último *kabang* de Surin se construyó en 2006.',
        '**Para ir:** el parque nacional de Mu Ko Surin abre del 15 de octubre al 15 de mayo y la entrada se compra antes, por internet. Sigue al guía del poblado y pide permiso antes de fotografiar a nadie.' ],
        enlaces: [['La historia completa', H('tailandia-moken-nomadas-del-mar-surin')], ['Tailandia', '/destinos/tailandia.html']] },
      { h: 'Los sentineleses, la isla que no se visita · India', min: '7:03', foto: ['sentineleses/W1', 'La isla por la ventanilla de un avión comercial.'], p: [
        'En la isla Sentinel del Norte, en las Andamán, vive un pueblo que no deja entrar a nadie. Nadie sabe cuántos son (las estimaciones van de 15 a 500) ni entiende su idioma, y tienen buenas razones para no querer visitas: nuestras enfermedades podrían acabar con ellos.',
        '**No se visita:** acercarse a la isla es ilegal en la India. Si vas a las Andamán, tampoco hagas tours para ver a los jarawa por la carretera de su reserva.' ],
        enlaces: [['La historia completa', H('india-sentineleses-isla-que-no-se-visita')]] },
      { h: 'Los ainu, el tatuaje prohibido · Japón', min: '8:24', foto: ['ainu/W5', 'Mujer ainu con el tatuaje de la boca (colección Bälz).'], p: [
        'Las niñas ainu se tatuaban la boca desde pequeñas hasta que Japón lo prohibió en 1871. Después les quitaron la caza, la pesca y el idioma, que hoy tiene como mucho dos hablantes nativos. Japón no los reconoció como pueblo indígena hasta 2019.',
        '**Para ir:** Upopoy, el Museo Nacional Ainu, está en Shiraoi, a una hora de Sapporo en tren, y cierra los lunes. Pregunta antes de fotografiar a nadie en las danzas o talleres.' ],
        enlaces: [['La historia completa', H('japon-ainu-hokkaido-tatuaje-prohibido')]] },
      { h: 'Los mosuo y el matrimonio andante · China', min: '9:31', foto: ['mosuo/W24', 'Una abuela mosuo en la puerta de su casa.'], p: [
        'Junto al lago Lugu, entre Yunnan y Sichuan, los mosuo viven en la casa de la familia de la madre y, por tradición, no se casan: practican el matrimonio andante. El turismo está cambiando su forma de vida: en 2025 había 378 hostales en el lago.',
        '**Para ir:** se llega por carretera desde Lijiang. Su forma de familia no es un espectáculo: pregunta antes de fotografiar y no preguntes por el matrimonio andante como si fuera una curiosidad.' ],
        enlaces: [['La historia completa', H('china-mosuo-lago-lugu-matrimonio-andante')], ['Lijiang', '/destinos/lijiang-yunan-china.html']] },
      { h: 'Los dukha, pastores de renos · Mongolia', min: '10:32', foto: ['dukha/W1', 'Montando en reno por la taiga nevada.'], p: [
        'En la taiga del norte de Mongolia, junto a Siberia, los dukha viven de sus renos: les dan leche, queso y transporte. Quedan unos doscientos, y cada vez más familias bajan de la taiga cuando sus hijos tienen que ir al colegio.',
        '**Para ir:** de Mörön a Tsagaannuur, 9-12 horas en coche por pistas, y después 4-8 horas a caballo. Hace falta un permiso de zona fronteriza. Pregunta antes de fotografiar, sobre todo a niños y ceremonias.' ],
        enlaces: [['La historia completa', H('mongolia-dukha-pastores-de-renos')]] },
      { h: 'Los cazadores con águila · Mongolia', min: '11:36', foto: ['aguila/W48', 'Un cazador kazajo en el festival.'], p: [
        'En los montes Altái, en el oeste de Mongolia, los kazajos de Bayan-Ölgii cazan zorros a caballo con águilas reales. Nadie sabe cuántos quedan: las cifras van de 60 a 250. Una niña, Aisholpan, abrió la tradición a las chicas.',
        '**Para ir:** el Festival del Águila Dorada es el primer fin de semana de octubre en Shar Nuur, a 15 km de Ölgii. Pide permiso antes de fotografiar a los cazadores y no pagues por posar con un águila.' ],
        enlaces: [['La historia completa', H('mongolia-cazadores-con-aguila-bayan-olgii')]] },
    ],
    cierre: 'Cada pueblo tiene su historia completa, con más datos, su ficha útil y sus fuentes.',
    nota: 'Datos de octubre y noviembre de 2026. Permisos, accesos y precios cambian: confírmalos en fuentes oficiales antes de ir. Estas son las fuentes de los diez episodios.',
    get fuentes() { return fuentes(); },
  },
];
