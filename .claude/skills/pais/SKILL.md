---
name: pais
description: Arrancar un país completo (guías, páginas, blog, vídeos, Google, YouTube) con el protocolo de país. Paco lo usa como «/pais <País>» en el chat de Estrategia. Prepara el lote y hace una sola pregunta.
---

# /pais <País> — un país completo, como Filipinas

Argumento: el nombre del país (p. ej. «Marruecos»). Si falta, pregunta cuál.

1. Lee `docs/paises/PROTOCOLO.md` (el orden y el paquete), `docs/sistemas.md` (tablón, ids, modo producción)
   y la sección «Preparar un lote» de `docs/sistemas/estrategia.md`. `git fetch origin main` antes.
2. Mira lo que ya existe de ese país, sin gastar: páginas en `destinos/` (`*-<pais>.html`), guías en Explorar
   (`https://salma-api.borradodelmapa-api.workers.dev/explorar`), historias en `blog/viajes/`, vídeos y episodios
   en `docs/serie-*.md` y `docs/programacion-canal.md`, y si Paco ha viajado allí.
3. Crea `docs/paises/<pais>.md` copiando la forma de `docs/paises/filipinas.md` (piezas, quién, estado, fechas).
4. Escribe el lote en `docs/estrategia/plan.md`: piezas del paquete que tocan (y cuáles no y por qué), fecha de la
   revisión final, fechas de publicación (web ≥ 1 semana antes que su vídeo, huecos libres de Metricool) y
   **presupuesto máximo con rango** (tabla de costes del protocolo).
5. **Parada 1:** a Paco, en pocas líneas, qué sale del país y cuándo, y **una sola pregunta**:
   «¿Apruebas el lote de <País> hasta X €?». No encargues nada antes de su «sí».
6. Con su «sí»: una línea en el tablón de `docs/sistemas.md` y un mensaje a 🌍 Web y a 🎬 Vídeo con su parte
   (ids en la tabla de `docs/sistemas.md`). Primero el expediente (Web): Vídeo escribe guiones cuando esté.
7. Sigue el lote hasta la **parada 2** (una página de revisión con todo) y, tras el «publica», cierra con la lista
   «Terminado» del protocolo.
