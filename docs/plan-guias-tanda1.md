# Plan de la primera tanda de guías (22 oct 2026)

Planteamiento preparado con Paco para hacerse en otro chat. **Objetivo:** lanzar la app a su público con guías de
calidad, sin gastar de más. Su público son los **viajeros por libre**, los que montan su propio viaje de varias etapas
(Tailandia, Vietnam, Filipinas…).

## 1. Cómo se hace cada guía (ya probado con Vietnam, Camboya y Filipinas)
Scripts en `scripts/`, con la cuenta de pruebas (`api/test-user.txt`):
1. `node scripts/probar-chat.cjs "Hazme una ruta por <X> de <N> días por libre"` → plan de Salma. **Revisarlo antes de seguir:**
   - que estén todos los días;
   - que los trayectos vayan en líneas «Cómo llegar:» sin corchetes;
   - que no haya sitios raros.
2. `node scripts/crear-guia.cjs "<X>" salida.json` → igual que el botón «Crear ruta con mapa». Revisar:
   - paradas descartadas y «sin verificar»;
   - días de viaje;
   - precios con fuente;
   - título y resumen.
3. `node scripts/guardar-guia.cjs salida.json` → la guarda en Mis Viajes de la cuenta de pruebas. Copia en `guias-generadas/`.
4. `node scripts/publicar-guia.cjs <id>` → guía pública, autor «Salma», portada = mapa de la ruta. Sale **noindex** hasta
   que Paco la apruebe (build-guias: sin resumen de verdad no se indexa).

**Coste real medido por guía nueva:**
- Plan de Salma: 0,05–0,11 €.
- Pasarla a guía: ~0,01 €.
- Verificar en Google: ~0,016 € por sitio que aún no esté en el catálogo. Filipinas 21 días costó ~0,43 €; una ciudad de 3–4 días, ~0,25 €.
- Fotos y fichas: solo cuando alguien abre la guía. Cada foto se paga una vez por sitio, para siempre.

**Límites del día:**
- Places API: 2.000 peticiones/día (Google Cloud, proyecto «salma api»).
- Freno propio: 9 €/día, en KV `gcap:config`.
- Unas 20 guías caben en un día sin tocar nada.

Si Google se queda sin cuota, la guía no se entrega: avisa «inténtalo en unos minutos».

## 2. Propuesta inicial: lo más buscado que no tiene guía (del estudio de demanda del 21 oct)
Ciudades, 3–4 días: Madrid, Nueva York, Buenos Aires, Bogotá, Londres, San Sebastián, Santiago de Chile, París,
Medellín, Estambul, Cartagena de Indias, Budapest, Río de Janeiro, Praga, Viena.
Varios días: Isla de Pascua, Jordania (Petra, Wadi Rum, Ammán, 5 días), Mallorca, Islas Galápagos, Camino de Santiago.
Fuera, a propósito: Jerusalén (situación del país). Coste: ~6–10 €. Fuente: `docs/estudio-demanda-2026-10-21.md`.

**Ojo:** es la lista de **más tráfico general**. Para el público de Paco (por libre, varias etapas) encaja mejor la del punto 4.

## 3. Estudio: rutas por libre y alternativas (qué busca la gente en español)
**Cómo se ha medido (0 €, 22 oct):** sugerencias de Google en español (España) para «ruta por X», «X por libre», «X mochilero»
e «itinerario X». Cuantas más frases propone Google, más se busca. También se apuntan **los días que más se buscan**, que
deciden el título para el posicionamiento.

