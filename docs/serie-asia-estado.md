# SERIE ASIA (Tailandia/Vietnam) — ESTADO PARA CUALQUIER SESIÓN NUEVA (11 oct 2026)
Leer este archivo + `docs/serie-publicacion.md` (programación TikTok/YouTube de SIN MAPA N2) + `docs/serie-asia-piloto.md` (guiones y datos verificados).

## Qué es
Serie documental con humor de ~20 capítulos, viaje real de Paco (ene-may 2026: Tailandia → Birmania/Laos solo frontera → Koh Samui → Vietnam en moto → vuelta), narrada por Salma (la persona real, hoy avatar de Borrado del Mapa; lo sabe y lo permite). Objetivo: seguidores y usuarios de la app. Cadena: SIN MAPA (N2 Portugal, sept 2026) viene DESPUÉS en el tiempo.
Reparto por capítulo: viaje 50% · útil 35% · Salma 15%. Pregunta de temporada: «¿quién es Salma?» (pistas pequeñas, respuesta en las islas, caps 11-13). App en 3 niveles: solo marca (~12) · en la trama (~5) · llamada a la acción (~3: caps 1, 10, 20; el 1 solo marca pequeña).
Decisiones de Paco: apuesta por el HUMOR; no chistes sexuales/étnicos/políticos; nombres reales permitidos (Juanillo, Reme, Salma); sin Nepal; Salma narra, Paco a veces (≤15 s); captura de app en formato móvil; la primera imagen NO sale Paco; Instagram en pausa (cuenta personal).
Biblia de voz y estructura de 70 s: ver `serie-asia-piloto.md` (v3).

## Estado
- CAPS. 1-4 HECHOS Y PROGRAMADOS (11 oct 2026): cabecera «BORRADO DEL MAPA», tarjeta final «Basado en un viaje real · Voz de Salma recreada con IA». Fechas, IDs y estado en `docs/serie-publicacion.md` §12 (TikTok + YouTube, 21-26 oct). Finales en `salma marketing/asia/finales/`. Cap. 3 lleva la escena de la app (grabación de Paco del Mae Hong Son Loop).
- Caso de la app abierto: p-mv42goveo1q (avisos de búsqueda pegados sin espacio y búsqueda de lugares que falla).
- Cap. 2 previsto «La frontera» (Laos solo frontera, 31 ene) y un capítulo aparte sobre las mujeres jirafa (Birmania, 6-7 feb).
- Clasificación GPS hecha: `D:\salma-movil\clasificacion-gps.csv` y `resumen-lugares.md` (4.506 de 6.129 con GPS). Nombres locales en escritura tailandesa/birmana/china: traducir.

## Cómo se monta (todo reproducible)
Herramientas copiadas en `salma marketing/asia/herramientas/` (terminan en `.txt` para subirlas a Drive; quitar `.txt`):
- `build_as.cjs` = generador (ffmpeg-static + ElevenLabs v3, voz fzAdMudUtRHNnk5tjJRR con clave en `api/salma voice.txt`, nunca imprimirla). Necesita carpeta de trabajo con `ff/node_modules/ffmpeg-static`, `ep1/f.ttf` y `ep1/avatar.png` (avatar de Salma). `node ep1/build_as.cjs ep1/cfg-asia4.json`.
- `cfg-asia4.json` = guion + qué foto/vídeo en cada frase; `sel.lst` = lista de material (`material-v4/` tiene las copias usadas, incl. la grabación de pantalla `APPREC.mp4` recortada del móvil de Paco).
- `clasificar-gps.cjs`, `seleccion-chiangmai.cjs`, `hojas-contacto.cjs` = clasificar por GPS y hojas de contactos para elegir fotos.
- OJO: cada render llama a ElevenLabs (~1.200 caracteres, plan Starter): decirlo a Paco (§8 coste). Y cada consulta a Salma para capturas cuesta céntimos.

## Reglas de trabajo con Paco (resumen)
Él no quiere perder tiempo en redes: lo hace Claude (Metricool id 6868156, TikTok/YouTube con su sesión de Chrome). Antes de crear algo nuevo: contar el plan y esperar su OK. Respuestas cortas. Datos históricos verificados con fuente; lo que cuenta Paco va como «dice él». Coste de APIs siempre se dice.

## Pendiente
1. Decidir qué hacer con los 5 vídeos SIN MAPA (N2) ya programados (13/14/15/16/19 oct 10:00 TikTok + YouTube Shorts) y cuándo sale el piloto de Asia.
2. Comentario manual con el enlace en cada TikTok al publicarse.
3. Guiones de los caps. 2-20 (esqueleto en `serie-asia-piloto.md`); verificar «hombros y rodillas tapados» y otros datos antes de grabar.
4. Paco quita el acceso público de la carpeta de Drive tras publicar.

