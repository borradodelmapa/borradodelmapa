# Pasarela de pago + modelo Premium

> Worktree: `pasarela-pago` · rama `worktree-pasarela-pago`
> Estado: **Fase 0** (diseño) — escrito 7 sept 2026
> Sustituye al sistema de Salma Coins por acceso Premium por periodos.

---

## 1. Modelo de negocio

### Qué cambia

- **Se elimina el sistema de coins.** No más créditos consumibles, no más "reembolsables si no se usan".
- **Premium por periodo, pago único.** Pagas una vez y tienes acceso Premium durante N meses. Para seguir, vuelves a pagar. **No hay renovación automática** (no es una suscripción de Stripe Billing).

### Planes

| Plan | Precio | Acceso | €/mes efectivo |
|---|---|---|---|
| 1 viaje | 4,99 € | 1 mes | 4,99 |
| Trimestral | 8,99 € | 3 meses | 3,00 |
| Semestral | 14,99 € | 6 meses | 2,50 |
| **Anual** (ancla) | **24,99 €** | **12 meses** | **2,08** |

### Mecánica del acceso

- Campo nuevo en `users/{uid}`: **`premium_until`** — timestamp de Firestore.
- **Premium activo** ⇔ `premium_until` existe y `premium_until > ahora`. Se calcula al leer, tanto en frontend como en worker. **No hay cron de expiración.**
- Al confirmarse un pago: `premium_until = max(premium_until_actual, ahora) + meses_del_plan`.
  Así, si renuevas antes de caducar, el tiempo se acumula en vez de perderse.
- El booleano `isPremium` que ya existe queda como *legacy*; la fuente de verdad pasa a ser `premium_until`. Se puede mantener sincronizado (`isPremium = premiumActivo`) por compatibilidad con código viejo, pero nadie nuevo debe leerlo.

---

## 2. Free vs Premium

| Función | Free | Premium | Coste real / nota |
|---|---|---|---|
| Chat con Salma | 20 msg/día | 100/día | 0,01–0,03 €/turno. Hoy el tope de 20 **no está forzado** — hay que añadirlo (Fase 3). |
| Guía IA verificada (Places: coords, fotos, horarios reales) | **1 total** (prueba) | 15/mes (fair use) | 0,40–0,90 €/guía. Era 3 gratis → baja a 1. |
| Guías largas (>7 días) por bloques | — | ✓ | más llamadas LLM |
| Vista itinerario + mapa + turn-by-turn | ✓ | ✓ | barato |
| Guardar en Mis Viajes | ✓ | ✓ | Firestore |
| Publicar guía pública (SEO) | ✓ | ✓ | interesa al negocio, no se gatea |
| Buscar vuelos (Duffel) | 3/día | ilimitado | coste por búsqueda |
| Alertas de precio de vuelo | **1 activa** | ilimitadas | cron diario por alerta = coste recurrente. Era 3 → baja a 1. `FW_FREE_LIMIT`. |
| Buscar hoteles / coches (Booking) | 3/día combinado | ilimitado | coste por búsqueda |
| Buscar lugares / restaurantes | 5/día | ilimitado | Google Places |
| Búsqueda web (Brave) | con tope diario | ✓ | barato |
| Copiloto en viaje (info país por GPS) | vista básica | completo | KV casi todo cacheado |
| Narrador en ruta (POIs por GPS) | — | ✓ Google TTS + voz premium ElevenLabs 10/día | ElevenLabs 0,60–1,10 €/llamada → se gatea |
| Mapa live (GPS, capas POI, brújula) | ✓ | ✓ | barato |
| Diario / Bitácora / postales Kodak | ✓ | ✓ | R2, retiene |
| Galería + álbumes + compartir fotos | ✓ | ✓ | R2 |
| Generar vídeos (documental / historia) | ✓ | ✓ | Canvas en cliente, coste 0 |
| Notas / recordatorios | ✓ | ✓ | Firestore |
| Documentos del viajero + alertas caducidad | ✓ | ✓ | R2 |
| **SOS emergencia** (SMS Twilio) | ✓ **siempre** | ✓ **siempre** | seguridad — nunca se gatea |
| Voz input/output | ✓ | ✓ | Web Speech gratis |

**Lógica:** gratis todo lo que retiene y casi no cuesta + una prueba de lo caro (1 guía, 1 alerta). Premium = lo ilimitado + lo continuo ("te mantiene informado") + lo que más cuesta servir. SOS nunca se toca.

