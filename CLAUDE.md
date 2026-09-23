# CLAUDE.md — Borrado del Mapa
---

## ⛔ PROTOCOLO DE TRABAJO — LEER ANTES DE TOCAR NADA

Escrito el 5 septiembre 2026 después de una sesión en la que se arreglaron seis
fallos reales y **ninguno se llegó a ver en la app**, se restauró todo al día
anterior y se perdieron las 15 API keys del Worker. Las causas no fueron técnicas:
fueron de método. Estas reglas existen para que no vuelva a pasar.

### 1. UNA SOLA SESIÓN sobre `C:\Users\User\Desktop\salma`

Aquel día había **tres sesiones de Claude Code editando los mismos ficheros y
desplegando el mismo Worker**. Dos hicieron los mismos arreglos por duplicado; una
tercera borró el Worker entero. Con varias sesiones sobre el mismo directorio es
imposible saber qué versión se está probando.

- Antes de empezar: comprobar que no hay otra sesión abierta sobre este directorio.
- Si hacen falta dos a la vez, la segunda **en worktree aparte**, nunca en el mismo árbol.
- **Si un `git push` sale rechazado (`non-fast-forward`), PARAR.** No es un trámite de
  git: significa que alguien más está escribiendo aquí. Mirar quién antes de seguir.

#### 1B. Realidad desde el 13-14 sept: varias sesiones de Code a la vez, cada una con su
propio clon (móvil, portátil, nube) — no todas en worktree del mismo árbol local. Esto
es distinto del caso de un solo Worker borrado del 5 sept, pero puede liarse igual si no
se sigue esto. Un rechazo de push aquí **no es la catástrofe del 5 sept** — es rutina de
git, se resuelve en un minuto con los pasos de abajo. No hay que asustarse, hay que
seguir el proceso.

- **Cuando Paco abra varias sesiones para cosas distintas, decirle a cada una qué toca y
  qué NO** (ej. "esta sesión es solo Historia, no toques el generador de rutas"). Reduce
  al mínimo que dos sesiones editen el mismo trozo de archivo a la vez.
- **`git fetch origin main` antes de cualquier commit que vaya a subirse**, sobre todo si
  la sesión lleva un rato abierta — la otra puede haber subido cosas mientras tanto. No
  fiarse de lo que había al principio de la conversación.
- **Commits pequeños y push frecuente**, no acumular cambios grandes sin subir. Si hay
  conflicto, que sea pequeño y fácil de leer, no una bola de nieve.
- **Push rechazado → PARAR → `git fetch origin main` → `git log --oneline
  HEAD..origin/main`** para ver qué ha cambiado (los mensajes de commit dicen de qué
  sesión/tema viene — escribirlos siempre claros por esto mismo) → **confirmar con Paco
  quién es** antes de tocar nada → si confirma, `git rebase origin/main` (nunca
  `push --force`) → **verificar que el propio cambio sigue intacto** (grep de las piezas
  clave que se tocaron, no fiarse solo de "rebase sin conflictos") → recién entonces
  `git push`.
- **`CLAUDE.md` es zona común** — las sesiones simultáneas casi siempre escriben aquí
  (pendientes). Git suele fusionar líneas distintas sin problema; si hay choque de verdad
  (mismo párrafo tocado por las dos), tratarlo como cualquier conflicto: parar, mirar,
  fusionar a mano conservando las dos aportaciones — nunca pisar el trabajo de la otra
  sesión con la propia versión sin mirar qué decía.
- **Despliegue del Worker: la sesión que hace push del cambio es la que lo despliega**
  (GitHub Action "Deploy Worker") justo después, y **anota el `Current Version ID` en el
  propio pendiente de `CLAUDE.md`** — así la otra sesión (o Paco) sabe qué versión es la
  vigente sin tener que adivinar ni volver a desplegar por si acaso.

### 2. UN CAMBIO, UNA PRUEBA, UNA CONFIRMACIÓN DE PACO

Aquel día se encadenaron cinco arreglos sin verificar ninguno. Cuando algo seguía
mal, ya era imposible saber cuál había servido.

- No se toca el siguiente fallo hasta que Paco diga qué ve en su pantalla.
- **Nunca decir "arreglado"**. Se dice: *"desplegado — dime qué ves"*. Que un `grep`
  encuentre una función no prueba que en la pantalla de Paco pase nada.
- Verificar **comportamiento**, no código. El código desplegado y correcto puede no
  cambiar nada de lo que el usuario ve — eso fue exactamente lo que pasó.

### 3. PEDIR EVIDENCIA DE SU PANTALLA, Y PRONTO

Se estuvo horas arreglando la vista del mapa mientras Paco hablaba del texto del
chat. Una captura al principio ahorra media tarde.

- Ante un "sigue igual": pedir **captura de pantalla** y el panel **🐛** (botón flotante
  abajo-derecha → "Copiar"), que trae los errores de JavaScript de su navegador y, en
  la cabecera, la versión del Worker y el `?v=` de cada script que ese navegador tiene
  cargado. Esa cabecera es lo primero que hay que leer.
- Si menciona una demo, un diseño o un comportamiento esperado: **preguntar qué es
  exactamente**, no suponerlo.
- Diagnóstico en vivo: `npx wrangler tail salma-api --format pretty` mientras él prueba.

### 4. CHECKLIST DE DESPLIEGUE — SIEMPRE EN ESTE ORDEN

1. Subir versión `?v=` en `index.html` de **cada** `.js` modificado (si no, el navegador
   sirve el viejo aunque el fichero esté subido). Los 19 scripts locales llevan `?v=`;
   ninguno debe quedarse sin él.
2. `git add` + `commit` + `push`.
3. Comprobar que la web ya sirve la versión nueva — GitHub Pages tarda entre 45 s y
   varios minutos:
   `curl.exe -s https://borradodelmapa.com/index.html | Select-String '\.js\?v='`
4. Desde `worker\`: `npx wrangler deploy -c wrangler.toml` — **siempre con `-c`**: en la
   raíz del proyecto hay un `wrangler.jsonc` que wrangler coge por error si no se le
   dice cuál. La terminal de Paco es PowerShell, donde `&&` **no existe**; se encadena
   con `;`:
   `cd C:\Users\User\Desktop\salma\worker; npx wrangler deploy -c wrangler.toml`

   **Alternativa desde el móvil (sin terminal) — Cloudflare Workers Builds, montado y
   probado el 11 sept 2026:** el Worker `salma-api` tiene conectado el repo de GitHub
   (Cloudflare dashboard → salma-api → Settings → Builds). Cualquier commit directo a
   `main` (se puede hacer editando un fichero desde github.com en el navegador del
   móvil, sin `git` local) dispara un build y deploy automático — mismo comando,
   `npx wrangler deploy -c wrangler.toml`, con **Directorio raíz = `worker`** para que
   no coja el `wrangler.jsonc` de la raíz. El paso 5 (comprobar `/version`) sigue
   haciendo falta igual, solo que se abre la URL directamente en el navegador del móvil
   en vez de `curl.exe`. Esto **no sustituye** el paso 1 (subir `?v=`) ni el 6 (Paco
   prueba en la app) — solo cambia cómo se ejecuta el paso 4.
5. Comprobar que el Worker que corre es el que crees — el `Current Version ID` del
   deploy tiene que coincidir con el que devuelve el endpoint:
   `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`
   Ojo: en PowerShell `curl` a secas es `Invoke-WebRequest` y se queda pidiendo `Uri:`.
   Hay que escribir `curl.exe`.
6. **Paco prueba en la app.** Hasta aquí no está terminado. Si hay cualquier duda de si
   está viendo lo nuevo o algo de su caché: panel 🐛 → la cabecera dorada trae el
   Version ID del Worker y el `?v=` de cada script cargado, y el botón "Copiar" lo pega
   delante de los logs.

### 5. NO SE BORRA EL WORKER. NUNCA

Ni el fichero ni el Worker de Cloudflare. **Al eliminarse un Worker, Cloudflare
destruye sus secrets de forma irreversible** — son de solo escritura y no hay copia.
Aquel día costó dos horas reponer 15 claves, y varias no estaban en local.

- Copia de seguridad de secrets: `worker/restaurar-secrets.cjs` sube los que hay en
  `api\*.txt` (carpeta gitignored). Los que no estén ahí hay que sacarlos de su panel.
- Diagnóstico de claves de Google: `worker/probar-google-keys.cjs`.
- Comprobar qué hay puesto: `npx wrangler secret list -c wrangler.toml` (son 15).

### 6. ANTES DE DAR UN FALLO POR ENTENDIDO

Aquel día se cambió tres veces de sospechoso porque se miraba una sola capa.

- Un dato puede **calcularse bien y no llegar a pantalla**: el Worker mandaba la ruta
  verificada y el frontend la descartaba. Seguir el dato **de punta a punta**.
- Al hacer un corte limpio, buscar **todos** los escritores y lectores en el repo
  entero (worker + scripts + crons), no solo la función obvia. Había un segundo motor
  de rutas vivo, en un cron, con prioridad sobre el nuevo.
- Al tocar el prompt, buscar **contradicciones entre bloques**: tres instrucciones
  distintas pedían el plan completo en el chat *y* en el JSON. La duplicación estaba
  escrita en el propio prompt.

### 7. RESTAURAR SIN DESTRUIR

- Volver atrás con un **commit nuevo que restaure el árbol**, nunca reescribiendo la
  historia: `git restore --source=<commit> --worktree --staged .`
- Antes de cualquier vuelta atrás, dejar un tag o rama de salvaguarda.
- Puntos de restauración del 5 sept 2026: tags `v-5sept-antes-de-volver-atras` y
  `v-5sept-antes-de-borrar` (todo el trabajo de ese día, Worker intacto).

### 8. CUALQUIER COSA QUE PUEDA MOVER LA FACTURA, SE DICE — SIEMPRE, SIN EXCEPCIÓN, POR MÍNIMA QUE SEA

Añadido el 15 sept 2026 tras el susto de 82€ en 14 días en Google Places (ver 🔴 Crítico
en "Pendiente / Problemas conocidos", y el detalle completo en "Normas de desarrollo").
Reforzado el mismo día porque la primera redacción dejaba margen a decidir "esto es
tan pequeño que no hace falta decirlo" — **no existe ese margen. Nunca.**

- **SIEMPRE, en TODO cambio, por mínimo que parezca, que toque una línea de código que
  llame (o pueda llegar a llamar) a una API de pago** (Google Places/Maps, Anthropic,
  OpenAI, Duffel, RapidAPI, Twilio, ElevenLabs, Stripe, Brave, Serper, OpenWeather...) —
  se le dice a Paco explícitamente: qué se toca y por qué puede afectar al coste,
  estimación aunque sea a ojo. Subir el gasto, bajarlo, o "seguramente no cambia nada"
  cuentan igual — se avisa igual, sin excepción.
- **No hay umbral de "esto es tan pequeño que no cuenta".** Cambiar un solo parámetro,
  un solo field mask, una sola condición de una caché, un solo número de un intervalo —
  todo eso ES un cambio que puede mover la factura, y se dice igual que uno grande.
- No es "bajo riesgo" aunque el cambio sea pequeño, sea solo código, o sea un fix que
  promete ahorrar dinero — un arreglo de coste sigue necesitando decir qué se tocó.
- Nunca decidir en solitario que algo "no hace falta mencionarlo". Si hay duda de si
  cuenta, cuenta — se dice.
- No esperar a que Paco pregunte. Decirlo antes o en el momento, nunca como nota de después.

### 9. EL MENÚ DE ABAJO (Y LA CABECERA) SON UNA SOLA COSA — APP Y PÁGINAS DE DESTINO A LA VEZ, SIEMPRE

Añadido el 22 sept 2026, sesión de rediseño de las páginas SEO de destino (ver
"Sesión 22 sept 2026 — Rediseño SEO destinos" más abajo). Paco, tal cual: **"no quiero
ir detrás mirando si se hace o no se hace"** — esto no es una sugerencia, es checklist
obligatorio.

- Las 1.793 páginas de `destinos/` (más las de país e índice) llevan la MISMA cabecera
  (logo + eslogan), el mismo reloj y el mismo menú de abajo que la app real — no por
  casualidad, sino porque `scripts/build-destinos.js` las genera desde tres constantes
  compartidas: **`LOGO_HTML`, `BOTTOM_NAV`** (y el reloj, inline en las dos plantillas).
  Ver el propio comentario junto a `BOTTOM_NAV` en ese archivo.
- **Cualquier cambio al menú de abajo de la app** (`app.js:updateBottomBar()` — pestañas,
  iconos, el "+" central, textos, orden) **o a la cabecera/eslogan del index**
  (`app.js:_renderChatEmpty()`, el bloque `.ce-top`/`.ce-hero`) **se replica ANTES de dar
  el cambio por terminado** en `scripts/build-destinos.js` (`LOGO_HTML`/`BOTTOM_NAV`), y
  se regenera al menos el país de prueba (`node scripts/build-destinos.js --country es`)
  para comprobarlo — el rollout a las 1.793 completas se hace aparte, pero el CÓDIGO del
  generador nunca se queda desincronizado, ni un commit.
- Si el cambio afecta a un `?v=` de CSS/JS que las páginas de destino también cargan
  (`styles.css`, `destinos.css`), subir igual el número en `build-destinos.js`
  (`DESTINOS_CSS_V` y cualquier otro que se añada) — si no, un visitante real se puede
  quedar con la versión vieja en caché sin que nadie se entere.
- Esto aplica igual de fuerte que el punto 8 de arriba: **no hay "esto es tan pequeño que
  no afecta a destinos"**. Si se toca el menú o la cabecera de la app, se toca a la vez
  `build-destinos.js` — sin excepción, sin esperar a que Paco lo note en una captura.

---
## V2 Mapa — 11 abril 2026 | Backup: `backups/borradodelmapa-v2-mapa-2026-04-11/`
## V3 Share + Fotos — 17 abril 2026 (sesión)

---

## Sesión 17 abril 2026 — Fotos compartidas + UX Mis Viajes

### Cambios (todos ya en `main`):

1. **Mis Viajes: orden de grupos por guía más reciente** ([app.js:2028-2033])
   Antes se agrupaban por `destino` alfabéticamente. Tu última guía quedaba escondida.

2. **Mis Viajes: agrupación por PAÍS con detección en cascada** ([app.js:_detectGuideCountry])
   - Cache en Firestore (`country_code` + `country_name` por guía, se guarda al detectar)
   - Fallbacks: texto destino+nombre → primer stop del itinerarioIA → Nominatim reverse geocode con lat/lng del primer stop
   - "Otros" siempre al final. Grupos ordenados por guía más reciente primero.

3. **Ruta activa del mapa: persistencia entre sesiones y dispositivos** ([app.js:selectRouteOnMap/_restoreActiveRoute])
   - Firestore: `users/{uid}.active_route_id` (sincroniza móvil ↔ portátil)
   - localStorage: `bdm_live_active_route` + `bdm_live_active_route_id` (fallback offline)
   - Restauración automática al abrir el mapa
   - Bug colateral arreglado: `_activeRouteDocId` ahora SÍ se asigna → fotos del diario se etiquetan con la ruta correcta

4. **Share Target Android (PWA): recibir fotos desde galería del móvil**
   - `manifest.json` declara `share_target` → "Borrado del Mapa" sale en el menú Compartir
   - `sw.js`: intercepta POST `/?share=1`, guarda en Cache Storage `share-inbox`, redirige a `/?share=ready`
   - `share-inbox.js` (nuevo, ~800 líneas): parser EXIF mínimo (GPS + DateTimeOriginal), upload a R2, crea foto+pin en Firestore
   - **Solo funciona en Android/Chrome con PWA instalada**. iOS/Safari no soporta Web Share Target.

5. **Flujo de asignación de fotos compartidas**
   - **Con ruta activa** → flujo directo: todas las fotos se añaden a esa ruta. Si tienen EXIF GPS usa esa coord, si no usa GPS del móvil (última conocida <30min ó fresca). Toast + abre mapa centrado. Sin pantalla de asignación.
   - **Sin ruta activa** → pantalla de asignación: grid con miniaturas (recientes primero), selector de ruta, "Seleccionar todas", "Añadir a [ruta]", "Descartar"
   - **Ubicar manualmente**: si foto no tiene GPS, botón "📍 Ubicar N" abre modal con Google Places Autocomplete. Aplica lat/lng + locName con micro-offset aleatorio (5-20m) para no solapar
   - **Aviso al añadir sin GPS**: popup "esta foto no tiene ubicación — ¿ubicar primero o solo galería?"

6. **Resume tras redirect** (para Google login en móvil que a veces hace full redirect)
   - sessionStorage `share_pending=1` cuando empieza el flujo
   - Al reentrar sin `?share=ready` pero con flag + archivos en cache → reanuda solo

7. **Debug panel flotante** (`debug-panel.js`)
   - Botón 🐛 flotante abajo-derecha en la app
   - Intercepta console.log/warn/error + window errors + unhandled rejections
   - Tap abre overlay con todos los logs + botón "Copiar" al portapapeles
   - Badge rojo pulsante si hay error
   - **Se queda activo por ahora** (útil para debuggear lo que venga)

### Nuevas funciones expuestas (`window.*`):
- `window.reloadSavedPins()` — borra markers + recarga pins desde Firestore
- `window.liveMapFitPins(coords)` — encuadra mapa sobre conjunto de coords
- `window.__dbg` — control del debug panel (open, logs)

### Campos nuevos en Firestore:
- `users/{uid}.active_route_id` — ID de la ruta seleccionada en el mapa live
- `users/{uid}/maps/{id}.country_code` + `country_name` — país detectado (cache)
- `users/{uid}/pins/{id}.source = 'share'` — pins creados desde fotos compartidas
- `users/{uid}/fotos/{id}.source = 'share'` — idem fotos

### Archivos nuevos:
- `share-inbox.js` — handler de fotos compartidas
- `debug-panel.js` — panel de logs flotante

### Limitaciones conocidas (para retomar):
- **iOS**: no funciona (Safari no soporta Web Share Target). Opción: app nativa real.
- **WhatsApp/galería que strippea EXIF**: no hay GPS → se usa GPS del móvil o el user ubica manualmente
- **Debug panel**: visible siempre. Quitarlo o ponerlo detrás de un flag cuando no haga falta
- **Nominatim rate limit**: al cargar Mis Viajes con muchas guías sin country_code cached, puede tardar 1-3s la primera vez

---

## Sesión 17-18 sept 2026 — Chat flotante sobre la guía + miniatura de ruta

Arranque de la propuesta "mapa siempre visible" pero por el lado más simple: no unificar
los 5 mapas ni reescribir el layout, solo dos piezas sueltas y autocontenidas.

1. **FAB 💬 en la vista de itinerario** (`mapa-itinerario.js`): abre el chat de siempre
   (`#app-content`/`#app-input-bar`) como capa encima de la guía, sin destruir el mapa ni
   las cards — al volver, la guía sigue exactamente como estaba. Botón "←" para volver,
   posición distinta a propósito (abajo-derecha para abrir / arriba-izquierda para volver,
   por no chocar con el input bar ni con `#chat-fresh`).
   **Bug encontrado y arreglado el mismo día**: la primera versión dejaba `#app-content`
   tal cual estaba antes de entrar en la guía — con ruta activa y sin conversación, eso es
   la pantalla del billete (con su propio botón ABRIR RUTA), así que el FAB parecía
   "devolver atrás" en vez de abrir un sitio para escribir. Fix: fuerza un `#chat-area`
   limpio (o restaura la conversación reciente si la había) con un aviso corto invitando a
   preguntar/pedir cambios.
2. **Miniatura de la ruta en la tarjeta de "ruta activa"** (antes solo texto): nuevo
   endpoint `POST /route-thumbnail` en el Worker — genera con Google Static Maps (de pago)
   una imagen con las paradas numeradas, pero **como mucho una vez por ruta**: la clave en
   R2 es el propio `mapId`, no un hash de parámetros, así que a partir de la primera vez ya
   no se vuelve a llamar a Google. Se pide sola al abrir una guía por primera vez
   (`setActiveRoute` → `_ensureRouteThumbnail` en `app.js`) y el resultado se guarda en el
   propio documento de la ruta (`map_thumbnail_url`, Firestore + localStorage). Requiere
   login (evita que sea una puerta abierta a generar miniaturas gratis con mapIds
   inventados). Tocar la imagen abre la guía, igual que el botón de siempre.
   **Coste**: una llamada a Static Maps por ruta guardada, no por vista — céntimos.

Desplegado (GitHub Action "Deploy Worker" run #24, commit `da5775f`, **Worker Version ID
`79e8d7b7-3c29-48f0-a71d-557ab83f45a5`**) — esta sesión no pudo confirmarlo además contra
`/version` porque el proxy de red del contenedor bloquea las llamadas salientes a
`salma-api.borradodelmapa-api.workers.dev` (mismo bloqueo ya documentado otras veces).
**Pendiente: que Paco pruebe las dos cosas en pantalla** — el FAB (ya con el fix) y que la
miniatura aparezca en la tarjeta de "ruta activa" la próxima vez que abra una guía.

---

## Sesión 18 sept 2026 — Popup de consulta sobre la guía: maquetación + 3 bugs reales

Continuación de la sesión de arriba (17-18 sept): el FAB pasó de abrir el chat completo a
un popup tipo "consulta" (textbox + respuesta, la guía se ve detrás, atenuada) — ver
`mapa-itinerario.js:_openItinQuery/_closeItinQuery/_sendItinQuery`. Con el popup ya
funcionando, Paco lo probó de verdad y salieron 3 bugs reales encima del diseño, más
maquetación. Todo confirmado en pantalla salvo el último (recién desplegado).

1. **Maquetación** — cuadro de texto más grande (ocupa todo el ancho), botones
   cámara/micro/enviar bajan a su propia fila debajo (antes todo apretado en una línea),
   botón "Narrador" sin emoji y refleja si está activo (verde + badge 📷, mismo patrón que
   el chip del chat normal — `updateNarratorChipUI()` ahora sincroniza también este botón),
   "Cerca mía" pide una posición GPS fresca al navegador (gratis, sin API de pago) en vez
   de la última guardada — antes podía estar rancia y decir un sitio a 50km de donde
   estabas de verdad. **CONFIRMADO.**
2. **Bug 1 — "Crear ruta con mapa" apareciendo al editar la ruta activa.** `_isRouteMsg()`
   (regex amplio: "días", "visitar", "recorrer"...) saltaba con peticiones normales de
   edición desde el popup; si el Worker respondía en prosa (sin `data.route`), esa rama
   ofrecía crear una ruta NUEVA desde cero, tirando el contexto de la que ya estaba
   abierta. Arreglado con un guardián (`!(_chatAreaOverride && currentRouteId)`) — solo
   frontend, commit `383755e`.
3. **Bug 2 — conversación del popup contaminando el chat normal y "Consultas".**
   `_saveSession()`/`_persistThread()` se llamaban sin mirar si el mensaje venía del popup
   — mientras está abierto, `this.history` es el hilo AISLADO de esa ruta, así que cada
   mensaje ahí pisaba sessionStorage del chat normal (al volver, `_restoreSession()`
   repintaba la conversación de la guía en `#chat-area`) y contaminaba el historial de
   "Consultas" en Firestore. Ahora, si `_chatAreaOverride` está activo, esos dos guardados
   se saltan del todo. Solo frontend, commit `37d4644`. **CONFIRMADO** (Paco: "cuando
   abres el chat normal" se quedaba ahí).
4. **Bug 3 — el botón desaparecía (bug 1) pero el TEXTO seguía prometiéndolo.** Causa real,
   en el Worker: la frase "Si te encaja, dale a **Crear ruta con mapa**..." está en el
   propio prompt (línea ~2910, bloque MODO RECOMENDACIONES / Tiempo 1 de PIEZA A), no la
   inventa el frontend. Con el guardián del bug 1 puesto, el botón ya no salía pero la
   frase seguía ahí, colgada, sin nada que hacer — peor que antes.
   **Arreglo real, en 3 piezas, commit `200de73`, Worker Version ID
   `cda4280b-cea1-458c-af76-e90c1433b57a` (desplegado — GitHub Action "Deploy Worker"
   run #27 — pero esta sesión no pudo confirmarlo contra `/version`, mismo bloqueo de red
   del contenedor de siempre):**
   - `editing_active_route` (mandado por el frontend cuando el popup está abierto sobre
     una ruta activa) cambia el CIERRE EXACTO del Tiempo 1 a "dale a **Añadir a la
     guía**..." — sigue preguntando primero, no añade nada sin que Paco lo confirme (a
     petición explícita suya: "que pregunte si te cuadra").
   - Botón nuevo "➕ Añadir a la guía" (`salma._offerAddToRoute`, análogo a
     `_offerCrearRutaConMapa`) — al tocarlo, `merge_into_route: true`.
   - En el Worker, con `merge_into_route`, los stops nuevos (de `convertProseToRouteJson`,
     que solo conoce el trozo de texto nuevo) se fusionan al final de `currentRoute` como
     día(s) nuevo(s) — título/país/región/días de la ruta activa NO se tocan. Las paradas
     que ya existían se reutilizan sin re-verificar contra Google (mismo mecanismo
     `previousStops` de cualquier edición) — **coste sin cambios** respecto a editar una
     ruta ya guardada, solo se paga la verificación de lo realmente nuevo. Umbral de
     "texto mínimo para convertir" bajado de 400 a 100 caracteres solo para este caso (una
     propuesta de un día es mucho más corta que un plan multi-día completo).
   **Probado en pantalla — el botón NO salió.** Causa real, distinta de la del punto 4: el
   mensaje de Paco ("dime un par de cosas que hacer mañana solo dos cerca") no lleva
   "días" en ningún formato, así que ni `isRouteRequest` ni `isDaysDestination` lo
   detectan — nunca entra en `guidedIsReco` (Tiempo 1), donde vivía el arreglo del punto 4.
   Cae en MODO CONVERSACIONAL normal (respuesta con "Cómo llegar"/"Ruta completa"
   automáticos, sin botón de ningún tipo).

5. **Arreglo 5 — marcador `SALMA_OFFER_ADD_TO_ROUTE`, en vez de seguir ampliando el
   regex.** Commit `fbafe78`, **Worker Version ID `edea4b6e-4fb8-493d-9cd8-48caccb4d974`**
   (GitHub Action "Deploy Worker" run #28 — mismo bloqueo de red de siempre, sin
   confirmar contra `/version`). Mientras se edita una ruta activa desde el popup y el
   mensaje no entra en ningún modo de ruta (`editingActiveRoute && !guidedIsReco &&
   !isRoute`), se inyecta una instrucción para que decida Salma: si su respuesta propone
   algo concreto y añadible, termina con un marcador invisible — mismo patrón que
   `HISTORIA_LUGAR`/`FOTO_TAG`. El Worker lo quita antes de mostrar la respuesta y lo
   convierte en el mismo botón "Añadir a la guía" ya implementado (reutiliza
   `offer_add_to_route`/`merge_into_route`, sin tocar nada del frontend).
   **Aviso de coste (protocolo §8):** mismo turno de Claude que ya se pagaba por
   responder — no hay ninguna llamada nueva, solo una instrucción más en el prompt
   (unos tokens de entrada más) y, cuando aplica, una línea más en la respuesta.
   **CONFIRMADO EN PANTALLA por Paco** — repitió el mismo caso, salió el botón "Añadir a
   la guía" sin marcador visible en el texto, y al tocarlo se sumó bien a la ruta activa.
   Cerrada la saga de los 5 arreglos de este apartado (botón fantasma → contaminación de
   sesión → cierre sin botón → Tiempo 1 no cubría el caso → marcador que sí lo cubre).
   **Sin implementar aparte, a petición explícita de Paco (para después, no ahora):**
   pintar de forma distinta en la guía las paradas añadidas así (highlight/badge de
   "nuevo") — queda anotado, no se ha tocado nada de esto todavía.

---

## Sesión 18 sept 2026 (nueva) — Mis Viajes/Perfil: miniatura real en vez de foto genérica

Petición de Paco: en Mis Viajes casi todas las guías salían con la misma foto genérica.
Causa: `destPhoto()` (`app.js`) es una lista fija de 4 fotos de Unsplash por destino
(Vietnam/Tailandia/Japón/España) + una de respaldo para todo lo demás — la mayoría de
guías caían en la de respaldo. Ya existía la pieza para arreglarlo de verdad: la
miniatura de Google Static Maps con las paradas numeradas que se genera para la tarjeta
de "ruta activa" (sesión 17-18 sept, campo `map_thumbnail_url`).

Commit `f2c65ea`, solo frontend (`app.js?v=118`), sin tocar el Worker. Dos partes,
confirmadas las dos en pantalla por Paco (Mis Viajes y Perfil):
1. Si la guía ya tiene `map_thumbnail_url`, se usa esa en la tarjeta en vez de
   `destPhoto()`/`cover_image` — sin coste, solo reutiliza lo que ya había.
2. Si no la tiene todavía (nunca se abrió como ruta activa), se genera en el momento al
   listar Mis Viajes o el Perfil (una llamada a Google Static Maps por guía, una sola
   vez — se cachea en R2 para siempre, igual que ya hacía `_ensureRouteThumbnail`) y la
   tarjeta cambia de la foto genérica a la real en cuanto llega. **Aviso de coste dado
   y confirmado con Paco antes de implementar** (protocolo §8): del orden de milésimas
   de dólar por imagen, céntimos en total.
Aplicado en los dos sitios que renderizan tarjetas de guía: `_createGuideCard()` (Perfil)
y el `createCard()` local de `loadUserGuides()` (Mis Viajes) — mismo patrón en los dos,
sin deduplicar (siguen siendo funciones separadas, código repetido ya señalado como
deuda técnica aparte).

---

## Sesión 19 sept 2026 — Perfil IA: "Lo que Salma sabe de ti" + extracción automática

Punto de partida: conversación con Paco sobre cómo hacer que Salma sepa de verdad de cada
viajero (gustos, restricciones, patrones) para ganarse su confianza a largo plazo, sin
que se sienta como vigilancia.

1. **Pantalla nueva en Perfil** (`app.js`, `styles.css`, commits `128db86`/`1da63fe`,
   solo frontend): fila nueva "Lo que Salma sabe de ti" en Perfil → Tu Viaje (con el
   contador real de datos guardados), que abre `renderPerfilIA()` — 4 categorías
   (**estilo de viaje**, **restricciones**, **patrones detectados**, **trato y
   satisfacción** — esta última para señales tipo "esto no me sirvió"/"qué borde"
   detectadas en el chat), cada dato con su botón de borrar, un campo para añadir algo a
   mano, y un interruptor de "que Salma use esto para avisarte sola" (control de si
   puede ser proactiva, no solo pasiva). Todo contra `users/{uid}.perfil_ia`
   (`{facts:[{id,categoria,texto,origen,fecha}], proactive}`), sin llamar a ninguna IA —
   la pantalla en sí es solo lectura/edición manual de Firestore.
2. **Extracción automática** (commit `8a99d8c`, Worker + frontend): endpoint nuevo
   `POST /perfil-ia-extract` — recibe un resumen de la ruta recién guardada + últimos 12
   mensajes del chat + los facts que ya existen, y GPT-4o-mini devuelve como mucho 3
   datos nuevos clasificados en las 4 categorías (nunca inventa; array vacío si no hay
   nada real que aportar). Requiere login (mismo motivo que `/route-thumbnail`: sin esto
   sería puerta abierta a gastar sin usuario real detrás). `guardarGuiaDirecto()` la
   llama en segundo plano justo donde antes vivía el Enrich Pass 2 ya eliminado
   (comentario "PIEZA A" en el código) — no bloquea el guardado y si falla no molesta.
   **Aviso de coste dado y confirmado con Paco antes de implementar** (protocolo §8):
   GPT-4o-mini, ~$0,0006 por ruta guardada — atado 1:1 a rutas que ya consumen coins/
   gratis, sin ninguna llamada suelta sin control. A escala (ej. 10.000 usuarios × 1
   ruta/mes) serían ~6€/mes en total.
   **Aviso aparte, dado a Paco al proponerlo**: esto reintroduce el patrón de "llamada
   extra de IA justo al guardar la ruta" que ya se había eliminado una vez por el mismo
   motivo (ver comentario "PIEZA A" en `app.js`) — confirmado explícitamente que se quería
   así de todos modos, con el coste mucho menor que el de aquella (esta es un resumen
   corto, no enrich de cada parada).
   Fusionado a `main` y desplegado (GitHub Action "Deploy Worker" run #29, commit
   `8a99d8c`, **Worker Version ID `9ef33d88-b247-4e68-ace4-4cd7b0343e85`**) — esta sesión
   no pudo confirmarlo además contra `/version` porque el proxy de red del contenedor
   bloquea las llamadas salientes a `salma-api.borradodelmapa-api.workers.dev` (mismo
   bloqueo ya documentado otras veces).
   **Decisión de diseño, a propósito**: el interruptor de "avisarte sola" (proactivo) NO
   frena la extracción automática — son dos cosas distintas (aprender vs. usar lo
   aprendido para escribir primero). Si en el futuro se quiere poder apagar también el
   aprendizaje en sí, hace falta un interruptor aparte con su propio texto, no reusar
   este.
   `?v=` subidos: `styles.css` a 106, `app.js` a 121.

   **Primer intento de confirmación, 19 sept 2026, sin resultado — causa encontrada.**
   Paco generó una ruta, la guardó y abrió "Lo que Salma sabe de ti": sin datos nuevos.
   Pidió el log del panel 🐛, pero venía de **reabrir la guía tras refrescar la página**
   — el panel vacía su buffer en cada refresco, así que el momento real de guardar (que
   es cuando `_perfilIAExtract` se dispara) ya no estaba en ese log; solo se vieron las
   peticiones de fotos y el GPS de abrir la guía, nada de `[PerfilIA]`. Se añadió
   logging de diagnóstico a la función (commit `40c2be3`→`64b195a` tras rebase, `?v=
   app.js` a 122) para la próxima vez. **Confirmado aparte, mirando el código exacto que
   corre hoy**: el endpoint `/perfil-ia-extract` sigue intacto en el Worker
   `1d8cf715` (la otra sesión que arregló el orden geográfico no lo tocó al desplegar
   encima) — no es un problema de que el endpoint haya desaparecido.
   **Pausado a petición de Paco (19 sept 2026)**: no va a generar más rutas de prueba
   por ahora (mismo motivo que la pausa ya anotada más abajo, revisar coste de APIs
   antes de seguir probando). **No perseguir esto hasta que Paco lo pida.** Cuando
   retome: guardar una ruta → en cuanto salga el toast "Guía guardada", abrir el panel
   🐛 y copiar **sin refrescar la página antes** — así sí saldrán las líneas
   `[PerfilIA] ...` (piden extracción / facts recibidos o error / guardados N datos).

---

## Sesión 19 sept 2026 — Sistema de feedback de testers (nota + logs por WhatsApp)

Paco quiere probar la app con varios viajeros testers y que sus anotaciones (con los
logs de lo que vieron) le lleguen sin fricción. Diseño hablado antes de tocar código:
extender el panel 🐛 ya existente (captura logs/errores/versión) en vez de montar algo
nuevo, y avisar por WhatsApp reutilizando la infraestructura de Twilio de F5.1 — sin
esperar a que el resto del canal WhatsApp (F5.2+) esté terminado, porque esto solo
necesita mandar, no recibir.

**Cambios:**
1. **Botón "📝 Feedback" en el panel 🐛** (`debug-panel.js`, junto a "Copiar"). Al
   tocarlo, sustituye la vista de logs por un textbox corto ("¿qué ha pasado?"); al
   enviar, manda la nota + todos los logs/errores ya capturados + versión del Worker y
   de los scripts (`?v=`) + pantalla + user agent. Pide login (mismo requisito que el
   resto de la app para escribir en Firestore) — sin sesión, avisa en vez de fallar en
   silencio. "Cancelar" vuelve a la vista de logs sin perder nada.
2. **Endpoint nuevo `POST /beta-feedback`** (`worker/salma-worker.js`, junto a
   `/whatsapp`). Verifica el token del tester (`verifyAuthAndGetUser`, mismo guardián
   que el chat principal) y escribe en Firestore `beta_feedback/{id}` **autenticado con
   el propio ID token del tester** — mismo patrón que `url_validation_incidents`
   (Bloque E) y `flight_watches`: la regla de Firestore exige que `user_id` coincida con
   el uid que Firestore verifica de verdad al validar la firma del token, así que un
   token falso o de otro usuario no puede colarse aquí aunque el campo lo mande el
   cliente. Colección nueva, solo alta (sin editar/borrar desde el cliente) — regla
   añadida a `firestore.rules`.
3. **Aviso a Paco por WhatsApp**, reutilizando `sendWhatsAppMessage()` (la misma función
   de F5.1) con `ctx.waitUntil()` para no bloquear la respuesta al tester si Twilio va
   lento. Manda quién es (email), en qué pantalla estaba, la nota completa y las últimas
   15 líneas de log.
   **Aviso de coste (protocolo §8):** esto añade una llamada a Twilio (WhatsApp) por
   cada feedback que mande un tester — con un puñado de testers probando de vez en
   cuando, unas pocas llamadas a la semana, fracciones de céntimo cada una. Si no llega
   a mandarse (faltan secrets, ver abajo), el feedback se guarda igual en Firestore, solo
   no avisa — no es un fallo bloqueante.
   `?v=` de `debug-panel.js` subido a 5 en `index.html`.

**CERRADO — 19-21 sept 2026, CONFIRMADO EN PANTALLA por Paco de punta a punta.**
Los 4 pasos que quedaban pendientes se hicieron en sesión de Code con acceso a
terminal/Firebase de Paco (esta sesión de redacción no tenía esas credenciales):
1. Worker desplegado (`wrangler deploy -c wrangler.toml`).
2. **Reglas de Firestore desplegadas** (`firebase deploy --only firestore:rules
   --project borradodelmapa-85257`) — **esta era la causa real de que no llegara nada**,
   ver más abajo.
3. Los 4 secrets de Twilio puestos y confirmados: `TWILIO_ACCOUNT_SID`,
   `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` (`whatsapp:+14155238886`, sandbox),
   `PACO_WHATSAPP_TO` (`whatsapp:+34678668480`).
4. **Probado en pantalla**: nota de prueba desde "Tester Member 💬" → aparece en
   Firestore `beta_feedback` y llega el WhatsApp con el aviso "🧪 Feedback tester...".

**Historial de la depuración (21 sept), por si se repite algo parecido en otro
endpoint que también use `sendWhatsAppMessage()`:**
- El eco de F5.1 (`/whatsapp`) fallaba primero por **firma de Twilio inválida**
  (`WhatsApp: firma de Twilio inválida, petición rechazada` en `wrangler tail`) — causa:
  el Auth Token copiado a Cloudflare era el de la cuenta/proyecto de Twilio equivocado
  (la consola de Twilio tenía dos proyectos distintos — "Mi nuevo proyecto de chatbot
  SMS", donde está el Sandbox, y "Cuenta de paco.defoto@gmail.com" — y además Twilio
  reubicó la página del Auth Token de "General settings" a "API keys & tokens" sin
  avisar, con un token "en vivo" y otro "de prueba" con SIDs distintos). Resuelto
  recopiando el Auth Token de **Credenciales en vivo** del proyecto correcto.
- Con el eco ya funcionando, `/beta-feedback` seguía sin avisar — Firestore devolvía
  `403 PERMISSION_DENIED` en cuanto se le puso logging de diagnóstico (`console.error`
  temporal, quitado después de confirmar). La regla de `beta_feedback` estaba escrita
  en `firestore.rules` desde el 19 sept pero **nunca se había desplegado a Firebase** —
  exactamente el pendiente #2 de más arriba, que se había quedado sin hacer. El
  `firebase deploy` necesitó `firebase use --add` (o `--project borradodelmapa-85257`
  directo, más fiable si el selector interactivo de PowerShell no responde a las
  flechas) porque el proyecto Firebase de este repo no tiene `.firebaserc` en el árbol.
- **Lección para la próxima vez que algo similar "no llega" sin error visible**: revisar
  primero la causa más aburrida (reglas de Firestore sin desplegar) antes de sospechar
  del código — costó bastante más tiempo perseguir la firma de Twilio y la config del
  Worker que este último paso, que era el que realmente faltaba.

**Casi-incidente al desplegar la limpieza final, mismo 21 sept — protocolo §1B en
acción, sin daño real.** Al quitar el `console.log`/`console.error` de diagnóstico, el
primer disparo de la GitHub Action "Deploy Worker" se hizo sobre una copia de la rama
de esta sesión que llevaba **más de 20 commits de retraso respecto a `main`** — otra
sesión llevaba un rato trabajando en paralelo (previsión de tiempo, buscar ciudad,
FAB de editar guía, pestaña Ayuda, fix Catar→Hungría). Ese deploy dejó producción sin
ese trabajo durante ~90 segundos. Se detectó al momento (`git merge-base --is-ancestor`
contra `origin/main` antes de dar el deploy por bueno — comprobación que debería
hacerse siempre antes de cualquier deploy disparado desde una rama que no sea `main`
directamente), se fusionó `origin/main` a la rama de esta sesión sin conflictos, y se
volvió a desplegar con todo junto. **Desplegado, GitHub Action "Deploy Worker" run #38,
commit `77f4075` (merge de la rama de WhatsApp + `main`), Worker Version ID
`cf7dfe37-8fc9-4464-a229-0bc4a596bf91`** — sin confirmar contra `/version` por el mismo
bloqueo de red del contenedor de siempre. **Lección**: si una sesión dispara un deploy
desde una rama que no es `main` (vía GitHub Action con `ref` explícito), comprobar
SIEMPRE primero que esa rama no está por detrás de `main` — el mismo riesgo que ya
cubre el protocolo §1B para pushes normales aplica igual a un deploy disparado así.

**No implementado a propósito, para no ampliar el encargo sin que Paco lo pida:**
una vista en `admin.html` para leer el feedback sin entrar a la consola de Firebase.
Por ahora, ver la colección `beta_feedback` directamente en Firebase Console. Si con
varios testers a la vez esto se queda corto, es el siguiente paso natural.

**Rediseño del mismo día, a petición de Paco tras ver el botón en pantalla:** el flujo
de dos pasos (lista de logs → botón "Feedback" → formulario) confundía al usuario
normal, y a Paco le faltaba una forma rápida de copiarse él mismo la nota+logs para
pegarlos aquí en el chat. Simplificado a una sola pantalla (`debug-panel.js?v=6`): el
🐛 abre **directo** el cuadro de texto (sin pasar por la lista de logs en crudo, que
desaparece de la vista aunque los logs se siguen capturando igual por detrás), con la
versión de Worker+scripts siempre visible arriba, y dos botones:
- **"Enviar"** — el de los testers, manda nota+logs a `POST /beta-feedback` (sin
  cambios respecto a antes).
- **"📋 Copiar"** — nuevo, para el propio Paco: copia nota + versión + logs en un solo
  texto al portapapeles, listo para pegarlo en el chat con Claude Code sin pasos
  intermedios.
Se quitaron de la vista "Limpiar" y la lista de logs en crudo (antes visibles por
defecto) — puro ruido para el tester, y Paco ya tiene su caso de uso cubierto con
"Copiar". Sin cambios en el Worker ni en costes.

**Segundo ajuste el mismo día, tras confirmar en pantalla que la función ya iba bien
(captura de Paco: "la función trabaja bien copia cuadro de texto más LOG")** —
3 retoques finos, todos frontend, `debug-panel.js?v=7`:
1. **Orden invertido**: el cuadro de texto ahora es el primer elemento de la pantalla
   (antes iba la versión primero) — "que lo primero que se vea sea el cuadro de texto".
   La versión de Worker+scripts baja a justo debajo del textarea, sigue visible igual.
2. **Mensaje cambiado**: el texto de ayuda de antes ("Cuéntanos qué ha pasado — se
   manda junto con los logs...") pasa a ser el placeholder del propio textarea, con
   redacción nueva pedida por Paco: *"Cuéntanos tu experiencia, si has tenido algún
   problema o ideas para mejorar..."* — menos centrado en "algo se ha roto", más
   abierto a feedback general.
3. **Botón flotante rediseñado**: de un círculo 🐛 semitransparente (opacity .55, sin
   texto visible, solo un `title` que en móvil no se ve nunca) a una píldora naranja
   sólida con texto — **"💬 Tu opinión"** — a petición explícita de Paco ("que el
   usuario sepa para qué sirve"). El estado de error (JS error capturado) lo sigue
   marcando en rojo pulsante, mismo mecanismo de antes.
Sin cambios en el Worker ni en costes — solo maquetación y copy.

**Tercer ajuste el mismo día, tras captura de Paco: el botón flotante "💬 Tu opinión"
se quedaba montado ENCIMA de la versión mientras el panel ya estaba abierto** — bug
real, no solo estético: el botón flotante (`z-index` más alto que el propio overlay,
a propósito, para que nunca quede tapado por el resto de la app) seguía pintándose
por encima del panel de feedback también, tapando parte del texto de versión. Corregido
en `debug-panel.js?v=8`: `openPanel()` oculta el botón flotante al abrir (ya no hace
falta, el panel ya está abierto) y lo devuelve al cerrar con la ✕. De paso, más espacio
entre el bloque de versión y los botones Enviar/Copiar (estaban pegados). Sin cambios
en el Worker ni en costes.

**Cuarto ajuste el mismo día**: Paco preguntó si los botones Enviar/Copiar quedaban
justo debajo del cuadro de texto — no era así, la versión se colaba entre medio.
Reordenado en `debug-panel.js?v=9`: cuadro de texto → botones Enviar/Copiar → versión
(al final, como pie de página). Sin cambios en el Worker ni en costes.

**Quinto ajuste el mismo día**: botón flotante renombrado de "💬 Tu opinión" a
**"Tester Member 💬"** (texto delante del icono, a petición de Paco), subido un poco
más arriba en la pantalla (`bottom` de 130px a 170px) — `debug-panel.js?v=10`. La
forma se deja en píldora totalmente redondeada (`border-radius:999px`, ya era el
máximo redondeo posible con texto dentro) — si Paco quería un círculo puro sin texto
visible, decirlo para ajustar en la próxima vuelta. Sin cambios en el Worker ni en
costes.

**Sexto ajuste el mismo día — botón de adjuntar captura, `debug-panel.js?v=11` +
Worker.** Petición de Paco: poder adjuntar una imagen al feedback, reutilizando lo
mismo que ya usa la cámara del chat. Botón "📎 Adjuntar captura" debajo del cuadro de
texto (abre el selector de archivos, con `accept="image/*"` — en móvil esto también
deja elegir "Cámara" directamente, no hace falta un control aparte); al elegir una
imagen se comprime en el propio navegador con `salma._compressImage()` (la misma
función que ya usa la cámara del chat normal, sin tocar nada nuevo) y se ve una
miniatura con opción de quitarla. Al tocar "Enviar", si hay captura, se sube primero a
R2 por el mismo camino que ya usa la galería (`POST /upload-gallery-photo`, existente,
sin cambios) y la URL resultante se manda junto con la nota a `POST /beta-feedback`, que
ahora también la guarda en Firestore (`screenshot_url`) y la incluye como enlace en el
aviso de WhatsApp. El botón "Copiar" (portapapeles) sigue siendo solo texto — si hay
una captura pendiente, el texto copiado avisa de que hay que usar "Enviar" para que
llegue de verdad. **Aviso de coste:** no llama a ninguna API de pago (Google/Anthropic/
OpenAI/etc.) — solo guarda el fichero en R2, el mismo almacenamiento que ya usa cada
foto de la app (céntimos por miles de fotos, irrelevante a este volumen de testers).

**Séptimo ajuste el mismo día — "Copiar" también sube la captura, `debug-panel.js?v=12`.**
Paco notó que "Copiar" no incluía la URL de la foto, solo avisaba de que había una
pendiente. Corregido: la subida a R2 se movió a una función compartida
(`uploadPendingShot()`) que usan tanto "Enviar" como "Copiar" — al tocar Copiar, si hay
captura, primero la sube (mismo endpoint de galería de siempre) y mete la URL ya
resuelta al principio del texto copiado (`📎 Captura: https://...`), listo para pegar
aquí sin tener que pasar por "Enviar". Mismo aviso de coste que el ajuste anterior —
sigue siendo solo almacenamiento R2, cero llamadas a APIs de pago.

**Octavo ajuste, 21 sept 2026 — el botón flotante pasa a ser la primera pestaña del
menú de abajo, y "Consultas" se quita de ahí.** Petición explícita de Paco: el botón
"Tester Member 💬" flotante (abajo-derecha) molestaba y ocupaba demasiado sitio en
pantalla. Commit `b241860`, solo frontend (`debug-panel.js?v=13`, `app.js?v=136`,
`styles.css?v=116`), sin tocar el Worker:
1. `debug-panel.js` ya no crea ningún botón flotante propio (`injectButton()`
   eliminada) — solo expone `window.__dbg.open()` para que lo llame quien quiera abrir
   el panel. El badge rojo de "hay un error capturado" (antes `.dbg-has-error` en el
   propio botón flotante) ahora se pone en `#tab-tester`.
2. `app.js` (`updateBottomBar()`): nueva pestaña **"Ayuda"** (`#tab-tester`, icono de
   círculo con interrogación) como **primera** de las 4 — delante de Salma/Mis
   Viajes/Perfil —, con animación de latido continuo (`.bottom-tab-tester`,
   `styles.css`) para que destaque frente al resto del menú, y más rápido/en rojo si
   hay un error capturado (mismo patrón que ya tenía el botón flotante, solo
   reubicado). Al tocarla llama a `window.__dbg.open()` — mismo panel de feedback de
   siempre, sin cambios en su contenido.
3. **Se quita la pestaña "Consultas" del menú de abajo** (`#tab-consultas`) para dejar
   sitio — a petición explícita de Paco ("aprovecha y quita de ahí botón consultas").
   La vista de "Últimas consultas" en sí NO se ha tocado y sigue accesible igual desde
   el chip "Últimas consultas" de la pantalla vacía del chat (`app.js`, `action:
   'consultas'` → `showState('consultas')`, sesión 19 sept "Simplificación de chips").
**Sin coste** — cambio puramente de UI, no toca ninguna API de pago.
**CONFIRMADO EN PANTALLA por Paco** ("Ok correcto") — sin nada pendiente de esto.

**Noveno ajuste, 22 sept 2026 — aviso también por email (Resend), porque el de WhatsApp
dejó de fiarse a media migración de Twilio a producción (ver "📱 Salma en WhatsApp").
DESPLEGADO, CONFIRMADO EN PANTALLA por Paco: "si me llega mail".** Commit `8f47a3c`,
solo Worker (`worker/salma-worker.js`): función nueva `sendFeedbackEmail()` (API REST de
Resend, mismo patrón que `sendWhatsAppMessage()`) llamada en `/beta-feedback` en paralelo
al intento de WhatsApp — ninguno bloquea al otro ni la respuesta al tester, y el feedback
se guarda en Firestore igual aunque los dos avisos fallen. 2 secrets nuevos en Cloudflare,
puestos y confirmados por Paco: `RESEND_API_KEY`, `PACO_EMAIL_TO` (`paco.defoto@gmail.com`).
Remitente `onboarding@resend.dev` (sin dominio propio verificado en Resend — suficiente
para avisar a un solo destinatario). **Aviso de coste (protocolo §8), dado antes de
implementar:** plan gratuito de Resend, 100 emails/día — a este volumen de testers no
hay manera realista de acercarse al límite, coste esperado: cero.

---

## Sesión 19 sept 2026 — Simplificación de chips del chat vacío: 6 fijos + "Más opciones"

Petición de Paco: los 10 chips del chat vacío (repartidos en columnas descompensadas, 4
vs 6) eran demasiada información — quería centrar la pantalla en la guía y dejar solo lo
esencial a la vista, sin perder el resto de opciones. Antes de tocar código se hizo un
mockup interactivo (Design Artifact, no llegó al repo) con las dos versiones lado a lado
para acordar el diseño con Paco.

**Cambio, solo frontend (`app.js`, `styles.css`), sin tocar el Worker ni ninguna API de
pago, commit `1b10d49`, fusionado directo a `main` (fast-forward):**
1. **6 chips fijos**, en grid parejo 2×3 (antes 10 en columnas de 4 y 6): Cerca mía,
   Últimas consultas (antes "Consultas"), Mis notas (antes "Notas"), Narrador, Buscar
   alojamiento (antes "Alojamiento"), SOS. Mismas acciones/mensajes de siempre, solo
   cambian las etiquetas y cuáles se ven por defecto.
2. **"Más opciones ▾"** nuevo, plegado por defecto, debajo de los 6: Vuelos, Alertas
   vuelos, Cambio moneda (antes "Moneda"), Traductor — se abre con un tap (animación de
   `max-height`), y recuerda si Paco lo dejó abierto la última vez
   (`localStorage: bdm_ce_more_open`).
`?v=`: `app.js` a 123, `styles.css` a 107 en `index.html`.

**CONFIRMADO EN PANTALLA por Paco** ("So esta correcto") — sin nada pendiente de esto.

---

## Sesión 19 sept 2026 (nueva) — Bug del botón Compartir + Compartir ahora exige login

**Bug real, CONFIRMADO EN PANTALLA por Paco tras el fix.** El botón Compartir de la
vista de itinerario decía "no hay ruta guardada" y no ofrecía compartir nada. Causa:
`_handleShare()` (`mapa-itinerario.js`) depende de `salma.currentRoute`/`currentRouteId`
para saber qué ruta compartir, pero eso solo se sincronizaba al abrir el chat flotante
(FAB) sobre la guía — abrir una guía guardada desde la tarjeta "ruta activa" del billete
o desde Mi Diario llama a `openItinerarioView()` directo, sin pasar por
`salma.cargarGuia()`, así que `currentRoute` se quedaba a `null`. Tocar Compartir sin
haber abierto antes el chat intentaba "guardar" primero, veía `currentRoute` vacío,
mostraba "No hay ruta para guardar" y no hacía nada más.
**Arreglo, commit `c9ab097`:** la sincronización se movió dentro de `openItinerarioView()`
mismo, así que funciona sea cual sea el punto de entrada. `mapa-itinerario.js?v=69`.

**Petición de Paco tras confirmar el fix — 3 cambios más sobre el mismo botón:**
1. Que el link vaya acompañado de un mensaje ("Te comparto esta ruta: X"), no solo la
   URL a secas. Commit `e3a72e4`, solo frontend, sin coste — `mapa-itinerario.js?v=70`.
2. Que quien reciba el link tenga que registrarse/entrar para verlo.
3. Que la vista que vea sea la vista de itinerario real de la app (mapa + tarjetas), no
   la página pública estática (404.html) que hasta ahora usaba el link de compartir.

**Antes de tocar 2 y 3 se preguntó a Paco**, porque el link de "Compartir" usaba el
MISMO mecanismo que las guías públicas de SEO (`public_guides`, lectura abierta sin
login — cada ruta que se guarda se publica ahí automáticamente, es lo que indexa
Google en las guías de usuarios) — exigir login a TODAS las guías públicas habría roto
esa indexación. Paco confirmó: login **solo** para lo compartido por el botón, las
guías de SEO se quedan igual; y el visitante, una vez dentro, **puede guardarse la
ruta en su propia cuenta** (no solo verla).

**Implementado, commit `4569e9e`, `app.js?v=124` + `mapa-itinerario.js?v=71` +
`firestore.rules` (colección nueva) — DESPLEGADO EL FRONTEND, sin confirmar en
pantalla, y con un paso manual pendiente (ver abajo) antes de que funcione de punta a
punta:**
- Colección nueva `shared_routes/{id}` (mismo id que la guía del dueño en
  `users/{uid}/maps/`) — lectura solo autenticada, escritura solo del dueño
  (`firestore.rules`, patrón "solo alta" ya usado en `beta_feedback`/
  `url_validation_incidents`, aquí con `update`/`delete` propios añadidos por si el
  dueño edita la ruta y vuelve a compartir).
- `_doShare()` (`mapa-itinerario.js`) ya no busca el slug de `public_guides` — escribe
  la ruta completa en `shared_routes/{id}` y arma el link como
  `origin + '/?compartir=' + id`, sobre la propia app (no sobre el truco de 404.html).
- `app.js`: al cargar, si la URL trae `?compartir=ID` se guarda en
  `window._pendingShareId`. Como el gate de `index.html` ya obliga a cualquier
  visitante sin sesión a registrarse/entrar antes de ver nada de la app (no hace falta
  ninguna pantalla nueva de aviso), basta con recogerlo dentro de
  `auth.onAuthStateChanged` en cuanto hay sesión (recién registrado o ya la tenía) →
  `_openSharedRoute()` lee `shared_routes/{id}` y abre `openItinerarioView(routeData,
  null, {...})` — con `docId=null` a propósito, para que el botón GUARDAR de esa vista
  cree una guía NUEVA en la cuenta del visitante en vez de intentar tocar la del dueño
  (que además las reglas de Firestore no dejarían).

**Pendiente, antes de que esto funcione de punta a punta — nada de esto se ha hecho
desde esta sesión (sin credenciales de Firebase en este contenedor):**
1. **Desplegar `firestore.rules`** (`firebase deploy --only firestore:rules`) — sin
   esto, escribir en `shared_routes` (o sea, pulsar Compartir) lo rechaza Firestore con
   permiso denegado, aunque el código del botón ya esté en producción.
2. **Probar en pantalla**: compartir una ruta, abrir el link en una sesión sin login
   (incógnito o otro dispositivo), confirmar que pide registro/login antes de enseñar
   nada, y que tras entrar se abre la vista de itinerario real con el botón GUARDAR
   visible — y que "Guardar" la deja en Mis Viajes de esa segunda cuenta sin tocar la
   del dueño original.
   **Nunca decir "arreglado" de esto hasta que ese flujo completo se vea en pantalla.**
   **ACTUALIZACIÓN 21 sept 2026:** el punto 1 (desplegar `firestore.rules`) NO hacía falta: ya estaba publicada. Comprobado con una lectura de solo lectura desde la consola de Paco (ojo: los IDs de documento tipo `__algo__` están reservados por Firestore y dan `invalid-argument`; usar un ID normal). Queda solo el punto 2: probar en pantalla el flujo completo (compartir → abrir el enlace sin sesión → pide login → se ve la guía → GUARDAR la deja en la 2ª cuenta).
   **CONFIRMADO EN PANTALLA por Paco (21 sept 2026): el flujo completo de Compartir funciona de punta a punta.** Cerrado — sin nada pendiente de esto.

**Sin implementar, a petición explícita de Paco (opinión pedida, no desarrollo):**
Paco planteó, para pensar y no para ahora, aprovechar esto para crear grupos de viaje
usando WhatsApp. Opinión dada en el chat (no en este archivo, retomar la conversación
si se quiere recuperar el razonamiento completo): encaja mejor como una fase posterior
del canal de WhatsApp ya planeado (F5, ver más abajo) que como parte de esta feature de
compartir — comparten infraestructura (Twilio, `whatsapp_sessions`) pero son productos
distintos (un link de una ruta suelta vs. un grupo con varias personas viendo/editando
la misma). No tocar nada de esto sin que Paco lo pida explícitamente.

---

## Sesión 20 sept 2026 — Hora + tiempo + país juntos en el índice (reloj mundial)

Petición de Paco: el "SEP" fijo de la cabecera del billete (pantalla de inicio) no
aportaba nada útil, y "el tiempo" (clima) llevaba oculto de esa misma pantalla desde
el 8 sept ("limpieza C", solo aparecía tras el primer mensaje) — sin que quedara
anotado aquí, porque se pidió en otro chat sin el repo enlazado. Motivo explícito de
Paco, no capricho: consultar la hora de un país al comprar vuelos con escalas.

**Parte 1 — reloj mundial, solo Intl, sin coste.** `country-utils.js`: `COUNTRY_TZ`
(mapa código ISO2 → huso IANA, 187 países, aproximación por capital/ciudad principal
en países con varios husos) + `countryTimeString(code)` (usa `Intl.DateTimeFormat`
del propio navegador, sin llamar a ninguna API) + `countryList()` para el buscador.
`app.js`: cabecera pasa de `<span class="ce-meta">SEP</span>` a un reloj tocable que
abre un picker de país (busca sin acentos, guarda elección en `localStorage:
bdm_clock_country`). **CONFIRMADO EN PANTALLA por Paco.**

**Parte 2 — fusión con el clima, mismo día, a petición de Paco tras ver el reloj.**
Preguntado explícitamente antes de tocar nada (protocolo §8, toca `/weather` →
OpenWeatherMap): ¿el clima de la barra es siempre el de tu ubicación real (gratis,
sin cambios) o el del país que elijas en el reloj (útil para la escala, pero llamada
nueva a OpenWeather por país)? Paco pidió las dos cosas — por defecto tu ubicación,
y también poder buscar el clima de cualquier país.
- **Modo "Mi ubicación" (por defecto)**: hora y país vienen del país ya detectado por
  el Copiloto vía GPS+Nominatim (`salma._copilotCountry`, mecanismo ya existente y
  gratuito) — sin duplicar esa detección. El clima reutiliza el mismo `/weather?lat=&lon=`
  que ya se llamaba en otros puntos de la app — **sin llamada nueva**.
- **Modo país elegido**: hora del país (Parte 1) + `/weather?city=<Ciudad>,<ISO2>`
  usando la MISMA ciudad que ya lleva el huso horario en `COUNTRY_TZ` (se extrae del
  propio string de la zona, ej. `Europe/Madrid` → `Madrid` — sin mantener una tabla de
  capitales aparte). **Esta sí es una llamada nueva a OpenWeatherMap, una por país que
  se elija** — avisado y confirmado con Paco antes de escribir código. Gratis hasta
  1000 llamadas/día en el plan actual; a este volumen de uso no debería generar coste
  real, pero es una llamada que antes no existía en este flujo.
- Caché de 20 min en memoria (`window._ceSkyWxCache`) por modo, para no repetir la
  llamada de clima cada vez que se re-renderiza la pantalla de inicio.
- Orden pedido por Paco, tal cual: hora y día → tiempo (clima) → info del país.
  Barra `.ce-sky` bajo la marca, siempre visible desde el primer vistazo, sin
  necesidad de mandar un mensaje ni desplegar nada — se actualiza sola cada 30s.
- Picker ampliado con botón "📍 Mi ubicación" arriba del buscador de país.

`?v=`: `country-utils.js` a 3, `app.js` a 127, `styles.css` a 109. Commits
`f835b7a` (reloj) y `4e78df1` (fusión con clima), ambos ya en `main`.
**CONFIRMADO EN PANTALLA por Paco** — pidió tres ampliaciones más (ver Parte 3).

**Parte 3 — previsión, buscar ciudad e info del país, mismo día.** Petición de Paco
tras confirmar la Parte 2 en pantalla: previsión de varios días, poder elegir una
ciudad concreta (no solo país) y meter la tarjeta de info práctica del país (Copiloto)
debajo, cambiando también con la selección.
- **Previsión**: `/weather` YA devolvía `forecast` (hasta 4 días) — nunca se pintaba en
  esta barra. Ahora se muestra debajo del tiempo actual, reutilizando `.wx-forecast`/
  `.wx-fc-day` (mismas clases que ya usaba la Weather Banner del chat). **Sin llamada
  nueva** — es el mismo `/weather` de siempre, solo que ahora se lee ese campo.
- **Buscar ciudad**: el picker admite texto libre además de la lista de 187 países —
  al escribir algo que no es un país, aparece "🔍 Buscar '...' como ciudad", que llama
  al mismo `/weather?city=` ya usado para país (misma cadencia de llamada ya aprobada
  en la Parte 2, solo que ahora la ciudad la elige Paco en vez de ser siempre la
  capital). Para la hora de esa ciudad exacta (necesario en países con varios husos,
  ej. Los Ángeles vs Nueva York en EEUU) se añadió `utc_offset_sec` a la respuesta de
  `/weather` en `worker/salma-worker.js` (`fetchWeatherBanner`) — dato que el Worker
  ya calculaba internamente para la previsión, solo faltaba devolverlo. **Sin llamada
  nueva tampoco aquí**, es el mismo `/weather` exponiendo un campo más.
- **Info del país**: tarjeta nueva debajo del tiempo (`#ce-sky-info`, reutiliza las
  clases `.copilot-card`/`.copilot-section` ya existentes, HTML propio en
  `_ceSkyInfoHTML()` para no tocar `salma.showCopilotCard()` — que sigue atada a la
  ubicación GPS real y se usa en otros sitios, no convenía mezclarla). Llama a
  `/practical-info?country=`, que es **solo lectura de KV de Cloudflare — sin ninguna
  API de pago detrás**, así que cambia con cada país/ciudad elegido sin coste
  ninguno. Caché en `sessionStorage` por país para no repetir la lectura.
- Estado guardado pasa de un string suelto a un objeto JSON
  (`localStorage: bdm_sky_sel`, `{mode:'here'|'country'|'city', ...}`), con migración
  automática desde el formato anterior (`bdm_clock_country`) — no hace falta que nadie
  borre nada a mano.

Worker desplegado (GitHub Action "Deploy Worker", disparada por esta misma sesión vía
la API de GitHub — confirmado con los logs del job, sin depender de `/version` que
esta sesión no puede alcanzar): commit `c6bce1d`, **Worker Version ID
`6160cd0e-4e8c-426e-af7b-a00caf89b826`**.

`?v=`: `country-utils.js` a 4, `app.js` a 128, `styles.css` a 110.
**Pendiente: que Paco confirme en pantalla** que ve la previsión debajo del tiempo,
que puede buscar y elegir una ciudad suelta (no solo país) y que la hora de esa
ciudad es la correcta, y que la tarjeta de info del país aparece debajo y cambia al
cambiar de país/ciudad.

**Parte 4 — bug real: banner de tiempo duplicado, 21 sept 2026, DESPLEGADO, sin
confirmar en pantalla.** Paco mandó captura: el `#weather-banner` viejo del chat
(existía desde antes de esta saga, se activaba solo al mandar el primer mensaje —
ver "limpieza C" del 8 sept más abajo en este archivo) se quedaba pegado ENCIMA de
toda la pantalla de inicio, duplicando la barra nueva de abajo — porque se inserta
como hermano de `#chat-area`, no dentro, así que sobrevive a los re-render de
`_renderChatEmpty()` y no desaparece nunca al volver al índice. Paco pidió: quitar
el viejo, quedarse con el nuevo, pero traerle al nuevo el detalle que el viejo sí
tenía (sensación térmica, viento con dirección y racha, humedad, calidad del aire,
ubicación exacta tipo "Ribadedeva") y subir el tamaño de letra.
- `salma.js`: los dos sitios que llamaban a `initWeatherBanner()` (`_initChat` y
  `_addUserBubble`) se comentan — la función se queda por si hiciera falta
  reactivarla, solo se deja de invocar.
- `app.js`: la caché en memoria (`window._ceSkyWxCache`) pasa de guardar solo el
  texto ya formateado a guardar la respuesta COMPLETA de `/weather` — de ahí sale
  gratis todo el detalle que antes solo tenía el banner viejo (mismo endpoint, cero
  llamadas nuevas). La tarjeta de tiempo reutiliza las clases
  `.wx-main`/`.wx-loc`/`.wx-temp`/`.wx-desc`/`.wx-extras` que ya usaba el banner
  viejo (de ahí sale también el tamaño de letra más grande que pidió Paco, sin
  inventar CSS nuevo). La hora queda en su propia línea encima.
  Sin cambios en el Worker ni en costes.
`?v=`: `styles.css` a 113, `app.js` a 132, `salma.js` a 100. Commit `6759c16`, ya en
`main`. **CONFIRMADO EN PANTALLA por Paco** — ya no sale duplicado, pidió 3 retoques
finos más (ver Parte 5).

**Parte 5 — retoques finos tras confirmar la Parte 4, mismo 21 sept 2026,
DESPLEGADO, sin confirmar en pantalla.** Solo frontend, sin tocar el Worker:
1. La línea de sensación/viento/racha/humedad/AQI se envolvía en 2-3 líneas en
   móvil — ahora va en una sola línea con scroll horizontal si no cabe entera
   (mismo patrón que la previsión), nunca se pierde información.
2. Botón "▾ previsión" demasiado pequeño como zona de toque — de 10px a 14px,
   más relleno vertical.
3. **Quitada del todo la tarjeta "Info práctica del país"** (la del Copiloto,
   añadida en la Parte 3 del 20 sept) — Paco pidió explícitamente quitarla de
   esta barra. `_ceSkyInfoRefresh()`/`_ceSkyInfoHTML()` se borraron (ya no las
   llama nadie); `_ceSkyInfoCountryFor()` se queda, la sigue usando la bandera
   de la línea de ubicación del tiempo.
`?v=`: `styles.css` a 114, `app.js` a 133. Commit `dd9eb3e`, ya en `main`.
**CONFIRMADO EN PANTALLA por Paco lo del tiempo (línea única + botón de
previsión) — pero el punto 3 (quitar info del país) se hizo mal, ver Parte 6.**

**Parte 6 — malentendido corregido: había DOS tarjetas de "Info práctica del
país" distintas, 21 sept 2026, DESPLEGADO, sin confirmar en pantalla.** Paco
mandó una segunda captura: la que quité en la Parte 5 era la mía (la nueva,
debajo del tiempo) — la que él quería quitar era OTRA, más antigua, que
seguía saliendo más abajo en la pantalla de inicio, justo encima de los 6
chips (`salma.showCopilotCard()` — la tarjeta del Copiloto por GPS, existía
desde mucho antes de esta saga, sin relación directa con `.ce-sky`). Se
disparaba desde 4 sitios de `salma.js` (`newChat()`, `_initChat()`, y dos
dentro de `initCopilot()`) cada vez que ya había datos de país cacheados —
por eso seguía apareciendo aunque la mía ya no estuviera.
- `app.js`: restaurada la tarjeta mía (`_ceSkyInfoRefresh`/`_ceSkyInfoHTML`,
  contenedor `#ce-sky-info`) tal como estaba en la Parte 3, debajo del tiempo.
- `salma.js`: los 4 disparadores de `showCopilotCard()` comentados (mismo
  patrón ya usado con el banner de tiempo viejo, Parte 4) — la detección en
  sí (`_copilotCountry`/`_copilotData`, gratis, GPS+Nominatim) se queda
  intacta, la sigue usando `_ceSkyInfoCountryFor()` para el modo "aquí".
`?v=`: `styles.css` a 115, `app.js` a 134, `salma.js` a 101. Commit `37909e1`,
ya en `main`. **CONFIRMADO EN PANTALLA por Paco: una sola tarjeta ya, sin
duplicado** — pero salió un bug real distinto al probar Catar (ver Parte 7).

**Parte 7 — bug real: "Catar" resolvía a Hungría, 21 sept 2026, DESPLEGADO,
sin confirmar en pantalla.** Paco probó cambiar de país a Catar y tanto el
tiempo como la info del país salieron de **Hungría** (pueblo "Csatár",
emergencias/frases en húngaro) — parecía un problema de sincronización
entre las dos tarjetas, pero no lo era: las dos coincidían entre sí, el
país elegido de verdad era Hungría, no Catar. Causa real encontrada: el
picker deja escribir un país de la lista O una ciudad libre, pero pulsar
Enter/Intro del teclado **siempre** disparaba la búsqueda libre de ciudad
(`/weather?city=`), nunca el país exacto ya visible en la lista — con
"Catar" como texto, OpenWeatherMap geocodificó por parecido a "Csatár", un
pueblo real húngaro.
Arreglo: si el texto escrito coincide EXACTO (sin acentos/mayúsculas) con
uno de los 187 países de la lista, ese país gana siempre — al pulsar Enter
y también se quita el botón "Buscar como ciudad" de la lista en ese caso
(para no dejar a mano una alternativa más arriesgada). Buscar una ciudad de
verdad (ej. "Los Angeles") sigue igual. Sin cambios en el Worker ni en
costes. `?v=`: `app.js` a 135. Commit `2547395`, ya en `main`.
**Pendiente: que Paco pruebe otra vez escribir "Catar" y pulsar Enter, y
confirme que ahora sí sale Catar (huso +3h/+4h, tiempo del Golfo) y no
Hungría.**

---

## Sesión 21 sept 2026 — Modelo de negocio: Premium puro, coins fuera, agujero cerrado

Sesión dedicada solo a coins/pagos (la de WhatsApp sigue aparte, en pausa hasta el alta de
autónomo y la verificación de Meta). Todo lo de "coste" de abajo son **ESTIMACIONES mías a
partir del código, no medidas**: el Worker no lee el uso de tokens de Claude ni registra
coste por usuario, así que hoy no hay dato real. Sustituir por lo medido en cuanto exista.

### Decisiones de Paco
- **Premium puro por periodos; se eliminan los coins.** Solo hay un usuario real (Paco) → sin migración de coins.
- **Plan gratuito: 1 guía + 1 alerta de vuelo + 2 ediciones** (antes 3 rutas y 3 alertas).
- **Precios: SIN cerrar.** Paco quiere que sea rentable o no le interesa. Ver análisis abajo.
- **Foco a explorar:** road trips + guía suelta + el "viajero constante" (perfil de Paco), sin olvidar a los ocasionales.
- **Audiencia de Borrado del Mapa: casi nula** (solo un perfil personal, nada publicado de la marca).
- **Alta de autónomo: NO todavía.** Primero validar con testers; en modo prueba de Stripe no hace falta.

### Lo que se encontró (verificado en código)
- Contradicción de la doc resuelta: el Worker **lee** coins/rutas gratis de Firestore, pero **no hace cumplir nada**; el descuento lo hacía el cliente después de guardar. No había ningún gate real (ni chat 20/día, ni guías).
- **Agujero de seguridad:** `firestore.rules` dejaba al dueño escribir cualquier campo de su documento → cualquiera podía darse `premium_until`/`coins_saldo` o resetear sus guías gratis desde la consola.
- El prompt de Salma sigue mencionando coins ([salma-worker.js:2724](worker/salma-worker.js:2724)); `flight-watches` del Worker descuenta coins con el token del usuario (a quitar en el paso 2).

### Análisis de rentabilidad (estimado — recalcular con datos reales)
- Coste unitario supuesto: guía ~1,0 € (Claude ~0,4 + Google ~0,6, sube ~0,33 €/día), edición ~0,35 €, mensaje de chat ~0,045 € **sin prompt caching** (~0,015 con él; hoy hay 0 usos de `cache_control`).
- Precios propuestos y NO decididos: Viaje 14,99 / Trimestral 29,99 / Anual 79,99 € (IVA incluido). **El anual queda 60-100% por encima del mercado** (Wanderlog Pro ~40-50 $/año, Layla ~49 $, TripIt Pro 49 $, Roadtrippers ~50 $, REVER ~40 $, calimoto 40-80 $ o ~13 $/semana, Kurviger 15-30 €, park4night ~12 $).
- Del precio, con IVA 21% + Stripe, llega ~53% en uso típico; ~10% si el usuario usa todo lo incluido.
- **El plan gratuito puede comerse el beneficio** (cada gratuito ~0,6-1,5 €): con guía gratis completa hacen falta ≥~14% de conversión; con guía de 1 día ~7%.
- Con suscripciones puras y poco volumen **no sale a cuenta**: con cuota de autónomo (80 €/mes 1er año con tarifa plana; ~206 €/mes después) + IRPF, cubrir costes exige ~1.000-2.500 registrados/año al 10% de conversión; 1.000 €/mes limpios ≈ 16.000 registrados al 10% (o ~250-320 suscriptores fieles del plan Pro).
- Ideas a validar, no implementadas: **guía suelta por longitud** (1-3 días 6,99 / 4-7 días 11,99 / 8-14 días 19,99 €); **plan "Viajero Pro"** (~14,99 €/mes o 129,99 €/año, 2 guías/mes, ~300 mensajes; requiere Stripe Billing con renovación automática, hoy el cobro es pago único); pack de guías extra. **Afiliación descartada como pilar** (Paco: difícil de conseguir y que el cliente termine reservando).
- **Requisito para cualquier plan con chat:** prompt caching (cambio de llamada de pago → necesita OK explícito, §8).

### Plan de 4 pasos (uno por uno, con prueba de Paco entre cada uno)
1. **Cerrar el agujero — HECHO 21 sept 2026, CONFIRMADO EN PANTALLA.** `firestore.rules`: `premium_until`, `isPremium`, `coins_saldo`, `rutas_gratis_usadas` ya no se pueden escribir desde el cliente (create sin esos campos; update comparando `diff().affectedKeys()`); solo los escribe el Worker con su cuenta de servicio. `app.js?v=137`: el alta ya no escribe esos campos y se quitó el contador cliente de guías gratis/coins (commit `755099a9`, tag de salvaguarda `v-pre-cierre-reglas`; marcha atrás = `git revert` + `firebase deploy --only firestore:rules --project borradodelmapa-85257`). Reglas publicadas con `firebase deploy` desde el portátil de Paco. Pruebas: `update({coins_saldo:999})` → `permission-denied` ✓; `update({mapsCount:0})` → OK ✓; compra de prueba en Stripe acredita `premium_until` ✓ (+1 mes exacto tras el fix del webhook, ver abajo). **Efecto conocido:** hasta el paso 3 no se cuentan guías gratis; `flight-watches` del Worker intentará descontar 1 coin con el token del usuario y fallará en silencio (irrelevante sin coins).
2. **Quitar los coins — DESPLEGADO 21 sept 2026, SIN CONFIRMAR EN PANTALLA.** Commit `fda89f14` (tag de salvaguarda `v-pre-paso2-coins`), `app.js?v=138`, `flight-watches.js?v=3`, **Worker Version ID `5b090b7a-caad-461b-9784-0ee035d8245e`** (confirmado contra `/version`, 18 secretos intactos). Perfil: "TU PLAN Premium/Gratis" y fila "Mi plan" (abren el modal Premium; los precios del modal NO se tocaron). Prompt: el bloque de coins se sustituyó por una línea `[PLANES: ...]` que prohíbe hablar de coins/Premium/precios/límites; 3 frases prohibitorias limpiadas; `buildMessages()` ya no recibe `coinsSaldo`/`rutasGratisUsadas`. El prompt dinámico de Firestore (`config/salma-prompt`) es inalcanzable (se pide sin auth y las reglas exigen sesión) → siempre gana el prompt del código, no hay coins escondidos ahí. `verifyAuthAndGetUser` ahora devuelve `premium_until`/`premium_active` (el booleano `isPremium` es legacy y no sirve). `POST /flight-watches`: gratis `FW_FREE_LIMIT`=3 → 402 `premium_required` (el frontend avisa y abre el modal); Premium con tope duro `FW_PREMIUM_LIMIT`=10 → 409 `limit_reached` (cada vigilancia = 1 búsqueda Duffel diaria en el cron). **Aviso §8:** baja ~250 tokens de entrada por mensaje; el tope de 10 acota Duffel. **Sin tocar (a propósito):** los nombres internos CSS/ID `coins-*` del modal, y el comentario obsoleto de `salma.js:1389` (la otra sesión edita `salma.js`). **Pendiente de probar:** la puerta de "4ª alerta sin Premium" necesita una cuenta gratuita (Paco está en Premium hasta 2028). Los gates de guías/chat siguen SIN existir hasta el paso 3.
3. **Gates + contadores server-side + medición de coste — DESPLEGADO 21 sept 2026, SIN PROBAR EN PANTALLA.** Commit `e18c4dce` (tag `v-pre-paso3-gates`), `app.js?v=139`, `flight-watches.js?v=4`, **Worker Version ID `4a204319-3077-47f8-b460-1a35e7b8d92a`** (confirmado contra `/version`, 18 secretos intactos). **Topes (`PLAN_LIMITS` en `salma-worker.js`):** gratis = 1 guía y 2 cambios EN TOTAL (de por vida) + 20 mensajes/día; Premium = 4 guías/mes, 8 cambios/mes, 100 mensajes/día (**PROVISIONALES**, elegidos por Paco el 21 sept; se ajustan en el paso 4 con costes reales); alertas de vuelo: gratis 1 (`FW_FREE_LIMIT`, antes 3), Premium hasta 10. Qué cuenta como qué (calculado en `POST /` ANTES de cualquier llamada de pago): `guide` = "Crear ruta con mapa" (Tiempo 2, `guidedMapStage` sin `mergeIntoRoute`); `edit` = "Añadir a la guía" (`mergeIntoRoute`) o edición de la ruta abierta (`_editingRoute`); `chat` = todo lo demás (cuenta 1 mensaje del día). Una guía/cambio solo se CONSUME si sale bien (tras `convertProseToRouteJson` válido, o si el `done` final trae ruta); un fallo no gasta cupo pero sí se miden sus tokens. Si se pasa, el Worker responde por SSE con un aviso claro y `limit_reached` (el frontend no lo trata aparte: solo enseña el texto). **Contadores en KV** (`SALMA_KB`): `usage:{uid}:{YYYY-MM}` (mensajes, guías, cambios, tokens Claude in/out, `claude_usd` estimado a 3/15 USD por Mtok, `days{}` mensajes por día) y `usage:{uid}:total` (guías y cambios de por vida, sin TTL). **Fail-open:** si KV falla, nadie queda bloqueado. Lo ves con `GET /usage` (auth) y en el modal "Mi plan" (`#plan-usage`). **Límites conocidos de la medición:** solo cuenta Claude Sonnet del chat y de la conversión a ruta (+ el rescate 2); NO mide Google ni Duffel ni OpenAI — el desglose de Google se saca de la factura por SKU dividida entre las guías contadas aquí. **Posibles resquicios (aceptados por ahora):** una ruta generada por un camino no previsto (p. ej. foto + "hazme una guía" sin pasar por el botón) se cuenta como guía pero no se puede frenar de antemano; varias cuentas de Google nuevas saltan el tope gratuito. **Aviso §8:** sin llamadas de pago nuevas; ~4 operaciones KV por mensaje; reduce gasto. **Probar (Paco):** (1) consola: `firebase.auth().currentUser.getIdToken().then(t=>fetch(SALMA_API+'/usage',{headers:{Authorization:'Bearer '+t}}).then(r=>r.json()).then(console.log))`; (2) generar una guía como Premium y mirar que suben `guides` y `claude_usd` (**primer coste real de Claude por guía**); (3) para ver los límites gratuitos sin segunda cuenta: Firebase Console → `users/{uid}` → poner `premium_until` en una fecha pasada (y recomprar después para restaurar). **Coordinación:** este cambio toca `POST /` junto a la zona de la sesión "guías" (`_looksLikeEdit`/RESCATE 1) — esa sesión debe `git fetch` antes de su commit.
4. **Planes/precios de prueba** cuando haya datos (tabla `PREMIUM_PLANS` en el Worker — ya NO hay precios escritos en `app.js`; `PREMIUM_PLANS_FRONT` se eliminó); después prompt caching (OK aparte).
   **Modal "Hazte Premium" rediseñado — 21 sept 2026 (tarde), pendiente de confirmar en pantalla.** A petición de Paco (captura del modal viejo: la etiqueta "MEJOR PRECIO" tapaba el "12" de "12 meses"). Nuevo `premium-modal.js?v=1` (solo interfaz, sin Firebase; `PremiumModal.open({premiumUntilMs, loadUsage, onPay, onClose})`), estilos `pm-*` al final de `styles.css?v=119`, `app.js?v=140` (`openCoinsModal` ahora solo hace la lógica: lee `/usage` y crea la sesión de pago, **misma llamada a `/create-payment` de siempre**). Diseño: hoja inferior en móvil / centrado en escritorio, estilo "billete" (separadores discontinuos), estado del plan con **barras de uso** (rojas al llegar al tope), **4 planes en cuadrícula 2×2 con ahorro por mes** (−40/−50/−58% sobre el mes suelto), tabla "Qué incluye" Gratis vs Premium debajo, y **botón PAGAR fijo (sticky) abajo** para poder comprar sin recorrer toda la lista. **Precios y topes ya NO están en el frontend:** el Worker los devuelve en `GET /usage` (`prices` = `PREMIUM_PLANS`, `plans` = topes gratis y Premium + alertas); los precios del modal salen de lo que Stripe cobra de verdad. Si `/usage` falla, degrada: precios de respaldo, sin barras ni tabla, el pago sigue funcionando. Verificado en el navegador de la app con datos simulados (estados Premium, gratuito y sin `/usage`; elegir plan, pagar con error, Esc) y enganchado a `app.js` real (abre, error de sesión al pagar sin login, toggle, sin errores de consola); **NO se ha visto con tu sesión ni con el Worker nuevo**. Los estilos viejos `.coins-*` de `styles.css` quedan sin uso (limpieza pendiente, sin prisa).
   **DESPLEGADO:** commit `eaab1ed0` (tag `v-pre-modal-premium`), **Worker Version ID `7119da2c-5685-4512-a84d-f9f1c84139ec`** (confirmado contra `/version`, `/usage` sin sesión = 401, 18 secretos intactos). **Aviso §8:** sin llamadas de pago nuevas.
   **Perfil reordenado — 21 sept 2026 (tarde), `app.js?v=141` + `styles.css?v=120`.** A petición de Paco (que confirmó en pantalla el paso 2: "Tu plan Premium" y la fila "Mi plan"): **Mi plan es la 1ª fila** de la tarjeta "Tu viaje", **Lo que Salma sabe de ti la 2ª**, y **Mis Notas y Galería quedan ocultas de momento** (reactivar = quitar `hidden` en `renderProfile`; las Notas siguen accesibles desde el chip "Mis notas" del chat). **Bug encontrado de paso:** `.prof-row { display:flex }` ganaba al atributo `hidden`, así que la Galería "oculta" (y "¿Qué puedo hacer?") NUNCA se habían ocultado; ahora solo `#prof-notas[hidden]`/`#prof-galeria[hidden]` tienen su regla CSS. **"¿Qué puedo hacer?" NO se tocó y sigue visible** (Paco no lo pidió) — si quiere ocultarlo de verdad, hay que añadirle su regla `#prof-help[hidden]{display:none}`. Verificado en el navegador de la app con un usuario simulado (orden, visibilidad, separadores sin duplicar, "Mi plan" abre el modal); sin coste.
   **Tope diario por IP en endpoints de pago SIN sesión — DESPLEGADO 21 sept 2026, commit `66666d43` (tag `v-pre-ip-caps`), Worker Version ID `f357f56e-d31f-40f6-994b-301e6540f21d`** (confirmado contra `/version`, 18 secretos intactos; comprobado en producción con una llamada a `/pin` sin imagen: 400, contador `iprate:pin:{ip}:{día}` = 1 en KV). **Por qué:** los límites por usuario del paso 3 solo cubren el chat, las guías, los cambios y las alertas de vuelo; estos endpoints gastan dinero y NO piden login (comprobado leyendo `/tts`, `/narrate`, `/nearby-pois` y `/pin`; el resto, por análisis automático aproximado): cualquiera con la URL del Worker podía gastar, y un tester con el narrador/voz no quedaba frenado. **Qué hace:** un guardián central al inicio de `fetch()` (`IP_DAILY_CAPS` + `ipDailyGate`, busca por nombre) cuenta llamadas por IP y día UTC en KV (`iprate:{endpoint}:{ip}:{día}`, TTL 30 h) y devuelve `429 rate_limited` al pasarse; FAIL-OPEN si KV falla. **Topes provisionales por IP y día:** `/tts` 80, `/narrate` 80, `/pin` 25, `/nearby-pois` 300, `/translate` 250, `/directions` 300, `/place-details` 400, `/staticmap` 150, `/flight-places` 300, `/photo` 1000 (se ajustan con uso real). **Límites conocidos:** varias personas tras la misma IP (wifi compartida, CGNAT móvil) comparten el tope; si se pasan, cada función falla a su manera (la voz debería caer a la voz del navegador; las fotos salen rotas hasta mañana). **Sigue pendiente lo bueno:** exigir sesión en esos endpoints y contarlos POR USUARIO (obliga a que el frontend mande el token en muchos sitios). No mide ni limita: Google (verificar paradas), OpenAI/Perfil IA, Duffel del cron. **Aviso §8:** sin llamadas de pago nuevas; reduce exposición; 1 lectura + 1 escritura de KV por llamada a esos endpoints. **Tropiezo de despliegue (por si se repite):** un `wrangler deploy` lanzado en paralelo con otra herramienta falló con `Could not read file: wrangler.toml` (ruta duplicada) y un `Assertion failed ... UV_HANDLE_CLOSING` de Node en Windows — NO desplegó nada; se repitió solo, desde `worker/` y con `-c ./wrangler.toml`. Comprueba SIEMPRE `/version` tras desplegar.
Antes de invitar testers: contarles cómo pagar en modo prueba (tarjeta `4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC) y pasarles una pregunta de disposición a pagar — en modo prueba nadie paga de verdad, así que Stripe valida el flujo, no el precio.

### Incidente resuelto: el webhook de Stripe no llegaba (descubierto probando el paso 1)
Tras el cambio de dominio del 16 sept (`paco-defoto` → `borradodelmapa-api`), **los dos destinos de webhook del entorno de pruebas de Stripe seguían apuntando al dominio muerto**: Stripe cobraba y el Worker nunca se enteraba (0 llamadas a `/stripe-webhook` en `wrangler tail`). Solo la compra del 14 sept (anterior al cambio) se acreditó. Arreglo: editar en Stripe el destino **`STRIPE_WEBHOOK_SECRET`** (carga **"Resumen"**, la que necesita el Worker) a `https://salma-api.borradodelmapa-api.workers.dev/stripe-webhook` — la clave de firma no cambió. El otro destino, `upbeat-finesse-thin` (carga "Breve"), **no sirve** al Worker (no trae `data.object`) y sigue apuntando al dominio viejo; se puede borrar. Al editarlo, Stripe reenvió avisos atrasados (5 llamadas de golpe); una compra limpia posterior sumó +1 mes exacto. **Las compras atrasadas no se acreditaron todas** (salió +12 meses por el anual, no el total esperado) — sin explicar, irrelevante en modo prueba.
**Lecciones:** (a) el panel de Stripe está en **producción por defecto**; el entorno de pruebas se ve por la franja azul "Entorno de prueba" arriba y se abre con `https://dashboard.stripe.com/test/webhooks`; (b) cualquier cambio de dominio del Worker obliga a revisar la URL del webhook en Stripe (y en Twilio para WhatsApp); (c) `wrangler tail` mientras el usuario prueba fue lo que localizó la causa en minutos.

---

## Sesión 22 sept 2026 — Rediseño SEO destinos: cabecera/menú/reloj/mapa

Paco: las 1.793 páginas de `destinos/` estaban menos elaboradas de lo que pensaba (sin
mapa, cabecera y menú desfasados de la app real desde el rediseño de navegación). Se
habló el enfoque antes de tocar código (ver protocolo §2): opción B descartada del todo
(generar guías reales verificadas con Claude+Google costaría ~900-1.800€ para las 1.793 —
inasumible), opción A adelante (mismo aspecto visual de una guía real, pero con el texto
que YA existe en el KV nivel 2 — gratis). Empezado con España como país de prueba (10
destinos + la página de país), **todo local, NADA commiteado ni subido todavía** — a la
espera de que Paco lo revise y de decidir cuándo se hace el rollout a los 193 países.

**Cambios, todos en `scripts/build-destinos.js` (generador) + `destinos.css`:**
1. **Cabecera vieja fuera.** La app real ya no tiene `<header>` (se quitó en el rediseño
   de navegación — `app.js:updateHeader()` es hoy un comentario vacío). Se quitó también
   de las páginas de destino, por coherencia.
2. **Logo + eslogan** — mismo wordmark que el index (`app.js:605`, clases `.ce-top`/
   `.ce-brand`) + el eslogan "Sin mapa, con rumbo." (`app.js:590`, `.ce-hero`/
   `.ce-slogan`), como enlace a `/`. Constante compartida `LOGO_HTML`.
3. **Reloj** — hora real del país del destino (`country-utils.js`, `countryTimeString()`,
   gratis, sin API). **Sin tiempo/clima** — a petición explícita de Paco: menos trabajo, y
   cuando el visitante entre en la app real ya lo tiene allí. Ojo casing: `countryTimeString`
   espera el código ISO en MAYÚSCULAS (`CODE_TO_NAME`/`COUNTRY_TZ`), el KV lo da en
   minúsculas — hay que subirlo con `.toUpperCase()`.
4. **Mapa** — Leaflet + OpenStreetMap (gratis, sin key) centrado en el destino, con un
   marker. **Sin interacción propia** (`scrollWheelZoom:false`, `dragging:false`, etc.) —
   la primera versión atrapaba el scroll de la página al pasar el ratón/dedo por encima;
   tocarlo abre Google Maps en pestaña nueva. Requiere coordenadas nuevas (ver script 5).
5. **`scripts/geocode-destinos.js` (nuevo)** — geocodifica cada destino UNA vez con
   Nominatim (OpenStreetMap, gratis, sin API key; `User-Agent` obligatorio por su política
   de uso, 1 petición/seg). Cachea en `worker/kv/destinos-coords.json` (git-tracked, se
   commitea); solo pide lo que falte, así que re-ejecutarlo no repite trabajo. Con España:
   7/10 destinos geocodificados a la primera — los 3 que fallaron son nombres de zona
   compuestos ("Asturias y Picos de Europa", "Cádiz y Costa de la Luz", "Camino de
   Santiago") que Nominatim no resuelve tal cual; pendiente de mejorar la consulta
   (probar solo la primera parte del nombre) antes del rollout completo.
6. **Menú de abajo real** — mismas clases CSS que la app (`app-bottom-bar`/`bottom-tab`/
   `bottom-tab-fab`, ver `styles.css`), como enlaces `<a>` estáticos (sin JS de estado —
   no hay sesión/`salma` cargados en una página SEO): Ayuda→`/?help=1`, Salma/FAB
   "+"→`/?go=chat`, Mis Viajes→`/?go=rutas`, Perfil→`/?go=profile`. Constante compartida
   `BOTTOM_NAV` — **ver protocolo §9, la regla nueva de esta sesión**.
7. **Chat inline del destino, simplificado a un gancho, no un chat de verdad.** Antes
   tenía chips + cuadro de texto que llamaban a `POST /` del Worker SIN token — pero ese
   endpoint YA exige login (`auth_required`, confirmado leyendo `salma-worker.js`), así
   que en la práctica solo mostraban "Inicia sesión para hablar conmigo" disfrazado de
   respuesta de Salma. Quitados los chips y el input; queda solo la burbuja de saludo +
   un botón "Seguir hablando con Salma →" que lleva a `/?go=chat` (login real de la app).
   Mismo criterio en los 3 CTAs sutiles del acordeón (vuelos/hoteles/plan a medida), que
   dependían del mismo input. `destinos/destinos.js` (`initSubtleCTAs`) actualizado para
   convivir con las páginas viejas (con input) y las nuevas (enlace directo) a la vez,
   mientras dure el rollout gradual.
8. **`DESTINOS_CSS_V`** — versión `?v=` para `destinos.css` (mismo criterio que ya usa el
   resto de la app) para que un visitante real no se quede con CSS viejo en caché tras un
   cambio — súbela cada vez que toques `destinos.css`.
9. **Seguro añadido en el propio generador**: `node scripts/build-destinos.js --country X`
   ya NO reescribe `sitemap-destinos.xml` (antes lo dejaba con solo las URLs de ese país,
   borrando las otras ~1.780) — el sitemap completo solo se regenera en una pasada sin
   `--country`.

**Coste de todo esto: cero** — reloj (Intl), mapa (OpenStreetMap) y geocodificación
(Nominatim) son gratis, sin ninguna API de pago de por medio (avisado y confirmado con
Paco antes de tocar código, protocolo §8).

**Regla nueva de protocolo, a petición explícita de Paco** ("no quiero ir detrás mirando
si se hace o no se hace"): ver **§9 del protocolo de trabajo, arriba del todo de este
archivo** — cualquier cambio al menú de abajo o a la cabecera/eslogan de la app se replica
en `scripts/build-destinos.js` en el mismo cambio, sin excepción.

**Probado en el navegador local** (`.claude/serve.js`, `node scripts/build-destinos.js
--country es`), con capturas de Granada y de la página de España — confirmado por Paco en
dos rondas de ajustes (logo, eslogan, quitar chat interactivo, quitar hueco de scroll).
**NO probado en producción ni con Paco en su propio navegador.**

**Pendiente antes del rollout completo (193 países, 1.793 destinos):**
1. Mejorar `geocode-destinos.js` para los nombres de zona compuestos (fallback a la
   primera parte del nombre, o al centro de la región).
2. ~~Aplicar el mismo tratamiento a `buildIndexHTML`~~ → **HECHO 22 sept 2026**, ver
   más abajo.
3. Geocodificar y regenerar país a país (o de golpe, a decidir con Paco), revisando
   alguno más antes de ir a las 1.793 de una vez.
4. Decidir si versionar también `/styles.css` en estas páginas (hoy solo `destinos.css`
   lleva `?v=` — `styles.css` es el mismo de toda la app y ya se versiona en `index.html`,
   pero aquí seguía sin versión antes de esta sesión y sigue así, sin tocar).

**Continuación 22 sept 2026 (mismo día, sesión de "cosas de pocos tokens"):**

- **Portada `/destinos/` con el mismo diseño — HECHO.** `buildIndexHTML` ya llevaba
  logo+eslogan (sin reloj — no hay un destino concreto al que darle hora), el chat
  inline simplificado a saludo + CTA, y el menú de abajo real, igual que el resto.
  Añadida una opción nueva al generador, **`--index-only`**, para poder regenerar SOLO
  `destinos/index.html` sin tocar las 1.793 páginas de destino/país (recorre todos los
  KV para tener el recuento correcto de países/destinos, pero no reescribe sus HTML).
  **Ojo, encontrado y corregido de paso**: la primera versión de `--index-only`
  reescribía también `sitemap-destinos.xml` completo como efecto colateral (el mismo
  problema que ya se blindó para `--country`, no se había pensado para este caso nuevo)
  — se probó, se vio el diff enorme (+8.971 líneas) antes de comitear nada, se revirtió
  con `git checkout` y se corrigió el generador para que `--index-only` tampoco toque
  el sitemap. Probado en el navegador local, sin errores de consola.
  **Dos hallazgos de propina, SIN TOCAR, solo para que quede anotado:**
  1. El generador solo encontró **163 países** con JSON en `worker/kv/output-nivel2/`
     — **CONFIRMADO Y LISTADOS los 30 que faltan** (ver entrada nueva más abajo,
     "los 30 países que faltan"), no los ~193 que dice el resto de `CLAUDE.md`.
  2. ~~El `sitemap-destinos.xml` parecía desactualizado/parcial~~ → **CORREGIDO.** Era
     de verdad: tenía muchas menos URLs de las 1.794 páginas reales que ya existen en
     `destinos/` (comprobado: las 1.793 páginas + índice ya estaban generadas en disco
     de una pasada completa anterior a esta sesión — no faltaba ningún archivo, solo el
     sitemap no las listaba). Arreglado con `node scripts/build-destinos.js
     --sitemap-only` (opción nueva en el generador, mismo patrón que `--index-only`:
     recorre todo para tener el recuento correcto, pero solo reescribe
     `sitemap-destinos.xml`, ningún HTML). Verificado: 1.794 URLs, XML bien formado.
- **Login con Google, paso 3 (redirect de respaldo) — HECHO.** Cuando el navegador
  bloquea el popup (`auth/popup-blocked`, frecuente en Safari/móvil), `doGoogleLogin()`
  ahora reintenta con `auth.signInWithRedirect(googleProvider)`. La lógica de "qué hacer
  tras el login" (crear el doc de Firestore si es la primera vez + ofrecer huella) se
  sacó a una función compartida, `_afterGoogleAuth(user)`, para no duplicarla entre el
  camino de popup y el de redirect — el enrutado tras login (a qué pantalla ir) ya lo
  cubre `auth.onAuthStateChanged`, genérico para cualquier método de login, así que no
  hacía falta tocarlo. Al volver de un redirect, `auth.getRedirectResult()` (nuevo,
  junto a `onAuthStateChanged`) recoge el resultado una vez; en una carga normal de la
  página (sin redirect pendiente) resuelve sin hacer nada, verificado sin errores en el
  navegador. **No probado con una cuenta de Google real** (necesitaría un navegador de
  verdad bloqueando el popup para disparar el camino nuevo) — la parte de popup normal
  sigue exactamente igual que antes.
  `?v=` subido: `app.js` a 153 en `index.html`.

**ACTUALIZACIÓN — comiteado (`f170f86f`, `f93ef988`, `2bff2eaa`), subido a `main`
(`git push`, sin conflicto, `origin/main` no se había movido) y Worker desplegado
(ver Version ID en la entrada de "2 funciones dead code" de Deuda técnica) — todo a
petición explícita de Paco ("SI Y MAIN" / "SUBELO DESPLIEGA"). Lo único del Worker que
cambiaba era quitar las 2 funciones muertas — nada nuevo que probar en el chat.**

**Sesión 22 sept 2026 (continuación) — los 30 países que faltan en `output-nivel2`,
identificados.** Comparando `worker/kv/countries.json` (193, la lista completa) contra
los JSON reales de contenido en `worker/kv/output-nivel2/` (163) — solo mirar archivos
locales, cero coste, cero llamadas. **Faltan 30, y no son menores** — varios son
mercados turísticos grandes: **Italia, Japón, Marruecos, México, Noruega, Nueva
Zelanda, Países Bajos, Perú, Portugal, Suiza, India**. Lista completa (código ISO2 +
nombre): in India, it Italia, jp Japón, ma Marruecos, mu Mauricio, mx México,
mn Mongolia, me Montenegro, mz Mozambique, na Namibia, nr Nauru, ni Nicaragua,
ne Níger, ng Nigeria, no Noruega, nz Nueva Zelanda, om Omán, nl Países Bajos,
pk Pakistán, ps Palestina, pa Panamá, pe Perú, pt Portugal, do República Dominicana,
sl Sierra Leona, sy Siria, ch Suiza, ua Ucrania, ug Uganda, ve Venezuela.
**Sin generar nada** — rellenar estos 30 significa el mismo coste ya descrito en el
plan del rollout (Claude Sonnet nivel 1-2 + Haiku nivel 2.5, ver tabla de "Scripts de
generación" más abajo en este archivo) — decisión de Paco, no se ha tocado.

---

## Sesión 22 sept 2026 (nueva) — 3 bugs del popup "Pregúntale a Salma" (edición de guía)

Paco mandó vídeo + brief técnico detallado (ya con archivo/línea identificados) de 3 fallos
en el popup de consulta sobre una guía abierta (`itin-query-overlay`, lógica en
`mapa-itinerario.js`/`salma.js`, backend `worker/salma-worker.js`). Implementados los 3,
**FUSIONADO A `main` (fast-forward, commit `a82b0ac`, sin conflicto — `origin/main` no se
había movido) Y DESPLEGADO** a petición explícita de Paco ("Si claro subelo"): GitHub
Action "Deploy Worker" run #39 disparada desde esta sesión (dispatch manual sobre `main`),
**Worker Version ID `9d4da82e-124d-414e-a564-5fed4992f763`** — leído directo del log del
job (`Current Version ID` en la salida de `wrangler deploy`), esta sesión no pudo
confirmarlo además contra `/version` porque el proxy de red del contenedor bloquea las
llamadas salientes a `salma-api.borradodelmapa-api.workers.dev` (mismo bloqueo ya
documentado muchas veces en este archivo). Frontend ya en GitHub Pages (`styles.css?v=132`).
**Nunca decir "arreglado" — pendiente de que Paco lo vea en pantalla**: repetir el caso del
vídeo (mensaje mencionando una parada tipo aeropuerto/estación dentro del popup de edición)
y confirmar que ya no salen botones de Uber/Bolt, que el botón "Añadir a la guía" se ve, y
que el popup tiene sitio de sobra.

1. **El Worker disparaba botones de Uber/Bolt en vez de responder, dentro del popup de
   edición.** Causa: `isHelpRequest()` (`worker/salma-worker.js:1550`) clasificaba por
   palabras sueltas sin mirar contexto — la categoría `transport` incluía `aeropuerto`,
   `estacion.?de?.?tren`, `\btren\b`, `train.?station` como sustantivos sueltos, así que
   cualquier mensaje dentro del popup que solo MENCIONARA una parada tipo "el aeropuerto"
   o "la estación de tren" (sin pedir trasladarse a ningún sitio) se clasificaba como
   petición de transporte. Con `helpCategory === 'transport'` y GPS disponible, el bloque
   de antes de llamar a Claude (línea ~9765) montaba y emitía botones de Google
   Maps/Uber/Bolt SIN comprobar si el popup estaba editando una guía activa.
   **Arreglo, 2 piezas:**
   - Regex `transport` reescrito para exigir intención real de traslado: se quitan
     `aeropuerto`/`airport`/`estacion.?de?.?tren`/`train.?station`/`\btren\b` como
     sustantivos sueltos; `taxi`/`uber`/`bolt`/`transfer`/`traslado` solo cuentan si van
     con un verbo de petición explícito (`necesito`/`quiero`/`busco`/`pedir`/`dame`/`dime`)
     o es la palabra `traslado` sola; se quedan igual que antes `ferry`, `estación de
     bus`, `puerto de`, `autobús de/desde/a`, `flixbus`, `renfe`, `AVE`, `high-speed
     train`, `cómo llegar` (no eran los que causaban el falso positivo).
   - Añadido `&& !editingActiveRoute` a la condición que dispara los botones de
     transporte (`worker/salma-worker.js`, línea del bloque "TRANSPORT: buscar destino +
     emitir botones ANTES de Claude") — aunque alguien SÍ pida un taxi de verdad estando
     en el popup de edición, ese atajo de botones queda desactivado ahí (el mensaje sigue
     entrando en el chat normal, con el fallback de texto de Brave Search si aplica, sin
     los botones de acción que rompían el layout).
   Probado con 11 casos en Node antes de aplicar (frases con aeropuerto/tren sueltos →
   ya no disparan; "necesito un taxi"/"quiero un uber"/"busco transfer"/"ferry a la
   isla"/"traslado al hotel" → siguen disparando) — todos se comportan como se espera.
2. **Botón "Añadir a la guía" no se veía.** No era un bug de lógica aparte — el frontend
   ya manda `editing_active_route: true` bien (`salma.js:1446`) y el Worker ya sabía
   cerrar con ese botón cuando toca; estaba tapado por las tarjetas de Uber/Bolt del
   punto 1, compartiendo el mismo contenedor con scroll. Se resuelve solo al arreglar 1 y 3.
3. **Popup demasiado pequeño / sin espacio para el scroll.** `styles.css`:
   `.itin-query-overlay` `padding: 24px` → `12px`; `.itin-query-modal` `max-width: 420px`
   / `max-height: 72vh` → `720px` / `88vh`. El scroll de la respuesta
   (`.itin-query-answer`, ya con `overflow-y:auto`) no se tocó — el problema era espacio
   insuficiente dentro del propio modal (aviso fijo + botones), no el scroll en sí.
   `?v=` de `styles.css` subido a 132 en `index.html`.
**Aviso de coste (protocolo §8):** el fix 1 BAJA el gasto — evita llamadas a Google Places
Text Search (paso 4 del bloque de transporte, geocodifica el "destino" detectado) que se
disparaban por error dentro del popup de edición sin que el usuario pidiera trasladarse a
ningún sitio. Sin llamadas nuevas a ninguna API.
**Ya desplegado (Version ID arriba). Pendiente solo que Paco repita el caso del vídeo —
mensaje mencionando una parada tipo aeropuerto/estación dentro del popup de edición — y
confirme que ya no salen botones de Uber/Bolt, que el botón "Añadir a la guía" se ve, y
que el popup tiene sitio de sobra.**

**Cuarto bug, encontrado al probar el anterior, DISTINTO y SIN RELACIÓN — 22 sept 2026,
solo frontend, sin desplegar Worker.** Paco probó el fix de arriba (popup sobre "Pirineos
de oeste a este") y salió otro error: la respuesta de Salma fue *"Inicia sesión para
hablar conmigo. ¡Es gratis!"* estando logueado de verdad. Causa, en `salma.js`
(`_stream()`): el ID token de Firebase se pedía con `await user.getIdToken()` dentro de un
`try/catch` que, si fallaba (típicamente un corte de red justo en ese instante — la
captura de Paco mostraba `0 K/s` de datos en ese momento, mismo patrón de intermitencia de
red ya documentado muchas veces en este archivo con este dispositivo), se tragaba el error
en silencio y la petición se mandaba igual, **sin cabecera `Authorization`**. El Worker
(`POST /`) trata "sin cabecera" exactamente igual que "no ha iniciado sesión nunca" y
responde 401 con ese texto — correcto para quien de verdad no tiene cuenta, engañoso para
alguien que SÍ la tiene y solo tuvo un corte de red al pedir el token.
**Arreglo**: si `firebase.auth().currentUser` existe (hay sesión) pero `getIdToken()`
falla, ya no se manda la petición sin autenticar — se lanza la excepción y la recoge el
`catch` que ya tiene `salma.send()` más arriba, con el aviso que ya usaba para cualquier
otro corte de red ("Uf, sin conexión o me he aturrullado. Vuelve a intentarlo."). Si de
verdad no hay sesión (`currentUser` null), se sigue mandando sin cabecera a propósito — ahí
el 401 del Worker es el comportamiento correcto. `salma.js?v=109` en `index.html`. Solo
frontend — no toca el Worker, no hace falta redeploy, sin coste.
**Sin confirmar la causa exacta con el panel 🐛** (no se pidió esta vez, la captura ya traía
bastante indicio: `0 K/s` de red en el momento del error) — si se repite el mismo mensaje
CON buena señal de datos, sería un bug distinto (sesión de verdad caducada/revocada) y
habría que mirarlo aparte con el log del panel 🐛.
**Pendiente: que Paco repita el mismo caso (o cualquier mensaje en el popup) y confirme que
ya no sale "Inicia sesión" estando logueado — si vuelve a pasar con buena cobertura de
datos, decirlo para investigar la causa real en vez de asumir que es de red.**

---

## Sesión 23 sept 2026 — Eventos locales (Serper) arreglados: cable roto desde abril

`SERPER_API_KEY` puesta por Paco (ver entrada de secrets más abajo). Al ir a probarla se
encontró que la búsqueda de eventos llevaba **desde abril sin poder dispararse nunca**:
el Worker solo la llama si recibe `travel_dates` en la petición
([salma-worker.js:9413](worker/salma-worker.js:9413) antes de este cambio), pero ningún
sitio del frontend rellenaba ese campo — las fechas del flujo guiado ("Tengo fechas") se
guardan en `guided_route.fechas`, un campo distinto que nunca se traducía a `travel_dates`.
No era un bug de hoy, era un cable que nunca se llegó a conectar.

**Arreglo, commit `3986e4e6`, solo Worker, DESPLEGADO (Version ID
`00f7551d-a170-4474-b0fb-79e7f44c45db`, confirmado contra `/version`), sin probar en
pantalla:**
1. Función nueva `extractMonthMention(message)` ([salma-worker.js:1629](worker/salma-worker.js:1629))
   — detecta mes suelto ("en octubre"), o relativo ("el mes que viene", "este mes"), sin
   necesitar fechas exactas. Se suma a `extractDatesFromMessage` (ya existía, detecta
   fechas exactas tipo "del 10 al 15 de abril", pero tampoco se llamaba desde ningún sitio
   — dead code desde siempre).
2. El bloque de búsqueda de eventos ahora prueba, en orden: `travel_dates` del frontend →
   fecha exacta en el propio mensaje → mes suelto en el propio mensaje. Y solo dispara si
   además el mensaje suena a que se habla de un viaje/ruta a un sitio
   (`isRouteRequest`/`isDaysDestination`/`guidedRoute`) — a petición explícita de Paco,
   para que no salte en cualquier pregunta suelta ("no quiero saturar").
Con esto, "Sevilla en noviembre" o "voy a Lisboa el mes que viene" ya activan la búsqueda
de eventos igual que una fecha exacta — sin tocar el frontend, sin `?v=` nuevo.
**Aviso de coste (protocolo §8):** sube el número de llamadas a Serper (antes nunca se
llamaba; ahora se llama cuando el mensaje habla de una ruta/viaje con fecha o mes) — dentro
del crédito gratis de Serper.dev con el volumen actual, avisado y confirmado con Paco antes
de implementar.
**Pendiente: que Paco pruebe "3 días en Sevilla en noviembre" (o similar) y confirme que
la respuesta menciona algún evento/fiesta real de esas fechas.**

**Primera prueba de Paco (23 sept): "voy a pasar unos días este mes en Bilbao" — dio
detalles bien, pero SIN eventos.** Causa: el filtro de "¿habla de un viaje?"
(`isRouteRequest`/`isDaysDestination`) es un chequeo técnico pensado para detectar cuándo
generar una ruta completa ("3 días en Bilbao"), no para frases naturales en primera
persona ("voy a pasar unos días..." — "unos días" no cuadra con el patrón "un/dos/tres
días"). El destino (Bilbao) y el mes ("este mes") sí se detectaban bien — solo la
condición de "suena a viaje" se quedaba corta.
**Arreglo, commit `cd05f041`, DESPLEGADO (Version ID `c570cb05-af8c-494f-9455-ace9515a7557`,
confirmado contra `/version`), sin probar en pantalla:** nuevo `_tripIntentRe`
([salma-worker.js](worker/salma-worker.js)) que reconoce "voy a", "me voy a", "vamos a",
"nos vamos a", "iré/ire a", "viajo a", "de viaje a" — se suma a las condiciones de antes.
Probado con 6 frases en Node antes de desplegar: las 3 de intención de viaje ("voy a
pasar...", "me voy a Sevilla en marzo", "vamos a pasar el finde en Toledo en octubre")
disparan; las 3 que NO hablan de viajar ("hace frío en Bilbao en noviembre", "3 días en
Sevilla" —esta sola no necesitaba el regex nuevo, ya la cazaba `isRouteRequest`—, "bilbao
está en el norte de España") no disparan por este camino nuevo.
**Diagnosticado en vivo con `wrangler tail` mientras Paco probaba (23 sept) — DOS causas
reales encontradas, una arreglada y confirmada, la otra sigue abierta:**
1. **Destino `null` — ARREGLADO Y CONFIRMADO.** El regex de extracción de destino exigía
   Mayúscula+minúsculas ("Bilbao"); Paco escribe TODO EN MAYÚSCULAS ("BILBAO"), así que
   nunca coincidía (`[EVENTOS] destino extraido: null` en el log). Arreglo, commit
   `f0d02709`, DESPLEGADO (Version ID `ce272e70-2b82-4bd9-8fc6-e9c1b57eb74a`, confirmado
   contra `/version`): se reutiliza `anchorCountry.locality` (el sistema de "ancla de
   país" que ya resuelve el destino vía Google Find Place para otra cosa, sin depender de
   mayúsculas) antes que el regex — sin llamada nueva a ninguna API. **Confirmado en el
   log siguiente**: `[EVENTOS] destino extraido: Bilbao`.
2. **Serper devuelve 403 "Unauthorized" — SIGUE ROTO, no es cosa de nuestro código.**
   Con el destino ya bien resuelto, la llamada a Serper (`google.serper.dev/search`)
   responde 403 tanto con la clave puesta el 23 sept como con una segunda repuesta el
   mismo día. Probado también DIRECTO contra Serper (sin pasar por nuestro Worker) desde
   la terminal de Paco: mismo tipo de fallo. **Causa sin confirmar del todo** — puede ser
   la cuenta de Serper sin activar/verificar del todo, o un copiado incompleto de la
   clave las dos veces. **Incidente de seguridad de paso**: al hacer esa prueba directa,
   Paco pegó la clave de Serper EN TEXTO CLARO en esta conversación (sesión de Claude
   Code) — se le avisó al momento de ir a serper.dev y regenerarla/revocarla, dar por
   comprometida la que se vio aquí. **Pausado a petición explícita de Paco (23 sept):
   "paso, déjalo pendiente"** — no perseguir esto hasta que lo retome él. Al retomar:
   confirmar que regeneró la clave en serper.dev, ponerla de nuevo con `wrangler secret
   put SERPER_API_KEY -c wrangler.toml`, y repetir la prueba directa (comando con
   `ConvertTo-Json` en vez de comillas a mano, ver el propio hilo de esta sesión) ANTES
   de probar desde la app — así se aísla si el problema es la cuenta de Serper o algo de
   cómo llega el secret al Worker.
   **Logging temporal añadido para esta depuración** (`[EVENTOS] gate/destino
   extraido/query/Serper respondió...`, mismo commit `f0d02709`) — se puede quitar cuando
   esto se cierre, o dejarlo (es barato, solo texto en consola, no afecta a nada).

**Bug real distinto, encontrado de paso probando lo de arriba, 23 sept 2026 — foto
duplicada en el chat normal.** Paco pegó el texto de la respuesta ("una semana en Bilbao"):
"Guggenheim Museum Bilbao" salía dos veces seguidas con la misma foto — captura confirma
2 imágenes idénticas. Causa: Claude mencionó el Guggenheim en la intro Y en el párrafo de
detalle, y puso su foto en las dos — `_repairBrokenPhotoMarkdown()` (la función que
sustituye cada `![Nombre](...)` por la URL real de `buscar_foto`) no deduplicaba, así que
las dos menciones se resolvían a la misma URL y se veían las dos.
**Arreglo, commit `beea3e47`, DESPLEGADO (Version ID `b123ff2b-c381-4733-b7a4-ac261eb60671`,
confirmado contra `/version`), CONFIRMADO EN PANTALLA por Paco (dos capturas: al cargar
salen 3 fotos distintas, al terminar solo queda 1):** `_repairBrokenPhotoMarkdown` ahora
lleva un `Set` de URLs ya usadas en esa misma respuesta — la primera aparición de una foto
se queda, cualquier repetición exacta de la misma URL se quita. No toca ninguna API, es
solo post-procesado de texto. Probado en Node con un caso sintético (Guggenheim repetido +
una foto distinta sin tocar) antes de desplegar.
**Pausado junto con lo de Serper a petición de Paco (23 sept)** — funcionó a la primera
que se probó, pero no se ha repetido con más casos (varios sitios distintos, no solo dos
menciones del mismo). Si vuelve a verse una foto repetida, revisar esto primero.

---

## Sesión 23 sept 2026 (tarde) — Panel admin: dónde vive, arreglado y sin token en el navegador

**Dónde está el panel (no estaba anotado en ningún sitio):** `admin.borradodelmapa.com` es
**GitHub Pages** del repo **PÚBLICO `borradodelmapa/Admin-borradodelmapa`** (DNS: CNAME →
`borradodelmapa.github.io`; el fichero `CNAME` del repo no se toca NUNCA). Copia de trabajo local:
`C:\Users\User\Desktop\salma-admin` (clon real, `git push` a `main` = despliegue en ~40 s). NO está
en este repo (`salma/admin.html`, el editor de prompt, se BORRÓ el 23 sept 2026 — ver más abajo). El proyecto de Netlify
`creative-boba-c8451a` (creado el 9 marzo 2026, conectado a este repo; DNS nunca apuntó a él) **SE BORRÓ el 23 sept
2026** con `netlify sites:delete 0446fe41-1473-4d76-9acf-2b52376f359d` (la UI de Netlify no mostraba "Danger zone").
Comprobado: sus URLs de netlify.app dan 404 y el `config.js` viejo con el hash ya no es accesible.
**DECISIÓN DE PACO (23 sept): solo existe UN admin, el subdominio `admin.borradodelmapa.com`** (`/admin` de
`borradodelmapa.com` da 404). NO volver a conectar este repo a Netlify ni desplegar el panel en otro sitio.
**Qué estaba roto:** `config.js` apuntaba al dominio muerto `paco-defoto.workers.dev` (todo en rojo/"—") y
llevaba un `ADMIN_CHAT_TOKEN` fijo (ya caducado: el `ADMIN_TOKEN` se regeneró el 13 sept) y el
`PASSWORD_HASH` SHA-256 de la contraseña — todo público en internet. Además `/health` se llamaba sin token.
**Arreglo (commit `6f342c19` Worker + `60c5634` panel; Worker Version ID `444d5a88-5345-4fcf-8bb5-e7cc19b29a5e`,
comprobado contra `/version`, 21 secrets intactos):** el Worker tiene `isAdminRequest()` — `/health`, `/ga4` y
`/admin-chat` aceptan `ADMIN_TOKEN` (para llamadas a mano con curl) O un ID token de Firebase de
`admin@borradodelmapa.com` validado contra Google (`accounts:lookup`, gratis). El panel manda su sesión
(`adminAuthHeaders`), login directo contra Firebase (sin hash), `WORKER_URL` al dominio nuevo, `sw.js` cache v4.
Comprobado: token basura / JWT falso con email admin / sin token → 401 en los tres endpoints.
**Aviso de coste (§8):** no añade llamadas de pago; cierra un agujero (`/admin-chat` gasta OpenAI/Claude y
antes bastaba un token público). El lookup de Firebase es gratuito.
**Pendiente, NO hecho (lo tiene que hacer Paco):** (1) cambiar la contraseña de `admin@borradodelmapa.com`
en Firebase Console → Authentication: el hash SHA-256 estuvo público (y sigue en el historial público del repo)
y esa misma contraseña es la de Firebase; (2) probar en pantalla: entrar, tarjetas Worker/Anthropic/Places en
verde y pestaña Analytics con datos. **Sin confirmar en pantalla todavía.** Además `GA4_CREDENTIALS` sigue sin
estar en el Worker (Analytics no dará datos hasta ponerlo). Mejoras propuestas del panel (datos de coste real
desde `GET /usage`, feedback de testers, estado de secrets) sin empezar.

**Mismo día, 2ª tanda (a petición de Paco):**
- **EL PROMPT SOLO SE TOCA DESDE EL CÓDIGO (`worker/salma-worker.js`), nunca desde una herramienta web.** Se BORRÓ
  `admin.html` (el editor de prompt que estaba publicado en `borradodelmapa.com/admin.html`) y los 6 endpoints del Worker
  que lo editaban o leían: `/admin/init-prompt`, `get-prompt`, `save-prompt`, `apply-fix`, `test-extract`, `test-rule`.
  También se quitó `getSystemPrompt()`: el chat ya no lee `config/salma-prompt` de Firestore (esa lectura daba 403 desde el
  Worker — sin sesión —, así que SIEMPRE ganaba el prompt del código: el comportamiento es idéntico y se ahorra una lectura
  fallida + un KV por mensaje). El doc `config/salma-prompt` de Firestore queda sin uso (no se ha borrado). Quedan solo
  `/admin-chat` y `/admin/verify-place`. NO volver a montar ninguna herramienta que edite el prompt fuera del repo.
- **Panel admin (`salma-admin`, repo `Admin-borradodelmapa`): paleta de la app** (`#0D0F10`, naranja `#F4630B`, texto
  `#ECEBE8`; texto oscuro sobre naranja) + **insignia de versión** abajo a la derecha: `Panel <ADMIN_VERSION> · Worker
  <id>`. `ADMIN_VERSION` está en `config.js` y hay que subirla, junto con los `?v=` de `index.html`, en CADA cambio del panel.
  El service worker del panel NO está activo (se registra en `/admin/sw.js`, ruta que no existe en este dominio): la única
  caché es la HTTP de GitHub Pages (`max-age=600`, hasta 10 min), por eso la insignia y los `?v=`.

**🔴 FACTURA DE GOOGLE PLACES, SEPT 2026 — 154 € del 1 al 22 sept (agosto: 0,54 €), 100 % Places API, todo en `Salma
Project`. Desglose SKU: Find Place 38,84 € (7.662 llamadas), Places Photo 34,37 € (6.722), Contact Data 28,91 € (12.230),
Atmosphere Data 28,41 € (7.621), Place Details 23,53 € (6.613); Directions/Static/Nearby ≈ 0 € (dentro del cupo gratis).
Gráfica diaria: picos 4-7 sept (13-14 €/día), 4-9 €/día del 8 al 15, ~1 € el 15, y DESPUÉS 3-26 €/día (≈70 € del 16 al 22;
el 21 sept: 26 €; el SKU Place Details aparece a partir del 18). Los fixes del 15 sept fueron INCOMPLETOS: cubrieron
verify/fotos/nearby/buscar_lugar pero NO `/place-details` (cada apertura de guía → `_enrichAll` en `mapa-itinerario.js`
pide un Details POR PARADA, y solo se cacheaba la foto). Además se dio por cerrado sin mirar la factura real.
**DECISIÓN DE PACO (23 sept): cada lugar se paga UNA sola vez, para siempre ("no admito ninguna llamada más").** Se acepta el
riesgo: las condiciones de Google solo permiten guardar sin límite el `place_id` (coordenadas 30 días); Google puede avisar y,
si no se corrige en 24 h, suspender el uso. Mitigar: NO rellenar el catálogo en bloque (pre-fetch masivo), mostrar la
atribución de Google, y mantener el catálogo desacoplado del proveedor (por si hubiera que migrar a OpenStreetMap).
**PLAN "catálogo de lugares" (solo GUÍAS; "Cerca mía" y Narrador son problemas aparte, no tocar):**
[x] PASO 1 — `/place-details` con catálogo KV `pl:{place_id}` sin TTL (Worker `0cb94d78-41b7-4f97-bbcb-1442e4ea3450`, commit
`baa11e8f`): 1ª petición = 1 llamada a Google con todos los campos (name, rating, reviews, opening_hours+periods, photos,
utc_offset), las siguientes 0; "abierto ahora" calculado desde `periods` (`computeOpenNow`, 9 casos probados); cabecera
`X-Catalog: hit|miss`. Probado con un lugar real (miss 1,5 s → hit 0,36 s ×2). **Falta que Paco lo vea en la app.**
[ ] PASO 2 — verificación de paradas (`verifyAllStops`): guardar para siempre "nombre+zona → place_id" (hoy `verifiedspot:` 30 d)
y pedir la ficha COMPLETA una vez para que el catálogo esté completo. [ ] PASO 3 — fotos guardadas por lugar (no depender del
`photo_reference`, que caduca). [ ] PASO 4 — frontend: que abrir una guía no pida nada a Google (usar lo guardado en la
parada) y que un re-render tras editar no relance `_enrichAll`. [ ] PASO 5 — rellenar el catálogo con lo que YA está en las
guías guardadas (Firestore), sin llamar a Google. [ ] Cuotas diarias duras en Google Cloud (Places API → Cuotas) como candado.
[x] PASO 2 HECHO — Worker `7f10c62c-7a20-426a-b68a-a9d7667a0a5a` (commit `c54cdd93`): `verifyAllStops` usa la ficha completa v2 de
`pl:{place_id}` (1 Find Place + 1 Details por lugar NUEVO; 0 llamadas si ya está), `verifiedspot:` permanente con guarda de
homónimos (ancla y 25 km). Probado simulado (11/11) y en producción: guía "1 día en Olite" = 5 lugares nuevos (~10-13 céntimos, una
vez); reabrirla 2 veces = 0 fichas nuevas. Sin confirmar todavía en la factura de Google (mirar mañana en Informes por SKU).
**AUDITORÍA DE LLAMADAS A GOOGLE (23 sept 2026, hecha línea a línea; lo que faltó el 15 sept):**
- ✅ cubiertas (pagan una vez): `verifyAllStops`, `/place-details`, `/route-thumbnail` (Static Maps, una vez por ruta).
- 🔴 NO cubiertas y en el flujo de guías/recomendaciones (LAS GRANDES FUGAS QUE QUEDAN):
  (1) **`getValidatedPlace` (≈línea 1551, enlaces Maps del texto de cada respuesta)**: por CADA negrita de la respuesta (hasta 6) hace
  Find Place (+ 2º radio + Text Search) SIN caché → 6-18 llamadas por respuesta de recomendaciones.
  (2) **Fotos automáticas en el chat (≈línea 10518, `buscarFotoLugar`, hasta 8 por respuesta)**: 1 Find Place por nombre SIN caché.
  Hipótesis por comprobar: el `photo_reference` cambia en cada respuesta de Google, así que la caché de fotos por hash del ref
  (R2 `photocache/`) casi nunca acierta entre respuestas → Places Photo se repaga. Solución: guardar los bytes por `place_id`.
  (3) `/photo?name=&lat=&lng=`: Find Place por petición cuando falla el ref (solo cachea el índice curado).
- 🟡 cacheadas pero caducan (deberían ser permanentes): `resolverPaisDestino` (ancla de destino, KV 30 d), `/historia-lugar`
  (Text Search por lugar, KV 30 d), `_getPlaceDetailsCached` (teléfono/web, 30 d). Sin caché de "no encontrado": una parada que Google no
  localiza repite hasta 3 llamadas cada vez.
- 🟡 Directions: `drivingDistanceKm` (verify, paradas a >10 km del ancla) y `/directions` (línea de ruta) sin caché en el Worker; hoy
  ≈157 llamadas/mes dentro del cupo gratis, pero crecería con usuarios (guardar el trazado con la guía).
- ⚪ Navegador (misma cuenta de Google, no se puede cachear en el Worker): Maps JS (cargas de mapa), `map-modal.js` (getDetails/findPlace
  por parada al abrir "Ruta completa"), Places Autocomplete (diario, mapa-ruta), Geocoder. La factura NO distingue Worker de navegador:
  para separarlos, Google Cloud → APIs y servicios → Métricas, agrupado por credencial (clave del Worker vs clave pública).
- ⚪ Fuera de alcance por decisión de Paco ("Cerca mía" y Narrador aparte): `searchPlacesForHelp`, `buscarLugar`, `searchHotelsPlaces`,
  `searchPlacesGoogle`, `searchNearbyPlaces` (7 d), `/nearby-pois`, taxi (≈9609), `geocodeCiudad`, `/staticmap` (diario), `/tts-google`.
  `buscarRestaurante` no tiene ningún llamador (código muerto). `/health` hace un Find Place por cada carga del dashboard del admin.
[x] ARREGLO A (fugas 1 y 2 del chat) HECHO — Worker `5e6948a4-6ecc-4406-94be-8aed89353c77` (commit `4a52608e`): KV `vp:{cc}:{region}:{nombre}`
(getValidatedPlace: enlaces Maps) y `ph:{nombre}` (buscarFotoLugar: fotos automáticas), positivos PERMANENTES, "no encontrado" 30 días solo si
Google contestó; `buscarFotoLugar` devuelve SIEMPRE los mismos photo_reference guardados (imagen en R2 reutilizada). Probado simulado 14/14.
**Falta: que Paco lo pruebe en el chat (misma pregunta dos veces) y mirar la factura de Google mañana.** (3) `/photo?name=` sigue pendiente.
Probado en vivo por Paco (Cantabria, 2 preguntas): `ph:` 16 entradas, `vp:` 0 (correcto: en las recomendaciones —Tiempo 1, `guidedIsReco`— NO se
inyectan enlaces de Maps, solo fotos; la fuga (1) `getValidatedPlace` aplica a respuestas conversacionales, no a recomendaciones); la guía guardada
y abierta añadió 11 fichas `pl:` (17→28). Claude escribe respuestas distintas cada vez: el catálogo solo ahorra cuando un NOMBRE SE REPITE.
[x] PUNTOS 1-3 DE LA LISTA FINAL HECHOS (23 sept 2026, Worker `280e6189-d528-40a5-888b-1ae92eed3aca`, commits `999659cc`, `7097fd13`, `08e3b036`):
(1) cachés permanentes: `_getPlaceDetailsCached` (teléfono/web; ya NO guarda un fallo como `{}`), ancla de destino `geocity:anchor8:{cubo 10° de la ubicación
del usuario}:{destino}` (el cubo evita fijar "Córdoba" de Argentina para España), `/historia-lugar` (y el slug ya no rompe tildes). (2) Directions: `/directions` guarda la respuesta
en KV `dir:{hash}` (puntos+modo+carretera+pasos) y `drivingDistanceKm` (red de seguridad de verify) en `drv:{coords 4 dec}`; prueba real: miss→hit→hit.
(3) `/health` responde con la última comprobación si tiene <10 min (`health:last`; `?force=1` fuerza una real): cada carga del dashboard disparaba OpenAI, Google,
RapidAPI ×2 y Duffel. Todo probado con Google/KV simulados (7 baterías) y sin regresión. Pendiente de la lista: (4) modal "Ruta completa" del navegador
(`map-modal.js`: PlacesService.getDetails + DirectionsService del navegador), (5) cuotas duras en Google + contadores en el panel.
[x] FUGA 3 (`/photo`) HECHA — Worker `db787304-9d13-433b-8766-a0472f134fb7` (commit `dc62b61f`): alias KV `pa:{hash(ref)}` → ref bueno (permanente; guías antiguas con
ref caducado ya no repiten el circuito en cada apertura), `spotcache:` permanente con guarda de homónimos (30 km), `spotmiss:` (no encontrado, 30 d, solo si Google
contestó), y `_getCachedPlacePhoto(...,r2Only)` para no leer el alias en el caso normal. Probado simulado 9/9 (+ las otras 3 baterías sin regresión). Una guía antigua
con refs caducados pagará UNA última vez al abrirse y luego 0.
[x] FILTRO DE FOTOS del chat (Worker `20a81964-fd45-4e22-94cd-dd947a652ec4`, commit `0c46544c`): `shouldLookupPhoto()` descarta SOLO titulares
("Dónde comer:", "Qué ver:"…) y platos (primera palabra en lista `_DISH_WORDS`); cualquier otro nombre —p. ej. "Playa del sardinero"— conserva su foto
(decisión de Paco: "solo platos, nada más"). Probado 32/32 lugares con foto, 25/25 titulares/platos sin foto. Borrada la entrada mala `ph:donde comer:, cantabria`.
**Orden propuesto de arreglos (uno a uno, con OK):** A) (1)+(2)+(3): nombre→lugar y fotos por `place_id` en R2 (la mayor fuga viva);
B) TTL permanentes + caché de "no encontrado"; C) guardar el trazado de Directions con la guía; D) `/health` cacheado 10 min;
E) frontend (`map-modal.js`); F) cuotas diarias duras en Google + contadores por SKU en el panel.
**CANDADOS DE GOOGLE PUESTOS POR PACO (23 sept 2026, proyecto `Salma Project` = `gen-lang-client-0108818247`, cuenta de facturación `012460-9B02AE-D84C54`):**
- B1 HECHO — presupuesto "Borrado mapa presupuesto mensual": mensual, todos los proyectos/servicios, **60 €**, "Solo alertas" (NO corta), avisos al 50 % (30 €), 90 % (54 €),
  100 % (60 €) de gasto REAL y 95 % (57 €) de gasto PREVISTO, por correo a administradores/usuarios de facturación.
- CUOTAS DIARIAS ("prudente", techo ≈10-13 €/día; único corte real en Google — el "límite de inversión" NO existe para Maps/Places: solo Gemini API, Vertex, Cloud Run):
  Places API `Requests per day` = **900** (confirmado por Google; en Places legacy todos los métodos comparten UNA cuota, no se puede poner por método), Directions `Requests per day` = 200,
  Maps Static `Unsigned requests per day` = 100 (era 25.000), Geocoding `v3 requests per day` = 50 (las 4 `v4 … per day` opcionales), Maps JavaScript `Map loads per day` = 1.000.
  **Places confirmado con captura; las otras 4 (Directions, Static, Geocoding, Maps JS) confirmadas de palabra por Paco el 23 sept, sin captura** (enlaces de comprobación: `console.cloud.google.com/google/maps-apis/quotas?project=gen-lang-client-0108818247&api=<api>-backend.googleapis.com`).
  Se reinician a las 9:00 (hora de España). **Si la app empieza a fallar (fotos, verificación, mapas) con OVER_DAILY_LIMIT/RESOURCE_EXHAUSTED, es este candado**: subir la cuota ahí, no tocar código. Las cuotas se cuentan en
  peticiones, no en euros; el tope en euros por servicio (segunda capa) es del Worker y está PENDIENTE de hacer. Dato: el 23 sept ya había 653 peticiones a Places a las 20:27.
- SEGUNDA CAPA HECHA — TOPE DE GASTO PROPIO EN EL WORKER (Worker `4554365f-fa98-4e8d-b4c4-d1b54047bb13`, commit `1051796a`): el `fetch` del módulo (`const fetch = …` al
  principio de `salma-worker.js`, el global queda intacto) pasa TODA llamada a `maps.googleapis.com` por `_googleGate()`, que suma un coste ESTIMADO (precios de lista, sin cupos
  gratis; `GOOGLE_UNIT_EUR`) a contadores KV `gspend:d:{día}` (JSON {eur, n:{sku:llamadas}}, TTL 40 d) y `gspend:m:{mes}` (TTL 400 d). Si una llamada HARÍA superar el tope,
  NO llama a Google y responde `OVER_QUERY_LIMIT` (429 en foto y mapa estático); las cachés no guardan errores, así que al día siguiente vuelve solo. FAIL-OPEN si KV falla.
  **Topes: 8 €/día y 50 €/mes, editables SIN desplegar** con `npx wrangler kv key put "gcap:config" '{"daily_eur":8,"monthly_eur":50}' --binding=SALMA_KB --remote -c wrangler.toml`
  (memoria de 60 s). Ver el gasto propio: `GET /admin/google-usage` (solo admin) o `wrangler kv key get "gspend:d:<día>" --text …` (¡usar `--text`!). **Si aparece
  `[GASTO-GOOGLE] TOPE alcanzado` en los logs o fotos/verificación fallan y Google no ha cortado, es ESTE tope: subir `gcap:config`.** No cubre llamadas del navegador con
  la clave pública (las frena la cuota diaria de Google). Probado 11/11 simulado + 8 baterías sin regresión + producción (1 llamada nueva contada, 1 de caché no).
- B2 HECHO (23 sept 2026, confirmado de palabra por Paco; comprobar que "Costo de uso estándar" ponga Habilitado): exportación de la facturación a BigQuery, proyecto `Salma Project`
  (`gen-lang-client-0108818247`), conjunto `billing_export`, multirregión EU, "Costo de uso estándar" (NO se activó FOCUS ni "detallado"). Primeros datos en unas horas; relleno del
  mes anterior hasta 5 días. Sirve de fuente del COSTE REAL por SKU y día para el panel de gastos (el tope del Worker es una estimación a precios de lista).
- (antes PENDIENTE de Paco: B2 exportación de la facturación a BigQuery (dataset `billing_export`, multirregión EU, "Coste de uso estándar").

**Plan del panel admin nuevo (acordado con Paco 23 sept 2026; el panel será SOLO estadísticas y gastos de proveedores,
sin chat ni gestión de proyecto — eso se hace con Code). Checklist, marcar al avanzar:**
- **B — proteger el dinero (Paco, sin código, urgente):** [ ] presupuesto+alertas Google Cloud (~15 €/mes, 50/90/100 %);
  [ ] activar exportación de facturación de Google a BigQuery (dataset multi-región; SOLO acumula desde que se activa);
  [ ] mirar si la cuenta de Anthropic tiene "Admin keys" (organización).
- **C — limpiar (Claude, con OK):** [x] HECHO 23 sept 2026 (panel `2026-09-23.3`, commit `e2d9161` del repo `Admin-borradodelmapa`): fuera Chat/Proyecto/Marketing/Salma/Contabilidad,
  botón Proyecto duplicado, "Consulta rápida" y tarjetas Llamadas Salma/Errores; quedan Dashboard, Analytics, Usuarios y Configuración; `admin.js` de 64 KB a 29 KB. El punto
  de salud "Anthropic" pasó a "OpenAI" (el Worker solo comprueba OpenAI; una comprobación real de Anthropic —`/v1/messages/count_tokens`, gratis— queda pendiente). Probado en jsdom
  (0 errores, 4 pestañas, 6 puntos verdes). NOTA: `showModal` queda como código muerto en `admin.js`; el Dashboard/Usuarios leen Firestore directo y las reglas solo dejan leer el
  propio doc → seguirán en "—" hasta el `/admin/stats` del Worker (paso D). [ ] borrar `/admin-chat` del Worker (ya sin ningún llamador en el panel); [ ] cerrar la regla Firestore `admin_logs` (hoy lee/escribe cualquier usuario
  autenticado) y quitar `logToFirestore()` (nunca funcionó: escribe sin sesión y la regla lo rechaza).
- **D — datos automáticos:** [ ] `/admin/stats` (Worker, `isAdminRequest`, cuenta de servicio; el panel NO lee Firestore
  directo porque las reglas solo dejan leer el propio doc y no hay regla para `admin/*`); [ ] Paco crea secrets: admin key
  Anthropic (`/v1/organizations/cost_report`), admin key OpenAI (`/v1/organization/costs`), clave restringida Stripe;
  [ ] colector diario en el cron de las 6:00 UTC: Google (BigQuery por SKU), Anthropic, OpenAI, Twilio (Usage Records),
  ElevenLabs (`/v1/user/subscription`), Stripe; [ ] contadores propios Duffel/Serper (sin API de coste; avisar §8);
  [ ] cuotas fijas (Brave, RapidAPI, OpenWeather, Resend, Cloudflare) configuradas una vez.
- **E — HECHA la pestaña "Gastos en Google"** (panel `2026-09-23.4`, commit `ed7f502` de `Admin-borradodelmapa`): lee `GET /admin/google-usage` del Worker con la sesión de admin; gasto de
  hoy y del mes frente a los topes (`gcap:config`), últimos 8 días, desglose de hoy por servicio y los candados de Google (lista informativa en `config.js` → `GOOGLE_QUOTAS`: si se
  cambia una cuota en Google, actualizar esa lista). Barra verde <60 %, ámbar <90 %, roja ≥90 %. Es una ESTIMACIÓN a precios de lista; el coste real vendrá de BigQuery (`billing_export`,
  pendiente de leer desde el panel/colector). Probado en jsdom (23 comprobaciones, 0 errores JS) y visto en escritorio y móvil. Falta que Paco lo vea con su sesión real.
- **PANEL ADMIN — PESTAÑAS QUE FALTAN (pedido por Paco el 23 sept 2026, al cerrar el día):**
  (1) **INGRESOS** (nueva): compras de Stripe, Premium activos, ingresos menos gastos = margen (Stripe API con clave restringida; ver paso D).
  (2) **USUARIOS CON SU GESTIÓN** (la actual solo lista nombre/email/registro/rutas y hoy sale vacía por las reglas de Firestore): lista real vía `/admin/stats` del Worker (cuenta de servicio),
  plan y Premium hasta cuándo, último acceso, uso y coste de Claude por usuario (`usage:{uid}:{mes}`), y acciones de gestión (ver su uso, dar/quitar Premium, deshabilitar cuenta).
  (3) **ANALÍTICA** (la actual depende de GA4 y sale vacía): falta el secret `GA4_CREDENTIALS` en el Worker (`GA4_PROPERTY_ID` 352732094 ya en `config.js`); añadir estado de indexación en Google.
  (4) **CONFIGURACIÓN — hoy es casi inútil**, revisada el 23 sept: solo tiene el botón "Limpiar caché y recargar", que borra Cache Storage, pero el service worker del panel NO está activo
  (se registra en `/admin/sw.js`, que da 404 en este dominio), así que no hay nada que borrar; la caché real es la HTTP de GitHub Pages (`max-age=600`), que ese botón no toca (basta Ctrl+F5).
  Además `initSettings()` añade un listener nuevo cada vez que se entra en la pestaña, el texto dice "funcione offline" (falso) y el recuadro conserva el azul antiguo. **NO hay botón de cerrar sesión
  en el panel.** Propuesta: sustituir por versiones (panel/Worker/despliegue), cerrar sesión, editar topes de gasto de Google (necesita `POST /admin/google-caps` en el Worker que escriba `gcap:config`),
  forzar comprobación de salud (`/health?force=1`) y quitar el botón de caché.
  **HECHO 23 sept 2026 (panel `2026-09-23.6`, commit `29d970d` de `Admin-borradodelmapa`; Worker `39342174`, `POST /admin/google-caps`: valida 0,5-100 €/día y 1-1000 €/mes, diario ≤ mensual, escribe `gcap:config`), SIN CONFIRMAR con la sesión real de Paco:** la pestaña ahora tiene Versiones (panel, Worker, último despliegue, sesión), Topes de gasto editables (con aviso de confirmación; se aplica en <1 min), "Comprobar ahora" (`/health?force=1`, llama a OpenAI/Google/RapidAPI/Duffel: céntimos) y Cerrar sesión; eliminados el botón de caché y el `showModal` muerto. Probado en jsdom (guardar, cancelar, error 400, salud, logout: 0 errores JS). **Aviso de coste §8:** el botón de salud real cuesta céntimos por pulsación; editar topes no llama a ninguna API. Por error se subió un momento `.netlify/` al repo del panel; ya quitado y en `.gitignore`.
  **PRIMERA PRUEBA REAL de Paco (23 sept, sesión real): topes guardados bien (9 €/día, 50 €/mes; "Guardado… se aplica en menos de un minuto"). "Comprobar ahora" dijo "Fallan: Cars" — es un fallo REAL, no del panel:** RapidAPI responde 403 `You are not subscribed to this API` tanto a `/v1/car-rental/locations` (el que usa /health) como a `/v1/car-rental/search` (el que usa la herramienta `buscar_coche`), con la misma clave con la que `/v1/hotels/locations` sí funciona. Es decir, **`buscar_coche` (alquiler de coches) no funciona hoy en la app** — la suscripción de RapidAPI de Paco a Booking.com no incluye los endpoints de coches (o hay que suscribirse a otra API/plan de coches en RapidAPI). Sin tocar código; decisión de Paco: suscribirse en RapidAPI o quitar la herramienta y el punto de salud. Se hicieron 2 llamadas de comprobación directas a RapidAPI (rechazadas con 403).
  **HECHO 23 sept 2026 — `GET /admin/stats` (Worker `dabab569-d56e-4461-9a21-da8e23dead46`, commit `b973ea78`, confirmado contra `/version`, 21 secretos intactos) + panel `2026-09-23.7` (commit `23da8e2`), SIN CONFIRMAR con la sesión real de Paco:** el Worker lee Firestore con su cuenta de servicio (solo lectura: lista `users` y una consulta de grupo sobre `maps`) y devuelve totales (usuarios, nuevos 7 d, Premium activos, guías, guías 7 d, mensajes y coste Claude estimado del mes) + lista de usuarios con plan, nº de guías y uso del mes (KV `usage:{uid}:{mes}`). Tope 1.200 usuarios y 5.000 guías (avisa en `truncated`). El Dashboard (Usuarios/Rutas) y la pestaña Usuarios (ahora con columnas Plan y Uso este mes; nombres/emails escapados) lo usan; ya no leen Firestore directo. Probado 14/14 con el código real del Worker y Firestore simulado, y en jsdom. **Aviso de coste §8:** ninguna API de pago; lecturas de Firestore (50.000/día gratis; ~1 lectura por usuario + 1 por guía cada vez que se abre Dashboard/Usuarios) y de KV. El coste Claude por usuario se muestra en euros a 0,92 €/USD (estimado, marcado con ≈). **HECHO 23 sept 2026 (tarde) — LIMPIEZA: fuera `/admin-chat` y `logToFirestore` del Worker (esta última escribía sin sesión y la regla la rechazaba siempre; quitadas también sus 3 llamadas del chat, que además mandaban 200 caracteres del mensaje del usuario a un sitio que nunca los guardaba) y regla Firestore `admin_logs` CERRADA (`allow read, write: if false`; publicada con `firebase deploy --only firestore:rules`, commit `dbe6dff3`, Worker `f3a33233`).** Sin coste.
  **HECHO 23 sept 2026 (tarde) — INGRESOS: `GET /admin/revenue` (Worker `bfd15c65-62cb-4f40-af05-5c764d5aaec7`, commit `2cf30bf8`, comprobado contra `/version`, 21 secretos intactos) + pestaña Ingresos del panel `2026-09-23.8` (commit `327128b`), SIN CONFIRMAR con la sesión real de Paco:** lista las Checkout Sessions pagadas de Stripe con la MISMA `STRIPE_SECRET_KEY` que ya usa el Worker (no hace falta otra clave; el modo test/real sale del prefijo `sk_test_`/`sk_live_` y el panel avisa con un banner). Tarjetas: este mes, 30 días, total, y margen estimado del mes (ingresos/1,21 − gasto Google estimado − Claude estimado a 0,92 €/USD; sin comisiones de Stripe ni reembolsos ni otros proveedores). Por plan y últimas 20 compras. Probado con Stripe simulado y en jsdom (0 errores JS). **Aviso de coste §8:** las lecturas de Stripe no se facturan; sin coste. **HECHO 23 sept 2026 (noche) — panel `2026-09-23.9` (insignia de versión grande: 16 px, borde naranja; pedido por Paco porque no la veía) y `2026-09-23.10` (commit `a885fed`): "Resumen del mes" arriba del Dashboard** con 4 tarjetas — Ingresos del mes (Stripe, con etiqueta PRUEBA si la clave es sk_test_), Gastos estimados (Google + Claude), Margen estimado (ingresos sin IVA − gastos) y Usuarios (total · Premium · guías), más una nota que dice qué falta si un dato falla; las tarjetas de ingresos, gastos y usuarios llevan a su pestaña. Cada dato se pide por separado (`/admin/revenue`, `/admin/google-usage`, `/admin/stats`): si uno falla, su hueco queda en "—". Solo panel, sin cambios en el Worker ni coste. SIN CONFIRMAR con la sesión real de Paco. **Ojo, sin resolver:** Paco dijo "no sale" de la pestaña Ingresos con el panel ya en `.8` (la insignia lo confirmaba, así que NO era caché); en pruebas simuladas funciona (escritorio y menú móvil). Falta saber qué ve exactamente: si el menú no la tiene, si sale vacía, o si sale un error rojo; con eso, `wrangler tail` mientras pulsa. **HECHO 23 sept 2026 (noche) — punto de salud REAL de Anthropic:** `/health` ahora llama también a `/v1/messages/count_tokens` (por el Gateway de Cloudflare, con `claude-sonnet-4-6`; **endpoint gratuito**, no genera texto ni se factura; comprobado que responde 200) — Worker `85dc6f0b-4837-4de2-baa6-c4621c86de2d`, commit `3f1385a2`; panel `2026-09-23.11` con el punto "Anthropic" en el Dashboard (antes el punto de Claude era en realidad el de OpenAI). Aviso §8: sin coste. La comprobación guardada por `/health` (10 min) no lleva Anthropic hasta la próxima real ("Comprobar ahora" en Configuración). **Sigue pendiente de esta lista:** Usuarios con gestión (Paco: "hay que pensarlo"), Analítica (GA4_CREDENTIALS), BigQuery real — **Worker LISTO Y DESPLEGADO (`GET /admin/google-real`, Worker `a04b7c2a-89da-4463-a3f1-c35d183ee370`, commit `a0c4857b`, 21 secretos intactos; devuelve coste real de hoy/ayer/mes/por SKU neto de créditos, cacheado 30 min en KV `gbq:cache`, `?force=1` lo salta; probado 16/16 con BigQuery simulado), pero FALTA QUE PACO DÉ PERMISOS y luego el lado del panel.** Pasos de Paco: (1) copiar el email de la cuenta de servicio del Worker (Firebase Console → Configuración del proyecto → Cuentas de servicio → `firebase-adminsdk-…@borradodelmapa-85257.iam.gserviceaccount.com`); (2) Google Cloud, proyecto `Salma Project` (`gen-lang-client-0108818247`) → IAM y administración → IAM → Conceder acceso → pegar ese email y darle los roles **BigQuery Job User** y **BigQuery Data Viewer**; (3) comprobar en BigQuery que el dataset `billing_export` ya tiene la tabla `gcp_billing_export_v1_012460_9B02AE_D84C54` (Google la crea al llegar el primer dato, unas horas tras activar la exportación). Códigos de error del endpoint: `no_permission` (403, falta el paso 2), `no_table` (falta el 3), `timeout`, `bq_error`. Aviso §8: la consulta lee unos MB de una tabla particionada (BigQuery da 1 TB/mes gratis): sin coste real. **HECHO 23 sept 2026 (noche): Paco dio los permisos** (`firebase-adminsdk-fbsvc@borradodelmapa-85257.iam.gserviceaccount.com` con `Usuario de trabajo de BigQuery` + `Visualizador de datos de BigQuery` en Salma Project; Google avisó de que tarda unos minutos) **y el panel `2026-09-23.12` (commit `51d7b76`) ya pinta el coste real:** sección "Coste REAL según Google" en Gastos (hoy incompleto, ayer, mes con créditos, por servicio y últimos días; "Actualizar" fuerza consulta nueva) y el Resumen del Dashboard y el margen de Ingresos usan el real si está disponible (etiquetado REAL) y, si no, la estimación. Avisos claros si falta permiso (`no_permission`) o la tabla aún no existe (`no_table`). Probado en jsdom con los 3 casos, 0 errores JS. **SIN CONFIRMAR con datos reales: el Worker todavía no se ha visto responder con la consulta de verdad (necesita sesión de admin); el primer resultado real lo verá Paco en Gastos.** **ANALÍTICA (23 sept 2026, noche) — EN CURSO, Paco haciendo los pasos uno a uno:** en vez de crear un secret nuevo, `/ga4` del Worker (`78097445-a4e0-446a-8111-6061a1a0a0ed`, commit `ff8f3d5a`) usa la MISMA cuenta de servicio de Firebase (`firebase-adminsdk-fbsvc@borradodelmapa-85257.iam.gserviceaccount.com`, scope `analytics.readonly`) si no hay `GA4_CREDENTIALS`; panel `2026-09-23.13` con errores legibles. Pasos de Paco: (1) activar "Google Analytics Data API" en el proyecto `borradodelmapa-85257` (https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=borradodelmapa-85257); (2) en Google Analytics, propiedad 352732094 → Administrar acceso → añadir ese email como **Lector**. Sin coste (la Data API es gratuita). **CONFIRMADO 23 sept 2026 (noche, captura de Paco): la consulta a BigQuery FUNCIONA de punta a punta (sin error de permiso ni de tabla, así que el permiso está activo y la tabla existe), pero devuelve 0,00 € en hoy/ayer/mes y "Sin gasto este mes": la exportación todavía no tiene filas (se activó hace pocas horas; Google tarda hasta ~24 h en escribir el primer dato y hasta ~5 días en rellenar el mes anterior).** Volver a mirar Gastos mañana 24 sept: si sigue a 0 pasadas ~24-48 h de la activación, revisar en BigQuery que la tabla `gcp_billing_export_v1_012460_9B02AE_D84C54` tenga filas y que la exportación siga en "Costo de uso estándar" habilitada., y lo de **Cars (RapidAPI, decisión de Paco)**.
- **E — pantallas restantes:** Resumen, Gastos por proveedor (día/mes/proyección), Coste por usuario y por guía, Ingresos y margen,
  Usuarios, Analytics (falta `GA4_CREDENTIALS`), Calidad y feedback (`beta_feedback`), Alertas por email (Resend) por umbral.
- Regla: estimado y real se muestran SIEMPRE etiquetados; nunca fingir precisión donde no hay API de coste.

---

## Qué es este proyecto

**borradodelmapa.com** — Salma es tu compañera de viaje. Te diseña la ruta, te guía en ruta, te resuelve imprevistos y documenta tu aventura.
Repo: https://github.com/borradodelmapa/borradodelmapa

El usuario es **Paco**, founder y único desarrollador. Trabaja desde portátil, tablet y móvil. Quiere aprender mientras trabajamos — enseñar proactivamente y proponer mejoras.

**Números clave:** (recontados 16 sept 2026 — antes decía "15 archivos JS / 25+ endpoints", desactualizado)
- 19 archivos JS principales en la raíz (~900KB código)
- 1 Worker Cloudflare (~316KB, 10.400 líneas) con **43 endpoints** + 3 crons automáticos
- 2 namespaces KV (`SALMA_KB` + `ROAD_GEOM`, confirmados por API de Cloudflare)
- 1,793 páginas de destinos SEO
- 12 artículos de blog
- 193 países en KV (3 niveles de datos) — cobertura de contenido sin verificar en este barrido (ver KV más abajo)
- 8 tools de IA en el chat (Vigilancia de Vuelos es CRUD aparte, no tool de chat)
- 15 API keys/secrets externos

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS + JS vanilla (sin frameworks) |
| Auth + DB | Firebase Authentication + Firestore |
| IA (chat) | Claude Sonnet (`claude-sonnet-4-6`) vía Anthropic API |
| IA (secundaria) | GPT-4o-mini vía OpenAI API (enrich, bloques largos, narrador, admin) |
| IA (KV generación) | Claude Sonnet (nivel 1-2) + Claude Haiku (nivel 2.5) — scripts locales |
| Mapas | Google Maps JS API (principal) + Leaflet 1.9.4 (fallback) |
| Fotos | Google Places Photos API (via photo_ref) |
| Búsquedas | Google Places Text Search + Brave Search |
| Vuelos | Duffel API |
| Hoteles/Coches | Booking.com vía RapidAPI |
| Voz | ElevenLabs TTS + Web Speech API (input/output) |
| Pagos | Stripe (test mode — falta webhook server-side) |
| Hosting | GitHub Pages / dominio borradodelmapa.com |
| Worker | Cloudflare Workers (salma-api.paco-defoto.workers.dev) |
| Storage | Cloudflare R2 (fotos, avatares, documentos) |
| KV | Cloudflare KV (SALMA_KB) — datos de 193 países |
| PWA | manifest.json + sw.js — instalable desde móvil |

### CDNs y versiones (cargados en index.html)
- Firebase SDK 8.10.1 (app, auth, firestore, storage)
- Leaflet 1.9.4
- Stripe.js v3
- Google Fonts: Bebas Neue, Inter, Inter Tight, JetBrains Mono
- Google Maps JS API (lazy load)
- Google Analytics 4 (G-B2YWQKPTZZ)

---

## Archivos principales

```
/
├── index.html              # App principal — login, welcome, chat, guías
├── 404.html                # Guías públicas por slug (truco GitHub Pages, con chat inline)
├── app.js                  # Firebase, auth, welcome, perfil, galería, mapa live, diario, SOS, coins (INTOCABLE sin confirmar)
├── salma.js                # Motor de conversación: streaming SSE, historial, copiloto, narrador, TTS, cámara
├── guide-renderer.js       # Renderiza guía-card: acordeón, mapas Leaflet, fotos, enlaces
├── mapa-itinerario.js      # Vista itinerario fullscreen: tarjetas + mapa de ruta
├── mapa-ruta.js            # Google Maps dinámico + Leaflet fallback: marcadores, polyline, turn-by-turn
├── bitacora-renderer.js    # "Mi Diario": timeline por días, fotos, notas, compartir redes
├── notas.js                # Gestor de notas: CRUD Firestore, recordatorios, filtros, adjuntos R2
├── video-player.js         # Generador de vídeos Canvas: Ken Burns, mapa animado, documental/historia
├── video-assembly.js       # Smart Assembly: selección automática de fotos para generar vídeo (1 tap)
├── country-utils.js        # Mapeo 190+ países (ES/EN → ISO), emojis bandera, detección en texto
├── nav-history.js          # Browser back/forward con History API
├── docs-viajero.js         # Documentos del viajero: pasaporte, visado, seguro. CRUD + R2
├── docs-viajero.css        # Estilos del módulo documentos
├── flight-watches.js       # Vigilancia de precios de vuelos: CRUD Firestore + alertas del cron del Worker
├── premium-modal.js        # Modal "Hazte Premium" (SOLO interfaz; la lógica de pago sigue en app.js:openCoinsModal). Pinta precios y topes que le llegan del Worker (GET /usage)
├── map-modal.js            # Modal fullscreen Google Maps nativo (Street View, capas, búsqueda) para "ruta completa"
├── share-inbox.js          # Handler de fotos compartidas desde galería del móvil (Share Target Android)
├── translator.js           # Traductor simultáneo push-to-talk (voz ES vía ElevenLabs, resto Web Speech)
├── historia.js             # Cápsula de historia ampliable (parada/país en guías + chat), Claude Haiku
├── historia.css            # Estilos del módulo Historia
├── debug-panel.js          # Panel 🐛 flotante: logs, errores JS, Version ID Worker + `?v=` scripts cargados
├── styles.css              # Sistema de diseño: mobile-first, dark theme, dorado (175KB)
├── transport-apps.json     # Base de datos de apps de transporte mundial (84KB)
├── legal.html              # Aviso legal, privacidad, cookies, términos (PENDIENTE datos titular)
├── manifest.json           # PWA: standalone, portrait, iconos 192+512
├── sw.js                   # Service Worker: sin caché (todo red), push notifications narrador
├── parse_sse.js            # Utilidad CLI para debug de SSE
├── robots.txt              # Allow all + sitemap
├── sitemap.xml             # Sitemap index
├── sitemap-static.xml      # 2 URLs (home + legal)
├── sitemap-blog.xml        # 13 URLs (blog index + 12 artículos)
├── sitemap-destinos.xml    # 301 URLs de destinos estratégicos
├── blog/                   # 12 artículos HTML + index
├── destinos/               # 1793 páginas de destinos (SEO)
├── scripts/                # Pipeline SEO: build-destinos, grow-sitemap, publish, progressive-load
├── api/                    # API keys en texto plano (gitignored, solo local)
├── docs/                   # Notas de diseño de Paco
├── mockups/                # Prototipos de features futuras
├── backups/                # Copias de seguridad
├── CLAUDE.md               # Este archivo
└── worker/
    ├── salma-worker.js     # Worker principal (~316KB, 10.4K líneas) — prompt + Claude + GPT-4o-mini + tools + verify + KV + crons
    ├── wrangler.toml       # Config Cloudflare Workers (2 KV bindings + R2 bucket + crons)
    ├── kv/                 # Scripts de generación KV nivel 1, 2, 2.5 + JSONs de respaldo
    └── roads/
        └── road-resolver.js # Geometría real de carreteras (OSM) para `/roads/resolve`, cachea en KV ROAD_GEOM
```

### Orden de carga de scripts (index.html) — verificado 16 sept 2026 contra el `<head>` real
1. Firebase SDK 8.10.1 → firebase init inline → `window.SALMA_API`
2. Stripe.js v3
3. `debug-panel.js` → `country-utils.js` → `app.js` → `nav-history.js` → `notas.js` → `flight-watches.js`
4. `salma.js` → `video-player.js` → `video-assembly.js` → `guide-renderer.js`
5. `bitacora-renderer.js` → `mapa-ruta.js` → `mapa-itinerario.js` → `docs-viajero.js` → `map-modal.js` → `share-inbox.js` → `translator.js` → `historia.js`
6. Inline: SW register, salma.initGeolocation/Voices/VoiceToggle, cookie consent

**Dependencias entre módulos:**
```
app.js (Firebase, showState, currentUser, db, showToast, escapeHTML, generateSlug, publishGuide)
  └─ todos los demás dependen de app.js (globals)
country-utils.js (puro, sin deps)
nav-history.js (wraps showState)
notas.js (db, currentUser, SALMA_API, showState, showToast)
salma.js (db, currentUser, SALMA_API, guideRenderer, mapaItinerario, notasManager, showToast)
video-player.js (puro Canvas, sin deps)
guide-renderer.js (Leaflet, db, currentUser, SALMA_API, salma, showToast, generateSlug)
bitacora-renderer.js (Leaflet, db, currentUser, SALMA_API, showToast, videoPlayer)
mapa-ruta.js (google.maps lazy, Leaflet fallback, db, SALMA_API, salma)
mapa-itinerario.js (mapaRuta, guideRenderer, salma, db, showToast) — independiente de
  bitacora-renderer.js desde el rediseño de navegación de sept 2026 (antes parcheaba
  bitacoraRenderer.renderDiario en runtime; verificado 22 sept 2026 que ya no queda
  rastro de eso en el código vivo, solo en backups de abril)
docs-viajero.js (db, currentUser, firebase.firestore.Timestamp, SALMA_API, showState)
flight-watches.js (db, currentUser, firebase.auth, SALMA_API, showToast) — no documentado hasta este barrido (16 sept)
map-modal.js (google.maps, salma, showToast) — no documentado hasta este barrido
share-inbox.js (db, currentUser, SALMA_API, showToast, Cache Storage vía sw.js)
translator.js (SALMA_API, showToast, ElevenLabs vía /tts, Web Speech API) — no documentado hasta este barrido
historia.js (SALMA_API, db — caché KV vía /historia-lugar)
video-assembly.js (videoPlayer, db, currentUser) — no documentado hasta este barrido
debug-panel.js (puro, intercepta console.*/window errors, sin deps de otros módulos)
```

**Código duplicado (pendiente de refactorizar):**
- `_groupByDay()` — en guide-renderer, mapa-itinerario, bitacora-renderer
- `_sampleWaypoints()` — en guide-renderer, mapa-itinerario
- `_fullRouteGmapsUrl()` — en guide-renderer, mapa-itinerario, bitacora-renderer
- `escapeHTML()` / `_esc()` — en app.js y 3+ módulos más

---

## Arquitectura Firebase

- **Auth**: Email/contraseña + Google Sign-In + WebAuthn/fingerprint (parcial — solo recuerda email)
- **Firestore colecciones**:

| Colección | Acceso | Contenido |
|-----------|--------|-----------|
| `users/{uid}` | Owner read/write, **salvo** `premium_until`, `isPremium`, `coins_saldo`, `rutas_gratis_usadas` (solo el Worker, desde 21 sept 2026) | Perfil: name, email, isPremium, coins_saldo, rutas_gratis_usadas, avatarURL, sos_config, copilot_data |
| `users/{uid}/maps/{mapId}` | Owner only | Guías guardadas (itinerarioIA, slug, published, enriched, photos, notes) |
| `users/{uid}/fotos/{fotoId}` | Owner only | Galería de fotos (url, r2Key, albumId) |
| `users/{uid}/albumes/{albumId}` | Owner only | Álbumes de fotos |
| `users/{uid}/notas/{notaId}` | Owner only | Notas (texto, tipo, countryCode, fechaRecordatorio, files, completado) |
| `users/{uid}/pins/{pinId}` | Owner only | Pins del diario |
| `users/{uid}/map_pins/{pinId}` | Owner only | Pins de foto→mapa y tap sheet |
| `users/{uid}/travel_docs/{docId}` | Owner only | Documentos del viajero (name, category, files, expiresAt, notes) |
| `users/{uid}/paises/{paisId}` | Owner only | Legacy — migrado automáticamente a notas |
| `public_guides/{slug}` | Read: public / Write: auth (⚠ SIN ownership check) | Guías públicas SEO |
| `config/salma-prompt` | Read: auth / Write: blocked | Prompt dinámico (gestionado via Worker admin) |
| `admin_logs/{logId}` | Auth required | Logs de uso del Worker |
| `url_validation_incidents/{id}` | Read: auth / Create: auth (solo alta) | Sustituciones de enlaces Maps rotos (Bloque E) |
| `beta_feedback/{id}` | Read: auth / Create: auth (solo alta) | Feedback de testers: nota + logs del panel 🐛 + versión, mandado desde `POST /beta-feedback` |
| `shared_routes/{id}` | Read: auth / Write: solo el dueño | Ruta compartida desde el botón Compartir de la vista de itinerario — a diferencia de `public_guides`, exige login para verse. Mismo id que la guía en `users/{uid}/maps/`. **Regla YA DESPLEGADA (comprobado 21 sept 2026 leyendo `shared_routes/prueba-lectura` con sesión: devuelve "no existe" sin `permission-denied`; se publicó con el `firebase deploy` del paso 1 de pagos, que sube el fichero entero).** |

- **Regla importante**: `const db` solo se inicializa en `app.js`, nunca duplicado
- Firebase se inicializa en el `<head>` del `index.html`

### Firestore Rules actuales

```
users/{userId}/**              → read/write: auth.uid == userId
public_guides/{slug}           → read: true, write: auth != null (⚠ sin ownership)
config/{doc}/**                → read: auth, write: false
admin_logs/{logId}             → read/write: auth
url_validation_incidents/{id}  → read: auth, create: auth (solo alta, sin editar/borrar)
beta_feedback/{id}             → read: auth, create: auth (solo alta, sin editar/borrar)
shared_routes/{id}             → read: auth, create/update/delete: solo el dueño (uid) — DESPLEGADA (comprobado 21 sept 2026)
```

---

## Salma — compañera de viaje IA

- **Rol**: compañera de viaje completa. Planifica rutas, busca restaurantes/hoteles/vuelos/coches, resuelve emergencias, da info práctica, acompaña en ruta.
- **Flujo ruta**: destino + días → Salma puede hacer 1 pregunta para personalizar → genera guía → guardar/compartir
- **Flujo servicios**: restaurante/hotel/grúa/embajada → actúa INMEDIATAMENTE, sin preguntar. Dato primero.
- **Historial**: se limpia después de cada guía. Últimos 20 turnos se envían al Worker.
- **Personalidad**: andaluza suave, fan de Extremoduro, directa, con opinión propia, siempre tutea, multiidioma

### Modelos IA

| Contexto | Modelo | API | Cuándo |
|----------|--------|-----|--------|
| Chat principal | Claude Sonnet `claude-sonnet-4-6` | Anthropic | Siempre para conversación |
| Fotos/visión | Claude Sonnet `claude-sonnet-4-6` | Anthropic | Cuando el usuario envía foto |
| Enrich (Pass 2) | GPT-4o-mini | OpenAI | Background tras guardar ruta |
| Bloques rutas largas (>7 días) | GPT-4o-mini | OpenAI | Planificación + generación por bloques |
| Narrador | GPT-4o-mini | OpenAI | Narración de POIs cercanos |
| Admin (test/fix prompt) | GPT-4o-mini | OpenAI | Panel admin |
| KV nivel 1-2 (scripts) | Claude Sonnet | Anthropic | Generación local puntual |
| KV nivel 2.5 (scripts) | Claude Haiku | Anthropic | Generación local puntual |

### Prompt — 12 bloques, 3 variantes

**Bloques:**
1. `BLOQUE_IDENTIDAD` — andaluza, tutea, multiidioma
2. `BLOQUE_PERSONALIDAD` — directa, Extremoduro, anti-sexismo
3. `BLOQUE_MULETILLAS` — expresiones andaluzas (máx 1 cada 8-10 msg)
4. `BLOQUE_ANTIPAJA` — frases prohibidas, test de utilidad MAL/BIEN
5. `BLOQUE_GEOGRAFIA` — geografía avanzada: clima, fronteras, ferries, multimodal
6. `BLOQUE_ACCION` — 6 tipos de acción + SALMA_ACTION + "dato primero"
7. `BLOQUE_FORMATO` — solo saltos de línea + negritas. Sin viñetas ni headers
8. `BLOQUE_NOTAS` — guardar_nota trigger
9. `BLOQUE_RUTAS` — SALMA_ROUTE_JSON, 4-7 paradas/día, orden geográfico (solo en ROUTE)
10. `BLOQUE_MAPA` — GPS, herramientas, URLs, apps transporte
11. `BLOQUE_VISION` — análisis de fotos + FOTO_TAG
12. `BLOQUE_FORMATO_PLAN` — override para formato días+destino

**3 prompts ensamblados:**
- `SALMA_SYSTEM_CHAT` — todo menos RUTAS y FORMATO_PLAN
- `SALMA_SYSTEM_PLAN` — FORMATO_PLAN primero + todo menos RUTAS
- `SALMA_SYSTEM_ROUTE` — todo incluyendo RUTAS

### 8 Tools

| Tool | Backend | Función |
|------|---------|---------|
| `buscar_vuelos` | Duffel API | Vuelos con rango de fechas, top 5, link Skyscanner |
| `buscar_hotel` | Booking.com (RapidAPI) | Hoteles por ciudad, top 5, filtro presupuesto. Apartments→Airbnb link |
| `buscar_coche` | Booking.com (RapidAPI) | Alquiler de coches. Tabla proveedores (Europcar, Hertz, Sixt, Avis...) |
| `buscar_lugar` | Google Places Text Search + Details | Restaurantes, farmacias, museos... Top 5 con teléfono, dirección, Maps link |
| `buscar_foto` | Google Places Photos | Hasta 3 fotos por lugar |
| `buscar_web` | Brave Search + scraping top 2 URLs | 5 resultados con título, snippet, URL + contenido (3000 chars) |
| `generar_video` | Local | Devuelve parámetros para slideshow Canvas en frontend |
| `guardar_nota` | Local + Firestore (vía frontend) | Tipos: general, recordatorio, hotel, vuelo, restaurante, lugar, visado, transporte |

### Verify (Google Places)

Post-procesado que corrige cada parada de una ruta generada:
- Find Place + Place Details en paralelo (lotes de 5)
- Calcula centro de ruta + radio dinámico (max dist × 1.5, mín 50km)
- Valida: distancia desde centro, overlap de nombre, distancia desde coords originales (<15km)
- Si válido → corrige: lat/lng, photo_ref, nombre, verified_address, horarios
- Si inválido → mantiene datos originales de Claude sin tocar
- **NUNCA** sobrescribe: narrative, context, food_nearby, local_secret, alternative

### Endpoint y config

- **Endpoint**: `https://salma-api.paco-defoto.workers.dev` (POST)
- **Regla de prioridad**: rutas → puede preguntar 1 vez. Todo lo demás → actúa directo.
- **Deploy**: `wrangler deploy` desde `worker/`

---

## Worker Cloudflare — Endpoints completos

### Archivo: `worker/salma-worker.js` (~316KB)

| Método | Ruta | Función |
|--------|------|---------|
| POST | `/` | **Chat principal** — streaming SSE con Claude Sonnet |
| GET | `/photo` | Proxy fotos Google Places (por `ref` o `name`+coords, con `?json=1`) |
| GET | `/photo/*` | Servir fotos desde R2 (1 año caché) |
| POST | `/upload-photo` | Subir foto a R2 (max 5MB) |
| POST | `/upload-gallery-photo` | Subir foto galería a R2 (max 6MB) |
| POST | `/delete-photo` | Borrar foto de R2 por key |
| POST | `/upload-doc` | Subir documento/avatar a R2 (max 10MB) |
| POST | `/delete-doc` | Borrar documento de R2 |
| GET | `/doc/*` | Servir documento desde R2 |
| GET | `/place-details` | Google Place Details por `place_id` (nombre, rating, horarios, foto) |
| GET | `/directions` | Google Directions API proxy (polyline, legs, optional steps) |
| GET | `/practical-info` | KV lookup `dest:{cc}:practical` por country code |
| GET | `/nearby-pois` | Google Places nearby (tourist attractions/museums/churches/parks) |
| POST | `/narrate` | GPT-4o-mini narra un POI en 2-3 frases (personalidad Salma) |
| POST | `/enrich` | Enriquecimiento Pass 2: GPT-4o-mini rellena context/food/sleep/eat en paralelo + KV 2.5 |
| POST | `/create-payment` | Stripe PaymentIntent (starter €4.99, viajero €9.99, explorador €19.99) |
| POST | `/sos` | SMS emergencia via Twilio (rate limited: 3/IP/10min via KV) |
| POST | `/tts` | ElevenLabs TTS (voz `fzAdMudUtRHNnk5tjJRR`, max 1500 chars) |
| POST | `/pin` | Identificar lugar por foto con Claude Vision |
| POST | `/ga4` | Proxy Google Analytics 4 Data API (admin) |
| POST | `/admin-chat` | Chat admin con GPT-4o-mini (admin) |
| GET | `/admin/verify-place` | Debug manual del verify de una parada contra Google Places (admin) |
| GET | `/health` | Health check de todos los servicios (admin) |
| GET | `/version` | Version ID del despliegue (publico, sin token) — para saber que worker corre |
| GET | `/sitemap.xml` | Sitemap index (1h caché) |
| GET | `/sitemap-guides.xml` | Sitemap dinámico de guías públicas desde Firestore |
| GET | `/weather` | Proxy clima (OpenWeatherMap, fallback wttr.in) para el copiloto/mapa |
| GET | `/staticmap` | Proxy Google Static Maps (evita CORS) — fondo del story del diario |
| GET | `/transport` | KV lookup `transport:{cc}` — apps de transporte por país |
| GET | `/roads/resolve` | Geometría real de carretera (OSM, vía `road-resolver.js`) — caché en KV `ROAD_GEOM` |
| POST | `/translate` | Traducción de texto para `translator.js` (traductor push-to-talk) |
| POST | `/tts-google` | TTS alternativo (Google) — junto a `/tts` (ElevenLabs) |
| POST | `/historia-lugar` | Historia de un lugar/país (Claude Haiku + foto Google Places), caché KV 30 días |
| POST | `/whatsapp` | Webhook Twilio WhatsApp (F5.1 — eco, sin IA todavía, ver 📱 Salma en WhatsApp) |
| POST | `/stripe-webhook` | Confirma pago Stripe server-side (`checkout.session.completed`), firma verificada |
| GET | `/flight-places` | Autocomplete de aeropuertos/ciudades para Vigilancia de Vuelos |
| GET/POST/DELETE | `/flight-watches` | CRUD de vigilancias de precio de vuelo (Firestore `flight_watches` + índice KV `fw:{uid}`) |
| PUT | `/flight-watches/pause` | Pausar/reanudar una vigilancia |
| GET | `/flight-alerts` | Alertas de bajada de precio/presupuesto alcanzado (KV `fw_alerts:{uid}`) |
| PUT | `/flight-alerts/mark-seen` | Marcar alerta como vista |
| POST | `/perfil-ia-extract` | Extrae hasta 3 datos nuevos del perfil de viajero (GPT-4o-mini) tras guardar una ruta — requiere login |
| POST | `/beta-feedback` | Feedback de testers desde el panel 🐛: nota + logs → Firestore `beta_feedback` + aviso a Paco por WhatsApp |

**Nota de este barrido (16 sept 2026):** esta tabla llevaba sin auditar contra el código real desde el 10 sept — faltaban 15 endpoints que ya existen y están desplegados (Vigilancia de Vuelos completa, WhatsApp, Stripe webhook, roads/resolve, weather, transport, translate, tts-google, historia-lugar, admin/verify-place). Ver también "🧠 KV — situación real" más abajo para el resto de hallazgos de este barrido.

### Flujo del chat principal (POST /)

**Pre-procesado (antes de llamar a Claude):**
1. Detección de saludo puro → respuesta enlatada (0 tokens)
2. Pre-fetch Brave Search en paralelo si transporte
3. Nominatim reverse geocoding GPS → ciudad + país (caché KV 24h)
4. `isHelpRequest()` → 8 categorías: salud, vehículo, seguridad, dinero, comida, logística, transporte, comunicación, clima
5. Clima: OpenWeatherMap primary, wttr.in fallback
6. Búsqueda de ayuda: Google Places Text Search → Details top 3
7. Transporte: Brave Search para URLs reales de booking
8. Eventos: Serper.dev si hay `travelDates`
9. KV lookup paralelo: `dest:{cc}:base`, `spot:{name}`, `transport:{cc}`, `route:{cc}:{dest}:{days}`
10. KV ruta cacheada → si calidad ≥3 stops/día, devuelve directo (coste 0)
11. `tryKVDirectAnswer()` → respuestas instantáneas para: visados, vacunas, moneda, enchufes, seguridad, mejor época, presupuesto, idioma, emergencias, capital, prefijo, apps transporte, conducción, agua, propinas, SIM, salud

**Selección de prompt:**
- "hazme una guía" / "salma hazme una guía" → `SALMA_SYSTEM_ROUTE`
- N días + destino → `SALMA_SYSTEM_PLAN`
- Todo lo demás → `SALMA_SYSTEM_CHAT`

**SSE streaming — tipos de evento:**

| Campo | Significado |
|-------|-------------|
| `{t: "chunk"}` | Texto streaming |
| `{k: 1}` | Keepalive (cada 3s en verificación) |
| `{searching: true}` | Tool ejecutándose |
| `{generating: true}` | Generando JSON de ruta |
| `{draft: true, route}` | Ruta borrador pre-verify |
| `{verified: true, route}` | Verificación Google completada |
| `{plan: blocks[]}` | Plan de bloques (rutas >7 días) |
| `{draft_block: N, route_partial}` | Bloque parcial listo |
| `{verified_block: N, route_partial}` | Bloque verificado |
| `{save_nota: true, nota_data}` | Auto-guardar nota |
| `{tool_note: true, summary, country_hint}` | Nota auto desde tool |
| `{photo_url: "url"}` | URL persistente R2 de foto subida |
| `{action_results: [...]}` | Resultados de tools (flights/hotels/places) |
| `{done: true, reply, route, video_params}` | Stream completado |

---

## API Keys / Secrets (15 servicios)

Todos en Cloudflare Worker secrets (`wrangler secret put`).

| Secret | Servicio | Uso |
|--------|----------|-----|
| `ANTHROPIC_API_KEY` | Claude Sonnet | Chat principal + visión |
| `OPENAI_API_KEY` | GPT-4o-mini | Enrich, bloques, narrador, admin |
| `GOOGLE_PLACES_KEY` | Google Places/Maps/Directions | Verify, búsquedas, fotos, directions |
| `BRAVE_SEARCH_KEY` | Brave Search | buscar_web tool + transporte |
| `DUFFEL_ACCESS_TOKEN` | Duffel | buscar_vuelos |
| `RAPIDAPI_KEY` | Booking.com | buscar_hotel + buscar_coche |
| `ELEVENLABS_API_KEY` | ElevenLabs | TTS endpoint |
| `SERPER_API_KEY` | Serper.dev | Búsqueda de eventos |
| `OPENWEATHER_KEY` | OpenWeatherMap | Clima (fallback: wttr.in) |
| `STRIPE_SECRET_KEY` | Stripe | PaymentIntents |
| `TWILIO_ACCOUNT_SID` | Twilio | SOS SMS |
| `TWILIO_AUTH_TOKEN` | Twilio | SOS SMS |
| `TWILIO_PHONE_NUMBER` | Twilio | SOS sender number |
| `ADMIN_TOKEN` | Worker admin | Endpoints /health, /admin/*, /ga4 |
| `GA4_CREDENTIALS` | Google Analytics 4 | Service account JSON |

**Client-side (públicas, en el código):**
- Google Maps JS key: `AIzaSyCtNPO5QVnLpHPkaJraQM0M71RXqAJ6L4U` (en index.html + mapa-ruta.js)
- Stripe publishable key: `pk_test_51TEhUf...` (en app.js — modo test)
- Firebase config: apiKey, authDomain, projectId (en index.html)

**Copias locales (api/ carpeta, gitignored, NUNCA en git):**
- `api/API SALMA VUELA.txt` — Duffel live key
- `api/OPEN AI.txt` — OpenAI key
- `api/acceso web salma.txt` — Brave Search key
- `api/rapid api.txt` — RapidAPI key
- `api/salma voice.txt` — ElevenLabs key

---

## KV — Base de conocimiento por país

**2 namespaces** (confirmado 16 sept 2026 vía API de Cloudflare — coinciden con `worker/wrangler.toml`, sin drift):

| Binding | ID | Contenido |
|---------|-----|-----------|
| `SALMA_KB` | `b2056c0613d94feb955b92279ba02fb6` | Todo lo de abajo — países, spots, rutas, cachés, vigilancia de vuelos |
| `ROAD_GEOM` | `39ff0d3316ab43d9b78f1f14b746e5ad` | Geometría real de carreteras (OSM) para `/roads/resolve`, clave `road_geom:v1:{cc}:{slug}` — namespace propio a propósito, pensado para poder compartirse con una futura app aparte sin migración |

### Estructura de claves — `SALMA_KB`

| Patrón | Nivel | Contenido | Cobertura |
|--------|-------|-----------|-----------|
| `dest:{cc}:base` | 1 | Datos base país (moneda, idioma, visados, seguridad) | 193 países |
| `dest:{cc}:destinos` | 2 | Top destinos, qué hacer, qué comer, transporte, cultura | 193 países |
| `dest:{cc}:practical` | 2.5 | Frases, emergencias, apps, salud, conectividad, kit, presupuesto | 193 países |
| `transport:{cc}` | — | Apps transporte (ride-hailing, tren, metro/bus, ferry, especial) | 193 países |
| `spot:{slug}` | — | POI individual (lat/lng, photo_ref, verified_address) | Variable |
| `spotcache:{variant}` | — | Caché auxiliar de resolución de spot por variante de nombre | Dinámico |
| `kw:{keyword}` | — | Índice ciudad→código ISO país | Miles |
| `route:{cc}:{dest}:{days}` | 3 | Rutas pre-generadas con paradas y coords (30 días TTL) | Algunos destinos |
| `verifiedspot:{país}:{nombre}` | — | Caché de verify Google Places entre rutas de usuarios distintos (30 días TTL) — fix de coste del 15 sept | Dinámico |
| `placedetails:{place_id}:{fields}` | — | Caché de Place Details (teléfono/web) por lugar (30 días TTL) — fix de coste del 15 sept | Dinámico |
| `nearbycache:{type}:{lat}:{lng}` | — | Caché Nearby Search por tipo + celda ~1km (7 días TTL) — fix de coste del 15 sept | Dinámico |
| `geo:{lat}:{lng}` | — | Caché reverse geocoding (24h TTL) | Dinámico |
| `geocity:{word}` | — | Caché Nominatim ciudad→país (30 días TTL) | Dinámico |
| `geocity:anchor7:{norm}` | — | Caché de geocodificación de ancla de ruta (7 decimales) | Dinámico |
| `historia:{slug}` / `historia:{slug}:{lat}:{lng}` | — | Caché de `/historia-lugar` (30 días TTL) — con bucket GPS desde el fix del 14 sept | Dinámico |
| `_cache:prompt` | — | Caché prompt Firestore (5 min TTL) | 1 clave |
| `_index:countries` | — | Índice de países con fecha de última generación — lo usa el cron de los lunes | 1 clave |
| `_index:routes` | — | Índice de rutas nivel 3 ya generadas — lo usa el cron de los miércoles | 1 clave |
| `_sa_token` | — | Token de acceso cacheado de alguna integración con service account (TTL 3300s) | 1 clave |
| `sos_rate:{ip}` | — | Rate limiting SOS (10 min TTL) | Dinámico |
| `fw:{uid}` | — | Vigilancias de vuelo activas de un usuario (Vigilancia de Vuelos) | Por usuario |
| `fw_alerts:{uid}` | — | Alertas generadas (bajada de precio / presupuesto alcanzado) | Por usuario |
| `flight_watch_users` | — | Lista de UIDs con alguna vigilancia activa — la recorre el cron diario | 1 clave |

### ⏰ 2 crons del Worker (`worker/wrangler.toml` → `[triggers]`) — el de rutas nivel 3 se eliminó el 17 sept 2026

El Worker tiene `scheduled()` en `salma-worker.js` con 2 disparos automáticos, ya desplegados y corriendo en producción ahora mismo, sin que nadie los active a mano:

| Cron (UTC) | Qué hace | Llama a una API de pago |
|---|---|---|
| Lunes 4:00 | Regenera hasta 5 fichas nivel 1 (`dest:{cc}:base`) caducadas (>180 días) | **Sí — GPT-4o-mini**, ~5 llamadas/semana, coste marginal (céntimos) |
| Diario 6:00 | `_cronFlightWatches` — recorre `flight_watch_users`, comprueba precio actual de hasta 20 vigilancias de vuelo activas y crea alerta si baja >15% o entra en presupuesto | **Sí — Duffel API**, hasta 20 búsquedas de vuelo/día, automático, sin que el usuario pida nada en ese momento |

**Por qué el de vuelos se dice aquí y no se toca:** no aparecía mencionado en ningún sitio de este archivo hasta el barrido del 16 sept — es un gasto recurrente diario en Duffel que corre solo, y la norma de "cualquier cosa que pueda mover la factura, se dice" aplica igual a algo que ya existía y no se sabía que existía. Nadie ha tocado su código.

**Cron de rutas nivel 3 (miércoles 4:00) — ELIMINADO el 17 sept 2026, con OK de Paco.** Comprobado con `_index:routes` (no existía en el KV): **nunca llegó a generar ni una sola ruta en producción**, a pesar de llevar desplegado desde antes de esta sesión. Causa encontrada en el código: escaneaba `env.SALMA_KB.list({ prefix: 'dest:', limit: 500 })` para encontrar países con destinos, pero con >3.000 claves reales bajo ese prefijo (bases + destinos + prácticos + spots de 193 países), el límite de 500 solo alcanzaba a ver ~30 países por orden alfabético — nunca llegaba ni a la mitad del abecedario. Además, igual que el resto de generación nivel 3, no verificaba coordenadas con Google Places (solo comprobaba que no fueran `0,0`) — menos calidad que una ruta real de chat. Decisión: en vez de arreglar este cron (limit + verificación), se sustituye por el proceso manual controlado que genera y verifica rutas nivel 3 país por país (ver [[project_kv_estado]] en memoria) — evita el mismo problema de raíz de abril (dos escritores automáticos distintos tocando la misma clave `route:*` sin coordinarse).

### Scripts de generación (`worker/kv/`)

| Script | Modelo | Output | Coste aprox |
|--------|--------|--------|-------------|
| `generate.js` | Claude Sonnet | Nivel 1 — `dest:{cc}:base` + `kw:*` | ~$0.90 / 193 países |
| `generate-nivel2.js` | Claude Sonnet | Nivel 2 — `dest:{cc}:destinos` | ~$2.50 / 193 países |
| `generate-nivel25.js` | Claude Haiku | Nivel 2.5 — `dest:{cc}:practical` | ~$1.20 / 193 países |
| `generate-nivel3.js` | GPT-4o-mini (cron) | Nivel 3 — `route:{cc}:{dest}:{days}` | ~$0.06 / ruta |

**Otros scripts KV:** `upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`, `upload-spots-bulk.cjs`, `upload-transport.js`, `upload-wrangler.js`, `enrich-spots.cjs`, `stats.js`, `stats-nivel2.js`

### Situación real verificada 16 sept 2026 (esta sesión, sin tocar código ni desplegar nada)

- **No se han leído claves ni valores reales del KV** — el conector de Cloudflare disponible en esta sesión solo gestiona namespaces (crear/listar/borrar), no tiene una herramienta para leer/listar claves concretas dentro de un namespace, y esta sesión no tiene credenciales de `wrangler login` ni un `CLOUDFLARE_API_TOKEN` en el entorno para usar la CLI directamente. Para saber cuántas de las 193 fichas están realmente pobladas (nivel 1/2/2.5) o cuántas rutas nivel 3 hay cacheadas de verdad, hace falta `npx wrangler kv key list --binding=SALMA_KB --remote -c wrangler.toml` desde un sitio con esas credenciales (portátil de Paco, o una sesión sin este bloqueo).
- **Sí se ha confirmado, vía la API de Cloudflare, que los 2 namespaces (`SALMA_KB`, `ROAD_GEOM`) existen y sus IDs coinciden exactamente con `wrangler.toml`** — no hay namespace huérfano ni desalineado.
- **Sí se ha confirmado, comparando el código fuente que Cloudflare devuelve del Worker desplegado contra `salma-worker.js` de esta rama (equivalente al `main` de hoy), que el contenido coincide** — se buscaron marcadores específicos del último fix de facturación (15 sept, `photocache/`, `verifiedspot:`, `opts.previousStops`, `nearbycache:`) y los 4 están presentes en el Worker en producción. No se ha podido comparar el `Current Version ID` exacto (ese dato solo lo expone `/version` en tiempo de ejecución, y la red de este contenedor sigue bloqueando `salma-api.paco-defoto.workers.dev`, mismo bloqueo ya documentado el 14 sept) — pero a nivel de código, **lo desplegado y lo que hay en el repo hoy son lo mismo**. Esto responde a varios "pendiente: confirmar `/version`" que quedaban sueltos en el 🔴 Crítico de la factura de Google Places.
- **Los 15 endpoints nuevos y las claves de Vigilancia de Vuelos (`fw:`, `fw_alerts:`, `flight_watch_users`) y del cron diario de Duffel llevaban invisibles en este archivo** desde que se implementaron — no se ha encontrado ningún commit que los documentara aquí. Añadidos en este barrido (ver tablas de arriba).

### 🔍 Reconstruido 16 sept 2026: qué pasó con la subida de KV de abril ("se borró todo a los 30 días")

Paco recordaba haber subido nivel 1+2+3 en abril y haber perdido todo a los 30 días — un coste
real de generación tirado. Este contenedor tenía un **clon `shallow` de git que cortaba justo
antes de abril** (el primer commit visible era del 25 de abril); se arregló con
`git fetch --unshallow origin` para poder mirar el historial completo. Con eso, esto es lo que
sale del código real, no de memoria:

- **Nivel 1/2 (`dest:{cc}:base` / `:destinos`)**: revisados **todos** los scripts de subida que
  han existido en el repo (`upload-kv.js`, `upload-kv-nivel2.js`, `upload-all-kv.cjs`,
  `upload-wrangler.js`, `scripts/progressive-load.js`) — **ninguno, nunca, les ha puesto
  caducidad.** Si estos también se perdieron, no fue por TTL — solo se confirma mirando el KV
  real.
- **Nivel 3 (`route:{cc}:{región}:{días}`) — sí hay una causa concreta y verificada por código**:
  hay dos caminos distintos que escriben la MISMA clave:
  1. El pipeline masivo (`scripts/progressive-load.js`) sube con `wrangler kv bulk put`
     **sin ninguna caducidad** — permanente por diseño.
  2. El motor de chat en vivo — desde el primer commit que metió caché de rutas
     (`21bf3e97`, **25 marzo 2026**, sigue igual hoy) — cada vez que una ruta generada en el
     chat (o el cron de los miércoles, `_cronNivel3`) coincide con esa misma clave, la
     reescribe con `expirationTtl: 2592000` (30 días), **a propósito**, para que el caché de
     uso normal no se quede rancio.
  Si una clave subida permanente por el camino 1 se vuelve a tocar por el camino 2 (alguien
  pide esa misma ruta en el chat, o el cron de los miércoles la regenera sin saber que ya
  existía — su índice `_index:routes` nunca se entera de lo que sube el pipeline masivo), pasa
  de permanente a caducar en 30 días **sin que nadie lo decidiera**. Encaja con lo que describe
  Paco.
- **La red de seguridad que se construyó para esto nunca llegó a producción.** El 12 de abril
  2026 se montó un sistema completo de backup (cron semanal Worker→R2 de todo el KV, script
  manual `backup-kv.js`, restauración documentada) — commit `74b3ee26`, en la rama
  `claude/brave-satoshi`. **Esa rama nunca se fusionó a `main`** (confirmado con
  `git merge-base --is-ancestor` — no es ancestro). Hoy no existe ni el fichero
  `backup-kv.js` ni el cron de backup ni `_cronBackup` en `salma-worker.js` — comprobado en el
  código actual. Si el nivel 3 se perdió en abril, no había ninguna copia de seguridad real
  corriendo que lo hubiera evitado, y **sigue sin haberla hoy**.

**Pendiente de decidir con Paco**: revisar y traer `claude/brave-satoshi` a `main` antes de
subir países otra vez (para tener red de seguridad real esta vez), y separar las dos vías que
escriben `route:` — o el pipeline masivo usa un prefijo/clave distinto al del chat en vivo, o
se le añade el mismo `_index:routes` para que el cron y el chat sepan "esto ya está subido
permanente, no lo toques".

### 📦 16 sept 2026 — Dos ramas huérfanas con datos KV reales, recuperables, sin fusionar

Buscando qué se podía recuperar de lo perdido en abril, salió una **tercera rama** que nadie
había mencionado hasta ahora, con contenido real y completo:

- **`claude/priceless-shannon`** (commit `2ca8c901`, **3 abril 2026**, no es ancestro de
  `main`) — `worker/kv/output-nivel2/` con **los 193 países completos** (destinos, spots,
  keywords, transporte por país), más su propio script de subida (`upload-nivel2-now.mjs`)
  y una suite de tests (`test-suite.js`, `test-salma.js`). Confirmado con
  `git log --all --diff-filter=D` que **nunca se ha borrado ni un solo fichero de esa
  carpeta en ninguna rama** — está exactamente como se dejó ese día.
- **`claude/brave-satoshi`** (commit `38175703`, 12 abril, ver más arriba) — además del
  sistema de backup, trae `worker/kv/transport-routes/{es,th,np,vn}.json` (68 rutas + 21
  aeropuertos verificados) intactos, con `upload-transport-routes.js`.
- **Lo que NO aparece en ninguna rama, nunca**: nivel 1 (solo Vietnam en todo el historial)
  y nivel 3 más allá de las 11 rutas de Nepal que ya hay en `main`. Si se generó más de
  esto y no se comiteó, no hay copia en git — solo podría estar en un backup del Desktop
  de Paco, fuera del repo.

**Plan propuesto (sin ejecutar, pendiente de que Paco lo revise desde su ordenador)**: no
fusionar las ramas enteras (arrancan de puntos de `main` muy viejos, chocarían con medio año
de rediseños) — traer solo los JSON de datos a la carpeta `worker/kv/` de hoy
(`git checkout <rama> -- worker/kv/output-nivel2/` y lo mismo con `transport-routes/`) y
subirlos con los scripts de subida, revisando antes que esos scripts solo escriben en KV
(gratis) y no disparan de paso ninguna llamada a Google Places/Anthropic/OpenAI (ver norma de
coste del punto 8 del protocolo antes de ejecutar cualquier subida).

**Paco decidió (16 sept) aparcar esto hasta tener el ordenador delante** — no investigar más
por ahora. Retomar cuando lo pida, empezando por esta sección en vez de desde cero.

**JSONs de respaldo en `worker/kv/`:** `countries.json` (195 países base), `_index.json`, `_nivel2_1.json`

El worker inyecta datos KV en el contexto de Claude → menos tokens, más rápido, más barato.

---

## Design System (styles.css)

### Variables CSS (`:root`)
```css
--negro: #060503;
--dorado: #f0b429;
--dorado2: #ffc947;
--crema: #f5f0e8;
--blanco: #fff;
--gris: #141209;
--gris2: #1e190f;
--linea: rgba(240,180,41,.22);
--linea-fuerte: rgba(240,180,41,.45);
--rojo: #ef4444;
--verde: #4ade80;

--font-display: 'Bebas Neue';
--font-body: 'Inter';
--font-tight: 'Inter Tight';
--font-mono: 'JetBrains Mono';

--radius: 14px;
--radius-sm: 10px;
--radius-pill: 999px;
```

### Estructura visual
- `.app-header` — fijo top 56px, glass (`backdrop-filter:blur(12px)`)
- `.app-content` — `padding-top:56px; padding-bottom:80px`
- `.app-input-bar` — fijo bottom 56px, glass, z-index 1100
- `.chat-bg-layer` — fondo mapa con overlay oscuro
- Bottom bar — 4 tabs con iconos SVG inline

---

## SEO — 3 niveles

### 1. Guías públicas (dinámicas)
- Cada guía guardada → `public_guides/{slug}` en Firestore
- URL: `borradodelmapa.com/ruta-2-dias-cadiz-xxxx`
- `404.html` las renderiza (sin backend) — incluye chat inline con Salma
- CTA: "Viaja con alguien que sabe lo que hace"
- OG meta tags dinámicos desde Firestore
- Sitemap dinámico en el worker (`/sitemap-guides.xml`)

### 2. Blog (12 artículos)
- `/blog/` con index + artículos standalone
- Tono Salma, estructura "Sin Salma" (caótico) vs "Con Salma" (resuelto)
- Schema.org Article en cada uno
- CTA "Pregúntale a Salma" → `/?go=chat`
- Artículos: sin-hotel, pasaporte-robado, idioma, avería, vuelo-cancelado, enfermo-extranjero, perder-avion, robo-tarjeta, viajar-solo, presupuesto-real, maleta-perfecta, seguro-de-viaje

### 3. Destinos (1793 páginas)
- `/destinos/` con páginas HTML estáticas por destino
- Generadas con `scripts/build-destinos.js` desde KV nivel 2
- 301 en sitemap (estratégicos), resto indexable pero fuera del sitemap
- Chips featured en welcome controlados por Paco

### Pipeline SEO (`scripts/`)
- `build-destinos.js` — genera HTML desde KV JSONs. Flags: `--country`, `--dry-run`
- `grow-sitemap.js` — añade N países al sitemap por prioridad turística. Default: 5
- `publish-destinos-salma.js` — publica rutas KV como guías públicas en Firestore (⚠ tiene credenciales hardcoded)
- `progressive-load.js` — orquestador: genera nivel2 → nivel3 → HTML → publica → sitemap → KV

### Sitemap
- `sitemap.xml` → sitemap index en el dominio
- `sitemap-static.xml` (2 URLs), `sitemap-blog.xml` (13 URLs), `sitemap-destinos.xml` (301 URLs)
- Worker sirve `sitemap-guides.xml` con guías públicas dinámicas
- `robots.txt` → apunta a `borradodelmapa.com/sitemap.xml`

---

## Modelo de negocio — Salma Coins

- **Plan gratuito**: 3 rutas con IA (para siempre), 20 mensajes/día
- **Salma Coins**: créditos que NO caducan, reembolsables si no se usan
- **Packs**: Starter (10 / 4,99€), Viajero (25 / 9,99€), Explorador (60 / 19,99€)
- **Costes**: vuelos (1), hoteles (1), ruta IA (2), copiloto (3), emergencia (2), resumen (1)
- **Stripe**: Checkout funciona (modo test). PENDIENTE: webhook server-side + pasar a live
- **Coste real por ruta**: ~0.015€ (margen ~97%)
- **Validación**: coins se envían desde frontend, Worker NO valida server-side

---

## UI actual

- **Welcome**: "Viaja con alguien que sabe lo que hace", input con placeholder rotativo, chips (rutas guardadas o featured), recordatorios de notas
- **Chat**: avatar Salma inline (20px) + nombre, texto a ancho completo, cámara, voz, retry 18s
- **Bottom bar**: Ayuda (abre el panel de feedback de testers, con latido, 21 sept 2026), Chat, Rutas (requiere login), Perfil (Entrar si no logueado). Nota: esta lista llevaba tiempo desactualizada (mencionaba "Home" en vez de la pestaña real "Consultas", que existió hasta el 21 sept) — corregido en este barrido contra `app.js:updateBottomBar()`.
- **Perfil**: avatar subible (R2), stats (coins, rutas gratis, total guías)
  - TU VIAJE: Mis Notas, Galería, Cuaderno de Viaje, Documentos del Viajero
  - SEGURIDAD: SOS Emergencia (configurable, SMS Twilio + WhatsApp, cola offline)
  - CUENTA: Salma Coins, ¿Qué puedo hacer?
- **Mapa live**: Google Maps fullscreen, GPS, brújula, capas POI (restaurantes/farmacias/hoteles/súpers/parques/cultura/tránsito), tipos de mapa, diario Kodak, pins, compartir
- **Vista itinerario**: fullscreen con tarjetas de paradas + mapa de ruta + turn-by-turn + enrichment Places
- **Copiloto**: tarjeta info práctica del país activada por geoloc (emergencias, frases, apps, salud, conectividad)
- **Footer legal**: Destinos (dorado), Blog, Aviso legal, Privacidad, Cookies, Términos

---

## Features implementadas — Inventario completo

### Chat y conversación
- [x] Streaming SSE con Claude Sonnet
- [x] Historial de conversación (últimos 20 turnos)
- [x] Detección de intención de ruta (regex: días, fechas, transporte, niños)
- [x] Pre-pregunta de fechas antes de generar ruta
- [x] Rate limiting client-side (10 msg/60s)
- [x] Retry automático a los 18s
- [x] Sanitización de URLs (whitelist de ~50 dominios)
- [x] Formateo: negritas, enlaces, teléfonos, imágenes

### Rutas y guías
- [x] Generación de rutas con Claude Sonnet
- [x] Verificación con Google Places (coords, fotos, nombre)
- [x] Rutas largas (>7 días) por bloques con GPT-4o-mini
- [x] Enriquecimiento background con GPT-4o-mini (context, food, sleep, eat)
- [x] Guardar guía en Firestore + offline en localStorage
- [x] Editar guía existente via chat
- [x] Eliminar guías (Firestore + public_guides + localStorage)
- [x] Publicar guía pública (URL compartible con slug SEO)
- [x] Vista itinerario a pantalla completa
- [x] Acordeón por días con mapa Leaflet
- [x] Fotos reales Google Places por parada (lazy load)
- [x] Google Maps links por parada y por día
- [x] KV caché de rutas pre-generadas (nivel 3)

### Mapas
- [x] Google Maps dinámico (mapa live a pantalla completa)
- [x] Leaflet como fallback
- [x] Marcadores por día con colores
- [x] Polyline de ruta (Google Directions)
- [x] Turn-by-turn navigation panel
- [x] GPS tracking con marcador azul
- [x] Brújula (DeviceOrientation, iOS permission flow)
- [x] Capas POI: restaurantes, farmacias, hoteles, supermercados, parques, cultura, tránsito
- [x] Tipos de mapa: roadmap, satélite, híbrido, terreno
- [x] Selector de ruta guardada sobre mapa live
- [x] Parada más cercana (chip dinámico por GPS)

### Diario y galería
- [x] Captura de ubicación + foto → postal Kodak (canvas 1080x1920)
- [x] Subida de fotos a R2
- [x] Galería con álbumes
- [x] Compartir via WhatsApp / Web Share API / descargar
- [x] Pins permanentes en el mapa
- [x] Bitácora agrupada por país
- [x] Timeline de días con notas y fotos por parada
- [x] Compartir redes: imagen post (1080×1350), story (1080×1920), carrusel

### Vídeo
- [x] Generador de vídeo Canvas (540x960, 30fps)
- [x] Estilo documental (título + mapa animado + fotos Ken Burns + cierre)
- [x] Estilo historia (fotos a pantalla completa)
- [x] Mapa animado con ruta y paradas

### Notas
- [x] CRUD completo en Firestore
- [x] Tipos: nota, recordatorio, hotel, vuelo, restaurante, lugar, visado, transporte
- [x] Filtro por país y tipo
- [x] Recordatorios con fecha (vencido/hoy/mañana/en N días)
- [x] Adjuntos (fotos y documentos en R2)
- [x] "Guardar nota" desde burbujas del chat (>150 chars)
- [x] Auto-guardado de notas desde tools (country notes)
- [x] Recordatorios en welcome screen (próximos 7 días)
- [x] Migración automática del formato legacy (paises → notas)

### Documentos del viajero
- [x] CRUD en Firestore (`users/{uid}/travel_docs`)
- [x] Categorías: pasaporte, DNI, visado, seguro, alquiler, transporte, otro
- [x] Subida múltiple de archivos a R2 (max 10MB)
- [x] Alertas de caducidad (vencido, crítico <30d, próximo <90d, ok)
- [x] Vista previa de imágenes y PDFs inline

### Tools (búsquedas de servicios)
- [x] Vuelos (Duffel) con link Skyscanner
- [x] Hoteles (Booking.com RapidAPI) + redirect Airbnb
- [x] Coches de alquiler (Booking.com RapidAPI)
- [x] Lugares/restaurantes (Google Places) con Maps link
- [x] Fotos de lugares (Google Places Photos)
- [x] Búsqueda web (Brave Search + scraping top 2)
- [x] Generación de vídeo
- [x] Guardado de notas

### Narrador
- [x] Chip "Narrador" en pantalla de inicio del chat, con popup explicativo antes de
      activarlo (añadido 10 sept — antes no tenía ningún botón accesible)
- [x] Check cada 30s de POIs cercanos (Google Places, radio 20m — reducido desde 500m el
      10 sept a petición de Paco)
- [x] Toast del narrador: sin auto-cierre, solo se cierra con la X (antes se cerraba solo
      a los 10s y no daba tiempo a leer — cambiado el 10 sept)
- [x] Narración con GPT-4o-mini (personalidad Salma)
- [x] Push notifications
- [x] Deduplicación por place_id/nombre
- [x] TTS con ElevenLabs / Web Speech API

### Copiloto
- [x] Detección de país por GPS (Nominatim reverse geocoding)
- [x] Info práctica del país desde KV nivel 2.5
- [x] Tarjeta colapsable: emergencias, frases, apps, salud, conectividad, presupuesto

### Voz
- [x] Input por voz (Web Speech API, es-ES, modo continuo)
- [x] Output TTS (ElevenLabs primary, Web Speech fallback)
- [x] Toggle voz on/off persistente (localStorage)

### Cámara / Fotos en chat
- [x] Cámara o galería desde el chat
- [x] Compresión local (canvas, max 10MB)
- [x] Envío a Claude Vision (base64)
- [x] Guardado persistente en R2 + Firestore galería

### Auth y perfil
- [x] Email/contraseña + Google Sign-In
- [x] WebAuthn/fingerprint (parcial — recuerda email)
- [x] Avatar subible (R2 + Firestore)
- [x] Estadísticas: coins, rutas gratis (3), total guías
- [x] SOS emergencia: 3 contactos, SMS Twilio, WhatsApp links, cola offline, rate limit
- [x] Onboarding 3 slides

### Pagos (Stripe)
- [x] 3 packs: Starter (10/4.99€), Viajero (25/9.99€), Explorador (60/19.99€)
- [x] Stripe Elements card form inline
- [x] PaymentIntent server-side
- [x] Actualización de coins en Firestore tras pago
- [ ] PENDIENTE: webhook Stripe para confirmar pago server-side

### SEO
- [x] Guías públicas por URL slug (404.html trick)
- [x] 12 artículos de blog con Schema.org
- [x] 1,793 páginas de destinos
- [x] Sitemap index con 4 sitemaps
- [x] Sitemap dinámico de guías (worker)
- [x] OG meta tags dinámicos
- [x] Chips featured en welcome

### PWA
- [x] manifest.json (standalone, portrait)
- [x] Service Worker (sin caché offline, push ready)
- [x] Instalable desde móvil

### V2 Mapa (11 abril 2026)
- [x] Norte explícito (heading:0) + anti-tilt en ambos mapas
- [x] Tap en brújula resetea norte (setHeading(0))
- [x] Brújula siempre visible al abrir mapa
- [x] Fetch directions paralelo con carga API (-200-800ms)
- [x] Preconnects para maps.googleapis.com y maps.gstatic.com
- [x] Buscador Google Places Autocomplete en diario-picker
- [x] Geocoding fallback (Enter sin seleccionar sugerencia)
- [x] Búsqueda marca lugar con pin + picker completo (FOTO/IR AQUI/GUARDAR)
- [x] Botones centrar/tipo/capas movidos al diario-picker
- [x] Botón SOS en picker — si configurado ejecuta, si no abre config
- [x] SOS como overlay encima del mapa (no cierra live-map)
- [x] Paneles tipo/capas se cierran al cerrar picker
- [x] Botón I'M FINE (verde, tick) sustituye FOTO+GALERIA
- [x] I'M FINE abre menú Cámara/Galería
- [x] Pins guardados persisten en Firestore (carga al abrir mapa)
- [x] Eliminar pin borra de Firestore
- [x] Pins con marker grande tipo gota dorada
- [x] Popup pin: Ir aquí + Compartir + Eliminar
- [x] Compartir: "Estoy muy bien!!! Mira donde estoy!!!" + Google Maps + borradodelmapa.com
- [x] Story: logo BORRADO(negro)DEL(dorado)MAPA(negro)
- [x] Story: fondo mapa terrain via worker proxy /staticmap
- [x] Endpoint /staticmap en worker (proxy Google Static Maps, evita CORS)
- [x] Dark theme para .pac-container (Autocomplete)

---

## Pendiente / Problemas conocidos

> **Este es el único archivo de pendientes del proyecto — no crear otro.** Auditado contra
> el código real (no contra memoria ni contra lo que decía esta lista antes) el 10 sept
> 2026, porque el trabajo se pide unas veces por Code y otras por chat normal y esta lista
> llevaba tiempo sin coincidir con lo que hay realmente desplegado. Ver "Metodología y
> límites" al final de esta sección antes de fiarte de que está completa.
>
> **Cuando Paco diga "anota esto pendiente" (o algo parecido):** añadirlo aquí mismo, en
> el subapartado que corresponda (🔴 Crítico / 🟡 Importante / 🔧 Deuda técnica), hacer
> `commit` y `push` **directo a `main`** antes de terminar el turno — no dejarlo en una
> rama suelta que no se fusiona. Solo funciona si la sesión tiene este repo enlazado
> (Code/Cowork); un chat normal sin el repo no puede tocar este archivo, así que si el
> pendiente surgió ahí hay que traerlo a mano a una sesión con el repo. Esto es justo lo
> que causó el desfase que motivó el barrido del 10 de septiembre — no repetirlo.

### 📱 Salma en WhatsApp (F5)

- **14 sept 2026: Paco trae los primeros documentos de diseño para llevar a Salma a
  WhatsApp como canal adicional (no sustituye la web).**
  **F5.1 (webhook de eco) — FUSIONADO Y DESPLEGADO (14 sept), sin confirmar en
  pantalla/WhatsApp por Paco todavía.**
  Endpoint nuevo `POST /whatsapp` en `worker/salma-worker.js` (junto al bloque `/sos`,
  mismo patrón de llamada a la API de Twilio que ya usa el SOS): parsea el payload
  `application/x-www-form-urlencoded` de Twilio (no JSON), valida la firma
  `X-Twilio-Signature` (HMAC-SHA1 con `TWILIO_AUTH_TOKEN`, algoritmo verificado contra
  el vector de prueba oficial de la documentación de Twilio antes de dar el código por
  bueno) y responde con un eco fijo. Sin IA, sin Firestore todavía — es justo el
  alcance de F5.1, validar que la tubería Twilio → Worker → respuesta funciona de
  extremo a extremo.
  **Desplegado 14 sept 2026 ~21:15 UTC vía GitHub Action "Deploy Worker" (run #13,
  commit `4a1aea0`). `Current Version ID: 65fb5bfa-c2a9-4ed0-a996-332dd2bfeda3`** — leído
  directo del log del deploy; esta sesión no pudo confirmarlo además contra `/version`
  porque el proxy de red del contenedor bloquea las llamadas salientes a
  `salma-api.paco-defoto.workers.dev` (política de la organización, no del Worker) —
  Paco o una sesión sin esa restricción puede comprobarlo con
  `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`.
  **Falta, antes de poder probarlo de verdad:**
  1. Secret nuevo en Cloudflare: `TWILIO_WHATSAPP_FROM` (el número de sandbox, algo
     como `whatsapp:+14155238886` — mirar el valor exacto en el panel de Twilio,
     WhatsApp Sandbox Settings). Esta sesión NO tiene credenciales de Cloudflare para
     ponerlo — hace falta que Paco lo haga: `npx wrangler secret put
     TWILIO_WHATSAPP_FROM -c wrangler.toml` desde `worker/`, o desde el dashboard.
     `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` ya están puestos (se usan para el SOS).
  2. Activar el Twilio Sandbox de WhatsApp si no está ya (F5.0) y unirse mandando
     `join <código>` al número de sandbox desde el WhatsApp de Paco.
  3. En la consola de Twilio: Sandbox → "When a message comes in" → URL
     `https://salma-api.paco-defoto.workers.dev/whatsapp`, método POST.
  Con los 3 pasos hechos, Paco manda un WhatsApp al número de sandbox y confirma si le
  llega el eco — hasta entonces, F5.1 sigue sin cerrar (el Worker ya corre el código,
  pero nadie lo ha probado de punta a punta todavía).
  - Documentos recibidos: `Salma-WhatsApp.md` (documento técnico completo — arquitectura,
    proveedor, plantillas, casos de uso, plan de fases F5.0-F5.6) y
    `whatsapp-webhook-eco.js` (borrador de código para F5.1: webhook mínimo de eco sobre
    Twilio Sandbox — solo existe en la conversación, no está guardado en el repo).
  - **Arquitectura propuesta**: Twilio (webhook + envío) → endpoint nuevo en el Worker
    (`/whatsapp`, sin decidir si en `salma-worker.js` o archivo aparte) → Firestore
    `whatsapp_sessions/{numero}` (historial, uid vinculado, estado) → mismo
    motor/prompt/tools de Salma que ya existen → Cloudflare Queues para respuestas que
    tardan (búsquedas externas) → Twilio de vuelta. Las rutas guardadas usarían el mismo
    esquema Firestore que la web (el documento dice `rutas/{uid}/...`; en este proyecto
    real es `users/{uid}/maps/{mapId}` — contrastar nomenclatura antes de implementar).
  - **Proveedor**: Twilio para todo (ya se usa para el SOS por SMS) — número, webhook,
    envío y plantillas. Se descartaron Meta Cloud API directa (más trabajo de
    cumplimiento propio) y 360dialog (solo compensa a partir de ~10.000 msgs/mes).
  - **Bloqueo actual**: la verificación de negocio de Meta (obligatoria para producción
    real) exige alta como autónomo, y Paco no está dado de alta todavía. Mientras tanto
    se arrancaría con **Twilio Sandbox** (número compartido, testers se unen con
    `join <código>`, sesión caduca a 72h, solo plantillas de ejemplo predefinidas) —
    mismo SDK/código, solo cambian credenciales y número al migrar a producción.
  - **Checklist de Sandbox → producción (21 sept 2026, sin ejecutar, para cuando el alta
    de autónomo esté hecha).** Verificado contra el código real: `sendWhatsAppMessage()`
    y el endpoint `/whatsapp` (`salma-worker.js`) ya usan `env.TWILIO_WHATSAPP_FROM` sin
    ningún valor de sandbox hardcodeado — **el paso a producción no necesita ningún
    cambio de código**, solo trámite en Twilio/Meta + cambiar el valor de un secret.
    1. **Pasar la cuenta de Twilio de Trial a pago** — consola Twilio → "Upgrade" →
       método de pago + verificación de identidad. Quita las restricciones de prueba
       (nada de "Twilio Trial Account" en los mensajes, se puede escribir a cualquier
       número, no solo a los verificados).
    2. **Crear el WhatsApp Sender de producción** — Consola Twilio → Messaging → Senders
       → WhatsApp senders → "New WhatsApp Sender". Dos caminos: que Twilio cree el Meta
       Business Manager si no hay uno, o conectar uno ya existente. Elegir número: uno
       nuevo comprado en Twilio, o uno propio ya existente (tiene que estar "liberado"
       antes de la app de WhatsApp normal/Business si ya se usa ahí).
    3. **Verificación de negocio en Meta — el paso bloqueado hoy.** Pide nombre legal del
       negocio, dirección, documento que acredite la actividad (aquí entra el alta de
       autónomo) y a veces confirmación por llamada/código al número del negocio. Tarda
       de días a un par de semanas. Sin esto, el número se queda "pendiente" y no puede
       mandar nada fuera del Sandbox.
    4. **Perfil de negocio de WhatsApp** — nombre visible, categoría (ej. "Viajes"),
       descripción corta, logo, web (borradodelmapa.com).
    5. **Plantillas de mensaje — solo si Salma va a escribir ella primero.** Si solo
       responde dentro de la ventana de 24h desde que el usuario escribe (como el eco de
       F5.1, o el aviso de `/beta-feedback` a Paco), no hace falta plantilla. Si en algún
       momento inicia la conversación (F5.5, alertas de vuelo proactivas), ese mensaje
       tiene que ser una plantilla (HSM, con variables) pre-aprobada por Meta desde
       Twilio Console → Content Template Builder — normalmente unas horas de espera.
    6. **Configurar el webhook en el número nuevo** — mismo endpoint de siempre,
       `https://salma-api.borradodelmapa-api.workers.dev/whatsapp`, método POST, en el
       "Webhook configuration" del Sender ya aprobado (equivalente al "When a message
       comes in" del Sandbox). No hace falta tocar `validateTwilioSignature()`.
    7. **Cambiar el secret**: `cd worker; npx wrangler secret put TWILIO_WHATSAPP_FROM -c
       wrangler.toml` con el número nuevo (`whatsapp:+34XXXXXXXXX`). `TWILIO_ACCOUNT_SID`/
       `TWILIO_AUTH_TOKEN` se quedan igual si es la misma cuenta/proyecto de Twilio — ojo
       con el lío ya documentado del 21 sept de dos proyectos Twilio distintos con Auth
       Tokens distintos, usar el de "Credenciales en vivo" del proyecto correcto.
    8. **Probar de punta a punta** — WhatsApp real al número de producción, confirmar que
       llega la respuesta, `wrangler tail salma-api` en paralelo igual que siempre.
    9. **Aviso de coste (protocolo §8), pendiente de decir con cifra real antes de
       activarlo de verdad**: en Sandbox los mensajes son gratis; en producción Twilio
       cobra por conversación (franja de 24h), con precio distinto si el usuario escribe
       primero ("service") o si Salma inicia ("marketing/utility") — y desde el 1 de
       octubre de 2026 los mensajes de servicio dentro de esa ventana **dejan de ser
       gratis** (ya anotado más abajo en "Cambio de coste a vigilar"). No activar
       producción sin decir a Paco el coste estimado según volumen esperado.
  - **Progreso real, 22 sept 2026 — pasos 1 y parte del 2 en marcha, BLOQUEADO en la
    compra del número.**
    1. **Hecho**: cuenta de Twilio ("My New SMS Chatbot...", la misma del Sandbox) ya
       pasada a pago (Billing → Upgrade). `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN` en
       Cloudflare vueltos a poner con los valores exactos de ESTE proyecto (por el lío ya
       documentado el 21 sept de dos proyectos Twilio con Auth Tokens distintos) —
       `npx wrangler secret put` para los dos, confirmado con `wrangler secret list`.
    2. **Bloqueo nuevo, no estaba en el checklist original**: para comprar CUALQUIER
       número (probado con España Y con EEUU, mismo resultado en los dos) Twilio exige
       primero un **"compliance profile" (KYC/verificación de identidad) a nivel de
       cuenta** — distinto de la verificación de negocio de Meta del paso 3. Sale
       "Your primary compliance profile is currently under review. You cannot make
       changes until the review is complete." Sin fecha estimada visible en pantalla;
       Twilio avisa por email cuando se resuelve. **No hay nada que forzar** — pausado
       hasta que llegue esa aprobación. Retomar desde: Communications → Numbers & senders
       → Phone Numbers → comprar un número (cualquier país) → Numbers & senders →
       WhatsApp → "Create new sender".
    3. **Probado un camino que NO desbloquea el compliance profile — no repetirlo**: a
       Paco le llegó un correo de Twilio pidiendo verificar el dominio `borradodelmapa.com`
       a nivel de **Organization** (Settings → Organization settings → Organization
       overview → "Add domain", método DNS, registro TXT en `_twilio.borradodelmapa.com`
       — añadido en Netlify DNS, que es donde de verdad está gestionado el DNS del dominio,
       ver hallazgo aparte más abajo). Verificado con éxito (`✓ Verified domain`, visible
       en Organization overview), **pero esto NO tiene relación con el compliance profile
       de números** — comprobado después: la compra de número seguía dando exactamente el
       mismo bloqueo. Son dos trámites de Twilio independientes. Si se repite este aviso
       de dominio en el futuro, verificarlo igualmente (no cuesta nada y puede hacer falta
       para otras cosas), pero no esperar que resuelva el bloqueo de comprar números.
  - **Hallazgo aparte, sin relación con Twilio — pendiente de investigar cuando haya
    tiempo, NO TOCAR NADA hasta entonces**: mirando el DNS de `borradodelmapa.com` para
    añadir el TXT de arriba, salió que el dominio está en **Netlify DNS** (proyecto
    Netlify `borradodelmapa`, con `borradodelmapa.com` como su dominio principal) — dato
    que no aparece en ningún sitio de este archivo (dice "Hosting: GitHub Pages"). La
    zona DNS tiene A LA VEZ los 4 registros `A` de GitHub Pages (`185.199.108-111.153`)
    Y un registro tipo `NETLIFY` para el mismo dominio apuntando a
    `borradodelmapa.netlify.app` — contradictorio, sugiere que en algún momento se empezó
    o completó una migración a Netlify sin documentar aquí. Hay también un proyecto
    Netlify aparte `creative-boba-c8451a` con dominio `admin.borradodelmapa.com`, y otro
    `borradodelmapa-vietnan` sin dominio propio conectado. **Sin tocar ningún registro DNS
    ni desplegar nada** — solo se añadió el TXT de Twilio, nada más. Investigar con Paco
    qué sirve realmente `borradodelmapa.com` hoy (GitHub Pages o Netlify) antes de dar por
    buena la arquitectura descrita en este archivo.
  - **23 sept 2026 — el "compliance profile" de arriba se resolvió con un RECHAZO
    formal del Business Profile de Twilio, con 4 causas concretas por email. Una ya
    arreglada y confirmada; las otras 3 pendientes, una de ellas (18602) depende de una
    decisión de negocio de Paco, no de código.** Los 4 errores, tal como llegaron:
    1. **18606 — el email de contacto del perfil no coincidía con el dominio de la
       web** (llevaba un Gmail, no algo `@borradodelmapa.com`). **ARREGLADO Y
       CONFIRMADO por Paco (23 sept 2026).** Se creó `paco@borradodelmapa.com` con
       **ImprovMX** (reenvío de email gratis, sin buzón propio — todo lo que llegue ahí
       rebota a `paco.defoto@gmail.com`): 2 registros `MX` (prioridad 10 →
       `mx1.improvmx.com`, prioridad 20 → `mx2.improvmx.com`) + 1 `TXT`/SPF
       (`v=spf1 include:spf.improvmx.com ~all`) en la raíz (`@`) del dominio, añadidos
       en **Netlify DNS** (ver hallazgo de arriba — es donde de verdad vive el DNS).
       ImprovMX confirma "Activo"/verificado. La prueba de enviarse un email a sí mismo
       desde el mismo Gmail no sirve para comprobarlo (Gmail descarta en silencio un
       mensaje que vuelve con el mismo Message-ID, para evitar bucles — no es un fallo
       de la configuración, lo explica el propio ImprovMX por email) — se dio por bueno
       con el estado "Activo" de ImprovMX sin insistir en esa prueba. Con eso hecho, se
       cambió el email de contacto del Business Profile en Twilio a
       `paco@borradodelmapa.com` y **quedó verificado en pantalla**.
       **Sin coste** — ImprovMX es gratis para reenvío (el plan de pago, no contratado,
       es solo para poder ENVIAR desde esa dirección vía SMTP, que aquí no hace falta).
    2. **18601 — nombre del negocio o email no asociados con la web** (`borradodelmapa.com`)
       — probablemente por el certificado SSL sin datos de organización (SSL normal,
       no EV) o por no encontrar el nombre del negocio en la propia web. **Sin tocar
       todavía.**
    3. **18603 — formato/verificación de la dirección** — la dirección puesta en el
       perfil no se pudo confirmar en un formato válido. **Sin tocar todavía.**
    4. **18602 — Business ID (identificador fiscal/registro) no verificable — el
       bloqueo de fondo, no es un fix de una línea.** Twilio/Meta hacen una
       comprobación KYB (Know Your Business): cruzan el nombre del negocio + su
       identificador fiscal/de registro contra un registro oficial de empresas (en
       España, el Registro Mercantil). Un DNI personal no es una empresa registrada y
       no pasa esta comprobación — y probablemente darse de alta como autónomo
       (Hacienda/AEAT) tampoco baste, porque es un registro distinto al que suelen
       consultar estos proveedores de KYB. El camino más fiable es tener una empresa
       de verdad (SL) con CIF. **Esto conecta directamente con la decisión ya anotada
       en la sesión del 21 sept 2026 ("Alta de autónomo: NO todavía. Primero validar
       con testers") — no es una tarea técnica, es una decisión de negocio de Paco, y
       no se le va a empujar hacia ella; solo queda anotado aquí el porqué del bloqueo
       para cuando él quiera decidir.**
    **Pendiente:** decidir con Paco si se intenta maquillar 18601/18603 sin más (dominio
    verificado ya ayuda a 18601; revisar el formato exacto de la dirección para 18603) o
    si se espera a resolver 18602 antes de volver a mandar el perfil a revisión — Twilio
    normalmente evalúa el conjunto, así que reenviar con solo 3 de 4 arreglados puede
    volver a rebotar. Enlace de edición del perfil: Twilio Console → Trust Hub →
    Customer Profiles → el bundle del Business Profile de producción (Paco lo tiene
    guardado en marcadores/email — no repetido aquí porque incluye el ID de cuenta).
  - **23 sept 2026 (tarde) — RESUBIDO el Business Profile completo (flujo Persona/Trust
    Hub de Twilio, con verificación de identidad — pasaporte incluido otra vez), tocando
    de paso 18601/18602/18603. MANDADO A REVISIÓN, sin resolución todavía.** Encontrados y
    corregidos 2 fallos reales al rellenar el formulario, más el muro de fondo del 18602
    confirmado en vivo:
    1. **"Company type" estaba mal puesto: "Private Corporation"** — contradecía tener un
       DNI personal como identificador (no un CIF de empresa). Corregido a **"Sole
       Proprietorship"** (autónomo/particular), que sí es coherente con la situación real
       de Paco (sin SL, sin autónomo todavía).
    2. **Campo "Apt/Suite" de la dirección llevaba código postal + ciudad duplicados**
       (autorelleno erróneo del navegador) — vaciado. Puede haber contribuido al 18603
       (dirección no verificable): datos duplicados/contradictorios en el formulario.
    3. **Confirmado en vivo el bloqueo de fondo del 18602**: con "Sole Proprietorship" +
       DNI (`78963405N`) como "Business registration number", el propio formulario de
       Twilio/Persona dio *"Your business registration number and legal name don't
       match"* — no se pudo verificar automáticamente, exactamente como se predijo: sin
       alta de autónomo, ese DNI no está activado en ningún registro que Twilio pueda
       consultar. Dato aparte, útil para cuando Paco decida sobre el alta: en España un
       autónomo no recibe un número nuevo — su DNI/NIF pasa a servir también como
       identificador fiscal de negocio en cuanto se da de alta en Hacienda; hoy, sin ese
       alta, ese mismo número no verifica.
    4. Twilio SÍ dejó seguir pese al fallo, con la opción **"Continue without
       resubmission"** (en vez de "Return to registration") — se usó esa, ya que volver
       a intentarlo no iba a cambiar nada sin el alta. El perfil quedó **enviado a
       revisión manual** ("Thanks for submitting your primary compliance profile! Your
       profile is being reviewed... we will update the status of your profile in Trust
       Hub").
    **Campos finales enviados** (para referencia si hay que repetir esto): Business
    identity: Direct Customer · Legal business name: Francisco Gomez Duarte · Business
    registration ID type: Other · Business registration number: 78963405N · Business
    industry: TRAVEL · Company type: Sole Proprietorship · Website: borradodelmapa.com ·
    Business address: Calle Diecinueve de Octubre 16, Apt/Suite (vacío), 29670, Marbella,
    Málaga, España · Notification email: paco@borradodelmapa.com.
    **Pendiente: esperar la respuesta de Twilio (revisión manual, puede tardar de días a
    2 semanas según el propio checklist de arriba).** Si vuelve a rechazar por 18602, la
    única salida real sigue siendo la decisión de negocio ya anotada (alta de autónomo o
    formar una SL) — no hay ningún ajuste de formulario más que probar.
  - **Plan de fases** (documento completo `Salma-WhatsApp.md`, recuperar de los archivos
    subidos si se retoma en otra sesión):
    - F5.0 — trámite Twilio + activar Sandbox (no bloquea desarrollo)
    - F5.1 — webhook mínimo + eco (borrador de código ya listo, sin IA ni Firestore)
    - F5.2 — conectar con el motor de Salma (texto libre, sin memoria entre mensajes)
    - F5.3 — memoria (`whatsapp_sessions`) + tools (búsquedas) + Cloudflare Queues
    - F5.4 — vinculación de cuenta (código de un solo uso, número ↔ uid)
    - F5.5 — proactivo con plantillas reales (requiere alta autónomo + verificación Meta)
    - F5.6 — exploración a futuro (modo grupo, ubicación en tiempo real, marca blanca)
  - **Cambio de coste a vigilar**: desde el 1 de octubre de 2026 los mensajes de
    servicio/utility de WhatsApp dentro de la ventana de 24h dejan de ser gratis —
    afecta al margen del canal, hay que llevarlo aparte del ~97% de margen de la web.
  - **Decisiones abiertas según el propio documento**: si el endpoint va en
    `salma-worker.js` o en archivo aparte; diseño del prompt "modo chat corto" para
    WhatsApp; dónde/cómo se genera el código de vinculación de cuenta (web o WhatsApp,
    entrega por email o chat); textos de las primeras plantillas (bienvenida, alerta de
    precio); y el alta como autónomo de Paco, condición previa para F5.5 y para
    producción real (fuera del ámbito técnico).
  - **Confirmado por Paco (14 sept):** el documento menciona Kiwi.com y Trivago, pero
    eso está desactualizado — los proveedores reales y correctos son **Duffel**
    (`buscar_vuelos`) y **Booking.com vía RapidAPI** (`buscar_hotel`/`buscar_coche`),
    igual que en el resto de la app. Cuando se implemente WhatsApp, usar estos dos tal
    cual ya están en el Worker — no añadir ni Kiwi ni Trivago.
  - **Ajustes al plan, propuestos por la sesión y aceptados por Paco (14 sept) — a
    aplicar cuando se desarrolle, no ahora:**
    1. **Async sin Cloudflare Queues.** El documento propone Queues para F5.3
       (responder rápido al webhook y mandar el resultado real después). Este proyecto
       no usa Queues en ningún sitio hoy, y montarlas (activar el producto, worker
       consumidor aparte, binding en `wrangler.toml`) es más infraestructura de la que
       hace falta. Empezar con `ctx.waitUntil()` dentro del propio Worker: Twilio no
       espera la respuesta real, así que el Worker puede seguir trabajando en segundo
       plano tras devolver el 200 OK y mandar el mensaje real por su cuenta. Pasar a
       Queues solo si en producción real aparece un problema concreto (reintentos,
       sobrecarga) que lo justifique.
    2. **Validar la firma de Twilio (`X-Twilio-Signature`) desde F5.1-F5.2, no
       "antes de producción".** El borrador de código lo deja como TODO para más
       adelante. Pero en cuanto F5.2 conecte con el motor real de Salma, una URL de
       webhook sin proteger deja que cualquiera que la descubra dispare búsquedas de
       vuelos/hoteles/Places/GPT-4o-mini a costa de Paco sin pasar por WhatsApp de
       verdad. Meterla ya en F5.1-F5.2.
    3. **Decidir antes de F5.3 cómo cuentan los límites del plan gratis** (3 rutas
       gratis, 20 msg/día) para un número de WhatsApp sin vincular a un `uid`. Si cada
       número suelto empieza "de cero" en Firestore sin relación con el límite real de
       ningún usuario, alguien podría abrir sesiones de sandbox indefinidamente para
       saltárselo. Cerrar esta decisión de negocio antes de escribir el código de
       F5.3, no parchearla después.
    4. **Unificar el formato de negritas a un solo asterisco (`*negrita*`) para web
       y WhatsApp por igual — idea de Paco (14 sept), mejor que traducir el formato
       canal por canal.** WhatsApp ya renderiza `*texto*` como negrita de forma nativa;
       si Salma emite esa misma convención, no hace falta ninguna traducción en el
       post-procesado del canal WhatsApp. Toca dos sitios cuando se implemente:
       - `worker/salma-worker.js` línea 189 (`BLOQUE_FORMATO`): cambiar la instrucción
         de `**Negritas**` a `*Negritas*` (y los ejemplos de la línea 196).
       - `app.js` línea 5873, único sitio del código vivo que convierte el markdown de
         Salma a HTML (`html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')`) — sin
         duplicados en `guide-renderer.js`/`bitacora-renderer.js`/`mapa-itinerario.js`
         (comprobado, no lo tocan). Cambiar el regex a un solo asterisco.
       **Decisión de Paco (14 sept): no hace falta compatibilidad con el formato
       viejo.** Las guías y notas ya guardadas en Firestore con `**doble asterisco**`
       pueden quedarse mostrando los asteriscos sueltos — Paco es el único usuario
       activo del proyecto ahora mismo, así que perder ese detalle visual en contenido
       antiguo no importa. El regex de `app.js` se cambia limpio a un solo asterisco
       (`\*(.+?)\*`), sin lógica de doble formato ni migración de Firestore.
  - **No tocar código de esto sin que Paco lo pida explícitamente** — estamos en fase de
    estudio de los documentos, no de desarrollo.

### 🔴 Crítico — verificado ahora mismo

- **🚨 EDITAR UNA GUÍA GRANDE LA SOBRESCRIBE CON MENOS PARADAS — 21 sept 2026, SIN ARREGLAR.
  A COMPROBAR/RECUPERAR CUANTO ANTES.** Paco pidió en el popup de consulta sobre su guía de
  Navarra/País Vasco (~19 paradas): *"Añade una parada más al final, tengo tiempo, naturaleza"*.
  Salma dijo "lo añado entre la Presa de Irabia y Alto de Larrau", "generó", contestó *"Ruta
  actualizada"* y **la guía guardada quedó con 12 paradas** (sin la nueva). Sin ningún error visible.
  **Causa, con evidencia de `wrangler tail`:** `[RESCATE] ✓ JSON truncado reconstruido: 12
  paradas (stop_reason: max_tokens)`. (1) el mensaje lleva "añade" → `_looksLikeEdit`
  ([salma-worker.js:8673](worker/salma-worker.js:8673)) lo trata como edición de la ruta
  entera y le pide a Claude que **reemita las ~19 paradas completas**; (2) eso supera el tope de
  20.000 tokens de salida y el JSON se corta; (3) el RESCATE 1 ([salma-worker.js:9820](worker/salma-worker.js:9820))
  reconstruye solo lo que llegó (12) y lo da por bueno; (4) la comprobación de cordura del
  frontend ([salma.js:1535](salma.js:1535)) solo salta si se conserva **<50%** de las paradas y
  aquí eran 12/19 = 63% → dice "Ruta actualizada" y `_commitRouteEdit` ([salma.js:2169](salma.js:2169))
  **guarda las 12 encima de la guía**. NO tiene relación con lo del 21 sept (reglas, coins,
  Stripe): el flujo es anterior. Con guías de ≥~15 paradas se repetirá cada vez.
  **Copia de seguridad:** `_commitRouteEdit` guarda la versión anterior en
  `users/{uid}/maps/{id}.itinerarioIA_prev`, **pero solo la última** — un segundo cambio en la
  misma guía la pisa. **No editar esa guía hasta recuperarla.**
  **Recuperación (desde el ordenador, consola F12 con la guía abierta; Paco estaba en el móvil
  y no pudo hacerlo).** 1º solo lectura, comprobar que la copia tiene ~19:
  `(async()=>{const ref=firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).collection('maps').doc(salma.currentRouteId);const d=(await ref.get()).data();console.log('paradas ahora:',JSON.parse(d.itinerarioIA).stops.length,'| en la copia:',d.itinerarioIA_prev?JSON.parse(d.itinerarioIA_prev).stops.length:'NO HAY COPIA');})()`
  2º SOLO si la copia tiene las ~19: restaurar (`ref.update({ itinerarioIA: d.itinerarioIA_prev })`).
  **Arreglos propuestos, ninguno implementado (Paco no ha dado OK):**
  (a) si el Worker tuvo que usar el RESCATE 1 por `max_tokens` en una edición, **no devolver la
  ruta como buena** (avisar, sin sobrescribir); (b) la alarma del frontend debe contar
  **paradas perdidas** (menos paradas que antes al pedir *añadir*), no solo el % conservado;
  (c) lo más limpio: que "añade una parada" NO reescriba toda la ruta y use el camino del botón
  "Añadir a la guía" (`merge_into_route`, ya existe, solo genera lo nuevo y lo fusiona).
  **Aviso de coste (§8):** (c) BAJA el gasto — hoy cada edición de una guía grande reemite hasta
  ~20.000 tokens de Claude Sonnet (~0,3 €); solo lo nuevo es una fracción. (a) y (b) no llaman a
  ninguna API.
  **REPARTO ENTRE SESIONES (decidido por Paco el 21 sept 2026): este arreglo lo hace OTRA
  sesión/chat; la sesión de pagos sigue con el paso 2 en paralelo** (Paco: "el arreglo de las
  guías lo haré en otro chat"). Protocolo §1B — quién toca qué, para no pisarse:
  · **Sesión "guías" (este pendiente):** `worker/salma-worker.js` solo en la zona de EDICIÓN
    DE RUTA (`_looksLikeEdit`/`_editingRoute` ~8673 y el RESCATE 1 ~9820) y `salma.js` solo
    en el guardado de ediciones (`_commitRouteEdit` ~2169, cordura ~1535). Primero RECUPERAR la
    guía de Paco (ver recuperación arriba), después arreglar.
  · **Sesión "pagos" (paso 2):** `app.js` (perfil, modal Premium), `flight-watches.js`, el bloque
    de coins de `buildMessages()` (~2725) y `POST /flight-watches` + `verifyAuthAndGetUser` del
    Worker. **Ninguna de las dos toca `firestore.rules`, Stripe ni el bloque de reglas de
    Premium** (cerrado en el paso 1).
  · Las dos: `git fetch origin main` ANTES de cada commit y de cada deploy; commits pequeños.
    Quien haga push de un cambio del Worker lo despliega y anota el `Current Version ID` aquí.
  **⚠️ ACTUALIZADO 21 sept 2026 (tarde) — LA SESIÓN DE PAGOS YA SUBIÓ LOS PASOS 2 Y 3 A `main`
  (commits `fda89f14`, `e18c4dce`, etc.; el Worker vigente es el que devuelva `/version` — mira también la ÚLTIMA entrada con `Version ID` del plan de pagos).
  ANTES de tocar nada haz `git fetch origin main` y TRAE esos cambios (`git pull`/merge): tocan
  `worker/salma-worker.js`, `app.js` y `flight-watches.js`. Los números de línea de arriba
  (~8673, ~9820, ~2169, ~1535) YA NO SON FIABLES — el Worker creció ~+250 líneas: busca por
  NOMBRE (`_looksLikeEdit`, `_editingRoute`, `salvageIncompleteRouteJson`, `_commitRouteEdit`).**
  Lo que cambió en la zona que vas a tocar, del lado de `POST /` (busca `_usageKind`):
  · Justo tras `const _urlIncidents = []` hay un bloque nuevo de **límites de uso**: `_usageKind`
    ('guide' | 'edit' | 'chat'), `usageGate(...)` (puede cortar la petición con un aviso SSE y
    `limit_reached`), `_reqUsage`, `_usageConsume` y `_flushUsage()`.
  · **Una edición de ruta ya cuenta como `edit`:** `_usageKind` es 'edit' si `mergeIntoRoute ||
    _editingRoute`. Un usuario gratuito tiene 2 cambios en total; Premium 8 al mes.
  · El cupo se CONSUME solo si sale bien: tras `convertProseToRouteJson` válido (camino
    merge/guía) o en `if (route && !_usageConsume) ...` justo antes del `doneEvt` final.
    **Tu arreglo NO debe gastar un cambio cuando devuelvas la ruta por RESCATE 1 y decidas no
    guardarla** (a): pon `route = null` antes de ese punto o no llegará a consumir bien.
    Si haces (c) (que "añade una parada" use `merge_into_route`), sigue contando como `edit`
    por `mergeIntoRoute`; no dupliques el conteo.
  · `readAnthropicStream` ahora devuelve `usage` y `convertProseToRouteJson` acepta
    `opts.usageAcc`: si añades otra llamada a Claude en esta zona, súmala a `_reqUsage`.
  Paco (harto de fallos en las guías): quería este fallo chequeado antes de seguir con el paso 2.

  **PROGRESO 21 sept 2026 (sesión "guías"):** la guía de Navarra NO se recupera (la copia
  `itinerarioIA_prev` también tenía 12 — ya pisada; Paco decidió que eran pruebas, se descarta).
  **(a) DESPLEGADO, sin probar en pantalla** — commit `c7cfa8b4`, **Worker Version ID
  `01183e32-5fe1-4d7e-9d26-32f2e8fbc302`** (confirmado contra `/version`, 18 secretos intactos).
  En una edición de guía existente (`_editingRoute`, sin `mergeIntoRoute`): si el RESCATE 1
  reconstruye la ruta por corte, o si una petición de solo "añadir" devuelve MENOS paradas
  que la guía, el Worker devuelve `route: null` + aviso ("no he tocado tu guía guardada") y
  salta el RESCATE 2 (evita otra llamada de ~20.000 tokens). Sin route no se consume cambio del
  plan. Sin coste nuevo (no llama a ninguna API). Logs: `[EDIT-CORTE]` / `[EDIT-PERDIDAS]`.
  **(b) HECHO Y CONFIRMADO por Paco** (quitar una parada sin avisos) — `salma.js?v=102`, commit
  `39957194`: la alarma de cordura cuenta paradas perdidas (≥1 sin verbo de quitar/cambiar, ≥3 con él).
  **(c) DESPLEGADO, sin probar en pantalla** — commit `4ddd0d8f`, **Worker Version ID
  `4084137e-3b86-4b67-ae13-bf4140e74d3e`** (confirmado contra `/version`, 18 secretos). "Añade/agrega/mete/
  pon/una parada más/más días" sin verbo de quitar/cambiar (`_addOnlyEdit`): al modelo se le pide SOLO
  lo nuevo (cada parada con su `day`); `mergeStopsIntoDays` lo inserta en la guía en el día que le
  toca (hueco de menor rodeo, o al final del día con "al final"/"la última"; día nuevo si `day` > último).
  Las paradas viejas no se reescriben. Si todo ya estaba → "Eso ya está en tu guía". Si la petición es vaga
  el modelo puede proponer opciones + `SALMA_OFFER_ADD_TO_ROUTE` (botón "Añadir a la guía"). Sigue
  contando como `edit`. `max_tokens` 8000 para este caso (tope, no gasto). **Coste (§8): BAJA** — la
  salida pasa de hasta ~20.000 tokens a unos cientos. Logs: `[EDIT-ADD]`.
  **(c) SUSTITUIDO por edición por operaciones — DESPLEGADO, sin probar en pantalla** — commit
  `a33bd815`, **Worker Version ID `7ee89720-97f0-49b2-b90d-12c12e1ad30f`** (confirmado contra `/version`,
  18 secretos), `salma.js?v=103`. Motivo (Paco): un regex de verbos ("añade…") no cubre "quiero ir también
  a X", "falta un sitio para comer", "un día extra"… y reescribir la guía entera es caro. Ahora, con una guía
  cargada, la IA NO reescribe: responde con 1-2 frases + `SALMA_ROUTE_EDIT {"add":[…],"remove":[n],
  "replace":[{"n":N,"with":{…}}]}`; el Worker lo aplica (`extractRouteEditFromReply` + `applyRouteEditOps`,
  reutiliza `mergeStopsIntoDays`). Las paradas se pasan al prompt numeradas (`n`) y quitar/sustituir es
  SOLO por número (la IA no puede inventarse una existente; nº inválido → se ignora y se avisa). Las paradas
  antiguas no pasan por la IA (ni se pierden ni se corrompen sus coords/enlaces). **Lo nuevo solo entra si
  Google lo confirma con `place_id`** (sin la excepción "sin verificar" de los faros); la sustituida solo sale
  si su reemplazo se confirmó. Sin borrador (`draft`) en estas ediciones. Reescritura completa
  (`SALMA_ROUTE_JSON`) solo si hay que reordenar/reestructurar todo — sigue protegida por (a) y (b). El
  frontend recibe `ops_edit` y no lanza la alarma de "paradas perdidas". Consume 1 cambio (`edit`) aunque el
  mensaje no cazara el regex de edición (la puerta previa `usageGate` sí sigue usando `_editingRoute`).
  **Primera prueba de Paco (21 sept): quitar y sustituir OK; "quiero ir también a la playa" NO** — el modelo ignoró
  el formato y devolvió SALMA_ROUTE_JSON con 1 parada (la alarma (b) evitó guardar 11→1). Arreglo: red de seguridad
  `looksLikeOnlyNewStops` (commit `e71ca9c1`, **Worker Version ID `c309408e-effa-4810-993d-cdf4c72b0523`**, comprobado
  contra `/version`): si con una guía cargada llega una ruta con menos paradas, <50% de nombres en común y centro a
  <150 km, se trata como "añadir" esas paradas (mismo camino y misma verificación estricta). **CONFIRMADO EN PANTALLA por Paco (21 sept, popup, `salma:103`):** quitar, sustituir y los tres "añadir" sin verbos ("quiero ir también a la playa", "falta un sitio para comer", "no te olvides de una cascada") se comportan bien, sin alarmas; las propuestas salen con el botón "Añadir a la guía".
  Logs: `[EDIT-OPS]`. **Coste (§8): BAJA** — salida de unos cientos de tokens en vez de la ruta entera.
  OJO cifra: el tope real de `max_tokens` de una edición era 3.000/6.000 si el mensaje no era petición de ruta
  y 24.000 si lo era (`reqMaxTokens`), no siempre "20.000"; la guía de 12 paradas cortada a mitad cuadra con el
  tope bajo. Pendiente (paso 2 acordado con Paco): recortar la ficha de paradas que se manda en cada edición
  (hoy con `narrative` completo) — reduce ENTRADA. Después, prompt caching (necesita OK aparte).
  **Paso 2 + popup, DESPLEGADOS 21 sept, sin probar en pantalla** — commit `d76365dd`, **Worker Version ID
  `9f64aa81-1487-4c48-8628-4a40a74b2c88`**, `mapa-itinerario.js?v=73`. (i) [REVERTIDO — ver abajo] ENTRADA: con una guía abierta el prompt lleva una
  ficha RESUMIDA por parada (n, name, day, day_title, type, lat, lng, 140 caracteres de narrative) en vez de la ficha
  completa (~300 → ~90 tokens/parada, en CADA mensaje); si la IA reescribe la ruta entera, `restoreStopsFromCurrent`
  restaura por nombre los datos originales (descripción completa, place_id, foto…) y solo respeta día/orden (y la
  descripción si la cambió a propósito). Log `[EDIT-RESTORE]`. Coste (§8): BAJA (~4.000 tokens de entrada por mensaje con
  una guía de ~19 paradas ≈ 0,01 € con Sonnet a 3 $/Mtok). (ii) POPUP: cerrar el popup con una respuesta en curso ya no
  suelta el modo popup hasta que termine (`_closeItinQuery` → `_finalizeItinQueryClose`, tope 2 min; reabrir cancela el
  cierre pendiente) → la respuesta se procesa como edición de ESA guía, no cae en el chat normal. (iii) `salma.js?v=104`,
  `app.js?v=142`: mientras Salma responde no se puede enviar y NO se vacía la caja (`salma.isBusyNotify()`; chat, bienvenida,
  dictado y popup). Pendiente de probar en pantalla junto con lo de arriba.
  **REVERTIDO (i) a petición de Paco, 21 sept:** ahorraba ~0,01 €/mensaje y recortaba lo que Salma sabe de las paradas (qué comer, km,
  carretera…) → no compensa. Vuelve la ficha completa por parada (con el nº `n`); commit `7768e39b`, **Worker Version ID
  `d571bd05-cd7d-48d3-87f2-e0834adb529a`** (comprobado contra `/version`, 18 secretos). `restoreStopsFromCurrent` se queda como
  protección inocua. (ii) y (iii) siguen. Siguiente ahorro real, pendiente de OK de Paco: prompt caching (§8).
  **Límite del plan, 21 sept (a petición de Paco tras toparse con "límite de cambios (8)"):** commit `ed88eb9c`, **Worker Version ID
  `083e5300-5876-4066-9701-15868a06583e`** (comprobado contra `/version`, 18 secretos), `salma.js?v=105`. (1) El aviso de límite (chat/guías/cambios)
  lleva ahora el botón "Ver mi plan →" (abre `openCoinsModal`; `_offerSeePlans`, el done copia `limit_reached`). (2) `PLAN_LIMITS.premium.editsPerMonth` 8 → 40 (los 8 eran
  de cuando editar costaba ~0,3 €; el modal lee los topes de `GET /usage`, no hay cifra hardcodeada). (3) NO se reseteó el contador de Paco (con el tope a 40 ya no
  hacía falta y habría borrado la medición). **MEDICIÓN REAL (KV `usage:{uid}:2026-09` de Paco, 21 sept 16:32 UTC):** 4 msgs, 0 guías, 9 cambios,
  **451.709 tokens de ENTRADA y 8.504 de salida = 1,48 USD estimados** → ~13 peticiones ≈ 0,11 USD cada una y **~90% es entrada** (~35.000 tokens de entrada por
  petición: prompt de sistema con BLOQUE_RUTAS + datos + cada iteración del bucle de tools). El siguiente ahorro real es prompt caching / reducir el prompt.
  **PROMPT CACHING, 21 sept (OK de Paco, "primero caching y el prompt lo miramos con sumo cuidado después") — DESPLEGADO, sin comprobar aún que acierta:**
  commit `489079fc`, **Worker Version ID `100cf14d-6b1c-4fed-847e-b564ed0e78a3`** (comprobado contra `/version`, 18 secretos). SOLO la llamada principal
  a Claude (bucle de herramientas de `POST /`): `buildMessages` devuelve `systemBase` (la constante del modo, ~8-10k tokens + las herramientas ~3k, que van
  antes en el prefijo) y `buildCachedSystem` lo marca `cache_control: ephemeral` (5 min) y deja detrás, sin cachear, el contexto variable (fecha, usuario,
  ubicación, notas, KV…). NO toca `convertProseToRouteJson` (guía con mapa), ni narrar/pin/historia/enrich. Si la base no es prefijo del prompt o es
  corta, la llamada sale como antes. `readAnthropicStream` devuelve `cw`/`cr` (guardados/leídos); `usageRecord` guarda `tcw`/`tcr` y el coste
  estimado usa 3,75 $/Mtok escritura y 0,30 $/Mtok lectura (`tin` sigue siendo la entrada total). Log `[CACHE] vuelta N: entrada X (guardados Y, leídos de caché Z)`.
  Esperado: en un bucle de ≥2 vueltas, la vuelta 1 guarda (~12k) y las siguientes leen; dos peticiones seguidas <5 min → la 2ª lee desde la vuelta 1. Una petición
  aislada de 1 sola vuelta cuesta ~25% MÁS en la parte fija (~0,01 €). PENDIENTE (con cuidado, aparte): recortar el prompt de sistema (duplicados/contradicciones).
  **CACHING COMPROBADO por Paco (wrangler tail, 21 sept):** vuelta 0 guarda 16.411 tokens; las siguientes leen 16.411 de caché (~50% menos por llamada con una guía de 19 paradas);
  quitar una parada por operaciones (`[EDIT-OPS] -1 → 18`) salió con 62 tokens de salida. Lo que queda sin cachear (~12-14k/llamada) es contexto variable, ~6k de ellos la ficha completa de la guía.
  **BÚSQUEDAS DE AYUDA CON GUÍA ABIERTA, 21 sept — DESPLEGADO, sin probar en pantalla** — commit `cd9c67b6`, **Worker Version ID `ba2a519d-eca2-40b5-bb6a-3412eff1cc97`**:
  `extractHelpLocation(...,deferRoute)` devuelve `{__route}` y la decisión se toma con el GPS: si el usuario está a ≥60 km de todas las paradas de la guía (y hay ciudad de GPS y el
  mensaje no habla de la guía: "de/en mi ruta", "parada N"), se busca en SU posición (ciudad + coords) y Salma abre con "Cerca de X:" y ofrece buscar cerca de la guía; si está cerca, no
  hay GPS o habla de la guía, como antes (zona de la guía) y también dice "Cerca de <zona>:". Nota inyectada al final del system prompt (`helpLocationNote`, parte variable, sin cachear).
  Motivo: guía de País Vasco abierta con el usuario en Asturias → búsqueda a cientos de km sin explicación. Coste (§8): mismo nº de llamadas a Places/Claude; solo cambia la zona.
  **Aclaración (21 sept, por la prueba de Paco):** en el chat normal (pestaña Salma) la guía NO está cargada (`salma.reset()` al entrar → `currentRoute` null), así que "parada 3" no existe
  ahí y las búsquedas usan el GPS; la guía abierta solo cuenta en el popup de consulta / al abrir la vista de la guía. **ATAJO "DÓNDE ESTÁ" ARREGLADO — DESPLEGADO, sin probar** — commit `0a176ef6`,
  **Worker Version ID `c09ab8af-be82-4b80-85d8-6ba830230749`**: "la peluquería más cercana, ¿dónde está?" caía en el atajo de enlace de Maps (buscaba el texto entero como nombre de lugar →
  "No he encontrado ese sitio en Google Maps con seguridad"). Nuevo `isNearbySearch` (más cercan*, cerca de mí/aquí, por aquí, near me…, con lookbehind porque `` no funciona detrás de tildes)
  saca esas frases de los DOS atajos (bypass previo a Claude y frase de "no encontrado" al final) → van por Claude + buscar_lugar con el GPS. Coste (§8): esas consultas dejaban de
  costar 1 llamada a Places (sin Claude) y ahora usan la ruta normal (Claude ~0,04-0,10 € + Places): sube algo por consulta, pero antes daban una respuesta equivocada.
  **PASO 1 DEL "FOLLÓN" DE OFERTAS, 21 sept — DESPLEGADO, sin probar** — commit `b6ade624`, **Worker Version ID `b048e293-4bd3-4189-b4bd-0d74b644a519`**. Tres capturas de Paco:
  (1) "farmacia cerca mia" en el chat general → "Crear ruta con mapa"; (2) "peluquería cerca" en el popup con una guía de Navarra abierta estando en Asturias → "Añadir a la guía";
  (3) "restaurante cerca de la parada 1" → 2º resultado en Cangas de Onís (GPS) y texto que promete añadir sin botón (captura 3 no llegó; descrita). CAUSA (1): `isDaysDestination`
  ("solo destino: 1-4 palabras sin verbo → plan de 1 día") cogía "farmacia cerca mía" → Tiempo 1 → `offer_map_button`. FIX: `isDaysDestination` devuelve false si `isNearbySearch` o
  `isHelpRequest` (salvo categoría "transport": su regex coge "puerto de…"/"tren", que pueden ser destinos); `isNearbySearch` ahora reconoce "cerca mía/mío/mia"; el marcador
  `SALMA_OFFER_ADD_TO_ROUTE` (gate del Worker y frase del prompt) NO aplica a búsquedas de ayuda/cercanía. NO tocado aún (siguientes pasos acordados con Paco, uno a uno): (2) UNA sola zona por
  respuesta (el Worker elige GPS/guía y dice a Claude que no relance `buscar_lugar` por su cuenta — hoy la nota solo lo dice en el caso "lejos"); (3) el botón lo pone el sistema,
  el modelo no debe escribir "puedes añadirlo a la ruta" (texto sin botón, mismo fallo que el 18 sept). Riesgo restante: el regex `_isRouteMsg` del frontend (salma.js) también puede
  poner "Crear ruta con mapa" con palabras como "ruta"/"días"/"visitar".
  **CONFIRMADO por Paco (21 sept):** capturas 1 y 3 OK tras el paso 1. **DECISIÓN de Paco sobre el popup:** dentro del popup la referencia es la GUÍA ("peluquería cerca" → cerca de la parada 1 es coherente); NO se toca
  más el Worker (paso 2 "una sola zona" y paso 3 quedan sin hacer a propósito) y se aclara con TEXTO: al abrir el popup ahora sale "Estás editando tu guía «título». Desde aquí puedes añadir o quitar paradas… Para buscar algo cerca de ti,
  usa Cerca mía o el chat general" (`mapa-itinerario.js?v=74`, commit de esta línea, solo frontend, coste cero). Sigue abierto y conocido: "peluquería cerca" SIN "de mí" escapa de `isNearbySearch`
  (y "peluquería" no es categoría de `isHelpRequest`), así que el popup aún puede ofrecer "Añadir a la guía" ahí.
  **AJUSTE 21 sept (Paco: el aviso de v74 no se veía):** solo salía con el popup VACÍO — con historial de esa guía (`query_history`, hasta 20 mensajes, se manda a Claude como contexto) se sustituía por los mensajes.
  Ahora es un aviso FIJO (`#itin-query-sub`, bajo el título) con "Editando «título»" + una línea + enlace "Borrar conversación" (`_clearItinQueryHistory`: vacía pantalla, `salma.history` y
  `query_history` con `FieldValue.delete()`; no toca la guía; bloqueado mientras Salma responde). `mapa-itinerario.js?v=75`, `styles.css?v=121`, `index.html` (contenedor). Solo frontend, coste cero. Pendiente de probar en móvil.
  **CONFIRMADO EN PANTALLA por Paco (21 sept, cierre de la sesión "guías"):** (1) popup vacío en `mapa-itinerario:77` (título + "Editando «…»" + cuadro de texto, sin caja repetida; "Borrar conversación" bajo Cerca mía/Narrador, funciona); (2) cerrar el popup con respuesta en curso no la desvía al chat normal; (3) enviar mientras Salma responde avisa y no pierde lo escrito; (4) búsqueda de ayuda con guía abierta por distancia (cerca de ti si estás lejos; zona de la guía con "parada N"). **SIN COMPROBAR:** (5) botón "Ver mi plan" del aviso de límite (necesita cuenta gratuita/Premium sin cupo); (6) una edición de guía de ~19 paradas (no hay una para provocar el fallo original; el recorte silencioso está cubierto por (a)+(b)+edición por operaciones). **SIGUIENTE, si Paco lo pide (con mucho cuidado, §6):** recortar el prompt de sistema (~16k tokens fijos/petición, ya cacheados) buscando duplicados y contradicciones entre bloques.
  **Abierto, sin tocar (pensar):** (1) cerrar el popup de consulta mientras hay una petición en curso
  no la aborta: se guarda igual pero la respuesta cae en el chat normal (`mapa-itinerario.js:_closeItinQuery`,
  `_chatAreaOverride = null`); (2) "una parada" vs proponer varias: (c) pide UNA por defecto.

- **Octavo hallazgo del mismo hilo foto+guía, 19 sept 2026, DESPLEGADO, sin confirmar en
  pantalla.** Con las fotos y la pantalla negra ya arregladas (entradas de abajo), Paco
  probó la ruta de Navarra de 10 paradas de verdad y confirmó que "sí que va", pero
  señaló un problema de fondo distinto: Salma dice "te monto ruta de sur a norte" pero
  el resultado **salta muchos kilómetros de un día a otro sin criterio geográfico
  coherente** (captura: Día 1 al este cerca de la frontera con Aragón, Día siguiente al
  norte cerca de Donostia, otro al oeste en Estella, otro al sur en Olite/Calahorra).
  Encontradas DOS causas reales leyendo el código de `convertProseToRouteJson` (la
  función que convierte el plan en prosa a JSON de ruta) y del merge del popup:
  1. La instrucción "ORDEN GEOGRÁFICO" que ya existía (duplicada en dos sitios del
     Worker) solo decía "dentro de cada día, ordena las paradas por cercanía" — nunca
     decía nada sobre cómo debía encadenarse un día con el siguiente. Claude podía
     ordenar bien las paradas DENTRO del Día 1 y DENTRO del Día 4, pero asignar qué
     parada va en qué día sin ningún criterio de continuidad — de ahí el salto.
  2. El botón "Añadir a la guía" del popup (`merge_into_route`) pegaba las paradas de
     la segunda captura **siempre al final** como día(s) nuevos, sin mirar dónde caían
     geográficamente — si esa segunda captura tenía paradas cerca del Día 1, igual
     aterrizaban al final de todo, empeorando el salto.
  **Arreglo, commit `11694fc`, dos piezas:**
  1. Ampliada la instrucción de orden geográfico (en los dos sitios donde está
     duplicada) para que también encadene los DÍAS entre sí sin retroceder — el Día 2
     debe empezar cerca de donde terminó el Día 1, respetando la dirección si el
     usuario la pide (ej. "de sur a norte").
  2. El merge del popup ahora calcula, con matemática pura (`haversineKm`, ya existía
     en el código, sin llamar a ninguna API), en qué hueco de la secuencia de días ya
     existente encaja mejor el bloque de paradas nuevas (comparando centroides) y lo
     inserta ahí — no siempre al final. Si las paradas nuevas no tienen coordenadas
     válidas, cae al comportamiento anterior (al final), sin romper nada.
  Probado con 4 casos sintéticos en Node antes de desplegar (bloque nuevo cerca del
  Día 1 → se inserta ahí; bloque nuevo entre dos días intermedios → se inserta en medio;
  bloque nuevo más lejos que todo lo demás → va al final; bloque sin coordenadas → va al
  final como antes) — los 4 se comportan como se espera.
  **Aviso de coste (protocolo §8):** la pieza 1 añade unas pocas líneas de instrucción a
  un prompt de una llamada a Claude Sonnet que ya se pagaba siempre (unos pocos tokens
  de entrada más, céntimos de céntimo). La pieza 2 no llama a ninguna API, es solo
  cálculo de distancia entre coordenadas ya conocidas — coste cero.
  Desplegado (GitHub Action "Deploy Worker" run #35, commit `11694fc`, **Worker Version
  ID `1d8cf715-5f73-4dea-8206-22ca4ef9b274`**) — sin confirmar contra `/version`, mismo
  bloqueo de red del contenedor de siempre.
  **Pendiente: que Paco repita una ruta multi-día (con o sin segunda captura añadida
  desde el popup) y confirme que el orden de días ya no salta de un extremo del mapa a
  otro.** **Pausado a petición explícita de Paco (19 sept 2026)**: no quiere generar más
  rutas de prueba hasta asegurarse de que no está generando gasto extra en Google u
  otras APIs — aclarado que este fix concreto no añade ninguna llamada nueva (pieza 1 es
  solo más texto en un prompt que ya se pagaba, pieza 2 es matemática pura sin API), pero
  la propia prueba (generar una ruta) sigue costando lo mismo que cualquier ruta normal
  ya cuesta hoy. No perseguir esta confirmación hasta que Paco lo pida.

- **Séptimo hallazgo del mismo hilo foto+guía, 19 sept 2026, DESPLEGADO, sin confirmar
  en pantalla — corrige además un error de diagnóstico propio de la entrada de arriba.**
  Confirmado por Paco: la captura real tenía **5 puntos, no 10** — mi lectura inicial de
  "10 paradas" (basada en los números de los badges de una captura de otra prueba, de
  otra sesión) no correspondía a la captura de esta prueba en concreto. Con eso resuelto:
  el mapa montando 5 paradas era **correcto, no un bug** — se cierra esa duda, no hay
  nada que investigar ahí. Mi teoría de "se corta en la 9ª de 10 por agotar el tope de
  iteraciones" (entrada de arriba, commit `2c4242b`) tampoco encajaba con esta captura de
  5 puntos — ese fix queda igual (es una mejora válida para cuando sí haya muchas paradas
  de foto en una sola respuesta), pero no era la causa de lo que vio Paco aquí.
  **Lo que sí se diagnosticó y arregló de verdad, mirando el código**: la foto rota de
  "Elizondo y el Valle de Baztán" — la función que repara markdown de fotos mal escrito
  por Claude (`_repairBrokenPhotoMarkdown`) comparaba el nombre que Claude pone en el
  texto contra el nombre que devuelve Google (o el que se pidió) exigiendo coincidencia
  EXACTA — con nombres compuestos ("Elizondo y Baztán" vs "Elizondo y el Valle de
  Baztán") casi nunca coinciden letra por letra, así que la reparación no encontraba la
  URL buena. **Arreglado, commit `af892fb`:**
  1. La clave se guarda también bajo el nombre que Claude pidió al llamar a
     `buscar_foto` (`block.input.lugar`), no solo el nombre canónico de Google.
  2. La búsqueda ahora admite coincidencia parcial (un nombre contenido en el otro), no
     solo exacta.
  3. Si aun así no hay ninguna coincidencia: antes, un markdown "cerrado" (con `)`) se
     dejaba tal cual asumiendo que probablemente estaba bien; ahora se quita siempre —
     Claude puede cerrar el markdown y aun así teclear mal un carácter dentro del
     `photo_ref` larguísimo (mismo patrón ya documentado el 14 sept), y una foto que
     falta es mejor que un enlace roto visible como texto.
  Probado con 3 casos en Node (nombre compuesto sin cerrar, nombre compuesto cerrado con
  URL mala, nombre sin ninguna relación) — los 3 se comportan como se espera.
  Desplegado (GitHub Action "Deploy Worker" run #34, commit `af892fb`, **Worker Version
  ID `c16509a2-4976-467f-9b70-0893c0ece113`**) — sin confirmar contra `/version`, mismo
  bloqueo de red del contenedor de siempre.
  **Pendiente: que Paco repita la guía desde una captura con nombres de sitio largos o
  compuestos (tipo "Elizondo y Baztán") y confirme que la foto ya no sale rota.**

- **Quinto y sexto hallazgo del mismo hilo foto+guía, 19 sept 2026, DESPLEGADOS, sin
  confirmar en pantalla.** La foto duplicada ya no salió (fix anterior confirmado
  funcionando), pero Paco reportó dos cosas más probando otra vez:
  1. **Sigue cortándose, ahora sin duplicar foto.** Causa DISTINTA a la de `max_tokens`
     de antes: con 10 paradas y una llamada a `buscar_foto` por cada una, el bucle agota
     su tope de seguridad de `MAX_TOOL_ITERATIONS` (10) justo al final — visto en
     pantalla, se cortó en la 9ª parada con el markdown de la foto sin cerrar. Como no
     es un corte por `max_tokens`, el aviso "se me ha cortado" del incidente anterior no
     saltaba aquí. **Arreglado, commit `2c4242b`:** (a) aviso previo a Claude cuando
     quedan pocas iteraciones libres para que cierre en texto sin pedir más fotos —ya
     existía este aviso para rutas, ahora también para foto+lista—, y (b) el aviso final
     de corte ahora también salta si el motivo es agotar iteraciones
     (`lastStopReason === 'tool_use'` al terminar el bucle), no solo por `max_tokens`.
  2. **"API KEY REQUIRED" pintado sobre el mapa al pulsar "Crear ruta con mapa".** Causa
     real: Google Maps JS no cargó ese momento (probablemente un bache de red del
     móvil, nada tocado en esta sesión) y el mapa cayó al modo de reserva (Leaflet) —
     que usaba CARTO (`basemaps.cartocdn.com`, tiles "dark_all") como proveedor de
     mapa. CARTO dejó de servir esos tiles en anónimo sin API key en algún momento
     después de abril — **llevaba roto en silencio meses**, porque este camino de
     reserva solo se pisa cuando Google Maps falla, algo raro que no se había vuelto a
     dar hasta hoy. **Arreglado, commit `34d0da6`:** cambiado a OpenStreetMap estándar
     (gratis, sin clave) en los 3 sitios que usaban CARTO (`mapa-ruta.js`,
     `guide-renderer.js` x2). **Sin coste** — los dos proveedores son gratis; el único
     cambio real es visual (mapa claro en vez de oscuro mientras dure el fallback, en
     vez de un watermark inservible). `?v=`: `mapa-ruta.js` a 7, `guide-renderer.js` a 54.
  Desplegado el Worker (GitHub Action "Deploy Worker" run #33, commit `34d0da6`,
  **Worker Version ID `9d611533-04bd-41ad-9c1f-99e8c8d5d69f`**) — sin confirmar contra
  `/version`, mismo bloqueo de red del contenedor de siempre.
  **Pendiente: que Paco repita la guía desde foto con 10 paradas y confirme que llega
  completa (o que, si se corta, ahora avisa con "sigue"), y que si Google Maps vuelve a
  fallar en algún momento, el mapa de reserva ya no muestre el watermark de API key.**

- **Tercer y cuarto incidente foto+guía, mismo 19 sept 2026, DESPLEGADOS, sin confirmar
  en pantalla — uno era regresión propia de esta misma sesión, el otro un bug real
  distinto encontrado con certeza en el código.** Paco probó otra vez la guía de Navarra
  desde foto y reportó dos cosas:
  1. **Foto duplicada por parada.** Causa: el arreglo del incidente anterior (transcribir
     la lista antes de nada) estaba redactado como DOS pasadas sobre la misma lista
     ("EMPIEZA transcribiendo... Después continúa normal: cuenta cada parada...") — Claude
     hizo las dos de verdad y llamó a `buscar_foto` en ambas, duplicando la foto (y la
     llamada a Google Places Photo) por parada. **Regresión mía, de esta misma sesión,
     no de Paco.** Arreglado, commit `826bbbe`: reescrito a una sola pasada — contar cada
     parada YA sirve de transcripción, como mucho una llamada a `buscar_foto` por sitio.
     **Aviso de coste (protocolo §8):** esto BAJA el coste (deshace un doblado accidental
     que yo mismo introduje), no lo sube.
  2. **Pantalla en negro al pulsar "Generar guía con mapa".** Encontrado con certeza
     leyendo el código, no por sospecha: `mapaRuta.init()` (`mapa-ruta.js:39`) hace
     `if (!stops.length) return;` — si la ruta que llega a la vista de itinerario tiene
     **0 paradas válidas** (muy posible aquí: una ruta armada desde una foto no verificada
     contra Google, sin ancla de país, donde el verify final puede descartarlas todas), el
     mapa y las tarjetas no dibujan nada, nada lanza ningún error, y la vista se queda
     completamente negra — sin el aviso de "Reintentar" que ya existe en `salma.js` para
     otros fallos de este mismo botón, porque para que ese aviso salte hace falta que algo
     LANCE una excepción, y aquí no lanzaba ninguna.
     Arreglado, commit `9bf81a8`: `openItinerarioView()` (`mapa-itinerario.js`) ahora lanza
     si `routeData.stops` llega vacío, para que el `catch` ya existente en `salma.js` se
     encargue de deshacer la vista y avisar. De paso, revisados TODOS los sitios que llaman
     a `openItinerarioView` — dos (`cargarGuia`, botón "Volver a la ruta") no tenían
     `try/catch` y se habrían roto con este `throw` nuevo sin capturar nada; protegidos los
     dos con su propio aviso (`showToast`). Solo frontend, `?v=`: `salma.js` a 98,
     `mapa-itinerario.js` a 68. **Sin coste** — no toca ninguna API de pago, solo convierte
     un fallo silencioso en uno visible.
  Desplegado el Worker (GitHub Action "Deploy Worker" run #32, commit `9bf81a8`, **Worker
  Version ID `56ad9988-f5e5-4e0d-bbd1-706c6d228f57`**) — sin confirmar contra `/version`,
  mismo bloqueo de red del contenedor de siempre.
  **Pendiente: que Paco repita la guía desde foto y confirme que sale una sola foto por
  parada, y que si "Generar guía con mapa" no encuentra paradas válidas, ahora avisa con
  "Reintentar" en vez de quedarse en negro** (si el problema de fondo es que esta ruta en
  concreto no tiene ningún sitio verificable por Google, seguirá sin poder montar el mapa
  — pero al menos ya no debería quedarse muda sin decir nada).

- **Segundo incidente con foto+guía el mismo 19 sept 2026, DISTINTO del de arriba aunque
  con la misma raíz de fondo — DESPLEGADO, sin confirmar en pantalla.** Paco repitió la
  prueba con otra captura de Navarra y esta vez NO hubo corte por `max_tokens` — Salma
  directamente no procesó la lista: respondió algo ambiguo y fuera de personaje ("Paco,
  esto activa el modo guía completo y tienes 1 Salma Coin disponible — lo uso para
  generarte la guía ahora. ¿Cómo lo hacemos?", sin listar ni un solo sitio de la
  captura). Paco contestó "Sí" y Salma, con razón desde lo poco que tenía pero mal
  explicado, dijo que no le había llegado ninguna captura ni lista — la imagen ya no
  estaba disponible en ese segundo turno.
  **Causa de fondo, la misma que la de arriba con otro disparador**: el historial de
  conversación (`salma.js`, `this.history.push(...)`) solo guarda TEXTO — nunca una
  descripción de lo que había en una imagen. Si el primer turno con foto no deja
  constancia en texto de lo que había en ella (por corte, como el caso de arriba, o por
  no procesarla bien, como este), el turno siguiente no tiene ninguna forma de saberlo —
  la imagen en sí no sobrevive nunca más de un turno.
  **Encima, `buildMessages()` no tenía NINGUNA instrucción específica para "captura con
  lista de sitios"**: con foto adjunta se salta a propósito todos los bloques de modo
  (RUTA/PLAN/RECOMENDACIONES) y solo queda el `BLOQUE_VISION` genérico (comida/lugar/
  menú/cartel/paisaje/avería) — ninguno de esos 6 casos cubre "captura con lista de
  paradas para una ruta". Sin instrucción clara, Claude se quedó a medias entre el
  bloque de contexto de coins (que se inyecta siempre, en todos los mensajes) y la
  petición real, y salió con esa respuesta ambigua.
  **Arreglo aplicado ahora, commit `7b113d4` (fusionado a `main`)**: nueva instrucción en
  `buildMessages()` para cuando hay foto adjunta — si es una captura con lista de
  sitios/paradas, la respuesta debe EMPEZAR transcribiendo cada parada en texto plano
  antes de cualquier otra cosa (así queda guardada en el historial de texto pase lo que
  pase después) y evitar preguntas ambiguas tipo "¿cómo lo hacemos?". **Aviso de coste
  (protocolo §8):** es solo una instrucción de texto más en el prompt (unos tokens de
  entrada de más) — no añade ninguna llamada nueva a ninguna API; el presupuesto de
  salida (14.000 tokens, fix de arriba) no cambia.
  Desplegado (GitHub Action "Deploy Worker" run #31, commit `cc14993`, **Worker Version
  ID `288ab6a4-e8ac-4e16-b6d4-ad149580e9a2`**) — sin confirmar contra `/version`, mismo
  bloqueo de red del contenedor de siempre.
  **Dos cosas más, pedidas por Paco explícitamente para dejar SOLO anotadas, sin tocar
  código hoy:**
  1. **El sistema de coins hay que estudiarlo aparte.** El bloque `[INSTRUCCIONES SOBRE
     COINS...]` que se inyecta en TODOS los mensajes (línea ~2728 de `buildMessages()`)
     parece ser lo que confundió a Claude en este incidente — mezcla instrucciones sobre
     cuándo mencionar coins con la petición real del usuario. Antes de tocarlo hay que
     revisarlo con calma (no es un fix de una línea, es entender cómo interactúa con
     cada modo/flujo) — pendiente de sesión propia.
  2. **Principio general para cuando Salma no puede hacer algo o algo falla**: no debe
     dar respuestas ambiguas — debe decir claramente qué está pasando y proponer una
     solución concreta (ej. "se me perdió la lista, vuelve a mandarla y sigo" en vez de
     "¿cómo lo hacemos?"). Salma se conoce mejor que nadie — cuando algo no cuadra por
     su lado, debería saber explicarlo. Queda como principio a aplicar la próxima vez
     que se toque el prompt (`BLOQUE_ACCION`/`BLOQUE_ANTIPAJA`), no implementado hoy.
  **Pendiente: que Paco repita la prueba con una captura de lista de sitios y confirme
  que Salma empieza transcribiendo la lista en vez de responder ambiguo, y que un
  "sigue"/"sí" después sí conserva el contexto.**

- **Guía pedida a partir de una captura (lista de puntos) se cortaba a media respuesta,
  y luego Salma no sabía que había sido ella la que se cortó — 19 sept 2026, DESPLEGADO,
  sin confirmar en pantalla.** Reportado por Paco con vídeo: pidió una guía de Navarra a
  partir de una captura con 10 puntos; Salma respondió bien las 2 primeras paradas (texto
  + foto) y se cortó a mitad de la 3ª (Selva de Irati) con el markdown de la foto sin
  cerrar (`![Selva de Irati](https://...` en crudo, sin `)`, como texto/enlace larguísimo).
  Al preguntarle "¿por qué se corta?", Salma contestó "no me ha llegado ninguna captura,
  vuélvemela a mandar" — la captura sí había llegado y ya la había usado.
  Causa real, en `worker/salma-worker.js`: cualquier mensaje con foto/captura adjunta
  (`imageBase64`) tenía SIEMPRE el tope genérico de **6000 tokens** de salida
  (línea ~9137), sin mirar si lo que pedía era una guía larga de varios puntos con foto
  cada uno — muy por debajo de los 14.000 que ya tienen las recomendaciones normales
  (`guidedIsReco`), justo porque esas están excluidas a propósito cuando hay foto. Con 10
  paradas y una foto por parada, Claude se quedó sin margen y Anthropic le cortó la
  respuesta (`stop_reason: max_tokens`) literalmente a mitad de teclear la URL de la 3ª
  foto. Para respuestas de ruta (JSON) sí existe un rescate para este caso (`RESCATE 1/2`);
  para una respuesta de texto normal como esta, no había nada — el bucle simplemente
  paraba y mandaba el texto roto tal cual como respuesta final. Con eso en el historial,
  el turno siguiente no tenía ninguna pista de que fue la propia Salma la que se quedó
  corta, y respondió a ciegas con la excusa genérica de "no me llegó la foto".
  **Arreglo, 2 piezas, commit `c96f3fb` (fusionado a `main` en `fb25c11`):**
  1. Tope de tokens con foto adjunta subido de 6000 a **14.000** — mismo margen que las
     recomendaciones normales. **Aviso de coste (protocolo §8), dado y confirmado con
     Paco antes de implementar:** el coste solo sube en los casos que YA se estaban
     cortando (como este) — una respuesta corta con foto no cambia nada, Claude para sola
     antes de llegar al tope nuevo.
  2. Si aun así una respuesta de texto (no ruta) se corta por `max_tokens`: se limpia
     cualquier `![Nombre](url-a-medias` sin cerrar al final (para no volcar la URL en
     crudo) y se añade un aviso claro: *"Se me ha cortado aquí — dime 'sigue' y continúo
     justo donde lo he dejado, o pídemelo por partes más cortas si lo prefieres."*
  Desplegado (GitHub Action "Deploy Worker" run #30, commit `fb25c11`, **Worker Version ID
  `24bbcb68-dbda-4800-86ee-9fecd6c4fa5b`**) — esta sesión no pudo confirmarlo además contra
  `/version` porque el proxy de red del contenedor bloquea las llamadas salientes a
  `salma-api.borradodelmapa-api.workers.dev` (mismo bloqueo ya documentado otras veces).
  **Pendiente: que Paco repita la guía desde una captura con varios puntos y confirme que
  ya no se corta (o que, si se corta, ahora avisa con "sigue" en vez de dejar texto roto).**

- **Fotos del itinerario fallando en cadena con "Failed to fetch" en una guía de
  varios días de antigüedad ("Oriente salvaje", Asturias/Picos, 12 paradas) — 16 sept
  2026, DOS BUGS REALES ENCONTRADOS Y CORREGIDOS, pero el síntoma sigue sin
  resolverse del todo: hay un problema de conexión de red aparte, sin diagnosticar.**
  Reportado por Paco, reproducido en dos dispositivos y dos redes distintas (móvil
  datos Orange + PC WiFi) — descarta problema del dispositivo/red de Paco como causa
  única, aunque sí hay una pieza de red real de por medio (ver más abajo).
  **Bug 1 (real, corregido):** las 12 fotos se pedían todas en el mismo milisegundo al
  abrir el itinerario, sin ningún control de concurrencia ni timeout en la llamada del
  Worker a Google — si Google iba lento, el fetch se quedaba colgado hasta que
  Cloudflare cortaba el Worker por su cuenta. Fix: fotos por tandas (`_processPhotoQueue`
  en `mapa-itinerario.js`) + timeout de 8s en `_getCachedPlacePhoto` (`salma-worker.js`).
  Commit `5fac525`, Worker Version ID `a82788ee-f757-494a-a98c-111f159dde1d`.
  **Bug 2 (real, corregido, 2 vueltas):** el `photo_reference` de Google Places **no es
  un ID permanente** — caduca con el tiempo, y con una guía de días de antigüedad el
  `ref` guardado en su día ya no resolvía nada en Google. El endpoint `/photo` no tenía
  ningún plan B: si el ref fallaba, 404 sin más. Fix: si el `ref` falla y llega el
  nombre de la parada (mapa-itinerario.js lo manda siempre desde ahora, junto al ref),
  el Worker busca una foto NUEVA por nombre+coords antes de rendirse — mismo mecanismo
  que ya existía para paradas sin ref guardado. **Primera versión de este fix tenía a su
  vez un bug** (si el KV tenía guardada OTRA referencia igual de caducada, se probaba,
  fallaba, y ahí se paraba sin llegar a Find Place) — encontrado leyendo el código YA
  DESPLEGADO directo desde Cloudflare (no desde git) tras el primer "sigue sin ir".
  Corregido en una segunda vuelta: si la ref del KV también falla, se sigue a Find
  Place igual que si no hubiera habido ningún hit de KV. Commits `278b906` y `849421b`,
  Worker Version IDs `9d697677-4a4e-4123-a1eb-787f070a30d7` y
  `cf5f181e-c8f8-4010-bd56-9dd0e9669dfd` (este último es el vigente).
  **Con los dos bugs corregidos y confirmados desplegados (verificado leyendo el código
  REAL en producción, no solo el commiteado), el síntoma seguía sin resolverse —
  probado en pantalla por Paco tras cada deploy.** Diagnóstico posterior, con evidencia
  dura, no solo sospecha:
  1. Las tandas y el reintento SÍ funcionan tal como se diseñaron (confirmado en el
     panel 🐛 de Paco: las peticiones salen agrupadas de 4 en 4, y el reintento salta
     exactamente a los 3s como estaba programado).
  2. El fallo real pasó de tardar 20-53s (antes del fix 1) a solo ~6-7s — más rápido,
     pero **sigue siendo "Failed to fetch"**, no un error JSON limpio como daría
     nuestro propio timeout de 8s si fuera el que estuviera disparándose.
  3. **Prueba definitiva de que ya no es un bug de este código**: `/practical-info`
     (usado por el Copiloto) es una lectura de KV pura, sin ninguna llamada externa,
     con try/catch completo — es imposible que produzca "Failed to fetch" desde su
     propia lógica (cualquier error interno ahí da un JSON normal). Falló con el mismo
     síntoma exacto, en la misma ventana de tiempo, que las fotos.
  4. Paco ejecutó `npx wrangler tail salma-api` para diagnosticar en vivo — la sesión
     de tail se creó bien en Cloudflare, pero su ordenador **no pudo conectar con el
     servidor de logs en vivo de Cloudflare**: `ETIMEDOUT` (IPv4, `188.114.96.5` y
     `188.114.97.5`) y `ENETUNREACH` (IPv6, `2a06:98c1:3120::5` y `2a06:98c1:3121::5`)
     simultáneos. El DNS del propio Worker sí resuelve bien (`104.21.75.154` /
     `172.67.178.108`, IPs normales de Cloudflare) — comprobado desde esta sesión.
  **Conclusión de esta sesión, con la información disponible**: hay algo en la ruta de
  red entre el lado de Paco y (una parte de) la infraestructura de Cloudflare que no
  está funcionando bien — no se ha podido aislar más sin acceso a analíticas/logs de
  Cloudflare (esta sesión no tiene esa herramienta) ni a `wrangler tail` (bloqueado por
  la misma razón que se investiga). **Mitigación aplicada mientras tanto, sin poder
  arreglar la causa de fondo**: tandas de fotos más pequeñas (4→2) y más espaciadas
  (400ms→900ms), y hasta 2 reintentos en vez de 1 (4s y 8s de margen). Commit `7b7e5be`
  — solo frontend, `mapa-itinerario.js?v=59` en `index.html`, no hace falta redeploy
  del Worker.
  **RESUELTO — 16 sept 2026, noche.** Lo que esta sesión veía como "algo raro en la
  red de Paco" era la primera fase del mismo corte: unas horas después, **todo**
  `*.paco-defoto.workers.dev` (no solo `wrangler tail`) dejó de responder — `/`, `/photo`,
  `/practical-info`, todo, con el mismo patrón exacto (`Failed to fetch`, mismas IPs
  `188.114.96.5`/`97.5`). Diagnóstico definitivo: el subdominio `workers.dev` de la
  CUENTA (no un Worker en concreto — le pasaba también al Worker viejo `salma`) estaba
  enrutando a un tramo de IPs de la red WARP de Cloudflare que no respondía —
  confirmado con `nslookup` (local y 8.8.8.8) y con una conexión TCP pura al puerto 443
  (timeout antes de TLS, antes de que el Worker ejecute nada). Prueba de aislamiento:
  un Worker de OTRA cuenta Cloudflare cualquiera resolvía a IPs normales
  (`104.21.x`/`172.67.x`) y respondía al instante. Causa de fondo del lado de
  Cloudflare sin confirmar (no hay banner ni incidencia visible en el dashboard de
  Paco); las teorías de "abuso por tráfico anómalo" o "Zero Trust mal configurado" se
  descartaron sin evidencia real que las sostuviera — no dar por buena ninguna causa
  sin prueba dura si vuelve a pasar.
  **Fix aplicado (sin esperar a que Cloudflare lo arreglara)**: Paco renombró el
  subdominio `workers.dev` de la cuenta desde el dashboard (Trabajadores y Pajes →
  cambiar subdominio) de `paco-defoto` a **`borradodelmapa-api`** — el nuevo nombre
  resolvió de inmediato a IPs sanas. Commit `1f33303c`: `window.SALMA_API`
  (`index.html`, `404.html`), `admin.html`, fallbacks en `app.js`/`salma.js`/
  `historia.js`/`translator.js`, y las URLs hardcodeadas del Worker (`/photo`, `/doc`,
  `sitemap-guides.xml`) actualizadas al dominio nuevo. Worker desplegado, Version ID
  `a81a96d6-0fe9-415f-a797-2e384d6db7e3`. **Confirmado en pantalla por Paco.**
  Los dos bugs reales de fotos caducadas de más arriba (Bug 1 y Bug 2) siguen siendo
  arreglos válidos y quedan — no eran la causa de este corte, pero eran bugs reales
  aparte.
  **Pendiente, nuevo**: fotos de galería/diario/avatares/documentos **subidas antes de
  hoy** pueden seguir rotas — su URL absoluta quedó guardada en Firestore con el
  dominio viejo (`paco-defoto.workers.dev`), que ya no enruta a nada y no se puede
  recuperar. Las fotos del itinerario (Google Places, pedidas en caliente vía
  `/photo?ref=`) NO tienen este problema — se arreglaron solas con el cambio de
  dominio. Si Paco confirma que ve galería/diario con fotos rotas: la solución más
  simple es reescribir el dominio viejo→nuevo al renderizar (mismo path, mismo R2, solo
  cambia el hostname), no hace falta migrar Firestore.
  Además: quedó una `git stash` sin usar en el repo del portátil de Paco (edición de
  esta sesión hecha sobre una copia local que estaba 60 commits desactualizada,
  superada por el fix real ya commiteado) — inofensiva, se puede borrar cuando se
  quiera con `git stash drop`.

- **Facturación de Google Places disparada a 82,26€ en los primeros 14 días de sept
  (+15.420% vs periodo anterior) — auditoría completa + fixes DESPLEGADOS, 15 sept
  2026, sin confirmar en pantalla.** Paco vio el cargo en Google Cloud Billing
  (Find Place 21,21€, Atmosphere Data 19,54€, Places Photo 18,79€, Contact Data
  22,19€) y pidió estudiar el Worker línea por línea, no solo los dos sitios obvios.
  Fusionado a `main` (commit `14955c6`) y desplegado (GitHub Action "Deploy Worker"
  run #17, **Worker Version ID `fa3b910f-b941-4b63-bd5e-7a17a9aca5f0`**) — esta
  sesión no pudo confirmarlo además contra `/version` porque el proxy de red del
  contenedor bloquea las llamadas salientes a `salma-api.paco-defoto.workers.dev`
  (mismo bloqueo ya documentado el 14 sept, política de la organización, no del
  Worker) — Paco o una sesión sin esa restricción puede comprobarlo con
  `curl.exe -s https://salma-api.paco-defoto.workers.dev/version`.
  **Arreglado:**
  1. Narrador: `/nearby-pois` (Nearby Search de pago) se pedía cada 55-60s aunque el
     usuario estuviera parado — ahora solo si se movió >30m desde el último check
     real (`salma.js:checkNearbyPOIs`). El botón "Olvidar avisos" y el chequeo
     forzado al activar el Narrador se reseteó aparte para que sigan disparando al
     momento, no se vean bloqueados por el nuevo gate.
  2. `/photo`: las fotos de Google Places ya se guardan en R2 (bucket `SALMA_PHOTOS`
     existente, prefijo `photocache/`, hash del `photo_reference`) la primera vez y
     se sirven de ahí siempre después — antes cada visualización de una guía ya
     generada volvía a pagar la misma foto a Google, indefinidamente. `/place-details`
     reutiliza la misma caché en vez de pegarle a Google por su cuenta.
  3. `buscarLugar`/`searchPlacesForHelp` (tool `buscar_lugar` + búsqueda automática de
     ayuda en 6 de las 8 categorías): ya no piden `rating`/`price_level`/
     `opening_hours` a Place Details — esos datos ya venían gratis en el Text Search
     anterior (o, en el caso de `opening_hours` de `searchPlacesForHelp`, no se
     usaban en ningún sitio del código). Lo que sí hace falta (teléfono, web) se
     cachea 30 días en KV por `place_id` (`placedetails:{place_id}:{fields}`).
  4. `verifyAllStops` (la función que verifica cada parada al generar o editar una
     ruta — el mayor cargo de los cuatro): al editar/regenerar una ruta guardada,
     las paradas cuyo nombre coincide exacto con una ya verificada se copian tal
     cual, sin llamar a Google (por la ruta anterior, `opts.previousStops`, o por
     una caché KV de 30 días `verifiedspot:{país}:{nombre}` entre rutas distintas
     de usuarios distintos). Además, `opening_hours`/`editorial_summary` — que no se
     leen nunca del candidato de Find Place, solo del Place Details posterior — se
     quitaron del `FIELDS` de Find Place, y en el Place Details final solo se piden
     si esa parada concreta aún no los tiene. **A propósito NO se tocó el backoff de
     attempt2/attempt3** (los reintentos con radio mayor / Text Search cuando Find
     Place falla) — es lo único de toda la auditoría con riesgo real de bajar la
     calidad de verificación en vez de solo el coste (son los que rescataron los
     faros de la ruta costera de la saga del 11-12 sept) — queda pendiente de
     decidirlo con Paco aparte, no se recortó a lo bruto.
  5. `searchNearbyPlaces` (flujo "quiero ir a..."): caché KV 7 días por tipo + celda
     de ~1km — cien personas preguntando por el mismo destino no disparaban cien
     Nearby Search idénticas.
  Nada de esto cambia lo que ve el usuario en una ruta ya verificada — solo evita
  repetir llamadas a Google que no aportaban nada nuevo. `?v=` de `salma.js` subido
  a 87 en `index.html`.

  **REGRESIÓN encontrada y arreglada el mismo día (16 sept 2026): fotos rotas en el
  itinerario tras el fix de arriba.** Paco reportó (captura de "Playa de Penarronda"
  en una ruta ya generada) icono de imagen rota en las tarjetas del itinerario.
  Causa: el guardado en R2 de la foto (punto 2 de arriba) se lanzaba en segundo plano
  sin esperar a que terminase; el JSON de `/photo?...&json=1` (usado por
  `mapa-itinerario.js`, `guide-renderer.js`, `mapa-ruta.js`, `app.js`,
  `bitacora-renderer.js`, `salma.js`) devolvía una URL apuntando directo al fichero de
  R2, que si aún no existía daba 404 → icono roto. Fix: esa URL ahora apunta a nuestro
  propio `/photo?ref=X` (siempre válido, resuelve de R2 o de Google al vuelo) en vez
  del fichero de R2 directo, y el guardado en R2 ahora usa `ctx.waitUntil()` para no
  cortarse a medias. **No cambia el coste** — misma llamada a Google que ya estaba
  contada arriba, solo corrige qué URL se entrega. Fusionado a `main` (commit
  `6136baf`) y desplegado (GitHub Action "Deploy Worker" run #18, **Worker Version ID
  `bf3db6a4-fdf2-4bef-992c-12a75ce5583f`**).

  **SEGUNDA vuelta de la misma regresión, mismo día — causa real: caché HTTP del
  navegador, no el Worker.** El fix de arriba SÍ se desplegó bien (confirmado con el
  log de Paco: `[FOTO] url recibida` seguía devolviendo el patrón viejo
  `/photo/photocache/<hash>.jpg` con el Worker ya en `bf3db6a4`), pero las respuestas
  de `/photo?...&json=1` y `/place-details` llevaban `Cache-Control: max-age=86400`
  (24h) — cualquier navegador que hubiera pedido esa misma foto ANTES del primer fix se
  quedó sirviendo, de su propia caché, la respuesta vieja con la URL rota, sin volver a
  preguntarle nada al Worker aunque este ya estuviera arreglado. Diagnosticado gracias a
  un log de diagnóstico añadido a propósito en `mapa-itinerario.js` (`console.log` al
  pedir cada foto + `onerror` en el `<img>`, `?v=56`) que confirmó que el fetch SÍ
  llegaba y SÍ traía una URL — solo que la URL en sí era la vieja. Fix: esas 3
  respuestas (son solo un puntero a la foto, no la imagen) pasan a `Cache-Control:
  no-store` — la imagen real sigue con su caché fuerte de 1 año en `/photo?ref=X`, eso
  no cambia. **Coste: cero cambio en llamadas a Google** — `no-store` solo afecta a
  cuántas veces el navegador pregunta al propio Worker por la URL (barato), la caché en
  R2 que evita pagarle a Google sigue intacta. Fusionado a `main` (commit `08db8c8`) y
  desplegado (GitHub Action "Deploy Worker" run #19, **Worker Version ID
  `23a51468-183a-4aea-8ba8-fc2017077818`**).

  **CONFIRMADO EN PANTALLA por Paco (16 sept) — con matiz importante sobre `no-store`.**
  El `no-store` de arriba es correcto pero **no es retroactivo**: solo evita que el
  navegador guarde la respuesta a partir de ese despliegue, no invalida una copia que
  ya tuviera guardada de antes (con la regla vieja de 24h) — mientras esa copia siga
  "fresca" según la política con la que se guardó, el navegador ni siquiera vuelve a
  preguntarle al Worker. Por eso, tras desplegar el fix, Paco SEGUÍA viendo la URL
  rota — hasta que borró manualmente "imágenes y archivos en caché" desde Chrome
  (Configuración → Privacidad y seguridad → Borrar datos de navegación), momento en
  el que la ruta cargó bien. Con el `no-store` ya desplegado, esto no debería volver a
  hacer falta para nadie que pida una foto POR PRIMERA VEZ a partir de ahora — el borrado
  manual solo hizo falta esta vez porque el caché ya estaba puesto desde antes.
  **Narrador parado — CONFIRMADO EN PANTALLA por Paco (16 sept, Luarca), con log
  completo revisado línea por línea.** Primer check a las 10:56:38; durante los 10
  minutos siguientes (hasta desactivarlo a las 11:06:35) la posición nunca se movió
  más de ~23m del punto comprobado — **cero checks adicionales** en toda esa ventana
  (antes del fix habría sido una Nearby Search de pago cada 60s sin parar). Al
  reactivarlo (11:19:58) el chequeo forzado saltó al instante, como está diseñado. Al
  moverse de verdad y superar los 30m (11:21:15), volvió a chequear solo y narró
  correctamente la Casa Natal de Severo Ochoa. Comportamiento exactamente el buscado.

  **Sigue pendiente, lo único que queda de toda esta saga**: que Paco genere o edite
  una ruta real para confirmar que el resto de los fixes de facturación
  (`verifyAllStops`, `buscar_lugar`) no cambiaron nada de lo que ve en una ruta nueva.

- **Endpoint `/pin` (identificar lugar por foto) llevaba tiempo roto sin que nadie lo
  supiera — encontrado y arreglado el 16 sept 2026 al implementar la cámara del
  Narrador, DESPLEGADO, sin confirmar en pantalla.** Buscando cómo reutilizar la
  identificación de lugar por foto para una función nueva, se comprobó (varios `grep`
  sobre `worker/salma-worker.js` sin ningún resultado) que el endpoint `POST /pin` —
  documentado en la tabla de endpoints de este mismo archivo y todavía llamado por
  `app.js` desde la hoja de "foto → pin en el mapa" del diario — **ya no existe en el
  Worker actual**. En algún punto de la historia del código se perdió (existía en un
  backup de abril, `backups/salma-worker-20260406.js`, con GPT-4o-mini) sin que ningún
  commit lo borrase a propósito ni nadie lo notara — daba 404 en silencio. Restaurado
  con el mismo patrón que `/narrate`/`/historia-lugar`: Claude Sonnet con visión (antes
  GPT-4o-mini) vía el mismo Cloudflare AI Gateway que ya usa el chat principal, más una
  pista de lat/lng para no confundir el sitio real con un homónimo de otra parte del
  mundo (mismo bug de desambiguación que ya se arregló en `/historia-lugar` el 14 sept).
  **Aviso de coste (protocolo §8):** esto restaura una llamada a Claude Sonnet con
  visión que YA formaba parte del producto (mismo modelo, mismo Gateway que analizar
  una foto en el chat normal) — no es una ruta de gasto nueva, es arreglar un acceso
  que llevaba tiempo devolviendo error sin coste real (nunca llegaba a llamar a
  Claude). Coste por uso: el mismo que ya tiene identificar una foto en el chat.

- **Cámara dentro del propio módulo Narrador — implementado 16 sept 2026, DESPLEGADO,
  sin confirmar en pantalla.** Propuesta de Paco tras notar que identificar por foto
  (chat) había acertado en algún caso donde el Narrador por GPS aún tenía bugs (ver 15
  sept, sección "✅ Ya resuelto") — con esos bugs de GPS ya arreglados esto pasa a ser un
  atajo más, no un respaldo de emergencia. Antes de implementarlo se consultó con Paco
  si convenía un banner persistente mientras el Narrador está activo explicando la
  opción de cámara; se descartó a favor de algo menos intrusivo, que fue lo que se
  implementó: botón "📷 Identificar por foto" dentro del menú que ya se abre al tocar el
  chip Narrador estando activo (`showNarratorActiveMenu()` en `app.js`, junto a
  "Olvidar avisos"/"Desactivar Narrador"), más un aviso puntual **una sola vez**
  (`localStorage: bdm_narrator_camera_tip_seen`) la primera vez que se activa el
  Narrador tras este cambio, explicando dónde está el botón — no un banner fijo.
  Funciones nuevas en `app.js`: `narratorTakePhoto()` (input de archivo oculto con
  `capture="environment"`) y `_processNarratorPhoto(file)` (reutiliza
  `salma._compressImage()`, ya existente para la cámara del chat, y llama a `/pin`
  restaurado arriba). CSS nueva `.narrator-active-camera` en `styles.css`. `?v=` de
  `app.js` a 108 y `styles.css` a 96 en `index.html`. Fusionado a `main` (commit
  `3b23747`) y desplegado (GitHub Action "Deploy Worker" run #20, **Worker Version ID
  `010ea7f9-0bbc-495e-9738-b85059ff0911`**). **Aviso de coste:** ver entrada de `/pin`
  justo arriba — este botón es la única puerta de entrada nueva a esa llamada, sin
  coste adicional respecto a lo que ya existía.

  **Simplificado el mismo 16 sept 2026, a petición de Paco ("se queda un poco escondido
  y enrevesado") — DESPLEGADO (solo frontend, GitHub Pages), sin confirmar en
  pantalla.** El acceso de arriba (botón dentro del menú del chip) seguía necesitando
  tocar el chip → abrir el menú → encontrar el botón entre otros dos. Ahora hay dos
  atajos directos, sin pasar por ningún menú:
  1. **Badge 📷 en la esquina del propio chip Narrador** (solo visible cuando está
     activo, igual que se pone verde) — tocarlo abre la cámara al momento;
     `updateNarratorChipUI()` lo añade/quita al activar/desactivar sin recargar.
  2. **Botón dentro del propio toast/aviso** del Narrador — para identificar la foto
     justo cuando salta la notificación, sin ni tocar el chip.
  El botón del menú se queda como tercer acceso (ya no es el único). Texto unificado
  en los tres sitios, a petición explícita de Paco: **"Identifica lo que ves al
  momento por foto"** (se quitó cualquier mención a que Salma "no ha acertado").
  Fusionado a `main` (commit `f755915`) — cambio solo en `app.js`/`salma.js`/
  `styles.css`/`index.html` (`?v=`: `app.js` 109, `salma.js` 88, `styles.css` 97), no
  toca el Worker, no hace falta redeploy. **Sin coste** — sigue siendo el mismo
  endpoint `/pin` de arriba, solo cambia cómo se llega a él. **Pendiente: que Paco
  active el Narrador, confirme que ve el aviso puntual la primera vez, que el chip
  muestra el 📷 en verde, y que tocarlo (o el botón del toast) identifica el sitio
  bien.**

- **Botón de expandir/minimizar el tiempo — REVERTIDO, 15 sept 2026.** Se probó
  quitar el label "SEP" de la cabecera y poner ahí el toggle de expandir/minimizar
  el tiempo, más grande y visible (commit `cf6fcd5`). Paco pidió revertirlo
  ("retrocede, déjalo como estaba") — deshecho con `git revert --no-edit cf6fcd5`
  (commit `960dd78`, nunca se reescribe historia). Vuelto exactamente a como
  estaba: "SEP" de nuevo en la cabecera, el toggle pequeño (`.wx-toggle`, sin
  fondo ni borde) de vuelta dentro del propio banner del tiempo. `?v=` bajados de
  vuelta: `salma.js` a 86, `app.js` a 107, `styles.css` a 95. **Sin nada pendiente
  de esto** — cerrado, no se retoma salvo que Paco lo pida de nuevo explícitamente.
- **Enlace "Abrir en Google Maps" de sitios buscados (buscar_lugar/hoteles) no
  llevaba a ningún sitio — 15 sept 2026, DESPLEGADO, sin confirmar en pantalla.**
  Reportado por Paco con "Camping Playa de Tapia": el enlace salía bien pintado
  ("📍 Abrir en Google Maps") pero al tocarlo no resolvía nada — lo probó pegando el
  `place_id` a mano en la app de Google Maps y dio "No hay resultados". Causa: 8 sitios
  del Worker generaban el enlace con el formato viejo `maps/place/?q=place_id:XXX` —
  un `place_id` pegado ahí sin más no es un formato de URL que Maps sepa resolver de
  forma fiable por sí solo (mismo tipo de fallo que ya se arregló el 10 sept para los
  enlaces "Cómo llegar", que entonces tampoco llevaban `?api=1`). Fix: función nueva
  `mapsPlaceFichaUrl(name, placeId)` con el esquema oficial de Google (Search Action:
  `search/?api=1&query=<nombre>&query_place_id=<id>`), que si localiza el sitio exacto.
  Reemplazado en los 8 sitios que generaban el enlace roto: `searchNearbyPlaces`,
  `findPlace` (verify), 2 casos en `buildMapsLinksFromStops`, 2 handlers de
  `buscar_lugar`/restaurantes, y `searchHotelsGoogle`/`searchPlacesGoogle`. Sin cambios
  en frontend — no hace falta `?v=`. **Desplegado (commit `dbae99a`, GitHub Action
  "Deploy Worker" run #16, Worker Version ID `34214c93-395a-4a24-a544-4af9ba3acf56`).
  Pendiente: que Paco pida otro sitio (restaurante, camping, hotel...) y confirme que
  el enlace "Abrir en Google Maps" sí abre el sitio correcto esta vez.**
- **Chip "parada más cercana" del mapa decía 30km cuando la distancia real por
  carretera eran 44km — 15 sept 2026, FUSIONADO, sin confirmar en pantalla.** Reportado
  también desde Mondoñedo. Causa: `_updateNearestChip()` en `app.js` (~línea 4050) usa
  `_haversineKm` — línea recta entre el GPS del usuario y la parada, no la carretera
  real. En zonas de costa/montaña con curvas (como Galicia) la diferencia puede ser
  grande. **Arreglo aplicado ahora, deliberadamente parcial**: el chip ya dice "44.0 km
  recta" en vez de "44.0 km" a secas, para que no se lea como si fuera la distancia real
  de carretera — cambio de una línea, sin coste, desplegado ya.
  **Lo que NO se ha hecho, a propósito, y necesita que Paco decida**: calcular la
  distancia real de carretera (Directions API) en vez de la línea recta. No es trivial
  porque este chip se recalcula en cada posición GPS nueva (`watchPosition`, cada ~5s
  mientras se mueve) — pedir Directions esa frecuencia dispararía el coste y el rate
  limit de Google sin necesidad. Si se quiere la distancia real, habría que limitar
  cuánto se pide (ej. solo cuando cambia la parada más cercana, o cada X minutos, con
  caché) — a definir con Paco antes de tocar esto, no se ha implementado.
  `?v=` de `app.js` subido a 104 en `index.html`. **Fusionado a `main` (commit
  `ac24571`) y ya en GitHub Pages.**
  **Distancia real de carretera — implementada, 15 sept, FUSIONADO, sin confirmar en
  pantalla.** Confirmado con Paco: sí la quiere, con el límite de 5 minutos que él
  mismo propuso (~$0,005/llamada Directions API — a 5 min, céntimos por hora de
  viaje en vez de varios euros). Implementado en `app.js`: `_updateNearestChip()`
  sigue calculando la línea recta al momento (instantáneo, sin coste) pero ahora,
  si la parada más cercana está a ≥1km, además dispara `_fetchRealNearestDistance()`
  — llama al `/directions` del Worker (ya existía, no hace falta tocar el Worker) y
  cachea el resultado en `_nearestChipRealDist` — **solo si cambió la parada más
  cercana desde la última vez, o pasaron ≥5 min**, nunca en cada GPS tick (~5s). En
  cuanto llega la respuesta, el chip pasa de "X km recta" a la distancia real de
  Google (ej. "44 km"), sin la palabra "recta". Si Directions falla o no hay red, se
  queda con "recta" hasta el siguiente intento — nunca se bloquea ni rompe el chip.
  `?v=` de `app.js` subido a 107 en `index.html`. **Pendiente: que Paco conduzca un
  rato con el mapa live abierto y confirme que el chip pasa de "recta" a la
  distancia real a los pocos segundos, y que se actualiza si cambia de parada.**
- **`FOTO_TAG: palabra` se veía como texto crudo en el chat al identificar un lugar con
  la cámara — 15 sept 2026, FUSIONADO, sin confirmar en pantalla.** Mismo reporte de
  Mondoñedo: la respuesta sobre la catedral (correcta en contenido) terminaba con
  "FOTO_TAG: monumento" visible tal cual. Mismo bug exacto que `HISTORIA_LUGAR` (ver
  commit `0e0dcef`, 14 sept, arreglado horas antes por la otra sesión) pero en
  `FOTO_TAG`, que nunca había tenido el mismo tratamiento — de hecho no existía NINGÚN
  `.replace()` de `FOTO_TAG` en todo `salma.js`. El Worker sí lo quita del `reply` final,
  pero eso solo llega a pantalla si el evento `done` dispara un re-render; si no, se
  queda el texto ya streameado en vivo, marcador incluido. Añadido en los mismos dos
  sitios donde ya se ocultan `SALMA_ACTION`/`HISTORIA_LUGAR` (chunk en vivo + re-render
  del done). `?v=` de `salma.js` subido a 81 en `index.html`. **Fusionado a `main`
  (commit `7232e6d`) y ya en GitHub Pages. Pendiente: que Paco confirme en pantalla
  identificando un lugar con la cámara.**
  **Propuesta de Paco, sin implementar todavía**: añadir un botón de "foto" fácil de
  encontrar dentro del propio módulo Narrador, ya que identificar por foto SÍ dio el
  resultado correcto mientras el Narrador por GPS no — a valorar cuando confirme si el
  fix de coordenadas de arriba ya resuelve el problema de raíz o si además conviene el
  atajo.
- **"Ver ruta completa" en el modal de mapa (map-modal.js) solo pintaba 1 parada de
  varias — 14 sept 2026, FUSIONADO Y DESPLEGADO, sin confirmar en pantalla.** Reportado
  por Paco con ruta "4 rías" (Galicia): el chat
  generó bien la guía con varias paradas, pero al tocar "🗺️ Ruta completa en Google
  Maps" el modal fullscreen solo mostraba el marker "1", sin las demás. Causa: el
  mismo día (commit `2894d00`, "sincronizar rama con main") el Worker cambió el
  formato del enlace de ruta — de mandar `lat,lng` puros a mandar **nombre del lugar +
  `place_id`** por parámetro separado (`origin_place_id`/`waypoint_place_ids`/
  `destination_place_id`), buscando enlaces más fieles (bug real que arregló: una
  parada con ficha en Google salía con el nombre de otro negocio al lado). Pero
  `map-modal.js` se había arreglado el día ANTES (commit `bcfa6ca`, 13 sept) asumiendo
  justo el formato viejo — solo sabía leer `origin`/`waypoints`/`destination` como
  texto y nunca miraba los `*_place_id`, así que cada parada se re-buscaba por nombre a
  ciegas (`findPlaceFromQuery`, sin sesgo geográfico) en vez de usar el ID que el
  Worker ya había verificado contra Google — y esa búsqueda por nombre falla a menudo
  con pueblos/miradores pequeños (exactamente el tipo de parada de una ruta de rías).
  Fix: `_extractDest()` ahora también parsea los `*_place_id` de la URL, y
  `_resolvePoint()` los usa con `getDetails()` como fuente primaria (mismo ID, fiable)
  — solo cae a `lat,lng`/búsqueda por nombre si no hay `place_id` para ese punto. El
  destino único ("Cómo llegar" a una sola parada) se dejó intacto a propósito (sigue
  sin usar `placeId`, como ya estaba) para no ampliar el cambio más allá del bug
  reportado. `?v=` de `map-modal.js` subido a 10 en `index.html`. **Fusionado a `main`
  (fast-forward, commit `d0604b5`) y ya en GitHub Pages** — solo queda que Paco repita
  "ruta completa" de una guía con varias paradas y confirme que salen todas numeradas.
- **Fotos del chat a veces salen como markdown crudo (`![Nombre](https://salma-api...` +
  URL larguísima de 200-300 caracteres pegada como texto/enlace, en vez de la imagen) —
  14 sept 2026, FUSIONADO Y DESPLEGADO, sin confirmar en pantalla.** Mismo reporte de
  las 4 rías: la foto de "Costa da Morte" salió
  así. Causa, en dos capas — la propia `salma-worker.js` ya documentaba (comentario
  previo a este fix, línea ~9171) que "Sonnet a veces emite `![Name](` + saltos de línea,
  o `![Name](url...` que nunca cierra con `)` (URL de foto larga truncada al copiarla)":
  Claude tiene que teclear literalmente el `photo_ref` de Google Places dentro del
  markdown (`buscar_foto` se lo da ya hecho y le pide que lo copie), y ese token es un
  string opaco de 200+ caracteres sin significado — un caso conocido de los LLM al
  reproducir cadenas largas al carácter. Ya había un "reparador" para el caso "nunca
  cierra", pero:
  1. Solo cubría el caso sin `)` de cierre. Si Claude colaba un espacio u otro carácter
     de más EN MEDIO del token pero el markdown sí llegaba a cerrar con `)`, el reparador
     no lo tocaba (su regex exigía que lo siguiente al `(` fuera literalmente un salto de
     línea/`![`/fin de texto) — y el frontend tampoco lo reconoce como imagen (su regex
     de `![alt](url)` exige que la URL no tenga espacios), así que se veía el markdown +
     URL en crudo, justo el síntoma reportado.
  2. Ese reparador vivía DENTRO de un bloque `try` enorme (post-procesado: enlaces Maps,
     fotos, días, etc.) cuyo `catch` de emergencia (línea ~9654) manda `allText` —el
     texto sin reparar de ningún tipo— si CUALQUIER cosa de ese bloque lanza una
     excepción (muy plausible justo con la intermitencia de red de esa sesión, ver más
     abajo: varias llamadas a Google Places dentro de ese mismo bloque). En ese caso el
     reparador ni siquiera llegaba a ejecutarse.
  Fix: la lógica de reparación se movió a una función (`_repairBrokenPhotoMarkdown`,
  declarada junto a los mapas `_hotelPhotosByName`/`_placePhotosByName`, de los que ya
  se tira la URL BUENA — la que devolvió Google, nunca la que Claude haya podido teclear
  mal) que ahora cubre los dos casos: con nombre reconocido, SIEMPRE sustituye por la
  URL correcta (cierre bien o mal el markdown de Claude); sin nombre reconocido, solo
  quita el fragmento si de verdad nunca cerró (mismo comportamiento de antes ahí). Y se
  llama tanto en el sitio de siempre como dentro del `catch` de emergencia, para que un
  fallo en cualquier otra parte del post-procesado no deje pasar el markdown roto sin
  reparar. Probado con 4 casos en Node (roto-con-nombre, truncado-con-nombre,
  bien-formado-sin-nombre, ya-correcto) — los 4 se comportan como se espera.
  **Desplegado dos veces 14 sept 2026 vía GitHub Action "Deploy Worker" disparada
  manualmente: primero ~17:35 UTC desde la rama (commit `1416f57`,
  `Current Version ID: 9f6e0d21-4989-4285-8338-909c9418afdf`), y otra vez ~17:43 UTC ya
  desde `main` tras fusionar (commit `d0604b5`, `Current Version ID:
  7b9a94b0-563d-4783-b271-d08e4e76c0d3` — este es el vigente, el anterior queda
  superado).** Rama y `main` ya están sincronizados (fast-forward limpio, sin
  conflictos) — no hay riesgo de que un deploy futuro desde `main` pise este arreglo.
  **Falta**: que Paco pida una foto de un lugar en el chat y confirme que sale como
  imagen, no como texto/markdown crudo.

  **Añadido justo después (14 sept, commit `d5aa423`, Worker `Current Version ID:
  430aab22-5c2a-4a6e-85d7-d515cdd07d48`, YA DESPLEGADO): keepalive en "BLOQUE E"
  (`validarYCorregirLinksMaps`).** Paco reprodujo el "network error" generando una ruta
  justo después del deploy anterior — sin relación con el fix de fotos de arriba, es la
  misma familia de bug que el de PASO 3 (verify): BLOQUE E hace HEAD-checks a los
  enlaces de Google Maps de cada parada (hasta 15, 3s cada uno) sin mandar nada por el
  stream mientras espera, así que la conexión puede cortarse por silencio con la ruta
  ya generada pero sin llegar a mostrarse. Se le puso el mismo keepalive de 3s que ya
  tenía el verify. **CONFIRMADO EN PANTALLA por Paco** — generó otra ruta después del
  deploy y esta vez no se cortó.

  **Foto como imagen: CONFIRMADO EN PANTALLA por Paco (captura de Luarca, Asturias) —
  las 2 fotos salieron como imagen de verdad, no como texto.** El "primero sale la URL
  larga" que describió es solo el texto en vivo mientras Salma "escribe" (sin reparar
  todavía, normal); se corrige solo en cuanto el Worker manda el `done`.

  **Bug nuevo encontrado en esa misma captura, arreglado — 14 sept, commit `0e0dcef`,
  solo frontend (`salma.js?v=80`), YA EN GITHUB PAGES, sin confirmar en pantalla:**
  `HISTORIA_LUGAR: Luarca Asturias` salía como texto plano al final del mensaje. El
  Worker ya lo quita del `reply` final y lo manda aparte como `data.historia_lugar`
  (para el botón "📖 Historia de..."), pero el frontend solo aplicaba ese `reply`
  limpio si el evento `done` disparaba un re-render (enlaces Maps nuevos, etc.) — la
  mayoría de las veces no lo dispara, y se queda el último texto ya streameado tal cual
  lo escribió Claude, marcador incluido. `SALMA_ACTION:{...}` ya se ocultaba así
  durante el streaming; a `HISTORIA_LUGAR:` le faltaba el mismo tratamiento — añadido
  en los mismos dos sitios de `salma.js`. **Falta**: que Paco pida otra foto/historia y
  confirme que ya no sale el marcador en texto.

  **Aviso para la próxima sesión — `main` local corrupto detectado en este contenedor,
  no en GitHub:** al fusionar, `git checkout main` en esta sesión aterrizó en un commit
  (`c4bc918`, "Historial de consultas siempre visible...", 8 sept) que **no comparte
  ningún ancestro común** con el `main` real de GitHub (`git merge` dio "refusing to
  merge unrelated histories"). No es un problema del repo en GitHub — `origin/main`
  estaba bien, con sus 153 commits hasta hoy; era solo el puntero `main` LOCAL de este
  contenedor concreto el que apuntaba a una instantánea vieja y desconectada (probable
  resto de cómo se preparó este contenedor, no un caso de historia perdida real — el
  propio trabajo de esta sesión ya partía correctamente de `origin/main`). Se arregló
  con `git checkout -B main origin/main` (realinea el puntero local con el remoto, no
  toca nada en GitHub) antes de fusionar. Si otra sesión en OTRO contenedor ve el mismo
  "unrelated histories" al tocar `main`: no es la catástrofe del 5 sept, es este mismo
  problema de puntero local — comprobar con `git merge-base main origin/main` (si da
  vacío, es esto) y aplicar el mismo arreglo, nunca forzar un merge de historias no
  relacionadas a ciegas.
  **Dos síntomas más del mismo reporte, investigados, SIN tocar código:**
  1. *Buscador del mapa fullscreen ("Buscar hoteles, farmacias...") no responde* — no
     se ha encontrado la causa exacta; Paco mismo apuntó que puede no merecer la pena
     arreglarlo porque este modal es candidato a desaparecer con la propuesta "mapa
     siempre visible" (V5, ver 🟡 Importante). Queda pendiente de decidir, no de
     diagnosticar más a fondo por ahora.
  2. *"Se ha aturrullado" + `Stream read error: TypeError: network error` (3 veces en
     los logs del panel 🐛, sesión de las 15:49/17:01/17:14)* — el Worker ya tiene
     keepalive activo durante generación y verificación de rutas (cada 3s), así que no
     parece un timeout del servidor. La captura de pantalla de Paco muestra señal móvil
     floja (Orange, 6.2 K/s) en ese momento — coincide con el mismo patrón de
     intermitencia de red ya documentado el 13 sept (curl con timeout, Copiloto
     "Failed to fetch") que se concluyó que no era bug de la app. No se ha tocado nada;
     si se repite con buena señal, ahí sí habría que mirar con `wrangler tail` en vivo.
     (Dato nuevo de este barrido: el bloque de post-procesado que puede estar fallando
     por esa misma intermitencia — ver fix de fotos justo arriba— hace varias llamadas a
     Google Places seguidas; si el `catch` de emergencia salta a menudo por eso, sería
     una pista más a mirar con `wrangler tail` si se repite.)
- **Legal incompleta** — `legal.html` sigue con `[PENDIENTE]` en 5 sitios: nombre del
  titular, CIF/NIF, dirección y email de contacto (obligatorio LSSI/GDPR).
- **Ruta de Ronda pintó el mapa en Benahavís/San Pedro de Alcántara (13 sept) — fix
  desplegado (commit `c33faccb`, worker `408e65a7`), SIN confirmar en pantalla por Paco
  con el escenario exacto.** Diagnóstico distinto del que se sospechaba al principio: NO
  era el bug de ancla tipo "Lisboa" (`7bef91f`) — el destino sí se resolvía bien a Ronda
  real. La causa era que `verifyAllStops()` medía la distancia de cada parada al ancla en
  **línea recta** (`haversineKm`), y con el radio de 3-4 días (120km, además el doble de
  lo que el propio prompt promete en la línea 223: 60km) Benahavís/San Pedro/Estepona
  quedaban dentro. Por carretera real (única vía de montaña, A-397) Estepona son 83km/1h40
  — coincide casi exacto con el "~80km" que describió Paco — mientras que Grazalema/Setenil
  (pueblos blancos legítimos cerca de Ronda) se quedan muy por debajo en ambos cálculos.
  Confirmado con `/directions` real antes de tocar código (ver commit para las cifras).
  Fix: nueva `drivingDistanceKm()` (Directions API) sustituye la línea recta en la "red de
  seguridad" final de `verifyAllStops`, con el radio alineado al prompt (30km 1-2 días,
  60km 3-4 días). Probado UNA vez en pantalla tras desplegar: Ronda 3 días salió limpio
  (Cueva de la Pileta, Benaoján, Montejaque — nada de costa), pero Paco cortó la sesión
  antes de repetir la prueba a fondo — pendiente de una confirmación más sólida.
  **Limitación conocida, aceptada por Paco de momento:** Benahavís/San Pedro (43-52km
  reales, <1h de coche) siguen dentro del radio de 60km y podrían seguir apareciendo — no
  se apretó más el radio a propósito, a la espera de ver si molesta en la práctica.
  **Sin tocar, pendiente aparte:** el filtro por localidad/provincia de más abajo en la
  misma función (3+ días) sigue comparando por texto de provincia sin distancia real —
  para Ronda esto es contraintuitivo porque los pueblos blancos "buenos" (Grazalema,
  Setenil, Zahara) están en Cádiz, no en Málaga como Ronda, así que ese filtro podría
  relegarlos a "cerca de" en vez de dejarlos en la ruta principal. No se ha visto pasar en
  pantalla, solo detectado leyendo el código — investigar si da problemas.
- **Narrador daba info de un sitio a 10km justo al activarlo — 19 sept 2026, DESPLEGADO
  EN CÓDIGO (pendiente push+GitHub Pages), sin confirmar en pantalla.** Reportado por
  Paco: nada más pulsar "Activar" en el Narrador, el primer aviso fue de un sitio a
  10km. Causa: `startNarrator()` (`salma.js`) solo pedía un GPS fresco
  (`_requestGPSFix()`) si `this._userLocation` estaba vacío — y casi nunca lo está,
  porque es la misma variable global que usa toda la app. Si el GPS continuo ya se
  había parado por buena precisión (`initGeolocation()`, ahorro de batería) con el
  Narrador todavía apagado, `_userLocation` se queda congelada en la última posición de
  entonces — y el primer `checkNearbyPOIs()` al activar corría con esa posición vieja,
  no con la actual. Fix: `startNarrator()` ahora pide SIEMPRE un fix fresco al activar,
  quitando la condición `if (!this._userLocation)`.
  **De paso, a petición de Paco: auto-apagado del Narrador tras 5 min sin moverte más de
  50m** (ahorro de batería — el GPS continuo se queda encendido todo el rato mientras el
  Narrador está activo). Nuevo estado `_narratorStationaryPos`/`_narratorStationarySince`,
  comprobado en cada ciclo de `checkNearbyPOIs()` (colocado ANTES del recorte de coste ya
  existente que se salta la llamada a Google si no te has movido — si no, con el usuario
  parado del todo esa comprobación nunca llegaría a ejecutarse). Al apagarse solo, toast
  "Narrador desactivado — llevas 5 min sin moverte, para ahorrar batería." (autoCloseMs
  4000). Aviso añadido también al popup de activación (`showNarratorConfirm()` en
  `app.js`) para que no pille de sorpresa la primera vez.
  `?v=` subidos: `salma.js` a 99, `app.js` a 125 (sobre la base de `origin/main`, que
  había avanzado con trabajo de otra sesión — feedback de testers, chips, botón
  Compartir — fusionado sin conflicto salvo el propio `?v=` de `index.html`, resuelto a
  mano). **Pendiente: push, confirmar que GitHub Pages sirve la versión nueva, y que
  Paco active el Narrador en marcha y confirme que el primer aviso ya sale de donde
  está de verdad — y opcionalmente que compruebe el auto-apagado dejándolo activo 5 min
  parado.**
### ✅ Ya resuelto (estaba aquí como pendiente y ya no lo es)

- **Botón "Trazar ruta" de la caja de ejemplos rotable mandaba el ejemplo tal cual a
  Salma en vez de abrir el chat vacío — 18 sept 2026, CONFIRMADO EN PANTALLA por
  Paco.** En la pantalla de bienvenida, la caja "Toca para escribir la ruta" rota 4
  ejemplos (Portugal en coche, Lisboa remoto, N2 en moto, Tailandia); tocar el botón
  "TRAZAR RUTA →" generaba directamente la ruta del ejemplo que estuviera visible en
  ese momento, en vez de llevar al usuario a escribir la suya — solo tocar la propia
  caja de texto (no el botón) hacía lo correcto. Causa: `_wireRotable()` en `app.js`
  tenía dos handlers de click distintos: el de la caja de texto vaciaba el input y le
  daba foco (correcto), pero el del botón `data-ce-rotable-cta` llamaba a
  `salma.send(_exs[_ri])` con el texto del ejemplo en pantalla (incorrecto).
  Unificados ambos en una sola función `_goToChat()`: los dos hacen ahora exactamente
  lo mismo (vaciar `#main-input`, foco, quitar la caja de ejemplos) y ninguno manda
  nunca un ejemplo a Salma. Sin cambios en el Worker. `?v=` de `app.js` subido a 115
  en `index.html`. Fusionado a `main` (commit `3e4fcd4`).

- **Narrador dando información de sitios equivocados (3 bugs seguidos) — 15 sept 2026,
  CONFIRMADO EN PANTALLA por Paco en Lourenzá/Lorenzana (Lugo): "ha funcionado, me ha
  dado dos datos, uno centro de interpretación de las fabas/fabes y datos de la Iglesia
  ahora sí correctos".** Empezó con un solo síntoma (narración de un homónimo de otra
  región, una ceramista de Mallorca en vez de lo real) y al investigar salieron tres
  causas distintas apiladas, las tres arregladas:
  1. `/narrate` (Worker) recibía `lat`/`lng` del POI pero nunca los usaba en el prompt
     de Claude Haiku — sin pista de ubicación narraba el homónimo más documentado en
     vez de investigar qué hay real en ese punto. Commit `7232e6d`, Worker Version ID
     `b46ebb37-611c-43b1-ab36-7a27237998af`.
  2. `/nearby-pois` (Worker) mandaba a Google Nearby Search una lista de tipos separada
     por `|` en el parámetro `type`, que solo admite un valor — Google ignoraba el
     filtro en silencio y devolvía cualquier sitio cercano sin filtrar (así se coló una
     tienda de artesanía delante de una catedral), y encima cortaba a los 5 primeros
     resultados de Google por relevancia ANTES de calcular distancia, dejando fuera del
     todo a un monumento real si no estaba entre esos 5. Commit `ac24571`, Worker
     Version ID `17b47adf-97cf-46f2-ad84-3bc27d7d74d4`.
  3. Radio de detección en 20m (bajado desde 500m el 10 sept) — demasiado ajustado para
     un edificio grande, cuyo pin de Google puede no coincidir con dónde se para el
     usuario en la plaza. Subido a 50m. Commit `805271f`, `salma.js?v=82`.
  De paso se aclaró que el chip "en línea recta" del mapa (ver crítico arriba, sin
  confirmar todavía) es un bug distinto y separado, sin relación con estos tres.
  **Foto en el aviso del Narrador — implementado el mismo 15 sept, sin confirmar en
  pantalla.** Propuesta de Paco justo tras confirmar que ya iba bien: cuando salta el
  toast/burbuja del Narrador, mostrar también una foto del sitio para poder comparar a
  simple vista que es el mismo que tiene delante. `/nearby-pois` ya devolvía
  `photo_ref` por POI (no hacía falta tocar el Worker) — solo faltaba pintarlo en
  frontend. Añadida `<img>` (vía el proxy ya existente `GET /photo?ref=...`) tanto en
  `showNarratorToast` (toast flotante) como en la burbuja de chat cuando la vista de
  itinerario está abierta (`_processNarratorQueue`), con `onerror` que la quita sola si
  el sitio no tiene foto en Google — no pasa nada visible si no hay imagen. Clases CSS
  nuevas en `styles.css`: `.narrator-toast-photo` (bleed a los bordes del toast) y
  `.narrator-msg-photo` (dentro de la burbuja). **Pendiente: que Paco recargue y
  confirme que la foto aparece y ayuda a verificar que es el mismo sitio.**

  **Al probar la foto, "no salta" — investigado, NO es un bug, es el antibucle
  funcionando tal como se diseñó el 10 sept.** Paco reactivó el Narrador en el mismo
  punto de antes (Lourenzá) y no volvió a avisar de nada — el log solo mostraba
  "Narrator check" sin ninguna cola ni toast detrás, sin error. Causa: `checkNearbyPOIs`
  descarta en silencio cualquier POI que ya esté en `_narratorNotified` (dedup por
  `place_id`), y ese set se restaura desde `sessionStorage` en cada `startNarrator()` —
  o sea que apagar y encender el Narrador NO lo resetea, solo cerrar la pestaña del
  todo. Como la Iglesia y el Centro de las Fabas ya estaban notificados de la prueba de
  hace un momento, quedaron descartados sin más.
  **Añadido a petición de Paco ("Sí, añádelo"): botón "Olvidar avisos" en el propio
  módulo del Narrador — 15 sept, FUSIONADO, sin confirmar en pantalla.** Antes, tocar el
  chip "Narrador" estando ya activo lo desactivaba directo. Ahora abre un menú
  (`showNarratorActiveMenu()` en `app.js`, reutiliza el modal de
  `showNarratorConfirm()`) con dos opciones: "Olvidar avisos" (llama a la función nueva
  `salma.resetNarratorNotified()` — vacía el Set y borra la clave de `sessionStorage`,
  sin desactivar el Narrador) y, más abajo, "Desactivar Narrador" (el comportamiento de
  antes). CSS nueva `.narrator-active-stop` en `styles.css`.
  **De paso, arreglado un bug menor encontrado al tocar esta misma función**: 4 sitios
  llamaban a `showNarratorToast('texto', 3000)` con un número de "duración" que la
  función nunca soportó (no hay auto-cierre, solo la X, según quedó decidido el 10
  sept) — ese segundo argumento es en realidad `poi`, así que ese número se colaba como
  si fuera un POI y el toast renderizaba "📍 undefined" debajo del título. Quitados los
  números sueltos en los 4 sitios (`app.js`).
  **"Olvidar avisos" no iba del todo — arreglado, 15 sept, FUSIONADO.** Paco lo probó:
  desactivar+reactivar sí hacía saltar el aviso, pero "Olvidar avisos" solo a veces.
  Causa: el botón limpiaba la lista de sitios vistos pero no forzaba ningún chequeo —
  el siguiente real no llegaba hasta el próximo tic del `setInterval` (cada 60s),
  mientras que desactivar+reactivar sí llama a `checkNearbyPOIs()` al momento
  (`startNarrator()` ya lo hacía así). Ahora `resetNarratorNotified()` también resetea
  `_narratorLastCheck` y llama a `checkNearbyPOIs()` de inmediato si el Narrador sigue
  activo — mismo efecto instantáneo que apagar/encender, sin tener que hacerlo.
  **Chip "Narrador" en verde cuando está activo — añadido a petición de Paco, 15 sept,
  FUSIONADO.** No había ninguna pista visual de que estuviera encendido (las clases CSS
  `bottom-tab-narrator-on`/`narrator-pulse` existían desde antes pero no las usaba
  ningún JS — código muerto). Añadida clase `.chat-empty-chip--narrator-on` (fondo/borde
  verde, `--verde`) aplicada en dos sitios: al pintar el chip (`renderChip` en `app.js`,
  ya mira `salma._narratorActive`) y al cambiar de estado sin recargar la pantalla
  (`updateNarratorChipUI()`, nueva, llamada tras activar/desactivar desde los menús).
  `?v=` subidos: `salma.js` a 85, `app.js` a 106, `styles.css` a 93, en `index.html`.
  **Botón de cerrar (X) del toast ilegible sobre la foto — arreglado, 15 sept,
  FUSIONADO.** Paco lo reportó tras la foto de la entrada de arriba: la "X" tenía solo
  color de texto tenue (`rgba(...,.4)`) sin fondo, y la foto (que sangra hasta los
  bordes del toast con margen negativo) queda justo debajo, camuflándola. Le puse fondo
  circular oscuro semitransparente (`--radius-pill`) para que se lea encima de
  cualquier imagen. `?v=` de `styles.css` a 94.
  **Chip en verde — causa real encontrada, arreglado, 15 sept, FUSIONADO.** Con
  `app:106`/`styles:94` confirmados cargados (Paco probó hasta en incógnito para
  descartar caché) y el Narrador realmente activado (`[Salma] Narrador activado` en el
  log, sin bloqueo de notificaciones), el chip seguía sin ponerse verde — no era caché
  ni un fallo de lógica en JS. Causa real: existe una capa CSS más nueva y más
  específica del rediseño de septiembre, `.chat-empty .chat-empty-chip` (línea ~6430),
  que fija su propio `background`/`border`/`color` para TODOS los chips — con más
  especificidad (dos clases) que mi regla `.chat-empty-chip--narrator-on` (una clase),
  así que ganaba siempre sin importar el orden en el archivo. El chip SOS ya tenía este
  mismo problema resuelto con su propia regla más específica
  (`.chat-empty .chat-empty-chip--sos`, línea 6439) — se replicó el mismo patrón para
  el verde (`.chat-empty .chat-empty-chip--narrator-on`). `?v=` de `styles.css` a 95.
  **Pendiente: que Paco recargue y confirme que el chip se pone verde de verdad esta
  vez.**
  **Aparte, no confirmado si vio el toast "Permite notificaciones y ubicación..."
  cuando probó en incógnito (con las notificaciones bloqueadas por política del propio
  Chrome incógnito, no por la app) — sin acción pendiente, solo queda anotado por si
  vuelve a probar ahí.**
  **Toast "Narrador desactivado" con auto-cierre — CONFIRMADO EN PANTALLA por Paco,
  probado 2 veces.** El `autoCloseMs` añadido a `showNarratorToast()` funciona: el
  toast se borra solo a los 3s al desactivar, sin tener que tocar la X.

- **Pago roto en producción (Fase 1+2 de `docs/pasarela-premium.md`) — 14 sept 2026,
  CONFIRMADO EN PANTALLA por Paco: comprado un plan anual de test, `premium_until` se
  acreditó y la app muestra "Premium hasta 14 de septiembre de 2027".** Fusionado a `main`
  (commit `c775ab5`). La Fase 1 (Worker: `/create-payment` reescrito a Checkout por
  planes + `/stripe-webhook` con verificación de firma e idempotencia) ya estaba en
  `main` desde el 7 sept. Lo que faltaba y se cerró hoy es la Fase 2: `app.js`
  (`openCoinsModal`) seguía con el flujo viejo de coins (`{client_secret}` +
  `stripe.confirmCardPayment`), incompatible con lo que el Worker nuevo devuelve
  (`{url}` de una Checkout Session) — de ahí que no funcionara nada. Se reescribió el
  modal a "Hazte Premium" (4 planes, redirige a Stripe Checkout hospedado) y se añadió
  el manejo de `?pago=ok` (sondea `premium_until` en Firestore) / `?pago=cancel`.
  **3 secrets nuevos puestos en Cloudflare** (antes ninguno lo estaba, por eso los
  primeros intentos fallaban): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `FIREBASE_SERVICE_ACCOUNT` (JSON de cuenta de servicio de Firebase — descargado de
  Firebase Console → Configuración del proyecto → Cuentas de servicio; da acceso de
  administrador a Firestore, solo lo usa el webhook). Webhook de Stripe creado
  apuntando a `/stripe-webhook`, evento `checkout.session.completed`, probado con
  "Vuelve a enviarlo" hasta dar 200 antes de dar la Fase por buena.
  **Sigue en modo test** (`sk_test_`) — pasar a `sk_live_` es un cambio de 2 secrets
  cuando Paco decida cobrar de verdad (ver más abajo, "Stripe sigue en modo test").
  **Sin hacer todavía, a propósito (Fases 3-4 del documento, no bloquean el cobro):**
  gates de uso free/premium, migración de coins existentes a días de Premium, contadores
  de fair use, y el prompt de Salma sigue mencionando "coins" en vez de "Premium" — el
  stat "COINS" del perfil también se queda como está hasta entonces.

- **Historia reactivada (cápsula ampliable en guías + chat) — 13 sept, CONFIRMADO EN
  PANTALLA por Paco.** Fusionada a `main` (`623b41e`) y Worker desplegado (GitHub Action
  "Deploy Worker", run #7, Version ID `dd949a07-6415-4ae8-9694-9be8bb4ff373`). Se
  reactivó `historia.js`/`historia.css` (desactivados desde el 7 sept) y se añadió un
  modo compacto (`historiaModule.renderCompactInto`): botón "📖 Historia de X" por parada
  en `guide-renderer.js`/`mapa-itinerario.js` (oculto si Claude marca la parada
  `con_historia:false`) + uno de país en la cabecera, y uno bajo la respuesta del chat
  con el marcador nuevo `HISTORIA_LUGAR:X` (mismo patrón que `SALMA_ACTION`/`FOTO_TAG`).
  Backend: reutiliza `/historia-lugar` (Claude Haiku + foto Google Places + caché KV 30
  días). También se quitó un chip antiguo redundante que navegaba fuera del chat.
  **Probado por Paco pidiendo "3 días en Ronda": botón sale en todas las paradas y
  funciona de verdad — contenido real generado (ej. historia de Pedro Romero para el
  restaurante homónimo).** Necesitó reintentar 2-3 veces en varias paradas antes de
  cargar — coincide con la intermitencia de red de esa misma sesión (`curl.exe` daba
  timeout, Copiloto daba "Failed to fetch", la carga general iba lenta), no parece ser
  un bug de Historia: el botón "reintentar" funcionó tal como está pensado.
  **Cabo suelto — arreglado en código y desplegado (13 sept, commit `01ccdf8`, Worker
  Version ID `faf82643-a8ea-4746-bd60-baff689cf9c9`), PENDIENTE DE COMPROBAR EN
  PANTALLA.** Para "Rte. Pedro Romero Ronda", Claude interpretó la abreviatura de Google
  Maps "Rte." (Restaurante) como si insinuara una "ruta/corredor" — con el matiz que se
  añadió al prompt de `/historia-lugar` para narrar bien carreteras — y generó la
  biografía del torero Pedro Romero a modo de itinerario en vez de la historia del propio
  restaurante. Se aclaró en el prompt que Rte./Avda./C/Pza. son solo nombre o dirección
  de un lugar, no indicio de carretera. **Ojo al probarlo:** ese lugar concreto puede
  seguir cacheado en KV (`historia:rte-pedro-romero-ronda`, TTL 30 días) con la versión
  vieja del torero — si al pulsar "Historia" en ese restaurante sigue saliendo lo mismo,
  no es que el fix no funcione, es la caché; probar con un restaurante distinto con
  abreviatura similar, o borrar esa clave KV a mano para forzar regeneración.
  **Segundo bug real, más grave, arreglado y desplegado (14 sept, commit `b3fd758`,
  Worker Version ID `3eaaab15-b9cd-44ea-817e-012bb59f61e2`), PENDIENTE DE COMPROBAR EN
  PANTALLA.** Paco probó el botón GPS "📍 Historia de aquí" de pie en el Cementerio de
  los Ingleses de Camariñas (Costa da Morte, Galicia — ligado al naufragio del HMS
  Serpent, 1890) y salió la historia del Cementerio de los Ingleses de **Lisboa** (1654,
  homónimo). Causa: el frontend sí manda `lat`/`lng` al Worker, pero el prompt a Claude
  Haiku nunca los incluía — sin pista de ubicación, Claude tira del homónimo más
  documentado en su entrenamiento, no del real. Se añadió el lat/lng como pista explícita
  de desambiguación en el prompt. De paso, la clave de caché KV solo usaba el nombre del
  sitio (`historia:{slug}`) — dos homónimos en lugares distintos se pisaban la caché
  entre sí 30 días; ahora lleva un bucket de coordenadas (~11km) cuando hay GPS
  (`historia:{slug}:{lat}:{lng}`). **Ojo al probarlo — mismo problema de caché que el
  cabo suelto de arriba:** la entrada vieja `historia:cementerio-de-los-ingleses` (sin
  bucket, con la versión de Lisboa) sigue en KV y solo la sirven ahora las peticiones
  SIN coordenadas (búsqueda manual por texto, o el marcador del chat, que no manda
  lat/lng) — el botón GPS ya no la toca porque su clave cambió de formato. Comando para
  borrarla a mano si hace falta: `npx wrangler kv key delete
  "historia:cementerio-de-los-ingleses" --binding=SALMA_KB --remote -c wrangler.toml`
  desde `worker/`.
- **Saga "ruta de los faros" (11-12 sept 2026) — 5 bugs reales encontrados y arreglados,
  todos en `main`. Pendiente de un último redeploy del Worker para el quinto (ver abajo).**
  Todo empezó con "pantalla negra al abrir el mapa de una guía". Se fueron pelando capas:
  1. **Pantalla negra** (`app.js:selectRouteOnMap`, commit `07062dd`) — el filtro de
     coordenadas válidas era `s.lat && s.lng` (deja pasar basura tipo NaN de string o
     fuera de rango). Con eso colado, Google Maps reventaba a media construcción de
     marcadores ("Lat/Long not supported") y dejaba la app oculta con la vista de
     itinerario en blanco, sin ningún aviso. Ahora valida número finito + rango real,
     y si aun así falla algo, `salma.js` deshace el cambio de pantalla y ofrece
     "Reintentar" en vez de quedarse muda.
  2. **Ruta saltando a Lisboa** (`worker/salma-worker.js`, commit `7bef91f`) — para una
     ruta pedida "desde donde estoy" (sin nombre de destino), lo que quedaba de limpiar
     el mensaje se mandaba igual como `dest_hint`, y el Worker lo geocodificaba con
     Google Find Place como si fuera un lugar real — con texto sin sentido, Google
     devolvía cualquier cosa dentro del radio de sesgo, y ESE punto pasaba a ser el
     centro del radio de 35km que valida las paradas. Ahora, si el mensaje es del tipo
     "desde donde estoy/aquí/cerca de mí", no se manda ningún `dest_hint` de texto.
  3. **Orden de paradas sin sentido geográfico** (commit `39c4711`) — el prompt de
     conversión texto→JSON no tenía ninguna instrucción de orden; las paradas salían en
     el orden en que Claude las mencionó en la prosa (agrupadas por tema), no por
     cercanía real. Añadida regla de orden geográfico dentro de cada día.
  4. **Ruta regional entera cramada en 1 solo día** (commit `ca92b2c`) — "si no se indica
     número de días, haz 1 día" no distinguía una ciudad de una ruta/road trip explícita
     por una costa entera. Ahora, para rutas/road trips sin días especificados, calcula
     los días razonables por distancia real en vez de forzar 1.
  5. **Verify descartaba faros reales sin ficha en Google** (commit `f74cfaf`) — regla
     única "sin place_id de Google, la parada no entra" descartaba también sitios reales
     que Google simplemente no indexa como POI (faros pequeños/automáticos). Ahora, solo
     cuando el motivo es "Google no encontró nada" (no cuando encontró algo distinto o
     fuera de rango) y Claude trae coordenadas usables, la parada se mantiene sin
     verificar en vez de desaparecer. **Este es el único de los 5 sin confirmar aún que
     esté desplegado en producción — comprobar `/version` o repetir la prueba de la ruta
     de los faros y mirar si ya no faltan sitios conocidos.**
  De paso salió también todo el lío de Workers Builds perdiendo secrets (ver entrada
  propia arriba) y se montó el GitHub Action de deploy manual — ver esa misma entrada.
- ~~Trabajo perdido en sesiones sueltas~~ → **10 sept, con Paco en el ordenador**: se
  encontraron 9 ramas con commits que solo existían en su portátil (`git log --branches
  --not --remotes`) y se subieron todas a GitHub (`git push origin <ramas>`). La rama del
  KV de Portugal que se temía perdida (`claude/lucid-kirch-e19278`) resultó no tener
  ningún commit propio — no había nada que rescatar ahí. **Nada se perdió al final.**
  Ver "🧵 Ramas rescatadas" más abajo — están a salvo pero siguen sin fusionar a `main`.
- ~~Chat sin auth~~ → `POST /` exige token Firebase (`verifyAuthAndGetUser`); sin token
  responde 401 `auth_required`.
- ~~Coins no validados server-side~~ → se leen de Firestore server-side (comentario en
  el propio código: "P0-2 — no confiar en el frontend").
- ~~`public_guides` sin ownership~~ → `firestore.rules` ya exige
  `request.resource.data.uid == request.auth.uid` al crear, y solo el dueño edita/borra.
- ~~Cookie consent sin UI~~ → GA4 solo se carga tras `cookie_consent === 'all'` en
  localStorage (comentario "P1-6"), hay banner en `index.html`.
- ~~Sin modo offline~~ → `sw.js` (v14) cachea con network-first + fallback a caché +
  fallback a `/index.html`.
- ~~Manifest PWA básico~~ → ya tiene `shortcuts` (Chat, Mis Viajes), icono 512 maskable,
  `share_target`.
- ~~Credenciales en git (`publish-destinos-salma.js`)~~ → esto llevaba **resuelto desde el
  11 de abril** (commit "seguridad: auditoría completa P0-P3"), el email/password van por
  variables de entorno (`SALMA_EMAIL`/`SALMA_PASS`), el script falla si no se le dan. Se
  había apuntado mal como pendiente en el barrido del 10 sept sin comprobarlo del todo —
  error de esa auditoría, no del código.
- ~~Ruta duplicada (`mi-trabajo-local-5sept`)~~ → **10 sept, fusionado a `main`**: el
  commit original solo traía la mitad del arreglo (el prompt); la parte 2 (dedup de
  paradas a <250m con distinto `place_id` de Google) no existía en el código y se escribió
  de cero, probada contra el caso real y contra falsos positivos antes de subir. Paco lo
  desplegó en una rama de prueba, lo probó pidiendo una ruta real y confirmó que iba bien
  antes de fusionar.
- ~~Voz de fallback si falla ElevenLabs (`claude/vigorous-lichterman`)~~ → **descartada,
  10 sept, ya estaba resuelta**: `main` tiene un arreglo equivalente (`_warmUpSpeech` +
  `_elevenLabsDown`) comiteado 3 minutos después que esta rama, el mismo 17 de abril —
  y más completo (desbloquea el sintetizador en el toggle Y en el primer mensaje, no solo
  en el toggle). No hace falta fusionar nada.
- ~~Narrador sin botón~~ → **10 sept, fusionado a `main` y probado por Paco en pantalla**:
  al revisar la rama `claude/optimistic-dhawan` (fix de ráfaga de notificaciones) se
  descubrió que el Narrador no tenía NINGÚN botón que lo activara — `startNarrator()`
  solo lo llamaba un chip (`data-action="explorar"`) que dejó de existir en un rediseño
  anterior. Se añadió el chip "Narrador" (junto a Consultas/Notas/SOS) con un popup
  explicando qué hace antes de pedir ubicación. Esto NO estaba en las listas de
  pendientes anteriores — nadie sabía que el botón faltaba porque no rompía nada, solo
  no hacía nada. Con el botón ya puesto, el fix de la ráfaga de `optimistic-dhawan` (ver
  "🧵 Ramas rescatadas") vuelve a ser relevante — antes de esto era arreglar un problema
  en una función a la que nadie podía llegar.
- **Narrador sin ráfaga (`claude/optimistic-dhawan`)** → **fusionado a `main` el 10 sept**
  (cola de avisos, dedup persistente, separación foreground/background). Código verificado
  (entró limpio, sin restos del bucle viejo) pero **todavía sin probar en pantalla** — la
  ráfaga solo se ve caminando por una zona con varios POIs juntos. Pendiente de que Paco
  lo pruebe con el Narrador activado moviéndose; si algo no cuadra, es sobre esto.
- **GPS confirmado antes de activar el Narrador** → **fusionado a `main` el 10 sept**,
  escrito de cero (no de `claude/vigorous-panini`, que era del 5 abril y chocaba con la
  reescritura del 11 abril y con el chip de hoy — ver detalle en el commit). Antes,
  `startNarrator()` decía "activado" aunque el usuario denegara el GPS, y se quedaba mudo
  para siempre sin avisar. Ahora espera la respuesta real del navegador y si se deniega,
  devuelve `false` (el toast ya existente de app.js lo cubre). **Sin probar en pantalla
  todavía** — Paco lo probará en marcha: bloquear ubicación del sitio, activar Narrador,
  confirmar que avisa en vez de quedarse "encendido" en falso.
- **Enlace "Ver en Google Maps" del narrador** → **fusionado a `main` el 10 sept**
  (`salma.js:showNarratorToast`, `?v=73`). Paco reportó que el enlace del toast del
  narrador (construido con `place_id`/lat,lng del POI) no llevaba a ningún sitio válido;
  como el narrador solo avisa de sitios a <500m, se quitó el enlace en vez de arreglarlo
  — estando delante del sitio no aporta nada. **Pendiente de que Paco lo revise en
  pantalla** (panel 🐛 → confirmar `salma.js?v=73` cargado, activar Narrador cerca de un
  POI, comprobar que el toast ya no muestra el enlace).
- ~~Scroll del chat (`claude/hopeful-goldstine`)~~ → **descartada, 10 sept, ya estaba
  resuelta**: `main` tiene el mismo arreglo palabra por palabra (mismos comentarios,
  misma lógica), comiteado **28 segundos después** que esta rama, el mismo 6 de abril.
  No hace falta fusionar nada.
- ~~Chat modal flotante (`claude/hungry-tereshkova`)~~ → **descartada, 10 sept, ya estaba
  resuelta, por otro camino más tardío**: esta rama (5 abril) borraba un `<div id="chat-modal">`
  completo de `index.html` con su propio input/cámara/micro. Ese bloque **no existe en el
  código actual** — el 7 de septiembre se hizo un rediseño de navegación mucho más completo
  ("Navegación Fase 1" a "Fase 5": barra fija de 4, cabeceras con historial, vista itinerario
  sin monkey-patch) que rehizo esta zona de cero y llegó al mismo sitio por más camino.
  No hace falta fusionar nada.
- ~~Whitelist ferry/bus (`claude/vibrant-bassi`)~~ → **descartada, 10 sept, ya estaba
  resuelta**: los 5 dominios (balearia, ferryscanner, directferries, clickferry, omio)
  ya están en la whitelist de `app.js` y del Worker — commit con el mismo mensaje exacto
  en `main`, el mismo 6 de abril. Mismo patrón que las dos anteriores.

*(No significa que estén bien probadas en pantalla — solo que el código ya no coincide
con esta lista. Si algo de esto sigue fallando para Paco, es un bug nuevo, no el pendiente
antiguo — tratarlo como tal.)*

### 🟡 Importante

- **Ideas sacadas de una app similar (Kabi, 22 sept 2026) — SOLO ESTUDIO, SIN IMPLEMENTAR NADA.** Paco vio una app parecida (basada en guías ya hechas por otros viajeros/redactores, no generadas por IA como las nuestras — esa sigue siendo nuestra ventaja de fondo) y mandó capturas de varias pantallas suyas. Quedan aquí solo como catálogo para revisar con calma, nada de esto se ha tocado en código:
  1. **Bottom bar con botón "+" central (FAB)** — su barra es Inicio/Explorar/**+**/Viajes/Perfil, con un botón grande de crear en el centro, más visible que un tab normal. Nuestro equivalente hoy es el tab "Chat" (ahí es donde se genera una guía), pero no tiene ese protagonismo visual. Candidato a rediseño de la bottom bar (hoy: Ayuda/Chat/Rutas/Perfil) — cambio de maquetación, no de lógica.
     **HECHO 22 sept 2026 — DESPLEGADO (solo frontend, sin tocar el Worker), SIN CONFIRMAR EN PANTALLA por Paco todavía.** `app.js?v=145` + `styles.css?v=125`. Es pura navegación, sin pantalla nueva: el creador de ruta (destino+días, "Afinar" con los otros 6 campos, botón "Trazar ruta →") ya existía — es la propia pantalla del tab "Salma" cuando no hay ruta activa (`_ceBilleteHTML`, [app.js:361](app.js:361)), y el botón "Trazar nueva ruta +" ya la reabría sin tocar la ruta guardada cuando sí hay una activa ([app.js:551](app.js:551)). El "+" nuevo (`#tab-newroute`) solo dispara `goToNewRouteFAB()` ([app.js:215](app.js:215)): si hay **conversación sin guardar** en curso (`salma.history.length>0` y `!salma.currentRouteId` — una ruta ya GUARDADA nunca cuenta, vive en Firestore aparte y esto no la toca), **avisa antes de descartarla** (`showNewRouteConfirm()`, mismas clases CSS que `narrator-confirm-*` reutilizadas); si no hay nada que perder, va directo (`_goToFreshBillete()`: `showState('chat')` + `salma.newChat()` + clic programático sobre `[data-ce-newbillete]` o `[data-ce-openbillete]`, lo que haya en pantalla — reutiliza el 100% de la lógica ya existente).
     **Retoque visual el mismo día, a petición de Paco tras ver el primer resultado en pantalla ("me gustaría saliera desplegado") — comparó con una app bancaria suya: círculo mayor, sin texto, anidado en un hueco recortado de la propia barra en vez de flotar encima de un borde recto.** Implementado con `mask-image`/`-webkit-mask-image` en `.app-bottom-bar` (radial-gradient que recorta un círculo de 40px en el centro superior de la barra). **Bug real encontrado al probarlo, corregido antes de dar nada por bueno**: el `mask-image` de un contenedor recorta TODO su contenido pintado, incluidos los hijos — con el "+" como botón hijo de la barra (como en el primer intento), el propio recorte se comía la parte del círculo que se solapaba con la barra, dejando solo un aro hueco sin relleno. Arreglado sacando el botón real del "+" FUERA de la barra como elemento independiente (`position:fixed`, hermano de `#app-bottom-bar`, no hijo — [app.js:215](app.js:215)) con un `<div class="bottom-tab-fab-spacer">` vacío dentro de la barra solo para reservar el hueco en el `flex`. Círculo subido de 52px a 72px. **Aviso para la próxima vez que se pruebe algo de UI en este navegador de prueba**: verificar con la página recién navegada (`navigate`, no reutilizar una pestaña vieja) y con `?v=` subido — el navegador cachea `app.js`/`styles.css` por la query string exacta y sirve la versión vieja en silencio si no cambia; y no usar `document.body.innerHTML=''` para simular la barra sola, porque destruye la referencia `$content` que usa el resto de la app y da falsos negativos raros (confundió esta misma prueba un rato).
     **Probado en el navegador de la app con datos simulados** (usuario/estado falsos vía consola, sin login real): los 4 casos correctos — conversación sin guardar → avisa; nada que perder → directo; ruta ya guardada con historial → directo sin avisar; el clic desde "Empezar" del aviso también revela el billete bien. Visualmente confirmado en desktop y móvil, círculo grande anidado en el hueco, igual que la referencia del banco.
     **Bug real reportado por Paco en pantalla el mismo día (captura): con el chat abierto y la barra de escribir visible, el círculo salía cortado por la mitad (solo la parte de abajo).** Causa: `.app-input-bar` tiene `z-index:1100` ([styles.css:423](styles.css:423)) y el "+" se quedó con `z-index:901` — con el chat abierto, la barra de escribir se solapa justo con la parte del círculo que sobresale por encima de la barra de pestañas, y con menos z-index quedaba tapado por ella. Arreglado subiendo `.bottom-tab-fab` a `z-index:1101`, [styles.css:2653](styles.css:2653). `styles.css?v=126`. Comprobado con `elementFromPoint()` en el punto exacto de solape (el screenshot del navegador de prueba se puso inestable en esta sesión, no fue fiable como prueba) — el "+" gana ahí y sigue sin tapar el input ni el botón de voz a los lados. **Confirmado también con la pantalla real de la app** (billete + input bar + bottom bar juntos), no solo la barra sola. **Aún NO confirmado con tu sesión real.** Enlazado con el pendiente "Ruta por X sin días" de más abajo — el "+" es la vía fiable que sustituye a intentar cazar la intención por texto libre.
     **Botón "Trazar nueva ruta +" (dentro de la tarjeta de ruta activa) OCULTO — mismo día, a petición de Paco ("carece de sentido, quitarlo").** Con el FAB nuevo ya cubriendo esa misma función, tener los dos botones a la vez no aportaba nada. Se dejó con el atributo `hidden` en vez de borrarlo del todo ([app.js:524](app.js:524)): sigue en el DOM solo como gancho programático — `_goToFreshBillete()` lo sigue necesitando para el caso "hay ruta activa" (transforma la tarjeta a hero+billete oculto; `.click()` dispara el listener igual aunque el botón no se vea). **De paso, arreglado un bug real que llevaba ahí desde el primer commit del FAB, nunca probado a fondo hasta hoy**: para ese mismo caso (ruta activa), `_goToFreshBillete()` solo hacía clic en `[data-ce-newbillete]` y paraba ahí — eso deja la tarjeta OCULTA otra vez detrás del hero, sin revelar el billete de verdad (hacía falta un segundo clic en "Desliza para trazar ruta rápida" que nunca llegaba a dispararse). Arreglado encadenando los dos clics siempre ([app.js:240](app.js:240)). Probado en el navegador con una ruta activa simulada en `localStorage`: el billete se revela completo (`¿A DÓNDE?` visible, con "← Volver a la ruta activa" arriba), sin el botón duplicado.
     **Caja de ejemplos rotable: ahora se escribe EN SITIO — 22 sept 2026, DESPLEGADO, SIN CONFIRMAR EN PANTALLA.** Petición de Paco: tocar la caja bajaba al chat de más abajo (fix del 18 sept); ahora, al tocarla, la propia caja se convierte en un `<textarea>` editable en el mismo sitio (sustituye al `<p>` del ejemplo, para de rotar, oculta los puntos), se escribe la ruta ahí y "Trazar ruta →" la manda de verdad con `salma.send()` — antes ese botón solo enfocaba el chat de abajo sin mandar nada; si se pulsa sin haber escrito nada, entra en modo edición (o reenfoca si ya lo estaba) en vez de no hacer nada. `_wireRotable()`/`_startEditing()`, [app.js:712](app.js:712). **Bug real encontrado y arreglado de paso, mismo patrón ya documentado con `#ce-sky-fc`**: ocultar los puntos con `dots.hidden=true` no ocultaba nada — `.ce-rotable-dots{display:flex}` (una regla de clase) gana al `[hidden]` del navegador por tener la misma especificidad; arreglado con `#ce-rotable-dots[hidden]{display:none}` ([styles.css:6611](styles.css:6611)), mismo selector-por-id-gana-a-todo que ya se usó para `#ce-sky-fc`/`#ce-sky-fc-toggle`. Probado en el navegador: tocar la caja la vuelve editable, escribir y pulsar "Trazar ruta" llama a `salma.send()` con el texto tecleado (interceptado en la prueba para no llamar al Worker real), los puntos desaparecen bien tras el fix.
     **Botón "Desliza para trazar ruta rápida" renombrado a "Ruta rápida"** — a petición de Paco, mismo texto de siempre (uppercase por CSS), solo más corto. `app.js?v=147`, `styles.css?v=128`.
  2. **Preferencias con sliders de interés** (pantalla "Tus Intereses": Naturaleza y Paisajes, Cultura Rural, Aventura al Aire Libre, Relax en la Naturaleza..., cada uno con un % ajustable) — Paco propone algo parecido pero organizado por **tipo de viaje** (moto, camper, aventura, internacional, naturaleza, familia...) en vez de por interés genérico. Encajaría como categoría nueva dentro de "estilo de viaje" en nuestro "Lo que Salma sabe de ti" (Perfil IA, sesión 19 sept) — sliders manuales como complemento rápido de configurar, frente a los hechos que ya extraemos solos por IA de lo que hablas/generas (más lento pero automático). Pendiente decidir si conviven como dos fuentes o si unos alimentan a los otros, y si el prompt les da distinto peso.
  3. **Reloj/tiempo del index menos protagonista — HECHO 22 sept 2026, DESPLEGADO, SIN CONFIRMAR EN PANTALLA.** Paco lo aclaró en detalle sobre una captura: la fecha+hora (`#ce-sky-time`) se queda SIEMPRE visible, fuera del pliegue; detrás de un botón nuevo "▾ tiempo" (`#ce-sky-wx-toggle`, `_ceSkyToggleWx()`, [app.js:1150](app.js:1150)) se pliega TODO lo demás — tarjeta de tiempo (temp/sensación/viento/humedad), previsión y la tarjeta de info del país (`#ce-sky-wx-wrap`, nuevo contenedor envolviendo lo que ya había) — plegado por defecto, persistido en `localStorage: bdm_sky_wx_open`, mismo patrón que el toggle de previsión ya existente (`bdm_sky_fc_open`). Las recordatorios (notas activas, el popup "RECORDATORIOS") NO se tocaron — a petición explícita de Paco, siguen igual que ahora, sin relación con este pliegue. Solo visual, no cambia ninguna llamada a `/weather`/`/practical-info` — el pliegue no gatea el fetch, solo la visibilidad, así que los datos están listos en cuanto se despliega. `app.js?v=146`, `styles.css?v=127`. Probado en el navegador con datos simulados: plegado por defecto, el botón despliega/pliega bien, y recuerda el estado al recargar (`localStorage` confirmado). **NO confirmado con tu sesión real.**
  4. **Emojis en los botones/chips — HECHO 22 sept 2026 con iconos SVG, DESPLEGADO, SIN CONFIRMAR EN PANTALLA.** Se planteó la limitación técnica (un emoji Unicode no se puede recolorear por CSS, un SVG con `stroke="currentColor"` sí) y Paco eligió ir por SVG ("VAMOS SVG"). Rellenados los 10 chips que antes tenían `icon: ''` vacío (`chipsLeft`/`chipsRight`/`chipsMore`, [app.js:363](app.js:363)), reutilizando el helper `_ci()` que ya existía sin usar: Cerca mía (chincheta), Últimas consultas (reloj), Mis notas (documento), Narrador (auriculares), Buscar alojamiento (cama), SOS (triángulo de alerta), Vuelos (avión de papel), Alertas vuelos (campana), Cambio moneda (flechas), Traductor (globo) — estilo Feather/Lucide, mismo trazo que ya usan otros iconos de la app. **Naranjas en TODOS los chips, incluso los que tienen su propio color de texto** (SOS en rojo, Narrador activo en verde) — a petición explícita de Paco ("naranja también para todos"): `.chat-empty .chat-empty-chip .chip-icon{stroke:var(--ce-amber)}` en vez de `stroke:currentColor` ([styles.css:6778](styles.css:6778)), así el icono no seguía el color de cada chip. Probado en el navegador: los 10 chips (incluidos los 4 de "Más opciones") salen con su icono en naranja, y comprobado que con `.chat-empty-chip--narrator-on` (verde) el icono se queda en naranja igual. `app.js?v=148`, `styles.css?v=129`.
     **Retoque el mismo día, a petición de Paco ("lo veo despareado, no sé explicarme... más uniforme, centrado"): los iconos quedaban descuadrados entre sí.** Causa: `.chat-empty .chat-empty-chip{justify-content:center}` centraba el grupo icono+texto COMO BLOQUE dentro del botón — con textos de largo muy distinto ("CERCA MÍA" vs "ÚLTIMAS CONSULTAS"), el bloque centrado tiene ancho distinto en cada chip, así que el icono acababa en una posición horizontal diferente en cada uno, sin alinearse con el de al lado — eso es lo que se veía "despareado". Cambiado a `justify-content:flex-start` ([styles.css:6772](styles.css:6772)): con los 10 iconos al mismo tamaño (13×13), quedan en línea recta en las dos columnas sea cual sea el largo del texto. `styles.css?v=130`. Probado en el navegador: confirmado visualmente que los iconos de las dos columnas quedan alineados. **CONFIRMADO EN PANTALLA por Paco ("OK PERFECTO ASI")** — captura suya. Sin nada pendiente de esto.
     **Dos arreglos más en la misma captura, mismo día, DESPLEGADOS, sin confirmar en pantalla:**
     1. **"Trazar nueva ruta +" seguía viéndose pese al `hidden` de hace un rato — MISMO BUG de especificidad, tercera vez en la sesión (ya visto con `#ce-sky-fc` y `#ce-rotable-dots`).** `.ce-cta-main{display:flex}` (CSS de autor) gana al `[hidden]` del navegador (CSS de agente de usuario) aunque el selector coincida igual de bien — autor siempre gana a UA. Arreglado con `.ce-cta-2nd[hidden]{display:none}` ([styles.css:6763](styles.css:6763)), mismo patrón por selector-más-específico ya usado las otras dos veces. Comprobado con una ruta activa simulada: `computedDisplay` del botón pasa a `"none"`, ya no aparece en pantalla.
     2. **El "+" (y "Ruta rápida") ahora suben directo al cuadro "¿A dónde?"** — antes hacían `scrollIntoView` sobre la tarjeta entera, así que lo primero que se veía era la cabecera del billete (Nº/Pasajero), no el campo de texto; Paco pidió que fuera directo arriba al cuadro. Cambiado a hacer `scrollIntoView` sobre el propio input `.ce-tk-dest` (con `block:'center'`) antes de enfocarlo, [app.js:810](app.js:810). Probado en el navegador: tras pulsar el "+", el campo queda enfocado y centrado en la pantalla.
     `app.js?v=149`, `styles.css?v=131`. **NO confirmado con tu sesión real.**
     **Corregido el mismo día — el punto 2 de arriba estaba mal entendido.** Paco: "el botón + lo que quiero que vaya es arriba al cuadro de texto, me he explicado mal" — no quería el campo "¿A dónde?" del billete (eso seguía siendo "Ruta rápida", un paso más abajo en la página), quería la caja de ejemplos de ARRIBA (la que ahora se vuelve editable al tocarla, ver el punto de la caja rotable más arriba en esta misma sesión). `_goToFreshBillete()` ([app.js:240](app.js:240)) ya no hace clic en `[data-ce-openbillete]` — en vez de eso hace `scrollIntoView` sobre `#ce-rotable` y `.click()` sobre ella, disparando `_startEditing()` (el mismo efecto que tocarla a mano): sube a la caja de arriba, la vuelve editable y la deja con el foco puesto. Funciona igual con o sin ruta activa (con ruta activa, sigue pasando primero por el "Trazar nueva ruta +" oculto para que aparezca la caja). Probado en el navegador en los dos casos: la caja aparece en pantalla, editable, con el cursor puesto. `app.js?v=150`.
     **Corregido otra vez, mismo día — el propio `.click()` programático seguía sin gustar.** Paco: "que no se borren los ejemplos, que sea al pulsar que ponga escríbeme la ruta que quieres..." — el `.click()` de la versión anterior entraba en modo edición SOLO, sin que Paco tocara nada; quería que el "+" se quedara solo en subir arriba y dejar los ejemplos rotando tal cual, y que el cambio a editable pase ÚNICAMENTE cuando él mismo toque la caja (eso ya estaba hecho desde el cambio de la caja rotable, solo sobraba el `.click()` automático). Quitado ([app.js:254](app.js:254)) — ahora `_goToFreshBillete()` solo hace `scrollIntoView`, nunca dispara `_startEditing()` por su cuenta. De paso, el placeholder que aparece al tocarla se ajustó al texto exacto que pidió: "Escríbeme la ruta que quieres..." (antes "Escribe...", sin el "-me"). `app.js?v=151`. Probado en el navegador: tras el "+", la caja sigue mostrando el ejemplo rotando normal, sin borrarse; al tocarla a mano sí se vuelve editable con el placeholder nuevo. **NO confirmado con tu sesión real.**
  5. **Eventos** — no existe nada de esto hoy en la app; feature nueva a valorar (qué son, de dónde saldrían los datos, si toca alguna API de pago).
  6. **Álbum de viaje — dos piezas distintas, visto en su flujo "Álbumes"**: (a) escanea el carrete del móvil, empareja fotos por las fechas del viaje guardado, las agrupa por día — todo el análisis en el propio dispositivo, nada se sube hasta compartir/imprimir. Factible y reutilizable: `share-inbox.js` ya sabe leer EXIF (GPS+fecha) y la bitácora ya agrupa por día — faltaría el selector de fotos del carrete + emparejar por fecha contra la guía guardada. (b) Botón "Encargarlo en papel" — imprime el álbum como fotolibro físico. Esto es una pieza de negocio mucho más grande que las demás: exige un proveedor externo de impresión/fulfillment (API, pago, envío, logística), no es solo código — decisión aparte, no comparable en esfuerzo al resto de la lista.
  **Siguiente paso, cuando Paco lo pida**: revisar el catálogo completo junto, decidir cuáles se quedan y en qué orden, sin tocar nada hasta entonces.

- **SANEAR EL PROMPT DE SISTEMA — estudiado 21 sept 2026, PENDIENTE (Paco lo dejó para otro día), SIN TOCAR CÓDIGO.** Tamaño: ~16.400 tokens fijos/petición (medido por el caché); bloques: Geografía 9.700 car. (26%), Acción 8.000, Rutas 7.200 (solo prompt ROUTE), Mapa 3.800. **Ahorro de dinero: mínimo** (con caché, quitar ~3.500 tokens ≈ 0,001 €/petición caliente, ~0,013 € fría) — el motivo real es CALIDAD. **Contradicciones halladas (§6):** (A) Acción dice "NUNCA preguntes ¿qué tipo de viaje?/¿con quién vas?" y Rutas manda "haz UNA pregunta" antes de generar; (B) "NUNCA generes SALMA_ROUTE_JSON salvo la frase literal" (Rutas y Acción tipo 3) contradice el botón "Crear ruta con mapa", el [OBLIGATORIO] y las ediciones (SALMA_ROUTE_EDIT) — posible causa de que la IA ignorase el formato de edición; (C) "2-3 frases y NADA MÁS" vs modo recomendaciones en prosa; (D) narrative "historia, dato cultural" vs "sin datos factuales"; (E) "NUNCA le digas que llame" vs respuestas que acaban en "llama antes de ir"; (F) repetidos: mín. 4 paradas/día (×3), radio por días (×2), "nunca inventes visados" (×3-4); (G) Geografía: 1/3 enciclopedia que Claude ya sabe y "Fronteras problemáticas 2024-2026" con datos políticos fijos que se quedan viejos. **Propuesta acordada en principio (Paco: "sanear el prompt, muchas cosas son antiguas"):** (1) arreglar A-F con cambios de texto pequeños, enseñándole el texto exacto ANTES; (2) Geografía: opciones A no tocar / B quitar solo la lista de fronteras (recomendada) / C recorte moderado (quitar partes física y humana, dejar prácticas y transporte); (3) batería de 8 mensajes antes/después: visado Vietnam, ferry Koh Samui→Bangkok, farmacia cerca mía, 3 días en Ronda, guía Estepona 1 día (botón), edición con guía abierta ("quiero ir también a la playa"), foto de monumento, tiempo hoy. **Decisiones que faltan de Paco:** ¿no preguntar nunca antes de generar (defaults)? y Geografía A/B/C. Cada cambio de prompt deja fría la caché una vez (~0,01 €).
  **PROCESO ACORDADO CON PACO (21 sept 2026) — OBLIGATORIO al retomar el prompt, porque en abril (y el 5 sept) los cambios encadenados del prompt dieron muchísimos problemas y Paco NO quiere volver a liarse:** (0) nada se toca hasta que Paco diga "empezamos"; (1) primero un punto de restauración (tag git `v-pre-prompt`); (2) UN cambio cada vez, nunca lotes, solo texto del prompt (nada de código en el mismo commit); por cada cambio: enseñar texto EXACTO antes/después → OK expreso de Paco → aplicar y desplegar (Version ID comprobado) → UN solo mensaje de prueba → Paco dice qué ve → solo entonces el siguiente; (3) orden de menos a más delicado: E ("nunca digas que llame"), D (narrative), F (repeticiones), C (texto del chat), B (cuándo generar SALMA_ROUTE_JSON), y solo si Paco quiere A (preguntar o no) y Geografía; (4) si algo sale raro: NO parchear — revertir solo ese cambio (commit nuevo + deploy), nunca reescribir historia; (5) avisar del coste (caché fría ~0,01 € por despliegue).
  **HECHO 22 sept 2026 — LOS 5 CAMBIOS DE TEXTO (E, D, F, C, B), UNO A UNO, CONFIRMADOS EN PANTALLA POR PACO. CERRADO.** Tag de restauración `v-pre-prompt` (commit `af07ae9e`) por si hiciera falta deshacer alguno. Cada uno: texto exacto → OK → deploy → 1 mensaje de prueba → confirmación, sin lotes, tal como se acordó.
  - **E** (`BLOQUE_ACCION`, "DATO PRIMERO SIEMPRE" punto 4): "nunca digas que llame" ya no choca con sugerir confirmar un dato que pueda haber cambiado (horario, precio…). Commit `a486235b`, **Worker `8de85db3`**.
  - **D** (`BLOQUE_RUTAS`, dos sitios): la descripción de cada parada (`narrative`) decía "sin datos factuales" en un sitio y "con historia, dato cultural" en otro — unificado en los dos: 1-2 frases de viajero, dato histórico/cultural breve si lo tiene, nunca distancias/horarios/precios. Commit `6fb78368`, **Worker `dd3c1620`**.
  - **F** (`BLOQUE_RUTAS`): "mínimo 4 paradas/día" estaba dicho dos veces con números distintos ("4-6…nunca más de 7" y "mínimo 4, ideal 5, máximo 7") — unificado en "4-7, idealmente 5", quitada la repetición. Commit `ef864c3d`, **Worker `3c8767fd`**.
  - **C** (`BLOQUE_RUTAS`): aclarado que "texto en el chat: 2-3 frases, NADA MÁS" aplica solo cuando se emite `SALMA_ROUTE_JSON` (no chocaba en la práctica con el modo recomendaciones — son prompts mutuamente excluyentes — pero quedaba ambiguo leído suelto). Commit `1247d2f5`, **Worker `a069482b`**.
  - **B** (`BLOQUE_RUTAS` + `BLOQUE_ACCION` tipo 3, el más delicado): "solo con la frase literal 'salma hazme una guía'" ya no reflejaba cómo se dispara una ruta hoy (el botón "Crear ruta con mapa" vía [OBLIGATORIO — GENERA RUTA AHORA], y las ediciones vía [CAMBIOS EN ESTA RUTA]/SALMA_ROUTE_EDIT) — reescrito para decir la verdad: NUNCA por iniciativa propia, solo con esos dos avisos del sistema. Commit `72c5f7d7`, **Worker `5e81243b`** (vigente).
  **Probado en pantalla, sin regresión:** guía de Estepona/Ronda con paradas 4-7 (F, D confirmados), "quiero ir a Vietnam" sin disparar ruta (B confirmado), "farmacia cerca mía" con dato primero (E confirmado). Un "se ha aturrullado" (`Stream read error: TypeError: network error`) durante las pruebas se investigó con el panel 🐛 y es el mismo patrón de intermitencia de red ya documentado varias veces en este archivo — NO relacionado con los cambios del prompt (el Worker sigue con su keepalive de 3s durante generación/verificación).
  **PENDIENTE, solo si Paco lo pide otro día, mismo proceso paso a paso:** (A) ¿preguntar algo antes de generar o seguir con valores por defecto (lo actual)? y Geografía (A no tocar / B quitar solo "Fronteras problemáticas 2024-2026" / C recorte moderado). Nada de esto se ha tocado.

- **Botón "Crear ruta con mapa" — 22 sept 2026, DESPLEGADO, CONFIRMADO EN PANTALLA (menos lo de abajo).** Tres cambios en el mismo hilo:
  1. **Mensaje duplicado quitado** — el frontend (`salma.js:_isRouteMsg/offer_map_button`) añadía una burbuja aparte ("Ahí tienes el plan 👆...") que decía casi lo mismo que el cierre que YA escribe Salma en su propio texto de recomendaciones. Quitada la burbuja del frontend, solo queda el cierre del prompt, con texto mejorado: "...y te lo monto con paradas y navegación. Después, sobre el mapa, puedes editar, añadir o quitar paradas cuando quieras."
  2. **Frase pegada al botón** (`.crear-ruta-caption`, dentro del propio wrap, no en la burbuja de texto — así queda siempre justo encima del botón aunque la fila de iconos copiar/compartir/reproducir/guardar-nota se cuele en medio): "Según las paradas, puede tardar un poco — merece la pena: toda la información de la guía verificada con Google, sin pérdida." (texto final, ajustado por Paco).
  3. **Se acumula lo que se hable ANTES de pulsar el botón** — `_pendingMapSourceText`/`_pendingMapBaseMsg`/`_pendingMapGuidedRoute` en `_offerCrearRutaConMapa`: mientras el botón siga sin pulsar, cualquier respuesta normal de Salma (que no dispare ruta/edición por su cuenta) se suma al texto pendiente y el botón se recoloca bajo el último mensaje. Antes, si decías "el primer día quiero ver X" o "duermo en camping" DESPUÉS de que saliera el botón, esa información se perdía en silencio al pulsarlo (el botón seguía usando solo el primer texto). Se limpia al pulsar el botón, al empezar de cero (`reset()`/`newChat()`), y no se acumula dentro del popup de una guía ya abierta (`_chatAreaOverride`, ese caso usa `SALMA_ROUTE_EDIT`, no este camino).
  Commits `72c5f7d7` (Worker `5e81243b`, cambio A: sin preguntar antes de generar + quita la burbuja) y `f2ac15b7`/dos commits más de solo frontend (`salma.js?v=108`, `styles.css?v=123`) para la frase y el acumulado. **Confirmado en pantalla por Paco** en `3 días en Sevilla` con seguimiento "primero día parque + duermo en camping" antes de pulsar el botón.

- **"Ruta por Cazorla parque natural" (sin días) no entra en modo recomendaciones — 22 sept 2026, EXPLICADO CON EL CÓDIGO, SIN TOCAR NADA. Paco: "lo pensamos luego".** Diferencia real encontrada, no relacionada con ningún cambio de hoy: `isRouteRequest`/`isDaysDestination` exigen o un número de días explícito, o un destino de máximo 4 palabras sin verbo — "Ruta por Cazorla parque natural" tiene 5 palabras y ningún número de días, así que ninguna de las dos se activa y el mensaje cae en modo conversación normal (tools: `buscar_web`/`buscar_foto`), con Salma dando información real y preguntando "¿cuántos días tienes?" al final — pregunta LEGÍTIMA (Días es un dato que de verdad falta, distinto de las preguntas de preferencia que se quitaron hoy en el cambio A). Por eso también las fotos se ven distinto: en modo conversación van incrustadas en el propio texto (sin espacio reservado que se rellena después, como sí pasa con las paradas de una ruta vía `mapa-itinerario.js`).
  **Sin verificar, pendiente si se repite:** una foto salió con markdown roto (URL en crudo visible) y otra con logo "La Sierra de Segura" que pinta a venir de una búsqueda web, no de Google Places — el panel 🐛 que se pasó era de OTRA prueba (ruta del Pirineo), sin el registro de este mensaje concreto, y la cabecera mostraba `salma:106` en vez del `108` recién publicado (posible caché sin recargar). Pendiente: repetir con `salma:108` confirmado y, si se repite la foto rota, pasar el panel 🐛 de ESE mensaje exacto sin recargar antes.
  **DECIDIDO por Paco (22 sept 2026, mismo día): NO se toca la detección por texto libre.** Se planteó ampliar `isRouteRequest`/`isDaysDestination` con palabras clave ("ruta", "recorrido"...) para cazar casos como este — descartado. La señal fiable de "quiero una guía completa" pasa a ser un **punto de entrada dedicado de la UI**, no adivinar la intención por regex sobre lo que se escribe: los que ya existen (chip "Trazar ruta" de la caja rotable, flujo guiado de 8 preguntas) más el futuro **botón "+" central (FAB)**, idea #1 del catálogo Kabi (ver entrada de arriba) — si se entra por ahí, siempre es guía; si no, conversación normal tal cual está hoy, con la pregunta de días si hace falta. Sin implementar — depende de que el FAB se construya. Enlazado con la idea #1 del catálogo Kabi de arriba.

- **Login con Google falla con "This operation has been cancelled due to another conflicting popup being opened" — anotado 21 sept 2026, SIN diagnosticar del todo, SIN tocar código.** Paco lo vio al entrar con OTRA cuenta (probando Compartir con una segunda cuenta) y pedir registro con Gmail. Es el error de Firebase `auth/cancelled-popup-request`: se lanzó un segundo `signInWithPopup` mientras el primero seguía abierto. Hallazgos en `app.js`: `doGoogleLogin()` (línea ~3354) **no tiene ningún guardián de re-entrada** (un doble toque, o volver a pulsar porque el popup tarda/queda oculto en móvil, lanza dos popups) y solo hay UN listener (`btn-google-login`, línea ~4018) — no es un listener duplicado; el otro sitio que abre popup es el respaldo de `doFingerprintLogin()` (línea ~3411, si hay huella guardada en `localStorage.bdm_webauthn_cred` y no hay sesión Firebase). `authErrorMsg()` no traduce este código y enseña el texto en inglés de Firebase tal cual. **Efecto:** el primer intento muestra un error rojo aunque el segundo popup pueda acabar entrando. **Arreglo propuesto, sin implementar (pedir OK a Paco):** (1) guardián `_googleLoginBusy` + desactivar el botón mientras haya popup abierto; (2) tratar `auth/cancelled-popup-request` y `auth/popup-closed-by-user` como silencio (no mostrar error); (3) opcional: `signInWithRedirect` de respaldo en `auth/popup-blocked` (ya existe lógica de reanudar tras redirect, ver sesión 17 abril). **Importa antes de invitar testers:** Google es la vía principal de entrada. Coste (§8): cero, es solo frontend.
  **IMPLEMENTADO 21 sept 2026 (pasos 1 y 2; el 3, redirect de respaldo, NO), DESPLEGADO, sin confirmar en pantalla** — `app.js?v=143`: `_signInWithGooglePopup()` con guardián `_googlePopupBusy` (bloquea el botón y ignora toques mientras haya ventana abierta) usado por `doGoogleLogin` Y por el respaldo de `doFingerprintLogin`; `_isBenignPopupCancel` trata `auth/cancelled-popup-request` y `auth/popup-closed-by-user` como silencio (sin error rojo). Paco SÍ tiene huella guardada en el dispositivo (encaja con la hipótesis de los dos caminos).

- **Dos propuestas de diseño de abril 2026, "analizadas y documentadas, no implementar
  hasta que Paco lo pida", revisadas contra el código real el 13 sept 2026 — siguen sin
  tocar, y una de ellas (mapa fijo) se ha vuelto más urgente, no menos:**
  1. **Mapa siempre visible (V5)** — el live-map pasa a ser fondo permanente de toda la
     app; welcome/chat/perfil/rutas flotan encima como sheets semitransparentes en vez de
     pantallas que se ocultan/muestran. Objetivo secundario: unificar los mapas
     duplicados en uno solo. Documento completo en memoria de sesión
     (`project_mapa_fijo_v5.md`). **Verificado hoy:** la colisión de z-index que motivó
     parte del plan sigue intacta (`.app-bottom-bar` y `.itin-view` comparten
     `z-index:900` en `styles.css`), y el problema de "mapas duplicados" que quería
     resolver la Fase C ha crecido de 3 a **al menos 5** instancias independientes de
     `google.maps.Map`/Leaflet (`app.js`, `mapa-ruta.js`, `guide-renderer.js`,
     `bitacora-renderer.js`, y el nuevo `map-modal.js` del rediseño de navegación del 7
     sept) — el rediseño de septiembre fue en dirección contraria a la unificación. La
     lista de "6 archivos afectados" del documento original ya se ha quedado corta.
  2. **Modo offline completo** — mapa OSM descargable + POIs + rutas pre-cacheadas para
     viajar sin datos, en 4 fases (O1-O4). Documento completo en memoria de sesión
     (`project_offline_mode.md`). **Verificado hoy:** la Fase O1 (persistencia Firestore)
     ya está hecha (`db.enablePersistence()` en `app.js`, línea ~9) — probablemente como
     efecto colateral de otro trabajo, nadie lo marcó como parte de este plan. Las fases
     O2-O4 (tiles OSM, POIs offline, rutas pre-cacheadas) siguen sin empezar — no existe
     ningún `offline-tiles.js` ni `offline-pois.js` en el repo.
  Ninguna se ha hablado con Paco para decidir si retomarlas — solo quedan anotadas aquí
  para que no se vuelvan a perder de vista como pasó la primera vez.
  **13 sept 2026, tarde**: a Paco le gustó mucho el mockup visual de la propuesta 1
  (mapa siempre visible) — "le da un caché enorme a la app". Siguiente paso sugerido,
  **sin empezar todavía, no tocar código sin que lo pida explícitamente**: arrancar solo
  por la **Fase A** (mapa de fondo permanente, ~1 sesión, sin riesgo) — es un cambio
  invisible a propósito: el live-map se queda vivo detrás en vez de crearse/destruirse
  cada vez, pero las pantallas siguen tapándolo del todo, igual que hoy. El salto visual
  real (mapa asomando, barra semitransparente) no llega hasta la Fase B — no confundir
  las dos al retomarlo.

- **GPS mostrando ubicación de Portugal — CASI CERRADO (13 sept 2026): pinta a geolocalización
  de escritorio poco fiable, no a bug de la app.** Detectado de paso investigando el bug de
  Ronda: con Paco físicamente en Galicia, el panel 🐛 mostró `[Salma] Ubicación: 39.9224
  -8.1332 ±500m` (centro de Portugal) y `[Salma] Copiloto (caché): Portugal pt`. Paco confirmó
  después el dato clave: **en el portátil sale mal posicionado (Portugal), en el móvil sale bien
  posicionado**, mismo momento. Un portátil no tiene chip GPS — el navegador de escritorio estima
  la posición por WiFi/IP (compara redes WiFi vistas contra la base de ubicaciones de Google, o
  cae a la IP), y si esa base tiene mal geolocalizado el router de Paco (o el bloque de IP de su
  ISP está registrado en Portugal), da una coordenada de Portugal con `±500m` de "confianza"
  aunque esté mal. El móvil sí tiene GPS por satélite real, por eso acierta. Se revisó el código
  (`app.js`) y las llamadas principales ya piden `enableHighAccuracy: true`
  ([app.js:3853](app.js:3853), [app.js:5734](app.js:5734)) — no es que la app pida poca
  precisión; sin chip GPS esa opción no cambia nada. Conclusión: probablemente **no es un bug
  arreglable en el código**, es una limitación de hardware/red del portátil. La etiqueta
  "(caché)" del log del copiloto queda aparte, sin relación con esto — simplemente cachea lo que
  el navegador le dio, que ya venía mal desde el origen. **Sin tocar nada de código.** Si vuelve
  a salir raro en el MÓVIL (no en el portátil), eso sí sería la caché de `geo:{lat}:{lng}` en KV
  (24h TTL) o algo del `watchPosition` — investigar entonces, no antes.

- **Workers Builds DESCONECTADO del todo (12 sept 2026, mañana) — sustituido por GitHub
  Action manual.** Tras la segunda pérdida de secrets (ver entrada de abajo), Paco
  desconectó el repo de GitHub en salma-api → Settings → Builds. Ya no hay ningún deploy
  automático en cada push — ni desde esta sesión ni desde ninguna otra. Para desplegar el
  Worker ahora: repo → pestaña **Actions** → **"Deploy Worker"** (`.github/workflows/
  deploy-worker.yml`, añadido esta madrugada) → botón **"Run workflow"**, disparo manual,
  funciona desde el navegador del móvil sin terminal. Ejecuta literalmente
  `npx wrangler deploy -c wrangler.toml` en un runner de GitHub — el mismo comando que se
  ha usado siempre desde el portátil, no toca secrets. Requiere el secret de GitHub
  `CLOUDFLARE_API_TOKEN` (ya configurado). **Probado una vez (12 sept, ~13:00): deploy en
  25s, éxito, y confirmado que NO tocó los secrets ya puestos** — la única secret que
  pareció faltar tras esa prueba era porque no se habían repuesto todas, no porque el
  deploy las borrara.
  **Estado de los 15 secrets a la tarde del 13 sept — 9 confirmados puestos (más
  `GOOGLE_TTS_KEY`, que no es de los 15 y el Worker no la usa):** `ANTHROPIC_API_KEY`,
  `GOOGLE_PLACES_KEY`, `OPENAI_API_KEY` (ya estaban) + `BRAVE_SEARCH_KEY`,
  `DUFFEL_ACCESS_TOKEN`, `RAPIDAPI_KEY`, `ELEVENLABS_API_KEY` (repuestos con
  `worker/restaurar-secrets.cjs --subir`) + `OPENWEATHER_KEY` (home.openweathermap.org) +
  `ADMIN_TOKEN` (generado con `crypto.randomBytes` en sesión, guardado por Paco) — los
  3 últimos puestos a mano con `wrangler secret put`, todo verificado con
  `wrangler secret list`. **Faltan por reponer estos 6, ninguno con backup local — solo
  desde su panel, PAUSADO A PETICIÓN DE PACO (13 sept) — recordárselo en próximas
  sesiones, no perseguirlo sin que él lo pida**: `SERPER_API_KEY` (serper.dev — su web
  de registro estaba caída el 13 sept, comprobado también desde el navegador de la
  sesión, no solo la red de Paco; la API en sí, `google.serper.dev`, respondía normal,
  reintentar más tarde), `STRIPE_SECRET_KEY` (dashboard Stripe), `TWILIO_ACCOUNT_SID` /
  `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` (consola Twilio), `GA4_CREDENTIALS`
  (service account JSON de Google Analytics — la más laboriosa de las 6, y de las que
  menos urgen: el endpoint `/ga4` no lo llama ninguna pantalla de la app todavía, así
  que montarlo ahora no cambia nada visible hasta que se construya un panel de stats en
  `admin.html`). Con los 9 que hay ya funciona lo esencial (chat, generación de rutas,
  verificación Google, fotos, búsqueda web, vuelos, hoteles/coches, voz, clima, panel
  admin) — lo que falta es eventos, Stripe, SOS por SMS y GA4.
  **ACTUALIZADO 21 sept 2026 (comprobado con `wrangler secret list`, solo nombres): ya NO son 6, faltan 3.** Hoy hay 18 secrets. Repuestos/añadidos desde entonces: `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (14 sept, pagos), `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` (repuestos) + `TWILIO_WHATSAPP_FROM` + `PACO_WHATSAPP_TO` (feedback de testers, 19-21 sept), `FIREBASE_SERVICE_ACCOUNT`, `GOOGLE_STATIC_MAPS_KEY`, `GOOGLE_TTS_KEY`. **Faltan SOLO:** `TWILIO_PHONE_NUMBER` (número desde el que sale el SMS del SOS — sin él `/sos` responde "Twilio not configured" y no manda SMS; es el único con efecto real hoy; Paco tiene Twilio en modo prueba, vale el número de prueba de la cuenta), `SERPER_API_KEY` (búsqueda de eventos al pedir ruta con fechas; sin ella se salta en silencio) y `GA4_CREDENTIALS` (panel de stats del admin, que no existe todavía). Serper y GA4 pueden seguir pausados sin problema; los secrets los pone Paco con `wrangler secret put`, la sesión no toca claves.
  **ACTUALIZADO 23 sept 2026 — ya solo faltan 2.** `SERPER_API_KEY` puesta por Paco (`wrangler secret put`, cuenta gratis en serper.dev, sin pasar la clave por el chat — la pegó directo en su terminal), confirmada con `wrangler secret list` (20 secrets ahora, incluye también `PACO_EMAIL_TO`/`RESEND_API_KEY` del aviso por email a testers). **Búsqueda de eventos en guías con fechas ya activa** desde ahora, sin desplegar nada (el Worker lee el secret en caliente). **`TWILIO_PHONE_NUMBER` sigue BLOQUEADO, no es cosa de configurar hoy**: Paco confirmó que no tiene ningún número comprado en Twilio — la compra sigue parada por la revisión del "compliance profile" ya documentada en la sección de WhatsApp más abajo (sin fecha estimada, avisa Twilio por email). Nada que hacer aquí hasta que llegue esa aprobación; el SOS por SMS se queda sin funcionar mientras tanto (sigue devolviendo "Twilio not configured"). Queda solo `GA4_CREDENTIALS`, sin prisa (no hay panel que lo use todavía).
- **Workers Builds — REABIERTO (12 sept 2026, madrugada): la "prueba de fuego" del 11
  sept dio falso positivo, se ha perdido una SEGUNDA key (`GOOGLE_PLACES_KEY`).** Tras el
  "confirmado seguro" de abajo, un deploy automático posterior (entre las 22:14 y la
  01:10 del 12 sept, sin aislar cuál exactamente) volvió a dejar el Worker sin un secret
  — esta vez `GOOGLE_PLACES_KEY`. Se descubrió porque `/photo` empezó a devolver
  `{"error":"missing params"}` para TODAS las fotos de una ruta (mismo código exacto que
  devuelve si faltan los parámetros de la URL, así que el síntoma no gritaba "falta la
  key" — hubo que leer el código para verlo). El chat seguía funcionando normal
  (`ANTHROPIC_API_KEY` sí sobrevivió esta vez), por eso nadie lo notó hasta que faltaron
  las fotos. **Conclusión de Paco, con la que la sesión está de acuerdo: no fiarse de
  Workers Builds para deploys de producción hasta entender de verdad qué se lleva por
  delante los secrets — puede haberse llevado alguno más sin que aún se haya notado.**
  Pendiente: `npx wrangler secret list -c wrangler.toml` y comparar contra las 15 de la
  tabla de abajo; reponer `GOOGLE_PLACES_KEY` con `npx wrangler secret put
  GOOGLE_PLACES_KEY -c wrangler.toml`; y decidir si Workers Builds se desconecta del todo
  o se queda solo para cambios que no toquen nada sensible, verificando `/health` después
  de cada deploy automático (no solo probando el chat).
- **Workers Builds (11 sept 2026) — se dio por resuelto y confirmado seguro la misma
  noche; ver entrada de arriba (12 sept), NO lo estaba.** Tras conectar Cloudflare
  Workers Builds (push a `main` → deploy automático, ver alternativa del checklist §4),
  `ANTHROPIC_API_KEY` desapareció del Worker en producción — Salma dejó de responder a
  todo el mundo con "no está configurada (falta API key)". La pantalla de "Variables y
  secretos en tiempo de ejecución" del dashboard estaba bloqueada para editar (mensaje
  "Worker que solo tenga recursos estáticos", no verificado si es la causa real o un
  efecto colateral). **No se confirmó la causa raíz**: al intentar reponer el secret con
  `wrangler secret put` salió el error "the latest version of your Worker isn't currently
  deployed" — indica que había una versión subida y sin desplegar rondando, sospechosamente
  relacionado con la casilla "Habilitar compilaciones de vista previa" que se dejó activada
  al conectar el repo. Arreglo aplicado (desde el portátil, PowerShell):
  `npx wrangler deploy -c wrangler.toml` (alinea versión desplegada = última) seguido de
  `npx wrangler secret put ANTHROPIC_API_KEY -c wrangler.toml` — funcionó.
  **Efecto colateral descubierto en el rescate**: el portátil de Paco estaba 37 commits
  por detrás de `origin/main` — el deploy de emergencia subió código viejo (reapareció el
  bug del texto cortado al generar ruta, ya arreglado en `main`). Se corrigió con
  `git pull origin main` + nuevo `wrangler deploy`. Esto es un problema aparte de Workers
  Builds — repetir el housekeeping del 10 sept, `git pull` antes de cualquier deploy manual.
  **Se creyó resuelto la misma noche (11 sept, ~23:45) — NO lo estaba, ver entrada de
  arriba (12 sept):** se apagó "Compilaciones para ramas que no son de producción"
  (salma-api → Settings → Builds → Control de ramas) — esa es la casilla sospechosa de
  crear versiones sin desplegar. Prueba de fuego: commit de prueba a `main`, deploy
  automático, y mensaje real en el chat ("ruta de los faros") — Salma respondió completo,
  con fotos y guía (la prueba no llegó a comprobar TODAS las paradas, solo que hubo
  alguna foto). **Workers Builds NO está confirmado seguro** — se perdió una segunda key
  horas después. Con esa casilla
  apagada. Causa raíz exacta sin confirmar del todo (no se aisló si era esa casilla u
  otra cosa de la conexión inicial), pero el síntoma no ha reaparecido tras el fix.
- **Enlace "Cómo llegar" de una parada — fusionado a `main` (10 sept), falta que Paco
  confirme en pantalla.** El modal fullscreen de `map-modal.js` (del rediseño visual del
  7-8 sept) se quedaba enganchado a CUALQUIER enlace `google.com/maps` del chat — también
  al de "cómo llegar" a una sola parada, que debía abrir Google Maps directo. Causa: en
  `app.js` (`formatMessage`), la variable `isMaps` metía en el modal todo lo que llevara
  `google.com/maps`, sin distinguir ruta completa de parada suelta. Se separó en
  `isRouteMaps` (`app.js?v=100`): solo "Ruta completa" (varias paradas) abre el modal;
  "Cómo llegar" y el genérico "Abrir en Google Maps" abren con `window.open` directo, como
  cualquier otro enlace. Falta que Paco confirme en pantalla: pedir una parada suelta en
  el chat, tocar "Cómo llegar", comprobar que abre Google Maps (app o pestaña nueva)
  directamente, sin pasar por el mapa fullscreen de la web.
- **Enlace "Ruta completa en Google Maps" del chat — fusionado a `main` (10 sept), falta
  desplegar el Worker.** El link agregado (al final de una respuesta con varias paradas en
  negrita) usaba el formato viejo `/maps/dir/lat,lng/lat,lng/...` sin `?api=1`, que no abre
  bien desde el WebView de la PWA — a diferencia de los enlaces "Cómo llegar" por parada,
  que sí llevan `?api=1&destination=...` y funcionaban. Se cambió al esquema oficial de
  Google (`?api=1&origin=...&destination=...&waypoints=...`), igual que los de "Cómo
  llegar". Falta que Paco haga, desde su ordenador: `cd worker; npx wrangler deploy -c
  wrangler.toml`, y que confirme en pantalla tocando el enlace en una respuesta con ruta
  de varias paradas (ej. algo por la N-2 de Portugal).
- **Respuesta del chat cortada a media frase al generar una ruta — fusionado a `main`
  (10 sept, commit `d7e3154`), falta desplegar el Worker.** Paco reportó (chip "Hazme
  una ruta desde donde estoy", destino Chaves) que la prosa de presentación se cortaba
  a media palabra ("...cierra con un caldo en una tas") y saltaba directo a "Generando
  tu ruta...". Causa: en `worker/salma-worker.js` (`readAnthropicStream` y
  `readOpenAIStream`), el reenvío de cada trozo del streaming a `t: chunk` decidía si
  mandarlo o no mirando si `fullText` ya contenía el marcador `SALMA_ROUTE` completo —
  si un mismo trozo traía pegados el final de la prosa y el arranque del marcador, se
  descartaba el trozo ENTERO (prosa incluida) en vez de solo el marcador. Se cambió para
  mandar la parte de prosa que venga delante del marcador dentro de ese mismo trozo, y
  solo entonces pasar a `generating: true`. Probado con `node --check`, sin tocar
  frontend (no hace falta subir ningún `?v=`). **Verificado que sigue en el Worker viejo**:
  el 10 sept a las 16:48 UTC el `/version` devolvía `2856c741` desplegado a las
  08:18:16 UTC — de **antes** del commit (16:31 UTC) — así que el fix aún no ha corrido
  en producción. Paco estaba con el móvil y no pudo desplegar en el momento. Falta, desde
  su ordenador: `git pull origin main` (confirmar que baja `d7e3154` o posterior), luego
  `cd worker; npx wrangler deploy -c wrangler.toml`, comprobar que `deployed_at` en
  `/version` es posterior al pull, y probar el chip de ruta varias veces (el bug depende
  de dónde caiga el corte del trozo del stream, no siempre se repite).
- Stripe sigue en modo test — falta decidir cuándo pasar a `sk_live_`.
- Google Maps key sin restricción de dominio en GCP Console (no verificable desde el repo).
- **Modelo de negocio a medias**: "Salma Coins" (documentado más abajo en este archivo) y
  el Premium por periodos de `docs/pasarela-premium.md` conviven ahora mismo en el código
  — el Worker ya habla de planes/meses, el frontend todavía de coins. Hay que decidir y
  terminar la migración (Fases 2-4 del documento) o revertir el Worker, no dejarlo a medias.
  **21 sept 2026: DECIDIDO — Premium puro, se eliminan los coins.** Plan de 4 pasos y estado
  en la sección "Sesión 21 sept 2026 — Modelo de negocio". Paso 1 hecho; pasos 2-4 pendientes.
- WebAuthn/fingerprint sigue parcial (solo recuerda email).
- **[Prioridad baja] Resumen/narrativa post-viaje** — auditado 11 sept: no existe ningún
  sistema de "estados" de Salma (Exploradora/Buscadora/Acompañante/Crisis/Historiadora),
  ni `getSalmaState()`, ni nada que cambie el prompt según si un viaje está activo o
  completado — la selección de prompt (`buildMessages()` en `worker/salma-worker.js`)
  es solo por patrón de mensaje, no por ciclo de vida del viaje. Tampoco hay concepto de
  "viaje completado" en Firestore (`users/{uid}/maps/{mapId}` no tiene campo `status`).
  Lo único parecido a un "resumen" es el vídeo Canvas (`video-player.js`, tipo `resumen`)
  y es un slideshow visual bajo petición explícita del usuario, no una narrativa de texto
  automática. Sin prisa — no hay nada roto, es una feature nueva a valorar más adelante.

- **[Prioridad baja, sin urgencia — Paco lo confirmó explícitamente] Política de red de
  este tipo de entorno bloquea `borradodelmapa-api.workers.dev`.** 19 sept 2026: al
  intentar bajar la captura de un tester desde el enlace (para poder verla sin que Paco
  tuviera que reenviarla como imagen), `curl` dio `403` — diagnosticado con
  `/root/.ccr/README.md` y `curl http://127.0.0.1:43649/__agentproxy/status`: es un
  bloqueo de **política de red del entorno** (`"gateway answered 403 to CONNECT (policy
  denial...)"`), no un problema de certificados ni de configuración de la sesión —
  confirma y amplía el bloqueo ya documentado varias veces en este archivo contra este
  mismo dominio. Afecta a cualquier sesión de Claude Code con esta política, sea el
  enlace de Paco o de un tester — no depende de quién lo mande. **Mientras tanto, sin
  tocar nada**: si Paco quiere que una sesión vea una captura concreta, la reenvía él
  como imagen directamente en el chat (funciona ya, sin depender de la red). **Arreglo
  de fondo, si algún día interesa**: cambiar la política de red de este tipo de entorno
  (o crear uno con una política menos restrictiva) desde la configuración de Claude Code
  en la web — https://code.claude.com/docs/en/claude-code-on-the-web. Paco confirmó que
  le interesa pero no es urgente — no perseguir esto hasta que lo pida.

### 🔧 Deuda técnica

- ~~Código duplicado~~ → **HECHO 22 sept 2026, solo lo que era de verdad copia exacta.**
  Se comparó cada función línea a línea antes de tocar nada (Paco: "asegúrate que no
  rompa nada"):
  - `_sampleWaypoints` (`guide-renderer.js`/`mapa-itinerario.js`) — **eran idénticas** →
    unificadas en `sampleWaypoints()`, global nuevo en `app.js`; las dos ahora delegan.
  - `escapeHTML`/`_esc` (`mapa-itinerario.js`, `docs-viajero.js`, `flight-watches.js`) —
    **mismo algoritmo DOM** (`mapa-itinerario.js`/`docs-viajero.js` idénticas incluida la
    guarda `if(!str) return ''`; `flight-watches.js` sin esa guarda, pintaba el texto
    literal "undefined" en ese caso — al delegar en `escapeHTML()` de `app.js` de paso se
    corrige) → las tres delegan ahora en `escapeHTML()` de `app.js`.
  - `_groupByDay` (`guide-renderer.js`/`bitacora-renderer.js`) — **NO son iguales**:
    `guide-renderer.js` rellena el título del día con el de una parada posterior si la
    primera no lo traía; `bitacora-renderer.js` no lo hace. **Dejadas separadas a
    propósito** — fusionarlas habría cambiado qué título se ve en el Diario en algunos
    casos.
  - `_fullRouteGmapsUrl` (`guide-renderer.js`/`mapa-itinerario.js`) — **NO son iguales**:
    una exige `place_id` en todas las paradas, la otra admite lat/lng sueltas de
    respaldo. **Dejadas separadas a propósito** — es lógica de producto distinta, no
    duplicación accidental.
  Probado en el navegador de la app (`escapeHTML`/`sampleWaypoints`/los `_esc` de cada
  módulo, resultado idéntico al de antes) — sin tocar el Worker, sin coste. `?v=` subidos
  en `index.html`: `app.js` 152, `flight-watches.js` 5, `guide-renderer.js` 55,
  `mapa-itinerario.js` 78, `docs-viajero.js` 2.
- ~~Monkey-patch frágil~~ → **YA NO EXISTE, verificado 22 sept 2026 — era documentación
  desactualizada, no código real.** `mapa-itinerario.js` parcheaba en su día
  `bitacoraRenderer.renderDiario` en runtime, pero el rediseño de navegación de
  septiembre ("Chat modal flotante", ver sesión del 10 sept, "se rehizo de cero, sin
  monkey-patch") ya lo quitó — solo quedaba el patch en backups de abril
  (`backups/mapa-itinerario-20260406.js` y similares), nunca en el código vivo. Corregidas
  las dos menciones que quedaban sueltas en "Archivos principales"/"Dependencias entre
  módulos" más arriba en este archivo, que seguían describiendo la arquitectura vieja.
- **Deep links transport — nota corregida 22 sept 2026, era imprecisa (mismo patrón que
  el monkey-patch: la realidad ya no coincidía con lo escrito).** No es "solo Uber y Lyft
  tienen deep link" — hay 3 sitios en el código con cobertura mucho más amplia:
  `worker/salma-worker.js` (`TRANSPORT_APP_URLS`, `buildGoToTransportActions`/
  `buildDestTransportInfo`) y `app.js` (`formatMessage`) ya reconocen y etiquetan Uber,
  Lyft, Grab, Bolt, DiDi, Gojek, Careem, inDrive, Cabify, FREENOW, Kakao T, Ola, Yandex
  Go y Yango. Lo que sí es cierto y sigue pendiente: de esas, solo **9** (Uber, Lyft, Ola,
  Yandex, Yango, Google Maps, Waze, Citymapper, Moovit — según el propio
  `transport-apps.json`) abren la app con el trayecto YA puesto (origen/destino
  prellenados); el resto abre la app normal sin prellenar, porque su formato de enlace
  propietario no está investigado — añadirlo bien (sin arriesgarse a un enlace mal
  formado) es trabajo de investigación real, no una limpieza rápida. **Sin tocar, queda
  aparte.** De paso, arreglado un bug pequeño encontrado mirando esto: `app.js`
  (`formatMessage`) tenía la condición `url.indexOf('gojek.com')` duplicada dos veces en
  la misma cadena de `else if` — la segunda nunca podía ejecutarse, se borró (cero cambio
  de comportamiento, confirmado en el navegador).
- ~~2 funciones dead code~~ → **BORRADAS 22 sept 2026.** `injectGoogleMapsLink()` e
  `injectTransportBlock()` en el Worker (llevaban desactivadas desde P2-12, solo hacían
  `return reply`) y los 2 sitios que las llamaban (uno de ellos, un bloque entero que
  nunca podía ejecutar nada — la condición de la que dependía era matemáticamente
  siempre falsa). Verificado con `node --check`, sin más referencias colgando — no toca
  ninguna API de pago, es solo quitar código que no hacía nada. **Desplegado 22 sept
  2026** (`npx wrangler deploy -c wrangler.toml` desde `worker/`, esta sesión sí tenía
  credenciales de Cloudflare), **Worker Version ID `cd3f975b-0bdb-4ba0-9230-233258271267`**
  — confirmado contra `/version`, 18 secretos intactos (`wrangler secret list`).

### 🧵 Ramas rescatadas (10 sept) — con trabajo real, sin fusionar a `main`

Estaban solo en el portátil de Paco, ya están en GitHub, **pero ninguna está fusionada
en `main` todavía** — son ramas propias, con historia que ha divergido de `main`. Antes
de fusionar cualquiera: mirar si sigue mereciendo la pena (puede que algo se haya vuelto
a hacer distinto después) y probarla, una por una, con confirmación de Paco.

| Rama | Qué trae (por los commits) | Tamaño del cambio |
|---|---|---|
| `claude/vigilant-nightingale-3b17ca` | Flujo `go_to`: pregunta el mes antes de buscar vuelos (solo ida) + fix de "aquí cerca" no debe disparar `go_to`. **Aparcada por decisión de Paco (10 sept) — no es necesaria de momento, no fusionar sin que él lo pida.** | medio (salma.js + worker) |
| `trabajo-5-sept-2026` (tag `v-5sept-completo`) | Copia de referencia del día que se borró el Worker (protocolo §1) — histórico, no es "trabajo nuevo" que fusionar | — |

Todas las demás ramas rescatadas del 10 sept ya se revisaron una a una: 2 se fusionaron
de verdad (ruta duplicada, narrador sin ráfaga + GPS confirmado — este último escrito de
cero), y 4 (`vigorous-lichterman`, `hopeful-goldstine`, `vibrant-bassi`,
`hungry-tereshkova`) resultaron estar ya resueltas en `main` por otro commit hecho
independientemente, casi siempre el mismo día o unos meses después con un rediseño más
completo — ver detalle de cada una en "✅ Ya resuelto" arriba. Solo queda
`vigilant-nightingale-3b17ca`, aparcada a propósito.

### 📋 Sesiones de Code sueltas (29 ago – 10 sept) — revisar en tu ordenador

No pude leer el contenido de estas conversaciones (ver límites abajo), solo metadatos.
Están ordenadas de más a menos reciente. "Señal git" es lo que se veía en el árbol de
trabajo al terminar cada sesión — no dice si el problema se resolvió, solo si el cambio
llegó a un commit y si ese commit llegó a GitHub.

| Fecha | Título | Rama | Señal git | Acción sugerida |
|---|---|---|---|---|
| 8 sept | Diseño tokens estudio | `worktree-rediseno-visual` | comprobado 10 sept: sin commits propios (nada exclusivo del portátil) | Nada que rescatar — lo que hubiera de valioso no llegó a commitearse |
| 7 sept | Guía con mapa no funciona | `main` | cambios sin commitear al cerrar | Confirmar con Paco si el mapa ya va bien; si no, retomar |
| 7 sept | Rediseño visual de la app | `main` | cambios sin commitear al cerrar | Puede solaparse con "Diseño tokens estudio" — mirar juntas |
| 7 sept | Pasarela de pago Stripe | `worktree-pasarela-pago` | Fase 0+1 sí llegaron a `main` (commits `200706a`, `5a6b2f8`); la rama en sí nunca se pusheó | Ver el crítico de pago roto arriba — esto es la causa |
| 6 sept | Road-trips reales con búsqueda web | `main` | cambios sin commitear, sin commit identificable en el historial | Confirmar si se llegó a implementar algo o quedó en nada |
| 6 sept | Anclar país y radio de búsqueda (x2) | `main` | limpia | Parece resuelto — `anchorCountry` ya está en el Worker |
| 6 sept | Saca lo pendiente | `main` | sesión de 21s, sin cambios | No hizo nada, ignorar |
| 5 sept | Rutas: respuestas y recomendaciones | `main` | **rescatado y fusionado a `main` el 10 sept** (probado por Paco en producción) | Cerrado |
| 5 sept | Geolocalización incorrecta en rutas | `main` | limpia, sin commit identificable | Confirmar si el bug de geolocalización sigue vivo |
| 5 sept | Cambios no reflejados en la app de rutas (x3, Opus) | `main` | cambios sin commitear en las tres | Es el incidente que motivó el protocolo del §1 de este archivo — confirmar que ya no pasa |
| 4-5 sept | Rutas con Web Search y simplificación (x2) | `main` | una limpia, otra con cambios sin commitear | Sin commit identificable con ese tema — confirmar si se perdió |
| 31 ago | Auditoría validador URLs y trazado rutas Salma | `main` | cambios sin commitear al cerrar | La sanitización de URLs ya está documentada como implementada — probablemente ok |
| 30 ago | Ajustes UI pantalla principal Salma | `main` | cambios sin commitear al cerrar | Revisar si quedó algo suelto |
| 30 ago | Actualizar KV (Portugal + verificación global) | `claude/lucid-kirch-e19278` | comprobado 10 sept: la rama existe en el portátil pero sin ningún commit propio | Nada que rescatar — la sesión no llegó a commitear el trabajo de Portugal |
| 30 ago | Auditoría estado actual Portugal en SALMA | `main` | cambios sin commitear al cerrar | Ligado a la sesión anterior |
| 30 ago | Auditoría y validador de URLs de Google Maps | `main` | cambios sin commitear al cerrar | Revisar solapamiento con la del 31 ago |
| 29 ago | BRIEFING: Flujo Guiado de Creación | `main` | cambios sin commitear al cerrar | El flujo guiado de 8 pasos ya existe en `app.js` ("Afinar") — probablemente se integró en otro commit posterior |

**Housekeeping pendiente:** el `main` del portátil de Paco seguía 10 commits por detrás
de GitHub el 10 sept (comprobado con `git status`). Antes de la próxima sesión de trabajo
ahí, hacer `git pull origin main` — es un fast-forward, seguro.

### Metodología y límites de este barrido

- Comparado contra el código real (`git log`, `git ls-remote`, `grep` en Worker/frontend/
  `firestore.rules`) el 10 sept 2026 — no contra lo que decían sesiones anteriores.
- **Sin acceso a conversaciones de chat normal (claude.ai)**: si algo se decidió o se pidió
  ahí y no llegó al repo, no está en esta lista. Si Paco recuerda algo de esas
  conversaciones que falte aquí, decírselo a la sesión y se añade.
- De las sesiones de Code de la tabla, solo se pudieron ver metadatos (título, fecha,
  rama, si quedaron cambios sin commitear/pushear) — el ordenador de Paco estaba
  desconectado durante este barrido y no se pudo leer el contenido de esas conversaciones.
  Reconectarlo permite revisarlas una a una.
- Actualizar esta sección (no crear una nueva) cada vez que se cierre o se abandone algo
  pendiente, para que no se repita el desfase que motivó este barrido.

### Barrido del 16 sept 2026 — "situación y estudio" de KV, sin tocar código

Paco pidió una puesta al día de la situación de KV. Al comparar la documentación de este
archivo contra `salma-worker.js`, `index.html` y la API real de Cloudflare (namespaces +
código fuente desplegado del Worker), salieron 3 hallazgos que llevaban tiempo sin
reflejarse aquí — ninguno es un bug, es documentación desfasada:

1. **Un segundo namespace KV** (`ROAD_GEOM`, para geometría de carreteras) que no aparecía
   mencionado en la sección de KV, solo en `wrangler.toml`.
2. **15 endpoints del Worker sin documentar** que ya están desplegados y en uso: toda la
   familia de Vigilancia de Vuelos (`/flight-watches`, `/flight-alerts`, `/flight-places`),
   `/whatsapp`, `/stripe-webhook`, `/roads/resolve`, `/weather`, `/transport`, `/translate`,
   `/tts-google`, `/historia-lugar`, `/admin/verify-place`.
3. **7 archivos JS de la raíz sin listar** en "Archivos principales": `flight-watches.js`,
   `map-modal.js`, `share-inbox.js`, `translator.js`, `historia.js` (+ `historia.css`),
   `video-assembly.js`, `debug-panel.js` — todos cargados de verdad en `index.html`, no
   código muerto.

El hallazgo con relevancia de coste (norma de la sección "⛔ PROTOCOLO", punto 8): el cron
diario de las 6:00 UTC (`_cronFlightWatches`) lleva ya desplegado un tiempo y llama a la
API de Duffel automáticamente, hasta 20 veces al día, sin que ningún usuario pida nada en
ese momento — no es un cambio de esta sesión, pero no estaba dicho en ningún sitio y debía
estarlo. Detalle en la sección de KV, tabla "3 crons del Worker".

**Límite de este barrido**: no se ha podido leer el contenido real de las claves KV (cuántas
de las 193 fichas nivel 1/2/2.5 hay pobladas de verdad, cuántas rutas nivel 3 cacheadas) —
el conector de Cloudflare de esta sesión solo gestiona namespaces, no claves individuales, y
no hay credenciales de `wrangler login` en este contenedor. Para ese dato exacto:
`npx wrangler kv key list --binding=SALMA_KB --remote -c wrangler.toml` (y lo mismo con
`--prefix=dest:`, `--prefix=route:`, etc.) desde un sitio con esas credenciales.

---

## Normas de desarrollo

### Autonomía de la sesión (acordado con Paco, 11 sept 2026 — trabaja bastantes días desde el móvil)

- **Bajo riesgo** (documentación, `CLAUDE.md`, housekeeping de git, subir algo que ya se
  ha hablado y probado en la misma conversación) → la sesión puede hacerlo directo, sin
  preguntar paso a paso.
- **Todo lo demás** (código de `app.js`/`salma-worker.js`/cualquier `.js` de la app, el
  prompt, deploys que afecten a producción, cualquier cosa que cambie lo que ve un
  usuario) → sigue el resto de reglas de esta sección tal cual: se pregunta y se confirma
  en cada paso, **salvo** que Paco diga explícitamente "hazlo" para ese caso concreto en
  ese momento — eso no es un permiso permanente, solo vale para esa acción.
- **⚠️ Coste de APIs — esto NO entra en "bajo riesgo" NUNCA, ni siquiera si el cambio es
  mínimo, ni siquiera si es solo tocar código o documentación.** Regla añadida el 15 sept
  2026, a fuego, tras la factura de Google Places de 82€ en 14 días (ver 🔴 Crítico) y
  reforzada el mismo día porque Paco insistió en que aplica **SIEMPRE — sin umbral de
  "esto es tan pequeño que no cuenta", sin excepciones, en cualquier cambio mínimo**:
  **cualquier cambio, por pequeño que sea, en cualquier línea que llame o pueda llegar a
  llamar a una API de pago** (Google Places/Maps, Anthropic, OpenAI, Duffel, RapidAPI,
  Twilio, ElevenLabs, Stripe, Brave, Serper, OpenWeather...) — subirlo o bajarlo, tanto
  da — **se le dice a Paco explícitamente, ANTES o en el momento, no como nota de
  después.** Decirlo significa: qué se toca, por qué puede afectar al coste, y una
  estimación aunque sea a ojo. No hace falta esperar a que él pregunte, y no es decisión
  de la sesión juzgar si "esto es tan poco que no merece mención" — si hay duda, se dice.
  Aplica a arreglos de coste igual que a features nuevas — un fix que promete ahorrar
  dinero SIGUE necesitando decir qué se tocó y por qué, no basta con "ya está arreglado".

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets
- **Nunca** usar `window.onload` — Firebase se inicializa en el head
- **Nunca** tocar el prompt sin chequear contradicciones entre bloques
- **Nunca** editar código sin OK explícito de Paco
- **Nunca** iterar cambios al prompt/código sin aprobación en cada paso
- **Nunca** ejecutar scripts KV sin explicar qué hacen. Si KV vacío, restaurar desde JSONs locales
- **Nunca** subestimar costes API — calcular tokens reales + reintentos + dar rango
- **Nunca** tocar ni desplegar nada que llame a una API de pago (nueva llamada, cambio de
  frecuencia, de field mask, de caché, de límites...) sin decir el impacto de coste
  esperado — ver regla de arriba, esto es lo mismo dicho dos veces a propósito
- Antes de refactorizar algo que funciona, confirmarlo con Paco
- Los commits van en español, mensajes cortos y claros
- Cuando algo se rompe, revertir a la última versión estable antes de parchear

---

## Procedimiento de restauración

### Si se rompe el frontend

```bash
# Opción 1: Restaurar desde tag git
cd C:\Users\User\Desktop\salma
git checkout v1-stable-20260410

# Opción 2: Restaurar desde backup
cp -r C:\Users\User\Desktop\salma-v1-stable-20260410/* C:\Users\User\Desktop\salma/
# (excepto .git y .claude)

# Opción 3: Restaurar un solo archivo
cp C:\Users\User\Desktop\salma-v1-stable-20260410/app.js C:\Users\User\Desktop\salma/app.js

# Subir a GitHub Pages
cd C:\Users\User\Desktop\salma
git add -A && git commit -m "restaurar v1 estable" && git push
```

### Si se rompe el Worker

```bash
# Restaurar worker desde backup
cp C:\Users\User\Desktop\salma-v1-stable-20260410\worker\salma-worker.js C:\Users\User\Desktop\salma\worker\

# Desplegar
cd C:\Users\User\Desktop\salma\worker
wrangler deploy

# Si faltan secrets (keys en C:\Users\User\Desktop\salma\api\)
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_PLACES_KEY
wrangler secret put BRAVE_SEARCH_KEY
wrangler secret put DUFFEL_ACCESS_TOKEN
wrangler secret put RAPIDAPI_KEY
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put SERPER_API_KEY
wrangler secret put OPENWEATHER_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_PHONE_NUMBER
wrangler secret put ADMIN_TOKEN
```

### Si se vacía el KV

```bash
cd C:\Users\User\Desktop\salma\worker\kv

# Restaurar nivel 1
node upload-kv.js

# Restaurar nivel 2
node upload-kv-nivel2.js

# Restaurar todo (bulk)
node upload-all-kv.cjs
```

### Si se rompe Firebase

```bash
# Desplegar reglas de Firestore
cd C:\Users\User\Desktop\salma
firebase deploy --only firestore:rules
# (requiere: npm install -g firebase-tools)
```

### Verificar que todo funciona

1. Abrir https://borradodelmapa.com — debe cargar welcome screen
2. Escribir "Hola" en el chat — Salma debe responder (~1s)
3. Login con cuenta de prueba — debe ir a chat
4. Pedir "3 días en Cádiz" — debe generar ruta con mapa y fotos
5. Guardar ruta → debe aparecer en Mis Viajes
6. Worker health: `curl -H "Authorization: Bearer {ADMIN_TOKEN}" https://salma-api.paco-defoto.workers.dev/health`

---

## Comandos útiles

```bash
# Ver cambios sin commitear
git status

# Subir cambios
git add -A && git commit -m "descripción" && git push

# Desplegar worker a Cloudflare
cd worker
wrangler deploy

# Añadir/actualizar secret en Cloudflare
wrangler secret put NOMBRE_SECRET

# Restaurar a V1 estable
git checkout v1-stable-20260410

# Backup completo en Desktop
# C:\Users\User\Desktop\salma-v1-stable-20260410\
```

## Reparto de worktrees — 7 septiembre 2026

Hoy se trabaja en 4 frentes. Recordatorio: la app de escritorio crea un worktree automático por cada sesión nueva (botón "+ New session" en la pestaña Code) — no hace falta usar `-w` a mano ni `git worktree add` manualmente.

**En paralelo (máx. 2 sesiones activas a la vez):**

1. `roadtrip-reales` — cerrar la tarea de road trips reales (bloque 1-Ruta de F2-Calidad: día a día, carreteras reales, dificultad, alternativas). Toca: `mapa-ruta.js`, renderizado de ruta en `salma.js`, prompt/Worker (con aprobación explícita — ver Protocolo, punto 5).
2. `pasarela-pago` — pasarela de pago (Stripe, bundles). Evitar tocar `index.html`/`styles.css` más allá del propio checkout.

**En cola (después de fusionar las dos anteriores a main, una detrás de otra — no en paralelo entre sí):**

3. `rediseno-visual` — rediseño visual amplio (layout, colores, componentes). Va primero para fijar la base visual antes de tocar Historia.
4. `historia-tab` — continuar el apartado Historia (ya existen `historia.js`/`historia.css` en el repo, no se parte de cero). Arranca solo cuando `rediseno-visual` esté fusionado a main, para heredar el estilo nuevo en vez de remaquetar dos veces.

**Notas aparte (no relacionadas con este reparto, detectadas al revisar el repo):**
- Hay ~40 worktrees viejos marcados `prunable` en `.claude/worktrees/` de sesiones anteriores ya cerradas. Se pueden limpiar con `git worktree prune` cuando quieras — no borra nada en uso, solo limpia referencias muertas.
- El repo tiene actualmente un diff enorme sin commitear (~619.000 líneas en ~1950 ficheros) que parece ser mezcla de finales de línea CRLF/LF, no cambios de contenido reales — no lo he tocado. Convendría revisarlo y decidir cómo normalizarlo antes del próximo commit, para no arrastrar sin querer un commit gigante de miles de ficheros.
