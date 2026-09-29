# Inventario de features implementadas

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.
> 29 sept 2026: puestas al día las secciones de fotos, vídeo, álbum, Tu mundo y GPX (lo demás sin revisar).

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

### Fotos del viaje (29 sept 2026 — sustituye a Galería y Cuaderno; detalle en `docs/estudio-video-album.md`)
- [x] Tocar el mapa en vivo → foto en ese punto (postal Kodak 1080x1920, pin permanente, va a la ruta activa)
- [x] Compartir la postal: WhatsApp / Web Share API / descargar; post 1080×1350, story 1080×1920
- [x] Pestaña FOTOS en cada guía propia (`fotos-viaje.js`): todas las fotos del viaje juntas, por día
- [x] Subir varias de golpe a la nube (R2, 1600 px, una a una), fecha y GPS del EXIF, sin duplicar
- [x] Fotos intrusas: avisa al subir y en las ya subidas (lejos de la ruta o de otra fecha) → Fotos sin viaje
- [x] "Fotos sin viaje" en Mis Viajes: elegir y pasar a un viaje, o quitar
- [x] Visor a pantalla completa (deslizar, "Ver sitio", quitar)
- [ ] ~~Galería con álbumes~~ y ~~Bitácora/Cuaderno~~: quitados de la app el 29 sept 2026 (los datos siguen en Firestore)

### Vídeo y álbum (29 sept 2026 — motor `viaje-fotos.html` en modo app, pestañas VÍDEO/ÁLBUM de la guía)
- [x] Vídeo ya montado al abrir; MP4 H.264 fotograma a fotograma (WebCodecs), 720p/1080p, vertical/horizontal
- [x] 6 plantillas (`viaje-plantillas.js`): Reel, Aventura, Ruta, Película, Postal, Minimal, con miniatura animada
- [x] Reel: vehículo por el mapa real (OSM), transporte por tramo automático, arcos de vuelo, km, banderas
- [x] Importar traza GPX (fotos sin GPS a su sitio por la hora, moto por la carretera real) — solo página suelta, pendiente en la app
- [x] Aviso flotante mientras se crea y al terminar, aunque salgas de la guía
- [x] Álbum maquetado por días (vista en pantalla); PDF e impreso pendientes
- [x] Fotos guardadas en el móvil (Cache Storage) para no volver a descargarlas
- [ ] Vídeo del CHAT (herramienta de Salma) sigue con el motor viejo `video-player.js` → caso p-mun22yc1wkg
- [ ] Música, voz, textos de Salma: casos 04, 06, 12 del 29 sept

### Tu mundo (29 sept 2026, `tu-mundo.js`)
- [x] Franja en Mis Viajes (países · % del mundo · km) y pantalla completa
- [x] Mapamundi, banderas, récords (casa = ciudad escrita, vía Nominatim), viajes por años, tarjeta story para compartir

### GPX
- [x] Descargar GPX de la guía (paradas + ruta + trazado real) para OsmAnd/Calimoto/Garmin

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
- [x] Chip "Narrador" en pantalla de inicio del chat, con popup explicativo antes de
      activarlo (añadido 10 sept — antes no tenía ningún botón accesible)
- [x] Check cada 30s de POIs cercanos (Google Places, radio 20m — reducido desde 500m el
      10 sept a petición de Paco)
- [x] Toast del narrador: sin auto-cierre, solo se cierra con la X (antes se cerraba solo
      a los 10s y no daba tiempo a leer — cambiado el 10 sept)
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


