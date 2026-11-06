# LOS CUATRO SISTEMAS — cómo se trabaja en paralelo (Paco, 5 nov 2026)

Sustituye a «tres chats» (4 nov). Paco: reorganizar el trabajo en **cuatro sistemas**, cada uno en su chat:

| | Sistema | Su trabajo en una frase |
|---|---|---|
| 🎬 | **Vídeo** | Crear, editar y publicar vídeos. |
| 🌍 | **Web** | Crear las mejores páginas de destinos del mundo. |
| 📱 | **App** | Desarrollo e incidencias de Borrado del Mapa. |
| 📈 | **Estrategia** | Decidir qué hacer, cuándo hacerlo y por qué. |

**Un chat por sistema, nunca dos del mismo.** Lo que es de otro sistema se le pide, no se toca.
Este archivo es **zona común** (como `CLAUDE.md` y `docs/video-checklist.md`): ediciones pequeñas, nunca reescribirlo entero.

## Qué hace y qué toca cada sistema
| Sistema | Hace | Toca | NO toca (lo pide) | Dónde trabaja |
|---|---|---|---|---|
| 🎬 **Vídeo** | Guiones, fotos, voz, montaje con el motor, paquete de textos, programar en Metricool (YouTube + TikTok), checklist de vídeo (SEO de YouTube, gancho de 20 s), métricas del canal. A la web solo le pasa **el contenido** de cada historia (texto, fotos, vídeo) | `salma marketing/`, `docs/video-checklist.md`, `docs/serie-*.md`, `docs/publicaciones-registro.md`, `docs/programacion-canal.md`, `scripts/paises/<país>/historias.js` (solo datos de historias), `publicar-episodio.cjs` | Cualquier generador o maqueta de la web, `worker/`, `app.js` | Carpeta principal (el motor y los vídeos no están en git) |
| 🌍 **Web** | **Toda la web pública** con un solo diseño: páginas de país y de sitios, guías públicas, blog e historias, navegación, fotos, SEO, Search Console, tandas a Google, guías nuevas (cuentan en Explorar) | `scripts/build-destinos.js`, `build-guias.js`, `build-blog-viajes.js`, `abrir-tanda.cjs`, `barra-pais.cjs`, `destinos-indexables.json`, `destinos/`, `blog/`, sitemaps, `docs/seo*.md`, `docs/paises/*` (la parte web) | `worker/` y el prompt, `app.js`, `salma marketing/`, la checklist de vídeo | Su worktree (rama propia) |
| 📱 **App** | Casos del panel admin (`node scripts/casos.cjs hoy`), fallos y mejoras de la app y de Salma, Worker y despliegues, salud diaria (web, `/version`, errores 🤖) | `app.js` y los `.js` de la raíz, `index.html`, `worker/` (prompt incluido, con su skill), `scripts/casos.cjs`, despliegues | `salma marketing/`, generadores y maqueta de la web | Cada arreglo en su worktree (`.claude/worktrees/caso-…`) |
| 📈 **Estrategia** | El **plan**: qué país va ahora y cuál después, calendario de web + vídeo por país (L2), prioridades de cada sistema, coste mes a mes, mirar los números (Search Console, YouTube Studio, TikTok, Metricool, registros en la app) y proponer a Paco qué cambiar y por qué | `docs/estrategia/` (plan, calendario, informes semanales), `docs/paises/<país>.md` (el plan del país), la hoja de ruta (Gantt) | **Ningún código ni contenido**: no monta, no publica, no despliega. Encarga a los otros tres | Solo lee; escribe solo en sus docs |

## CHATS DE PAÍS: uno por país, temporal (Paco, 5 nov 2026: «me gustaría trabajar en varios países a la vez»)
Desde que estén listas las tres piezas de abajo («Antes de abrir el primero»), los países ya no los hacen Web y Vídeo:
- **Chat de país** (p. ej. «🇲🇦 Marruecos»): lo abre 📈 Estrategia con `/pais <País>` tras el «sí» de Paco al lote. Hace **todo ese país**
  (web y vídeo) con `docs/paises/PROTOCOLO.md`, en **su propio worktree**. **Usa las herramientas pero no las cambia**: si una falla o
  se puede mejorar, lo apunta en `docs/paises/MEJORAS.md` y se lo pide a la fábrica. Solo escribe en **los ficheros de su país**.
  Al terminar: lista «Terminado» del protocolo → sus mejoras en `MEJORAS.md` → Estrategia lo **archiva** (no se borra: queda para consultar).
