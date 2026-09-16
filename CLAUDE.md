# CLAUDE.md — Borrado del Mapa
---

## ⛔ PROTOCOLO DE TRABAJO — LEER ANTES DE TOCAR NADA

Escrito el 5 septiembre 2026 después de una sesión en la que se arreglaron seis
fallos reales y **ninguno se llegó a ver en la app**, se restauró todo al día
anterior y se perdieron las 15 API keys del Worker. Las causas no fueron técnicas:
fueron de método. Estas reglas existen para que no vuelva a pasar.

### 1. UNA SOLA SESIÓN sobre `C:\Users\User\Desktop\salma`

Aquel día había **tres sesiones de Claude Code editando los mismos ficheros y
desplegando el mismo Worker**. Dos hicieron los mismos arreglos por duplicado; una
tercera borró el Worker entero. Con varias sesiones sobre el mismo directorio es
imposible saber qué versión se está probando.

- Antes de empezar: comprobar que no hay otra sesión abierta sobre este directorio.
- Si hacen falta dos a la vez, la segunda **en worktree aparte**, nunca en el mismo árbol.
- **Si un `git push` sale rechazado (`non-fast-forward`), PARAR.** No es un trámite de
  git: significa que alguien más está escribiendo aquí. Mirar quién antes de seguir.

#### 1B. Realidad desde el 13-14 sept: varias sesiones de Code a la vez, cada una con su
propio clon (móvil, portátil, nube) — no todas en worktree del mismo árbol local. Esto
es distinto del caso de un solo Worker borrado del 5 sept, pero puede liarse igual si no
se sigue esto. Un rechazo de push aquí **no es la catástrofe del 5 sept** — es rutina de
git, se resuelve en un minuto con los pasos de abajo. No hay que asustarse, hay que
seguir el proceso.

- **Cuando Paco abra varias sesiones para cosas distintas, decirle a cada una qué toca y
  qué NO** (ej. "esta sesión es solo Historia, no toques el generador de rutas"). Reduce
  al mínimo que dos sesiones editen el mismo trozo de archivo a la vez.
- **`git fetch origin main` antes de cualquier commit que vaya a subirse**, sobre todo si
  la sesión lleva un rato abierta — la otra puede haber subido cosas mientras tanto. No
  fiarse de lo que había al principio de la conversación.
- **Commits pequeños y push frecuente**, no acumular cambios grandes sin subir. Si hay
  conflicto, que sea pequeño y fácil de leer, no una bola de nieve.
- **Push rechazado → PARAR → `git fetch origin main` → `git log --oneline
  HEAD..origin/main`** para ver qué ha cambiado (los mensajes de commit dicen de qué
  sesión/tema viene — escribirlos siempre claros por esto mismo) → **confirmar con Paco
  quién es** antes de tocar nada → si confirma, `git rebase origin/main` (nunca
  `push --force`) → **verificar que el propio cambio sigue intacto** (grep de las piezas
  clave que se tocaron, no fiarse solo de "rebase sin conflictos") → recién entonces
  `git push`.
- **`CLAUDE.md` es zona común** — las sesiones simultáneas casi siempre escriben aquí
  (pendientes). Git suele fusionar líneas distintas sin problema; si hay choque de verdad
  (mismo párrafo tocado por las dos), tratarlo como cualquier conflicto: parar, mirar,
  fusionar a mano conservando las dos aportaciones — nunca pisar el trabajo de la otra
  sesión con la propia versión sin mirar qué decía.
- **Despliegue del Worker: la sesión que hace push del cambio es la que lo despliega**
  (GitHub Action "Deploy Worker") justo después, y **anota el `Current Version ID` en el
  propio pendiente de `CLAUDE.md`** — así la otra sesión (o Paco) sabe qué versión es la
  vigente sin tener que adivinar ni volver a desplegar por si acaso.

### 2. UN CAMBIO, UNA PRUEBA, UNA CONFIRMACIÓN DE PACO

Aquel día se encadenaron cinco arreglos sin verificar ninguno. Cuando algo seguía
mal, ya era imposible saber cuál había servido.

- No se toca el siguiente fallo hasta que Paco diga qué ve en su pantalla.
- **Nunca decir "arreglado"**. Se dice: *"desplegado — dime qué ves"*. Que un `grep`
  encuentre una función no prueba que en la pantalla de Paco pase nada.
- Verificar **comportamiento**, no código. El código desplegado y correcto puede no
  cambiar nada de lo que el usuario ve — eso fue exactamente lo que pasó.

### 3. PEDIR EVIDENCIA DE SU PANTALLA, Y PRONTO

Se estuvo horas arreglando la vista del mapa mientras Paco hablaba del texto del
chat. Una captura al principio ahorra media tarde.

- Ante un "sigue igual": pedir **captura de pantalla** y el panel **🐛** (botón flotante
  abajo-derecha → "Copiar"), que trae los errores de JavaScript de su navegador y, en
  la cabecera, la versión del Worker y el `?v=` de cada script que ese navegador tiene
  cargado. Esa cabecera es lo primero que hay que leer.
- Si menciona una demo, un diseño o un comportamiento esperado: **preguntar qué es
  exactamente**, no suponerlo.
- Diagnóstico en vivo: `npx wrangler tail salma-api --format pretty` mientras él prueba.

### 4. CHECKLIST DE DESPLIEGUE — SIEMPRE EN ESTE ORDEN

1. Subir versión `?v=` en `index.html` de **cada** `.js` modificado (si no, el navegador
   sirve el viejo aunque el fichero esté subido). Los 18 scripts locales llevan `?v=`;
   ninguno debe quedarse sin él.
2. `git add` + `commit` + `push`.
3. Comprobar que la web ya sirve la versión nueva — GitHub Pages tarda entre 45 s y
   varios minutos:
   `curl.exe -s https://borradodelmapa.com/index.html | Select-String '\.js\?v='`
4. Desde `worker\`: `npx wrangler deploy -c wrangler.toml` — **siempre con `-c`**: en la
   raíz del proyecto hay un `wrangler.jsonc` que wrangler coge por error si no se le
   dice cuál. La terminal de Paco es PowerShell, donde `&&` **no existe**; se encadena
   con `;`:
   `cd C:\Users\User\Desktop\salma\worker; npx wrangler deploy -c wrangler.toml`

   **Alternativa desde el móvil (sin terminal) — Cloudflare Workers Builds, montado y
   probado el 11 sept 2026:** el Worker `salma-api` tiene conectado el repo de GitHub
   (Cloudflare dashboard → salma-api → Settings → Builds). Cualquier commit directo a
   `main` (se puede hacer editando un fichero desde github.com en el navegador del
   móvil, sin `git` local) dispara un build y deploy automático — mismo comando,
   `npx wrangler deploy -c wrangler.toml`, con **Directorio raíz = `worker`** para que
   no coja el `wrangler.jsonc` de la raíz. El paso 5 (comprobar `/version`) sigue
   haciendo falta igual, solo que se abre la URL directamente en el navegador del móvil
   en vez de `curl.exe`. Esto **no sustituye** el paso 1 (subir `?v=`) ni el 6 (Paco
   prueba en la app) — solo cambia cómo se ejecuta el paso 4.
5. Comprobar que el Worker que corre es el que crees — el `Current Version ID` del
   deploy tiene que coincidir con el que devuelve el endpoint:
   `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`
   Ojo: en PowerShell `curl` a secas es `Invoke-WebRequest` y se queda pidiendo `Uri:`.
   Hay que escribir `curl.exe`.
6. **Paco prueba en la app.** Hasta aquí no está terminado. Si hay cualquier duda de si
   está viendo lo nuevo o algo de su caché: panel 🐛 → la cabecera dorada trae el
   Version ID del Worker y el `?v=` de cada script cargado, y el botón "Copiar" lo pega
   delante de los logs.

### 5. NO SE BORRA EL WORKER. NUNCA

Ni el fichero ni el Worker de Cloudflare. **Al eliminarse un Worker, Cloudflare
destruye sus secrets de forma irreversible** — son de solo escritura y no hay copia.
Aquel día costó dos horas reponer 15 claves, y varias no estaban en local.

- Copia de seguridad de secrets: `worker/restaurar-secrets.cjs` sube los que hay en
  `api\*.txt` (carpeta gitignored). Los que no estén ahí hay que sacarlos de su panel.
- Diagnóstico de claves de Google: `worker/probar-google-keys.cjs`.
- Comprobar qué hay puesto: `npx wrangler secret list -c wrangler.toml` (son 15).

### 6. ANTES DE DAR UN FALLO POR ENTENDIDO

Aquel día se cambió tres veces de sospechoso porque se miraba una sola capa.

- Un dato puede **calcularse bien y no llegar a pantalla**: el Worker mandaba la ruta
  verificada y el frontend la descartaba. Seguir el dato **de punta a punta**.
- Al hacer un corte limpio, buscar **todos** los escritores y lectores en el repo
  entero (worker + scripts + crons), no solo la función obvia. Había un segundo motor
  de rutas vivo, en un cron, con prioridad sobre el nuevo.
- Al tocar el prompt, buscar **contradicciones entre bloques**: tres instrucciones
  distintas pedían el plan completo en el chat *y* en el JSON. La duplicación estaba
  escrita en el propio prompt.

### 7. RESTAURAR SIN DESTRUIR

- Volver atrás con un **commit nuevo que restaure el árbol**, nunca reescribiendo la
  historia: `git restore --source=<commit> --worktree --staged .`
- Antes de cualquier vuelta atrás, dejar un tag o rama de salvaguarda.
- Puntos de restauración del 5 sept 2026: tags `v-5sept-antes-de-volver-atras` y
  `v-5sept-antes-de-borrar` (todo el trabajo de ese día, Worker intacto).

### 8. CUALQUIER COSA QUE PUEDA MOVER LA FACTURA, SE DICE — SIEMPRE, SIN EXCEPCIÓN, POR MÍNIMA QUE SEA

Añadido el 15 sept 2026 tras el susto de 82€ en 14 días en Google Places (ver 🔴 Crítico
en "Pendiente / Problemas conocidos", y el detalle completo en "Normas de desarrollo").
Reforzado el mismo día porque la primera redacción dejaba margen a decidir "esto es
tan pequeño que no hace falta decirlo" — **no existe ese margen. Nunca.**

- **SIEMPRE, en TODO cambio, por mínimo que parezca, que toque una línea de código que
  llame (o pueda llegar a llamar) a una API de pago** (Google Places/Maps, Anthropic,
  OpenAI, Duffel, RapidAPI, Twilio, ElevenLabs, Stripe, Brave, Serper, OpenWeather...) —
  se le dice a Paco explícitamente: qué se toca y por qué puede afectar al coste,
  estimación aunque sea a ojo. Subir el gasto, bajarlo, o "seguramente no cambia nada"
  cuentan igual — se avisa igual, sin excepción.
- **No hay umbral de "esto es tan pequeño que no cuenta".** Cambiar un solo parámetro,
  un solo field mask, una sola condición de una caché, un solo número de un intervalo —
  todo eso ES un cambio que puede mover la factura, y se dice igual que uno grande.
- No es "bajo riesgo" aunque el cambio sea pequeño, sea solo código, o sea un fix que
  promete ahorrar dinero — un arreglo de coste sigue necesitando decir qué se tocó.
- Nunca decidir en solitario que algo "no hace falta mencionarlo". Si hay duda de si
  cuenta, cuenta — se dice.
- No esperar a que Paco pregunte. Decirlo antes o en el momento, nunca como nota de después.

---
## V2 Mapa — 11 abril 2026 | Backup: `backups/borradodelmapa-v2-mapa-2026-04-11/`
## V3 Share + Fotos — 17 abril 2026 (sesión)

---

## Sesión 17 abril 2026 — Fotos compartidas + UX Mis Viajes

### Cambios (todos ya en `main`):

1. **Mis Viajes: orden de grupos por guía más reciente** ([app.js:2028-2033])
   Antes se agrupaban por `destino` alfabéticamente. Tu última guía quedaba escondida.

2. **Mis Viajes: agrupación por PAÍS con detección en cascada** ([app.js:_detectGuideCountry])
   - Cache en Firestore (`country_code` + `country_name` por guía, se guarda al detectar)
   - Fallbacks: texto destino+nombre → primer stop del itinerarioIA → Nominatim reverse geocode con lat/lng del primer stop
   - "Otros" siempre al final. Grupos ordenados por guía más reciente primero.

3. **Ruta activa del mapa: persistencia entre sesiones y dispositivos** ([app.js:selectRouteOnMap/_restoreActiveRoute])
   - Firestore: `users/{uid}.active_route_id` (sincroniza móvil ↔ portátil)
   - localStorage: `bdm_live_active_route` + `bdm_live_active_route_id` (fallback offline)
   - Restauración automática al abrir el mapa
   - Bug colateral arreglado: `_activeRouteDocId` ahora SÍ se asigna → fotos del diario se etiquetan con la ruta correcta

4. **Share Target Android (PWA): recibir fotos desde galería del móvil**
   - `manifest.json` declara `share_target` → "Borrado del Mapa" sale en el menú Compartir
   - `sw.js`: intercepta POST `/?share=1`, guarda en Cache Storage `share-inbox`, redirige a `/?share=ready`
   - `share-inbox.js` (nuevo, ~800 líneas): parser EXIF mínimo (GPS + DateTimeOriginal), upload a R2, crea foto+pin en Firestore
   - **Solo funciona en Android/Chrome con PWA instalada**. iOS/Safari no soporta Web Share Target.

5. **Flujo de asignación de fotos compartidas**
   - **Con ruta activa** → flujo directo: todas las fotos se añaden a esa ruta. Si tienen EXIF GPS usa esa coord, si no usa GPS del móvil (última conocida <30min ó fresca). Toast + abre mapa centrado. Sin pantalla de asignación.
   - **Sin ruta activa** → pantalla de asignación: grid con miniaturas (recientes primero), selector de ruta, "Seleccionar todas", "Añadir a [ruta]", "Descartar"
   - **Ubicar manualmente**: si foto no tiene GPS, botón "📍 Ubicar N" abre modal con Google Places Autocomplete. Aplica lat/lng + locName con micro-offset aleatorio (5-20m) para no solapar
   - **Aviso al añadir sin GPS**: popup "esta foto no tiene ubicación — ¿ubicar primero o solo galería?"

6. **Resume tras redirect** (para Google login en móvil que a veces hace full redirect)
   - sessionStorage `share_pending=1` cuando empieza el flujo
   - Al reentrar sin `?share=ready` pero con flag + archivos en cache → reanuda solo

7. **Debug panel flotante** (`debug-panel.js`)
   - Botón 🐛 flotante abajo-derecha en la app
   - Intercepta console.log/warn/error + window errors + unhandled rejections
   - Tap abre overlay con todos los logs + botón "Copiar" al portapapeles
   - Badge rojo pulsante si hay error
   - **Se queda activo por ahora** (útil para debuggear lo que venga)

### Nuevas funciones expuestas (`window.*`):
- `window.reloadSavedPins()` — borra markers + recarga pins desde Firestore
- `window.liveMapFitPins(coords)` — encuadra mapa sobre conjunto de coords
- `window.__dbg` — control del debug panel (open, logs)

### Campos nuevos en Firestore:
- `users/{uid}.active_route_id` — ID de la ruta seleccionada en el mapa live
- `users/{uid}/maps/{id}.country_code` + `country_name` — país detectado (cache)
- `users/{uid}/pins/{id}.source = 'share'` — pins creados desde fotos compartidas
- `users/{uid}/fotos/{id}.source = 'share'` — idem fotos

### Archivos nuevos:
- `share-inbox.js` — handler de fotos compartidas
- `debug-panel.js` — panel de logs flotante

### Limitaciones conocidas (para retomar):
- **iOS**: no funciona (Safari no soporta Web Share Target). Opción: app nativa real.
- **WhatsApp/galería que strippea EXIF**: no hay GPS → se usa GPS del móvil o el user ubica manualmente
- **Debug panel**: visible siempre. Quitarlo o ponerlo detrás de un flag cuando no haga falta
- **Nominatim rate limit**: al cargar Mis Viajes con muchas guías sin country_code cached, puede tardar 1-3s la primera vez

---

## Qué es este proyecto

**borradodelmapa.com** — Salma es tu compañera de viaje. Te diseña la ruta, te guía en ruta, te resuelve imprevistos y documenta tu aventura.
Repo: https://github.com/borradodelmapa/borradodelmapa

El usuario es **Paco**, founder y único desarrollador. Trabaja desde portátil, tablet y móvil. Quiere aprender mientras trabajamos — enseñar proactivamente y proponer mejoras.

**Números clave:** (recontados 16 sept 2026 — antes decía "15 archivos JS / 25+ endpoints", desactualizado)
- 19 archivos JS principales en la raíz (~900KB código)
- 1 Worker Cloudflare (~316KB, 10.400 líneas) con **43 endpoints** + 3 crons automáticos
- 2 namespaces KV (`SALMA_KB` + `ROAD_GEOM`, confirmados por API de Cloudflare)
- 1,793 páginas de destinos SEO
- 12 artículos de blog
- 193 países en KV (3 niveles de datos) — cobertura de contenido sin verificar en este barrido (ver KV más abajo)
- 8 tools de IA en el chat (Vigilancia de Vuelos es CRUD aparte, no tool de chat)
- 15 API keys/secrets externos

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JS vanilla (sin frameworks) |
| Auth + DB | Firebase Authentication + Firestore |
| IA (chat) | Claude Sonnet (`claude-sonnet-4-6`) vía Anthropic API |
| IA (secundaria) | GPT-4o-mini vía OpenAI API (enrich, bloques largos, narrador, admin) |
| IA (KV generación) | Claude Sonnet (nivel 1-2) + Claude Haiku (nivel 2.5) — scripts locales |
| Mapas | Google Maps JS API (principal) + Leaflet 1.9.4 (fallback) |
| Fotos | Google Places Photos API (via photo_ref) |
| Búsquedas | Google Places Text Search + Brave Search |
| Vuelos | Duffel API |
| Hoteles/Coches | Booking.com vía RapidAPI |
| Voz | ElevenLabs TTS + Web Speech API (input/output) |
| Pagos | Stripe (test mode — falta webhook server-side) |
| Hosting | GitHub Pages / dominio borradodelmapa.com |
| Worker | Cloudflare Workers (salma-api.paco-defoto.workers.dev) |
| Storage | Cloudflare R2 (fotos, avatares, documentos) |
| KV | Cloudflare KV (SALMA_KB) — datos de 193 países |
| PWA | manifest.json + sw.js — instalable desde móvil |

### CDNs y versiones (cargados en index.html)
- Firebase SDK 8.10.1 (app, auth, firestore, storage)
- Leaflet 1.9.4
- Stripe.js v3
- Google Fonts: Bebas Neue, Inter, Inter Tight, JetBrains Mono
- Google Maps JS API (lazy load)
- Google Analytics 4 (G-B2YWQKPTZZ)

---

## Archivos principales

```
/
├── index.html              # App principal — login, welcome, chat, guías
├── 404.html                # Guías públicas por slug (truco GitHub Pages, con chat inline)
├── app.js                  # Firebase, auth, welcome, perfil, galería, mapa live, diario, SOS, coins (INTOCABLE sin confirmar)
├── salma.js                # Motor de conversación: streaming SSE, historial, copiloto, narrador, TTS, cámara
├── guide-renderer.js       # Renderiza guía-card: acordeón, mapas Leaflet, fotos, enlaces
├── mapa-itinerario.js      # Vista itinerario fullscreen: tarjetas + mapa de ruta (monkey-patches bitacoraRenderer)
├── mapa-ruta.js            # Google Maps dinámico + Leaflet fallback: marcadores, polyline, turn-by-turn
├── bitacora-renderer.js    # "Mi Diario": timeline por días, fotos, notas, compartir redes
├── notas.js                # Gestor de notas: CRUD Firestore, recordatorios, filtros, adjuntos R2
├── video-player.js         # Generador de vídeos Canvas: Ken Burns, mapa animado, documental/historia
├── video-assembly.js       # Smart Assembly: selección automática de fotos para generar vídeo (1 tap)
├── country-utils.js        # Mapeo 190+ países (ES/EN → ISO), emojis bandera, detección en texto
├── nav-history.js          # Browser back/forward con History API
├── docs-viajero.js         # Documentos del viajero: pasaporte, visado, seguro. CRUD + R2
├── docs-viajero.css        # Estilos del módulo documentos
├── flight-watches.js       # Vigilancia de precios de vuelos: CRUD Firestore + alertas del cron del Worker
├── map-modal.js            # Modal fullscreen Google Maps nativo (Street View, capas, búsqueda) para "ruta completa"
├── share-inbox.js          # Handler de fotos compartidas desde galería del móvil (Share Target Android)
├── translator.js           # Traductor simultáneo push-to-talk (voz ES vía ElevenLabs, resto Web Speech)
├── historia.js             # Cápsula de historia ampliable (parada/país en guías + chat), Claude Haiku
├── historia.css            # Estilos del módulo Historia
├── debug-panel.js          # Panel 🐛 flotante: logs, errores JS, Version ID Worker + `?v=` scripts cargados
├── styles.css              # Sistema de diseño: mobile-first, dark theme, dorado (175KB)
├── transport-apps.json     # Base de datos de apps de transporte mundial (84KB)
├── admin.html              # Panel admin: gestión prompt, testing automático, fixes IA
├── legal.html              # Aviso legal, privacidad, cookies, términos (PENDIENTE datos titular)
├── manifest.json           # PWA: standalone, portrait, iconos 192+512
├── sw.js                   # Service Worker: sin caché (todo red), push notifications narrador
├── parse_sse.js            # Utilidad CLI para debug de SSE
├── robots.txt              # Allow all + sitemap
├── sitemap.xml             # Sitemap index
├── sitemap-static.xml      # 2 URLs (home + legal)
├── sitemap-blog.xml        # 13 URLs (blog index + 12 artículos)
├── sitemap-destinos.xml    # 301 URLs de destinos estratégicos
├── blog/                   # 12 artículos HTML + index
├── destinos/               # 1793 páginas de destinos (SEO)
├── scripts/                # Pipeline SEO: build-destinos, grow-sitemap, publish, progressive-load
├── api/                    # API keys en texto plano (gitignored, solo local)
├── docs/                   # Notas de diseño de Paco
├── mockups/                # Prototipos de features futuras
├── backups/                # Copias de seguridad
├── CLAUDE.md               # Este archivo
└── worker/
    ├── salma-worker.js     # Worker principal (~316KB, 10.4K líneas) — prompt + Claude + GPT-4o-mini + tools + verify + KV + crons
    ├── wrangler.toml       # Config Cloudflare Workers (2 KV bindings + R2 bucket + crons)
    ├── kv/                 # Scripts de generación KV nivel 1, 2, 2.5 + JSONs de respaldo
    └── roads/
        └── road-resolver.js # Geometría real de carreteras (OSM) para `/roads/resolve`, cachea en KV ROAD_GEOM
