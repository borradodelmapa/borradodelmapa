# ESTILO VISUAL «BORRADO DEL MAPA» — BIBLIA v1 (propuesta, 15 oct 2026; será el estilo de la serie a largo plazo)
Pedido de Paco: combinar planos generales, medios y cortos para guiar la atención; ritmo dinámico y estructura narrativa; cambiar de plano por significado (no al azar), usando la escala de cada encuadre; look cinematográfico tipo Kodak; si faltan planos detalle, buscarlos (ElevenLabs/ElevenCreative).

## 1. Gramática de escalas
GP gran plano/plano general (sitúa) · PM plano medio (sujeto/acción) · PP primer plano (emoción, cara) · D detalle (significado: manos, cuerda, rosario, textura).
- Cada bloque narrativo: GP → PM → PP → D para presentar; el camino inverso para cerrar/resolver. Se corta cuando la voz cambia de idea (la escala responde al significado), nunca por reloj.
- No cortar entre dos planos de la misma escala salvo corte «en acción» (match cut). Máx. 2 detalles seguidos.
- Duración orientativa: GP 3-4 s · PM 2-3 s · PP 1,5-2 s · D 0,8-1,5 s. Gancho: PP/D rápidos (0,4-0,6 s). Emoción: aguantar 4-5 s.
- Palabra clave de la voz = inserto de detalle o cifra grande. Golpe de sonido solo en cambios de escala fuertes (no en todos los cortes).
- Estructura del vídeo: gancho → situar (GP) → desarrollo alternando escalas → pico (plano largo) → ficha (ritmo rápido) → cierre (GP lento) → tarjeta.
## 2. Look «Kodak» (ver `salma marketing/editor/looks/looks-kodak.jpg`)
- PORTRA (día/exterior/piel natural): curva suave, blancos cálidos, grano fino, viñeta ligera. → looks por defecto de viajes.
- VISION3 500T (noche/interior/ring): sombras algo frías, altas luces cálidas, HALACIÓN roja sutil, grano algo mayor.
- TRI-X (B/N): reservado a historia/leyendas/recuerdo (p. ej. el bloque «Muay Boran» del especial).
Siempre sutil: la compresión de TikTok/YouTube se come el grano; no usar teal-orange exagerado; un mismo look en todo el vídeo (coherencia). Se aplica al final de la cadena de imagen, antes de textos y subtítulos.
## 3. Banco de detalles (prioridad de fuentes)
1º material propio de Paco (móvil/Canon; manos, cuerdas, texturas, comida, humo) buscado por hoja de contacto · 2º stock libre comprobado · 3º IA (ElevenCreative): SOLO detalles abstractos (humo, cuerda, hojas), NUNCA personas ni hechos reales, siempre etiquetado «ilustración IA». «ElevenUp» no existe: se asume ElevenCreative (ElevenLabs), sin probar aún (coste en créditos).
- Protocolo de rodaje «3 tamaños»: en cada lugar, 1 general + 1 medio + 3 detalles (8-10 s cada uno).
## 4. Implementación pendiente en el editor
Etiquetas de escala por plano (`#GP #PM #PP #D`, o inferidas de `@cx,cy,h`), duración por defecto según escala, avisos (misma escala seguida, 3 detalles seguidos, imágenes repetidas), presets `look:'portra'|'vision3'|'trix'` y B/N por bloque (`lookBloque`).
