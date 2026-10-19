# Mini plan SEO (10 oct 2026)

Decisión de Paco (10 oct): "quiero que se suban y se indexen". Se hace **por tandas**, no las 1.793 de golpe:
si Google ve miles de páginas de plantilla de golpe, puede bajar la valoración de todo el dominio.

## Tanda 1 — HECHA (10 oct)
Nepal completo (país + 10 destinos, las únicas con ruta) + el índice `/destinos/`. Están en
`scripts/destinos-indexables.json`; el resto sigue `noindex` y fuera del sitemap. `sitemap.xml` enlaza ya
`sitemap-destinos.xml` (12 URLs). Cómo abrir otra tanda: añadir slugs al JSON → `node scripts/build-destinos.js` → push.

## Lo que tiene que hacer Paco (10 min, sin esto no vemos nada)
1. Search Console (search.google.com/search-console) → añadir propiedad de dominio `borradodelmapa.com` → verificar por DNS (Netlify).
2. Enviar `https://borradodelmapa.com/sitemap.xml`.
3. Inspeccionar 2-3 URLs de Nepal y pedir indexación.

## Calendario
- **Semana 0-2:** mirar en Search Console si Nepal se indexa y con qué errores. Nada más sale hasta ver eso.
- **Semana 2-4:** Tanda 2 = Bloque A (28 destinos, ver `docs/seo-destinos-prioritarios.md`) **después** de enriquecerlos
  (itinerario 3 días con ruta, h2, FAQ). Antes de abrir cada tanda: presupuesto de coste (§8).
- **Mes 2:** crear los 30 países que faltan (Italia, Portugal, Japón, Marruecos, México, Perú…) y abrirlos.
- **Continuo:** guías públicas buenas (`isGood()` de `build-guias.js`) pasan a `index`; sitemap de guías enlazado.

## Qué mirar cada semana
Páginas indexadas · impresiones y clics por página · consultas que traen visitas · registros nuevos desde esas URL.
Regla: si una tanda no se indexa o se hunde en 3-4 semanas, no se abre la siguiente; se mejora el contenido.

## Antes de abrir o dar por buena CUALQUIER tanda (regla desde el 19 oct 2026, tras ver la guía de Everest rota en la app)
Una página de destino no está terminada cuando se ve bien ella sola: hay que comprobar **todo el recorrido de quien llega**.
1. `node scripts/fotos-destinos.cjs <slug>` (baja fotos de Wikimedia, 0 €) y, si quedan paradas sin foto, `--completar <slug>` (paisaje cercano). **Mirar las fotos** una a una (hay malas: retratos, mapas, fotos de otro sitio).
2. `node scripts/build-destinos.js --country <código>` y revertir con `git checkout` las páginas del país que NO son de la tanda (no mezclar).
3. `node scripts/verificar-destinos.cjs --local` → debe salir todo ✅ (título, descripción, sin «IA», un h1, canonical, JSON-LD, fotos con alt y tamaño, og:image, mapa, enlace «Abrir la guía»).
4. Subir (protocolo) y repetir `node scripts/verificar-destinos.cjs` contra la web publicada.
5. **Abrir «Abrir la guía» de cada página en la app** (lo que ve la persona): ¿carga el mapa?, ¿tiene foto cada parada? Opcional `--google` prueba las fotos de Google de la guía (~0,007 $ por foto no cacheada: avisar a Paco, §8).
6. Paco lo ve en su pantalla (§2).
Pendiente conocido: las guías de la app usan fotos de Google (`photo_ref`) que a veces ya no responden (404) → icono gris. Arreglo propuesto: que la app use la foto de Wikimedia (`destinos/img/<slug>/fotos.json`) cuando la de Google falla.
