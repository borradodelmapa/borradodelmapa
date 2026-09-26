# KV: base de conocimiento, crons y scripts

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

## KV — Base de conocimiento por país

**2 namespaces** (confirmado 16 sept 2026 vía API de Cloudflare — coinciden con `worker/wrangler.toml`, sin drift):

| Binding | ID | Contenido |
|---------|-----|-----------|
| `SALMA_KB` | `b2056c0613d94feb955b92279ba02fb6` | Todo lo de abajo — países, spots, rutas, cachés, vigilancia de vuelos |
| `ROAD_GEOM` | `39ff0d3316ab43d9b78f1f14b746e5ad` | Geometría real de carreteras (OSM) para `/roads/resolve`, clave `road_geom:v1:{cc}:{slug}` — namespace propio a propósito, pensado para poder compartirse con una futura app aparte sin migración |

### Estructura de claves — `SALMA_KB`

| Patrón | Nivel | Contenido | Cobertura |
|--------|-------|-----------|-----------|
| `dest:{cc}:base` | 1 | Datos base país (moneda, idioma, visados, seguridad) | 193 países |
| `dest:{cc}:destinos` | 2 | Top destinos, qué hacer, qué comer, transporte, cultura | 193 países |
| `dest:{cc}:practical` | 2.5 | Frases, emergencias, apps, salud, conectividad, kit, presupuesto | 193 países |
| `transport:{cc}` | — | Apps transporte (ride-hailing, tren, metro/bus, ferry, especial) | 193 países |
| `spot:{slug}` | — | POI individual (lat/lng, photo_ref, verified_address) | Variable |
| `spotcache:{variant}` | — | Caché auxiliar de resolución de spot por variante de nombre | Dinámico |
| `kw:{keyword}` | — | Índice ciudad→código ISO país | Miles |
| `route:{cc}:{dest}:{days}` | 3 | Rutas pre-generadas con paradas y coords (30 días TTL) | Algunos destinos |
| `verifiedspot:{país}:{nombre}` | — | Caché de verify Google Places entre rutas de usuarios distintos (30 días TTL) — fix de coste del 15 sept | Dinámico |
| `placedetails:{place_id}:{fields}` | — | Caché de Place Details (teléfono/web) por lugar (30 días TTL) — fix de coste del 15 sept | Dinámico |
| `nearbycache:{type}:{lat}:{lng}` | — | Caché Nearby Search por tipo + celda ~1km (7 días TTL) — fix de coste del 15 sept | Dinámico |
| `explorar:index:v3` | — | Índice de Explorar (rutas de la comunidad), ver `/explorar` | 1 clave |
| `prov:{lat}:{lng}` | — | País + provincia de un punto (Nominatim, gratis) para agrupar Explorar — sin caducidad | Dinámico |
| `geo:{lat}:{lng}` | — | Caché reverse geocoding (24h TTL) | Dinámico |
| `geocity:{word}` | — | Caché Nominatim ciudad→país (30 días TTL) | Dinámico |
| `geocity:anchor7:{norm}` | — | Caché de geocodificación de ancla de ruta (7 decimales) | Dinámico |
| `historia:{slug}` / `historia:{slug}:{lat}:{lng}` | — | Caché de `/historia-lugar` (30 días TTL) — con bucket GPS desde el fix del 14 sept | Dinámico |
| `_cache:prompt` | — | Caché prompt Firestore (5 min TTL) | 1 clave |
| `_index:countries` | — | Índice de países con fecha de última generación — lo usa el cron de los lunes | 1 clave |
| `_index:routes` | — | Índice de rutas nivel 3 ya generadas — lo usa el cron de los miércoles | 1 clave |
| `_sa_token` | — | Token de acceso cacheado de alguna integración con service account (TTL 3300s) | 1 clave |
| `sos_rate:{ip}` | — | Rate limiting SOS (10 min TTL) | Dinámico |
| `fw:{uid}` | — | Vigilancias de vuelo activas de un usuario (Vigilancia de Vuelos) | Por usuario |
| `fw_alerts:{uid}` | — | Alertas generadas (bajada de precio / presupuesto alcanzado) | Por usuario |
| `flight_watch_users` | — | Lista de UIDs con alguna vigilancia activa — la recorre el cron diario | 1 clave |

