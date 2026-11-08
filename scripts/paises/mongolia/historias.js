// Historias del blog de mongolia (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

module.exports = [
  // Ep.9 Los dukha · guion y fuentes: docs/pueblos-ep9-dukha-guion-direccion.md · vídeo: salma marketing/pueblos/dukha/ULTIMA
  // Sin destino: no hay página de Mongolia en destinos/ (el generador quita el «Más sobre…»).
  {
    orden: 200,
    slug: 'mongolia-dukha-pastores-de-renos',
    fecha: '2026-11-02',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 9',
    pais: 'Mongolia',
    redes: { tituloYT: 'Los dukha: los pastores de renos de Mongolia · Khövsgöl', tituloTT: 'Dukha: el pueblo que vive con renos en Mongolia', hashtags: ['#mongolia', '#dukha', '#pueblosborradosdelmapa'] },
    titulo: 'Los dukha: los pastores de renos de Mongolia',
    resumen: 'En la taiga del norte de Mongolia, junto a Siberia, los dukha viven de sus renos: les dan leche, queso y transporte. Quedan unos doscientos, y cada vez más familias bajan de la taiga cuando sus hijos tienen que ir al colegio.',
    video: 'pueblos-ep9-dukha.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final), sonido de bosque con licencia libre y fuentes citadas. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/dukha',
    fotos: { portada: 'W4', galeria: [['W1', 'Montando en reno por la taiga nevada.'], ['W7', 'Una tienda dukha en el bosque.'], ['W12', 'Un reno cargado, en una foto antigua (colección KITLV).'], ['W20', 'Preparando una ceremonia (Taylor Weidman).'], ['W18', 'Un reno blanco en el campamento.'], ['W24', 'Un santuario en el paso de montaña.']] },
    cifras: [['208', 'Dukha en 2020'], ['1944', 'Se cierra la frontera con Tuva'], ['4-8 h', 'A caballo desde Tsagaannuur']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'W24',
      slides: [
        { foto: 'W24', h: 'Los pastores de renos', t: 'En la taiga del norte de Mongolia, junto a Siberia, los dukha viven de sus renos.', credito: ['Yaan', 'CC BY-SA 3.0'] },
        { foto: 'W1', h: 'El reno lo es casi todo', t: 'Les da leche, yogur y queso, se monta y lleva la carga. Las familias se mudan siguiendo los pastos.', credito: ['MN5', 'CC0'] },
        { foto: 'W7', h: 'Tiendas en el bosque', t: 'Viven en tiendas cónicas parecidas a un tipi, que se cubren con lona o con corteza.', credito: ['Bernard Gagnon', 'CC0'] },
        { foto: 'W10', h: 'Una frontera en medio', t: 'Vienen de Tuva. En 1944, cuando la Unión Soviética se la anexionó, la frontera se cerró y muchas familias quedaron separadas.', credito: ['anónimo (colección KITLV)', 'CC BY 4.0'] },
        { foto: 'W21', h: 'Lo que se está borrando', t: 'Eran 303 en el año 2000 y 208 en 2020. Muchas familias jóvenes bajan al pueblo cuando los hijos van al colegio.', credito: ['Taylor Weidman', 'CC BY-SA 3.0'] },
        { foto: 'W14', h: 'Los renos, también', t: 'La brucelosis diezmó los rebaños en 1990, y el cambio climático está reduciendo el liquen del que se alimentan.', credito: ['Bernard Gagnon', 'CC0'] },
        { foto: 'W18', h: 'Visitar con respeto', t: 'Desde Tsagaannuur, 4-8 horas a caballo y con permiso de frontera. Pregunta antes de fotografiar y llévate la basura.', credito: ['Bernard Gagnon', 'CC0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'Los que tienen renos', foto: ['W22', 'El valle de Darkhad, en la provincia de Khövsgöl.'], p: [
        'Los **dukha** viven en la taiga del norte de Mongolia, en el municipio de **Tsagaannuur** (provincia de Khövsgöl), junto a la frontera con Siberia. En mongol los llaman *tsaatan*, «los que tienen renos».',
        'Se reparten entre la Taiga Este y la Taiga Oeste. Su lengua, el dukha, es túrquica y está en peligro; casi todos hablan también mongol.' ] },
      { h: 'La vida con el reno', foto: ['W2', 'La manada con sus pastores.'], p: [
        'El reno lo es casi todo: da leche, yogur y queso, se monta y lleva la carga. Viven en tiendas cónicas parecidas a un tipi, que se cubren con lona o con corteza (una grande puede necesitar la de 32 árboles), y se mudan siguiendo los pastos.',
        'Practican el chamanismo, que estuvo perseguido durante el comunismo (1924-1992).' ] },
      { h: 'Una frontera en medio', foto: ['W10', 'Una familia ante su tienda, en una foto antigua (colección KITLV).'], p: [
        'Vienen de **Tuva**, al otro lado de la frontera. En **1944**, cuando la Unión Soviética se anexionó Tuva, la frontera se cerró y muchas familias quedaron separadas. En 1956 Mongolia les dio la nacionalidad y los asentó en Tsagaannuur.' ] },
      { h: 'Lo que se está borrando', foto: ['W21', 'Una chamana dukha (Taylor Weidman).'], p: [
        'Eran 303 en el año 2000, 282 en 2010 y **208 en 2020**. Cuando los hijos tienen edad de ir al colegio, muchas familias jóvenes bajan de la taiga al pueblo y ya no vuelven; en el bosque se quedan los abuelos.',
        'Las cifras de familias y de renos que dan las webs de viajes no coinciden entre sí, así que no damos ninguna.' ] },
      { h: 'Los renos, también', foto: ['W14', 'Un reno descansando en el campamento.'], p: [
        'En 1990 un brote de brucelosis diezmó los rebaños, y el cambio climático está reduciendo el liquen del que se alimentan. Desde mediados de los años noventa, el turismo les da un ingreso más.' ] },
    ],
    ficha: [
      '**Cómo llegar:** de Mörön a Tsagaannuur, 9-12 horas en coche por pistas; desde allí, 4-8 horas a caballo según dónde esté el campamento. La Taiga Este es más fácil para una primera visita.',
      '**Permiso:** hace falta un permiso de zona fronteriza; lo suelen tramitar los organizadores locales de Mörön o Tsagaannuur con los datos del pasaporte. Confírmalo antes de ir.',
      '**Respeto:** pregunta antes de fotografiar (sobre todo a niños y ceremonias), no vueles drones sin permiso, llévate la basura y no busques «autenticidad» en lo que no tienen: un móvil o un panel solar no les quita nada.',
    ],
    nota: 'Datos de noviembre de 2026 (guía de Unusual Nomad actualizada el 3 oct 2026); rutas, permisos y precios cambian, confírmalos antes de ir.',
    fuentes: [
      W('Wikipedia: Dukha people', 'https://en.wikipedia.org/wiki/Dukha_people'),
      W('Global Press Journal: la lucha por mantener el pastoreo de renos', 'https://globalpressjournal.com/asia/mongolia/one-woman-fighting-preserve-mongolias-last-reindeer-herding-culture/'),
      W('Unusual Nomad (oct 2026): cómo visitar a los tsaatan, permisos y costes', 'https://unusualnomad.com/?p=5772'),
      W('Sonido: bosque en invierno con viento suave, kyles, CC0', 'https://freesound.org/people/kyles/sounds/637566/'),
      W('Sonido: pájaros en Bourne Woods, Robert EA Harvey, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Birdsong_Bourne_Woods_2020-04-27_0722.mp3'),
    ],
    cierre: 'Próximo episodio, el último de la temporada: los cazadores con águila de Mongolia.',
  },
  // Ep.10 Los cazadores con águila (último de la temporada 1) · guion y fuentes: docs/pueblos-ep10-aguila-guion-direccion.md · vídeo: salma marketing/pueblos/aguila/ULTIMA
  // Sin destino: no hay página de Mongolia en destinos/. Portada elegida por Paco en el editor: la joven cazadora (W64).
  {
    orden: 210,
    slug: 'mongolia-cazadores-con-aguila-bayan-olgii',
    fecha: '2026-11-02',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 10',
    pais: 'Mongolia',
    redes: { tituloYT: 'Los cazadores con águila de Mongolia: cazan zorros con un águila real', tituloTT: 'Cazadores con águila: la tradición kazaja de Mongolia', hashtags: ['#mongolia', '#aguilareal', '#pueblosborradosdelmapa'] },
    titulo: 'Los cazadores con águila de Mongolia',
    resumen: 'En los montes Altái, en el oeste de Mongolia, los kazajos de Bayan-Ölgii cazan zorros a caballo con águilas reales. Nadie sabe cuántos quedan, y una niña, Aisholpan, abrió la tradición a las chicas.',
    video: 'pueblos-ep10-aguila.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final), sonido con licencia libre y fuentes citadas. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/aguila',
    fotos: { portada: 'W64', galeria: [['W48', 'Un cazador kazajo en el festival.'], ['W7', 'Tres cazadores con sus águilas en lo alto de una roca.'], ['W19', 'Cazadores cruzando el río.'], ['W54', 'Un cazador arrodillado junto a su águila.'], ['W69', 'Un cazador con su águila en Bayan-Ölgii.'], ['W66', 'Una joven cazadora con su águila.']] },
    cifras: [['¿60 o 250?', 'Cazadores con águila que quedan'], ['13 años', 'Aisholpan, al ganar el festival'], ['Octubre', 'Festival del Águila Dorada']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'W64',
      slides: [
        { foto: 'W64', h: 'Los cazadores con águila', t: 'En los montes Altái, en el oeste de Mongolia, los kazajos de Bayan-Ölgii cazan zorros a caballo con águilas reales.', credito: ['Bfreeproductions', 'CC BY-SA 4.0'] },
        { foto: 'W88', h: 'Los kazajos del Altái', t: 'Sus antepasados llegaron huyendo de la colectivización soviética del ganado y trajeron una tradición: cazar con águilas.', credito: ['Altaihunters', 'CC BY-SA 3.0'] },
        { foto: 'W5', h: 'Cazar con un águila real', t: 'Cazan en invierno, cuando el pelo del zorro destaca contra la nieve. Suelen usar hembras, más grandes que los machos.', credito: ['Gabideen', 'CC BY-SA 4.0'] },
        { foto: 'W17', h: '¿Cuántos quedan?', t: 'Nadie lo sabe con certeza. Unas fuentes hablan de unos 250 en Bayan-Ölgii; otra, de unos 60 en 2017.', credito: ['Gabideen', 'CC BY-SA 4.0'] },
        { foto: 'W66', h: 'Las chicas, también', t: 'En 2014, Aisholpan, de trece años, ganó el festival del Águila Dorada frente a decenas de hombres. Hoy más chicas compiten.', credito: ['Bfreeproductions', 'CC BY-SA 4.0'] },
        { foto: 'W20', h: 'El festival del Águila Dorada', t: 'El primer fin de semana de octubre, en Shar Nuur, a unos 15 km de Ölgii. Parte se ha convertido en espectáculo para turistas.', credito: ['Gabideen', 'CC BY-SA 4.0'] },
        { foto: 'W54', h: 'Visitar con respeto', t: 'Pide permiso antes de fotografiar a los cazadores y a sus águilas, y no pagues por posar con un águila para la foto.', credito: ['NuclearApples', 'CC BY-SA 4.0'], salida: 'Leer la historia completa' },
      ],
    },
    secciones: [
      { h: 'Los kazajos del Altái', foto: ['W88', 'El monte Tsambagarav, en los montes Altái.'], p: [
        'En la provincia de **Bayan-Ölgii**, en el extremo oeste de Mongolia, entre los montes Altái, vive la mayor parte de los unos 121.000 kazajos del país (2020). Hablan kazajo, lo escriben en cirílico y son mayoritariamente musulmanes.',
        'Sus antepasados llegaron huyendo de la **colectivización** soviética del ganado en Kazajistán, y trajeron consigo una tradición: cazar con águilas.' ] },
      { h: 'Cazar con un águila real', foto: ['W5', 'El águila vuelve al brazo del cazador.'], p: [
        'Los *berkutchi* cazan a caballo, con el águila real en el brazo, **zorros rojos, zorros corsac y liebres**. Lo hacen en invierno, cuando el pelo del zorro destaca contra la nieve.',
        'Suelen usar hembras, que en el águila real son más grandes que los machos. Tras unos años juntos (las fuentes hablan de seis a diez), la devuelven a la montaña para que críe.' ] },
      { h: '¿Cuántos quedan?', foto: ['W17', 'Una fila de cazadores a caballo por la estepa.'], p: [
        'Nadie lo sabe con certeza. Wikipedia y los operadores locales hablan de unos **250** en Bayan-Ölgii; otra fuente hablaba de «unos 60» en 2017; al festival acuden entre 60 y 100. Por eso no damos una cifra: la duda es parte de la historia.' ] },
      { h: 'Aisholpan', foto: ['W64', 'Una joven cazadora con el traje kazajo, dentro de la yurta.'], p: [
        'En **2014**, Aisholpan Nurgaiv, de trece años, ganó el festival del Águila Dorada frente a decenas de hombres. Fue la primera chica de su familia en doce generaciones en cazar con águila, y su historia se contó en el documental *The Eagle Huntress* (2016).',
        'Desde entonces, más chicas de la zona entrenan águilas y compiten. Algunas fuentes dan otra edad para Aisholpan (15 años); nos quedamos con la más citada.' ] },
      { h: 'El festival del Águila Dorada', foto: ['W20', 'Cazadores cruzando el río durante el festival.'], p: [
        'Lo organiza la Asociación Mongola de Cazadores con Águila cada **primer fin de semana de octubre**, en Shar Nuur, a unos 15 km de Ölgii. En 2026 fue el 3 y 4 de octubre. Hay pruebas de llamada del águila, desfiles con el traje tradicional y juegos a caballo.',
        'También tiene su debate: parte del festival se ha convertido en espectáculo para turistas. Hay otro más pequeño, en Sagsai.' ] },
    ],
    ficha: [
      '**Festival del Águila Dorada:** primer fin de semana de octubre en Shar Nuur, a 15 km de Ölgii (3-4 oct en 2026). Confirma las fechas cada año.',
      '**Cómo llegar:** Ölgii suele tener vuelos desde Ulán Bator; también se llega por carretera (varios días). Al festival se va con operadores locales. Confírmalo antes de ir.',
      '**Respeto:** pide permiso antes de fotografiar a los cazadores y a sus águilas, no te acerques a un águila sin que el cazador lo indique y no pagues por posar con un águila para la foto.',
    ],
    nota: 'Datos de noviembre de 2026; fechas del festival, vuelos y precios cambian, confírmalos antes de ir.',
    fuentes: [
      W('Wikipedia: Berkutchi', 'https://en.wikipedia.org/wiki/Berkutchi'),
      W('Wikipedia: Golden Eagle Festival', 'https://en.wikipedia.org/wiki/Golden_Eagle_Festival'),
      W('Wikipedia: Kazakhs in Mongolia', 'https://en.wikipedia.org/wiki/Kazakhs_in_Mongolia'),
      W('Tour2Mongolia: el festival del Águila Dorada 2026', 'https://tour2mongolia.com/travel-tips/golden-eagle-festival-of-mongolia-2026-ultimate-guide'),
      W('Responsible Travel: los cazadores con águila kazajos', 'https://www.responsibletravel.com/holidays/mongolia/travel-guide/kazakh-eagle-hunters'),
      W('Adelaide Review, 2019: Aisholpan, la cazadora', 'https://adelaidereview.com.au/latest/travel/2019/04/08/eagle-huntress'),
      W('Sonido: bosque en invierno con viento suave, kyles, CC0', 'https://freesound.org/people/kyles/sounds/637566/'),
    ],
    cierre: 'Fin de la temporada 1 de «Pueblos borrados del mapa». Volvemos con más pueblos.',
  },
];
