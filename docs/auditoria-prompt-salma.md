# Auditoría del prompt de Salma — contradicciones y fallos posibles (22 oct 2026)

Origen: caso mvj8dc8qqbl7 / pregunta «Khao Sok y alrededores» con una guía abierta (4 fallos en una respuesta).
Alcance: TODO el prompt y todos los modos, no solo ese caso. **Solo lectura: no se ha cambiado ni una línea.**
Archivo: `worker/salma-worker.js` (líneas de la versión `cffabb6`). Protocolo para tocarlo: skill `prompt-salma`.

## Cómo se arma lo que ve el modelo
- **System** (según modo): `SALMA_SYSTEM_CHAT` (identidad, personalidad, muletillas, antipaja, geografía, ACCIÓN, FORMATO, notas, mapa, visión) · `SALMA_SYSTEM_PLAN` (FORMATO_PLAN primero; sin BLOQUE_FORMATO) · `SALMA_SYSTEM_ROUTE` (+BLOQUE_RUTAS) · `WHATSAPP_SYSTEM_CHAT` (ACCIÓN completo).
- **Pegado al mensaje del usuario** (`buildMessages`, ~7350-7490), UNO tras otro: (1) bloque `[RUTA ACTUAL…]` si hay guía abierta, y después (2) UN modo: FOTO / RECOMENDACIONES / OBLIGATORIO-GENERA-RUTA / PLAN DE VIAJE / **CONVERSACIONAL** (el `else`).
- Con una guía abierta, el modelo recibe a la vez el bloque de edición y el CONVERSACIONAL. Es donde chocan las reglas.

## Hallazgos (🔴 afecta a todos los usuarios · 🟠 a un modo concreto · 🟡 menor)

### 🔴 1. Anuncia fotos que luego no salen
- `BLOQUE_ACCION`: «lo que no sabes… lo buscas — y le dices al usuario qué estás haciendo: "Déjame buscarlo."». `BLOQUE_MAPA`/CONVERSACIONAL: «buscar_foto 1-3».
- Resultado: narra «Te saco primero un par de fotos». Después el Worker quita las fotos que no son de un sitio marcado `[[ ]]` (`filtrarFotosNoMarcadas`, ~3382). Khao Sok iba sin marcar → foto fuera, frase se queda.
- Afecta: chat web en cualquier tema con fotos; en WhatsApp (sin `buscar_foto`) puede narrar «déjame buscarlo» sin herramienta.
- Arreglo (texto): no narrar la herramienta; las fotos aparecen solas. Una regla en ACCIÓN, no una por modo.

### 🔴 2. Guía abierta: dos instrucciones opuestas en el mismo mensaje
| Bloque de edición (`~7380`) | CONVERSACIONAL (`~7480`) |
|---|---|
| «contesta en corto: 2-4 frases, sin listas, como mucho UNA foto» | «Fotos 1-3»; «extiéndete… información rica» si la pregunta pide amplitud; «y alrededores» = amplitud |
| termina con `SALMA_OFFER_ADD_TO_ROUTE` | termina con «🗺️ Si quieres, te hago una guía de [destino] con mapa; dime cuántos días.» |
- El CONVERSACIONAL va el último y gana por cercanía. Por eso salió larga (~350 palabras), con 4 hoteles y teléfono, y la oferta de «guía nueva» con una guía ya abierta.
- Afecta: **toda pregunta hecha desde una guía abierta** (la ruta de uso más habitual de quien edita).

### 🔴 3. Cuatro ofertas de cierre distintas
1. «te hago una guía de [destino]» (CONVERSACIONAL)
2. `SALMA_OFFER_ADD_TO_ROUTE` → botón «Añadir a la guía» (edición)
3. «dime añádelo» (`BLOQUE_FORMATO`, «PLAN YA DADO», escrita para un plan en el chat, no para una guía guardada)
4. «dale a Añadir a la guía / Crear ruta con mapa» (RECOMENDACIONES)
- Resultado visto: «Khao Sok ya está en tu ruta (parada 42)… Te lo puedo meter como una parada más, dime añádelo».
- Falta una regla única: con guía abierta, **solo** el botón «Añadir a la guía», y solo si propone algo nuevo.

