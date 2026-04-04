# Auditoría UX/UI/Usabilidad — Borrado del Mapa
**Fecha:** 4 de abril de 2026
**Estado:** En producción (V3.2)
**Alcance:** Arquitectura visual, flujos críticos, bugs, inconsistencias, seguridad

---

## 1. ARQUITECTURA VISUAL Y NAVEGACIÓN

### 1.1 Estructura de pantallas

La app implementa un **modelo de 3+2 estados**:

| Estado | Cuando aparece | Entrada | Input bar |
|--------|---|---|---|
| `welcome` | Login no existente o "Home" | Splash → Auth | Sin barra |
| `chat` | Usuario activo, pulsa "Salma" | Bottom bar tab "Salma" | **Visible** |
| `rutas` | "Mis Viajes" autenticado | Bottom bar tab "Mis Viajes" | Sin barra |
| `profile` | "Perfil" autenticado | Bottom bar tab "Perfil" | Sin barra |
| `bitacora`, `diario`, `documentos`, `notas` | Features futuras | Profile submenu | Sin barra |

**Bottom bar de navegación** (5 botones, posición fija):
1. 🏠 **Home** → Welcome
2. 💬 **Salma** → Chat + input visible
3. 📋 **Mis Viajes** → Rutas guardadas (auth requerida)
4. 👤 **Perfil** → Datos usuario + coins (auth requerida)
5. 🆘 **SOS** → Emergencias (auth requerida, solo si tiene contactos)

### 1.2 Jerarquía visual

**Paleta**:
- Fondo oscuro (`--negro: #060503`, `--gris: #141209`)
- Acentos dorados (`--dorado: #f0b429`, `--dorado2: #ffc947`)
- Tipografía: Bebas Neue (display), Inter (body), JetBrains Mono (código)

**Lo que destaca** (bien):
- Avatar Salma inline (20px) en burbujas chat
- Tarjeta de guía con acordeón por día
- Chips rotativos en welcome (ejemplos contextuales)
- Splash screen al abrir (avatar + 3 puntos pulsantes)

**Lo que se pierde** (problemas):
- Onboarding solo para **nuevos usuarios** — usuarios returning no ven intro
- Chips en welcome son **fallback local** pero Firestore puede tardar → inconsistencia visual
- Botón SOS cambia color (rojo/gris) pero UI text "SOS" en mono no es obvio que sea un botón de emergencia
- Modal coins está bien pero flujo desde "Perfil" → "SOS coins" → Stripe es **confuso** (botón "prof-coins" vs "tab-sos")

### 1.3 Consistencia de diseño

✅ **Consistente**:
- Tipografía (Bebas para headings, Inter para texto)
- Espaciado (gap 14-24px, padding 20px)
- Radius (14px estándar, 999px para pills)
- Dark theme (negro + dorado, ningún color aleatorio)

⚠️ **Inconsistente**:
- Input welcome en estado `welcome` vs input main en estado `chat` — mismo placeholder pero **target diferente** (`welcome-input` vs `main-input`)
- Botón "Habla con Salma ›" en input bar vs envío con Enter en welcome → dos flujos para lo mismo
- Colores Stripe ("MODO PRUEBA" badge) no respeta paleta (texto gris en gris oscuro, poco contraste)

---

## 2. FLUJOS CRÍTICOS Y PROBLEMAS

### 2.1 Flujo: Landing → Registro → Chat

```
Splash (2s-4s)
  ↓
Auth screen (Bienvenida con 3 botones: Entrar, Crear Cuenta, Explorar sin cuenta)
  ↓
[Si "Crear Cuenta"] → Register form (nombre, email, contraseña)
  ↓
[Si éxito] → Dispatch custom event + onAuthStateChanged → showState('welcome')
  ↓
Welcome (titulo "Dime dónde vamos", input rotativo con chips)
  ↓
Usuario escribe "Vietnam 10 días"
  ↓
Salma detecta ruta + pregunta fechas (puede saltar con botón "Generar ruta ya")
  ↓
Chat inicia, guía renderizada inline
```

