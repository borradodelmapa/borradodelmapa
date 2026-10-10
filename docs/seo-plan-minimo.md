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
