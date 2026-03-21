/**
 * SALMA API — Cloudflare Worker V1
 * Worker completo con prompt V1, preparado para KV.
 * 
 * BINDINGS necesarios en Cloudflare Dashboard:
 *   - Variable de entorno (secret): ANTHROPIC_API_KEY
 *   - KV Namespace (opcional): SALMA_KV (se crea cuando tengas datos)
 * 
 * Si SALMA_KV no está bindeado o no tiene datos, funciona igual — sin contexto de destino.
 */

// ═══════════════════════════════════════════════════════════════
// BLOQUE 1 — Identidad
// ═══════════════════════════════════════════════════════════════
const BLOQUE_IDENTIDAD = `Eres SALMA, asistente de viajes de Borrado del Mapa. Andaluza de trato cercano, sin afectación. Hablas en español con naturalidad, tuteas siempre. Si el usuario te escribe en otro idioma, le contestas en ese idioma pero mantienes tu carácter.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 2 — Personalidad y tono
// ═══════════════════════════════════════════════════════════════
const BLOQUE_PERSONALIDAD = `Tu personalidad no es decoración, es el vehículo para dar información. Cada frase que escribes lleva un dato útil o no se escribe. Eres directa, tienes opinión propia y no te da miedo mojarte. Si un sitio no merece la pena, lo dices. Si una zona es una trampa turística, lo dices. Siempre con datos, nunca con capricho.

Gustos musicales: Extremoduro, Springsteen, Sabina, AC/DC. No te gusta el reguetón y si te preguntan lo dices sin rodeos. Puedes usar el espíritu de las letras como recurso narrativo cuando encaje de forma natural — no como cita textual, no en cada mensaje. Ejemplo: "buscarse la ruina" evoca Extremoduro sin nombrarlos. Úsalo con criterio.

No aceptas machismo, expresiones sexistas ni comentarios despectivos. Si alguien lo intenta, cortas en seco con firmeza pero sin perder la compostura.`;

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
// BLOQUE 5 — Tono según contexto y nivel de usuario
// ═══════════════════════════════════════════════════════════════
const BLOQUE_TONO = `Adapta el tono al tema. Graciosa y cercana para planificar y recomendar. Seria y directa para seguridad, leyes, salud, LGBTQ+, y situaciones de riesgo. La gracia funciona porque sabes cuándo no usarla.

Reacciona a lo que dice el usuario como persona. Si va a hacer algo cuestionable, no te callas pero no juzgas. Si ya te contó sus gustos o presupuesto en mensajes anteriores, úsalos — no le recomiendes hoteles de 100€ si te dijo que va con mochila.

ADAPTA TU NIVEL DE DETALLE AL USUARIO:

Si pregunta cosas básicas ("¿qué necesito para Vietnam?", "¿es seguro?") → es probable que sea novato. Da contexto extra, explica cosas que un viajero experimentado ya sabría, sé más protectora con la info de seguridad y salud.

Si pregunta cosas específicas ("¿algún taller fiable en Dong Van para la XR150?", "¿la frontera de Poipet acepta e-visa?") → es viajero curtido. Ve al grano, no le expliques lo obvio, trata de tú a tú. Es de los tuyos.

Si no tienes claro su nivel, empieza por el medio y ajusta según cómo sigue la conversación.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 6 — Información y datos
// ═══════════════════════════════════════════════════════════════
const BLOQUE_INFORMACION = `Eres experta en viajes con conocimiento profundo de cada destino. Tu información incluye:
- Datos prácticos del país (visados, moneda, seguridad, vacunas, enchufes, coste de vida)
- Destinos concretos con alojamiento real, precios, transporte, comida, actividades
- Historia y cultura del país (resumen práctico para viajero)
- Info legal para viajeros (aduanas, leyes que pillan turistas, conducción, estafas legales, derechos si te detienen, LGBTQ+, nómada digital)
- Siempre con disclaimer en temas legales: "esto es orientativo, consulta tu embajada para tu caso concreto"

Los datos deben ser veraces y contrastables. Nombres reales, precios reales, distancias reales. Si no sabes algo, dilo. NUNCA inventes datos.

Cuando el usuario te diga su nacionalidad, adapta la info de visados a su país. Si no la sabes, pregúntale.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 7 — Formato de respuesta
// ═══════════════════════════════════════════════════════════════
const BLOQUE_FORMATO = `FORMATO SEGÚN TIPO DE RESPUESTA:

Cuando generas ruta: 1-2 frases en el chat sobre el destino (un dato interesante, una opinión, un consejo práctico). NUNCA digas "aquí tienes la ruta", "aquí lo tienes", "la tienes abajo" ni variantes — la ruta aparece sola debajo. Ejemplo: "Sapa en tres días da para el valle de Muong Hoa, los arrozales y algún pueblo hmong sin prisas."

Cuando es conversacional sin ruta (vacunas, visados, cultura, seguridad, recomendación suelta): puedes extenderte lo que la pregunta necesite, pero misma densidad de información. Cada frase lleva dato. Prosa fluida, sin listas, sin bullet points, sin markdown. Cuenta las cosas como en un bar, no como un manual.

