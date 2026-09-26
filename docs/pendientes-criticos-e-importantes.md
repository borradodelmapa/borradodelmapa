# Pendientes antiguos: crítico, importante, deuda técnica

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

### 🔴 Crítico

- **Nada abierto ahora mismo.** El último crítico real (edición de una guía grande
  sobrescribiéndola con menos paradas) se resolvió con edición por operaciones
  (`SALMA_ROUTE_EDIT`, no reescribe la guía entera) — **CONFIRMADO EN PANTALLA por Paco
  el 21 sept 2026** en todos los casos probados (quitar, sustituir, añadir sin verbos
  explícitos). Detalle completo, con todas las vueltas de arreglo, en
  `CLAUDE-historial.md`.
  - Quedan sin confirmar dos casos menores, baja prioridad: el botón "Ver mi plan" del
    aviso de límite (necesita una cuenta gratuita/Premium sin cupo para probarlo) y una
    edición real de una guía de ~19 paradas (no ha vuelto a darse la ocasión).
- Todo lo demás del 🔴 Crítico de antes del 22 sept (fotos rotas, facturación de Google
  Places, `/pin`, cámara del Narrador, enlaces de Maps, bugs de foto+guía, Ronda...) está
  desplegado desde hace más de una semana y nadie ha vuelto a reportar el síntoma —
  tratado como confirmado por el uso real sin queja. Historial completo en
  `CLAUDE-historial.md` si hiciera falta reconstruir algo.

### 🟡 Importante

