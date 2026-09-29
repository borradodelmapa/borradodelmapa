# Design system y UI actual

> Reescrito el 29 sept 2026 (sesión de diseño UX, caso 14) a partir de `styles.css` y del código real: la versión
> anterior describía el diseño viejo (dorado #f0b429, Bebas Neue, radio 14 px) que ya no existe.
> Versión anterior: `git show v-29sept-antes-tu-mundo-app:docs/ui-design.md`.

## Design System (styles.css, `:root`)

Rediseño "viajero real" (doc 8 sept 2026): **un solo acento naranja, todo lo demás en grises, radio 0 en todo.**
Referencia: Lonely Planet × Gaia GPS × extracto de reserva. Contraste alto para leer a pleno sol.

### Tokens nuevos (usar estos en código nuevo)
```css
--bg-base: #0D0F10;        /* fondo de pantalla */
--bg-row: #17191B;         /* fondo de fila/bloque/tarjeta */
--bg-row-alt: #131516;     /* fila alterna */
--border: #2B2E30;         /* bordes y divisores */
--border-subtle: #1C1E20;  /* divisores entre filas de una lista */
--accent: #F4630B;         /* ÚNICO acento: CTA, cifras, icono activo, pestaña activa */
--text-primary: #ECEBE8;
--text-secondary: #C4C7C9;
--text-muted: #7E8285;
--text-on-accent: #0D0F10; /* texto sobre naranja */
--font-cond: 'Barlow Condensed'; /* titulares, cifras, botones, marca — en MAYÚSCULAS */
--font-body: 'Inter';            /* texto corrido */
```
### Tokens viejos (siguen existiendo, ya APUNTAN al sistema nuevo)
`--negro` #0D0F10 · `--dorado` #F4630B (¡es el naranja!) · `--crema` #ECEBE8 · `--gris` #17191B ·
`--font-display`/`--font-tight`/`--font-mono` = Barlow Condensed · `--radius*` = 0. No usarlos en código nuevo.

### Reglas de estilo (acordadas con Paco)
- **Botones:** Barlow Condensed 700, mayúsculas, `letter-spacing:.05–.08em`, alto mínimo 44 px. Principal = fondo
  naranja + texto `--text-on-accent`; secundario = transparente con borde `--border`.
- **Iconos:** de línea (SVG, `stroke-width:2`, `currentColor`), como los del menú de abajo. **Cero emojis en
  botones** (29 sept 2026). Las banderas de país sí (son contenido).
- **Títulos de pantalla:** Barlow 800 grande en mayúsculas, con la palabra clave en naranja (`TU <span>MUNDO</span>`).
- **Tarjetas/filas:** fondo `--bg-row`, borde `--border`; las que llevan a algo, con borde izquierdo naranja de 3 px
  y flecha `→` naranja a la derecha (franja de Tu mundo, "Tu vídeo ya está montado").
- **Pestañas:** texto Barlow mayúsculas en `--text-muted`; la activa en `--text-primary` con raya naranja de 3 px abajo.
- Marca: `✦ BORRADO<span>DEL</span>MAPA` (DEL en naranja).
- Cada pantalla nueva: sin estilos propios sueltos; si necesita CSS, su propio fichero con `?v=` en index.html
  (`tu-mundo.css`, `fotos-viaje.css`) usando estos tokens.

### Estructura fija
- **Menú de abajo** (`app.js:updateBottomBar()`, 56 px): `Mapa · Explorar · (SALMA, botón central redondo) ·
  Mis Viajes · Perfil/Entrar`. ⚠️ CLAUDE.md §9: vive también en `build-destinos.js`, `404.html`, blog y legal.
- Botón fijo arriba a la derecha **"✦ Ayuda Salma"** (formulario de fallos/ideas) en chat, Mis Viajes y Perfil.
- `.app-content` con `padding-bottom:80px`; `.app-input-bar` (cuadro de texto) solo en el chat.

---

## Mapa de pantallas (29 sept 2026)

| Pantalla | Cómo se llega | Qué tiene |
|---|---|---|
| **Portada / chat** (`chat`) | Botón central SALMA | Reloj y tiempo, eslogan "Sin mapa, con rumbo", ejemplos rotando, "Trazar ruta" + billete (destino, días, "Afinar"). Con ruta activa, su tarjeta. Accesos: Cerca mía, Vuelos, Alojamiento, SOS, fila de WhatsApp; "Más opciones": Narrador, Últimas consultas, Mis notas, Alertas vuelos, Moneda, Traductor |
| **Mapa en vivo** | Pestaña Mapa (con cuenta) | Ruta activa, GPS, brújula, capas, tocar el mapa → **foto en ese punto** (va a la pestaña FOTOS de la ruta activa), SOS, 📚 Historia del lugar |
| **Vista de guía** (`#itin-view`) | Cualquier guía | Mapa arriba + pestañas **RUTA · FOTOS · VÍDEO · ÁLBUM** (las tres últimas solo en guías propias). Botones flotantes: Guardar, Compartir, Google Maps, GPX, Editar con Salma |
| → RUTA | | Tarjetas de paradas por día (carrusel en móvil), cerca de, info práctica, consejos, 👍/👎 |
| → FOTOS | | Todas las fotos del viaje por día; "Añadir fotos" (varias, a la nube); aviso de fotos que no parecen del viaje; visor. En móvil el mapa baja a 24vh |
| → VÍDEO / ÁLBUM | | Motor `viaje-fotos.html` en modo app (iframe): vídeo ya montado, "Crear el vídeo" (MP4), "Cambiar estilo"; álbum maquetado. El mapa se pliega. Aviso flotante "Vídeo 47 %" si sales |
| **Explorar** | Pestaña | Rutas de otros viajeros |
| **Mis Viajes** (`rutas`) | Pestaña (con cuenta) | Franja **Tu mundo** · fila **Fotos sin viaje** (si hay) · "+ Nueva guía" · guías (agrupadas por país si >5) · rutas guardadas |
| **Tu mundo** (`tu-mundo`) | Franja de Mis Viajes | Países y % del mundo, km, mapamundi, banderas, récords (casa = ciudad escrita), viajes por años, tarjeta para compartir |
| **Fotos sin viaje** (`fotos-sin-viaje`) | Fila de Mis Viajes | Fotos sin guía por días; elegir y "Pasar a un viaje" o quitar |
| **Perfil** | Pestaña | Plan · Viajes · Lo que Salma sabe de ti · Documentos del viajero · Contactos SOS · Mi plan · Compartir mis rutas · WhatsApp · cerrar sesión / borrar cuenta · legal |
| Notas, Alertas de vuelos, Consultas | "Más opciones" de la portada | — |

Quitado el 29 sept 2026: Galería, Cuaderno de viaje (bitácora/diario), vídeo viejo en la app, páginas beta sueltas
(`viaje-fotos.html` sin `?embed` → `/?go=rutas`; `tu-mundo.html` → `/?go=tu-mundo`).
Orden general pendiente (papel de cada pestaña, Notas/Alertas, entradas al formulario de fallos): caso p-mumybbb6xcg.
