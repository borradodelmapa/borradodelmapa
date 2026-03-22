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
| Mapas | Leaflet (OpenStreetMap) embebido + Google Maps enlaces |
| Fotos | Google Places Photos API (via photo_ref) |
| Hosting | GitHub Pages / dominio borradodelmapa.com |
| Worker | Cloudflare Workers (salma-api.paco-defoto.workers.dev) |
| PWA | manifest.json + sw.js — instalable desde móvil |

---

## Archivos principales

```
/
├── index.html              # App principal — login, welcome, chat, guías
├── 404.html                # Carga guías públicas por slug (truco GitHub Pages)
├── app.js                  # Lógica: Firebase, auth, welcome, Mis Viajes, guardar
├── salma.js                # Motor de conversación: streaming SSE, historial, envío
├── guide-renderer.js       # Renderiza guía-card: acordeón, mapas, fotos, enlaces
├── styles.css              # Sistema de diseño V2: mobile-first, dark theme
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker para PWA
├── robots.txt              # SEO — apunta al sitemap dinámico
├── CLAUDE.md               # Este archivo
├── backups/                # Copias de seguridad
└── worker/
    ├── salma-worker.js     # Worker principal — prompt + Claude + verify Google Places
    ├── wrangler.toml       # Config Cloudflare Workers
    └── README.md           # Instrucciones del worker
```

---

## Arquitectura Firebase

- **Auth**: Email/contraseña + Google Sign-In
- **Firestore colecciones**:
  - `users/{uid}/maps/{mapId}` — guías del usuario (privadas)
  - `public_guides/{slug}` — guías públicas (SEO, compartir) — `allow read: if true`
- **Regla importante**: `const db` solo se inicializa en `app.js`, nunca duplicado
- Firebase se inicializa en el `<head>` del `index.html`

---

## Salma — asistente IA

- **Rol**: generadora de guías de viaje. No chatbot conversacional.
- **Flujo**: usuario dice destino + días → Salma genera guía → "Guárdala y la tienes completa en Mis Viajes. Cuando quieras otra, dime destino y días."
- **Historial**: se limpia después de cada guía. Cada mensaje = guía nueva.
- **Personalidad**: andaluza suave, fan de Extremoduro, siempre tutea, multiidioma
- **Endpoint**: `https://salma-api.paco-defoto.workers.dev` (POST)
- **Modelo**: `claude-sonnet-4-6` (Anthropic)
- **Prompt**: orden geográfico, recorrido lineal, inicio/fin por día, paradas reales
- **Verify**: Google Places corrige coords + fotos + nombre. NO sobrescribe contexto/food/secret de Claude.
- **API keys**: `ANTHROPIC_API_KEY` + `GOOGLE_PLACES_KEY` como secrets en Cloudflare
- **Deploy**: `wrangler deploy` desde `worker/`

---

## Guías públicas y SEO

- Cada guía guardada se publica automáticamente en `public_guides` con slug SEO
- URL: `borradodelmapa.com/ruta-2-dias-cadiz-xxxx`
- `404.html` carga la guía por slug desde Firestore (sin backend)
- Sitemap dinámico: `salma-api.paco-defoto.workers.dev/sitemap.xml`
- `robots.txt` apunta al sitemap
- CTA en guías públicas: "Crea tu propia guía de viaje en un minuto"
- Guías `featured: true` aparecen como chips en el welcome (controladas por Paco)

---

## Modelo de negocio (freemium)

- **Gratis**: 3 generaciones de rutas
- **Básico**: 5 rutas / 3.99€
- **Viajero**: 15 rutas / 9.99€
- **Nómada**: 50 rutas / 24.99€
- Coste real por ruta: ~0.015€ (margen ~97%)

---

## Features implementadas V2 (22 marzo 2026)

1. ✅ Worker limpio — sin pre-search de Places, respuesta rápida
2. ✅ Verify estricto — Google no mete reseñas ni horarios genéricos
3. ✅ Prompt de ruta lógica — orden geográfico, recorrido lineal
4. ✅ Fotos reales — Google Places Photos en cada parada
5. ✅ Mapas Leaflet — mapa general + mini-mapa por día con ruta
6. ✅ URLs Google Maps con nombres — no coordenadas crudas
7. ✅ Eliminar guías — botón ✕ en Mis Viajes
8. ✅ Edición via Salma — abrir guía guardada y pedir cambios por chat
9. ✅ Guías públicas — URL compartible con slug SEO
10. ✅ Sitemap dinámico — para Google indexación
11. ✅ PWA — instalable desde móvil
12. ✅ Welcome rediseñado — logo centrado, input grande, placeholder rotativo, chips full-width
13. ✅ Login → Mis Viajes directo
14. ✅ Historial limpio después de cada guía
15. ✅ Tamaños de fuente para legibilidad móvil
16. ✅ Footer no tapa mapa (z-index corregido)

---

## Pendiente

- Pasada 2 (enriquecimiento con Haiku) — context/food/secret más ricos
- Alojamiento con datos de contacto
- Descarga offline de la guía
- Rutas largas (5+ días) tardan ~40s por verify — optimizar paralelización
- Popups en mapa con foto + info de parada

---

## Normas de desarrollo

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets
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

# Desplegar worker a Cloudflare
cd worker
wrangler deploy

# Añadir/actualizar secret en Cloudflare
wrangler secret put ANTHROPIC_API_KEY
```
