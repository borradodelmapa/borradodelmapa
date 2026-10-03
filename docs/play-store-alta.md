# Alta en Google Play — respuestas preparadas (2 oct 2026)

Estado: cuenta de desarrollador verificada; app **Borrado del Mapa** creada en Play Console
(`com.borradodelmapa.app`, es-ES, aplicación, gratis). `assetlinks.json` publicado (huella de la clave local).
Pendiente: tareas de «Configura tu aplicación», `.aab` con PWABuilder, prueba cerrada (12 testers × 14 días),
y copiar la huella de **firma de Play** a `.well-known/assetlinks.json` (añadir, no sustituir).

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
