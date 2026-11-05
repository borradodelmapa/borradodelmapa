# FILIPINAS — mapa de páginas de la web (5 nov 2026)

21 páginas. Revisado leyendo los ficheros del repo (enlaces y texto repetido); se rehace con el inventario de
`docs/paises/PROTOCOLO-pais-web.md` cada vez que se añade una pieza.

## Las páginas
| Tipo | Página | A Google |
|---|---|---|
| País (la página principal) | `/destinos/filipinas.html` | no (noindex hasta la tanda) |
| Destinos «menos turísticos» | `/destinos/banaue-filipinas.html` · `batad-filipinas` · `buscalan-filipinas` | no |
| Destinos clásicos | `/destinos/` + `palawan-el-nido` · `coron-palawan` · `bohol` · `cebu` · `siargao` · `manila` · `vigan` · `batanes` · `sagada` · `puerto-princesa` (+ `-filipinas.html`) | no |
| Guías públicas | `/filipinas-en-21-dias-manila-palawan-visayas-y-cordillera-gw2t` · `/luzon-norte-en-4-dias-banaue-batad-sagada-y-buscalan-brjk` | sí |
| Blog: introducción | `/blog/viajes/filipinas-historia-culturas-antes-de-viajar` | sí |
| Blog: entrada de la guía | `/blog/viajes/filipinas-luzon-norte-4-dias-cordillera` | sí |
| Blog: episodios | `filipinas-whang-od-tatuadora-kalinga` · `filipinas-sagada-ataudes-colgantes` · `filipinas-ifugao-terrazas-de-arroz-batad` | sí |
Y la app: `/?ruta=<guía>` (el mapa y el botón de cada destino abren la guía ahí).

## Cómo se navega
- **País** → los 13 destinos · las 2 guías (destacadas, con mapa) · las 5 entradas del blog («Conoce Filipinas», diarios).
- **Cada destino** → el país · la guía que pasa por él (o la de 21 días) · las 2 guías · 8 destinos más (los 3 menos turísticos siempre) · su entrada del blog si la tiene (Banaue y Batad → ifugao; Buscalan → Whang-Od; Sagada → Sagada).
- **Guías públicas** → el país y los destinos por los que pasan · la otra guía.
- **Blog** → la guía (Luzón norte o 21 días) · la página del país o del destino · las otras entradas de la serie.

## Texto repetido
No hay páginas duplicadas. Lo que se repite entre páginas es el menú, el pie y las tarjetas (normal), y frases sueltas
del mismo dato (UNESCO 1995, la lista en peligro de 2001-2012, Acabado): están en el expediente y cada pieza las usa en su
contexto. «Conoce Filipinas» y el artículo de introducción no comparten ni un tramo de texto.

## Pendiente (para que todo quede redondo)
- Las guías públicas aún no enlazan a Banaue, Batad y Buscalan (se generan solas cada noche desde las páginas de destino; mirar mañana).
- `sitemap-guias.xml` aún no tiene Luzón norte (misma regeneración nocturna).
- Las entradas de Whang-Od y Sagada enlazan a la guía de 21 días; la de Luzón norte encaja mejor (blog: chat 2, con OK de Paco).
- Las páginas de destino salen a Google con la tanda, cuando esté Search Console.
- Detalle: en los destinos de 1 día, la pregunta frecuente dice «se recomiendan 1 días».