- **Mejora Salma — Fase 1 (26 sept 2026) — CONFIRMADA EN PANTALLA por Paco ("funciona, llega a la admin").** "Todo el mundo es
  tester" (Paco). Botón fijo "✦ Mejora Salma" arriba (chat, Explorar/Mis viajes, Perfil) + tarjeta arriba en
  Ayuda (🐞 Algo no va · 💡 Tengo una idea · ❤️ Me ha encantado); 👍/👎 bajo cada respuesta de Salma
  (`salma.js:_addRateBar`) y al final de cada ruta (`mapa-itinerario.js`, `.itin-rate`); "⚑ ¿Nos avisas?"
  en los fallos (`_addReport`: Reintentar a 18 s, mapa que no se monta, sin conexión); "idea:" por WhatsApp.
  Todo en `debug-panel.js` (`window.__dbg.open/rateBar/reportButton/send`) → `POST /beta-feedback`, que ahora
  acepta **sin cuenta** (30/h por IP, KV `fbrate:*`) y guarda `kind`/`reason`/`context`; los 👍 van a
  `feedback_ratings`, lo demás a `beta_feedback` (pestaña Feedback del panel). Avisos a Paco: email en todo
  menos 👍/automáticos, WhatsApp solo formulario. **Premium por fallo confirmado: a mano** (panel admin →
  Añadir Premium; solo con cuenta). Sin APIs de pago. **Worker `3fd56511-002a-4a8b-bafc-3bbd2a04cd01`**,
  `app.js?v=180`, `salma.js?v=113`, `mapa-itinerario.js?v=81`, `debug-panel.js?v=17`, `styles.css?v=150`.
  **Fase 2 — SUBIDA 26 sept, pendiente de confirmar en pantalla.** Cada mensaje (menos 👍) se clasifica al
  llegar con GPT-4o-mini (`classifyFeedback`: tipo/zona/gravedad/resumen; los avisos automáticos por regla, sin IA)
  y se mete en un CASO (`feedback_groups`, estados nuevo/visto/en_marcha/arreglado/descartado). Coste medido:
  ~500 tokens ≈ 0,0001-0,0003 $/mensaje (§8, avisado). Avisos inmediatos (WhatsApp+email) SOLO si es urgente o 3
  avisos del mismo caso en 24 h (máx 1/caso/día); email por mensaje solo del formulario; WhatsApp por mensaje
  QUITADO. Resumen diario por email en el cron de las 6:00 UTC (`feedbackDigest`, sin IA). Panel admin
  (`salma-admin`, `be83009`): Feedback → "Mejora Salma" con vistas Casos / Mensajes y "Clasificar pendientes".
  **Worker `2223fc07-614d-4823-8d9d-773a888ee9e2`.** Probado de punta a punta con un 👎 "PRUEBA de Claude"
  (descartarlo en el panel).
  **Errores automáticos — SUBIDOS 26 sept, Worker `084549ff-d272-470c-bfeb-9f359d1f85f7`, `debug-panel.js?v=18`.**
  Sin que nadie pulse: errores JS de la web (`POST /client-error`, máx 5/visita, ruido filtrado), y del Worker
  (envoltorio de `fetch` → el viejo es `_fetch`: 5xx y excepciones; IA del chat sin respuesta; mapa de "Crear
  ruta con mapa" que no se monta). Casos de id fijo `err-<huella>` (`recordAutoError`/`fbUpsertGroup`), SIN IA,
  🤖 en el panel con "Detalle técnico". Un caso arreglado que vuelve se REABRE solo y avisa. Dos casos de prueba
  "PRUEBA … de Claude" → descartarlos. **Siguiente (a estudiar con Paco):** diagnóstico automático de cada caso
  por una sesión de Claude Code que prepara el arreglo en rama aparte → Paco solo valida (Aprobar/Rechazar).
  **Paso A — SUBIDO 26 sept, Worker `1b5508a8-4daa-4f96-bfe1-80d2fcd43702`, panel `salma-admin`:** diagnóstico
  dentro del caso, estados `propuesta`/`comprobando`, tipo `tarea`, `scripts/casos.cjs`, llave `CASES_TOKEN`
  (solo casos). Los 31 pendientes de este archivo pasados a casos. Los 🤖 no entran en la agrupación por IA;
  `/health` (503 a propósito) fuera de errores automáticos.
  **Fase 3:** avisar al que reportó cuando se arregla, "Mejorado gracias a vosotros", insignia de tester.

- **Borrar mi cuenta (26 sept 2026) — DESPLEGADO, pendiente de probar con una cuenta real.**
  Perfil → CUENTA → "Borrar mi cuenta" (escribir BORRAR) → Worker `POST /account/delete`
  (uid SIEMPRE del token, nunca del cuerpo) → `deleteUserCompletely()`, el MISMO borrado del
  panel admin (extraído tal cual de `/admin/user-action`, que ahora lo llama también → volver
  a probar el borrado del panel). Registro en KV `accountdelete:*` (1 año). Sin APIs de pago.
  **Worker Version ID: `4a01f76d-f1d2-4ea0-b0ac-7167e85da1c2`** (limpia también la caché de Explorar y quita el autor —"Un viajero", sin uid— de las copias que otros guardaron de sus rutas: `anonymizeSavedCopies`) · `app.js?v=178`. Requisito
  RGPD + Google Play.
  **PENDIENTE DE PROBAR (Paco, 26 sept: "no puedo probarlo ahora"), con dos cuentas de prueba A y B:**
  1) A guarda una ruta con "Compartir mis rutas" activado · 2) B la guarda desde Explorar (en Mis
  viajes de B sale "de <nombre de A>") · 3) A se borra desde Perfil (escribir BORRAR) → se cierra la
  sesión · 4) B sigue teniendo la copia pero pone "de Un viajero" · 5) la ruta de A ya no sale en
  Explorar ni A en el panel admin · 6) borrar otra cuenta de prueba DESDE EL PANEL admin (su código
  se movió a `deleteUserCompletely`). Si algo falla: `npx wrangler tail salma-api --format pretty`
  y buscar `[BORRAR-CUENTA]` (trae contadores y errores de cada paso).

