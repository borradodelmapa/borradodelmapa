# VÍDEO Y SERIES DOCUMENTALES — reglas, voces y flujo (26 oct 2026)
> **Desde el 30 oct 2026 la fuente única es `docs/video-checklist.md` (versionada, con IDs). Este archivo queda como detalle; si choca con ella, gana la checklist.**
Resumen único para **cualquier sesión que trabaje con vídeos** (India, monos, Asia, Muay Thai…). Decidido con Paco; el detalle está en los archivos enlazados. Si algo choca con una orden nueva de Paco, manda Paco y se actualiza este archivo.

## 1. Voces (no cambiar sin orden de Paco) — `salma marketing/india/motor/voces.cjs`
- **Paco:** clon profesional `QvZ9BlG7IjYGLz1ERM6t` («PACO PROFESIONAL BORRADODELMAPA»), modelo `eleven_v4`, estabilidad 0 (creativa), similitud 1, `clone_strength` 1.
- **Salma:** `fzAdMudUtRHNnk5tjJRR` («salma voice»), `eleven_v4`, estabilidad 1 (robusta), similitud 1, `language_code: es`.
- Pronunciación: el clon dice la «ll» como argentino → campo `voz` del bloque con «caye», «Yegué» (el subtítulo sigue escrito bien).
- Las voces generadas se guardan en `motor/voz/` por hash (texto+voz+ajustes): **no cambiar la fórmula del hash** (regeneró 1.010 créditos por error el 26 oct). Plan ElevenLabs: Creator, 122.352 créditos/periodo.

## 2. Flujo de un vídeo (quién hace qué)
1. **Paco cuenta los recuerdos**, sueltos y hablados. No se inventa nada que no haya contado.
2. **Claude escribe el guion de dirección** por escena (emoción, qué debe sentir, imagen concreta, cuándo entra Paco, cuándo Salma, cuándo nadie habla, sonido dominante, IA sí/no) y Paco aprueba. Plantilla: `docs/india-cap4-guion-direccion.md` y Biblia v2.5 (docs/biblia-documental-v2.docx), secciones 21-22.
3. **Datos con fuente** (varias fuentes se dicen; una sola «según algunas fuentes»; si discrepan, no se dicen). Registro: `docs/india-notas-y-fuentes.md`.
4. **Voces** (coste dicho antes; probar una frase primero).
5. **Paco elige**: una foto protagonista por escena del banco por temas (`salma marketing/india/banco-benares/`) y los audios oyendo candidatos de igual volumen.
6. **Claude monta** con el motor y entrega vídeo + informe de reglas + hoja de planos (`motor/hoja.cjs`).
7. **Paco corrige** (por escena/número) y se remonta. Último retoque a mano, si quiere, en CapCut en el móvil.
8. **Publicar:** textos y hashtags; **marcar «contenido generado con IA» en las opciones de cada red** (no va en pantalla: decisión de Paco).

## 3. Reglas de montaje (el motor las comprueba: `motor/reglas.cjs`)
- **Gancho** en los primeros 5 s. Estructura: recuerdo → pregunta → contexto → emoción → reflexión; nunca «imagen bonita → imagen bonita → dato».
- **Escalas GP/PM/PP/D:** presentar GP→PM→PP→D, cerrar al revés; no repetir escala seguida (salvo plano sostenido justificado `ok:`); máx. 2 detalles seguidos. Duración: GP 3-4 s · PM 2-3 · PP 1,5-2 · D 0,8-1,5 (avisa si GP<2, PM<1,2, PP<1, D<0,6 o GP>8, PM/PP>5, D>2,5). Se corta cuando la voz cambia de idea, no por reloj.
- **Cada imagen ilustra lo que se dice** y nunca lo contradice. **Ninguna foto ni clip repetido** en un capítulo (hay cientos).
- **Zoom/empuje lo pone el montaje** (ffmpeg, hacia un destino), nunca Runway. Runway solo movimiento interno (humo, agua) con cámara fija, 5 s, ~25 créditos por clip.
- **Look Kodak:** Portra (día) · Vision3 (noche/interior) · Tri-X B/N (historia/recuerdo) + normalización «BDM Film» de cada foto (luma 105, saturación 46).
- **Duración:** preferible **60-90 s**, pero **si la historia lo pide, más sin problema** (regla de Paco, 26 oct).
- Mapa de ruta animado con frontera real (`motor/mapa.cjs`), rótulo «BORRADO DEL MAPA · … · CAP. n», subtítulos con palabra iluminada, cifras grandes, fundidos a negro entre escenas, tarjeta final «Basado en un viaje real» + capítulo siguiente. Inglés: pista .srt aparte.

