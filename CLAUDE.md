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
   sirve el viejo aunque el fichero esté subido). Los 19 scripts locales llevan `?v=`;
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

### 9. EL MENÚ DE ABAJO (Y LA CABECERA) SON UNA SOLA COSA — APP Y PÁGINAS DE DESTINO A LA VEZ, SIEMPRE

Añadido el 22 sept 2026, sesión de rediseño de las páginas SEO de destino (ver
"Sesión 22 sept 2026 — Rediseño SEO destinos" más abajo). Paco, tal cual: **"no quiero
ir detrás mirando si se hace o no se hace"** — esto no es una sugerencia, es checklist
obligatorio.

- Las 1.793 páginas de `destinos/` (más las de país e índice) llevan la MISMA cabecera
  (logo + eslogan), el mismo reloj y el mismo menú de abajo que la app real — no por
  casualidad, sino porque `scripts/build-destinos.js` las genera desde tres constantes
  compartidas: **`LOGO_HTML`, `BOTTOM_NAV`** (y el reloj, inline en las dos plantillas).
  Ver el propio comentario junto a `BOTTOM_NAV` en ese archivo.
- **Cualquier cambio al menú de abajo de la app** (`app.js:updateBottomBar()` — pestañas,
  iconos, el "+" central, textos, orden) **o a la cabecera/eslogan del index**
  (`app.js:_renderChatEmpty()`, el bloque `.ce-top`/`.ce-hero`) **se replica ANTES de dar
  el cambio por terminado** en `scripts/build-destinos.js` (`LOGO_HTML`/`BOTTOM_NAV`), y
  se regenera al menos el país de prueba (`node scripts/build-destinos.js --country es`)
  para comprobarlo — el rollout a las 1.793 completas se hace aparte, pero el CÓDIGO del
  generador nunca se queda desincronizado, ni un commit.
- Si el cambio afecta a un `?v=` de CSS/JS que las páginas de destino también cargan
  (`styles.css`, `destinos.css`), subir igual el número en `build-destinos.js`
  (`DESTINOS_CSS_V` y cualquier otro que se añada) — si no, un visitante real se puede
  quedar con la versión vieja en caché sin que nadie se entere.
- Esto aplica igual de fuerte que el punto 8 de arriba: **no hay "esto es tan pequeño que
  no afecta a destinos"**. Si se toca el menú o la cabecera de la app, se toca a la vez
  `build-destinos.js` — sin excepción, sin esperar a que Paco lo note en una captura.

---
## V2 Mapa — 11 abril 2026 | Backup: `backups/borradodelmapa-v2-mapa-2026-04-11/`
## V3 Share + Fotos — 17 abril 2026 (sesión)
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
├── mapa-itinerario.js      # Vista itinerario fullscreen: tarjetas + mapa de ruta
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
├── premium-modal.js        # Modal "Hazte Premium" (SOLO interfaz; la lógica de pago sigue en app.js:openCoinsModal). Pinta precios y topes que le llegan del Worker (GET /usage)
├── map-modal.js            # Modal fullscreen Google Maps nativo (Street View, capas, búsqueda) para "ruta completa"
├── share-inbox.js          # Handler de fotos compartidas desde galería del móvil (Share Target Android)
├── translator.js           # Traductor simultáneo push-to-talk (voz ES vía ElevenLabs, resto Web Speech)
├── historia.js             # Cápsula de historia ampliable (parada/país en guías + chat), Claude Haiku
├── historia.css            # Estilos del módulo Historia
├── debug-panel.js          # Panel 🐛 flotante: logs, errores JS, Version ID Worker + `?v=` scripts cargados
├── styles.css              # Sistema de diseño: mobile-first, dark theme, dorado (175KB)
├── transport-apps.json     # Base de datos de apps de transporte mundial (84KB)
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
mapa-itinerario.js (mapaRuta, guideRenderer, salma, db, showToast) — independiente de
  bitacora-renderer.js desde el rediseño de navegación de sept 2026 (antes parcheaba
  bitacoraRenderer.renderDiario en runtime; verificado 22 sept 2026 que ya no queda
  rastro de eso en el código vivo, solo en backups de abril)
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
| `users/{uid}` | Owner read/write, **salvo** `premium_until`, `isPremium`, `coins_saldo`, `rutas_gratis_usadas` (solo el Worker, desde 21 sept 2026) | Perfil: name, email, isPremium, coins_saldo, rutas_gratis_usadas, avatarURL, sos_config, copilot_data |
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
| `url_validation_incidents/{id}` | Read: auth / Create: auth (solo alta) | Sustituciones de enlaces Maps rotos (Bloque E) |
| `beta_feedback/{id}` | Read: auth / Create: auth (solo alta) | Feedback de testers: nota + logs del panel 🐛 + versión, mandado desde `POST /beta-feedback` |
| `shared_routes/{id}` | Read: auth / Write: solo el dueño | Ruta compartida desde el botón Compartir de la vista de itinerario — a diferencia de `public_guides`, exige login para verse. Mismo id que la guía en `users/{uid}/maps/`. **Regla YA DESPLEGADA (comprobado 21 sept 2026 leyendo `shared_routes/prueba-lectura` con sesión: devuelve "no existe" sin `permission-denied`; se publicó con el `firebase deploy` del paso 1 de pagos, que sube el fichero entero).** |

- **Regla importante**: `const db` solo se inicializa en `app.js`, nunca duplicado
- Firebase se inicializa en el `<head>` del `index.html`

### Firestore Rules actuales

