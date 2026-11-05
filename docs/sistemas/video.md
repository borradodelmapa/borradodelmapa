# 🎬 VÍDEO — manual del sistema (lo mantiene el chat 🎬 Vídeo)

## 1 · Para qué sirve
Hacer los vídeos del canal (shorts de serie, documentales largos 16:9, aperturas de país y shorts derivados) y publicarlos en redes (YouTube + TikTok con Metricool).
**No hace:** diseño, maqueta ni navegación de la web (eso es 🌍 Web: a la web solo le paso **contenido como datos** en `scripts/blog-viajes-data.js`), la app ni el Worker (📱 App), ni decide qué país va ahora (📈 Estrategia).
**Trabaja en modo producción** (Paco, 5 nov 2026): por lotes, con **dos paradas** — ⏸1 aprobar el lote y su presupuesto · ⏸2 revisión final de todo antes de publicar.

## 2 · Lo que sabe del proyecto (documentos que mandan)
| Tema | Documento |
|---|---|
| **Reglas de vídeo (fuente única, manda sobre todo)** | `docs/video-checklist.md` — leer entera antes de tocar nada; `node scripts/comprobar-checklist-video.cjs` antes de subirla |
| Parrilla del canal, calendario y estimación de 193 países | `docs/programacion-canal.md` |
| Serie «Pueblos borrados del mapa» (episodios, carpetas, R2) | `docs/serie-pueblos-borrados.md` |
| Plan de cada país (L2) | `docs/paises/<país>.md` (piloto: `filipinas.md` + `filipinas-expediente.md`, guion y estructura de la apertura) |
| Qué se ha publicado y dónde | `docs/publicaciones-registro.md` |
| Sistemas y tablón | `docs/sistemas.md` |

**Decisiones de Paco vigentes (las principales; el detalle está en la checklist):**
- **Nicho (L1):** «Culturas que se están borrando del mapa», con datos y fuentes y cómo visitarlas con respeto; nunca «mira qué raros». Título: «<Pueblo> · Pueblos borrados del mapa».
- **Por países (L2):** cada país sale completo y abre con una introducción (web + vídeo de apertura 16:9 + shorts derivados).
- **Calendario (P13):** solo martes a jueves a las 10:00 Madrid, una pieza al día en YouTube y TikTok.
- **Documentales largos:** completos en YouTube y TikTok (P6/P10); varios avisos de seguir (M13 en lista).
- **Narración:** Salma solo datos con fuente, sin relleno ni moraleja (N6); voz `SALMA` en shorts y `SALMA_DOC` en documentales largos y aperturas.
- **Imagen:** persona en portada y primer fotograma (M15); fotos revisadas una a una (F9); niños con respeto y nunca en portada (P4).
- **Sonido:** golpes del *batok* en el «sígueme» de todo el canal (M13); sintonía documental en mapa y tarjeta (S3), también en aperturas.
- **Publicar:** vídeo, descripción y primer comentario siempre juntos (P6); marca de contenido con IA en los ajustes, nunca «IA» en el texto (P1); autores de las fotos en el comentario (P2); SEO de YouTube Y2-Y9.
- **Coste dicho antes** (CLAUDE.md §8): en modo producción, con el presupuesto del lote.

## 3 · Recursos ya creados
| Recurso | Dónde | Para qué |
|---|---|---|
| **Motor** (un solo motor, no escribir otro) | `salma marketing/india/motor/motor.cjs` + un config por vídeo (`<episodio>.cjs`) | Monta el vídeo: voz, subtítulos ES/EN, Ken Burns y paneos, cifras, sígueme, tarjeta, portada; `cfg.formato = '16:9'` para horizontal |
| **Informe de reglas** | `motor/reglas.cjs` (sale solo al montar) | Comprueba las reglas «motor» de la checklist; **sin ❌ antes de entregar** |
| **Editor** de Paco | `motor/editor/server.cjs <episodio>` · puertos 8098 Whang-Od · 8102 Sagada · 8104 haenyeo · 8105 konyak · 8106 moken · 8107 sentineleses · 8108 ainu · 8109 mosuo · 8110 dukha · 8111 águila (configs en `.claude/launch.json`) | Paco cambia fotos, portada y encuadres; se guarda en `editor/overrides-<episodio>.json` y se aplica siempre; «★ Exportar para publicar» = calidad máxima en `ULTIMA/` |
| **Voces** | `motor/voces.cjs` (`SALMA`, `SALMA_DOC`, `PACO`) | ElevenLabs; la voz ya generada queda en caché (remontar = 0 €) |
| **Sonidos** | `motor/sfx/` (`sigueme-batok.mp3`, `sintonia-pueblos.mp3`, viento, pájaros, olas…; créditos en `pueblos/comun/sonidos/creditos.txt`) | Sígueme, sintonía, ambiente con licencia |
| **Clip común de la app** | `pueblos/comun/clip-app.mp4` (vertical) · `clip-app-16x9.mp4` (horizontal) | M16, antes de la tarjeta |
| **Portadas** | `motor/portada.cjs` (`generar` vertical, `generarH` 16:9) | Banda naranja + franja negra; también portadas del blog |
| **Mapas** | `mapa.cjs` (vertical) y uno por episodio (`mapa-<pueblo>.cjs`); 16:9: `mapa-tatuajes.cjs`, `mapa-filipinas.cjs` (vuelo, ruta, mundo plano y placas+volcanes con `datos/pb2002-boundaries.json`) | Mapas animados, 0 € |
| **Fotos** | `motor/fotos-categoria.cjs` (bajar una categoría de Wikimedia con autor y licencia) · `hoja-regenerar.cjs` (hoja de contactos con propuesta por escena) · `fotos-grandes.cjs` | Bancos por episodio en `<carpeta>/fotos/` con `ATRIBUCIONES.txt` y `descartadas-otro-sitio/NOTA.txt` |
| **Publicar** | `node scripts/publicar-episodio.cjs <slug>` | Vídeo ligero de la web, portada del blog, blog regenerado y comprobado, paquete de textos de redes (`ULTIMA/textos-redes.txt/.json`) |
| **Almacén de vídeos** | Cloudflare R2 `borrado-videos-redes` (URL pública en la memoria `reference_r2_videos_redes.md`) | De ahí lo recoge Metricool |
| **Metricool** | marca `borradodelmapa` (id 6868156, Madrid) | Programar YouTube + TikTok con descripción y primer comentario |
| **Plantillas de guion** | `docs/pueblos-ep2-sagada-guion-direccion.md` (short) · `docs/tatuajes-documental-guion-direccion.md` (largo) · `docs/paises/filipinas-apertura-guion-direccion.md` (apertura) | Guion de dirección por escena |

