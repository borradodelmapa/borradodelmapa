# CHECKLIST DE VÍDEO — FUENTE ÚNICA (versión = fecha-hora de la última fila del registro de cambios, al final)

**Estado: BASE EN CONSTRUCCIÓN. Este texto se modifica mucho hasta que sea sólido.** Manda este archivo: si choca con
`docs/video-reglas-y-flujo.md`, la Biblia v2.5 (docx), `docs/salma-narradora-reglas.md` o `docs/estilo-visual.md`, **gana este** y se corrige el otro.
Nació el 30 oct 2026 (Paco: «estoy cansado de ir detrás vuestra recordando lo que se olvida»): el protocolo estaba repartido en cuatro sitios
y se leía a trozos. Todo viene **ACTIVADO por defecto**; solo se desactiva algo si Paco lo dice (y se anota aquí con fecha).

## Cómo se usa (cualquier sesión, cualquier modelo)
1. **Antes de tocar nada de vídeo/short/reel/capítulo/mapa/voz de vídeo: leer este archivo ENTERO** y mirar la fecha de la última fila del registro de cambios de abajo
   (`git log -3 --format="%h %cd %s" -- docs/video-checklist.md`; es zona común: `git fetch origin main` antes de editar).
2. **Pasar los puntos uno a uno** al montar. Al entregar, decir qué puntos están hechos, cuáles no y por qué (nunca «listo»: *«montado — dime qué ves y oyes»*).
3. **Regla de mantenimiento:** toda decisión nueva de Paco sobre vídeo se escribe AQUÍ en el mismo turno (con fecha, subiendo la versión y una línea en el registro).
   No vale dejarla solo en el chat ni en memoria. Se avisa: «he actualizado el protocolo a vN».
4. Cada punto lleva un ID estable (F1, N3, M7…) para citarlo y para que el motor (`motor/reglas.cjs`) y esta lista no se desincronicen.
   Columna *Comprobación*: **motor** = lo comprueba el informe de reglas hoy · **motor (pendiente)** = decidido que lo compruebe, sin implementar · **manual** = lo revisa quien monta y Paco.

## Editar esta checklist desde varios chats a la vez (leer antes de tocarla)
Es **zona común**, como CLAUDE.md. Cada chat apunta aquí sus mejoras, pero sin pisar a los demás:
1. **Edición pequeña y dirigida** (Edit de una línea/fila), nunca reescribir el archivo entero. Si el archivo cambió en disco desde que lo leíste, **vuelve a leerlo** antes de editar.
2. **Cada cambio = una fila nueva ARRIBA del registro de cambios**, con fecha y hora (`30 oct 2026 · 13:40`), qué sesión/tema y qué IDs toca. No hay números de versión: la versión es la fecha-hora de la fila más reciente (así dos chats no chocan por el «v2»).
3. **Commit solo de este archivo** (`git add docs/video-checklist.md`; nunca `git add -A`/`.`, porque en la misma carpeta hay trabajo de otras sesiones sin terminar).
4. **Si el otro chat está en otro clon (móvil, nube, otro worktree):** `git fetch origin main` → `git log --oneline HEAD..origin/main -- docs/video-checklist.md` → editar → commit pequeño → push; si el push se rechaza: fetch, `git rebase origin/main`, y si choca la misma fila **fusionar a mano conservando las dos aportaciones** (§1B de CLAUDE.md). Nunca `push --force`.
5. **Si una regla nueva choca con otra** (como «cierre íntimo» vs «sin cierres poéticos»), no se borra en silencio: gana la más nueva, se anota en el registro quién gana y por qué.
6. Los documentos de detalle (narradora, estilo, Biblia) que no estén en git **no cuentan como protocolo** para otras sesiones: lo importante se pasa a esta checklist y el detalle se commitea.

## A · Flujo de trabajo
| ID | Regla | Comprobación |
|---|---|---|
| F1 | Leer esta checklist entera antes de empezar (punto 1 de arriba). | manual |
| F2 | El contenido personal lo cuenta Paco (recuerdos hablados); **no se inventa nada que no haya contado**. En shorts de guía, el contenido sale de la guía y de fuentes. | manual |
| F3 | **Guion de dirección por escena** aprobado por Paco ANTES de generar voz (emoción, imagen concreta, quién habla, sonido dominante, IA sí/no). Plantilla: `docs/india-cap4-guion-direccion.md`. | manual |
| F4 | **Datos con fuente** registrados en `docs/india-notas-y-fuentes.md` (varias fuentes se dicen; una sola «según algunas fuentes»; si discrepan, no se dicen). | manual |
| F5 | **Coste dicho antes** (voz ElevenLabs, música, Runway; CLAUDE.md §8). Probar con una frase antes de generar todo. Runway: 1 vídeo a la vez, guardar el id de cada tarea (`runway-pruebas/runway-tareas.log`), prompt tal cual lo pide Paco; modelos y créditos en `video-reglas-y-flujo.md` §10. | manual |
| F6 | **Paco elige** la foto protagonista de cada escena (banco por temas) y los audios, oyendo candidatos del mismo volumen. Si Claude propone fotos, se las enseña para elegir. | manual |
| F7 | Monta Claude con el motor (**un solo editor/motor**: no escribir otro) y entrega: vídeo + informe de reglas + hoja de planos (`motor/hoja.cjs`). Se guarda con fecha en `VIDEOS-TERMINADOS/` (el anterior del mismo capítulo pasa a `ANTIGUOS`). Un puerto de editor por capítulo; nunca renombrar sobre un vídeo abierto en el editor (se copia encima). | manual |
| F8 | Paco corrige por escena/número y se remonta. Nunca «arreglado»: *«montado — dime qué ves y oyes»*. Un cambio, una prueba, una confirmación. | manual |