```
users/{userId}/**              → read/write: auth.uid == userId
public_guides/{slug}           → read: true, write: auth != null (⚠ sin ownership)
config/{doc}/**                → read: auth, write: false
admin_logs/{logId}             → read/write: auth
url_validation_incidents/{id}  → read: auth, create: auth (solo alta, sin editar/borrar)
beta_feedback/{id}             → read: auth, create: auth (solo alta, sin editar/borrar)
shared_routes/{id}             → read: auth, create/update/delete: solo el dueño (uid) — DESPLEGADA (comprobado 21 sept 2026)
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
| GET | `/admin/verify-place` | Debug manual del verify de una parada contra Google Places (admin) |
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
| POST | `/perfil-ia-extract` | Extrae hasta 3 datos nuevos del perfil de viajero (GPT-4o-mini) tras guardar una ruta — requiere login |
| GET | `/explorar` | Rutas de la comunidad (público, sin login): índice país → provincia de `public_guides` con `listed != false`, sin repetidas ni <3 paradas. Caché KV `explorar:index:v2` (2 h; 20 min mientras falten provincias) |
| POST | `/explorar/refresh` | Borra la caché de `/explorar` (requiere login) — al cambiar "Compartir mis rutas" o borrar una guía |
| POST | `/beta-feedback` | Feedback de testers desde el panel 🐛: nota + logs → Firestore `beta_feedback` + aviso a Paco por WhatsApp |

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
| `explorar:index:v2` | — | Índice de Explorar (rutas de la comunidad), ver `/explorar` | 1 clave |
| `prov:{lat}:{lng}` | — | País + provincia de un punto (Nominatim, gratis) para agrupar Explorar — sin caducidad | Dinámico |
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

### ⏰ 2 crons del Worker (`worker/wrangler.toml` → `[triggers]`) — el de rutas nivel 3 se eliminó el 17 sept 2026

El Worker tiene `scheduled()` en `salma-worker.js` con 2 disparos automáticos, ya desplegados y corriendo en producción ahora mismo, sin que nadie los active a mano:

| Cron (UTC) | Qué hace | Llama a una API de pago |
|---|---|---|
| Lunes 4:00 | Regenera hasta 5 fichas nivel 1 (`dest:{cc}:base`) caducadas (>180 días) | **Sí — GPT-4o-mini**, ~5 llamadas/semana, coste marginal (céntimos) |
| Diario 6:00 | `_cronFlightWatches` — recorre `flight_watch_users`, comprueba precio actual de hasta 20 vigilancias de vuelo activas y crea alerta si baja >15% o entra en presupuesto | **Sí — Duffel API**, hasta 20 búsquedas de vuelo/día, automático, sin que el usuario pida nada en ese momento |

**Por qué el de vuelos se dice aquí y no se toca:** no aparecía mencionado en ningún sitio de este archivo hasta el barrido del 16 sept — es un gasto recurrente diario en Duffel que corre solo, y la norma de "cualquier cosa que pueda mover la factura, se dice" aplica igual a algo que ya existía y no se sabía que existía. Nadie ha tocado su código.

**Cron de rutas nivel 3 (miércoles 4:00) — ELIMINADO el 17 sept 2026, con OK de Paco.** Comprobado con `_index:routes` (no existía en el KV): **nunca llegó a generar ni una sola ruta en producción**, a pesar de llevar desplegado desde antes de esta sesión. Causa encontrada en el código: escaneaba `env.SALMA_KB.list({ prefix: 'dest:', limit: 500 })` para encontrar países con destinos, pero con >3.000 claves reales bajo ese prefijo (bases + destinos + prácticos + spots de 193 países), el límite de 500 solo alcanzaba a ver ~30 países por orden alfabético — nunca llegaba ni a la mitad del abecedario. Además, igual que el resto de generación nivel 3, no verificaba coordenadas con Google Places (solo comprobaba que no fueran `0,0`) — menos calidad que una ruta real de chat. Decisión: en vez de arreglar este cron (limit + verificación), se sustituye por el proceso manual controlado que genera y verifica rutas nivel 3 país por país (ver [[project_kv_estado]] en memoria) — evita el mismo problema de raíz de abril (dos escritores automáticos distintos tocando la misma clave `route:*` sin coordinarse).

### Scripts de generación (`worker/kv/`)

| Script | Modelo | Output | Coste aprox |
|--------|--------|--------|-------------|
| `generate.js` | Claude Sonnet | Nivel 1 — `dest:{cc}:base` + `kw:*` | ~$0.90 / 193 países |
| `generate-nivel2.js` | Claude Sonnet | Nivel 2 — `dest:{cc}:destinos` | ~$2.50 / 193 países |
| `generate-nivel25.js` | Claude Haiku | Nivel 2.5 — `dest:{cc}:practical` | ~$1.20 / 193 países |
| `generate-nivel3.js` | GPT-4o-mini (cron) | Nivel 3 — `route:{cc}:{dest}:{days}` | ~$0.06 / ruta |

**Otros scripts KV:** `upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`, `upload-spots-bulk.cjs`, `upload-transport.js`, `upload-wrangler.js`, `enrich-spots.cjs`, `stats.js`, `stats-nivel2.js`

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

## Modelo de negocio — Premium por suscripción

> **Corregido 25 sept 2026** — esta sección describía el sistema de Salma Coins, que se
> quitó el 21 sept 2026 (`app.js`: "coins eliminados 21 sept 2026"). Llevaba 4 días
> desactualizada sin que nadie lo notara — se descubrió al mirar el código real para
> conectar WhatsApp a los mismos límites que la app (ver F5.3 punto "guardar ruta" más
> abajo). Lo de abajo es lo que hay REALMENTE en el Worker (`PLAN_LIMITS`, `usageGate()`,
> `PREMIUM_PLANS` en `salma-worker.js`) y en `app.js:renderProfile()`.

- **Plan gratuito**: 1 guía con IA de por vida, 2 ediciones de esa guía, 20 mensajes de chat/día.
- **Premium**: 4 guías/mes, 40 ediciones/mes, 100 mensajes/día. Se activa con `premium_until`
  (fecha futura) en Firestore — el booleano `isPremium` es legacy, se queda en `true` para
  siempre tras la 1ª compra y no sirve para decidir nada.
- **Precios** (pago único que suma meses a `premium_until`, no suscripción recurrente de
  Stripe): 1 viaje (4,99€ / 1 mes), Trimestral (8,99€ / 3 meses), Semestral (14,99€ / 6
  meses), Anual (24,99€ / 12 meses).
- **Validación: SÍ es server-side** — `usageGate(env, authUser, kind)` en el Worker
  comprueba `premium_active` (leído de Firestore, nunca del cliente) ANTES de llamar a
  Claude o Google, para `kind`: `'chat'` (mensajes/día), `'guide'` (crear ruta con mapa),
  `'edit'` (editar una ruta). Si se pasa, corta ahí sin gastar nada y responde con el
  mensaje de límite (dirige a Perfil → Mi plan). Esta misma función es la que a partir del
  25 sept 2026 usa también WhatsApp para decidir si puede guardar una ruta (ver F5.3 más
  abajo) — un único sitio que decide el límite, no dos economías distintas.
- **Stripe**: Checkout funciona (modo test). PENDIENTE: pasar a live.

---

## UI actual

- **Welcome**: "Viaja con alguien que sabe lo que hace", input con placeholder rotativo, chips (rutas guardadas o featured), recordatorios de notas
- **Chat**: avatar Salma inline (20px) + nombre, texto a ancho completo, cámara, voz, retry 18s
- **Bottom bar**: Ayuda (abre el panel de feedback de testers, con latido, 21 sept 2026), Chat, Rutas (requiere login), Perfil (Entrar si no logueado). Nota: esta lista llevaba tiempo desactualizada (mencionaba "Home" en vez de la pestaña real "Consultas", que existió hasta el 21 sept) — corregido en este barrido contra `app.js:updateBottomBar()`.
- **Perfil**: avatar subible (R2), stats (plan Gratis/Premium, total viajes)
  - TU VIAJE: Mis Notas, Galería, Cuaderno de Viaje, Documentos del Viajero
  - SEGURIDAD: SOS Emergencia (configurable, SMS Twilio + WhatsApp, cola offline)
  - CUENTA: Mi plan (Premium), ¿Qué puedo hacer?
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

> **Este es el único archivo de pendientes del proyecto — no crear otro.** Recortado el
> 25 sept 2026 (a petición de Paco: "RECORTA CLAUDE.MD") — el historial de sesiones,
> bugs ya confirmados en pantalla y las investigaciones puntuales viven ahora en
> **`CLAUDE-historial.md`**. Aquí solo queda lo que sigue abierto de verdad.
>
> **Cuando Paco diga "anota esto pendiente" (o algo parecido):** añadirlo aquí mismo, en
> el subapartado que corresponda (🔴 Crítico / 🟡 Importante / 🔧 Deuda técnica), hacer
> `commit` y `push` **directo a `main`** antes de terminar el turno. Cuando algo se cierre
> (confirmado en pantalla por Paco), muévelo a `CLAUDE-historial.md` en el mismo commit
> — no lo dejes acumulándose aquí sin cerrar, es justo lo que hizo crecer este archivo
> hasta 4800 líneas la primera vez.

### 📱 Salma en WhatsApp (F5) — estado actual

Canal de WhatsApp vía Twilio Sandbox, en paralelo a la web (no la sustituye). Historial
completo del desarrollo (F5.0-F5.4) en `CLAUDE-historial.md`.

- **F5.1-F5.4 hechos y confirmados en pantalla**: eco → conectado al motor real de Salma
  (`WHATSAPP_SYSTEM_CHAT`, sin tools/memoria todavía) → auto-registro de cuenta nueva
  desde WhatsApp → vinculación con cuenta existente → login desde la web con el número.
- **Login definitivo (25-26 sept 2026): dos botones, "Entrar con Google" / "Entrar con
  WhatsApp" — CONFIRMADO EN PANTALLA por Paco de punta a punta, ordenador y móvil.**
  Móvil y ordenador usan EXACTAMENTE el mismo mecanismo: un código de un solo uso que el
  propio botón mete en el mensaje de WhatsApp, invisible para quien lo manda —
  `/wa-qr-start` genera el código (Firestore `wa_qr_logins/{código}`, 10 min), el
  webhook `/whatsapp` lo reconoce con el regex `entrar en (la app|el ordenador)\W*código`
  (no importa nada más del texto), y el navegador que pregunta por `/wa-qr-poll` entra
  solo. En el ordenador se enseña como QR (`vendor/qrcode-generator-1.4.4.js`, con aviso
  de no escanearlo con el propio escáner de WhatsApp — daba "QR inválido"); en el móvil,
  WhatsApp se abre directo con el texto ya escrito y, al volver a la pestaña
  (`visibilitychange`/`pageshow` + `localStorage`), la web entra sola sin tocar nada.
  Auto-registro de cuenta nueva sin tocar (`_waCreateAccount`, mismo camino de siempre).
  **Dos vueltas de fallos reales antes de esto** (documentadas en `CLAUDE-historial.md`
  si hace falta el detalle): primero el saludo de bienvenida solo reconocía "Hola" y no
  "Hola Salma" (el texto real que manda el botón); después, aun arreglado eso, la señal
  usada ("primer mensaje del día") se rompía al probar el botón varias veces seguidas el
  mismo día — sustituido por el código de un solo uso, que no depende del texto ni de
  cuántas veces se pruebe. Commits `9141069` → `747331d` → `ba77386`, **Worker Version
  ID final `9a72a107-f172-493a-a9b8-a0687c724cda`**, `app.js?v=163`.
- **F5.3 (tools + memoria por WhatsApp) sin empezar** — depende de F5.4 (ya hecho) y no
  tiene fecha.
- **F5.5 (proactivo, plantillas Meta) BLOQUEADO** — Twilio rechazó el Business Profile de
  producción por Business ID no verificable (18602): sin alta de autónomo o una SL con
  CIF, el DNI de Paco no pasa el KYB de Meta/Twilio. **Decisión de negocio pendiente de
  Paco, no técnica** — no perseguir esto hasta que él decida alta de autónomo o formar
  una SL. Mientras tanto, todo sigue en Twilio Sandbox (funciona igual, solo con el límite
  de que Salma no puede escribir primero fuera de plantillas aprobadas).
- Cambio de coste a vigilar: desde el 1 oct 2026 los mensajes de servicio de WhatsApp
  dentro de la ventana de 24h dejan de ser gratis en Twilio — verlo cuando llegue.

**Notas de Paco, 26 sept 2026 — 5 tareas dictadas, a hacer en orden:**
1. ~~Panel admin: eliminar usuarios~~ — **HECHO y CONFIRMADO EN PANTALLA por Paco el 25
   sept 2026, de punta a punta** (borrar cuenta real de WhatsApp → desaparece de la lista
   → volver a registrarse con el mismo número → aparece bien otra vez). Costó 3 bugs
   reales encontrados en el propio proceso (confirmación por texto, uid con guion bajo
   rechazado, `whatsapp_sessions` que no se limpiaba) + una auto-reparación de propina.
   **Worker Version ID vigente: `caaf6cae-231f-471f-8eaa-eae657be1c38`.** Detalle completo
   en `CLAUDE-historial.md`.
2. ~~Panel admin: tipo de registro (WhatsApp/Google)~~ — **HECHO** en la misma sesión que
   la tarea 1 (`/admin/stats` expone `phone`/`created_via`; panel `2026-09-26.3`). Salió
   de necesitar distinguir cuentas de WhatsApp para poder probar el borrado.
3. **Personalizar WhatsApp con la imagen de Borrado del Mapa** — **BLOQUEADA, mismo motivo
   que F5.5**: el número de Sandbox (+14155238886) es de Twilio, compartido por todos los
   que prueban WhatsApp con Twilio en el mundo — no se puede personalizar mientras no haya
   número propio (que exige WhatsApp Business Account verificado → alta de autónomo/SL,
   decisión de negocio pendiente de Paco). El "Ok" doble que manda Twilio al unirse al
   Sandbox es del mismo origen — tampoco se puede tocar ni silenciar desde nuestro código.
4. **Revisar los textos exactos** — 12 mensajes revisados con Paco el 25 sept 2026 (alta,
   ya registrado, vinculación con código, errores). El único cambio real de contenido fue
   quitar el atajo de respuestas de KV (ver punto 5) — el resto de textos, tal cual están,
   sin más cambios pedidos por ahora.
5. **Que WhatsApp funcione igual que la web (F5.3)** — EN MARCHA, 25 sept 2026. Checklist
   acordado con Paco (ver `CLAUDE-historial.md` para la tabla completa función por
   función): respuestas KV → historial de conversación → ubicación → buscar sitios → resto
   de tools → los que no caben en chat (rutas completas, mapa en vivo, pagos...) con enlace
   de auto-entrada a la web.

   > **⚠️ NORMA para todo este punto (Paco, 25 sept 2026, tras la cadena de preguntas de
   > "hazme una ruta"):** "si ya funciona en la app, cogemos lo que ya funciona sin
   > estropearlo en la app" — nunca escribir una redacción/lógica propia para WhatsApp
   > cuando ya existe la pieza equivalente probada en la app (prompt, función, regla). Se
   > extrae esa pieza a algo compartido y WhatsApp la reutiliza tal cual, verificando
   > siempre que lo que usa la app queda exactamente igual (ver caso real:
   > `BLOQUE_RUTA_INFO_DIRECTA`, extraída de `BLOQUE_ACCION`, más abajo — costó dos
   > vueltas de bug antes de hacerlo así en vez de parafrasear).
   - **Respuestas instantáneas de KV: HECHO Y REVERTIDO en la misma sesión.** Se implementó
     (reutilizando la detección de país del chat principal, extraída a
     `detectCountryAndKV()`), se probó, y Paco vio en pantalla que la plantilla fija se
     quedaba corta contra Claude (enchufes de Japón: la plantilla no distinguía 50Hz/60Hz
     por zona ni qué adaptador necesita un español). **Decisión: WhatsApp llama siempre a
     Claude**, como la web — se pierde el coste 0 de esta vía pero la calidad es constante.
     `detectCountryAndKV()`/`tryKVDirectAnswer()` siguen vivas y en uso por el chat
     principal, solo se dejaron de llamar desde `/whatsapp`.
   - De propina, un bug real encontrado y arreglado en el camino (afecta también, aunque
     rara vez, al chat principal): la lista de palabras a ignorar al geocodificar con
     Nominatim no incluía palabras como "enchufe" — un mensaje en minúsculas sin "en X"
     capitalizado ("q enchufe hay en japon") geocodificaba "enchufe" ANTES que el país real
     y devolvía España en vez de Japón. Corregido ampliando esa lista.
   - **Historial de conversación: HECHO, 25 sept 2026 — confirmado en pantalla por Paco
     ("funciona a falta de más pruebas").** WhatsApp no tiene navegador que guarde los
     últimos turnos como la web, así que los guarda el propio Worker en KV
     (`wa_history:{numero}`, últimos 20 turnos/40 mensajes, caducidad 6h de inactividad —
     pasado ese rato se trata como conversación nueva). Solo el chat normal lo toca; los
     flujos de alta/login no.
   - **Punto 1, ubicación: HECHO y confirmado en pantalla por Paco, 25 sept 2026 — tres
     vueltas de arreglo antes de darlo por bueno.** Twilio no soporta "ubicación en vivo"
     de WhatsApp (confirmado con búsqueda web), solo mensajes puntuales (Latitude/Longitude,
     con Body vacío) — se guarda en KV (`wa_location:{numero}`) con caducidad de 90 min y se
     trata como un dato que envejece en dos tramos: fresca (<20 min) se usa directa
     mencionándola; entre 20-90 min Salma pregunta "¿sigues en X?" antes de darla por buena;
     pasados 90 min caduca sola y es como si no hubiera ubicación.
     1. Primer intento: al compartir ubicación tras hablar de destinos hipotéticos
        (Marruecos/Japón), Salma confundía la ubicación real con esos destinos y le devolvía
        la pregunta ("¿en qué ciudad de Marruecos o Japón quieres comer?") en vez de usar el
        sitio real. Arreglado dejando explícito en el prompt que la ubicación compartida es
        "de verdad, ahora mismo, en la vida real", no un destino de viaje del que se haya
        hablado antes.
     2. Segundo bug, más grave ("se queda callada"): compartir ubicación mandaba un mensaje
        fijo de confirmación y paraba ahí SIN llamar a Claude — si justo antes había una
        pregunta pendiente ("dónde ir a cenar"), se quedaba sin responder hasta que Paco
        insistía. Arreglado: ahora compartir ubicación llama a Claude con el historial (que
        tiene la pregunta pendiente) + un aviso de que se acaba de compartir ubicación, para
        que confirme la ciudad y siga con lo que se estuviera hablando en una sola respuesta.
        Extraído `buildWaLocationCtx()` para no duplicar la lógica de frescura entre el chat
        normal y este camino. **Aviso de coste (protocolo §8, aprobado por Paco):** compartir
        ubicación pasa de costar 0 (antes, sin llamar a Claude) a costar como un mensaje
        normal de chat.
     3. Confirmado por Paco, EN PANTALLA, que la respuesta ya llega de un tirón nada más
        compartir ubicación, sin tener que volver a preguntar — el bug "se queda callada"
        está cerrado de verdad. El contenido de esa respuesta ("Ribadedeva es municipio
        pequeño, lo que está cerca es Colombres... sigo sin poder buscarte sitios por aquí,
        prueba Google Maps o TripAdvisor") es el esperado ahora mismo: WhatsApp todavía no
        tiene el tool `buscar_lugar` conectado — eso es el punto 6, siguiente en la lista.
   - **Punto 6, buscar_lugar: HECHO y confirmado en pantalla por Paco, 25 sept 2026
     ("busca bien").** Conectado el mismo tool `buscar_lugar` del chat web (Google
     Places real: nombre, dirección, teléfono, rating, Google Maps) a WhatsApp, a través de
     un bucle de tool-use acotado (`waCallClaudeWithTools()`, máx 3 vueltas — sin streaming
     SSE, aquí basta una respuesta final por turno). Se usa tanto en el chat normal como
     justo al compartir ubicación, así una vez compartida puede buscar directo en esa ciudad
     sin volver a preguntarla. Vuelos, hoteles y coches SIGUEN sin conectar (fuera de esta
     tarea). **Aviso de coste (protocolo §8):** cada vez que alguien pida un lugar concreto
     por WhatsApp esto añade 1 Google Places Text Search (~0,032€) + hasta 5 Place Details
     cacheados 30 días (gratis salvo la primera vez que se pregunta por ese sitio) — el
     mismo coste que ya paga cada búsqueda equivalente en la web.
   - **Casos híbridos (rutas completas) — decidido con Paco, 25 sept 2026: NO bloquear.**
     Primera propuesta (interceptar "2 días en X" con un mensaje fijo mandando solo a la
     app) RECHAZADA por Paco: "no me convence, podría contestarte como en la web y dar la
     opción de guardarla en la web". Se decide en su lugar que WhatsApp funcione con LOS
     MISMOS límites que la app (Premium/gratis), no un control aparte — y que si el usuario
     pide guardar, se genere y guarde de verdad, respetando el mismo tope. Partido en 3 pasos:
     1. **Comprobar si puede guardar — HECHO, desplegado, pendiente de confirmar en pantalla.**
        `isSaveRouteRequest()` detecta "guárdala"/"guarda esta ruta" en WhatsApp y llama a
        `usageGate(env, waGetUserPlan(...), 'guide')` — la MISMA función que ya gatea "Crear
        ruta con mapa" en la web (ver corrección de la sección "Modelo de negocio" más abajo:
        esto YA es server-side de verdad, con el plan real de Firestore). Si no le queda,
        mismo mensaje que en la web + enlace a Premium. Si le queda, de momento se le manda a
        guardarla en la app (que ya lo hace bien) — no llama a Claude, coste 0.
     2. **Generar y verificar la ruta de verdad desde WhatsApp — HECHO, desplegado, pendiente
        de confirmar en pantalla.** Se llegó aquí tras un tramo malo (ver más abajo: v3 del
        fix de preguntas, desplegado, seguía sin parecerse a la web) que acabó con Paco muy
        enfadado ("no sé qué cojones estás haciendo") — con razón: yo estaba comparando contra
        el chat normal de la web, pero "1 día en X" en la web dispara "Tiempo 1" (recomendaciones
        en prosa, formato **Día N**, con botón "Crear ruta con mapa" debajo) y el mapa/verificado
        SOLO sale al pulsar ese botón ("Tiempo 2") — dos cosas distintas que yo estaba
        mezclando. Paco, tras aclarar esto: **"DALE AL PASO 2 DE UNA VEZ Y DEJA DE MAREAR"**.
        `waGenerateAndSaveRoute()` reutiliza las MISMAS dos funciones del Tiempo 2 de la web
        —`convertProseToRouteJson()` (convierte a JSON el último plan que Salma dio en la
        conversación, de `wa_history`) y `verifyAllStops()` (Find Place + Details por parada,
        con la misma caché de 30 días compartida)— cero motor nuevo. Se guarda en Firestore
        (`users/{uid}/maps/{id}`) con el MISMO esquema que `app.js:guardarGuiaDirecto()` usa en
        la web (vía cuenta de servicio del Worker, que no tiene el SDK de cliente), y se
        descuenta con `usageRecord()`, la misma función de siempre. **Aviso de coste (protocolo
        §8): esto es EXACTAMENTE el mismo coste que ya paga "Crear ruta con mapa" en la web**
        (1 Claude Sonnet hasta 20K tokens + verify Google Places por parada) — no es un coste
        nuevo, es la misma acción ya tarificada, ahora también accesible desde WhatsApp.
     3. **Enlace que abre la ruta YA guardada directamente — HECHO, desplegado, pendiente de
        confirmar en pantalla.** Commit `6885098a`, **Worker `4b37878b-878b-4325-aae6-aff4eaab790e`**
        (comprobado contra `/version`), `app.js?v=166`. El código de un solo uso lleva
        `go: 'ruta:{mapId}'` (mismo mecanismo que `premium`); `app.js` lo recoge en
        `onAuthStateChanged` y llama a `salma.cargarGuia(mapId)` (mismo camino que Mis Viajes:
        vista de itinerario con mapa). Cubre también "mapa por WhatsApp con enlace a la web"
        (el enlace abre la guía sobre el mapa); pagos ya iba con el enlace `premium`. Sin coste
        (KV + una lectura de Firestore). Probar: pedir ruta → "guárdala" → tocar el enlace.
   - **Bug real encontrado y arreglado, 25 sept 2026, desplegado y confirmado en pantalla
     por Paco: cadena de preguntas al pedir una ruta.** "Hazme una ruta por Santillana del
     Mar" daba la info correcta pero terminaba preguntando "¿día completo o visita rápida?"
     y luego "¿tienes coche o no?" — la típica conversación de bot. Causa: `WHATSAPP_SYSTEM_CHAT`
     excluye `BLOQUE_ACCION` entero (trae instrucciones de vuelos/hoteles no conectados a
     este canal) y con él se fue también su regla "destino+ruta → info directa, NUNCA
     '¿qué tipo de viaje?'". Se portó esa regla concreta (no el bloque entero) al prompt de
     WhatsApp. Antes de desplegar, Paco preguntó explícitamente si esto (u otros cambios del
     día) podían haber roto algo de la web — comprobado con `git diff` que ningún cambio de
     hoy toca `BLOQUE_ACCION`/`SALMA_SYSTEM_CHAT/PLAN/ROUTE` ni ninguna función que use la
     web (todas las funciones tocadas son nuevas, prefijo `wa`), y Paco confirmó en pantalla
     que "3 días Sevilla" y "moneda de Japón" siguen funcionando bien en la web. Aun así, el
     primer despliegue del fix seguía preguntando (otra pregunta parecida, no exactamente la
     misma) — Paco preguntó por qué no se reutilizaba directamente lo que YA funciona bien en
     la app en vez de una redacción propia. Con razón: v3 extrae el punto 2 de `BLOQUE_ACCION`
     a `BLOQUE_RUTA_INFO_DIRECTA` y WhatsApp usa ese texto LITERAL (verificado en runtime que
     `BLOQUE_ACCION` sigue siendo byte a byte idéntico para la web), con un único añadido
     genuino: sin botón "Crear ruta con mapa" que sustituya la conversación libre, la regla se
     refuerza a cualquier pregunta de personalización, no solo las dos que cita el texto
     original. **Norma anotada para el resto de F5.3**: si ya funciona en la app, se reutiliza
     tal cual — nunca una versión propia para WhatsApp.
   - **Invitación a guardar sin depender del modelo — HECHO y confirmado en pantalla por
     Paco, 25 sept 2026 ("ya lo hace").** Tras el paso 2, Paco seguía viendo (captura en mano) que la
     respuesta de ruta terminaba en "si quieres te busco restaurantes" en vez de invitar a
     guardar — pedírselo en el prompt no bastaba. `appendGuardarlaCta()` la añade por código,
     determinista, si el mensaje era de ruta/destino y la respuesta no la menciona ya —
     detector: `isRouteRequest`/`isDaysDestination` de la web + "hazme una ruta por X" (que
     esas dos no cazan). Comparado con una captura real de la app ("Si te encaja, dale a
     Crear ruta con mapa..."): mismo patrón en los dos sitios — invitación al siguiente paso
     al final, no una pregunta bloqueante.
   - **Enlaces de auto-entrada: el destino ya no se pierde — HECHO y confirmado en pantalla
     por Paco, 25 sept 2026 ("ok funciona").** Primer intento con el enlace viejo (generado
     antes del fix, sin el destino guardado) seguía sin funcionar — normal, ese código nunca
     llevó "premium" dentro. Con un enlace nuevo (pedido otra vez con "guárdala"), sí abre
     Perfil + Premium directo. Al probar el enlace a Premium (mensaje de
     límite de guía gratis), Paco vio que abría el index normal, no Perfil/Premium — y esto
     pasaba con TODOS los enlaces de auto-entrada con parámetro extra, no solo ese. Causa:
     `app.js:_tryWaAutoLogin()` borra la URL entera (`history.replaceState`) nada más ver
     `?entrada=CÓDIGO`, antes de que nada pueda leer un `&go=...` pegado al enlace. Arreglo:
     el destino (`"premium"`) viaja DENTRO del propio código de un solo uso en KV
     (`buildAutoLoginLink` guarda `{uid, go}` en vez de solo el uid) y `/wa-weblogin-verify`
     lo devuelve en la respuesta del login, no en la URL — `app.js` lo recoge de ahí
     (`window._waLoginGo`) y si es `"premium"` abre Perfil + el modal de Premium,
     reutilizando el mismo camino que ya usa `pago=cancel` (no uno nuevo). Compatible con
     códigos ya emitidos en el formato viejo (uid en texto plano). Toca `app.js` (confirmado
     por Paco antes de tocarlo) — `app.js?v=165` en `index.html`.
   - **Resto de tools (vuelos, hoteles, coches) — HECHO, desplegado, confirmado en pantalla
     con vuelos por Paco (buscó a Koh Samui).** Cambio mecánico: se amplía `WA_TOOLS` (antes
     solo `buscar_lugar`) a `buscar_vuelos`/`buscar_hotel`/`buscar_coche` — mismo
     `waCallClaudeWithTools()` + `executeToolCall()` de siempre, sin despachador nuevo.
     Coste: Duffel no cobra por búsqueda (solo por reserva, que no pasa aquí);
     RapidAPI/Booking.com va por cupo mensual ya contratado — esto añade volumen, no un
     gasto nuevo (sin cifra exacta de cupo restante, ver panel RapidAPI si hace falta
     precisión).
     - **Bug real encontrado en la propia prueba, arreglado y desplegado:** al aclarar la
       fecha de un vuelo con "Cualquier día del mes", la respuesta llevaba pegado "Si
       quieres, dime 'guárdala'..." sin venir a cuento — `appendGuardarlaCta()` usaba
       `isDaysDestination()` (pensada para un destino suelto tipo "Ronda"), que trata
       cualquier frase corta sin verbo como un destino. Se sacó del detector.
     - **Paco preguntó si el mismo riesgo aplicaba a hoteles/coches — sí aplicaba.**
       Arreglo de raíz, no un parche puntual: `waCallClaudeWithTools()` ahora devuelve
       `{text, usedTools}`, y la invitación a guardar NUNCA se añade si en ese turno se
       ejecutó cualquier tool de búsqueda (vuelo, hotel, coche o lugar) — no depende ya de
       adivinar por la forma del texto.
     - **Bug real encontrado por Paco en la misma prueba, arreglado y desplegado, 25 sept
       2026: fecha vaga de vuelo se quedaba pidiendo fecha exacta en bucle.** "Buscame un
       vuelo a Koh Samui, Tailandia, para noviembre" + "Solo ida" no llegaba a buscar nunca
       — seguía pidiendo un día concreto, a diferencia de la web, que con el mismo criterio
       sí busca (Paco lo confirmó probando ambos: **"no funciona en la app si perfectamente
       con el mismo criterio de búsqueda"**, y preguntó directamente **"o se usa exactamente
       lo mismo q en la app?"** — no se usaba). Causa real: `WHATSAPP_SYSTEM_CHAT` excluye
       `BLOQUE_ACCION` entero, y con él se fueron dos reglas que la web sí tiene: el punto 5
       ("PIDE SERVICIO CONCRETO → usa la herramienta inmediatamente, sin preguntas previas")
       y el bloque `DEFAULTS` ("sin fecha → hoy", "sin fecha de vuelta → solo ida"). La tool
       `buscar_vuelos` ya soportaba `fecha_rango_hasta` para fechas amplias — no era un
       problema de capacidad, faltaba la instrucción de "asume y busca, no preguntes".
       Mismo patrón que `BLOQUE_RUTA_INFO_DIRECTA`: se extraen esas dos piezas a
       `BLOQUE_SERVICIO_DIRECTO`/`BLOQUE_DEFAULTS_SERVICIO`, se usan tal cual en
       `BLOQUE_ACCION` (verificado en runtime que `BLOQUE_ACCION` y los 3 prompts de la web
       quedan byte a byte iguales) y WhatsApp las reutiliza literal, con un único añadido
       genuino: instrucción explícita de usar `fecha_rango_hasta` ante fechas vagas
       ("en noviembre", "cualquier día del mes") en vez de preguntar la fecha exacta en
       bucle. **Este fix funcionó** (ya no se queda pidiendo fecha en bucle), pero al
       probarlo Paco encontró un bug distinto en la misma prueba — ver el siguiente punto.
     - **Bug real encontrado por Paco en la prueba siguiente, 25 sept 2026: sin resultados
       de Duffel, Claude se inventaba una ruta y un precio.** Con la fecha ya resuelta,
       "vuelo a Koh Samui desde Málaga" no encontraba nada en Duffel — y en vez de decir
       eso, Claude respondió con una ruta inventada ("Málaga → Bangkok, luego Bangkok →
       Koh Samui con Bangkok Airways, ~50€ aparte") que no venía de ninguna tool. Causa:
       `PROHIBIDO INVENTAR` ("no inventes horarios ni precios, solo datos de herramientas")
       vive dentro de `BLOQUE_ACCION`, que WhatsApp seguía excluyendo entero — era la MISMA
       causa raíz que los dos bugs anteriores (cadena de preguntas, fecha en bucle),
       apareciendo por tercera vez con otro síntoma.
     - **Refactor de raíz, 25 sept 2026 — Paco preguntó directamente por qué no se copiaba
       la petición entera de la app en vez de seguir extrayendo fragmentos uno a uno cada
       vez que aparecía un bug de esta familia: "por que no hace la petición a la app lo
       copia y lo manda a whassa. Así no sería más fácil?"** Con razón — los tres bugs
       eran el mismo síntoma (`BLOQUE_ACCION` excluido) saliendo por sitios distintos.
       Arreglo: `WHATSAPP_SYSTEM_CHAT` ahora incluye `BLOQUE_ACCION` **completo**, igual
       que `SALMA_SYSTEM_CHAT` en la web — cualquier regla presente o futura ahí (prohibido
       inventar, jerarquía de herramientas, dato primero, SALMA_ACTION, etc.) se hereda
       sola, sin extraer nada a mano nunca más. Verificado en runtime que `BLOQUE_ACCION` y
       los 3 prompts de la web quedan byte a byte iguales — cero cambios para la web.
       Piezas añadidas SOLO por lo que de verdad distingue este canal: qué tools están
       conectadas aquí (`buscar_lugar`/`vuelos`/`hotel`/`coche` — NO `buscar_web` ni
       `guardar_nota`, con instrucción de decirlo claro si algo del texto de arriba pide
       una herramienta que aquí no existe, en vez de fingir que se ha hecho), prohibición
       explícita de generar `SALMA_ACTION`/`HISTORIA_LUGAR` (marcadores que la web
       interpreta en el frontend — WhatsApp no tiene ese parser, se colarían tal cual en
       el mensaje), la regla de "sin botón, refuerza a cualquier pregunta de
       personalización" y la de fechas vagas. Añadida `stripWaLeakedMarkers()` como red de
       seguridad por si el modelo genera esos marcadores de todos modos.
     - **Bug real encontrado por Paco al reprobar, 25 sept 2026: "sigue igual" — el mismo
       vuelo a Koh Samui seguía devolviendo la ruta inventada vía Bangkok/50€.** No era que
       el fix de `PROHIBIDO INVENTAR` no funcionara — la respuesta empezaba con **"Como te
       decía"**: Salma estaba siendo consistente con SU PROPIA respuesta inventada de antes
       del fix, que seguía metida en `wa_history` (dura 6h de inactividad). El fix evita
       inventar EN UN TURNO NUEVO, pero no borra una invención que ya quedó grabada en el
       historial de una conversación que llevaba todo el día de pruebas activa. Arreglo:
       `isResetRequest()` — frases como "reinicia la conversación", "olvida todo" o "borra
       el historial" borran `wa_history`/`wa_location` de ese número sin llamar a Claude
       (coste 0). Sirve para probar limpio y para que cualquier usuario real pueda empezar
       de cero. **Este fix funcionó** (Paco confirmó "Hecho, empezamos de cero" en pantalla),
       pero al repetir la prueba EN LIMPIO el bug de invención seguía — ver el siguiente punto.
     - **Bug real, mismo día, con la conversación ya limpia: la invención era genuina, no
       solo por historial contaminado — Koh Samui no tiene vuelo internacional directo.**
       Paco, tajante: **"cojones que de el resultado correcto"** — no quería un aviso de "no
       lo sé", quería el dato real. Causa de fondo: Koh Samui (USM) no tiene vuelo
       internacional directo (Bangkok Airways no interlina con los vuelos de largo radio), así
       que `buscar_vuelos` en un solo tramo origen→USM siempre da 0 resultados reales en
       Duffel — y sin una instrucción mejor, Claude rellenaba el hueco con presupuestos
       "orientativos" y aerolíneas de memoria (Qatar, Emirates, Turkish) en vez de admitir que
       no había encontrado nada real. Arreglo: instrucción explícita de partir la búsqueda en
       DOS llamadas reales a `buscar_vuelos` (origen→hub regional, ej. Bangkok, y hub→destino
       final) cuando la búsqueda directa a una isla/ciudad pequeña no da resultados, y
       presentar el itinerario con los DOS precios REALES de esas tools sumados — nunca una
       cifra inventada. Solo si ni el tramo al hub encuentra nada se dice que no hay vuelos.
       **Este fix funcionó a medias** — con "Koh Samui" desde Madrid la búsqueda por hub
       encontró algo, pero al probar "Hanói" ninguna de las dos búsquedas (directa ni por
       Bangkok) dio resultado, y Claude volvió a inventar (ver siguiente punto).
     - **Bug real, misma tarde, cuarta vuelta — "Buscame un vuelo a Hanói en noviembre":
       ni la búsqueda directa ni la del hub (Bangkok) dieron resultado, y Claude SIGUIÓ
       inventando** un presupuesto "orientativo" (500-700€, Qatar/Emirates/Turkish) y hasta
       una URL de Google Flights con fechas de 2025 que nadie pidió. Confirmaba lo que ya se
       veía venir: pedirle por texto "no inventes" no es suficiente cuando el modelo prefiere
       sonar útil a admitir que no tiene nada. **Arreglo de raíz, por código en vez de más
       texto de prompt** (mismo patrón que `appendGuardarlaCta`/`stripWaLeakedMarkers`):
       `waCallClaudeWithTools()` ahora devuelve `allFlightSearchesFailed` — true si se llamó a
       `buscar_vuelos` al menos una vez en el turno y NINGUNA llamada encontró vuelos reales.
       El webhook `/whatsapp` IGNORA lo que Claude haya escrito en ese caso y manda
       `WA_NO_FLIGHTS_FOUND_MSG`, un texto fijo sin precio, sin aerolínea y sin URL. Si al
       menos una búsqueda SÍ encuentra algo real, el mensaje de Claude pasa normal. **Desplegado,
       pendiente de confirmar en pantalla por Paco** (volver a pedir el vuelo a Hanói o a
       cualquier destino sin conexión real y comprobar que ahora dice claramente que no ha
       encontrado nada, sin precios ni aerolíneas inventadas).
   - **CAUSA REAL de vuelos/hoteles fallando por WhatsApp (25 sept 2026, noche, vista con
     `wrangler tail` + log `[WA-TOOL]`): WhatsApp no le pasaba a Claude la fecha de hoy** (la
     web sí: `[FECHA ACTUAL]` en `buildMessages`). Buscaba en 2025 → Booking 422, Duffel 0
     vuelos; los arreglos de prompt de antes (hub, mensaje honesto) tapaban esto. Arreglado
     metiendo la misma línea en `waCallClaudeWithTools` (Worker `1354c386`). **CONFIRMADO EN
     PANTALLA por Paco: hotel esta noche OK, y vuelo Madrid→Koh Samui en noviembre con precios
     reales (435 € + 124 € por Bangkok).** De paso: `buscarHotelesBooking` (web y WhatsApp)
     descarta entradas de Booking sin `hotel_name` (llegaban 2 de 5 vacías a 0 €) — Worker `7b3961c5`, **CONFIRMADO EN PANTALLA por Paco (Llanes, 5 hoteles con nombre y precio)**. El log
     `[WA-TOOL]` se queda (solo consola). El "Hoy ya hemos hablado bastante" que salió era el
     tope `wa_daily` de 60 mensajes/día (Paco lo agotó probando; se borró su contador de hoy).
   - **Notas por WhatsApp (25 sept 2026, noche) — HECHO, guardado confirmado en el log.**
     `guardar_nota` conectado (`waSaveNota`: escribe `users/{uid}/notas/{id}` con el esquema de
     `notas.js:create()`, `fuente: 'whatsapp'`) + `BLOQUE_NOTAS` en el prompt de WhatsApp. Sin
     coste de API. Paco no las veía en la web porque su número estaba en la cuenta automática
     `wa_4c1634b76d58c9b42c316476` (sin email), distinta de su cuenta de la web.
   - **Unir la cuenta `wa_` a la cuenta de la web — CAMBIA LA DECISIÓN DEL 24 SEPT (con OK de
     Paco, 25 sept): "que cada usuario pueda guardar sus notas desde WhatsApp en la web".**
     Perfil → Vincular WhatsApp → mandar el código desde el móvil: si el número estaba en una
     cuenta `wa_…`, ahora pasa a la cuenta de la web y se COPIAN sus notas y rutas
     (`waCopyAccountData`, mismo id, sin borrar nada de la `wa_`; `whatsapp_sessions.merged_from`
     guarda la vieja). Si el número estaba unido a OTRA cuenta de Google, sigue avisando sin
     tocar nada. Log `[WA-UNIR]`. Sin coste de API. **CONFIRMADO EN PANTALLA por Paco (25 sept): unido, notas copiadas y una nota nueva por WhatsApp sale en la web.** Worker `bc81421d`.
   - **Paquete "que el usuario sepa y use todo" (25 sept 2026, noche, pedido por Paco: "hazlo
     todo") — DESPLEGADO, sin probar en pantalla.** Todos los avisos los añade el CÓDIGO y van
     dentro del MISMO mensaje (en producción Twilio cobra por mensaje):
     1. Bienvenida con todo lo que se puede hacer (`waHelpText`) + comando **`ayuda`** (sin Claude).
     2. Recordatorio rotativo cada 5 respuestas normales (`WA_TIPS`, KV `wa_tipn:{num}`), nunca
        tras una búsqueda ni con otra invitación en el mismo mensaje.
     3. **WhatsApp usa ya los límites del plan** (20 mensajes/día gratis, 100 Premium, `usageGate`
        'chat') y cuenta tokens en `usage:{uid}:{mes}` (sale en el panel). `wa_daily` sube de 60
        a 120 (solo red de seguridad). Avisos: quedan 5, ≤3, último; al guardar guía, las que
        quedan (o "era tu guía gratuita" + enlace Premium).
     4. "reinicia" visible: en bienvenida/ayuda/recordatorios y automático si el mensaje suena
        molesto (`isWaFrustrated`, 1 vez cada 30 min).
     5. "Díselo a tus amigos" (`waMaybeReferral`, 1 vez/semana, tras guardar guía o búsqueda que
        salió bien). En Sandbox el amigo tiene que mandar antes el `join …` de Twilio.
     6. **`fallo: …`** → `beta_feedback` (sale en Feedback del panel) con los últimos 10 mensajes +
        email a Paco (`waSaveFallo`).
     7. **Fotos** → Claude con visión (`BLOQUE_VISION` de la web, tal cual). **Notas de voz** →
        OpenAI whisper-1 (~0,006 $/min) y sigue como texto. Descarga de Twilio con Basic auth y
        redirección seguida a mano (`waFetchTwilioMedia`).
     8. **Historia**: `/historia-lugar` se extrajo a `getHistoriaLugar()` (web igual). Si Salma
        marca `HISTORIA_LUGAR`, se ofrece "escribe *historia*"; también "historia de X".
     **CONFIRMADO EN PANTALLA por Paco (25 sept): ayuda, nota de voz, fallo e historia (corta en 1 mensaje + "¿Te explico más?" → completa; mensajes >1600 caracteres se parten, `splitWaMessage`). Worker `859c17d8`. Foto: llega y se analiza sin errores (25 sept); Paco "en principio sí", seguirá probando los próximos días.** **PENDIENTES DECIDIDOS POR PACO (25 sept):** coches → esperar a que contrate la API de coches en RapidAPI; recomendar a amigos → "sumamente importante", espera al número de producción de Twilio (en Sandbox el amigo necesita `join …`). Aviso §8 (aprobado): voz ~0,006 $/min; foto ~0,005-0,01 € más que un texto; historia solo la
     1ª vez por lugar (~0,035 €); el resto sin coste. Los límites del plan BAJAN el gasto máximo.
   - **Worker Version ID vigente: ver `/version`** (anterior: `1990087f-457b-4208-90af-3f21f6e933cf`) (despliegues
     intermedios de este punto: `def5f8bc-98f2-4ca0-b343-2a78735984fb` → búsqueda de vuelos
     por hub real (funcionó a medias, seguía inventando cuando el hub también fallaba),
     `82e57261-89a4-453b-a201-a5b4a934d820` → frase de reinicio de
     conversación (funcionó, pero no era la causa de fondo), `90eeb8af-f3eb-4a78-9dd0-e66a8ac03820` → BLOQUE_ACCION
     completo en WhatsApp (funcionó, pero el historial de pruebas ya contaminado seguía
     repitiendo la invención vieja), `1dd2ed1b-cdfe-4e0d-877e-571cf7eb878b` → fix fecha vaga
     (funcionó, pero destapó el bug de invención), `f5d8c0a6-a810-4d78-856d-5bcbafe223f6` →
     guardarla nunca tras usar una tool, `c5a25472-0bcd-416f-ba36-af432a5e745e` → vuelos/hoteles/
     coches, `bf1c3805-b554-40ac-a7d3-d7624940b5ad` → fix destino en
     enlaces de auto-entrada, `4b26ef45-eb51-4744-8400-758a48330b54` → paso 2 (generar y
     guardar ruta real), `fd97d958-e2b7-4fa3-a9ef-aaa9b9c4f109` → fix cadena de
     preguntas v3 (texto reutilizado, ver arriba), `464bcc96-e1b4-4d6c-8452-8fedbf62f62a` → ubicación básica,
     `90783047-1c77-4c3b-bd6b-22155514a3aa` → fix destinos hipotéticos, `c7612d4a-c8b8-
     482b-9040-06dcb0537d19` → fix "se queda callada", `87898213-72ce-43e2-be38-
     2cab28577ab5` → buscar_lugar, `e2901891-cb6f-4814-ae98-df44f9feffdf` → paso 1 de
     guardar rutas, este último → mensaje honesto por código cuando ninguna búsqueda de vuelo
     real encuentra nada).

### 🔴 Crítico

- **Nada abierto ahora mismo.** El último crítico real (edición de una guía grande
  sobrescribiéndola con menos paradas) se resolvió con edición por operaciones
  (`SALMA_ROUTE_EDIT`, no reescribe la guía entera) — **CONFIRMADO EN PANTALLA por Paco
  el 21 sept 2026** en todos los casos probados (quitar, sustituir, añadir sin verbos
  explícitos). Detalle completo, con todas las vueltas de arreglo, en
  `CLAUDE-historial.md`.
  - Quedan sin confirmar dos casos menores, baja prioridad: el botón "Ver mi plan" del
    aviso de límite (necesita una cuenta gratuita/Premium sin cupo para probarlo) y una
    edición real de una guía de ~19 paradas (no ha vuelto a darse la ocasión).
- Todo lo demás del 🔴 Crítico de antes del 22 sept (fotos rotas, facturación de Google
  Places, `/pin`, cámara del Narrador, enlaces de Maps, bugs de foto+guía, Ronda...) está
  desplegado desde hace más de una semana y nadie ha vuelto a reportar el síntoma —
  tratado como confirmado por el uso real sin queja. Historial completo en
  `CLAUDE-historial.md` si hiciera falta reconstruir algo.

### 🟡 Importante

- **Explorar — rutas de otros viajeros (25 sept 2026) — DESPLEGADO y CONFIRMADO EN
  PANTALLA por Paco ("ya lo veo, funciona"). Sin probar aún a fondo: apagar el interruptor
  y que desaparezcan sus rutas.** En `main` (commit `d26f766`), **Worker Version ID
  `ac461d62-22b2-4235-b3bf-b3640b0bd261`** (GitHub Action "Deploy Worker", run 80).
  Decidido con Paco: botón dentro de Rutas (pestañas "Mis rutas | Explorar"), visible sin
  login (botón "Ver rutas de otros viajeros" en la pantalla de entrada + pestaña Mis Viajes
  ya no exige sesión), guías existentes incluidas sin repetidas, autor con nombre de pila.
  Perfil → CUENTA → interruptor "Compartir mis rutas" (activado por defecto, campo
  `users/{uid}.share_routes`; al cambiarlo marca `listed` en todas sus `public_guides`).
  Agrupación país → provincia con Nominatim sobre la 1ª parada (gratis, caché KV
  `prov:`); las guías antiguas se van ubicando solas ~20 por reconstrucción. Se excluyen
  las guías de la cuenta Salma (ya están en `/destinos/`). **Coste (§8): 0 € en APIs de
  pago; Firestore lee cada guía pública una vez por reconstrucción del índice (cada 2 h).**
  `app.js?v=167`, `styles.css?v=139`. Sin cambio en `firestore.rules`. Probar: sin sesión
  → "Ver rutas de otros viajeros"; con sesión → Mis Viajes → Explorar → abrir una ruta;
  Perfil → apagar el interruptor → sus rutas desaparecen de Explorar.

- **Catálogo de ideas de Kabi (app similar), 22 sept 2026 — SOLO ESTUDIO, sin decidir.**
  Bottom bar con "+" central ya implementado y confirmado; quedan por decidir: sliders de
  preferencias por tipo de viaje, sección de Eventos, Álbum de viaje (auto-emparejar
  fotos del carrete + opción de imprimir, esta última es un proyecto de negocio aparte).
  Detalle completo en `CLAUDE-historial.md`.
- **Sanear el prompt de sistema — PAUSADO, Paco lo dejó para otro día.** Los 5 cambios de
  texto pequeños (E, D, F, C, B) ya se hicieron uno a uno y están confirmados en pantalla
  (22 sept). Queda pendiente, solo si Paco lo pide, con el mismo proceso paso a paso
  (un cambio, un despliegue, una prueba): (A) si Salma debe preguntar algo antes de
  generar una ruta o seguir sin preguntar (como ahora), y qué hacer con `BLOQUE_GEOGRAFIA`
  (dejarlo, quitar solo la lista de fronteras, o recorte moderado). Proceso obligatorio
  descrito en `CLAUDE-historial.md` — no tocar el prompt sin seguirlo.
- **"Ruta por X sin días" no entra en modo guía — DECIDIDO no tocar la detección por
  texto.** La entrada fiable a una guía completa es un punto de entrada de la UI (el
  botón "+" ya cubre esto); si se escribe en el chat libre sin número de días, sigue
  cayendo en conversación normal con pregunta de días — es el comportamiento esperado.
- **Login con Google: "cancelled popup" — pasos 1-2 hechos, paso 3 (redirect de
  respaldo si el popup se bloquea) sin implementar.** Baja prioridad, sin reportes desde
  el fix.
- **Mapa siempre visible (V5) — propuesta que le gustó mucho a Paco ("le da un caché
  enorme a la app"), sin empezar.** Siguiente paso si se retoma: solo la Fase A (mapa de
  fondo permanente, invisible para el usuario). No tocar sin que Paco lo pida
  explícitamente. Documento completo en memoria de sesión (`project_mapa_fijo_v5.md`).
- **Modo offline completo — sin empezar** más allá de la persistencia de Firestore que
  ya está activa. Documento en memoria (`project_offline_mode.md`).
- Stripe sigue en modo test (`sk_test_`) — falta decidir cuándo pasar a `sk_live_`.
- Google Maps key sin restricción de dominio en GCP Console.
- WebAuthn/fingerprint sigue parcial (solo recuerda email) — y desde el 25 sept además
  quitado del login visible (Paco: "para no liar, de momento").
- **[Prioridad baja]** Resumen/narrativa post-viaje — no existe, sería feature nueva.
- **[Prioridad baja, confirmado que no urge]** La política de red de este tipo de entorno
  (contenedores de Claude Code) bloquea `borradodelmapa-api.workers.dev` — por eso muchas
  entradas del historial dicen "sin confirmar contra `/version`, bloqueo de red del
  contenedor". Arreglo posible: cambiar la política de red del entorno desde la config de
  Claude Code on the web. Paco confirmó que le interesa pero no es urgente.

### 🔧 Deuda técnica

- Código duplicado real (no solo parecido) → **unificado 22 sept 2026**:
  `_sampleWaypoints` y `escapeHTML`/`_esc` ya delegan en una sola función. Lo que
  parecía duplicado pero tenía lógica distinta (`_groupByDay`, `_fullRouteGmapsUrl`) se
  dejó separado a propósito.
- Deep links de apps de transporte: de las apps reconocidas (Uber, Lyft, Grab, Bolt,
  DiDi, Gojek, Careem, inDrive, Cabify, FREENOW, Kakao T, Ola, Yandex Go, Yango), solo
  9 abren con el trayecto ya puesto — el resto abre la app sin prellenar. Investigar
  formato de enlace propietario si hace falta, no es una limpieza rápida.
- 2 funciones muertas (`injectGoogleMapsLink`/`injectTransportBlock`) — **borradas 22
  sept 2026**.

---

**Historial completo de todas las sesiones, bugs ya confirmados y las investigaciones
puntuales (KV de abril, ramas rescatadas, saga de facturación de Google, saga de
WhatsApp F5.0-F5.4, panel admin...): ver `CLAUDE-historial.md`.**

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

