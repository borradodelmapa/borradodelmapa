# worker/ — Cloudflare Worker `salma-api` (se carga solo al trabajar aquí)

Detalle: `../docs/worker-endpoints.md` (endpoints, flujo del chat, SSE), `../docs/secrets.md`, `../docs/kv.md`,
`../docs/salma-ia.md` (prompt y tools). Protocolo general: `../CLAUDE.md` (§4 despliegue, §5 no borrar, §8 coste).

- `salma-worker.js` (~316 KB, ~10.400 líneas): es enorme — **no leerlo entero**, usar Grep y leer el trozo.
- **Desplegar SIEMPRE con `-c`**: `cd C:\Users\User\Desktop\salma\worker ; npx wrangler deploy -c wrangler.toml`
  (en la raíz hay un `wrangler.jsonc` que se coge por error). PowerShell: sin `&&`, usar `;`. Antes de
  desplegar: `git fetch origin main` y `git log HEAD..origin/main` (un deploy desde rama desincronizada borra trabajo).
  Después: `curl.exe -s https://salma-api.borradodelmapa-api.workers.dev/version` debe coincidir con el Version ID.
- **NUNCA borrar el Worker** (se destruyen los 15 secrets). Secrets: `npx wrangler secret list -c wrangler.toml`;
  copia: `restaurar-secrets.cjs` (lee `..\api\*.txt`, gitignored).
- **Coste (§8):** toda línea que llame o pueda llamar a una API de pago (Google Places, Anthropic, OpenAI, Duffel,
  RapidAPI, Twilio, ElevenLabs, Stripe, Brave, Serper, OpenWeather) → decir a Paco qué se toca y el impacto, siempre.
  Cachés de coste en KV: `verifiedspot:*`, `placedetails:*`, `nearbycache:*`.
- **Prompt de Salma** (`BLOQUE_*`, `SALMA_SYSTEM_*`, `WHATSAPP_SYSTEM_CHAT`): skill `prompt-salma`. Un cambio cada vez.
  WhatsApp reutiliza los bloques de la web tal cual (nunca redacción propia): `BLOQUE_ACCION` debe quedar byte a
  byte igual para la web.
- Antes de dar un fallo por entendido: seguir el dato de punta a punta (worker + frontend + crons); buscar todos
  los escritores/lectores de una clave KV (`route:*`, `explorar:*`…).
- Crons (`wrangler.toml`): lunes 4:00 (fichas nivel 1, GPT-4o-mini) y diario 6:00 (`_cronFlightWatches`, Duffel).
- KV: nunca ejecutar scripts de `kv/` sin explicar qué hacen; si el KV está vacío, restaurar desde los JSON locales.
- Diagnóstico: `npx wrangler tail salma-api --format pretty`. Los logs `[WA-TOOL]`, `[WA-UNIR]`, `[BORRAR-CUENTA]` son útiles.
- Casos automáticos: `recordAutoError`/`fbUpsertGroup` (errores 🤖); el envoltorio de `fetch` conserva el viejo como `_fetch`.
