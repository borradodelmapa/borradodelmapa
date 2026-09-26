# Worker Cloudflare: endpoints y flujo del chat

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

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
| GET | `/explorar` | Rutas de la comunidad (público, sin login): índice país → provincia de `public_guides` con `listed != false`, sin repetidas ni <3 paradas. Caché KV `explorar:index:v3` (2 h; 20 min mientras falten provincias) |
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


