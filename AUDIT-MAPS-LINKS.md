# AUDITORÍA — Links de Google Maps en Salma

**Fecha:** 30 agosto 2026
**Alcance:** los 4 puntos del briefing + rutas KV cacheadas (punto nuevo).
**Estado:** SOLO auditoría. No se ha tocado código. Pendiente OK de Paco para Parte 2 (Bloque E) y Parte 3 (logging).

---

## 0. Resumen ejecutivo

- **El camino "ruta verificada" está razonablemente blindado ya.** Tras `verifyAllStops()` toda parada
  tiene `place_id` real de Google Places, `lat/lng` reales, y `maps_links` regenerados server-side
  desde paradas validadas (`buildMapsLinksFromStops`). El frontend (guide-renderer, mapa-itinerario,
  mapa-ruta) aplica "regla única": sin `place_id` → no pinta enlace.
- **El flujo guiado nuevo (8 preguntas) NO tiene generador propio de links.** Reutiliza exactamente
  el mismo pipeline: `SALMA_SYSTEM_ROUTE` → `extractRouteFromReply` → `verifyAllStops` →
  `buildMapsLinksFromStops`. Lo único que añade es contexto en el prompt. Si el validador entra
  en ese pipeline, cubre el flujo guiado sin trabajo extra.
- **El Narrador NO tiene el bug.** Usa datos reales de Google Places (`/nearby-pois` → nearbysearch)
  de punta a punta. No hay coordenadas inventadas por LLM en ningún punto del narrador.
- **Dónde SÍ se cuelan links malos (3 huecos reales):**
  1. **Chat libre** — `sanitizeInventedUrls` (worker) y `sanitizeUrls` (frontend, `app.js`) dejan
     pasar **cualquier** URL que contenga `google.com/maps` sin validar. `injectVerifiedMapsLinks`
     solo limpia 3 patrones (`/maps/search/`, `/maps/dir/`, `/maps/place/`) y puede caducar a los 8 s
     (`catch` vacío → pasa el texto crudo de Claude).
  2. **Rutas servidas desde KV cacheada** (`route:{cc}:{dest}:{days}`, incluye nivel 3 del cron
     GPT-4o-mini) — se emiten al frontend **sin re-verificar** y **sin regenerar `maps_links`**.
     Las nivel 3 no tienen `place_id` (0 en los JSON) y el prompt del cron pide literalmente
     `maps_links:[{"url":"https://www.google.com/maps/dir/PuntoA/PuntoB"}]` (nombres sin encodear
     en el path = enlace roto).
  3. **Rutas guardadas en Firestore y re-renderizadas** (Mis Viajes + guía compartida en `404.html`) —
     `guide-renderer._renderDays` confía ciegamente en `route.maps_links` (`href="${dayLink.url}"`,
     sin validación). Lo que se guardó, se pinta. Si se guardó una ruta con verify fallido o desde
     KV, arrastra los links malos (o ninguno) para siempre.
- **Punto de fallo NUEVO respecto al diagnóstico original:** el **hueco #2 (KV cacheada / nivel 3)**.
  El diagnóstico previo hablaba de "paradas sin verificar con coords inventadas" en el momento de
  generación, pero no de que una ruta cacheada se sirva tal cual meses después sin pasar de nuevo
  por verify.

---

## 1. Tabla — los 4 puntos auditados

