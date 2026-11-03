# «Tatuajes del mundo» — documental largo — GUION DE DIRECCIÓN v1 (3 nov 2026)

**Decisión de Paco (3 nov 2026, 12:41): este fichero es la ÚNICA versión del documental a partir de ahora.**
La versión anterior en Claude Docs (otro chat) queda descartada — no se sincroniza, no se vuelve a tocar.
Todo el trabajo del documental (guion, correcciones, voz, imagen) se hace en este repo de aquí en adelante.

Documental largo para YouTube (4 bloques), con plan de shorts/derivados aparte (no incluido en este fichero).
Fuentes y verificación: `docs/tatuajes-documental-fuentes.md` (F4, cerrado tras 3 tandas de investigación).
Mismo motor y reglas M/N/S/P de `docs/video-checklist.md`. **Narración: solo Salma, datos con fuente, sin
relleno ni cierres poéticos (N6).** Paco no ha estado en ninguno de estos viajes → sin «basado en un viaje
real» salvo que él decida meter algo propio.

Este guion ya incorpora las correcciones de F4. Dos datos del borrador original se **eliminan por falta de
fuente fiable tras 3 búsquedas**: Hells Angels y tatuaje carcelario específicamente español (ver fichero de
fuentes). Si Paco quiere mantenerlos con otra fuente que él aporte, se revisa.

**Hilo que recorre todo el documental (nuevo, no estaba en el borrador):** de la marca de rango a la marca
que delata. En los Bloques 2-3 el tatuaje es señal de pertenencia, rango o protección. En el Bloque 4 ese
mismo tatuaje se vuelve un riesgo — Yakuza, Tríadas y MS-13 lo abandonan por la misma razón: identifica.
Usar esta idea en el gancho inicial y recogerla en el cierre del Bloque 4.

---
## FICHA TÉCNICA
- **Título:** Tatuajes del mundo.
- **Duración estimada:** 35-45 min, horizontal (YouTube largo). De aquí salen shorts/derivados en pieza
  separada (no en este fichero — ver `docs/especial-tatuajes-guion-direccion.md`, aparcado).
- **Narración:** Salma, tono serio/documental clásico, datos con fuente (N6). **Voz: `SALMA_DOC`** (`motor/voces.cjs`): la misma voz con estabilidad 0,3, más dinámica — Paco la eligió el 3 nov 2026 oyendo el gancho a 1,0 / 0,5 / 0,3. Solo para este documental.
- **Formato:** horizontal 16:9 (`cfg.formato`). Prueba del gancho: `motor/tatuajes-gancho.cjs` → `salma marketing/tatuajes/salida/`. Más fotos de pueblos tatuados (W29-W79): `salma marketing/tatuajes/hoja-pueblos-tatuados.png`.
- **Conexión con Borrado del Mapa:** tabla de destinos-ancla por bloque (abajo) + transición «Hoy viajamos
  a…» entre bloques, formato ya usado en la serie («BORRADO DEL MAPA · CAP. X»).

## TABLA DE DESTINOS-ANCLA
| Bloque | Destino(s) que se nombran | Frase de transición |
|---|---|---|
| 1 · Historia | Alpes (Ötzi) → Tahití (Cook) → Japón | «Hoy viajamos a los Alpes, donde empieza esta historia.» |
| 2 · Pueblos | Nueva Zelanda · Samoa · Borneo (Sarawak) · Hokkaido (Japón) · Valle de Ziro (India) | «Hoy viajamos de isla en isla, y de pueblo en pueblo.» |
| 3 · Talegueros | Rusia · Honduras/El Salvador | «Hoy no viajamos a un lugar, sino a un código: el de quien está dentro.» |
| 4 · Mafias | Japón · Sicilia/Nápoles · China/Malasia · Rusia · México | «Hoy viajamos al otro lado de la ley, en cinco países distintos.» |

---
# BLOQUE 1 · HISTORIA DEL TATUAJE (~8-10 min)

