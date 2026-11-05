# 📱 APP — manual del sistema (lo mantiene el chat 📱 App)

## 1 · Para qué sirve
Que la app de Borrado del Mapa y Salma funcionen bien: casos del panel admin, fallos, mejoras, Worker y despliegues.
**No hace:** vídeos, páginas de la web pública, guías en tanda ni decisiones de qué país va ahora (eso es 🎬, 🌍 y 📈).
**No trabaja en modo producción:** cada cambio sigue CLAUDE.md §2 (un cambio, una prueba, el OK de Paco), porque lo usan los usuarios.

## 2 · Lo que sabe del proyecto (documentos que mandan)
| Tema | Documento |
|---|---|
| Protocolo y reglas generales | `CLAUDE.md`, `docs/protocolo-completo.md`, `docs/normas-desarrollo.md` |
| Estructura, stack y orden de carga de los 19 scripts | `docs/proyecto-y-stack.md` |
| Worker: endpoints, flujo del chat, eventos | `docs/worker-endpoints.md`, `worker/CLAUDE.md` |
| Prompt de Salma, modelos, verificación de sitios | `docs/salma-ia.md` (+ skill `prompt-salma` antes de tocar el prompt) |
| Firebase (Auth, Firestore) | `docs/firebase.md` |
| KV, crons | `docs/kv.md` |
| Secrets | `docs/secrets.md` (15 en Cloudflare; NUNCA borrar el Worker) |
| Precios, límites, premium | `docs/negocio-premium.md` |
| ¿Esto ya existe? | `docs/features-inventario.md` |
| Restaurar cualquier cosa | `docs/restauracion-y-comandos.md` |

**Decisiones de Paco vigentes en este terreno:**
- **Un solo comprobador de sitios** (`strictNameMatch` + `verifyAllStops`); todo fallo nuevo entra en `scripts/probar-nombres.cjs` (CLAUDE.md §13).
- **Coordenadas, place_id y «Cómo llegar» de Google no se tocan nunca.**
- **Enlaces en el chat:** cero si el usuario no los pide; si los pide, solo la web oficial (nunca blogs, guías, foros, revistas). Paco, 5 nov: «déjalo así, estaré pendiente».
- **Política de acceso** «mirar sí, usar con cuenta» (CLAUDE.md §10).
- **Menú de abajo y cabecera = una sola cosa** en app, destinos, 404, blog y legal (CLAUDE.md §9).
- Cualquier línea que pueda llamar a una API de pago: se dice el impacto en coste antes (CLAUDE.md §8).

## 3 · Recursos ya creados
| Recurso | Para qué |
|---|---|
| `node scripts/casos.cjs hoy` · `coger` · `diagnostico` · `estado` · `version` | Lista viva de casos (panel admin → Mejora Salma → Casos); llave solo de casos `api/cases-token.txt` |
| `node scripts/probar-nombres.cjs` | Nombres de sitios y anclas de destino (0 €) |
| `node scripts/probar-worker-humo.mjs` | Que el Worker no reviente antes de desplegar (0 €) |
| `scripts/banco-salma/` (`pasar.cjs`, `--grabar`, `--reproducir`) | Banco de pruebas de Salma; por tandas cada 5-6 cambios del chat (coste dicho antes) |
| `node scripts/probar-chat.cjs "pregunta"` | Salma real con la cuenta de pruebas (1-9 cént./mensaje) |
| `node scripts/comprobar-nada-atras.cjs` | Que ninguna página se quede con versiones viejas (0 €) |
| `npx wrangler tail salma-api --format pretty` | Ver el Worker en vivo mientras Paco prueba |
| Panel 🐛 de la app | Errores JS, versión del Worker y `?v=` de cada script en la pantalla de Paco |
| `worker/restaurar-secrets.cjs`, `worker/probar-google-keys.cjs` | Copia de los secrets y diagnóstico de Google |

## 4 · Protocolos (listas de tareas)
### Caso (fallo o mejora)
1. `casos.cjs coger <id>` y leer la nota de Paco.
2. Diagnosticar siguiendo el dato de punta a punta (todos los que escriben y leen); leer KV o logs si hace falta (solo lectura, 0 €).
3. `casos.cjs diagnostico` + `estado propuesta` → **explicar a Paco en pocas líneas: qué pasa, el arreglo, el coste y el riesgo** ⏸.
4. Con su OK: copia aparte (`.claude/worktrees/caso-…`, rama propia) → cambio → pruebas de 0 € (nombres, humo, nada atrás) → si se ve en pantalla, comprobarlo en local.
5. Enseñárselo ⏸ → con su OK, desplegar (abajo) → `estado comprobando` → Paco lo prueba en su app.

### Despliegue (skill `desplegar`)
1. `git fetch origin main`; comprobar que producción (`/version`) es el último commit del Worker en main (no pisar nada).
2. Juntar la rama con main (rebase) y repetir las pruebas.
3. Frontend: subir `?v=` de cada `.js` cambiado en `index.html` → push → esperar a que la web sirva el `?v=` nuevo.
4. Worker: `probar-worker-humo` en ✅ → `npx wrangler deploy -c wrangler.toml` desde `worker/` → `/version` = el Version ID del deploy.
5. `casos.cjs version "qué se subió" <ids>` y decirle a Paco qué probar. Nunca «arreglado»: «subido, dime qué ves».

## 5 · Estado ahora (5 nov 2026)
| Qué | Estado |
|---|---|
| Caso p-mw2gxtxbpmq: guías por zonas perdían paradas (Luzón norte) | Desplegado (Worker 69b021be) · falta que Paco lo pruebe |
| Logo repetido al abrir el blog o un destino desde la app | Subido (app.js v288) · falta que Paco lo mire |
| «‹ Volver» del visor del blog cierra todo en vez de volver a la página anterior | Diagnosticado · espera el OK de Paco para prepararlo |
| Cambio del Worker de otra sesión (revistas y directorios fuera del chat, caso p-mw16grx4wye) | Sin commitear en la carpeta principal · Paco: «déjalo así» |
| Casos abiertos | ~120 (`casos.cjs hoy`): 3 esperan OK, 8 decisiones de Paco, 10 pendientes de probar |
