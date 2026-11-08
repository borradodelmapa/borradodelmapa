# 🌍 WEB — manual del sistema (lo mantiene el chat 🌍 Web)

## 1 · Para qué sirve
Toda la **web pública**: páginas de país y de sitio (`destinos/`), guías públicas, blog e historias. Diseño, maqueta, navegación, fotos, textos y SEO.
**No hace:** vídeos ni redes (🎬; Vídeo solo pasa el contenido de cada historia como datos en `scripts/paises/<país>/historias.js`), la app ni el Worker (📱), ni decide qué país va ahora (📈).
**Trabaja en modo producción** (`docs/sistemas.md`): dos paradas por lote, ⏸1 al aprobar el lote y su presupuesto, ⏸2 en la revisión final antes de publicar.

## 2 · Lo que sabe del proyecto (documentos que mandan)
| Tema | Documento |
|---|---|
| Navegación de la web (decisiones de Paco) | `docs/navegacion-web.md` |
| Protocolo web de un país (piloto Filipinas, tiempos) | `docs/paises/PROTOCOLO-pais-web.md` |
| Expediente de país (plantilla + ejemplo) | `docs/paises/PLANTILLA-expediente.md`, `docs/paises/filipinas-expediente.md` |
| Plan y estado de un país | `docs/paises/<pais>.md` · mapa de páginas: `docs/paises/filipinas-mapa-web.md` |
| SEO: tandas, guías públicas, blog | `docs/seo-plan-minimo.md`, `docs/seo.md`, `docs/seo-destinos-prioritarios.md` |
| Reglas de la web en CLAUDE.md | §9 (menú y cabecera = una sola cosa; «nada se queda atrás»), §10 (acceso), §12 (un solo mapa) |
| Vídeo de cada historia (lo manda 🎬) | `docs/video-checklist.md` (P12: un vídeo = una entrada) |

**Decisiones de Paco vigentes:**
- **Un país = una casa.** Entres por donde entres, la **barra del país** (logo pequeño · País · Sitios · Guías · Historias), con la cabecera de una línea.
- **Miga de pan por geografía:** «Blog de viajes › Destinos › País › Sitio › Historia». Cada historia cuelga de su sitio (o del país, si es de todo el país).
- **Dos puertas:** el **Blog** para leer (Historias por país, Pueblos borrados del mapa, Consejos plegados, «Todos los países →») y **Destinos**, el catálogo y control de todos los países (su diseño lo pensará Paco: de momento no se toca, solo que enlace bien).
- **Destinos y guías públicas se enseñan COMPLETAS** (§10); la app (`?ruta=`) sigue con el avance «día 1 + candado».
- **El mapa y el botón de cada sitio abren nuestra guía** en la app (la que pasa por ahí o la del país), nunca Google Maps si hay guía.
- **Fotos:** solo de Wikimedia o de los episodios, **revisadas una a una**, con su autor; mejor sin foto que con una de otro sitio. Ningún país sale con el diseño nuevo sin sus fotos revisadas.
- **Explorar** (app) es el mapa de guías; las guías públicas cuentan en Explorar.
- **Textos públicos:** nunca «IA»; datos con fuente y fecha; lo dudoso no se afirma.

## 3 · Recursos ya creados
| Recurso | Para qué |
|---|---|
| `scripts/build-destinos.js` (`--country cc`, `--only`, `--index-only`, `--sitemap-only`) | Páginas de país y sitio. Datos: `worker/kv/output-nivel2/<cc>.json` (KV, fuera de git) + `scripts/paises/<país>/sitios-nuevos.json` (sitios añadidos), `scripts/paises/<país>/intro.json` («Conoce»), `scripts/paises/<país>/sitios-extra.json` («Sobre», avisos, diario) |
| `scripts/barra-pais.cjs` | La barra del país y la miga: **una sola pieza** para destinos e historias; no escribir otra |
| `scripts/build-blog-viajes.js` + `scripts/blog-viajes-data.js` (series; junta las historias de cada país) | Portada del blog e historias |
| **`scripts/paises/<país>/`** + `scripts/datos-pais.cjs` | **Los datos web de cada país, uno por carpeta** (`intro.json`, `sitios-extra.json`, `sitios-nuevos.json`, `historias.js`, `rutas.json`): un chat de país solo escribe en la suya. Detalle en la cabecera de `datos-pais.cjs` |
| `scripts/build-guias.js` | Páginas fijas de las guías públicas (también lo pasa una Action cada noche) |
| `scripts/fotos-destinos.cjs <slugs>` | Foto de portada de cada sitio desde Wikimedia (0 €), con `destinos/img/<slug>/fotos.json` |
| Hoja de contactos con ffmpeg (`salma marketing/india/herramientas/…/ffmpeg.exe`) | Revisar fotos a ojo antes de usarlas |
| `probar-chat.cjs` → `crear-guia.cjs "<País>"` → `guardar-guia.cjs` → `publicar-guia.cjs <id>` | Guía nueva con la app (0,4-1 € por guía de 3-5 días) |
| `node scripts/abrir-tanda.cjs <slugs>` · `--confirmar` | Abrir páginas a Google (máx. 30 por tanda) |
| `node scripts/verificar-destinos.cjs` | Título, h1, JSON-LD, fotos, mapa y guía de cada página |
| `node scripts/comprobar-nada-atras.cjs` | Que ninguna página se quede vieja (0 €). **Siempre antes de subir** |
| Search Console (Chrome de Paco, cuenta paco.defoto) | Indexación, impresiones y clics; pedir indexación de páginas sueltas |