## 4. Reglas de sonido
- **De noche, silencio total** (`silencio: true`, ningún ambiente).
- Voces niveladas entre sí (Paco −21 dB medio, Salma −25), respiro **0,85 s + 0,45 s** al cambiar de hablante (0,4 s si es el mismo), mezcla final −14 LUFS.
- **Ambiente = sonido real de sus vídeos** y comprobado: antes de usar un clip, mirar su espectro (un motor = rayas graves fijas). V41 descartado (motor). Agua = Ganges real V33. Sonidos creados con IA salen casi mudos: nivelar antes de juzgar. Paco elige el ambiente oyendo candidatos.

## 5. Texto y voz
- **Paco hablado, no escrito** (muletillas suyas, pausas, frases cortas, humor seco, palabras gruesas solo donde pega). **Salma: UN dato potente por intervención** y silencio después. Escenas: Paco abre emoción → Salma enriquece → el montaje remata. Frases gruesas sin condescender; los hechos los dice Salma con fuente, el juicio duro lo dice Paco como opinión.

## 6. Cuidados
- **Costes (CLAUDE.md §8):** decir siempre antes cuánto cuesta ElevenLabs/Runway; probar con una frase.
- **Privacidad:** de Google Fotos solo se extraen archivos de cámara; WhatsApp y capturas no se extraen ni se abren. No usar recibos ni datos personales. Sin primeros planos de niños ni crematorios con cuerpos. No identificar personas por la cara.
- No afirmar que un clip suena a algo sin comprobarlo; no decir «arreglado» sin que Paco lo vea/oiga.

## 7. Dónde está todo (India, cap. 4)
`salma marketing/india/`: `motor/` (motor.cjs, reglas.cjs, voces.cjs, mapa.cjs, hoja.cjs, cap4.cjs = ejemplo de configuración; `node cap4.cjs` monta) · `banco-benares/` · `hoja-planos/` · `audios-candidatos/` · `videos-2019/` · `fotos-movil-2019/` · `runway-pruebas/` · salida en `animatica-cap4/`. Un capítulo nuevo = un `capN.cjs`. Notas, fuentes y decisiones: `docs/india-notas-y-fuentes.md`; guiones: `docs/india-guiones-grabar.md`, `docs/india-cap4-guion-direccion.md`; estilo: `docs/estilo-visual.md`, `docs/estilo-fotografico.md`. Herramientas y reglas de la serie Asia: `docs/serie-asia-estado.md`.