```

### Orden de carga de scripts (index.html) — verificado 16 sept 2026 contra el `<head>` real
1. Firebase SDK 8.10.1 → firebase init inline → `window.SALMA_API`
2. Stripe.js v3
3. `debug-panel.js` → `country-utils.js` → `app.js` → `nav-history.js` → `notas.js` → `flight-watches.js`
4. `salma.js` → `video-player.js` → `video-assembly.js` → `guide-renderer.js`
5. `bitacora-renderer.js` → `mapa-ruta.js` → `mapa-itinerario.js` → `docs-viajero.js` → `map-modal.js` → `share-inbox.js` → `translator.js` → `historia.js`
6. Inline: SW register, salma.initGeolocation/Voices/VoiceToggle, cookie consent

**Dependencias entre módulos:**
```
app.js (Firebase, showState, currentUser, db, showToast, escapeHTML, generateSlug, publishGuide)
  └─ todos los demás dependen de app.js (globals)
country-utils.js (puro, sin deps)
nav-history.js (wraps showState)
notas.js (db, currentUser, SALMA_API, showState, showToast)
salma.js (db, currentUser, SALMA_API, guideRenderer, mapaItinerario, notasManager, showToast)
video-player.js (puro Canvas, sin deps)
guide-renderer.js (Leaflet, db, currentUser, SALMA_API, salma, showToast, generateSlug)
bitacora-renderer.js (Leaflet, db, currentUser, SALMA_API, showToast, videoPlayer)
mapa-ruta.js (google.maps lazy, Leaflet fallback, db, SALMA_API, salma)
mapa-itinerario.js (mapaRuta, guideRenderer, salma, db, showToast)
  └─ monkey-patches bitacoraRenderer.renderDiario en runtime
