# Tanda 3 de destinos a Google — PROPUESTA (T21, 18 nov 2026)

**Estado:** propuesta de 🌍 Web para 📈 Estrategia → Paco. **No se ha tocado nada:** `scripts/destinos-indexables.json` sigue igual (27 URLs: índice, Nepal y Filipinas).
Datos sacados del repo el 18 nov con `scripts/comprobar-pais.cjs` y un recuento por país. Coste: 0 €.

## Antes de nada: ¿cómo van las tandas 1 y 2?
La regla del plan (`docs/seo-plan-minimo.md`) dice que no se abre otra tanda si la anterior no se indexa o se hunde en 3-4 semanas.
**Desde aquí no puedo ver Search Console.** Paco tiene que mirar (2 min, en el Chrome de Paco): Indexación → Páginas, y buscar `destinos/filipinas` y `destinos/nepal`.
- Si están indexadas: se abre la tanda 3.
- Si no lo están: se arregla eso antes de abrir nada más.

## 1 · Candidatos, con datos
| País | Sitios | Diseño | Portadas | «Qué hacer» con foto | Historias del blog (vídeo) | Guías públicas | «Conoce» + expediente | Veredicto |
|---|---|---|---|---|---|---|---|---|
| **Vietnam** | 10 | nuevo | 6/10 (y los 10 con alguna foto) | 28/40 | **7** (6 con vídeo; 2 en YouTube) | **3** | no | **Entra en la tanda 3** |
| India | 11 | nuevo | 8/11 | 19/55 | 4 (largo en YouTube desde el 17 nov) | **0** | no | Tanda 4: le falta una guía y repasar textos |
| Tailandia | 10 | **viejo** | 7/10 | 0/42 | 4 (serie en marcha) | 2 | no | Tanda 4-5, cuando salga la serie (Tailandia 1, 1 dic) |
| Japón | 10 | nuevo | 8/10 | 23/52 | 1 | 0 | no | Más adelante |
| España | 10 (+ Barcelona ya dentro) | viejo | 8/10 | 0/50 | 0 | 12 | no | Más adelante: tiene guías pero ningún contenido propio |

Las URLs con tilde (T14: `milán-italia`, `cañon-colca-peru`, `belén…`, `hebrón…`, `spitzkoppe-montaña…`) **no entran en esta tanda**: ninguna es de Vietnam. Se arreglan antes de abrir Italia, Perú, Palestina o Namibia.

## 2 · Lo que le falta a Vietnam para no subir páginas flojas
**Hacer antes de abrirlo (Web, 0 €):**
1. **«Conoce Vietnam» + expediente** (`docs/paises/vietnam-expediente.md` → `scripts/paises/vietnam/intro.json`). Es lo que hace que la página del país no sea una plantilla. Ya existe material con fuentes en las entradas del blog («Historia de Vietnam», «Vietnam en moto», «La guerra de las fichas de dominó»), así que no hay que investigar de cero. Unas 1-1,5 h.
2. **Portadas de los 4 sitios que no tienen**, con `fotos-sitio.cjs` y la regla de prueba. Las fotos propias de Paco valen: Vietnam tiene muchas de su viaje.
3. **Pasar la checklist:** `node scripts/comprobar-pais.cjs vn` sin ❌ en lo que toca a la web, y `comprobar-nada-atras` ✅.

**Ya está bien:**
- diseño nuevo;
- las 34 fotos con prueba y vistas;
- «Sobre…», «Cómo llegar» y «Dónde comer» revisados con fuentes en los 10 sitios (13 nov);
- 7 historias enlazadas desde la página del país.

**Queda flojo, pero no impide abrir:**
- **Textos de abril sin fuente** en «Qué hacer», «Dónde dormir» y consejos. Ya se quitaron los precios (`sin-precios`).
- **Fichas con fuentes** («Revisado en…»): las hace 📱 App con `scripts/fichas/generar.mjs vn`. Coste **~4 € (2,5-6 €)** por 10 fichas a ~0,40 € cada una. Es opcional para esta tanda, pero sube la confianza de la página.

## 3 · Tamaño recomendado: 11 páginas (país + 10 sitios)
- Las tandas 1 y 2 fueron de 12 y 14 páginas y aún no sabemos cómo las ha tratado Google.
- Mejor pocas páginas con contenido propio que 30 de plantilla: el plan avisa de que muchas páginas flojas de golpe pueden bajar la nota de todo el dominio.
- Vietnam es el único país, aparte de Nepal y Filipinas, con contenido propio de verdad: viaje de Paco en moto, 7 historias y 3 guías.
- Tope del plan: 30 por tanda. Esta se queda muy por debajo.

## 4 · 10 URLs para pedir la indexación a mano en Search Console (en este orden)
Search Console → «Inspección de URLs» → pegar → «Solicitar indexación». Unas 10 al día como máximo.
1. https://borradodelmapa.com/blog/viajes/viajar-a-la-india-donde-se-viene-a-morir — largo en YouTube desde el 17 nov
2. https://borradodelmapa.com/blog/viajes/tailandia-muay-thai-ko-samui — largo nuevo (16 nov)
3. https://borradodelmapa.com/blog/viajes/filipinas-historia-culturas-antes-de-viajar — apertura de Filipinas
4. https://borradodelmapa.com/blog/viajes/tuvalu-se-hunde-asi-se-vive
5. https://borradodelmapa.com/blog/viajes/pueblos-borrados-del-mapa-temporada-1 — se estrena el 19 nov
6. https://borradodelmapa.com/blog/viajes/historia-de-los-tatuajes
7. https://borradodelmapa.com/destinos/filipinas.html — «Conoce Filipinas» con fuentes
8. https://borradodelmapa.com/destinos/nepal.html — «Conoce Nepal» con fuentes
9. https://borradodelmapa.com/blog/viajes/historia-de-vietnam-2000-anos-sin-rendirse
10. https://borradodelmapa.com/destinos/vietnam.html — **solo después de abrir la tanda 3**

## Siguiente paso si Paco dice «sí»
Web hace lo del §2 en local → enseña Vietnam a Paco → con su OK en el chat de Web, ejecuta:
```
node scripts/abrir-tanda.cjs --confirmar vietnam ha-long-vietnam hanoi-vietnam ninh-binh-vietnam phong-nha-vietnam hue-vietnam sapa-vietnam hoi-an-vietnam ho-chi-minh-vietnam dalat-vietnam phu-quoc-vietnam
```
→ sitemap → subida → comprobación → Paco pide la indexación de `destinos/vietnam.html`.
