# TRASPASO PARA EL CHAT NUEVO — léelo entero, es el único documento que necesitas

Fecha: 20 oct 2026. Es de Paco (founder, único desarrollador). Está harto de que se rompa lo que funciona: **sé cuidadoso, pregunta antes de tocar y explica en lenguaje sencillo, sin enrollarte.**

## 1. Qué quiere Paco
**Añadir calidad a las guías que ya existen, sin romper nada.** No rediseñar. La guía se queda tal cual (mapa de Google, tarjetas de paradas, «Cómo llegar», «Historia de…», audio, GPX, compartir, panel de Salma). Solo se le **añade** información mejor y mejor contada:
- cabecera con frase emocional y datos rápidos, **esencia** del lugar, **historia** (ampliable), **experiencias** (con duración, precio, dificultad), **la mirada Borrado del Mapa** (fotografía y «lo que nadie te cuenta») e **información práctica** al final (cómo llegar, dormir, comer, precios); con vista rápida y vista completa.
- Debe sentirse como «un viajero experto me cuenta este lugar», no como una ficha turística.
- Es **para la app**, y debe funcionar también en la web (SEO). Todo lo que se publica lo generamos nosotros y **tiene que ser real**.

## 2. Reglas que NO se negocian
1. **La verificación de Google NO se toca nunca**: coordenadas (`lat`/`lng`), `place_id`, «Cómo llegar», pines y numeración del mapa. Si un dato parece malo: **avisar y proponer, nunca cambiarlo.** (Hoy se tocó por error y hubo que revertirlo.)
2. **Todo real y con fuente.** Wikipedia o Wikivoyage (con atribución), Wikimedia (fotos con crédito), Google o nuestra ficha marcada «por verificar». **Mejor sección vacía que inventada.** Nada de precios, horarios o estrellas sin fuente.
3. **Mantener el diseño que hay.** La información nueva usa los bloques etiquetados que ya existen en las tarjetas (CONTEXTO, SECRETO LOCAL…).
4. **Nunca decir «IA»** en textos que vea el público.
5. **Un cambio, una prueba, y Paco lo ve en SU pantalla** (CLAUDE.md §2). Preguntar antes de cambiar código. Cualquier llamada a una API de pago: decir el coste **antes**.
6. «Antes y después» = la **pantalla real de la app** (su captura), no una web ni un diseño nuevo. Si dudas, pregúntale.
7. Entregar solo tras comprobar **todo el recorrido** de quien llega (página, botón, app, pop-up), no la pieza aislada.

## 3. Cómo está ahora en producción (guía de Chitwan: `borradodelmapa.com/?ruta=chitwan-nepal-ruta`)
- Bloque **«SOBRE CHITWAN»** bajo la cabecera de la guía (foto, frase, datos, esencia y «Ver ficha completa»). Datos en `destinos/img/chitwan-nepal/ficha.json`; código en `mapa-itinerario.js`.
- Cuatro paradas que Google dejó con el mismo nombre ahora tienen **título propio** (solo texto mostrado).
- Las 7 paradas con **foto libre de Wikimedia** que corresponde, sin llamar a Google. Reglas de fotos en `docs/seo-plan-minimo.md`.
- «Consejos de Salma»: se añade 1 consejo cuando la guía los muestra (con cuenta). **No verificado visualmente.**
- Otras guías: **no cambia nada** (no tienen ficha).

## 4. Pendiente (nada hecho; decidir con Paco antes)
1. **Mapa de Chitwan:** las paradas 1, 2, 6 y 7 tienen las mismas coordenadas (27.51928, 84.31353, centro del parque, a ≈19 km de Sauraha), así que en el mapa solo se ve un pin. Es dato de Google. Opciones: re-verificar esas paradas con nombres concretos (llamada de pago por parada, decir coste) o reescribirlas como una. **No tocar sin su OK.**
2. **Botón «Historia de…»** (`historia.js` → Worker `/historia-lugar`, Claude Haiku, sin fuente): Paco dice que falla en alguna entrada. Hay otra sesión que estaba editando `worker/salma-worker.js` para arreglar un error 500 de JSON mal formado en esa función: **mirar `git status` y preguntar a Paco antes de nada; no pisar esos cambios.**
3. **Fallo de datos:** el presupuesto «18-54 €» es un valor por defecto en 1.620 de 1.630 fichas de destino, también en las 11 páginas abiertas a Google (caso `p-mvgqxhpn3d4`).
4. **Hacer las ~1.700 guías** (ver el punto 5).

## 5. Cómo hacer las ~1.700 guías: usar lo que YA está mecanizado
- **Tramo A, de un país a sus guías** (`scripts/progressive-load.js`, desde septiembre): por país genera los destinos, la **ruta completa de cada uno** (`worker/kv/generate-nivel3.js`, Claude Sonnet 4.6), las páginas web, la **guía pública en Firestore** (la que abre «Abrir la guía» en la app), el sitemap y las rutas en KV.
- **Tramo B, de una guía a una página buena** (`scripts/abrir-tanda.cjs`, hecho el 19 oct): fotos de Wikimedia, páginas, verificador (`verificar-destinos.cjs`), hoja de fotos, confirmar, subir y comprobar en la web. **Tandas de 30 como máximo**, todo en `noindex` hasta confirmar cada tanda.
- **Falta:** solo **12 de las ~1.630 fichas de destino tienen ruta**. Hay que ejecutar el tramo A país a país (empezando por los que más se buscan) y el tramo B por tandas.
- **Coste:** **medir con UNA guía antes de lanzar** y decirlo a Paco. El script de rutas usa Sonnet 4.6 (la documentación `docs/kv.md` dice otra cosa, revisarlo). Estimación a ojo: ≈ 0,1 $ por ruta, ≈ 170 $ para 1.700. **La verificación con Google no está medida.**
- **A añadir al proceso, no rediseñarlo:** que el verificador **rechace** guías con paradas en el mismo punto o con el mismo nombre (solo lee, no edita), y una ficha de lugar opcional con fuente. La estructura nueva de ficha está explicada en `docs/guias-estructura-v2.md` (idea de Paco).

## 6. Dónde trabajar
- Copia: `C:\Users\User\Desktop\salma-destinos` (rama `caso-destinos-diseno`). Subir: commit, `git fetch origin main`, `git rebase origin/main`, `git push origin caso-destinos-diseno:main`. Servidor de pruebas: `localhost:8098` (el mapa de Google no pinta en localhost: la clave solo vale en borradodelmapa.com).
- Para ver lo nuevo en producción: añadir `&r=N` a la URL o Ctrl+F5 (GitHub Pages guarda 10 min). Los datos de `destinos/img/*` se piden con `?v=`: subir `_datosV` en `mapa-itinerario.js` si cambian.
- Casos: `node scripts/casos.cjs hoy`. Caso del blog/índice: `p-mvfrvjvh200`.

## 7. Qué NO leer
El resto de la sesión del 19-20 oct (reseñas de Play, botón de compartir, Search Console, prototipos del blog). Los artifacts «Chitwan antes y después» y «Recorrido del blog» rediseñaban pantallas: **ignorarlos**.

## 8. Primer paso
Leer este documento y las reglas de `CLAUDE.md`, y **decirle a Paco en 5 líneas qué has entendido, antes de tocar nada.**