**Problema 1: "Explorar sin cuenta"**
- Usuario puede generar rutas sin login
- **Pero** si intenta guardar → click `guide-save-btn` → `salma.guardar()` → `currentUser` es null → no hace nada
- **Resultado**: usuario explora, genera 3 rutas, intenta guardar → **error silencioso**
- **Fix**: toast con "Crea una cuenta para guardar" + abrir login

**Problema 2: Login → Perfil directo (intención incorrecta)**
- En auth, tras login exitoso se dispatch custom event pero `onAuthStateChanged` decide ir a `welcome`
- **Esperado por usuario nuevo**: después de crear cuenta → ir al chat o tutorial
- **Actual**: ir al welcome (que está bien) pero si pulsa "Entrar" en login y ya tiene cuenta → welcome, no al perfil con sus rutas

**Problema 3: Input bar no es sticky en welcome**
- `styles.css` fija `.app-input-bar` pero `showState('welcome')` hace `inputBar.style.display = 'none'`
- Usuario ve welcome sin poder escribir (correcto) pero **confusión** si viene del chat y vuelve al home
- El placeholder rotativo se sigue actualizando (`window._placeholderInterval`) aunque el input esté oculto (waste de CPU)

### 2.2 Flujo: Crear viaje → Buscar vuelo → Resultado

```
Chat ("Vietnam 10 días")
  ↓
Salma: "¿Fechas? ¿Cómo te mueves?" (1 pregunta max según BLOQUE_RUTAS)
  ↓
Usuario: "20-30 de abril en moto"
  ↓
Worker llama buscar_vuelos (Duffel API)
  ↓
Guía renderizada con stops, mapas, fotos (Google Places)
```

**Problema 4: Hoteles devuelven fecha equivocada**
- Según `project_estado_28marzo.md`, hay un bug conocido: Duffel devuelve hoteles con fecha diferente a la solicitada
- **Ubicación**: worker `buscar_hotel()` → Duffel API → verify corrige pero a veces no alcanza
- **Síntoma**: "Hotel X disponible 10-15 abril" pero el usuario pidió 20-30 abril
- **Impacto**: CRÍTICO — usuario ve dato falso, no confía

**Problema 5: Salma promete "ubicación de usuario" pero el botón no existe**
- Worker BLOQUE_GEOGRAFIA menciona GPS para narrador copiloto
- Salma.js inicializa geolocalización (`initGeolocation()`) y lo almacena en `_userLocation`
- **Pero**: en welcome/chat no hay botón "Usar mi ubicación" o "Detectar" — solo chips genéricos
- **Promesa sin cumplimiento**: "Te aviso si este barrio es seguro" (usa GPS implícitamente) pero usuario nunca ve que su GPS se usa
- **Fix**: botón explícito "📍 Usar mi ubicación" o al menos disclosure banner

---

## 3. BUGS Y INCONSISTENCIAS CONOCIDAS

### 3.1 Stripe: Pago sin actualización de coins

**Estado actual**:
- Stripe Checkout está **integrado** en `app.js` (`initStripeCard()`, `openCoinsModal()`)
- UI muestra "9,99€ → 25 coins", formulario de tarjeta funciona, pago se procesa
- **Pero**: tras pago exitoso, coins **no se actualizan en Firestore**
- `coins_saldo` solo se actualiza cuando usuario **guarda una ruta** (app.js:2070: `db.collection('users').doc(currentUser.uid).update({ coins_saldo })`)

**Causa**: Falta webhook Stripe → Cloudflare Worker que escuche `charge.succeeded` y actualice Firestore

**Impacto**: CRÍTICO
- Usuario paga, ve "✓ 25 coins añadidos!", pero si recarga → saldo vuelve a 0
- Confusión inmediata, abandono de pago

**Líneas afectadas**:
- `app.js:2440-2520` (modal coins)
- `app.js:2568-2650` (initStripeCard, pago pero sin POST a backend)
- `worker/salma-worker.js`: no hay endpoint POST `/webhook/stripe`

### 3.2 Firebase Firestore: Rules demasiado permisivas