### ⏰ 2 crons del Worker (`worker/wrangler.toml` → `[triggers]`) — el de rutas nivel 3 se eliminó el 17 sept 2026

El Worker tiene `scheduled()` en `salma-worker.js` con 2 disparos automáticos, ya desplegados y corriendo en producción ahora mismo, sin que nadie los active a mano:

| Cron (UTC) | Qué hace | Llama a una API de pago |
|---|---|---|
| Lunes 4:00 | Regenera hasta 5 fichas nivel 1 (`dest:{cc}:base`) caducadas (>180 días) | **Sí — GPT-4o-mini**, ~5 llamadas/semana, coste marginal (céntimos) |
| Diario 6:00 | `_cronFlightWatches` — recorre `flight_watch_users`, comprueba precio actual de hasta 20 vigilancias de vuelo activas y crea alerta si baja >15% o entra en presupuesto | **Sí — Duffel API**, hasta 20 búsquedas de vuelo/día, automático, sin que el usuario pida nada en ese momento |

**Por qué el de vuelos se dice aquí y no se toca:** no aparecía mencionado en ningún sitio de este archivo hasta el barrido del 16 sept — es un gasto recurrente diario en Duffel que corre solo, y la norma de "cualquier cosa que pueda mover la factura, se dice" aplica igual a algo que ya existía y no se sabía que existía. Nadie ha tocado su código.

**Cron de rutas nivel 3 (miércoles 4:00) — ELIMINADO el 17 sept 2026, con OK de Paco.** Comprobado con `_index:routes` (no existía en el KV): **nunca llegó a generar ni una sola ruta en producción**, a pesar de llevar desplegado desde antes de esta sesión. Causa encontrada en el código: escaneaba `env.SALMA_KB.list({ prefix: 'dest:', limit: 500 })` para encontrar países con destinos, pero con >3.000 claves reales bajo ese prefijo (bases + destinos + prácticos + spots de 193 países), el límite de 500 solo alcanzaba a ver ~30 países por orden alfabético — nunca llegaba ni a la mitad del abecedario. Además, igual que el resto de generación nivel 3, no verificaba coordenadas con Google Places (solo comprobaba que no fueran `0,0`) — menos calidad que una ruta real de chat. Decisión: en vez de arreglar este cron (limit + verificación), se sustituye por el proceso manual controlado que genera y verifica rutas nivel 3 país por país (ver [[project_kv_estado]] en memoria) — evita el mismo problema de raíz de abril (dos escritores automáticos distintos tocando la misma clave `route:*` sin coordinarse).

### Scripts de generación (`worker/kv/`)

| Script | Modelo | Output | Coste aprox |
|--------|--------|--------|-------------|
| `generate.js` | Claude Sonnet | Nivel 1 — `dest:{cc}:base` + `kw:*` | ~$0.90 / 193 países |
| `generate-nivel2.js` | Claude Sonnet | Nivel 2 — `dest:{cc}:destinos` | ~$2.50 / 193 países |
| `generate-nivel25.js` | Claude Haiku | Nivel 2.5 — `dest:{cc}:practical` | ~$1.20 / 193 países |
| `generate-nivel3.js` | GPT-4o-mini (cron) | Nivel 3 — `route:{cc}:{dest}:{days}` | ~$0.06 / ruta |

**Otros scripts KV:** `upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`, `upload-spots-bulk.cjs`, `upload-transport.js`, `upload-wrangler.js`, `enrich-spots.cjs`, `stats.js`, `stats-nivel2.js`


