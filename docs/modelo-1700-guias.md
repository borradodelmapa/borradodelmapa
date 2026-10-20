# Modelo para hacer las ~1.700 guías reales (borrador, 20 oct 2026)

Es una **propuesta para decidir con Paco**, no está implementado. Parte de `docs/guias-estructura-v2.md` (estructura nueva) y de los fallos que salieron en la guía de Chitwan (`docs/traspaso-guias-calidad.md`).

## Principios (innegociables)
1. **Real y con fuente.** Cada dato lleva su origen y su fecha. **Sección vacía antes que inventada.**
2. **La verificación de Google no se toca**: coordenadas, `place_id`, «Cómo llegar», mapa. El proceso solo la **lee** y rechaza lo que no pasa; nunca la «corrige».
3. **Se conserva el diseño de la guía.** Solo se añade información, con los bloques etiquetados que ya existen.
4. **Pocas a la vez y siempre comprobadas.** Tandas de 30 como máximo; nada se publica sin pasar la puerta de calidad; a Google solo por tandas.

## Lo que falló en Chitwan y el modelo debe evitar desde el origen
- **Actividades como paradas.** Safari en jeep, safari a pie y lago eran «paradas» y Google las dejó todas en el centro del parque (mismo nombre, mismo punto, ≈19 km de donde está la gente).
- Fotos de Google que no corresponden o caducadas; paisaje cercano que no encajaba.
- Precios que se contradicen (25 € / 11 € la entrada) y presupuesto por defecto «18-54 €» en 1.620 de 1.630 fichas.
- Historia generada sin fuente (botón «Historia de…»).

## El modelo: una guía = lugares + experiencias
- **Parada = un lugar que existe y se puede localizar** (Sauraha, Centro de cría de elefantes, Lago Bishazari). Lleva sus coordenadas y las verifica Google.
- **Experiencia = algo que se hace en un lugar** (safari en jeep, canoa, danza). Va **dentro de la ficha del lugar**, con duración, precio y consejo. **No es una parada** y no se pone en el mapa.
- Así desaparecen los pines repetidos y el mapa solo enseña puntos reales.

## Proceso por destino (cada paso se puede parar y repetir)
1. **Elegir** qué destinos y en qué orden (los que más se buscan primero; 30 países aún sin generar, ver `docs/seo-destinos-prioritarios.md`).
2. **Ruta (nivel 3)**: generar paradas = lugares (script `generate-nivel3.js`, hoy GPT-4o-mini, ≈ 0,06 $ por ruta según `docs/kv.md`), con la regla anterior en el prompt. Cambiar el prompt exige el protocolo `prompt-salma` (un cambio, tag, prueba).
3. **Verificar con Google** (proceso actual, sin tocar). **Coste sin medir:** medir con UNA guía antes de nada.
4. **Puerta de calidad (solo lectura)**: rechaza la guía si hay paradas con el mismo punto o el mismo nombre, una parada a más de unos km del destino, un título que no coincide con su texto, o falta de verificación. Si rechaza, se regenera o se avisa; **nunca se edita el dato de Google**.
5. **Ficha del lugar (esencia, historia, curiosidades)**: sacar el extracto de **Wikipedia/Wikivoyage** (API gratuita, atribución CC BY-SA), y que el modelo **escriba solo a partir de ese extracto**, guardando la URL y la fecha. Sin artículo, la sección queda vacía.
6. **Datos prácticos** (cómo llegar, dormir, comer, precios): de la ficha del destino marcados «por verificar» hasta tener fuente y fecha. Nunca se inventan.
7. **Fotos**: Wikimedia con crédito, buscando por **el lugar y por cada experiencia**; solo si el título/descripción corresponde; foto por posición si hay nombres repetidos (`scripts/fotos-destinos.cjs`, `limpiar-fotos.cjs`).
8. **Revisión humana corta**: hoja de fotos de la tanda (30 s) y las secciones «fotografía» y «lo que nadie te cuenta», que solo se publican si hay fuente o las escribe una persona.
9. **Publicar** como guía pública (`public_guides/<slug>-ruta` en Firestore), en `noindex`; abrir a Google por tandas con `scripts/abrir-tanda.cjs` y vigilar Search Console entre una tanda y otra.

## Coste (estimación a medir con una guía, no cifras firmes)
- Generar ruta + ficha con más texto: de 2 a 3 veces los ≈ 0,06 $ de hoy → ≈ 0,12-0,20 $ por guía, es decir **≈ 200-340 $ para 1.700**.
- Verificación Google: **desconocida**. Hoy no hay medición por guía; con ~10 paradas por guía, 1.700 guías son ≈ 17.000 verificaciones. Medir antes y repartir por tandas.
- Fotos, Wikipedia, Wikidata: 0 €.

## Orden de trabajo
1. Cerrar el esquema de datos de la ficha (campos obligatorios y opcionales, con origen y fecha).
2. **Piloto con UN destino** (Chitwan, rehecho con el modelo nuevo): coste, tiempo, calidad. Enseñarlo a Paco.
3. Puerta de calidad y extender `verificar-destinos.cjs`.
4. Tanda de 5, revisión, tanda de 30, y así.
5. Arreglar las 11 guías que ya existen **solo con permiso de Paco** (los datos de Google no se editan: se regenera y se vuelve a verificar).

## Decisiones que son de Paco
- ¿Experiencias dentro de la ficha del lugar y no como paradas? (propuesto)
- Presupuesto para el piloto y para cada tanda.
- Quién escribe «fotografía» y «lo que nadie te cuenta» en los destinos clave.
- Si el botón «Historia de…» se sustituye por la ficha con fuente cuando la guía la tiene.
