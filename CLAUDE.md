# CLAUDE.md — Borrado del Mapa

**borradodelmapa.com** — Salma, compañera de viaje con IA (diseña rutas, guía en ruta, resuelve imprevistos).
Repo: https://github.com/borradodelmapa/borradodelmapa · Usuario: **Paco**, founder y único desarrollador
(portátil, tablet y móvil); quiere aprender mientras se trabaja: enseñar y proponer mejoras.

> **Dieta del 26 sept 2026 (caso p-mui3grg5ei9):** este archivo se carga en CADA mensaje de CADA sesión, así
> que solo lleva lo imprescindible. Todo el detalle está en `docs/` (texto original, sin reescribir) — ver
> el índice al final. El historial de sesiones está en `CLAUDE-historial.md`. El CLAUDE.md anterior completo:
> `git show v-antes-dieta-claude-md:CLAUDE.md`. Lo específico del Worker: `worker/CLAUDE.md`.

## ⛔ PROTOCOLO DE TRABAJO — LEER ANTES DE TOCAR NADA
(Texto completo con las historias de por qué existe cada regla: `docs/protocolo-completo.md`.)
Nació el 5 sept 2026: seis fallos arreglados y ninguno visto en la app, todo restaurado y 15 API keys del
Worker perdidas. Las causas fueron de método, no técnicas.

### 1. UNA SOLA SESIÓN sobre este directorio
- Antes de empezar: comprobar que no hay otra sesión abierta sobre `C:\Users\User\Desktop\salma`. Si hacen
  falta dos a la vez, la segunda **en worktree aparte**, nunca en el mismo árbol.
- **`git push` rechazado (`non-fast-forward`) → PARAR.** Significa que alguien más escribe aquí.
- **1B (desde 13-14 sept): varias sesiones a la vez, cada una con su clon (móvil, portátil, nube).** Un push
  rechazado es rutina de git, no catástrofe: seguir el proceso.
  - Al abrir varias sesiones, decir a cada una qué toca y qué NO.
  - `git fetch origin main` antes de cualquier commit que vaya a subirse (la otra pudo subir mientras tanto).
  - Commits pequeños, push frecuente, mensajes claros (dicen de qué sesión/tema viene).
  - Push rechazado → PARAR → `git fetch origin main` → `git log --oneline HEAD..origin/main` → **confirmar
    con Paco quién es** → `git rebase origin/main` (nunca `push --force`) → **verificar que el propio cambio
    sigue intacto** (grep de las piezas clave) → recién entonces `git push`.
  - `CLAUDE.md` es zona común: si choca el mismo párrafo, parar, mirar y fusionar a mano conservando las dos
    aportaciones; nunca pisar la otra sesión.
  - **Despliegue del Worker: quien hace push del cambio lo despliega** (GitHub Action "Deploy Worker") y
    **anota el `Current Version ID` en el caso/pendiente** para que nadie redespliegue por si acaso.

### 2. UN CAMBIO, UNA PRUEBA, UNA CONFIRMACIÓN DE PACO
- No se toca el siguiente fallo hasta que Paco diga qué ve en su pantalla.
- **Nunca decir "arreglado"**: se dice *"desplegado — dime qué ves"*. Un `grep` que encuentra una función no
  prueba nada en su pantalla. Verificar **comportamiento**, no código.

### 3. PEDIR EVIDENCIA DE SU PANTALLA, Y PRONTO
- Ante un "sigue igual": **captura** y el panel **🐛** (botón flotante abajo-derecha → "Copiar"): trae errores JS
  y, en la cabecera, la versión del Worker y el `?v=` de cada script cargado — es lo primero que hay que leer.
- Si menciona una demo, diseño o comportamiento esperado: **preguntar qué es exactamente**, no suponerlo.
- Diagnóstico en vivo: `npx wrangler tail salma-api --format pretty` mientras él prueba.

### 4. CHECKLIST DE DESPLIEGUE — SIEMPRE EN ESTE ORDEN
(Versión completa con comandos y alternativa desde el móvil: skill `desplegar`.)
1. Subir `?v=` en `index.html` de **cada** `.js` modificado (los 19 scripts locales llevan `?v=`, ninguno sin él).
2. `git add` + `commit` + `push`.
3. Comprobar que la web sirve la versión nueva (Pages tarda 45 s – varios min):
   `curl.exe -s https://borradodelmapa.com/index.html | Select-String '\.js\?v='`
