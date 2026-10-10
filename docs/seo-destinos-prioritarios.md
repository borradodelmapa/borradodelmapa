# SEO destinos — lista de prioridad (borrador, 10 oct 2026)

Estado: borrador para que Paco corrija. Nada de esto se ha generado ni cuesta aún. Las páginas siguen en `noindex`.
Criterio: destinos con más búsquedas en español (turismo hispanohablante) y que ya tenemos en el KV. No hay datos de
volumen reales: el orden es juicio, conviene confirmarlo con Search Console cuando esté dado de alta.

## Hallazgo: 30 países no tienen páginas de destino
No están en `worker/kv/output-nivel2` (ya anotado el 22 sept): **India, Italia, Japón, Marruecos, Mauricio, México,
Mongolia, Montenegro, Mozambique, Namibia, Nauru, Nicaragua, Níger, Nigeria, Noruega, Nueva Zelanda, Omán, Países Bajos,
Pakistán, Palestina, Panamá, Perú, Portugal, República Dominicana, Sierra Leona, Siria, Suiza, Ucrania, Uganda, Venezuela.**
Faltan precisamente los que más busca el viajero español (Italia, Portugal, Japón, Marruecos, México, Perú).
Generar su nivel 2 llama a IA (coste: ver `docs/kv.md`; estimar y avisar antes, §8).

## Bloque A — ya existen; subirles la calidad primero (28)
España: Barcelona, Madrid, Sevilla, Granada, Cádiz (Costa de la Luz), Mallorca, San Sebastián, Camino de Santiago.
Europa: París, Londres, Berlín, Praga, Viena, Budapest, Atenas, Santorini, Dubrovnik, Split, Reikiavik.
Turquía y Oriente: Estambul, Capadocia, Dubái, El Cairo.
Asia: Bangkok, Bali, Hanoi.
América: Nueva York, Buenos Aires, Río de Janeiro, Cartagena de Indias.

## Bloque B — requieren primero crear el país (nivel 2)
Italia (Roma, Venecia, Florencia), Portugal (Lisboa, Oporto), Japón (Tokio, Kioto), Marruecos (Marrakech),
México (Ciudad de México, Cancún/Riviera Maya), Perú (Cusco/Machu Picchu), Países Bajos (Ámsterdam),
Nueva Zelanda, India, Suiza, Noruega, República Dominicana (Punta Cana), Panamá.

## Qué lleva una página "potente"
Itinerario de 3 días con mapa (ruta real), barrios para dormir con precios, cuánto cuesta de verdad, errores típicos,
sección "si te pasa X" (enlazada al blog SOS), FAQ propia y enlace a guías públicas del destino.

## Coste (a ojo, a medir con UNA ruta antes de decidir)
- Bloque A (28 rutas): una ruta completa cuesta más que una consulta suelta; rango orientativo **15-30 €** si se
  generan con Salma, **0 €** si se reutilizan rutas ya existentes (`loadRoute`) o se redactan sin llamar a Google.
- Bloque B: nivel 2 de ~13 países + sus rutas; rango orientativo **20-40 €**.
- Paso previo recomendado: generar **una** ruta de prueba (p. ej. Lisboa o Cádiz), medir el coste real y enseñar
  el resultado a Paco antes de lanzar el lote.