## 4 · Protocolos (listas de tareas)
Cada uno: **⏸1** aprobar el lote y su presupuesto (voz y, si la hay, Runway) → trabajo sin paradas → **⏸2** revisión final de todo → publicar. Las dudas que son de Paco (dato dudoso, niños, tema delicado) se apuntan para ⏸2.

### Short de serie (60-95 s, vertical)
1. Tema del plan de la serie (L1); fuentes (F4): lo dudoso no va a la voz.
2. Guion de dirección por escena con 2 ganchos de 20 s (G1, N1-N9).
3. Fotos: `fotos-categoria.cjs` → revisión una a una (F9/P4) → hoja de contactos con propuesta.
4. Mapa (`mapa-<pueblo>.cjs`, copia del último) y config del motor.
5. Montar → **informe sin ❌** → arreglar avisos que se puedan (planos largos, M15 en el primer fotograma).
6. Entrada del blog como datos en `blog-viajes-data.js` (🌍 la maqueta) + `publicar-episodio.cjs`.
7. **⏸2:** Paco ve el vídeo en su editor, la hoja de fotos, la entrada y el paquete de redes → «★ Exportar».
8. R2 → Metricool (vídeo + descripción + primer comentario, marca IA) → comprobar en cada red → `publicaciones-registro.md`.
**Comprobador:** informe de reglas del motor sin ❌ + checklist pasada punto a punto (P5).

### Documental largo (6-12 min, 16:9)
1. Fuentes y guion por bloques con el hilo del documental; gancho «en frío» de 30-45 s.
2. Fotos por bloque (F9), mapas 16:9 (`mapa-tatuajes.cjs` como base), gráficos propios si hacen falta.
3. Config con `formato: '16:9'`, voz `SALMA_DOC`, `seguir` en lista al empezar los mapas, sintonía, clip de la app 16:9.
4. Montar → informe sin ❌ → capítulos (Y6) → portada `generarH`.
5. Entrada del blog (datos) y paquete de redes con capítulos.
6. **⏸2** → exportar → R2 → Metricool (YouTube + TikTok completos).
**Comprobador:** informe sin ❌ + Y2-Y9 + checklist.

### Apertura de país (6-8 min, 16:9)
1. Parte del expediente aprobado del país (🌍 Web lo escribe): solo datos sin ⚠.
2. Guion con los 8 apartados de L2 = capítulos; 3 ganchos para elegir.
3. Fotos del país + las ya revisadas de sus episodios (`FILE:`).
4. Mapas con `mapa-<país>.cjs` (archipiélago/país, geología, rutas, pueblos).
5. Config como el documental largo → montar → informe sin ❌.
6. Pasar a 🌍 el vídeo ligero para la historia «Conoce cada país» (solo el dato `video`).
7. **⏸2** → exportar → R2 → Metricool.
**Comprobador:** informe sin ❌ + checklist (L2, S3, M16 en 16:9).

### Short derivado (40-70 s, vertical, de un largo o una apertura)
1. Elegir el bloque y su gancho de 20 s (uno de los ganchos que no se usaron, G7).
2. Config vertical con los mismos planos y la voz del bloque (ya pagada); frase nueva solo para el gancho.
3. Mapa en versión vertical si sale; montar → informe sin ❌.
4. Paquete de redes con enlace al largo (Y14: «vídeo relacionado», a mano en YouTube Studio).
5. **⏸2** → R2 → Metricool.
**Comprobador:** informe sin ❌ + checklist.

## 5 · Estado ahora (5 nov 2026)
| Qué | Estado |
|---|---|
| Programado en Metricool | Vietnam 3/5-5/5 (5, 10 y 11 nov) · Pueblos T1 del 12 nov al 3 dic · Tatuajes del mundo jue 10 dic (lo monta otra sesión) |
| Filipinas · apertura 16:9 | Montada v1 (6:45, sin ❌, sintonía, clip de la app 16:9); en la web con su vídeo en borrador · falta ⏸2, cambiar la foto del barquero (P4) y exportar |
| Filipinas · los ifugao | Montado v1 (122 s, sin ❌); en la web · falta ⏸2 y exportar |
| Filipinas · shorts derivados (3-4) | Sin empezar (volcanes, galeón, *baybayin*) |
| Filipinas · redes | Fecha por decidir (Paco); huecos libres desde el mar 8 dic |
| Checklist: reglas propuestas Y10-Y16 y G2-G8 | En `docs/programacion-canal.md`, esperan el OK de Paco |