## ESCENA 1.0 · GANCHO
- **Imagen (propuesta de Claude, 3 nov 2026; Paco: «propón tú»):** W2 (cara de la reconstrucción de Ötzi, persona primero M15) con empuje lento mientras dice «Hace 5.300 años…» → en «¿Estás tatuado?», negro 0,5 s → fogonazos de ~1 s con cada motivo: «curarse» W1 · «de qué pueblo» W26 (moko de Te Pehi Kupe) · «castigo» W13 (tatuajes penales japoneses) · «la cárcel» W28 (preso soviético) · «una mafia» W17 (irezumi de Kimbei) → «Tu motivo…» vuelve a W2.
- ✅ **Paco aprueba la propuesta de fotos del gancho y de las escenas 1.1-1.3 (3 nov 2026: «OK, adelante»).**
- **Fotos del gancho y el Bloque 1:** `salma marketing/tatuajes/fotos/` (ATRIBUCIONES.txt; descartes con su motivo en `descartadas-otro-sitio/NOTA.txt`). Hoja: `salma marketing/tatuajes/hoja-bloque1-y-gancho.png`.
- **No hay foto libre de los tatuajes reales de Ötzi** y además es una momia (F9: sin restos humanos) → se usa la reconstrucción del museo + gráfico del motor (0 €).
- **Salma (v2, versión A elegida por Paco el 3 nov 2026; antes: «Hoy, alguien usa esa misma aguja para esconder quién es…», descartada por liosa):** «Hace 5.300 años, alguien usó una aguja para intentar curar un dolor de pecho. ¿Estás tatuado? ¿Sabes por qué? A lo largo de la historia, la gente se ha tatuado para curarse, para decir de qué pueblo es, como castigo, para marcar su rango en la cárcel… o para entrar en una mafia. Tu motivo puede estar en esta historia.»
- **Voz:** campo `voz` con «cinco mil trescientos» (subtítulo «5.300»). ✅ **Prueba de voz aprobada por Paco (3 nov 2026): «suena bien»** — `salma marketing/tatuajes/voz-prueba/escena-1.0-gancho-salma-v2A.mp3` (20 s, 335 caracteres; queda en la caché del motor, no se vuelve a pagar).
- **Nota (Paco, 3 nov 2026):** el motivo de hoy, «por gusto» (estética, recuerdo), no está en la lista a propósito: **se recoge en el cierre (escena 4.6)**.

## ESCENA 1.1 · ÖTZI
- **Imagen (propuesta 3 nov 2026):** mapa Alpes (motor de mapa) → W1 (cuerpo entero, PM) → **gráfico animado** (motor, 0 €): silueta de Ötzi sobre negro donde se van marcando las líneas de tatuaje + cifra grande «61» (M9) → en «uno, en las costillas», se ilumina solo esa marca → «Era medicina» sobre W6 (otra reconstrucción, GP lento). Sustituye a «fotos multiespectrales» (no hay libres; F9).
- **Salma:** «Ötzi, la momia de los Alpes, murió hace unos 5.300 años con 61 tatuajes mapeados sobre su piel. La mayoría coinciden con puntos de acupuntura. Uno, en las costillas, no está cerca de ninguna articulación: los investigadores creen que buscaba tratar un dolor en el pecho. No era decoración. Era medicina.»
- **Fuente:** ✅ Smithsonian Magazine.

## ESCENA 1.2 · LA PALABRA
- **Imagen (propuesta 3 nov 2026):** mapa Alpes → Tahití → W11 (mapa antiguo con la ruta del Endeavour) → W9 (grabado de Sydney Parkinson, dibujante del viaje de Cook, «rostro curiosamente tatuado»), rótulo «SYDNEY PARKINSON · VIAJE DE COOK». Ojo: el grabado dice «Otaheite y las islas vecinas», pero el tatuaje parece un moko maorí → no rotular «Tahití» encima.
- **Salma:** «La palabra "tattoo" viene del tahitiano y samoano *tatau*. La escribió así, por primera vez en inglés, el capitán Cook en 1769.»
- **Fuente:** ✅ Etymonline.

