# Estudio: vídeo del viaje y álbum desde las fotos — SOLO ESTUDIO (29 sept 2026)

Sesión de la nube, rama `claude/mapa-interactivo-imagenes-crr71m`. Nada tocado en la app ni en el Worker.
Caso: ver `docs/casos-por-crear/2026-09-29-nube.json` (va a "En estudio").

## Lo que pidió Paco
Subir fotos por lotes, que se coloquen solas en el mapa donde se hicieron, exportar el mapa interactivo, vídeo
del viaje y álbum bonito. Después: "centrarnos en Travel Animator y Polarsteps", **muy fácil de usar**, la IA lo
hace todo y el usuario edita (o mejor, Salma le va ayudando). Narración de Salma escrita y hablada, o la voz del
propio usuario. Música libre de derechos (viaje, épica, romántica…) o pista propia. "No perder de vista los álbumes,
ahí hay dinero."

## Qué hay hoy en la app (y por qué el vídeo sale mal)
- `share-inbox.js` ya lee GPS + fecha del EXIF, pero solo al compartir desde la galería del móvil. El "+ Añadir" de la
  Galería (`app.js:3136 _uploadFilesToGaleria`) NO lee el GPS.
- Vídeo (`video-player.js` + `video-assembly.js`) — cinco causas de la mala calidad:
  1. Fotos guardadas a 1024 px (`_compressImage(file, 1024, 0.8)`) y ampliadas ×2,5 para un vídeo 1080×1920.
  2. Se graba en tiempo real con `MediaRecorder` + `setTimeout` (`video-player.js:~1005`): pierde fotogramas.
  3. Sale `.webm` en Android (WhatsApp/iPhone lo llevan mal).
  4. El mapa es un Static Maps 640×640 estirado.
  5. Sin música.
- PDF: `guide-renderer.js:994` es un `window.print()` de la página.

## Muestras hechas (artifacts privados de Paco)
- Muestra v1 (mapa + vídeo "Ruta"/"Película" + álbum): https://claude.ai/artifact/F1DoHxBiPMDyz6ZdwMiZY6
  Técnica que SÍ funciona: WebCodecs + mp4-muxer → MP4 H.264 fotograma a fotograma, sin perder ninguno, en el móvil.
  Veredicto de Paco: "bastante bien, hay que darle una vuelta".
- Estudio de mercado: https://claude.ai/artifact/HAD9MKEorUKR8pVXfdanUo

## Mercado (resumen)
- **Polarsteps**: Trip Reels de 1 botón, máx. 60 s, escenas de mapa sobre el terreno, elige fotos por orientación y
  equilibrio. Libro impreso automático (máx. 6 fotos/página, 400 págs, −20 % con suscripción). Vive del libro.
- **Travel Animator**: ruta animada con 300+ vehículos 3D y 30+ estilos de mapa, HD/4K para Reels/TikTok, 5,99 $/mes.
- FindPenguins (vídeo 3D + libro 40–240 $), Relive (vuelo 3D + fotos en su punto GPS), Google Fotos (Beat Match),
  Apple (Memory mixes: canción + look deslizando), CapCut (cortes al ritmo).
- Nuestra ventaja: GPS automático + Salma sabe qué es cada sitio (rótulos y narración con sentido).

## Propuesta "versión superchula"
**3 pasos:**
1. Subir la galería entera sin elegir. Salma separa el viaje (GPS + fecha + país) y aparta lo que no es
   ("9 fotos de Madrid, 3 mayo — apartadas", recuperables), quita repetidas y movidas y elige las mejores. En el móvil, 0 €.
2. Salma propone TODO de golpe: título, subtítulo, texto por parada, guion, música por tono, vehículo por la ruta.
   Lo primero que se ve es el vídeo ya montado.
3. Retocar: tocar cualquier texto, o pedírselo a Salma ("más corto", "di que íbamos en moto con mi hermano").
   Botones rápidos: música (deslizar), voz, vehículo, duración 30 s / 60 s / largo.

