# Borrado del Mapa — Instrucciones para Claude Code

## Qué es este proyecto
Borrado del Mapa (borradodelmapa.com) es una web de planificación de viajes con asistente IA llamada SALMA. El usuario descubre destinos, genera rutas y las guarda en su mapa personal.

## Stack
- Frontend: HTML/JS vanilla + Leaflet (mapa) + Firebase/Firestore
- IA: Cloudflare Worker → API Anthropic (Claude Sonnet 4.6)
- Repo: este repo contiene solo el frontend
- Worker: vive en Cloudflare, NO en este repo

## Archivos principales
- `index.html` — app principal (dashboard, mapa, login)
- `app.js` — lógica de la app (Firebase, rutas, UI)
- `salma-chat.js` — widget de chat que llama al Worker
- `styles.css` — estilos
- `utils.js` — utilidades compartidas
- `salma_ai_avatar.png` — avatar de Salma

## Worker (NO tocar desde aquí)
- URL: `salma-api.paco-defoto.workers.dev`
- Se despliega desde Cloudflare Dashboard (Quick Edit)
- Archivo referencia: `salma-worker-v1-final.js` (fuera de este repo)
- Acepta POST con: `{ message, history, current_route, nationality }`
- Devuelve: `{ reply, route }`
- `route` contiene SALMA_ROUTE_JSON para renderizar en el mapa

## Documento técnico de referencia
`documento-tecnico-salma-v2.txt` contiene toda la arquitectura, prompts, KV, flujos y fases. Consultarlo antes de cambios grandes.

## Normas de código
- **Nunca** `const db` duplicado
- **Nunca** API keys en código público
- **Nunca** `window.onload`
- **Siempre** revertir a versión estable antes de parchear
- **Commits en español**

## salma-chat.js — lo que debe saber Claude Code
- Llama al Worker con fetch POST
- Envía `message`, `history` (últimos 12 msgs), `current_route`
- Puede enviar `nationality` (leer de Firestore si el usuario tiene perfil) — pendiente de implementar
- Extrae `reply` (texto) y `route` (JSON) de la respuesta
- Si hay `route`, renderiza tarjetas y mapa con las paradas

## KV (Cloudflare)
- Binding: `SALMA_KV` (namespace por crear en Cloudflare)
- Si no existe, el Worker funciona sin contexto de destino
- Scripts de generación de datos en carpeta `salma-knowledge-base/` (fuera de este repo)
- Nivel 1: ficha país × 193 países (pendiente)
- Nivel 2: 10 destinos × 193 países (pendiente)
- Nivel 3: búsqueda web en vivo + caché (pendiente)

## Cambios UX pendientes (aplicar en bloque)
- Dashboard: cambiar "Mis rutas / Tus itinerarios de viaje" → "Mis viajes / Tus viajes"
- Home: cambiar "RUTAS CREADAS" → "VIAJES CREADOS"
- Contadores que crezcan en tiempo real según rutas de todos los usuarios
