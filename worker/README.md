# Salma API — Cloudflare Worker

Worker basado en el **prompt de Salma** (`docs/prompt salma.txt`). Expone un único endpoint POST que recibe el mensaje del usuario y el historial y devuelve la respuesta de Salma y, si aplica, la ruta en JSON para el mapa.

## Contrato del API

**Request (POST)**  
- `message` (string): mensaje del usuario  
- `history` (array, opcional): historial de conversación `[{ role, content }, ...]`  
- `current_route` (object, opcional): ruta actual en el mapa (para peticiones de tipo "añade un lugar", etc.)

**Response (JSON)**  
- `reply` (string): texto de Salma para el chat  
- `route` (object | null): si Salma ha generado una ruta/lista de paradas, objeto con `title`, `country`, `stops[]` (cada uno con `name`, `description`, `type`, `day`, `lat`, `lng`), `tips`, `tags`, `summary`, `budget_level`, `suggestions`

## Requisitos

- Cuenta en [Cloudflare](https://dash.cloudflare.com) y [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) instalado.
- API key de OpenAI (o API compatible con el mismo formato: `POST /v1/chat/completions`).

## Configuración

1. En la carpeta del worker:

```bash
cd worker
```

2. Crear el secret con tu API key de OpenAI:

```bash
wrangler secret put OPENAI_API_KEY
```

(Te pedirá el valor; pega tu clave `sk-...`.)

3. Opcional en `wrangler.toml` o como secret:
   - `OPENAI_BASE_URL`: URL base del API (por defecto `https://api.openai.com/v1`).
   - `OPENAI_MODEL`: modelo a usar (por defecto `gpt-4o-mini`).

## Despliegue

```bash
cd worker
npm install -g wrangler   # si no lo tienes
wrangler login            # enlace con tu cuenta Cloudflare
wrangler deploy
```

Tras el deploy, Wrangler te dará una URL (ej. `https://salma-api.<tu-subdominio>.workers.dev`). Esa URL es la que debe usar el frontend en `window.SALMA_API` (en `salma-chat.js`).

## Probar en local

```bash
wrangler dev
```

En otro terminal, por ejemplo:

```bash
curl -X POST http://localhost:8787 -H "Content-Type: application/json" -d "{\"message\":\"Ruta por Málaga en 2 días\"}"
```

(En local también necesitas tener definido el secret `OPENAI_API_KEY` o usar `.dev.vars` con `OPENAI_API_KEY=sk-...`.)

## Notas

- El prompt instruye a Salma a no inventar datos y a no sustituir el destino (p. ej. no responder con Marbella si piden Málaga). Si no tiene información, debe decirlo.
- Las coordenadas de las paradas pueden venir en 0 si el modelo no las conoce; el frontend puede geocodificar con Nominatim cuando falten.