## B · Narración y texto (Salma narradora)
| ID | Regla | Comprobación |
|---|---|---|
| N1 | **Para el oído**: frases cortas, leer el guion en voz alta antes de generar voz. Primera persona solo donde aporte dato o punto de vista con base real (ver N6: nada de relleno). | manual |
| N2 | **Abrir con una pregunta o imagen concreta.** Gancho en los primeros 5 s, útil desde el fotograma 0. | manual |
| N3 | El dato **cuelga de una historia**, no de una ficha. **UN dato potente por intervención** y silencio después. | manual |
| N4 | Salma **no huele, prueba, camina ni toca**. Nada de documentos/hallazgos inventados ni errores fingidos. | manual |
| N5 | **No vender la app en la voz.** La app va en la tarjeta final, aparte (textos que varían: «hazte tu guía gratis», «tu ruta, gratis»; sin repetir «Salma» en pantalla). | motor |
| N6 | **Salma: solo datos relevantes con fuente — nada de frases de relleno ni cierres poéticos** (Paco, 29 oct 2026; PREVALECE sobre «cierre íntimo» de `salma-narradora-reglas.md`, 18 oct). Paco: sus textos tal cual, sin añadirle recuerdos que no ha dicho. El cierre es un dato o la llamada de la tarjeta final, no una moraleja. | manual |
| N7 | Hablar poco de Paco (1-2 menciones, con variantes). Cada frase sirve a quien quiera viajar. **Cada imagen es de lo que se dice** y nunca lo contradice. | manual |
| N8 | Voces definitivas (Paco y Salma, `motor/voces.cjs`), no cambiar sin orden de Paco. Pronunciación con el campo `voz` (el subtítulo sigue bien escrito). Nunca «según las guías»: NOSOTROS somos la guía. | manual |
| N9 | Plantilla de capítulo-reel 60-90 s: gancho → contexto (Salma sitúa) → viaje → descubrimiento (dato clave) → cierre con dato o «continuará», sin moraleja (N6) → tarjeta. Si la historia lo pide, más de 90 s sin problema. | manual |

## C · Montaje e imagen
| ID | Regla | Comprobación |
|---|---|---|
| M1 | Estructura: gancho → **situar (mapa)** → desarrollo alternando escalas → pico (plano largo) → ficha (ritmo rápido) → cierre (GP lento) → tarjeta. | manual |
| M2 | Escalas GP/PM/PP/D: presentar GP→PM→PP→D y cerrar al revés; no repetir escala seguida; máx. 2 detalles seguidos; duraciones GP 3-4 · PM 2-3 · PP 1,5-2 · D 0,8-1,5 s. | motor |
| M3 | **Ninguna foto ni clip repetido** en un vídeo. | motor |
| M4 | Look Kodak coherente: Portra (día) · Vision3 (noche/interior) · Tri-X B/N (historia/leyenda/recuerdo) + normalización «BDM Film» de cada foto. | motor |
| M5 | Zoom/empuje lo pone el montaje (ffmpeg); Runway solo movimiento interno, cámara fija, 5 s (coste dicho). | manual |
| M6 | **Fundidos a negro entre bloques** (`scene`/`sceneEnd`). | motor |
| M7 | **Mapa de ruta animado** de cabecera (5-8 s) con frontera real y título «BORRADO DEL MAPA · lugar» (`motor/mapa.cjs`, `mapa-butan.cjs`). | motor |
| M8 | **Contador/rótulo de serie** arriba a la derecha («INDIA 2019», «BUTÁN · DÍA 2») y **rótulos de lugar** breves. | motor |
| M9 | **Cifras grandes animadas** en el momento de decir cada cifra clave. | motor |
| M10 | Subtítulos ES con palabra iluminada (grabados) y **EN como pista `.srt` aparte**. | motor |
| M11 | **Portada** por defecto (0,2 s + PNG aparte y como carátula); la misma portada = miniatura en TODAS las redes; los avances llevan portada PROPIA. | motor |
| M12 | **Ken Burns** en las fotos (más en GP que en D, alternando entrar/salir). | motor |
| M13 | **Aviso «Si te está gustando, sígueme»** hacia el segundo 30 (5,5 s, franja naranja + corazón). **Activo por defecto**; nunca desactivarlo sin orden de Paco. | motor |
| M14 | **Cierre en dos tiempos, 8 s:** título + «Basado en un viaje real» (SOLO si es un viaje real de Paco) → icono de Salma, «CREA TUS RUTAS CONMIGO», «Descarga la app de guías de viaje · Gratis», borradodelmapa.com, siguiente capítulo. | motor |

