# EVOLUCIÓN DEL EDITOR Y DE LOS VÍDEOS (11-15 oct 2026)
Registro de cómo ha ido cambiando el montaje y por qué (guiado por el feedback de Paco). Versiones de vídeo archivadas en `salma marketing/` (asia/, caps-v4/, muay-thai/versiones/); versiones del código en `salma marketing/editor/historial/builder/`.

## Línea de tiempo del editor
1. **11 oct · `build_el` / `build_as`** (primer generador): frases con fotos fijas, cortes secos, subtítulos por frase (drawtext), avatar de Salma, voz ElevenLabs v3 en UNA llamada con tiempos por letra (antes Google TTS y frase a frase: sonaba entrecortado), tarjeta final con «Basado en un viaje real · Voz de Salma recreada con IA», cabecera «BORRADO DEL MAPA».
2. **12 oct · `build_ed` (modelos A cine suave / B ritmo / C documental):** transiciones xfade (fundido, deslizamiento, fundido a negro), ambiente real de los vídeos bajo la voz con ducking, nivelación -14 LUFS, caché de voz (retocar edición cuesta 0 €).
3. **14 oct · `build_v2`:** planos con peso (`foto*2`), subtítulos ASS con palabra iluminada y énfasis (`<palabra>`), cifras grandes animadas, mapa de ruta animado, rótulos de lugar, pausas dramáticas (`pausaAntes`), pronunciación (`voz`), ambiente por escena sin bucle (ping-pong), música con ducking, `noTitle` (cuando hay gancho), tarjeta final.
4. **15 oct · `build_v2` (noche):** subtítulos en inglés pequeños (`en`), recortes enfocados (`@cx,cy,h`), vídeos como planos, aviso de imágenes repetidas, **etiquetas de escala** (`#GP #PM #PP #D`) con duración por escala y avisos de ritmo, **looks Kodak** (`portra`, `vision3`, `trix`) por frase.
5. **Ganchos:** v1 (carrusel con texto; «flojo»), v2 (fotos de Lina + voz + música; «sin dinamismo»), A3 (recortes a la cara, sacudida y destello, boom/whoosh), A4 (SFX reales de ElevenLabs), A5 (subtítulos EN).
6. **Sonido:** música sintética «viaje» (original, sin derechos) → música sintética «Muay Thai» (no convenció) → música IA de ElevenLabs (no convenció: «no es Muay Thai») → **audio EN VIVO del estadio** grabado por Paco (elegido: vídeo M130 desde 0:38, bajo la voz, «no abusar»). SFX y música por API requieren permisos en la clave (ampliados por Paco).

## Evolución de las decisiones de contenido (reglas de Paco)
- Poco Paco y variado; cada frase aporta; cada imagen es de lo que se dice y NO se repite; quitar anécdotas sin valor (la peluquería).
- Voz de autoridad: «nosotros somos la guía» (nada de «según las guías»; se quita el dato dudoso en vez de matizarlo); respeto a culturas y deportes; historia siempre presente.
- Subtítulos EN pequeños; dedicatorias narradas (Lola); permisos de personas los confirma Paco.
- Hooks: impacto desde el fotograma 0, voz inmediata, pregunta/tensión, fotos humanas a pantalla completa, SFX.
- Estilo: gramática de escalas + look Kodak (`docs/estilo-visual.md`).

## Versiones de vídeo
- **Asia piloto (Chiang Mai):** v1 (carta/humor) → v2 (captura app) → v3 (guion B + captura móvil) → v4 (apertura sin Paco) → v5 («Basado en un viaje real», cabecera BORRADO DEL MAPA) → caps. 1-4 reeditados **v4** (música, ambiente, mapa, cifras, EN; programados 21-26 oct).
- **Cap. 5 «El techo de Tailandia»:** modelos A/B/C → v2 (todo incluido) → v3 (ambiente sin bucle) → v4 (sin peluquería + música + elefante).
- **Especial Muay Thai:** gancho A..A5; `muaythai-completo` v1 (primer cuerpo) → v2 (recortes enfocados) → v3 (historia, sin «según las guías») → v4 (dedicatoria a Lola + subtítulos EN) → **v5 (escalas + Kodak + 30 imágenes distintas)**.

## Qué aprendimos (para no repetir)
Fotos horizontales con barras difuminadas se ven pequeñas: recortar vertical a la cara o la acción · las copias reducidas (1620×1080) limitan los detalles: pedir originales · la música IA no acierta géneros muy específicos: usar audio real · cambiar un texto vuelve a pagar toda la voz del capítulo · no repetir imágenes (el editor avisa) · cortar por significado, no por reloj · mi conexión a internet puede caer unos minutos (reintentar).