NUNCA en ningún caso: listas con bullet points, markdown con ### o ####, coordenadas en el texto del chat, emojis excesivos.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8 — Modos y formato SALMA_ROUTE_JSON
// ═══════════════════════════════════════════════════════════════
const BLOQUE_RUTAS = `Tu objetivo es ayudar al usuario a descubrir lugares interesantes, planificar viajes, crear rutas, encontrar alojamiento y organizar todo en su mapa personal.

MODOS PRINCIPALES
1 Explorador → sugerir experiencias y lugares únicos.
2 Descubridor → recomendar lugares concretos.
3 Ruta → crear itinerarios optimizados.

Si el usuario no tiene claro qué quiere hacer, ofrece estos tres modos.

ZONAS Y PUNTOS VERIFICABLES
En las rutas solo incluye zonas o puntos que sean verificables (existen en Google Maps, Booking u otras fuentes fiables). No inventes nombres de lugares, direcciones ni coordenadas. Si no estás segura de que un lugar exista o esté bien referenciado, no lo incluyas en la ruta. Prefiere lugares conocidos y comprobables para no equivocarte al dar referencias.

NOMBRES PARA ENLACES A GOOGLE MAPS
El sistema construye enlaces de búsqueda con el "nombre" de cada parada + país/región. Usa SIEMPRE el nombre exacto con el que el lugar aparece en Google Maps (ej. "Puente Nuevo", "Alhambra de Granada", "Catedral de Málaga", "Plaza de la Constitución, Ronda"). Evita nombres genéricos o inventados; si pones "Centro histórico" en vez del nombre del monumento, el enlace no llevará al sitio correcto. Para cada parada: name y headline deben ser el nombre oficial o el que la gente busca en Google Maps.

DATOS PARA EL MAPA
Cuando recomiendes lugares u hoteles incluye:
- tipo (lugar, hotel, restaurante, experiencia, mirador, ruta)
- nombre (exacto, como en Google Maps; ver regla anterior)
- zona
- descripcion corta
- coordenadas (lat, lng) — obligatorio para lugares reales; usa tu conocimiento geográfico
- duracion_recomendada (minutos, si aplica)
- url_reserva (si es hotel)

RUTAS POR DÍA
Cuando generes rutas de varios días, organízalas por días. Cada día: nombre o zona principal, lista de paradas en orden lógico, duración aproximada. Cada parada debe llevar un campo day_title con un título breve del día (3-5 palabras), el mismo valor para todas las paradas del mismo día. Ejemplos: "Playas y templos", "De Hanoi a Ha Giang", "Centro histórico y gastronomía".

TEXTO VISIBLE EN EL CHAT (MUY IMPORTANTE)
El mensaje visible en el chat debe ser SIEMPRE breve cuando generas ruta: un resumen corto de una o dos frases y punto. NUNCA pongas en el chat listas de lugares, coordenadas, duraciones, markdown con ### o ####, ni el itinerario detallado. Ese detalle va solo en el bloque SALMA_ROUTE_JSON y se muestra en la ruta de abajo.

FORMATO DE RESPUESTA CON RUTA
Cuando generes una ruta o lista de lugares para el mapa, escribe en el chat SOLO el resumen breve (1-2 frases) y DEBES incluir al final un bloque en dos líneas: primera línea exactamente SALMA_ROUTE_JSON, segunda línea el JSON (sin markdown, sin backticks). Estructura del JSON:

SALMA_ROUTE_JSON
{"title":"Título de la ruta","name":"Mismo título","country":"País","region":"Región o ciudad","duration_days":N,"summary":"Resumen corto","stops":[{"name":"Nombre del lugar","headline":"Nombre","narrative":"1-2 frases: por qué merece la pena y cuánto tiempo calcular","day_title":"Título del día","type":"lugar|hotel|restaurante|experiencia|mirador|ruta","day":1,"lat":36.72,"lng":-4.42}],"tips":["Consejo 1"],"tags":["tag1"],"budget_level":"bajo|medio|alto|sin_definir","suggestions":["Sugerencia 1"]}

FORMATO DE PARADA RÁPIDO (obligatorio):
Cada stop lleva SOLO estos campos: name/headline (nombre EXACTO como aparece en Google Maps — el sistema verificará cada parada después), narrative (1-2 frases de viajero: por qué merece la pena, qué sensación da — NO inventes datos factuales como distancias, horarios o precios), day_title (título breve del día, 3-5 palabras, igual para todas las paradas del mismo día), type, day (entero, NUNCA string), lat y lng (tu mejor estimación — el sistema los corregirá con Google).
NO incluyas estos campos (el sistema los añade automáticamente después): context, food_nearby, local_secret, alternative, practical, links.
Esto te permite generar rutas largas RÁPIDO. IMPORTANTE: usa nombres de lugares reales y verificables. El sistema buscará cada parada en Google Places y descartará las que no existan.
Solo incluye el bloque SALMA_ROUTE_JSON cuando realmente hayas generado una ruta o lista de paradas para mostrar en el mapa. Para respuestas solo conversacionales no incluyas el bloque.

EDICIÓN DE RUTA EN TIEMPO REAL (desde el mapa)
Cuando el contexto del mensaje indique [MODO MAPA] y el usuario quiera añadir, quitar o reordenar paradas de su ruta actual, responde con 1-2 frases y añade al final dos líneas: primera línea exactamente SALMA_ROUTE_UPDATE, segunda línea el JSON con el array stops completo actualizado (misma estructura que los stops de SALMA_ROUTE_JSON). Incluye TODAS las paradas resultantes, no solo las modificadas. Para nuevas paradas que añadas, usa tu mejor estimación de coordenadas lat/lng — el sistema las corregirá. Para eliminar una parada, simplemente no la incluyas en el array. Solo usa SALMA_ROUTE_UPDATE cuando realmente modifiques la lista de paradas; para preguntas sobre la ruta sin cambios, responde conversacionalmente.

NUNCA TE BLOQUEES — REGLA CRÍTICA
Jamás respondas con un mensaje muerto del tipo "no puedo ubicar ese lugar", "no tengo información suficiente" o similar. Eso es un callejón sin salida y no ayuda al usuario.

Cuando el destino es vago o te faltan datos clave para generar una ruta de calidad, haz esto:
1. Demuestra que conoces el sitio con 1-2 datos concretos (distancia, etapas típicas, época ideal, precio medio...). Así el usuario sabe que estás en el ajo.
2. Sugiere valores por defecto razonables para lo que no te han dicho. Ejemplo: "si no me dices otra cosa, tiro con 10 días, ritmo tranquilo y unos 50€/día".
3. Ofrece dos caminos claros: "dame más datos y lo afino" o "le doy caña ya con esto".

Cuando el usuario responde "dale", "sí", "adelante" o cualquier cosa que confirme — genera la ruta inmediatamente con los defaults propuestos. Sin volver a preguntar.

Cuándo preguntar vs cuándo generar directamente:
— Si el usuario da destino + días + tipo de viaje (ej: "Vietnam 15 días mochilero") → genera ya, no preguntes.
— Si el usuario da solo el destino o una idea vaga (ej: "Japón", "Camino de Santiago") → pregunta en UNA sola frase por los datos clave que te falten: días disponibles, presupuesto aproximado por día y tipo de experiencia (playa, cultura, naturaleza, gastronomía, aventura...). Sugiere tus defaults y ofrece generar ya.
— Si el usuario dice "dale" o "lo que tú veas" → genera siempre, sin más preguntas.
— REGLA DE ORO: si tú ya preguntaste y el usuario responde con datos (destino, días, tipo, zona, o cualquier combinación) → GENERA LA RUTA. No hagas más preguntas. Ya tienes lo que necesitas. Si falta algún dato menor, usa defaults razonables. El usuario ya esperó una ronda de preguntas — no le hagas esperar dos.

Cuando generes paradas, usa siempre nombres de lugares concretos y verificables (pueblos, monumentos, parques reales) para que el mapa funcione. Nunca "zona rural" o "pueblo típico" — pon el nombre real.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8B — Mapa, tarjetas, alojamiento y navegación
// ═══════════════════════════════════════════════════════════════
const BLOQUE_MAPA = `MAPA PERSONAL
El usuario tiene un mapa personal donde se guardan: lugares, restaurantes, experiencias, miradores, hoteles y rutas. Cuando recomiendes algo relevante, ofrece añadirlo al mapa.

TARJETAS VISUALES
Los puntos del mapa se muestran como tarjetas. Tarjeta de lugar: nombre, descripción corta, duración recomendada, acciones (ver ruta / guardar). Tarjeta de hotel: nombre, zona, descripción corta, acciones (reservar / guardar).

ALOJAMIENTO
Si el usuario busca hotel, pregunta si es necesario: fechas, presupuesto, zona. Recomienda varias opciones. Los hoteles pueden añadirse al mapa. Si existe enlace afiliado (ej Booking), muestra enlace de reserva como opción útil.

FUNCIONES INTELIGENTES DEL MAPA
Usa el mapa del usuario para: descubrir lugares cercanos a puntos guardados, optimizar rutas entre lugares, sugerir zonas de alojamiento según los lugares guardados, recomendar hoteles cerca del mapa.

SUGERENCIAS AUTOMÁTICAS
Si el usuario tiene lugares guardados, sugiere hasta 3 lugares interesantes cerca de su ruta o zona.

MAPA POR DÍA
Cada día de una ruta se visualiza independiente en el mapa, mostrando solo los puntos de ese día.

EDICIÓN DE RUTA
El usuario puede modificar la ruta desde móvil o web: añadir lugares, quitar lugares, cambiar orden de paradas, guardar cambios.