docs-viajero.js (db, currentUser, firebase.firestore.Timestamp, SALMA_API, showState)
flight-watches.js (db, currentUser, firebase.auth, SALMA_API, showToast) — no documentado hasta este barrido (16 sept)
map-modal.js (google.maps, salma, showToast) — no documentado hasta este barrido
share-inbox.js (db, currentUser, SALMA_API, showToast, Cache Storage vía sw.js)
translator.js (SALMA_API, showToast, ElevenLabs vía /tts, Web Speech API) — no documentado hasta este barrido
historia.js (SALMA_API, db — caché KV vía /historia-lugar)
video-assembly.js (videoPlayer, db, currentUser) — no documentado hasta este barrido
debug-panel.js (puro, intercepta console.*/window errors, sin deps de otros módulos)
```

**Código duplicado (pendiente de refactorizar):**
- `_groupByDay()` — en guide-renderer, mapa-itinerario, bitacora-renderer
- `_sampleWaypoints()` — en guide-renderer, mapa-itinerario
- `_fullRouteGmapsUrl()` — en guide-renderer, mapa-itinerario, bitacora-renderer
- `escapeHTML()` / `_esc()` — en app.js y 3+ módulos más

---

## Arquitectura Firebase

- **Auth**: Email/contraseña + Google Sign-In + WebAuthn/fingerprint (parcial — solo recuerda email)
- **Firestore colecciones**:

| Colección | Acceso | Contenido |
|-----------|--------|-----------|
| `users/{uid}` | Owner only | Perfil: name, email, isPremium, coins_saldo, rutas_gratis_usadas, avatarURL, sos_config, copilot_data |
| `users/{uid}/maps/{mapId}` | Owner only | Guías guardadas (itinerarioIA, slug, published, enriched, photos, notes) |
| `users/{uid}/fotos/{fotoId}` | Owner only | Galería de fotos (url, r2Key, albumId) |
| `users/{uid}/albumes/{albumId}` | Owner only | Álbumes de fotos |
| `users/{uid}/notas/{notaId}` | Owner only | Notas (texto, tipo, countryCode, fechaRecordatorio, files, completado) |
| `users/{uid}/pins/{pinId}` | Owner only | Pins del diario |
| `users/{uid}/map_pins/{pinId}` | Owner only | Pins de foto→mapa y tap sheet |
| `users/{uid}/travel_docs/{docId}` | Owner only | Documentos del viajero (name, category, files, expiresAt, notes) |
| `users/{uid}/paises/{paisId}` | Owner only | Legacy — migrado automáticamente a notas |
| `public_guides/{slug}` | Read: public / Write: auth (⚠ SIN ownership check) | Guías públicas SEO |
| `config/salma-prompt` | Read: auth / Write: blocked | Prompt dinámico (gestionado via Worker admin) |
| `admin_logs/{logId}` | Auth required | Logs de uso del Worker |

- **Regla importante**: `const db` solo se inicializa en `app.js`, nunca duplicado
- Firebase se inicializa en el `<head>` del `index.html`

### Firestore Rules actuales

```
users/{userId}/**        → read/write: auth.uid == userId
public_guides/{slug}     → read: true, write: auth != null (⚠ sin ownership)
config/{doc}/**          → read: auth, write: false
admin_logs/{logId}       → read/write: auth
```

---

## Salma — compañera de viaje IA

- **Rol**: compañera de viaje completa. Planifica rutas, busca restaurantes/hoteles/vuelos/coches, resuelve emergencias, da info práctica, acompaña en ruta.
- **Flujo ruta**: destino + días → Salma puede hacer 1 pregunta para personalizar → genera guía → guardar/compartir
- **Flujo servicios**: restaurante/hotel/grúa/embajada → actúa INMEDIATAMENTE, sin preguntar. Dato primero.
- **Historial**: se limpia después de cada guía. Últimos 20 turnos se envían al Worker.
- **Personalidad**: andaluza suave, fan de Extremoduro, directa, con opinión propia, siempre tutea, multiidioma

### Modelos IA

| Contexto | Modelo | API | Cuándo |
|----------|--------|-----|--------|
| Chat principal | Claude Sonnet `claude-sonnet-4-6` | Anthropic | Siempre para conversación |
| Fotos/visión | Claude Sonnet `claude-sonnet-4-6` | Anthropic | Cuando el usuario envía foto |
| Enrich (Pass 2) | GPT-4o-mini | OpenAI | Background tras guardar ruta |
| Bloques rutas largas (>7 días) | GPT-4o-mini | OpenAI | Planificación + generación por bloques |
| Narrador | GPT-4o-mini | OpenAI | Narración de POIs cercanos |
| Admin (test/fix prompt) | GPT-4o-mini | OpenAI | Panel admin |
| KV nivel 1-2 (scripts) | Claude Sonnet | Anthropic | Generación local puntual |
| KV nivel 2.5 (scripts) | Claude Haiku | Anthropic | Generación local puntual |

### Prompt — 12 bloques, 3 variantes

**Bloques:**
1. `BLOQUE_IDENTIDAD` — andaluza, tutea, multiidioma
2. `BLOQUE_PERSONALIDAD` — directa, Extremoduro, anti-sexismo
3. `BLOQUE_MULETILLAS` — expresiones andaluzas (máx 1 cada 8-10 msg)
4. `BLOQUE_ANTIPAJA` — frases prohibidas, test de utilidad MAL/BIEN
5. `BLOQUE_GEOGRAFIA` — geografía avanzada: clima, fronteras, ferries, multimodal
6. `BLOQUE_ACCION` — 6 tipos de acción + SALMA_ACTION + "dato primero"
7. `BLOQUE_FORMATO` — solo saltos de línea + negritas. Sin viñetas ni headers
8. `BLOQUE_NOTAS` — guardar_nota trigger
9. `BLOQUE_RUTAS` — SALMA_ROUTE_JSON, 4-7 paradas/día, orden geográfico (solo en ROUTE)
10. `BLOQUE_MAPA` — GPS, herramientas, URLs, apps transporte
11. `BLOQUE_VISION` — análisis de fotos + FOTO_TAG
12. `BLOQUE_FORMATO_PLAN` — override para formato días+destino

**3 prompts ensamblados:**
- `SALMA_SYSTEM_CHAT` — todo menos RUTAS y FORMATO_PLAN
- `SALMA_SYSTEM_PLAN` — FORMATO_PLAN primero + todo menos RUTAS
- `SALMA_SYSTEM_ROUTE` — todo incluyendo RUTAS

### 8 Tools

| Tool | Backend | Función |
|------|---------|---------|
| `buscar_vuelos` | Duffel API | Vuelos con rango de fechas, top 5, link Skyscanner |
| `buscar_hotel` | Booking.com (RapidAPI) | Hoteles por ciudad, top 5, filtro presupuesto. Apartments→Airbnb link |
| `buscar_coche` | Booking.com (RapidAPI) | Alquiler de coches. Tabla proveedores (Europcar, Hertz, Sixt, Avis...) |
| `buscar_lugar` | Google Places Text Search + Details | Restaurantes, farmacias, museos... Top 5 con teléfono, dirección, Maps link |
| `buscar_foto` | Google Places Photos | Hasta 3 fotos por lugar |
| `buscar_web` | Brave Search + scraping top 2 URLs | 5 resultados con título, snippet, URL + contenido (3000 chars) |
| `generar_video` | Local | Devuelve parámetros para slideshow Canvas en frontend |
| `guardar_nota` | Local + Firestore (vía frontend) | Tipos: general, recordatorio, hotel, vuelo, restaurante, lugar, visado, transporte |

### Verify (Google Places)

Post-procesado que corrige cada parada de una ruta generada:
- Find Place + Place Details en paralelo (lotes de 5)
- Calcula centro de ruta + radio dinámico (max dist × 1.5, mín 50km)
- Valida: distancia desde centro, overlap de nombre, distancia desde coords originales (<15km)
- Si válido → corrige: lat/lng, photo_ref, nombre, verified_address, horarios
- Si inválido → mantiene datos originales de Claude sin tocar
- **NUNCA** sobrescribe: narrative, context, food_nearby, local_secret, alternative

### Endpoint y config

- **Endpoint**: `https://salma-api.paco-defoto.workers.dev` (POST)
- **Regla de prioridad**: rutas → puede preguntar 1 vez. Todo lo demás → actúa directo.
- **Deploy**: `wrangler deploy` desde `worker/`

---

## Worker Cloudflare — Endpoints completos

### Archivo: `worker/salma-worker.js` (~316KB)

| Método | Ruta | Función |
|--------|------|---------|
| POST | `/` | **Chat principal** — streaming SSE con Claude Sonnet |
| GET | `/photo` | Proxy fotos Google Places (por `ref` o `name`+coords, con `?json=1`) |
| GET | `/photo/*` | Servir fotos desde R2 (1 año caché) |
| POST | `/upload-photo` | Subir foto a R2 (max 5MB) |
| POST | `/upload-gallery-photo` | Subir foto galería a R2 (max 6MB) |
| POST | `/delete-photo` | Borrar foto de R2 por key |
| POST | `/upload-doc` | Subir documento/avatar a R2 (max 10MB) |
| POST | `/delete-doc` | Borrar documento de R2 |
| GET | `/doc/*` | Servir documento desde R2 |
| GET | `/place-details` | Google Place Details por `place_id` (nombre, rating, horarios, foto) |
| GET | `/directions` | Google Directions API proxy (polyline, legs, optional steps) |
| GET | `/practical-info` | KV lookup `dest:{cc}:practical` por country code |
| GET | `/nearby-pois` | Google Places nearby (tourist attractions/museums/churches/parks) |
| POST | `/narrate` | GPT-4o-mini narra un POI en 2-3 frases (personalidad Salma) |
| POST | `/enrich` | Enriquecimiento Pass 2: GPT-4o-mini rellena context/food/sleep/eat en paralelo + KV 2.5 |
| POST | `/create-payment` | Stripe PaymentIntent (starter €4.99, viajero €9.99, explorador €19.99) |
| POST | `/sos` | SMS emergencia via Twilio (rate limited: 3/IP/10min via KV) |
| POST | `/tts` | ElevenLabs TTS (voz `fzAdMudUtRHNnk5tjJRR`, max 1500 chars) |
| POST | `/pin` | Identificar lugar por foto con Claude Vision |
| POST | `/ga4` | Proxy Google Analytics 4 Data API (admin) |
| POST | `/admin-chat` | Chat admin con GPT-4o-mini (admin) |
| POST | `/admin/init-prompt` | Migrar prompt hardcoded a Firestore |
| GET | `/admin/get-prompt` | Leer prompt actual desde Firestore |
| GET | `/admin/verify-place` | Debug manual del verify de una parada contra Google Places (admin) |
| POST | `/admin/test-extract` | Extraer 10-15 reglas testeables del prompt |
| POST | `/admin/test-rule` | Testear una regla con mensajes trampa + evaluación |
| POST | `/admin/apply-fix` | Aplicar fix IA al prompt, guardar con historial en Firestore |
| POST | `/admin/save-prompt` | Guardar prompt editado manualmente |
| GET | `/health` | Health check de todos los servicios (admin) |
| GET | `/version` | Version ID del despliegue (publico, sin token) — para saber que worker corre |
| GET | `/sitemap.xml` | Sitemap index (1h caché) |
| GET | `/sitemap-guides.xml` | Sitemap dinámico de guías públicas desde Firestore |
| GET | `/weather` | Proxy clima (OpenWeatherMap, fallback wttr.in) para el copiloto/mapa |
| GET | `/staticmap` | Proxy Google Static Maps (evita CORS) — fondo del story del diario |
| GET | `/transport` | KV lookup `transport:{cc}` — apps de transporte por país |
| GET | `/roads/resolve` | Geometría real de carretera (OSM, vía `road-resolver.js`) — caché en KV `ROAD_GEOM` |
| POST | `/translate` | Traducción de texto para `translator.js` (traductor push-to-talk) |
| POST | `/tts-google` | TTS alternativo (Google) — junto a `/tts` (ElevenLabs) |
| POST | `/historia-lugar` | Historia de un lugar/país (Claude Haiku + foto Google Places), caché KV 30 días |
| POST | `/whatsapp` | Webhook Twilio WhatsApp (F5.1 — eco, sin IA todavía, ver 📱 Salma en WhatsApp) |
| POST | `/stripe-webhook` | Confirma pago Stripe server-side (`checkout.session.completed`), firma verificada |
| GET | `/flight-places` | Autocomplete de aeropuertos/ciudades para Vigilancia de Vuelos |
| GET/POST/DELETE | `/flight-watches` | CRUD de vigilancias de precio de vuelo (Firestore `flight_watches` + índice KV `fw:{uid}`) |
| PUT | `/flight-watches/pause` | Pausar/reanudar una vigilancia |
| GET | `/flight-alerts` | Alertas de bajada de precio/presupuesto alcanzado (KV `fw_alerts:{uid}`) |
| PUT | `/flight-alerts/mark-seen` | Marcar alerta como vista |

**Nota de este barrido (16 sept 2026):** esta tabla llevaba sin auditar contra el código real desde el 10 sept — faltaban 15 endpoints que ya existen y están desplegados (Vigilancia de Vuelos completa, WhatsApp, Stripe webhook, roads/resolve, weather, transport, translate, tts-google, historia-lugar, admin/verify-place). Ver también "🧠 KV — situación real" más abajo para el resto de hallazgos de este barrido.

### Flujo del chat principal (POST /)

**Pre-procesado (antes de llamar a Claude):**
1. Detección de saludo puro → respuesta enlatada (0 tokens)
2. Pre-fetch Brave Search en paralelo si transporte
3. Nominatim reverse geocoding GPS → ciudad + país (caché KV 24h)
4. `isHelpRequest()` → 8 categorías: salud, vehículo, seguridad, dinero, comida, logística, transporte, comunicación, clima
5. Clima: OpenWeatherMap primary, wttr.in fallback
6. Búsqueda de ayuda: Google Places Text Search → Details top 3
7. Transporte: Brave Search para URLs reales de booking
8. Eventos: Serper.dev si hay `travelDates`
9. KV lookup paralelo: `dest:{cc}:base`, `spot:{name}`, `transport:{cc}`, `route:{cc}:{dest}:{days}`
10. KV ruta cacheada → si calidad ≥3 stops/día, devuelve directo (coste 0)
11. `tryKVDirectAnswer()` → respuestas instantáneas para: visados, vacunas, moneda, enchufes, seguridad, mejor época, presupuesto, idioma, emergencias, capital, prefijo, apps transporte, conducción, agua, propinas, SIM, salud

**Selección de prompt:**
- "hazme una guía" / "salma hazme una guía" → `SALMA_SYSTEM_ROUTE`
- N días + destino → `SALMA_SYSTEM_PLAN`
- Todo lo demás → `SALMA_SYSTEM_CHAT`

**SSE streaming — tipos de evento:**

| Campo | Significado |
|-------|-------------|
| `{t: "chunk"}` | Texto streaming |
| `{k: 1}` | Keepalive (cada 3s en verificación) |
| `{searching: true}` | Tool ejecutándose |
| `{generating: true}` | Generando JSON de ruta |
| `{draft: true, route}` | Ruta borrador pre-verify |
| `{verified: true, route}` | Verificación Google completada |
| `{plan: blocks[]}` | Plan de bloques (rutas >7 días) |
| `{draft_block: N, route_partial}` | Bloque parcial listo |
| `{verified_block: N, route_partial}` | Bloque verificado |
| `{save_nota: true, nota_data}` | Auto-guardar nota |
| `{tool_note: true, summary, country_hint}` | Nota auto desde tool |
| `{photo_url: "url"}` | URL persistente R2 de foto subida |
| `{action_results: [...]}` | Resultados de tools (flights/hotels/places) |
| `{done: true, reply, route, video_params}` | Stream completado |

---

## API Keys / Secrets (15 servicios)

Todos en Cloudflare Worker secrets (`wrangler secret put`).

| Secret | Servicio | Uso |
|--------|----------|-----|
| `ANTHROPIC_API_KEY` | Claude Sonnet | Chat principal + visión |
| `OPENAI_API_KEY` | GPT-4o-mini | Enrich, bloques, narrador, admin |
| `GOOGLE_PLACES_KEY` | Google Places/Maps/Directions | Verify, búsquedas, fotos, directions |
| `BRAVE_SEARCH_KEY` | Brave Search | buscar_web tool + transporte |
| `DUFFEL_ACCESS_TOKEN` | Duffel | buscar_vuelos |
| `RAPIDAPI_KEY` | Booking.com | buscar_hotel + buscar_coche |
| `ELEVENLABS_API_KEY` | ElevenLabs | TTS endpoint |
| `SERPER_API_KEY` | Serper.dev | Búsqueda de eventos |
| `OPENWEATHER_KEY` | OpenWeatherMap | Clima (fallback: wttr.in) |
| `STRIPE_SECRET_KEY` | Stripe | PaymentIntents |
| `TWILIO_ACCOUNT_SID` | Twilio | SOS SMS |
| `TWILIO_AUTH_TOKEN` | Twilio | SOS SMS |
| `TWILIO_PHONE_NUMBER` | Twilio | SOS sender number |
| `ADMIN_TOKEN` | Worker admin | Endpoints /health, /admin/*, /ga4 |
| `GA4_CREDENTIALS` | Google Analytics 4 | Service account JSON |

**Client-side (públicas, en el código):**
- Google Maps JS key: `AIzaSyCtNPO5QVnLpHPkaJraQM0M71RXqAJ6L4U` (en index.html + mapa-ruta.js)
- Stripe publishable key: `pk_test_51TEhUf...` (en app.js — modo test)
- Firebase config: apiKey, authDomain, projectId (en index.html)

**Copias locales (api/ carpeta, gitignored, NUNCA en git):**
- `api/API SALMA VUELA.txt` — Duffel live key
- `api/OPEN AI.txt` — OpenAI key
- `api/acceso web salma.txt` — Brave Search key
- `api/rapid api.txt` — RapidAPI key
- `api/salma voice.txt` — ElevenLabs key

---

## KV — Base de conocimiento por país

**2 namespaces** (confirmado 16 sept 2026 vía API de Cloudflare — coinciden con `worker/wrangler.toml`, sin drift):

| Binding | ID | Contenido |
|---------|-----|-----------|
| `SALMA_KB` | `b2056c0613d94feb955b92279ba02fb6` | Todo lo de abajo — países, spots, rutas, cachés, vigilancia de vuelos |
| `ROAD_GEOM` | `39ff0d3316ab43d9b78f1f14b746e5ad` | Geometría real de carreteras (OSM) para `/roads/resolve`, clave `road_geom:v1:{cc}:{slug}` — namespace propio a propósito, pensado para poder compartirse con una futura app aparte sin migración |

### Estructura de claves — `SALMA_KB`

| Patrón | Nivel | Contenido | Cobertura |
|--------|-------|-----------|-----------|
| `dest:{cc}:base` | 1 | Datos base país (moneda, idioma, visados, seguridad) | 193 países |
| `dest:{cc}:destinos` | 2 | Top destinos, qué hacer, qué comer, transporte, cultura | 193 países |
| `dest:{cc}:practical` | 2.5 | Frases, emergencias, apps, salud, conectividad, kit, presupuesto | 193 países |
| `transport:{cc}` | — | Apps transporte (ride-hailing, tren, metro/bus, ferry, especial) | 193 países |
| `spot:{slug}` | — | POI individual (lat/lng, photo_ref, verified_address) | Variable |
| `spotcache:{variant}` | — | Caché auxiliar de resolución de spot por variante de nombre | Dinámico |
| `kw:{keyword}` | — | Índice ciudad→código ISO país | Miles |
| `route:{cc}:{dest}:{days}` | 3 | Rutas pre-generadas con paradas y coords (30 días TTL) | Algunos destinos |
| `verifiedspot:{país}:{nombre}` | — | Caché de verify Google Places entre rutas de usuarios distintos (30 días TTL) — fix de coste del 15 sept | Dinámico |
| `placedetails:{place_id}:{fields}` | — | Caché de Place Details (teléfono/web) por lugar (30 días TTL) — fix de coste del 15 sept | Dinámico |
| `nearbycache:{type}:{lat}:{lng}` | — | Caché Nearby Search por tipo + celda ~1km (7 días TTL) — fix de coste del 15 sept | Dinámico |
| `geo:{lat}:{lng}` | — | Caché reverse geocoding (24h TTL) | Dinámico |
| `geocity:{word}` | — | Caché Nominatim ciudad→país (30 días TTL) | Dinámico |
| `geocity:anchor7:{norm}` | — | Caché de geocodificación de ancla de ruta (7 decimales) | Dinámico |
| `historia:{slug}` / `historia:{slug}:{lat}:{lng}` | — | Caché de `/historia-lugar` (30 días TTL) — con bucket GPS desde el fix del 14 sept | Dinámico |
| `_cache:prompt` | — | Caché prompt Firestore (5 min TTL) | 1 clave |
| `_index:countries` | — | Índice de países con fecha de última generación — lo usa el cron de los lunes | 1 clave |
| `_index:routes` | — | Índice de rutas nivel 3 ya generadas — lo usa el cron de los miércoles | 1 clave |
| `_sa_token` | — | Token de acceso cacheado de alguna integración con service account (TTL 3300s) | 1 clave |
| `sos_rate:{ip}` | — | Rate limiting SOS (10 min TTL) | Dinámico |
| `fw:{uid}` | — | Vigilancias de vuelo activas de un usuario (Vigilancia de Vuelos) | Por usuario |
| `fw_alerts:{uid}` | — | Alertas generadas (bajada de precio / presupuesto alcanzado) | Por usuario |
| `flight_watch_users` | — | Lista de UIDs con alguna vigilancia activa — la recorre el cron diario | 1 clave |

### ⏰ 3 crons del Worker (`worker/wrangler.toml` → `[triggers]`) — no estaban documentados hasta este barrido

El Worker tiene `scheduled()` en `salma-worker.js` (línea ~9985) con 3 disparos automáticos, **ya desplegados y corriendo en producción ahora mismo**, sin que nadie los active a mano:

| Cron (UTC) | Qué hace | Llama a una API de pago |
|---|---|---|
| Lunes 4:00 | Regenera hasta 5 fichas nivel 1 (`dest:{cc}:base`) caducadas (>180 días) | **Sí — GPT-4o-mini**, ~5 llamadas/semana, coste marginal (céntimos) |
| Miércoles 4:00 | Genera hasta 3 rutas nivel 3 (`route:{cc}:{dest}:{days}`) para destinos que aún no tienen una cacheada | **Sí — GPT-4o-mini**, ~3 llamadas/semana, coste marginal (céntimos), ya reflejado en la tabla de scripts de abajo |
| Diario 6:00 | `_cronFlightWatches` — recorre `flight_watch_users`, comprueba precio actual de hasta 20 vigilancias de vuelo activas y crea alerta si baja >15% o entra en presupuesto | **Sí — Duffel API**, hasta 20 búsquedas de vuelo/día, automático, sin que el usuario pida nada en ese momento |

**Por qué se dice esto aquí y no se toca nada:** los 3 crons ya estaban en el código antes de esta sesión (no son un cambio de hoy), pero el de vuelos no aparecía mencionado en ningún sitio de este archivo — es un gasto recurrente diario en Duffel que corre solo, y la norma de "cualquier cosa que pueda mover la factura, se dice" (ver más abajo) aplica igual a algo que ya existe y no se sabía que existía. Nadie ha tocado su código en esta sesión.

### Scripts de generación (`worker/kv/`)

| Script | Modelo | Output | Coste aprox |
|--------|--------|--------|-------------|
| `generate.js` | Claude Sonnet | Nivel 1 — `dest:{cc}:base` + `kw:*` | ~$0.90 / 193 países |
| `generate-nivel2.js` | Claude Sonnet | Nivel 2 — `dest:{cc}:destinos` | ~$2.50 / 193 países |
| `generate-nivel25.js` | Claude Haiku | Nivel 2.5 — `dest:{cc}:practical` | ~$1.20 / 193 países |
| `generate-nivel3.js` | GPT-4o-mini (cron) | Nivel 3 — `route:{cc}:{dest}:{days}` | ~$0.06 / ruta |

**Otros scripts KV:** `upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`, `upload-spots-bulk.cjs`, `upload-transport.js`, `upload-wrangler.js`, `enrich-spots.cjs`, `stats.js`, `stats-nivel2.js`

### Situación real verificada 16 sept 2026 (esta sesión, sin tocar código ni desplegar nada)

- **No se han leído claves ni valores reales del KV** — el conector de Cloudflare disponible en esta sesión solo gestiona namespaces (crear/listar/borrar), no tiene una herramienta para leer/listar claves concretas dentro de un namespace, y esta sesión no tiene credenciales de `wrangler login` ni un `CLOUDFLARE_API_TOKEN` en el entorno para usar la CLI directamente. Para saber cuántas de las 193 fichas están realmente pobladas (nivel 1/2/2.5) o cuántas rutas nivel 3 hay cacheadas de verdad, hace falta `npx wrangler kv key list --binding=SALMA_KB --remote -c wrangler.toml` desde un sitio con esas credenciales (portátil de Paco, o una sesión sin este bloqueo).
- **Sí se ha confirmado, vía la API de Cloudflare, que los 2 namespaces (`SALMA_KB`, `ROAD_GEOM`) existen y sus IDs coinciden exactamente con `wrangler.toml`** — no hay namespace huérfano ni desalineado.
- **Sí se ha confirmado, comparando el código fuente que Cloudflare devuelve del Worker desplegado contra `salma-worker.js` de esta rama (equivalente al `main` de hoy), que el contenido coincide** — se buscaron marcadores específicos del último fix de facturación (15 sept, `photocache/`, `verifiedspot:`, `opts.previousStops`, `nearbycache:`) y los 4 están presentes en el Worker en producción. No se ha podido comparar el `Current Version ID` exacto (ese dato solo lo expone `/version` en tiempo de ejecución, y la red de este contenedor sigue bloqueando `salma-api.paco-defoto.workers.dev`, mismo bloqueo ya documentado el 14 sept) — pero a nivel de código, **lo desplegado y lo que hay en el repo hoy son lo mismo**. Esto responde a varios "pendiente: confirmar `/version`" que quedaban sueltos en el 🔴 Crítico de la factura de Google Places.
- **Los 15 endpoints nuevos y las claves de Vigilancia de Vuelos (`fw:`, `fw_alerts:`, `flight_watch_users`) y del cron diario de Duffel llevaban invisibles en este archivo** desde que se implementaron — no se ha encontrado ningún commit que los documentara aquí. Añadidos en este barrido (ver tablas de arriba).

### 🔍 Reconstruido 16 sept 2026: qué pasó con la subida de KV de abril ("se borró todo a los 30 días")

Paco recordaba haber subido nivel 1+2+3 en abril y haber perdido todo a los 30 días — un coste
real de generación tirado. Este contenedor tenía un **clon `shallow` de git que cortaba justo
antes de abril** (el primer commit visible era del 25 de abril); se arregló con
`git fetch --unshallow origin` para poder mirar el historial completo. Con eso, esto es lo que
sale del código real, no de memoria:

- **Nivel 1/2 (`dest:{cc}:base` / `:destinos`)**: revisados **todos** los scripts de subida que
  han existido en el repo (`upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`,
  `upload-wrangler.js`, `scripts/progressive-load.js`) — **ninguno, nunca, les ha puesto
  caducidad.** Si estos también se perdieron, no fue por TTL — solo se confirma mirando el KV
  real.
- **Nivel 3 (`route:{cc}:{región}:{días}`) — sí hay una causa concreta y verificada por código**:
  hay dos caminos distintos que escriben la MISMA clave:
  1. El pipeline masivo (`scripts/progressive-load.js`) sube con `wrangler kv bulk put`
     **sin ninguna caducidad** — permanente por diseño.
  2. El motor de chat en vivo — desde el primer commit que metió caché de rutas
     (`21bf3e97`, **25 marzo 2026**, sigue igual hoy) — cada vez que una ruta generada en el
     chat (o el cron de los miércoles, `_cronNivel3`) coincide con esa misma clave, la
     reescribe con `expirationTtl: 2592000` (30 días), **a propósito**, para que el caché de
     uso normal no se quede rancio.
  Si una clave subida permanente por el camino 1 se vuelve a tocar por el camino 2 (alguien
  pide esa misma ruta en el chat, o el cron de los miércoles la regenera sin saber que ya
  existía — su índice `_index:routes` nunca se entera de lo que sube el pipeline masivo), pasa
  de permanente a caducar en 30 días **sin que nadie lo decidiera**. Encaja con lo que describe
  Paco.
- **La red de seguridad que se construyó para esto nunca llegó a producción.** El 12 de abril
  2026 se montó un sistema completo de backup (cron semanal Worker→R2 de todo el KV, script
  manual `backup-kv.js`, restauración documentada) — commit `74b3ee26`, en la rama
  `claude/brave-satoshi`. **Esa rama nunca se fusionó a `main`** (confirmado con
  `git merge-base --is-ancestor` — no es ancestro). Hoy no existe ni el fichero
  `backup-kv.js` ni el cron de backup ni `_cronBackup` en `salma-worker.js` — comprobado en el
  código actual. Si el nivel 3 se perdió en abril, no había ninguna copia de seguridad real
  corriendo que lo hubiera evitado, y **sigue sin haberla hoy**.

**Pendiente de decidir con Paco**: revisar y traer `claude/brave-satoshi` a `main` antes de
subir países otra vez (para tener red de seguridad real esta vez), y separar las dos vías que
escriben `route:` — o el pipeline masivo usa un prefijo/clave distinto al del chat en vivo, o
se le añade el mismo `_index:routes` para que el cron y el chat sepan "esto ya está subido
permanente, no lo toques".

### 📦 16 sept 2026 — Dos ramas huérfanas con datos KV reales, recuperables, sin fusionar

Buscando qué se podía recuperar de lo perdido en abril, salió una **tercera rama** que nadie
había mencionado hasta ahora, con contenido real y completo:

- **`claude/priceless-shannon`** (commit `2ca8c901`, **3 abril 2026**, no es ancestro de
  `main`) — `worker/kv/output-nivel2/` con **los 193 países completos** (destinos, spots,
  keywords, transporte por país), más su propio script de subida (`upload-nivel2-now.mjs`)
  y una suite de tests (`test-suite.js`, `test-salma.js`). Confirmado con
  `git log --all --diff-filter=D` que **nunca se ha borrado ni un solo fichero de esa
  carpeta en ninguna rama** — está exactamente como se dejó ese día.
- **`claude/brave-satoshi`** (commit `38175703`, 12 abril, ver más arriba) — además del
  sistema de backup, trae `worker/kv/transport-routes/{es,th,np,vn}.json` (68 rutas + 21
  aeropuertos verificados) intactos, con `upload-transport-routes.js`.
- **Lo que NO aparece en ninguna rama, nunca**: nivel 1 (solo Vietnam en todo el historial)
  y nivel 3 más allá de las 11 rutas de Nepal que ya hay en `main`. Si se generó más de
  esto y no se comiteó, no hay copia en git — solo podría estar en un backup del Desktop
  de Paco, fuera del repo.

**Plan propuesto (sin ejecutar, pendiente de que Paco lo revise desde su ordenador)**: no
fusionar las ramas enteras (arrancan de puntos de `main` muy viejos, chocarían con medio año
de rediseños) — traer solo los JSON de datos a la carpeta `worker/kv/` de hoy
(`git checkout <rama> -- worker/kv/output-nivel2/` y lo mismo con `transport-routes/`) y
subirlos con los scripts de subida, revisando antes que esos scripts solo escriben en KV
(gratis) y no disparan de paso ninguna llamada a Google Places/Anthropic/OpenAI (ver norma de
coste del punto 8 del protocolo antes de ejecutar cualquier subida).

**Paco decidió (16 sept) aparcar esto hasta tener el ordenador delante** — no investigar más
por ahora. Retomar cuando lo pida, empezando por esta sección en vez de desde cero.

**JSONs de respaldo en `worker/kv/`:** `countries.json` (195 países base), `_index.json`, `_nivel2_1.json`

El worker inyecta datos KV en el contexto de Claude → menos tokens, más rápido, más barato.

---

## Design System (styles.css)

### Variables CSS (`:root`)
```css
--negro: #060503;
--dorado: #f0b429;
--dorado2: #ffc947;
--crema: #f5f0e8;
--blanco: #fff;
--gris: #141209;
--gris2: #1e190f;
--linea: rgba(240,180,41,.22);
--linea-fuerte: rgba(240,180,41,.45);
--rojo: #ef4444;
--verde: #4ade80;

--font-display: 'Bebas Neue';
--font-body: 'Inter';
--font-tight: 'Inter Tight';
--font-mono: 'JetBrains Mono';

--radius: 14px;
--radius-sm: 10px;
--radius-pill: 999px;
```

### Estructura visual
- `.app-header` — fijo top 56px, glass (`backdrop-filter:blur(12px)`)
- `.app-content` — `padding-top:56px; padding-bottom:80px`
- `.app-input-bar` — fijo bottom 56px, glass, z-index 1100
- `.chat-bg-layer` — fondo mapa con overlay oscuro
- Bottom bar — 4 tabs con iconos SVG inline

---

## SEO — 3 niveles

### 1. Guías públicas (dinámicas)
- Cada guía guardada → `public_guides/{slug}` en Firestore
- URL: `borradodelmapa.com/ruta-2-dias-cadiz-xxxx`
- `404.html` las renderiza (sin backend) — incluye chat inline con Salma
- CTA: "Viaja con alguien que sabe lo que hace"
- OG meta tags dinámicos desde Firestore
- Sitemap dinámico en el worker (`/sitemap-guides.xml`)

### 2. Blog (12 artículos)
- `/blog/` con index + artículos standalone
- Tono Salma, estructura "Sin Salma" (caótico) vs "Con Salma" (resuelto)
- Schema.org Article en cada uno
- CTA "Pregúntale a Salma" → `/?go=chat`
- Artículos: sin-hotel, pasaporte-robado, idioma, avería, vuelo-cancelado, enfermo-extranjero, perder-avion, robo-tarjeta, viajar-solo, presupuesto-real, maleta-perfecta, seguro-de-viaje

### 3. Destinos (1793 páginas)
- `/destinos/` con páginas HTML estáticas por destino
- Generadas con `scripts/build-destinos.js` desde KV nivel 2
- 301 en sitemap (estratégicos), resto indexable pero fuera del sitemap
- Chips featured en welcome controlados por Paco

### Pipeline SEO (`scripts/`)
- `build-destinos.js` — genera HTML desde KV JSONs. Flags: `--country`, `--dry-run`
- `grow-sitemap.js` — añade N países al sitemap por prioridad turística. Default: 5
- `publish-destinos-salma.js` — publica rutas KV como guías públicas en Firestore (⚠ tiene credenciales hardcoded)
- `progressive-load.js` — orquestador: genera nivel2 → nivel3 → HTML → publica → sitemap → KV

### Sitemap
- `sitemap.xml` → sitemap index en el dominio
- `sitemap-static.xml` (2 URLs), `sitemap-blog.xml` (13 URLs), `sitemap-destinos.xml` (301 URLs)
- Worker sirve `sitemap-guides.xml` con guías públicas dinámicas
- `robots.txt` → apunta a `borradodelmapa.com/sitemap.xml`

---

## Modelo de negocio — Salma Coins

- **Plan gratuito**: 3 rutas con IA (para siempre), 20 mensajes/día
- **Salma Coins**: créditos que NO caducan, reembolsables si no se usan
- **Packs**: Starter (10 / 4,99€), Viajero (25 / 9,99€), Explorador (60 / 19,99€)
- **Costes**: vuelos (1), hoteles (1), ruta IA (2), copiloto (3), emergencia (2), resumen (1)
- **Stripe**: Checkout funciona (modo test). PENDIENTE: webhook server-side + pasar a live
- **Coste real por ruta**: ~0.015€ (margen ~97%)
- **Validación**: coins se envían desde frontend, Worker NO valida server-side

---

## UI actual

- **Welcome**: "Viaja con alguien que sabe lo que hace", input con placeholder rotativo, chips (rutas guardadas o featured), recordatorios de notas
- **Chat**: avatar Salma inline (20px) + nombre, texto a ancho completo, cámara, voz, retry 18s
- **Bottom bar**: Home (solo guests), Chat, Rutas (requiere login), Perfil (Entrar si no logueado)
- **Perfil**: avatar subible (R2), stats (coins, rutas gratis, total guías)
  - TU VIAJE: Mis Notas, Galería, Cuaderno de Viaje, Documentos del Viajero
  - SEGURIDAD: SOS Emergencia (configurable, SMS Twilio + WhatsApp, cola offline)
  - CUENTA: Salma Coins, ¿Qué puedo hacer?
- **Mapa live**: Google Maps fullscreen, GPS, brújula, capas POI (restaurantes/farmacias/hoteles/súpers/parques/cultura/tránsito), tipos de mapa, diario Kodak, pins, compartir
- **Vista itinerario**: fullscreen con tarjetas de paradas + mapa de ruta + turn-by-turn + enrichment Places
- **Copiloto**: tarjeta info práctica del país activada por geoloc (emergencias, frases, apps, salud, conectividad)
- **Footer legal**: Destinos (dorado), Blog, Aviso legal, Privacidad, Cookies, Términos

---

## Features implementadas — Inventario completo

### Chat y conversación
- [x] Streaming SSE con Claude Sonnet
- [x] Historial de conversación (últimos 20 turnos)
- [x] Detección de intención de ruta (regex: días, fechas, transporte, niños)
- [x] Pre-pregunta de fechas antes de generar ruta
- [x] Rate limiting client-side (10 msg/60s)
- [x] Retry automático a los 18s
- [x] Sanitización de URLs (whitelist de ~50 dominios)
- [x] Formateo: negritas, enlaces, teléfonos, imágenes

### Rutas y guías
- [x] Generación de rutas con Claude Sonnet
- [x] Verificación con Google Places (coords, fotos, nombre)
- [x] Rutas largas (>7 días) por bloques con GPT-4o-mini
- [x] Enriquecimiento background con GPT-4o-mini (context, food, sleep, eat)
- [x] Guardar guía en Firestore + offline en localStorage
- [x] Editar guía existente via chat
- [x] Eliminar guías (Firestore + public_guides + localStorage)
- [x] Publicar guía pública (URL compartible con slug SEO)
- [x] Vista itinerario a pantalla completa
- [x] Acordeón por días con mapa Leaflet
- [x] Fotos reales Google Places por parada (lazy load)
- [x] Google Maps links por parada y por día
- [x] KV caché de rutas pre-generadas (nivel 3)

### Mapas
- [x] Google Maps dinámico (mapa live a pantalla completa)
- [x] Leaflet como fallback
- [x] Marcadores por día con colores
- [x] Polyline de ruta (Google Directions)
- [x] Turn-by-turn navigation panel
- [x] GPS tracking con marcador azul
- [x] Brújula (DeviceOrientation, iOS permission flow)
- [x] Capas POI: restaurantes, farmacias, hoteles, supermercados, parques, cultura, tránsito
- [x] Tipos de mapa: roadmap, satélite, híbrido, terreno
- [x] Selector de ruta guardada sobre mapa live
- [x] Parada más cercana (chip dinámico por GPS)

### Diario y galería
- [x] Captura de ubicación + foto → postal Kodak (canvas 1080x1920)
- [x] Subida de fotos a R2
- [x] Galería con álbumes
- [x] Compartir via WhatsApp / Web Share API / descargar
- [x] Pins permanentes en el mapa
- [x] Bitácora agrupada por país
- [x] Timeline de días con notas y fotos por parada
- [x] Compartir redes: imagen post (1080×1350), story (1080×1920), carrusel

### Vídeo
- [x] Generador de vídeo Canvas (540x960, 30fps)
- [x] Estilo documental (título + mapa animado + fotos Ken Burns + cierre)
- [x] Estilo historia (fotos a pantalla completa)
- [x] Mapa animado con ruta y paradas

### Notas
- [x] CRUD completo en Firestore
- [x] Tipos: nota, recordatorio, hotel, vuelo, restaurante, lugar, visado, transporte
- [x] Filtro por país y tipo
- [x] Recordatorios con fecha (vencido/hoy/mañana/en N días)
- [x] Adjuntos (fotos y documentos en R2)
- [x] "Guardar nota" desde burbujas del chat (>150 chars)
- [x] Auto-guardado de notas desde tools (country notes)
- [x] Recordatorios en welcome screen (próximos 7 días)
- [x] Migración automática del formato legacy (paises → notas)

### Documentos del viajero
- [x] CRUD en Firestore (`users/{uid}/travel_docs`)
- [x] Categorías: pasaporte, DNI, visado, seguro, alquiler, transporte, otro
- [x] Subida múltiple de archivos a R2 (max 10MB)
- [x] Alertas de caducidad (vencido, crítico <30d, próximo <90d, ok)
- [x] Vista previa de imágenes y PDFs inline

### Tools (búsquedas de servicios)
- [x] Vuelos (Duffel) con link Skyscanner
- [x] Hoteles (Booking.com RapidAPI) + redirect Airbnb
- [x] Coches de alquiler (Booking.com RapidAPI)
- [x] Lugares/restaurantes (Google Places) con Maps link
- [x] Fotos de lugares (Google Places Photos)
- [x] Búsqueda web (Brave Search + scraping top 2)
- [x] Generación de vídeo
- [x] Guardado de notas

### Narrador
- [x] Chip "Narrador" en pantalla de inicio del chat, con popup explicativo antes de
      activarlo (añadido 10 sept — antes no tenía ningún botón accesible)
- [x] Check cada 30s de POIs cercanos (Google Places, radio 20m — reducido desde 500m el
      10 sept a petición de Paco)
- [x] Toast del narrador: sin auto-cierre, solo se cierra con la X (antes se cerraba solo
      a los 10s y no daba tiempo a leer — cambiado el 10 sept)
- [x] Narración con GPT-4o-mini (personalidad Salma)
- [x] Push notifications
- [x] Deduplicación por place_id/nombre
- [x] TTS con ElevenLabs / Web Speech API

### Copiloto
- [x] Detección de país por GPS (Nominatim reverse geocoding)
- [x] Info práctica del país desde KV nivel 2.5
- [x] Tarjeta colapsable: emergencias, frases, apps, salud, conectividad, presupuesto

### Voz
- [x] Input por voz (Web Speech API, es-ES, modo continuo)
- [x] Output TTS (ElevenLabs primary, Web Speech fallback)
- [x] Toggle voz on/off persistente (localStorage)

### Cámara / Fotos en chat
- [x] Cámara o galería desde el chat
- [x] Compresión local (canvas, max 10MB)
- [x] Envío a Claude Vision (base64)
- [x] Guardado persistente en R2 + Firestore galería

### Auth y perfil
- [x] Email/contraseña + Google Sign-In
- [x] WebAuthn/fingerprint (parcial — recuerda email)
- [x] Avatar subible (R2 + Firestore)
- [x] Estadísticas: coins, rutas gratis (3), total guías
- [x] SOS emergencia: 3 contactos, SMS Twilio, WhatsApp links, cola offline, rate limit
- [x] Onboarding 3 slides

### Pagos (Stripe)
- [x] 3 packs: Starter (10/4.99€), Viajero (25/9.99€), Explorador (60/19.99€)
- [x] Stripe Elements card form inline
- [x] PaymentIntent server-side
- [x] Actualización de coins en Firestore tras pago
- [ ] PENDIENTE: webhook Stripe para confirmar pago server-side

### SEO
- [x] Guías públicas por URL slug (404.html trick)
- [x] 12 artículos de blog con Schema.org
- [x] 1,793 páginas de destinos
- [x] Sitemap index con 4 sitemaps
- [x] Sitemap dinámico de guías (worker)
- [x] OG meta tags dinámicos
- [x] Chips featured en welcome

### PWA
- [x] manifest.json (standalone, portrait)
- [x] Service Worker (sin caché offline, push ready)
- [x] Instalable desde móvil

### V2 Mapa (11 abril 2026)
- [x] Norte explícito (heading:0) + anti-tilt en ambos mapas
- [x] Tap en brújula resetea norte (setHeading(0))
- [x] Brújula siempre visible al abrir mapa
- [x] Fetch directions paralelo con carga API (-200-800ms)
- [x] Preconnects para maps.googleapis.com y maps.gstatic.com
- [x] Buscador Google Places Autocomplete en diario-picker
- [x] Geocoding fallback (Enter sin seleccionar sugerencia)
- [x] Búsqueda marca lugar con pin + picker completo (FOTO/IR AQUI/GUARDAR)
- [x] Botones centrar/tipo/capas movidos al diario-picker
- [x] Botón SOS en picker — si configurado ejecuta, si no abre config
- [x] SOS como overlay encima del mapa (no cierra live-map)
- [x] Paneles tipo/capas se cierran al cerrar picker
- [x] Botón I'M FINE (verde, tick) sustituye FOTO+GALERIA
- [x] I'M FINE abre menú Cámara/Galería
- [x] Pins guardados persisten en Firestore (carga al abrir mapa)
- [x] Eliminar pin borra de Firestore
- [x] Pins con marker grande tipo gota dorada
- [x] Popup pin: Ir aquí + Compartir + Eliminar
- [x] Compartir: "Estoy muy bien!!! Mira donde estoy!!!" + Google Maps + borradodelmapa.com
- [x] Story: logo BORRADO(negro)DEL(dorado)MAPA(negro)
- [x] Story: fondo mapa terrain via worker proxy /staticmap
- [x] Endpoint /staticmap en worker (proxy Google Static Maps, evita CORS)
- [x] Dark theme para .pac-container (Autocomplete)

---

## Pendiente / Problemas conocidos

> **Este es el único archivo de pendientes del proyecto — no crear otro.** Auditado contra
> el código real (no contra memoria ni contra lo que decía esta lista antes) el 10 sept
> 2026, porque el trabajo se pide unas veces por Code y otras por chat normal y esta lista
> llevaba tiempo sin coincidir con lo que hay realmente desplegado. Ver "Metodología y
> límites" al final de esta sección antes de fiarte de que está completa.
>
> **Cuando Paco diga "anota esto pendiente" (o algo parecido):** añadirlo aquí mismo, en
> el subapartado que corresponda (🔴 Crítico / 🟡 Importante / 🔧 Deuda técnica), hacer
> `commit` y `push` **directo a `main`** antes de terminar el turno — no dejarlo en una
> rama suelta que no se fusiona. Solo funciona si la sesión tiene este repo enlazado
> (Code/Cowork); un chat normal sin el repo no puede tocar este archivo, así que si el
> pendiente surgió ahí hay que traerlo a mano a una sesión con el repo. Esto es justo lo
> que causó el desfase que motivó el barrido del 10 de septiembre — no repetirlo.

### 📱 Salma en WhatsApp (F5)

- **14 sept 2026: Paco trae los primeros documentos de diseño para llevar a Salma a
  WhatsApp como canal adicional (no sustituye la web).**
  **F5.1 (webhook de eco) — FUSIONADO Y DESPLEGADO (14 sept), sin confirmar en
  pantalla/WhatsApp por Paco todavía.**
  Endpoint nuevo `POST /whatsapp` en `worker/salma-worker.js` (junto al bloque `/sos`,
  mismo patrón de llamada a la API de Twilio que ya usa el SOS): parsea el payload
  `application/x-www-form-urlencoded` de Twilio (no JSON), valida la firma
  `X-Twilio-Signature` (HMAC-SHA1 con `TWILIO_AUTH_TOKEN`, algoritmo verificado contra
  el vector de prueba oficial de la documentación de Twilio antes de dar el código por
  bueno) y responde con un eco fijo. Sin IA, sin Firestore todavía — es justo el
  alcance de F5.1, validar que la tubería Twilio → Worker → respuesta funciona de
  extremo a extremo.
  **Desplegado 14 sept 2026 ~21:15 UTC vía GitHub Action "Deploy Worker" (run #13,
  commit `4a1aea0`). `Current Version ID: 65fb5bfa-c2a9-4ed0-a996-332dd2bfeda3`** — leído
  directo del log del deploy; esta sesión no pudo confirmarlo además contra `/version`
  porque el proxy de red del contenedor bloquea las llamadas salientes a
  `salma-api.paco-defoto.workers.dev` (política de la organización, no del Worker) —
  Paco o una sesión sin esa restricción puede comprobarlo con
  `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`.
  **Falta, antes de poder probarlo de verdad:**
  1. Secret nuevo en Cloudflare: `TWILIO_WHATSAPP_FROM` (el número de sandbox, algo
     como `whatsapp:+14155238886` — mirar el valor exacto en el panel de Twilio,
     WhatsApp Sandbox Settings). Esta sesión NO tiene credenciales de Cloudflare para
     ponerlo — hace falta que Paco lo haga: `npx wrangler secret put
     TWILIO_WHATSAPP_FROM -c wrangler.toml` desde `worker/`, o desde el dashboard.
     `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` ya están puestos (se usan para el SOS).
  2. Activar el Twilio Sandbox de WhatsApp si no está ya (F5.0) y unirse mandando
     `join <código>` al número de sandbox desde el WhatsApp de Paco.
  3. En la consola de Twilio: Sandbox → "When a message comes in" → URL
     `https://salma-api.paco-defoto.workers.dev/whatsapp`, método POST.
  Con los 3 pasos hechos, Paco manda un WhatsApp al número de sandbox y confirma si le
  llega el eco — hasta entonces, F5.1 sigue sin cerrar (el Worker ya corre el código,
  pero nadie lo ha probado de punta a punta todavía).
  - Documentos recibidos: `Salma-WhatsApp.md` (documento técnico completo — arquitectura,
    proveedor, plantillas, casos de uso, plan de fases F5.0-F5.6) y
    `whatsapp-webhook-eco.js` (borrador de código para F5.1: webhook mínimo de eco sobre
    Twilio Sandbox — solo existe en la conversación, no está guardado en el repo).
  - **Arquitectura propuesta**: Twilio (webhook + envío) → endpoint nuevo en el Worker
    (`/whatsapp`, sin decidir si en `salma-worker.js` o archivo aparte) → Firestore
    `whatsapp_sessions/{numero}` (historial, uid vinculado, estado) → mismo
    motor/prompt/tools de Salma que ya existen → Cloudflare Queues para respuestas que
    tardan (búsquedas externas) → Twilio de vuelta. Las rutas guardadas usarían el mismo
    esquema Firestore que la web (el documento dice `rutas/{uid}/...`; en este proyecto
    real es `users/{uid}/maps/{mapId}` — contrastar nomenclatura antes de implementar).
  - **Proveedor**: Twilio para todo (ya se usa para el SOS por SMS) — número, webhook,
    envío y plantillas. Se descartaron Meta Cloud API directa (más trabajo de
    cumplimiento propio) y 360dialog (solo compensa a partir de ~10.000 msgs/mes).
  - **Bloqueo actual**: la verificación de negocio de Meta (obligatoria para producción
    real) exige alta como autónomo, y Paco no está dado de alta todavía. Mientras tanto
    se arrancaría con **Twilio Sandbox** (número compartido, testers se unen con
    `join <código>`, sesión caduca a 72h, solo plantillas de ejemplo predefinidas) —
    mismo SDK/código, solo cambian credenciales y número al migrar a producción.
  - **Plan de fases** (documento completo `Salma-WhatsApp.md`, recuperar de los archivos
    subidos si se retoma en otra sesión):
    - F5.0 — trámite Twilio + activar Sandbox (no bloquea desarrollo)
    - F5.1 — webhook mínimo + eco (borrador de código ya listo, sin IA ni Firestore)
    - F5.2 — conectar con el motor de Salma (texto libre, sin memoria entre mensajes)
    - F5.3 — memoria (`whatsapp_sessions`) + tools (búsquedas) + Cloudflare Queues
    - F5.4 — vinculación de cuenta (código de un solo uso, número ↔ uid)
    - F5.5 — proactivo con plantillas reales (requiere alta autónomo + verificación Meta)
    - F5.6 — exploración a futuro (modo grupo, ubicación en tiempo real, marca blanca)
  - **Cambio de coste a vigilar**: desde el 1 de octubre de 2026 los mensajes de
    servicio/utility de WhatsApp dentro de la ventana de 24h dejan de ser gratis —
    afecta al margen del canal, hay que llevarlo aparte del ~97% de margen de la web.
  - **Decisiones abiertas según el propio documento**: si el endpoint va en
    `salma-worker.js` o en archivo aparte; diseño del prompt "modo chat corto" para
    WhatsApp; dónde/cómo se genera el código de vinculación de cuenta (web o WhatsApp,
    entrega por email o chat); textos de las primeras plantillas (bienvenida, alerta de
    precio); y el alta como autónomo de Paco, condición previa para F5.5 y para
    producción real (fuera del ámbito técnico).
  - **Confirmado por Paco (14 sept):** el documento menciona Kiwi.com y Trivago, pero
    eso está desactualizado — los proveedores reales y correctos son **Duffel**
    (`buscar_vuelos`) y **Booking.com vía RapidAPI** (`buscar_hotel`/`buscar_coche`),
    igual que en el resto de la app. Cuando se implemente WhatsApp, usar estos dos tal
    cual ya están en el Worker — no añadir ni Kiwi ni Trivago.
  - **Ajustes al plan, propuestos por la sesión y aceptados por Paco (14 sept) — a
    aplicar cuando se desarrolle, no ahora:**
    1. **Async sin Cloudflare Queues.** El documento propone Queues para F5.3
       (responder rápido al webhook y mandar el resultado real después). Este proyecto
       no usa Queues en ningún sitio hoy, y montarlas (activar el producto, worker
       consumidor aparte, binding en `wrangler.toml`) es más infraestructura de la que
       hace falta. Empezar con `ctx.waitUntil()` dentro del propio Worker: Twilio no
       espera la respuesta real, así que el Worker puede seguir trabajando en segundo
       plano tras devolver el 200 OK y mandar el mensaje real por su cuenta. Pasar a
       Queues solo si en producción real aparece un problema concreto (reintentos,
       sobrecarga) que lo justifique.
    2. **Validar la firma de Twilio (`X-Twilio-Signature`) desde F5.1-F5.2, no
       "antes de producción".** El borrador de código lo deja como TODO para más
       adelante. Pero en cuanto F5.2 conecte con el motor real de Salma, una URL de
       webhook sin proteger deja que cualquiera que la descubra dispare búsquedas de
       vuelos/hoteles/Places/GPT-4o-mini a costa de Paco sin pasar por WhatsApp de
       verdad. Meterla ya en F5.1-F5.2.
    3. **Decidir antes de F5.3 cómo cuentan los límites del plan gratis** (3 rutas
       gratis, 20 msg/día) para un número de WhatsApp sin vincular a un `uid`. Si cada
       número suelto empieza "de cero" en Firestore sin relación con el límite real de
       ningún usuario, alguien podría abrir sesiones de sandbox indefinidamente para
       saltárselo. Cerrar esta decisión de negocio antes de escribir el código de
       F5.3, no parchearla después.
    4. **Unificar el formato de negritas a un solo asterisco (`*negrita*`) para web
       y WhatsApp por igual — idea de Paco (14 sept), mejor que traducir el formato
       canal por canal.** WhatsApp ya renderiza `*texto*` como negrita de forma nativa;
       si Salma emite esa misma convención, no hace falta ninguna traducción en el
       post-procesado del canal WhatsApp. Toca dos sitios cuando se implemente:
       - `worker/salma-worker.js` línea 189 (`BLOQUE_FORMATO`): cambiar la instrucción
         de `**Negritas**` a `*Negritas*` (y los ejemplos de la línea 196).
       - `app.js` línea 5873, único sitio del código vivo que convierte el markdown de
         Salma a HTML (`html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')`) — sin
         duplicados en `guide-renderer.js`/`bitacora-renderer.js`/`mapa-itinerario.js`
         (comprobado, no lo tocan). Cambiar el regex a un solo asterisco.
       **Decisión de Paco (14 sept): no hace falta compatibilidad con el formato
       viejo.** Las guías y notas ya guardadas en Firestore con `**doble asterisco**`
       pueden quedarse mostrando los asteriscos sueltos — Paco es el único usuario
       activo del proyecto ahora mismo, así que perder ese detalle visual en contenido
       antiguo no importa. El regex de `app.js` se cambia limpio a un solo asterisco
       (`\*(.+?)\*`), sin lógica de doble formato ni migración de Firestore.
  - **No tocar código de esto sin que Paco lo pida explícitamente** — estamos en fase de
    estudio de los documentos, no de desarrollo.

### 🔴 Crítico — verificado ahora mismo

- **Facturación de Google Places disparada a 82,26€ en los primeros 14 días de sept
  (+15.420% vs periodo anterior) — auditoría completa + fixes DESPLEGADOS, 15 sept
  2026, sin confirmar en pantalla.** Paco vio el cargo en Google Cloud Billing
  (Find Place 21,21€, Atmosphere Data 19,54€, Places Photo 18,79€, Contact Data
  22,19€) y pidió estudiar el Worker línea por línea, no solo los dos sitios obvios.
  Fusionado a `main` (commit `14955c6`) y desplegado (GitHub Action "Deploy Worker"
  run #17, **Worker Version ID `fa3b910f-b941-4b63-bd5e-7a17a9aca5f0`**) — esta
  sesión no pudo confirmarlo además contra `/version` porque el proxy de red del
  contenedor bloquea las llamadas salientes a `salma-api.paco-defoto.workers.dev`
  (mismo bloqueo ya documentado el 14 sept, política de la organización, no del
  Worker) — Paco o una sesión sin esa restricción puede comprobarlo con
  `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`.
  **Arreglado:**
  1. Narrador: `/nearby-pois` (Nearby Search de pago) se pedía cada 55-60s aunque el
     usuario estuviera parado — ahora solo si se movió >30m desde el último check
     real (`salma.js:checkNearbyPOIs`). El botón "Olvidar avisos" y el chequeo
     forzado al activar el Narrador se reseteó aparte para que sigan disparando al
     momento, no se vean bloqueados por el nuevo gate.
  2. `/photo`: las fotos de Google Places ya se guardan en R2 (bucket `SALMA_PHOTOS`
     existente, prefijo `photocache/`, hash del `photo_reference`) la primera vez y
     se sirven de ahí siempre después — antes cada visualización de una guía ya
     generada volvía a pagar la misma foto a Google, indefinidamente. `/place-details`
     reutiliza la misma caché en vez de pegarle a Google por su cuenta.
  3. `buscarLugar`/`searchPlacesForHelp` (tool `buscar_lugar` + búsqueda automática de
     ayuda en 6 de las 8 categorías): ya no piden `rating`/`price_level`/
     `opening_hours` a Place Details — esos datos ya venían gratis en el Text Search
     anterior (o, en el caso de `opening_hours` de `searchPlacesForHelp`, no se
     usaban en ningún sitio del código). Lo que sí hace falta (teléfono, web) se
     cachea 30 días en KV por `place_id` (`placedetails:{place_id}:{fields}`).
  4. `verifyAllStops` (la función que verifica cada parada al generar o editar una
     ruta — el mayor cargo de los cuatro): al editar/regenerar una ruta guardada,
     las paradas cuyo nombre coincide exacto con una ya verificada se copian tal
     cual, sin llamar a Google (por la ruta anterior, `opts.previousStops`, o por
     una caché KV de 30 días `verifiedspot:{país}:{nombre}` entre rutas distintas
     de usuarios distintos). Además, `opening_hours`/`editorial_summary` — que no se
     leen nunca del candidato de Find Place, solo del Place Details posterior — se
     quitaron del `FIELDS` de Find Place, y en el Place Details final solo se piden
     si esa parada concreta aún no los tiene. **A propósito NO se tocó el backoff de
     attempt2/attempt3** (los reintentos con radio mayor / Text Search cuando Find
     Place falla) — es lo único de toda la auditoría con riesgo real de bajar la
     calidad de verificación en vez de solo el coste (son los que rescataron los
     faros de la ruta costera de la saga del 11-12 sept) — queda pendiente de
     decidirlo con Paco aparte, no se recortó a lo bruto.
  5. `searchNearbyPlaces` (flujo "quiero ir a..."): caché KV 7 días por tipo + celda
     de ~1km — cien personas preguntando por el mismo destino no disparaban cien
     Nearby Search idénticas.
  Nada de esto cambia lo que ve el usuario en una ruta ya verificada — solo evita
  repetir llamadas a Google que no aportaban nada nuevo. `?v=` de `salma.js` subido
  a 87 en `index.html`.

  **REGRESIÓN encontrada y arreglada el mismo día (16 sept 2026): fotos rotas en el
  itinerario tras el fix de arriba.** Paco reportó (captura de "Playa de Penarronda"
  en una ruta ya generada) icono de imagen rota en las tarjetas del itinerario.
  Causa: el guardado en R2 de la foto (punto 2 de arriba) se lanzaba en segundo plano
  sin esperar a que terminase; el JSON de `/photo?...&json=1` (usado por
  `mapa-itinerario.js`, `guide-renderer.js`, `mapa-ruta.js`, `app.js`,
  `bitacora-renderer.js`, `salma.js`) devolvía una URL apuntando directo al fichero de
  R2, que si aún no existía daba 404 → icono roto. Fix: esa URL ahora apunta a nuestro
  propio `/photo?ref=X` (siempre válido, resuelve de R2 o de Google al vuelo) en vez
  del fichero de R2 directo, y el guardado en R2 ahora usa `ctx.waitUntil()` para no
  cortarse a medias. **No cambia el coste** — misma llamada a Google que ya estaba
  contada arriba, solo corrige qué URL se entrega. Fusionado a `main` (commit
  `6136baf`) y desplegado (GitHub Action "Deploy Worker" run #18, **Worker Version ID
  `bf3db6a4-fdf2-4bef-992c-12a75ce5583f`**).

  **SEGUNDA vuelta de la misma regresión, mismo día — causa real: caché HTTP del
  navegador, no el Worker.** El fix de arriba SÍ se desplegó bien (confirmado con el
  log de Paco: `[FOTO] url recibida` seguía devolviendo el patrón viejo
  `/photo/photocache/<hash>.jpg` con el Worker ya en `bf3db6a4`), pero las respuestas
  de `/photo?...&json=1` y `/place-details` llevaban `Cache-Control: max-age=86400`
  (24h) — cualquier navegador que hubiera pedido esa misma foto ANTES del primer fix se
  quedó sirviendo, de su propia caché, la respuesta vieja con la URL rota, sin volver a
  preguntarle nada al Worker aunque este ya estuviera arreglado. Diagnosticado gracias a
  un log de diagnóstico añadido a propósito en `mapa-itinerario.js` (`console.log` al
  pedir cada foto + `onerror` en el `<img>`, `?v=56`) que confirmó que el fetch SÍ
  llegaba y SÍ traía una URL — solo que la URL en sí era la vieja. Fix: esas 3
  respuestas (son solo un puntero a la foto, no la imagen) pasan a `Cache-Control:
  no-store` — la imagen real sigue con su caché fuerte de 1 año en `/photo?ref=X`, eso
  no cambia. **Coste: cero cambio en llamadas a Google** — `no-store` solo afecta a
  cuántas veces el navegador pregunta al propio Worker por la URL (barato), la caché en
  R2 que evita pagarle a Google sigue intacta. Fusionado a `main` (commit `08db8c8`) y
  desplegado (GitHub Action "Deploy Worker" run #19, **Worker Version ID
  `23a51468-183a-4aea-8ba8-fc2017077818`**).

  **CONFIRMADO EN PANTALLA por Paco (16 sept) — con matiz importante sobre `no-store`.**
  El `no-store` de arriba es correcto pero **no es retroactivo**: solo evita que el
  navegador guarde la respuesta a partir de ese despliegue, no invalida una copia que
  ya tuviera guardada de antes (con la regla vieja de 24h) — mientras esa copia siga
  "fresca" según la política con la que se guardó, el navegador ni siquiera vuelve a
  preguntarle al Worker. Por eso, tras desplegar el fix, Paco SEGUÍA viendo la URL
  rota — hasta que borró manualmente "imágenes y archivos en caché" desde Chrome
  (Configuración → Privacidad y seguridad → Borrar datos de navegación), momento en
  el que la ruta cargó bien. Con el `no-store` ya desplegado, esto no debería volver a
  hacer falta para nadie que pida una foto POR PRIMERA VEZ a partir de ahora — el borrado
  manual solo hizo falta esta vez porque el caché ya estaba puesto desde antes.
  **Narrador parado — CONFIRMADO EN PANTALLA por Paco (16 sept, Luarca), con log
  completo revisado línea por línea.** Primer check a las 10:56:38; durante los 10
  minutos siguientes (hasta desactivarlo a las 11:06:35) la posición nunca se movió
  más de ~23m del punto comprobado — **cero checks adicionales** en toda esa ventana
  (antes del fix habría sido una Nearby Search de pago cada 60s sin parar). Al
  reactivarlo (11:19:58) el chequeo forzado saltó al instante, como está diseñado. Al
  moverse de verdad y superar los 30m (11:21:15), volvió a chequear solo y narró
  correctamente la Casa Natal de Severo Ochoa. Comportamiento exactamente el buscado.

  **Sigue pendiente, lo único que queda de toda esta saga**: que Paco genere o edite
  una ruta real para confirmar que el resto de los fixes de facturación
  (`verifyAllStops`, `buscar_lugar`) no cambiaron nada de lo que ve en una ruta nueva.

- **Botón de expandir/minimizar el tiempo — REVERTIDO, 15 sept 2026.** Se probó
  quitar el label "SEP" de la cabecera y poner ahí el toggle de expandir/minimizar
  el tiempo, más grande y visible (commit `cf6fcd5`). Paco pidió revertirlo
  ("retrocede, déjalo como estaba") — deshecho con `git revert --no-edit cf6fcd5`
  (commit `960dd78`, nunca se reescribe historia). Vuelto exactamente a como
  estaba: "SEP" de nuevo en la cabecera, el toggle pequeño (`.wx-toggle`, sin
  fondo ni borde) de vuelta dentro del propio banner del tiempo. `?v=` bajados de
  vuelta: `salma.js` a 86, `app.js` a 107, `styles.css` a 95. **Sin nada pendiente
  de esto** — cerrado, no se retoma salvo que Paco lo pida de nuevo explícitamente.
- **Enlace "Abrir en Google Maps" de sitios buscados (buscar_lugar/hoteles) no
  llevaba a ningún sitio — 15 sept 2026, DESPLEGADO, sin confirmar en pantalla.**
  Reportado por Paco con "Camping Playa de Tapia": el enlace salía bien pintado
  ("📍 Abrir en Google Maps") pero al tocarlo no resolvía nada — lo probó pegando el
  `place_id` a mano en la app de Google Maps y dio "No hay resultados". Causa: 8 sitios
  del Worker generaban el enlace con el formato viejo `maps/place/?q=place_id:XXX` —
  un `place_id` pegado ahí sin más no es un formato de URL que Maps sepa resolver de
  forma fiable por sí solo (mismo tipo de fallo que ya se arregló el 10 sept para los
  enlaces "Cómo llegar", que entonces tampoco llevaban `?api=1`). Fix: función nueva
  `mapsPlaceFichaUrl(name, placeId)` con el esquema oficial de Google (Search Action:
  `search/?api=1&query=<nombre>&query_place_id=<id>`), que si localiza el sitio exacto.
  Reemplazado en los 8 sitios que generaban el enlace roto: `searchNearbyPlaces`,
  `findPlace` (verify), 2 casos en `buildMapsLinksFromStops`, 2 handlers de
  `buscar_lugar`/restaurantes, y `searchHotelsGoogle`/`searchPlacesGoogle`. Sin cambios
  en frontend — no hace falta `?v=`. **Desplegado (commit `dbae99a`, GitHub Action
  "Deploy Worker" run #16, Worker Version ID `34214c93-395a-4a24-a544-4af9ba3acf56`).
  Pendiente: que Paco pida otro sitio (restaurante, camping, hotel...) y confirme que
  el enlace "Abrir en Google Maps" sí abre el sitio correcto esta vez.**
- **Chip "parada más cercana" del mapa decía 30km cuando la distancia real por
  carretera eran 44km — 15 sept 2026, FUSIONADO, sin confirmar en pantalla.** Reportado
  también desde Mondoñedo. Causa: `_updateNearestChip()` en `app.js` (~línea 4050) usa
  `_haversineKm` — línea recta entre el GPS del usuario y la parada, no la carretera
  real. En zonas de costa/montaña con curvas (como Galicia) la diferencia puede ser
  grande. **Arreglo aplicado ahora, deliberadamente parcial**: el chip ya dice "44.0 km
  recta" en vez de "44.0 km" a secas, para que no se lea como si fuera la distancia real
  de carretera — cambio de una línea, sin coste, desplegado ya.
  **Lo que NO se ha hecho, a propósito, y necesita que Paco decida**: calcular la
  distancia real de carretera (Directions API) en vez de la línea recta. No es trivial
  porque este chip se recalcula en cada posición GPS nueva (`watchPosition`, cada ~5s
  mientras se mueve) — pedir Directions esa frecuencia dispararía el coste y el rate
  limit de Google sin necesidad. Si se quiere la distancia real, habría que limitar
  cuánto se pide (ej. solo cuando cambia la parada más cercana, o cada X minutos, con
  caché) — a definir con Paco antes de tocar esto, no se ha implementado.
  `?v=` de `app.js` subido a 104 en `index.html`. **Fusionado a `main` (commit
  `ac24571`) y ya en GitHub Pages.**
  **Distancia real de carretera — implementada, 15 sept, FUSIONADO, sin confirmar en
  pantalla.** Confirmado con Paco: sí la quiere, con el límite de 5 minutos que él
  mismo propuso (~$0,005/llamada Directions API — a 5 min, céntimos por hora de
  viaje en vez de varios euros). Implementado en `app.js`: `_updateNearestChip()`
  sigue calculando la línea recta al momento (instantáneo, sin coste) pero ahora,
  si la parada más cercana está a ≥1km, además dispara `_fetchRealNearestDistance()`
  — llama al `/directions` del Worker (ya existía, no hace falta tocar el Worker) y
  cachea el resultado en `_nearestChipRealDist` — **solo si cambió la parada más
  cercana desde la última vez, o pasaron ≥5 min**, nunca en cada GPS tick (~5s). En
  cuanto llega la respuesta, el chip pasa de "X km recta" a la distancia real de
  Google (ej. "44 km"), sin la palabra "recta". Si Directions falla o no hay red, se
  queda con "recta" hasta el siguiente intento — nunca se bloquea ni rompe el chip.
  `?v=` de `app.js` subido a 107 en `index.html`. **Pendiente: que Paco conduzca un
  rato con el mapa live abierto y confirme que el chip pasa de "recta" a la
  distancia real a los pocos segundos, y que se actualiza si cambia de parada.**
- **`FOTO_TAG: palabra` se veía como texto crudo en el chat al identificar un lugar con
  la cámara — 15 sept 2026, FUSIONADO, sin confirmar en pantalla.** Mismo reporte de
  Mondoñedo: la respuesta sobre la catedral (correcta en contenido) terminaba con
  "FOTO_TAG: monumento" visible tal cual. Mismo bug exacto que `HISTORIA_LUGAR` (ver
  commit `0e0dcef`, 14 sept, arreglado horas antes por la otra sesión) pero en
  `FOTO_TAG`, que nunca había tenido el mismo tratamiento — de hecho no existía NINGÚN
  `.replace()` de `FOTO_TAG` en todo `salma.js`. El Worker sí lo quita del `reply` final,
  pero eso solo llega a pantalla si el evento `done` dispara un re-render; si no, se
  queda el texto ya streameado en vivo, marcador incluido. Añadido en los mismos dos
  sitios donde ya se ocultan `SALMA_ACTION`/`HISTORIA_LUGAR` (chunk en vivo + re-render
  del done). `?v=` de `salma.js` subido a 81 en `index.html`. **Fusionado a `main`
  (commit `7232e6d`) y ya en GitHub Pages. Pendiente: que Paco confirme en pantalla
  identificando un lugar con la cámara.**
  **Propuesta de Paco, sin implementar todavía**: añadir un botón de "foto" fácil de
  encontrar dentro del propio módulo Narrador, ya que identificar por foto SÍ dio el
  resultado correcto mientras el Narrador por GPS no — a valorar cuando confirme si el
  fix de coordenadas de arriba ya resuelve el problema de raíz o si además conviene el
  atajo.
- **"Ver ruta completa" en el modal de mapa (map-modal.js) solo pintaba 1 parada de
  varias — 14 sept 2026, FUSIONADO Y DESPLEGADO, sin confirmar en pantalla.** Reportado
  por Paco con ruta "4 rías" (Galicia): el chat
  generó bien la guía con varias paradas, pero al tocar "🗺️ Ruta completa en Google
  Maps" el modal fullscreen solo mostraba el marker "1", sin las demás. Causa: el
  mismo día (commit `2894d00`, "sincronizar rama con main") el Worker cambió el
  formato del enlace de ruta — de mandar `lat,lng` puros a mandar **nombre del lugar +
  `place_id`** por parámetro separado (`origin_place_id`/`waypoint_place_ids`/
  `destination_place_id`), buscando enlaces más fieles (bug real que arregló: una
  parada con ficha en Google salía con el nombre de otro negocio al lado). Pero
  `map-modal.js` se había arreglado el día ANTES (commit `bcfa6ca`, 13 sept) asumiendo
  justo el formato viejo — solo sabía leer `origin`/`waypoints`/`destination` como
  texto y nunca miraba los `*_place_id`, así que cada parada se re-buscaba por nombre a
  ciegas (`findPlaceFromQuery`, sin sesgo geográfico) en vez de usar el ID que el
  Worker ya había verificado contra Google — y esa búsqueda por nombre falla a menudo
  con pueblos/miradores pequeños (exactamente el tipo de parada de una ruta de rías).
  Fix: `_extractDest()` ahora también parsea los `*_place_id` de la URL, y
  `_resolvePoint()` los usa con `getDetails()` como fuente primaria (mismo ID, fiable)
  — solo cae a `lat,lng`/búsqueda por nombre si no hay `place_id` para ese punto. El
  destino único ("Cómo llegar" a una sola parada) se dejó intacto a propósito (sigue
  sin usar `placeId`, como ya estaba) para no ampliar el cambio más allá del bug
  reportado. `?v=` de `map-modal.js` subido a 10 en `index.html`. **Fusionado a `main`
  (fast-forward, commit `d0604b5`) y ya en GitHub Pages** — solo queda que Paco repita
  "ruta completa" de una guía con varias paradas y confirme que salen todas numeradas.
- **Fotos del chat a veces salen como markdown crudo (`![Nombre](https://salma-api...` +
  URL larguísima de 200-300 caracteres pegada como texto/enlace, en vez de la imagen) —
  14 sept 2026, FUSIONADO Y DESPLEGADO, sin confirmar en pantalla.** Mismo reporte de
  las 4 rías: la foto de "Costa da Morte" salió
  así. Causa, en dos capas — la propia `salma-worker.js` ya documentaba (comentario
  previo a este fix, línea ~9171) que "Sonnet a veces emite `![Name](` + saltos de línea,
  o `![Name](url...` que nunca cierra con `)` (URL de foto larga truncada al copiarla)":
  Claude tiene que teclear literalmente el `photo_ref` de Google Places dentro del
  markdown (`buscar_foto` se lo da ya hecho y le pide que lo copie), y ese token es un
  string opaco de 200+ caracteres sin significado — un caso conocido de los LLM al
  reproducir cadenas largas al carácter. Ya había un "reparador" para el caso "nunca
  cierra", pero:
  1. Solo cubría el caso sin `)` de cierre. Si Claude colaba un espacio u otro carácter
     de más EN MEDIO del token pero el markdown sí llegaba a cerrar con `)`, el reparador
     no lo tocaba (su regex exigía que lo siguiente al `(` fuera literalmente un salto de
     línea/`![`/fin de texto) — y el frontend tampoco lo reconoce como imagen (su regex
     de `![alt](url)` exige que la URL no tenga espacios), así que se veía el markdown +
     URL en crudo, justo el síntoma reportado.
  2. Ese reparador vivía DENTRO de un bloque `try` enorme (post-procesado: enlaces Maps,
     fotos, días, etc.) cuyo `catch` de emergencia (línea ~9654) manda `allText` —el
     texto sin reparar de ningún tipo— si CUALQUIER cosa de ese bloque lanza una
     excepción (muy plausible justo con la intermitencia de red de esa sesión, ver más
     abajo: varias llamadas a Google Places dentro de ese mismo bloque). En ese caso el
     reparador ni siquiera llegaba a ejecutarse.
  Fix: la lógica de reparación se movió a una función (`_repairBrokenPhotoMarkdown`,
  declarada junto a los mapas `_hotelPhotosByName`/`_placePhotosByName`, de los que ya
  se tira la URL BUENA — la que devolvió Google, nunca la que Claude haya podido teclear
  mal) que ahora cubre los dos casos: con nombre reconocido, SIEMPRE sustituye por la
  URL correcta (cierre bien o mal el markdown de Claude); sin nombre reconocido, solo
  quita el fragmento si de verdad nunca cerró (mismo comportamiento de antes ahí). Y se
  llama tanto en el sitio de siempre como dentro del `catch` de emergencia, para que un
  fallo en cualquier otra parte del post-procesado no deje pasar el markdown roto sin
  reparar. Probado con 4 casos en Node (roto-con-nombre, truncado-con-nombre,
  bien-formado-sin-nombre, ya-correcto) — los 4 se comportan como se espera.
  **Desplegado dos veces 14 sept 2026 vía GitHub Action "Deploy Worker" disparada
  manualmente: primero ~17:35 UTC desde la rama (commit `1416f57`,
  `Current Version ID: 9f6e0d21-4989-4285-8338-909c9418afdf`), y otra vez ~17:43 UTC ya
  desde `main` tras fusionar (commit `d0604b5`, `Current Version ID:
  7b9a94b0-563d-4783-b271-d08e4e76c0d3` — este es el vigente, el anterior queda
  superado).** Rama y `main` ya están sincronizados (fast-forward limpio, sin
  conflictos) — no hay riesgo de que un deploy futuro desde `main` pise este arreglo.
  **Falta**: que Paco pida una foto de un lugar en el chat y confirme que sale como
  imagen, no como texto/markdown crudo.

  **Añadido justo después (14 sept, commit `d5aa423`, Worker `Current Version ID:
  430aab22-5c2a-4a6e-85d7-d515cdd07d48`, YA DESPLEGADO): keepalive en "BLOQUE E"
  (`validarYCorregirLinksMaps`).** Paco reprodujo el "network error" generando una ruta
  justo después del deploy anterior — sin relación con el fix de fotos de arriba, es la
  misma familia de bug que el de PASO 3 (verify): BLOQUE E hace HEAD-checks a los
  enlaces de Google Maps de cada parada (hasta 15, 3s cada uno) sin mandar nada por el
  stream mientras espera, así que la conexión puede cortarse por silencio con la ruta
  ya generada pero sin llegar a mostrarse. Se le puso el mismo keepalive de 3s que ya
  tenía el verify. **CONFIRMADO EN PANTALLA por Paco** — generó otra ruta después del
  deploy y esta vez no se cortó.

  **Foto como imagen: CONFIRMADO EN PANTALLA por Paco (captura de Luarca, Asturias) —
  las 2 fotos salieron como imagen de verdad, no como texto.** El "primero sale la URL
  larga" que describió es solo el texto en vivo mientras Salma "escribe" (sin reparar
  todavía, normal); se corrige solo en cuanto el Worker manda el `done`.

  **Bug nuevo encontrado en esa misma captura, arreglado — 14 sept, commit `0e0dcef`,
  solo frontend (`salma.js?v=80`), YA EN GITHUB PAGES, sin confirmar en pantalla:**
  `HISTORIA_LUGAR: Luarca Asturias` salía como texto plano al final del mensaje. El
  Worker ya lo quita del `reply` final y lo manda aparte como `data.historia_lugar`
  (para el botón "📖 Historia de..."), pero el frontend solo aplicaba ese `reply`
  limpio si el evento `done` disparaba un re-render (enlaces Maps nuevos, etc.) — la
  mayoría de las veces no lo dispara, y se queda el último texto ya streameado tal cual
  lo escribió Claude, marcador incluido. `SALMA_ACTION:{...}` ya se ocultaba así
  durante el streaming; a `HISTORIA_LUGAR:` le faltaba el mismo tratamiento — añadido
  en los mismos dos sitios de `salma.js`. **Falta**: que Paco pida otra foto/historia y
  confirme que ya no sale el marcador en texto.

  **Aviso para la próxima sesión — `main` local corrupto detectado en este contenedor,
  no en GitHub:** al fusionar, `git checkout main` en esta sesión aterrizó en un commit
  (`c4bc918`, "Historial de consultas siempre visible...", 8 sept) que **no comparte
  ningún ancestro común** con el `main` real de GitHub (`git merge` dio "refusing to
  merge unrelated histories"). No es un problema del repo en GitHub — `origin/main`
  estaba bien, con sus 153 commits hasta hoy; era solo el puntero `main` LOCAL de este
  contenedor concreto el que apuntaba a una instantánea vieja y desconectada (probable
  resto de cómo se preparó este contenedor, no un caso de historia perdida real — el
  propio trabajo de esta sesión ya partía correctamente de `origin/main`). Se arregló
  con `git checkout -B main origin/main` (realinea el puntero local con el remoto, no
  toca nada en GitHub) antes de fusionar. Si otra sesión en OTRO contenedor ve el mismo
  "unrelated histories" al tocar `main`: no es la catástrofe del 5 sept, es este mismo
  problema de puntero local — comprobar con `git merge-base main origin/main` (si da
  vacío, es esto) y aplicar el mismo arreglo, nunca forzar un merge de historias no
  relacionadas a ciegas.
  **Dos síntomas más del mismo reporte, investigados, SIN tocar código:**
  1. *Buscador del mapa fullscreen ("Buscar hoteles, farmacias...") no responde* — no
     se ha encontrado la causa exacta; Paco mismo apuntó que puede no merecer la pena
     arreglarlo porque este modal es candidato a desaparecer con la propuesta "mapa
     siempre visible" (V5, ver 🟡 Importante). Queda pendiente de decidir, no de
     diagnosticar más a fondo por ahora.
  2. *"Se ha aturrullado" + `Stream read error: TypeError: network error` (3 veces en
     los logs del panel 🐛, sesión de las 15:49/17:01/17:14)* — el Worker ya tiene
     keepalive activo durante generación y verificación de rutas (cada 3s), así que no
     parece un timeout del servidor. La captura de pantalla de Paco muestra señal móvil
     floja (Orange, 6.2 K/s) en ese momento — coincide con el mismo patrón de
     intermitencia de red ya documentado el 13 sept (curl con timeout, Copiloto
     "Failed to fetch") que se concluyó que no era bug de la app. No se ha tocado nada;
     si se repite con buena señal, ahí sí habría que mirar con `wrangler tail` en vivo.
     (Dato nuevo de este barrido: el bloque de post-procesado que puede estar fallando
     por esa misma intermitencia — ver fix de fotos justo arriba— hace varias llamadas a
     Google Places seguidas; si el `catch` de emergencia salta a menudo por eso, sería
     una pista más a mirar con `wrangler tail` si se repite.)
- **Legal incompleta** — `legal.html` sigue con `[PENDIENTE]` en 5 sitios: nombre del
  titular, CIF/NIF, dirección y email de contacto (obligatorio LSSI/GDPR).
- **Ruta de Ronda pintó el mapa en Benahavís/San Pedro de Alcántara (13 sept) — fix
  desplegado (commit `c33faccb`, worker `408e65a7`), SIN confirmar en pantalla por Paco
  con el escenario exacto.** Diagnóstico distinto del que se sospechaba al principio: NO
  era el bug de ancla tipo "Lisboa" (`7bef91f`) — el destino sí se resolvía bien a Ronda
  real. La causa era que `verifyAllStops()` medía la distancia de cada parada al ancla en
  **línea recta** (`haversineKm`), y con el radio de 3-4 días (120km, además el doble de
  lo que el propio prompt promete en la línea 223: 60km) Benahavís/San Pedro/Estepona
  quedaban dentro. Por carretera real (única vía de montaña, A-397) Estepona son 83km/1h40
  — coincide casi exacto con el "~80km" que describió Paco — mientras que Grazalema/Setenil
  (pueblos blancos legítimos cerca de Ronda) se quedan muy por debajo en ambos cálculos.
  Confirmado con `/directions` real antes de tocar código (ver commit para las cifras).
  Fix: nueva `drivingDistanceKm()` (Directions API) sustituye la línea recta en la "red de
  seguridad" final de `verifyAllStops`, con el radio alineado al prompt (30km 1-2 días,
  60km 3-4 días). Probado UNA vez en pantalla tras desplegar: Ronda 3 días salió limpio
  (Cueva de la Pileta, Benaoján, Montejaque — nada de costa), pero Paco cortó la sesión
  antes de repetir la prueba a fondo — pendiente de una confirmación más sólida.
  **Limitación conocida, aceptada por Paco de momento:** Benahavís/San Pedro (43-52km
  reales, <1h de coche) siguen dentro del radio de 60km y podrían seguir apareciendo — no
  se apretó más el radio a propósito, a la espera de ver si molesta en la práctica.
  **Sin tocar, pendiente aparte:** el filtro por localidad/provincia de más abajo en la
  misma función (3+ días) sigue comparando por texto de provincia sin distancia real —
  para Ronda esto es contraintuitivo porque los pueblos blancos "buenos" (Grazalema,
  Setenil, Zahara) están en Cádiz, no en Málaga como Ronda, así que ese filtro podría
  relegarlos a "cerca de" en vez de dejarlos en la ruta principal. No se ha visto pasar en
  pantalla, solo detectado leyendo el código — investigar si da problemas.
### ✅ Ya resuelto (estaba aquí como pendiente y ya no lo es)

- **Narrador dando información de sitios equivocados (3 bugs seguidos) — 15 sept 2026,
  CONFIRMADO EN PANTALLA por Paco en Lourenzá/Lorenzana (Lugo): "ha funcionado, me ha
  dado dos datos, uno centro de interpretación de las fabas/fabes y datos de la Iglesia
  ahora sí correctos".** Empezó con un solo síntoma (narración de un homónimo de otra
  región, una ceramista de Mallorca en vez de lo real) y al investigar salieron tres
  causas distintas apiladas, las tres arregladas:
  1. `/narrate` (Worker) recibía `lat`/`lng` del POI pero nunca los usaba en el prompt
     de Claude Haiku — sin pista de ubicación narraba el homónimo más documentado en
     vez de investigar qué hay real en ese punto. Commit `7232e6d`, Worker Version ID
     `b46ebb37-611c-43b1-ab36-7a27237998af`.
  2. `/nearby-pois` (Worker) mandaba a Google Nearby Search una lista de tipos separada
     por `|` en el parámetro `type`, que solo admite un valor — Google ignoraba el
     filtro en silencio y devolvía cualquier sitio cercano sin filtrar (así se coló una
     tienda de artesanía delante de una catedral), y encima cortaba a los 5 primeros
     resultados de Google por relevancia ANTES de calcular distancia, dejando fuera del
     todo a un monumento real si no estaba entre esos 5. Commit `ac24571`, Worker
     Version ID `17b47adf-97cf-46f2-ad84-3bc27d7d74d4`.
  3. Radio de detección en 20m (bajado desde 500m el 10 sept) — demasiado ajustado para
     un edificio grande, cuyo pin de Google puede no coincidir con dónde se para el
     usuario en la plaza. Subido a 50m. Commit `805271f`, `salma.js?v=82`.
  De paso se aclaró que el chip "en línea recta" del mapa (ver crítico arriba, sin
  confirmar todavía) es un bug distinto y separado, sin relación con estos tres.
  **Foto en el aviso del Narrador — implementado el mismo 15 sept, sin confirmar en
  pantalla.** Propuesta de Paco justo tras confirmar que ya iba bien: cuando salta el
  toast/burbuja del Narrador, mostrar también una foto del sitio para poder comparar a
  simple vista que es el mismo que tiene delante. `/nearby-pois` ya devolvía
  `photo_ref` por POI (no hacía falta tocar el Worker) — solo faltaba pintarlo en
  frontend. Añadida `<img>` (vía el proxy ya existente `GET /photo?ref=...`) tanto en
  `showNarratorToast` (toast flotante) como en la burbuja de chat cuando la vista de
  itinerario está abierta (`_processNarratorQueue`), con `onerror` que la quita sola si
  el sitio no tiene foto en Google — no pasa nada visible si no hay imagen. Clases CSS
  nuevas en `styles.css`: `.narrator-toast-photo` (bleed a los bordes del toast) y
  `.narrator-msg-photo` (dentro de la burbuja). **Pendiente: que Paco recargue y
  confirme que la foto aparece y ayuda a verificar que es el mismo sitio.**

  **Al probar la foto, "no salta" — investigado, NO es un bug, es el antibucle
  funcionando tal como se diseñó el 10 sept.** Paco reactivó el Narrador en el mismo
  punto de antes (Lourenzá) y no volvió a avisar de nada — el log solo mostraba
  "Narrator check" sin ninguna cola ni toast detrás, sin error. Causa: `checkNearbyPOIs`
  descarta en silencio cualquier POI que ya esté en `_narratorNotified` (dedup por
  `place_id`), y ese set se restaura desde `sessionStorage` en cada `startNarrator()` —
  o sea que apagar y encender el Narrador NO lo resetea, solo cerrar la pestaña del
  todo. Como la Iglesia y el Centro de las Fabas ya estaban notificados de la prueba de
  hace un momento, quedaron descartados sin más.
  **Añadido a petición de Paco ("Sí, añádelo"): botón "Olvidar avisos" en el propio
  módulo del Narrador — 15 sept, FUSIONADO, sin confirmar en pantalla.** Antes, tocar el
  chip "Narrador" estando ya activo lo desactivaba directo. Ahora abre un menú
  (`showNarratorActiveMenu()` en `app.js`, reutiliza el modal de
  `showNarratorConfirm()`) con dos opciones: "Olvidar avisos" (llama a la función nueva
  `salma.resetNarratorNotified()` — vacía el Set y borra la clave de `sessionStorage`,
  sin desactivar el Narrador) y, más abajo, "Desactivar Narrador" (el comportamiento de
  antes). CSS nueva `.narrator-active-stop` en `styles.css`.
  **De paso, arreglado un bug menor encontrado al tocar esta misma función**: 4 sitios
  llamaban a `showNarratorToast('texto', 3000)` con un número de "duración" que la
  función nunca soportó (no hay auto-cierre, solo la X, según quedó decidido el 10
  sept) — ese segundo argumento es en realidad `poi`, así que ese número se colaba como
  si fuera un POI y el toast renderizaba "📍 undefined" debajo del título. Quitados los
  números sueltos en los 4 sitios (`app.js`).
  **"Olvidar avisos" no iba del todo — arreglado, 15 sept, FUSIONADO.** Paco lo probó:
  desactivar+reactivar sí hacía saltar el aviso, pero "Olvidar avisos" solo a veces.
  Causa: el botón limpiaba la lista de sitios vistos pero no forzaba ningún chequeo —
  el siguiente real no llegaba hasta el próximo tic del `setInterval` (cada 60s),
  mientras que desactivar+reactivar sí llama a `checkNearbyPOIs()` al momento
  (`startNarrator()` ya lo hacía así). Ahora `resetNarratorNotified()` también resetea
  `_narratorLastCheck` y llama a `checkNearbyPOIs()` de inmediato si el Narrador sigue
  activo — mismo efecto instantáneo que apagar/encender, sin tener que hacerlo.
  **Chip "Narrador" en verde cuando está activo — añadido a petición de Paco, 15 sept,
  FUSIONADO.** No había ninguna pista visual de que estuviera encendido (las clases CSS
  `bottom-tab-narrator-on`/`narrator-pulse` existían desde antes pero no las usaba
  ningún JS — código muerto). Añadida clase `.chat-empty-chip--narrator-on` (fondo/borde
  verde, `--verde`) aplicada en dos sitios: al pintar el chip (`renderChip` en `app.js`,
  ya mira `salma._narratorActive`) y al cambiar de estado sin recargar la pantalla
  (`updateNarratorChipUI()`, nueva, llamada tras activar/desactivar desde los menús).
  `?v=` subidos: `salma.js` a 85, `app.js` a 106, `styles.css` a 93, en `index.html`.
  **Botón de cerrar (X) del toast ilegible sobre la foto — arreglado, 15 sept,
  FUSIONADO.** Paco lo reportó tras la foto de la entrada de arriba: la "X" tenía solo
  color de texto tenue (`rgba(...,.4)`) sin fondo, y la foto (que sangra hasta los
  bordes del toast con margen negativo) queda justo debajo, camuflándola. Le puse fondo
  circular oscuro semitransparente (`--radius-pill`) para que se lea encima de
  cualquier imagen. `?v=` de `styles.css` a 94.
  **Chip en verde — causa real encontrada, arreglado, 15 sept, FUSIONADO.** Con
  `app:106`/`styles:94` confirmados cargados (Paco probó hasta en incógnito para
  descartar caché) y el Narrador realmente activado (`[Salma] Narrador activado` en el
  log, sin bloqueo de notificaciones), el chip seguía sin ponerse verde — no era caché
  ni un fallo de lógica en JS. Causa real: existe una capa CSS más nueva y más
  específica del rediseño de septiembre, `.chat-empty .chat-empty-chip` (línea ~6430),
  que fija su propio `background`/`border`/`color` para TODOS los chips — con más
  especificidad (dos clases) que mi regla `.chat-empty-chip--narrator-on` (una clase),
  así que ganaba siempre sin importar el orden en el archivo. El chip SOS ya tenía este
  mismo problema resuelto con su propia regla más específica
  (`.chat-empty .chat-empty-chip--sos`, línea 6439) — se replicó el mismo patrón para
  el verde (`.chat-empty .chat-empty-chip--narrator-on`). `?v=` de `styles.css` a 95.
  **Pendiente: que Paco recargue y confirme que el chip se pone verde de verdad esta
  vez.**
  **Aparte, no confirmado si vio el toast "Permite notificaciones y ubicación..."
  cuando probó en incógnito (con las notificaciones bloqueadas por política del propio
  Chrome incógnito, no por la app) — sin acción pendiente, solo queda anotado por si
  vuelve a probar ahí.**
  **Toast "Narrador desactivado" con auto-cierre — CONFIRMADO EN PANTALLA por Paco,
  probado 2 veces.** El `autoCloseMs` añadido a `showNarratorToast()` funciona: el
  toast se borra solo a los 3s al desactivar, sin tener que tocar la X.

- **Pago roto en producción (Fase 1+2 de `docs/pasarela-premium.md`) — 14 sept 2026,
  CONFIRMADO EN PANTALLA por Paco: comprado un plan anual de test, `premium_until` se
  acreditó y la app muestra "Premium hasta 14 de septiembre de 2027".** Fusionado a `main`
  (commit `c775ab5`). La Fase 1 (Worker: `/create-payment` reescrito a Checkout por
  planes + `/stripe-webhook` con verificación de firma e idempotencia) ya estaba en
  `main` desde el 7 sept. Lo que faltaba y se cerró hoy es la Fase 2: `app.js`
  (`openCoinsModal`) seguía con el flujo viejo de coins (`{client_secret}` +
  `stripe.confirmCardPayment`), incompatible con lo que el Worker nuevo devuelve
  (`{url}` de una Checkout Session) — de ahí que no funcionara nada. Se reescribió el
  modal a "Hazte Premium" (4 planes, redirige a Stripe Checkout hospedado) y se añadió
  el manejo de `?pago=ok` (sondea `premium_until` en Firestore) / `?pago=cancel`.
  **3 secrets nuevos puestos en Cloudflare** (antes ninguno lo estaba, por eso los
  primeros intentos fallaban): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `FIREBASE_SERVICE_ACCOUNT` (JSON de cuenta de servicio de Firebase — descargado de
  Firebase Console → Configuración del proyecto → Cuentas de servicio; da acceso de
  administrador a Firestore, solo lo usa el webhook). Webhook de Stripe creado
  apuntando a `/stripe-webhook`, evento `checkout.session.completed`, probado con
  "Vuelve a enviarlo" hasta dar 200 antes de dar la Fase por buena.
  **Sigue en modo test** (`sk_test_`) — pasar a `sk_live_` es un cambio de 2 secrets
  cuando Paco decida cobrar de verdad (ver más abajo, "Stripe sigue en modo test").
  **Sin hacer todavía, a propósito (Fases 3-4 del documento, no bloquean el cobro):**
  gates de uso free/premium, migración de coins existentes a días de Premium, contadores
  de fair use, y el prompt de Salma sigue mencionando "coins" en vez de "Premium" — el
  stat "COINS" del perfil también se queda como está hasta entonces.

- **Historia reactivada (cápsula ampliable en guías + chat) — 13 sept, CONFIRMADO EN
  PANTALLA por Paco.** Fusionada a `main` (`623b41e`) y Worker desplegado (GitHub Action
  "Deploy Worker", run #7, Version ID `dd949a07-6415-4ae8-9694-9be8bb4ff373`). Se
  reactivó `historia.js`/`historia.css` (desactivados desde el 7 sept) y se añadió un
  modo compacto (`historiaModule.renderCompactInto`): botón "📖 Historia de X" por parada
  en `guide-renderer.js`/`mapa-itinerario.js` (oculto si Claude marca la parada
  `con_historia:false`) + uno de país en la cabecera, y uno bajo la respuesta del chat
  con el marcador nuevo `HISTORIA_LUGAR:X` (mismo patrón que `SALMA_ACTION`/`FOTO_TAG`).
  Backend: reutiliza `/historia-lugar` (Claude Haiku + foto Google Places + caché KV 30
  días). También se quitó un chip antiguo redundante que navegaba fuera del chat.
  **Probado por Paco pidiendo "3 días en Ronda": botón sale en todas las paradas y
  funciona de verdad — contenido real generado (ej. historia de Pedro Romero para el
  restaurante homónimo).** Necesitó reintentar 2-3 veces en varias paradas antes de
  cargar — coincide con la intermitencia de red de esa misma sesión (`curl.exe` daba
  timeout, Copiloto daba "Failed to fetch", la carga general iba lenta), no parece ser
  un bug de Historia: el botón "reintentar" funcionó tal como está pensado.
  **Cabo suelto — arreglado en código y desplegado (13 sept, commit `01ccdf8`, Worker
  Version ID `faf82643-a8ea-4746-bd60-baff689cf9c9`), PENDIENTE DE COMPROBAR EN
  PANTALLA.** Para "Rte. Pedro Romero Ronda", Claude interpretó la abreviatura de Google
  Maps "Rte." (Restaurante) como si insinuara una "ruta/corredor" — con el matiz que se
  añadió al prompt de `/historia-lugar` para narrar bien carreteras — y generó la
  biografía del torero Pedro Romero a modo de itinerario en vez de la historia del propio
  restaurante. Se aclaró en el prompt que Rte./Avda./C/Pza. son solo nombre o dirección
  de un lugar, no indicio de carretera. **Ojo al probarlo:** ese lugar concreto puede
  seguir cacheado en KV (`historia:rte-pedro-romero-ronda`, TTL 30 días) con la versión
  vieja del torero — si al pulsar "Historia" en ese restaurante sigue saliendo lo mismo,
  no es que el fix no funcione, es la caché; probar con un restaurante distinto con
  abreviatura similar, o borrar esa clave KV a mano para forzar regeneración.
  **Segundo bug real, más grave, arreglado y desplegado (14 sept, commit `b3fd758`,
  Worker Version ID `3eaaab15-b9cd-44ea-817e-012bb59f61e2`), PENDIENTE DE COMPROBAR EN
  PANTALLA.** Paco probó el botón GPS "📍 Historia de aquí" de pie en el Cementerio de
  los Ingleses de Camariñas (Costa da Morte, Galicia — ligado al naufragio del HMS
  Serpent, 1890) y salió la historia del Cementerio de los Ingleses de **Lisboa** (1654,
  homónimo). Causa: el frontend sí manda `lat`/`lng` al Worker, pero el prompt a Claude
  Haiku nunca los incluía — sin pista de ubicación, Claude tira del homónimo más
  documentado en su entrenamiento, no del real. Se añadió el lat/lng como pista explícita
  de desambiguación en el prompt. De paso, la clave de caché KV solo usaba el nombre del
  sitio (`historia:{slug}`) — dos homónimos en lugares distintos se pisaban la caché
  entre sí 30 días; ahora lleva un bucket de coordenadas (~11km) cuando hay GPS
  (`historia:{slug}:{lat}:{lng}`). **Ojo al probarlo — mismo problema de caché que el
  cabo suelto de arriba:** la entrada vieja `historia:cementerio-de-los-ingleses` (sin
  bucket, con la versión de Lisboa) sigue en KV y solo la sirven ahora las peticiones
  SIN coordenadas (búsqueda manual por texto, o el marcador del chat, que no manda
  lat/lng) — el botón GPS ya no la toca porque su clave cambió de formato. Comando para
  borrarla a mano si hace falta: `npx wrangler kv key delete
  "historia:cementerio-de-los-ingleses" --binding=SALMA_KB --remote -c wrangler.toml`
  desde `worker/`.
- **Saga "ruta de los faros" (11-12 sept 2026) — 5 bugs reales encontrados y arreglados,
  todos en `main`. Pendiente de un último redeploy del Worker para el quinto (ver abajo).**
  Todo empezó con "pantalla negra al abrir el mapa de una guía". Se fueron pelando capas:
  1. **Pantalla negra** (`app.js:selectRouteOnMap`, commit `07062dd`) — el filtro de
     coordenadas válidas era `s.lat && s.lng` (deja pasar basura tipo NaN de string o
     fuera de rango). Con eso colado, Google Maps reventaba a media construcción de
     marcadores ("Lat/Long not supported") y dejaba la app oculta con la vista de
     itinerario en blanco, sin ningún aviso. Ahora valida número finito + rango real,
     y si aun así falla algo, `salma.js` deshace el cambio de pantalla y ofrece
     "Reintentar" en vez de quedarse muda.
  2. **Ruta saltando a Lisboa** (`worker/salma-worker.js`, commit `7bef91f`) — para una
     ruta pedida "desde donde estoy" (sin nombre de destino), lo que quedaba de limpiar
     el mensaje se mandaba igual como `dest_hint`, y el Worker lo geocodificaba con
     Google Find Place como si fuera un lugar real — con texto sin sentido, Google
     devolvía cualquier cosa dentro del radio de sesgo, y ESE punto pasaba a ser el
     centro del radio de 35km que valida las paradas. Ahora, si el mensaje es del tipo
     "desde donde estoy/aquí/cerca de mí", no se manda ningún `dest_hint` de texto.
  3. **Orden de paradas sin sentido geográfico** (commit `39c4711`) — el prompt de
     conversión texto→JSON no tenía ninguna instrucción de orden; las paradas salían en
     el orden en que Claude las mencionó en la prosa (agrupadas por tema), no por
     cercanía real. Añadida regla de orden geográfico dentro de cada día.
  4. **Ruta regional entera cramada en 1 solo día** (commit `ca92b2c`) — "si no se indica
     número de días, haz 1 día" no distinguía una ciudad de una ruta/road trip explícita
     por una costa entera. Ahora, para rutas/road trips sin días especificados, calcula
     los días razonables por distancia real en vez de forzar 1.
  5. **Verify descartaba faros reales sin ficha en Google** (commit `f74cfaf`) — regla
     única "sin place_id de Google, la parada no entra" descartaba también sitios reales
     que Google simplemente no indexa como POI (faros pequeños/automáticos). Ahora, solo
     cuando el motivo es "Google no encontró nada" (no cuando encontró algo distinto o
     fuera de rango) y Claude trae coordenadas usables, la parada se mantiene sin
     verificar en vez de desaparecer. **Este es el único de los 5 sin confirmar aún que
     esté desplegado en producción — comprobar `/version` o repetir la prueba de la ruta
     de los faros y mirar si ya no faltan sitios conocidos.**
  De paso salió también todo el lío de Workers Builds perdiendo secrets (ver entrada
  propia arriba) y se montó el GitHub Action de deploy manual — ver esa misma entrada.
- ~~Trabajo perdido en sesiones sueltas~~ → **10 sept, con Paco en el ordenador**: se
  encontraron 9 ramas con commits que solo existían en su portátil (`git log --branches
  --not --remotes`) y se subieron todas a GitHub (`git push origin <ramas>`). La rama del
  KV de Portugal que se temía perdida (`claude/lucid-kirch-e19278`) resultó no tener
  ningún commit propio — no había nada que rescatar ahí. **Nada se perdió al final.**
  Ver "🧵 Ramas rescatadas" más abajo — están a salvo pero siguen sin fusionar a `main`.
- ~~Chat sin auth~~ → `POST /` exige token Firebase (`verifyAuthAndGetUser`); sin token
  responde 401 `auth_required`.
- ~~Coins no validados server-side~~ → se leen de Firestore server-side (comentario en
  el propio código: "P0-2 — no confiar en el frontend").
- ~~`public_guides` sin ownership~~ → `firestore.rules` ya exige
  `request.resource.data.uid == request.auth.uid` al crear, y solo el dueño edita/borra.
- ~~Cookie consent sin UI~~ → GA4 solo se carga tras `cookie_consent === 'all'` en
  localStorage (comentario "P1-6"), hay banner en `index.html`.
- ~~Sin modo offline~~ → `sw.js` (v14) cachea con network-first + fallback a caché +
  fallback a `/index.html`.
- ~~Manifest PWA básico~~ → ya tiene `shortcuts` (Chat, Mis Viajes), icono 512 maskable,
  `share_target`.
- ~~Credenciales en git (`publish-destinos-salma.js`)~~ → esto llevaba **resuelto desde el
  11 de abril** (commit "seguridad: auditoría completa P0-P3"), el email/password van por
  variables de entorno (`SALMA_EMAIL`/`SALMA_PASS`), el script falla si no se le dan. Se
  había apuntado mal como pendiente en el barrido del 10 sept sin comprobarlo del todo —
  error de esa auditoría, no del código.
- ~~Ruta duplicada (`mi-trabajo-local-5sept`)~~ → **10 sept, fusionado a `main`**: el
  commit original solo traía la mitad del arreglo (el prompt); la parte 2 (dedup de
  paradas a <250m con distinto `place_id` de Google) no existía en el código y se escribió
  de cero, probada contra el caso real y contra falsos positivos antes de subir. Paco lo
  desplegó en una rama de prueba, lo probó pidiendo una ruta real y confirmó que iba bien
  antes de fusionar.
- ~~Voz de fallback si falla ElevenLabs (`claude/vigorous-lichterman`)~~ → **descartada,
  10 sept, ya estaba resuelta**: `main` tiene un arreglo equivalente (`_warmUpSpeech` +
  `_elevenLabsDown`) comiteado 3 minutos después que esta rama, el mismo 17 de abril —
  y más completo (desbloquea el sintetizador en el toggle Y en el primer mensaje, no solo
  en el toggle). No hace falta fusionar nada.
- ~~Narrador sin botón~~ → **10 sept, fusionado a `main` y probado por Paco en pantalla**:
  al revisar la rama `claude/optimistic-dhawan` (fix de ráfaga de notificaciones) se
  descubrió que el Narrador no tenía NINGÚN botón que lo activara — `startNarrator()`
  solo lo llamaba un chip (`data-action="explorar"`) que dejó de existir en un rediseño
  anterior. Se añadió el chip "Narrador" (junto a Consultas/Notas/SOS) con un popup
  explicando qué hace antes de pedir ubicación. Esto NO estaba en las listas de
  pendientes anteriores — nadie sabía que el botón faltaba porque no rompía nada, solo
  no hacía nada. Con el botón ya puesto, el fix de la ráfaga de `optimistic-dhawan` (ver
  "🧵 Ramas rescatadas") vuelve a ser relevante — antes de esto era arreglar un problema
  en una función a la que nadie podía llegar.
- **Narrador sin ráfaga (`claude/optimistic-dhawan`)** → **fusionado a `main` el 10 sept**
  (cola de avisos, dedup persistente, separación foreground/background). Código verificado
  (entró limpio, sin restos del bucle viejo) pero **todavía sin probar en pantalla** — la
  ráfaga solo se ve caminando por una zona con varios POIs juntos. Pendiente de que Paco
  lo pruebe con el Narrador activado moviéndose; si algo no cuadra, es sobre esto.
- **GPS confirmado antes de activar el Narrador** → **fusionado a `main` el 10 sept**,
  escrito de cero (no de `claude/vigorous-panini`, que era del 5 abril y chocaba con la
  reescritura del 11 abril y con el chip de hoy — ver detalle en el commit). Antes,
  `startNarrator()` decía "activado" aunque el usuario denegara el GPS, y se quedaba mudo
  para siempre sin avisar. Ahora espera la respuesta real del navegador y si se deniega,
  devuelve `false` (el toast ya existente de app.js lo cubre). **Sin probar en pantalla
  todavía** — Paco lo probará en marcha: bloquear ubicación del sitio, activar Narrador,
  confirmar que avisa en vez de quedarse "encendido" en falso.
- **Enlace "Ver en Google Maps" del narrador** → **fusionado a `main` el 10 sept**
  (`salma.js:showNarratorToast`, `?v=73`). Paco reportó que el enlace del toast del
  narrador (construido con `place_id`/lat,lng del POI) no llevaba a ningún sitio válido;
  como el narrador solo avisa de sitios a <500m, se quitó el enlace en vez de arreglarlo
  — estando delante del sitio no aporta nada. **Pendiente de que Paco lo revise en
  pantalla** (panel 🐛 → confirmar `salma.js?v=73` cargado, activar Narrador cerca de un
  POI, comprobar que el toast ya no muestra el enlace).
- ~~Scroll del chat (`claude/hopeful-goldstine`)~~ → **descartada, 10 sept, ya estaba
  resuelta**: `main` tiene el mismo arreglo palabra por palabra (mismos comentarios,
  misma lógica), comiteado **28 segundos después** que esta rama, el mismo 6 de abril.
  No hace falta fusionar nada.
- ~~Chat modal flotante (`claude/hungry-tereshkova`)~~ → **descartada, 10 sept, ya estaba
  resuelta, por otro camino más tardío**: esta rama (5 abril) borraba un `<div id="chat-modal">`
  completo de `index.html` con su propio input/cámara/micro. Ese bloque **no existe en el
  código actual** — el 7 de septiembre se hizo un rediseño de navegación mucho más completo
  ("Navegación Fase 1" a "Fase 5": barra fija de 4, cabeceras con historial, vista itinerario
  sin monkey-patch) que rehizo esta zona de cero y llegó al mismo sitio por más camino.
  No hace falta fusionar nada.
- ~~Whitelist ferry/bus (`claude/vibrant-bassi`)~~ → **descartada, 10 sept, ya estaba
  resuelta**: los 5 dominios (balearia, ferryscanner, directferries, clickferry, omio)
  ya están en la whitelist de `app.js` y del Worker — commit con el mismo mensaje exacto
  en `main`, el mismo 6 de abril. Mismo patrón que las dos anteriores.

*(No significa que estén bien probadas en pantalla — solo que el código ya no coincide
con esta lista. Si algo de esto sigue fallando para Paco, es un bug nuevo, no el pendiente
antiguo — tratarlo como tal.)*

### 🟡 Importante

- **Dos propuestas de diseño de abril 2026, "analizadas y documentadas, no implementar
  hasta que Paco lo pida", revisadas contra el código real el 13 sept 2026 — siguen sin
  tocar, y una de ellas (mapa fijo) se ha vuelto más urgente, no menos:**
  1. **Mapa siempre visible (V5)** — el live-map pasa a ser fondo permanente de toda la
     app; welcome/chat/perfil/rutas flotan encima como sheets semitransparentes en vez de
     pantallas que se ocultan/muestran. Objetivo secundario: unificar los mapas
     duplicados en uno solo. Documento completo en memoria de sesión
     (`project_mapa_fijo_v5.md`). **Verificado hoy:** la colisión de z-index que motivó
     parte del plan sigue intacta (`.app-bottom-bar` y `.itin-view` comparten
     `z-index:900` en `styles.css`), y el problema de "mapas duplicados" que quería
     resolver la Fase C ha crecido de 3 a **al menos 5** instancias independientes de
     `google.maps.Map`/Leaflet (`app.js`, `mapa-ruta.js`, `guide-renderer.js`,
     `bitacora-renderer.js`, y el nuevo `map-modal.js` del rediseño de navegación del 7
     sept) — el rediseño de septiembre fue en dirección contraria a la unificación. La
     lista de "6 archivos afectados" del documento original ya se ha quedado corta.
  2. **Modo offline completo** — mapa OSM descargable + POIs + rutas pre-cacheadas para
     viajar sin datos, en 4 fases (O1-O4). Documento completo en memoria de sesión
     (`project_offline_mode.md`). **Verificado hoy:** la Fase O1 (persistencia Firestore)
     ya está hecha (`db.enablePersistence()` en `app.js`, línea ~9) — probablemente como
     efecto colateral de otro trabajo, nadie lo marcó como parte de este plan. Las fases
     O2-O4 (tiles OSM, POIs offline, rutas pre-cacheadas) siguen sin empezar — no existe
     ningún `offline-tiles.js` ni `offline-pois.js` en el repo.
  Ninguna se ha hablado con Paco para decidir si retomarlas — solo quedan anotadas aquí
  para que no se vuelvan a perder de vista como pasó la primera vez.
  **13 sept 2026, tarde**: a Paco le gustó mucho el mockup visual de la propuesta 1
  (mapa siempre visible) — "le da un caché enorme a la app". Siguiente paso sugerido,
  **sin empezar todavía, no tocar código sin que lo pida explícitamente**: arrancar solo
  por la **Fase A** (mapa de fondo permanente, ~1 sesión, sin riesgo) — es un cambio
  invisible a propósito: el live-map se queda vivo detrás en vez de crearse/destruirse
  cada vez, pero las pantallas siguen tapándolo del todo, igual que hoy. El salto visual
  real (mapa asomando, barra semitransparente) no llega hasta la Fase B — no confundir
  las dos al retomarlo.

- **GPS mostrando ubicación de Portugal — CASI CERRADO (13 sept 2026): pinta a geolocalización
  de escritorio poco fiable, no a bug de la app.** Detectado de paso investigando el bug de
  Ronda: con Paco físicamente en Galicia, el panel 🐛 mostró `[Salma] Ubicación: 39.9224
  -8.1332 ±500m` (centro de Portugal) y `[Salma] Copiloto (caché): Portugal pt`. Paco confirmó
  después el dato clave: **en el portátil sale mal posicionado (Portugal), en el móvil sale bien
  posicionado**, mismo momento. Un portátil no tiene chip GPS — el navegador de escritorio estima
  la posición por WiFi/IP (compara redes WiFi vistas contra la base de ubicaciones de Google, o
  cae a la IP), y si esa base tiene mal geolocalizado el router de Paco (o el bloque de IP de su
  ISP está registrado en Portugal), da una coordenada de Portugal con `±500m` de "confianza"
  aunque esté mal. El móvil sí tiene GPS por satélite real, por eso acierta. Se revisó el código
  (`app.js`) y las llamadas principales ya piden `enableHighAccuracy: true`
  ([app.js:3853](app.js:3853), [app.js:5734](app.js:5734)) — no es que la app pida poca
  precisión; sin chip GPS esa opción no cambia nada. Conclusión: probablemente **no es un bug
  arreglable en el código**, es una limitación de hardware/red del portátil. La etiqueta
  "(caché)" del log del copiloto queda aparte, sin relación con esto — simplemente cachea lo que
  el navegador le dio, que ya venía mal desde el origen. **Sin tocar nada de código.** Si vuelve
  a salir raro en el MÓVIL (no en el portátil), eso sí sería la caché de `geo:{lat}:{lng}` en KV
  (24h TTL) o algo del `watchPosition` — investigar entonces, no antes.

- **Workers Builds DESCONECTADO del todo (12 sept 2026, mañana) — sustituido por GitHub
  Action manual.** Tras la segunda pérdida de secrets (ver entrada de abajo), Paco
  desconectó el repo de GitHub en salma-api → Settings → Builds. Ya no hay ningún deploy
  automático en cada push — ni desde esta sesión ni desde ninguna otra. Para desplegar el
  Worker ahora: repo → pestaña **Actions** → **"Deploy Worker"** (`.github/workflows/
  deploy-worker.yml`, añadido esta madrugada) → botón **"Run workflow"**, disparo manual,
  funciona desde el navegador del móvil sin terminal. Ejecuta literalmente
  `npx wrangler deploy -c wrangler.toml` en un runner de GitHub — el mismo comando que se
  ha usado siempre desde el portátil, no toca secrets. Requiere el secret de GitHub
  `CLOUDFLARE_API_TOKEN` (ya configurado). **Probado una vez (12 sept, ~13:00): deploy en
  25s, éxito, y confirmado que NO tocó los secrets ya puestos** — la única secret que
  pareció faltar tras esa prueba era porque no se habían repuesto todas, no porque el
  deploy las borrara.
  **Estado de los 15 secrets a la tarde del 13 sept — 9 confirmados puestos (más
  `GOOGLE_TTS_KEY`, que no es de los 15 y el Worker no la usa):** `ANTHROPIC_API_KEY`,
  `GOOGLE_PLACES_KEY`, `OPENAI_API_KEY` (ya estaban) + `BRAVE_SEARCH_KEY`,
  `DUFFEL_ACCESS_TOKEN`, `RAPIDAPI_KEY`, `ELEVENLABS_API_KEY` (repuestos con
  `worker/restaurar-secrets.cjs --subir`) + `OPENWEATHER_KEY` (home.openweathermap.org) +
  `ADMIN_TOKEN` (generado con `crypto.randomBytes` en sesión, guardado por Paco) — los
  3 últimos puestos a mano con `wrangler secret put`, todo verificado con
  `wrangler secret list`. **Faltan por reponer estos 6, ninguno con backup local — solo
  desde su panel, PAUSADO A PETICIÓN DE PACO (13 sept) — recordárselo en próximas
  sesiones, no perseguirlo sin que él lo pida**: `SERPER_API_KEY` (serper.dev — su web
  de registro estaba caída el 13 sept, comprobado también desde el navegador de la
  sesión, no solo la red de Paco; la API en sí, `google.serper.dev`, respondía normal,
  reintentar más tarde), `STRIPE_SECRET_KEY` (dashboard Stripe), `TWILIO_ACCOUNT_SID` /
  `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` (consola Twilio), `GA4_CREDENTIALS`
  (service account JSON de Google Analytics — la más laboriosa de las 6, y de las que
  menos urgen: el endpoint `/ga4` no lo llama ninguna pantalla de la app todavía, así
  que montarlo ahora no cambia nada visible hasta que se construya un panel de stats en
  `admin.html`). Con los 9 que hay ya funciona lo esencial (chat, generación de rutas,
  verificación Google, fotos, búsqueda web, vuelos, hoteles/coches, voz, clima, panel
  admin) — lo que falta es eventos, Stripe, SOS por SMS y GA4.
- **Workers Builds — REABIERTO (12 sept 2026, madrugada): la "prueba de fuego" del 11
  sept dio falso positivo, se ha perdido una SEGUNDA key (`GOOGLE_PLACES_KEY`).** Tras el
  "confirmado seguro" de abajo, un deploy automático posterior (entre las 22:14 y la
  01:10 del 12 sept, sin aislar cuál exactamente) volvió a dejar el Worker sin un secret
  — esta vez `GOOGLE_PLACES_KEY`. Se descubrió porque `/photo` empezó a devolver
  `{"error":"missing params"}` para TODAS las fotos de una ruta (mismo código exacto que
  devuelve si faltan los parámetros de la URL, así que el síntoma no gritaba "falta la
  key" — hubo que leer el código para verlo). El chat seguía funcionando normal
  (`ANTHROPIC_API_KEY` sí sobrevivió esta vez), por eso nadie lo notó hasta que faltaron
  las fotos. **Conclusión de Paco, con la que la sesión está de acuerdo: no fiarse de
  Workers Builds para deploys de producción hasta entender de verdad qué se lleva por
  delante los secrets — puede haberse llevado alguno más sin que aún se haya notado.**
  Pendiente: `npx wrangler secret list -c wrangler.toml` y comparar contra las 15 de la
  tabla de abajo; reponer `GOOGLE_PLACES_KEY` con `npx wrangler secret put
  GOOGLE_PLACES_KEY -c wrangler.toml`; y decidir si Workers Builds se desconecta del todo
  o se queda solo para cambios que no toquen nada sensible, verificando `/health` después
  de cada deploy automático (no solo probando el chat).
- **Workers Builds (11 sept 2026) — se dio por resuelto y confirmado seguro la misma
  noche; ver entrada de arriba (12 sept), NO lo estaba.** Tras conectar Cloudflare
  Workers Builds (push a `main` → deploy automático, ver alternativa del checklist §4),
  `ANTHROPIC_API_KEY` desapareció del Worker en producción — Salma dejó de responder a
  todo el mundo con "no está configurada (falta API key)". La pantalla de "Variables y
  secretos en tiempo de ejecución" del dashboard estaba bloqueada para editar (mensaje
  "Worker que solo tenga recursos estáticos", no verificado si es la causa real o un
  efecto colateral). **No se confirmó la causa raíz**: al intentar reponer el secret con
  `wrangler secret put` salió el error "the latest version of your Worker isn't currently
  deployed" — indica que había una versión subida y sin desplegar rondando, sospechosamente
  relacionado con la casilla "Habilitar compilaciones de vista previa" que se dejó activada
  al conectar el repo. Arreglo aplicado (desde el portátil, PowerShell):
  `npx wrangler deploy -c wrangler.toml` (alinea versión desplegada = última) seguido de
  `npx wrangler secret put ANTHROPIC_API_KEY -c wrangler.toml` — funcionó.
  **Efecto colateral descubierto en el rescate**: el portátil de Paco estaba 37 commits
  por detrás de `origin/main` — el deploy de emergencia subió código viejo (reapareció el
  bug del texto cortado al generar ruta, ya arreglado en `main`). Se corrigió con
  `git pull origin main` + nuevo `wrangler deploy`. Esto es un problema aparte de Workers
  Builds — repetir el housekeeping del 10 sept, `git pull` antes de cualquier deploy manual.
  **Se creyó resuelto la misma noche (11 sept, ~23:45) — NO lo estaba, ver entrada de
  arriba (12 sept):** se apagó "Compilaciones para ramas que no son de producción"
  (salma-api → Settings → Builds → Control de ramas) — esa es la casilla sospechosa de
  crear versiones sin desplegar. Prueba de fuego: commit de prueba a `main`, deploy
  automático, y mensaje real en el chat ("ruta de los faros") — Salma respondió completo,
  con fotos y guía (la prueba no llegó a comprobar TODAS las paradas, solo que hubo
  alguna foto). **Workers Builds NO está confirmado seguro** — se perdió una segunda key
  horas después. Con esa casilla
  apagada. Causa raíz exacta sin confirmar del todo (no se aisló si era esa casilla u
  otra cosa de la conexión inicial), pero el síntoma no ha reaparecido tras el fix.
- **Enlace "Cómo llegar" de una parada — fusionado a `main` (10 sept), falta que Paco
  confirme en pantalla.** El modal fullscreen de `map-modal.js` (del rediseño visual del
  7-8 sept) se quedaba enganchado a CUALQUIER enlace `google.com/maps` del chat — también
  al de "cómo llegar" a una sola parada, que debía abrir Google Maps directo. Causa: en
  `app.js` (`formatMessage`), la variable `isMaps` metía en el modal todo lo que llevara
  `google.com/maps`, sin distinguir ruta completa de parada suelta. Se separó en
  `isRouteMaps` (`app.js?v=100`): solo "Ruta completa" (varias paradas) abre el modal;
  "Cómo llegar" y el genérico "Abrir en Google Maps" abren con `window.open` directo, como
  cualquier otro enlace. Falta que Paco confirme en pantalla: pedir una parada suelta en
  el chat, tocar "Cómo llegar", comprobar que abre Google Maps (app o pestaña nueva)
  directamente, sin pasar por el mapa fullscreen de la web.
- **Enlace "Ruta completa en Google Maps" del chat — fusionado a `main` (10 sept), falta
  desplegar el Worker.** El link agregado (al final de una respuesta con varias paradas en
  negrita) usaba el formato viejo `/maps/dir/lat,lng/lat,lng/...` sin `?api=1`, que no abre
  bien desde el WebView de la PWA — a diferencia de los enlaces "Cómo llegar" por parada,
  que sí llevan `?api=1&destination=...` y funcionaban. Se cambió al esquema oficial de
  Google (`?api=1&origin=...&destination=...&waypoints=...`), igual que los de "Cómo
  llegar". Falta que Paco haga, desde su ordenador: `cd worker; npx wrangler deploy -c
  wrangler.toml`, y que confirme en pantalla tocando el enlace en una respuesta con ruta
  de varias paradas (ej. algo por la N-2 de Portugal).
- **Respuesta del chat cortada a media frase al generar una ruta — fusionado a `main`
  (10 sept, commit `d7e3154`), falta desplegar el Worker.** Paco reportó (chip "Hazme
  una ruta desde donde estoy", destino Chaves) que la prosa de presentación se cortaba
  a media palabra ("...cierra con un caldo en una tas") y saltaba directo a "Generando
  tu ruta...". Causa: en `worker/salma-worker.js` (`readAnthropicStream` y
  `readOpenAIStream`), el reenvío de cada trozo del streaming a `t: chunk` decidía si
  mandarlo o no mirando si `fullText` ya contenía el marcador `SALMA_ROUTE` completo —
  si un mismo trozo traía pegados el final de la prosa y el arranque del marcador, se
  descartaba el trozo ENTERO (prosa incluida) en vez de solo el marcador. Se cambió para
  mandar la parte de prosa que venga delante del marcador dentro de ese mismo trozo, y
  solo entonces pasar a `generating: true`. Probado con `node --check`, sin tocar
  frontend (no hace falta subir ningún `?v=`). **Verificado que sigue en el Worker viejo**:
  el 10 sept a las 16:48 UTC el `/version` devolvía `2856c741` desplegado a las
  08:18:16 UTC — de **antes** del commit (16:31 UTC) — así que el fix aún no ha corrido
  en producción. Paco estaba con el móvil y no pudo desplegar en el momento. Falta, desde
  su ordenador: `git pull origin main` (confirmar que baja `d7e3154` o posterior), luego
  `cd worker; npx wrangler deploy -c wrangler.toml`, comprobar que `deployed_at` en
  `/version` es posterior al pull, y probar el chip de ruta varias veces (el bug depende
  de dónde caiga el corte del trozo del stream, no siempre se repite).
- Stripe sigue en modo test — falta decidir cuándo pasar a `sk_live_`.
- Google Maps key sin restricción de dominio en GCP Console (no verificable desde el repo).
- **Modelo de negocio a medias**: "Salma Coins" (documentado más abajo en este archivo) y
  el Premium por periodos de `docs/pasarela-premium.md` conviven ahora mismo en el código
  — el Worker ya habla de planes/meses, el frontend todavía de coins. Hay que decidir y
  terminar la migración (Fases 2-4 del documento) o revertir el Worker, no dejarlo a medias.
- WebAuthn/fingerprint sigue parcial (solo recuerda email).
- **[Prioridad baja] Resumen/narrativa post-viaje** — auditado 11 sept: no existe ningún
  sistema de "estados" de Salma (Exploradora/Buscadora/Acompañante/Crisis/Historiadora),
  ni `getSalmaState()`, ni nada que cambie el prompt según si un viaje está activo o
  completado — la selección de prompt (`buildMessages()` en `worker/salma-worker.js`)
  es solo por patrón de mensaje, no por ciclo de vida del viaje. Tampoco hay concepto de
  "viaje completado" en Firestore (`users/{uid}/maps/{mapId}` no tiene campo `status`).
  Lo único parecido a un "resumen" es el vídeo Canvas (`video-player.js`, tipo `resumen`)
  y es un slideshow visual bajo petición explícita del usuario, no una narrativa de texto
  automática. Sin prisa — no hay nada roto, es una feature nueva a valorar más adelante.

### 🔧 Deuda técnica (sin cambios, no re-verificado a fondo en este barrido salvo lo dicho)

- **Código duplicado** — `_groupByDay`, `_sampleWaypoints`, `_fullRouteGmapsUrl`,
  `escapeHTML` en 3+ archivos.
- **Monkey-patch frágil** — `mapa-itinerario.js` parchea `bitacoraRenderer.renderDiario`
  en runtime.
- **Deep links transport incompletos** — Solo Uber y Lyft tienen deep links.
- **2 funciones dead code confirmadas** — `injectGoogleMapsLink()` e
  `injectTransportBlock()` en el Worker (~línea 3290) solo hacen `return reply` sin tocar nada.

### 🧵 Ramas rescatadas (10 sept) — con trabajo real, sin fusionar a `main`

Estaban solo en el portátil de Paco, ya están en GitHub, **pero ninguna está fusionada
en `main` todavía** — son ramas propias, con historia que ha divergido de `main`. Antes
de fusionar cualquiera: mirar si sigue mereciendo la pena (puede que algo se haya vuelto
a hacer distinto después) y probarla, una por una, con confirmación de Paco.

| Rama | Qué trae (por los commits) | Tamaño del cambio |
|---|---|---|
| `claude/vigilant-nightingale-3b17ca` | Flujo `go_to`: pregunta el mes antes de buscar vuelos (solo ida) + fix de "aquí cerca" no debe disparar `go_to`. **Aparcada por decisión de Paco (10 sept) — no es necesaria de momento, no fusionar sin que él lo pida.** | medio (salma.js + worker) |
| `trabajo-5-sept-2026` (tag `v-5sept-completo`) | Copia de referencia del día que se borró el Worker (protocolo §1) — histórico, no es "trabajo nuevo" que fusionar | — |

Todas las demás ramas rescatadas del 10 sept ya se revisaron una a una: 2 se fusionaron
de verdad (ruta duplicada, narrador sin ráfaga + GPS confirmado — este último escrito de
cero), y 4 (`vigorous-lichterman`, `hopeful-goldstine`, `vibrant-bassi`,
`hungry-tereshkova`) resultaron estar ya resueltas en `main` por otro commit hecho
independientemente, casi siempre el mismo día o unos meses después con un rediseño más
completo — ver detalle de cada una en "✅ Ya resuelto" arriba. Solo queda
`vigilant-nightingale-3b17ca`, aparcada a propósito.

### 📋 Sesiones de Code sueltas (29 ago – 10 sept) — revisar en tu ordenador

No pude leer el contenido de estas conversaciones (ver límites abajo), solo metadatos.
Están ordenadas de más a menos reciente. "Señal git" es lo que se veía en el árbol de
trabajo al terminar cada sesión — no dice si el problema se resolvió, solo si el cambio
llegó a un commit y si ese commit llegó a GitHub.

| Fecha | Título | Rama | Señal git | Acción sugerida |
|---|---|---|---|---|
| 8 sept | Diseño tokens estudio | `worktree-rediseno-visual` | comprobado 10 sept: sin commits propios (nada exclusivo del portátil) | Nada que rescatar — lo que hubiera de valioso no llegó a commitearse |
| 7 sept | Guía con mapa no funciona | `main` | cambios sin commitear al cerrar | Confirmar con Paco si el mapa ya va bien; si no, retomar |
| 7 sept | Rediseño visual de la app | `main` | cambios sin commitear al cerrar | Puede solaparse con "Diseño tokens estudio" — mirar juntas |
| 7 sept | Pasarela de pago Stripe | `worktree-pasarela-pago` | Fase 0+1 sí llegaron a `main` (commits `200706a`, `5a6b2f8`); la rama en sí nunca se pusheó | Ver el crítico de pago roto arriba — esto es la causa |
| 6 sept | Road-trips reales con búsqueda web | `main` | cambios sin commitear, sin commit identificable en el historial | Confirmar si se llegó a implementar algo o quedó en nada |
| 6 sept | Anclar país y radio de búsqueda (x2) | `main` | limpia | Parece resuelto — `anchorCountry` ya está en el Worker |
| 6 sept | Saca lo pendiente | `main` | sesión de 21s, sin cambios | No hizo nada, ignorar |
| 5 sept | Rutas: respuestas y recomendaciones | `main` | **rescatado y fusionado a `main` el 10 sept** (probado por Paco en producción) | Cerrado |
| 5 sept | Geolocalización incorrecta en rutas | `main` | limpia, sin commit identificable | Confirmar si el bug de geolocalización sigue vivo |
| 5 sept | Cambios no reflejados en la app de rutas (x3, Opus) | `main` | cambios sin commitear en las tres | Es el incidente que motivó el protocolo del §1 de este archivo — confirmar que ya no pasa |
| 4-5 sept | Rutas con Web Search y simplificación (x2) | `main` | una limpia, otra con cambios sin commitear | Sin commit identificable con ese tema — confirmar si se perdió |
| 31 ago | Auditoría validador URLs y trazado rutas Salma | `main` | cambios sin commitear al cerrar | La sanitización de URLs ya está documentada como implementada — probablemente ok |
| 30 ago | Ajustes UI pantalla principal Salma | `main` | cambios sin commitear al cerrar | Revisar si quedó algo suelto |
| 30 ago | Actualizar KV (Portugal + verificación global) | `claude/lucid-kirch-e19278` | comprobado 10 sept: la rama existe en el portátil pero sin ningún commit propio | Nada que rescatar — la sesión no llegó a commitear el trabajo de Portugal |
| 30 ago | Auditoría estado actual Portugal en SALMA | `main` | cambios sin commitear al cerrar | Ligado a la sesión anterior |
| 30 ago | Auditoría y validador de URLs de Google Maps | `main` | cambios sin commitear al cerrar | Revisar solapamiento con la del 31 ago |
| 29 ago | BRIEFING: Flujo Guiado de Creación | `main` | cambios sin commitear al cerrar | El flujo guiado de 8 pasos ya existe en `app.js` ("Afinar") — probablemente se integró en otro commit posterior |

**Housekeeping pendiente:** el `main` del portátil de Paco seguía 10 commits por detrás
de GitHub el 10 sept (comprobado con `git status`). Antes de la próxima sesión de trabajo
ahí, hacer `git pull origin main` — es un fast-forward, seguro.

### Metodología y límites de este barrido

- Comparado contra el código real (`git log`, `git ls-remote`, `grep` en Worker/frontend/
  `firestore.rules`) el 10 sept 2026 — no contra lo que decían sesiones anteriores.
- **Sin acceso a conversaciones de chat normal (claude.ai)**: si algo se decidió o se pidió
  ahí y no llegó al repo, no está en esta lista. Si Paco recuerda algo de esas
  conversaciones que falte aquí, decírselo a la sesión y se añade.
- De las sesiones de Code de la tabla, solo se pudieron ver metadatos (título, fecha,
  rama, si quedaron cambios sin commitear/pushear) — el ordenador de Paco estaba
  desconectado durante este barrido y no se pudo leer el contenido de esas conversaciones.
  Reconectarlo permite revisarlas una a una.
- Actualizar esta sección (no crear una nueva) cada vez que se cierre o se abandone algo
  pendiente, para que no se repita el desfase que motivó este barrido.

### Barrido del 16 sept 2026 — "situación y estudio" de KV, sin tocar código

Paco pidió una puesta al día de la situación de KV. Al comparar la documentación de este
archivo contra `salma-worker.js`, `index.html` y la API real de Cloudflare (namespaces +
código fuente desplegado del Worker), salieron 3 hallazgos que llevaban tiempo sin
reflejarse aquí — ninguno es un bug, es documentación desfasada:

1. **Un segundo namespace KV** (`ROAD_GEOM`, para geometría de carreteras) que no aparecía
   mencionado en la sección de KV, solo en `wrangler.toml`.
2. **15 endpoints del Worker sin documentar** que ya están desplegados y en uso: toda la
   familia de Vigilancia de Vuelos (`/flight-watches`, `/flight-alerts`, `/flight-places`),
   `/whatsapp`, `/stripe-webhook`, `/roads/resolve`, `/weather`, `/transport`, `/translate`,
   `/tts-google`, `/historia-lugar`, `/admin/verify-place`.
3. **7 archivos JS de la raíz sin listar** en "Archivos principales": `flight-watches.js`,
   `map-modal.js`, `share-inbox.js`, `translator.js`, `historia.js` (+ `historia.css`),
   `video-assembly.js`, `debug-panel.js` — todos cargados de verdad en `index.html`, no
   código muerto.

El hallazgo con relevancia de coste (norma de la sección "⛔ PROTOCOLO", punto 8): el cron
diario de las 6:00 UTC (`_cronFlightWatches`) lleva ya desplegado un tiempo y llama a la
API de Duffel automáticamente, hasta 20 veces al día, sin que ningún usuario pida nada en
ese momento — no es un cambio de esta sesión, pero no estaba dicho en ningún sitio y debía
estarlo. Detalle en la sección de KV, tabla "3 crons del Worker".

**Límite de este barrido**: no se ha podido leer el contenido real de las claves KV (cuántas
de las 193 fichas nivel 1/2/2.5 hay pobladas de verdad, cuántas rutas nivel 3 cacheadas) —
el conector de Cloudflare de esta sesión solo gestiona namespaces, no claves individuales, y
no hay credenciales de `wrangler login` en este contenedor. Para ese dato exacto:
`npx wrangler kv key list --binding=SALMA_KB --remote -c wrangler.toml` (y lo mismo con
`--prefix=dest:`, `--prefix=route:`, etc.) desde un sitio con esas credenciales.

---

## Normas de desarrollo

### Autonomía de la sesión (acordado con Paco, 11 sept 2026 — trabaja bastantes días desde el móvil)

- **Bajo riesgo** (documentación, `CLAUDE.md`, housekeeping de git, subir algo que ya se
  ha hablado y probado en la misma conversación) → la sesión puede hacerlo directo, sin
  preguntar paso a paso.
- **Todo lo demás** (código de `app.js`/`salma-worker.js`/cualquier `.js` de la app, el
  prompt, deploys que afecten a producción, cualquier cosa que cambie lo que ve un
  usuario) → sigue el resto de reglas de esta sección tal cual: se pregunta y se confirma
  en cada paso, **salvo** que Paco diga explícitamente "hazlo" para ese caso concreto en
  ese momento — eso no es un permiso permanente, solo vale para esa acción.
- **⚠️ Coste de APIs — esto NO entra en "bajo riesgo" NUNCA, ni siquiera si el cambio es
  mínimo, ni siquiera si es solo tocar código o documentación.** Regla añadida el 15 sept
  2026, a fuego, tras la factura de Google Places de 82€ en 14 días (ver 🔴 Crítico) y
  reforzada el mismo día porque Paco insistió en que aplica **SIEMPRE — sin umbral de
  "esto es tan pequeño que no cuenta", sin excepciones, en cualquier cambio mínimo**:
  **cualquier cambio, por pequeño que sea, en cualquier línea que llame o pueda llegar a
  llamar a una API de pago** (Google Places/Maps, Anthropic, OpenAI, Duffel, RapidAPI,
  Twilio, ElevenLabs, Stripe, Brave, Serper, OpenWeather...) — subirlo o bajarlo, tanto
  da — **se le dice a Paco explícitamente, ANTES o en el momento, no como nota de
  después.** Decirlo significa: qué se toca, por qué puede afectar al coste, y una
  estimación aunque sea a ojo. No hace falta esperar a que él pregunte, y no es decisión
  de la sesión juzgar si "esto es tan poco que no merece mención" — si hay duda, se dice.
  Aplica a arreglos de coste igual que a features nuevas — un fix que promete ahorrar
  dinero SIGUE necesitando decir qué se tocó y por qué, no basta con "ya está arreglado".

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets
- **Nunca** usar `window.onload` — Firebase se inicializa en el head
- **Nunca** tocar el prompt sin chequear contradicciones entre bloques
- **Nunca** editar código sin OK explícito de Paco
- **Nunca** iterar cambios al prompt/código sin aprobación en cada paso
- **Nunca** ejecutar scripts KV sin explicar qué hacen. Si KV vacío, restaurar desde JSONs locales
- **Nunca** subestimar costes API — calcular tokens reales + reintentos + dar rango
- **Nunca** tocar ni desplegar nada que llame a una API de pago (nueva llamada, cambio de
  frecuencia, de field mask, de caché, de límites...) sin decir el impacto de coste
  esperado — ver regla de arriba, esto es lo mismo dicho dos veces a propósito
- Antes de refactorizar algo que funciona, confirmarlo con Paco
- Los commits van en español, mensajes cortos y claros
- Cuando algo se rompe, revertir a la última versión estable antes de parchear

---

## Procedimiento de restauración

### Si se rompe el frontend

```bash
# Opción 1: Restaurar desde tag git
cd C:\Users\User\Desktop\salma
git checkout v1-stable-20260410

# Opción 2: Restaurar desde backup
cp -r C:\Users\User\Desktop\salma-v1-stable-20260410/* C:\Users\User\Desktop\salma/
# (excepto .git y .claude)

# Opción 3: Restaurar un solo archivo
cp C:\Users\User\Desktop\salma-v1-stable-20260410/app.js C:\Users\User\Desktop\salma/app.js

# Subir a GitHub Pages
cd C:\Users\User\Desktop\salma
git add -A && git commit -m "restaurar v1 estable" && git push
```

### Si se rompe el Worker

```bash
# Restaurar worker desde backup
cp C:\Users\User\Desktop\salma-v1-stable-20260410\worker\salma-worker.js C:\Users\User\Desktop\salma\worker\

# Desplegar
cd C:\Users\User\Desktop\salma\worker
wrangler deploy

# Si faltan secrets (keys en C:\Users\User\Desktop\salma\api\)
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_PLACES_KEY
wrangler secret put BRAVE_SEARCH_KEY
wrangler secret put DUFFEL_ACCESS_TOKEN
wrangler secret put RAPIDAPI_KEY
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put SERPER_API_KEY
wrangler secret put OPENWEATHER_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER
wrangler secret put ADMIN_TOKEN
```

### Si se vacía el KV

```bash
cd C:\Users\User\Desktop\salma\worker\kv

# Restaurar nivel 1
node upload-kv.js

# Restaurar nivel 2
node upload-kv-nivel2.js

# Restaurar todo (bulk)
node upload-all-kv.cjs
```

### Si se rompe Firebase

```bash
# Desplegar reglas de Firestore
cd C:\Users\User\Desktop\salma
firebase deploy --only firestore:rules
# (requiere: npm install -g firebase-tools)
```

### Verificar que todo funciona

1. Abrir https://borradodelmapa.com — debe cargar welcome screen
2. Escribir "Hola" en el chat — Salma debe responder (~1s)
3. Login con cuenta de prueba — debe ir a chat
4. Pedir "3 días en Cádiz" — debe generar ruta con mapa y fotos
5. Guardar ruta → debe aparecer en Mis Viajes
6. Worker health: `curl -H "Authorization: Bearer {ADMIN_TOKEN}" https://salma-api.paco-defoto.workers.dev/health`

---

## Comandos útiles

```bash
# Ver cambios sin commitear
git status

# Subir cambios
git add -A && git commit -m "descripción" && git push

# Desplegar worker a Cloudflare
cd worker
wrangler deploy

# Añadir/actualizar secret en Cloudflare
wrangler secret put NOMBRE_SECRET

# Restaurar a V1 estable
git checkout v1-stable-20260410

# Backup completo en Desktop
# C:\Users\User\Desktop\salma-v1-stable-20260410\
```

## Reparto de worktrees — 7 septiembre 2026

Hoy se trabaja en 4 frentes. Recordatorio: la app de escritorio crea un worktree automático por cada sesión nueva (botón "+ New session" en la pestaña Code) — no hace falta usar `-w` a mano ni `git worktree add` manualmente.

**En paralelo (máx. 2 sesiones activas a la vez):**

1. `roadtrip-reales` — cerrar la tarea de road trips reales (bloque 1-Ruta de F2-Calidad: día a día, carreteras reales, dificultad, alternativas). Toca: `mapa-ruta.js`, renderizado de ruta en `salma.js`, prompt/Worker (con aprobación explícita — ver Protocolo, punto 5).
2. `pasarela-pago` — pasarela de pago (Stripe, bundles). Evitar tocar `index.html`/`styles.css` más allá del propio checkout.

**En cola (después de fusionar las dos anteriores a main, una detrás de otra — no en paralelo entre sí):**

3. `rediseno-visual` — rediseño visual amplio (layout, colores, componentes). Va primero para fijar la base visual antes de tocar Historia.
4. `historia-tab` — continuar el apartado Historia (ya existen `historia.js`/`historia.css` en el repo, no se parte de cero). Arranca solo cuando `rediseno-visual` esté fusionado a main, para heredar el estilo nuevo en vez de remaquetar dos veces.

**Notas aparte (no relacionadas con este reparto, detectadas al revisar el repo):**
- Hay ~40 worktrees viejos marcados `prunable` en `.claude/worktrees/` de sesiones anteriores ya cerradas. Se pueden limpiar con `git worktree prune` cuando quieras — no borra nada en uso, solo limpia referencias muertas.
- El repo tiene actualmente un diff enorme sin commitear (~619.000 líneas en ~1950 ficheros) que parece ser mezcla de finales de línea CRLF/LF, no cambios de contenido reales — no lo he tocado. Convendría revisarlo y decidir cómo normalizarlo antes del próximo commit, para no arrastrar sin querer un commit gigante de miles de ficheros.
