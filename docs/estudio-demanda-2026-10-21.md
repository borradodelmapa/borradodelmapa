# Estudio de demanda de destinos (21 oct 2026)

Pedido por Paco: «qué es lo que más demanda la gente», hecho **online** porque Salma aún no tiene tráfico.
Datos completos (1.629 destinos, uno por fila): [`estudio-demanda-destinos.csv`](estudio-demanda-destinos.csv).

## Cómo se ha hecho (coste 0 €)
- **Demanda** = visitas en **Wikipedia en español** de octubre de 2025 a septiembre de 2026, mes a mes, del artículo de cada
  destino (API pública de Wikimedia). Para no confundir homónimos, el artículo se busca en **Wikidata filtrando por el país**.
- **Contexto de viaje real**: INE (viajes de residentes), Kayak, eDreams y Skyscanner (ver «Fuentes»).
- **Límite importante**: las visitas en Wikipedia miden *interés*, no solo viajes. Las capitales latinoamericanas (Buenos
  Aires, Bogotá, Santiago…) salen muy arriba porque las lee mucha gente de allí; y lugares de historia (Jerusalén, Babilonia)
  por estudiantes. Por eso el ranking se cruza con los datos de reservas y búsquedas de vuelos.
- Fiabilidad: 1.210 de 1.629 destinos con artículo; 0 errores de descarga. Casos dudosos conocidos: «Beausoleil» (cogió
  «Idioma francés») y «Túnez (capital)» (cogió el país entero): no usar sus cifras.

## Resultado 1 — El mayor hueco: países que la gente busca y NO tenemos
**17 países sin ninguna página de destino** (nunca se generaron): **Italia, Portugal, Japón, Marruecos, México, Perú,
Países Bajos, Suiza, Noruega, India, Nueva Zelanda, República Dominicana, Panamá, Montenegro, Mongolia, Taiwán y Myanmar.**
Son justo los que encabezan los viajes de los españoles: eDreams pone **Roma, París, Londres, Tenerife, Gran Canaria,
Ámsterdam, Sevilla, Madrid, Palma y Praga** en su top 10 de reservas para 2026; Kayak, **Tokio** en cabeza mundial; y
Roma, Lisboa, Ámsterdam, Tokio, Kioto, Marrakech, Cancún, Machu Picchu, Cusco, Oporto, Florencia o Venecia **no existen**
en nuestro catálogo. Tenerife y Gran Canaria tampoco (España solo tiene 10 destinos).

## Resultado 2 — Lo más buscado de lo que SÍ tenemos (top 25)
| # | Destino | País | Visitas/año (es) | Mes pico | Guía |
|---|---|---|---|---|---|
| 1 | Madrid | España | 686.168 | nov | — |
| 2 | Nueva York | EE. UU. | 495.410 | nov | — |
| 3 | Buenos Aires | Argentina | 478.495 | oct | — |
| 4 | Barcelona | España | 428.876 | may | ✅ |
| 5 | Bogotá | Colombia | 341.399 | ago | — |
| 6 | Sevilla | España | 312.882 | nov | ✅ |
| 7 | Londres | Reino Unido | 280.740 | oct | — |
| 8 | San Sebastián | España | 268.668 | abr | — |
| 9 | Santiago | Chile | 257.634 | oct | — |
| 10 | París | Francia | 253.296 | oct | — |
| 11 | Jerusalén | Israel | 242.707 | mar | — |
| 13 | Medellín | Colombia | 224.327 | ene | — |
| 14 | Granada | España | 224.286 | nov | ✅ |
| 15 | Estambul | Turquía | 216.808 | oct | — |
| 16 | Isla de Pascua | Chile | 212.823 | nov | — |
| 17 | Toledo | España | 205.127 | nov | ✅ |
| 19 | Cartagena de Indias | Colombia | 187.945 | ene | — |
| 20 | Budapest | Hungría | 186.251 | may | — |
| 21 | Petra | Jordania | 174.826 | nov | — |
| 24 | Río de Janeiro | Brasil | 163.072 | oct | — |
| 25 | Mallorca | España | 156.715 | jul | — |
| 27 | Camino de Santiago | España | 152.158 | may | — |
| 28 | Praga | Rep. Checa | 151.189 | nov | — |
| 29 | Viena | Austria | 150.722 | jun | — |
| 36 | Islas Galápagos | Ecuador | 130.959 | nov | — |

Por **país** (suma de sus destinos): España 2,4 M · Colombia 0,85 M · Argentina 0,83 M · Francia 0,73 M · Alemania 0,72 M ·
EE. UU. 0,71 M · Chile 0,65 M · Israel 0,63 M · Reino Unido 0,60 M · Bolivia 0,55 M · Grecia 0,52 M.

## Resultado 3 — Qué tipo de viaje se busca
Ciudad 15,3 M (media 35.000 por destino) · histórico 4,1 M (11.800) · naturaleza 1,6 M (4.200) · isla 1,3 M (9.000) ·
rural 0,6 M · montaña 0,36 M · desierto 0,26 M · playa 0,19 M. **Las ciudades atraen 3-8 veces más que el resto.**

## Resultado 4 — Cuándo se busca
Todo el año es parecido, con el máximo en **octubre-noviembre** (preparar viajes de fin de año y del año siguiente).
De los 300 destinos más buscados, 139 tienen su pico en oct-nov. Mallorca (jul), Barcelona y Budapest (may), Viena (jun):
picos de temporada propia.

## Resultado 5 — Lo que ya tenemos con guía
Barcelona (4.º), Sevilla (6.º), Granada (14.º) y Toledo (17.º) están entre lo más buscado. Las de Nepal y Vietnam quedan
lejos (Hanói 169.º, Katmandú 176.º, Pokhara 564.º, Chitwan 746.º): son nicho. 419 destinos del catálogo no tienen artículo
en Wikipedia y 390 tienen menos de 1.000 visitas al año (demanda muy baja).

## Recomendación (para decidir con Paco)
1. **Crear los países que faltan**, empezando por Italia, Portugal, Japón, Marruecos, México y Perú (y Canarias dentro de España).
2. **Guías de lo más buscado que ya tiene ficha**: Madrid, Nueva York, Londres, París, Estambul, Budapest, Praga, Petra,
   San Sebastián, Mallorca.
3. **Publicar antes de octubre-noviembre**, que es cuando más se busca.
4. Medir el coste real con UNA guía antes de lanzar tandas.

## Fuentes
- Visitas: API de Wikimedia (pageviews), Wikidata.
- [INE — Encuesta de Turismo de Residentes, 4.º trim. 2025](https://ine.es/dyngs/Prensa/es/ETR4T25.htm): viajes al extranjero +7,2 %.
- [Forbes — Kayak, verano 2026](https://forbes.es/economia/842460/male-maldivas-pekin-y-costa-rica-destinos-tendencia-entre-los-espanoles-para-verano-de-2026/): Malé, Pekín y San José (Costa Rica), los que más suben entre españoles; Tokio, Bangkok y Londres, top mundial.
- [Hosteltur — Skyscanner, tendencias 2025](https://www.hosteltur.com/166251_los-destinos-que-marcaran-tendencia-para-los-espanoles-en-2025.html): Akureyri, Tulum, Okinawa.
- eDreams «A Year in Travel» 2026 (citado por la búsqueda): París, Londres, Roma, Tenerife, Gran Canaria, Ámsterdam, Sevilla, Madrid, Palma, Praga.
