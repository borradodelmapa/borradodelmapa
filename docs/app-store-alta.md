# Alta en la App Store de Apple (iOS) — plan (7 nov 2026)

> **Estado: SIN EMPEZAR, aparcado.** Paco no tiene Mac ni iPhone. Decisión: **primero terminar Google Play**
> (12 testers × 14 días → acceso a producción, ver `docs/play-store-alta.md`), luego iOS cuando haya un iPhone
> para probar. Nada de iOS existe aún en el repo. Mientras tanto, los usuarios de iPhone instalan la web como app
> («Compartir → Añadir a pantalla de inicio», ya lo enseña `instalar-app.js`).

## Diferencias con Google Play (lo que más trabajo da)
1. **Hace falta macOS para compilar** (Xcode). Sin Mac: **Codemagic** (Macs en la nube, nivel gratis ~500 min/mes,
   10–20 min por compilación) compila, firma y sube a TestFlight. Certificados con la clave API de App Store Connect.
2. **Regla 4.2 «funcionalidad mínima»:** Apple rechaza webs metidas en una caja. En iOS no hay TWA: es un WKWebView y
   tiene que aportar algo nativo (GPS, SOS, fotos, notificaciones con permisos nativos de iOS).
3. **Pagos (regla 3.1.1):** los planes dentro de la app van OBLIGATORIAMENTE por compras de Apple (StoreKit). Repetir lo
   de Play: `_applePay` en `app.js`, `/apple-verify` en el Worker (App Store Server API), productos en App Store Connect
   (`guia`, `trimestral`, `anual`, `anual_oferta`), ocultar Stripe en iOS. Comisión **15 %** con el Small Business
   Program (<1 M$/año; apuntarse), si no 30 %.
4. **Entrar con Apple (regla 4.8):** si se ofrece «Entrar con Google» hay que ofrecer también «Iniciar sesión con Apple»
   (Firebase Auth lo soporta).
5. **Contenido de usuarios e IA (regla 1.2):** denunciar y bloquear. Falta «Denunciar ruta» en Explorar (mismo hueco
   que en Play, aquí casi seguro que lo piden).
6. Enlaces web → app: `.well-known/apple-app-site-association` (equivalente a `assetlinks.json`).
7. Privacidad: etiqueta de datos en App Store Connect (reusar la tabla de `play-store-alta.md`); GA4 dentro de la app:
   apagar o pedir permiso de rastreo (ATT).
8. No hay regla de 12 testers × 14 días. TestFlight: hasta 100 testers internos sin revisión. Revisión de Apple 1–3 días,
   más estricta que Google (normal algún rechazo).

## Herramienta recomendada: Capacitor (+ Codemagic)
PWABuilder iOS es más rápido pero solo envuelve la web (riesgo 4.2; pagos y login con Apple a mano). **Capacitor** trae
plugins para compras de Apple, login con Apple, GPS, notificaciones y fotos, y además serviría para rehacer Android con
`ACCESS_MEDIA_LOCATION` (GPS de las fotos, `docs/estudio-video-album.md`). Como casi todo es la web, la mayoría de
cambios no necesitan recompilar: solo lo nativo.

## Pruebas sin iPhone (el hueco)
1. Amigo/familiar con iPhone como tester de TestFlight (gratis, lo más real).
2. iPhone en la nube (BrowserStack/Appetize, desde ~30 $/mes): ver la app; no prueba bien GPS, fotos ni pagos.
3. iPhone de segunda mano (SE/11, ~150–200 €): lo cómodo si se mantiene la app.

## Pasos (cuando se arranque)
1. Apple Developer Program: **99 $/año** (particular: tu nombre como vendedor; empresa: número D-U-N-S).
2. App Store Connect (desde el navegador): app `com.borradodelmapa.app`, nombre, SKU.
3. Proyecto Capacitor + Codemagic → TestFlight.
4. Nativo: login con Apple, compras de Apple + `/apple-verify`, permisos (ubicación, fotos, notificaciones), «Denunciar ruta».
5. Ficha: capturas iPhone 6,9" (1320×2868), icono 1024 sin transparencia, privacidad, soporte, edad.
6. Probar en iPhone real (§2) → enviar a revisión.

## Coste (§8)
99 $/año · 15 % por venta dentro de la app · Codemagic gratis (probablemente basta) · iPhone para pruebas opcional.
Ninguna API de pago nueva por llamada.
