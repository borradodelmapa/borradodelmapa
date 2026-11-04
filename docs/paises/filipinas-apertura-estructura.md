# Filipinas · vídeo de apertura 16:9: estructura (chat 2, borrador del 4 nov 2026)

**Estado: ESQUELETO, sin guion.** El texto sale del expediente del chat 1 (pieza #1 de `docs/paises/filipinas.md`), con fuentes y el OK de Paco. Hasta entonces no se escribe guion ni se gasta voz (F3, F5).
Reglas: `docs/video-checklist.md` (L2, G1, M7, M11, M13 en lista, M14, M16, N6, P12, Y2-Y9). Salma narra sola, sin «viaje real» (F2, M14). Duración: 6-8 min (~420 s, unos 5.000-6.500 caracteres de voz).

## Bloques = los 8 apartados de L2 (capítulos de YouTube, Y6)
Segundos orientativos; se ajustan al texto aprobado. Los datos de la columna «idea» son ejemplos para pensar la imagen: **se usan solo si los confirma el expediente con fuentes** (F4).
| # | Capítulo | ~s | Imagen principal | Mapa / gráfico | Idea (sin verificar) |
|---|---|---|---|---|---|
| 0 | Gancho «en frío» (G1; 2-3 versiones para que Paco elija) | 30-40 | lo más fuerte del vídeo: volcán, terrazas o un rostro (M15) | — | p. ej. «Un país de miles de islas que se mueve sobre el Anillo de Fuego» o «Durante 250 años, de Asia a España se iba por México» |
| 1 | Geografía y geología | 60 | volcanes (Mayon, Taal, Pinatubo), islas desde el aire | **Mapa A** archipiélago · **Mapa B** placas y volcanes | número de islas, tres grupos (Luzón, Visayas, Mindanao), fosa de Filipinas |
| 2 | Primeros pobladores | 45 | restos y cuevas solo en foto de museo, nunca restos humanos (F9) | **Mapa C** expansión austronesia (ruta) | Callao, pueblos negritos, llegada austronesia |
| 3 | Antes de la colonia | 45 | barangays, comercio, escritura | **Gráfico** del *baybayin* (como `grafico-otzi.cjs`) | baybayin, comercio con China, sultanatos del sur |
| 4 | La colonia | 70 | grabados y mapas antiguos (dominio público) | **Mapa D** ruta del galeón Manila-Acapulco (mundo plano) | 1521 Mactan, 1565 Legazpi, galeón (1565-1815), 1898 |
| 5 | Siglo XX e independencia | 45 | fotos de archivo libres, sin heridos (F10) | — | EE. UU., guerra, 1946, 1986 |
| 6 | Culturas de hoy | 50 | personas de varios pueblos (M15, P4) | **Mapa E** pueblos de la serie (ruta: Kalinga, Sagada, Ifugao…) | más de cien lenguas |
| 7 | Lo que se está borrando y por qué | 40 | terrazas abandonadas, batok, lenguas | — | enlaza con Whang-Od, Sagada, ifugao (Y14) |
| 8 | Datos prácticos (con fecha) + app + cierre | 35 | — | — | visado, temporada, cómo llegar; clip común de la app (M16), tarjeta final 16:9 y pantalla final (Y13 propuesta) |
**Avisos de seguir (M13 en lista):** 2-3, cada uno al empezar un mapa y sin voz encima, como en Tatuajes.
**Portada (M11, 16:9):** diseño de `portada.cjs generarH`, persona o volcán según el gancho elegido.

## Lo que hace hoy el motor en 16:9 (comprobado en el código el 4 nov 2026)
| Pieza | Estado | Dónde |
|---|---|---|
| Montaje horizontal (`cfg.formato = '16:9'`), subtítulos abajo, rótulos, cifras animadas | ✅ funciona | `motor.cjs` (lo usa Tatuajes) |
| Fotos estrechas enteras sobre su fondo difuminado; Ken Burns; **paneos** (`pan`) | ✅ | `motor.cjs` |
| Varios avisos de seguir (`cfg.seguir` en lista) | ✅ | `motor.cjs`, Tatuajes |
| Portada horizontal con el diseño de los shorts | ✅ | `portada.cjs generarH` |
| Mapas horizontales: vuelo con globo y zoom, **ruta parada a parada**, **mundo plano con ruta** | ✅ | `mapa-tatuajes.cjs` → se copia a `mapa-filipinas.cjs` (A, C, D, E salen de ahí, 0 €) |
| Gráficos animados propios (esquemas) | ✅ | `grafico-otzi.cjs`, `grafico-vory.cjs` como modelo |
| **Mapa B: placas y volcanes** | ❌ hay que hacerlo (0 €) | necesita datos libres: límites de placas (modelo PB2002, Bird 2003) y volcanes (Smithsonian GVP); **comprobar licencia y citar** antes de usarlos |
| **Islas pequeñas** en el zoom del archipiélago | ⚠ con el mapa actual (Natural Earth 1:50m) se pierden muchas | usar Natural Earth 1:10m (dominio público) solo para Filipinas |
| Capítulos sacados del config (Y10 propuesta) | ❌ pendiente | hoy se escriben a mano |
| Tarjeta final + pantalla final de YouTube en 16:9 (M14, Y13 propuesta) | ⚠ comprobar lo que hace Tatuajes al cierre | — |
| **Shorts derivados en vertical** | ✅ el motor monta en 9:16 | ⚠ los mapas son por formato: `mapa-filipinas.cjs` tiene que sacar también la versión vertical (o se copia de `mapa-sagada.cjs`) |
| Clips de IA (Runway/Kling) | solo si Paco lo pide, con coste dicho | — |

## Shorts derivados (pieza #5): candidatos, uno por bloque fuerte
1. Geología: islas y volcanes del Anillo de Fuego (bloque 1).
2. El galeón de Manila: Asia y América unidas por un barco (bloque 4).
3. Antes de España: el *baybayin* (bloque 3).
4. Lo que se está borrando (bloque 7), opcional.
Cada uno con su propio gancho de 20 s (G1), «vídeo relacionado» → la apertura (Y14 propuesta) y su paquete de texto (P6).
