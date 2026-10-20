# Índice: Explorar y Destinos (20 oct 2026) — caso p-mvfrvjvh200

Son **dos cosas distintas** que comparten **las mismas guías** y **el mismo mapa** (CLAUDE.md §12):
- **Explorar (app):** aquí el usuario encuentra TODAS las guías: las ~1.700 de Salma y las de los usuarios, con un selector «Todas / De usuarios».
- **Destinos (`/destinos/`, web):** páginas para que Google nos posicione y traiga usuarios. Van en `noindex` y se abren poco a poco, por tandas. Se estudia aparte.

Estado de cada punto: ✅ hecho · 🟡 a medias · ⬜ sin empezar · ❓ decide Paco

---

## 0. LAS GUÍAS (base de las dos cosas)
Hoy: **12 guías hechas** (11 de Nepal y Barcelona) de unos 1.630 destinos. Proceso mecanizado en `docs/modelo-1700-guias.md`.

| # | Qué | Estado |
|---|---|---|
| 0.1 | **Lista escrita de garantías de calidad**: qué se comprueba, si lo mira una máquina o una persona, y qué pasa si falla. Paco la aprueba | ⬜ |
| 0.2 | **Puerta de calidad** en el verificador: paradas en el mismo punto o con el mismo nombre, parada lejos del destino, título que no coincide con el texto, foto que no corresponde, dato sin fuente. Solo rechaza; nunca toca datos de Google | ⬜ |
| 0.3 | Arreglar el presupuesto «18-54 €» que sale por defecto en 1.620 fichas (caso p-mvgqxhpn3d4) | ⬜ |
| 0.4 | **Estructura v2 de la guía** (esencia, historia con fuente, experiencias, fotografía, práctico): decidir qué entra (`docs/guias-estructura-v2.md`). Piloto hecho a mano en Chitwan | 🟡 ❓ |
| 0.5 | **Guía de prueba** que pase todo, con el **coste real medido** (§8) | ⬜ |
| 0.6 | Con el OK de Paco: generar país a país (`progressive-load.js`). Cada guía que pase la puerta aparece sola en Explorar | ⬜ |

## 1. EXPLORAR (app)
Hoy: solo rutas de usuarios, en tarjetas país → provincia. **El Worker excluye las guías de Salma** (`salma-worker.js`, `buildExplorarIndex`, filtro `EXPLORAR_SALMA_UID`). No hay mapa ni buscador.

| # | Qué | Estado |
|---|---|---|
| 1.1 | **Mockup** (enlace privado): mapa de «Tu vuelta al mundo» (Leaflet + OSM) coloreado por número de guías, buscador, selector Todas / De usuarios, país → sus guías. Paco lo prueba en el móvil | ⬜ |
| 1.2 | Decisiones sobre el mockup: qué se ve por defecto, orden de las guías dentro del país, cómo se distingue una guía de Salma de una de usuario | ❓ |
| 1.3 | **Worker `/explorar`**: incluir las guías de Salma, marcadas, y el código de país para pintar el mapa | ⬜ |
| 1.4 | **Índice ligero**: hoy el Worker lee el itinerario entero de cada guía (tope de 3.000). Con más de 1.700 guías no aguanta: hay que guardar un resumen por guía | ⬜ |
| 1.5 | App (`renderExplorar`): mapa, buscador y selector | ⬜ |
| 1.6 | **Mapa compartido** con `tu-mundo.js` y `mundo-publico.js` (§12): una mejora sirve para los tres | ⬜ |
| 1.7 | Acceso (§10): la lista se ve sin cuenta; una guía abierta sin cuenta enseña el avance (día 1 + candado) | ✅ ya es así |
| 1.8 | Paco lo prueba en su app (§2) | ⬜ |

## 2. DESTINOS (web, para Google)
Hoy: 1.796 páginas generadas. **13 abiertas a Google** (Nepal, Barcelona y el índice). El índice `/destinos/` es una lista de países, sin mapa.

| # | Qué | Estado |
|---|---|---|
| 2.1 | Página de destino: guía completa (§10, excepción), ficha del destino y tarjeta que lleva a la app. Fotos de Wikimedia con crédito | ✅ tanda 1 |
| 2.2 | Proceso de tanda (`abrir-tanda.cjs` + verificador + hoja de fotos) | ✅ |
| 2.3 | **Índice `/destinos/` con el mismo mapa** (§12). Los enlaces van en el HTML, no detrás de JavaScript, para que Google los lea | ⬜ |
| 2.4 | La estructura v2 (0.4) también en la página, con los textos en el HTML | ⬜ |
| 2.5 | **Search Console**: ver cómo van Nepal y Barcelona (indexadas, impresiones, errores) antes de abrir más | ❓ comprobar con Paco |
| 2.6 | **Plan de tandas**: qué destinos van primero (`docs/seo-destinos-prioritarios.md`), cuántos y a qué ritmo. Hay que estudiarlo | ❓ |
| 2.7 | Regla: una página sin guía real no se abre a Google | ✅ |
| 2.8 | Los 12 artículos del blog: decidir si enlazan a destinos o se integran | ❓ |

## Orden propuesto
1. **0.1** Lista de garantías. Sin ella no se genera ninguna guía.
2. **1.1** Mockup de Explorar.
3. **0.2 → 0.5** Puerta de calidad, guía de prueba y coste medido.
4. **1.3 → 1.8** Explorar en la app, con las 12 guías de Salma ya hechas y las de usuarios.
5. **0.6** Generar las guías por tandas. Van apareciendo en Explorar.
6. **2.x** Destinos y Google, al ritmo que marque Search Console.

## Coste (§8)
- Explorar y el mapa: **0 €** en APIs de pago (Leaflet + OSM; Firestore y KV ya existen).
- Destinos: **0 €** (fotos de Wikimedia, HTML fijo).
- Generar las guías: Claude Sonnet más la verificación de Google Places. **Hay que medirlo con una guía (0.5).** Estimación sin medir: unos 170 $ las 1.700, sin contar Google.
