# Plan: enlaces "Cómo llegar" del chat — rehacerlo de una vez (caso p-mul559lkvkr)

Estudio del 28 sept 2026, al cerrar una sesión de parches (ver "Qué pasó"). **Para la próxima sesión: Opus, una sola
entrega, batería de pruebas al final — no parche + mensaje + parche.**

## Qué pasó el 28 sept (por qué no más parches)
"cómo llego a la Alhambra en camper" dio, según quién preguntara: un negocio "Alhambra Camper" (la zona salía de
"en camper"), nada (una variable `location` inexistente reventaba el post-procesado y el `catch` mandaba el texto
en crudo sin avisar), o un "Alhambra" de Madrid (con el GPS en Madrid, la zona era la ciudad del GPS). La pregunta
directa "¿Cómo llego a la Alhambra?" (atajo sin Claude) **también** enlaza al de Madrid con GPS en Madrid: el fallo
ya estaba en producción para cualquier usuario con GPS. Las primeras pruebas no lo vieron porque iban sin GPS.
Estado que se queda (decisión de Paco): Worker `3567b3eb` + `app.js` v202.

## Por qué falla: el chat vuelve a buscar en Google lo que Salma ya encontró
Hoy, en el chat, el sitio de un enlace se decide **después** de que Claude conteste, adivinando:

| Dónde (salma-worker.js) | Qué hace | Por qué falla |
|---|---|---|
| Atajo `directLinkTarget` (~12944) — antes de Claude | busca el nombre con **sesgo por el GPS** del usuario (acceptFar) | con GPS en Madrid, "Alhambra" = el homónimo de Madrid |
| `injectVerifiedMapsLinks` (~2778, llamada ~14223) — después | busca cada negrita con una "región" adivinada: ancla → `dest_hint` → cuestionario → `chatPlaceContext(mensaje)` → **ciudad del GPS** | la región sale de trozos del mensaje ("camper") o del GPS |
| Respaldo (~14240) — después | si no quedó enlace, busca el sitio pedido con **sesgo GPS** | mismo problema que el atajo |
| `catch` del post-procesado (~14625) | cualquier error → manda el texto en crudo, sin log | los fallos son invisibles |

**Lo que ya existe y hace bien las cosas:**
- `buscarLugar` (~7939) ya tiene escrita la regla: *sesgo por la CIUDAD pedida, NUNCA por el GPS real* (bug de
  rutas en Portugal). Devuelve por cada sitio `place_id`, `google_maps`, `lat/lng`, nombre.
- `buscarFotoLugar` (~8142) devuelve `place_id` y el nombre canónico de Google (Claude le pasa "Alhambra Granada
  España"). En la prueba del camper Salma **ya tenía** el place_id bueno de la Alhambra por la foto.
- El bucle de herramientas (~13755) ya guarda por nombre lo que devuelven (`_hotelPhotosByName`,
  `_placePhotosByName`) para reparar lo que escribe Claude. Es el mismo patrón que hace falta.
- El post-procesado de fotos por negrita ya se quitó (~14292).

## El arreglo (una entrega)
1. **Catálogo de la respuesta.** En el bucle de herramientas, guardar en un `Map` por nombre normalizado
   (`normPlaceName`) cada sitio que devuelvan `buscar_lugar` (todos los `lugares`) y `buscar_foto` (`lugar` +
   `place_id`, también bajo el nombre que pidió Claude): `{ name, place_id, lat, lng }`.
2. **Enlaces desde el catálogo.** Donde hoy se llama a `injectVerifiedMapsLinks`: para cada negrita elegible
   (mismas reglas de hoy: opción B = solo el sitio pedido; "cerca de mí"/ayudas = todas), si coincide con el
   catálogo (`samePlaceName`) → enlace con ese `place_id`, **cero llamadas a Google**.
3. **Si no está en el catálogo** (Claude contestó de memoria): una búsqueda del sitio **sin la ciudad del GPS ni
   trozos del mensaje**. Zona solo si es fiable: destino ya resuelto (ancla, `dest_hint`, cuestionario) o la ciudad
   que la propia respuesta asocia al sitio. Sin zona → nombre a secas con filtro de país y luego sin filtro (igual
   que la segunda vuelta del atajo). **GPS solo para "cerca de mí"/ayudas** (farmacia, comer por aquí…), donde lo
   cercano es lo que se pide.
4. **Atajo sin Claude**: misma regla — sin sesgo GPS para un sitio con nombre. (Riesgo a valorar con Paco: un
   negocio local con nombre repetido en España, "cómo llego a Casa Pepe", podría salir de otra ciudad. Opción:
   si el resultado sin sesgo no es un sitio conocido, no dar el atajo y dejar que conteste Salma.)
5. **Borrar** `chatPlaceContext` como fuente de zona, el `_msgZone` y el parche de "en camper" (quedan sin uso).
6. **Errores visibles**: en el `catch` (~14625) `console.error` + `recordAutoError` (caso 🤖 automático).

**Coste (§8):** baja. Cada sitio que Salma ya buscó con una herramienta deja de pagarse dos veces (0,016-0,05 € por
negrita). Las búsquedas que quedan, sin la zona variable del mensaje, aciertan más en la caché `vp:`.

## Cómo se prueba (una vez, al final)
Batería fija `scripts/bateria-chat.cjs` (usuario de prueba de las variables `TEST_EMAIL`/`TEST_PASSWORD` de
Windows, Playwright con el Chrome instalado, veredicto automático): sin GPS / Madrid / Granada ×
"cómo llego a la Alhambra en camper", "¿Cómo llego a la Alhambra?", "dónde comer en Triana". Se puede pasar contra el
Worker en local sin desplegar (`node scripts/bateria-chat.cjs local` con `npx wrangler dev -c wrangler.toml --remote
--port 8787` arrancado). 9 mensajes ≈ 35-60 cént. por pasada: avisar a Paco antes. Añadir si hace falta: un negocio
local ("cómo llego al Mercado de Triana"), una ruta en otro país con GPS en España, y "búscame hotel en Granada".
Criterio: todo OK en local → desplegar → una pasada en producción → Paco lo prueba en su móvil.

Resultado de la batería del 28 sept con el Worker de entonces (antes de este plan): sin GPS 3/3 OK; Madrid: camper
y directo enlazan al "Alhambra" de Madrid (`ChIJ486E9IAoQg0…`), Triana OK. La Alhambra real es
`ChIJO7l_l7f8cQ0Rf6IhEu_RjYA`.

## Notas para quien lo haga
- Login del usuario de prueba: la ficha `users/{uid}` ya existe (sin ella el Worker contesta "Inicia sesión").
- En móvil, Enter no envía: pulsar `#main-send`. La red de casa va a rachas: el script reintenta la carga.
- La web no puede llamar a `localhost` (CSP): el modo `local` intercepta el POST con Playwright y lo reenvía.
