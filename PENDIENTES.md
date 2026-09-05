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

### PENDIENTE — 3 fallos de MOTOR DE RUTAS (vistos en `wrangler tail`, NO son del flujo)
1. **Destino sin país.** "Córdoba" con GPS en Portugal → el modelo/verify coge **Córdoba de Argentina** para varias paradas y las **mezcla** con Córdoba de España en la misma ruta (hubo `/directions` con waypoints saltando España↔Argentina).
2. **La ruta se sale de la ciudad.** "Córdoba ciudad" 11 días → recomendaciones y paradas por toda la provincia (Zuheros, Écija, Baena…) e incluso Sevilla/Jaén. Es tuneo de prompt: 11 días para una ciudad es demasiado y el modelo rellena con excursiones.
3. **Ruta malformada → crashes de render.** `TypeError: This WritableStream has been closed` en el worker (respuestas solapándose) y `Cannot read properties of undefined (reading 'min')` en Leaflet desde `guide-renderer.js:836` (bounds nulos por lat/lng mezclados). Paco ve "carga un modelo de guía viejo y en un segundo sube otro" = dos renders / dos respuestas.

### Menores
- La **última foto de todas las guías es siempre la misma** (paisaje genérico).
- El **chat libre** ("3 días Córdoba" escrito a mano) sigue yendo directo al mapa. Unificarlo con el flujo de 2 tiempos = "paso 1b": reusar `guided_stage:'reco'` disparado desde el front para mensajes de ruta sin la frase "hazme una guía". ~15-25 líneas de front, 0 worker. Pendiente OK de Paco.

### Por dónde empezar
Los 3 fallos grandes solapan con la **Pieza B/C** (grounding real: web_search + geometría de carretera Overpass + verificación dura) descrita en la memoria `project_motor_rutas_websearch`. Orden sugerido: (1) anclar el país del destino, (2) limitar el radio de la ruta a la ciudad pedida, (3) el render/solapamiento. Antes de dar el solapamiento por bug de código: comprobar que Paco no tiene la app abierta en varias pestañas/dispositivos.
