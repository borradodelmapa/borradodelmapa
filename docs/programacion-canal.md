# PROGRAMACIÓN DEL CANAL — parrilla de YouTube + TikTok (chat 2 · Vídeo y redes)

**Estado: PROPUESTA del 4 nov 2026, pendiente del OK de Paco** (revisada el 4 nov por la tarde con las Y2-Y9 y la P6/P10 que Paco aprobó ese día en la checklist). Nada de esto está programado ni montado; nada gasta dinero hasta que Paco lo apruebe (F5, CLAUDE.md §8).
Manda `docs/video-checklist.md` (L1, P6, P10, P12, P13). Este archivo es la parrilla: qué sale cada semana y en qué formato.

## 1 · Lo que ya hay programado (Metricool, leído el 4 nov 2026, solo lectura)
Todo a las 10:00 Madrid, YouTube + TikTok a la vez. La cola llega hasta el **jue 3 dic**; **desde el mar 8 dic no hay nada.**
| Fecha | Pieza |
|---|---|
| jue 5 nov | Vietnam 2/5 (bombas) + Vietnam 3/5 (túneles, Phong Nha) — dos piezas, excepción ya decidida |
| mar 10 · mié 11 nov | Vietnam 4/5 (Confucio) · Vietnam 5/5 (Hồ Chí Minh) |
| jue 12 nov → jue 3 dic | Pueblos T1: Whang-Od (12) · Sagada (17) · haenyeo (18) · konyak (19) · moken (24) · sentineleses (25) · ainu (26) · mosuo (1 dic) · dukha (2 dic) · cazadores con águila (3 dic) |

**Dato útil:** Metricool no devuelve datos por vídeo de YouTube (vistas, duración media) para el canal: la consulta sale vacía. Las métricas buenas (retención, % que se queda, CTR) hay que leerlas en **YouTube Studio** y **TikTok Studio** (ver §6).

## 2 · Los formatos del canal
| Formato | Qué es | Dónde | Duración |
|---|---|---|---|
| **A · Short de serie** | Un episodio de una serie documental en vertical: *Pueblos borrados del mapa* (L1) y, cuando haya viaje real de Paco, series de viaje (Tailandia, Vietnam…) | YouTube Shorts + TikTok | 60-95 s |
| **B · Documental largo** | 16:9, cultura, deporte tradicional, etnografía. Primero: **Tatuajes del mundo** (7:47, montado por la sesión «documental tatuajes») | **YouTube + TikTok, completo** (P6/P10, Paco 4 nov): mismo vídeo, paquete de texto, blog y autores; en YouTube con capítulos (Y6) | 6-12 min |
| **C · Short derivado** | Un bloque del largo rehecho en vertical, con su propio gancho de 20 s (G) y enlace «vídeo relacionado» al largo | YouTube Shorts + TikTok | 40-70 s |
| **D · Avance** | Teaser de una temporada o de un largo | YouTube Shorts + TikTok | 15-30 s |

## 3 · Ritmo semanal (dentro de P13: mar-mié-jue a las 10:00, una pieza al día)
| Día | Semana impar | Semana par |
|---|---|---|
| **Martes** | A · short de serie | A · short de serie |
| **Miércoles** | A · short de serie | A · short de serie |
| **Jueves** | **B · documental largo**, completo en YouTube y en TikTok | **C · short derivado** del último largo |

Es decir: **un largo cada dos semanas** y tres piezas por semana en cada red. Mientras arranca el formato largo (lleva más trabajo que un short), puede ser **uno cada tres semanas**: el jueves libre se llena con un C del largo anterior (hay 3-4 por largo).
Por qué así: las series dan constancia (dos días seguidos crean hábito), el largo da tiempo de visionado y suscriptores, y los C llevan público de Shorts y TikTok al largo (Shorts → «vídeo relacionado» → largo; TikTok → comentario).
**Hora:** se mantiene 10:00 también para el largo (P13). Metricool dice que YouTube rinde algo más a las 16:00; si Paco quiere probarlo solo con los largos, sería un cambio de P13 (decisión suya).

