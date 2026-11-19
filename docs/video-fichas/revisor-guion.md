# REVISOR DE GUION Y TEXTOS (automático, lo lanza el chat que monta antes de «★ Exportar para publicar»)
Paco, 20 nov 2026: «quiero que metas las 145… 138 automáticas». Este revisor cubre **56 reglas** que necesitan leer, no medir.
**Quién:** un subagente nuevo (herramienta Agent, `general-purpose`), nunca el mismo chat que escribió el guion: ojos frescos. Coste: 0 € (va dentro de Claude Code, sin API aparte).
**Qué lee:**
- el guion de dirección (`docs/<vídeo>-guion-direccion.md`);
- el expediente o las fuentes;
- `textos-youtube.txt`;
- los subtítulos ES (`.srt`), para saber lo que dice de verdad la voz montada;
- las fichas ① ② ④ (`docs/video-fichas/`);
- y, si una línea no basta, la regla entera en `docs/video-checklist.md`.
**Qué escribe:** `revision-guion.json` en la carpeta ULTIMA. Un objeto con estas 56 claves, sin que falte ninguna:
```json
{ "N23": { "estado": "✅", "como": "ninguna frase empieza por Y/Pero; mirado en el .srt" },
  "N32": { "estado": "❌", "motivo": "1959 sin referencia: no cabe en 60 s; va en la descripción" } }
```
- **✅ con `como`:** qué se miró y dónde.
- **❌ con `motivo`:** por qué no se puede y qué se hizo en su lugar.

Si el revisor ve que algo se puede arreglar, **no** pone ❌ explicado. Lo devuelve al chat para arreglarlo y vuelve a revisar (F12).
Después: `node scripts/revisar-video.cjs "<carpeta ULTIMA>"`. Sin estas 56 resueltas, el candado no deja exportar.

## Las 56 reglas (la línea de cada una está en su ficha)
**Qué contamos:** L1 L2 L3 F2 F4 N4 N6 N12 N13 N33 · tono sin alarmismo (N14)
**Estructura:** F1 G1 G3 N2 N9 N14 N15 N16 N27 M1 M20 M32 M33 M39 M46
**Cada frase (mirar el .srt real, no solo el guion):** N1 N3 N11 N17 N18 N19 N20 N21 N23 N24 N26 N28 N29 N30 N31 N32
**Sonido que depende del guion:** S6 (S8 y S9 los hace el motor con las marcas `cambioTono` y `datoFuerte`: basta con ponerlas)

**Título y textos:** Y2 Y11 Y15 Y19 Y20 Y21 P1 P8 P16 P17

## Cómo se comprueba lo que más se escapa
- **F4:** cada cifra y cada nombre propio de la voz (.srt) tiene su fila en la tabla de fuentes del guion o del expediente. Si no, ❌ y se arregla.
- **N20 · N32:** cada cifra grande lleva su comparación cotidiana, y cada fecha su referencia conocida, en la voz o en pantalla.
- **N23:** busca en el .srt las frases que empiezan por «Y», «Pero», «Entonces», «Además».
- **N26:** si hay un caso concreto y una cifra general del mismo dato, mira cuál va antes.
- **N31:** después de cada muerte, daño o peligro, ¿se dice cómo está hoy?
- **N33 · Y20:** lo que promete el título y la carátula está en el primer minuto y en el gancho.
- **P16:** las 2-3 primeras líneas de la descripción repiten la promesa del gancho.
- **P17:** el hashtag más específico va primero.
- **Y21:** el lugar se escribe igual que en los otros vídeos de ese destino (grep en `publicaciones-registro.md` y en los textos anteriores).
- **Tono (N14):** ni «trampa», ni «peligro de verdad», ni «ruina», ni dramatizar.