4. Desde `worker\`: `npx wrangler deploy -c wrangler.toml` — **siempre con `-c`** (en la raíz hay un
   `wrangler.jsonc` que se coge por error). PowerShell no tiene `&&`: encadenar con `;`. Alternativa sin
   terminal: Cloudflare Workers Builds (commit a `main` desde github.com, Directorio raíz = `worker`).
5. `curl.exe -s https://salma-api.borradodelmapa-api.workers.dev/version` → el Version ID debe coincidir con el del
   deploy. (`curl.exe`, no `curl`: en PowerShell `curl` es `Invoke-WebRequest`.)
6. **Paco prueba en la app.** Hasta aquí no está terminado. Duda de caché → panel 🐛, cabecera dorada.

### 5. NO SE BORRA EL WORKER. NUNCA
Ni el fichero ni el Worker de Cloudflare: al eliminarlo se destruyen sus secrets (15) de forma irreversible.
Copia de seguridad: `worker/restaurar-secrets.cjs` (sube los de `api\*.txt`, gitignored); diagnóstico Google:
`worker/probar-google-keys.cjs`; comprobar: `npx wrangler secret list -c wrangler.toml`.

### 6. ANTES DE DAR UN FALLO POR ENTENDIDO
- Un dato puede **calcularse bien y no llegar a pantalla**: seguir el dato **de punta a punta**.
- En un corte limpio, buscar **todos** los escritores y lectores en el repo entero (worker + scripts + crons).
- Al tocar el prompt, buscar **contradicciones entre bloques** (skill `prompt-salma`).

### 7. RESTAURAR SIN DESTRUIR
Volver atrás con un **commit nuevo**, nunca reescribiendo historia: `git restore --source=<commit> --worktree
--staged .`. Antes, dejar tag o rama de salvaguarda. Tags del 5 sept: `v-5sept-antes-de-volver-atras`,
`v-5sept-antes-de-borrar`.

### 8. CUALQUIER COSA QUE PUEDA MOVER LA FACTURA, SE DICE — SIEMPRE, SIN EXCEPCIÓN, POR MÍNIMA QUE SEA
Tras el susto de 82 € en 14 días de Google Places (15 sept 2026).
- **En TODO cambio, por mínimo que parezca, que toque una línea que llame (o pueda llegar a llamar) a una API
  de pago** (Google Places/Maps, Anthropic, OpenAI, Duffel, RapidAPI, Twilio, ElevenLabs, Stripe, Brave,
  Serper, OpenWeather…) se le dice a Paco: qué se toca, por qué puede afectar al coste y una estimación a ojo.
  Subir, bajar o "seguramente no cambia nada" cuentan igual.
- **No hay umbral** ("un parámetro, un field mask, una condición de caché, un número de intervalo" cuentan).
  Un fix que promete ahorrar también se avisa. Nunca decidir en solitario que "no hace falta mencionarlo":
  con duda, se dice. Antes o en el momento, nunca como nota de después.

### 9. EL MENÚ DE ABAJO Y LA CABECERA SON UNA SOLA COSA — APP Y PÁGINAS DE DESTINO A LA VEZ
Paco: **"no quiero ir detrás mirando si se hace o no se hace"** — checklist obligatorio.
- Las 1.793 páginas de `destinos/` llevan la misma cabecera, reloj y menú que la app porque
  `scripts/build-destinos.js` las genera desde constantes compartidas: **`LOGO_HTML`, `BOTTOM_NAV`** (reloj inline).
- **Cualquier cambio al menú de abajo** (`app.js:updateBottomBar()`) **o a la cabecera/eslogan**
  (`app.js:_renderChatEmpty()`, `.ce-top`/`.ce-hero`) se replica ANTES de darlo por terminado en
  `build-destinos.js` y se regenera al menos un país de prueba (`node scripts/build-destinos.js --country es`).
  El código del generador nunca queda desincronizado, ni un commit.
- El menú vive en **cuatro sitios**: `app.js`, `build-destinos.js`, `404.html` (`addBottomBar()`) y las 14
  páginas de `blog/*.html` + `legal.html` (copia de `BOTTOM_NAV`/cabecera, estilo en `paginas.css`, que va
  después de `styles.css`). Tocarlos a la vez.
- Si cambia un `?v=` de CSS/JS que cargan también los destinos (`styles.css`, `destinos.css`): subir igual
  `DESTINOS_CSS_V`/`APP_CSS_V` en `build-destinos.js` y el `?v=` de `styles.css` en blog y legal.
- Sin excepción, sin esperar a que Paco lo note en una captura.

