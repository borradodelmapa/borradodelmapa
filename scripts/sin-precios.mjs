// Quita los precios de un texto (20 oct 2026, Paco: «nada de precios sin fuente»). Los precios de las fichas de destino los
// escribió Salma sin fuente («Guesthouses en Lakeside: 5-12 EUR/noche», «Dal bhat 2-3 EUR»): se quita el importe y se deja la
// frase bien escrita («Guesthouses en Lakeside»). La usan build-destinos.js (páginas nuevas) y quitar-precios-paginas.mjs (las ya
// publicadas), para que las dos den lo mismo.
const MONEDA = '(?:EUR|€|USD|US\\$|\\$|euros?|dólares|dolares|NPR|rupias|INR|₹|baht|THB|฿|VND|dong|₫|kip|LAK|soles|PEN|pesos|MXN|ARS|COP|CLP|MAD|dírhams|dirhams|libras|GBP|£|CHF|francos|yenes|JPY|¥|yuan|CNY|lempiras|quetzales|bolivianos|reales|BRL|liras|TRY|coronas|SEK|NOK|DKK|ISK|forintos|HUF|zlotys|PLN|leus|RON|leva|BGN|kunas|rands|ZAR|chelines|KES|TZS|UGX|birr|ETB|dinares|JOD|TND|libras egipcias|EGP|riales|OMR|SAR|AED|dírham|ringgit|MYR|rupias indonesias|IDR|pesos filipinos|PHP|wons|KRW|NZD|AUD|CAD|SGD|HKD|TWD|MNT|tugriks|GEL|AMD|AZN|UZS|KZT|tenge)';
const NUM = '\\d+(?:[.,]\\d+)*';
const PRECIO = new RegExp(
  '(?:\\b(?:desde|entre|unos|unas|aprox\\.?|aproximadamente|alrededor de|a partir de|por|de|cuesta|cuestan|vale|valen)\\s+)?' +
  '[~≈±]?\\s?' + NUM + '(?:\\s?(?:-|–|a|y)\\s?[~≈]?' + NUM + ')?\\s?' + MONEDA + '(?![\\p{L}])' +
  '(?:\\s?\\/\\s?(?:noche|día|dia|persona|pax|hora|plato|comida|trayecto|entrada|semana|mes|kg|botella|cerveza|habitación|hab|adulto|niño|coche|moto|día y persona))?' +
  '(?:\\s(?:por persona|por noche|por día|por hora|al día|la noche|por trayecto|ida y vuelta|i\\/v|cada uno|por cabeza|por pax))?',
  'giu');

