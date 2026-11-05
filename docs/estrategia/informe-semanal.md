# INFORME SEMANAL (📈 Estrategia) — propuesta del 5 nov 2026

**0 €.** Cada lunes. Una página, diez líneas, una decisión como mucho.
Se guarda en `docs/estrategia/informes/AAAA-MM-DD.md`. Solo lectura: no se toca nada en ningún panel.
Lo que es del canal en detalle (cada vídeo a 48 h y 7 días) sigue en `docs/metricas-canal.md` (Vídeo, regla Y16 propuesta); aquí va solo el resumen.

## Los números (y de dónde salen)
| # | Número | De dónde | Cómo lo saca Estrategia |
|---|---|---|---|
| 1 | Páginas indexadas, impresiones, clics (semana y total) | Search Console | Leyendo la página en el Chrome de Paco, solo lectura; o una captura de Paco |
| 2 | Las 5 búsquedas que más traen y las 5 páginas con más impresiones | Search Console → Rendimiento | Igual |
| 3 | ¿Se indexan las páginas del país en curso? (Filipinas: 14) | Search Console → Inspección / Páginas | Igual |
| 4 | Suscriptores de YouTube (total y +semana) y el vídeo que más trajo | YouTube Studio | Chrome de Paco, solo lectura |
| 5 | % «lo vieron» y retención a 20 s del mejor y del peor short | YouTube Studio | Igual |
| 6 | Seguidores y vídeo con más vistas en TikTok | TikTok Studio | Igual |
| 7 | Qué salió de verdad esta semana y qué sale la próxima | Metricool | Con su conector (lectura) |
| 8 | Guías y países en Explorar (hoy 41 en 13 + Luzón norte) | `GET /explorar` del Worker | `curl.exe -s https://salma-api.borradodelmapa-api.workers.dev/explorar`. Lee la caché; si ha caducado, el Worker la rehace y puede buscar alguna miniatura que falte (céntimos de Google como mucho) |
| 9 | Registros nuevos en la app (semana) | Panel admin | Paco copia la cifra (10 s). Estrategia no usa `ADMIN_TOKEN` |
| 10 | Visitas a la web (semana) | Google Analytics | Chrome de Paco, solo lectura |

## Forma del informe
```
SEMANA del <lunes> · <país en curso>
Google:     <indexadas> páginas (+N) · <impresiones> imp · <clics> clics · mejor búsqueda: «…»
YouTube:    <subs> (+N) · mejor vídeo: «…» (X % lo vieron, Y % a 20 s)
TikTok:     <seguidores> (+N) · mejor vídeo: «…»
Explorar:   <guías> guías en <países> países (+N)
Registros:  <N> esta semana
Plan:       ✅ en fecha / ⚠ <qué se retrasa y cuánto>
Decisión:   <una, si hace falta> 
```

## Lo que hace falta para empezar (una vez)
- Paco: decir si Estrategia puede leer Search Console, YouTube Studio, TikTok Studio y Analytics en su Chrome (solo lectura) o si prefiere mandar capturas.
- Paco: la cifra de registros del panel admin cada lunes, hasta que App ponga ese número en un sitio que se pueda leer sin la llave de admin (sería un caso para App, con su OK).
- Primer informe: lunes 9 nov 2026.
