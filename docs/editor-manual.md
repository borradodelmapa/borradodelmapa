# EDITOR DE VÍDEO «BORRADO DEL MAPA» — MANUAL (15 oct 2026)
Todo vive en **`salma marketing/editor/`** (copia completa, autónoma). Generador: `ep1/build_v2.cjs` (Node + ffmpeg). Un vídeo = un `cfg-*.json`. La voz se guarda (caché) → **retocar edición cuesta 0 €**; cambiar un texto vuelve a generar TODA la voz del capítulo (~1.000-1.200 caracteres de ElevenLabs).

## Puesta en marcha (una vez)
En `salma marketing/editor/`: `npm i ffmpeg-static --prefix ff` (crea `ff/node_modules/ffmpeg-static/ffmpeg.exe`). La clave de ElevenLabs se lee de `C:\Users\User\Desktop\salma\api\salma voice.txt` (nunca imprimirla). Material de fotos/vídeos: `D:\salma-movil` (índices por GPS/EXIF en `listas/origen/*.lst`; las listas `listas/*.lst` mapean id → archivo copiado: hay que volver a copiar los archivos con los scripts `mk*.cjs` si se rehace un capítulo antiguo).
Uso: `node ep1/build_v2.cjs proyectos/muay-thai/cfg-muaythai4.json` → `ep1/out/<id>.mp4`. Concatenar gancho + cuerpo con el `concat` de ffmpeg (ver historial: `muaythai-completo-v4`). Versión ligera para Drive/Metricool: 720p, 600 kb/s (ver `docs/serie-publicacion.md`).

## Campos del cfg
- Cabecera: `id`, `voiceCache` (nombre de la voz guardada en `ep1/voice/`), `series`, `ep`, `noTitle` (true si hay gancho delante), `counter` (etiqueta arriba a la derecha), `next1/next2` + `cardSecs` (tarjeta final «Basado en un viaje real · Voz de Salma recreada con IA»), `base` (carpeta de fotos) + `lists` ({A:'lista.lst'}).
- `sentences[]` (cada una = una frase de voz): `text` (subtítulo; `<palabra>` = énfasis), `voz` (cómo se pronuncia: Kru, Pétch…; MISMO nº de palabras), `assets`, `amb` (vídeo del que sacar ambiente), `pausaAntes` (silencio dramático, s), `en` (subtítulo en inglés, pequeño, sincronizado).
- `assets` (cada plano): `AIMG_4048` = foto; `*2` = dura el doble; `@cx,cy,h` = recorte vertical enfocado (centro y alto como fracción de la foto; ¡el que da fuerza a las fotos horizontales!); `~x,y,w,h` = desenfocar una zona (matrículas, niños). Vídeos `.mp4` también.
- Extras: `badges` (FICHA ÚTIL), `captions` (rótulos de lugar), `cifras` (número grande animado: `text`, `sub`, `sentence`, `word`, `dur`), `mapa` (ruta animada: `points` lat/lon, `bbox` cuadrado, `afterWord`), `music` + `musicLUFS` (-30 a -34: bajo la voz con ducking), `bedLUFS`.
- Audio automático: voz procesada + ambiente real por escena (ping-pong, sin bucle) + música + sidechain + -14 LUFS. Sin `amb` pero con `music` → cama de música continua.
- Avisos: imprime «IMÁGENES REPETIDAS»: **regla de Paco: no repetir imágenes** (usar más fotos o más recortes distintos de la misma).

## Ganchos (`ganchos/hookA5.cjs`)
5 s con foto-recortes a la cara, cuenta atrás, sacudida/destello, voz desde el fotograma 0, SFX reales y subtítulos EN. SFX y música se generan con ElevenLabs (`ganchos/sfx.cjs`, `music.cjs`, `music2.cjs`: clave con permisos sound_generation y music; ~220 créditos por pruebas). Música «Muay Thai»: la IA no acertó; se usó **audio en vivo del estadio** (`ep1/music/musica-en-vivo-m130.wav`).

## Reglas de contenido (Paco)
Poco Paco y variado · cada frase aporta · cada imagen es de lo que se dice y NO se repite · autoridad: «nosotros somos la guía» (no «según las guías»; quitar el dato dudoso antes que matizarlo) · historia y respeto al deporte/cultura · datos con fuente en `docs/serie-asia-fuentes.md` · permisos de personas confirmados por Paco · sin niños en primer plano.

## Limitaciones conocidas
Fotos de Lina = copias 1620×1080 (originales en la tarjeta de la Canon: pendientes) · el montaje no «oye» (se mide, no se escucha: Paco juzga el sonido) · cada render tarda 2-4 min · los `cfg` de Asia apuntan a carpetas de material temporales (rehacer con `proyectos/asia/mkcaps.cjs`).

## ACTUALIZACIÓN 15 oct 2026 (noche): escalas y looks
- Etiqueta de escala en cada plano: `#GP` general · `#PM` medio · `#PP` primer plano · `#D` detalle (p. ej. `AIMG_4238@.5,.5,.7#PM`). Sin `*peso` explícito, la duración sale de la escala (GP 1,5 · PM 1,0 · PP 0,8 · D 0,6). El editor avisa de «⚠ RITMO» (misma escala seguida dentro de una frase, 3 detalles seguidos) y cuenta las escalas usadas.
- Look Kodak: `look` global en el cfg y/o por frase (`"look":"trix"`): `portra` (día/piel), `vision3` (noche, halación roja sutil), `trix` (B/N, para historia/leyendas). Grano y viñeta animados por plano. Estilo completo en `docs/estilo-visual.md`.
- Vídeos como planos: `AV129@.5,.55,.95#GP` (lista con id `V129`). Material mixto en una lista con `base:"D:/salma-movil"`.
- Especial Muay Thai v5 (`proyectos/muay-thai/cfg-muaythai5.json`): 30 planos, 30 imágenes distintas, escalas GP 7 · PM 12 · PP 5 · D 6, historia en Tri-X.