### 10. POLÍTICA DE ACCESO: "MIRAR SÍ, USAR CON CUENTA" — IGUAL EN TODA LA WEB
Decidida con Paco el 26 sept 2026 ("queremos gente que se registre"). Cambiarla es decisión de Paco, no de una sesión.
- **Sin cuenta se ve:** portada, destinos, blog, lista de Explorar y el **avance de cualquier ruta** — título,
  foto, mapa y el **día 1 completo** (ruta de un solo día: la **primera mitad** de las paradas). Misma regla
  llegue por Explorar, enlace compartido o guía pública.
- **Con cuenta (gratis):** ruta entera, guardar, preguntar a Salma, crear rutas, chat, notas, WhatsApp, compartir.
- **El corte** = tarjeta bloqueada **dentro del carrusel de paradas**, tras la última visible (foto difuminada,
  "DÍA 2 🔒", "Te quedan N días y M paradas", botón → registro). Nunca debajo de todo ni pantalla vacía. En el
  avance se OCULTAN consejos, info práctica y "cerca de". Al entrar se reabre la ruta entera.
- **Un solo diseño de ruta:** la vista de itinerario de la app; la página pública (`404.html`/`<slug>.html`)
  manda a la app (`/?ruta=<slug>`) y queda solo para WhatsApp/redes/Google. `guide-renderer.js` pendiente de eliminar.
- **Enlace para compartir = su guía pública** (`borradodelmapa.com/<slug>`, páginas fijas de `scripts/build-guias.js`).
- Lo que exige cuenta **no se enseña como si funcionara** a quien no la tiene.

---
## Normas de desarrollo (texto completo: `docs/normas-desarrollo.md`)
- **Autonomía (11 sept):** bajo riesgo (docs, `CLAUDE.md`, git, subir lo ya hablado y probado en la conversación)
  → directo. Todo lo demás (código de `app.js`/`salma-worker.js`/cualquier `.js`, el prompt, deploys, lo que
  vea un usuario) → preguntar y confirmar cada paso, salvo un "hazlo" explícito de Paco para ese caso.
  **El coste de APIs NUNCA es "bajo riesgo"** (§8).
- **Nunca:** `const db` duplicado fuera de `app.js` · API keys en el código (van en secrets de Cloudflare) ·
  `window.onload` (Firebase se inicia en el head) · tocar el prompt sin chequear contradicciones · editar
  código sin OK explícito de Paco · iterar cambios al prompt/código sin aprobación en cada paso · ejecutar
  scripts KV sin explicar qué hacen (KV vacío → restaurar desde JSONs locales) · subestimar costes API
  (calcular tokens reales + reintentos + dar rango) · tocar/desplegar algo que llame a una API de pago sin
  decir el impacto de coste.
- Antes de refactorizar algo que funciona, confirmarlo con Paco. Commits en español, cortos y claros.
  Si algo se rompe, revertir a la última versión estable antes de parchear.

## Casos: la lista viva de pendientes (desde el 26 sept 2026)
Los fallos de usuarios, errores 🤖 automáticos y todos los pendientes viven como **CASOS** (panel admin →
Feedback → Mejora Salma → Casos). **Lo nuevo se apunta como caso, no en este archivo**:
`node scripts/casos.cjs crear <fichero.json>`. Los pendientes antiguos (detalle técnico) están en
`docs/pendientes-*.md`. Guía completa de la rutina: skill `casos`.
- **AL EMPEZAR una sesión:** `node scripts/casos.cjs hoy` (y leer los comentarios de Paco) → decirle qué hay.
- Al trabajar un caso: `coger <id>` → diagnosticar → arreglo preparado en la copia (worktree + localhost:8090)
  → `diagnostico` + `estado propuesta` → enseñárselo a Paco → con su OK, subir con el protocolo →
  `estado comprobando`. Al subir a producción: `version "qué se subió" <ids>`. Al terminar, dejar cada caso al día.
- La llave `api/cases-token.txt` (`CASES_TOKEN`) SOLO sirve para casos — nunca usar ni pedir `ADMIN_TOKEN`.
- Cada caso lleva `modelo` (sonnet = mecánico/decidido; opus = diagnosticar, diseñar, prompt, seguridad, pagos,
  riesgo en producción). Si la sesión abierta no es el modelo recomendado del caso, decírselo a Paco al empezar.
- Cuando Paco diga "anota esto pendiente": crear caso (área: fallos·salma·ux·dev·seguridad·costes·negocio·legal).

## El proyecto en 12 líneas
- Frontend: HTML+CSS+JS vanilla (sin frameworks), 19 JS en la raíz, GitHub Pages en borradodelmapa.com.
  `app.js` es INTOCABLE sin confirmar; `const db` solo en `app.js`. Firebase Auth + Firestore.
