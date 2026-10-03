# Modelo de negocio: planes y precios

> **Plan vigente desde el 3 oct 2026** (decisión de Paco, caso p-murj9qyu6ct). Sustituye por completo al anterior
> (1 viaje 4,99 € / trimestral 8,99 € / semestral 14,99 € / anual 24,99 €; 4 guías/mes), que ya no existe en el código.
> Fuente de verdad: `worker/salma-worker.js` → `PLAN_LIMITS`, `PREMIUM_PLANS`, `usageGate`, `usageRecord`, `ensureTrial`.

## Los planes

| Plan | Precio (pago único) | Qué incluye |
|---|---|---|
| **Gratis** (para siempre) | 0 € | 5 mensajes al día con Salma + **1 guía** de por vida (hasta 35 paradas) + 2 cambios en ella + todo lo que no usa IA (destinos, blog, Explorar…). |
| **Guía suelta** | **9,99 €** | 1 guía con mapa de hasta 50 paradas + chat 30 días (20 mensajes/día). |
| **Trimestral** | **19,99 €** (3 meses) | Premium sin límites a la vista. |
| **Anual** | **49,99 €** (12 meses) | Premium sin límites a la vista. **Oferta de salida: 39,99 €** (`anual_oferta`, se enseña UNA vez al cerrar el modal sin comprar). |

Premium (trimestral/anual) solo tiene un **techo antiabuso**: 100 mensajes/día, 3 guías/día, 50 paradas por guía, 300 cambios/mes.

## Presupuesto de gasto por cuenta (invisible, `ACCOUNT_BUDGET_ON`)
Coste de Claude (precio de lista) al mes por cuenta: gratis 1 € · guía suelta 4 € · trimestral 8 € · anual 20 € (oferta 16 €).
Al agotarlo, aviso amable y se enseña Perfil → Mi plan.

> **No hay prueba de 7 días.** Se implementó el 3 oct 2026 y Paco la quitó el mismo día («no cabe en el nuevo plan»): la sustituye
> **1 guía gratis por cuenta**, sin reloj. No queda código de la prueba (solo un parche en `planOf` para los pocos usuarios que la
> recibieron esos minutos: su plan `prueba` en KV vale como guía suelta hasta que caduque).

## Cómo funciona por dentro
- **Plan del usuario = `planOf(authUser)`**: `free` si no hay `premium_until` futuro; si no, la clave guardada en **KV `uplan:<uid>`**
  (`guia`, `trimestral`, `anual`, `anual_oferta`). Premium antiguo sin dato → se trata como `trimestral`.
  **El plan NO se lee de Firestore**: el cliente puede escribir casi todo su documento (solo `premium_until`, `isPremium`,
  `coins_saldo`, `rutas_gratis_usadas` y `premium_bonus_guides` están protegidos en `firestore.rules`).
- **Guía suelta**: el webhook de Stripe suma +1 a `premium_bonus_guides` y deja `uplan` = `guia`. Comprarla NO rebaja un plan más alto activo (`PLAN_TIER`).
- **Guía de `guia`**: cupo mensual 0; la guía sale de `premium_bonus_guides` (la descuenta `usageRecord`). La guía gratis del plan free cuenta en el total de por vida (1).
- **Tope de paradas** (`maxStops`: 35 gratis, 50 el resto): `verifyAllStops` recorta ANTES de verificar (no se paga a Google lo que sobra).
- **Validación server-side**: `usageGate(env, authUser, kind)` (`chat`/`guide`/`edit`) corta antes de llamar a Claude o Google. Mismo gate en la web y en WhatsApp.
- **Stripe**: Checkout con `price_data` en línea (no hay productos que crear en Stripe). Webhook `checkout.session.completed` suma meses a `premium_until`.
  **Pendiente: pasar a modo real (live)** — lo hace Paco: `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` live como secrets del Worker.
- **GET /usage**: devuelve `plan`, `is_premium`, límites públicos, `plans` (gratis/premium lado a lado), `prices`. El modal (`premium-modal.js`) pinta de ahí.
  El presupuesto de gasto (`budgetEur`) NO sale en `/usage`.
- Textos con el plan: `premium-modal.js`, `legal.html` (Planes), `salma.js` (nota de login), `index.html` (nota de registro).

## Interruptores (`wrangler.toml`)
`ACCOUNT_BUDGET_ON` · `AI_CAP_ON` (tope global de gasto de Claude/OpenAI) · `OPEN_GATE_ON` (tope por IP). Todos en "1"; revertir = "0" y redesplegar.