- **🌍 Web y 🎬 Vídeo pasan a ser las FÁBRICAS:** mantienen y mejoran las herramientas que usan los países (generadores, diseño, `barra-pais`,
  fotos; motor, editor, mapas, voces, checklist) y aplican las mejoras de `MEJORAS.md`. Vídeo sigue llevando las series que no son de un
  país (Pueblos T1, Tatuajes…) y Metricool.
- **📈 Estrategia reparte lo que es de todos:** huecos de Metricool, las 30 páginas por tanda de Google, el presupuesto y la cola de
  revisiones de Paco. Un chat de país nunca coge eso por su cuenta.
- **Como mucho 2-3 países a la vez y escalonados** (uno produce, otro en revisión, otro arranca): comparten el límite de uso de Claude
  y la revisión final de Paco es el cuello de botella.
- **Publicar es en fila:** cada chat de país hace `git fetch` + rebase justo antes de subir; si dos van a la vez, Estrategia dice quién primero.

### Antes de abrir el primero (si no, dos países chocan)
| # | Qué | Fábrica | Estado |
|---|---|---|---|
| 1 | **Datos de la web por país:** un fichero por país en lugar de los comunes (`paises-intro.json`, `destinos-extra.json`, `blog-viajes-data.js`…), que los generadores leen juntos. Así dos países nunca editan el mismo fichero | 🌍 Web | **hecho 5 nov**: `scripts/paises/<país>/` (`intro.json`, `sitios-extra.json`, `sitios-nuevos.json`, `historias.js`, `rutas.json`), leídos por `scripts/datos-pais.cjs`; web regenerada idéntica (diff) |
| 2 | **El motor de vídeo al alcance de un worktree:** el código del motor y los recursos ligeros en git; lo pesado (fotos, vídeos, voces) se queda en la carpeta principal con ruta fija. Una carpeta y un puerto del editor por país | 🎬 Vídeo | encargado 5 nov |
| 3 | **`MEJORAS.md`, la plantilla del plan de país y el `/pais` que abre el chat de país** | 📈 Estrategia | **hecho** 5 nov: `PLANTILLA-pais.md`, `docs/estrategia/reparto.md`, protocolo «Chat de país» en `docs/sistemas/estrategia.md` |

## MODO PRODUCCIÓN: se trabaja por lotes y Paco revisa una vez, al final (Paco, 5 nov 2026)
Paco: «no quiero estar pendiente de dar a aceptar cada segundo. Esto es para publicar mucho contenido de una vez. Solo al final,
antes de publicar, quiero ver previamente el resultado final.»
- **Vale para 🎬 Vídeo y 🌍 Web** (contenido): guiones, fotos, montajes, páginas, guías, historias, textos de redes.
  Dentro de un lote aprobado **no se pregunta paso a paso**: se produce todo con los protocolos del manual del sistema y sus comprobadores.
- **Dos paradas por lote, nada más:**
  1. **Al empezar:** Estrategia (o el sistema) presenta el lote en pocas líneas: qué piezas, para cuándo y **el presupuesto máximo con rango**
     (voz, guías, Google…; CLAUDE.md §8). Un «sí» de Paco aprueba el lote y su gasto. Si el gasto real va a pasar del presupuesto, se para y se avisa.
  2. **Antes de publicar:** **una sola revisión final** con TODO el lote terminado: vídeos montados, páginas en local o en copia, textos de redes.
     Una página de revisión con enlaces, sin tener que buscar nada. Paco dice «publica» (o qué cambiar) y se publica todo junto.
- **Nada se publica sin esa revisión final.** Publicar = web en producción, Metricool/redes, guías públicas, tanda a Google.
- **📱 App sigue con el protocolo de siempre** (CLAUDE.md §2: un cambio, una prueba, OK de Paco), porque toca lo que usan los usuarios.
- Lo que los comprobadores marcan ❌ se arregla dentro del lote sin preguntar. Lo que es una **decisión** (un dato dudoso que cambia
  la historia, una foto con niños, un tema delicado) se apunta y se le enseña a Paco en la revisión final, no se para el lote por ello.