**Voz:** Salma escrita (rótulos) · Salma hablada (ElevenLabs, ya contratado) · voz propia con **teleprompter**
(Salma escribe el guion y el usuario lo lee escena a escena). La música baja sola cuando hay voz.

**Música:** biblioteca propia por estados de ánimo (viaje, épica, romántica, tranquila, aventura), cortes al ritmo, y
subir pista propia (aviso: una canción comercial puede quedar silenciada en Instagram/TikTok).
⚠️ Pendiente: una licencia que permita ir DENTRO de la app para uso de los usuarios (muchas "libres" no lo permiten).

**Visual:** vehículo recorriendo la ruta (moto/coche/avión/a pie), por la carretera real (ROAD_GEOM), reel de
30–45 s y vídeo largo; vertical y horizontal. Mapa 3D con relieve = coste de proveedor (MapTiler/Mapbox) por calcular.

**Álbum (negocio):** mismo material → libro maquetado. PDF digital (¿Premium?) + libro impreso con imprenta bajo
demanda (buscar proveedores con API y precios). Precios y acceso: decisión de Paco.

## 💶 Coste por viaje (§8), a ojo
| Qué | Estimación |
|---|---|
| Separar viaje, repetidas/movidas, elegir fotos | 0 € (en el móvil) |
| Nombres de sitios (Nominatim) | 0 € |
| Título, textos y guion de Salma | ~0,01–0,03 € |
| Salma "mira" las fotos para describirlas (opcional) | ~0,03–0,10 € |
| Voz de Salma, 1 min (ElevenLabs) | ~0,10–0,20 € |
| Mapa 3D con relieve | por calcular |
| Libro impreso | lo paga el cliente |

## Siguiente paso acordado
1. Paco sube 3–4 fotos de la N2 de Portugal **como archivo** → comprobar si el GPS llega intacto.
2. Si llega: lote mezclado (Portugal + algunas de España) → probar que las separa bien.
3. Muestra v2 (artifact, sin tocar la app): filtrado de intrusas, textos editables, vehículo por la ruta, música con
   cortes al ritmo, grabar voz con teleprompter.

## Prueba con fotos reales de Paco (29 sept 2026) — hallazgo importante
- 8 fotos del HONOR (ABR-NX1) subidas al chat de Claude, como archivo y desde la galería: **todas llegan con el
  bloque GPS a ceros** (fecha y modelo intactos). También la de Picos de Europa del 24 sept, de cuando la cámara ya
  guardaba ubicación (otra foto del 27 sept sí muestra coordenadas en Detalles) → la subida al chat borra el GPS.
- **Riesgo para el producto:** en Android, el selector de fotos moderno (Photo Picker) puede quitar la ubicación
  a las webs si no se elige por "Archivos/Explorar". Hay que probar en el móvil de Paco los TRES caminos de entrada:
  `<input type=file>` desde Galería, desde Archivos, y compartir a la app (share-inbox). Si se pierde el GPS, plan B:
  colocar por fecha/hora sobre la ruta guardada (0 €) o que Salma reconozca el sitio (≈0,002–0,005 €/foto, avisar §8).
- La foto del 2 sept queda sola a 7 días del resto → por fecha ya se aparta como "otro viaje".

