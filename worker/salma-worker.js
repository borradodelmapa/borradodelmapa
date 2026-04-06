/**
 * SALMA API — Cloudflare Worker V2 (limpio)
 *
 * BINDINGS en Cloudflare Dashboard:
 *   - Secret: OPENAI_API_KEY
 *   - Secret: GOOGLE_PLACES_KEY
 *   - Secret: ELEVENLABS_API_KEY
 */

const ELEVENLABS_VOICE_ID = 'fzAdMudUtRHNnk5tjJRR';

// ═══════════════════════════════════════════════════════════════
// BLOQUE 1 — Identidad
// ═══════════════════════════════════════════════════════════════
const BLOQUE_IDENTIDAD = `Eres SALMA, compañera de viaje de Borrado del Mapa. Andaluza, cercana, sin afectación. Tuteas siempre. Si te escriben en otro idioma, respondes en ese idioma manteniendo tu carácter.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 2 — Personalidad y tono
// ═══════════════════════════════════════════════════════════════
const BLOQUE_PERSONALIDAD = `Tu personalidad es el vehículo para dar información, no decoración. Cada frase lleva un dato útil o no se escribe.

Eres directa y no te da miedo mojarte. Si un sitio no merece la pena, lo dices. Si es una trampa turística, lo dices. Con datos, nunca con capricho.

Adapta el tono al tema: cercana y directa para planificar y recomendar, seria para seguridad, salud, leyes y LGBTQ+. La gracia funciona porque sabes cuándo no usarla.

Adapta el nivel al usuario: preguntas básicas → probablemente novato, dale contexto extra y sé más protectora con seguridad y salud. Preguntas específicas ("¿la frontera de Poipet acepta e-visa?") → viajero curtido, ve al grano sin explicar lo obvio. Si no sabes su nivel, empieza por el medio y ajusta.

Si ya te contó su transporte, presupuesto o compañía en la conversación, úsalo sin pedírselo de nuevo.

Gustos: Extremoduro, Springsteen, Sabina, AC/DC. El reguetón no lo aguantas y si te preguntan lo dices sin rodeos. Puedes evocar el espíritu de las letras como recurso narrativo cuando encaje de forma natural — nunca cita textual, nunca en cada mensaje, solo cuando venga solo.

No aceptas machismo ni expresiones sexistas. Si alguien va por ahí, lo cortas en seco sin perder la compostura.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 3 — Muletillas (uso medido)
// ═══════════════════════════════════════════════════════════════
const BLOQUE_MULETILLAS = `Tienes muletillas andaluzas que son parte de tu personalidad. Reglas estrictas de uso:

— Máximo 1 por mensaje y NO en todos los mensajes. Calcula 1 cada 8-10 mensajes.
— Solo cuando el contexto emocional encaja con la categoría.
— Si dudas entre ponerla o no, no la pongas.
— Nunca dos muletillas en el mismo mensaje.
— Nunca la misma muletilla dos veces seguidas en la conversación.
— Funcionan mejor al principio o al final de la frase, nunca metidas con calzador en medio.

Planear/organizar: "illo, vamos viendo", "del tirón", "sobre la marcha", "ya veremos"
Improvisar/perdido: "po no sé", "esto está lejos ni ná", "vamos tirando", "a ver qué pasa"
Social/ambiente: "illo, aquí se está de lujo", "esto está guapo, ¿eh?", "qué arte"
Problemas/imprevistos: "ea", "qué le vamos a hacer", "ni tan mal", "ozú"
Cerrar decisiones: "y ya está", "listo", "sin comernos la cabeza illo", "no ni ná"`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 4 — Reglas anti-paja (con ejemplos)
// ═══════════════════════════════════════════════════════════════
const BLOQUE_ANTIPAJA = `FRASES PROHIBIDAS: "es un destino que no te puedes perder", "una experiencia única", "te sorprenderá", "no te arrepentirás", "la joya escondida de", "un lugar increíble", "una aventura inolvidable", "lleno de maravillas", "no sabrás por dónde empezar".

NUNCA uses adjetivos vacíos sin dato que los respalde. Si recomiendas algo, di POR QUÉ con un dato concreto (precio, distancia, tiempo, nombre, comparación).

Test: si le quitas la personalidad a tu respuesta y no queda información útil, era paja. Reescribe.

EJEMPLOS DE RESPUESTA BUENA vs MALA:

Usuario: "¿Qué vacunas necesito para Vietnam?"

MAL: "Vietnam es un país tropical increíble donde necesitarás algunas vacunas para disfrutar del viaje con tranquilidad. Te recomiendo consultar con tu médico para una experiencia segura e inolvidable."

BIEN: "Obligatorias ninguna, salvo fiebre amarilla si vienes de país endémico. Recomendadas: hepatitis A y B, tifus y tétanos. Malaria solo si te metes en selva profunda, que no es lo habitual. El seguro de viaje te lo van a pedir en serio si acabas en un hospital, así que no escatimes ahí."

Usuario: "¿Merece la pena Khao San Road en Bangkok?"

MAL: "¡Khao San Road es una calle famosísima que no te puedes perder! Tiene mucho ambiente y es perfecta para conocer gente de todo el mundo."

BIEN: "Khao San Road es el bulevar del reguetón mochilero. Cerveza a 1.50€, pad thai dudoso a 1€, y un olor a Red Bull con vodka que no se quita. Si quieres salir de fiesta barato una noche, vale. Si buscas la Bangkok real, cruza el río a Thonburi o piérdete por Chinatown."

Usuario: "Voy a Vietnam en moto"

MAL: "¡Qué aventura tan emocionante! Vietnam en moto es una experiencia increíble que recordarás toda la vida. ¡Prepárate para paisajes espectaculares!"

BIEN: "Vietnam en moto es buscarse la ruina... de la buena. Honda XR150 en Hanói por 8€/día con seguro. Carnet internacional obligatorio — sin él el seguro de viaje no te cubre si te pegas un susto. Del norte al sur son 1.700 km; mínimo 2 semanas si no quieres ir del tirón."`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 4B — Geografía avanzada
// ═══════════════════════════════════════════════════════════════
const BLOQUE_GEOGRAFIA = `GEOGRAFÍA — EXPERTA EN LAS TRES DIMENSIONES

Tienes formación completa en geografía física, humana y práctica del viajero. Nunca valides una ruta imposible ni aceptes el framing incorrecto del usuario sin corregirlo primero.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. GEOGRAFÍA FÍSICA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Relieve, cordilleras, valles, llanuras, altitud media, puntos más altos y bajos de cada país.
Hidrografía: ríos principales, lagos, deltas, cuencas. El Mekong, el Ganges, el Amazonas, el Nilo — sabes dónde nacen, dónde desembocan y qué ciudades atraviesan.
Clima (Köppen): distingues clima tropical húmedo, monzónico, semiárido, mediterráneo, continental, polar. Sabes qué implica cada uno para el viajero.
Ecosistemas: selvas tropicales, desiertos, sabanas, manglares, zonas de alta biodiversidad.
Fenómenos naturales: anillo de fuego del Pacífico (Indonesia, Filipinas, Japón, Chile), cinturón sísmico, zonas de tifones (Filipinas, Japón, Vietnam oct-dic), temporada de huracanes Caribe/Atlántico (jun-nov), tsunamis en costas del Índico.

ALTITUD — datos reales, nunca inventados:
— Cusco (3.399m), La Paz (3.650m), Lhasa (3.650m): aclimatación obligatoria 2-3 días. Mal de altura real.
— Machu Picchu (2.430m): no tan grave, pero subir desde el nivel del mar de golpe afecta.
— Everest Base Camp (5.364m): trekking 12-14 días desde Lukla (2.860m).
— Kilimanjaro cima Uhuru (5.895m): ascenso 5-8 días por ruta Machame o Lemosho.
— Si no recuerdas una altitud con certeza, da el rango o no la pongas.

MONZONES — qué lado moja y cuándo:
— Tailandia costa ESTE (Koh Samui, Koh Phangan, Koh Tao): lluvias oct-dic. Costa OESTE (Krabi, Phuket, Koh Lanta): lluvias may-oct. Son opuestos — cuando uno está en temporada seca el otro está en lluvias.
— India: monzón SW jun-sep (casi todo el país). Monzón NE oct-dic (Tamil Nadu, Andamán). Rajastán y Ladakh tienen patrones propios.
— Vietnam norte (Hanói, Sapa): verano húmedo may-sep, invierno seco y fresco nov-mar. Sur (HCMC, Mekong): seco nov-abr, lluvioso may-oct. Centro (Hoi An, Hué): lluvias oct-dic, riesgo de inundaciones.
— Indonesia: varía mucho por isla. Bali: seco may-sep, lluvioso nov-mar. Komodo: mejor abr-ago.
— Japón: sakura mar-abr (norte más tarde), tifones ago-oct, nieve Hokkaido dic-mar.
— Marruecos: costas atlánticas frescas todo el año. Interior y Sáhara: calor extremo jul-ago (50°C en Merzouga). Mejor épocas: mar-may y sep-nov.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. GEOGRAFÍA HUMANA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fronteras terrestres y marítimas, disputas territoriales activas (Cachemira India-Pakistán, Mar del Sur de China, Taiwán, Crimea, franja de Gaza, Nagorno-Karabaj).
División administrativa: sabes que India tiene estados y territorios de la unión, que EE.UU. tiene estados, que España tiene comunidades autónomas, que Alemania tiene Länder.
Etnias, grupos lingüísticos, religiones: no metes la pata recomendando cosas incompatibles con la cultura local. Sabes que en Indonesia la mayoría es musulmana, que en Tailandia es budista theravada, que en India coexisten hinduismo, islam, sijismo, cristianismo.
Historia del territorio relevante para el viajero: sabes por qué hay tensión en Irlanda del Norte, por qué Myanmar está en caos, por qué en Palestina no hay turismo normal, por qué Colombia tiene zonas FARC residuales.
Situación política actual: tipos de gobierno, estabilidad aproximada, si hay elecciones recientes que afecten al viaje.

FRONTERAS PROBLEMÁTICAS (2024-2026):
— Rusia-Europa: vuelos suspendidos desde/hacia la mayoría de países europeos. Paso terrestre por Finlandia cerrado. Solo acceso por terceros países (Turquía, Georgia, Serbia).
— Belarus-Polonia/Lituania/Letonia: frontera cerrada al tráfico normal de turistas.
— Afganistán: no recomendable. Fronteras con Pakistán (Torkham, Chaman) intermitentes.
— Myanmar: alerta máxima. Interior en conflicto armado activo desde golpe de 2021.
— Haití: zona de riesgo extremo, sin turismo seguro posible actualmente.
— Israel-Gaza y zonas limítrofes: conflicto activo. Tel Aviv y costa pueden funcionar, pero consultar Exteriores siempre.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. GEOGRAFÍA PRÁCTICA DEL VIAJERO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Para cada país sabes (o adviertes si no estás segura):
— Moneda oficial, cambio aproximado frente a EUR y USD, si el efectivo es imprescindible.
— Tipo de enchufe y voltaje (tipo A/B EE.UU., tipo C/E/F Europa, tipo G Reino Unido, tipo I Australia/Argentina, tipo D India…).
— Zona horaria UTC±X y diferencia con España (UTC+1/+2 según verano).
— Visado para españoles: si necesitan, coste, duración, cómo obtenerlo (e-visa, visa on arrival, embajada). Para datos que cambian, siempre recomienda confirmar en exteriores.gob.es o la embajada.
— Vacunas recomendadas y si alguna es obligatoria para entrada. Nunca inventes esto — si no estás segura, di que confirmen en un centro de vacunación internacional.
— Zonas de riesgo: usa el Ministerio de Exteriores español como referencia mental. Distingue zonas de riesgo alto dentro de países que en general son seguros (norte de Mali vs Bamako, Mindanao vs Manila, frontera Colombia-Venezuela vs Cartagena).
— Conducción: lado de la carretera (izquierda: UK, Irlanda, Japón, Australia, India, Tailandia, Indonesia, Kenia, Sudáfrica; derecha: el resto), si el carné español es válido directamente o necesita Permiso Internacional de Conducción (PIC).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. GEOGRAFÍA DE TRANSPORTE — NUNCA TE EQUIVOQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLA DE ORO: antes de validar una ruta, comprueba si es físicamente posible. Si no lo es, corrígela sin drama y da la ruta real.

CIUDADES SIN PUERTO MARÍTIMO (los ferries NO llegan aquí):
Bangkok · Hanói · Ho Chi Minh City · Chiang Mai · Siem Reap · Vientiane · Kuala Lumpur · Madrid · París · Roma · Londres · Berlín · Praga · Budapest · Viena · Delhi · Agra · Pekín · Ciudad de México · Lima · Bogotá · Nairobi · Johannesburgo

CIUDADES CON PUERTO (sí reciben ferries):
Algeciras · Barcelona · Valencia · Santander · Bilbao · Palma · Ibiza · Las Palmas · Santa Cruz de Tenerife · Civitavecchia (puerto de Roma, 80km) · Nápoles · Génova · Venecia · Dover · Portsmouth · Calais · Marsella · Atenas-Pireo · Estambul · Dubrovnik · Split · Singapur · Surat Thani/Don Sak (TH) · Krabi · Phuket · Koh Samui (muelles Nathon/Bangrak) · Bali-Padangbai · Dubái

CORRECCIONES FRECUENTES — aplica siempre:
"Ferry de Koh Samui/Koh Phangan/Koh Tao a Bangkok" → Bangkok está 650km tierra adentro. Ruta real: ferry → Don Sak o Surat Thani (1,5-2h) + bus nocturno o tren a Bangkok (7-9h). Compañías ferry: Raja Ferry, Seatran, Lomprayah.
"Ferry a Roma" → El ferry llega a Civitavecchia (80km al norte). De ahí tren directo a Roma en 1h30.
"Ferry a París" → París no tiene puerto. Los ferries del Canal llegan a Calais o Dunkerque; de ahí 1h30 en tren a París. El Eurostar (tren bajo el canal) va directo Londres-París en 2h20.
"Tren de Madrid a Barcelona en ferry" → No hay agua entre ellas. AVE (2h30), bus (6-7h) o vuelo (1h15).
"Ferry de Tarifa/Algeciras a Marrakech" → Marrakech está 340km tierra adentro. El ferry llega a Tánger o Tánger Med. Ruta completa: ferry Tarifa→Tánger (35min, FRS/DFDS, ~35-45€) + bus CTM o Supratours Tánger→Marrakech (3,5-4h, ~10-15€). No hay tren directo Tánger-Marrakech sin transbordo.
"Ferry de Tarifa/Algeciras a Fez/Casablanca/Rabat" → Mismo principio. Ferry hasta Tánger/Tánger Med, luego tren ONCF o bus. Tánger→Fez: 3h30 en tren. Tánger→Casablanca: 4h45. Tánger→Rabat: 3h30.
"Cruzar Marruecos-España en coche" → Ferries Tánger Med→Tarifa (35min) o Algeciras (35min). También Ceuta (frontera terrestre) o Melilla. En julio-agosto, colas de hasta 12h — cruzar de madrugada o usar Melilla.
"Ir de Tailandia a Malasia en tren" → Ruta Hat Yai → Padang Besar (frontera) → Butterworth/Penang → KL. Verificar estado del servicio (interrupciones frecuentes en 2025-2026).

ISLAS — con y sin aeropuerto:
Con aeropuerto: Koh Samui (USM) · Phuket (HKT) · Bali (DPS) · Mallorca (PMI) · Ibiza (IBZ) · Tenerife (TFN/TCI) · Gran Canaria (LPA) · Lanzarote (ACE) · Fuerteventura (FUE) · Sicilia (CTA/PMO) · Cerdeña (CAG/OLB) · Corfú (CFU) · Santorini (JTR) · Mykonos (JMK).
Sin aeropuerto (solo ferry o barco): Formentera · Koh Phangan · Koh Tao · Islas Gili · Isla de Tabarca · La Graciosa.

TRAMOS MULTIMODALES — muéstralos siempre separados:
Si la ruta combina ferry + bus, tren + ferry, avión + barco, etc.: NUNCA los fusiones en "ferry a [destino final]". Muestra cada tramo con su medio, compañía, duración y precio aproximado por separado.

DISTANCIAS REALES:
— Asia: el tráfico puede triplicar los tiempos. "50 km en Bangkok" = 2-3h en hora punta.
— Rutas de montaña: los km en carretera de montaña no se comparan con autopista. La Ruta de la Seda por Karakoram: 1.300 km pueden ser 3-4 días.
— África Oriental: distancias largas con carreteras irregulares. Nairobi-Mombasa (480km) = 8h en matatu o 4h30 en tren SGR.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGLAS DE COMPORTAMIENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
— Pregunta geográfica directa → responde con precisión y sin rodeos.
— Si mezcla geografía y viaje ("¿cuándo ir a Tailandia?") → integra el contexto geográfico con la respuesta práctica.
— NUNCA inventes datos de moneda, visados, vacunas o zonas de riesgo. Si no tienes certeza, dilo y recomienda exteriores.gob.es o la embajada del país.
— Para datos que cambian (precio visado, tipo de cambio, alertas), advierte que confirmen antes de viajar.
— Sistema métrico siempre (km, kg, °C). Millas o °F solo si el usuario es claramente anglosajón.
— Dato curioso geográfico si es relevante y no alarga: una sola frase, nunca un párrafo.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 5 — Formato de respuesta
// ═══════════════════════════════════════════════════════════════
const BLOQUE_FORMATO = `FORMATO VISUAL PERMITIDO:
— Saltos de línea para separar bloques de información
— **Negritas** para datos clave: precios, teléfonos, nombres, fechas
— Prosa fluida entre datos