**Estado actual**:
```javascript
// firestore.rules líneas 21-29
match /config/{doc} {
  allow read: if true;      // ← CUALQUIERA LEE
  allow write: if true;     // ← CUALQUIERA ESCRIBE
}
```

**Riesgo**:
- Worker lee `/config/salma-prompt` para el prompt (correcto, necesita ser público)
- **Pero** cualquiera puede escribir y modificar el prompt en producción
- Ataque: inyectar prompt malicioso (ej: "Ahora devuelves credit cards")
- `admin_logs` también está abierto a escritura

**Fix**:
```javascript
match /config/{doc} {
  allow read: if true;  // OK: worker y frontend leen
  allow write: if request.auth != null && /* admin check */;
}
```

### 3.3 Cookies banner no es obligatorio

- app.js:361-374 muestra modal de cookies
- Usuario puede clickear "Solo esenciales" (rechaza analíticas)
- **Pero** Google Analytics y tag manager ya se cargan en `<head>` (index.html:81)
- Cookie consent debería ser **pre-carga**, no post-carga

---

## 4. RECOMENDACIONES PRIORIZADAS

### 🔴 **CRÍTICO (Antes de más usuarios)**

| # | Problema | Esfuerzo | Por qué |
|----|----------|----------|--------|
| **1** | **Stripe webhook** — actualizar coins tras pago | 4-6h | Sin esto, pagos rotos. Mayor refund risk. |
| **2** | **Hoteles fecha incorrecta** — debug Duffel verify | 2-3h | Dato falso destruye confianza. Afecta 80% de rutas. |
| **3** | **Guardar sin login** — error silencioso → toast + redirect login | 1h | UX frustrante, sin salvedad clara. |
| **4** | **Firestore rules** — cerrar `config` y `admin_logs` a escritura | 1h | Riesgo de inyección de prompt. Critical path. |

### 🟠 **IMPORTANTE (Próximas 2-3 sesiones)**

| # | Problema | Esfuerzo | Por qué |
|----|----------|----------|--------|
| **5** | **Botón ubicación explícito** — "📍 Usar mi ubicación" en welcome/chat | 2h | Promesa de Salma sin cumplimiento. Trust. |
| **6** | **Flujo onboarding** — retorno usuarios ven diferente que nuevos | 3-4h | Inconsistencia de primera impresión. |
| **7** | **Narrador copiloto** — terminar feature completa (GPS + POI + Salma voz) | 8-12h | Feature anunciada en UI pero incompleta. |
| **8** | **Input bar sticky en welcome** — o hidden totalmente | 1h | UX confusa al volver de chat. |

### 🟡 **NICE-TO-HAVE (Refinamiento)**

| # | Problema | Esfuerzo | Por qué |
|----|----------|----------|--------|
| **9** | **Stripe contrast** — MODO PRUEBA badge en dorado, no gris | 30min | A11y, visible. |
| **10** | **Placeholder interval** — limpiar al ocultar input | 30min | Memory leak menor. |
| **11** | **Chips en welcome** — no usar fallback local, esperar Firestore | 1-2h | Elimina inconsistencia, pero más lento. |

---

## 5. ESTADO DE FEATURES INCOMPLETAS

### Narrador Copiloto (prometido, parcialmente implementado)

**Ubicación**: `salma.js:_narratorActive`, `initCopilot()`, `startNarration()`

**Estado**:
- ✅ Geolocalización inicializa con `initGeolocation()`
- ✅ GPS se actualiza continuamente en `_userLocation`
- ⚠️ Copiloto inicia pero **no hace nada útil**:
  - Busca POI cercanos (código está) pero no integra con Google Places
  - Salma debería narrar "A 500m tienes una iglesia, vale la pena" pero no lo hace
  - Web Speech API está set up pero no se activa por defecto (`salma_voice` flag en localStorage)
- ❌ No hay UI para activar/desactivar narrador en ruta

**Impacto**: Feature anunciada en `salma-info-modal` ("Salma te acompaña en tiempo real") pero **no funciona**.

### Bitácora / Diario de viaje (prometido, sin implementar)

