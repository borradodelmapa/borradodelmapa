# WhatsApp F5 — saga y notas de Paco

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

### 📱 Salma en WhatsApp (F5) — estado actual

Canal de WhatsApp vía Twilio Sandbox, en paralelo a la web (no la sustituye). Historial
completo del desarrollo (F5.0-F5.4) en `CLAUDE-historial.md`.

- **F5.1-F5.4 hechos y confirmados en pantalla**: eco → conectado al motor real de Salma
  (`WHATSAPP_SYSTEM_CHAT`, sin tools/memoria todavía) → auto-registro de cuenta nueva
  desde WhatsApp → vinculación con cuenta existente → login desde la web con el número.
- **Login definitivo (25-26 sept 2026): dos botones, "Entrar con Google" / "Entrar con
  WhatsApp" — CONFIRMADO EN PANTALLA por Paco de punta a punta, ordenador y móvil.**
  Móvil y ordenador usan EXACTAMENTE el mismo mecanismo: un código de un solo uso que el
  propio botón mete en el mensaje de WhatsApp, invisible para quien lo manda —
  `/wa-qr-start` genera el código (Firestore `wa_qr_logins/{código}`, 10 min), el
  webhook `/whatsapp` lo reconoce con el regex `entrar en (la app|el ordenador)\W*código`
  (no importa nada más del texto), y el navegador que pregunta por `/wa-qr-poll` entra
  solo. En el ordenador se enseña como QR (`vendor/qrcode-generator-1.4.4.js`, con aviso
  de no escanearlo con el propio escáner de WhatsApp — daba "QR inválido"); en el móvil,
  WhatsApp se abre directo con el texto ya escrito y, al volver a la pestaña
  (`visibilitychange`/`pageshow` + `localStorage`), la web entra sola sin tocar nada.
  Auto-registro de cuenta nueva sin tocar (`_waCreateAccount`, mismo camino de siempre).
  **Dos vueltas de fallos reales antes de esto** (documentadas en `CLAUDE-historial.md`
  si hace falta el detalle): primero el saludo de bienvenida solo reconocía "Hola" y no
  "Hola Salma" (el texto real que manda el botón); después, aun arreglado eso, la señal
  usada ("primer mensaje del día") se rompía al probar el botón varias veces seguidas el
  mismo día — sustituido por el código de un solo uso, que no depende del texto ni de
  cuántas veces se pruebe. Commits `9141069` → `747331d` → `ba77386`, **Worker Version
  ID final `9a72a107-f172-493a-a9b8-a0687c724cda`**, `app.js?v=163`.
- **F5.3 (tools + memoria por WhatsApp) sin empezar** — depende de F5.4 (ya hecho) y no
  tiene fecha.
- **F5.5 (proactivo, plantillas Meta) BLOQUEADO** — Twilio rechazó el Business Profile de
  producción por Business ID no verificable (18602): sin alta de autónomo o una SL con
  CIF, el DNI de Paco no pasa el KYB de Meta/Twilio. **Decisión de negocio pendiente de
  Paco, no técnica** — no perseguir esto hasta que él decida alta de autónomo o formar
  una SL. Mientras tanto, todo sigue en Twilio Sandbox (funciona igual, solo con el límite
  de que Salma no puede escribir primero fuera de plantillas aprobadas).
- Cambio de coste a vigilar: desde el 1 oct 2026 los mensajes de servicio de WhatsApp
  dentro de la ventana de 24h dejan de ser gratis en Twilio — verlo cuando llegue.

**Notas de Paco, 26 sept 2026 — 5 tareas dictadas, a hacer en orden:**
1. ~~Panel admin: eliminar usuarios~~ — **HECHO y CONFIRMADO EN PANTALLA por Paco el 25
   sept 2026, de punta a punta** (borrar cuenta real de WhatsApp → desaparece de la lista
   → volver a registrarse con el mismo número → aparece bien otra vez). Costó 3 bugs
   reales encontrados en el propio proceso (confirmación por texto, uid con guion bajo
   rechazado, `whatsapp_sessions` que no se limpiaba) + una auto-reparación de propina.
   **Worker Version ID vigente: `caaf6cae-231f-471f-8eaa-eae657be1c38`.** Detalle completo
   en `CLAUDE-historial.md`.
2. ~~Panel admin: tipo de registro (WhatsApp/Google)~~ — **HECHO** en la misma sesión que
   la tarea 1 (`/admin/stats` expone `phone`/`created_via`; panel `2026-09-26.3`). Salió
   de necesitar distinguir cuentas de WhatsApp para poder probar el borrado.
3. **Personalizar WhatsApp con la imagen de Borrado del Mapa** — **BLOQUEADA, mismo motivo
   que F5.5**: el número de Sandbox (+14155238886) es de Twilio, compartido por todos los
   que prueban WhatsApp con Twilio en el mundo — no se puede personalizar mientras no haya
   número propio (que exige WhatsApp Business Account verificado → alta de autónomo/SL,
   decisión de negocio pendiente de Paco). El "Ok" doble que manda Twilio al unirse al
   Sandbox es del mismo origen — tampoco se puede tocar ni silenciar desde nuestro código.
