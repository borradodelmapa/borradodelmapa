# Traspaso: mejorar la calidad de las guías (20 oct 2026)

Léelo entero antes de tocar nada. Si algo no está aquí, no es de esta tarea.

## Qué quiere Paco (una frase)
**Añadir calidad a las guías que ya tenemos, sin romper nada de lo que existe.** No rediseñar. La guía se conserva tal cual (mapa de Google, tarjetas, «Cómo llegar», «Historia de…», audio, GPX, compartir, panel de Salma) y se le **añade** información mejor y mejor contada, **toda real y con su fuente**.

## Reglas duras (Paco las ha repetido muchas veces)
1. **La verificación de Google NO se toca nunca**: coordenadas (`lat`/`lng`), `place_id`, «Cómo llegar», pines y numeración del mapa. Si un dato parece malo: **avisar y proponer, no cambiar**. (Ya se rompió una vez; está revertido.)
2. **Todo real.** Cada dato con su fuente (Wikipedia/Wikivoyage CC BY-SA con atribución, Wikimedia, Google, nuestra ficha marcada «por verificar»). **Mejor sección vacía que inventada.** Nada de precios, horarios o estrellas sin fuente.
3. **Conservar el diseño existente.** La información nueva usa los bloques etiquetados que ya existen (`.guide-stop-tag` / `.tag-*`: CONTEXTO, SECRETO LOCAL, COME CERCA…).
4. **Nunca decir «IA»** en textos públicos.
5. **Un cambio, una prueba, Paco lo ve en SU pantalla** (CLAUDE.md §2). Preguntar antes de cada cambio de código. Cualquier llamada a una API de pago: decir el coste antes (§8).
6. **Antes y después = la pantalla real de la app** (su captura), no una web ni un diseño nuevo. Si dudas qué pantalla es, pregúntale.
7. Entregar solo tras comprobar el **recorrido entero** de quien llega, no la pieza aislada.

## Estado en producción (guía `chitwan-nepal-ruta`, commits 4f0c704ad → ce27de997)
- **Bloque «SOBRE CHITWAN»** bajo la cabecera de la guía: foto, frase, datos, esencia y «Ver ficha completa» (historia, experiencias, fotografía, cómo llegar, dormir, comer, precios, si llueve). Datos en `destinos/img/chitwan-nepal/ficha.json`; código en `mapa-itinerario.js` (`_cargarFicha`, `_lugarHTML`, `_pintarLugar`, `_ajustarConsejos`, `_aplicarDatosARuta`).
- **Títulos propios** (`ficha.json` → `titulos`) para las 4 paradas que Google dejó llamadas «Parque Nacional de Chitwan». Solo cambia el título mostrado (`headline`).
- **Fotos libres por posición** (`fotos.json` → `porIndice`) en las 7 paradas, sin llamar a Google. Código: `_cargarFotosWiki`, `fotoWiki`. Reglas de fotos en `docs/seo-plan-minimo.md`.
- **«Consejos de Salma»**: se añade 1 consejo (los tharu) cuando la guía los muestra (con cuenta). **No verificado visualmente** (el navegador integrado no entra con cuenta).
- Versiones: `mapa-itinerario.js?v=115`, `mapa-ruta.js?v=12`, `styles.css?v=189`. Los datos se piden con `?v=` (`_datosV` en `mapa-itinerario.js`): súbelo si cambian `fotos.json`/`ficha.json`.
- En otras guías **no cambia nada**: no tienen `ficha.json`.

## Pendiente (nada hecho; decidir con Paco antes)
1. **Mapa de Chitwan:** las paradas 1, 2, 6 y 7 tienen las mismas coordenadas (27.51928, 84.31353, el centro del parque, ≈19 km de Sauraha): en el mapa solo se ve un pin. Es dato de la verificación de Google. Opciones: re-verificar esas paradas con nombres concretos (llamada de pago por parada, avisar coste) o reescribirlas como una. **No tocar sin su OK.**
2. **Botón «Historia de…»** (`historia.js` → Worker `/historia-lugar`, Claude Haiku, sin fuente): Paco dice que falla en alguna entrada. Preguntarle en cuál. Cada pulsación cuesta; no probar a ciegas.
3. **Cómo generar fichas reales para las ~1.700 guías** (con fuente, sin inventar). Es el problema de fondo: diseñar el proceso y medir coste con UNA guía antes de lanzar nada. Ver `docs/guias-estructura-v2.md` (estructura que propone Paco + mapa a los datos actuales + opinión).
4. **Puerta de calidad antes de publicar una guía** (propuesta, sin hacer): rechazar guías con paradas en el mismo punto, nombres duplicados, foto que no corresponde, título que no coincide con el texto, dato sin fuente.
5. Fallo de datos encontrado: el presupuesto «18-54 €» es un valor por defecto en 1.620 de 1.630 fichas de destino, también en 11 páginas abiertas a Google. Caso `p-mvgqxhpn3d4`.

## Herramientas que ya existen
`scripts/fotos-destinos.cjs` (baja fotos de Wikimedia), `limpiar-fotos.cjs`, `verificar-destinos.cjs` (control de punta a punta), `abrir-tanda.cjs` (prepara una tanda, se para si falla), `build-destinos.js --only`.

## Cómo trabajar
- Copia de trabajo: `C:\Users\User\Desktop\salma-destinos` (worktree, rama `caso-destinos-diseno`). Subir: commit + `git fetch origin main` + `git rebase origin/main` + `git push origin caso-destinos-diseno:main`. Servidor de prueba: `localhost:8098` (el mapa de Google no pinta en localhost; la clave solo vale en borradodelmapa.com).
- Para ver la versión nueva en producción: añadir `&r=N` a la URL o Ctrl+F5 (GitHub Pages guarda 10 min).
- Casos: `node scripts/casos.cjs hoy`. Caso del blog/índice: `p-mvfrvjvh200`.

## Qué NO leer
El resto de la sesión del 19-20 oct (reseñas de Play, compartir, Search Console, prototipos del blog, banco de pruebas). Los artifacts «Chitwan antes y después» y «Recorrido del blog» rediseñaban pantallas: **ignorarlos**.

## Primer paso
Leer este documento y las reglas de `CLAUDE.md`, y **decirle a Paco en 5 líneas qué has entendido, antes de tocar nada**.
