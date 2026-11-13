# PROTOCOLO DE COORDINACIÓN — 📈 Estrategia es la torre de control (13 nov 2026)

**Estado: PROPUESTA para Paco.** Paco: «Estrategia como chat has de coordinar tú las tareas que te lleguen y estar pendiente de las tareas que están haciendo. Vamos a crear un protocolo para que no me tengas liado. Ha de ser muy eficaz. Todas las tareas tienen muchas normas que han de cumplirse.»
Completa `docs/sistemas.md` (quién hace qué) y el modo producción; no lo sustituye. Las normas siguen en `docs/video-checklist.md`, `CLAUDE.md` y los manuales.

## 1 · Las 6 reglas
1. **Paco habla con UN chat: Estrategia.** Le da las órdenes aquí, y aquí recibe los avisos y las preguntas. Los demás chats no le preguntan a él: le preguntan a Estrategia.
   *Única excepción:* **ver u oír** algo (un montaje en el editor, una página en local). Para eso Estrategia le da **el enlace directo** y Paco contesta aquí o allí, lo que le sea más cómodo.
2. **Toda tarea se apunta en el tablero** (`docs/estrategia/tablero.md`) en el momento en que llega: qué es, quién la hace, estado, siguiente paso y qué falta de Paco.
3. **Todo encargo sale con la plantilla del §2**: la orden de Paco con sus palabras, la lista de cierre de su tipo (§3) con las normas que tocan, el coste y las paradas.
4. **Nada es «terminado» hasta que Estrategia lo comprueba** con la lista de cierre: lo mira ella misma (commit en main, archivo, Studio, Metricool, la web) y no se fía solo del aviso. Si falta algo, vuelve al chat que lo hace sin molestar a Paco.
5. **Paco recibe una sola cosa cada vez: el PARTE** (§4). Tiene tres bloques: hecho y comprobado, en marcha y te necesito. Las preguntas van juntas, cada una con la recomendación de Estrategia y sus botones. Nunca una pregunta suelta de cada chat.
6. **Los errores se avisan siempre**, aunque los haya cometido otro chat o yo misma, con su coste y una recomendación. Decide Paco y no se insiste.

## 2 · PLANTILLA DE ENCARGO (la usa Estrategia al pasar trabajo a Vídeo, Web o App)
```
📈 Estrategia → <sistema>. ENCARGO <id del tablero> · <nombre corto>
ORDEN DE PACO (<fecha>): «<sus palabras exactas>»
QUÉ: <entregable en 1-3 líneas> · PARA: <fecha/hora>
TERMINADO = lista de cierre «<tipo>» (protocolo-coordinacion.md §3) + estas normas que más se olvidan: <IDs>
COSTE: <0 € / rango; si va a pasar, PARAR y avisar a Estrategia>
PARADAS: <qué tiene que ver o decidir Paco y en qué momento>
AL ACABAR, AVÍSAME CON: «HECHO <id> · dónde está (commit/enlace/ruta) · qué normas cumple · qué queda o qué dudas»
SI TE BLOQUEAS: pregúntame a mí, no a Paco.
```

## 3 · LISTAS DE CIERRE (lo que comprueba Estrategia antes de decir «terminado»)
### Largo de YouTube
- [ ] Guion aprobado (F3) y gancho (G1); título y carátula elegidos antes que el vídeo, con su estudio (Y11-Y14, Y18).
- [ ] Datos con fuente y fecha (F4, P9); fotos y vídeos de terceros revisados, con autores (F9, F10, P2).
- [ ] Montaje: informe de reglas sin ❌ (P5); Paco lo ha visto y oído (F8).
- [ ] Exportado en calidad máxima, con el nombre de archivo en palabras clave (P14, Y7).
- [ ] En Studio: título, descripción con capítulos, autores, paquete EN y .srt EN, lista, etiquetas, marca de IA si procede, carátula, fecha y hora (P6, Y5, Y6, Y10, M10, P1, P13). Si Studio lo deja, prueba A/B (Y17).
- [ ] Tarea programada del comentario fijado, solo UNA por vídeo (P6).
- [ ] Procesado a 1080p y comprobado en el canal (P11); anotado en `publicaciones-registro.md` (P7).
- [ ] Entrada de blog con Web Story y misma carátula, enseñada a Paco y subida con `comprobar-nada-atras` en ✅ (P12, P15, Y15).
- [ ] Plan y tablero al día.
### Short
- [ ] ≤ 60 s (N10); persona en el primer fotograma (M15); sígueme (M13); sintonía en el mapa (S3); informe sin ❌.
- [ ] En Metricool, con el texto, el primer comentario y la carátula a la vez (P6), en día sin largo y a las 10:00 (P13).
- [ ] Al salir, comprobado en cada red (P11) y anotado (P7).
### Entrada de web (blog, país o guía)
- [ ] Hecha con el generador, nunca a mano (P12); fotos revisadas y con autor.
- [ ] Enseñada a Paco en local; `comprobar-nada-atras` en ✅; subida y comprobada en la web.
### Cambio en algo ya publicado
- [ ] OK de Paco con sus palabras (P7, P8); se cambia solo lo pedido; comprobado y anotado.
### Cualquier tarea con coste
- [ ] Coste dicho antes con un rango (§8) y el real anotado al terminar.

## 4 · EL PARTE (lo que Paco lee)
```
✅ HECHO Y COMPROBADO: <una línea por tarea>
⏳ EN MARCHA: <tarea · quién · cuándo acaba>
🙋 TE NECESITO (por orden de urgencia):
  1. <pregunta corta> → yo haría: <recomendación>   [botones]
  2. <ver/oír: enlace directo>
```
- Va al empezar la sesión, cuando algo termina o se bloquea, y cuando Paco pregunta «¿qué hay?».
- Si no hay nada que decidir, no se pregunta nada.

## 5 · Cómo sigue Estrategia lo que está en marcha
- Cada aviso de otro chat → actualizar el tablero en el momento → comprobar con la lista de cierre → al parte.
- Si un chat lleva mucho sin avisar con algo bloqueado o en espera, Estrategia le pregunta cómo va. Nunca vigila cada minuto: mira cuando hay un aviso o Paco pregunta.
- Lo que un chat hace mal o deja a medias lo detecta Estrategia en el cierre y se lo devuelve, sin pasar por Paco. A Paco solo le llega si cuesta dinero o es una decisión suya.
- Choques (dos chats en el mismo fichero o la misma fecha): decide Estrategia quién va primero (`docs/sistemas.md`).

## 6 · Qué cambia para los otros chats
- **Vídeo, Web y App** dejan de preguntar a Paco directamente: preguntan a Estrategia (salvo para enseñar algo que hay que ver u oír).
- Avisan siempre con el formato «HECHO / BLOQUEADO / DUDA <id>».
- Siguen cumpliendo sus normas igual; la lista de cierre es la comprobación final, no las sustituye.