| # | Punto | ¿Genera links Maps? | Origen de coords/nombres | ¿Validación hoy? | Archivo(s):línea(s) |
|---|-------|--------------------|--------------------------|------------------|---------------------|
| 1 | **Flujo ruta guiada** (8 preguntas → ruta final) | Sí | LLM (Sonnet) genera `stops[].lat/lng` + nombres → **corregidos por `verifyAllStops`** con Google Places (place_id + coords reales). `maps_links` regenerados server-side. | **Sí** — `verifyAllStops` descarta parada sin `place_id`; `buildMapsLinksFromStops` solo usa validadas; frontend exige `place_id`. Hueco: si `verifyAllStops` lanza excepción (`catch` vacío), la ruta se emite/cachea sin verificar. | `worker/salma-worker.js`: contexto guiado `2444-2445`, `2492-2514`; parse `2751-2799` (`route.maps_links=[]` en `2793`); verify `3082-3281`; `buildMapsLinksFromStops` `3377-3407`; emit draft/verify/done `7807-7845`, `7866`. Frontend: `guide-renderer.js:494-517` (`_stopGmapsUrl`/`_dayGmapsUrl`/`_fullRouteGmapsUrl`), `_renderDays` `214-235`; `mapa-itinerario.js:171-173`, `363-371`. |
| 2 | **Chat libre** (p.ej. "restaurantes cerca de X") | Sí | Dos vías: (a) `injectVerifiedMapsLinks` valida nombres en **negrita** con `getValidatedPlace` (Google Places) e inyecta `dir/?api=1&destination_place_id=…` — válido; (b) **texto libre de Claude** con URLs de Maps inventadas. | **Parcial / con huecos.** `injectVerifiedMapsLinks` limpia solo `/maps/search/`, `/maps/dir/`, `/maps/place/` (`1133-1135`) y re-inyecta validadas; timeout 8 s con `catch{}` vacío (`7688-7692`). `sanitizeInventedUrls` (`2809-2815`) y `sanitizeUrls` frontend (`app.js:5410-5445`) hacen **passthrough** de todo `google.com/maps`. Markdown `[txt](url)` en frontend **no** se filtra (`app.js:5468-5474`). Tools (`buscar_lugar`/`buscar_hotel`) sí devuelven `maps_link` con `place_id` real o `null` (`3831-3836`, `3934-3936`, `4282`, `4317`). | `worker/salma-worker.js`: `injectVerifiedMapsLinks` `1119-1161`; `sanitizeInventedUrls` `2809-2860`; llamada en chat `7673-7726`; ruta completa trailing `1153-1157`; fallback `7695-7724`; transporte `7238-7247` (`dir/?api=1` con coords de textsearch real). Frontend: `app.js` `sanitizeUrls` `5410-5456`, `formatMessage` `5458-5505`; `salma.js:2351`, `1458`, `1695`. |
| 3 | **Narrador / navegación en tiempo real** | Sí (marginal) | **Google Places reales.** `/nearby-pois` = `nearbysearch` de Google → `place_id`, `lat`, `lng`, `maps_link` reales. `/narrate` solo genera prosa (0 URLs). `/directions` = proxy Directions API en vivo (polyline para mini-mapa, no es link de usuario). | **No necesita validación.** Ningún punto usa coords de LLM. El único link de usuario es `place/?q=place_id:…` con id real, o fallback `search/?api=1&query=lat,lng` con lat/lng de la propia respuesta de Google. | `worker/salma-worker.js`: `/nearby-pois` `5336-5383` (`maps_link` en `1668`), `/narrate` `5384-5430`, `/directions` `5108-5140`. Frontend: `salma.js` `checkNearbyPOIs` `1939-2005`, `showNarratorToast` `1914-1927` (link en `1921-1922`). |
| 4 | **Resumen post-viaje / viaje compartido** | Casi no | "Resumen post-viaje" hoy es solo una línea de coste en el modal de coins (`app.js:3023`), no genera documento con links. **Viaje compartido** = `404.html` renderiza `public_guides/{slug}` con `guideRenderer.render(JSON.parse(itinerarioIA))` → mismos enlaces que la guía normal, **a partir de lo guardado en Firestore, sin re-verificar**. "Mi Diario" (`bitacora-renderer`) comparte imágenes IG + enlace a la URL pública; **no embebe URLs de Google Maps** (usa mapas Leaflet/Google en vivo). Vídeo (`video-player`) usa `/staticmap` proxy, no links clicables. | **No, salvo lo heredado.** `guide-renderer._renderDays` (`214-235`) pinta `route.maps_links[].url` sin validar. Si el JSON guardado trae links malos, se sirven tal cual, indefinidamente. | `404.html:127,150,173,210`; `guide-renderer.js:77,214-235`; `bitacora-renderer.js:549-585` (share, sin Maps); `video-player.js:1103-1116`; `app.js:3023`. |

---

## 2. Diagnóstico previo — los 6 puntos de fallo, revisados

> No he encontrado `BRIEFING-DIAGNOSTICO-MAPS` ni `BRIEFING-FLUJO-RUTA-GUIADA.md` en el repo
> (ni en worktrees, ramas, stash). Reconstruyo desde el código y el commit `50e21462`.