## CAP. 5 «El techo de Tailandia» — en prueba de MODELOS DE EDICIÓN (12 oct 2026)
Guion aprobado por Paco (peluquería = «le gusta pelarse en todos los países que visita»; pista de Salma «se organiza muy bien, cosa que él no hace» de su carta 2; elefantes = santuario ético, hay que resaltar evitar paseos/espectáculos). 3 modelos del MISMO contenido y MISMA voz: `salma marketing/asia/cap5-modelos/` — A Cine suave (fundidos 0,4 s), B Ritmo (transiciones deslizantes, zooms), C Documental (fundidos a negro + rótulos de lugar/altitud). Ambiente = audio real de los vídeos del lugar, muy bajo y con ducking bajo la voz.
Generador nuevo `herramientas/build_ed.cjs.txt` (`node ep1/build_ed.cjs ep1/cfg-asia5.json A|B|C`): reutiliza la voz guardada (`ep1/voice/<voiceCache>.json+.mp3`, coste 0 al probar estilos; la voz se paga una sola vez, ~1.250 caracteres ElevenLabs).
Pendiente: que Paco elija modelo; entonces programar cap. 5 y, si quiere, re-editar caps. 1-4 con el modelo elegido.

## MONTADOR v2 (14 oct 2026) — todo lo acordado en un solo script
`salma marketing/asia/herramientas/build_v2.cjs.txt` + `cfg-asia5-v2.json.txt` → `node ep1/build_v2.cjs ep1/cfg-asia5-v2.json`. Salida de prueba: `cap5-v2/cap5-v2-todo-incluido.mp4` (97 s, -14,7 LUFS).
Edición: planos con peso (`foto*2`), fundidos y fundido a negro entre bloques, rótulos de lugar, cifras grandes animadas (`cifras`), subtítulos ASS con palabra iluminada y énfasis (`<palabra>` en el texto), mapa de ruta animado (`mapa`: puntos lat/lon, sin mapa base), tarjeta final «Basado en un viaje real».
Audio: pronunciación con campo `voz` (Kun Yuám, Doi Intanón, Vachiratán, Mé Hong Són…), pausas con intención (`pausaAntes`), ambiente real por escena (`amb`) con ducking, nivelación -14 LUFS. Sin música (decisión: por licencias). La voz se guarda con tiempos por letra en `ep1/voice/<voiceCache>.json+.mp3` y se reutiliza (coste 0 al retocar edición).
Estado de la serie: 4 caps. de Asia en BORRADOR en Metricool y N2 ep.3-5 en borrador; ocultar a mano N2 ep.1-2 (ver serie-publicacion §13).

## REGLAS DE CONTENIDO (Paco, 14 oct 2026) — aplicar a TODOS los capítulos, incluidos los caps. 1-4 al re-editarlos
1. Hablar poco de Paco: máximo 1-2 menciones por capítulo y con variantes («el Paco», «este Paco», «las cosas de Paco», «el motorista»…). Salma (la narradora) no se centra en él; solo aparece cuando aporta dato o humor.
2. Cada frase debe servir a quien quiera viajar o enseñar algo. Anécdotas sin información (p. ej. «le gusta pelarse») fuera.
3. Cada imagen debe ser de lo que se dice (nada de platos sueltos). Fotos personales (medicinas, etc.) fuera.
4. Elefantes: promover santuarios éticos (sin montar, sin espectáculos) y avisar de lo contrario.
## MÚSICA (14 oct 2026): Paco la quiere. Solución sin licencias ajenas: música ORIGINAL sintetizada (`herramientas/mkmusic.cjs.txt`: colchón de acordes en re menor + arpegio de cuerda pulsada, `musica/viaje1-original.mp3`), mezclada ~17 dB bajo la voz con ducking. Pega: es sintética y sencilla; si Paco quiere música «de verdad», habrá que elegir una pista con licencia comprobada (Pixabay con captura de licencia / de pago).
Cap. 5 v4 (83 s): `cap5-v2/cap5-v4-con-musica.mp4` (guion v4 sin peluquería, foto de ojo de elefante `mk31`, pista «a este Paco no se le da»).

