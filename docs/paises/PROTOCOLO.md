# PROTOCOLO DE UN PAÍS — de «haz <País>» a todo publicado (Paco, 5 nov 2026)

Lo que se hizo en Filipinas, convertido en receta que se repite igual en cada país. Regla de fondo: L2 de `docs/video-checklist.md`
(se trabaja por países; cada país sale completo y programado y abre con su introducción). Modo producción: `docs/sistemas.md`.
Este archivo **ordena** el trabajo; el detalle de cada paso está en el manual de su sistema (no se copia aquí, para que no haya dos versiones).

## Cómo se pide
En el chat **📈 Estrategia** escribe:

> **/pais Marruecos**

(o «haz Marruecos como Filipinas»). Estrategia prepara el lote y te hace **una sola pregunta**: «¿apruebas el lote y hasta X €?».
Con tu «sí» arrancan Web y Vídeo a la vez, sin preguntarte nada más hasta la revisión final.

## Qué sale de cada país (el paquete)
| # | Pieza | Sistema | Detalle en |
|---|---|---|---|
| 1 | **Expediente** del país: 8 apartados con fuentes (la base de todo) | 🌍 Web | `PLANTILLA-expediente.md` |
| 2 | **Página del país** con «Conoce <país>» + **páginas de sus sitios** (fotos revisadas, «Sobre…», sitios menos turísticos) | 🌍 Web | `docs/sistemas/web.md` → País completo, Sitio |
| 3 | **Guías** de la app (1-3: la ruta clásica y la de la zona de los vídeos); **cuentan en Explorar** | 🌍 Web | `web.md` → Guía nueva |
| 4 | **Historias del blog:** la introducción del país, una por guía y una por cada vídeo | 🎬 da el contenido · 🌍 maqueta | `web.md` → Historia · checklist P12 |
| 5 | **Vídeo de apertura** 16:9 (6-8 min) con los 8 apartados | 🎬 Vídeo | `docs/sistemas/video.md` → Apertura de país |
| 6 | **Shorts de serie** de los pueblos del país (≤ 60 s, N10) | 🎬 Vídeo | `video.md` → Short de serie |
| 7 | **3-4 shorts derivados** de la apertura (volcanes, historia, una cultura…) | 🎬 Vídeo | `video.md` → Short derivado |
| 8 | **Paquete de redes** de cada vídeo (título, descripción, hashtags, `.srt`, primer comentario con autores) + **SEO de YouTube** (Y) | 🎬 Vídeo | checklist P6, Y |
| 9 | **Tanda a Google** de las páginas del país (máx. 30) + pedir indexación de las 3-4 clave | 🌍 Web | `web.md` → Tanda a Google |
| 10 | **Programación** en Metricool (YouTube 15:30, TikTok 10:00, P13) | 🎬 Vídeo | checklist P13 |

## El orden (dos paradas tuyas, nada más)
| Fase | Qué pasa | Quién | Tu parte |
|---|---|---|---|
| **0 · Lote** | País, piezas, fechas y presupuesto máximo | 📈 | **⏸1: «sí» al lote y su tope de gasto** |
| **1 · Base** | Expediente con fuentes (lo dudoso marcado ⚠) | 🌍 | — (se revisa en la ⏸2) |
| **2 · Producción** (a la vez) | 🌍 guías, país, sitios, fotos · 🎬 guiones, fotos, voz, montajes, mapas | 🌍 🎬 | — |
| **3 · Montaje web** | Historias con sus vídeos, enlaces cruzados, comprobadores en ✅ | 🌍 | — |
| **4 · Revisión** | **Una página de revisión** con enlaces a todo: páginas en copia, vídeos, textos de redes, guías, y la lista de dudas (datos ⚠, fotos delicadas) | 📈 la reúne | **⏸2: «publica» o qué cambiar** |
| **5 · Publicar** | Web en producción → guías públicas → tanda a Google → vídeos a R2 y Metricool (la web sale ≥ 1 semana antes que su vídeo) | 🌍 🎬 | — |
| **6 · Cerrar** | Explorar ha subido lo que toca, Search Console pedido, Metricool comprobado, coste y tiempo reales anotados | 📈 | Lo lees en el informe semanal |

## Terminado = todo esto en ✅
- [ ] Explorar: el total de guías ha subido lo que toca (`/explorar`).
- [ ] Página del país y de sus sitios servidas por la web; `comprobar-nada-atras.cjs` ✅.
- [ ] Historias publicadas y enlazadas desde el país y sus sitios.
- [ ] Indexación pedida en Search Console; páginas en `destinos-indexables.json` y en el sitemap.
- [ ] Vídeos con informe del motor sin ❌, en R2, programados en Metricool con descripción y primer comentario; anotados en `publicaciones-registro.md`.
- [ ] `docs/paises/<pais>.md` al día; coste y tiempo reales en `docs/estrategia/plan.md`.

## Coste a ojo por país (medido en Filipinas; Estrategia lo ajusta con cada país)
| Pieza | Coste |
|---|---|
| Guía de la app | ~0,40 € cada una (0,4-1 €) |
| Voz de un short | ~0,30 € |
| Voz de la apertura | ~1,30 € |
| Expediente, páginas, fotos de Wikimedia, montaje, mapas, blog | 0 € |
| **País típico** (2 guías, apertura, 2-3 shorts de serie, 3-4 derivados) | **~3-5 €** |

## Tiempo a ojo
Filipinas, el piloto: ~3 h de web y una tarde de vídeo, con muchas paradas. Con el modo producción y el diseño ya hecho:
**web ~1-1,5 h + vídeo ~1 día de montajes**, y tu revisión final de ~20-30 min.

## Lo aprendido (se añade al cerrar cada país)
- Filipinas (4-5 nov 2026): guías con destino = el **país**, no una región (caso p-mw2gxtxbpmq, ya arreglado en el Worker); fotos de Wikimedia
  revisadas una a una (salen volcanes de otros países con el mismo nombre); GitHub Pages puede atascarse («in progress deployment»): un commit vacío lo relanza.
