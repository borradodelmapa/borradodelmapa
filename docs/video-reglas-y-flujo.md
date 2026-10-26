# VÍDEO Y SERIES DOCUMENTALES — reglas, voces y flujo (26 oct 2026)
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