// Cada precio se cambia por una marca (\u0001) y la limpieza SOLO actúa junto a esa marca: así no se tocan paréntesis ni dos
// puntos que no tenían precio («(World Peace Pagoda)» se queda).
const M = '\u0001';
const SUFIJO = /\u0001\s*(?:menú|el menú|por menú|por persona|por noche|por día|por hora|al día|la noche|cada uno|por pax|por cabeza|ida y vuelta|i\/v|solo ida|ida|vuelta|entrada|la entrada|de entrada|billete|el billete|ticket|por trayecto|el trayecto|por billete)(?![\p{L}])/giu;
export function sinPrecios(t) {
  if (typeof t !== 'string' || !/\d/.test(t)) return t;
  let s = t.replace(PRECIO, M);
  if (s === t) return t;
  s = s
    .replace(SUFIJO, M)
    .replace(/\u0001\s*\/\s*\p{L}+/gu, M) // «█ /persona» que se queda suelto
    .replace(/[~≈±]\s*(?=\u0001)/gu, '').replace(/\u0001\s*[~≈±]/gu, M) // «~» que se queda sin número
    // «Rango principal: █», «Rango medio █»: la etiqueta del precio sola no dice nada
    .replace(/\b[Rr]ango\s+(?:principal|medio|económico|alto|bajo)\s*:?\s*\u0001/gu, M)
    // «(≈ 11 €)», «(entrada 3 EUR)», «(alquiler barca 3-5 EUR/hora)»: paréntesis con precio y como mucho 3 palabras → fuera entero
    .replace(/\(([^()]*\u0001[^()]*)\)/gu, (m, dentro) => {
      const palabras = dentro.replace(/\u0001/g, ' ').split(/[\s,;:/–-]+/).filter(w => /\p{L}{2,}/u.test(w));
      return palabras.length <= 3 ? M : '(' + dentro + ')';
    })
    // marcas seguidas («1.500 NPR (≈ 11 €)» → dos marcas) en una, y lo que venía detrás («por persona»)
    .replace(/\u0001(\s*\u0001)+/g, M).replace(SUFIJO, M)
    // «█ por plato», «█ por comida», «█ por sesión de 2 horas», «█ por inmersión»: lo que medía el precio, fuera
    .replace(/\u0001\s*por\s+\p{L}+(?:\s+de\s+\d+\s+\p{L}+)?(?![\p{L}])/giu, M)
    .replace(/\u0001\s*por\s+\d+(?:\s?[-–]\s?\d+)?\s+\p{L}+(?![\p{L}])/giu, M) // «█ por 3 días», «█ por 5-6 días»
    // «por menos de 10 EUR», «desde más de 50 EUR»: sin el importe no dicen nada
    .replace(/\s*\b(?:por|desde|a partir de)\s+(?:menos|más)(?:\s+de)?\s*\u0001/giu, M)
    // «Rango 8-15 EUR por plato principal», «Rango: 1-4 EUR»: la etiqueta del precio sola no dice nada
    .replace(/\b[Rr]ango(?:\s+(?:principal|medio|económico|alto|bajo))?\s*:?\s*\u0001(?:\s+principal)?/gu, M)
    // «…, billete █,», «…, entrada █.», «…, acceso █.»: SOLO tras una coma (o al empezar); en medio de una frase se queda
    // («incluida en el ticket» sigue siendo «ticket»)
    .replace(/(^|,)\s*(?:entrada|billete|ticket|tarifa|precio|coste|acceso)\s*\u0001/giu, '$1' + M)
    // etiquetas que se quedan sin importe al principio de un trozo: «Presupuesto comida: █», «– precio variable █». Pero
    // «restaurantes de precio medio (█)» se queda «restaurantes de precio medio»
    .replace(/(^|[.;(,–-]\s*)(?:presupuesto|precio|precios|coste|tarifa)(?:\s+(?:diario|comida|aproximado|medio|variable|variables))?\s*:?\s*\u0001/giu, '$1' + M)
    // dos puntos o guion que se quedan colgando antes del precio quitado: «Lakeside: █» → «Lakeside»
    .replace(/\s*[:–-]\s*\u0001\s*(?=[.,;)]|$)/gu, M)
    .replace(/\u0001/g, ' ')
    // puntuación y espacios
    .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/[,;]\s*\)/g, ')')
    .replace(/[ \t]+([.,;:!?])/g, '$1').replace(/([.,;])\1+/g, '$1').replace(/,\s*\./g, '.').replace(/\.\s*,/g, '.')
    .replace(/:\s*,/g, ':').replace(/,\s*,/g, ',').replace(/^\s*[,.;:]\s*/, '').replace(/[ \t]{2,}/g, ' ').trim()
    .replace(/\s*[,;]$/, '').replace(/\(\s*[~≈]\s*/g, '('); // coma suelta al final y «(~» del precio quitado
  return s;
}

// Lo mismo para todos los textos de un objeto (ficha de destino, ruta)
export function sinPreciosObj(o) {
  if (typeof o === 'string') return sinPrecios(o);
  if (Array.isArray(o)) return o.map(sinPreciosObj);
  if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o)) r[k] = /^(url|link|href|photo|foto|img|image|file|slug|id|place_id|links)$/i.test(k) ? o[k] : sinPreciosObj(o[k]); return r; }
  return o;
}
