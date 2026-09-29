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

### Tanda "rapidez y segundo plano" (29 sept 2026, subida)
- Mapa del reel: cada tesela se tiñe UNA vez al llegar (antes, filtro a pantalla completa en cada fotograma) y el mapa
  vectorial de respaldo solo se dibuja si falta alguna tesela → fotogramas mucho más ligeros. Teselas guardadas en la
  caché del móvil ('bdm-tiles'): la 2.ª vez sale al instante y sin gastar datos. 6 descargas a la vez.
- Fotos: se leen 3 a la vez.
- Mientras genera: se puede usar Mapa y Álbum; aviso flotante abajo ("🎬 Vídeo 45 %"), porcentaje en el título de la
  pestaña, vibración y notificación al terminar (si se da permiso y la página está en segundo plano).
- El vídeo en curso ya no se ve afectado si cambias estilo, formato o fotos mientras genera.
- LÍMITE: salir de la página (o que Android congele la pestaña) corta la generación. "Irse a tomar un café" de verdad
  = generar en la nube (ver proyecto, punto 1).

## PROYECTO: lo que queda, en orden propuesto (29 sept 2026)
1. **Generar en la nube (segundo plano de verdad).** Se suben las fotos (ya existe "Guardar en la guía" → R2), el
   servidor monta el MP4 con el mismo motor en un navegador sin pantalla y avisa (notificación / WhatsApp / email).
   Opciones: Cloudflare Browser Rendering (≈0,09 $/hora de navegador, 10 h/mes gratis; un reel ≈1–2 min → <0,005 €)
   o Cloudflare Containers. 💶 céntimos por vídeo; decisión y cifra exacta antes de hacerlo (§8). Toca el Worker.
2. **Sistema de plantillas** (para tener variedad poco a poco sin tocar el motor):
   - Una plantilla = un objeto de datos en `plantillas/<id>.js`: `{id, nombre, necesitaMapa, formatos, colores,
     fuentes, escenas:[{tipo:'gancho'|'mapa'|'tramo'|'fotos'|'capitulo'|'cierre', dur, opciones}], ritmo:{fotoSeg,
     corte:'seco'|'fundido'}, efectos:{grano, bandas, viñeta}, texto:{mayusculas, tamaños}}`.
   - El motor ya tiene las escenas como piezas (`SCENES`): la plantilla solo elige cuáles, en qué orden y con qué
     estilo. Hoy "Reel", "Ruta" y "Película" están escritas a mano en `buildReel`/`buildTimeline` → pasarlas a este
     formato será el primer paso.
   - Selector de plantillas con miniatura animada (primeros 3 s) en la pestaña Vídeo.
   - Ideas de plantillas: Postal (marcos blancos tipo polaroid sobre papel), Documental (texto largo de Salma),
     Nocturna (neón), Aventura (cortes muy rápidos), Minimal (blanco y tipografía grande), Clásica (Ken Burns lento).
3. **Carretera real**: la moto por el trazado de la guía (ROAD_GEOM en KV / directions ya guardadas) y km reales.
4. **Música**: biblioteca por estados de ánimo (licencia apta para uso dentro de la app), cortes al ritmo, pista propia.
5. **Salma**: título, textos por parada y guion (≈0,01–0,03 €/viaje); mirar fotos sin GPS (≈0,003 €/foto); voz
   ElevenLabs (≈0,10–0,20 €/vídeo); tu voz con teleprompter (0 €).
6. **Álbum nivel Polarsteps** + PDF descargable; después, imprenta bajo demanda (negocio).
7. **Integrar en la app** (no página aparte): generar mientras se navega por la app.
8. **App Android (Play Store)** para tener el GPS de las fotos (25 $ una vez).
9. Proveedor de mapas con volumen (MapTiler/Stadia) si el uso crece.
10. Fallo del Worker: /upload-gallery-photo nombra con Date.now() → subidas simultáneas se pisan.

### Sistema de plantillas (29 sept 2026, subido) — Paco: "Adelante con las plantillas"
- Las plantillas viven en **`viaje-plantillas.js`** (una ficha de datos cada una; instrucciones arriba del archivo).
  **Añadir una = copiar una ficha, cambiar id/nombre/desc y valores. No se toca el motor.** Subir `?v=` del script en
  viaje-fotos.html al cambiarlo.
- La ficha elige: secuencia (`reel` · `ruta` · `capitulos`), secuencia sin mapa, ritmo (segundos por foto, corte seco o
  fundido, máx. fotos, duración de tramos), look (colores, marco de foto `blur|negro|polaroid|blanco`, rótulo
  `chip|serif|grande|polaroid|minimal|ninguno`, tipografía de títulos, fondo claro/oscuro, grano, viñeta, bandas de cine).
