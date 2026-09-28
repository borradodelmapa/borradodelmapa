# Plan de contenidos: blog + redes sociales

> Propuesta del 27 sept 2026 para que Paco la valore. Nada de esto está en marcha todavía.

## La idea en una frase
Paco pone la materia prima (fotos, vídeos, pantalla con Salma, dos líneas de contexto) y Claude hace el resto
(textos, artículos, calendario, programación). Objetivo: **≤ 1 hora a la semana de Paco**.

## Principios
1. **Tú viajas, Salma trabaja.** Lo personal engancha; Salma aparece como la herramienta que usas de verdad,
   no como anuncio.
2. **Reciclar antes que crear.** Un viaje da: 1 artículo de blog + 1 carrusel + 2-3 reels + historias.
   Los 12 artículos de blog que ya existen dan 12 reels de la serie "Salma resuelve".
3. **Por lotes, no a diario.** Un rato a la semana (o un día al mes) y todo queda programado.
4. **Pocas redes, bien.** Mejor dos redes constantes que cinco abandonadas.

## Mezcla de contenido (aprox.)
| Tipo | % | Qué es |
|---|---|---|
| Viaje personal | ~50 % | Fotos y momentos de tus viajes. Historia, no postal. |
| Salma en uso | ~35 % | Grabación de pantalla: le pides algo a Salma → corte a la foto real del sitio. |
| Promoción directa | ~15 % | Novedades de la app, "regístrate gratis", enlace a una ruta. |

## Redes: un solo reel para todas (decidido por Paco, 27 sept)
- Un vídeo vertical **9:16 (1080×1920), 15-60 s**, se publica de una vez desde Metricool en Instagram Reels,
  TikTok, YouTube Shorts y Facebook Reels (y opcionalmente LinkedIn, Threads, Pinterest).
- Reglas para que sirva en todas: sin marca de agua de otra app (Instagram baja el alcance de vídeos con el
  logo de TikTok) · textos en el centro (abajo y a la derecha los tapan los botones) · música sin derechos o
  voz propia (la música de la biblioteca de cada red no viaja con el vídeo) · subtítulos siempre.
- Solo cambia el texto de acompañamiento por red (lo escribe Claude).
- Las fotos también pueden ir en reel (secuencia de fotos con texto) además de en carrusel.
- Programación: **Metricool** (marca `blogId 6868156`). **Conectadas (27 sept): Instagram y TikTok, ambas @borradodelmapa.** Resto de redes, más adelante.

## Formatos fijos (series reconocibles)
1. **"Le pregunto a Salma"** (reel 20-40 s): pantalla del móvil pidiendo una ruta o resolviendo un imprevisto →
   corte a tus fotos/vídeos de ese sitio. El formato estrella: enseña el producto sin venderlo.
2. **"Ruta de N días en X"** (carrusel 6-10 fotos): tus fotos + un texto corto por parada.
   Última lámina: "La ruta entera, en borradodelmapa.com" (enlace a su guía pública).
3. **"Salma resuelve"** (reel): una situación de los artículos que ya existen (vuelo cancelado, pasaporte
   robado, sin hotel de noche…) → enlace al artículo del blog.
4. **"Diario de ruta"** (historias): el día a día mientras viajas; no hace falta pulirlo.
5. **"Construyendo Borrado"** (1-2 al mes): cómo trabajas, qué has mejorado, errores. La gente sigue a personas.

## Blog
- Ritmo: **2 artículos al mes**.
- Dos líneas nuevas además de los artículos de "problemas":
  - **Diario de ruta:** un viaje tuyo con tus fotos + la ruta que hizo Salma enlazada (`/?ruta=<slug>`;
    sin cuenta se ve el avance, con cuenta la ruta entera — política §10 de CLAUDE.md).
  - **Cómo viajo con Salma:** trucos concretos de uso (qué pedirle, cómo guardar, WhatsApp…).
- Cada artículo nuevo necesita (técnico, lo hace Claude con OK de Paco): copia de cabecera/menú (§9 de
  CLAUDE.md), alta en `blog/index.html` y `sitemap-blog.xml`, fotos comprimidas en `blog/img/`.
  Propuesta: una plantilla o un pequeño generador para que añadir un artículo sea un solo paso.

## Semana tipo
| Día | Publicación |
|---|---|
| Martes | Reel "Le pregunto a Salma" o "Salma resuelve" |
| Jueves | Carrusel "Ruta de N días" o foto personal |
| Domingo | Personal / "Construyendo Borrado" |
| Cuando viajas | Historias sueltas, sin programar |

## Qué hace cada uno
**Paco (≤ 1 h/semana):**
- Subir a una carpeta compartida (p. ej. Google Drive, que Metricool lee directo) fotos/vídeos del viaje.
- Grabar la pantalla del móvil cuando usas Salma de verdad (no hace falta editar).
- Una nota de voz o 3 líneas por lote: dónde, qué pasó, qué te sorprendió.
- Revisar y aprobar lo programado (Metricool avisa al móvil).

**Claude:**
- Textos de publicaciones, hashtags, primeros comentarios.
- Borradores de artículos del blog con tu voz (tú corriges y apruebas).
- Calendario del mes y programación en Metricool (como borrador o "para revisión").
- Ideas de reels con guion de 3 tomas cuando haga falta.
- Una vez al mes: qué ha funcionado (analíticas de Metricool) y ajustar.

## Ideas para valorar
- **"Comenta un destino y te paso la ruta":** respondes con el enlace a una guía hecha con Salma. Atrae registros.
  ⚠ Coste (§8): cada ruta nueva es una llamada a Claude Sonnet + Google Places (unos céntimos por ruta);
  con 20-50 al mes, del orden de 1-5 €. Reutilizar guías ya hechas cuesta 0.
- **Enlace de la bio** a una página "mis rutas" con tus guías públicas.
- **Rutina automática mensual** en la nube: Claude prepara el calendario del mes siguiente y te avisa.
- Newsletter: de momento no (más carga); se revisa en 3 meses.

## Costes
- Nada del plan toca APIs de pago de la app salvo la idea de "comenta y te paso la ruta" (arriba).
- Metricool: revisar qué cubre el plan gratuito (número de publicaciones programadas/mes) antes de pagar.

## Primeros pasos
1. Paco decide redes (propuesta: Instagram + TikTok) y conecta las cuentas en Metricool:
   https://app.metricool.com/brands/connections?blogId=6868156
2. Paco sube un primer lote: fotos de 1 viaje + 2-3 grabaciones de pantalla con Salma.
3. Claude prepara 2 semanas de publicaciones + 1 artículo "Diario de ruta" como borradores.
4. Revisar juntos, ajustar el tono, y a partir de ahí ritmo semanal.

## Estado (27 sept 2026) — dónde lo dejamos
- Decidido: Instagram + TikTok (conectadas en Metricool), un reel para todas. Primer tema: **N222 / N2 en moto** (público motero).
- Pendiente de Paco: cambiar la zona horaria de la marca en Metricool (está en Lisboa → Madrid).
- Siguiente paso: Paco pasa las fotos/vídeos **desde el ordenador**. Lo más fácil: copiarlas del móvil a una
  carpeta del portátil (fuera del repo, ya creada: `C:\Users\User\Desktop\borrado contenido`) y abrir una sesión de
  Claude Code en el portátil: lee la carpeta directamente, sin subir nada. Alternativa: carpeta de Drive con enlace.
- Claude entonces: leer EXIF (fecha, GPS), clasificar por país/región/día con geocodificación **offline gratuita**
  (nada de Google Maps, §8), reconstruir la ruta, elegir las mejores y preparar 2 semanas de publicaciones.
