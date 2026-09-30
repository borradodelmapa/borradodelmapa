# GUÍA INSTANTÁNEA — plan hablado con Paco (30 sept 2026)

> Estado: **SOLO ANOTADO. No se ha tocado código.** Paco: "apúntalo pero no hagas nada".
> Caso en el panel: "GUÍA INSTANTÁNEA…" (área ux, gravedad alta, modelo opus).

## El problema
- Salma da el plan en el chat casi al momento, pero al pulsar **"Crear ruta con mapa"** una guía de
  **5 días tarda ~2 minutos**. Paco: *"me gusta como lo hace ahora, pero no me gusta el tiempo de carga"*.
  Las guías son el negocio principal: el cambio tiene que ser seguro.
- Comparación: MotoFlap (y Calimoto, Kurviger) crean rutas en <1 s porque usan un **motor de rutas sobre
  OpenStreetMap** (GraphHopper/OSRM/Valhalla), sin IA escribiendo nada. **Lo lento nuestro no es el mapa.**

## Dónde se va el tiempo (leído en el código, falta medirlo)
1. `convertProseToRouteJson` (`worker/salma-worker.js:6371`, llamado en `:14151`): **Claude Sonnet reescribe
   todo el plan en JSON**, copiando la narrativa entera de cada parada ("hasta ~600 caracteres, NO la
   resumas"). 8–12k tokens de salida, sin streaming, timeout 150 s + reintento. → ~1–1,5 min.
2. `verifyAllStops` (`:6748`): hasta 3 rondas de Google Places por parada + distancias en coche.
3. En el modo guiado **no se manda borrador** (`:14936`): el usuario no ve nada hasta que acaba todo.

## La idea de Paco
> "Crear la guía con la información que ya ha dado Salma, plantear el mapa, que el usuario pueda estar
> mirándolo, que lo guarde… y que luego pase a nuestro sistema. No tiene por qué estar esperando dos minutos."

## Cómo quedaría
1. Salma escribe el plan en el chat como ahora y, al final, añade una **lista oculta**: `parada | día | lat | lng`
   (el usuario no la ve; se escribe mientras él ya está leyendo).
2. Al pulsar el botón, la app monta la guía en **1–2 s**: textos recortados del propio chat
   (`**Día N — …**`, `**Lugar** — …`), coordenadas de la lista, trazado con `/road-path` (OSM/Geoapify),
   fotos de la caché KV donde haya. Se puede ver, guardar y compartir.
3. **Por detrás**, el Worker pasa la ruta por `verifyAllStops` + fotos y **actualiza la guía guardada**
   (el Worker ya escribe en Firestore: `waGenerateAndSaveRoute`, `:4829`). Si la app está abierta, se va
   completando ("Salma está comprobando las paradas…"). Si el usuario cierra, lo termina un cron
   (guía marcada "pendiente de comprobar").
4. **El flujo actual se queda entero como plan B automático** si la lista falta o viene rota.

## Cambios
| Pieza | Cambio |
|---|---|
| Prompt de Salma (plan por días) | Pedir la lista oculta (protocolo `prompt-salma`) |
| Worker (chat) | Separar la lista del texto y mandarla a la app |
| App (`salma.js`/`app.js`) | Montar la guía desde texto + lista, sin esperar |
| Worker (nuevo) | Tarea de fondo: verificar y actualizar la guía guardada (+ cron) |
| App | Refrescar la guía abierta al llegar la versión comprobada |

## Riesgos y cómo se cubren
1. **Prompt de Salma** (olvida la lista, la pone mal, cambia cómo escribe) → banco de 26 preguntas antes/después;
   sin lista válida → flujo actual.
2. **Paradas que cambian tras guardar** → la comprobación corrige y añade (coords, foto, dirección), **nunca
   borra una parada sola**; la dudosa queda "sin confirmar".
3. **Pisar ediciones del usuario** → solo se tocan campos de Google, parada a parada; nunca textos ni orden.
4. **Usuario que cierra antes de acabar** → guía "pendiente de comprobar" + cron. Es lo más técnico.
5. **Guías públicas / Explorar** → no se publica nada sin comprobar.
6. **Coordenadas inventadas visibles unos segundos** → riesgo menor.

## Coste (§8)
- Quita la llamada de Sonnet que reescribe el plan: ~0,15 $ menos por guía.
- Añade ~1k tokens a cada plan escrito, aunque no se convierta en guía: ~0,015 $.
- Google Places: igual que hoy (se puede comprobar solo lo que se guarda).
- Banco de pruebas: 26 preguntas, ~1–1,5 € antes y otra vez después.

## Fases (cada una con OK de Paco y prueba en su móvil)
1. **Medir** los 2 minutos por fases (solo logs, sin riesgo).
2. Guía instantánea en una copia, con **interruptor solo para la cuenta de Paco**.
3. Comprobación por detrás + actualizar la guía guardada.
4. Abrir a todos, con el flujo actual siempre como plan B.

**Siguiente paso pendiente de Paco:** ¿empezamos por la fase 1?
