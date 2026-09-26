# Normas de desarrollo (texto completo)

> Movido tal cual desde CLAUDE.md el 26 sept 2026 (caso p-mui3grg5ei9, dieta de CLAUDE.md). Texto original sin reescribir.

## Normas de desarrollo

### Autonomía de la sesión (acordado con Paco, 11 sept 2026 — trabaja bastantes días desde el móvil)

- **Bajo riesgo** (documentación, `CLAUDE.md`, housekeeping de git, subir algo que ya se
  ha hablado y probado en la misma conversación) → la sesión puede hacerlo directo, sin
  preguntar paso a paso.
- **Todo lo demás** (código de `app.js`/`salma-worker.js`/cualquier `.js` de la app, el
  prompt, deploys que afecten a producción, cualquier cosa que cambie lo que ve un
  usuario) → sigue el resto de reglas de esta sección tal cual: se pregunta y se confirma
  en cada paso, **salvo** que Paco diga explícitamente "hazlo" para ese caso concreto en
  ese momento — eso no es un permiso permanente, solo vale para esa acción.
- **⚠️ Coste de APIs — esto NO entra en "bajo riesgo" NUNCA, ni siquiera si el cambio es
  mínimo, ni siquiera si es solo tocar código o documentación.** Regla añadida el 15 sept
  2026, a fuego, tras la factura de Google Places de 82€ en 14 días (ver 🔴 Crítico) y
  reforzada el mismo día porque Paco insistió en que aplica **SIEMPRE — sin umbral de
  "esto es tan pequeño que no cuenta", sin excepciones, en cualquier cambio mínimo**:
  **cualquier cambio, por pequeño que sea, en cualquier línea que llame o pueda llegar a
  llamar a una API de pago** (Google Places/Maps, Anthropic, OpenAI, Duffel, RapidAPI,
  Twilio, ElevenLabs, Stripe, Brave, Serper, OpenWeather...) — subirlo o bajarlo, tanto
  da — **se le dice a Paco explícitamente, ANTES o en el momento, no como nota de
  después.** Decirlo significa: qué se toca, por qué puede afectar al coste, y una
  estimación aunque sea a ojo. No hace falta esperar a que él pregunte, y no es decisión
  de la sesión juzgar si "esto es tan poco que no merece mención" — si hay duda, se dice.
  Aplica a arreglos de coste igual que a features nuevas — un fix que promete ahorrar
  dinero SIGUE necesitando decir qué se tocó y por qué, no basta con "ya está arreglado".

- **Nunca** meter `const db` duplicado fuera de `app.js`
- **Nunca** poner API keys en el código — van en Cloudflare secrets
- **Nunca** usar `window.onload` — Firebase se inicializa en el head
- **Nunca** tocar el prompt sin chequear contradicciones entre bloques
- **Nunca** editar código sin OK explícito de Paco
- **Nunca** iterar cambios al prompt/código sin aprobación en cada paso
- **Nunca** ejecutar scripts KV sin explicar qué hacen. Si KV vacío, restaurar desde JSONs locales
- **Nunca** subestimar costes API — calcular tokens reales + reintentos + dar rango
- **Nunca** tocar ni desplegar nada que llame a una API de pago (nueva llamada, cambio de
  frecuencia, de field mask, de caché, de límites...) sin decir el impacto de coste
  esperado — ver regla de arriba, esto es lo mismo dicho dos veces a propósito
- Antes de refactorizar algo que funciona, confirmarlo con Paco
- Los commits van en español, mensajes cortos y claros
- Cuando algo se rompe, revertir a la última versión estable antes de parchear

---


