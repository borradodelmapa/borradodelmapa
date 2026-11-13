# PROTOCOLO DE UN PAÍS — parte web (chat 1 · Guías y SEO)

Nació con el piloto de Filipinas (4 nov 2026). Vídeo y blog: `docs/video-checklist.md` (chat 2). Regla: L2 (se trabaja por países).
⏸ = se para y espera el OK de Paco. Coste: se dice antes (§8). Todo lo demás, 0 €.

## Pasos
1. **Expediente** (`docs/paises/PLANTILLA-expediente.md` → `<pais>-expediente.md`): 8 apartados, cada dato con fuente, ⚠ lo dudoso. ⏸
2. **Guía(s)**: `probar-chat.cjs` → `crear-guia.cjs "<País>"` (destino = el PAÍS, no una región: caso p-mw2gxtxbpmq) → revisar los textos contra el expediente y el blog (edad, cierres, nombres) y corregir el JSON → `guardar-guia.cjs` ⏸ → `publicar-guia.cjs`. **~0,4-1 € por guía de 3-5 días.**
3. **Página del país**: `scripts/paises/<país>/intro.json` (hilo, 6 apartados, foto solo si es de lo que se cuenta, galería de 6, diarios del blog, fuentes). Las guías destacadas con mapa salen solas de `guias-por-pais.json`.
4. **Destinos del país**:
   - Portada: `fotos-destinos.cjs <slugs>` → **revisar cada foto a ojo** → cambiar las malas por un archivo concreto de Commons.
   - Fotos de «Qué hacer»: 3 candidatas por actividad → hoja de contactos → elegir; sin foto si ninguna es del sitio.
   - `scripts/paises/<país>/sitios-extra.json`: «Sobre…» (texto propio con fuentes), `aviso` (datos que han cambiado, con fuente), `diario` (entrada del blog).
5. `node scripts/build-destinos.js --country <cc>` → probar en local (móvil y escritorio) → `comprobar-nada-atras.cjs` ✅ ⏸ → push → comprobar que la web lo sirve
   (si GitHub Pages se atasca, «in progress deployment»: un commit vacío lo relanza).
6. **Blog** (chat 2): una entrada por guía + enlaces cruzados destino ↔ entrada (solo a entradas publicadas).
7. **Tanda a Google**: `abrir-tanda.cjs` cuando Search Console esté dado de alta.

## Fichas y tips (13 nov 2026, tras revisar Nepal)
- Las fichas antiguas del KV pueden llevar datos falsos y frases rotas: se corrigen en `scripts/paises/<país>/sitios-extra.json` → `ficha` (campo a campo), `faqs`, `sobre: true` (pinta el «Sobre…» también en sitios con guía) y `tip`. El KV no se toca.
- **Tip de Salma: verificado o no sale** (regla de Paco). Dato con fuente enlazada en la página, o viaje real de Paco. Sin primera persona inventada.

## Tiempos del piloto (Filipinas, 4 nov 2026)
Expediente ~45 min · guía ~15 min (+ fallo del Worker) · página del país y su diseño ~1 h · 10 destinos (fotos, textos, diseño) ~45 min · atasco de Pages ~25 min.
Total ~3 h de reloj con las revisiones de Paco. **Coste: ~0,40 €** (la guía).

## Para que el siguiente país vaya más rápido
- Pasar a `scripts/` las herramientas que se hicieron sobre la marcha (candidatas de fotos por actividad, hoja de contactos, poner portada a mano).
- El diseño ya está hecho: en el siguiente país solo hay datos (expediente, textos y fotos). Estimación: **~1-1,5 h de trabajo + 2-3 revisiones de Paco de 10 min**.
- Los demás países con guías salen con el diseño nuevo al regenerarlos (`--country <cc>`); repasar antes su ficha (datos viejos sin fuente, como Sagada).
