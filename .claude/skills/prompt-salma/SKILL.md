---
name: prompt-salma
description: Protocolo obligatorio para tocar el prompt de sistema de Salma (BLOQUE_*, SALMA_SYSTEM_*, WHATSAPP_SYSTEM_CHAT) — un cambio cada vez, tag, texto exacto, OK, prueba. Usar antes de editar cualquier texto del prompt.
---

# Tocar el prompt de Salma — paso a paso, sin excepciones

Paco (21 sept 2026): "esto en su día dio muchísimos problemas en abril… no quiero ni por asomo que vuelvas a
liarme." En abril y el 5 sept se encadenaron cambios sin verificar y no se sabía cuál causaba qué.

- El prompt **solo se toca desde el código, con Claude Code**; nunca desde herramientas web/admin (se borraron
  `admin.html` y 6 endpoints por eso).
- No tocar nada hasta que Paco diga "empezamos". Antes: tag `git tag v-pre-prompt-<fecha>`.
- **UN cambio cada vez, solo texto** (sin código en el mismo commit). Por cada cambio: texto exacto antes/después →
  OK expreso de Paco → aplicar y desplegar (skill `desplegar`, comprobar `/version`) → UN mensaje de prueba →
  esperar lo que Paco ve → siguiente.
- **Buscar contradicciones entre bloques** antes de tocar (§6): el prompt tuvo tres instrucciones distintas pidiendo
  el plan completo en el chat *y* en el JSON. Los bloques son 12 (`BLOQUE_IDENTIDAD` … `BLOQUE_FORMATO_PLAN`) y
  3 prompts ensamblados (`SALMA_SYSTEM_CHAT/PLAN/ROUTE`); detalle en `docs/salma-ia.md`.
- WhatsApp reutiliza los bloques de la web tal cual (`BLOQUE_ACCION` completo); nunca redacción propia. Tras
  cualquier cambio, comprobar en runtime que `BLOQUE_ACCION` y los 3 prompts de la web no cambian salvo lo pedido.
- Orden de menos a más delicado; si algo sale raro, revertir SOLO ese cambio con un commit nuevo.
- **Coste (§8):** cada cambio deja fría la caché una vez (~0,01 € por despliegue) — avisar.
- Batería de prueba acordada: visado Vietnam, ferry Koh Samui→Bangkok, farmacia cerca mía, 3 días en Ronda,
  guía Estepona 1 día (botón), edición con guía abierta ("quiero ir también a la playa"), foto de monumento, tiempo hoy.
- Estado del saneado (estudio del 21 sept, A-G): ver `CLAUDE-historial.md` (buscar "SANEAR EL PROMPT"). Los 5
  cambios pequeños (E, D, F, C, B) ya están hechos; A y Geografía, solo si Paco lo pide.