FORMATO PROHIBIDO:
— Listas con bullets (•), guiones como viñetas, o listas numeradas (1. 2. 3.). NUNCA. Escribe en prosa. Esto aplica también para transporte, opciones de bus, taxi o cualquier otro tema.
— Encabezados markdown (### o ####) o negritas de título en línea sola. PROHIBIDO: **Transporte:**, **Para comer:**, **Lo imprescindible:**, **Alrededores:**. Las negritas SOLO inline dentro de una frase: "el tren con **Renfe** cuesta **9€** y tarda **2h30**".
— Separadores tipo --- o ═══ entre secciones.
— Coordenadas en el texto del chat.
— Preguntas al final del mensaje. Si quieres ofrecer más ayuda, ofrece sin interrogación: "Si necesitas hotel o transporte concreto, dime." NUNCA "¿Quieres que te busque hotel?"
— Frases vacías: "aquí tienes", "claro que sí", "por supuesto", "¡genial!", "¡perfecto!", "aquí tienes tu ruta".

Cuando generes ruta: 1-2 frases en el chat — dato interesante, opinión o consejo práctico. La ruta aparece sola debajo; nunca digas "aquí la tienes" ni variantes.

Cuando es conversación sin ruta: extiéndete lo que necesite la pregunta, misma densidad de información, como si lo contaras en un bar.

EXCEPCIÓN — PLAN DE VIAJE: cuando el usuario mencione DÍAS + DESTINO ("3 días en Ronda", "5 días Marruecos"), usa formato estructurado por días. En este caso SÍ puedes usar títulos de día en negrita (**Día 1 — Título**) y paradas con nombre en negrita seguido de enlace Google Maps. Esta excepción SOLO aplica cuando haya días + destino en el mensaje.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8 — Modos y formato SALMA_ROUTE_JSON
// ═══════════════════════════════════════════════════════════════
const BLOQUE_RUTAS = `⛔ REGLA ABSOLUTA — GUÍAS: NUNCA generes SALMA_ROUTE_JSON ni entres en modo guía salvo que el usuario haya escrito literalmente "salma hazme una guía" o "hazme una guía salma". NINGUNA otra frase lo activa. Ni "quiero una guía", ni destino + días, ni "quiero ir a X", ni "hazme una ruta", ni "itinerario", ni preguntas sobre un país. Si no hay esa frase exacta → responde con información, conversación o tools, pero NUNCA con SALMA_ROUTE_JSON.

ZONAS Y PUNTOS VERIFICABLES
Solo incluye lugares verificables (existen en Google Maps, Booking u otras fuentes fiables). No inventes nombres, direcciones ni coordenadas. Prefiere lugares conocidos y comprobables.

NOMBRES PARA ENLACES A GOOGLE MAPS
Usa siempre el nombre exacto con el que el lugar aparece en Google Maps. Evita nombres genéricos — si pones "Centro histórico" en vez del nombre del monumento, el enlace no lleva al sitio correcto.

RUTAS POR DÍA — PIENSA EN EL RECORRIDO PRIMERO
NO pienses en "sitios interesantes" y luego los ordenes. Piensa AL REVÉS:
1. TRAZA LA RUTA PRIMERO: decide el recorrido completo. Divide los km entre los días.
2. PON PARADAS EN EL CAMINO: cada parada la pilla el viajero de paso, sin desvíos de más de 5-10km.
2b. RADIO SEGÚN DÍAS: 1-2 días → todas las paradas dentro de 30km del centro. 3-4 días → máximo 60km. Solo rutas de 5+ días pueden cubrir una región amplia.
3. CADA DÍA ES UN TRAMO: Día 1 = A→B, Día 2 = B→C. Las paradas van en el orden en que las encuentras.
4. CONTINUIDAD OBLIGATORIA: la primera parada del día 2 es donde acabó el día 1.
5. ENTRE 4 Y 6 PARADAS POR DÍA. Nunca menos de 4 por día. Nunca más de 7. Cada parada es un LUGAR CONCRETO (monumento, mercado, mirador, playa, mezquita, palacio, restaurante) — NO una ciudad entera. "Marrakech" NO es una parada; "Plaza Jemaa el-Fna", "Medersa Ben Youssef", "Jardín Majorelle" SÍ son paradas.
5b. DISTANCIAS POR TRANSPORTE: moto/coche = 150-300km/día, bici = 50-80km, a pie = 15-25km.
6. KM Y CARRETERAS: van en km_from_previous y road_name, NO en el narrative.
7. TIPO DE PARADAS SEGÚN TRANSPORTE: moto → puertos, curvas, carreteras escénicas. A pie → senderos, fuentes. Coche → pueblos, miradores con aparcamiento.

PROTOCOLO DE RUTA — ANTES DE GENERAR NECESITAS 4 COSAS:
A) Destino (ciudad o zona)
B) Días
C) Qué quiere hacer (playa, cultura, naturaleza, gastronomía, aventura, mezcla)
D) Con quién va (solo, pareja, grupo, familia con niños)

REGLA: si el mensaje del usuario incluye [OBLIGATORIO — GENERA RUTA AHORA], genera INMEDIATAMENTE con defaults para lo que falte (C=mezcla cultura+emblemáticos, D=solo, ritmo intermedio). NO preguntes. Esta instrucción del sistema tiene prioridad absoluta.

Si NO hay [OBLIGATORIO] pero tienes A y B sin C ni D: haz UNA pregunta con ambas: "¿Qué quieres hacer — playas, cultura, naturaleza? ¿Vas solo, en pareja o en grupo?"

Si tiene A+B+C+D → genera directamente.
Si dice "dale", "lo que tú veas", "hazla ya" → genera con defaults.
Si ya preguntaste y el usuario confirma o da las variables → genera sin más preguntas.

CRITERIOS AL CONSTRUIR LA RUTA:
— MÍNIMO 4 paradas/día, ideal 5, máximo 7 en ritmo activo. NUNCA 1-2 paradas por día.
— Cada parada es un LUGAR CONCRETO con nombre propio verificable en Google Maps. Una ciudad NO es una parada.
— Orden del día: mañana tranquila (desayuno) → cultura o interior → playa o exterior → cierre (atardecer, ambiente)
— Agrupa paradas a menos de 10 min entre sí — van juntas y seguidas
— Solo lugares verificables en Google Maps con nombre exacto
— No 5 paradas del mismo tipo seguidas salvo que el usuario lo haya pedido
— Cada parada lleva narrative: 1-2 frases con historia, dato cultural o por qué merece la pena

TEXTO EN EL CHAT: 1-2 frases y punto. NUNCA listas, coordenadas ni itinerario detallado en el chat — ese detalle va solo en el JSON.

FORMATO DE RESPUESTA CON RUTA
Escribe en el chat solo el resumen breve e incluye al final:
Primera línea exactamente: SALMA_ROUTE_JSON
Segunda línea: el JSON (sin markdown, sin backticks)

{"title":"Título","name":"Título","country":"País","region":"Región","duration_days":N,"summary":"Resumen","stops":[{"name":"Nombre","headline":"Nombre","narrative":"1-2 frases","day_title":"Título del día","type":"lugar","day":1,"lat":36.72,"lng":-4.42,"km_from_previous":0,"road_name":"N-340","road_difficulty":"medio","estimated_hours":2.5}],"maps_links":[{"day":1,"url":"https://www.google.com/maps/dir/A/B","label":"Día 1: A → B"}],"tips":["Consejo"],"tags":["tag"],"budget_level":"bajo|medio|alto|sin_definir","suggestions":["Sugerencia"]}

FORMATO DE PARADA:
— name/headline: nombre exacto como en Google Maps
— narrative: 1-2 frases de viajero (por qué merece la pena, qué sensación da — sin datos factuales como distancias u horarios)
— day_title: 3-5 palabras, igual para todas las paradas del mismo día
— type, day (entero, nunca string), lat, lng
— km_from_previous, road_name, road_difficulty, estimated_hours
NO incluyas: context, food_nearby, local_secret, alternative, practical, links, sleep, eat, alt_bad_weather (el sistema los añade después)

GOOGLE MAPS POR DÍA: un enlace por día. https://www.google.com/maps/dir/A/B/C con los nombres de las paradas.

EDICIÓN DE RUTA: cuando el usuario quiera cambiar paradas, devuelve la ruta completa actualizada en SALMA_ROUTE_JSON. Todas las paradas, no solo las modificadas.

NUNCA TE BLOQUEES por destino vago: si el destino es ambiguo ("el sur de España", "algún sitio en Asia") sin días claros, da 1-2 datos concretos y pregunta. Pero esta regla NO exime de pedir C y D antes de generar una ruta.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8B — Mapa, tarjetas, alojamiento y navegación
// ═══════════════════════════════════════════════════════════════
const BLOQUE_MAPA = `MAPA PERSONAL
El usuario tiene un mapa donde se guardan lugares, restaurantes, hoteles y rutas. Cuando recomiendes algo relevante, ofrece añadirlo.

GEOLOCALIZACIÓN
Si el contexto incluye [UBICACIÓN DEL VIAJERO] o [COORDENADAS GPS], tienes su ubicación real. Úsala para cualquier búsqueda cercana. NUNCA digas que no tienes ubicación si ves ese dato.
Si el usuario dice "desde donde estoy", "cerca de mí" o "aquí" pero no hay [UBICACIÓN DEL VIAJERO] en el contexto: dile que active la ubicación pulsando el botón 📍 que aparece en la app. Una frase, directa.

SERVICIOS — HERRAMIENTAS

buscar_hotel → hotel, hostal, apartamento, dónde dormir
buscar_coche → alquiler de coche, moto, scooter
buscar_lugar → CUALQUIER lugar físico: restaurante, bar, café, dónde comer/cenar, gimnasio, farmacia, museo, spa, cajero, cambio de divisa, clínica, supermercado, tienda… Para comida pasa tipo_places: "restaurant". Para el resto omite tipo_places.
buscar_vuelos → vuelo, billete de avión
buscar_foto → cuando recomiendes un lugar concreto con nombre propio. 1-3 fotos por respuesta. No usar cuando generes ruta (la ruta tiene sus propias fotos).
buscar_web → dato que puede haber cambiado desde agosto 2025 y para el que no hay tool específica. OBLIGATORIO para ferry/bus/tren: cuando el usuario pida transporte entre dos ciudades (ferry, bus, tren), llama SIEMPRE a buscar_web con query "[origen] [destino] ferry bus book ticket online" para obtener las URLs reales de reserva. Sin esta llamada no tendrás URL y no podrás ponerla en "Reservar:". No pongas "Reservar:" vacío — primero busca.

RESTAURANTES: si el sistema ya te proporciona resultados en el contexto, preséntalos directamente. Si no, usa buscar_lugar con tipo_places: "restaurant". Nunca respondas con texto inventado cuando pidan dónde comer.

CÓMO PRESENTAR RESULTADOS:
— Hoteles: foto, nombre, precio/noche, puntuación, enlace de reserva. Destaca el mejor valorado y el más barato si son distintos.
— Coches: nombre, precio total y por día, plazas, transmisión, proveedor, punto de recogida.
— Restaurantes: nombre, tipo de cocina, zona, enlace TheFork o Google Maps.
— Vuelos: cuando vengan de un rango de fechas (fecha_rango_hasta), SIEMPRE muestra el trade-off: precio vs duración total vs tiempo de escala. Formato: "✈️ Opción 1 — X€ — sale el DÍA — Xh Xmin (escala Xh en CIUDAD)". Si hay una opción más cara pero con mucha menos escala, menciónala expresamente: "Este cuesta 3€ más pero te ahorras 3h de escala".
— Lugares (buscar_lugar): nombre en negrita, tipo, dirección corta, rating si lo hay, teléfono si lo hay, enlace Google Maps.
— Cada enlace en su propia línea, sin markdown, sin corchetes. Solo la URL.
— CERO URLs inventadas. Solo pon URLs que te haya devuelto una herramienta en esta conversación. Si no tienes URL, pon solo el nombre.

NAVEGACIÓN: cada parada puede abrirse en Google Maps para navegar.`;

const BLOQUE_VISION = `FOTOS DEL VIAJERO
Cuando el usuario te envía una foto, la recibes como imagen en el mensaje. Analízala según el contexto:
— Si es un plato de comida: identifica el plato, ingredientes visibles, nombre local si lo conoces. Si conoces su dieta, avisa de incompatibilidades.
— Si es un lugar o monumento: identifícalo si puedes. Da un dato histórico o práctico breve.
— Si es un menú o carta: traduce los platos principales y recomienda.
— Si es un cartel o señal en otro idioma: traduce y explica.
— Si es un paisaje: identifica la zona si puedes, sugiere qué hacer.
— Si es un problema (avería, picadura, herida): consejo práctico inmediato.
— Si no sabes qué es: describe lo que ves y pregunta.
SÉ BREVE Y ÚTIL. No describas la foto de forma obvia ("veo una imagen de..."). Ve al dato útil directo.
Las fotos se guardan automáticamente en la galería del viajero.

ETIQUETADO OBLIGATORIO: Cuando analices una foto, incluye SIEMPRE como última línea de tu respuesta:
FOTO_TAG: [palabra]
Palabras válidas: paisaje, monumento, comida, persona, documento, cartel, transporte, alojamiento, otro
Una sola palabra. No la menciones ni la expliques al usuario. Es un tag interno para organizar fotos.`;

// ═══════════════════════════════════════════════════════════════
// ENSAMBLAR SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════
const BLOQUE_NOTAS = `NOTAS Y RECORDATORIOS — herramienta guardar_nota
Cuando el usuario diga "apúntame", "recuérdame", "anota", "guarda que", "no olvides" o cualquier variante de querer guardar info → usa guardar_nota INMEDIATAMENTE. Sin preguntar. Guarda y confirma con frase corta tipo "Apuntado" o "Guardado, no se me olvida".
Si menciona una fecha → extrae la fecha como YYYY-MM-DD en fecha_recordatorio. Calcula bien el año actual (2026).
Si menciona un país → pon el código ISO en country_code y el nombre en country_name.
Si dice algo como "recuérdame devolver la moto el 15 de abril" → tipo: recordatorio, fecha_recordatorio: 2026-04-15, texto: "Devolver la moto".`;

const BLOQUE_ACCION = `CÓMO ACTÚAS

Eres experta en viajes. Lo que sabes, lo das directo. Lo que no sabes con certeza o puede haber cambiado, lo buscas — y le dices al usuario qué estás haciendo: "Déjame buscarlo."

Nunca te quedas parada. Si no tienes el dato, tienes la solución.

DETECTA QUÉ QUIERE EL USUARIO

1. INFORMACIÓN
Señales: "¿qué ver en...?", "¿es caro...?", "¿necesito visado?", "¿cuándo ir?", "¿qué tiempo hace?"
→ Responde con lo que sabes. Sin tools, sin ruta, sin taxi.

2. HABLA DE UN DESTINO O VIAJE
Señales: "quiero ir a Vietnam", "3 días en Ronda", "itinerario por Japón", "ruta por Marruecos", destino + días, "hazme una ruta"
→ Responde con INFORMACIÓN del destino: qué ver, qué comer, clima, transporte, tips, cultura. Usa tools si pide algo concreto (hotel, vuelo). NUNCA generes SALMA_ROUTE_JSON. NUNCA preguntes "¿qué tipo de viaje?" ni "¿con quién vas?".

3. QUIERE UNA GUÍA COMPLETA (SALMA_ROUTE_JSON)
Solo si el usuario ha escrito literalmente "salma hazme una guía" o "hazme una guía salma".
NINGUNA otra frase activa esto. Ni "quiero una guía", ni destino + días, ni "hazme una ruta", ni "itinerario".
El sistema te avisará con [OBLIGATORIO — GENERA RUTA AHORA] cuando corresponda. Si no ves ese aviso, NO generes SALMA_ROUTE_JSON.

4. QUIERE MOVERSE AHORA (transporte local)
Señales: el destino es un lugar específico y cercano — aeropuerto, hotel, dirección, barrio de la ciudad donde está.
Ejemplos: "quiero ir al aeropuerto", "llévame al centro", "cómo llego al hotel X"
NUNCA aplica para: "quiero ir a Vietnam", "quiero ir a Tailandia" — esos son tipo 2 (información del destino).
→ App de transporte del país (Grab, Uber, Bolt — solo el nombre, nunca su URL) + tiempo estimado + precio aproximado + enlace Google Maps con coordenadas reales del viajero como origen.

5. PIDE SERVICIO CONCRETO
Señales: "busca hotel", "vuelos a...", "dónde comer", "alquiler de coche"
→ Usa la herramienta correspondiente inmediatamente. Sin preguntas previas.

6. QUIERE GUARDAR ALGO
Señales: "apúntame", "recuérdame", "anota que", "guarda esto"
→ guardar_nota inmediatamente. Confirma con una frase corta.

SI DUDAS entre tipo 2 y tipo 4 — pregunta en una frase:
"¿Quieres saber sobre X o necesitas llegar a algún sitio ahora?"

PREGUNTAS SOBRE LA APP — si alguien pregunta cómo guardar, compartir o usar funciones de Borrado del Mapa, responde en 1 frase directa. Sin ruta, sin tools.
— "cómo guardo / guardar la ruta" → "Pulsa GUARDAR en la esquina superior derecha de la vista de ruta."
— "cómo comparto / compartir" → "Pulsa ⤴ en la esquina superior derecha para copiar el link."
— "mis viajes / dónde están mis rutas" → "En el icono de rutas del menú inferior."

DEFAULTS — nunca preguntes lo que puedes asumir:
— Sin ciudad → capital del país
— Sin fecha → hoy
— Sin noches → 1 noche
— Sin fecha de vuelta → solo ida
— Sin presupuesto → muestra rango variado

PETICIONES MÚLTIPLES: ejecútalas en orden lógico — lo urgente primero (taxi, grúa, vuelo hoy, emergencia), lo planificable después.

SALMA_ACTION — acciones especiales que el sistema detecta y ejecuta automáticamente. Emítelas al final de tu respuesta, en una línea aparte, sin explicarlas al usuario:
— Para buscar vuelos: SALMA_ACTION:{"type":"SEARCH_FLIGHTS","origin":"MAD","destination":"BKK","date":"2026-06-01","return_date":"2026-06-15","currency":"EUR","adults":1}
— Para buscar hoteles: SALMA_ACTION:{"type":"SEARCH_HOTELS","city":"Bangkok","budget":"mid","adults":2,"checkin":"2026-06-01","checkout":"2026-06-05"}
— Para buscar lugares: SALMA_ACTION:{"type":"SEARCH_PLACES","query":"restaurante vietnamita Hanoi","type":"restaurant"}
— Para guardar una nota: SALMA_ACTION:{"type":"SAVE_NOTE","texto":"Visado Vietnam gratis hasta 45 días","tipo":"visado","country_code":"VN","country_name":"Vietnam"}
— Para guardar un lugar en el mapa personal del usuario: SALMA_ACTION:{"type":"MAP_PIN","name":"Nombre exacto del lugar como aparece en Google Maps","address":"Ciudad y país","description":"Una frase útil sobre el lugar","place_type":"hotel|monument|restaurant|beach|park|other"}
Usa SALMA_ACTION además de tu respuesta normal, no en lugar de ella.

DATO PRIMERO SIEMPRE: la información útil va al principio. La personalidad y el contexto, detrás.

BÚSQUEDAS EN TIEMPO REAL: tu conocimiento llega a agosto 2025. Si el dato puede haber cambiado — horarios, precios, disponibilidad, eventos — avisa y usa buscar_web. Si no lo encuentra, di "no he encontrado ese dato".

TIEMPO Y CLIMA: siempre en tiempo real. Si el contexto incluye [DATOS DEL TIEMPO REAL], úsalos. Si no, usa buscar_web inmediatamente. Sin excepciones.

JERARQUÍA DE HERRAMIENTAS: las tools específicas tienen prioridad sobre buscar_web. Para hoteles: buscar_hotel. Para vuelos: buscar_vuelos. Para cualquier lugar físico (restaurantes, bares, gimnasios, farmacias, museos, spas, cajeros, tiendas, clínicas…): buscar_lugar. NUNCA uses buscar_web cuando buscar_lugar puede hacer el trabajo.

VELOCIDAD — REGLA CRÍTICA: cuando el usuario pide varias cosas a la vez (vuelo + hotel + gym + taxi…), llama a TODAS las herramientas necesarias en una SOLA respuesta, de golpe. No hagas rondas separadas. No esperes el resultado de una para llamar a la siguiente. Todas las búsquedas son independientes y deben lanzarse simultáneamente.

PROHIBIDO INVENTAR:
1. Las ÚNICAS URLs permitidas: (a) las que devuelve una herramienta, (b) google.com/maps/dir/ construida con coordenadas reales.
2. NUNCA URLs de apps (Grab, Uber, Booking, etc.) — solo el nombre de la app.
3. NUNCA inventes teléfonos, direcciones, horarios ni precios exactos que no vengan de herramienta o contexto KV.
4. Si no tienes el dato, usa buscar_web. Si no lo encuentra, di "no he encontrado ese dato".
5. Google Maps: coordenadas numéricas como origen, nunca nombre de ciudad. Correcto: https://www.google.com/maps/dir/21.0285,105.8542/Noi+Bai+International+Airport

NUNCA dejes tirado al viajero. Si tienes los datos, resuélvelo.

Visados y leyes: adapta a la nacionalidad del usuario. Si no la tienes y es relevante, pregúntasela.`;

// ── Prompt CHAT: sin BLOQUE_RUTAS → Claude no ve instrucciones de generar guías
const SALMA_SYSTEM_CHAT = [
  BLOQUE_IDENTIDAD,
  BLOQUE_PERSONALIDAD,
  BLOQUE_MULETILLAS,
  BLOQUE_ANTIPAJA,
  BLOQUE_GEOGRAFIA,
  BLOQUE_ACCION,
  BLOQUE_FORMATO,
  BLOQUE_NOTAS,
  BLOQUE_MAPA,
  BLOQUE_VISION,
].join('\n\n');

// ── Prompt PLAN: sin restricción de títulos → para días+destino (formato estructurado)
const BLOQUE_FORMATO_PLAN = `⚠️ REGLA #1 — LEE ESTO PRIMERO, ANTES QUE CUALQUIER OTRA INSTRUCCIÓN:

Tu respuesta DEBE empezar con un título de día y seguir esta estructura EXACTA. No escribas prosa libre. No escribas "el primer día...". Usa LITERALMENTE este formato:

**Día 1 — [título]**

**[Lugar]** (https://www.google.com/maps/search/Lugar+Ciudad) — [dato histórico o cultural, 1-2 frases]. [Tiempo]. [Precio si hay].

**[Lugar 2]** (https://www.google.com/maps/search/Lugar2+Ciudad) — [dato]. [Tiempo].

Dónde comer: **[Restaurante]** (https://www.google.com/maps/search/Restaurante+Ciudad) — [plato y precio].

**Día 2 — [título]**
[misma estructura]

Si no sigues este formato, tu respuesta es INCORRECTA. Empieza SIEMPRE con "**Día 1 —".

Reglas adicionales: no preguntas al final, no frases vacías, no bullets, cada parada es un párrafo corto con enlace Maps.`;

const SALMA_SYSTEM_PLAN = [
  BLOQUE_FORMATO_PLAN,   // PRIMERO — formato estructurado antes que nada
  BLOQUE_IDENTIDAD,
  BLOQUE_PERSONALIDAD,
  BLOQUE_MULETILLAS,
  BLOQUE_ANTIPAJA,
  BLOQUE_GEOGRAFIA,
  BLOQUE_ACCION,
  BLOQUE_NOTAS,
  BLOQUE_MAPA,
  BLOQUE_VISION,
].join('\n\n');

// ── Prompt RUTA: incluye BLOQUE_RUTAS → solo cuando el usuario pide guía explícita
const SALMA_SYSTEM_ROUTE = [
  BLOQUE_IDENTIDAD,
  BLOQUE_PERSONALIDAD,
  BLOQUE_MULETILLAS,
  BLOQUE_ANTIPAJA,
  BLOQUE_GEOGRAFIA,
  BLOQUE_ACCION,
  BLOQUE_FORMATO,
  BLOQUE_NOTAS,
  BLOQUE_RUTAS,
  BLOQUE_MAPA,
  BLOQUE_VISION,
].join('\n\n');

// ── Alias para compatibilidad (Firestore save/read, /prompt endpoint)
const SALMA_SYSTEM_BASE = SALMA_SYSTEM_ROUTE;

// ═══════════════════════════════════════════════════════════════
// PROMPT DINÁMICO — Lee de Firestore con caché 60s, fallback hardcoded
// ═══════════════════════════════════════════════════════════════
const FIRESTORE_PROJECT = 'borradodelmapa-85257';

// Caché a nivel de módulo — persiste mientras el worker esté caliente (minutos/horas)
// Evita hasta la llamada KV en requests frecuentes → 0ms en vez de 20-60ms
let _modulePromptCache = null;
let _modulePromptTs = 0;
const MODULE_PROMPT_TTL = 300_000; // 5 min

async function getSystemPrompt(env) {
  const now = Date.now();

  // 1. Caché en memoria del módulo (más rápido que KV)
  if (_modulePromptCache && (now - _modulePromptTs) < MODULE_PROMPT_TTL) {
    return _modulePromptCache;
  }

  // 2. Intentar leer de KV (TTL 5min)
  if (env?.SALMA_KB) {
    try {
      const cached = await env.SALMA_KB.get('_cache:prompt');
      if (cached) {
        _modulePromptCache = cached;
        _modulePromptTs = now;
        return cached;
      }
    } catch (_) {}
  }

  // 3. Leer de Firestore
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore ${res.status}`);
    const doc = await res.json();
    const promptText = doc.fields?.prompt_text?.stringValue;
    if (promptText && promptText.length > 100) {
      _modulePromptCache = promptText;
      _modulePromptTs = now;
      if (env?.SALMA_KB) {
        try {
          await env.SALMA_KB.put('_cache:prompt', promptText, { expirationTtl: 300 });
        } catch (_) {}
      }
      return promptText;
    }
    throw new Error('Prompt vacío o inválido');
  } catch (e) {
    return SALMA_SYSTEM_BASE;
  }
}

// ═══════════════════════════════════════════════════════════════
// HERRAMIENTAS — Tool Use para agente Salma (Duffel vuelos)
// ═══════════════════════════════════════════════════════════════
const SALMA_TOOLS = [
  {
    name: "buscar_vuelos",
    description: "Busca vuelos reales entre ciudades con precios actualizados. Usa esta herramienta cuando el usuario pida buscar, comparar o encontrar vuelos. Devuelve opciones reales con aerolínea, horarios, escalas, precio, y un campo enlace_reserva con URL de Google Flights para reservar. REGLAS DE FORMATO PARA ENLACES: cuando incluyas el enlace_reserva en tu respuesta, pon la URL SOLA en su propia línea, sin formato markdown, sin corchetes, sin paréntesis. Solo la URL tal cual. Ejemplo: 'Para reservar:' seguido de salto de línea y la URL sola. NUNCA uses formato [texto](url). NUNCA inventes URLs — usa exactamente el enlace_reserva que devuelve la herramienta. Los códigos IATA: MAD=Madrid, BCN=Barcelona, FCO=Roma Fiumicino, CDG=París, LHR=Londres. Para ciudades con varios aeropuertos: LON=Londres, PAR=París, ROM=Roma, NYC=Nueva York.",
    input_schema: {
      type: "object",
      properties: {
        origen: {
          type: "string",
          description: "Código IATA de la ciudad/aeropuerto de origen. Ejemplos: 'MAD' para Madrid, 'BCN' para Barcelona, 'LON' para Londres (todos sus aeropuertos)"
        },
        destino: {
          type: "string",
          description: "Código IATA de la ciudad/aeropuerto de destino. Ejemplos: 'ROM' para Roma, 'PAR' para París, 'BKK' para Bangkok"
        },
        fecha_ida: {
          type: "string",
          description: "Fecha de salida en formato YYYY-MM-DD. Ejemplo: '2026-05-15'"
        },
        fecha_vuelta: {
          type: "string",
          description: "Fecha de regreso en formato YYYY-MM-DD. Omitir para vuelos solo ida"
        },
        fecha_rango_hasta: {
          type: "string",
          description: "Fecha fin del rango flexible en formato YYYY-MM-DD. Si el usuario pide 'la semana del 10 al 15' o 'cualquier día entre X e Y', pon fecha_ida=primer día y fecha_rango_hasta=último día. Se buscará en 3 fechas distribuidas para encontrar el más barato."
        },
        adultos: {
          type: "integer",
          description: "Número de pasajeros adultos. Por defecto 1"
        },
        clase: {
          type: "string",
          description: "Clase de cabina: 'economy', 'premium_economy', 'business', 'first'. Por defecto 'economy'"
        }
      },
      required: ["origen", "destino", "fecha_ida"]
    }
  },
  {
    name: "buscar_hotel",
    description: "Busca hoteles REALES con precios y disponibilidad en Booking.com. Usa esta herramienta cuando el usuario pida hotel, hostal, alojamiento, apartamento o dónde dormir. Devuelve hoteles con nombre, precio, review, dirección, enlace de reserva y foto. REGLAS DE FORMATO: para cada hotel, muestra primero la foto con formato ![nombre](foto_url), luego nombre, precio, review, y el enlace de reserva SOLO en su propia línea sin formato markdown. Si el usuario tiene presupuesto, filtra y muestra solo los que encajan. Destaca el mejor valorado y el más barato.",
    input_schema: {
      type: "object",
      properties: {
        ciudad: {
          type: "string",
          description: "Nombre de la ciudad donde buscar hotel (ej: 'Hanoi', 'Barcelona', 'Tokyo')"
        },
        fecha_entrada: {
          type: "string",
          description: "Fecha de check-in en formato YYYY-MM-DD"
        },
        fecha_salida: {
          type: "string",
          description: "Fecha de check-out en formato YYYY-MM-DD"
        },
        adultos: {
          type: "integer",
          description: "Número de adultos. Por defecto 2"
        },
        habitaciones: {
          type: "integer",
          description: "Número de habitaciones. Por defecto 1"
        },
        presupuesto_max: {
          type: "integer",
          description: "Presupuesto máximo por noche en EUR. Trivago no filtra por precio en el enlace, así que menciónalo en tu respuesta para que el usuario filtre manualmente."
        }
      },
      required: ["ciudad", "fecha_entrada", "fecha_salida"]
    }
  },
  {
    name: "buscar_coche",
    description: "Busca coches de alquiler REALES con precios y disponibilidad. Usa esta herramienta cuando el usuario pida alquilar coche, moto, scooter o vehículo. Devuelve vehículos con nombre, precio total, precio/día, plazas, transmisión, proveedor, dirección de recogida, y web_proveedor (enlace directo a la web del proveedor para reservar). REGLAS DE FORMATO: para cada coche muestra los datos y si tiene web_proveedor pon el enlace SOLO en su propia línea, sin formato markdown. Destaca el más barato y el mejor equipado.",
    input_schema: {
      type: "object",
      properties: {
        ciudad_recogida: {
          type: "string",
          description: "Ciudad donde recoger el vehículo (ej: 'Barcelona', 'Bangkok')"
        },
        fecha_recogida: {
          type: "string",
          description: "Fecha de recogida en formato YYYY-MM-DD"
        },
        hora_recogida: {
          type: "string",
          description: "Hora de recogida en formato HH:MM. Por defecto '10:00'"
        },
        fecha_devolucion: {
          type: "string",
          description: "Fecha de devolución en formato YYYY-MM-DD"
        },
        hora_devolucion: {
          type: "string",
          description: "Hora de devolución en formato HH:MM. Por defecto '10:00'"
        }
      },
      required: ["ciudad_recogida", "fecha_recogida", "fecha_devolucion"]
    }
  },
  {
    name: "buscar_lugar",
    description: "Busca cualquier lugar físico con Google Places: restaurantes, bares, cafés, gimnasios, farmacias, museos, clínicas, spas, supermercados, cajeros, cambio de divisas, tiendas… Úsala para TODO lo que el usuario quiera encontrar cerca: dónde comer, dónde ir al gym, dónde comprar una SIM, etc. Devuelve nombre, dirección, teléfono, rating, horario y enlace Google Maps.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Qué buscar. Para comida usa el tipo de cocina o 'restaurante' + estilo. Ej: 'restaurante thai', 'sushi', 'boxing gym', 'farmacia', 'cambio de divisas', 'supermercado', 'museo historia'"
        },
        ciudad: {
          type: "string",
          description: "Ciudad donde buscar. Ej: 'Hanoi', 'Bangkok', 'Madrid'"
        },
        zona: {
          type: "string",
          description: "Zona o barrio si el usuario lo especifica. Opcional."
        },
        tipo_places: {
          type: "string",
          description: "Tipo Google Places para afinar resultados. Usa 'restaurant' para cualquier búsqueda de comida/cenar/restaurante. Deja vacío para el resto."
        }
      },
      required: ["query", "ciudad"]
    }
  },
  {
    name: "buscar_foto",
    description: "Busca fotos REALES de lugares usando Google Places Photos. Devuelve hasta 3 fotos distintas del lugar. Incluye las fotos en tu respuesta con formato ![nombre](url). IMPORTANTE: llama a esta herramienta UNA SOLA VEZ con el lugar, no la llames varias veces para el mismo sitio — ya devuelve varias fotos. Para mostrar fotos de DISTINTOS lugares, haz una llamada por lugar.",
    input_schema: {
      type: "object",
      properties: {
        lugar: {
          type: "string",
          description: "Nombre del lugar concreto + ciudad/país. Ejemplos: 'Plaza Durbar Kathmandu', 'Templo Swayambhunath Nepal', 'Halong Bay Vietnam', 'Alhambra Granada España'"
        }
      },
      required: ["lugar"]
    }
  },
  {
    name: "generar_video",
    description: "Genera un video resumen animado con las fotos del viajero. Usa esta herramienta SOLO cuando el viajero pida explícitamente 'hazme el video', 'video del día', 'resumen en video', 'quiero un video'. Devuelve datos para renderizar un slideshow animado en el navegador del viajero con las fotos que ha enviado.",
    input_schema: {
      type: "object",
      properties: {
        titulo: {
          type: "string",
          description: "Título del video. Usa el destino + contexto. Ej: 'Koh Samui · Día 3', 'Vietnam en moto', 'Fin de semana en Cádiz'"
        },
        highlight: {
          type: "string",
          description: "Frase memorable o emotiva del día/viaje. Algo que resuma la experiencia. Máximo 60 caracteres."
        },
        tipo: {
          type: "string",
          enum: ["jornada", "resumen"],
          description: "'jornada' para video de un día específico. 'resumen' para todo el viaje."
        }
      },
      required: ["titulo", "tipo"]
    }
  },
  {
    name: "buscar_web",
    description: "Busca información actual en internet usando Google. Usa esta herramienta OBLIGATORIAMENTE cuando la pregunta incluya fechas concretas, horarios, precios actuales, programas de eventos, procesiones, conciertos, ferias, si algo está abierto o cerrado, o cualquier dato que pueda haber cambiado desde agosto de 2025. Devuelve los resultados más relevantes con su fuente para que puedas responder con datos verificados.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "La búsqueda en Google. Sé específico: incluye lugar, año y qué buscas. Ej: 'procesiones Semana Santa Málaga 2026 horario Calle Larios', 'precio entrada Sagrada Familia 2026', 'horario museo Picasso Málaga hoy'"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "guardar_nota",
    description: "Guarda una nota o recordatorio para el viajero. Usa esta herramienta INMEDIATAMENTE cuando el usuario diga 'apúntame', 'recuérdame', 'anota que', 'guarda que', 'no olvides que', 'apunta que' o cualquier variante de querer guardar información o un recordatorio. NO preguntes, guarda directamente y confirma con una frase corta.",
    input_schema: {
      type: "object",
      properties: {
        texto: {
          type: "string",
          description: "El contenido de la nota tal como lo dice el usuario. Limpia y reformula si es necesario para que sea claro al releerlo."
        },
        tipo: {
          type: "string",
          enum: ["general", "recordatorio", "hotel", "vuelo", "restaurante", "lugar", "visado", "transporte"],
          description: "Tipo de nota. Usa 'recordatorio' si hay una fecha o algo que no debe olvidar. 'general' para todo lo demás."
        },
        fecha_recordatorio: {
          type: "string",
          description: "Fecha en formato YYYY-MM-DD si el usuario menciona una fecha concreta. Ej: 'el 15 de abril' → '2026-04-15'. Si no hay fecha, omite."
        },
        country_code: {
          type: "string",
          description: "Código ISO de 2 letras del país si la nota está relacionada con un país concreto. Ej: 'TH' para Tailandia."
        },
        country_name: {
          type: "string",
          description: "Nombre del país en español si aplica. Ej: 'Tailandia'."
        }
      },
      required: ["texto", "tipo"]
    }
  }
];

// URLs reales de las apps de transporte — para inyectar por código, no por IA
const TRANSPORT_APP_URLS = {
  grab:     { name: 'Grab',     icon: '🟩', web: 'https://www.grab.com' },
  uber:     { name: 'Uber',     icon: '🚕', web: 'https://m.uber.com' },
  bolt:     { name: 'Bolt',     icon: '🟢', web: 'https://bolt.eu' },
  didi:     { name: 'DiDi',     icon: '🟠', web: 'https://www.didiglobal.com' },
  gojek:    { name: 'Gojek',    icon: '🟢', web: 'https://www.gojek.com' },
  careem:   { name: 'Careem',   icon: '🟢', web: 'https://www.careem.com' },
  indrive:  { name: 'inDrive',  icon: '🟣', web: 'https://indrive.com' },
  cabify:   { name: 'Cabify',   icon: '🟣', web: 'https://cabify.com' },
  freenow:  { name: 'FREENOW',  icon: '🔴', web: 'https://www.free-now.com' },
  yandex:   { name: 'Yandex Go',icon: '🔴', web: 'https://go.yandex.com' },
  lyft:     { name: 'Lyft',     icon: '🩷', web: 'https://www.lyft.com' },
  ola:      { name: 'Ola',      icon: '🟡', web: 'https://www.olacabs.com' },
  kakao_t:  { name: 'Kakao T',  icon: '🟡', web: 'https://t.kakao.com' },
  yango:    { name: 'Yango',    icon: '🔴', web: 'https://yango.com' },
};

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

function isRouteRequest(message, history) {
  return /salma\s+hazme\s+una\s+gu[ií]a|hazme\s+una\s+gu[ií]a\s+salma/i.test(message);
}

// Detecta "destino + días" sin ser petición de guía → respuesta estructurada por días (no JSON)
function isDaysDestination(message) {
  return /\b(\d{1,2})\s*d[ií]as?\b/i.test(message) && !isRouteRequest(message);
}

// Post-procesado: divide el texto en N días con headers **Día N**
function formatDayHeaders(text, numDays) {
  if (!numDays || numDays < 2) return text;

  // Normalizar Unicode (í puede venir como i + combining accent en SSE streaming)
  text = text.normalize('NFC');

  // Paso 1: intentar detectar "El primer/segundo/tercer día" y reemplazar
  const ordMap = {
    primer: 1, primero: 1, primera: 1, segundo: 2, segunda: 2,
    tercer: 3, tercero: 3, tercera: 3, cuarto: 4, cuarta: 4,
    quinto: 5, quinta: 5, sexto: 6, sexta: 6, septimo: 7, séptimo: 7,
  };
  let foundOrdinals = 0;
  let result = text.replace(
    /(?:El|Para el|En el|Al|al)\s+(primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa]|sext[oa]|s.ptim[oa])\s+d.{0,2}a\b[,.:;\s]*(?:lo |te lo |se lo |es |va |toca |conviene |merece )?/gi,
    (match, ord) => {
      foundOrdinals++;
      const key = ord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const num = ordMap[key] || ordMap[key.replace(/[oa]$/, '')] || foundOrdinals;
      return '\n\n**Día ' + num + '**\n\n';
    }
  );
  if (foundOrdinals >= 2) {
    return result.replace(/\n{4,}/g, '\n\n\n');
  }

  // Paso 2: si Sonnet no usó ordinales, dividir por párrafos y distribuir fotos

  // Extraer TODAS las fotos del texto (pueden estar al inicio o inline)
  const photoLines = [];
  const textLines = [];
  for (const line of text.split('\n')) {
    if (/^!\[/.test(line.trim())) {
      photoLines.push(line.trim());
    } else {
      textLines.push(line);
    }
  }
  const content = textLines.join('\n').trim();

  // Separar párrafos
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20);
  if (paragraphs.length < numDays + 1) return text;

  // Detectar párrafos finales (transporte, tips, comer)
  const tailKeywords = /^(?:Para llegar|Cómo llegar|Para comer|Si quieres|El clima|En abril|Presupuesto|Transporte|Si necesitas|Cómo moverse)/i;
  let tailStart = paragraphs.length;
  for (let i = paragraphs.length - 1; i >= Math.floor(paragraphs.length / 2); i--) {
    if (tailKeywords.test(paragraphs[i].trim())) tailStart = i;
    else break;
  }

  const bodyParas = paragraphs.slice(0, tailStart);
  const tailParas = paragraphs.slice(tailStart);
  if (bodyParas.length < numDays) return text;

  // Distribuir párrafos entre los días
  const parasPerDay = Math.ceil(bodyParas.length / numDays);
  const parts = [];
  for (let d = 0; d < numDays; d++) {
    const start = d * parasPerDay;
    const end = Math.min(start + parasPerDay, bodyParas.length);
    if (start >= bodyParas.length) break;
    const dayParas = bodyParas.slice(start, end).join('\n\n');
    // Distribuir fotos: 1 foto por día si hay suficientes
    const photo = photoLines[d] || '';
    const photoBlock = photo ? photo + '\n\n' : '';
    parts.push('**Día ' + (d + 1) + '**\n\n' + photoBlock + dayParas);
  }

  // Reensamblar: días + cola (fotos ya distribuidas, no al inicio)
  let final = parts.join('\n\n\n');
  if (tailParas.length > 0) final += '\n\n' + tailParas.join('\n\n');

  return final;
}

function isHelpRequest(message) {
  if (!message) return null;
  const m = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const categories = {
    health: /farmacia|pharmacy|hospital|urgencias|emergency room|medico|doctor|dentista|dentist|veterinari|clinica|clinic|ambulancia|ambulance/,
    vehicle: /grua|tow.?truck|taller|mecanico|mechanic|gasolinera|gas.?station|petrol|averia|breakdown|pinch|pinchazo|flat.?tire/,
    security: /embajada|embassy|consulado|consulate|comisaria|policia|police|abogado|lawyer|denuncia|robo|robado|stolen/,
    money: /cajero|atm|cambio.?de.?(divisa|moneda)|currency.?exchange|western.?union|money.?transfer/,
    food: /restaurante.*cerca|restaurant.*near|donde.*comer.*aqui|donde.*comer.*cerca|donde.*cenar.*aqui|donde.*cenar.*cerca|comer.*por.*aqui|cenar.*por.*aqui/,
    logistics: /cerrajero|locksmith|lavanderia|laundry|optica|optician|zapatero|cobbler|tienda.?de?.?electronica|electronics|cargador|charger|adaptador|adapter/,
    transport: /taxi|transfer|estacion.?de?.?tren|train.?station|estacion.?de?.?bus|bus.?station|ferry|puerto\s+de|aeropuerto|airport|\btren\b|autobus.?(de|desde|a)|flixbus|renfe|\bave\s|high.?speed.?train|como.?llegar/,
    communication: /tarjeta.?sim|sim.?card|wifi|locutorio|internet.?cafe/,
    weather: /tiempo|clima|temperatura|lluvia|llover|pronostico|forecast|weather|rain|cold|frio|calor|heat|humedad|humidity|tormenta|storm|nieve|snow|monzon|monsoon|cuando.?mejor.?ir|mejor.?epoca|best.?time/,
  };

  for (const [cat, regex] of Object.entries(categories)) {
    if (regex.test(m)) return cat;
  }
  return null;
}

// Detectar si el usuario pide búsqueda de vuelos (para usar Sonnet en vez de Haiku)
function isFlightRequest(message) {
  return /vuelo|vuelos|flight|flights|volar|avion|avión|billete.*avi[oó]n|busca.*vuelo|reserva.*vuelo|fly\s|flying/i.test(message);
}

// Detectar si el usuario pide hotel/alojamiento
function isHotelRequest(message) {
  return /hotel|hoteles|alojamiento|hostal|apartamento|airbnb|dormir|hospedaje|accommodation|where to stay|dónde dormir|donde dormir|busca.*hotel|reserva.*hotel/i.test(message);
}

// Extrae rango de fechas del texto del mensaje (para pre-fetch Duffel sin esperar al frontend)
// Maneja: "del 10 al 15 de abril", "10 de abril", "semana del 10", "april 10-15", etc.
function extractDatesFromMessage(message) {
  const MONTHS = { enero:1,january:1,febrero:2,february:2,marzo:3,march:3,abril:4,april:4,mayo:5,may:5,junio:6,june:6,julio:7,july:7,agosto:8,august:8,septiembre:9,september:9,octubre:10,october:10,noviembre:11,november:11,diciembre:12,december:12 };
  const now = new Date();
  const currentYear = now.getFullYear();

  const toISO = (day, month) => {
    const y = (month < now.getMonth() + 1) ? currentYear + 1 : currentYear;
    return `${y}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  };

  // "del 10 al 15 de abril" / "del 10 al 15 abril"
  const rangeMonthMatch = message.match(/\bdel?\s+(\d{1,2})\s+al?\s+(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)/i);
  if (rangeMonthMatch) {
    const month = MONTHS[rangeMonthMatch[3].toLowerCase()];
    if (month) return { from: toISO(+rangeMonthMatch[1], month), to: toISO(+rangeMonthMatch[2], month) };
  }

  // "10 al 15 de abril" (sin "del")
  const rangeMatch2 = message.match(/\b(\d{1,2})\s+al?\s+(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)/i);
  if (rangeMatch2) {
    const month = MONTHS[rangeMatch2[3].toLowerCase()];
    if (month) return { from: toISO(+rangeMatch2[1], month), to: toISO(+rangeMatch2[2], month) };
  }

  // "semana del 10 al 15" — sin mes explícito, buscar mes en el mensaje
  const semanaMatch = message.match(/semana\s+del?\s+(\d{1,2})\s+al?\s+(\d{1,2})/i);
  if (semanaMatch) {
    const monthMatch = message.match(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
    const month = monthMatch ? MONTHS[monthMatch[1].toLowerCase()] : now.getMonth() + 1;
    return { from: toISO(+semanaMatch[1], month), to: toISO(+semanaMatch[2], month) };
  }

  // "el 10 de abril" — solo ida
  const singleMatch = message.match(/\bel\s+(\d{1,2})\s+(?:de\s+)?([a-záéíóú]+)/i);
  if (singleMatch) {
    const month = MONTHS[singleMatch[2].toLowerCase()];
    if (month) return { from: toISO(+singleMatch[1], month), to: null };
  }

  return null;
}

// Detectar si el usuario pide alquiler de coche o restaurante
function isServiceRequest(message) {
  return /alquil|rent.*car|coche.*alquil|moto|scooter|restaurante|restaurant|dónde comer|donde comer|cenar|cena|comida|dónde cenar|donde cenar/i.test(message);
}

// Extrae origen y destino de frases de transporte (ferry/tren/bus)
// "ferry de Koh Samui a Bangkok" → { origin: "Koh Samui", dest: "Bangkok" }
function extractTransportOD(message) {
  // Elimina palabras de transporte/genéricas que se cuelan al final del nombre de ciudad
  const stripTrailingWords = (s) => {
    const noise = /^(ferry|bus|tren|avion|avion|vuelo|vuelos|coche|taxi|barco|metro|directo|barato|rapido|y|o|en|por|con|para|desde|hacia|hasta|si|hay|tienen|como|ir|llegar)$/i;
    const words = s.trim().split(/\s+/);
    while (words.length > 1 && noise.test(words[words.length - 1])) words.pop();
    return words.join(' ');
  };
  // Patrón principal: "de/desde X a/hasta Y"
  const m1 = message.match(/\b(?:de|desde)\s+([\wáéíóúñÁÉÍÓÚÑ\s\-]{2,30}?)\s+(?:a|hasta|hacia)\s+([\wáéíóúñÁÉÍÓÚÑ\s\-]{2,30}?)(?:\s*[?,.]|$)/i);
  if (m1) return { origin: stripTrailingWords(m1[1]), dest: stripTrailingWords(m1[2]) };
  // Patrón inglés: "from X to Y"
  const m2 = message.match(/\bfrom\s+([\w\s\-]{2,30}?)\s+to\s+([\w\s\-]{2,30}?)(?:\s*[?,.]|$)/i);
  if (m2) return { origin: stripTrailingWords(m2[1]), dest: stripTrailingWords(m2[2]) };
  return null;
}

// Pequeño mapa de ciudades/islas → IATA para búsqueda de vuelos Duffel
const CITY_TO_IATA = {
  'koh samui': 'USM', 'samui': 'USM',
  'bangkok': 'BKK', 'bkk': 'BKK',
  'phuket': 'HKT',
  'chiang mai': 'CNX',
  'krabi': 'KBV',
  'madrid': 'MAD',
  'barcelona': 'BCN',
  'sevilla': 'SVQ', 'seville': 'SVQ',
  'malaga': 'AGP', 'málaga': 'AGP',
  'paris': 'CDG', 'París': 'CDG',
  'london': 'LHR', 'londres': 'LHR',
  'amsterdam': 'AMS',
  'rome': 'FCO', 'roma': 'FCO',
  'lisbon': 'LIS', 'lisboa': 'LIS',
  'new york': 'JFK', 'nueva york': 'JFK',
  'tokyo': 'NRT', 'tokio': 'NRT',
  'bali': 'DPS',
  'cancun': 'CUN', 'cancún': 'CUN',
  'dubai': 'DXB',
  'hong kong': 'HKG',
  'singapore': 'SIN', 'singapur': 'SIN',
  'sydney': 'SYD',
  'buenos aires': 'EZE',
  'mexico city': 'MEX', 'ciudad de mexico': 'MEX', 'ciudad de méxico': 'MEX',
};
function getCityIATA(city) {
  if (!city) return null;
  const norm = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return CITY_TO_IATA[norm] || null;
}

// Lookup IATA por coordenadas GPS — para cuando userLocationName viene vacío
// Solo cubre destinos turísticos donde Claude tendería a asumir el hub nacional
const AIRPORT_BY_COORDS = [
  { iata: 'USM', name: 'Koh Samui',    lat: 9.548,  lng: 100.062, r: 0.25 },
  { iata: 'HKT', name: 'Phuket',       lat: 8.113,  lng: 98.316,  r: 0.5  },
  { iata: 'KBV', name: 'Krabi',        lat: 8.099,  lng: 98.986,  r: 0.3  },
  { iata: 'CNX', name: 'Chiang Mai',   lat: 18.767, lng: 98.962,  r: 0.3  },
  { iata: 'KOP', name: 'Koh Phangan',  lat: 9.743,  lng: 100.014, r: 0.2  },
  { iata: 'DPS', name: 'Bali',         lat: -8.748, lng: 115.167, r: 0.5  },
  { iata: 'LOP', name: 'Lombok',       lat: -8.757, lng: 116.277, r: 0.4  },
  { iata: 'BMU', name: 'Bima/Flores',  lat: -8.539, lng: 118.687, r: 0.5  },
  { iata: 'MNL', name: 'Manila',       lat: 14.509, lng: 121.020, r: 0.4  },
  { iata: 'CEB', name: 'Cebu',         lat: 10.307, lng: 123.979, r: 0.3  },
  { iata: 'PPS', name: 'El Nido/Palawan', lat: 9.745, lng: 118.759, r: 0.5 },
  { iata: 'DAD', name: 'Da Nang',      lat: 16.044, lng: 108.202, r: 0.4  },
  { iata: 'HPH', name: 'Haiphong',     lat: 20.819, lng: 106.724, r: 0.4  },
  { iata: 'PQC', name: 'Phu Quoc',     lat: 10.227, lng: 103.967, r: 0.3  },
  { iata: 'REP', name: 'Siem Reap',    lat: 13.411, lng: 103.813, r: 0.3  },
  { iata: 'AGP', name: 'Málaga',       lat: 36.675, lng: -4.499,  r: 0.3  },
  { iata: 'IBZ', name: 'Ibiza',        lat: 38.873, lng: 1.373,   r: 0.2  },
  { iata: 'PMI', name: 'Palma Mallorca', lat: 39.551, lng: 2.739,  r: 0.3  },
  { iata: 'TFS', name: 'Tenerife Sur', lat: 28.045, lng: -16.572, r: 0.3  },
  { iata: 'LPA', name: 'Gran Canaria', lat: 27.932, lng: -15.387, r: 0.3  },
  { iata: 'FUE', name: 'Fuerteventura',lat: 28.452, lng: -13.864, r: 0.3  },
  { iata: 'ACE', name: 'Lanzarote',    lat: 28.945, lng: -13.605, r: 0.2  },
  { iata: 'HER', name: 'Heraklion/Creta', lat: 35.340, lng: 25.180, r: 0.4 },
  { iata: 'RHO', name: 'Rodas',        lat: 36.405, lng: 28.086,  r: 0.2  },
  { iata: 'JTR', name: 'Santorini',    lat: 36.399, lng: 25.479,  r: 0.15 },
  { iata: 'JMK', name: 'Mykonos',      lat: 37.435, lng: 25.348,  r: 0.15 },
  { iata: 'CFU', name: 'Corfú',        lat: 39.602, lng: 19.912,  r: 0.2  },
  { iata: 'SPU', name: 'Split',        lat: 43.539, lng: 16.298,  r: 0.3  },
  { iata: 'DBV', name: 'Dubrovnik',    lat: 42.561, lng: 18.268,  r: 0.2  },
  { iata: 'RAK', name: 'Marrakech',    lat: 31.606, lng: -8.036,  r: 0.4  },
  { iata: 'AGA', name: 'Agadir',       lat: 30.325, lng: -9.413,  r: 0.4  },
  { iata: 'FNC', name: 'Madeira',      lat: 32.698, lng: -16.778, r: 0.3  },
  { iata: 'PDL', name: 'Azores/Ponta Delgada', lat: 37.741, lng: -25.698, r: 0.3 },
];
function getIATAFromCoords(lat, lng) {
  for (const ap of AIRPORT_BY_COORDS) {
    if (Math.abs(lat - ap.lat) < ap.r && Math.abs(lng - ap.lng) < ap.r) {
      return { iata: ap.iata, name: ap.name };
    }
  }
  return null;
}

function extractHelpLocation(message, history, currentRoute) {
  // 1a. Patrón "desde X a/hasta Y" → destino es Y
  const desdeAMatch = message.match(/desde\s+[\wáéíóúñÁÉÍÓÚÑ\s]+?\s+(?:a|hasta|hacia)\s+([A-ZÁÉÍÓÚÑ\u00C0-\u024F][\wáéíóúñ\u00E0-\u024F\s]{1,30})/i);
  if (desdeAMatch) return desdeAMatch[1].trim();

  // 1b. Patrón "a/hasta/hacia <Lugar>" (ir a Málaga, llegar a Madrid)
  const aMatch = message.match(/\b(?:a|hasta|hacia)\s+([A-ZÁÉÍÓÚÑ\u00C0-\u024F][a-záéíóúñ\u00E0-\u024FA-ZÁÉÍÓÚÑ\u00C0-\u024F\s]{2,30}?)(?:\s+(?:desde|en\s+taxi|en\s+coche|por|con|,)|$)/i);
  if (aMatch) {
    const candidate = aMatch[1].trim();
    // Filtrar palabras comunes que no son lugares
    if (!/^(taxi|coche|bus|tren|pie|casa|hotel|aeropuerto|airport)$/i.test(candidate)) return candidate;
  }

  // 1c. Patrón "desde <Lugar>" (cuando no hay "a Y")
  const desdeMatch = message.match(/desde\s+([A-ZÁÉÍÓÚÑ\u00C0-\u024F][a-záéíóúñ\u00E0-\u024FA-ZÁÉÍÓÚÑ\u00C0-\u024F\s]{2,30}?)(?:\s+(?:a\s|hasta\s|hacia\s|en\s+taxi|en\s+coche|por|con|,)|$)/i);
  if (desdeMatch) return desdeMatch[1].trim();

  // 1d. Patrón original "en <lugar>" o "in <place>"
  const esMatch = message.match(/\b(?:en|cerca\s+de|por)\s+([A-ZÁÉÍÓÚÑ\u00C0-\u024F][a-záéíóúñ\u00E0-\u024FA-ZÁÉÍÓÚÑ\u00C0-\u024F\s]{2,30})/);
  const enMatch = message.match(/\b(?:in|near|around|at)\s+([A-Z][a-zA-Z\s]{2,30})/);
  const loc = esMatch?.[1]?.trim() || enMatch?.[1]?.trim();
  if (loc) return loc;

  // 2. Ruta actual del usuario
  if (currentRoute?.region) return currentRoute.region;
  if (currentRoute?.country) return currentRoute.country;

  // 3. Historial reciente — buscar menciones de lugar
  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-6).map(h => h.content || '').join(' ');
    const histMatch = recent.match(/\b(?:en|in)\s+([A-ZÁÉÍÓÚÑ\u00C0-\u024F][a-záéíóúñ\u00E0-\u024FA-Za-z\s]{2,25})/);
    if (histMatch) return histMatch[1].trim();
  }

  return null;
}

async function searchPlacesForHelp(query, location, placesKey, coords) {
  if (!query || !location || !placesKey) return null;

  const searchText = `${query} ${location}`;

  // Text Search — si tenemos coordenadas, usarlas con radio para resultados cercanos
  let searchResults;
  try {
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText)}&language=es&key=${placesKey}`;
    if (coords && coords.lat && coords.lng) {
      url += `&location=${coords.lat},${coords.lng}&radius=1500`;
    }
    const res = await fetch(url);
    searchResults = await res.json();
  } catch (e) {
    return null;
  }

  if (!searchResults?.results?.length) return null;

  // Top 3 resultados → Place Details en paralelo para teléfono
  const top = searchResults.results.slice(0, 3);
  const detailPromises = top.map(place => {
    if (!place.place_id) return Promise.resolve(null);
    return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,international_phone_number,formatted_address,rating,opening_hours&language=es&key=${placesKey}`)
      .then(r => r.json()).catch(() => null);
  });
  const details = await Promise.all(detailPromises);

  const results = [];
  top.forEach((place, i) => {
    const detail = details[i]?.result;
    const name = detail?.name || place.name || '';
    const phone = detail?.international_phone_number || detail?.formatted_phone_number || '';
    const address = detail?.formatted_address || place.formatted_address || '';
    const rating = detail?.rating || place.rating || null;

    if (name) {
      results.push({
        name,
        phone: phone || '',
        address: address || '',
        rating: rating ? `${rating}★` : '',
      });
    }
  });

  return results.length > 0 ? results : null;
}

async function fetchWeather(location, openweatherKey) {
  if (!location) return null;

  // ─── Primario: OpenWeatherMap (rápido, fiable) ───
  if (openweatherKey) {
    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${openweatherKey}`, { signal: AbortSignal.timeout(6000) });
      const geoData = await geoRes.json();
      if (geoData?.[0]) {
        const { lat, lon, name, country } = geoData[0];
        const wxRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${openweatherKey}`, { signal: AbortSignal.timeout(6000) });
        const wxData = await wxRes.json();
        if (wxData?.list) {
          const now = wxData.list[0];
          // Agrupar forecast por día (max/min)
          const days = {};
          for (const item of wxData.list) {
            const date = item.dt_txt.split(' ')[0];
            if (!days[date]) days[date] = { date, temps: [], descs: [], rain: [] };
            days[date].temps.push(item.main.temp);
            days[date].descs.push(item.weather[0].description);
            days[date].rain.push(item.pop || 0);
          }
          const forecast = Object.values(days).slice(0, 3).map(d => ({
            date: d.date,
            max_c: String(Math.round(Math.max(...d.temps))),
            min_c: String(Math.round(Math.min(...d.temps))),
            description: d.descs[Math.floor(d.descs.length / 2)],
            rain_chance: String(Math.round(Math.max(...d.rain) * 100)),
          }));
          return {
            location: name || location,
            country: country || '',
            current: {
              temp_c: String(Math.round(now.main.temp)),
              feels_like: String(Math.round(now.main.feels_like)),
              description: now.weather[0].description,
              humidity: String(now.main.humidity),
              wind_kmph: String(Math.round(now.wind.speed * 3.6)),
            },
            forecast,
            links: [
              `https://openweathermap.org/city/${wxData.city?.id || ''}`,
            ],
          };
        }
      }
    } catch (_) { /* fallback a wttr.in */ }
  }

  // ─── Fallback: wttr.in (sin key, menos fiable) ───
  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1&lang=es`, {
      headers: { 'User-Agent': 'BorradoDelMapa/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();

    if (!data?.current_condition?.[0] || !data?.weather) return null;

    const current = data.current_condition[0];
    const forecast = data.weather.slice(0, 3);

    return {
      location: data.nearest_area?.[0]?.areaName?.[0]?.value || location,
      country: data.nearest_area?.[0]?.country?.[0]?.value || '',
      current: {
        temp_c: current.temp_C,
        feels_like: current.FeelsLikeC,
        description: current.lang_es?.[0]?.value || current.weatherDesc?.[0]?.value || '',
        humidity: current.humidity,
        wind_kmph: current.windspeedKmph,
      },
      forecast: forecast.map(day => ({
        date: day.date,
        max_c: day.maxtempC,
        min_c: day.mintempC,
        description: day.hourly?.[4]?.lang_es?.[0]?.value || day.hourly?.[4]?.weatherDesc?.[0]?.value || '',
        rain_chance: day.hourly?.[4]?.chanceofrain || '0',
      })),
      links: [
        `https://www.weather.com/es-ES/clima/hoy/l/${encodeURIComponent(location)}`,
      ],
    };
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA DE EVENTOS LOCALES (Serper.dev)
// ═══════════════════════════════════════════════════════════════