## REEDICIÓN CAPS. 1-4 con plantilla v4 (15 oct 2026)
Hechos: `salma marketing/asia/caps-v4/cap{1..4}-*-v4.mp4` (87/87/76/98 s, -14,3 a -14,8 LUFS, con música original + ambiente + mapa animado + cifras + subtítulos con palabra iluminada). Guiones reescritos con las reglas (≤1-2 menciones a Paco, variadas: «este Paco», «el viajero», «el motorista»; fuera anécdotas sin dato; imágenes de lo dicho). Configs y generador: `herramientas/cfg-cap*-v4.json.txt`, `mkcaps-reedicion.cjs.txt`.
Cambios de contenido: cap.1 gancho sin nombre («un plano tan ordenado que cuesta perderse. Alguien lo consiguió»), app «Para eso estoy yo…» sin Paco; cap.2 fuera la cita «moto para arriba…»; cap.3 fuera la cita de las chanclas (ya está en la ficha: «calzado cerrado»); cap.4 «el viajero lo dijo claro…».
Voz gastada en esta tanda: ~4.270 caracteres (ElevenLabs, ~17.000/40.000 del mes).
Estado en redes (15 oct): N2 ep.1-2 publicados pero OCULTOS (TikTok «Solo yo», YouTube «Privado», ocultados por Claude con Chrome); resto de posts (N2 ep.3-5 y Asia 1-4) en BORRADOR en Metricool con los vídeos viejos: al reactivar hay que SUSTITUIR el vídeo por los de `caps-v4/` (subir a Drive ligero + nuevo post).
Pendiente de Paco: Muay Thai (capítulo específico) y Vietnam completo «para hacerlos chulísimos»: se piensan después.

## MUAY THAI (15 oct 2026) — capítulo específico en preparación (metodología paso 1-3)
Ganchos prototipo: `salma marketing/muay-thai/ganchos/` (sumario rápido / pregunta / cuenta de 8). Hojas de contacto numeradas M01-M116 (solo Muay Thai): `salma marketing/muay-thai/hojas-contacto/` + `indice-muay-thai.csv`. Fotos Canon de la velada de Samui (8 abr 2026, fecha por EXIF; los archivos dicen 1 mayo = fecha de copia): backdrop «Phetch Buncha 2025» (Chang); luchadora alemana «Linda» (nombre por confirmar) con su equipo. NO usar los `file_*.png` (retoques de ChatGPT). Sin niños en primer plano. Pendiente de Paco: quién es Linda y permiso, dónde fue, más material de la Canon, qué fotos elige (por número M..).

## MUAY THAI — actualización 15 oct 2026 (tarde)
Luchadora: **Lina** (alemana, profesional, conoce el Wai Khru; instagram lina.srk; la conoció en Samui en el gimnasio «Fas Muay Thai Gym»). Paco tiene PERMISOS de Lina y del equipo para usar las fotos (dicho por Paco). Velada: estadio Phetchbuncha (Chaweng, Samui), miércoles 8 abr 2026.
Hilo nuevo: muchos luchadores de fuera repiten el Wai Khru sin saber qué significa (observación de Paco: decirla como suya); Lina SÍ lo sabe (es la contraria). Idea: que Lina grabe 20-30 s explicándolo con sus palabras.
Fotos: 10 Canon en `D:\salma-movil\Pictures\Canon EOS RP` + 34 de Drive en `D:\salma-movil\camara-canon\drive` (1620x1080, copias reducidas). Los originales están en la tarjeta de la Canon (Paco los subirá a `D:\salma-movil\camara-canon`). Hojas M01-M150 en `salma marketing/muay-thai/hojas-contacto/`.
Ganchos v2 (voz + fotos de Lina + música estilo Muay Thai sintetizada + campana): `salma marketing/muay-thai/ganchos-v2/`. Música original: `herramientas/mkmusic_muaythai.cjs.txt`.

## MUAY THAI — gancho A3 y sonido (15 oct 2026, noche)
Fotos que Paco elige como las mejores (Drive de Lina, copias 1620x1080): M131, M132, M133, M137, M138, M141, M142, M143, M147, M148, M150 (IMG_4060, 4063, 4069, 4212, 4218, 4231, 4233, 4236, 4253, 4265, 4269). M141-M145 = el Wai Khru de Lina en el ring (arrodillada, manos, ram muay); M147-M150 = la pelea (patada alta).
Gancho A3 (cuenta atrás + recortes a la cara + sacudida/destello + boom/whooshes sintéticos): `ganchos-v2/gancho-A3-impacto.mp4`. Paco pide intros IMPACTANTES (referencia: plantillas Canva de Reels: tipografía grande, cuenta atrás, collage, textura de película).
ElevenLabs Sound Effects: la clave API actual NO tiene el permiso `sound_generation` (401). Paco debe activarlo en la clave (Developers → API keys → editar) o generar en la web. Plan Starter según su web: uso comercial, ~150 generaciones/mes, clips ≤30 s. Música «Muay Thai de verdad»: pendiente (Pixabay candidatos: thai-thailand-indonesian-music-469481, asian-asia-thailand-music-394820, bangkok-heat-448479; o Eleven Music si el plan lo incluye).

