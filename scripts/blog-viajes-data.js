// Diarios de viaje del blog: un objeto por capítulo (mismo orden que los vídeos de la serie).
// Los textos salen de la voz de cada vídeo (salma marketing/*/cfg-*.json) y de docs/serie-asia-fuentes.md,
// docs/serie-vietnam-cap1.md, -cap2.md y -hilos.md. Dato nuevo = fuente anotada allí primero.
// El generador es scripts/build-blog-viajes.js (npm: node scripts/build-blog-viajes.js).

const SERIES = {
  'Tailandia en moto': { sub: 'Chiang Mai, el Triángulo de Oro, la carretera de las 762 curvas y el bucle de Mae Hong Son, en moto. Y un especial de Muay Thai en Ko Samui.' },
  'Vietnam': { sub: 'De mil años de resistencia a Hồ Chí Minh: cinco capítulos para entender el país antes de recorrerlo.' },
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
    secciones: [
      { h: 'Una ciudad con plan', p: [
        'Chiang Mai tiene más de setecientos años de historia. La fundó el rey **Mangrai** en 1296 como capital de su reino, **Lan Na**, y la llamó «Ciudad Nueva». Siete siglos después sigue llamándose así.',
        'La trazó casi cuadrada, con un foso de kilómetro y medio por lado. Las murallas que se ven hoy están muy restauradas, así que no conviene presumir de «originales». Aun así, el trazado se entiende a la primera: una ciudad con plan, en la que hasta alguien con muy poco sentido de la orientación debería poder moverse.',
      ] },
      { h: 'Y aun así, alguien se perdió', p: [
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
    secciones: [
      { h: 'Donde se juntan tres países', p: [
        'El Triángulo de Oro es el sitio donde el río **Ruak** desemboca en el **Mekong** y se tocan Tailandia, Laos y Birmania. En el siglo XX fue una de las mayores fuentes de opio del mundo, y el nombre lo popularizó un diplomático estadounidense, Marshall Green, en 1971, después de que lo adoptara la agencia antidrogas de Estados Unidos.',
        'Hoy, del lado tailandés, queda un museo del opio, un Buda dorado y mucha gente haciéndose fotos.',
      ] },
      { h: 'Antes, Chiang Rai y su templo blanco', p: [
        'De camino está **Wat Rong Khun**, el Templo Blanco. Su artista, Chalermchai Kositpipat, lo lleva construyendo desde 1997 (otras fuentes dicen 1996 o 1999) y todavía no lo ha terminado. Hay a quien le pasa lo mismo con la casa.',
      ] },
      { h: 'El viajero no cruzó', p: [
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
    secciones: [
      { h: 'La carretera', p: [
        'Entre Chiang Mai y Pai hay **762 curvas** (el bucle completo de Mae Hong Son suma 1.864). La carretera 1095 tiene poco más de cien kilómetros y, según algunas fuentes, la abrió el ejército japonés durante la Segunda Guerra Mundial. Es el dato que más se repite y el que menos fuentes tiene, así que lo contamos con esa cautela.',
        'El viajero la hizo en una moto de alquiler que no sabía lo que le esperaba.',
      ] },
      { h: 'Pai', p: [
        'Al final espera un valle pequeño, de unos tres mil vecinos, con herencia shan y tailandesa, y una calle peatonal que por la noche se llena de farolillos. Y el cañón de Pai, para quien quiera ver un precipicio con vistas.',
      ] },
      { h: 'Elegir ruta', p: [
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
    secciones: [
      { h: 'Un pueblo chino en Tailandia', p: [
        '**Ban Rak Thai** es un pueblo de té y niebla que fundaron soldados chinos nacionalistas (del Kuomintang) que huían en 1949. Se quedaron a cambio de vigilar la frontera.',
      ] },
      { h: 'Se dice «kayan»', p: [
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
    secciones: [
      { h: 'El último tramo del bucle', p: [
        'En **Khun Yuam**, un museo guarda los restos del ejército japonés que cruzó por aquí hacia Birmania durante la Segunda Guerra Mundial. Allí hubo una base japonesa y el museo se abrió en 1995; la cifra de soldados varía según la fuente, así que no la damos.',
      ] },
      { h: 'El techo del país', p: [
        '**Doi Inthanon** mide 2.565 metros. Lleva el nombre del último rey de Chiang Mai, Inthawichayanon, y sus cenizas descansan en la cumbre. A sus pies cae la cascada Vachirathan.',
      ] },
      { h: 'Elefantes, pero de los buenos', p: [
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
    secciones: [
      { h: 'Antes de pelear, el Wai Khru', p: [
        'En Ko Samui, en el estadio **Phetch Buncha**, hay una luchadora profesional alemana, Lina. Antes de pelear hace el **Wai Khru Ram Muay**: *wai khru* es «saludo al maestro» y *ram muay* es una danza propia de cada gimnasio.',
        'Es una oración en movimiento. El luchador rodea el ring rezando en cada esquina, se inclina en el centro y honra a sus maestros, a sus padres y a sus antepasados. Lina lo conoce al detalle y lo hace con respeto. Y entonces sí, empieza la pelea.',
      ] },
      { h: 'De dónde viene el Muay Thai', p: [
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
    secciones: [
      { h: 'Hanói lo guarda en piedra', p: [
        'En Hanói, dos edificios cuentan el país mejor que cualquier museo. La **Pagoda del Pilar Único**, de 1049, se levanta sobre una sola columna dentro de un estanque. Y el **Templo de la Literatura**, construido en honor a Confucio, donde en 1076 se abrió la primera universidad del país. Allí lo que valía era el mérito.',
      ] },
      { h: 'Mil años bajo China', p: [
        'Desde el año 111 antes de Cristo, China gobernó el norte de lo que hoy es Vietnam. En el año 40 se alzaron dos hermanas, las **Trưng**. La rebelión duró tres años, pero la idea ya no se fue.',
      ] },
      { h: '938: estacas bajo el agua', p: [
        'En 938, el general **Ngô Quyền** clavó estacas de hierro bajo el río **Bạch Đằng**, esperó a que bajara la marea y la flota enemiga quedó atravesada. Acababan mil años de dominio.',
      ] },
      { h: 'Y no fue la última vez', p: [
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
    secciones: [
      { h: 'Cuánto pesa una guerra', p: [
        'Más de siete millones de toneladas de bombas cayeron sobre Indochina, más del triple de las que Estados Unidos lanzó en toda la Segunda Guerra Mundial (las estimaciones van de 6,7 a 8 millones). No hace falta adornarlo.',
      ] },
      { h: 'Un país partido en dos', p: [
        'En 1954, Vietnam derrotó a Francia en Điện Biên Phủ y el país se partió en dos por el **paralelo 17**, «temporalmente». Se prometieron elecciones para unirlo. Nunca se celebraron.',
        'Washington lo veía así: si Vietnam caía del lado comunista, caería todo el sudeste asiático, como fichas de dominó. Esa fue su razón; la contamos como su posición.',
      ] },
      { h: 'Del golfo de Tonkín a medio millón de soldados', p: [
        'En 1964, un incidente en el golfo de Tonkín, hoy muy discutido, abrió la puerta. En 1965 desembarcaron los primeros marines en Da Nang; en tres años serían más de medio millón.',
        'Llegaron los aviones. **Quảng Trị** se considera la provincia más bombardeada: una décima parte de las municiones no explotó y sigue bajo la tierra. A eso se sumaron más de once millones de galones de Agente Naranja.',
      ] },
      { h: 'El avión del lago', p: [
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
    secciones: [
      { h: 'Un sendero que se hizo ruta', p: [
        'La **ruta Hồ Chí Minh** empezó en 1959 como un sendero por las montañas de **Trường Sơn**. Luego fueron camiones y bicicletas cargadas con más de doscientos kilos. Las cifras vietnamitas hablan de más de un millón de toneladas de material.',
        'Según la placa del paso de Da Deo, la aviación estadounidense la atacó con enorme dureza entre 1965 y 1972. Y una y otra vez, la repararon.',
      ] },
      { h: 'Un nombre', p: [
        'Mujeres, jóvenes voluntarios y obreros la mantuvieron abierta. En la cueva de Hang I Ta, kilómetro 18, la placa recuerda a una enfermera, Nguyen Thi Sang, que murió allí el 20 de junio de 1972. Nos quedamos con su nombre.',
      ] },
      { h: 'Tet y mil años de práctica', p: [
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
    secciones: [
      { h: 'Doi Moi', p: [
        'En 1986, con la economía en crisis, Vietnam abrió la puerta a las reformas del **Đổi Mới**. Desde 1990 su renta por habitante se ha multiplicado por más de cuatro. Sigue siendo un país de partido único, con límites a la libertad que señalan las organizaciones de derechos humanos. En 2023, Estados Unidos y Vietnam se declararon socios estratégicos integrales.',
      ] },
      { h: 'Confucio sigue aquí', p: [
        'Su herencia sigue viva: el estudio como camino y el respeto al maestro. En las pruebas PISA de 2012, sus estudiantes puntuaron como los de países mucho más ricos. Cada 20 de noviembre es el Día del Maestro y los alumnos les llevan flores.',
        'Es la misma idea que en un ring de Tailandia, el *Wai Khru*, el saludo al maestro. Culturas distintas, el mismo respeto. No decimos que venga de Confucio: señalamos el parecido.',
      ] },
      { h: 'Mérito y memoria', p: [
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
    secciones: [
      { h: 'El regreso', p: [
        'Nació en 1890 en Nghệ An y pasó treinta años fuera de su país. En 1941 volvió en secreto a una cueva de **Cao Bằng**, junto a la frontera con China. El 2 de septiembre de 1945, en la plaza Ba Đình de Hanói, leyó la declaración de independencia, que citaba la de Estados Unidos.',
      ] },
      { h: 'La parte difícil', p: [
        'Su objetivo declarado era la libertad. Pero entre 1953 y 1956, la reforma agraria del Norte clasificó a los campesinos por clases y a muchos se les acusó falsamente de terratenientes. El historiador Edwin Moise calcula unos cinco mil ejecutados; otros autores, muchos más.',
        'En 1956 el propio partido reconoció errores graves y Hồ Chí Minh pidió perdón en público: dijo que no había escuchado ni visto. Ese noviembre, el ejército aplastó una revuelta campesina en Nghệ An, su propia provincia, con entre mil y seis mil víctimas según las estimaciones.',
      ] },
      { h: 'La frase', p: [
        'En 1966 dijo la frase que todo niño vietnamita aprende: «Nada hay más valioso que la independencia y la libertad». Una meta que conviene recordar. Y medir.',
        'Murió el 2 de septiembre de 1969. Según varios relatos, pidió ser incinerado; sus sucesores lo embalsamaron, y el Estado cuida hoy el culto al «Tío Hồ».',
      ] },
      { h: 'Por qué funciona el símbolo', p: [
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
];
caps.SERIES = SERIES;
module.exports = caps;
