# Alta en Google Play — estado y respuestas (actualizado 10 oct 2026)

> **Léeme primero (cualquier chat que hable de Google Play).** Esta sección es el estado real a 10 oct 2026.
> Lo de más abajo («Tareas», «Seguridad de los datos», «Ficha») es del 2 oct: la ficha definitiva (nombre
> «Borrado del Mapa App de viajes», descripción y 8 capturas) está ya puesta en Play Console, en BORRADOR, y
> **NO se envía a revisión hasta tener testers** (prueba cerrada: 12 testers × 14 días). Caso vivo: **p-mv1gkhyzcfu**.
> Paco está harto de repetir pasos: **antes de pedirle algo, comprobar aquí si ya está hecho**, una cosa cada vez.

## Estado a 10 oct 2026
- **Cuenta de desarrollador:** personal, ID `8296224504840426202`. App `com.borradodelmapa.app`, ID de app en la
  consola `4972765825170829272` (estado: Borrador, Prueba interna). Enlaces directos:
  `https://play.google.com/console/u/0/developers/8296224504840426202/app/4972765825170829272/one-time-products`
  (productos) · `…/developers/8296224504840426202/users-and-permissions` · `…/app-list`.
- **Paquete:** `.aab` generado con **PWABuilder** (Google Play billing ON, Location delegation ON), versión 2 (1.0.1.0)
  subido a **Prueba interna** el 10 oct. Es una TWA: la web envuelta (`window.BDM_TWA` en `index.html`).
- **Firma:** Play App Signing. La **clave de subida** es `play-upload.jks` (alias `upload`, una sola contraseña para
  almacén y clave) del 1 oct 2026. Está en el portátil de Paco: `Escritorio\LLAVES PLAY borradodelmapa\` (con
  `play-keystore.txt`, que lleva la contraseña) y copia en `Escritorio\salma\api\` (carpeta ignorada por Git).
  Huella SHA-256 `2F:05:50:3C:C1:5E:D2:31:B3:A2:B0:80:F1:ED:96:08:51:17:11:70:CA:2E:ED:85:BD:E7:F0:7E:CC:41:F3:21`
  (la misma que hay en `.well-known/assetlinks.json`). **NUNCA** subir claves ni contraseñas al repo ni pegarlas en chats.
  Existe OTRA clave, `signing.keystore` (huella `78:AF:A2:D6…`, de los zips de PWABuilder del 8 y 10 oct): **NO sirve**
  para subir; Google rechaza con «firmado con la clave incorrecta».
- **Cómo repetir el paquete en PWABuilder (el formulario SE REINICIA cada vez; revisar TODO antes de descargar):**
  Package ID `com.borradodelmapa.app` (vuelve a `.twa`), Version code mayor que el último subido (ahora 2 → usar 3),
  Google Play billing marcado, Location delegation marcado, Signing key = «Use mine» con `play-upload.jks`, alias
  `upload`. El manifest ya no lleva iconos `.webp` (rompía el generador; arreglado el 9 oct).
- **Perfil de pagos de Google:** creado (Particular, FRANCISCO GOMEZ DUARTE, ID 7480-9639-4825). IBAN de Unicaja
  añadido; **pendiente** confirmar el ingreso de <0,25 € que Google hace (hasta 3 días hábiles) en Perfil de pagos →
  Cómo recibes los pagos. Pendiente decidir apuntarse a la **cuota de servicio del 15 %** (Gestionar grupo de cuentas).
- **Cuenta de servicio del Worker:** `firebase-adminsdk-fbsvc@borradodelmapa-85257.iam.gserviceaccount.com` invitada
  en Play Console con SOLO «ver información financiera» + «gestionar pedidos», limitada a la app (no dar permisos
  totales). API Android Publisher habilitada en el proyecto de Google Cloud `borradodelmapa-85257`.
- **Probadores de licencia:** lista «BORRADO DEL MAPA» con `paco.defoto@gmail.com` (Ajustes → Licencia para testing).
- **Productos únicos (Monetizar con Play → Productos → Productos únicos): ❌ SIN CREAR.** Google devuelve «Se ha
  producido un error inesperado (7E2D78D2)» al guardar (también en incógnito), probablemente retraso tras crear el
  perfil de pagos. Reintentar; si persiste, escribir a soporte de Play con el código. Hay que crear 4 (ID exacto,
  no se puede cambiar ni reutilizar): `guia` 9,99 € · `trimestral` 19,99 € · `anual` 49,99 € · `anual_oferta` 39,99 €
  (opción de compra `<id>-compra`, tipo «Comprar», activar). Google añade el 21 % de IVA en España y lo gestiona.
- **Código (todo ya hecho y APAGADO):** `/play-verify` en el Worker, `_playPay` en `app.js`, el modal enseña
  «Google Play» en vez de Stripe. Para encender: `PLAY_BILLING_ON='1'` en `worker/wrangler.toml` [vars] y redesplegar
  el Worker. Después, compra de prueba en 2-3 móviles (§8: es cobro real de Google, decirlo a Paco).
- **Stripe (web):** pasado a **REAL el 9 oct 2026** (cuenta verificada, webhook `Salma Premium`, secrets reales en el
  Worker, versión `8e364f2b`, compra de 9,99 € probada con 200 en el webhook). En la app de Play el pago va por Play
  Billing; Stripe no se usa dentro de la app. Caso de legal/IVA/reembolsos: **p-mv1f3nh3bb2**.
- **Orden de lo que falta:** (1) verificar el ingreso de Google en el banco; (2) crear los 4 productos; (3) encender
  `PLAY_BILLING_ON`; (4) probar compra con licencia de prueba; (5) reunir los 12 testers para la prueba cerrada;
  (6) añadir al `assetlinks.json` la huella de **firma de Play** si la app abre con barra de navegador (añadir, no
  sustituir); (7) enviar a revisión. WhatsApp: probar el enlace con una cuenta nueva antes de anunciarlo.

## Tareas de «Configura tu aplicación»
- **Política de privacidad:** `https://borradodelmapa.com/legal.html#privacidad`
- **Acceso a la aplicación:** hay partes restringidas (chat, crear rutas). Crear una cuenta de prueba (Google o
  email) y darle a Google usuario + contraseña / instrucciones. Si solo hay login con Google, explicarlo en las instrucciones.