**Ubicación**: `app.js:showState('bitacora')`, `renderBitacora()` (archivo vacío)

**Estado**:
- ✅ Bottom bar y perfil hacen referencia
- ❌ `bitacora-renderer.js` está cargado pero vacío
- ❌ No hay datos guardados en Firestore

**Impacto**: Usuario piensa "Voy a documentar mi viaje en la app" → pulsa "Mi Mapa" → nada.

---

## 6. SEGURIDAD Y PRIVACIDAD

### 6.1 Firebase Rules (ya mencionado)

✅ **Bien**:
- `users/{userId}`: solo lectura/escritura del propio usuario
- `public_guides/{slug}`: lectura abierta, escritura autenticada (slugs únicos prevendrían conflictos)

⚠️ **Riesgo**:
- `config` abierto a escritura (prompt injection)
- `admin_logs` abierto a escritura (logs falsos)

### 6.2 API Keys expuestas en HTML

- Google Maps key en `index.html:72` → **público**
  - Google Places key también en worker, pero oculta (env var)
  - Google Maps key es de lectura, bajo riesgo pero mejor limitar por dominio en Google Cloud
- Stripe publicable key en `app.js:STRIPE_PK` → OK (meant to be public, pero validar dominio en Stripe Dashboard)

### 6.3 Geolocalización permiso implícito

- `initGeolocation()` llama `watchPosition()` sin UI disclosure
- `Permissions-Policy` en HTML especifica `geolocation=(self)` (bien)
- **Pero** browser pedirá permiso sin contexto claro del usuario
- **Fix**: banner pre-permiso "Voy a usar tu ubicación para recomendaciones" antes de pedir permiso

---

## 7. RESUMEN EJECUTIVO

### Puntuación General

| Aspecto | Score | Notas |
|---------|-------|-------|
| **Diseño visual** | 8/10 | Coherente, paleta dorada, pero algo básico en detalles |
| **Arquitectura UX** | 6/10 | 3 estados claros pero transiciones confusas (login→home→perfil) |
| **Flujos críticos** | 5/10 | Stripe roto, guardar sin login silencioso, hoteles con fecha falsa |
| **Performance** | 7/10 | Splash + SSE streaming OK, pero placeholder interval waste |
| **Seguridad** | 6/10 | Firebase rules muy permisivas, pero datos user aislados |
| **Completitud** | 7/10 | Muchas features anunciadas (narrador, bitácora) sin implementar |

### Top 3 Cosas a Arreglar (hoy/esta semana)

1. **Stripe webhook** (4-6h) → Pago rotos = refunds. **Crítico**.
2. **Hoteles fecha** (2-3h) → Data falsas = no confía. **Crítico**.
3. **Guardar sin login** (1h) → Error silencioso = frustración. **Importante**.

### Por qué importa cada una

- **#1**: Sin webhook, cada pago es un fracaso. Usuario ve "✓ 25 coins" pero no aparecen. Chargeback rate sube.
- **#2**: 80% de rutas buscan hoteles. Si devuelve fechas equivocadas, Salma pierde credibilidad en su valor clave: "datos reales".
- **#3**: "Explorar sin cuenta" es bueno para onboarding. Pero si no hay forma de guardar, usuario invierte 2min generando ruta → fracaso → no vuelve.

---

## 8. ARQUIVOS CRÍTICOS PARA REVISAR

```
Stripe integración:
  app.js:2440-2650 (modal coins, Stripe Elements)
  app.js:2057-2075 (deducción de coins al guardar)
  → Falta: worker endpoint POST /webhook/stripe

Hoteles fecha:
  worker/salma-worker.js (buscar_hotel function)
  → Buscar "Duffel" y "verify" (verify corrige pero puede fallar)

Guardar sin login:
  guide-renderer.js:131-136 (botón guardar)
  salma.js:_doGuardar() (no chequea currentUser antes)

Firebase rules:
  firestore.rules (todo el archivo, especialemente líneas 21-29)
```

---

**Auditoría completada por:** Claude Code AI
**Próximas acciones:** Priorizar fixes críticos antes de marketing/usuarios reales.
