# Modelo de negocio: Premium

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

## Modelo de negocio — Premium por suscripción

> **Corregido 25 sept 2026** — esta sección describía el sistema de Salma Coins, que se
> quitó el 21 sept 2026 (`app.js`: "coins eliminados 21 sept 2026"). Llevaba 4 días
> desactualizada sin que nadie lo notara — se descubrió al mirar el código real para
> conectar WhatsApp a los mismos límites que la app (ver F5.3 punto "guardar ruta" más
> abajo). Lo de abajo es lo que hay REALMENTE en el Worker (`PLAN_LIMITS`, `usageGate()`,
> `PREMIUM_PLANS` en `salma-worker.js`) y en `app.js:renderProfile()`.

- **Plan gratuito**: 1 guía con IA de por vida, 2 ediciones de esa guía, 20 mensajes de chat/día.
- **Premium**: 4 guías/mes, 40 ediciones/mes, 100 mensajes/día. Se activa con `premium_until`
  (fecha futura) en Firestore — el booleano `isPremium` es legacy, se queda en `true` para
  siempre tras la 1ª compra y no sirve para decidir nada.
- **Precios** (pago único que suma meses a `premium_until`, no suscripción recurrente de
  Stripe): 1 viaje (4,99€ / 1 mes), Trimestral (8,99€ / 3 meses), Semestral (14,99€ / 6
  meses), Anual (24,99€ / 12 meses).
- **Validación: SÍ es server-side** — `usageGate(env, authUser, kind)` en el Worker
  comprueba `premium_active` (leído de Firestore, nunca del cliente) ANTES de llamar a
  Claude o Google, para `kind`: `'chat'` (mensajes/día), `'guide'` (crear ruta con mapa),
  `'edit'` (editar una ruta). Si se pasa, corta ahí sin gastar nada y responde con el
  mensaje de límite (dirige a Perfil → Mi plan). Esta misma función es la que a partir del
  25 sept 2026 usa también WhatsApp para decidir si puede guardar una ruta (ver F5.3 más
  abajo) — un único sitio que decide el límite, no dos economías distintas.
- **Stripe**: Checkout funciona (modo test). PENDIENTE: pasar a live.

---


