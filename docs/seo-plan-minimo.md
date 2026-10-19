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
\Hace, en orden y parando al primer fallo: 1) solo entra lo que tiene guía (routes-nivel3); 2) fotos libres de Wikimedia + paisaje cercano;
3) genera SOLO esas páginas (); 4) : título, descripción, un h1, JSON-LD, fotos con alt/tamaño,
og:image, mapa, enlace «Abrir la guía», que la guía pública EXISTA en Firestore, que sus paradas encuentren las fotos libres y cuántas saldrían grises;
5) crea  (hoja de fotos: mirarla 30 s, hay fotos malas que ninguna máquina ve); 6) informe. Coste 0 €, no sube nada.
Después, a mano y con OK de Paco: revisar la hoja → abrir 2-3 guías en la app (tarjetas y pop-up del mapa) →  (añade a
destinos-indexables.json + sitemap) → commit+push (protocolo) →  contra la web → Paco lo ve en su pantalla (§2).
Una página sin guía NO se abre (solo ficha corta); crear la guía cuesta (Google + Anthropic): medir con UNA y avisar a Paco antes (§8).
Trampas ya vividas: GitHub Pages no sirve ficheros que empiezan por ; las fotos de Google de guías viejas dan 404 y la app reintenta con búsqueda de pago;
la PWA guarda la versión vieja (Ctrl+F5 / borrar el service worker para probar).
Pendiente conocido: guías cuyo nombre público no es <destino>-ruta se enlazan en  (lo rellena fotos-destinos.cjs).
