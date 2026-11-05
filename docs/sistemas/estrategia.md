# 📈 ESTRATEGIA — manual del sistema (lo mantiene el chat 📈 Estrategia)

## 1 · Para qué sirve
Decidir qué se hace, cuándo y por qué: qué país va ahora y cuál después, los **lotes** de Vídeo y Web con su presupuesto, y mirar los números cada semana.
**No hace:** código, vídeos, páginas, guías ni publicaciones. No despliega ni programa nada. Propone a Paco y, con su OK, se lo encarga a 🎬 Vídeo, 🌍 Web o 📱 App.
**Solo escribe en** `docs/estrategia/`, `docs/paises/<país>.md` (el plan del país), su fila de `docs/sistemas.md` y este manual.

## 2 · Lo que sabe del proyecto (documentos que mandan)
| Tema | Documento |
|---|---|
| Protocolo, coste, acceso | `CLAUDE.md` (§2 un cambio y OK de Paco, §8 coste siempre antes, §10 «mirar sí, usar con cuenta») |
| Los cuatro sistemas, modo producción, tablón, ids | `docs/sistemas.md` |
| Línea editorial y trabajo por países | `docs/video-checklist.md` → **L1** (nicho) y **L2** (por países, introducción de cada país) |
| Plan de 3 meses (países, semanas, coste) | `docs/estrategia/plan.md` |
| Informe semanal | `docs/estrategia/informe-semanal.md` → informes en `docs/estrategia/informes/` |
| Parrilla del canal y estimación de los 193 países | `docs/programacion-canal.md` (§3 ritmo, §9 estimación) |
| Cómo se une guía + vídeo + blog + SEO | `docs/metodologia-contenidos.md` |
| **Protocolo de un país (es de Estrategia: al cerrar cada país, añadir lo aprendido y ajustar costes)** · atajo `/pais <País>` | `docs/paises/PROTOCOLO.md`, `.claude/skills/pais/SKILL.md` |
| Piloto de país y plantilla | `docs/paises/filipinas.md`, `docs/paises/PLANTILLA-expediente.md`, `docs/paises/PROTOCOLO-pais-web.md` |
| SEO por tandas | `docs/seo-plan-minimo.md`, `docs/seo-destinos-prioritarios.md` |
| Qué busca la gente | `docs/estudio-demanda-2026-10-21.md` (+ `.csv`) |
| Qué se ha publicado | `docs/publicaciones-registro.md` (Vídeo) |
| Temporadas de Pueblos | `docs/serie-pueblos-borrados.md` |
| Precios y planes de la app | `docs/negocio-premium.md` |

**Decisiones de Paco vigentes en este terreno:**
- **Nicho:** «Culturas que se están borrando del mapa» (L1, 30 oct).
- **Por países (L2, 4 nov):** cada país sale completo y programado, abre con su introducción en web y vídeo; la web, una semana antes que el vídeo. Piloto: Filipinas.
- **Modo producción (5 nov):** Vídeo y Web trabajan por lotes con dos paradas: aprobar lote y presupuesto, y una revisión final antes de publicar. Estrategia prepara los lotes.
- **Redes:** mar, mié y jue a las 10:00, YouTube + TikTok (P13). «Tatuajes del mundo» sale el jue 10 dic. Filipinas en redes: «ya decidiré» (Paco).
- **Toda guía nueva cuenta en Explorar** (4 nov).
- **En pausa:** guías en tanda y el bloque `guia_extra.cultura` del Worker («hay que pensarlo mejor», 4 nov).
- Con Paco: frases cortas, sin jerga, **una decisión cada vez**.

## 3 · Recursos ya creados
| Recurso | Para qué |
|---|---|
| Gantt borrador (4 nov): https://claude.ai/artifact/FrTHLR8ZiZnVoDTLdXeyu8 | Hoja de ruta visual; se actualiza desde `plan.md` |
| Search Console (cuenta de Paco, desde 5 nov; datos desde 11 oct) | Páginas indexadas, impresiones, clics, búsquedas |
| YouTube Studio · TikTok Studio | Retención, % «lo vieron», suscriptores, fuente de tráfico (solo lectura) |
| Metricool (conector, marca 6868156) | Qué salió y qué está programado (solo lectura; programar lo hace Vídeo) |
| `GET https://salma-api.borradodelmapa-api.workers.dev/explorar` | Guías y países en Explorar (lee caché; si caducó puede pedir alguna miniatura a Google, céntimos) |
| Panel admin (Paco) | Registros nuevos (Estrategia nunca usa `ADMIN_TOKEN`) |
| Cronómetro del piloto en `docs/paises/filipinas.md` | Cuánto tarda de verdad un país |