### Fair use Premium (topes generosos, el usuario típico no los roza)

| Recurso | Tope Premium | Ventana | Dónde se cuenta |
|---|---|---|---|
| Guías IA | 15 | mes natural | KV `usage:{uid}:{YYYY-MM}:routes` |
| Chat | 100 | día natural (UTC) | KV `usage:{uid}:{YYYY-MM-DD}:chat` |
| Voz premium ElevenLabs | 10 | día natural (UTC) | KV `usage:{uid}:{YYYY-MM-DD}:tts_premium` |

- Contadores en **KV con TTL** (48 h para los diarios, 40 días para el mensual). Barato, sin coste de Firestore.
- **Si KV falla al leer/escribir el contador, el usuario NO queda bloqueado** (fail-open). El fair use protege el margen del abuso sistemático, no es un candado.

### Free — contadores

Mismo mecanismo KV con TTL diario:

| Recurso | Tope Free | Clave |
|---|---|---|
| Chat | 20/día | `usage:{uid}:{YYYY-MM-DD}:chat` (mismo contador, distinto tope) |
| Buscar vuelos | 3/día | `usage:{uid}:{YYYY-MM-DD}:search_flights` |
| Buscar hoteles + coches | 3/día combinado | `usage:{uid}:{YYYY-MM-DD}:search_stay` |
| Buscar lugares | 5/día | `usage:{uid}:{YYYY-MM-DD}:search_places` |
| Guía IA | 1 **total** (no diario) | `users/{uid}.rutas_gratis_usadas` (ya existe, hoy compara contra 3 → contra 1) |
| Alerta de vuelo | 1 activa | `FW_FREE_LIMIT` (worker, hoy = 3 → = 1) |

---

## 3. Migración de coins existentes → días de Premium

Al **primer login de cada usuario tras el despliegue de la Fase 3**:

| Saldo `coins_saldo` | Se convierte en |
|---|---|
| 1–9 | +30 días de Premium |
| 10–29 | +90 días |
| 30+ | +180 días |
| 0 | nada |

- Se aplica **una sola vez**. Marca de control: `users/{uid}.coins_migrated = true`.
- Tras aplicar: `coins_saldo = 0`, `premium_until = max(premium_until, ahora) + días`.
- Se hace en el **frontend** en el arranque (`app.js`, tras cargar el doc de usuario), porque ahí ya hay token de usuario y es una escritura puntual. Alternativa server-side si se prefiere, pero añade complejidad.
- Copia de seguridad: antes de poner `coins_saldo` a 0, guardar `coins_saldo_pre_migracion` con el valor original, por si hay que revertir.

---

## 4. Arquitectura técnica

### 4.1 Stripe Checkout (página alojada)

- `mode: 'payment'` (pago único, **no** `subscription`).
- Sesión creada server-side en `/create-payment`. Line item con `price_data` inline (no hace falta crear Products/Prices en el panel de Stripe):
  ```
  price_data: {
    currency: 'eur',
    unit_amount: <499 | 899 | 1499 | 2499>,
    product_data: { name: 'Borrado del Mapa Premium — <plan>' }
  }
  quantity: 1
  ```
- `metadata` en la sesión: `{ user_id, plan, months }`.
- `success_url`: `https://borradodelmapa.com/?pago=ok&sid={CHECKOUT_SESSION_ID}`
- `cancel_url`: `https://borradodelmapa.com/?pago=cancel`
- `client_reference_id`: `user_id` (redundante con metadata, útil en el panel).

### 4.2 Endpoint `POST /create-payment` (reescrito)

Entrada: `{ plan: '1viaje'|'trimestral'|'semestral'|'anual' }` + header `Authorization: Bearer <firebase_id_token>`.

1. `verifyAuthAndGetUser(authHeader)` → si null, 401. **(hoy acepta cualquier `user_id` del body — se elimina).**
2. Mapear plan → `{ unit_amount, months }`. Tabla dura en el worker, nunca del cliente.
3. Crear Checkout Session vía `https://api.stripe.com/v1/checkout/sessions` (form-urlencoded, `Authorization: Basic base64(STRIPE_SECRET_KEY + ':')`).
4. Devolver `{ url: session.url }`.

Contrato **cambia**: antes devolvía `{ client_secret }`, ahora `{ url }`. Único consumidor = modal de coins en `app.js` (verificado con grep).