### 🔴 4. El modelo no sabe si un sitio ya está en la ruta
- Recibe la ficha completa de paradas, pero ninguna regla dice «si el sitio ya está, no lo ofrezcas añadir; di qué hacer con él en la ruta y cómo encaja».
- La respuesta útil era el problema real (día 16 comparte Koh Tao + Pattaya + Khao Sok, costas opuestas): lo detecta («no cabe») y no propone nada.
- Afecta: cualquier consulta sobre una parada existente.

### 🔴 5. Fechas y clima inventados
- «Si vas en noviembre, como en tu plan»: ningún dato del contexto trae fechas; no hay regla «no supongas fechas».
- `BLOQUE_GEOGRAFIA` da monzones por costa (Andamán may-oct, golfo oct-dic) pero Khao Sok (interior, Surat Thani) no está; dijo «mayo a noviembre llueve a diario» y luego «lo mejor dic-abril» (contradicción dentro de la respuesta y con la regla de la costa).
- `BLOQUE_ACCION` pide «TIEMPO Y CLIMA: siempre en tiempo real, sin excepciones» y a la vez INFORMACIÓN «sin tools». Una pregunta de «cuándo ir» cae en las dos.
- Afecta: cualquier destino interior o con microclima.

### 🟠 6. Presentación de resultados obliga a rellenar de más
- `BLOQUE_MAPA`: «Lugares: … teléfono si lo hay», «Hoteles: foto, nombre, precio, puntuación, enlace… destaca mejor valorado y más barato».
- Obligación de formato, no de pertinencia: en cuanto sale `buscar_lugar/hotel`, saca teléfono y 4 alojamientos aunque se pregunte por el destino.
- Sin criterio de «solo lo que se pregunta». Contradice el «Nunca añadas lo que no ha preguntado» del CONVERSACIONAL.

### 🟠 7. Prosa obligatoria vs listas obligatorias
- `BLOQUE_FORMATO`: listas «NUNCA… esto aplica también a transporte, opciones de bus…».
- `BLOQUE_MAPA`: vuelos «Formato: ✈️ Opción 1 — X€ — sale el DÍA…» (una línea por opción = lista). Coches/hoteles igual.
- El modelo elige al azar según el turno. Afecta a vuelos, coches, hoteles.

### 🟠 8. Radios y nº de paradas distintos según el bloque
- `BLOQUE_RUTAS`: 1-2 días ≤30 km; 3-4 ≤60 km; 5+ región amplia; **4-6 paradas/día**.
- RECOMENDACIONES: 1-2 días ≤30 min; 5+ días «nunca dos provincias»; **3-5 sitios/día**. PLAN: **4-5/día**.
- `BLOQUE_RUTAS` solo se usa tras «[OBLIGATORIO — GENERA RUTA AHORA]» (camino casi muerto con el botón actual), pero sigue en `SALMA_SYSTEM_ROUTE`/`BASE`, que se guarda en Firestore/`/prompt`.

### 🟠 9. «NUNCA generes SALMA_ROUTE_JSON» repetido 6 veces y a la vez «si pide ruta nueva, genera desde cero»
- Repetido en `BLOQUE_RUTAS`, `ACCIÓN` (tipo 2 y 3), `RUTA_INFO_DIRECTA`, CONVERSACIONAL, PLAN, RECO.
- El bloque de edición dice lo contrario: «ruta nueva (otro destino)… genera desde cero con SALMA_ROUTE_JSON». Dentro de una guía abierta, «hazme otra de Japón» tiene dos órdenes opuestas.

### 🟡 10. Preguntas al final: prohibidas y exigidas
- Prohibidas (`FORMATO`, CONVERSACIONAL, PLAN). Pero `ACCIÓN`: «SI DUDAS entre tipo 2 y 4 — pregunta», «Visados: pregúntale la nacionalidad». Raro, pero es otra contradicción.

### 🟡 11. Conocimiento «hasta agosto 2025»
- `BLOQUE_ACCION`/`MAPA` fijan agosto 2025 como corte. Estamos en octubre 2026: ~14 meses de «puede haber cambiado» para casi todo. Empuja a `buscar_web` y a avisos innecesarios.

