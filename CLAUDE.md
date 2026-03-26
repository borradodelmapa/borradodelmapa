# CLAUDE.md — Borrado del Mapa

## Qué es este proyecto

**borradodelmapa.com** — Salma es tu compañera de viaje. Te diseña la ruta, te guía en ruta, te resuelve imprevistos y documenta tu aventura.
Repo: https://github.com/borradodelmapa/borradodelmapa

El usuario es **Paco**, founder y único desarrollador. Trabaja desde portátil, tablet y móvil. Quiere aprender mientras trabajamos — enseñar proactivamente y proponer mejoras.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JS vanilla (sin frameworks) |
| Auth + DB | Firebase Authentication + Firestore |
| IA | Claude Sonnet (claude-sonnet-4-6) vía salma-worker.js (Cloudflare) |
| Enrich | Claude Haiku (haiku) para KV nivel 2/2.5 |
| Mapas | Leaflet (OpenStreetMap) embebido + Google Maps enlaces |
| Fotos | Google Places Photos API (via photo_ref) |
| Restaurantes | Google Places Text Search (con y sin geoloc) |
| Pagos | Stripe Checkout (parcial — falta actualizar coins) |
| Hosting | GitHub Pages / dominio borradodelmapa.com |
| Worker | Cloudflare Workers (salma-api.paco-defoto.workers.dev) |
| KV | Cloudflare KV (SALMA_KB) — datos de 193 países |
| PWA | manifest.json + sw.js — instalable desde móvil |

---

## Archivos principales

```
/
├── index.html              # App principal — login, welcome, chat, guías
├── 404.html                # Guías públicas por slug (truco GitHub Pages)
├── app.js                  # Firebase, auth, welcome, Mis Viajes, perfil, bottom bar (INTOCABLE sin confirmar)
├── salma.js                # Motor de conversación: streaming SSE, historial, envío
├── guide-renderer.js       # Renderiza guía-card: acordeón, mapas, fotos, enlaces
├── styles.css              # Sistema de diseño: mobile-first, dark theme, dorado
├── utils.js                # Utilidades compartidas
├── salma-copilot.js        # Tarjeta copiloto (info práctica del país por geoloc)
├── mapa-ruta.js            # Leaflet mapas de ruta
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker
├── robots.txt              # SEO — apunta a /sitemap.xml
├── sitemap.xml             # Sitemap index (estáticos + blog + destinos + guías)
├── sitemap-static.xml      # Home + legal
├── sitemap-blog.xml        # Blog (4 artículos)
├── sitemap-destinos.xml    # 300 destinos seleccionados
├── blog/                   # 4 artículos HTML + index
├── destinos/               # 1793 páginas de destinos (SEO nivel 3)
├── mockups/                # Prototipos de features futuras
├── CLAUDE.md               # Este archivo
├── backups/                # Copias de seguridad
└── worker/
    ├── salma-worker.js     # Worker principal — prompt + Claude + tools + verify + KV
    ├── wrangler.toml       # Config Cloudflare Workers
    └── kv/                 # Scripts de generación KV nivel 1, 2, 2.5
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

## Salma — compañera de viaje IA

- **Rol**: compañera de viaje completa. Planifica rutas, busca restaurantes/hoteles/vuelos/coches, resuelve emergencias, da info práctica, acompaña en ruta.
- **Flujo ruta**: destino + días → Salma puede hacer 1 pregunta para personalizar → genera guía → guardar/compartir
- **Flujo servicios**: restaurante/hotel/grúa/embajada → actúa INMEDIATAMENTE, sin preguntar. Dato primero.
- **Historial**: se limpia después de cada guía
- **Personalidad**: andaluza suave, fan de Extremoduro, directa, con opinión propia, siempre tutea, multiidioma
- **Endpoint**: `https://salma-api.paco-defoto.workers.dev` (POST)
- **Modelo**: `claude-sonnet-4-6` (Anthropic)
- **Prompt**: 8 bloques (identidad, personalidad, muletillas, antipaja, tono, info, formato, rutas, mapa)
- **Regla de prioridad**: rutas → puede preguntar 1 vez. Todo lo demás → actúa directo.
- **Verify**: Google Places corrige coords + fotos + nombre. NO sobrescribe context/food/secret de Claude.
- **Tools**: buscar_vuelos, buscar_hotel, buscar_coche, buscar_restaurante (Google Places), buscar_foto
- **API keys**: `ANTHROPIC_API_KEY` + `GOOGLE_PLACES_KEY` como secrets en Cloudflare
- **Deploy**: `wrangler deploy` desde `worker/`

---

## KV — Base de conocimiento por país

Cloudflare KV namespace `SALMA_KB` con datos pre-generados:

| Nivel | Contenido | Cobertura |
|-------|-----------|-----------|
| **Nivel 1** | Datos base del país (moneda, idioma, visados, seguridad) | 193 países |
| **Nivel 2** | Destinos, que hacer, que comer, transporte, cultura | 193 países |
| **Nivel 2.5** | Info práctica: frases, emergencias, apps, salud, conectividad, kit, presupuesto | 193 países |
| **Nivel 3** | Rutas pre-generadas con paradas y coords verificadas | Algunos destinos |

El worker inyecta los datos del KV en el contexto de Claude → menos tokens, más rápido, más barato.

---

## SEO — 3 niveles

### 1. Guías públicas (dinámicas)
- Cada guía guardada → `public_guides/{slug}` en Firestore
- URL: `borradodelmapa.com/ruta-2-dias-cadiz-xxxx`
- `404.html` las renderiza (sin backend)
- CTA: "Viaja con alguien que sabe lo que hace"
- Sitemap dinámico en el worker

