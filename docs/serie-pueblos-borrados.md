# Serie «Pueblos borrados del mapa» — plan vivo
Línea editorial y reglas: `docs/video-checklist.md` (L1, M15, P2, P4). Título: «<Pueblo> · Pueblos borrados del mapa».
Ámbito: Asia de Filipinas hacia el norte (Paco viajará por ahí a medio plazo). Cifras **por verificar** (F4) antes de cada guion.

## DÓNDE ESTÁ CADA COSA Y CÓMO SE TRABAJA (ordenado el 31 oct 2026, Paco: «me tienes un follón montado»)
**La versión buena de cada episodio está SIEMPRE en `salma marketing/pueblos/<episodio>/ULTIMA/`**, con nombre fijo: `<Pueblo> · Pueblos borrados del mapa.mp4` + PORTADA.png + subtítulos ES/EN + informe de reglas + `VERSION.txt` (qué versión es y cuándo se montó). Lo demás no hace falta mirarlo.

| Episodio | Carpeta | Editor (abrir en el navegador) | Config del motor |
|---|---|---|---|
| 1 · Whang-Od | `pueblos/whang-od/` | http://localhost:8098 | `india/motor/whang-od-ep1.cjs` |
| 2 · Sagada | `pueblos/sagada/` | http://localhost:8102 | `india/motor/sagada-ep2.cjs` |

Dentro de cada carpeta de episodio: `ULTIMA/` (la buena) · `salida/versiones-anteriores/` (borradores viejos, no tocar) · `fotos/` (W01…, con `ATRIBUCIONES.txt`) · `hoja-contactos.html` · el mapa `.mp4`.
Común a la serie: `pueblos/comun/` → `clip-app.mp4`, `sonidos/`, `sintonia/` (la elegida + `recursos/`).

**Una sola fuente de verdad:** lo que Paco cambia en el editor (fotos, portada, encuadres…) se guarda en `india/motor/editor/overrides-<episodio>.json` y **se aplica SIEMPRE al montar**, se monte desde el editor o lo monte Claude. Nadie vuelve a montar «a pelo» sin esos cambios (fue lo que pasó con Whang-Od el 31 oct).
**Rapidez y calidad (31 oct 2026):** el motor guarda cada plano hecho (`india/motor/cache-planos/`) y al remontar solo rehace los que cambian. Por defecto monta en **borrador** (rápido, para el editor). **Para publicar**, la versión final se exporta en máxima calidad: `CALIDAD=publicar node <episodio>.cjs` (planos casi sin pérdida, montaje lento, audio estéreo 256k) → **en el editor, botón «★ Exportar para publicar»**; va a `ULTIMA/` y `VERSION.txt` dice «CALIDAD MÁXIMA».
**Para arrancar un editor:** en Claude, «abre el editor de <episodio>» (configuraciones «Editor de vídeo · …» de `.claude/launch.json`); o a mano `node "salma marketing/india/motor/editor/server.cjs" <episodio>`.

## Orden propuesto (30 oct 2026, pendiente de OK de Paco)
| # | Pueblo / tema | Zona | Estado |
|---|---|---|---|
| — | Los kayan | Norte de Tailandia | publicado (26 oct, como Cap.4) |
| 1 | Whang-Od y el tatuaje *batok* (butbut, Kalinga) | Luzón norte, Filipinas | **TERMINADO (Paco, 31 oct: «este vídeo está»)**: con los cambios de Paco en el editor (30 oct), sígueme a los 20 s con su sonido y sintonía. Vídeo: `pueblos/whang-od/ULTIMA/` · config: `india/motor/whang-od-ep1.cjs` · guion: `docs/pueblos-ep1-whang-od-guion-direccion.md`. Pendiente: fotos grandes de Wikimedia (429; faltan 11), paquete de texto (P6) con autores al final del comentario fijado (P2), publicar. Voz ya pagada (~1.070 caracteres): remontar = 0 €. |
| 2 | **Los ataúdes colgantes de Sagada** (adelantado por Paco el 31 oct, «para continuar con Filipinas») | Luzón norte, Filipinas | borrador montado con sintonía; vídeo: `pueblos/sagada/ULTIMA/` · guion: `docs/pueblos-ep2-sagada-guion-direccion.md` · editor 8102. Pendiente: fotos definitivas de Paco. |
| 3 | Las haenyeo de Jeju | Corea | — |
| 3 | Los konyak | Nagaland, India | — |
| 4 | Los moken | Surin, Tailandia/Myanmar | — |
| 5 | Los ainu | Hokkaido, Japón | — |
| 6 | Los mosuo | Lago Lugu, China | — |
| 7 | ~~Ataúdes colgantes de Sagada~~ → pasa al 2 | | |
| 8 | Los dukha (pastores de renos) | Khövsgöl, Mongolia | — |
| 9 | Los sentineleses (capítulo «por qué NO se visita») | Andamán, India | — |
| 10 | Las ama | Mie, Japón | — |
Reserva: ifugao, bajau, mangyan, tao de Lanyu, nüshu, cormoranes del río Li, cazadores con águila, intha, chin, akha/hmong, apatani, raute, Mustang, brokpa.
Circuitos para el viaje: Luzón norte (1, 7, ifugao) · Japón y Corea (2, 5, 10) · norte de Tailandia/Laos (4, akha/hmong) · noreste de India y Nepal (3, apatani, raute, Mustang).

## Ep.1 · Whang-Od · Pueblos borrados del mapa — ficha (borrador)
- **Quién:** Apo Whang-Od (Maria Oggay), pueblo butbut, Buscalan (Tinglayan, Kalinga), a unas 15 h de Manila. Considerada la mambabatok (tatuadora tradicional kalinga) más anciana.
- **Edad:** nacida c. 17 feb 1917 (otras fuentes: 6 mar 1919) → **107-109 años; la fecha exacta no se sabe** (decirlo así).
- **Técnica *batok*:** golpeando a mano una varilla de bambú con una espina, tinta de carbón y agua.
- **Dato potente:** abril de 2023, portada de Vogue Philippines con 106 años: la persona de más edad en una portada de Vogue (antes, Judi Dench con 85).
- **El conflicto (la historia):** hoy tatúa a 20-30 visitantes al día, solo diseños sencillos; un arte de guerreros convertido en peregrinación turística. ¿Se salva o se pierde así? Su relevo: aprendices de su familia (nombres por verificar).
- **Cómo visitar con respeto (P9):** guía local obligatoria en Buscalan, colas largas, pedir permiso para fotos. Verificar requisitos y precios a la fecha.
- **Portada (M15):** cara de Whang-Od (figura pública, P4) con foto con licencia y autor (P2).
- **Por verificar:** premio nacional (Gawad sa Manlilikha ng Bayan) — no confirmado; nombres del relevo; condiciones actuales de visita.
- **Fuentes:** [Wikipedia](https://en.wikipedia.org/wiki/Whang-od) · [Euronews, 10 abr 2023](https://www.euronews.com/2023/04/10/a-106-year-old-indigenous-filipino-tattoo-artist-becomes-vogues-oldest-ever-cover-model) · [PetaPixel, 3 abr 2023](https://petapixel.com/2023/04/03/tattooed-106-year-old-becomes-vogues-oldest-ever-cover-model) · [Atlas Obscura](https://assets.atlasobscura.com/articles/fang-od-oggay-kalinga-tattoo-philippines)