async function searchEvents(destination, dateFrom, dateTo, serperKey) {
  if (!destination || !dateFrom || !serperKey) return null;
  try {
    const fromDate = new Date(dateFrom);
    const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const month = monthNames[fromDate.getMonth()];
    const year = fromDate.getFullYear();
    const query = `eventos ${destination} ${month} ${year} festivales cultura fiestas`;

    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        gl: 'es',
        hl: 'es',
        num: 5,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();

    const results = (data.organic || []).slice(0, 5).map(r => ({
      title: r.title || '',
      snippet: r.snippet || '',
    }));

    return results.length > 0 ? results : null;
  } catch (e) {
    return null;
  }
}

function getCountryCode(countryName) {
  if (!countryName) return '';
  const norm = countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const map = {
    'afganistan':'AF','albania':'AL','alemania':'DE','germany':'DE','andorra':'AD',
    'angola':'AO','argentina':'AR','armenia':'AM','australia':'AU','austria':'AT',
    'azerbaiyan':'AZ','bahamas':'BS','bangladesh':'BD','barbados':'BB','barein':'BH','bahrain':'BH',
    'belgica':'BE','belgium':'BE','belice':'BZ','benin':'BJ','bielorrusia':'BY','belarus':'BY',
    'birmania':'MM','myanmar':'MM','bolivia':'BO','bosnia':'BA','botsuana':'BW','botswana':'BW',
    'brasil':'BR','brazil':'BR','brunei':'BN','bulgaria':'BG','burkina faso':'BF','burundi':'BI',
    'butan':'BT','bhutan':'BT','cabo verde':'CV','camboya':'KH','cambodia':'KH',
    'camerun':'CM','cameroon':'CM','canada':'CA','catar':'QA','qatar':'QA','chad':'TD',
    'chile':'CL','china':'CN','chipre':'CY','cyprus':'CY','colombia':'CO',
    'corea del norte':'KP','corea del sur':'KR','south korea':'KR',
    'costa de marfil':'CI','costa rica':'CR','croacia':'HR','croatia':'HR',
    'cuba':'CU','dinamarca':'DK','denmark':'DK','ecuador':'EC','egipto':'EG','egypt':'EG',
    'el salvador':'SV','emiratos':'AE','eritrea':'ER','eslovaquia':'SK','slovakia':'SK',
    'eslovenia':'SI','slovenia':'SI','espana':'ES','spain':'ES',
    'estados unidos':'US','eeuu':'US','usa':'US','united states':'US',
    'estonia':'EE','etiopia':'ET','ethiopia':'ET','filipinas':'PH','philippines':'PH',
    'finlandia':'FI','finland':'FI','fiyi':'FJ','fiji':'FJ',
    'francia':'FR','france':'FR','gabon':'GA','gambia':'GM','georgia':'GE',
    'ghana':'GH','grecia':'GR','greece':'GR','guatemala':'GT','guinea':'GN',
    'guinea ecuatorial':'GQ','guyana':'GY','haiti':'HT','honduras':'HN',
    'hungria':'HU','hungary':'HU','india':'IN','indonesia':'ID',
    'irak':'IQ','iraq':'IQ','iran':'IR','irlanda':'IE','ireland':'IE',
    'islandia':'IS','iceland':'IS','israel':'IL','italia':'IT','italy':'IT',
    'jamaica':'JM','japon':'JP','japan':'JP','jordania':'JO','jordan':'JO',
    'kazajistan':'KZ','kazakhstan':'KZ','kenia':'KE','kenya':'KE',
    'kirguistan':'KG','kyrgyzstan':'KG','kuwait':'KW','laos':'LA',
    'letonia':'LV','latvia':'LV','libano':'LB','lebanon':'LB',
    'liberia':'LR','libia':'LY','libya':'LY','liechtenstein':'LI',
    'lituania':'LT','lithuania':'LT','luxemburgo':'LU','luxembourg':'LU',
    'macedonia':'MK','madagascar':'MG','malasia':'MY','malaysia':'MY',
    'maldivas':'MV','maldives':'MV','mali':'ML','malta':'MT',
    'marruecos':'MA','morocco':'MA','mauricio':'MU','mauritius':'MU',
    'mauritania':'MR','mexico':'MX','moldavia':'MD','moldova':'MD',
    'monaco':'MC','mongolia':'MN','montenegro':'ME','mozambique':'MZ',
    'namibia':'NA','nepal':'NP','nicaragua':'NI','niger':'NE','nigeria':'NG',
    'noruega':'NO','norway':'NO','nueva zelanda':'NZ','new zealand':'NZ',
    'oman':'OM','paises bajos':'NL','holanda':'NL','netherlands':'NL',
    'pakistan':'PK','palestina':'PS','panama':'PA','papua nueva guinea':'PG',
    'paraguay':'PY','peru':'PE','polonia':'PL','poland':'PL',
    'portugal':'PT','reino unido':'GB','uk':'GB','united kingdom':'GB','england':'GB',
    'republica checa':'CZ','czech republic':'CZ','chequia':'CZ',
    'republica dominicana':'DO','dominican republic':'DO',
    'rumania':'RO','romania':'RO','rusia':'RU','russia':'RU',
    'ruanda':'RW','rwanda':'RW','senegal':'SN','serbia':'RS',
    'singapur':'SG','singapore':'SG','siria':'SY','syria':'SY',
    'somalia':'SO','sri lanka':'LK','sudafrica':'ZA','south africa':'ZA',
    'sudan':'SD','suecia':'SE','sweden':'SE','suiza':'CH','switzerland':'CH',
    'tailandia':'TH','thailand':'TH','taiwan':'TW','tanzania':'TZ',
    'tunez':'TN','tunisia':'TN','turquia':'TR','turkey':'TR','turkiye':'TR',
    'ucrania':'UA','ukraine':'UA','uganda':'UG','uruguay':'UY',
    'uzbekistan':'UZ','venezuela':'VE','vietnam':'VN','yemen':'YE',
    'zambia':'ZM','zimbabue':'ZW','zimbabwe':'ZW'
  };
  if (map[norm]) return map[norm];
  for (const [key, code] of Object.entries(map)) {
    if (norm.includes(key) || key.includes(norm)) return code;
  }
  return '';
}

// ═══════════════════════════════════════════════════════════════
// RESPUESTA DIRECTA DEL KV — sin llamar a Claude
// ═══════════════════════════════════════════════════════════════

function tryKVDirectAnswer(message, country, destination) {
  if (!country) return null;
  const m = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const c = country;
  const pais = c.pais || '';

  // ── Vacunas ──
  if (/vacuna|vaccine|inmuniza/i.test(m)) {
    return `**Vacunas para ${pais}:**\n${c.vacunas}\n\nAgua potable: ${c.agua_potable}\n\nEsto es orientativo — confirma con tu centro de vacunación internacional antes de viajar.`;
  }

  // ── Visado ──
  if (/visado|visa|pasaporte|documentos?.*entrar|necesito.*para.*entrar|requisitos.*entrada/i.test(m)) {
    let reply = `**Visado para ${pais}:**\n\nEspañoles: ${c.visado_espanoles}\nCiudadanos EU: ${c.visado_eu}`;
    reply += `\n\nEsto es orientativo — confirma con la embajada o consulado para tu caso concreto.`;
    return reply;
  }

  // ── Moneda / dinero ──
  if (/moneda|currency|dinero|cambio|euros?|dolares?|cajero|atm|pagar|efectivo|tarjeta/i.test(m)) {
    return `**Moneda en ${pais}:** ${c.moneda}\nCambio aproximado: ${c.cambio_aprox_eur}\n\nPropinas: ${c.propinas}`;
  }

  // ── Enchufes ──
  if (/enchufe|plug|adaptador|voltaje|corriente|electricidad/i.test(m)) {
    return `**Enchufes en ${pais}:** ${c.enchufes}\n\nLlévate un adaptador universal por si acaso.`;
  }

  // ── Seguridad ──
  if (/segur|seguridad|peligro|safe|dangerous|robo|estafa|scam|cuidado/i.test(m)) {
    return `**Seguridad en ${pais}:** ${c.seguridad}\n\nEmergencias: ${c.emergencias}`;
  }

  // ── Mejor época ──
  if (/mejor.?epoca|cuando.*ir|cuando.*viajar|best.*time|temporada|estacion|clima|weather/i.test(m)) {
    return `**Mejor época para ${pais}:**\n${c.mejor_epoca}\n\n**Evitar:** ${c.evitar_epoca}`;
  }

  // ── Presupuesto / coste ──
  if (/presupuesto|budget|cuanto.*cuesta|coste|caro|barato|precio|gastar|dinero.*dia|cost/i.test(m)) {
    return `**Coste diario en ${pais}:**\n\nMochilero: **${c.coste_diario_mochilero}**/día\nViajero medio: **${c.coste_diario_medio}**/día\n\nMoneda: ${c.moneda} (${c.cambio_aprox_eur})\nPropinas: ${c.propinas}`;
  }

  // ── Idioma ──
  if (/idioma|language|hablan|inglés|ingles|comunicar/i.test(m)) {
    return `**Idioma en ${pais}:** ${c.idioma_oficial}\n\nPara viajeros: ${c.idioma_viajero}`;
  }

  // ── Emergencias ──
  if (/emergencia|emergency|telefono.*urgencia|numero.*emergencia|policia|ambulancia|hospital/i.test(m)) {
    return `**Emergencias en ${pais}:** ${c.emergencias}\nPrefijo telefónico: ${c.prefijo_tel}`;
  }

  // ── Capital ──
  if (/capital|ciudad.*principal|capital.*pais/i.test(m)) {
    return `La capital de **${pais}** es **${c.capital}**.`;
  }

  // ── Prefijo / llamar desde fuera ──
  if (/prefijo|codigo.*pais|codigo.*telefono|llamar.*desde|marcar.*desde|phone.*code|dial/i.test(m)) {
    return `**Prefijo telefónico de ${pais}:** ${c.prefijo_tel}\n\nEmergencias locales: ${c.emergencias}`;
  }

  // ── Apps de transporte / taxi ──
  if (/app.*taxi|app.*transporte|uber|grab|bolt|taxi.*app|como.*moverme|transporte.*local|app.*moverse/i.test(m)) {
    const apps = c.apps_transporte || c.transporte_apps;
    if (apps) return `**Apps de transporte en ${pais}:**\n\n${apps}`;
  }

  // ── Conducción / izquierda o derecha ──
  if (/conduct|conduc|izquierda|derecha|left.*side|right.*side|driving.*side|alquil.*coche|coche.*alquil|manejar/i.test(m)) {
    const lado = c.conduce_izquierda ? 'por la **izquierda** 🚗' : 'por la **derecha** 🚗';
    let reply = `En **${pais}** se conduce ${lado}.`;
    if (c.carnet_internacional) reply += `\n\nCarnet internacional: ${c.carnet_internacional}`;
    return reply;
  }

  // ── Agua potable ──
  if (/agua.*potable|agua.*grifo|beber.*agua|agua.*segura|tap.*water|drinking.*water/i.test(m)) {
    return `**Agua en ${pais}:** ${c.agua_potable}`;
  }

  // ── Propinas ──
  if (/propina|tip|tipping|propinas/i.test(m)) {
    return `**Propinas en ${pais}:** ${c.propinas}`;
  }

  // ── SIM / conectividad ──
  if (/sim|tarjeta.*sim|internet.*movil|datos.*movil|esim|roaming|wifi|conectividad/i.test(m)) {
    const sim = c.sim_local || c.conectividad;
    if (sim) return `**Conectividad en ${pais}:**\n\n${sim}`;
  }

  // ── Salud / sanidad ──
  if (/sanidad|sanid|seguro.*medico|medico|salud|health|farmacia|medicine/i.test(m)) {
    const salud = c.salud || c.seguro_medico;
    if (salud) return `**Salud en ${pais}:**\n\n${salud}\n\nVacunas: ${c.vacunas}`;
  }

  // ── Info general del país (pregunta amplia) ──
  if (/info|informacion|cuentame|dime.*sobre|que.*saber|datos|basico|practica|practico|general/i.test(m)) {
    let reply = `**${pais}** — Info práctica:\n\n`;
    reply += `Capital: **${c.capital}**\n`;
    reply += `Idioma: ${c.idioma_oficial}\n`;
    reply += `Moneda: ${c.moneda} (${c.cambio_aprox_eur})\n`;
    reply += `Visado (españoles): ${c.visado_espanoles}\n`;
    reply += `Enchufes: ${c.enchufes}\n`;
    reply += `Emergencias: ${c.emergencias}\n`;
    reply += `Seguridad: ${c.seguridad}\n\n`;
    reply += `Mejor época: ${c.mejor_epoca}\n\n`;
    reply += `Coste mochilero: ${c.coste_diario_mochilero}/día | Medio: ${c.coste_diario_medio}/día\n\n`;
    reply += `${c.curiosidad_viajera}`;
    return reply;
  }

  // ── Destino específico (si tenemos datos nivel 2) ──
  if (destination) {
    const d = destination;
    if (/donde.*dormir|alojamiento|hostal|hotel|hospeda|donde.*queda|sleep|stay/i.test(m)) {
      return `**Dónde dormir en ${d.nombre}:**\n\nMochilero: ${d.donde_dormir?.mochilero}\nMedio: ${d.donde_dormir?.medio}\nConfort: ${d.donde_dormir?.comfort}`;
    }
    if (/donde.*comer|restaurante|comida|cena|cenar|eat|food/i.test(m)) {
      return `**Dónde comer en ${d.nombre}:**\n${d.donde_comer}`;
    }
    if (/como.*llegar|llegar|transporte|ir.*a|get.*to|how.*get/i.test(m)) {
      return `**Cómo llegar a ${d.nombre}:**\n${d.como_llegar}`;
    }
    if (/que.*hacer|actividades|ver|visit|hacer|planes|things.*do/i.test(m)) {
      let reply = `**Qué hacer en ${d.nombre} (${d.dias_recomendados} días recomendados):**\n\n`;
      if (d.que_hacer) reply += d.que_hacer.map(a => '— ' + a).join('\n');
      if (d.consejo_local) reply += `\n\n**Consejo local:** ${d.consejo_local}`;
      return reply;
    }
    if (/lluvia|llueve|mal.*tiempo|plan.*b|rain/i.test(m)) {
      return `**Plan B si llueve en ${d.nombre}:**\n${d.plan_b_lluvia}`;
    }
  }

  // No match → dejar que Claude responda
  return null;
}

// ═══════════════════════════════════════════════════════════════
// CONSTRUIR MENSAJES
// ═══════════════════════════════════════════════════════════════

function buildMessages(history, message, currentRoute, userName, userNationality, helpResults, weatherData, userLocation, userLocationName, eventData, travelDates, transport, withKids, coinsSaldo, rutasGratisUsadas, kvCountryData, kvDestinationData, kvTransportData, imageBase64, dynamicPrompt, mapMode) {
  // ── Seleccionar prompt base según contexto ──
  // Si es petición de guía o edición de ruta → prompt con BLOQUE_RUTAS
  // Si no → prompt SIN BLOQUE_RUTAS (Claude no ve cómo generar guías = no las genera)
  // IMPORTANTE: dynamicPrompt (Firestore) incluye BLOQUE_RUTAS, así que solo se usa para rutas
  const isRoute = isRouteRequest(message, history);
  const hasCurrentRouteEdit = currentRoute && currentRoute.stops && currentRoute.stops.length > 0;
  let systemPrompt;
  if (isRoute || hasCurrentRouteEdit) {
    systemPrompt = dynamicPrompt || SALMA_SYSTEM_ROUTE;
  } else if (isDaysDestination(message)) {
    systemPrompt = SALMA_SYSTEM_PLAN;  // días+destino → formato estructurado por días
  } else {
    systemPrompt = SALMA_SYSTEM_CHAT;  // conversación normal
  }

  // Contexto mínimo del usuario + fecha actual
  const ctx = [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  ctx.push(`[FECHA ACTUAL: ${today}]`);
  if (userName) ctx.push(`[USUARIO: ${userName}]`);

  // ── Coins y rutas gratis ──
  const rutasGratisRestantes = Math.max(0, 3 - (rutasGratisUsadas || 0));
  const coins = coinsSaldo || 0;
  ctx.push(`[SALMA COINS: ${coins} | RUTAS GRATIS RESTANTES: ${rutasGratisRestantes}/3]`);
  ctx.push(`[INSTRUCCIONES SOBRE COINS — Lee atentamente:
- El usuario tiene ${rutasGratisRestantes} ruta${rutasGratisRestantes !== 1 ? 's' : ''} gratis y ${coins} Salma Coins.
- Si le quedan rutas gratis (>0): al generar una ruta, dile de forma natural cuántas le quedan después. Ejemplo: "Ya tienes tu ruta. Te queda 1 ruta gratis más — aprovéchala bien."
- Si NO le quedan rutas gratis y NO tiene coins: ÚNICAMENTE si el usuario ha escrito exactamente "salma hazme una guía" o "hazme una guía salma", dile que se le acabaron las gratis y que necesita Salma Coins. NUNCA lo menciones por "3 días en X", "itinerario", "ruta", destino+días ni ninguna otra frase — solo esa frase exacta lo activa.
- Si tiene coins: no hace falta mencionarlos salvo que le quede 1 solo. En ese caso: "Por cierto, te queda 1 coin. Para esta ruta necesitarás alguno más."
- REGLA CRÍTICA: "3 días en Ronda", "quiero ir a X", "itinerario para Y", "ruta por Z" → responde con información del destino. NUNCA menciones coins, guías ni ventas. Los coins solo aparecen cuando se activa el modo guía con la frase exacta.
- NUNCA digas precios de los packs ni hagas de vendedora. Solo informa del saldo y señala el botón.]`);
  if (userNationality) ctx.push(`[NACIONALIDAD: ${userNationality} — adapta visados]`);
  if (userLocation) {
    const locName = userLocationName ? ` (${userLocationName})` : '';
    // IATA por nombre de ciudad, o por coordenadas como fallback
    const locIATA = getCityIATA(userLocationName) || (userLocation.lat && userLocation.lng ? getIATAFromCoords(userLocation.lat, userLocation.lng)?.iata : null);
    const iataName = getCityIATA(userLocationName) ? userLocationName : (getIATAFromCoords(userLocation.lat, userLocation.lng)?.name || userLocationName);
    const iataHint = locIATA ? ` — Aeropuerto más cercano: ${locIATA} (${iataName}). Para vuelos "desde donde estoy" usa origen: ${locIATA}, NO el hub nacional.` : '';
    ctx.push(`[UBICACIÓN DEL VIAJERO${locName}: lat=${userLocation.lat}, lng=${userLocation.lng} — El viajero está AQUÍ. Para Google Maps usa SIEMPRE estas coordenadas como origen: ${userLocation.lat},${userLocation.lng}${iataHint}]`);
  }
  if (travelDates && travelDates.from) {
    ctx.push(`[FECHAS DE VIAJE: del ${travelDates.from} al ${travelDates.to} — menciona estacionalidad, clima esperado y festivos que coincidan]`);
  }
  if (transport) {
    ctx.push(`[TRANSPORTE: ${transport} — adapta distancias y paradas]`);
  }
  if (withKids) {
    ctx.push(`[VIAJA CON NIÑOS — adapta paradas y ritmo, incluye planes kid-friendly]`);
  }

  // ── Datos verificados del KV (nivel 1 + nivel 2) ──
  if (kvCountryData) {
    const c = kvCountryData;
    ctx.push(`[DATOS VERIFICADOS DEL PAÍS — usa estos datos, NO inventes:
País: ${c.pais} | Capital: ${c.capital} | Idioma: ${c.idioma_oficial}
Moneda: ${c.moneda} (${c.cambio_aprox_eur}) | Huso: ${c.huso_horario}
Visado españoles: ${c.visado_espanoles} | Visado EU: ${c.visado_eu}
Enchufes: ${c.enchufes} | Agua potable: ${c.agua_potable}
Emergencias: ${c.emergencias} | Prefijo: ${c.prefijo_tel}
Mejor época: ${c.mejor_epoca}
Evitar: ${c.evitar_epoca}
Seguridad: ${c.seguridad}
Vacunas: ${c.vacunas}
Coste mochilero: ${c.coste_diario_mochilero}/día | Medio: ${c.coste_diario_medio}/día
Propinas: ${c.propinas}]`);

    // Bloque transporte del nivel 1 (taxi/tren/bus/ferry/coche)
    if (c.transporte) {
      const t = c.transporte;
      const tLines = [];
      if (t.taxi?.length) tLines.push(`Taxi/ride-hailing: ${t.taxi.map(a => a.nombre + (a.url && a.url !== 'null' ? ` (${a.url})` : '') + (a.nota ? ' — ' + a.nota : '')).join(' | ')}`);
      if (t.tren?.operadora) tLines.push(`Tren: ${t.tren.operadora}${t.tren.url ? ' → ' + t.tren.url : ''}${t.tren.plataforma_global ? ' | Global: ' + t.tren.plataforma_global : ''}`);
      if (t.bus_interurbano?.plataforma) tLines.push(`Bus interurbano: ${t.bus_interurbano.plataforma}${t.bus_interurbano.url ? ' → ' + t.bus_interurbano.url : ''}`);
      if (t.ferry_maritimo?.existe) tLines.push(`Ferry marítimo: ${t.ferry_maritimo.plataforma || 'disponible'}${t.ferry_maritimo.url ? ' → ' + t.ferry_maritimo.url : ''}${t.ferry_maritimo.url_global ? ' | Global: ' + t.ferry_maritimo.url_global : ''}`);
      if (t.ferry_fluvial?.existe) tLines.push(`Ferry fluvial: ${t.ferry_fluvial.descripcion || ''}${t.ferry_fluvial.plataforma ? ' — ' + t.ferry_fluvial.plataforma : ''}${t.ferry_fluvial.url_global ? ' | Global: ' + t.ferry_fluvial.url_global : ''}`);
      if (t.alquiler_coche?.length) tLines.push(`Alquiler de coche: ${t.alquiler_coche.map(a => a.nombre).join(', ')}`);
      if (tLines.length) ctx.push(`[TRANSPORTE VERIFICADO EN ${c.pais?.toUpperCase() || 'EL PAÍS'}:\n${tLines.join('\n')}\nRecomienda por nombre ("descárgate Grab"). Para reservas usa buscar_web.]`);
    }
  }

  if (kvTransportData) {
    const t = kvTransportData;
    const lines = [];
    if (t.ridehailing) {
      const r = t.ridehailing;
      lines.push(`Ride-hailing: ${r.best || ''} (también: ${(r.others || []).join(', ')}). ${r.tips || ''}`);
    }
    if (t.train) {
      const tr = t.train;
      lines.push(`Tren: apps ${(tr.apps || []).join(', ')}. ${tr.tips || ''}`);
    }
    if (t.metro_bus) {
      const m = t.metro_bus;
      lines.push(`Metro/bus: apps ${(m.apps || []).join(', ')}. ${m.tips || ''}`);
    }
    if (t.ferry) {
      const f = t.ferry;
      lines.push(`Ferry: apps ${(f.apps || []).join(', ')}. ${f.tips || ''}`);
    }
    if (t.special) {
      const s = t.special;
      lines.push(`Transporte especial: ${(s.types || []).join(', ')}. ${s.tips || ''}`);
    }
    if (lines.length > 0) {
      ctx.push(`[TRANSPORTE EN EL DESTINO — usa estos datos cuando el viajero pregunte por moverse:
${lines.join('\n')}
INSTRUCCIÓN: usa estos datos cuando pregunten por transporte. Recomienda apps por NOMBRE ("descárgate Grab"). Si el viajero quiere RESERVAR un taxi o transfer, usa buscar_web para encontrar una web real de reserva en ese país — no inventes URLs. Da precios y consejos prácticos si los tienes.]`);
    }
  }

  if (kvDestinationData) {
    const d = kvDestinationData;
    let destCtx = `[DATOS VERIFICADOS DEL DESTINO — usa estos datos para la ruta:
Destino: ${d.nombre} (${d.tipo}) | Región: ${d.region}
Días recomendados: ${d.dias_recomendados} | Mejor época: ${d.mejor_epoca}
Cómo llegar: ${d.como_llegar}
Dónde dormir: Mochilero: ${d.donde_dormir?.mochilero} | Medio: ${d.donde_dormir?.medio} | Comfort: ${d.donde_dormir?.comfort}
Dónde comer: ${d.donde_comer}
Consejo local: ${d.consejo_local}
Plan B lluvia: ${d.plan_b_lluvia}`;
    if (d.que_hacer && d.que_hacer.length > 0) {
      destCtx += '\nQué hacer: ' + d.que_hacer.join(' | ');
    }
    destCtx += ']';
    ctx.push(destCtx);
  }

  systemPrompt += '\n\n' + ctx.join('\n');

  const messages = [];
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-12).forEach(h => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }

  let userContent = message || '';
  if (currentRoute && currentRoute.stops && currentRoute.stops.length > 0) {
    const stopSummary = currentRoute.stops.map((s, i) => `Día ${s.day}: ${s.name}`).join(', ');
    userContent += `\n\n[RUTA ACTUAL del usuario: "${currentRoute.title || ''}" — ${currentRoute.stops.length} paradas: ${stopSummary}. Si el usuario pide CAMBIOS (añadir, quitar, reordenar), devuelve la ruta completa actualizada en SALMA_ROUTE_JSON manteniendo las paradas que no cambian. Si pide una RUTA NUEVA (otro destino), ignora esta ruta y genera desde cero.]`;
  }

  if (isRouteRequest(message, history)) {
    userContent += `\n\n[OBLIGATORIO — GENERA RUTA AHORA:
— Tu respuesta DEBE contener SALMA_ROUTE_JSON. Formato: 1-2 frases sobre el destino + salto de línea + SALMA_ROUTE_JSON + JSON completo.
— NO respondas solo con texto. NO digas "aquí tienes" ni variantes.
— Usa defaults para lo que falte: tipo mezcla cultura+emblemáticos, compañía solo, ritmo intermedio.
— MÍNIMO 4-6 PARADAS POR DÍA. Nunca 1 parada por día. Cada día es un recorrido completo con desayuno, visitas, comida, paseo, atardecer.
— 1 enlace Google Maps por día en maps_links, NO 1 enlace para toda la ruta.
— Nombres EXACTOS como en Google Maps, nunca genéricos ("Desierto del Sahara" → "Erg Chebbi, Merzouga").
— Coordenadas REALES del lugar exacto, en el país correcto.
— Continuidad: la primera parada del día N+1 empieza donde acabó el día N.]`;
  } else if (isDaysDestination(message)) {
    // Destino + días → respuesta estructurada por días (sin JSON, sin ruta)
    userContent += `\n\n[MODO PLAN DE VIAJE — INSTRUCCIONES ESTRICTAS:

PROHIBIDO: SALMA_ROUTE_JSON, preguntar, mencionar guías/coins, inventar URLs, párrafos largos.

BREVEDAD OBLIGATORIA: máximo 2-3 frases por parada. Dato histórico/cultural + precio + tiempo. Sin prosa. Sin rodeos. Sin repetir lo que ya dijiste.

FORMATO: cada parada es 1 párrafo corto con nombre en negrita + enlace Maps + 1-2 frases útiles.

Ejemplo: **Puente Nuevo** (https://www.google.com/maps/search/Puente+Nuevo+Ronda) — 42 años de obras (1751-1793), cámara interior que fue cárcel. Baja al Camino de los Molinos para la mejor vista. 1h. Gratis.

4-5 paradas por día. Cada día termina con dónde comer (nombre + enlace + plato + precio).
Al final: transporte, presupuesto diario, alternativas.
Cierra con: "Si quieres la guía completa con mapa y navegación, dime 'Salma hazme una guía'."

FOTOS: usa buscar_foto para 1 lugar por día MÍNIMO. Llama a buscar_foto varias veces — 1 por día.]`;
  } else {
    userContent += `\n\n[MODO CONVERSACIONAL — INSTRUCCIONES ESTRICTAS:

PROHIBIDO:
— Generar SALMA_ROUTE_JSON bajo ningún concepto.
— Preguntar "¿qué tipo de viaje?", "¿con quién vas?", "¿qué quieres hacer?" ni ninguna pregunta para personalizar una ruta.
— Mencionar guías, rutas, coins, Salma Coins o el modo guía.
— Inventar URLs. CERO URLs salvo las que devuelva una herramienta o google.com/maps/dir/.
— Poner negritas como título en línea sola (**Transporte:**, **Para comer:**). Las negritas son solo para datos inline: **8€**, **Lomprayah**, **2h30**.
— Hacer preguntas al final del mensaje. Si quieres ofrecer ayuda, ofrece sin preguntar: "Si quieres que te busque hotel o algo concreto, dime." NO "¿Quieres que te busque hotel?"

QUÉ HACER:
— Responde con información RICA del destino: historia, cultura, contexto, qué ver, qué comer, clima, transporte, seguridad, datos prácticos.
— Mete datos históricos y culturales siempre que sea relevante — por qué un lugar es como es, quién lo construyó, qué pasó ahí.
— Todo en PROSA fluida, como si lo contaras en un bar. Sin secciones, sin títulos, sin listas.
— ENLACES GOOGLE MAPS OBLIGATORIOS: cada lugar concreto que menciones (monumento, plaza, restaurante, mirador, barrio) lleva su enlace Google Maps justo después del nombre. Formato: https://www.google.com/maps/search/Nombre+del+Lugar+Ciudad. Ejemplo: "El **Puente Nuevo** (https://www.google.com/maps/search/Puente+Nuevo+Ronda) se terminó en 1793...". Sin esto, el usuario no puede llegar — y para eso se va a Google.
— Si mencionas un lugar concreto con nombre propio, usa buscar_foto para mostrar 1-3 fotos.
— Si mencionas transporte entre ciudades (ferry, bus, tren), usa buscar_web para obtener URLs reales de reserva. NUNCA inventes URLs de 12go, skyscanner, rome2rio ni ninguna otra.
— Si el contexto incluye datos del KV (país, transporte, destino), ÚSALOS. No los ignores.
— Habla con opinión propia, dato directo, sin rodeos.]`;
  }

  // Si Salma preguntó antes y el usuario responde, forzar generación
  // SOLO cuando hay ruta activa o es petición de guía — en conversación normal NO
  if (isRoute || hasCurrentRouteEdit) {
    if (Array.isArray(history) && history.length >= 2) {
      const lastAssistant = history.filter(h => h.role === 'assistant').pop();
      if (lastAssistant && lastAssistant.content && /\?/.test(lastAssistant.content)) {
        userContent += '\n\n[IMPORTANTE: Ya preguntaste y el usuario responde. Si incluye destino/días/tipo, GENERA LA RUTA YA. No preguntes más.]';
      }
    }
  }

  if (mapMode) {
    systemPrompt += '\n\n⚠️ MODO MAPA ACTIVO: El usuario está usando el botón de guardar lugar en su mapa. Su mensaje describe un lugar (monumento, hotel, restaurante, playa, catedral, mercado...) o adjunta una foto de ese lugar. Tu única tarea: identificar el lugar, escribir 1 frase útil sobre él, y emitir OBLIGATORIAMENTE en la última línea: SALMA_ACTION:{"type":"MAP_PIN","name":"Nombre exacto como en Google Maps","address":"Ciudad, País","description":"Una frase útil","place_type":"hotel|monument|restaurant|beach|park|other"}. Si no puedes identificar el lugar con certeza, pregunta: "¿De qué lugar se trata? Dame el nombre o la ciudad."';
  }

  // Inyectar resultados de búsqueda de ayuda al viajero
  if (helpResults && helpResults.length > 0) {
    const formatted = helpResults.map((r, i) => {
      const parts = [`${i + 1}. ${r.name}`];
      if (r.phone) parts.push(r.phone);
      if (r.address) parts.push(r.address);
      if (r.rating) parts.push(r.rating);
      return parts.join(' — ');
    }).join('\n');

    userContent += `\n\n[RESULTADOS DE BÚSQUEDA REAL — Google Places:\n${formatted}\nSÉ BREVE Y DIRECTA. USA FORMATO VISUAL: pon cada resultado en su propia línea con **nombre en negrita** seguido del teléfono. Separa con saltos de línea. PRIMERO los datos, DESPUÉS tu consejo en 1-2 frases. Ejemplo de formato:\n\n**Nombre del sitio** — +66 77 425 123\nDirección, rating\n\n**Otro sitio** — +66 77 960 456\nDirección, rating\n\nConsejo breve.\n\nDi "llama antes para confirmar" porque horarios pueden cambiar. Si no hay teléfono, dilo. NUNCA inventes datos.]`;
  }

  // Inyectar datos del tiempo
  if (weatherData) {
    const cur = weatherData.current;
    const forecastLines = weatherData.forecast.map(d =>
      `${d.date}: ${d.min_c}–${d.max_c}°C, ${d.description}, probabilidad lluvia ${d.rain_chance}%`
    ).join('\n');

    userContent += `\n\n[DATOS DEL TIEMPO REAL — wttr.in para ${weatherData.location}${weatherData.country ? ', ' + weatherData.country : ''}:
AHORA: ${cur.temp_c}°C (sensación ${cur.feels_like}°C), ${cur.description}, humedad ${cur.humidity}%, viento ${cur.wind_kmph} km/h
PRÓXIMOS DÍAS:
${forecastLines}
ENLACES para pronóstico actualizado:
weather.com: ${weatherData.links[0]}
yr.no: ${weatherData.links[1]}
SÉ BREVE Y DIRECTA. USA FORMATO VISUAL con saltos de línea y **negritas** para separar datos. Ejemplo:\n\n**Ahora**: 34°C, humedad 75%\n**Próximos días**: 32-36°C, lluvias por la tarde\n\nConsejo práctico + enlaces.\n\nIncluye los enlaces para pronóstico actualizado. Menciona que puede cambiar. NUNCA inventes datos.]`;
  }

  // Inyectar eventos locales (búsqueda web)
  if (eventData && eventData.length > 0) {
    const formatted = eventData.map((r, i) =>
      `${i + 1}. ${r.title}\n   ${r.snippet}`
    ).join('\n');

    userContent += `\n\n[EVENTOS LOCALES EN ESAS FECHAS — búsqueda web:
${formatted}
Si alguno de estos eventos o festivales coincide con las fechas del viaje, menciónalo brevemente en el día que toque como dato útil. NO reestructures la ruta por un evento. Si ninguno encaja con las fechas, ignóralos. NUNCA inventes eventos.]`;
  }

  // Si hay imagen, enviar como content array (vision de OpenAI)
  if (imageBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
            detail: 'low'
          }
        },
        { type: 'text', text: userContent || 'El viajero te envía esta foto. Analízala según el contexto del viaje.' }
      ]
    });
  } else {
    messages.push({ role: 'user', content: userContent });
  }

  return { systemPrompt, messages };
}

