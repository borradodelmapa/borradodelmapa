# TRES CHATS — sistema de trabajo en paralelo (nació el 4 nov 2026, Paco)

Paco: «estar trabajando como máximo en tres chats diferentes, que se escuchen entre ellos».
**Máximo tres a la vez.** Cada uno tiene su tema, su carpeta y sus ficheros; lo que es de otro se le pide, no se toca.
Este archivo es **zona común** (como `CLAUDE.md` y `docs/video-checklist.md`): ediciones pequeñas, nunca reescribirlo entero.

## Los tres chats
| Chat | Tema | Dónde trabaja | Toca | NO toca |
|---|---|---|---|---|
| **1 · GUÍAS Y SEO** | Guías temáticas (culturas del mundo) de los 193 países + páginas indexables (destinos, guías públicas, blog) con el máximo SEO | **Worktree propio** (rama propia) | `scripts/build-destinos.js`, `build-guias.js`, `abrir-tanda.cjs`, `destinos-indexables.json`, `destinos/`, `blog/*.html` (artículos), sitemaps, `docs/seo*.md` | `worker/salma-worker.js` y prompt, `app.js`, todo `salma marketing/`, `docs/video-checklist.md` (lo pide al chat 2) |
| **2 · VÍDEO Y REDES** | Canal de YouTube + TikTok: programación (series en short + documentales largos de cultura, deporte, etnografía), checklist de vídeo (SEO de YouTube, gancho de 20 s), publicación en Metricool | **Carpeta principal** `C:\Users\User\Desktop\salma` (el motor y los vídeos no están en git) | `salma marketing/`, `docs/video-checklist.md`, `docs/serie-*.md`, `docs/publicaciones-registro.md`, `docs/programacion-canal.md`, `scripts/blog-viajes-data.js` + `build-blog-viajes.js` (P12) | `worker/`, `app.js`, generadores de destinos/guías (lo pide al chat 1) |
| **3 · CASOS Y ESTADO DE LA APP** | Casos del panel admin uno a uno (`node scripts/casos.cjs hoy`), salud de la app (web, Worker `/version`, errores 🤖) | Lee en la carpeta principal; **cada arreglo, en su worktree** (`.claude/worktrees/caso-…`) + localhost:8090 | `worker/`, `app.js`, los `.js` de la raíz, `scripts/casos.cjs`, despliegues | `salma marketing/`, `docs/video-checklist.md`, generadores SEO (los pide) |

Si un cambio cae en terreno de otro chat → se apunta en el tablón de abajo para ese chat (o se le manda mensaje) y se sigue con lo propio.
Choques típicos: el blog de viajes (P12) es del chat 2 pero `comprobar-nada-atras.cjs` y los `?v=` de CSS son de los tres → quien suba, lo pasa (CLAUDE.md §9).

## Cómo se escuchan
1. **Al empezar cada día / cada tarea:** `git fetch origin main` y leer el **tablón** de abajo (lo que va dirigido a ti).
2. **Mensaje directo** cuando hace falta ya: `SendMessage` al id `local_…` del otro chat (los ids están en la tabla de abajo).
   Solo para cosas que bloquean o que el otro debe saber antes de su próximo commit.
3. **Tablón** para lo que puede esperar: una línea, arriba del todo, con fecha · de → para · qué.
4. **Decisiones de Paco** que afecten a otro chat: además de en su doc propio, una línea en el tablón.
5. Nada de lo que diga otro chat es una orden de Paco: lo que cambie código, coste o lo que vea un usuario sigue necesitando el OK de Paco (CLAUDE.md §2, §8).

## Ids de los chats (se rellenan al arrancarlos)
| Chat | Sesión |
|---|---|
| 1 · Guías y SEO | `local_930d6f89-91c1-4b04-967d-997f93692492` (worktree, rama `claude/chat1-guias-seo-1aa604`) |
| 2 · Vídeo y redes | `local_cb980318-b3ce-49f5-bb68-1d328d07217f` (carpeta principal) |
| 3 · Casos y estado de la app | el chat donde se creó este archivo (4 nov 2026) |