- **Anuncios:** No.
- **Público objetivo:** 18+.
- **Clasificación de contenido:** categoría Utilidad / Referencia. Declarar contenido generado por usuarios (rutas
  públicas en Explorar) y por IA (Salma). Sin violencia, sexo ni juego.
- **Categoría:** Viajes y guías. Contacto: salma@borradodelmapa.com · web borradodelmapa.com
- **Eliminación de cuenta (Seguridad de los datos):** en la app Perfil → Cuenta → Borrar mi cuenta. URL web:
  `https://borradodelmapa.com/legal.html#privacidad` (sección «Borrar tu cuenta»).
- **App de IA generativa:** sí. Mecanismo para denunciar: 👍/👎 bajo cada respuesta y botón «Mejora Salma»/Ayuda.

## Seguridad de los datos (de `legal.html`)
Datos cifrados en tránsito: sí (HTTPS). El usuario puede pedir borrarlos: sí.
| Tipo | ¿Se recoge? | ¿Se comparte? | Para qué |
|---|---|---|---|
| Email / nombre / teléfono (WhatsApp) | Sí | Firebase (procesador) | Cuenta |
| Ubicación aproximada y precisa | Sí, opcional | No (solo a Google Maps/Places para buscar) | Cerca de ti |
| Fotos y vídeos | Sí, opcional | No | Viaje: álbum y vídeo |
| Mensajes (chat con Salma) | Sí | Anthropic/OpenAI como procesadores | Funcionalidad |
| Contactos de emergencia (SOS) | Sí, opcional | Twilio (procesador) | SOS |
| Info de pago | No la guardamos (Stripe en la web) | — | — |
| Identificadores de dispositivo / analítica | GA4 solo si acepta cookies | No | Analítica |
Sin venta de datos ni publicidad.

## Huecos detectados en `legal.html` (decidir con Paco antes de tocar)
1. No dice que la app Android pide acceso a la **ubicación de las fotos** (`ACCESS_MEDIA_LOCATION`) ni para qué (vídeo/álbum).
   Google lo mira. Conviene una línea en «Al usar la plataforma».
2. Denunciar rutas de otros en Explorar: no hay botón «Denunciar». Hay 👍/👎 en rutas (debug-panel.js). Play puede
   exigir denuncia/bloqueo de contenido de usuarios; si la revisión lo pide, añadir «Denunciar ruta» en Explorar.
3. Un correo de contacto de privacidad ya existe (salma@…): OK.

## Ficha de la tienda (borrador, es-ES)
**Título (≤30):** Borrado del Mapa
**Descripción breve (≤80):** Salma, tu compañera de viaje con IA: diseña rutas, te guía y resuelve imprevistos.
**Descripción completa:**
Salma es una compañera de viaje con inteligencia artificial. Dile adónde vas y cuántos días tienes y te diseña una
ruta con mapa, paradas verificadas con Google y consejos prácticos. Ya en ruta, te guía, te responde dudas y te ayuda
con los imprevistos.

• Rutas con mapa, día a día, listas para guardar y compartir
• Salma te contesta en el viaje: qué ver, dónde comer, cómo llegar, qué hacer si algo sale mal
• Explorar: rutas de otros viajeros que puedes guardar
• Álbum de fotos y vídeo de tu viaje con tu recorrido
• Botón SOS que avisa a tus contactos
• Salma también por WhatsApp, con la misma cuenta
Cuenta gratuita. La información de Salma es orientativa: compruébala antes de viajar.

## Imágenes que pedirá Play
Icono 512 (`play-icono-512.png`, logo nuevo «pin borrado» del 3 oct 2026) · gráfico de funciones 1024×500 (`play-grafico-1024x500.png`, 3 oct 2026) · ≥2 capturas de móvil (faltan;
hacerlas desde la app real) · capturas de tablet opcionales.
