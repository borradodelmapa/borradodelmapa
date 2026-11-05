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
6. Con su «sí»: una línea en el tablón de `docs/sistemas.md`. Luego:
   - **Si ya están listas las tres piezas** de «Antes de abrir el primero» (`docs/sistemas.md`, sección CHATS DE PAÍS):
     abre el **chat del país** (start_session, título «<bandera> <País>», worktree propio, contexto fresh) con el brief:
     el lote aprobado, `docs/paises/PROTOCOLO.md`, `docs/paises/<pais>.md`, sus límites (solo ficheros de su país,
     no cambia herramientas, mejoras a `MEJORAS.md`, pide a Estrategia lo compartido) y el tope de gasto. Apunta su id
     en `docs/paises/<pais>.md` y en la tabla de ids de `docs/sistemas.md`.
   - **Si no:** mensaje a 🌍 Web y a 🎬 Vídeo con su parte, como en Filipinas.
7. Sigue el lote hasta la **parada 2** (una página de revisión con todo) y, tras el «publica», cierra con la lista
   «Terminado» del protocolo. Después **archiva el chat del país** y repasa sus líneas de `MEJORAS.md`.
8. **Como mucho 2-3 países a la vez y escalonados.** Si Paco pide un cuarto, dile cuál va antes y por qué.