### 4.3 Endpoint `POST /stripe-webhook` (nuevo)

1. Leer body **crudo** (texto) + header `Stripe-Signature`.
2. Verificar firma: parsear `t=` y `v1=` de la cabecera, calcular `HMAC-SHA256(secret = STRIPE_WEBHOOK_SECRET, mensaje = "{t}.{payload}")` con WebCrypto, comparar en tiempo constante con `v1`. Rechazar si `t` tiene más de 5 min (replay).
3. Solo procesar `type === 'checkout.session.completed'` con `data.object.payment_status === 'paid'`.
4. **Idempotencia:** `GET processed_payments/{session.id}` — si existe, responder 200 y salir.
5. Leer `metadata.user_id` y `metadata.months`.
6. Con **service account** (§4.4): leer `users/{uid}.premium_until`, calcular nuevo valor, `PATCH` `users/{uid}` con `premium_until` (+ `isPremium: true`).
7. Escribir `processed_payments/{session.id} = { uid, months, amount, ts }`.
8. Responder `200` siempre que la firma sea válida (aunque el paso 6 falle se registra el fallo aparte; Stripe reintenta si respondemos !=2xx).

### 4.4 Helper service account de Firebase (nuevo)

- Secret `FIREBASE_SERVICE_ACCOUNT` = JSON de service account (Consola Firebase → Configuración → Cuentas de servicio → Generar clave privada), pegado como una línea.
- `getServiceAccountToken(env)`:
  1. Construir JWT: header `{alg:'RS256',typ:'JWT'}`, claim `{ iss: client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat, exp: iat+3600 }`.
  2. Firmar con `crypto.subtle.importKey('pkcs8', <private_key DER>, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['sign'])` + `crypto.subtle.sign`.
  3. `POST https://oauth2.googleapis.com/token` con `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<jwt>`.
  4. Cachear el `access_token` en KV (`_sa_token`, TTL 3300 s ≈ 55 min).
- Con ese token, las escrituras a Firestore REST van con `Authorization: Bearer <access_token>` y saltan las security rules (acceso de administrador). **Solo se usa en el webhook**, nunca en rutas expuestas al usuario.

### 4.5 Frontend — `app.js`

- El modal de coins (`openCoinsModal`) se convierte en **modal "Hazte Premium"**:
  - Estado del usuario: "Premium hasta <fecha>" o "Plan gratuito".
  - 4 tarjetas de plan (1 viaje / trimestral / semestral / anual), anual destacado.
  - Botón → `POST /create-payment` con el `idToken` → `window.location.href = url`.
  - Se **elimina**: `initStripeCard`, la publishable key hardcodeada ([app.js:3012]), el `<div id="stripe-card-*">` del HTML del modal, el acordeón "¿Qué puedes hacer con coins?".
- **Retorno del pago** (al cargar la app, leer `location.search`):
  - `?pago=ok` → pantalla "Verificando tu pago…", sondear `users/{uid}.premium_until` cada 2 s hasta 15 s. Si sube → toast "¡Premium activado!" + refrescar estado. Si a los 15 s no → "Pago recibido, tu Premium se activa en unos minutos. Si no aparece, escríbeme.". Limpiar el query param.
  - `?pago=cancel` → reabrir el modal, sin drama.
- **Gates** (Fase 3): función `premiumActivo()` central. Sustituye toda comprobación de `coins_saldo`. Los sitios: [app.js:2541] (rutas gratis), gate de generación de ruta, gate de copiloto, y donde el chat compruebe el tope diario.

### 4.6 Worker — chat `POST /` y tools (Fase 3/4)

- Añadir `verifyAuthAndGetUser` a `POST /` con **fallback tolerante**: si el token no verifica, se trata como usuario Free anónimo con los topes Free (no se cae el chat). Hoy no hay auth ninguna aquí.
- Antes de ejecutar tools caras (`buscar_vuelos`, `buscar_hotel`, `buscar_coche`, `buscar_lugar`): comprobar contador Free/Premium. Si Free supera el tope → la tool devuelve un mensaje tipo "Has usado tus N búsquedas de hoy. Con Premium son ilimitadas." en vez de ejecutarse.
- Gate de guía IA: Free con `rutas_gratis_usadas >= 1` y sin Premium → mensaje de venta (ya existe la lógica contra 3, se cambia el número y la copy).

