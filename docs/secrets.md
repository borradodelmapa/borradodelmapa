# API keys / secrets

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

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


