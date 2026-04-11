# CLAUDE.md — Borrado del Mapa
## V2.1 Transport — 12 abril 2026 | Backup: `backups/borradodelmapa-v2-mapa-2026-04-11/`

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
| `transport:{cc}` | T | **Transport enriquecido** (rutas, aeropuertos, operadores, precios, booking URLs) | 4 países (ES, TH, NP, VN) — resto básico (126 países) |
| `spot:{slug}` | — | POI individual (lat/lng, photo_ref, verified_address) | Variable |
| `kw:{keyword}` | — | Índice ciudad→código ISO país | Miles |
| `route:{cc}:{dest}:{days}` | 3 | Rutas pre-generadas con paradas y coords (30 días TTL) | Algunos destinos |
| `geo:{lat}:{lng}` | — | Caché reverse geocoding (24h TTL) | Dinámico |
| `geocity:{word}` | — | Caché Nominatim ciudad→país (30 días TTL) | Dinámico |
| `_cache:prompt` | — | Caché prompt Firestore (5 min TTL) | 1 clave |
| `sos_rate:{ip}` | — | Rate limiting SOS (10 min TTL) | Dinámico |

### Transport KV enriquecido (nivel T) — 12 abril 2026

**4 países completos** con datos verificados (operadores, precios, URLs, aeropuertos):

| País | Rutas | Aeropuertos | Plataformas booking | Tamaño | Archivo local |
|------|-------|-------------|---------------------|--------|---------------|
| 🇪🇸 España | 20 | 7 (MAD, BCN, AGP, SVQ, VLC, GRX, BIO) | 16 | 40.8 KB | `worker/kv/transport-routes/es.json` |
| 🇹🇭 Tailandia | 18 | 6 (BKK, DMK, CNX, HKT, KBV, USM) | 14 | 36.6 KB | `worker/kv/transport-routes/th.json` |
| 🇳🇵 Nepal | 12 | 2 (KTM, PKR) | 10 | 29.8 KB | `worker/kv/transport-routes/np.json` |
| 🇻🇳 Vietnam | 18 | 6 (HAN, SGN, DAD, HUI, CXR, DLI) | 12 | 37.4 KB | `worker/kv/transport-routes/vn.json` |

**Schema:** `worker/kv/transport-routes/_schema.json` — definición universal reutilizable para cualquier país.

**Estructura por país (`transport:{cc}`):**
```
{
  country, country_name, updated, currency,
  ridehailing: { best, others, tips, payment, tipping },
  train: { operator, booking_local, booking_foreign, tips, passes },
  metro_bus: { apps, cities: { Ciudad: { systems, card, hours, local_app } } },
  ferry: { operators, booking_url, seasonal, tips },
  intercity_bus: { operators, booking_url, tips },
  special: { modes, tips, scams },
  driving: { side, license, scooter, road_quality },
  airports: { IATA: { name, city, distance_km, transfers: [...] } },
  stations: { Ciudad: { train, bus, bus_alt } },
  routes: [ { from, to, distance_km, popular, options: [...] } ],
  booking_platforms: [ { name, url, type, best_for } ],
  tips_general: [...]
}
```

**Cómo funciona en el worker:**
1. Usuario pregunta por transporte → worker detecta país y lee `transport:{cc}` del KV
2. Worker busca coincidencia de ruta (from/to en el mensaje) o aeropuerto
3. Si match → inyecta SOLO esa ruta (~400 tokens) + formato comparativa + weather/events/news
4. Si NO match → fallback a tips generales + Brave Search
5. Resultado: respuesta 2-3s más rápida que sin KV, con datos verificados

**Añadir un nuevo país:**
```bash
# 1. Crear JSON siguiendo _schema.json
cp worker/kv/transport-routes/_schema.json worker/kv/transport-routes/jp.json
# Rellenar con datos verificados

# 2. Subir al KV
wrangler kv key put "transport:jp" --path "worker/kv/transport-routes/jp.json" \
  --namespace-id "b2056c0613d94feb955b92279ba02fb6" --remote

# 3. No requiere redeploy del worker — los datos se usan automáticamente
```

**Coste por país nuevo:** ~$0.10-0.15 si se genera con Claude Sonnet + verificación web.

### Reglas de fiabilidad (inyectadas en cada respuesta)

El worker inyecta automáticamente un bloque `[REGLAS DE FIABILIDAD]` en el system prompt:
- Fecha actual → prohíbe mencionar eventos pasados (Semana Santa, Carnaval, etc.)
- Prioridad: KV > herramientas > memoria de Claude
- Anti-invención: operadores, horarios, precios, URLs, apps
- Aviso de caducidad si KV tiene >6 meses
- Visados: siempre "verifica en web oficial"
- Seguridad: recomienda exteriores.gob.es
- renfe.com bloqueado (no funciona en móvil) → usa trainline.com

### Transport enrichment (weather + events + news)

Cuando hay match de ruta/aeropuerto en KV, el worker busca EN PARALELO (~400ms total):
- 🌤️ **Tiempo** — OpenWeatherMap (GRATIS, forecast 3 días)
- 🎉 **Eventos** — Serper.dev (~$0.001, solo si hay fecha en el mensaje)
- 📰 **Noticias** — Brave Web Search (GRATIS, 2 titulares recientes)

Los resultados se inyectan en el contexto de Claude y se muestran al final de la respuesta de transporte.

### Formato comparativa transporte (BLOQUE_FORMATO_TRANSPORTE)

