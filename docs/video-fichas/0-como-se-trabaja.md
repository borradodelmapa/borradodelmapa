# FICHA ⓪ · CÓMO SE TRABAJA (al empezar cualquier vídeo)
Versión del 19 nov 2026. La fuente es `docs/video-checklist.md`, con el texto entero de cada regla. Cada regla de vídeo tiene su sitio en `docs/estrategia/reglas-video-clasificacion.md`:
- **⚙️ El motor la hace:** sale hecha.
- **🔎 El motor la comprueba:** si falla, ❌ y el vídeo no se entrega.
- **📋 Ficha:** se lee en su paso.

## Las fichas, en orden
1. **Ficha ①** Guion, título y carátula: antes de escribir el guion. Lleva las marcas para el motor.
2. **Ficha ②** Material: antes de buscar fotos, vídeos y música.
3. **Montaje:** el motor aplica sus reglas y saca el informe y el acta.
4. **Ficha ③** Revisión del montaje: cada vez que sale un borrador.
5. **Ficha ④** Publicación: antes de subir y programar.

## EL CANDADO (Paco, 20 nov 2026: «quiero que metas las 145… 138 de 145 automáticas»)
Antes de «★ Exportar para publicar», y otra vez antes de publicar, se pasa `node scripts/revisar-video.cjs "<carpeta ULTIMA>"` (`--fase publicar --fecha AAAA-MM-DDTHH:MM --tipo short|largo` antes de programar). Cuenta TODAS las reglas de la checklist (150) y no deja pasar ni una sin resolver:
- **36 del motor:** informe sin ❌.
- **24 del script:** textos, archivo, calidad, fechas, blog y registro.
- **56 del revisor de guion** (`revisor-guion.md`) y **27 del revisor de imagen** (`revisor-imagen.md`): los hace un subagente con ojos nuevos y los deja en `revision-guion.json` y `revision-imagen.json`.
- **7 de Paco**, en `ok-paco.json` con sus palabras: F3 guion y 20 primeros segundos · F5 coste · F6 foto protagonista y audios · S5 música de oído · N25 entonación · F8 ve y oye el montaje · Y13 título y carátula.
Si sale ❌, no se exporta ni se publica.

## Reglas de trabajo
- **F12** Todas las normas se cumplen, sí o sí. La que no se pueda cumplir se explica en el ACTA, con el motivo y lo que se hizo en su lugar. El acta va junto al vídeo como `<nombre> - acta.txt`. Estrategia no enseña nada a Paco sin revisarla.
- **F13** Los dos revisores pasan sobre CADA borrador antes de enseñárselo a Paco, no solo al exportar (ficha ③).
- **F1** Antes de cada montaje, también de cada remontaje, se lee la ficha del paso entera, no de memoria.
- **P5** El informe del motor no tiene ningún ❌, y el acta está completa.
- **F5** El coste se dice antes de gastar: voz, música o Runway. Primero una frase de prueba.
- **F7** Un solo motor (`salma marketing/india/motor/`). Los temporales van en E:, con `WORK_BASE` y `CACHE_PLANOS`. Se entrega con informe, acta y hoja de planos. Se comprueba el tamaño y la duración del mp4 de `ULTIMA`.
- **F8** Paco corrige por número de escena. Nunca se dice «arreglado», sino «montado, dime qué ves y oyes».
- **L2** Se trabaja por países: vídeo, web y redes de un país se planifican juntos.
- **Las dudas no van a Paco:** cualquier duda se le pregunta a 📈 Estrategia (protocolo de coordinación).

## Las que no salen en ninguna ficha (las hace o las comprueba el motor; van en el informe y en el acta)
MOTOR: F7 F11 G2 M2 M3 M4 M5 M6 M7 M8 M9 M11 M12 M13 M14 M16 M17 M19 M22 M23 M27 M29 M30 M31 M34 M38 M41 M42 M45 M49 M50 M51 N5 N8 N10 N22 P14 S2 S3 S7 S8 S9 S10 Y22
(T29, 19 nov 2026: el motor comprueba N14 (9), G2, M14, N10, F11, S10 y M12, y hace M30, M41, M23, M27 y M14; las marcas `nombre`, `pico`, `emocion`, `fecha` y `fechaTikTok` van en la config, ficha ① apartado E.)
**Regla nueva = sitio nuevo:** al añadir una regla a la checklist, se pone en su ficha o en esta línea MOTOR, en el mismo commit. `node scripts/comprobar-checklist-video.cjs` falla si una regla no tiene sitio.
