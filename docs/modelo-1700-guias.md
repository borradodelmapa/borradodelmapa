# Modelo para hacer las ~1.700 guías: lo que YA está mecanizado (20 oct 2026)

Corrección: la versión anterior de este documento proponía rediseñar el proceso. **No.** El modelo es el que ya existe y funcionó con las 11 guías de Nepal y Barcelona. Esto lo explica y dice qué falta para escalarlo.

## El proceso mecanizado, en dos tramos que encajan

### Tramo A — de un país a sus guías (existe desde septiembre)
`node scripts/progressive-load.js --country <código>` (o `--count 5`, que elige países sin rutas por prioridad). Por país hace, en orden:
1. **Nivel 2**: los ~10 destinos del país (`worker/kv/generate-nivel2.js`) si no existen.
2. **Nivel 3**: la **ruta completa de cada destino** (`worker/kv/generate-nivel3.js --country <código> --max 10`, con Claude Sonnet 4.6, hasta 6.000 tokens por ruta) → `worker/kv/routes-nivel3/<destino>-<país>.json`.
3. **HTML** de las páginas de destino (`scripts/build-destinos.js --country`).
4. **Publicar en Firestore** como guía pública de Salma (`scripts/publish-destinos-salma.js`) → es lo que abre «Abrir la guía» en la app.
5. **Sitemap** y **subir rutas a KV**.

### Tramo B — de una guía a una página buena y publicada (hecho el 19 oct)
`node scripts/abrir-tanda.cjs <slug…>` (tope 30 por tanda; se para si algo falla):
1. Solo entra lo que tiene guía.
2. Fotos libres de Wikimedia con crédito (`fotos-destinos.cjs`, regla en `limpiar-fotos.cjs`).
3. Genera solo esas páginas (`build-destinos.js --only`).
4. **Verificador** (`verificar-destinos.cjs`): página, datos para Google, fotos, que la guía pública exista y sus paradas encuentren fotos.
5. Hoja de fotos para mirar 30 s.
6. `--confirmar` → commit + push → verificar contra la web → Paco lo ve → Search Console.

## Para escalar a las ~1.700
Solo **12 de las ~1.630 fichas de destino tienen ruta (nivel 3)**. Lo que falta es el tramo A para el resto:
- Ejecutar el tramo A **país a país** (empezando por los que más se buscan; 30 países aún sin nivel 2) y el tramo B **por tandas de 30**.
- Siempre: **medir el coste con UNA guía antes de lanzar** y decirlo a Paco (§8). El script de rutas usa Sonnet 4.6 (`docs/kv.md` aún dice GPT-4o-mini a ≈ 0,06 $: revisar cuál es la real). Estimación a medir: del orden de 0,1 $ por ruta, ≈ 170 $ para 1.700. La verificación con Google no está medida.
- Todo en `noindex` hasta confirmar cada tanda.

## Lo que hay que añadir al proceso (no rediseñarlo)
1. **Controles nuevos en el verificador** para los fallos vistos en Chitwan: paradas con el **mismo punto o el mismo nombre**, parada lejos del destino, título que no coincide con el texto. Solo **leen y rechazan**; nunca editan datos de Google.
2. **Ficha de lugar** (esencia, historia, experiencias… con fuente) como **paso opcional** del tramo B, con `ficha.json` generado desde Wikipedia/Wikivoyage (solo con fuente; vacío antes que inventado). Hoy solo existe la de Chitwan, hecha a mano.
3. Arreglar el **presupuesto «18-54 €» por defecto** antes de abrir más páginas (caso `p-mvgqxhpn3d4`).

## Reglas
La verificación de Google (coordenadas, `place_id`, «Cómo llegar», mapa) **no se toca nunca**. Todo real y con fuente. Un cambio, una prueba, Paco lo ve. Ver `docs/traspaso-guias-calidad.md`.