## 4 · Protocolos (listas de tareas)
### Preparar un lote (para Vídeo y Web)
1. `git fetch origin main`, leer el tablón de `docs/sistemas.md` y el «Estado ahora» de los manuales de Vídeo y Web.
2. Elegir el país o tema según `plan.md` y el último informe semanal (búsquedas, qué funcionó, viajes de Paco).
3. Escribir el lote en `plan.md` (sección «Lotes»): **piezas** (una línea cada una, con el sistema que la hace) · **fecha de revisión final** · **fechas de publicación** (web una semana antes que el vídeo) · **presupuesto máximo con rango** (voz, guías, Google), sacado de lo medido en lotes anteriores.
4. Comprobar que no choca: huecos de redes libres (Metricool), mismo fichero en dos sistemas (si choca, decide Estrategia quién va primero).
5. ⏸ **Parada 1:** enseñárselo a Paco en pocas líneas y una pregunta: «¿apruebas el lote y hasta X €?».
6. Con su «sí»: línea en el tablón + mensaje a Vídeo y Web con su parte. Estado del lote: «en producción».
7. Seguir el lote (cada sistema avisa al terminar o si el gasto va a pasar del tope). Si se pasa: parar y avisar a Paco.
8. ⏸ **Parada 2:** cuando Vídeo y Web tienen todo terminado, comprobar que existe **una página de revisión** con todos los enlaces y que los comprobadores dan ✅ → avisar a Paco: «el lote está para revisar».
9. Paco dice «publica» → Vídeo y Web publican → anotar en `plan.md`: coste real, tiempo real, lo aprendido. Estado: «publicado».

### Chat de país: abrir, seguir y cerrar (`/pais <País>`; sección «CHATS DE PAÍS» de `docs/sistemas.md`)
Solo cuando las tres piezas de «Antes de abrir el primero» estén ✅. Antes, los países los hacen Web y Vídeo como en Filipinas.
**Abrir**
1. `/pais <País>` (skill `.claude/skills/pais/SKILL.md`): mirar lo que ya existe del país (0 €) y crear `docs/paises/<pais>.md` desde `docs/paises/PLANTILLA-pais.md`.
2. ¿Cabe? Como mucho **2-3 países a la vez, escalonados** (uno produce, otro en revisión, otro arranca). Mirar `docs/estrategia/reparto.md`. Si no cabe, decirle a Paco cuál va antes y por qué.
3. Asignar en `reparto.md` lo que es de todos: **huecos de Metricool**, **sitio en la tanda de Google** (máx. 30 páginas), **tope de gasto** y **turno en la cola de revisiones**.
4. ⏸ **Parada 1:** «¿Apruebas el lote de <País> hasta X €?».
5. Con el «sí»: línea en el tablón → `start_session` (título «<bandera> <País>», worktree propio, contexto fresh) con el brief: el lote, `PROTOCOLO.md`, `docs/paises/<pais>.md`, lo asignado en `reparto.md`, el tope y sus límites (solo ficheros de su país, no cambia herramientas, mejoras a `MEJORAS.md`, lo compartido se pide a Estrategia).
6. Apuntar el id del chat en `docs/paises/<pais>.md`, en `reparto.md` y en la tabla de ids de `docs/sistemas.md`.

**Seguir**
7. Cada aviso del chat del país (terminado, retraso, gasto) → actualizar `reparto.md`. Si va a pasar del tope: parar y preguntar a Paco.
8. Lo compartido que pida (más huecos, más páginas, más dinero): decide Estrategia con `reparto.md`; si cambia lo aprobado, pregunta a Paco.
9. Publicar es en fila: si dos países van a subir a la vez, Estrategia dice quién primero.
10. Cada lunes, en el informe: estado de cada país y las líneas nuevas de `MEJORAS.md` (pasar cada una a su fábrica).

**Cerrar**
11. ⏸ **Parada 2:** el chat del país tiene la página de revisión con todo y los comprobadores en ✅ → turno de Paco en la cola → «publica».
12. Lista «Terminado» de `PROTOCOLO.md` comprobada (Explorar, indexación, Metricool, registro).
13. Coste y tiempo reales en `plan.md` y en `docs/paises/<pais>.md`; ajustar la tabla de costes de `PROTOCOLO.md`; pasar a `PROTOCOLO.md` lo aprendido de `MEJORAS.md`.
14. Liberar en `reparto.md` lo asignado → **archivar el chat del país** (no se borra).

### Informe semanal (lunes, 0 €)
1. `git fetch origin main`; leer el tablón.
2. Sacar los números de `informe-semanal.md` (Search Console, YouTube Studio, TikTok Studio, Metricool, Explorar, registros, Analytics), siempre en solo lectura.
3. Escribir `docs/estrategia/informes/AAAA-MM-DD.md` con la forma fija (diez líneas).
4. Comparar con el plan: ¿el lote va en fecha y en presupuesto? ¿se indexa el país en curso?
5. Si algo pide cambiar el plan: **una** propuesta a Paco, con su porqué.
6. Commit solo del informe: «[estrategia] Informe semanal …».

## 5 · Estado ahora (5 nov 2026)
| Qué | Estado |
|---|---|
| Plan de 3 meses (Filipinas dic, Nepal ene, Tailandia feb) | Propuesta en `docs/estrategia/plan.md` · espera a Paco |
| Lote 1 · Filipinas | Propuesto en `plan.md` · espera aprobación y presupuesto |
| Informe semanal | Propuesto · primero el lun 9 nov; falta saber si Paco deja leer los paneles en su Chrome o manda capturas |
| Chats de país · «Antes de abrir el primero» | 1 · datos de la web por país (🌍 Web): **hecho** (5 nov, `scripts/paises/<país>/`) · 2 · motor en un worktree (🎬 Vídeo): encargado · 3 · `MEJORAS.md`, plantilla, `/pais` y este protocolo (📈): **hecho** (5 nov) |
| Reparto de lo compartido | `docs/estrategia/reparto.md` (países, Metricool, tanda de Google, presupuesto, cola de revisiones) |