## 4 · Calendario propuesto desde el 8 dic (con la temporada 2 de Pueblos ya aprobada)
| Semana | Mar | Mié | Jue |
|---|---|---|---|
| 8-10 dic | T2·1 Los kalash | T2·2 Los iban | **B · Tatuajes del mundo** (estreno, YouTube + TikTok) |
| 15-17 dic | T2·3 Mustang | T2·4 Los ifugao | C · Tatuajes (2.º bloque) |
| 22-24 dic | T2·5 Los mentawai | T2·6 Los tao | jue 24 (Nochebuena): C · Tatuajes (3.º) o hueco libre |
| 29-31 dic | T2·7 Los hezhen | T2·8 Pescadores con cormorán | jue 31: C · Tatuajes (4.º) o hueco libre |
| 5-7 ene | T2·9 Mujeres apatani | mié 6 (Reyes): T2·10 El nüshu | **B · largo n.º 2** |

**Opción para no esperar a diciembre con Tatuajes:** P13 permite una pieza al día; si Paco quiere estrenarlo antes, iría un jueves de noviembre y el Pueblos de ese día se desplaza (la cola se corre una plaza). Decisión de Paco.
Para que esto salga a tiempo: T2 necesita **~2 episodios terminados por semana** desde ya (cada uno: guion ⏸, fotos ⏸, voz ~1.000 caracteres con coste dicho antes ⏸, montaje, editor ⏸, blog, R2, Metricool ⏸).

## 5 · Un largo da para 5-7 piezas (reaprovechamiento)
1. **Largo completo en YouTube y TikTok** (P6/P10) con capítulos en YouTube (Y6), portada horizontal de M11 y pantalla final (Y13 propuesta). **Comprobar** antes del primer largo que Metricool sube a TikTok un vídeo de esa duración (7:47 en Tatuajes; los siguientes pueden pasar de 10 min).
2. **3-4 shorts C** (uno por bloque del largo). Se hacen **desde la config del motor con `cfg.formato` vertical**, no recortando el mp4 horizontal: así los subtítulos caen en la zona segura (M10) y cada uno lleva su gancho de 20 s (G) y el sígueme (M13). Voz ya pagada (se reutiliza el audio del bloque) salvo el gancho nuevo, si hace falta una frase.
3. **Un avance D** antes del estreno (opcional).
4. **Entrada de blog (P12)**: una por largo, con el vídeo largo incrustado, los capítulos como índice, la información ampliada con fuentes (ya está en `docs/tatuajes-documental-fuentes.md`) y los C incrustados. Con el generador de siempre (`scripts/build-blog-viajes.js`); hay que comprobar que admite un vídeo 16:9 (es fichero del chat 2).
5. **Cada C enlaza al largo** con «vídeo relacionado» (en YouTube Studio, a mano: las herramientas de terceros no pueden ponerlo por la API) y en el comentario fijado.
6. Y al revés, **los largos se arman con material de los shorts**: T1 y T2 de Pueblos ya tienen fotos revisadas, fuentes y blog. Varios largos de §7 salen casi solo con voz nueva.

## 6 · Métricas: qué se mira y dónde (para comercializar al máximo)
| Métrica | Qué dice | Dónde se lee | Objetivo orientativo (no oficial) |
|---|---|---|---|
| **% «Lo vieron» vs «Lo deslizaron»** (Shorts) | Si el primer segundo engancha | YouTube Studio → el Short → Analytics → «Alcance»/«Participación» | ≥ 70 % (compararlo sobre todo con nuestros propios Shorts) |
| **Retención a los 20 s** (gráfica de retención) | Si el gancho entero funciona (G) | YouTube Studio → «Retención de audiencia» · TikTok Studio → el vídeo → «Retención» | Que la curva no caiga en picado antes de los 20 s; anotar el % en 20 s |
| **% visto medio y duración media** | Si el resto sostiene | YouTube Studio, TikTok Studio | Shorts: > 70-80 % del vídeo |
| **CTR de impresiones** (largos) | Si título + miniatura convencen | YouTube Studio → Alcance | Comparar entre nuestros largos |
| **Test & Compare** (largos) | Qué miniatura/título gana | YouTube Studio, al subir; gana por «cuota de tiempo de visionado», no solo por clics | — |
| **Suscriptores por vídeo** y **fuente de tráfico** (búsqueda / feed de Shorts / sugeridos) | Qué vídeo trae gente y si el SEO funciona | YouTube Studio · Metricool (fuente de tráfico del canal: YTTS) | Que la búsqueda suba con el tiempo |
**Rutina propuesta (0 €):** cada lunes Claude hace un **parte semanal** en `docs/metricas-canal.md`: de cada pieza de la semana, a las 48 h y a los 7 días, % visto vs deslizado, retención a 20 s, duración media, suscriptores y fuente de tráfico. Lo de Metricool lo saca solo; lo de los Studios, leyéndolo en el navegador con la sesión de Paco (**solo lectura**, sin tocar nada) o con una captura de Paco. Con 4-6 semanas de datos se ve qué ganchos y qué títulos funcionan y se ajustan las reglas G e Y.

