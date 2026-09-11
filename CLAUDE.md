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

**Números clave:**
- 15 archivos JS principales (~700KB código)
- 1 Worker Cloudflare (~316KB) con 25+ endpoints
- 1,793 páginas de destinos SEO
- 12 artículos de blog
- 193 países en KV (3 niveles de datos)
- 8 tools de IA
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
├── country-utils.js        # Mapeo 190+ países (ES/EN → ISO), emojis bandera, detección en texto
├── nav-history.js          # Browser back/forward con History API
├── docs-viajero.js         # Documentos del viajero: pasaporte, visado, seguro. CRUD + R2
├── docs-viajero.css        # Estilos del módulo documentos
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
    ├── salma-worker.js     # Worker principal (~316KB) — prompt + Claude + GPT-4o-mini + tools + verify + KV
    ├── wrangler.toml       # Config Cloudflare Workers (KV binding + R2 bucket)
    └── kv/                 # Scripts de generación KV nivel 1, 2, 2.5 + JSONs de respaldo
```

### Orden de carga de scripts (index.html)
1. Firebase SDK 8.10.1 → firebase init inline → `window.SALMA_API`
2. Stripe.js v3
3. `country-utils.js` → `app.js` → `nav-history.js` → `notas.js`
4. `salma.js` → `video-player.js` → `guide-renderer.js`
5. `bitacora-renderer.js` → `mapa-ruta.js` → `mapa-itinerario.js` → `docs-viajero.js`
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
| POST | `/admin/test-extract` | Extraer 10-15 reglas testeables del prompt |
| POST | `/admin/test-rule` | Testear una regla con mensajes trampa + evaluación |
| POST | `/admin/apply-fix` | Aplicar fix IA al prompt, guardar con historial en Firestore |
| POST | `/admin/save-prompt` | Guardar prompt editado manualmente |
| GET | `/health` | Health check de todos los servicios (admin) |
| GET | `/version` | Version ID del despliegue (publico, sin token) — para saber que worker corre |
| GET | `/sitemap.xml` | Sitemap index (1h caché) |
| GET | `/sitemap-guides.xml` | Sitemap dinámico de guías públicas desde Firestore |

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

Cloudflare KV namespace `SALMA_KB` (id: `b2056c0613d94feb955b92279ba02fb6`)

### Estructura de claves

| Patrón | Nivel | Contenido | Cobertura |
|--------|-------|-----------|-----------|
| `dest:{cc}:base` | 1 | Datos base país (moneda, idioma, visados, seguridad) | 193 países |
| `dest:{cc}:destinos` | 2 | Top destinos, qué hacer, qué comer, transporte, cultura | 193 países |
| `dest:{cc}:practical` | 2.5 | Frases, emergencias, apps, salud, conectividad, kit, presupuesto | 193 países |
| `transport:{cc}` | — | Apps transporte (ride-hailing, tren, metro/bus, ferry, especial) | 193 países |
| `spot:{slug}` | — | POI individual (lat/lng, photo_ref, verified_address) | Variable |
| `kw:{keyword}` | — | Índice ciudad→código ISO país | Miles |
| `route:{cc}:{dest}:{days}` | 3 | Rutas pre-generadas con paradas y coords (30 días TTL) | Algunos destinos |
| `geo:{lat}:{lng}` | — | Caché reverse geocoding (24h TTL) | Dinámico |
| `geocity:{word}` | — | Caché Nominatim ciudad→país (30 días TTL) | Dinámico |
| `_cache:prompt` | — | Caché prompt Firestore (5 min TTL) | 1 clave |
| `sos_rate:{ip}` | — | Rate limiting SOS (10 min TTL) | Dinámico |

### Scripts de generación (`worker/kv/`)

| Script | Modelo | Output | Coste aprox |
|--------|--------|--------|-------------|
| `generate.js` | Claude Sonnet | Nivel 1 — `dest:{cc}:base` + `kw:*` | ~$0.90 / 193 países |
| `generate-nivel2.js` | Claude Sonnet | Nivel 2 — `dest:{cc}:destinos` | ~$2.50 / 193 países |
| `generate-nivel25.js` | Claude Haiku | Nivel 2.5 — `dest:{cc}:practical` | ~$1.20 / 193 países |
| `generate-nivel3.js` | GPT-4o-mini (cron) | Nivel 3 — `route:{cc}:{dest}:{days}` | ~$0.06 / ruta |

**Otros scripts KV:** `upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`, `upload-spots-bulk.cjs`, `upload-transport.js`, `upload-wrangler.js`, `enrich-spots.cjs`, `stats.js`, `stats-nivel2.js`

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

### 🔴 Crítico — verificado ahora mismo

- **Pago posiblemente roto en producción — confirmado con Paco (10 sept): lo sabe, no es
  una sorpresa, lo tiene aparcado a propósito priorizando otras cosas. No perseguir sin que
  él lo pida.** El commit `5a6b2f8` (7 sept, sesión "Pasarela de pago Stripe") reescribió
  `/create-payment` en el Worker para el modelo Premium por periodos: espera
  `{plan: '1viaje'|'trimestral'|'semestral'|'anual'}` y devuelve `{url}` de una Stripe
  Checkout Session; añadió `/stripe-webhook` que acredita `premium_until`. `app.js`
  (`openCoinsModal`, ~línea 3241) sigue con el flujo viejo de coins: manda
  `{amount, coins, user_id}` y espera `{client_secret}` para `stripe.confirmCardPayment`.
  Falta la Fase 2 de `docs/pasarela-premium.md` (modal "Hazte Premium" + retorno `?pago=ok`)
  para cerrarlo cuando Paco decida retomarlo.
- **Legal incompleta** — `legal.html` sigue con `[PENDIENTE]` en 5 sitios: nombre del
  titular, CIF/NIF, dirección y email de contacto (obligatorio LSSI/GDPR).
### ✅ Ya resuelto (estaba aquí como pendiente y ya no lo es)

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

- **Historia reactivada (cápsula ampliable en guías + chat) — 11 sept, EN RAMA
  `claude/salma-history-module-52q11h`, no fusionada a `main` todavía, nada desplegado.**
  Se reactivó `historia.js`/`historia.css` (estaban desactivados desde el 7 sept) y se
  añadió un modo compacto (`historiaModule.renderCompactInto`): botón "📖 Historia de X"
  por parada en `guide-renderer.js`/`mapa-itinerario.js` (oculto si Claude marca la parada
  `con_historia:false` al generar la ruta) + uno de país en la cabecera de la guía, y un
  botón bajo la respuesta del chat cuando Claude emite el marcador nuevo `HISTORIA_LUGAR:X`
  (mismo patrón que `SALMA_ACTION`/`FOTO_TAG`, en `BLOQUE_ACCION`). Backend: reutiliza
  `/historia-lugar` tal cual (Claude Haiku + foto Google Places + caché KV 30 días), con
  un matiz en su prompt para narrar bien carreteras/comarcas/países, no solo puntos.
  Falta, en este orden, desde tu ordenador:
  1. `git fetch origin claude/salma-history-module-52q11h` y revisar/fusionar esa rama a
     `main` (o pedir que se haga si la sesión sigue abierta).
  2. Confirmar que GitHub Pages sirve los `?v=` nuevos (`app.js?v=101`, `salma.js?v=75`,
     `guide-renderer.js?v=52`, `mapa-itinerario.js?v=53`, `historia.js?v=2`,
     `historia.css?v=3`): `curl.exe -s https://borradodelmapa.com/index.html | Select-String '\.js\?v='`.
  3. `cd worker; npx wrangler deploy -c wrangler.toml` — el Worker lleva el campo
     `con_historia`, el marcador `HISTORIA_LUGAR` y el ajuste de `/historia-lugar`, nada
     de eso corre todavía en producción.
  4. Comprobar `Current Version ID` contra `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`.
  5. Probar en pantalla: pedir "3 días en Ronda" y comprobar que aparece el botón de
     historia por parada y el de país arriba; y preguntar algo tipo "info de Gaucín" en el
     chat suelto y comprobar que sale el botón debajo de la respuesta. Sin esto, no está
     terminado — nada de lo anterior se ha visto todavía en la app real.
  Pendiente aparte, de decisión tuya, sin prisa: en `salma.js` (~línea 1458) sigue un chip
  antiguo "📚 Historia de [destino]" que al reactivar el módulo vuelve a funcionar y
  navega a la vista de pantalla completa — puede quedar redundante con el botón de país
  nuevo dentro de la propia guía. Revisar y decir si se quita.

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

---

## Normas de desarrollo

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets
- **Nunca** usar `window.onload` — Firebase se inicializa en el head
- **Nunca** tocar el prompt sin chequear contradicciones entre bloques
- **Nunca** editar código sin OK explícito de Paco
- **Nunca** iterar cambios al prompt/código sin aprobación en cada paso
- **Nunca** ejecutar scripts KV sin explicar qué hacen. Si KV vacío, restaurar desde JSONs locales
- **Nunca** subestimar costes API — calcular tokens reales + reintentos + dar rango
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