- **Revisión UX (heurísticas de Nielsen), 26 sept 2026 — SUBIDA a producción, bloques 1-3
  CONFIRMADOS EN PANTALLA por Paco.** Solo frontend, sin Worker ni APIs de pago. Commits
  `a57c2f10` (portada que explica Salma + "Echar un vistazo sin cuenta"; chat sin sesión
  pide entrar ANTES de enviar y guarda la pregunta; inicio con 4 accesos; Ayuda = "¿Qué
  puedo hacer?" + feedback, detalles técnicos plegados) → `d28215f3` + `8e82e5eb`
  (legibilidad: mínimo 12px, mayúsculas solo en rótulos cortos, 7→3 tipografías) →
  `bb1464b4` (menú `Ayuda · Explorar · [Salma] · Mis viajes · Perfil`, "Nueva" en el chat
  con aviso de conversación sin guardar, sin tutorial de 3 pantallas, WhatsApp como canal
  en portada/inicio/Ayuda, 6 ejemplos con etiqueta) → `aef0f9b6` (Explorar sin sesión abre
  la ruta DENTRO de la app; `404.html` —página pública de guías— con el menú y la cabecera
  actuales, antes copia de marzo) → `ab090c5e` (1.781 páginas de destinos regeneradas:
  seguían con la plantilla antigua, cabecera rota y chat apuntando al dominio muerto
  `paco-defoto`). Vigente: `app.js?v=173`, `salma.js?v=112`, `styles.css?v=144`.
  **§9 ampliado:** el menú de abajo vive ahora en TRES sitios — `app.js:updateBottomBar()`,
  `BOTTOM_NAV` de `scripts/build-destinos.js` y `addBottomBar()` de `404.html`. Las páginas
  de destinos cargan `styles.css?v=${APP_CSS_V}` (antes sin `?v=`): subir `APP_CSS_V` a la
  vez que el `?v=` de `index.html`. Ojo: `build-destinos.js` sin `--country` reescribe
  `sitemap-destinos.xml` (la selección de 301) — restaurarlo con `git checkout` si no se
  quiere cambiar.
  **Pendiente:** (1) confirmar en pantalla el último paso (Explorar sin sesión dentro de la
  app, página pública de guía con menú nuevo, destinos regenerados); (2) **SEO — HECHO 26 sept (Paco: "no quiero problemas con google"):** las 1.793 páginas de
  destinos pasan a `noindex,follow` (`DESTINOS_ROBOTS` en `build-destinos.js`) y `sitemap.xml` ya
  solo enlaza static + blog (fuera `sitemap-destinos.xml` y el sitemap del Worker muerto
  `paco-defoto`). Portada, blog y legal siguen indexables. Para lanzar destinos: volver
  `DESTINOS_ROBOTS` a `index,follow,max-snippet:-1`, regenerar y devolver el sitemap —
  mejor por tandas, los mejores primero. **Guías públicas — HECHO 26 sept (`0d579a0c`):**
  `scripts/build-guias.js` crea `<slug>.html` en la raíz por cada guía de `public_guides`
  (misma URL, código 200, título/descripción/foto reales para WhatsApp y redes, `noindex`),
  borra las despublicadas (lista en `guias-publicas.json`); lo lanza a diario la Action
  `guias-publicas.yml` (04:15 UTC + botón manual, commit solo si hay cambios). Se añadió
  `og-image.jpg` (faltaba: la portada compartida salía sin imagen). **Al lanzar:** indexar
  SOLO las buenas (criterio a decidir con Paco, p. ej. ≥5 paradas + descripción + foto +
  listed) cambiando `GUIAS_ROBOTS` por guía en el script. **Siguiente SEO, sin prisa:**
  portada sin H1 ni enlaces fijos a Destinos/Blog;
  (3) Italia, Portugal, Japón, Marruecos y México no tienen página de destino porque faltan
  sus JSON en `worker/kv/output-nivel2` (163 de 193) — generarlos cuesta Claude Sonnet
  (céntimos); (4) con sesión iniciada solo se simuló el aviso de WhatsApp.

- **Explorar — rutas de otros viajeros (25 sept 2026) — CONFIRMADO EN PANTALLA por Paco**
  (pestañas, países sin repetir, tarjetas visuales, "salen todas" con mapa). Worker vigente
  `92b8a1c6-515b-4353-832f-15e3dde730f5`, `app.js?v=169`, `styles.css?v=140`. **Solo queda
  probar:** Perfil → apagar "Compartir mis rutas" → sus rutas desaparecen de Explorar (y al
  encenderlo vuelven). Detalle completo en `CLAUDE-historial.md`.
  **Rutas guardadas de otros (25 sept 2026, pedido por Paco) — DESPLEGADO, pendiente de
  confirmar en pantalla.** Antes, GUARDAR una ruta abierta desde Explorar la guardaba como
  propia y la volvía a publicar en Explorar a nombre de quien la guardaba. Ahora
  `guardarRutaDeOtro()` la guarda con `saved_from {slug, uid, autor}`, sin publicar, sin
  pedir foto a Google (usa portada y miniatura del original) y sin Perfil IA; sale en Mis
  rutas → sección "RUTAS GUARDADAS" ("de Paco") y no cuenta en los viajes del Perfil. No
  duplica si ya la tienes ni si es tuya. `app.js?v=170`. Las que se guardaron ANTES de este
  cambio siguen como propias (no se pueden distinguir solas) — borrarlas y volver a guardar.

- **Comunidad de viajeros por WhatsApp, 25-26 sept 2026 — SOLO ESTUDIO, sin desarrollar.**
  Viajeros que coinciden por afinidad/intereses, obligación cero, Salma de puerta, web
  como memoria, coincidencias como Premium. Paco: "seguiremos hablando de esto".
  Conversación y decisiones completas en `docs/idea-comunidad-viajeros.md`.
- **Catálogo de ideas de Kabi (app similar), 22 sept 2026 — SOLO ESTUDIO, sin decidir.**
  Bottom bar con "+" central ya implementado y confirmado; quedan por decidir: sliders de
  preferencias por tipo de viaje, sección de Eventos, Álbum de viaje (auto-emparejar
  fotos del carrete + opción de imprimir, esta última es un proyecto de negocio aparte).
  Detalle completo en `CLAUDE-historial.md`.
- **Sanear el prompt de sistema — PAUSADO, Paco lo dejó para otro día.** Los 5 cambios de
  texto pequeños (E, D, F, C, B) ya se hicieron uno a uno y están confirmados en pantalla
  (22 sept). Queda pendiente, solo si Paco lo pide, con el mismo proceso paso a paso
  (un cambio, un despliegue, una prueba): (A) si Salma debe preguntar algo antes de
  generar una ruta o seguir sin preguntar (como ahora), y qué hacer con `BLOQUE_GEOGRAFIA`
  (dejarlo, quitar solo la lista de fronteras, o recorte moderado). Proceso obligatorio
  descrito en `CLAUDE-historial.md` — no tocar el prompt sin seguirlo.
- **"Ruta por X sin días" no entra en modo guía — DECIDIDO no tocar la detección por
  texto.** La entrada fiable a una guía completa es un punto de entrada de la UI (el
  botón "+" ya cubre esto); si se escribe en el chat libre sin número de días, sigue
  cayendo en conversación normal con pregunta de días — es el comportamiento esperado.
- **Login con Google: "cancelled popup" — pasos 1-2 hechos, paso 3 (redirect de
  respaldo si el popup se bloquea) sin implementar.** Baja prioridad, sin reportes desde
  el fix.
- **Mapa siempre visible (V5) — propuesta que le gustó mucho a Paco ("le da un caché
  enorme a la app"), sin empezar.** Siguiente paso si se retoma: solo la Fase A (mapa de
  fondo permanente, invisible para el usuario). No tocar sin que Paco lo pida
  explícitamente. Documento completo en memoria de sesión (`project_mapa_fijo_v5.md`).
- **Modo offline completo — sin empezar** más allá de la persistencia de Firestore que
  ya está activa. Documento en memoria (`project_offline_mode.md`).
- Stripe sigue en modo test (`sk_test_`) — falta decidir cuándo pasar a `sk_live_`.
- Google Maps key sin restricción de dominio en GCP Console.
- WebAuthn/fingerprint sigue parcial (solo recuerda email) — y desde el 25 sept además
  quitado del login visible (Paco: "para no liar, de momento").
- **[Prioridad baja]** Resumen/narrativa post-viaje — no existe, sería feature nueva.
- **[Prioridad baja, confirmado que no urge]** La política de red de este tipo de entorno
  (contenedores de Claude Code) bloquea `borradodelmapa-api.workers.dev` — por eso muchas
  entradas del historial dicen "sin confirmar contra `/version`, bloqueo de red del
  contenedor". Arreglo posible: cambiar la política de red del entorno desde la config de
  Claude Code on the web. Paco confirmó que le interesa pero no es urgente.

### 🔧 Deuda técnica

- Código duplicado real (no solo parecido) → **unificado 22 sept 2026**:
  `_sampleWaypoints` y `escapeHTML`/`_esc` ya delegan en una sola función. Lo que
  parecía duplicado pero tenía lógica distinta (`_groupByDay`, `_fullRouteGmapsUrl`) se
  dejó separado a propósito.
- Deep links de apps de transporte: de las apps reconocidas (Uber, Lyft, Grab, Bolt,
  DiDi, Gojek, Careem, inDrive, Cabify, FREENOW, Kakao T, Ola, Yandex Go, Yango), solo
  9 abren con el trayecto ya puesto — el resto abre la app sin prellenar. Investigar
  formato de enlace propietario si hace falta, no es una limpieza rápida.
- 2 funciones muertas (`injectGoogleMapsLink`/`injectTransportBlock`) — **borradas 22
  sept 2026**.

---

**Historial completo de todas las sesiones, bugs ya confirmados y las investigaciones
puntuales (KV de abril, ramas rescatadas, saga de facturación de Google, saga de
WhatsApp F5.0-F5.4, panel admin...): ver `CLAUDE-historial.md`.**


