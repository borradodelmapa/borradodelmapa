# CLAUDE.md — Borrado del Mapa

## Qué es este proyecto

**borradodelmapa.com** — web de planificación de rutas de viaje con IA.
Repo: https://github.com/borradodelmapa/borradodelmapa

El usuario es **Paco**, founder y único desarrollador. Trabaja desde portátil, tablet y móvil.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JS vanilla (sin frameworks) |
| Auth + DB | Firebase Authentication + Firestore |
| IA de rutas | Claude Sonnet (claude-sonnet-4-6) vía salma-worker.js (Cloudflare) |
| IA asistente | Claude Sonnet (claude-sonnet-4-6) vía salma-api.paco-defoto.workers.dev |
| Hosting | GitHub Pages / dominio borradodelmapa.com |
| Proxy API | Cloudflare Workers |

---

## Archivos principales

```
/
├── index.html                   # App principal — login, dashboard, modal de rutas
├── app.js                       # Lógica principal: Firebase init, auth, openModal
├── salma-chat.js                # Widget de Salma: acordeón por días, mapa Leaflet, Firestore
├── CLAUDE.md                    # Este archivo
├── INFORME_TECNICO.md           # Informe técnico del proyecto (estado, decisiones, arquitectura)
└── worker/
    ├── salma-worker.js          # Cloudflare Worker principal — prompt + llamada a Anthropic
    ├── salma-prompt.js          # Prompt de Salma en JS (bloques separados, exportable)
    ├── salma-prompt.txt         # Prompt de Salma en texto plano (referencia)
    ├── index.js                 # Worker anterior (Gemini/OpenAI) — conservado por seguridad
    ├── wrangler.toml            # Config Cloudflare Workers (main = salma-worker.js)
    └── README.md                # Instrucciones del worker
```

---

## Arquitectura Firebase

- **Auth**: Email/contraseña
- **Firestore**: colección `rutas` por usuario — cada ruta guarda días, alojamiento, transporte, coordenadas
- **Regla importante**: `const db` solo se inicializa en `app.js`, nunca duplicado en otros archivos
- Firebase se inicializa en el `<head>` del `index.html`
- `openModal` se define en el `<head>` para estar disponible desde el HTML

---

## Salma — asistente IA

- **Personalidad**: andaluza suave, fan de Extremoduro, siempre tutea, multiidioma
- **Tatuajes**: "Dulce introducción al caos" (brazo izquierdo) y "ขอบคุณ" (brazo derecho)
- **Endpoint**: `https://salma-api.paco-defoto.workers.dev` (POST)
- **Modelo**: `claude-sonnet-4-6` (Anthropic) — migrado desde Gemini 2.5 Flash por quota
- **Prompt**: 8 bloques — identidad, personalidad, muletillas, anti-paja, tono, información, formato, rutas+mapa
- **Prompt separado**: `worker/salma-prompt.js` y `worker/salma-prompt.txt`
- **Contexto dinámico**: detección de país y categoría temática en cada llamada (vía KV si disponible)
- **KV Namespace**: `SALMA_KV` — opcional, para fichas de país y destinos. Funciona sin él.
- **API key**: `ANTHROPIC_API_KEY` guardada como secret en Cloudflare, NUNCA en el repo
- **Deploy**: `wrangler deploy` desde `worker/` (wrangler instalado en el equipo de Paco)

---

## Modelo de negocio (freemium)

- **Gratis**: 3 generaciones de rutas
- **Básico**: 5 rutas / 3.99€
- **Viajero**: 15 rutas / 9.99€
- **Nómada**: 50 rutas / 24.99€
- Coste real por ruta: ~0.015€ (margen ~97%)

---

## Estado actual — bugs resueltos ✓

1. ✅ **Guardado de rutas** — `itinerarioCompleto` guarda todos los campos ricos (`narrative`, `local_secret`, `alternative`, `practical`, `headline`)
2. ✅ **Vista guardada = vista creación** — `verRuta()` en `app.js` reescrito para usar el mismo acordeón que `salmaRenderRoute()`
3. ✅ **Mapa Leaflet** — `salmaInitLeaflet()` inicializa el mapa en ambas vistas (creación y guardado)
4. ✅ **API Gemini quota** — migrado a Anthropic Claude Sonnet (`claude-sonnet-4-6`)

---

## Pendiente funcionalidad

- Alojamiento sin datos de contacto (dirección, teléfono, horario)
- Consejos genéricos — Salma debe dar frases reales, precios reales
- Mensajes de espera mientras Salma genera ("Recopilando información...", etc.)
- Descarga offline de la guía
- KV Namespace `SALMA_KV` — poblar con fichas de países para dar contexto a Salma

---

## Normas de desarrollo

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets o variables de entorno
- **Nunca** usar `window.onload` — Firebase se inicializa en el head
- Antes de refactorizar algo que funciona, confirmarlo con Paco
- Los commits van en español, mensajes cortos y claros
- Cuando algo se rompe, revertir a la última versión estable antes de parchear

---

## Comandos útiles

```bash
# Ver cambios sin commitear
git status

# Subir cambios
git add -A && git commit -m "descripción" && git push

# Revertir último commit (sin perder archivos)
git reset HEAD~1

# Desplegar worker a Cloudflare
cd worker
wrangler deploy

# Añadir/actualizar secret en Cloudflare
wrangler secret put ANTHROPIC_API_KEY
```
