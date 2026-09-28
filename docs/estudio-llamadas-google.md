# Estudio de llamadas a Google Maps/Places — qué se queda y qué no (28 sept 2026)

Origen: "¿cómo te llamas, de dónde eres?" → Salma responde "Me llamo **Salma**" → el Worker buscó "Salma" en
Google Places, encontró un negocio y le pegó "🗺️ Cómo llegar". Tirando del hilo salen tres automatismos del chat
que llaman a Google **en casi cada respuesta**, aunque nadie haya pedido un sitio.

Precios que usa el propio tope del Worker (`GOOGLE_UNIT_EUR`, línea ~25): find 0,016 € · text 0,030 € ·
details 0,025 € · nearby 0,030 € · photo 0,0065 € · directions 0,009 € · geocode 0,0046 €.
Tope actual: 8 €/día, 50 €/mes (KV `gcap:config`). Al llegar al tope se corta **todo** Google del Worker hasta el
día siguiente — incluida la verificación de rutas, que es lo importante.

## ❌ Lo que NO debería quedarse así (chat, después de la respuesta de Claude)

| # | Qué | Dónde | Cuándo salta | Coste por respuesta | ¿Caché? |
|---|---|---|---|---|---|
| 1 | **"Fallback" de enlace**: busca el MENSAJE ENTERO del usuario como si fuera un sitio | `salma-worker.js` ~14094-14125 | Casi siempre: respuesta sin enlace de Maps + mensaje de 2+ palabras | hasta 3 llamadas ≈ **0,06 €** | Con GPS los "no encontrado" NO se guardan → se repaga cada vez |
| 2 | **Enlaces "Cómo llegar" en negritas** | `injectVerifiedMapsLinks` ~2661 (llamada ~14087) | Toda respuesta de chat con negritas que parezcan nombre propio (máx. 6) | 1-3 llamadas por negrita ≈ **0,02-0,37 €** | Sí, pero la clave incluye como "región" el texto del mensaje del usuario → cada mensaje distinto es una clave nueva → casi nunca acierta |
| 3 | **Fotos en negritas** | post-procesado fotos ~14158 | Toda respuesta de chat con negritas (máx. 8) | 1 find por negrita ≈ **hasta 0,13 €** + fotos | Igual que el 2: la pista de lugar puede ser el mensaje → caché poco útil. Además "Salma" en negrita puede traer la foto de un negocio |

Suma típica de una respuesta de chat normal con 3-4 sitios en negrita: **≈ 0,15-0,30 €**. Con el tope de 8 €/día,
unas 30-50 respuestas así agotan el día y dejan sin Google a la verificación de rutas del resto de usuarios.

### Propuesta
1. **Fallback (#1)**: solo cuando el usuario pide un enlace de forma explícita ("enlace", "link", "maps",
   "cómo llegar", "dónde está"…). El resto de mensajes → cero llamadas. (La mayoría de esas peticiones ya las
   atiende antes el atajo sin Claude de ~12822, así que casi no se pierde nada.)
2. **Negritas (#2 y #3)**: la región/pista deja de ser el texto del mensaje. Se usa el destino ya resuelto
   (ancla, `dest_hint`, cuestionario guiado) o el destino extraído del mensaje (`extractHelpLocation`, sin API),
   y si no, la ciudad del GPS. Así "Alhambra, Granada" se paga una vez y queda en caché para siempre.
3. **Nombres que no son sitios**: "Salma", "Borrado del Mapa" y el nombre del usuario, fuera de enlaces
   (hecho en la rama) **y de fotos** (pendiente).

## ✅ Lo que se queda (lo pide el usuario o ya está controlado)

| Qué | Dónde | Por qué se queda |
|---|---|---|
| Verificación de paradas de rutas (`verifyAllStops`) | ~6285, ~14332, ~6162, ~4370 | Es el núcleo del producto; reutiliza paradas ya verificadas al editar |
| Atajo "dame el enlace de X / dónde está X" sin Claude | ~12822 | Petición explícita; 1-3 llamadas, cacheadas |
| Ayuda (farmacia, cajero, taller…) `searchPlacesForHelp` | ~3649, ~12990 | Petición explícita; details cacheados para siempre |
| Taxi/traslado (coordenadas del destino) | ~13291 | Petición explícita; 1 text search |
| "Quiero ir a X" (`resolveGoToDestination`, nearby) | ~3146, ~3438 | Petición explícita. Mejora menor posible: el text search no se cachea |
| Herramientas que decide Claude (buscar_lugar, buscar_foto, restaurantes, hoteles) | ~8011, ~8189 | Responden a una pregunta concreta del usuario |
| Ancla de país del destino (`resolverPaisDestino`) | ~12818 | Solo en peticiones de ruta; evita rutas en el país equivocado |
| Endpoints del mapa: /photo, /place-details, /directions, /staticmap, /route-thumbnail | ~10005-10417 | Acciones del usuario en el mapa; fotos en R2 |
| Narrador (/nearby-pois) | ~11527, `salma.js` ~2740 | Opcional, ya limitado (30 m de movimiento, se apaga a los 5 min parado). ~0,03 €/consulta |
| /health | ~9219 | Solo admin y cacheado |
| Navegador (mapa en vivo, buscador del mapa, diario) | `app.js`, `map-modal.js` | Acciones del usuario; van con la clave pública, fuera del tope del Worker (las frenan las cuotas de Google Cloud) |

## ⚠️ Riesgo aparte (no es de este caso, apuntar como caso de seguridad/costes)
`/nearby-pois`, `/photo`, `/place-details`, `/directions` responden sin cuenta. Alguien que los llame en bucle
gasta el tope de 8 €/día y deja la app sin Google hasta el día siguiente. El tope protege el dinero, no el servicio.

## Cómo ver el gasto real (desde el portátil)
```
cd worker ; npx wrangler kv key get --binding SALMA_KB "gspend:d:2026-09-27" -c wrangler.toml --remote
```
Devuelve `{ eur, n: { find, text, details, photo, ... } }` del día: si `find` y `text` dominan, son los puntos 1-3.

## Decisión de Paco (28 sept 2026) — entrega 1, programada en la rama `claude/salma-personality-response-26ta9q`
- **Chat sin enlaces "Cómo llegar" por defecto.** Solo si el usuario los pide (enlace, cómo llegar/llego, dónde
  está/queda, ubicación, dirección) o si es búsqueda "cerca de mí" / ayuda (farmacia, comer por aquí, taller, taxi).
  Motivo: era la mayor fuente de enlaces equivocados y de gasto. Las guías no cambian: llevan siempre sus enlaces.
- Cuando el chat nombra sitios sin enlace, el Worker añade una sola vez por conversación el texto fijo
  "📍 Si necesitas cómo llegar a alguno de estos sitios, pídemelo y te paso el enlace." (sin tocar el prompt).
- Los enlaces de Maps que escriba Claude por su cuenta se siguen limpiando siempre.
- Búsqueda del mensaje entero (#1): solo con petición explícita. Zona estable para la caché (#2/#3).
  "Salma", la marca y el nombre del usuario nunca se buscan.

## Hallazgo: las fotos del post-procesado del chat no llegan al usuario
El bloque "POST-PROCESADO FOTOS" (~14200) inserta las fotos en `allText`, pero `reply` (lo que se envía en el
evento `done`) se calcula antes (~13825) y no se vuelve a leer de `allText`. Resultado: se paga la búsqueda en
Google (1 find por negrita la primera vez, luego caché) y la foto solo aparecería si la respuesta falla.
**Decisión de Paco (opción A): bloque quitado.** Las fotos del chat siguen llegando por la herramienta buscar_foto.
