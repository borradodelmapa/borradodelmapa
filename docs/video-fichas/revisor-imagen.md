# REVISOR DE IMAGEN (automático, lo lanza el chat que monta antes de «★ Exportar para publicar»)
Paco, 20 nov 2026: «quiero que metas las 145… 138 automáticas». Este revisor cubre **27 reglas** que se comprueban mirando.
**Quién:** un subagente nuevo (herramienta Agent, `general-purpose`), nunca el chat que montó. Coste: 0 € (dentro de Claude Code).
**Qué mira:**
1. La **hoja de fotogramas cada segundo**, con el subtítulo de ese segundo al lado. Se saca con ffmpeg: `fps=1`, tile, del mp4 de ULTIMA.
2. Los **primeros 3 segundos** fotograma a fotograma, y el **final**, del último plano hasta la tarjeta.
3. La **carátula a tamaño completo y a 160 px**, al lado del título.
4. Las **hojas de contactos** del material, con `ATRIBUCIONES.txt` y `MATERIAL.md`.
**Qué escribe:** `revision-imagen.json` en la carpeta ULTIMA, con el mismo formato que el revisor de guion. Cada una de estas 27 claves lleva ✅ y `como`, o ❌ y `motivo`. Lo que tenga arreglo se devuelve para arreglarlo; no se explica.

## Las 27 reglas
**Material y respeto:** F9 F10 P4 S1 S4
**Primer fotograma y carátula:** M15 Y4 Y14 Y18 Y23
**Plano a plano:** N7 M18 M21 M24 M26 M28 M35 M36 M37 M40 M43 M44 M47 M48
**Subtítulos en pantalla:** M10 M25
**Del motor (ya no se miran a mano):** M17, M22, M31, M38, M42 y S7 los hace o comprueba el motor (salen en el informe y en el acta). M22: el golpe del *batok* en cada cifra, elegido por Paco el 20 nov 2026.

## Cómo se comprueba lo que más se escapa
- **N7:** en cada segundo, ¿la imagen es de lo que dice el subtítulo? Si se habla de internet y se ven setas, ❌ y se arregla.
- **Rótulos:** un rótulo de lugar o de fuente solo va sobre imágenes de ese sitio o de esa fuente.
- **M28:** el primer fotograma de cada corte está ya resuelto: nada de medio gesto ni de otra persona.
- **M18 · M43:** el último plano antes de la tarjeta es el más fuerte, y antes hay un instante sin voz.
- **Y23:** la carátula a 160 px. Escribe en una línea qué entendería alguien que no sabe nada. Si no es la historia del vídeo, ❌.
- **Y3** (cruce): la carátula y el título no comparten más que la palabra fuerte o el lugar.
- **P2** (cruce): cada autor de `ATRIBUCIONES.txt` aparece en la descripción de `textos-youtube.txt`.
- **M10 · M25:** ningún texto en la zona de botones (shorts: entre 1.260 y 1.920 px) y nunca más de 2 líneas.
- **F9:** ninguna foto es de otro sitio. **F10:** cada clip ajeno tiene su licencia y su rótulo de lugar y fecha.
