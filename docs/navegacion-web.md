# NAVEGACIÓN DE LA WEB — una sola puerta: el país (decisión de Paco, 5 nov 2026)

Paco (5 nov 2026, tras el diagnóstico de UX del chat 2): «sí» a las tres propuestas. Esta es la regla para destinos, guías y blog; manda sobre lo anterior.
Cambiarla es decisión de Paco. La aplican el chat 1 (destinos, guías públicas, `build-destinos.js`) y el chat 2 (blog, `build-blog-viajes.js`), con la misma pieza común `scripts/barra-pais.cjs`.

## 1 · Estructura
```
Inicio
 └─ Destinos (lista / mapa de países)            /destinos/
     └─ <País>  ← la «casa» del país              /destinos/<país>.html
         ├─ Conoce     introducción (historia, culturas, datos)     #conoce  (+ artículo «Conoce cada país» del blog)
         ├─ Sitios     páginas de cada sitio                         /destinos/<sitio>-<país>.html
         ├─ Guías      rutas día a día de la app                     /<slug-guía>
         └─ Historias  entradas del blog (una por vídeo)             /blog/viajes/<slug>
```
- **El blog no es un sitio aparte:** es la pestaña «Historias» de cada país. La barra del país (Conoce · Sitios · Guías · Historias) sale arriba en TODAS esas páginas.
- **Miga de pan, siempre igual, por geografía** (Paco, 5 nov 2026, tarde): «Blog de viajes › Destinos › País › Sitio › Historia». Cada historia cuelga de su SITIO (`destino` de blog-viajes-data.js) o, si es de todo el país, del país: «… › Filipinas › Buscalan › Whang-Od», «… › Vietnam › Vietnam hoy». Sin pasos «Sitios» ni «Historias». Lo generan `scripts/barra-pais.cjs` + build-destinos/build-blog-viajes (chat 1).
- **Portada del blog (`/blog/`), solo 2 bloques:** «Historias por país» (tarjeta por país → `/destinos/<país>.html#historias`) y «Consejos de viaje» (las guías prácticas generales, `scripts/blog-guias.json`). Las series, «Conoce cada país», las rutas y las guías viven dentro de su país.

## 2 · Todos los países con la plantilla de Filipinas
Filipinas es el piloto terminado (barra, fotos, Conoce, sitios con foto, historias). **Siguientes: Tailandia y Vietnam** (los que más historias tienen). Hasta que estén, sus historias llevan la barra igual (sus páginas existen) y el chat 1 las completa primero.

## 3 · Quién hace qué
- **Chat 1:** miga de pan sin «Blog de viajes» en país y sitios; barra en todos los países que tengan página; completar Tailandia y Vietnam como Filipinas (fotos, Conoce, sitios, historias).
- **Chat 2:** portada del blog con 2 bloques; miga de las historias «Destinos › País › Historias › título».
- Cada uno enseña su parte a Paco en local antes de subir.