- Worker Cloudflare `salma-api` (`worker/salma-worker.js`, ~10.400 líneas, 43 endpoints, 3 crons): chat con
  Claude Sonnet (`claude-sonnet-4-6`), GPT-4o-mini para enrich/bloques/narrador, Google Places (verify, fotos),
  Duffel, Booking (RapidAPI), Brave, ElevenLabs, Twilio (SOS + WhatsApp), Stripe. 15 secrets en Cloudflare.
- KV `SALMA_KB` (193 países en 3 niveles, spots, cachés) + `ROAD_GEOM`; R2 para fotos/documentos.
- Premium por suscripción (pago único que suma meses; límites server-side con `usageGate`). Coins eliminados.
- SEO: 1.793 páginas `destinos/` (`noindex` por ahora), 12 artículos de blog, guías públicas `<slug>.html`.
- Paneles: admin.borradodelmapa.com (repo aparte `Admin-borradodelmapa`), botón 🐛/"Mejora Salma".
- Worker: endpoint `https://salma-api.borradodelmapa-api.workers.dev` (POST `/` = chat SSE; es el que usa la app,
  `window.SALMA_API`). La antigua `salma-api.paco-defoto.workers.dev` sigue respondiendo con una versión VIEJA: no
  sirve para comprobar despliegues. El contenedor de Claude Code en la nube puede no llegar a `*.workers.dev`.

## Índice: "si vas a tocar X, lee `docs/X`"
| Vas a tocar… | Lee |
|---|---|
| Cualquier regla del protocolo (con su historia) | `docs/protocolo-completo.md` |
| Estructura de archivos, stack, orden de carga de scripts, dependencias entre módulos | `docs/proyecto-y-stack.md` |
| Firestore (colecciones, reglas), Auth | `docs/firebase.md` |
| Prompt de Salma (12 bloques), modelos, tools, verify de Google Places | `docs/salma-ia.md` |
| Endpoints del Worker, flujo del chat, eventos SSE | `docs/worker-endpoints.md` |
| Secrets / API keys | `docs/secrets.md` |
| KV, crons del Worker, scripts de generación | `docs/kv.md` |
| CSS, design system, pantallas | `docs/ui-design.md` |
| SEO (guías públicas, blog, destinos, sitemap) | `docs/seo.md` |
| Premium, límites, precios | `docs/negocio-premium.md` |
| "¿Esto ya existe?" — inventario de features | `docs/features-inventario.md` |
| WhatsApp (F5.x, login, tools, límites) | `docs/whatsapp-f5.md` + `docs/pendientes-cabecera-y-casos.md` |
| Pendientes antiguos (crítico/importante/deuda) y sus detalles técnicos | `docs/pendientes-criticos-e-importantes.md` |
| Normas de desarrollo, autonomía, coste (texto completo) | `docs/normas-desarrollo.md` |
| Restaurar frontend/Worker/KV/Firebase; comandos útiles | `docs/restauracion-y-comandos.md` |
| Historial de sesiones, bugs confirmados | `CLAUDE-historial.md` (grande: leer solo el trozo necesario) |
| Comunidad de viajeros, pasarela premium, prompt de Salma (ideas/notas) | `docs/idea-comunidad-viajeros.md`, `docs/pasarela-premium.md`, `docs/salma-prompt.txt` |

## Comandos básicos
```
git status ; git fetch origin main ; git log --oneline HEAD..origin/main
git add <ficheros> ; git commit -m "descripción" ; git push
cd C:\Users\User\Desktop\salma\worker ; npx wrangler deploy -c wrangler.toml
npx wrangler tail salma-api --format pretty        # diagnóstico en vivo
node scripts/casos.cjs hoy                          # rutina de sesión
```
Verificar que todo funciona: abrir borradodelmapa.com → "Hola" a Salma → login → "3 días en Cádiz" → guardar
→ aparece en Mis Viajes. Restauración completa (frontend/Worker/KV/Firebase): `docs/restauracion-y-comandos.md`.

## Hábitos para gastar menos (acordados con Paco, 26 sept 2026)
Una sesión por tema (sesión nueva al cambiar de tema) · Sonnet para lo mecánico, Opus para diagnosticar y
diseñar · menos capturas de pantalla (leer el texto de la página) · leer solo el trozo de archivo necesario
(`CLAUDE-historial.md` y `salma-worker.js` son enormes) · respuestas cortas, sin narrar pruebas.
