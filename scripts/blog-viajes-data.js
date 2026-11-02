// Diarios de viaje del blog: un objeto por capítulo (mismo orden que los vídeos de la serie).
// Los textos salen de la voz de cada vídeo (salma marketing/*/cfg-*.json) y de docs/serie-asia-fuentes.md,
// docs/serie-vietnam-cap1.md, -cap2.md y -hilos.md. Dato nuevo = fuente anotada allí primero.
// El generador es scripts/build-blog-viajes.js (npm: node scripts/build-blog-viajes.js).

const SERIES = {
  'Tailandia en moto': { sub: 'Chiang Mai, el Triángulo de Oro, la carretera de las 762 curvas y el bucle de Mae Hong Son, en moto. Y un especial de Muay Thai en Ko Samui.' },
  'Vietnam': { sub: 'De mil años de resistencia a Hồ Chí Minh: cinco capítulos para entender el país antes de recorrerlo.' },
  'Pueblos borrados del mapa': { sub: 'Pueblos, oficios y costumbres que están desapareciendo, contados con datos y fuentes. Y cómo visitarlos con respeto.' },
};

const W = (t, u) => ({ t, u });

const caps = [
  {
    slug: 'tailandia-chiang-mai',
    cifras: [["1296","Año de fundación"],["1,5 km","De foso por lado"],["25 min","El casco, a pie"]],
    destino: ['chiang-mai-tailandia', 'Chiang Mai'],
    serie: 'Tailandia en moto',
    cap: 'Capítulo 1 de 5',
    titulo: 'Chiang Mai: la «ciudad nueva» de 1296',
    resumen: 'Una ciudad cuadrada, un foso y un plan tan ordenado que cuesta perderse. Alguien lo consiguió.',
    video: 'cp-asia-cap1-v5.mp4',
    fotosDe: { '': 'salma marketing/editor/listas/origen/chiang-mai-todo.lst' },
    fotos: { portada: '014', galeria: [['028', 'Uno de los templos del casco antiguo.'], ['026', 'Tejados de templo contra el cielo de Chiang Mai.'], ['027', 'Buda dorado en un templo del casco.'], ['039', 'Monjes junto al foso al atardecer.'], ['169', 'La noche, entre puestos y motos.'], ['188', 'La moto del viaje.']] },
    secciones: [
      { h: 'Una ciudad con plan', foto: ['148', 'El foso sigue marcando el cuadrado del casco antiguo.'], p: [
        'Chiang Mai tiene más de setecientos años de historia. La fundó el rey **Mangrai** en 1296 como capital de su reino, **Lan Na**, y la llamó «Ciudad Nueva». Siete siglos después sigue llamándose así.',
        'La trazó casi cuadrada, con un foso de kilómetro y medio por lado. Las murallas que se ven hoy están muy restauradas, así que no conviene presumir de «originales». Aun así, el trazado se entiende a la primera: una ciudad con plan, en la que hasta alguien con muy poco sentido de la orientación debería poder moverse.',
      ] },
      { h: 'Y aun así, alguien se perdió', foto: ['024', 'Calles del casco antiguo: imposible perderse. Casi.'], p: [
        'Para eso está Salma. Basta preguntar por un gimnasio de Muay Thai en el casco antiguo: te dice cómo llegar, cuánto cuesta cada transporte y que el casco se cruza andando en unos veinticinco minutos.',
        'Del idioma, este Paco no sabía ni «hola» y contestaba a todo el mundo en andaluz. Y funcionaba.',
      ] },
    ],
    ficha: [
      'No pites: el claxon trae mal karma.',
      'En los templos, hombros y rodillas tapados, y a nadie se le toca la cabeza.',
      'El songthaew rojo, la camioneta compartida, sale por unos 30 o 40 bahts dentro del casco. Pregunta el precio antes de subir.',
    ],
    fuentes: [
      W('Mangrai (Wikipedia)', 'https://en.wikipedia.org/wiki/Mangrai'),
      W('Mangrai (Britannica)', 'https://www.britannica.com/biography/Mangrai'),
      W('Reino de Lan Na (Wikipedia)', 'https://en.wikipedia.org/wiki/Lan_Na'),
      W('Puerta Tha Phae (Wikipedia)', 'https://en.wikipedia.org/wiki/Tha_Phae_Gate'),
    ],
    nota: 'Los precios del transporte son los que dio Salma en la app en octubre de 2026; cambian, pregunta siempre antes.',
    cierre: 'Esa semana, el viajero llegó a una frontera. Siguiente parada: el Triángulo de Oro.',
  },
  {
    slug: 'tailandia-triangulo-de-oro',
    cifras: [["3","Países en un río"],["1971","Nace el nombre"],["1997","Empieza el Templo Blanco"]],
    destino: ['chiang-rai-tailandia', 'Chiang Rai'],
    serie: 'Tailandia en moto',
    cap: 'Capítulo 2 de 5',
    titulo: 'El Triángulo de Oro, donde se tocan tres países',
    resumen: 'Donde el río Ruak se echa al Mekong y se juntan Tailandia, Laos y Birmania. Y un templo blanco que lleva casi treinta años sin terminarse.',
    video: 'cp-asia-cap2-v5.mp4',
    fotosDe: { '': 'salma marketing/editor/listas/origen/triangulo-oro.lst' },
    fotos: { portada: '63', galeria: [['13', 'El Templo Blanco, todavía sin terminar.'], ['47', 'El Buda dorado del Triángulo de Oro.'], ['34', 'La torre del reloj de Chiang Rai.'], ['06', 'Un templo dorado de camino.'], ['46', 'Altar a orillas del Mekong.'], ['65', 'El río, frontera de tres países.']] },
    secciones: [
      { h: 'Donde se juntan tres países', foto: ['55', 'El Mekong desde el lado tailandés.'], p: [
        'El Triángulo de Oro es el sitio donde el río **Ruak** desemboca en el **Mekong** y se tocan Tailandia, Laos y Birmania. En el siglo XX fue una de las mayores fuentes de opio del mundo, y el nombre lo popularizó un diplomático estadounidense, Marshall Green, en 1971, después de que lo adoptara la agencia antidrogas de Estados Unidos.',
        'Hoy, del lado tailandés, queda un museo del opio, un Buda dorado y mucha gente haciéndose fotos.',
      ] },
      { h: 'Antes, Chiang Rai y su templo blanco', foto: ['11', 'Wat Rong Khun, el Templo Blanco.'], p: [
        'De camino está **Wat Rong Khun**, el Templo Blanco. Su artista, Chalermchai Kositpipat, lo lleva construyendo desde 1997 (otras fuentes dicen 1996 o 1999) y todavía no lo ha terminado. Hay a quien le pasa lo mismo con la casa.',
      ] },
      { h: 'El viajero no cruzó', foto: ['66', 'El viajero, en el lado tailandés.'], p: [
        'Este Paco se quedó mirando Laos desde el lado tailandés, que es una forma muy cara de decir que no tenía visado.',
      ] },
    ],
    ficha: [
      'El puente de la Amistad sobre el Mekong no se cruza andando: hay un autobús lanzadera.',
      'Desde Chiang Rai salen autobuses locales hacia la frontera, unas dos horas.',
      'Ojo con las horas: el puente cierra por la noche y los autobuses paran antes.',
    ],
    fuentes: [
      W('El Triángulo de Oro (Wikipedia)', 'https://en.wikipedia.org/wiki/Golden_Triangle_(Southeast_Asia)'),
      W('Wat Rong Khun, Chalermchai Kositpipat (SPACES)', 'https://spacesarchives.org/explore/search-the-online-collection/chalermchai-kositpipat-wat-rong-khun-white-temple'),
      W('Wat Rong Khun (Amusing Planet)', 'https://www.amusingplanet.com/2013/02/wat-rong-khun-buddhist-temple-inspired.html'),
      W('Cruce Chiang Khong – Huay Xai (Hobo Maps)', 'https://hobomaps.com/TravelCKHX'),
    ],
    nota: 'Horarios y precios de la frontera no se dan aquí a propósito: las fuentes son antiguas y cambian. Compruébalos antes de ir.',
    cierre: 'Siguiente parada: la carretera a Pai.',
  },
  {
    slug: 'tailandia-carretera-a-pai',
    cifras: [["762","Curvas hasta Pai"],["100 km","De carretera"],["1.864","Curvas el bucle entero"]],
    destino: ['pai-tailandia', 'Pai'],
    serie: 'Tailandia en moto',
    cap: 'Capítulo 3 de 5',
    titulo: '762 curvas hasta Pai: la carretera 1095',
    resumen: 'Poco más de cien kilómetros de curvas, un valle pequeño y una calle peatonal llena de farolillos.',
    video: 'cp-asia-cap3-v5b.mp4',
    fotosDe: { '': 'salma marketing/editor/listas/origen/pai.lst' },
    fotos: { portada: '55', galeria: [['06', 'Más curvas, entre pinos.'], ['61', 'El valle desde un mirador.'], ['68', 'Farolillos al caer la noche.'], ['63', 'Parada para repostar.'], ['64', 'Atardecer junto a un Buda.'], ['56', 'Casco puesto, y a seguir.']] },
    secciones: [
      { h: 'La carretera', foto: ['05', 'Una de las 762 curvas.'], p: [
        'Entre Chiang Mai y Pai hay **762 curvas** (el bucle completo de Mae Hong Son suma 1.864). La carretera 1095 tiene poco más de cien kilómetros y, según algunas fuentes, la abrió el ejército japonés durante la Segunda Guerra Mundial. Es el dato que más se repite y el que menos fuentes tiene, así que lo contamos con esa cautela.',
        'El viajero la hizo en una moto de alquiler que no sabía lo que le esperaba.',
      ] },
      { h: 'Pai', foto: ['57', 'El cañón de Pai.'], p: [
        'Al final espera un valle pequeño, de unos tres mil vecinos, con herencia shan y tailandesa, y una calle peatonal que por la noche se llena de farolillos. Y el cañón de Pai, para quien quiera ver un precipicio con vistas.',
      ] },
      { h: 'Elegir ruta', foto: ['52', 'La moto de alquiler.'], p: [
        'Si dudas cuántos días dedicarle, basta preguntar a Salma: para el **Mae Hong Son Loop** salen cinco días, con mapa, paradas verificadas y consejos para ir en moto.',
      ] },
    ],
    ficha: [
      'Carné español más permiso internacional de conducción: sin él, el seguro no te cubre.',
      'Se conduce por la izquierda y el casco es obligatorio.',
      'Calzado cerrado, nada de chanclas.',
    ],
    fuentes: [
      W('Carretera 1095 (Wikipedia)', 'https://en.wikipedia.org/wiki/Highway_1095_(Thailand)'),
      W('Pai (Wikipedia)', 'https://en.wikipedia.org/wiki/Pai,_Thailand'),
      W('Mae Hong Son Loop (Lonely Planet)', 'https://www.lonelyplanet.com/articles/mae-hong-son-loop-thailand-road-trip'),
    ],
    nota: 'Lo del permiso internacional y el seguro es la respuesta que dio Salma en la app en octubre de 2026; confirma las condiciones de tu seguro.',
    cierre: 'A la mañana siguiente, el motorista cambió Pai por un pueblo chino en mitad de Tailandia.',
  },
  {
    slug: 'tailandia-ban-rak-thai',
    cifras: [["1949","Llegan los soldados"],["1996","Traslados forzosos"],["⅓","Desplazado en Kayah (ONG)"]],
    destino: ['tailandia', 'Tailandia'],
    serie: 'Tailandia en moto',
    cap: 'Capítulo 4 de 5',
    titulo: 'Ban Rak Thai y los kayan: un pueblo olvidado',
    resumen: 'Un pueblo de té y niebla que fundaron soldados chinos, y a pocos kilómetros otra frontera y otra historia.',
    video: 'cp-asia-cap4-v5.mp4',
    fotosDe: { 'c': 'salma marketing/editor/listas/origen/ban-rak-thai.lst', 'k': 'salma marketing/editor/listas/origen/kayan-canon-feb7.lst' },
    fotos: { portada: 'k10', galeria: [['c05', 'El lago de Ban Rak Thai.'], ['k16', 'Niebla de la mañana sobre el lago.'], ['c10', 'La calle principal del pueblo.'], ['c54', 'Casas de una aldea junto a la frontera.'], ['k49', 'Una mujer kayan junto a sus telas.'], ['c55', 'Cartel pidiendo donativos para la aldea.']] },
    secciones: [
      { h: 'Un pueblo chino en Tailandia', foto: ['k18', 'Ban Rak Thai: farolillos rojos sobre el lago.'], p: [
        '**Ban Rak Thai** es un pueblo de té y niebla que fundaron soldados chinos nacionalistas (del Kuomintang) que huían en 1949. Se quedaron a cambio de vigilar la frontera.',
      ] },
      { h: 'Se dice «kayan»', foto: ['k47', 'Una mujer kayan.'], p: [
        'Si alguna vez has oído «mujeres jirafa», olvídalo: es una forma despectiva de nombrar a un pueblo. Se llaman **kayan**. Rechazan también «padaung». No son una atracción: son un pueblo olvidado.',
        'Huyeron de la guerra en el este de Birmania. Según organizaciones de derechos humanos, desde 1996 el ejército forzó el traslado de aldeas enteras y hasta un tercio de la población del estado de Kayah quedó desplazada. Muchos siguen sin ciudadanía en ningún país.',
        'El viajero cruzó un poco la frontera para verlos. Tú no lo hagas: consulta antes las recomendaciones de viaje de tu país.',
      ] },
    ],
    ficha: [
      'Se dice kayan.',
      'Si visitas una aldea, la entrada ronda los 250 bahts y no siempre llega a ellos: pregunta adónde va.',
      'Pide permiso antes de fotografiar a nadie.',
    ],
    fuentes: [
      W('Chinos del Kuomintang en Tailandia (Wikipedia)', 'https://en.wikipedia.org/wiki/Kuomintang_Chinese_in_Thailand'),
      W('Ban Rak Thai (Legal Nomads)', 'https://www.legalnomads.com/ban-rak-thai/'),
      W('Los kayan como atracción turística (Frontier Myanmar)', 'https://www.frontiermyanmar.net/en/the-safest-way-generations-of-kayan-lahwi-find-security-as-a-tourist-attraction/'),
      W('Karenni Human Rights Group: traslados forzosos', 'https://khrg.org/node/1114'),
      W('Amnistía Internacional: informe sobre Birmania (1999)', 'https://www.amnesty.org/fr/wp-content/uploads/2021/06/asa160121999en.pdf'),
    ],
    nota: 'Las cifras de desplazados proceden de organizaciones de derechos humanos, no de datos oficiales.',
    cierre: 'Una pista para el siguiente capítulo: la persona a la que más se parece Salma se organiza muy bien. Cosa que a este Paco no se le da.',
  },
  {
    slug: 'tailandia-doi-inthanon',
    cifras: [["2.565 m","Doi Inthanon"],["300 THB","Entrada al parque"],["1.864","Curvas del bucle"]],
    destino: ['tailandia', 'Tailandia'],
    serie: 'Tailandia en moto',
    cap: 'Capítulo 5 de 5',
    titulo: 'Doi Inthanon, el techo de Tailandia',
    resumen: '1.864 curvas después, el bucle de Mae Hong Son se cierra. Y hay una camiseta que lo demuestra.',
    video: 'cp-asia-cap5-v5b.mp4',
    fotosDe: { '': 'salma marketing/editor/listas/origen/doi-inthanon-a.lst' },
    fotos: { portada: '41', galeria: [['02', 'La moto, en ruta.'], ['03', 'Valles del bucle de Mae Hong Son.'], ['37', 'Vachirathan, de cerca.'], ['58', 'Elefante en el santuario.'], ['17', 'Atardecer sobre el río.'], ['21', 'Orquídeas junto al río.']] },
    secciones: [
      { h: 'El último tramo del bucle', foto: ['32', 'La camiseta que lo demuestra: 1.864 curvas.'], p: [
        'En **Khun Yuam**, un museo guarda los restos del ejército japonés que cruzó por aquí hacia Birmania durante la Segunda Guerra Mundial. Allí hubo una base japonesa y el museo se abrió en 1995; la cifra de soldados varía según la fuente, así que no la damos.',
      ] },
      { h: 'El techo del país', foto: ['36', 'La cascada Vachirathan, a los pies del Doi Inthanon.'], p: [
        '**Doi Inthanon** mide 2.565 metros. Lleva el nombre del último rey de Chiang Mai, Inthawichayanon, y sus cenizas descansan en la cumbre. A sus pies cae la cascada Vachirathan.',
      ] },
      { h: 'Elefantes, pero de los buenos', foto: ['56', 'En un santuario de elefantes.'], p: [
        'Por el camino hay santuarios de elefantes. Los buenos son los que no permiten montarlos y no montan espectáculos. Eso es lo que hay que buscar.',
      ] },
    ],
    ficha: [
      'La entrada al parque de Doi Inthanon cuesta 300 bahts para extranjeros, más 30 por moto.',
      'Llena el depósito en Mae Hong Son: en la ruta a veces hay pocas gasolineras.',
      'Con los elefantes, huye de los paseos y de los espectáculos.',
    ],
    fuentes: [
      W('Aeródromo de Khun Yuam (Wikipedia)', 'https://en.wikipedia.org/wiki/Khun_Yuam_Airfield'),
      W('Museo de la Segunda Guerra Mundial, Mae Hong Son (Love Thailand)', 'https://www.lovethailand.org/travel/en/5-Mae-Hong-Son/655-World-War-II-Museum.html'),
      W('Doi Inthanon (Wikipedia)', 'https://en.wikipedia.org/wiki/Doi_Inthanon'),
    ],
    nota: 'El precio de la entrada y lo de las gasolineras es lo que contó Salma en la app en octubre de 2026. Los precios cambian.',
    cierre: 'Una semana después, un avión. Y una isla.',
  },
  {
    slug: 'tailandia-muay-thai-ko-samui',
    cifras: [["8","Extremidades"],["1767","Fecha de la leyenda"],["17 mar","Día Nacional"]],
    destino: ['tailandia', 'Tailandia'],
    serie: 'Tailandia en moto',
    cap: 'Especial',
    titulo: 'Muay Thai en Ko Samui: el saludo al maestro',
    resumen: 'Una luchadora alemana, un estadio y un ritual de oración antes de la primera pelea.',
    video: 'cp-muaythai.mp4',
    fotosDe: { '': 'salma marketing/editor/proyectos/muay-thai/drive.lst' }, fotosBase: 'D:/salma-movil/camara-canon/drive/',
    fotos: { portada: 'IMG_4212', galeria: [['IMG_4048', 'La oración antes de salir.'], ['IMG_4036', 'Vendaje antes de la pelea.'], ['IMG_4206', 'Entrada al ring.'], ['IMG_4238', 'El Wai Khru, paso a paso.'], ['IMG_4269', 'La pelea.'], ['IMG_4011', 'Ko Samui.']] },
    secciones: [
      { h: 'Antes de pelear, el Wai Khru', foto: ['IMG_4233', 'Lina, durante el Wai Khru Ram Muay.'], p: [
        'En Ko Samui, en el estadio **Phetch Buncha**, hay una luchadora profesional alemana, Lina. Antes de pelear hace el **Wai Khru Ram Muay**: *wai khru* es «saludo al maestro» y *ram muay* es una danza propia de cada gimnasio.',
        'Es una oración en movimiento. El luchador rodea el ring rezando en cada esquina, se inclina en el centro y honra a sus maestros, a sus padres y a sus antepasados. Lina lo conoce al detalle y lo hace con respeto. Y entonces sí, empieza la pelea.',
      ] },
      { h: 'De dónde viene el Muay Thai', foto: ['IMG_4253', 'Puños, codos, rodillas y piernas: las ocho extremidades.'], p: [
        'Nació como arte de guerra, entrenado por los soldados del antiguo Siam. Se peleaba con las manos vendadas con cuerda, sin guantes ni asaltos. Se le llama el «arte de las ocho extremidades» porque usa puños, codos, rodillas y piernas.',
        'La leyenda cuenta que en 1767, tras la caída de Ayutthaya, un prisionero llamado **Nai Khanom Tom** venció a diez luchadores birmanos seguidos y quedó libre. Es una leyenda: los historiadores la consideran probablemente del siglo XX, ligada a la identidad nacional, y cambian el nombre del rey y la cuenta de combates. El 17 de marzo se celebra el Día Nacional del Muay Thai.',
        'Las reglas modernas, con guantes, asaltos y árbitro, llegaron en los años treinta.',
      ] },
    ],
    ficha: [
      'En Samui hay veladas en Chaweng casi cada noche, desde las nueve.',
      'Llega pronto y siéntate frente al ring, no en diagonal.',
      'Respeta el deporte. Aprende su historia.',
    ],
    fuentes: [
      W('Wai khru ram muay (Wikipedia)', 'https://en.wikipedia.org/wiki/Wai_khru_ram_muay'),
      W('Qué es el Wai Kru Ram Muay (Muay Thai Records)', 'https://muaythairecords.com/guides/what-is-the-wai-kru-ram-muay-in-muay-thai'),
      W('Día Nacional del Muay Thai (Yokkao)', 'https://th.yokkao.com/blogs/news/national-muay-thai-day'),
      W('Nai Khanom Tom (Bernie Gourley)', 'https://berniegourley.com/tag/nai-khanomtom/'),
    ],
    nota: 'Lo de Nai Khanom Tom es leyenda, no historia documentada. Las veladas de Samui son lo que nos contaron en 2026; confirma el horario del día.',
    cierre: 'Este capítulo es para Lola, para cuando vayamos a Tailandia a pelear. Una semana después, Vietnam.',
  },
  {
    slug: 'vietnam-mil-anos-de-no-rendirse',
    cifras: [["1.000","Años bajo China"],["938","Bạch Đằng"],["1428","Fuera los Ming"]],
    destino: ['hanoi-vietnam', 'Hanói'],
    serie: 'Vietnam',
    cap: 'Capítulo 1 de 5',
    titulo: 'Vietnam, mil años de no rendirse',
    resumen: 'Un imperio ocupó el norte de Vietnam mil años y no consiguió borrarlo. Pagodas, estacas de hierro y un río que se repite.',
    video: 'cp-vietnam-cap1-v5.mp4',
    fotosDe: { '': 'salma marketing/vietnam/capitulos/vn.lst' },
    fotos: { portada: '245', galeria: [['237', 'Dentro de un templo de Hanói.'], ['274', 'Cocina en la calle.'], ['259', 'Agua para los arrozales.'], ['266', 'La bandera, en la selva.'], ['260', 'Flor de heliconia.'], ['146', 'El avión del lago: en el siguiente capítulo.']] },
    secciones: [
      { h: 'Hanói lo guarda en piedra', foto: ['236', 'La Pagoda del Pilar Único, en Hanói.'], p: [
        'En Hanói, dos edificios cuentan el país mejor que cualquier museo. La **Pagoda del Pilar Único**, de 1049, se levanta sobre una sola columna dentro de un estanque. Y el **Templo de la Literatura**, construido en honor a Confucio, donde en 1076 se abrió la primera universidad del país. Allí lo que valía era el mérito.',
      ] },
      { h: 'Mil años bajo China', foto: ['156', 'El Templo de la Literatura, donde se abrió la primera universidad del país.'], p: [
        'Desde el año 111 antes de Cristo, China gobernó el norte de lo que hoy es Vietnam. En el año 40 se alzaron dos hermanas, las **Trưng**. La rebelión duró tres años, pero la idea ya no se fue.',
      ] },
      { h: '938: estacas bajo el agua', foto: ['342', 'Una noria de bambú en el norte.'], p: [
        'En 938, el general **Ngô Quyền** clavó estacas de hierro bajo el río **Bạch Đằng**, esperó a que bajara la marea y la flota enemiga quedó atravesada. Acababan mil años de dominio.',
      ] },
      { h: 'Y no fue la última vez', foto: ['246', 'El norte de Vietnam, recorrido en moto.'], p: [
        'En 1010 la capital se trasladó a **Thăng Long**, la actual Hanói. Los mongoles invadieron tres veces y tres veces fueron rechazados; en 1288, con la misma trampa de estacas, en el mismo río. En 1428, **Lê Lợi** expulsó a los Ming tras diez años de guerra.',
        'Recorrer ese norte en moto, entre arrozales, es la mejor forma de entenderlo: aquí nadie olvida. Y en un lago de Hanói hay un avión hundido. Cómo llegó hasta allí, en el siguiente capítulo.',
      ] },
    ],
    ficha: null,
    fuentes: [
      W('Batalla de Bạch Đằng (938) (Wikipedia)', 'https://en.wikipedia.org/wiki/Battle_of_B%E1%BA%A1ch_%C4%90%E1%BA%B1ng_(938)'),
      W('Hermanas Trưng (Wikipedia)', 'https://en.wikipedia.org/wiki/Tr%C6%B0ng_sisters'),
      W('Edicto del traslado de la capital (Wikipedia)', 'https://en.wikipedia.org/wiki/Edict_on_the_Transfer_of_the_Capital'),
      W('Pagoda del Pilar Único (Wikipedia)', 'https://en.wikipedia.org/wiki/One_Pillar_Pagoda'),
      W('Templo de la Literatura de Hanói (Wikipedia)', 'https://en.wikipedia.org/wiki/Temple_of_Literature,_Hanoi'),
      W('Batalla de Bạch Đằng (1288) (Wikipedia)', 'https://en.wikipedia.org/wiki/Battle_of_B%E1%BA%A1ch_%C4%90%E1%BA%B1ng_(1288)'),
      W('Lê Lợi (Wikipedia)', 'https://en.wikipedia.org/wiki/L%C3%AA_L%E1%BB%A3i'),
    ],
    nota: 'Donde los historiadores discrepan (cifras de bajas, cómo murieron las Trưng, quién fundó la academia) no afirmamos nada.',
    cierre: null,
  },
  {
    slug: 'vietnam-la-guerra-de-las-fichas-de-domino',
    cifras: [["7 M+","Toneladas de bombas"],["17","Paralelo de la partición"],["1975","Cae Saigón"]],
    destino: ['phong-nha-vietnam', 'Phong Nha'],
    serie: 'Vietnam',
    cap: 'Capítulo 2 de 5',
    titulo: 'Vietnam: la guerra de las fichas de dominó',
    resumen: 'Más de siete millones de toneladas de bombas sobre Indochina. Los números ya pesan solos.',
    video: 'cp-vietnam-cap2-v5.mp4',
    fotosDe: { '': 'salma marketing/vietnam/capitulos/vn.lst' },
    fotos: { portada: '146', galeria: [['889', 'Las montañas de Trường Sơn.'], ['859', 'Cueva usada como refugio.'], ['867', 'Dentro de una cueva-refugio.'], ['880', 'La selva desde arriba.'], ['143', 'El lago del B-52.'], ['858', 'Restos de munición.']] },
    secciones: [
      { h: 'Cuánto pesa una guerra', foto: ['852', 'Proyectiles en un museo de la guerra.'], p: [
        'Más de siete millones de toneladas de bombas cayeron sobre Indochina, más del triple de las que Estados Unidos lanzó en toda la Segunda Guerra Mundial (las estimaciones van de 6,7 a 8 millones). No hace falta adornarlo.',
      ] },
      { h: 'Un país partido en dos', foto: ['870', 'El país en el mapa de un museo.'], p: [
        'En 1954, Vietnam derrotó a Francia en Điện Biên Phủ y el país se partió en dos por el **paralelo 17**, «temporalmente». Se prometieron elecciones para unirlo. Nunca se celebraron.',
        'Washington lo veía así: si Vietnam caía del lado comunista, caería todo el sudeste asiático, como fichas de dominó. Esa fue su razón; la contamos como su posición.',
      ] },
      { h: 'Del golfo de Tonkín a medio millón de soldados', foto: ['866', 'Un cañón antiaéreo en la selva.'], p: [
        'En 1964, un incidente en el golfo de Tonkín, hoy muy discutido, abrió la puerta. En 1965 desembarcaron los primeros marines en Da Nang; en tres años serían más de medio millón.',
        'Llegaron los aviones. **Quảng Trị** se considera la provincia más bombardeada: una décima parte de las municiones no explotó y sigue bajo la tierra. A eso se sumaron más de once millones de galones de Agente Naranja.',
      ] },
      { h: 'El avión del lago', foto: ['140', 'Los restos del B-52, todavía en el lago de Hanói.'], p: [
        'En diciembre de 1972, doce días de bombardeo sobre Hanói. Uno de los B-52 derribados cayó en un lago de la ciudad. Y allí sigue.',
        'Murieron más de 58.000 estadounidenses y, según las estimaciones, más de un millón de vietnamitas. En 1973, los acuerdos de París. El 30 de abril de 1975 cayó Saigón.',
      ] },
    ],
    ficha: null,
    fuentes: [
      W('Guerra de Vietnam: bajas (Wikipedia)', 'https://en.wikipedia.org/wiki/Vietnam_War_casualties'),
      W('Incidente del golfo de Tonkín (Wikipedia)', 'https://en.wikipedia.org/wiki/Gulf_of_Tonkin_incident'),
      W('Teoría del dominó (Wikipedia)', 'https://en.wikipedia.org/wiki/Domino_theory'),
      W('Agente Naranja (Wikipedia)', 'https://en.wikipedia.org/wiki/Agent_Orange'),
      W('Operación Linebacker II (Wikipedia)', 'https://en.wikipedia.org/wiki/Operation_Linebacker_II'),
    ],
    nota: 'Los muertos vietnamitas varían mucho según la fuente (entre 1 y 3,4 millones): decimos «más de un millón». Las fechas de los acuerdos de París y de la caída de Saigón son de conocimiento general y están pendientes de contrastar con fuente.',
    cierre: '¿Cómo se resiste así a una potencia? Siguiente capítulo: bajo tierra.',
  },
  {
    slug: 'vietnam-ruta-ho-chi-minh',
    cifras: [["1959","Nace la ruta"],["200 kg","Por bicicleta"],["1968","Ofensiva del Tet"]],
    destino: ['phong-nha-vietnam', 'Phong Nha'],
    serie: 'Vietnam',
    cap: 'Capítulo 3 de 5',
    titulo: 'La ruta Hồ Chí Minh: vivir bajo tierra',
    resumen: 'Cuando el cielo es del enemigo, se vive bajo tierra. Y se sigue adelante.',
    video: 'cp-vietnam-cap3-v5.mp4',
    fotosDe: { '': 'salma marketing/vietnam/capitulos/vn.lst' },
    fotos: { portada: '881', galeria: [['860', 'Un tramo del sendero.'], ['877', 'La selva de Trường Sơn.'], ['861', 'Bombas sin explotar, expuestas.'], ['865', 'Un cañón antiaéreo.'], ['863', 'Escaleras hacia una cueva.'], ['890', 'Montañas de la ruta.']] },
    secciones: [
      { h: 'Un sendero que se hizo ruta', foto: ['812', 'La placa del paso de Da Deo.'], p: [
        'La **ruta Hồ Chí Minh** empezó en 1959 como un sendero por las montañas de **Trường Sơn**. Luego fueron camiones y bicicletas cargadas con más de doscientos kilos. Las cifras vietnamitas hablan de más de un millón de toneladas de material.',
        'Según la placa del paso de Da Deo, la aviación estadounidense la atacó con enorme dureza entre 1965 y 1972. Y una y otra vez, la repararon.',
      ] },
      { h: 'Un nombre', foto: ['875', 'La placa de la cueva de Hang I Ta, kilómetro 18.'], p: [
        'Mujeres, jóvenes voluntarios y obreros la mantuvieron abierta. En la cueva de Hang I Ta, kilómetro 18, la placa recuerda a una enfermera, Nguyen Thi Sang, que murió allí el 20 de junio de 1972. Nos quedamos con su nombre.',
      ] },
      { h: 'Tet y mil años de práctica', foto: ['874', 'Recreación de la vida en una cueva de la ruta.'], p: [
        'En enero de 1968, la ofensiva del Tet golpeó más de cien ciudades del sur. Militarmente fue una derrota, pero cambió la opinión pública de Estados Unidos.',
        'Porque no combatían solo contra un ejército: venían de un pueblo con mil años de práctica en no rendirse. Lo hicieron con China, con los mongoles y aquí. Caminando por esa selva se entiende que no se puede someter a un pueblo que guarda tanta memoria.',
      ] },
    ],
    ficha: null,
    fuentes: [
      W('Ruta Hồ Chí Minh (Wikipedia)', 'https://en.wikipedia.org/wiki/Ho_Chi_Minh_trail'),
      W('Ofensiva del Tet (Wikipedia)', 'https://en.wikipedia.org/wiki/Tet_Offensive'),
    ],
    nota: 'Las cifras de material son las que dan las fuentes vietnamitas. Los nombres propios de la placa de Hang I Ta están escritos sin acentos y pendientes de contrastar.',
    cierre: 'Esa memoria explica a la gente de hoy. Siguiente capítulo: cómo son hoy los vietnamitas.',
  },
  {
    slug: 'vietnam-como-son-hoy',
    cifras: [["1986","Đổi Mới"],["×4","Renta por habitante desde 1990"],["20 nov","Día del Maestro"]],
    destino: ['vietnam', 'Vietnam'],
    serie: 'Vietnam',
    cap: 'Capítulo 4 de 5',
    titulo: 'Vietnam hoy: de la guerra a socios estratégicos',
    resumen: 'Hace cincuenta años se bombardeaban. En 2023 se declararon socios estratégicos integrales.',
    video: 'cp-vietnam-4.mp4',
    fotosDe: { '': 'salma marketing/vietnam/capitulos/vn.lst' },
    fotos: { portada: '023', galeria: [['001', 'Una calle del barrio antiguo.'], ['054', 'Fachadas de Hanói.'], ['055', 'El bún chả, un clásico.'], ['091', 'La calle del tren.'], ['063', 'Fruta en la calle.'], ['164', 'El mausoleo de Hồ Chí Minh.']] },
    secciones: [
      { h: 'Doi Moi', foto: ['049', 'Hanói hoy: motos hasta donde llega la vista.'], p: [
        'En 1986, con la economía en crisis, Vietnam abrió la puerta a las reformas del **Đổi Mới**. Desde 1990 su renta por habitante se ha multiplicado por más de cuatro. Sigue siendo un país de partido único, con límites a la libertad que señalan las organizaciones de derechos humanos. En 2023, Estados Unidos y Vietnam se declararon socios estratégicos integrales.',
      ] },
      { h: 'Confucio sigue aquí', foto: ['035', 'Un calígrafo en Hanói.'], p: [
        'Su herencia sigue viva: el estudio como camino y el respeto al maestro. En las pruebas PISA de 2012, sus estudiantes puntuaron como los de países mucho más ricos. Cada 20 de noviembre es el Día del Maestro y los alumnos les llevan flores.',
        'Es la misma idea que en un ring de Tailandia, el *Wai Khru*, el saludo al maestro. Culturas distintas, el mismo respeto. No decimos que venga de Confucio: señalamos el parecido.',
      ] },
      { h: 'Mérito y memoria', foto: ['041', 'Un lago en el centro de Hanói.'], p: [
        'Un pueblo que ha aprendido, siglo tras siglo, que el mérito y la memoria son lo único que nadie te puede quitar. Las fuentes muestran que se valora la educación y al maestro; no demuestran que hoy sea una meritocracia, y no lo afirmamos.',
      ] },
    ],
    ficha: null,
    fuentes: [
      W('Templo de la Literatura de Hanói (Wikipedia)', 'https://en.wikipedia.org/wiki/Temple_of_Literature,_Hanoi'),
      W('Đổi Mới (Wikipedia)', 'https://en.wikipedia.org/wiki/%C4%90%E1%BB%95i_M%E1%BB%9Bi'),
    ],
    nota: 'Los datos de renta, PISA y Día del Maestro proceden de las fuentes recogidas para la serie; el detalle está pendiente de enlazar.',
    cierre: 'Y hay un hombre que reúne todo esto. En el último capítulo: Hồ Chí Minh.',
  },
  {
    slug: 'vietnam-ho-chi-minh',
    cifras: [["1890","Nace en Nghệ An"],["1945","Declara la independencia"],["1969","Muere"]],
    destino: ['hanoi-vietnam', 'Hanói'],
    serie: 'Vietnam',
    cap: 'Capítulo 5 de 5',
    titulo: 'Hồ Chí Minh: el hombre de los billetes',
    resumen: 'Su cara está en los billetes, en las paredes y en un mausoleo. Una figura con luces y con sombras.',
    video: 'cp-vietnam-5.mp4',
    fotosDe: { '': 'salma marketing/vietnam/capitulos/vn.lst' },
    fotos: { portada: '575', galeria: [['173', 'La Torre de la Bandera de Hanói.'], ['165', 'La guardia del mausoleo.'], ['548', 'Una aldea del norte.'], ['584', 'Búfalos de vuelta a casa.'], ['480', 'Gansos cruzando la calle.'], ['804', 'Campos de té.']] },
    secciones: [
      { h: 'El regreso', foto: ['577', 'Las montañas del norte, cerca de la frontera con China.'], p: [
        'Nació en 1890 en Nghệ An y pasó treinta años fuera de su país. En 1941 volvió en secreto a una cueva de **Cao Bằng**, junto a la frontera con China. El 2 de septiembre de 1945, en la plaza Ba Đình de Hanói, leyó la declaración de independencia, que citaba la de Estados Unidos.',
      ] },
      { h: 'La parte difícil', foto: ['583', 'El campo del norte.'], p: [
        'Su objetivo declarado era la libertad. Pero entre 1953 y 1956, la reforma agraria del Norte clasificó a los campesinos por clases y a muchos se les acusó falsamente de terratenientes. El historiador Edwin Moise calcula unos cinco mil ejecutados; otros autores, muchos más.',
        'En 1956 el propio partido reconoció errores graves y Hồ Chí Minh pidió perdón en público: dijo que no había escuchado ni visto. Ese noviembre, el ejército aplastó una revuelta campesina en Nghệ An, su propia provincia, con entre mil y seis mil víctimas según las estimaciones.',
      ] },
      { h: 'La frase', foto: ['189', 'Su cara, en todos los billetes.'], p: [
        'En 1966 dijo la frase que todo niño vietnamita aprende: «Nada hay más valioso que la independencia y la libertad». Una meta que conviene recordar. Y medir.',
        'Murió el 2 de septiembre de 1969. Según varios relatos, pidió ser incinerado; sus sucesores lo embalsamaron, y el Estado cuida hoy el culto al «Tío Hồ».',
      ] },
      { h: 'Por qué funciona el símbolo', foto: ['164', 'El mausoleo de Hồ Chí Minh, en Hanói.'], p: [
        'Mil años de memoria, una ruta bajo las bombas, un pueblo que estudia. Y una idea que no se negocia: no nos vendemos. Esto fue Vietnam, entero y con respeto.',
      ] },
    ],
    ficha: null,
    fuentes: [
      W('Hồ Chí Minh (Wikipedia)', 'https://en.wikipedia.org/wiki/Ho_Chi_Minh'),
      W('Reforma agraria en Vietnam del Norte (Wikipedia)', 'https://en.wikipedia.org/wiki/Land_reform_in_North_Vietnam'),
    ],
    nota: 'Las cifras de la reforma agraria y de Nghệ An son estimaciones muy discutidas: damos el rango que citan los historiadores.',
    cierre: null,
  },

  // ─── Pueblos borrados del mapa (P12 de docs/video-checklist.md: un vídeo = una entrada) ───
  // Ep.1 Whang-Od · guion y fuentes: docs/pueblos-ep1-whang-od-guion-direccion.md · vídeo: salma marketing/pueblos/whang-od/ULTIMA
  {
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
    destino: ['filipinas', 'Filipinas'],
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
    destino: ['filipinas', 'Filipinas'],
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
  // Ep.3 Las haenyeo · guion y fuentes: docs/pueblos-ep3-haenyeo-guion-direccion.md · vídeo: salma marketing/pueblos/haenyeo/ULTIMA
  {
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
  // Ep.4 Los konyak · guion y fuentes: docs/pueblos-ep4-konyak-guion-direccion.md · vídeo: salma marketing/pueblos/konyak/ULTIMA
  // Sin destino: no hay página de la India en destinos/ (el generador quita el «Más sobre…»).
  {
    slug: 'india-konyak-ultimos-tatuados-nagaland',
    fecha: '2026-11-01',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 4',
    pais: 'India',
    redes: { tituloYT: 'Los konyak: los últimos guerreros con la cara tatuada · Nagaland, India', tituloTT: 'Konyak: las últimas caras tatuadas de la India', hashtags: ['#nagaland', '#konyak', '#pueblosborradosdelmapa'] },
    titulo: 'Los konyak: las últimas caras tatuadas de Nagaland',
    resumen: 'En Nagaland, en la frontera de la India con Birmania, los últimos guerreros konyak con la cara tatuada tienen entre ochenta y noventa y cinco años. Cuando se vayan, se irán las últimas caras que cuentan esa historia.',
    video: 'pueblos-ep4-konyak.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons (autores al final) y fuentes citadas. El sonido de ambiente es de licencia libre y no está grabado en Nagaland. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/konyak',
    fotos: { portada: 'W90', galeria: [['W90', 'Nyemwang Wanghu, uno de los últimos cazadores de cabezas tatuados.'], ['W52', 'El tatuaje del pecho, en Longwa.'], ['W62', 'La fiesta de Aoleang.'], ['W59', 'Un anciano konyak.'], ['W01', 'Mujeres konyak.'], ['W88', 'El paisaje de Longwa, en la frontera.']] },
    cita: { tras: 5, t: 'Todo cambió con la modernidad; nuestra cultura se muere', de: 'Bo Wang, 90 años, rey de Hongphoi (AFP, 2023)' },
    cifras: [['80-95', 'Años de los últimos tatuados'], ['1-6 abril', 'Fiesta de Aoleang'], ['2 países', 'En la casa del jefe de Longwa']],
    secciones: [
      { h: 'La tierra de los angh', foto: ['W91', 'Las colinas de Mon, en Nagaland.'], p: [
        'Los **konyak** son uno de los pueblos naga. La mayoría vive en el distrito de **Mon**, en el estado indio de **Nagaland**, al que llaman «la tierra de los *angh*», sus jefes tradicionales. También hay konyak en Arunachal Pradesh, en Assam y al otro lado de la frontera, en la Zona Naga de Birmania.' ] },
      { h: 'Caras que se ganaban en combate', foto: ['W51', 'Un anciano tatuado en Longwa.'], p: [
        'Durante siglos fueron **cazadores de cabezas**. Los tatuajes de la cara y del pecho no eran un adorno: se ganaban en combate y marcaban a un guerrero.',
        'Las fuentes no lo cuentan igual en el detalle. Según Wikipedia, el tatuaje de la cara se ganaba al cortar la cabeza de un enemigo; según Outlook Traveller, la cara marcaba haber combatido y el tatuaje del cuello, al verdadero cazador de cabezas.' ] },
      { h: 'El collar de latón', foto: ['W89', 'Colgante konyak de latón con cabezas, en el Museo Nacional de Delhi.'], p: [
        'Algunos ancianos llevan un collar con **cabecitas de latón**. Se dice que cada una recuerda a un enemigo; lo cuenta una sola fuente (Outlook Traveller), que además avisa de que hoy muchos lo llevan sin haber matado a nadie.' ] },
      { h: 'Por qué se acabó', foto: ['W14', 'Un cazador de cabezas konyak.'], p: [
        'Los konyak fueron el **último pueblo naga en hacerse cristiano**. Con los misioneros, la caza de cabezas se convirtió en tabú y dejaron de tatuarse la cara.',
        'Cuándo terminó exactamente se discute: unas fuentes dicen hace medio siglo, otras hace más de cuatro décadas, otras dan 1960 o 1969. Por eso no damos un año.' ] },
      { h: 'Longwa, una casa con frontera', foto: ['W87', 'Atardecer desde Longwa, mirando hacia Mon.'], p: [
        '**Longwa** es la aldea más grande del distrito de Mon y está justo en la frontera con Birmania. La línea pasa por dentro de la casa del *angh*: **una mitad está en la India y la otra en Birmania**. Las fuentes no coinciden en qué habitación cae en cada lado.',
        'Muchos blogs repiten que los vecinos tienen «doble nacionalidad». No es así: la Constitución india no la permite.' ] },
      { h: 'Lo que se está borrando', foto: ['W80', 'Un jefe konyak con su collar.'], p: [
        'Los últimos guerreros tatuados tienen hoy **entre ochenta y noventa y cinco años**. En 2023, la agencia AFP habló con varios de ellos, como Nokkho Konyak, de 90 años.',
        'La investigadora Phejin Konyak, con el fotógrafo Peter Bos, publicó un libro que retrata a los últimos tatuados antes de que se vayan.' ] },
      { h: 'La valla', foto: ['W88', 'Las montañas de la frontera, cerca de Longwa.'], p: [
        'En 2024, el Gobierno indio anunció el fin del régimen de libre movimiento con Birmania y una valla a lo largo de la frontera. Los konyak protestan: partiría en dos aldeas y familias que viven a los dos lados.' ] },
    ],
    ficha: [
      '**Fiesta de Aoleang:** del 1 al 6 de abril, la mayor fiesta de los konyak, en el distrito de Mon.',
      '**Permiso para extranjeros (PAP):** Nagaland lo volvió a exigir el 17 de diciembre de 2024 (se había levantado en 2021) y el Gobierno del estado pide quitarlo. Confírmalo justo antes de ir.',
      '**Respeto:** pide permiso antes de fotografiar a nadie; los tatuados son personas, no una atracción.',
    ],
    nota: 'Datos de noviembre de 2026; el permiso para extranjeros cambia a menudo, confírmalo con el Gobierno de Nagaland antes de ir.',
    fuentes: [
      W('Wikipedia: Konyak Naga', 'https://en.wikipedia.org/wiki/Konyak_Naga'),
      W('Outlook Traveller: los tatuajes de los konyak', 'https://www.outlooktraveller.com/experiences/heritage/ancestral-memories-tattoos-on-skin'),
      W('AFP en Kuwait Times, 5 jul 2023: los últimos cazadores de cabezas', 'https://kuwaittimes.com/indias-headhunter-warriors-sever-past-fret-over-future/'),
      W('Morung Express, mar 2024: los tatuados de Longwa', 'https://morungexpress.com/the-tattooed-headhunters-of-longwa-village'),
      W('Wikipedia: Lungwa', 'https://en.wikipedia.org/wiki/Lungwa'),
      W('Outlook Traveller: la casa con un pie en cada país', 'https://www.outlooktraveller.com/experiences/places-of-interest/this-house-in-nagaland-has-one-foot-in-india-and-another-in-myanmar'),
      W('EastMojo, 5 feb 2025: los konyak contra la valla', 'https://eastmojo.com/premium/2025/02/05/indigenous-rights-now-konyaks-protest-indo-myanmar-fencing/'),
      W('Morung Express: voces de Longwa contra la valla', 'https://morungexpress.com/voices-from-longwa-why-the-villagers-oppose-the-india-myanmar-border-fence'),
      W('Morung Express: el PAP vuelve a ser obligatorio', 'https://morungexpress.com/pap-mandatory-for-foreigners-in-nagaland'),
      W('The Week, 30 nov 2025: Nagaland pide quitar el PAP', 'https://www.theweek.in/wire-updates/national/2025/11/30/cal31-nl-rio-pap.html'),
      W('Sonido: viento en un pinar, W.carter, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'),
      W('Sonido: pájaros en Bourne Woods, Robert EA Harvey, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Birdsong_Bourne_Woods_2020-04-27_0722.mp3'),
    ],
    cierre: 'Próximo episodio: los moken, los nómadas del mar de Andamán.',
  },
  // Ep.5 Los moken · guion y fuentes: docs/pueblos-ep5-moken-guion-direccion.md · vídeo: salma marketing/pueblos/moken/ULTIMA
  {
    slug: 'tailandia-moken-nomadas-del-mar-surin',
    fecha: '2026-11-01',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 5',
    pais: 'Tailandia',
    redes: { tituloYT: 'Los moken: el pueblo que vivía en el mar · Islas Surin, Tailandia', tituloTT: 'Moken: los nómadas del mar de Tailandia', hashtags: ['#moken', '#tailandia', '#pueblosborradosdelmapa'] },
    titulo: 'Los moken: los nómadas del mar de Andamán',
    resumen: 'Durante siglos, los moken vivieron en barcas entre Tailandia y Birmania. En 2004 se salvaron del tsunami porque reconocieron la ola de sus leyendas. Hoy viven en un poblado fijo y el último kabang de Surin se construyó en 2006.',
    video: 'pueblos-ep5-moken.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con fotos de Wikimedia Commons, vídeos del tsunami con licencia libre (grabados en Ko Lanta, no en Surin) y sonido de Freesound (autores al final), con fuentes citadas. No es un viaje de Paco.',
    destino: ['tailandia', 'Tailandia'],
    creditosDe: 'salma marketing/pueblos/moken',
    fotos: { portada: 'W4', galeria: [['W25', 'Una anciana moken de Surin.'], ['W27', 'Un poblado moken cerca de Mergui, en Birmania (2004).'], ['W7', 'Una niña moken en Surin.'], ['W22', 'La costa del parque nacional de Surin.'], ['W16', 'El fondo marino de Surin.'], ['W18', 'La bahía de Chong Khad, en Surin.']] },
    cita: { tras: 3, t: 'La gran ola llevaba mucho tiempo sin comerse a nadie y quería volver a probar', de: 'Saleh Kalathalay, moken de Surin (CBS, 60 Minutes)' },
    cifras: [['×2', 'Agudeza bajo el agua de sus niños (2003)'], ['2006', 'El último kabang de Surin'], ['15 oct - 15 may', 'Temporada del parque']],
    secciones: [
      { h: 'Gente del mar', foto: ['W1', 'El poblado moken de Ao Bon Yai, en Surin (2025).'], p: [
        'Los **moken** son un pueblo austronesio del **archipiélago de Mergui**, unas 800 islas repartidas entre Birmania y Tailandia, y de las **islas Surin**. También viven en la costa tailandesa del mar de Andamán, de Ranong a Krabi. En Birmania los llaman *salone*; en Tailandia, *chao le*, «gente del mar».',
        'Tienen su propia lengua, y los intentos de Tailandia y Birmania por asimilarlos han tenido, según Wikipedia, muy poco éxito.' ] },
      { h: 'Una barca por casa', foto: ['W2', 'Un kabang en la playa de Surin, en 2006.'], p: [
        'En la estación seca vivían en el ***kabang***, una barca que era a la vez transporte, cocina, dormitorio y casa. Iban en grupos de dos a diez familias, de isla en isla, viviendo de lo que daban el mar y el bosque.',
        'El último *kabang* de Surin se construyó en **2006**. Desde 2018 hay un intento de recuperar su construcción.' ] },
      { h: 'Ver bajo el agua', foto: ['W3', 'Niños moken en Surin, en 2006.'], p: [
        'En 2003, un equipo de la Universidad de Lund publicó en *Current Biology* que los niños moken veían bajo el agua **aproximadamente el doble de bien** que los niños europeos. Al bucear estrechaban la pupila (1,96 mm frente a 2,50) y enfocaban al límite de lo que puede el ojo humano.',
        'No parece un don genético: un estudio de 2006 consiguió que niños europeos aprendieran a hacer lo mismo con entrenamiento. La propia investigadora, Anna Gislén, dudaba de que la generación actual lo conserve, porque los niños ya pasan mucho menos tiempo en el mar.' ] },
      { h: 'La ola que se come a la gente', foto: ['W17', 'Marea baja en una playa de Surin.'], p: [
        'El 26 de diciembre de 2004, antes de que llegara el tsunami, el mar se retiró de golpe. Los moken de Surin reconocieron la señal de sus leyendas, la ***laboon***, «la ola que se come a la gente», y subieron al monte.',
        'Cuántos murieron no está claro: unas fuentes dicen que ninguno, el *South China Morning Post* habla de uno y un reportaje de *Himal Southasian* pone en duda la versión de «ninguna víctima». Por eso no damos una cifra.',
        'Las imágenes del tsunami del vídeo no son de Surin: las grabaron Fabio Campo y Alberto Piccinini ese mismo día en Ko Lanta, unos 250 km al sur, en el mismo mar.' ] },
      { h: 'Lo que se está borrando', foto: ['W5', 'El poblado fijo sobre pilotes, dentro del parque nacional.'], p: [
        'Tras el tsunami, las autoridades del parque juntaron los dos poblados de Surin en uno, en la bahía de **Ao Bon Yai**. Hoy viven allí de forma fija, dentro del parque nacional, y sus niños pasan cada vez menos tiempo en el mar.',
        'Cuántos son tampoco está claro: las guías hablan de unas 300 personas en unas 70 casas, una encuesta de la Universidad de Chulalongkorn contó 362 en 2022 y un medio birmano habla de unos 400 en 2026.' ] },
      { h: 'Sin papeles', foto: ['W24', 'Una niña moken en Surin.'], p: [
        'En Tailandia, una parte de los moken de Surin sigue sin nacionalidad, por la lengua, el coste de los trámites y lo difícil que es viajar en el monzón. En Birmania, los avances para darles papeles se pararon con el golpe de Estado de 2021.' ] },
      { h: 'Visitar sin molestar', foto: ['W19', 'La bahía de Chong Khad, en el parque nacional de Surin.'], p: [
        'Hay quien llama al poblado de Surin «un zoo humano» por las excursiones que pasan por allí. Si vas, ve con calma, compra su artesanía y pregunta antes de hacer fotos: es su casa.' ] },
    ],
    ficha: [
      '**Parque nacional de Mu Ko Surin:** abre del 15 de octubre al 15 de mayo (temporada 2026/27: del 15 oct 2026 al 15 may 2027) y puede cerrar antes por el monzón. Desde el 15 de octubre de 2025 la entrada es electrónica: cómprala antes.',
      '**Cómo llegar:** en lancha desde Khura Buri o en excursión desde Khao Lak o Phuket; el poblado moken está en Ko Surin Tai.',
      '**Respeto:** no hay entrada al poblado, pero se agradece que compres su artesanía; sigue al guía del poblado y pide permiso antes de fotografiar a nadie.',
    ],
    nota: 'Datos de noviembre de 2026; fechas y entradas del parque cambian, confírmalas con el Departamento de Parques Nacionales de Tailandia antes de ir.',
    fuentes: [
      W('Wikipedia: Moken', 'https://en.wikipedia.org/wiki/Moken'),
      W('Gislén y otros, Current Biology 2003: visión bajo el agua (Universidad de Lund)', 'https://lup.lub.lu.se/search/publication/310971'),
      W('ScienceAlert: los niños moken y el entrenamiento de 2006', 'https://www.sciencealert.com/these-sea-nomad-children-can-see-underwater-like-dolphins'),
      W('CBS News, 60 Minutes: los moken y la laboon', 'https://www.cbsnews.com/news/sea-gypsies-saw-signs-in-the-waves/'),
      W('South China Morning Post: Troubled water', 'https://www.scmp.com/article/502345/troubled-water'),
      W('Himal Southasian: Riding the wave', 'https://himalmag.com/archives/riding-the-wave'),
      W('Chulalongkorn (CUSRI), 2022: los moken de Surin y la nacionalidad', 'https://cusri.chula.ac.th/?p=6777'),
      W('Cheva-Isarakul y Sperfeldt, Citizenship Studies 2023', 'https://researchers.mq.edu.au/en/publications/citizenship-and-statelessness-among-mobile-maritime-populations-t/'),
      W('Aeon: ¿hay que salvar a los moken de nuestra forma de vida?', 'https://aeon.co/essays/do-thailand-s-sea-gypsies-need-saving-from-our-way-of-life'),
      W('TAT News, 23 oct 2026: reapertura de los parques del Andamán', 'https://www.tatnews.org/2026/10/the-andaman-opens-its-doors-again/'),
      W('Vídeo: «2004 TSUNAMI Thailand (Ko Lanta)», Fabio Campo y Alberto Piccinini, CC BY', 'https://www.youtube.com/watch?v=6PrpsB5AuN8'),
      W('Vídeo: «The 2004 Indonesia Tsunami», simulación de NOAA, CC BY', 'https://www.youtube.com/watch?v=pOcq0S4qNB0'),
      W('Sonido: «Small Waves at the Beach», ultradust, CC BY 4.0', 'https://freesound.org/people/ultradust/sounds/165126/'),
      W('Sonido: «Korean island shore at night», rizzin, CC BY 3.0', 'https://freesound.org/people/rizzin/sounds/400791/'),
    ],
    cierre: 'Próximo episodio: los ainu, el pueblo indígena del norte de Japón.',
  },
  // Ep.6 Los sentineleses (el capítulo «por qué NO se visita») · guion y fuentes: docs/pueblos-ep6-sentineleses-guion-direccion.md · vídeo: salma marketing/pueblos/sentineleses/ULTIMA
  // Sin destino: no hay página de la India en destinos/. Ninguna imagen de sentineleses (excepción M15, aprobada por Paco).
  {
    slug: 'india-sentineleses-isla-que-no-se-visita',
    fecha: '2026-11-01',
    serie: 'Pueblos borrados del mapa',
    cap: 'Episodio 6',
    pais: 'las Andamán',
    redes: { tituloYT: 'Los sentineleses: la isla que no se visita · Andamán, India', tituloTT: 'Sentinel del Norte: la isla que no se visita', hashtags: ['#sentineleses', '#andaman', '#pueblosborradosdelmapa'] },
    titulo: 'Los sentineleses: la isla que no se visita',
    resumen: 'En la isla Sentinel del Norte, en las Andamán, vive un pueblo que no deja entrar a nadie. Nadie sabe cuántos son ni entiende su idioma, y tienen buenas razones para no querer visitas: nuestras enfermedades podrían acabar con ellos.',
    video: 'pueblos-ep6-sentineleses.mp4',
    realidad: 'Capítulo documental: lo cuenta Salma con imágenes de la isla vista desde lejos (Wikimedia Commons, autores al final), una foto antigua de otros andamaneses y fuentes citadas. No hay ninguna imagen de sentineleses: está prohibido fotografiarlos y no queremos hacerlo. No es un viaje de Paco.',
    creditosDe: 'salma marketing/pueblos/sentineleses',
    fotos: { portada: 'W9', galeria: [['W1', 'La isla por la ventanilla de un avión comercial.'], ['W10', 'Sentinel del Norte desde el satélite (NASA).'], ['W11', 'La isla desde la Estación Espacial Internacional.'], ['W6', 'El arrecife que rodea la isla.'], ['W18', 'Las islas Andamán desde el espacio.'], ['W15', 'Corbyn\'s Cove, una playa de Port Blair.']] },
    cifras: [['15-500', 'Estimaciones de cuántos son'], ['5.000 → 59', 'Gran andamaneses, del siglo XIX a 2020'], ['0', 'Visitas permitidas']],
    secciones: [
      { h: 'Una isla cerrada', foto: ['W10', 'Sentinel del Norte vista desde el satélite.'], p: [
        'La isla **Sentinel del Norte** mide unos 60 km² y está a unos 64 km al oeste de Port Blair, la capital de las islas **Andamán**, que pertenecen a la India. Sus habitantes, los **sentineleses**, rechazan cualquier contacto con el exterior.',
        'Su idioma no está descrito ni clasificado: nadie de fuera lo entiende, y no se parece al de los jarawa, sus vecinos más cercanos.' ] },
      { h: 'Lo que no sabemos', foto: ['W3', 'La playa y el arrecife, desde el aire.'], p: [
        'Nadie sabe cuántos son. Los recuentos se han hecho siempre desde lejos: 39 en 2001, 15 en 2011. El Anthropological Survey of India calculó entre 100 y 150 en 2016, y las estimaciones van de **15 a 500**.' ] },
      { h: '1880', foto: ['W13', 'Andamaneses pescando hacia 1870 (no son sentineleses).'], p: [
        'En 1880, una expedición británica dirigida por Maurice Vidal Portman desembarcó en la isla y se llevó a varios sentineleses a la fuerza. Enfermaron y algunos murieron. Las fuentes no coinciden en cuántos eran.',
        'Entre 1967 y 1991, el antropólogo indio T. N. Pandit dirigió expediciones para dejarles regalos. El 4 de enero de 1991 hubo el primer contacto pacífico conocido, y la antropóloga Madhumala Chattopadhyay fue la primera mujer en participar. Las visitas se dejaron a mediados de los noventa.' ] },
      { h: 'Por qué no', foto: ['W2', 'La costa de la isla desde lejos.'], p: [
        'El mayor peligro para ellos somos nosotros: no tienen defensas contra enfermedades que para nosotros son leves.',
        'Sus vecinos lo demuestran. Los **gran andamaneses** eran unos 5.000 a principios del siglo XIX; tras el contacto con los británicos llegaron la neumonía (1868), el sarampión (1877) y la gripe (1896). En 1901 quedaban 625, y en 2020, **59**.' ] },
      { h: 'Las flechas', foto: ['W7', 'La isla con el ala del avión: siempre desde lejos.'], p: [
        'Después del tsunami de 2004, un helicóptero de la Guardia Costera india fue a ver si estaban bien y le respondieron con flechas. El tsunami levantó el fondo marino un metro y medio y les secó las lagunas donde pescaban.',
        'En 2006 murieron dos pescadores cuya barca había derivado hasta la isla, y en noviembre de 2018, **John Allen Chau**, un misionero estadounidense de 26 años que desembarcó sin permiso. La India no recuperó su cuerpo.',
        'Para las puntas de flecha usan el hierro de los barcos que naufragan en su arrecife, como el *Primrose* en 1981.' ] },
      { h: 'Prohibido acercarse', foto: ['W12', 'Mapa de la isla Sentinel del Norte.'], p: [
        'La isla está protegida por la ley india y patrullada; está prohibido acercarse y fotografiar a sus habitantes. Las fuentes no coinciden en la distancia exacta (5 km o 3 millas náuticas).',
        'Aun así, el 29 de marzo de 2025 un youtuber estadounidense, Mykhailo Polyakov, desembarcó para dejarles una lata de refresco y un coco. No vio a nadie y lo detuvieron dos días después.' ] },
      { h: 'Si vas a las Andamán', foto: ['W15', 'Corbyn\'s Cove, una playa de Port Blair.'], p: [
        'Las Andamán sí se visitan: Port Blair, la isla de Swaraj Dweep (Havelock) y sus playas. **Sentinel del Norte, solo en el mapa.**',
        'Evita también los tours que pasan por la carretera de la reserva de los jarawa para «verlos»: Survival International los llama «safaris humanos» y pide no hacerlos.' ] },
    ],
    ficha: [
      '**Sentinel del Norte:** no se visita. Acercarse a la isla es ilegal en la India.',
      '**Islas Andamán:** se llega en avión a Port Blair desde Chennai, Calcuta o Delhi; desde allí, ferris a Swaraj Dweep (Havelock) y otras islas.',
      '**Jarawa:** no hagas tours para verlos por la carretera de su reserva.',
    ],
    nota: 'Datos de noviembre de 2026; las normas de las Andamán cambian, confírmalas con la Administración de las islas antes de ir.',
    fuentes: [
      W('Wikipedia: Sentinelese', 'https://en.wikipedia.org/wiki/Sentinelese'),
      W('Wikipedia: Great Andamanese', 'https://en.wikipedia.org/wiki/Great_Andamanese_peoples'),
      W('Down To Earth: las enfermedades de los andamaneses', 'https://www.downtoearth.org.in/news/embracing-disease-20643'),
      W('ScienceAlert: lo que sabemos de los sentineleses (2018)', 'https://www.sciencealert.com/here-s-what-we-know-about-the-isolated-tribe-that-reportedly-killed-a-26-year-old-american-tourist'),
      W('NBC News, nov 2018: John Allen Chau', 'https://www.nbcnews.com/news/world/american-killed-isolated-tribe-india-s-north-sentinel-island-police-n938826'),
      W('CBS News, abr 2025: detenido por llevar una lata a la isla', 'https://www.cbsnews.com/amp/news/us-tourist-remote-tribe-forbidden-north-sentinel-island-india'),
      W('NBC News, abr 2025: el youtuber sigue detenido', 'https://www.nbcnews.com/news/world/us-youtuber-remains-custody-india-visiting-restricted-island-diet-coke-rcna201838'),
      W('Survival International: los «safaris humanos» de los jarawa', 'https://www.survivalinternational.org/news/9008'),
      W('Sonido: «Small Waves at the Beach», ultradust, CC BY 4.0', 'https://freesound.org/people/ultradust/sounds/165126/'),
      W('Sonido: «Korean island shore at night», rizzin, CC BY 3.0', 'https://freesound.org/people/rizzin/sounds/400791/'),
      W('Sonido: viento en un pinar, W.carter, CC BY-SA 4.0', 'https://commons.wikimedia.org/wiki/File:Wind_in_Swedish_pine_forest_at_25_mps.ogg'),
    ],
    cierre: 'Próximo episodio: los ainu, el pueblo indígena del norte de Japón.',
  },
  // Ep.7 Los ainu · guion y fuentes: docs/pueblos-ep7-ainu-guion-direccion.md · vídeo: salma marketing/pueblos/ainu/ULTIMA
  // Sin destino: no hay página de Japón en destinos/ (el generador quita el «Más sobre…»).
  {
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
  // Ep.8 Los mosuo · guion y fuentes: docs/pueblos-ep8-mosuo-guion-direccion.md · vídeo: salma marketing/pueblos/mosuo/ULTIMA
  {
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
  // Ep.9 Los dukha · guion y fuentes: docs/pueblos-ep9-dukha-guion-direccion.md · vídeo: salma marketing/pueblos/dukha/ULTIMA
  // Sin destino: no hay página de Mongolia en destinos/ (el generador quita el «Más sobre…»).
  {
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
];
caps.SERIES = SERIES;
module.exports = caps;
