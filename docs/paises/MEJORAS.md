# MEJORAS — lo que va aprendiendo cada país y cada tarea

Cada chat de país apunta aquí, al momento, lo que le costó, falló o se puede hacer mejor (una línea arriba del todo).
**Desde el 16 nov 2026 (Paco), también cada HECHO de Vídeo, Web y App:** la línea va en el mismo commit y el HECHO la cita («aprendido: …»; si no hubo nada, «nada nuevo»). En «País» va el país o el id de la tarea (T3.3…). Formato del HECHO: `docs/estrategia/protocolo-coordinacion.md` §2.
**No lo arregla él:** lo arregla la fábrica (🌍 Web o 🎬 Vídeo) o Estrategia lo pasa a `PROTOCOLO.md`.
Estrategia lo repasa cada semana con el informe y marca el estado.

| Fecha | País | Qué pasó / qué mejorar | Para | Estado |
|---|---|---|---|---|
| 16 nov 2026 | (generador) | Las fuentes de «Conoce <país>» se copiaban a mano en intro.json → ahora salen del expediente (`f: [1, 3]` en cada apartado, `scripts/expediente.cjs`) y `comprobar-pais.cjs` vigila citas rotas y expediente cambiado después del resumen. Hecho en Nepal y Filipinas | 🌍 Web | ✅ hecho |
| 16 nov 2026 | (comprobador) | India no tiene datos de destinos (`worker/kv/output-nivel2/in.json`): sin página de país ni de sus sitios, aunque tiene historias y vídeo. Lo destapó `comprobar-pais.cjs in` | 📈 decide · 🌍 Web | pendiente |
| 16 nov 2026 | (comprobador) | La lista «Terminado» se revisaba a ojo → `node scripts/comprobar-pais.cjs <código>` la mira sola (0 €) | 🌍 Web | ✅ hecho (1e1d9dbc3) |
| 16 nov 2026 | T3.3 muay thai | Un vídeo de 46 MB colgó el `git push` («remote end hung up»): subir primero las páginas y luego el vídeo en otro commit, con `-c http.version=HTTP/1.1 -c http.postBuffer=1048576000` | todos | apuntado |
| 16 nov 2026 | T3.3 muay thai | Editar `historias.js` con un script lo dejó en CRLF: los scripts que lo reescriben deben respetar los finales de línea | 🌍 Web | regla vigente |
| 15 nov 2026 | Nepal (fichas) | «Revisado en… · N fuentes» solo cubre las preguntas frecuentes; el resto de la página del sitio sigue saliendo de los datos de abril, sin fuente. Falta que el expediente y las fichas lleguen solos a la página | 🌍 Web · 📱 App | pendiente |
| 15 nov 2026 | India | Los autores de las fotos no salían nunca (entrada con `creditosExtra` sin `creditosDe`) | 🌍 Web | ✅ arreglado |
| 14 nov 2026 | Tuvalu / Filipinas | La Web Story solo admite fotos que estén en el artículo: elegir las de las slides entre las de la entrada | 🌍 Web | regla vigente |
| 13 nov 2026 | Y15 carátulas | El generador pisó 3 carátulas que otro chat había cambiado a mano → `caratula: 'web'` usa la ya publicada. Lo que sale de un generador no se cambia a mano | 🌍 🎬 | ✅ arreglado + regla |
| 13 nov 2026 | Y15 carátulas | En los móviles seguían las carátulas viejas: el service worker guarda las imágenes → cada imagen con `?v=<huella>` (`vUrl`/`portadaDe` de `scripts/video-info.cjs`) | 🌍 Web | ✅ arreglado |
| 13 nov 2026 | (generador) | `build-destinos.js` con una opción desconocida regeneraba las 1.793 páginas, y con errores dejaba índice y sitemap a medias → ahora rechaza opciones desconocidas y con errores no toca índice ni sitemap | 🌍 Web | ✅ arreglado |
| 5 nov 2026 | Filipinas (piloto) | Las guías de varias zonas perdían paradas por el radio del Worker | 📱 App | ✅ arreglado (Worker 69b021be) |
| 5 nov 2026 | Filipinas (piloto) | Herramientas hechas sobre la marcha (candidatas de fotos por actividad, hoja de contactos, portada a mano) sin pasar a `scripts/` | 🌍 Web | ✅ hecho 16 nov: `scripts/fotos-sitio.cjs` |
| 5 nov 2026 | Filipinas (piloto) | Wikimedia cuela fotos de otros sitios con el mismo nombre (volcán Batok de Indonesia): revisar una a una (F9) | 🎬 🌍 | regla vigente |
| 5 nov 2026 | Filipinas (piloto) | GitHub Pages se atasca a veces («in progress deployment»): un commit vacío lo relanza | todos | apuntado |