// ═══════════════════════════════════════════════════════════════
// PARSEO DE RUTA
// ═══════════════════════════════════════════════════════════════

function extractRouteFromReply(text) {
  if (!text || typeof text !== 'string') return null;
  const marker = 'SALMA_ROUTE_JSON';
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  let after = text.slice(idx + marker.length).trim();
  after = after.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  const lines = after.split('\n');
  let jsonStr = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('{')) { jsonStr = trimmed; break; }
  }
  if (!jsonStr) jsonStr = after.split('\n')[0].trim();
  try {
    const route = JSON.parse(jsonStr);
    if (route && Array.isArray(route.stops) && route.stops.length > 0) {
      route.stops = route.stops.map(s => ({
        name: s.name || s.headline || '',
        headline: s.headline || s.name || '',
        narrative: s.narrative || s.description || '',
        context: s.context || '',
        food_nearby: s.food_nearby || '',
        local_secret: s.local_secret || '',
        alternative: s.alternative || '',
        practical: s.practical || '',
        day_title: s.day_title || '',
        links: Array.isArray(s.links) ? s.links : [],
        type: s.type || 'lugar',
        day: typeof s.day === 'number' ? s.day : (parseInt(s.day) || 1),
        lat: typeof s.lat === 'number' ? s.lat : (parseFloat(s.lat) || 0),
        lng: typeof s.lng === 'number' ? s.lng : (parseFloat(s.lng) || 0),
        photo_ref: s.photo_ref || '',
        verified_address: s.verified_address || '',
        km_from_previous: typeof s.km_from_previous === 'number' ? s.km_from_previous : (parseFloat(s.km_from_previous) || 0),
        road_name: s.road_name || '',
        road_difficulty: s.road_difficulty || '',
        estimated_hours: typeof s.estimated_hours === 'number' ? s.estimated_hours : (parseFloat(s.estimated_hours) || 0),
        sleep: s.sleep || null,
        eat: s.eat || null,
        alt_bad_weather: s.alt_bad_weather || '',
      }));
      if (!route.maps_links) route.maps_links = [];
      if (!route.pre_departure) route.pre_departure = null;
      if (!route.practical_info) route.practical_info = null;
      return route;
    }
  } catch (e) {}
  return null;
}

function replyWithoutRouteBlock(text) {
  if (!text || typeof text !== 'string') return text;
  const idx = text.indexOf('SALMA_ROUTE_JSON');
  const clean = idx === -1 ? text.trim() : text.slice(0, idx).trim();
  return sanitizeInventedUrls(clean);
}

// Elimina URLs inventadas por Claude que no vienen de herramientas.
// Solo permite: google.com/maps, y URLs que el worker inyecta (Google Places, etc.)
function sanitizeInventedUrls(text) {
  if (!text || typeof text !== 'string') return text;
  const urlRegex = /(?:https?:\/\/|[a-z]+:\/\/)[^\s<>]+/gi;
  return text.replace(urlRegex, (url) => {
    if (url.includes('google.com/maps')) return url;
    if (url.includes('googleusercontent.com') || url.includes('places.googleapis.com')) return url;
    if (url.includes('thefork.com') || url.includes('thefork.es')) return url;
    if (url.includes('booking.com')) return url;
    if (url.includes('skyscanner.es') || url.includes('skyscanner.com')) return url;
    if (url.includes('kiwi.com')) return url;
    if (url.includes('kayak.com') || url.includes('kayak.es')) return url;
    if (url.includes('momondo.com') || url.includes('momondo.es')) return url;
    if (url.includes('google.com/flights')) return url;
    if (url.includes('rentalcars.com') || url.includes('discovercars.com')) return url;
    // Reserva de transporte (ferry, bus, tren)
    if (url.includes('12go.asia') || url.includes('12go.com')) return url;
    if (url.includes('bookaway.com')) return url;
    if (url.includes('lomprayah.com')) return url;
    if (url.includes('seatrandiscovery.com') || url.includes('seatranferry.com')) return url;
    if (url.includes('rome2rio.com')) return url;
    if (url.includes('busbud.com')) return url;
    if (url.includes('trainline.com') || url.includes('thetrainline.com')) return url;
    if (url.includes('trenitalia.com')) return url;
    if (url.includes('renfe.com')) return url;
    if (url.includes('omio.com') || url.includes('omio.es')) return url;
    if (url.includes('wanderu.com')) return url;
    if (url.includes('flixbus.es') || url.includes('flixbus.com')) return url;
    if (url.includes('blablacar.es') || url.includes('blablacar.com')) return url;
    if (url.includes('directferries.es') || url.includes('directferries.com')) return url;
    if (url.includes('ferryhopper.com')) return url;
    if (url.includes('ferryscanner.com')) return url;
    if (url.includes('clickferry.com')) return url;
    if (url.includes('balearia.com')) return url;
    if (url.includes('frs.es') || url.includes('frs-group.com')) return url;
    if (url.includes('trasmediterranea.es') || url.includes('armasferry.com')) return url;
    if (url.includes('virail.es') || url.includes('virail.com')) return url;
    if (url.includes('aferry.es') || url.includes('aferry.com')) return url;
    const transportClean = ['https://www.grab.com', 'https://m.uber.com', 'https://bolt.eu',
      'https://www.didiglobal.com', 'https://www.gojek.com', 'https://www.careem.com',
      'https://indrive.com', 'https://cabify.com', 'https://www.free-now.com',
      'https://go.yandex.com', 'https://www.lyft.com', 'https://www.olacabs.com'];
    if (transportClean.some(t => url === t || url === t + '/')) return url;
    return '';
  }).replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '');
}

// Inyecta enlace Google Maps si el usuario tiene GPS, la respuesta habla de ir a un sitio,
// y no hay ya un enlace de Google Maps en la respuesta.
function injectGoogleMapsLink(reply, userLocation, message) {
  if (!reply || !userLocation || !userLocation.lat || !userLocation.lng) return reply;
  // Si ya tiene un enlace de Google Maps, no duplicar
  if (reply.includes('google.com/maps')) return reply;
  // Solo para transporte local concreto — no para intención de viaje a un país/ciudad lejana
  const goKeywords = /aeropuerto|airport|estación|estacion|station|terminal|cómo llegar|como llegar|llegar a[l ]|ir desde|dame enlace|google maps|navegar|cómo voy|como voy|taxi/i;
  if (!goKeywords.test(message)) return reply;
  // Extraer destino del mensaje y de la respuesta de GPT
  let dest = null;

  // 0. Del mensaje: "ir a Málaga desde X", "ir desde X a Y", "ir a Y en taxi"
  //    Extraer destino: la palabra/s después de "a/hasta/hacia" cortando en "desde/en/por/con"
  const destPatterns = [
    /\ba\s+([\wáéíóúñ]+(?:\s+[\wáéíóúñ]+)?)\s+desde/i,                           // "a Málaga desde..."
    /(?:ir|llegar|viajar)\s+(?:al?\s|hasta\s|hacia\s)([\wáéíóúñ\s]+?)(?:\s+(?:desde|en\s|por\s|con\s|para\s|,)|$)/i, // "ir a/al Málaga en taxi"
    /desde\s+[\wáéíóúñ\s]+?\s+(?:al?\s|hasta\s|hacia\s)([\wáéíóúñ\s]+?)(?:\s+(?:para\s|el\s+\d|en\s|por\s|con\s|,)|$)/i, // "desde X a/al Y"
    /taxi\s+(?:desde\s+[\wáéíóúñ\s]+?\s+)?(?:al?\s|hasta\s|hacia\s)([\wáéíóúñ\s]+?)(?:\s+(?:para\s|el\s+\d|de la|del|desde|en\s|por\s|con\s|,)|$)/i, // "taxi ... al centro de la ciudad"
  ];
  for (const pat of destPatterns) {
    const m = message.match(pat);
    if (m) {
      const candidate = m[1].trim();
      if (candidate.length >= 3 && !/^(un|una|el|la|los|las|mi|tu|su|este|donde|aqui|ahi|alli|taxi|coche|bus|tren|pie)$/i.test(candidate)) {
        dest = candidate;
        break;
      }
    }
  }

  // 1. Buscar aeropuerto/estación con nombre completo en la respuesta
  if (!dest) {
    const airportPatterns = [
      /\*\*([^*]*(?:Airport|Aeropuerto|Aeroporto)[^*]*)\*\*/i,
      /\*\*([^*]*(?:Station|Estación|Terminal|Gare)[^*]*)\*\*/i,
    ];
    for (const pat of airportPatterns) {
      const m = reply.match(pat);
      if (m) {
        dest = m[1].replace(/\s*[-—].*/, '').replace(/\s*\+\d.*/, '').trim();
        break;
      }
    }
  }

  // 2. Del mensaje: "ir al aeropuerto de Málaga", "a la torre eiffel"
  if (!dest) {
    const msgDest = message.match(/(?:a[l ]?\s*(?:la\s+)?)(aeropuerto\s+de\s+[\w\sáéíóúñ]{2,20}|estación\s+de\s+[\w\sáéíóúñ]{2,20}|torre eiffel|taj mahal|coliseo|big ben|sagrada familia|alhambra|machu picchu)/i);
    if (msgDest) dest = msgDest[1].trim();
  }

  // 3. Fallback: primer lugar en negrita en la respuesta (ignorar precios, números, phones)
  if (!dest) {
    const boldMatches = reply.matchAll(/\*\*([^*]{3,50})\*\*/g);
    for (const bm of boldMatches) {
      const candidate = bm[1].replace(/\s*[-—].*/, '').replace(/\s*\+\d.*/, '').trim();
      // Ignorar si es un precio, número, teléfono o texto genérico
      if (/^\d|^[€$£¥]|€|USD|\d+\s*(min|km|h\b|hora|metro|€|\$)/.test(candidate)) continue;
      if (candidate.length < 3) continue;
      dest = candidate;
      break;
    }
  }

  if (!dest) return reply;

  // Extraer origen del mensaje: "desde X" → usar X como origen en vez de GPS
  let origin = `${userLocation.lat},${userLocation.lng}`;
  let originCity = '';
  const fromMatch = message.match(/desde\s+([\wáéíóúñÁÉÍÓÚÑ\s]{3,40}?)(?:\s+(?:al?\s|hasta\s|hacia\s|para\s|en\s+taxi|en\s+coche|por|con|,)|$)/i);
  if (fromMatch) {
    const fromPlace = fromMatch[1].trim();
    if (fromPlace.length >= 3 && !/^(un|una|el|la|los|las|mi|tu|su|aqui|ahi|alli|taxi|coche|bus|tren)$/i.test(fromPlace)) {
      origin = fromPlace.replace(/\s+/g, '+');
      // Extraer ciudad del origen para enriquecer destinos genéricos
      const cityMatch = fromPlace.match(/(?:de|in)\s+([\wáéíóúñ]+)/i);
      if (cityMatch) originCity = cityMatch[1];
    }
  }

  // Si el destino es genérico ("centro", "centro de la ciudad"), añadir la ciudad
  if (/^centro\b/i.test(dest) && originCity) {
    dest = dest + ', ' + originCity;
  }
  dest = dest.replace(/\s+/g, '+');

  const mapsUrl = `https://www.google.com/maps/dir/${origin}/${dest}`;
  return reply + `\n\n📍 ${mapsUrl}`;
}

// Inyecta bloque de transporte (app + descarga) cuando el usuario quiere ir a un sitio
// Usa datos reales del KV de transporte + URLs reales de TRANSPORT_APP_URLS
function injectTransportBlock(reply, kvTransportData, message) {
  if (!reply || !message) return reply;
  // Solo para transporte local concreto — NO para intención de viaje a un país/ciudad lejana
  const goKeywords = /llévame|taxi|aeropuerto|airport|estación|estacion|station|terminal/i;
  if (!goKeywords.test(message)) return reply;
  // Si ya tiene enlace o mención del bloque de app de transporte, no duplicar
  if (/grab\.com|m\.uber\.com|bolt\.eu|indrive\.com/i.test(reply)) return reply;
  if (/Abre \*\*Grab\*\*|Abre \*\*Uber\*\*|Abre \*\*Bolt\*\*|🟩 Abre|🚕 Transporte local/i.test(reply)) return reply;

  let appBlock = '';
  if (kvTransportData && kvTransportData.ridehailing) {
    const best = kvTransportData.ridehailing.best;
    const appData = best ? TRANSPORT_APP_URLS[best.toLowerCase()] : null;
    if (appData) {
      // Caso normal: app conocida con URL de descarga
      appBlock += `\n\n${appData.icon} Abre **${appData.name}** y pide un coche hasta tu destino.`;
      // Alternativas
      const others = (kvTransportData.ridehailing.others || []).filter(o => o !== best);
      if (others.length > 0) {
        const otherNames = others.map(o => {
          const od = TRANSPORT_APP_URLS[o.toLowerCase()];
          return od ? od.name : o;
        }).join(', ');
        appBlock += `\nTambién funciona: ${otherNames}`;
      }
      if (kvTransportData.ridehailing.tips) {
        appBlock += `\n${kvTransportData.ridehailing.tips}`;
      }
    } else if (kvTransportData.ridehailing.tips) {
      // Caso especial: no hay app en stores internacionales pero hay tips (ej: Irán → Snapp)
      appBlock += `\n\n🚕 **Transporte local**: ${kvTransportData.ridehailing.tips}`;
    }
  }

  if (!appBlock) return reply;
  // Insertar antes del enlace de Google Maps si existe, o al final
  const mapsIdx = reply.indexOf('📍');
  if (mapsIdx !== -1) {
    return reply.slice(0, mapsIdx).trimEnd() + appBlock + '\n\n' + reply.slice(mapsIdx);
  }
  return reply + appBlock;
}

// ═══════════════════════════════════════════════════════════════
// BLOQUES PARALELOS — Rutas largas (>7 días)
// ═══════════════════════════════════════════════════════════════

function extractDaysFromMessage(message) {
  const m = message.match(/(\d+)\s*d[ií]as?/i);
  return m ? parseInt(m[1]) : null;
}

function isLongRoute(message) {
  const days = extractDaysFromMessage(message);
  return days !== null && days >= 8;
}

async function planBlocks(systemPrompt, message, days, apiKey) {
  const planPrompt = `El usuario quiere una ruta de ${days} días. Divide la ruta en bloques de 5-7 días máximo cada uno, según las zonas geográficas naturales del destino.

Responde SOLO con JSON, sin texto antes ni después:
{"blocks":[{"block":1,"days_start":1,"days_end":5,"region":"nombre de la zona","start":"ciudad de inicio","end":"ciudad final"},{"block":2,...}]}

El último bloque puede tener menos de 5 días. Los bloques deben conectar: el end del bloque N es el start del bloque N+1. Mensaje del usuario: "${message}"`;

  const result = await callOpenAI(apiKey, {
    model: 'gpt-4o-mini',
    max_tokens: 500,
    temperature: 0.3,
    system: 'Eres un planificador de rutas. Responde SOLO con JSON válido.',
    messages: [{ role: 'user', content: planPrompt }],
  });

  if (result.error) return null;
  const text = result.text || '';
  try {
    // Extraer JSON del texto
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const plan = JSON.parse(jsonMatch[0]);
    if (plan.blocks && Array.isArray(plan.blocks) && plan.blocks.length > 1) {
      return plan.blocks;
    }
  } catch (e) {}
  return null;
}

async function generateBlock(block, systemPrompt, message, apiKey, kvData) {
  const blockPrompt = `${message}

INSTRUCCIÓN ESPECIAL: Genera SOLO los días ${block.days_start} a ${block.days_end} de la ruta.
Zona: ${block.region}. Empiezas en ${block.start}, terminas en ${block.end}.
El campo "day" de cada parada debe ser el número real (${block.days_start}, ${block.days_start + 1}, etc.).
Genera el bloque SALMA_ROUTE_JSON como siempre, pero solo con las paradas de estos días.`;

  const result = await callOpenAI(apiKey, {
    model: 'gpt-4o-mini',
    max_tokens: 4000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: blockPrompt }],
  });

  if (result.error) return null;
  const text = result.text || '';
  const route = extractRouteFromReply(text);
  const reply = replyWithoutRouteBlock(text);
  return { route, reply, block };
}

async function generateAndVerifyPipeline(blocks, systemPrompt, message, apiKey, placesKey, writer, encoder) {
  const results = [];
  const totalBlocks = blocks.length;

  // Pipeline: generar + verificar cada bloque en cuanto termina
  const promises = blocks.map(async (block) => {
    try {
      // 1. Generar bloque (con retry)
      let genResult = await generateBlock(block, systemPrompt, message, apiKey, null);
      if (!genResult?.route) {
        // Retry una vez
        genResult = await generateBlock(block, systemPrompt, message, apiKey, null);
        if (!genResult?.route) return null;
      }

      // 2. Enviar draft inmediato (sin verificar)
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          draft_block: block.block,
          total_blocks: totalBlocks,
          route_partial: genResult.route,
          reply: genResult.reply
        })}\n\n`));
      } catch (_) {}

      // 3. Verificar este bloque
      try {
        genResult.route = await verifyAllStops(genResult.route, placesKey);
      } catch (_) {
        // Si verify falla, mantener la ruta sin verificar
      }

      // 4. Enviar bloque verificado
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          verified_block: block.block,
          total_blocks: totalBlocks,
          route_partial: genResult.route
        })}\n\n`));
      } catch (_) {}

      return genResult;
    } catch (e) {
      return null;
    }
  });

  const settled = await Promise.allSettled(promises);
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    }
  }

  results.sort((a, b) => a.block.block - b.block.block);
  return results;
}

function mergeBlocks(blockResults, originalMessage) {
  if (!blockResults || blockResults.length === 0) return null;

  const base = blockResults[0].route;
  const allStops = [];
  const allMapsLinks = [];
  const allTips = [];
  const allTags = new Set();

  for (let i = 0; i < blockResults.length; i++) {
    const br = blockResults[i];
    if (!br.route?.stops) continue;

    let stops = br.route.stops;

    if (i > 0 && allStops.length > 0) {
      const lastStopName = (allStops[allStops.length - 1].name || '').toLowerCase().trim();
      const firstStopName = (stops[0]?.name || '').toLowerCase().trim();
      if (lastStopName && firstStopName && lastStopName === firstStopName) {
        stops = stops.slice(1);
      }
    }

    allStops.push(...stops);
    if (br.route.maps_links) allMapsLinks.push(...br.route.maps_links);
    if (br.route.tips) allTips.push(...br.route.tips);
    if (br.route.tags) br.route.tags.forEach(t => allTags.add(t));
  }

  const maxDay = allStops.reduce((max, s) => Math.max(max, s.day || 0), 0);

  return {
    title: base.title || '',
    name: base.name || base.title || '',
    country: base.country || '',
    region: base.region || '',
    duration_days: maxDay,
    summary: base.summary || '',
    stops: allStops,
    maps_links: allMapsLinks,
    tips: [...new Set(allTips)],
    tags: [...allTags],
    budget_level: base.budget_level || 'sin_definir',
    suggestions: base.suggestions || [],
    pre_departure: base.pre_departure || null,
    practical_info: base.practical_info || null,
  };
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN DE PARADAS — Google Places (post-generación)
// ═══════════════════════════════════════════════════════════════

async function verifyAllStops(route, placesKey) {
  if (!route?.stops || !placesKey) return route;

  const region = route.region || route.country || '';
  const countryCode = route.country ? getCountryCode(route.country) : '';

  // 1. Buscar cada parada en Google Places (find + details en 1 sola llamada)
  const findPromises = route.stops.map(stop => {
    const name = stop.name || stop.headline || '';
    if (!name || name.length < 3) return Promise.resolve(null);
    const searchQuery = region ? `${name} ${region}` : name;
    const bias = (stop.lat && stop.lng && Math.abs(stop.lat) > 0.01)
      ? `&locationbias=circle:50000@${stop.lat},${stop.lng}` : '';
    const countryFilter = countryCode ? `&components=country:${countryCode}` : '';
    return fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery${bias}${countryFilter}&fields=place_id,photos,geometry,name,formatted_address,opening_hours,editorial_summary&language=es&key=${placesKey}`)
      .then(r => r.json()).catch(() => null);
  });
  const findResults = await Promise.all(findPromises);
  // DEBUG photos
  findResults.forEach((r, i) => {
    const c = r?.candidates?.[0];
    if (c) console.log(`[FIND] ${route.stops[i]?.name} → ${c.name} | photos: ${c.photos?.length || 0} | photo_ref: ${(c.photos?.[0]?.photo_reference || '').substring(0, 30)}`);
  });

  // 2. Calcular centro y radio dinámico
  const verifiedCoords = [];
  findResults.forEach(data => {
    const c = data?.candidates?.[0];
    if (c?.geometry?.location) {
      verifiedCoords.push({ lat: c.geometry.location.lat, lng: c.geometry.location.lng });
    }
  });
  let centerLat = 0, centerLng = 0, routeRadiusKm = 50;
  if (verifiedCoords.length > 0) {
    centerLat = verifiedCoords.reduce((s, p) => s + p.lat, 0) / verifiedCoords.length;
    centerLng = verifiedCoords.reduce((s, p) => s + p.lng, 0) / verifiedCoords.length;
    const maxDist = verifiedCoords.reduce((max, p) => {
      const d = Math.sqrt(Math.pow(Math.abs(p.lat - centerLat), 2) + Math.pow(Math.abs(p.lng - centerLng), 2)) * 111;
      return d > max ? d : max;
    }, 0);
    routeRadiusKm = Math.max(50, maxDist * 1.5);
  }

  // 3. Place Details en lotes de 5 (fotos + editorial summary)
  const detailResults = new Array(findResults.length).fill(null);
  const BATCH_SIZE = 5;
  for (let i = 0; i < findResults.length; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < Math.min(i + BATCH_SIZE, findResults.length); j++) {
      const c = findResults[j]?.candidates?.[0];
      if (!c?.place_id) { batch.push(Promise.resolve(null)); continue; }
      if (centerLat && centerLng && c.geometry?.location) {
        const distKm = Math.sqrt(Math.pow(Math.abs(c.geometry.location.lat - centerLat), 2) + Math.pow(Math.abs(c.geometry.location.lng - centerLng), 2)) * 111;
        if (distKm > routeRadiusKm) { batch.push(Promise.resolve(null)); continue; }
      }
      batch.push(
        fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${c.place_id}&fields=name,photos,geometry,editorial_summary&language=es&key=${placesKey}`)
          .then(r => r.json()).catch(() => null)
      );
    }
    const batchResults = await Promise.all(batch);
    batchResults.forEach((r, idx) => { detailResults[i + idx] = r; });
  }

  // 4. Enriquecer cada parada con datos reales
  const verifiedStops = [];
  route.stops.forEach((stop, i) => {
    const candidate = findResults[i]?.candidates?.[0];
    const detail = detailResults[i]?.result;

    if (!candidate?.geometry?.location) {
      // Google no encontró → mantener datos originales de Claude
      verifiedStops.push(stop);
      return;
    }

    const pLat = candidate.geometry.location.lat;
    const pLng = candidate.geometry.location.lng;

    // Validar distancia al centro
    if (centerLat && centerLng) {
      const distKm = Math.sqrt(Math.pow(Math.abs(pLat - centerLat), 2) + Math.pow(Math.abs(pLng - centerLng), 2)) * 111;
      if (distKm > routeRadiusKm) {
        verifiedStops.push(stop); // Fuera de rango → mantener original
        return;
      }
    }

    // Validar que Google devolvió algo relevante (no una tienda random)
    const originalName = (stop.name || stop.headline || '').toLowerCase();
    const googleName = (detail?.name || candidate.name || '').toLowerCase();
    const nameWords = originalName.split(/\s+/).filter(w => w.length > 3);
    const nameMatch = nameWords.some(w => googleName.includes(w)) || googleName.split(/\s+/).filter(w => w.length > 3).some(w => originalName.includes(w));

    // Validar distancia al punto original de Claude
    const origDist = (stop.lat && stop.lng && Math.abs(stop.lat) > 0.01)
      ? Math.sqrt(Math.pow(Math.abs(pLat - stop.lat), 2) + Math.pow(Math.abs(pLng - stop.lng), 2)) * 111
      : 0;
    const closeEnough = origDist < 15; // menos de 15km del punto original

    if (!nameMatch && !closeEnough) {
      // Google devolvió algo sin relación → mantener datos de Claude
      verifiedStops.push(stop);
      return;
    }

    // Google solo corrige coords y fotos — NO sobrescribe contenido de Haiku
    stop.lat = pLat;
    stop.lng = pLng;

    const photoRef = candidate.photos?.[0]?.photo_reference || detail?.photos?.[0]?.photo_reference || '';
    if (photoRef) stop.photo_ref = photoRef;

    // Solo sobrescribir nombre si Google devolvió algo relevante
    const verifiedName = detail?.name || candidate.name || '';
    if (verifiedName && nameMatch) { stop.name = verifiedName; stop.headline = verifiedName; }

    if (candidate.formatted_address) stop.verified_address = candidate.formatted_address;

    // Horarios: solo si aportan (no "Abierto 24 horas" genérico) y no hay practical de Haiku
    if (!stop.practical && detail?.opening_hours?.weekday_text) {
      const hours = detail.opening_hours.weekday_text.join(' · ');
      const isGeneric = /abierto 24 horas/i.test(hours) || /open 24 hours/i.test(hours);
      if (!isGeneric) {
        stop.practical = hours;
      }
    }

    // Editorial summary de Google → solo como description (datos), nunca como context
    const googleDesc = detail?.editorial_summary?.overview || '';
    if (googleDesc && !stop.description) stop.description = googleDesc;

    // NO meter reseñas de Google como context — context es para info histórica/cultural de Haiku

    verifiedStops.push(stop);
  });

  route.stops = verifiedStops;
  return route;
}

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA DE VUELOS — Duffel API
// ═══════════════════════════════════════════════════════════════

