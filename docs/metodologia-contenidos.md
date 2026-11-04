# METODOLOGÍA DE CONTENIDOS — guía + vídeo + blog + SEO + redes, de un destino a los 1.793

**Estado: BORRADOR del 4 nov 2026 (chat 1 · Guías y SEO), para que Paco lo corrija. No cambia nada ni gasta nada.**
Paco (4 nov): «ha de estar todo unido: guías, vídeos, SEO para las publicaciones… aprovechar el flujo que ya hay en la creación
de vídeos pero mejorarlo, y por último automatizarlo para crear contenido de los 1.700 destinos, con entradas que hagan crecer y especializarnos».
Lo de vídeo lo manda `docs/video-checklist.md`; la parrilla, `docs/programacion-canal.md` (chat 2). Este archivo une las piezas.

## 1 · La idea en una frase
**Se investiga UNA vez por destino y todo sale de ahí**: la página del destino, la guía, las entradas del blog, el guion del vídeo,
la descripción de YouTube y los textos de redes leen el mismo **expediente** (datos con fuente). Hoy cada pieza investiga por su cuenta.

## 2 · Cómo se organiza la web (lo que Google tiene que ver)
Cada destino es un **núcleo** con piezas alrededor que se enlazan entre sí (en SEO se llama «pilar y grupo»):
| Pieza | Qué es | Búsqueda que ataca (una por pieza, sin pisarse) | Ya existe |
|---|---|---|---|
| **Página del destino** (pilar) | `destinos/<x>.html`: qué es, historia, culturas, cuándo ir, presupuesto, cómo visitar con respeto, la guía, los vídeos y las entradas | «viajar a X», «qué ver en X» | sí (`build-destinos.js`), falta historia/cultura |
| **Guía** | La ruta de la app, completa en su página pública | «X en N días», «ruta por X» | sí (`probar-chat` → `crear-guia` → `guardar` → `publicar`) |
| **Entrada temática** | Un pueblo, un oficio, una fiesta, un deporte tradicional, una historia | «los kalash», «fiesta Chilam Joshi» | sí, solo si hay vídeo (`build-blog-viajes.js`, P12) |
| **Vídeo** (short / largo) | Episodio de serie o documental | la misma búsqueda que su entrada (Y2) | sí (motor + editor) |
Regla: **toda pieza enlaza a su pilar y el pilar enlaza a todas**. Una entrada sin vídeo vale (crece la web sin esperar al montaje); el vídeo llega después y se incrusta.

## 3 · El expediente del destino (la pieza nueva)
Un fichero de datos por destino (p. ej. `contenidos/<pais>/<destino>.json`, sin decidir), con **fuente y fecha en cada dato** (F4, P9):
historia breve · pueblos y lenguas · oficios · fiestas (mes a mes) · deporte o juego tradicional · cómo visitar con respeto
(fotos, ropa, regalos, qué no hacer) · datos prácticos (visado, precios, cómo llegar) · búsquedas investigadas (Y2) · temas posibles
de entradas y vídeos · fotos libres ya revisadas (F9). **Parte de lo que ya hay**: KV nivel 2 (ficha del destino), `route.guia_extra`
(intro, «Antes de ir», FAQ), `docs/serie-*.md` y las fuentes de cada episodio. No se escribe un generador nuevo: se amplían los actuales.

## 4 · Los dos flujos
**A · Con vídeo (el de hoy, ampliado).** Al «★ Exportar para publicar», `publicar-episodio.cjs` además:
1. comprueba que el destino tiene guía (si no, propone crearla diciendo el coste ⏸);
2. añade al expediente lo investigado para el episodio y regenera la página del destino con el vídeo incrustado;
3. hace la entrada del blog (P12) enlazada al pilar y a la guía;
4. prepara el SEO de YouTube (Y2-Y9) **con la misma búsqueda** que la entrada, y el paquete de redes (P6);
5. lista lo que hay que subir y pasa los comprobadores ⏸.

**B · Sin vídeo (los 1.793, por tandas).** Por cada destino de la tanda: expediente → guía → página del destino ampliada →
1-3 entradas temáticas → comprobadores → hoja de revisión para Paco ⏸ → se abre a Google (máx. 30 páginas por tanda, `abrir-tanda.cjs`).
Cuando un destino del flujo B recibe vídeo, entra por el A y reutiliza su expediente (el guion ya tiene fuentes).

## 5 · Calidad: una sola checklist, comprobada por máquina
Igual que la de vídeo: reglas con ID y un comprobador que pone ❌. Propuesta: **sección nueva «W · Web y SEO»** en `docs/video-checklist.md`
(que pasaría a ser la checklist de contenidos) o un archivo hermano; **decide Paco**. Ejemplos de reglas: una búsqueda por pieza, título ≤ 60,
descripción sin texto del chat, enlaces pilar ↔ piezas, datos con fuente y fecha, nunca «IA» en los textos (P1), fotos con autor (P2).
Comprobador: ampliar `verificar-destinos.cjs` / `comprobar-nada-atras.cjs`, no escribir otro.
Fallo real que ya cazaría: la guía de Tailandia sale en Google con «Tienes razón, Paco: el plan estaba bien de 20 días…» como descripción.

## 6 · Programación (web y canal a la vez)
- La guía y la página del destino salen **al menos una semana antes** que su vídeo, para que el vídeo enlace a algo ya indexado.
- Orden de destinos: primero los de los próximos vídeos (Pueblos T2 desde el 8 dic: Pakistán, Malasia, Nepal, Filipinas, Indonesia, Taiwán,
  China, India; largos: tatuajes, luchas tradicionales), después por búsquedas (Search Console) y región.
- Ritmo del flujo B: una tanda cada 2-3 semanas mientras Google la indexe (`docs/seo-plan-minimo.md`); se acelera cuando haya datos.

## 7 · Coste a ojo (se mide con UN destino antes de decidir, §8)
Por destino con flujo B: expediente (Claude) ~0,05-0,20 € · guía 0,5-1,5 € (Claude + Google, con reintentos) · 1-3 entradas ~0,05-0,30 €
→ **~0,6-2 € por destino**. Los 1.793 completos: **~1.100-3.600 €**. Formas de bajarlo: guías cortas (2-3 días) en destinos pequeños,
caché de sitios ya verificados en Google, y guía completa solo para los destinos con búsquedas. Vídeo aparte (voz ElevenLabs, F5).

## 8 · Fases
1. **Ahora:** cerrar esta metodología con Paco (y con el chat 2 para la parte de vídeo).
2. **Piloto:** un destino de T2 entero por el flujo A (propuesta: los kalash, Pakistán, 8 dic). Pakistán no tiene página de destino:
   sirve también para probar el expediente desde cero.
3. **Piloto del flujo B:** 3 destinos sin vídeo, medir coste y calidad.
4. **Automatizar** lo que el piloto confirme y abrir tandas.

## 9 · Lo que tiene que decidir Paco
1. ¿Vale «un expediente por destino del que sale todo»?
2. ¿Entradas del blog **sin vídeo** sí (para crecer más rápido) o solo con vídeo?
3. ¿Checklist única de contenidos (vídeo + web) o dos archivos?
4. ¿Piloto con los kalash?
5. **Search Console sin dar de alta** (4 nov): sin él no se puede medir nada de esto.
