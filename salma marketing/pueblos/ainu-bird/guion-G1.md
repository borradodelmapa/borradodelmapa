# «Isabella Bird y los ainu» · los 20 primeros segundos (G1) — v1, 22 nov 2026, pendiente del OK de Paco
- Hablan dos voces: **BIRD** (voz recreada; lo que dice sale traducido de su libro) y **SALMA** (periodista, le contesta).
- `nombre: ainu`: suena en el segundo 2 (G2).
- El sígueme lo pone el motor, a los 20 s (M13).
- Coste de este trozo: 0 € hasta generar la voz.

| Seg. | Imagen | Quién | Texto |
|---|---|---|---|
| 0-5 | **Plano 1, el caballo:** foto de 1878 quieta, que cobra vida al entrar la voz | BIRD | «Antes de contarme nada, los ainu me suplicaron que no se lo dijera al Gobierno japonés.» |
| 5-8 | **Plano 3, Londres:** las manos pasan la página | SALMA | «Dos años después, lo publicó todo. En Londres.» |
| 8-12 | Su **grabado real** (Isabella_Bird.jpg), rótulo «ISABELLA BIRD · 1878» | SALMA | «Isabella Bird. Inglesa, cuarenta y seis años, enferma desde niña. Los médicos le recetaron viajar.» |
| 12-16 | **Foto real** de una mujer ainu tatuada (W3) | BIRD | «Las mujeres me imploraron que las ayudara. Japón les había prohibido su tatuaje.» |
| 16-20 | **Plano 2, la carta:** baja la mirada a la página | SALMA | «Ella lo apuntó todo. ¿Las ayudó… o las traicionó?» |

## Cómo cumple las reglas del gancho
- **N2:** en los 5 primeros segundos ya está el gancho, el secreto que le piden guardar.
- **N15:** justo después viene la promesa concreta, «Dos años después, lo publicó».
- **N16:** la pregunta «¿Las ayudó o las traicionó?» queda abierta y se cierra al final con la verdad, sin juzgar.
  - Al final se dirá que **no consta que intercediera**, que la prohibición siguió y que la última mujer con el tatuaje completo murió en 1998.
  - El cierre también apunta que su libro es hoy una de las fuentes sobre cómo vivían los ainu en 1878. Ese dato se comprueba con fuente antes de que vaya a la voz (F4).
- **M15:** la primera persona que sale es la viajera. La foto real de la mujer ainu entra a los 12 s.
- **Lado humano** (lo que pidió Paco): enferma y valiente, en el bloque de 8-12 s; la contradicción, en la pregunta.

## Fuentes (F4)
Todas salen de Isabella Bird, *Unbeaten Tracks in Japan* (1880), cartas desde Biratori de agosto de 1878:
- «begged and prayed that I would not inform the Japanese Government that they had told me of their customs».
- «implored both Mr. Von Siebold and me to intercede with the Japanese Government» por la «recent prohibition of tattooing».
- Lo de los 46 años y los médicos viene de Wikipedia («Unbeaten Tracks in Japan» e «Isabella Bird»).
- Publicado en 1880 por John Murray, en Londres.

## Avisos
- **Y20:** con el título 1 («…Japón les PROHIBIÓ su tatuaje en 1871»), la prohibición llega a los 12 s, no en los primeros. **Con este gancho encajan mejor el título 2 o el 3**, los de la viajera.
- **Voz de Bird:** antes, una frase de prueba con 2-3 voces de ElevenLabs (unos 300 caracteres del plan; se dice el saldo antes).

## ✅ Decidido por Paco (22 nov 2026)
- **G1:** aprobados los 20 primeros segundos («Sí, prueba voces»).
- **Voz de BIRD:** `voces/bird-grave-alice.mp3` («ESTA»).
  - Es la voz Alice de ElevenLabs (Xb7hH8MSUJpSbSDYk0k2, eleven_v4, es, estabilidad 0,45 / similitud 0,85 / estilo 0,3).
  - Pasa por ffmpeg: `asetrate=44100*0.89,aresample=44100,atempo=1/0.89*0.97,equalizer=f=180:t=q:w=1:g=3`.
  - Está en la checklist (N8, 22 nov 15:10).
  - El motor todavía no baja el tono por su cuenta: hay que añadirlo al montar, o meter las frases de Bird ya tratadas.
