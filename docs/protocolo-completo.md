# Protocolo de trabajo — texto completo (§1-§10)

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

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
- **Ojo (26 sept 2026):** el menú de abajo vive en TRES sitios, no dos — también en
  `404.html` (`addBottomBar()`, página pública de guías). Tocar los tres a la vez.
- **Y un cuarto (26 sept 2026):** blog (`blog/*.html`) y `legal.html` llevan copia de
  `BOTTOM_NAV` y de la cabecera, con su estilo común en `paginas.css` (va después de
  `styles.css`). Al tocar el menú, tocar también esas 14 páginas; al subir `styles.css`,
  subir su `?v=` también en ellas.

### 10. POLÍTICA DE ACCESO: "MIRAR SÍ, USAR CON CUENTA" — IGUAL EN TODA LA WEB

Decidida con Paco el 26 sept 2026 ("queremos gente que se registre"). Objetivo: registros.
Un muro nada más abrir un enlace pierde a la mayoría; se enseña lo justo para enganchar y se
pide la cuenta en el momento en que el usuario QUIERE algo. Toda pantalla nueva sigue esto:

- **Sin cuenta, se ve:** portada, destinos, blog, la lista de Explorar y el **avance de
  cualquier ruta** — título, foto, mapa y el **día 1 completo** (si la ruta es de un solo
  día: la **primera mitad** de sus paradas — siempre queda algo que desbloquear). Da igual por dónde llegue la
  ruta (Explorar, enlace compartido, guía pública): **misma regla en los tres sitios**.
- **Con cuenta (registro gratis):** la ruta entera, guardarla, preguntarle a Salma, crear
  rutas, chat, notas, WhatsApp, compartir.
- **El corte** es una **tarjeta bloqueada dentro del carrusel de paradas**, justo después de
  la última visible (foto de la siguiente parada difuminada, "DÍA 2 🔒", "Te quedan N días y
  M paradas", botón → registro). Nunca debajo de todo (el carrusel es horizontal: no se ve) y
  nunca una pantalla vacía que solo pide cuenta. En el avance se OCULTAN consejos, info
  práctica y "cerca de" (son de la ruta entera). Al entrar, se reabre la misma ruta entera.
- **Un solo diseño de ruta:** la vista de itinerario de la app. La página pública
  (`404.html` / `<slug>.html`) manda a las personas a la app (`/?ruta=<slug>`) y solo
  queda para WhatsApp/redes/Google. `guide-renderer.js` (vista vieja) está pendiente de
  eliminar — ver pendientes.
- **Enlace para compartir una ruta = su guía pública** (`borradodelmapa.com/<slug>`): tarjeta
  con foto en WhatsApp (páginas fijas de `scripts/build-guias.js`) + el mismo avance.
- Lo que exige cuenta **no se enseña como si funcionara** a quien no la tiene (ej. el botón
  "Crear ruta con mapa" tras un "inicia sesión" — bug real arreglado el 26 sept).
- Cambiar esta política (más o menos abierta) es decisión de Paco — no de una sesión.

---