- 6 de salida: **Reel**, **Aventura** (0,72 s por foto, rótulos enormes), **Ruta**, **Película**, **Postal** (polaroid
  sobre papel, títulos en cursiva) y **Minimal** (blanco). El motor lee el aspecto de la ficha (variable LOOK).
- Sin ubicación, cualquier plantilla sale en capítulos por días con su propio aspecto (aviso en pantalla).
- Se recuerda la última plantilla elegida en el móvil.
- Pendiente (proyecto): miniatura animada de cada plantilla en el selector; más tipos de escena (mapa claro, collage
  de 4, texto largo de Salma); música por plantilla.

### Tanda miniaturas y velocidad (29 sept 2026, subida)
- Miniatura animada de cada plantilla en el selector (primeros segundos con TUS fotos; se pausa mientras genera).
- Calidad: **Rápida 720p** (por defecto, 6 Mbps) o **Alta 1080p** (12 Mbps). En prueba de escritorio 720p ≈25–30 % más
  rápida; en móvil debería ser más (menos píxeles que dibujar y codificar).
- Quitadas las sombras con shadowBlur en cada fotograma (fotos, polaroid, vehículo) → sombra barata de 4 rectángulos.
- Paco: "va muy lentísimo" en su móvil. Si sigue lento con 720p: medir fotogramas/s en su móvil, bajar a 24 fps,
  pre-escalar fotos al tamaño de salida, y a medio plazo generar en la nube (proyecto punto 1).

## Más utilidades de Polarsteps y Travel Animator que nos sirven (29 sept 2026)
| Suya | Qué es | Para Borrado del Mapa | Esfuerzo / coste |
|---|---|---|---|
| Polarsteps **estadísticas de viajero** | Países con banderas, % del mundo visitado, km totales, punto más lejano de casa, días sin viajar | Pantalla "Tu mundo" en el perfil con todas las guías y fotos; se comparte como tarjeta | Medio · 0 € |
| Polarsteps **Play mode 3D** | Reproducir el viaje de principio a fin en el mapa | Ya lo tenemos en 2D (Reel/Ruta); 3D = proveedor de relieve | Alto · coste de mapas |
| Polarsteps **perfil de altura** | Desnivel acumulado, perfil del tramo | En rutas de montaña/moto: "subiste 3.200 m"; se saca de la geometría de la ruta con un servicio de altitudes | Medio · API de elevación (gratis o céntimos) |
| Polarsteps **medios de transporte por tramo** | Cada tramo con su icono (coche, avión, barco…) | Vehículo distinto por tramo en el Reel (avión para vuelos, barco para ferris) | Bajo · 0 € |
| Polarsteps **Travel Buddies** (hasta 10) | Varios suben fotos al mismo viaje | Viaje compartido: los amigos suben sus fotos y sale un solo vídeo/álbum | Alto · 0 € (Firestore) |
| Polarsteps **seguidores / ubicación en vivo con privacidad** | La familia sigue el viaje; ruta visible solo hasta la última parada | Ya tenemos compartir ubicación; añadir "seguir el viaje" con fotos | Medio |
| Polarsteps **Plus 29,99 €/año** con −20 % en libros | Modelo de negocio | Referencia para Premium: libro con descuento | Decisión de Paco |
| Travel Animator **arcos de vuelo** | Los vuelos dibujan una curva (círculo máximo), no una recta | Tramos de avión en curva en el Reel/Ruta | Bajo · 0 € |
| Travel Animator **globo 3D** que gira | Intro con la Tierra girando hasta el país | Intro "globo" para viajes largos/internacionales | Medio · 0 € (dibujado propio) |
| Travel Animator **importar GPX** | Animar la ruta exacta grabada en Strava/Garmin | Moteros y senderistas: subir el GPX y la moto va por su traza real | Bajo-medio · 0 € |
| Travel Animator **fondos croma / intros** | Vídeo del mapa sobre verde para montarlo en CapCut | Exportar "solo mapa" para creadores | Bajo · 0 € |
| Travel Animator **logo propio / sin marca de agua en Pro** | Monetización | Marca de agua en gratis, sin ella en Premium | Bajo · decisión de Paco |

### Vehículo por tramo y arcos de vuelo (29 sept 2026, subido) — Paco: "Adelante"
- Cada tramo del Reel tiene su transporte, puesto solo (`legMode`): **avión** si el tramo pasa de 700 km o cruza mucho
  mar (>35 % de puntos fuera de tierra) y es largo; **barco** si cruza mar y es corto (<350 km); si eliges "A pie", los
  tramos de más de 40 km van en coche; el resto, el vehículo elegido.