## 7 · Primeros temas (lo que L1 tenía pendiente)
**Shorts de serie:** la temporada 2 de Pueblos ya está aprobada (`docs/serie-pueblos-borrados.md`: kalash, iban, Mustang, ifugao, mentawai, tao, hezhen, cormoranes, apatani, nüshu). Propuesta: dar por cerrado el «pendiente» de L1 con esa lista + la de largos de abajo.
**Documentales largos** (propuesta de orden; ★ = sale en buena parte de material que ya tenemos, más barato):
| # | Tema | Tipo | Por qué |
|---|---|---|---|
| 1 | **Tatuajes del mundo** | cultura | Hecho. Es la familia del único vídeo que despegó (kayan) y de Whang-Od |
| 2 | **Luchas tradicionales del mundo** (bökh mongol, kushti iraní, schwingen suizo, laamb senegalés, lucha canaria, glima islandesa, sumo; Muay Thai con lo grabado por Paco) | deporte tradicional | Búsqueda alta y global; Paco tiene material real de Muay Thai |
| 3 ★ | **Nómadas que quedan** (dukha, cazadores con águila, moken, bajau, kazajos) | etnografía | Material de T1 ya revisado y con fuentes |
| 4 ★ | **Mujeres que sostienen una cultura** (haenyeo, mosuo, Whang-Od, kayan, apatani) | etnografía | Material de T1/T2; tema muy compartible |
| 5 | **Lenguas y escrituras que se apagan** (nüshu, ainu, silbo gomero, lenguas de un solo hablante) | cultura | Encaja de lleno en L1 y tiene buenas fuentes |
| 6 | **Deportes a caballo de Asia Central** (buzkashi/kok-boru, carreras del Naadam, caza con águila) | deporte tradicional | Imágenes fuertes, fotos libres abundantes |
| 7 | **Cómo despiden a sus muertos** (Sagada, toraja, entierro celeste tibetano, famadihana) | etnografía | Alto interés; **con mucho cuidado** (P4, nada morboso, sin restos humanos: F9) |
| 8 | **Oficios que desaparecen** (pesca con cormorán, pescadores sobre zancos de Sri Lanka, salineros, tejedores) | cultura | Une con «cómo visitarlo con respeto» (P9) |
**Coste a ojo por largo (se dice exacto antes de generar, F5):** la voz de un largo de 8 min son ~6.000-7.000 caracteres de ElevenLabs, unas 6-7 veces un short; fotos de Wikimedia, sonido libre y motor: 0 €. Runway solo si Paco lo pide (coste aparte).

## 8 · Lo que necesita decidir Paco
1. ¿Vale el ritmo (2 shorts de serie + 1 jueves de largo o derivado)? ¿Un largo cada 2 o cada 3 semanas?
2. ¿Tatuajes el jue 10 dic o antes, desplazando la cola?
3. Orden de los largos 2-8.
4. Las reglas **Y10-Y16** y G2-G8 propuestas (abajo, en el anexo); entran en la checklist solo con su OK.
5. Si el **mapa de cabecera pasa después del gancho** (G3): cambia el orden de M1/M7/S3 en los shorts nuevos.

---
## ANEXO · Reglas propuestas para la checklist (NO están en la checklist hasta el OK de Paco)