## 4 · Protocolos (listas de tareas)
### País completo
1. ⏸1 **Lote:** país, piezas (expediente, guías, sitios nuevos, fotos) y presupuesto con rango (guías 0,4-1 € c/u; lo demás 0 €).
2. Expediente con la plantilla: 8 apartados, cada dato con fuente, ⚠ lo dudoso.
3. Guías del país (protocolo «Guía nueva»).
4. «Conoce <país>» en `paises/<país>/intro.json` (hilo, 6 bloques, fotos revisadas, fuentes).
5. Cada sitio (protocolo «Sitio»); sitios que falten, en `paises/<país>/sitios-nuevos.json` (los «menos turísticos», destacados).
6. `build-destinos.js --country cc` → probar en local (móvil y escritorio, recorrido desde el blog) → `comprobar-nada-atras` ✅.
7. ⏸2 **Revisión final:** página de revisión con enlaces a todo (país, sitios, guías, historias) → «publica» → push → comprobar que la web lo sirve.

### Sitio
1. Foto de portada (`fotos-destinos.cjs`) → revisarla a ojo; si es mala, un archivo concreto de Commons.
2. Fotos de «Qué hacer»: candidatas por actividad → hoja de contactos → elegir; sin foto si ninguna es del sitio.
3. «Sobre…» con fuentes, avisos de datos que han cambiado, diario del blog → `paises/<país>/sitios-extra.json`.
4. Regenerar el país → comprobar en local. (Entra en la ⏸2 del lote.)

### Guía nueva
1. `probar-chat.cjs` con el plan (destino = el **país**, nunca una región) → `crear-guia.cjs "<País>"`.
2. Comparar paradas con las pedidas y los textos con el expediente y el blog; corregir el JSON (título, datos viejos, orden).
3. `guardar-guia.cjs` → en la ⏸2, `publicar-guia.cjs <id>` → la página fija sale con la Action; comprobar que cuenta en Explorar.

### Historia
1. 🎬 pone los datos en `scripts/paises/<país>/historias.js` (con su `orden`) (texto, fotos, vídeo, `destino` = su sitio).
2. `build-blog-viajes.js` → comprobar en local: barra del país, miga con su sitio, enlace desde el sitio («en nuestras historias») y desde el país.
3. **Web Story** (P15 de la checklist de vídeo, Paco 9 nov 2026): campo `story` en la misma entrada → `build-stories.js` → mirarla en local. Toda historia con vídeo la lleva.
4. `comprobar-nada-atras` ✅ → ⏸2 → push.

### Tanda a Google
1. Solo páginas ya publicadas y revisadas; máx. 30 por tanda.
2. `abrir-tanda.cjs --confirmar <slugs>` (index + sitemap) → `comprobar-nada-atras` ✅ → push.
3. Search Console: pedir indexación de 3-4 páginas clave; mirar indexadas y clics a las 2-4 semanas antes de abrir la siguiente.

## 5 · Estado ahora (5 nov 2026)
| Qué | Estado |
|---|---|
| Filipinas: país + 13 sitios (Banaue, Batad, Buscalan nuevos), 2 guías, 5 historias | Publicado con el diseño nuevo · abierto a Google (tanda 2) · indexación pedida para 4 páginas |
| Vietnam: 10 sitios con foto, barra, «en nuestras historias» | Publicado · falta su expediente y «Conoce» |
| Blog: portada (Historias por país, Pueblos, Consejos plegados), historias con barra y miga por sitio | Publicado |
| Los 163 países (1.795 páginas) | **Mismo diseño y navegación que Vietnam** (5 nov, cd5fa2b64). 692 sitios con portada revisada (110 rechazadas: aeropuertos, estadios, satélite, carteles, personas); los ~940 restantes sin foto: Wikimedia no dio una buena, buscarla a mano |
| Guías públicas con la barra del país | Pendiente |
| Diseño de la página Destinos | Lo decide Paco más adelante |
| Search Console | En la cuenta de Paco; datos desde el 11 oct (39 indexadas, 357 impresiones) |
