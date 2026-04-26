# PROMPT PARA CLAUDE CODE - Salma Historiadora MVP

**Copia TODO esto y pégalo en Claude Code. Él sabrá qué hacer.**

---

## 🎯 TAREA PRINCIPAL

Implementar **Salma Historiadora** en Borrado del Mapa (MVP FASE 1-3).

Transformar la app de "planificador de viajes" a "planificador de viajes + historiador digital".

**Resultado final:** 3 pestañas funcionales (🗺️ VIAJES | 📚 HISTORIA | 💬 SALMA)

---

## 📚 DOCUMENTACIÓN TÉCNICA

**He preparado toda la documentación. Leer en este orden:**

1. **QUICK-START.md** — Resumen visual (2 min)
2. **BRIEF-SALMA-HISTORIADORA-V1.md** — Especificación completa
3. **CHECKLIST-ARCHIVOS.md** — Exactamente qué crear/modificar
4. **INSTRUCCIONES-CLAUDE-CODE.md** — Paso a paso detallado
5. **historias-init.json** — Datos de historias iniciales

**Los archivos están aquí. Puedes pedirme que los lea y continúe.**

---

## 🔧 STACK

- HTML/CSS/JS vanilla (sin frameworks)
- Firebase Firestore + Cloudflare KV
- Google Maps API (ya existe)
- Cloudflare Worker (extender, no quebrar)
- Mobile-first, responsive

---

## 🎯 OBJETIVOS DEL MVP

### ✅ Pestaña 📚 HISTORIA (Nueva)
- Listado de historias (Vietnam, Bangkok, Francia, Hanoi medieval, etc)
- Búsqueda por palabra clave
- Viaje temporal: navegar parada a parada por historia
- Timeline interactivo horizontal
- Documentos históricos (links)
- Personajes históricos para preguntar (integrar con Salma)
- Timeline compartible (Canvas → imagen para redes)

### ✅ Pestaña 💬 SALMA (Mejorada)
- Chat libre (mantener existente)
- **NUEVO:** Input voz (Web Speech API - SpeechRecognition)
- **NUEVO:** Output voz (SpeechSynthesis - Salma hablando)
- **NUEVO:** Imágenes contextuales mientras narra
- **NUEVO:** Sugerencias de historias cercanas (geolocalización)
- **NUEVO:** Modo Copilot (narración mientras caminas)

### ✅ Integración VIAJES + HISTORIA
- Ruta Híbrida: cuando creas parada en viaje, auto-linkea historia del lugar
- Filtro: "Ver todas las historias de mis paradas"
- El usuario viaja más informado

### ✅ Características extras
- Geolocalización: detecta ubicación, sugiere historias cercanas
- Timeline visual compartible (Instagram, Twitter, WhatsApp)
- Responsive en móvil (mobile-first)
- Sin quebrar código existente de viajes

---

## 📂 ARCHIVOS A CREAR

```
js/
├─ salma-historiadora.js           (400-500 líneas)
├─ salma-multimodal.js             (300-400 líneas)
├─ timeline-generator.js           (200-300 líneas)
└─ geolocalization.js              (150-200 líneas)

styles/
└─ historia.css                    (300-400 líneas)

views/historia/
├─ lista.html                      (100-150 líneas)
└─ viaje-temporal.html             (150-200 líneas)

data/
└─ historias-init.json             (estructura + 4 historias ejemplo)

worker/
└─ salma-worker-v2.js              (300-400 líneas)
```

---

## ✏️ ARCHIVOS A MODIFICAR