### F · SEO de YouTube — lo que falta (Y10-Y16)
**Ya aprobadas por Paco y en la checklist (4 nov 2026, 15:30):** Y2 palabra clave investigada · Y3 título con la búsqueda a la izquierda, ≤ 60 caracteres · Y4 miniatura · Y5 descripción · Y6 capítulos (solo documentales) · Y7 nombre del archivo · Y8 etiquetas · Y9 SEO del blog. Lo de abajo **no repite** nada de eso: solo añade lo que falta, con IDs libres.
| ID | Regla propuesta | Comprobación |
|---|---|---|
| Y10 | **Capítulos que YouTube acepte** (concreta Y6): primera marca **0:00**, al menos **3**, cada uno de **10 s o más**, en orden; títulos con palabras que se buscan («Japón: el tatuaje prohibido de los ainu»), nunca «Parte 1». Los saca el motor de los bloques de la config (`capitulos.txt` junto al vídeo) para no escribirlos a mano. | motor (pendiente) |
| Y11 | **Probar miniaturas** (amplía Y4): en los documentales, 2-3 variantes con **Test & Compare** de YouTube Studio (gana la que más tiempo de visionado da, no solo la que más clics saca); 1280×720. | manual |
| Y12 | **Listas de reproducción** (P6 solo dice «lista»): una por temporada de cada serie, en orden («Pueblos borrados del mapa · Temporada 2»), una «Documentales» y una por región (Filipinas, Mongolia…); cada vídeo en 2 listas como mínimo. Si Metricool no la pone, Claude la pone en YouTube Studio al publicarse. | manual |
| Y13 | **Pantalla final en los documentales** (YouTube: últimos 5-20 s, vídeo de 25 s o más, hasta 4 elementos en 16:9): siguiente documental, lista «Documentales» y suscribirse. La tarjeta final del motor en 16:9 (M14) deja libre ese espacio los últimos ~15 s. | motor (pendiente) |
| Y14 | **Short ↔ documental:** cada short derivado de un documental lleva **«vídeo relacionado»** → el documental (YouTube Studio, a mano: no va por la API de Metricool) y el enlace en el comentario fijado. En TikTok, el enlace va en el comentario. | manual |
| Y15 | **Español e inglés:** en YouTube Studio, **título y descripción traducidos al inglés** además de la pista `.srt` EN (M10). El **doblaje automático** de YouTube, desactivado (cambiaría la voz de Salma, N8) salvo que Paco quiera probarlo en un documental. | manual |
| Y16 | **Medir cada pieza a las 48 h y a los 7 días** y anotarlo en `docs/metricas-canal.md`: % «lo vieron» vs «lo deslizaron» (Shorts), retención a los 20 s (a los 30 s en documentales), duración media, CTR de impresiones (documentales), suscriptores y fuente de tráfico. Metricool no da estos datos por vídeo de YouTube: se leen en YouTube Studio y TikTok Studio (solo lectura). Con 4-6 semanas de datos se revisan las reglas G e Y. | manual |

**⚠ Dónde choca algo con lo aprobado (decide Paco):**
1. **Y3 (≤ 60 caracteres) frente a L1** («<Pueblo> · Pueblos borrados del mapa»): con el nombre de la serie, el título ya gasta ~30 caracteres y no cabe la búsqueda. Ejemplo: «Los konyak: los últimos tatuados de la India · Pueblos borrados del mapa» = 71. Propuesta: en el título, pueblo + búsqueda (≤ 60) y la serie pasa a la descripción, el hashtag y la lista (Y12); o se acepta pasar de 60 solo por el nombre de la serie.
2. **P13 (una pieza al día, YouTube + TikTok) y los documentales en TikTok:** encaja (el jueves sale el documental en las dos redes). Solo falta comprobar el límite de duración de Metricool para TikTok (ver §5).

