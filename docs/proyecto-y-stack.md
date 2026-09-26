# Qué es el proyecto, stack, archivos y orden de scripts

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

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