```
index.html         → Añadir pestaña 📚 HISTORIA al tab-bar
app.js             → Añadir router de 3 pestañas + inits
styles.css         → Import historia.css + variables de color
salma-chat.js      → Integrar multimodal (voz)
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

### SEMANA 1: SETUP (4 horas)
1. Leer documentación
2. Modificar index.html (tab-bar)
3. Modificar app.js (router)
4. Crear estructura carpetas
5. **COMMIT:** "Setup: Añadir pestaña 📚 HISTORIA (skeleton)"

### SEMANA 2-3: FRONTEND HISTORIA (8 horas)
1. Crear styles/historia.css
2. Crear views/historia/*.html
3. Crear js/salma-historiadora.js (búsqueda, viaje temporal)
4. Integrar en app.js
5. **COMMIT:** "Frontend: Implementar pestaña HISTORIA"

### SEMANA 3-4: MULTIMODAL + EXTRAS (4 horas)
1. Crear js/salma-multimodal.js (voz)
2. Crear js/geolocalization.js (ubicación)
3. Crear js/timeline-generator.js (Canvas)
4. Integrar en salma-chat.js
5. **COMMIT:** "Feature: Multimodal, geolocalización, timelines"

### SEMANA 4: TESTING & DEPLOY (2 horas)
1. Testing manual (desktop + móvil)
2. Lighthouse score > 80
3. Verificar: no quiebra viajes
4. Deploy a producción
5. **COMMIT:** "Deploy: MVP completado"

---

## 📝 DATOS INICIALES

**Historias incluidas en historias-init.json:**
1. Vietnam (1862-1975) — Colonialismo a independencia
2. Hanoi (1000-2000) — Fundación a hoy
3. Tailandia/Siam (1600-2000) — No colonizado
4. Francia (1789-1799) — Revolución Francesa

**Cada historia tiene:**
- Paradas temporales (años, eventos)
- Imágenes contextuales
- Documentos históricos (links)
- Personajes para preguntar
- Contenido narrativo de Salma

---

## 🔑 PUNTOS CRÍTICOS

### No quebrar código existente
- El módulo de VIAJES debe funcionar exactamente igual
- Usar NUEVO worker (v2), no modificar v1
- Nuevas tablas Firebase, no tocar existentes

### Mobile-first
- Responsive desde el inicio
- Testear en teléfono real
- Imágenes optimizadas

### System prompt de Salma
Actualizar para que funcione como historiadora ADEMÁS de asistente de viajes:
```
Eres Salma, historiadora + asistente de viajes.
Eres andaluza, amigable, entusiasta.
Puedes:
- Contar historias de épocas y lugares
- Aconsejar sobre viajes
- Responder cualquier pregunta
- Narrar en voz
- Mostrar imágenes mientras narra
```

### Colores para diferenciación
```
🗺️  VIAJES:    #D97706 (naranja/marrón)
📚 HISTORIA:   #2563EB (azul) + #F59E0B (dorado)
💬 SALMA:      #EC4899 (rosa/púrpura)
```

---

## 🎯 DEFINICIÓN DE ÉXITO (MVP Completado)

- [x] Pestaña 📚 HISTORIA completamente funcional
- [x] Búsqueda + viaje temporal + timeline
- [x] Salma con voz (Web Speech API)
- [x] Imágenes contextuales en chat
- [x] Geolocalización (historias cercanas)
- [x] Timeline compartible (redes)
- [x] Ruta Híbrida (historias en paradas de viajes)
- [x] Responsive en móvil
- [x] Sin errores en console
- [x] Código limpio, comentado, bien estructurado
- [x] Commits claros en Git
- [x] Documentación actualizada
- [x] **No quebra nada del código existente**

---

## 📞 CONTACTO & REFERENCIAS

**Owner:** Paco  
**Repo:** `github.com/borradodelmapa/borradodelmapa` (privado)  
**Stack original:** HTML/CSS/JS vanilla + Firebase + Cloudflare Worker  
**Documentos técnicos existentes:**
- `documento-tecnico-salma-v2.txt`
- `salma-worker-v1-final.js`
- `INFORME-FIXES-SALMA-WORKER-V2.md`

**Referencias de competencia:**
- Humy.ai (educativo, 1200+ figuras)
- Nibble (microlearning 10 min)
- Hello History (conversacional)
- Historica.org (mapas)

---

## 🚦 INSTRUCCIONES PARA CLAUDE CODE

**Lee la documentación en este orden:**

1. Pide que lea: **QUICK-START.md** (resumen 2 min)
2. Luego: **BRIEF-SALMA-HISTORIADORA-V1.md** (especificación)
3. Luego: **CHECKLIST-ARCHIVOS.md** (qué crear/modificar)
4. Luego: **INSTRUCCIONES-CLAUDE-CODE.md** (paso a paso DETALLADO)
5. Datos: **historias-init.json** (historias de ejemplo)

**Una vez leída la documentación:**

```
"Sigue INSTRUCCIONES-CLAUDE-CODE.md exactamente.
Implementa en el orden sugerido.
Haz commit después de cada sección.
Si hay duda, pregunta antes de continuar."
```

---

## ✨ BONUS: LO CHULO DEL PROYECTO

- **Diferenciador único:** Nadie hace "viajes en tiempo" + "voz" + "en un lugar real"
- **Salma como marca:** Ya tienes identidad fuerte (andaluza, viajera, podcaster)
- **Market gap:** Humy es educativo (escuelas), tú eres "viajero historiador" (adultos)
- **Monetización lista:** Bundles + comunidad (FASE 5)
- **Sin competencia directa:** Eres el único en este nicho

---

## 📋 CHECKLIST ANTES DE EMPEZAR

- [ ] He leído QUICK-START.md
- [ ] He leído BRIEF completo
- [ ] Entiendo la arquitectura (3 pestañas, viajes + historia + salma)
- [ ] Tengo acceso a GitHub repo (privado)
- [ ] Tengo acceso a Firebase Firestore
- [ ] Tengo acceso a Cloudflare Worker
- [ ] Entiendo: NO quebrar código existente
- [ ] Entiendo: Mobile-first es CRÍTICO
- [ ] ¿Listo? → EMPEZAR AHORA

---

**¡LET'S GO! 🚀**

Paco, tú tienes toda la documentación y especificación.  
Ahora simplemente copia este prompt a Claude Code y que implemente.  
Te saldrá un MVP completito en 4 semanas.