### 2. Blog (4 artículos, 8 pendientes)
- `/blog/` con index + artículos standalone
- Tono Salma, estructura "Sin Salma" (caótico) vs "Con Salma" (resuelto)
- Schema.org Article en cada uno
- Artículos: sin-hotel, pasaporte-robado, idioma, avería

### 3. Destinos (1793 páginas)
- `/destinos/` con páginas HTML estáticas por destino
- Generadas con Haiku + KV nivel 2
- 300 en sitemap (estratégicos), resto pendiente
- Chips featured en welcome controlados por Paco

### Sitemap
- `sitemap.xml` → sitemap index en el dominio
- `sitemap-static.xml` (2), `sitemap-blog.xml` (5), `sitemap-destinos.xml` (301)
- Worker sirve sitemap de guías públicas dinámicas
- `robots.txt` → apunta a `borradodelmapa.com/sitemap.xml`

---

## Modelo de negocio — Salma Coins

- **Plan gratuito**: 3 rutas con IA (para siempre), 20 mensajes/día
- **Salma Coins**: créditos que NO caducan, reembolsables si no se usan
- **Packs**: Starter (10 / 4,99€), Viajero (25 / 9,99€), Explorador (60 / 19,99€)
- **Costes**: vuelos (1), hoteles (1), ruta IA (2), copiloto (3), emergencia (2)
- **Stripe**: checkout funciona, falta actualizar coins en Firestore tras pago
- **Coste real por ruta**: ~0.015€ (margen ~97%)

---

## UI actual

- **Welcome**: "Viaja con alguien que sabe lo que hace", input con placeholder rotativo (destinos + problemas), chips featured
- **Chat**: avatar Salma inline (20px) + nombre, texto a ancho completo
- **Bottom bar**: Home, Chat, Perfil (Entrar si no logueado)
- **Perfil**: avatar, coins, Cuaderno de viaje (pronto), Notas de Salma (pronto), Preferencias (pronto), Ayuda
- **Footer legal**: Destinos (dorado), Blog, Aviso legal, Privacidad, Cookies, Términos
- **Copiloto**: tarjeta info práctica del país activada por geoloc

---

## Features implementadas

### V2 (22 marzo 2026)
1. ✅ Worker limpio — sin pre-search de Places, respuesta rápida
2. ✅ Verify estricto — Google no mete reseñas ni horarios genéricos
3. ✅ Prompt de ruta lógica — orden geográfico, recorrido lineal
4. ✅ Fotos reales — Google Places Photos en cada parada
5. ✅ Mapas Leaflet — mapa general + mini-mapa por día con ruta
6. ✅ URLs Google Maps con nombres
7. ✅ Eliminar guías — botón ✕ en Mis Viajes
8. ✅ Edición via Salma — abrir guía guardada y pedir cambios
9. ✅ Guías públicas — URL compartible con slug SEO
10. ✅ Sitemap dinámico
11. ✅ PWA instalable
12. ✅ Welcome rediseñado
13. ✅ Login → Mis Viajes directo
14. ✅ Historial limpio después de cada guía

### V2.5 (24-27 marzo 2026)
15. ✅ KV nivel 1 + 2 + 2.5 — 193 países con info práctica
16. ✅ Tarjeta copiloto — info del país por geoloc
17. ✅ Restaurantes con Google Places — resultados reales con/sin GPS
18. ✅ Prompt prioridad comportamiento — rutas preguntan, servicios actúan directo
19. ✅ Formato estricto — sin viñetas, 1 pregunta máx
20. ✅ Nuevo posicionamiento — "compañera de viaje", no "generador de rutas"
21. ✅ Blog — 4 artículos con template Sin Salma / Con Salma
22. ✅ SEO destinos — 1793 páginas, 300 en sitemap
23. ✅ Sitemap index en dominio propio
24. ✅ Stripe checkout — proceso de pago funcional
25. ✅ Bottom bar — Home, Chat, Perfil
26. ✅ Avatar chat inline — más espacio para texto
27. ✅ 404.html actualizado al nuevo posicionamiento

---

## Pendiente

| # | Feature | Prioridad | Tiempo |
|---|---------|-----------|--------|
| 1 | **Bloques paralelos** — rutas >7 días, buffer Netflix, KV+bloques = 8s | ALTA | 3-4h |
| 2 | **Stripe completo** — actualizar coins tras pago en Firestore | ALTA | 2-3h |
| 3 | **Blog** — 8 artículos pendientes de los 12 | MEDIA | 2-3h |
| 4 | **POIs en mapa** — popups con foto + info en paradas Leaflet (base para copiloto) | MEDIA | 2h |
| 5 | **Copiloto narrador** — detecta POIs cercanos por GPS, narra historia en texto | MEDIA | 3-4h |
| 5b | **Voz de Salma** — lee narración en voz alta (Web Speech API nativa, gratis) | MEDIA | 1-2h |
| 6 | **Hub destinos** — /destinos/ con buscador y filtros | MEDIA | 3-4h |
| 7 | **Bitácora** — diario de viaje, Mi Mapa, fotos geo, notas, compartir, redes sociales | GRANDE | 20-25h |
| 8 | **Descarga offline** — guía descargable sin conexión | BAJA | 3-4h |

---

## Normas de desarrollo

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets
- **Nunca** usar `window.onload` — Firebase se inicializa en el head
- **Nunca** tocar el prompt sin chequear contradicciones entre bloques
- Antes de refactorizar algo que funciona, confirmarlo con Paco
- Los commits van en español, mensajes cortos y claros
- Cuando algo se rompe, revertir a la última versión estable antes de parchear
- Calcular costes API reales antes de lanzar generaciones masivas (tokens + reintentos + dar rango)

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
