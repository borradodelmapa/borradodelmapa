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