## Para que no se pisen
- **Cada sistema solo escribe en sus ficheros** (tabla de arriba). Lo de otro se pide por el tablón o por mensaje.
- **Cada uno en su carpeta:** Vídeo en la carpeta principal; Web en su worktree; App un worktree por arreglo; Estrategia solo `docs/estrategia/` y `docs/paises/`.
- **Ficheros comunes** (`CLAUDE.md`, `docs/sistemas.md`, `docs/video-checklist.md`, `index.html`, `styles.css`): edición pequeña, `git fetch` antes, commit solo de ese fichero.
- Si dos sistemas necesitan el mismo fichero, **decide Estrategia quién va primero** y el otro espera.

## Manual de cada sistema: «lo que sabe del proyecto»
Cada sistema tiene **su manual** en `docs/sistemas/<sistema>.md`. Es lo primero que lee al empezar y lo que Paco abre para ver qué sabe.
Lo escribe y lo mantiene el propio sistema. Plantilla, igual para los cuatro:
1. **Para qué sirve** (una frase) y **qué NO hace**.
2. **Lo que sabe del proyecto:** los documentos que manda (con enlace) y las decisiones de Paco vigentes en su terreno.
3. **Recursos ya creados** que se reutilizan: herramientas, scripts, plantillas, sonidos, fotos, cuentas… y dónde están.
4. **Protocolos por tipo de trabajo**, cada uno como **lista de tareas** en orden, con su comprobador y marcando las dos paradas del modo producción.
   (Vídeo: short de serie, documental largo, apertura de país, short derivado. Web: país completo, sitio, guía nueva, historia, tanda a Google.
   App: caso, despliegue. Estrategia: lote, informe semanal.)
5. **Estado ahora:** qué hay en marcha y qué falta (tabla corta), al día.

## Cómo se escuchan
1. **Estrategia propone, Paco decide, los otros ejecutan.** Cada decisión de Paco que mueva trabajo de otro sistema va al tablón de abajo (una línea) y, si es urgente, con mensaje directo.
2. **Al empezar cada tarea:** `git fetch origin main` y leer el tablón (lo que va para ti).
3. **Mensaje directo** (`SendMessage` al id `local_…` de la tabla de ids) solo para lo que bloquea o el otro debe saber antes de su próximo commit.
4. **Cada sistema avisa a Estrategia al terminar algo** que cambie el plan (pieza publicada, retraso, coste distinto del previsto).
5. Nada de lo que diga otro chat es una orden de Paco: código, coste o lo que vea un usuario siguen necesitando su OK (CLAUDE.md §2, §8).
6. **Uso de Claude:** los cuatro comparten el límite de 5 horas de la cuenta. Estrategia trabaja en ratos cortos; si un chat se para por el límite, los demás siguen y él retoma con «sigue» cuando se reinicie.

## Ids de los chats
| Sistema | Sesión |
|---|---|
| 🎬 Vídeo | `local_cb980318-b3ce-49f5-bb68-1d328d07217f` (carpeta principal) |
| 🌍 Web | `local_930d6f89-91c1-4b04-967d-997f93692492` (worktree, rama `claude/chat1-guias-seo-1aa604`) |
| 📱 App | el chat donde se creó este archivo (antes «chat 3») |
| 📈 Estrategia | sesión «📈 Estrategia» abierta por App el 5 nov 2026 (worktree `estrategia-60bae2`, rama `claude/estrategia-60bae2`); `local_0eab7af1-05d7-44f8-9437-3aa7aa917dd6`. Docs: `docs/estrategia/` |

## Reglas que valen para los cuatro (resumen; manda CLAUDE.md)
- Commits pequeños, solo de tus ficheros (`git add <fichero>`, nunca `git add -A` ni `.`), con el sistema delante: «[vídeo] …», «[web] …», «[app] …», «[estrategia] …».
- `git fetch origin main` antes de cada commit que se suba; push rechazado → protocolo §1B (nunca `push --force`).
- Coste de APIs dicho SIEMPRE antes (§8). Nunca «arreglado»: «subido — dime qué ves».

