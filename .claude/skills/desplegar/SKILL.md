---
name: desplegar
description: Checklist de despliegue de Borrado del Mapa (frontend + Worker) en orden — versiones ?v=, push, comprobar Pages, wrangler deploy -c, /version, prueba de Paco. Usar SOLO al subir cambios a producción.
---

# Checklist de despliegue — SIEMPRE EN ESTE ORDEN

Antes: `git fetch origin main` y `git log --oneline HEAD..origin/main` (si hay commits ajenos, PARAR: protocolo §1B).
Si el cambio toca una API de pago, decírselo a Paco antes (§8).

1. Subir versión `?v=` en `index.html` de **cada** `.js` modificado (si no, el navegador sirve el viejo aunque el
   fichero esté subido). Los 19 scripts locales llevan `?v=`; ninguno debe quedarse sin él. Si se toca `styles.css`
   o `destinos.css`, subir también `APP_CSS_V`/`DESTINOS_CSS_V` en `scripts/build-destinos.js` y el `?v=` en blog y legal (§9).
2. `git add` + `commit` (español, corto, claro) + `git push`.
3. Comprobar que la web sirve la versión nueva (GitHub Pages tarda 45 s – varios minutos):
   `curl.exe -s https://borradodelmapa.com/index.html | Select-String '\.js\?v='`
4. Worker (solo si cambió `worker/`): `cd C:\Users\User\Desktop\salma\worker; npx wrangler deploy -c wrangler.toml`
   — **siempre con `-c`** (el `wrangler.jsonc` de la raíz se coge por error sin él). PowerShell no tiene `&&`: usar `;`.
   **Alternativa desde el móvil (sin terminal), Cloudflare Workers Builds (montado 11 sept 2026):** el Worker
   `salma-api` tiene el repo conectado (dashboard → salma-api → Settings → Builds). Cualquier commit directo a
   `main` (editando un fichero desde github.com) dispara build + deploy automático con
   `npx wrangler deploy -c wrangler.toml`, **Directorio raíz = `worker`**. No sustituye el paso 1 ni el 6.
5. Comprobar que corre el Worker que crees: el `Current Version ID` del deploy = el de
   `curl.exe -s https://salma-api.borradodelmapa-api.workers.dev/version` (con `curl.exe`; `curl` a secas es Invoke-WebRequest).
6. **Paco prueba en la app.** Hasta aquí no está terminado. Nunca decir "arreglado": decir *"desplegado — dime qué ves"*.
   Duda de caché → panel 🐛 → cabecera dorada (Version ID del Worker + `?v=` de cada script).
7. Anotar: `node scripts/casos.cjs version "qué se subió" <ids de casos>`.

Si algo se rompe: volver atrás con un commit nuevo (`git restore --source=<commit> --worktree --staged .`), tag de
salvaguarda antes, nunca reescribir historia. NUNCA borrar el Worker (§5).