## 8. Editor local (cap. 4)
`salma marketing/india/abrir-editor.bat` (o `node motor/editor/server.cjs` y http://localhost:8095): escenas con sus planos, «cambiar» foto desde la galeria, ambiente con escucha, boton Montar y ver. Guarda en `motor/editor/overrides.json`; el montaje sale como `...-v8-editor.mp4` sin tocar el v8. Solo en el portatil, nada sale del PC, 0 euros (no genera voz si no cambia el texto).

## 9. Elementos por defecto de cada vídeo (27 oct 2026, todos automáticos; el editor los muestra colapsados)
- **Portada** (modelo Tailandia, `motor/portada.cjs`): foto en color + banda naranja inclinada (título negro, frase blanca) + franja negra con «BORRADO DEL MAPA · SERIE n/N». Va como primer fotograma (0,2 s). Se elige foto, textos y encuadre en el panel «Portada» del editor.
- **Ken Burns** en las fotos: más movimiento en GP que en D (`cfg.kb` = 1,6), entrar/salir alternados; por foto se retoca tipo, fuerza y punto de enfoque en «⚙ Movimiento».
- **Aviso de seguir** (hacia el segundo 30, 5,5 s): franja naranja diagonal con tira negra, cruza la pantalla; el icono de Salma se cambia por un corazón que late mientras dura y luego vuelve. Texto y segundo en «⚙ Ajustes del vídeo».
- **Cierre en dos tiempos** (8 s): título de la serie + «Basado en un viaje real»; luego icono de Salma, «CREA TUS RUTAS CONMIGO», «Descarga la app de guías de viaje · Gratis», borradodelmapa.com y «CAPÍTULO SIGUIENTE».
- **Portada IGUAL y vídeo IGUAL en el blog y en TODAS las redes (Paco, 28 oct 2026).** La portada del capítulo (la de la banda naranja, `blog/viajes/img/<slug>.jpg`) es la miniatura en YouTube, TikTok y cualquier red que se abra: nunca un fotograma cualquiera. El vídeo es el mismo archivo en todas partes (`blog/viajes/video/<slug>.mp4` = la ligera subida a Metricool, mismo tamaño en bytes); si se cambia en un sitio, se cambia en todos. Cómo: al programar en Metricool, `videoThumbnailUrl` = `https://borradodelmapa.com/blog/viajes/img/<slug>.jpg` (YouTube sí lo acepta en Shorts: canal verificado). Ya publicado: YouTube Studio → vídeo → Miniatura → «Subir archivo» → Guardar. Los avances (teasers) llevan portada PROPIA, nunca la del capítulo (Paco, 28 oct: en el canal parecían vídeos repetidos): mismo diseño con su cifra y «AVANCE» (`salma marketing/portadas/definitivas/avance-*.jpg`). Antes de dar un capítulo por publicado, comparar la pestaña Shorts del canal con la fila de la serie en el blog. Hecho el 28 oct: Tailandia 1-5 + avances «762 curvas» y «El punto más alto» con portada propia (Studio) · Muay Thai y Vietnam 1-5 (Metricool, YouTube y TikTok; en TikTok Metricool solo la aplica si la cuenta es Business: comprobar al publicarse el 2 nov). Pendiente: los TikTok ya publicados y los avances de café de huevo/bún chả, que no tienen portada en el blog.
- **Un solo editor** para todas las series (`motor/editor/`, accesos directos «India - Editores» y «India - Videos terminados»); cada montaje se guarda con fecha en `VIDEOS-TERMINADOS/`.

## 10. Clips de IA (Runway) y trabajo con varios capítulos — lo aprendido el 29 oct 2026
- **Modelos:** con la misma clave de Runway hay más modelos que Gen-4 Turbo (Kling 3.0, Veo 3.1, Seedance 2.x, Gen-4.5…; tabla de créditos en docs.dev.runwayml.com/guides/pricing, 1 crédito = 0,01 $). Para un ataque de animal a cámara, Gen-4 Turbo falló y **Kling 3.0 Pro** (60 créditos/5 s sin audio) funcionó. Prompt: lo que pida Paco, tal cual y sin añadir nada.
- **Concurrencia: 1 vídeo a la vez** (modelo gen4_turbo). Lanzar varios a la vez deja tareas en `THROTTLED`. **Guardar siempre el id de cada tarea** (`runway-pruebas/runway-tareas.log`); `DELETE /v1/tasks/<id>` cancela y devuelve los créditos.
- **Coste:** decirlo ANTES de cada generación (CLAUDE.md §8). Clips de 2 s = 10 créditos.
- **Clips cortos en un plano largo:** el motor los repite de ida y vuelta (RW…), no los congela. Ids de los clips generados: `RW9001+` en `motor.cjs` (marcar como IA al publicar).
- **Un editor, un puerto por capítulo:** cap4 :8095, monos :8096, cap3 :8097 (`node editor/server.cjs <capN>`; acceso «India - Editores»). Cada montaje se guarda en `VIDEOS-TERMINADOS` y el anterior del mismo capítulo pasa a `ANTIGUOS`. La portada va también como carátula del archivo.
- **Nunca renombrar sobre un vídeo abierto en el editor** (Windows lo bloquea): se copia encima.
- **Salma:** solo datos relevantes con fuente (nada de frases de relleno ni cierres poéticos); Paco: sus textos tal cual, sin añadir recuerdos que no ha dicho.

## 11. PUBLICAR: título, descripción, hashtags y subtítulos — SIEMPRE, en todo vídeo nuevo Y en los ya publicados (Paco, 29 oct 2026)
Regla fija: **ningún vídeo se da por publicado sin su paquete de texto**, y los vídeos que ya estaban publicados se **actualizan** con él (Paco: «tendríamos que actualizarlos todos… se ha de hacer siempre»).
- **Paquete por vídeo y por red** (listo para pegar; lo prepara Claude y lo aprueba Paco; cuesta 0 €): título con la búsqueda real al principio · descripción (las 2 primeras líneas lo importante + enlace a borradodelmapa.com + los **datos de viaje con fuente** que no van en la voz: visado, fechas, cómo llegar, con «consulta la web oficial» y la fecha) · 3 hashtags (YouTube) / 3-5 (TikTok, Instagram) · subtítulos `.srt` del motor subidos en YouTube · lista de reproducción de la serie · primer comentario fijado con la llamada a la app.
- **Marca «generado con IA»** en las opciones de la red cuando el vídeo lleve clips de Runway/Kling/Veo o voz sintética (YouTube: «contenido alterado o sintético»; TikTok e Instagram: su etiqueta de IA). No va en pantalla.
- **Portada** = el PNG `-PORTADA.png` que deja cada montaje.
- **Vídeos ya publicados:** hacer el inventario (qué hay, en qué red, qué texto lleva), preparar el paquete nuevo, enseñárselo a Paco y **solo con su OK** editarlo (modificar contenido público requiere su permiso explícito, vídeo a vídeo o por tandas). Las programadas en Metricool se pueden editar desde las herramientas de Metricool; las ya publicadas, a mano en YouTube Studio / TikTok / Instagram.
- Los datos que caducan (precios, fechas, requisitos) se revisan al republicar y llevan fecha.
- Registro de lo actualizado en `docs/publicaciones-registro.md` (qué vídeo, qué red, qué día, enlace).