## Página beta publicada y hallazgo de Android (29 sept 2026)
- `borradodelmapa.com/viaje-fotos.html` (noindex, sin enlazar, sin APIs de pago; mapa Leaflet+OSM; tabla "Lo que he
  leído de tus fotos"). Datos del mapa en `vendor/countries-50m.json`.
- **Chrome en Android entrega las fotos con el GPS a ceros**, eligiendo desde Galería Y desde Archivos (probado por
  Paco con su HONOR). La fecha sí llega. Causa: Android 10+ redacta la ubicación a las apps sin el permiso
  ACCESS_MEDIA_LOCATION (Chrome no lo tiene). Afecta a cualquier web.
- Pendiente de probar: compartir desde la Galería a la PWA (share-inbox.js), subir desde el portátil, iPhone/Safari.
- Propuesta: GPS cuando venga → si no, colocar por fecha/hora sobre la ruta del viaje (0 €) → si no hay ruta, Salma
  mira la foto (≈0,002–0,005 €/foto, avisar §8). A largo plazo, app Android (TWA) con ese permiso (25 $ una vez).
- Compartir desde la Galería a la PWA (29 sept): la app dice "No se encontraron fotos para añadir" → la función de
  compartir está rota (fallo aparte, caso en casos-por-crear). No sirve para probar el GPS todavía.

## Decisión de Paco (29 sept 2026)
"Lo normal es subir las fotos de una vez al final del viaje" → descartado depender de que la app apunte la ubicación
durante el viaje.
- **B (ya):** solo web, sin GPS. Días y orden exactos por fecha/hora; el sitio lo pone Salma mirando las fotos
  (≈0,003 €/foto, Premium) y pregunta lo dudoso ("¿estas 6 son de Góis?"). Precisión a nivel de pueblo.
- **A (más adelante, "tenemos que hacerlo pero de momento no puedo"):** app Android en Play Store (web dentro de
  Capacitor/TWA + selector con ACCESS_MEDIA_LOCATION) para tener el GPS exacto. 25 $ una vez.
- Pendiente de probar cuando Paco tenga ordenador: viaje-fotos.html desde el portátil (y un iPhone si hay).

### Plan de B por pasos (cada uno se prueba antes del siguiente)
1. ✅ (29 sept, subido) viaje-fotos.html funciona SIN GPS: agrupa por días y "momentos" (huecos de 2 h), aparta fotos de otras fechas (huecos de más de 2 días), vista "día a día", vídeo "Película" y álbum por días (0 €).
2. Títulos y textos editables (a mano primero).
3. Música: biblioteca libre de derechos + subir pista propia, cortes al ritmo (0 € si la licencia es gratuita).
4. Voz propia con teleprompter (0 €).
5. Salma: endpoint en el Worker que mira las fotos y propone sitio, título, textos y guion (coste §8, deploy).
6. Voz de Salma (ElevenLabs, coste §8).
7. PDF descargable del álbum y, después, libro impreso.

### Tanda 2 (29 sept 2026, subida) — lo que pidió Paco tras probar el paso 1
- Vídeo: botones "Descargar MP4" y "Compartir" (Web Share con archivo); no se regenera si no cambia nada; pantalla
  encendida (Wake Lock) y aviso si se cierra la página mientras genera.
- Estilo de la web: naranja #F4630B, radio 0, Barlow/Inter, marca "✦ BORRADODELMAPA".
- El viaje se guarda en el móvil (IndexedDB 'bdm-viaje-fotos'): al volver, sigue ahí; las fotos se van AÑADIENDO
  (sin duplicar por nombre+fecha); máx. 60; botón "Empezar otro viaje".
- Cuenta (Firebase, misma sesión que la app): selector de guías (users/{uid}/maps). Al elegir guía, las fotos SIN GPS
  se colocan en las paradas de ese día de la guía (día N fotos = día N guía, repartidas por hora) → mapa, nombres y
  estilo Ruta. "Guardar las fotos en la guía": sube a R2 por /upload-gallery-photo (1600 px, UNA A UNA) y crea
  users/{uid}/fotos {routeId, source:'viaje-fotos', origName, takenAt}; no duplica.
- Avisa de fotos que ya hiciste con la app (pins/map_pins con foto y fotos de la galería en las fechas del viaje, y
  las de la guía) y deja añadirlas.
- Barra de error visible con "Copiar detalles".
- App: tarjeta temporal "🎬 VÍDEO Y ÁLBUM · BETA" en Mis Viajes junto a "+ NUEVA GUÍA" (app.js v203). No toca menú ni
  cabecera (§9).

### Riesgos vistos por adelantado (para no repetir fallos)
- **Worker /upload-gallery-photo usa `Date.now()` como nombre en R2**: dos subidas en el mismo milisegundo se pisan.
  Aquí se sube una a una; share-inbox o la Galería con subidas en paralelo podrían perder fotos → revisar (caso).
- Guía y fotos desalineadas (el viaje empezó un día antes que el "Día 1" de la guía) → hará falta un ajuste de días.
- Memoria: 60 fotos a 1800 px en un móvil modesto puede ir justo; si hay cierres, bajar a 1600 px o a 40 fotos.
- El navegador puede borrar IndexedDB si falta espacio: lo guardado en la guía (R2) es lo único seguro.
- Las fotos traídas de la app necesitan CORS del Worker (/photo/ ya da Access-Control-Allow-Origin: *).

## Estudio a fondo: Polarsteps y Travel Animator (29 sept 2026)
Página: ver artifact "Polarsteps y Travel Animator" (enlace en el chat de la sesión).
- **Polarsteps Trip Reels:** un botón; máx. 60 s (editado, hasta 3:15); elige fotos por equilibrio y orientación;
  desde el verano de 2026, vuelos sobre el terreno real; se comparte o descarga.
- **Polarsteps Travel Book:** A4 apaisado 29,7×21, semimate, tapa dura o lay-flat; 36–150 € (mín. 24 págs), envío
  gratis, −20 % con suscripción. Portada con 4 posiciones de título + año automático. Primera página de cada parada con
  posición, lugar, minimapa y datos del día (lo que más gusta). 1–6 fotos/página (4 apaisadas o 2 verticales). Color del
  tema, textos on/off, arrastrar fotos. Quejas: pocos diseños de página, "regenerar la vista previa", trayectos inventados.
- **Travel Animator:** paradas a mano o enlace de Google Maps; 300+ vehículos 3D, 30+ mapas (globo 3D, satélite,
  relieve); etiquetas, banderas, km; HD con marca de agua gratis; Pro 5,99 $/mes, 44,99 $/año, 39,99 $ de por vida.
  Débil: todo manual.
- **Nuestro hueco:** automatía de Polarsteps + mapa de Travel Animator + Salma (escribe y narra) + la ruta ya existe.
- Guion de reel propuesto (≈45 s): gancho 0–3 s → mapa entero con vehículo y bandera → paradas con fotos al ritmo →
  cierre con cifras y marca.
- Pendiente de decisión de Paco: siguiente paso (reel con moto o álbum nivel Polarsteps), marca de agua en gratis,
  descuento Premium en el libro.

### Paso "reel de la moto" (29 sept 2026, subido) — Paco: "Adelante con el reel de la moto"
- Estilo nuevo **Reel** (por defecto cuando hay ubicación o guía), ≈45 s: gancho (mejor foto + título + fechas +
  bandera + km) → recorrido completo sobre mapa real con bandera y "SALIDA · X" → por cada tramo el vehículo avanza
  con la cámara siguiéndolo, etiqueta "DÍA N · SITIO", contador de km y bandera → 1–4 fotos por parada en cortes secos
  de 1,15 s → cierre con ruta completa, cifras y marca. Máx. 8 paradas (si hay más, una por día).
- Vehículo a elegir (dibujado, visto desde arriba, gira con el rumbo): moto, coche, autocaravana, avión, a pie.
- Mapa del reel: teselas de **OpenStreetMap** (gratis, las mismas que usa la app), desaturadas y oscurecidas; se
  descargan antes de generar el MP4 ("Descargando el mapa: N de M"). Si alguna falla, sale el mapa básico de respaldo.
- 💶 0 €. OJO: la política de uso de tile.openstreetmap.org no admite mucho volumen; si esto se usa mucho, pasar a
  MapTiler/Stadia (plan gratuito limitado, luego de pago) → avisar a Paco con cifras antes.
- Límites: los tramos van en línea recta entre paradas (no por la carretera real todavía); los km son en línea recta
  (menos que los reales). Siguiente mejora: trazado por carretera con ROAD_GEOM de la guía.