### 🟡 12. WhatsApp hereda `BLOQUE_ACCION` entero
- Incluye `SALMA_ACTION`, `HISTORIA_LUGAR`, `buscar_web`, `buscar_foto`, que no existen allí. Se parchea con `stripWaLeakedMarkers` y una nota. Funciona, pero cualquier regla nueva en ACCIÓN sale también por WhatsApp sin probarse (ver regla 1).

## Qué más puede fallar (no visto aún, deducido del código)
1. **Dos sesiones tocando el mismo prompt:** hoy hubo 4 commits de hoteles (12:14-12:59) en este fichero. La auditoría está hecha sobre el estado actual, pero cada cambio nuevo reabre estas contradicciones.
2. **El último bloque gana:** el orden (ficha de ruta → modo) decide el comportamiento. Mover un bloque cambia respuestas sin cambiar ni una palabra.
3. **Frase de anuncio sin acción** (fallo 1) puede repetirse con `buscar_hotel`, `buscar_vuelos`, `generar_video` si fallan o se filtran.
4. **Reglas que dependen de código externo al prompt:** el filtro de fotos, el botón «Añadir», `SALMA_OFFER_ADD_TO_ROUTE`, las marcas `[[ ]]`. El prompt no sabe qué hace el Worker después; si el Worker cambia, el prompt miente.
5. **Caché:** cada cambio de texto deja fría la caché una vez (~0,01 €) y mover un bloque lo repite.

## Propuesta de orden (un cambio cada vez, con tu OK en cada uno — protocolo prompt-salma)
Antes: tag `v-pre-prompt-20261022`. Banco: 26 preguntas ≈ 1-1,5 € (§8/§11) antes y después de la tanda.
1. **(fallo 1)** Regla única en ACCIÓN: no anunciar herramientas ni fotos.
2. **(2+3+4)** Un solo bloque «GUÍA ABIERTA» que sustituya a los dos: respuesta corta, sin oferta de «guía nueva», una sola oferta (botón «Añadir a la guía») y solo si el sitio NO está ya en la ruta; si está, decir cómo encaja.
3. **(5)** «No supongas fechas de viaje que el usuario no ha dado» + añadir interior de Tailandia/Khao Sok a los monzones.
4. **(6+7)** Criterio «solo lo preguntado» en MAPA; aclarar que el formato ✈️ por opción es la excepción a «sin listas».
5. **(8+9+11)** Limpieza de `BLOQUE_RUTAS`, de la repetición de «NUNCA JSON» y del corte «agosto 2025». Es lo más delicado; solo si pides.

## Encontrado al construir el prompt único (22 oct 2026, tarde)
- 🔴 **Con una guía guardada, todo el chat cambiaba de Salma.** La app manda siempre la última guía (`current_route`) y
  `buildMessages` elegía entonces `SALMA_SYSTEM_ROUTE`, no `SALMA_SYSTEM_CHAT`: otro prompt y sin caché barata, sin modo de
  pensar rápido y sin «fotos abajo» (solo se aplicaban con el de chat).
- 🔴 **«Añade 2 días en Krabi» con la guía abierta** recibía a la vez «CAMBIOS EN ESTA RUTA — NO la reescribas
  (SALMA_ROUTE_EDIT)» y «OBLIGATORIO — GENERA RUTA AHORA: DEBE contener SALMA_ROUTE_JSON, 4-6 paradas por día».
- 🔴 **La fecha de hoy se tomaba como fecha del viaje.** `[FECHA ACTUAL]` va en el contexto y Salma escribía «estás pensando
  en octubre» y dejaba fuera el golfo de Tailandia. Pasaba también con el prompt de siempre.
- 🟠 **Reglas de formato dentro de los datos**: los resultados de ayuda cercana y el tiempo real traían su propio formato
  («**Ahora**: 34°C», teléfono por línea). Ahora son excepciones escritas en el núcleo.
- Fotos: el comprobador propio de las fotos (400 km del centro de la guía, nombres que exigían palabras iguales) — resuelto
  con un solo comprobador (CLAUDE.md §13, `scripts/probar-nombres.cjs`).

Solución: **prompt único** (`docs/prompt-unico.md`), detrás de `PROMPT_UNICO` en `wrangler.toml`.
