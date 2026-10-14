# AUDIOVISUAL — ÍNDICE PARA CUALQUIER CHAT NUEVO (12 oct 2026)
Todo lo de vídeo/redes de Borrado del Mapa. Leer primero este archivo; el detalle está en los enlazados.

## Qué existe (hecho)
- **Serie SIN MAPA (N2 Portugal-España, sept 2026), 5 episodios** con la voz real de Salma (ElevenLabs): programados en TikTok + YouTube Shorts del 13 al 19 oct 10:00. → `docs/serie-publicacion.md` §§8-11, `docs/serie-en-moto.md`.
- **Serie BORRADO DEL MAPA (Asia, viaje ene-may 2026), caps. 1-4 hechos y programados** 21-26 oct (TikTok + YouTube). Cap. 5 con 3 modelos de edición (A cine suave · B ritmo · C documental) a la espera de que Paco elija. → `docs/serie-asia-estado.md` (estado y herramientas), `docs/serie-asia-piloto.md` (biblia de voz, guiones, datos verificados con fuente), `docs/serie-publicacion.md` §12.
- **Canales:** TikTok (cuenta renombrada, Business pendiente), YouTube «Borrado del mapa · YouTube» (canal UCZmd6Sq3aJeCELqPN8w-LTw, banner y logo de Salma), Metricool (marca 6868156, plan Free 20 pub./mes). Instagram en pausa (cuenta personal de Paco).
- **Material:** `D:\salma-movil` (6.129 fotos/vídeos del móvil de Paco, 69 GB; INDICE.md, clasificacion-gps.csv, resumen-lugares.md); carpeta `salma marketing/` (finales, ligeras, herramientas, modelos) y su copia en Google Drive «salma marketing».
- **Plan de contenidos / ideas:** `docs/plan-contenidos.md`, `docs/estudio-video-album.md`.

## Cómo se produce (pipeline)
Guion (datos verificados) → voz ElevenLabs v3 de Salma (una sola llamada, con tiempos por frase; se guarda para reutilizarla) → selección de fotos/vídeos por GPS con hojas de contacto → montaje ffmpeg 1080x1920 (subtítulos por frase, avatar de Salma, tarjeta final «Basado en un viaje real · Voz de Salma recreada con IA») → versión ligera 720p (~7 MB) → Drive → Metricool por API (`createScheduledPost`: `blogId`, `date` con offset, `info`). Herramientas en `salma marketing/asia/herramientas/` (`build_ed.cjs.txt` = generador con modelos de edición y ambiente).

## Reglas ya decididas por Paco
Humor sí (nunca sexual/étnico/político); Salma narra, Paco ≤15 s; primera imagen sin Paco; cabecera «BORRADO DEL MAPA»; app en la trama solo en algunos capítulos; datos históricos verificados («según algunas fuentes» si hay una sola); decir siempre «basado en viaje real» y etiqueta de IA; capturas de la app en formato móvil; coste de APIs (ElevenLabs, Salma) siempre se avisa. Memoria: `project_serie_asia.md`.

## Pendiente
Elegir modelo de edición (cap. 5) y decidir si se re-editan caps. 1-4; programar cap. 5+; comentario manual con la web en cada TikTok; quitar acceso público de la carpeta de Drive tras publicar; Instagram (decide Paco); caso de la app p-mv42goveo1q (avisos de búsqueda y respuestas largas).

## ACTUALIZACIÓN 15 oct 2026 (noche)
- **Editor consolidado:** `salma marketing/editor/` + manual `docs/editor-manual.md` (builder v2 con recortes enfocados, cifras, mapa, música/ambiente, subtítulos EN, aviso de imágenes repetidas).
- **Serie Asia:** caps. 1-4 reeditados (v4) y PROGRAMADOS en TikTok+YouTube (21-26 oct); N2 ep.1-2 ocultos, ep.3-5 en borrador (`docs/serie-publicacion.md` §§13-14).
- **Especial Muay Thai** (Lina, Samui): `salma marketing/muay-thai/capitulo/muaythai-completo-v4.mp4` (105 s, dedicatoria a Lola, subtítulos EN). Pendiente: menos imágenes repetidas (19 distintas de 25 planos), originales de la Canon, posible clip de Lina, recortar a ~85 s, programar.
- **ElevenLabs:** la clave ya genera SFX y música (permisos ampliados por Paco); voz usada ~19.000/40.000 este mes.
- **Evolución y versiones archivadas:** `docs/evolucion-editor.md` (línea de tiempo del editor, decisiones, lecciones) · `salma marketing/editor/historial/` (código por fechas, ganchos v1) · `salma marketing/muay-thai/versiones/` (todas las versiones del especial y de los ganchos).