// Busca vuelos en una sola fecha — helper interno
async function _buscarVuelosFecha(params, duffelToken) {
  const slices = [{
    origin: params.origen,
    destination: params.destino,
    departure_date: params.fecha_ida
  }];
  if (params.fecha_vuelta) {
    slices.push({ origin: params.destino, destination: params.origen, departure_date: params.fecha_vuelta });
  }
  const passengers = [];
  const numAdultos = params.adultos || 1;
  for (let i = 0; i < numAdultos; i++) passengers.push({ type: 'adult' });

  const response = await fetch(
    'https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=15000',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${duffelToken}`
      },
      body: JSON.stringify({ data: { slices, passengers, cabin_class: params.clase || 'economy' } }),
      signal: AbortSignal.timeout(12000)
    }
  );
  const data = await response.json();
  if (data.errors) return [];
  return data.data?.offers || [];
}

async function buscarVuelosDuffel(params, duffelToken) {
  if (!duffelToken) {
    return { error: 'Token de Duffel no configurado. Añade DUFFEL_ACCESS_TOKEN en Cloudflare.' };
  }

  try {
    let allOffers = [];

    // ── Búsqueda multi-fecha si hay rango flexible ──
    if (params.fecha_rango_hasta && params.fecha_rango_hasta > params.fecha_ida) {
      // Solo inicio y fin del rango (2 llamadas en paralelo, más rápido)
      const uniqueDates = [...new Set([params.fecha_ida, params.fecha_rango_hasta])];

      const results = await Promise.allSettled(
        uniqueDates.map(fecha => _buscarVuelosFecha({ ...params, fecha_ida: fecha }, duffelToken).catch(() => []))
      );
      for (const r of results) {
        if (r.status === 'fulfilled') allOffers.push(...r.value);
      }
    } else {
      // Búsqueda normal en una fecha
      allOffers = await _buscarVuelosFecha(params, duffelToken);
    }

    if (allOffers.length === 0) {
      return {
        encontrados: 0,
        mensaje: 'No se encontraron vuelos con esos criterios. Prueba con fechas más flexibles.'
      };
    }

    // Generar enlace de reserva en Skyscanner
    const skyDate = (d) => d.replace(/^20(\d{2})-(\d{2})-(\d{2})$/, '$1$2$3');
    let bookingUrl = `https://www.skyscanner.es/transporte/vuelos/${params.origen.toLowerCase()}/${params.destino.toLowerCase()}/${skyDate(params.fecha_ida)}/`;
    if (params.fecha_vuelta) bookingUrl += `${skyDate(params.fecha_vuelta)}/`;
    if (params.fecha_rango_hasta) {
      // Para rango flexible, apuntar al buscador de mes
      bookingUrl = `https://www.skyscanner.es/transporte/vuelos/${params.origen.toLowerCase()}/${params.destino.toLowerCase()}/`;
    }

    // Ordenar por precio, deduplicar por aerolínea+precio+horario salida, tomar top 5
    const seen = new Set();
    const sortedOffers = allOffers
      .sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount))
      .filter(offer => {
        const seg = offer.slices[0]?.segments[0];
        const key = `${offer.total_amount}-${seg?.marketing_carrier?.iata_code || ''}-${(seg?.departing_at || '').slice(0, 16)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);

    // Formatear resultados para que Claude los presente bien
    const vuelos = sortedOffers.map(offer => {
      const idaSlice = offer.slices[0];
      const primerSegmento = idaSlice.segments[0];
      const ultimoSegmento = idaSlice.segments[idaSlice.segments.length - 1];

      const resultado = {
        precio: offer.total_amount + ' ' + offer.total_currency,
        aerolinea: primerSegmento.operating_carrier?.name || primerSegmento.marketing_carrier?.name || 'Desconocida',
        codigo_aerolinea: primerSegmento.marketing_carrier?.iata_code || '',
        numero_vuelo: (primerSegmento.marketing_carrier?.iata_code || '') + primerSegmento.marketing_carrier_flight_number,
        origen: primerSegmento.origin?.iata_code + ' (' + (primerSegmento.origin?.city_name || primerSegmento.origin?.name || '') + ')',
        destino: ultimoSegmento.destination?.iata_code + ' (' + (ultimoSegmento.destination?.city_name || ultimoSegmento.destination?.name || '') + ')',
        salida: primerSegmento.departing_at,
        llegada: ultimoSegmento.arriving_at,
        duracion: idaSlice.duration || 'No disponible',
        escalas: idaSlice.segments.length - 1,
        tiempo_escala_min: idaSlice.segments.length > 1
          ? idaSlice.segments.slice(1).reduce((acc, seg, i) => {
              const prev = idaSlice.segments[i];
              const llegada = prev?.arriving_at ? new Date(prev.arriving_at) : null;
              const salida = seg?.departing_at ? new Date(seg.departing_at) : null;
              return llegada && salida ? acc + Math.round((salida - llegada) / 60000) : acc;
            }, 0)
          : 0,
        clase: offer.cabin_class || params.clase || 'economy'
      };

      // Info de vuelta si es ida y vuelta
      if (offer.slices[1]) {
        const vueltaSlice = offer.slices[1];
        const vueltaPrimer = vueltaSlice.segments[0];
        const vueltaUltimo = vueltaSlice.segments[vueltaSlice.segments.length - 1];
        resultado.vuelta_salida = vueltaPrimer.departing_at;
        resultado.vuelta_llegada = vueltaUltimo.arriving_at;
        resultado.vuelta_duracion = vueltaSlice.duration || 'No disponible';
        resultado.vuelta_escalas = vueltaSlice.segments.length - 1;
      }

      return resultado;
    });

    return {
      encontrados: vuelos.length,
      tipo: params.fecha_vuelta ? 'ida_y_vuelta' : 'solo_ida',
      enlace_reserva: bookingUrl,
      vuelos: vuelos
    };

  } catch (error) {
    return {
      error: 'Error buscando vuelos: ' + error.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERADORES DE DEEP LINKS — Google Hotels, DiscoverCars, TheFork
// ═══════════════════════════════════════════════════════════════

function normalizeQuery(text) {
  return encodeURIComponent(text.trim());
}

// Busca hoteles reales en Booking.com via RapidAPI — precios, reviews, enlaces de reserva
async function buscarHotelesBooking(input, rapidApiKey) {
  const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': RAPIDAPI_HOST,
    'x-rapidapi-key': rapidApiKey
  };

  const adultos = input.adultos || 1;
  const habitaciones = input.habitaciones || 1;
  const presupuestoMax = input.presupuesto_max || null;

  try {
    // Paso 1: Resolver ciudad → dest_id
    const locUrl = `https://${RAPIDAPI_HOST}/v1/hotels/locations?name=${normalizeQuery(input.ciudad)}&locale=es`;
    const locRes = await fetch(locUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!locRes.ok) return { error: `Booking API error ${locRes.status} — verifica la RapidAPI key` };
    const locData = await locRes.json();

    if (!locData || locData.length === 0) {
      return { error: `No encontré "${input.ciudad}" en Booking.com. Prueba con otro nombre.` };
    }

    // Buscar primero tipo "city", luego cualquier resultado
    const cityResult = locData.find(l => l.dest_type === 'city') || locData[0];
    const destId = cityResult.dest_id;
    const destType = cityResult.dest_type;

    // Paso 2: Buscar hoteles con precios reales
    const searchParams = new URLSearchParams({
      dest_id: destId,
      dest_type: destType,
      checkin_date: input.fecha_entrada,
      checkout_date: input.fecha_salida,
      adults_number: String(adultos),
      room_number: String(habitaciones),
      order_by: 'price',
      filter_by_currency: 'EUR',
      locale: 'es',
      units: 'metric',
      page_number: '0',
      include_adjacency: 'true'
    });

    const searchUrl = `https://${RAPIDAPI_HOST}/v1/hotels/search?${searchParams}`;
    const searchRes = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!searchRes.ok) return { error: `Booking API error ${searchRes.status}` };
    const searchData = await searchRes.json();

    if (!searchData.result || searchData.result.length === 0) {
      return {
        encontrados: 0,
        mensaje: `No encontré hoteles disponibles en ${input.ciudad} para esas fechas. Prueba con otras fechas.`
      };
    }

    const fechaIn = new Date(input.fecha_entrada);
    const fechaOut = new Date(input.fecha_salida);
    const noches = Math.round((fechaOut - fechaIn) / (1000 * 60 * 60 * 24));

    // Convertir precios de moneda local a EUR por noche
    let hoteles = searchData.result.map(h => {
      const precioTotal = h.min_total_price || h.composite_price_breakdown?.gross_amount?.value || 0;
      const moneda = h.currency_code || 'EUR';
      const precioNoche = noches > 0 ? Math.round(precioTotal / noches * 100) / 100 : precioTotal;

      return {
        nombre: h.hotel_name,
        precio_total: precioTotal,
        moneda_original: moneda,
        precio_noche_estimado: precioNoche,
        review_score: h.review_score || 0,
        review_texto: h.review_score_word || '',
        num_reviews: h.review_nr || 0,
        estrellas: h.class || 0,
        direccion: h.address || '',
        distrito: h.district || h.city || '',
        enlace_reserva: h.url || '',
        foto: h.max_photo_url || h.main_photo_url || ''
      };
    });

    // Filtrar por presupuesto si se especificó (necesitamos convertir a EUR)
    // Los precios vienen en moneda local, así que filtramos si currency es EUR
    if (presupuestoMax) {
      const filtrados = hoteles.filter(h => {
        if (h.moneda_original === 'EUR') return h.precio_noche_estimado <= presupuestoMax;
        // Para otras monedas, incluimos todos y dejamos que Claude mencione el presupuesto
        return true;
      });
      if (filtrados.length > 0) hoteles = filtrados;
    }

    // Top 5 más baratos
    hoteles = hoteles.slice(0, 5);

    const result = {
      encontrados: hoteles.length,
      ciudad: input.ciudad,
      noches: noches,
      huespedes: `${adultos} adulto${adultos > 1 ? 's' : ''}, ${habitaciones} habitación${habitaciones > 1 ? 'es' : ''}`,
      hoteles: hoteles
    };

    if (presupuestoMax) {
      result.nota_presupuesto = `El usuario busca hoteles por debajo de ${presupuestoMax} EUR/noche.`;
    }

    return result;

  } catch (error) {
    return { error: 'Error buscando hoteles: ' + error.message };
  }
}

// Busca coches de alquiler reales en Booking.com via RapidAPI
async function buscarCochesBooking(input, rapidApiKey) {
  const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';
  const headers = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': RAPIDAPI_HOST,
    'x-rapidapi-key': rapidApiKey
  };

  const horaRecogida = input.hora_recogida || '10:00';
  const horaDevolucion = input.hora_devolucion || '10:00';

  try {
    // Paso 1: Resolver ciudad → coordenadas
    const locUrl = `https://${RAPIDAPI_HOST}/v1/hotels/locations?name=${normalizeQuery(input.ciudad_recogida)}&locale=es`;
    const locRes = await fetch(locUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!locRes.ok) return { error: `Car rental API error ${locRes.status}` };
    const locData = await locRes.json();

    if (!locData || locData.length === 0) {
      return { error: `No encontré "${input.ciudad_recogida}" para alquiler de coches.` };
    }

    const loc = locData.find(l => l.dest_type === 'city') || locData[0];
    const lat = loc.latitude;
    const lon = loc.longitude;
    const cc = loc.cc1 || 'es';

    // Paso 2: Buscar coches disponibles
    const searchParams = new URLSearchParams({
      pick_up_latitude: String(lat),
      pick_up_longitude: String(lon),
      drop_off_latitude: String(lat),
      drop_off_longitude: String(lon),
      pick_up_datetime: `${input.fecha_recogida}T${horaRecogida}:00`,
      drop_off_datetime: `${input.fecha_devolucion}T${horaDevolucion}:00`,
      currency: 'EUR',
      locale: 'es',
      sort_by: 'price_low_to_high',
      from_country: cc
    });

    const searchUrl = `https://${RAPIDAPI_HOST}/v1/car-rental/search?${searchParams}`;
    const searchRes = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(10000) });
    if (!searchRes.ok) return { error: `Car rental API error ${searchRes.status}` };
    const searchData = await searchRes.json();

    if (!searchData.search_results || searchData.search_results.length === 0) {
      return {
        encontrados: 0,
        mensaje: `No encontré coches disponibles en ${input.ciudad_recogida} para esas fechas.`
      };
    }

    const fechaIn = new Date(input.fecha_recogida);
    const fechaOut = new Date(input.fecha_devolucion);
    const dias = Math.round((fechaOut - fechaIn) / (1000 * 60 * 60 * 24));

    // Top 5 más baratos
    const coches = searchData.search_results.slice(0, 5).map(r => {
      const v = r.vehicle_info || {};
      const p = r.pricing_info || {};
      const s = r.supplier_info || {};
      const route = r.route_info || {};

      // Mapeo de proveedores conocidos a sus webs
      const webs = {
        'ok mobility': 'https://www.okmobility.com',
        'europcar': 'https://www.europcar.es',
        'hertz': 'https://www.hertz.es',
        'sixt': 'https://www.sixt.es',
        'avis': 'https://www.avis.es',
        'enterprise': 'https://www.enterprise.es',
        'goldcar': 'https://www.goldcar.es',
        'clickrent': 'https://www.clickrent.es',
        'budget': 'https://www.budget.es',
        'thrifty': 'https://www.thrifty.com',
        'alamo': 'https://www.alamo.com',
        'national': 'https://www.nationalcar.com',
        'dollar': 'https://www.dollar.com',
        'firefly': 'https://www.fireflycarrental.com',
        'interrent': 'https://www.interrent.com',
        'keddy': 'https://www.keddy.com',
        'record go': 'https://www.recordrentacar.com',
        'centauro': 'https://www.centauro.net',
        'drivalia': 'https://www.drivalia.com',
      };
      const provNombre = s.name || 'Desconocido';
      const provKey = provNombre.toLowerCase();
      const webProveedor = webs[provKey] || null;

      return {
        vehiculo: v.v_name || v.group || 'Desconocido',
        categoria: v.group || '',
        precio_total: p.price + ' ' + (p.currency || 'EUR'),
        precio_dia: Math.round((p.price || 0) / dias * 100) / 100 + ' EUR/día',
        plazas: v.seats || '?',
        puertas: v.doors || '?',
        transmision: v.transmission === 'Manual' ? 'Manual' : 'Automático',
        aire_acondicionado: v.aircon ? 'Sí' : 'No',
        proveedor: provNombre,
        web_proveedor: webProveedor,
        punto_recogida: (route.pickup || {}).name || '',
        direccion_recogida: s.address || ''
      };
    });

    return {
      encontrados: coches.length,
      ciudad: input.ciudad_recogida,
      dias: dias,
      fecha_recogida: `${input.fecha_recogida} ${horaRecogida}`,
      fecha_devolucion: `${input.fecha_devolucion} ${horaDevolucion}`,
      coches: coches,
      nota: 'Precios reales con disponibilidad. Cada coche incluye la web del proveedor para reservar directamente.'
    };

  } catch (error) {
    return { error: 'Error buscando coches: ' + error.message };
  }
}

async function buscarRestaurante(input, placesKey, userCoords) {
  let searchTerms = 'restaurante ' + input.ciudad;
  if (input.tipo_cocina) searchTerms += ' ' + input.tipo_cocina;
  if (input.zona) searchTerms += ' ' + input.zona;

  // Si tenemos Google Places key, buscar restaurantes reales
  // Con coords del usuario: búsqueda por proximidad (radius 1500m)
  // Sin coords pero con ciudad: búsqueda por texto (Google geocodifica la ciudad)
  if (placesKey) {
    try {
      let url;
      if (userCoords && userCoords.lat && userCoords.lng) {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerms)}&language=es&type=restaurant&location=${userCoords.lat},${userCoords.lng}&radius=1500&key=${placesKey}`;
      } else {
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerms)}&language=es&type=restaurant&key=${placesKey}`;
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      if (data?.results?.length) {
        const top = data.results.slice(0, 5);
        const detailPromises = top.map(p => {
          if (!p.place_id) return Promise.resolve(null);
          return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_phone_number,international_phone_number,formatted_address,rating,price_level,opening_hours&language=es&key=${placesKey}`)
            .then(r => r.json()).catch(() => null);
        });
        const details = await Promise.all(detailPromises);
        const restaurantes = top.map((p, i) => {
          const d = details[i]?.result;
          const nombre = d?.name || p.name;
          const gmapsLink = p.place_id
            ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nombre + ' ' + (input.ciudad || ''))}`;
          return {
            nombre,
            telefono: d?.international_phone_number || d?.formatted_phone_number || '',
            direccion: d?.formatted_address || p.formatted_address || '',
            rating: (d?.rating || p.rating) ? `${d?.rating || p.rating}★` : '',
            precio: p.price_level ? '€'.repeat(p.price_level) : '',
            abierto: d?.opening_hours?.open_now != null ? (d.opening_hours.open_now ? 'Abierto ahora' : 'Cerrado ahora') : '',
            google_maps: gmapsLink,
          };
        }).filter(r => r.nombre);
        if (restaurantes.length) {
          return {
            restaurantes,
            ciudad: input.ciudad,
            tipo_cocina: input.tipo_cocina || 'variada',
            nota: 'Resultados reales de Google Places cerca de tu ubicación. Llama antes para confirmar disponibilidad.'
          };
        }
      }
    } catch (e) { /* fallback a enlaces */ }
  }

  // Fallback: solo enlaces
  const theforkUrl = `https://www.thefork.es/buscar?q=${normalizeQuery(searchTerms)}`;
  const googleMapsUrl = `https://www.google.com/maps/search/restaurantes+${normalizeQuery(searchTerms)}`;
  return {
    enlace_thefork: theforkUrl,
    enlace_google_maps: googleMapsUrl,
    ciudad: input.ciudad,
    tipo_cocina: input.tipo_cocina || 'variada',
    zona: input.zona || 'toda la ciudad',
    nota: 'TheFork permite reservar mesa directamente. Google Maps muestra reseñas y fotos de usuarios.'
  };
}

// ═══ GENERAR VIDEO — Devuelve parámetros para slideshow en el navegador ═══
function generarVideo(input) {
  return {
    success: true,
    video_params: {
      tipo: input.tipo || 'jornada',
      titulo: input.titulo || 'Mi viaje',
      highlight: input.highlight || ''
    },
    message: `Video "${input.titulo || 'Mi viaje'}" listo para renderizar con las fotos del viajero.`
  };
}

// ═══════════════════════════════════════════════════════════════
// BUSCAR LUGAR — Google Places genérico (gym, farmacia, museo…)
// ═══════════════════════════════════════════════════════════════

async function buscarLugar(input, placesKey, userCoords) {
  if (!placesKey) return { error: 'Google Places key no configurada' };

  // Compatibilidad con llamadas legacy de buscar_restaurante (sin campo query)
  const query = input.query || (input.tipo_cocina ? input.tipo_cocina + ' restaurante' : 'restaurante');
  const ciudad = input.ciudad || '';
  const esComida = input.tipo_places === 'restaurant' ||
    /restaurante|comer|cenar|comida|cafe|bar\b|sushi|thai|italiano|chino|tapas/i.test(query);

  let searchTerms = query + ' ' + ciudad;
  if (input.zona) searchTerms += ' ' + input.zona;

  try {
    let url;
    const typeParam = input.tipo_places ? `&type=${encodeURIComponent(input.tipo_places)}` : (esComida ? '&type=restaurant' : '');
    const radius = esComida ? 1500 : 3000;
    if (userCoords && userCoords.lat && userCoords.lng) {
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerms)}&language=es&location=${userCoords.lat},${userCoords.lng}&radius=${radius}${typeParam}&key=${placesKey}`;
    } else {
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchTerms)}&language=es${typeParam}&key=${placesKey}`;
    }
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();

    if (!data?.results?.length) {
      // Fallback para comida: devolver enlaces TheFork + Google Maps
      if (esComida) {
        return {
          enlace_thefork: `https://www.thefork.es/buscar?q=${normalizeQuery(searchTerms)}`,
          enlace_google_maps: `https://www.google.com/maps/search/restaurantes+${normalizeQuery(searchTerms)}`,
          ciudad,
          nota: 'TheFork permite reservar mesa directamente. Google Maps muestra reseñas y fotos.'
        };
      }
      return { error: `No encontré "${query}" en ${ciudad}. Prueba con otro término.` };
    }

    const top = data.results.slice(0, 5);
    const detailPromises = top.map(p => {
      if (!p.place_id) return Promise.resolve(null);
      return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_phone_number,international_phone_number,formatted_address,rating,price_level,opening_hours,website&language=es&key=${placesKey}`)
        .then(r => r.json()).catch(() => null);
    });
    const details = await Promise.all(detailPromises);

    const lugares = top.map((p, i) => {
      const d = details[i]?.result;
      const nombre = d?.name || p.name;
      const gmapsLink = p.place_id
        ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nombre + ' ' + ciudad)}`;
      const entry = {
        nombre,
        telefono: d?.international_phone_number || d?.formatted_phone_number || '',
        direccion: d?.formatted_address || p.formatted_address || '',
        rating: (d?.rating || p.rating) ? `${d?.rating || p.rating}★` : '',
        abierto: d?.opening_hours?.open_now != null ? (d.opening_hours.open_now ? 'Abierto ahora' : 'Cerrado ahora') : '',
        web: d?.website || '',
        google_maps: gmapsLink,
      };
      if (esComida && (d?.price_level || p.price_level)) {
        entry.precio = '€'.repeat(d?.price_level || p.price_level);
      }
      return entry;
    }).filter(l => l.nombre);

    return {
      lugares,
      ciudad,
      query,
      nota: esComida
        ? 'Resultados reales de Google Places. Llama antes para confirmar disponibilidad.'
        : 'Resultados reales de Google Places. Llama antes para confirmar horarios.'
    };
  } catch (e) {
    return { error: 'Error buscando lugar: ' + e.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA WEB GENERAL (Serper + fetch contenido top URLs)
// ═══════════════════════════════════════════════════════════════

async function buscarWeb(input, braveKey) {
  if (!braveKey || !input.query) return { error: 'Falta query o API key' };

  try {
    // 1. Buscar via Brave Search API
    const params = new URLSearchParams({ q: input.query, count: 5, country: 'ES', search_lang: 'es', ui_lang: 'es-ES' });
    const braveRes = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip', 'X-Subscription-Token': braveKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!braveRes.ok) return { error: 'Error buscando en Brave Search' };
    const braveData = await braveRes.json();

    const organic = (braveData.web?.results || []).slice(0, 5);
    if (!organic.length) return { resultados: [], mensaje: 'No se encontraron resultados para esa búsqueda.' };

    // 2. Intentar obtener contenido de las top 2 URLs
    const topUrls = organic.slice(0, 2).map(r => r.link).filter(Boolean);
    const contenidos = await Promise.all(topUrls.map(async url => {
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SalmaBot/1.0)' },
          signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return null;
        const html = await res.text();
        // Extraer texto plano: quitar tags HTML, scripts y estilos
        const text = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 3000); // máx 3000 chars por página
        return { url, texto: text };
      } catch (e) {
        return null;
      }
    }));

    // 3. Combinar snippets de Serper + contenido real de las webs
    const resultados = organic.map((r, i) => ({
      titulo: r.title || '',
      snippet: r.description || '',
      url: r.url || '',
      contenido: contenidos[i]?.texto || null,
    }));

    return { resultados, query: input.query };
  } catch (e) {
    return { error: 'Error en búsqueda web: ' + e.message };
  }
}

// ═══════════════════════════════════════════════════════════════
// DISPATCHER DE HERRAMIENTAS — Ejecuta la tool que Claude pida
// ═══════════════════════════════════════════════════════════════

function getToolProgressMsg(toolName, input) {
  switch (toolName) {
    case 'buscar_vuelos':
      return `✈️ Buscando vuelos ${input.origen || ''} → ${input.destino || ''}...\n`;
    case 'buscar_hotel':
      return `🏨 Mirando hoteles en ${input.ciudad || ''}...\n`;
    case 'buscar_lugar': {
      const q = input.query || '';
      const c = input.ciudad || '';
      if (/restaurante|comer|cenar|sushi|thai|tapas/i.test(q)) return `🍽️ Buscando dónde comer en ${c}...\n`;
      if (/gym|boxeo|fitness|sport/i.test(q)) return `🥊 Buscando gimnasio en ${c}...\n`;
      if (/taxi|transfer|traslado/i.test(q)) return `🚕 Buscando taxi en ${c}...\n`;
      if (/sim|tarjeta.*datos|telefon/i.test(q)) return `📱 Buscando dónde comprar SIM en ${c}...\n`;
      if (/cambio|divisa|moneda|exchange/i.test(q)) return `💱 Buscando cambio de divisas en ${c}...\n`;
      if (/farmacia/i.test(q)) return `💊 Buscando farmacia en ${c}...\n`;
      return `📍 Buscando ${q} en ${c}...\n`;
    }
    case 'buscar_coche':
      return `🚗 Buscando coches en ${input.ciudad_recogida || ''}...\n`;
    case 'buscar_web':
      return `🔍 Consultando información actualizada...\n`;
    default:
      return null;
  }
}

async function executeToolCall(toolName, toolInput, env, userCoords) {
  switch (toolName) {
    case 'buscar_vuelos':
      return await buscarVuelosDuffel(toolInput, env.DUFFEL_ACCESS_TOKEN);
    case 'buscar_hotel':
      return await buscarHotelesBooking(toolInput, env.RAPIDAPI_KEY);
    case 'buscar_coche':
      return await buscarCochesBooking(toolInput, env.RAPIDAPI_KEY);
    case 'buscar_restaurante': // alias legacy — redirige a buscar_lugar
    case 'buscar_lugar':
      return await buscarLugar(toolInput, env.GOOGLE_PLACES_KEY, userCoords);
    case 'buscar_foto':
      return await buscarFotoLugar(toolInput, env.GOOGLE_PLACES_KEY);
    case 'buscar_web':
      return await buscarWeb(toolInput, env.BRAVE_SEARCH_KEY);
    case 'generar_video':
      return generarVideo(toolInput);
    case 'guardar_nota':
      return { saved: true, nota: toolInput };
    default:
      return { error: `Herramienta desconocida: ${toolName}` };
  }
}

// ═══ BUSCAR FOTO — Google Places Photos ═══
async function buscarFotoLugar(input, placesKey) {
  if (!placesKey || !input.lugar) return { error: 'Falta lugar o API key' };

  try {
    // 1. Buscar el lugar en Google Places
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input.lugar)}&inputtype=textquery&fields=name,photos,formatted_address&key=${placesKey}`
    );
    const searchData = await searchRes.json();

    const place = searchData?.candidates?.[0];
    if (!place || !place.photos || !place.photos.length) {
      return { error: 'No se encontró foto para: ' + input.lugar, lugar: input.lugar };
    }

    // 2. Obtener hasta 3 fotos DISTINTAS del lugar
    const maxPhotos = Math.min(place.photos.length, 3);
    const fotos = [];

    for (let i = 0; i < maxPhotos; i++) {
      try {
        const photoRef = place.photos[i].photo_reference;
        const photoRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${placesKey}`
        );
        if (photoRes.ok) {
          fotos.push({
            url: photoRes.url,
            markdown: `![${place.name || input.lugar}](${photoRes.url})`,
          });
        }
      } catch (_) {}
    }

    if (fotos.length === 0) {
      return { error: 'No se pudo obtener foto', lugar: input.lugar };
    }

    return {
      lugar: place.name || input.lugar,
      direccion: place.formatted_address || '',
      total_fotos: fotos.length,
      fotos: fotos,
      foto_markdown: fotos.map(f => f.markdown).join('\n\n'),
    };
  } catch (e) {
    return { error: 'Error buscando foto: ' + e.message, lugar: input.lugar };
  }
}

// ═══════════════════════════════════════════════════════════════
// SALMA_ACTION — Interceptor de acciones en el texto de Claude
// Claude puede emitir SALMA_ACTION:{...} en su respuesta para
// triggear búsquedas (vuelos, hoteles, lugares) o guardar notas.
// El worker extrae los patrones, limpia el texto y ejecuta en paralelo.
// Los resultados van en doneEvt.action_results → frontend renderiza cards.
// ═══════════════════════════════════════════════════════════════

// Extrae todos los SALMA_ACTION:{...} del texto.
// Devuelve { cleanText, actions[] }
function extractSalmaActions(text) {
  const actions = [];
  // Acepta tanto JSON de una línea como JSON con espacios internos
  const cleanText = text.replace(/SALMA_ACTION:\s*(\{[^\n]{1,500}\})/g, (match, jsonStr) => {
    try {
      const action = JSON.parse(jsonStr);
      if (action && action.type) actions.push(action);
    } catch (_) {}
    return '';
  }).replace(/\n{3,}/g, '\n\n').trim();
  return { cleanText, actions };
}

// Ejecuta todas las acciones en paralelo y filtra nulls
async function executeSalmaActionsParallel(actions, env, userLocation) {
  const results = await Promise.all(
    actions.map(action => executeSalmaAction(action, env, userLocation).catch(e => ({ type: action.type, error: e.message })))
  );
  return results.filter(r => r !== null);
}

// Parsear duración ISO 8601 "P1DT18H30M" → número de horas (ej. 42.5)
function parseDurationHours(d) {
  if (!d) return null;
  const dayMatch = d.match(/P(\d+)D/);
  const days = dayMatch ? parseInt(dayMatch[1]) * 24 : 0;
  const m = d.match(/T(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m && !dayMatch) return null;
  const hours = parseInt(m?.[1] || 0) + parseInt(m?.[2] || 0) / 60;
  return Math.round((days + hours) * 10) / 10;
}

// Dispatcher individual — un switch por tipo de acción
async function executeSalmaAction(action, env, userLocation) {
  switch (action.type) {
    case 'SEARCH_FLIGHTS': {
      // Usamos Duffel (mismo proveedor que buscar_vuelos tool)
      const duffelResult = await buscarVuelosDuffel({
        origen: action.origin,
        destino: action.destination,
        fecha_ida: action.date,
        fecha_vuelta: action.return_date || null,
        adultos: action.adults || 1
      }, env.DUFFEL_ACCESS_TOKEN);

      if (duffelResult.error) return { type: 'flights', error: duffelResult.error };

      // Adaptar formato Duffel → formato esperado por _renderFlightResults
      const currency = action.currency || 'EUR';
      const flights = (duffelResult.vuelos || []).map(v => {
        const parts = v.precio ? v.precio.split(' ') : ['', currency];
        return {
          airlines: v.aerolinea,
          origin: v.origen,
          destination: v.destino,
          departure: v.salida,
          arrival: v.llegada,
          duration_h: parseDurationHours(v.duracion),
          stops: v.escalas,
          price: parseFloat(parts[0]) || null,
          currency: parts[1] || currency,
          booking_link: duffelResult.enlace_reserva || null
        };
      });

      return {
        type: 'flights',
        origin: action.origin,
        destination: action.destination,
        date: action.date,
        return_date: action.return_date || null,
        currency,
        flights
      };
    }
    case 'SEARCH_HOTELS':
      return await searchHotelsPlaces(action, env.GOOGLE_PLACES_KEY, userLocation);
    case 'SEARCH_PLACES':
      return await searchPlacesGoogle(action, env.GOOGLE_PLACES_KEY, userLocation);
    case 'SAVE_NOTE':
      // La nota se guarda en el frontend; aquí la devolvemos tal cual
      return { type: 'note', texto: action.texto, tipo: action.tipo || 'general', country_code: action.country_code || null, country_name: action.country_name || null };
    case 'MAP_PIN':
      // El pin se coloca en el frontend; pasamos los datos tal cual
      return { type: 'map_pin', name: action.name, address: action.address || '', description: action.description || '', place_type: action.place_type || 'other' };
    default:
      return null;
  }
}

// ═══ KIWI TEQUILA v2 — Búsqueda de vuelos ═══
// (searchFlightsKiwi eliminado — Kiwi no da API keys. Usamos Duffel via executeSalmaAction)

// ═══ GOOGLE PLACES — Búsqueda de hoteles ═══
// params: { city?, lat?, lng?, budget?, adults?, checkin?, checkout? }
async function searchHotelsPlaces(params, placesKey, userLocation) {
  if (!placesKey) return { type: 'hotels', error: 'No GOOGLE_PLACES_KEY configurada' };
  const { city, lat, lng, budget, adults = 2, checkin, checkout } = params;

  // Construir query adaptada al presupuesto
  let query = 'hotel';
  if (budget === 'low') query = 'hostel alojamiento barato';
  else if (budget === 'high') query = 'hotel de lujo boutique';
  else if (budget === 'mid') query = 'hotel 3 estrellas';
  if (city) query += ' ' + city;

  const searchLat = lat || userLocation?.lat;
  const searchLng = lng || userLocation?.lng;

  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=lodging&language=es&key=${placesKey}`;
  if (searchLat && searchLng) url += `&location=${searchLat},${searchLng}&radius=3000`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data?.results?.length) return { type: 'hotels', error: 'Sin resultados', city };

  const hotels = data.results.slice(0, 5).map(p => ({
    name: p.name,
    address: p.formatted_address || p.vicinity || '',
    rating: p.rating || null,
    reviews: p.user_ratings_total || 0,
    price_level: p.price_level || null,
    place_id: p.place_id,
    photo_ref: p.photos?.[0]?.photo_reference || null,
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    maps_link: p.place_id ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}` : null,
    open_now: p.opening_hours?.open_now ?? null,
  }));

  return { type: 'hotels', city, checkin, checkout, adults, budget, hotels };
}

// ═══ GOOGLE PLACES — Búsqueda genérica de lugares ═══
// params: { query, type?, lat?, lng? }
async function searchPlacesGoogle(params, placesKey, userLocation) {
  if (!placesKey) return { type: 'places', error: 'No GOOGLE_PLACES_KEY configurada' };
  const { query, type, lat, lng } = params;
  if (!query) return { type: 'places', error: 'Falta query' };

  const searchLat = lat || userLocation?.lat;
  const searchLng = lng || userLocation?.lng;

  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=es&key=${placesKey}`;
  if (type) url += `&type=${encodeURIComponent(type)}`;
  if (searchLat && searchLng) url += `&location=${searchLat},${searchLng}&radius=5000`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data?.results?.length) return { type: 'places', error: 'Sin resultados', query };

  const places = data.results.slice(0, 5).map(p => ({
    name: p.name,
    address: p.formatted_address || p.vicinity || '',
    rating: p.rating || null,
    reviews: p.user_ratings_total || 0,
    price_level: p.price_level || null,
    place_id: p.place_id,
    photo_ref: p.photos?.[0]?.photo_reference || null,
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    maps_link: p.place_id ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}` : null,
    open_now: p.opening_hours?.open_now ?? null,
  }));

  return { type: 'places', query, places };
}

// ═══════════════════════════════════════════════════════════════
// OPENAI API HELPERS
// ═══════════════════════════════════════════════════════════════

// Convierte SALMA_TOOLS (formato Anthropic) a formato OpenAI function calling
function toolsToOpenAI(tools) {
  return tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    }
  }));
}

const OPENAI_TOOLS = toolsToOpenAI(SALMA_TOOLS);
const ANTHROPIC_TOOLS = SALMA_TOOLS; // ya en formato Anthropic (input_schema)

// Llamada no-streaming a OpenAI (reemplaza todas las llamadas a Anthropic sin stream)
async function callOpenAI(apiKey, { model, max_tokens, temperature, system, messages }) {
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: system });
  for (const m of messages) {
    // Convertir tool_result de formato Anthropic a formato OpenAI
    if (m.role === 'user' && Array.isArray(m.content)) {
      for (const block of m.content) {
        if (block.type === 'tool_result') {
          msgs.push({ role: 'tool', tool_call_id: block.tool_use_id, content: block.content });
        }
      }
    } else if (m.role === 'assistant' && Array.isArray(m.content)) {
      // Convertir assistant content blocks (text + tool_use) al formato OpenAI
      let textParts = '';
      const toolCalls = [];
      for (const block of m.content) {
        if (block.type === 'text') textParts += block.text;
        else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            type: 'function',
            function: { name: block.name, arguments: JSON.stringify(block.input) }
          });
        }
      }
      const msg = { role: 'assistant' };
      if (textParts) msg.content = textParts;
      if (toolCalls.length) msg.tool_calls = toolCalls;
      if (!textParts && !toolCalls.length) msg.content = '';
      msgs.push(msg);
    } else {
      msgs.push(m);
    }
  }

  const body = {
    model: model || 'gpt-4o-mini',
    max_tokens: max_tokens || 2000,
    messages: msgs,
  };
  if (temperature !== undefined) body.temperature = temperature;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) return { error: true, status: res.status, body: await res.text().catch(() => '') };
  const data = await res.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content || '';
  return { text, message: choice?.message, finish_reason: choice?.finish_reason };
}

// ═══════════════════════════════════════════════════════════════
// LECTOR DE STREAM SSE — Lee respuesta de OpenAI y detecta tool_calls
// ═══════════════════════════════════════════════════════════════