| Punto de fallo del diagnóstico | ¿Sigue vivo? | Dónde |
|-------------------------------|--------------|-------|
| 1. Links de fallback construidos solo con el nombre del lugar (sin coords reales) | **Parcial.** El runtime ya no lo hace en rutas (usa `place_id`/`lat,lng` validados). Sigue vivo en: `buscar_lugar`/`buscar_hotel` cuando no hay `place_id` → `maps/search/?api=1&query=NOMBRE+CIUDAD` (`3833`, `3936`); y KV nivel 3 `maps/dir/PuntoA/PuntoB`. | `worker` `3831-3836`, `3934-3936`; `worker/kv/generate-nivel3.js:41` |
| 2. Paradas sin verificar con coords inventadas por el LLM | **Vivo en 2 escenarios:** (a) `verifyAllStops` lanza excepción → `catch{}` vacío mantiene coords LLM (`2960-2962`, `7844`); (b) ruta cacheada en KV servida directa sin re-verificar (`7085-7093`). En camino feliz, no: las paradas sin `place_id` se descartan (`3224-3239`). | `worker` `2958-2962`, `7838-7845`, `7085-7093` |
| 3. URLs generadas por Claude pasadas al frontend sin validación | **Vivo en chat libre.** `sanitizeInventedUrls` (worker) y `sanitizeUrls` (frontend) hacen allow-list por substring `google.com/maps` → passthrough total. Markdown `[txt](url)` del frontend ni se filtra. | `worker` `2815`; `app.js` `5414`, `5441-5443`, `5468-5474` |
| 4. (no documentado — hipótesis) `maps_links` del modelo usados tal cual | **Mitigado en runtime** (`route.maps_links=[]` en parse, `2793`; se regeneran en verify). **Vivo** para rutas que vienen de KV o de Firestore ya guardadas: `guide-renderer._renderDays` confía en `route.maps_links`. | `worker` `2793`, `3276`, `3029`; `guide-renderer.js:218-235` |
| 5. (no documentado — hipótesis) Formato `/maps/dir/place_id:X/place_id:Y` que Google no resuelve | **Ya conocido y evitado** en el código actual (comentarios `1151`, `3376`, `505`): se usa `lat,lng` en el path de `/dir/`. Riesgo residual: enlaces `/dir/` largos con muchos `lat,lng` sin `?api=1` a veces Google los abre como búsqueda. | `worker` `1150-1157`, `3400-3403`; `guide-renderer.js:505-516` |
| 6. (no documentado — hipótesis) Timeout / rate-limit de Places deja la ruta a medias | **Vivo.** `injectVerifiedMapsLinks` timeout 8 s (`7690`), `verifyAllStops` sin timeout global pero con `catch{}` que preserva lo no verificado, y luego **se cachea en KV** (`7847-7862`) — el fallo se propaga a futuras peticiones. | `worker` `7688-7692`, `7847-7862` |

---

## 3. Preguntas del briefing — respuestas directas

**¿El flujo guiado usa el mismo generador de paradas que el resto?**
**Sí, exactamente el mismo.** `guidedRoute` solo fuerza `isRoute = true` y añade un bloque de
contexto al prompt (`2444-2514`). A partir de ahí: idéntico `SALMA_SYSTEM_ROUTE` →
`extractRouteFromReply` → `verifyAllStops` → `buildMapsLinksFromStops` → mismos eventos SSE
(`draft`/`done`) → mismo `guideRenderer`. No hay ni una línea de construcción de links específica
del flujo guiado.

**¿Hay algún punto de fallo NUEVO no cubierto en el diagnóstico original?**
Sí: **rutas servidas desde KV cacheada** (`route:{cc}:{dest}:{days}`, tanto el auto-cache al
generar como las nivel 3 del cron GPT-4o-mini). Se entregan al frontend sin volver a pasar por
`verifyAllStops` ni por `buildMapsLinksFromStops`. Las nivel 3 no llevan `place_id` y su prompt
pide `maps_links` con nombres literales en el path. Es el escenario más probable de "links con
coordenadas inventadas" que ve Paco, porque afecta a destinos populares (los que están cacheados)
y persiste 30 días por entrada.