4. **Revisar los textos exactos** — 12 mensajes revisados con Paco el 25 sept 2026 (alta,
   ya registrado, vinculación con código, errores). El único cambio real de contenido fue
   quitar el atajo de respuestas de KV (ver punto 5) — el resto de textos, tal cual están,
   sin más cambios pedidos por ahora.
5. **Que WhatsApp funcione igual que la web (F5.3)** — EN MARCHA, 25 sept 2026. Checklist
   acordado con Paco (ver `CLAUDE-historial.md` para la tabla completa función por
   función): respuestas KV → historial de conversación → ubicación → buscar sitios → resto
   de tools → los que no caben en chat (rutas completas, mapa en vivo, pagos...) con enlace
   de auto-entrada a la web.

   > **⚠️ NORMA para todo este punto (Paco, 25 sept 2026, tras la cadena de preguntas de
   > "hazme una ruta"):** "si ya funciona en la app, cogemos lo que ya funciona sin
   > estropearlo en la app" — nunca escribir una redacción/lógica propia para WhatsApp
   > cuando ya existe la pieza equivalente probada en la app (prompt, función, regla). Se
   > extrae esa pieza a algo compartido y WhatsApp la reutiliza tal cual, verificando
   > siempre que lo que usa la app queda exactamente igual (ver caso real:
   > `BLOQUE_RUTA_INFO_DIRECTA`, extraída de `BLOQUE_ACCION`, más abajo — costó dos
   > vueltas de bug antes de hacerlo así en vez de parafrasear).
   - **Respuestas instantáneas de KV: HECHO Y REVERTIDO en la misma sesión.** Se implementó
     (reutilizando la detección de país del chat principal, extraída a
     `detectCountryAndKV()`), se probó, y Paco vio en pantalla que la plantilla fija se
     quedaba corta contra Claude (enchufes de Japón: la plantilla no distinguía 50Hz/60Hz
     por zona ni qué adaptador necesita un español). **Decisión: WhatsApp llama siempre a
     Claude**, como la web — se pierde el coste 0 de esta vía pero la calidad es constante.
     `detectCountryAndKV()`/`tryKVDirectAnswer()` siguen vivas y en uso por el chat
     principal, solo se dejaron de llamar desde `/whatsapp`.
   - De propina, un bug real encontrado y arreglado en el camino (afecta también, aunque
     rara vez, al chat principal): la lista de palabras a ignorar al geocodificar con
     Nominatim no incluía palabras como "enchufe" — un mensaje en minúsculas sin "en X"
     capitalizado ("q enchufe hay en japon") geocodificaba "enchufe" ANTES que el país real
     y devolvía España en vez de Japón. Corregido ampliando esa lista.
   - **Historial de conversación: HECHO, 25 sept 2026 — confirmado en pantalla por Paco
     ("funciona a falta de más pruebas").** WhatsApp no tiene navegador que guarde los
     últimos turnos como la web, así que los guarda el propio Worker en KV
     (`wa_history:{numero}`, últimos 20 turnos/40 mensajes, caducidad 6h de inactividad —
     pasado ese rato se trata como conversación nueva). Solo el chat normal lo toca; los
     flujos de alta/login no.
   - **Punto 1, ubicación: HECHO y confirmado en pantalla por Paco, 25 sept 2026 — tres
     vueltas de arreglo antes de darlo por bueno.** Twilio no soporta "ubicación en vivo"
     de WhatsApp (confirmado con búsqueda web), solo mensajes puntuales (Latitude/Longitude,
     con Body vacío) — se guarda en KV (`wa_location:{numero}`) con caducidad de 90 min y se
     trata como un dato que envejece en dos tramos: fresca (<20 min) se usa directa
     mencionándola; entre 20-90 min Salma pregunta "¿sigues en X?" antes de darla por buena;
     pasados 90 min caduca sola y es como si no hubiera ubicación.
     1. Primer intento: al compartir ubicación tras hablar de destinos hipotéticos
        (Marruecos/Japón), Salma confundía la ubicación real con esos destinos y le devolvía
        la pregunta ("¿en qué ciudad de Marruecos o Japón quieres comer?") en vez de usar el
        sitio real. Arreglado dejando explícito en el prompt que la ubicación compartida es
        "de verdad, ahora mismo, en la vida real", no un destino de viaje del que se haya
        hablado antes.
     2. Segundo bug, más grave ("se queda callada"): compartir ubicación mandaba un mensaje
        fijo de confirmación y paraba ahí SIN llamar a Claude — si justo antes había una
        pregunta pendiente ("dónde ir a cenar"), se quedaba sin responder hasta que Paco
        insistía. Arreglado: ahora compartir ubicación llama a Claude con el historial (que
        tiene la pregunta pendiente) + un aviso de que se acaba de compartir ubicación, para
        que confirme la ciudad y siga con lo que se estuviera hablando en una sola respuesta.
        Extraído `buildWaLocationCtx()` para no duplicar la lógica de frescura entre el chat
        normal y este camino. **Aviso de coste (protocolo §8, aprobado por Paco):** compartir
        ubicación pasa de costar 0 (antes, sin llamar a Claude) a costar como un mensaje
        normal de chat.
     3. Confirmado por Paco, EN PANTALLA, que la respuesta ya llega de un tirón nada más
        compartir ubicación, sin tener que volver a preguntar — el bug "se queda callada"
        está cerrado de verdad. El contenido de esa respuesta ("Ribadedeva es municipio
        pequeño, lo que está cerca es Colombres... sigo sin poder buscarte sitios por aquí,
        prueba Google Maps o TripAdvisor") es el esperado ahora mismo: WhatsApp todavía no
        tiene el tool `buscar_lugar` conectado — eso es el punto 6, siguiente en la lista.
   - **Punto 6, buscar_lugar: HECHO y confirmado en pantalla por Paco, 25 sept 2026
     ("busca bien").** Conectado el mismo tool `buscar_lugar` del chat web (Google
     Places real: nombre, dirección, teléfono, rating, Google Maps) a WhatsApp, a través de
     un bucle de tool-use acotado (`waCallClaudeWithTools()`, máx 3 vueltas — sin streaming
     SSE, aquí basta una respuesta final por turno). Se usa tanto en el chat normal como
     justo al compartir ubicación, así una vez compartida puede buscar directo en esa ciudad
     sin volver a preguntarla. Vuelos, hoteles y coches SIGUEN sin conectar (fuera de esta
     tarea). **Aviso de coste (protocolo §8):** cada vez que alguien pida un lugar concreto
     por WhatsApp esto añade 1 Google Places Text Search (~0,032€) + hasta 5 Place Details
     cacheados 30 días (gratis salvo la primera vez que se pregunta por ese sitio) — el
     mismo coste que ya paga cada búsqueda equivalente en la web.
   - **Casos híbridos (rutas completas) — decidido con Paco, 25 sept 2026: NO bloquear.**
     Primera propuesta (interceptar "2 días en X" con un mensaje fijo mandando solo a la
     app) RECHAZADA por Paco: "no me convence, podría contestarte como en la web y dar la
     opción de guardarla en la web". Se decide en su lugar que WhatsApp funcione con LOS
     MISMOS límites que la app (Premium/gratis), no un control aparte — y que si el usuario
     pide guardar, se genere y guarde de verdad, respetando el mismo tope. Partido en 3 pasos:
     1. **Comprobar si puede guardar — HECHO, desplegado, pendiente de confirmar en pantalla.**
        `isSaveRouteRequest()` detecta "guárdala"/"guarda esta ruta" en WhatsApp y llama a
        `usageGate(env, waGetUserPlan(...), 'guide')` — la MISMA función que ya gatea "Crear
        ruta con mapa" en la web (ver corrección de la sección "Modelo de negocio" más abajo:
        esto YA es server-side de verdad, con el plan real de Firestore). Si no le queda,
        mismo mensaje que en la web + enlace a Premium. Si le queda, de momento se le manda a
        guardarla en la app (que ya lo hace bien) — no llama a Claude, coste 0.
     2. **Generar y verificar la ruta de verdad desde WhatsApp — HECHO, desplegado, pendiente
        de confirmar en pantalla.** Se llegó aquí tras un tramo malo (ver más abajo: v3 del
        fix de preguntas, desplegado, seguía sin parecerse a la web) que acabó con Paco muy
        enfadado ("no sé qué cojones estás haciendo") — con razón: yo estaba comparando contra
        el chat normal de la web, pero "1 día en X" en la web dispara "Tiempo 1" (recomendaciones
        en prosa, formato **Día N**, con botón "Crear ruta con mapa" debajo) y el mapa/verificado
        SOLO sale al pulsar ese botón ("Tiempo 2") — dos cosas distintas que yo estaba
        mezclando. Paco, tras aclarar esto: **"DALE AL PASO 2 DE UNA VEZ Y DEJA DE MAREAR"**.
        `waGenerateAndSaveRoute()` reutiliza las MISMAS dos funciones del Tiempo 2 de la web
        —`convertProseToRouteJson()` (convierte a JSON el último plan que Salma dio en la
        conversación, de `wa_history`) y `verifyAllStops()` (Find Place + Details por parada,
        con la misma caché de 30 días compartida)— cero motor nuevo. Se guarda en Firestore
        (`users/{uid}/maps/{id}`) con el MISMO esquema que `app.js:guardarGuiaDirecto()` usa en
        la web (vía cuenta de servicio del Worker, que no tiene el SDK de cliente), y se
        descuenta con `usageRecord()`, la misma función de siempre. **Aviso de coste (protocolo
        §8): esto es EXACTAMENTE el mismo coste que ya paga "Crear ruta con mapa" en la web**
        (1 Claude Sonnet hasta 20K tokens + verify Google Places por parada) — no es un coste
        nuevo, es la misma acción ya tarificada, ahora también accesible desde WhatsApp.
     3. **Enlace que abre la ruta YA guardada directamente — HECHO, desplegado, pendiente de
        confirmar en pantalla.** Commit `6885098a`, **Worker `4b37878b-878b-4325-aae6-aff4eaab790e`**
        (comprobado contra `/version`), `app.js?v=166`. El código de un solo uso lleva
        `go: 'ruta:{mapId}'` (mismo mecanismo que `premium`); `app.js` lo recoge en
        `onAuthStateChanged` y llama a `salma.cargarGuia(mapId)` (mismo camino que Mis Viajes:
        vista de itinerario con mapa). Cubre también "mapa por WhatsApp con enlace a la web"
        (el enlace abre la guía sobre el mapa); pagos ya iba con el enlace `premium`. Sin coste
        (KV + una lectura de Firestore). Probar: pedir ruta → "guárdala" → tocar el enlace.
   - **Bug real encontrado y arreglado, 25 sept 2026, desplegado y confirmado en pantalla
     por Paco: cadena de preguntas al pedir una ruta.** "Hazme una ruta por Santillana del
     Mar" daba la info correcta pero terminaba preguntando "¿día completo o visita rápida?"
     y luego "¿tienes coche o no?" — la típica conversación de bot. Causa: `WHATSAPP_SYSTEM_CHAT`
     excluye `BLOQUE_ACCION` entero (trae instrucciones de vuelos/hoteles no conectados a
     este canal) y con él se fue también su regla "destino+ruta → info directa, NUNCA
     '¿qué tipo de viaje?'". Se portó esa regla concreta (no el bloque entero) al prompt de
     WhatsApp. Antes de desplegar, Paco preguntó explícitamente si esto (u otros cambios del
     día) podían haber roto algo de la web — comprobado con `git diff` que ningún cambio de
     hoy toca `BLOQUE_ACCION`/`SALMA_SYSTEM_CHAT/PLAN/ROUTE` ni ninguna función que use la
     web (todas las funciones tocadas son nuevas, prefijo `wa`), y Paco confirmó en pantalla
     que "3 días Sevilla" y "moneda de Japón" siguen funcionando bien en la web. Aun así, el
     primer despliegue del fix seguía preguntando (otra pregunta parecida, no exactamente la
     misma) — Paco preguntó por qué no se reutilizaba directamente lo que YA funciona bien en
     la app en vez de una redacción propia. Con razón: v3 extrae el punto 2 de `BLOQUE_ACCION`
     a `BLOQUE_RUTA_INFO_DIRECTA` y WhatsApp usa ese texto LITERAL (verificado en runtime que
     `BLOQUE_ACCION` sigue siendo byte a byte idéntico para la web), con un único añadido
     genuino: sin botón "Crear ruta con mapa" que sustituya la conversación libre, la regla se
     refuerza a cualquier pregunta de personalización, no solo las dos que cita el texto
     original. **Norma anotada para el resto de F5.3**: si ya funciona en la app, se reutiliza
     tal cual — nunca una versión propia para WhatsApp.
   - **Invitación a guardar sin depender del modelo — HECHO y confirmado en pantalla por
     Paco, 25 sept 2026 ("ya lo hace").** Tras el paso 2, Paco seguía viendo (captura en mano) que la
     respuesta de ruta terminaba en "si quieres te busco restaurantes" en vez de invitar a
     guardar — pedírselo en el prompt no bastaba. `appendGuardarlaCta()` la añade por código,
     determinista, si el mensaje era de ruta/destino y la respuesta no la menciona ya —
     detector: `isRouteRequest`/`isDaysDestination` de la web + "hazme una ruta por X" (que
     esas dos no cazan). Comparado con una captura real de la app ("Si te encaja, dale a
     Crear ruta con mapa..."): mismo patrón en los dos sitios — invitación al siguiente paso
     al final, no una pregunta bloqueante.
   - **Enlaces de auto-entrada: el destino ya no se pierde — HECHO y confirmado en pantalla
     por Paco, 25 sept 2026 ("ok funciona").** Primer intento con el enlace viejo (generado
     antes del fix, sin el destino guardado) seguía sin funcionar — normal, ese código nunca
     llevó "premium" dentro. Con un enlace nuevo (pedido otra vez con "guárdala"), sí abre
     Perfil + Premium directo. Al probar el enlace a Premium (mensaje de
     límite de guía gratis), Paco vio que abría el index normal, no Perfil/Premium — y esto
     pasaba con TODOS los enlaces de auto-entrada con parámetro extra, no solo ese. Causa:
     `app.js:_tryWaAutoLogin()` borra la URL entera (`history.replaceState`) nada más ver
     `?entrada=CÓDIGO`, antes de que nada pueda leer un `&go=...` pegado al enlace. Arreglo:
     el destino (`"premium"`) viaja DENTRO del propio código de un solo uso en KV
     (`buildAutoLoginLink` guarda `{uid, go}` en vez de solo el uid) y `/wa-weblogin-verify`
     lo devuelve en la respuesta del login, no en la URL — `app.js` lo recoge de ahí
     (`window._waLoginGo`) y si es `"premium"` abre Perfil + el modal de Premium,
     reutilizando el mismo camino que ya usa `pago=cancel` (no uno nuevo). Compatible con
     códigos ya emitidos en el formato viejo (uid en texto plano). Toca `app.js` (confirmado
     por Paco antes de tocarlo) — `app.js?v=165` en `index.html`.
   - **Resto de tools (vuelos, hoteles, coches) — HECHO, desplegado, confirmado en pantalla
     con vuelos por Paco (buscó a Koh Samui).** Cambio mecánico: se amplía `WA_TOOLS` (antes
     solo `buscar_lugar`) a `buscar_vuelos`/`buscar_hotel`/`buscar_coche` — mismo
     `waCallClaudeWithTools()` + `executeToolCall()` de siempre, sin despachador nuevo.
     Coste: Duffel no cobra por búsqueda (solo por reserva, que no pasa aquí);
     RapidAPI/Booking.com va por cupo mensual ya contratado — esto añade volumen, no un
     gasto nuevo (sin cifra exacta de cupo restante, ver panel RapidAPI si hace falta
     precisión).
     - **Bug real encontrado en la propia prueba, arreglado y desplegado:** al aclarar la
       fecha de un vuelo con "Cualquier día del mes", la respuesta llevaba pegado "Si
       quieres, dime 'guárdala'..." sin venir a cuento — `appendGuardarlaCta()` usaba
       `isDaysDestination()` (pensada para un destino suelto tipo "Ronda"), que trata
       cualquier frase corta sin verbo como un destino. Se sacó del detector.
     - **Paco preguntó si el mismo riesgo aplicaba a hoteles/coches — sí aplicaba.**
       Arreglo de raíz, no un parche puntual: `waCallClaudeWithTools()` ahora devuelve
       `{text, usedTools}`, y la invitación a guardar NUNCA se añade si en ese turno se
       ejecutó cualquier tool de búsqueda (vuelo, hotel, coche o lugar) — no depende ya de
       adivinar por la forma del texto.
     - **Bug real encontrado por Paco en la misma prueba, arreglado y desplegado, 25 sept
       2026: fecha vaga de vuelo se quedaba pidiendo fecha exacta en bucle.** "Buscame un
       vuelo a Koh Samui, Tailandia, para noviembre" + "Solo ida" no llegaba a buscar nunca
       — seguía pidiendo un día concreto, a diferencia de la web, que con el mismo criterio
       sí busca (Paco lo confirmó probando ambos: **"no funciona en la app si perfectamente
       con el mismo criterio de búsqueda"**, y preguntó directamente **"o se usa exactamente
       lo mismo q en la app?"** — no se usaba). Causa real: `WHATSAPP_SYSTEM_CHAT` excluye
       `BLOQUE_ACCION` entero, y con él se fueron dos reglas que la web sí tiene: el punto 5
       ("PIDE SERVICIO CONCRETO → usa la herramienta inmediatamente, sin preguntas previas")
       y el bloque `DEFAULTS` ("sin fecha → hoy", "sin fecha de vuelta → solo ida"). La tool
       `buscar_vuelos` ya soportaba `fecha_rango_hasta` para fechas amplias — no era un
       problema de capacidad, faltaba la instrucción de "asume y busca, no preguntes".
       Mismo patrón que `BLOQUE_RUTA_INFO_DIRECTA`: se extraen esas dos piezas a
       `BLOQUE_SERVICIO_DIRECTO`/`BLOQUE_DEFAULTS_SERVICIO`, se usan tal cual en
       `BLOQUE_ACCION` (verificado en runtime que `BLOQUE_ACCION` y los 3 prompts de la web
       quedan byte a byte iguales) y WhatsApp las reutiliza literal, con un único añadido
       genuino: instrucción explícita de usar `fecha_rango_hasta` ante fechas vagas
       ("en noviembre", "cualquier día del mes") en vez de preguntar la fecha exacta en
       bucle. **Este fix funcionó** (ya no se queda pidiendo fecha en bucle), pero al
       probarlo Paco encontró un bug distinto en la misma prueba — ver el siguiente punto.
     - **Bug real encontrado por Paco en la prueba siguiente, 25 sept 2026: sin resultados
       de Duffel, Claude se inventaba una ruta y un precio.** Con la fecha ya resuelta,
       "vuelo a Koh Samui desde Málaga" no encontraba nada en Duffel — y en vez de decir
       eso, Claude respondió con una ruta inventada ("Málaga → Bangkok, luego Bangkok →
       Koh Samui con Bangkok Airways, ~50€ aparte") que no venía de ninguna tool. Causa:
       `PROHIBIDO INVENTAR` ("no inventes horarios ni precios, solo datos de herramientas")
       vive dentro de `BLOQUE_ACCION`, que WhatsApp seguía excluyendo entero — era la MISMA
       causa raíz que los dos bugs anteriores (cadena de preguntas, fecha en bucle),
       apareciendo por tercera vez con otro síntoma.
     - **Refactor de raíz, 25 sept 2026 — Paco preguntó directamente por qué no se copiaba
       la petición entera de la app en vez de seguir extrayendo fragmentos uno a uno cada
       vez que aparecía un bug de esta familia: "por que no hace la petición a la app lo
       copia y lo manda a whassa. Así no sería más fácil?"** Con razón — los tres bugs
       eran el mismo síntoma (`BLOQUE_ACCION` excluido) saliendo por sitios distintos.
       Arreglo: `WHATSAPP_SYSTEM_CHAT` ahora incluye `BLOQUE_ACCION` **completo**, igual
       que `SALMA_SYSTEM_CHAT` en la web — cualquier regla presente o futura ahí (prohibido
       inventar, jerarquía de herramientas, dato primero, SALMA_ACTION, etc.) se hereda
       sola, sin extraer nada a mano nunca más. Verificado en runtime que `BLOQUE_ACCION` y
       los 3 prompts de la web quedan byte a byte iguales — cero cambios para la web.
       Piezas añadidas SOLO por lo que de verdad distingue este canal: qué tools están
       conectadas aquí (`buscar_lugar`/`vuelos`/`hotel`/`coche` — NO `buscar_web` ni
       `guardar_nota`, con instrucción de decirlo claro si algo del texto de arriba pide
       una herramienta que aquí no existe, en vez de fingir que se ha hecho), prohibición
       explícita de generar `SALMA_ACTION`/`HISTORIA_LUGAR` (marcadores que la web
       interpreta en el frontend — WhatsApp no tiene ese parser, se colarían tal cual en
       el mensaje), la regla de "sin botón, refuerza a cualquier pregunta de
       personalización" y la de fechas vagas. Añadida `stripWaLeakedMarkers()` como red de
       seguridad por si el modelo genera esos marcadores de todos modos.
     - **Bug real encontrado por Paco al reprobar, 25 sept 2026: "sigue igual" — el mismo
       vuelo a Koh Samui seguía devolviendo la ruta inventada vía Bangkok/50€.** No era que
       el fix de `PROHIBIDO INVENTAR` no funcionara — la respuesta empezaba con **"Como te
       decía"**: Salma estaba siendo consistente con SU PROPIA respuesta inventada de antes
       del fix, que seguía metida en `wa_history` (dura 6h de inactividad). El fix evita
       inventar EN UN TURNO NUEVO, pero no borra una invención que ya quedó grabada en el
       historial de una conversación que llevaba todo el día de pruebas activa. Arreglo:
       `isResetRequest()` — frases como "reinicia la conversación", "olvida todo" o "borra
       el historial" borran `wa_history`/`wa_location` de ese número sin llamar a Claude
       (coste 0). Sirve para probar limpio y para que cualquier usuario real pueda empezar
       de cero. **Este fix funcionó** (Paco confirmó "Hecho, empezamos de cero" en pantalla),
       pero al repetir la prueba EN LIMPIO el bug de invención seguía — ver el siguiente punto.
     - **Bug real, mismo día, con la conversación ya limpia: la invención era genuina, no
       solo por historial contaminado — Koh Samui no tiene vuelo internacional directo.**
       Paco, tajante: **"cojones que de el resultado correcto"** — no quería un aviso de "no
       lo sé", quería el dato real. Causa de fondo: Koh Samui (USM) no tiene vuelo
       internacional directo (Bangkok Airways no interlina con los vuelos de largo radio), así
       que `buscar_vuelos` en un solo tramo origen→USM siempre da 0 resultados reales en
       Duffel — y sin una instrucción mejor, Claude rellenaba el hueco con presupuestos
       "orientativos" y aerolíneas de memoria (Qatar, Emirates, Turkish) en vez de admitir que
       no había encontrado nada real. Arreglo: instrucción explícita de partir la búsqueda en
       DOS llamadas reales a `buscar_vuelos` (origen→hub regional, ej. Bangkok, y hub→destino
       final) cuando la búsqueda directa a una isla/ciudad pequeña no da resultados, y
       presentar el itinerario con los DOS precios REALES de esas tools sumados — nunca una
       cifra inventada. Solo si ni el tramo al hub encuentra nada se dice que no hay vuelos.
       **Este fix funcionó a medias** — con "Koh Samui" desde Madrid la búsqueda por hub
       encontró algo, pero al probar "Hanói" ninguna de las dos búsquedas (directa ni por
       Bangkok) dio resultado, y Claude volvió a inventar (ver siguiente punto).
     - **Bug real, misma tarde, cuarta vuelta — "Buscame un vuelo a Hanói en noviembre":
       ni la búsqueda directa ni la del hub (Bangkok) dieron resultado, y Claude SIGUIÓ
       inventando** un presupuesto "orientativo" (500-700€, Qatar/Emirates/Turkish) y hasta
       una URL de Google Flights con fechas de 2025 que nadie pidió. Confirmaba lo que ya se
       veía venir: pedirle por texto "no inventes" no es suficiente cuando el modelo prefiere
       sonar útil a admitir que no tiene nada. **Arreglo de raíz, por código en vez de más
       texto de prompt** (mismo patrón que `appendGuardarlaCta`/`stripWaLeakedMarkers`):
       `waCallClaudeWithTools()` ahora devuelve `allFlightSearchesFailed` — true si se llamó a
       `buscar_vuelos` al menos una vez en el turno y NINGUNA llamada encontró vuelos reales.
       El webhook `/whatsapp` IGNORA lo que Claude haya escrito en ese caso y manda
       `WA_NO_FLIGHTS_FOUND_MSG`, un texto fijo sin precio, sin aerolínea y sin URL. Si al
       menos una búsqueda SÍ encuentra algo real, el mensaje de Claude pasa normal. **Desplegado,
       pendiente de confirmar en pantalla por Paco** (volver a pedir el vuelo a Hanói o a
       cualquier destino sin conexión real y comprobar que ahora dice claramente que no ha
       encontrado nada, sin precios ni aerolíneas inventadas).
   - **CAUSA REAL de vuelos/hoteles fallando por WhatsApp (25 sept 2026, noche, vista con
     `wrangler tail` + log `[WA-TOOL]`): WhatsApp no le pasaba a Claude la fecha de hoy** (la
     web sí: `[FECHA ACTUAL]` en `buildMessages`). Buscaba en 2025 → Booking 422, Duffel 0
     vuelos; los arreglos de prompt de antes (hub, mensaje honesto) tapaban esto. Arreglado
     metiendo la misma línea en `waCallClaudeWithTools` (Worker `1354c386`). **CONFIRMADO EN
     PANTALLA por Paco: hotel esta noche OK, y vuelo Madrid→Koh Samui en noviembre con precios
     reales (435 € + 124 € por Bangkok).** De paso: `buscarHotelesBooking` (web y WhatsApp)
     descarta entradas de Booking sin `hotel_name` (llegaban 2 de 5 vacías a 0 €) — Worker `7b3961c5`, **CONFIRMADO EN PANTALLA por Paco (Llanes, 5 hoteles con nombre y precio)**. El log
     `[WA-TOOL]` se queda (solo consola). El "Hoy ya hemos hablado bastante" que salió era el
     tope `wa_daily` de 60 mensajes/día (Paco lo agotó probando; se borró su contador de hoy).
   - **Notas por WhatsApp (25 sept 2026, noche) — HECHO, guardado confirmado en el log.**
     `guardar_nota` conectado (`waSaveNota`: escribe `users/{uid}/notas/{id}` con el esquema de
     `notas.js:create()`, `fuente: 'whatsapp'`) + `BLOQUE_NOTAS` en el prompt de WhatsApp. Sin
     coste de API. Paco no las veía en la web porque su número estaba en la cuenta automática
     `wa_4c1634b76d58c9b42c316476` (sin email), distinta de su cuenta de la web.
   - **Unir la cuenta `wa_` a la cuenta de la web — CAMBIA LA DECISIÓN DEL 24 SEPT (con OK de
     Paco, 25 sept): "que cada usuario pueda guardar sus notas desde WhatsApp en la web".**
     Perfil → Vincular WhatsApp → mandar el código desde el móvil: si el número estaba en una
     cuenta `wa_…`, ahora pasa a la cuenta de la web y se COPIAN sus notas y rutas
     (`waCopyAccountData`, mismo id, sin borrar nada de la `wa_`; `whatsapp_sessions.merged_from`
     guarda la vieja). Si el número estaba unido a OTRA cuenta de Google, sigue avisando sin
     tocar nada. Log `[WA-UNIR]`. Sin coste de API. **CONFIRMADO EN PANTALLA por Paco (25 sept): unido, notas copiadas y una nota nueva por WhatsApp sale en la web.** Worker `bc81421d`.
   - **Paquete "que el usuario sepa y use todo" (25 sept 2026, noche, pedido por Paco: "hazlo
     todo") — DESPLEGADO, sin probar en pantalla.** Todos los avisos los añade el CÓDIGO y van
     dentro del MISMO mensaje (en producción Twilio cobra por mensaje):
     1. Bienvenida con todo lo que se puede hacer (`waHelpText`) + comando **`ayuda`** (sin Claude).
     2. Recordatorio rotativo cada 5 respuestas normales (`WA_TIPS`, KV `wa_tipn:{num}`), nunca
        tras una búsqueda ni con otra invitación en el mismo mensaje.
     3. **WhatsApp usa ya los límites del plan** (20 mensajes/día gratis, 100 Premium, `usageGate`
        'chat') y cuenta tokens en `usage:{uid}:{mes}` (sale en el panel). `wa_daily` sube de 60
        a 120 (solo red de seguridad). Avisos: quedan 5, ≤3, último; al guardar guía, las que
        quedan (o "era tu guía gratuita" + enlace Premium).
     4. "reinicia" visible: en bienvenida/ayuda/recordatorios y automático si el mensaje suena
        molesto (`isWaFrustrated`, 1 vez cada 30 min).
     5. "Díselo a tus amigos" (`waMaybeReferral`, 1 vez/semana, tras guardar guía o búsqueda que
        salió bien). En Sandbox el amigo tiene que mandar antes el `join …` de Twilio.
     6. **`fallo: …`** → `beta_feedback` (sale en Feedback del panel) con los últimos 10 mensajes +
        email a Paco (`waSaveFallo`).
     7. **Fotos** → Claude con visión (`BLOQUE_VISION` de la web, tal cual). **Notas de voz** →
        OpenAI whisper-1 (~0,006 $/min) y sigue como texto. Descarga de Twilio con Basic auth y
        redirección seguida a mano (`waFetchTwilioMedia`).
     8. **Historia**: `/historia-lugar` se extrajo a `getHistoriaLugar()` (web igual). Si Salma
        marca `HISTORIA_LUGAR`, se ofrece "escribe *historia*"; también "historia de X".
     **CONFIRMADO EN PANTALLA por Paco (25 sept): ayuda, nota de voz, fallo e historia (corta en 1 mensaje + "¿Te explico más?" → completa; mensajes >1600 caracteres se parten, `splitWaMessage`). Worker `859c17d8`. Foto: llega y se analiza sin errores (25 sept); Paco "en principio sí", seguirá probando los próximos días.** **PENDIENTES DECIDIDOS POR PACO (25 sept):** coches → esperar a que contrate la API de coches en RapidAPI; recomendar a amigos → "sumamente importante", espera al número de producción de Twilio (en Sandbox el amigo necesita `join …`). Aviso §8 (aprobado): voz ~0,006 $/min; foto ~0,005-0,01 € más que un texto; historia solo la
     1ª vez por lugar (~0,035 €); el resto sin coste. Los límites del plan BAJAN el gasto máximo.
   - **Worker Version ID vigente: ver `/version`** (anterior: `1990087f-457b-4208-90af-3f21f6e933cf`) (despliegues
     intermedios de este punto: `def5f8bc-98f2-4ca0-b343-2a78735984fb` → búsqueda de vuelos
     por hub real (funcionó a medias, seguía inventando cuando el hub también fallaba),
     `82e57261-89a4-453b-a201-a5b4a934d820` → frase de reinicio de
     conversación (funcionó, pero no era la causa de fondo), `90eeb8af-f3eb-4a78-9dd0-e66a8ac03820` → BLOQUE_ACCION
     completo en WhatsApp (funcionó, pero el historial de pruebas ya contaminado seguía
     repitiendo la invención vieja), `1dd2ed1b-cdfe-4e0d-877e-571cf7eb878b` → fix fecha vaga
     (funcionó, pero destapó el bug de invención), `f5d8c0a6-a810-4d78-856d-5bcbafe223f6` →
     guardarla nunca tras usar una tool, `c5a25472-0bcd-416f-ba36-af432a5e745e` → vuelos/hoteles/
     coches, `bf1c3805-b554-40ac-a7d3-d7624940b5ad` → fix destino en
     enlaces de auto-entrada, `4b26ef45-eb51-4744-8400-758a48330b54` → paso 2 (generar y
     guardar ruta real), `fd97d958-e2b7-4fa3-a9ef-aaa9b9c4f109` → fix cadena de
     preguntas v3 (texto reutilizado, ver arriba), `464bcc96-e1b4-4d6c-8452-8fedbf62f62a` → ubicación básica,
     `90783047-1c77-4c3b-bd6b-22155514a3aa` → fix destinos hipotéticos, `c7612d4a-c8b8-
     482b-9040-06dcb0537d19` → fix "se queda callada", `87898213-72ce-43e2-be38-
     2cab28577ab5` → buscar_lugar, `e2901891-cb6f-4814-ae98-df44f9feffdf` → paso 1 de
     guardar rutas, este último → mensaje honesto por código cuando ninguna búsqueda de vuelo
     real encuentra nada).