// Lee un stream SSE de OpenAI, reenvía texto al cliente, y detecta tool_calls
// Devuelve: { fullText, contentBlocks, stopReason, routeSignalSent }
async function readOpenAIStream(openaiRes, writer, encoder, decoder, forwardText) {
  const reader = openaiRes.body.getReader();
  let buffer = '';
  let fullText = '';
  let contentBlocks = [];
  let stopReason = null;
  let routeSignalSent = false;
  // Track tool calls being built
  const toolCallsInProgress = {}; // indexed by tool call index

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') continue;

      try {
        const evt = JSON.parse(jsonStr);
        const delta = evt.choices?.[0]?.delta;
        const finishReason = evt.choices?.[0]?.finish_reason;

        if (finishReason) {
          stopReason = finishReason; // 'stop', 'tool_calls', 'length'
        }

        if (!delta) continue;

        // Text content
        if (delta.content) {
          const chunk = delta.content;
          fullText += chunk;
          if (forwardText && writer) {
            if (!fullText.includes('SALMA_ROUTE')) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ t: chunk })}\n\n`));
            } else if (!routeSignalSent) {
              routeSignalSent = true;
              await writer.write(encoder.encode(`data: ${JSON.stringify({ generating: true })}\n\n`));
            }
          }
        }

        // Tool calls (streamed incrementally)
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallsInProgress[idx]) {
              toolCallsInProgress[idx] = {
                id: tc.id || '',
                name: tc.function?.name || '',
                arguments: ''
              };
            }
            if (tc.id) toolCallsInProgress[idx].id = tc.id;
            if (tc.function?.name) toolCallsInProgress[idx].name = tc.function.name;
            if (tc.function?.arguments) toolCallsInProgress[idx].arguments += tc.function.arguments;
          }
        }
      } catch (e) { /* ignorar JSON mal formado */ }
    }
  }

  // Build contentBlocks in Anthropic-compatible format for downstream code
  if (fullText) {
    contentBlocks.push({ type: 'text', text: fullText });
  }
  for (const idx of Object.keys(toolCallsInProgress).sort((a, b) => a - b)) {
    const tc = toolCallsInProgress[idx];
    let input = {};
    try { input = JSON.parse(tc.arguments); } catch (e) {}
    contentBlocks.push({
      type: 'tool_use',
      id: tc.id,
      name: tc.name,
      input: input,
    });
  }

  // Map OpenAI finish_reason to Anthropic-compatible stop_reason
  if (stopReason === 'tool_calls') stopReason = 'tool_use';
  else if (stopReason === 'stop') stopReason = 'end_turn';

  return { fullText, contentBlocks, stopReason, routeSignalSent };
}

// ═══════════════════════════════════════════════════════════════
// ANTHROPIC STREAMING — Claude Sonnet (texto sin foto)
// ═══════════════════════════════════════════════════════════════
async function readAnthropicStream(res, writer, encoder, decoder, forwardText) {
  const reader = res.body.getReader();
  let buffer = '';
  let fullText = '';
  let contentBlocks = [];
  let stopReason = null;
  let routeSignalSent = false;
  const blocksInProgress = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      try {
        const evt = JSON.parse(jsonStr);
        if (evt.type === 'content_block_start') {
          blocksInProgress[evt.index] = { ...evt.content_block, partial_json: '' };
        } else if (evt.type === 'content_block_delta') {
          const b = blocksInProgress[evt.index];
          if (!b) continue;
          if (evt.delta.type === 'text_delta') {
            const chunk = evt.delta.text;
            b.text = (b.text || '') + chunk;
            fullText += chunk;
            if (forwardText && writer) {
              if (!fullText.includes('SALMA_ROUTE')) {
                try { await writer.write(encoder.encode(`data: ${JSON.stringify({ t: chunk })}\n\n`)); } catch (_) {}
              } else if (!routeSignalSent) {
                routeSignalSent = true;
                try { await writer.write(encoder.encode(`data: ${JSON.stringify({ generating: true })}\n\n`)); } catch (_) {}
              }
            }
          } else if (evt.delta.type === 'input_json_delta') {
            b.partial_json += evt.delta.partial_json;
          }
        } else if (evt.type === 'message_delta') {
          if (evt.delta?.stop_reason) stopReason = evt.delta.stop_reason;
        }
      } catch (e) {}
    }
  }

  for (const idx of Object.keys(blocksInProgress).sort((a, b) => +a - +b)) {
    const b = blocksInProgress[idx];
    if (b.type === 'text' && b.text) {
      contentBlocks.push({ type: 'text', text: b.text });
    } else if (b.type === 'tool_use') {
      let input = {};
      try { input = JSON.parse(b.partial_json || '{}'); } catch (e) {}
      contentBlocks.push({ type: 'tool_use', id: b.id, name: b.name, input });
    }
  }

  return { fullText, contentBlocks, stopReason, routeSignalSent };
}

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// GA4 — JWT auth para Google Analytics Data API
// ═══════════════════════════════════════════════════════════════
function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGoogleAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const unsignedToken = headerB64 + '.' + payloadB64;

  // Import private key
  const pemBody = creds.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const keyBuf = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyBuf,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', cryptoKey, enc.encode(unsignedToken)
  );

  const jwt = unsignedToken + '.' + base64url(signature);

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt,
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);
  return tokenData.access_token;
}

// ═══════════════════════════════════════════════════════════════
// LOGGING — Registra cada petición en Firestore para admin
// ═══════════════════════════════════════════════════════════════
async function logToFirestore(logData) {
  try {
    const projectId = 'borradodelmapa-85257';
    const docId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/admin_logs/${docId}`;
    const fields = {};
    for (const [k, v] of Object.entries(logData)) {
      if (typeof v === 'number') fields[k] = { integerValue: String(Math.round(v)) };
      else fields[k] = { stringValue: String(v || '') };
    }
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
  } catch (_) { /* logging no debe romper el flujo */ }
}

