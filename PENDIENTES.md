# PENDIENTES — Borrado del Mapa

Registro de features desactivadas o pendientes de reactivar/reimplementar.
Leer antes de tocar chips del chat vacío o flujos relacionados.

---

## ⛔ FAB DEL MAPA (botón flotante que abre el mapa de la ruta) — DESACTIVADO 7 sept 2026

Paco pidió quitarlo hasta arreglarlo. Está oculto por dos sitios (a prueba de
"vuelve a salir mañana"):
- `app.js` `showState()` — la línea que lo mostraba está comentada, se fuerza `display:none`.
- `styles.css` — `#fab-map, #fab-diario { display:none !important; }`

### Bugs a arreglar antes de reactivar (mapa live `openLiveMap` + `selectRouteOnMap`)
- **Popup de una parada → botón "Cómo llegar": el enlace es correcto pero NO funciona
  al pulsarlo.** (URL bien formada, el click no navega / no abre.)
- Los botones del diario-picker (**i**, **I'm fine**, **Ir aquí**, **Guardar**, **Centrar**…)
  se comportan raro / no responden como deberían.
- Sensación de Paco: "ayer se quitaron funciones y hoy vuelven a estar". Revisar si otra
  sesión / un revert las reintroduce. El mapa live NO se tocó en el motor de carreteras
  (sección 0 dice "Mapa live: no tocado").

### Reactivar
`app.js`: descomentar la línea original en `showState`. `styles.css`: quitar la regla
`#fab-map, #fab-diario`. Y arreglar primero el "Cómo llegar" del popup y el picker.

---

## 0. MOTOR DE ROAD-TRIPS (carreteras con nombre) — Fase 1 + Fase 2 DESPLEGADAS (7 sept 2026)

**Fase 1** (resolver OSM + `/roads/resolve` + 18 geometrías en KV `ROAD_GEOM`): commits
`206a24c2` + `6d6da155`. **Fase 2** (worker adjunta `road_geometry`, los mapas pintan el
trazado real): commit `11cda25f`, worker Version `a2949fc4`, front `guide-renderer.js?v=48` /
`mapa-ruta.js?v=5` / `mapa-itinerario.js?v=49`. Todo en `main` y en producción.

**CONFIRMADO POR PACO 7 sept** ("muy bien pero que muy bien"): mapa incrustado sigue la N2, T2
ya no se queda mudo, enlace Google Maps no se desvía. Worker desplegado `1f70eedf-2293-4e47-badd-ba856c862e3c`,
front `guide-renderer.js?v=49` / `mapa-ruta.js?v=5` / `mapa-itinerario.js?v=50`, commits `e64e0fe2` + `f1720283`.
**Fase 1 + Fase 2 CERRADAS.**

**Frase para retomar:**
> "Motor de carreteras: `PENDIENTES.md` sección 0. Iterar Fase 2 / afinar."

### Lo que queda por pulir (siguiente iteración, NO bloquea)
- Path **Google Maps** de `mapa-ruta` sin probar en harness (sin API key) — código simétrico al Leaflet.
- **Chat libre** (ruta escrita a mano con evento `{draft}`): el parche solo-fotos no redibuja la
  carretera. El camino guiado T1→T2 (el normal) sí. Fix: `_updateMaps` redibuja si llega `road_geometry`.
- **Rutas >8 días** (pipeline gpt-4o-mini): sin `road_geometry`.
- **Mapa live** (`selectRouteOnMap`): no tocado.
- **Wild Atlantic Way** coge un fragmento de 9.8km (elegir superroute padre). Ampliar precarga con
  las ~10 que fallaron: `cd worker/roads; node precarga-roads.mjs --only=<slug>` y luego `--upload-only --kv`.
- **Tiles Leaflet rotos** (pre-existente, no de esto): `basemaps.cartocdn.com/dark_all` ahora pide
  API key → mapa en negro "API KEY REQUIRED" en el fallback. Cambiar a otro proveedor de tiles.

**Qué es:** enfoque B — geometría real de OSM para el trazado del mapa cuando el usuario nombra
una carretera ("sigue la N2", "Ruta 40", "Great Ocean Road"). NO toca la generación de paradas.
Diseño + aprendizajes + estado detallado: memoria `project_road_engine_fase1`.

**Cómo está montado:**
- `worker/roads/road-resolver.js` — motor: `resolveNamedRoad(input, {kv, cacheOnly, endpoints})`,
  `extractRoadQuery(msg, cc)` (léxico ~28 carreteras + refs con disparador), `stitch`, `toGeoJSON`,
  `toGPX`. `ROAD_LEXICON` lleva `slug`+`id` por carretera (mismo slug que `precarga-roads.mjs`).
- `worker/roads/precarga-roads.mjs` — siembra `ROAD_GEOM`. Rerun: `node precarga-roads.mjs --upload-only --kv`.
- `worker/salma-worker.js` — `import` + endpoint debug `GET /roads/resolve` (gate `?token=ADMIN_TOKEN`
  → **403 en prod** hasta reponer ese secret; nadie lo usa) + hook en la generación de ruta que
  adjunta `route.road_geometry`.
- `worker/wrangler.toml` — binding KV `ROAD_GEOM` (`39ff0d3316ab43d9b78f1f14b746e5ad`, 18 claves).
- Front: `guide-renderer.js` + `mapa-ruta.js` + `mapa-itinerario.js` pintan `road_geometry.coords`.

**Ojo:** `wrangler dev`/`deploy` SIEMPRE con `-c wrangler.toml` (o coge el `wrangler.jsonc` de la raíz y peta).

### Secrets del worker que faltan (perdidos en sept 2026, nunca repuestos)
`npx wrangler secret list -c wrangler.toml` (7 sept) devuelve solo 9: ANTHROPIC_API_KEY,
BRAVE_SEARCH_KEY, DUFFEL_ACCESS_TOKEN, ELEVENLABS_API_KEY, GOOGLE_PLACES_KEY, GOOGLE_TTS_KEY,
OPENAI_API_KEY, OPENWEATHER_KEY, RAPIDAPI_KEY.
**Faltan:** `ADMIN_TOKEN` (rompe `/health`, `/admin/*`, `/ga4`, `/roads/resolve` → todos 403),
`SERPER_API_KEY` (búsqueda de eventos), `STRIPE_SECRET_KEY` (pagos), `TWILIO_ACCOUNT_SID` /
`TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` (SOS SMS), `GA4_CREDENTIALS` (analytics admin).
Reponer con `npx wrangler secret put NOMBRE -c wrangler.toml`. `ADMIN_TOKEN` es una cadena
que eliges tú (la misma que uses en el panel admin). CLAUDE.md sección 5 tiene el detalle.

---

## 1. Chip "Quiero ir a..." — desactivado 2026-04-17

**Estado**: chip retirado de la UI. Handler intacto en [app.js](app.js) (aprox. línea 292).

**Qué hacía**:
- Aparecía como primer chip en la columna izquierda del chat vacío.
- Al pulsar, prellenaba el input con `"Quiero ir a "` y ponía foco.
- Servía como trigger para que Salma interpretase "quiero ir a {país}" y disparase flujo de planificación / info de país.

**Por qué se quitó**:
- Decisión de Paco 2026-04-17 — aprovechar la limpieza de chips al añadir "Cambio moneda".
- Hay errores previos documentados en memoria (`feedback_goto_errores.md`): no interceptar ciudades, no usar Haiku, no Brave raw, verificar deploys.

**Cómo reactivar**:
1. Restaurar línea en el array `chipsLeft` de `renderChatEmpty()` en [app.js](app.js) (aprox. línea 231-239):
   ```js
   { label: 'Quiero ir a...', icon: _ci('<circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>'), msg: null, action: 'goto' },
   ```
2. Verificar que el handler `if (action === 'goto')` sigue haciendo lo correcto (prellenar input).
3. Considerar reimplementación server-side en Worker: flujo `go_to` SOLO para países (no ciudades), sin Haiku, sin Brave raw. Leer `project_pendiente_goto.md` en memoria.

---

## 2. Chip "Explorar zona" (narrador) — desactivado 2026-04-17

**Estado**: chip retirado de la UI. Handler intacto en [app.js](app.js) (aprox. línea 268-280). Lógica del narrador sigue activa en [salma.js](salma.js) (`startNarrator`, `stopNarrator`, `_narratorActive`, `showNarratorToast`).

**Qué hacía**:
- Toggle del narrador en tiempo real.
- Si el narrador estaba activo → `salma.stopNarrator()` + toast "Narrador desactivado".
- Si no → `salma.startNarrator()` + pedir permisos de notificaciones y ubicación.
- Narrador avisa al usuario cuando está cerca de POIs con historia (radio 500m, check cada 30s).

**Por qué se quitó**:
- Decisión de Paco 2026-04-17.
- El narrador sigue configurable desde el perfil — no se rompe funcionalidad, solo se retira el acceso rápido desde el chat vacío.

**Cómo reactivar**:
1. Restaurar línea en el array `chipsRight` de `renderChatEmpty()` en [app.js](app.js) (aprox. línea 240-245):
   ```js
   { label: 'Explorar zona', icon: _ci('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'), msg: null, action: 'explorar' },
   ```
2. El handler ya existe y sigue funcional.
3. Verificar que `salma._narratorActive`, `salma.startNarrator()`, `salma.stopNarrator()` y `salma.showNarratorToast()` siguen disponibles.

---

## Notas

- **Handlers NO se borraron** — quedan huérfanos sin su chip pero funcionales. Si pasa mucho tiempo sin reactivar, evaluar si borrar también los handlers para limpiar código muerto.
- **Lógica del narrador** sigue activa en todo el proyecto: permisos, push notifications, check de POIs cada 30s, TTS. Solo se retiró el atajo de UI.
- **Cambios realizados en**: [app.js:231](app.js#L231) (chipsLeft) y [app.js:240](app.js#L240) (chipsRight).

---

## 3. Rutas — flujo en 2 tiempos (PIEZA A) — 5 sept 2026 (noche)

**Frase para retomar en la próxima sesión de Claude:**
> "Retomamos las rutas. Lee `PENDIENTES.md` sección 3 y la memoria `project_pieza_a_2tiempos`."

### YA HECHO y funcionando (no volver a tocar salvo que rompa)
- **Flujo guiado (chip "Crear ruta nueva" → 8 preguntas) en 2 tiempos**:
  - Tiempo 1: se piden **recomendaciones en prosa por días** (sin mapa) + botón **"🗺️ Crear ruta con mapa"**.
  - Tiempo 2: el botón monta la guía a partir de ese texto, **sin regenerar** y **sin repetir el texto**.
- **Enrich (2ª llamada de IA GPT-4o-mini) eliminado** del front. Endpoint `/enrich` del worker queda inerte → borrarlo en su momento.
- **Caché KV de rutas apagada** (`_CACHE_SHORTCIRCUIT_ENABLED = false` en worker) — servía rutas viejas sin verificar.
- Estado: `main` `20fcf2e8`, worker `18e43a69`, front `salma:55` / `app:60`.
- Ficheros tocados: `salma.js` (`_rutaFinalizar`, `_offerCrearRutaConMapa`, `_doSend`), `app.js` (fuera `enrichGuia`), `worker/salma-worker.js` (`guidedIsReco` / `guidedMapStage`, `convertProseToRouteJson`, gates de `longRoute` / caché / rescates).

### PROGRESO 6 sept 2026 (sesión Claude) — worker en `f2ca6a48`

- **#1 Destino sin país — ARREGLADO y CONFIRMADO** (Córdoba + Toledo salen en España,
  dentro de su provincia). `resolverPaisDestino()` en el worker. Se enhebra en
  `buildMessages`, `convertProseToRouteJson` y `verifyAllStops` (`forceCountryCode`).
- **#2/#3-coords "la ruta se iba a Portugal/Madrid/Palma" — ARREGLADO y CONFIRMADO.**
  `verifyAllStops` con `pointAnchor` (destino = ciudad → `pointScope=true`): sesga las
  búsquedas de Places por el **ancla** (no por las coords del modelo) y **descarta**
  paradas a >120 km. Caché KV `geocity:anchor4:` (TTL 1 día — **subir a 30d al terminar**).
- **ROOT CAUSE de las 3 h de vueltas:** `resolverPaisDestino` usaba la **Geocoding API**
  de Google. La `GOOGLE_PLACES_KEY` NO está habilitada para Geocoding (sí para Places)
  → `/geocode/json` devolvía `REQUEST_DENIED` en silencio → `anchorCountry = null` →
  **todo el anclaje + ceñido + no-borrador se saltaba**. Fix: `resolverPaisDestino` usa
  ahora `findplacefromtext` + Place Details (Places API). *(La `geocodeCiudad` que ya
  existía tiene el mismo problema latente — cae a `userCoords` y nadie lo notó.)*
- **Bug colateral — el botón "Crear ruta con mapa" daba HTTP 400 SIEMPRE.**
  `claude-sonnet-4-6` no admite prefill de assistant. Quitado de los 2 sitios +
  `parseModelRouteJson()`. Arreglado.
- **El front pinta el borrador PRE-verify y luego solo parchea fotos** (nunca quita/mueve
  marcadores). Fix worker: en `guidedMapStage` o con ancla NO se manda el evento `{draft}`,
  la ruta va una sola vez ya verificada.
- Nota menor: el chip de duración es un rango "5-7 días" → que salgan 6 no es bug.

### ⚠️ DIAGNÓSTICO TEMPORAL VIVO — QUITAR AL TERMINAR CON GUÍAS (Paco lo deja a propósito)
`worker/salma-worker.js`:
- `let _convertFailReason` + bloque `if (!fallbackRes.ok)` ampliado en `convertProseToRouteJson`
  + sufijo `\n\n(motivo: …)` en el `_msg` de `map_stage_failed`.
- `let _anchorDbg` en el handler + bloque `[dbg …]` que se **prepende a `route.title`** Y se
  manda como `route._dbg` tras PASO 3. Formato actual:
  `[dbg A:ES loc:"Gaucín" ps:T 36.52,-5.32 d1/r35 src:hint used:"GAUCIN" fp 4ok/2desc/1near]`.
- `salma.js` (v57): burbuja `🔧 ` + `data.route._dbg` en la rama `if (data.route && data.route.stops)`.
- `console.log('[ANCLA] …')` en `resolverPaisDestino`, `console.log('[ANCLA-PAIS] src=… …')` en el
  handler, `console.log('[VERIFY] … ↪ CERCA …')`.
- Al quitar: subir `geocity:anchor5` TTL de 86400 a 2592000 (línea ~4453 de `resolverPaisDestino`).

### MOTOR DE RUTAS — los 3 fallos CERRADOS (ver detalle más abajo)
- #1 país del destino ✅ · #2 excursiones lejanas ✅ (prompt + filtro provincia + bias 22km)
  · #3 crash Leaflet ✅ (blindado). Queda solo la verificación en uso de Paco.

### HECHO 6 sept — mejoras de UI de la guía + flujo único
- **#4** enlaces de Maps fuera de las recomendaciones del Tiempo 1 (worker `d975c04a`). ✓
- **Botón cerrar ✕** arriba-izq del mapa, visible en desktop (antes solo móvil). ✓
- **"Leer más"** en la descripción de la parada (3 líneas + toggle). El conversor deja de
  resumir `narrative` a "1-2 frases" → descripción completa (~600 ch). ✓
- **Un solo "🗺️ Cómo llegar"** por parada (card + popup del marcador). No exige `place_id`
  (place_id → coords → nombre). Botón "ruta completa" (barra superior) también sin exigir place_id. ✓
- **FLUJO ÚNICO** (`3faa7071`): TODA petición de ruta/destino escrita en el chat pasa por
  el Tiempo 1 (recomendaciones + botón), igual que el chip de 8 preguntas. El Tiempo 1
  ya NUNCA produce mapa (RESCATE 1/2 y `extractRouteFromReply` gateados con `guidedIsReco`).
  Worker manda `offer_map_button`; front lo usa. `salma.js?v=56`, worker `3faa7071`.
  **Pendiente verificar por Paco.**

### HECHO 6 sept (tarde) — ceñido fino + flujo único confirmado
- **Flujo único CONFIRMADO** por Paco: "3 días Ciudad Real", "estepona un día", chip →
  todos dan descripción + botón, sin mapa directo. `salma.js?v=57`.
- **`dest_hint` del front** (`_cleanDestino` en salma.js): "3 días Ciudad Real" → "Ciudad Real".
  Se manda en todo envío de ruta. El worker lo usa para el ancla ANTES de `extractHelpLocation`
  (que fallaba con destinos de 2+ palabras → ancla `A:NULL` → radio dinámico → paradas en Madrid).
- **`_editingRoute`** ahora exige que el mensaje suene a retoque (quita/añade/cambia). Un destino
  nuevo con una ruta abierta ya NO se trata como edición (antes disparaba guía directa sin T1).
- **Radio del ancla por días**: `MAX_ANCHOR_KM` = 35 (1d) / 70 (2d) / 120 (3-4d) / 160 (5+).
- **Filtro por LOCALIDAD** (`resolverPaisDestino` devuelve `locality`; verify): destino de punto
  + 1-2 días → parada "en el pueblo" si `verified_address` menciona la localidad del ancla, o
  (sin dirección) <8 km, o <5 km. El resto → `route.nearby_stops` (NO se borra). Si quedan <2
  en el pueblo → se revierte. Confirmado con "Gaucín un día": `4ok/2desc/1near`.
- **`[MODO RECOMENDACIONES]`**: "1-2 días en una ciudad → todo dentro de la localidad, nada de
  rutas comarcales salvo que se pida *ruta*".
- Estado: `main` `1fa16374`. Cache key `geocity:anchor4` → `anchor5` (ahora guarda localidad).

### PENDIENTE de esto
- ~~Pintar `route.nearby_stops` en la guía~~ ✅ HECHO (`af0d89b6`), **pendiente verificar Paco**.
  `guideRenderer._renderNearby()` (helper compartido), usado por la vista itinerario y por
  guide-renderer. Worker manda `route.anchor_locality`. Front: `guide-renderer.js?v=46`,
  `mapa-itinerario.js?v=47`, `styles.css?v=52`.
- ~~Fotos en el Tiempo 1 del chip~~ ✅ HECHO y confirmado (`53577759`).
- ~~Fallo #3 (Leaflet crash "reading 'min'")~~ ✅ BLINDADO (`c5f337cd`). Los fitBounds ya
  filtraban lista vacía pero NO una coord imposible (lat 999, lat/lng cambiados).
  `_getValidStops` / `_validStops` ahora exigen número finito + rango; los 8 `fitBounds`
  van con `isValid()` + try/catch (`_safeFit` en guide-renderer). `guide-renderer.js?v=47`,
  `mapa-ruta.js?v=3`. **No repro conocido con coords sanas — es red de seguridad.**
- ~~Fallo #2 (excursiones lejanas en el prompt)~~ ✅ HECHO (`74c9281d`). `[MODO RECOMENDACIONES]`
  ahora gradúa el radio por días: 3-4d = 1 excursión media jornada <45min marcada como opcional;
  5+d = 1-2 excursiones <1h, prioriza barrios/museos/vida local, nunca 2 provincias; si la
  ciudad se queda corta → menos días o más profundidad, no rellenar con pueblos lejanos.
  **Pendiente verificar Paco** con "Córdoba 7 días" (no debe meter Sevilla/Granada).

### PENDIENTE GRANDE — Replantear el sistema de HISTORIA (6 sept, Paco)
Paco quiere que "Historia" sea una **parte relevante e integrada**, no un módulo aparte:
que viva dentro de las guías y rutas Y en el botón/pestaña Historia, coherente.

**Cómo está hoy (`historia.js`, 539 líneas, módulo IIFE `historiaModule`):**
- Contenido: un array `HISTORIAS` **hardcoded** (solo demo Vietnam, ~6 paradas por año con
  imágenes de Unsplash) + búsqueda en vivo contra el endpoint del worker **`/historia-lugar`**
  (POST) que genera la historia de un lugar al vuelo. Flujo: lista → detalle → paradas con
  narración TTS (`_narrar`, Web Speech).
- API pública: `historiaModule.render()` y `historiaModule.loadPlace(place)`.
- Puntos de entrada dispersos:
  - Pestaña inferior "Historia" → `showState('historia')` → `historiaModule.render()` (app.js:213, :91).
  - Botón "📚 Historia" en cada tarjeta de Mis Viajes → `loadPlace(destino)` (app.js:2030-2040).
  - Botón flotante 📚 (app.js:3298-3320) → `loadPlace(place)`.
  - Chip "📚 Historia de {destino}" tras generar una ruta (salma.js:1417-1425).
- CSS propio: `historia.css` (`?v=2`).
- NO está conectado con la guía en sí: la guía no muestra historia por parada, ni la
  historia enlaza con las paradas del mapa. Son dos mundos.

**Objetivo a decidir con Paco:**
- ¿La historia se genera junto con la ruta (una pasada más del worker) y se guarda con la guía?
- ¿Historia por PARADA (contexto del sitio) vs historia del DESTINO (relato largo)? ¿las dos?
- ¿La pestaña Historia pasa a ser "biblioteca" de lo generado en tus viajes + búsqueda libre?
- Quitar el `HISTORIAS` hardcoded (demo Vietnam) o dejarlo como ejemplo destacado.
- Reunificar los 4 puntos de entrada en un flujo coherente.
- Coste: `/historia-lugar` ya existe — medir tokens reales antes de meterlo en cada ruta.

### PENDIENTE GRANDE — Historial de conversación persistente (6 sept, Paco)
Al navegar hacia atrás (botón atrás del móvil / bottom-bar) **se pierde toda la conversación
del chat**. Paco quiere que Salma tenga un historial que sobreviva a la navegación y a cerrar
la app — "como tú, que tienes historial".
- Hoy: `salma.history` en memoria + `_saveSession()` a `sessionStorage` (se borra al cerrar
  pestaña). `nav-history.js` envuelve `showState` pero no restaura el chat.
- Objetivo: persistir turnos (usuario + Salma) en Firestore por `uid` (`users/{uid}/chat_log`
  o similar) o al menos `localStorage`, y **restaurar el chat al volver**. Decidir: ¿historial
  único continuo, o por "sesiones/conversaciones" con lista tipo ChatGPT?
- Ojo: hoy la history se **vacía a propósito** tras generar una guía (`this.history = []`).
  Eso habría que repensarlo si el chat pasa a ser persistente.

### DESACTIVADO 6 sept — botón "IR AL MAPA" del preview del itinerario
`mapaRuta._renderGoToMapButton()` hace `return` al principio (mapa-ruta.js). El botón salía
sobre el mapa de la vista itinerario y abría el **mapa live**, que es donde vive TODO el set
de herramientas que se está construyendo y aún no está listo para enseñar:
**I'M FINE, IR AQUÍ, GUARDAR, añadir fotos, CENTRAR, TIPO, CAPAS, SOS, buscar lugar** (+ voz).
Reactivar = quitar el `return`. Cuando esas herramientas estén, se reactiva.

### HECHO 6 sept — chip "Buscar Alojamiento" reañadido
`_renderChatEmpty()` en app.js — chip **"Buscar Alojamiento"** (`msg: 'Busca alojamiento'`,
lo pilla el regex de hotel del worker) en `chipsLeft`, debajo de "Alerta vuelos". `app.js?v=62`.

### Menores
- La **última foto de todas las guías es siempre la misma** (paisaje genérico). Relacionado:
  el inyector de fotos del worker cogía la negrita del cierre ("Crear ruta con mapa") como si
  fuera un lugar → foto de montaña genérica. Excluido 6 sept (`a9b6fdcd`+). Revisar si aún
  pasa con otros cierres.
- El **chat libre** ("3 días Córdoba" escrito a mano) sigue yendo directo al mapa. Unificarlo con el flujo de 2 tiempos = "paso 1b": reusar `guided_stage:'reco'` disparado desde el front para mensajes de ruta sin la frase "hazme una guía". ~15-25 líneas de front, 0 worker. Pendiente OK de Paco.

### Por dónde empezar
Los 3 fallos grandes solapan con la **Pieza B/C** (grounding real: web_search + geometría de carretera Overpass + verificación dura) descrita en la memoria `project_motor_rutas_websearch`. Orden sugerido: (1) anclar el país del destino, (2) limitar el radio de la ruta a la ciudad pedida, (3) el render/solapamiento. Antes de dar el solapamiento por bug de código: comprobar que Paco no tiene la app abierta en varias pestañas/dispositivos.
