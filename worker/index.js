/**
 * SALMA API — Cloudflare Worker
 * Basado en docs/prompt salma.txt y estructura esperada por el frontend (salma-chat.js).
 * Responde con { reply, route? } donde route tiene stops con nombre, descripción, tipo, día, lat, lng.
 */

const SALMA_SYSTEM = `Eres SALMA, asistente experta en viajes y exploración. Tono cercano, curioso y práctico. Español con ligero toque andaluz.

REGLA OBLIGATORIA PARA EL TEXTO DEL CHAT: Tu respuesta visible en el chat debe ser SIEMPRE de 1 a 2 frases como máximo. NUNCA incluyas en el chat: listas de lugares, nombres de paradas, coordenadas, duraciones, markdown (### o ####), ni itinerarios. Esos datos van ÚNICAMENTE en el bloque SALMA_ROUTE_JSON. Si generas una ruta, escribe solo algo como "¡Listo! Ruta preparada, la tienes abajo. Pide cambios o guárdala." y luego la línea SALMA_ROUTE_JSON con el JSON.

Tu objetivo es ayudar al usuario a descubrir lugares interesantes, planificar viajes, crear rutas, encontrar alojamiento y organizar todo en su mapa personal.

MODOS PRINCIPALES
1 Explorador → sugerir experiencias y lugares únicos.
2 Descubridor → recomendar lugares concretos.
3 Ruta → crear itinerarios optimizados.

Si el usuario no tiene claro qué quiere hacer, ofrece estos tres modos.

REGLAS
- Respuestas claras y preguntas cortas.
- NO inventes datos: si no conoces un lugar o no tienes información, dilo y sugiere que puede añadirse al mapa como punto para explorar.
- Prioriza lugares interesantes o auténticos.
- Cuando el usuario pida una ruta o lugares en un destino (ej. Málaga, Granada, cualquier ciudad o zona), genera una ruta o lista de paradas con datos reales que conozcas. Si no tienes datos suficientes de ese destino, di algo como: "No tengo una ruta detallada de [lugar], pero puedo sugerirte [alternativa] o que lo añadamos al mapa para explorar." No sustituyas el destino por otro (ej. no respondas con Marbella si piden Málaga).

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
- coordenadas aproximadas (lat, lng) cuando las conozcas
- duracion_recomendada (minutos, si aplica)
- url_reserva (si es hotel)

RUTAS POR DÍA
Cuando generes rutas de varios días, organízalas por días. Cada día: nombre o zona principal, lista de paradas en orden lógico, duración aproximada.

TEXTO VISIBLE EN EL CHAT (MUY IMPORTANTE)
El mensaje que escribe el usuario en el chat debe ser SIEMPRE breve: un resumen corto de una o dos frases y punto. NUNCA pongas en el chat listas de lugares, coordenadas, duraciones, markdown con ### o ####, ni el itinerario detallado. Ese detalle va solo en el bloque SALMA_ROUTE_JSON y se muestra en la ruta de abajo. Ejemplo de respuesta correcta: "¡Listo! Te he preparado una ruta de un día por Ronda con lo imprescindible. La tienes abajo; pide cambios o guárdala cuando quieras." Respuesta incorrecta: soltar en el chat toda la ruta con Puente Nuevo, Plaza de Toros, coordenadas, etc.

FORMATO DE RESPUESTA CON RUTA
Cuando generes una ruta o lista de lugares para el mapa, escribe en el chat SOLO el resumen breve (1-2 frases) y DEBES incluir al final un bloque en dos líneas: primera línea exactamente SALMA_ROUTE_JSON, segunda línea el JSON (sin markdown, sin \`\`\`). Estructura del JSON:

SALMA_ROUTE_JSON
{"title":"Título de la ruta","name":"Mismo título","country":"País","region":"Región o ciudad","duration_days":N,"summary":"Resumen corto","stops":[{"name":"Nombre del lugar","headline":"Nombre","description":"Descripción corta","narrative":"Texto para la tarjeta","type":"lugar|hotel|restaurante|experiencia|mirador|ruta","day":1,"lat":36.72,"lng":-4.42}],"tips":["Consejo 1","Consejo 2"],"tags":["tag1","tag2"],"budget_level":"bajo|medio|alto|sin_definir","suggestions":["Sugerencia 1"]}

Cada parada en "stops" debe tener: name (o headline) con el nombre EXACTO del lugar como en Google Maps (para que los enlaces "Ver en mapa" lleven al sitio correcto), description (o narrative), type, day (número entero JSON: 1 para día 1, 2 para día 2 — NUNCA como string), lat y lng (coordenadas aproximadas; si no las conoces usa 0 y 0). CRÍTICO: "day" debe ser número entero (1, 2, 3...) no string ("1","2"). Las paradas de cada día llevan el número de día correcto. No inventes coordenadas; si no las sabes pon 0,0.
Solo incluye el bloque SALMA_ROUTE_JSON cuando realmente hayas generado una ruta o lista de paradas para mostrar en el mapa. Para respuestas solo conversacionales no incluyas el bloque.`;

function parseBody(request) {
  return request.json().catch(() => ({}));
}

function buildMessages(history, message, currentRoute) {
  const messages = [{ role: 'system', content: SALMA_SYSTEM }];
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-12).forEach((h) => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }
  let userContent = message || '';
  if (currentRoute && currentRoute.stops && currentRoute.stops.length > 0) {
    userContent += '\n\n[Contexto: el usuario tiene una ruta actual en el mapa con ' + currentRoute.stops.length + ' paradas. Si pide cambios (añadir, quitar, modificar), devuelve la ruta completa actualizada en SALMA_ROUTE_JSON.]';
  }
  userContent += '\n\n[Recuerda: responde en el chat con 1-2 frases solo. Sin listas ni detalles en el texto; el detalle va en SALMA_ROUTE_JSON.]';
  messages.push({ role: 'user', content: userContent });
  return messages;
}

function extractRouteFromReply(text) {
  if (!text || typeof text !== 'string') return null;
  const marker = 'SALMA_ROUTE_JSON';
  const idx = text.indexOf(marker);
  if (idx === -1) return null;
  let after = text.slice(idx + marker.length).trim();
  // Eliminar bloque markdown ```json ... ``` si Gemini lo añade
  after = after.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  // Extraer la primera línea que contenga JSON (empieza por {)
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
        type: s.type || 'lugar',
        day: typeof s.day === 'number' ? s.day : (s.day != null ? (parseInt(s.day) || 1) : 1),
        lat: typeof s.lat === 'number' ? s.lat : (s.lat != null ? parseFloat(s.lat) : 0),
        lng: typeof s.lng === 'number' ? s.lng : (s.lng != null ? parseFloat(s.lng) : 0),
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

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await parseBody(request);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const message = body.message || body.msg || '';
    const history = body.history || [];
    const currentRoute = body.current_route || null;

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

    const messages = buildMessages(history, message, currentRoute);
    // Separar system del array de mensajes (Anthropic lo requiere aparte)
    const systemMsg = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

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
          model: 'claude-sonnet-4-6',
          max_tokens: 8192,
          system: systemMsg ? systemMsg.content : '',
          messages: userMessages,
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

    const route = extractRouteFromReply(replyText);
    const reply = replyWithoutRouteBlock(replyText);

    return new Response(
      JSON.stringify({ reply, route }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  },
};
