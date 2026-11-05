// Historias del blog de vietnam (una entrada por objeto). Las junta scripts/blog-viajes-data.js; «orden» = orden en el blog.
const W = (t, u) => ({ t, u });

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
];