## ESCENA 1.3 · JAPÓN — DE LA MEDICINA AL ESTIGMA
- **Imagen (propuesta 3 nov 2026):** mapa Tahití → Japón → «castigo penal» W13 y W14 (láminas de tatuajes penales, una tras otra) → «1868, prohibido» W15 (Beato, h. 1870) → «clandestinidad» W16 y W18 (Stillfried, Ogawa) → «1948» W19 o W20 (Kuniyoshi, como respiro de color) → «Hoy, muchos miembros de la Yakuza…» W17. **W22 y W23 (Sanja Matsuri, personas reales de hoy) NO van aquí:** que sean Yakuza no está comprobado; solo como «irezumi hoy» y sin decir quiénes son.
- **Salma:** «En Japón, el tatuaje se usó como castigo penal desde el periodo Kofun, en torno al siglo III, y siguió marcando a los condenados durante siglos. Pero en 1868 el gobierno Meiji lo prohibió por completo. Y fue esa prohibición, no el tatuaje en sí, lo que lo empujó a la clandestinidad — y lo unió, para siempre, a la idea de criminalidad. Se legalizó de nuevo en 1948. Hoy, muchos miembros de la Yakuza evitan tatuarse precisamente por el estigma que arrastra desde entonces.»
- **Fuente:** ⚠ Wikipedia (Irezumi) — corrección aplicada: la prohibición Meiji como causa del estigma, no como dato suelto; se adelanta aquí el dato del Bloque 4 (Yakuza evita tatuarse) como anticipo, sin desarrollarlo todavía.
- **Rótulo transición:** «BORRADO DEL MAPA · TATUAJES DEL MUNDO» + «Hoy viajamos de isla en isla, y de pueblo en pueblo.»

---
# BLOQUE 2 · PUEBLOS Y SU SIGNIFICADO (~10-12 min)

## ESCENA 2.1 · MAORÍES (NUEVA ZELANDA) — tā moko
- **Imagen:** mapa → Nueva Zelanda → tā moko.
- **Salma:** «En Nueva Zelanda, el tā moko maorí no se talla con aguja, sino con cincel: cortes profundos en la piel, no simple punción. Por eso deja una cicatriz distinta a la de cualquier otro tatuaje polinesio. Su origen está ligado al luto: las mujeres se cortaban la piel y añadían hollín en memoria de alguien querido. Y a la mitología, al dios Rūaumoko y al mito de Mataora y Niwareka.»
- **Fuente:** ⚠ Te Ara (Encyclopedia of New Zealand) — **corrección aplicada:** se elimina la afirmación de que el moko marca directamente rango o linaje (no está verificada); se sustituye por el origen en el luto y la técnica de cincel.

## ESCENA 2.2 · SAMOA — pe'a
- **Imagen:** mapa → Samoa → herramientas tradicionales (peine de hueso, maceta).
- **Salma:** «En Samoa, el pe'a cubre de la cintura a las rodillas. En teoría se hace en cinco sesiones a lo largo de diez días; en la práctica, por el dolor y la curación, pueden ser semanas. Se golpea un peine de hueso, el *ausogi'aso*, con una maceta, el *sausau*. Antes era un requisito para el título de *matai*, jefe de familia. Ya no lo es — pero muchos lo siguen haciendo igual.»
- **Fuente:** ✅ Pitt Rivers Museum, Oxford.

## ESCENA 2.3 · DAYAK/IBAN DE BORNEO (SARAWAK)
- **Imagen:** mapa → Borneo/Sarawak.
- **Salma:** «Entre los iban de Borneo, un tatuaje de rana en la garganta se cree que protege de morir decapitado en combate. El primer tatuaje de un hombre, una espiral en el hombro llamada *bunga terung*, se hace antes de su *bejalai*, un viaje iniciático, y se cree que le da fuerza para el camino. Los iban creen que los espíritus conceden los tatuajes en sueños — y que un hombre sin tatuajes es casi invisible para los dioses.»
- **Fuente:** ✅ SAYS.com — **corrección aplicada:** se elimina la idea de que los tatuajes "registraban cabezas tomadas"; se sustituye por protección espiritual y el *bunga terung* como primer tatuaje del *bejalai*.
- **~sígueme (M13), sonido *batok*.**

## ESCENA 2.4 · AINU (HOKKAIDO, JAPÓN)
- **Imagen:** mapa → Hokkaido → fotos de archivo de mujeres ainu.
- **Salma:** «Las mujeres ainu, en el norte de Japón, se tatuaban la boca y los antebrazos. Empezaban entre los diez y los trece años — a veces antes — y terminaban hacia los quince o dieciséis: la señal de que estaban listas para casarse. La colonización japonesa de Hokkaido, entre 1869 y 1904, acabó prohibiéndolo.»
- **Fuente:** ✅ Wikipedia (Ainu people) — **nota:** no dar un año exacto de la prohibición, la fuente no lo precisa.

