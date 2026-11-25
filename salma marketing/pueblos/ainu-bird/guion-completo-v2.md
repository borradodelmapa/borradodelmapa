# «Los AINU confiaron en una viajera inglesa 🇯🇵» · GUION v2 (22 nov 2026, pendiente del OK de Paco)
**Diario de grandes viajeros · 1.** El cambio respecto a la v1 viene de la crítica que pegó Paco («no me gusta como habla salma»).
- **BIRD es el personaje:** cuenta lo suyo, con sus palabras.
- **SALMA es la periodista de investigación:** no narra datos. Interroga, conecta, hace dudar y remata. Cada vez que entra, cambia el sentido de lo que acaba de decir Bird.
- La v1 se guarda en `guion-completo.md`.

| Seg. | Imagen | Quién | Texto |
|---|---|---|---|
| 0-5 | Plano 1, el caballo, **en movimiento desde el fotograma 0** (sin foto quieta al empezar), con «Le pidieron SILENCIO» en pantalla desde el primer instante | BIRD | «Antes de contarme nada, los ainu me suplicaron que no se lo dijera al Gobierno japonés.» |
| 5-8 | Plano 3, Londres, el libro | SALMA | «Aun así… acabó escribiéndolo en un libro.» |
| 8-13 | Grabado real de Bird, rótulo «ISABELLA BIRD» | SALMA | «Se llamaba Isabella Bird. Enferma desde niña, los médicos le recetaron viajar. Acabó recorriendo medio mundo.» |
| 13-17 | Foto real de mujer tatuada (W3) | BIRD | «Me imploraron que intercediera ante el Gobierno. Japón les había prohibido su tatuaje.» |
| 17-21 | Plano 2, la carta | SALMA | «Le pidieron que no lo supiera el Gobierno. Lo publicó en Londres. ¿Hizo lo correcto?» → sígueme |
| 21-26 | Jefes ainu (W16), rótulo «BIRATORI · HOKKAIDO · 1878» | SALMA | «Sin conocerla de nada, la metieron en casa de su jefe.» |
| 26-31 | Mujeres ainu (W21) | BIRD | «La madre del jefe reñía a su nieto por contarme demasiado.» |
| | | SALMA | «Tenía un motivo.» |
| 31-35 | W19 | BIRD | «Decía que eso traería daño a su pueblo.» |
| 35-42 | Grabado «Ainu» de su libro → W26 | BIRD | «Sus voces son más suaves y dulces que nada que haya oído.» |
| | (pausa de 1 s) | SALMA | «Sin embargo… en ese mismo párrafo los llamó "niños adultos".» |
| 42-50 | PP de mujer tatuada (W4), cifra «1998» | SALMA | «La prohibición siguió. La última con el tatuaje completo murió en 1998.» |
| 50-55 | El libro quieto → Upopoy hoy (W39) | SALMA | «Lo que le suplicaron que no supiera el Gobierno… hoy se lee traducido al japonés.» |
| 55-60 | Tarjeta | — | «DIARIO DE GRANDES VIAJEROS · 1» → «Próximo viajero: …» |

## Frases de la crítica que NO se usan tal cual, porque no tienen fuente (F4 / F2)
| Propuesta | Problema | Queda |
|---|---|---|
| «Ella prometió escuchar» | En el libro no consta ninguna promesa: se lo suplicaron, sin más. | «Le pidieron silencio. Publicó cada palabra.» |
| «Los médicos pensaban que viajar podía salvarle la vida» | Exagera: le recetaron viajar por salud. | «los médicos le recetaron viajar» |
| «Los ainu hicieron algo impensable: la dejaron dormir…» | «Impensable» no está en ninguna fuente. Ella llegó sin avisar y la acogieron. | «Sin conocerla de nada, la metieron en casa de su jefe.» |
| «La madre del jefe me pidió silencio» | No es lo que pasó: reñía a su nieto por contarle demasiado. | La frase literal del libro. |
| «los describió como inferiores» | Es interpretación nuestra. La cita literal pega más fuerte. | «"niños adultos"» |
| «forma parte de la memoria oficial de Japón» | No hay fuente de «oficial». Lo comprobado: se tradujo en 1978 y se reeditó en 2000. | «hoy se lee traducido al japonés» |
| «Nunca sabremos si las protegió o las expuso» | Es verdad, pero con la pregunta del segundo 21 ya basta. Fuera, para no repetir. | — |