| Destino | Sugerencias | Duraciones más buscadas | Lo que más se busca |
|---|---|---|---|
| Perú | 38 | 15, 20, 14, 12, 10 días, 3 semanas | «ruta por Perú 12 días», «Perú por libre» |
| México | 37 | 10, 15, 21, 14 días | «ruta por México 10 / 15 días» |
| Tailandia | 36 | 15, 10, 20, 12, 30 días | «ruta por Tailandia 15 días», «por libre o agencia» |
| Vietnam | 35 | 10, 15, 20, 12, 14, 21 días | «Vietnam por libre en 20 días» |
| Japón | 35 | 15, 10, 20, 21 días, 3 semanas | «ruta por Japón en 15 días» |
| Indonesia | 34 | 15, 20, 30, 12, 14 días | «Indonesia por libre 20 días» |
| Costa Rica | 33 | 15, 10, 12, 20 días | «por libre o organizado» |
| Sri Lanka | 32 | 12, 10, 20, 15 días | «Sri Lanka por libre 15 días» |
| Colombia | 32 | 15, 12, 20, 21, 17 días | «Colombia por libre 20 días» |
| China | 32 | 15, 20, 10 días | «China por libre 15 días» |
| Marruecos | 30 | 7, 10, 5, 4 días; en moto/coche | «Marruecos por libre en 7 días» |
| Camboya | 30 | 10, 15, 7 días; con Vietnam | «ruta por Camboya y Vietnam» |
| Malasia | 29 | 15, 12, 20 días | «Malasia por libre 15 días» |
| Islandia | 29 | 8, 10, 7, 15 días; autocaravana | «Islandia por libre 7 días» |
| India | 27 | 15, 10, 20 días | «India por libre o organizado» |
| Sudáfrica | 27 | 15, 10, 20 días | — |
| Rumanía | 26 | 8, 10, 7, 5 días | — |
| Georgia | 25 | 10, 7, 8, 14 días; con Armenia y Azerbaiyán | «Georgia por libre 10 días» |
| Guatemala | 25 | 10, 12, 15 días | «Guatemala por libre es seguro» |
| Filipinas | 24 | 15, 20, 12, 10 días | «Filipinas por libre 15 días» (ya hay guía de 21) |
| Albania | 24 | 7, 10 días; en coche | «Albania por libre 10 días» |
| Tanzania | 24 | 15, 10 días; con Zanzíbar | «Tanzania por libre» |
| Ecuador · Jordania · Namibia | 23 | Ecuador 15 · Jordania 7–10 · Namibia 10–15 (con Botsuana) | — |
| Uzbekistán · Montenegro · Senegal | 21 | Uzbekistán 10 · Montenegro 7 · Senegal 10–15 | «Uzbekistán por libre» |
| Laos · Kenia · Bolivia · Patagonia | 19–20 | Laos 10–15 (con Camboya) · Bolivia 15 (con Chile) | «Patagonia chilena y argentina» |
| Nepal · Taiwán · Túnez · Azores | 18 | Nepal 14 · Taiwán 15 · Túnez 7 · Azores 7–10 | «ruta en moto por Nepal» |
| Omán · Madagascar · Borneo | 15–16 | Omán 10 · Madagascar 15–20 | — |
| Mongolia · Kirguistán · Etiopía | 8–12 | Mongolia 10–15 | Nicho: aventura y trekking |
| Irán · Bután · Pakistán · Myanmar | 1–6 | — | Casi no se buscan. **Fuera** por seguridad o visados |