## ESCENA 2.5 · APATANI (VALLE DE ZIRO, INDIA)
- **Imagen:** mapa → valle de Ziro → fotos de ancianas apatani.
- **Salma:** «En el valle de Ziro, en India, las mujeres apatani llevaban tatuaje facial y tapones de nariz de madera. No era estética: era protección contra el rapto. Se lo hacían con diez años, otras mujeres mayores. Se prohibió en los años setenta. Hoy, solo las abuelas lo llevan.»
- **Fuente:** ✅ Vajiram & Ravi.
- **Rótulo transición:** «Hoy no viajamos a un lugar, sino a un código: el de quien está dentro.»

---
# BLOQUE 3 · TATUAJES TALEGUEROS (~8-10 min)

## ESCENA 3.1 · RUSIA — EL CÓDIGO VORY V ZAKONE
- **Imagen:** mapa → Rusia → fotografías de archivo con licencia libre de tatuajes carcelarios rusos.
- **Salma:** «En las cárceles rusas, cada tatuaje del código *vory v zakone* dice algo concreto. Estrellas en los hombros o las rodillas: "no me arrodillo ante nadie" — la de ocho puntas marca rango. Cúpulas de iglesia ortodoxa en el pecho: cada cúpula, una condena; tres cúpulas, preso para siempre. Un ojo en el pecho: "te vigilo". Un gato, a veces con sombrero: el ladrón profesional.»
- **Salma (continúa):** «Pero llevar un tatuaje que no te has ganado era, y a veces sigue siendo, peligroso de verdad: en los años cincuenta, bajo la represión de Jrushchov, se castigaba con violación o muerte. Hacia los setenta, al extenderse entre los presos más jóvenes, los líderes dejaron de castigarlo así.»
- **Fuente:** ✅ Wikipedia (Russian criminal tattoos), con fuentes académicas citadas (Bronnikov 2016, Sidorov 2008, Sorrell 2006).

## ESCENA 3.2 · MS-13 — EL GIRO: ABANDONAR LA MARCA
- **Imagen:** mapa → Honduras/El Salvador.
- **Salma:** «En Honduras, según un policía que investiga a las maras, muchos miembros de la MS-13 han dejado de tatuarse símbolos de la pandilla. El mismo tatuaje que antes marcaba pertenencia hoy los hace fáciles de identificar — por la policía, y por bandas rivales.»
- **Fuente:** ✅ InSight Crime — **nota F4:** es un testimonio policial reciente, no una norma escrita ni fechada; decirlo como tendencia, no como dato cerrado.
- **Rótulo transición:** «Hoy viajamos al otro lado de la ley, en cinco países distintos.»

---
# BLOQUE 4 · MAFIAS DEL MUNDO (~8-10 min)

## ESCENA 4.1 · YAKUZA (JAPÓN) — EL ESTIGMA QUE VIENE DE 1868
- **Imagen:** mapa → Japón → tebori (tatuaje a mano) de archivo.
- **Salma:** «La Yakuza heredó el irezumi integral, el tebori, hecho a mano. Pero el estigma que empezó con la prohibición Meiji de 1868 sigue vivo: hoy muchos yakuza evitan tatuarse precisamente por ese estigma. Balnearios, gimnasios y negocios siguen prohibiendo la entrada a quien lleva tatuajes visibles.»
- **Fuente:** ⚠ Wikipedia (Irezumi).

## ESCENA 4.2 · COSA NOSTRA VS. CAMORRA — DOS MAFIAS, DOS CULTURAS
- **Imagen:** mapa → Sicilia → Nápoles.
- **Salma:** «En Sicilia, la mayoría de los miembros de la Cosa Nostra no llevan tatuajes que los identifiquen como tales — aunque hay excepciones documentadas, como un caso de "mano negra" ligado a la organización. En Nápoles, la Camorra es justo lo contrario: tiene tradición de tatuaje carcelario desde el siglo XIX, para marcar lealtad. Un grupo joven de Ponticelli se ganó el apodo de "los tatuados" por tatuarse el nombre de su jefe.»
- **Fuente:** ⚠ JHU Stripe (Cosa Nostra) + Worldcrunch (Camorra) — **corrección aplicada:** no se afirma que la Cosa Nostra "nunca se tatúe" como norma deliberada; se contrasta con la Camorra en su lugar.

## ESCENA 4.3 · TRÍADAS CHINAS — EL MISMO GIRO QUE LA YAKUZA
- **Imagen:** mapa → China/Malasia → tatuajes de dragón y tigre de archivo.
- **Salma:** «En las tríadas chinas, los tatuajes de dragón y tigre marcaban antiguamente el rango. Pero, según un criminólogo especializado, hoy el tatuaje ya no forma parte de la iniciación: los grupos lo evitan para no ser detectados. Muchos líderes no llevan ninguno. Un tatuaje de tríada, por sí solo, ya no prueba nada.»
- **Fuente:** ⚠ MCPF (Majlis Pencegahan Jenayah Malaysia), declaraciones de P. Sundramoorthy.

