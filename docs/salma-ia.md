# Salma IA: modelos, prompt, tools y verify

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

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


