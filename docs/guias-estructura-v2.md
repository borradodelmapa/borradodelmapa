# Estructura nueva de las guías (idea de Paco, 20 oct 2026) — borrador para pensar

Caso: p-mvfrvjvh200 («El mayor blog de viajes jamás hecho»). Esto NO está implementado: es la base para decidir.
Principio de Paco: **un solo tipo de guía, mucho más mejorada**. Todo lo que se publique se genera y **tiene que ser real**.
Es **app primero**, pero tiene que funcionar también en la web (SEO). Modelo visual: una imagen de concepto (no es el diseño final).

## Objetivo
Que la guía se sienta como «un viajero experto me está contando este lugar» y no como «estoy leyendo una ficha turística».
Combina: información práctica, contexto histórico y cultural, experiencias, consejos personales, fotografía y opinión del viajero.

## Estructura de cada lugar (texto de Paco)
1. **Cabecera**: imagen grande, nombre, frase resumen emocional, datos rápidos (tiempo recomendado, presupuesto, valoración, ubicación, mejor época).
2. **Esencia del lugar** (obligatoria): introducción narrativa corta, no descripción turística.
3. **Historia y contexto** (ampliable, «Leer más»): origen, historia, cultura, curiosidades, personajes.
4. **Experiencias recomendadas** (sustituye a «Qué ver»): cada una con imagen, título, duración, precio, dificultad, mejor momento y qué se vive.
5. **La mirada Borrado del Mapa**: fotografía (mejor punto, mejor hora, consejo) y «lo que nadie te cuenta» (errores habituales, expectativas falsas, trampas turísticas).
6. **Información práctica** (siempre al final): cómo llegar, dormir (económico / experiencia local / especial), comer, precio.
7. **Capas**: vista rápida (qué es, cuánto tiempo, precio, lo imprescindible) y vista completa (historia, cultura, experiencias).

Esquema de datos buscado: Lugar → Esencia, Historia, Experiencias (actividad, duración, precio, mejor momento, consejo), Fotografía, Consejos reales, Cómo llegar, Dormir, Comer, Datos prácticos.

## Qué ya existe en los datos (por parada, `worker/kv/routes-nivel3`)
| Sección nueva | Campo actual | Falta |
|---|---|---|
| Cabecera: nombre, imagen | `name`, foto libre (`destinos/img/<slug>/fotos.json`) | frase emocional, valoración |
| Esencia | `headline` + `narrative` (parcial) | texto narrativo propio, distinto de la descripción |
| Historia | `context` | más largo, con fuente |
| Experiencias | `alternative`, `suggestions` (de la ruta) | actividad con duración, precio, dificultad, mejor momento |
| Fotografía | — | todo |
| Lo que nadie te cuenta | `local_secret`, `alt_bad_weather` | errores, trampas |
| Cómo llegar | `km_from_previous`, `estimated_hours`, `road_name`, botón Google | — (se queda: es lo que importa) |
| Dormir / Comer | `sleep`, `eat`, `food_nearby` | las 3 gamas |
| Precio | `practical`, presupuesto del destino | entradas y actividades con importe y fecha |

Del destino (`output-nivel2`): `descripcion`, `como_llegar`, `donde_dormir{mochilero,medio,comfort}`, `donde_comer`, `consejo_local`, `plan_b_lluvia`, `mejor_epoca`, `dias_recomendados`, `alerta_seguridad`, `region`.

## Opinión (Claude, 20 oct 2026) — qué conservar y qué cuidar
**Conservar:** coordenadas y rutas verificadas con Google; «Cómo llegar» (no se toca); fotos libres con crédito; día a día; narrador y Salma; GPX/compartir; menú de abajo y cabecera (§9); verificador y `abrir-tanda.cjs`.
**Cuidar, porque «todo real» es lo difícil:**
- Cada dato lleva su origen y su fecha. Un precio, un horario o una valoración inventados hunden la confianza (y pueden dar problemas legales).
- Historia y curiosidades: generarlas **solo a partir de una fuente** (Wikipedia/Wikivoyage, con atribución CC BY-SA) y guardar la fuente. Si no hay fuente, la sección no sale: **sección vacía antes que inventada**.
- «Fotografía» y «lo que nadie te cuenta» son las que más se inventan; generadas en masa saldrán genéricas. Opciones: escribirlas solo en los destinos clave, o generarlas solo si hay fuente real, o dejarlas vacías.
- Valoración con estrellas: solo si viene de una fuente real (p. ej. Google, con coste). Si no, quitarla.
- Riesgo SEO: miles de páginas con la misma plantilla y textos genéricos pueden ser contenido «a escala» sin valor. Por eso la salida a Google va lenta y por tandas, y con secciones únicas.
- Una sola fuente de datos y dos presentaciones (la app y la página web). Los textos tienen que estar en el HTML de la web (no escondidos tras JavaScript) para que Google los lea.

## Siguiente paso propuesto
1. Cerrar el esquema de datos v2 (campos obligatorios/opcionales + origen + fecha).
2. **Piloto con UN destino** (Chitwan, el del modelo): generarlo con la estructura nueva a partir de fuentes reales, medir coste y tiempo, y enseñarlo en el modelo de app y en la web.
3. Solo después, cambiar el generador y el prompt (con el protocolo `prompt-salma` y el banco de pruebas) y abrir tandas.
