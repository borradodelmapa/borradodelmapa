# PENDIENTES — Borrado del Mapa

Registro de features desactivadas o pendientes de reactivar/reimplementar.
Leer antes de tocar chips del chat vacío o flujos relacionados.

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

### PENDIENTE — fallos de MOTOR DE RUTAS
2. **La ruta se sale de la ciudad — tuneo de PROMPT** (ya no de coords). El texto del T1
   a veces mete excursiones lejanas cuando el destino lleva muchos días. El ceñido de verify
   ya las descarta (`Ndesc` en el `[dbg]`), pero mejor que el modelo no las proponga.
3. **Render / solapamiento.** `Cannot read properties of undefined (reading 'min')` en Leaflet
   desde `guide-renderer.js:836` (bounds nulos por lat/lng mezclados/vacíos). "Carga una guía
   vieja y en un segundo sube otra" = dos renders. Revisar ahora que las coords ya son sanas.

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
- Verificar el fallo #2 (excursiones lejanas en el prompt) y #3 (Leaflet `guide-renderer.js:836`)
  ahora que las coords son sanas.

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

### Menores
- La **última foto de todas las guías es siempre la misma** (paisaje genérico).
- El **chat libre** ("3 días Córdoba" escrito a mano) sigue yendo directo al mapa. Unificarlo con el flujo de 2 tiempos = "paso 1b": reusar `guided_stage:'reco'` disparado desde el front para mensajes de ruta sin la frase "hazme una guía". ~15-25 líneas de front, 0 worker. Pendiente OK de Paco.

### Por dónde empezar
Los 3 fallos grandes solapan con la **Pieza B/C** (grounding real: web_search + geometría de carretera Overpass + verificación dura) descrita en la memoria `project_motor_rutas_websearch`. Orden sugerido: (1) anclar el país del destino, (2) limitar el radio de la ruta a la ciudad pedida, (3) el render/solapamiento. Antes de dar el solapamiento por bug de código: comprobar que Paco no tiene la app abierta en varias pestañas/dispositivos.
