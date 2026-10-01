# Propuesta: logs del Worker guardados unos días, leíbles desde la nube

**Estado: PENDIENTE — esperando sí/no de Paco** (cuando se haga o se descarte, cambiar esta línea).
Propuesta del 1 oct 2026 (sesión "Conectar casos desde la nube y hacer el parte").

## Para qué
Paco atiende desde el móvil (sesiones en la nube, sin llave de Cloudflare). Con un fallo técnico de un usuario
("se colgó", "no salió el mapa", "error") hoy no hay forma de ver qué pasó: `wrangler tail` solo enseña lo que
pasa mientras se mira. Con logs guardados se mira después y se va directo al sitio. Para "Salma contestó mal"
no hacen falta: la conversación ya viene en el caso.

## Qué hay que hacer (2 pasos)
1. **Encender Workers Logs** en `worker/wrangler.toml` y desplegar (protocolo §4):
   ```toml
   [observability]
   enabled = true
   ```
   Hoy no está (comprobado el 1 oct: `wrangler.toml` no tiene `[observability]`). El Worker ya escribe ~170
   `console.log/error/warn`, que es lo que quedaría guardado.
2. **Llave de Cloudflare SOLO de lectura de logs** (permiso de cuenta "Workers Observability: Read", nada más:
   no puede desplegar, borrar ni tocar secrets) como variable de entorno de la nube (`CF_LOGS_TOKEN`), y
   `api.cloudflare.com` en los dominios permitidos del entorno. La crea Paco en dash.cloudflare.com → My Profile
   → API Tokens. Nunca pegarla en un chat.
3. (Después) un comando `node scripts/casos.cjs logs <caso|texto> [horas]` que consulte la API de Workers
   Observability y saque solo las líneas de esa conversación/hora.

## Coste (§8)
- Workers Logs: plan gratis → 200.000 líneas/día incluidas y 3 días guardados; si se pasa, deja de guardar
  (no cobra). Plan de pago (5 $/mes) → 20 millones/mes incluidos, 7 días, 0,60 $ por millón extra.
  Con el tráfico actual, a ojo: **0 €**. Falta confirmar qué plan de Workers tiene la cuenta.
- No cambia ninguna llamada a APIs de pago (Google, Claude, OpenAI…). Desplegar enfría la caché del prompt
  una vez (~0,01 €).
- Si algún día el volumen sube: `head_sampling_rate` en `[observability]` guarda solo un % de peticiones.

## Riesgo
Bajo: es configuración, no código de Salma. Los logs pueden llevar texto de mensajes de usuarios → solo se
leen para diagnosticar casos, nunca se copian a docs ni al repo.