## ELEVENLABS: SFX y MÚSICA FUNCIONAN (15 oct 2026, noche)
Paco amplió los permisos de la clave «voz de Salma». Probado: `POST /v1/sound-generation` (efectos: boom, whoosh, patada, gong) y `POST /v1/music` (12 s «Muay Thai sarama»). Coste medido: 4 efectos + 12 s de música ≈ 220 créditos en total (uso 13.716 → 13.935 de 40.000, plan Starter). Scripts: `herramientas/elevenlabs-sfx.cjs.txt`, `elevenlabs-musica.cjs.txt`. Salida en `salma marketing/muay-thai/sonidos/`. Gancho con ellos: `ganchos-v2/gancho-A4-sfx-reales.mp4`. Pendiente: que Paco escuche y diga si la música suena a Muay Thai; entonces generar la pista larga y la biblioteca de efectos de la serie (impactos, whooshes, multitud, gong).

## MUAY THAI — vídeo completo v2 (15 oct 2026, noche)
`salma marketing/muay-thai/capitulo/muaythai-completo-v2.mp4` (95 s): gancho A4 (cuenta atrás + SFX ElevenLabs) + cuerpo de 90 s. Guion: Wai Khru = «saludo al maestro» (vuelta al ring rezando en cada esquina, inclinarse en el centro, honrar maestros/padres/antepasados), Ram Muay (danza propia de cada gimnasio), observación de Paco (muchos de fuera lo repiten sin saber qué significa; Lina sí lo sabe), pelea, ficha útil (Phetchbuncha: lunes/miércoles/sábado desde las 21:00 según guías; entradas 1.500-2.500 THB según UNA guía, comprobar), cierre «Una semana después, Vietnam».
Música: audio EN VIVO del estadio (vídeo M130 de Chiang Mai, desde 0:38, `c13/musica-en-vivo-m130.wav`), a -30 LUFS bajo la voz («no abusar»). Fotos: Drive de Lina, recortes a cara/acción (builder v2 ahora admite `IMG@cx,cy,h`). Voz: 1.060 caracteres (hecha).
Pendiente: opinión de Paco; recortar si es largo; originales de la Canon; posible clip de Lina explicando el Wai Khru.

## MUAY THAI v4 (15 oct 2026, noche) — correcciones de Paco aplicadas
`salma marketing/muay-thai/capitulo/muaythai-completo-v4.mp4` (105 s). Cambios: fuera «lo curioso / muchos luchadores de fuera» (en cuerpo y ficha); fuera «según las guías» (NOSOTROS somos la guía: no atribuir a guías; evitar datos dudosos en lugar de hedgearlos: quitado el precio de entradas); fuera «aprende qué significa tu Wai Khru» → cierre de la ficha: «Respeta el deporte. Aprende su historia.»; AÑADIDA LA HISTORIA (arte de guerra de los soldados del antiguo Siam, manos vendadas con cuerda, sin guantes ni asaltos, la leyenda de Nai Khanom Tom en 1767, reglas en los años 30: guantes, asaltos y árbitro; fuentes en serie-asia-fuentes.md); DEDICATORIA final narrada: «Este vídeo es para Lola, para cuando vayamos a Tailandia a pelear» (antes de la tarjeta final); SUBTÍTULOS EN INGLÉS pequeños debajo (campo `en` por frase, builder v2). Reglas nuevas de Paco: voz de autoridad, sin «según guías»; Lola = destinataria del vídeo (no sabemos más).

## MUAY THAI v5 (15 oct 2026): rehecho con gramática de escalas + looks Kodak
`salma marketing/muay-thai/capitulo/muaythai-completo-v5.mp4` (105 s): 30 imágenes distintas (sin repetir), escalas GP 7/PM 12/PP 5/D 6, vídeos de Chiang Mai en la historia (B/N Tri-X), Portra en retrato/cierre, Vision3 en el ring. Misma voz (coste 0). Pendiente: opinión de Paco; originales de la Canon (los detalles se recortan de fotos 1620x1080); recortar a ~85 s; programar.
