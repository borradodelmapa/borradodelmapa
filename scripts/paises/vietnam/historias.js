// Historias del blog de vietnam (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });
const H = (slug) => '/blog/viajes/' + slug;

module.exports = [
  {
    orden: 70,
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
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: '266',
      slides: [
        { foto: '266', h: 'Mil años de no rendirse', t: 'Un imperio ocupó el norte de Vietnam mil años y no consiguió borrarlo. Pagodas, estacas de hierro y un río.' },
        { foto: '236', h: 'La Pagoda del Pilar Único', t: 'Es de 1049 y se levanta sobre una sola columna, dentro de un estanque de Hanói.' },
        { foto: '156', h: 'La primera universidad', t: 'El Templo de la Literatura, en honor a Confucio. En 1076 se abrió allí la primera universidad del país. Valía el mérito.' },
        { foto: '342', h: '938: fin del dominio', t: 'Ngô Quyền clavó estacas de hierro bajo el río Bạch Đằng y esperó a la marea baja. Acababan mil años de dominio.' },
        { foto: '237', h: '1010: nace Thăng Long', t: 'La capital se trasladó a Thăng Long, la actual Hanói. Los mongoles invadieron tres veces y tres veces fueron rechazados.' },
        { foto: '259', h: '1428: fuera los Ming', t: 'En 1428, tras diez años de guerra, Lê Lợi expulsó a los Ming. En el norte, nadie lo olvida.' },
        { foto: '274', h: 'El norte, en moto', t: 'Recorrerlo en moto es la mejor forma de entenderlo. Y en un lago de Hanói hay un avión hundido: siguiente capítulo.', salida: 'Leer el capítulo completo' },
      ],
    },
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
    orden: 80,
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
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: '852',
      slides: [
        { foto: '852', h: 'La guerra de las fichas de dominó', t: 'Más de siete millones de toneladas de bombas sobre Indochina. Más del triple que EE. UU. en toda la Segunda Guerra Mundial.' },
        { foto: '870', h: '1954: el paralelo 17', t: 'Tras vencer a Francia en Điện Biên Phủ, el país se partió en dos, «temporalmente». Las elecciones prometidas nunca llegaron.' },
        { foto: '880', h: 'La teoría del dominó', t: 'Washington creía que si Vietnam caía del lado comunista, caería todo el sudeste asiático, como fichas de dominó.' },
        { foto: '866', h: 'Medio millón de soldados', t: 'Tras el incidente de Tonkín, hoy muy discutido, en 1965 llegaron los marines a Da Nang. En tres años eran más de medio millón.' },
        { foto: '858', h: 'Quảng Trị, bajo tierra', t: 'Se considera la provincia más bombardeada. Una décima parte de las municiones no explotó y sigue bajo la tierra.' },
        { foto: '140', h: 'El avión del lago', t: 'En diciembre de 1972, doce días de bombardeo sobre Hanói. Uno de los B-52 derribados cayó en un lago y allí sigue.' },
        { foto: '859', h: '1975: cae Saigón', t: 'Más de 58.000 estadounidenses muertos y, según las estimaciones, más de un millón de vietnamitas. Saigón cayó en 1975.', salida: 'Leer el capítulo completo' },
      ],
    },
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
    orden: 90,
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
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: '881',
      slides: [
        { foto: '881', h: 'Vivir bajo tierra', t: 'Cuando el cielo es del enemigo, se vive bajo tierra. Así fue la ruta Hồ Chí Minh. Y se siguió adelante.' },
        { foto: '860', h: 'De sendero a ruta', t: 'Empezó en 1959 como un sendero por las montañas de Trường Sơn. Luego llegaron los camiones y las bicicletas.' },
        { foto: '890', h: 'Bicicletas de 200 kilos', t: 'Iban cargadas con más de doscientos kilos. Las cifras vietnamitas hablan de más de un millón de toneladas de material.' },
        { foto: '812', h: 'Atacada y reparada', t: 'Según la placa del paso de Da Deo, la aviación estadounidense la atacó con enorme dureza de 1965 a 1972. Y la reparaban.' },
        { foto: '875', h: 'Un nombre', t: 'En la cueva de Hang I Ta, una placa recuerda a la enfermera Nguyen Thi Sang, que murió allí el 20 de junio de 1972.' },
        { foto: '874', h: '1968: la ofensiva del Tet', t: 'Golpeó más de cien ciudades del sur. Militarmente fue una derrota, pero cambió la opinión pública de Estados Unidos.' },
        { foto: '863', h: 'Mil años de práctica', t: 'No combatían solo contra un ejército: venían de un pueblo con mil años de práctica en no rendirse.', salida: 'Leer el capítulo completo' },
      ],
    },
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
    orden: 100,
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
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: '023',
      slides: [
        { foto: '023', h: 'De la guerra a socios', t: 'Hace cincuenta años se bombardeaban. En 2023, Estados Unidos y Vietnam se declararon socios estratégicos integrales.' },
        { foto: '049', h: '1986: Đổi Mới', t: 'Con la economía en crisis, Vietnam abrió la puerta a las reformas. Desde 1990, su renta por habitante se ha más que cuadruplicado.' },
        { foto: '001', h: 'Un partido único', t: 'Sigue siendo un país de partido único, con límites a la libertad que señalan las organizaciones de derechos humanos.' },
        { foto: '035', h: 'Confucio sigue aquí', t: 'El estudio como camino y el respeto al maestro. En PISA 2012, sus alumnos puntuaron como los de países mucho más ricos.' },
        { foto: '054', h: 'El Día del Maestro', t: 'Cada 20 de noviembre, los alumnos llevan flores a sus maestros. Recuerda al Wai Khru tailandés: el mismo respeto.' },
        { foto: '041', h: 'Mérito y memoria', t: 'Las fuentes muestran que se valora la educación y al maestro. No demuestran que hoy sea una meritocracia.', salida: 'Leer el capítulo completo' },
      ],
    },
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
    orden: 110,
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
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: '575',
      slides: [
        { foto: '575', h: 'El hombre de los billetes', t: 'Su cara está en los billetes, en las paredes y en un mausoleo. Hồ Chí Minh, una figura con luces y con sombras.' },
        { foto: '577', h: 'El regreso', t: 'Nació en 1890 en Nghệ An y pasó treinta años fuera. En 1941 volvió en secreto a una cueva de Cao Bằng, junto a China.' },
        { foto: '173', h: '2 de septiembre de 1945', t: 'En la plaza Ba Đình de Hanói leyó la declaración de independencia. Citaba la de Estados Unidos.' },
        { foto: '583', h: 'La reforma agraria', t: 'De 1953 a 1956 se acusó falsamente a muchos campesinos de terratenientes. Moise calcula unos 5.000 ejecutados; otros, muchos más.' },
        { foto: '548', h: 'Pidió perdón', t: 'En 1956 reconoció errores graves en público. Ese noviembre, el ejército aplastó una revuelta campesina en Nghệ An, su provincia.' },
        { foto: '189', h: 'La frase', t: '«Nada hay más valioso que la independencia y la libertad», dijo en 1966. Una meta que conviene recordar. Y medir.' },
        { foto: '164', h: 'El culto al «Tío Hồ»', t: 'Murió en 1969. Según varios relatos pidió ser incinerado; lo embalsamaron, y el Estado cuida hoy su culto.', salida: 'Leer el capítulo completo' },
      ],
    },
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
  // Largo 16:9 · montaje: salma marketing/india/motor/vietnam-largo-v2.cjs · minutos: vietnam/largo/capitulos-v2.txt · YouTube, jue 12 nov 2026 a las 15:30 (poner c.youtube cuando sea público)
  {
    orden: 115,
    slug: 'historia-de-vietnam-2000-anos-sin-rendirse',
    fecha: '2026-11-07',
    destino: ['vietnam', 'Vietnam'],
    serie: 'Vietnam',
    cap: 'Documental',
    pais: 'Vietnam',
    formato: '16:9',
    titulo: 'Historia de Vietnam: 2.000 años sin rendirse',
    resumen: 'La historia de Vietnam contada en moto, por los lugares donde ocurrió: China, los mongoles, los Ming, Francia, Japón, Estados Unidos y otra vez China. Todos entraron y todos acabaron marchándose.',
    video: 'vietnam-2000-anos-largo.mp4',
    realidad: 'Basado en un viaje real: las fotos y vídeos del recorrido son de Paco. La historia va con fotos, grabados y vídeos de archivo con licencia libre; las animaciones y recreaciones llevan rótulo. Autores y fuentes, al final de la página.',
    fotosDe: { '': 'salma marketing/vietnam/capitulos/vn.lst' },
    fotosArchivo: 'salma marketing/vietnam/largo/archivo',
    tiempos: 'salma marketing/vietnam/largo/salida/vietnam-largo-v2-tiempos.json',
    autores: { 'hcm-3': 'Tycho', 'hue68-3': 'W. A. Parks, USMC', 'hue68-5': 'J. T. Harlan, USMC', 'hue68-6': 'J. L. Harlan, USMC', 'hue68-1': 'USMC Archives', 'francia-8': 'M. Vuillier, según croquis de J. Locquart', 'guerra-12': 'R. W. Trewyn', 'guerra79-5': 'Adam Jones', 'guerra79-3': 'Viethavvh, Wikipedia en vietnamita', 'bachdang-2': 'Goodmorninghpvn, Wikipedia en vietnamita', 'bachdang-6': 'Autor desconocido, pueblo de Đông Hồ', 'lamson-10': 'Greg Willis', 'lamson-8': 'Rolf Müller', 'hue68-12': 'Gary Todd', 'hue68-15': 'Gary Todd', 'hue68-18': 'Gary Todd', 'francia-23': 'Gobierno de Vietnam', 'dienbien-11': 'Ejército Popular de Vietnam', 'dienbien-8': 'Naciones Unidas', 'guerra-13': 'U.S. Navy', 'guerra-14': 'U.S. Navy', 'linebacker-10': 'Robert LeRoy Knudsen', 'guerra-8': 'U.S. Marine Corps', 'guerra-3': 'U.S. Marine Corps' },
    creditosIntro: 'Las fotos y los vídeos del viaje son de Paco. El archivo viene de Wikimedia Commons y archive.org, con licencia libre. El clip de las hermanas Trưng y la imagen de portada parten de la ilustración de Phucam1999 y se comparten con la misma licencia. Gracias a sus autores:',
    creditosExtra: [
      ['Vídeo de archivo: Fuerza Aérea de EE. UU.', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:The_B52_Vietnam_1968.webm'],
      ['Vídeo de archivo: Ejército de EE. UU.', 'Dominio público', 'https://archive.org/details/LC-52426'],
      ['Vídeo de archivo: Armada de EE. UU.', 'Dominio público', 'https://archive.org/details/NPC-35118'],
      ['Bombardero en vuelo: Fuerza Aérea de EE. UU.', 'Dominio público', 'https://commons.wikimedia.org/wiki/File:B-52D(061127-F-1234S-017).jpg'],
    ],
    fotos: { portada: 'a/trung-8', posicion: '50% 22%', galeria: [
      ['613', 'La costa de Hạ Long, donde desemboca el Bạch Đằng.'],
      ['036', 'Un calígrafo en el Templo de la Literatura de Hanói.'],
      ['a/lamson-8', 'El lago Hoàn Kiếm, en Hanói, con la Torre de la Tortuga al fondo.'],
      ['a/hue68-12', 'La Ciudad Imperial de Huế.'],
      ['804', 'Plantaciones de té en el norte de Vietnam.'],
      ['a/hue68-6', 'Marines entrando en la ciudadela de Huế, en 1968.'],
    ] },
    cifras: [['2.000', 'Años de historia'], ['11', 'Capítulos'], ['12 min', 'De documental']],
    // Web Story (stories/<slug>/, scripts/build-stories.js, 8 nov 2026): 5-7 slides, una idea por slide, frases cortas. La última lleva al artículo.
    story: {
      portada: 'a/trung-8',
      slides: [
        { foto: 'a/trung-8', h: 'Vietnam: 2.000 años sin rendirse', t: 'China, los mongoles, Francia, Estados Unidos… Todos entraron y todos acabaron marchándose.', credito: ['Phucam1999', 'CC BY-SA 4.0'] },
        { foto: '156', h: 'Mil años bajo China', t: 'Los Han llegaron en el 111 a. C. En el año 40, las hermanas Trưng los expulsaron. Vietnam nunca entregó su lengua.' },
        { foto: 'a/bachdang-2', h: '938: la trampa del río', t: 'Ngô Quyền clavó estacas con punta de hierro en el Bạch Đằng. Al bajar la marea, la flota invasora se ensartó.' },
        { foto: 'a/mongol-5', h: 'Los mongoles, tres veces', t: 'Las tres tomaron la capital. Trần Hưng Đạo la vació y en 1288 la flota mongola cayó en las mismas estacas.' },
        { foto: 'a/dienbien-11', h: '1954: Điện Biên Phủ', t: 'Võ Nguyên Giáp subió artillería a las montañas. Tras casi dos meses de asedio, Francia se rindió.' },
        { foto: '146', h: 'Navidad de 1972', t: 'Once noches de bombas sobre Hanói. Los restos de un B-52 siguen en el lago Hữu Tiệp.' },
        { foto: '056', h: 'Vietnam hoy', t: 'Más de 102 millones de personas y 54 pueblos reconocidos. La historia entera, con fuentes, en el documental.', salida: 'Ver el documental' },
      ],
    },
    secciones: [
      { h: 'Linebacker: los bombardeos de Navidad', min: '0:00', foto: ['146', 'Los restos del B-52 en el lago Hữu Tiệp, en plena Hanói.'], p: [
        'En diciembre de 1972 se rompieron las negociaciones de paz de París y Nixon ordenó la **Operación Linebacker II**: once noches sobre Hanói y Hải Phòng, más de veinte mil toneladas de bombas, un hospital destruido y al menos **1.624 civiles muertos**.',
        'Vietnam respondió con cientos de misiles. Cayeron al menos quince B-52 según Estados Unidos y treinta y cuatro según Vietnam. Uno acabó en el lago Hữu Tiệp y sus restos siguen allí; las fuentes no coinciden en la noche, si la del 18 al 19 o la del 27 de diciembre. Un mes después se firmaron los acuerdos de París, casi iguales a lo pactado en octubre.' ],
        enlaces: [['La guerra de las fichas de dominó', H('vietnam-la-guerra-de-las-fichas-de-domino')], ['Hanói', '/destinos/hanoi-vietnam.html']] },
      { h: 'Hanói: mil años bajo China', min: '1:21', foto: ['156', 'El Templo de la Literatura, donde se abrió la primera universidad del país.'], p: [
        'La dinastía Han conquistó estas tierras en el año 111 antes de Cristo. China gobernó unos mil años, en cuatro etapas y con levantamientos entre medias. En el año 40 se alzaron dos hermanas, **Trưng Trắc y Trưng Nhị**: expulsaron a los gobernadores Han y Trưng Trắc reinó tres años, hasta que llegó el ejército de Ma Yuan. Hoy un distrito de Hanói lleva su nombre.',
        'Los Tang llamaron a esta tierra Annam, «el sur en calma», y trajeron escuelas confucianas, canales, administración y los caracteres chinos, que fueron la escritura oficial hasta los franceses. En 1076 se abrió en el **Templo de la Literatura** la primera universidad del país. Lo que Vietnam no entregó fue su lengua ni la idea de ser otro pueblo.' ],
        enlaces: [['Vietnam, mil años de no rendirse', H('vietnam-mil-anos-de-no-rendirse')], ['Hanói', '/destinos/hanoi-vietnam.html'], ['Guía de un día en Hanói', '/1-dia-en-hanoi-59zg']] },
      { h: 'Hạ Long: la trampa del río Bạch Đằng', min: '2:31', foto: ['a/bachdang-2', 'Campo de estacas en la desembocadura del Bạch Đằng.'], p: [
        'En el año 938, la flota de los Han del Sur subió por el Bạch Đằng al mando del príncipe Liu Hongcao. El general **Ngô Quyền** había clavado en el lecho del río grandes estacas de madera con punta de hierro, que no se veían con la marea alta. Sus barcas atrajeron a la flota río arriba y esperaron.',
        'Al bajar la marea, los barcos se ensartaron y el príncipe murió en el agua. Al año siguiente, Ngô Quyền se proclamó rey. Tres siglos y medio después, la misma trampa volvió a funcionar en el mismo río.' ],
        enlaces: [['Hạ Long', '/destinos/ha-long-vietnam.html']] },
      { h: 'La frontera: los mongoles', min: '3:23', foto: ['a/mongol-5', 'Estatua de Trần Hưng Đạo en la plaza Mê Linh.'], p: [
        'Entraron tres veces y las tres tomaron la capital. En 1258 mataron a sus habitantes y se fueron a los pocos días. En 1285 volvió el ejército de Kublai Kan, con su hijo Toghon al frente. El príncipe **Trần Hưng Đạo** se negó a rendirse: Vietnam vació la capital, Toghon entró en un palacio sin nadie y sin arroz, y el ejército invasor acabó expulsado.',
        'En 1287 volvieron mongoles, yurchen y chinos, hasta 170.000 hombres según las fuentes. En abril de 1288, en retirada, su flota llegó al Bạch Đằng y cayó en las estacas. El almirante Omar quedó prisionero y Toghon huyó por Lạng Sơn, herido de una flecha envenenada. Después de ganar, el rey envió a Kublai una estatua de oro y una disculpa, y siguió pagando tributo: era el precio de que no volviera.' ] },
      { h: 'Pù Luông: los Ming y Lê Lợi', min: '4:50', foto: ['342', 'Una noria de bambú en el norte de Vietnam.'], p: [
        'En 1407 la China Ming ocupó el país y quiso cambiarlo por dentro: prohibió los tatuajes y las faldas cortas, impuso su ropa y sus ritos y se llevó a Pekín a más de siete mil artesanos. Una crónica posterior cuenta que ordenó quemar los libros. Según algunas fuentes, un vietnamita capturado, Nguyễn An, acabó entre los constructores de la Ciudad Prohibida.',
        'En 1418 se levantó en Lam Sơn **Lê Lợi**, un jefe local de la provincia de Thanh Hóa, con Nguyễn Trãi como consejero. Tras diez años de guerra, en 1427 la columna de socorro Ming cayó en el paso de Chi Lăng. Lê Lợi dejó marchar al ejército y devolvió a los prisioneros. La leyenda dice que entregó su espada mágica a una tortuga gigante del lago Hoàn Kiếm. La tortuga es real: una se conserva en el templo del lago.' ],
        enlaces: [['Hanói', '/destinos/hanoi-vietnam.html']] },
      { h: 'Huế: Francia y el fin del imperio', min: '6:13', foto: ['a/francia-4', 'El emperador Hàm Nghi.'], p: [
        'Huế fue la capital de la última dinastía, los Nguyễn, desde 1802. Francia atacó Đà Nẵng en 1858, se quedó con el sur en 1862, hizo protectorado del norte y el centro en 1884 y creó la Indochina francesa en 1887. Pagó la colonia con tres monopolios, **opio, sal y alcohol**: estaba prohibido hacer vino de arroz en casa o recoger sal. También extendió el alfabeto latino, el que Vietnam usa hoy.',
        'En 1885 el emperador **Hàm Nghi**, de trece años, huyó de Huế y se convirtió en la bandera de la resistencia. Lo capturaron en 1888, lo exiliaron a Argelia y allí murió en 1944. Japón llegó en 1940. Entre 1944 y 1945, una hambruna en el norte mató a alrededor de un millón de personas según el historiador David Marr; otras cifras llegan a dos millones. El 25 de agosto de 1945 abdicó el último emperador, Bảo Đại.' ],
        enlaces: [['Huế', '/destinos/hue-vietnam.html']] },
      { h: 'Hồ Chí Minh y Điện Biên Phủ', min: '7:29', foto: ['a/dienbien-11', 'La victoria de Điện Biên Phủ, en 1954.'], p: [
        '**Hồ Chí Minh** nació en Nghệ An en 1890 y pasó treinta años fuera. En 1941 volvió en secreto a una cueva de Cao Bằng, junto a la frontera, y el 2 de septiembre de 1945 leyó en Hanói la declaración de independencia, que cita la de Estados Unidos. Francia volvió y empezó la guerra. En 1954, el general **Võ Nguyên Giáp** subió artillería pesada a las montañas que rodean Điện Biên Phủ y, tras casi dos meses de asedio, la guarnición se rindió.',
        'El héroe tiene otra cara. Entre 1953 y 1956, la reforma agraria del Norte acusó falsamente a muchos campesinos. El historiador Edwin Moise calcula unos cinco mil ejecutados; otros autores, muchos más. El propio Hồ Chí Minh pidió perdón en público.' ],
        enlaces: [['Hồ Chí Minh: el hombre de los billetes', H('vietnam-ho-chi-minh')]] },
      { h: 'Quảng Trị: la guerra', min: '8:29', foto: ['a/guerra-12', 'Aviones C-123 rociando Agente Naranja sobre la selva.'], p: [
        'En Ginebra, en 1954, el país se partió en dos por el paralelo 17, en Quảng Trị. Las elecciones prometidas nunca se celebraron. Washington temía que, si caía Vietnam, cayera todo el sudeste asiático como fichas de dominó. Tras el incidente del golfo de Tonkín, en 1964 y hoy muy discutido, los primeros marines llegaron a Đà Nẵng en 1965. En tres años eran más de medio millón.',
        'Sobre Indochina cayeron **más de siete millones de toneladas de bombas**, más del triple de las que Estados Unidos lanzó en toda la Segunda Guerra Mundial, y más de once millones de galones de Agente Naranja. Quảng Trị se considera la provincia más bombardeada, y una décima parte no explotó y sigue bajo tierra.',
        'Por la selva pasaba la ruta Hồ Chí Minh, que empezó en 1959 como un sendero y acabó con camiones y bicicletas cargadas con más de doscientos kilos. En Vịnh Mốc, los vecinos excavaron hasta unos treinta metros: unas sesenta familias vivieron allí y nacieron diecisiete niños. En la ofensiva del Tet, en 1968, un mes de combates arrasó Huế y murieron entre 5.800 y 8.000 civiles, más de dos mil ejecutados por las fuerzas norvietnamitas y el Vietcong.' ],
        enlaces: [['La ruta Hồ Chí Minh', H('vietnam-ruta-ho-chi-minh')], ['La guerra de las fichas de dominó', H('vietnam-la-guerra-de-las-fichas-de-domino')]] },
      { h: 'Vuelta al lago: el final', min: '10:18', foto: ['140', 'Lo que queda del bombardero, entre las casas de Hanói.'], p: [
        'En toda la guerra murieron más de 58.000 estadounidenses y, según las estimaciones, más de un millón de vietnamitas. En 1973 llegaron los acuerdos de París y el 30 de abril de 1975 cayó Saigón.' ] },
      { h: '1979: otra vez China', min: '10:42', foto: ['a/guerra79-5', 'Una fachada de Lạng Sơn con los daños de la guerra de 1979.'], p: [
        'En febrero de 1979, tras la invasión vietnamita de Camboya, China cruzó la frontera y tomó Lạng Sơn. Se retiró un mes después, destruyendo lo que encontraba. Las cifras de muertos siguen en disputa.' ] },
      { h: 'Vietnam hoy', min: '11:10', foto: ['056', 'Venta de flores en bicicleta, en Hanói.'], p: [
        'Hoy son más de 102 millones, con 54 pueblos reconocidos; los kinh son el 85 %. Con las reformas del Đổi Mới, de 1986, la renta por habitante se ha multiplicado por más de cuatro desde 1990. Sigue siendo un país de partido único, con límites a la libertad que señalan las organizaciones de derechos humanos. En 2023, Estados Unidos y Vietnam se declararon socios estratégicos integrales.' ],
        enlaces: [['Cómo son hoy', H('vietnam-como-son-hoy')], ['Vietnam', '/destinos/vietnam.html'], ['Guía de Vietnam en 14 días', '/vietnam-hanoi-phu-quoc-en-14-dias-q5c4']] },
    ],
    ficha: [
      '**Visado:** los españoles pueden entrar sin visado hasta 45 días, con pasaporte con al menos 6 meses de validez. Exención vigente hasta el 14 de marzo de 2028.',
      '**Lago Hữu Tiệp (Hanói):** los restos del B-52 se ven desde la calle.',
      '**Templo de la Literatura (Hanói):** abre de 8:00 a 17:00; algunas fuentes indican última entrada a las 16:30 y cambios en festivos.',
      'Datos de noviembre de 2026: confírmalos en fuentes oficiales antes de ir.',
    ],
    cierre: 'Cada parte tiene además su capítulo corto, con más datos: los enlaces están en cada apartado.',
    nota: 'Donde las fuentes discrepan (bajas, hambruna, reforma agraria, 1979) damos el rango o decimos que está en disputa.',
    get fuentes() {
      const vistas = new Set();
      return [
        W('Recomendaciones de viaje a Vietnam (Ministerio de Asuntos Exteriores de España)', 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Detalle-recomendaciones-de-viaje.aspx?trc=vietnam'),
        W('Operación Linebacker II (Wikipedia)', 'https://en.wikipedia.org/wiki/Operation_Linebacker_II'),
        W('El B-52 del lago Hữu Tiệp (Aviation Safety Network)', 'https://aviation-safety.net/wikibase/48405'),
        W('El B-52 del lago Hữu Tiệp (VietnamNet)', 'https://vietnamnet.vn/en/untold-stories-about-wreckage-of-a-b52-bomber-in-hanois-lake-666190.html'),
        W('Invasiones mongolas de Vietnam (Wikipedia)', 'https://en.wikipedia.org/wiki/Mongol_invasions_of_Vietnam'),
        W('Levantamiento de Lam Sơn (Wikipedia)', 'https://en.wikipedia.org/wiki/Lam_S%C6%A1n_uprising'),
        W('Lago Hoàn Kiếm (Wikipedia)', 'https://en.wikipedia.org/wiki/Hoan_Kiem_Lake'),
        W('Dinastía Nguyễn (Wikipedia)', 'https://en.wikipedia.org/wiki/Nguy%E1%BB%85n_dynasty'),
        W('Indochina francesa (Wikipedia)', 'https://en.wikipedia.org/wiki/French_Indochina'),
        W('Hambruna de 1944-1945 (Wikipedia)', 'https://en.wikipedia.org/wiki/Vietnamese_famine_of_1944%E2%80%931945'),
        W('Batalla de Điện Biên Phủ (Wikipedia)', 'https://en.wikipedia.org/wiki/Battle_of_Dien_Bien_Phu'),
        W('Batalla de Huế (Wikipedia)', 'https://en.wikipedia.org/wiki/Battle_of_Hu%E1%BA%BF'),
        W('Túneles de Vịnh Mốc (Wikipedia)', 'https://en.wikipedia.org/wiki/Vinh_Moc_tunnels'),
        W('Guerra chino-vietnamita (Wikipedia)', 'https://en.wikipedia.org/wiki/Sino-Vietnamese_War'),
        W('Demografía de Vietnam (Wikipedia)', 'https://en.wikipedia.org/wiki/Demographics_of_Vietnam'),
        ...module.exports.filter((e) => e.serie === 'Vietnam' && e.cap !== 'Documental').flatMap((e) => e.fuentes),
      ].filter((f) => !vistas.has(f.u) && vistas.add(f.u));
    },
  },
];