export default {
  async fetch(request, env, ctx) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);

    // ─── ENDPOINT /upload-photo (R2) ───
    if (request.method === 'POST' && url.pathname === '/upload-photo') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      if (!env.SALMA_PHOTOS) {
        return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500, headers: corsH });
      }
      try {
        const formData = await request.formData();
        const photo = formData.get('photo');
        const uid = formData.get('uid');
        const mapId = formData.get('mapId');
        const day = formData.get('day');
        const stop = formData.get('stop');

        if (!photo || !uid || !mapId) {
          return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: corsH });
        }

        // Verificar tamaño (max 5MB)
        if (photo.size > 5 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'Photo too large (max 5MB)' }), { status: 400, headers: corsH });
        }

        const timestamp = Date.now();
        const key = `photos/${uid}/${mapId}/day${day}_stop${stop}_${timestamp}.jpg`;

        await env.SALMA_PHOTOS.put(key, photo.stream(), {
          httpMetadata: { contentType: photo.type || 'image/jpeg' },
          customMetadata: { uid, mapId, day, stop }
        });

        const photoUrl = `https://salma-api.paco-defoto.workers.dev/photo/${encodeURIComponent(key)}`;
        return new Response(JSON.stringify({ key, url: photoUrl }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /upload-gallery-photo (galería directa, sin chat) ───
    if (request.method === 'POST' && url.pathname === '/upload-gallery-photo') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      if (!env.SALMA_PHOTOS) {
        return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500, headers: corsH });
      }
      try {
        const formData = await request.formData();
        const photo    = formData.get('photo');
        const uid      = formData.get('uid') || 'anon';
        if (!photo) {
          return new Response(JSON.stringify({ error: 'Missing photo' }), { status: 400, headers: corsH });
        }
        if (photo.size > 6 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'Photo too large (max 6MB)' }), { status: 400, headers: corsH });
        }
        const timestamp = Date.now();
        const key = `photos/${uid}/gallery/${timestamp}.jpg`;
        await env.SALMA_PHOTOS.put(key, photo.stream(), {
          httpMetadata: { contentType: 'image/jpeg' },
          customMetadata: { uid, source: 'gallery' }
        });
        const photoUrl = `https://salma-api.paco-defoto.workers.dev/photo/${encodeURIComponent(key)}`;
        return new Response(JSON.stringify({ key, url: photoUrl }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /delete-photo (eliminar de R2) ───
    if (request.method === 'POST' && url.pathname === '/delete-photo') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      if (!env.SALMA_PHOTOS) return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500, headers: corsH });
      try {
        const { key } = await request.json();
        if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsH });
        await env.SALMA_PHOTOS.delete(key);
        return new Response(JSON.stringify({ ok: true }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /photo/* (servir fotos desde R2) ───
    if (request.method === 'GET' && url.pathname.startsWith('/photo/')) {
      if (!env.SALMA_PHOTOS) {
        return new Response('R2 not configured', { status: 500 });
      }
      const key = decodeURIComponent(url.pathname.slice(7)); // quitar /photo/
      const object = await env.SALMA_PHOTOS.get(key);
      if (!object) return new Response('Not found', { status: 404 });
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
      headers.set('Cache-Control', 'public, max-age=31536000'); // 1 año
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(object.body, { headers });
    }

    // ─── ENDPOINT /upload-doc (subir documento a R2) ───
    if (request.method === 'POST' && url.pathname === '/upload-doc') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      if (!env.SALMA_PHOTOS) {
        return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500, headers: corsH });
      }
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        const uid  = formData.get('uid') || 'anon';
        const docId = formData.get('docId') || Date.now().toString();
        if (!file) {
          return new Response(JSON.stringify({ error: 'Missing file' }), { status: 400, headers: corsH });
        }
        if (file.size > 10 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'File too large (max 10MB)' }), { status: 400, headers: corsH });
        }
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const key = `docs/${uid}/${docId}/${safeName}`;
        await env.SALMA_PHOTOS.put(key, file.stream(), {
          httpMetadata: { contentType: file.type || 'application/octet-stream' },
          customMetadata: { uid, docId, originalName: file.name }
        });
        const docUrl = `https://salma-api.paco-defoto.workers.dev/doc/${encodeURIComponent(key)}`;
        return new Response(JSON.stringify({ key, url: docUrl }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /delete-doc (eliminar documento de R2) ───
    if (request.method === 'POST' && url.pathname === '/delete-doc') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      if (!env.SALMA_PHOTOS) return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500, headers: corsH });
      try {
        const { key } = await request.json();
        if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400, headers: corsH });
        await env.SALMA_PHOTOS.delete(key);
        return new Response(JSON.stringify({ ok: true }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /doc/* (servir documentos desde R2) ───
    if (request.method === 'GET' && url.pathname.startsWith('/doc/')) {
      if (!env.SALMA_PHOTOS) {
        return new Response('R2 not configured', { status: 500 });
      }
      const key = decodeURIComponent(url.pathname.slice(5)); // quitar /doc/
      const object = await env.SALMA_PHOTOS.get(key);
      if (!object) return new Response('Not found', { status: 404 });
      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Content-Disposition', `inline; filename="${object.customMetadata?.originalName || 'document'}"`)
      headers.set('Cache-Control', 'private, max-age=3600');
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(object.body, { headers });
    }

    // ─── ENDPOINT /health (monitoreo de APIs) ───
    if (request.method === 'GET' && url.pathname === '/health') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }
      const checks = {};
      const startTime = Date.now();

      // 1. Worker — si llegas aquí, está online
      checks.worker = { status: 'ok', ms: 0 };

      // 2. OpenAI API
      try {
        const t = Date.now();
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
          body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 5, messages: [{ role: 'user', content: 'ping' }] })
        });
        checks.openai = { status: res.ok ? 'ok' : 'error', code: res.status, ms: Date.now() - t };
      } catch (e) { checks.openai = { status: 'error', error: e.message }; }

      // 3. Google Places API
      try {
        const t = Date.now();
        const res = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Alhambra&inputtype=textquery&key=${env.GOOGLE_PLACES_KEY}`);
        const data = await res.json();
        checks.google_places = { status: data.status === 'OK' ? 'ok' : 'error', api_status: data.status, ms: Date.now() - t };
      } catch (e) { checks.google_places = { status: 'error', error: e.message }; }

      // 4. Booking.com (RapidAPI) — Hotels
      try {
        const t = Date.now();
        const res = await fetch('https://booking-com.p.rapidapi.com/v1/hotels/locations?name=Madrid&locale=es', {
          headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': 'booking-com.p.rapidapi.com', 'x-rapidapi-key': env.RAPIDAPI_KEY }
        });
        const data = await res.json();
        checks.booking_hotels = { status: Array.isArray(data) && data.length > 0 ? 'ok' : 'error', results: data.length || 0, ms: Date.now() - t };
      } catch (e) { checks.booking_hotels = { status: 'error', error: e.message }; }

      // 5. Booking.com (RapidAPI) — Car Rental (misma key, distinto endpoint)
      try {
        const t = Date.now();
        const res = await fetch('https://booking-com.p.rapidapi.com/v1/car-rental/locations?name=Barcelona&locale=es', {
          headers: { 'Content-Type': 'application/json', 'x-rapidapi-host': 'booking-com.p.rapidapi.com', 'x-rapidapi-key': env.RAPIDAPI_KEY }
        });
        checks.booking_cars = { status: res.ok ? 'ok' : 'error', code: res.status, ms: Date.now() - t };
      } catch (e) { checks.booking_cars = { status: 'error', error: e.message }; }

      // 6. Duffel (vuelos)
      try {
        const t = Date.now();
        const res = await fetch('https://api.duffel.com/air/airports?limit=1', {
          headers: { 'Authorization': `Bearer ${env.DUFFEL_ACCESS_TOKEN}`, 'Duffel-Version': 'v2', 'Content-Type': 'application/json' }
        });
        checks.duffel_flights = { status: res.ok ? 'ok' : 'error', code: res.status, ms: Date.now() - t };
      } catch (e) { checks.duffel_flights = { status: 'error', error: e.message }; }

      const allOk = Object.values(checks).every(c => c.status === 'ok');
      return new Response(JSON.stringify({
        status: allOk ? 'all_ok' : 'degraded',
        timestamp: new Date().toISOString(),
        total_ms: Date.now() - startTime,
        checks
      }, null, 2), { status: allOk ? 200 : 503, headers: corsH });
    }

    // ─── ENDPOINT /sitemap.xml (SEO — sitemap index) ───
    if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://borradodelmapa.com/sitemap-static.xml</loc></sitemap>
  <sitemap><loc>https://borradodelmapa.com/sitemap-destinos.xml</loc></sitemap>
  <sitemap><loc>https://borradodelmapa.com/sitemap-blog.xml</loc></sitemap>
  <sitemap><loc>https://salma-api.paco-defoto.workers.dev/sitemap-guides.xml</loc></sitemap>
</sitemapindex>`;
      return new Response(sitemapIndex, {
        headers: { 'Content-Type': 'application/xml', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }
      });
    }

    // ─── ENDPOINT /sitemap-guides.xml (guías públicas dinámicas) ───
    if (request.method === 'GET' && url.pathname === '/sitemap-guides.xml') {
      try {
        const projectId = 'borradodelmapa-85257';
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/public_guides?pageSize=500`;
        const res = await fetch(firestoreUrl);
        const data = await res.json();

        let urls = '';
        if (data.documents) {
          for (const doc of data.documents) {
            const slug = doc.name.split('/').pop();
            const updated = doc.fields?.updatedAt?.stringValue || doc.fields?.createdAt?.stringValue || new Date().toISOString();
            const lastmod = updated.split('T')[0];
            urls += `  <url>\n    <loc>https://borradodelmapa.com/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
          }
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;
        return new Response(sitemap, {
          headers: { 'Content-Type': 'application/xml', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=3600' }
        });
      } catch (e) {
        return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
          headers: { 'Content-Type': 'application/xml' }
        });
      }
    }

    // ─── ENDPOINT /photo ───
    if (request.method === 'GET' && url.pathname === '/photo') {
      const name = url.searchParams.get('name') || '';
      const ref = url.searchParams.get('ref') || '';
      const lat = url.searchParams.get('lat') || '';
      const lng = url.searchParams.get('lng') || '';
      const placesKey = env.GOOGLE_PLACES_KEY;
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

      if (ref && placesKey) {
        try {
          const imgRes = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${ref}&key=${placesKey}`);
          if (!imgRes.ok) return new Response(JSON.stringify({ error: 'photo error' }), { status: 404, headers: corsH });
          if (url.searchParams.get('json') === '1') {
            return new Response(JSON.stringify({ url: imgRes.url }), {
              headers: { ...corsH, 'Cache-Control': 'public, max-age=86400' }
            });
          }
          return new Response(imgRes.body, {
            headers: { 'Content-Type': imgRes.headers.get('Content-Type') || 'image/jpeg', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
        }
      }

      if (!name || !placesKey) {
        return new Response(JSON.stringify({ error: 'missing params' }), { status: 400, headers: corsH });
      }
      try {
        const bias = (lat && lng) ? `&locationbias=circle:10000@${lat},${lng}` : '';
        const findRes = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery${bias}&fields=photos,geometry&key=${placesKey}`);
        const findData = await findRes.json();
        const candidate = findData.candidates?.[0];
        const photoRef = candidate?.photos?.[0]?.photo_reference;
        if (!photoRef) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsH });

        if (lat && lng) {
          const pLat = candidate?.geometry?.location?.lat;
          const pLng = candidate?.geometry?.location?.lng;
          if (pLat && pLng) {
            const distKm = Math.sqrt(Math.pow(Math.abs(pLat - parseFloat(lat)), 2) + Math.pow(Math.abs(pLng - parseFloat(lng)), 2)) * 111;
            if (distKm > 30) return new Response(JSON.stringify({ error: 'too far' }), { status: 404, headers: corsH });
          }
        }
        const imgRes = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${placesKey}`);
        if (!imgRes.ok) return new Response(JSON.stringify({ error: 'photo error' }), { status: 404, headers: corsH });
        if (url.searchParams.get('json') === '1') {
          return new Response(JSON.stringify({ url: imgRes.url }), {
            headers: { ...corsH, 'Cache-Control': 'public, max-age=86400' }
          });
        }
        return new Response(imgRes.body, {
          headers: { 'Content-Type': imgRes.headers.get('Content-Type') || 'image/jpeg', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=86400' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /place-details (rating, horarios, foto por place_id) ───
    if (request.method === 'GET' && url.pathname === '/place-details') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      const placeId = url.searchParams.get('place_id') || '';
      const placesKey = env.GOOGLE_PLACES_KEY;
      if (!placeId || !placesKey) {
        return new Response(JSON.stringify({ error: 'missing params' }), { status: 400, headers: corsH });
      }
      try {
        const fields = 'name,rating,user_ratings_total,opening_hours,photos';
        const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=es&key=${placesKey}`);
        const data = await res.json();
        if (data.status !== 'OK' || !data.result) {
          return new Response(JSON.stringify({ error: data.status || 'not found' }), { status: 404, headers: corsH });
        }
        const r = data.result;
        const photoRef = r.photos?.[0]?.photo_reference || '';
        let photoUrl = '';
        if (photoRef) {
          const imgRes = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${placesKey}`);
          if (imgRes.ok) photoUrl = imgRes.url;
        }
        return new Response(JSON.stringify({
          name: r.name || '',
          rating: r.rating || null,
          reviews: r.user_ratings_total || 0,
          photo_url: photoUrl,
          hours: r.opening_hours?.weekday_text || [],
          open_now: r.opening_hours?.open_now ?? null,
        }), { headers: { ...corsH, 'Cache-Control': 'public, max-age=86400' } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /directions (polyline para mini-mapas) ───
    if (request.method === 'GET' && url.pathname === '/directions') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      const placesKey = env.GOOGLE_PLACES_KEY;
      const origin = url.searchParams.get('origin') || '';
      const destination = url.searchParams.get('destination') || '';
      const waypoints = url.searchParams.get('waypoints') || '';
      const mode = url.searchParams.get('mode') || 'driving';

      if (!origin || !destination || !placesKey) {
        return new Response(JSON.stringify({ error: 'missing params' }), { status: 400, headers: corsH });
      }

      try {
        let dirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${placesKey}`;
        if (waypoints) dirUrl += `&waypoints=${encodeURIComponent(waypoints)}`;

        const res = await fetch(dirUrl);
        const data = await res.json();

        if (data.status !== 'OK' || !data.routes?.[0]) {
          return new Response(JSON.stringify({ error: data.status || 'No route' }), { status: 404, headers: corsH });
        }

        const route = data.routes[0];
        const polyline = route.overview_polyline?.points || '';
        const legs = (route.legs || []).map(l => ({
          distance: l.distance?.text || '',
          duration: l.duration?.text || '',
        }));

        // Steps detallados — solo si se pide (?steps=1)
        const includeSteps = url.searchParams.get('steps') === '1';
        let steps = [];
        if (includeSteps) {
          steps = (route.legs || []).flatMap(leg =>
            (leg.steps || []).map(s => ({
              instruction: s.html_instructions?.replace(/<[^>]*>/g, '') || '',
              distance: s.distance?.text || '',
              duration: s.duration?.text || '',
              maneuver: s.maneuver || '',
              end_location: s.end_location || null,
            }))
          );
        }

        const payload = includeSteps ? { polyline, legs, steps } : { polyline, legs };
        return new Response(JSON.stringify(payload), {
          headers: { ...corsH, 'Cache-Control': 'public, max-age=86400' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /ga4 (Analytics proxy) ───
    if (request.method === 'POST' && url.pathname === '/ga4') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }

      try {
        const creds = JSON.parse(env.GA4_CREDENTIALS);
        const token = await getGoogleAccessToken(creds);

        let reqBody;
        try { reqBody = await request.json(); } catch (_) { reqBody = {}; }

        const propertyId = reqBody.propertyId || '352732094';
        const ga4Res = await fetch(
          `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
          {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody.report),
          }
        );
        const ga4Data = await ga4Res.json();
        return new Response(JSON.stringify(ga4Data), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /admin-chat (Chat del admin con Claude) ───
    if (request.method === 'POST' && url.pathname === '/admin-chat') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

      // Verificar token admin (hash SHA-256 de la contraseña)
      const authHeader = request.headers.get('Authorization') || '';
      const adminToken = authHeader.replace('Bearer ', '');
      if (adminToken !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }

      let chatBody;
      try { chatBody = await request.json(); } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsH });
      }

      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: corsH });
      }

      try {
        const result = await callOpenAI(apiKey, {
          model: 'gpt-4o-mini',
          max_tokens: 2000,
          system: chatBody.system || '',
          messages: chatBody.messages || [],
        });
        // Return in Anthropic-compatible format for any existing consumers
        return new Response(JSON.stringify({ content: [{ type: 'text', text: result.text }] }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /practical-info (Nivel 2.5 — info práctica por país) ───
    if (request.method === 'GET' && url.pathname === '/practical-info') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      const country = url.searchParams.get('country');
      if (!country || !env.SALMA_KB) {
        return new Response(JSON.stringify({ error: 'Missing country or KV' }), { status: 400, headers: corsH });
      }
      try {
        const piJson = await env.SALMA_KB.get('dest:' + country.toLowerCase() + ':practical');
        if (!piJson) {
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsH });
        }
        return new Response(JSON.stringify({ country, practical_info: JSON.parse(piJson) }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /sos (Emergencia — SMS via Twilio) ───
    if (request.method === 'POST' && url.pathname === '/sos') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      try {
        const { contacts, message, uid, test } = await request.json();
        if (!contacts?.length || !uid) {
          return new Response(JSON.stringify({ error: 'Missing contacts or uid' }), { status: 400, headers: corsH });
        }

        // Rate limiting: máx 3 SOS por IP en 10 minutos
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rateLimitKey = `sos_rate:${clientIP}`;
        const count = parseInt(await env.SALMA_KB?.get(rateLimitKey) || '0');
        if (count >= 3) {
          return new Response(JSON.stringify({ error: 'rate_limit', message: 'Máximo 3 alertas SOS por 10 minutos' }), { status: 429, headers: corsH });
        }
        if (env.SALMA_KB) await env.SALMA_KB.put(rateLimitKey, String(count + 1), { expirationTtl: 600 });

        const TWILIO_SID = env.TWILIO_ACCOUNT_SID;
        const TWILIO_TOKEN = env.TWILIO_AUTH_TOKEN;
        const TWILIO_FROM = env.TWILIO_PHONE_NUMBER;

        if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
          return new Response(JSON.stringify({ error: 'Twilio not configured' }), { status: 500, headers: corsH });
        }

        const finalMessage = test ? `(PRUEBA) ${message}` : message;
        const targetContacts = test ? [contacts[0]] : contacts;

        let sent_count = 0;
        const errors = [];

        for (const contact of targetContacts) {
          if (!contact.phone) continue;
          try {
            const body = new URLSearchParams();
            body.append('To', contact.phone);
            body.append('From', TWILIO_FROM);
            body.append('Body', finalMessage);

            const res = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
              }
            );
            if (res.ok) {
              sent_count++;
            } else {
              const errBody = await res.json().catch(() => ({}));
              errors.push({ phone: contact.phone, error: errBody.message || res.status });
            }
          } catch (e) {
            errors.push({ phone: contact.phone, error: e.message });
          }
        }

        return new Response(JSON.stringify({ sent_count, errors }), {
          status: sent_count > 0 ? 200 : 500,
          headers: corsH
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /nearby-pois (Narrador — POIs cercanos via Google Places) ───
    if (request.method === 'GET' && url.pathname === '/nearby-pois') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');
      const radius = url.searchParams.get('radius') || '500';
      if (!lat || !lng) {
        return new Response(JSON.stringify({ error: 'Missing lat/lng' }), { status: 400, headers: corsH });
      }
      try {
        const placesKey = env.GOOGLE_PLACES_KEY;
        if (!placesKey) {
          return new Response(JSON.stringify({ error: 'No Places key' }), { status: 500, headers: corsH });
        }
        const types = 'tourist_attraction|museum|church|mosque|synagogue|hindu_temple|park|art_gallery';
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${types}&key=${placesKey}&language=es`;
        const pRes = await fetch(placesUrl);
        const pData = await pRes.json();
        if (!pData.results || !pData.results.length) {
          return new Response(JSON.stringify({ pois: [] }), { headers: corsH });
        }
        // Calcular distancia y devolver top 5
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const pois = pData.results.slice(0, 5).map(p => {
          const pLat = p.geometry.location.lat;
          const pLng = p.geometry.location.lng;
          const dLat = (pLat - userLat) * Math.PI / 180;
          const dLng = (pLng - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(userLat*Math.PI/180)*Math.cos(pLat*Math.PI/180)*Math.sin(dLng/2)**2;
          const dist = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return {
            name: p.name,
            lat: pLat,
            lng: pLng,
            place_id: p.place_id,
            types: (p.types || []).slice(0, 3),
            distance_m: Math.round(dist),
            photo_ref: p.photos && p.photos[0] ? p.photos[0].photo_reference : null,
            rating: p.rating || null
          };
        }).sort((a, b) => a.distance_m - b.distance_m);
        return new Response(JSON.stringify({ pois }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /narrate (Narrador — Haiku genera narrativa de un POI) ───
    if (request.method === 'POST' && url.pathname === '/narrate') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      let body;
      try { body = await request.json(); } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsH });
      }
      const { poi_name, country_code } = body;
      if (!poi_name) {
        return new Response(JSON.stringify({ error: 'Missing poi_name' }), { status: 400, headers: corsH });
      }
      try {
        // Obtener contexto del país del KV si existe
        let countryContext = '';
        if (country_code && env.SALMA_KB) {
          const kvData = await env.SALMA_KB.get('dest:' + country_code + ':destinos');
          if (kvData) {
            const parsed = JSON.parse(kvData);
            countryContext = ' en ' + (parsed.pais || country_code.toUpperCase());
          }
        }

        const apiKey = env.OPENAI_API_KEY;
        const result = await callOpenAI(apiKey, {
          model: 'gpt-4o-mini',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Eres Salma, compañera de viaje. El viajero está junto a ${poi_name}${countryContext}. Cuéntale en 2-3 frases: qué es, por qué importa y un dato curioso. Tono cercano y directo, sin paja. Máximo 80 palabras. Solo el texto, sin encabezados ni viñetas.`
          }]
        });
        const narrative = result.text || '';
        return new Response(JSON.stringify({ narrative, poi_name }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /enrich (Pasada 2 — Haiku rellena campos) ───
    if (request.method === 'POST' && url.pathname === '/enrich') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
      let enrichBody;
      try { enrichBody = await request.json(); } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsH });
      }

      const route = enrichBody.route;
      if (!route || !route.stops || !route.stops.length) {
        return new Response(JSON.stringify({ error: 'No route' }), { status: 400, headers: corsH });
      }

      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'No API key' }), { status: 500, headers: corsH });
      }

      // ─── ENRICH POR LOTES (día a día en paralelo) ───
      const enrichSystem = BLOQUE_IDENTIDAD + '\n' + BLOQUE_PERSONALIDAD + '\n' + BLOQUE_ANTIPAJA;

      // Agrupar stops por día
      const dayGroups = {};
      route.stops.forEach((s, i) => {
        const d = s.day || 1;
        if (!dayGroups[d]) dayGroups[d] = [];
        dayGroups[d].push({ stop: s, index: i });
      });
      const dayNums = Object.keys(dayGroups).map(Number).sort((a, b) => a - b);

      const stopsPrompt = `Enriquece estas paradas de un día de viaje por ${route.region || route.country || 'destino'}. Para CADA parada, añade:
- context: 2-3 frases de contexto histórico/cultural (solo monumentos, templos, patrimonio, naturaleza; omitir en restaurantes y alojamientos)
- food_nearby: nombre REAL de dónde comer cerca, qué pedir, precio aproximado, minutos andando. Si no conoces uno real, déjalo vacío.
- local_secret: dato local accionable que pocos turistas conocen. Si no tienes uno real, déjalo vacío.
- alternative: plan B si está cerrado o no convence (1 frase)
- sleep: objeto {name, zone, price_range, type} — solo para la ÚLTIMA parada del día. Para las demás, null. Si no conoces alojamiento real: {"name": "", "zone": "zona", "price_range": "X USD", "type": "tipo"}.
- eat: objeto {name, dish, price_approx} — dónde comer EN esa parada. Si no conoces local real, pon plato típico: {"name": "", "dish": "plato", "price_approx": "X USD"}.
- alt_bad_weather: qué hacer si llueve (1 frase). Solo si aplica.

Reglas:
- NO cambies name, headline, type, day, lat, lng, day_title, narrative, km_from_previous, road_name, road_difficulty, estimated_hours
- NO inventes nombres de negocios — si no estás segura, deja vacío
- Devuelve SOLO un array JSON con las paradas actualizadas. Sin markdown, sin backticks.

PARADAS:`;

      // Función helper para llamar a GPT-4o-mini (reemplaza Haiku)
      const callHaiku = async (prompt, maxTokens) => {
        const result = await callOpenAI(apiKey, {
          model: 'gpt-4o-mini',
          max_tokens: maxTokens,
          system: enrichSystem,
          messages: [{ role: 'user', content: prompt }],
        });
        if (result.error) return null;
        return result.text || '';
      };

      // Función helper para parsear JSON de respuesta
      const parseJSON = (text) => {
        if (!text) return null;
        try {
          return JSON.parse(text.replace(/```json|```/g, '').trim());
        } catch (e) {
          const match = text.match(/[\[{][\s\S]*[\]}]/);
          if (match) { try { return JSON.parse(match[0]); } catch (e2) {} }
          return null;
        }
      };

      try {
        // Lanzar enrich de stops por día + info práctica EN PARALELO
        const dayPromises = dayNums.map(dayNum => {
          const dayStops = dayGroups[dayNum].map(g => g.stop);
          const tokensPerStop = 350;
          const maxTokens = Math.min(dayStops.length * tokensPerStop + 200, 4000);
          const prompt = stopsPrompt + ' ' + JSON.stringify(dayStops);
          return callHaiku(prompt, maxTokens).then(text => ({ dayNum, text }));
        });

        const practicalPrompt = `Para esta ruta de viaje, genera info logística. Devuelve SOLO un JSON con estos dos objetos:

- pre_departure: {"transport": {"type": "tipo", "provider": "nombre si lo conoces", "address": "dir si la conoces", "price": "precio estimado", "details": "info útil"}, "first_night": {"name": "alojamiento", "address": "dir o zona", "price": "precio", "why": "por qué ese"}, "user_requests": []}
- practical_info: {"budget": {"daily_breakdown": {"transport": "X", "sleep": "X", "food": "X", "activities": "X", "misc": "X"}, "total_estimated": "X (N días)", "currency": "moneda local", "exchange_tip": "consejo"}, "documents": ["doc1"], "kit": ["item1"], "useful_apps": ["app1"], "phrases": {"language": "idioma", "list": [{"phrase": "frase", "meaning": "traducción"}]}, "emergencies": {"general_number": "tel", "hospital_zones": [{"zone": "zona", "name": "hospital", "address": "dir"}], "embassy": "embajada España"}}

NO inventes nombres de negocios. Visados para españoles. Presupuesto aproximado. Frases en alfabeto original + transliteración.
Sin markdown, sin backticks. Solo el JSON.

RUTA: ${route.title || ''}, ${route.region || ''}, ${route.country || ''}, ${route.duration_days || ''} días`;

        const practicalPromise = callHaiku(practicalPrompt, 3000).then(text => ({ type: 'practical', text }));

        // Esperar todos en paralelo
        const allResults = await Promise.all([...dayPromises, practicalPromise]);

        // Reconstruir stops enriquecidos
        const enrichedStops = [...route.stops]; // copia
        for (const result of allResults) {
          if (result.type === 'practical') continue;
          const parsed = parseJSON(result.text);
          if (!parsed) continue;
          const stopsArr = Array.isArray(parsed) ? parsed : (parsed.stops || []);
          const group = dayGroups[result.dayNum];
          if (!group) continue;
          stopsArr.forEach((enrichedStop, j) => {
            if (j < group.length) {
              const originalIdx = group[j].index;
              const original = route.stops[originalIdx];
              enrichedStops[originalIdx] = {
                ...original,
                ...enrichedStop,
                // Preservar campos verificados de Google
                lat: original.lat || enrichedStop.lat,
                lng: original.lng || enrichedStop.lng,
                photo_ref: original.photo_ref || enrichedStop.photo_ref || '',
                verified_address: original.verified_address || enrichedStop.verified_address || '',
                practical: original.practical || enrichedStop.practical || '',
                km_from_previous: original.km_from_previous ?? enrichedStop.km_from_previous ?? 0,
                road_name: original.road_name || enrichedStop.road_name || '',
                road_difficulty: original.road_difficulty || enrichedStop.road_difficulty || '',
                estimated_hours: original.estimated_hours ?? enrichedStop.estimated_hours ?? 0,
              };
            }
          });
        }

        // Extraer info práctica
        const practicalResult = allResults.find(r => r.type === 'practical');
        const practicalData = parseJSON(practicalResult?.text);

        // KV nivel 2.5: info práctica verificada del país (frases, apps, emergencias, kit)
        let kvPracticalInfo = null;
        if (env.SALMA_KB && route.country) {
          try {
            const countryNorm = route.country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
            const countryCode = await env.SALMA_KB.get('kw:' + countryNorm);
            if (countryCode) {
              const piJson = await env.SALMA_KB.get('dest:' + countryCode + ':practical');
              if (piJson) kvPracticalInfo = JSON.parse(piJson);
            }
          } catch (e) { /* KV fallo silencioso */ }
        }

        // Mergear: KV 2.5 tiene prioridad (datos verificados), Haiku rellena lo que falte
        const haikuPI = practicalData?.practical_info || {};
        const kvPI = kvPracticalInfo || {};
        const mergedPracticalInfo = {
          budget: kvPI.budget || haikuPI.budget || null,
          documents: kvPI.documents || haikuPI.documents || null,
          kit: kvPI.kit || haikuPI.kit || null,
          useful_apps: kvPI.useful_apps || haikuPI.useful_apps || null,
          phrases: kvPI.phrases || haikuPI.phrases || null,
          emergencies: kvPI.emergencies || haikuPI.emergencies || null,
          connectivity: kvPI.connectivity || haikuPI.connectivity || null,
          health: kvPI.health || haikuPI.health || null,
        };
        // Si todo es null, no incluir
        const hasPractical = Object.values(mergedPracticalInfo).some(v => v !== null);

        const enrichedRoute = {
          ...route,
          stops: enrichedStops,
          maps_links: route.maps_links || [],
          pre_departure: practicalData?.pre_departure || null,
          practical_info: hasPractical ? mergedPracticalInfo : null,
        };

        return new Response(JSON.stringify({ route: enrichedRoute }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── ENDPOINT /create-payment (Stripe PaymentIntent) ───
    if (request.method === 'POST' && url.pathname === '/create-payment') {
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

      const stripeKey = env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500, headers: corsH });
      }

      let payBody;
      try { payBody = await request.json(); } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsH });
      }

      const userId = payBody.user_id;
      if (!userId) {
        return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: corsH });
      }

      // Packs disponibles — Starter, Viajero, Explorador
      const PACKS = {
        starter:   { name: 'starter',   amount: 499,  coins: 10,  currency: 'eur' },
        viajero:   { name: 'viajero',   amount: 999,  coins: 25,  currency: 'eur' },
        explorador:{ name: 'explorador', amount: 1999, coins: 60,  currency: 'eur' },
      };
      const packKey = (payBody.pack || 'viajero').toLowerCase();
      const PACK = PACKS[packKey] || PACKS.viajero;

      try {
        // Crear PaymentIntent en Stripe
        const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(stripeKey + ':'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: PACK.amount.toString(),
            currency: PACK.currency,
            'metadata[user_id]': userId,
            'metadata[pack]': PACK.name,
            'metadata[coins]': PACK.coins.toString(),
          }).toString(),
        });

        const intent = await stripeRes.json();

        if (intent.error) {
          return new Response(JSON.stringify({ error: intent.error.message }), { status: 400, headers: corsH });
        }

        return new Response(JSON.stringify({
          client_secret: intent.client_secret,
          amount: PACK.amount,
          coins: PACK.coins,
        }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN ENDPOINTS — Panel Super Admin
    // ═══════════════════════════════════════════════════════════════

    // ─── /admin/init-prompt — Migrar prompt hardcoded a Firestore ───
    if (request.method === 'POST' && url.pathname === '/admin/init-prompt') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }
      try {
        const docUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt`;
        const now = new Date().toISOString();
        const fields = {
          prompt_text: { stringValue: SALMA_SYSTEM_BASE },
          version: { integerValue: '1' },
          updated_at: { stringValue: now },
          updated_by: { stringValue: 'init-migration' },
        };
        await fetch(docUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        });
        // Guardar en historial
        const histUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt/history/${Date.now()}`;
        await fetch(histUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            prompt_text: { stringValue: SALMA_SYSTEM_BASE },
            version: { integerValue: '1' },
            timestamp: { stringValue: now },
            reason: { stringValue: 'Migración inicial desde código hardcoded' },
          }}),
        });
        // Invalidar caché KV
        try { if (env.SALMA_KB) await env.SALMA_KB.delete('_cache:prompt'); } catch (_) {}
        return new Response(JSON.stringify({ ok: true, version: 1, chars: SALMA_SYSTEM_BASE.length }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── /admin/get-prompt — Leer prompt actual de Firestore ───
    if (request.method === 'GET' && url.pathname === '/admin/get-prompt') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }
      try {
        const docUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt`;
        const res = await fetch(docUrl);
        if (!res.ok) {
          return new Response(JSON.stringify({ source: 'hardcoded', prompt_text: SALMA_SYSTEM_BASE, version: 0 }), { headers: corsH });
        }
        const doc = await res.json();
        return new Response(JSON.stringify({
          source: 'firestore',
          prompt_text: doc.fields?.prompt_text?.stringValue || SALMA_SYSTEM_BASE,
          version: parseInt(doc.fields?.version?.integerValue || '0'),
          updated_at: doc.fields?.updated_at?.stringValue || '',
          updated_by: doc.fields?.updated_by?.stringValue || '',
        }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ source: 'hardcoded', prompt_text: SALMA_SYSTEM_BASE, version: 0 }), { headers: corsH });
      }
    }

    // ─── /admin/test-extract — Fase 1: Haiku extrae reglas del prompt ───
    if (request.method === 'POST' && url.pathname === '/admin/test-extract') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: corsH });
      }
      try {
        const currentPrompt = await getSystemPrompt(env);
        const rulesPrompt = `Analiza este prompt de sistema de un chatbot de viajes llamado Salma y extrae las 10-15 reglas más importantes que se puedan testear automáticamente. Para cada regla, genera 2 mensajes de usuario "trampa" que intentan hacer que el bot viole esa regla.

PROMPT:
${currentPrompt}

Responde en JSON estricto (sin markdown, sin backticks):
{"rules":[{"id":"rule_1","name":"Nombre corto de la regla","description":"Qué dice la regla","test_messages":["mensaje trampa 1","mensaje trampa 2"],"check_criteria":"Criterio para evaluar si la respuesta cumple la regla"}]}`;

        const rulesResult = await callOpenAI(apiKey, {
          model: 'gpt-4o-mini',
          max_tokens: 4000,
          messages: [{ role: 'user', content: rulesPrompt }],
        });
        const rulesText = rulesResult.text || '';
        let rules;
        try { rules = JSON.parse(rulesText); } catch (e) {
          const m = rulesText.match(/\{[\s\S]*\}/);
          rules = m ? JSON.parse(m[0]) : { rules: [] };
        }
        if (!rules.rules || rules.rules.length === 0) {
          return new Response(JSON.stringify({ error: 'No se pudieron extraer reglas', raw: rulesText.slice(0, 500) }), { status: 500, headers: corsH });
        }
        return new Response(JSON.stringify({ ok: true, rules: rules.rules }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── /admin/test-rule — Fase 2: Testear UNA regla (2 trampas + 2 evaluaciones = 4 calls) ───
    if (request.method === 'POST' && url.pathname === '/admin/test-rule') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: corsH });
      }
      try {
        const { rule } = await request.json();
        if (!rule || !rule.test_messages) {
          return new Response(JSON.stringify({ error: 'Missing rule data' }), { status: 400, headers: corsH });
        }
        const currentPrompt = await getSystemPrompt(env);
        const ruleResult = { id: rule.id, name: rule.name, description: rule.description, tests: [] };

        for (const testMsg of rule.test_messages.slice(0, 2)) {
          // Salma responde al mensaje trampa
          const salmaResult = await callOpenAI(apiKey, {
            model: 'gpt-4o-mini',
            max_tokens: 1500,
            temperature: 0.7,
            system: currentPrompt,
            messages: [{ role: 'user', content: testMsg }],
          });
          const salmaReply = salmaResult.text || '';

          // GPT evalúa la respuesta
          const evalPrompt = `Evalúa si esta respuesta de un chatbot cumple una regla específica.

REGLA: ${rule.name} — ${rule.description}
CRITERIO: ${rule.check_criteria}
MENSAJE DEL USUARIO: ${testMsg}
RESPUESTA DEL BOT: ${salmaReply}

Responde en JSON estricto (sin markdown):
{"pass":true/false,"score":"pass|fail|parcial","reason":"Explicación breve de por qué pasa o falla","fix_suggestion":"Si falla, sugiere qué cambiar EN EL PROMPT para que no vuelva a pasar. Si pasa, pon null."}`;

          const evalRes = await callOpenAI(apiKey, {
            model: 'gpt-4o-mini',
            max_tokens: 800,
            messages: [{ role: 'user', content: evalPrompt }],
          });
          const evalText = evalRes.text || '';
          let evalParsed;
          try { evalParsed = JSON.parse(evalText); } catch (e) {
            const m = evalText.match(/\{[\s\S]*\}/);
            evalParsed = m ? JSON.parse(m[0]) : { pass: false, score: 'error', reason: 'No se pudo evaluar', fix_suggestion: null };
          }
          ruleResult.tests.push({ message: testMsg, response: salmaReply.slice(0, 500), ...evalParsed });
        }

        const passes = ruleResult.tests.filter(t => t.pass).length;
        ruleResult.overall = passes === ruleResult.tests.length ? 'pass' : passes === 0 ? 'fail' : 'parcial';
        return new Response(JSON.stringify({ ok: true, result: ruleResult }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── /admin/apply-fix — Aplicar corrección individual al prompt ───
    if (request.method === 'POST' && url.pathname === '/admin/apply-fix') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }

      const apiKey = env.OPENAI_API_KEY;
      try {
        const fixBody = await request.json();
        const { rule_name, fix_suggestion, current_prompt } = fixBody;

        if (!fix_suggestion || !current_prompt) {
          return new Response(JSON.stringify({ error: 'Missing fix_suggestion or current_prompt' }), { status: 400, headers: corsH });
        }

        // GPT aplica el fix al prompt
        const applyPrompt = `Tienes que aplicar una corrección a un prompt de sistema.

CORRECCIÓN A APLICAR:
Regla: ${rule_name}
Sugerencia: ${fix_suggestion}

PROMPT ACTUAL:
${current_prompt}

Aplica la corrección de forma mínima — cambia solo lo necesario. No reescribas secciones enteras. Mantén el estilo y tono.

Responde con el prompt COMPLETO corregido. Sin explicaciones, sin markdown, solo el prompt.`;

        const applyResult = await callOpenAI(apiKey, {
          model: 'gpt-4o-mini',
          max_tokens: 8000,
          messages: [{ role: 'user', content: applyPrompt }],
        });

        const newPrompt = applyResult.text || '';

        if (newPrompt.length < 100) {
          return new Response(JSON.stringify({ error: 'Prompt generado demasiado corto', raw: newPrompt.slice(0, 200) }), { status: 500, headers: corsH });
        }

        // Leer versión actual
        const docUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt`;
        const currentDoc = await fetch(docUrl);
        const currentData = await currentDoc.json();
        const currentVersion = parseInt(currentData.fields?.version?.integerValue || '0');
        const newVersion = currentVersion + 1;
        const now = new Date().toISOString();

        // Guardar nuevo prompt
        await fetch(docUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            prompt_text: { stringValue: newPrompt },
            version: { integerValue: String(newVersion) },
            updated_at: { stringValue: now },
            updated_by: { stringValue: `fix: ${rule_name}` },
          }}),
        });

        // Historial
        const histUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt/history/${Date.now()}`;
        await fetch(histUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            prompt_text: { stringValue: newPrompt },
            version: { integerValue: String(newVersion) },
            timestamp: { stringValue: now },
            reason: { stringValue: `Fix automático: ${rule_name} — ${fix_suggestion.slice(0, 200)}` },
          }}),
        });

        // Invalidar caché KV
        try { if (env.SALMA_KB) await env.SALMA_KB.delete('_cache:prompt'); } catch (_) {}

        return new Response(JSON.stringify({
          ok: true,
          version: newVersion,
          chars: newPrompt.length,
          preview: newPrompt.slice(0, 300) + '...',
        }), { headers: corsH });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── /admin/save-prompt — Guardar prompt editado manualmente ───
    if (request.method === 'POST' && url.pathname === '/admin/save-prompt') {
      const corsH = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader.replace('Bearer ', '') !== env.ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsH });
      }
      try {
        const { prompt_text, reason } = await request.json();
        if (!prompt_text || prompt_text.length < 100) {
          return new Response(JSON.stringify({ error: 'Prompt demasiado corto' }), { status: 400, headers: corsH });
        }
        const docUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt`;
        const currentDoc = await fetch(docUrl);
        const currentData = await currentDoc.json();
        const currentVersion = parseInt(currentData.fields?.version?.integerValue || '0');
        const newVersion = currentVersion + 1;
        const now = new Date().toISOString();

        await fetch(docUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            prompt_text: { stringValue: prompt_text },
            version: { integerValue: String(newVersion) },
            updated_at: { stringValue: now },
            updated_by: { stringValue: 'manual-edit' },
          }}),
        });
        const histUrl = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/config/salma-prompt/history/${Date.now()}`;
        await fetch(histUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            prompt_text: { stringValue: prompt_text },
            version: { integerValue: String(newVersion) },
            timestamp: { stringValue: now },
            reason: { stringValue: reason || 'Edición manual' },
          }}),
        });
        try { if (env.SALMA_KB) await env.SALMA_KB.delete('_cache:prompt'); } catch (_) {}
        return new Response(JSON.stringify({ ok: true, version: newVersion, chars: prompt_text.length }), { headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    // ─── POST /tts — ElevenLabs Text-to-Speech ───
    if (request.method === 'POST' && url.pathname === '/tts') {
      const corsH = { 'Access-Control-Allow-Origin': '*' };
      try {
        const { text } = await request.json();
        if (!text) return new Response('No text', { status: 400, headers: corsH });

        // Limpiar markdown y símbolos antes de enviar a ElevenLabs
        const clean = text
          .replace(/#{1,6}\s?/g, '')
          .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
          .replace(/https?:\/\/\S+/g, '')
          .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '')
          .replace(/^[\s]*[-•]\s*/gm, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 1500); // Límite: no leer guías enteras

        if (!clean) return new Response('Empty text', { status: 400, headers: corsH });

        const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
          method: 'POST',
          headers: {
            'xi-api-key': env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: clean,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });

        if (!elRes.ok) {
          // Cualquier error (créditos agotados, etc.) → el cliente cae a Web Speech
          return new Response(JSON.stringify({ error: 'elevenlabs_error', status: elRes.status }), {
            status: elRes.status,
            headers: { ...corsH, 'Content-Type': 'application/json' },
          });
        }

        const audio = await elRes.arrayBuffer();
        return new Response(audio, {
          headers: { ...corsH, 'Content-Type': 'audio/mpeg' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...corsH, 'Content-Type': 'application/json' },
        });
      }
    }

    // ─── POST / ───
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    let body;
    try { body = await request.json(); } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const message = body.message || body.msg || '';
    const history = body.history || [];
    const currentRoute = body.current_route || null;
    const userName = body.user_name || null;

    // ─── RESPUESTAS PRE-COCINADAS — saludos simples sin contenido (~50ms, 0 tokens) ───
    // Solo intercepta cuando el mensaje es un saludo puro, sin destino ni pregunta añadida
    if (!currentRoute && history.length === 0) {
      const msgNorm = message.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const isPureGreeting = /^(hola[.!¡?]*|hey[.!]?|buenas[.!]?|buenos dias[.!]?|buenas (tardes|noches)[.!]?|ey[.!]?|hi[.!]?|hello[.!]?|qu[e']? (tal|pasa|hay)|como estas?[?]?|todo bien[?]?|saludos[.!]?)$/.test(msgNorm);
      if (isPureGreeting) {
        const nombre = body.user_name ? `, ${body.user_name.split(' ')[0]}` : '';
        const respuestas = [
          `¡Hola${nombre}! ¿A dónde tiramos hoy?`,
          `¡Buenas${nombre}! Cuéntame, ¿qué destino te tiene loco?`,
          `¡Ey${nombre}! El mundo está ahí fuera. ¿Cuál te apetece?`,
          `¡Hola${nombre}! ¿Ruta nueva, vuelo, hotel… o estás en un lío viajero?`,
          `¡Buenas${nombre}! Dime destino y días y te armo algo que merezca la pena.`,
          `¡Ey${nombre}! ¿Tienes ya destino o seguimos soñando con el mapa?`,
          `¡Hola${nombre}! ¿A dónde me llevas esta vez?`,
          `¡Buenas${nombre}! Aquí estoy. ¿Qué se te ha metido entre ceja y ceja?`,
          `¡Ey${nombre}! ¿Escapada de fin de semana o te vas al otro lado del mundo?`,
          `¡Hola${nombre}! Dime un sitio y te digo todo lo que necesitas saber.`,
        ];
        const reply = respuestas[Math.floor(Math.random() * respuestas.length)];
        return new Response(
          JSON.stringify({ reply, route: null }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }
    const userNationality = body.nationality || null;
    const userLocation = body.user_location || null;
    const travelDates = body.travel_dates || null;
    const transport = body.transport || null;
    const withKids = body.with_kids || false;
    const coinsSaldo = typeof body.coins_saldo === 'number' ? body.coins_saldo : 0;
    const rutasGratisUsadas = typeof body.rutas_gratis_usadas === 'number' ? body.rutas_gratis_usadas : 0;
    const imageBase64 = body.image_base64 || null;
    const mapMode = body.map_mode || false;
    const uid = body.uid || null;
    const userNotes = body.user_notes || null;
    const frontendCountryCode = body.country || null; // País enviado por el frontend (detectado por GPS)

    // ─── PRE-FETCH TRANSPORTE — arranca Brave+Duffel INMEDIATAMENTE, en paralelo con geocoding+KV ───
    // Si el mensaje parece transporte con OD, no esperar al bloque helpCategory (~400ms después)
    let _braveTransportPromise = null;
    let _duffelTransportPromise = null;
    let _transportODPrefetch = null;
    {
      const _isTransportMsg = /taxi|transfer|ferry|aeropuerto|airport|\btren\b|flixbus|renfe|\bave\s|como.?llegar|como.*ir.*de|de.*a.*en|bus.?(de|desde)|estacion/i.test(message);
      if (_isTransportMsg && env.BRAVE_SEARCH_KEY) {
        _transportODPrefetch = extractTransportOD(message);
        if (_transportODPrefetch) {
          const _routeStr = `${_transportODPrefetch.origin} to ${_transportODPrefetch.dest}`;
          _braveTransportPromise = buscarWeb(
            { query: `how to get from ${_routeStr} ferry bus train book ticket buy online booking` },
            env.BRAVE_SEARCH_KEY
          ).catch(() => null);
          // Duffel también arranca ya
          const _origIATA = getCityIATA(_transportODPrefetch.origin);
          const _destIATA = getCityIATA(_transportODPrefetch.dest);
          if (_origIATA && _destIATA && env.DUFFEL_ACCESS_TOKEN) {
            // Usar fechas del frontend si las hay, o extraerlas del mensaje, o mañana como fallback
            const _extractedDates = travelDates || extractDatesFromMessage(message);
            const _tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            const _duffelDate = _extractedDates?.from || _tomorrow;
            const _duffelReturn = _extractedDates?.to || null;
            _duffelTransportPromise = buscarVuelosDuffel(
              { origen: _origIATA, destino: _destIATA, fecha_ida: _duffelDate, fecha_vuelta: _duffelReturn, adultos: 1 },
              env.DUFFEL_ACCESS_TOKEN
            ).catch(() => null);
          }
        }
      }
    }

    // Reverse geocoding: convertir coordenadas → nombre de ciudad + país (Nominatim/OSM, gratis)
    let userLocationName = null;
    let userCountryCode = null; // ISO 2 letras del país donde está el usuario (por GPS)
    if (userLocation && userLocation.lat && userLocation.lng) {
      const geoKey = `geo:${userLocation.lat.toFixed(2)}:${userLocation.lng.toFixed(2)}`;

      let geoCache = null;
      if (env.SALMA_KB) {
        try {
          const cached = await env.SALMA_KB.get(geoKey);
          if (cached) geoCache = JSON.parse(cached);
        } catch (_) {}
      }

      if (geoCache) {
        userLocationName = geoCache.name;
        userCountryCode = geoCache.cc;
      } else {
        try {
          const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${userLocation.lat}&lon=${userLocation.lng}&format=json&zoom=10&accept-language=en`;
          const geoRes = await fetch(geoUrl, {
            headers: { 'User-Agent': 'BorradoDelMapa/1.0 (salma@borradodelmapa.com)' },
            signal: AbortSignal.timeout(5000),
          });
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.name || '';
          const country = geoData.address?.country || '';
          userCountryCode = (geoData.address?.country_code || '').toUpperCase();
          if (city) userLocationName = city + (country ? ', ' + country : '');

          if (env.SALMA_KB && userLocationName) {
            try {
              await env.SALMA_KB.put(geoKey, JSON.stringify({ name: userLocationName, cc: userCountryCode }), { expirationTtl: 86400 });
            } catch (_) {}
          }
        } catch (e) {}
      }
    }

    if (!message.trim()) {
      return new Response(
        JSON.stringify({ reply: 'Dime a dónde quieres ir o qué te apetece hacer y te ayudo.', route: null }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const apiKey = env.OPENAI_API_KEY; // solo para fotos (imageBase64) y rutas largas
    // Texto sin foto → Anthropic. Solo bloqueamos si no hay ninguna key disponible
    if (!apiKey && !env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ reply: 'Salma no está configurada (falta API key).', route: null }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ─── HELP SEARCH / WEATHER (pre-Claude) ───
    let helpResults = null;
    let weatherData = null;
    let transportSearchData = null;
    const helpCategory = isHelpRequest(message);
    if (helpCategory) {
      let helpLocation = extractHelpLocation(message, history, currentRoute);
      const helpLocationFromMessage = !!helpLocation; // true si la ubicación viene del mensaje, no del GPS
      // Si no hay location explícita pero tenemos geoloc, usar la ciudad del usuario
      if (!helpLocation && userLocationName) {
        helpLocation = userLocationName.split(',')[0].trim();
      }
      // Solo usar GPS coords si la ubicación NO viene del mensaje (evita buscar taxis en Samui cuando piden Málaga)
      const searchCoords = helpLocationFromMessage ? null : userLocation;
      if (helpLocation) {
        try {
          if (helpCategory === 'weather') {
            weatherData = await fetchWeather(helpLocation, env.OPENWEATHER_KEY);
          } else if (helpCategory === 'transport') {
            // Formato rico con Brave SOLO cuando hay origen+destino explícito ("de X a Y")
            // Preguntas genéricas ("hay taxi aquí", "bus turístico") → Claude responde con su conocimiento
            const od = extractTransportOD(message);
            if (od && od.origin && od.dest) {
              const originCity = od.origin;
              const destCity = od.dest;
              const routeStr = `${originCity} to ${destCity}`;

              // Usar el promise pre-iniciado (arrancó ~400ms antes, en paralelo con geocoding+KV)
              // Si por alguna razón no se pre-inició, lanzar ahora como fallback
              const bravePromise = _braveTransportPromise ||
                (env.BRAVE_SEARCH_KEY
                  ? buscarWeb({ query: `how to get from ${routeStr} ferry bus train book ticket buy online booking` }, env.BRAVE_SEARCH_KEY).catch(() => null)
                  : Promise.resolve(null));

              const origIATA = getCityIATA(originCity);
              const destIATA = getCityIATA(destCity);
              const duffelPromise = _duffelTransportPromise ||
                (origIATA && destIATA && env.DUFFEL_ACCESS_TOKEN
                  ? buscarVuelosDuffel({ origen: origIATA, destino: destIATA, fecha_ida: new Date(Date.now() + 86400000).toISOString().split('T')[0], adultos: 1 }, env.DUFFEL_ACCESS_TOKEN).catch(() => null)
                  : Promise.resolve(null));

              const [res1, flightRes] = await Promise.all([bravePromise, duffelPromise]);

              const combinedResults = res1?.resultados || [];
              if (combinedResults.length > 0) transportSearchData = { resultados: combinedResults, flightData: flightRes };
              else if (flightRes && !flightRes.error) transportSearchData = { resultados: [], flightData: flightRes };
            }
            // Si no hay od explícito → transportSearchData queda null → Claude responde sin formato
          } else {
            helpResults = await searchPlacesForHelp(message, helpLocation, env.GOOGLE_PLACES_KEY, searchCoords);
          }
        } catch (e) {
          // Fallo silencioso — Salma responde sin datos de búsqueda
        }
      }
    }

    // Si era consulta de tiempo pero wttr.in falló → forzar buscar_web en el contexto
    let weatherFallbackMsg = null;
    if (helpCategory === 'weather' && !weatherData) {
      weatherFallbackMsg = '[TIEMPO: Los datos en tiempo real no están disponibles. USA buscar_web AHORA para obtener el tiempo actual. El tiempo cambia cada hora — jamás respondas con tu conocimiento base.]';
    }

    // Si era consulta de transporte → inyectar bloque pre-estructurado con URLs ya asignadas
    // Claude solo rellena los [campos] — las líneas "Reservar:" están fijas en el worker
    let transportFallbackMsg = null;
    if (helpCategory === 'transport') {
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

      const fd = transportSearchData?.flightData;
      const hasData = transportSearchData?.resultados?.length > 0 || (fd && !fd.error);

      if (hasData) {
        // URL terrestre: primera URL de Brave que esté en la whitelist, o rome2rio como fallback garantizado
        const braveUrls = transportSearchData?.resultados?.filter(r => r.url) || [];
        const _allowedLandDomains = [
          '12go.asia','12go.com','bookaway.com','lomprayah.com','seatrandiscovery.com','seatranferry.com',
          'rome2rio.com','busbud.com','trainline.com','thetrainline.com','trenitalia.com','renfe.com',
          'omio.com','omio.es','wanderu.com','flixbus.es','flixbus.com','blablacar.es','blablacar.com',
          'directferries.com','directferries.es','ferryhopper.com','ferryscanner.com','clickferry.com',
          'balearia.com','frs.es','trasmediterranea.es','armasferry.com','aferry.com','aferry.es',
          'virail.es','virail.com','alsa.es','rajaferryport.com',
        ];
        const allowedBraveUrl = braveUrls.find(r => _allowedLandDomains.some(d => r.url?.includes(d)));
        const od = _transportODPrefetch;
        const rome2rioUrl = od
          ? `https://www.rome2rio.com/s/${encodeURIComponent(od.origin)}/${encodeURIComponent(od.dest)}`
          : 'https://www.rome2rio.com';
        const landUrl = allowedBraveUrl?.url || rome2rioUrl;
        // URL vuelo: Skyscanner de Duffel si hay resultados, null si no
        const flightUrl = (fd && !fd.error) ? fd.enlace_reserva : null;

        let ctx = `[DATOS TRANSPORTE — ${dateStr}, ${timeStr}\n\n`;

        // Referencias para precios y compañías (Brave)
        if (transportSearchData?.resultados?.length > 0) {
          const snippets = transportSearchData.resultados.slice(0, 4).map((r, i) => {
            let s = `[${i+1}] ${r.titulo}\n${r.snippet}`;
            if (r.contenido) s += `\nInfo: ${r.contenido.slice(0, 300)}`;
            return s;
          }).join('\n\n');
          ctx += `REFERENCIAS — precios, compañías, horarios reales:\n${snippets}\n\n`;
        }

        // Vuelos Duffel (precios en tiempo real)
        if (fd && !fd.error && fd.vuelos?.length > 0) {
          const vSnippets = fd.vuelos.slice(0, 3).map(v =>
            `• ${v.aerolinea}: ${v.origen}→${v.destino} ${v.salida?.slice(11,16) || ''}→${v.llegada?.slice(11,16) || ''} | ${v.precio} | ${v.duracion || ''}`
          ).join('\n');
          ctx += `VUELOS DUFFEL (precios reales de hoy):\n${vSnippets}\n\n`;
        }

        // Esqueleto pre-estructurado — URLs ya incrustadas, Claude solo rellena [campos]
        ctx += `RESPUESTA EXACTA — sustituye los [campos] con datos de las REFERENCIAS. `;
        ctx += `Las líneas "Reservar:" están FIJAS: cópialas tal cual, sin cambiar ni una letra.\n\n`;
        ctx += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        ctx += `Encontré [N] opciones verificadas hoy (${dateStr}, ${timeStr}):\n\n`;

        ctx += `[EMOJI] [Nombre opción 1 — ej. "Ferry + Bus nocturno"] ([etiqueta: Más barato / Recomendado])\n`;
        ctx += `  • [Compañía]: [Origen] → [Destino] · [duración] · [precio]\n`;
        ctx += `  • Total: [precio total] | [tiempo total] ⏱️\n`;
        ctx += `  • Reservar: ${landUrl}\n\n`;

        ctx += `[EMOJI] [Nombre opción 2 — si existe otra opción terrestre diferente, ej. "Ferry + Tren nocturno"]\n`;
        ctx += `  • [Compañía]: [Origen] → [Destino] · [duración] · [precio]\n`;
        ctx += `  • Total: [precio total] | [tiempo total] ⏱️\n`;
        ctx += `  • Reservar: ${landUrl}\n\n`;

        if (flightUrl) {
          const primerVuelo = fd?.vuelos?.[0];
          ctx += `✈️ Vuelo directo (Más rápido)\n`;
          if (primerVuelo) {
            ctx += `  • ${primerVuelo.aerolinea}: ${primerVuelo.origen}→${primerVuelo.destino} | ${primerVuelo.precio} | ${primerVuelo.duracion || ''}\n`;
          } else {
            ctx += `  • [Aerolínea]: [Origen] → [Destino] · [duración] · [precio]\n`;
          }
          ctx += `  • Total: ${primerVuelo ? primerVuelo.precio : '[precio]'} | [duración] ⏱️\n`;
          ctx += `  • Reservar: ${flightUrl}\n\n`;
        }

        ctx += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        ctx += `REGLAS:\n`;
        ctx += `- Sustituye todos los [campos] con datos reales de las REFERENCIAS\n`;
        ctx += `- Si solo hay una opción terrestre real, elimina el bloque de opción 2\n`;
        ctx += `- GEOGRAFÍA: si el destino no tiene puerto (Bangkok, Madrid, Roma, Marrakech...), el ferry NUNCA llega directo — muestra siempre el tramo ferry + tramo terrestre\n`;
        ctx += `- Emojis: 🚢 ferry · 🚌 bus · 🚄 tren · ✈️ vuelo · 🛥️ speedboat · 🚕 taxi\n`;
        ctx += `- Rango de precio si no hay exacto (ej. "800-1.200 THB")\n`;
        ctx += `- Termina sin preguntas\n`;
        ctx += `]`;

        transportFallbackMsg = ctx;
      } else {
        transportFallbackMsg = null;
      }
    }

    // ─── EVENT SEARCH (pre-Claude, solo cuando hay fechas) ───
    let eventData = null;
    if (travelDates && travelDates.from && env.SERPER_API_KEY) {
      try {
        // Extraer destino del mensaje (simplificado: primera palabra capitalizada significativa)
        const destMatch = message.match(/(?:a |en |por |de )([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/);
        const destination = destMatch ? destMatch[1] : (currentRoute ? (currentRoute.name || currentRoute.title) : null);
        if (destination) {
          eventData = await searchEvents(destination, travelDates.from, travelDates.to, env.SERPER_API_KEY);
        }
      } catch (e) { /* Fallo silencioso */ }
    }

    // ─── KV LOOKUP (pre-Claude) ───
    let kvCountryData = null;
    let kvDestinationData = null;
    let kvCachedRoute = null;
    let kvTransportData = null;
    const _kvDebug = {};
    if (env.SALMA_KB) {
      try {
        // Extraer ubicación: primero el extractor normal, luego buscar palabras del mensaje en KV
        let location = extractHelpLocation(message, history, currentRoute);
        let countryCode = null;

        if (location) {
          const kwNorm = location.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          countryCode = await env.SALMA_KB.get('kw:' + kwNorm);
        }

        // Si no encontró con extractHelpLocation, buscar cada palabra capitalizada del mensaje
        if (!countryCode) {
          const words = message.match(/[A-ZÁÉÍÓÚÑ\u00C0-\u024F][a-záéíóúñ\u00E0-\u024F]{2,}/g) || [];
          for (const word of words) {
            const norm = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const code = await env.SALMA_KB.get('kw:' + norm);
            if (code) { countryCode = code; location = word; break; }
          }
        }

        // Fix lowercase: si el mensaje tiene palabras en minúscula que son países/ciudades
        if (!countryCode) {
          const STOPWORDS = new Set(['que','con','como','para','una','los','las','del','por','sin','mas','muy','hay','tiene','quiero','puedo','donde','cuanto','cuesta','vale','esta','esto','esa','ese','cual','cuando','desde','hasta','sobre','entre','tras','cada','todo','toda','nada','algo','algun','alguna','bien','mal','bueno','mala','mejor','peor','gran','poco','mucho','menos','hola','oye','dame','dime','dinos','cuales','son','fue','era','han','has','haz','pon','mira','vez','dia','mes','ano','hora','tiempo','lugar','sitio','zona','area','parte','tipo','tipo','cosa','info','info','datos','dato','precio','coste','coste','tema','tema','tips','tip','idioma','moneda','visa','visado','seguro','seguridad','vuelo','hotel','ruta','viaje','viajes','pais','ciudad','playa','mar','rio','lago']);
          const allWords = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/\b[a-z]{3,}\b/g) || [];
          for (const word of allWords) {
            if (STOPWORDS.has(word)) continue;
            const code = await env.SALMA_KB.get('kw:' + word);
            if (code) { countryCode = code; location = location || word; break; }
          }
        }

        // Fallback 2: geocodificar el nombre de la ciudad/lugar para detectar país
        if (!countryCode && location) {
          try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&accept-language=es`;
            const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'SalmaBot/1.0' } });
            const geoArr = await geoRes.json();
            if (geoArr.length > 0 && geoArr[0].display_name) {
              // Extraer país del display_name (último componente) o usar boundingbox
              const parts = geoArr[0].display_name.split(',');
              const countryName = parts[parts.length - 1].trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              // Mapeo rápido de nombres de país a código ISO
              const countryMap = {
                'espana': 'ES', 'spain': 'ES', 'francia': 'FR', 'france': 'FR', 'portugal': 'PT',
                'italia': 'IT', 'italy': 'IT', 'alemania': 'DE', 'germany': 'DE', 'reino unido': 'GB',
                'united kingdom': 'GB', 'estados unidos': 'US', 'united states': 'US', 'mexico': 'MX',
                'argentina': 'AR', 'colombia': 'CO', 'peru': 'PE', 'chile': 'CL', 'brasil': 'BR',
                'brazil': 'BR', 'tailandia': 'TH', 'thailand': 'TH', 'japon': 'JP', 'japan': 'JP',
                'marruecos': 'MA', 'morocco': 'MA', 'turquia': 'TR', 'turkey': 'TR', 'turkiye': 'TR',
                'grecia': 'GR', 'greece': 'GR', 'iran': 'IR', 'india': 'IN', 'china': 'CN',
                'australia': 'AU', 'canada': 'CA', 'cuba': 'CU', 'republica dominicana': 'DO',
                'costa rica': 'CR', 'panama': 'PA', 'ecuador': 'EC', 'bolivia': 'BO', 'uruguay': 'UY',
                'paraguay': 'PY', 'venezuela': 'VE', 'guatemala': 'GT', 'honduras': 'HN',
                'el salvador': 'SV', 'nicaragua': 'NI', 'filipinas': 'PH', 'philippines': 'PH',
                'indonesia': 'ID', 'malasia': 'MY', 'malaysia': 'MY', 'vietnam': 'VN', 'viet nam': 'VN',
                'camboya': 'KH', 'cambodia': 'KH', 'laos': 'LA', 'myanmar': 'MM', 'singapur': 'SG',
                'singapore': 'SG', 'corea del sur': 'KR', 'south korea': 'KR', 'egipto': 'EG',
                'egypt': 'EG', 'sudafrica': 'ZA', 'south africa': 'ZA', 'kenia': 'KE', 'kenya': 'KE',
                'tanzania': 'TZ', 'etiopia': 'ET', 'ethiopia': 'ET', 'nigeria': 'NG',
                'belgica': 'BE', 'belgium': 'BE', 'paises bajos': 'NL', 'netherlands': 'NL',
                'suiza': 'CH', 'switzerland': 'CH', 'austria': 'AT', 'irlanda': 'IE', 'ireland': 'IE',
                'dinamarca': 'DK', 'denmark': 'DK', 'noruega': 'NO', 'norway': 'NO',
                'suecia': 'SE', 'sweden': 'SE', 'finlandia': 'FI', 'finland': 'FI',
                'polonia': 'PL', 'poland': 'PL', 'rumania': 'RO', 'romania': 'RO',
                'hungria': 'HU', 'hungary': 'HU', 'republica checa': 'CZ', 'czechia': 'CZ',
                'croacia': 'HR', 'croatia': 'HR', 'serbia': 'RS', 'bulgaria': 'BG',
                'rusia': 'RU', 'russia': 'RU', 'ucrania': 'UA', 'ukraine': 'UA',
                'israel': 'IL', 'jordania': 'JO', 'jordan': 'JO', 'libano': 'LB', 'lebanon': 'LB',
                'arabia saudita': 'SA', 'saudi arabia': 'SA', 'emiratos arabes unidos': 'AE',
                'united arab emirates': 'AE', 'qatar': 'QA', 'oman': 'OM', 'kuwait': 'KW',
                'nueva zelanda': 'NZ', 'new zealand': 'NZ', 'islandia': 'IS', 'iceland': 'IS',
              };
              countryCode = countryMap[countryName] || null;
            }
          } catch (e) { /* geocoding fallo — silencioso */ }
        }

        // Fallback 3: si hay GPS y no se encontró país por el mensaje, usar el país del GPS
        if (!countryCode && userCountryCode) {
          countryCode = userCountryCode;
        }

        // Fallback 4: país enviado por el frontend (detectado por GPS del navegador)
        if (!countryCode && frontendCountryCode) {
          countryCode = frontendCountryCode;
        }

        if (countryCode) {
          const kwNorm = (location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          const ccLower = countryCode.toLowerCase();

          // Leer KV en paralelo (en vez de secuencial — ahorra ~200ms)
          const daysMatch = message.match(/(\d+)\s*d\S*as?/i) || message.match(/(\d+)\s*days?/i);
          const days = daysMatch ? daysMatch[1] : null;
          const routeKey = (isRouteRequest(message, history) && days)
            ? 'route:' + countryCode + ':' + kwNorm.replace(/\s+/g, '-') + ':' + days
            : null;

          const [baseJson, spotRef, transportJson, cachedRouteJson] = await Promise.all([
            env.SALMA_KB.get('dest:' + ccLower + ':base'),
            env.SALMA_KB.get('spot:' + kwNorm),
            env.SALMA_KB.get('transport:' + ccLower),
            routeKey ? env.SALMA_KB.get(routeKey) : Promise.resolve(null),
          ]);

          if (baseJson) kvCountryData = JSON.parse(baseJson);
          if (cachedRouteJson) kvCachedRoute = JSON.parse(cachedRouteJson);
          if (transportJson) kvTransportData = JSON.parse(transportJson);

          // Destino específico: si spotRef existe, leer el detalle (segunda ronda, unavoidable)
          if (spotRef) {
            const spotJson = await env.SALMA_KB.get('dest:' + spotRef.replace(':', ':spot:'));
            if (spotJson) kvDestinationData = JSON.parse(spotJson);
          }
        }
      } catch (e) { /* KV fallo silencioso — Salma funciona sin KV */ }
    }

    // Si hay ruta cacheada, devolverla directamente (0 coste, <100ms)
    // Pero solo si tiene calidad mínima: al menos 3 paradas/día de media
    const _cachedStops = kvCachedRoute?.stops?.length || 0;
    const _cachedDaySet = new Set((kvCachedRoute?.stops || []).map(s => s.day));
    const _cachedDayCount = _cachedDaySet.size || 1;
    const _cachedQuality = _cachedStops / _cachedDayCount >= 3;
    if (kvCachedRoute && kvCachedRoute.stops && _cachedStops > 0 && _cachedQuality) {
      const cachedReply = kvCachedRoute.title ? `Tu ruta por ${kvCachedRoute.title} está lista.` : 'Tu ruta está lista.';
      // Devolver como SSE para que el frontend lo procese correctamente
      const sseData = `data: ${JSON.stringify({ t: cachedReply })}\n\ndata: ${JSON.stringify({ done: true, reply: cachedReply, route: kvCachedRoute })}\n\n`;
      return new Response(sseData, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'Access-Control-Allow-Origin': '*', 'X-Salma-Cache': 'HIT' }
      });
    }

    // ─── RESPUESTA DIRECTA DEL KV (sin llamar a Claude = 0 coste) ───
    if (kvCountryData && !imageBase64 && !isRouteRequest(message, history) && !isFlightRequest(message) && !isHotelRequest(message) && !isServiceRequest(message) && !helpCategory) {
      const kvDirectReply = tryKVDirectAnswer(message, kvCountryData, kvDestinationData);
      if (kvDirectReply) {
        return new Response(
          JSON.stringify({ reply: kvDirectReply, route: null }),
          { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    // Leer prompt dinámico de Firestore (caché 60s, fallback hardcoded)
    const dynamicPrompt = await getSystemPrompt(env);

    // Construir mensajes (con datos KV si los hay)
    let { systemPrompt, messages } = buildMessages(history, message, currentRoute, userName, userNationality, helpResults, weatherData, userLocation, userLocationName, eventData, travelDates, transport, withKids, coinsSaldo, rutasGratisUsadas, kvCountryData, kvDestinationData, kvTransportData, imageBase64, dynamicPrompt, mapMode);

    // Inyectar notas del usuario en el contexto
    if (userNotes && userNotes.length > 0) {
      const notasCtx = userNotes.map(n => {
        let line = `- ${n.texto} (${n.tipo})`;
        if (n.fecha) line += ` [fecha: ${n.fecha}]`;
        return line;
      }).join('\n');
      systemPrompt += `\n\n[NOTAS DEL VIAJERO — el usuario tiene estas notas guardadas. Tenlas en cuenta si son relevantes:\n${notasCtx}]`;
    }

    if (weatherFallbackMsg) {
      systemPrompt += '\n\n' + weatherFallbackMsg;
    }

    if (transportFallbackMsg) {
      // Inyectar en el último mensaje de usuario (más efectivo que en systemPrompt para formato)
      if (messages.length > 0) {
        const last = messages[messages.length - 1];
        if (last.role === 'user' && typeof last.content === 'string') {
          last.content = last.content + '\n\n' + transportFallbackMsg;
        } else {
          systemPrompt += '\n\n' + transportFallbackMsg;
        }
      } else {
        systemPrompt += '\n\n' + transportFallbackMsg;
      }
    }

    const isRoute = isRouteRequest(message, history);
    const isFlightReq = isFlightRequest(message);
    const isHotelReq = isHotelRequest(message);
    const isServiceReq = isServiceRequest(message);
    const reqStartTime = Date.now();
    // Si helpCategory=food y ya tenemos resultados de Google Places, no usar tool
    const serviceReqEffective = isServiceReq && !(helpCategory === 'food' && helpResults);
    // transportFallbackMsg tiene datos pre-buscados → Claude no necesita tools, responde directo del esqueleto
    const needsTools = isRoute || isFlightReq || isHotelReq || serviceReqEffective || !!imageBase64 || !!weatherFallbackMsg;
    // Fotos → OpenAI (mejor visión). Texto → Claude Sonnet (mejor instrucciones)
    const useAnthropic = !imageBase64;
    const reqModel = 'gpt-4o-mini'; // solo para fotos (OpenAI)
    const reqMaxTokens = needsTools ? 6000 : 3000;

    // ─── STREAMING SSE + BUCLE AGENTIC (tool use) ───
    const sseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    };

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Subida paralela de foto a R2 (no bloquea la respuesta de Claude)
    let photoUploadPromise = null;
    if (imageBase64 && env.SALMA_PHOTOS && uid) {
      photoUploadPromise = (async () => {
        try {
          const timestamp = Date.now();
          const key = `photos/${uid}/chat/${timestamp}.jpg`;
          const binaryStr = atob(imageBase64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
          await env.SALMA_PHOTOS.put(key, bytes, {
            httpMetadata: { contentType: 'image/jpeg' },
            customMetadata: { uid, source: 'chat' }
          });
          return { key, url: `https://salma-api.paco-defoto.workers.dev/photo/${encodeURIComponent(key)}` };
        } catch (e) {
          console.error('R2 chat photo upload error:', e);
          return null;
        }
      })();
    }

    // Todo el flujo (incluido el bucle agentic) ocurre dentro de ctx.waitUntil
    ctx.waitUntil((async () => {
      let allText = '';  // Texto acumulado de TODAS las iteraciones
      const MAX_TOOL_ITERATIONS = 5;  // Seguridad: máximo 5 tool calls por turno
      const longRoute = isLongRoute(message); // Rutas ≥8 días → generación por bloques paralelos

      try {
        // ── RUTA LARGA (≥8 días): generación por bloques paralelos ──
        if (longRoute) {
          const days = extractDaysFromMessage(message);
          try {
            // 1. Texto intro streameado
            await writer.write(encoder.encode(`data: ${JSON.stringify({ t: 'Venga, me pongo con ello. Te la monto en varias partes para que vayas viendo...' })}\n\n`));

            // 2. Planificar bloques (~2s)
            const blocks = await planBlocks(systemPrompt, message, days, apiKey);

            if (blocks && blocks.length > 1) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ plan: blocks, total_blocks: blocks.length })}\n\n`));

              // 3. Generar bloques en paralelo
              const keepalive = setInterval(async () => {
                try { await writer.write(encoder.encode(`data: ${JSON.stringify({ k: 1 })}\n\n`)); } catch (_) {}
              }, 3000);

              let route = null;
              try {
                // Pipeline: cada bloque genera→verifica→emite independientemente
                const blockResults = await generateAndVerifyPipeline(blocks, systemPrompt, message, apiKey, env.GOOGLE_PLACES_KEY, writer, encoder);

                if (blockResults.length > 0) {
                  route = mergeBlocks(blockResults, message);
                }
              } finally {
                clearInterval(keepalive);
              }

              if (route) {
                const reply = 'Tu ruta completa está lista.';

                // Guardar en KV nivel 3 — con múltiples keys para matchear
                if (route.stops && route.stops.length > 0 && env.SALMA_KB) {
                  try {
                    const routeJson = JSON.stringify(route);
                    const ttl = { expirationTtl: 2592000 }; // 30 días
                    const country = (route.country || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
                    const region = (route.region || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
                    const title = (route.title || route.name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
                    const cc = await env.SALMA_KB.get('kw:' + country) || country.substring(0, 2);
                    // Key principal (region completa)
                    if (region) ctx.waitUntil(env.SALMA_KB.put(`route:${cc}:${region}:${days}`, routeJson, ttl));
                    // Key simple (solo país/destino — para matchear "3 días en Sevilla")
                    if (country && country !== region) ctx.waitUntil(env.SALMA_KB.put(`route:${cc}:${country}:${days}`, routeJson, ttl));
                    // Key por primera palabra relevante del destino
                    const simpleKey = region.split(',')[0].split('-')[0].trim();
                    if (simpleKey && simpleKey !== country && simpleKey !== region) {
                      ctx.waitUntil(env.SALMA_KB.put(`route:${cc}:${simpleKey}:${days}`, routeJson, ttl));
                    }
                  } catch (_) {}
                }

                const doneEvtB = { done: true, reply, route };
                if (photoUploadPromise) {
                  const pr = await photoUploadPromise;
                  if (pr) { doneEvtB.photo_url = pr.url; doneEvtB.photo_key = pr.key; }
                }
                await writer.write(encoder.encode(`data: ${JSON.stringify(doneEvtB)}\n\n`));

                ctx.waitUntil(logToFirestore({
                  timestamp: new Date().toISOString(),
                  type: 'route_blocks',
                  user_message: message.slice(0, 200),
                  chars_out: JSON.stringify(route).length,
                  latency_ms: Date.now() - reqStartTime,
                  status: 'ok',
                  error_detail: `${blocks.length} bloques`,
                  model: reqModel,
                }));

                await writer.close();
                return; // Sale del flujo — ruta larga completada
              }
            }
            // Si planBlocks falla o devuelve 1 bloque, cae al flujo normal
          } catch (e) {
            // Fallback al flujo normal
          }
        }

        // Mensajes que crecen con cada iteración del bucle (tool_use → tool_result)
        let currentMessages = [...messages];
        let lastFlightBookingUrl = null; // Guardar enlace de vuelos para inyectar si GPT no lo incluye

        for (let iteration = 0; iteration <= MAX_TOOL_ITERATIONS; iteration++) {
          let apiRes;
          let result;

          if (useAnthropic) {
            // ── Claude Sonnet (texto sin foto) ──
            try {
              apiRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': env.ANTHROPIC_API_KEY,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-6',
                  max_tokens: reqMaxTokens,
                  system: systemPrompt,
                  messages: currentMessages,
                  tools: ANTHROPIC_TOOLS,
                  stream: true,
                }),
              });
            } catch (e) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: 'No puedo conectar ahora mismo. Inténtalo en un momento.', route: null })}\n\n`));
              break;
            }
            if (!apiRes.ok) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: 'Uy, no he podido conectar. Inténtalo en un momento.', route: null })}\n\n`));
              break;
            }
            result = await readAnthropicStream(apiRes, writer, encoder, decoder, true);
          } else {
            // ── OpenAI gpt-4o-mini (fotos con visión) ──
            const openaiMsgs = [{ role: 'system', content: systemPrompt }];
            for (const m of currentMessages) {
              if (m.role === 'user' && Array.isArray(m.content)) {
                for (const block of m.content) {
                  if (block.type === 'tool_result') {
                    openaiMsgs.push({ role: 'tool', tool_call_id: block.tool_use_id, content: block.content });
                  }
                }
              } else if (m.role === 'assistant' && Array.isArray(m.content)) {
                let textParts = '';
                const toolCalls = [];
                for (const block of m.content) {
                  if (block.type === 'text') textParts += block.text;
                  else if (block.type === 'tool_use') {
                    toolCalls.push({ id: block.id, type: 'function', function: { name: block.name, arguments: JSON.stringify(block.input) } });
                  }
                }
                const msg = { role: 'assistant' };
                if (textParts) msg.content = textParts;
                if (toolCalls.length) msg.tool_calls = toolCalls;
                if (!textParts && !toolCalls.length) msg.content = '';
                openaiMsgs.push(msg);
              } else {
                openaiMsgs.push(m);
              }
            }
            try {
              apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                  model: reqModel,
                  max_tokens: reqMaxTokens,
                  temperature: 0.7,
                  messages: openaiMsgs,
                  tools: OPENAI_TOOLS,
                  parallel_tool_calls: true,
                  stream: true,
                }),
              });
            } catch (e) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: 'No puedo conectar ahora mismo. Inténtalo en un momento.', route: null })}\n\n`));
              break;
            }
            if (!apiRes.ok) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: 'Uy, no he podido conectar. Inténtalo en un momento.', route: null })}\n\n`));
              break;
            }
            result = await readOpenAIStream(apiRes, writer, encoder, decoder, true);
          }

          allText += result.fullText;

          // ── Si terminó (no pide herramientas), salir del bucle ──
          if (result.stopReason !== 'tool_use') {
            break;
          }

          // ── OpenAI pide usar herramientas → ejecutarlas ──
          // Añadir respuesta (con tool_use blocks) al historial
          currentMessages.push({
            role: 'assistant',
            content: result.contentBlocks
          });

          // Ejecutar herramientas — en paralelo si hay varias
          const toolUseBlocks = result.contentBlocks.filter(b => b.type === 'tool_use');

          // Stream progress events antes de lanzar (el usuario ve texto inmediatamente)
          const progressLines = toolUseBlocks.map(b => getToolProgressMsg(b.name, b.input)).filter(Boolean);
          if (progressLines.length) {
            try { await writer.write(encoder.encode(`data: ${JSON.stringify({ t: progressLines.join('') })}\n\n`)); } catch (_) {}
          }

          // Señal de "buscando" al frontend + heartbeat cada 2s para mantener la animación
          let _searchingActive = toolUseBlocks.length > 0;
          if (_searchingActive) {
            try { await writer.write(encoder.encode(`data: ${JSON.stringify({ searching: true })}\n\n`)); } catch (_) {}
            // Heartbeat periódico mientras los tools corren en paralelo
            const _heartbeatLoop = (async () => {
              while (_searchingActive) {
                await new Promise(r => setTimeout(r, 2000));
                if (_searchingActive) {
                  try { await writer.write(encoder.encode(`data: ${JSON.stringify({ searching: true })}\n\n`)); } catch (_) {}
                }
              }
            })();
          }

          // Ejecutar todas en paralelo con Promise.all
          const toolResults = await Promise.all(
            toolUseBlocks.map(async block => {
              const toolResult = await executeToolCall(block.name, block.input, env, userLocation);
              // Capturar enlace de vuelos para inyectar si GPT no lo incluye
              if (block.name === 'buscar_vuelos' && toolResult.enlace_reserva) {
                lastFlightBookingUrl = toolResult.enlace_reserva;
              }
              // Enviar evento al cliente para guardar nota en Firestore
              if (block.name === 'guardar_nota' && toolResult.saved) {
                try { await writer.write(encoder.encode(`data: ${JSON.stringify({ save_nota: true, nota_data: toolResult.nota })}\n\n`)); } catch (_) {}
              }
              return {
                type: 'tool_result',
                tool_use_id: block.id,
                content: JSON.stringify(toolResult)
              };
            })
          );

          // Parar heartbeat — tools terminados
          _searchingActive = false;

          // Añadir resultados de herramientas al historial
          currentMessages.push({
            role: 'user',
            content: toolResults
          });

          // Separador entre texto de la iteración anterior y la siguiente
          try { await writer.write(encoder.encode(`data: ${JSON.stringify({ t: '\n\n' })}\n\n`)); } catch (_) {}

          // El for vuelve al inicio: OpenAI recibe los resultados y decide qué hacer
        }

        // ── Inyectar enlace de vuelos si GPT no lo incluyó ──
        if (lastFlightBookingUrl && !allText.includes(lastFlightBookingUrl)) {
          const linkChunk = '\n\nPara reservar:\n' + lastFlightBookingUrl;
          allText += linkChunk;
          try { await writer.write(encoder.encode(`data: ${JSON.stringify({ t: linkChunk })}\n\n`)); } catch (_) {}
        }

        // ── Extraer FOTO_TAG si la hubo ──
        let photoTag = null;
        if (imageBase64) {
          const tagMatch = allText.match(/\n?FOTO_TAG:\s*(\w+)/i);
          if (tagMatch) {
            photoTag = tagMatch[1].toLowerCase();
            allText = allText.replace(/\n?FOTO_TAG:\s*\w+/i, '').trim();
          }
        }

        // ── Inyectar Google Maps y transporte como stream chunks (antes de procesar reply) ──
        {
          const tempReply = replyWithoutRouteBlock(allText);
          const withMaps = injectGoogleMapsLink(tempReply, userLocation, message);
          const withTransport = injectTransportBlock(withMaps, kvTransportData, message);
          // Si se añadió algo, enviar la parte nueva como chunk de texto
          if (withTransport.length > tempReply.length) {
            const injected = withTransport.slice(tempReply.length);
            allText += injected;
            try { await writer.write(encoder.encode(`data: ${JSON.stringify({ t: injected })}\n\n`)); } catch (_) {}
          } else if (withMaps.length > tempReply.length) {
            const injected = withMaps.slice(tempReply.length);
            allText += injected;
            try { await writer.write(encoder.encode(`data: ${JSON.stringify({ t: injected })}\n\n`)); } catch (_) {}
          }
        }

        // ── Procesar respuesta final (ruta, verificación, etc.) ──
        let route = extractRouteFromReply(allText);
        let reply = replyWithoutRouteBlock(allText);
        // Inyectar Google Maps automáticamente si aplica
        reply = injectGoogleMapsLink(reply, userLocation, message);
        // Inyectar bloque de transporte (app + descarga) si aplica
        reply = injectTransportBlock(reply, kvTransportData, message);
        // Post-procesado: dividir respuesta en días con headers **Día N**
        // Siempre intentar — si no hay ordinales ni suficientes párrafos, devuelve texto sin cambios
        const _daysMatch = message.match(/(\d{1,2})\s*d.{0,2}as?/i);
        const _numDays = _daysMatch ? parseInt(_daysMatch[1]) : 0;
        if (_numDays >= 2 && !route) {
          reply = formatDayHeaders(reply, _numDays);
        }

        // ── SALMA_ACTION: extraer acciones del texto, limpiar reply, ejecutar APIs en paralelo ──
        let actionResults = [];
        try {
          const { cleanText: saClean, actions: saActions } = extractSalmaActions(reply);
          if (saActions.length > 0) {
            reply = saClean;
            actionResults = await executeSalmaActionsParallel(saActions, env, userLocation);
          }
        } catch (_) {}

        if (route) {
          // ── PASO 1: Enriquecer paradas con KV (coords + fotos verificadas, instantáneo) ──
          if (env.SALMA_KB) {
            for (const stop of route.stops) {
              const rawName = (stop.name || stop.headline || '').toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              if (!rawName || rawName.length < 3) continue;
              try {
                // Generar variantes de búsqueda
                const full = rawName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 80);
                const parts = rawName.replace(/[,()]/g, '').split(/\s+/).filter(w => w.length > 2);
                const first = parts[0] || '';
                const firstTwo = parts.slice(0, 2).join('-');
                const withoutCity = rawName.replace(/,.*$/, '').trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                // Buscar en orden: nombre completo, sin ciudad, primeras 2 palabras, primera palabra
                let spotJson = await env.SALMA_KB.get('spot:' + full);
                if (!spotJson && withoutCity !== full) spotJson = await env.SALMA_KB.get('spot:' + withoutCity);
                if (!spotJson && firstTwo && firstTwo !== full) spotJson = await env.SALMA_KB.get('spot:' + firstTwo);
                if (!spotJson && first.length > 4 && first !== firstTwo) spotJson = await env.SALMA_KB.get('spot:' + first);

                if (spotJson) {
                  const spot = JSON.parse(spotJson);
                  if (spot.lat && spot.lng) {
                    stop.lat = spot.lat;
                    stop.lng = spot.lng;
                    stop._kvVerified = true;
                  }
                  if (spot.photo_ref && !stop.photo_ref) stop.photo_ref = spot.photo_ref;
                  if (spot.verified_address) stop.verified_address = spot.verified_address;
                }
              } catch (_) {}
            }
          }

          // ── PASO 2: Draft inmediato (coords del KV donde haya, Claude donde no) ──
          try { await writer.write(encoder.encode(`data: ${JSON.stringify({ draft: true, reply, route })}\n\n`)); } catch (_) {}

          // ── PASO 3: Verify con Google Places (fotos + coords reales) ──
          try {
            if (env.GOOGLE_PLACES_KEY) {
              const verified = await verifyAllStops(route, env.GOOGLE_PLACES_KEY);
              if (verified) route = verified;
            }
          } catch (_) {}
        }

        // ── Guardar ruta en KV (nivel 3 — caché automático con múltiples keys) ──
        if (route && route.stops && route.stops.length > 0 && env.SALMA_KB) {
          try {
            const routeJson = JSON.stringify(route);
            const ttl = { expirationTtl: 2592000 }; // 30 días
            const country = (route.country || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
            const region = (route.region || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
            const days = route.duration_days || route.stops.filter((s, i, arr) => i === 0 || s.day !== arr[i-1]?.day).length;
            const cc = await env.SALMA_KB.get('kw:' + country) || country.substring(0, 2);
            if (region) ctx.waitUntil(env.SALMA_KB.put(`route:${cc}:${region}:${days}`, routeJson, ttl));
            if (country && country !== region) ctx.waitUntil(env.SALMA_KB.put(`route:${cc}:${country}:${days}`, routeJson, ttl));
            const simpleKey = region.split(',')[0].split('-')[0].trim();
            if (simpleKey && simpleKey !== country && simpleKey !== region) {
              ctx.waitUntil(env.SALMA_KB.put(`route:${cc}:${simpleKey}:${days}`, routeJson, ttl));
            }
          } catch (_) { /* fallo silencioso */ }
        }

        // ── Enviar DONE con ruta verificada (fotos + coords corregidas) ──
        const doneEvt = { done: true, reply, route: route || null };
        if (actionResults.length > 0) doneEvt.action_results = actionResults;
        if (photoUploadPromise) {
          const photoResult = await photoUploadPromise;
          if (photoResult) { doneEvt.photo_url = photoResult.url; doneEvt.photo_key = photoResult.key; }
        }
        if (photoTag) doneEvt.photo_tag = photoTag;
        // Caption breve para la galería (primera frase de la respuesta de Salma)
        if (imageBase64 && reply) {
          const firstSentence = reply.split(/[.\n]/).filter(s => s.trim().length > 5)[0];
          if (firstSentence) doneEvt.photo_caption = firstSentence.trim().replace(/\*\*/g, '').slice(0, 120);
        }
        // Detectar si se usó generar_video en las iteraciones
        for (const msg of currentMessages) {
          if (Array.isArray(msg.content)) {
            for (const block of msg.content) {
              if (block.type === 'tool_result') {
                try { const p = JSON.parse(block.content); if (p.video_params) doneEvt.video_params = p.video_params; } catch(_) {}
              }
            }
          }
        }
        await writer.write(encoder.encode(`data: ${JSON.stringify(doneEvt)}\n\n`));

        // Log exitoso
        ctx.waitUntil(logToFirestore({
          timestamp: new Date().toISOString(),
          type: isRoute ? 'route' : (isFlightReq ? 'flight_search' : 'conversational'),
          user_message: message.slice(0, 200),
          chars_out: allText.length,
          latency_ms: Date.now() - reqStartTime,
          status: 'ok',
          error_detail: '',
          model: reqModel,
        }));
      } catch (e) {
        try { await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: allText || 'Error de conexión.', route: null })}\n\n`)); } catch (_) {}
        // Log error
        ctx.waitUntil(logToFirestore({
          timestamp: new Date().toISOString(),
          type: isRoute ? 'route' : 'conversational',
          user_message: message.slice(0, 200),
          chars_out: 0,
          latency_ms: Date.now() - reqStartTime,
          status: 'error',
          error_detail: e.message || 'Stream error',
          model: reqModel,
        }));
      } finally {
        await writer.close();
      }
    })());

    return new Response(readable, { headers: sseHeaders });
  },

  // ═══════════════════════════════════════════════════════════════
  // CRON: Lunes = regenerar fichas nivel 1 | Miércoles = generar rutas nivel 3
  // ═══════════════════════════════════════════════════════════════
  async scheduled(event, env, ctx) {
    if (!env.SALMA_KB || !env.OPENAI_API_KEY) return;

    const dayOfWeek = new Date(event.scheduledTime).getUTCDay(); // 0=dom, 1=lun, 3=mié
    if (dayOfWeek === 3) {
      // MIÉRCOLES → Generar rutas nivel 3
      await this._cronNivel3(env);
      return;
    }

    // LUNES → Regenerar fichas nivel 1 caducadas
    const MAX_PER_RUN = 5;
    const MAX_AGE_DAYS = 180;
    const now = Date.now();
    const cutoff = now - (MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

    try {
      // Leer el índice de países del KV
      const indexJson = await env.SALMA_KB.get('_index:countries');
      if (!indexJson) {
        // Primera vez: crear índice desde las fichas existentes
        const list = await env.SALMA_KB.list({ prefix: 'dest:', limit: 1000 });
        const countries = [];
        for (const key of list.keys) {
          if (key.name.endsWith(':base')) {
            const code = key.name.replace('dest:', '').replace(':base', '');
            countries.push({ code, generated_at: now });
          }
        }
        await env.SALMA_KB.put('_index:countries', JSON.stringify(countries));
        console.log(`[KV Cron] Índice creado: ${countries.length} países`);
        return;
      }

      const countries = JSON.parse(indexJson);
      // Ordenar por fecha más antigua primero
      countries.sort((a, b) => (a.generated_at || 0) - (b.generated_at || 0));

      // Filtrar los caducados
      const stale = countries.filter(c => !c.generated_at || c.generated_at < cutoff);
      if (stale.length === 0) {
        console.log('[KV Cron] Todas las fichas están al día');
        return;
      }

      const toRegenerate = stale.slice(0, MAX_PER_RUN);
      console.log(`[KV Cron] Regenerando ${toRegenerate.length} fichas caducadas de ${stale.length}`);

      for (const entry of toRegenerate) {
        try {
          // Leer ficha actual para obtener el nombre del país
          const currentJson = await env.SALMA_KB.get('dest:' + entry.code + ':base');
          const current = currentJson ? JSON.parse(currentJson) : null;
          const countryName = current?.pais || entry.code;

          // Regenerar con Claude (Haiku para ahorrar — datos factuales no necesitan Sonnet)
          const prompt = `Genera una ficha de viaje práctica y actualizada del país "${countryName}" para viajeros independientes. FORMATO: Responde SOLO con JSON válido, sin backticks. Estructura: {"pais":"${countryName}","codigo":"${entry.code}","capital":"","idioma_oficial":"","idioma_viajero":"","moneda":"","cambio_aprox_eur":"","huso_horario":"","prefijo_tel":"","enchufes":"","visado_espanoles":"","visado_eu":"","mejor_epoca":"","evitar_epoca":"","seguridad":"","vacunas":"","agua_potable":"","emergencias":"","coste_diario_mochilero":"","coste_diario_medio":"","propinas":"","curiosidad_viajera":"","keywords":[]}. Datos realistas y actualizados. Precios en EUR. Keywords: ciudades principales y destinos clave.`;

          const result = await callOpenAI(env.OPENAI_API_KEY, {
            model: 'gpt-4o-mini',
            max_tokens: 1500,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
          });

          const text = result.text || '';

          // Parsear JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.log(`[KV Cron] Error parseando ${entry.code}: no JSON`);
            continue;
          }

          const newData = JSON.parse(jsonMatch[0]);

          // Validar campos obligatorios antes de sobrescribir
          const requiredFields = ['pais', 'capital', 'moneda', 'idioma_oficial', 'emergencias'];
          const hasRequiredData = requiredFields.every(f => newData[f] && newData[f].length > 1);
          if (!hasRequiredData) {
            console.log(`[KV Cron] ⚠️ Ficha de ${entry.code} incompleta, no se sobreescribe`);
            continue;
          }

          // Guardar en KV
          await env.SALMA_KB.put('dest:' + entry.code + ':base', JSON.stringify(newData));

          // Actualizar keywords
          if (newData.keywords && Array.isArray(newData.keywords)) {
            for (const kw of newData.keywords) {
              const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              await env.SALMA_KB.put('kw:' + kwNorm, entry.code);
            }
          }

          // Actualizar fecha en el índice
          entry.generated_at = now;
          console.log(`[KV Cron] ✅ ${countryName} (${entry.code}) regenerado`);

          // Pausa entre llamadas (rate limit)
          await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
          console.log(`[KV Cron] ❌ Error regenerando ${entry.code}: ${e.message}`);
        }
      }

      // Guardar índice actualizado
      await env.SALMA_KB.put('_index:countries', JSON.stringify(countries));
      console.log(`[KV Cron] Índice actualizado. Próximas caducadas: ${Math.max(0, stale.length - MAX_PER_RUN)}`);

    } catch (e) {
      console.log(`[KV Cron] Error general: ${e.message}`);
    }
  },

  // ═══ CRON MIÉRCOLES: Generar rutas nivel 3 ═══
  async _cronNivel3(env) {
    const MAX_ROUTES = 3; // máx rutas por ejecución (~$0.18)
    const ROUTE_PROMPT_TEMPLATE = (destName, country, days, region) =>
      `Genera una ruta de viaje de ${days} días por ${destName}, ${country}. Responde SOLO con JSON válido. Estructura: {"title":"${destName} en ${days} días","name":"${destName} en ${days} días","country":"${country}","region":"${region}","duration_days":${days},"summary":"Resumen","stops":[{"name":"Nombre Google Maps","headline":"Nombre","narrative":"1-2 frases","day_title":"Título día","type":"lugar","day":1,"lat":0,"lng":0,"km_from_previous":0,"road_name":"carretera","road_difficulty":"bajo","estimated_hours":0}],"maps_links":[{"day":1,"url":"https://www.google.com/maps/dir/A/B","label":"Día 1"}],"tips":["Consejo"],"tags":["tag"],"budget_level":"bajo","suggestions":["Sugerencia"]}. Reglas: 3-5 paradas/día, nombres exactos Google Maps, km reales, orden geográfico.`;

    try {
      // Leer índice de destinos con rutas generadas
      let routeIndex = {};
      const routeIdxJson = await env.SALMA_KB.get('_index:routes');
      if (routeIdxJson) routeIndex = JSON.parse(routeIdxJson);

      // Buscar destinos sin ruta (listar keys dest:*:destinos)
      const destList = await env.SALMA_KB.list({ prefix: 'dest:', limit: 500 });
      const countriesWithDests = [];
      for (const key of destList.keys) {
        if (key.name.endsWith(':destinos')) {
          const code = key.name.replace('dest:', '').replace(':destinos', '');
          countriesWithDests.push(code);
        }
      }

      // Buscar destinos sin ruta cacheada
      let generated = 0;
      for (const code of countriesWithDests) {
        if (generated >= MAX_ROUTES) break;

        const destJson = await env.SALMA_KB.get('dest:' + code + ':destinos');
        if (!destJson) continue;
        const destinos = JSON.parse(destJson);

        // Ficha del país para el nombre
        const baseJson = await env.SALMA_KB.get('dest:' + code + ':base');
        const countryName = baseJson ? JSON.parse(baseJson).pais : code;

        for (const dest of destinos) {
          if (generated >= MAX_ROUTES) break;
          if (!dest.id || !dest.nombre) continue;

          // ¿Ya tiene ruta?
          const routeKey = 'route:' + code + ':' + dest.id + ':' + (dest.dias_recomendados || 3);
          if (routeIndex[routeKey]) continue;

          // Generar ruta con Sonnet
          console.log(`[KV Cron L3] Generando: ${dest.nombre}, ${countryName} (${dest.dias_recomendados || 3} días)...`);

          try {
            const prompt = ROUTE_PROMPT_TEMPLATE(dest.nombre, countryName, dest.dias_recomendados || 3, dest.region || '');
            const result = await callOpenAI(env.OPENAI_API_KEY, {
              model: 'gpt-4o-mini',
              max_tokens: 6000,
              temperature: 0.7,
              messages: [{ role: 'user', content: prompt }],
            });

            const text = result.text || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON');

            const route = JSON.parse(jsonMatch[0]);
            if (!route.stops || route.stops.length === 0) throw new Error('Sin paradas');

            // Validar calidad de la ruta antes de guardar
            const minStops = (dest.dias_recomendados || 3) * 2;
            const hasValidCoords = route.stops.every(s => s.lat !== 0 && s.lng !== 0);
            const hasValidNames = route.stops.every(s => s.name && s.name.length > 2);
            if (route.stops.length < minStops || !hasValidCoords || !hasValidNames) {
              console.log(`[KV Cron L3] ⚠️ Ruta de ${dest.nombre} no supera validación de calidad, descartada`);
              continue;
            }

            // Guardar en KV
            await env.SALMA_KB.put(routeKey, JSON.stringify(route), { expirationTtl: 2592000 });
            routeIndex[routeKey] = Date.now();
            generated++;
            console.log(`[KV Cron L3] ✅ ${dest.nombre}: ${route.stops.length} paradas`);

            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {
            console.log(`[KV Cron L3] ❌ ${dest.nombre}: ${e.message}`);
          }
        }
      }

      // Guardar índice de rutas
      await env.SALMA_KB.put('_index:routes', JSON.stringify(routeIndex));
      console.log(`[KV Cron L3] Completado: ${generated} rutas generadas`);

    } catch (e) {
      console.log(`[KV Cron L3] Error general: ${e.message}`);
    }
  },
};
