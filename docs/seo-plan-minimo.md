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

## Cómo se abre una tanda (regla desde el 19 oct 2026) — UN comando, se para si algo falla
```
node scripts/abrir-tanda.cjs <slug> [<slug> …]      (o --siguientes 20; tope 30 por tanda)
```
Hace, en orden y parando al primer fallo:
1. Solo entra lo que tiene guía (`worker/kv/routes-nivel3/<slug>.json`).
2. Fotos libres de Wikimedia + paisaje cercano (`scripts/fotos-destinos.cjs`).
3. Genera SOLO esas páginas (`build-destinos.js --only`).
4. `verificar-destinos.cjs`: título, descripción, un h1, JSON-LD, fotos con alt y tamaño, og:image, mapa, enlace «Abrir la guía», que la guía pública EXISTA en Firestore, que sus paradas encuentren las fotos libres y cuántas saldrían grises.
5. Crea `_revision-tanda.html` (hoja de fotos: mirarla 30 s; hay fotos malas que ninguna máquina ve).
6. Informe. Coste 0 €. No sube nada.

Después, a mano y con OK de Paco: revisar la hoja → abrir 2-3 guías en la app (tarjetas y pop-up del mapa) → `node scripts/abrir-tanda.cjs --confirmar <slugs>` (añade a `destinos-indexables.json` y regenera el sitemap) → commit + push (protocolo) → `verificar-destinos.cjs` contra la web → Paco lo ve en su pantalla (§2).

- Una página sin guía NO se abre (solo es una ficha corta). Crear su guía cuesta (Google + Anthropic): medir con UNA y avisar a Paco antes (§8).
- Trampas ya vividas: GitHub Pages no sirve ficheros que empiezan por `_`; las fotos de Google de guías viejas dan 404 y la app reintenta con búsqueda de pago; la PWA guarda la versión vieja (Ctrl+F5, o borrar el service worker para probar).
- Guías cuyo nombre público no es `<destino>-ruta` se enlazan en `destinos/img/guias-publicas.json` (lo rellena `fotos-destinos.cjs`).

## Reglas de fotos (20 oct 2026, tras ver un pájaro como foto de «Parque Nacional de Chitwan»)
- Mejor **sin foto** que una foto de otro sitio. El «paisaje cercano» solo vale si el título del archivo contiene el nombre de la parada (`scripts/limpiar-fotos.cjs`; `fotos-destinos.cjs --completar` y `verificar-destinos.cjs` lo aplican). Excepción documentada: `ok_manual: true` en esa parada.
- Si varias paradas se llaman igual (en Chitwan, cuatro «Parque Nacional de Chitwan»), la foto va **por posición**: `fotos.json` → `porIndice: {"0": {...}}` (0 = primera parada). Tiene prioridad sobre el nombre. Lo leen las páginas, las tarjetas y los pop-up de la app.
- Cada vez que cambien `fotos.json`, `ficha.json` o `guias-publicas.json`: subir `_datosV` en `mapa-itinerario.js` (la app los pide con `?v=`). GitHub Pages guarda los ficheros 10 min: una copia vieja que apunte a fotos borradas daría imágenes rotas. Y no borrar del repo las fotos viejas hasta pasados unos días.
- Para elegir foto de una experiencia, buscar con el nombre de la experiencia («rhinoceros Chitwan», «jeep safari Chitwan»), no solo con el nombre de la parada.