### G · Gancho de los primeros 20 s (G2-G8)
| ID | Regla propuesta | Comprobación |
|---|---|---|
| G2 | **Estructura segundo a segundo (shorts):** **0-1 s** primer fotograma = persona y ya en movimiento (M15), sin negro, fundido ni logo · **0-3 s** frase-gancho de voz (pregunta o dato que choca, ≤ 12 palabras) + texto en pantalla · **3-8 s** por qué importa ahora: lo que se está borrando, con una cifra (M9) · **8-15 s** situar: mapa corto 3-5 s con la sintonía y rótulo de lugar (M7, S3) · **15-20 s** primer «pago»: un dato o imagen fuerte que cumple parte de la promesa y deja otra pregunta abierta → entra el sígueme (M13) cuando ya se ha dado algo. Amplía N2 y M1 sin contradecirlas. | manual |
| G3 | **El mapa de cabecera va DESPUÉS del gancho, nunca como primera imagen** (hoy suena la sintonía sobre el mapa al principio): el mapa no engancha a quien no conoce el sitio. Cambia el orden de M1/M7/S3 en los shorts nuevos → **decisión de Paco**. | manual |
| G4 | **La promesa:** los primeros 3 s dicen qué va a saber quien se quede («por qué se colgaban los ataúdes», «quién queda que sepa escribirla») y el vídeo lo cumple. Nada de «mira qué raros» (L1) ni de cebos que no se pagan (N6). | manual |
| G5 | **Texto en pantalla en el gancho:** 3-6 palabras grandes con la promesa, de 0 a 3 s, en la zona libre de botones (M10: por encima de 1.260 px, márgenes de 100 px), sin chocar con el subtítulo; para quien lo ve sin sonido. Es el mismo texto que la portada (M11) o lo continúa. | motor (pendiente) |
| G6 | **Prohibido en los 20 primeros segundos:** saludar, «en este vídeo…», presentar a Salma o a Paco, logos, la app (N5), música sola sin voz más de 1 s, un fundido de entrada. | manual |
| G7 | **Dos o tres versiones del gancho en el guion** (G1): Paco elige. La que no sale se guarda para el short derivado o el avance, y así se comparan ganchos con datos (§6). | manual |
| G8 | **Largos:** gancho de 30-45 s con el momento más fuerte del documental por delante («en frío»), la promesa del documental y después el título y el mapa; el primer aviso de suscribirse (M13 en lista) después del gancho. Se mide la retención a los 30 s en YouTube Studio. | manual |

### Fuentes consultadas (4 nov 2026)
Oficiales: [YouTube Help: pantallas finales](https://support.google.com/youtube/answer/6388789) (últimos 5-20 s, vídeo ≥ 25 s, hasta 4 elementos) · [YouTube Help: Test & Compare de miniaturas](https://support.google.com/youtube/answer/13861714) y [de títulos y miniaturas](https://support.google.com/youtube/answer/16391400) (gana por cuota de tiempo de visionado) · [Blog de YouTube: doblaje automático](https://blog.youtube/creator-and-artist-stories/youtube-auto-dubbing-explained/).
De terceros (cifras orientativas, no oficiales): [vidIQ, YouTube SEO 2026](https://www.vidiq.com/blog/post/youtube-seo/) · [Metricool, SEO en YouTube](https://metricool.com/youtube-seo/) · [vidIQ, algoritmo de Shorts 2026](https://vidiq.com/blog/post/youtube-shorts-algorithm/) · [ContentStudio, analítica de Shorts](https://contentstudio.io/blog/youtube-shorts-analytics-guide) · [Shortimize, retención de Shorts](https://www.shortimize.com/blog/youtube-shorts-retention-rate) · [Storyblocks, capítulos](https://www.storyblocks.com/resources/tutorials/how-to-add-chapters-to-youtube-video) · [Search Engine Land, enlace de Shorts a vídeos largos](https://searchengineland.com/youtube-enables-linking-shorts-long-form-videos-430655) · [Social Media Today, prueba de títulos](https://www.socialmediatoday.com/news/youtube-adds-title-testing-youtube-studio/753015/).
Lo que dicen todas: título y miniatura deciden el clic; los capítulos hacen que un largo salga en varias búsquedas; las etiquetas pesan poco; en Shorts el primer segundo decide («lo vieron» vs «lo deslizaron»). Desde marzo de 2025 las vistas públicas de Shorts cuentan cualquier reproducción, así que miramos «vistas con interacción» y retención, no la cifra de vistas.