### 4.7 Prompt (Fase 4)

- `BLOQUE_ACCION` / bloque de coins ([salma-worker.js:2487-2494]): reescribir "SALMA COINS / RUTAS GRATIS" → "PREMIUM SÍ/NO".
  - Con Premium: no mencionar límites salvo que pida algo fuera de fair use.
  - Sin Premium y sin guía gratis disponible: solo con la frase exacta de guía, decir que necesita Premium.
  - "3 días en X" / "itinerario" / destino+días → **nunca** mencionar Premium ni ventas (igual que hoy con coins).
- **Chequear contradicciones entre bloques** antes de desplegar (norma CLAUDE.md): buscar toda mención de "coins", "Salma Coins", "rutas gratis" en los 12 bloques y las 3 variantes ensambladas.

---

## 5. Fases y verificación

| Fase | Entregable | Deploy | Prueba de Paco |
|---|---|---|---|
| **0** | Este documento | — | leerlo y dar OK |
| **1 · Worker** | `getServiceAccountToken`, `/create-payment`→Checkout, `/stripe-webhook`, idempotencia. **Frontend intacto.** | worker | Pago test con Stripe CLI o link → aparece `premium_until` en Firestore en el doc del usuario |
| **2 · Frontend pago** | Modal "Hazte Premium", redirect, retorno `?pago=ok` con sondeo | front (`?v=` de app.js) | Comprar desde la app en modo test → "Premium hasta …" visible |
| **3 · Gates + fair use** | `premiumActivo()`, contadores KV, migración coins→días, `FW_FREE_LIMIT` 3→1, guía gratis 3→1, auth tolerante en `POST /` | front + worker | Cuenta Free ve los topes; cuenta Premium no; usuario con coins ve sus días convertidos |
| **4 · Prompt** | Bloque coins→premium, sin contradicciones | worker | Salma nunca dice "coins"; ofrece Premium solo cuando toca |

Cada fase: **un deploy, una confirmación de Paco antes de seguir** (protocolo CLAUDE.md §2).

---

## 6. Secrets que pone Paco (no van por el chat)

```powershell
cd C:\Users\User\Desktop\salma\worker
npx wrangler secret put STRIPE_SECRET_KEY -c wrangler.toml      # sk_test_... (luego sk_live_...)
npx wrangler secret put STRIPE_WEBHOOK_SECRET -c wrangler.toml  # whsec_... del webhook en el panel de Stripe
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT -c wrangler.toml  # JSON service account, una línea
```

- El webhook en Stripe apunta a `https://salma-api.paco-defoto.workers.dev/stripe-webhook`, evento **`checkout.session.completed`**.
- Modo **test** hasta que se decida pasar a live (fuera del alcance de este trabajo). El badge "MODO PRUEBA" se mantiene mientras la key sea `sk_test_`.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| `/create-payment` cambia de contrato (`client_secret` → `url`) | Único consumidor es el modal de `app.js`, verificado. Se cambia en la misma fase 2. |
| Service account mal configurado → cobra pero no acredita | El frontend sondea 15 s y luego muestra "se activa en unos minutos". El pago queda en `processed_payments` sin aplicar → se puede reprocesar a mano. Log del fallo aparte. |
| Meter auth en `POST /` rompe el chat | Fallback tolerante: token inválido = usuario Free, el chat sigue. |
| KV de contadores falla | Fail-open: no se bloquea al usuario. |
| Migración coins→días se aplica dos veces | Flag `coins_migrated`. Backup en `coins_saldo_pre_migracion`. |
| Doble acreditación por reintento de webhook | Idempotencia por `session.id` en `processed_payments`. |
| Coste API | Cero extra por la pasarela. Stripe test gratis. |

---

## 8. Ficheros que se tocan

- `worker/salma-worker.js` — `/create-payment` (reescrito), `/stripe-webhook` (nuevo), `getServiceAccountToken` (nuevo), auth en `POST /` (fase 3), gates en tools (fase 3), prompt (fase 4).
- `app.js` — modal Premium, retorno de pago, `premiumActivo()`, gates, migración coins→días.
- `index.html` — `?v=` de `app.js`.
- `styles.css` — **solo** si las tarjetas de plan descuadran; se enseña antes.
- **No se toca:** KV de países, otros endpoints, otros JS, `wrangler.toml` (salvo nada).