## ESCENA 4.4 · MÉXICO — SANTA MUERTE, MÁS QUE UN SÍMBOLO NARCO
- **Imagen:** mapa → México → altares de Santa Muerte.
- **Salma:** «En México, la Santa Muerte se tatúa pidiendo protección. Se la ha llamado "la santa narco" — pero una investigación académica de más de diez años de observación dice que esa etiqueta es reduccionista: también la veneran policías, militares y guardias de prisión, pidiendo protección para ellos y sus familias. Hay más de mil grupos y decenas de miles de devotos. Las autoridades mexicanas han destruido miles de altares.»
- **Fuente:** ✅ Kingsbury & Chesnut (2020), vía Baylor ISR / Religion Watch — **corrección aplicada:** se elimina el encuadre exclusivamente narco del borrador original.

## ESCENA 4.5 · RUSIA POSTSOVIÉTICA — ¿SOBREVIVIÓ EL CÓDIGO?
- **Imagen:** mapa → Rusia (segunda vez, ahora en clave mafia organizada).
- **Salma:** «El código de los vory v zakone sobrevivió a la caída de la URSS: hoy la Bratva, la mafia rusa, es la red más amplia, con los vory como una élite que sigue sus reglas — lealtad, silencio, nunca cooperar con la policía. Pero ese código ya se había empezado a resquebrajar desde los años cuarenta, con presos que volvían del Ejército Rojo y sí colaboraban con el Estado.»
- **Fuente:** ⚠ Wikipedia (Russian mafia) — **nota F4 importante:** la fuente confirma la continuidad del código en general, pero NO confirma específicamente que el sistema de tatuajes sobreviviera igual; no afirmarlo en la voz como un hecho cerrado — se deja como pregunta abierta, no como dato.

## ESCENA 4.6 · CIERRE — EL GIRO COMÚN
- **Imagen:** GP lento, plano largo (pico, M1) — montaje rápido de los tatuajes vistos: Ötzi, moko, pe'a, vory, Yakuza.
- **Salma:** «Yakuza, tríadas, maras: tres mafias distintas, en tres continentes, han llegado a la misma conclusión. El tatuaje que antes probaba pertenencia hoy puede delatarte. La piel sigue contando historias — pero, a veces, el silencio de la piel cuenta más.»
- **⚠ PENDIENTE (Paco, 3 nov 2026):** recoger aquí la pregunta del gancho (1.0) y el motivo que falta en su lista: hoy casi todo el mundo se tatúa **por gusto**. Reescribir el cierre con eso antes de generar su voz.
- **Nota N6:** esta frase de cierre es la única con tono reflexivo de todo el documental; se apoya en tres datos verificados (Yakuza, Tríadas, MS-13), no es relleno. Revisar con Paco si se ajusta a N6 o si se prefiere una versión más seca con cifra.

## TARJETA FINAL
«Tatuajes del mundo» → icono de Salma → «CREA TUS RUTAS CONMIGO» → «Descarga la app de guías de viaje · Gratis» → borradodelmapa.com.

---
## Decisiones de Paco (OK 3 nov 2026, 11:45)
1. ✅ **Hilo conductor** (pertenencia → riesgo de ser detectado) — aprobado, se queda como columna del documental.
2. ✅ **Hells Angels y tatuaje carcelario español** — aprobado dejarlos fuera del guion.
3. ✅ **Escena 4.6 (cierre reflexivo)** — aprobada tal cual está escrita.
4. ⏸ **Duración** — se deja para medir al grabar la voz, no se recorta ahora.
5. ⏸ **Coste (F5):** sigue pendiente — no se genera ni una frase de voz hasta disclosure de coste + prueba de una sola frase.

Pendiente ahora: acordar formato de imagen/clip real para cada escena (museo, archivo libre, animación de mapa). Coste de ElevenLabs ya avisado (§8): ~0,30-1,00 $ para toda la narración en pago por uso, o ~0 € marginal si va contra una suscripción ya activa. Siguiente paso: generar la escena 1.0 (gancho) como prueba de una sola frase antes de generar el resto.