**Segundo hallazgo transversal:** el punto real de inyección de links malos en chat libre no es
el LLM directamente, sino que **las dos funciones de saneo (`sanitizeInventedUrls` en worker y
`sanitizeUrls` en `app.js`) tienen `google.com/maps` en la allow-list por substring**. Cualquier
URL de Maps que Claude escriba y que `injectVerifiedMapsLinks` no alcance a limpiar (otro patrón,
o timeout) llega al usuario como enlace clicable.

---

## 4. Propuesta de arquitectura

**Recomendación: UNA función centralizada de validación en el Worker, reutilizable, + un guard
mínimo en frontend.** La lógica de "¿esta URL de Maps resuelve?" y "¿estas coords son válidas?"
es idéntica venga de donde venga. Interceptores separados multiplicarían el mismo código y se
desincronizarían.

### 4.1 Función central (Worker) — `validarYCorregirLinksMaps(payload, opts)`

- **Entrada:** o un objeto `route` (usa `stops[]` + `maps_links[]`), o un `string` de texto de chat.
- **Paso 1 — validación de coordenadas (sin red, instantáneo):** por cada URL con `lat,lng` o
  `?query=lat,lng` o `q=lat,lng`, comprobar `-90 ≤ lat ≤ 90`, `-180 ≤ lng ≤ 180`, no `NaN`,
  no `0,0`. Fallo → sustituir por `https://www.google.com/maps/search/?api=1&query=` +
  `encodeURIComponent(nombre_parada)` → `reason: "invalid_coordinates"`.
- **Paso 2 — HEAD en paralelo:** `Promise.allSettled` con `AbortSignal.timeout(3000)` por URL.
  Solo sobre las que pasaron el paso 1. Estado `>= 400`, timeout o error de red → sustituir por
  el link de búsqueda por nombre → `reason: "404" | "timeout" | "other"`.
  - Nota: `www.google.com/maps` responde a HEAD con 200/3xx casi siempre aunque el pin sea malo;
    el HEAD detecta 404/DNS/red, no "pin equivocado". El paso 1 (coords) es el que más aporta.
  - Límite de subrequests de Cloudflare (~50/invocación 6, ~1000 plan 5). Cap defensivo:
    máx ~15 HEAD por llamada; el resto solo validación de coords.
- **Paso 3 — logging:** por cada sustitución, un doc en `url_validation_incidents` (Parte 3),
  vía `ctx.waitUntil` para no bloquear la respuesta.
- **Salida:** el mismo tipo que entró (route con `maps_links`/`stops` corregidos, o string).
- **Presupuesto de tiempo:** un solo `Promise.allSettled` con timeout 3 s ⇒ peor caso +3 s.
  Objetivo del briefing (+1–2 s) se cumple si la mayoría de URLs resuelven rápido (<500 ms).

### 4.2 Puntos de enganche (según auditoría)

| Punto | ¿Enganchar? | Dónde exactamente |
|-------|-------------|-------------------|
| Ruta final (guiada o no), evento `done` | **Sí** | `worker` justo antes de construir `doneEvt` (`~7865`), sobre `route`. |
| Ruta por bloques, `mergeBlocks` | **Sí** | tras `mergeBlocks` (`~3021-3037`) / antes del `done` de bloques. |
| Ruta servida desde KV cacheada | **Sí (nuevo)** | `worker` `~7085-7093`, antes de emitir `kvCachedRoute`. Es el hueco #2. |
| Chat libre, antes de enviar `reply` | **Sí** | `worker` tras `injectVerifiedMapsLinks` y el fallback (`~7726`), sobre el string `reply`. Además **quitar `google.com/maps` del passthrough** en `sanitizeInventedUrls` para forzar que solo sobrevivan las URLs que pasen el validador. |
| `404.html` / guía guardada (Firestore) | **Indirecto** | No se puede validar en el Worker (render 100% cliente). Opción A: validar al **guardar** la guía (pasa por el Worker). Opción B: guard mínimo en `guide-renderer._renderDays` que descarte `maps_links[].url` con lat/lng fuera de rango. Recomiendo A + B. |
| Narrador | **No** | Documentado: 100% Google Places en vivo, sin coords de LLM. Añadirlo sería riesgo sobre código que funciona. |
| Frontend `sanitizeUrls` (`app.js:5410`) | **Guard mínimo** | Rechazar `google.com/maps/...@lat,lng` / `?q=lat,lng` / `query=lat,lng` con lat/lng fuera de rango. Barato, sin red, cubre el markdown `[txt](url)` que hoy ni se filtra. |