Se activa SOLO cuando hay match de ruta KV. Anula el formato prosa y permite:
- Emojis como headers (🚂, ✈️, 🚢, 🚌, 🚕)
- Bullets para datos (operador, duración, precio, enlace)
- ⭐ opción recomendada
- ✅ bloque presupuesto si el viajero tiene ruta guardada
- 📍 ficha destino con datos factuales (fundación, UNESCO, famosa por)

### Scripts de generación (`worker/kv/`)

| Script | Modelo | Output | Coste aprox |
|--------|--------|--------|-------------|
| `generate.js` | Claude Sonnet | Nivel 1 — `dest:{cc}:base` + `kw:*` | ~$0.90 / 193 países |
| `generate-nivel2.js` | Claude Sonnet | Nivel 2 — `dest:{cc}:destinos` | ~$2.50 / 193 países |
| `generate-nivel25.js` | Claude Haiku | Nivel 2.5 — `dest:{cc}:practical` | ~$1.20 / 193 países |
| `generate-nivel3.js` | GPT-4o-mini (cron) | Nivel 3 — `route:{cc}:{dest}:{days}` | ~$0.06 / ruta |
| `upload-transport-routes.js` | — | Transport enriquecido desde JSONs locales | $0 (solo upload) |

**Otros scripts KV:** `upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`, `upload-spots-bulk.cjs`, `upload-transport.js` (básico), `upload-transport-routes.js` (enriquecido), `upload-wrangler.js`, `enrich-spots.cjs`, `stats.js`, `stats-nivel2.js`

**JSONs de respaldo en `worker/kv/`:** `countries.json` (195 países base), `_index.json`, `_nivel2_1.json`
**JSONs transport en `worker/kv/transport-routes/`:** `_schema.json`, `es.json`, `th.json`, `np.json`, `vn.json`

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
- [x] Check cada 30s de POIs cercanos (Google Places, radio 500m)
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

### V2.1 Transport (12 abril 2026)
- [x] KV transport enriquecido: 68 rutas, 21 aeropuertos, 52 plataformas booking (ES, TH, NP, VN)
- [x] Schema universal reutilizable para cualquier país (`_schema.json`)
- [x] Inyección inteligente: worker detecta ruta/aeropuerto en mensaje → inyecta solo datos relevantes
- [x] Formato comparativa transporte (BLOQUE_FORMATO_TRANSPORTE): emojis, bullets, opciones comparadas
- [x] Ficha destino factual: fundación, UNESCO, famosa por, dato útil (sin prosa)
- [x] Weather en paralelo: OpenWeatherMap forecast 3 días (gratis)
- [x] Eventos en paralelo: Serper.dev con filtro de fecha (solo futuros)
- [x] Noticias locales en paralelo: Brave Web Search 2 titulares
- [x] Reglas de fiabilidad globales: KV > herramientas > memoria, anti-invención, fecha actual
- [x] Brave Search skip cuando KV tiene match (sin blogs basura)
- [x] `injectTransportBlock()` reactivada: añade plataformas booking post-respuesta
- [x] URLs verificadas: 61 URLs, 2 rotas arregladas (Green Bus Thailand, Tourist BusSewa)
- [x] renfe.com → trainline.com (renfe bloquea webviews/móvil)
- [x] Upload script: `upload-transport-routes.js` con stats y dry-run

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

### Crítico (seguridad / dinero)
- **Stripe webhook** — pagos se confirman client-side (manipulable). Falta webhook server-side + pasar a live.
- **Chat sin auth** — `POST /` del Worker no verifica token Firebase. Coins no validados server-side.
- **public_guides sin ownership** — cualquier user autenticado puede sobrescribir slugs ajenos en Firestore.
- **Credenciales en git** — `scripts/publish-destinos-salma.js` tiene email+password de Salma bot commiteado.
- **Legal incompleta** — `legal.html` tiene [PENDIENTE] en nombre titular, CIF, email, dirección (obligatorio LSSI/GDPR).

### Importante (UX / compliance)
- **Cookie consent sin UI** — GA4 se carga sin consentimiento (ilegal UE).
- **Sin modo offline** — SW no cachea nada. App en blanco sin red.
- **Stripe en test mode** — falta pasar a live para cobrar.
- **Google Maps key sin restricción** — aceptable pero debería restringirse por dominio en GCP Console.

### Técnico (deuda técnica)
- **Código duplicado** — `_groupByDay`, `_sampleWaypoints`, `_fullRouteGmapsUrl`, `escapeHTML` en 3+ archivos.
- **Monkey-patch frágil** — `mapa-itinerario.js` parchea `bitacoraRenderer.renderDiario` en runtime.
- **Deep links transport incompletos** — Solo Uber y Lyft tienen deep links. Bolt, Grab, DiDi etc. tienen `null`.
- **Manifest PWA básico** — sin `shortcuts`, sin `screenshots`, icono 192px sin versión maskable dedicada.
- **1 función dead code** — `injectGoogleMapsLink()` en el Worker hace `return` inmediato. (`injectTransportBlock()` reactivada en V2.1).
- **Transport KV incompleto** — Solo 4 países con datos enriquecidos (ES, TH, NP, VN). Resto (122 países) tiene datos básicos (apps + tips). Añadir más países según demanda.
- **KV sin backup automático** — Los JSONs locales son el respaldo. No hay backup automático del KV en la nube.

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