## Fuentes
Las mismas que en la v1 (`guion-completo.md`). «Medio mundo»: Japón, China, Corea, Vietnam, Malasia, India, Persia, el Tíbet, Marruecos, Hawái y las Montañas Rocosas (Wikipedia, «Isabella Bird»).

## Coste
Igual que la v1: ~750 caracteres de voz, dentro del plan (0 € extra).

## Arranque (Paco, 22 nov: «Q se mueva»)
La lectura de métricas del 22 nov (docs/metricas-canal.md) dice que en TikTok la mayoría se va en el segundo 1. Por eso el plano 1 se mueve desde el fotograma 0 y lleva el texto del gancho desde el principio. Lo de «la foto quieta que cobra vida» se queda solo para los planos 2 y 3.

## Arranque v2 (Paco, 22 nov: «Tiene que ser más cañero… que pase a color mientras van dando»)
- **Texto en pantalla, en tres golpes:** «Le pidieron SILENCIO» (0-1,6 s) → «No calló» (1,6-3,2 s) → «El tatuaje MURIÓ» (3,2-5 s).
- **«Murieron» no se usa:** daría a entender que murieron por su culpa, y eso no consta en ninguna fuente (F4). «El tatuaje murió» sí es verdad: la última mujer con el tatuaje completo murió en 1998.
- **Imagen:** `recreaciones/caballo-color.png` (gen4_image, 8 créditos) → `caballo-color-anim.mp4` (gen4_turbo, 25 créditos).
  - El montaje lo pasa de sepia a color poco a poco entre los segundos 0,4 y 3,3, con un sepia ffmpeg que se va quitando, así que no sale imagen doble.
- **Prueba:** `recreaciones/prueba-arranque-v2.mp4`.
- **Runway en total: 246 créditos (≈ 2,46 $).**

## Arranque v3 (Paco, 22 nov: «El caballo parece que va flotando… ¿Y qué pasa con los textos?… ¿esa qué clase de carátula es?»)
- **Caballo:** se vuelve a animar con Kling 3.0 Pro (`caballo-color-kling.mp4`, 60 créditos). Ahora se ven los pasos, con las patas alternando. La animación de gen4_turbo queda descartada, porque flotaba.
- **Textos:** se hacen con el diseño de la carátula (Barlow Condensed 900, palabra fuerte en naranja y oscurecido arriba), en `recreaciones/textos/g1-g3`. Impact queda descartado.
  - Los golpes son «Le pidieron SILENCIO» → «Y ella NO CALLÓ» → «El tatuaje MURIÓ».
- **Primer fotograma:** la carátula C, 0,2 s (M11).
- **Prueba:** `recreaciones/prueba-arranque-v3.mp4`.
- **Runway en total: 306 créditos (≈ 3,06 $).**

## v2.1 (22 nov, «Si» de Paco a la versión verdadera, tras el revisor de guion)
- El libro dice que le suplicaron que **no informara al Gobierno japonés**, no que callara. Ella les había dicho que lo contaría a los suyos (l. 8643-8656).
- «Me imploraron» lo dicen los hombres. «Sus voces» son las de los hombres (l. 10043).
- «Muchas se tatuaron a escondidas» queda fuera: no tiene fuente en la tabla.
- Textos del arranque: «Que no se enterara EL GOBIERNO» → «Y ella lo PUBLICÓ» → «El tatuaje MURIÓ».
- Voz rehecha: 446 caracteres del plan.
- Mapa propio: mapa-bird.mp4 (mapa-bird.cjs, Tokio → Biratori).
- **N31, cómo están hoy (revisor v9):** el rótulo de Upopoy dice «UPOPOY · MUSEO AINU · 2020». Fuente: Upopoy abrió el 12 jul 2020 en Shiraoi (ep. 7, PDF oficial de Upopoy de abril de 2026).