### 4.3 Lo que NO se toca (respetando restricciones del briefing)

- Las 8 preguntas del flujo guiado.
- La generación Pass 1 (Sonnet) / Pass 2 (Haiki/GPT) — solo se interceptan URLs de salida.
- `buscar_vuelos`, `buscar_hotel`, `buscar_coche`, `buscar_lugar` — sus `maps_link` ya salen con
  `place_id` real o `null`; el validador los tolera (un `null` no es una URL).
- `verifyAllStops` y `buildMapsLinksFromStops` — se dejan como están; el validador va **después**,
  como red de seguridad.

---

## 5. Riesgos / impacto (para decidir)

| Cambio | Riesgo | Mitigación |
|--------|--------|------------|
| Quitar `google.com/maps` del passthrough en `sanitizeInventedUrls` | Si el validador tiene un falso negativo, se pierde un link bueno en chat libre | El validador solo sustituye por búsqueda-por-nombre (nunca borra); mantener `injectVerifiedMapsLinks` como está |
| HEAD requests extra | +latencia; consumo de subrequests Cloudflare | timeout 3 s, `allSettled`, cap 15 HEAD/llamada, resto solo validación de coords (0 red) |
| Enganche en KV cacheada | Añade coste a un camino que hoy es "coste 0" | Validación de coords es local; HEAD solo si hay `maps_links` con formato dudoso |
| Guard en `guide-renderer` / `sanitizeUrls` frontend | Podría ocultar un link legítimo con coords raras (islas, antimeridiano) | Rango lat/lng es estándar (−90/90, −180/180); solo se filtra fuera de rango o `NaN`/`0,0` |
| Colección Firestore nueva | Reglas de seguridad: hoy `public_guides` no tiene ownership check | `url_validation_incidents`: write solo desde el Worker (o `auth != null` + solo create); read admin. Definir regla explícita. |

---

## 6. Test cases (a ejecutar en Parte 2, aquí solo mapeados)

| # | Caso | Punto que ejercita | Resultado esperado |
|---|------|--------------------|--------------------|
| 1 | Ruta con todas las URLs válidas | `done` ruta | Sin cambios, 0 docs en `url_validation_incidents` |
| 2 | Ruta con una URL 404 | `done` ruta | Esa parada → `search/?api=1&query=<nombre>`; log `reason:"404"`, `surface:"ruta_guiada"` |
| 3 | Ruta con `lat=200` | validación coords (sin HEAD) | Sustituida; log `reason:"invalid_coordinates"` |
| 4 | Ruta del flujo guiado nuevo | contexto `guidedRoute` → mismo pipeline | Pasa por el validador igual que una no guiada |
| 5 | Chat libre "restaurantes cerca de X" con link roto | `reply` string chat | Link corregido o eliminado; log `surface:"chat_libre"` |
| 6 | Guía compartida (`404.html`) con link roto guardado | validación al guardar + guard render | Corregido al guardar; guard evita pintar coords fuera de rango; log `surface:"viaje_compartido"` |
| 7 | Narrador en uso real | `/nearby-pois` + toast | Sin validador (documentado): links ya reales de Places |
| 8 | Ruta 8–10 paradas: medir antes/después | `done` ruta | Δ ≤ ~1–2 s (1 sola tanda `allSettled` timeout 3 s) |

---

## 7. Siguiente paso

Esperando OK de Paco para:
- **Parte 2:** implementar `validarYCorregirLinksMaps` en `worker/salma-worker.js` + engancharla en
  los 4 puntos de §4.2 marcados "Sí" (+ el hueco nuevo de KV) + guard mínimo frontend.
- **Parte 3:** crear colección `url_validation_incidents` + regla Firestore + logging vía `waitUntil`.
- Requiere `wrangler deploy` tras el cambio (verificar version ID).