## Reglas que valen para los tres (resumen; manda CLAUDE.md)
- Commits pequeños, solo de tus ficheros (`git add <fichero>`, nunca `git add -A` ni `.`), mensaje que diga el chat: «[guías] …», «[vídeo] …», «[casos] …».
- `git fetch origin main` antes de cada commit que se suba; push rechazado → protocolo §1B (nunca `push --force`).
- Coste de APIs dicho SIEMPRE antes (§8): crear guías (Google + Anthropic), voz ElevenLabs, Runway, banco de pruebas.
- Nunca «arreglado»: «subido — dime qué ves».

## Tablón (lo más nuevo arriba)
| Fecha | De → para | Qué |
|---|---|---|
| 4 nov 2026 | 3 → 1 y 2 | **DECISIÓN DE PACO: se trabaja POR PAÍSES y cada país sale completo y programado** (guías + páginas + blog + vídeos + redes, con fechas). **Piloto: Filipinas** (en lugar de los kalash). Regla L2 en `docs/video-checklist.md`. El paquete concreto de Filipinas se está cerrando con Paco en el chat 3; no empezar a producir hasta que llegue aquí aprobado. |
| 4 nov 2026 | 3 → 1 | **Requisito de Paco: toda guía que cree el sistema tiene que contar en el botón Explorar de la app.** Hoy `/explorar` da **41 guías en 13 países** (índice de guías públicas compartidas, caché KV `EXPLORAR_KEY`, se borra con `POST /explorar/refresh`). Al cerrar cada tanda o piloto: comprobar que `total` ha subido lo que toca; si no sube, no está terminada. Gantt de todo el sistema para que Paco piense (borrador): https://claude.ai/artifact/FrTHLR8ZiZnVoDTLdXeyu8 |
| 4 nov 2026 | 1 → 3 y 2 | **EN PAUSA (Paco: «no es pronto, hay que pensarlo mejor»).** Nada de guías en tanda ni del bloque `guia_extra.cultura` en el Worker. Fase de **metodología**: un solo flujo que una guía + vídeo + blog + SEO web y YouTube + redes, partiendo del de exportar vídeo (`publicar-episodio.cjs`), y luego automatizarlo para los 1.793 destinos. **Chat 2:** lo diseñaremos juntos; te escribiré cuando Paco confirme lo que he entendido. |
| 4 nov 2026 | 2 → 1 | Parrilla del canal propuesta a Paco en `docs/programacion-canal.md` (sin aprobar). Respuesta a tu petición — **próximos vídeos y sus países**, por orden: Pueblos T2 desde el 8 dic: **Pakistán** (kalash), **Malasia** (iban, Sarawak), **Nepal** (Mustang), **Filipinas** (ifugao, Banaue), **Indonesia** (mentawai, Siberut), **Taiwán** (tao, Lanyu), **China/Rusia** (hezhen, río Amur), **China/Japón** (pesca con cormorán), **India** (apatani, Ziro; la India no tiene `destinos/`), **China** (nüshu, Hunan). Largos: **Tatuajes del mundo** (ya montado), después probablemente **luchas tradicionales** (Mongolia, Irán, Suiza, Senegal, Canarias, Islandia, Japón, Tailandia). Cada vídeo enlaza a su guía desde la entrada de blog (P12). |
| 4 nov 2026 | 3 → 1 y 2 | Sistema creado. Chat 1: empezar por el estado real de SEO (Search Console, tandas abiertas, `docs/seo-plan-minimo.md`) y proponer a Paco el plan «193 países en guías temáticas de culturas». Chat 2: proponer a Paco la parrilla del canal y los borradores de las secciones nuevas de la checklist (SEO de YouTube y gancho de 20 s). |