NAVEGACIÓN EXTERNA
Cada parada puede abrirse en Google Maps o Apple Maps para navegación.`;

// ═══════════════════════════════════════════════════════════════
// ENSAMBLAR SYSTEM PROMPT (fijo — sin contexto dinámico)
// ═══════════════════════════════════════════════════════════════
const SALMA_SYSTEM_BASE = [
  BLOQUE_IDENTIDAD,
  BLOQUE_PERSONALIDAD,
  BLOQUE_MULETILLAS,
  BLOQUE_ANTIPAJA,
  BLOQUE_TONO,
  BLOQUE_INFORMACION,
  BLOQUE_FORMATO,
  BLOQUE_RUTAS,
  BLOQUE_MAPA,
].join('\n\n');

// ═══════════════════════════════════════════════════════════════
// DETECCIÓN DE DESTINO — keywords por país
// ═══════════════════════════════════════════════════════════════
const DESTINOS_KEYWORDS = {
  af: ['afganistan','afghanistan','kabul'],
  al: ['albania','tirana'],
  de: ['alemania','germany','berlin','munich','múnich','hamburgo'],
  ad: ['andorra'],
  ao: ['angola','luanda'],
  ag: ['antigua','barbuda'],
  sa: ['arabia saudita','saudi','riad','riyadh','jeddah'],
  dz: ['argelia','algeria','argel'],
  ar: ['argentina','buenos aires','patagonia','mendoza','bariloche','iguazu'],
  am: ['armenia','erevan','yerevan'],
  au: ['australia','sydney','melbourne','queensland','tasmania'],
  at: ['austria','viena','vienna','salzburgo','innsbruck'],
  az: ['azerbaiyan','azerbaijan','baku','bakú'],
  bs: ['bahamas','nassau'],
  bd: ['bangladesh','banglades','dhaka','dacca'],
  bb: ['barbados','bridgetown'],
  bh: ['barein','bahrain','manama'],
  be: ['belgica','belgium','bruselas','brujas','gante','amberes'],
  bz: ['belice','belize','belmopan'],
  bj: ['benin','cotonou','porto-novo'],
  by: ['bielorrusia','belarus','minsk'],
  mm: ['birmania','myanmar','rangoon','yangon','mandalay','bagan'],
  bo: ['bolivia','la paz','uyuni','sucre','cochabamba'],
  ba: ['bosnia','herzegovina','sarajevo','mostar'],
  bw: ['botsuana','botswana','gaborone'],
  br: ['brasil','brazil','rio de janeiro','sao paulo','salvador','florianopolis'],
  bn: ['brunei','bandar seri begawan'],
  bg: ['bulgaria','sofia','plovdiv'],
  bf: ['burkina faso','uagadugu'],
  bi: ['burundi','bujumbura'],
  bt: ['butan','bhutan','timbu','thimphu'],
  cv: ['cabo verde','cape verde','praia','sal','boa vista'],
  kh: ['camboya','cambodia','phnom penh','siem reap','angkor','sihanoukville'],
  cm: ['camerun','cameroon','yaounde','douala'],
  ca: ['canada','canadá','toronto','vancouver','montreal','quebec','ottawa','banff'],
  qa: ['catar','qatar','doha'],
  td: ['chad','yamena'],
  cl: ['chile','santiago','valparaiso','atacama','torres del paine','isla de pascua'],
  cn: ['china','pekin','beijing','shanghai','hong kong','canton','guangzhou','xian','guilin'],
  cy: ['chipre','cyprus','nicosia','paphos','limassol'],
  co: ['colombia','bogota','bogotá','medellin','medellín','cartagena','cali','santa marta'],
  km: ['comoras','comoros','moroni'],
  cg: ['congo','brazzaville'],
  cd: ['congo rdc','kinshasa'],
  kp: ['corea del norte','north korea','pyongyang'],
  kr: ['corea del sur','south korea','seul','seoul','busan','jeju'],
  ci: ['costa de marfil','ivory coast','abidjan','abiyán'],
  cr: ['costa rica','san jose','san josé','monteverde','arenal','manuel antonio'],
  hr: ['croacia','croatia','zagreb','dubrovnik','split','hvar','plitvice'],
  cu: ['cuba','habana','havana','varadero','trinidad cuba','viñales'],
  dk: ['dinamarca','denmark','copenhague','copenhagen'],
  dj: ['yibuti','djibouti'],
  dm: ['dominica','roseau'],
  ec: ['ecuador','quito','guayaquil','galapagos','galápagos','cuenca','baños'],
  eg: ['egipto','egypt','cairo','el cairo','luxor','asuan','sharm el sheikh','piramides'],
  sv: ['el salvador','san salvador','el tunco'],
  ae: ['emiratos','dubai','dubái','abu dhabi','abu dabi'],
  er: ['eritrea','asmara'],
  sk: ['eslovaquia','slovakia','bratislava'],
  si: ['eslovenia','slovenia','liubliana','ljubljana','bled'],
  es: ['españa','spain','madrid','barcelona','sevilla','granada','valencia','malaga','málaga','bilbao','ibiza','mallorca','tenerife','canarias'],
  us: ['estados unidos','eeuu','usa','nueva york','new york','los angeles','san francisco','miami','chicago','las vegas','hawaii','washington'],
  ee: ['estonia','tallin','tallinn'],
  sz: ['esuatini','eswatini','suazilandia'],
  et: ['etiopia','ethiopia','addis abeba','lalibela'],
  ph: ['filipinas','philippines','manila','palawan','el nido','boracay','cebu','siargao'],
  fi: ['finlandia','finland','helsinki','laponia','rovaniemi'],
  fj: ['fiyi','fiji','suva','nadi'],
  fr: ['francia','france','paris','lyon','marsella','niza','burdeos','estrasburgo'],
  ga: ['gabon','gabón','libreville'],
  gm: ['gambia','banjul'],
  ge: ['georgia pais','tbilisi','tiflis','batumi'],
  gh: ['ghana','accra','kumasi'],
  gd: ['granada caribe','grenada'],
  gr: ['grecia','greece','atenas','athens','santorini','mykonos','creta','rodas'],
  gt: ['guatemala','antigua guatemala','tikal','atitlan','lake atitlan'],
  gn: ['guinea conakry','conakry'],
  gw: ['guinea bisau','guinea-bissau','bisáu'],
  gq: ['guinea ecuatorial','equatorial guinea','malabo'],
  gy: ['guyana','georgetown guyana'],
  ht: ['haiti','haití','puerto principe'],
  hn: ['honduras','tegucigalpa','roatan','roatán','copan'],
  hu: ['hungria','hungary','budapest'],
  in: ['india','delhi','nueva delhi','mumbai','bombay','goa','jaipur','varanasi','kerala','rajasthan','agra','taj mahal'],
  id: ['indonesia','bali','yakarta','jakarta','lombok','komodo','yogyakarta','java','sumatra','flores','ubud'],
  iq: ['irak','iraq','bagdad','erbil'],
  ir: ['iran','irán','teheran','tehran','isfahan','shiraz','persepolis'],
  ie: ['irlanda','ireland','dublin','dublín','galway','cork'],
  is: ['islandia','iceland','reikiavik','reykjavik'],
  il: ['israel','tel aviv','jerusalen','jerusalem','haifa','eilat'],
  it: ['italia','italy','roma','florencia','venecia','milan','napoles','sicilia','cerdeña','cinque terre','amalfi','toscana'],
  jm: ['jamaica','kingston','montego bay'],
  jp: ['japon','japan','tokio','tokyo','kioto','kyoto','osaka','hiroshima','nara','hokkaido','okinawa'],
  jo: ['jordania','jordan','amman','petra','wadi rum','mar muerto','aqaba'],
  kz: ['kazajistan','kazakhstan','astana','almaty'],
  ke: ['kenia','kenya','nairobi','mombasa','masai mara'],
  kg: ['kirguistan','kyrgyzstan','biskek','bishkek'],
  ki: ['kiribati','tarawa'],
  kw: ['kuwait'],
  la: ['laos','vientiane','luang prabang','vang vieng'],
  ls: ['lesoto','lesotho','maseru'],
  lv: ['letonia','latvia','riga'],
  lb: ['libano','lebanon','beirut'],
  lr: ['liberia','monrovia'],
  ly: ['libia','libya','tripoli'],
  li: ['liechtenstein','vaduz'],
  lt: ['lituania','lithuania','vilna','vilnius'],
  lu: ['luxemburgo','luxembourg'],
  mk: ['macedonia','north macedonia','skopje','ohrid'],
  mg: ['madagascar','antananarivo'],
  my: ['malasia','malaysia','kuala lumpur','penang','langkawi','borneo','sabah','sarawak'],
  mw: ['malaui','malawi','lilongwe'],
  mv: ['maldivas','maldives','male'],
  ml: ['mali','malí','bamako','tombuctú','timbuktu'],
  mt: ['malta','la valeta','valletta','gozo'],
  ma: ['marruecos','morocco','marrakech','fez','chefchaouen','merzouga','essaouira','casablanca','tanger'],
  mu: ['mauricio','mauritius','port louis'],
  mr: ['mauritania','nuakchot','nouakchott'],
  mx: ['mexico','méxico','ciudad de mexico','cancun','cancún','playa del carmen','tulum','oaxaca','guadalajara','san cristobal','baja california'],
  fm: ['micronesia'],
  md: ['moldavia','moldova','chisinau'],
  mc: ['monaco','mónaco','montecarlo'],
  mn: ['mongolia','ulan bator','ulaanbaatar','gobi'],
  me: ['montenegro','podgorica','kotor','budva'],
  mz: ['mozambique','maputo'],
  na: ['namibia','windhoek','sossusvlei','etosha','swakopmund'],
  nr: ['nauru'],
  np: ['nepal','katmandu','kathmandu','pokhara','everest','annapurna','chitwan'],
  ni: ['nicaragua','managua','granada nicaragua','leon nicaragua','ometepe','san juan del sur'],
  ne: ['niger','níger','niamey'],
  ng: ['nigeria','lagos','abuja'],
  no: ['noruega','norway','oslo','bergen','tromso','lofoten','fiordos'],
  nz: ['nueva zelanda','new zealand','auckland','queenstown','wellington','milford sound','rotorua'],
  om: ['oman','omán','muscat','mascate'],
  nl: ['paises bajos','holanda','netherlands','amsterdam','rotterdam','la haya'],
  pk: ['pakistan','pakistán','islamabad','lahore','karachi','hunza'],
  pw: ['palaos','palau'],
  ps: ['palestina','palestine','ramala','belen','cisjordania'],
  pa: ['panama','panamá','ciudad de panama','bocas del toro','san blas'],
  pg: ['papua nueva guinea','papua new guinea','port moresby'],
  py: ['paraguay','asuncion','asunción'],
  pe: ['peru','perú','lima','cusco','cuzco','machu picchu','arequipa','iquitos','huacachina'],
  pl: ['polonia','poland','varsovia','cracovia','krakow','gdansk','wroclaw'],
  pt: ['portugal','lisboa','lisbon','oporto','porto','algarve','sintra','madeira','azores'],
  gb: ['reino unido','uk','united kingdom','londres','london','edimburgo','edinburgh','escocia','gales','liverpool','manchester'],
  cf: ['republica centroafricana','bangui'],
  cz: ['republica checa','czech republic','praga','prague','brno','cesky krumlov'],
  do: ['republica dominicana','dominican republic','santo domingo','punta cana'],
  rw: ['ruanda','rwanda','kigali'],
  ro: ['rumania','romania','bucarest','bucharest','brasov','transilvania'],
  ru: ['rusia','russia','moscu','moscow','san petersburgo','saint petersburg'],
  ws: ['samoa','apia'],
  kn: ['san cristobal y nieves','saint kitts'],
  sm: ['san marino'],
  vc: ['san vicente','saint vincent','granadinas'],
  lc: ['santa lucia','saint lucia'],
  st: ['santo tome','sao tome'],
  sn: ['senegal','dakar'],
  rs: ['serbia','belgrado','belgrade','novi sad'],
  sc: ['seychelles'],
  sl: ['sierra leona','sierra leone','freetown'],
  sg: ['singapur','singapore'],
  sy: ['siria','syria','damasco','aleppo'],
  so: ['somalia','mogadiscio','mogadishu'],
  lk: ['sri lanka','colombo','kandy','ella','sigiriya','galle','trincomalee'],
  za: ['sudafrica','south africa','cape town','ciudad del cabo','johannesburgo','kruger'],
  sd: ['sudan','sudán','jartum','khartoum'],
  ss: ['sudan del sur','south sudan','juba'],
  se: ['suecia','sweden','estocolmo','stockholm','gotemburgo','malmo'],
  ch: ['suiza','switzerland','zurich','ginebra','berna','interlaken','zermatt','lucerna'],
  sr: ['surinam','suriname','paramaribo'],
  th: ['tailandia','thailand','bangkok','chiang mai','chiang rai','phuket','krabi','koh samui','koh phangan','koh tao','koh lipe','pai','ayutthaya','sukhothai'],
  tz: ['tanzania','dar es salaam','zanzibar','kilimanjaro','serengeti','ngorongoro'],
  tj: ['tayikistan','tajikistan','dusanbe','dushanbe','pamir'],
  tl: ['timor oriental','east timor','dili'],
  tg: ['togo','lome','lomé'],
  to: ['tonga','nukualofa'],
  tt: ['trinidad y tobago','trinidad','port of spain'],
  tn: ['tunez','tunisia','tunis','cartago','djerba'],
  tm: ['turkmenistan','ashgabat'],
  tr: ['turquia','turkey','türkiye','estambul','istanbul','capadocia','cappadocia','antalya','izmir','pamukkale','efeso'],
  tv: ['tuvalu','funafuti'],
  ua: ['ucrania','ukraine','kiev','kyiv','lviv','odesa'],
  ug: ['uganda','kampala','entebbe'],
  uy: ['uruguay','montevideo','punta del este','colonia del sacramento'],
  uz: ['uzbekistan','uzbekistán','tashkent','samarcanda','samarkand','bukhara','bujara'],
  vu: ['vanuatu','port vila'],
  va: ['vaticano','vatican'],
  ve: ['venezuela','caracas','isla margarita','angel falls','salto angel','los roques'],
  vn: ['vietnam','hanoi','hanói','saigon','saigón','ho chi minh','hoi an','danang','da nang','sapa','ninh binh','halong','ha long','hue','hué','phong nha','dalat','da lat','phu quoc','nha trang','mui ne','mekong'],
  ye: ['yemen','sana','aden'],
  zm: ['zambia','lusaka','victoria falls zambia','livingstone'],
  zw: ['zimbabue','zimbabwe','harare','victoria falls'],
};

// ═══════════════════════════════════════════════════════════════
// DETECCIÓN DE CATEGORÍA TEMÁTICA
// ═══════════════════════════════════════════════════════════════
const CATEGORIAS_KEYWORDS = {
  visados: ['visado','visa','e-visa','evisa','pasaporte','frontera','entrada','permiso entrada','inmigración','inmigracion'],
  salud: ['vacuna','vacunas','hospital','médico','medico','farmacia','enfermedad','malaria','dengue','seguro médico','seguro viaje','salud'],
  transporte: ['vuelo','avion','avión','tren','bus','autobús','autobus','moto','alquiler coche','grab','uber','taxi','ferry','barco','aeropuerto','conducir'],
  alojamiento: ['hotel','hostel','hostal','alojamiento','dormir','booking','airbnb','homestay','resort','bungalow'],
  comida: ['comer','comida','restaurante','plato típico','gastronomía','gastronomia','street food','mercado comida','vegetariano','vegano'],
  seguridad: ['seguro','seguridad','peligro','peligroso','estafa','robo','timo','policía','policia','emergencia'],
  legal: ['ley','legal','ilegal','drogas','multa','carcel','cárcel','detención','detencion','aduana','aduanas','derechos','abogado','lgbtq','lgtb','gay','homosexualidad','drones','vpn','nómada digital','nomada digital','trabajo remoto'],
  cultura: ['cultura','costumbres','tradición','tradicion','religión','religion','templo','mezquita','iglesia','vestimenta','propina','idioma'],
  historia: ['historia','histórico','historico','guerra','independencia','colonización','colonizacion','imperio','dinastía','dinastia'],
  presupuesto: ['precio','coste','costo','presupuesto','barato','caro','cuánto cuesta','cuanto cuesta','dinero','cambio','cajero','atm','moneda','euros','dólares'],
  clima: ['clima','tiempo','lluvia','monzón','monzon','temperatura','calor','frío','mejor época','mejor epoca','cuando ir','cuándo ir'],
};

// ═══════════════════════════════════════════════════════════════
// FUNCIONES DE DETECCIÓN
// ═══════════════════════════════════════════════════════════════

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function detectCountries(message) {
  const normalized = normalize(message);
  const detected = [];
  for (const [code, keywords] of Object.entries(DESTINOS_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(normalize(kw))) {
        if (!detected.includes(code)) detected.push(code);
        break;
      }
    }
  }
  return detected;
}

function detectCategories(message) {
  const normalized = normalize(message);
  const detected = [];
  for (const [cat, keywords] of Object.entries(CATEGORIAS_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(normalize(kw))) {
        if (!detected.includes(cat)) detected.push(cat);
        break;
      }
    }
  }
  return detected;
}

// ═══════════════════════════════════════════════════════════════
// LECTURA DE KV (tolerante a fallos)
// ═══════════════════════════════════════════════════════════════

async function kvGet(env, key) {
  try {
    if (!env.SALMA_KV) return null;
    const value = await env.SALMA_KV.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function getCountryBase(env, countryCode) {
  return kvGet(env, `dest:${countryCode}:base`);
}

async function getCountryDestinations(env, countryCode) {
  return kvGet(env, `dest:${countryCode}:destinos`);
}

async function incrementDemand(env, countryCode) {
  try {
    if (!env.SALMA_KV) return;
    const key = `demand:${countryCode}`;
    const current = parseInt(await env.SALMA_KV.get(key) || '0');
    await env.SALMA_KV.put(key, String(current + 1));
  } catch {
    // No bloquear si falla
  }
}

// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA EN TIEMPO REAL — Google Places
// ═══════════════════════════════════════════════════════════════

function isRouteRequest(message, history) {
  const directMatch = /ruta|itinerario|qué ver|que ver|visitar|días en|dias en|días|dias|fin de semana|semana en|lugares en|qué hacer|que hacer|plan para|viaje a|viaje por|llevo.*días|me quedo|escapada|excursion|excursión/i.test(message);
  if (directMatch) return true;
  // Si el historial contiene una pregunta de Salma y el usuario responde con datos (días, zona...), es probable que sea continuación de petición de ruta
  if (Array.isArray(history) && history.length >= 2) {
    const prevMessages = history.map(h => h.content || '').join(' ');
    const historyHasRouteContext = /ruta|itinerario|días|dias|viaje|visitar|qué ver|que ver|playas|playa/i.test(prevMessages);
    const userGivesData = /\d+\s*d[ií]as?|\d+\s*noches?|zona|calas?|playa|surf|ciudad|pueblo|costa|norte|sur|este|oeste/i.test(message);
    if (historyHasRouteContext && userGivesData) return true;
  }
  return false;
}

// Extrae destino y categorías del mensaje para búsquedas específicas
function extractSearchQueries(message) {
  // Detectar categorías específicas mencionadas por el usuario
  const categoryMap = {
    'iglesia|catedral|ermita|basílica|basilica|capilla|parroquia': 'iglesias',
    'yacimiento|romano|ruina|arqueológic|arqueologic|restos|excavación|excavacion': 'yacimientos arqueológicos',
    'museo': 'museos',
    'playa': 'playas',
    'parque|jardín|jardin|bosque|natural': 'parques y naturaleza',
    'castillo|fortaleza|torre|muralla|alcazaba|alcázar|alcazar': 'castillos y monumentos',
    'mirador|vista|panorámic|panoramic': 'miradores',
    'mercado|tienda|compras': 'mercados y tiendas',
    'restaurante|comer|cenar|gastronomía|gastronomia|comida|tapas|bar': 'restaurantes',
    'hotel|alojamiento|dormir|hostal|hospedaje': 'hoteles',
    'senderismo|ruta a pie|camino|trekking|hiking': 'rutas de senderismo',
    'moto|bici|alquiler': 'alquiler de vehículos',
  };
  // Extraer destino: quitar palabras de ruta/viaje para quedarnos con el lugar
  const destino = message
    .replace(/ruta|itinerario|qué ver|que ver|visitar|días? en|dias? en|fin de semana|semana en|lugares en|qué hacer|que hacer|plan para|viaje a|viaje por|llevo.*días|me quedo|escapada|excursion|excursión|por favor|dame|hazme|genera|crea/gi, '')
    .replace(/\d+\s*(días|dias)/gi, '')
    .trim();

  const queries = [];
  let hasSpecificCategory = false;
  for (const [pattern, label] of Object.entries(categoryMap)) {
    if (new RegExp(pattern, 'i').test(message)) {
      hasSpecificCategory = true;
      queries.push(`${label} ${destino}`);
    }
  }
  // Si no hay categoría específica, buscar genéricamente
  if (!hasSpecificCategory) {
    queries.push(`qué ver en ${destino}`);
    queries.push(`lugares turísticos ${destino}`);
  }
  return queries;
}

// Devuelve { contextText, placesData } — contextText para Claude, placesData para match posterior
async function fetchPlacesContext(message, placesKey) {
  if (!placesKey || !isRouteRequest(message)) return { contextText: '', placesData: [] };
  try {
    // 1. Text Search — búsquedas específicas según lo que pide el usuario
    const queries = extractSearchQueries(message);
    const seen = new Set();
    const candidates = [];
    const searchPromises = queries.map(q =>
      fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&language=es&key=${placesKey}`)
        .then(r => r.json()).catch(() => null)
    );
    const searchResults = await Promise.all(searchPromises);
    for (const data of searchResults) {
      if (!data?.results) continue;
      for (const p of data.results.slice(0, 10)) {
        if (seen.has(p.place_id)) continue;
        seen.add(p.place_id);
        candidates.push({
          place_id: p.place_id,
          nombre: p.name,
          direccion: p.formatted_address,
          lat: p.geometry?.location?.lat,
          lng: p.geometry?.location?.lng,
          valoracion: p.rating || null,
          tipos: (p.types || []).slice(0, 3),
          photo_ref: p.photos?.[0]?.photo_reference || '',
        });
      }
    }
    if (candidates.length === 0) return { contextText: '', placesData: [] };

    // 2. Place Details — reseñas, descripción, horarios (máx 8 en paralelo)
    const detailFields = 'name,editorial_summary,reviews,opening_hours,website,photos';
    const detailPromises = candidates.slice(0, 10).map(c =>
      fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${c.place_id}&fields=${detailFields}&language=es&key=${placesKey}`)
        .then(r => r.json()).catch(() => null)
    );
    const details = await Promise.all(detailPromises);

    // 3. Enriquecer candidatos con datos reales
    const placesData = candidates.slice(0, 10).map((c, i) => {
      const d = details[i]?.result;
      const reviews = (d?.reviews || []).slice(0, 2).map(r => r.text?.slice(0, 120) || '');
      return {
        nombre: c.nombre,
        direccion: c.direccion,
        lat: c.lat,
        lng: c.lng,
        valoracion: c.valoracion,
        tipos: c.tipos,
        photo_ref: d?.photos?.[0]?.photo_reference || c.photo_ref,
        descripcion_google: d?.editorial_summary?.overview || '',
        resenas: reviews.length > 0 ? reviews : [],
        horario: d?.opening_hours?.weekday_text?.slice(0, 3) || [],
        web: d?.website || '',
      };
    });

    // Contexto para Claude — sin photo_ref (Claude no necesita tocarlo)
    const contextForClaude = placesData.map(p => ({
      nombre: p.nombre,
      direccion: p.direccion,
      lat: p.lat,
      lng: p.lng,
      valoracion: p.valoracion,
      tipos: p.tipos,
      descripcion_google: p.descripcion_google,
      resenas: p.resenas,
      horario: p.horario,
      web: p.web,
    }));

    const contextText = `\n\n[BÚSQUEDA EN TIEMPO REAL — datos de Google Places]
REGLAS:
1. Incluye SOLO paradas de la categoría que el usuario ha pedido. Si pide iglesias, solo iglesias. Si pide yacimientos, solo yacimientos. NO añadas categorías que el usuario no ha mencionado.
2. Fíjate en la DIRECCIÓN de cada resultado. Si el usuario pide lugares EN una ciudad concreta, incluye solo los que estén en esa zona. Si incluyes alguno de otro municipio cercano, DILO EXPLÍCITAMENTE en la narrative.
3. Usa estos resultados como base, PERO si conoces con certeza otros lugares de la misma categoría en esa zona que no aparecen aquí, INCLÚYELOS. El sistema verificará cada parada en Google Places y descartará las que no existan — así que no te cortes en añadir lugares reales que conozcas.
4. Intenta ser COMPLETA: si el usuario pide yacimientos de una zona y conoces 5, pon los 5, no te quedes en 2. El usuario quiere una lista lo más exhaustiva posible.
5. NO inventes datos factuales (horarios, precios, distancias) — el sistema los añade desde Google.
6. NO incluyas links a Google Maps en el campo "links" — el sistema los genera automáticamente.
7. Tu trabajo: recopilar TODOS los lugares relevantes de la zona pedida, ordenarlos, y añadir tu perspectiva de viajera.
${JSON.stringify(contextForClaude)}`;

    return { contextText, placesData };
  } catch (e) {
    return { contextText: '', placesData: [] };
  }
}

// ═══════════════════════════════════════════════════════════════
// MAPEO PAÍS → CÓDIGO ISO (para filtrar Google Places por país)
// ═══════════════════════════════════════════════════════════════
function getCountryCode(countryName) {
  if (!countryName) return '';
  const norm = countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const map = {
    'afganistan': 'AF', 'albania': 'AL', 'alemania': 'DE', 'germany': 'DE', 'andorra': 'AD',
    'angola': 'AO', 'argentina': 'AR', 'armenia': 'AM', 'australia': 'AU', 'austria': 'AT',
    'azerbaiyan': 'AZ', 'bahamas': 'BS', 'bangladesh': 'BD', 'barbados': 'BB', 'barein': 'BH', 'bahrain': 'BH',
    'belgica': 'BE', 'belgium': 'BE', 'belice': 'BZ', 'benin': 'BJ', 'bielorrusia': 'BY', 'belarus': 'BY',
    'birmania': 'MM', 'myanmar': 'MM', 'bolivia': 'BO', 'bosnia': 'BA', 'botsuana': 'BW', 'botswana': 'BW',
    'brasil': 'BR', 'brazil': 'BR', 'brunei': 'BN', 'bulgaria': 'BG', 'burkina faso': 'BF', 'burundi': 'BI',
    'butan': 'BT', 'bhutan': 'BT', 'cabo verde': 'CV', 'camboya': 'KH', 'cambodia': 'KH',
    'camerun': 'CM', 'cameroon': 'CM', 'canada': 'CA', 'catar': 'QA', 'qatar': 'QA', 'chad': 'TD',
    'chile': 'CL', 'china': 'CN', 'chipre': 'CY', 'cyprus': 'CY', 'colombia': 'CO',
    'corea del norte': 'KP', 'corea del sur': 'KR', 'south korea': 'KR',
    'costa de marfil': 'CI', 'costa rica': 'CR', 'croacia': 'HR', 'croatia': 'HR',
    'cuba': 'CU', 'dinamarca': 'DK', 'denmark': 'DK', 'ecuador': 'EC', 'egipto': 'EG', 'egypt': 'EG',
    'el salvador': 'SV', 'emiratos': 'AE', 'eritrea': 'ER', 'eslovaquia': 'SK', 'slovakia': 'SK',
    'eslovenia': 'SI', 'slovenia': 'SI', 'espana': 'ES', 'spain': 'ES',
    'estados unidos': 'US', 'eeuu': 'US', 'usa': 'US', 'united states': 'US',
    'estonia': 'EE', 'etiopia': 'ET', 'ethiopia': 'ET', 'filipinas': 'PH', 'philippines': 'PH',
    'finlandia': 'FI', 'finland': 'FI', 'fiyi': 'FJ', 'fiji': 'FJ',
    'francia': 'FR', 'france': 'FR', 'gabon': 'GA', 'gambia': 'GM', 'georgia': 'GE',
    'ghana': 'GH', 'grecia': 'GR', 'greece': 'GR', 'guatemala': 'GT', 'guinea': 'GN',
    'guinea ecuatorial': 'GQ', 'guyana': 'GY', 'haiti': 'HT', 'honduras': 'HN',
    'hungria': 'HU', 'hungary': 'HU', 'india': 'IN', 'indonesia': 'ID',
    'irak': 'IQ', 'iraq': 'IQ', 'iran': 'IR', 'irlanda': 'IE', 'ireland': 'IE',
    'islandia': 'IS', 'iceland': 'IS', 'israel': 'IL', 'italia': 'IT', 'italy': 'IT',
    'jamaica': 'JM', 'japon': 'JP', 'japan': 'JP', 'jordania': 'JO', 'jordan': 'JO',
    'kazajistan': 'KZ', 'kazakhstan': 'KZ', 'kenia': 'KE', 'kenya': 'KE',
    'kirguistan': 'KG', 'kyrgyzstan': 'KG', 'kuwait': 'KW', 'laos': 'LA',
    'letonia': 'LV', 'latvia': 'LV', 'libano': 'LB', 'lebanon': 'LB',
    'liberia': 'LR', 'libia': 'LY', 'libya': 'LY', 'liechtenstein': 'LI',
    'lituania': 'LT', 'lithuania': 'LT', 'luxemburgo': 'LU', 'luxembourg': 'LU',
    'macedonia': 'MK', 'madagascar': 'MG', 'malasia': 'MY', 'malaysia': 'MY',
    'maldivas': 'MV', 'maldives': 'MV', 'mali': 'ML', 'malta': 'MT',
    'marruecos': 'MA', 'morocco': 'MA', 'mauricio': 'MU', 'mauritius': 'MU',
    'mauritania': 'MR', 'mexico': 'MX', 'moldavia': 'MD', 'moldova': 'MD',
    'monaco': 'MC', 'mongolia': 'MN', 'montenegro': 'ME', 'mozambique': 'MZ',
    'namibia': 'NA', 'nepal': 'NP', 'nicaragua': 'NI', 'niger': 'NE', 'nigeria': 'NG',
    'noruega': 'NO', 'norway': 'NO', 'nueva zelanda': 'NZ', 'new zealand': 'NZ',
    'oman': 'OM', 'paises bajos': 'NL', 'holanda': 'NL', 'netherlands': 'NL',
    'pakistan': 'PK', 'palestina': 'PS', 'panama': 'PA', 'papua nueva guinea': 'PG',
    'paraguay': 'PY', 'peru': 'PE', 'polonia': 'PL', 'poland': 'PL',
    'portugal': 'PT', 'reino unido': 'GB', 'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB',
    'republica checa': 'CZ', 'czech republic': 'CZ', 'chequia': 'CZ',
    'republica dominicana': 'DO', 'dominican republic': 'DO',
    'rumania': 'RO', 'romania': 'RO', 'rusia': 'RU', 'russia': 'RU',
    'ruanda': 'RW', 'rwanda': 'RW', 'senegal': 'SN', 'serbia': 'RS',
    'singapur': 'SG', 'singapore': 'SG', 'siria': 'SY', 'syria': 'SY',
    'somalia': 'SO', 'sri lanka': 'LK', 'sudafrica': 'ZA', 'south africa': 'ZA',
    'sudan': 'SD', 'suecia': 'SE', 'sweden': 'SE', 'suiza': 'CH', 'switzerland': 'CH',
    'tailandia': 'TH', 'thailand': 'TH', 'taiwan': 'TW', 'tanzania': 'TZ',
    'tunez': 'TN', 'tunisia': 'TN', 'turquia': 'TR', 'turkey': 'TR', 'turkiye': 'TR',
    'ucrania': 'UA', 'ukraine': 'UA', 'uganda': 'UG', 'uruguay': 'UY',
    'uzbekistan': 'UZ', 'venezuela': 'VE', 'vietnam': 'VN', 'yemen': 'YE',
    'zambia': 'ZM', 'zimbabue': 'ZW', 'zimbabwe': 'ZW'
  };
  // Buscar coincidencia exacta primero, luego parcial
  if (map[norm]) return map[norm];
  for (const [key, code] of Object.entries(map)) {
    if (norm.includes(key) || key.includes(norm)) return code;
  }
  return '';
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN DE TODAS LAS PARADAS — Google Places (pasada 2)
// Busca CADA parada en Google Places, reemplaza coords/foto/descripción
// con datos reales. Si no encuentra una parada cerca, la elimina.
// ═══════════════════════════════════════════════════════════════
async function verifyAllStops(route, placesKey) {
  if (!route?.stops || !placesKey) return route;

  const region = route.region || route.country || '';
  // Código ISO del país para restringir búsqueda en Google Places
  const countryCode = route.country ? getCountryCode(route.country) : '';

  // 1. Buscar CADA parada en Google Places (Find Place + Place Details)
  const findPromises = route.stops.map(stop => {
    const name = stop.name || stop.headline || '';
    if (!name || name.length < 3) return Promise.resolve(null);
    const searchQuery = region ? `${name} ${region}` : name;
    // locationbias con coords de Claude como pista (si las tiene)
    const bias = (stop.lat && stop.lng && Math.abs(stop.lat) > 0.01)
      ? `&locationbias=circle:50000@${stop.lat},${stop.lng}`
      : '';
    // Filtro por país — evita resultados de otros continentes
    const countryFilter = countryCode ? `&components=country:${countryCode}` : '';
    return fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery${bias}${countryFilter}&fields=place_id,photos,geometry,name,formatted_address&language=es&key=${placesKey}`)
      .then(r => r.json()).catch(() => null);
  });
  const findResults = await Promise.all(findPromises);

  // 2. Calcular centro y radio de la ruta a partir de resultados verificados
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
    // Radio = distancia máxima de cualquier parada al centro
    const maxDist = verifiedCoords.reduce((max, p) => {
      const dLat = Math.abs(p.lat - centerLat);
      const dLng = Math.abs(p.lng - centerLng);
      const d = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      return d > max ? d : max;
    }, 0);
    // Umbral dinámico: radio de ruta × 1.5, mínimo 50km
    routeRadiusKm = Math.max(50, maxDist * 1.5);
  }

  // 3. Place Details para cada resultado válido (reseñas, descripción, horarios)
  const detailFields = 'name,editorial_summary,reviews,opening_hours,website,photos,geometry';
  const detailPromises = findResults.map(data => {
    const c = data?.candidates?.[0];
    if (!c?.place_id) return Promise.resolve(null);
    // Validar distancia con umbral dinámico
    if (centerLat && centerLng && c.geometry?.location) {
      const dLat = Math.abs(c.geometry.location.lat - centerLat);
      const dLng = Math.abs(c.geometry.location.lng - centerLng);
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      if (distKm > routeRadiusKm) return Promise.resolve(null); // Fuera del radio de la ruta
    }
    return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${c.place_id}&fields=${detailFields}&language=es&key=${placesKey}`)
      .then(r => r.json()).catch(() => null);
  });
  const detailResults = await Promise.all(detailPromises);

  // 4. Enriquecer cada parada con datos reales de Google
  const verifiedStops = [];
  route.stops.forEach((stop, i) => {
    const findData = findResults[i];
    const candidate = findData?.candidates?.[0];
    const detail = detailResults[i]?.result;

    if (!candidate?.geometry?.location) {
      // Google no encontró esta parada — la descartamos
      return;
    }

    const pLat = candidate.geometry.location.lat;
    const pLng = candidate.geometry.location.lng;

    // Validar distancia al centro con umbral dinámico
    if (centerLat && centerLng) {
      const dLat = Math.abs(pLat - centerLat);
      const dLng = Math.abs(pLng - centerLng);
      const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
      if (distKm > routeRadiusKm) return; // Fuera del radio de la ruta — descartar
    }

    // Coords verificadas de Google (sustituyen las de Claude)
    stop.lat = pLat;
    stop.lng = pLng;

    // Foto verificada de Google
    const photoRef = detail?.photos?.[0]?.photo_reference || candidate.photos?.[0]?.photo_reference || '';
    if (photoRef) stop.photo_ref = photoRef;

    // Descripción de Google (editorial_summary) — solo para el campo description (datos)
    // La narrative de Claude se mantiene (está en español y con personalidad de Salma)
    const googleDesc = detail?.editorial_summary?.overview || '';
    if (googleDesc) {
      stop.description = googleDesc;
    }

    // Nombre verificado de Google — preferir Place Details (tiene language=es)
    const verifiedName = detail?.name || candidate.name || '';
    if (verifiedName) {
      stop.name = verifiedName;
      stop.headline = verifiedName;
    }

    // Dirección verificada de Google — para que el frontend pueda avisar si está fuera de la zona pedida
    const verifiedAddress = candidate.formatted_address || '';
    if (verifiedAddress) {
      stop.verified_address = verifiedAddress;
    }

    // Horarios reales de Google (sustituyen lo que Claude inventó)
    if (detail?.opening_hours?.weekday_text) {
      stop.practical = detail.opening_hours.weekday_text.join(' · ');
    }

    // Reseñas reales — añadir al contexto si no hay
    const reviews = (detail?.reviews || []).slice(0, 2).map(r => r.text?.slice(0, 150) || '').filter(Boolean);
    if (reviews.length > 0 && !stop.context) {
      stop.context = 'Según visitantes: ' + reviews.join(' | ');
    }

    verifiedStops.push(stop);
  });

  route.stops = verifiedStops;
  return route;
}

// ═══════════════════════════════════════════════════════════════
// ENSAMBLAJE DEL CONTEXTO DINÁMICO (BLOQUE 9)
// ═══════════════════════════════════════════════════════════════

async function buildDynamicContext(env, message, userNationality, userName) {
  const parts = [];
  const countries = detectCountries(message);
  const categories = detectCategories(message);

  for (const code of countries.slice(0, 2)) {
    // Registrar demanda (no bloquear)
    incrementDemand(env, code);

    // Nivel 1 — Ficha base
    const base = await getCountryBase(env, code);
    if (base) {
      parts.push(`[FICHA PAÍS: ${base.pais}]\n${JSON.stringify(base)}`);
    }

    // Nivel 2 — Destinos (si la pregunta tiene chicha)
    if (categories.length > 0 || message.length > 30) {
      const destinations = await getCountryDestinations(env, code);
      if (destinations && destinations.destinos) {
        // Enviar resumen para no saturar el contexto
        const resumen = destinations.destinos.map(d => ({
          id: d.id, nombre: d.nombre, tipo: d.tipo, region: d.region
        }));
        parts.push(`[DESTINOS ${destinations.pais}: ${destinations.destinos.length} disponibles]\n${JSON.stringify(resumen)}`);
      }
    }
  }

  if (userName) {
    parts.push(`[USUARIO: ${userName}]`);
  }
  if (userNationality) {
    parts.push(`[NACIONALIDAD DEL USUARIO: ${userNationality} — adapta info de visados]`);
  }

  if (categories.length > 0) {
    parts.push(`[TEMAS DETECTADOS: ${categories.join(', ')} — prioriza estos aspectos en tu respuesta]`);
  }

  // Búsqueda en tiempo real — Places API
  const { contextText: placesContextText, placesData } = await fetchPlacesContext(message, env.GOOGLE_PLACES_KEY);
  if (placesContextText) parts.push(placesContextText);

  const dynamicText = parts.length > 0 ? '\n\n--- CONTEXTO DE DESTINO ---\n' + parts.join('\n\n') : '';
  return { dynamicText, placesData: placesData || [] };
}

// ═══════════════════════════════════════════════════════════════
// CONSTRUCCIÓN DE MENSAJES
// ═══════════════════════════════════════════════════════════════

function buildMessages(history, message, currentRoute, dynamicContext) {
  const systemPrompt = SALMA_SYSTEM_BASE + dynamicContext;
  const messages = [];

  if (Array.isArray(history) && history.length > 0) {
    history.slice(-12).forEach((h) => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }

  let userContent = message || '';
  if (currentRoute && currentRoute.stops && currentRoute.stops.length > 0) {
    userContent += '\n\n[Contexto: el usuario tiene una ruta actual en el mapa con ' + currentRoute.stops.length + ' paradas. Si pide cambios (añadir, quitar, modificar), devuelve la ruta completa actualizada en SALMA_ROUTE_JSON.]';
  }
  // Si es petición de ruta, forzar generación inmediata
  if (isRouteRequest(message, history)) {
    userContent += '\n\n[OBLIGATORIO — GENERA RUTA AHORA: El usuario pide una ruta. Tu respuesta DEBE contener el bloque SALMA_ROUTE_JSON. Formato: 1 frase sobre el destino (dato, opinión o consejo — NUNCA "aquí tienes la ruta" ni variantes) + salto de línea + SALMA_ROUTE_JSON + salto de línea + JSON completo. NO respondas solo con texto. NO hagas preguntas. Usa defaults razonables para lo que falte (presupuesto medio, mix cultural). Si no generas SALMA_ROUTE_JSON la ruta no se mostrará y el usuario verá una pantalla vacía.]';
  } else {
    userContent += '\n\n[Recuerda: si generas ruta, responde en el chat con 1-2 frases solo. Sin listas ni detalles en el texto; el detalle va en SALMA_ROUTE_JSON. Si es conversacional, extiéndete lo necesario pero con densidad de datos.]';
  }

  // Si hay historial y el último mensaje fue de Salma preguntando, reforzar que GENERE
  if (Array.isArray(history) && history.length >= 2) {
    const lastAssistant = history.filter(h => h.role === 'assistant').pop();
    if (lastAssistant && lastAssistant.content && /\?/.test(lastAssistant.content)) {
      userContent += '\n\n[IMPORTANTE: Ya le hiciste una pregunta al usuario y ahora está respondiendo. Si su respuesta incluye destino, zona, días o tipo de viaje, GENERA LA RUTA YA con SALMA_ROUTE_JSON. No hagas más preguntas. Usa defaults razonables para lo que falte.]';
    }
  }
  messages.push({ role: 'user', content: userContent });

  return { systemPrompt, messages };
}

// ═══════════════════════════════════════════════════════════════
// EXTRACCIÓN DE RUTA DEL REPLY
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
      route.stops = route.stops.map((s) => ({
        name: s.name || s.headline || s.nombre || '',
        headline: s.headline || s.name || s.nombre || '',
        description: s.description || s.descripcion || s.narrative || '',
        narrative: s.narrative || s.description || s.descripcion || '',
        context: s.context || '',
        food_nearby: s.food_nearby || '',
        local_secret: s.local_secret || '',
        alternative: s.alternative || '',
        practical: s.practical || '',
        day_title: s.day_title || '',
        links: Array.isArray(s.links) ? s.links : [],
        type: s.type || 'lugar',
        day: typeof s.day === 'number' ? s.day : (s.day != null ? (parseInt(s.day) || 1) : 1),
        lat: typeof s.lat === 'number' ? s.lat : (s.lat != null ? parseFloat(s.lat) : 0),
        lng: typeof s.lng === 'number' ? s.lng : (s.lng != null ? parseFloat(s.lng) : 0),
        photo_ref: s.photo_ref || '',
        verified_address: s.verified_address || '',
      }));
      return route;
    }
  } catch (e) {}
  return null;
}

function replyWithoutRouteBlock(text) {
  if (!text || typeof text !== 'string') return text;
  const marker = 'SALMA_ROUTE_JSON';
  const idx = text.indexOf(marker);
  if (idx === -1) return text.trim();
  return text.slice(0, idx).trim();
}

// ═══════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // ENDPOINT DE FOTOS — Google Places Photos proxy
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/photo') {
      const name = url.searchParams.get('name') || '';
      const ref  = url.searchParams.get('ref')  || '';
      const lat  = url.searchParams.get('lat')  || '';
      const lng  = url.searchParams.get('lng')  || '';
      const placesKey = env.GOOGLE_PLACES_KEY;
      const corsH = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

      // Acceso directo por photo_reference — sin búsqueda, foto exacta garantizada
      if (ref && placesKey) {
        try {
          const imgRes = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${ref}&key=${placesKey}`);
          if (!imgRes.ok) return new Response(JSON.stringify({ error: 'photo error' }), { status: 404, headers: corsH });
          if (url.searchParams.get('json') === '1') {
            return new Response(JSON.stringify({ url: imgRes.url }), {
              headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' }
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
        // Pedir geometry además de photos para verificar distancia al resultado
        const bias = (lat && lng) ? `&locationbias=circle:10000@${lat},${lng}` : '';
        const findRes = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name)}&inputtype=textquery${bias}&fields=photos,geometry&key=${placesKey}`);
        const findData = await findRes.json();
        const candidate = findData.candidates?.[0];
        const ref = candidate?.photos?.[0]?.photo_reference;
        if (!ref) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsH });

        // Verificar que el resultado esté dentro de 10km de las coords del stop
        // findplacefromtext ignora locationrestrict — hay que validar manualmente
        if (lat && lng) {
          const pLat = candidate?.geometry?.location?.lat;
          const pLng = candidate?.geometry?.location?.lng;
          if (pLat && pLng) {
            const dLat = Math.abs(pLat - parseFloat(lat));
            const dLng = Math.abs(pLng - parseFloat(lng));
            const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
            if (distKm > 10) {
              return new Response(JSON.stringify({ error: 'result too far: ' + Math.round(distKm) + 'km' }), { status: 404, headers: corsH });
            }
          }
        }
        const imgRes = await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${ref}&key=${placesKey}`);
        if (!imgRes.ok) return new Response(JSON.stringify({ error: 'photo error' }), { status: 404, headers: corsH });
        // Si se pide solo la URL (para guardar en Firestore), devolver JSON con la URL final del CDN
        if (url.searchParams.get('json') === '1') {
          return new Response(JSON.stringify({ url: imgRes.url }), {
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' }
          });
        }
        return new Response(imgRes.body, {
          headers: {
            'Content-Type': imgRes.headers.get('Content-Type') || 'image/jpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const message = body.message || body.msg || '';
    const history = body.history || [];
    const currentRoute = body.current_route || null;
    const userNationality = body.nationality || null;
    const userName = body.user_name || null;

    if (!message.trim()) {
      return new Response(
        JSON.stringify({ reply: 'Dime a dónde quieres ir o qué te apetece hacer y te ayudo.', route: null }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: 'Salma no está configurada (falta ANTHROPIC_API_KEY en Cloudflare secrets).', route: null }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Contexto dinámico desde KV + Places (no rompe si KV no existe)
    const { dynamicText, placesData } = await buildDynamicContext(env, message, userNationality, userName);

    // Construir mensajes
    const { systemPrompt, messages } = buildMessages(history, message, currentRoute, dynamicText);

    const wantStream = body.stream === true;

    // ─── STREAMING MODE ───
    if (wantStream) {
      const sseHeaders = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      };

      let anthropicRes;
      try {
        anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: isRouteRequest(message, history) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
            max_tokens: isRouteRequest(message, history) ? 4000 : 1500,
            system: systemPrompt,
            messages: messages,
            stream: true,
          }),
        });
      } catch (e) {
        return new Response(
          JSON.stringify({ reply: 'No puedo conectar ahora mismo. ¿Puedes intentarlo en un momento?', route: null }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      if (!anthropicRes.ok) {
        const errBody = await anthropicRes.text();
        return new Response(
          JSON.stringify({
            reply: 'Uy, no he podido conectar con el asistente. Inténtalo en un momento.',
            route: null,
            _error: anthropicRes.status + ' ' + errBody.slice(0, 200),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // Leer el stream de Anthropic y reenviarlo simplificado al cliente
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let fullText = '';
      let routeSignalSent = false;

      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Procesar en background para no bloquear la respuesta
      ctx.waitUntil((async () => {
        try {
          const reader = anthropicRes.body.getReader();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // Parsear líneas SSE de Anthropic
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;

              try {
                const evt = JSON.parse(jsonStr);
                if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
                  const chunk = evt.delta.text;
                  fullText += chunk;
                  // Cortar envío al cliente en cuanto aparezca el marcador de ruta
                  if (!fullText.includes('SALMA_ROUTE')) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ t: chunk })}\n\n`));
                  } else if (!routeSignalSent) {
                    // Avisar al frontend de que se está generando la ruta JSON
                    routeSignalSent = true;
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ generating: true })}\n\n`));
                  }
                }
              } catch (e) { /* ignorar líneas mal formadas */ }
            }
          }

          // Stream terminado — procesar ruta y enviar evento final
          let route = extractRouteFromReply(fullText);
          const reply = replyWithoutRouteBlock(fullText);

          if (route) {
            // Enviar ruta borrador ANTES de verificar — el frontend la muestra inmediatamente
            try { await writer.write(encoder.encode(`data: ${JSON.stringify({ draft: true, reply, route })}\n\n`)); } catch (_) {}
            // Keepalive cada 3s mientras se verifican las paradas
            const keepalive = setInterval(async () => {
              try { await writer.write(encoder.encode(`data: ${JSON.stringify({ k: 1 })}\n\n`)); } catch (_) {}
            }, 3000);
            try {
              route = await verifyAllStops(route, env.GOOGLE_PLACES_KEY);
            } finally {
              clearInterval(keepalive);
            }
          }

          await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply, route: route || null })}\n\n`));
        } catch (e) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: fullText || 'Error de conexión.', route: null })}\n\n`));
        } finally {
          await writer.close();
        }
      })());

      return new Response(readable, { headers: sseHeaders });
    }

    // ─── MODO CLÁSICO (sin stream) ───
    let replyText = '';
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: isRouteRequest(message, history) ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
          max_tokens: isRouteRequest(message, history) ? 4000 : 1500,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        return new Response(
          JSON.stringify({
            reply: 'Uy, no he podido conectar con el asistente. Inténtalo en un momento.',
            route: null,
            _error: res.status + ' ' + errBody.slice(0, 200),
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const data = await res.json();
      replyText = (data.content && data.content[0] && data.content[0].text) || '';
    } catch (e) {
      return new Response(
        JSON.stringify({
          reply: 'No puedo conectar ahora mismo. ¿Puedes intentarlo en un momento?',
          route: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    let route = extractRouteFromReply(replyText);
    const reply = replyWithoutRouteBlock(replyText);

    // Verificar TODAS las paradas con Google Places — coords, fotos, descripciones reales
    if (route) {
      route = await verifyAllStops(route, env.GOOGLE_PLACES_KEY);
    }

    return new Response(
      JSON.stringify({ reply, route }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  },
};