**Contexto de tendencias (fuentes):**
- **Albania:** el país que más crece entre españoles. Reservas de verano 2026 con un **+302,7 %** de pasajeros, según Kiwi.com ([Journal des Palaces](https://journaldespalaces.com/pressrelease-78323-grecia-albania-y-japon-lideran-el-boom-de-reservas-de-verano-entre-los-espanoles.html)).
- **Uzbekistán y Georgia:** emergentes. Hay vuelos directos desde España ([Uzbektourism](https://gov.uz/en/uzbektourism/news/view/126696)).
- **Destinos alternativos en general:** la búsqueda de destinos menos masificados es tendencia de 2026 ([Forbes España](https://forbes.es/forbestravel/916065/los-destinos-alternativos-protagonistas-de-los-viajes-del-proximo-verano/)).
- **Lonely Planet Best in Travel 2026** incluye, entre otros, Perú, Túnez, Siem Reap, Quy Nhon (Vietnam), Jaffna (Sri Lanka), Quetzaltenango (Guatemala), Botsuana y Cádiz ([Falstaff](https://www.falstaff.com/en/news/lonely-planet-the-25-best-vacation-destinations-and-experiences-2026)).
- En Los Viajeros, el foro de Asia Central tiene hilos de «Uzbekistán y países próximos sin agencia» y de búsqueda de compañeros. Hay público, pero los visados y las fronteras cambian ([hilo](https://www.losviajeros.com/foros.php?p=6747950)).

**Rutas «alternativas» dentro de un país (para una segunda tanda: nicho, buena imagen de marca, poca competencia):**
- **Vietnam norte:** el bucle de Ha Giang en moto (4–5 días).
- **Tailandia norte:** el bucle de Mae Hong Son (ya hay una guía de 4 días).
- **Laos:** el bucle de Thakhek.
- **Indonesia:** Flores y Komodo; Sulawesi y Tana Toraja.
- **Sri Lanka:** el norte, con Jaffna.
- **Georgia:** Kazbegi y Svaneti.
- **Kirguistán:** trekkings y yurtas.
- **Uzbekistán:** la Ruta de la Seda (Jiva, Bujará, Samarcanda).
- **Chile:** la Carretera Austral.
- **Bolivia:** Uyuni y el sur de Lípez, con Atacama.
- **Ecuador:** el bucle del Quilotoa.
- **Guatemala:** el lago Atitlán y Quetzaltenango.
- **Rumanía:** la Vía Transilvánica.
- **Albania:** la Riviera y los Alpes albaneses.
- **Jordania:** Jordan Trail y Wadi Rum.

## 4. Propuesta para el público de Paco: tanda 1 de 20 rutas por libre
Criterio:
- lo que más se busca «por libre»;
- **con la duración más buscada en el título** (posicionamiento);
- mezcla de Asia (su fuerte), Latinoamérica (mucho público en español) y alternativas que crecen.

| # | Guía | Por qué |
|---|---|---|
| 1 | Perú en 15 días por libre | El más buscado |
| 2 | México en 15 días por libre | 2.º más buscado |
| 3 | Tailandia en 15 días por libre | Núcleo del público mochilero |
| 4 | Vietnam en 15 días por libre | La de 14 ya existe: 15 es lo que se busca |
| 5 | Japón en 15 días por libre | Muy buscado. No tiene páginas de destino todavía |
| 6 | Indonesia en 20 días por libre | 20 días es de lo más buscado |
| 7 | Sri Lanka en 12 días por libre | Duración top; Jaffna en Lonely Planet 2026 |
| 8 | Colombia en 15 días por libre | Mucho público en español |
| 9 | Costa Rica en 15 días por libre | Muy buscado |
| 10 | Malasia en 15 días por libre | Ruta clásica del sudeste asiático |
| 11 | Filipinas en 15 días por libre | Lo más buscado (la de 21 ya está) |
| 12 | Camboya y Vietnam en 15 días | Combinación muy buscada |
| 13 | Laos y Camboya en 15 días | Combinación buscada, ruta mochilera clásica |
| 14 | Marruecos en 7 días por libre | 7 días es lo top |
| 15 | Georgia en 10 días por libre | Emergente |
| 16 | Albania en 7 días por libre | El que más crece (+302 %) |
| 17 | Uzbekistán en 10 días: la Ruta de la Seda | Emergente, con vuelos directos |
| 18 | Guatemala en 12 días por libre | Buscado; Quetzaltenango en Lonely Planet 2026 |
| 19 | Bolivia y Chile: Uyuni y Atacama en 15 días | Combinación buscada, ruta alternativa |
| 20 | Islandia en 10 días por libre | Muy buscado en coche o autocaravana |

**Coste estimado de la tanda:** 20 × ~0,30–0,60 € ≈ **6–12 €**. Cabe en un día.

## 5. Antes de empezar la tanda (decisiones de Paco)
- ¿Tanda del punto 2 (tráfico general), del punto 4 (su público) o mezcla?
- Guías **noindex** hasta que Paco las revise. Después, abrir a Google por tandas (`docs/seo-plan-minimo.md`).
- Revisar cada plan antes de convertirlo (punto 1.1). Un plan malo es una guía mala.
- Pendiente conocido: algunos países de la lista no tienen páginas de destino (Japón, Perú, México, Marruecos, Italia…).
  La guía funciona igual, pero sin enlaces internos desde su destino.