## D · Sonido
| ID | Regla | Comprobación |
|---|---|---|
| S1 | Capas: voz (manda) > ambiente > detalle > música. Ambiente = sonido REAL de sus vídeos, comprobado (espectro) y con ducking; de noche, silencio total. Un short sin ninguna capa más que la voz es un hueco, no una decisión. | motor |
| S2 | Voces niveladas (Paco −21 dB, Salma −25), respiro 0,85 s + 0,45 s al cambiar de hablante (0,4 s si es el mismo), mezcla final −14 LUFS. | motor |
| S3 | Música solo si el capítulo la pide: original sintetizada (`mkmusic.cjs`, 0 €) o con licencia comprobada y anotada. Coste dicho antes (F5). | manual |
| S4 | El sonido creado no se presenta como «sonido real del destino». Mantras, oraciones y voces reales: no simularlos. | manual |

## E · Publicación y cuidados
| ID | Regla | Comprobación |
|---|---|---|
| P1 | Marcar «contenido generado con IA» en las opciones de cada red al publicar (no va en pantalla). En textos públicos/marketing NUNCA decir «IA». | manual |
| P2 | Atribuciones de las fotos (Wikimedia, etc.) en la descripción: `ATRIBUCIONES.txt` de la carpeta del vídeo. | manual |
| P3 | Mismo vídeo en el blog y en todas las redes; comparar la pestaña Shorts del canal con la fila de la serie antes de dar algo por publicado. | manual |
| P4 | Privacidad: sin niños en primer plano, sin identificar a nadie por la cara, sin recibos ni datos personales, permisos confirmados por Paco (Lina y equipo). De Google Fotos solo archivos de cámara. | manual |
| P5 | Antes de dar un vídeo por terminado: **informe de reglas sin ❌** y esta checklist pasada punto a punto. | manual |
| P6 | **Paquete de texto por vídeo y por red, SIEMPRE** (Paco, 29 oct 2026): título con la búsqueda real al principio · descripción (2 primeras líneas lo importante + borradodelmapa.com + datos de viaje con fuente y fecha) · 3 hashtags (YouTube) / 3-5 (TikTok, Instagram) · subtítulos `.srt` subidos en YouTube · lista de reproducción · primer comentario fijado con la llamada a la app. Lo prepara Claude, lo aprueba Paco. Detalle: `video-reglas-y-flujo.md` §11. | manual |
| P7 | Vídeos ya publicados: inventario + paquete nuevo + **solo con OK de Paco** se editan. Todo se anota en `docs/publicaciones-registro.md` (vídeo, red, día, enlace). | manual |

## Registro de cambios (lo más nuevo arriba; subir la versión en cada cambio)
| Versión (fecha · hora) | Sesión/tema | Qué cambió |
|---|---|---|
| 30 oct 2026 · 14:00 | Bután (Claude) | Hook de aviso automático, comprobación de las piezas en `reglas.cjs` (❌), detector `comprobar-checklist-video.cjs`. N2 pasa a manual. |
| 30 oct 2026 · 13:00 | Bután (Claude) | Añadida la sección «Editar desde varios chats» y cambiado el sistema de versión a fecha-hora para evitar choques entre sesiones. |
| 30 oct 2026 · 12:30 (v1) | Bután (Claude) | Integra también lo del 29 oct (Runway/clips, paquete de publicación, «sin cierres poéticos»). **Conflicto resuelto:** `salma-narradora-reglas.md` (18 oct) pedía «cierre íntimo» y Paco decidió el 29 oct «solo datos con fuente, sin cierres poéticos» → manda lo más nuevo (N6). Creada fusionando `video-reglas-y-flujo.md`, Biblia v2.5 (§7, §12, §16, §18, §22), `salma-narradora-reglas.md`, `estilo-visual.md` y `serie-asia-estado.md`. Se añade la regla de mantenimiento y los IDs. Nuevo a raíz del piloto de Bután: mapa de vuelo de cabecera, no vender la app en la voz, subtítulos EN aparte, cifras múltiples. |

## Cómo se mantiene sincronizada (hecho el 30 oct 2026)
- **Aviso automático:** `scripts/hook-video.cjs` + `.claude/settings.json` (hook UserPromptSubmit): si el mensaje habla de vídeo, la sesión recibe la orden de leer ESTE archivo y su fecha de última actualización.
- **Motor:** `motor/reglas.cjs` marca ❌ las piezas «motor» que falten y escribe contra qué actualización de esta lista se comprobó. Una pieza se puede descartar a propósito con `cfg.descartes = { M7: "motivo" }` (sale como ℹ).
- **Detector:** `node scripts/comprobar-checklist-video.cjs` (0 €) falla si un ID de esta lista y el motor no coinciden o si el hook no está activo. Pasarlo antes de subir cambios de vídeo o de la checklist.
- **Al añadir una regla nueva:** poner su fila aquí con ID, y si es automática, su `chk('ID', …)` en `reglas.cjs`; si no, marcarla «manual».
