# Pendientes: cabecera original (nota de Casos) y WhatsApp F5 estado

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

## Pendiente / Problemas conocidos

> **🗂️ DESDE EL 26 SEPT 2026 LA LISTA VIVA DE PENDIENTES ES "CASOS"** (panel admin → Feedback → Mejora Salma
> → Casos). Ahí están los fallos de usuarios, los errores 🤖 automáticos y TODOS los pendientes de abajo
> pasados a casos (tipo "tarea"/"idea", origen "pendiente"). **Lo nuevo se apunta como caso, no aquí**:
> `node scripts/casos.cjs crear <fichero.json>`. Lo de abajo queda como detalle técnico de referencia.
> Cómo trabajar un caso (Paso A): `node scripts/casos.cjs lista` → `ver <id>` → diagnosticar y preparar el
> arreglo en la copia (worktree + localhost:8090) → `diagnostico <id> <json>` (causa, archivos, riesgo,
> coste, propuesta, prueba, rama) + `estado <id> propuesta` → enseñárselo a Paco en el chat → con su OK
> subir con el protocolo → `estado <id> comprobando` (los fallos pasan solos a arreglado a las 48 h sin
> avisos nuevos; si vuelven se reabren y avisan; las tareas las cierra Paco). Paco pide un caso con el
> botón "🤖 Pedir a Claude" (copia "Mira el caso <id>: …"). La llave `api/cases-token.txt` (secreto
> `CASES_TOKEN`) SOLO sirve para casos — nunca usar ni pedir `ADMIN_TOKEN` para esto.
>
> **PANTALLA "HOY" (26 sept 2026) — inicio del panel admin, para TODO el proyecto.** Cada caso tiene **área**
> (fallos · salma · ux · dev · seguridad · costes · negocio · legal), puede ser una **decisión** de Paco (campo
> `decision` = la pregunta), tiene **hilo de comentarios** (Paco escribe en el panel; Claude con `comentar`) y
> **candado de sesión** (`coger`/`soltar`, §1). "Te toca a ti" = propuestas + decisiones + tareas subidas por probar.
> **Rutina de cada sesión:** AL EMPEZAR `node scripts/casos.cjs hoy` (y leer los comentarios de Paco) → decir a
> Paco qué hay y por dónde seguir · al trabajar un caso `coger` · AL SUBIR A PRODUCCIÓN `version "qué se subió"
> <ids>` (registro de subidas, colección `deploys`) · AL TERMINAR dejar cada caso al día (`estado`/`comentar`).
> Lo nuevo del proyecto (idea, tarea, riesgo, decisión) → caso con su área (`crear`), nunca una lista aquí.
> **Modelo recomendado ("Hacer con", 26 sept 2026):** cada caso lleva `modelo` sonnet|opus (`casos.cjs modelo
> <id> <m> "por qué"`), visible en el panel y en lo que copia "Pedir a Claude". Sonnet = mecánico o ya decidido;
> Opus = diagnosticar causa desconocida, diseñar, prompt de Salma, seguridad, pagos, riesgo de romper producción.
> Ponerlo SIEMPRE al crear o diagnosticar un caso. Si Paco abre una sesión con el modelo "caro" para un caso
> marcado Sonnet (o al revés en uno delicado), decírselo al empezar.

> **Este es el único archivo de pendientes del proyecto — no crear otro.** Recortado el
> 25 sept 2026 (a petición de Paco: "RECORTA CLAUDE.MD") — el historial de sesiones,
> bugs ya confirmados en pantalla y las investigaciones puntuales viven ahora en
> **`CLAUDE-historial.md`**. Aquí solo queda lo que sigue abierto de verdad.
>
> **Cuando Paco diga "anota esto pendiente" (o algo parecido):** añadirlo aquí mismo, en
> el subapartado que corresponda (🔴 Crítico / 🟡 Importante / 🔧 Deuda técnica), hacer
> `commit` y `push` **directo a `main`** antes de terminar el turno. Cuando algo se cierre
> (confirmado en pantalla por Paco), muévelo a `CLAUDE-historial.md` en el mismo commit
> — no lo dejes acumulándose aquí sin cerrar, es justo lo que hizo crecer este archivo
> hasta 4800 líneas la primera vez.


