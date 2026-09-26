---
name: casos
description: Rutina completa para trabajar con los CASOS de Mejora Salma (scripts/casos.cjs) — empezar sesión con `hoy`, coger, diagnosticar, proponer, subir, cerrar. Usar al empezar una sesión o al trabajar un caso concreto.
---

# Casos — lista viva de pendientes (desde el 26 sept 2026)

Panel admin → Feedback → Mejora Salma → Casos. Fallos de usuarios, errores 🤖 automáticos y todos los pendientes
antiguos (tipo "tarea"/"idea", origen "pendiente"). **Lo nuevo se apunta como caso**: `node scripts/casos.cjs crear <fichero.json>`
(`{titulo, tipo, zona, area, gravedad, ejemplo, nota, estado, decision}`). La llave `api/cases-token.txt`
(`CASES_TOKEN`) SOLO sirve para casos — nunca usar ni pedir `ADMIN_TOKEN`. `node scripts/casos.cjs` sin args = ayuda.

**Rutina de cada sesión**
1. AL EMPEZAR: `node scripts/casos.cjs hoy` (y leer los comentarios de Paco) → decirle qué hay y por dónde seguir.
   "Te toca a ti" = propuestas + decisiones + tareas subidas por probar.
2. Trabajar un caso: `lista` → `ver <id>` → `coger <id>` (candado §1 + en_marcha).
3. Diagnosticar y preparar el arreglo en la copia (worktree + localhost:8090) → `diagnostico <id> <json>`
   (`{causa, archivos, riesgo, coste, propuesta, prueba, rama}`) + `estado <id> propuesta` (suelta el candado) →
   enseñárselo a Paco en el chat.
4. Con su OK, subir con el protocolo (skill `desplegar`) → `estado <id> comprobando` (lo cierra Paco al
   probarlo en Hoy → Probar; si vuelve a fallar se reabre; un fallo sin avisos en 14 días se cierra solo "sin probar").
5. AL SUBIR A PRODUCCIÓN: `version "qué se subió" <ids>` (registro en la colección `deploys`).
6. AL TERMINAR: cada caso al día (`estado` / `comentar <id> "texto"`, `soltar <id>`).

**Modelo recomendado ("Hacer con"):** cada caso lleva `modelo` sonnet|opus (`casos.cjs modelo <id> <m> "por qué"`).
Sonnet = mecánico o ya decidido; Opus = diagnosticar causa desconocida, diseñar, prompt de Salma, seguridad,
pagos, riesgo de romper producción. Ponerlo SIEMPRE al crear o diagnosticar. Si Paco abre la sesión con el modelo
"caro" para un caso Sonnet (o al revés en uno delicado), decírselo al empezar.

**Otros:** `area <id> <área>` (fallos·salma·ux·dev·seguridad·costes·negocio·legal) · `decision <id> "pregunta"`
(decisión de Paco; `""` la quita) · `nota <id> "texto"` · Paco pide un caso con el botón "🤖 Pedir a Claude"
(copia "Mira el caso <id>: …").
