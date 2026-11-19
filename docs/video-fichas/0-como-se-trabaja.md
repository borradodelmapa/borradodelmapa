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

## Reglas de trabajo
- **F12** Todas las normas se cumplen, sí o sí. La que no se pueda cumplir se explica en el ACTA, con el motivo y lo que se hizo en su lugar. El acta va junto al vídeo como `<nombre> - acta.txt`. Estrategia no enseña nada a Paco sin revisarla.
- **F1** Antes de cada montaje, también de cada remontaje, se lee la ficha del paso entera, no de memoria.
- **P5** El informe del motor no tiene ningún ❌, y el acta está completa.
- **F5** El coste se dice antes de gastar: voz, música o Runway. Primero una frase de prueba.
- **F7** Un solo motor (`salma marketing/india/motor/`). Los temporales van en E:, con `WORK_BASE` y `CACHE_PLANOS`. Se entrega con informe, acta y hoja de planos. Se comprueba el tamaño y la duración del mp4 de `ULTIMA`.
- **F8** Paco corrige por número de escena. Nunca se dice «arreglado», sino «montado, dime qué ves y oyes».
- **L2** Se trabaja por países: vídeo, web y redes de un país se planifican juntos.
- **Las dudas no van a Paco:** cualquier duda se le pregunta a 📈 Estrategia (protocolo de coordinación).

## Las que no salen en ninguna ficha (las hace o las comprueba el motor; van en el informe y en el acta)
MOTOR: M2 M3 M4 M5 M6 M7 M8 M9 M11 M12 M13 M16 M17 M22 M29 M30 M31 M34 M38 M41 M42 N5 N8 N22 S2 S3 S7 Y22
**Regla nueva = sitio nuevo:** al añadir una regla a la checklist, se pone en su ficha o en esta línea MOTOR, en el mismo commit. `node scripts/comprobar-checklist-video.cjs` falla si una regla no tiene sitio.
