# Idea: Comunidad de viajeros — SOLO ESTUDIO, sin desarrollar

Conversación de Paco con Claude Code, 25-26 sept 2026. **Son ideas, no hay nada que
desarrollar todavía.** Paco: "seguiremos hablando de esto".

## Objetivos (Paco)

1. Conseguir más usuarios Premium.
2. Que sea útil de verdad para viajeros.

## Lo que Paco ha decidido / aclarado

- **No vende viajes.** Cada uno reserva y paga lo suyo. **Seguridad ante todo.**
- **No es "viajar juntos".** Paco, tal cual: "no quiero viajar con gente en mi caso pero sí
  tener contactos y compartir experiencias. Puedo compartir parte del viaje pero no es mi
  intención ir cogidos de la mano".
- **Afinidad más que intereses** (aunque también intereses). "Comparten pero no es por
  necesidad… el tipo de gente que usa estas herramientas es porque necesita algo, en
  cuanto lo tienen pasan". → **Intereses comunes, obligación cero.**
- **Arranque con sus propios viajes** (posibles, sin fecha): kitesurf, Tailandia Muay
  Thai, turismo por Filipinas.
- **Moderación: Salma desde el principio**, Paco "pendiente pero no dependiente".
- **Canal: WhatsApp**, coordinación y creación: Borrado del Mapa. Integrado en la web
  como recurso potente.
- **Las dudas son ANTES de empezar el viaje** (Paco, 26 sept): "una vez andando o de
  viaje todo es más fácil". Ser útil desde el principio (en la planificación) es la
  ventaja importante.
- **Los viajeros de verdad no necesitan la herramienta, pero como humanos nos gusta
  sentirnos miembros y útiles.** Hay que contemplar esos matices.

## Diseño propuesto (hablado, no aprobado para desarrollar)

**Límite técnico que manda:** Salma NO puede estar dentro de grupos de WhatsApp (la API
oficial no lo permite; herramientas no oficiales = riesgo de baneo del número). Todo lo
automático va por el chat 1:1 con Salma + la web. Los grupos (Comunidades de WhatsApp,
ocultan teléfonos) los crea Paco a mano, pocos.

**Reparto:** WhatsApp = el momento (preguntar, avisar, quedar). Web = la memoria (lo
compartido queda por destino/tema aunque la gente se vaya). Salma = une las dos.

**Grupos por interés + destino** (Kitesurf, Muay Thai Tailandia, Filipinas), no 193
países a la vez — un grupo vacío es peor que ninguno. Se abren donde haya masa.

**Dos tipos de usuario (matiz del 26 sept):**
- *El que planifica* — tiene las dudas, las tiene ANTES de salir. Es quien necesita y
  quien paga Premium. Momento clave: cuando pide/guarda una ruta, Salma le ofrece
  preguntar a viajeros que ya han estado.
- *El veterano* — no necesita nada, participa por pertenencia y por sentirse útil.
  Recompensa = reconocimiento, no dinero: su consejo publicado con su alias en la página
  del destino, "has ayudado a N viajeros", solo se le pregunta sobre lo que conoce, sin
  obligación. Posible: Premium gratis para veteranos activos.

**Las 4 piezas:**
1. **La puerta** — botón "Únete" en web/página de destino o pedírselo a Salma → 2-3
   preguntas + aceptar normas → resumen a Paco, aprueba con un toque → Salma manda el
   enlace. Más adelante, aprobación automática con reglas.
2. **La memoria** — cualquiera reenvía a Salma un mensaje útil del grupo → Salma resume,
   anonimiza, clasifica por destino/tema → aprobado, sale en la página del destino
   ("Lo que cuentan los viajeros"). Bueno para SEO.
3. **Presencias** — "estoy en Siargao hasta el jueves" o ubicación compartida → solo zona,
   nunca exacta, caduca sola.
4. **Coincidencias (Premium)** — cron diario cruza presencias + rutas guardadas con fechas
   + perfil de afinidad (ya se extrae con `/perfil-ia-extract`) → "2 viajeros con tu estilo
   en Filipinas esas fechas" → contacto solo si los DOS dicen sí.

**Obligación cero:** sin presentarse, sin mensajes de "¿seguís ahí?", entrar/salir con un
toque, mirar sin escribir es lo normal.

**Seguridad:** nunca ubicación exacta; normas cortas que se aceptan al entrar (primer
encuentro en sitio público, sin ventas/spam, expulsión directa); pagar Premium como filtro;
texto de responsabilidad en `legal.html`.

**Fases:** 0 = 2-3 grupos a mano + enlaces en la web + Salma de puerta (casi sin código).
1 = reenviar a Salma + sección en páginas de destino. 2 = presencias + coincidencias
(Premium). 3 = avisos proactivos cuando haya número propio.

**Bloqueos:** número propio de WhatsApp (alta autónomo/SL — sin él Salma no escribe
primero), Stripe en live, normas en `legal.html`.

**Coste (a ojo, §8):** puerta ≈ 3-4 mensajes de chat por persona (céntimos); resumir un
reenvío con modelo barato < 0,001 €; coincidencias sin IA (lecturas Firestore); avisos
WhatsApp de pago desde 1 oct 2026 (Twilio), proactivos con plantilla más caros → atarlos
a Premium.
