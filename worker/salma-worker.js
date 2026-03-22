/**
 * SALMA API — Cloudflare Worker V2 (limpio)
 *
 * BINDINGS en Cloudflare Dashboard:
 *   - Secret: ANTHROPIC_API_KEY
 *   - Secret: GOOGLE_PLACES_KEY
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

Cuando es conversacional sin ruta (vacunas, visados, cultura, seguridad, recomendación suelta): puedes extenderte lo que la pregunta necesite, pero misma densidad de información. Cada frase lleva dato. Usa saltos de línea para separar bloques de información y **negritas** para resaltar datos clave (nombres, precios, teléfonos). NO uses bullet points ni listas con guiones — separa con saltos de línea y negritas. Cuenta las cosas como en un bar, no como un manual.

NUNCA en ningún caso: listas con bullet points (- ni •), markdown con ### o ####, coordenadas en el texto del chat, emojis excesivos.

REGLA DE ORO: DATO PRIMERO, CHARLA DESPUÉS.
Cuando el usuario pide información concreta (teléfonos, precios, direcciones, horarios, vacunas, visados, cualquier dato factual), tu respuesta empieza SIEMPRE por el dato. Primero la información que necesita. Después, si quieres, añades contexto, opinión o personalidad. Nunca al revés.

Cuándo aplica:
— Siempre que el usuario pide datos concretos (teléfonos, nombres, precios, direcciones, horarios, requisitos)
— Siempre que la pregunta es urgente o práctica (grúa, hospital, farmacia, policía, embajada)
— Siempre que el usuario ya ha especificado qué quiere y no necesita que le preguntes nada más

Cuándo NO aplica:
— Cuando el usuario es vago y realmente necesitas preguntar para ayudarle ("quiero ir a algún sitio bonito")
— Cuando es conversación abierta sin petición de datos ("¿qué tal Vietnam?")

REGLA ANTI-PREGUNTA INNECESARIA:
Si el usuario pide algo claro, NO preguntes para confirmar. "Grúa en Marbella" es claro — quiere una grúa en Marbella. "Vacunas Vietnam" es claro — quiere saber las vacunas. Solo pregunta cuando REALMENTE no puedes dar una respuesta útil sin más datos. Y si preguntas, que sea UNA pregunta, no tres.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8 — Modos y formato SALMA_ROUTE_JSON
// ═══════════════════════════════════════════════════════════════
const BLOQUE_RUTAS = `Tu objetivo es ayudar al usuario a descubrir lugares interesantes, planificar viajes, crear rutas, encontrar alojamiento y organizar todo en su mapa personal.

ZONAS Y PUNTOS VERIFICABLES
En las rutas solo incluye zonas o puntos que sean verificables (existen en Google Maps, Booking u otras fuentes fiables). No inventes nombres de lugares, direcciones ni coordenadas. Si no estás segura de que un lugar exista o esté bien referenciado, no lo incluyas en la ruta. Prefiere lugares conocidos y comprobables para no equivocarte al dar referencias.

NOMBRES PARA ENLACES A GOOGLE MAPS
El sistema construye enlaces de búsqueda con el "nombre" de cada parada + país/región. Usa SIEMPRE el nombre exacto con el que el lugar aparece en Google Maps (ej. "Puente Nuevo", "Alhambra de Granada", "Catedral de Málaga", "Plaza de la Constitución, Ronda"). Evita nombres genéricos o inventados; si pones "Centro histórico" en vez del nombre del monumento, el enlace no llevará al sitio correcto. Para cada parada: name y headline deben ser el nombre oficial o el que la gente busca en Google Maps.

RUTAS POR DÍA — PIENSA EN EL RECORRIDO PRIMERO (CRÍTICO)
NO pienses en "sitios interesantes" y luego los ordenes. Piensa AL REVÉS:
1. TRAZA LA RUTA PRIMERO: decide el recorrido completo (ej: "Tarifa → costa norte → Cádiz → interior → Grazalema"). Divide los km totales entre los días disponibles.
2. PON PARADAS EN EL CAMINO: cada parada es algo que el viajero pilla DE PASO en ese recorrido. No se desvía 50km para ver algo — lo pilla porque está en la ruta o muy cerca (máx 5-10km de desvío).
3. CADA DÍA ES UN TRAMO: Día 1 = tramo A→B, Día 2 = tramo B→C. Las paradas del día van en el orden en que las encuentras conduciendo/caminando de A a B. La primera parada del día es el punto de salida. La última es donde duermes.
4. CONTINUIDAD OBLIGATORIA: la primera parada del día 2 es la misma ciudad/pueblo donde terminó el día 1. Si el día 1 acaba en Cádiz, el día 2 empieza en Cádiz.
5. DISTANCIAS POR TRANSPORTE: en moto/coche un día = 150-300km de recorrido, en bici = 50-80km, a pie = 15-25km. No pongas más paradas de las que caben en las horas disponibles.
6. INDICA KM Y CARRETERAS: en el narrative de la primera parada de cada día, indica los km totales del tramo y la carretera principal (ej: "Hoy son 120km por la N-340 y la CA-9107").
7. TIPO DE PARADAS SEGÚN TRANSPORTE: en moto → puertos, curvas, carreteras escénicas, bares de carretera. A pie → senderos, fuentes, refugios. En coche → pueblos, miradores con aparcamiento.
Cada parada debe llevar un campo day_title con un título breve del día (3-5 palabras), el mismo valor para todas las paradas del mismo día.

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

EDICIÓN DE RUTA EN TIEMPO REAL
Cuando el usuario quiera añadir, quitar o reordenar paradas de su ruta actual, responde con 1-2 frases y devuelve la ruta completa actualizada en SALMA_ROUTE_JSON (misma estructura). Incluye TODAS las paradas resultantes, no solo las modificadas.

NUNCA TE BLOQUEES — REGLA CRÍTICA
Jamás respondas con un mensaje muerto del tipo "no puedo ubicar ese lugar", "no tengo información suficiente" o similar.

Cuando el destino es vago o te faltan datos clave:
1. Demuestra que conoces el sitio con 1-2 datos concretos.
2. Sugiere valores por defecto razonables.
3. Ofrece dos caminos: "dame más datos" o "le doy caña ya con esto".

Cuándo preguntar vs cuándo generar directamente:
— Si el usuario da destino + días + tipo de viaje → genera ya, no preguntes.
— Si da solo el destino → pregunta en UNA frase por días y tipo. Sugiere defaults y ofrece generar ya.
— Si dice "dale" o "lo que tú veas" → genera siempre, sin más preguntas.
— REGLA DE ORO: si ya preguntaste y el usuario responde con datos → GENERA LA RUTA. No hagas más preguntas.

Cuando generes paradas, usa siempre nombres de lugares concretos y verificables para que el mapa funcione. Nunca "zona rural" o "pueblo típico" — pon el nombre real.`;

// ═══════════════════════════════════════════════════════════════
// BLOQUE 8B — Mapa, tarjetas, alojamiento y navegación
// ═══════════════════════════════════════════════════════════════
const BLOQUE_MAPA = `MAPA PERSONAL
El usuario tiene un mapa personal donde se guardan: lugares, restaurantes, experiencias, miradores, hoteles y rutas. Cuando recomiendes algo relevante, ofrece añadirlo al mapa.

ALOJAMIENTO
Si el usuario busca hotel, pregunta si es necesario: fechas, presupuesto, zona. Recomienda varias opciones con nombres reales.

NAVEGACIÓN EXTERNA
Cada parada puede abrirse en Google Maps para navegación.`;

// ═══════════════════════════════════════════════════════════════
// ENSAMBLAR SYSTEM PROMPT
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
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

function isRouteRequest(message, history) {
  const directMatch = /ruta|itinerario|qué ver|que ver|visitar|días en|dias en|días|dias|fin de semana|semana en|lugares en|qué hacer|que hacer|plan para|viaje a|viaje por|llevo.*días|me quedo|escapada|excursion|excursión/i.test(message);
  if (directMatch) return true;
  if (Array.isArray(history) && history.length >= 2) {
    const prevMessages = history.map(h => h.content || '').join(' ');
    const historyHasRouteContext = /ruta|itinerario|días|dias|viaje|visitar|qué ver|que ver|playas?|playa/i.test(prevMessages);
    const userGivesData = /\d+\s*d[ií]as?|\d+\s*noches?|zona|calas?|playa|surf|ciudad|pueblo|costa|norte|sur|este|oeste/i.test(message);
    if (historyHasRouteContext && userGivesData) return true;
  }
  return false;
}

function isHelpRequest(message) {
  if (!message) return null;
  const m = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const categories = {
    health: /farmacia|pharmacy|hospital|urgencias|emergency room|medico|doctor|dentista|dentist|veterinari|clinica|clinic|ambulancia|ambulance/,
    vehicle: /grua|tow.?truck|taller|mecanico|mechanic|gasolinera|gas.?station|petrol|averia|breakdown|pinch|pinchazo|flat.?tire/,
    security: /embajada|embassy|consulado|consulate|comisaria|policia|police|abogado|lawyer|denuncia|robo|robado|stolen/,
    money: /cajero|atm|cambio.?de.?(divisa|moneda)|currency.?exchange|western.?union|money.?transfer/,
    logistics: /cerrajero|locksmith|lavanderia|laundry|optica|optician|zapatero|cobbler|tienda.?de?.?electronica|electronics|cargador|charger|adaptador|adapter/,
    transport: /taxi|transfer|estacion.?de?.?tren|train.?station|estacion.?de?.?bus|bus.?station|ferry|puerto|port|aeropuerto|airport/,
    communication: /tarjeta.?sim|sim.?card|wifi|locutorio|internet.?cafe/,
    weather: /tiempo|clima|temperatura|lluvia|llover|pronostico|forecast|weather|rain|cold|frio|calor|heat|humedad|humidity|tormenta|storm|nieve|snow|monzon|monsoon|cuando.?mejor.?ir|mejor.?epoca|best.?time/,
  };

  for (const [cat, regex] of Object.entries(categories)) {
    if (regex.test(m)) return cat;
  }
  return null;
}

function extractHelpLocation(message, history, currentRoute) {
  // 1. Patrón explícito "en <lugar>" o "in <place>" en el mensaje
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

async function searchPlacesForHelp(query, location, placesKey) {
  if (!query || !location || !placesKey) return null;

  const searchText = `${query} ${location}`;

  // Text Search — mejor que findplacefromtext para búsquedas genéricas
  let searchResults;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText)}&language=es&key=${placesKey}`);
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

async function fetchWeather(location) {
  if (!location) return null;

  try {
    // wttr.in — API gratuita, sin key, devuelve JSON
    const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1&lang=es`, {
      headers: { 'User-Agent': 'BorradoDelMapa/1.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();

    if (!data?.current_condition?.[0] || !data?.weather) return null;

    const current = data.current_condition[0];
    const forecast = data.weather.slice(0, 3); // 3 días

    const result = {
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
        `https://www.yr.no/en/forecast/daily-table/${encodeURIComponent(location)}`,
      ],
    };

    return result;
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
// CONSTRUIR MENSAJES
// ═══════════════════════════════════════════════════════════════

function buildMessages(history, message, currentRoute, userName, userNationality, helpResults, weatherData) {
  let systemPrompt = SALMA_SYSTEM_BASE;

  // Contexto mínimo del usuario
  const ctx = [];
  if (userName) ctx.push(`[USUARIO: ${userName}]`);
  if (userNationality) ctx.push(`[NACIONALIDAD: ${userNationality} — adapta visados]`);
  if (ctx.length) systemPrompt += '\n\n' + ctx.join('\n');

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
    userContent += '\n\n[OBLIGATORIO — GENERA RUTA AHORA: Tu respuesta DEBE contener SALMA_ROUTE_JSON. Formato: 1 frase sobre el destino + salto de línea + SALMA_ROUTE_JSON + JSON completo. NO respondas solo con texto. Usa defaults razonables para lo que falte.]';
  } else {
    userContent += '\n\n[Si generas ruta, responde con 1-2 frases solo. Si es conversacional, extiéndete con densidad de datos.]';
  }

  // Si Salma preguntó antes y el usuario responde, forzar generación
  if (Array.isArray(history) && history.length >= 2) {
    const lastAssistant = history.filter(h => h.role === 'assistant').pop();
    if (lastAssistant && lastAssistant.content && /\?/.test(lastAssistant.content)) {
      userContent += '\n\n[IMPORTANTE: Ya preguntaste y el usuario responde. Si incluye destino/días/tipo, GENERA LA RUTA YA. No preguntes más.]';
    }
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
- weather.com: ${weatherData.links[0]}
- yr.no: ${weatherData.links[1]}
SÉ BREVE Y DIRECTA. USA FORMATO VISUAL con saltos de línea y **negritas** para separar datos. Ejemplo:\n\n**Ahora**: 34°C, humedad 75%\n**Próximos días**: 32-36°C, lluvias por la tarde\n\nConsejo práctico + enlaces.\n\nIncluye los enlaces para pronóstico actualizado. Menciona que puede cambiar. NUNCA inventes datos.]`;
  }

  messages.push({ role: 'user', content: userContent });
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
      }));
      return route;
    }
  } catch (e) {}
  return null;
}

function replyWithoutRouteBlock(text) {
  if (!text || typeof text !== 'string') return text;
  const idx = text.indexOf('SALMA_ROUTE_JSON');
  if (idx === -1) return text.trim();
  return text.slice(0, idx).trim();
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN DE PARADAS — Google Places (post-generación)
// ═══════════════════════════════════════════════════════════════

async function verifyAllStops(route, placesKey) {
  if (!route?.stops || !placesKey) return route;

  const region = route.region || route.country || '';
  const countryCode = route.country ? getCountryCode(route.country) : '';

  // 1. Buscar cada parada en Google Places
  const findPromises = route.stops.map(stop => {
    const name = stop.name || stop.headline || '';
    if (!name || name.length < 3) return Promise.resolve(null);
    const searchQuery = region ? `${name} ${region}` : name;
    const bias = (stop.lat && stop.lng && Math.abs(stop.lat) > 0.01)
      ? `&locationbias=circle:50000@${stop.lat},${stop.lng}` : '';
    const countryFilter = countryCode ? `&components=country:${countryCode}` : '';
    return fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery${bias}${countryFilter}&fields=place_id,photos,geometry,name,formatted_address&language=es&key=${placesKey}`)
      .then(r => r.json()).catch(() => null);
  });
  const findResults = await Promise.all(findPromises);

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

  // 3. Place Details para cada resultado válido
  const detailFields = 'name,editorial_summary,reviews,opening_hours,website,photos,geometry';
  const detailPromises = findResults.map(data => {
    const c = data?.candidates?.[0];
    if (!c?.place_id) return Promise.resolve(null);
    if (centerLat && centerLng && c.geometry?.location) {
      const distKm = Math.sqrt(Math.pow(Math.abs(c.geometry.location.lat - centerLat), 2) + Math.pow(Math.abs(c.geometry.location.lng - centerLng), 2)) * 111;
      if (distKm > routeRadiusKm) return Promise.resolve(null);
    }
    return fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${c.place_id}&fields=${detailFields}&language=es&key=${placesKey}`)
      .then(r => r.json()).catch(() => null);
  });
  const detailResults = await Promise.all(detailPromises);

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

    const photoRef = detail?.photos?.[0]?.photo_reference || candidate.photos?.[0]?.photo_reference || '';
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
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════

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

    // ─── ENDPOINT /sitemap.xml (SEO) ───
    if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
      try {
        const projectId = 'borradodelmapa-85257';
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/public_guides?pageSize=500`;
        const res = await fetch(firestoreUrl);
        const data = await res.json();

        let urls = `  <url>\n    <loc>https://borradodelmapa.com/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

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
            if (distKm > 10) return new Response(JSON.stringify({ error: 'too far' }), { status: 404, headers: corsH });
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

        return new Response(JSON.stringify({ polyline, legs }), {
          headers: { ...corsH, 'Cache-Control': 'public, max-age=86400' }
        });
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

      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'No API key' }), { status: 500, headers: corsH });
      }

      const enrichPrompt = `Aquí tienes una ruta de viaje con paradas ligeras. Tu trabajo: para CADA parada, añade estos campos que faltan:

- context: 2-3 frases de contexto histórico/cultural (solo para monumentos, templos, patrimonio, naturaleza relevante; omitir en restaurantes y alojamientos)
- food_nearby: nombre REAL de dónde comer cerca, qué pedir, precio aproximado, minutos andando. Si no conoces uno real cerca, déjalo vacío.
- local_secret: un dato local accionable que pocos turistas conocen. Si no tienes uno real, déjalo vacío.
- alternative: plan B si está cerrado o no convence (1 frase)

Reglas:
- NO cambies name, headline, type, day, lat, lng, day_title, narrative
- NO inventes restaurantes ni datos — si no estás segura, deja el campo vacío
- Mantén tu tono: directa, con datos, sin paja
- Devuelve SOLO el JSON completo de la ruta con stops actualizados, nada más. Sin markdown, sin backticks.

RUTA:
${JSON.stringify(route)}`;

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 8000,
            system: BLOQUE_IDENTIDAD + '\n' + BLOQUE_PERSONALIDAD + '\n' + BLOQUE_ANTIPAJA,
            messages: [{ role: 'user', content: enrichPrompt }],
          }),
        });

        if (!res.ok) {
          return new Response(JSON.stringify({ error: 'Anthropic error', status: res.status }), { status: 500, headers: corsH });
        }

        const data = await res.json();
        const text = data.content?.[0]?.text || '';

        let enrichedRoute = null;
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          enrichedRoute = JSON.parse(clean);
        } catch (e) {
          // Intentar extraer JSON del texto
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try { enrichedRoute = JSON.parse(jsonMatch[0]); } catch (e2) {}
          }
        }

        if (enrichedRoute && enrichedRoute.stops) {
          // Preservar campos verificados de Google (coords, fotos, horarios)
          enrichedRoute.stops = enrichedRoute.stops.map((s, i) => {
            const original = route.stops[i];
            if (!original) return s;
            return {
              ...s,
              lat: original.lat || s.lat,
              lng: original.lng || s.lng,
              photo_ref: original.photo_ref || s.photo_ref || '',
              verified_address: original.verified_address || s.verified_address || '',
              practical: original.practical || s.practical || '',
            };
          });
          return new Response(JSON.stringify({ route: enrichedRoute }), { headers: corsH });
        }

        return new Response(JSON.stringify({ error: 'Could not parse enriched route' }), { status: 500, headers: corsH });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
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
    const userNationality = body.nationality || null;

    if (!message.trim()) {
      return new Response(
        JSON.stringify({ reply: 'Dime a dónde quieres ir o qué te apetece hacer y te ayudo.', route: null }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: 'Salma no está configurada (falta API key).', route: null }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // ─── HELP SEARCH / WEATHER (pre-Claude) ───
    let helpResults = null;
    let weatherData = null;
    const helpCategory = isHelpRequest(message);
    if (helpCategory) {
      const helpLocation = extractHelpLocation(message, history, currentRoute);
      if (helpLocation) {
        try {
          if (helpCategory === 'weather') {
            weatherData = await fetchWeather(helpLocation);
          } else {
            helpResults = await searchPlacesForHelp(message, helpLocation, env.GOOGLE_PLACES_KEY);
          }
        } catch (e) {
          // Fallo silencioso — Salma responde sin datos de búsqueda
        }
      }
    }

    // Construir mensajes
    const { systemPrompt, messages } = buildMessages(history, message, currentRoute, userName, userNationality, helpResults, weatherData);
    const isRoute = isRouteRequest(message, history);

    // ─── STREAMING SSE ───
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
          model: isRoute ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
          max_tokens: isRoute ? 4000 : 1500,
          system: systemPrompt,
          messages: messages,
          stream: true,
        }),
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ reply: 'No puedo conectar ahora mismo. Inténtalo en un momento.', route: null }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      return new Response(
        JSON.stringify({ reply: 'Uy, no he podido conectar. Inténtalo en un momento.', route: null, _error: anthropicRes.status + ' ' + errBody.slice(0, 200) }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Stream SSE al cliente
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullText = '';
    let routeSignalSent = false;

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    ctx.waitUntil((async () => {
      try {
        const reader = anthropicRes.body.getReader();
        let buffer = '';

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
              if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
                const chunk = evt.delta.text;
                fullText += chunk;
                if (!fullText.includes('SALMA_ROUTE')) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ t: chunk })}\n\n`));
                } else if (!routeSignalSent) {
                  routeSignalSent = true;
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ generating: true })}\n\n`));
                }
              }
            } catch (e) { /* ignorar */ }
          }
        }

        // Stream terminado — procesar ruta
        let route = extractRouteFromReply(fullText);
        const reply = replyWithoutRouteBlock(fullText);

        if (route) {
          // Draft inmediato
          try { await writer.write(encoder.encode(`data: ${JSON.stringify({ draft: true, reply, route })}\n\n`)); } catch (_) {}
          // Verificar con Google Places
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
        try { await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true, reply: fullText || 'Error de conexión.', route: null })}\n\n`)); } catch (_) {}
      } finally {
        await writer.close();
      }
    })());

    return new Response(readable, { headers: sseHeaders });
  },
};
