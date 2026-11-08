# Web Stories (amp-story) — cómo funcionan

Spec: claude.ai/artifact/15qcDFV5oHMUt5CzkCGgzW (8 nov 2026). Enfoque aprobado por Paco el 8 nov 2026. Sistema: 🌍 Web.

- **Qué son:** páginas `amp-story` (carrusel vertical a pantalla completa) que Google enseña en Discover, Búsqueda e Imágenes.
  Viven en `stories/<slug>/index.html` → `borradodelmapa.com/stories/<slug>/`. No tocan la app, Firebase ni el Worker. **0 €.**
- **De dónde salen:** de la MISMA entrada del blog de viajes (`scripts/paises/<país>/historias.js`). Una entrada con
  `story: { portada, slides: [{ foto, h, t, credito?, salida? }] }` tiene su story. 4-8 slides, una idea por slide, frases cortas.
  La última lleva `salida` (texto del botón que abre el artículo `/blog/viajes/<slug>`).
- **Fotos:** las del artículo, ya publicadas en `blog/viajes/img/<slug>/` (no se copian). Solo la portada vertical 3:4
  (≥640×853) se recorta en `stories/<slug>/portada.jpg`. Créditos de las fotos de archivo: los lee del pie de la foto en el
  artículo publicado; si allí no hay pie (p. ej. la portada), van en la slide: `credito: [autor, licencia]`.
- **Generar:** `node scripts/build-stories.js` → stories + `sitemap-stories.xml` (incluido en `sitemap.xml`).
  El artículo enlaza a su story («Verlo en formato story», debajo del vídeo) desde `build-blog-viajes.js`.
- **Excepción del §9 (Paco, 8 nov 2026):** AMP no admite JS propio, así que las stories NO llevan menú de abajo ni aviso de
  instalar. `comprobar-nada-atras.cjs` las revisa aparte: metadatos de `<amp-story>`, portada, botón al artículo, favicon,
  sitemap, y que el artículo enlace a la story.
- **Validar antes de publicar** (desde un ordenador con acceso a `cdn.ampproject.org`; la nube lo tiene bloqueado):
  abrir la story en local con `#development=1` al final de la URL y mirar la consola, o pasar la URL publicada por
  https://search.google.com/test/amp. Después, Inspección de URL en Search Console.
- **Pilotos (8 nov 2026):** `tailandia-carretera-a-pai` (viajes) y `historia-de-vietnam-2000-anos-sin-rendirse` (historia).
  Automatizar el troceo guion→slides, solo después de validar estos dos.