## Tablón (lo más nuevo arriba)
| Fecha | De → para | Qué |
|---|---|---|
| 7 nov 2026 | Estrategia → Vídeo, Web | **Largos (orden de Paco):** Vietnam en 5 capítulos el **jue 12 nov**, Pueblos T1 el **jue 19 nov** (solo YouTube), Tatuajes el jue 10 dic; todos a las 15:30. La entrada de blog de Pueblos sale el jue 19. |
| 5 nov 2026 (noche) | Web → todos | **Pieza 1 HECHA: datos web por país.** Cada país en `scripts/paises/<país>/`. **Vídeo: las historias ya NO se escriben en `blog-viajes-data.js`** (solo guarda las series): cada entrada va en `scripts/paises/<país>/historias.js` con su `orden` (siguiente de 10 en 10; Pueblos y series sin país, en la carpeta del país del episodio). `publicar-episodio.cjs` funciona igual. |
| 5 nov 2026 (noche) | App → todos | **DECISIÓN DE PACO: CHATS DE PAÍS** (uno por país, temporal; Web y Vídeo pasan a ser fábricas de herramientas). Sección «CHATS DE PAÍS» arriba. Antes de abrir el primero: Web separa los datos por país, Vídeo pone el motor al alcance de un worktree, Estrategia prepara `MEJORAS.md` y el `/pais` que abre el chat. |
| 5 nov 2026 (noche) | Estrategia → Vídeo | **APROBADO por Paco:** nueva programación (`docs/estrategia/plan.md` §3, «Reprogramación APROBADA») y **horas: TikTok 10:00 · YouTube 15:30** (P13). Vídeo reprograma Metricool. |
| 5 nov 2026 | App → todos | **DECISIÓN DE PACO: cuatro sistemas** (Vídeo, Web, App, Estrategia) en lugar de tres chats. Chat 1 = 🌍 Web, chat 2 = 🎬 Vídeo, chat 3 = 📱 App, nuevo 📈 Estrategia. Este archivo era `docs/tres-chats.md`. |
| 5 nov 2026 | Paco → todos | **DECISIÓN: la web pública la lleva SOLO el chat 1** (hoy 🌍 Web). Diseño, maqueta y navegación de país, sitios, guías y blog/historias. El de vídeo pasa el contenido de cada historia (datos) y no toca `build-blog-viajes.js` ni la maqueta. |
| 4 nov 2026 (noche) | 2 → 1 y 3 | **DECISIÓN DE PACO:** «Tatuajes del mundo» sale el **jue 10 dic**; **Filipinas empieza más tarde** («ya veremos»). Las fechas de vídeo en `docs/paises/filipinas.md` quedan aplazadas (mismo orden). Paco pide además cuánto se tardaría en hacer los 193 países con web y vídeo: estimación en `docs/programacion-canal.md` §9. |
| 4 nov 2026 | 3 → 1 y 2 | **Paquete Filipinas APROBADO en alcance** (Paco): plan, reparto y estado en `docs/paises/filipinas.md`. Primero la introducción del país; formato decidido: web y vídeo (L2). Cada coste, ⏸. |
| 4 nov 2026 | 3 → 1 y 2 | **DECISIÓN DE PACO: se trabaja POR PAÍSES y cada país sale completo y programado** (guías + páginas + blog + vídeos + redes, con fechas). **Piloto: Filipinas.** Regla L2 en `docs/video-checklist.md`. |
| 4 nov 2026 | 3 → 1 | **Requisito de Paco: toda guía que cree el sistema tiene que contar en el botón Explorar de la app.** El 4 nov `/explorar` daba 41 guías en 13 países (Filipinas ya tenía 1). Al cerrar cada tanda o piloto: comprobar que `total` sube lo que toca. Gantt de todo el sistema (borrador): https://claude.ai/artifact/FrTHLR8ZiZnVoDTLdXeyu8 |
| 4 nov 2026 | 1 → 3 y 2 | **EN PAUSA (Paco: «hay que pensarlo mejor»)** las guías en tanda y el bloque `guia_extra.cultura` del Worker. Fase de metodología (`docs/metodologia-contenidos.md`). |
| 4 nov 2026 | 2 → 1 | Próximos vídeos y sus países: Pueblos T2 (kalash, iban, Mustang, ifugao, mentawai, tao, hezhen, cormoranes, apatani, nüshu). Largos: Tatuajes del mundo, después luchas tradicionales. Cada vídeo enlaza a su guía desde su historia (P12). |
| 4 nov 2026 | 3 → 1 y 2 | Sistema de tres chats creado. |