- Lista "Cada tramo con su transporte" bajo el selector de vehículo: se puede cambiar cualquiera (moto, coche,
  autocaravana, avión, barco, a pie).
- Vuelos en **arco curvo** (curva cuadrática abombada hacia arriba), línea discontinua; la cámara se aleja más y el
  avión "sube" (se agranda) a mitad del vuelo. Barco con línea punteada y dibujo propio. El contador de km lleva el
  icono del tramo.
- Probado con Madrid → Lisboa → Funchal → Porto Santo → Oporto: moto, avión, barco, avión (detectado solo).

### Exportar la guía a GPX (29 sept 2026, subido) — Paco: "Sí, adelante con exportar GPX"
- Botón **GPX** en la barra de acciones de la vista de itinerario (mapa-itinerario.js v84), junto a Compartir y Google
  Maps. Solo con la ruta entera (con cuenta; en el avance sin cuenta no sale, §10).
- El archivo lleva: cada parada como waypoint ("Día 2 · 3. Góis" + descripción), una `<rte>` con las paradas en orden
  (OsmAnd/Calimoto/Garmin la recalculan por carretera) y, si la guía sigue una carretera con nombre, su trazado real
  (`road_geometry.coords`) como `<trk>`. Se genera en el móvil: 0 €.
- Uso: abrirlo con OsmAnd, Organic Maps, Calimoto o Garmin, que tienen mapas sin internet.
- PROYECTO: mapas sin internet dentro de nuestra app = otro proyecto (OSM no permite descargas masivas; opciones:
  Protomaps/PMTiles en R2 o proveedor con licencia offline; coste de almacenamiento, avisar §8).
- Siguiente: importar GPX para el vídeo (la moto por tu traza real).

### Importar traza GPX (29 sept 2026, subido) — Paco: "si"
- Botón **📍 Traza GPX** junto a los de fotos. Lee `<trkpt>` (o `<rtept>`) con sus horas; se guarda en el móvil.
- **Fotos sin GPS → a su sitio por la hora**, cruzándola con la traza. Ajuste de hora automático (−3 h…+3 h en medias
  horas): gana el que mejor acierta las fotos con GPS o, si no hay, el que mete más fotos dentro de la traza (EXIF va
  en hora del móvil y el GPX en hora universal). Orden de prioridad: GPS de la foto > traza > guía.
- **Reel por la carretera real**: cada tramo sigue la traza entre sus dos paradas (si ambas están a <~2 km de ella);
  km reales; la lista de tramos marca "(traza)". El mapa interactivo dibuja la traza completa.
- **Nombres de sitio** para paradas sin nombre ("Parada N"): Nominatim (OpenStreetMap), gratis, 1 consulta/s,
  guardadas en el móvil ('geo'). Sin red se reintenta más tarde.
- Probado con una traza inventada Chaves→Faro (521 puntos, 9–10 sept) y 5 fotos reales sin GPS: las 5 colocadas, 494 km.

### Tu mundo (29 sept 2026, subido) — Paco: "si hazlo como dices"
- Página `tu-mundo.html` (noindex, con cuenta) + tarjeta "🌍 TU MUNDO · BETA" en Mis Viajes (app.js v204).
- Cuenta como **viajada** una guía con fotos (maps.photos, fotos con routeId o pins con foto y routeId). Fotos y pins
  con ubicación suman su país aunque no haya guía. Guías sin fotos → "Tus próximos destinos".
- Muestra: países y % del mundo (sobre 195), km (trazado real si la guía lo tiene, si no en línea recta), días, viajes,
  fotos; mapamundi (visitados naranja, planeados marrón; solo se pinta la parte del país cerca de donde estuviste);
  banderas y nombres en español (tabla ISO numérica→2 letras + Intl.DisplayNames); récords (norte, sur, más lejano
  de casa con botón de ubicación, viaje más largo, más km, más fotos, país favorito); viajes por años; tarjeta story
  1080×1920 para compartir.
- 💶 0 €: lecturas de Firestore mínimas (maps ≤200, fotos ≤800, pins ≤800 por visita) y cálculo en el móvil.

## ÍNDICE PARA EL ADMIN (29 sept 2026)
Todo lo de esta sesión está en `docs/casos-por-crear/2026-09-29-nube.json` como casos "En estudio", numerados:
00 resumen de lo hecho · 01 probar con fotos reales · 02–03 fallos · 04–20 pendientes por prioridad.
Crearlos (desde el portátil, con la llave de casos): `node scripts/casos.cjs crear docs/casos-por-crear/2026-09-29-nube.json`
